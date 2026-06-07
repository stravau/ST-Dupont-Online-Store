// Replays prisma/seed.ts's transformation locally so we can spot the
// post-transform slug collision without touching the DB.
// Re-imports the live DROP/RENAME maps via dynamic eval to stay in sync
// with seed.ts — drift was the cause of last week's silent miss.

import fs from "fs";
import path from "path";
import { products } from "../prisma/seed-data";

const seedTs = fs.readFileSync(path.join(__dirname, "..", "prisma", "seed.ts"), "utf8");

function extractSet(varName: string): Set<string> {
  const re = new RegExp(`const ${varName} = new Set<string>\\(\\[(.*?)\\]\\)`, "s");
  const m = seedTs.match(re);
  if (!m) return new Set();
  return new Set(
    Array.from(m[1].matchAll(/"([^"\n]+)"/g))
      .map((x) => x[1])
      .filter((s) => !s.startsWith("//")),
  );
}

function extractMap(varName: string): Record<string, string> {
  const re = new RegExp(`const ${varName}: Record<string, string> = \\{(.*?)\\n\\}`, "s");
  const m = seedTs.match(re);
  if (!m) return {};
  const out: Record<string, string> = {};
  for (const line of m[1].split("\n")) {
    const mm = line.match(/^\s*"([^"]+)":\s*"([^"]+)"/);
    if (mm) out[mm[1]] = mm[2];
  }
  return out;
}

const DROP_SLUGS = extractSet("DROP_SLUGS");
const RENAME_SLUG = extractMap("RENAME_SLUG");

const seen = new Map<string, string[]>();
const kept: string[] = [];
const dropped: string[] = [];

for (const p of products) {
  if (DROP_SLUGS.has(p.slug)) {
    dropped.push(p.slug);
    continue;
  }
  kept.push(p.slug);
  const post = RENAME_SLUG[p.slug] ?? p.slug;
  if (!seen.has(post)) seen.set(post, []);
  seen.get(post)!.push(p.slug);
}

console.log(`DROP_SLUGS: ${DROP_SLUGS.size}, RENAME_SLUG: ${Object.keys(RENAME_SLUG).length}`);
console.log(`Kept: ${kept.length}, Dropped: ${dropped.length}`);
console.log("--- Post-transform slug collisions ---");
let hits = 0;
for (const [post, originals] of seen) {
  if (originals.length > 1) {
    console.log(`  COLLISION: ${post}  ←  ${originals.join(", ")}`);
    hits++;
  }
}
if (!hits) console.log("  (none)");
