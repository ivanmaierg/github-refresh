import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test, expect } from './fixtures/extension';

const __dirname = dirname(fileURLToPath(import.meta.url));

const STUB = readFileSync(resolve(__dirname, 'fixtures/github-stub.html'), 'utf8');

test.describe('banner injection via mocked github.com', () => {
  test('banner shows on show-banner message and dismisses on Dismiss click', async ({
    page,
    serviceWorker,
  }) => {
    // Route all github.com requests to our stub HTML
    await page.route('https://github.com/**', (route) =>
      route.fulfill({ status: 200, contentType: 'text/html', body: STUB }),
    );

    await page.goto('https://github.com/ivanmaierg/github-refresh');

    // Wait for the banner host to attach (content script runs at document_idle)
    await page.locator('#gh-refresh-banner-host').waitFor({ state: 'attached', timeout: 5_000 });

    // Find the tab ID so the SW can send a message to it
    const tabId = await serviceWorker.evaluate(async () => {
      const tabs = await chrome.tabs.query({ active: true });
      return tabs[0]?.id ?? null;
    });
    expect(tabId).not.toBeNull();

    // Trigger banner via SW sending show-banner to the tab
    await serviceWorker.evaluate(
      async ({ tabId, minutes }: { tabId: number; minutes: number }) => {
        await chrome.tabs.sendMessage(tabId, { type: 'show-banner', minutes });
      },
      { tabId: tabId as number, minutes: 12 },
    );

    // Banner [role="status"] should now be visible (Playwright pierces open shadow roots)
    const banner = page.locator('[role="status"]');
    await expect(banner).toBeVisible({ timeout: 3_000 });

    // Visual regression guard for the banner font/style. The Linux baseline at
    // tests/e2e/banner.spec.ts-snapshots/reminder-banner-chromium-linux.png is the
    // committed source of truth; macOS *-darwin.png variants are local-only and
    // gitignored. To regenerate the Linux baseline, see tests/README.md (Docker recipe).
    await expect(banner).toHaveScreenshot('reminder-banner.png', {
      maxDiffPixelRatio: 0.01,
    });

    // Verify "Refresh now" button is present
    await expect(page.getByRole('button', { name: /refresh now/i })).toBeVisible();

    // Click Dismiss — banner should disappear
    await page.getByRole('button', { name: 'Dismiss' }).click();
    await expect(banner).not.toBeVisible({ timeout: 2_000 });
  });

  test('Refresh now button triggers a real tab reload via SW handler', async ({
    page,
    serviceWorker,
  }) => {
    await page.route('https://github.com/**', (route) =>
      route.fulfill({ status: 200, contentType: 'text/html', body: STUB }),
    );

    await page.goto('https://github.com/ivanmaierg/github-refresh');
    await page.locator('#gh-refresh-banner-host').waitFor({ state: 'attached', timeout: 5_000 });

    // Stamp a sentinel on `window` so we can prove the page actually reloaded
    // (a fresh document means our sentinel is gone).
    await page.evaluate(() => {
      (window as unknown as { __ghRefreshTestSentinel?: boolean }).__ghRefreshTestSentinel = true;
    });

    const tabId = await serviceWorker.evaluate(async () => {
      const tabs = await chrome.tabs.query({ active: true });
      return tabs[0]?.id ?? null;
    });
    expect(tabId).not.toBeNull();

    await serviceWorker.evaluate(
      async ({ tabId, minutes }: { tabId: number; minutes: number }) => {
        await chrome.tabs.sendMessage(tabId, { type: 'show-banner', minutes });
      },
      { tabId: tabId as number, minutes: 7 },
    );

    const refreshButton = page.getByRole('button', { name: /refresh now/i });
    await expect(refreshButton).toBeVisible({ timeout: 3_000 });

    // Click the banner's Refresh — content script sends `refresh-now` with sender.tab populated,
    // SW calls chrome.tabs.reload(senderTabId), and the page navigates fresh.
    const reloadComplete = page.waitForEvent('load', { timeout: 5_000 });
    await refreshButton.click();
    await reloadComplete;

    // Sentinel is gone → this is a fresh document, not the same one we stamped.
    const sentinelSurvivedReload = await page.evaluate(() =>
      Boolean((window as unknown as { __ghRefreshTestSentinel?: boolean }).__ghRefreshTestSentinel),
    );
    expect(sentinelSurvivedReload).toBe(false);

    // Content script should re-attach on the reloaded document.
    await page.locator('#gh-refresh-banner-host').waitFor({ state: 'attached', timeout: 5_000 });
  });
});
