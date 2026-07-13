// Canonical display order for product collections (the section titles on
// /c/<category> and the items in the navbar Products column). Themed
// sub-collections render FIRST so visitors land on Géode/Popote/Maki-e/etc
// immediately; base lines follow in the editorial-brief order.

export const COLLECTION_ORDER = [
  // Themed lighter sub-lines (collected via prisma/seed.ts RECOLLECTION).
  "Géode",
  "Popote",
  "Maki-e",
  "Orlinski",
  "Horse Mane",
  "Fender",
  "Fuente",
  "Fire X",
  "Monogram 1872",
  "DC Comics",
  "20,000 Leagues Under The Sea",
  "Casablanca",
  "Game of Thrones",
  "Padrón",
  "Snake Skin",
  "Camo",
  "Dragon",
  "Architecture",
  // 2026-06 — additional www themed lighter sub-lines.
  "Cohiba Behike",
  "Stones of Fortune",
  "Romeo y Julieta",
  "Joker",
  "Harley Quinn",
  "Superman",
  "Trinidad",
  "Présidence de la République",
  "Haute Création",
  "Montecristo",
  "Montecristo · La Nuit",
  "Montecristo · L'Aurore",
  // Lighter base lines — explicit order per editorial brief.
  "Le Grand Dupont",
  "Ligne 2",
  "Ligne 1",
  "Initial",
  "Initial Cinatic",
  "Biggy",
  "Twiggy",
  "Slimmy",
  "Slim 7",
  "Défi Extreme",
  "Windproof",
  "Minijet",
  "Maxijet",
  "Megajet",
  "Table lighter",
  "Torch",
  "Lighter Necklace",
  // Writing
  "Line D Eternity",
  "Classique",
  "Défi Millennium",
  "Liberté",
  "Eternity",
  "Marker Necklace",
  // Leather goods
  "Lighter Accessories",
  "Atelier",
  "Firehead",
  "Neo Capsule",
  "Apex",
  "X-bag",
  "Riviera",
  "Victoria",
  "Classic",
  "D Logo",
  "Défi Explorer",
  "Camera Bag · Fuente",
  "Pen case",
  // Accessories
  "Cigar cutter",
  "Cigar case",
  "2 cigar case",
  "3 cigar case",
  "3 Cigar Case · Fluo",
  "2 Cigar Case · Koi",
  "Double Cigar Case",
  "Humidors",
  "Ashtrays",
  "Cufflinks",
  "Money Clips",
  "Tie Clips",
  "Key Holders",
  "Pen Cases",
  "Gas Refills",
  "Pen Refills",
  "Lighter Cases",
  "Notebook",
  "Gift Boxes",
  "Acessórios",
] as const;

export function collectionRank(c: string): number {
  const i = (COLLECTION_ORDER as readonly string[]).indexOf(c);
  return i === -1 ? COLLECTION_ORDER.length : i;
}

// Structured navigation for the mobile sub-panel — supports either named
// sections (overline + nested items) or flat top-level rows that read at
// the same visual weight as the section headers. An item can hold
// `children` for one inline drill level, which is how Cigar Cases breaks
// into 1 / 2 / 3 cigar case.
//
// Items link either via a `collection` (rendered as
// /c/<category>?col=<collection>) or via an explicit locale-relative
// `href` when the entry needs to target a /t/ group with type/gender
// query params (leather nav) or a /c/escrita?usage= filter (writing nav).
export interface MobileNavItem {
  label: { pt: string; en: string };
  /** Collection string to filter the category by — emits `?col=<value>`. */
  collection?: string;
  /** Explicit locale-relative path (takes precedence over `collection`). */
  href?: string;
  /** Inline nested items (one drill level — accessory sub-categories). */
  children?: MobileNavItem[];
}
export interface MobileNavSection {
  kind: "section";
  title: { pt: string; en: string };
  /** Locale-relative path that shows every product in the section
      (i.e. the filter that includes ALL items below). Optional — when
      set, the sub-panel renders a "Ver tudo" row inside the expanded
      section so users can jump straight to the union view. */
  allHref?: string;
  items: MobileNavItem[];
}
export interface MobileNavFlat {
  kind: "item";
  label: { pt: string; en: string };
  collection?: string;
  href?: string;
}
export type MobileNavEntry = MobileNavSection | MobileNavFlat;

const L = (pt: string, en: string) => ({ pt, en });

