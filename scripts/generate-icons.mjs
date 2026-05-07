import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, '..', 'public', 'icons');

const SIZES = [16, 32, 48, 128];

const svg = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1f6feb"/>
      <stop offset="100%" stop-color="#0969da"/>
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="28" ry="28" fill="url(#bg)"/>
  <g transform="translate(28,28)" fill="#ffffff">
    <path d="M64 12c-9.9 0-19.2 3.6-26.5 10.1-1.6 1.4-1.7 3.9-.3 5.5l3.3 3.7c1.4 1.5 3.7 1.6 5.2.3C50.7 27.5 57.2 25 64 25c12.7 0 23.7 7.7 28.5 18.7l-9.5-2.6c-2-.5-4 .7-4.6 2.7-.5 2 .7 4 2.7 4.6L99.7 53c.3.1.7.1 1 .1.7 0 1.3-.2 1.9-.5.9-.5 1.5-1.4 1.7-2.5l4.5-18.5c.5-2-.7-4-2.7-4.6-2-.5-4 .7-4.6 2.7l-2.4 9.7C92.6 25.6 79.5 16.8 64.5 16.8 64.3 16.8 64.2 16.8 64 16.8z" transform="scale(0.55) translate(0, -3)"/>
    <path d="M104.5 60c-.5-2-2.5-3.2-4.6-2.7l-9.5 2.6C85.7 71.3 74.7 79 64 79c-6.8 0-13.3-2.5-18.3-6.6-1.5-1.3-3.8-1.2-5.2.3l-3.3 3.7c-1.4 1.6-1.3 4 .3 5.5 7.3 6.5 16.6 10.1 26.5 10.1 15 0 28.1-8.8 34.5-22.5l2.4 9.7c.5 2 2.5 3.2 4.6 2.7 2-.5 3.2-2.5 2.7-4.6L104.5 60z" transform="scale(0.55) translate(0, 35)"/>
  </g>
</svg>
`;

await mkdir(outDir, { recursive: true });

for (const size of SIZES) {
  const buf = Buffer.from(svg(size));
  const outPath = resolve(outDir, `${size}.png`);
  await sharp(buf).resize(size, size).png().toFile(outPath);
  await writeFile(outPath, await sharp(buf).resize(size, size).png().toBuffer());
  console.log(`wrote ${outPath}`);
}

console.log('done.');
