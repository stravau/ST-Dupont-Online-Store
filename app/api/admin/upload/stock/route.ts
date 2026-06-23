import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { readUploadedSheet, pick, asString, asInt, batchResolveVariants } from "@/lib/admin-upload";
import { assertRateLimit, assertSameOrigin, safeError } from "@/lib/admin-api";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Stock upload — columns: EAN | REF | STOCK. Overwrites stock — does
// not sum. Use /admin/variants inline edit for delta tweaks.
export async function POST(req: Request) {
  const csrf = assertSameOrigin(req);
  if (csrf) return csrf;
  const rl = await assertRateLimit(req, "upload-stock", 5, 60_000);
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

  type Parsed = { ean: string | null; ref: string | null; stock: number | null };
  const parsed: Parsed[] = rows.map((row) => ({
    ean: asString(pick(row, "EAN")),
    ref: asString(pick(row, "REF", "REFERENCIA")),
    stock: asInt(pick(row, "STOCK", "STOCK_TEORICO", "QTD")),
  }));
  const lookup = await batchResolveVariants(parsed.map((p) => ({ ean: p.ean, ref: p.ref })));

  for (let i = 0; i < parsed.length; i++) {
    const p = parsed[i];
    if (p.stock == null || p.stock < 0) { skipped++; continue; }

    const v = lookup[i];
    if (!v) {
      unmatched++;
      if (unmatchedSample.length < 10) unmatchedSample.push({ ref: p.ref ?? undefined, ean: p.ean ?? undefined });
      continue;
    }
    if (v.stock === p.stock) { unchanged++; continue; }
    try {
      await prisma.$transaction([
        prisma.productVariant.update({ where: { id: v.id }, data: { stock: p.stock } }),
        prisma.adminAction.create({
          data: {
            userId,
            batchId,
            entityType: "VARIANT",
            action: "UPDATE",
            entityId: v.sku,
            note: "Stock upload",
            before: { stock: v.stock } as object,
            after: { stock: p.stock } as object,
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
        entityId: "stock",
        note: `total ${rows.length} · updated ${updated} · unchanged ${unchanged} · unmatched ${unmatched} · skipped ${skipped}`,
      },
    });
  } catch (e) {
    return safeError(e, "batch summary write failed");
  }

  return NextResponse.json({ ok: true, total: rows.length, updated, unchanged, unmatched, skipped, unmatchedSample });
}
