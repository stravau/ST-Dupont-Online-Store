import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma/client";
import { currentStaff } from "@/lib/admin-auth";
import { assertRateLimit, assertSameOrigin, safeError } from "@/lib/admin-api";
import { buildVariantWhere, type VariantFilterParams } from "@/lib/variant-filter";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Bulk-apply from /admin/variants — one action over many variants at once, so
// the boss never edits promotions / prices / availability one by one. Target is
// EITHER an explicit id list (checkboxes) OR the current filter ("select all
// filtered"). ADMIN only; same-origin + rate-limited; writes one audit row.
//
// Actions:
//   promo  — set a promotion (percent off the PVP, or an explicit promo price)
//            with a start/end window; or remove it (promo: null).
//   pvp    — set a new PVP, or shift it by a percentage.
//   status — DISPONIVEL / INDISPONIVEL / DESCONTINUADO (active kept in sync).
const MAX_TARGETS = 5000; // whole catalogue is ~1.5k; this is a runaway guard.

type Body = {
  action?: "promo" | "pvp" | "status";
  ids?: unknown;
  filter?: VariantFilterParams;
  promo?: { mode?: "percent" | "price"; percent?: number; priceCents?: number; startDate?: string | null; endDate?: string } | null;
  pvp?: { mode?: "set" | "percent"; priceCents?: number; percent?: number };
  status?: string;
};

function bad(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status });
}

export async function POST(req: Request) {
  const csrf = assertSameOrigin(req);
  if (csrf) return csrf;
  const rl = await assertRateLimit(req, "variant-bulk", 30, 60_000);
  if (rl) return rl;

  const staff = await currentStaff();
  if (staff?.role !== "ADMIN") return bad("apenas o administrador pode editar", 403);
  const userId = staff.id ?? null;

  let body: Body;
  try { body = (await req.json()) as Body; }
  catch { return bad("bad json"); }

  const { action } = body;
  if (action !== "promo" && action !== "pvp" && action !== "status") return bad("action inválida");

  // ---- Resolve the target ids ----
  let ids: string[];
  if (Array.isArray(body.ids) && body.ids.length > 0) {
    ids = body.ids.filter((x): x is string => typeof x === "string");
  } else if (body.filter && typeof body.filter === "object") {
    const rows = await prisma.productVariant.findMany({
      where: buildVariantWhere(body.filter),
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
    if (action === "status") {
      const s = body.status;
      if (s !== "DISPONIVEL" && s !== "INDISPONIVEL" && s !== "DESCONTINUADO") return bad("status inválido");
      await prisma.productVariant.updateMany({
        where: { id: { in: ids } },
        // active mirrors status (same rule as the single-row PATCH).
        data: { status: s, active: s === "DISPONIVEL" },
      });
      note = `status → ${s}`;
    } else if (action === "pvp") {
      const mode = body.pvp?.mode ?? "set";
      if (mode === "set") {
        const c = body.pvp?.priceCents;
        if (typeof c !== "number" || !Number.isFinite(c) || c < 0) return bad("priceCents inválido");
        await prisma.productVariant.updateMany({
          where: { id: { in: ids } },
          data: { priceCents: Math.round(c), pvpStartDate: new Date() },
        });
        note = `PVP = ${(Math.round(c) / 100).toFixed(2)}€`;
      } else {
        const pct = body.pvp?.percent;
        if (typeof pct !== "number" || !Number.isFinite(pct) || pct <= -100 || pct > 500) return bad("percentagem inválida");
        const factor = 1 + pct / 100;
        // Per-row math (each PVP differs) in one statement.
        await prisma.$executeRaw`
          UPDATE "ProductVariant"
          SET "priceCents" = GREATEST(0, ROUND("priceCents" * ${factor})),
              "pvpStartDate" = NOW(), "updatedAt" = NOW()
          WHERE "id" IN (${idList})`;
        note = `PVP ${pct > 0 ? "+" : ""}${pct}%`;
      }
    } else {
      // promo
      if (body.promo === null) {
        await prisma.productVariant.updateMany({
          where: { id: { in: ids } },
          data: { promoPriceCents: null, promoStartDate: null, promoEndDate: null },
        });
        note = "promoção removida";
      } else {
        const promo = body.promo ?? {};
        const end = promo.endDate ? new Date(promo.endDate) : null;
        if (!end || Number.isNaN(end.getTime())) return bad("data de fim inválida");
        const start = promo.startDate ? new Date(promo.startDate) : new Date();
        if (Number.isNaN(start.getTime())) return bad("data de início inválida");
        if (end.getTime() <= start.getTime()) return bad("a data de fim tem de ser depois do início");

        if ((promo.mode ?? "percent") === "price") {
          const c = promo.priceCents;
          if (typeof c !== "number" || !Number.isFinite(c) || c < 0) return bad("preço promocional inválido");
          await prisma.productVariant.updateMany({
            where: { id: { in: ids } },
            data: { promoPriceCents: Math.round(c), promoStartDate: start, promoEndDate: end },
          });
          note = `promoção ${(Math.round(c) / 100).toFixed(2)}€`;
        } else {
          const pct = promo.percent;
          if (typeof pct !== "number" || !Number.isFinite(pct) || pct <= 0 || pct >= 100) return bad("desconto inválido (1–99%)");
          const factor = 1 - pct / 100;
          await prisma.$executeRaw`
            UPDATE "ProductVariant"
            SET "promoPriceCents" = GREATEST(0, ROUND("priceCents" * ${factor})),
                "promoStartDate" = ${start}, "promoEndDate" = ${end}, "updatedAt" = NOW()
            WHERE "id" IN (${idList})`;
          note = `promoção −${pct}%`;
        }
      }
    }

    await prisma.adminAction.create({
      data: {
        userId,
        entityType: "VARIANT_BULK",
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
