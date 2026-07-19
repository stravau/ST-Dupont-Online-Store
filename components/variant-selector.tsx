"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { compareSwatch } from "@/lib/swatch-order";
import { inquiryMailto } from "@/lib/inquiry";
import { imgSrc } from "@/lib/img";
import { InquiryModal } from "@/components/inquiry-modal";
import { STORE } from "@/lib/store-info";
import { AvailabilityStrip, type AvailabilityLabels } from "@/components/availability-strip";
import type { Locale } from "@/lib/i18n";

export interface VariantOption {
  sku: string;
  price: string;
  type?: string;
  finish?: string;
  color?: { label: string; hex: string[] };
  size?: string;
  image?: string | null;
  images?: string[]; // full gallery for the slideshow
  status?: "DISPONIVEL" | "INDISPONIVEL" | "DESCONTINUADO";
  stockLis?: number;
  stockVng?: number;
}

export interface SelectorLabels {
  typeLabel: string;
  selectType: string;
  finishes: string;
  selectFinish: string;
  colorLabel: string;
  selectColor: string;
  sizeLabel: string;
  selectSize: string;
  inquire: string;
  inquireSubject: string;
  inquireBody: string;
  priceNote: string;
  // Pre-mailto dialog strings — surfaced when the user taps Inquire
  // so the email path is confirmed and phone / WhatsApp alternates
  // are visible for visitors without a configured mail client.
  inquiryDialogTitle?: string;
  inquiryDialogBody?: string;
  inquiryOpenEmail?: string;
  inquiryCallPhone?: string;
  inquiryWhatsapp?: string;
  close?: string;
  unavailable?: string;
  unavailableNote?: string;
  availability?: AvailabilityLabels;
  lang?: Locale;
}

function uniq<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

// Roving-tabindex helper for a radiogroup of buttons. Only the
// currently-selected radio participates in Tab order (tabIndex=0);
// arrow keys move focus AND selection through the options.
// Home/End jump to the ends. Wraps around at both edges.
function rovingProps<T extends string>(
  values: T[],
  activeValue: T | undefined,
  value: T,
  onSelect: (v: T) => void,
): { tabIndex: 0 | -1; onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => void } {
  const idx = values.indexOf(value);
  const activeIdx = activeValue ? values.indexOf(activeValue) : 0;
  return {
    tabIndex: idx === activeIdx ? 0 : -1,
    onKeyDown: (e) => {
      let nextIdx = idx;
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") nextIdx = (idx - 1 + values.length) % values.length;
      else if (e.key === "ArrowRight" || e.key === "ArrowDown") nextIdx = (idx + 1) % values.length;
      else if (e.key === "Home") nextIdx = 0;
      else if (e.key === "End") nextIdx = values.length - 1;
      else return;
      e.preventDefault();
      onSelect(values[nextIdx]);
      const container = e.currentTarget.parentElement;
      if (container) {
        const btns = container.querySelectorAll<HTMLButtonElement>('button[role="radio"]');
        btns[nextIdx]?.focus();
      }
    },
  };
}

