// Editorial empty state — replaces the bare "Nenhum resultado" text
// on /pesquisa and /c/[category] when the query / filter combination
// zeroes out. Reads more like a curated pause than an error: crest,
// serif heading (quoting the query for search), gold rule, lede,
// a suggestions list, and up to two CTAs.
import Link from "next/link";
import { Crest } from "@/components/crest";
import type { Locale } from "@/lib/i18n";

export interface EmptyStateLabels {
  suggestionsMaison: string;
  suggestionsHouses: string;
  suggestionsOtherLines: string;
  clearFilters: string;
  contactBoutique: string;
  searchHeadingPrefix: string;
  searchFilteredHeading: string;
  searchLede: string;
  searchFilteredLede: string;
  categoryHeading: string;
  categoryFilteredHeading: string;
  categoryLede: string;
  categoryFilteredLede: string;
}

export interface EmptyStateSuggestion {
  label: string;
  href: string;
}

export function EditorialEmptyState({
  variant,
  query,
  isFiltered,
  clearFiltersHref,
  suggestions,
  suggestionsHeading,
  lang,
  labels,
}: {
  variant: "search" | "category";
  query?: string;
  isFiltered: boolean;
  clearFiltersHref?: string;
  suggestions: EmptyStateSuggestion[];
  suggestionsHeading: string;
  lang: Locale;
  labels: EmptyStateLabels;
}) {
  const heading =
    variant === "search"
      ? isFiltered
        ? labels.searchFilteredHeading
        : `${labels.searchHeadingPrefix} "${query ?? ""}"`
      : isFiltered
        ? labels.categoryFilteredHeading
        : labels.categoryHeading;
  const lede =
    variant === "search"
      ? isFiltered
        ? labels.searchFilteredLede
        : labels.searchLede
      : isFiltered
        ? labels.categoryFilteredLede
        : labels.categoryLede;

  return (
    <div className="mx-auto mt-14 max-w-3xl px-6 pb-24 text-center">
      <Crest className="mx-auto mb-6 opacity-70" />
      <h2 className="font-serif text-3xl leading-tight text-ink md:text-4xl">
        {heading}
      </h2>
      <div className="gold-rule mx-auto my-6" />
      <p className="mx-auto max-w-xl text-sm text-muted md:text-base">{lede}</p>

      {suggestions.length > 0 && (
        <div className="mt-10">
          <p className="overline">{suggestionsHeading}</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {suggestions.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="inline-flex items-center rounded-full border border-line px-4 py-2 text-[11px] tracking-[0.18em] text-ink uppercase transition-colors duration-300 hover:border-gold hover:text-gold"
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        {isFiltered && clearFiltersHref && (
          <Link
            href={clearFiltersHref}
            className="inline-block bg-ink px-8 py-3.5 text-xs tracking-[0.22em] text-cream uppercase transition-colors duration-300 hover:bg-gold hover:text-ink"
          >
            {labels.clearFilters}
          </Link>
        )}
        <Link
          href={`/${lang}/loja`}
          className="inline-block border border-ink px-8 py-3.5 text-xs tracking-[0.22em] text-ink uppercase transition-colors duration-300 hover:border-gold hover:text-gold"
        >
          {labels.contactBoutique}
        </Link>
      </div>
    </div>
  );
}
