# Chrome Web Store Submission Walkthrough

Single doc with every field and paste-ready value for the CWS developer dashboard. Keep this open in another tab while you fill out the form.

**Dashboard:** https://chrome.google.com/webstore/devconsole/

**Item ID** (after first upload): `klapiapigbnhagdlknkjokhgnngnhaod`

---

## Pre-flight checklist

| Asset | Status | Path / URL |
|---|---|---|
| Built zip | ✅ ready | `releases/github-refresh-v0.1.0.zip` (85KB) |
| 128×128 icon | ✅ ready | `public/icons/128.png` |
| Privacy policy URL | ✅ live | `https://ivanmaierg.github.io/github-refresh/PRIVACY.html` |
| Listing copy | ✅ ready | this doc |
| Permission justifications | ✅ ready | this doc |
| Screenshot ≥ 1280×800 | ⚠ TODO | see [§ Screenshots](#screenshots) |

If you need to rebuild the zip:

```bash
pnpm install
pnpm icons
pnpm build
pnpm zip
```

---

## Step 1 — Upload the zip

1. Open the [dashboard](https://chrome.google.com/webstore/devconsole/).
2. Click **+ New item** (top right).
3. Drag `releases/github-refresh-v0.1.0.zip` from Finder onto the upload zone, or click and select it.
4. Wait for the parser to validate. The draft item appears with ID `klapiapigbnhagdlknkjokhgnngnhaod`.

---

## Step 2 — Store listing tab

### Title
> Auto-filled from the manifest. Should read: **GitHub Auto-Refresh**

### Summary
> Auto-filled from the manifest. Should read: *Auto-refresh idle GitHub tabs and remind you when an active tab is going stale. Never miss new commits, PR comments, or CI status.*

### Description (paste the block below)

```
Stop hammering Cmd+R to check for new commits, PR comments, review requests, or CI runs. GitHub Auto-Refresh keeps your GitHub tabs fresh in two ways:

🔄 IDLE TABS REFRESH THEMSELVES
When a GitHub tab has been in the background for a few minutes (configurable, default 5), it quietly reloads. By the time you switch back, it's already showing the latest state. Active tabs are never auto-refreshed, so your reading and unsaved drafts are safe.

⏰ ACTIVE TABS GET A POLITE NUDGE
If you've been on the same GitHub page for a while without refreshing (configurable, default 10 minutes), a small banner appears at the top of the page with a "Refresh now" button. An optional desktop notification fires too, so you get reminded even from another window.

🎯 SCOPED TO WHAT YOU CARE ABOUT
URL pattern filters let you tell the extension exactly which pages to act on. Examples:
• https://github.com/* — everything on GitHub (default)
• https://github.com/*/pulls — only PR list pages
• https://github.com/*/actions/runs/* — only individual workflow runs
• https://github.com/myorg/* — only your organization's repos

🎨 MATCHES GITHUB'S DESIGN
The popup and banner use GitHub's Primer color tokens and follow your system's light/dark mode preference. It looks like part of GitHub itself.

🔒 PRIVACY-FIRST
• No telemetry. No analytics. No tracking. No remote servers.
• The extension makes zero network requests of its own.
• It only has permission to read tabs on github.com — nothing else.
• Your settings sync across your Chrome browsers via Chrome Sync. Per-tab state is wiped on every browser restart.

🛠 BUILT WITH MODERN TOOLS
React 18, TypeScript (strict), Tailwind CSS, shadcn/ui, Vite, Manifest V3. Open source under the MIT license — read every line at github.com/ivanmaierg/github-refresh.

—

WHO IS THIS FOR?
• Code reviewers who keep PR list tabs open across screens
• Anyone watching a slow CI pipeline
• Engineers who tab back to "did the comment land?" five times a day
• Issue triagers, release managers, and on-call responders

—

FAQ

Will it refresh while I'm reading?
No. The active tab is never auto-refreshed. The reminder is just a banner — it never reloads on you.

Does it work on GitHub Enterprise / GitHub Pages / Codespaces?
Out of the box, only github.com and its subdomains. Enterprise users can fork and update the host_permissions in the manifest.

Why do I not see desktop notifications on macOS?
macOS requires Chrome itself to have OS-level notification permission. Open System Settings → Notifications → Google Chrome and enable alerts. The popup will warn you when this is the issue.

Will the auto-refresh nuke my unsaved comment?
GitHub preserves draft comments in localStorage. The extension also never auto-refreshes the active tab — only background tabs. So as long as you're typing into the tab you're looking at, you're safe.

—

OPEN SOURCE
https://github.com/ivanmaierg/github-refresh

REPORT A BUG
https://github.com/ivanmaierg/github-refresh/issues

LICENSE
MIT
```

### Category

```
Developer Tools
```

### Language

```
English
```

### Store icon (128×128)

Drag this file from Finder into the **Drop icon here** box:

```
/Users/ivanmaierg/Desktop/misc/github-refresh/public/icons/128.png
```

### Screenshots

**Required: 1+ at exactly 1280×800 or 640×400, JPEG or 24-bit PNG (no alpha).** This is the only blocker for submission.

Easiest manual recipe (5 min, macOS):

1. Open the toolbar icon → popup opens.
2. Press `Cmd+Shift+4`, then `Space`, then click the popup → screenshot saved to Desktop.
3. Open the screenshot in **Preview**.
4. **Tools → Adjust Size**: uncheck "Resample image" — set canvas to 1280×800. Or simpler: **Tools → Show Inspector → Crop** to center on a 640×400 frame.
5. Repeat for a second shot showing the in-page banner: open a GitHub PR, set "Remind me after" to 1 min in the popup, wait, capture the banner.

If Preview's resize is annoying, use [squoosh.app](https://squoosh.app) — drag the screenshot in, set resize to 1280×800, export PNG (uncheck alpha).

Suggested screenshot caption text (CWS lets you label each):

1. *"GitHub-themed popup — configure refresh and reminder thresholds."*
2. *"Stale-tab banner appears on GitHub when a tab hasn't refreshed in too long."*

### Promo tiles (optional)

Skip both **Small promo tile** (440×280) and **Marquee promo tile** (1400×560) for v1.

### Promo video (optional)

Skip.

### Official URL → Homepage URL

```
https://github.com/ivanmaierg/github-refresh
```

### Support URL

```
https://github.com/ivanmaierg/github-refresh/issues
```

### Mature content

Select **No / Not mature**.

---

## Step 3 — Privacy practices tab

### Single purpose statement

```
Automatically refresh idle GitHub tabs after a configurable period of inactivity, and notify users when an active GitHub tab has not been refreshed for a configurable amount of time.
```

### Permission justifications

#### `tabs`

```
Required to (1) read the URL of each tab so we can determine whether it is a GitHub page that matches a user-configured URL pattern, (2) detect which tab is currently active versus inactive (the core trigger for auto-refresh), and (3) call chrome.tabs.reload() on tabs that have exceeded the user's idle threshold. The extension does not read, modify, or transmit page content.
```

#### `storage`

```
Required to persist user preferences (refresh threshold, reminder threshold, URL patterns, on/off toggles) in chrome.storage.sync so they roam across the user's signed-in Chrome browsers, and to track per-tab timestamps (last focused, last reloaded) in chrome.storage.session so refresh and reminder timing survives service-worker termination. No data leaves the user's browser.
```

#### `alarms`

```
Required because Manifest V3 service workers cannot use setInterval or setTimeout reliably (the worker is terminated between events). chrome.alarms is used to schedule a periodic 30-second check that evaluates each tracked tab against its idle and reminder thresholds.
```

#### `notifications`

```
Required to show an optional desktop notification when an active GitHub tab has not been refreshed within the user's reminder threshold. Notifications can be disabled in the extension's popup. The notification body contains only the elapsed time and a generic message — no page content or personal data.
```

#### `webNavigation`

```
Required to detect GitHub's in-page (Turbo Frame) navigation. GitHub uses client-side routing for many transitions (e.g. clicking between PRs in a list does not fire a full page reload), so chrome.webNavigation.onHistoryStateUpdated is needed to correctly reset the "last refreshed" timestamp when the user navigates within GitHub. Without this, the reminder timer would fire incorrectly on long-lived tabs.
```

#### Host permission: `https://github.com/*`, `https://*.github.com/*`

```
The extension's sole function is to manage tabs on GitHub. Host access is limited to github.com and its subdomains; the extension has no permission to read, modify, or interact with any other website. URL-pattern filters configured by the user further narrow which github.com pages the extension acts on.
```

### Privacy policy URL

```
https://ivanmaierg.github.io/github-refresh/PRIVACY.html
```

### Data usage form

| Question | Answer |
|---|---|
| Does this extension collect or use **personally identifiable information**? | **No** |
| Health information | **No** |
| Financial and payment information | **No** |
| Authentication information (passwords, tokens) | **No** |
| Personal communications (emails, texts) | **No** |
| Location data | **No** |
| Web history | **No** |
| User activity (clicks, keypresses, scroll) | **No** |
| Website content (text, images, audio, video) | **No** |

### Certifications (check all three)

- ☑ I do not sell or transfer user data to third parties, outside of the approved use cases.
- ☑ I do not use or transfer user data for purposes that are unrelated to my item's single purpose.
- ☑ I do not use or transfer user data to determine creditworthiness or for lending purposes.

All true — the extension transmits no data.

---

## Step 4 — Distribution tab

| Field | Value |
|---|---|
| Visibility | **Public** |
| Distribution method | Public listing |
| Regions | **All regions** |
| Pricing | **Free** |

---

## Step 5 — Submit

1. Make sure every tab on the left sidebar shows a green check (✅).
2. Click **Submit for review** (top right).
3. The status changes to **Pending review**.
4. Google reviews typically take **1–3 business days**. You'll get an email when it's approved or rejected.

If rejected, the email tells you which field needs fixing — adjust, click **Submit for review** again. No additional fee.

---

## After approval

- Public CWS URL: `https://chromewebstore.google.com/detail/<item-id>` — replace `<item-id>` with `klapiapigbnhagdlknkjokhgnngnhaod`.
- Update the README "Install" section to point at this URL instead of "Coming soon."
- Optionally announce on Twitter/Bluesky/Hacker News.

For future versions:

```bash
# Bump version in package.json (e.g. 0.1.0 → 0.2.0)
pnpm build && pnpm zip
# Upload releases/github-refresh-v0.2.0.zip to the same item in CWS dashboard
# Submit for review
```

Or — once the release workflow is on `main` — just `git tag v0.2.0 && git push origin v0.2.0` and the GitHub Action publishes a Release with the zip attached. Then download from the Release and upload to CWS.
