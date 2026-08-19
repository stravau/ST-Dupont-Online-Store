// Corrige as descrições (e os nomes errados) das fichas de recarga.
//
// O PROBLEMA: 36 fichas de recarga partilhavam 9 descrições. Uma delas estava
// em 16 fichas ao mesmo tempo — minas de lapiseira, cartuchos de tinta e
// recargas de feltro a dizerem todas que eram recargas de rollerball pretas
// vendidas em caixas de 10. Não havia uma única ficha onde o texto estivesse
// certo, nem sequer a do rollerball azul.
//
// A SOLUÇÃO: o texto passa a ser gerado a partir dos nossos próprios quadros
// de compatibilidade (lib/refill-compat.ts e lib/pen-refill-compat.ts), que
// foram transcritos dos quadros oficiais da Maison. Cada recarga diz o que é,
// de que cor, como é vendida e que modelos serve.
//
// NOMES: a boutique só vende recargas de gás à unidade — confirmado pelo
// patrão. Havia cinco fichas chamadas "Caixa de 12 Recargas de Gás" a preço
// de unidade (€15/€24; a caixa de 12 seria múltiplo disso). Os nomes passam a
// singular, seguindo o padrão do 000434, que já estava correcto.
//
// NÃO mexe nos slugs. Vários dizem "box-10-refills-..." e estão errados pela
// mesma razão, mas o slug está no URL — mudá-lo parte links e SEO, e isso é
// uma decisão à parte.
//
// COMO CORRER (PowerShell, na raiz do projecto):
//   $env:DATABASE_URL = "<a URL da Neon de producao>"
//   npx.cmd tsx scripts/corrigir-descricoes-recargas.ts          # simulacao
//   npx.cmd tsx scripts/corrigir-descricoes-recargas.ts --apply  # escreve

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";
import { REFILL_COMPAT } from "../lib/refill-compat";

const url = process.env.DATABASE_URL ?? "";
if (!url || /localhost|127\.0\.0\.1/.test(url)) {
  console.error("DATABASE_URL nao aponta para a Neon de producao.");
  process.exit(1);
}
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
const APLICAR = process.argv.includes("--apply");

// As duas famílias do quadro de escrita (cabeçalho de pen-refill-compat.ts).
const FAM_A = "Olympio, Néo-Classique, Classique 2, D.link/Caprice, Fidelio, Ellipsis, Montparnasse, Gatsby e Mon Dupont";
const FAM_A_EN = "Olympio, Néo-Classique, Classique 2, D.link/Caprice, Fidelio, Ellipsis, Montparnasse, Gatsby and Mon Dupont";
const FAM_B = "Défi, Liberté, Line D, Streamliner-R, D-Initial e New Line D";
const FAM_B_EN = "Défi, Liberté, Line D, Streamliner-R, D-Initial and New Line D";

type Texto = { pt: string; en: string };

// Que colecções de isqueiro usam cada recarga de gás / pedra — invertido do
// quadro, para a descrição dizer exactamente o que serve.
function modelosQueUsam(ref: string): string[] {
  const out: string[] = [];
  for (const [coleccao, c] of Object.entries(REFILL_COMPAT)) {
    if (c.gas.includes(ref) || c.flint.includes(ref)) out.push(coleccao);
  }
  return [...new Set(out)].sort();
}

function lista(xs: string[], e: string): string {
  if (xs.length <= 1) return xs[0] ?? "";
  return xs.slice(0, -1).join(", ") + " " + e + " " + xs[xs.length - 1];
}

const gas = (cor: string, corEn: string, ref: string): Texto => {
  const ms = modelosQueUsam(ref);
  return {
    pt: `Recarga de gás ${cor} para isqueiros S.T. Dupont, vendida à unidade.` +
      (ms.length ? ` Para os isqueiros ${lista(ms, "e")}.` : ""),
    en: `${corEn} gas refill for S.T. Dupont lighters, sold individually.` +
      (ms.length ? ` For ${lista(ms, "and")} lighters.` : ""),
  };
};

