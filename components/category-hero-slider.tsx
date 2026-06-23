"use client";

// Horizontal model line-up slider that REPLACES the static hero image at the
// top of every /c/[category] page. Each card is one of the category's
// signature model lines (Ligne 2, Initial, Apex, …) with the line's primary
// product image as the thumbnail. Tapping a card filters the catalogue to
// that model. Compact header band — title only, thumbnail strip below.

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ModelThumbnail } from "@/lib/catalog";

interface Props {
  thumbnails: ModelThumbnail[];
  title: string;       // brand "art" line — L'Art du Feu etc.
  prevAria: string;
  nextAria: string;
}

export function CategoryHeroSlider({
  thumbnails,
  title,
  prevAria,
  nextAria,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const refresh = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollPrev(el.scrollLeft > 4);
    setCanScrollNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    refresh();
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => refresh();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", refresh);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", refresh);
    };
  }, [refresh]);

  const scroll = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <header className="monogram-bg relative overflow-hidden text-cream">
      <div className="relative mx-auto max-w-7xl px-6 pt-5 pb-4">
        <h1 className="text-center font-serif text-2xl text-cream sm:text-3xl">
          {title}
        </h1>

        <div className="relative mt-4">
          {canScrollPrev && (
            <button
              type="button"
              aria-label={prevAria}
              onClick={() => scroll(-1)}
              className="absolute top-1/2 left-1 z-10 hidden -translate-y-1/2 rounded-full bg-ink/70 p-2 text-cream backdrop-blur-sm transition-colors hover:bg-ink md:block"
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 4 6 10l6 6" />
              </svg>
            </button>
          )}
          {canScrollNext && (
            <button
              type="button"
              aria-label={nextAria}
              onClick={() => scroll(1)}
              className="absolute top-1/2 right-1 z-10 hidden -translate-y-1/2 rounded-full bg-ink/70 p-2 text-cream backdrop-blur-sm transition-colors hover:bg-ink md:block"
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="m8 4 6 6-6 6" />
              </svg>
            </button>
          )}

          <div
            ref={trackRef}
            className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth sm:gap-4"
          >
            {thumbnails.map((m) => (
              <Link
                key={m.key}
                href={m.href}
                className="group shrink-0 snap-start"
              >
                <div className="relative h-28 w-24 overflow-hidden rounded-md bg-white ring-1 ring-line/30 transition-transform duration-500 group-hover:scale-[1.03] sm:h-32 sm:w-28 md:h-36 md:w-32">
                  <Image
                    src={m.image}
                    alt={m.label}
                    fill
                    sizes="(max-width: 640px) 6rem, (max-width: 768px) 7rem, 8rem"
                    className="object-contain object-center p-2 transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <p className="mt-1.5 text-center font-serif text-[0.7rem] leading-tight text-cream sm:text-xs">
                  {m.label}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
