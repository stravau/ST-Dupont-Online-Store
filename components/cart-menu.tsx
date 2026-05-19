"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ProductMedia } from "@/components/product-media";

export interface CartMenuLine {
  itemId: string;
  productSlug: string;
  productName: string;
  variantName: string;
  quantity: number;
  linePrice: string;
  image: string | null;
}

// Header cart: a real shopping-cart icon that opens a dropdown summarising
// every line. Each line has -/+ quantity controls and an × to remove;
// "Finalizar compra" at the foot leads to the full cart page.
export function CartMenu({
  count,
  cartHref,
  lines,
  subtotal,
  updateAction,
  removeAction,
  labels,
}: {
  count: number;
  cartHref: string;
  lines: CartMenuLine[];
  subtotal: string;
  updateAction: (formData: FormData) => Promise<void>;
  removeAction: (formData: FormData) => Promise<void>;
  labels: {
    title: string;
    empty: string;
    subtotal: string;
    finalize: string;
    qty: string;
    remove: string;
  };
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close on route change.
  useEffect(() => {
    queueMicrotask(() => setOpen(false));
  }, [pathname]);

  // Let the add-to-cart toast's "View cart" button open this dropdown
  // instead of navigating to the full /carrinho page.
  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("stdupont:open-cart", onOpen);
    return () => window.removeEventListener("stdupont:open-cart", onOpen);
  }, []);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={labels.title}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative flex items-center text-ink transition-colors hover:text-gold"
      >
        {/* Shopping cart (basket on wheels) */}
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path
            d="M2 3h2.2l2.1 12.1a1.6 1.6 0 0 0 1.6 1.3h9.1a1.6 1.6 0 0 0 1.57-1.27L21 7H6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="9.5" cy="20" r="1.4" />
          <circle cx="17.5" cy="20" r="1.4" />
        </svg>
        {count > 0 && (
          <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[0.6rem] text-paper">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-[60] mt-4 w-[22rem] max-w-[calc(100vw-2rem)] border border-line bg-cream shadow-[0_18px_50px_rgba(10,26,48,0.25)]">
          <p className="overline border-b border-line px-5 py-4">{labels.title}</p>

          {lines.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted">{labels.empty}</p>
          ) : (
            <>
              <ul className="max-h-[24rem] divide-y divide-line/70 overflow-y-auto">
                {lines.map((l) => (
                  <li key={l.itemId} className="relative flex gap-4 px-5 py-4 pr-9">
                    <Link
                      href={`${cartHref.replace(/\/carrinho$/, "")}/p/${l.productSlug}`}
                      className="block h-16 w-14 shrink-0 border border-line"
                      onClick={() => setOpen(false)}
                    >
                      <ProductMedia
                        image={l.image}
                        seed={l.productSlug}
                        label={l.productName}
                        className="h-full w-full"
                        sizes="56px"
                      />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-serif text-sm text-ink">{l.productName}</p>
                      <p className="mt-0.5 truncate text-xs text-muted">{l.variantName}</p>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        {/* −  N  + */}
                        <div className="inline-flex items-center border border-line">
                          <form action={updateAction}>
                            <input type="hidden" name="itemId" value={l.itemId} />
                            <input type="hidden" name="quantity" value={l.quantity - 1} />
                            <button
                              type="submit"
                              aria-label="−"
                              disabled={l.quantity <= 1}
                              className="flex h-7 w-7 items-center justify-center text-sm text-ink transition-colors hover:text-gold disabled:cursor-not-allowed disabled:text-muted/60"
                            >
                              −
                            </button>
                          </form>
                          <span className="min-w-[1.5rem] border-x border-line text-center text-xs tabular-nums text-ink">
                            {l.quantity}
                          </span>
                          <form action={updateAction}>
                            <input type="hidden" name="itemId" value={l.itemId} />
                            <input type="hidden" name="quantity" value={l.quantity + 1} />
                            <button
                              type="submit"
                              aria-label="+"
                              disabled={l.quantity >= 99}
                              className="flex h-7 w-7 items-center justify-center text-sm text-ink transition-colors hover:text-gold disabled:cursor-not-allowed disabled:text-muted/60"
                            >
                              +
                            </button>
                          </form>
                        </div>
                        <p className="whitespace-nowrap text-sm text-ink">{l.linePrice}</p>
                      </div>
                    </div>
                    {/* Remove (×) — top-right corner */}
                    <form action={removeAction} className="absolute right-2 top-2">
                      <input type="hidden" name="itemId" value={l.itemId} />
                      <button
                        type="submit"
                        aria-label={labels.remove}
                        title={labels.remove}
                        className="flex h-6 w-6 items-center justify-center text-muted transition-colors hover:text-ink"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                          <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                        </svg>
                      </button>
                    </form>
                  </li>
                ))}
              </ul>

              <div className="border-t border-line px-5 py-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="overline">{labels.subtotal}</span>
                  <span className="font-serif text-lg text-ink">{subtotal}</span>
                </div>
              </div>
            </>
          )}

          <div className="border-t border-line p-4">
            <Link
              href={cartHref}
              onClick={() => setOpen(false)}
              className="block w-full bg-ink py-4 text-center text-xs tracking-[0.22em] text-cream uppercase transition-colors duration-300 hover:bg-gold hover:text-ink"
            >
              {labels.finalize}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
