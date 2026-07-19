import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { readUploadedSheet, pick, asString, asNumber, asInt, refCandidates } from "@/lib/admin-upload";
import { assertRateLimit, assertSameOrigin, isValidEan, safeError } from "@/lib/admin-api";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // serverless function — give big sheets headroom

// Slugify a description into a safe URL slug.
function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 60);
}

// New articles upload — Excel with the full DB shape. Each row becomes a
// Product + a ProductVariant. status defaults to INDISPONIVEL so the
// admin reviews before flipping to DISPONIVEL.
// Columns supported:
//   EAN, REF, DESCRICAO, PVP, STOCK, CATEGORIA, IMAGEM_URL, COLECAO
//
// Two batching wins keep big sheets under the Vercel function timeout:
//   1. ALL existing-variant + ALL category look-ups happen as TWO
//      findMany() calls up front, not 2N round-trips inside the loop.
//   2. Each row's Product + Variant write lands in ONE $transaction so
//      a unique-constraint conflict on the Variant doesn't leave an
//      orphan Product row.
export async function POST(req: Request) {
  const csrf = assertSameOrigin(req);
  if (csrf) return csrf;
  const rl = await assertRateLimit(req, "upload-new-articles", 5, 60_000);
  if (rl) return rl;

  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;
  const userId = gate.userId;
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ ok: false, error: "no file" }, { status: 400 });

  const rows = await readUploadedSheet(file);
  if (rows.length === 0) {
    return NextResponse.json({ ok: false, error: "empty sheet" }, { status: 400 });
  }
  const batchId = randomUUID();
  let created = 0, updated = 0, skipped = 0;
  const unmatchedSample: { ref?: string; reason: string }[] = [];

  // Acessorios is the safe fallback category — exists for sure (it's
  // one of the four seeded). We only resolve OTHER category slugs when
  // explicitly named in the sheet.
  const fallbackCat = await prisma.category.findUnique({ where: { slug: "acessorios" }, select: { id: true } });
  if (!fallbackCat) {
    return NextResponse.json({ ok: false, error: "no fallback category 'acessorios' in DB" }, { status: 500 });
  }

  // ----- Batched look-ups (avoids N round-trips per row) -----
  // First pass: parse rows, normalise the SKU + cat slug so we can
  // collect the full set of look-up keys for two findMany() calls.
  type ParsedRow = {
    row: typeof rows[number];
    ean: string | null; refIn: string | null; desc: string | null;
    pvp: number | null; stock: number; catSlug: string | null;
    imgUrl: string | null; colecao: string | null;
    sku: string | null;
  };
  const parsed: ParsedRow[] = [];
  const skuSet = new Set<string>();
  const catSlugSet = new Set<string>();
  for (const row of rows) {
    const ean   = asString(pick(row, "EAN"));
    const refIn = asString(pick(row, "REF", "REFERENCIA"));
    const desc  = asString(pick(row, "DESCRICAO", "DESCRIPTION", "NOME", "NAME"));
    const pvp   = asNumber(pick(row, "PVP", "PRECO"));
    const stock = asInt(pick(row, "STOCK", "STOCK_TEORICO")) ?? 0;
    const catSlug = asString(pick(row, "CATEGORIA", "CATEGORY"));
    const imgUrl  = asString(pick(row, "IMAGEM_URL", "IMAGEM", "IMAGE_URL", "IMAGE"));
    const colecao = asString(pick(row, "COLECAO", "COLLECTION"));
    const sku = refIn ? refCandidates(refIn)[0] : null;
    if (sku) skuSet.add(sku);
    if (catSlug) catSlugSet.add(catSlug.toLowerCase());
    parsed.push({ row, ean, refIn, desc, pvp, stock, catSlug, imgUrl, colecao, sku });
  }

  // Pre-fetch every existing variant in one go, plus the full set of
  // categories named in the sheet. Look-ups inside the loop become Map
  // hits (microseconds) instead of Neon round-trips (~30 ms each).
  const [existingVariants, categoryRows] = await Promise.all([
    prisma.productVariant.findMany({
      where: { sku: { in: Array.from(skuSet) } },
      select: { id: true, sku: true, ean: true, priceCents: true, stock: true, name: true, images: true },
    }),
    prisma.category.findMany({
      where: { slug: { in: Array.from(catSlugSet) } },
      select: { id: true, slug: true },
    }),
  ]);
  const existingBySku = new Map(existingVariants.map((v) => [v.sku, v]));
  const categoryBySlug = new Map(categoryRows.map((c) => [c.slug, c.id]));

  for (const p of parsed) {
    const { ean, refIn, desc, pvp, stock, catSlug, imgUrl, colecao, sku } = p;
    if (!refIn || !sku || !desc || pvp == null) {
      skipped++;
      if (unmatchedSample.length < 10) unmatchedSample.push({ ref: refIn ?? undefined, reason: "REF/DESCRICAO/PVP em falta" });
      continue;
    }
    if (ean !== null && !isValidEan(ean)) {
      skipped++;
      if (unmatchedSample.length < 10) unmatchedSample.push({ ref: refIn, reason: "EAN must be 8 or 13 digits" });
      continue;
    }
    const cents = Math.round(pvp * 100);
    const categoryId = (catSlug && categoryBySlug.get(catSlug.toLowerCase())) ?? fallbackCat.id;

    const existing = existingBySku.get(sku);
    if (existing) {
      try {
        await prisma.$transaction([
          prisma.productVariant.update({
            where: { id: existing.id },
            data: {
              ean: ean ?? undefined,
              priceCents: cents,
              stock,
              name: { pt: desc, en: desc },
              pvpStartDate: new Date(),
              ...(imgUrl ? { images: [imgUrl] } : {}),
            },
          }),
          prisma.adminAction.create({
            data: {
              userId, batchId, entityType: "VARIANT", action: "UPDATE", entityId: sku,
              note: "New-articles upload (existing SKU, updated)",
              // Proper diff — captures the prior state, not just `after`.
              before: {
                ean: existing.ean, priceCents: existing.priceCents,
                stock: existing.stock, name: existing.name, images: existing.images,
              } as object,
              after:  {
                ean: ean ?? existing.ean, priceCents: cents, stock,
                name: { pt: desc, en: desc },
                ...(imgUrl ? { images: [imgUrl] } : {}),
              } as object,
            },
          }),
        ]);
        updated++;
      } catch (e) {
        skipped++;
        if (unmatchedSample.length < 10) unmatchedSample.push({ ref: refIn, reason: (e as Error).message.slice(0, 80) });
      }
      continue;
    }

    // Brand-new — Product + Variant in ONE atomic transaction so a
    // unique-constraint collision on the Variant doesn't leave a
    // half-baked Product row sitting in the DB.
    const baseSlug = slugify(desc) || `sku-${sku.toLowerCase()}`;
    const slug = `${baseSlug}-${sku.toLowerCase().slice(-4)}`;
    try {
      await prisma.$transaction(async (tx) => {
        const product = await tx.product.create({
          data: {
            slug,
            name: { pt: desc, en: desc },
            description: { pt: desc, en: desc },
            collection: colecao ?? "",
            image: imgUrl ?? null,
            categoryId,
            active: false, // status is INDISPONIVEL — keep `active` in sync
            featured: false,
          },
          select: { id: true },
        });
        await tx.productVariant.create({
          data: {
            sku,
            productId: product.id,
            name: { pt: desc, en: desc },
            priceCents: cents,
            currency: "EUR",
            stock,
            ean: ean ?? undefined,
            status: "INDISPONIVEL",
            active: false, // mirror status — see comment above
            pvpStartDate: new Date(),
            images: imgUrl ? [imgUrl] : [],
            attributes: { source: "new-articles-upload" },
          },
        });
        await tx.adminAction.create({
          data: {
            userId, batchId, entityType: "VARIANT", action: "CREATE", entityId: sku,
            note: `New article created · product slug ${slug}`,
            after: { ean, priceCents: cents, stock, slug } as object,
          },
        });
      });
      created++;
    } catch (e) {
      skipped++;
      if (unmatchedSample.length < 10) unmatchedSample.push({ ref: refIn, reason: (e as Error).message.slice(0, 80) });
    }
  }

  try {
    await prisma.adminAction.create({
      data: {
        userId,
        batchId,
        entityType: "UPLOAD_BATCH",
        action: "UPLOAD",
        entityId: "new-articles",
        note: `total ${rows.length} · created ${created} · updated ${updated} · skipped ${skipped}`,
      },
    });
  } catch (e) {
    return safeError(e, "batch summary write failed");
  }

  return NextResponse.json({ ok: true, total: rows.length, created, updated, skipped, unmatchedSample });
}
