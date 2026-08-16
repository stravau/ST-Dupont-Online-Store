// Liga na base as fotografias novas que foram para public/products/.
//
// Pôr o ficheiro no disco não chega: a app lê as imagens de
// ProductVariant.images, um array de caminhos. Sem esta ligação a foto está
// no servidor mas ninguém a mostra.
//
// SÓ ESCREVE onde o array está VAZIO — nunca substitui fotografias que já lá
// estejam. Corre em dry-run por omissão.
//
// COMO CORRER (PowerShell, na raiz):
//   $env:DATABASE_URL = "<a URL da Neon de producao>"
//   npx.cmd tsx scripts/ligar-fotos-novas.ts           # mostra o que faria
//   npx.cmd tsx scripts/ligar-fotos-novas.ts --apply   # grava

import "dotenv/config";
import { readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const RAIZ = "public/products";

function refCandidates(ref: string): string[] {
  const tail = ref.replace(/^STD/, "");
  const out: string[] = [tail];
  if (/^000\d{3}$/.test(tail)) out.push("9" + tail.slice(1));
  if (ref !== tail) out.push(ref);
  return out;
}

async function main() {
  const apply = process.argv.includes("--apply");

  // Varre o disco: (produto, SKU) -> caminhos, por ordem (base, -2, -3…).
  // Indexado pela PASTA e não só pelo SKU: o mesmo SKU aparece em pastas de
  // produtos diferentes, e juntar tudo dava a uma variante fotografias de
  // artigos que não são o dela.
  const porProdutoSku = new Map<string, Map<string, string[]>>();
  const pastasDoSku = new Map<string, string[]>();
  if (!existsSync(RAIZ)) { console.error(`${RAIZ} não existe — corre na raiz do projecto.`); process.exit(1); }
  for (const produto of readdirSync(RAIZ)) {
    const dir = path.join(RAIZ, produto);
    let ficheiros: string[];
    try { ficheiros = readdirSync(dir); } catch { continue; }
    for (const f of ficheiros) {
      const m = /^([A-Za-z0-9-]+?)(?:-(\d))?\.webp$/.exec(f);
      if (!m) continue;
      const sku = m[1].toUpperCase();
      if (!porProdutoSku.has(produto)) porProdutoSku.set(produto, new Map());
      const mapa = porProdutoSku.get(produto)!;
      if (!mapa.has(sku)) {
        mapa.set(sku, []);
        if (!pastasDoSku.has(sku)) pastasDoSku.set(sku, []);
        pastasDoSku.get(sku)!.push(produto);
      }
      mapa.get(sku)!.push(`/products/${produto}/${f}`);
    }
  }
  // Ordem estável: a sem sufixo primeiro, depois -2, -3, -4.
  const ordenar = (l: string[]) =>
    [...l].sort((a, b) => {
      const n = (s: string) => Number(/-(\d)\.webp$/.exec(s)?.[1] ?? "1");
      return n(a) - n(b);
    });
  console.log(`fotografias no disco: ${pastasDoSku.size} SKUs em ${porProdutoSku.size} pastas`);

  // Só variantes SEM imagens — nunca mexer nas que já têm.
  const semImagem = await prisma.productVariant.findMany({
    where: { images: { isEmpty: true } },
    select: { id: true, sku: true, product: { select: { slug: true } } },
  });
  console.log(`variantes sem imagem na base: ${semImagem.length}`);

  const aLigar: { id: string; sku: string; slug: string; imgs: string[] }[] = [];
  let ambiguos = 0;
  for (const v of semImagem) {
    const slug = v.product?.slug ?? "";
    let escolhidas: string[] | null = null;

    for (const c of refCandidates(v.sku)) {
      const sku = c.toUpperCase();
      // 1º: fotos na pasta DO PRÓPRIO produto — sem margem para erro.
      const naPasta = porProdutoSku.get(slug)?.get(sku);
      if (naPasta?.length) { escolhidas = ordenar(naPasta); break; }

      // 2º: o SKU só existe numa pasta em todo o catálogo — é essa, sem dúvida.
      const pastas = pastasDoSku.get(sku);
      if (pastas?.length === 1) {
        escolhidas = ordenar(porProdutoSku.get(pastas[0])!.get(sku)!);
        break;
      }
      // 3º: existe em várias pastas e a variante não está em nenhuma delas.
      // Não se adivinha: uma foto errada é pior do que nenhuma.
      if (pastas && pastas.length > 1) ambiguos++;
    }

    if (escolhidas) aLigar.push({ id: v.id, sku: v.sku, slug: slug || "?", imgs: escolhidas });
  }
  if (ambiguos) console.log(`saltados por ambiguidade (SKU em várias pastas): ${ambiguos}`);

  console.log(`\nA LIGAR: ${aLigar.length} variantes`);
  for (const a of aLigar.slice(0, 30)) {
    console.log(`   ${a.sku.padEnd(14)} /${a.slug.padEnd(28)} ${a.imgs.length} foto(s)`);
  }
  if (aLigar.length > 30) console.log(`   … e mais ${aLigar.length - 30}`);

  if (!apply) {
    console.log("\nDRY-RUN — nada foi gravado. Repete com --apply para gravar.");
    await prisma.$disconnect();
    return;
  }

  let n = 0;
  for (const a of aLigar) {
    await prisma.productVariant.update({ where: { id: a.id }, data: { images: a.imgs } });
    n++;
  }
  console.log(`\nGravado: ${n} variantes ligadas às suas fotografias.`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error("FALHOU:", e instanceof Error ? e.message : e);
  await prisma.$disconnect();
  process.exit(1);
});
