// Segundo levantamento, focado nos NOMES: o i18n-report exigia palavras-função
// inglesas ("the/and/with") e mais de 12 caracteres, por isso deixou passar
// nomes curtos de tipo de artigo — "Wallet", "Card Holder", "Backpack".
// Este procura termos ingleses de produto em Product.name e ProductVariant.name.
//
//   $env:DATABASE_URL = "<neon url>"
//   npx tsx scripts/i18n-names-report.ts          # resumo
//   npx tsx scripts/i18n-names-report.ts --csv    # + i18n-nomes-todo.csv
import "dotenv/config";
import * as fs from "fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const CSV = process.argv.includes("--csv");
if (!process.env.DATABASE_URL) { console.error("DATABASE_URL não definido."); process.exit(1); }
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

// Termos ingleses de TIPO de artigo. Não inclui nomes de linha/coleção
// (Line D, Fire X…) nem palavras que em PT se escrevem igual.
const EN_TERMS = [
  "wallet", "long wallet", "briefcase", "leather-briefcase", "backpack", "pouch",
  "passport holder", "card holder", "cardholder", "business card holder",
  "key holder", "keyring", "key ring", "document holder", "documents holder",
  "tote", "camera bag", "travel bag", "shoulder bag", "hand bag", "handbag",
  "crossbody", "belt", "reversible belt", "purse", "clutch", "duffle", "satchel",
  "coin purse", "cigar case", "cigar cutter", "leather case", "lighter case",
  "pen case", "pen refill", "gas refill", "ashtray", "humidor", "money clip",
  "cufflinks", "tie clip", "gift box", "notebook", "bookmark", "trunk",
  "ballpoint", "rollerball", "fountain pen", "pencil", "mechanical pencil",
  "small leather goods", "set", "case", "holder", "bag", "refill", "box",
];
const RE = new RegExp("\\b(" + EN_TERMS.sort((a, b) => b.length - a.length).join("|") + ")\\b", "i");

// Nomes de linha/coleção onde a palavra inglesa é parte do nome próprio e NÃO
// se traduz (evita falsos positivos).
const PROPRIOS = /Line D|Fire X|Horse Mane|Game of Thrones|Stones of Fortune|Neo Capsule|Monogram 1872|Final Flare|Angel of Music|Year of the|Statue of Liberty|Tower of Pisa|Victory of Samothrace|X-Bag|Défi|Maki-e|Haute Création/i;

type L = { pt?: string; en?: string } | null;

(async () => {
  const [prods, variants] = await Promise.all([
    prisma.product.findMany({ select: { slug: true, name: true } }),
    prisma.productVariant.findMany({ select: { sku: true, name: true } }),
  ]);

  interface Row { tabela: string; ref: string; pt: string; termo: string }
  const rows: Row[] = [];

  const check = (tabela: string, ref: string, val: L) => {
    const pt = val?.pt?.trim();
    if (!pt) return;
    // Remover as partes que são nome próprio antes de procurar termos ingleses.
    const semProprios = pt.split(/\s*·\s*/).filter((parte) => !PROPRIOS.test(parte)).join(" · ");
    const m = semProprios.match(RE);
    if (m) rows.push({ tabela, ref, pt, termo: m[1] });
  };

  for (const p of prods) check("Product", p.slug, p.name as L);
  for (const v of variants) check("Variant", v.sku, v.name as L);

  console.log(`\n═══ NOMES com termos ingleses ═══\n`);
  console.log(`Analisados: ${prods.length} produtos · ${variants.length} variantes`);
  console.log(`Encontrados: ${rows.length} nomes\n`);

  const porTermo = new Map<string, number>();
  for (const r of rows) porTermo.set(r.termo.toLowerCase(), (porTermo.get(r.termo.toLowerCase()) ?? 0) + 1);
  console.log("Por termo:");
  [...porTermo.entries()].sort((a, b) => b[1] - a[1]).forEach(([t, n]) => console.log(`  ${t.padEnd(22)} ${n}`));

  console.log("\nAmostra:");
  rows.slice(0, 20).forEach((r) => console.log(`  [${r.tabela}] ${r.ref.padEnd(28)} ${r.pt}`));

  if (CSV) {
    const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
    const csv = ["tabela,ref,campo,texto_original"]
      .concat(rows.map((r) => [r.tabela, r.ref, "name", esc(r.pt)].join(",")))
      .join("\n");
    fs.writeFileSync("i18n-nomes-todo.csv", "﻿" + csv, "utf8");
    console.log(`\n✓ i18n-nomes-todo.csv (${rows.length} linhas)`);
  } else {
    console.log("\n(--csv para exportar)");
  }
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
