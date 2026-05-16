import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, getDictionary, type Locale } from "@/lib/i18n";
import { getNovelties } from "@/lib/catalog";
import { myWishlistIds } from "@/lib/cart";
import { ProductCard } from "@/components/product-card";

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
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const dict = getDictionary(locale);

  const [items, wl] = await Promise.all([getNovelties(99), myWishlistIds()]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <header className="text-center">
        <p className="overline">{dict.sections.novelties}</p>
        <h1 className="mt-5 font-serif text-5xl text-ink md:text-6xl">
          {dict.sections.noveltiesSub}
        </h1>
        <div className="gold-rule mx-auto mt-7" />
      </header>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <ProductCard key={p.slug} product={p} lang={locale} wishlisted={wl.has(p.id)} />
        ))}
      </div>
    </div>
  );
}
