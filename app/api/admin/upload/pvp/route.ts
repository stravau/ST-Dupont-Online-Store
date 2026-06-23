import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { readUploadedSheet, pick, asString, asNumber, asDate, batchResolveVariants } from "@/lib/admin-upload";
import { assertRateLimit, assertSameOrigin, safeError } from "@/lib/admin-api";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// PVP upload — columns: EAN | REF | PVP | DATA_INICIO (optional).
// Updates priceCents + pvpStartDate. Promo state untouched (lives
// in promoPriceCents / promoEndDate and survives until the promo
// window naturally expires).
//
// Resolves every row's variant in ONE batched findMany before the loop,
// so a 1000-row sheet becomes 1 lookup + N transactions instead of
// 2N round-trips.
export async function POST(req: Request) {
  const csrf = assertSameOrigin(req);
  if (csrf) return csrf;
  const rl = await assertRateLimit(req, "upload-pvp", 5, 60_000);
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
  // Single id shared by every AdminAction this upload writes — the
  // audit viewer groups on it to render one collapsible card per
  // batch. Generated upfront so per-row writes can carry it.
  const batchId = randomUUID();
  let updated = 0, unchanged = 0, unmatched = 0, skipped = 0;
  const unmatchedSample: { ref?: string; ean?: string }[] = [];

  // Parse + collect look-up keys.
  type Parsed = { ean: string | null; ref: string | null; pvp: number | null; startDate: Date };
  const parsed: Parsed[] = rows.map((row) => ({
    ean: asString(pick(row, "EAN")),
    ref: asString(pick(row, "REF", "REFERENCIA")),
    pvp: asNumber(pick(row, "PVP", "PRECO", "PRECO_VENDA")),
    startDate: asDate(pick(row, "DATA_INICIO", "DATA_INICIO_PVP", "INICIO")) ?? new Date(),
  }));
  const lookup = await batchResolveVariants(
    parsed.map((p) => ({ ean: p.ean, ref: p.ref })),
  );

  for (let i = 0; i < parsed.length; i++) {
    const p = parsed[i];
    if (p.pvp == null || p.pvp < 0) { skipped++; continue; }
    const cents = Math.round(p.pvp * 100);

    const v = lookup[i];
    if (!v) {
      unmatched++;
      if (unmatchedSample.length < 10) unmatchedSample.push({ ref: p.ref ?? undefined, ean: p.ean ?? undefined });
      continue;
    }
    if (v.priceCents === cents) { unchanged++; continue; }
    try {
      await prisma.$transaction([
        prisma.productVariant.update({
          where: { id: v.id },
          data: { priceCents: cents, pvpStartDate: p.startDate },
        }),
        prisma.adminAction.create({
          data: {
            userId,
            batchId,
            entityType: "VARIANT",
            action: "UPDATE",
            entityId: v.sku,
            note: "PVP upload",
            before: { priceCents: v.priceCents } as object,
            after: { priceCents: cents, pvpStartDate: p.startDate.toISOString() } as object,
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
        entityId: "pvp",
        note: `total ${rows.length} · updated ${updated} · unchanged ${unchanged} · unmatched ${unmatched} · skipped ${skipped}`,
      },
    });
  } catch (e) {
    return safeError(e, "batch summary write failed");
  }

  return NextResponse.json({ ok: true, total: rows.length, updated, unchanged, unmatched, skipped, unmatchedSample });
}
