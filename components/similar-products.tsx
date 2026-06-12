"use client";

import { useRef, type ReactNode } from "react";

// "You may also like" — horizontal-scroll slider at the bottom of every
// product detail page. The page (server component) expands the related
// products into ProductCard nodes and passes them in via `items`, so this
// component never has to import @/lib/catalog (which would drag the Prisma /
// pg modules into the client bundle and break the build).
export function SimilarProducts({
  items,
  title,
  subtitle,
}: {
  items: { key: string; node: ReactNode }[];
  title: string;
  subtitle?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  if (items.length < 4) return null;

  const scrollBy = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    // Step is roughly two cards wide. clientWidth × 0.4 lands a comfortable
    // multi-card stride on any viewport. Snap-mandatory aligns to the
    // nearest card edge so the slider settles cleanly.
    const step = el.clientWidth * 0.4;
    el.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  return (
    <section className="mt-20 border-t border-line pt-16">
      <div className="reveal text-center">
        <p className="overline">{title}</p>
        {subtitle && <p className="mt-4 text-sm text-muted">{subtitle}</p>}
        <div className="gold-rule mx-auto mt-7" />
      </div>

      <div className="relative mt-10">
        {/* Prev / next chevrons — desktop only. On mobile, touch-swipe is
            faster than tapping a button, and the buttons would crowd the
            cards on a narrow screen. */}
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          aria-label="Previous"
          className="absolute -left-1 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-cream/95 text-ink shadow-sm backdrop-blur transition-colors hover:border-gold hover:text-gold sm:flex lg:-left-3"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => scrollBy(1)}
          aria-label="Next"
          className="absolute -right-1 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-cream/95 text-ink shadow-sm backdrop-blur transition-colors hover:border-gold hover:text-gold sm:flex lg:-right-3"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* `-mx-6 px-6 scroll-px-6` lets the row bleed past the parent's
            padding so the first card snaps flush to the viewport edge while
            the rest of the page stays centred. `snap-x snap-mandatory`
            makes each card click into place. `touch-pan-x` keeps mobile
            scroll predictable. The native scrollbar is hidden via
            .no-scrollbar for the cleaner luxury look. */}
        <div
          ref={trackRef}
          className="no-scrollbar -mx-6 overflow-x-auto px-6 pb-4 scroll-px-6 snap-x snap-mandatory touch-pan-x"
        >
          <ul className="flex gap-5 sm:gap-7">
            {items.map((it, i) => (
              <li
                key={it.key}
                className={`reveal reveal-d${i % 4} snap-start shrink-0 w-[60vw] sm:w-[280px] lg:w-[300px]`}
              >
                {it.node}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
