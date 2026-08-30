import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";
import { currentStaff } from "@/lib/admin-auth";
import { assertRateLimit } from "@/lib/admin-api";
import { isStaffRole } from "@/lib/pos";
import { boutiquesForRole } from "@/components/admin/boutique-scope";
import { buildMovementsWorkbook, type MovementRow } from "@/lib/movements-export";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// GET /api/admin/movimentos/export?q=&type=&from=&to=
//
// O livro de movimentos em Excel, com OS MESMOS filtros que estão no ecrã —
// a pesquisa, o tipo e o intervalo de datas. Exportar sempre tudo seria menos
// útil e mais pesado: quem carrega no botão quer levar o que está a ver.
//
// A única diferença para o ecrã é a paginação: a tabela mostra 50 de cada vez,
// o ficheiro leva a selecção inteira até ao tecto abaixo.
//
// Aberto aos três roles de staff, e cada um só leva as lojas que já pode ver
// no painel — a mesma regra do histórico, aplicada aqui outra vez em vez de
// confiar no que o cliente mandar.
const TETO = 20_000;

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
const BOUTIQUE_LABEL: Record<string, string> = { LIS: "Lisboa", VNG: "V. N. Gaia" };

const isYmd = (s: string | null): s is string => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);

export async function GET(req: Request) {
  const rl = await assertRateLimit(req, "movimentos-export", 20, 60_000);
  if (rl) return rl;

  const staff = await currentStaff();
  if (!isStaffRole(staff?.role ?? null)) return NextResponse.json({ ok: false }, { status: 404 });
  const boutiques = boutiquesForRole(staff?.role ?? null);

  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const tipoBruto = url.searchParams.get("type") ?? "";
  const tipo = TYPE_LABEL[tipoBruto] ? tipoBruto : "";
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  // Mesmo `where` do histórico. Se um dia divergirem, o ficheiro deixa de
  // corresponder ao que o ecrã mostra e ninguém percebe porquê.
  const where: Prisma.StockMovementWhereInput = { boutique: { in: boutiques } };
  if (tipo) where.type = tipo as Prisma.StockMovementWhereInput["type"];
  if (q) {
    where.OR = [
      { sku: { contains: q, mode: "insensitive" } },
      { ean: { contains: q, mode: "insensitive" } },
      { note: { contains: q, mode: "insensitive" } },
    ];
  }
  if (isYmd(from) || isYmd(to)) {
    const movedAt: Prisma.DateTimeFilter = {};
    if (isYmd(from)) {
      const [y, m, d] = from.split("-").map(Number);
      movedAt.gte = new Date(y, m - 1, d, 0, 0, 0, 0);
    }
    // O "até" inclui o dia inteiro, senão de 01 a 01 não devolvia nada.
    if (isYmd(to)) {
      const [y, m, d] = to.split("-").map(Number);
      movedAt.lte = new Date(y, m - 1, d, 23, 59, 59, 999);
    }
    where.movedAt = movedAt;
  }

  const rows = await prisma.stockMovement.findMany({
    where,
    orderBy: { movedAt: "desc" },
    take: TETO,
    select: {
      movedAt: true, boutique: true, sku: true, ean: true, type: true,
      quantity: true, note: true,
      operator: { select: { initials: true } },
      variant: { select: { name: true, product: { select: { name: true } } } },
    },
  });

  const pt = (v: unknown) => {
    const o = v as { pt?: string; en?: string } | null;
    return o?.pt ?? o?.en ?? "";
  };

  const linhas: MovementRow[] = rows.map((m) => {
    const produto = pt(m.variant?.product?.name);
    const variante = pt(m.variant?.name);
    return {
      movedAt: m.movedAt,
      boutique: BOUTIQUE_LABEL[m.boutique] ?? m.boutique,
      tipo: TYPE_LABEL[m.type] ?? m.type,
      sku: m.sku,
      ean: m.ean,
      // A variante costuma já trazer o nome do produto no início; repetir os
      // dois dava "Isqueiro Twiggy — Preto · Isqueiro Twiggy — Preto".
      descricao: variante || produto || "",
      quantity: m.quantity,
      operador: m.operator?.initials ?? "",
      nota: m.note ?? "",
    };
  });

  // O que apareceu na faixa de título do ficheiro. Sem isto, um livro
  // filtrado é indistinguível de um livro completo daqui a três meses.
  const partes: string[] = [];
  if (boutiques.length === 1) partes.push(BOUTIQUE_LABEL[boutiques[0]] ?? boutiques[0]);
  if (tipo) partes.push(TYPE_LABEL[tipo]);
  if (isYmd(from) || isYmd(to)) {
    partes.push(`${isYmd(from) ? from : "início"} a ${isYmd(to) ? to : "hoje"}`);
  }
  if (q) partes.push(`pesquisa "${q}"`);
  if (rows.length === TETO) partes.push(`primeiras ${TETO} linhas`);

  const buf = await buildMovementsWorkbook(linhas, partes.join(" · "), new Date());
  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "content-disposition": `attachment; filename="movimentos-${stamp}.xlsx"`,
      "cache-control": "no-store",
    },
  });
}
