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
  hoverImage?: string | null;
  images?: string[];
  price: string;
}

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
  const [idx, setIdx] = useState(0);
  const [hover, setHover] = useState(false);
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
  const shownIdx =
    hover && hoverable && safeIdx === 0 && len > 2 ? 2 : safeIdx;
  const image = imgSrc(gallery[shownIdx] ?? fallbackImage);
  const slide = (d: number) => setIdx((i) => i + d);
  const price = active?.price ?? basePrice;
  const colorName = active?.label;
  const activeSku = active?.sku ?? baseSku;

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

  // No-image fallback for swatches without a real photo — fall back to
  // the colour gradient so the swatch still reads as an indicator.
  const swatchStyle = (hex: string[]) =>
    hex.length > 1
      ? { background: `linear-gradient(135deg, ${hex[0]} 0 50%, ${hex[1]} 50% 100%)` }
      : { background: hex[0] };

  return (
    <article
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      // No chrome around the tile — the article is transparent so the
      // text under the photo sits "free" on the page's cream background.
      // The border lives on the image alone, exactly like st-dupont.com.
      className="reveal group relative flex h-full flex-col"
    >
      <Link href={linkHref} aria-label={title} className="absolute inset-0 z-10" />

      {noveltyLabel && (
        <span className="absolute left-2.5 top-2.5 z-20 overline min-w-0 max-w-[60%] truncate bg-ink/85 px-2.5 py-1 text-[0.6rem] text-paper">
          {noveltyLabel}
        </span>
      )}

      {/* Image — portrait, framed by the only border on the card. */}
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

      {/* Text block — sits "free" on the page; no padding chrome, just
          tight vertical rhythm. */}
      <div className="flex flex-1 flex-col pt-2.5 pb-1 text-left sm:pt-3">
        <div className="flex items-center gap-1.5">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[#2bb673]" />
          <span className="text-[0.55rem] tracking-[0.18em] text-muted uppercase sm:text-[0.6rem]">
            {availableLabel}
          </span>
        </div>
        <h3 className="mt-1 line-clamp-1 font-serif text-[0.9rem] tracking-[0.04em] text-ink uppercase sm:mt-1.5 sm:text-lg">
          {title}
        </h3>
        <p className="mt-0.5 line-clamp-1 text-[0.55rem] tracking-[0.14em] text-muted uppercase sm:text-[0.65rem]">
          {collection}
        </p>
        <p className="mt-1.5 font-serif text-lg font-semibold text-ink sm:mt-2 sm:text-2xl">{price}</p>
        {colorName && (
          <p className="mt-0.5 line-clamp-1 text-[0.55rem] tracking-[0.1em] text-muted uppercase sm:text-[0.6rem] sm:tracking-[0.14em]">
            {colorName}
          </p>
        )}

        {/* Colour-variant strip — each swatch is a mini photo of the
            same product in a different colourway. Side-scrolls when
            there are more than 3 (mobile) / 5 (desktop) entries.
            Mobile thumbs are borderless to read as a clean ribbon;
            desktop carries a subtle line + gold ring on the active. */}
        {swatches.length > 1 && (
          <div className="relative z-20 mt-2 sm:mt-3">
            <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto sm:gap-2">
              {swatches.map((c, i) => {
                const thumb = imgSrc(c.image);
                return (
                  <button
                    key={c.sku}
                    type="button"
                    aria-label={c.label}
                    title={`${c.label} · ${colorWord}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSel(i);
                      setIdx(0);
                    }}
                    className={`relative aspect-square h-12 w-12 shrink-0 overflow-hidden transition-all sm:h-14 sm:w-14 sm:border ${
                      sel === i
                        ? "sm:border-gold sm:ring-1 sm:ring-gold"
                        : "sm:border-line sm:hover:border-gold/60"
                    }`}
                    style={thumb ? undefined : swatchStyle(c.hex)}
                  >
                    {thumb && (
                      <Image
                        src={thumb}
                        alt={c.label}
                        fill
                        sizes="56px"
                        className="object-contain"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Inquire — desktop only, fades in on card hover. */}
        <div className="relative z-20 mt-auto hidden pt-2 sm:block sm:pt-3">
          <a
            href={mailHref}
            onClick={(e) => e.stopPropagation()}
            className="inline-block border-b border-ink pb-0.5 text-[0.6rem] tracking-[0.2em] text-ink uppercase opacity-0 transition-all duration-200 group-hover:opacity-100 hover:border-gold hover:text-gold"
          >
            {inquireLabel}
          </a>
        </div>
      </div>
    </article>
  );
}
