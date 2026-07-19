// Backfills the historical repair tickets from the ECI control workbook's
// "Reparações" sheet into the Repair table, so the admin Reparações tab mirrors
// the Excel. Idempotent: wipes prior imported rows (createdWith = NOTE via
// AdminAction batch) — here we simply clear ALL Repair rows that came from the
// import and re-insert, matching on a stable natural key would be brittle since
// the sheet has no id. We tag imported rows by deleting everything first only
// when --reset is passed; by default we skip rows already present (same
// firstVisit + customer + reference).
//
//   npx tsx scripts/import-eci-repairs.ts "<path.xlsx>"          # dry-run
//   npx tsx scripts/import-eci-repairs.ts "<path.xlsx>" --apply  # write (skip dupes)
//   npx tsx scripts/import-eci-repairs.ts "<path.xlsx>" --apply --reset  # wipe+reimport
import "dotenv/config";
import * as XLSX from "xlsx";
import { prisma } from "../lib/prisma";

const FILE = process.argv.find((a) => a.endsWith(".xlsx")) ?? "C:/Users/luis_/Desktop/ECI_LIS_Controlo_v1_2_2026 (002).xlsx";
const APPLY = process.argv.includes("--apply");
const RESET = process.argv.includes("--reset");
const BOUTIQUE = "LIS" as const;

type RepairStatus = "ABERTO" | "EM_ANALISE" | "EM_ESPANHA" | "ORCAMENTO_ENVIADO" | "A_AGUARDAR_CLIENTE" | "RESOLVIDO";

// Free-text "Estado" → enum. Almost every historical row is "Resolvido".
function mapStatus(raw: unknown): RepairStatus {
  const s = String(raw ?? "").toLowerCase();
  if (s.includes("resolv") || s.includes("entreg") || s.includes("conclu")) return "RESOLVIDO";
  if (s.includes("espanha")) return "EM_ESPANHA";
  if (s.includes("orçam") || s.includes("orcam")) return "ORCAMENTO_ENVIADO";
  if (s.includes("aguard") || s.includes("cliente")) return "A_AGUARDAR_CLIENTE";
  if (s.includes("anális") || s.includes("analis") || s.includes("loja")) return "EM_ANALISE";
  return "ABERTO";
}

// Parse a date cell: a real Date (cellDates), or free text containing dd/mm/yyyy.
// Returns null for "??" / unparseable — the sheet genuinely has unknowns.
function parseDate(v: unknown): Date | null {
  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    // XLSX cellDates uses local tz; normalise to that calendar day at local midnight.
    return new Date(v.getFullYear(), v.getMonth(), v.getDate(), 0, 0, 0, 0);
  }
  if (typeof v === "number") {
    const d = new Date(Math.round((v - 25569) * 86400 * 1000));
    return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0);
  }
  if (typeof v === "string") {
    const m = v.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
    if (m) {
      const dd = +m[1], mm = +m[2];
      let yy = +m[3];
      if (yy < 100) yy += 2000;
      const d = new Date(yy, mm - 1, dd, 0, 0, 0, 0);
      if (!Number.isNaN(d.getTime())) return d;
    }
  }
  return null;
}

const str = (v: unknown): string | null => {
  if (v == null) return null;
  const t = String(v).trim();
  return t ? t : null;
};

