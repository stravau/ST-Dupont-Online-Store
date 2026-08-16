import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { assertRateLimit, assertSameOrigin, safeError } from "@/lib/admin-api";
import { invalidarCatalogo } from "@/lib/catalog-cache";

export const dynamic = "force-dynamic";

const MAX_ITEMS = 24;

// PUT /api/admin/home-carousel — grava a selecção INTEIRA de um rail.
// Body: { rail?: "DESTAQUES", skus: string[] }  (ordem = ordem no carrossel)
//
// Substitui tudo em vez de aceitar adições/remoções individuais: o cliente já
// tem a lista completa em mão, e um replace atómico não deixa estados
// meio-aplicados se o pedido falhar a meio.
export async function PUT(req: Request) {
  const csrf = assertSameOrigin(req);
  if (csrf) return csrf;
  const rl = await assertRateLimit(req, "home-carousel", 60, 60_000);
  if (rl) return rl;

  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 });
  }

  const rail = typeof body.rail === "string" && body.rail.trim() ? body.rail.trim() : "DESTAQUES";
  if (!Array.isArray(body.skus)) {
    return NextResponse.json({ ok: false, error: "skus tem de ser uma lista" }, { status: 400 });
  }
  // Dedup preservando a ordem — dois cartões do mesmo artigo no carrossel não
  // fazem sentido, e o índice único ([rail, sku]) rejeitaria na mesma.
  const seen = new Set<string>();
  const skus: string[] = [];
  for (const raw of body.skus) {
    if (typeof raw !== "string") continue;
    const s = raw.trim();
    if (!s || seen.has(s)) continue;
    seen.add(s);
    skus.push(s);
  }
  if (skus.length > MAX_ITEMS) {
    return NextResponse.json(
      { ok: false, error: `máximo ${MAX_ITEMS} artigos no carrossel` },
      { status: 400 },
    );
  }

  // Só aceita SKUs que existem mesmo — um erro de escrita ficaria gravado e
  // depois desaparecia em silêncio na home, sem se perceber porquê.
  if (skus.length > 0) {
    const found = await prisma.productVariant.findMany({
      where: { sku: { in: skus } },
      select: { sku: true },
    });
    const known = new Set(found.map((v) => v.sku));
    const unknown = skus.filter((s) => !known.has(s));
    if (unknown.length > 0) {
      return NextResponse.json(
        { ok: false, error: `REF não encontrada: ${unknown.slice(0, 5).join(", ")}` },
        { status: 400 },
      );
    }
  }

  try {
    await prisma.$transaction([
      prisma.homeCarouselItem.deleteMany({ where: { rail } }),
      prisma.homeCarouselItem.createMany({
        data: skus.map((sku, i) => ({ rail, sku, position: i })),
      }),
      prisma.adminAction.create({
        data: {
          userId: gate.userId,
          entityType: "HOME_CAROUSEL",
          action: "UPDATE",
          entityId: rail,
          note: `${skus.length} artigo(s) no carrossel`,
          after: { rail, skus } as object,
        },
      }),
    ]);
    invalidarCatalogo();
    return NextResponse.json({ ok: true, count: skus.length });
  } catch (e) {
    return safeError(e, "não consegui gravar o carrossel");
  }
}
