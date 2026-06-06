// Walks every newly-downloaded directory under public/products/ and
// re-encodes each PNG/JPG image to a WebP at quality 82, max width 1280.
// Replaces the .png with .webp and updates seed-data.ts paths.

import fs from "fs";
import path from "path";
import sharp from "sharp";

const ROOT = path.resolve("public/products");

// Existing dirs (originals); skip these to avoid re-encoding the curated set.
const EXISTING_DIRS = new Set([
  "classique",
  "defi-millenium",
  "initial",
  "le-grand-dupont",
  "le-grand-dupont-monogram",
  "liberte",
  "ligne-1",
  "ligne-2",
  "line-d-eternity",
  "slim-7",
  "twiggy",
]);

const seedPath = path.resolve("prisma/seed-data.ts");
let seed = fs.readFileSync(seedPath, "utf8");

const dirs = fs
  .readdirSync(ROOT)
  .filter((d) => !EXISTING_DIRS.has(d))
  .filter((d) => {
    const stat = fs.statSync(path.join(ROOT, d));
    return stat.isDirectory();
  });

let processed = 0;
let totalIn = 0;
let totalOut = 0;
let pathReplacements = 0;

for (const d of dirs) {
  const dir = path.join(ROOT, d);
  const files = fs.readdirSync(dir).filter((f) => /\.(png|jpe?g)$/i.test(f));
  for (const f of files) {
    const src = path.join(dir, f);
    const inSize = fs.statSync(src).size;
    const out = f.replace(/\.(png|jpe?g)$/i, ".webp");
    const dst = path.join(dir, out);
    try {
      await sharp(src)
        .resize({ width: 1280, withoutEnlargement: true })
        .webp({ quality: 82, effort: 5 })
        .toFile(dst);
      const outSize = fs.statSync(dst).size;
      totalIn += inSize;
      totalOut += outSize;
      processed++;
      // Replace the old path in seed-data.ts wherever it appears.
      const oldPath = `/products/${d}/${f}`;
      const newPath = `/products/${d}/${out}`;
      if (seed.includes(oldPath)) {
        seed = seed.split(oldPath).join(newPath);
        pathReplacements++;
      }
      // Delete the original
      fs.unlinkSync(src);
    } catch (e) {
      console.error(`fail ${src}:`, e.message);
    }
  }
  if (processed % 50 === 0 && processed > 0) {
    process.stdout.write(`  ${processed} files...\n`);
  }
}

fs.writeFileSync(seedPath, seed);

const mbIn = (totalIn / 1024 / 1024).toFixed(1);
const mbOut = (totalOut / 1024 / 1024).toFixed(1);
console.log(`Processed: ${processed} files`);
console.log(`Path replacements in seed-data.ts: ${pathReplacements}`);
console.log(`Size: ${mbIn} MB → ${mbOut} MB (${((1 - totalOut / totalIn) * 100).toFixed(0)}% smaller)`);
