"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

// Pre-mailto reassurance modal. The original CTA opened the user's
// OS mail client straight away — silently nothing happened for
// visitors without one configured (web Gmail / iOS without a default
// app). This dialog confirms the email path, surfaces the phone +
// WhatsApp as alternates, and only then triggers the mailto.
export function InquiryModal({
  open,
  onClose,
  mailHref,
  phone,
  phoneHref,
  whatsappHref,
  email,
  labels,
}: {
  open: boolean;
  onClose: () => void;
  mailHref: string;
  phone: string;
  phoneHref: string;
  whatsappHref: string;
  email: string;
  labels: {
    title: string;
    body: string;
    openEmail: string;
    callPhone: string;
    whatsapp: string;
    close: string;
  };
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={labels.title}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/55 backdrop-blur-sm px-5"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md border border-line bg-cream p-7 shadow-[0_30px_70px_-30px_rgba(6,16,32,0.55)] motion-safe:animate-[fadeIn_180ms_ease-out]"
        style={{ color: "var(--ink)" }}
      >
        <button
          type="button"
          aria-label={labels.close}
          onClick={onClose}
          className="absolute right-3 top-3 text-ink transition-colors hover:text-gold"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
        <p className="overline text-gold">{labels.title}</p>
        <p className="mt-3 text-sm leading-relaxed text-muted">{labels.body}</p>

        <div className="mt-7 flex flex-col gap-3">
          <a
            href={mailHref}
            onClick={onClose}
            className="block w-full bg-ink py-4 text-center text-xs tracking-[0.22em] text-cream uppercase transition-colors duration-300 hover:bg-gold hover:text-ink"
          >
            {labels.openEmail}
            <span className="mt-1 block text-[0.6rem] tracking-[0.16em] text-cream/70">{email}</span>
          </a>
          <a
            href={phoneHref}
            className="block w-full border border-ink py-4 text-center text-xs tracking-[0.22em] text-ink uppercase transition-colors duration-300 hover:border-gold hover:text-gold"
          >
            {labels.callPhone}
            <span className="mt-1 block text-[0.6rem] tracking-[0.16em] text-muted">{phone}</span>
          </a>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full border border-ink py-4 text-center text-xs tracking-[0.22em] text-ink uppercase transition-colors duration-300 hover:border-gold hover:text-gold"
          >
            {labels.whatsapp}
          </a>
        </div>
      </div>
    </div>,
    document.body,
  );
}
