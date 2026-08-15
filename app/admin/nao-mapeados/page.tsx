import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { currentStaff } from "@/lib/admin-auth";
import { AdminHero } from "@/components/admin/admin-hero";
import { EmptyState } from "@/components/admin/empty-state";
import { RemapTable, type UnmappedRow, type ProductOption, type CategoryOption } from "./remap-table";
import { criarSugeridor } from "@/lib/remap-suggest";
import { corDaDescricao } from "@/lib/cor-from-desc";

export const dynamic = "force-dynamic";

// Artigos que existem no stock mas não têm página no site — vivem no produto
// oculto `unmapped-inventory`. Esta página serve para os ligar ao produto
// certo do catálogo, que é o que os põe online.
//
// Ordenados por VALOR de stock parado (unidades × PVP), não por unidades: um
// Line D de 1650€ pesa mais do que oito pedras de sílex, e é por onde se deve
// começar.


export default async function NaoMapeadosPage() {
  const staff = await currentStaff();
  if (staff?.role !== "ADMIN") redirect("/admin/pos");

  const [unmapped, products, cats] = await Promise.all([
    prisma.productVariant.findMany({
      where: { product: { slug: "unmapped-inventory" } },
      select: {
        sku: true, ean: true, name: true, priceCents: true,
        stockLis: true, stockVng: true,
      },
    }),
    prisma.product.findMany({
      where: { slug: { not: "unmapped-inventory" } },
      select: { slug: true, name: true, collection: true, category: { select: { slug: true } } },
      orderBy: { slug: "asc" },
    }),
    prisma.category.findMany({ select: { slug: true, name: true }, orderBy: { slug: "asc" } }),
  ]);

  const pt = (j: unknown) => {
    const n = j as { pt?: string; en?: string } | null;
    return n?.pt ?? n?.en ?? "";
  };

  const options: ProductOption[] = products.map((p) => ({
    slug: p.slug,
    label: pt(p.name) || p.slug,
    collection: p.collection ?? "",
    category: p.category?.slug ?? "",
  }));

  // O slug entra no texto indexado: muitas vezes carrega o nome do modelo em
  // inglês quando o nome PT não o repete (slug slimmy, nome Isqueiro).
  const sugerir = criarSugeridor(
    products.map((p) => ({
      slug: p.slug,
      texto: [pt(p.name), p.collection ?? "", p.slug.replace(/-/g, " ")].join(" "),
    })),
  );

  const categories: CategoryOption[] = cats.map((c) => ({ slug: c.slug, label: pt(c.name) || c.slug }));

  const rows: UnmappedRow[] = unmapped
    .map((v) => {
      const desc = pt(v.name) || v.sku;
      const stock = (v.stockLis ?? 0) + (v.stockVng ?? 0);
      const sug = sugerir(desc);
      // A cor vem da descrição do ECI, que é a fonte fiável: nas malas Victoria
      // a REF 1VI333BE1 parecia bege pelo sufixo mas o EAN confirmou a
      // descrição, que dizia preta.
      const cor = corDaDescricao(desc);
      return {
        sku: v.sku,
        ean: v.ean,
        desc,
        priceCents: v.priceCents,
        stockLis: v.stockLis ?? 0,
        stockVng: v.stockVng ?? 0,
        suggestion: sug?.slug ?? null,
        corLabel: cor?.label ?? null,
        corHex: cor?.hex ?? null,
        valorCents: stock * v.priceCents,
      };
    })
    .sort((a, b) => b.valorCents - a.valorCents);

  const comStock = rows.filter((r) => r.stockLis + r.stockVng > 0);
  const semStock = rows.length - comStock.length;
  const valorTotal = comStock.reduce((s, r) => s + r.valorCents, 0);
  const unidades = comStock.reduce((s, r) => s + r.stockLis + r.stockVng, 0);

  return (
    <div>
      <AdminHero
        compact
        eyebrow="Catálogo"
        title="Artigos sem ficha"
        subtitle="Existem no stock mas não têm página no site. Liga cada um ao produto certo para passarem a aparecer."
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="admin-hero-card p-4">
            <p className="overline text-[0.55rem] text-gold-soft">Com stock</p>
            <p className="hero-number mt-2 text-3xl">{comStock.length}</p>
            <p className="mt-1 text-[0.72rem] text-cream/70">{unidades} unidades</p>
          </div>
          <div className="admin-hero-card border-l-[3px] border-l-gold p-4">
            <p className="overline text-[0.55rem] text-gold">Valor parado</p>
            <p className="hero-number mt-2 text-3xl">
              {(valorTotal / 100).toLocaleString("pt-PT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}
            </p>
            <p className="mt-1 text-[0.72rem] text-cream/70">stock que ninguém encontra no site</p>
          </div>
          <div className="admin-hero-card p-4">
            <p className="overline text-[0.55rem] text-gold-soft">Sem stock</p>
            <p className="hero-number mt-2 text-3xl">{semStock}</p>
            <p className="mt-1 text-[0.72rem] text-cream/70">podem esperar</p>
          </div>
        </div>
      </AdminHero>

      {comStock.length === 0 ? (
        <EmptyState title="Nada por ligar" body="Todos os artigos com stock têm ficha no site." />
      ) : (
        <RemapTable rows={comStock} options={options} categories={categories} />
      )}
    </div>
  );
}
