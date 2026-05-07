import { ALARM_TICK } from '@/lib/defaults';
import { isGitHubUrl, matchesAny } from '@/lib/matcher';
import type { ContentToBackground, PopupToBackground } from '@/lib/messages';
import {
  deleteTabState,
  getAllTabStates,
  getPrefs,
  getTabState,
  patchTabState,
  setTabState,
} from '@/lib/storage';

const MIN = 60_000;
const NOTIFICATION_PREFIX = 'gh-refresh-remind:';

chrome.runtime.onInstalled.addListener(() => {
  void chrome.alarms.create(ALARM_TICK, { periodInMinutes: 0.5, delayInMinutes: 0.5 });
  void seedExistingTabs();
});

chrome.runtime.onStartup.addListener(() => {
  void chrome.alarms.create(ALARM_TICK, { periodInMinutes: 0.5, delayInMinutes: 0.5 });
  void seedExistingTabs();
});

chrome.tabs.onActivated.addListener(({ tabId, windowId }) => {
  void onTabActivated(tabId, windowId);
});

chrome.tabs.onUpdated.addListener((tabId, change, tab) => {
  if (change.status === 'complete' && isGitHubUrl(tab.url)) {
    void onTabReloaded(tabId, tab.url ?? '');
  } else if (change.url && isGitHubUrl(change.url)) {
    void onTabReloaded(tabId, change.url);
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  void deleteTabState(tabId);
  void chrome.notifications.clear(`${NOTIFICATION_PREFIX}${tabId}`);
});

chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    void markAllUnfocused();
  } else {
    void onWindowFocused(windowId);
  }
});

if (chrome.webNavigation?.onHistoryStateUpdated) {
  chrome.webNavigation.onHistoryStateUpdated.addListener(
    (details) => {
      if (details.frameId !== 0) return;
      if (!isGitHubUrl(details.url)) return;
      void onTabReloaded(details.tabId, details.url);
    },
    { url: [{ hostSuffix: 'github.com' }] },
  );
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_TICK) void tick();
});

chrome.runtime.onMessage.addListener(
  (message: ContentToBackground | PopupToBackground, sender, sendResponse) => {
    if (message.type === 'refresh-now') {
      const tabId = sender.tab?.id;
      if (tabId !== undefined) {
        void chrome.tabs.reload(tabId);
        void chrome.notifications.clear(`${NOTIFICATION_PREFIX}${tabId}`);
      }
      sendResponse({ ok: true });
      return false;
    }
    if (message.type === 'dismiss-banner') {
      const tabId = sender.tab?.id;
      if (tabId !== undefined) {
        void patchTabState(tabId, { bannerDismissedAt: Date.now() });
        void chrome.notifications.clear(`${NOTIFICATION_PREFIX}${tabId}`);
      }
      sendResponse({ ok: true });
      return false;
    }
    if (message.type === 'prefs-updated') {
      void tick();
      sendResponse({ ok: true });
      return false;
    }
    return false;
  },
);

chrome.notifications.onClicked.addListener((id) => {
  if (!id.startsWith(NOTIFICATION_PREFIX)) return;
  const tabId = Number(id.slice(NOTIFICATION_PREFIX.length));
  if (Number.isFinite(tabId)) {
    void chrome.tabs.update(tabId, { active: true });
    void chrome.tabs.reload(tabId);
    void chrome.notifications.clear(id);
  }
});

async function seedExistingTabs(): Promise<void> {
  const tabs = await chrome.tabs.query({});
  const now = Date.now();
  for (const tab of tabs) {
    if (tab.id === undefined || !isGitHubUrl(tab.url)) continue;
    const existing = await getTabState(tab.id);
    if (existing) continue;
    await setTabState(tab.id, {
      url: tab.url ?? '',
      lastUnfocusedAt: tab.active ? null : now,
      lastReloadedAt: now,
      lastRemindedAt: null,
      bannerDismissedAt: null,
    });
  }
}

async function onTabActivated(tabId: number, windowId: number): Promise<void> {
  const now = Date.now();

  const tabsInWindow = await chrome.tabs.query({ windowId });
  for (const t of tabsInWindow) {
    if (t.id === undefined || t.id === tabId) continue;
    if (!isGitHubUrl(t.url)) continue;
    const state = await getTabState(t.id);
    if (state && state.lastUnfocusedAt === null) {
      await patchTabState(t.id, { lastUnfocusedAt: now });
    } else if (!state) {
      await setTabState(t.id, {
        url: t.url ?? '',
        lastUnfocusedAt: now,
        lastReloadedAt: now,
        lastRemindedAt: null,
        bannerDismissedAt: null,
      });
    }
  }

  const tab = await chrome.tabs.get(tabId).catch(() => null);
  if (!tab || !isGitHubUrl(tab.url)) return;
  const existing = await getTabState(tabId);
  if (existing) {
    await patchTabState(tabId, { lastUnfocusedAt: null });
  } else {
    await setTabState(tabId, {
      url: tab.url ?? '',
      lastUnfocusedAt: null,
      lastReloadedAt: now,
      lastRemindedAt: null,
      bannerDismissedAt: null,
    });
  }
}

