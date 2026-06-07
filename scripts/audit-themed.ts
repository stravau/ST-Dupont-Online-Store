// Find every product whose title (or any variant title) contains a target
// keyword — used to drive the editorial moves for Géode, Popote, DC Comics,
// Monogram 1872, La Fuente, and the Le Grand / Ligne 2 deep clean.

import { products } from "../prisma/seed-data";

const TARGETS: Record<string, RegExp> = {
  geode: /g[eé]ode/i,
  popote: /popote/i,
  "dc-comics": /dc\s*comics|wonder\s*woman|superman|batman/i,
  "monogram-1872": /monogram\s*1872/i,
  "la-fuente": /fuente/i,
  "le-grand": /le\s*grand/i,
  vanikoro: /vanikoro|20000?\s*lieues|20\s*000\s*lieues|20\.000\s*l[ée]guas/i,
  "perfect-cling": /perfect.{0,4}cling/i,
  "table-lighter": /table\s*lighter|golden\s*table/i,
  "defi-extreme": /d[eé]fi.{0,3}(extreme|xtreme|xxtreme)/i,
};

for (const [name, re] of Object.entries(TARGETS)) {
  const matches: { slug: string; collection: string; category: string; vCount: number; firstVariant: string }[] = [];
  for (const p of products) {
    const hits =
      re.test(p.slug) ||
      re.test(p.name.en) ||
      re.test(p.name.pt) ||
      re.test(p.collection) ||
      p.variants.some((v) => re.test(v.name.en) || re.test(v.name.pt) || re.test(v.sku));
    if (hits) {
      matches.push({
        slug: p.slug,
        collection: p.collection,
        category: p.categorySlug,
        vCount: p.variants.length,
        firstVariant: p.variants[0]?.name.en ?? "—",
      });
    }
  }
  console.log(`\n=== ${name.toUpperCase()} (${matches.length}) ===`);
  for (const m of matches) {
    console.log(
      `  ${m.slug.padEnd(40)} cat=${m.category.padEnd(11)} coll=${m.collection.padEnd(28)} v${m.vCount}  → ${m.firstVariant.slice(0, 50)}`,
    );
  }
}

// Also dump the Ligne 2 product variants in order so the "first 12" call can
// be made precisely.
console.log("\n=== LIGNE 2 PRODUCTS (ordered) ===");
const l2 = products.filter((p) => /^ligne-2/.test(p.slug));
for (const p of l2) {
  console.log(`  ${p.slug} (${p.collection}, ${p.categorySlug}) — ${p.variants.length} variants`);
  for (const v of p.variants.slice(0, 25)) {
    console.log(`    ${v.sku.padEnd(12)} ${v.priceCents}c — ${v.name.en.slice(0, 60)}`);
  }
}

console.log("\n=== TWIGGY PRODUCTS ===");
const tw = products.filter((p) => /twiggy/i.test(p.slug));
for (const p of tw) {
  console.log(`  ${p.slug} (${p.collection}, ${p.categorySlug}) — ${p.variants.length} variants`);
}

console.log("\n=== LE GRAND (any) ===");
const lg = products.filter((p) => /le-?grand/i.test(p.slug) || /Le Grand/i.test(p.collection));
for (const p of lg) {
  console.log(`  ${p.slug} (${p.collection}, ${p.categorySlug}) — ${p.variants.length} variants`);
  for (const v of p.variants.slice(0, 5)) {
    console.log(`    ${v.sku.padEnd(12)} — ${v.name.en.slice(0, 70)}`);
  }
}
