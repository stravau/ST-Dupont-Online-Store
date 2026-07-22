import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { assertRateLimit } from "@/lib/admin-api";
import { isStaffRole } from "@/lib/pos";

export const dynamic = "force-dynamic";

// GET /api/admin/pos/scan?ean=<barcode>  (or ?sku=<ref>) [&boutique=VNG]
// Resolves a scanned barcode to a sellable line so the terminal can add it to a
// sale. Tries the Dupont catalogue first; when the code isn't ours AND the till
// is at V.N. Gaia, falls back to the other-brand master (Lamy, Parker, …).
// Read-only; auth is gated by proxy.ts, role re-checked here.
export async function GET(req: Request) {
  const rl = await assertRateLimit(req, "pos-scan", 240, 60_000);
  if (rl) return rl;

  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role ?? null;
  if (!isStaffRole(role)) return NextResponse.json({ ok: false }, { status: 404 });

  const url = new URL(req.url);
  const ean = url.searchParams.get("ean")?.trim();
  const sku = url.searchParams.get("sku")?.trim();
  const boutique = url.searchParams.get("boutique")?.trim();
  if (!ean && !sku) {
    return NextResponse.json({ ok: false, error: "ean or sku required" }, { status: 400 });
  }
  const where = ean ? { ean } : { sku: sku! };

  const variant = await prisma.productVariant.findFirst({
    where,
    select: {
      id: true,
      sku: true,
      ean: true,
      name: true,
      priceCents: true,
      promoPriceCents: true,
      promoStartDate: true,
      promoEndDate: true,
      stockLis: true,
      stockVng: true,
      status: true,
      product: { select: { name: true, collection: true } },
    },
  });

  if (variant) {
    return NextResponse.json({ ok: true, source: "DUPONT", variant });
  }

  // Other-brand fallback — only at VNG (they exist only there).
  if (boutique === "VNG") {
    const ob = await prisma.otherBrandItem.findFirst({
      where: { ...where, active: true },
      select: { id: true, sku: true, ean: true, brand: true, descricao: true, pvpCents: true, stock: true },
    });
    if (ob) {
      // Shape it like a `variant` so the terminal can reuse the same code path:
      // name/product mirror the description, priceCents = pvpCents (may be null).
      return NextResponse.json({
        ok: true,
        source: "OTHER_BRAND",
        variant: {
          id: ob.id,
          sku: ob.sku,
          ean: ob.ean,
          brand: ob.brand,
          name: { pt: ob.descricao, en: ob.descricao },
          priceCents: ob.pvpCents,
          stockLis: 0,
          stockVng: ob.stock,
          status: "DISPONIVEL",
          product: null,
        },
      });
    }
  }

  return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
}
