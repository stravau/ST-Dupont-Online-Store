"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ProductImage } from "@/components/product-image";
import { imgSrc } from "@/lib/img";

export interface CardSwatch {
  sku: string;
  label: string;
  hex: string[];
  image: string | null;
  price: string;
}

// Catalogue card. The whole card navigates via a stretched link.
// Desktop: swatches float on a shadowed pill over the foot of the photo.
// Mobile: lighter chrome — a green stock dot by the heart, no status text,
// a single-line colour name, and the swatches sitting below the image.
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
  wishlist,
  status,
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
  wishlist: React.ReactNode;
  status: React.ReactNode;
}) {
  const [sel, setSel] = useState(0);
  const active = swatches[sel];
  const image = imgSrc(active?.image ?? fallbackImage);
  const price = active?.price ?? basePrice;
  const colorName = active?.label;
  const linkHref = active
    ? `${href}${href.includes("?") ? "&" : "?"}v=${encodeURIComponent(active.sku)}`
    : href;

  const swatchStyle = (hex: string[]) =>
    hex.length > 1
      ? { background: `linear-gradient(135deg, ${hex[0]} 0 50%, ${hex[1]} 50% 100%)` }
      : { background: hex[0] };

  // Show at most 6 swatches; with more than 6, show 5 and a "+N".
  const MAX = 6;
  const showCount = swatches.length > MAX ? 5 : Math.min(swatches.length, MAX);
  const extra = swatches.length - showCount;

  const swatchButtons = (
    <>
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
          }}
          className={`h-6 w-6 rounded-full ring-offset-2 ring-offset-cream transition-all ${
            sel === i ? "ring-2 ring-gold" : "ring-1 ring-line hover:ring-gold/60"
          }`}
          style={swatchStyle(c.hex)}
        />
      ))}
      {extra > 0 && <span className="text-xs text-muted">+{extra}</span>}
    </>
  );

  return (
    <article className="lux-hover group relative flex flex-col overflow-hidden border border-line bg-paper">
      {/* Stretched navigation hit-area */}
      <Link href={linkHref} aria-label={title} className="absolute inset-0 z-10" />

      {/* Heart — with a green in-stock dot beside it on mobile */}
      <div className="absolute right-2 top-2 z-20 flex items-center gap-2">
        <span
          aria-hidden
          className="h-2.5 w-2.5 rounded-full bg-[#2bb673] shadow-[0_0_0_3px_rgba(255,255,255,0.7)] sm:hidden"
        />
        {wishlist}
      </div>

      {/* Image — portrait, dominates the card (taller on mobile) */}
      <div className="relative aspect-[3/4] overflow-hidden sm:aspect-[4/5]">
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
        {noveltyLabel && (
          <span className="overline absolute left-3 top-3 bg-ink/85 px-3 py-1 text-[0.7rem] text-paper">
            {noveltyLabel}
          </span>
        )}

        {/* Desktop: floating colour swatches over the image foot */}
        {swatches.length > 1 && (
          <div className="absolute inset-x-0 bottom-3 z-20 hidden justify-center sm:flex">
            <div className="flex max-w-[90%] flex-wrap items-center justify-center gap-2 rounded-full border border-line/40 bg-cream/85 px-4 py-2.5 shadow-[0_8px_22px_rgba(10,26,48,0.22)] backdrop-blur">
              {swatchButtons}
            </div>
          </div>
        )}
      </div>

      {/* Mobile: colour swatches below the image (normal flow) */}
      {swatches.length > 1 && (
        <div className="relative z-20 flex flex-wrap items-center justify-center gap-2 px-3 pt-4 sm:hidden">
          {swatchButtons}
        </div>
      )}

      {/* Text — price given the strongest weight */}
      <div className="px-5 pb-6 pt-4 text-center">
        <p className="overline text-[0.7rem]">{collection}</p>
        <h3 className="mt-2 font-serif text-xl leading-snug text-ink">{title}</h3>
        <p className="overline mt-3 text-[0.55rem] text-muted">{fromLabel}</p>
        <p className="mt-1 font-serif text-2xl text-ink md:text-3xl">{price}</p>
        <div className="mt-3 flex items-center justify-center gap-4">
          <span className="hidden sm:inline-flex">{status}</span>
          {colorName && swatches.length > 1 && (
            <span className="whitespace-nowrap text-[0.55rem] tracking-[0.1em] text-muted uppercase sm:text-xs sm:tracking-[0.14em]">
              {colorName}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
