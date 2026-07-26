// Cross-reference the ST_DUPONT_LINKS-IMAGENS.xlsx supplier catalogue against
// our ProductVariant table. Reports for each Excel row:
//   • temos ou não temos? (match por REF stripped-of-STD, com EAN como fallback)
//   • se temos, já tem imagens no nosso catálogo?
//   • quantas imagens novas o ficheiro traz (main + adicionais não-nulos)
//
// Escreve /tmp/std-image-crossref-{summary,detail,missing}.csv para revisão.
import "dotenv/config";
import xlsx from "xlsx";
import { writeFileSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

if (!process.env.DATABASE_URL) { console.error("DATABASE_URL not set"); process.exit(1); }
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const XLSX_PATH = "C:/Users/UTILIZ~1/AppData/Local/Temp/std-links.xlsx";
const OUT_DIR = "C:/Users/UTILIZ~1/AppData/Local/Temp";

// Same STD-strip helper the rest of the codebase uses.
function candidateSkus(ref: string): string[] {
  const tail = ref.replace(/^STD/i, "");
  const out = new Set<string>([tail, ref]);
  if (/^000\d{3}$/.test(tail)) out.add("9" + tail.slice(1));
  return [...out];
}

function collectImages(row: unknown[]): string[] {
  const out: string[] = [];
  // col 4 = main image; cols 5,7,9,... = additional url_N
  const main = row[4];
  if (typeof main === "string" && main.trim()) out.push(main.trim());
  for (let i = 5; i < row.length; i += 2) {
    const u = row[i];
    if (typeof u === "string" && u.trim()) out.push(u.trim());
  }
  return out;
}

async function main() {
  const wb = xlsx.readFile(XLSX_PATH, { raw: true });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: null, raw: true });

  interface Row {
    ean: string | null;
    ref: string;              // as in the file (with STD…)
    refClean: string;         // stripped
    title: string;
    images: string[];
  }
  const parsed: Row[] = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i]; if (!r) continue;
    const ean = r[0] == null ? null : String(r[0]).trim();
    const ref = r[1] == null ? "" : String(r[1]).trim();
    if (!ref) continue;
    parsed.push({
      ean: ean || null,
      ref,
      refClean: ref.replace(/^STD/i, ""),
      title: r[3] == null ? "" : String(r[3]).trim(),
      images: collectImages(r),
    });
  }
  console.log(`Excel: ${parsed.length} linhas com REF válida.`);

  // Pull the whole variant table once. Small enough to fit in memory.
  const variants = await prisma.productVariant.findMany({
    select: {
      id: true, sku: true, ean: true, images: true, active: true, status: true,
      product: { select: { slug: true, name: true } },
    },
  });
  console.log(`Neon: ${variants.length} variants no catálogo.`);
  const bySku = new Map(variants.map((v) => [v.sku.toUpperCase(), v]));
  const byEan = new Map(variants.filter((v) => v.ean).map((v) => [v.ean as string, v]));

  interface Analysis {
    ref: string;
    refClean: string;
    ean: string | null;
    title: string;
    matched: boolean;
    matchedBy: "SKU" | "EAN" | null;
    matchedSku: string | null;
    matchedProductSlug: string | null;
    hasCatalogueImages: boolean;
    catalogueImageCount: number;
    excelImageCount: number;
    delta: number; // extras que o Excel traria
    status: string | null;
    active: boolean | null;
  }
  const analyzed: Analysis[] = [];

  for (const row of parsed) {
    let hit = null;
    let matchedBy: "SKU" | "EAN" | null = null;
    for (const c of candidateSkus(row.ref)) {
      const v = bySku.get(c.toUpperCase());
      if (v) { hit = v; matchedBy = "SKU"; break; }
    }
    if (!hit && row.ean) {
      const v = byEan.get(row.ean);
      if (v) { hit = v; matchedBy = "EAN"; }
    }
    const catalogueImages = hit?.images ?? [];
    analyzed.push({
      ref: row.ref,
      refClean: row.refClean,
      ean: row.ean,
      title: row.title,
      matched: !!hit,
      matchedBy,
      matchedSku: hit?.sku ?? null,
      matchedProductSlug: hit?.product?.slug ?? null,
      hasCatalogueImages: catalogueImages.length > 0,
      catalogueImageCount: catalogueImages.length,
      excelImageCount: row.images.length,
      delta: Math.max(0, row.images.length - catalogueImages.length),
      status: hit?.status ?? null,
      active: hit?.active ?? null,
    });
  }

  // ------- Summary -------
  const total = analyzed.length;
  const matched = analyzed.filter((a) => a.matched).length;
  const unmatched = total - matched;
  const matchedBySku = analyzed.filter((a) => a.matchedBy === "SKU").length;
  const matchedByEan = analyzed.filter((a) => a.matchedBy === "EAN").length;
  const inCatalogueWithImages = analyzed.filter((a) => a.matched && a.hasCatalogueImages).length;
  const inCatalogueNoImages   = analyzed.filter((a) => a.matched && !a.hasCatalogueImages).length;
  const excelHasImages = analyzed.filter((a) => a.excelImageCount > 0).length;
  const totalExcelImages = analyzed.reduce((s, a) => s + a.excelImageCount, 0);
  const totalCatalogueImages = analyzed.reduce((s, a) => s + a.catalogueImageCount, 0);
  const totalExtras = analyzed.reduce((s, a) => s + a.delta, 0);

  console.log("\n====================================================");
  console.log("REPORT — ST DUPONT · links de imagens vs catálogo");
  console.log("====================================================");
  console.log(`Refs no ficheiro:              ${total}`);
  console.log(`  • Com match no catálogo:     ${matched}   (${((matched/total)*100).toFixed(1)}%)`);
  console.log(`      · por REF (STD stripped): ${matchedBySku}`);
  console.log(`      · por EAN:                ${matchedByEan}`);
  console.log(`  • Sem match (potenciais novos): ${unmatched}`);
  console.log("");
  console.log(`Do que temos (${matched} matches):`);
  console.log(`  • Já com imagens no catálogo: ${inCatalogueWithImages}`);
  console.log(`  • Sem imagens (importar do ficheiro): ${inCatalogueNoImages}`);
  console.log("");
  console.log(`Imagens no Excel: ${totalExcelImages}  (linhas com imagem: ${excelHasImages})`);
  console.log(`Imagens no catálogo (sobre os matches): ${totalCatalogueImages}`);
  console.log(`Imagens ADICIONAIS que o Excel traz: ${totalExtras}   (matches onde delta > 0: ${analyzed.filter(a => a.matched && a.delta > 0).length})`);

  const missingEan = analyzed.filter((a) => !a.ean).length;
  if (missingEan) console.log(`\nAtenção: ${missingEan} linhas sem EAN — só match por REF é possível.`);

  // ------- Write CSVs -------
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csvSummary = [
    "métrica,valor",
    `refs_no_ficheiro,${total}`,
    `matched_total,${matched}`,
    `matched_por_ref,${matchedBySku}`,
    `matched_por_ean,${matchedByEan}`,
    `nao_matched,${unmatched}`,
    `matches_com_imagens,${inCatalogueWithImages}`,
    `matches_sem_imagens,${inCatalogueNoImages}`,
    `imagens_no_excel,${totalExcelImages}`,
    `imagens_no_catalogo_matches,${totalCatalogueImages}`,
    `imagens_extras_disponiveis,${totalExtras}`,
  ].join("\n");
  writeFileSync(`${OUT_DIR}/std-image-crossref-summary.csv`, csvSummary);

  const csvDetail = [
    "ref_excel,ref_clean,ean,titulo,matched,matched_by,matched_sku,produto_slug,catalogue_imgs,excel_imgs,imgs_extras,status,active",
    ...analyzed.map((a) => [
      esc(a.ref), esc(a.refClean), esc(a.ean ?? ""), esc(a.title),
      a.matched ? "SIM" : "NÃO",
      esc(a.matchedBy ?? ""),
      esc(a.matchedSku ?? ""),
      esc(a.matchedProductSlug ?? ""),
      a.catalogueImageCount, a.excelImageCount, a.delta,
      esc(a.status ?? ""), a.active === null ? "" : (a.active ? "SIM" : "NÃO"),
    ].join(",")),
  ].join("\n");
  writeFileSync(`${OUT_DIR}/std-image-crossref-detail.csv`, csvDetail);

  const missingRows = analyzed.filter((a) => !a.matched);
  const csvMissing = [
    "ref_excel,ref_clean,ean,titulo,excel_imgs",
    ...missingRows.map((a) => [
      esc(a.ref), esc(a.refClean), esc(a.ean ?? ""), esc(a.title), a.excelImageCount,
    ].join(",")),
  ].join("\n");
  writeFileSync(`${OUT_DIR}/std-image-crossref-missing.csv`, csvMissing);

  console.log("\nCSVs gravados em:");
  console.log(`  ${OUT_DIR}/std-image-crossref-summary.csv`);
  console.log(`  ${OUT_DIR}/std-image-crossref-detail.csv    (uma linha por REF do ficheiro)`);
  console.log(`  ${OUT_DIR}/std-image-crossref-missing.csv   (só as ${missingRows.length} sem match)`);

  // Sample the first N missing rows to the console for a quick eyeball.
  console.log(`\nAmostra de refs SEM match (primeiras 20):`);
  for (const m of missingRows.slice(0, 20)) {
    console.log(`  ${m.ref.padEnd(16)} · EAN ${(m.ean ?? "—").padEnd(14)} · ${m.title.slice(0, 60)}`);
  }
  if (missingRows.length > 20) console.log(`  … +${missingRows.length - 20} outras (ver std-image-crossref-missing.csv)`);

  // Amostra dos que estão no catálogo SEM imagens (candidatos claros para importar)
  const noImgs = analyzed.filter((a) => a.matched && !a.hasCatalogueImages && a.excelImageCount > 0);
  console.log(`\nCandidatos claros para IMPORTAR imagens (matched · sem imagens no catálogo · Excel tem): ${noImgs.length}`);
  for (const n of noImgs.slice(0, 15)) {
    console.log(`  ${n.matchedSku!.padEnd(16)} · Excel: ${n.excelImageCount} imgs · ${n.title.slice(0, 50)}`);
  }
  if (noImgs.length > 15) console.log(`  … +${noImgs.length - 15} outros`);

  await prisma.$disconnect();
}
main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
