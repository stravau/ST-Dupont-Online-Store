import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { readUploadedSheet, pick, asString, asNumber, asDate, batchResolveVariants } from "@/lib/admin-upload";
import { assertRateLimit, assertSameOrigin, safeError } from "@/lib/admin-api";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Promo upload — columns: EAN | REF | PVP_PROMO | DATA_INICIO | DATA_FIM.
// Empty PVP_PROMO clears the promo (back to base priceCents).
//
// Rules:
//   - Non-null PVP_PROMO without DATA_FIM is rejected — evergreen
//     promos are a data-corruption hazard, not a config option.
//   - No-op rows (same promo state already in place) count as
//     `unchanged`, not `updated`, so the batch report doesn't mislead.
export async function POST(req: Request) {
  const csrf = assertSameOrigin(req);
  if (csrf) return csrf;
  const rl = await assertRateLimit(req, "upload-promo", 5, 60_000);
  if (rl) return rl;

  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id ?? null;
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ ok: false, error: "no file" }, { status: 400 });

  const rows = await readUploadedSheet(file);
  if (rows.length === 0) {
    return NextResponse.json({ ok: false, error: "empty sheet" }, { status: 400 });
  }
  const batchId = randomUUID();
  let updated = 0, unchanged = 0, unmatched = 0, skipped = 0;
  const unmatchedSample: { ref?: string; ean?: string }[] = [];

  type Parsed = {
    ean: string | null; ref: string | null;
    promo: number | null; start: Date | null; end: Date | null;
  };
  const parsed: Parsed[] = rows.map((row) => ({
    ean: asString(pick(row, "EAN")),
    ref: asString(pick(row, "REF", "REFERENCIA")),
    promo: asNumber(pick(row, "PVP_PROMO", "PROMO", "PRECO_PROMO")),
    start: asDate(pick(row, "DATA_INICIO", "INICIO")),
    end:   asDate(pick(row, "DATA_FIM", "FIM")),
  }));
  const lookup = await batchResolveVariants(parsed.map((p) => ({ ean: p.ean, ref: p.ref })));

  for (let i = 0; i < parsed.length; i++) {
    const p = parsed[i];
    if (p.promo != null && p.promo < 0) { skipped++; continue; }
    if (p.promo != null && p.end == null) { skipped++; continue; }

    const v = lookup[i];
    if (!v) {
      unmatched++;
      if (unmatchedSample.length < 10) unmatchedSample.push({ ref: p.ref ?? undefined, ean: p.ean ?? undefined });
      continue;
    }

    const nextPromoCents = p.promo != null ? Math.round(p.promo * 100) : null;
    const nextStart      = p.promo != null ? (p.start ?? new Date()) : null;
    const nextEnd        = p.promo != null ? p.end : null;

    // Skip no-ops (same promo + same dates already in place).
    const sameCents = (v.promoPriceCents ?? null) === nextPromoCents;
    const sameStart =
      (v.promoStartDate?.getTime() ?? null) === (nextStart?.getTime() ?? null);
    const sameEnd =
      (v.promoEndDate?.getTime() ?? null) === (nextEnd?.getTime() ?? null);
    if (sameCents && sameStart && sameEnd) { unchanged++; continue; }

    try {
      await prisma.$transaction([
        prisma.productVariant.update({
          where: { id: v.id },
          data: {
            promoPriceCents: nextPromoCents,
            promoStartDate: nextStart,
            promoEndDate: nextEnd,
          },
        }),
        prisma.adminAction.create({
          data: {
            userId,
            batchId,
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
              promoPriceCents: nextPromoCents,
              promoStartDate: nextStart?.toISOString() ?? null,
              promoEndDate: nextEnd?.toISOString() ?? null,
            } as object,
          },
        }),
      ]);
      updated++;
    } catch {
      skipped++;
    }
  }

  try {
    await prisma.adminAction.create({
      data: {
        userId,
        batchId,
        entityType: "UPLOAD_BATCH",
        action: "UPLOAD",
        entityId: "promo",
        note: `total ${rows.length} · updated ${updated} · unchanged ${unchanged} · unmatched ${unmatched} · skipped ${skipped}`,
      },
    });
  } catch (e) {
    return safeError(e, "batch summary write failed");
  }

  return NextResponse.json({ ok: true, total: rows.length, updated, unchanged, unmatched, skipped, unmatchedSample });
}
