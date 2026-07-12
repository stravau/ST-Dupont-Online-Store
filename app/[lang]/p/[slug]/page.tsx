import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, getDictionary, locales, type Locale } from "@/lib/i18n";
import {
  getProduct,
  getCategory,
  getRelatedProducts,
  getMostViewed,
  getProductsByVariantSkus,
  expandProductCards,
  formatPrice,
} from "@/lib/catalog";
import { parseCompatibleRefs } from "@/lib/compatibility";
import { localeCategorySlug } from "@/lib/category-slugs";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { StatusPill } from "@/components/status-pill";
import { ProductCard } from "@/components/product-card";
import { ProductDetail } from "@/components/product-detail";
import { SimilarProducts } from "@/components/similar-products";
import { TrackProductView } from "@/components/track-product-view";
import { buildSpecs } from "@/lib/specs";
import { CONTACT_ANCHOR, STORE_LIS, STORE_VNG } from "@/lib/store-info";
import { buildProductJsonLd } from "@/lib/product-jsonld";
import { AgeGate } from "@/components/age-gate";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const product = await getProduct(slug);
  if (!isLocale(lang) || !product) return {};
  const locale = lang as Locale;
  const title = product.name[locale];
  const full = product.description[locale] ?? "";
  // Google truncates ~160 chars — pull the first sentence (or first
  // 157 chars + ellipsis) rather than stuffing the entire body.
  const firstSentence = full.split(/(?<=[.!?])\s/)[0] ?? full;
  const description = firstSentence.length > 160
    ? firstSentence.slice(0, 157) + "…"
    : firstSentence;
  const ogImage = product.image ?? "/hero/homepage-bg.jpg";
  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/p/${slug}`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}/p/${slug}`])),
    },
    openGraph: {
      title,
      description,
      url: `/${locale}/p/${slug}`,
      images: [ogImage],
      locale: locale === "pt" ? "pt_PT" : "en_GB",
      type: "website",
    },
  };
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; slug: string }>;
  searchParams: Promise<{ t?: string; v?: string }>;
}) {
  const { lang, slug } = await params;
  const { t: typeParam, v: skuParam } = await searchParams;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const product = await getProduct(slug);
  // A variant-less product would crash ProductDetail at variants[0].sku;
  // treat it as not-found rather than ship a 500 the moment a SKU is
  // (de)activated in admin or a reseed lands a half-baked row.
  if (!product || product.variants.length === 0) notFound();
  // Hide DESCONTINUADO variants from the PDP. If every variant of a
  // product is DESCONTINUADO, the product itself disappears.
  product.variants = product.variants.filter((v) => v.status !== "DESCONTINUADO");
  if (product.variants.length === 0) notFound();
  const dict = getDictionary(locale);
  const cat = (await getCategory(product.categorySlug))!;

  const variantOptions = product.variants.map((v) => ({
    sku: v.sku,
    price: formatPrice(v.priceCents, v.currency, locale),
    type: v.attributes.type?.[locale],
    finish: v.attributes.finish?.[locale],
    color: v.attributes.color
      ? { label: v.attributes.color.label[locale], hex: v.attributes.color.hex }
      : undefined,
    size: v.attributes.size?.[locale],
    image: v.image,
    images: v.images,
    status: v.status,
    stockLis: v.stockLis,
    stockVng: v.stockVng,
  }));

  // Parse the marketing description for (REF NNNNNN) callouts —
  // Dupont's standard "Associated gas refill / flint / ink refill"
  // pattern — and resolve them to catalogue products. Surfaces in
  // the "Compatible with" row of every variant's spec list and is
  // prepended to the "Pode também gostar" carousel.
  const compatibleRefs = parseCompatibleRefs(product.description[locale]);
  const compatibleProducts = await getProductsByVariantSkus(compatibleRefs);
  const compatibleSummary = compatibleProducts.map((p) => ({
    slug: p.slug,
    label: p.name[locale],
  }));

  const specsByVariant = Object.fromEntries(
    product.variants.map((v) => [v.sku, buildSpecs(product, cat, v, locale, compatibleSummary)]),
  );
  // Per-colourway description override map. Each entry is null when the
  // variant inherits the parent product copy; a localised string when
  // the variant has its own story (set in /admin/variants).
  const descriptionByVariant = Object.fromEntries(
    product.variants.map((v) => [v.sku, v.description?.[locale] ?? null]),
  );

  // Compatible refills / flints — parsed from the marketing description's
  // "Associated refills: 040112 Blue …" callouts. Rendered in their own
  // "Recargas compatíveis" carousel above the generic "You may also
  // like" row, so the recommendation is precise (the EXACT consumables
  // the product copy names) rather than mixed in with broader same-
  // category picks.
  const compatibleItems = compatibleProducts
    .flatMap((p) =>
      expandProductCards(p).map(({ sku }) => ({
        key: `cr-${p.slug}-${sku}`,
        node: <ProductCard key={`cr-${p.slug}-${sku}`} product={p} lang={locale} variantSku={sku} />,
      })),
    )
    .slice(0, 15);
  // Broader "You may also like" — same-category recommendations from the
  // related-products scorer. Refills are NOT prepended here any more
  // (they live in their own dedicated carousel) so this stays cleanly
  // about discoverability of the rest of the catalogue.
  const related = await getRelatedProducts(product, 15);
  const relatedItems = related
    .flatMap((p) =>
      expandProductCards(p).map(({ sku }) => ({
        key: `${p.slug}-${sku}`,
        node: <ProductCard key={`${p.slug}-${sku}`} product={p} lang={locale} variantSku={sku} />,
      })),
    )
    .slice(0, 15);
  // Most-viewed across the whole catalogue, excluding the current
  // product. Hidden by SimilarProducts when fewer than 4 entries exist
  // (i.e. while traffic data is still warming up).
  const mostViewed = await getMostViewed(15, product.slug);
  // Same 15-CARD cap as relatedItems — expandProductCards inflates per
  // colourway, so without the slice the carousel runs 30-50 tiles long.
  const mostViewedItems = mostViewed
    .flatMap((p) =>
      expandProductCards(p).map(({ sku }) => ({
        key: `mv-${p.slug}-${sku}`,
        node: <ProductCard key={`mv-${p.slug}-${sku}`} product={p} lang={locale} variantSku={sku} />,
      })),
    )
    .slice(0, 15);

  // Resolve the active variant from ?v= (preferred, per-SKU) or the
  // first variant matching ?t= (type slice) — otherwise the first
  // variant on the product. Used by JSON-LD, OG image and Live-
  // inventory strip so every SSR surface stays in sync.
  const activeVariant =
    product.variants.find((v) => v.sku === skuParam) ??
    (typeParam
      ? product.variants.find((v) => v.attributes.type?.[locale] === typeParam)
      : undefined) ??
    product.variants[0];

  // Product JSON-LD — one Offer per SKU (flat, not AggregateOffer).
  // Google Rich Results renders per-variant prices cleanly this way.
  const productLd = buildProductJsonLd({
    product,
    activeVariant,
    productUrl: `/${locale}/p/${product.slug}`,
    categoryLabel: cat.name[locale],
    lang: locale,
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
      />
      {product.categorySlug === "isqueiros" && (
        <AgeGate
          lang={locale}
          labels={{
            title: dict.ageGate.title,
            body: dict.ageGate.body,
            confirm: dict.ageGate.confirm,
            decline: dict.ageGate.decline,
            ariaLabel: dict.ageGate.ariaLabel,
          }}
        />
      )}
      <Breadcrumbs
        items={[
          { label: dict.common.home, href: `/${locale}` },
          { label: cat.name[locale], href: `/${locale}/c/${localeCategorySlug(locale, product.categorySlug)}` },
          { label: product.name[locale] },
        ]}
      />

      <ProductDetail
        fallbackImage={product.image}
        seed={product.slug}
        label={product.name[locale]}
        variants={variantOptions}
        initialType={typeParam}
        initialSku={skuParam}
        specsByVariant={specsByVariant}
        specsTitle={dict.product.specs}
        description={product.description[locale]}
        descriptionByVariant={descriptionByVariant}
        descriptionTitle={dict.product.descriptionTitle}
        galleryLabels={{
          previous: dict.common.previousImage,
          next: dict.common.nextImage,
          image: dict.common.imageLabel,
        }}
        labels={{
          typeLabel: dict.product.typeLabel,
          selectType: dict.product.selectType,
          finishes: dict.product.finishes,
          selectFinish: dict.product.selectFinish,
          colorLabel: dict.product.colorLabel,
          selectColor: dict.product.selectColor,
          sizeLabel: dict.product.sizeLabel,
          selectSize: dict.product.selectSize,
          inquire: dict.product.inquire,
          inquireSubject: dict.product.inquireSubject,
          inquireBody: dict.product.inquireBody,
          priceNote: dict.product.priceNote,
          inquiryDialogTitle: dict.common.inquiryDialogTitle,
          inquiryDialogBody: dict.common.inquiryDialogBody,
          inquiryOpenEmail: dict.common.inquiryOpenEmail,
          inquiryCallPhone: dict.common.inquiryCallPhone,
          inquiryWhatsapp: dict.common.inquiryWhatsapp,
          close: dict.common.close,
          unavailable: dict.common.unavailable,
          unavailableNote: locale === "pt"
            ? "Contacte a boutique para mais informações sobre disponibilidade."
            : "Contact the boutique for more information on availability.",
          availability: {
            title: dict.product.availabilityTitle,
            available: dict.product.stockAvailable,
            lastOne: dict.product.stockLastOne,
            outOfStock: dict.product.stockOutOfStock,
          },
          lang: locale,
        }}
        header={
          <>
            <div className="flex items-center justify-between">
              <p className="overline">
                {cat.name[locale]} · {product.collection}
              </p>
              <StatusPill lang={locale} />
            </div>
            <h1 className="mt-4 font-serif text-4xl text-ink md:text-5xl">{product.name[locale]}</h1>
            <div className="gold-rule my-7" />
          </>
        }
        extras={
          <>
            <p className="mt-6 text-center text-xs tracking-widest text-muted uppercase">
              {dict.product.visitBoutiquesPrefix}{" "}
              <Link
                href={`/${locale}/loja#${STORE_LIS.contactAnchor}`}
                className="text-ink underline-offset-4 transition-colors hover:text-gold hover:underline"
              >
                {STORE_LIS.labels[locale].short}
              </Link>{" "}
              {dict.product.visitBoutiquesConnector}{" "}
              <Link
                href={`/${locale}/loja#${STORE_VNG.contactAnchor}`}
                className="text-ink underline-offset-4 transition-colors hover:text-gold hover:underline"
              >
                {STORE_VNG.labels[locale].short}
              </Link>
            </p>

            {/* Lifetime-service reassurance — a luxury cue st-dupont.com buries */}
            <div className="mt-10 grid gap-5 border-t border-line pt-8 text-sm text-muted sm:grid-cols-2 sm:gap-x-8">
              <p className="flex items-start gap-3">
                <span className="mt-0.5 text-gold">—</span> {dict.product.lifetime}
              </p>
              <p className="flex items-start gap-3">
                <span className="mt-0.5 text-gold">—</span> {dict.product.personalisation}
              </p>
              <p className="flex items-start gap-3">
                <span className="mt-0.5 text-gold">—</span> {dict.product.personalAdvice}
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3 text-xs tracking-[0.16em] uppercase">
              <Link href={`/${locale}/loja`} className="text-muted transition-colors hover:text-gold">
                {dict.product.findStore}
              </Link>
              <a href={`#${CONTACT_ANCHOR}`} className="text-muted transition-colors hover:text-gold">
                {dict.product.needHelp}
              </a>
            </div>
          </>
        }
      />

      {product.history && (
        <section className="mx-auto max-w-3xl border-t border-line pt-16 text-center">
          <p className="overline">
            {dict.product.heritage} · {product.collection}
          </p>
          <div className="gold-rule mx-auto my-6" />
          <p className="font-serif text-xl leading-relaxed text-ink md:text-2xl">
            {product.history[locale]}
          </p>
        </section>
      )}

      {compatibleItems.length > 0 && (
        <SimilarProducts
          items={compatibleItems}
          title={dict.product.compatibleRefills}
          subtitle={dict.product.compatibleRefillsSub}
          minItems={1}
        />
      )}

      <SimilarProducts
        items={relatedItems}
        title={dict.product.youMayAlsoLike}
        subtitle={dict.product.youMayAlsoLikeSub}
      />

      <SimilarProducts
        items={mostViewedItems}
        title={dict.product.mostViewed}
        subtitle={dict.product.mostViewedSub}
        minItems={1}
      />

      <TrackProductView slug={product.slug} />
    </div>
  );
}
