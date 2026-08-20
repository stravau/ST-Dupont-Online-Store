import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, getDictionary, locales, type Locale } from "@/lib/i18n";
import { getCuratedCards } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";

export const dynamic = "force-dynamic";

const RAIL = "DESTAQUES";

// A compilação por trás do botão da faixa "Em Destaque": a mesma selecção do
// carrossel, mas numa grelha onde se vê tudo de uma vez em vez de a passar de
// três em três.
//
// O título segue a mesma regra do botão: se tudo o que o patrão escolheu for
// da mesma colecção, a página anuncia essa colecção pelo nome; com colecções
// misturadas fica "Em Destaque", que é o que a selecção é de facto.
async function carregar(locale: Locale) {
  const curated = await getCuratedCards(RAIL);
  const coleccoes = new Set(curated.map(({ product }) => product.collection).filter(Boolean));
  const unica = coleccoes.size === 1 ? [...coleccoes][0] : null;
  const dict = getDictionary(locale);
  return {
    curated,
    dict,
    titulo: unica ?? dict.sections.featuredSub,
    eyebrow: dict.sections.featured,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const locale = lang as Locale;
  const { curated, titulo } = await carregar(locale);
  // Sem selecção não há página — não damos metadados a uma coisa que dá 404.
  if (curated.length === 0) return {};
  return {
    title: titulo,
    alternates: {
      canonical: `/${locale}/destaques`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}/destaques`])),
    },
  };
}

export default async function DestaquesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const { curated, titulo, eyebrow } = await carregar(locale);
  // Carrossel vazio no admin = secção que não existe na homepage. A página não
  // deve existir também, em vez de ficar uma grelha em branco.
  if (curated.length === 0) notFound();

  return (
    <main className="bg-cream">
      <section className="mx-auto max-w-7xl px-6 pt-24 pb-6 text-center">
        <p className="overline">{eyebrow}</p>
        <h1 className="mt-5 font-serif text-4xl text-ink">{titulo}</h1>
        <div className="gold-rule mx-auto mt-7" />
        <p className="mt-6 text-[0.8rem] tracking-[0.14em] text-muted uppercase">
          {curated.length} {locale === "pt" ? (curated.length === 1 ? "artigo" : "artigos") : curated.length === 1 ? "item" : "items"}
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-28">
        <div className="product-grid grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {curated.map(({ product, sku }) => (
            <ProductCard
              key={`${product.slug}-${sku}`}
              product={product}
              lang={locale}
              variantSku={sku}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
