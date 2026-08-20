// Descola das colecções as descrições que pertencem a UM artigo só.
//
// O PROBLEMA, o mesmo das recargas mas em pele: a descrição de um artigo foi
// colada em toda a linha. O texto do Apex Nano Trunk está em 26 fichas, entre
// elas porta-cartões e carteiras. O de uma messenger está em 18 fichas
// Firehead. O dos CINTOS está num copo de secretária e numa capa de caderno.
// São 12 grupos, ~135 fichas, todas a dizer ao cliente que são outra coisa.
//
// O QUE FAZ:
//   • guarda o texto original na ficha que ele realmente descreve, quando essa
//     ficha se identifica sem ambiguidade (uma e uma só bate na palavra-chave);
//   • dá às restantes uma linha curta montada do próprio nome — tipo de artigo,
//     linha e acabamento. Curto e verdadeiro vale mais do que rico e errado.
//
// NÃO inventa material nem características. As descrições antigas afirmavam
// coisas concretas ("12 compartimentos para cartões", "couro certificado LWG")
// que não se podem transportar de um artigo para outro sem as verificar.
//
// FICA DE FORA o grupo dos isqueiros ("laca lapidada à mão, mecanismo de chama
// assinada..."): esse texto é genérico da casa e está certo nas seis fichas.
//
// COMO CORRER (PowerShell, na raiz do projecto):
//   $env:DATABASE_URL = "<a URL da Neon de producao>"
//   npx.cmd tsx scripts/corrigir-descricoes-coleccoes.ts          # simulacao
//   npx.cmd tsx scripts/corrigir-descricoes-coleccoes.ts --apply  # escreve

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

// Grupos a tratar, reconhecidos pelo inicio da descricao, com a palavra-chave
// que identifica a ficha a que o texto pertence de facto. `dono: null` quando
// nao se consegue decidir sem adivinhar — nesse caso todas levam o texto novo.
const GRUPOS: { inicio: string; dono: RegExp | null }[] = [
  { inicio: "O Nano Trunk Apex", dono: /nano trunk/i },
  { inicio: "A messenger é a companheira", dono: /messenger/i },
  { inicio: "Confeccionada em couro de vitela flor inteira, a carteira comprida", dono: /carteira longa|carteira comprida/i },
  { inicio: "Em 1953, André Dupont", dono: null },
  { inicio: "Com a X-Bag Baguette", dono: null },
  { inicio: "Esta carteira em couro de vitela flor inteira gravada em relevo", dono: null },
  { inicio: "Inspirando-se nos icónicos estojos para charutos", dono: /2 canetas/i },
  { inicio: "Há quase 50 anos que a S.T. Dupont propõe uma vasta gama de cintos", dono: null },
  { inicio: "Esta carteira vertical compacta", dono: null },
  { inicio: "Um clássico intemporal", dono: null },
  { inicio: "1872 é uma colecção de malas", dono: null },
  { inicio: "Esta icónica pasta em couro preto", dono: /porta-documentos|pasta/i },
];

// "Apex · Porta-Cartões — Preto"  ->  { coleccao, tipo, cor }
function partes(nome: string): { coleccao: string; tipo: string; cor: string } {
  const [antes, cor = ""] = nome.split("—").map((s) => s.trim());
  const segs = antes.split("·").map((s) => s.trim()).filter(Boolean);
  if (segs.length >= 2) return { coleccao: segs[0], tipo: segs.slice(1).join(" · "), cor };
  return { coleccao: "", tipo: antes, cor };
}

// A coleccao so entra na frase quando acrescenta informacao. Em
// "Estojo para Caneta · Estojo 1 Caneta" a coleccao E o tipo de artigo, e
// "Estojo 1 Caneta da linha Estojo para Caneta" so soa a gaguez.
const repete = (col: string, tipo: string) => {
  if (!col) return true;
  const p = col.toLowerCase().split(/\s+/)[0];
  return tipo.toLowerCase().startsWith(p);
};

function novaDescricao(pt: string, en: string): { pt: string; en: string } {
  const a = partes(pt), b = partes(en);
  const frasePt = a.coleccao && !repete(a.coleccao, a.tipo)
    ? `${a.tipo} da linha ${a.coleccao}, da Maison S.T. Dupont.`
    : `${a.tipo}, da Maison S.T. Dupont.`;
  const fraseEn = b.coleccao && !repete(b.coleccao, b.tipo)
    ? `${b.tipo} from the S.T. Dupont ${b.coleccao} line.`
    : `${b.tipo}, by S.T. Dupont.`;
  return {
    pt: frasePt + (a.cor ? ` Acabamento ${a.cor.toLowerCase()}.` : ""),
    en: fraseEn + (b.cor ? ` ${b.cor} finish.` : ""),
  };
}

async function main() {
  const ps = await prisma.product.findMany({
    where: { slug: { not: "unmapped-inventory" } },
    select: { id: true, slug: true, name: true, description: true },
  });

  const porTexto = new Map<string, typeof ps>();
  for (const p of ps) {
    const d = loc(p.description).replace(/\s+/g, " ").trim();
    if (!d) continue;
    if (!porTexto.has(d)) porTexto.set(d, [] as unknown as typeof ps);
    porTexto.get(d)!.push(p);
  }

  let mexidas = 0, mantidas = 0;

  for (const g of GRUPOS) {
    // filter, nao find: ha textos que partilham o inicio e divergem no fim
    // (variantes de cor da mesma copy). Apanhar so o primeiro deixava
    // fichas por corrigir — o grupo dos cintos passava de 8 para 2.
    const entradas = [...porTexto.entries()].filter(([d]) => d.startsWith(g.inicio));
    if (!entradas.length) { console.log("!! grupo nao encontrado: \"" + g.inicio.slice(0, 40) + "...\""); continue; }
    for (const [texto, itens] of entradas) {

    // O texto fica em TODAS as fichas que batem: o Apex tem quatro Nano
    // Trunks (cores diferentes) e o texto e verdadeiro nos quatro.
    const donos = g.dono ? itens.filter((p) => g.dono!.test(loc(p.name))) : [];
    const eDono = new Set(donos.map((p) => p.id));

    console.log("\n" + "-".repeat(72));
    console.log(itens.length + " fichas · \"" + texto.slice(0, 54) + "...\"");
    if (donos.length) {
      mantidas += donos.length;
      console.log("   texto original fica em " + donos.length + ": " + donos.map((p) => loc(p.name)).join(", ").slice(0, 90));
    } else console.log("   sem dono identificavel — todas levam texto novo");

    for (const p of itens) {
      if (eDono.has(p.id)) continue;
      const nd = novaDescricao(loc(p.name), loc(p.name, "en"));
      mexidas++;
      if (mexidas <= 6 || itens.length <= 8) console.log("     " + loc(p.name).slice(0, 40).padEnd(42) + "-> " + nd.pt);
      if (APLICAR) await prisma.product.update({ where: { id: p.id }, data: { description: nd } });
    }
    if (itens.length > 8) console.log("     ... (" + (itens.length - donos.length) + " no total neste grupo)");
    }
  }

  console.log("\n" + "=".repeat(72));
  console.log((APLICAR ? "ESCRITO: " : "SIMULACAO: ") + mexidas + " descricoes substituidas, " +
    mantidas + " textos originais mantidos na ficha certa");
  if (!APLICAR) console.log("Nada foi gravado. Corre com --apply para gravar.");
  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
