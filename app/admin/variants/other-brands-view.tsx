import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";
import { EmptyState } from "@/components/admin/empty-state";
import { IconSearch } from "@/components/admin/icons";
import { OBSelectionProvider, OBSelectionToolbar, OBSelectAllCheckbox } from "./other-brand-selection";
import { OtherBrandRow } from "./other-brand-row";
import { ArticleImportButton } from "@/components/admin/article-import";

const PAGE_SIZE = 50;

interface Props {
  role: "ADMIN" | "LOJA_LIS" | "LOJA_VNG";
  q: string;
  brand: string;
  stock: string;
  active: string; // "" | "yes" | "no"
  sort: string;
  page: number;
}

// Vista das marcas não-Dupont vendidas só em V.N. de Gaia (Lamy, Kaweco,
// Filofax, Parker, …). Editável em linha para ADMIN + LOJA_VNG; LOJA_LIS
// nem chega aqui (o tab está escondido para esse role).
//
// Sync inicial vem do ficheiro ECI VNG via /api/admin/sync/eci.
// A partir daí a edição é directa: inline por linha, bulk multi-select,
// e "+ Criar artigos" (import Excel) para linhas que ainda não vieram do ECI.
export async function OtherBrandsView({ role, q, brand, stock, active, sort, page }: Props) {
  const canEdit = role === "ADMIN" || role === "LOJA_VNG";

  const where: Prisma.OtherBrandItemWhereInput = {};
  if (q) {
    where.OR = [
      { sku:       { contains: q, mode: "insensitive" } },
      { ean:       { contains: q, mode: "insensitive" } },
      { descricao: { contains: q, mode: "insensitive" } },
    ];
  }
  if (brand) where.brand = brand;
  if (stock === "zero") where.stock = { lte: 0 };
  else if (stock === "low")  where.stock = { gt: 0, lte: 5 };
  else if (stock === "in")   where.stock = { gt: 5 };
  if (active === "yes") where.active = true;
  else if (active === "no") where.active = false;

  const orderBy: Prisma.OtherBrandItemOrderByWithRelationInput =
    sort === "sku"       ? { sku: "asc" } :
    sort === "brand"     ? { brand: "asc" } :
    sort === "pvp-asc"   ? { pvpCents: "asc" } :
    sort === "pvp-desc"  ? { pvpCents: "desc" } :
    sort === "stock-asc" ? { stock: "asc" } :
                            { updatedAt: "desc" };

  const [total, rows, brands, totalItems, outOfStock, lowStock, inactiveCount, valuedStock] = await Promise.all([
    prisma.otherBrandItem.count({ where }),
    prisma.otherBrandItem.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.otherBrandItem.groupBy({
      by: ["brand"],
      _count: { _all: true },
      orderBy: { brand: "asc" },
    }),
    prisma.otherBrandItem.count(),
    prisma.otherBrandItem.count({ where: { stock: { lte: 0 }, active: true } }),
    prisma.otherBrandItem.count({ where: { stock: { gt: 0, lte: 5 }, active: true } }),
    prisma.otherBrandItem.count({ where: { active: false } }),
    prisma.otherBrandItem.findMany({
      where: { stock: { gt: 0 }, pvpCents: { not: null }, active: true },
      select: { stock: true, pvpCents: true },
    }).then((rs) => rs.reduce((s, r) => s + (r.stock * (r.pvpCents ?? 0)), 0)),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasFilters = q || brand || stock || active;

  if (page > totalPages && total > 0) {
    const params = buildParams({ q, brand, stock, active, sort, page: totalPages });
    redirect(`/admin/variants?${params.toString()}`);
  }

  function pageHref(target: number) {
    const params = buildParams({ q, brand, stock, active, sort, page: target });
    return `/admin/variants?${params.toString()}`;
  }

  const brandOptions: [string, string][] = [["", `Todas (${brands.length})`]];
  for (const b of brands) brandOptions.push([b.brand, `${b.brand} · ${b._count._all}`]);

  const pageIds = rows.map((r) => r.id);

  return (
    <OBSelectionProvider
      pageIds={canEdit ? pageIds : []}
      totalFiltered={total}
      filter={{ q, brand, stock, active }}
    >
      <div className="space-y-6">
        {/* KPIs em cima. Se o utilizador pode editar, mostra também "+ Novo artigo". */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
            <KpiCard n={totalItems.toLocaleString("pt-PT")} label="Artigos" />
            <KpiCard n={outOfStock.toLocaleString("pt-PT")} label="Esgotados" tone={outOfStock > 0 ? "text-[#b94a3a]" : undefined} />
            <KpiCard n={lowStock.toLocaleString("pt-PT")} label="Stock baixo (≤5)" tone={lowStock > 0 ? "text-[#7e5e00]" : undefined} />
            <KpiCard n={(valuedStock / 100).toLocaleString("pt-PT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })} label="Valor total (PVP)" />
          </div>
          {canEdit && (
            <div className="flex flex-col items-end gap-1">
              <ArticleImportButton
                endpoint="/api/admin/other-brand/import"
                title="Criar artigos · Outras marcas"
                label="+ Criar artigos"
                columns={["REF", "MARCA", "DESCRICAO", "EAN (opc)", "PVP (opc)", "STOCK (opc)"]}
                notes={[
                  "REF já existente faz update em vez de duplicar.",
                  "Só toca nas linhas do ficheiro — o resto fica intacto.",
                  "Usa a REF do ECI VNG para não duplicar na próxima sincronia.",
                ]}
              />
              {inactiveCount > 0 && (
                <span className="text-[0.62rem] tracking-[0.1em] text-muted uppercase">
                  {inactiveCount} inactivos escondidos por defeito
                </span>
              )}
            </div>
          )}
        </div>

        <form method="get" className="space-y-3 border border-line bg-paper p-5">
          <input type="hidden" name="tab" value="outras" />

          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
              <IconSearch className="h-4 w-4" />
            </span>
            <input
              name="q"
              defaultValue={q}
              placeholder="Pesquisa por Ref, EAN ou descrição — LY1200152, ROLLER…"
              className="w-full border border-line bg-paper py-2.5 pl-10 pr-3 text-sm outline-none focus:border-gold"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Field name="brand" label="Marca" defaultValue={brand} options={brandOptions} />
            <Field name="stock" label="Stock" defaultValue={stock} options={[
              ["", "Todos"], ["zero", "Esgotado (=0)"], ["low", "Baixo (≤5)"], ["in", "Disponível (>5)"],
            ]} />
            <Field name="active" label="Estado" defaultValue={active} options={[
              ["", "Todos"], ["yes", "Só activos"], ["no", "Só inactivos"],
            ]} />
            <Field name="sort" label="Ordenar" defaultValue={sort} options={[
              ["updated", "Recentes"], ["brand", "Marca A–Z"], ["sku", "Ref A–Z"], ["pvp-desc", "PVP ↓"], ["pvp-asc", "PVP ↑"], ["stock-asc", "Stock ↑"],
            ]} />
            <div className="flex items-end">
              <button type="submit" className="w-full bg-ink px-5 py-2.5 text-xs tracking-[0.2em] text-cream uppercase transition-colors hover:bg-gold hover:text-ink">
                Filtrar
              </button>
            </div>
          </div>

          {hasFilters && (
            <div className="flex justify-end">
              <Link href="/admin/variants?tab=outras" className="text-[0.65rem] tracking-[0.18em] text-muted uppercase transition-colors hover:text-gold">
                Limpar filtros
              </Link>
            </div>
          )}
        </form>

        {canEdit && <OBSelectionToolbar />}

        <div className="text-[0.72rem] text-muted">
          {total.toLocaleString("pt-PT")} artigos{total > PAGE_SIZE ? ` · página ${page} / ${totalPages}` : ""}
        </div>

        <div className="overflow-x-auto border border-line bg-paper">
          <table className="min-w-full text-sm">
            <thead className="bg-cream/50 text-[0.6rem] tracking-[0.16em] text-muted uppercase">
              <tr className="border-b border-line">
                {canEdit && (
                  <th className="w-10 px-3 py-3 text-center font-medium">
                    <OBSelectAllCheckbox />
                  </th>
                )}
                <th className="px-4 py-3 text-left font-medium">Marca</th>
                <th className="px-4 py-3 text-left font-medium">EAN</th>
                <th className="px-4 py-3 text-left font-medium">Ref</th>
                <th className="px-4 py-3 text-left font-medium">Descrição</th>
                <th className="px-4 py-3 text-right font-medium">PVP</th>
                <th className="px-4 py-3 text-right font-medium">Stock VNG</th>
                <th className="px-4 py-3 text-center font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/70">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 8 : 7}>
                    <EmptyState
                      title={hasFilters ? "Sem resultados" : "Sem artigos"}
                      body={hasFilters
                        ? "Alarga os filtros ou limpa-os."
                        : "Sincroniza o Excel ECI VNG em Importar Ficheiros ou usa \"+ Criar artigos\"."}
                      action={hasFilters ? (
                        <Link href="/admin/variants?tab=outras" className="border-b border-ink pb-0.5 text-[0.65rem] tracking-[0.18em] text-ink uppercase hover:border-gold hover:text-gold">
                          Limpar filtros
                        </Link>
                      ) : null}
                    />
                  </td>
                </tr>
              ) : (
                rows.map((it) => (
                  <OtherBrandRow
                    key={it.id}
                    id={it.id}
                    role={role}
                    sku={it.sku}
                    brand={it.brand}
                    ean={it.ean}
                    descricao={it.descricao}
                    pvpCents={it.pvpCents}
                    stock={it.stock}
                    active={it.active}
                    updatedAt={it.updatedAt.toISOString()}
                  />
                ))
              )}
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
    </OBSelectionProvider>
  );
}

function buildParams(o: { q: string; brand: string; stock: string; active: string; sort: string; page: number }) {
  const params = new URLSearchParams({ tab: "outras" });
  if (o.q) params.set("q", o.q);
  if (o.brand) params.set("brand", o.brand);
  if (o.stock) params.set("stock", o.stock);
  if (o.active) params.set("active", o.active);
  if (o.sort && o.sort !== "updated") params.set("sort", o.sort);
  if (o.page > 1) params.set("page", String(o.page));
  return params;
}

function KpiCard({ n, label, tone }: { n: string; label: string; tone?: string }) {
  return (
    <div className="border border-line bg-paper p-4">
      <p className={`font-serif text-2xl leading-none tabular-nums ${tone ?? "text-ink"}`}>{n}</p>
      <p className="mt-2 text-[0.55rem] tracking-[0.12em] text-muted uppercase">{label}</p>
    </div>
  );
}

function Field({ name, label, defaultValue, options }: { name: string; label: string; defaultValue?: string; options: [string, string][] }) {
  return (
    <label className="block">
      <span className="overline mb-1.5 block text-[0.55rem] text-muted">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue ?? ""}
        className="w-full border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-gold"
      >
        {options.map(([value, lbl]) => (
          <option key={value} value={value}>{lbl}</option>
        ))}
      </select>
    </label>
  );
}
