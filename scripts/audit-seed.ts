// Audit the current seed-data: duplicates, products with no working images,
// suspected miscategorisations. Writes C:/tmp/audit.json.

import fs from "fs";
import path from "path";
import { products } from "../prisma/seed-data";

type Issue =
  | { kind: "dup-slug"; slug: string }
  | { kind: "dup-line-theme"; slugs: string[]; collection: string; name: string }
  | { kind: "no-images"; slug: string; reason: string }
  | { kind: "missing-image"; slug: string; missingPaths: string[] }
  | { kind: "miscategorised-lighters"; slug: string; collection: string }
  | { kind: "miscategorised-other"; slug: string; collection: string; category: string };

const issues: Issue[] = [];

// 1) Duplicate slugs
{
  const seen = new Map<string, number>();
  for (const p of products) seen.set(p.slug, (seen.get(p.slug) ?? 0) + 1);
  for (const [slug, n] of seen) if (n > 1) issues.push({ kind: "dup-slug", slug });
}

// 2) Dup parents by (collection, name) — likely my added "-2" suffix products
//    overlapping with the existing curated seed entries.
{
  const byName = new Map<string, string[]>();
  for (const p of products) {
    const key = `${p.collection}::${p.name.en.toLowerCase().trim()}`;
    if (!byName.has(key)) byName.set(key, []);
    byName.get(key)!.push(p.slug);
  }
  for (const [key, slugs] of byName) {
    if (slugs.length > 1) {
      const [collection, name] = key.split("::");
      issues.push({ kind: "dup-line-theme", slugs, collection, name });
    }
  }
}

// 3) Image audit — products / variants with missing files on disk.
function fileMissing(rel: string): boolean {
  if (!rel) return false;
  if (rel.startsWith("/")) rel = rel.slice(1);
  return !fs.existsSync(path.join("public", rel));
}

for (const p of products) {
  const variantImgs = p.variants.flatMap((v) =>
    (v.images ?? []).concat(v.image ? [v.image] : []),
  );
  if (p.image == null && variantImgs.length === 0) {
    issues.push({ kind: "no-images", slug: p.slug, reason: "null product.image and no variant images" });
    continue;
  }
  const all = (p.image ? [p.image] : []).concat(variantImgs);
  const miss = [...new Set(all)].filter(fileMissing);
  if (miss.length) issues.push({ kind: "missing-image", slug: p.slug, missingPaths: miss.slice(0, 4) });
}

// 4) Miscategorisation — lighters tab should only have lighters.
const NON_LIGHTER_COLLECTIONS = /cigar|leather|case|holder|cufflink|tray|ashtray|humidor|ink|cigarette/i;
for (const p of products) {
  if (p.categorySlug === "isqueiros" && NON_LIGHTER_COLLECTIONS.test(p.collection + " " + p.name.en)) {
    issues.push({ kind: "miscategorised-lighters", slug: p.slug, collection: p.collection });
  }
}

// Summary by kind.
const byKind: Record<string, number> = {};
for (const i of issues) byKind[i.kind] = (byKind[i.kind] ?? 0) + 1;
console.log("Issues by kind:", byKind);
console.log("Total products:", products.length);

fs.writeFileSync(
  "C:/tmp/audit.json",
  JSON.stringify({ totalProducts: products.length, byKind, issues }, null, 2),
);
console.log("wrote C:/tmp/audit.json");

// Print the dup-line-theme groups (the big cleanup) compactly
console.log("\n=== dup-line-theme ===");
for (const i of issues) {
  if (i.kind === "dup-line-theme") {
    console.log(`  ${i.collection} - "${i.name}"  →  ${i.slugs.join(", ")}`);
  }
}

console.log("\n=== miscategorised-lighters ===");
for (const i of issues) {
  if (i.kind === "miscategorised-lighters") {
    console.log(`  ${i.slug} (${i.collection})`);
  }
}

console.log("\n=== no-images ===");
for (const i of issues) {
  if (i.kind === "no-images") {
    console.log(`  ${i.slug}: ${i.reason}`);
  }
}

console.log("\n=== missing-image (file gone) ===");
for (const i of issues) {
  if (i.kind === "missing-image") {
    console.log(`  ${i.slug}: ${i.missingPaths.join(", ")}`);
  }
}
