---
title: Privacy Policy — GitHub Auto-Refresh
---

# Privacy Policy — GitHub Auto-Refresh

_Last updated: 2026-05-06_

## Plain-English summary

**We don't collect, transmit, sell, or share any of your data. Ever.**

This extension runs entirely on your computer. It does not send anything anywhere. No analytics, no telemetry, no remote servers, no third-party SDKs.

## What the extension does store, and where

| Data | Where it lives | Why |
|---|---|---|
| Your settings (refresh threshold, reminder threshold, URL patterns, on/off toggles) | `chrome.storage.sync` — Chrome syncs this across your signed-in browsers. Stored on Google's infrastructure as part of Chrome Sync. | So your preferences persist across browsers and reinstalls. |
| Per-tab timing state (last-focused / last-reloaded timestamps) | `chrome.storage.session` — wiped every time the browser restarts. Local only. | So we know when to refresh or remind. |

The extension never reads, transmits, or processes the **content** of any web page — only URLs (to match against your patterns) and timestamps.

## Permissions, and why we ask for each

| Permission | Why |
|---|---|
| `tabs` | Read tab URLs (to match against your patterns) and call `tabs.reload()` to refresh idle tabs. |
| `storage` | Save your settings (`storage.sync`) and per-tab timing state (`storage.session`). |
| `alarms` | Schedule the periodic check (every 30 seconds) that decides whether to refresh or remind. Required because Manifest V3 service workers cannot use `setInterval`. |
| `notifications` | Show optional desktop reminders when an active GitHub tab has gone stale. |
| `webNavigation` | Detect GitHub's in-page (Turbo) navigation so the reminder timer resets correctly when you click around without a full page reload. |
| Host permission: `https://github.com/*`, `https://*.github.com/*` | Limits the extension to GitHub. We have no access to any other website. |

## Third parties

There are none. The extension makes no network requests of its own.

## Data sold to third parties

None. We don't have anything to sell.

## Children

The extension is not directed at children under 13 and we do not knowingly collect data from anyone (because we collect no data).

## Source code

The extension is open source under the MIT license. You can read every line of code at [github.com/ivanmaierg/github-refresh](https://github.com/ivanmaierg/github-refresh) and verify these claims yourself.

## Changes

If we ever add data collection, this page will be updated **before** the change ships, and the changelog in the README will note it. Existing users would be opted out by default.

## Contact

Open an issue at [github.com/ivanmaierg/github-refresh/issues](https://github.com/ivanmaierg/github-refresh/issues).
