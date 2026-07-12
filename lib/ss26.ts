// S.T. Dupont Spring / Summer Selection 26 (SS26) — 111-SKU catalogue
// pulled from the paginated Shopify products.json at
// https://www.st-dupont.com/collections/spring-animation/products.json
// (2026-07-12 crawl). Order mirrors the Maison's manual sort exactly.
//
// Cross-referenced against our own seed-data.ts: 109 of 111 SKUs are
// present. Two gaps (045078N — Slimmy Fender variant not seeded;
// 003472 — LGD Padron variant we never scraped) are silently skipped
// by the page loader; the grid tightens on those slots.
//
// Historical note: an earlier version of this file listed 45 SKUs
// with a "50-piece curated" description. That was based on the
// first HTML page render only; the products.json paginated crawl
// captures the full 111-piece line-up. The five SKUs the earlier
// note flagged as missing (C14020, C14021, C14120, C23780CL,
// C23790CL) are actually all in the catalogue and included below.

export interface Ss26LifestyleImage {
  /** Local /public asset — served by next/image. */
  src: string;
  /** Position in SS26_SKUS AFTER which the banner slots into the
      grid. 0 = the hero pairing that sits above the tail grid; the
      other five interleave inside the tail grid at these anchors. */
  insertAfterSkuIndex: number;
  /** Aspect-ratio hint so the layout can reserve the right slot. */
  aspect: "4/5" | "9/16";
  /** Alt text for a11y. */
  alt: string;
}

// Editorial banners captured verbatim from st-dupont.com's Nosto
// window.Lobst.visual_merchandising array. The hero is the collection
// image; the other five inject at every ~8th tile down the page.
export const SS26_LIFESTYLE: readonly Ss26LifestyleImage[] = [
  { src: "/ss26/hero.jpg",   insertAfterSkuIndex: 0,  aspect: "4/5",  alt: "S.T. Dupont Ligne 2 · Spring Summer 26" },
  { src: "/ss26/shot-16.jpg", insertAfterSkuIndex: 8,  aspect: "9/16", alt: "S.T. Dupont Spring Summer 26 · shot 16" },
  { src: "/ss26/shot-10.jpg", insertAfterSkuIndex: 16, aspect: "9/16", alt: "S.T. Dupont Spring Summer 26 · shot 10" },
  { src: "/ss26/shot-19.jpg", insertAfterSkuIndex: 24, aspect: "9/16", alt: "S.T. Dupont Spring Summer 26 · shot 19" },
  { src: "/ss26/shot-03.jpg", insertAfterSkuIndex: 32, aspect: "9/16", alt: "S.T. Dupont Spring Summer 26 · shot 03" },
  { src: "/ss26/shot-20.jpg", insertAfterSkuIndex: 40, aspect: "9/16", alt: "S.T. Dupont Spring Summer 26 · shot 20" },
] as const;

export const SS26_SKUS = [
  "C16150", "420150XL", "C23472CL", "C23017CL", "C23018CL", "016472N",
  "C16017CL", "C23016CL", "C16018CL", "C16060", "1XM292DO1", "1XM282DO1",
  "420317L", "C16016CL", "420318L", "C23013", "C16061CL", "420316M",
  "C23790CL", "C23180", "C23010", "422317L", "422318L", "C16036CL",
  "C23780CL", "422316M", "C16035CL", "422052L", "C14050CL", "422051L",
  "420015L", "C14120", "C14020", "C14021", "1VI333RD1", "1VI333BK1",
  "1VI333BE1", "425015L", "045318N", "422014M", "425014M", "422220M",
  "422016M", "T20100", "T20101", "183442", "183441", "006726",
  "006727", "006725", "425220M", "425016M", "029002", "029001",
  "025063", "025064", "045078N", "006452", "006451", "025210",
  "025053", "025277", "405053", "025222", "025221", "028063",
  "028064", "030036", "028036", "030035", "028035", "028119",
  "275064", "275063", "700008", "700005", "W21324", "W21325",
  "030053", "028053", "270202", "028225", "028222", "028030",
  "270201", "272036", "272035", "272216", "272217", "272202",
  "003472", "027036", "027035", "003442", "275036", "275035",
  "275217", "275202", "275205", "275201", "275200", "003480",
  "010836", "010835", "007158", "007157", "160028S", "160016C",
  "160023C", "160014C", "160025B",
] as const;
