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

**The Linux baseline is canonical and committed** at
`tests/e2e/banner.spec.ts-snapshots/reminder-banner-chromium-linux.png`.
CI verifies against it — CI does **not** auto-generate it. A missing or stale baseline
causes CI to go red immediately.

macOS-local snapshots (`*-darwin.png`) are gitignored and regenerated on every local
`pnpm test:e2e` run. They are **not** the source of truth; they only exist so local runs
pass on macOS.

### Regenerating the Linux baseline

When banner styling changes (fonts, colours, layout), macOS and Windows contributors must
regenerate the Linux PNG using the official Playwright Docker image so the OS matches CI:

```bash
PW_VERSION=$(pnpm list @playwright/test --json | jq -r '.[0].devDependencies."@playwright/test".version')
docker run --rm \
  -v "$PWD:/work" -w /work \
  -e CI=1 \
  "mcr.microsoft.com/playwright:v${PW_VERSION}-jammy" \
  bash -c "corepack enable && pnpm install --frozen-lockfile && pnpm exec playwright test --update-snapshots tests/e2e/banner.spec.ts"
```

If `jq` is not installed, look up the version in `package.json` under
`devDependencies["@playwright/test"]` and substitute it directly in the image tag
(e.g. `mcr.microsoft.com/playwright:v1.52.0-jammy`).

> **Note**: the Docker recipe mounts the repo root as `/work`, so pnpm's store ends up at
> `.pnpm-store/` inside the repo. That directory is gitignored and safe to delete afterwards.

After the container finishes, commit the updated
`tests/e2e/banner.spec.ts-snapshots/reminder-banner-chromium-linux.png`.

## CI

The `e2e` job in `.github/workflows/ci.yml` runs after the `build` job completes.
It downloads the `dist` artifact, skips the rebuild (`E2E_SKIP_BUILD=1`), and uploads
`playwright-report/` and `test-results/` as artifacts on failure for inspection.
