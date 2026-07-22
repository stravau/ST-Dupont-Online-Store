// Builds the sales report as an .xlsx that mirrors the ECI control
// workbook's "Mov_POS_Loja" sheet — same columns, the same live formulas
// (Valor Vend = QTD·PVP·(1−Desc%), V.Rec = Valor Vend / 1,23), plus a totals
// block with the per-boutique ECI commission (LIS 22%, VNG 19%). Styled in
// the Maison palette (ink header, gold accents) so it reads as a proper
// report, not a raw dump. The `showCommission` flag lets LOJA_* callers
// skip the commission block entirely — those roles never see the fee.
import ExcelJS from "exceljs";
import { VAT_DIVISOR, ECI_COMMISSION_RATE, type BoutiqueCode } from "@/lib/pos";
import type { SaleLine } from "@/lib/pos-reports";

const INK = "FF1A1712";
const CREAM = "FFF7F4EC";
const GOLD = "FF9C7A26";
const LINE = "FFE6DECC";
const RED = "FFB94A3A";

// V/D = "V" venda · "D" devolução · "R" reparação (pick-up). OBS carries the
// sale.note ("cartão turista", "cliente pediu factura", etc.).
const HEADERS = ["DATA", "MÊS", "HORA", "V/D", "Op.", "EAN", "QTD", "REF", "DESCRIÇÃO", "PVP", "Desc %", "Valor Vend", "V.Rec", "OBS"];
const WIDTHS = [12, 6, 8, 6, 7, 16, 6, 15, 40, 11, 9, 13, 13, 26];
const MONEY = "#,##0.00";

export const BOUTIQUE_NAME: Record<BoutiqueCode, string> = { LIS: "Lisboa", VNG: "V. N. de Gaia" };

function hhmm(d: Date): string {
  return d.toLocaleTimeString("pt-PT", { timeZone: "Europe/Lisbon", hour: "2-digit", minute: "2-digit" });
}

