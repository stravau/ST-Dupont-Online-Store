import { NextResponse } from "next/server";
import { currentStaff } from "@/lib/admin-auth";
import { assertRateLimit } from "@/lib/admin-api";
import { isStaffRole, type BoutiqueCode } from "@/lib/pos";
import { saleLines, rangeWindow } from "@/lib/pos-reports";
import { buildDailySalesWorkbook } from "@/lib/report-export";

export const dynamic = "force-dynamic";

function boutiquesForRole(role: string | null): BoutiqueCode[] {
  if (role === "LOJA_LIS") return ["LIS"];
  if (role === "LOJA_VNG") return ["VNG"];
  return ["LIS", "VNG"];
}

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
  const boutiques = boutiquesForRole(staff?.role ?? null);
  const showCommission = staff?.role === "ADMIN";

  const url = new URL(req.url);
  const legacyDate = url.searchParams.get("date");
  const now = new Date();
  const fromDate =
    parseYmd(url.searchParams.get("from")) ?? parseYmd(legacyDate) ?? now;
  const toDate = parseYmd(url.searchParams.get("to")) ?? fromDate;

  const { from, to } = rangeWindow(fromDate, toDate);
  const lines = await saleLines(boutiques, from, to);
  const buf = await buildDailySalesWorkbook({ from, to }, boutiques, lines, {
    showCommission,
  });

  const ymd = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const sameDay = ymd(fromDate) === ymd(toDate);
  const filename = sameDay
    ? `relatorio-vendas-${ymd(fromDate)}.xlsx`
    : `relatorio-vendas-${ymd(fromDate)}_${ymd(toDate)}.xlsx`;

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
