import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";
import { currentStaff } from "@/lib/admin-auth";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/admin/empty-state";
import { IconSearch } from "@/components/admin/icons";
import { StockTabs, type StockTab } from "@/components/admin/stock-tabs";
import { VariantRow } from "./row-client";
import { OtherBrandsView } from "./other-brands-view";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

interface SearchProps {
  searchParams: Promise<{
    tab?: string;
    q?: string;
    status?: string;
    stock?: string;
    ean?: string;
    promo?: string;
    unmapped?: string;
    published?: string;
    brand?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function AdminVariantsPage({ searchParams }: SearchProps) {
  const staff = await currentStaff();
  const rawRole = staff?.role;
  // Default to ADMIN locally (no session) so the page is testable in
  // dev without seeding a user; in prod the proxy gate already
  // enforces one of the three valid roles before the page renders.
  const role: "ADMIN" | "LOJA_LIS" | "LOJA_VNG" =
    rawRole === "LOJA_LIS" || rawRole === "LOJA_VNG" ? rawRole : "ADMIN";
  const sp = await searchParams;
  const tab: StockTab = sp.tab === "outras" ? "outras" : "stdupont";
  const q = (sp.q ?? "").trim();
  const status = sp.status;
  const stock = sp.stock;
  const ean = sp.ean;
  const promo = sp.promo;
  const unmapped = sp.unmapped;
  const published = sp.published;
  const brand = (sp.brand ?? "").trim();
  const sort = sp.sort ?? "updated";
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  // Only ADMIN + LOJA_VNG can see the "Outras marcas" tab — LOJA_LIS has no
  // non-Dupont inventory to inspect, so we hide the tab and force them back
  // to the S.T. Dupont view if they land on ?tab=outras via a stale bookmark.
  const showOutras = role === "ADMIN" || role === "LOJA_VNG";
  const activeTab: StockTab = tab === "outras" && showOutras ? "outras" : "stdupont";

  // Short-circuit: if the boss picked the Outras Marcas tab, delegate the
  // filtering / listing to OtherBrandsView so the two views stay decoupled
  // (they share no filter shape — different table, different facets).
  if (activeTab === "outras") {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Catálogo"
          title="Consultar Stock"
          subtitle="Vista analítica das marcas vendidas em V. N. de Gaia (sem ligação ao site)."
        />
        <StockTabs active="outras" showOutras />
        <OtherBrandsView q={q} brand={brand} stock={stock ?? ""} sort={sort} page={page} />
      </div>
    );
  }

  const where: Prisma.ProductVariantWhereInput = {};
  if (q) {
    where.OR = [
      { sku: { contains: q, mode: "insensitive" } },
      { ean: { contains: q, mode: "insensitive" } },
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
  // "Publicação" — variant that would appear in the store. Published means
  // active, has a real product mapping (not the unmapped bucket), and isn't
  // marked DESCONTINUADO. Not published = the inverse. Composed via AND so
  // it doesn't clobber any earlier status/product/OR clauses the operator
  // may have combined with it.
  const publishedAnd: Prisma.ProductVariantWhereInput[] = [];
  if (published === "yes") {
    publishedAnd.push(
      { active: true },
      { NOT: { status: "DESCONTINUADO" } },
      { product: { slug: { not: "unmapped-inventory" } } },
    );
  } else if (published === "no") {
    publishedAnd.push({
      OR: [
        { active: false },
        { status: "DESCONTINUADO" },
        { product: { slug: "unmapped-inventory" } },
      ],
    });
  }
  if (publishedAnd.length) {
    const existing = where.AND ? (Array.isArray(where.AND) ? where.AND : [where.AND]) : [];
    where.AND = [...existing, ...publishedAnd];
  }

  const orderBy: Prisma.ProductVariantOrderByWithRelationInput =
    sort === "sku" ? { sku: "asc" } :
    sort === "pvp-asc" ? { priceCents: "asc" } :
    sort === "pvp-desc" ? { priceCents: "desc" } :
    sort === "stock-asc" ? { stock: "asc" } :
                            { updatedAt: "desc" };

  const [total, rows, kpi] = await Promise.all([
    prisma.productVariant.count({ where }),
    prisma.productVariant.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        product: { select: { slug: true, name: true } },
      },
    }),
    // Catalogue KPIs for the header cluster — always the full totals,
    // independent of the current filter, so the numbers are stable.
    Promise.all([
      prisma.productVariant.count(),
      prisma.productVariant.count({ where: { stock: { lte: 0 } } }),
      prisma.productVariant.count({ where: { status: "INDISPONIVEL" } }),
      prisma.productVariant.count({ where: { status: "DESCONTINUADO" } }),
      prisma.productVariant.count({ where: { promoEndDate: { gte: new Date() } } }),
      prisma.productVariant.count({ where: { product: { slug: "unmapped-inventory" } } }),
    ]).then(([variants, outOfStock, indisponiveis, descontinuados, withPromo, orphans]) => ({
      variants, outOfStock, indisponiveis, descontinuados, withPromo, orphans,
    })),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasFilters = q || status || stock || ean || promo || unmapped || published;

  // Builds a query string for the S.T. Dupont tab. `tab` is only echoed
  // when it differs from the default so the URL stays clean.
  function buildStdupontQs(overrides?: { page?: number }) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    if (stock) params.set("stock", stock);
    if (ean) params.set("ean", ean);
    if (promo) params.set("promo", promo);
    if (unmapped) params.set("unmapped", unmapped);
    if (published) params.set("published", published);
    if (sort && sort !== "updated") params.set("sort", sort);
    const p = overrides?.page ?? page;
    if (p > 1) params.set("page", String(p));
    return params.toString();
  }

  // Clamp page overflow — `?page=999` on a 2-page result previously
  // showed an "empty" page instead of clamping. Redirect to the last
  // real page so the admin lands on actual data.
  if (page > totalPages && total > 0) {
    const qs = buildStdupontQs({ page: totalPages });
    redirect(`/admin/variants${qs ? `?${qs}` : ""}`);
  }

  function pageHref(target: number) {
    const qs = buildStdupontQs({ page: target });
    return `/admin/variants${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catálogo"
        title="Consultar Stock"
        subtitle={`${total.toLocaleString("pt-PT")} variants${total > PAGE_SIZE ? ` · página ${page} / ${totalPages}` : ""}.`}
        action={<StockKpis counts={kpi} />}
      />

      <StockTabs active="stdupont" showOutras={showOutras} />

      <form method="get" className="space-y-3 border border-line bg-paper p-5">
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
            <IconSearch className="h-4 w-4" />
          </span>
          <input
            name="q"
            defaultValue={q}
            placeholder="Pesquisa por SKU ou EAN — STD000430, 3597390000118…"
            className="w-full border border-line bg-paper py-2.5 pl-10 pr-3 text-sm outline-none focus:border-gold"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Publicação — Publicado / Não publicado / Todos. First filter the
              boss reaches for ("what's live on the site right now?"). */}
          <Field name="published" label="Publicação" defaultValue={published} options={[
            ["", "Todos"], ["yes", "Publicado no site"], ["no", "Não publicado"],
          ]} />
          <Field name="status" label="Status" defaultValue={status} options={[
            ["", "Todos"], ["DISPONIVEL", "Disponíveis"], ["INDISPONIVEL", "Indisponíveis"], ["DESCONTINUADO", "Descontinuados"],
          ]} />
          <Field name="stock"  label="Stock"  defaultValue={stock} options={[
            ["", "Todos"], ["zero", "Esgotado (=0)"], ["low", "Baixo (≤5)"], ["in", "Disponível (>5)"],
          ]} />
          <Field name="ean"    label="EAN"    defaultValue={ean} options={[
            ["", "Todos"], ["missing", "Sem EAN"], ["present", "Com EAN"],
          ]} />
          <Field name="promo"  label="Promoção" defaultValue={promo} options={[
            ["", "Todas"], ["active", "Em promoção"],
          ]} />
          <Field name="unmapped" label="Mapeamento" defaultValue={unmapped} options={[
            ["", "Todos"], ["only", "Só não-mapeados"], ["exclude", "Excluir não-mapeados"],
          ]} />
          <Field name="sort"  label="Ordenar" defaultValue={sort} options={[
            ["updated", "Recentes"], ["sku", "SKU A–Z"], ["pvp-desc", "PVP ↓"], ["pvp-asc", "PVP ↑"], ["stock-asc", "Stock ↑"],
          ]} />
        </div>

        <div className="flex items-center justify-between pt-1">
          <button type="submit" className="bg-ink px-5 py-2 text-xs tracking-[0.2em] text-cream uppercase transition-colors hover:bg-gold hover:text-ink">
            Filtrar
          </button>
          {hasFilters && (
            <Link href="/admin/variants" className="text-[0.65rem] tracking-[0.18em] text-muted uppercase transition-colors hover:text-gold">
              Limpar filtros
            </Link>
          )}
        </div>
      </form>

      <div className="overflow-x-auto border border-line bg-paper">
        <table className="min-w-full text-sm">
          <thead className="bg-cream/50 text-[0.6rem] tracking-[0.16em] text-muted uppercase">
            <tr className="border-b border-line">
              <th className="px-4 py-3 text-left font-medium">EAN</th>
              <th className="px-4 py-3 text-left font-medium">REF</th>
              <th className="px-4 py-3 text-left font-medium">Descrição</th>
              <th className="px-4 py-3 text-right font-medium">PVP</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Stk LIS</th>
              <th className="px-4 py-3 text-right font-medium">Stk VNG</th>
              <th className="px-4 py-3 text-right font-medium">Total</th>
              <th className="px-4 py-3 text-left font-medium">Produto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/70">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <EmptyState
                    title={hasFilters ? "Sem resultados" : "Sem artigos"}
                    body={hasFilters ? "Alarga os filtros ou limpa-os." : "Importa um Excel ou cria via /admin/uploads."}
                    action={hasFilters ? (
                      <Link href="/admin/variants" className="border-b border-ink pb-0.5 text-[0.65rem] tracking-[0.18em] text-ink uppercase hover:border-gold hover:text-gold">
                        Limpar filtros
                      </Link>
                    ) : null}
                  />
                </td>
              </tr>
            ) : (
              rows.map((v) => {
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
                    role={role}
                    sku={v.sku}
                    ean={v.ean}
                    desc={variantName}
                    priceCents={v.priceCents}
                    status={v.status}
                    stockLis={v.stockLis}
                    stockVng={v.stockVng}
                    updatedAt={v.updatedAt.toISOString()}
                    productName={productName}
                    productSlug={v.product?.slug ?? ""}
                  />
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

// Compact catalogue KPIs embedded in the header (right side). Each chip links
// to the matching filtered view. Wraps below the title on narrow screens.
function StockKpis({ counts }: {
  counts: { variants: number; outOfStock: number; indisponiveis: number; descontinuados: number; withPromo: number; orphans: number };
}) {
  const items: { n: number; label: string; href: string; tone?: string }[] = [
    { n: counts.variants, label: "Artigos", href: "/admin/variants" },
    { n: counts.outOfStock, label: "Esgotados", href: "/admin/variants?stock=zero", tone: counts.outOfStock > 0 ? "text-[#b94a3a]" : undefined },
    { n: counts.indisponiveis, label: "Indisp.", href: "/admin/variants?status=INDISPONIVEL", tone: counts.indisponiveis > 0 ? "text-[#7e5e00]" : undefined },
    { n: counts.descontinuados, label: "Descont.", href: "/admin/variants?status=DESCONTINUADO" },
    { n: counts.withPromo, label: "Promoção", href: "/admin/variants?promo=active" },
    { n: counts.orphans, label: "Não-map.", href: "/admin/variants?unmapped=only" },
  ];
  return (
    <div className="flex flex-wrap items-stretch divide-x divide-line overflow-hidden rounded-sm border border-line bg-paper">
      {items.map((it) => (
        <Link
          key={it.label}
          href={it.href}
          title={`Ver ${it.label.toLowerCase()}`}
          className="group px-3.5 py-1.5 text-center transition-colors hover:bg-cream/60"
        >
          <p className={`font-serif text-xl leading-none tabular-nums ${it.tone ?? "text-ink"}`}>{it.n.toLocaleString("pt-PT")}</p>
          <p className="mt-1 text-[0.52rem] tracking-[0.1em] text-muted uppercase group-hover:text-gold">{it.label}</p>
        </Link>
      ))}
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
