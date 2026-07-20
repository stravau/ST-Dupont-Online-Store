import type { MetadataRoute } from "next";

const SITE = "https://st-dupont-online-store.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Keep the admin panel out of search results, and block parameterised
        // catalogue duplicates. /api stays open for OG image fetching by social
        // cards.
        disallow: ["/admin", "/admin/", "/*?*sort=", "/*?*page=", "/*?*priceMin=", "/*?*priceMax=", "/*?*all="],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
