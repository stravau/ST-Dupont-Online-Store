import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";
import { type Product, formatPrice, getNovidadeSkus } from "@/lib/catalog";
import { tipoParaEtiqueta, TIPO_LABEL } from "@/lib/pen-refill-compat";
import { ProductCardInteractive, type CardSwatch } from "@/components/product-card-interactive";
import { compareSwatch } from "@/lib/swatch-order";
import { STORE_LIS, STORE_VNG } from "@/lib/store-info";

export async function ProductCard({
  product,
  lang,
  variantType,
  variantSku,
  emCarril = false,
}: {
  product: Product;
  lang: Locale;
  // When set, this card represents one pen type of the product (e.g. the
  // "Ballpoint" of the Initial line) — title, price and colours scope to it.
  variantType?: string;
  // When set, this card represents one specific colourway (single SKU);
  // colour swatches are hidden — the photo IS the differentiator. Used by
  // the catalogue grids to render one card per (product, colourway) instead
  // of a single tile with picker swatches.
  variantSku?: string;
  // Num carril o cartão ocupa quase todo o ecrã no telemóvel; na grelha são
  // dois por linha. Só serve para o `sizes` da foto dizer a verdade sobre a
  // largura real — não muda nada no aspecto.
  emCarril?: boolean;
}) {
  const dict = getDictionary(lang);
  // O selo "Novidade" deixa de sair do `featured`, que era um sinal antigo e
  // solto, e passa a sair da MESMA lista que alimenta o carrossel das
  // Novidades. Assim o que o site anuncia como novidade e o que la esta, sem
  // duas fontes de verdade a discordarem. A leitura e cacheada, portanto os
  // cartoes de uma grelha nao fazem uma consulta cada um.
  const novidades = await getNovidadeSkus();
  // Overline above the card name = the category (Lighters / Writing / …).
  const categoryLabel =
    ({
      isqueiros: dict.nav.lighters,
      escrita: dict.nav.writing,
      pele: dict.nav.leather,
      acessorios: dict.nav.accessories,
    } as Record<string, string>)[product.categorySlug] ?? product.collection;

  const scoped = variantSku
    ? product.variants.filter((v) => v.sku === variantSku)
    : variantType
      ? product.variants.filter((v) => v.attributes.type?.[lang] === variantType)
      : product.variants;
  const list = scoped.length > 0 ? scoped : product.variants;

  const base = list.reduce((m, v) => (v.priceCents < m.priceCents ? v : m), list[0]);

  // ALWAYS build swatches from the full set of sibling colourways, even
  // when the card is scoped to one (variantSku). The image-based swatch
  // strip below the photo lets the user jump to the same product in a
  // different colour without leaving the card — same product, same
  // model, different finish.
  const variantsForSwatches = variantType
    ? product.variants.filter((v) => v.attributes.type?.[lang] === variantType)
    : product.variants;
  const swatches: CardSwatch[] = [];
  for (const v of variantsForSwatches) {
    const c = v.attributes.color;
    // Dedup colourways by label, BUT always keep the variant this card was
    // rendered for (variantSku) — otherwise a sibling that shares a colour
    // label (e.g. two "Brown" Maki-E designs, dragon vs floral) gets deduped
    // out, `initialSwatch` can't find it, and the card shows the WRONG photo
    // and price while still linking to its own SKU (card ≠ product page).
    if (c && (v.sku === variantSku || !swatches.some((x) => x.label === c.label[lang]))) {
      swatches.push({
        sku: v.sku,
        label: c.label[lang],
        hex: c.hex,
        image: v.image ?? product.image,
        hoverImage: v.images?.[2] ?? null,
        images: v.images && v.images.length ? v.images : v.image ? [v.image] : [],
        price: formatPrice(v.priceCents, v.currency, lang),
      });
    }
  }
  // Nenhuma variante trazia cor. Sem isto o cartão ficava sem swatch nenhum e
  // caía numa única fotografia — sem setas, sem pontos, sem troca no hover —
  // mesmo quando a variante tem cinco fotos. Acontece com tudo o que entra
  // pelo Excel do ERP, que traz `{brand, source}` e nada de cor.
  //
  // Só corre quando NENHUMA tem cor: num produto misto, deixar as sem-cor de
  // fora continua a ser o comportamento certo — são colourways por identificar,
  // não uma linha à parte.
  if (swatches.length === 0) {
    for (const v of variantsForSwatches) {
      swatches.push({
        sku: v.sku,
        label: v.name[lang],
        hex: [],
        image: v.image ?? product.image,
        hoverImage: v.images?.[2] ?? null,
        images: v.images && v.images.length ? v.images : v.image ? [v.image] : [],
        price: formatPrice(v.priceCents, v.currency, lang),
      });
    }
  }

  swatches.sort(compareSwatch);

  // Show a different colourway per card by default (deterministic per item).
  // Prefer a colourway that has a real slideshow (≥2 photos) so cards never
  // open on a flat single-image variant when a multi-photo one is available.
  const initialSwatch = (() => {
    if (!swatches.length) return 0;
    // When scoped to a specific colourway, open on it so the big photo
    // matches the SKU the card was rendered for.
    if (variantSku) {
      const i = swatches.findIndex((s) => s.sku === variantSku);
      if (i >= 0) return i;
    }
    const hash = [...`${product.slug}${variantType ?? ""}${variantSku ?? ""}`].reduce(
      (h, c) => (h * 31 + c.charCodeAt(0)) >>> 0,
      7,
    );
    const slideshowIdx = swatches
      .map((s, i) => ((s.images?.length ?? 0) > 1 ? i : -1))
      .filter((i) => i >= 0);
    const pool = slideshowIdx.length ? slideshowIdx : swatches.map((_, i) => i);
    return pool[hash % pool.length];
  })();

  // Land on the chosen colourway when the user opens the product page —
  // ?v=<sku> primes the variant selector to that specific colour.
  const skuParam = variantSku ?? swatches[initialSwatch]?.sku;
  const qs = [
    variantType ? `t=${encodeURIComponent(variantType)}` : null,
    skuParam ? `v=${encodeURIComponent(skuParam)}` : null,
  ]
    .filter(Boolean)
    .join("&");
  const href = `/${lang}/p/${product.slug}${qs ? `?${qs}` : ""}`;
  // Title is the model/product name — never the colour. The colour is already
  // conveyed by the hero photo and swatch strip, so repeating it in the title
  // ("Leather Case — Violeta") is redundant.
  const title = variantType ? `${product.name[lang]} · ${variantType}` : product.name[lang];

  // Sibling cards of one product all share that title, so the COLOUR is what
  // tells them apart. It goes on the subtitle line (below) — NOT the title,
  // which line-clamps to one row and would hide an appended colour. Only when
  // the product actually renders more than one card (>1 distinct photo);
  // a lone card needs no colour label (the photo already shows it). When two
  // SKUs share the same colour AND price (genuine separate inventory, e.g.
  // slim-7-geode 027035/036 or Line D belts by size) the colour can't
  // disambiguate, so a discreet "· Ref. <SKU>" is appended.
  // Nas canetas o tipo vai sempre por baixo do título, ao lado da cor. Os
  // nomes são compridos — "Line D Eternity · Montecristo · L'Aurore ·
  // Rollerball" — e as reticências comem exactamente o fim, que é onde o tipo
  // está. Duas peças visualmente parecidas ficavam sem nada que as separasse.
  const tipoCaneta =
    product.categorySlug === "escrita"
      ? tipoParaEtiqueta(product.name.pt, product.description.pt, product.slug)
      : null;

  // A variante que ESTE cartão mostra. Decidida aqui em cima porque a cor e a
  // referência abaixo têm de vir os dois dela — antes, a cor saía do `base`
  // (o mais barato do produto) e podia não ser a da fotografia.
  const shownSku = swatches[initialSwatch]?.sku ?? variantSku ?? base.sku;
  const shown = product.variants.find((v) => v.sku === shownSku) ?? base;

  // Cor SEMPRE que a variante a declare — não só quando o produto rende vários
  // cartões, como era. Cartões irmãos mostravam a cor e um artigo de cor única
  // não mostrava nada, e a linha ficava diferente de cartão para cartão sem
  // razão visível para quem olha.
  const detalhe = shown.attributes.color?.label[lang];

  // Tipo · cor. A referência já não entra aqui: vai numa linha própria, para
  // as três informações aparecerem sempre pela mesma ordem em todos os
  // cartões, em vez de a ref surgir ora colada à cor ora não surgir de todo.
  const variantLabel =
    [tipoCaneta ? TIPO_LABEL[tipoCaneta][lang] : null, detalhe].filter(Boolean).join(" · ") ||
    undefined;

  // Disponibilidade da COLOURWAY que este cartão mostra — nunca o máximo do
  // produto. O cartão é fixo numa cor (a de `initialSwatch`, que também é a
  // foto grande), portanto dizer "Disponível em Lisboa" porque uma cor
  // *irmã* tem stock era simplesmente falso. `status` já vem derivado do
  // stock por effectiveStatus() em lib/catalog.
  const isIndisponivel = shown.status !== "DISPONIVEL";
  const cardLis = shown.stockLis ?? 0;
  const cardVng = shown.stockVng ?? 0;
  const stockLabel =
    cardLis > 0 && cardVng > 0
      ? dict.product.availabilityBoth
      : cardLis > 0
        ? dict.product.availabilityInStore.replace("{store}", STORE_LIS.labels[lang].short)
        : cardVng > 0
          ? dict.product.availabilityInStore.replace("{store}", STORE_VNG.labels[lang].short)
          : dict.product.availabilityOnRequest;
  const availableLabel = isIndisponivel ? dict.common.unavailable : stockLabel;

  return (
    <ProductCardInteractive
      href={href}
      seed={product.slug}
      title={title}
      collection={categoryLabel}
      variantLabel={variantLabel}
      refLabel={shown.sku}
      noveltyLabel={novidades.includes(shown.sku) ? dict.sections.noveltyTag : null}
      availableLabel={availableLabel}
      indisponivel={isIndisponivel}
      fromLabel={dict.product.from}
      colorWord={dict.product.colorLabel.toLowerCase()}
      fallbackImage={product.image}
      swatches={swatches}
      basePrice={formatPrice(base.priceCents, base.currency, lang)}
      baseSku={base.sku}
      initialSwatch={initialSwatch}
      emCarril={emCarril}
      inquireLabel={dict.product.inquire}
      inquireSubject={dict.product.inquireSubject}
      inquireBody={dict.product.inquireBody}
    />
  );
}
