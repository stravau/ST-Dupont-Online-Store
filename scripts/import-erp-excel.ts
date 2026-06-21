// One-shot ERP import driven by the daily Starbrands Excel.
//
// Cross-references the spreadsheet's "DB" sheet against ProductVariant.sku
// (the ref column drops the STD prefix; some 000NNN tails live as 900NNN
// in our seed). Updates matched variants with EAN + PVP + stock + promo
// fields; inserts orphan rows under a hidden "unmapped-inventory" parent
// product so they're tracked but never shown on the catalogue.
//
// Defaults to DRY-RUN. Pass --apply to actually write to the database.
// Always reads the DB pointed at by DATABASE_URL — set the Neon URL
// before running:
//   $env:DATABASE_URL = "<neon url>"; npx tsx scripts/import-erp-excel.ts --apply
//
// Excel column layout (DB sheet, row 1 is headers):
//   0  EAN          (number — beware Excel may store as exponent)
//   1  Ref          (e.g. STD000430)
//   2  Marca        (ST DUPONT / KAWECO / …)
//   3  Descrição    (free text)
//   4  PVP          (euros, may be decimal)
//   5  Stock Teórico
//   6  Mov_POS
//   7  Mov_Int_Ext
//   8  Reserva
//   9  Danif

import "dotenv/config";
import * as xlsx from "xlsx";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const FILE = process.argv.find((a) => a.endsWith(".xlsx")) ??
  "c:/Users/Utilizador/Desktop/ECI_LIS_Controlo_v1_2_2026 (002).xlsx";
const APPLY = process.argv.includes("--apply");

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Aborting.");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

interface ExcelRow {
  ean: string | null;
  ref: string;
  brand: string | null;
  desc: string | null;
  pvpCents: number | null;
  stock: number | null;
}

interface Match {
  excel: ExcelRow;
  sku: string;
  confidence: "exact-only-candidate" | "exact-price-match" | "fuzzy-price-fit" | "raw-strip";
}

function loadExcel(file: string): ExcelRow[] {
  const wb = xlsx.readFile(file);
  const ws = wb.Sheets["DB"];
  const rows = xlsx.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: null });
  const out: ExcelRow[] = [];
  for (let i = 2; i < rows.length; i++) {
    const r = rows[i];
    if (!r || typeof r[1] !== "string") continue;
    if (/^(OUTROS|SB-)/.test(r[1] as string)) continue;
    const eanRaw = r[0];
    const ean = eanRaw == null ? null : String(eanRaw).trim();
    const pvpVal = r[4];
    const pvpCents = typeof pvpVal === "number" ? Math.round(pvpVal * 100) : null;
    const stockVal = r[5];
    const stock = typeof stockVal === "number" ? stockVal : null;
    out.push({
      ean,
      ref: r[1] as string,
      brand: r[2] as string | null,
      desc: r[3] as string | null,
      pvpCents,
      stock,
    });
  }
  return out;
}

async function loadCurrent(): Promise<Map<string, { id: string; priceCents: number }>> {
  const variants = await prisma.productVariant.findMany({
    select: { sku: true, id: true, priceCents: true },
  });
  return new Map(variants.map((v) => [v.sku, { id: v.id, priceCents: v.priceCents }]));
}

function candidateSkus(ref: string): string[] {
  const out: string[] = [];
  const tail = ref.replace(/^STD/, "");
  out.push(tail);
  // Gas-refill / flint family: STD000NNN often lives as 900NNN in our seed.
  if (/^000\d{3}$/.test(tail)) out.push("9" + tail.slice(1));
  // Raw ref also (covers non-STD prefixes like KW… that we might still hold).
  if (ref !== tail) out.push(ref);
  return out;
}

function chooseMatch(
  ref: string,
  excelCents: number | null,
  current: Map<string, { id: string; priceCents: number }>,
): Match["confidence"] | null | { sku: string; conf: Match["confidence"] } {
  const cands = candidateSkus(ref).filter((s) => current.has(s));
  if (cands.length === 0) return null;
  if (cands.length === 1) return { sku: cands[0], conf: "exact-only-candidate" };
  // Multiple candidates — break tie by closest priceCents.
  if (excelCents !== null) {
    let best = cands[0];
    let bestDelta = Math.abs(current.get(best)!.priceCents - excelCents);
    for (const c of cands.slice(1)) {
      const d = Math.abs(current.get(c)!.priceCents - excelCents);
      if (d < bestDelta) { best = c; bestDelta = d; }
    }
    // Tight match (within 5%) = high confidence.
    const ratio = current.get(best)!.priceCents === 0 ? 1 : bestDelta / current.get(best)!.priceCents;
    return { sku: best, conf: ratio < 0.05 ? "exact-price-match" : "fuzzy-price-fit" };
  }
  return { sku: cands[0], conf: "raw-strip" };
}

