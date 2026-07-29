import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentStaff } from "@/lib/admin-auth";
import { assertRateLimit, assertSameOrigin, safeError } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

// POST /api/admin/other-brand  — cria um novo OtherBrandItem manualmente
// (fora do fluxo de import ECI). A REF é fornecida pelo utilizador —
// não geramos automaticamente, para não colidir com uma futura sincronia
// do ECI que traga a mesma linha.
//
// Acesso: ADMIN e LOJA_VNG.

type Body = {
  ref?: string;      // → sku
  brand?: string;
  ean?: string;
  descricao?: string;
  pvpCents?: number | null;
  stock?: number;
};

function bad(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status });
}

export async function POST(req: Request) {
  const csrf = assertSameOrigin(req);
  if (csrf) return csrf;
  const rl = await assertRateLimit(req, "other-brand-create", 30, 60_000);
  if (rl) return rl;

  const staff = await currentStaff();
  const role = staff?.role;
  if (role !== "ADMIN" && role !== "LOJA_VNG") {
    return bad("apenas ADMIN e LOJA_VNG podem criar", 403);
  }
  const userId = staff?.id ?? null;

  let body: Body;
  try { body = (await req.json()) as Body; }
  catch { return bad("bad json"); }

  const ref = String(body.ref ?? "").trim();
  if (!ref) return bad("REF obrigatório");
  if (ref.length > 60) return bad("REF demasiado longo (máx 60)");

  const brand = String(body.brand ?? "").trim().toUpperCase();
  if (!brand) return bad("marca obrigatória");
  if (brand.length > 60) return bad("marca demasiado longa (máx 60)");

  const descricao = String(body.descricao ?? "").trim();
  if (!descricao) return bad("descrição obrigatória");
  if (descricao.length > 500) return bad("descrição demasiado longa (máx 500)");

  const ean = body.ean == null || body.ean === "" ? null : String(body.ean).trim();
  if (ean && !/^\d{8}$|^\d{13}$/.test(ean)) return bad("EAN inválido (8 ou 13 dígitos)");

  const pvpCents = body.pvpCents == null ? null : Number(body.pvpCents);
  if (pvpCents !== null && (!Number.isFinite(pvpCents) || pvpCents < 0 || !Number.isInteger(pvpCents))) {
    return bad("PVP inválido");
  }

  const stock = body.stock == null ? 0 : Number(body.stock);
  if (!Number.isFinite(stock) || stock < 0 || !Number.isInteger(stock)) return bad("stock inválido");

  // Collision checks — retornamos mensagens claras em vez do erro Prisma.
  const dupRef = await prisma.otherBrandItem.findUnique({
    where: { sku: ref },
    select: { brand: true, descricao: true },
  });
  if (dupRef) {
    return NextResponse.json({
      ok: false,
      error: `Já existe um artigo com REF "${ref}" (${dupRef.brand} · ${dupRef.descricao}). Se queres editar, procura na tabela.`,
    }, { status: 409 });
  }
  if (ean) {
    const dupEan = await prisma.otherBrandItem.findUnique({
      where: { ean },
      select: { sku: true, brand: true },
    });
    if (dupEan) {
      return NextResponse.json({
        ok: false,
        error: `EAN "${ean}" já em uso por ${dupEan.brand} · ${dupEan.sku}.`,
      }, { status: 409 });
    }
  }

  try {
    const item = await prisma.otherBrandItem.create({
      data: { sku: ref, brand, ean, descricao, pvpCents, stock, active: true },
    });
    await prisma.adminAction.create({
      data: {
        userId,
        entityType: "OTHER_BRAND_ITEM",
        action: "CREATE",
        entityId: item.sku,
        after: {
          sku: item.sku, brand: item.brand, ean: item.ean,
          descricao: item.descricao, pvpCents: item.pvpCents, stock: item.stock,
        } as object,
      },
    });
    return NextResponse.json({ ok: true, item });
  } catch (e) {
    return safeError(e, "create failed");
  }
}
