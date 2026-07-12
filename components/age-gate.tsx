"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import type { Locale } from "@/lib/i18n";

const STORAGE_KEY = "age-verified-v1";

// Modal-only client component. Server sends the page fully rendered
// (JSON-LD, OG image, catalogue markup) — the gate is an overlay so
// crawlers see everything and the user only clears it if they're 18+.
// Confirm → localStorage 'yes'; decline → router.push(/${lang}).
export function AgeGate({
  lang,
  labels,
}: {
  lang: Locale;
  labels: {
    title: string;
    body: string;
    confirm: string;
    decline: string;
    ariaLabel: string;
  };
}) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const confirmBtnRef = useRef<HTMLButtonElement | null>(null);
  const trapRef = useFocusTrap<HTMLDivElement>(open);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    try {
      const verified = window.localStorage.getItem(STORAGE_KEY) === "yes";
      setOpen(!verified);
      if (!verified) {
        document.body.style.overflow = "hidden";
      }
    } catch {
      // localStorage disabled — treat as unverified so the gate stays up.
      setOpen(true);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  function accept() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "yes");
    } catch {
      /* ignore */
    }
    document.body.style.overflow = "";
    setOpen(false);
  }
  function reject() {
    document.body.style.overflow = "";
    router.push(`/${lang}`);
  }

  if (!mounted || !open) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={labels.ariaLabel}
      className="fixed inset-0 z-[110] flex items-center justify-center bg-ink/85 backdrop-blur-sm px-5"
    >
      <div
        ref={trapRef}
        className="relative w-full max-w-md border border-line bg-cream p-8 text-center shadow-[0_30px_70px_-30px_rgba(6,16,32,0.55)] motion-safe:animate-[fadeIn_180ms_ease-out]"
      >
        <p className="overline text-gold">{labels.title}</p>
        <div className="gold-rule mx-auto my-5" />
        <p className="text-sm leading-relaxed text-ink">{labels.body}</p>
        <div className="mt-8 flex flex-col gap-3">
          <button
            ref={confirmBtnRef}
            type="button"
            onClick={accept}
            className="w-full bg-ink py-4 text-xs tracking-[0.22em] text-cream uppercase transition-colors duration-300 hover:bg-gold hover:text-ink"
          >
            {labels.confirm}
          </button>
          <button
            type="button"
            onClick={reject}
            className="w-full border border-ink py-4 text-xs tracking-[0.22em] text-ink uppercase transition-colors duration-300 hover:border-gold hover:text-gold"
          >
            {labels.decline}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
