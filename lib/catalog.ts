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

function mapProduct(p: ProductRow): Product {
  return {
    id: p.id,
    slug: p.slug,
    name: loc(p.name),
    description: loc(p.description),
    history: p.history ? loc(p.history) : null,
    collection: p.collection,
    categorySlug: p.category.slug as CategorySlug,
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

export async function getProductsByCategory(
  slug: string,
  collection?: string,
): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { active: true, category: { slug }, ...(collection ? { collection } : {}) },
    include: productInclude,
    orderBy: { createdAt: "asc" },
  });
  return rows.map(mapProduct);
}

export async function getCollections(categorySlug: string): Promise<string[]> {
  const rows = await prisma.product.findMany({
    where: { active: true, category: { slug: categorySlug } },
    select: { collection: true },
    distinct: ["collection"],
  });
  // Mirror the catalogue grid order (and the editorial intent) — themed
  // sub-lines first, then base lines in the user-specified sequence.
  return rows
    .map((r) => r.collection)
    .filter((c) => c.length > 0)
    .sort((a, b) => collectionRank(a) - collectionRank(b) || a.localeCompare(b));
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
  // product by its priciest variant, takes the top `limit`.
  const rows = await prisma.product.findMany({
    where: {
      active: true,
      category: { slug: "isqueiros" },
    },
    include: productInclude,
    take: limit * 4,
  });
  const items = rows.map(mapProduct);
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

// Full-catalogue search. Matches every term (AND) against product name (PT/EN),
// description, collection, category slug + name, and every variant finish/SKU.
// Catalogue is small, so in-memory filtering is exact and fast.
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
    return terms.every((t) => blob.includes(t));
  });
}

// --- pure helpers (no DB) ---

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
      return arr.sort((a, b) => Number(b.novelty) - Number(a.novelty));
  }
}

export function formatPrice(cents: number, currency: string, locale: Locale): string {
  return new Intl.NumberFormat(locale === "pt" ? "pt-PT" : "en-IE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
