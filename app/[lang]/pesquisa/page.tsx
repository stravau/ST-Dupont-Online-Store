import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, getDictionary, type Locale } from "@/lib/i18n";
import { searchProducts, sortProducts } from "@/lib/catalog";
import { myWishlistIds } from "@/lib/cart";
import { isSortKey, type SortKey } from "@/lib/sort";
import { ProductCard } from "@/components/product-card";
import { SortSelect } from "@/components/sort-select";

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
  searchParams: Promise<{ q?: string; sort?: string }>;
}) {
  const { lang } = await params;
  const { q, sort: sortParam } = await searchParams;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const dict = getDictionary(locale);
  const s = dict.search;
  const query = (q ?? "").trim();
  const sort: SortKey = isSortKey(sortParam) ? sortParam : "featured";

  const [raw, wl] = await Promise.all([
    query ? searchProducts(query) : Promise.resolve([]),
    myWishlistIds(),
  ]);
  const results = sortProducts(raw, sort, locale);

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <h1 className="text-center font-serif text-5xl text-ink">{s.title}</h1>
      <div className="gold-rule mx-auto my-8" />

      <form action={`/${locale}/pesquisa`} method="get" className="mx-auto max-w-xl">
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
          {s.resultsFor} <span className="text-ink">“{query}”</span> · {results.length} {s.count}
        </p>
      )}

      {query && results.length > 0 && (
        <div className="mt-8 flex justify-end">
          <SortSelect value={sort} labels={dict.sort} />
        </div>
      )}

      {query && results.length === 0 ? (
        <p className="mt-10 text-center text-muted">{s.noResults}</p>
      ) : (
        <div className="product-grid mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((p) => (
            <ProductCard key={p.slug} product={p} lang={locale} wishlisted={wl.has(p.id)} />
          ))}
        </div>
      )}
    </section>
  );
}
