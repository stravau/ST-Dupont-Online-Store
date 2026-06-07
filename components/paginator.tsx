import Link from "next/link";

// Prev · page x of y · Next, preserving all other search params.
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
  const link = (p: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) if (v) params.set(k, v);
    if (p === 1) params.delete("page");
    else params.set("page", String(p));
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };
  const linkCls =
    "inline-flex items-center gap-2 border border-line px-5 py-3 text-xs tracking-[0.18em] text-ink uppercase transition-colors duration-300 hover:border-gold hover:text-gold";
  const disabledCls =
    "inline-flex items-center gap-2 border border-line/40 px-5 py-3 text-xs tracking-[0.18em] text-muted/40 uppercase";

  return (
    <nav
      aria-label="Pagination"
      className="mt-16 flex flex-wrap items-center justify-center gap-6"
    >
      {page > 1 ? (
        <Link href={link(page - 1)} className={linkCls}>
          ← {prevLabel}
        </Link>
      ) : (
        <span className={disabledCls}>← {prevLabel}</span>
      )}
      <span className="text-xs tracking-[0.2em] text-muted uppercase">
        {page} / {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={link(page + 1)} className={linkCls}>
          {nextLabel} →
        </Link>
      ) : (
        <span className={disabledCls}>{nextLabel} →</span>
      )}
    </nav>
  );
}
