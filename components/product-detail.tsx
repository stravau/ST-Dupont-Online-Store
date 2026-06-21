"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { ProductImage } from "@/components/product-image";
import { VariantSelector, type VariantOption, type SelectorLabels } from "@/components/variant-selector";
import { SpecDetails } from "@/components/spec-details";
import { DescriptionDetails } from "@/components/description-details";
import { imgSrc } from "@/lib/img";
import type { Spec } from "@/lib/specs";

// Two-column product top: the left image swaps to the selected colourway's
// photo, the right column carries the (server-rendered) header + selector.
export function ProductDetail({
  fallbackImage,
  seed,
  label,
  variants,
  labels,
  initialType,
  initialSku,
  header,
  extras,
  specsByVariant,
  specsTitle,
  description,
  descriptionTitle,
  galleryLabels = { previous: "Previous image", next: "Next image", image: "Image" },
}: {
  fallbackImage: string | null;
  seed: string;
  label: string;
  variants: VariantOption[];
  labels: SelectorLabels;
  initialType?: string;
  initialSku?: string;
  header: React.ReactNode;
  extras: React.ReactNode;
  specsByVariant: Record<string, Spec[]>;
  specsTitle: string;
  description?: string;
  descriptionTitle?: string;
  galleryLabels?: { previous: string; next: string; image: string };
}) {
  const startSku =
    (initialSku && variants.find((v) => v.sku === initialSku)?.sku) ||
    (initialType && variants.find((v) => v.type === initialType)?.sku) ||
    // default to the colourway whose photo is the product's main image
    (fallbackImage && variants.find((v) => v.image === fallbackImage)?.sku) ||
    variants[0].sku;
  const [activeSku, setActiveSku] = useState<string>(startSku);
  const [idx, setIdx] = useState(0); // index within the active colourway's gallery

  const handleActiveSku = useCallback((sku: string) => {
    setActiveSku(sku);
    setIdx(0); // reset to the front photo when the colourway changes
  }, []);

  // Cursor-tracking hover zoom — desktop only. `zoom` is null when the cursor
  // is outside the frame; otherwise carries the cursor position as a percent
  // of the container, which becomes the active image's transform-origin so
  // the magnified view follows the cursor like a loupe.
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const onZoomMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const rect = e.currentTarget.getBoundingClientRect();
    setZoom({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, []);
  const onZoomLeave = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    setZoom(null);
  }, []);

  const activeVariant = variants.find((v) => v.sku === activeSku);
  const gallery = (
    activeVariant?.images?.length
      ? activeVariant.images
      : activeVariant?.image
        ? [activeVariant.image]
        : fallbackImage
          ? [fallbackImage]
          : []
  ).map((s) => imgSrc(s)!);
  const safeIdx = gallery.length ? ((idx % gallery.length) + gallery.length) % gallery.length : 0;
  const hasMany = gallery.length > 1;
  const go = (d: number) => setIdx((i) => i + d);

  return (
    <>
    <div className="mt-10 grid gap-14 md:grid-cols-2">
      <div
        className="group relative aspect-[5/6] overflow-hidden border border-line bg-white md:cursor-zoom-in"
        onPointerEnter={onZoomMove}
        onPointerMove={onZoomMove}
        onPointerLeave={onZoomLeave}
      >
        {gallery.length > 0 ? (
          // Sliding track: all of the colourway's photos laid side by side,
          // translated by the active index. Remounts per colourway (key) so
          // switching colour snaps to the front photo instead of sliding.
          <div
            key={activeSku}
            className="flex h-full ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:transition-transform motion-safe:duration-500 motion-reduce:transition-none"
            style={{
              width: `${gallery.length * 100}%`,
              transform: `translateX(-${safeIdx * (100 / gallery.length)}%)`,
            }}
          >
            {gallery.map((src, i) => {
              const z = i === safeIdx ? zoom : null;
              return (
                <div
                  key={src}
                  className="relative h-full"
                  style={{ width: `${100 / gallery.length}%` }}
                >
                  <Image
                    src={src}
                    alt={label}
                    fill
                    sizes="(max-width: 768px) 100vw, 640px"
                    priority={i === 0}
                    className="object-contain will-change-transform"
                    style={
                      z
                        ? {
                            transform: "scale(2.2)",
                            transformOrigin: `${z.x}% ${z.y}%`,
                          }
                        : undefined
                    }
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <ProductImage seed={seed} label={label} className="h-full w-full" />
        )}

        {hasMany && (
          <>
            <button
              type="button"
              aria-label={galleryLabels.previous}
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-cream/85 text-ink backdrop-blur transition-colors hover:border-gold hover:text-gold"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              aria-label={galleryLabels.next}
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-cream/85 text-ink backdrop-blur transition-colors hover:border-gold hover:text-gold"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="absolute inset-x-0 bottom-3 z-10 flex items-center justify-center gap-2">
              {gallery.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`${galleryLabels.image} ${i + 1}`}
                  onClick={() => setIdx(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === safeIdx ? "w-5 bg-gold" : "w-1.5 bg-line hover:bg-gold/60"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex flex-col justify-center">
        {header}
        <p className="mt-3 text-xs tracking-[0.2em] text-muted uppercase">REF · {activeSku}</p>
        <div className="mt-10">
          <VariantSelector
            variants={variants}
            initialType={initialType}
            initialSku={initialSku}
            productTitle={label}
            labels={labels}
            onActiveSkuChange={handleActiveSku}
          />
        </div>
        {extras}
      </div>
    </div>

      {/* Description disclosure — sits immediately above the spec
          collapsible so the two read as a pair of complementary
          "tell me more" toggles. Hidden when no copy is supplied. */}
      {description && descriptionTitle && (
        <DescriptionDetails title={descriptionTitle} body={description} />
      )}
      <SpecDetails title={specsTitle} specs={specsByVariant[activeSku] ?? []} />
    </>
  );
}
