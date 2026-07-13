// Product-type destinations for the category "L'Art" strips. Each group has
// a base category and either a flat `match` (predicate over Product) or a
// list of `types`, each with its own matcher. Rendered by /[lang]/t/[group].
//
// Why matchers instead of slug lists? The catalogue holds 350+ products and
// grows with every scrape. Keeping a hand-curated list of slugs per type in
// sync was impossible — most type pages were rendering 0-2 items even though
// the catalogue had 5-25 matching products. Slug-pattern matchers pull from
// the live category and stay correct as products are added.
import type { Locale } from "@/lib/i18n";
import type { CategorySlug, Product } from "@/lib/catalog";

type L = Record<Locale, string>;
const t = (pt: string, en: string): L => ({ pt, en });

export type GroupMatch = (p: Product) => boolean;

export interface GroupType {
  key: string;
  label: L;
  match: GroupMatch;
}
export interface ProductGroup {
  id: string;
  title: L;
  eyebrow: string; // the universe (French), shown as overline
  categorySlug: CategorySlug; // base category whose products feed this group
  types?: GroupType[];
  match?: GroupMatch; // flat groups
}

// Helpers — slug-anchored regex keeps each matcher tight and predictable.
const re = (pattern: RegExp): GroupMatch => (p) => pattern.test(p.slug);

// Cigar cutters: the official slugs are `cigar-cutter*` plus the catalogue
// scrape's raw `cutter-NNNNN` IDs. Cases use "cigar-case" / "N-cigar-case" /
// "cigarette-case"; excluded from cutters to avoid double-counting.
const isCutter = re(/^cigar-cutter|^cutter-\d/);
// Split the cases by capacity so the "2 / 3 Cigar Case" buttons list EVERY
// case of that capacity regardless of theme (Dragon, Cohiba, Monogram, Koi…).
// These are checked BEFORE the general `cases` type (first match wins), so the
// remaining `isCigarCase` only needs to cover single cigar cases (cigar-case-N)
// and cigarette cases — NOT the 2-/3-/double- capacity slugs.
const is2CigarCase = re(/^(?:2-cigar-case|double-cigar-case)/);
const is3CigarCase = re(/^3-cigar-case/);
const isCigarCase = re(/^cigar-case|^cigarette-case/);
const isAshtray = re(/^ashtray/);
const isHumidor = re(/humidor/);

const isPenCase = re(/^pen-case/);
const isNotebook = re(/^notebook/);

// Refills & Stones (L'Art du Feu) is GAS refills + flints/stones ONLY. The box
// collections are mostly mislabelled "Gas Refills" in the data, but the slug is
// reliable: box-12 + gas-refill = gas; box-8 = flints/stones (col "Refills &
// Stones"); box-10/5/7 = rollerball/lead/ink/ballpoint pen refills, which
// belong under Refills & Inks (writing), not here.
const isGasOrStone = re(/^(?:gas-refill|stones|box-(?:8|12)-refills)/);
const isInkOrRefill = re(/^(?:ink-bottle|inkwell|rollerball-refill|pen-refill|box-(?:5|7|10)-refills)/);

const isCufflink = re(/^cufflink/);
// Belts: match "belt" as a slug segment (line-d-2-belt, line-d-2-reversible-
// belt, line-d-reversible-belt, classic-belt) plus the Autolock line.
const isBelt = re(/(?:^|-)belt(?:$|-)|autolock/);
const isMoneyClip = re(/money-clip/);
const isKeyHolder = re(/^(?:key-ring|keyring|leather-key-holder)|^keyrings/);
const isTieClip = re(/tie-clip/);

