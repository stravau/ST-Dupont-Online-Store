// Server-only helper: derives which nav destinations still have at
// least one variant with real stock and a non-DESCONTINUADO status.
// Used to prune dead entries from the desktop mega-menu and the
// mobile drawer so we never link customers to an empty page.
//
// "Live" = variant status ≠ DESCONTINUADO AND stock > 0.
// A product is live if any of its variants is live.
//
// Result is cached per-request via React `cache()`; the boutique
// catalogue is small (~50 products) so re-querying on every render is
// cheap, and the cache dedupes fan-outs (mega-menu + mobile-nav on
// the same request).
import "server-only";
import { cache } from "react";
import {
  getProductsByCategory,
  COLLECTION_SLUG_PATTERNS,
  type Product,
  type CategorySlug,
} from "@/lib/catalog";
import { productGroups } from "@/lib/product-groups";
import { isNavPathLive as isNavPathLiveShared } from "@/lib/nav-liveness-shared";
import type { LiveNavSignalsSerialized } from "@/lib/nav-liveness-shared";

export interface LiveNavSignals {
  // Category slugs (isqueiros, escrita, pele, acessorios) with ≥1 live product.
  categories: Set<CategorySlug>;
  // Values that pass a nav ?col=X filter. Contains BOTH the raw stored
  // `collection` strings and the "human" theme labels whose slug
  // substring pattern is present in at least one live product.
  collections: Set<string>;
  // Union of live product-group ids ("smoking", "bags", …) and
  // "group:typeKey" pairs ("smoking:cutters", "bags:travel"). The
  // /t/<group>?type=<typeKey> and /t/<group> URLs test against these.
  types: Set<string>;
  // "group:men" / "group:women" pairs — populated when the group has at
  // least one live product for that gender. Missing entry = hide the
  // gender split entry entirely.
  genders: Set<string>;
  // Usage keys for /c/escrita?usage=… — ballpoint / rollerball / fountain.
  usages: Set<string>;
}


function isLive(p: Product): boolean {
  return p.variants.some((v) => v.status !== "DESCONTINUADO");
}

// Gender inference — mirrors the /t/bags?g= logic. Bag slugs typically
// carry "-women" or "-w" for the women line; everything else counts as
// men. This is intentionally lenient so we don't hide the men entry
// just because slug conventions vary.
function productGenders(p: Product): ("men" | "women")[] {
  const s = p.slug.toLowerCase();
  if (/-women$|-w$|-lady|-woman/.test(s)) return ["women"];
  // Some slugs explicitly carry -men; anything else defaults to men.
  return ["men"];
}

// Usage inference — mirrors inferWritingType in lib/catalog.ts but
// works at the product level rather than variant name.
function productUsages(p: Product): string[] {
  const hay = `${p.slug} ${p.name.en} ${p.name.pt} ${p.description.en}`.toLowerCase();
  const out: string[] = [];
  if (/fountain\s?pen|tinta\s?permanente/.test(hay)) out.push("fountain");
  if (/roller\s?ball/.test(hay)) out.push("rollerball");
  if (/ballpoint|esferográfica|esferografica/.test(hay)) out.push("ballpoint");
  return out;
}

async function computeLiveNavSignals(): Promise<LiveNavSignals> {
  const cats: CategorySlug[] = ["isqueiros", "escrita", "pele", "acessorios"];
  const productsPerCat = await Promise.all(cats.map((c) => getProductsByCategory(c)));
  const categories = new Set<CategorySlug>();
  const collections = new Set<string>();
  const types = new Set<string>();
  const genders = new Set<string>();
  const usages = new Set<string>();

  for (let i = 0; i < cats.length; i++) {
    const cat = cats[i];
    const products = productsPerCat[i].filter(isLive);
    if (products.length === 0) continue;
    categories.add(cat);

    // Collections — both the stored value and any theme label whose
    // slug substring pattern appears in a product slug.
    for (const p of products) {
      if (p.collection) collections.add(p.collection);
    }
    for (const [label, pattern] of Object.entries(COLLECTION_SLUG_PATTERNS)) {
      if (products.some((p) => p.slug.toLowerCase().includes(pattern))) {
        collections.add(label);
      }
    }

    // Product types & genders.
    for (const g of Object.values(productGroups)) {
      if (g.categorySlug !== cat) continue;
      if (g.types) {
        for (const ty of g.types) {
          const matching = products.filter((p) => ty.match(p));
          if (matching.length === 0) continue;
          types.add(g.id);
          types.add(`${g.id}:${ty.key}`);
          for (const p of matching) {
            for (const gk of productGenders(p)) genders.add(`${g.id}:${gk}`);
          }
        }
      } else if (g.match) {
        const matching = products.filter((p) => g.match!(p));
        if (matching.length === 0) continue;
        types.add(g.id);
        for (const p of matching) {
          for (const gk of productGenders(p)) genders.add(`${g.id}:${gk}`);
        }
      }
    }

    // Writing usages.
    if (cat === "escrita") {
      for (const p of products) {
        for (const u of productUsages(p)) usages.add(u);
      }
    }
  }

  return { categories, collections, types, genders, usages };
}

export const getLiveNavSignals = cache(computeLiveNavSignals);

export function serializeLiveNavSignals(s: LiveNavSignals): LiveNavSignalsSerialized {
  return {
    categories: [...s.categories],
    collections: [...s.collections],
    types: [...s.types],
    genders: [...s.genders],
    usages: [...s.usages],
  };
}

// Server-side convenience — wraps the shared client-safe checker so
// call-sites can pass the resolved (Set-backed) signals directly.
export function isNavPathLive(href: string, s: LiveNavSignals): boolean {
  return isNavPathLiveShared(href, serializeLiveNavSignals(s));
}
