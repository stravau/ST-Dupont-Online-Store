// Traduz os TIPOS de artigo que ficaram em inglês nos nomes (Wallet, Backpack,
// Card Holder, Pouch…). O i18n-report não os apanhou: exigia palavras-função
// inglesas e >12 caracteres, e "Wallet" não tem nenhuma das duas coisas.
//
//   $env:DATABASE_URL = "<neon url>"
//   npx tsx scripts/i18n-names-apply.ts             # dry-run: mostra antes→depois
//   npx tsx scripts/i18n-names-apply.ts --apply     # grava
//
// Só toca no campo `pt`; o `en` fica intacto. Idempotente.
import "dotenv/config";
import * as fs from "fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const APPLY = process.argv.includes("--apply");
if (!process.env.DATABASE_URL) { console.error("DATABASE_URL não definido."); process.exit(1); }
// O .env local aponta para localhost. Sem $env:DATABASE_URL definido na sessão,
// o dotenv carrega esse e o erro que sai é um ECONNREFUSED pouco esclarecedor.
if (/localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL)) {
  console.error("\n⚠  DATABASE_URL aponta para localhost — não é a base de dados de produção.");
  console.error("   Define-a nesta janela do terminal antes de correr:\n");
  console.error('   $env:DATABASE_URL = "<a connection string do Neon>"\n');
  process.exit(1);
}
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

// Ordem importa: as expressões mais longas primeiro, senão "Card Holder"
// seria apanhado por "Holder". Chaves em minúsculas; a comparação é
// case-insensitive mas a substituição usa a forma da direita tal e qual.
const TERMOS: [RegExp, string][] = [
  // — compostos (têm de vir antes dos simples)
  [/\bbusiness card holder\b/gi, "Porta-Cartões de Visita"],
  [/\bpassport holder\b/gi, "Porta-Passaporte"],
  [/\bdocuments? holder\b/gi, "Porta-Documentos"],
  [/\bcard holders?\b/gi, "Porta-Cartões"],
  [/\bcardholders?\b/gi, "Porta-Cartões"],
  [/\bkey holders?\b/gi, "Porta-Chaves"],
  [/\bkey ?rings?\b/gi, "Porta-Chaves"],
  [/\bphone holder\b/gi, "Porta-Telemóvel"],
  [/\bpen holder\b/gi, "Porta-Canetas"],
  [/\blong wallet\b/gi, "Carteira Longa"],
  [/\bcoin purse\b/gi, "Porta-Moedas"],
  [/\bsmall cigar pouch\b/gi, "Bolsa Pequena para Charutos"],
  [/\bcigar pouch\b/gi, "Bolsa para Charutos"],
  // "2 cigar case" → "Estojo para 2 Charutos" (o número vem antes em inglês e
  // depois em português; sem esta regra saía "2 Estojo de Charuto").
  [/\b1 cigar case\b/gi, "Estojo para 1 Charuto"],
  [/\b(\d+) cigar cases?\b/gi, "Estojo para $1 Charutos"],
  [/\bcigar cases?\b/gi, "Estojo de Charuto"],
  [/\bcigar cutters?\b/gi, "Cortador de Charuto"],
  [/\bleather-?briefcase\b/gi, "Pasta em Couro"],
  [/\bcamera bags?\b/gi, "Mala Fotógrafo"],
  [/\btravel bags?\b/gi, "Mala de Viagem"],
  [/\bshoulder bags?\b/gi, "Mala de Ombro"],
  [/\bhand ?bags?\b/gi, "Mala de Mão"],
  [/\bweekend bags?\b/gi, "Mala de Fim-de-Semana"],
  [/\bshopping bags?\b/gi, "Saco de Compras"],
  [/\blighter cases?\b/gi, "Estojo para Isqueiro"],
  [/\bleather cases?\b/gi, "Estojo em Couro"],
  [/\bpen cases?\b/gi, "Estojo de Caneta"],
  [/\bglasses cases?\b/gi, "Estojo de Óculos"],
  [/\bpen refills?\b/gi, "Recarga de Caneta"],
  [/\bgas refills?\b/gi, "Recarga de Gás"],
  [/\breversible belts?\b/gi, "Cinto Reversível"],
  [/\bmoney clips?\b/gi, "Clip de Notas"],
  [/\btie clips?\b/gi, "Mola de Gravata"],
  [/\bgift box(?:es)?\b/gi, "Caixa de Oferta"],
  [/\bfountain pens?\b/gi, "Caneta de Tinta Permanente"],
  [/\bmechanical pencils?\b/gi, "Lapiseira"],
  // — simples
  [/\bwallets?\b/gi, "Carteira"],
  [/\bbriefcases?\b/gi, "Pasta"],
  [/\bbackpacks?\b/gi, "Mochila"],
  [/\bpouch(?:es)?\b/gi, "Bolsa"],
  [/\bcrossbody\b/gi, "Tiracolo"],
  [/\bbelts?\b/gi, "Cinto"],
  [/\bpurses?\b/gi, "Carteira"],
  [/\bclutch(?:es)?\b/gi, "Clutch"],
  [/\bashtrays?\b/gi, "Cinzeiro"],
  [/\bcufflinks?\b/gi, "Botões de Punho"],
  [/\bnotebooks?\b/gi, "Caderno"],
  [/\bbookmarks?\b/gi, "Marcador de Livros"],
  [/\bballpoints?\b/gi, "Esferográfica"],
  [/\bshopping\b/gi, "Saco de Compras"],
  [/\bcigarette cases?\b/gi, "Estojo para Cigarros"],
];

