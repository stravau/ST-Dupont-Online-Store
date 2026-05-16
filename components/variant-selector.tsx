"use client";

import { useState } from "react";

export interface VariantOption {
  sku: string;
  name: string;
  price: string;
}

export function VariantSelector({
  variants,
  labels,
  addAction,
}: {
  variants: VariantOption[];
  labels: { selectFinish: string; finishes: string; addToCart: string };
  addAction: (formData: FormData) => void | Promise<void>;
}) {
  const [selected, setSelected] = useState(0);
  const active = variants[selected];

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="overline">{labels.finishes}</p>
        <p className="text-sm text-muted">
          {selected + 1}/{variants.length}
        </p>
      </div>

      <p className="mt-3 text-sm tracking-wide text-ink">
        {labels.selectFinish}: <span className="text-gold">{active.name}</span>
      </p>

      <div className="mt-4 flex flex-wrap gap-3" role="radiogroup" aria-label={labels.selectFinish}>
        {variants.map((v, i) => (
          <button
            key={v.sku}
            type="button"
            role="radio"
            aria-checked={i === selected}
            onClick={() => setSelected(i)}
            className={`border px-4 py-3 text-xs tracking-[0.12em] uppercase transition-all duration-300 ${
              i === selected
                ? "border-gold bg-paper text-ink"
                : "border-line text-muted hover:border-gold/60 hover:text-ink"
            }`}
          >
            {v.name}
          </button>
        ))}
      </div>

      <p
        key={active.sku}
        className="mt-8 font-serif text-3xl text-ink transition-opacity duration-300"
      >
        {active.price}
      </p>

      <form action={addAction} className="mt-6">
        <input type="hidden" name="sku" value={active.sku} />
        <input type="hidden" name="quantity" value="1" />
        <button
          type="submit"
          className="w-full bg-ink py-5 text-xs tracking-[0.22em] text-cream uppercase transition-colors duration-300 hover:bg-gold hover:text-ink"
        >
          {labels.addToCart} · {active.price}
        </button>
      </form>
    </div>
  );
}