export function VariantSelector({
  variants,
  labels,
  initialType,
  initialSku: initialSkuProp,
  productTitle,
  onActiveSkuChange,
}: {
  variants: VariantOption[];
  labels: SelectorLabels;
  initialType?: string;
  initialSku?: string;
  productTitle: string;
  onActiveSkuChange?: (sku: string) => void;
}) {
  const types = uniq(variants.map((v) => v.type).filter(Boolean) as string[]);
  const finishes = uniq(variants.map((v) => v.finish).filter(Boolean) as string[]);
  const sizes = uniq(variants.map((v) => v.size).filter(Boolean) as string[]);
  // Pair each unique colour with the first variant's image so the
  // selector can render mini-photo thumbnails (see the strip below)
  // instead of the old coloured-circle swatches.
  const colorList: { label: string; hex: string[]; image: string | null }[] = [];
  for (const v of variants) {
    if (v.color && !colorList.some((c) => c.label === v.color!.label)) {
      colorList.push({
        label: v.color.label,
        hex: v.color.hex,
        image: v.image ?? null,
      });
    }
  }
  colorList.sort(compareSwatch);

  const initialSku =
    (initialSkuProp && variants.find((v) => v.sku === initialSkuProp)?.sku) ||
    (initialType && variants.find((v) => v.type === initialType)?.sku) ||
    variants[0].sku;
  const [sku, setSku] = useState(initialSku);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const active = variants.find((v) => v.sku === sku) ?? variants[0];

  // Lift the active SKU so a parent can swap the product image per colourway.
  useEffect(() => {
    onActiveSkuChange?.(active.sku);
  }, [active.sku, onActiveSkuChange]);

  // Pick the best variant when an axis changes: keep the other axes if a
  // matching combination exists, otherwise fall back to the first match.
  function choose(next: { type?: string; finish?: string; color?: string; size?: string }) {
    const want = {
      type: next.type ?? active.type,
      finish: next.finish ?? active.finish,
      color: next.color ?? active.color?.label,
      size: next.size ?? active.size,
    };
    const exact = variants.find(
      (v) =>
        (types.length === 0 || v.type === want.type) &&
        (finishes.length === 0 || v.finish === want.finish) &&
        (colorList.length === 0 || v.color?.label === want.color) &&
        (sizes.length === 0 || v.size === want.size),
    );
    if (exact) return setSku(exact.sku);
    // No exact combo: snap to the first variant that honours the changed axis.
    const fallback = variants.find((v) =>
      next.type !== undefined
        ? v.type === next.type
        : next.finish !== undefined
          ? v.finish === next.finish
          : next.size !== undefined
            ? v.size === next.size
            : v.color?.label === next.color,
    );
    setSku((fallback ?? variants[0]).sku);
  }

  const swatch = (hex: string[]) =>
    hex.length > 1
      ? { background: `linear-gradient(135deg, ${hex[0]} 0 50%, ${hex[1]} 50% 100%)` }
      : { background: hex[0] };

  const mailHref = inquiryMailto({
    subject: labels.inquireSubject,
    body: labels.inquireBody,
    data: {
      title: productTitle,
      ref: active.sku,
      sku: active.sku,
      color: active.color?.label ?? "",
      size: active.size ?? "",
    },
  });

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
                  {...rovingProps(types, active.type, t, (v) => choose({ type: v }))}
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

      {/* Colour — mini photo of the same product in each colourway.
          Side-scrolls when the strip exceeds the viewport width (3
          fit on mobile, 5 on desktop without scroll). Fallback to a
          coloured gradient when a variant has no image. */}
      {colorList.length > 0 && (
        <fieldset>
          <div className="flex items-baseline justify-between">
            <legend className="overline">{labels.colorLabel}</legend>
            {active.color && <span className="text-sm text-gold">{active.color.label}</span>}
          </div>
          {colorList.length > 1 ? (
            <div
              className="no-scrollbar mt-4 flex gap-2 overflow-x-auto sm:gap-3"
              role="radiogroup"
              aria-label={labels.selectColor}
            >
              {colorList.map((c) => {
                const on = active.color?.label === c.label;
                const thumb = imgSrc(c.image);
                return (
                  <button
                    key={c.label}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    aria-label={c.label}
                    title={c.label}
                    {...rovingProps(
                      colorList.map((cc) => cc.label),
                      active.color?.label,
                      c.label,
                      (v) => choose({ color: v }),
                    )}
                    onClick={() => choose({ color: c.label })}
                    className={`relative aspect-square h-16 w-16 shrink-0 overflow-hidden bg-paper transition-all duration-300 sm:h-20 sm:w-20 sm:border ${
                      on
                        ? "sm:border-gold sm:ring-1 sm:ring-gold"
                        : "sm:border-line sm:hover:border-gold/60"
                    }`}
                    style={thumb ? undefined : swatch(c.hex)}
                  >
                    {thumb && (
                      <Image
                        src={thumb}
                        alt={c.label}
                        fill
                        sizes="80px"
                        className="object-contain"
                      />
                    )}
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
                    {...rovingProps(finishes, active.finish, f, (v) => choose({ finish: v }))}
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

      {/* Size (e.g. Line D: Medium / Large / XL) */}
      {sizes.length > 0 && (
        <fieldset>
          <legend className="overline">{labels.sizeLabel}</legend>
          {sizes.length > 1 ? (
            <div className="mt-4 flex flex-wrap gap-3" role="radiogroup" aria-label={labels.selectSize}>
              {sizes.map((s) => {
                const on = active.size === s;
                return (
                  <button
                    key={s}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    {...rovingProps(sizes, active.size, s, (v) => choose({ size: v }))}
                    onClick={() => choose({ size: s })}
                    className={`border px-4 py-3 text-xs tracking-[0.12em] uppercase transition-all duration-300 ${
                      on ? "border-gold bg-paper text-ink" : "border-line text-muted hover:border-gold/60 hover:text-ink"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="mt-3 text-sm tracking-wide text-ink">{sizes[0]}</p>
          )}
        </fieldset>
      )}

      <div>
        <p key={active.sku} className="font-serif text-3xl text-ink">
          {active.price}
        </p>
        <p className="mt-2 text-xs tracking-[0.14em] text-muted uppercase">{labels.priceNote}</p>
      </div>

      {active.status === "INDISPONIVEL" ? (
        <div className="border border-[#d4a017] bg-[#fff7e0] px-4 py-4 text-center">
          <p className="text-xs tracking-[0.16em] text-[#9a7000] uppercase">
            {labels.unavailable ?? "Temporarily unavailable"}
          </p>
          <p className="mt-1 text-[0.65rem] text-muted">
            {labels.unavailableNote ?? "Contacte a boutique para mais informações sobre disponibilidade."}
          </p>
          <button
            type="button"
            onClick={() => setInquiryOpen(true)}
            className="mt-3 inline-block border-b border-ink pb-0.5 text-[0.65rem] tracking-[0.18em] text-ink uppercase transition-colors hover:border-gold hover:text-gold"
          >
            {labels.inquire}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setInquiryOpen(true)}
          className="block w-full bg-ink py-5 text-center text-xs tracking-[0.22em] text-cream uppercase transition-colors duration-300 hover:bg-gold hover:text-ink"
        >
          {labels.inquire}
        </button>
      )}

      {labels.availability && labels.lang && (
        <AvailabilityStrip
          stockLis={active.stockLis}
          stockVng={active.stockVng}
          labels={labels.availability}
          lang={labels.lang}
        />
      )}

      <InquiryModal
        open={inquiryOpen}
        onClose={() => setInquiryOpen(false)}
        mailHref={mailHref}
        phone={STORE.phone}
        phoneHref={STORE.phoneHref}
        // WhatsApp deep-link with the same prefilled subject so the
        // boutique sees a meaningful first line.
        whatsappHref={`https://wa.me/${STORE.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Olá! Tenho interesse em: ${productTitle} (ref ${active.sku}).`)}`}
        email={`stdupont_eci_lx@starbrands.pt`}
        labels={{
          title: labels.inquiryDialogTitle ?? "How would you like to reach us?",
          body: labels.inquiryDialogBody ?? "We handle personalised enquiries at the boutique.",
          openEmail: labels.inquiryOpenEmail ?? "Open email",
          callPhone: labels.inquiryCallPhone ?? "Call",
          whatsapp: labels.inquiryWhatsapp ?? "WhatsApp",
          close: labels.close ?? "Close",
        }}
      />
    </div>
  );
}