async function main() {
  console.log(`Reading ${FILE}`);
  const excel = loadExcel(FILE);
  console.log(`Excel rows: ${excel.length}`);
  console.log("Connecting to database…");
  const current = await loadCurrent();
  console.log(`Database variants loaded: ${current.size}`);

  const matches: Match[] = [];
  const orphans: ExcelRow[] = [];
  for (const row of excel) {
    const choice = chooseMatch(row.ref, row.pvpCents, current);
    if (choice && typeof choice === "object") {
      matches.push({ excel: row, sku: choice.sku, confidence: choice.conf });
    } else {
      orphans.push(row);
    }
  }

  // Confidence breakdown
  const confCount: Record<string, number> = {};
  for (const m of matches) confCount[m.confidence] = (confCount[m.confidence] ?? 0) + 1;

  console.log("\n==== Plan ====");
  console.log(`Matches  : ${matches.length}`);
  for (const [c, n] of Object.entries(confCount)) console.log(`  ${c.padEnd(22)} ${n}`);
  console.log(`Orphans  : ${orphans.length}`);
  console.log(`EANs in Excel (matched) : ${matches.filter((m) => m.excel.ean).length}`);
  console.log(`EANs in Excel (orphans) : ${orphans.filter((o) => o.ean).length}`);

  // Sample low-confidence matches so user can sanity-check.
  const fuzzy = matches.filter((m) => m.confidence === "fuzzy-price-fit");
  if (fuzzy.length) {
    console.log("\nLow-confidence matches (sample 10):");
    for (const f of fuzzy.slice(0, 10)) {
      const cur = current.get(f.sku)!.priceCents;
      console.log(`  ${f.excel.ref.padEnd(15)} → ${f.sku.padEnd(14)} | excel €${(f.excel.pvpCents ?? 0) / 100} vs current €${cur / 100} | ${f.excel.desc}`);
    }
  }

  if (!APPLY) {
    console.log("\nDRY RUN. Re-run with --apply to commit changes to the database.");
    await prisma.$disconnect();
    return;
  }

  // ---------- Apply ----------
  console.log("\nApplying…");

  // Updates
  let updated = 0;
  for (const m of matches) {
    const data: {
      ean?: string | null;
      stock?: number;
      priceCents?: number;
      pvpStartDate?: Date;
    } = {};
    if (m.excel.ean) data.ean = m.excel.ean;
    if (m.excel.stock !== null && m.excel.stock >= 0) data.stock = m.excel.stock;
    if (m.excel.pvpCents !== null) {
      data.priceCents = m.excel.pvpCents;
      data.pvpStartDate = new Date();
    }
    if (Object.keys(data).length === 0) continue;
    try {
      await prisma.productVariant.update({ where: { sku: m.sku }, data });
      updated++;
    } catch (e) {
      console.error(`  failed UPDATE ${m.sku}: ${(e as Error).message.slice(0, 120)}`);
    }
  }
  console.log(`Updated variants: ${updated}/${matches.length}`);

  // Orphans → placeholder product
  if (orphans.length > 0) {
    const slug = "unmapped-inventory";
    const ph = await prisma.product.upsert({
      where: { slug },
      create: {
        slug,
        name: { pt: "Inventário não mapeado", en: "Unmapped inventory" },
        description: {
          pt: "Itens existentes na boutique sem ficha no site. Não visíveis publicamente.",
          en: "Items held in the boutique without a site listing. Not publicly visible.",
        },
        collection: "Inventário",
        active: false,
        category: {
          connectOrCreate: {
            where: { slug: "acessorios" },
            create: {
              slug: "acessorios",
              name: { pt: "Acessórios", en: "Accessories" },
              tagline: { pt: "", en: "" },
            },
          },
        },
      },
      update: {},
      select: { id: true },
    });

    let inserted = 0;
    let skipped = 0;
    for (const o of orphans) {
      try {
        await prisma.productVariant.upsert({
          where: { sku: o.ref },
          create: {
            sku: o.ref,
            productId: ph.id,
            name: { pt: o.desc ?? o.ref, en: o.desc ?? o.ref },
            priceCents: o.pvpCents ?? 0,
            currency: "EUR",
            stock: o.stock != null && o.stock >= 0 ? o.stock : 0,
            ean: o.ean,
            pvpStartDate: o.pvpCents != null ? new Date() : null,
            active: false,
            attributes: { unmapped: true, source: "erp-excel", brand: o.brand ?? "ST DUPONT" },
          },
          update: {
            ean: o.ean ?? undefined,
            stock: o.stock != null && o.stock >= 0 ? o.stock : undefined,
            priceCents: o.pvpCents ?? undefined,
            pvpStartDate: o.pvpCents != null ? new Date() : undefined,
          },
        });
        inserted++;
      } catch (e) {
        skipped++;
        if (skipped < 5) console.error(`  failed UPSERT ${o.ref}: ${(e as Error).message.slice(0, 120)}`);
      }
    }
    console.log(`Orphans inserted/updated: ${inserted}/${orphans.length} (skipped ${skipped})`);
  }

  await prisma.$disconnect();
  console.log("\nDone.");
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
