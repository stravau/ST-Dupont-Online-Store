import type { MetadataRoute } from "next";

const SITE = "https://st-dupont-online-store.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Block parameterised duplicates and the legal/admin surfaces.
        // /api stays open for OG image fetching by social cards.
        disallow: ["/*?*sort=", "/*?*page=", "/*?*priceMin=", "/*?*priceMax=", "/*?*all="],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
