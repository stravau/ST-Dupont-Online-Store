import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, getDictionary, type Locale } from "@/lib/i18n";
import { getCategory, getProductsByCategory, type Category, type Product } from "@/lib/catalog";
import { myWishlistIds } from "@/lib/cart";
import { ProductCard } from "@/components/product-card";

// Fixed walkthrough order requested: Lighters -> Writing -> Leather -> Accessories
const ORDER = ["isqueiros", "escrita", "pele", "acessorios"] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: getDictionary(lang as Locale).collection.title };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const dict = getDictionary(locale);
  const wl = await myWishlistIds();

  const sections = (
    await Promise.all(
      ORDER.map(async (slug) => {
        const [category, products] = await Promise.all([
          getCategory(slug),
          getProductsByCategory(slug),
        ]);
        return category ? { category, products } : null;
      }),
    )
  ).filter(Boolean) as { category: Category; products: Product[] }[];

  return (
    <div>
      {/* Header */}
      <header className="mx-auto max-w-7xl px-6 pb-10 pt-20 text-center">
        <p className="overline">{dict.collection.subtitle}</p>
        <h1 className="mt-5 font-serif text-5xl text-ink md:text-6xl">
          {dict.collection.title}
        </h1>
        <div className="gold-rule mx-auto mt-7" />
      </header>

      {/* Sticky in-page navigation through the categories, in order */}
      <nav className="sticky top-[73px] z-40 border-y border-line bg-cream/95 backdrop-blur">
        <ol className="mx-auto flex max-w-7xl items-center justify-center gap-8 overflow-x-auto px-6 py-4">
          {sections.map(({ category }, i) => (
            <li key={category.slug} className="flex items-center gap-8">
              {i > 0 && <span className="text-line">·</span>}
              <a
                href={`#${category.slug}`}
                className="whitespace-nowrap text-xs tracking-[0.16em] text-muted uppercase transition-colors hover:text-gold"
              >
                {category.name[locale]}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {/* One section per category */}
      {sections.map(({ category, products }, i) => (
        <section
          key={category.slug}
          id={category.slug}
          className={`scroll-mt-36 ${i % 2 === 1 ? "bg-paper" : ""}`}
        >
          <div className="mx-auto max-w-7xl px-6 py-24">
            <div className="flex flex-col items-center text-center">
              <p className="overline">
                {String(i + 1).padStart(2, "0")} — {category.tagline[locale]}
              </p>
              <h2 className="mt-4 font-serif text-4xl text-ink md:text-5xl">
                {category.name[locale]}
              </h2>
              <div className="gold-rule mx-auto mt-6" />
            </div>

            <div className="product-grid mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.slug} product={p} lang={locale} wishlisted={wl.has(p.id)} />
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link
                href={`/${locale}/c/${category.slug}`}
                className="inline-block border border-ink px-10 py-4 text-xs tracking-[0.22em] text-ink uppercase transition-colors duration-300 hover:bg-ink hover:text-cream"
              >
                {dict.nav.viewAll} · {category.name[locale]}
              </Link>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
