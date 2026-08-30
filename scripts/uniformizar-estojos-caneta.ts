// Um nome só para os estojos de caneta: "Estojo para N Caneta(s)".
//
// Estavam com três formas diferentes para a mesma coisa — "Estojo para Caneta
// · Estojo 1 Caneta", "Estojos para Canetas · Estojo 1 Caneta" e "Estojo de
// Caneta" — o que na grelha dava a impressão de serem artigos distintos
// quando são o mesmo objecto em cores diferentes.
//
// O plural segue a contagem: 1 leva "Caneta", 2 ou mais levam "Canetas".
//
// FICA DE FORA o /line-d-2-pen-case ("Line D · Estojo de Caneta"). Esse não é
// da gama genérica: é uma peça da linha Line D e o nome dela é o que a
// identifica no meio dos outros artigos Line D. Generalizá-lo perdia isso.
//
// Os nomes das VARIANTES são reconstruídos com a mesma cor que já tinham —
// elas repetem o nome do produto e ficariam a contradizê-lo.
//
// COMO CORRER (PowerShell, na raiz do projecto):
//   $env:DATABASE_URL = "<a URL da Neon de producao>"
//   npx.cmd tsx scripts/uniformizar-estojos-caneta.ts          # simulacao
//   npx.cmd tsx scripts/uniformizar-estojos-caneta.ts --apply  # escreve

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

const loc = (j: unknown, k: "pt" | "en" = "pt") =>
  String(((j ?? {}) as Record<string, string>)[k] ?? "");

// O /pen-case-3-pen-case (ref 007113) NAO entra: apesar do slug, o patrao
// confirmou que e um estojo normal e nao um estojo de canetas. Tem entrada
// propria no GENERICOS, mais abaixo.
//
// slug -> quantas canetas leva. Os que não trazem número no nome levam uma —
// "Estojo de Caneta", no singular, é um estojo para uma caneta.
// O XL não declara contagem em lado nenhum, por isso mantém-se o tamanho como
// qualificador em vez de eu inventar um número.
const CAPACIDADE: Record<string, number | "XL"> = {
  "pen-case": 1,
  "pen-case-2-1-pen-case": 1,
  "pen-case-3-1-pen-case": 1,
  "pen-case-2-2-pen-case": 2,
  "pen-case-3-2-pen-case": 2,
  "pen-case-3-3-pen-case": 3,
  "pen-case-3-10-pen-case": 10,
  "pen-case-3-pen-case-xl": "XL",
};

// Estojos que nao sao de canetas, apesar de estarem na mesma familia de
// slugs. Ficam com o nome generico em vez de anunciarem uma funcao que nao
// tem.
const GENERICOS: Record<string, { pt: string; en: string }> = {
  "pen-case-3-pen-case": { pt: "Estojo", en: "Case" },
};

const nomePt = (c: number | "XL") =>
  c === "XL" ? "Estojo para Caneta XL" : `Estojo para ${c} ${c === 1 ? "Caneta" : "Canetas"}`;
// Em inglês a forma "N-Pen Case" já era uniforme e é a idiomática; só se
// deixa cair o prefixo da colecção.
const nomeEn = (c: number | "XL") => (c === "XL" ? "XL Pen Case" : `${c}-Pen Case`);

async function main() {
  let fichas = 0;
  let variantes = 0;

  const alvos: [string, { pt: string; en: string }][] = [
    ...Object.entries(CAPACIDADE).map(
      ([slug, cap]) => [slug, { pt: nomePt(cap), en: nomeEn(cap) }] as [string, { pt: string; en: string }],
    ),
    ...Object.entries(GENERICOS),
  ];

  for (const [slug, novo] of alvos) {
    const p = await prisma.product.findUnique({
      where: { slug },
      select: { id: true, name: true, variants: { select: { id: true, sku: true, name: true } } },
    });
    if (!p) {
      console.log("!! /" + slug + " nao existe");
      continue;
    }

    const antigoPt = loc(p.name);
    if (antigoPt !== novo.pt) {
      fichas++;
      console.log("\n/" + slug);
      console.log("   " + antigoPt + "\n   -> " + novo.pt);
      if (APLICAR) await prisma.product.update({ where: { id: p.id }, data: { name: novo } });
    }

    // A cor está no fim do nome da variante, depois do travessão. Guarda-se
    // essa e reconstrói-se em volta do nome novo.
    for (const v of p.variants) {
      const vPt = loc(v.name);
      const vEn = loc(v.name, "en");
      const corPt = vPt.includes("—") ? vPt.split("—").slice(1).join("—").trim() : "";
      const corEn = vEn.includes("—") ? vEn.split("—").slice(1).join("—").trim() : "";
      const nv = {
        pt: corPt ? `${novo.pt} — ${corPt}` : novo.pt,
        en: corEn ? `${novo.en} — ${corEn}` : novo.en,
      };
      if (nv.pt === vPt) continue;
      variantes++;
      if (variantes <= 8) console.log("     " + v.sku.padEnd(9) + nv.pt);
      if (APLICAR) await prisma.productVariant.update({ where: { id: v.id }, data: { name: nv } });
    }
  }

  console.log("\n" + "=".repeat(66));
  console.log((APLICAR ? "ESCRITO: " : "SIMULACAO: ") + fichas + " fichas, " + variantes + " variantes");
  if (!APLICAR) console.log("Nada foi gravado. Corre com --apply para gravar.");
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
