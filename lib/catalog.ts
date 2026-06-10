// Catalog data access — Prisma-backed (PostgreSQL).
//
// Returns the same Localized shapes the UI already consumes, so components
// did not need restructuring. Localized text is stored as JSON: { pt, en }.
// Prices are integer cents. Seed source: prisma/seed.ts.
import type { Locale } from "@/lib/i18n";
import type { SortKey } from "@/lib/sort";
import { prisma } from "@/lib/prisma";
import { collectionRank } from "@/lib/collection-order";

export type Localized = Record<Locale, string>;
export type CategorySlug = "isqueiros" | "escrita" | "pele" | "acessorios";

export interface VariantColor {
  label: Localized;
  hex: string[]; // 1 hex = solid swatch, 2 = two-tone colourway
}

export interface VariantAttributes {
  type?: Localized; // pen type (writing) — text chip
  finish?: Localized; // metal/lacquer finish — text chip
  color?: VariantColor; // colour — swatch circle
  size?: Localized; // size option (e.g. Line D: Medium/Large/XL) — text chip
}

export interface Variant {
  sku: string;
  name: Localized;
  priceCents: number;
  currency: "EUR";
  attributes: VariantAttributes;
  image: string | null; // primary (front) photo, if supplied
  images: string[]; // full ordered gallery: [front, back, close-up, close-up 2]
}

export interface Product {
  id: string;
  slug: string;
  name: Localized;
  description: Localized;
  history: Localized | null;
  collection: string;
  categorySlug: CategorySlug;
  image: string | null;
  novelty: boolean;
  variants: Variant[];
}

export interface Category {
  slug: CategorySlug;
  name: Localized;
  tagline: Localized;
  history: Localized | null;
}

// Expand a product into one card descriptor per colourway. Catalogue grids
// render a tile per (product, colourway) instead of a single tile with
// swatches — the swatch UI is reserved for the product detail page.
// Drops variants/products with no usable photo and dedups by colour label
// so two SKUs of the same colourway don't render as identical tiles.
export function expandProductCards(p: Product): { product: Product; sku: string }[] {
  const out: { product: Product; sku: string }[] = [];
  const seen = new Set<string>();
  for (const v of p.variants) {
    const hasImage = !!(v.image || v.images.length || p.image);
    if (!hasImage) continue;
    const key = (v.attributes.color?.label.en ?? v.sku).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ product: p, sku: v.sku });
  }
  return out;
}

const loc = (j: unknown): Localized => j as Localized;

type VariantRow = {
  sku: string;
  name: unknown;
  priceCents: number;
  currency: string;
  attributes: unknown;
  images: string[];
};
type ProductRow = {
  id: string;
  slug: string;
  name: unknown;
  description: unknown;
  history: unknown;
  collection: string;
  image: string | null;
  featured: boolean;
  category: { slug: string };
  variants: VariantRow[];
};

// Runtime corrections for products whose stored categorySlug is wrong (pens
// sitting under "acessorios", cigar cutters under "isqueiros", a Line D pen
// under "pele", etc.). Applied in mapProduct so every read goes through the
// right category — no reseed required. The same fixes are mirrored into
// seed-data.ts so a future reseed preserves them.
const CATEGORY_OVERRIDES: Record<string, CategorySlug> = {
  // accidentally in isqueiros — cigar cutters belong with the smoking accessories
  "cigar-cutter": "acessorios",
  "cigar-cutter-monogram-1872": "acessorios",
  // accidentally in acessorios — these are full lighters / writing instruments
  "ligne-2-3": "isqueiros",
  "ligne-2-5": "isqueiros",
  "ligne-2-6": "isqueiros",
  "maxijet-2": "isqueiros",
  "haute-creation": "isqueiros", // Haute Création is a high-end lighter line
  "line-d": "escrita",
  "line-d-2": "escrita",
  "eternity-2": "escrita",
  "eternity-dragon": "escrita",
  "d-initial-dragon": "escrita",
  "initial-3": "escrita",
  // Mis-named by the catalogue scrape — slug says cutter, name says pen
  "cutter-420024l": "escrita", // "Fountain Pen Large"
  "cutter-422024l": "escrita", // "Rollerball Pen Large"
  // belongs to its real métier
  "apex-2": "pele",
  "firehead-3": "pele",
  "line-d-3": "escrita",
};