const pedra = (cor: string, corEn: string, ref: string): Texto => {
  const ms = modelosQueUsam(ref);
  return {
    pt: `Pedras de sílex de substituição, em cartela de 8 (tampa ${cor}).` +
      (ms.length ? ` Para os isqueiros ${lista(ms, "e")}.` : ""),
    en: `Replacement flints, card of 8 (${corEn} cap).` +
      (ms.length ? ` For ${lista(ms, "and")} lighters.` : ""),
  };
};

const esfero = (cor: string, corEn: string, fam: "A" | "B"): Texto => ({
  pt: `Recarga de esferográfica de ponta média, tinta ${cor}. Vendida à unidade. Para as canetas ${fam === "A" ? FAM_A : FAM_B}.`,
  en: `Medium-point ballpoint refill, ${corEn} ink. Sold individually. For ${fam === "A" ? FAM_A_EN : FAM_B_EN} pens.`,
});

const roller = (cor: string, corEn: string): Texto => ({
  pt: `Recarga de rollerball de ponta média, tinta ${cor}. Vendida à unidade. Serve todas as linhas de escrita S.T. Dupont.`,
  en: `Medium-point rollerball refill, ${corEn} ink. Sold individually. Fits every S.T. Dupont writing line.`,
});

const feltro = (cor: string, corEn: string): Texto => ({
  pt: `Recarga de ponta de feltro média, tinta ${cor}. Vendida à unidade. Serve todas as linhas de escrita S.T. Dupont.`,
  en: `Medium fibre-tip refill, ${corEn} ink. Sold individually. Fits every S.T. Dupont writing line.`,
});

const cartucho = (cor: string, corEn: string): Texto => ({
  pt: `Cartuchos de tinta ${cor} para canetas de aparo, embalagem de 6. Servem todas as linhas de escrita S.T. Dupont.`,
  en: `${corEn} ink cartridges for fountain pens, pack of 6. Fit every S.T. Dupont writing line.`,
});

