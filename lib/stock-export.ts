// Exportação de stock para Excel, nos dois modos que o painel oferece:
//
//   completo — tudo o que a app sabe, em DUAS folhas (S.T. Dupont e Outras
//              marcas), porque os dois catálogos não partilham colunas:
//              um tem categoria/coleção/promo/publicado, o outro tem marca.
//   resumido — uma folha só: EAN · REF · STK LIS · STK VNG · Total, apenas o
//              que tem stock. Os artigos de outras marcas entram com 0 em
//              STK LIS — são vendidos só em Gaia, não é um valor em falta.
import ExcelJS from "exceljs";

const INK = "FF1A1712";
const CREAM = "FFF7F4EC";
const GOLD = "FF9C7A26";
const LINE = "FFE6DECC";
const RED = "FFB94A3A";
const MONEY = "#,##0.00";

const ddmmyyyy = (d: Date) =>
  d.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" });

export interface StockDupontRow {
  ean: string | null;
  sku: string;
  desc: string;
  produto: string;
  categoria: string;
  colecao: string;
  priceCents: number;
  promoPriceCents: number | null;
  status: string;
  publicado: boolean;
  stockLis: number;
  stockVng: number;
}

export interface StockOtherRow {
  ean: string | null;
  sku: string;
  brand: string;
  desc: string;
  pvpCents: number | null;
  stock: number; // só Gaia
  active: boolean;
}

function styleHeader(ws: ExcelJS.Worksheet, rowIdx: number) {
  const header = ws.getRow(rowIdx);
  header.height = 20;
  header.eachCell((c) => {
    c.font = { bold: true, size: 9, color: { argb: CREAM } };
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: INK } };
    c.alignment = { vertical: "middle", horizontal: "center" };
    c.border = { bottom: { style: "thin", color: { argb: INK } } };
  });
}

function titleBand(ws: ExcelJS.Worksheet, cols: number, text: string) {
  ws.mergeCells(1, 1, 1, cols);
  const t = ws.getCell(1, 1);
  t.value = text;
  t.font = { bold: true, size: 12, color: { argb: GOLD } };
  t.alignment = { vertical: "middle" };
  ws.getRow(1).height = 24;
}

function totalRow(ws: ExcelJS.Worksheet, rowIdx: number, labelCol: number, sums: [number, string][]) {
  const total = ws.getRow(rowIdx);
  total.getCell(labelCol).value = "TOTAL";
  for (const [col, letter] of sums) {
    total.getCell(col).value = rowIdx > 3 ? { formula: `SUM(${letter}3:${letter}${rowIdx - 1})` } : 0;
    total.getCell(col).alignment = { horizontal: "center" };
  }
  total.height = 20;
  total.eachCell((c) => {
    c.font = { bold: true, size: 10, color: { argb: INK } };
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: CREAM } };
    c.border = { top: { style: "medium", color: { argb: GOLD } } };
  });
}

