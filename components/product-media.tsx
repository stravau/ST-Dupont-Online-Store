import Image from "next/image";
import { ProductImage } from "@/components/product-image";

// Renders official product photography when supplied, otherwise the on-brand
// SVG placeholder. Drop assets in /public/products and set `image` in
// lib/catalog.ts (e.g. "/products/ligne-2.jpg") to switch over — no code change.
export function ProductMedia({
  image,
  seed,
  label,
  className = "",
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority = false,
}: {
  image: string | null;
  seed: string;
  label: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (image) {
    return (
      <div className={`relative ${className}`}>
        <Image
          src={image}
          alt={label}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      </div>
    );
  }
  return <ProductImage seed={seed} label={label} className={className} />;
}
