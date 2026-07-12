// Shared OG image primitives — the surrounding canvas and the brand
// lockup used by every route's opengraph-image.tsx. Runtime is
// `nodejs` (not edge) so we can readFile from /public when the
// product hero lives on disk.
import type { ReactNode } from "react";

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

// Brand tokens duplicated here so the OG generator doesn't need to
// pull the whole design system into the Node runtime (satori doesn't
// resolve CSS variables). Keep in sync with globals.css if they ever
// drift.
export const OG_TOKENS = {
  ink: "#0a1a30",
  navy: "#15314f",
  cream: "#eef3fa",
  gold: "#b58a34",
  goldSoft: "#d8bd7c",
  line: "#d4deec",
  muted: "#4a5a72",
} as const;

// Full-bleed dark canvas with a gold hairline frame. Every OG image
// renders on top of this so social cards read as one system.
export function OgCanvas({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        width: OG_SIZE.width,
        height: OG_SIZE.height,
        display: "flex",
        flexDirection: "column",
        backgroundColor: OG_TOKENS.ink,
        backgroundImage: `radial-gradient(circle at 30% 20%, ${OG_TOKENS.navy} 0%, transparent 55%), radial-gradient(circle at 80% 90%, ${OG_TOKENS.navy} 0%, transparent 50%)`,
        color: OG_TOKENS.cream,
        fontFamily: "serif",
        position: "relative",
      }}
    >
      {/* Gold-hairline frame */}
      <div
        style={{
          position: "absolute",
          top: 32,
          left: 32,
          right: 32,
          bottom: 32,
          border: `1px solid ${OG_TOKENS.gold}`,
          opacity: 0.55,
        }}
      />
      {children}
    </div>
  );
}

// Small brand mark used top-left of every card.
export function BrandLockup({ tagline }: { tagline: string }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 60,
        left: 72,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <span
        style={{
          fontFamily: "serif",
          fontSize: 30,
          letterSpacing: 6,
          color: OG_TOKENS.cream,
          textTransform: "uppercase",
        }}
      >
        S.T. Dupont
      </span>
      <span
        style={{
          fontSize: 14,
          letterSpacing: 3,
          color: OG_TOKENS.goldSoft,
          textTransform: "uppercase",
        }}
      >
        {tagline}
      </span>
    </div>
  );
}
