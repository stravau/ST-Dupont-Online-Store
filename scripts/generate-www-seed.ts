// Reads C:/tmp/www-new.json + www-cutters.json + www-enrich.json. Writes:
//   C:/tmp/www-images.json         — image download manifest
//   C:/tmp/www-seed-entries.ts     — NEW seed entries to splice
//   C:/tmp/www-cutter-entries.ts   — fresh cigar-cutter entries
//   C:/tmp/www-enrich-map.json     — slug → description rewrite

import fs from "fs";
import { products } from "../prisma/seed-data";

interface NewItem {
  sku: string; title: string; handle: string; category: string;
  collection: string | null; theme: string | null;
  priceEur: number; imageUrls: string[]; tags: string[]; bodyText: string;
}
interface ParentGroup {
  parentKey: string; parentLabel: string;
  collection: string | null; theme: string | null;
  category: string; items: NewItem[];
}
interface CutterRecord {
  sku: string; title: string; handle: string;
  priceEur: number; imageUrls: string[]; tags: string[]; bodyText: string;
}

const diff: { groups: ParentGroup[] } = JSON.parse(fs.readFileSync("C:/tmp/www-new.json", "utf8"));
const cuttersRaw: CutterRecord[] = JSON.parse(fs.readFileSync("C:/tmp/www-cutters.json", "utf8"));
const enrichRaw: { slug: string; sku: string; body: string }[] = JSON.parse(
  fs.readFileSync("C:/tmp/www-enrich.json", "utf8"),
);

const usedSlugs = new Set(products.map((p) => p.slug));

// --- Mappings (copy-pasted from generate-en-seed.ts) ---------------------
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
  classique: { label: "Classique", stub: "classique" },
  Liberte: { label: "Liberté", stub: "liberte" },
  Eternity: { label: "Eternity", stub: "eternity" },
  "Line-D": { label: "Line D Eternity", stub: "line-d" },
  "Defi-milenium": { label: "Défi Millennium", stub: "defi-millennium" },
  "Defi-Extreme": { label: "Défi Extreme", stub: "defi-extreme" },
  Atelier: { label: "Atelier", stub: "atelier" },
  Firehead: { label: "Firehead", stub: "firehead" },
  "Neo-Capsule": { label: "Neo Capsule", stub: "neo-capsule" },
  "Defi-explorer": { label: "Défi Explorer", stub: "defi-explorer" },
  Cufflink: { label: "Cufflinks", stub: "cufflinks" },
  Belt: { label: "Belt", stub: "belt" },
  "Money-clip": { label: "Money Clips", stub: "money-clip" },
  "Key-ring": { label: "Key Holders", stub: "key-ring" },
  "Tie-Clip": { label: "Tie Clips", stub: "tie-clip" },
  Ashtray: { label: "Ashtrays", stub: "ashtray" },
  "Cigarette-case": { label: "Cigarette Case", stub: "cigarette-case" },
  Humidor: { label: "Humidors", stub: "humidor" },
  "Cigar-humidor": { label: "Humidors", stub: "humidor" },
  Autolock: { label: "Autolock", stub: "autolock" },
  "D-Initial": { label: "Initial", stub: "d-initial" },
  Apex: { label: "Apex", stub: "apex" },
  "X-bag": { label: "X-bag", stub: "x-bag" },
  Riviera: { label: "Riviera", stub: "riviera" },
  Classic: { label: "Classic", stub: "classic" },
  Victoria: { label: "Victoria", stub: "victoria" },
  "1872": { label: "Monogram 1872", stub: "monogram-1872" },
  "Monogram-1872": { label: "Monogram 1872", stub: "monogram-1872" },
  "d-logo": { label: "D Logo", stub: "d-logo" },
  "Haute-Creation": { label: "Haute Création", stub: "haute-creation" },
  "Pen-case": { label: "Pen Cases", stub: "pen-case" },
  "Pen-Refill": { label: "Pen Refills", stub: "pen-refill" },
  Notebook: { label: "Notebook", stub: "notebook" },
  "Box-10-Refills": { label: "Gas Refills", stub: "box-10-refills" },
  "Box-12-Refills": { label: "Gas Refills", stub: "box-12-refills" },
  "Box-5-Refills": { label: "Gas Refills", stub: "box-5-refills" },
  "Box-7-Refills": { label: "Gas Refills", stub: "box-7-refills" },
  "Box-8-Refills": { label: "Gas Refills", stub: "box-8-refills" },
  "2-cigar-case": { label: "2 cigar case", stub: "2-cigar-case" },
  "3-cigar-case": { label: "3 cigar case", stub: "3-cigar-case" },
  Gift: { label: "Gift Boxes", stub: "gift-box" },
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
  Horse: { label: "Horse Mane", stub: "horse-mane" },
  Geode: { label: "Géode", stub: "geode" },
  "DC-Comics": { label: "DC Comics", stub: "dc-comics" },
  Popote: { label: "Popote", stub: "popote" },
  Casablanca: { label: "Casablanca", stub: "casablanca" },
  Padron: { label: "Padrón", stub: "padron" },
  "20000-Lieues-sous-les-mers": { label: "20,000 Leagues Under The Sea", stub: "20000-leagues" },
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
  "Stones-of-fortune": { label: "Stones of Fortune", stub: "stones-of-fortune" },
  "Montecristo-la-Nuit": { label: "Montecristo · La Nuit", stub: "montecristo-la-nuit" },
  "Montecristo-l'-aurore": { label: "Montecristo · L'Aurore", stub: "montecristo-aurore" },
  Gift: { label: "Gift", stub: "gift" },
  XL: { label: "XL", stub: "xl" },
};

