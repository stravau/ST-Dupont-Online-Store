/**
 * Corrige os nomes das fichas de recarga de escrita.
 *
 * O prefixo de cada uma foi parar ao artigo errado algures na importação: as
 * esferográficas chamavam-se "Pistões para Caneta de Tinteiro", os cartuchos
 * de tinta e as minas chamavam-se "Caixa de 10 Recargas Rollerball". O que
 * vem depois do "·" estava certo — só o começo é que mentia.
 *
 * As contagens saem dos nomes: as recargas vendem-se à unidade e o preço da
 * ficha é o de cada uma, portanto "(Cx. 10)" era falso. Fica a contagem só
 * onde a caixa É a unidade de venda — os cartuchos de tinta vêm em caixa de 6,
 * as borrachas em caixa de 5.
 *
 * Uso (SEM --apply não escreve nada):
 *   $env:DATABASE_URL="<url de produção>"; npx tsx scripts/refills-nomes.ts
 *   $env:DATABASE_URL="<url de produção>"; npx tsx scripts/refills-nomes.ts --apply
 */
import { prisma } from "@/lib/prisma";

const APPLY = process.argv.includes("--apply");

interface Nome {
  pt: string;
  en: string;
}

// Nome da VARIANTE, por referência. Transcrito das páginas REFILLS da
// Collection Internationale.
const NOMES: Record<string, Nome> = {
  // Esferográficas — família Olympio / Néo-Classique / Classique 2 / …
  "040850": { pt: "Recarga Esferográfica — Azul", en: "Ballpoint Refill — Blue" },
  "040851": { pt: "Recarga Esferográfica — Preto", en: "Ballpoint Refill — Black" },
  // Esferográficas — família Défi / Liberté / Line D / D-Initial / …
  "040853": { pt: "Recarga Esferográfica — Azul", en: "Ballpoint Refill — Blue" },
  "040854": { pt: "Recarga Esferográfica — Preto", en: "Ballpoint Refill — Black" },
  "040358": { pt: "Recarga Esferográfica — Rosa", en: "Ballpoint Refill — Pink" },
  "040359": { pt: "Recarga Esferográfica — Vermelho", en: "Ballpoint Refill — Red" },
  "040360": { pt: "Recarga Esferográfica — Verde", en: "Ballpoint Refill — Green" },
  "040361": { pt: "Recarga Esferográfica — Turquesa", en: "Ballpoint Refill — Turquoise" },
  // Esferográficas do Classique anterior a 1999 — secção própria no catálogo.
  "040770": { pt: "Recarga Esferográfica Classique — Azul", en: "Classique Ballpoint Refill — Blue" },
  "040771": { pt: "Recarga Esferográfica Classique — Preto", en: "Classique Ballpoint Refill — Black" },
  // Roller convertível.
  "040840": { pt: "Recarga Rollerball — Azul", en: "Rollerball Refill — Blue" },
  "040841": { pt: "Recarga Rollerball — Preto", en: "Rollerball Refill — Black" },
  "040830": { pt: "Recarga Ponta de Feltro — Azul", en: "Fibre Tip Refill — Blue" },
  "040831": { pt: "Recarga Ponta de Feltro — Preto", en: "Fibre Tip Refill — Black" },
  "040843": { pt: "Recarga Rollerball Mini — Preto", en: "Mini Rollerball Refill — Black" },
  // Cartuchos de tinta — aqui a caixa É a unidade de venda.
  "040110": { pt: "Cartuchos de Tinta (Cx. 6) — Preto", en: "Ink Cartridges (Box of 6) — Black" },
  "040112": { pt: "Cartuchos de Tinta (Cx. 6) — Azul Real", en: "Ink Cartridges (Box of 6) — Royal Blue" },
  "040364": { pt: "Cartuchos de Tinta (Cx. 6) — Turquesa", en: "Ink Cartridges (Box of 6) — Turquoise" },
  "040362": { pt: "Cartuchos de Tinta (Cx. 6) — Vermelho", en: "Ink Cartridges (Box of 6) — Red" },
  "040363": { pt: "Cartuchos de Tinta (Cx. 6) — Verde", en: "Ink Cartridges (Box of 6) — Green" },
  "408812": { pt: "Pistão Conversor", en: "Piston Converter" },
  // Lapiseira.
  "040202": { pt: "Minas 0,5 mm", en: "Pencil Leads 0.5 mm" },
  "040203": { pt: "Minas 0,7 mm", en: "Pencil Leads 0.7 mm" },
  "040205": { pt: "Minas 0,7 mm (Cx. 12)", en: "Pencil Leads 0.7 mm (Box of 12)" },
  // As duas borrachas não se distinguem pela cor — os tubos são ambos pretos.
  // A 040206 é a normal (secção Classique do catálogo); a 040207 é a Défi, e
  // serve o Défi Multifunção, o Liberté–Line D e o Mini Olympio. Vem escrito
  // na própria embalagem: "5 gommes" contra "5 gommes Défi".
  "040206": { pt: "Borrachas (Cx. 5)", en: "Erasers (Box of 5)" },
  "040207": { pt: "Borrachas Défi (Cx. 5)", en: "Défi Erasers (Box of 5)" },
  "040201": { pt: "Minas HB 0,5 mm e 2 Borrachas", en: "HB Leads 0.5 mm and 2 Erasers" },
  "408811": { pt: "Mecanismo de Lapiseira", en: "Propelling Pencil Mechanism" },
  // Défi Multifunção — esferográfica preta, azul e vermelha, marcador e stylus.
  "040208": { pt: "Recargas Défi Multifunção (Cx. 5)", en: "Défi Multifunction Refills (Box of 5)" },
};

