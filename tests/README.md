# Testing

This project has two test suites: Vitest for unit tests and Playwright for E2E tests.

## Setup

After cloning, install dependencies and the Playwright browser:

```bash
pnpm install
pnpm exec playwright install chromium
```

The Chromium download is ~100 MB and only needs to happen once.

## Running tests

```bash
# Unit tests only (no browser required)
pnpm test:unit

# E2E tests (requires a built dist/)
pnpm test:e2e

# Both suites in sequence
pnpm test

# E2E in headed mode (useful for debugging)
E2E_HEADED=1 pnpm test:e2e

# E2E with Playwright's interactive UI
pnpm test:e2e:ui
```

`pnpm test:e2e` automatically runs `pnpm build` first via the `pretest:e2e` hook.
To skip the build (e.g. when `dist/` is already up to date):

```bash
E2E_SKIP_BUILD=1 pnpm exec playwright test
```

## Snapshot workflow

The banner E2E test uses `toHaveScreenshot()` to guard against visual regressions.

Playwright names snapshots per OS: `*-linux.png`, `*-darwin.png`, `*-win32.png`.

**Convention**: only `*-linux.png` snapshots are committed (CI runs on `ubuntu-latest`).
macOS and Windows variants are gitignored.

To update snapshots locally (macOS generates `*-darwin.png`):

```bash
E2E_SKIP_BUILD=1 pnpm exec playwright test --update-snapshots
```

When adding a new `toHaveScreenshot()` call, run with `--update-snapshots` once to generate
the baseline, then commit the resulting file. CI will generate its own `*-linux.png` on the
first green run — check the CI artifact if needed and commit it.

## CI

The `e2e` job in `.github/workflows/ci.yml` runs after the `build` job completes.
It downloads the `dist` artifact, skips the rebuild (`E2E_SKIP_BUILD=1`), and uploads
`playwright-report/` and `test-results/` as artifacts on failure for inspection.
