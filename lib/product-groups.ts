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
const isCigarCase = re(/^(?:\d+-)?cigar-case|^cigarette-case|^cigar-case-/);
const isAshtray = re(/^ashtray/);
const isHumidor = re(/humidor/);

const isPenCase = re(/^pen-case/);
const isOffice = re(/^(?:desk-blotter|pen-tray)$/);
const isNotebook = re(/^notebook/);

const isGasOrStone = re(/^(?:gas-refill|stones|box-\d+-refills)/);
const isInkOrRefill = re(/^(?:ink-bottle|inkwell|rollerball-refill|pen-refill)/);

const isCufflink = re(/^cufflink/);
const isBelt = re(/^belt$|^classic-belt$/);
const isMoneyClip = re(/money-clip/);
const isKeyHolder = re(/^(?:key-ring|keyring|leather-key-holder)|^keyrings/);
const isTieClip = re(/tie-clip/);

const isTravelBag = re(/^(?:travel-bag|travel-bags|weekend-bag|cabas)/);
const isBusinessBag = re(/^(?:briefcase|defi-explorer-document-holder|document-holders)/);
const isBackpack = re(/backpack/);
const isCrossbody = re(/crossbody|camera-bag/);

const isWallet = re(/wallet/);
const isCardHolder = re(/card-holder/);
const isLeatherKeyHolder = re(/^(?:leather-key-holder|key-ring)$/);

export const productGroups: Record<string, ProductGroup> = {
  // ---- L'Art du Feu ----
  smoking: {
    id: "smoking",
    title: t("Acessórios para Fumadores", "Smoking Accessories"),
    eyebrow: "L'Art du Feu",
    categorySlug: "acessorios",
    types: [
      { key: "cutters", label: t("Cortadores de Charuto", "Cigar Cutters"), match: isCutter },
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

  // ---- L'Art de l'Écriture ----
  "writing-accessories": {
    id: "writing-accessories",
    title: t("Acessórios de Escrita", "Writing Accessories"),
    eyebrow: "L'Art de l'Écriture",
    categorySlug: "acessorios",
    types: [
      { key: "pen-cases", label: t("Estojos para Canetas", "Pen Cases"), match: isPenCase },
      { key: "office", label: t("Secretária", "Office"), match: isOffice },
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
    categorySlug: "acessorios",
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
