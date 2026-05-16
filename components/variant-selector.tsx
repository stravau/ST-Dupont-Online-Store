"use client";

import { useState, useActionState } from "react";
import Link from "next/link";
import type { AddResult } from "@/lib/actions";

export interface VariantOption {
  sku: string;
  price: string;
  type?: string;
  finish?: string;
  color?: { label: string; hex: string[] };
}

export interface SelectorLabels {
  typeLabel: string;
  selectType: string;
  finishes: string;
  selectFinish: string;
  colorLabel: string;
  selectColor: string;
  addToCart: string;
  added: string;
  viewCart: string;
}

function uniq<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

export function VariantSelector({
  variants,
  labels,
  lang,
  initialType,
  addAction,
}: {
  variants: VariantOption[];
  labels: SelectorLabels;
  lang: string;
  initialType?: string;
  addAction: (prev: AddResult | null, formData: FormData) => Promise<AddResult>;
}) {
  const [state, formAction, pending] = useActionState(addAction, null);
  const [closedId, setClosedId] = useState<number | null>(null);
  const showToast = !!state?.ok && state.id !== undefined && state.id !== closedId;
  const types = uniq(variants.map((v) => v.type).filter(Boolean) as string[]);
  const finishes = uniq(variants.map((v) => v.finish).filter(Boolean) as string[]);
  const colorList: { label: string; hex: string[] }[] = [];
  for (const v of variants) {
    if (v.color && !colorList.some((c) => c.label === v.color!.label)) colorList.push(v.color);
  }

  const initialSku =
    (initialType && variants.find((v) => v.type === initialType)?.sku) || variants[0].sku;
  const [sku, setSku] = useState(initialSku);
  const active = variants.find((v) => v.sku === sku) ?? variants[0];

  // Pick the best variant when an axis changes: keep the other axes if a
  // matching combination exists, otherwise fall back to the first match.
  function choose(next: Partial<Pick<VariantOption, "type" | "finish">> & { color?: string }) {
    const want = {
      type: next.type ?? active.type,
      finish: next.finish ?? active.finish,
      color: next.color ?? active.color?.label,
    };
    const exact = variants.find(
      (v) =>
        (types.length === 0 || v.type === want.type) &&
        (finishes.length === 0 || v.finish === want.finish) &&
        (colorList.length === 0 || v.color?.label === want.color),
    );
    if (exact) return setSku(exact.sku);
    // No exact combo: snap to the first variant that honours the changed axis.
    const changedKey = next.type ? "type" : next.finish ? "finish" : "color";
    const fallback = variants.find((v) =>
      changedKey === "color"
        ? v.color?.label === next.color
        : v[changedKey as "type" | "finish"] === next[changedKey as "type" | "finish"],
    );
    setSku((fallback ?? variants[0]).sku);
  }

  const swatch = (hex: string[]) =>
    hex.length > 1
      ? { background: `linear-gradient(135deg, ${hex[0]} 0 50%, ${hex[1]} 50% 100%)` }
      : { background: hex[0] };

  return (
    <div className="space-y-8">
      {/* Type */}
      {types.length > 1 && (
        <fieldset>
          <legend className="overline">{labels.typeLabel}</legend>
          <div className="mt-4 flex flex-wrap gap-3" role="radiogroup" aria-label={labels.selectType}>
            {types.map((t) => {
              const on = active.type === t;
              return (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => choose({ type: t })}
                  className={`border px-4 py-3 text-xs tracking-[0.12em] uppercase transition-all duration-300 ${
                    on ? "border-gold bg-paper text-ink" : "border-line text-muted hover:border-gold/60 hover:text-ink"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {/* Colour — swatch circles */}
      {colorList.length > 0 && (
        <fieldset>
          <div className="flex items-baseline justify-between">
            <legend className="overline">{labels.colorLabel}</legend>
            {active.color && <span className="text-sm text-gold">{active.color.label}</span>}
          </div>
          {colorList.length > 1 ? (
            <div className="mt-4 flex flex-wrap gap-3" role="radiogroup" aria-label={labels.selectColor}>
              {colorList.map((c) => {
                const on = active.color?.label === c.label;
                return (
                  <button
                    key={c.label}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    aria-label={c.label}
                    title={c.label}
                    onClick={() => choose({ color: c.label })}
                    className={`relative h-9 w-9 rounded-full ring-offset-2 ring-offset-cream transition-all duration-300 ${
                      on ? "ring-2 ring-gold" : "ring-1 ring-line hover:ring-gold/60"
                    }`}
                  >
                    <span className="absolute inset-1 rounded-full" style={swatch(c.hex)} />
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="mt-3 text-sm tracking-wide text-ink">{colorList[0].label}</p>
          )}
        </fieldset>
      )}

      {/* Finish */}
      {finishes.length > 0 && (
        <fieldset>
          <legend className="overline">{labels.finishes}</legend>
          {finishes.length > 1 ? (
            <div className="mt-4 flex flex-wrap gap-3" role="radiogroup" aria-label={labels.selectFinish}>
              {finishes.map((f) => {
                const on = active.finish === f;
                return (
                  <button
                    key={f}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => choose({ finish: f })}
                    className={`border px-4 py-3 text-xs tracking-[0.12em] uppercase transition-all duration-300 ${
                      on ? "border-gold bg-paper text-ink" : "border-line text-muted hover:border-gold/60 hover:text-ink"
                    }`}
                  >
                    {f}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="mt-3 text-sm tracking-wide text-ink">{finishes[0]}</p>
          )}
        </fieldset>
      )}

      <p key={active.sku} className="font-serif text-3xl text-ink">
        {active.price}
      </p>

      <form action={formAction}>
        <input type="hidden" name="sku" value={active.sku} />
        <input type="hidden" name="quantity" value="1" />
        <button
          type="submit"
          disabled={pending}
          className="w-full bg-ink py-5 text-xs tracking-[0.22em] text-cream uppercase transition-colors duration-300 hover:bg-gold hover:text-ink disabled:opacity-60"
        >
          {labels.addToCart} · {active.price}
        </button>
      </form>

      {showToast && (
        <div
          key={state!.id}
          role="status"
          aria-live="polite"
          className="fixed right-4 top-[5.25rem] z-[60] w-[min(92vw,22rem)] rounded-2xl border border-line bg-paper p-5 shadow-[0_30px_70px_-30px_rgba(6,16,32,0.55)] motion-safe:animate-[toastInOut_4500ms_ease-in-out_forwards]"
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold text-paper">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <p className="overline text-[0.6rem]">{labels.added}</p>
              <p className="mt-1 truncate font-serif text-base text-ink">{state!.name}</p>
              <p className="mt-0.5 text-sm text-muted">{state!.price}</p>
              <Link
                href={`/${lang}/carrinho`}
                className="mt-3 inline-block text-xs tracking-[0.18em] text-gold uppercase transition-colors hover:text-ink"
              >
                {labels.viewCart} →
              </Link>
            </div>
            <button
              type="button"
              aria-label="×"
              onClick={() => setClosedId(state!.id ?? null)}
              className="shrink-0 text-muted transition-colors hover:text-ink"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
