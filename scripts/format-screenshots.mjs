#!/usr/bin/env node
// Format Desktop screenshots into CWS-compliant 1280×800 PNGs (24-bit, no alpha).
// Usage: node scripts/format-screenshots.mjs [input1] [input2] ...
//        (no args = pick up every Screenshot*.png from ~/Desktop)

import { readdir, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const outDir = resolve(root, 'store', 'screenshots');

const TARGET_W = 1280;
const TARGET_H = 800;
const BG = { r: 13, g: 17, b: 23 }; // GitHub dark canvas (#0d1117)

await mkdir(outDir, { recursive: true });

let inputs = process.argv.slice(2);
if (inputs.length === 0) {
  const desktop = resolve(homedir(), 'Desktop');
  const all = await readdir(desktop);
  inputs = all
    .filter((f) => /^Screenshot.*\.(png|jpe?g)$/i.test(f))
    .map((f) => resolve(desktop, f))
    .sort();
}

if (inputs.length === 0) {
  console.error('No input screenshots found. Pass paths as args, or drop them in ~/Desktop.');
  process.exit(1);
}

let i = 1;
for (const input of inputs) {
  if (!existsSync(input)) {
    console.warn(`skipping (not found): ${input}`);
    continue;
  }

  const meta = await sharp(input).metadata();
  const aspect = meta.width / meta.height;
  const targetAspect = TARGET_W / TARGET_H;

  // Portrait or much narrower than 16:10 → letterbox onto a dark canvas.
  // Landscape that's close to or wider than 16:10 → scale-cover and crop.
  const isPortraitish = aspect < targetAspect * 0.9;

  let pipeline;
  if (isPortraitish) {
    // Fit fully, padded with the GitHub dark background.
    const inner = await sharp(input)
      .resize({
        width: TARGET_W,
        height: TARGET_H,
        fit: 'contain',
        background: BG,
      })
      .toBuffer();
    pipeline = sharp(inner);
  } else {
    pipeline = sharp(input).resize({
      width: TARGET_W,
      height: TARGET_H,
      fit: 'cover',
      position: 'attention',
    });
  }

  const outName = `${String(i).padStart(2, '0')}-${basename(input, extname(input))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')}.png`;
  const outPath = resolve(outDir, outName);

  // Flatten removes alpha (composites against the BG color) — required by CWS.
  await pipeline
    .flatten({ background: BG })
    .png({ compressionLevel: 9, palette: false })
    .toFile(outPath);

  const outMeta = await sharp(outPath).metadata();
  console.log(
    `${basename(input)} (${meta.width}×${meta.height}, alpha=${meta.hasAlpha ? 'yes' : 'no'}) → ` +
      `${outName} (${outMeta.width}×${outMeta.height}, alpha=${outMeta.hasAlpha ? 'yes' : 'no'}, ${
        isPortraitish ? 'letterboxed' : 'cover-crop'
      })`,
  );

  i++;
}

console.log(`\nWrote ${i - 1} screenshot(s) to ${outDir}`);
