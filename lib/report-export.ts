// Builds the daily sales report as an .xlsx that mirrors the ECI control
// workbook's "Mov_POS_Loja" sheet — same columns, the same live formulas
// (Valor Vend = QTD·PVP·(1−Desc%), V.Rec = Valor Vend / 1,23), plus a totals
// block with the ECI 19% commission. Styled in the Maison palette (ink header,
// gold accents) so it reads as a proper report, not a raw dump.
import ExcelJS from "exceljs";
import { VAT_DIVISOR, ECI_COMMISSION_RATE, type BoutiqueCode } from "@/lib/pos";
import type { SaleLine } from "@/lib/pos-reports";

const INK = "FF1A1712";
const CREAM = "FFF7F4EC";
const GOLD = "FF9C7A26";
const LINE = "FFE6DECC";
const RED = "FFB94A3A";

const HEADERS = ["DATA", "MÊS", "HORA", "V/D", "Op.", "EAN", "QTD", "REF", "DESCRIÇÃO", "PVP", "Desc %", "Valor Vend", "V.Rec"];
const WIDTHS = [12, 6, 8, 6, 7, 16, 6, 15, 40, 11, 9, 13, 13];
const MONEY = "#,##0.00";

export const BOUTIQUE_NAME: Record<BoutiqueCode, string> = { LIS: "Lisboa", VNG: "V. N. de Gaia" };

function hhmm(d: Date): string {
  return d.toLocaleTimeString("pt-PT", { timeZone: "Europe/Lisbon", hour: "2-digit", minute: "2-digit" });
}

export async function buildDailySalesWorkbook(
  day: Date,
  boutiques: BoutiqueCode[],
  lines: SaleLine[],
): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "S.T. Dupont · Painel";
  wb.created = day;
  const ws = wb.addWorksheet("Mov_POS_Loja", {
    views: [{ state: "frozen", ySplit: 2 }],
    properties: { defaultRowHeight: 16 },
  });

  WIDTHS.forEach((w, i) => (ws.getColumn(i + 1).width = w));

  // Row 1 — title band.
  ws.mergeCells(1, 1, 1, HEADERS.length);
  const dLabel = day.toLocaleDateString("pt-PT", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
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

    row.getCell(1).value = new Date(Date.UTC(day.getFullYear(), day.getMonth(), day.getDate(), 12));
    row.getCell(1).numFmt = "dd/mm/yyyy";
    row.getCell(2).value = { formula: `MONTH(A${r})`, result: day.getMonth() + 1 };
    row.getCell(3).value = hhmm(l.soldAt);
    row.getCell(3).alignment = { horizontal: "center" };
    row.getCell(4).value = isReturn ? "D" : "V";
    row.getCell(4).alignment = { horizontal: "center" };
    if (isReturn) row.getCell(4).font = { bold: true, color: { argb: RED } };
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

    row.eachCell((c) => {
      c.border = { bottom: { style: "hair", color: { argb: LINE } } };
      if (!c.font) c.font = { size: 9 };
    });
    r++;
  }

  const lastData = r - 1;
  const hasRows = lastData >= 3;

  // Totals block.
  const totalRow = ws.getRow(r + 1);
  totalRow.getCell(9).value = "TOTAL DO DIA";
  totalRow.getCell(9).font = { bold: true };
  totalRow.getCell(9).alignment = { horizontal: "right" };
  totalRow.getCell(12).value = hasRows ? { formula: `SUM(L3:L${lastData})` } : 0;
  totalRow.getCell(13).value = hasRows ? { formula: `SUM(M3:M${lastData})` } : 0;
  for (const col of [12, 13]) {
    totalRow.getCell(col).numFmt = MONEY;
    totalRow.getCell(col).font = { bold: true };
    totalRow.getCell(col).border = { top: { style: "thin", color: { argb: INK } } };
  }

  const eciRow = ws.getRow(r + 2);
  eciRow.getCell(9).value = `Comissão ECI (${Math.round(ECI_COMMISSION_RATE * 100)}%)`;
  eciRow.getCell(9).alignment = { horizontal: "right" };
  eciRow.getCell(9).font = { color: { argb: GOLD } };
  eciRow.getCell(13).value = { formula: `M${r + 1}*${ECI_COMMISSION_RATE}` };
  eciRow.getCell(13).numFmt = MONEY;
  eciRow.getCell(13).font = { color: { argb: GOLD } };

  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}
