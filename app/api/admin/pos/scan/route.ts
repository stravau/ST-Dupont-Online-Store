import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { assertRateLimit } from "@/lib/admin-api";
import { isStaffRole } from "@/lib/pos";

export const dynamic = "force-dynamic";

// GET /api/admin/pos/scan?ean=<barcode>  (or ?sku=<ref>)
// Resolves a scanned barcode to a catalogue variant so the terminal can add it
// to a sale. Read-only; auth is gated by proxy.ts, role re-checked here.
export async function GET(req: Request) {
  const rl = await assertRateLimit(req, "pos-scan", 240, 60_000);
  if (rl) return rl;

  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role ?? null;
  if (!isStaffRole(role)) return NextResponse.json({ ok: false }, { status: 404 });

  const url = new URL(req.url);
  const ean = url.searchParams.get("ean")?.trim();
  const sku = url.searchParams.get("sku")?.trim();
  if (!ean && !sku) {
    return NextResponse.json({ ok: false, error: "ean or sku required" }, { status: 400 });
  }

  const variant = await prisma.productVariant.findFirst({
    where: ean ? { ean } : { sku: sku! },
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

  if (!variant) {
    return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, variant });
}
