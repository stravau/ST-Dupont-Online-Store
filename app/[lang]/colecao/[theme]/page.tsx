import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, getDictionary, type Locale } from "@/lib/i18n";
import {
  getProductsByTheme,
  sortProducts,
  expandProductCards,
} from "@/lib/catalog";
import { isSortKey, type SortKey } from "@/lib/sort";
import { paginate, paginateAll, readPage, isShowAll } from "@/lib/paginate";
import { ProductCard } from "@/components/product-card";
import { PagedGrid } from "@/components/paged-grid";
import { Paginator } from "@/components/paginator";
import { SortSelect } from "@/components/sort-select";
import { Crest } from "@/components/crest";

// Cross-category theme page — surfaces every product whose slug matches the
// theme regardless of categorySlug. Drives the "Discover the Cohiba
// Collection" hero on the homepage and the Monogram entries in the navbars,
// where the official Maison capsule spans lighters AND accessories AND
// leather goods at the same time and the per-category /c/[category]?col=X
// page can only ever show one slice.
//
// Theme URL slug → human label map (the function needs the LABEL because the
// existing slug-pattern table in lib/catalog.ts is keyed on labels).
const THEMES: Record<string, { label: string; titlePt: string; titleEn: string; eyebrowPt: string; eyebrowEn: string }> = {
  cohiba: {
    label: "Cohiba",
    titlePt: "Coleção Cohiba",
    titleEn: "Cohiba Collection",
    eyebrowPt: "S.T. Dupont × Cohiba",
    eyebrowEn: "S.T. Dupont × Cohiba",
  },
  monogram: {
    label: "Monogram 1872",
    titlePt: "Monograma 1872",
    titleEn: "Monogram 1872",
    eyebrowPt: "Coleção da Maison",
    eyebrowEn: "Maison Collection",
  },
  popote: {
    label: "Popote",
    titlePt: "Coleção Popote",
    titleEn: "Popote Collection",
    eyebrowPt: "Coleção da Maison",
    eyebrowEn: "Maison Collection",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; theme: string }>;
}): Promise<Metadata> {
  const { lang, theme } = await params;
  const t = THEMES[theme];
  if (!isLocale(lang) || !t) return {};
  const locale = lang as Locale;
  return { title: locale === "pt" ? t.titlePt : t.titleEn };
}

export default async function ThemePage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; theme: string }>;
  searchParams: Promise<{ sort?: string; page?: string; all?: string }>;
}) {
  const { lang, theme } = await params;
  const { sort: sortParam, page: pageParam, all: allParam } = await searchParams;
  if (!isLocale(lang)) notFound();
  const t = THEMES[theme];
  if (!t) notFound();
  const locale = lang as Locale;
  const dict = getDictionary(locale);
  const sort: SortKey = isSortKey(sortParam) ? sortParam : "featured";

  const allItems = sortProducts(await getProductsByTheme(t.label), sort, locale);
  const cards = allItems.flatMap(expandProductCards);
  const showAll = isShowAll(allParam);
  const { slice, page, totalPages } = showAll
    ? paginateAll(cards)
    : paginate(cards, readPage(pageParam));
  const nodes = slice.map(({ product, sku }) => (
    <ProductCard key={`${product.slug}-${sku}`} product={product} lang={locale} variantSku={sku} />
  ));

  const pathname = `/${locale}/colecao/${theme}`;
  const sortQs = sort !== "featured" ? `?sort=${sort}` : "";
  const showAllHref = sortQs ? `${pathname}${sortQs}&all=1` : `${pathname}?all=1`;

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <header className="text-center">
        <Crest className="mb-6" />
        <p className="overline">{locale === "pt" ? t.eyebrowPt : t.eyebrowEn}</p>
        <h1 className="mt-5 font-serif text-5xl text-ink md:text-6xl">
          {locale === "pt" ? t.titlePt : t.titleEn}
        </h1>
        <div className="gold-rule mx-auto mt-7" />
        <p className="mx-auto mt-7 max-w-xl text-sm text-muted">
          {cards.length}{" "}
          {locale === "pt"
            ? cards.length === 1
              ? "peça da Maison"
              : "peças da Maison"
            : cards.length === 1
              ? "Maison piece"
              : "Maison pieces"}
        </p>
      </header>

      <div className="mt-10 flex justify-end">
        <SortSelect value={sort} labels={dict.sort} />
      </div>

      <PagedGrid
        items={nodes}
        className="product-grid mt-10 grid grid-cols-2 gap-5 sm:gap-7 lg:grid-cols-4 lg:gap-8"
        showAllLabel={dict.common.showAll}
        showAllHref={showAllHref}
        isShowingAll={showAll}
      />

      <Paginator
        pathname={pathname}
        query={{ sort: sort !== "featured" ? sort : undefined }}
        page={page}
        totalPages={totalPages}
        prevLabel={dict.common.prev}
        nextLabel={dict.common.next}
      />
    </div>
  );
}
