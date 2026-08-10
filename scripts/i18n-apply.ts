// Aplica na base de dados as traduções APROVADAS na página de revisão.
// Lê i18n-aprovado.json (exportado por i18n-review.html) e escreve o campo
// `pt` de cada JSON localizado, deixando o `en` intacto.
//
//   $env:DATABASE_URL = "<neon url>"
//   npx tsx scripts/i18n-apply.ts             # dry-run: mostra o que faria
//   npx tsx scripts/i18n-apply.ts --apply     # grava
//
// Idempotente: correr duas vezes dá o mesmo resultado. Regista um AdminAction
// por lote para ficar em auditoria.
import "dotenv/config";
import * as fs from "fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const APPLY = process.argv.includes("--apply");
const FILE = "i18n-aprovado.json";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL não está definido. Aborta.");
  process.exit(1);
}
if (!fs.existsSync(FILE)) {
  console.error(`Falta ${FILE} — exporta-o primeiro a partir de i18n-review.html.`);
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

interface Aprovado { tabela: string; ref: string; campo: string; pt: string }
const items: Aprovado[] = JSON.parse(fs.readFileSync(FILE, "utf8"));

type L = { pt?: string; en?: string } | null;
const merge = (cur: unknown, pt: string) => {
  const c = (cur ?? {}) as { pt?: string; en?: string };
  return { ...c, pt };
};

(async () => {
  console.log(`${items.length} traduções aprovadas ${APPLY ? "(A APLICAR)" : "(dry-run)"}\n`);

  let ok = 0, saltadas = 0, iguais = 0;
  const falhas: string[] = [];

  for (const it of items) {
    try {
      if (it.tabela === "Product") {
        const row = await prisma.product.findUnique({
          where: { slug: it.ref },
          select: { id: true, name: true, description: true, history: true },
        });
        if (!row) { falhas.push(`Product ${it.ref} não encontrado`); saltadas++; continue; }
        const cur = (row as unknown as Record<string, L>)[it.campo];
        if (cur?.pt === it.pt) { iguais++; continue; }
        if (APPLY) {
          await prisma.product.update({ where: { id: row.id }, data: { [it.campo]: merge(cur, it.pt) } });
        }
        ok++;
      } else if (it.tabela === "Variant") {
        const row = await prisma.productVariant.findUnique({
          where: { sku: it.ref },
          select: { id: true, name: true, description: true },
        });
        if (!row) { falhas.push(`Variant ${it.ref} não encontrado`); saltadas++; continue; }
        const cur = (row as unknown as Record<string, L>)[it.campo];
        if (cur?.pt === it.pt) { iguais++; continue; }
        if (APPLY) {
          await prisma.productVariant.update({ where: { id: row.id }, data: { [it.campo]: merge(cur, it.pt) } });
        }
        ok++;
      } else if (it.tabela === "Category") {
        const row = await prisma.category.findUnique({
          where: { slug: it.ref },
          select: { id: true, name: true, tagline: true, history: true },
        });
        if (!row) { falhas.push(`Category ${it.ref} não encontrada`); saltadas++; continue; }
        const cur = (row as unknown as Record<string, L>)[it.campo];
        if (cur?.pt === it.pt) { iguais++; continue; }
        if (APPLY) {
          await prisma.category.update({ where: { id: row.id }, data: { [it.campo]: merge(cur, it.pt) } });
        }
        ok++;
      } else {
        falhas.push(`tabela desconhecida: ${it.tabela}`);
        saltadas++;
      }
    } catch (e) {
      falhas.push(`${it.tabela} ${it.ref}.${it.campo}: ${(e as Error).message.slice(0, 80)}`);
      saltadas++;
    }
  }

  console.log(`  a escrever:      ${ok}`);
  console.log(`  já iguais:       ${iguais}`);
  console.log(`  saltadas/falhas: ${saltadas}`);
  if (falhas.length) {
    console.log("\nFalhas:");
    for (const f of falhas.slice(0, 15)) console.log("  " + f);
  }

  if (APPLY && ok > 0) {
    await prisma.adminAction.create({
      data: {
        entityType: "UPLOAD_BATCH", action: "IMPORT", entityId: "i18n-traducoes",
        note: `Traduções PT aplicadas: ${ok} campos`,
      },
    });
    console.log("\n✓ Aplicado e registado em Auditoria.");
  } else if (!APPLY) {
    console.log("\nDry-run — corre com --apply para gravar.");
  }

  await prisma.$disconnect();
})().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
