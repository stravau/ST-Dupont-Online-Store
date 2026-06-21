"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Dual-thumb price range slider. Two overlapping <input type=range>
// share the same track; the thumbs are stacked via z-index so they're
// both grabbable. Track + fill are absolutely-positioned siblings
// painted by us (the native input tracks are made transparent so only
// the thumbs read visually). On thumb release we push the new bounds
// into the URL as priceMin / priceMax.
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

  useEffect(() => {
    setLo(initialMin);
    setHi(initialMax);
  }, [initialMin, initialMax]);

  function commit(nextLo: number, nextHi: number) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(preserved)) if (v) params.set(k, v);
    if (nextLo > min) params.set("priceMin", String(nextLo));
    if (nextHi < max) params.set("priceMax", String(nextHi));
    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  }

  function onLoChange(v: number) {
    setLo(Math.min(v, hi - step));
  }
  function onHiChange(v: number) {
    setHi(Math.max(v, lo + step));
  }

  const span = Math.max(1, max - min);
  const loPct = ((lo - min) / span) * 100;
  const hiPct = ((hi - min) / span) * 100;

  // Nothing to filter — show the single price as a static line.
  if (max <= min) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between">
          <span className="text-[11px] tracking-[0.2em] text-muted uppercase">{label}</span>
          <span className="font-serif text-sm text-ink">
            {currencySymbol}
            {min}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] tracking-[0.2em] text-muted uppercase">{label}</span>
        <span className="font-serif text-sm text-ink">
          {currencySymbol}
          {lo} — {currencySymbol}
          {hi}
        </span>
      </div>
      <div className="price-range relative h-8 px-1">
        <div className="pointer-events-none absolute inset-x-1 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-line" />
        <div
          className="pointer-events-none absolute top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-gold"
          style={{
            left: `calc(0.25rem + ${loPct}% - ${loPct / 100}rem)`,
            right: `calc(0.25rem + ${100 - hiPct}% - ${(100 - hiPct) / 100}rem)`,
          }}
        />
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
          // Lower input on top so the user can always grab the min
          // thumb; once the min is close to max, the user can still
          // grab the max thumb from its visible edge (which sticks out
          // to the right of the min thumb).
          className="range-thumb absolute inset-0 m-0 w-full appearance-none bg-transparent"
          style={{ zIndex: 4 }}
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
          className="range-thumb absolute inset-0 m-0 w-full appearance-none bg-transparent"
          style={{ zIndex: 3 }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-[10px] tracking-[0.16em] text-muted uppercase">
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