// These keywords appear mid-slug (atelier-3-travel-bag, classic-briefcase,
// neo-capsule-2-document-holder), so match the segment anywhere, not just at
// the start — otherwise Travel/Business surface only the handful of slugs that
// happen to lead with the keyword (e.g. travel-bags-fender).
const isTravelBag = re(/travel-bag|weekend-bag/);
const isBusinessBag = re(/briefcase|document-holder|conference-pad|messenger/);
const isBackpack = re(/backpack/);
const isCrossbody = re(/crossbody|camera-bag/);
// New bag types added to mirror the official navbar's MEN / WOMEN columns.
// Some won't match anything in the current catalogue — that's intentional
// per user direction ("leave names that don't match"). Pages render empty
// gracefully until the catalogue expands to cover these.
const isToteBag = re(/^cabas|tote/);
const isPouch = re(/pouch/);
const isHandBag = re(/handbag|hand-bag/);
const isShoulderBag = re(/shoulder/);
const isBaguetteBag = re(/baguette/);

const isWallet = re(/wallet/);
const isCardHolder = re(/card-holder/);
// key-ring appears mid-slug (atelier-2-key-ring, neo-capsule-2-key-ring), so
// match the segment anywhere rather than as a whole-slug anchor.
const isLeatherKeyHolder = re(/key-ring|key-holder/);

// Display order for accessory-type sections on the /c/acessorios page. The
// category groups by detected type (so all cigar cases sit together regardless
// of their `collection`); this list dictates which header comes first.
export const ACC_SECTION_ORDER: string[] = [
  "smoking-cutters",
  "smoking-2-cigar-cases",
  "smoking-3-cigar-cases",
  "smoking-cases",
  "smoking-ashtrays",
  "smoking-humidors",
  "refill-stones",
  "writing-accessories-pen-cases",
  "writing-accessories-notebooks",
  "refills-inks",
  "cufflinks",
  "belts",
  "money-clips",
  "key-holders",
  "tie-clips",
];

// Returns the human label of the type a product belongs to, plus a stable
// section key (used for ordering). Search order: types within each group
// (first match wins), then flat groups. Returns null if nothing matches —
// the category page falls back to the product's collection field.
export function getProductType(
  p: Product,
  locale: Locale,
): { key: string; label: string } | null {
  for (const g of Object.values(productGroups)) {
    if (g.categorySlug !== p.categorySlug) continue;
    if (g.types) {
      for (const ty of g.types) {
        if (ty.match(p)) return { key: `${g.id}-${ty.key}`, label: ty.label[locale] };
      }
    } else if (g.match?.(p)) {
      return { key: g.id, label: g.title[locale] };
    }
  }
  return null;
}

