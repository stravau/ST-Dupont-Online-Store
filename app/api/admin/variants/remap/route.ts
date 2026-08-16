import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { assertRateLimit, assertSameOrigin, safeError } from "@/lib/admin-api";
import { invalidarCatalogo } from "@/lib/catalog-cache";

export const dynamic = "force-dynamic";

// POST /api/admin/variants/remap — liga uma variante do saco
// `unmapped-inventory` a um produto real do catálogo (ou desliga-a de volta
// para o saco, com productSlug = "unmapped-inventory").
//
// É só mudar o productId: o stock, o EAN, o PVP e o histórico ficam onde
// estão. A partir daí a variante herda a página, as fotos e a categoria do
// produto novo, e passa a aparecer no site.
//
// ADMIN apenas — é uma decisão de catálogo, não de operação de loja.
export async function POST(req: Request) {
  const csrf = assertSameOrigin(req);
  if (csrf) return csrf;
  const rl = await assertRateLimit(req, "variant-remap", 60, 60_000);
  if (rl) return rl;

  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  let body: Record<string, unknown>;
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 }); }

  const sku = typeof body.sku === "string" ? body.sku.trim() : "";
  const productSlug = typeof body.productSlug === "string" ? body.productSlug.trim() : "";
  if (!sku || !productSlug) {
    return NextResponse.json({ ok: false, error: "sku e productSlug obrigatórios" }, { status: 400 });
  }

  // Cor opcional. Sem ela a variante entra no produto sem etiqueta nem
  // swatch, identificada só pela REF — que é o que faltava para estes artigos
  // ficarem completos depois de ligados.
  const corLabel = typeof body.corLabel === "string" ? body.corLabel.trim().slice(0, 40) : "";
  const corHex = Array.isArray(body.corHex)
    ? (body.corHex as unknown[]).filter((h): h is string => typeof h === "string" && /^#[0-9a-fA-F]{6}$/.test(h)).slice(0, 2)
    : [];

  try {
    const [variant, product] = await Promise.all([
      prisma.productVariant.findUnique({
        where: { sku },
        select: { id: true, sku: true, status: true, active: true, attributes: true, product: { select: { slug: true } } },
      }),
      prisma.product.findUnique({ where: { slug: productSlug }, select: { id: true, slug: true, active: true } }),
    ]);
    if (!variant) return NextResponse.json({ ok: false, error: `variante ${sku} não existe` }, { status: 404 });
    if (!product) return NextResponse.json({ ok: false, error: `produto ${productSlug} não existe` }, { status: 404 });
    if (variant.product?.slug === productSlug) {
      return NextResponse.json({ ok: false, error: "já está ligada a esse produto" }, { status: 409 });
    }

    const paraOSaco = productSlug === "unmapped-inventory";

    await prisma.$transaction(async (tx) => {
      // A cor entra no `attributes`, ao lado do que lá estiver (finish, type).
      // Substituir o objecto todo apagaria esses outros eixos.
      const attrs = (variant.attributes as Record<string, unknown> | null) ?? {};
      const attrsNovos =
        corLabel && corHex.length > 0
          ? { ...attrs, color: { label: { pt: corLabel, en: corLabel }, hex: corHex } }
          : attrs;

      await tx.productVariant.update({
        where: { id: variant.id },
        data: {
          productId: product.id,
          ...(corLabel && corHex.length > 0 ? { attributes: attrsNovos as object } : {}),
          // Ao sair do saco a variante tem de ficar publicável, senão muda de
          // pai e continua invisível — que era o problema que viemos resolver.
          // A voltar para o saco faz-se o inverso.
          ...(paraOSaco
            ? { active: false, status: "INDISPONIVEL" as const }
            : { active: true, status: variant.status === "DESCONTINUADO" ? variant.status : ("DISPONIVEL" as const) }),
        },
      });
      await tx.adminAction.create({
        data: {
          userId: gate.userId ?? null,
          entityType: "VARIANT",
          action: "REMAP",
          entityId: variant.sku,
          note: `${variant.product?.slug ?? "?"} → ${productSlug}`,
          before: { productSlug: variant.product?.slug ?? null, active: variant.active, status: variant.status } as object,
          after: { productSlug, active: !paraOSaco } as object,
        },
      });
    });

    invalidarCatalogo();
    return NextResponse.json({ ok: true, slug: productSlug });
  } catch (e) {
    return safeError(e);
  }
}
