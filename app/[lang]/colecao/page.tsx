import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, getDictionary, type Locale } from "@/lib/i18n";
import { localeCategorySlug } from "@/lib/category-slugs";
import {
  getCategory,
  getProductsByCategory,
  sortProducts,
  expandProductCards,
  type Category,
  type Product,
} from "@/lib/catalog";
import { isSortKey, type SortKey } from "@/lib/sort";
import { ProductCard } from "@/components/product-card";
import { SortSelect } from "@/components/sort-select";
import { Crest } from "@/components/crest";

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

  const sections = (
    await Promise.all(
      ORDER.map(async (slug) => {
        const [category, products] = await Promise.all([
          getCategory(slug),
          getProductsByCategory(slug),
        ]);
        return category
          ? { category, products: sortProducts(products, sort, locale) }
          : null;
      }),
    )
  ).filter(Boolean) as { category: Category; products: Product[] }[];

  return (
    <div>
      {/* Header */}
      <header className="mx-auto max-w-7xl px-6 pb-6 pt-12 text-center md:pb-8 md:pt-14">
        <Crest className="mb-4" />
        <p className="overline">{dict.collection.subtitle}</p>
        <h1 className="mt-4 font-serif text-4xl text-ink md:text-5xl">
          {dict.collection.title}
        </h1>
        <div className="gold-rule mx-auto mt-5" />
        <div className="mt-5 flex justify-center">
          <SortSelect value={sort} labels={dict.sort} />
        </div>
      </header>

      {/* Sticky in-page navigation through the categories, in order.
          top-* per breakpoint clears the site header (~68 px on
          phones, ~85 px on md+). Scrolls horizontally on mobile
          (justify-start) so every category stays reachable even when
          "Isqueiros" would otherwise get centred off-screen. */}
      <nav className="sticky top-16 z-40 border-y border-line bg-cream/95 backdrop-blur md:top-[85px]">
        <ol className="mx-auto flex max-w-7xl items-center justify-start gap-4 overflow-x-auto px-6 py-3 md:justify-center md:gap-6">
          {sections.map(({ category }, i) => (
            <li key={category.slug} className="flex items-center gap-4 md:gap-6">
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
          <div className="mx-auto max-w-7xl px-6 py-12 md:py-14">
            <div className="flex flex-col items-center text-center">
              <h2 className="font-serif text-3xl text-ink md:text-4xl">
                {category.name[locale]}
              </h2>
              <p className="overline mt-3">{category.tagline[locale]}</p>
              <div className="gold-rule mx-auto mt-4" />
            </div>

            <div className="mt-8">
              {(() => {
                // Group this category's products by model line, title each.
                const groups: { line: string; items: Product[] }[] = [];
                const at = new Map<string, number>();
                for (const p of products) {
                  if (!at.has(p.collection)) {
                    at.set(p.collection, groups.length);
                    groups.push({ line: p.collection, items: [] });
                  }
                  groups[at.get(p.collection)!].items.push(p);
                }
                return groups.map((g) => (
                  <div key={g.line} className="mt-10 first:mt-0">
                    <div className="mb-5 flex items-center gap-5">
                      <h3 className="min-w-0 font-serif text-xl break-words text-ink md:text-2xl">
                        {g.line}
                      </h3>
                      <span className="h-px flex-1 bg-line" />
                    </div>
                    <div className="product-grid flex flex-wrap justify-center gap-5 sm:gap-7 lg:gap-8">
                      {g.items.flatMap(expandProductCards).map(({ product, sku }) => (
                        <div
                          key={`${product.slug}-${sku}`}
                          className="w-[calc(50%-0.625rem)] sm:w-[calc(50%-0.875rem)] lg:w-[calc(25%-1.5rem)]"
                        >
                          <ProductCard product={product} lang={locale} variantSku={sku} />
                        </div>
                      ))}
                    </div>
                  </div>
                ));
              })()}
            </div>

            <div className="mt-8 text-center">
              <Link
                href={`/${locale}/c/${localeCategorySlug(locale, category.slug)}`}
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