function hexForColour(name: string | undefined): string[] {
  if (!name) return ["#7a7d83"];
  const c = name.toLowerCase();
  if (/black|preto|noir/.test(c)) return ["#15171c"];
  if (/white|branco|blanc/.test(c)) return ["#efeae0"];
  if (/red|vermelho|rouge|burgund|crimson/.test(c)) return ["#7d2b27"];
  if (/blue|azul|bleu|navy|petrol|indigo/.test(c)) return ["#1f3c66"];
  if (/green|verde|kaki|khaki|olive/.test(c)) return ["#3b5d39"];
  if (/gold|dourado|or|yellow gold|jaune/.test(c)) return ["#c8a24a"];
  if (/silver|prata|palladium|chrome/.test(c)) return ["#b9bcc2"];
  if (/brown|castanho|tobacco|tabac|cognac|caramel|chestnut/.test(c)) return ["#6b4a2a"];
  if (/pink|rosa|rose/.test(c)) return ["#c97a8c"];
  if (/orange|laranja|fluo/.test(c)) return ["#c4642d"];
  if (/grey|gray|cinza|gris|gunmetal/.test(c)) return ["#7a7d83"];
  if (/purple|lilac|mauve|violet/.test(c)) return ["#6b4a8a"];
  if (/turquoise|teal/.test(c)) return ["#3aa1a4"];
  if (/yellow|amarelo|jaune/.test(c)) return ["#d8b04a"];
  return ["#7a7d83"];
}

function colourLabel(item: NewItem | CutterRecord): { pt: string; en: string } {
  const colourTags = item.tags.filter((t) => /^color_/i.test(t)).map((t) => t.replace(/^color_/i, ""));
  if (colourTags.length === 1) {
    const c = colourTags[0].replace(/-/g, " ");
    return { pt: titleCase(c), en: titleCase(c) };
  }
  if (colourTags.length > 1) {
    const c = colourTags.map((x) => x.replace(/-/g, " ")).join(" & ");
    return { pt: titleCase(c), en: titleCase(c) };
  }
  return { pt: `Variante ${item.sku.slice(-4)}`, en: `Variant ${item.sku.slice(-4)}` };
}

function titleCase(s: string): string {
  return s.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());
}

function uniqueSlug(base: string): string {
  let s = base;
  let n = 2;
  while (usedSlugs.has(s)) {
    s = `${base}-${n}`;
    n++;
  }
  usedSlugs.add(s);
  return s;
}

