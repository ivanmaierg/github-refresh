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

    // Take screenshot BEFORE clicking anything — baseline for font/style regression
    // NOTE: On macOS this generates a *-darwin.png snapshot locally.
    // CI (Linux) will generate the *-linux.png variant on first run and commit it.
    // See tests/README.md for the snapshot workflow.
    await expect(banner).toHaveScreenshot('reminder-banner.png', {
      maxDiffPixelRatio: 0.01,
    });

    // Verify "Refresh now" button is present
    await expect(page.getByRole('button', { name: /refresh now/i })).toBeVisible();

    // Click Dismiss — banner should disappear
    await page.getByRole('button', { name: 'Dismiss' }).click();
    await expect(banner).not.toBeVisible({ timeout: 2_000 });
  });
});
