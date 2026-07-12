// S.T. Dupont Spring / Summer Selection 26 (SS26) — 111 SKU replica
// of the Maison's own /collections/spring-animation page.
//
// Layout of the Maison page (verified via DOM inspection of the
// server-rendered HTML): NO editorial hero pairing above the grid,
// just a plain 4-tile row followed by lifestyle banners injected
// every ~8 tiles into the flow. Banners are 2×2 tiles inside the
// same 4-col grid, and they alternate LEFT / RIGHT visually
// (Nosto's rendered layout — the SSR class is always
// `grille-to-left`, but the actual placement swings sides).
//
// If a SKU isn't in our own catalogue, the page falls back to
// `SS26_SHOPIFY_FALLBACK` (below) so the tile still renders with
// the Maison's own product photo + name + price + a link out to
// their PDP. That way "no product gets left behind" regardless of
// where our seed happens to be relative to theirs.

export interface Ss26LifestyleImage {
  /** /public asset served by next/image. */
  src: string;
  /** Insert this banner AFTER the Nth product tile (1-indexed
      position in the rendered flow). Matches the ~every-8-tiles
      cadence Nosto uses. */
  insertAfterProductPosition: number;
  /** Which half of the 4-col grid the banner sits in. Alternates
      L/R exactly like the Maison. */
  side: "left" | "right";
  alt: string;
}

// Exactly 5 lifestyle banners — one per shot number in the Maison's
// window.Lobst.visual_merchandising array. SHOT_16 previously
// appeared twice (once as a 4/5-crop hero, once as its 9/16 tile);
// the 4/5 version is gone. Positions + sides mirror the Maison's
// rendered cadence: after every 8 tiles, alternating LEFT / RIGHT.
export const SS26_LIFESTYLE: readonly Ss26LifestyleImage[] = [
  { src: "/ss26/shot-16.jpg", insertAfterProductPosition: 4,  side: "left",  alt: "Ligne 2 lacquered lighter on beige towel · SS26" },
  { src: "/ss26/shot-10.jpg", insertAfterProductPosition: 12, side: "right", alt: "Line D Eternity rollerballs on shoulder · SS26" },
  { src: "/ss26/shot-19.jpg", insertAfterProductPosition: 20, side: "left",  alt: "Le Grand Dupont black lighter, blue flame poolside · SS26" },
  { src: "/ss26/shot-03.jpg", insertAfterProductPosition: 28, side: "right", alt: "Line D Eternity fountain pen close-up · SS26" },
  { src: "/ss26/shot-20.jpg", insertAfterProductPosition: 36, side: "left",  alt: "Classique pen and Ligne 1 gold lighter poolside · SS26" },
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

// Data-only shim for SKUs that aren't in prisma/seed-data.ts (or
// aren't upserted onto Neon yet). Page renders one of these as an
// "external tile" — same rectangle as a real card, image + name +
// price, click-through to st-dupont.com's PDP.
export interface Ss26ExternalTile {
  name: string;
  priceEur: number;
  /** Local /public path if we've mirrored the image, else Shopify
      CDN URL (allowed because /public served next/image via
      next.config remotePatterns is broad enough). */
  image: string;
  externalHref: string;
}

export const SS26_SHOPIFY_FALLBACK: Record<string, Ss26ExternalTile> = {
  "003472": {
    name: "Perfect cut · Cohiba",
    priceEur: 245,
    image: "/products/cigar-cutter-cohiba-003472/003472.webp",
    externalHref: "https://www.st-dupont.com/products/cigar-cutter-cohiba-003472",
  },
  "045078N": {
    name: "Classique · Yellow Gold",
    priceEur: 425,
    image: "/products/ballpoint-classique-golden-045078n/045078N.webp",
    externalHref: "https://www.st-dupont.com/products/ballpoint-pen-classique-golden-045078n",
  },
};
