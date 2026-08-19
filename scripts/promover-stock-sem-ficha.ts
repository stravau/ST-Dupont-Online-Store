// Cria fichas para os artigos que têm stock nas lojas mas estão presos no
// saco `unmapped-inventory`, e move cada variante para a sua ficha.
//
// PORQUÊ: 45 artigos — 67 unidades, ~€33k a PVP — existem nas lojas e nenhum
// cliente os consegue ver, porque entraram pelo Excel do ERP sem ficha
// atribuída. Não é catálogo a mais, é stock parado.
//
// Faz o mesmo que /api/admin/variants/promote faz um a um: cria o Product e
// muda o productId da variante. O stock, o EAN, o PVP e o histórico ficam onde
// estão — nada disso se toca. Das 45 variantes, 24 já trazem fotografia e
// aparecem completas; as outras 21 entram com o marcador de lugar, tal como a
// rota do admin também faz.
//
// A CATEGORIA veio dos "irmãos": para cada referência procurou-se no catálogo
// a que tem o prefixo numérico mais longo em comum e adoptou-se a categoria
// dela. A COLECÇÃO não — esse sinal era mau (dava "Fire X" a um Twiggy 1872 e
// "DC Comics" a um Ligne 2 Cling), por isso é lida do nome do artigo, sempre
// com uma grafia que já existe na base.
//
// Idempotente: uma variante que já não esteja no saco é ignorada.
//
// COMO CORRER (PowerShell, na raiz do projecto):
//   $env:DATABASE_URL = "<a URL da Neon de producao>"
//   npx.cmd tsx scripts/promover-stock-sem-ficha.ts          # simulacao
//   npx.cmd tsx scripts/promover-stock-sem-ficha.ts --apply  # escreve

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

interface Ficha {
  sku: string;
  pt: string;
  en: string;
  cat: "isqueiros" | "escrita" | "pele" | "acessorios";
  col: string;
}

