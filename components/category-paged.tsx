import type { ReactNode } from "react";
import Link from "next/link";

// Category pages display cards grouped under a model-line header, so the plain
// PagedGrid (single flat grid) doesn't fit. This wrapper takes the already
// sliced page of cards, regroups them by model line for the section layout,
// and renders a mobile-only "show all products" Link that drops pagination
// entirely (?all=1) — the same surface as the paginator's previous footer
// link, but pinned where the bordered button used to sit.
type Card = { key: string; line: string; node: ReactNode };

export function CategoryPaged({
  cards,
  showAllLabel,
  showAllHref,
  isShowingAll = false,
  mobileChunk = 24,
}: {
  cards: Card[];
  showAllLabel: string;
  showAllHref: string;
  isShowingAll?: boolean;
  mobileChunk?: number;
}) {
  const hasMobileOverflow = !isShowingAll && cards.length > mobileChunk;

  type Group = { line: string; items: { idx: number; key: string; node: ReactNode }[] };
  const groups: Group[] = [];
  const at = new Map<string, number>();
  cards.forEach((c, idx) => {
    if (!at.has(c.line)) {
      at.set(c.line, groups.length);
      groups.push({ line: c.line, items: [] });
    }
    groups[at.get(c.line)!].items.push({ idx, key: c.key, node: c.node });
  });

  return (
    <>
      <div className="mt-12">
        {groups.map((g) => {
          // Hide a whole section on mobile when every one of its cards sits past
          // the mobile cutoff — otherwise the section header floats alone.
          const hasMobileVisible = g.items.some((it) => it.idx < mobileChunk);
          const hideSection = hasMobileOverflow && !hasMobileVisible;
          return (
            <section
              key={g.line}
              className={`mt-10 first:mt-0 sm:mt-12 ${hideSection ? "hidden sm:block" : ""}`}
            >
              {/* Discrete inline header — small all-caps overline + thin rule. */}
              <div className="mb-4 flex items-center gap-3 sm:mb-5 sm:gap-4">
                <p className="min-w-0 text-[0.65rem] font-medium tracking-[0.22em] text-muted break-words uppercase sm:text-[0.7rem]">
                  {g.line}
                </p>
                <span className="h-px flex-1 bg-line/60" />
              </div>
              <div className="product-grid flex flex-wrap justify-center gap-5 sm:gap-7 lg:gap-8">
                {g.items.map((it) => {
                  const hideCard = hasMobileOverflow && it.idx >= mobileChunk;
                  return (
                    <div
                      key={it.key}
                      className={`w-[calc(50%-0.625rem)] sm:w-[calc(50%-0.875rem)] lg:w-[calc(25%-1.5rem)] ${
                        hideCard ? "hidden sm:block" : ""
                      }`}
                    >
                      {it.node}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
      {hasMobileOverflow && (
        <div className="mt-10 text-center sm:hidden">
          {/* scroll={false} — keep the user where they tapped from. */}
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
