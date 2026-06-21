import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { readUploadedSheet, pick, asString, asNumber, asDate, resolveVariant } from "@/lib/admin-upload";

export const dynamic = "force-dynamic";

// PVP upload — columns: EAN | REF | PVP | DATA_INICIO (optional).
// Updates priceCents + pvpStartDate. Promo state untouched (lives
// in promoPriceCents / promoEndDate and survives until the promo
// window naturally expires).
export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id ?? null;
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ ok: false, error: "no file" }, { status: 400 });

  const rows = await readUploadedSheet(file);
  let updated = 0, unmatched = 0, skipped = 0;
  const unmatchedSample: { ref?: string; ean?: string }[] = [];

  for (const row of rows) {
    const ean = asString(pick(row, "EAN"));
    const ref = asString(pick(row, "REF", "REFERENCIA", "REFERENCIA"));
    const pvp = asNumber(pick(row, "PVP", "PRECO", "PRECO_VENDA"));
    const startDate = asDate(pick(row, "DATA_INICIO", "DATA_INICIO_PVP", "INICIO")) ?? new Date();
    if (pvp == null || pvp < 0) { skipped++; continue; }
    const cents = Math.round(pvp * 100);

    const v = await resolveVariant(ean, ref);
    if (!v) {
      unmatched++;
      if (unmatchedSample.length < 10) unmatchedSample.push({ ref: ref ?? undefined, ean: ean ?? undefined });
      continue;
    }
    if (v.priceCents === cents) { updated++; continue; } // no-op counts as success
    try {
      await prisma.$transaction([
        prisma.productVariant.update({
          where: { id: v.id },
          data: { priceCents: cents, pvpStartDate: startDate },
        }),
        prisma.adminAction.create({
          data: {
            userId,
            entityType: "VARIANT",
            action: "UPDATE",
            entityId: v.sku,
            note: "PVP upload",
            before: { priceCents: v.priceCents } as object,
            after: { priceCents: cents, pvpStartDate: startDate.toISOString() } as object,
          },
        }),
      ]);
      updated++;
    } catch {
      skipped++;
    }
  }

  await prisma.adminAction.create({
    data: {
      userId,
      entityType: "UPLOAD_BATCH",
      action: "UPLOAD",
      entityId: "pvp",
      note: `total ${rows.length} · updated ${updated} · unmatched ${unmatched} · skipped ${skipped}`,
    },
  });

  return NextResponse.json({ ok: true, total: rows.length, updated, unmatched, skipped, unmatchedSample });
}
