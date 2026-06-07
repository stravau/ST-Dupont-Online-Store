// Diff en.st-dupont.com against the current seed (after the seed.ts
// transformer applies DROP + RENAME + RECATEGORIZE + RECOLLECTION). Outputs
// a JSON manifest of NEW SKUs grouped by parent product.

import fs from "fs";
import { products } from "../prisma/seed-data";

// --- Mirror the seed.ts cleanup -----------------------------------------
// (Kept hand-synced because the seed.ts maps are unexported.)
const DROP_SLUGS = new Set([
  "defi-extreme", "biggy", "slimmy", "pen-case-single", "pen-case-double",
  "desk-blotter", "pen-tray", "notebook-a5", "notebook-pocket", "ink-bottle",
  "rollerball-refill", "apex-wallet", "apex-card-holder",
  "defi-explorer-document-holder", "defi-explorer-backpack", "travel-bag",
  "weekend-bag", "briefcase", "urban-backpack", "crossbody-bag",
  "compact-crossbody", "leather-wallet", "slim-card-holder",
  "leather-key-holder", "cufflinks-montecristo-aurore", "money-clip",
  "key-ring", "cigar-cutter-fire-x", "cigar-case", "ashtray-fire-x",
  "humidor", "belt", "tie-clip", "gas-refill", "stones", "cigar-cutter-v",
  "cigar-case-double", "ashtray-porcelain", "humidor-travel",
  "classic-cufflinks", "classic-belt", "engraved-money-clip",
  "classic-tie-clip", "twiggy-monogram", "slimmy-monogram", "biggy-monogram",
  "line-d-eternity-monogram", "cigar-case-monogram", "cigar-case-double-monogram",
  "cigarette-case-monogram", "cigar-cutter-monogram", "ashtray-monogram",
  "cufflinks-monogram", "money-clip-monogram", "key-ring-monogram",
  "writing-instrument", "writing-instruments", "ligne-2", "twiggy",
  "le-grand-dupont-monogram-1872", "biggy-monogram-1872", "ligne-2-monogram-1872",
]);

// Walk EVERY product (including drops) so SKUs that the user removed
// from the catalogue don't sneak back in via the EN store import. A
// dropped product's SKUs are still "items the user already saw and chose
// to discard" — re-importing them as -2 slugs defeats that edit.
const existingSkus = new Set<string>();
const existingSlugs = new Set<string>();
for (const p of products) {
  existingSlugs.add(p.slug);
  for (const v of p.variants) existingSkus.add(v.sku.toUpperCase());
}
console.log("Existing (all SKUs in source): " + existingSkus.size + " SKUs, " + existingSlugs.size + " products");

// --- Load EN store JSONs ------------------------------------------------
interface ShopifyVariant { id: number; title: string; sku: string; price: string; }
interface ShopifyImage { src: string; }
interface ShopifyProduct {
  id: number; title: string; handle: string; product_type: string;
  body_html: string; tags: string[]; variants: ShopifyVariant[];
  images: ShopifyImage[];
}

const categories: Record<string, string> = {
  lighters: "isqueiros",
  "writing-instruments": "escrita",
  "leather-goods": "pele",
  accessories: "acessorios",
};

interface NewItem {
  sku: string; title: string; handle: string; category: string;
  collection: string | null; theme: string | null;
  priceEur: number; imageUrls: string[]; tags: string[];
  shopifyTitle: string; bodySnippet: string;
}

const newItems: NewItem[] = [];
const existingFromEn: { sku: string; handle: string }[] = [];

for (const [enCat, ourCat] of Object.entries(categories)) {
  const data: { products: ShopifyProduct[] } = JSON.parse(
    fs.readFileSync("C:/tmp/en-" + enCat + ".json", "utf8"),
  );
  for (const p of data.products) {
    const v = p.variants[0];
    if (!v) continue;
    const sku = (v.sku || "").toUpperCase();
    if (!sku) continue;
    if (existingSkus.has(sku)) {
      existingFromEn.push({ sku, handle: p.handle });
      continue;
    }
    // EUR price (en.st-dupont.com is EUR-denominated). Items the EN store
    // marks as €0.00 are typically EU-restricted/discontinued — skip them
    // so we don't seed €1 sentinels.
    const priceEur = Math.round(parseFloat(v.price));
    if (priceEur <= 0) continue;
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
      category: ourCat,
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

console.log("EN store total: " + (newItems.length + existingFromEn.length) + " SKUs");
console.log("  Already covered: " + existingFromEn.length);
console.log("  NEW (not in seed): " + newItems.length);

const byCat: Record<string, number> = {};
for (const n of newItems) byCat[n.category] = (byCat[n.category] ?? 0) + 1;
console.log("  New by category:", byCat);

// Group new SKUs by parent (collection + theme + base line derived from handle).
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
  // Parent key: collection + theme + category. Each unique combination
  // becomes one parent product with N variant cards.
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
        total: newItems.length + existingFromEn.length,
        existing: existingFromEn.length,
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
for (const g of sorted.slice(0, 30)) {
  console.log(`  [${g.items.length}v] ${g.category.padEnd(11)} | ${(g.collection ?? "—").padEnd(20)} | ${(g.theme ?? "—").padEnd(18)} | "${g.parentLabel}"`);
}
console.log("wrote C:/tmp/en-diff.json");
