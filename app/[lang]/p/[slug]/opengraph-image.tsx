import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { OG_SIZE, OG_CONTENT_TYPE, OG_TOKENS, OgCanvas, BrandLockup } from "@/lib/og/shared";
import { getProduct, formatPrice } from "@/lib/catalog";
import { isLocale, defaultLocale, type Locale } from "@/lib/i18n";

// Product-specific OG card. Reads the product hero from
// /public and renders name + starting price on top of the shared
// canvas. Runtime=nodejs so readFile is available (edge runtime
// can't touch the filesystem).

export const runtime = "nodejs";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "S.T. Dupont product";

async function loadImageDataUrl(publicPath: string): Promise<string | null> {
  try {
    // publicPath = "/products/foo/bar.webp" — strip leading slash and read
    const rel = publicPath.replace(/^\/+/, "");
    const file = path.join(process.cwd(), "public", rel);
    const bytes = await readFile(file);
    const ext = rel.split(".").pop()?.toLowerCase() ?? "png";
    const mime = ext === "jpg" || ext === "jpeg" ? "image/jpeg" : ext === "webp" ? "image/webp" : "image/png";
    return `data:${mime};base64,${bytes.toString("base64")}`;
  } catch {
    return null;
  }
}

export default async function PdpOpengraphImage({
  params,
}: {
  params: { lang: string; slug: string };
}) {
  const lang: Locale = isLocale(params.lang) ? (params.lang as Locale) : defaultLocale;
  const product = await getProduct(params.slug);
  if (!product || product.variants.length === 0) {
    // Fall back to the site default card — return an empty ImageResponse
    // rather than throwing, so unavailable products don't 500 crawlers.
    return new ImageResponse(
      (
        <OgCanvas>
          <BrandLockup tagline={lang === "pt" ? "Maison de luxe française" : "French luxury Maison"} />
        </OgCanvas>
      ),
      { ...OG_SIZE }
    );
  }

  const cheapest = [...product.variants].sort((a, b) => a.priceCents - b.priceCents)[0];
  const heroPath = cheapest.image ?? product.image ?? cheapest.images?.[0] ?? null;
  const dataUrl = heroPath ? await loadImageDataUrl(heroPath) : null;

  const priceLabel = formatPrice(cheapest.priceCents, cheapest.currency, lang);
  const fromLabel = lang === "pt" ? "Desde" : "From";
  const tagline = lang === "pt" ? "Maison de luxe française" : "French luxury Maison";
  const cta = lang === "pt" ? "Ver na boutique" : "See in boutique";

  return new ImageResponse(
    (
      <OgCanvas>
        <BrandLockup tagline={tagline} />

        {/* Hero — right side */}
        {dataUrl && (
          <div
            style={{
              position: "absolute",
              right: 100,
              top: 90,
              bottom: 90,
              width: 460,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* satori supports <img> with data: URLs */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={dataUrl}
              alt=""
              width={440}
              height={440}
              style={{ objectFit: "contain" }}
            />
          </div>
        )}

        {/* Title + price — left side, bottom */}
        <div
          style={{
            position: "absolute",
            left: 72,
            bottom: 90,
            right: dataUrl ? 620 : 100,
            display: "flex",
            flexDirection: "column",
            gap: 18,
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
            {product.collection || (lang === "pt" ? "Coleção" : "Collection")}
          </span>
          <span
            style={{
              fontFamily: "serif",
              fontSize: 62,
              lineHeight: 1.05,
              color: OG_TOKENS.cream,
            }}
          >
            {product.name[lang]}
          </span>
          <span
            style={{
              fontSize: 24,
              letterSpacing: 1,
              color: OG_TOKENS.cream,
              opacity: 0.85,
            }}
          >
            {fromLabel} {priceLabel}
          </span>
          <span
            style={{
              fontSize: 14,
              letterSpacing: 3,
              color: OG_TOKENS.gold,
              textTransform: "uppercase",
              marginTop: 8,
            }}
          >
            {cta} →
          </span>
        </div>
      </OgCanvas>
    ),
    { ...OG_SIZE }
  );
}
