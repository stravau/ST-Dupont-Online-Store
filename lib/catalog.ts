// Catalog data access — Prisma-backed (PostgreSQL).
//
// Returns the same Localized shapes the UI already consumes, so components
// did not need restructuring. Localized text is stored as JSON: { pt, en }.
// Prices are integer cents. Seed source: prisma/seed.ts.
import type { Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

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
}

export interface Variant {
  sku: string;
  name: Localized;
  priceCents: number;
  currency: "EUR";
  attributes: VariantAttributes;
  image: string | null; // per-colourway photo, if supplied
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
    orderBy: { collection: "asc" },
  });
  return rows.map((r) => r.collection);
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  const p = await prisma.product.findUnique({ where: { slug }, include: productInclude });
  return p ? mapProduct(p) : undefined;
}

export async function getNovelties(limit = 6): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { active: true, featured: true },
    include: productInclude,
    orderBy: { createdAt: "asc" },
    take: limit,
  });
  return rows.map(mapProduct);
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

export function formatPrice(cents: number, currency: string, locale: Locale): string {
  return new Intl.NumberFormat(locale === "pt" ? "pt-PT" : "en-IE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
