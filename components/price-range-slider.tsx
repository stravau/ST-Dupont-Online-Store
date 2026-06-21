"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Dual-thumb price range slider. Bounds (min/max) are computed server-
// side from the products visible on the current page (after col / gender
// / usage filters, before price). Two overlapping <input type=range>
// elements drive the thumbs; the visual track + fill are absolutely
// positioned siblings. On thumb release we push a new URL with the
// updated priceMin / priceMax params (omitted when they equal the
// page bounds, to keep URLs clean for full-range views).
export function PriceRangeSlider({
  min,
  max,
  initialMin,
  initialMax,
  basePath,
  preserved,
  label,
  step = 10,
  currencySymbol = "€",
}: {
  min: number;
  max: number;
  initialMin: number;
  initialMax: number;
  basePath: string;
  preserved: Record<string, string | undefined>;
  label: string;
  step?: number;
  currencySymbol?: string;
}) {
  const router = useRouter();
  const [lo, setLo] = useState(initialMin);
  const [hi, setHi] = useState(initialMax);

  // Sync local state when navigation changes the bounds (e.g. switching
  // collections widens or narrows the price spread).
  useEffect(() => {
    setLo(initialMin);
    setHi(initialMax);
  }, [initialMin, initialMax]);

  function commit(nextLo: number, nextHi: number) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(preserved)) {
      if (v) params.set(k, v);
    }
    if (nextLo > min) params.set("priceMin", String(nextLo));
    if (nextHi < max) params.set("priceMax", String(nextHi));
    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  }

  function onLoChange(v: number) {
    const clamped = Math.min(v, hi - step);
    setLo(clamped);
  }
  function onHiChange(v: number) {
    const clamped = Math.max(v, lo + step);
    setHi(clamped);
  }

  const span = Math.max(1, max - min);
  const loPct = ((lo - min) / span) * 100;
  const hiPct = ((hi - min) / span) * 100;

  // Edge case — only one product (or all priced identically). Hide the
  // slider entirely; there's nothing meaningful to filter.
  if (max <= min) return null;

  return (
    <div className="mx-auto mt-6 w-full max-w-md">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] tracking-[0.2em] text-muted uppercase">{label}</span>
        <span className="font-serif text-sm text-ink">
          {currencySymbol}
          {lo} — {currencySymbol}
          {hi}
        </span>
      </div>
      <div className="price-range relative h-6">
        {/* Track (full span) */}
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-line" />
        {/* Selected sub-range fill */}
        <div
          className="pointer-events-none absolute top-1/2 h-px -translate-y-1/2 bg-gold"
          style={{ left: `${loPct}%`, right: `${100 - hiPct}%` }}
        />
        {/* Thumbs — two overlapping range inputs. pointer-events-none on
            the host so the dead area between thumbs doesn't swallow
            clicks; each thumb re-enables events on itself via CSS. */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={lo}
          aria-label={`${label} — min`}
          onChange={(e) => onLoChange(+e.target.value)}
          onMouseUp={() => commit(lo, hi)}
          onTouchEnd={() => commit(lo, hi)}
          onKeyUp={(e) => {
            if (e.key === "Enter" || e.key === " ") commit(lo, hi);
          }}
          className="range-thumb pointer-events-none absolute inset-0 m-0 appearance-none bg-transparent"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={hi}
          aria-label={`${label} — max`}
          onChange={(e) => onHiChange(+e.target.value)}
          onMouseUp={() => commit(lo, hi)}
          onTouchEnd={() => commit(lo, hi)}
          onKeyUp={(e) => {
            if (e.key === "Enter" || e.key === " ") commit(lo, hi);
          }}
          className="range-thumb pointer-events-none absolute inset-0 m-0 appearance-none bg-transparent"
        />
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[10px] tracking-[0.16em] text-muted uppercase">
        <span>
          {currencySymbol}
          {min}
        </span>
        <span>
          {currencySymbol}
          {max}
        </span>
      </div>
    </div>
  );
}
