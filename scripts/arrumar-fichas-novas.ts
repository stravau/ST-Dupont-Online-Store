// Arruma as fichas criadas em lote: põe-lhes foto de frente e dá-lhes o slug
// que as faz aparecer nos filtros certos.
//
// DOIS PROBLEMAS, ambos meus, ambos da mesma criação em lote:
//
// 1. O CARTÃO NÃO MOSTRAVA FOTOGRAFIA. O cartão de catálogo monta a galeria a
//    partir dos "swatches", e components/product-card.tsx só cria um swatch
//    quando a variante tem `attributes.color`. Estas vieram do Excel do ERP
//    com `{brand, source, unmapped}` e nada de cor, portanto ficavam sem
//    swatch nenhum e caíam no `product.image` — que eu deixei a nulo. Daí o
//    marcador de lugar num artigo que tem fotografias.
//    Correcção: Product.image passa a ser a primeira foto da variante.
//
// 2. NÃO APARECIAM NOS FILTROS. Os grupos de /t/<grupo> casam por SLUG
//    (lib/product-groups.ts: `isAshtray = /^ashtray/`, `isCutter =
//    /^cigar-cutter|^cutter-\d/`, etc.). Eu gerei os slugs a partir do nome em
//    português, portanto `cinzeiro-xl-preto-fumo` nunca casaria com
//    `^ashtray` e os cinzeiros novos não apareciam em Acessórios para
//    Fumadores → Cinzeiros.
//    Correcção: cada ficha passa a ter o slug na convenção dos seus irmãos,
//    com a referência no fim para garantir que é único.
//
// Os URL antigos deixam de existir, o que é indiferente: são páginas criadas
// ontem, sem ligações de lado nenhum e ainda fora do sitemap.
//
// COMO CORRER (PowerShell, na raiz do projecto):
//   $env:DATABASE_URL = "<a URL da Neon de producao>"
//   npx.cmd tsx scripts/arrumar-fichas-novas.ts          # simulacao
//   npx.cmd tsx scripts/arrumar-fichas-novas.ts --apply  # escreve

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

// SKU -> slug novo, na convenção dos irmãos já existentes no catálogo:
//   cinzeiros      ashtray-<tema>            (ashtray-fender, ashtray-cohiba)
//   cortadores     cutter-<ref>              (cutter-003480h, cutter-003393)
//   estojos        2-/3-cigar-case-<tema>    (2-cigar-case-koi-fish)
//   punhos         cufflinks-<tema>          (cufflinks-diamond-head)
//   clips          money-clip-<tema>         (money-clip-monogram-1872)
//   cadernos       notebook-<...>            (notebook)
//   carteiras      <linha>-wallet-<...>      (victoria-long-wallet)
//   totes          <linha>-tote-<...>        (victoria-tote)
//   bolsas isq.    lighter-case-<...>        (lighter-case-ligne-2)
// Isqueiros e canetas não têm filtro por slug — vivem da categoria e da
// colecção, que já estão certas — mas passam à mesma para inglês, para o
// catálogo não ficar com meia dúzia de slugs em português no meio.
const SLUGS: Record<string, string> = {
  // ---- cinzeiros: sem isto nao aparecem em /t/smoking?type=ashtrays -------
  STD006725: "ashtray-xl-smoke-006725",
  STD006726: "ashtray-xl-wave-006726",
  STD006737: "ashtray-xl-black-gold-006737",
  // ---- cortador ----------------------------------------------------------
  STD003377X: "cutter-003377x",
  // ---- estojos de charuto (ambos escondidos, sem foto) -------------------
  STD183016: "2-cigar-case-black-chrome-183016",
  STD183023: "3-cigar-case-blue-183023",
  // ---- botoes de punho ---------------------------------------------------
  STD005850: "cufflinks-black-lacquer-palladium-005850",
  STD005856: "cufflinks-diamond-head-round-gold-005856",
  STD005857: "cufflinks-diamond-head-square-silver-005857",
  STD005859: "cufflinks-trigger-lines-silver-005859",
  STD005860: "cufflinks-trigger-lines-gold-005860",
  // ---- clips de notas ----------------------------------------------------
  STD003087: "money-clip-lines-silver-003087",
  STD003088: "money-clip-lines-gold-003088",
  // ---- cadernos ----------------------------------------------------------
  STD007152: "notebook-a5-burgundy-007152",
  STD007153: "notebook-a5-grey-007153",
  STD007154: "notebook-a5-green-007154",
  // ---- pele --------------------------------------------------------------
  STD180342: "neo-capsule-wallet-navy-180342",
  STD1IO561BK1: "iconic-wallet-black-1io561bk1",
  STD1VS333BE2: "victoria-tote-suede-beige-1vs333be2",
  STD180023C: "lighter-case-le-grand-dupont-black-180023c",
  STD180123C: "lighter-case-le-grand-dupont-brown-180123c",
  // ---- isqueiros ---------------------------------------------------------
  STD010805: "minijet-black-010805",
  STD021600: "defi-extreme-021600",
  STD024006: "table-lighter-white-024006",
  STD027701: "slim-7-matte-chrome-027701",
  STD030031: "twiggy-white-gold-030031",
  STD030080: "twiggy-monogram-1872-grey-030080",
  STD030112: "twiggy-black-lacquer-gold-030112",
  STDC16085CL: "ligne-2-85th-anniversary-gold-c16085cl",
  STDC16180: "ligne-2-cling-1872-palladium-c16180",
  // ---- escrita -----------------------------------------------------------
  STD260203: "initial-black-chrome-260203",
  STD260204: "d-initial-duo-tone-chrome-260204",
  STD262205: "d-initial-rollerball-blue-chrome-262205",
  STD410039L: "line-d-vitruvian-fountain-pen-black-410039l",
  STD410040L: "line-d-vitruvian-fountain-pen-blue-410040l",
  STD410100M: "line-d-fountain-pen-black-palladium-410100m",
  STD410104M: "line-d-fountain-pen-blue-palladium-410104m",
  STD412039L: "line-d-vitruvian-rollerball-black-412039l",
  STD412040L: "line-d-vitruvian-rollerball-blue-412040l",
  STD420052LF: "line-d-eternity-pacific-gold-420052lf",
  STD462601: "liberte-rollerball-rose-gold-462601",
  STD465601: "liberte-ballpoint-rose-gold-465601",
  STD700005: "mini-pen-necklace-black-gold-700005",
};

