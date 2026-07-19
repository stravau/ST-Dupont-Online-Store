// Backfills the historical sales + returns from the ECI control workbook's
// "Mov_POS_Loja" sheet into Sale + SaleItem, so the reports show the real
// trading history. Idempotent: deletes any prior import (Sale.note = NOTE)
// before re-inserting.
//
// Deliberately does NOT create StockMovements or touch stockLis — the stockLis
// we already imported is the ECI *theoretical* stock, which already has these
// sales subtracted. Recording them again against stock would double-count.
//
//   npx tsx scripts/import-eci-sales.ts "<path.xlsx>"          # dry-run
//   npx tsx scripts/import-eci-sales.ts "<path.xlsx>" --apply  # write
import "dotenv/config";
import * as XLSX from "xlsx";
import { prisma } from "../lib/prisma";

const FILE = process.argv.find((a) => a.endsWith(".xlsx")) ?? "C:/Users/luis_/Desktop/ECI_LIS_Controlo_v1_2_2026 (002).xlsx";
const APPLY = process.argv.includes("--apply");
const NOTE = "Histórico ECI";
const BOUTIQUE = "LIS" as const;

interface RawLine {
  soldAt: Date;
  groupKey: string;
  op: string;
  vd: "VENDA" | "DEVOLUCAO";
  ean: string | null;
  sku: string; // STD-stripped ref
  ref: string;
  desc: string;
  qty: number;
  pvpCents: number;
  discountPct: number;
  grossCents: number;
  netCents: number;
}

function excelDateToUTC(serial: number): Date {
  return new Date(Math.round((serial - 25569) * 86400 * 1000));
}
function horaToSeconds(h: unknown): number {
  if (typeof h === "number") {
    if (h <= 1) return Math.round(h * 86400); // fraction of a day
    const hr = Math.floor(h); // HH.MM number like 17 or 17.3
    const mn = Math.round((h - hr) * 100);
    return hr * 3600 + mn * 60;
  }
  if (typeof h === "string") {
    const f = parseFloat(h.replace(",", "."));
    if (!Number.isNaN(f)) { const hr = Math.floor(f); const mn = Math.round((f - hr) * 100); return hr * 3600 + mn * 60; }
  }
  return 12 * 3600; // fallback noon
}
function candidateSkus(ref: string): string[] {
  const tail = ref.replace(/^STD/, "");
  const out = [tail, ref];
  if (/^000\d{3}$/.test(tail)) out.push("9" + tail.slice(1));
  return [...new Set(out)];
}

