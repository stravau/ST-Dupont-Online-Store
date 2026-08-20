// Varredura completa do catálogo — SÓ LEITURA, não escreve nada.
//
// Nasceu de três defeitos encontrados um a um pelo patrão, todos com a mesma
// origem: dados importados sem verificação. Em vez de esperar que ele encontre
// o quarto, isto procura todos os da mesma família de uma vez.
//
//   NOMES        termo de um tipo de artigo colado a artigo de outro tipo
//                ("Botões de Punho · Cinzeiro · Crómio"); nomes crus do ERP em
//                maiúsculas e abreviaturas; nomes por traduzir
//   DESCRICOES   a mesma descrição em fichas de tipos diferentes (36 recargas
//                partilhavam 9 textos, quase todos errados); descrições vazias
//   SLUGS        o slug decide os filtros de /t/<grupo>, portanto um slug
//                errado põe o artigo no sítio errado (uma caneta de tinta
//                permanente aparecia nos Cortadores de Charuto) ou deixa-o
//                fora do sítio certo (os cinzeiros novos)
//   FOTOS        ficha sem foto de frente, ficheiro local em falta, ficha
//                publicada sem fotografia nenhuma
//   COMERCIO     preço a zero publicado, ficha sem variantes, stock escondido,
//                o mesmo artigo em duas fichas
//
// COMO CORRER (PowerShell, na raiz do projecto):
//   $env:DATABASE_URL = "<a URL da Neon de producao>"
//   npx.cmd tsx scripts/auditar-catalogo.ts            # tudo menos a rede
//   npx.cmd tsx scripts/auditar-catalogo.ts --fotos    # + verifica cada URL

import "dotenv/config";
import { existsSync } from "node:fs";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";
import { productGroups } from "../lib/product-groups";

const url = process.env.DATABASE_URL ?? "";
if (!url || /localhost|127\.0\.0\.1/.test(url)) {
  console.error("DATABASE_URL nao aponta para a Neon de producao.");
  process.exit(1);
}
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
const COM_REDE = process.argv.includes("--fotos");

const SACO = "unmapped-inventory";
const loc = (j: unknown, k: "pt" | "en" = "pt") =>
  String(((j ?? {}) as Record<string, string>)[k] ?? "");

// Que tipo de artigo é, lido do nome. Serve para cruzar com a família do slug
// e com o filtro em que o artigo cai.
const TIPOS: [string, RegExp][] = [
  ["cinzeiro", /\bcinzeir/i],
  ["isqueiro", /\bisqueir/i],
  ["cortador", /corta-charut|cortador/i],
  ["estojo-charuto", /estojo (duplo |para )?\d?\s?charut|porta-charut/i],
  ["humidor", /humidor|humidificador/i],
  ["caneta", /\bcaneta\b|esferogr[áa]fic|rollerball|apar[oa]\b/i],
  ["recarga", /\brecarga|cartuch|minas|pedras de s[íi]lex|borrach/i],
  ["botoes-punho", /bot[õo]es de punho/i],
  ["mola-gravata", /mola de gravata/i],
  ["clip-notas", /clip para notas/i],
  ["carteira", /carteira/i],
  ["mala", /\bmala\b|mochila|saco\b/i],
  ["cinto", /\bcinto\b/i],
  ["caderno", /cadern/i],
  ["bolsa", /\bbolsa\b/i],
];
const tipoDoNome = (n: string) => TIPOS.find(([, re]) => re.test(n))?.[0] ?? null;

// A que família o SLUG diz que pertence — as mesmas regras que os filtros usam.
const FAMILIA_SLUG: [string, RegExp][] = [
  ["cinzeiro", /^ashtray/],
  ["cortador", /^cigar-cutter|^cutter-\d/],
  ["estojo-charuto", /^(?:2-cigar-case|3-cigar-case|double-cigar-case|cigar-case|cigarette-case)/],
  ["humidor", /humidor/],
  ["botoes-punho", /^cufflink/],
  ["mola-gravata", /tie-clip/],
  ["clip-notas", /money-clip/],
  ["caderno", /^notebook/],
  ["carteira", /wallet/],
  ["cinto", /(?:^|-)belt(?:$|-)|autolock/],
];
const familiaDoSlug = (s: string) => FAMILIA_SLUG.find(([, re]) => re.test(s))?.[0] ?? null;

const CRU = /\b(?:ESF|ROL|CAN|ISQ|CART|BOT-PUNHO|BOLSA ISQ|PORTA-CHAV|CX)\b\.?|^[A-ZÀ-Ú0-9 .,&/·-]{12,}$/;

