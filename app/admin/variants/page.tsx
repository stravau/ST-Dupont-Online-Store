import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";
import { VariantRow } from "./row-client";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

interface SearchProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
    stock?: string;      // "zero" | "low" | "in"
    ean?: string;        // "missing" | "present"
    promo?: string;      // "active"
    unmapped?: string;   // "only" | "exclude"
    sort?: string;       // updated | sku | pvp-asc | pvp-desc | stock-asc
    page?: string;
  }>;
}

export default async function AdminVariantsPage({ searchParams }: SearchProps) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const status = sp.status;
  const stock = sp.stock;
  const ean = sp.ean;
  const promo = sp.promo;
  const unmapped = sp.unmapped;
  const sort = sp.sort ?? "updated";
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  // Build a Prisma where{} from the URL-driven filter state.
  const where: Prisma.ProductVariantWhereInput = {};
  if (q) {
    where.OR = [
      { sku:  { contains: q, mode: "insensitive" } },
      { ean:  { contains: q, mode: "insensitive" } },
      // Localized JSON fields don't support `contains` on Postgres without
      // a raw cast; SKU + EAN are the common ID columns and cover most use.
    ];
  }
  if (status === "DISPONIVEL" || status === "INDISPONIVEL" || status === "DESCONTINUADO") {
    where.status = status;
  }
  if (stock === "zero") where.stock = { lte: 0 };
  else if (stock === "low") where.stock = { gt: 0, lte: 5 };
  else if (stock === "in") where.stock = { gt: 5 };
  if (ean === "missing") where.ean = null;
  else if (ean === "present") where.ean = { not: null };
  if (promo === "active") {
    where.promoEndDate = { gte: new Date() };
  }
  if (unmapped === "only") where.product = { slug: "unmapped-inventory" };
  else if (unmapped === "exclude") where.product = { slug: { not: "unmapped-inventory" } };

  const orderBy: Prisma.ProductVariantOrderByWithRelationInput =
    sort === "sku"       ? { sku: "asc" } :
    sort === "pvp-asc"   ? { priceCents: "asc" } :
    sort === "pvp-desc"  ? { priceCents: "desc" } :
    sort === "stock-asc" ? { stock: "asc" } :
                            { updatedAt: "desc" };

  const [total, rows] = await Promise.all([
    prisma.productVariant.count({ where }),
    prisma.productVariant.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        product: { select: { slug: true, name: true, categoryId: true, category: { select: { slug: true, name: true } } } },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageHref(target: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    if (stock) params.set("stock", stock);
    if (ean) params.set("ean", ean);
    if (promo) params.set("promo", promo);
    if (unmapped) params.set("unmapped", unmapped);
    if (sort && sort !== "updated") params.set("sort", sort);
    if (target > 1) params.set("page", String(target));
    const qs = params.toString();
    return `/admin/variants${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="overline text-gold">Artigos</p>
          <h1 className="mt-2 font-serif text-3xl">Lista editável</h1>
          <p className="mt-2 text-sm text-muted">
            {total.toLocaleString("pt-PT")} variants · página {page} / {totalPages}
          </p>
        </div>
        <Link href="/admin/uploads" className="border border-line bg-paper px-4 py-2.5 text-xs tracking-[0.2em] text-ink uppercase transition-colors hover:border-gold hover:text-gold">
          Uploads Excel →
        </Link>
      </header>

      {/* Search + filter bar — every control updates the URL via GET so
          state survives reload + Back / Forward navigation. */}
      <form method="get" className="grid gap-3 border border-line bg-paper p-4 lg:grid-cols-[1fr_repeat(5,auto)_auto] lg:items-end">
        <label className="block lg:col-span-1">
          <span className="overline mb-1 block text-[0.55rem] text-muted">Pesquisa (SKU ou EAN)</span>
          <input
            name="q"
            defaultValue={q}
            placeholder="STD000430, 3597390000118…"
            className="w-full border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-gold"
          />
        </label>

        <label className="block">
          <span className="overline mb-1 block text-[0.55rem] text-muted">Status</span>
          <select name="status" defaultValue={status ?? ""} className="border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-gold">
            <option value="">Todos</option>
            <option value="DISPONIVEL">Disponíveis</option>
            <option value="INDISPONIVEL">Indisponíveis</option>
            <option value="DESCONTINUADO">Descontinuados</option>
          </select>
        </label>

        <label className="block">
          <span className="overline mb-1 block text-[0.55rem] text-muted">Stock</span>
          <select name="stock" defaultValue={stock ?? ""} className="border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-gold">
            <option value="">Todos</option>
            <option value="zero">Esgotado (=0)</option>
            <option value="low">Baixo (≤5)</option>
            <option value="in">Disponível (&gt;5)</option>
          </select>
        </label>

        <label className="block">
          <span className="overline mb-1 block text-[0.55rem] text-muted">EAN</span>
          <select name="ean" defaultValue={ean ?? ""} className="border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-gold">
            <option value="">Todos</option>
            <option value="missing">Sem EAN</option>
            <option value="present">Com EAN</option>
          </select>
        </label>

        <label className="block">
          <span className="overline mb-1 block text-[0.55rem] text-muted">Promoção</span>
          <select name="promo" defaultValue={promo ?? ""} className="border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-gold">
            <option value="">Todas</option>
            <option value="active">Em promoção</option>
          </select>
        </label>

        <label className="block">
          <span className="overline mb-1 block text-[0.55rem] text-muted">Mapeamento</span>
          <select name="unmapped" defaultValue={unmapped ?? ""} className="border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-gold">
            <option value="">Todos</option>
            <option value="only">Só não-mapeados</option>
            <option value="exclude">Excluir não-mapeados</option>
          </select>
        </label>

        <label className="block">
          <span className="overline mb-1 block text-[0.55rem] text-muted">Ordenar</span>
          <select name="sort" defaultValue={sort} className="border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-gold">
            <option value="updated">Recentes</option>
            <option value="sku">SKU A–Z</option>
            <option value="pvp-desc">PVP descendente</option>
            <option value="pvp-asc">PVP ascendente</option>
            <option value="stock-asc">Stock crescente</option>
          </select>
        </label>

        <button type="submit" className="bg-ink px-5 py-2.5 text-xs tracking-[0.2em] text-cream uppercase hover:bg-gold hover:text-ink">Filtrar</button>
      </form>

      <div className="overflow-x-auto border border-line bg-paper">
        <table className="min-w-full text-sm">
          <thead className="bg-cream/60 text-[0.6rem] tracking-[0.16em] text-muted uppercase">
            <tr>
              <th className="px-3 py-3 text-left">EAN</th>
              <th className="px-3 py-3 text-left">REF</th>
              <th className="px-3 py-3 text-left">Descrição</th>
              <th className="px-3 py-3 text-right">PVP</th>
              <th className="px-3 py-3 text-left">Status</th>
              <th className="px-3 py-3 text-right">Stock</th>
              <th className="px-3 py-3 text-left">Produto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/70">
            {rows.length === 0 && (
              <tr><td colSpan={7} className="px-3 py-12 text-center text-sm text-muted">Sem resultados.</td></tr>
            )}
            {rows.map((v) => {
              const productName =
                (v.product?.name as { pt?: string; en?: string } | null)?.pt ??
                (v.product?.name as { pt?: string; en?: string } | null)?.en ??
                "—";
              const variantName =
                (v.name as { pt?: string; en?: string } | null)?.pt ??
                (v.name as { pt?: string; en?: string } | null)?.en ??
                v.sku;
              return (
                <VariantRow
                  key={v.id}
                  id={v.id}
                  sku={v.sku}
                  ean={v.ean}
                  desc={variantName}
                  priceCents={v.priceCents}
                  status={v.status}
                  stock={v.stock}
                  productName={productName}
                  productSlug={v.product?.slug ?? ""}
                />
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs">
          {page > 1 ? (
            <Link href={pageHref(page - 1)} className="border border-line bg-paper px-3 py-2 tracking-[0.18em] uppercase hover:border-gold">← Anterior</Link>
          ) : <span />}
          <span className="text-muted">Página {page} de {totalPages}</span>
          {page < totalPages ? (
            <Link href={pageHref(page + 1)} className="border border-line bg-paper px-3 py-2 tracking-[0.18em] uppercase hover:border-gold">Seguinte →</Link>
          ) : <span />}
        </div>
      )}
    </div>
  );
}