// Nomes próprios onde a palavra inglesa NÃO se traduz. Protegemo-los antes de
// substituir e repomo-los no fim — senão "X-Bag" viraria "X-Mala" e
// "Line D Eternity" ficaria intacto mas "Neo Capsule" perderia sentido.
const PROTEGIDOS = [
  "X-Bag", "Line D Eternity", "Line D", "Neo Capsule", "Fire X", "Horse Mane",
  "Game of Thrones", "Stones of Fortune", "Monogram 1872", "Défi Explorer",
  "Défi Millennium", "Haute Création", "Maki-e", "Final Flare", "Angel of Music",
  "Statue of Liberty", "Tower of Pisa", "Victory of Samothrace", "Le Grand Dupont",
  "Tote", // linha de malas da Maison — mantém-se
];

function traduzNome(nome: string): string {
  // 1) proteger nomes próprios com marcadores
  const guarda: string[] = [];
  let s = nome;
  PROTEGIDOS.forEach((p) => {
    const re = new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    s = s.replace(re, (m) => { guarda.push(m); return `\u0000${guarda.length - 1}\u0000`; });
  });
  // 2) traduzir os tipos
  for (const [re, pt] of TERMOS) s = s.replace(re, pt);
  // 3) repor os nomes próprios
  s = s.replace(/\u0000(\d+)\u0000/g, (_, i) => guarda[Number(i)]);
  return s.replace(/\s{2,}/g, " ").trim();
}

type L = { pt?: string; en?: string } | null;

(async () => {
  console.log(`\nTradução de nomes ${APPLY ? "— A APLICAR" : "— dry-run"}\n`);
  const [prods, variants] = await Promise.all([
    prisma.product.findMany({ select: { id: true, slug: true, name: true } }),
    prisma.productVariant.findMany({ select: { id: true, sku: true, name: true } }),
  ]);

  interface W { tabela: "Product" | "Variant"; id: string; ref: string; antes: string; depois: string; cur: L }
  const writes: W[] = [];

  for (const p of prods) {
    const cur = p.name as L; const pt = cur?.pt?.trim();
    if (!pt) continue;
    const novo = traduzNome(pt);
    if (novo !== pt) writes.push({ tabela: "Product", id: p.id, ref: p.slug, antes: pt, depois: novo, cur });
  }
  for (const v of variants) {
    const cur = v.name as L; const pt = cur?.pt?.trim();
    if (!pt) continue;
    const novo = traduzNome(pt);
    if (novo !== pt) writes.push({ tabela: "Variant", id: v.id, ref: v.sku, antes: pt, depois: novo, cur });
  }

  console.log(`Nomes a alterar: ${writes.length}\n`);
  writes.slice(0, 40).forEach((w) => {
    console.log(`  [${w.tabela}] ${w.ref}`);
    console.log(`     ${w.antes}`);
    console.log(`  →  ${w.depois}`);
  });
  if (writes.length > 40) console.log(`  … e mais ${writes.length - 40}`);

  // No dry-run grava sempre a lista completa em ficheiro — 347 linhas não cabem
  // no ecrã e é sobre a lista toda que se afinam as regras.
  if (!APPLY) {
    const dump = writes.map((w) => ({ tabela: w.tabela, ref: w.ref, antes: w.antes, depois: w.depois }));
    // Todos os nomes PT actuais, mesmo os que nenhuma regra tocou — para se ver
    // o que ficou por traduzir.
    const intactos: { tabela: string; ref: string; nome: string }[] = [];
    for (const p of prods) {
      const pt = (p.name as L)?.pt?.trim();
      if (pt && !writes.some((w) => w.tabela === "Product" && w.ref === p.slug)) {
        intactos.push({ tabela: "Product", ref: p.slug, nome: pt });
      }
    }
    for (const v of variants) {
      const pt = (v.name as L)?.pt?.trim();
      if (pt && !writes.some((w) => w.tabela === "Variant" && w.ref === v.sku)) {
        intactos.push({ tabela: "Variant", ref: v.sku, nome: pt });
      }
    }
    fs.writeFileSync("i18n-nomes-dryrun.json", JSON.stringify({ alterados: dump, intactos }, null, 1), "utf8");
    console.log(`\n✓ i18n-nomes-dryrun.json — ${dump.length} alterados · ${intactos.length} intactos`);
    console.log("Dry-run — nada gravado na base de dados.\n");
    await prisma.$disconnect();
    return;
  }
  if (!writes.length) { console.log("Nada a fazer.\n"); await prisma.$disconnect(); return; }

  console.log("\nA gravar…");
  let feitos = 0;
  for (const w of writes) {
    const data = { name: { ...((w.cur ?? {}) as object), pt: w.depois } };
    if (w.tabela === "Product") await prisma.product.update({ where: { id: w.id }, data });
    else await prisma.productVariant.update({ where: { id: w.id }, data });
    feitos++;
    if (feitos % 25 === 0 || feitos === writes.length) console.log(`  ${feitos}/${writes.length}…`);
  }
  try {
    await prisma.adminAction.create({
      data: { entityType: "UPLOAD_BATCH", action: "IMPORT", entityId: "i18n-nomes", note: `Nomes traduzidos: ${feitos}` },
    });
  } catch { /* auditoria acessória */ }
  console.log(`\n✓ ${feitos} nomes traduzidos.\n`);
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
