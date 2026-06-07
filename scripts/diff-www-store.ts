// Diff www.st-dupont.com against the current seed-data. Produces three
// manifests:
//   C:/tmp/www-new.json       — NEW SKUs grouped by parent product
//   C:/tmp/www-enrich.json    — existing slugs whose description should be
//                                replaced with www's body_html
//   C:/tmp/www-cutters.json   — every cigar-cutter parent (NEW or swap)
//                                so we can drop all existing cutters first
//                                and rebuild from the www set.

import fs from "fs";
import { products } from "../prisma/seed-data";

interface ShopifyVariant { id: number; title: string; sku: string; price: string }
interface ShopifyImage { src: string }
interface ShopifyProduct {
  id: number; title: string; handle: string; product_type: string;
  body_html: string; tags: string[]; variants: ShopifyVariant[];
  images: ShopifyImage[];
}

// --- Build SKU index of the current seed ---------------------------------
const skuToSlug = new Map<string, string>();
for (const p of products) {
  for (const v of p.variants) skuToSlug.set(v.sku.toUpperCase(), p.slug);
}
console.log("Existing seed SKUs: " + skuToSlug.size);

// --- Walk full www catalogue (paginated /collections/all) ----------------
const wwwProducts: ShopifyProduct[] = [];
for (const page of [1, 2, 3, 4, 5]) {
  const f = "C:/tmp/www-all-p" + page + ".json";
  if (!fs.existsSync(f)) continue;
  const data = JSON.parse(fs.readFileSync(f, "utf8"));
  for (const p of data.products) wwwProducts.push(p);
}
const wwwSeen = new Set<string>();
const wwwUnique: ShopifyProduct[] = [];
for (const p of wwwProducts) {
  const sku = (p.variants[0]?.sku || "").toUpperCase();
  if (!sku || wwwSeen.has(sku)) continue;
  wwwSeen.add(sku);
  wwwUnique.push(p);
}
console.log("www unique SKUs: " + wwwUnique.length);

// --- Per-SKU category classifier (from category JSONs) -------------------
const enCategoryMap: Record<string, string> = {
  lighters: "isqueiros",
  "writing-instruments": "escrita",
  "leather-goods": "pele",
  accessories: "acessorios",
};
const skuCategory = new Map<string, string>();
for (const [enCat, ourCat] of Object.entries(enCategoryMap)) {
  for (const page of [1, 2, 3]) {
    const f = "C:/tmp/www-" + enCat + "-p" + page + ".json";
    if (!fs.existsSync(f)) continue;
    const data = JSON.parse(fs.readFileSync(f, "utf8"));
    for (const p of data.products) {
      const sku = (p.variants[0]?.sku || "").toUpperCase();
      if (sku) skuCategory.set(sku, ourCat);
    }
  }
}
console.log("Categorized SKUs: " + skuCategory.size);

// --- Classify ------------------------------------------------------------
interface NewItem {
  sku: string; title: string; handle: string; category: string;
  collection: string | null; theme: string | null;
  priceEur: number; imageUrls: string[]; tags: string[];
  bodyText: string;
}
interface EnrichRecord {
  slug: string; sku: string;
  body: string;
}
interface CutterRecord {
  sku: string; title: string; handle: string;
  priceEur: number; imageUrls: string[]; tags: string[];
  bodyText: string;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function isCigarCutter(p: ShopifyProduct): boolean {
  const t = (p.title + " " + p.handle).toLowerCase();
  return /cigar.{0,4}cutter|cutter.*cigar|coupe.cigare/.test(t) ||
    p.tags.some((tag) => /cigar.cutter|coupe.cigare|cutter/i.test(tag));
}

const newItems: NewItem[] = [];
const enrich: EnrichRecord[] = [];
const cutters: CutterRecord[] = [];
const alreadyCovered: string[] = [];

for (const p of wwwUnique) {
  const v = p.variants[0];
  const sku = (v.sku || "").toUpperCase();
  if (!sku) continue;

  const bodyText = stripHtml(p.body_html || "");
  const cat = skuCategory.get(sku) ?? "acessorios";
  const collection = (p.tags.find((t) => t.startsWith("Title-Collection_")) ?? "").replace(
    "Title-Collection_",
    "",
  ) || null;
  const theme = (p.tags.find((t) => t.startsWith("Limited-edition_")) ?? "").replace(
    "Limited-edition_",
    "",
  ) || null;
  const priceEur = Math.round(parseFloat(v.price));

  if (isCigarCutter(p)) {
    cutters.push({
      sku, title: p.title, handle: p.handle,
      priceEur: priceEur > 0 ? priceEur : 99,
      imageUrls: p.images.slice(0, 6).map((i) => i.src),
      tags: p.tags, bodyText,
    });
    continue;  // cigar cutters are handled separately
  }

  if (skuToSlug.has(sku)) {
    alreadyCovered.push(sku);
    // Enrichment candidate — only when www has a real description (≥120 chars
    // is the threshold for "more useful than the generic placeholder").
    if (bodyText.length >= 120) {
      enrich.push({ slug: skuToSlug.get(sku)!, sku, body: bodyText });
    }
    continue;
  }

  if (priceEur <= 0) continue;  // skip zero-price NEW items

  newItems.push({
    sku, title: p.title, handle: p.handle, category: cat,
    collection, theme, priceEur,
    imageUrls: p.images.slice(0, 6).map((i) => i.src),
    tags: p.tags, bodyText,
  });
}

console.log("\n=== Summary ===");
console.log("  www unique: " + wwwUnique.length);
console.log("  Already in seed: " + alreadyCovered.length);
console.log("  NEW (non-cutter): " + newItems.length);
console.log("  Enrichment candidates: " + enrich.length);
console.log("  Cigar cutters (swap pool): " + cutters.length);
const byCat: Record<string, number> = {};
for (const n of newItems) byCat[n.category] = (byCat[n.category] ?? 0) + 1;
console.log("  NEW by category:", byCat);

// Group NEW by parent (collection + theme + category)
interface ParentGroup {
  parentKey: string; parentLabel: string;
  collection: string | null; theme: string | null;
  category: string; items: NewItem[];
}
const groups = new Map<string, ParentGroup>();
for (const n of newItems) {
  const k = [n.category, n.collection ?? "_none", n.theme ?? "_none"].join("::");
  if (!groups.has(k)) {
    const label = [n.collection ?? "Misc", n.theme ? "· " + n.theme : ""].filter(Boolean).join(" ");
    groups.set(k, { parentKey: k, parentLabel: label || "Misc", collection: n.collection, theme: n.theme, category: n.category, items: [] });
  }
  groups.get(k)!.items.push(n);
}
console.log("  Parent groups: " + groups.size);

fs.writeFileSync("C:/tmp/www-new.json", JSON.stringify({ groups: [...groups.values()] }, null, 2));
fs.writeFileSync("C:/tmp/www-enrich.json", JSON.stringify(enrich, null, 2));
fs.writeFileSync("C:/tmp/www-cutters.json", JSON.stringify(cutters, null, 2));

console.log("\n=== Top NEW parent groups (sorted by size) ===");
const sorted = [...groups.values()].sort((a, b) => b.items.length - a.items.length);
for (const g of sorted.slice(0, 50)) {
  console.log(
    `  [${String(g.items.length).padStart(2)}v] ${g.category.padEnd(11)} | ${(g.collection ?? "—").padEnd(24)} | ${(g.theme ?? "—").padEnd(22)} | "${g.parentLabel}"`,
  );
}
