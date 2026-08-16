// Cruza o catálogo oficial de Hong Kong com a nossa base — SÓ LEITURA.
//
// O hk.st-dupont.com corre em Shopify, que expõe /products.json publicamente:
// SKU, título, descrição e fotografias de tudo o que vendem.
//
// A pergunta a que responde: dos artigos que eles têm, quantos estão na nossa
// base? E sobretudo — quantos estão lá mas INVISÍVEIS (no saco dos
// não-mapeados)? Esses são o achado: temos o artigo, eles têm a fotografia e o
// texto, e falta só juntá-los.
//
// COMO CORRER (PowerShell, na raiz):
//   $env:DATABASE_URL = "<a URL da Neon de producao>"
//   npx.cmd tsx scripts/diag-hk.ts
//   npx.cmd tsx scripts/diag-hk.ts --todos    # lista completa

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

// Os SKUs deles vêm com apóstrofo à frente ('030005) — resíduo de exportação
// de Excel. Sem tirar isto, metade das correspondências falha em silêncio.
const limpa = (s: string) => s.replace(/^['\s]+|\s+$/g, "").toUpperCase();

function refCandidates(ref0: string): string[] {
  const ref = limpa(ref0);
  const tail = ref.replace(/^STD/, "");
  const out: string[] = [tail];
  if (/^000\d{3}$/.test(tail)) out.push("9" + tail.slice(1));
  if (ref !== tail) out.push(ref);
  return out;
}

interface HkItem { sku: string; title: string; type: string; imgs: number; desc: boolean }

async function buscarHk(): Promise<HkItem[]> {
  const out: HkItem[] = [];
  for (let page = 1; page <= 40; page++) {
    const r = await fetch(`https://hk.st-dupont.com/products.json?limit=250&page=${page}`, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!r.ok) break;
    const j = (await r.json()) as {
      products?: { title: string; product_type?: string; body_html?: string; images?: unknown[]; variants?: { sku?: string }[] }[];
    };
    if (!j.products?.length) break;
    for (const p of j.products) {
      for (const v of p.variants ?? []) {
        if (!v.sku) continue;
        out.push({
          sku: limpa(v.sku),
          title: p.title,
          type: p.product_type ?? "",
          imgs: (p.images ?? []).length,
          desc: ((p.body_html ?? "").replace(/<[^>]+>/g, "").trim().length > 40),
        });
      }
    }
    if (j.products.length < 250) break;
  }
  return out;
}

async function main() {
  const detalhe = process.argv.includes("--todos");
  console.log("A ler o catálogo de Hong Kong…");
  const hk = await buscarHk();
  console.log(`Hong Kong: ${hk.length} SKUs\n`);

  const nossas = await prisma.productVariant.findMany({
    select: { sku: true, stockLis: true, stockVng: true, product: { select: { slug: true } } },
  });
  const porSku = new Map<string, (typeof nossas)[number]>();
  for (const v of nossas) porSku.set(v.sku.toUpperCase(), v);

  const noCatalogo: HkItem[] = [];
  const noSaco: { h: HkItem; sku: string; stock: number }[] = [];
  const naoTemos: HkItem[] = [];

  for (const h of hk) {
    let achada: (typeof nossas)[number] | undefined;
    for (const c of refCandidates(h.sku)) {
      const v = porSku.get(c);
      if (v) { achada = v; break; }
    }
    if (!achada) { naoTemos.push(h); continue; }
    if (achada.product?.slug === "unmapped-inventory") {
      noSaco.push({ h, sku: achada.sku, stock: (achada.stockLis ?? 0) + (achada.stockVng ?? 0) });
    } else {
      noCatalogo.push(h);
    }
  }

  console.log("=".repeat(74));
  console.log(`A nossa base tem ${nossas.length} variantes.`);
  console.log(`\nDos ${hk.length} SKUs de Hong Kong:`);
  console.log(`  já no nosso catálogo, com página ....... ${noCatalogo.length}`);
  console.log(`  na nossa base mas SEM ficha (saco) ..... ${noSaco.length}   <-- o achado`);
  console.log(`  não temos de todo ...................... ${naoTemos.length}`);
  console.log("=".repeat(74));

  if (noSaco.length) {
    const comStock = noSaco.filter((x) => x.stock > 0);
    console.log(`\nDos ${noSaco.length} que temos escondidos, ${comStock.length} têm stock.`);
    console.log("Estes já têm fotografia e descrição prontas no site oficial:\n");
    console.log("stock  REF nossa      fotos  título em HK");
    const lista = noSaco.sort((a, b) => b.stock - a.stock).slice(0, detalhe ? 9999 : 40);
    for (const x of lista) {
      console.log(
        `${String(x.stock).padStart(5)}  ${x.sku.padEnd(14)} ${String(x.h.imgs).padStart(5)}  ${x.h.title.slice(0, 40)}`,
      );
    }
    if (!detalhe && noSaco.length > 40) console.log(`   … e mais ${noSaco.length - 40} (corre com --todos)`);
  }

  console.log("\nNada foi alterado — este script só lê.");
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error("FALHOU:", e instanceof Error ? e.message : e);
  await prisma.$disconnect();
  process.exit(1);
});
