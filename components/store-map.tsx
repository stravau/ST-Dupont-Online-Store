"use client";

import { useState } from "react";

// Privacy-friendly map: nothing is requested from Google until the visitor
// explicitly loads it (no third-party cookies before consent). The pre-load
// placeholder now reads as a stylised mini-map (road-like stripes, a pinned
// venue card with the address, a bold gold pin) instead of the previous
// nearly-empty hatched panel — visitors recognise what they're loading.
export function StoreMap({
  src,
  title,
  loadLabel,
  consent,
  venue,
  street,
  postcode,
}: {
  src: string;
  title: string;
  loadLabel: string;
  consent: string;
  venue?: string;
  street?: string;
  postcode?: string;
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
          className="group absolute inset-0 flex flex-col items-center justify-center gap-5 px-6 text-center"
          aria-label={loadLabel}
        >
          {/* Stylised map texture: a soft grid (city blocks) + two diagonal
              "roads" cutting through, all in a warm gold tint over cream. */}
          <span
            aria-hidden
            className="absolute inset-0 opacity-[0.55]"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(181,138,52,0.10) 1px, transparent 1px), linear-gradient(to bottom, rgba(181,138,52,0.10) 1px, transparent 1px)",
              backgroundSize: "44px 44px, 44px 44px",
            }}
          />
          <span
            aria-hidden
            className="absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                "linear-gradient(115deg, transparent 46%, rgba(181,138,52,0.30) 46% 48%, transparent 48%), linear-gradient(-25deg, transparent 62%, rgba(181,138,52,0.22) 62% 63.5%, transparent 63.5%)",
            }}
          />

          {/* Gold pin marker — larger than before so it reads at a glance
              as a "you are here" cue. Drop shadow gives it depth over the
              grid backdrop. */}
          <span aria-hidden className="relative flex h-12 w-12 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-gold/15" />
            <svg
              width="42"
              height="42"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="relative text-gold drop-shadow-[0_3px_6px_rgba(181,138,52,0.45)]"
            >
              <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" strokeLinejoin="round" />
              <circle cx="12" cy="10" r="2.5" fill="currentColor" />
            </svg>
          </span>

          {/* Venue card — name + address pinned over the placeholder so the
              visitor sees WHAT they're loading before they consent. */}
          {(venue || street) && (
            <address className="relative max-w-xs space-y-1 text-sm not-italic text-ink">
              {venue && <p className="font-serif text-base text-ink">{venue}</p>}
              {street && <p className="text-xs text-muted">{street}</p>}
              {postcode && <p className="text-xs text-muted">{postcode}</p>}
            </address>
          )}

          <span className="relative inline-flex items-center gap-2 border border-ink bg-cream px-8 py-3 text-xs tracking-[0.2em] text-ink uppercase transition-colors duration-300 group-hover:bg-ink group-hover:text-cream">
            {loadLabel}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
              <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>

          <span className="relative max-w-xs text-[0.7rem] leading-relaxed text-muted">
            {consent}
          </span>
        </button>
      )}
    </div>
  );
}
