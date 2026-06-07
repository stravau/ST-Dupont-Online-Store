// Reads C:/tmp/en-diff.json (output of diff-en-store.ts) and produces:
// (1) a download manifest C:/tmp/en-images.json listing PNG URLs to fetch,
// (2) a TypeScript snippet C:/tmp/en-seed-entries.ts ready to splice into
//     prisma/seed-data.ts. Uses the same cw/cwg helpers and conventions as
//     the existing seed.

import fs from "fs";
import { products } from "../prisma/seed-data";

interface NewItem {
  sku: string;
  title: string;
  handle: string;
  category: string;
  collection: string | null;
  theme: string | null;
  priceEur: number;
  imageUrls: string[];
  tags: string[];
  bodySnippet: string;
}
interface ParentGroup {
  parentKey: string;
  parentLabel: string;
  collection: string | null;
  theme: string | null;
  category: string;
  items: NewItem[];
}
interface Diff {
  summary: unknown;
  groups: ParentGroup[];
}

const diff: Diff = JSON.parse(fs.readFileSync("C:/tmp/en-diff.json", "utf8"));
const usedSlugs = new Set(products.map((p) => p.slug));

// Map Shopify "Title-Collection_*" tag → canonical collection name + slug
// stub. The shopify tags use kebab-case; we want display strings matching
// what's already in the seed and the COLLECTION_ORDER.
const COLLECTION_MAP: Record<string, { label: string; stub: string }> = {
  "Ligne-2": { label: "Ligne 2", stub: "ligne-2" },
  "Le-Grand-Dupont": { label: "Le Grand Dupont", stub: "le-grand-dupont" },
  "Slim-7": { label: "Slim 7", stub: "slim-7" },
  Twiggy: { label: "Twiggy", stub: "twiggy" },
  Slimmy: { label: "Slimmy", stub: "slimmy" },
  Biggy: { label: "Biggy", stub: "biggy" },
  Maxijet: { label: "Maxijet", stub: "maxijet" },
  Minijet: { label: "Minijet", stub: "minijet" },
  Megajet: { label: "Megajet", stub: "megajet" },
  Windproof: { label: "Windproof", stub: "windproof" },
  Initial: { label: "Initial", stub: "initial" },
  "Lighter-Necklace": { label: "Lighter Necklace", stub: "lighter-necklace" },
  "Marker-Necklace": { label: "Marker Necklace", stub: "marker-necklace" },
  "Table-lighter": { label: "Table lighter", stub: "table-lighter" },
  Torch: { label: "Torch", stub: "torch" },
  Classique: { label: "Classique", stub: "classique" },
  Liberte: { label: "Liberté", stub: "liberte" },
  Eternity: { label: "Eternity", stub: "eternity" },
  "Line-D": { label: "Line D Eternity", stub: "line-d" },
  "Defi-milenium": { label: "Défi Millennium", stub: "defi-millennium" },
  Atelier: { label: "Atelier", stub: "atelier" },
  Firehead: { label: "Firehead", stub: "firehead" },
  "Neo-Capsule": { label: "Neo Capsule", stub: "neo-capsule" },
  "Defi-explorer": { label: "Défi Explorer", stub: "defi-explorer" },
  Cufflink: { label: "Cufflinks", stub: "cufflinks" },
  Belt: { label: "Belt", stub: "belt" },
  "Money-clip": { label: "Money Clip", stub: "money-clip" },
  "Key-ring": { label: "Key Ring", stub: "key-ring" },
  "Tie-Clip": { label: "Tie Clip", stub: "tie-clip" },
  Ashtray: { label: "Ashtray", stub: "ashtray" },
  "Cigarette-case": { label: "Cigarette Case", stub: "cigarette-case" },
  Humidor: { label: "Humidor", stub: "humidor" },
  "Cigar-cutter": { label: "Cigar Cutter", stub: "cigar-cutter" },
  Autolock: { label: "Autolock", stub: "autolock" },
};

