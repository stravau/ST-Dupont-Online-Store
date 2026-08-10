// Levantamento de tradução: encontra todos os campos localizados cujo texto PT
// ainda está em inglês (ou está vazio). Só LÊ — não escreve nada.
//
//   $env:DATABASE_URL = "<neon url de produção>"
//   npx tsx scripts/i18n-report.ts              # resumo no terminal
//   npx tsx scripts/i18n-report.ts --csv        # + escreve i18n-todo.csv
//
// Campos cobertos: Category(name, tagline, history), Product(name, description,
// history), ProductVariant(name, description).
import "dotenv/config";
import * as fs from "fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const CSV = process.argv.includes("--csv");

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL não está definido. Aborta.");
  process.exit(1);
}
if (/localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL)) {
  console.error("\n\u26a0  DATABASE_URL aponta para localhost \u2014 nao e a base de dados de producao.");
  console.error("   Define-a nesta janela do terminal antes de correr:\n");
  console.error('   $env:DATABASE_URL = "<connection string do Neon>"\n');
  process.exit(1);
}
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

type L = { pt?: string; en?: string } | null | undefined;

// Palavras-função que praticamente só aparecem em inglês, e as portuguesas que
// desmentem o palpite. Um texto conta como "por traduzir" quando tem sinais de
// inglês e nenhum sinal de português — evita marcar como inglês uma frase PT
// que só use uma palavra estrangeira ("Tote", "Rollerball").
const EN = /\b(the|and|with|of|for|our|this|that|which|from|your|are|is|as well as|featuring|crafted|designed|inspired)\b/i;
const PT = /\b(que|para|com|dos|das|uma|um|não|também|nossa|nosso|pela|pelo|este|esta|em|à|ao|se|mais|sua|seu)\b/i;

const isEnglish = (t?: string) => !!t && t.trim().length > 12 && EN.test(t) && !PT.test(t);

interface Row {
  tabela: string;
  id: string;
  ref: string; // slug ou sku, para se encontrar no admin
  campo: string;
  problema: "PT em inglês" | "PT vazio";
  chars: number;
  texto: string;
}

const rows: Row[] = [];

function check(tabela: string, id: string, ref: string, campo: string, val: L) {
  const pt = val?.pt?.trim();
  const en = val?.en?.trim();
  // Sem PT mas com EN → falta traduzir. Com PT que parece inglês → idem.
  if (!pt && en) {
    rows.push({ tabela, id, ref, campo, problema: "PT vazio", chars: en.length, texto: en });
    return;
  }
  if (isEnglish(pt)) {
    rows.push({ tabela, id, ref, campo, problema: "PT em inglês", chars: pt!.length, texto: pt! });
  }
}

(async () => {
  const [cats, prods, variants] = await Promise.all([
    prisma.category.findMany({ select: { id: true, slug: true, name: true, tagline: true, history: true } }),
    prisma.product.findMany({ select: { id: true, slug: true, name: true, description: true, history: true } }),
    prisma.productVariant.findMany({ select: { id: true, sku: true, name: true, description: true } }),
  ]);

  for (const c of cats) {
    check("Category", c.id, c.slug, "name", c.name as L);
    check("Category", c.id, c.slug, "tagline", c.tagline as L);
    check("Category", c.id, c.slug, "history", c.history as L);
  }
  for (const p of prods) {
    check("Product", p.id, p.slug, "name", p.name as L);
    check("Product", p.id, p.slug, "description", p.description as L);
    check("Product", p.id, p.slug, "history", p.history as L);
  }
  for (const v of variants) {
    check("Variant", v.id, v.sku, "name", v.name as L);
    check("Variant", v.id, v.sku, "description", v.description as L);
  }

  // ---------- Resumo ----------
  const totalChars = rows.reduce((s, r) => s + r.chars, 0);
  const by = (k: (r: Row) => string) => {
    const m = new Map<string, number>();
    for (const r of rows) m.set(k(r), (m.get(k(r)) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  };

  console.log("\n═══════ RELATÓRIO DE TRADUÇÃO ═══════\n");
  console.log(`Universo analisado:  ${cats.length} categorias · ${prods.length} produtos · ${variants.length} variantes`);
  console.log(`Campos por traduzir: ${rows.length}`);
  console.log(`Total de caracteres: ${totalChars.toLocaleString("pt-PT")}\n`);

  console.log("Por tabela e campo:");
  for (const [k, n] of by((r) => `${r.tabela}.${r.campo}`)) console.log(`  ${k.padEnd(24)} ${n}`);
  console.log("\nPor tipo de problema:");
  for (const [k, n] of by((r) => r.problema)) console.log(`  ${k.padEnd(24)} ${n}`);

  // Produtos distintos afectados — o número que interessa para estimar esforço.
  const prodsAfetados = new Set(rows.filter((r) => r.tabela !== "Category").map((r) => r.ref)).size;
  console.log(`\nProdutos/variantes distintos afectados: ${prodsAfetados}`);

  console.log("\nAmostra (10 primeiros):");
  for (const r of rows.slice(0, 10)) {
    console.log(`  [${r.tabela}.${r.campo}] ${r.ref}`);
    console.log(`      ${r.texto.replace(/\s+/g, " ").slice(0, 90)}${r.texto.length > 90 ? "…" : ""}`);
  }

  // Estimativa grosseira de custo de tradução automática (DeepL ~20€/milhão).
  console.log(`\nEstimativa DeepL (~20 €/milhão de caracteres): ${(totalChars / 1_000_000 * 20).toFixed(2)} €`);

  if (CSV) {
    const esc = (s: string) => `"${s.replace(/"/g, '""').replace(/\s+/g, " ")}"`;
    const csv = ["tabela,ref,campo,problema,chars,texto_original"]
      .concat(rows.map((r) => [r.tabela, r.ref, r.campo, r.problema, String(r.chars), esc(r.texto)].join(",")))
      .join("\n");
    fs.writeFileSync("i18n-todo.csv", "﻿" + csv, "utf8"); // BOM p/ Excel
    console.log(`\n✓ Escrito i18n-todo.csv (${rows.length} linhas) — abre no Excel para traduzir em massa.`);
  } else {
    console.log("\n(Corre com --csv para exportar a lista completa para Excel.)");
  }

  await prisma.$disconnect();
})().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
