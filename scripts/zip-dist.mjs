import { execFileSync, execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const dist = resolve(root, 'dist');
const releases = resolve(root, 'releases');

if (!existsSync(dist)) {
  console.error('dist/ not found — run `pnpm build` first.');
  process.exit(1);
}

const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
const out = resolve(releases, `${pkg.name}-v${pkg.version}.zip`);

mkdirSync(releases, { recursive: true });
if (existsSync(out)) rmSync(out);

try {
  execSync('zip --version', { stdio: 'ignore' });
} catch {
  console.error('`zip` command not found. Install it (macOS/Linux: built-in; Windows: use 7-Zip).');
  process.exit(1);
}

execFileSync('zip', ['-qr', out, '.'], { cwd: dist, stdio: 'inherit' });

console.log(`wrote ${out}`);
