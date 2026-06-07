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
    groups: [
      NEW_RELEASES,
      { label: t("Géode", "Géode"), href: "/c/isqueiros?col=G%C3%A9ode" },
      { label: t("Popote", "Popote"), href: "/c/isqueiros?col=Popote" },
      { label: t("Maki-e", "Maki-e"), href: "/c/isqueiros?col=Maki-e" },
      { label: t("Orlinski", "Orlinski"), href: "/c/isqueiros?col=Orlinski" },
      { label: t("Horse Mane", "Horse Mane"), href: "/c/isqueiros?col=Horse%20Mane" },
      { label: t("Fender", "Fender"), href: "/c/isqueiros?col=Fender" },
      { label: t("Fuente", "Fuente"), href: "/c/isqueiros?col=Fuente" },
      { label: t("Fire X", "Fire X"), href: "/c/isqueiros?col=Fire%20X" },
      { label: t("Cohiba Behike", "Cohiba Behike"), href: "/c/isqueiros?col=Cohiba%20Behike" },
      { label: t("Stones of Fortune", "Stones of Fortune"), href: "/c/isqueiros?col=Stones%20of%20Fortune" },
      { label: t("Romeo y Julieta", "Romeo y Julieta"), href: "/c/isqueiros?col=Romeo%20y%20Julieta" },
      { label: t("Haute Création", "Haute Création"), href: "/c/isqueiros?col=Haute%20Cr%C3%A9ation" },
      { label: t("Joker", "Joker"), href: "/c/isqueiros?col=Joker" },
      { label: t("Harley Quinn", "Harley Quinn"), href: "/c/isqueiros?col=Harley%20Quinn" },
      { label: t("Monograma 1872", "Monogram 1872"), href: "/c/isqueiros?col=Monogram%201872" },
      { label: t("DC Comics", "DC Comics"), href: "/c/isqueiros?col=DC%20Comics" },
      { label: t("20.000 Léguas", "20,000 Leagues"), href: "/c/isqueiros?col=20%2C000%20Leagues%20Under%20The%20Sea" },
    ],
  },
  escrita: {
    art: "L'Art de l'Écriture",
    hero: "/headers/escrita.jpg",
    groups: [
      NEW_RELEASES,
      { label: t("Popote", "Popote"), href: "/c/escrita?col=Popote" },
      { label: t("Géode", "Géode"), href: "/c/escrita?col=G%C3%A9ode" },
      { label: t("Orlinski", "Orlinski"), href: "/c/escrita?col=Orlinski" },
      { label: t("Snake Skin", "Snake Skin"), href: "/c/escrita?col=Snake%20Skin" },
      { label: t("Horse Mane", "Horse Mane"), href: "/c/escrita?col=Horse%20Mane" },
      { label: t("Joker", "Joker"), href: "/c/escrita?col=Joker" },
      { label: t("Harley Quinn", "Harley Quinn"), href: "/c/escrita?col=Harley%20Quinn" },
      { label: t("Montecristo", "Montecristo"), href: "/c/escrita?col=Montecristo" },
      { label: t("Monograma 1872", "Monogram 1872"), href: "/c/escrita?col=Monogram%201872" },
      { label: t("20.000 Léguas", "20,000 Leagues"), href: "/c/escrita?col=20%2C000%20Leagues%20Under%20The%20Sea" },
    ],
  },
  pele: {
    art: "L'Art du Voyage",
    hero: "/headers/pele.jpg",
    groups: [
      NEW_RELEASES,
      { label: t("Apex", "Apex"), href: "/c/pele?col=Apex" },
      { label: t("X-bag", "X-bag"), href: "/c/pele?col=X-bag" },
      { label: t("Riviera", "Riviera"), href: "/c/pele?col=Riviera" },
      { label: t("Victoria", "Victoria"), href: "/c/pele?col=Victoria" },
      { label: t("Atelier", "Atelier"), href: "/c/pele?col=Atelier" },
      { label: t("Firehead", "Firehead"), href: "/c/pele?col=Firehead" },
      { label: t("Neo Capsule", "Neo Capsule"), href: "/c/pele?col=Neo%20Capsule" },
      { label: t("Défi Explorer", "Défi Explorer"), href: "/c/pele?col=D%C3%A9fi%20Explorer" },
      { label: t("Classic", "Classic"), href: "/c/pele?col=Classic" },
      { label: t("Monograma 1872", "Monogram 1872"), href: "/c/pele?col=Monogram%201872" },
      { label: t("Fender", "Fender"), href: "/c/pele?col=Fender" },
      { label: t("Fuente", "Fuente"), href: "/c/pele?col=Fuente" },
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
