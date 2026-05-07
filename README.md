# GitHub Auto-Refresh

> A free, open-source Chrome extension that auto-refreshes idle GitHub tabs and gently nudges you when an active tab is going stale. Stop hammering Cmd+R to check for new commits, PR comments, review requests, or CI runs — let your browser do it.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-success.svg)](https://developer.chrome.com/docs/extensions/develop/migrate)
[![React](https://img.shields.io/badge/React-18-149eca.svg?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8.svg?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-themed-000000.svg)](https://ui.shadcn.com)
[![Built with Vite](https://img.shields.io/badge/Vite-5-646cff.svg?logo=vite&logoColor=white)](https://vitejs.dev)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

A productivity browser extension for developers who live in GitHub. Built with **React 18, TypeScript, Tailwind CSS, and shadcn/ui**, themed to match GitHub's Primer design system in both light and dark mode.

---

## Why this extension?

If you spend your day on GitHub — reviewing PRs, watching CI, monitoring issues, checking the latest commits on a branch — you already know the muscle memory: tab → Cmd+R → tab → Cmd+R. This extension replaces that loop with two simple rules:

1. **Idle tabs refresh themselves.** When a GitHub tab has been in the background for a few minutes, it quietly reloads so it's already fresh when you switch back.
2. **Active tabs get a polite nudge.** If you've been staring at a GitHub page for too long without refreshing, a small in-page banner (and an optional desktop notification) reminds you to refresh.

Both thresholds are configurable. URL filters let you scope behavior to whatever you actually care about — your team's PR list, GitHub Actions runs, a specific repo's issues page, etc.

---

## Features

- **Auto-refresh** GitHub tabs that have been unfocused for X minutes (default: 5)
- **Stale-tab reminder** with an in-page banner (GitHub-styled, dismissible) and a desktop notification (default: 10 minutes)
- **URL pattern filtering** — wildcards supported (e.g. `https://github.com/*/pulls`)
- **Light + dark mode** that follows your system preference and matches GitHub's Primer color tokens
- **Privacy-first** — no telemetry, no remote calls, no tracking. All settings stored in `chrome.storage.sync` (roams across your devices)
- **Manifest V3** — modern Chrome extension architecture with a service-worker background
- **Open source, MIT licensed** — read the code, fork it, ship your own version

---

## Install

### From source (today)

1. Clone this repository.
2. Build the extension:
   ```bash
   pnpm install
   pnpm icons       # generate icon PNGs (one-time)
   pnpm build
   ```
3. Open `chrome://extensions` in Chrome / Brave / Arc / Edge.
4. Enable **Developer mode** (top right).
5. Click **Load unpacked** and select the `dist/` folder.
6. Pin the extension to your toolbar — done.

### From the Chrome Web Store

Coming soon. ⭐ Star the repo to be notified.

---

## Usage

Click the extension icon in your toolbar to open the popup.

| Setting | What it does |
|---|---|
| **Enabled** | Master switch. Turn the whole extension off without uninstalling. |
| **Auto-refresh after** | Reload a GitHub tab once it has been unfocused for this many minutes. |
| **Remind me after** | If the **active** GitHub tab hasn't been refreshed in this many minutes, show a banner and (optionally) a desktop notification. |
| **Desktop notifications** | Toggle OS-level notifications. Requires Chrome to have notification permission at the system level (macOS: System Settings → Notifications → Google Chrome). |
| **URL patterns** | Whitelist of glob-style URL patterns. The extension only acts on tabs whose URL matches at least one pattern. Default: `https://github.com/*` (everything on github.com). |

All changes save automatically.

### Pattern examples

| Pattern | Matches |
|---|---|
| `https://github.com/*` | every page on github.com (default) |
| `https://github.com/*/pulls` | only PR list pages |
| `https://github.com/*/issues` | only issue list pages |
| `https://github.com/*/actions/runs/*` | individual workflow run pages |
| `https://github.com/myorg/*` | every page in `myorg`'s repos |

`*` matches any characters (including `/`). `?` matches a single character.

---

## How it works

### Architecture

```
┌─────────────────────┐  alarms (30s tick)   ┌──────────────────┐
│ Service Worker (BG) │──────────────────────▶│ chrome.tabs API  │
│  - tab tracking      │ chrome.tabs.reload    │ chrome.alarms    │
│  - alarm tick loop   │ chrome.notifications  │ chrome.storage   │
└─────────┬───────────┘                       └──────────────────┘
          │ chrome.runtime.sendMessage
          ▼
┌─────────────────────┐
│ Content Script      │  Shadow DOM root injected at top of GitHub page,
│  - Reminder banner  │  isolated Tailwind styles, React-rendered banner
└─────────────────────┘

┌─────────────────────┐
│ Popup (React)       │  GitHub-themed UI for prefs, persisted to
│  - settings UI      │  chrome.storage.sync (roams across devices)
└─────────────────────┘
```

### Background tick loop

Every 30 seconds (`chrome.alarms`, since service workers can't keep `setInterval` alive), the background:

1. Reconciles per-tab state in `chrome.storage.session` against `chrome.tabs.query({})`.
2. For each GitHub tab that matches a user URL pattern:
   - If it has been **unfocused** for ≥ refresh threshold → `chrome.tabs.reload(tabId)`.
   - If it is **active** and hasn't been refreshed in ≥ remind threshold → send a message to the content script to show the banner, plus a desktop notification.

State is keyed by `tabId` and survives service-worker termination because it lives in `chrome.storage.session`.

### Why a service worker (Manifest V3)?

Manifest V2 background pages were deprecated by Google. MV3 service workers can be terminated at any time, which is why this extension:

- Registers all listeners synchronously at the top level of the SW script.
- Uses `chrome.alarms` (not `setInterval`) for periodic work.
- Treats `chrome.storage.session` as the only source of truth for tab state.
- Compares timestamps against `Date.now()` rather than relying on alarm cadence.

---

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Build | [Vite](https://vitejs.dev) + [@crxjs/vite-plugin](https://crxjs.dev/vite-plugin) | Fast HMR, native MV3 support, manifest from TS |
| UI | [React 18](https://react.dev) + [TypeScript](https://www.typescriptlang.org) (strict) | Standard, typed, ergonomic |
| Styles | [Tailwind CSS 3](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) | Themed to match GitHub Primer tokens |
| State | `chrome.storage.sync` (prefs) + `chrome.storage.session` (tab state) | Roaming prefs, transient state survives SW termination |
| Lint | ESLint 9 (flat config) + Prettier | Standard |
| License | MIT | Permissive, clear |

---

## Development

```bash
# Install dependencies
pnpm install

# Generate icons (one-time, requires sharp)
pnpm icons

# Dev mode (HMR for popup; MV3 SW reloads on save)
pnpm dev

# Type check
pnpm typecheck

# Lint
pnpm lint

# Production build
pnpm build
```

After `pnpm dev` or `pnpm build`, point Chrome's **Load unpacked** at `dist/`.

### File layout

```
src/
├── background/service-worker.ts   # tab tracking, alarm tick, refresh + remind logic
├── content/
│   ├── banner.tsx                 # content-script entry, mounts shadow DOM
│   ├── ReminderBanner.tsx         # React banner component
│   └── banner.css                 # Tailwind, imported as ?inline into shadow root
├── popup/
│   ├── App.tsx                    # popup UI
│   ├── main.tsx                   # popup entry
│   └── components/                # PatternList, ThresholdField, NotificationStatus
├── components/ui/                 # shadcn primitives (Button, Input, Switch, Card, …)
├── lib/
│   ├── storage.ts                 # typed chrome.storage helpers
│   ├── matcher.ts                 # URL glob matcher
│   ├── messages.ts                # typed runtime message envelope
│   ├── defaults.ts                # default prefs + storage keys
│   └── utils.ts                   # cn() helper
└── styles/globals.css             # Tailwind base + Primer-mapped CSS variables
```

---

## Privacy

- **No telemetry, no analytics, no remote calls** of any kind.
- Settings live in `chrome.storage.sync`, which Chrome syncs across your signed-in browsers.
- Per-tab state lives in `chrome.storage.session`, which is wiped on every browser restart.
- The extension only requests permission for `github.com` and its subdomains.
- All source code is here — read it, audit it, fork it.

---

## FAQ

**Does this work on `github.io`, GitHub Enterprise, or GitHub Codespaces?**
Out of the box, only `github.com` and its subdomains. Enterprise users can fork and update `host_permissions` in `manifest.config.ts`.

**Will it refresh while I'm reading?**
No — the auto-refresh only fires when the tab has been **unfocused** (you switched away from it). The reminder is a banner, not a forced reload, so reading is never interrupted.

**Why not just hit Cmd+R?**
Because for tabs you don't have in front of you (a PR review you're waiting on, a CI run, an issue list), you forget. This extension is for those.

**Does it work on Brave / Arc / Edge?**
Yes — any Chromium-based browser that supports Manifest V3.

**Why does the desktop notification not appear on macOS?**
macOS requires Chrome itself to have OS-level notification permission. Open *System Settings → Notifications → Google Chrome* and enable alerts. The popup will warn you if Chrome is currently denied.

**Will the auto-refresh blow away my unsaved comment?**
GitHub preserves draft comments in localStorage in most places, but the extension cannot guarantee it. As a precaution, the active tab is **never** auto-refreshed — only the reminder fires. So as long as the tab you're typing in is the active tab, you're safe.

**Can I disable it on certain repos?**
Yes — only add patterns for the repos you want it to act on. Anything outside those patterns is ignored.

---

## Contributing

PRs welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, coding standards, and the PR checklist.

If you're filing an issue, please include:

- Browser + version
- Extension version (visible in popup footer)
- Steps to reproduce
- What you expected vs. what happened

---

## License

[MIT](LICENSE) © ivanmaierg

If this saved you from one too many `Cmd+R`, leave a ⭐ on the repo.
