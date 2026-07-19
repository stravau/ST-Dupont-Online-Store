// Loads ONLY the Gaia (VNG) stock from STD_Resumo_Stock_PVP.xlsx into
// ProductVariant.stockVng, matching by EAN then REF. Deliberately does NOT
// touch stockLis or priceCents — the Lisboa stock in the DB comes from the more
// recent ECI import and must stay as-is. After setting stockVng it recomputes
// the aggregate stock = stockLis(current) + stockVng(new).
//
// Rows that don't match any catalogue variant are just reported, never created
// (unlike stock:rectify) — this is a targeted stockVng backfill, not a sync.
//
//   $env:DATABASE_URL = "<neon url>"
//   npx tsx scripts/import-vng-stock.ts            # preview
//   npx tsx scripts/import-vng-stock.ts --apply    # commit
import "dotenv/config";
import * as path from "path";
import * as xlsx from "xlsx";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const FILE = process.argv.find((a) => a.endsWith(".xlsx")) ?? "C:/Users/luis_/Downloads/STD_Resumo_Stock_PVP.xlsx";
const APPLY = process.argv.includes("--apply");

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Aborting.");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Strip STD prefix; 000NNN also tries 900NNN (legacy gas-refill numbering);
// finally the raw ref too. Mirrors the other import scripts.
function refCandidates(ref: string): string[] {
  const tail = ref.replace(/^STD/, "");
  const out: string[] = [tail];
  if (/^000\d{3}$/.test(tail)) out.push("9" + tail.slice(1));
  if (ref !== tail) out.push(ref);
  return out;
}

(async () => {
  console.log(`Reading ${path.basename(FILE)} ${APPLY ? "(APPLY)" : "(dry-run)"} — só a coluna Stk VNG`);
  const wb = xlsx.readFile(FILE);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const raw = xlsx.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: null });

  interface Row { ean: string | null; ref: string | null; desc: string | null; stockVng: number; }
  const rows: Row[] = raw.map((r) => ({
    ean: r["EAN"] != null ? String(r["EAN"]).trim() : null,
    ref: r["REF"] != null ? String(r["REF"]).trim() : null,
    desc: r["Descrição"] != null ? String(r["Descrição"]) : null,
    stockVng: Math.max(0, Math.trunc(Number(r["Stk VNG"]) || 0)),
  }));

  const variants = await prisma.productVariant.findMany({
    select: { id: true, sku: true, ean: true, stockLis: true, stockVng: true },
  });
  const bySku = new Map(variants.map((v) => [v.sku, v]));
  const byEan = new Map(variants.filter((v) => v.ean).map((v) => [v.ean as string, v]));

  let matched = 0, unmatched = 0, changed = 0, noop = 0, unitsVng = 0;
  const updates: { id: string; stockVng: number; stock: number }[] = [];
  const sampleUnmatched: string[] = [];

  for (const row of rows) {
    let hit = row.ean ? byEan.get(row.ean) : undefined;
    if (!hit && row.ref) {
      for (const c of refCandidates(row.ref)) { const v = bySku.get(c); if (v) { hit = v; break; } }
    }
    if (!hit) {
      unmatched++;
      if (sampleUnmatched.length < 12) sampleUnmatched.push(`REF=${row.ref ?? "—"} EAN=${row.ean ?? "—"} ${row.desc ?? ""}`);
      continue;
    }
    matched++;
    unitsVng += row.stockVng;
    if ((hit.stockVng ?? 0) === row.stockVng) { noop++; continue; }
    changed++;
    updates.push({ id: hit.id, stockVng: row.stockVng, stock: (hit.stockLis ?? 0) + row.stockVng });
  }

  console.log("");
  console.log(`Linhas no ficheiro:     ${rows.length}`);
  console.log(`Correspondidas:         ${matched}  (por EAN ou REF)`);
  console.log(`  → a atualizar stockVng: ${changed}`);
  console.log(`  → já iguais (no-op):    ${noop}`);
  console.log(`Sem correspondência:    ${unmatched}  (ignoradas — não se criam órfãos aqui)`);
  console.log(`Total de unidades VNG no ficheiro (correspondidas): ${unitsVng}`);
  if (sampleUnmatched.length) {
    console.log("\nAmostra de linhas sem correspondência:");
    for (const s of sampleUnmatched) console.log(`  ${s}`);
  }

  if (!APPLY) {
    console.log("\nDry-run — corre com --apply para gravar. Só mexe em stockVng (e no total). stockLis e preços ficam intactos.");
    await prisma.$disconnect();
    return;
  }

  console.log("\nA aplicar (apenas stockVng + total)…");
  let done = 0, failed = 0;
  for (const u of updates) {
    try {
      await prisma.productVariant.update({ where: { id: u.id }, data: { stockVng: u.stockVng, stock: u.stock } });
      done++;
    } catch (e) {
      failed++;
      if (failed <= 5) console.error(`  falhou: ${(e as Error).message.slice(0, 160)}`);
    }
  }
  await prisma.adminAction.create({
    data: { entityType: "UPLOAD_BATCH", action: "IMPORT", entityId: "vng-stock", note: `Stock Gaia (VNG) de ${path.basename(FILE)}: ${done} variantes atualizadas` },
  });
  console.log(`\nAtualizadas: ${done} · falhadas: ${failed}. stockLis e preços não foram tocados.`);
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
