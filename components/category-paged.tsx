"use client";

import { useState } from "react";
import type { ReactNode } from "react";

// Category pages display cards grouped under a model-line header, so the plain
// PagedGrid (single flat grid) doesn't fit. This wrapper takes the already
// sliced page of cards, regroups them by model line for the section layout,
// and adds a mobile "show all on this page" toggle that hides cards past the
// mobile chunk plus any section whose visible cards all fall past the cutoff.
type Card = { key: string; line: string; node: ReactNode };

export function CategoryPaged({
  cards,
  showMoreLabel,
  collapseLabel,
  mobileChunk = 24,
}: {
  cards: Card[];
  showMoreLabel: string;
  collapseLabel: string;
  mobileChunk?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasOverflow = cards.length > mobileChunk;

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
          const hasMobileVisible = g.items.some((it) => it.idx < mobileChunk);
          const hideSection = !expanded && hasOverflow && !hasMobileVisible;
          return (
            <section
              key={g.line}
              className={`mt-10 first:mt-0 sm:mt-12 ${hideSection ? "hidden sm:block" : ""}`}
            >
              {/* Discrete inline header — small all-caps overline + thin rule.
                  Frees the grid up so products sit much closer together,
                  especially on mobile where the previous serif heading and
                  generous margins ate ~120px per section. */}
              <div className="mb-4 flex items-center gap-3 sm:mb-5 sm:gap-4">
                <p className="min-w-0 text-[0.65rem] font-medium tracking-[0.22em] text-muted break-words uppercase sm:text-[0.7rem]">
                  {g.line}
                </p>
                <span className="h-px flex-1 bg-line/60" />
              </div>
              {/* Flex + justify-center keeps a short row centred. Widths match
                  the chosen gap so rows align edge-to-edge on a 2-up / 4-up
                  grid. Cards past the mobile cutoff collapse on mobile. */}
              <div className="product-grid flex flex-wrap justify-center gap-5 sm:gap-7 lg:gap-8">
                {g.items.map((it) => {
                  const hideCard = !expanded && hasOverflow && it.idx >= mobileChunk;
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