const TEXTOS: Record<string, Texto> = {
  // --- gás e pedras -------------------------------------------------------
  "000430": gas("preta (spray)", "Black (spray)", "000430"),
  "000432": gas("amarela", "Yellow", "000432"),
  "000433": gas("verde", "Green", "000433"),
  "000434": gas("azul", "Blue", "000434"),
  "000435": gas("vermelha", "Red", "000435"),
  "000436": {
    pt: "Recarga de gás vermelha, em spray, para os isqueiros Défi Extrême e Xxtrême. Vendida à unidade.",
    en: "Red gas refill, spray, for Défi Extrême and Xxtrême lighters. Sold individually.",
  },
  "000601": pedra("cinzenta", "grey", "000601"),
  "000651": pedra("vermelha", "red", "000651"),

  // --- esferográfica ------------------------------------------------------
  "040850": esfero("azul", "blue", "A"),
  "040851": esfero("preta", "black", "A"),
  "040853": esfero("azul", "blue", "B"),
  "040854": esfero("preta", "black", "B"),
  "040358": esfero("rosa", "pink", "B"),
  "040359": esfero("vermelha", "red", "B"),
  "040360": esfero("verde", "green", "B"),
  "040361": esfero("turquesa", "turquoise", "B"),
  "040770": {
    pt: "Recarga de esferográfica de ponta média, tinta azul. Vendida à unidade. Para as canetas Classique anteriores a 1999.",
    en: "Medium-point ballpoint refill, blue ink. Sold individually. For Classique pens made before 1999.",
  },
  "040771": {
    pt: "Recarga de esferográfica de ponta média, tinta preta. Vendida à unidade. Para as canetas Classique anteriores a 1999.",
    en: "Medium-point ballpoint refill, black ink. Sold individually. For Classique pens made before 1999.",
  },

  // --- rollerball e feltro ------------------------------------------------
  "040840": roller("azul", "blue"),
  "040841": roller("preta", "black"),
  "040843": {
    pt: "Recarga de rollerball mini, tinta preta. Vendida à unidade. Exclusiva da Néo-Classique Président.",
    en: "Mini rollerball refill, black ink. Sold individually. Exclusive to the Néo-Classique Président.",
  },
  "040830": feltro("azul", "blue"),
  "040831": feltro("preta", "black"),

  // --- tinta de aparo -----------------------------------------------------
  "040110": cartucho("preta", "Black"),
  "040112": cartucho("azul real", "Royal blue"),
  "040362": cartucho("vermelha", "Red"),
  "040363": cartucho("verde", "Green"),
  "040364": cartucho("turquesa", "Turquoise"),
  "408812": {
    pt: "Conversor de êmbolo para canetas de aparo. Substitui o cartucho e permite carregar tinta a partir de um frasco.",
    en: "Piston converter for fountain pens. Replaces the cartridge so the pen can be filled from a bottle.",
  },

  // --- lapiseira ----------------------------------------------------------
  "040202": {
    pt: "Minas de 0,5 mm para lapiseiras S.T. Dupont.",
    en: "0.5 mm leads for S.T. Dupont mechanical pencils.",
  },
  "040203": {
    pt: "Minas de 0,7 mm para lapiseiras S.T. Dupont.",
    en: "0.7 mm leads for S.T. Dupont mechanical pencils.",
  },
  "040205": {
    pt: "Minas de 0,7 mm para lapiseiras S.T. Dupont, embalagem de 12.",
    en: "0.7 mm leads for S.T. Dupont mechanical pencils, pack of 12.",
  },
  "040201": {
    pt: "Minas HB de 0,5 mm com duas borrachas de substituição, para lapiseiras S.T. Dupont.",
    en: "0.5 mm HB leads with two replacement erasers, for S.T. Dupont mechanical pencils.",
  },
  "040206": {
    pt: "Borrachas de substituição para lapiseiras S.T. Dupont, embalagem de 5.",
    en: "Replacement erasers for S.T. Dupont mechanical pencils, pack of 5.",
  },
  "040207": {
    pt: "Borrachas de substituição para as lapiseiras Défi, embalagem de 5.",
    en: "Replacement erasers for Défi mechanical pencils, pack of 5.",
  },
  "408811": {
    pt: "Mecanismo de substituição para lapiseiras S.T. Dupont.",
    en: "Replacement mechanism for S.T. Dupont mechanical pencils.",
  },

  // --- multifunção --------------------------------------------------------
  "040208": {
    pt: "Recargas para a caneta multifunção Défi, embalagem de 5.",
    en: "Refills for the Défi multifunction pen, pack of 5.",
  },
};

// Três fichas têm DUAS variantes cada, e a descrição vive no Product — se
// escrevêssemos o texto de cada variante no produto, a segunda apagava a
// primeira. Nesses casos o produto leva o texto comum (abaixo, por slug) e
// cada variante leva o seu em ProductVariant.description, que a PDP já lê
// (app/[lang]/p/[slug]/page.tsx monta um mapa SKU -> descrição).
const GENERICO: Record<string, Texto> = {
  "box-8-refills": {
    pt: "Pedras de sílex de substituição para isqueiros S.T. Dupont, em cartela de 8.",
    en: "Replacement flints for S.T. Dupont lighters, card of 8.",
  },
  "box-10-refills-lead-0-7mm": {
    pt: "Minas de 0,7 mm para lapiseiras S.T. Dupont.",
    en: "0.7 mm leads for S.T. Dupont mechanical pencils.",
  },
  "box-10-refills-eraser": {
    pt: "Borrachas de substituição para lapiseiras S.T. Dupont, embalagem de 5.",
    en: "Replacement erasers for S.T. Dupont mechanical pencils, pack of 5.",
  },
};

