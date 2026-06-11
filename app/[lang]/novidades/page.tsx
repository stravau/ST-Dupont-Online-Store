import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, getDictionary, type Locale } from "@/lib/i18n";
import { getNovelties, sortProducts, expandProductCards } from "@/lib/catalog";
import { isSortKey, type SortKey } from "@/lib/sort";
import { paginate, paginateAll, readPage, isShowAll } from "@/lib/paginate";
import { ProductCard } from "@/components/product-card";
import { PagedGrid } from "@/components/paged-grid";
import { Paginator } from "@/components/paginator";
import { SortSelect } from "@/components/sort-select";
import { Crest } from "@/components/crest";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: getDictionary(lang as Locale).sections.novelties };
}

export default async function NewReleasesPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ sort?: string; page?: string; all?: string }>;
}) {
  const { lang } = await params;
  const { sort: sortParam, page: pageParam, all: allParam } = await searchParams;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const dict = getDictionary(locale);
  const sort: SortKey = isSortKey(sortParam) ? sortParam : "featured";

  const allItems = sortProducts(await getNovelties(999), sort, locale);
  const cards = allItems.flatMap(expandProductCards);
  const showAll = isShowAll(allParam);
  const { slice, page, totalPages } = showAll
    ? paginateAll(cards)
    : paginate(cards, readPage(pageParam));
  const nodes = slice.map(({ product, sku }) => (
    <ProductCard key={`${product.slug}-${sku}`} product={product} lang={locale} variantSku={sku} />
  ));

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <header className="text-center">
        <Crest className="mb-6" />
        <p className="overline">{dict.sections.novelties}</p>
        <h1 className="mt-5 font-serif text-5xl text-ink md:text-6xl">
          {dict.sections.noveltiesSub}
        </h1>
        <div className="gold-rule mx-auto mt-7" />
      </header>

      <div className="mt-10 flex justify-end">
        <SortSelect value={sort} labels={dict.sort} />
      </div>

      <PagedGrid
        items={nodes}
        className="product-grid mt-10 grid grid-cols-2 gap-5 sm:gap-7 lg:grid-cols-4 lg:gap-8"
        showMoreLabel={dict.common.showAllOnPage}
        collapseLabel={dict.common.collapsePage}
      />

      <Paginator
        pathname={`/${locale}/novidades`}
        query={{ sort: sort !== "featured" ? sort : undefined }}
        page={page}
        totalPages={totalPages}
        prevLabel={dict.common.prev}
        nextLabel={dict.common.next}
        showAllLabel={dict.common.showAll}
      />
    </div>
  );
}