// Accessories — Smoking (with Cigar Cases nested into 1 / 2 / 3) and
// Writing are grouped sections; each remaining accessory category
// (Cufflinks, Money Clips, Tie Clips, Key Holders, Gift Boxes) is its
// own top-level row — no "Other" bucket.
export const ACCESSORIES_NAV: readonly MobileNavEntry[] = [
  {
    kind: "section",
    title: L("Acessórios para Fumadores", "Smoking Accessories"),
    allHref: "/t/smoking",
    items: [
      { label: L("Cortador de Charuto", "Cigar Cutter"), collection: "Cigar cutter" },
      {
        label: L("Estojos para Charuto", "Cigar Cases"),
        children: [
          { label: L("1 Charuto", "1 Cigar Case"), collection: "Cigar case" },
          { label: L("2 Charutos", "2 Cigar Case"), collection: "2 cigar case" },
          { label: L("3 Charutos", "3 Cigar Case"), collection: "3 cigar case" },
        ],
      },
      { label: L("Cinzeiros", "Ashtrays"), collection: "Ashtrays" },
      { label: L("Humidores", "Humidors"), collection: "Humidors" },
      { label: L("Estojos para Isqueiros", "Lighter Cases"), collection: "Lighter Cases" },
      { label: L("Recargas de Gás", "Gas Refills"), collection: "Gas Refills" },
    ],
  },
  {
    kind: "section",
    title: L("Acessórios de Escrita", "Writing Accessories"),
    allHref: "/t/writing-accessories",
    items: [
      { label: L("Estojos para Caneta", "Pen Cases"), collection: "Pen Cases" },
      { label: L("Recargas de Caneta", "Pen Refills"), collection: "Pen Refills" },
      { label: L("Cadernos", "Notebook"), collection: "Notebook" },
    ],
  },
  { kind: "item", label: L("Botões de Punho", "Cufflinks"), collection: "Cufflinks" },
  { kind: "item", label: L("Clips de Notas", "Money Clips"), collection: "Money Clips" },
  { kind: "item", label: L("Molas de Gravata", "Tie Clips"), collection: "Tie Clips" },
  { kind: "item", label: L("Porta-Chaves", "Key Holders"), collection: "Key Holders" },
  { kind: "item", label: L("Caixas de Oferta", "Gift Boxes"), collection: "Gift Boxes" },
];

// Leather goods — three sections by end-customer profile. Items point at
// the /t/bags and /t/small-leather groups with type + gender filters
// already understood by app/[lang]/t/[group]/page.tsx.
export const LEATHER_NAV: readonly MobileNavEntry[] = [
  {
    kind: "section",
    title: L("Homem", "Men"),
    allHref: "/t/bags?g=men",
    items: [
      { label: L("Bolsas", "Pouches"),          href: "/t/bags?type=pouches&g=men" },
      { label: L("Malas de Viagem", "Travel"),  href: "/t/bags?type=travel&g=men" },
      { label: L("Mochilas", "Backpacks"),      href: "/t/bags?type=backpacks&g=men" },
      { label: L("Tiracolo", "Crossbody"),      href: "/t/bags?type=crossbody&g=men" },
      { label: L("Tote Bag", "Tote Bag"),       href: "/t/bags?type=tote&g=men" },
      { label: L("Trabalho", "Business"),       href: "/t/bags?type=business&g=men" },
    ],
  },
  {
    kind: "section",
    title: L("Senhora", "Women"),
    allHref: "/t/bags?g=women",
    items: [
      { label: L("Baguette", "Baguette"),         href: "/t/bags?type=baguette&g=women" },
      { label: L("Mala de Mão", "Hand Bag"),      href: "/t/bags?type=hand-bag&g=women" },
      { label: L("Mala de Ombro", "Shoulder Bag"),href: "/t/bags?type=shoulder-bag&g=women" },
      { label: L("Tiracolo", "Crossbody"),        href: "/t/bags?type=crossbody&g=women" },
      { label: L("Tote Bag", "Tote Bag"),         href: "/t/bags?type=tote&g=women" },
    ],
  },
  {
    kind: "section",
    title: L("Pequena Marroquinaria", "Small Leather Goods"),
    allHref: "/t/small-leather",
    items: [
      { label: L("Carteiras", "Wallets"),           href: "/t/small-leather?type=wallets" },
      { label: L("Porta-Cartões", "Card Holders"),  href: "/t/small-leather?type=card-holders" },
      { label: L("Porta-Chaves", "Key Holders"),    href: "/t/small-leather?type=key-holders" },
    ],
  },
];