async function main() {
  const wb = XLSX.readFile(FILE, { cellDates: true });
  const rows = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets["Reparações"], { header: 1, defval: null });

  interface Rec {
    firstVisitAt: Date | null;
    staff: string;
    status: RepairStatus;
    customerName: string;
    reference: string;
    subject: string;
    updates: string | null;
    lastContactAt: Date | null;
    lastContactStaff: string | null;
    lastContactVia: string | null;
    lastContactNote: string | null;
    otherObs: string | null;
    phone: string | null;
    otherContacts: string | null;
    rawFirstVisit: string | null; // preserved when the date was unparseable
  }

  const recs: Rec[] = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r) continue;
    // Cols (0-indexed): 0 1ªVisita, 1 Staff, 2 Estado, 3 Cli_Nome, 4 Ref, 5 Assunto,
    // 6 Atualizações, 7 ÚltContato_Data&Staff, 8 ÚltContato(via), 9 ÚltContato_Obs,
    // 10 Outras_Obs, 11 Tlm_WhatsApp, 12 Outros_Contatos
    const customer = str(r[3]);
    const reference = str(r[4]);
    const subject = str(r[5]);
    // Skip empty / structural rows — need at least a customer and (ref or subject).
    if (!customer || (!reference && !subject)) continue;

    const fv = parseDate(r[0]);
    const rawFv = fv ? null : str(r[0]);

    // "Último_Contato_Data_&_Staff" packs a date and often "(XX)" staff initials.
    const lcRaw = r[7];
    const lastContactAt = parseDate(lcRaw);
    const lcStaffMatch = typeof lcRaw === "string" ? lcRaw.match(/\(([A-Za-z]{1,3})\)/) : null;

    recs.push({
      firstVisitAt: fv,
      staff: (str(r[1]) ?? "").toUpperCase(),
      status: mapStatus(r[2]),
      customerName: customer,
      reference: reference ?? "—",
      subject: subject ?? "—",
      updates: str(r[6]),
      lastContactAt,
      lastContactStaff: lcStaffMatch ? lcStaffMatch[1].toUpperCase() : null,
      lastContactVia: str(r[8]),
      lastContactNote: str(r[9]),
      otherObs: str(r[10]),
      phone: str(r[11]),
      otherContacts: str(r[12]),
      rawFirstVisit: rawFv,
    });
  }

  console.log(`Reparações parsed: ${recs.length}`);
  console.log(`  com data 1ª visita: ${recs.filter((x) => x.firstVisitAt).length} · sem data: ${recs.filter((x) => !x.firstVisitAt).length}`);
  const byStatus = recs.reduce<Record<string, number>>((a, x) => ((a[x.status] = (a[x.status] ?? 0) + 1), a), {});
  console.log(`  estados:`, byStatus);
  console.log(`  exemplo:`, JSON.stringify({ ...recs[0], subject: recs[0]?.subject.slice(0, 40) + "…" }, null, 0));

  if (!APPLY) {
    console.log("\nDRY RUN — re-run with --apply to write.");
    await prisma.$disconnect();
    return;
  }

  if (RESET) {
    const del = await prisma.repair.deleteMany({ where: { boutique: BOUTIQUE } });
    console.log(`--reset: removed ${del.count} existing repairs.`);
  }

  let created = 0, skipped = 0;
  for (const rec of recs) {
    // Dedupe (unless --reset already wiped): same customer + reference + firstVisit.
    if (!RESET) {
      const existing = await prisma.repair.findFirst({
        where: {
          boutique: BOUTIQUE,
          customerName: rec.customerName,
          reference: rec.reference,
          firstVisitAt: rec.firstVisitAt,
        },
        select: { id: true },
      });
      if (existing) { skipped++; continue; }
    }
    // Preserve an unparseable "1ª Visita" note in updates so nothing is lost.
    const updates = rec.rawFirstVisit
      ? `[1ª Visita: ${rec.rawFirstVisit}] ${rec.updates ?? ""}`.trim()
      : rec.updates;
    await prisma.repair.create({
      data: {
        boutique: BOUTIQUE,
        firstVisitAt: rec.firstVisitAt,
        staff: rec.staff,
        status: rec.status,
        customerName: rec.customerName,
        reference: rec.reference,
        subject: rec.subject,
        updates,
        lastContactAt: rec.lastContactAt,
        lastContactStaff: rec.lastContactStaff,
        lastContactVia: rec.lastContactVia,
        lastContactNote: rec.lastContactNote,
        otherObs: rec.otherObs,
        phone: rec.phone,
        otherContacts: rec.otherContacts,
      },
    });
    created++;
  }

  await prisma.adminAction.create({
    data: { entityType: "UPLOAD_BATCH", action: "IMPORT", entityId: "eci-repairs", note: `Histórico Reparações ECI: ${created} processos (${skipped} já existentes)` },
  });

  console.log(`\nCreated ${created} repairs · skipped ${skipped} (already present). Done.`);
  await prisma.$disconnect();
}
main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
