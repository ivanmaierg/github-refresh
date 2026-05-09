import { test, expect } from './fixtures/extension';

test('alarm gh-refresh-tick exists after SW initialises', async ({ serviceWorker }) => {
  await expect
    .poll(
      async () =>
        serviceWorker.evaluate(async () => {
          const a = await chrome.alarms.get('gh-refresh-tick');
          return a?.name ?? null;
        }),
      { timeout: 5_000, message: 'gh-refresh-tick alarm should be registered after SW init' },
    )
    .toBe('gh-refresh-tick');
});

test('prefs-updated message returns { ok: true }', async ({ context, extensionId }) => {
  const page = await context.newPage();
  // Navigate to a non-extension page so we can send runtime messages
  await page.goto(`chrome-extension://${extensionId}/src/popup/index.html`);

  const response = await page.evaluate(async () => {
    return chrome.runtime.sendMessage({ type: 'prefs-updated' });
  });

  expect(response).toEqual({ ok: true });
  await page.close();
});

test('refresh-now from a sender without sender.tab is a no-op but still acks', async ({
  openPopup,
}) => {
  // Sender without `sender.tab.id` (the popup) → handler must NOT reload anything
  // but must still respond { ok: true } so the caller never hangs.
  // The full reload path (banner click → SW reloads tab) lives in banner.spec.ts.
  const popupPage = await openPopup();
  await expect(popupPage.getByRole('heading', { name: 'GitHub Auto-Refresh' })).toBeVisible();

  const response = await popupPage.evaluate(async () => {
    return chrome.runtime.sendMessage({ type: 'refresh-now' });
  });

  expect(response).toEqual({ ok: true });
  await popupPage.close();
});
