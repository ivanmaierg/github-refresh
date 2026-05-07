import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, '..', 'public', 'icons');

const SIZES = [16, 32, 48, 128];

// GitHub dark canvas + bright accent — matches the popup's dark-mode palette.
const BG = '#0d1117';
const FG = '#58a6ff';

// lucide-react RefreshCw paths (24×24 viewBox), rendered into an 80×80 region
// centered on a 128×128 rounded square so the icon reads cleanly even at 16×16.
const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
  <rect width="128" height="128" rx="28" ry="28" fill="${BG}"/>
  <svg x="24" y="24" width="80" height="80" viewBox="0 0 24 24"
       fill="none" stroke="${FG}" stroke-width="2.75"
       stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
    <path d="M3 3v5h5"/>
    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
    <path d="M16 16h5v5"/>
  </svg>
</svg>
`;

await mkdir(outDir, { recursive: true });

const buf = Buffer.from(svg);
for (const size of SIZES) {
  const outPath = resolve(outDir, `${size}.png`);
  await sharp(buf).resize(size, size).png({ compressionLevel: 9 }).toFile(outPath);
  console.log(`wrote ${outPath}`);
}

console.log('done.');
