import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma/client";
import { currentStaff } from "@/lib/admin-auth";
import { assertRateLimit, assertSameOrigin, safeError } from "@/lib/admin-api";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Bulk-apply em OtherBrandItem — espelho do /variant/bulk mas para outras
// marcas VNG. Actions: pvp (set ou percent), active (activar/desactivar).
// Target: lista de ids (checkboxes) OU filter ("select all filtered").
//
// Acesso: ADMIN e LOJA_VNG. Cap 5000 targets como no variant/bulk.

const MAX_TARGETS = 5000;

type OtherBrandFilter = {
  q?: string;      // procura em sku/ean/descricao
  brand?: string;
  stock?: string;  // "zero" | "low" | "in"
  active?: string; // "yes" | "no"
};

type Body = {
  action?: "pvp" | "active";
  ids?: unknown;
  filter?: OtherBrandFilter;
  pvp?: { mode?: "set" | "percent"; priceCents?: number; percent?: number };
  active?: boolean;
};

function bad(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status });
}

function buildWhere(f: OtherBrandFilter): Prisma.OtherBrandItemWhereInput {
  const where: Prisma.OtherBrandItemWhereInput = {};
  const q = (f.q ?? "").trim();
  if (q) {
    where.OR = [
      { sku:       { contains: q, mode: "insensitive" } },
      { ean:       { contains: q, mode: "insensitive" } },
      { descricao: { contains: q, mode: "insensitive" } },
    ];
  }
  if (f.brand) where.brand = f.brand;
  if (f.stock === "zero") where.stock = { lte: 0 };
  else if (f.stock === "low") where.stock = { gt: 0, lte: 5 };
  else if (f.stock === "in")  where.stock = { gt: 5 };
  if (f.active === "yes") where.active = true;
  else if (f.active === "no") where.active = false;
  return where;
}

export async function POST(req: Request) {
  const csrf = assertSameOrigin(req);
  if (csrf) return csrf;
  const rl = await assertRateLimit(req, "other-brand-bulk", 30, 60_000);
  if (rl) return rl;

  const staff = await currentStaff();
  const role = staff?.role;
  if (role !== "ADMIN" && role !== "LOJA_VNG") return bad("apenas ADMIN e LOJA_VNG", 403);
  const userId = staff?.id ?? null;

  let body: Body;
  try { body = (await req.json()) as Body; }
  catch { return bad("bad json"); }

  const { action } = body;
  if (action !== "pvp" && action !== "active") return bad("action inválida (pvp | active)");

  // Resolve target ids ------
  let ids: string[];
  if (Array.isArray(body.ids) && body.ids.length > 0) {
    ids = body.ids.filter((x): x is string => typeof x === "string");
  } else if (body.filter && typeof body.filter === "object") {
    const rows = await prisma.otherBrandItem.findMany({
      where: buildWhere(body.filter),
      select: { id: true },
      take: MAX_TARGETS + 1,
    });
    ids = rows.map((r) => r.id);
  } else {
    return bad("indica ids ou um filtro");
  }
  if (ids.length === 0) return bad("nenhum artigo selecionado");
  if (ids.length > MAX_TARGETS) return bad(`demasiados artigos (máx ${MAX_TARGETS})`);

  const idList = Prisma.join(ids);
  let note = "";

  try {
    if (action === "active") {
      const v = !!body.active;
      await prisma.otherBrandItem.updateMany({ where: { id: { in: ids } }, data: { active: v } });
      note = v ? "activados" : "desactivados";
    } else {
      // pvp
      const mode = body.pvp?.mode ?? "set";
      if (mode === "set") {
        const c = body.pvp?.priceCents;
        if (typeof c !== "number" || !Number.isFinite(c) || c < 0 || !Number.isInteger(c)) {
          return bad("priceCents inválido");
        }
        await prisma.otherBrandItem.updateMany({
          where: { id: { in: ids } },
          data: { pvpCents: Math.round(c) },
        });
        note = `PVP = ${(Math.round(c) / 100).toFixed(2)}€`;
      } else {
        const pct = body.pvp?.percent;
        if (typeof pct !== "number" || !Number.isFinite(pct) || pct <= -100 || pct > 500) {
          return bad("percentagem inválida");
        }
        const factor = 1 + pct / 100;
        // Raw SQL para aplicar a percentagem por linha em uma única query.
        // Ignora rows com pvpCents NULL (não faz sentido aplicar % a "sem preço").
        await prisma.$executeRaw`
          UPDATE "OtherBrandItem"
          SET "pvpCents" = GREATEST(0, ROUND("pvpCents" * ${factor})),
              "updatedAt" = NOW()
          WHERE "id" IN (${idList}) AND "pvpCents" IS NOT NULL`;
        note = `PVP ${pct > 0 ? "+" : ""}${pct}%`;
      }
    }

    await prisma.adminAction.create({
      data: {
        userId,
        entityType: "OTHER_BRAND_BULK",
        action: "BULK_UPDATE",
        entityId: action,
        note: `${ids.length} artigos · ${note}`,
        after: { action, count: ids.length, note } as object,
      },
    });

    return NextResponse.json({ ok: true, affected: ids.length, note });
  } catch (e) {
    return safeError(e, "bulk update failed");
  }
}
