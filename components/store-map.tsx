"use client";

import { useState } from "react";

// Privacy-friendly map: nothing is requested from Google until the visitor
// explicitly loads it (no third-party cookies before consent).
export function StoreMap({
  src,
  title,
  loadLabel,
  consent,
}: {
  src: string;
  title: string;
  loadLabel: string;
  consent: string;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden border border-line bg-cream md:aspect-auto md:flex-1">
      {loaded ? (
        <iframe
          title={title}
          src={src}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setLoaded(true)}
          className="group absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center"
          aria-label={loadLabel}
        >
          <span
            aria-hidden
            className="absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, rgba(181,138,52,0.18) 0 1px, transparent 1px 20px), repeating-linear-gradient(-45deg, rgba(181,138,52,0.18) 0 1px, transparent 1px 20px)",
            }}
          />
          <svg
            width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="1.4" className="relative text-gold"
          >
            <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" strokeLinejoin="round" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
          <span className="relative inline-block border border-ink px-7 py-3 text-xs tracking-[0.2em] text-ink uppercase transition-colors duration-300 group-hover:bg-ink group-hover:text-cream">
            {loadLabel}
          </span>
          <span className="relative max-w-xs text-[0.7rem] leading-relaxed text-muted">
            {consent}
          </span>
        </button>
      )}
    </div>
  );
}
