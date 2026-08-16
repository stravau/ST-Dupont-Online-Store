/**
 * Procura artigos fora do sítio: na categoria errada, com o nome a
 * contradizer a arrumação, ou invisíveis por causa da navbar.
 *
 * Só lê. Não escreve nada, nunca.
 *
 *   $env:DATABASE_URL="<url de produção>"; npx tsx scripts/auditar-arrumacao.ts
 */
import { semCache, COLLECTION_SLUG_PATTERNS } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import { productGroups } from "@/lib/product-groups";
import { categoryArt } from "@/lib/category-art";
// A versão partilhada, e não lib/nav-liveness: essa importa "server-only" e
// não arranca fora do Next. Os sinais são recalculados aqui abaixo com a mesma
// regra, para o relatório dizer o que o site faz e não o que devia fazer.
import { isNavPathLive, type LiveNavSignalsSerialized } from "@/lib/nav-liveness-shared";
import type { CategorySlug, Product } from "@/lib/catalog";

const CATEGORIAS: CategorySlug[] = ["isqueiros", "escrita", "pele", "acessorios"];

const norm = (s: string) =>
  s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

// Palavras que só fazem sentido numa categoria. Se o nome de um artigo grita
// "isqueiro" e ele está arrumado em marroquinaria, é bandeira.
const PISTAS: { re: RegExp; categoria: CategorySlug }[] = [
  { re: /\bisqueiro\b|\blighter\b|\bmaxijet\b|\bminijet\b|\bmegajet\b|\bultrajet\b|\bslim ?7\b|\bligne ?[12]\b|\bwindproof\b|\bdefi (?:e?x{1,2}treme)\b/, categoria: "isqueiros" },
  { re: /\besferografica\b|\brollerball\b|\btinta permanente\b|\bcaneta\b|\blapiseira\b|\bfountain pen\b|\bballpoint\b|\bporta minas\b/, categoria: "escrita" },
  { re: /\bmala\b|\bcarteira\b|\bcinto\b|\bporta cartoes\b|\bmochila\b|\bbolsa\b|\bwallet\b|\bbelt\b|\bbriefcase\b|\bbackpack\b/, categoria: "pele" },
  { re: /\bcortador\b|\bcutter\b|\bcinzeiro\b|\bashtray\b|\bhumidor\b|\bbotoes de punho\b|\bcufflink\b|\bmola de gravata\b|\btie clip\b|\brecarga\b|\bcartuchos?\b|\bpedras de silex\b/, categoria: "acessorios" },
];

