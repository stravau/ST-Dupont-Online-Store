// Catalog data access — Prisma-backed (PostgreSQL).
//
// Returns the same Localized shapes the UI already consumes, so components
// did not need restructuring. Localized text is stored as JSON: { pt, en }.
// Prices are integer cents. Seed source: prisma/seed.ts.
import type { Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

export type Localized = Record<Locale, string>;
export type CategorySlug = "isqueiros" | "escrita" | "pele" | "acessorios";

export interface Variant {
  sku: string;
  name: Localized;
  priceCents: number;
  currency: "EUR";
}

export interface Product {
  id: string;
  slug: string;
  name: Localized;
  description: Localized;
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
}

const loc = (j: unknown): Localized => j as Localized;

type VariantRow = { sku: string; name: unknown; priceCents: number; currency: string };
type ProductRow = {
  id: string;
  slug: string;
  name: unknown;
  description: unknown;
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
    collection: p.collection,
    categorySlug: p.category.slug as CategorySlug,
    image: p.image,
    novelty: p.featured,
    variants: p.variants.map((v) => ({
      sku: v.sku,
      name: loc(v.name),
      priceCents: v.priceCents,
      currency: v.currency as "EUR",
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
  }));
}

export async function getCategory(slug: string): Promise<Category | undefined> {
  const c = await prisma.category.findUnique({ where: { slug } });
  return c ? { slug: c.slug as CategorySlug, name: loc(c.name), tagline: loc(c.tagline) } : undefined;
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
