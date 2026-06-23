"use client";

// Horizontal model line-up slider that REPLACES the static hero image at the
// top of every /c/[category] page. Each card is one of the category's
// signature model lines (Ligne 2, Initial, Apex, …) with the line's primary
// product image as the thumbnail. Tapping a card filters the catalogue to
// that model. On wider viewports prev / next arrows scroll the strip a
// page at a time; on touch the strip is free-scroll with CSS snap.

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ModelThumbnail } from "@/lib/catalog";

interface Props {
  thumbnails: ModelThumbnail[];
  eyebrow: string;     // small overline label (category name in locale)
  title: string;       // brand "art" line — L'Art du Feu etc.
  description?: string;
  prevAria: string;
  nextAria: string;
}

export function CategoryHeroSlider({
  thumbnails,
  eyebrow,
  title,
  description,
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
    <header className="monogram-bg relative overflow-hidden border-b border-line/40 text-cream">
      <div className="relative mx-auto max-w-7xl px-6 pt-14 pb-10 sm:pt-16 md:pt-20">
        <div className="text-center">
          <p className="overline text-gold-soft">{eyebrow}</p>
          <h1 className="mt-3 font-serif text-4xl text-cream sm:text-5xl md:text-6xl">
            {title}
          </h1>
          <div className="gold-rule mx-auto mt-6" />
          {description && (
            <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-cream/85">
              {description}
            </p>
          )}
        </div>

        <div className="relative mt-10">
          {canScrollPrev && (
            <button
              type="button"
              aria-label={prevAria}
              onClick={() => scroll(-1)}
              className="absolute top-1/2 left-1 z-10 hidden -translate-y-1/2 rounded-full bg-ink/70 p-3 text-cream backdrop-blur-sm transition-colors hover:bg-ink md:block"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 4 6 10l6 6" />
              </svg>
            </button>
          )}
          {canScrollNext && (
            <button
              type="button"
              aria-label={nextAria}
              onClick={() => scroll(1)}
              className="absolute top-1/2 right-1 z-10 hidden -translate-y-1/2 rounded-full bg-ink/70 p-3 text-cream backdrop-blur-sm transition-colors hover:bg-ink md:block"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="m8 4 6 6-6 6" />
              </svg>
            </button>
          )}

          <div
            ref={trackRef}
            className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 sm:gap-5"
          >
            {thumbnails.map((m) => (
              <Link
                key={m.key}
                href={m.href}
                className="group relative shrink-0 snap-start"
              >
                <div className="relative h-36 w-32 overflow-hidden rounded-md bg-cream/5 ring-1 ring-line/30 transition-transform duration-500 group-hover:scale-[1.03] sm:h-44 sm:w-40 md:h-48 md:w-44">
                  <Image
                    src={m.image}
                    alt={m.label}
                    fill
                    sizes="(max-width: 640px) 8rem, (max-width: 768px) 10rem, 11rem"
                    className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/15 to-transparent" />
                  <div className="absolute right-2 bottom-2 left-2 text-center">
                    <p className="font-serif text-sm leading-tight text-cream sm:text-base">
                      {m.label}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
