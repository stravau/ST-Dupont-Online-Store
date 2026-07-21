import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";
import { EmptyState } from "@/components/admin/empty-state";
import { IconSearch } from "@/components/admin/icons";

const PAGE_SIZE = 50;

interface Props {
  q: string;
  brand: string;
  stock: string;
  sort: string;
  page: number;
}

const eur = (c: number | null) =>
  c == null ? "—" : (c / 100).toLocaleString("pt-PT", { style: "currency", currency: "EUR" });

// Analytics-only view over OtherBrandItem — the non-Dupont brands sold only at
// V. N. Gaia (Lamy, Kaweco, Filofax, Parker, Pelikan, …). Populated from the
// ECI_VNG_Controlo Excel via `scripts/import-vng-other-brands.ts`; never linked
// to Product/Variant and never shown on the website.
export async function OtherBrandsView({ q, brand, stock, sort, page }: Props) {
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

  const orderBy: Prisma.OtherBrandItemOrderByWithRelationInput =
    sort === "sku"       ? { sku: "asc" } :
    sort === "brand"     ? { brand: "asc" } :
    sort === "pvp-asc"   ? { pvpCents: "asc" } :
    sort === "pvp-desc"  ? { pvpCents: "desc" } :
    sort === "stock-asc" ? { stock: "asc" } :
                            { updatedAt: "desc" };

  const [total, rows, brands, totalItems, outOfStock, lowStock, valuedStock] = await Promise.all([
    prisma.otherBrandItem.count({ where }),
    prisma.otherBrandItem.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    // Brand facet (for the dropdown) — always the full list, independent of
    // the current filter, so switching between brands is possible from any
    // filtered view. Uses `_count: { _all: true }` to match the rest of the
    // codebase (see lib/pos-reports.ts) — Prisma also accepts `_count: true`
    // but the return shape differs and I want the { _all } path everywhere.
    prisma.otherBrandItem.groupBy({
      by: ["brand"],
      _count: { _all: true },
      orderBy: { brand: "asc" },
    }),
    prisma.otherBrandItem.count(),
    prisma.otherBrandItem.count({ where: { stock: { lte: 0 } } }),
    prisma.otherBrandItem.count({ where: { stock: { gt: 0, lte: 5 } } }),
    // Rough valuation — Σ(stock × pvp) across the whole master (ignores filter),
    // in whole euros. Nulls in pvp count as 0 (unpriced item).
    prisma.otherBrandItem.findMany({
      where: { stock: { gt: 0 }, pvpCents: { not: null } },
      select: { stock: true, pvpCents: true },
    }).then((rs) => rs.reduce((s, r) => s + (r.stock * (r.pvpCents ?? 0)), 0)),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasFilters = q || brand || stock;

  if (page > totalPages && total > 0) {
    const params = new URLSearchParams({ tab: "outras" });
    if (q) params.set("q", q);
    if (brand) params.set("brand", brand);
    if (stock) params.set("stock", stock);
    if (sort && sort !== "updated") params.set("sort", sort);
    if (totalPages > 1) params.set("page", String(totalPages));
    redirect(`/admin/variants?${params.toString()}`);
  }

  function pageHref(target: number) {
    const params = new URLSearchParams({ tab: "outras" });
    if (q) params.set("q", q);
    if (brand) params.set("brand", brand);
    if (stock) params.set("stock", stock);
    if (sort && sort !== "updated") params.set("sort", sort);
    if (target > 1) params.set("page", String(target));
    return `/admin/variants?${params.toString()}`;
  }

  const brandOptions: [string, string][] = [["", `Todas (${brands.length})`]];
  for (const b of brands) brandOptions.push([b.brand, `${b.brand} · ${b._count._all}`]);

  return (
    <div className="space-y-6">
      {/* Analytics KPIs — inline strip so the boss sees the totals at a glance. */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard n={totalItems.toLocaleString("pt-PT")}          label="Artigos" />
        <KpiCard n={outOfStock.toLocaleString("pt-PT")}          label="Esgotados" tone={outOfStock > 0 ? "text-[#b94a3a]" : undefined} />
        <KpiCard n={lowStock.toLocaleString("pt-PT")}            label="Stock baixo (≤5)" tone={lowStock > 0 ? "text-[#7e5e00]" : undefined} />
        <KpiCard n={(valuedStock / 100).toLocaleString("pt-PT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })} label="Valor total (PVP)" />
      </div>

      <form method="get" className="space-y-3 border border-line bg-paper p-5">
        {/* Keep the tab context when submitting the form. */}
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

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field name="brand" label="Marca" defaultValue={brand} options={brandOptions} />
          <Field name="stock" label="Stock" defaultValue={stock} options={[
            ["", "Todos"], ["zero", "Esgotado (=0)"], ["low", "Baixo (≤5)"], ["in", "Disponível (>5)"],
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

      <div className="text-[0.72rem] text-muted">
        {total.toLocaleString("pt-PT")} artigos{total > PAGE_SIZE ? ` · página ${page} / ${totalPages}` : ""}
      </div>

      <div className="overflow-x-auto border border-line bg-paper">
        <table className="min-w-full text-sm">
          <thead className="bg-cream/50 text-[0.6rem] tracking-[0.16em] text-muted uppercase">
            <tr className="border-b border-line">
              <th className="px-4 py-3 text-left font-medium">Marca</th>
              <th className="px-4 py-3 text-left font-medium">EAN</th>
              <th className="px-4 py-3 text-left font-medium">Ref</th>
              <th className="px-4 py-3 text-left font-medium">Descrição</th>
              <th className="px-4 py-3 text-right font-medium">PVP</th>
              <th className="px-4 py-3 text-right font-medium">Stock VNG</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/70">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <EmptyState
                    title={hasFilters ? "Sem resultados" : "Sem artigos"}
                    body={hasFilters ? "Alarga os filtros ou limpa-os." : "Importa via scripts/import-vng-other-brands.ts."}
                    action={hasFilters ? (
                      <Link href="/admin/variants?tab=outras" className="border-b border-ink pb-0.5 text-[0.65rem] tracking-[0.18em] text-ink uppercase hover:border-gold hover:text-gold">
                        Limpar filtros
                      </Link>
                    ) : null}
                  />
                </td>
              </tr>
            ) : (
              rows.map((it) => {
                const stockTone = it.stock <= 0 ? "text-[#b94a3a]" : it.stock <= 5 ? "text-[#7e5e00]" : "text-ink";
                return (
                  <tr key={it.id} className="hover:bg-cream/40">
                    <td className="px-4 py-3 text-[0.72rem] tracking-[0.06em] text-muted uppercase whitespace-nowrap">{it.brand}</td>
                    <td className="px-4 py-3 tabular-nums text-[0.72rem] text-muted whitespace-nowrap">{it.ean ?? "—"}</td>
                    <td className="px-4 py-3 font-medium text-ink whitespace-nowrap">{it.sku}</td>
                    <td className="px-4 py-3 text-[0.82rem] text-ink">{it.descricao}</td>
                    <td className="px-4 py-3 text-right tabular-nums whitespace-nowrap">{eur(it.pvpCents)}</td>
                    <td className={`px-4 py-3 text-right tabular-nums whitespace-nowrap ${stockTone}`}>{it.stock}</td>
                  </tr>
                );
              })
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
  );
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
