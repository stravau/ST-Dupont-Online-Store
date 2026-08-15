// Cruza o Excel ECI com a base — SÓ LEITURA, não escreve nada.
//
// Responde à pergunta "porque é que o site diz indisponível num artigo que eu
// tenho em loja?", separando as causas possíveis:
//
//   A) tem ficha no site, tem stock no Excel, ZERO na base
//      → o sync não foi aplicado com este ficheiro. É o caso a corrigir.
//   B) tem ficha, e a base concorda com o Excel
//      → está bem; se o site diz indisponível é da COR mostrada, não do artigo.
//   C) não tem ficha (unmapped-inventory)
//      → invisível no site, problema diferente (ver diag-unmapped.ts).
//   D) a REF do Excel não existe de todo na base
//      → artigo novo, nunca importado.
//
// COMO CORRER (PowerShell, na raiz do projecto):
//   $env:DATABASE_URL = "<a URL da Neon de producao>"
//   npx.cmd tsx scripts/diag-stock-vs-excel.ts "C:\Users\Utilizador\Desktop\ECI_LIS_Controlo_v1_2_2026 (002).xlsx" LIS
//
// Para Gaia troca o ficheiro e põe VNG no fim. Acrescenta --todos para a
// lista completa em vez das 40 primeiras.

import "dotenv/config";
import xlsx from "xlsx";
import { readFileSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

// Mesma cascata da app: EAN primeiro, depois a REF com as suas variantes,
// incluindo a regra 000NNN → 900NNN.
function refCandidates(ref: string): string[] {
  const tail = ref.replace(/^STD/, "");
  const out: string[] = [tail];
  if (/^000\d{3}$/.test(tail)) out.push("9" + tail.slice(1));
  if (ref !== tail) out.push(ref);
  return out;
}
const normEan = (v: unknown) => {
  if (v == null || v === "") return null;
  const s = String(v).trim();
  return s ? s.replace(/\.0+$/, "") : null;
};

async function main() {
  const file = process.argv[2];
  const store = (process.argv[3] ?? "LIS").toUpperCase() === "VNG" ? "VNG" : "LIS";
  const detalhe = process.argv.includes("--todos");
  if (!file) {
    console.error('Falta o ficheiro. Ex.: npx.cmd tsx scripts/diag-stock-vs-excel.ts "C:\\...\\ECI_LIS_Controlo.xlsx" LIS');
    process.exit(1);
  }

  const wb = xlsx.read(readFileSync(file), { type: "buffer", raw: true });
  const sheet = wb.Sheets["DB"];
  if (!sheet) { console.error('O ficheiro não tem folha "DB".'); process.exit(1); }
  // DB: 0=EAN, 1=Ref, 2=Marca, 3=Descrição, 4=PVP, 5=Stock Teórico. Dados na linha 2.
  const rows = xlsx.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: null, raw: true }).slice(2);

  const comStock: { ref: string; ean: string | null; desc: string; qtd: number }[] = [];
  for (const r of rows) {
    if (!r) continue;
    const ref = r[1] == null ? "" : String(r[1]).trim();
    if (!ref) continue;
    const marca = (r[2] == null ? "" : String(r[2]).trim()).toUpperCase();
    if (marca !== "ST DUPONT" && marca !== "DUPONT") continue;
    const qtd = Math.max(0, Math.trunc(Number(r[5]) || 0));
    if (qtd > 0) comStock.push({ ref, ean: normEan(r[0]), desc: r[3] == null ? ref : String(r[3]).trim(), qtd });
  }

  const variants = await prisma.productVariant.findMany({
    select: { sku: true, ean: true, stockLis: true, stockVng: true, status: true, product: { select: { slug: true } } },
  });
  const bySku = new Map<string, (typeof variants)[number]>();
  for (const v of variants) bySku.set(v.sku.toUpperCase(), v);
  const byEan = new Map(variants.filter((v) => v.ean).map((v) => [v.ean as string, v]));
  const stockDa = (v: (typeof variants)[number]) => (store === "LIS" ? v.stockLis : v.stockVng) ?? 0;

  const A: { ref: string; sku: string; slug: string; excel: number; desc: string }[] = [];
  let B = 0;
  const C: { ref: string; excel: number; desc: string }[] = [];
  const D: { ref: string; excel: number; desc: string }[] = [];

  for (const row of comStock) {
    let hit = row.ean ? byEan.get(row.ean) : undefined;
    if (!hit) {
      for (const c of refCandidates(row.ref)) {
        const v = bySku.get(c.toUpperCase());
        if (v) { hit = v; break; }
      }
    }
    if (!hit) { D.push({ ref: row.ref, excel: row.qtd, desc: row.desc }); continue; }
    if (hit.product?.slug === "unmapped-inventory") { C.push({ ref: row.ref, excel: row.qtd, desc: row.desc }); continue; }
    if (stockDa(hit) > 0) { B++; continue; }
    A.push({ ref: row.ref, sku: hit.sku, slug: hit.product?.slug ?? "?", excel: row.qtd, desc: row.desc });
  }

  console.log("=".repeat(80));
  console.log(`BASE: ${(process.env.DATABASE_URL ?? "").replace(/\/\/[^@]+@/, "//***@").slice(0, 60)}`);
  console.log(`FICHEIRO: ${file.split(/[\\/]/).pop()}  ·  LOJA: ${store}`);
  console.log(`Artigos Dupont com stock > 0 no Excel: ${comStock.length}`);
  console.log("=".repeat(80));
  console.log(`\nA) TEM FICHA, mas stock ZERO na base ....... ${A.length}   (${A.reduce((s, x) => s + x.excel, 0)} un.)`);
  console.log(`   >>> sao estes que aparecem indisponiveis no site apesar de existirem`);
  console.log(`B) TEM FICHA e a base concorda ............. ${B}`);
  console.log(`C) SEM ficha (unmapped-inventory) .......... ${C.length}   (${C.reduce((s, x) => s + x.excel, 0)} un.)`);
  console.log(`D) REF nao existe de todo na base .......... ${D.length}   (${D.reduce((s, x) => s + x.excel, 0)} un.)`);

  if (A.length) {
    console.log("\n--- A) COM FICHA E ZERO NA BASE " + "-".repeat(46));
    console.log("excel  REF do Excel   SKU na base    pagina");
    for (const a of A.sort((x, y) => y.excel - x.excel).slice(0, detalhe ? 9999 : 40)) {
      console.log(`${String(a.excel).padStart(5)}  ${a.ref.padEnd(14)} ${a.sku.padEnd(14)} /${a.slug}   ${a.desc.slice(0, 30)}`);
    }
    if (!detalhe && A.length > 40) console.log(`   … e mais ${A.length - 40} (corre com --todos)`);
  }
  if (D.length) {
    console.log("\n--- D) REF DESCONHECIDA " + "-".repeat(54));
    for (const d of D.sort((x, y) => y.excel - x.excel).slice(0, detalhe ? 9999 : 20)) {
      console.log(`${String(d.excel).padStart(5)}  ${d.ref.padEnd(14)} ${d.desc.slice(0, 42)}`);
    }
    if (!detalhe && D.length > 20) console.log(`   … e mais ${D.length - 20}`);
  }

  console.log("\n" + "=".repeat(80));
  if (A.length > 0) {
    console.log(`CONCLUSAO: ${A.length} artigos com ficha estao a zero na base mas tem stock no`);
    console.log(`Excel. Correr o Sincronizar ECI com este ficheiro deve resolve-los.`);
  } else {
    console.log("CONCLUSAO: a base concorda com o Excel em todos os artigos com ficha.");
    console.log("Se o site diz indisponivel, e da COR mostrada no cartao, nao do artigo.");
  }
  console.log("Nada foi alterado — este script so le.");
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error("FALHOU:", e instanceof Error ? e.message : e);
  await prisma.$disconnect();
  process.exit(1);
});
