# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Add Playwright E2E and Vitest unit test harnesses.

### Fixed
- Reminder banner now renders in GitHub's system font stack. Previously the inline `host.style.all = 'initial'` override took precedence over the `:host { font-family }` rule in `banner.css`, so the host element fell back to the browser's default serif and shadow-tree descendants inherited it.

## [0.1.0] - 2026-05-06

### Added
- Auto-refresh idle GitHub tabs after a configurable threshold (default 5 min unfocused).
- Stale-tab reminder via in-page banner (Shadow DOM, GitHub Primer styling) and optional desktop notification (default 10 min).
- User-configurable URL patterns scoped to `github.com` and subdomains (wildcards `*` and `?` supported).
- Popup UI built with React 18, TypeScript strict, Tailwind, and shadcn/ui — auto-syncs to `chrome.storage.sync`.
- Light + dark mode following system preference.
- Manifest V3 service worker with `chrome.alarms`-driven tick loop and per-tab session state.
- Handling of GitHub Turbo navigation via `chrome.webNavigation.onHistoryStateUpdated`.
- CI workflow: typecheck + lint + build on every push and PR, with `dist/` artifact upload.
- Release workflow: tag `v*` triggers a build, version-vs-tag check, zip, and GitHub Release with changelog notes.
- Chrome Web Store submission package (listing copy, permission justifications, privacy policy, screenshot formatter).

[Unreleased]: https://github.com/ivanmaierg/github-refresh/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/ivanmaierg/github-refresh/releases/tag/v0.1.0
