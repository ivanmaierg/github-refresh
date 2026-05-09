import { test, expect } from './fixtures/extension';

test('popup renders heading and Enabled toggle', async ({ openPopup }) => {
  const page = await openPopup();
  await expect(page.getByRole('heading', { name: 'GitHub Auto-Refresh' })).toBeVisible({
    timeout: 5_000,
  });
  await expect(page.getByRole('switch', { name: 'Enable extension' })).toBeVisible();
});

test('toggling Enabled persists to storage and shows Saved', async ({
  openPopup,
  serviceWorker,
}) => {
  const page = await openPopup();
  // Wait for popup to finish loading
  await expect(page.getByRole('switch', { name: 'Enable extension' })).toBeVisible();

  // Read current enabled state from storage
  const before = await serviceWorker.evaluate(async () => {
    const result = await chrome.storage.sync.get('prefs');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (result['prefs'] as any)?.enabled ?? true;
  });

  // Click the toggle
  await page.getByRole('switch', { name: 'Enable extension' }).click();

  // Verify Saved feedback appears
  await expect(page.getByText('Saved')).toBeVisible({ timeout: 2_000 });

  // Verify storage was updated
  const after = await serviceWorker.evaluate(async () => {
    const result = await chrome.storage.sync.get('prefs');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (result['prefs'] as any)?.enabled ?? true;
  });
  expect(after).toBe(!before);
});
