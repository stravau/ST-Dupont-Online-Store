import { ImageResponse } from "next/og";
import { OG_SIZE, OG_CONTENT_TYPE, OG_TOKENS, OgCanvas, BrandLockup } from "@/lib/og/shared";
import { getCategory } from "@/lib/catalog";
import { resolveCategorySlug } from "@/lib/category-slugs";
import { isLocale, defaultLocale, type Locale } from "@/lib/i18n";

// Category-page OG card. Names the maison + shows the tagline.
// Runtime=nodejs so we can hit the same Prisma path as the page.

export const runtime = "nodejs";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "S.T. Dupont category";

export default async function CategoryOpengraphImage({
  params,
}: {
  params: { lang: string; category: string };
}) {
  const lang: Locale = isLocale(params.lang) ? (params.lang as Locale) : defaultLocale;
  const canonical = resolveCategorySlug(params.category);
  const cat = await getCategory(canonical);
  const tagline = lang === "pt" ? "Maison de luxe française" : "French luxury Maison";
  const eyebrow = lang === "pt" ? "Coleção" : "Collection";

  return new ImageResponse(
    (
      <OgCanvas>
        <BrandLockup tagline={tagline} />
        <div
          style={{
            marginTop: "auto",
            marginBottom: 100,
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
            {eyebrow}
          </span>
          <span
            style={{
              fontFamily: "serif",
              fontSize: 96,
              lineHeight: 1.05,
              color: OG_TOKENS.cream,
            }}
          >
            {cat?.name[lang] ?? params.category}
          </span>
          {cat?.tagline?.[lang] && (
            <span
              style={{
                fontSize: 26,
                lineHeight: 1.35,
                color: OG_TOKENS.cream,
                opacity: 0.8,
                marginTop: 8,
                maxWidth: 900,
              }}
            >
              {cat.tagline[lang]}
            </span>
          )}
        </div>
      </OgCanvas>
    ),
    { ...OG_SIZE }
  );
}
