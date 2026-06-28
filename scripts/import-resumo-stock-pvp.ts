// Rectifies stockLis / stockVng / stock / priceCents from the
// STD_Resumo_Stock_PVP.xlsx export. EAN-first match, REF (with STD-prefix
// strip) as fallback. Dry-run by default; pass --apply to write.
//
//   $env:DATABASE_URL = "<neon url>"
//   npx tsx scripts/import-resumo-stock-pvp.ts            # preview
//   npx tsx scripts/import-resumo-stock-pvp.ts --apply    # commit
//   Remove-Item Env:DATABASE_URL

import "dotenv/config";
import * as path from "path";
import * as xlsx from "xlsx";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const FILE = process.argv.find((a) => a.endsWith(".xlsx"))
  ?? "c:/Users/Utilizador/Downloads/STD_Resumo_Stock_PVP.xlsx";
const APPLY = process.argv.includes("--apply");

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Aborting.");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

interface Row {
  ean: string | null;
  ref: string | null;
  description: string | null;
  stockLis: number;
  stockVng: number;
  priceCents: number | null;
}

function refCandidates(ref: string): string[] {
  const tail = ref.replace(/^STD/, "");
  const out: string[] = [tail];
  if (/^000\d{3}$/.test(tail)) out.push("9" + tail.slice(1));
  if (ref !== tail) out.push(ref);
  return out;
}

(async () => {
  console.log(`Reading ${path.basename(FILE)} ${APPLY ? "(APPLY mode)" : "(dry-run)"}`);
  const wb = xlsx.readFile(FILE);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const raw = xlsx.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: null });

  const rows: Row[] = [];
  for (const r of raw) {
    const ean  = r["EAN"]  != null ? String(r["EAN"]).trim()  : null;
    const ref  = r["REF"]  != null ? String(r["REF"]).trim()  : null;
    const description = r["Descrição"] != null ? String(r["Descrição"]) : null;
    const stockLis = Math.max(0, Math.trunc(Number(r["Stk LIS"]) || 0));
    const stockVng = Math.max(0, Math.trunc(Number(r["Stk VNG"]) || 0));
    const pvp = Number(r["PVP"]);
    const priceCents = Number.isFinite(pvp) ? Math.round(pvp * 100) : null;
    rows.push({ ean, ref, description, stockLis, stockVng, priceCents });
  }

  let matchedByEan = 0;
  let matchedByRef = 0;
  let unmatched = 0;
  let updated = 0;
  let noop = 0;
  const sampleMisses: { ref: string | null; ean: string | null }[] = [];

  for (const row of rows) {
    // EAN-first.
    let variant: { id: string; sku: string; stockLis: number; stockVng: number; priceCents: number } | null = null;
    if (row.ean) {
      variant = await prisma.productVariant.findUnique({
        where: { ean: row.ean },
        select: { id: true, sku: true, stockLis: true, stockVng: true, priceCents: true },
      });
      if (variant) matchedByEan++;
    }
    if (!variant && row.ref) {
      const cands = refCandidates(row.ref);
      const candidates = await prisma.productVariant.findMany({
        where: { sku: { in: cands } },
        select: { id: true, sku: true, stockLis: true, stockVng: true, priceCents: true },
      });
      if (candidates.length === 1) variant = candidates[0];
      else if (candidates.length > 1) {
        for (const c of cands) {
          const hit = candidates.find((m) => m.sku === c);
          if (hit) { variant = hit; break; }
        }
        if (!variant) variant = candidates[0];
      }
      if (variant) matchedByRef++;
    }

    if (!variant) {
      unmatched++;
      if (sampleMisses.length < 12) sampleMisses.push({ ref: row.ref, ean: row.ean });
      continue;
    }

    const stockTotal = row.stockLis + row.stockVng;
    const changed =
      variant.stockLis !== row.stockLis ||
      variant.stockVng !== row.stockVng ||
      (row.priceCents != null && variant.priceCents !== row.priceCents);
    if (!changed) { noop++; continue; }

    if (APPLY) {
      await prisma.productVariant.update({
        where: { id: variant.id },
        data: {
          stockLis: row.stockLis,
          stockVng: row.stockVng,
          stock: stockTotal,
          ...(row.priceCents != null && row.priceCents !== variant.priceCents
            ? { priceCents: row.priceCents, pvpStartDate: new Date() }
            : {}),
        },
      });
    }
    updated++;
  }

  console.log("");
  console.log(`Rows in file:       ${rows.length.toLocaleString("pt-PT")}`);
  console.log(`Matched by EAN:     ${matchedByEan.toLocaleString("pt-PT")}`);
  console.log(`Matched by REF:     ${matchedByRef.toLocaleString("pt-PT")}`);
  console.log(`Unmatched:          ${unmatched.toLocaleString("pt-PT")}`);
  console.log(`Would update:       ${updated.toLocaleString("pt-PT")}`);
  console.log(`No-op (in sync):    ${noop.toLocaleString("pt-PT")}`);
  if (sampleMisses.length) {
    console.log("");
    console.log("First unmatched refs:");
    for (const m of sampleMisses) console.log(`  REF=${m.ref ?? "—"}  EAN=${m.ean ?? "—"}`);
  }
  if (!APPLY) console.log("\nDry-run only — pass --apply to commit.");

  await prisma.$disconnect();
})().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