function mapProduct(p: ProductRow): Product {
  const storedCategory = p.category.slug as CategorySlug;
  const categorySlug = CATEGORY_OVERRIDES[p.slug] ?? storedCategory;
  return {
    id: p.id,
    slug: p.slug,
    name: loc(p.name),
    description: loc(p.description),
    history: p.history ? loc(p.history) : null,
    collection: p.collection,
    categorySlug,
    image: p.image,
    novelty: p.featured,
    variants: p.variants.map((v) => ({
      sku: v.sku,
      name: loc(v.name),
      priceCents: v.priceCents,
      currency: v.currency as "EUR",
      attributes: (v.attributes ?? {}) as VariantAttributes,
      image: v.images?.[0] ?? null,
      images: v.images ?? [],
    })),
  };
}

const productInclude = {
  category: { select: { slug: true } },
  variants: { orderBy: { priceCents: "asc" as const } },
};

export async function getCategories(): Promise<Category[]> {
  const rows = await prisma.category.findMany({ orderBy: { createdAt: "asc" } });
  return rows.map((c) => ({
    slug: c.slug as CategorySlug,
    name: loc(c.name),
    tagline: loc(c.tagline),
    history: c.history ? loc(c.history) : null,
  }));
}

export async function getCategory(slug: string): Promise<Category | undefined> {
  const c = await prisma.category.findUnique({ where: { slug } });
  return c
    ? {
        slug: c.slug as CategorySlug,
        name: loc(c.name),
        tagline: loc(c.tagline),
        history: c.history ? loc(c.history) : null,
      }
    : undefined;
}

// Many "themes" (Géode, Popote, Maki-e, Orlinski, Monogram 1872, DC Comics,
// Horse Mane, etc.) span multiple model lines on the official site, but our
// catalogue stores them with the LINE name as `collection` (e.g. ligne-2-geode
// has collection "Ligne 2"). The theme only lives in the slug. So when the
// navbar filters by `?col=Géode`, strict-equality on `collection` returns 0.
//
// This map gives those theme labels a slug-substring fallback so the query
// catches every product whose slug contains the theme — exactly what the
// navbar intends. Keys are the labels the navbar uses (matching what we pass
// in the URL); values are a lowercase, hyphenated slug fragment.
const COLLECTION_SLUG_PATTERNS: Record<string, string> = {
  "Géode": "geode",
  "Popote": "popote",
  "Maki-e": "maki-e",
  "Orlinski": "orlinski",
  "Monogram 1872": "monogram",
  "Horse Mane": "horse-mane",
  "DC Comics": "dc-comics",
  "Snake Skin": "snake-skin",
  "Fire X": "fire-x",
  "Camo": "camo",
  "Dragon": "dragon",
  "Fender": "fender",
  "Fuente": "fuente",
  "Cohiba-Behike": "cohiba-behike",
  "Cohiba": "cohiba",
  "Diamond head": "diamond-head",
  "Diamond Head": "diamond-head",
  "Casino": "casino",
  "Behike": "behike",
  "Padron": "padron",
  "Padrón": "padron",
  "Snake": "snake-skin",
  "Horse": "horse-mane",
  "Joker": "joker",
  "Cohiba 60th": "cohiba",
  "Marker Necklace": "marker-necklace",
  "Lighter Necklace": "lighter-necklace",
  "Romeo-y-Julieta": "romeo-y-julieta",
  "Montecristo": "montecristo",
  "20,000 Leagues Under The Sea": "20000",
  "Harley Quinn": "harley-quinn",
  "Stones of Fortune": "stones-of-fortune",
  "Haute Création": "haute-creation",
  "Cohiba 60th Anniversary": "cohiba",
};

