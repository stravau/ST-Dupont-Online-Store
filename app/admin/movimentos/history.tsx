import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";
import { EmptyState } from "@/components/admin/empty-state";
import { BOUTIQUE_LABEL } from "@/components/admin/boutique-scope";
import type { BoutiqueCode } from "@/lib/pos";

// Histórico do livro de movimentos. Até aqui a página de Movimentos só
// mostrava a sessão actual — saía-se dela e desaparecia, enquanto a tabela
// StockMovement guardava milhares de linhas (as do sync ECI incluídas) que
// ninguém conseguia consultar. É este o livro que se quer abrir quando o
// stock não bate certo.

const PAGE_SIZE = 50;

const TYPE_LABEL: Record<string, string> = {
  ENTRADA: "Entrada",
  SAIDA: "Saída",
  VENDA: "Venda",
  DEVOLUCAO: "Devolução",
  DANIFICADO: "Danificado",
  STOCK_INICIAL: "Stock inicial",
  AJUSTE: "Ajuste",
  TRANSFER_IN: "Transf. entrada",
  TRANSFER_OUT: "Transf. saída",
};

export interface HistoryParams {
  q?: string;
  type?: string;
  from?: string;
  to?: string;
  page?: string;
}

const isYmd = (s: string | undefined): s is string => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);

