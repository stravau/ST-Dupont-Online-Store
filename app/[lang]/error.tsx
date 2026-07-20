"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Crest } from "@/components/crest";
import { STORE_LIS } from "@/lib/store-info";

// Error boundary for the public storefront. Every catalogue page awaits a
// Neon/Prisma query; if the DB times out or a query throws, this renders a
// calm, on-brand recovery screen (crest + serif apology + "try again") instead
// of Next's raw error page. Client component per the App Router contract.
export default function StorefrontError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("[storefront error]", error);
  }, [error]);

  const en = typeof window !== "undefined" && window.location.pathname.startsWith("/en");
  const t = en
    ? { eyebrow: "Unexpected error", title: "Something went wrong", body: "We couldn't load this page. Please try again — if it persists, reach the boutique and we'll help.", retry: "Try again", home: "Back to home", contact: "Contact us" }
    : { eyebrow: "Erro inesperado", title: "Algo correu mal", body: "Não foi possível carregar esta página. Tenta novamente — se persistir, contacta a boutique e ajudamos.", retry: "Tentar novamente", home: "Voltar ao início", contact: "Contactar-nos" };
  const home = en ? "/en" : "/pt";

  return (
    <section className="monogram-bg relative overflow-hidden text-cream">
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-ink/70 via-ink/60 to-ink/85" />
      <div className="relative z-10 mx-auto max-w-3xl px-6 py-24 text-center md:py-28">
        <div className="flex flex-col items-center">
          <Crest className="mb-6 text-gold-soft" />
          <p className="overline text-gold-soft">{t.eyebrow}</p>
          <h1 className="mt-5 font-serif text-4xl leading-tight md:text-5xl">{t.title}</h1>
          <div className="gold-rule mx-auto my-7" />
          <p className="max-w-xl text-sm text-cream/80 md:text-base">{t.body}</p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => reset()}
              className="border border-gold bg-gold/10 px-6 py-3 text-[0.7rem] tracking-[0.2em] text-gold uppercase transition-colors hover:bg-gold hover:text-ink"
            >
              {t.retry}
            </button>
            <Link
              href={home}
              className="border border-cream/40 px-6 py-3 text-[0.7rem] tracking-[0.2em] uppercase transition-colors hover:border-gold hover:text-gold"
            >
              {t.home}
            </Link>
          </div>
          <p className="mt-10 text-xs tracking-[0.18em] text-cream/60 uppercase">
            <a href={`mailto:${STORE_LIS.email}`} className="transition-colors hover:text-gold">
              {t.contact} · {STORE_LIS.email}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
