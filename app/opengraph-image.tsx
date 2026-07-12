import { ImageResponse } from "next/og";
import { OG_SIZE, OG_CONTENT_TYPE, OG_TOKENS, OgCanvas, BrandLockup } from "@/lib/og/shared";

// Default OG card for the whole site — served whenever a route
// hasn't got its own opengraph-image.tsx sibling.

export const runtime = "nodejs";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "S.T. Dupont — Maison de luxe française";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <OgCanvas>
        <BrandLockup tagline="Maison de luxe française" />
        <div
          style={{
            marginTop: "auto",
            marginBottom: 96,
            marginLeft: 72,
            marginRight: 72,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <span
            style={{
              fontSize: 15,
              letterSpacing: 4,
              color: OG_TOKENS.gold,
              textTransform: "uppercase",
            }}
          >
            Desde 1872
          </span>
          <span
            style={{
              fontFamily: "serif",
              fontSize: 84,
              lineHeight: 1.05,
              color: OG_TOKENS.cream,
            }}
          >
            Isqueiros, escrita e pele feitos à mão em Faverges.
          </span>
          <span
            style={{
              fontSize: 22,
              letterSpacing: 1,
              color: OG_TOKENS.cream,
              opacity: 0.75,
              marginTop: 12,
            }}
          >
            Boutiques em Lisboa e V. N. de Gaia · st-dupont-online-store.vercel.app
          </span>
        </div>
      </OgCanvas>
    ),
    { ...OG_SIZE }
  );
}
