"use client";

import Link from "next/link";
import { useConsent } from "@/lib/consent";
import type { Locale } from "@/lib/i18n";

// Slim bottom strip, cream-on-ink for contrast. Renders nothing when
// the user has already decided (or when the app is server-rendering /
// pre-hydration). Two decisions: Accept all (essential + analytics)
// or Essentials only.
export function CookieBanner({
  lang,
  labels,
}: {
  lang: Locale;
  labels: {
    title: string;
    body: string;
    accept: string;
    reject: string;
    privacyLink: string;
  };
}) {
  const { consent, decided, accept, reject } = useConsent();
  // Hide until the client-side ConsentProvider has finished reading
  // localStorage. `decided` is only true after mount AND with a stored
  // choice — so a first-visit undecided user still gets the banner.
  if (decided || consent !== null) return null;
  return (
    <div
      role="region"
      aria-label={labels.title}
      className="fixed inset-x-0 bottom-0 z-[90] border-t border-cream/20 bg-ink text-cream shadow-[0_-16px_40px_-24px_rgba(6,16,32,0.55)]"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:gap-8 md:py-4">
        <div className="min-w-0 flex-1">
          <p className="overline text-gold-soft">{labels.title}</p>
          <p className="mt-1.5 text-[0.75rem] leading-relaxed text-cream/85 md:text-xs">
            {labels.body}{" "}
            <Link
              href={`/${lang}/legal/privacidade`}
              className="underline underline-offset-4 hover:text-gold"
            >
              {labels.privacyLink}
            </Link>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 md:shrink-0">
          <button
            type="button"
            onClick={reject}
            className="border border-cream/40 px-5 py-2.5 text-[0.65rem] tracking-[0.22em] text-cream uppercase transition-colors duration-300 hover:border-gold hover:text-gold"
          >
            {labels.reject}
          </button>
          <button
            type="button"
            onClick={accept}
            className="bg-gold px-5 py-2.5 text-[0.65rem] tracking-[0.22em] text-ink uppercase transition-colors duration-300 hover:bg-cream hover:text-ink"
          >
            {labels.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
