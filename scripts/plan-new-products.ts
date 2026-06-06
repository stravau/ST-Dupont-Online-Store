// Transforms us.st-dupont.com Shopify product JSON into a plan: which new
// products to add, how to cluster their variants, where to put images.
// Reads C:/tmp/{lighters,writing,leather,accessories}.json + existing seed,
// writes C:/tmp/plan.json with the new products and an image manifest.

import fs from "fs";
import { products as existing } from "../prisma/seed-data";

type ShopifyVariant = { id: number; title: string; sku: string; price: string; available?: boolean };
type ShopifyImage = { src: string };
type ShopifyProduct = {
  id: number;
  title: string;
  handle: string;
  body_html: string;
  product_type: string;
  vendor: string;
  tags: string[];
  variants: ShopifyVariant[];
  images: ShopifyImage[];
};

const USD_TO_EUR = 0.92;

const existingSkus = new Set<string>();
for (const p of existing) for (const v of p.variants) existingSkus.add(v.sku.toUpperCase());

const CAT_MAP: Record<string, "isqueiros" | "escrita" | "pele" | "acessorios"> = {
  lighters: "isqueiros",
  writing: "escrita",
  leather: "pele",
  accessories: "acessorios",
};

// Strip HTML, collapse whitespace, take a sensible-length description.
function stripHtml(s: string): string {
  return s
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

// Map a colour string to one or two hex codes; falls back to a neutral grey.
const HEX: Record<string, string> = {
  black: "#15171c",
  blue: "#1f3c66",
  navy: "#1b2a44",
  red: "#7d2b27",
  burgundy: "#5e1f1f",
  white: "#f3efe6",
  silver: "#c9ccd1",
  chrome: "#c9ccd1",
  palladium: "#b9bcc2",
  gold: "#c8a24a",
  yellow: "#d8b04a",
  green: "#3a5040",
  pink: "#e7a3b1",
  brown: "#6b4a2a",
  orange: "#c4642d",
  purple: "#5a3a6e",
  khaki: "#7a7a4b",
  grey: "#7a7d83",
  gray: "#7a7d83",
  turquoise: "#3aaba6",
  lilac: "#b89dcb",
  petrol: "#1f4a55",
  ocean: "#2c5b75",
  pearl: "#ece9e1",
  matt: "#3a3d44",
  matte: "#3a3d44",
};

function colourHexes(name: string): string[] {
  const parts = name
    .toLowerCase()
    .split(/[\s&\-_]+/)
    .filter((w) => HEX[w]);
  const uniq = [...new Set(parts.map((w) => HEX[w]))];
  return uniq.length ? uniq.slice(0, 2) : ["#7a7d83"];
}

// Heuristic to extract the descriptive line/theme + a colour label per SKU.
// Themes that are spurious boolean meta-flags rather than real collections.
const SPURIOUS_THEMES = new Set(["yes", "no", "true", "false"]);

function extractMeta(p: ShopifyProduct): { line: string; theme: string | null; colour: string } {
  let line = "";
  let theme: string | null = null;
  const colours: string[] = [];
  for (const t of p.tags) {
    const m1 = t.match(/^Title-Collection_(.+)$/i);
    if (m1) line = m1[1].replace(/-/g, " ");
    const m2 = t.match(/^Limited-edition_(.+)$/i);
    if (m2) {
      const v = m2[1].replace(/-/g, " ").trim();
      if (!SPURIOUS_THEMES.has(v.toLowerCase())) theme = v;
    }
    const m3 = t.match(/^color_(.+)$/i);
    if (m3) {
      const c = m3[1].replace(/-/g, " ").trim();
      if (!SPURIOUS_THEMES.has(c.toLowerCase())) colours.push(c);
    }
  }
  if (!line) line = p.product_type || "S.T. Dupont";
  // Drop generic line-name fallbacks so "lighters-popote" → "popote".
  const isGenericLine = /^(lighters?|writing[- ]instruments?|leather[- ]goods?|accessories?)$/i.test(line);
  if (isGenericLine && theme) line = "";
  const colour = colours.length ? colours.map(titleCase).join(" & ") : "S.T. Dupont";
  return { line, theme, colour };
}

function titleCase(s: string): string {
  return s
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => (w.length <= 2 ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1).toLowerCase()))
    .join(" ");
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

// Pulled-from-body description (truncated). Falls back to a generic line.
function describe(p: ShopifyProduct, line: string, theme: string | null): string {
  const text = stripHtml(p.body_html || "");
  if (text && text.length > 40) {
    // Take first sentence or first 280 chars.
    const m = text.match(/^[^.]{40,260}\./);
    return m ? m[0] : text.slice(0, 240) + "…";
  }
  return `S.T. Dupont — ${line}${theme ? ` · ${theme}` : ""}. Aço, latão e laca lapidada à mão na manufatura de Faverges.`;
}

