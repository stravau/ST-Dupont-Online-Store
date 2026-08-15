// Diagnóstico dos artigos "não mapeados" — SÓ LEITURA, não escreve nada.
//
// Responde a duas perguntas sobre o inventário que está preso no produto-saco
// `unmapped-inventory`:
//   1. Quantos têm gémeo no catálogo (o mesmo artigo a existir duas vezes)?
//   2. Quantos são mesmo artigos sem ficha no site?
//
// Usa a MESMA cascata de correspondência que a app usa (lib/admin-upload.ts):
// EAN primeiro, depois a REF com as suas variantes — incluindo a regra
// 000NNN → 900NNN, que é a que faz STD000651 casar com 900651. Foi ignorar
// essa regra que estragou a primeira análise.
//
// COMO CORRER (PowerShell, na raiz do projecto):
//   $env:DATABASE_URL = "<a URL da Neon de producao>"
//   npx.cmd tsx scripts/diag-unmapped.ts
//
// Manda-me a saída toda. Se quiseres o detalhe artigo a artigo:
//   npx.cmd tsx scripts/diag-unmapped.ts --todos

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

// Cópia exacta de refCandidates() da app. Não importar de lá para o script
// ficar auto-contido e poder correr em qualquer checkout.
function refCandidates(ref: string): string[] {
  const tail = ref.replace(/^STD/, "");
  const out: string[] = [tail];
  if (/^000\d{3}$/.test(tail)) out.push("9" + tail.slice(1));
  if (ref !== tail) out.push(ref);
  return out;
}

const eur = (c: number | null) => (c == null ? "—" : (c / 100).toFixed(2) + "€");

async function main() {
  const detalhe = process.argv.includes("--todos");

  const all = await prisma.productVariant.findMany({
    select: {
      sku: true, ean: true, name: true, priceCents: true,
      stockLis: true, stockVng: true, status: true,
      product: { select: { slug: true, active: true } },
    },
  });

  const unmapped = all.filter((v) => v.product?.slug === "unmapped-inventory");
  const mapped = all.filter((v) => v.product?.slug !== "unmapped-inventory");
  const nome = (v: (typeof all)[number]) => {
    const n = v.name as { pt?: string; en?: string } | null;
    return n?.pt ?? n?.en ?? v.sku;
  };
  const stk = (v: (typeof all)[number]) => (v.stockLis ?? 0) + (v.stockVng ?? 0);

  // Índice do catálogo: por SKU, por cada candidato de REF, e por EAN. Ter as
  // duas direcções cobre tanto STD000651→900651 como o inverso.
  const porRef = new Map<string, typeof mapped>();
  const add = (k: string, v: (typeof mapped)[number]) => {
    if (!porRef.has(k)) porRef.set(k, []);
    porRef.get(k)!.push(v);
  };
  for (const m of mapped) {
    add(m.sku.toUpperCase(), m);
    for (const c of refCandidates(m.sku)) add(c.toUpperCase(), m);
  }
  const porEan = new Map(mapped.filter((m) => m.ean).map((m) => [m.ean as string, m]));

  const comStock = unmapped.filter((v) => stk(v) > 0).sort((a, b) => stk(b) - stk(a));

  console.log("=".repeat(78));
  console.log(`BASE: ${(process.env.DATABASE_URL ?? "").replace(/\/\/[^@]+@/, "//***@").slice(0, 70)}`);
  console.log(`Variants: ${all.length} · no catálogo: ${mapped.length} · não-mapeadas: ${unmapped.length}`);
  console.log(`Não-mapeadas COM stock: ${comStock.length}`);
  console.log("=".repeat(78));

  const gemeos: { u: (typeof all)[number]; m: (typeof mapped)[number]; via: string }[] = [];
  const orfaos: (typeof all)[number][] = [];

  for (const u of comStock) {
    let hit: (typeof mapped)[number] | undefined;
    let via = "";
    if (u.ean && porEan.has(u.ean)) { hit = porEan.get(u.ean); via = "EAN"; }
    if (!hit) {
      for (const c of refCandidates(u.sku)) {
        const l = porRef.get(c.toUpperCase());
        if (l?.length) { hit = l[0]; via = `REF(${c})`; break; }
      }
    }
    if (hit) gemeos.push({ u, m: hit, via });
    else orfaos.push(u);
  }

  const unidadesPresas = gemeos.reduce((s, g) => s + stk(g.u), 0);
  console.log(`\nCOM GÉMEO NO CATÁLOGO (duplicados) ....... ${gemeos.length}`);
  console.log(`   unidades de stock presas no gémeo invisível: ${unidadesPresas}`);
  console.log(`SEM GÉMEO (artigo mesmo sem ficha) ....... ${orfaos.length}`);
  console.log(`   unidades: ${orfaos.reduce((s, o) => s + stk(o), 0)}`);

  if (gemeos.length) {
    console.log("\n--- DUPLICADOS " + "-".repeat(62));
    console.log("stock  não-mapeado    →  no catálogo     stock  página");
    for (const g of gemeos.slice(0, detalhe ? 9999 : 30)) {
      console.log(
        `${String(stk(g.u)).padStart(5)}  ${g.u.sku.padEnd(14)} →  ${g.m.sku.padEnd(14)} ${String(stk(g.m)).padStart(5)}  /${g.m.product?.slug}  [${g.via}]`,
      );
    }
    if (!detalhe && gemeos.length > 30) console.log(`   … e mais ${gemeos.length - 30} (corre com --todos)`);
  }

  if (orfaos.length) {
    console.log("\n--- SEM FICHA NO SITE " + "-".repeat(56));
    console.log("stock  REF            EAN             PVP       descrição");
    for (const o of orfaos.slice(0, detalhe ? 9999 : 30)) {
      console.log(
        `${String(stk(o)).padStart(5)}  ${o.sku.padEnd(14)} ${(o.ean ?? "—").padEnd(15)} ${eur(o.priceCents).padStart(8)}  ${nome(o).slice(0, 40)}`,
      );
    }
    if (!detalhe && orfaos.length > 30) console.log(`   … e mais ${orfaos.length - 30} (corre com --todos)`);
  }

  console.log("\n" + "=".repeat(78));
  console.log("Nada foi alterado — este script só lê.");
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error("FALHOU:", e instanceof Error ? e.message : e);
  await prisma.$disconnect();
  process.exit(1);
});
