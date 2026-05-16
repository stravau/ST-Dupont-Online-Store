import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, getDictionary, type Locale } from "@/lib/i18n";
import { getCategory, getProductsByCategory, getCollections } from "@/lib/catalog";
import { categoryArt } from "@/lib/category-art";
import { myWishlistIds } from "@/lib/cart";
import { ProductCard } from "@/components/product-card";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; category: string }>;
}): Promise<Metadata> {
  const { lang, category } = await params;
  const cat = await getCategory(category);
  if (!isLocale(lang) || !cat) return {};
  return { title: cat.name[lang as Locale] };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; category: string }>;
  searchParams: Promise<{ col?: string }>;
}) {
  const { lang, category } = await params;
  const { col } = await searchParams;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const cat = await getCategory(category);
  if (!cat) notFound();
  const dict = getDictionary(locale);
  const collections = await getCollections(category);
  const activeCol = col && collections.includes(col) ? col : undefined;
  const art = categoryArt[category];
  const items = await getProductsByCategory(category, activeCol);
  const wl = await myWishlistIds();
  const base = `/${locale}/c/${category}`;

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <Breadcrumbs
        items={[
          { label: dict.common.home, href: `/${locale}` },
          { label: cat.name[locale], href: base },
          ...(activeCol ? [{ label: activeCol }] : []),
        ]}
      />

      <header className="mx-auto mt-10 max-w-2xl text-center">
        <p className="overline">{cat.name[locale]}</p>
        <h1 className="mt-5 font-serif text-5xl text-ink md:text-6xl">
          {art?.art ?? cat.name[locale]}
        </h1>
        <div className="gold-rule mx-auto mt-7" />
        {cat.history && (
          <p className="mx-auto mt-7 max-w-xl text-sm leading-relaxed text-muted">
            {cat.history[locale]}
          </p>
        )}
      </header>

      {/* The product types of this universe — each a smart button to its page */}
      {art && (
        <nav className="mt-12 flex flex-wrap items-center justify-center gap-3 border-y border-line py-8">
          {art.groups.map((g) => (
            <Link
              key={g.label[locale]}
              href={`/${locale}${g.href}`}
              className="group inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 text-xs tracking-[0.18em] text-ink uppercase transition-colors duration-300 hover:border-gold hover:bg-ink hover:text-cream"
            >
              {g.label[locale]}
              <span className="text-gold transition-transform duration-300 group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          ))}
        </nav>
      )}

      {(() => {
        // Split: lines with several pen types become one card per type;
        // single-type / colour-only items are isolated in their own row
        // so they don't get confused with the multi-type lineups.
        const multi: ReactNode[] = [];
        const single: ReactNode[] = [];
        for (const p of items) {
          const types: string[] = [];
          for (const v of p.variants) {
            const t = v.attributes.type?.[locale];
            if (t && !types.includes(t)) types.push(t);
          }
          if (types.length > 1) {
            for (const t of types) {
              multi.push(
                <ProductCard
                  key={`${p.slug}-${t}`}
                  product={p}
                  lang={locale}
                  wishlisted={wl.has(p.id)}
                  variantType={t}
                />,
              );
            }
          } else {
            single.push(
              <ProductCard key={p.slug} product={p} lang={locale} wishlisted={wl.has(p.id)} />,
            );
          }
        }
        const grid = "grid gap-6 sm:grid-cols-2 lg:grid-cols-3";
        return (
          <>
            {multi.length > 0 && <div className={`mt-14 ${grid}`}>{multi}</div>}
            {multi.length > 0 && single.length > 0 && (
              <div className="mx-auto mt-20 max-w-xs">
                <div className="gold-rule mx-auto" />
              </div>
            )}
            {single.length > 0 && (
              <div className={`${multi.length > 0 ? "mt-20" : "mt-14"} ${grid}`}>{single}</div>
            )}
          </>
        );
      })()}
    </div>
  );
}
