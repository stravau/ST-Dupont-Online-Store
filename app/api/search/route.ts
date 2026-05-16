import { NextRequest, NextResponse } from "next/server";
import { searchProducts, fromPrice, formatPrice } from "@/lib/catalog";
import { isLocale, defaultLocale, type Locale } from "@/lib/i18n";

// Instant-suggestion endpoint for the header search. Returns a small,
// locale-resolved slice of the full-catalogue search.
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const langParam = req.nextUrl.searchParams.get("lang") ?? "";
  const lang: Locale = isLocale(langParam) ? langParam : defaultLocale;

  if (q.length < 2) return NextResponse.json({ results: [] });

  const found = await searchProducts(q);
  const results = found.slice(0, 6).map((p) => {
    const base = fromPrice(p);
    return {
      slug: p.slug,
      name: p.name[lang],
      collection: p.collection,
      image: p.image,
      price: formatPrice(base.priceCents, base.currency, lang),
    };
  });

  return NextResponse.json({ results, total: found.length });
}