export const productGroups: Record<string, ProductGroup> = {
  // ---- L'Art du Feu ----
  smoking: {
    id: "smoking",
    title: t("Acessórios para Fumadores", "Smoking Accessories"),
    eyebrow: "L'Art du Feu",
    categorySlug: "acessorios",
    types: [
      { key: "cutters", label: t("Cortadores de Charuto", "Cigar Cutters"), match: isCutter },
      { key: "2-cigar-cases", label: t("Estojos 2 Charutos", "2-Cigar Cases"), match: is2CigarCase },
      { key: "3-cigar-cases", label: t("Estojos 3 Charutos", "3-Cigar Cases"), match: is3CigarCase },
      { key: "cases", label: t("Estojos de Charuto", "Cigar Cases"), match: isCigarCase },
      { key: "ashtrays", label: t("Cinzeiros", "Ashtrays"), match: isAshtray },
      { key: "humidors", label: t("Humidores", "Humidors"), match: isHumidor },
    ],
  },
  "refill-stones": {
    id: "refill-stones",
    title: t("Recargas & Pedras", "Refills & Stones"),
    eyebrow: "L'Art du Feu",
    categorySlug: "acessorios",
    match: isGasOrStone,
  },
  // Lighter necklaces live under /c/isqueiros but sit in different collections
  // (lighter-necklace → "Colar Isqueiro", dc-comics-necklace → "DC Comics").
  // A slug matcher surfaces them all under one "Lighter Necklace" destination.
  "lighter-necklace": {
    id: "lighter-necklace",
    title: t("Colar Isqueiro", "Lighter Necklace"),
    eyebrow: "L'Art du Feu",
    categorySlug: "isqueiros",
    match: re(/necklace/),
  },

  // ---- L'Art de l'Écriture ----
  "writing-accessories": {
    id: "writing-accessories",
    title: t("Acessórios de Escrita", "Writing Accessories"),
    eyebrow: "L'Art de l'Écriture",
    categorySlug: "acessorios",
    types: [
      { key: "pen-cases", label: t("Estojos para Canetas", "Pen Cases"), match: isPenCase },
      { key: "notebooks", label: t("Cadernos", "Notebooks"), match: isNotebook },
    ],
  },
  "refills-inks": {
    id: "refills-inks",
    title: t("Recargas & Tintas", "Refills & Inks"),
    eyebrow: "L'Art de l'Écriture",
    categorySlug: "acessorios",
    match: isInkOrRefill,
  },

  // ---- L'Art du Voyage ----
  bags: {
    id: "bags",
    title: t("Malas", "Bags"),
    eyebrow: "L'Art du Voyage",
    categorySlug: "pele",
    types: [
      { key: "travel", label: t("Viagem", "Travel"), match: isTravelBag },
      { key: "business", label: t("Trabalho", "Business"), match: isBusinessBag },
      { key: "backpacks", label: t("Mochilas", "Backpacks"), match: isBackpack },
      { key: "crossbody", label: t("Tiracolo", "Crossbody"), match: isCrossbody },
      { key: "tote", label: t("Tote", "Tote"), match: isToteBag },
      { key: "pouches", label: t("Bolsas", "Pouches"), match: isPouch },
      { key: "hand-bag", label: t("Mala de Mão", "Hand Bag"), match: isHandBag },
      { key: "shoulder-bag", label: t("Mala de Ombro", "Shoulder Bag"), match: isShoulderBag },
      { key: "baguette", label: t("Baguette", "Baguette"), match: isBaguetteBag },
    ],
  },
  "small-leather": {
    id: "small-leather",
    title: t("Pequena Marroquinaria", "Small Leather Goods"),
    eyebrow: "L'Art du Voyage",
    categorySlug: "pele",
    types: [
      { key: "wallets", label: t("Carteiras", "Wallets"), match: isWallet },
      { key: "card-holders", label: t("Porta-Cartões", "Card Holders"), match: isCardHolder },
      { key: "key-holders", label: t("Porta-Chaves", "Key Holders"), match: isLeatherKeyHolder },
    ],
  },

  // ---- L'Art de la Séduction ----
  cufflinks: {
    id: "cufflinks",
    title: t("Botões de Punho", "Cufflinks"),
    eyebrow: "L'Art de la Séduction",
    categorySlug: "acessorios",
    match: isCufflink,
  },
  belts: {
    id: "belts",
    title: t("Cintos", "Belts"),
    eyebrow: "L'Art de la Séduction",
    // Belts are leather goods — the Line D belts route to /c/pele; autolock +
    // line-d-reversible-belt are forced there too (see CATEGORY_OVERRIDES).
    categorySlug: "pele",
    match: isBelt,
  },
  "money-clips": {
    id: "money-clips",
    title: t("Clips de Notas", "Money Clips"),
    eyebrow: "L'Art de la Séduction",
    categorySlug: "acessorios",
    match: isMoneyClip,
  },
  "key-holders": {
    id: "key-holders",
    title: t("Porta-Chaves", "Key Holders"),
    eyebrow: "L'Art de la Séduction",
    categorySlug: "acessorios",
    match: isKeyHolder,
  },
  "tie-clips": {
    id: "tie-clips",
    title: t("Molas de Gravata", "Tie Clips"),
    eyebrow: "L'Art de la Séduction",
    categorySlug: "acessorios",
    match: isTieClip,
  },
};
