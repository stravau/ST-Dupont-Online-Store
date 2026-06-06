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
  fromLabel,
  colorWord,
  fallbackImage,
  swatches,
  basePrice,
  baseSku,
  initialSwatch = 0,
  inquireLabel,
  inquireSubject,
  inquireBody,
  wishlist,
}: {
  href: string;
  seed: string;
  title: string;
  collection: string;
  noveltyLabel: string | null;
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
  wishlist: React.ReactNode;
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

  const linkHref = active
    ? `${href}${href.includes("?") ? "&" : "?"}v=${encodeURIComponent(active.sku)}`
    : href;

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
      className="lux-hover reveal group relative flex h-full flex-col overflow-hidden border border-line bg-paper"
    >
      {/* Stretched navigation hit-area */}
      <Link href={linkHref} aria-label={title} className="absolute inset-0 z-10" />

      {/* Top bar — novelty badge (left) + in-stock dot & wishlist (right).
          A single justify-between flex row so they never overlap, even on
          narrow iOS cards. */}
      <div className="absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-2 p-2.5">
        {noveltyLabel ? (
          <span className="overline min-w-0 truncate bg-ink/85 px-2.5 py-1 text-[0.6rem] text-paper">
            {noveltyLabel}
          </span>
        ) : (
          <span aria-hidden />
        )}
        <div className="flex shrink-0 items-center gap-2">
          <span
            aria-hidden
            className="h-2.5 w-2.5 rounded-full bg-[#2bb673] shadow-[0_0_0_3px_rgba(255,255,255,0.7)] sm:h-3 sm:w-3"
          />
          {wishlist}
        </div>
      </div>

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

      {/* Colour swatches — always rendered (even when there's just one
          variant) so every card reserves the same vertical slot and the
          text below lines up across the row. */}
      <div className="relative z-20 flex min-h-[2rem] flex-wrap items-center justify-center gap-2 px-3 pt-3 sm:min-h-[2.5rem] sm:gap-2.5">
        {swatches.length > 1 &&
          swatches.slice(0, showCount).map((c, i) => (
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
              className={`h-6 w-6 rounded-full ring-offset-2 ring-offset-paper transition-all sm:h-7 sm:w-7 ${
                sel === i ? "ring-2 ring-gold" : "ring-1 ring-line hover:ring-gold/60"
              }`}
              style={swatchStyle(c.hex)}
            />
          ))}
        {swatches.length > 1 && extra > 0 && (
          <span className="text-xs text-muted sm:text-sm">+{extra}</span>
        )}
      </div>

      {/* Text — price given the strongest weight. Each element reserves a
          consistent line/min-height so the colour name, price and CTA
          line up across every card in the row. */}
      <div className="flex flex-1 flex-col px-5 pb-4 pt-3 text-center">
        <p className="overline text-[0.7rem]">{collection}</p>
        <h3 className="mt-1.5 line-clamp-2 min-h-[2.5rem] font-serif text-lg leading-snug text-ink sm:min-h-[3rem] sm:text-2xl">
          {title}
        </h3>
        <p className="overline mt-2 text-[0.55rem] text-muted">{fromLabel}</p>
        <p className="mt-0.5 font-serif text-2xl text-ink sm:text-3xl">{price}</p>
        {/* Color name slot — always rendered (nbsp when empty) so the
            row spacing matches across cards with/without swatches. */}
        <p className="mt-2 truncate text-[0.6rem] tracking-[0.12em] text-muted uppercase sm:text-xs sm:tracking-[0.14em]">
          {colorName && swatches.length > 1 ? colorName : " "}
        </p>

        {/* Inquire — opens a prefilled email to the boutique with the
            product reference, colourway and any other selected attributes. */}
        <a
          href={mailHref}
          onClick={(e) => e.stopPropagation()}
          className="relative z-20 mt-auto inline-flex w-full items-center justify-center gap-2 border border-ink bg-ink py-2.5 text-[0.65rem] tracking-[0.22em] text-gold uppercase sm:py-3 sm:text-xs sm:transition-colors sm:duration-300 sm:hover:border-gold sm:hover:bg-gold sm:hover:text-ink"
        >
          {inquireLabel}
        </a>
      </div>
    </article>
  );
}
