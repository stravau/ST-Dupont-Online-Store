// Compara o catálogo do site oficial (st-dupont.com) com a NOSSA BASE DE DADOS
// — não com o site. SÓ LEITURA, não escreve absolutamente nada.
//
// Porquê contra a base: o site só mostra o que está activo. Artigos
// DESCONTINUADO, inactivos ou sem ficha publicada estão escondidos, e
// comparar contra o site dá-os como "em falta" quando já existem.
//
// Responde a três perguntas, para cada artigo do site oficial:
//   1. SEM FICHA  — não existe de todo na base, é preciso criar
//   2. SEM FOTO   — a ficha existe mas não tem fotografia nenhuma
//   3. COMPLETO   — existe e tem foto, não há nada a fazer
//
// A correspondência usa a MESMA cascata da app (lib/admin-upload.ts): EAN
// primeiro, depois a REF com as suas variantes — incluindo a regra
// 000NNN → 900NNN, que é a que faz o nosso 000651 casar com o 900651 deles.
//
// COMO CORRER (PowerShell, na raiz do projecto):
//   $env:DATABASE_URL = "<a URL da Neon de producao>"
//   npx.cmd tsx scripts/comparar-oficial.ts
//
// Para ver artigo a artigo:
//   npx.cmd tsx scripts/comparar-oficial.ts --detalhe

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const url = process.env.DATABASE_URL ?? "";
if (!url || /localhost|127\.0\.0\.1/.test(url)) {
  console.error(
    "DATABASE_URL nao aponta para a Neon de producao (esta vazia ou e localhost).\n" +
      "No PowerShell:  $env:DATABASE_URL = \"<a URL da Neon>\"",
  );
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

// Cópia exacta de refCandidates() da app, para o script ficar auto-contido.
function refCandidates(ref: string): string[] {
  const tail = ref.replace(/^STD/, "");
  const out: string[] = [tail];
  if (/^000\d{3}$/.test(tail)) out.push("9" + tail.slice(1));
  if (ref !== tail) out.push(ref);
  return out;
}

type Oficial = {
  sku: string;
  titulo: string;
  handle: string;
  tipo: string;
  preco: string;
  disponivel: boolean;
  imagens: string[];
};

async function catalogoOficial(): Promise<Oficial[]> {
  const todos: Oficial[] = [];
  for (let pg = 1; pg <= 20; pg++) {
    const r = await fetch(`https://www.st-dupont.com/products.json?limit=250&page=${pg}`, {
      headers: { "user-agent": "Mozilla/5.0" },
    });
    if (!r.ok) throw new Error(`products.json pagina ${pg}: HTTP ${r.status}`);
    const d = (await r.json()) as { products: any[] };
    if (!d.products?.length) break;
    for (const p of d.products) {
      for (const v of p.variants) {
        todos.push({
          sku: String(v.sku ?? "").trim(),
          titulo: p.title,
          handle: p.handle,
          tipo: p.product_type || "",
          preco: v.price,
          disponivel: !!v.available,
          imagens: (p.images ?? []).map((i: any) => i.src),
        });
      }
    }
    process.stdout.write(`  pagina ${pg}: ${d.products.length} produtos\n`);
    if (d.products.length < 250) break;
  }
  return todos.filter((t) => t.sku && t.sku.toLowerCase() !== "customization");
}

// Nome do modelo a partir do handle (o titulo do Shopify e so o tipo).
function modelo(handle: string, sku: string): string {
  let s = handle.toLowerCase();
  const ref = sku.toLowerCase();
  if (s.endsWith("-" + ref)) s = s.slice(0, -(ref.length + 1));
  s = s.replace(/-c?\d[\w]*$/, "");
  return s.split("-").filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
}

async function main() {
  const detalhe = process.argv.includes("--detalhe");

  console.log("A ler o catalogo oficial...");
  const oficiais = await catalogoOficial();
  console.log(`  -> ${oficiais.length} artigos com referencia\n`);

  console.log("A ler a nossa base...");
  const variantes = await prisma.productVariant.findMany({
    select: {
      sku: true, ean: true, images: true, status: true, active: true,
      product: { select: { slug: true, name: true, image: true, active: true, collection: true } },
    },
  });
  console.log(`  -> ${variantes.length} variantes na base\n`);

  // Indice de correspondencia: SKU + candidatos + EAN, tudo em maiusculas.
  const idx = new Map<string, (typeof variantes)[number]>();
  const registar = (k: string | null | undefined, v: (typeof variantes)[number]) => {
    const key = (k ?? "").trim().toUpperCase();
    if (key && !idx.has(key)) idx.set(key, v);
  };
  for (const v of variantes) {
    registar(v.sku, v);
    for (const c of refCandidates(v.sku)) registar(c, v);
    registar(v.ean, v);
  }

  const semFicha: Oficial[] = [];
  const semFoto: { of: Oficial; nosso: (typeof variantes)[number] }[] = [];
  let completos = 0;

  for (const o of oficiais) {
    let achado = idx.get(o.sku.toUpperCase());
    if (!achado) {
      for (const c of refCandidates(o.sku)) {
        achado = idx.get(c.toUpperCase());
        if (achado) break;
      }
    }
    if (!achado) { semFicha.push(o); continue; }
    const temFoto = (achado.images?.length ?? 0) > 0 || !!achado.product.image;
    if (temFoto) completos++; else semFoto.push({ of: o, nosso: achado });
  }

  console.log("=".repeat(64));
  console.log(`OFICIAIS: ${oficiais.length}`);
  console.log(`  ja completos (ficha + foto): ${completos}`);
  console.log(`  SEM FOTO (ficha existe):     ${semFoto.length}`);
  console.log(`  SEM FICHA (criar de raiz):   ${semFicha.length}`);
  console.log("=".repeat(64));

  const porTipo = (arr: Oficial[]) => {
    const m: Record<string, number> = {};
    for (const a of arr) m[a.tipo || "(sem tipo)"] = (m[a.tipo || "(sem tipo)"] || 0) + 1;
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  };

  console.log("\n--- SEM FICHA, por tipo ---");
  for (const [t, n] of porTipo(semFicha)) console.log(`  ${String(n).padStart(4)}  ${t}`);
  console.log("\n--- SEM FOTO, por tipo ---");
  for (const [t, n] of porTipo(semFoto.map((s) => s.of))) console.log(`  ${String(n).padStart(4)}  ${t}`);

  const fotosDisponiveis = semFoto.reduce((a, b) => a + b.of.imagens.length, 0);
  console.log(`\nFotografias disponiveis no oficial para as fichas sem foto: ${fotosDisponiveis}`);

  if (detalhe) {
    console.log("\n\n########## SEM FICHA ##########");
    for (const o of semFicha.sort((a, b) => a.tipo.localeCompare(b.tipo) || a.sku.localeCompare(b.sku)))
      console.log(`${o.sku.padEnd(12)} ${modelo(o.handle, o.sku).slice(0, 46).padEnd(48)} ${o.tipo.padEnd(22)} ${o.preco.padStart(9)} ${o.imagens.length}f ${o.disponivel ? "" : "(esgotado)"}`);
    console.log("\n\n########## SEM FOTO ##########");
    for (const s of semFoto.sort((a, b) => a.of.tipo.localeCompare(b.of.tipo) || a.of.sku.localeCompare(b.of.sku)))
      console.log(`${s.of.sku.padEnd(12)} nosso:${s.nosso.sku.padEnd(12)} ${modelo(s.of.handle, s.of.sku).slice(0, 40).padEnd(42)} ${String(s.nosso.status).padEnd(14)} ${s.of.imagens.length}f  /${s.nosso.product.slug}`);
  }

  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
