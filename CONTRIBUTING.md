# Contributing to GitHub Auto-Refresh

Thanks for your interest. PRs and issues are welcome.

## Dev setup

Requirements: Node 20+, pnpm 9+.

```bash
pnpm install
pnpm icons      # generate icon PNGs (one-time)
pnpm dev        # HMR build; load dist/ as unpacked extension in Chrome
```

For a production build:

```bash
pnpm build
```

After either command, in `chrome://extensions`:

1. Enable **Developer mode**.
2. Click **Load unpacked** and select the `dist/` folder.
3. Pin the extension to the toolbar.

## Coding standards

- TypeScript strict mode — no `any` without a comment justifying it.
- Run `pnpm typecheck` and `pnpm lint` before pushing. Both must pass.
- Run `pnpm format` to apply Prettier; CI will not auto-fix.
- Keep components focused; split when a file gets >250 lines.
- Use the existing `Primer` color tokens (`bg-canvas`, `text-fg`, `text-fg-muted`, `border-border`, etc.) instead of hard-coded hex.

## Architecture rules

- The **background service worker** is the only place that mutates timing state. Don't track timestamps in content scripts or the popup.
- Listeners must be registered **synchronously at top level** of `service-worker.ts` so the SW can wake on events.
- Tab state lives in `chrome.storage.session` only — never module-level Maps; the SW gets terminated.
- Use `chrome.alarms`, never `setInterval`/`setTimeout` for periodic work.

## PR checklist

- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] Tested manually: load `dist/` in Chrome, exercise the changed surface (popup / banner / refresh / reminder).
- [ ] Updated README / docs if behavior changed.
- [ ] No secrets, telemetry endpoints, or remote calls added.

## Reporting bugs

Open an issue with:

- Browser + version (e.g. Chrome 131, Brave 1.72)
- OS + version
- Extension version (popup footer)
- Steps to reproduce
- Expected vs. actual behavior
- Screenshots if visual

## Changelog

User-visible changes go in [`CHANGELOG.md`](CHANGELOG.md) under the `## [Unreleased]` section. Use the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) categories: `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`. Internal-only changes (refactors, CI tweaks, doc fixes) don't need an entry.

## Releasing

See [`RELEASING.md`](RELEASING.md) — `pnpm release:patch|minor|major` then `git push --follow-tags` triggers the Release workflow.

## License

By contributing, you agree your contributions will be MIT-licensed.