// Produtos que juntam mais do que uma referência precisam de um nome que
// sirva as duas — senão o título da ficha contradiz a variante escolhida.
const NOMES_PRODUTO: Record<string, Nome> = {
  "box-10-refills-lead-0-7mm": { pt: "Minas 0,7 mm", en: "Pencil Leads 0.7 mm" },
  "box-10-refills-eraser": { pt: "Borrachas (Cx. 5)", en: "Erasers (Box of 5)" },
};

// A etiqueta de cor é o que a listagem escreve por baixo do título, e nestas
// duas fichas de duas variantes ela dizia "Preto" e "Branco" — os tubos são
// ambos pretos, e o que separa os artigos não é a cor. Nos dois casos os dois
// cartões saíam iguais, indistinguíveis para quem procura.
const ETIQUETAS: Record<string, Nome> = {
  "040203": { pt: "Standard", en: "Standard" },
  "040205": { pt: "Cx. 12", en: "Box of 12" },
  "040206": { pt: "Standard", en: "Standard" },
  "040207": { pt: "Défi", en: "Défi" },
};

async function main() {
  const host = (process.env.DATABASE_URL ?? "").replace(/\/\/[^@]*@/, "//***@");
  console.log(`DB: ${host || "(não definida)"}`);
  console.log(APPLY ? "MODO: APLICAR (escreve na base)\n" : "MODO: simulação (não escreve nada)\n");

  const vs = await prisma.productVariant.findMany({
    where: { sku: { in: Object.keys(NOMES) } },
    include: { product: { select: { id: true, slug: true, name: true, _count: { select: { variants: true } } } } },
    orderBy: { sku: "asc" },
  });

  const emFalta = Object.keys(NOMES).filter((r) => !vs.some((v) => v.sku === r));
  if (emFalta.length) console.log(`⚠ não existem no catálogo: ${emFalta.join(", ")}\n`);

  // Um produto de uma variante só herda o nome dela; os partilhados têm o seu.
  const produtos = new Map<string, Nome>();
  for (const v of vs) {
    const proprio = NOMES_PRODUTO[v.product.slug];
    if (proprio) produtos.set(v.product.id, proprio);
    else if (v.product._count.variants === 1) produtos.set(v.product.id, NOMES[v.sku]);
  }

  let variantes = 0;
  console.log("═══ VARIANTES ═══\n");
  for (const v of vs) {
    const novo = NOMES[v.sku];
    const atual = v.name as Nome;
    if (atual.pt === novo.pt && atual.en === novo.en) continue;
    variantes++;
    console.log(`  ${v.sku}  ${atual.pt}`);
    console.log(`          → ${novo.pt}`);
  }

  console.log("\n═══ PRODUTOS ═══\n");
  let prods = 0;
  const vistos = new Set<string>();
  for (const v of vs) {
    if (vistos.has(v.product.id)) continue;
    vistos.add(v.product.id);
    const novo = produtos.get(v.product.id);
    const atual = v.product.name as Nome;
    if (!novo) {
      console.log(`  ? ${v.product.slug} tem ${v.product._count.variants} variantes e não está em NOMES_PRODUTO — fica como está`);
      continue;
    }
    if (atual.pt === novo.pt && atual.en === novo.en) continue;
    prods++;
    console.log(`  ${v.product.slug}`);
    console.log(`          ${atual.pt}`);
    console.log(`          → ${novo.pt}`);
  }

  console.log("\n═══ ETIQUETAS ═══\n");
  let etiquetas = 0;
  for (const [sku, nova] of Object.entries(ETIQUETAS)) {
    const v = vs.find((x) => x.sku === sku);
    if (!v) continue;
    const atual = (v.attributes as { color?: { label?: Nome } } | null)?.color?.label;
    if (atual?.pt === nova.pt) continue;
    etiquetas++;
    console.log(`  ${sku}  "${atual?.pt ?? "-"}"  →  "${nova.pt}"`);
  }

  console.log(
    `\nResumo: ${variantes} variantes, ${prods} produtos e ${etiquetas} etiquetas a corrigir.`,
  );
  if (!APPLY) {
    console.log("\nSimulação — nada foi escrito. Corre outra vez com --apply para aplicar.");
    return;
  }

  await prisma.$transaction(async (tx) => {
    for (const v of vs) {
      const etiqueta = ETIQUETAS[v.sku];
      const attrs = (v.attributes ?? {}) as Record<string, unknown>;
      const cor = attrs.color as { hex?: string[] } | undefined;
      await tx.productVariant.update({
        where: { id: v.id },
        data: {
          name: NOMES[v.sku],
          ...(etiqueta
            ? { attributes: { ...attrs, color: { label: etiqueta, hex: cor?.hex ?? ["#15171c"] } } }
            : {}),
        },
      });
    }
    for (const [id, nome] of produtos) {
      await tx.product.update({ where: { id }, data: { name: nome } });
    }
  }, { timeout: 60_000, maxWait: 15_000 });

  console.log("\nFeito.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
