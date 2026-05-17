"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ProductImage } from "@/components/product-image";

export interface CardSwatch {
  label: string;
  hex: string[];
  image: string | null;
  price: string;
}

// Compact catalogue card. The whole card navigates to the product via a
// stretched link; the colour swatches sit above it and only swap the
// previewed colour + image (they never navigate).
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
  const image = active?.image ?? fallbackImage;
  const price = active?.price ?? basePrice;
  const colorName = active?.label;

  const swatchStyle = (hex: string[]) =>
    hex.length > 1
      ? { background: `linear-gradient(135deg, ${hex[0]} 0 50%, ${hex[1]} 50% 100%)` }
      : { background: hex[0] };

  return (
    <article className="lux-hover group relative overflow-hidden border border-line bg-paper">
      {/* Stretched navigation hit-area (under interactive controls) */}
      <Link href={href} aria-label={title} className="absolute inset-0 z-10" />

      {/* Wishlist — above the link */}
      <div className="absolute right-2.5 top-2.5 z-20">{wishlist}</div>

      {/* Visual content (non-interactive) */}
      <div className="pointer-events-none">
        <div className="relative aspect-[4/5] overflow-hidden">
          <div className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.04]">
            {image ? (
              <Image
                key={image}
                src={image}
                alt={title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-contain"
              />
            ) : (
              <ProductImage seed={seed} label={title} className="h-full w-full" />
            )}
          </div>
          {noveltyLabel && (
            <span className="overline absolute left-3 top-3 bg-ink/85 px-2.5 py-1 text-[0.55rem] text-paper">
              {noveltyLabel}
            </span>
          )}
        </div>

        <div className="px-4 pb-4 pt-4 text-center">
          <p className="overline text-[0.55rem]">{collection}</p>
          <h3 className="mt-1.5 font-serif text-base text-ink">{title}</h3>
          <p className="mt-2 text-xs text-muted">
            {fromLabel} <span className="text-ink">{price}</span>
          </p>
          <div className="mt-3 flex items-center justify-center gap-3">
            {status}
            {colorName && swatches.length > 1 && (
              <span className="text-[0.55rem] tracking-[0.14em] text-muted uppercase">
                {colorName}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Interactive swatches — above the link, do not navigate */}
      {swatches.length > 1 && (
        <div className="absolute inset-x-0 bottom-[5.4rem] z-20 flex flex-wrap items-center justify-center gap-1.5 px-3 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          {swatches.slice(0, 8).map((c, i) => (
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
              className={`h-4 w-4 rounded-full ring-offset-1 ring-offset-paper transition-all ${
                sel === i ? "ring-2 ring-gold" : "ring-1 ring-line hover:ring-gold/60"
              }`}
              style={swatchStyle(c.hex)}
            />
          ))}
          {swatches.length > 8 && (
            <span className="text-[0.55rem] text-muted">+{swatches.length - 8}</span>
          )}
        </div>
      )}
    </article>
  );
}
