// Smoking-accessory types and the products that belong to each.
import type { Locale } from "@/lib/i18n";

type L = Record<Locale, string>;

export interface SmokingType {
  key: string;
  label: L;
  slugs: string[];
}

export const smokingTypes: SmokingType[] = [
  {
    key: "cutters",
    label: { pt: "Cortadores de Charuto", en: "Cigar Cutters" },
    slugs: ["cigar-cutter-fire-x"],
  },
  {
    key: "cases",
    label: { pt: "Estojos de Charuto", en: "Cigar Cases" },
    slugs: ["cigar-case"],
  },
  {
    key: "ashtrays",
    label: { pt: "Cinzeiros", en: "Ashtrays" },
    slugs: ["ashtray-fire-x"],
  },
  {
    key: "humidors",
    label: { pt: "Humidores", en: "Humidors" },
    slugs: ["humidor"],
  },
];
