/**
 * Põe a coluna `stock` de acordo com o stock das lojas.
 *
 * A aplicação mantém `stock == stockLis + stockVng` em cada escrita — venda,
 * movimento, sync do ERP. Mas o carregamento inicial do catálogo encheu a
 * coluna com um valor fixo (25) e só as fichas que o ERP encontrou desde então
 * foram recalculadas. As outras ficaram a declarar unidades que não estão em
 * loja nenhuma.
 *
 * ATENÇÃO ao que isto NÃO é: estes artigos não são duplicados nem lixo. São
 * peças reais da Maison que neste momento não têm stock. Nenhuma ficha é
 * apagada, nenhuma sai do site. O que está errado é o NÚMERO na coluna, não o
 * artigo — e depois de corrigido eles continuam no site, marcados como sem
 * stock, que é o que já acontece hoje (a disponibilidade lê stockLis +
 * stockVng desde que isso foi corrigido).
 *
 * Só toca na coluna `stock`. Nunca inventa stock de loja a partir do total —
 * seria o erro inverso e muito pior, porque punha a loja a anunciar artigos
 * que não existem.
 *
 * Uso (SEM --apply não escreve nada):
 *   $env:DATABASE_URL="<url de produção>"; npx tsx scripts/normalizar-stock.ts
 *   $env:DATABASE_URL="<url de produção>"; npx tsx scripts/normalizar-stock.ts --apply
 */
import { prisma } from "@/lib/prisma";

const APPLY = process.argv.includes("--apply");

interface Linha {
  sku: string;
  stock: number;
  lis: number;
  vng: number;
  slug: string;
  vendas: bigint;
  movimentos: bigint;
}

async function main() {
  const host = (process.env.DATABASE_URL ?? "").replace(/\/\/[^@]*@/, "//***@");
  console.log(`DB: ${host || "(não definida)"}`);
  console.log(APPLY ? "MODO: APLICAR (escreve na base)\n" : "MODO: simulação (não escreve nada)\n");

  const linhas = await prisma.$queryRaw<Linha[]>`
    SELECT v."sku", v."stock", v."stockLis" AS lis, v."stockVng" AS vng, p."slug",
           (SELECT COUNT(*) FROM "SaleItem" si WHERE si."variantId" = v."id") AS vendas,
           (SELECT COUNT(*) FROM "StockMovement" sm WHERE sm."variantId" = v."id") AS movimentos
    FROM "ProductVariant" v JOIN "Product" p ON p."id" = v."productId"
    WHERE v."stock" <> v."stockLis" + v."stockVng"
    ORDER BY p."slug", v."sku"`;

  if (linhas.length === 0) {
    console.log("Nada a corrigir — a coluna `stock` já bate certo em todo o catálogo.");
    return;
  }

  // A declarar a menos é o caso interessante: quer dizer que alguém mexeu no
  // stock de loja sem recalcular o total, e não que sobrou lixo do seed.
  const aMais = linhas.filter((l) => l.stock > l.lis + l.vng);
  const aMenos = linhas.filter((l) => l.stock < l.lis + l.vng);

  const porValor = new Map<number, number>();
  for (const l of aMais) porValor.set(l.stock, (porValor.get(l.stock) ?? 0) + 1);

  console.log(`${linhas.length} variantes com a coluna desalinhada.\n`);
  console.log(`  a declarar a MAIS:  ${aMais.length}`);
  for (const [v, n] of [...porValor.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`      ${String(n).padStart(4)} × declaram ${v}`);
  }
  console.log(`  a declarar a MENOS: ${aMenos.length}`);
  for (const l of aMenos.slice(0, 10)) {
    console.log(`      ${l.sku.padEnd(10)} declara ${l.stock}, em loja ${l.lis + l.vng}   ${l.slug}`);
  }

  const totalAMais = aMais.reduce((s, l) => s + (l.stock - l.lis - l.vng), 0);
  console.log(`\n  unidades declaradas que não existem: ${totalAMais}`);

  // Uma ficha com vendas ou movimentos já passou pelas mãos da aplicação, que
  // mantém a coluna certa — se mesmo assim está torta, não é resíduo do seed e
  // vale a pena olhar antes de mexer.
  const comHistorico = linhas.filter((l) => Number(l.vendas) > 0 || Number(l.movimentos) > 0);
  if (comHistorico.length) {
    console.log(`\n⚠ ${comHistorico.length} têm vendas ou movimentos — não são resíduo do seed:`);
    for (const l of comHistorico.slice(0, 15)) {
      console.log(
        `    ${l.sku.padEnd(10)} declara ${String(l.stock).padStart(3)}, em loja ${l.lis + l.vng}` +
        `  (vendas ${l.vendas}, mov ${l.movimentos})  ${l.slug}`,
      );
    }
  }

  if (!APPLY) {
    console.log("\nSimulação — nada foi escrito. Corre outra vez com --apply para aplicar.");
    return;
  }

  const afectadas = await prisma.$executeRaw`
    UPDATE "ProductVariant"
    SET "stock" = "stockLis" + "stockVng", "updatedAt" = NOW()
    WHERE "stock" <> "stockLis" + "stockVng"`;
  console.log(`\n${afectadas} variantes alinhadas.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
