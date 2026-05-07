# Chrome Web Store submission package

Everything you need to fill out the CWS developer dashboard for this extension.

## Files in this directory

- [`listing.md`](listing.md) — name, short description, detailed description, category. Copy/paste into the **Store listing** tab.
- [`permissions.md`](permissions.md) — single-purpose statement, justifications for each permission, and the data-usage disclosure form answers. Copy/paste into the **Privacy practices** tab.

## Files outside this directory you'll also reference

- [`../PRIVACY.md`](../PRIVACY.md) — the privacy policy. Once GitHub Pages is enabled, the public URL to paste into "Privacy policy" is **`https://ivanmaierg.github.io/github-refresh/PRIVACY.html`**.
- `../public/icons/128.png` — the 128×128 store icon (already in the build).
- `../releases/github-refresh-vX.Y.Z.zip` — the upload artifact. Generate with `pnpm build && pnpm zip`.

## Things you still have to provide

- **Screenshots** (1+ required, max 5, 1280×800 or 640×400 PNG/JPG). Suggested shots:
  1. Popup open with all four cards visible (Enabled, Timing, Notifications, URL patterns)
  2. The reminder banner on a real GitHub PR page
  3. The dark-mode popup
  4. The dark-mode banner

  Capture by loading the unpacked extension, opening Chrome's DevTools device toolbar to set viewport to 1280×800, and using the OS screenshot shortcut. Crop to exact dimensions before upload.

- **Promo tile** (optional, 440×280). Skip for v1.

- **Distribution** — choose Public, set regions to "All regions", language English. Pricing: Free.

## Submission flow

1. Build and zip:
   ```bash
   pnpm build
   pnpm zip
   # produces releases/github-refresh-v0.1.0.zip
   ```
2. In the [CWS dashboard](https://chrome.google.com/webstore/devconsole), click **+ New item** and upload the zip.
3. Fill out **Store listing** using `listing.md` and your screenshots.
4. Fill out **Privacy practices** using `permissions.md`. Paste the GitHub Pages privacy URL.
5. **Distribution** → Public, all regions, English.
6. Click **Submit for review**.

Review usually takes 1–3 business days. If rejected, the email will tell you which field needs adjustment — fix it and resubmit.
