import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, getDictionary, type Locale } from "@/lib/i18n";
import { legalDocs } from "@/lib/legal";
import { LEGAL_IS_DRAFT } from "@/lib/store-info";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; doc: string }>;
}): Promise<Metadata> {
  const { lang, doc } = await params;
  const d = legalDocs[doc];
  if (!isLocale(lang) || !d) return {};
  // Block indexing while the docs are draft; once LEGAL_IS_DRAFT is
  // flipped off (counsel reviewed), allow Google to surface them.
  return {
    title: d.title[lang as Locale],
    robots: LEGAL_IS_DRAFT ? { index: false, follow: true } : undefined,
  };
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ lang: string; doc: string }>;
}) {
  const { lang, doc } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const d = legalDocs[doc];
  if (!d) notFound();
  const dict = getDictionary(locale);

  return (
    <div>
      <section className="monogram-bg text-cream">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <p className="overline text-gold-soft">{dict.footer.legal}</p>
          <h1 className="mt-6 font-serif text-4xl font-light leading-tight md:text-5xl">
            {d.title[locale]}
          </h1>
          <div className="gold-rule mx-auto my-7" />
          <p className="text-sm text-cream/60">
            {dict.legal.updated}: {d.updated[locale]}
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-6 py-20">
        {/* Draft notice gated behind LEGAL_IS_DRAFT in lib/store-info.
            Flip the flag back on while the text is being reviewed by
            counsel. */}
        {LEGAL_IS_DRAFT && (
          <p className="mb-12 border border-gold/40 bg-gold/5 px-5 py-4 text-xs leading-relaxed tracking-wide text-muted">
            {dict.legal.draftNotice}
          </p>
        )}

        <p className="text-lg leading-relaxed text-ink">{d.intro[locale]}</p>

        <div className="mt-12 space-y-12">
          {d.sections.map((sec) => (
            <section key={sec.h[locale]}>
              <h2 className="font-serif text-2xl text-ink">{sec.h[locale]}</h2>
              <div className="gold-rule mt-4" />
              <div className="mt-5 space-y-4 leading-relaxed text-muted">
                {sec.p.map((para, i) => (
                  <p key={i}>{para[locale]}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-16 border-t border-line pt-8">
          <Link
            href={`/${locale}/loja`}
            className="inline-flex items-center gap-2 text-xs tracking-[0.2em] text-gold uppercase transition-colors hover:text-ink"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {dict.legal.backToStore}
          </Link>
        </div>
      </article>
    </div>
  );
}