async function onWindowFocused(windowId: number): Promise<void> {
  const [active] = await chrome.tabs.query({ active: true, windowId });
  if (active?.id !== undefined) {
    await onTabActivated(active.id, windowId);
  }
}

async function markAllUnfocused(): Promise<void> {
  const now = Date.now();
  const all = await getAllTabStates();
  for (const [id, state] of all) {
    if (state.lastUnfocusedAt === null) {
      await patchTabState(id, { lastUnfocusedAt: now });
    }
  }
}

async function onTabReloaded(tabId: number, url: string): Promise<void> {
  const now = Date.now();
  const tab = await chrome.tabs.get(tabId).catch(() => null);
  const isActive = !!tab?.active;
  await setTabState(tabId, {
    url,
    lastUnfocusedAt: isActive ? null : now,
    lastReloadedAt: now,
    lastRemindedAt: null,
    bannerDismissedAt: null,
  });
  await chrome.notifications.clear(`${NOTIFICATION_PREFIX}${tabId}`);
}

async function tick(): Promise<void> {
  const prefs = await getPrefs();
  if (!prefs.enabled) return;

  const refreshMs = prefs.refreshThresholdMin * MIN;
  const remindMs = prefs.remindThresholdMin * MIN;
  const now = Date.now();

  const liveTabs = await chrome.tabs.query({});
  const liveIds = new Set<number>();
  for (const t of liveTabs) if (t.id !== undefined) liveIds.add(t.id);

  const states = await getAllTabStates();

  for (const id of states.keys()) {
    if (!liveIds.has(id)) await deleteTabState(id);
  }

  for (const tab of liveTabs) {
    if (tab.id === undefined || !tab.url) continue;
    if (!isGitHubUrl(tab.url)) continue;
    if (!matchesAny(tab.url, prefs.patterns)) continue;

    let state = await getTabState(tab.id);
    if (!state) {
      state = {
        url: tab.url,
        lastUnfocusedAt: tab.active ? null : now,
        lastReloadedAt: now,
        lastRemindedAt: null,
        bannerDismissedAt: null,
      };
      await setTabState(tab.id, state);
      continue;
    }

    if (
      !tab.active &&
      state.lastUnfocusedAt !== null &&
      now - state.lastUnfocusedAt >= refreshMs
    ) {
      try {
        await chrome.tabs.reload(tab.id);
      } catch {
        // Tab may have been discarded; ignore.
      }
      state = {
        ...state,
        url: tab.url,
        lastUnfocusedAt: now,
        lastReloadedAt: now,
        lastRemindedAt: null,
        bannerDismissedAt: null,
      };
      await setTabState(tab.id, state);
      await chrome.notifications.clear(`${NOTIFICATION_PREFIX}${tab.id}`);
      continue;
    }

    if (tab.active && now - state.lastReloadedAt >= remindMs) {
      const lastRemind = state.lastRemindedAt ?? 0;
      const dismissedRecently =
        state.bannerDismissedAt !== null && state.bannerDismissedAt > state.lastReloadedAt;
      if (!dismissedRecently && now - lastRemind >= remindMs) {
        const minutes = Math.round((now - state.lastReloadedAt) / MIN);
        try {
          await chrome.tabs.sendMessage(tab.id, { type: 'show-banner', minutes });
        } catch {
          // Content script not ready yet (e.g., tab loading); skip silently.
        }
        if (prefs.notificationsEnabled) await fireNotification(tab.id, minutes);
        await patchTabState(tab.id, { lastRemindedAt: now });
      }
    }
  }
}

function getNotificationPermission(): Promise<string> {
  return new Promise((resolve) => {
    try {
      chrome.notifications.getPermissionLevel((level) => resolve(level));
    } catch {
      resolve('denied');
    }
  });
}

async function fireNotification(tabId: number, minutes: number): Promise<void> {
  const level = await getNotificationPermission();
  if (level !== 'granted') return;
  await chrome.notifications.create(`${NOTIFICATION_PREFIX}${tabId}`, {
    type: 'basic',
    iconUrl: chrome.runtime.getURL('public/icons/128.png'),
    title: 'GitHub tab is going stale',
    message: `You haven't refreshed this tab in ${minutes} min. Click to refresh now.`,
    priority: 0,
  });
}