// Slugs whose runtime override moves them INTO the given category. We widen
// the Prisma where-clause to include them (otherwise a Ligne 2 lighter that's
// stored as "acessorios" never surfaces on the lighters page) and then filter
// by effective category after mapProduct applies the override.
function widenedCategoryWhere(slug: string, collection?: string) {
  const movedInto = Object.entries(CATEGORY_OVERRIDES)
    .filter(([, c]) => c === slug)
    .map(([s]) => s);
  // When a collection filter is set AND has a known slug pattern, accept
  // EITHER literal collection match OR slug-contains. Otherwise stick with
  // strict equality (so Ligne 2 doesn't accidentally pick up unrelated
  // ligne-2-monogram if "Monogram 1872" wasn't asked for).
  const collectionPattern = collection
    ? COLLECTION_SLUG_PATTERNS[collection]
    : undefined;
  const collectionFilter = collection
    ? collectionPattern
      ? { OR: [{ collection }, { slug: { contains: collectionPattern } }] }
      : { collection }
    : {};
  return {
    active: true,
    OR: [
      { category: { slug }, ...collectionFilter },
      { slug: { in: movedInto }, ...collectionFilter },
    ],
  };
}

export async function getProductsByCategory(
  slug: string,
  collection?: string,
): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: widenedCategoryWhere(slug, collection),
    include: productInclude,
    orderBy: { createdAt: "asc" },
  });
  return rows.map(mapProduct).filter((p) => p.categorySlug === slug);
}

export async function getCollections(categorySlug: string): Promise<string[]> {
  // Derive from the effective category so overridden products contribute their
  // collection too (and incorrectly-stored ones drop out).
  const products = await getProductsByCategory(categorySlug);
  const seen = new Set(products.map((p) => p.collection).filter((c) => c.length > 0));
  // Mirror the catalogue grid order (and the editorial intent) — themed
  // sub-lines first, then base lines in the user-specified sequence.
  return [...seen].sort(
    (a, b) => collectionRank(a) - collectionRank(b) || a.localeCompare(b),
  );
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  const p = await prisma.product.findUnique({ where: { slug }, include: productInclude });
  return p ? mapProduct(p) : undefined;
}

export async function getNovelties(limit = 6): Promise<Product[]> {
  // "New Releases by the Maison" — bias toward exclusive, higher-end
  // lighters so the home grid leads with the maison's signature pieces
  // (Maki-e, Architecture, Fuente, Orlinski, Le Grand Dupont, …) rather
  // than entry-level SKUs. Pulls a slightly wider pool, sorts each
  // product by its priciest variant, takes the top `limit`. Reuses
  // widenedCategoryWhere so overridden products (cigar cutters move out,
  // mis-stored Ligne 2s move in) land in the right pool.
  const rows = await prisma.product.findMany({
    where: widenedCategoryWhere("isqueiros"),
    include: productInclude,
    take: limit * 4,
  });
  const items = rows
    .map(mapProduct)
    .filter((p) => p.categorySlug === "isqueiros");
  const ceiling = (p: Product) =>
    p.variants.reduce((m, v) => Math.max(m, v.priceCents), 0);
  items.sort((a, b) => ceiling(b) - ceiling(a));
  return items.slice(0, limit);
}

function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

// Levenshtein edit distance with early exit when the bound is exceeded.
// Used for typo-tolerant matching — see `termMatches`.
function lev(a: string, b: string, max: number): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    const cur = new Array<number>(n + 1);
    cur[0] = i;
    let rowMin = cur[0];
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (cur[j] < rowMin) rowMin = cur[j];
    }
    if (rowMin > max) return max + 1; // every alignment past this row is too far
    prev = cur;
  }
  return prev[n];
}

// Direct substring is the first chance to match — covers "ligne", "fuente",
// SKUs, etc. If it misses, treat the term as a possible typo and accept it if
// any word in the blob is within a small edit distance (1 for short terms, 2
// for longer ones). Very short terms (≤3) only match exactly to avoid noise.
function termMatches(term: string, blob: string, words: string[]): boolean {
  if (blob.includes(term)) return true;
  const limit = term.length <= 3 ? 0 : term.length <= 6 ? 1 : 2;
  if (limit === 0) return false;
  for (const w of words) {
    if (Math.abs(w.length - term.length) > limit) continue;
    if (lev(term, w, limit) <= limit) return true;
  }
  return false;
}

