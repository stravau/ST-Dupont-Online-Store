"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { ProductImage } from "@/components/product-image";
import { VariantSelector, type VariantOption, type SelectorLabels } from "@/components/variant-selector";
import { SpecDetails } from "@/components/spec-details";
import { imgSrc } from "@/lib/img";
import type { AddResult } from "@/lib/actions";
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
  addAction,
  header,
  extras,
  specsByVariant,
  specsTitle,
}: {
  fallbackImage: string | null;
  seed: string;
  label: string;
  variants: VariantOption[];
  labels: SelectorLabels;
  initialType?: string;
  initialSku?: string;
  addAction: (prev: AddResult | null, formData: FormData) => Promise<AddResult>;
  header: React.ReactNode;
  extras: React.ReactNode;
  specsByVariant: Record<string, Spec[]>;
  specsTitle: string;
}) {
  const startSku =
    (initialSku && variants.find((v) => v.sku === initialSku)?.sku) ||
    (initialType && variants.find((v) => v.type === initialType)?.sku) ||
    variants[0].sku;
  const [activeSku, setActiveSku] = useState<string>(startSku);
  const [idx, setIdx] = useState(0); // index within the active colourway's gallery

  const handleActiveSku = useCallback((sku: string) => {
    setActiveSku(sku);
    setIdx(0); // reset to the front photo when the colourway changes
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
  const image = gallery[safeIdx] ?? null;
  const hasMany = gallery.length > 1;
  const go = (d: number) => setIdx((i) => i + d);

  return (
    <>
    <div className="mt-10 grid gap-14 md:grid-cols-2">
      <div className="group relative aspect-[5/6] overflow-hidden border border-line bg-white">
        {image ? (
          <Image
            key={image}
            src={image}
            alt={label}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
            className="object-contain motion-safe:transition-opacity motion-safe:duration-300"
          />
        ) : (
          <ProductImage seed={seed} label={label} className="h-full w-full" />
        )}

        {hasMany && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-cream/85 text-ink backdrop-blur transition-colors hover:border-gold hover:text-gold"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Next image"
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
                  aria-label={`Image ${i + 1}`}
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
        <div className="mt-10">
          <VariantSelector
            variants={variants}
            initialType={initialType}
            initialSku={initialSku}
            addAction={addAction}
            labels={labels}
            onActiveSkuChange={handleActiveSku}
          />
        </div>
        {extras}
      </div>
    </div>

      <SpecDetails title={specsTitle} specs={specsByVariant[activeSku] ?? []} />
    </>
  );
}
