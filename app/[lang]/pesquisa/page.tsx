import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, getDictionary, type Locale } from "@/lib/i18n";
import { searchProducts, sortProducts, expandProductCards, type Product } from "@/lib/catalog";
import { isSortKey, type SortKey } from "@/lib/sort";
import { paginate, paginateAll, readPage, isShowAll } from "@/lib/paginate";
import { ProductCard } from "@/components/product-card";
import { PagedGrid } from "@/components/paged-grid";
import { Paginator } from "@/components/paginator";
import { SortSelect } from "@/components/sort-select";
import { SearchFilters, type FacetOption } from "@/components/search-filters";
import { Crest } from "@/components/crest";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: getDictionary(lang as Locale).search.title };
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{
    q?: string;
    sort?: string;
    page?: string;
    cat?: string;
    col?: string;
    all?: string;
  }>;
}) {
  const { lang } = await params;
  const {
    q,
    sort: sortParam,
    page: pageParam,
    cat: catParam,
    col: colParam,
    all: allParam,
  } = await searchParams;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const dict = getDictionary(locale);
  const s = dict.search;
  const query = (q ?? "").trim();
  const sort: SortKey = isSortKey(sortParam) ? sortParam : "featured";

  const raw = query ? await searchProducts(query) : [];

  // Bilingual labels for the four category slugs — drives the chip text.
  const catLabel: Record<string, string> = {
    isqueiros: dict.nav.lighters,
    escrita: dict.nav.writing,
    pele: dict.nav.leather,
    acessorios: dict.nav.accessories,
  };

  // Category facets reflect the whole q-only result set so the user always
  // sees every house their query touches. Collection facets narrow with the
  // active category — collections rarely span categories, and a global list
  // would be noisy.
  const catCounts = new Map<string, number>();
  for (const p of raw) catCounts.set(p.categorySlug, (catCounts.get(p.categorySlug) ?? 0) + 1);
  const categoryFacets: FacetOption[] = [...catCounts.entries()]
    .map(([value, count]) => ({ value, label: catLabel[value] ?? value, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  const activeCategory = catParam && catCounts.has(catParam) ? catParam : undefined;

  const colSource = activeCategory ? raw.filter((p) => p.categorySlug === activeCategory) : raw;
  const colCounts = new Map<string, number>();
  for (const p of colSource) colCounts.set(p.collection, (colCounts.get(p.collection) ?? 0) + 1);
  const collectionFacets: FacetOption[] = [...colCounts.entries()]
    .filter(([value]) => value.length > 0)
    .map(([value, count]) => ({ value, label: value, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  const activeCollection = colParam && colCounts.has(colParam) ? colParam : undefined;

  const filtered: Product[] = raw.filter(
    (p) =>
      (!activeCategory || p.categorySlug === activeCategory) &&
      (!activeCollection || p.collection === activeCollection),
  );

  const results = sortProducts(filtered, sort, locale);
  const cards = results.flatMap(expandProductCards);
  const showAll = isShowAll(allParam);
  const { slice, page, totalPages } = showAll
    ? paginateAll(cards)
    : paginate(cards, readPage(pageParam));
  const nodes = slice.map(({ product, sku }) => (
    <ProductCard key={`${product.slug}-${sku}`} product={product} lang={locale} variantSku={sku} />
  ));

  const pathname = `/${locale}/pesquisa`;
  const paginatorQuery = {
    q: query,
    sort: sort !== "featured" ? sort : undefined,
    cat: activeCategory,
    col: activeCollection,
  };
  const showingFiltered = filtered.length !== raw.length;

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <Crest className="mb-6" />
      <h1 className="text-center font-serif text-5xl text-ink">{s.title}</h1>
      <div className="gold-rule mx-auto my-8" />

      <form action={pathname} method="get" className="mx-auto max-w-xl">
        <div className="flex border border-line bg-paper">
          <input
            type="search"
            name="q"
            defaultValue={query}
            autoFocus
            placeholder={s.placeholder}
            aria-label={s.title}
            className="w-full bg-transparent px-5 py-4 text-sm text-ink outline-none"
          />
          <button
            type="submit"
            className="bg-ink px-6 text-xs tracking-[0.2em] text-cream uppercase transition-colors hover:bg-gold hover:text-ink"
          >
            {s.submit}
          </button>
        </div>
      </form>

      {query && (
        <p className="mt-10 text-center text-sm text-muted">
          {s.resultsFor} <span className="text-ink">“{query}”</span> ·{" "}
          {showingFiltered ? (
            <>
              {filtered.length} {s.filteredCount} {raw.length}
            </>
          ) : (
            <>
              {results.length} {s.count}
            </>
          )}
        </p>
      )}

      {query && raw.length > 0 && (
        <SearchFilters
          pathname={pathname}
          query={query}
          sort={sort}
          activeCategory={activeCategory}
          activeCollection={activeCollection}
          categories={categoryFacets}
          collections={collectionFacets}
          labels={{
            categories: s.categories,
            collections: s.collections,
            all: s.allFilter,
          }}
        />
      )}

      {query && filtered.length > 0 && (
        <div className="mt-8 flex justify-end">
          <SortSelect value={sort} labels={dict.sort} />
        </div>
      )}

      {query && raw.length === 0 ? (
        <p className="mt-10 text-center text-muted">{s.noResults}</p>
      ) : query && filtered.length === 0 ? (
        <p className="mt-10 text-center text-muted">{s.noResults}</p>
      ) : query ? (
        <>
          <PagedGrid
            items={nodes}
            className="product-grid mt-14 grid grid-cols-2 gap-5 sm:gap-7 lg:grid-cols-4 lg:gap-8"
            showMoreLabel={dict.common.showAllOnPage}
            collapseLabel={dict.common.collapsePage}
          />
          <Paginator
            pathname={pathname}
            query={paginatorQuery}
            page={page}
            totalPages={totalPages}
            prevLabel={dict.common.prev}
            nextLabel={dict.common.next}
            showAllLabel={dict.common.showAll}
          />
        </>
      ) : null}
    </section>
  );
}
