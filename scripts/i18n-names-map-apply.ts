// Aplica um mapa explícito de nomes: i18n-nomes-map.json, no formato
//   { "<nome PT actual>": "<nome PT corrigido>", … }
//
// Substitui a abordagem por regex (scripts/i18n-names-apply.ts), que se partia
// nos nomes compostos — "Blue Ballpoint Pen" saía "Blue Esferográfica Pen".
// O mapa é produzido por tradução assistida sobre a lista real de nomes.
//
//   $env:DATABASE_URL = "<neon url>"
//   npx tsx scripts/i18n-names-map-apply.ts            # dry-run
//   npx tsx scripts/i18n-names-map-apply.ts --apply    # grava
//
// Só toca no campo `pt` do JSON localizado; o `en` fica intacto. Idempotente.
import "dotenv/config";
import * as fs from "fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const APPLY = process.argv.includes("--apply");
const MAPA = "i18n-nomes-map.json";

if (!process.env.DATABASE_URL) { console.error("DATABASE_URL não definido."); process.exit(1); }
if (/localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL)) {
  console.error("\n⚠  DATABASE_URL aponta para localhost — não é a base de dados de produção.");
  console.error('   Define-a nesta janela:  $env:DATABASE_URL = "<string do Neon>"\n');
  process.exit(1);
}
if (!fs.existsSync(MAPA)) { console.error(`Falta ${MAPA}.`); process.exit(1); }

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const mapa: Record<string, string> = JSON.parse(fs.readFileSync(MAPA, "utf8"));

type L = { pt?: string; en?: string } | null;

(async () => {
  console.log(`\nNomes ${APPLY ? "— A APLICAR" : "— dry-run"} · ${Object.keys(mapa).length} entradas no mapa`);
  const [prods, variants] = await Promise.all([
    prisma.product.findMany({ select: { id: true, slug: true, name: true } }),
    prisma.productVariant.findMany({ select: { id: true, sku: true, name: true } }),
  ]);

  interface W { tabela: "Product" | "Variant"; id: string; ref: string; antes: string; depois: string; cur: L }
  const writes: W[] = [];
  const naoUsadas = new Set(Object.keys(mapa));

  const check = (tabela: "Product" | "Variant", id: string, ref: string, cur: L) => {
    const pt = cur?.pt?.trim();
    if (!pt) return;
    const novo = mapa[pt];
    if (!novo) return;
    naoUsadas.delete(pt);
    if (novo.trim() === pt) return; // o tradutor devolveu igual
    writes.push({ tabela, id, ref, antes: pt, depois: novo.trim(), cur });
  };
  for (const p of prods) check("Product", p.id, p.slug, p.name as L);
  for (const v of variants) check("Variant", v.id, v.sku, v.name as L);

  console.log(`  a alterar:            ${writes.length}`);
  console.log(`  chaves do mapa sem uso: ${naoUsadas.size}`);
  if (naoUsadas.size) [...naoUsadas].slice(0, 5).forEach((k) => console.log(`     (sem correspondência) ${k}`));

  console.log("\nAmostra:");
  writes.slice(0, 25).forEach((w) => console.log(`  ${w.antes}\n→ ${w.depois}\n`));
  if (writes.length > 25) console.log(`  … e mais ${writes.length - 25}`);

  if (!APPLY) {
    fs.writeFileSync("i18n-nomes-preview.json", JSON.stringify(writes.map((w) => ({ ref: w.ref, antes: w.antes, depois: w.depois })), null, 1), "utf8");
    console.log("\n✓ i18n-nomes-preview.json escrito. Dry-run — nada gravado.\n");
    await prisma.$disconnect();
    return;
  }

  console.log("\nA gravar…");
  let feitos = 0;
  for (const w of writes) {
    const data = { name: { ...((w.cur ?? {}) as object), pt: w.depois } };
    if (w.tabela === "Product") await prisma.product.update({ where: { id: w.id }, data });
    else await prisma.productVariant.update({ where: { id: w.id }, data });
    feitos++;
    if (feitos % 50 === 0 || feitos === writes.length) console.log(`  ${feitos}/${writes.length}…`);
  }
  try {
    await prisma.adminAction.create({
      data: { entityType: "UPLOAD_BATCH", action: "IMPORT", entityId: "i18n-nomes", note: `Nomes traduzidos: ${feitos}` },
    });
  } catch { /* auditoria acessória */ }
  console.log(`\n✓ ${feitos} nomes traduzidos.\n`);
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
