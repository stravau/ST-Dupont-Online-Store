"use client";

import { useActionState, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { AddResult } from "@/lib/actions";
import { ProductImage } from "@/components/product-image";
import { imgSrc } from "@/lib/img";

export interface CardSwatch {
  sku: string;
  label: string;
  hex: string[];
  image: string | null;
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
  addAction,
  addToCartLabel,
  addedLabel,
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
  addAction: (prev: AddResult | null, formData: FormData) => Promise<AddResult>;
  addToCartLabel: string;
  addedLabel: string;
  wishlist: React.ReactNode;
}) {
  const [sel, setSel] = useState(0);
  const active = swatches[sel];
  const image = imgSrc(active?.image ?? fallbackImage);
  const price = active?.price ?? basePrice;
  const colorName = active?.label;
  const activeSku = active?.sku ?? baseSku;

  // Add-to-cart action + transient "Added" confirmation on the button.
  const [addState, formAction, pending] = useActionState(addAction, null);
  const [justAdded, setJustAdded] = useState(false);
  useEffect(() => {
    if (!addState?.ok || addState.id === undefined) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setJustAdded(true);
    });
    const t = setTimeout(() => {
      if (!cancelled) setJustAdded(false);
    }, 1600);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [addState]);
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

  return (
    <article className="lux-hover group relative flex flex-col overflow-hidden border border-line bg-paper">
      {/* Stretched navigation hit-area */}
      <Link href={linkHref} aria-label={title} className="absolute inset-0 z-10" />

      {/* Heart — with a green in-stock dot beside it */}
      <div className="absolute right-2 top-2 z-20 flex items-center gap-2">
        <span
          aria-hidden
          className="h-2.5 w-2.5 rounded-full bg-[#2bb673] shadow-[0_0_0_3px_rgba(255,255,255,0.7)] sm:h-3 sm:w-3"
        />
        {wishlist}
      </div>

      {/* Image — portrait, dominates the card */}
      <div className="relative aspect-[3/4] overflow-hidden">
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

      {/* Colour swatches — below the image */}
      {swatches.length > 1 && (
        <div className="relative z-20 flex flex-wrap items-center justify-center gap-2 px-3 pt-4 sm:gap-2.5">
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
              className={`h-6 w-6 rounded-full ring-offset-2 ring-offset-paper transition-all sm:h-7 sm:w-7 ${
                sel === i ? "ring-2 ring-gold" : "ring-1 ring-line hover:ring-gold/60"
              }`}
              style={swatchStyle(c.hex)}
            />
          ))}
          {extra > 0 && <span className="text-xs text-muted sm:text-sm">+{extra}</span>}
        </div>
      )}

      {/* Text — price given the strongest weight */}
      <div className="px-5 pb-6 pt-4 text-center">
        <p className="overline text-[0.7rem]">{collection}</p>
        <h3 className="mt-2 font-serif text-xl leading-snug text-ink sm:text-2xl">
          {title}
        </h3>
        <p className="overline mt-3 text-[0.55rem] text-muted">{fromLabel}</p>
        <p className="mt-1 font-serif text-2xl text-ink sm:text-3xl">{price}</p>
        {colorName && swatches.length > 1 && (
          <p className="mt-3 whitespace-nowrap text-[0.6rem] tracking-[0.12em] text-muted uppercase sm:text-xs sm:tracking-[0.14em]">
            {colorName}
          </p>
        )}

        {/* Add to cart — outlined, fits the card, gold accent for highlight */}
        <form
          action={formAction}
          onClick={(e) => e.stopPropagation()}
          className="relative z-20 mt-5"
        >
          <input type="hidden" name="sku" value={activeSku} />
          <input type="hidden" name="quantity" value="1" />
          <button
            type="submit"
            disabled={pending || justAdded}
            className="group/cta inline-flex w-full items-center justify-center gap-2 border border-ink py-3 text-[0.65rem] tracking-[0.22em] text-ink uppercase transition-colors duration-300 hover:border-gold hover:bg-ink hover:text-cream disabled:opacity-80 sm:py-3.5 sm:text-xs"
          >
            {justAdded ? (
              <>
                <span className="text-gold">✓</span>
                {addedLabel}
              </>
            ) : (
              <>
                <span className="text-gold transition-colors duration-300 group-hover/cta:text-gold-soft">
                  +
                </span>
                {addToCartLabel}
              </>
            )}
          </button>
        </form>
      </div>
    </article>
  );
}
