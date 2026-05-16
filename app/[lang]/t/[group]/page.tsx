import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n";
import { getProduct, type Product } from "@/lib/catalog";
import { myWishlistIds } from "@/lib/cart";
import { productGroups } from "@/lib/product-groups";
import { ProductCard } from "@/components/product-card";

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
  searchParams: Promise<{ type?: string }>;
}) {
  const { lang, group } = await params;
  const { type } = await searchParams;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const g = productGroups[group];
  if (!g) notFound();

  const activeType = g.types?.find((x) => x.key === type) ?? g.types?.[0];
  const slugs = g.types ? (activeType?.slugs ?? []) : (g.slugs ?? []);

  const [products, wl] = await Promise.all([
    Promise.all(slugs.map((s) => getProduct(s))),
    myWishlistIds(),
  ]);
  const items = products.filter(Boolean) as Product[];

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <header className="text-center">
        <p className="overline">{g.eyebrow}</p>
        <h1 className="mt-5 font-serif text-5xl text-ink md:text-6xl">{g.title[locale]}</h1>
        <div className="gold-rule mx-auto mt-7" />
      </header>

      {g.types && (
        <nav className="mt-12 flex flex-wrap justify-center gap-3">
          {g.types.map((s) => (
            <Link
              key={s.key}
              href={`/${locale}/t/${g.id}?type=${s.key}`}
              className={`rounded-full border px-6 py-3 text-xs tracking-[0.18em] uppercase transition-colors duration-300 ${
                s.key === activeType?.key
                  ? "border-gold bg-ink text-cream"
                  : "border-line text-muted hover:border-gold hover:text-ink"
              }`}
            >
              {s.label[locale]}
            </Link>
          ))}
        </nav>
      )}

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <ProductCard key={p.slug} product={p} lang={locale} wishlisted={wl.has(p.id)} />
        ))}
      </div>
    </div>
  );
}