function descForCategory(cat: string, bodyText: string): { pt: string; en: string } {
  // Prefer www's actual description when present; otherwise fall back to the
  // existing house-voice copy.
  if (bodyText && bodyText.length >= 80) {
    return { pt: bodyText, en: bodyText };
  }
  if (cat === "isqueiros") {
    return {
      pt: "Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges.",
      en: "S.T. Dupont lighter — hand-polished lacquer, signature flame mechanism and the iconic cling® of the Faverges manufacture.",
    };
  }
  if (cat === "escrita") {
    return {
      pt: "Instrumento de escrita S.T. Dupont — acabamento Faverges, peso e cadência pensados para a mão de quem escreve com gesto próprio.",
      en: "S.T. Dupont writing instrument — Faverges finish, weight and cadence designed for a writer's own gesture.",
    };
  }
  if (cat === "pele") {
    return {
      pt: "Marroquinaria S.T. Dupont — pele acabada artesanalmente nas oficinas de Faverges.",
      en: "S.T. Dupont leather goods — leather finished by hand at the Faverges workshops.",
    };
  }
  return {
    pt: "Acessório S.T. Dupont — feito à mão nas oficinas de Faverges, herdeiro do savoir-faire da Maison desde 1872.",
    en: "S.T. Dupont accessory — made by hand at the Faverges workshops, an heir to the Maison's savoir-faire since 1872.",
  };
}

interface SeedVariant {
  sku: string; pt: string; en: string; hex: string[];
  priceCents: number; imagePaths: string[];
}
interface SeedEntry {
  slug: string; namePt: string; nameEn: string;
  descPt: string; descEn: string;
  collection: string; categorySlug: string;
  image: string; variants: SeedVariant[];
}

const seedEntries: SeedEntry[] = [];
const downloads: { url: string; localPath: string }[] = [];

// --- Build NEW entries ---------------------------------------------------
for (const g of diff.groups) {
  const collInfo = g.collection ? COLLECTION_MAP[g.collection] : null;
  const themeInfo = g.theme ? THEME_MAP[g.theme] : null;
  const collLabel = collInfo?.label ?? g.collection ?? "Misc";
  const collStub = collInfo?.stub ?? (g.collection ?? "misc").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const themeLabel = themeInfo?.label ?? g.theme;
  const themeStub = themeInfo?.stub ?? (g.theme ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const finalCollection = themeLabel ?? collLabel;
  const parentSlug = uniqueSlug(themeStub ? `${collStub}-${themeStub}` : collStub);
  const parentNameEn = themeLabel ? `${collLabel} · ${themeLabel}` : collLabel;
  const parentNamePt = parentNameEn;

  // Description: pick the longest body_html among the group items (the most
  // informative one usually has the most detail).
  const bodyTexts = g.items.map((it) => it.bodyText).filter(Boolean).sort((a, b) => b.length - a.length);
  const groupBody = bodyTexts[0] ?? "";
  const desc = descForCategory(g.category, groupBody);

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
    const ptName = `${parentNamePt} — ${colour.pt}`;
    const enName = `${parentNameEn} — ${colour.en}`;
    variants.push({
      sku: item.sku, pt: ptName, en: enName, hex,
      priceCents: Math.max(1, item.priceEur) * 100,
      imagePaths,
    });
  }

  if (variants.length === 0) continue;
  seedEntries.push({
    slug: parentSlug,
    namePt: parentNamePt, nameEn: parentNameEn,
    descPt: desc.pt, descEn: desc.en,
    collection: finalCollection, categorySlug: g.category,
    image: variants[0].imagePaths[0], variants,
  });
}

