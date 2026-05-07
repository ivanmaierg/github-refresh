# Chrome Web Store listing copy

Paste these into the corresponding fields in the CWS developer dashboard.

---

## Name (max 75 chars)

```
GitHub Auto-Refresh
```

## Short description (max 132 chars — shown in search)

```
Auto-refresh idle GitHub tabs and get reminders when an active tab goes stale. Never miss new commits, PR comments, or CI status.
```

(131 chars — under the limit.)

## Single-purpose statement

```
Automatically refresh idle GitHub tabs and remind users when an active GitHub tab has gone stale.
```

## Category

`Productivity` → secondary tag `Developer tools` if available.

## Language

English.

---

## Detailed description (paste as-is into the long description field)

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
