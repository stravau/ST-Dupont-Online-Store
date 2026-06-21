import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { readUploadedSheet, pick, asString, asNumber, asInt, refCandidates } from "@/lib/admin-upload";

export const dynamic = "force-dynamic";

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
//   EAN, REF, DESCRICAO, PVP, STOCK, CATEGORIA, IMAGEM_URL,
//   COLECAO (optional)
export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id ?? null;
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ ok: false, error: "no file" }, { status: 400 });

  const rows = await readUploadedSheet(file);
  let created = 0, updated = 0, skipped = 0;
  const unmatchedSample: { ref?: string; reason: string }[] = [];

  // Acessorios is the safe fallback category — exists for sure (it's
  // one of the four seeded). We only resolve OTHER category slugs when
  // explicitly named in the sheet.
  const fallbackCat = await prisma.category.findUnique({ where: { slug: "acessorios" }, select: { id: true } });
  if (!fallbackCat) {
    return NextResponse.json({ ok: false, error: "no fallback category 'acessorios' in DB" }, { status: 500 });
  }

  for (const row of rows) {
    const ean   = asString(pick(row, "EAN"));
    const refIn = asString(pick(row, "REF", "REFERENCIA"));
    const desc  = asString(pick(row, "DESCRICAO", "DESCRIPTION", "NOME", "NAME"));
    const pvp   = asNumber(pick(row, "PVP", "PRECO"));
    const stock = asInt(pick(row, "STOCK", "STOCK_TEORICO")) ?? 0;
    const catSlug = asString(pick(row, "CATEGORIA", "CATEGORY"));
    const imgUrl  = asString(pick(row, "IMAGEM_URL", "IMAGEM", "IMAGE_URL", "IMAGE"));
    const colecao = asString(pick(row, "COLECAO", "COLLECTION"));

    if (!refIn || !desc || pvp == null) {
      skipped++;
      if (unmatchedSample.length < 10) unmatchedSample.push({ ref: refIn ?? undefined, reason: "REF/DESCRICAO/PVP em falta" });
      continue;
    }
    const cents = Math.round(pvp * 100);
    const sku = refCandidates(refIn)[0]; // canonical: strip STD prefix

    // Resolve target category. If admin named one that doesn't exist,
    // fall back to acessorios but flag it.
    let categoryId = fallbackCat.id;
    if (catSlug) {
      const c = await prisma.category.findUnique({ where: { slug: catSlug.toLowerCase() }, select: { id: true } });
      if (c) categoryId = c.id;
    }

    // Existing variant? Update fields + bail.
    const existing = await prisma.productVariant.findUnique({
      where: { sku },
      select: { id: true },
    });
    if (existing) {
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
            userId, entityType: "VARIANT", action: "UPDATE", entityId: sku,
            note: "New-articles upload (existing SKU, updated)",
            after: { ean, priceCents: cents, stock } as object,
          },
        }),
      ]);
      updated++;
      continue;
    }

    // Brand-new — create Product + Variant under the resolved category.
    const baseSlug = slugify(desc) || `sku-${sku.toLowerCase()}`;
    // Avoid slug collisions by appending sku tail.
    const slug = `${baseSlug}-${sku.toLowerCase().slice(-4)}`;
    try {
      const product = await prisma.product.create({
        data: {
          slug,
          name: { pt: desc, en: desc },
          description: { pt: desc, en: desc },
          collection: colecao ?? "",
          image: imgUrl ?? null,
          categoryId,
          active: true,
          featured: false,
        },
        select: { id: true },
      });
      await prisma.$transaction([
        prisma.productVariant.create({
          data: {
            sku,
            productId: product.id,
            name: { pt: desc, en: desc },
            priceCents: cents,
            currency: "EUR",
            stock,
            ean: ean ?? undefined,
            status: "INDISPONIVEL", // default — admin promotes after review
            pvpStartDate: new Date(),
            images: imgUrl ? [imgUrl] : [],
            attributes: { source: "new-articles-upload" },
          },
        }),
        prisma.adminAction.create({
          data: {
            userId, entityType: "VARIANT", action: "CREATE", entityId: sku,
            note: `New article created · product slug ${slug}`,
            after: { ean, priceCents: cents, stock, slug } as object,
          },
        }),
      ]);
      created++;
    } catch (e) {
      skipped++;
      if (unmatchedSample.length < 10) unmatchedSample.push({ ref: refIn, reason: (e as Error).message.slice(0, 80) });
    }
  }

  await prisma.adminAction.create({
    data: {
      userId,
      entityType: "UPLOAD_BATCH",
      action: "UPLOAD",
      entityId: "new-articles",
      note: `total ${rows.length} · created ${created} · updated ${updated} · skipped ${skipped}`,
    },
  });

  return NextResponse.json({ ok: true, total: rows.length, created, updated, skipped, unmatchedSample });
}
