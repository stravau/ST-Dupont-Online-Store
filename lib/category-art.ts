// S.T. Dupont's four "universes" (the brand's own naming) and the product
// types it sells within each — shown in place of the line-up chips.
import type { Locale } from "@/lib/i18n";

type L = Record<Locale, string>;

export interface ArtGroup {
  label: L;
  items?: L[]; // sub-types listed under the label (informational groups)
  href?: string; // locale-relative path → renders as a smart button
}

export interface CategoryArt {
  art: string; // brand term, French — used as-is in both locales
  groups: ArtGroup[];
}

const t = (pt: string, en: string): L => ({ pt, en });

const NEW_RELEASES = (): ArtGroup => ({
  label: t("Novidades", "New Releases"),
  href: "/novidades",
});

export const categoryArt: Record<string, CategoryArt> = {
  isqueiros: {
    art: "L'Art du Feu",
    groups: [
      NEW_RELEASES(),
      {
        label: t("Acessórios para Fumadores", "Smoking Accessories"),
        items: [
          t("Estojos de Charuto", "Cigar Cases"),
          t("Cortadores de Charuto", "Cigar Cutters"),
          t("Cinzeiros", "Ashtrays"),
          t("Humidores", "Humidors"),
        ],
        href: "/fumadores",
      },
      {
        label: t("Recargas & Pedras", "Refills & Stones"),
        href: "/c/acessorios?col=Refill%20%26%20Stones",
      },
    ],
  },
  escrita: {
    art: "L'Art de l'Écriture",
    groups: [
      NEW_RELEASES(),
      {
        label: t("Acessórios de Escrita", "Writing Accessories"),
        items: [
          t("Estojos para Canetas", "Pen Cases"),
          t("Acessórios de Secretária", "Office Accessories"),
          t("Cadernos", "Notebooks"),
        ],
      },
      { label: t("Recargas & Tintas", "Refills & Inks") },
    ],
  },
  pele: {
    art: "L'Art du Voyage",
    groups: [
      NEW_RELEASES(),
      {
        label: t("Malas", "Bags"),
        items: [
          t("Malas de Viagem", "Travel Bags"),
          t("Trabalho", "Business"),
          t("Mochilas", "Backpacks"),
          t("Tiracolo", "Crossbody"),
        ],
      },
      {
        label: t("Pequena Marroquinaria", "Small Leather Goods"),
        items: [
          t("Carteiras", "Wallets"),
          t("Porta-Cartões", "Card Holders"),
          t("Porta-Chaves", "Key Holders"),
        ],
      },
    ],
  },
  acessorios: {
    art: "L'Art de la Séduction",
    groups: [
      NEW_RELEASES(),
      { label: t("Botões de Punho", "Cufflinks") },
      { label: t("Cintos", "Belts") },
      { label: t("Clips de Notas", "Money Clips") },
      { label: t("Porta-Chaves", "Key Holders") },
      { label: t("Molas de Gravata", "Tie Clips") },
    ],
  },
};
