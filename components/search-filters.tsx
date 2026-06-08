import Link from "next/link";

// Two horizontal rows of chips below the search box: Categories and
// Collections. Each chip is a link that toggles its filter in the URL
// (preserving q + sort, dropping page). An active chip shows in ink+cream;
// inactive in line+ink. Renders nothing if there's only one option, since a
// single chip is redundant.
export interface FacetOption {
  value: string;
  label: string;
  count: number;
}

function chipClass(active: boolean): string {
  return `inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] tracking-[0.18em] uppercase transition-colors duration-300 ${
    active
      ? "border-gold bg-ink text-cream"
      : "border-line text-muted hover:border-gold hover:text-ink"
  }`;
}

function FilterRow({
  label,
  options,
  paramKey,
  active,
  allLabel,
  buildHref,
}: {
  label: string;
  options: FacetOption[];
  paramKey: "cat" | "col";
  active: string | undefined;
  allLabel: string;
  buildHref: (overrides: Record<string, string | undefined>) => string;
}) {
  if (options.length <= 1) return null;
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <span className="mr-1 text-[11px] tracking-[0.2em] text-muted uppercase">
        {label}
      </span>
      <Link href={buildHref({ [paramKey]: undefined })} className={chipClass(!active)}>
        {allLabel}
      </Link>
      {options.map((o) => (
        <Link
          key={o.value}
          href={buildHref({ [paramKey]: o.value })}
          className={chipClass(active === o.value)}
        >
          {o.label}
          <span className="text-muted/70">{o.count}</span>
        </Link>
      ))}
    </div>
  );
}

export function SearchFilters({
  pathname,
  query,
  sort,
  activeCategory,
  activeCollection,
  categories,
  collections,
  labels,
}: {
  pathname: string;
  query: string;
  sort: string;
  activeCategory?: string;
  activeCollection?: string;
  categories: FacetOption[];
  collections: FacetOption[];
  labels: { categories: string; collections: string; all: string };
}) {
  if (categories.length <= 1 && collections.length <= 1) return null;

  const buildHref = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (sort && sort !== "featured") params.set("sort", sort);
    // Carry the unaffected filter forward; "cat" in overrides means we're
    // changing the category, in which case we also drop any collection
    // (collections rarely span categories, and a stale value yields 0 hits).
    if (activeCategory && !("cat" in overrides)) params.set("cat", activeCategory);
    if (activeCollection && !("col" in overrides) && !("cat" in overrides)) {
      params.set("col", activeCollection);
    }
    for (const [k, v] of Object.entries(overrides)) {
      if (v) params.set(k, v);
      else params.delete(k);
    }
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  return (
    <div className="mt-8 flex flex-col items-center gap-3">
      <FilterRow
        label={labels.categories}
        options={categories}
        paramKey="cat"
        active={activeCategory}
        allLabel={labels.all}
        buildHref={buildHref}
      />
      <FilterRow
        label={labels.collections}
        options={collections}
        paramKey="col"
        active={activeCollection}
        allLabel={labels.all}
        buildHref={buildHref}
      />
    </div>
  );
}