// Nomes: partem dos que o ERP já trazia — o patrão reconhece-os — só
// desfeitas as abreviaturas e as maiúsculas de folha de cálculo.
const FICHAS: Ficha[] = [
  // ---------------------------------------------------------------- isqueiros
  { sku: "STD010805", pt: "Isqueiro Minijet — Preto", en: "Minijet Lighter — Black", cat: "isqueiros", col: "Minijet" },
  { sku: "STD021600", pt: "Isqueiro Défi Extreme", en: "Défi Extreme Lighter", cat: "isqueiros", col: "Défi Extreme" },
  { sku: "STD024006", pt: "Isqueiro de Velas — Branco", en: "Candle Lighter — White", cat: "isqueiros", col: "Table lighter" },
  { sku: "STD027701", pt: "Isqueiro Slim 7 — Crómio Mate", en: "Slim 7 Lighter — Matte Chrome", cat: "isqueiros", col: "Slim 7" },
  { sku: "STD030031", pt: "Isqueiro Twiggy — Branco & Dourado", en: "Twiggy Lighter — White & Gold", cat: "isqueiros", col: "Twiggy" },
  { sku: "STD030080", pt: "Isqueiro Twiggy 1872 — Cinzento", en: "Twiggy 1872 Lighter — Grey", cat: "isqueiros", col: "Monogram 1872" },
  { sku: "STD030112", pt: "Isqueiro Twiggy — Laca Preta & Dourado", en: "Twiggy Lighter — Black Lacquer & Gold", cat: "isqueiros", col: "Twiggy" },
  { sku: "STDC16085CL", pt: "Isqueiro Ligne 2 · 85.º Aniversário — Dourado", en: "Ligne 2 Lighter · 85th Anniversary — Gold", cat: "isqueiros", col: "Ligne 2" },
  { sku: "STDC16180", pt: "Isqueiro Ligne 2 Cling 1872 — Paládio", en: "Ligne 2 Cling 1872 Lighter — Palladium", cat: "isqueiros", col: "Monogram 1872" },

  // ------------------------------------------------------------------ escrita
  { sku: "STD260203", pt: "Caneta Initial — Preto & Crómio", en: "Initial Pen — Black & Chrome", cat: "escrita", col: "Initial" },
  { sku: "STD260204", pt: "Caneta D-Initial — Duo Tone & Crómio", en: "D-Initial Pen — Duo Tone & Chrome", cat: "escrita", col: "Initial" },
  { sku: "STD262205", pt: "Rollerball D-Initial — Azul & Crómio", en: "D-Initial Rollerball — Blue & Chrome", cat: "escrita", col: "Initial" },
  { sku: "STD410039L", pt: "Caneta Line D Vitruvian Média — Preto", en: "Line D Vitruvian Pen, Medium — Black", cat: "escrita", col: "Line D" },
  { sku: "STD410040L", pt: "Caneta Line D Vitruvian — Azul", en: "Line D Vitruvian Pen — Blue", cat: "escrita", col: "Line D" },
  { sku: "STD410100M", pt: "Caneta Line D Média — Preto & Paládio", en: "Line D Pen, Medium — Black & Palladium", cat: "escrita", col: "Line D" },
  { sku: "STD410104M", pt: "Caneta Line D Média — Azul & Paládio", en: "Line D Pen, Medium — Blue & Palladium", cat: "escrita", col: "Line D" },
  { sku: "STD412039L", pt: "Rollerball Line D Vitruvian — Preto", en: "Line D Vitruvian Rollerball — Black", cat: "escrita", col: "Line D" },
  { sku: "STD412040L", pt: "Rollerball Line D Vitruvian — Azul", en: "Line D Vitruvian Rollerball — Blue", cat: "escrita", col: "Line D" },
  { sku: "STD420052LF", pt: "Caneta Line D Eternity L — Pacific & Ouro", en: "Line D Eternity Pen, L — Pacific & Gold", cat: "escrita", col: "Line D Eternity" },
  { sku: "STD462601", pt: "Rollerball Liberté — Ouro Rosa", en: "Liberté Rollerball — Rose Gold", cat: "escrita", col: "Liberté" },
  { sku: "STD465601", pt: "Esferográfica Liberté — Ouro Rosa", en: "Liberté Ballpoint — Rose Gold", cat: "escrita", col: "Liberté" },
  { sku: "STD700005", pt: "Esferográfica Mini com Colar — Preto & Dourado", en: "Mini Pen Necklace — Black & Gold", cat: "escrita", col: "Colar Marker" },

  // --------------------------------------------------------------------- pele
  { sku: "STD180023C", pt: "Bolsa para Isqueiro Le Grand Dupont — Preto", en: "Le Grand Dupont Lighter Case — Black", cat: "pele", col: "Le Grand Dupont" },
  { sku: "STD180123C", pt: "Bolsa para Isqueiro Le Grand Dupont — Castanho", en: "Le Grand Dupont Lighter Case — Brown", cat: "pele", col: "Le Grand Dupont" },
  { sku: "STD180342", pt: "Carteira 6 Cartões Neo Capsule Grande — Azul-marinho", en: "Neo Capsule Large 6-Card Wallet — Navy", cat: "pele", col: "Neo Capsule" },
  { sku: "STD1IO561BK1", pt: "Carteira 5 Cartões Iconic — Preto", en: "Iconic 5-Card Wallet — Black", cat: "pele", col: "Iconic" },
  { sku: "STD1VS333BE2", pt: "Mala Victoria em Camurça — Bege", en: "Victoria Suede Bag — Beige", cat: "pele", col: "Victoria" },

  // --------------------------------------------------------------- acessorios
  { sku: "STD003087", pt: "Clip para Notas Lines — Prata", en: "Lines Money Clip — Silver", cat: "acessorios", col: "Money Clips" },
  { sku: "STD003088", pt: "Clip para Notas Lines — Dourado", en: "Lines Money Clip — Gold", cat: "acessorios", col: "Money Clips" },
  { sku: "STD003377X", pt: "Corta-Charutos Tradi — Preto & Crómio", en: "Tradi Cigar Cutter — Black & Chrome", cat: "acessorios", col: "Cortador de Charuto" },
  { sku: "STD005850", pt: "Botões de Punho — Laca Preta & Paládio", en: "Cufflinks — Black Lacquer & Palladium", cat: "acessorios", col: "Cufflinks" },
  { sku: "STD005856", pt: "Botões de Punho Diamond Head Redondos — Dourado", en: "Round Diamond Head Cufflinks — Gold", cat: "acessorios", col: "Cufflinks" },
  { sku: "STD005857", pt: "Botões de Punho Diamond Head Quadrados — Prata", en: "Square Diamond Head Cufflinks — Silver", cat: "acessorios", col: "Cufflinks" },
  { sku: "STD005859", pt: "Botões de Punho Trigger Lines — Prata", en: "Trigger Lines Cufflinks — Silver", cat: "acessorios", col: "Cufflinks" },
  { sku: "STD005860", pt: "Botões de Punho Trigger Lines — Dourado", en: "Trigger Lines Cufflinks — Gold", cat: "acessorios", col: "Cufflinks" },
  { sku: "STD006725", pt: "Cinzeiro XL — Preto Fumo", en: "XL Ashtray — Smoke Black", cat: "acessorios", col: "Acessórios" },
  { sku: "STD006726", pt: "Cinzeiro XL — Azul Wave", en: "XL Ashtray — Wave Blue", cat: "acessorios", col: "Acessórios" },
  { sku: "STD006737", pt: "Cinzeiro XL — Preto & Dourado", en: "XL Ashtray — Black & Gold", cat: "acessorios", col: "Acessórios" },
  { sku: "STD007152", pt: "Caderno A5 — Bordô", en: "A5 Notebook — Burgundy", cat: "acessorios", col: "Acessórios" },
  { sku: "STD007153", pt: "Caderno A5 — Cinzento", en: "A5 Notebook — Grey", cat: "acessorios", col: "Acessórios" },
  { sku: "STD007154", pt: "Caderno A5 — Verde", en: "A5 Notebook — Green", cat: "acessorios", col: "Acessórios" },
  { sku: "STD087377-72", pt: "Kit Humidificador Boveda Pequeno — 72%", en: "Boveda Small Humidifier Kit — 72%", cat: "acessorios", col: "Humidors" },
  { sku: "STD087377-84", pt: "Kit Humidificador Boveda Pequeno — 84%", en: "Boveda Small Humidifier Kit — 84%", cat: "acessorios", col: "Humidors" },
  { sku: "STD183016", pt: "Porta-Charutos para 2 — Preto & Crómio", en: "Two-Cigar Case — Black & Chrome", cat: "acessorios", col: "Acessórios" },
  { sku: "STD183023", pt: "Porta-Charutos para 3 — Azul", en: "Three-Cigar Case — Blue", cat: "acessorios", col: "Acessórios" },
];

