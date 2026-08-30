// Exportação do livro de movimentos para Excel.
//
// Segue as convenções de lib/stock-export.ts — mesma paleta, mesma faixa de
// título, mesmo cabeçalho escuro — para os ficheiros que saem do painel se
// parecerem uns com os outros em vez de cada um ter o seu estilo.
//
// Duas diferenças em relação ao stock, ambas por causa do que isto é:
//
//   · O ficheiro leva escrito na faixa de título QUE FILTROS estavam
//     aplicados. Um livro de movimentos sem isso é indefensável: meses
//     depois ninguém sabe se aquele ficheiro é do mês passado ou de tudo.
//   · A quantidade vem com sinal (+entrada / −saída) e a coluna do total
//     soma-a. Duas linhas de 3 unidades podem valer zero se uma delas for
//     uma saída, e é isso que se quer ver ao fundo.
import ExcelJS from "exceljs";

const INK = "FF1A1712";
const CREAM = "FFF7F4EC";
const GOLD = "FF9C7A26";
const LINE = "FFE6DECC";
const GREEN = "FF1C8A54";
const RED = "FFB94A3A";

const dmy = (d: Date) =>
  d.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" });
// Hora de Lisboa explícita: o servidor corre em UTC e sem isto o livro saía
// com as horas trocadas, que é o mesmo problema que já tivemos nas vendas.
const dmyhm = (d: Date) =>
  d.toLocaleString("pt-PT", {
    timeZone: "Europe/Lisbon",
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

export interface MovementRow {
  movedAt: Date;
  boutique: string;
  tipo: string; // já traduzido
  sku: string;
  ean: string | null;
  descricao: string;
  quantity: number; // com sinal
  operador: string;
  nota: string;
}

export async function buildMovementsWorkbook(
  rows: MovementRow[],
  filtros: string,
  generatedAt: Date,
): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "S.T. Dupont · Painel";
  wb.created = generatedAt;

  const HDR = ["DATA", "LOJA", "TIPO", "REF", "EAN", "DESCRIÇÃO", "QTD", "OP.", "NOTA"];
  const W = [17, 14, 16, 15, 17, 38, 8, 7, 22];

  const ws = wb.addWorksheet("Movimentos", {
    views: [{ state: "frozen", ySplit: 2 }],
    properties: { defaultRowHeight: 16 },
  });
  W.forEach((w, i) => (ws.getColumn(i + 1).width = w));

  // Faixa de título — diz o que está no ficheiro E com que filtros saiu.
  ws.mergeCells(1, 1, 1, HDR.length);
  const t = ws.getCell(1, 1);
  t.value = `S.T. DUPONT · Movimentos de stock · ${dmy(generatedAt)}${filtros ? ` · ${filtros}` : ""}`;
  t.font = { bold: true, size: 12, color: { argb: GOLD } };
  t.alignment = { vertical: "middle" };
  ws.getRow(1).height = 24;

  ws.getRow(2).values = HDR;
  const header = ws.getRow(2);
  header.height = 20;
  header.eachCell((c) => {
    c.font = { bold: true, size: 9, color: { argb: CREAM } };
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: INK } };
    c.alignment = { vertical: "middle", horizontal: "center" };
    c.border = { bottom: { style: "thin", color: { argb: INK } } };
  });

  let r = 3;
  for (const row of rows) {
    const line = ws.getRow(r);
    line.getCell(1).value = dmyhm(row.movedAt);
    line.getCell(2).value = row.boutique;
    line.getCell(3).value = row.tipo;
    line.getCell(4).value = row.sku;
    line.getCell(5).value = row.ean ?? "";
    line.getCell(6).value = row.descricao;
    line.getCell(7).value = row.quantity;
    line.getCell(8).value = row.operador;
    line.getCell(9).value = row.nota;

    // REF e EAN em monoespaçada: são para ler dígito a dígito, e é assim que
    // o resto dos ficheiros do painel os mostra.
    for (const c of [4, 5]) line.getCell(c).font = { size: 9, name: "Consolas" };
    line.getCell(1).font = { size: 9 };
    // Entrada a verde, saída a vermelho — a mesma leitura que a tabela do
    // ecrã dá, para quem abre o ficheiro não ter de ir ver o sinal.
    line.getCell(7).font = {
      size: 9,
      bold: true,
      color: { argb: row.quantity < 0 ? RED : GREEN },
    };
    line.getCell(7).alignment = { horizontal: "center" };
    line.getCell(7).numFmt = "+0;-0;0";
    line.eachCell((c) => {
      c.border = { bottom: { style: "hair", color: { argb: LINE } } };
    });
    r++;
  }

  // Total com sinal. Fórmula e não valor fixo, para o ficheiro continuar
  // coerente se alguém apagar linhas depois de o abrir.
  const total = ws.getRow(r);
  total.getCell(6).value = "TOTAL";
  total.getCell(7).value = r > 3 ? { formula: `SUM(G3:G${r - 1})` } : 0;
  total.getCell(7).alignment = { horizontal: "center" };
  total.getCell(7).numFmt = "+0;-0;0";
  total.height = 20;
  total.eachCell((c) => {
    c.font = { bold: true, size: 10, color: { argb: INK } };
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: CREAM } };
    c.border = { top: { style: "medium", color: { argb: GOLD } } };
  });

  // Filtro automático nas colunas — quem abre isto costuma querer isolar uma
  // referência ou um tipo sem voltar ao painel.
  ws.autoFilter = { from: { row: 2, column: 1 }, to: { row: Math.max(2, r - 1), column: HDR.length } };

  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}
