// Product-type destinations for the category "L'Art" strips. Each group is
// either a flat list of products or a set of sub-types (rendered as a
// selector). Every leaf has >= 2 real products. Rendered by /[lang]/t/[group].
import type { Locale } from "@/lib/i18n";

type L = Record<Locale, string>;
const t = (pt: string, en: string): L => ({ pt, en });

export interface GroupType {
  key: string;
  label: L;
  slugs: string[];
}
export interface ProductGroup {
  id: string;
  title: L;
  eyebrow: string; // the universe (French), shown as overline
  types?: GroupType[];
  slugs?: string[];
}

export const productGroups: Record<string, ProductGroup> = {
  // ---- L'Art du Feu ----
  smoking: {
    id: "smoking",
    title: t("Acessórios para Fumadores", "Smoking Accessories"),
    eyebrow: "L'Art du Feu",
    types: [
      { key: "cutters", label: t("Cortadores de Charuto", "Cigar Cutters"), slugs: ["cigar-cutter-fire-x", "cigar-cutter-v"] },
      { key: "cases", label: t("Estojos de Charuto", "Cigar Cases"), slugs: ["cigar-case", "cigar-case-double"] },
      { key: "ashtrays", label: t("Cinzeiros", "Ashtrays"), slugs: ["ashtray-fire-x", "ashtray-porcelain"] },
      { key: "humidors", label: t("Humidores", "Humidors"), slugs: ["humidor", "humidor-travel"] },
    ],
  },
  "refill-stones": {
    id: "refill-stones",
    title: t("Recargas & Pedras", "Refills & Stones"),
    eyebrow: "L'Art du Feu",
    slugs: ["gas-refill", "stones"],
  },

  // ---- L'Art de l'Écriture ----
  "writing-accessories": {
    id: "writing-accessories",
    title: t("Acessórios de Escrita", "Writing Accessories"),
    eyebrow: "L'Art de l'Écriture",
    types: [
      { key: "pen-cases", label: t("Estojos para Canetas", "Pen Cases"), slugs: ["pen-case-single", "pen-case-double"] },
      { key: "office", label: t("Secretária", "Office"), slugs: ["desk-blotter", "pen-tray"] },
      { key: "notebooks", label: t("Cadernos", "Notebooks"), slugs: ["notebook-a5", "notebook-pocket"] },
    ],
  },
  "refills-inks": {
    id: "refills-inks",
    title: t("Recargas & Tintas", "Refills & Inks"),
    eyebrow: "L'Art de l'Écriture",
    slugs: ["ink-bottle", "rollerball-refill"],
  },

  // ---- L'Art du Voyage ----
  bags: {
    id: "bags",
    title: t("Malas", "Bags"),
    eyebrow: "L'Art du Voyage",
    types: [
      { key: "travel", label: t("Viagem", "Travel"), slugs: ["travel-bag", "weekend-bag"] },
      { key: "business", label: t("Trabalho", "Business"), slugs: ["defi-explorer-document-holder", "briefcase"] },
      { key: "backpacks", label: t("Mochilas", "Backpacks"), slugs: ["defi-explorer-backpack", "urban-backpack"] },
      { key: "crossbody", label: t("Tiracolo", "Crossbody"), slugs: ["crossbody-bag", "compact-crossbody"] },
    ],
  },
  "small-leather": {
    id: "small-leather",
    title: t("Pequena Marroquinaria", "Small Leather Goods"),
    eyebrow: "L'Art du Voyage",
    types: [
      { key: "wallets", label: t("Carteiras", "Wallets"), slugs: ["apex-wallet", "leather-wallet"] },
      { key: "card-holders", label: t("Porta-Cartões", "Card Holders"), slugs: ["apex-card-holder", "slim-card-holder"] },
      { key: "key-holders", label: t("Porta-Chaves", "Key Holders"), slugs: ["key-ring", "leather-key-holder"] },
    ],
  },

  // ---- L'Art de la Séduction ----
  cufflinks: {
    id: "cufflinks",
    title: t("Botões de Punho", "Cufflinks"),
    eyebrow: "L'Art de la Séduction",
    slugs: ["cufflinks-montecristo-aurore", "classic-cufflinks"],
  },
  belts: {
    id: "belts",
    title: t("Cintos", "Belts"),
    eyebrow: "L'Art de la Séduction",
    slugs: ["belt", "classic-belt"],
  },
  "money-clips": {
    id: "money-clips",
    title: t("Clips de Notas", "Money Clips"),
    eyebrow: "L'Art de la Séduction",
    slugs: ["money-clip", "engraved-money-clip"],
  },
  "key-holders": {
    id: "key-holders",
    title: t("Porta-Chaves", "Key Holders"),
    eyebrow: "L'Art de la Séduction",
    slugs: ["key-ring", "leather-key-holder"],
  },
  "tie-clips": {
    id: "tie-clips",
    title: t("Molas de Gravata", "Tie Clips"),
    eyebrow: "L'Art de la Séduction",
    slugs: ["tie-clip", "classic-tie-clip"],
  },
};