const THEME_MAP: Record<string, { label: string; stub: string }> = {
  "monogram-1872": { label: "Monogram 1872", stub: "monogram-1872" },
  Dragon: { label: "Dragon", stub: "dragon" },
  Fender: { label: "Fender", stub: "fender" },
  "Maki-E": { label: "Maki-e", stub: "maki-e" },
  "Maki-e": { label: "Maki-e", stub: "maki-e" },
  Fuente: { label: "Fuente", stub: "fuente" },
  Orlinski: { label: "Orlinski", stub: "orlinski" },
  Montecristo: { label: "Montecristo", stub: "montecristo" },
  "Horse-mane": { label: "Horse Mane", stub: "horse-mane" },
  Geode: { label: "Géode", stub: "geode" },
  "DC-Comics": { label: "DC Comics", stub: "dc-comics" },
  Popote: { label: "Popote", stub: "popote" },
  Casablanca: { label: "Casablanca", stub: "casablanca" },
  Padron: { label: "Padrón", stub: "padron" },
  "20000-lieues-sous-les-mers": { label: "20,000 Leagues Under The Sea", stub: "20000-leagues" },
  "Game-of-thrones": { label: "Game of Thrones", stub: "game-of-thrones" },
  "Snake-skin": { label: "Snake Skin", stub: "snake-skin" },
  Camo: { label: "Camo", stub: "camo" },
  "Fire-X": { label: "Fire X", stub: "fire-x" },
  Architecture: { label: "Architecture", stub: "architecture" },
  "Wonder-Woman": { label: "Wonder Woman", stub: "wonder-woman" },
  Catwoman: { label: "Catwoman", stub: "catwoman" },
  Joker: { label: "Joker", stub: "joker" },
  "Perfect-Cling": { label: "Perfect Cling", stub: "perfect-cling" },
};

// A small palette so each new colourway has a swatch hex even when we
// don't know the literal colour from the tags.
function hexForColour(name: string | undefined): string[] {
  if (!name) return ["#7a7d83"];
  const c = name.toLowerCase();
  if (/black|preto|noir/.test(c)) return ["#15171c"];
  if (/white|branco|blanc/.test(c)) return ["#efeae0"];
  if (/red|vermelho|rouge|burgund/.test(c)) return ["#7d2b27"];
  if (/blue|azul|bleu|navy|petrol/.test(c)) return ["#1f3c66"];
  if (/green|verde|kaki|khaki|olive/.test(c)) return ["#3b5d39"];
  if (/gold|dourado|or|yellow gold|jaune/.test(c)) return ["#c8a24a"];
  if (/silver|prata|palladium|chrome/.test(c)) return ["#b9bcc2"];
  if (/brown|castanho|tobacco|tabac|cognac|caramel/.test(c)) return ["#6b4a2a"];
  if (/pink|rosa|rose/.test(c)) return ["#c97a8c"];
  if (/orange|laranja|fluo/.test(c)) return ["#c4642d"];
  if (/grey|gray|cinza|gris/.test(c)) return ["#7a7d83"];
  if (/purple|lilac|mauve|violet/.test(c)) return ["#6b4a8a"];
  if (/turquoise/.test(c)) return ["#3aa1a4"];
  return ["#7a7d83"];
}

// Derive colour label from Shopify tags (color_<name>) or fall back to
// the body description / SKU tail.
function colourLabel(item: NewItem): { pt: string; en: string } {
  const colourTag = item.tags
    .filter((t) => /^color_/i.test(t))
    .map((t) => t.replace(/^color_/i, ""));
  if (colourTag.length === 1) {
    const c = colourTag[0].replace(/-/g, " ");
    return { pt: titleCase(c), en: titleCase(c) };
  }
  if (colourTag.length > 1) {
    const c = colourTag.map((x) => x.replace(/-/g, " ")).join(" & ");
    return { pt: titleCase(c), en: titleCase(c) };
  }
  // Fall back to the SKU suffix (last 4 chars) so each variant has SOMETHING
  return { pt: `Variante ${item.sku.slice(-4)}`, en: `Variant ${item.sku.slice(-4)}` };
}

function titleCase(s: string): string {
  return s.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());
}

// Slug builder + collision avoidance.
function uniqueSlug(base: string): string {
  let slug = base;
  let n = 2;
  while (usedSlugs.has(slug)) {
    slug = `${base}-${n}`;
    n++;
  }
  usedSlugs.add(slug);
  return slug;
}

interface SeedVariant {
  sku: string;
  pt: string;
  en: string;
  hex: string[];
  priceCents: number;
  imagePaths: string[];
}
interface SeedEntry {
  slug: string;
  namePt: string;
  nameEn: string;
  description: string;
  collection: string;
  categorySlug: string;
  image: string;
  variants: SeedVariant[];
}

const seedEntries: SeedEntry[] = [];
const downloads: { url: string; localPath: string }[] = [];

