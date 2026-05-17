"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { ProductImage } from "@/components/product-image";
import { VariantSelector, type VariantOption, type SelectorLabels } from "@/components/variant-selector";
import type { AddResult } from "@/lib/actions";

// Two-column product top: the left image swaps to the selected colourway's
// photo, the right column carries the (server-rendered) header + selector.
export function ProductDetail({
  fallbackImage,
  seed,
  label,
  variants,
  labels,
  lang,
  initialType,
  addAction,
  header,
  extras,
}: {
  fallbackImage: string | null;
  seed: string;
  label: string;
  variants: VariantOption[];
  labels: SelectorLabels;
  lang: string;
  initialType?: string;
  addAction: (prev: AddResult | null, formData: FormData) => Promise<AddResult>;
  header: React.ReactNode;
  extras: React.ReactNode;
}) {
  const initialSku =
    (initialType && variants.find((v) => v.type === initialType)?.sku) || variants[0].sku;
  const initialImage = variants.find((v) => v.sku === initialSku)?.image ?? fallbackImage;
  const [image, setImage] = useState<string | null>(initialImage ?? null);

  const handleActiveSku = useCallback(
    (sku: string) => {
      const v = variants.find((x) => x.sku === sku);
      setImage(v?.image ?? fallbackImage ?? null);
    },
    [variants, fallbackImage],
  );

  return (
    <div className="mt-10 grid gap-14 md:grid-cols-2">
      <div className="relative aspect-[5/6] border border-line bg-white">
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
      </div>

      <div className="flex flex-col justify-center">
        {header}
        <div className="mt-10">
          <VariantSelector
            variants={variants}
            lang={lang}
            initialType={initialType}
            addAction={addAction}
            labels={labels}
            onActiveSkuChange={handleActiveSku}
          />
        </div>
        {extras}
      </div>
    </div>
  );
}
