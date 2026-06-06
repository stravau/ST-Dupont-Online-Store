import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, getDictionary, type Locale } from "@/lib/i18n";
import {
  getCategory,
  getProductsByCategory,
  getCollections,
  sortProducts,
  expandProductCards,
} from "@/lib/catalog";
import { categoryArt } from "@/lib/category-art";
import { isSortKey, type SortKey } from "@/lib/sort";
import { ProductCard } from "@/components/product-card";
import { SortSelect } from "@/components/sort-select";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Crest } from "@/components/crest";

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
  searchParams: Promise<{ col?: string; sort?: string }>;
}) {
  const { lang, category } = await params;
  const { col, sort: sortParam } = await searchParams;
  const sort: SortKey = isSortKey(sortParam) ? sortParam : "featured";
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const cat = await getCategory(category);
  if (!cat) notFound();
  const dict = getDictionary(locale);
  const collections = await getCollections(category);
  const activeCol = col && collections.includes(col) ? col : undefined;
  const art = categoryArt[category];
  const items = sortProducts(
    await getProductsByCategory(category, activeCol),
    sort,
    locale,
  );
  const base = `/${locale}/c/${category}`;

  return (
    <div>
      {art?.hero ? (
        /* Full-bleed photo header. monogram-bg is the fallback if the image
           fails to load. Explicit positive z-stacking instead of -z-10 to
           avoid Safari painting the negative-z image *behind* the parent
           background under body zoom (showed as a navy stripe up top). */
        <header className="monogram-bg relative overflow-hidden text-center text-cream">
          <Image
            src={art.hero}
            alt=""
            fill
            priority
            sizes="100vw"
            className={`absolute inset-0 z-0 scale-125 object-cover sm:scale-100 ${art.heroPos ?? "object-center"}`}
          />
          <div className="absolute inset-0 z-10 bg-gradient-to-b from-ink/80 via-ink/65 to-ink/90" />
          <div className="relative z-20 mx-auto max-w-2xl px-6 py-20 sm:py-28 md:py-36">
            <Crest className="mb-6 text-gold-soft" />
            <p className="overline text-gold-soft">{cat.name[locale]}</p>
            <h1 className="mt-4 font-serif text-5xl md:text-6xl">{art.art}</h1>
            <div className="gold-rule mx-auto mt-7" />
            {cat.history && (
              <p className="mx-auto mt-7 max-w-xl text-sm leading-relaxed text-cream/85">
                {cat.history[locale]}
              </p>
            )}
          </div>
        </header>
      ) : null}

      <div className="mx-auto max-w-7xl px-6 py-12">
        <Breadcrumbs
          items={[
            { label: dict.common.home, href: `/${locale}` },
            { label: cat.name[locale], href: base },
            ...(activeCol ? [{ label: activeCol }] : []),
          ]}
        />

        {!art?.hero && (
          <header className="mx-auto mt-2 max-w-2xl text-center">
            <Crest className="mb-6" />
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
        )}

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

      <div className="mt-10 flex justify-end">
        <SortSelect value={sort} labels={dict.sort} />
      </div>

      {(() => {
        // Group the catalogue by model line (collection); a title precedes
        // each line. Each (product, colourway) is one tile, so multi-colour
        // products flat-map into one card per colour rather than swatches.
        const groups: { line: string; cards: ReactNode[] }[] = [];
        const at = new Map<string, number>();
        for (const p of items) {
          const cards: ReactNode[] = [];
          for (const { sku } of expandProductCards(p)) {
            cards.push(
              <ProductCard
                key={`${p.slug}-${sku}`}
                product={p}
                lang={locale}
                variantSku={sku}
              />,
            );
          }
          if (cards.length === 0) continue;
          if (!at.has(p.collection)) {
            at.set(p.collection, groups.length);
            groups.push({ line: p.collection, cards: [] });
          }
          groups[at.get(p.collection)!].cards.push(...cards);
        }
        return (
          <div className="mt-12">
            {groups.map((g) => (
              <section key={g.line} className="mt-20 first:mt-0">
                <div className="mb-8 flex items-center gap-5">
                  <h2 className="min-w-0 font-serif text-2xl break-words text-ink md:text-3xl">
                    {g.line}
                  </h2>
                  <span className="h-px flex-1 bg-line" />
                </div>
                {/* Flex + justify-center so a line that doesn't fill the row
                    of 4 stays centred. Widths match the chosen gap so
                    rows align edge-to-edge on a 2-up / 4-up grid. */}
                <div className="product-grid flex flex-wrap justify-center gap-5 sm:gap-7 lg:gap-8">
                  {g.cards.map((card, i) => (
                    <div
                      key={i}
                      className="w-[calc(50%-0.625rem)] sm:w-[calc(50%-0.875rem)] lg:w-[calc(25%-1.5rem)]"
                    >
                      {card}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        );
      })()}
      </div>
    </div>
  );
}
