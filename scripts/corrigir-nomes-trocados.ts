// Tira o "Cinzeiro / Ashtray" dos nomes onde ele não tem nada que fazer, e
// arruma uma caneta que estava com slug de cortador de charuto.
//
// O QUE SE PASSOU: a importação original do catálogo colou termos de um tipo
// de artigo a artigos de outro tipo. Sobrou em quatro sítios:
//
//   /cufflinks-ashtray-chrome    "Botões de Punho · Cinzeiro · Crómio"  (7 var.)
//   /tie-clip-2-ashtray-chrome   "Mola de Gravata · Cinzeiro · Crómio"  (3 var.)
//   /tie-clip-2-ashtray-matt     "Mola de Gravata · Cinzeiro · Mate"    (1 var.)
//   /cutter-420024l              uma CANETA de tinta permanente
//
// Os três primeiros são só nome errado: o segmento "· Cinzeiro · Crómio" está
// no nome da ficha E no de cada variante, por isso os quatro cartões de
// botões de punho diziam todos "Cufflinks · Ashtray · Chrome". Aqui limita-se
// a apagar o segmento — não se inventa nome nenhum.
//
// O quarto é pior e não se via a olho: a Line D Eternity Graff'ty é uma caneta
// de tinta permanente (o oficial confirma, `fountain-pen-line-d-eternity-
// large-graffty-multicolor-420024l`), mas tem slug `cutter-420024l`. Como o
// filtro dos cortadores casa por slug (`isCutter = /^cigar-cutter|^cutter-\d/`),
// a caneta aparecia em Acessórios para Fumadores → Cortadores de Charuto. A
// categoria e a colecção já estavam certas; era só o slug.
//
// NÃO separa as fichas. Os 7 botões de punho são, no site oficial, cinco
// produtos distintos (redondos preto/azul, inox, laca preta com prata e com
// ouro) metidos aqui como cores de um só. Isso é uma decisão de catálogo, não
// uma correcção de texto.
//
// COMO CORRER (PowerShell, na raiz do projecto):
//   $env:DATABASE_URL = "<a URL da Neon de producao>"
//   npx.cmd tsx scripts/corrigir-nomes-trocados.ts          # simulacao
//   npx.cmd tsx scripts/corrigir-nomes-trocados.ts --apply  # escreve

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const url = process.env.DATABASE_URL ?? "";
if (!url || /localhost|127\.0\.0\.1/.test(url)) {
  console.error("DATABASE_URL nao aponta para a Neon de producao.");
  process.exit(1);
}
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
const APLICAR = process.argv.includes("--apply");

const FICHAS = ["cufflinks-ashtray-chrome", "tie-clip-2-ashtray-chrome", "tie-clip-2-ashtray-matt"];

// Segmentos a apagar. São o tipo de artigo errado ("cinzeiro") seguido do
// acabamento que a ficha atribuía a todas as cores por igual — e que a
// variante já diz correctamente no seu próprio sufixo.
const LIXO = [
  /\s*·\s*Cinzeiro\s*·\s*Cr[óo]mio/gi,
  /\s*·\s*Cinzeiro\s*·\s*Mate/gi,
  /\s*·\s*Ashtray\s*·\s*Chrome/gi,
  /\s*·\s*Ashtray\s*·\s*Matt?/gi,
];

const limpar = (s: string): string => {
  let out = s;
  for (const re of LIXO) out = out.replace(re, "");
  return out.replace(/\s{2,}/g, " ").replace(/\s*·\s*$/, "").trim();
};

const limparLoc = (j: unknown): { pt: string; en: string } | null => {
  const o = (j ?? {}) as Record<string, string>;
  const pt = limpar(o.pt ?? "");
  const en = limpar(o.en ?? "");
  if (pt === (o.pt ?? "") && en === (o.en ?? "")) return null;
  return { pt, en };
};

async function main() {
  let fichas = 0, variantes = 0;

  for (const slug of FICHAS) {
    const p = await prisma.product.findUnique({
      where: { slug },
      select: { id: true, slug: true, name: true, variants: { select: { id: true, sku: true, name: true } } },
    });
    if (!p) { console.log("!! /" + slug + " nao existe"); continue; }

    console.log("\n/" + p.slug);
    const novoNome = limparLoc(p.name);
    if (novoNome) {
      fichas++;
      console.log("   ficha:  " + String((p.name as Record<string, string>).pt) + "  ->  " + novoNome.pt);
      if (APLICAR) await prisma.product.update({ where: { id: p.id }, data: { name: novoNome } });
    }
    for (const v of p.variants) {
      const nv = limparLoc(v.name);
      if (!nv) continue;
      variantes++;
      console.log("   " + v.sku.padEnd(9) + String((v.name as Record<string, string>).pt).slice(0, 42).padEnd(44) + "->  " + nv.pt);
      if (APLICAR) await prisma.productVariant.update({ where: { id: v.id }, data: { name: nv } });
    }
  }

  // A caneta com slug de cortador.
  const caneta = await prisma.product.findUnique({
    where: { slug: "cutter-420024l" }, select: { id: true, name: true },
  });
  const NOVO_SLUG = "line-d-eternity-graffty-420024l";
  let slugCaneta = false;
  if (caneta) {
    const ocupado = await prisma.product.findUnique({ where: { slug: NOVO_SLUG }, select: { id: true } });
    if (ocupado && ocupado.id !== caneta.id) {
      console.log("\n!! " + NOVO_SLUG + " ja esta ocupado — caneta nao mexida");
    } else {
      slugCaneta = true;
      console.log("\ncaneta fora do sitio:");
      console.log("   " + String((caneta.name as Record<string, string>).pt).slice(0, 56));
      console.log("   /cutter-420024l  ->  /" + NOVO_SLUG + "   (sai dos Cortadores de Charuto)");
      if (APLICAR) await prisma.product.update({ where: { id: caneta.id }, data: { slug: NOVO_SLUG } });
    }
  }

  console.log("\n" + "=".repeat(66));
  console.log((APLICAR ? "ESCRITO: " : "SIMULACAO: ") + fichas + " nomes de ficha, " +
    variantes + " nomes de variante" + (slugCaneta ? ", 1 slug" : ""));
  if (!APLICAR) console.log("Nada foi gravado. Corre com --apply para gravar.");
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
