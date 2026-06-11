import Link from "next/link";
import Image from "next/image";
import { isLocale, getDictionary, type Locale } from "@/lib/i18n";
import { getNovelties, expandProductCards } from "@/lib/catalog";
import { STORE } from "@/lib/store-info";
import { ProductCard } from "@/components/product-card";
import { ScrollCue } from "@/components/scroll-cue";
import { notFound } from "next/navigation";

// 8 home-page tiles — mirror the official st-dupont.com homepage layout.
// Each tile carries an image scraped from the live Maison site (in
// /public/categories-home) and routes to the right place in our catalogue.
function homeCategories(locale: Locale) {
  return [
    { key: "lighters", labelPt: "Isqueiros", labelEn: "Lighters", href: `/${locale}/c/isqueiros`, img: "/categories-home/lighters.jpg" },
    { key: "writing", labelPt: "Instrumentos de Escrita", labelEn: "Writing Instruments", href: `/${locale}/c/escrita`, img: "/categories-home/writing.jpg" },
    { key: "cigar-cases", labelPt: "Estojos de Charuto", labelEn: "Cigar Cases", href: `/${locale}/t/smoking?type=cases`, img: "/categories-home/cigar-cases.jpg" },
    { key: "cigar-accessories", labelPt: "Acessórios de Charuto", labelEn: "Cigar Accessories", href: `/${locale}/t/smoking`, img: "/categories-home/cigar-accessories.jpg" },
    { key: "small-leather", labelPt: "Pequena Marroquinaria", labelEn: "Small Leather Goods", href: `/${locale}/t/small-leather`, img: "/categories-home/small-leather.jpg" },
    { key: "leather", labelPt: "Marroquinaria", labelEn: "Leather Goods", href: `/${locale}/c/pele`, img: "/categories-home/leather.jpg" },
    { key: "cufflinks", labelPt: "Botões de Punho", labelEn: "Cufflinks", href: `/${locale}/t/cufflinks`, img: "/categories-home/cufflinks.jpg" },
    { key: "belts", labelPt: "Cintos", labelEn: "Belts", href: `/${locale}/t/belts`, img: "/categories-home/belts.jpg" },
  ];
}

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const dict = getDictionary(locale);
  const novelties = await getNovelties(8);
  const tiles = homeCategories(locale);

  return (
    <>
      {/* Cinematic hero: full-bleed Maison video + a single Cohiba CTA. The
          wordmark / eyebrow / subtitle / dual CTAs of the previous hero are
          gone — the video does the storytelling. */}
      <section className="text-cream">
        <div className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-6 text-center">
          {/* Full-bleed cinematic hero video. The Maison ships two crops —
              portrait for mobile, landscape for desktop. Auto-plays muted on
              load (the only way modern browsers permit autoplay), loops, and
              falls back to the previous still images as posters while the
              MP4 is buffering. The ink gradient sits on top so the cream
              lettering stays legible against the footage. */}
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/hero/homepage-bg-mobile.png"
            className="absolute inset-0 z-0 h-full w-full object-cover object-center sm:hidden"
          >
            <source src="/videos/hero-mobile.mp4" type="video/mp4" />
          </video>
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/hero/homepage-bg.jpg"
            className="absolute inset-0 z-0 hidden h-full w-full object-cover sm:block"
          >
            <source src="/videos/hero-desktop.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 z-10 bg-gradient-to-b from-ink/40 via-ink/20 to-ink/60" />

          {/* Single Cohiba CTA — discovers the 60th-anniversary collection. */}
          <div className="relative z-20 flex flex-col items-center">
            <Link
              href={`/${locale}/c/isqueiros?col=Cohiba`}
              className="reveal inline-block border border-gold-soft bg-ink/40 px-12 py-5 text-xs tracking-[0.22em] text-cream uppercase backdrop-blur-sm transition-colors duration-300 hover:bg-gold-soft hover:text-ink"
            >
              {dict.hero.discoverCohiba}
            </Link>
          </div>

          {/* Cue pinned near the bottom — invites the user down to the 8 tiles. */}
          <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 sm:bottom-6">
            <ScrollCue label={dict.sections.categories} />
          </div>
        </div>
      </section>

      {/* 8 category tiles — mirrors the official st-dupont.com homepage grid.
          Each card opens to its destination in our catalogue. */}
      <section id="categories" className="bg-cream">
        <div className="mx-auto w-full max-w-7xl px-6 py-16 sm:py-20 lg:py-24">
          <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4 lg:gap-6">
            {tiles.map((t, i) => (
              <Link
                key={t.key}
                href={t.href}
                className={`lux-hover reveal reveal-d${i % 4} group relative flex aspect-[4/5] flex-col justify-end overflow-hidden border border-line/40`}
              >
                <Image
                  src={t.img}
                  alt={locale === "pt" ? t.labelPt : t.labelEn}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/10 to-transparent" />
                <div className="relative z-10 w-full px-4 pb-5 text-center">
                  <h3 className="font-serif text-base text-cream md:text-lg">
                    {locale === "pt" ? t.labelPt : t.labelEn}
                  </h3>
                  <span className="mx-auto mt-2 block h-px w-6 bg-cream/40 transition-all duration-300 group-hover:w-12 group-hover:bg-gold-soft" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Novidades grid */}
      <section className="mx-auto max-w-7xl px-6 pb-28 pt-28">
        <div className="reveal text-center">
          <p className="overline">{dict.sections.novelties}</p>
          <h2 className="mt-5 font-serif text-4xl text-ink">{dict.sections.noveltiesSub}</h2>
          <div className="gold-rule mx-auto mt-7" />
        </div>
        <div className="product-grid mt-14 grid grid-cols-2 gap-5 sm:gap-7 lg:grid-cols-4 lg:gap-8">
          {novelties.flatMap(expandProductCards).slice(0, 8).map(({ product, sku }, i) => (
            <div
              key={`${product.slug}-${sku}`}
              className={`reveal reveal-d${i % 4} ${i >= 6 ? "hidden lg:block" : ""}`}
            >
              <ProductCard product={product} lang={locale} variantSku={sku} />
            </div>
          ))}
        </div>
      </section>

      {/* Heritage — gold-on-black */}
      <section className="monogram-bg text-cream">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 py-28 md:grid-cols-2">
          <div className="reveal text-center">
            <p className="overline text-gold-soft">{dict.sections.heritageEyebrow}</p>
            <h2 className="mt-6 font-serif text-4xl leading-snug md:text-5xl">
              {dict.sections.heritageTitle}
            </h2>
            <div className="gold-rule mx-auto my-7" />
            <p className="text-cream/70">{dict.sections.heritageBody}</p>
            <Link
              href={`/${locale}/historia`}
              className="mt-9 inline-block text-xs tracking-[0.22em] text-gold-soft uppercase transition-colors hover:text-cream"
            >
              {dict.sections.heritageCta} →
            </Link>
          </div>
          <div className="reveal reveal-d2 relative aspect-square overflow-hidden border border-gold-soft/30">
            <Image
              src="/heritage/heritage-1872.png"
              alt="S.T. Dupont — 1872"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover opacity-95"
            />
          </div>
        </div>
      </section>

      {/* Boutique */}
      <section className="reveal mx-auto max-w-3xl px-6 py-32 text-center">
        <p className="overline">{dict.sections.boutiqueEyebrow}</p>
        <h2 className="mt-6 font-serif text-4xl text-ink">{dict.sections.boutiqueTitle}</h2>
        <div className="gold-rule mx-auto my-8" />
        <p className="text-muted">{dict.sections.boutiqueBody}</p>
        <p className="mt-8 text-sm tracking-widest text-ink uppercase">
          {STORE.venue} · {STORE.street} · {locale === "pt" ? "Piso 0" : "Floor 0"}
        </p>
        <div className="mt-10 flex justify-center">
          <Link
            href={`/${locale}/loja`}
            className="inline-block bg-ink px-10 py-4 text-xs tracking-[0.22em] text-cream uppercase transition-colors duration-300 hover:bg-gold hover:text-ink"
          >
            {dict.footer.viewStore}
          </Link>
        </div>
      </section>
    </>
  );
}
