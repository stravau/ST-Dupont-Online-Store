// S.T. Dupont's four "universes" (the brand's own naming) and the product
// types it sells within each — every type is a smart button that opens its
// own page (see lib/product-groups.ts + /[lang]/t/[group]).
import type { Locale } from "@/lib/i18n";

type L = Record<Locale, string>;

export interface ArtGroup {
  label: L;
  href: string; // locale-relative path → smart button
}

export interface CategoryArt {
  art: string; // brand term, French — used as-is in both locales
  hero?: string; // optional /public path to a full-bleed header photo
  heroPos?: string; // Tailwind bg-position for the hero (default bg-center)
  groups: ArtGroup[];
}

const t = (pt: string, en: string): L => ({ pt, en });
const NEW_RELEASES: ArtGroup = { label: t("Novidades", "New Releases"), href: "/novidades" };

export const categoryArt: Record<string, CategoryArt> = {
  isqueiros: {
    art: "L'Art du Feu",
    hero: "/headers/isqueiros.jpg",
    groups: [
      NEW_RELEASES,
      { label: t("Acessórios para Fumadores", "Smoking Accessories"), href: "/t/smoking" },
      { label: t("Recargas & Pedras", "Refills & Stones"), href: "/t/refill-stones" },
    ],
  },
  escrita: {
    art: "L'Art de l'Écriture",
    hero: "/headers/escrita.jpg",
    groups: [
      NEW_RELEASES,
      { label: t("Acessórios de Escrita", "Writing Accessories"), href: "/t/writing-accessories" },
      { label: t("Recargas & Tintas", "Refills & Inks"), href: "/t/refills-inks" },
    ],
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
    // Show the lower part of the photo on desktop (subject sits low)
    heroPos: "bg-center md:bg-bottom",
    groups: [
      NEW_RELEASES,
      { label: t("Botões de Punho", "Cufflinks"), href: "/t/cufflinks" },
      { label: t("Cintos", "Belts"), href: "/t/belts" },
      { label: t("Clips de Notas", "Money Clips"), href: "/t/money-clips" },
      { label: t("Porta-Chaves", "Key Holders"), href: "/t/key-holders" },
      { label: t("Molas de Gravata", "Tie Clips"), href: "/t/tie-clips" },
    ],
  },
};
