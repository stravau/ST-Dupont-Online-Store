import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, getDictionary, type Locale } from "@/lib/i18n";
import { history } from "@/lib/history";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const l = lang as Locale;
  return { title: history.title[l], description: history.lede[l] };
}

export default async function HistoryPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const l = lang as Locale;
  const dict = getDictionary(l);

  return (
    <div>
      {/* Hero — gold-on-ink with monogram motif */}
      <section className="monogram-bg text-cream">
        <div className="mx-auto max-w-4xl px-6 py-32 text-center">
          <p className="overline text-gold-soft">{history.eyebrow[l]}</p>
          <h1 className="mt-6 font-serif text-5xl font-light leading-tight md:text-7xl">
            {history.title[l]}
          </h1>
          <div className="gold-rule mx-auto my-8" />
          <p className="mx-auto max-w-2xl text-base font-light text-cream/75 md:text-lg">
            {history.lede[l]}
          </p>
        </div>
      </section>

      {/* Intro prose */}
      <section className="mx-auto max-w-3xl px-6 py-24">
        <div className="space-y-6 text-lg leading-relaxed text-ink">
          {history.intro.map((p, i) => (
            <p key={i}>{p[l]}</p>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-paper">
        <div className="mx-auto max-w-4xl px-6 py-24">
          <div className="text-center">
            <p className="overline">{history.timelineTitle[l]}</p>
            <div className="gold-rule mx-auto mt-5" />
          </div>

          <ol className="mt-16 space-y-0">
            {history.timeline.map((e, i) => (
              <li
                key={e.year}
                className={`grid gap-6 py-10 sm:grid-cols-[160px_1fr] ${
                  i > 0 ? "border-t border-line" : ""
                }`}
              >
                <p className="font-serif text-3xl text-gold">{e.year}</p>
                <div>
                  <h2 className="font-serif text-2xl text-ink">{e.title[l]}</h2>
                  <p className="mt-3 text-muted">{e.body[l]}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Savoir-faire — gold-on-ink */}
      <section className="monogram-bg text-cream">
        <div className="mx-auto max-w-3xl px-6 py-28 text-center">
          <p className="overline text-gold-soft">{history.craftTitle[l]}</p>
          <div className="gold-rule mx-auto my-6" />
          <div className="space-y-6 text-lg font-light leading-relaxed text-cream/80">
            {history.craft.map((p, i) => (
              <p key={i}>{p[l]}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Today + closing */}
      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="overline">{history.todayTitle[l]}</p>
        <div className="gold-rule mx-auto my-6" />
        <div className="space-y-6 text-lg leading-relaxed text-ink">
          {history.today.map((p, i) => (
            <p key={i}>{p[l]}</p>
          ))}
        </div>
        <p className="mt-14 font-serif text-2xl italic text-ink">
          “{history.closing[l]}”
        </p>
        <Link
          href={`/${l}/colecao`}
          className="mt-12 inline-block border border-ink px-10 py-4 text-xs tracking-[0.22em] text-ink uppercase transition-colors duration-300 hover:bg-ink hover:text-cream"
        >
          {dict.hero.cta}
        </Link>
      </section>
    </div>
  );
}
