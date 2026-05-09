import { test as base, chromium, type BrowserContext, type Worker } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const DIST_DIR = resolve(__dirname, '../../../dist');
const SKIP_BUILD = process.env.E2E_SKIP_BUILD === '1';
const HEADLESS = process.env.E2E_HEADED !== '1';

function ensureBuilt(): void {
  if (SKIP_BUILD) return;
  if (existsSync(join(DIST_DIR, 'manifest.json'))) return;
  // Build on demand when dist is missing. CI sets E2E_SKIP_BUILD=1 to avoid double build.
  const result = spawnSync('pnpm', ['build'], {
    stdio: 'inherit',
    cwd: resolve(__dirname, '../../../'),
  });
  if (result.status !== 0) {
    throw new Error(`pnpm build failed with exit code ${String(result.status)}`);
  }
}

type Fixtures = {
  context: BrowserContext;
  serviceWorker: Worker;
  extensionId: string;
  openPopup: (path?: string) => Promise<import('@playwright/test').Page>;
};

export const test = base.extend<Fixtures>({
  // eslint-disable-next-line no-empty-pattern
  context: async ({}, use) => {
    ensureBuilt();
    const userDataDir = mkdtempSync(join(tmpdir(), 'ghr-e2e-'));
    const args = [
      `--disable-extensions-except=${DIST_DIR}`,
      `--load-extension=${DIST_DIR}`,
      '--no-first-run',
      '--no-default-browser-check',
    ];
    if (HEADLESS) args.push('--headless=new');

    const context = await chromium.launchPersistentContext(userDataDir, {
      headless: false, // controlled via args above
      args,
    });

    await use(context);
    await context.close();
    rmSync(userDataDir, { recursive: true, force: true });
  },

  serviceWorker: async ({ context }, use) => {
    let [worker] = context.serviceWorkers();
    if (!worker) {
      worker = await context.waitForEvent('serviceworker', { timeout: 10_000 });
    }
    await use(worker);
  },

  extensionId: async ({ serviceWorker }, use) => {
    // sw.url() looks like: chrome-extension://<id>/service-worker-loader.js
    const url = new URL(serviceWorker.url());
    await use(url.host);
  },

  openPopup: async ({ context, extensionId }, use) => {
    const open = async (path = 'src/popup/index.html') => {
      const page = await context.newPage();
      await page.goto(`chrome-extension://${extensionId}/${path}`);
      return page;
    };
    await use(open);
  },
});

export const expect = test.expect;
