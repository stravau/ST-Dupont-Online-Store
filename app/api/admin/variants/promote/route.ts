import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { assertRateLimit, assertSameOrigin, safeError } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

// POST /api/admin/variants/promote — cria um produto NOVO a partir de uma
// variante sem ficha e move-a para lá.
//
// A outra metade do /remap: nem tudo o que está no saco pertence a um produto
// existente. Um Line D Vitruvian não é uma cor de nenhum produto do catálogo —
// é uma linha que nunca foi criada. Para esses, ligar não serve; é preciso
// nascer a página.
//
// Fica publicado mas SEM fotografia — a foto não vem do Excel. Aparece no site
// com o placeholder até alguém carregar a imagem em /admin/variants/[sku]/images.

function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 60);
}

export async function POST(req: Request) {
  const csrf = assertSameOrigin(req);
  if (csrf) return csrf;
  const rl = await assertRateLimit(req, "variant-promote", 40, 60_000);
  if (rl) return rl;

  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  let body: Record<string, unknown>;
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 }); }

  const sku = typeof body.sku === "string" ? body.sku.trim() : "";
  const nome = typeof body.nome === "string" ? body.nome.trim() : "";
  const categorySlug = typeof body.categorySlug === "string" ? body.categorySlug.trim() : "";
  const collection = typeof body.collection === "string" ? body.collection.trim() : "";
  if (!sku || !nome || !categorySlug) {
    return NextResponse.json({ ok: false, error: "sku, nome e categoria são obrigatórios" }, { status: 400 });
  }

  try {
    const [variant, category] = await Promise.all([
      prisma.productVariant.findUnique({
        where: { sku },
        select: { id: true, sku: true, images: true, product: { select: { slug: true } } },
      }),
      prisma.category.findUnique({ where: { slug: categorySlug }, select: { id: true } }),
    ]);
    if (!variant) return NextResponse.json({ ok: false, error: `variante ${sku} não existe` }, { status: 404 });
    if (!category) return NextResponse.json({ ok: false, error: `categoria ${categorySlug} não existe` }, { status: 404 });

    // Slug único: o nome pode repetir-se entre variantes da mesma linha, e o
    // slug é chave. Junta-se a REF quando já existe.
    const base = slugify(nome) || `artigo-${sku.toLowerCase()}`;
    let slug = base;
    if (await prisma.product.findUnique({ where: { slug }, select: { id: true } })) {
      slug = `${base}-${slugify(sku)}`.slice(0, 60);
    }

    const created = await prisma.$transaction(async (tx) => {
      const p = await tx.product.create({
        data: {
          slug,
          name: { pt: nome, en: nome },
          description: { pt: "", en: "" },
          collection: collection || "",
          categoryId: category.id,
          // Publicado — o objectivo do exercício é sair da invisibilidade.
          // Sem fotografia ainda; o site mostra o placeholder até haver uma.
          active: true,
          featured: false,
          image: variant.images?.[0] ?? null,
        },
        select: { id: true, slug: true },
      });
      await tx.productVariant.update({
        where: { id: variant.id },
        data: { productId: p.id, active: true, status: "DISPONIVEL" },
      });
      await tx.adminAction.create({
        data: {
          userId: gate.userId ?? null,
          entityType: "PRODUCT",
          action: "CREATE",
          entityId: p.slug,
          note: `Produto criado a partir da variante ${sku} (estava em ${variant.product?.slug ?? "?"})`,
          after: { slug: p.slug, nome, categorySlug, collection, sku } as object,
        },
      });
      return p;
    });

    return NextResponse.json({ ok: true, slug: created.slug });
  } catch (e) {
    return safeError(e);
  }
}
