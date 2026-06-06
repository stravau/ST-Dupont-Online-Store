// Turns C:/tmp/plan.json + the downloaded images on disk into a chunk of
// TypeScript that drops into prisma/seed-data.ts (just before the closing
// `];` of the `products` array).

import fs from "fs";
import path from "path";

type PlanMember = {
  sku: string;
  handle: string;
  colour: string;
  priceCents: number;
  images: string[];
  title: string;
};
type PlanGroup = {
  category: "isqueiros" | "escrita" | "pele" | "acessorios";
  line: string;
  theme: string | null;
  parentSlug: string;
  parentName: string;
  collection: string;
  description: string;
  members: PlanMember[];
};
type Plan = { groups: PlanGroup[] };

const plan: Plan = JSON.parse(fs.readFileSync("C:/tmp/plan.json", "utf8"));

// Colour name → hex(es). Falls back to a neutral grey if nothing matches.
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
  golden: "#c8a24a",
  yellow: "#d8b04a",
  green: "#3a5040",
  pink: "#e7a3b1",
  fuchsia: "#c43f7a",
  brown: "#6b4a2a",
  bronze: "#9b6a3a",
  copper: "#a7592c",
  orange: "#c4642d",
  purple: "#5a3a6e",
  khaki: "#7a7a4b",
  grey: "#7a7d83",
  gray: "#7a7d83",
  gunmetal: "#4b4f55",
  turquoise: "#3aaba6",
  lilac: "#b89dcb",
  petrol: "#1f4a55",
  ocean: "#2c5b75",
  pearl: "#ece9e1",
  matt: "#3a3d44",
  matte: "#3a3d44",
  light: "#cfd2d8",
  dark: "#2a2d34",
  neon: "#aef043",
  honey: "#c89b4a",
  coral: "#e2675a",
  indigo: "#2c2c63",
  fire: "#c4392b",
  royal: "#2845a3",
  multicolor: "#7a7d83",
};

function hexes(name: string): string[] {
  const tokens = name
    .toLowerCase()
    .split(/[\s&\-_,]+/)
    .filter(Boolean);
  const out: string[] = [];
  for (const t of tokens) {
    const h = HEX[t];
    if (h && !out.includes(h)) out.push(h);
    if (out.length === 2) break;
  }
  return out.length ? out : ["#7a7d83"];
}

// Loose PT translation of a colour label by tokens.
const PT_COLOUR: Record<string, string> = {
  black: "Preto",
  blue: "Azul",
  navy: "Azul Marinho",
  red: "Vermelho",
  burgundy: "Bordeaux",
  white: "Branco",
  silver: "Prata",
  chrome: "Crómio",
  palladium: "Paládio",
  gold: "Ouro",
  golden: "Dourado",
  yellow: "Amarelo",
  green: "Verde",
  pink: "Rosa",
  fuchsia: "Fúcsia",
  brown: "Castanho",
  bronze: "Bronze",
  copper: "Cobre",
  orange: "Laranja",
  purple: "Roxo",
  khaki: "Caqui",
  grey: "Cinza",
  gray: "Cinza",
  gunmetal: "Gun Metal",
  turquoise: "Turquesa",
  lilac: "Lilás",
  petrol: "Petróleo",
  ocean: "Azul Oceano",
  pearl: "Pérola",
  matt: "Mate",
  matte: "Mate",
  light: "Claro",
  dark: "Escuro",
  neon: "Néon",
  honey: "Mel",
  coral: "Coral",
  indigo: "Índigo",
  fire: "Fogo",
  royal: "Real",
  multicolor: "Multicolor",
};

function titleCase(s: string): string {
  return s
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => (w.length <= 2 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase()))
    .join(" ");
}

function ptColour(en: string): string {
  return en
    .split(/\s+/)
    .filter((t) => t !== "&")
    .map((t) => PT_COLOUR[t.toLowerCase()] || titleCase(t))
    .join(" & ");
}

// Drop ".png?v=...." → ".png" and turn the variant's images into local paths.
function localImages(slug: string, sku: string, count: number): string[] {
  const dir = path.join("public", "products", slug);
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f) => f.toUpperCase().startsWith(sku.toUpperCase()));
  // Sort so the no-suffix front photo lands first, then -2, -3, -4.
  files.sort((a, b) => {
    const ai = a.match(/-(\d+)\./)?.[1];
    const bi = b.match(/-(\d+)\./)?.[1];
    const av = ai ? parseInt(ai) : 1;
    const bv = bi ? parseInt(bi) : 1;
    return av - bv;
  });
  return files.slice(0, count).map((f) => `/products/${slug}/${f}`);
}