export async function buildStockWorkbook(
  mode: "completo" | "resumido",
  dupont: StockDupontRow[],
  other: StockOtherRow[],
  generatedAt: Date,
): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "S.T. Dupont · Painel";
  wb.created = generatedAt;
  const stamp = ddmmyyyy(generatedAt);

  if (mode === "resumido") {
    const HDR = ["EAN", "REF", "STK LIS", "STK VNG", "TOTAL"];
    const W = [18, 18, 11, 11, 11];
    const ws = wb.addWorksheet("Stock", {
      views: [{ state: "frozen", ySplit: 2 }],
      properties: { defaultRowHeight: 16 },
    });
    W.forEach((w, i) => (ws.getColumn(i + 1).width = w));
    titleBand(ws, HDR.length, `S.T. DUPONT · Stock disponível · ${stamp}`);
    ws.getRow(2).values = HDR;
    styleHeader(ws, 2);

    // Os dois catálogos na mesma lista, por total decrescente: quem abre isto
    // quer ver primeiro onde está o peso do inventário.
    const rows = [
      ...dupont.map((d) => ({ ean: d.ean, sku: d.sku, lis: d.stockLis, vng: d.stockVng })),
      ...other.map((o) => ({ ean: o.ean, sku: o.sku, lis: 0, vng: o.stock })),
    ]
      .map((r) => ({ ...r, total: r.lis + r.vng }))
      .filter((r) => r.total > 0)
      .sort((a, b) => b.total - a.total);

    let r = 3;
    for (const row of rows) {
      const line = ws.getRow(r);
      line.getCell(1).value = row.ean ?? "";
      line.getCell(2).value = row.sku;
      line.getCell(3).value = row.lis;
      line.getCell(4).value = row.vng;
      // Total como fórmula, para o ficheiro continuar coerente se alguém
      // corrigir uma das colunas à mão.
      line.getCell(5).value = { formula: `C${r}+D${r}` };
      line.getCell(1).font = { size: 9, name: "Consolas" };
      line.getCell(2).font = { size: 9, name: "Consolas" };
      for (const c of [3, 4, 5]) line.getCell(c).alignment = { horizontal: "center" };
      line.getCell(5).font = { size: 9, bold: true };
      line.eachCell((c) => { c.border = { bottom: { style: "hair", color: { argb: LINE } } }; });
      r++;
    }
    totalRow(ws, r, 2, [[3, "C"], [4, "D"], [5, "E"]]);

    const buf = await wb.xlsx.writeBuffer();
    return Buffer.from(buf);
  }

  // ----- completo -----
  const DHDR = ["EAN", "REF", "PRODUTO", "DESCRIÇÃO", "CATEGORIA", "COLEÇÃO", "PVP", "PVP PROMO", "STATUS", "PUBLICADO", "STK LIS", "STK VNG", "TOTAL"];
  const DW = [18, 16, 30, 34, 14, 18, 11, 12, 15, 12, 10, 10, 10];
  const wsd = wb.addWorksheet("S.T. Dupont", {
    views: [{ state: "frozen", ySplit: 2 }],
    properties: { defaultRowHeight: 16 },
  });
  DW.forEach((w, i) => (wsd.getColumn(i + 1).width = w));
  titleBand(wsd, DHDR.length, `S.T. DUPONT · Stock completo · ${stamp}`);
  wsd.getRow(2).values = DHDR;
  styleHeader(wsd, 2);

  let r = 3;
  for (const d of dupont) {
    const line = wsd.getRow(r);
    line.getCell(1).value = d.ean ?? "";
    line.getCell(2).value = d.sku;
    line.getCell(3).value = d.produto;
    line.getCell(4).value = d.desc;
    line.getCell(5).value = d.categoria;
    line.getCell(6).value = d.colecao;
    line.getCell(7).value = d.priceCents / 100;
    line.getCell(8).value = d.promoPriceCents != null ? d.promoPriceCents / 100 : "";
    line.getCell(9).value = d.status;
    line.getCell(10).value = d.publicado ? "Sim" : "Não";
    line.getCell(11).value = d.stockLis;
    line.getCell(12).value = d.stockVng;
    line.getCell(13).value = { formula: `K${r}+L${r}` };
    line.getCell(1).font = { size: 9, name: "Consolas" };
    line.getCell(2).font = { size: 9, name: "Consolas" };
    for (const c of [7, 8]) line.getCell(c).numFmt = MONEY;
    for (const c of [10, 11, 12, 13]) line.getCell(c).alignment = { horizontal: "center" };
    // Esgotado a vermelho: num ficheiro de 2000 linhas é o que se procura.
    if (d.stockLis + d.stockVng <= 0) line.getCell(13).font = { size: 9, color: { argb: RED } };
    line.eachCell((c) => { c.border = { bottom: { style: "hair", color: { argb: LINE } } }; });
    r++;
  }
  totalRow(wsd, r, 2, [[11, "K"], [12, "L"], [13, "M"]]);

  const OHDR = ["EAN", "REF", "MARCA", "DESCRIÇÃO", "PVP", "STK VNG", "ACTIVO"];
  const OW = [18, 18, 18, 40, 11, 11, 10];
  const wso = wb.addWorksheet("Outras marcas", {
    views: [{ state: "frozen", ySplit: 2 }],
    properties: { defaultRowHeight: 16 },
  });
  OW.forEach((w, i) => (wso.getColumn(i + 1).width = w));
  titleBand(wso, OHDR.length, `Outras marcas · V. N. de Gaia · Stock completo · ${stamp}`);
  wso.getRow(2).values = OHDR;
  styleHeader(wso, 2);

  let ro = 3;
  for (const o of other) {
    const line = wso.getRow(ro);
    line.getCell(1).value = o.ean ?? "";
    line.getCell(2).value = o.sku;
    line.getCell(3).value = o.brand;
    line.getCell(4).value = o.desc;
    line.getCell(5).value = o.pvpCents != null ? o.pvpCents / 100 : "";
    line.getCell(6).value = o.stock;
    line.getCell(7).value = o.active ? "Sim" : "Não";
    line.getCell(1).font = { size: 9, name: "Consolas" };
    line.getCell(2).font = { size: 9, name: "Consolas" };
    line.getCell(5).numFmt = MONEY;
    for (const c of [6, 7]) line.getCell(c).alignment = { horizontal: "center" };
    if (o.stock <= 0) line.getCell(6).font = { size: 9, color: { argb: RED } };
    line.eachCell((c) => { c.border = { bottom: { style: "hair", color: { argb: LINE } } }; });
    ro++;
  }
  totalRow(wso, ro, 2, [[6, "F"]]);

  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}
