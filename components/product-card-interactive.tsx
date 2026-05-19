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
// colour swatches float on a shadowed pill over the foot of the image so
// the photo can dominate (~70%) and the text block stays clean (~30%).
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

      {/* Image — portrait, dominates the card (~70%). Swatches float over
          its lower edge on a shadowed pill so they take no layout space. */}
      <div className="relative aspect-[4/5] overflow-hidden">
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

        {/* Floating colour swatches — levitate over the image foot */}
        {swatches.length > 1 && (
          <div className="absolute inset-x-0 bottom-3 z-20 flex justify-center">
            <div className="flex max-w-[90%] flex-wrap items-center justify-center gap-2 rounded-full border border-line/40 bg-cream/85 px-4 py-2.5 shadow-[0_8px_22px_rgba(10,26,48,0.22)] backdrop-blur">
              {swatches.slice(0, 7).map((c, i) => (
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
              {swatches.length > 7 && (
                <span className="text-xs text-muted">+{swatches.length - 7}</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Text — compact (~30%), price given the strongest weight */}
      <div className="px-5 pb-6 pt-4 text-center">
        <p className="overline text-[0.7rem]">{collection}</p>
        <h3 className="mt-2 font-serif text-xl leading-snug text-ink">{title}</h3>
        <p className="overline mt-3 text-[0.55rem] text-muted">{fromLabel}</p>
        <p className="mt-1 font-serif text-2xl text-ink md:text-3xl">{price}</p>
        <div className="mt-3 flex items-center justify-center gap-4">
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
