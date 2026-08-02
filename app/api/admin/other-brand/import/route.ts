import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { currentStaff } from "@/lib/admin-auth";
import { readUploadedSheet, pick, asString, asNumber, asInt } from "@/lib/admin-upload";
import { assertRateLimit, assertSameOrigin, isValidEan, safeError } from "@/lib/admin-api";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// POST /api/admin/other-brand/import — cria/actualiza OtherBrandItem em lote
// a partir de um Excel. Substituiu o formulário campo-a-campo: artigos de
// outras marcas chegam sempre em lote (uma encomenda nova, uma marca nova),
// nunca um de cada vez.
//
// Colunas: REF, MARCA, DESCRICAO, EAN (opc), PVP (opc), STOCK (opc)
//
// NÃO é autoritativo — ao contrário do sync ECI, este import só toca nas
// linhas presentes no ficheiro. O que não vem no Excel fica como está.
//
// Acesso: ADMIN e LOJA_VNG (o mesmo gate do create manual que substituiu).

const MAX_ROWS = 5000;

export async function POST(req: Request) {
  const csrf = assertSameOrigin(req);
  if (csrf) return csrf;
  const rl = await assertRateLimit(req, "other-brand-import", 5, 60_000);
  if (rl) return rl;

  const staff = await currentStaff();
  const role = staff?.role;
  if (role !== "ADMIN" && role !== "LOJA_VNG") {
    return NextResponse.json({ ok: false, error: "apenas ADMIN e LOJA_VNG podem importar" }, { status: 403 });
  }
  const userId = staff?.id ?? null;

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "sem ficheiro" }, { status: 400 });
  }

  let rows: Awaited<ReturnType<typeof readUploadedSheet>>;
  try {
    rows = await readUploadedSheet(file);
  } catch (e) {
    return safeError(e, "não consegui ler o ficheiro — é mesmo um .xlsx?");
  }
  if (rows.length === 0) {
    return NextResponse.json({ ok: false, error: "folha vazia" }, { status: 400 });
  }
  if (rows.length > MAX_ROWS) {
    return NextResponse.json(
      { ok: false, error: `ficheiro demasiado grande (${rows.length} linhas, máx ${MAX_ROWS})` },
      { status: 400 },
    );
  }

  // ---- Parse + valida cada linha antes de tocar na DB ----
  type Parsed = {
    sku: string; brand: string; descricao: string;
    ean: string | null; pvpCents: number | null; stock: number;
  };
  const parsed: Parsed[] = [];
  const skipped: { ref?: string; reason: string }[] = [];
  let skippedCount = 0;
  const seenSku = new Set<string>();

  function skip(ref: string | null, reason: string) {
    skippedCount++;
    if (skipped.length < 10) skipped.push({ ref: ref ?? undefined, reason });
  }

  for (const row of rows) {
    const ref = asString(pick(row, "REF", "REFERENCIA", "SKU"));
    const brand = asString(pick(row, "MARCA", "BRAND"));
    const descricao = asString(pick(row, "DESCRICAO", "DESCRIPTION", "NOME", "NAME"));
    const ean = asString(pick(row, "EAN", "CODIGO_BARRAS"));
    const pvp = asNumber(pick(row, "PVP", "PRECO", "PRICE"));
    const stock = asInt(pick(row, "STOCK", "STOCK_TEORICO", "QUANTIDADE")) ?? 0;

    if (!ref) { skip(null, "REF em falta"); continue; }
    if (ref.length > 60) { skip(ref, "REF demasiado longo (máx 60)"); continue; }
    if (!brand) { skip(ref, "MARCA em falta"); continue; }
    if (!descricao) { skip(ref, "DESCRICAO em falta"); continue; }
    if (ean !== null && !isValidEan(ean)) { skip(ref, "EAN inválido (8 ou 13 dígitos)"); continue; }
    if (stock < 0) { skip(ref, "STOCK negativo"); continue; }
    // Linha repetida dentro do próprio ficheiro — fica a primeira.
    if (seenSku.has(ref)) { skip(ref, "REF repetida no ficheiro"); continue; }
    seenSku.add(ref);

    parsed.push({
      sku: ref,
      brand: brand.toUpperCase().slice(0, 60),
      descricao: descricao.slice(0, 500),
      ean,
      pvpCents: pvp == null ? null : Math.round(pvp * 100),
      stock,
    });
  }

  if (parsed.length === 0) {
    return NextResponse.json({ ok: true, total: rows.length, created: 0, updated: 0, skipped: skippedCount, unmatchedSample: skipped });
  }

  // ---- Look-ups em lote: quem já existe por SKU e que EANs estão tomados ----
  const eansInFile = parsed.map((p) => p.ean).filter((e): e is string => e !== null);
  const [existing, eanOwners] = await Promise.all([
    prisma.otherBrandItem.findMany({
      where: { sku: { in: parsed.map((p) => p.sku) } },
      select: { id: true, sku: true, brand: true, ean: true, descricao: true, pvpCents: true, stock: true },
    }),
    eansInFile.length
      ? prisma.otherBrandItem.findMany({
          where: { ean: { in: eansInFile } },
          select: { sku: true, ean: true },
        })
      : Promise.resolve([] as { sku: string; ean: string | null }[]),
  ]);
  const bySku = new Map(existing.map((r) => [r.sku, r]));
  // EAN → sku que o detém. Se o EAN do ficheiro pertence a OUTRO sku, saltamos
  // a linha em vez de rebentar com a constraint unique a meio do lote.
  const eanOwner = new Map(eanOwners.filter((r) => r.ean).map((r) => [r.ean as string, r.sku]));

  const toCreate: Parsed[] = [];
  const toUpdate: { id: string; data: Parsed }[] = [];
  for (const p of parsed) {
    if (p.ean) {
      const owner = eanOwner.get(p.ean);
      if (owner && owner !== p.sku) {
        skip(p.sku, `EAN ${p.ean} já pertence a ${owner}`);
        continue;
      }
    }
    const found = bySku.get(p.sku);
    if (found) toUpdate.push({ id: found.id, data: p });
    else toCreate.push(p);
  }

  const batchId = randomUUID();
  let created = 0;
  let updated = 0;

  try {
    if (toCreate.length > 0) {
      const res = await prisma.otherBrandItem.createMany({
        data: toCreate.map((p) => ({
          sku: p.sku, brand: p.brand, ean: p.ean,
          descricao: p.descricao, pvpCents: p.pvpCents, stock: p.stock,
          active: true,
        })),
        skipDuplicates: true,
      });
      created = res.count;
    }

    // Updates em pool de 10 — Neon aguenta bem e evita 5000 round-trips em série.
    for (let i = 0; i < toUpdate.length; i += 10) {
      const chunk = toUpdate.slice(i, i + 10);
      await Promise.all(
        chunk.map((u) =>
          prisma.otherBrandItem.update({
            where: { id: u.id },
            data: {
              brand: u.data.brand,
              ean: u.data.ean,
              descricao: u.data.descricao,
              pvpCents: u.data.pvpCents,
              stock: u.data.stock,
            },
          }),
        ),
      );
      updated += chunk.length;
    }
  } catch (e) {
    return safeError(e, "import falhou a meio — verifica a Auditoria");
  }

  // Trilho de auditoria: uma linha por artigo + o resumo do lote.
  try {
    await prisma.adminAction.createMany({
      data: [
        ...toCreate.map((p) => ({
          userId, batchId, entityType: "OTHER_BRAND_ITEM", action: "CREATE", entityId: p.sku,
          note: "Import Excel · outras marcas",
          after: { sku: p.sku, brand: p.brand, ean: p.ean, descricao: p.descricao, pvpCents: p.pvpCents, stock: p.stock } as object,
        })),
        ...toUpdate.map((u) => {
          const before = bySku.get(u.data.sku);
          return {
            userId, batchId, entityType: "OTHER_BRAND_ITEM", action: "UPDATE", entityId: u.data.sku,
            note: "Import Excel · outras marcas (REF já existia)",
            before: before
              ? { brand: before.brand, ean: before.ean, descricao: before.descricao, pvpCents: before.pvpCents, stock: before.stock } as object
              : undefined,
            after: { brand: u.data.brand, ean: u.data.ean, descricao: u.data.descricao, pvpCents: u.data.pvpCents, stock: u.data.stock } as object,
          };
        }),
        {
          userId, batchId, entityType: "UPLOAD_BATCH", action: "UPLOAD", entityId: "other-brand-import",
          note: `total ${rows.length} · criados ${created} · actualizados ${updated} · saltados ${skippedCount}`,
        },
      ],
    });
  } catch (e) {
    return safeError(e, "artigos gravados mas o registo de auditoria falhou");
  }

  return NextResponse.json({
    ok: true,
    total: rows.length,
    created,
    updated,
    skipped: skippedCount,
    unmatchedSample: skipped,
  });
}