function escapeStr(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}

// PT loose-translation of a product line/theme name. Keeps the EN as fallback.
const PT_NAME: Record<string, string> = {
  Lighter: "Isqueiro",
  Lighters: "Isqueiros",
  "Lighter Necklace": "Colar Isqueiro",
  "Lighter necklace": "Colar Isqueiro",
  "Marker Necklace": "Colar Marker",
  "marker necklace": "Colar Marker",
  "Mini Pen Necklace": "Colar Mini-Pen",
  "Lighter Accessories": "Estojos para Isqueiros",
  "Lighter Case": "Estojo de Isqueiro",
  "lighter case": "Estojo de Isqueiro",
  "Writing Instruments": "Escrita",
  "Writing Instrument": "Escrita",
  "writing instrument": "Escrita",
  "Writing instruments": "Escrita",
  Pen: "Caneta",
  "Pen Case": "Estojo de Caneta",
  "pen case": "Estojo de Caneta",
  Inkwell: "Tinteiro",
  inkwell: "Tinteiro",
  "Cigar Cutter": "Cortador de Charuto",
  "Cigar cutter": "Cortador de Charuto",
  "Cigar Case": "Estojo de Charuto",
  "Cigar case": "Estojo de Charuto",
  "2 cigar case": "Estojo Duplo de Charuto",
  "3 cigar case": "Estojo Triplo de Charuto",
  "Double Cigar Case": "Estojo Duplo de Charuto",
  Cufflink: "Botões de Punho",
  Briefcase: "Pasta de Couro",
  Backpack: "Mochila",
  Atelier: "Atelier",
  Firehead: "Firehead",
  Fuente: "Fuente",
  "Neo Capsule": "Neo Capsule",
  "Camera Bag": "Bolsa Câmara",
  "Document holder": "Porta-Documentos",
  "Small cigar pouch": "Pequena Bolsa de Charutos",
  Torch: "Torch",
  Windproof: "Windproof",
  Megajet: "Megajet",
  Maxijet: "Maxijet",
  Minijet: "Minijet",
  Twiggy: "Twiggy",
  Slimmy: "Slimmy",
  Biggy: "Biggy",
  Popote: "Popote",
  Orlinski: "Orlinski",
  "Maki E": "Maki-e",
  "Maki-E": "Maki-e",
  Geode: "Géode",
  "Horse mane": "Horse Mane",
  Horsemane: "Horse Mane",
  "DC Comics": "DC Comics",
  "20000 Lieues sous les mers": "20.000 Léguas Submarinas",
  Fender: "Fender",
  Camo: "Camuflado",
  "Snake skin": "Pele de Cobra",
  "Game of Thrones": "Game of Thrones",
  Padron: "Padrón",
  Dragon: "Dragão",
  "Fire X": "Fire X",
  Casablanca: "Casablanca",
  "monogram 1872": "Monogram 1872",
  "Le Grand Dupont": "Le Grand Dupont",
  "Ligne 2": "Ligne 2",
  "Line 2 Perfect Ping": "Line 2 Perfect Cling",
  "Slim 7": "Slim 7",
  Slim7: "Slim 7",
  "Defi xtreme": "Défi Xtreme",
  "Defi XXtreme": "Défi XXtreme",
  "Defi Extreme": "Défi Extreme",
  "Defi milenium": "Défi Millennium",
  "Defi millennium": "Défi Millennium",
  Eternity: "Eternity",
  "D Initial": "Initial",
  Initial: "Initial",
  Liberte: "Liberté",
  Accessories: "Acessórios",
  "Line D": "Line D",
  "2-cigar-case": "Estojo Duplo de Charuto",
  "3-cigar-case": "Estojo Triplo de Charuto",
  "Defi explorer": "Défi Explorer",
  "Pen case": "Estojo de Caneta",
  "Koi fish": "Koi",
};

