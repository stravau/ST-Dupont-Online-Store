// S.T. Dupont's four "universes" (the brand's own naming) and the product
// types within each. Two consumers:
//   - `groups` is a flat list shown as buttons on the category page itself
//     (under the hero) and is the source for what the mobile menu's primary
//     pages link to.
//   - `menuSections` drives the desktop mega-menu (titled columns per the
//     official st-dupont.com layout). All four categories now use sections.
//
// Naming aliases applied where the official menu uses a brand-friendly name
// the catalogue stores under a slightly different collection (Behike →
// Cohiba-Behike; 1872 → Monogram 1872; Le Grand Atelier → Atelier; Jules
// Verne → 20,000 Leagues Under The Sea).
import type { Locale } from "@/lib/i18n";

type L = Record<Locale, string>;

export interface ArtGroup {
  label: L;
  href: string; // locale-relative path → smart button
}

export interface MenuSection {
  title: L;
  items: ArtGroup[];
}

export interface CategoryArt {
  art: string; // brand term, French — used as-is in both locales
  hero?: string; // optional /public path to a full-bleed header photo
  heroPos?: string; // Tailwind object-position for the hero (default object-center)
  groups: ArtGroup[]; // flat list (category-page buttons, mobile menu)
  menuSections?: MenuSection[]; // titled columns for the desktop mega-menu
}

const t = (pt: string, en: string): L => ({ pt, en });
const NEW_RELEASES: ArtGroup = { label: t("Novidades", "New Releases"), href: "/novidades" };

// --- href helpers — keep URL encoding consistent and obvious. ---

// /c/<cat>?col=<exact collection name as stored>
const col = (cat: string, name: string): string =>
  `/c/${cat}?col=${encodeURIComponent(name)}`;

// /t/<group>?type=<key>[&g=<gender>]
const typeHref = (group: string, type: string, g?: "men" | "women"): string => {
  const params = new URLSearchParams({ type });
  if (g) params.set("g", g);
  return `/t/${group}?${params.toString()}`;
};

// /c/escrita?usage=<usage>
const usageHref = (usage: "ballpoint" | "rollerball" | "fountain"): string =>
  `/c/escrita?usage=${usage}`;

// Accessory type buttons (reused across categories' menus).
const A = {
  cufflinks: { label: t("Botões de Punho", "Cufflinks"), href: "/t/cufflinks" },
  belts: { label: t("Cintos", "Belts"), href: "/t/belts" },
  moneyClips: { label: t("Clips de Notas", "Money Clips"), href: "/t/money-clips" },
  keyHolders: { label: t("Porta-Chaves", "Key Holders"), href: "/t/key-holders" },
  tieClips: { label: t("Molas de Gravata", "Tie Clips"), href: "/t/tie-clips" },
  smoking: { label: t("Acessórios para Fumadores", "Smoking Accessories"), href: "/t/smoking" },
  refillStones: { label: t("Recargas & Pedras", "Refills & Stones"), href: "/t/refill-stones" },
  writingAcc: { label: t("Acessórios de Escrita", "Writing Accessories"), href: "/t/writing-accessories" },
  refillsInks: { label: t("Recargas & Tintas", "Refills & Inks"), href: "/t/refills-inks" },
};

// Smoking accessory sub-types (reused under Lighters and Accessories menus).
const SMOKING_ITEMS: ArtGroup[] = [
  { label: t("Estojos de Charuto e Cigarro", "Cigar & Cigarette Cases"), href: typeHref("smoking", "cases") },
  { label: t("Estojos para Isqueiros", "Lighter Cases"), href: "/t/smoking" },
  { label: t("Cortadores de Charuto", "Cigar Cutters"), href: typeHref("smoking", "cutters") },
  { label: t("Cinzeiros", "Ashtrays"), href: typeHref("smoking", "ashtrays") },
  { label: t("Humidores", "Humidors"), href: typeHref("smoking", "humidors") },
  { label: t("Ver tudo", "View all"), href: "/t/smoking" },
];

// Writing accessory sub-types (reused under Writing and Accessories menus).
const WRITING_ITEMS: ArtGroup[] = [
  { label: t("Estojos para Canetas", "Pen Cases"), href: typeHref("writing-accessories", "pen-cases") },
  { label: t("Secretária", "Office Accessories"), href: typeHref("writing-accessories", "office") },
  { label: t("Cadernos", "Notebooks"), href: typeHref("writing-accessories", "notebooks") },
];