async function main() {
  const ps = await prisma.product.findMany({
    where: { slug: { not: SACO } },
    select: {
      slug: true, name: true, description: true, active: true, image: true, collection: true,
      category: { select: { slug: true } },
      variants: { select: { sku: true, name: true, images: true, priceCents: true, stock: true, status: true } },
    },
  });
  console.log("fichas analisadas: " + ps.length + "\n");

  const sec = (t: string) => console.log("\n" + "=".repeat(72) + "\n" + t + "\n" + "=".repeat(72));
  const achados: Record<string, string[]> = {};
  const add = (k: string, s: string) => { (achados[k] ??= []).push(s); };

  // ---------------------------------------------------------------- NOMES
  for (const p of ps) {
    const nome = loc(p.name);
    const tn = tipoDoNome(nome);
    const fs = familiaDoSlug(p.slug);
    // termo de outro tipo dentro do nome (o caso "Botões de Punho · Cinzeiro")
    for (const [tipo, re] of TIPOS) {
      if (tipo === tn) continue;
      if (re.test(nome) && fs && fs !== tipo && tn && tn !== tipo) {
        add("A1 nome mistura tipos", `${p.slug}  "${nome}"  (diz ${tipo} mas e ${tn})`);
        break;
      }
    }
    if (CRU.test(nome)) add("A2 nome cru do ERP", `${p.slug}  "${nome}"`);
    if (loc(p.name, "en") === nome && nome.length > 3) add("A3 EN igual ao PT", `${p.slug}  "${nome}"`);
    for (const v of p.variants) {
      const vn = loc(v.name);
      if (CRU.test(vn)) add("A2 nome cru do ERP", `${p.slug} / ${v.sku}  "${vn}"`);
    }
  }

  // ----------------------------------------------------------- DESCRICOES
  const porDesc = new Map<string, typeof ps>();
  for (const p of ps) {
    const d = loc(p.description).replace(/\s+/g, " ").trim();
    if (!d) { add("B2 descricao vazia", `${p.slug}  "${loc(p.name)}"`); continue; }
    if (!porDesc.has(d)) porDesc.set(d, [] as unknown as typeof ps);
    porDesc.get(d)!.push(p);
  }
  for (const [d, grupo] of porDesc) {
    if (grupo.length < 2) continue;
    const tipos = new Set(grupo.map((p) => tipoDoNome(loc(p.name))).filter(Boolean));
    if (tipos.size > 1) {
      add("B1 mesma descricao em tipos diferentes",
        `${grupo.length} fichas (${[...tipos].join(", ")}): "${d.slice(0, 58)}..."\n        ` +
        grupo.slice(0, 6).map((p) => p.slug).join(", "));
    }
  }

  // ---------------------------------------------------------------- SLUGS
  for (const p of ps) {
    const nome = loc(p.name);
    const tn = tipoDoNome(nome);
    const fs = familiaDoSlug(p.slug);
    if (tn && fs && tn !== fs) add("C1 slug de familia errada", `${p.slug}  "${nome}"  (slug diz ${fs}, e ${tn})`);
    if (tn && !fs && FAMILIA_SLUG.some(([t]) => t === tn))
      add("C2 fora do filtro a que pertence", `${p.slug}  "${nome}"  (devia casar com ${tn})`);
    if (/\b(isqueiro|caneta|carteira|cinzeiro|caderno|bolsa|botoes|corta|porta|esferografica|recarga|mala)\b/.test(p.slug))
      add("C3 slug em portugues", `${p.slug}  "${nome}"`);
  }
  // em que filtro cada ficha cai, segundo as regras reais da app
  for (const [gid, g] of Object.entries(productGroups)) {
    for (const t of g.types ?? []) {
      for (const p of ps) {
        if (!t.match) continue;
        if (!t.match({ slug: p.slug } as never)) continue;
        const tn = tipoDoNome(loc(p.name));
        const esperado = familiaDoSlug(p.slug);
        if (tn && esperado && tn !== esperado)
          add("C1 slug de familia errada", `${p.slug} aparece em ${gid}/${t.key} mas e ${tn}`);
      }
    }
  }

  // ---------------------------------------------------------------- FOTOS
  for (const p of ps) {
    const temVar = p.variants.some((v) => v.images.length > 0);
    if (p.active && !p.image && temVar) add("D1 sem foto de frente", `${p.slug}`);
    if (p.active && !p.image && !temVar) add("D3 publicada sem foto nenhuma", `${p.slug}  "${loc(p.name)}"`);
    for (const v of p.variants) {
      for (const img of v.images) {
        if (img.startsWith("/products") || img.startsWith("products")) {
          const disco = path.join("public", img.replace(/^\//, ""));
          if (!existsSync(disco)) add("D2 ficheiro local em falta", `${p.slug} / ${v.sku}  ${img}`);
        }
      }
    }
  }

  // ------------------------------------------------------------- COMERCIO
  const porRef = new Map<string, string[]>();
  for (const p of ps) {
    if (p.variants.length === 0) { add("E2 ficha sem variantes", p.slug); continue; }
    for (const v of p.variants) {
      if (p.active && v.status !== "DESCONTINUADO" && v.priceCents <= 0)
        add("E1 preco a zero publicado", `${p.slug} / ${v.sku}  "${loc(v.name)}"`);
      if (!p.active && v.stock > 0) add("E3 stock escondido", `${p.slug} / ${v.sku}  ${v.stock}un`);
      const raiz = v.sku.replace(/^STD/, "").toUpperCase();
      (porRef.set(raiz, porRef.get(raiz) ?? []), porRef.get(raiz)!.push(p.slug + "/" + v.sku));
    }
  }
  for (const [raiz, onde] of porRef)
    if (onde.length > 1) add("E4 mesma referencia em duas fichas", `${raiz}: ${onde.join("  |  ")}`);

  // ---------------------------------------------------------------- saida
  const ordem = Object.keys(achados).sort();
  let total = 0;
  for (const k of ordem) {
    sec(k + "  (" + achados[k].length + ")");
    for (const l of achados[k].slice(0, 40)) console.log("  " + l);
    if (achados[k].length > 40) console.log("  ... e mais " + (achados[k].length - 40));
    total += achados[k].length;
  }
  console.log("\n" + "#".repeat(72));
  console.log("TOTAL DE ACHADOS: " + total + "  em " + ordem.length + " categorias");
  if (!COM_REDE) console.log("(o teste dos URL das fotos nao correu — use --fotos)");
  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