// Full-catalogue search. Each term must match (AND) somewhere across product
// name (PT/EN), description, collection, category slug + name, variant
// finish/SKU. Substring first; falls back to a small edit-distance check so
// "dupnt" still finds "dupont". Catalogue is small enough that in-memory
// filtering is exact and fast.
export async function searchProducts(query: string): Promise<Product[]> {
  const q = normalize(query);
  if (!q) return [];
  const terms = q.split(/\s+/).filter(Boolean);

  const [rows, cats] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      include: productInclude,
      orderBy: { createdAt: "asc" },
    }),
    prisma.category.findMany({ select: { slug: true, name: true } }),
  ]);
  const catName = new Map(cats.map((c) => [c.slug, c.name as Record<string, string>]));

  return rows.map(mapProduct).filter((p) => {
    const cn = catName.get(p.categorySlug);
    const blob = normalize(
      [
        p.name.pt,
        p.name.en,
        p.description.pt,
        p.description.en,
        p.collection,
        p.categorySlug,
        cn?.pt,
        cn?.en,
        ...p.variants.flatMap((v) => [v.name.pt, v.name.en, v.sku]),
      ]
        .filter(Boolean)
        .join(" "),
    );
    const words = blob.split(/\s+/).filter(Boolean);
    return terms.every((t) => termMatches(t, blob, words));
  });
}

// --- pure helpers (no DB) ---

export type Gender = "men" | "women" | "unisex";

// Heuristic gender tag for leather goods. The Maison's catalogue doesn't carry
// an explicit gender field, so we infer from the collection (Victoria / Riviera
// are women's lines; Défi Explorer is a men's business line) and from telltale
// item types (cabas / crossbody / camera bag skew women; briefcase / document
// holder skew men). Anything else is treated as unisex. Used by /c/pele filter.
export function inferGender(p: Product): Gender {
  const s = p.slug.toLowerCase();
  const c = p.collection.toLowerCase();
  if (/victoria|riviera/.test(c)) return "women";
  if (/cabas|crossbody|camera-bag|compact-crossbody|x-bag|x-2$/.test(s)) return "women";
  if (/explorer/.test(c)) return "men";
  if (/briefcase|document-holder|weekend-bag|travel-bag/.test(s)) return "men";
  return "unisex";
}

// Pen "usage" — drives the writing category's filter chip row. Matched against
// variant.attributes.type, which is a Localized label populated by the seed's
// TYPE preset (BP=Ballpoint / RB=Rollerball / FP=Fountain Pen). EN check only
// because the seed always sets a clean English value even on PT-only stores.
export type Usage = "ballpoint" | "rollerball" | "fountain";

export function isUsage(value: unknown): value is Usage {
  return value === "ballpoint" || value === "rollerball" || value === "fountain";
}

export function hasUsage(p: Product, usage: Usage): boolean {
  const re =
    usage === "ballpoint" ? /^ballpoint/i : usage === "rollerball" ? /^rollerball/i : /^fountain/i;
  return p.variants.some((v) => !!v.attributes.type && re.test(v.attributes.type.en));
}

export function fromPrice(product: Product): Variant {
  return product.variants.reduce(
    (min, cur) => (cur.priceCents < min.priceCents ? cur : min),
    product.variants[0],
  );
}

// Common sales-page sorting. Catalogue queries return oldest→newest
// (createdAt asc), so reversing yields most-recent first.
export function sortProducts(
  items: Product[],
  sort: SortKey,
  locale: Locale,
): Product[] {
  const arr = [...items];
  switch (sort) {
    case "price-asc":
      return arr.sort((a, b) => fromPrice(a).priceCents - fromPrice(b).priceCents);
    case "price-desc":
      return arr.sort((a, b) => fromPrice(b).priceCents - fromPrice(a).priceCents);
    case "newest":
      return arr.reverse();
    case "name":
      return arr.sort((a, b) => a.name[locale].localeCompare(b.name[locale]));
    case "featured":
    default:
      // The default order is the editorial catalogue order: themed
      // sub-collections first (Géode/Popote/Maki-e/…), then base lines in
      // the explicit COLLECTION_ORDER sequence. Novelty pieces only float
      // *within* their own collection — they no longer jump the entire
      // grid to the top, which would scramble the section ordering.
      return arr.sort(
        (a, b) =>
          collectionRank(a.collection) - collectionRank(b.collection) ||
          Number(b.novelty) - Number(a.novelty),
      );
  }
}

export function formatPrice(cents: number, currency: string, locale: Locale): string {
  return new Intl.NumberFormat(locale === "pt" ? "pt-PT" : "en-IE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
