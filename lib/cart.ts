// Server-side read helpers for cart, wishlist and orders.
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import type { Locale } from "@/lib/i18n";

export async function currentUserId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.email) return null;
  const u = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  return u?.id ?? null;
}

const loc = (j: unknown, l: Locale) => (j as Record<Locale, string>)[l];

export interface CartLine {
  itemId: string;
  productSlug: string;
  productName: string;
  variantName: string;
  sku: string;
  unitCents: number;
  currency: string;
  quantity: number;
  lineCents: number;
  image: string | null;
}

export async function getCart(userId: string, lang: Locale) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        orderBy: { createdAt: "asc" },
        include: { variant: { include: { product: true } } },
      },
    },
  });

  const lines: CartLine[] = (cart?.items ?? []).map((it) => ({
    itemId: it.id,
    productSlug: it.variant.product.slug,
    productName: loc(it.variant.product.name, lang),
    variantName: loc(it.variant.name, lang),
    sku: it.variant.sku,
    unitCents: it.variant.priceCents,
    currency: it.variant.currency,
    quantity: it.quantity,
    lineCents: it.variant.priceCents * it.quantity,
    // Use the chosen colourway's photo when present; fall back to the
    // product's hero image so older lines without a per-variant shot still
    // render something.
    image: it.variant.images?.[0] ?? it.variant.product.image,
  }));

  const subtotalCents = lines.reduce((s, l) => s + l.lineCents, 0);
  const count = lines.reduce((s, l) => s + l.quantity, 0);
  return { lines, subtotalCents, count, currency: lines[0]?.currency ?? "EUR" };
}

export async function getCartCount(userId: string): Promise<number> {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    select: { items: { select: { quantity: true } } },
  });
  return (cart?.items ?? []).reduce((s, i) => s + i.quantity, 0);
}

export async function getWishlistProductIds(userId: string): Promise<Set<string>> {
  const rows = await prisma.wishlistItem.findMany({
    where: { userId },
    select: { productId: true },
  });
  return new Set(rows.map((r) => r.productId));
}

// Convenience for listing pages: wishlist ids for the signed-in user, or an
// empty set for guests. One query, safe to call anywhere.
export async function myWishlistIds(): Promise<Set<string>> {
  const userId = await currentUserId();
  if (!userId) return new Set();
  return getWishlistProductIds(userId);
}

export async function getWishlistProducts(userId: string, lang: Locale) {
  const rows = await prisma.wishlistItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { product: { include: { variants: { orderBy: { priceCents: "asc" } } } } },
  });
  return rows.map((r) => ({
    id: r.product.id,
    slug: r.product.slug,
    name: loc(r.product.name, lang),
    collection: r.product.collection,
    image: r.product.image,
    fromCents: r.product.variants[0]?.priceCents ?? 0,
    currency: r.product.variants[0]?.currency ?? "EUR",
  }));
}

export async function getOrders(userId: string) {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });
  return orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    createdAt: o.createdAt,
    currency: o.currency,
    totalCents: o.totalCents,
    items: o.items.map((i) => ({
      name: i.nameSnapshot,
      sku: i.skuSnapshot,
      quantity: i.quantity,
      priceCents: i.priceCents,
    })),
  }));
}
