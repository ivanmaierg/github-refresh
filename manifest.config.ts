import { defineManifest } from '@crxjs/vite-plugin';
import pkg from './package.json' with { type: 'json' };

export default defineManifest({
  manifest_version: 3,
  name: 'GitHub Auto-Refresh',
  version: pkg.version,
  description:
    'Auto-refresh idle GitHub tabs and remind you when an active tab is going stale. Never miss new commits, PR comments, or CI status.',
  permissions: ['tabs', 'storage', 'alarms', 'notifications', 'webNavigation'],
  host_permissions: ['https://github.com/*', 'https://*.github.com/*'],
  background: {
    service_worker: 'src/background/service-worker.ts',
    type: 'module',
  },
  action: {
    default_popup: 'src/popup/index.html',
    default_title: 'GitHub Auto-Refresh',
  },
  content_scripts: [
    {
      matches: ['https://github.com/*', 'https://*.github.com/*'],
      js: ['src/content/banner.tsx'],
      run_at: 'document_idle',
    },
  ],
  icons: {
    '16': 'public/icons/16.png',
    '32': 'public/icons/32.png',
    '48': 'public/icons/48.png',
    '128': 'public/icons/128.png',
  },
});
