// Generates prisma/bundle-splits.generated.ts — the SPLIT_PRODUCT config
// for every bundled product across leather, writing and accessories.
// One source product is split into one product per model; colourways of
// a model stay together. Names are "Collection · Type" (no price). SKU
// lists are explicit; full coverage is asserted.
//
//   pele       → group by item-type + price  (a collection has several
//                models per type, e.g. 7 Firehead wallets at diff prices)
//   escrita    → group by title (type+size)  (title already identifies
//                the model; per-colour price varies within)
//   acessorios → group by title
//   isqueiros  → EXCLUDED (lighters are single models, not bundles)
//
// Re-run: npx tsx scripts/gen-bundle-splits.ts
import fs from "fs";
import { products } from "../prisma/seed-data";
import overlayJson from "../prisma/eci-overlay.generated.json";
const OVERLAY = overlayJson as Record<string, { ean: string | null; priceCents: number | null }>;

const seedSrc = fs.readFileSync("prisma/seed.ts", "utf8");
const DROP = new Set<string>(
  [...(/new Set<string>\(\[([\s\S]*?)\]\)/.exec(seedSrc)![1].matchAll(/"([^"]+)"/g))].map((m) => m[1]),
);

const dir = "C:/tmp";
const wwwBySku = new Map<string, { title: string; price: number }>();
for (const f of fs.readdirSync(dir).filter((x) => /^www-.*\.json$/.test(x) && !/new|enrich|cutter|image/.test(x))) {
  let d: any; try { d = JSON.parse(fs.readFileSync(dir + "/" + f, "utf8")); } catch { continue; }
  if (!d.products) continue;
  for (const p of d.products) for (const v of p.variants || []) {
    const s = (v.sku || "").toUpperCase();
    if (s && !wwwBySku.has(s)) wwwBySku.set(s, { title: p.title, price: Math.round(parseFloat(v.price)) || 0 });
  }
}

const cap = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());
const stripSize = (s: string) => s.replace(/\b(large|medium|small|xl)\b/gi, "").replace(/\s+/g, " ").trim();
const sizeOf = (s: string) => (/\bxl\b/i.test(s) ? "XL" : /\blarge\b/i.test(s) ? "Large" : /\bmedium\b/i.test(s) ? "Medium" : /\bsmall\b/i.test(s) ? "Small" : "");
const ptSize: Record<string, string> = { XL: "XL", Large: "Grande", Medium: "Média", Small: "Pequena", "": "" };

// canonical { en, pt } for a www title, per category.
function canon(title: string, cat: string): { en: string; pt: string } {
  let t = title.toLowerCase().replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
  t = t.replace(/foutain/g, "fountain").replace(/\bstylo roller\b|\broller pen\b|\broller\b(?! ?ball)/g, "rollerball pen");

  if (cat === "escrita") {
    const size = sizeOf(t);
    const base = stripSize(t);
    let en = "", pt = "";
    if (/fountain/.test(base)) { en = "Fountain Pen"; pt = "Caneta de Tinta Permanente"; }
    else if (/rollerball|roller/.test(base)) { en = "Rollerball"; pt = "Rollerball"; }
    else if (/ballpoint/.test(base)) { en = "Ballpoint"; pt = "Esferográfica"; }
    else if (/marker/.test(base)) { en = "Marker"; pt = "Marcador"; }
    else if (/pencil/.test(base)) { en = "Pencil"; pt = "Lapiseira"; }
    else if (/set/.test(base)) { en = "Set"; pt = "Conjunto"; }
    else { en = cap(base); pt = cap(base); }
    if (size) { en += " " + size; pt += " " + ptSize[size]; }
    return { en, pt };
  }

  const ACC: Record<string, { en: string; pt: string }> = {
    "leather case": { en: "Leather Case", pt: "Estojo em Pele" },
    "coated canvas case": { en: "Canvas Case", pt: "Estojo em Tela" },
    "lighter case": { en: "Lighter Case", pt: "Estojo de Isqueiro" },
    "reversible belt": { en: "Reversible Belt", pt: "Cinto Reversível" },
    "belt": { en: "Belt", pt: "Cinto" },
    "1-pen case": { en: "1-Pen Case", pt: "Estojo 1 Caneta" }, "1 pen case": { en: "1-Pen Case", pt: "Estojo 1 Caneta" },
    "2-pen case": { en: "2-Pen Case", pt: "Estojo 2 Canetas" }, "2 pen case": { en: "2-Pen Case", pt: "Estojo 2 Canetas" },
    "3 pen case": { en: "3-Pen Case", pt: "Estojo 3 Canetas" }, "10 pen case": { en: "10-Pen Case", pt: "Estojo 10 Canetas" },
    "pen case": { en: "Pen Case", pt: "Estojo de Caneta" }, "1 pen case xl": { en: "Pen Case XL", pt: "Estojo de Caneta XL" },
    "1 refill box": { en: "Refill Box", pt: "Caixa de Recargas" },
    "guillotine": { en: "Guillotine Cutter", pt: "Corta-Charutos Guilhotina" },
    "double puncher": { en: "Double Puncher", pt: "Furador Duplo" },
    "perfect cut": { en: "Perfect Cut", pt: "Corte Perfeito" },
    "double blade": { en: "Double Blade Cutter", pt: "Corta-Charutos Lâmina Dupla" },
    "cigar cutter": { en: "Cigar Cutter", pt: "Corta-Charutos" },
    "cigar stand": { en: "Cigar Stand", pt: "Suporte para Charuto" },
    "porcelain": { en: "Ashtray · Porcelain", pt: "Cinzeiro · Porcelana" },
    "chrome": { en: "Ashtray · Chrome", pt: "Cinzeiro · Crómio" },
    "metal": { en: "Ashtray · Metal", pt: "Cinzeiro · Metal" },
    "matt": { en: "Ashtray · Matt", pt: "Cinzeiro · Mate" },
    "a5": { en: "A5 Notebook", pt: "Caderno A5" },
    "notebook cover": { en: "Notebook Cover", pt: "Capa de Caderno" },
    "desk pad": { en: "Desk Pad", pt: "Tapete de Secretária" },
    "pencil box": { en: "Pencil Box", pt: "Caixa de Lápis" },
    "cufflinks metal": { en: "Cufflinks", pt: "Botões de Punho" }, "cufflinks": { en: "Cufflinks", pt: "Botões de Punho" },
    "keyrings": { en: "Key Ring", pt: "Porta-Chaves" }, "keyring": { en: "Key Ring", pt: "Porta-Chaves" },
    "marker pen": { en: "Marker", pt: "Marcador" },
  };
  if (ACC[t]) return ACC[t];
  if (/humidor/.test(t)) { const m = t.match(/(\d+)\s*cigar/); return { en: m ? `Humidor ${m[1]} Cigars` : "Humidor", pt: m ? `Humidor ${m[1]} Charutos` : "Humidor" }; }
  return { en: cap(t), pt: cap(t) };
}

