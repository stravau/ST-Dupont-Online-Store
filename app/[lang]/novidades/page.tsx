import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, getDictionary, type Locale } from "@/lib/i18n";
import { getNovelties, sortProducts } from "@/lib/catalog";
import { myWishlistIds } from "@/lib/cart";
import { isSortKey, type SortKey } from "@/lib/sort";
import { ProductCard } from "@/components/product-card";
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
  searchParams: Promise<{ sort?: string }>;
}) {
  const { lang } = await params;
  const { sort: sortParam } = await searchParams;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const dict = getDictionary(locale);
  const sort: SortKey = isSortKey(sortParam) ? sortParam : "featured";

  const [raw, wl] = await Promise.all([getNovelties(99), myWishlistIds()]);
  const items = sortProducts(raw, sort, locale);

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

      <div className="product-grid mt-6 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
        {items.map((p) => (
          <ProductCard key={p.slug} product={p} lang={locale} wishlisted={wl.has(p.id)} />
        ))}
      </div>
    </div>
  );
}