// Descrição curta e factual, montada do que sabemos com certeza: o tipo de
// artigo, a linha e a cor já estão no nome. Nada inventado — quem quiser
// enriquecer depois fá-lo no admin.
function descricao(f: Ficha): { pt: string; en: string } {
  const cor = f.pt.includes("—") ? f.pt.split("—").pop()!.trim() : "";
  const corEn = f.en.includes("—") ? f.en.split("—").pop()!.trim() : "";
  const base: Record<Ficha["cat"], [string, string]> = {
    isqueiros: [`Isqueiro S.T. Dupont da linha ${f.col}.`, `S.T. Dupont lighter from the ${f.col} line.`],
    escrita: [`Instrumento de escrita S.T. Dupont da linha ${f.col}.`, `S.T. Dupont writing instrument from the ${f.col} line.`],
    pele: [`Peça em pele S.T. Dupont da linha ${f.col}.`, `S.T. Dupont leather piece from the ${f.col} line.`],
    acessorios: [`Acessório S.T. Dupont da linha ${f.col}.`, `S.T. Dupont accessory from the ${f.col} line.`],
  };
  const [pt, en] = base[f.cat];
  return {
    pt: cor ? `${pt} Acabamento ${cor.toLowerCase()}.` : pt,
    en: corEn ? `${en} ${corEn} finish.` : en,
  };
}

