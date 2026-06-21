"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { resolveCategorySlug, localeCategorySlug } from "@/lib/category-slugs";

// Static back control derived from the URL hierarchy — never from
// browser history. The rule is "strip one meaningful step":
//   /c/<cat>?col=X         → /c/<cat>            label = <Category>
//   /c/<cat>?usage=X|g=X   → /c/<cat>            label = <Category>
//   /c/<cat>               → /<lang>             label = Home
//   /t/<group>             → /<lang>/c/acessorios (most /t/ groups are
//                                                  accessory sub-types)
//   /p/<slug>              → hidden (product detail already has
//                                    Breadcrumbs at the top of the body)
//   /loja /historia /…     → /<lang>             label = Home

const CATEGORY_LABELS: Record<string, Record<Locale, string>> = {
  isqueiros: { pt: "Isqueiros", en: "Lighters" },
  escrita: { pt: "Escrita", en: "Writing" },
  pele: { pt: "Pele", en: "Leather" },
  acessorios: { pt: "Acessórios", en: "Accessories" },
};

export function NavBack({ lang, homeLabel }: { lang: Locale; homeLabel: string }) {
  const pathname = usePathname();
  const sp = useSearchParams();
  const home = `/${lang}`;
  if (pathname === home || pathname === `${home}/`) return null;
  // Product detail pages render Breadcrumbs (Home > Category > Product)
  // at the top of the body, so duplicating a back button up here was the
  // first redundancy the user flagged. Stay hidden there.
  if (/^\/[a-z]{2}\/p\/[^/]+/.test(pathname)) return null;

  // Compute the parent.
  let href = home;
  let label = homeLabel;

  const catMatch = pathname.match(/^\/[a-z]{2}\/c\/([^/]+)/);
  if (catMatch) {
    const canonical = resolveCategorySlug(catMatch[1]);
    // Any filter present? Strip back to the unfiltered category instead
    // of jumping all the way home — much closer to what the user expects.
    const hasFilter =
      sp?.has("col") || sp?.has("usage") || sp?.has("g") || sp?.has("page") || sp?.has("all");
    if (hasFilter) {
      const slug = localeCategorySlug(lang, canonical);
      href = `/${lang}/c/${slug}`;
      label = CATEGORY_LABELS[canonical]?.[lang] ?? homeLabel;
    }
    // Unfiltered category page → fall through to home.
  }

  return (
    <div className="mx-auto max-w-7xl px-6 pt-6">
      <Link
        href={href}
        className="inline-flex items-center gap-2 text-[0.7rem] tracking-[0.18em] text-muted uppercase transition-colors hover:text-gold"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {label}
      </Link>
    </div>
  );
}
