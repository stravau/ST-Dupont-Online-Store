// Replays prisma/seed.ts's transformation locally so we can spot the
// post-transform slug collision without touching the DB.

import { products } from "../prisma/seed-data";

const DROP_SLUGS = new Set<string>([
  "defi-extreme",
  "biggy",
  "slimmy",
  "pen-case-single",
  "pen-case-double",
  "desk-blotter",
  "pen-tray",
  "notebook-a5",
  "notebook-pocket",
  "ink-bottle",
  "rollerball-refill",
  "apex-wallet",
  "apex-card-holder",
  "defi-explorer-document-holder",
  "defi-explorer-backpack",
  "travel-bag",
  "weekend-bag",
  "briefcase",
  "urban-backpack",
  "crossbody-bag",
  "compact-crossbody",
  "leather-wallet",
  "slim-card-holder",
  "leather-key-holder",
  "cufflinks-montecristo-aurore",
  "money-clip",
  "key-ring",
  "cigar-cutter-fire-x",
  "cigar-case",
  "ashtray-fire-x",
  "humidor",
  "belt",
  "tie-clip",
  "gas-refill",
  "stones",
  "cigar-cutter-v",
  "cigar-case-double",
  "ashtray-porcelain",
  "humidor-travel",
  "classic-cufflinks",
  "classic-belt",
  "engraved-money-clip",
  "classic-tie-clip",
  "twiggy-monogram",
  "slimmy-monogram",
  "biggy-monogram",
  "line-d-eternity-monogram",
  "cigar-case-monogram",
  "cigar-case-double-monogram",
  "cigarette-case-monogram",
  "cigar-cutter-monogram",
  "ashtray-monogram",
  "cufflinks-monogram",
  "money-clip-monogram",
  "key-ring-monogram",
  "writing-instrument",
  "writing-instruments",
]);

const RENAME_SLUG: Record<string, string> = {
  "biggy-2": "biggy",
  "slimmy-2": "slimmy",
  "cigar-cutter-2": "cigar-cutter-extra",
  "initial-2": "initial-cinatic",
  "popote-2": "popote-writing",
  "ligne-2-2": "ligne-2-extra",
  "ligne-2-3": "ligne-2-lighter-case",
  "twiggy-2": "twiggy-extra",
  "slimmy-20000-lieues-sous-les-mers": "slimmy-vanikoro",
  "twiggy-20000-lieues-sous-les-mers": "twiggy-vanikoro",
  "ligne-2-20000-lieues-sous-les-mers": "ligne-2-vanikoro",
};

const seen = new Map<string, string[]>(); // post-slug → list of original slugs
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

console.log(`Kept: ${kept.length}, Dropped: ${dropped.length}`);
console.log("--- Post-transform slug collisions ---");
for (const [post, originals] of seen) {
  if (originals.length > 1) {
    console.log(`  ${post}  ←  ${originals.join(", ")}`);
  }
}
console.log("--- Existing slugs that contain '2' (possible double-rename targets) ---");
for (const slug of kept) {
  if (/-2$|^2-/.test(slug)) console.log(`  ${slug}`);
}