// Group all NEW products by parent key = (category, line, theme).
type Group = {
  category: "isqueiros" | "escrita" | "pele" | "acessorios";
  line: string;
  theme: string | null;
  parentSlug: string;
  parentName: string;
  collection: string;
  description: string;
  members: Array<{
    sku: string;
    handle: string;
    colour: string;
    priceCents: number;
    images: string[];
    title: string;
  }>;
};

const groups = new Map<string, Group>();

const cats: Array<"lighters" | "writing" | "leather" | "accessories"> = [
  "lighters",
  "writing",
  "leather",
  "accessories",
];

let totalNew = 0;
let skipped = 0;
// First-seen-wins dedup across categories (cigar accessories appear under
// both lighters and accessories; lighter cases under leather + accessories).
const seenSku = new Set<string>();

for (const cat of cats) {
  const data: { products: ShopifyProduct[] } = JSON.parse(
    fs.readFileSync(`C:/tmp/${cat}.json`, "utf8"),
  );
  for (const p of data.products) {
    const sku = (p.variants[0]?.sku || "").toUpperCase();
    if (!sku) {
      skipped++;
      continue;
    }
    if (existingSkus.has(sku) || seenSku.has(sku)) {
      skipped++;
      continue;
    }
    seenSku.add(sku);
    totalNew++;
    const { line, theme, colour } = extractMeta(p);
    const category = CAT_MAP[cat];
    let parentName: string;
    let parentSlug: string;
    if (line && theme && theme.toLowerCase() !== line.toLowerCase()) {
      parentName = `${line} · ${theme}`;
      parentSlug = slugify(`${line}-${theme}`);
    } else if (theme && !line) {
      parentName = theme;
      parentSlug = slugify(theme);
    } else if (line && !theme) {
      parentName = line;
      parentSlug = slugify(line);
    } else {
      parentName = line || theme || p.product_type || "S.T. Dupont";
      parentSlug = slugify(parentName);
    }
    const key = `${category}::${parentSlug}`;
    if (!groups.has(key)) {
      groups.set(key, {
        category,
        line,
        theme,
        parentSlug,
        parentName,
        collection: line,
        description: describe(p, line, theme),
        members: [],
      });
    }
    const usd = parseFloat(p.variants[0].price || "0");
    const priceCents = Math.round(usd * USD_TO_EUR * 100);
    groups.get(key)!.members.push({
      sku,
      handle: p.handle,
      colour,
      priceCents,
      images: p.images.map((i) => i.src),
      title: p.title,
    });
  }
}

// Avoid slug collisions with the existing seed by suffixing.
const usedSlugs = new Set(existing.map((p) => p.slug));
const finalGroups: Group[] = [];
for (const g of groups.values()) {
  let s = g.parentSlug;
  let n = 2;
  while (usedSlugs.has(s)) {
    s = `${g.parentSlug}-${n++}`;
  }
  usedSlugs.add(s);
  g.parentSlug = s;
  finalGroups.push(g);
}

// Output: a single plan file with the new groups + image manifest.
const imageManifest: Array<{ url: string; localPath: string; productSlug: string; sku: string }> = [];
for (const g of finalGroups) {
  for (const m of g.members) {
    m.images.slice(0, 4).forEach((url, idx) => {
      const ext = (url.split("?")[0].match(/\.([a-z]{3,4})$/i)?.[1] || "png").toLowerCase();
      const fname = idx === 0 ? `${m.sku}.${ext}` : `${m.sku}-${idx + 1}.${ext}`;
      imageManifest.push({
        url,
        localPath: `public/products/${g.parentSlug}/${fname}`,
        productSlug: g.parentSlug,
        sku: m.sku,
      });
    });
  }
}

fs.writeFileSync(
  "C:/tmp/plan.json",
  JSON.stringify({ totalNewSKUs: totalNew, skipped, groupCount: finalGroups.length, groups: finalGroups }, null, 2),
);
fs.writeFileSync("C:/tmp/images.json", JSON.stringify(imageManifest, null, 2));

console.log(`new parents: ${finalGroups.length}`);
console.log(`new SKUs (variants): ${totalNew}`);
console.log(`skipped (already in seed): ${skipped}`);
console.log(`images to download: ${imageManifest.length}`);
console.log(`top categories:`);
const catCount: Record<string, number> = {};
for (const g of finalGroups) catCount[g.category] = (catCount[g.category] || 0) + 1;
console.log(catCount);
console.log(`first 8 parent products:`);
for (const g of finalGroups.slice(0, 8)) {
  console.log(`  ${g.parentSlug} (${g.category}) - ${g.parentName} - ${g.members.length} variants`);
}
