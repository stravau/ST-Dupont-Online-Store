// Só entra no site o que estiver completo: uma ficha sem uma única
// fotografia é despublicada.
//
// PORQUÊ: uma ficha com o marcador de lugar é pior do que ficha nenhuma. O
// cliente vê um cartão vazio numa montra de luxo e conclui que o site está
// avariado. Decisão do patrão: no site só o que estiver completo.
//
// O QUE FAZ, nos dois sentidos:
//   ESCONDER    ficha activa sem foto nenhuma  -> active: false
//   REPUBLICAR  ficha que ESTE script escondeu -> active: true, assim que
//               ganhar fotografia
//
// A republicação é deliberadamente estreita: só toca em fichas que ele
// próprio escondeu (reconhecidas pelo registo em AdminAction). Sem isso,
// correr o script ressuscitaria produtos que alguém desactivou de propósito,
// por outra razão qualquer.
//
// A ficha NÃO é apagada e a variante NÃO volta para o saco: o nome, a
// categoria, a colecção e a descrição ficam prontos, e o stock continua a
// contar para a loja e para o POS. Quando a fotografia chegar, é correr isto
// outra vez.
//
// NOTA: a página de produto não verifica `active` — quem tiver o URL directo
// ainda lá chega. Deixa de estar ligada em qualquer lado e sai do sitemap,
// que filtra por active.
//
// COMO CORRER (PowerShell, na raiz do projecto):
//   $env:DATABASE_URL = "<a URL da Neon de producao>"
//   npx.cmd tsx scripts/publicar-so-com-foto.ts          # simulacao
//   npx.cmd tsx scripts/publicar-so-com-foto.ts --apply  # escreve

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

const SACO = "unmapped-inventory";
const MARCA = "Despublicada por nao ter fotografia";

async function main() {
  const ps = await prisma.product.findMany({
    where: { slug: { not: SACO } },
    select: {
      id: true, slug: true, name: true, active: true, image: true,
      category: { select: { slug: true } },
      variants: { select: { sku: true, images: true, stock: true } },
    },
  });

  const semFoto = (p: (typeof ps)[number]) =>
    !p.image && p.variants.every((v) => v.images.length === 0);
  const nome = (p: (typeof ps)[number]) =>
    String((p.name as Record<string, string> | null)?.pt ?? p.slug);

  // Quais foram escondidas por nós — só essas podem ser republicadas.
  //
  // O marcador guarda o ID, não o slug: os slugs mudaram depois de as fichas
  // terem sido escondidas (passaram de português para a convenção inglesa dos
  // irmãos) e o reconhecimento por slug deixou de bater. O id não muda nunca.
  const marcas = await prisma.adminAction.findMany({
    where: { entityType: "PRODUCT", action: "UPDATE", note: MARCA },
    select: { entityId: true, after: true },
  });
  const nossas = new Set<string>();
  for (const m of marcas) {
    if (m.entityId) nossas.add(m.entityId);
    const id = (m.after as { id?: string } | null)?.id;
    if (id) nossas.add(id);
  }

  const esconder = ps.filter((p) => p.active && semFoto(p));
  const republicar = ps.filter((p) => !p.active && !semFoto(p) && (nossas.has(p.slug) || nossas.has(p.id)));

  if (esconder.length) {
    console.log("A ESCONDER (activas, sem uma unica fotografia):");
    for (const p of esconder.sort((a, b) => a.category.slug.localeCompare(b.category.slug))) {
      const stock = p.variants.reduce((a, v) => a + v.stock, 0);
      console.log(
        "   " + p.category.slug.padEnd(11) + nome(p).slice(0, 46).padEnd(48) +
        stock + "un  /" + p.slug,
      );
    }
  }
  if (republicar.length) {
    console.log("\nA REPUBLICAR (ja tem fotografia):");
    for (const p of republicar) console.log("   " + nome(p).slice(0, 46).padEnd(48) + "/" + p.slug);
  }
  if (!esconder.length && !republicar.length) console.log("Nada a fazer — o site so tem fichas completas.");

  if (APLICAR) {
    for (const p of esconder) {
      await prisma.$transaction([
        prisma.product.update({ where: { id: p.id }, data: { active: false } }),
        prisma.adminAction.create({
          data: {
            entityType: "PRODUCT", action: "UPDATE", entityId: p.slug, note: MARCA,
            before: { active: true } as object, after: { active: false, id: p.id } as object,
          },
        }),
      ]);
    }
    for (const p of republicar) {
      await prisma.$transaction([
        prisma.product.update({ where: { id: p.id }, data: { active: true } }),
        prisma.adminAction.create({
          data: {
            entityType: "PRODUCT", action: "UPDATE", entityId: p.slug,
            note: "Republicada — ja tem fotografia",
            before: { active: false } as object, after: { active: true } as object,
          },
        }),
      ]);
    }
  }

  console.log("\n" + "=".repeat(64));
  console.log((APLICAR ? "ESCRITO: " : "SIMULACAO: ") + esconder.length + " escondidas, " +
    republicar.length + " republicadas");
  console.log("fichas activas depois disto: " +
    (ps.filter((p) => p.active).length - esconder.length + republicar.length));
  if (!APLICAR) console.log("Nada foi gravado. Corre com --apply para gravar.");
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