function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 60);
}

async function main() {
  const cats = await prisma.category.findMany({ select: { id: true, slug: true } });
  const catId = new Map(cats.map((c) => [c.slug, c.id]));

  const vs = await prisma.productVariant.findMany({
    where: { sku: { in: FICHAS.map((f) => f.sku) } },
    select: {
      id: true, sku: true, stock: true, stockLis: true, stockVng: true,
      priceCents: true, images: true, product: { select: { slug: true } },
    },
  });
  const porSku = new Map(vs.map((v) => [v.sku, v]));

  let criados = 0, saltados = 0, semFoto = 0;
  const porCat: Record<string, number> = {};
  const semPreco: string[] = [];

  for (const f of FICHAS) {
    const v = porSku.get(f.sku);
    if (!v) { console.log("!! " + f.sku + " nao existe na base — ignorado"); continue; }
    if (v.product.slug !== SACO) {
      saltados++;
      continue; // ja promovido numa passagem anterior
    }
    const cid = catId.get(f.cat);
    if (!cid) { console.log("!! categoria " + f.cat + " nao existe — " + f.sku); continue; }

    // Nunca publicar um artigo a zero: o cartão do catálogo mostraria "0 €" e
    // o cliente leria aquilo como grátis ou como página avariada. Fica no saco
    // até alguém lhe pôr preço.
    if (v.priceCents <= 0) { semPreco.push(f.sku + "  " + f.pt); continue; }

    let slug = slugify(f.pt);
    if (await prisma.product.findUnique({ where: { slug }, select: { id: true } })) {
      slug = `${slug}-${slugify(f.sku)}`.slice(0, 60);
    }
    const desc = descricao(f);
    if (v.images.length === 0) semFoto++;
    porCat[f.cat] = (porCat[f.cat] ?? 0) + 1;
    criados++;

    console.log(
      f.sku.padEnd(14) + f.pt.slice(0, 46).padEnd(48) +
      f.cat.padEnd(11) + f.col.padEnd(18) +
      String(v.stock) + "un " + (v.priceCents / 100).toFixed(2) + "EUR " +
      (v.images.length ? v.images.length + "f" : "SEM FOTO"),
    );

    if (APLICAR) {
      await prisma.$transaction(async (tx) => {
        const p = await tx.product.create({
          data: {
            slug,
            name: { pt: f.pt, en: f.en },
            description: desc,
            collection: f.col,
            categoryId: cid,
            active: true,
          },
          select: { id: true, slug: true },
        });
        await tx.productVariant.update({ where: { id: v.id }, data: { productId: p.id } });
        await tx.adminAction.create({
          data: {
            userId: null,
            entityType: "PRODUCT",
            action: "CREATE",
            entityId: p.slug,
            note: `Ficha criada em lote a partir da variante ${f.sku} (estava em ${SACO})`,
            after: { slug: p.slug, nome: f.pt, categorySlug: f.cat, collection: f.col, sku: f.sku } as object,
          },
        });
      });
    }
  }

  console.log("\n" + "=".repeat(76));
  console.log((APLICAR ? "CRIADAS: " : "A CRIAR (simulacao): ") + criados + " fichas" +
    (saltados ? "  |  " + saltados + " ja estavam promovidas" : ""));
  console.log("  por categoria: " + Object.entries(porCat).map(([k, n]) => k + " " + n).join(", "));
  console.log("  com fotografia: " + (criados - semFoto) + "   |   com marcador de lugar: " + semFoto);
  if (semPreco.length) {
    console.log("\n  RETIDOS por estarem a EUR 0,00 (ficam no saco ate terem preco):");
    for (const s of semPreco) console.log("    " + s);
  }
  if (!APLICAR) console.log("\nNada foi gravado. Corre com --apply para gravar.");
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