async function main() {
  const vs = await prisma.productVariant.findMany({
    where: { sku: { in: Object.keys(SLUGS) } },
    select: {
      sku: true, images: true,
      product: { select: { id: true, slug: true, image: true, active: true } },
    },
  });
  const porSku = new Map(vs.map((v) => [v.sku, v]));

  let fotos = 0, renomeados = 0;
  const colisoes: string[] = [];

  for (const [sku, novoSlug] of Object.entries(SLUGS)) {
    const v = porSku.get(sku);
    if (!v) { console.log("!! " + sku + " nao encontrado"); continue; }

    const precisaFoto = !v.product.image && v.images.length > 0;
    const precisaSlug = v.product.slug !== novoSlug;

    // Um slug ja ocupado por OUTRA ficha faria a escrita rebentar na restricao
    // de unicidade — melhor apanhar isso na simulacao.
    if (precisaSlug) {
      const ocupado = await prisma.product.findUnique({
        where: { slug: novoSlug }, select: { id: true },
      });
      if (ocupado && ocupado.id !== v.product.id) {
        colisoes.push(novoSlug + " (pedido por " + sku + ")");
        continue;
      }
    }

    if (precisaFoto || precisaSlug) {
      console.log(
        sku.padEnd(13) +
        (precisaSlug ? v.product.slug.slice(0, 34).padEnd(36) + "-> " + novoSlug : novoSlug.padEnd(38) + "   ") +
        (precisaFoto ? "  + foto de frente" : "") +
        (v.product.active ? "" : "  (escondida)"),
      );
    }
    if (precisaFoto) fotos++;
    if (precisaSlug) renomeados++;

    if (APLICAR && (precisaFoto || precisaSlug)) {
      await prisma.product.update({
        where: { id: v.product.id },
        data: {
          ...(precisaSlug ? { slug: novoSlug } : {}),
          ...(precisaFoto ? { image: v.images[0] } : {}),
        },
      });
    }
  }

  if (colisoes.length) {
    console.log("\n!! SLUGS JA OCUPADOS — nao mexidos:");
    for (const c of colisoes) console.log("   " + c);
  }

  console.log("\n" + "=".repeat(70));
  console.log((APLICAR ? "ESCRITO: " : "SIMULACAO: ") + renomeados + " slugs, " + fotos + " fotos de frente");

  // Fora do lote: ha mais alguma ficha publicada no mesmo estado?
  const orfas = await prisma.product.findMany({
    where: { active: true, image: null, slug: { not: "unmapped-inventory" } },
    select: { id: true, slug: true, variants: { select: { images: true } } },
  });
  const mudas = orfas.filter((p) => p.variants.some((v) => v.images.length > 0));
  if (mudas.length) {
    // Mesmo defeito, fichas mais antigas: tem fotografias na variante mas o
    // cartao mostra o marcador de lugar porque a ficha nao tem foto de frente
    // e a variante nao tem cor que gere swatch. Corrige-se igual.
    console.log("\nOUTRAS fichas publicadas no mesmo estado: " + mudas.length);
    for (const p of mudas) {
      const primeira = p.variants.find((v) => v.images.length > 0)!.images[0];
      console.log("   /" + p.slug.padEnd(38) + " -> " + primeira.slice(0, 52));
      if (APLICAR) {
        await prisma.product.update({ where: { id: p.id }, data: { image: primeira } });
      }
    }
  }
  if (!APLICAR) console.log("\nNada foi gravado. Corre com --apply para gravar.");
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
