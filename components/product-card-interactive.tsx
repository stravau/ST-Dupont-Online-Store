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

      {/* Image */}
      <div className="relative aspect-[5/6] overflow-hidden">
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
          <span className="overline absolute left-2.5 top-2.5 bg-ink/85 px-2 py-0.5 text-[0.5rem] text-paper">
            {noveltyLabel}
          </span>
        )}
      </div>

      {/* Colour swatches — normal flow, above the link, do not navigate */}
      {swatches.length > 1 && (
        <div className="relative z-20 flex flex-wrap items-center justify-center gap-1.5 border-t border-line/60 px-2 py-2.5">
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
              className={`h-3.5 w-3.5 rounded-full ring-offset-1 ring-offset-paper transition-all ${
                sel === i ? "ring-2 ring-gold" : "ring-1 ring-line hover:ring-gold/60"
              }`}
              style={swatchStyle(c.hex)}
            />
          ))}
          {swatches.length > 8 && (
            <span className="text-[0.5rem] text-muted">+{swatches.length - 8}</span>
          )}
        </div>
      )}

      {/* Text */}
      <div className="px-3 pb-4 pt-3 text-center">
        <p className="overline text-[0.5rem]">{collection}</p>
        <h3 className="mt-1 font-serif text-sm leading-snug text-ink">{title}</h3>
        <p className="mt-1.5 text-[0.7rem] text-muted">
          {fromLabel} <span className="text-ink">{price}</span>
        </p>
        <div className="mt-2 flex items-center justify-center gap-2">
          {status}
          {colorName && swatches.length > 1 && (
            <span className="text-[0.5rem] tracking-[0.12em] text-muted uppercase">
              {colorName}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