// --- Build CIGAR CUTTER entries ------------------------------------------
const cutterEntries: SeedEntry[] = [];
for (const c of cuttersRaw) {
  const slug = uniqueSlug(`cutter-${c.sku.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`);
  const localBase = `public/products/${slug}/${c.sku}`;
  const imagePaths: string[] = [];
  c.imageUrls.slice(0, 4).forEach((url, i) => {
    const ext = url.match(/\.(png|jpe?g|webp)\b/i)?.[1] ?? "png";
    const local = i === 0 ? `${localBase}.${ext}` : `${localBase}-${i + 1}.${ext}`;
    downloads.push({ url, localPath: local });
    imagePaths.push(local.replace(/^public/, "").replace(/\.png$/i, ".webp").replace(/\.jpe?g$/i, ".webp"));
  });
  const colour = colourLabel(c);
  const hex = hexForColour(colour.en);
  const enName = `${c.title} — ${colour.en}`;
  const desc = descForCategory("acessorios", c.bodyText);
  cutterEntries.push({
    slug,
    namePt: c.title, nameEn: c.title,
    descPt: desc.pt, descEn: desc.en,
    collection: "Cortador de Charuto",
    categorySlug: "acessorios",
    image: imagePaths[0] ?? "/products/placeholder.webp",
    variants: [{
      sku: c.sku, pt: `${c.title} — ${colour.pt}`, en: enName, hex,
      priceCents: Math.max(1, c.priceEur) * 100,
      imagePaths,
    }],
  });
}

// --- Build ENRICHMENT MAP ------------------------------------------------
// Group enrich records by slug, pick longest body
const enrichBySlug = new Map<string, string>();
for (const r of enrichRaw) {
  const prev = enrichBySlug.get(r.slug);
  if (!prev || r.body.length > prev.length) enrichBySlug.set(r.slug, r.body);
}

// --- Emit ---------------------------------------------------------------
function emit(file: string, entries: SeedEntry[]): void {
  const lines: string[] = ["// AUTO-GENERATED from www.st-dupont.com", ""];
  for (const e of entries) {
    lines.push("  {");
    lines.push(`    slug: \`${e.slug}\`,`);
    lines.push(`    name: { pt: \`${esc(e.namePt)}\`, en: \`${esc(e.nameEn)}\` },`);
    lines.push(`    description: { pt: \`${esc(e.descPt)}\`, en: \`${esc(e.descEn)}\` },`);
    lines.push(`    collection: \`${esc(e.collection)}\`,`);
    lines.push(`    categorySlug: "${e.categorySlug}",`);
    lines.push(`    image: \`${e.image}\`,`);
    lines.push(`    variants: [`);
    for (const v of e.variants) {
      const hexStr = v.hex.map((h) => `"${h}"`).join(", ");
      const imgs = v.imagePaths.map((p) => `\`${p}\``).join(", ");
      lines.push(
        `      { sku: \`${v.sku}\`, name: { pt: \`${esc(v.pt)}\`, en: \`${esc(v.en)}\` }, priceCents: ${v.priceCents}, currency: "EUR", attributes: { color: { label: { pt: \`${esc(splitColour(v.pt))}\`, en: \`${esc(splitColour(v.en))}\` }, hex: [${hexStr}] } }, image: \`${v.imagePaths[0]}\`, images: [${imgs}] },`,
      );
    }
    lines.push("    ],");
    lines.push("  },");
  }
  fs.writeFileSync(file, lines.join("\n"));
}

emit("C:/tmp/www-seed-entries.ts", seedEntries);
emit("C:/tmp/www-cutter-entries.ts", cutterEntries);
fs.writeFileSync("C:/tmp/www-images.json", JSON.stringify(downloads, null, 2));
fs.writeFileSync("C:/tmp/www-enrich-map.json", JSON.stringify(Object.fromEntries(enrichBySlug), null, 2));

console.log("Wrote:");
console.log("  new entries: " + seedEntries.length + " parents, " +
  seedEntries.reduce((s, e) => s + e.variants.length, 0) + " variants");
console.log("  cutter entries: " + cutterEntries.length);
console.log("  enrichment slugs: " + enrichBySlug.size);
console.log("  image downloads: " + downloads.length);

function splitColour(name: string): string {
  const i = name.lastIndexOf("—");
  return i === -1 ? name : name.slice(i + 1).trim();
}
function esc(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}
