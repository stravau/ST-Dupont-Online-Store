"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ProductImage } from "@/components/product-image";
import { imgSrc } from "@/lib/img";
import { inquiryMailto } from "@/lib/inquiry";

export interface CardSwatch {
  sku: string;
  label: string;
  hex: string[];
  image: string | null;
  hoverImage?: string | null; // close-up, shown on card hover (desktop only)
  images?: string[]; // full gallery — slide through with the card arrows
  price: string;
}

// Catalogue card. One layout everywhere — a green in-stock dot by the heart,
// the swatches below the photo, a single-line colour name — just rendered
// at larger proportions on desktop.
export function ProductCardInteractive({
  href,
  seed,
  title,
  collection,
  noveltyLabel,
  availableLabel,
  fromLabel: _fromLabel,
  colorWord,
  fallbackImage,
  swatches,
  basePrice,
  baseSku,
  initialSwatch = 0,
  inquireLabel,
  inquireSubject,
  inquireBody,
}: {
  href: string;
  seed: string;
  title: string;
  collection: string;
  noveltyLabel: string | null;
  availableLabel: string;
  fromLabel: string;
  colorWord: string;
  fallbackImage: string | null;
  swatches: CardSwatch[];
  basePrice: string;
  baseSku: string;
  initialSwatch?: number;
  inquireLabel: string;
  inquireSubject: string;
  inquireBody: string;
}) {
  const [sel, setSel] = useState(initialSwatch);
  const [idx, setIdx] = useState(0); // image index within the active gallery
  const [hover, setHover] = useState(false);
  // Hover preview is desktop-only — on touch it would stick on the close-up.
  // Kept in state (not a ref) so it's safe to read during render.
  const [hoverable, setHoverable] = useState(false);
  useEffect(() => {
    const canHover =
      typeof window !== "undefined" &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    queueMicrotask(() => setHoverable(canHover));
  }, []);

  const active = swatches[sel];
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
  // Desktop hover shows the close-up (3rd photo) only while at the front.
  const shownIdx =
    hover && hoverable && safeIdx === 0 && len > 2 ? 2 : safeIdx;
  const image = imgSrc(gallery[shownIdx] ?? fallbackImage);
  const slide = (d: number) => setIdx((i) => i + d);
  const price = active?.price ?? basePrice;
  const colorName = active?.label;
  const activeSku = active?.sku ?? baseSku;

  // The server-rendered card already encodes ?v=<sku> from the chosen
  // colourway; don't double-append it here when the host's selection
  // matches what's in the URL already (which it does on per-colour cards
  // since variantSku === active.sku). Only swap when the user has clicked
  // a different swatch on the legacy multi-colour card.
  const linkHref = (() => {
    if (!active) return href;
    const m = href.match(/[?&]v=([^&]+)/);
    if (m && decodeURIComponent(m[1]) === active.sku) return href;
    if (m) return href.replace(/([?&])v=[^&]+/, `$1v=${encodeURIComponent(active.sku)}`);
    return `${href}${href.includes("?") ? "&" : "?"}v=${encodeURIComponent(active.sku)}`;
  })();

  const mailHref = inquiryMailto({
    subject: inquireSubject,
    body: inquireBody,
    data: {
      title,
      ref: activeSku,
      sku: activeSku,
      color: colorName ?? "",
      size: "",
    },
  });

  const swatchStyle = (hex: string[]) =>
    hex.length > 1
      ? { background: `linear-gradient(135deg, ${hex[0]} 0 50%, ${hex[1]} 50% 100%)` }
      : { background: hex[0] };

  // Show at most 6 swatches; with more than 6, show 5 and a "+N".
  const MAX = 6;
  const showCount = swatches.length > MAX ? 5 : Math.min(swatches.length, MAX);
  const extra = swatches.length - showCount;

  return (
    <article
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      // Maison-style card — no chrome around the tile. The cream surface
      // sits seamlessly on the page; the photo, name and price do the
      // talking, exactly like st-dupont.com.
      className="lux-hover reveal group relative flex h-full flex-col bg-paper"
    >
      {/* Stretched navigation hit-area */}
      <Link href={linkHref} aria-label={title} className="absolute inset-0 z-10" />

      {/* Novelty badge — corner overlay only. The in-stock indicator
          moved into the text block below the image (matches reference). */}
      {noveltyLabel && (
        <span className="absolute left-2.5 top-2.5 z-20 overline min-w-0 max-w-[60%] truncate bg-ink/85 px-2.5 py-1 text-[0.6rem] text-paper">
          {noveltyLabel}
        </span>
      )}

      {/* Image — portrait. shrink-0 + w-full so the equal-height flex column
          can't compress it on iOS Safari (aspect-ratio flex bug). */}
      <div className="relative aspect-[4/5] w-full shrink-0 overflow-hidden">
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
        {/* Slide through this colourway's photos without entering the item */}
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

      {/* Text block — left-aligned Maison layout:
          • green dot + AVAILABLE
          • product name (caps, prominent)
          • category / collection (caps, smaller, muted)
          • price (no "From" prefix, just the figure) */}
      <div className="flex flex-1 flex-col px-1 pb-3 pt-4 text-left sm:px-1.5 sm:pb-5 sm:pt-6">
        <div className="flex items-center gap-2">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[#2bb673] sm:h-2 sm:w-2" />
          <span className="text-[0.55rem] tracking-[0.18em] text-muted uppercase sm:text-[0.65rem]">
            {availableLabel}
          </span>
        </div>
        <h3 className="mt-2 line-clamp-2 min-h-[2rem] font-serif text-[0.95rem] tracking-[0.04em] text-ink uppercase sm:mt-3 sm:min-h-[2.5rem] sm:text-xl">
          {title}
        </h3>
        <p className="mt-1 line-clamp-1 text-[0.6rem] tracking-[0.14em] text-muted uppercase sm:mt-1.5 sm:text-[0.7rem]">
          {collection}
        </p>
        <p className="mt-3 font-serif text-base text-ink sm:mt-5 sm:text-xl">{price}</p>
        {/* Colour name slot — keep when a colourway is active so per-card
            differentiation reads cleanly when the grid renders one card
            per colourway. nbsp keeps the line height even when empty. */}
        <p className="mt-1.5 line-clamp-1 text-[0.55rem] tracking-[0.1em] text-muted uppercase sm:mt-2 sm:text-[0.65rem] sm:tracking-[0.14em]">
          {colorName ? colorName : " "}
        </p>

        {/* Swatches — small left-aligned dots, only when there's more
            than one colourway. Reserved space below collapses cleanly
            when single-variant. */}
        {swatches.length > 1 && (
          <div className="relative z-20 mt-3 flex flex-wrap items-center gap-2 sm:mt-4 sm:gap-2.5">
            {swatches.slice(0, showCount).map((c, i) => (
              <button
                key={c.label}
                type="button"
                aria-label={c.label}
                title={`${c.label} · ${colorWord}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSel(i);
                  setIdx(0);
                }}
                className={`h-4 w-4 rounded-full ring-offset-2 ring-offset-paper transition-all sm:h-5 sm:w-5 ${
                  sel === i ? "ring-2 ring-gold" : "ring-1 ring-line hover:ring-gold/60"
                }`}
                style={swatchStyle(c.hex)}
              />
            ))}
            {extra > 0 && (
              <span className="text-[0.6rem] text-muted sm:text-xs">+{extra}</span>
            )}
          </div>
        )}

        {/* Inquire — desktop only, fades in on card hover. Hidden on
            mobile entirely (the card itself is the tap target on touch
            devices). Underlined caps link, Maison-secondary style — no
            heavy black button. */}
        <div className="relative z-20 mt-auto hidden pt-4 sm:block sm:pt-6">
          <a
            href={mailHref}
            onClick={(e) => e.stopPropagation()}
            className="inline-block border-b border-ink pb-0.5 text-[0.65rem] tracking-[0.2em] text-ink uppercase opacity-0 transition-all duration-200 group-hover:opacity-100 hover:border-gold hover:text-gold"
          >
            {inquireLabel}
          </a>
        </div>
      </div>
    </article>
  );
}
