import { NextResponse } from "next/server";
import { currentStaff } from "@/lib/admin-auth";
import { assertRateLimit } from "@/lib/admin-api";
import { isStaffRole, type BoutiqueCode } from "@/lib/pos";
import { saleLines, dayWindow } from "@/lib/pos-reports";
import { buildDailySalesWorkbook } from "@/lib/report-export";

export const dynamic = "force-dynamic";

function boutiquesForRole(role: string | null): BoutiqueCode[] {
  if (role === "LOJA_LIS") return ["LIS"];
  if (role === "LOJA_VNG") return ["VNG"];
  return ["LIS", "VNG"];
}

// GET /api/admin/reports/export?date=YYYY-MM-DD  → the day's sales as an .xlsx
// laid out like the ECI Mov_POS_Loja sheet (same formulas + formatting).
// Scoped by role (store logins get only their boutique; ADMIN gets both).
export async function GET(req: Request) {
  const rl = await assertRateLimit(req, "report-export", 30, 60_000);
  if (rl) return rl;

  const staff = await currentStaff();
  if (!isStaffRole(staff?.role)) return NextResponse.json({ ok: false }, { status: 404 });
  const boutiques = boutiquesForRole(staff?.role ?? null);

  const dateParam = new URL(req.url).searchParams.get("date");
  let day: Date;
  if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    const [y, m, d] = dateParam.split("-").map(Number);
    day = new Date(y, m - 1, d);
  } else {
    day = new Date();
  }
  if (Number.isNaN(day.getTime())) {
    return NextResponse.json({ ok: false, error: "bad date" }, { status: 400 });
  }

  const { from, to } = dayWindow(day);
  const lines = await saleLines(boutiques, from, to);
  const buf = await buildDailySalesWorkbook(day, boutiques, lines);

  const ymd = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
  return new NextResponse(new Uint8Array(buf), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="relatorio-vendas-${ymd}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
