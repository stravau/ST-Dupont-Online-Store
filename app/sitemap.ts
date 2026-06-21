import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { locales } from "@/lib/i18n";
import { localeCategorySlug } from "@/lib/category-slugs";

const SITE = "https://st-dupont-online-store.vercel.app";
const CANONICAL_CATEGORIES = ["isqueiros", "escrita", "pele", "acessorios"] as const;
const STATIC_PATHS = ["", "/historia", "/loja", "/colecao", "/pesquisa"] as const;
const LEGAL_PATHS = ["/legal/privacidade", "/legal/termos", "/legal/devolucoes"] as const;

// Emit every public URL the Maison wants Google to crawl, per locale,
// with hreflang alternates pointing at the sibling locale. Filtered /
// paginated URLs are intentionally excluded — those live in robots.ts
// as disallow rules to avoid duplicate-content dilution.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const items: MetadataRoute.Sitemap = [];

  // Static pages — one entry per locale, with hreflang siblings.
  for (const path of [...STATIC_PATHS, ...LEGAL_PATHS]) {
    for (const lang of locales) {
      items.push({
        url: `${SITE}/${lang}${path}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: path === "" ? 1.0 : 0.5,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${SITE}/${l}${path}`]),
          ),
        },
      });
    }
  }

  // Categories — emit the locale-aware slug (/en/c/lighters, /pt/c/isqueiros).
  for (const canonical of CANONICAL_CATEGORIES) {
    for (const lang of locales) {
      const slug = localeCategorySlug(lang, canonical);
      items.push({
        url: `${SITE}/${lang}/c/${slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${SITE}/${l}/c/${localeCategorySlug(l, canonical)}`]),
          ),
        },
      });
    }
  }

  // Product detail pages. Failure to read the DB at build / request
  // time must not break the sitemap response — fall back to the static
  // entries above so crawlers still get something useful.
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      select: { slug: true, updatedAt: true },
    });
    for (const p of products) {
      for (const lang of locales) {
        items.push({
          url: `${SITE}/${lang}/p/${p.slug}`,
          lastModified: p.updatedAt ?? now,
          changeFrequency: "monthly",
          priority: 0.7,
          alternates: {
            languages: Object.fromEntries(
              locales.map((l) => [l, `${SITE}/${l}/p/${p.slug}`]),
            ),
          },
        });
      }
    }
  } catch {
    // DB unreachable — return what we have instead of a 500.
  }

  return items;
}
