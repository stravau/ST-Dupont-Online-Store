"use client";

import { useActionState, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import type { AddResult } from "@/lib/actions";
import { ProductImage } from "@/components/product-image";
import { LoadingOverlay } from "@/components/loading-overlay";
import { imgSrc } from "@/lib/img";

export interface CardSwatch {
  sku: string;
  label: string;
  hex: string[];
  image: string | null;
  hoverImage?: string | null; // close-up, shown on card hover
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
  viewCartLabel,
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
  viewCartLabel: string;
  wishlist: React.ReactNode;
}) {
  const [sel, setSel] = useState(0);
  const [hover, setHover] = useState(false);
  const active = swatches[sel];
  const image = imgSrc(
    hover && active?.hoverImage ? active.hoverImage : active?.image ?? fallbackImage,
  );
  const price = active?.price ?? basePrice;
  const colorName = active?.label;
  const activeSku = active?.sku ?? baseSku;

  // Add-to-cart action; confirmation is shown via a top-right toast popup
  // (same one used by the product-detail page) rather than animating the
  // button itself — works the same on PC and mobile.
  const [addState, formAction, pending] = useActionState(addAction, null);
  const [closedId, setClosedId] = useState<number | null>(null);
  const showToast =
    !!addState?.ok && addState.id !== undefined && addState.id !== closedId;
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
    <article
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="lux-hover reveal group relative flex flex-col overflow-hidden border border-line bg-paper"
    >
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

      {/* Colour swatches — always rendered (even when there's just one
          variant) so every card reserves the same vertical slot and the
          text below lines up across the row. */}
      <div className="relative z-20 flex min-h-[2.5rem] flex-wrap items-center justify-center gap-2 px-3 pt-4 sm:min-h-[3rem] sm:gap-2.5">
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
      <div className="flex flex-1 flex-col px-5 pb-6 pt-4 text-center">
        <p className="overline text-[0.7rem]">{collection}</p>
        <h3 className="mt-2 line-clamp-2 min-h-[3rem] font-serif text-xl leading-snug text-ink sm:min-h-[3.5rem] sm:text-2xl">
          {title}
        </h3>
        <p className="overline mt-3 text-[0.55rem] text-muted">{fromLabel}</p>
        <p className="mt-1 font-serif text-2xl text-ink sm:text-3xl">{price}</p>
        {/* Color name slot — always rendered (nbsp when empty) so the
            row spacing matches across cards with/without swatches. */}
        <p className="mt-3 truncate text-[0.6rem] tracking-[0.12em] text-muted uppercase sm:text-xs sm:tracking-[0.14em]">
          {colorName && swatches.length > 1 ? colorName : " "}
        </p>

        {/* Add to cart — blue with gold lettering; on PC, hover flips to
            gold with blue lettering. No tap animation on mobile. */}
        <form
          action={formAction}
          onClick={(e) => e.stopPropagation()}
          className="relative z-20 mt-auto pt-5"
        >
          <input type="hidden" name="sku" value={activeSku} />
          <input type="hidden" name="quantity" value="1" />
          <button
            type="submit"
            disabled={pending}
            className="inline-flex w-full items-center justify-center gap-2 border border-ink bg-ink py-3 text-[0.65rem] tracking-[0.22em] text-gold uppercase disabled:opacity-80 sm:py-3.5 sm:text-xs sm:transition-colors sm:duration-300 sm:hover:border-gold sm:hover:bg-gold sm:hover:text-ink"
          >
            <span>+</span>
            {addToCartLabel}
          </button>
        </form>
      </div>

      {/* Centred loading spinner while the add-to-cart request is in flight */}
      <LoadingOverlay show={pending} />

      {/* "Added to cart" toast — portalled to document.body so the card's
          hover transform can't capture its fixed positioning (was making
          the toast render inside the card on mobile). */}
      {showToast && createPortal(
        <div
          key={addState!.id}
          role="status"
          aria-live="polite"
          className="fixed right-[max(1.5rem,calc((100vw_-_80rem)/2_+_1.5rem))] top-[5.25rem] z-[60] w-[min(92vw,22rem)] rounded-2xl border border-line bg-paper p-5 shadow-[0_30px_70px_-30px_rgba(6,16,32,0.55)] motion-safe:animate-[toastInOut_4500ms_ease-in-out_forwards]"
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold text-paper">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <p className="overline text-[0.6rem]">{addedLabel}</p>
              <p className="mt-1 truncate font-serif text-base text-ink">
                {addState!.name ?? title}
              </p>
              <p className="mt-0.5 text-sm text-muted">{addState!.price ?? price}</p>
              <button
                type="button"
                onClick={() => {
                  setClosedId(addState!.id ?? null);
                  window.dispatchEvent(new CustomEvent("stdupont:open-cart"));
                }}
                className="mt-3 inline-block text-xs tracking-[0.18em] text-gold uppercase transition-colors hover:text-ink"
              >
                {viewCartLabel} →
              </button>
            </div>
            <button
              type="button"
              aria-label="×"
              onClick={() => setClosedId(addState!.id ?? null)}
              className="shrink-0 text-muted transition-colors hover:text-ink"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>,
        document.body,
      )}
    </article>
  );
}
