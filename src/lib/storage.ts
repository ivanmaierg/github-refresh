import { DEFAULT_PREFS, PREFS_KEY, TAB_STATE_KEY_PREFIX, type Prefs } from './defaults';

export interface TabState {
  url: string;
  lastUnfocusedAt: number | null;
  lastReloadedAt: number;
  lastRemindedAt: number | null;
  bannerDismissedAt: number | null;
}

export async function getPrefs(): Promise<Prefs> {
  const raw = await chrome.storage.sync.get(PREFS_KEY);
  const stored = raw[PREFS_KEY] as Partial<Prefs> | undefined;
  return { ...DEFAULT_PREFS, ...(stored ?? {}) };
}

export async function setPrefs(prefs: Prefs): Promise<void> {
  await chrome.storage.sync.set({ [PREFS_KEY]: prefs });
}

export function onPrefsChanged(cb: (prefs: Prefs) => void): () => void {
  const listener = (
    changes: { [k: string]: chrome.storage.StorageChange },
    area: chrome.storage.AreaName,
  ) => {
    if (area === 'sync' && changes[PREFS_KEY]) {
      const next = changes[PREFS_KEY].newValue as Partial<Prefs> | undefined;
      cb({ ...DEFAULT_PREFS, ...(next ?? {}) });
    }
  };
  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
}

const tabKey = (id: number) => `${TAB_STATE_KEY_PREFIX}${id}`;

export async function getTabState(id: number): Promise<TabState | null> {
  const raw = await chrome.storage.session.get(tabKey(id));
  return (raw[tabKey(id)] as TabState | undefined) ?? null;
}

export async function setTabState(id: number, state: TabState): Promise<void> {
  await chrome.storage.session.set({ [tabKey(id)]: state });
}

export async function patchTabState(id: number, patch: Partial<TabState>): Promise<TabState | null> {
  const current = await getTabState(id);
  if (!current) return null;
  const next: TabState = { ...current, ...patch };
  await setTabState(id, next);
  return next;
}

export async function deleteTabState(id: number): Promise<void> {
  await chrome.storage.session.remove(tabKey(id));
}

export async function getAllTabStates(): Promise<Map<number, TabState>> {
  const all = await chrome.storage.session.get(null);
  const out = new Map<number, TabState>();
  for (const [k, v] of Object.entries(all)) {
    if (!k.startsWith(TAB_STATE_KEY_PREFIX)) continue;
    const id = Number(k.slice(TAB_STATE_KEY_PREFIX.length));
    if (Number.isFinite(id)) out.set(id, v as TabState);
  }
  return out;
}