function ddmmyyyy(d: Date): string {
  return d.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export async function buildDailySalesWorkbook(
  range: { from: Date; to: Date },
  boutiques: BoutiqueCode[],
  lines: SaleLine[],
  opts: { showCommission?: boolean } = {},
): Promise<Buffer> {
  const showCommission = opts.showCommission !== false;
  const wb = new ExcelJS.Workbook();
  wb.creator = "S.T. Dupont · Painel";
  wb.created = range.from;
  const ws = wb.addWorksheet("Mov_POS_Loja", {
    views: [{ state: "frozen", ySplit: 2 }],
    properties: { defaultRowHeight: 16 },
  });

  WIDTHS.forEach((w, i) => (ws.getColumn(i + 1).width = w));

  // Row 1 — title band. Uses the full range so an export spanning
  // several days reads correctly (e.g. "01/07 → 15/07").
  ws.mergeCells(1, 1, 1, HEADERS.length);
  const sameDay = ddmmyyyy(range.from) === ddmmyyyy(range.to);
  const dLabel = sameDay
    ? range.from.toLocaleDateString("pt-PT", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })
    : `${ddmmyyyy(range.from)} → ${ddmmyyyy(range.to)}`;
  const where = boutiques.map((b) => BOUTIQUE_NAME[b]).join(" + ");
  const title = ws.getCell(1, 1);
  title.value = `S.T. DUPONT · Relatório de Vendas · ${dLabel} · ${where}`;
  title.font = { bold: true, size: 12, color: { argb: GOLD } };
  title.alignment = { vertical: "middle" };
  ws.getRow(1).height = 24;

  // Row 2 — header.
  const header = ws.getRow(2);
  header.values = HEADERS;
  header.height = 20;
  header.eachCell((c) => {
    c.font = { bold: true, size: 9, color: { argb: CREAM } };
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: INK } };
    c.alignment = { vertical: "middle", horizontal: "center" };
    c.border = { bottom: { style: "thin", color: { argb: INK } } };
  });

  // Data rows — one per sale line. Formulas reference the same columns as the
  // ECI sheet so a user can trust/audit them.
  let r = 3;
  for (const l of lines) {
    const row = ws.getRow(r);
    const gross = Math.round(l.quantity * l.unitPriceCents * (1 - l.discountPct)) / 100;
    const isReturn = l.type === "DEVOLUCAO";
    const isRepair = l.type === "REPARACAO";

    // Each row carries its OWN sale date (not the range endpoint) so a
    // multi-day export shows the correct calendar for each line.
    const soldAt = l.soldAt;
    row.getCell(1).value = new Date(Date.UTC(soldAt.getFullYear(), soldAt.getMonth(), soldAt.getDate(), 12));
    row.getCell(1).numFmt = "dd/mm/yyyy";
    row.getCell(2).value = { formula: `MONTH(A${r})`, result: soldAt.getMonth() + 1 };
    row.getCell(3).value = hhmm(l.soldAt);
    row.getCell(3).alignment = { horizontal: "center" };
    row.getCell(4).value = isReturn ? "D" : isRepair ? "R" : "V";
    row.getCell(4).alignment = { horizontal: "center" };
    if (isReturn) row.getCell(4).font = { bold: true, color: { argb: RED } };
    else if (isRepair) row.getCell(4).font = { bold: true, color: { argb: GOLD } };
    row.getCell(5).value = l.operator;
    row.getCell(5).alignment = { horizontal: "center" };
    row.getCell(6).value = l.ean ?? "";
    row.getCell(6).numFmt = "@"; // text, so 13-digit EANs don't go scientific
    row.getCell(7).value = l.quantity;
    row.getCell(7).alignment = { horizontal: "center" };
    row.getCell(8).value = l.sku;
    row.getCell(9).value = l.desc;
    row.getCell(10).value = l.unitPriceCents / 100;
    row.getCell(10).numFmt = MONEY;
    row.getCell(11).value = l.discountPct;
    row.getCell(11).numFmt = "0%";
    row.getCell(11).alignment = { horizontal: "center" };
    // Valor Vend — exact ECI formula.
    row.getCell(12).value = { formula: `IF(J${r}>0,G${r}*J${r}*(1-K${r}),0)`, result: gross };
    row.getCell(12).numFmt = MONEY;
    // V.Rec — net of 23% VAT.
    row.getCell(13).value = { formula: `L${r}/${VAT_DIVISOR}`, result: Math.round((gross / VAT_DIVISOR) * 100) / 100 };
    row.getCell(13).numFmt = MONEY;
    row.getCell(14).value = l.note ?? "";

    row.eachCell((c) => {
      c.border = { bottom: { style: "hair", color: { argb: LINE } } };
      if (!c.font) c.font = { size: 9 };
    });
    r++;
  }

  const lastData = r - 1;
  const hasRows = lastData >= 3;

  // Totals block.
  const totalLabel = sameDay ? "TOTAL DO DIA" : "TOTAL DO PERÍODO";
  const totalRow = ws.getRow(r + 1);
  totalRow.getCell(9).value = totalLabel;
  totalRow.getCell(9).font = { bold: true };
  totalRow.getCell(9).alignment = { horizontal: "right" };
  totalRow.getCell(12).value = hasRows ? { formula: `SUM(L3:L${lastData})` } : 0;
  totalRow.getCell(13).value = hasRows ? { formula: `SUM(M3:M${lastData})` } : 0;
  for (const col of [12, 13]) {
    totalRow.getCell(col).numFmt = MONEY;
    totalRow.getCell(col).font = { bold: true };
    totalRow.getCell(col).border = { top: { style: "thin", color: { argb: INK } } };
  }

  // Commission block — only when the caller is the boss (LOJA_*
  // roles never see the fee) and only when we have data. One row per
  // boutique in scope, each with its own contract rate — so a
  // combined boss export lists LIS at 22% and VNG at 19% separately.
  if (showCommission && hasRows) {
    let commissionRow = r + 2;
    for (const b of boutiques) {
      const rate = ECI_COMMISSION_RATE[b];
      // Sum only the V.Rec (col M) rows that belong to this boutique.
      // We can't reference boutique in-Excel cheaply, so we sum the
      // JS-side already-known lines for this store and drop the total
      // as a value (still styled as a formula-looking cell).
      const boutiqueNet = lines
        .filter((l) => l.boutique === b)
        .reduce((s, l) => {
          const gross = (l.quantity * l.unitPriceCents * (1 - l.discountPct)) / 100;
          const sign = l.type === "DEVOLUCAO" ? -1 : 1;
          return s + sign * (gross / VAT_DIVISOR);
        }, 0);
      const eci = ws.getRow(commissionRow);
      eci.getCell(9).value = `Comissão ECI · ${BOUTIQUE_NAME[b]} (${Math.round(rate * 100)}%)`;
      eci.getCell(9).alignment = { horizontal: "right" };
      eci.getCell(9).font = { color: { argb: GOLD } };
      eci.getCell(13).value = Math.round(boutiqueNet * rate * 100) / 100;
      eci.getCell(13).numFmt = MONEY;
      eci.getCell(13).font = { color: { argb: GOLD } };
      commissionRow++;
    }
  }

  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}
