// Aplica na base de dados as traduções aprovadas (i18n-aprovado.json).
// Escreve só o campo `pt` de cada JSON localizado; o `en` fica intacto.
//
//   $env:DATABASE_URL = "<neon url>"
//   npx tsx scripts/i18n-apply.ts             # dry-run: mostra o que faria
//   npx tsx scripts/i18n-apply.ts --apply     # grava
//
// Idempotente: correr duas vezes dá o mesmo resultado. Faz 3 leituras em bloco
// (não uma por item) e só escreve o que mudou, com progresso a cada 25 linhas —
// contra o Neon, 155 leituras individuais faziam isto parecer pendurado.
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
  console.error(`Falta ${FILE} — exporta-o de i18n-review.html.`);
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

interface Aprovado { tabela: string; ref: string; campo: string; pt: string }
const items: Aprovado[] = JSON.parse(fs.readFileSync(FILE, "utf8"));

type L = { pt?: string; en?: string } | null;
const merge = (cur: unknown, pt: string) => ({ ...((cur ?? {}) as object), pt });

(async () => {
  console.log(`\n${items.length} traduções ${APPLY ? "— A APLICAR" : "— dry-run"}`);
  console.log("A ler o catálogo…");

  // Três leituras em bloco, em vez de uma por item.
  const [prods, variants, cats] = await Promise.all([
    prisma.product.findMany({ select: { id: true, slug: true, name: true, description: true, history: true } }),
    prisma.productVariant.findMany({ select: { id: true, sku: true, name: true, description: true } }),
    prisma.category.findMany({ select: { id: true, slug: true, name: true, tagline: true, history: true } }),
  ]);
  const byProd = new Map(prods.map((p) => [p.slug, p as unknown as Record<string, unknown>]));
  const byVar = new Map(variants.map((v) => [v.sku, v as unknown as Record<string, unknown>]));
  const byCat = new Map(cats.map((c) => [c.slug, c as unknown as Record<string, unknown>]));
  console.log(`  ${prods.length} produtos · ${variants.length} variantes · ${cats.length} categorias\n`);

  // Decidir o que muda ANTES de escrever.
  interface Write { tabela: string; id: string; campo: string; pt: string; ref: string }
  const writes: Write[] = [];
  let iguais = 0;
  const falhas: string[] = [];

  for (const it of items) {
    const row =
      it.tabela === "Product" ? byProd.get(it.ref) :
      it.tabela === "Variant" ? byVar.get(it.ref) :
      it.tabela === "Category" ? byCat.get(it.ref) : undefined;
    if (!row) { falhas.push(`${it.tabela} ${it.ref} não encontrado`); continue; }
    const cur = row[it.campo] as L;
    if (cur?.pt === it.pt) { iguais++; continue; }
    writes.push({ tabela: it.tabela, id: row.id as string, campo: it.campo, pt: it.pt, ref: it.ref });
  }

  console.log(`  a escrever:      ${writes.length}`);
  console.log(`  já iguais:       ${iguais}`);
  console.log(`  não encontradas: ${falhas.length}`);
  if (falhas.length) falhas.slice(0, 10).forEach((f) => console.log("     " + f));

  if (!APPLY) {
    console.log("\nDry-run — corre com --apply para gravar.\n");
    await prisma.$disconnect();
    return;
  }
  if (writes.length === 0) {
    console.log("\nNada a fazer — já está tudo aplicado.\n");
    await prisma.$disconnect();
    return;
  }

  console.log("\nA gravar…");
  let feitos = 0;
  const erros: string[] = [];
  for (const w of writes) {
    try {
      // Reler o campo actual para preservar o `en` (temos o valor em memória).
      const row =
        w.tabela === "Product" ? byProd.get(w.ref) :
        w.tabela === "Variant" ? byVar.get(w.ref) : byCat.get(w.ref);
      const data = { [w.campo]: merge(row?.[w.campo], w.pt) };
      if (w.tabela === "Product") await prisma.product.update({ where: { id: w.id }, data });
      else if (w.tabela === "Variant") await prisma.productVariant.update({ where: { id: w.id }, data });
      else await prisma.category.update({ where: { id: w.id }, data });
      feitos++;
      if (feitos % 25 === 0 || feitos === writes.length) {
        console.log(`  ${feitos}/${writes.length}…`);
      }
    } catch (e) {
      erros.push(`${w.tabela} ${w.ref}.${w.campo}: ${(e as Error).message.slice(0, 70)}`);
    }
  }

  try {
    await prisma.adminAction.create({
      data: {
        entityType: "UPLOAD_BATCH", action: "IMPORT", entityId: "i18n-traducoes",
        note: `Traduções PT aplicadas: ${feitos} campos`,
      },
    });
  } catch { /* auditoria é acessória — não falhar por causa dela */ }

  console.log(`\n✓ ${feitos} traduções aplicadas${erros.length ? ` · ${erros.length} erros` : ""}.`);
  if (erros.length) erros.slice(0, 10).forEach((e) => console.log("   " + e));
  console.log("");

  await prisma.$disconnect();
})().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
