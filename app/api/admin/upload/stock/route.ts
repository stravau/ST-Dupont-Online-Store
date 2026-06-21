import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { readUploadedSheet, pick, asString, asInt, resolveVariant } from "@/lib/admin-upload";

export const dynamic = "force-dynamic";

// Stock upload — columns: EAN | REF | STOCK. Overwrites stock — does
// not sum. Use /admin/variants inline edit for delta tweaks.
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
    const stock = asInt(pick(row, "STOCK", "STOCK_TEORICO", "QTD"));
    if (stock == null || stock < 0) { skipped++; continue; }

    const v = await resolveVariant(ean, ref);
    if (!v) {
      unmatched++;
      if (unmatchedSample.length < 10) unmatchedSample.push({ ref: ref ?? undefined, ean: ean ?? undefined });
      continue;
    }
    try {
      await prisma.$transaction([
        prisma.productVariant.update({ where: { id: v.id }, data: { stock } }),
        prisma.adminAction.create({
          data: {
            userId,
            entityType: "VARIANT",
            action: "UPDATE",
            entityId: v.sku,
            note: "Stock upload",
            after: { stock } as object,
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
      entityId: "stock",
      note: `total ${rows.length} · updated ${updated} · unmatched ${unmatched} · skipped ${skipped}`,
    },
  });

  return NextResponse.json({ ok: true, total: rows.length, updated, unmatched, skipped, unmatchedSample });
}