function slugify(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase();
}

// Per-SKU name overrides for real products whose www title is missing, so
// they get a proper model name instead of falling into "· Other". Sourced
// from the ECI control sheet "Descrição" column.
const SKU_OVERRIDE: Record<string, { en: string; pt: string }> = {
  "180002": { en: "6-Card ID Wallet", pt: "Carteira 6 Cartões + ID" }, // CARTEIRA 6CC ID LINE D
  "180045": { en: "Long Wallet 13-Card", pt: "Carteira Longa 13 Cartões" }, // CARTEIRA LONGA 13CC LINE D
  "180044": { en: "Zipped Wallet", pt: "Carteira com Fecho" }, // CARTEIRA C/FECHO LINE D
};

const CATS = ["pele", "escrita", "acessorios"];
const out: string[] = [];
const summary: Record<string, number> = {};
let lost = 0; const issues: string[] = [];

for (const cat of CATS) {
  const bundleProducts = products.filter((p) => p.categorySlug === cat && !DROP.has(p.slug) && p.slug !== "victoria");
  for (const p of bundleProducts) {
    const groups = new Map<string, { en: string; pt: string; minPrice: number; skus: string[] }>();
    for (const v of p.variants) {
      const w = wwwBySku.get(v.sku.toUpperCase());
      const c = SKU_OVERRIDE[v.sku] ?? (w ? canon(w.title, cat) : { en: "Other", pt: "Outros" });
      const ov = OVERLAY[v.sku];
      const price = ov?.priceCents ? Math.round(ov.priceCents / 100) : (w?.price ?? Math.round(v.priceCents / 100));
      // leather: split same-type models by price; writing/acc: title only.
      const key = cat === "pele" ? `${c.en}|${price}` : c.en;
      if (!groups.has(key)) groups.set(key, { en: c.en, pt: c.pt, minPrice: price || 99999, skus: [] });
      const g = groups.get(key)!;
      g.skus.push(v.sku);
      if (price && price < g.minPrice) g.minPrice = price;
    }
    if (groups.size < 2) continue; // not a bundle
    const usedSlug = new Set<string>();
    const parts: string[] = [];
    for (const g of [...groups.values()].sort((a, b) => a.minPrice - b.minPrice)) {
      const en = `${p.name.en} · ${g.en}`;
      const pt = `${p.name.pt} · ${g.pt}`;
      let slug = `${p.slug}-${slugify(g.en)}`;
      if (usedSlug.has(slug)) slug = `${p.slug}-${slugify(g.en)}-${g.minPrice}`;
      let n = 2; while (usedSlug.has(slug)) slug = `${p.slug}-${slugify(g.en)}-${g.minPrice}-${n++}`;
      usedSlug.add(slug);
      parts.push(`    { slug: ${JSON.stringify(slug)}, name: { pt: ${JSON.stringify(pt)}, en: ${JSON.stringify(en)} }, skus: ${JSON.stringify(g.skus)} },`);
    }
    out.push(`  ${JSON.stringify(p.slug)}: [`, ...parts, `  ],`);
    summary[cat] = (summary[cat] ?? 0) + parts.length;
    const assigned = [...groups.values()].reduce((s, g) => s + g.skus.length, 0);
    if (assigned !== p.variants.length) { issues.push(`${p.slug}: ${assigned}≠${p.variants.length}`); lost++; }
  }
}

fs.writeFileSync("prisma/bundle-splits.generated.ts",
`// AUTO-GENERATED by scripts/gen-bundle-splits.ts — do not edit by hand.
export interface GenSplitPart { slug: string; name: { pt: string; en: string }; skus: string[] }
export const BUNDLE_SPLITS: Record<string, GenSplitPart[]> = {
${out.join("\n")}
};
`);
console.log("split products by cat:", summary, "| coverage issues:", lost, issues.join(";"));
