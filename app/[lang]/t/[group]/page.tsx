import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, getDictionary, type Locale } from "@/lib/i18n";
import { getProductsByCategory, sortProducts, expandProductCards, inferGender, type Gender } from "@/lib/catalog";
import { productGroups } from "@/lib/product-groups";
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
  params: Promise<{ lang: string; group: string }>;
}): Promise<Metadata> {
  const { lang, group } = await params;
  const g = productGroups[group];
  if (!isLocale(lang) || !g) return {};
  return { title: g.title[lang as Locale] };
}

export default async function GroupPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; group: string }>;
  searchParams: Promise<{ type?: string; sort?: string; page?: string; g?: string; all?: string }>;
}) {
  const { lang, group } = await params;
  const { type, sort: sortParam, page: pageParam, g: gParam, all: allParam } = await searchParams;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const dict = getDictionary(locale);
  const sort: SortKey = isSortKey(sortParam) ? sortParam : "featured";
  const g = productGroups[group];
  if (!g) notFound();

  const activeType = g.types?.find((x) => x.key === type) ?? g.types?.[0];
  // Fetch every product in the group's base category, then keep the ones the
  // active type's matcher accepts. Flat groups apply the group's own matcher.
  const all = await getProductsByCategory(g.categorySlug);
  const matcher = g.types ? activeType?.match : g.match;
  const filteredByType = matcher ? all.filter(matcher) : [];
  // Optional gender filter — composes with the type matcher so the navbar's
  // MEN > Travel bags / WOMEN > Cross body bag entries resolve as a single
  // URL: /t/bags?type=travel&g=men. Only meaningful on the leather groups.
  const activeGender: Gender | undefined =
    gParam === "men" || gParam === "women" || gParam === "unisex" ? gParam : undefined;
  // Men / Women filters INCLUDE unisex pieces — a gender-neutral wallet or
  // crossbody bag should appear under both columns rather than being hidden
  // from both. The explicit "Unisex" filter is unisex-only.
  const filtered = activeGender
    ? filteredByType.filter((p) => {
        const g = inferGender(p);
        if (activeGender === "unisex") return g === "unisex";
        return g === activeGender || g === "unisex";
      })
    : filteredByType;
  const items = sortProducts(filtered, sort, locale);
  const cards = items.flatMap(expandProductCards);
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
        <p className="overline">{g.eyebrow}</p>
        <h1 className="mt-5 font-serif text-5xl text-ink md:text-6xl">{g.title[locale]}</h1>
        <div className="gold-rule mx-auto mt-7" />
      </header>

      {g.types && (
        <nav className="mt-12 flex flex-wrap justify-center gap-3">
          {g.types.map((s) => {
            const qs = new URLSearchParams();
            qs.set("type", s.key);
            if (activeGender) qs.set("g", activeGender);
            return (
              <Link
                key={s.key}
                href={`/${locale}/t/${g.id}?${qs.toString()}`}
                className={`rounded-full border px-6 py-3 text-xs tracking-[0.18em] uppercase transition-colors duration-300 ${
                  s.key === activeType?.key
                    ? "border-gold bg-ink text-cream"
                    : "border-line text-muted hover:border-gold hover:text-ink"
                }`}
              >
                {s.label[locale]}
              </Link>
            );
          })}
        </nav>
      )}

      <div className="mt-10 flex justify-end">
        <SortSelect value={sort} labels={dict.sort} />
      </div>

      <PagedGrid
        items={nodes}
        className="product-grid mt-10 grid grid-cols-2 gap-5 sm:gap-7 lg:grid-cols-4 lg:gap-8"
        showAllLabel={dict.common.showAll}
        showAllHref={(() => {
          const p = new URLSearchParams();
          if (g.types && activeType?.key) p.set("type", activeType.key);
          if (sort !== "featured") p.set("sort", sort);
          if (activeGender) p.set("g", activeGender);
          p.set("all", "1");
          return `/${locale}/t/${g.id}?${p.toString()}`;
        })()}
        isShowingAll={showAll}
      />

      <Paginator
        pathname={`/${locale}/t/${g.id}`}
        query={{
          type: g.types ? activeType?.key : undefined,
          sort: sort !== "featured" ? sort : undefined,
          g: activeGender,
        }}
        page={page}
        totalPages={totalPages}
        prevLabel={dict.common.prev}
        nextLabel={dict.common.next}
      />
    </div>
  );
}
