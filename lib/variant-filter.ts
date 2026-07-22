import type { Prisma } from "@/app/generated/prisma/client";

// The filter behind /admin/variants (Consultar Stock). Extracted so the page
// AND the bulk-apply endpoint build the exact same WHERE clause — "select all
// filtered" must target precisely the rows the admin is looking at.
export interface VariantFilterParams {
  q?: string;
  status?: string;
  stock?: string;
  ean?: string;
  promo?: string;
  unmapped?: string;
  published?: string;
}

export function buildVariantWhere(p: VariantFilterParams): Prisma.ProductVariantWhereInput {
  const where: Prisma.ProductVariantWhereInput = {};
  const q = (p.q ?? "").trim();
  if (q) {
    where.OR = [
      { sku: { contains: q, mode: "insensitive" } },
      { ean: { contains: q, mode: "insensitive" } },
    ];
  }
  if (p.status === "DISPONIVEL" || p.status === "INDISPONIVEL" || p.status === "DESCONTINUADO") {
    where.status = p.status;
  }
  if (p.stock === "zero") where.stock = { lte: 0 };
  else if (p.stock === "low") where.stock = { gt: 0, lte: 5 };
  else if (p.stock === "in") where.stock = { gt: 5 };
  if (p.ean === "missing") where.ean = null;
  else if (p.ean === "present") where.ean = { not: null };
  if (p.promo === "active") where.promoEndDate = { gte: new Date() };
  if (p.unmapped === "only") where.product = { slug: "unmapped-inventory" };
  else if (p.unmapped === "exclude") where.product = { slug: { not: "unmapped-inventory" } };

  // "Publicação" — would this variant appear in the store? Published = active +
  // real product mapping + not DESCONTINUADO. Composed via AND so it never
  // clobbers the status/product/OR clauses above.
  const publishedAnd: Prisma.ProductVariantWhereInput[] = [];
  if (p.published === "yes") {
    publishedAnd.push(
      { active: true },
      { NOT: { status: "DESCONTINUADO" } },
      { product: { slug: { not: "unmapped-inventory" } } },
    );
  } else if (p.published === "no") {
    publishedAnd.push({
      OR: [
        { active: false },
        { status: "DESCONTINUADO" },
        { product: { slug: "unmapped-inventory" } },
      ],
    });
  }
  if (publishedAnd.length) {
    const existing = where.AND ? (Array.isArray(where.AND) ? where.AND : [where.AND]) : [];
    where.AND = [...existing, ...publishedAnd];
  }
  return where;
}
