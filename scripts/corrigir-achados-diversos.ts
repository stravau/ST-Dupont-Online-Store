// Os achados soltos da auditoria ao catálogo — os que não davam script próprio.
//
// C1  Um rollerball com slug de cortador. `cutter-422024l` é a Line D Eternity
//     Graff'ty em rollerball; como o filtro casa por slug, aparecia em
//     Acessórios para Fumadores → Cortadores de Charuto. É o irmão do
//     `cutter-420024l` (a versão de tinta permanente) que já foi corrigido.
//
// E2  Duas fichas publicadas SEM VARIANTES. Sem variante não há preço nem
//     stock, e a página de produto responde 404 pelo guarda que já lá está —
//     ou seja, estavam listadas mas não abriam. Ficam despublicadas.
//
// A2  Nomes crus do ERP. Ao criar as 43 fichas dei nome próprio ao produto mas
//     deixei o da variante como vinha do Excel ("ESF. LIBERTE OURO ROSA").
//     Não se vê na loja, mas vê-se no admin e no POS, que é onde o pessoal da
//     boutique trabalha. Passa a acompanhar o nome da ficha.
//     Mais uma ficha escondida com nome cru: "CAN. NLD L L AURORE YG".
//
// COMO CORRER (PowerShell, na raiz do projecto):
//   $env:DATABASE_URL = "<a URL da Neon de producao>"
//   npx.cmd tsx scripts/corrigir-achados-diversos.ts          # simulacao
//   npx.cmd tsx scripts/corrigir-achados-diversos.ts --apply  # escreve

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

// A ficha escondida com nome cru. NLD = Néo-Classique Line D, YG = yellow gold.
const NLD = {
  slug: "can-nld-l-l-aurore-yg-134l",
  novo: {
    pt: "Caneta Néo-Classique Line D L · L'Aurore — Ouro Amarelo",
    en: "Néo-Classique Line D L Pen · L'Aurore — Yellow Gold",
  },
};

async function main() {
  let n = 0;

  // ---- C1 rollerball com slug de cortador --------------------------------
  const roller = await prisma.product.findUnique({
    where: { slug: "cutter-422024l" }, select: { id: true, name: true },
  });
  const NOVO = "line-d-eternity-graffty-rollerball-422024l";
  if (roller) {
    const ocupado = await prisma.product.findUnique({ where: { slug: NOVO }, select: { id: true } });
    if (ocupado && ocupado.id !== roller.id) console.log("!! " + NOVO + " ja ocupado");
    else {
      n++;
      console.log("C1  " + loc(roller.name).slice(0, 52));
      console.log("    /cutter-422024l  ->  /" + NOVO + "   (sai dos Cortadores)");
      if (APLICAR) await prisma.product.update({ where: { id: roller.id }, data: { slug: NOVO } });
    }
  }

  // ---- E2 fichas publicadas sem variantes --------------------------------
  const vazias = await prisma.product.findMany({
    where: { active: true, variants: { none: {} } },
    select: { id: true, slug: true, name: true },
  });
  for (const p of vazias) {
    n++;
    console.log("E2  /" + p.slug.padEnd(34) + "\"" + loc(p.name).slice(0, 40) + "\"  -> despublicada");
    if (APLICAR) {
      await prisma.product.update({ where: { id: p.id }, data: { active: false } });
      await prisma.adminAction.create({
        data: {
          entityType: "PRODUCT", action: "UPDATE", entityId: p.slug,
          note: "Despublicada por nao ter variantes (sem preco nem stock; a PDP dava 404)",
          before: { active: true } as object, after: { active: false } as object,
        },
      });
    }
  }

  // ---- A2 nomes crus -----------------------------------------------------
  const nld = await prisma.product.findUnique({ where: { slug: NLD.slug }, select: { id: true, name: true } });
  if (nld && loc(nld.name) !== NLD.novo.pt) {
    n++;
    console.log("A2  " + loc(nld.name) + "  ->  " + NLD.novo.pt);
    if (APLICAR) await prisma.product.update({ where: { id: nld.id }, data: { name: NLD.novo } });
  }

  // Variantes das 43 fichas novas: nome da variante = nome da ficha.
  const crus = await prisma.productVariant.findMany({
    where: { sku: { startsWith: "STD" }, product: { slug: { not: "unmapped-inventory" } } },
    select: { id: true, sku: true, name: true, product: { select: { name: true, slug: true } } },
  });
  const CRU = /\b(?:ESF|ROL|CAN|ISQ|CART|BOT-PUNHO|BOLSA ISQ|CX)\b\.?|^[A-ZÀ-Ú0-9 .,&/·-]{12,}$/;
  for (const v of crus) {
    const vn = loc(v.name);
    const pn = loc(v.product.name);
    if (!CRU.test(vn) || vn === pn) continue;
    n++;
    console.log("A2  " + v.sku.padEnd(13) + vn.slice(0, 32).padEnd(34) + "->  " + pn.slice(0, 44));
    if (APLICAR) {
      await prisma.productVariant.update({
        where: { id: v.id },
        data: { name: { pt: pn, en: loc(v.product.name, "en") } },
      });
    }
  }

  console.log("\n" + "=".repeat(70));
  console.log((APLICAR ? "ESCRITO: " : "SIMULACAO: ") + n + " correccoes");
  if (!APLICAR) console.log("Nada foi gravado. Corre com --apply para gravar.");
  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
