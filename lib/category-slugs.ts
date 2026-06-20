// English-locale aliases for the four canonical category slugs. The DB
// (Prisma) and the seed store the PT slugs (isqueiros / escrita / pele /
// acessorios) — the EN route at /en/c/<slug> accepts either form and
// always resolves to the canonical PT slug before any data lookup.
//
// URL emitters call `categoryHref(lang, slug)` to render the locale-
// appropriate slug; only EN gets rewritten. PT pages stay unchanged.

import type { Locale } from "@/lib/i18n";

const EN_BY_CANONICAL: Record<string, string> = {
  isqueiros: "lighters",
  escrita: "writing",
  pele: "leather",
  acessorios: "accessories",
};

const CANONICAL_BY_EN: Record<string, string> = Object.fromEntries(
  Object.entries(EN_BY_CANONICAL).map(([k, v]) => [v, k]),
);

// Canonical PT slug for either an EN alias or a PT slug. Used by the
// [category] route to normalise whatever came in via the URL.
export function resolveCategorySlug(input: string): string {
  return CANONICAL_BY_EN[input] ?? input;
}

// Locale-appropriate slug for URL emission. EN routes use English slugs
// (better SEO + cleaner URLs); PT stays canonical.
export function localeCategorySlug(lang: Locale, canonical: string): string {
  if (lang === "en") return EN_BY_CANONICAL[canonical] ?? canonical;
  return canonical;
}

// Convenience — full category href with locale + slug, optional query.
export function categoryHref(lang: Locale, canonical: string, query?: string): string {
  const slug = localeCategorySlug(lang, canonical);
  return `/${lang}/c/${slug}${query ? `?${query}` : ""}`;
}
