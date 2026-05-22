// Builds a factual specification list for ONE variant (the selected
// colourway) of a product, from the catalogue data we actually hold
// (collection, pen/lighter type, this variant's colourway + finish) plus
// well-documented S.T. Dupont facts (founded 1872 Paris; lighters & writing
// instruments manufactured at Faverges, Haute-Savoie, France; signature
// Chinese natural lacquer; refillable mechanisms; international guarantee).
// No invented dimensions or weights — only what can be stated truthfully.
import type { Product, Category, Variant, Localized } from "@/lib/catalog";
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

export function buildSpecs(
  product: Product,
  category: Category,
  variant: Variant,
  locale: Locale,
): Spec[] {
  const t = (l: Localized) => l[locale];
  const a = variant.attributes;
  const type = a.type ? t(a.type) : "";
  const colour = a.color ? t(a.color.label) : a.finish ? t(a.finish) : "";

  // Materials inferred from THIS variant's colour + finish + type labels.
  const haystack = [a.color?.label.en ?? "", a.finish?.en ?? "", a.type?.en ?? ""].join(" ");
  const materials = uniq(MATERIALS.filter((m) => m.test.test(haystack)).map((m) => t(m.name)));

  const specs: Spec[] = [];
  const push = (label: Localized, value: string) => {
    if (value) specs.push({ label: t(label), value });
  };

  push(L("Maison", "Maison"), "S.T. Dupont · Paris, 1872");
  push(L("Coleção", "Collection"), product.collection);
  push(L("Categoria", "Category"), t(category.name));

  if (category.slug === "escrita") {
    push(L("Instrumento", "Instrument"), type);
    if (/permanente|fountain/i.test(type)) {
      push(L("Aparo", "Nib"), t(L("Aço inoxidável", "Stainless steel")));
      push(L("Sistema", "Filling system"), t(L("Cartucho ou conversor", "Cartridge or converter")));
    } else {
      push(L("Recarga", "Refill"), t(L("Recarregável (recargas S.T. Dupont)", "Refillable (S.T. Dupont refills)")));
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

  push(L("Cor / Acabamento", "Colour / Finish"), colour);
  push(L("Materiais", "Materials"), materials.join(" · "));
  push(L("Referência", "Reference"), variant.sku);
  push(L("Conservação", "Care"), t(L("Limpar com pano macio e seco", "Wipe with a soft, dry cloth")));
  push(L("Garantia", "Guarantee"), t(L("Garantia internacional S.T. Dupont", "S.T. Dupont international guarantee")));

  return specs;
}