async function main() {
  const host = (process.env.DATABASE_URL ?? "").replace(/\/\/[^@]*@/, "//***@");
  console.log(`DB: ${host || "(não definida)"}\n`);

  const porCategoria = new Map<CategorySlug, Product[]>();
  for (const c of CATEGORIAS) porCategoria.set(c, await semCache.getProductsByCategory(c));
  const todos = [...porCategoria.entries()].flatMap(([c, ps]) => ps.map((p) => ({ c, p })));
  console.log(`${todos.length} produtos activos.\n`);

  // ─── 1. Nome a contradizer a categoria ────────────────────────────────
  console.log("═══ 1. NOME A CONTRADIZER A CATEGORIA ═══\n");
  let n1 = 0;
  for (const { c, p } of todos) {
    const nome = norm(`${p.name.pt} ${p.name.en}`);
    const sugerida = PISTAS.find((x) => x.re.test(nome))?.categoria;
    if (!sugerida || sugerida === c) continue;
    n1++;
    console.log(`  ${p.name.pt.slice(0, 50).padEnd(50)} está em ${c.padEnd(11)} parece ${sugerida}`);
    console.log(`      ${p.slug}`);
  }
  if (!n1) console.log("  (nada)");

  // ─── 2. Produtos que não caem em grupo nenhum da sua categoria ────────
  // Se um artigo não é apanhado por nenhum grupo de /t/, só se chega a ele
  // pela listagem da categoria ou pela pesquisa.
  console.log("\n═══ 2. FORA DE QUALQUER GRUPO DE PRODUTO ═══\n");
  const grupos = Object.values(productGroups);
  let n2 = 0;
  for (const { c, p } of todos) {
    const cobre = grupos.some((g) => {
      if (g.categorySlug !== c) return false;
      if (g.types) return g.types.some((t) => t.match(p));
      return g.match?.(p) ?? false;
    });
    if (cobre) continue;
    n2++;
    if (n2 <= 30) console.log(`  ${c.padEnd(11)} ${p.name.pt.slice(0, 48).padEnd(48)} ${p.slug}`);
  }
  if (n2 > 30) console.log(`  … e mais ${n2 - 30}`);
  if (!n2) console.log("  (nada)");

  // ─── 3. Entradas de menu que a liveness está a podar ──────────────────
  console.log("\n═══ 3. ENTRADAS DE MENU PODADAS ═══\n");
  const vivo = (p: Product) => p.variants.some((v) => v.status !== "DESCONTINUADO");
  const signals: LiveNavSignalsSerialized = {
    categories: [], collections: [], types: [], genders: [], usages: [],
  };
  const setCats = new Set<string>(), setCols = new Set<string>(), setTypes = new Set<string>();
  for (const c of CATEGORIAS) {
    const vivos = porCategoria.get(c)!.filter(vivo);
    if (vivos.length === 0) continue;
    setCats.add(c);
    for (const p of vivos) if (p.collection) setCols.add(p.collection);
    for (const [label, padrao] of Object.entries(COLLECTION_SLUG_PATTERNS)) {
      if (vivos.some((p) => p.slug.toLowerCase().includes(padrao))) setCols.add(label);
    }
    for (const g of grupos) {
      if (g.categorySlug !== c) continue;
      if (g.types) {
        for (const ty of g.types) {
          if (!vivos.some((p) => ty.match(p))) continue;
          setTypes.add(g.id);
          setTypes.add(`${g.id}:${ty.key}`);
        }
      } else if (g.match && vivos.some((p) => g.match!(p))) setTypes.add(g.id);
    }
  }
  // Os usages da escrita, com a mesma regra do productUsages de
  // lib/nav-liveness.ts. Sem isto o relatório dava as três entradas "Tipo"
  // como podadas quando na verdade era o relatório que não sabia delas.
  const setUsos = new Set<string>();
  for (const p of porCategoria.get("escrita")!.filter(vivo)) {
    const hay = `${p.slug} ${p.name.en} ${p.name.pt} ${p.description.en}`.toLowerCase();
    if (/fountain\s?pen|tinta\s?permanente/.test(hay)) setUsos.add("fountain");
    if (/roller\s?ball/.test(hay)) setUsos.add("rollerball");
    if (/ballpoint|esferográfica|esferografica/.test(hay)) setUsos.add("ballpoint");
  }
  signals.categories = [...setCats];
  signals.collections = [...setCols];
  signals.types = [...setTypes];
  signals.usages = [...setUsos];
  let n3 = 0;
  for (const [slug, art] of Object.entries(categoryArt)) {
    for (const g of art.groups ?? []) {
      if (isNavPathLive(g.href, signals)) continue;
      n3++;
      console.log(`  ${slug.padEnd(11)} "${g.label.pt}"  →  ${g.href}`);
    }
    for (const s of art.menuSections ?? []) {
      for (const it of s.items) {
        if (isNavPathLive(it.href, signals)) continue;
        n3++;
        console.log(`  ${slug.padEnd(11)} "${s.title.pt} · ${it.label.pt}"  →  ${it.href}`);
      }
    }
  }
  if (!n3) console.log("  (nenhuma — todas as entradas do menu resolvem)");

  // ─── 4. Colecções órfãs: existem na base mas nenhum menu lá vai ───────
  console.log("\n═══ 4. COLECÇÕES SEM CAMINHO NO MENU ═══\n");
  const nosMenus = new Set<string>();
  for (const art of Object.values(categoryArt)) {
    const hrefs = [
      ...(art.groups ?? []).map((g) => g.href),
      ...(art.menuSections ?? []).flatMap((s) => s.items.map((i) => i.href)),
    ];
    for (const h of hrefs) {
      const col = new URLSearchParams(h.split("?")[1] ?? "").get("col");
      if (col) for (const c of col.split(",")) nosMenus.add(norm(c));
    }
  }
  let n4 = 0;
  for (const c of CATEGORIAS) {
    const cols = new Set(porCategoria.get(c)!.map((p) => p.collection).filter(Boolean));
    for (const col of [...cols].sort()) {
      if (nosMenus.has(norm(col))) continue;
      const quantos = porCategoria.get(c)!.filter((p) => p.collection === col).length;
      n4++;
      console.log(`  ${c.padEnd(11)} ${String(quantos).padStart(3)} × "${col}"`);
    }
  }
  if (!n4) console.log("  (nada)");

  // ─── 5. Stock fantasma em todo o catálogo ─────────────────────────────
  console.log("\n═══ 5. STOCK FANTASMA (coluna `stock` ≠ LIS + VNG) ═══\n");
  const fantasma = await prisma.$queryRaw<{ sku: string; stock: number; lis: number; vng: number; slug: string }[]>`
    SELECT v."sku", v."stock", v."stockLis" AS lis, v."stockVng" AS vng, p."slug"
    FROM "ProductVariant" v JOIN "Product" p ON p."id" = v."productId"
    WHERE v."stock" <> v."stockLis" + v."stockVng"
    ORDER BY v."stock" - v."stockLis" - v."stockVng" DESC
    LIMIT 40`;
  for (const f of fantasma) {
    console.log(`  ${f.sku.padEnd(10)} declara ${String(f.stock).padStart(3)}, em loja ${f.lis + f.vng}   ${f.slug}`);
  }
  if (!fantasma.length) console.log("  (nada)");
  else console.log(`  (${fantasma.length} mostradas)`);

  // ─── 6. Fichas sem foto nenhuma ───────────────────────────────────────
  console.log("\n═══ 6. SEM FOTO ═══\n");
  let n6 = 0;
  for (const { c, p } of todos) {
    const semFoto = !p.image && p.variants.every((v) => !v.image && v.images.length === 0);
    if (!semFoto) continue;
    n6++;
    if (n6 <= 20) console.log(`  ${c.padEnd(11)} ${p.name.pt.slice(0, 48).padEnd(48)} ${p.slug}`);
  }
  if (n6 > 20) console.log(`  … e mais ${n6 - 20}`);
  if (!n6) console.log("  (nada)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
