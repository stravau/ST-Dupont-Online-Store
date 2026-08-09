import { NextResponse } from "next/server";
import { currentStaff } from "@/lib/admin-auth";
import { assertRateLimit } from "@/lib/admin-api";
import { isStaffRole } from "@/lib/pos";
import { saleLines, soldProducts, rangeWindow } from "@/lib/pos-reports";
import { buildDailySalesWorkbook, buildSoldProductsWorkbook } from "@/lib/report-export";
import { boutiquesForRole, resolveScope } from "@/components/admin/boutique-scope";

export const dynamic = "force-dynamic";

const YMD = /^\d{4}-\d{2}-\d{2}$/;
function parseYmd(s: string | null): Date | null {
  if (!s || !YMD.test(s)) return null;
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

// GET /api/admin/reports/export?from=YYYY-MM-DD&to=YYYY-MM-DD
//   (or legacy ?date=YYYY-MM-DD for backward compatibility)
// → the window's sales as an .xlsx laid out like the ECI Mov_POS_Loja
// sheet (same formulas + formatting). Scoped by role (store logins
// get only their boutique; ADMIN gets both). Commission block only
// for ADMIN — LOJA_* callers never see the fee.
export async function GET(req: Request) {
  const rl = await assertRateLimit(req, "report-export", 30, 60_000);
  if (rl) return rl;

  const staff = await currentStaff();
  if (!isStaffRole(staff?.role)) return NextResponse.json({ ok: false }, { status: 404 });
  const showCommission = staff?.role === "ADMIN";

  const url = new URL(req.url);
  // ?boutique=LIS|VNG restringe o ficheiro a uma loja. resolveScope intersecta
  // com o que o role permite, portanto um LOJA_LIS não exporta Gaia pedindo
  // ?boutique=VNG à mão.
  const { boutiques } = resolveScope(
    url.searchParams.get("boutique") ?? undefined,
    boutiquesForRole(staff?.role ?? null),
  );
  const legacyDate = url.searchParams.get("date");
  const now = new Date();
  const fromDate =
    parseYmd(url.searchParams.get("from")) ?? parseYmd(legacyDate) ?? now;
  const toDate = parseYmd(url.searchParams.get("to")) ?? fromDate;

  const { from, to } = rangeWindow(fromDate, toDate);
  // ?modo=produtos → ranking por artigo (REF · descrição · qtd · valor, com
  // total). Sem o parâmetro mantém-se o movimento linha-a-linha de sempre,
  // para os links antigos não mudarem de comportamento.
  const modo = url.searchParams.get("modo");
  const buf =
    modo === "produtos"
      ? await buildSoldProductsWorkbook({ from, to }, boutiques, await soldProducts(boutiques, from, to))
      : await buildDailySalesWorkbook({ from, to }, boutiques, await saleLines(boutiques, from, to), {
          showCommission,
        });

  const ymd = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const sameDay = ymd(fromDate) === ymd(toDate);
  // Sufixo da loja quando o export é de uma só — sem ele, exportar Lisboa e
  // depois Gaia do mesmo dia dava dois ficheiros com o mesmo nome e o segundo
  // aparecia como "(1)" na pasta de downloads.
  const suffix = boutiques.length === 1 ? `-${boutiques[0].toLowerCase()}` : "";
  const base = modo === "produtos" ? "produtos-vendidos" : "relatorio-vendas";
  const filename = sameDay
    ? `${base}-${ymd(fromDate)}${suffix}.xlsx`
    : `${base}-${ymd(fromDate)}_${ymd(toDate)}${suffix}.xlsx`;

  return new NextResponse(new Uint8Array(buf), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
