// Fotografias de outro artigo penduradas numa ficha.
//
// O CASO QUE DEU O ALERTA: a Eternity · 20,000 Léguas · Caneta de Tinta
// Permanente (420051L) tinha como duas primeiras fotos
// `STDupont/420051_1.jpg` e `_3.jpg` — a referência SEM o L final, que no CDN
// da Starbrands é outro produto. O cliente via um rollerball qualquer no
// cartão e nas duas primeiras imagens da ficha, porque o cartão usa
// `images[0]`. As outras duas fotos da mesma variante eram ficheiros locais
// com a referência certa, o que denunciou a mistura.
//
// A REGRA: o caminho da imagem traz a referência —
//   /products/<coleccao>/<REF>[-N].webp   e   .../STDupont/<REF>_N.jpg
// Se essa referência não for a da variante, a foto é de outro artigo.
//
// Só substitui quando existe no disco o ficheiro certo para aquela variante.
// Onde não existir, limita-se a listar: apagar a foto errada sem ter outra
// deixaria a ficha vazia, e isso é decisão de quem tem as fotografias.
//
// COMO CORRER (PowerShell, na raiz do projecto):
//   $env:DATABASE_URL = "<a URL da Neon de producao>"
//   npx.cmd tsx scripts/corrigir-fotos-trocadas.ts          # simulacao
//   npx.cmd tsx scripts/corrigir-fotos-trocadas.ts --apply  # escreve

import "dotenv/config";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const url = process.env.DATABASE_URL ?? "";
if (!url || /localhost|127\.0\.0\.1/.test(url)) {
  console.error("DATABASE_URL nao aponta para a Neon de producao.");
  process.exit(1);
}
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
const APLICAR = process.argv.includes("--apply");

const norm = (s: string) => s.replace(/^STD/i, "").toUpperCase();

// A referência que o caminho da imagem anuncia.
function refDaImagem(img: string): string | null {
  const cdn = /\/STDupont\/([A-Za-z0-9._-]+?)(?:_\d+)?\.(?:jpg|jpeg|png|webp)$/i.exec(img);
  if (cdn) return cdn[1].toUpperCase();
  const local = /\/products\/[^/]+\/([A-Za-z0-9._-]+?)(?:-\d+)?\.(?:webp|jpg|jpeg|png)$/i.exec(img);
  if (local) return local[1].toUpperCase();
  return null;
}

// As fotos locais que existem mesmo no disco para esta referência, por ordem
// (base primeiro, depois -2, -3, -4…), como o resto do catálogo as guarda.
function locaisPara(ref: string): string[] {
  const raiz = "public/products";
  if (!existsSync(raiz)) return [];
  for (const col of readdirSync(raiz)) {
    const dir = path.join(raiz, col);
    let ficheiros: string[];
    try { ficheiros = readdirSync(dir); } catch { continue; }
    const meus = ficheiros.filter((f) => {
      const m = /^(.+?)(?:-\d+)?\.webp$/i.exec(f);
      return !!m && m[1].toUpperCase() === ref;
    });
    if (!meus.length) continue;
    const ordem = (f: string) => {
      const m = /-(\d+)\.webp$/i.exec(f);
      return m ? Number(m[1]) : 1;
    };
    return meus.sort((a, b) => ordem(a) - ordem(b)).map((f) => `/products/${col}/${f}`);
  }
  return [];
}

async function main() {
  const vs = await prisma.productVariant.findMany({
    where: { images: { isEmpty: false } },
    select: { id: true, sku: true, images: true, product: { select: { slug: true, image: true, id: true } } },
  });

  let corrigidas = 0;
  const semSubstituto: string[] = [];

  for (const v of vs) {
    const meu = norm(v.sku);
    const trocadas = v.images.filter((i) => {
      const r = refDaImagem(i);
      return r !== null && r !== meu;
    });
    if (!trocadas.length) continue;

    const certas = locaisPara(meu);
    console.log("\n" + v.sku.padEnd(11) + "/" + v.product.slug);
    for (const t of trocadas) console.log("   errada:  " + t);
    if (!certas.length) {
      semSubstituto.push(v.sku + "  /" + v.product.slug);
      console.log("   -> sem ficheiro local para esta referencia; nao mexo");
      continue;
    }
    console.log("   -> passa a: " + certas.join(", "));
    corrigidas++;
    if (APLICAR) {
      await prisma.productVariant.update({ where: { id: v.id }, data: { images: certas } });
      // A foto de frente da ficha vem da primeira imagem da variante quando a
      // ficha nao tem uma propria — se apontava para a errada, acerta tambem.
      const frente = v.product.image;
      if (frente && refDaImagem(frente) && refDaImagem(frente) !== meu) {
        await prisma.product.update({ where: { id: v.product.id }, data: { image: certas[0] } });
        console.log("   -> foto de frente da ficha tambem acertada");
      }
    }
  }

  console.log("\n" + "=".repeat(70));
  console.log((APLICAR ? "ESCRITO: " : "SIMULACAO: ") + corrigidas + " variantes acertadas");
  if (semSubstituto.length) {
    console.log("sem ficheiro local disponivel (" + semSubstituto.length + "):");
    for (const s of semSubstituto.slice(0, 20)) console.log("   " + s);
  }
  if (!APLICAR) console.log("Nada foi gravado. Corre com --apply para gravar.");
  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
