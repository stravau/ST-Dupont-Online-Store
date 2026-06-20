import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, getDictionary, type Locale } from "@/lib/i18n";
import {
  getCategory,
  getProductsByCategory,
  getCollections,
  sortProducts,
  expandProductCards,
  inferGender,
  hasUsage,
  isUsage,
  isPriceBucket,
  priceInBucket,
  type Gender,
  type Usage,
  type PriceBucket,
} from "@/lib/catalog";
import { categoryArt } from "@/lib/category-art";
import { resolveCategorySlug } from "@/lib/category-slugs";
import { ACC_SECTION_ORDER, getProductType } from "@/lib/product-groups";
import { isSortKey, type SortKey } from "@/lib/sort";
import { paginate, paginateAll, readPage, isShowAll } from "@/lib/paginate";
import { ProductCard } from "@/components/product-card";
import { CategoryPaged } from "@/components/category-paged";
import { CategoryNav } from "@/components/category-nav";
import { Paginator } from "@/components/paginator";
import { SortSelect } from "@/components/sort-select";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Crest } from "@/components/crest";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; category: string }>;
}): Promise<Metadata> {
  const { lang, category } = await params;
  const canonical = resolveCategorySlug(category);
  const cat = await getCategory(canonical);
  if (!isLocale(lang) || !cat) return {};
  return { title: cat.name[lang as Locale] };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; category: string }>;
  searchParams: Promise<{
    col?: string;
    sort?: string;
    page?: string;
    g?: string;
    usage?: string;
    price?: string;
    all?: string;
  }>;
}) {
  const { lang, category: categoryParam } = await params;
  const {
    col,
    sort: sortParam,
    page: pageParam,
    g: gParam,
    usage: usageParam,
    price: priceParam,
    all: allParam,
  } = await searchParams;
  const sort: SortKey = isSortKey(sortParam) ? sortParam : "featured";
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  // Accept either the canonical PT slug or the English alias (lighters /
  // writing / leather / accessories) at the URL — the DB still stores PT.
  const category = resolveCategorySlug(categoryParam);
  const cat = await getCategory(category);
  if (!cat) notFound();
  const dict = getDictionary(locale);
  const collections = await getCollections(category);
  const activeCol = col && collections.includes(col) ? col : undefined;
  const art = categoryArt[category];
  // Gender filter only applies to leather goods; ignored on other categories.
  const supportsGender = category === "pele";
  const activeGender: Gender | undefined =
    supportsGender && (gParam === "men" || gParam === "women" || gParam === "unisex")
      ? gParam
      : undefined;
  // Usage filter applies to writing only — pens are Ballpoint / Rollerball /
  // Fountain Pen, exposed as a chip row on /c/escrita.
  const supportsUsage = category === "escrita";
  const activeUsage: Usage | undefined =
    supportsUsage && isUsage(usageParam) ? usageParam : undefined;
  const fetched = await getProductsByCategory(category, activeCol);
  // Men / Women include unisex pieces (the explicit Unisex filter is strict).
  const afterGender = activeGender
    ? fetched.filter((p) => {
        const g = inferGender(p);
        if (activeGender === "unisex") return g === "unisex";
        return g === activeGender || g === "unisex";
      })
    : fetched;
  const activePrice: PriceBucket | undefined = isPriceBucket(priceParam) ? priceParam : undefined;
  const afterUsage = activeUsage ? afterGender.filter((p) => hasUsage(p, activeUsage)) : afterGender;
  const filtered = activePrice ? afterUsage.filter((p) => priceInBucket(p, activePrice)) : afterUsage;
  const sortedItems = sortProducts(filtered, sort, locale);
  // Keep the URL-emitting `base` in the locale-appropriate form so chip
  // links + paginator never bounce the user back to a PT slug on EN.
  const base = `/${locale}/c/${categoryParam}`;

  // For accessories the natural section is the *item type* (Cigar Cases,
  // Cigar Cutters, Ashtrays, …) rather than the brand collection — the same
  // cigar case shouldn't appear under three separate headers just because the
  // catalogue stores it in three different `collection` strings. For lighters
  // / writing / leather the collection IS the model line, so we keep that.
  //
  // Bucket products by type, order the buckets per ACC_SECTION_ORDER, then
  // flatten back. Inside each bucket items keep the user-chosen sort order
  // (so price-asc still works within "Cigar Cases", etc.).
  const groupByType = category === "acessorios";
  const otherLabel = locale === "pt" ? "Outros" : "Other";
  let items = sortedItems;
  if (groupByType) {
    const buckets = new Map<string, typeof sortedItems>();
    for (const p of sortedItems) {
      const key = getProductType(p, locale)?.key ?? "z-other";
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key)!.push(p);
    }
    const orderedKeys = [...buckets.keys()].sort((a, b) => {
      const ra = ACC_SECTION_ORDER.indexOf(a);
      const rb = ACC_SECTION_ORDER.indexOf(b);
      return (ra === -1 ? 999 : ra) - (rb === -1 ? 999 : rb);
    });
    items = orderedKeys.flatMap((k) => buckets.get(k)!);
  }

  // Flatten every (product, sku) for pagination, then hand the slice to the
  // grouped renderer which re-groups by `line` (consecutive same-line items
  // form a section). Line = type label for accessories, collection otherwise.
  const lineOf = (p: (typeof items)[number]): string =>
    groupByType ? (getProductType(p, locale)?.label ?? otherLabel) : p.collection;
  const allCards = items.flatMap((p) =>
    expandProductCards(p).map(({ sku }) => ({
      key: `${p.slug}-${sku}`,
      line: lineOf(p),
      node: (
        <ProductCard key={`${p.slug}-${sku}`} product={p} lang={locale} variantSku={sku} />
      ),
    })),
  );
  const showAll = isShowAll(allParam);
  const { slice: pageCards, page, totalPages } = showAll
    ? paginateAll(allCards)
    : paginate(allCards, readPage(pageParam));

  // Pre-build the chip rows so the JSX below stays clean. URL preserves
  // col + sort while toggling g / usage; selecting "All" drops the param.
  const buildChipLink = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    if (activeCol) params.set("col", activeCol);
    if (sort !== "featured") params.set("sort", sort);
    if (activeGender && !("g" in overrides)) params.set("g", activeGender);
    if (activeUsage && !("usage" in overrides)) params.set("usage", activeUsage);
    if (activePrice && !("price" in overrides)) params.set("price", activePrice);
    for (const [k, v] of Object.entries(overrides)) {
      if (v) params.set(k, v);
      else params.delete(k);
    }
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  };
  const chipClass = (active: boolean) =>
    `inline-flex items-center rounded-full border px-4 py-2 text-[11px] tracking-[0.18em] uppercase transition-colors duration-300 ${
      active
        ? "border-gold bg-ink text-cream"
        : "border-line text-muted hover:border-gold hover:text-ink"
    }`;

  return (
    <div>
      {art?.hero ? (
        /* Full-bleed photo header. monogram-bg is the fallback if the image
           fails to load. Explicit positive z-stacking instead of -z-10 to
           avoid Safari painting the negative-z image *behind* the parent
           background under body zoom (showed as a navy stripe up top). */
        <header className="monogram-bg relative overflow-hidden text-center text-cream">
          <Image
            src={art.hero}
            alt=""
            fill
            priority
            sizes="100vw"
            className={`absolute inset-0 z-0 scale-125 object-cover sm:scale-100 ${art.heroPos ?? "object-center"}`}
          />
          <div className="absolute inset-0 z-10 bg-gradient-to-b from-ink/80 via-ink/65 to-ink/90" />
          <div className="relative z-20 mx-auto max-w-2xl px-6 py-20 sm:py-28 md:py-36">
            <Crest className="mb-6 text-gold-soft" />
            <p className="overline text-gold-soft">{cat.name[locale]}</p>
            <h1 className="mt-4 font-serif text-5xl md:text-6xl">{art.art}</h1>
            <div className="gold-rule mx-auto mt-7" />
            {cat.history && (
              <p className="mx-auto mt-7 max-w-xl text-sm leading-relaxed text-cream/85">
                {cat.history[locale]}
              </p>
            )}
          </div>
        </header>
      ) : null}

      <div className="mx-auto max-w-7xl px-6 py-12">
        <Breadcrumbs
          items={[
            { label: dict.common.home, href: `/${locale}` },
            { label: cat.name[locale], href: base },
            ...(activeCol ? [{ label: activeCol }] : []),
          ]}
        />

        {!art?.hero && (
          <header className="mx-auto mt-2 max-w-2xl text-center">
            <Crest className="mb-6" />
            <p className="overline">{cat.name[locale]}</p>
            <h1 className="mt-5 font-serif text-5xl text-ink md:text-6xl">
              {art?.art ?? cat.name[locale]}
            </h1>
            <div className="gold-rule mx-auto mt-7" />
            {cat.history && (
              <p className="mx-auto mt-7 max-w-xl text-sm leading-relaxed text-muted">
                {cat.history[locale]}
              </p>
            )}
          </header>
        )}

      {/* Collection switcher — collapsed by default to free up vertical space
          for the products. Expands on click to reveal every collection
          (Géode / Popote / Maki-e / Cohiba / Haute Création / …). */}
      {art && (
        <CategoryNav
          items={art.groups.map((g) => ({ label: g.label[locale], href: g.href }))}
          lang={locale}
          browseLabel={dict.common.browseCollections}
          closeLabel={dict.common.closeCollections}
        />
      )}

      {supportsGender && (
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          <span className="mr-1 text-[11px] tracking-[0.2em] text-muted uppercase">
            {dict.common.forLabel}
          </span>
          <Link href={buildChipLink({ g: undefined })} className={chipClass(!activeGender)}>
            {dict.common.forAll}
          </Link>
          <Link href={buildChipLink({ g: "women" })} className={chipClass(activeGender === "women")}>
            {dict.common.forWomen}
          </Link>
          <Link href={buildChipLink({ g: "men" })} className={chipClass(activeGender === "men")}>
            {dict.common.forMen}
          </Link>
          <Link href={buildChipLink({ g: "unisex" })} className={chipClass(activeGender === "unisex")}>
            {dict.common.forUnisex}
          </Link>
        </div>
      )}

      {supportsUsage && (
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          <span className="mr-1 text-[11px] tracking-[0.2em] text-muted uppercase">
            {dict.common.usageLabel}
          </span>
          <Link href={buildChipLink({ usage: undefined })} className={chipClass(!activeUsage)}>
            {dict.common.forAll}
          </Link>
          <Link
            href={buildChipLink({ usage: "ballpoint" })}
            className={chipClass(activeUsage === "ballpoint")}
          >
            {dict.common.usageBallpoint}
          </Link>
          <Link
            href={buildChipLink({ usage: "rollerball" })}
            className={chipClass(activeUsage === "rollerball")}
          >
            {dict.common.usageRollerball}
          </Link>
          <Link
            href={buildChipLink({ usage: "fountain" })}
            className={chipClass(activeUsage === "fountain")}
          >
            {dict.common.usageFountain}
          </Link>
        </div>
      )}

      {/* Price-range filter — chips for the standard luxury bands.
          Visible on every category; counts/empty states fall out
          naturally from the filtered product list. */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <span className="mr-1 text-[11px] tracking-[0.2em] text-muted uppercase">
          {dict.common.priceLabel}
        </span>
        <Link href={buildChipLink({ price: undefined })} className={chipClass(!activePrice)}>
          {dict.common.forAll}
        </Link>
        <Link href={buildChipLink({ price: "u200" })} className={chipClass(activePrice === "u200")}>
          {dict.common.priceUnder200}
        </Link>
        <Link href={buildChipLink({ price: "200-500" })} className={chipClass(activePrice === "200-500")}>
          {dict.common.price200500}
        </Link>
        <Link href={buildChipLink({ price: "500-1000" })} className={chipClass(activePrice === "500-1000")}>
          {dict.common.price500_1000}
        </Link>
        <Link href={buildChipLink({ price: "1000-2500" })} className={chipClass(activePrice === "1000-2500")}>
          {dict.common.price1000_2500}
        </Link>
        <Link href={buildChipLink({ price: "a2500" })} className={chipClass(activePrice === "a2500")}>
          {dict.common.priceAbove2500}
        </Link>
      </div>

      <div className="mt-10 flex justify-end">
        <SortSelect value={sort} labels={dict.sort} />
      </div>

      <CategoryPaged
        cards={pageCards}
        showAllLabel={dict.common.showAll}
        showAllHref={buildChipLink({ page: undefined, all: "1" })}
        isShowingAll={showAll}
      />

      <Paginator
        pathname={base}
        query={{
          col: activeCol,
          sort: sort !== "featured" ? sort : undefined,
          g: activeGender,
          usage: activeUsage,
        }}
        page={page}
        totalPages={totalPages}
        prevLabel={dict.common.prev}
        nextLabel={dict.common.next}
      />
      </div>
    </div>
  );
}
