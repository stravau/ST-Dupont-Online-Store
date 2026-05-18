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

// Catalogue card. The whole card navigates via a stretched link; the
// colour swatches sit in normal flow (never overlapping the text) and
// only swap the previewed colour + image.
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

  return (
    <article className="lux-hover group relative flex flex-col overflow-hidden border border-line bg-paper">
      {/* Stretched navigation hit-area */}
      <Link href={linkHref} aria-label={title} className="absolute inset-0 z-10" />

      <div className="absolute right-2 top-2 z-20">{wishlist}</div>

      {/* Image — ~15% shorter than square shrinks the card without
          touching the text or colour swatches below */}
      <div className="relative aspect-[20/17] overflow-hidden">
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
      </div>

      {/* Colour swatches — normal flow, above the link, do not navigate */}
      {swatches.length > 1 && (
        <div className="relative z-20 flex flex-wrap items-center justify-center gap-2 border-t border-line/60 px-3 py-4">
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
              className={`h-6 w-6 rounded-full ring-offset-2 ring-offset-paper transition-all ${
                sel === i ? "ring-2 ring-gold" : "ring-1 ring-line hover:ring-gold/60"
              }`}
              style={swatchStyle(c.hex)}
            />
          ))}
          {swatches.length > 8 && (
            <span className="text-sm text-muted">+{swatches.length - 8}</span>
          )}
        </div>
      )}

      {/* Text */}
      <div className="px-5 pb-7 pt-5 text-center">
        <p className="overline text-[0.7rem]">{collection}</p>
        <h3 className="mt-2.5 font-serif text-2xl leading-snug text-ink">{title}</h3>
        <p className="mt-3 text-base text-muted">
          {fromLabel} <span className="text-ink">{price}</span>
        </p>
        <div className="mt-4 flex items-center justify-center gap-4">
          {status}
          {colorName && swatches.length > 1 && (
            <span className="text-xs tracking-[0.14em] text-muted uppercase">
              {colorName}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