function ptName(name: string): string {
  // Try direct translation first, fall back to part-by-part on the · joiner.
  if (PT_NAME[name]) return PT_NAME[name];
  if (name.includes(" · ")) {
    const parts = name.split(" · ").map((p) => PT_NAME[p] || p);
    return parts.join(" · ");
  }
  return name;
}

const FRENCH_DESCS: Record<string, { pt: string; en: string }> = {
  default_lighter: {
    pt: "Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges.",
    en: "S.T. Dupont lighter — hand-polished lacquer, signature flame mechanism and the iconic cling® of the Faverges manufacture.",
  },
  default_writing: {
    pt: "Instrumento de escrita S.T. Dupont — corpo lacado ou metálico, montagem precisa em Faverges, equilíbrio pensado para uma vida de uso.",
    en: "S.T. Dupont writing instrument — lacquered or metal body, precision-assembled in Faverges, balanced for a lifetime of use.",
  },
  default_leather: {
    pt: "Peça em pele S.T. Dupont — curtimenta diamante, costura selada à mão, savoir-faire da maison desde 1872.",
    en: "S.T. Dupont leather piece — diamond tanning, hand-sealed stitching, maison savoir-faire since 1872.",
  },
  default_accessory: {
    pt: "Acessório S.T. Dupont — metal e laca tratados à mão, na tradição da casa francesa fundada em 1872.",
    en: "S.T. Dupont accessory — hand-finished metal and lacquer in the tradition of the French house founded in 1872.",
  },
};

function fallbackDescription(category: PlanGroup["category"]): { pt: string; en: string } {
  if (category === "isqueiros") return FRENCH_DESCS.default_lighter;
  if (category === "escrita") return FRENCH_DESCS.default_writing;
  if (category === "pele") return FRENCH_DESCS.default_leather;
  return FRENCH_DESCS.default_accessory;
}

// Build the TypeScript snippet.
const lines: string[] = [];
lines.push(
  `\n  // --- Added from us.st-dupont.com catalogue ---------------------------------\n  // Generated by scripts/generate-seed-additions.ts. Prices are USD → EUR\n  // at a flat 0.92 rate; colour names mapped from Shopify "color_*" tags.\n`,
);

for (const g of plan.groups) {
  const desc = fallbackDescription(g.category);
  const variantBlocks: string[] = [];
  for (const m of g.members) {
    const en = m.colour;
    const pt = ptColour(en);
    const hx = hexes(en);
    const imgs = localImages(g.parentSlug, m.sku, 4);
    const colourBlock = `attributes: { color: { label: { pt: \`${escapeStr(pt)}\`, en: \`${escapeStr(en)}\` }, hex: [${hx.map((h) => `"${h}"`).join(", ")}] } }`;
    const imageBlock = imgs.length
      ? `image: \`${imgs[0]}\`, images: [${imgs.map((i) => `\`${i}\``).join(", ")}]`
      : `image: undefined`;
    variantBlocks.push(
      `      { sku: \`${m.sku}\`, name: { pt: \`${escapeStr(g.parentName)} — ${escapeStr(pt)}\`, en: \`${escapeStr(g.parentName)} — ${escapeStr(en)}\` }, priceCents: ${m.priceCents}, currency: "EUR", ${colourBlock}, ${imageBlock} }`,
    );
  }

  const heroImage = (() => {
    const first = g.members[0];
    if (!first) return "null";
    const imgs = localImages(g.parentSlug, first.sku, 1);
    return imgs.length ? `\`${imgs[0]}\`` : "null";
  })();

  lines.push(
    `  {
    slug: \`${g.parentSlug}\`,
    name: { pt: \`${escapeStr(ptName(g.parentName))}\`, en: \`${escapeStr(g.parentName)}\` },
    description: { pt: \`${escapeStr(desc.pt)}\`, en: \`${escapeStr(desc.en)}\` },
    collection: \`${escapeStr(ptName(g.collection))}\`,
    categorySlug: "${g.category}",
    image: ${heroImage},
    variants: [
${variantBlocks.join(",\n")}
    ],
  },`,
  );
}

const snippet = lines.join("\n");
fs.writeFileSync("C:/tmp/seed-additions.ts", snippet);

console.log(`Wrote C:/tmp/seed-additions.ts: ${plan.groups.length} new product blocks`);
console.log(`Total variants: ${plan.groups.reduce((s, g) => s + g.members.length, 0)}`);
