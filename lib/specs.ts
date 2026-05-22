// Builds a factual, per-item specification list from the catalogue data we
// actually hold (collection, pen/lighter type, colourways, finishes) plus
// well-documented S.T. Dupont facts (founded 1872 Paris; lighters & writing
// instruments manufactured at Faverges, Haute-Savoie, France; signature
// Chinese natural lacquer; refillable mechanisms; international guarantee).
// No invented dimensions or weights — only what can be stated truthfully.
import type { Product, Category, Localized } from "@/lib/catalog";
import type { Locale } from "@/lib/i18n";

export interface Spec {
  label: string;
  value: string;
}

const L = (pt: string, en: string): Localized => ({ pt, en });

// Map a finish/colour label (matched on its English text) to a material.
const MATERIALS: { test: RegExp; name: Localized }[] = [
  { test: /lacquer|laca/i, name: L("Laca natural da China", "Chinese natural lacquer") },
  { test: /palladium|paládio/i, name: L("Paládio", "Palladium") },
  { test: /(yellow |pink |rose )?gold|ouro|dourado/i, name: L("Acabamento a ouro", "Gold finish") },
  { test: /chrome|crómio|cromio/i, name: L("Crómio", "Chrome") },
  { test: /gun ?metal|gun\b/i, name: L("Gunmetal", "Gunmetal") },
  { test: /carbon|carbono/i, name: L("Fibra de carbono", "Carbon fibre") },
  { test: /steel|aço/i, name: L("Aço inoxidável", "Stainless steel") },
  { test: /leather|pele|couro/i, name: L("Pele", "Leather") },
  { test: /diamond|diamante/i, name: L("Talhe ponta de diamante", "Diamond-head guilloché") },
];

function uniq(arr: string[]): string[] {
  return Array.from(new Set(arr.filter(Boolean)));
}

export function buildSpecs(product: Product, category: Category, locale: Locale): Spec[] {
  const t = (l: Localized) => l[locale];
  const v = product.variants;

  // Distinct pen/lighter types and colour/finish labels present.
  const types = uniq(v.map((x) => (x.attributes.type ? t(x.attributes.type) : "")));
  const finishes = uniq(
    v.map((x) =>
      x.attributes.color ? t(x.attributes.color.label) : x.attributes.finish ? t(x.attributes.finish) : "",
    ),
  );

  // Materials inferred from every colour + finish + type label on the product.
  const haystack = v
    .flatMap((x) => [
      x.attributes.color ? x.attributes.color.label.en : "",
      x.attributes.finish?.en ?? "",
      x.attributes.type?.en ?? "",
    ])
    .join(" ");
  const materials = uniq(
    MATERIALS.filter((m) => m.test.test(haystack)).map((m) => t(m.name)),
  );

  const specs: Spec[] = [];
  const push = (label: Localized, value: string) => {
    if (value) specs.push({ label: t(label), value });
  };

  push(L("Maison", "Maison"), "S.T. Dupont · Paris, 1872");
  push(L("Coleção", "Collection"), product.collection);
  push(L("Categoria", "Category"), t(category.name));

  if (category.slug === "escrita") {
    push(L("Instrumento", "Instrument"), types.join(" · "));
    push(L("Recarga", "Refill"), t(L("Recarregável (recargas S.T. Dupont)", "Refillable (S.T. Dupont refills)")));
    if (types.some((x) => /permanente|fountain/i.test(x))) {
      push(
        L("Caneta de tinta permanente", "Fountain pen"),
        t(L("Cartucho ou conversor", "Cartridge or converter")),
      );
    }
    push(L("Fabrico", "Crafted"), t(L("Faverges, França", "Faverges, France")));
  } else if (category.slug === "isqueiros") {
    push(L("Tipo", "Type"), t(L("Isqueiro de luxo", "Luxury lighter")));
    push(L("Recarga", "Refill"), t(L("Recarregável a gás", "Refillable (butane gas)")));
    push(L("Fabrico", "Crafted"), t(L("Faverges, França", "Faverges, France")));
  } else if (category.slug === "pele") {
    push(L("Tipo", "Type"), t(L("Marroquinaria", "Leather goods")));
    push(L("Saber-fazer", "Savoir-faire"), t(L("Curtimenta e costura S.T. Dupont", "S.T. Dupont tanning & stitching")));
  } else {
    push(L("Tipo", "Type"), t(L("Acessório", "Accessory")));
  }

  push(L("Materiais", "Materials"), materials.join(" · "));
  push(L("Acabamentos", "Finishes"), finishes.join(" · "));
  push(
    L("Referências", "References"),
    `${v.length} ${t(L(v.length === 1 ? "referência" : "referências", v.length === 1 ? "reference" : "references"))}`,
  );
  push(L("Conservação", "Care"), t(L("Limpar com pano macio e seco", "Wipe with a soft, dry cloth")));
  push(L("Garantia", "Guarantee"), t(L("Garantia internacional S.T. Dupont", "S.T. Dupont international guarantee")));

  return specs;
}
