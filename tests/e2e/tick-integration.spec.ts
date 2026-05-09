import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test, expect } from './fixtures/extension';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STUB = readFileSync(resolve(__dirname, 'fixtures/github-stub.html'), 'utf8');

// End-to-end coverage for the alarm-driven walk-all-tabs flow. Calls the SW's tick()
// directly via the __test_tick global hook so the assertion isn't gated on the
// chrome.alarms 1-minute minimum period.
test('tick() reloads idle inactive tab and shows banner on stale active tab', async ({
  context,
  page,
  serviceWorker,
}) => {
  await context.route('https://github.com/**', (route) =>
    route.fulfill({ status: 200, contentType: 'text/html', body: STUB }),
  );

  // Tab 1 — opens first; will be inactive (page2 takes focus) and idle for ~2 min.
  await page.goto('https://github.com/idle-tab');
  await page.locator('#gh-refresh-banner-host').waitFor({ state: 'attached', timeout: 5_000 });
  await page.evaluate(() => {
    (window as unknown as { __sentinel?: boolean }).__sentinel = true;
  });

  // Tab 2 — opens second, becomes the active tab; stale (last reload ~2 min ago).
  const page2 = await context.newPage();
  await page2.goto('https://github.com/active-tab');
  await page2.locator('#gh-refresh-banner-host').waitFor({ state: 'attached', timeout: 5_000 });
  await page2.evaluate(() => {
    (window as unknown as { __sentinel?: boolean }).__sentinel = true;
  });

  // Seed prefs (short thresholds) and per-tab state directly into chrome.storage from the SW.
  // Bypasses the natural seeding path so we control exactly which tab counts as idle vs stale.
  await serviceWorker.evaluate(async () => {
    await chrome.storage.sync.set({
      prefs: {
        enabled: true,
        refreshThresholdMin: 1,
        remindThresholdMin: 1,
        notificationsEnabled: false,
        patterns: ['https://github.com/*'],
      },
    });

    const tabs = await chrome.tabs.query({});
    const idleTab = tabs.find((t) => t.url?.includes('/idle-tab'));
    const activeTab = tabs.find((t) => t.url?.includes('/active-tab'));
    if (!idleTab?.id || !activeTab?.id) {
      throw new Error(`expected both tabs, got idle=${idleTab?.id} active=${activeTab?.id}`);
    }

    const TWO_MIN_AGO = Date.now() - 2 * 60_000;
    await chrome.storage.session.set({
      [`tab:${idleTab.id}`]: {
        url: idleTab.url,
        lastUnfocusedAt: TWO_MIN_AGO,
        lastReloadedAt: TWO_MIN_AGO,
        lastRemindedAt: null,
        bannerDismissedAt: null,
      },
      [`tab:${activeTab.id}`]: {
        url: activeTab.url,
        lastUnfocusedAt: null,
        lastReloadedAt: TWO_MIN_AGO,
        lastRemindedAt: null,
        bannerDismissedAt: null,
      },
    });
  });

  // Arm the reload waiter BEFORE triggering tick — page1 is the one that should reload.
  const idleReload = page.waitForEvent('load', { timeout: 10_000 });

  // Trigger tick deterministically via the test hook.
  await serviceWorker.evaluate(async () => {
    const fn = (globalThis as unknown as { __test_tick?: () => Promise<void> }).__test_tick;
    if (!fn) throw new Error('__test_tick is not exposed by the service worker');
    await fn();
  });

  await idleReload;

  // Idle tab really reloaded — sentinel from the pre-reload document is gone.
  const idleSentinel = await page.evaluate(
    () => (window as unknown as { __sentinel?: boolean }).__sentinel ?? false,
  );
  expect(idleSentinel).toBe(false);

  // Active tab got the show-banner message and rendered the reminder.
  await expect(page2.getByRole('status')).toBeVisible({ timeout: 5_000 });

  // Active tab was NOT reloaded — its sentinel still survives.
  const activeSentinel = await page2.evaluate(
    () => (window as unknown as { __sentinel?: boolean }).__sentinel ?? false,
  );
  expect(activeSentinel).toBe(true);
});
