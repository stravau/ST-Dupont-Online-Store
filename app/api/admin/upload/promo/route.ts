import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { readUploadedSheet, pick, asString, asNumber, asDate, resolveVariant } from "@/lib/admin-upload";

export const dynamic = "force-dynamic";

// Promo upload — columns: EAN | REF | PVP_PROMO | DATA_INICIO | DATA_FIM.
// Empty PVP_PROMO clears the promo (back to base priceCents).
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
    const ref = asString(pick(row, "REF", "REFERENCIA"));
    const promo = asNumber(pick(row, "PVP_PROMO", "PROMO", "PRECO_PROMO"));
    const start = asDate(pick(row, "DATA_INICIO", "INICIO"));
    const end   = asDate(pick(row, "DATA_FIM", "FIM"));

    const v = await resolveVariant(ean, ref);
    if (!v) {
      unmatched++;
      if (unmatchedSample.length < 10) unmatchedSample.push({ ref: ref ?? undefined, ean: ean ?? undefined });
      continue;
    }

    if (promo != null && promo < 0) { skipped++; continue; }
    // A non-null promo price with no DATA_FIM would create an evergreen
    // promo (never expires) — that's a data hazard, not a config option.
    // Reject the row and let the admin re-upload with the right end date.
    if (promo != null && end == null) { skipped++; continue; }

    const data: {
      promoPriceCents: number | null;
      promoStartDate: Date | null;
      promoEndDate: Date | null;
    } = {
      promoPriceCents: promo != null ? Math.round(promo * 100) : null,
      promoStartDate: promo != null ? (start ?? new Date()) : null,
      promoEndDate: promo != null ? end : null,
    };

    try {
      await prisma.$transaction([
        prisma.productVariant.update({ where: { id: v.id }, data }),
        prisma.adminAction.create({
          data: {
            userId,
            entityType: "PROMO",
            action: "UPDATE",
            entityId: v.sku,
            note: "Promo upload",
            before: {
              promoPriceCents: v.promoPriceCents,
              promoStartDate: v.promoStartDate?.toISOString() ?? null,
              promoEndDate: v.promoEndDate?.toISOString() ?? null,
            } as object,
            after: {
              promoPriceCents: data.promoPriceCents,
              promoStartDate: data.promoStartDate?.toISOString() ?? null,
              promoEndDate: data.promoEndDate?.toISOString() ?? null,
            } as object,
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
      entityId: "promo",
      note: `total ${rows.length} · updated ${updated} · unmatched ${unmatched} · skipped ${skipped}`,
    },
  });

  return NextResponse.json({ ok: true, total: rows.length, updated, unmatched, skipped, unmatchedSample });
}