// Nomes a corrigir: chamavam-se "Caixa de 12" mas o preço é de unidade e a
// boutique só vende avulso. O 000434 já estava certo e serve de padrão.
const NOMES: Record<string, Texto> = {
  "000430": { pt: "Recarga de Gás · Spray — Preto", en: "Gas Refill · Spray — Black" },
  "000432": { pt: "Recarga de Gás · Cartucho Padrão — Amarelo", en: "Gas Refill · Standard Cartridge — Yellow" },
  "000433": { pt: "Recarga de Gás · Cartucho Padrão — Verde", en: "Gas Refill · Standard Cartridge — Green" },
  "000435": { pt: "Recarga de Gás · Cartucho Padrão — Vermelho", en: "Gas Refill · Standard Cartridge — Red" },
  "000436": { pt: "Recarga de Gás · Spray — Défi Extrême & Xxtrême", en: "Gas Refill · Spray — Défi Extrême & Xxtrême" },
};

async function main() {
  const vs = await prisma.productVariant.findMany({
    where: { sku: { in: Object.keys(TEXTOS) } },
    select: {
      sku: true,
      product: { select: { id: true, slug: true, name: true, description: true } },
    },
  });

  const achados = new Set(vs.map((v) => v.sku));
  const semFicha = Object.keys(TEXTOS).filter((s) => !achados.has(s));
  if (semFicha.length) console.log("(sem ficha na base, ignorados: " + semFicha.join(", ") + ")\n");

  let descs = 0;
  let nomes = 0;
  let porVariante = 0;

  // Agrupar por ficha: uma ficha com duas variantes não pode levar os dois
  // textos no mesmo campo.
  const fichas = new Map<string, typeof vs>();
  for (const v of vs) {
    if (!fichas.has(v.product.id)) fichas.set(v.product.id, [] as unknown as typeof vs);
    fichas.get(v.product.id)!.push(v);
  }

  for (const [, itens] of [...fichas.entries()].sort((a, b) =>
    a[1][0].sku.localeCompare(b[1][0].sku),
  )) {
    itens.sort((a, b) => a.sku.localeCompare(b.sku));
    const prod = itens[0].product;
    const partilhada = itens.length > 1;
    const generico = GENERICO[prod.slug];

    if (partilhada && !generico) {
      console.log("\n!! /" + prod.slug + " tem " + itens.length +
        " variantes e nao ha texto comum definido — ignorada para nao apagar uma com a outra.");
      continue;
    }

    const textoProduto = partilhada ? generico! : TEXTOS[itens[0].sku];
    const antigo = String((prod.description as Record<string, string> | null)?.pt ?? "")
      .replace(/\s+/g, " ")
      .trim();
    const nomeAntigo = String((prod.name as Record<string, string> | null)?.pt ?? "");
    const novoNome = partilhada ? undefined : NOMES[itens[0].sku];

    if (antigo !== textoProduto.pt) {
      descs++;
      console.log("\n" + itens.map((i) => i.sku).join(" + ") + "  /" + prod.slug);
      console.log("   antes: " + antigo.slice(0, 92) + (antigo.length > 92 ? "..." : ""));
      console.log("   novo:  " + textoProduto.pt);
    }
    if (novoNome && nomeAntigo !== novoNome.pt) {
      nomes++;
      console.log("   NOME:  " + nomeAntigo + "  ->  " + novoNome.pt);
    }
    if (partilhada) {
      for (const i of itens) {
        porVariante++;
        console.log("   variante " + i.sku + ": " + TEXTOS[i.sku].pt);
      }
    }

    if (APLICAR) {
      await prisma.product.update({
        where: { id: prod.id },
        data: { description: textoProduto, ...(novoNome ? { name: novoNome } : {}) },
      });
      if (partilhada) {
        for (const i of itens) {
          await prisma.productVariant.update({
            where: { sku: i.sku },
            data: { description: TEXTOS[i.sku] },
          });
        }
      }
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log(
    (APLICAR ? "ESCRITO: " : "SIMULACAO: ") + descs + " descricoes de ficha, " +
    porVariante + " descricoes de variante, " + nomes + " nomes",
  );
  if (!APLICAR) console.log("Nada foi gravado. Corre com --apply para gravar.");
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