for (const g of diff.groups) {
  const collInfo = g.collection ? COLLECTION_MAP[g.collection] : null;
  const themeInfo = g.theme ? THEME_MAP[g.theme] : null;

  // Collection display name + slug stub
  const collLabel = collInfo?.label ?? g.collection ?? "Misc";
  const collStub = collInfo?.stub ?? (g.collection ?? "misc").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const themeLabel = themeInfo?.label ?? g.theme;
  const themeStub = themeInfo?.stub ?? (g.theme ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-");

  // Final collection: themed lines collapse to the theme; non-themed keep
  // their base line.
  const finalCollection = themeLabel ?? collLabel;
  const parentSlug = uniqueSlug(themeStub ? `${collStub}-${themeStub}` : collStub);
  const parentNameEn = themeLabel ? `${collLabel} · ${themeLabel}` : collLabel;
  const parentNamePt = parentNameEn; // same labels in both for now

  const description =
    g.category === "isqueiros"
      ? "Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges."
      : g.category === "escrita"
        ? "Instrumento de escrita S.T. Dupont — acabamento Faverges, peso e cadência pensados para a mão de quem escreve com gesto próprio."
        : g.category === "pele"
          ? "Marroquinaria S.T. Dupont — pele acabada artesanalmente nas oficinas de Faverges."
          : "Acessório S.T. Dupont — feito à mão nas oficinas de Faverges, herdeiro do savoir-faire da Maison desde 1872.";

  const variants: SeedVariant[] = [];
  for (const item of g.items) {
    const localBase = `public/products/${parentSlug}/${item.sku}`;
    const imagePaths: string[] = [];
    item.imageUrls.slice(0, 4).forEach((url, i) => {
      const ext = url.match(/\.(png|jpe?g|webp)\b/i)?.[1] ?? "png";
      const local = i === 0 ? `${localBase}.${ext}` : `${localBase}-${i + 1}.${ext}`;
      downloads.push({ url, localPath: local });
      imagePaths.push(local.replace(/^public/, "").replace(/\.png$/i, ".webp").replace(/\.jpe?g$/i, ".webp"));
    });
    const colour = colourLabel(item);
    const hex = hexForColour(colour.en);
    // Variant name
    const ptName = `${parentNamePt} — ${colour.pt}`;
    const enName = `${parentNameEn} — ${colour.en}`;
    variants.push({
      sku: item.sku,
      pt: ptName,
      en: enName,
      hex,
      priceCents: Math.max(1, item.priceEur) * 100,
      imagePaths,
    });
  }

  if (variants.length === 0) continue;

  seedEntries.push({
    slug: parentSlug,
    namePt: parentNamePt,
    nameEn: parentNameEn,
    description,
    collection: finalCollection,
    categorySlug: g.category,
    image: variants[0].imagePaths[0],
    variants,
  });
}

console.log("Generated " + seedEntries.length + " parent products with " +
  seedEntries.reduce((s, e) => s + e.variants.length, 0) + " variants.");
console.log("Image downloads: " + downloads.length);

// Emit downloads manifest + the TS snippet.
fs.writeFileSync("C:/tmp/en-images.json", JSON.stringify(downloads, null, 2));

const lines: string[] = [];
lines.push("// AUTO-GENERATED from en.st-dupont.com — splice into prisma/seed-data.ts");
lines.push("// products array (after the existing entries, before the closing `];`).");
lines.push("");
for (const e of seedEntries) {
  lines.push("  {");
  lines.push(`    slug: \`${e.slug}\`,`);
  lines.push(`    name: { pt: \`${escapeTpl(e.namePt)}\`, en: \`${escapeTpl(e.nameEn)}\` },`);
  lines.push(`    description: { pt: \`${escapeTpl(e.description)}\`, en: \`${escapeTpl(e.description)}\` },`);
  lines.push(`    collection: \`${escapeTpl(e.collection)}\`,`);
  lines.push(`    categorySlug: "${e.categorySlug}",`);
  lines.push(`    image: \`${e.image}\`,`);
  lines.push(`    variants: [`);
  for (const v of e.variants) {
    const hexStr = v.hex.map((h) => `"${h}"`).join(", ");
    const imgs = v.imagePaths.map((p) => `\`${p}\``).join(", ");
    lines.push(
      `      { sku: \`${v.sku}\`, name: { pt: \`${escapeTpl(v.pt)}\`, en: \`${escapeTpl(v.en)}\` }, priceCents: ${v.priceCents}, currency: "EUR", attributes: { color: { label: { pt: \`${escapeTpl(splitColourLabel(v.pt))}\`, en: \`${escapeTpl(splitColourLabel(v.en))}\` }, hex: [${hexStr}] } }, image: \`${v.imagePaths[0]}\`, images: [${imgs}] },`,
    );
  }
  lines.push("    ],");
  lines.push("  },");
}
fs.writeFileSync("C:/tmp/en-seed-entries.ts", lines.join("\n"));
console.log("wrote C:/tmp/en-images.json + C:/tmp/en-seed-entries.ts");

function splitColourLabel(name: string): string {
  const i = name.lastIndexOf("—");
  return i === -1 ? name : name.slice(i + 1).trim();
}
function escapeTpl(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}
