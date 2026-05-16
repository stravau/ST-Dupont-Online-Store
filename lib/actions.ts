"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

async function requireUserId(lang: string): Promise<string> {
  const session = await auth();
  if (!session?.user?.email) redirect(`/${lang}/entrar`);
  const u = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!u) redirect(`/${lang}/entrar`);
  return u.id;
}

async function getOrCreateCartId(userId: string): Promise<string> {
  const cart = await prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
    select: { id: true },
  });
  return cart.id;
}

export async function addToCart(lang: string, formData: FormData) {
  const userId = await requireUserId(lang);
  const sku = String(formData.get("sku") ?? "");
  const quantity = Math.max(1, Number(formData.get("quantity") ?? 1) || 1);

  const variant = await prisma.productVariant.findUnique({
    where: { sku },
    select: { id: true },
  });
  if (!variant) redirect(`/${lang}/carrinho`);

  const cartId = await getOrCreateCartId(userId);
  await prisma.cartItem.upsert({
    where: { cartId_variantId: { cartId, variantId: variant.id } },
    update: { quantity: { increment: quantity } },
    create: { cartId, variantId: variant.id, quantity },
  });

  revalidatePath(`/${lang}`, "layout");
  redirect(`/${lang}/carrinho`);
}

export async function updateCartItem(lang: string, formData: FormData) {
  const userId = await requireUserId(lang);
  const itemId = String(formData.get("itemId") ?? "");
  const quantity = Number(formData.get("quantity") ?? 1);

  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cart: { userId } },
    select: { id: true },
  });
  if (!item) redirect(`/${lang}/carrinho`);

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: itemId } });
  } else {
    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: Math.min(quantity, 99) },
    });
  }
  revalidatePath(`/${lang}`, "layout");
  redirect(`/${lang}/carrinho`);
}

export async function removeCartItem(lang: string, formData: FormData) {
  const userId = await requireUserId(lang);
  const itemId = String(formData.get("itemId") ?? "");
  await prisma.cartItem.deleteMany({ where: { id: itemId, cart: { userId } } });
  revalidatePath(`/${lang}`, "layout");
  redirect(`/${lang}/carrinho`);
}

export async function placeOrder(lang: string) {
  const userId = await requireUserId(lang);
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { variant: { include: { product: true } } } } },
  });
  if (!cart || cart.items.length === 0) redirect(`/${lang}/carrinho`);

  const subtotalCents = cart.items.reduce(
    (s, i) => s + i.variant.priceCents * i.quantity,
    0,
  );
  const orderNumber = `STD-${Date.now().toString(36).toUpperCase()}`;
  const currency = cart.items[0]?.variant.currency ?? "EUR";

  await prisma.$transaction([
    prisma.order.create({
      data: {
        orderNumber,
        userId,
        status: "PENDING", // awaiting payment — Stripe wired in Phase 4
        currency,
        subtotalCents,
        taxCents: 0,
        shippingCents: 0,
        totalCents: subtotalCents,
        items: {
          create: cart.items.map((i) => ({
            variantId: i.variantId,
            nameSnapshot: (i.variant.product.name as Record<string, string>)[lang] ?? i.variant.sku,
            skuSnapshot: i.variant.sku,
            priceCents: i.variant.priceCents,
            quantity: i.quantity,
          })),
        },
      },
    }),
    prisma.cartItem.deleteMany({ where: { cartId: cart.id } }),
  ]);

  revalidatePath(`/${lang}`, "layout");
  redirect(`/${lang}/conta/encomendas?placed=1`);
}

export async function addAddress(lang: string, formData: FormData) {
  const userId = await requireUserId(lang);
  const get = (k: string) => String(formData.get(k) ?? "").trim();
  const fullName = get("fullName");
  const line1 = get("line1");
  const city = get("city");
  const postalCode = get("postalCode");
  const country = get("country").toUpperCase().slice(0, 2);
  if (!fullName || !line1 || !city || !postalCode || country.length !== 2) {
    redirect(`/${lang}/conta/moradas?error=1`);
  }
  const count = await prisma.address.count({ where: { userId } });
  await prisma.address.create({
    data: {
      userId,
      fullName,
      line1,
      line2: get("line2") || null,
      city,
      postalCode,
      country,
      phone: get("phone") || null,
      isDefault: count === 0,
    },
  });
  redirect(`/${lang}/conta/moradas`);
}

export async function deleteAddress(lang: string, formData: FormData) {
  const userId = await requireUserId(lang);
  const id = String(formData.get("id") ?? "");
  await prisma.address.deleteMany({ where: { id, userId } });
  redirect(`/${lang}/conta/moradas`);
}

// Called directly from the client WishlistButton. Returns the new state.
export async function toggleWishlist(productId: string, lang: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.email) redirect(`/${lang}/entrar`);
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) redirect(`/${lang}/entrar`);

  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId: user.id, productId } },
  });
  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    return false;
  }
  await prisma.wishlistItem.create({ data: { userId: user.id, productId } });
  return true;
}