// Writing instruments — three sections by pen type. Each item is a
// collection filter within that type, so the user sees only collections
// that actually ship a pen of the chosen type. Category page reads
// ?usage=<type>&col=<collection> — both filters compose.
//
// The collection list per type mirrors what the seed-data actually
// carries: Classique and Marker Necklace are ballpoint-only lines; the
// rest of the mainline collections ship in all three types.
const wr = (usage: "ballpoint" | "rollerball" | "fountain", collection: string): string =>
  `/c/escrita?usage=${usage}&col=${encodeURIComponent(collection)}`;

export const WRITING_NAV: readonly MobileNavEntry[] = [
  {
    kind: "section",
    title: L("Esferográfica", "Ballpoint"),
    allHref: "/c/escrita?usage=ballpoint",
    items: [
      { label: L("Line D Eternity", "Line D Eternity"), href: wr("ballpoint", "Line D Eternity") },
      { label: L("Line D", "Line D"),                   href: wr("ballpoint", "Line D") },
      { label: L("Classique", "Classique"),             href: wr("ballpoint", "Classique") },
      { label: L("Défi Millennium", "Défi Millennium"), href: wr("ballpoint", "Défi Millennium") },
      { label: L("Liberté", "Liberté"),                 href: wr("ballpoint", "Liberté") },
      { label: L("Eternity", "Eternity"),               href: wr("ballpoint", "Eternity") },
      { label: L("Colar Marker", "Marker Necklace"),    href: wr("ballpoint", "Marker Necklace") },
    ],
  },
  {
    kind: "section",
    title: L("Rollerball", "Rollerball"),
    allHref: "/c/escrita?usage=rollerball",
    items: [
      { label: L("Line D Eternity", "Line D Eternity"), href: wr("rollerball", "Line D Eternity") },
      { label: L("Line D", "Line D"),                   href: wr("rollerball", "Line D") },
      { label: L("Défi Millennium", "Défi Millennium"), href: wr("rollerball", "Défi Millennium") },
      { label: L("Liberté", "Liberté"),                 href: wr("rollerball", "Liberté") },
      { label: L("Eternity", "Eternity"),               href: wr("rollerball", "Eternity") },
    ],
  },
  {
    kind: "section",
    title: L("Tinta Permanente", "Fountain Pen"),
    allHref: "/c/escrita?usage=fountain",
    items: [
      { label: L("Line D Eternity", "Line D Eternity"), href: wr("fountain", "Line D Eternity") },
      { label: L("Line D", "Line D"),                   href: wr("fountain", "Line D") },
      { label: L("Défi Millennium", "Défi Millennium"), href: wr("fountain", "Défi Millennium") },
      { label: L("Liberté", "Liberté"),                 href: wr("fountain", "Liberté") },
      { label: L("Eternity", "Eternity"),               href: wr("fountain", "Eternity") },
    ],
  },
];

// Explicit allow-list of model lines per category — used by the mobile
// nav's sub-panel to show ONLY the base-line models for a Maison
// (Le Grand Dupont / Ligne 2 / …) and keep the themed sub-collections
// (Géode / Cohiba / DC Comics / …) out of that list. Themed groups
// already live in the desktop mega-menu's Collections column and the
// catalogue page's themed sections.
export const MODEL_COLLECTIONS_BY_CATEGORY: Record<string, readonly string[]> = {
  isqueiros: [
    "Le Grand Dupont",
    "Ligne 2",
    "Ligne 1",
    "Initial",
    "Initial Cinatic",
    "Biggy",
    "Twiggy",
    "Slimmy",
    "Slim 7",
    "Défi Extreme",
    "Windproof",
    "Minijet",
    "Maxijet",
    "Megajet",
    "Table lighter",
    "Torch",
    "Lighter Necklace",
  ],
  escrita: [
    "Line D Eternity",
    "Classique",
    "Défi Millennium",
    "Liberté",
    "Eternity",
    "Marker Necklace",
  ],
  pele: [
    "Apex",
    "X-bag",
    "Riviera",
    "Victoria",
    "Atelier",
    "Firehead",
    "Neo Capsule",
    "Défi Explorer",
    "Classic",
    "Line D",
    "Pen case",
    "Lighter Accessories",
  ],
  acessorios: [
    "Cigar cutter",
    "Cigar case",
    "2 cigar case",
    "3 cigar case",
    "Humidors",
    "Ashtrays",
    "Cufflinks",
    "Money Clips",
    "Tie Clips",
    "Key Holders",
    "Pen Cases",
    "Gas Refills",
    "Pen Refills",
    "Lighter Cases",
    "Notebook",
    "Gift Boxes",
  ],
};

