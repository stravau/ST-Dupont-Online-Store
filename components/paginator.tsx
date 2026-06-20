import Link from "next/link";

// Prev · page x of y · Next. Pure pagination control — the "show all" CTA
// lives on PagedGrid / CategoryPaged instead so there's one button per page,
// pinned above the paginator with the bordered look the user prefers.
// Renders nothing when there's only one page so listing pages stay clean.
export function Paginator({
  pathname,
  query,
  page,
  totalPages,
  prevLabel,
  nextLabel,
}: {
  pathname: string;
  query: Record<string, string | undefined>;
  page: number;
  totalPages: number;
  prevLabel: string;
  nextLabel: string;
}) {
  if (totalPages <= 1) return null;
  const link = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) if (v) params.set(k, v);
    for (const [k, v] of Object.entries(overrides)) {
      if (v) params.set(k, v);
      else params.delete(k);
    }
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };
  const pageLink = (p: number) =>
    link({ page: p === 1 ? undefined : String(p) });
  // Compact, single-line layout — Prev · n/total · Next stays on one row
  // even on narrow iOS columns. min-w-0 + shrink-0 keep the borders from
  // wrapping the label text under tight widths.
  const linkCls =
    "inline-flex shrink-0 items-center gap-1 whitespace-nowrap border border-line px-3 py-2 text-[0.65rem] tracking-[0.14em] text-ink uppercase transition-colors duration-300 hover:border-gold hover:text-gold sm:gap-2 sm:px-5 sm:py-3 sm:text-xs sm:tracking-[0.18em]";
  const disabledCls =
    "inline-flex shrink-0 items-center gap-1 whitespace-nowrap border border-line/40 px-3 py-2 text-[0.65rem] tracking-[0.14em] text-muted/40 uppercase sm:gap-2 sm:px-5 sm:py-3 sm:text-xs sm:tracking-[0.18em]";

  return (
    <nav
      aria-label="Pagination"
      className="mt-16 flex flex-nowrap items-center justify-center gap-3 sm:gap-6"
    >
      {page > 1 ? (
        <Link href={pageLink(page - 1)} className={linkCls}>
          ← {prevLabel}
        </Link>
      ) : (
        <span className={disabledCls}>← {prevLabel}</span>
      )}
      <span className="shrink-0 whitespace-nowrap text-[0.65rem] tracking-[0.18em] text-muted uppercase sm:text-xs sm:tracking-[0.2em]">
        {page} / {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={pageLink(page + 1)} className={linkCls}>
          {nextLabel} →
        </Link>
      ) : (
        <span className={disabledCls}>{nextLabel} →</span>
      )}
    </nav>
  );
}
