// S.T. Dupont's four "universes" (the brand's own naming) and the product
// types within each. Accessories is the home for ALL accessory types — the
// smoking/refill items (formerly under Lighters) and the writing-accessory/
// refill items (formerly under Writing) now live only here, grouped into
// titled menu sections. Lighters & Writing keep only their own lines.
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

// Accessory type buttons (reused in the flat list + the menu sections).
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

export const categoryArt: Record<string, CategoryArt> = {
  // Lighters & Writing now show only New Releases + their own product lines.
  isqueiros: {
    art: "L'Art du Feu",
    hero: "/headers/isqueiros.jpg",
    groups: [NEW_RELEASES],
  },
  escrita: {
    art: "L'Art de l'Écriture",
    hero: "/headers/escrita.jpg",
    groups: [NEW_RELEASES],
  },
  pele: {
    art: "L'Art du Voyage",
    hero: "/headers/pele.jpg",
    groups: [
      NEW_RELEASES,
      { label: t("Malas", "Bags"), href: "/t/bags" },
      { label: t("Pequena Marroquinaria", "Small Leather Goods"), href: "/t/small-leather" },
    ],
  },
  acessorios: {
    art: "L'Art de la Séduction",
    hero: "/headers/acessorios.jpg",
    heroPos: "object-center md:object-[center_75%]",
    // Flat list — used by the category-page buttons and the mobile menu.
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
    // Titled columns for the desktop mega-menu (matches st-dupont's layout).
    menuSections: [
      {
        title: t("Novidades", "New Products"),
        items: [
          NEW_RELEASES,
          { label: t("Monograma 1872", "Monogram 1872"), href: "/c/acessorios?col=Monogram%201872" },
          { label: t("Montecristo", "Montecristo"), href: "/c/acessorios?col=Montecristo" },
          { label: t("Fire X", "Fire X"), href: "/c/acessorios?col=Fire%20X" },
        ],
      },
      {
        title: t("Coleções", "Collections"),
        items: [A.cufflinks, A.belts, A.moneyClips, A.keyHolders, A.tieClips],
      },
      {
        title: t("Acessórios para Fumadores", "Smoking Accessories"),
        items: [
          { label: t("Estojos de Charuto e Cigarro", "Cigar & Cigarette Cases"), href: "/t/smoking" },
          { label: t("Cortadores de Charuto", "Cigar Cutters"), href: "/t/smoking" },
          { label: t("Humidores", "Humidors"), href: "/t/smoking" },
          { label: t("Cinzeiros", "Ashtrays"), href: "/t/smoking" },
          A.refillStones,
        ],
      },
      {
        title: t("Acessórios de Escrita", "Writing Accessories"),
        items: [
          A.refillsInks,
          { label: t("Estojos para Canetas", "Pen Cases"), href: "/t/writing-accessories" },
          { label: t("Secretária", "Office"), href: "/t/writing-accessories" },
        ],
      },
    ],
  },
};
