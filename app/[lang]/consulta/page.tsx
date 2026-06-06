import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, getDictionary, type Locale } from "@/lib/i18n";
import { STORE, mapsDirectionsUrl } from "@/lib/store-info";
import { inquiryMailto } from "@/lib/inquiry";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang as Locale);
  return { title: dict.consultation.title, description: dict.consultation.lede };
}

export default async function ConsultationPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const dict = getDictionary(locale);
  const c = dict.consultation;

  const bookMail = inquiryMailto({
    subject: c.bookSubject,
    body: c.bookBody,
    data: {},
  });

  return (
    <div>
      {/* Hero — same monogram backdrop as /loja so the maison feel carries */}
      <section className="monogram-bg text-cream">
        <div className="mx-auto max-w-4xl px-6 py-28 text-center">
          <p className="overline text-gold-soft">{c.eyebrow}</p>
          <h1 className="mt-6 font-serif text-5xl font-light leading-tight md:text-6xl">
            {c.title}
          </h1>
          <div className="gold-rule mx-auto my-8" />
          <p className="mx-auto max-w-2xl text-base font-light text-cream/75 md:text-lg">
            {c.lede}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href={bookMail}
              className="inline-flex items-center justify-center gap-3 bg-gold-soft px-10 py-4 text-xs tracking-[0.22em] text-ink uppercase transition-colors duration-300 hover:bg-cream"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <rect x="3.5" y="5" width="17" height="15" rx="1.5" />
                <path d="M8 3.5v3M16 3.5v3M3.5 10h17" strokeLinecap="round" />
              </svg>
              {c.bookCta}
            </a>
            <a
              href={STORE.phoneHref}
              className="inline-flex items-center justify-center gap-3 border border-gold-soft px-10 py-4 text-xs tracking-[0.22em] text-cream uppercase transition-colors duration-300 hover:bg-gold-soft hover:text-ink"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2Z" strokeLinejoin="round" />
              </svg>
              {c.callCta}
            </a>
          </div>
        </div>
      </section>

      {/* Three pillars — what to expect */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <p className="overline text-center">{c.pillarsTitle}</p>
        <div className="gold-rule mx-auto mt-4" />
        <div className="mt-14 grid gap-12 md:grid-cols-3">
          {c.pillars.map((p) => (
            <article key={p.title} className="text-center">
              <h3 className="font-serif text-2xl text-ink">{p.title}</h3>
              <div className="gold-rule mx-auto my-5" />
              <p className="text-sm leading-relaxed text-muted">{p.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* How it works — three numbered steps */}
      <section className="border-y border-line bg-paper">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">
          <p className="overline">{c.howTitle}</p>
          <div className="gold-rule mx-auto mt-4" />
          <ol className="mt-12 grid gap-10 md:grid-cols-3">
            {c.steps.map((s, i) => (
              <li key={s} className="flex flex-col items-center">
                <span className="font-serif text-3xl text-gold">{String(i + 1).padStart(2, "0")}</span>
                <p className="mt-4 text-sm leading-relaxed text-ink">{s}</p>
              </li>
            ))}
          </ol>
          <a
            href={bookMail}
            className="mt-14 inline-flex items-center justify-center gap-3 bg-ink px-10 py-4 text-xs tracking-[0.22em] text-cream uppercase transition-colors duration-300 hover:bg-gold hover:text-ink"
          >
            {c.bookCta}
          </a>
        </div>
      </section>

      {/* Visit the boutique — cross-link to /loja */}
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <p className="overline">{c.visitTitle}</p>
        <div className="gold-rule mx-auto mt-4" />
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted">
          {c.visitBody}
        </p>
        <address className="mt-6 not-italic">
          <p className="font-serif text-xl text-ink">{STORE.venue}</p>
          <p className="text-muted">{STORE.street}</p>
          <p className="text-muted">{STORE.postcode}</p>
        </address>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href={`/${locale}/loja`}
            className="inline-flex items-center justify-center gap-3 border border-ink px-8 py-3 text-xs tracking-[0.22em] text-ink uppercase transition-colors duration-300 hover:border-gold hover:text-gold"
          >
            {c.visitCta}
          </Link>
          <a
            href={mapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 bg-ink px-8 py-3 text-xs tracking-[0.22em] text-cream uppercase transition-colors duration-300 hover:bg-gold hover:text-ink"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" strokeLinejoin="round" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            {dict.store.directions}
          </a>
        </div>
      </section>
    </div>
  );
}
