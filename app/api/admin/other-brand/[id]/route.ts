import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentStaff } from "@/lib/admin-auth";
import { assertRateLimit, assertSameOrigin, safeError } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

// PATCH /api/admin/other-brand/[id]  — inline edit em uma OtherBrandItem row.
// Permite mudar brand / descricao / ean / pvpCents / stock / active.
// SKU é chave natural (mapeia à REF do Excel ECI VNG) — imutável aqui;
// se precisares de renomear, apaga e cria de novo.
//
// Acesso: ADMIN e LOJA_VNG. LOJA_LIS bloqueado (não tem outras marcas).
// Optimistic concurrency via `expectedUpdatedAt` (se fornecido) → 409.

type Body = {
  brand?: string;
  descricao?: string;
  ean?: string | null;
  pvpCents?: number | null;
  stock?: number;
  active?: boolean;
  expectedUpdatedAt?: string;
};

function bad(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const csrf = assertSameOrigin(req);
  if (csrf) return csrf;
  const rl = await assertRateLimit(req, "other-brand-patch", 120, 60_000);
  if (rl) return rl;

  const staff = await currentStaff();
  const role = staff?.role;
  if (role !== "ADMIN" && role !== "LOJA_VNG") {
    return bad("apenas ADMIN e LOJA_VNG podem editar", 403);
  }
  const userId = staff?.id ?? null;

  const { id } = await ctx.params;
  if (!id) return bad("id obrigatório");

  let body: Body;
  try { body = (await req.json()) as Body; }
  catch { return bad("bad json"); }

  const current = await prisma.otherBrandItem.findUnique({ where: { id } });
  if (!current) return bad("artigo não encontrado", 404);

  // Optimistic concurrency — se o cliente enviou expectedUpdatedAt e não bate
  // com o actual, alguém já editou entretanto; devolve 409 para o cliente
  // fazer refresh.
  if (body.expectedUpdatedAt) {
    const exp = new Date(body.expectedUpdatedAt).toISOString();
    if (exp !== current.updatedAt.toISOString()) {
      return NextResponse.json(
        { ok: false, error: "conflito — este artigo foi editado por outra sessão, recarrega" },
        { status: 409 },
      );
    }
  }

  // Build the update patch cell-by-cell, validating each.
  const data: Record<string, unknown> = {};
  const before: Record<string, unknown> = {};
  const after: Record<string, unknown> = {};

  if (body.brand !== undefined) {
    const v = String(body.brand).trim().toUpperCase();
    if (!v) return bad("marca não pode ficar vazia");
    if (v.length > 60) return bad("marca demasiado longa (máx 60)");
    if (v !== current.brand) { data.brand = v; before.brand = current.brand; after.brand = v; }
  }
  if (body.descricao !== undefined) {
    const v = String(body.descricao).trim();
    if (!v) return bad("descrição não pode ficar vazia");
    if (v.length > 500) return bad("descrição demasiado longa (máx 500)");
    if (v !== current.descricao) { data.descricao = v; before.descricao = current.descricao; after.descricao = v; }
  }
  if (body.ean !== undefined) {
    const raw = body.ean === null || body.ean === "" ? null : String(body.ean).trim();
    if (raw && !/^\d{8}$|^\d{13}$/.test(raw)) return bad("EAN inválido (8 ou 13 dígitos)");
    if (raw !== current.ean) {
      // Reject collision cleanly (unique index).
      if (raw) {
        const clash = await prisma.otherBrandItem.findFirst({
          where: { ean: raw, NOT: { id } }, select: { sku: true, brand: true },
        });
        if (clash) return bad(`EAN já em uso por ${clash.brand} · ${clash.sku}`, 409);
      }
      data.ean = raw;
      before.ean = current.ean;
      after.ean = raw;
    }
  }
  if (body.pvpCents !== undefined) {
    if (body.pvpCents === null) {
      if (current.pvpCents !== null) { data.pvpCents = null; before.pvpCents = current.pvpCents; after.pvpCents = null; }
    } else {
      const c = Number(body.pvpCents);
      if (!Number.isFinite(c) || c < 0 || !Number.isInteger(c)) return bad("PVP inválido");
      if (c !== current.pvpCents) { data.pvpCents = c; before.pvpCents = current.pvpCents; after.pvpCents = c; }
    }
  }
  if (body.stock !== undefined) {
    const s = Number(body.stock);
    if (!Number.isFinite(s) || s < 0 || !Number.isInteger(s)) return bad("stock inválido");
    if (s !== current.stock) { data.stock = s; before.stock = current.stock; after.stock = s; }
  }
  if (body.active !== undefined) {
    const v = !!body.active;
    if (v !== current.active) { data.active = v; before.active = current.active; after.active = v; }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ ok: true, unchanged: true, item: current });
  }

  try {
    const updated = await prisma.otherBrandItem.update({ where: { id }, data });
    await prisma.adminAction.create({
      data: {
        userId,
        entityType: "OTHER_BRAND_ITEM",
        action: "UPDATE",
        entityId: current.sku,
        before: before as object,
        after: after as object,
      },
    });
    return NextResponse.json({ ok: true, item: updated });
  } catch (e) {
    return safeError(e, "update failed");
  }
}