export async function MovementHistory({
  boutiques,
  params,
}: {
  boutiques: BoutiqueCode[];
  params: HistoryParams;
}) {
  const q = (params.q ?? "").trim();
  const type = params.type && TYPE_LABEL[params.type] ? params.type : "";
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const where: Prisma.StockMovementWhereInput = { boutique: { in: boutiques } };
  if (type) where.type = type as Prisma.StockMovementWhereInput["type"];
  if (q) {
    where.OR = [
      { sku: { contains: q, mode: "insensitive" } },
      { ean: { contains: q, mode: "insensitive" } },
      { note: { contains: q, mode: "insensitive" } },
    ];
  }
  // O "até" inclui o dia inteiro — senão filtrar de 01 a 01 não devolvia nada.
  if (isYmd(params.from) || isYmd(params.to)) {
    const movedAt: Prisma.DateTimeFilter = {};
    if (isYmd(params.from)) {
      const [y, m, d] = params.from.split("-").map(Number);
      movedAt.gte = new Date(y, m - 1, d, 0, 0, 0, 0);
    }
    if (isYmd(params.to)) {
      const [y, m, d] = params.to.split("-").map(Number);
      movedAt.lte = new Date(y, m - 1, d, 23, 59, 59, 999);
    }
    where.movedAt = movedAt;
  }

  const [total, rows] = await Promise.all([
    prisma.stockMovement.count({ where }),
    prisma.stockMovement.findMany({
      where,
      orderBy: { movedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true, boutique: true, sku: true, ean: true, type: true,
        quantity: true, movedAt: true, note: true,
        operator: { select: { initials: true } },
        variant: { select: { name: true, product: { select: { name: true } } } },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const multi = boutiques.length > 1;
  const hasFilters = !!(q || type || isYmd(params.from) || isYmd(params.to));

  const qs = (over: Partial<HistoryParams>) => {
    const p = new URLSearchParams();
    const merged = { q, type, from: params.from, to: params.to, page: String(page), ...over };
    if (merged.q) p.set("q", merged.q);
    if (merged.type) p.set("type", merged.type);
    if (isYmd(merged.from)) p.set("from", merged.from);
    if (isYmd(merged.to)) p.set("to", merged.to);
    if (merged.page && merged.page !== "1") p.set("page", merged.page);
    const s = p.toString();
    return `/admin/movimentos${s ? `?${s}` : ""}#historico`;
  };

  // Exportar leva os MESMOS filtros do ecrã, mas nunca a página: a tabela
  // mostra 50 de cada vez, o ficheiro leva a selecção inteira.
  const hrefExport = (() => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (type) p.set("type", type);
    if (isYmd(params.from)) p.set("from", params.from);
    if (isYmd(params.to)) p.set("to", params.to);
    const s = p.toString();
    return `/api/admin/movimentos/export${s ? `?${s}` : ""}`;
  })();

  const dt = (d: Date) =>
    d.toLocaleString("pt-PT", {
      day: "2-digit", month: "2-digit", year: "2-digit",
      hour: "2-digit", minute: "2-digit",
    });

  const desc = (r: (typeof rows)[number]) => {
    const v = (r.variant?.name as { pt?: string; en?: string } | null) ?? null;
    const p = (r.variant?.product?.name as { pt?: string; en?: string } | null) ?? null;
    return [p?.pt ?? p?.en, v?.pt ?? v?.en].filter(Boolean).join(" ") || "—";
  };

  return (
    <section id="historico" className="mt-10">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-serif text-lg text-ink">Histórico de movimentos</h2>
        <span className="text-[0.62rem] tracking-[0.14em] text-muted uppercase tabular-nums">
          {total.toLocaleString("pt-PT")} registos
          {totalPages > 1 ? ` · página ${page} / ${totalPages}` : ""}
        </span>
      </div>

      <form method="get" action="/admin/movimentos" className="mt-4 grid gap-3 border border-line bg-paper p-4 sm:grid-cols-2 lg:grid-cols-5">
        <label className="block lg:col-span-2">
          <span className="overline mb-1.5 block text-[0.55rem] text-muted">Pesquisar</span>
          <input
            name="q"
            defaultValue={q}
            placeholder="REF, EAN ou nota…"
            className="w-full border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-gold"
          />
        </label>
        <label className="block">
          <span className="overline mb-1.5 block text-[0.55rem] text-muted">Tipo</span>
          <select name="type" defaultValue={type} className="w-full border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-gold">
            <option value="">Todos</option>
            {Object.entries(TYPE_LABEL).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="overline mb-1.5 block text-[0.55rem] text-muted">De</span>
          <input type="date" name="from" defaultValue={isYmd(params.from) ? params.from : ""} className="w-full border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-gold" />
        </label>
        <label className="block">
          <span className="overline mb-1.5 block text-[0.55rem] text-muted">Até</span>
          <input type="date" name="to" defaultValue={isYmd(params.to) ? params.to : ""} className="w-full border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-gold" />
        </label>
        <div className="flex flex-wrap items-end gap-3 sm:col-span-2 lg:col-span-5">
          <button type="submit" className="bg-ink px-5 py-2 text-xs tracking-[0.2em] text-cream uppercase transition-colors hover:bg-gold hover:text-ink">
            Filtrar
          </button>
          {hasFilters && (
            <Link href="/admin/movimentos#historico" className="text-[0.65rem] tracking-[0.18em] text-muted uppercase transition-colors hover:text-gold">
              Limpar
            </Link>
          )}
          {/* Encostado à direita, no fundo da caixa dos filtros: leva o que
              está filtrado, portanto o sítio dele é ao lado de quem filtra.
              <a> e não <Link> — isto devolve um ficheiro, não navega, e o
              Link tentava tratar a resposta como uma página. */}
          {total > 0 && (
            <a
              href={hrefExport}
              className="ml-auto border border-ink px-4 py-2 text-[0.65rem] tracking-[0.18em] text-ink uppercase transition-colors hover:bg-ink hover:text-cream"
            >
              Exportar Excel
            </a>
          )}
        </div>
      </form>

      <div className="mt-4 overflow-x-auto border border-line bg-paper">
        <table className="min-w-full text-sm">
          <thead className="bg-cream/50 text-[0.6rem] tracking-[0.16em] text-muted uppercase">
            <tr className="border-b border-line">
              <th className="px-4 py-3 text-left font-medium">Data</th>
              {multi && <th className="px-4 py-3 text-left font-medium">Loja</th>}
              <th className="px-4 py-3 text-left font-medium">Tipo</th>
              <th className="px-4 py-3 text-left font-medium">REF</th>
              <th className="px-4 py-3 text-left font-medium">Descrição</th>
              <th className="px-4 py-3 text-right font-medium">Qtd</th>
              <th className="px-4 py-3 text-left font-medium">Op.</th>
              <th className="px-4 py-3 text-left font-medium">Nota</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/70">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={multi ? 8 : 7}>
                  <EmptyState
                    title={hasFilters ? "Sem resultados" : "Sem movimentos"}
                    body={hasFilters ? "Alarga os filtros ou limpa-os." : "Regista entradas e saídas com o leitor acima."}
                  />
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="align-top">
                  <td className="px-4 py-2.5 tabular-nums whitespace-nowrap text-muted">{dt(r.movedAt)}</td>
                  {multi && <td className="px-4 py-2.5 whitespace-nowrap text-[0.75rem] text-muted">{BOUTIQUE_LABEL[r.boutique as BoutiqueCode]}</td>}
                  <td className="px-4 py-2.5 whitespace-nowrap text-[0.75rem]">{TYPE_LABEL[r.type] ?? r.type}</td>
                  <td className="px-4 py-2.5 font-mono text-[0.75rem] whitespace-nowrap text-ink">{r.sku}</td>
                  <td className="max-w-[22rem] px-4 py-2.5 text-[0.8rem] text-ink/90">{desc(r)}</td>
                  {/* Sinal explícito: o livro guarda quantidades com sinal e
                      ver "-2" vs "+2" é a leitura que interessa. */}
                  <td className={`px-4 py-2.5 text-right font-medium tabular-nums whitespace-nowrap ${r.quantity < 0 ? "text-[#b94a3a]" : "text-[#1f7a4d]"}`}>
                    {r.quantity > 0 ? `+${r.quantity}` : r.quantity}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-[0.72rem] whitespace-nowrap text-muted">{r.operator?.initials ?? "—"}</td>
                  <td className="max-w-[16rem] px-4 py-2.5 text-[0.72rem] text-muted">{r.note ?? ""}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-xs">
          {page > 1 ? (
            <Link href={qs({ page: String(page - 1) })} className="border border-line bg-paper px-3 py-2 tracking-[0.18em] uppercase hover:border-gold">← Anterior</Link>
          ) : <span />}
          <span className="text-muted">Página {page} de {totalPages}</span>
          {page < totalPages ? (
            <Link href={qs({ page: String(page + 1) })} className="border border-line bg-paper px-3 py-2 tracking-[0.18em] uppercase hover:border-gold">Seguinte →</Link>
          ) : <span />}
        </div>
      )}
    </section>
  );
}
