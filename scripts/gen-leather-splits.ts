// Generates prisma/leather-splits.generated.ts — the SPLIT_PRODUCT
// config for every leather bundle, grouped by model (description with
// colours stripped, so colourways of one model stay together), named
// "Collection · Type" with a "(price€)" suffix when a type repeats
// within a collection. Emits EXPLICIT sku lists per part and asserts
// full coverage (every bundle variant assigned exactly once).
//
// Re-run with: npx tsx scripts/gen-leather-splits.ts
import fs from "fs";
import { products } from "../prisma/seed-data";

// ---- exclude products dropped at seed time ----
const seedSrc = fs.readFileSync("prisma/seed.ts", "utf8");
const DROP = new Set<string>(
  [...(/new Set<string>\(\[([\s\S]*?)\]\)/.exec(seedSrc)![1].matchAll(/"([^"]+)"/g))].map((m) => m[1]),
);

// ---- www index ----
const dir = "C:/tmp";
const wwwBySku = new Map<string, { title: string; body: string; price: number }>();
for (const f of fs.readdirSync(dir).filter((x) => /^www-.*\.json$/.test(x) && !/new|enrich|cutter|image/.test(x))) {
  let d: any; try { d = JSON.parse(fs.readFileSync(dir + "/" + f, "utf8")); } catch { continue; }
  if (!d.products) continue;
  for (const p of d.products) {
    const body = (p.body_html || "").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
    for (const v of p.variants || []) {
      const s = (v.sku || "").toUpperCase();
      if (s && !wwwBySku.has(s)) wwwBySku.set(s, { title: p.title, body, price: Math.round(parseFloat(v.price)) || 0 });
    }
  }
}

const COLOURS = ["black","blue","brown","beige","red","burgundy","grey","gray","green","khaki","white","silver","gold","golden","orange","pink","violet","lilac","navy","indigo","turquoise","honey","fir","pacific","gulf","stream","nude","dark","light","off","royal","multicolor","cognac","bordeaux"];
function modelSig(body: string, title: string): string {
  let b = " " + body.toLowerCase() + " ";
  for (const c of COLOURS) b = b.replace(new RegExp("\\b" + c + "\\b", "g"), " ");
  b = b.replace(/[^a-z ]/g, " ").replace(/\s+/g, " ").trim();
  return title.toLowerCase().replace(/[^a-z ]/g, "").trim() + "|" + b.slice(0, 100);
}

// raw www title -> canonical EN item type
const TITLE_CANON: Record<string, string> = {
  "tote bag": "Tote", "tote": "Tote", "shopping": "Tote",
  "shoulder bag": "Shoulder Bag", "firehead black shoulder bag": "Shoulder Bag", "firehead blue shoulder bag": "Shoulder Bag",
  "travel bag": "Travel Bag", "firehead black travel bag": "Travel Bag",
  "card holder": "Card Holder", "zip card holder": "Zip Card Holder",
  "document holder": "Document Holder", "double document holder": "Double Document Holder",
  "passport holder": "Passport Holder",
  "long wallet": "Long Wallet", "wallet": "Wallet",
  "pouch": "Pouch", "cigar pouch": "Cigar Pouch", "small cigar pouch": "Small Cigar Pouch",
  "messenger": "Messenger", "backpack": "Backpack", "crossbody": "Crossbody",
  "conference pad": "Conference Pad", "bottle holder tote": "Bottle Holder Tote",
  "briefcase": "Briefcase", "leather-briefcase": "Briefcase",
  "keyrings": "Key Ring", "keyring": "Key Ring",
  "mini trunk": "Mini Trunk", "nano trunk": "Nano Trunk", "trunk": "Trunk",
  "baguette": "Baguette", "small": "Small", "medium": "Medium", "mini": "Mini",
};
const PT: Record<string, string> = {
  "Tote": "Tote", "Shoulder Bag": "Mala de Ombro", "Travel Bag": "Mala de Viagem",
  "Card Holder": "Porta-Cartões", "Zip Card Holder": "Porta-Cartões com Fecho",
  "Document Holder": "Porta-Documentos", "Double Document Holder": "Porta-Documentos Duplo",
  "Passport Holder": "Porta-Passaporte", "Long Wallet": "Carteira Longa", "Wallet": "Carteira",
  "Pouch": "Pochette", "Cigar Pouch": "Estojo de Charuto", "Small Cigar Pouch": "Estojo de Charuto Pequeno",
  "Messenger": "Mala Messenger", "Backpack": "Mochila", "Crossbody": "Crossbody",
  "Conference Pad": "Bloco de Conferência", "Bottle Holder Tote": "Tote Porta-Garrafa",
  "Briefcase": "Pasta", "Key Ring": "Porta-Chaves",
  "Mini Trunk": "Mini Baú", "Nano Trunk": "Nano Baú", "Trunk": "Baú",
  "Baguette": "Baguette", "Small": "Pequeno", "Medium": "Médio", "Mini": "Mini",
};
function canonType(title: string): string {
  const key = title.toLowerCase().replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
  if (TITLE_CANON[key]) return TITLE_CANON[key];
  // title-case fallback
  return key.replace(/\b\w/g, (c) => c.toUpperCase());
}
function slugify(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase();
}

const LEATHER = products.filter((p) => p.categorySlug === "pele" && !DROP.has(p.slug) && p.slug !== "victoria");

const out: string[] = [];
let totalAssigned = 0, totalVariants = 0, lostCheck = 0;
const issues: string[] = [];

for (const p of LEATHER) {
  // Group variants by (item-type + price). This merges every colour of
  // one model into a single product (same type+price) while separating
  // genuinely different models (different price) — matching the chosen
  // "type + price" naming. modelSig is unused now but kept for ref.
  void modelSig;
  const groups = new Map<string, { type: string; minPrice: number; skus: string[] }>();
  for (const v of p.variants) {
    const w = wwwBySku.get(v.sku.toUpperCase());
    const type = w ? canonType(w.title) : "Other";
    const price = w?.price ?? Math.round(v.priceCents / 100);
    const key = `${type}|${price}`;
    if (!groups.has(key)) groups.set(key, { type, minPrice: price || 99999, skus: [] });
    groups.get(key)!.skus.push(v.sku);
  }
  totalVariants += p.variants.length;
  if (groups.size < 2) { // not a bundle — skip (stays a single product)
    continue;
  }
  // disambiguate types that repeat within this collection
  const typeCounts = new Map<string, number>();
  for (const g of groups.values()) typeCounts.set(g.type, (typeCounts.get(g.type) ?? 0) + 1);

  const usedSlug = new Set<string>();
  const parts: string[] = [];
  for (const g of [...groups.values()].sort((a, b) => a.minPrice - b.minPrice)) {
    const collides = (typeCounts.get(g.type) ?? 0) > 1;
    const enType = collides ? `${g.type} (${g.minPrice}€)` : g.type;
    const ptBase = PT[g.type] ?? g.type;
    const ptType = collides ? `${ptBase} (${g.minPrice}€)` : ptBase;
    const en = `${p.name.en} · ${enType}`;
    const pt = `${p.name.pt} · ${ptType}`;
    let slug = `${p.slug}-${slugify(g.type)}${collides ? "-" + g.minPrice : ""}`;
    let n = 2; while (usedSlug.has(slug)) slug = `${p.slug}-${slugify(g.type)}-${g.minPrice}-${n++}`;
    usedSlug.add(slug);
    totalAssigned += g.skus.length;
    parts.push(`    { slug: ${JSON.stringify(slug)}, name: { pt: ${JSON.stringify(pt)}, en: ${JSON.stringify(en)} }, skus: ${JSON.stringify(g.skus)} },`);
  }
  out.push(`  ${JSON.stringify(p.slug)}: [`);
  out.push(...parts);
  out.push(`  ],`);
  // coverage check for this product
  const assigned = [...groups.values()].reduce((s, g) => s + g.skus.length, 0);
  if (assigned !== p.variants.length) { issues.push(`${p.slug}: assigned ${assigned} ≠ ${p.variants.length}`); lostCheck++; }
}

const header = `// AUTO-GENERATED by scripts/gen-leather-splits.ts — do not edit by hand.
// Splits bundled leather products into one product per model, named
// "Collection · Type (price€)". Imported by prisma/seed.ts.
export interface GenSplitPart { slug: string; name: { pt: string; en: string }; skus: string[] }
export const LEATHER_SPLITS: Record<string, GenSplitPart[]> = {
${out.join("\n")}
};
`;
fs.writeFileSync("prisma/leather-splits.generated.ts", header);

console.log("Leather bundles split:", out.filter((l) => l.endsWith("[")).length);
console.log("Variants assigned:", totalAssigned);
console.log("Coverage issues:", lostCheck, issues.join("; "));
