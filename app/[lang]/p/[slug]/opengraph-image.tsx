import { ImageResponse } from "next/og";

// Per-product OG card. Runtime intentionally = "edge" — the Node
// runtime pulled in @prisma/client + all product hero paths and blew
// past Vercel's 250 MB function limit (371 MB, deploy rejected). The
// edge build is tiny.
//
// Because edge functions can't import lib/catalog (Prisma) OR read
// from /public, we can't render the product hero here. The card
// falls back to a text-only lockup — collection guessed from the
// slug, product name derived from the slug's title-cased tokens.
// Not as rich as a photo, but ships. A future improvement can add
// a small nodejs API route (/api/og-product/[slug]) that returns
// {name, price, image} and let this edge function fetch it, or
// switch to Vercel's "large functions beta" (VERCEL_SUPPORT_LARGE_
// FUNCTIONS=1) if the design team wants the hero back.

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "S.T. Dupont product";

const OG_TOKENS = {
  ink: "#0a1a30",
  navy: "#15314f",
  cream: "#eef3fa",
  gold: "#b58a34",
  goldSoft: "#d8bd7c",
};

function titleCase(slug: string): string {
  return slug
    .split("-")
    .map((s) => (s.length <= 2 ? s : s[0].toUpperCase() + s.slice(1)))
    .join(" ");
}

export default async function PdpOpengraphImage({
  params,
}: {
  params: { lang: string; slug: string };
}) {
  const lang = params.lang === "en" ? "en" : "pt";
  const readable = titleCase(params.slug);
  const tagline =
    lang === "pt"
      ? "Maison de luxe française"
      : "French luxury Maison";
  const cta = lang === "pt" ? "Ver na boutique" : "See in boutique";

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          backgroundColor: OG_TOKENS.ink,
          backgroundImage: `radial-gradient(circle at 30% 20%, ${OG_TOKENS.navy} 0%, transparent 55%), radial-gradient(circle at 80% 90%, ${OG_TOKENS.navy} 0%, transparent 50%)`,
          color: OG_TOKENS.cream,
          fontFamily: "serif",
          position: "relative",
        }}
      >
        {/* Gold hairline frame */}
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

        {/* Brand lockup */}
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

        {/* Product name — big serif, bottom-left */}
        <div
          style={{
            position: "absolute",
            left: 72,
            bottom: 100,
            right: 100,
            display: "flex",
            flexDirection: "column",
            gap: 22,
          }}
        >
          <span
            style={{
              fontSize: 14,
              letterSpacing: 4,
              color: OG_TOKENS.goldSoft,
              textTransform: "uppercase",
            }}
          >
            {lang === "pt" ? "Coleção" : "Collection"}
          </span>
          <span
            style={{
              fontSize: 68,
              lineHeight: 1.05,
              color: OG_TOKENS.cream,
            }}
          >
            {readable}
          </span>
          <span
            style={{
              fontSize: 15,
              letterSpacing: 3,
              color: OG_TOKENS.gold,
              textTransform: "uppercase",
              marginTop: 8,
            }}
          >
            {cta} →
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
