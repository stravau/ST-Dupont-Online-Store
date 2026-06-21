"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ProductImage } from "@/components/product-image";
import { imgSrc } from "@/lib/img";

export interface CardSwatch {
  sku: string;
  label: string;
  hex: string[];
  image: string | null;
  hoverImage?: string | null;
  images?: string[];
  price: string;
}

// Catalogue grid card. As compact as possible — image + status +
// name + collection + price. No colour swatches, no inquire CTA on
// the tile; those live on the product detail page. The card itself
// is the tap / click target.
export function ProductCardInteractive({
  href,
  seed,
  title,
  collection,
  noveltyLabel,
  availableLabel,
  fallbackImage,
  swatches,
  basePrice,
  initialSwatch = 0,
}: {
  href: string;
  seed: string;
  title: string;
  collection: string;
  noveltyLabel: string | null;
  availableLabel: string;
  fallbackImage: string | null;
  swatches: CardSwatch[];
  basePrice: string;
  baseSku: string;
  initialSwatch?: number;
  // Props kept on the interface (passed from product-card.tsx) so the
  // server-side renderer doesn't need to change; they're no-ops on
  // the compact card and only consumed by the PDP / inquire flow.
  fromLabel?: string;
  colorWord?: string;
  inquireLabel?: string;
  inquireSubject?: string;
  inquireBody?: string;
}) {
  const [idx, setIdx] = useState(0);
  const [hover, setHover] = useState(false);
  const [hoverable, setHoverable] = useState(false);
  useEffect(() => {
    const canHover =
      typeof window !== "undefined" &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    queueMicrotask(() => setHoverable(canHover));
  }, []);

  const active = swatches[initialSwatch];
  const gallery =
    active?.images && active.images.length
      ? active.images
      : active?.image
        ? [active.image]
        : fallbackImage
          ? [fallbackImage]
          : [];
  const len = gallery.length;
  const safeIdx = len ? ((idx % len) + len) % len : 0;
  // Desktop hover reveals the close-up (3rd photo) while sitting on the
  // front of the gallery.
  const shownIdx =
    hover && hoverable && safeIdx === 0 && len > 2 ? 2 : safeIdx;
  const image = imgSrc(gallery[shownIdx] ?? fallbackImage);
  const slide = (d: number) => setIdx((i) => i + d);
  const price = active?.price ?? basePrice;

  return (
    <article
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="reveal group relative flex h-full flex-col"
    >
      <Link href={href} aria-label={title} className="absolute inset-0 z-10" />

      {noveltyLabel && (
        <span className="absolute left-2.5 top-2.5 z-20 overline min-w-0 max-w-[60%] truncate bg-ink/85 px-2.5 py-1 text-[0.6rem] text-paper">
          {noveltyLabel}
        </span>
      )}

      <div className="lux-hover relative aspect-[4/5] w-full shrink-0 overflow-hidden border border-line bg-paper">
        <div className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.03]">
          {image ? (
            <Image
              key={image}
              src={image}
              alt={title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 22vw"
              className="object-contain"
            />
          ) : (
            <ProductImage seed={seed} label={title} className="h-full w-full" />
          )}
        </div>
        {len > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); slide(-1); }}
              className="absolute left-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-cream/80 text-ink backdrop-blur transition-colors hover:border-gold hover:text-gold"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); slide(1); }}
              className="absolute right-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-cream/80 text-ink backdrop-blur transition-colors hover:border-gold hover:text-gold"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="absolute inset-x-0 bottom-2 z-20 flex items-center justify-center gap-1.5">
              {gallery.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Image ${i + 1}`}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIdx(i); }}
                  className={`h-1.5 rounded-full transition-all ${i === safeIdx ? "w-4 bg-gold" : "w-1.5 bg-line"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex flex-col pt-2 text-left">
        <div className="flex items-center gap-1.5">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[#2bb673]" />
          <span className="text-[0.5rem] tracking-[0.18em] text-muted uppercase sm:text-[0.6rem]">
            {availableLabel}
          </span>
        </div>
        <h3 className="mt-0.5 line-clamp-1 font-serif text-[0.85rem] tracking-[0.04em] text-ink uppercase sm:mt-1 sm:text-base">
          {title}
        </h3>
        <p className="line-clamp-1 text-[0.55rem] tracking-[0.14em] text-muted uppercase sm:text-[0.65rem]">
          {collection}
        </p>
        <p className="mt-1 font-serif text-base font-semibold text-ink sm:mt-1.5 sm:text-xl">{price}</p>
      </div>
    </article>
  );
}
