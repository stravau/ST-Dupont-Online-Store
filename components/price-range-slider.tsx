"use client";

import { useEffect, useRef, useState } from "react";
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
  // Editable text mirrors of lo/hi so people can TYPE a bound instead of
  // dragging. Free text while editing; parsed + clamped + committed on blur/Enter.
  const [loInput, setLoInput] = useState(String(initialMin));
  const [hiInput, setHiInput] = useState(String(initialMax));
  // Track whether the user is mid-drag — only commit on release, never
  // on every onChange tick (would spam the router and lag the URL).
  const draggingRef = useRef(false);

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

  // Effect-driven commit — after the user releases the thumb the
  // release handlers flip `draggingRef.current = true`; the effect
  // then fires on the next (lo, hi) change with the current state in
  // scope, sidestepping the stale-closure issue the old onMouseUp
  // handler had on fast drags (the bound callback captured (lo, hi)
  // at render time, before the final tick had landed).
  useEffect(() => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    commit(lo, hi);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lo, hi]);

  function onLoChange(v: number) {
    setLo(Math.min(v, hi - step));
  }
  function onHiChange(v: number) {
    setHi(Math.max(v, lo + step));
  }
  function flag() {
    draggingRef.current = true;
  }

  // Keep the text boxes in sync when the thumbs move (or the props reset).
  useEffect(() => setLoInput(String(lo)), [lo]);
  useEffect(() => setHiInput(String(hi)), [hi]);

  function applyLo() {
    const v = parseInt(loInput.replace(/[^\d]/g, ""), 10);
    if (Number.isNaN(v)) return setLoInput(String(lo));
    const clamped = Math.max(min, Math.min(v, hi - step));
    setLo(clamped);
    commit(clamped, hi);
  }
  function applyHi() {
    const v = parseInt(hiInput.replace(/[^\d]/g, ""), 10);
    if (Number.isNaN(v)) return setHiInput(String(hi));
    const clamped = Math.min(max, Math.max(v, lo + step));
    setHi(clamped);
    commit(lo, clamped);
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
        <div className="flex items-center gap-1 font-serif text-sm text-ink">
          <span>{currencySymbol}</span>
          <input
            type="text"
            inputMode="numeric"
            value={loInput}
            aria-label={`${label} — min`}
            onChange={(e) => setLoInput(e.target.value)}
            onBlur={applyLo}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
            }}
            className="w-14 border-b border-line bg-transparent text-right tabular-nums outline-none transition-colors focus:border-gold"
          />
          <span className="px-0.5 text-muted">—</span>
          <span>{currencySymbol}</span>
          <input
            type="text"
            inputMode="numeric"
            value={hiInput}
            aria-label={`${label} — max`}
            onChange={(e) => setHiInput(e.target.value)}
            onBlur={applyHi}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
            }}
            className="w-14 border-b border-line bg-transparent text-right tabular-nums outline-none transition-colors focus:border-gold"
          />
        </div>
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
          aria-valuetext={`${currencySymbol}${lo}`}
          onChange={(e) => onLoChange(+e.target.value)}
          onMouseUp={flag}
          onTouchEnd={flag}
          onKeyUp={flag}
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
          aria-valuetext={`${currencySymbol}${hi}`}
          onChange={(e) => onHiChange(+e.target.value)}
          onMouseUp={flag}
          onTouchEnd={flag}
          onKeyUp={flag}
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
