"use client";

import { useState } from "react";
import type { ReactNode } from "react";

// Wraps a list of pre-rendered (server-side) card ReactNodes in the shared
// product grid. On mobile, the first `mobileChunk` items are visible and the
// rest are hidden behind a "Show more on this page" client toggle. Desktop
// always sees everything (server already capped the page at DESKTOP_PER_PAGE).
export function PagedGrid({
  items,
  className,
  mobileChunk = 24,
  showMoreLabel,
  collapseLabel,
}: {
  items: ReactNode[];
  className: string;
  mobileChunk?: number;
  showMoreLabel: string;
  collapseLabel: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasOverflow = items.length > mobileChunk;
  return (
    <>
      <div className={className}>
        {items.map((node, i) => {
          const hideOnMobile = !expanded && hasOverflow && i >= mobileChunk;
          // `contents` makes the wrapper invisible to the parent grid (the
          // inner card becomes the actual grid item). `hidden sm:contents`
          // collapses the wrapper on mobile and restores it from sm: up.
          return (
            <div key={i} className={hideOnMobile ? "hidden sm:contents" : "contents"}>
              {node}
            </div>
          );
        })}
      </div>
      {hasOverflow && (
        <div className="mt-10 text-center sm:hidden">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-block border border-ink px-10 py-4 text-xs tracking-[0.22em] text-ink uppercase transition-colors duration-300 hover:bg-ink hover:text-cream"
          >
            {expanded ? collapseLabel : showMoreLabel}
          </button>
        </div>
      )}
    </>
  );
}
