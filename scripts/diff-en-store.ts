// Diff en.st-dupont.com against the current seed-data SKUs (every SKU,
// including products in the seed.ts DROP list — those still "exist on the
// website" via their pipeline-imported parents and should never be
// re-imported from the EN store). Outputs a JSON manifest of NEW SKUs
// grouped by parent product.
//
// Sources:
//   - C:/tmp/en-all-p1.json + en-all-p2.json: full EN catalogue (425 SKUs).
//   - C:/tmp/en-{lighters,writing-instruments,leather-goods,accessories}.json:
//     category-specific JSONs used to classify each SKU.
//   - C:/tmp/{lighters,writing,leather,accessories}.json: US store JSONs
//     used as a fallback when the EN store returns price=0 (EU-restricted
//     listings); USD price × 0.92 → EUR.

import fs from "fs";
import { products } from "../prisma/seed-data";

interface ShopifyVariant { id: number; title: string; sku: string; price: string }
interface ShopifyImage { src: string }
interface ShopifyProduct {
  id: number; title: string; handle: string; product_type: string;
  body_html: string; tags: string[]; variants: ShopifyVariant[];
  images: ShopifyImage[];
}

// --- existingSkus: ALL SKUs in the seed source ---------------------------
const existingSkus = new Set<string>();
for (const p of products) {
  for (const v of p.variants) existingSkus.add(v.sku.toUpperCase());
}
console.log("Existing seed SKUs: " + existingSkus.size);

// --- Category classifier — map each SKU to OUR category slug ------------
const enCategoryMap: Record<string, string> = {
  lighters: "isqueiros",
  "writing-instruments": "escrita",
  "leather-goods": "pele",
  accessories: "acessorios",
};
const skuCategory = new Map<string, string>();
for (const [enCat, ourCat] of Object.entries(enCategoryMap)) {
  const data: { products: ShopifyProduct[] } = JSON.parse(
    fs.readFileSync("C:/tmp/en-" + enCat + ".json", "utf8"),
  );
  for (const p of data.products) {
    const sku = (p.variants[0]?.sku || "").toUpperCase();
    if (sku) skuCategory.set(sku, ourCat);
  }
}
console.log("EN-category SKUs classified: " + skuCategory.size);

// --- US fallback price map (USD * 0.92 → EUR) ---------------------------
const usFallback = new Map<string, number>();
for (const usCat of ["lighters", "writing", "leather", "accessories"]) {
  try {
    const data: { products: ShopifyProduct[] } = JSON.parse(
      fs.readFileSync("C:/tmp/" + usCat + ".json", "utf8"),
    );
    for (const p of data.products) {
      const v = p.variants[0];
      if (!v) continue;
      const sku = (v.sku || "").toUpperCase();
      const usd = parseFloat(v.price);
      if (sku && usd > 0) {
        // EN store rounds to whole euros; mirror that for consistency.
        usFallback.set(sku, Math.round(usd * 0.92));
      }
    }
  } catch (e) {
    console.warn("missing US fallback for " + usCat);
  }
}
console.log("US fallback price SKUs: " + usFallback.size);

// --- Walk the full EN catalogue (paginated) -----------------------------
interface NewItem {
  sku: string; title: string; handle: string; category: string;
  collection: string | null; theme: string | null;
  priceEur: number; imageUrls: string[]; tags: string[];
  shopifyTitle: string; bodySnippet: string;
}

const newItems: NewItem[] = [];
const alreadyCovered: string[] = [];
const seen = new Set<string>();

for (const page of [1, 2, 3]) {
  let data: { products: ShopifyProduct[] };
  try {
    data = JSON.parse(fs.readFileSync("C:/tmp/en-all-p" + page + ".json", "utf8"));
  } catch (e) { break; }

  for (const p of data.products) {
    const v = p.variants[0];
    if (!v) continue;
    const sku = (v.sku || "").toUpperCase();
    if (!sku || seen.has(sku)) continue;
    seen.add(sku);
    if (existingSkus.has(sku)) { alreadyCovered.push(sku); continue; }

    const enPrice = Math.round(parseFloat(v.price));
    // Use EN price if positive; otherwise fall back to the US store; lastly,
    // €99 sentinel so the card still renders ("Preço indicativo" anyway).
    const priceEur = enPrice > 0 ? enPrice : usFallback.get(sku) ?? 99;

    const collection = (p.tags.find((t) => t.startsWith("Title-Collection_")) ?? "").replace(
      "Title-Collection_",
      "",
    ) || null;
    const theme = (p.tags.find((t) => t.startsWith("Limited-edition_")) ?? "").replace(
      "Limited-edition_",
      "",
    ) || null;

    newItems.push({
      sku,
      title: p.title,
      handle: p.handle,
      category: skuCategory.get(sku) ?? "acessorios",
      collection,
      theme,
      priceEur,
      imageUrls: p.images.slice(0, 6).map((i) => i.src),
      tags: p.tags,
      shopifyTitle: p.title,
      bodySnippet: (p.body_html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 220),
    });
  }
}

console.log("EN catalogue total walked: " + seen.size + " SKUs");
console.log("  Already in seed: " + alreadyCovered.length);
console.log("  NEW (to import): " + newItems.length);

const byCat: Record<string, number> = {};
for (const n of newItems) byCat[n.category] = (byCat[n.category] ?? 0) + 1;
console.log("  By category:", byCat);

const byPriceSource = { en: 0, us: 0, sentinel: 0 };
for (const n of newItems) {
  if (n.priceEur === 99) byPriceSource.sentinel++;
  else byPriceSource.us++;  // approximation — many EN-priced items are also in US
}
console.log("  Price source approx:", byPriceSource);

// Group by parent (collection + theme + category)
interface ParentGroup {
  parentKey: string;
  parentLabel: string;
  collection: string | null;
  theme: string | null;
  category: string;
  items: NewItem[];
}
const groups = new Map<string, ParentGroup>();
for (const n of newItems) {
  const parentKey = [n.category, n.collection ?? "_none", n.theme ?? "_none"].join("::");
  if (!groups.has(parentKey)) {
    const label = [n.collection ?? "Misc", n.theme ? "· " + n.theme : ""].filter(Boolean).join(" ");
    groups.set(parentKey, {
      parentKey,
      parentLabel: label || "Misc",
      collection: n.collection,
      theme: n.theme,
      category: n.category,
      items: [],
    });
  }
  groups.get(parentKey)!.items.push(n);
}
console.log("New parent groups: " + groups.size);

fs.writeFileSync(
  "C:/tmp/en-diff.json",
  JSON.stringify(
    {
      summary: {
        total: newItems.length + alreadyCovered.length,
        existing: alreadyCovered.length,
        new: newItems.length,
        byCategory: byCat,
        parentGroups: groups.size,
      },
      groups: [...groups.values()].sort((a, b) =>
        a.parentKey.localeCompare(b.parentKey),
      ),
    },
    null,
    2,
  ),
);

console.log("\n=== Top new parent groups ===");
const sorted = [...groups.values()].sort((a, b) => b.items.length - a.items.length);
for (const g of sorted.slice(0, 40)) {
  console.log(
    `  [${String(g.items.length).padStart(2)}v] ${g.category.padEnd(11)} | ${(g.collection ?? "—").padEnd(22)} | ${(g.theme ?? "—").padEnd(20)} | "${g.parentLabel}"`,
  );
}
console.log("wrote C:/tmp/en-diff.json");