async function main() {
  const wb = XLSX.readFile(FILE);
  const rows = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets["Mov_POS_Loja"], { header: 1, defval: null });

  const lines: RawLine[] = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r) continue;
    const dateSerial = r[0], hora = r[2], vd = r[3], op = r[4], ean = r[5], qty = r[6], ref = r[7], desc = r[8], pvp = r[9], disc = r[10], valor = r[11], vrec = r[12];
    if (typeof dateSerial !== "number") continue;
    if (typeof ref !== "string" || !ref.trim()) continue;
    if (vd !== "V" && vd !== "D") continue;
    const base = excelDateToUTC(dateSerial);
    const soldAt = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate()) + horaToSeconds(hora) * 1000);
    const q = typeof qty === "number" ? Math.round(qty) : 1;
    const gross = Math.abs(typeof valor === "number" ? valor : 0);
    const net = Math.abs(typeof vrec === "number" ? vrec : gross / 1.23);
    lines.push({
      soldAt,
      groupKey: `${dateSerial}|${String(hora)}|${String(op)}|${vd}`,
      op: String(op ?? "?").trim().toUpperCase(),
      vd: vd === "D" ? "DEVOLUCAO" : "VENDA",
      ean: ean != null ? String(ean).trim() : null,
      sku: ref.replace(/^STD/, "").toUpperCase(),
      ref: ref.trim(),
      desc: typeof desc === "string" ? desc.trim() : ref.trim(),
      qty: q > 0 ? q : 1,
      pvpCents: Math.round((typeof pvp === "number" ? pvp : 0) * 100),
      discountPct: typeof disc === "number" && disc >= 0 && disc < 1 ? disc : 0,
      grossCents: Math.round(gross * 100),
      netCents: Math.round(net * 100),
    });
  }

  // Group into sales (baskets) by date+time+operator+type.
  const groups = new Map<string, RawLine[]>();
  for (const l of lines) {
    if (!groups.has(l.groupKey)) groups.set(l.groupKey, []);
    groups.get(l.groupKey)!.push(l);
  }

  // Variant lookup maps.
  const variants = await prisma.productVariant.findMany({ select: { id: true, sku: true, ean: true } });
  const bySku = new Map(variants.map((v) => [v.sku.toUpperCase(), v.id]));
  const byEan = new Map(variants.filter((v) => v.ean).map((v) => [v.ean as string, v.id]));
  const matchVariant = (l: RawLine): string | null => {
    for (const c of candidateSkus(l.ref)) { const id = bySku.get(c.toUpperCase()); if (id) return id; }
    if (l.ean && byEan.has(l.ean)) return byEan.get(l.ean)!;
    return null;
  };

  const ops = [...new Set(lines.map((l) => l.op))];
  const matched = lines.filter((l) => matchVariant(l)).length;
  console.log(`Lines: ${lines.length}  ·  Sales(groups): ${groups.size}  ·  V/D: ${lines.filter((l) => l.vd === "VENDA").length}/${lines.filter((l) => l.vd === "DEVOLUCAO").length}`);
  console.log(`Variant match: ${matched}/${lines.length} (${Math.round((matched / lines.length) * 100)}%)`);
  console.log(`Operators: ${ops.join(", ")}`);

  if (!APPLY) {
    console.log("\nDRY RUN — re-run with --apply to write.");
    await prisma.$disconnect();
    return;
  }

  // Upsert operators.
  for (const initials of ops) {
    await prisma.operator.upsert({
      where: { boutique_initials: { boutique: BOUTIQUE, initials } },
      update: { active: true },
      create: { boutique: BOUTIQUE, initials },
    });
  }
  const opId = new Map((await prisma.operator.findMany({ where: { boutique: BOUTIQUE } })).map((o) => [o.initials, o.id]));

  // Idempotent: drop any previous import.
  const prior = await prisma.sale.findMany({ where: { note: NOTE }, select: { id: true } });
  if (prior.length) {
    await prisma.saleItem.deleteMany({ where: { saleId: { in: prior.map((p) => p.id) } } });
    await prisma.sale.deleteMany({ where: { note: NOTE } });
    console.log(`Removed ${prior.length} previously-imported sales.`);
  }

  let created = 0, items = 0;
  for (const [, groupLines] of groups) {
    const first = groupLines[0];
    const operatorId = opId.get(first.op);
    if (!operatorId) continue;
    const grossCents = groupLines.reduce((s, l) => s + l.grossCents, 0);
    const netCents = groupLines.reduce((s, l) => s + l.netCents, 0);
    const eci = Math.round(netCents * 0.19);
    await prisma.sale.create({
      data: {
        boutique: BOUTIQUE,
        operatorId,
        type: first.vd,
        soldAt: first.soldAt,
        grossCents,
        netCents,
        eciCommissionCents: eci,
        note: NOTE,
        items: {
          create: groupLines.map((l) => ({
            variantId: matchVariant(l),
            sku: l.ref,
            ean: l.ean,
            descSnapshot: l.desc,
            brand: "S.T. Dupont",
            quantity: l.qty,
            unitPriceCents: l.pvpCents,
            discountPct: l.discountPct,
            grossCents: l.grossCents,
            netCents: l.netCents,
          })),
        },
      },
    });
    created++;
    items += groupLines.length;
  }

  await prisma.adminAction.create({
    data: { entityType: "UPLOAD_BATCH", action: "IMPORT", entityId: "eci-sales", note: `Histórico ECI: ${created} vendas/devoluções, ${items} linhas` },
  });

  console.log(`\nCreated ${created} sales · ${items} lines. Done.`);
  await prisma.$disconnect();
}
main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
