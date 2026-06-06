// Retry the 50 PNGs sharp failed on (libspng strict-mode rejections).
// Uses {failOn:"none"} which lets sharp accept malformed/EXIF-heavy PNGs.

import fs from "fs";
import path from "path";
import sharp from "sharp";

const ROOT = path.resolve("public/products");
const seedPath = path.resolve("prisma/seed-data.ts");
let seed = fs.readFileSync(seedPath, "utf8");

function walk(dir) {
  const out = [];
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) out.push(...walk(p));
    else if (/\.png$/i.test(f)) out.push(p);
  }
  return out;
}

const all = walk(ROOT);
let ok = 0;
let fail = 0;
let pathReplacements = 0;

for (const src of all) {
  // Skip ones already converted (have a .webp sibling).
  const sib = src.replace(/\.png$/i, ".webp");
  if (fs.existsSync(sib)) continue;
  try {
    await sharp(src, { failOn: "none" })
      .resize({ width: 1280, withoutEnlargement: true })
      .webp({ quality: 82, effort: 5 })
      .toFile(sib);
    ok++;
    const rel = "/" + path.relative("public", src).replace(/\\/g, "/");
    const newRel = rel.replace(/\.png$/, ".webp");
    if (seed.includes(rel)) {
      seed = seed.split(rel).join(newRel);
      pathReplacements++;
    }
    fs.unlinkSync(src);
  } catch (e) {
    fail++;
    console.error(`still fail ${src}: ${e.message}`);
  }
}

fs.writeFileSync(seedPath, seed);
console.log(`retry: ok=${ok} fail=${fail} path-replacements=${pathReplacements}`);