export const categoryArt: Record<string, CategoryArt> = {
  // ----------------------------- LIGHTERS -----------------------------------
  isqueiros: {
    art: "L'Art du Feu",
    hero: "/headers/isqueiros.jpg",
    groups: [
      NEW_RELEASES,
      { label: t("Géode", "Géode"), href: col("isqueiros", "Géode") },
      { label: t("Popote", "Popote"), href: col("isqueiros", "Popote") },
      { label: t("Maki-e", "Maki-e"), href: col("isqueiros", "Maki-e") },
      { label: t("Orlinski", "Orlinski"), href: col("isqueiros", "Orlinski") },
      { label: t("Horse Mane", "Horse Mane"), href: col("isqueiros", "Horse Mane") },
      { label: t("Fender", "Fender"), href: col("isqueiros", "Fender") },
      { label: t("Fuente", "Fuente"), href: col("isqueiros", "Fuente") },
      { label: t("Fire X", "Fire X"), href: col("isqueiros", "Fire X") },
      { label: t("Cohiba Behike", "Cohiba Behike"), href: col("isqueiros", "Cohiba-Behike") },
      { label: t("Stones of Fortune", "Stones of Fortune"), href: col("isqueiros", "Stones of Fortune") },
      { label: t("Romeo y Julieta", "Romeo y Julieta"), href: col("isqueiros", "Romeo-y-Julieta") },
      { label: t("Haute Création", "Haute Création"), href: col("isqueiros", "Haute Création") },
      { label: t("Monograma 1872", "Monogram 1872"), href: col("isqueiros", "Monogram 1872") },
      { label: t("DC Comics", "DC Comics"), href: col("isqueiros", "DC Comics") },
      { label: t("20.000 Léguas", "20,000 Leagues"), href: col("isqueiros", "20,000 Leagues Under The Sea") },
    ],
    menuSections: [
      {
        title: t("Novidades", "New Products"),
        items: [
          { label: t("Géode", "Géode"), href: col("isqueiros", "Géode") },
          { label: t("Popote", "Popote"), href: col("isqueiros", "Popote") },
          { label: t("DC Comics", "DC Comics"), href: col("isqueiros", "DC Comics") },
          { label: t("Orlinski", "Orlinski"), href: col("isqueiros", "Orlinski") },
          { label: t("Horse Mane", "Horse Mane"), href: col("isqueiros", "Horse Mane") },
          { label: t("Maki-e", "Maki-e"), href: col("isqueiros", "Maki-e") },
          { label: t("Table Lighter", "Table Lighter"), href: col("isqueiros", "Table lighter") },
          { label: t("Torch", "Torch"), href: col("isqueiros", "Torch") },
          { label: t("Ligne 1", "Ligne 1"), href: col("isqueiros", "Ligne 1") },
        ],
      },
      {
        title: t("Coleções", "Collections"),
        items: [
          { label: t("Ligne 2", "Ligne 2"), href: col("isqueiros", "Ligne 2") },
          { label: t("Le Grand Dupont", "Le Grand Dupont"), href: col("isqueiros", "Le Grand Dupont") },
          { label: t("Biggy", "Biggy"), href: col("isqueiros", "Biggy") },
          { label: t("Slimmy", "Slimmy"), href: col("isqueiros", "Slimmy") },
          { label: t("Initial", "Initial"), href: col("isqueiros", "Initial") },
          { label: t("Ligne 1", "Ligne 1"), href: col("isqueiros", "Ligne 1") },
          { label: t("Twiggy", "Twiggy"), href: col("isqueiros", "Twiggy") },
          { label: t("Colar Isqueiro", "Lighter Necklace"), href: col("isqueiros", "Colar Isqueiro") },
          { label: t("Maxijet", "Maxijet"), href: col("isqueiros", "Maxijet") },
          { label: t("Minijet", "Minijet"), href: col("isqueiros", "Minijet") },
          { label: t("Slim 7", "Slim 7"), href: col("isqueiros", "Slim 7") },
          { label: t("Windproof", "Windproof"), href: col("isqueiros", "Windproof") },
          { label: t("Défi Extrême", "Défi Extreme"), href: col("isqueiros", "Défi Extreme") },
          { label: t("Table Lighter", "Table Lighter"), href: col("isqueiros", "Table lighter") },
          { label: t("Torch", "Torch"), href: col("isqueiros", "Torch") },
        ],
      },
      {
        title: t("Colaboração", "Collaboration"),
        items: [
          { label: t("Orlinski", "Orlinski"), href: col("isqueiros", "Orlinski") },
          { label: t("Fuente", "Fuente"), href: col("isqueiros", "Fuente") },
          { label: t("20.000 Léguas", "20,000 Leagues"), href: col("isqueiros", "20,000 Leagues Under The Sea") },
          { label: t("Romeo y Julieta", "Romeo y Julieta"), href: col("isqueiros", "Romeo-y-Julieta") },
          { label: t("Behike", "Behike"), href: col("isqueiros", "Cohiba-Behike") },
          { label: t("Montecristo", "Montecristo"), href: col("isqueiros", "Montecristo") },
          { label: t("Fender", "Fender"), href: col("isqueiros", "Fender") },
          { label: t("DC Comics", "DC Comics"), href: col("isqueiros", "DC Comics") },
        ],
      },
      {
        title: t("Tema", "Theme"),
        items: [
          { label: t("Géode", "Géode"), href: col("isqueiros", "Géode") },
          { label: t("Popote", "Popote"), href: col("isqueiros", "Popote") },
          { label: t("Maki-e", "Maki-e"), href: col("isqueiros", "Maki-e") },
          { label: t("Horse Mane", "Horse Mane"), href: col("isqueiros", "Horse Mane") },
          { label: t("Camo", "Camo"), href: col("isqueiros", "Camo") },
          { label: t("Monogram 1872", "Monogram 1872"), href: col("isqueiros", "Monogram 1872") },
          { label: t("Fire X", "Fire X"), href: col("isqueiros", "Fire X") },
          { label: t("Snake Skin", "Snake Skin"), href: col("isqueiros", "Snake Skin") },
        ],
      },
      { title: t("Acessórios para Fumadores", "Smoking Accessories"), items: SMOKING_ITEMS },
      {
        title: t("Haute Création", "Haute Création"),
        // Discontinued / archive-only sub-lines (Zodiac, Maharaja, Notre Dame,
        // Lucky Skull) aren't in the live S.T. Dupont catalogue any more, so
        // they're removed. Diamond Head replaces Diamonds Fire-X (same line,
        // current branding). The remaining items resolve via the slug-pattern
        // fallback in lib/catalog.ts.
        items: [
          { label: t("Haute Création", "Haute Création"), href: col("isqueiros", "Haute Création") },
          { label: t("Diamond Head", "Diamond Head"), href: col("isqueiros", "Diamond Head") },
          { label: t("Stones of Fortune", "Stones of Fortune"), href: col("isqueiros", "Stones of Fortune") },
          { label: t("Cohiba 60th", "Cohiba 60th"), href: col("isqueiros", "Cohiba") },
        ],
      },
      {
        title: t("Recargas & Pedras", "Refill & Stones"),
        items: [{ label: t("Ver tudo", "View all"), href: "/t/refill-stones" }],
      },
    ],
  },

  // ----------------------------- WRITING ------------------------------------
  escrita: {
    art: "L'Art de l'Écriture",
    hero: "/headers/escrita.jpg",
    groups: [
      NEW_RELEASES,
      { label: t("Popote", "Popote"), href: col("escrita", "Popote") },
      { label: t("Géode", "Géode"), href: col("escrita", "Géode") },
      { label: t("Orlinski", "Orlinski"), href: col("escrita", "Orlinski") },
      { label: t("Snake Skin", "Snake Skin"), href: col("escrita", "Snake Skin") },
      { label: t("Horse Mane", "Horse Mane"), href: col("escrita", "Horse Mane") },
      { label: t("Montecristo", "Montecristo"), href: col("escrita", "Montecristo") },
      { label: t("Monograma 1872", "Monogram 1872"), href: col("escrita", "Monogram 1872") },
      { label: t("20.000 Léguas", "20,000 Leagues"), href: col("escrita", "20,000 Leagues Under The Sea") },
    ],
    menuSections: [
      {
        title: t("Novidades", "New Products"),
        items: [
          { label: t("Géode", "Géode"), href: col("escrita", "Géode") },
          { label: t("Popote", "Popote"), href: col("escrita", "Popote") },
          { label: t("DC Comics", "DC Comics"), href: col("escrita", "DC Comics") },
          { label: t("Orlinski", "Orlinski"), href: col("escrita", "Orlinski") },
          { label: t("Horse Mane", "Horse Mane"), href: col("escrita", "Horse Mane") },
          { label: t("Maki-e", "Maki-e"), href: col("escrita", "Maki-e") },
          { label: t("Classique", "Classique"), href: col("escrita", "Classique") },
          { label: t("Colar Marker", "Marker Necklace"), href: col("escrita", "Colar Marker") },
        ],
      },
      {
        title: t("Coleções", "Collections"),
        // "Pen Necklace" link replaced with "Marker Necklace" since only the
        // latter exists in our catalogue. Défi Millennium typo fixed.
        items: [
          { label: t("Initial", "Initial"), href: col("escrita", "Initial") },
          { label: t("Line D Eternity", "Line D Eternity"), href: col("escrita", "Line D Eternity") },
          { label: t("Classique", "Classique"), href: col("escrita", "Classique") },
          { label: t("Liberté", "Liberté"), href: col("escrita", "Liberté") },
          { label: t("Défi Millennium", "Défi Millennium"), href: col("escrita", "Défi Millennium") },
          { label: t("Colar Marker", "Marker Necklace"), href: col("escrita", "Marker Necklace") },
        ],
      },
      {
        title: t("Colaboração", "Collaboration"),
        // Elysée and Fuente writing lines aren't in our catalogue; removed.
        items: [
          { label: t("Orlinski", "Orlinski"), href: col("escrita", "Orlinski") },
          { label: t("20.000 Léguas", "20,000 Leagues"), href: col("escrita", "20,000 Leagues Under The Sea") },
          { label: t("Fender", "Fender"), href: col("escrita", "Fender") },
          { label: t("DC Comics", "DC Comics"), href: col("escrita", "DC Comics") },
          { label: t("Montecristo", "Montecristo"), href: col("escrita", "Montecristo") },
        ],
      },
      {
        title: t("Personalização", "Personalization"),
        items: [
          { label: t("Canetas Personalizáveis", "Customisable Pens"), href: "/c/escrita" },
        ],
      },
      {
        title: t("Tema", "Theme"),
        items: [
          { label: t("Géode", "Géode"), href: col("escrita", "Géode") },
          { label: t("Popote", "Popote"), href: col("escrita", "Popote") },
          { label: t("Monogram 1872", "Monogram 1872"), href: col("escrita", "Monogram 1872") },
          { label: t("Maki-e", "Maki-e"), href: col("escrita", "Maki-e") },
          { label: t("Camo", "Camo"), href: col("escrita", "Camo") },
          { label: t("Dragon", "Dragon"), href: col("escrita", "Dragon") },
          { label: t("Fire X", "Fire X"), href: col("escrita", "Fire X") },
          { label: t("Snake Skin", "Snake Skin"), href: col("escrita", "Snake Skin") },
        ],
      },
      { title: t("Acessórios de Escrita", "Writing Accessories"), items: WRITING_ITEMS },
      {
        title: t("Tipo", "Usage"),
        items: [
          { label: t("Rollerball", "Rollerball"), href: usageHref("rollerball") },
          { label: t("Tinta Permanente", "Fountain"), href: usageHref("fountain") },
          { label: t("Esferográfica", "Ballpoint"), href: usageHref("ballpoint") },
        ],
      },
      {
        title: t("Recargas & Tintas", "Refills & Inks"),
        items: [{ label: t("Ver tudo", "View all"), href: "/t/refills-inks" }],
      },
    ],
  },

  // ----------------------------- LEATHER ------------------------------------
  pele: {
    art: "L'Art du Voyage",
    hero: "/headers/pele.jpg",
    groups: [
      NEW_RELEASES,
      { label: t("Apex", "Apex"), href: col("pele", "Apex") },
      { label: t("X-bag", "X-bag"), href: col("pele", "X-bag") },
      { label: t("Riviera", "Riviera"), href: col("pele", "Riviera") },
      { label: t("Victoria", "Victoria"), href: col("pele", "Victoria") },
      { label: t("Atelier", "Atelier"), href: col("pele", "Atelier") },
      { label: t("Firehead", "Firehead"), href: col("pele", "Firehead") },
      { label: t("Neo Capsule", "Neo Capsule"), href: col("pele", "Neo Capsule") },
      { label: t("Défi Explorer", "Défi Explorer"), href: col("pele", "Défi Explorer") },
      { label: t("Classic", "Classic"), href: col("pele", "Classic") },
      { label: t("Monograma 1872", "Monogram 1872"), href: col("pele", "Monogram 1872") },
      { label: t("Fender", "Fender"), href: col("pele", "Fender") },
      { label: t("Fuente", "Fuente"), href: col("pele", "Fuente") },
      { label: t("Senhora", "Women"), href: "/c/pele?g=women" },
      { label: t("Homem", "Men"), href: "/c/pele?g=men" },
      { label: t("Malas", "Bags"), href: "/t/bags" },
      { label: t("Pequena Marroquinaria", "Small Leather Goods"), href: "/t/small-leather" },
    ],
    menuSections: [
      {
        title: t("Novidades", "New"),
        items: [
          { label: t("Défi Explorer", "Defi Explorer"), href: col("pele", "Défi Explorer") },
          { label: t("Victoria", "Victoria"), href: col("pele", "Victoria") },
          { label: t("Apex", "Apex"), href: col("pele", "Apex") },
          { label: t("X-bag", "X-bag"), href: col("pele", "X-bag") },
          { label: t("Riviera", "Riviera"), href: col("pele", "Riviera") },
          { label: t("Classic", "Classic"), href: col("pele", "Classic") },
          { label: t("1872", "1872"), href: col("pele", "Monogram 1872") },
        ],
      },
      {
        title: t("Coleções", "Collections"),
        items: [
          { label: t("Défi Explorer", "Defi Explorer"), href: col("pele", "Défi Explorer") },
          { label: t("Victoria", "Victoria"), href: col("pele", "Victoria") },
          { label: t("Apex", "Apex"), href: col("pele", "Apex") },
          { label: t("X-bag", "X-bag"), href: col("pele", "X-bag") },
          { label: t("Riviera", "Riviera"), href: col("pele", "Riviera") },
          { label: t("Classic", "Classic"), href: col("pele", "Classic") },
          { label: t("1872", "1872"), href: col("pele", "Monogram 1872") },
          { label: t("Le Grand Atelier", "Le Grand Atelier"), href: col("pele", "Atelier") },
          { label: t("Neo Capsule", "Neo Capsule"), href: col("pele", "Neo Capsule") },
          { label: t("Firehead", "Firehead"), href: col("pele", "Firehead") },
        ],
      },
      {
        title: t("Homem", "Men"),
        // Pouches / Tote etc. don't have dedicated bag-type slugs in our
        // catalogue; the Maison stores those variants under model lines
        // (Neo Capsule, X-bag, Firehead). Point each item at the line where
        // the variants live so users land on populated pages.
        items: [
          { label: t("Ver tudo", "View all"), href: "/c/pele?g=men" },
          { label: t("Malas de Viagem", "Travel bags"), href: typeHref("bags", "travel", "men") },
          { label: t("Trabalho", "Business"), href: typeHref("bags", "business", "men") },
          { label: t("Mochilas", "Backpacks"), href: typeHref("bags", "backpacks", "men") },
          { label: t("Tiracolo", "Crossbody"), href: typeHref("bags", "crossbody", "men") },
          { label: t("Bolsas", "Pouches"), href: col("pele", "Neo Capsule") },
          { label: t("Tote Bag", "Tote bag"), href: typeHref("bags", "tote", "men") },
        ],
      },
      {
        title: t("Senhora", "Women"),
        // Hand bag / Shoulder bag / Baguette aren't dedicated types in our
        // data — they live under X-bag (handbags, baguette) and Firehead
        // (shoulder, pouch). Point at the umbrella collection so each link
        // lands on relevant products.
        items: [
          { label: t("Ver tudo", "View all"), href: "/c/pele?g=women" },
          { label: t("Mala de Mão", "Hand bag"), href: col("pele", "X-bag") },
          { label: t("Mala de Ombro", "Shoulder bag"), href: col("pele", "Firehead") },
          { label: t("Tiracolo", "Cross body bag"), href: typeHref("bags", "crossbody", "women") },
          { label: t("Tote Bag", "Tote Bag"), href: typeHref("bags", "tote", "women") },
          { label: t("Baguette", "Baguette bag"), href: col("pele", "X-bag") },
        ],
      },
      {
        title: t("Pequena Marroquinaria", "Small Leather Goods"),
        items: [
          { label: t("Ver tudo", "View all"), href: "/t/small-leather" },
          { label: t("Porta-Cartões", "Card Holders"), href: typeHref("small-leather", "card-holders") },
          { label: t("Carteiras", "Wallets"), href: typeHref("small-leather", "wallets") },
          { label: t("Porta-Chaves", "Key Holders"), href: typeHref("small-leather", "key-holders") },
        ],
      },
      {
        title: t("Personalização", "Personalization"),
        items: [
          { label: t("Pele Personalizável", "Customisable small leather goods"), href: "/c/pele" },
        ],
      },
    ],
  },

  // --------------------------- ACCESSORIES ----------------------------------
  acessorios: {
    art: "L'Art de la Séduction",
    hero: "/headers/acessorios.jpg",
    heroPos: "object-center md:object-[center_75%]",
    groups: [
      NEW_RELEASES,
      A.cufflinks,
      A.belts,
      A.moneyClips,
      A.keyHolders,
      A.tieClips,
      A.smoking,
      A.refillStones,
      A.writingAcc,
      A.refillsInks,
    ],
    menuSections: [
      {
        title: t("Novidades", "New Product"),
        // Behike under accessories points at the Cohiba 60th-anniversary
        // collection (where our accessory line actually lives — cufflinks,
        // 2-cigar case, XL ashtray). Horse Mane and Snake Skin are lighter /
        // writing themes only; no accessory pieces — dropped.
        items: [
          { label: t("Fuente", "Fuente"), href: col("acessorios", "Fuente") },
          { label: t("Jules Verne", "Jules Verne"), href: col("acessorios", "20,000 Leagues Under The Sea") },
          { label: t("Romeo y Julieta", "Romeo y Julieta"), href: col("acessorios", "Romeo-y-Julieta") },
          { label: t("Behike", "Behike"), href: col("acessorios", "Cohiba") },
          { label: t("Fender", "Fender"), href: col("acessorios", "Fender") },
          { label: t("Camo", "Camo"), href: col("acessorios", "Camo") },
          { label: t("Monogram 1872", "Monogram 1872"), href: col("acessorios", "Monogram 1872") },
        ],
      },
      {
        title: t("Coleções", "Collections"),
        // "Necklace" removed — no necklace accessories live in this category.
        items: [
          A.cufflinks,
          A.belts,
          A.keyHolders,
          A.moneyClips,
          A.tieClips,
          { label: t("Ver tudo", "View all"), href: "/c/acessorios" },
        ],
      },
      { title: t("Acessórios para Fumadores", "Smoking Accessories"), items: SMOKING_ITEMS },
      { title: t("Acessórios de Escrita", "Writing Accessories"), items: WRITING_ITEMS },
      {
        title: t("Colaboração", "Collaboration"),
        items: [
          { label: t("Fuente", "Fuente"), href: col("acessorios", "Fuente") },
          { label: t("Romeo y Julieta", "Romeo y Julieta"), href: col("acessorios", "Romeo-y-Julieta") },
          { label: t("Behike", "Behike"), href: col("acessorios", "Cohiba") },
          { label: t("Fender", "Fender"), href: col("acessorios", "Fender") },
          { label: t("Montecristo", "Montecristo"), href: col("acessorios", "Montecristo") },
        ],
      },
      {
        title: t("Tema", "Theme"),
        // Snake Skin removed — no snake-themed accessories in our catalogue.
        items: [
          { label: t("Camo", "Camo"), href: col("acessorios", "Camo") },
          { label: t("Monogram 1872", "Monogram 1872"), href: col("acessorios", "Monogram 1872") },
          { label: t("Fire X", "Fire X"), href: col("acessorios", "Fire X") },
          { label: t("Dragon", "Dragon"), href: col("acessorios", "Dragon") },
        ],
      },
    ],
  },
};
