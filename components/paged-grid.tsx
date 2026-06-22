import Link from "next/link";
import type { ReactNode } from "react";

// Wraps a list of pre-rendered (server-side) card ReactNodes in the shared
// product grid. On mobile, cards past `mobileChunk` collapse and the bordered
// "Show all products" Link below drops pagination entirely via ?all=1. The
// link replaces both the previous client-toggle "show more on this page"
// (which only revealed the current slice) and the paginator's footer
// underlined "show all" — one CTA, one behaviour.
export function PagedGrid({
  items,
  className,
  showAllLabel,
  showAllHref,
  isShowingAll = false,
  mobileChunk = 24,
}: {
  items: ReactNode[];
  className: string;
  showAllLabel: string;
  showAllHref: string;
  isShowingAll?: boolean;
  mobileChunk?: number;
}) {
  const hasOverflow = !isShowingAll && items.length > mobileChunk;
  return (
    <>
      <div className={className}>
        {items.map((node, i) => {
          const hideOnMobile = hasOverflow && i >= mobileChunk;
          return (
            <div key={i} className={hideOnMobile ? "hidden sm:contents" : "contents"}>
              {node}
            </div>
          );
        })}
      </div>
      {hasOverflow && (
        <div className="mt-10 text-center sm:hidden">
          {/* scroll={false} so Next.js doesn't auto-scroll to top on click
              — we want the user to STAY on the bottom of the page and
              just see more items load below. */}
          <Link
            href={showAllHref}
            scroll={false}
            className="inline-block border border-ink px-10 py-4 text-xs tracking-[0.22em] text-ink uppercase transition-colors duration-300 hover:bg-ink hover:text-cream"
          >
            {showAllLabel}
          </Link>
        </div>
      )}
    </>
  );
}
