import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/admin-auth";
import { assertRateLimit, assertSameOrigin, safeError } from "@/lib/admin-api";
import { readWorkbookMatrix, detectEciStore, type Cell, type EciStore } from "@/lib/admin-upload";

export const dynamic = "force-dynamic";
export const maxDuration = 120; // whole-workbook ingest — give it headroom.

// Unified ECI Controlo sync (Fase 1 of the Excel→app transition). One upload
// absorbs the workbook; the boss sees a per-sheet report. DEFAULTS TO DRY-RUN —
// nothing is written until the request sends { apply: true }, so the report can
// be reviewed against the real file first. Staff-only; same-origin + rate-limit.
//
// Scope: every non-derived sheet of the ECI Controlo — DB (stock/PVP/novos/other
// brands), Mov_POS_Loja (historical sales), Mov_Int_Ext (stock ledger),
// (Danificados), Reservas, Operadores, and the three repair-shaped sheets
// (Reparações, Assuntos Vários, Assuntos Terminados). Vend_Dia, Estat_Calc and
// Enc_Template are derived / unused and skipped.

const DB_SHEET = "DB";
// Real sheet names, confirmed against ECI_LIS_Controlo. Note the accents and
// the parentheses — the file uses "Reparações" and "(Danificados)".
const RESERVAS_SHEET = "Reservas";
const OPERADORES_SHEET = "Operadores";
const DANIFICADOS_SHEET = "(Danificados)";
const MOV_INT_EXT_SHEET = "Mov_Int_Ext";
const MOV_POS_LOJA_SHEET = "Mov_POS_Loja";
// The three repair-shaped sheets — same column layout, different buckets.
const REPAIR_SHEETS: { name: string; bucket: "REPARACAO" | "ASSUNTO_VARIOS" | "ASSUNTO_TERMINADO" }[] = [
  { name: "Reparações",         bucket: "REPARACAO" },
  { name: "Assuntos Vários",    bucket: "ASSUNTO_VARIOS" },
  { name: "Assuntos Terminados", bucket: "ASSUNTO_TERMINADO" },
];

// Tag on ECI-imported sales so the sync can wipe & re-insert only the ECI-
// backfilled subset without touching sales the POS terminal has created.
const ECI_SALE_NOTE = "Histórico ECI";

function normEan(v: Cell): string | null {
  if (v == null || v === "") return null;
  const s = String(v).trim();
  return s ? s.replace(/\.0+$/, "") : null;
}
function refCandidates(ref: string): string[] {
  const tail = ref.replace(/^STD/, "");
  const out: string[] = [tail];
  if (/^000\d{3}$/.test(tail)) out.push("9" + tail.slice(1));
  if (ref !== tail) out.push(ref);
  return out;
}

interface SheetReport {
  sheet: string;
  status: "ok" | "pending" | "missing";
  rows?: number;
  detail?: string;
  changes?: Record<string, number>;
  sampleUnmatched?: string[];
}

export async function POST(req: Request) {
  const csrf = assertSameOrigin(req);
  if (csrf) return csrf;
  const rl = await assertRateLimit(req, "sync-eci", 10, 60_000);
  if (rl) return rl;
  // Aberto aos três roles de staff — as boutiques também precisam de
  // sincronizar durante a fase de transição em que o Excel é a fonte.
  const gate = await requireStaff();
  if (!gate.ok) return gate.response;

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ ok: false, error: "no file" }, { status: 400 });
  const apply = form.get("apply") === "true";
  const storeOverride = form.get("store");
  const store: EciStore | null =
    storeOverride === "LIS" || storeOverride === "VNG" ? storeOverride : detectEciStore(file.name);
  if (!store) {
    return NextResponse.json(
      { ok: false, error: "não deu para detetar a loja (LIS/VNG) pelo nome do ficheiro — escolhe manualmente", needStore: true },
      { status: 400 },
    );
  }

  let sheets: Record<string, Cell[][]>;
  try { sheets = await readWorkbookMatrix(file); }
  catch (e) { return safeError(e, "ficheiro ilegível"); }

  const batchId = randomUUID();
  const reports: SheetReport[] = [];

  // Helper: run a sheet sync only if the sheet exists; else report missing.
  async function runSheet(name: string, fn: (m: Cell[][]) => Promise<SheetReport>) {
    const m = sheets[name];
    reports.push(m ? await fn(m) : { sheet: name, status: "missing", detail: "folha ausente" });
  }

  // ---------- Wired sheets ----------
  await runSheet(DB_SHEET, (m) => syncDbSheet(m, store, apply));            // stock/PVP/novos/outras marcas
  await runSheet(MOV_POS_LOJA_SHEET, (m) => syncSales(m, store, apply));     // histórico de vendas
  await runSheet(MOV_INT_EXT_SHEET, (m) => syncMovements(m, store, apply, "INT_EXT"));    // ent/sai/transf
  await runSheet(DANIFICADOS_SHEET, (m) => syncMovements(m, store, apply, "DANIFICADO")); // danificados
  await runSheet(RESERVAS_SHEET, (m) => syncReservas(m, store, apply));      // reservas de clientes
  await runSheet(OPERADORES_SHEET, (m) => syncOperadores(m, store, apply));  // metas mensais
  // The three repair-shaped sheets — same parser, different bucket tag.
  for (const rep of REPAIR_SHEETS) {
    await runSheet(rep.name, (m) => syncRepairSheet(m, store, apply, rep.bucket, rep.name));
  }

  if (apply) {
    try {
      await prisma.adminAction.create({
        data: {
          entityType: "UPLOAD_BATCH", action: "SYNC_ECI", entityId: `eci-${store.toLowerCase()}`, batchId,
          note: `Sync ECI ${store} · ${file.name} · ${reports.filter((r) => r.status === "ok").length} folhas aplicadas`,
          after: { store, file: file.name, reports } as object,
        },
      });
    } catch (e) { return safeError(e, "batch summary write failed"); }
  }

  return NextResponse.json({ ok: true, store, applied: apply, file: file.name, batchId, reports });
}

// DB sheet layout (positional): 0=EAN, 1=Ref, 2=Marca, 3=Descrição, 4=PVP,
// 5=Stock Teórico. Row 0 = section title, row 1 = headers, 2..N = data.
// Dupont rows → ProductVariant (stock for THIS store + PVP; create if new,
// INDISPONIVEL). Non-Dupont rows → OtherBrandItem upsert (VNG file only).
async function syncDbSheet(matrix: Cell[][], store: EciStore, apply: boolean): Promise<SheetReport> {
  const body = matrix.slice(2);
  const stockCol = store === "LIS" ? "stockLis" : "stockVng";

  interface Parsed { ean: string | null; ref: string; brand: string; desc: string; pvpCents: number | null; stock: number; }
  const dupont: Parsed[] = [];
  const other: Parsed[] = [];
  let blank = 0;
  for (const r of body) {
    if (!r) continue;
    const ref = r[1] == null ? "" : String(r[1]).trim();
    if (!ref) { blank++; continue; }
    const brand = (r[2] == null ? "" : String(r[2]).trim()).toUpperCase();
    const pvp = r[4] == null || r[4] === "" ? null : Math.round((Number(r[4]) || 0) * 100);
    const parsed: Parsed = {
      ean: normEan(r[0]), ref, brand,
      desc: r[3] == null ? ref : String(r[3]).trim(),
      pvpCents: pvp != null && pvp >= 0 ? pvp : null,
      stock: Math.max(0, Math.trunc(Number(r[5]) || 0)),
    };
    if (brand === "ST DUPONT" || brand === "DUPONT") dupont.push(parsed);
    else other.push(parsed);
  }

  // --- Match Dupont rows against the catalogue (EAN then REF) ---
  const variants = await prisma.productVariant.findMany({
    select: { id: true, sku: true, ean: true, priceCents: true, stockLis: true, stockVng: true },
  });
  const bySku = new Map(variants.map((v) => [v.sku, v]));
  const byEan = new Map(variants.filter((v) => v.ean).map((v) => [v.ean as string, v]));

  let stockChanged = 0, pvpChanged = 0, matched = 0, newArticles = 0, unmatchedNoNew = 0;
  const sampleUnmatched: string[] = [];
  const stockUpdates: { id: string; stock: number; total: number }[] = [];
  const pvpUpdates: { id: string; pvpCents: number }[] = [];
  const creates: Parsed[] = [];

  for (const row of dupont) {
    let hit = row.ean ? byEan.get(row.ean) : undefined;
    if (!hit) for (const c of refCandidates(row.ref)) { const v = bySku.get(c); if (v) { hit = v; break; } }
    if (!hit) {
      // A Dupont row with no catalogue match = a NEW article → create it
      // (INDISPONIVEL, needs review — see Opção A).
      newArticles++;
      creates.push(row);
      if (sampleUnmatched.length < 10) sampleUnmatched.push(`NOVO · REF=${row.ref} · ${row.desc}`);
      continue;
    }
    matched++;
    const curStock = (stockCol === "stockLis" ? hit.stockLis : hit.stockVng) ?? 0;
    if (curStock !== row.stock) {
      const otherStore = stockCol === "stockLis" ? (hit.stockVng ?? 0) : (hit.stockLis ?? 0);
      stockUpdates.push({ id: hit.id, stock: row.stock, total: row.stock + otherStore });
      stockChanged++;
    }
    if (row.pvpCents != null && row.pvpCents !== hit.priceCents) {
      pvpUpdates.push({ id: hit.id, pvpCents: row.pvpCents });
      pvpChanged++;
    }
  }

  // --- Other brands (only meaningful for the VNG file) ---
  let obUpserts = 0;
  const obRows = store === "VNG" ? other.filter((o) => o.ref) : [];

  const changes = {
    dupontLinhas: dupont.length,
    correspondidas: matched,
    stockAtualizado: stockChanged,
    pvpAtualizado: pvpChanged,
    novosArtigos: newArticles,
    outrasMarcas: obRows.length,
    emBranco: blank,
  };

  if (!apply) {
    return {
      sheet: DB_SHEET, status: "ok", rows: body.length,
      detail: `pré-visualização (loja ${store}) — nada gravado`,
      changes, sampleUnmatched,
    };
  }

  // ---- APPLY ----
  for (const u of stockUpdates) {
    await prisma.productVariant.update({ where: { id: u.id }, data: { [stockCol]: u.stock, stock: u.total } });
  }
  for (const u of pvpUpdates) {
    await prisma.productVariant.update({ where: { id: u.id }, data: { priceCents: u.pvpCents, pvpStartDate: new Date() } });
  }
  // New Dupont articles → placeholder product + variant, INDISPONIVEL.
  const fallbackCat = await prisma.category.findFirst({ where: { slug: "acessorios" }, select: { id: true } });
  if (fallbackCat) {
    for (const row of creates) {
      const sku = refCandidates(row.ref)[0];
      const slug = `${row.desc.normalize("NFD").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase().slice(0, 56) || "artigo"}-${sku.toLowerCase().slice(-4)}`;
      try {
        await prisma.$transaction(async (tx) => {
          const p = await tx.product.create({
            data: {
              slug, name: { pt: row.desc, en: row.desc }, description: { pt: row.desc, en: row.desc },
              collection: "", categoryId: fallbackCat.id, active: false, featured: false,
            },
            select: { id: true },
          });
          await tx.productVariant.create({
            data: {
              sku, productId: p.id, name: { pt: row.desc, en: row.desc },
              priceCents: row.pvpCents ?? 0, currency: "EUR",
              [stockCol]: row.stock, stock: row.stock,
              ean: row.ean ?? undefined, status: "INDISPONIVEL", active: false,
              pvpStartDate: new Date(), attributes: { source: "sync-eci" },
            },
          });
        });
      } catch { unmatchedNoNew++; }
    }
  }
  // Other brands → upsert by sku.
  for (const o of obRows) {
    try {
      await prisma.otherBrandItem.upsert({
        where: { sku: o.ref },
        create: { brand: o.brand || "—", sku: o.ref, ean: o.ean ?? undefined, descricao: o.desc, pvpCents: o.pvpCents ?? undefined, stock: o.stock },
        update: { brand: o.brand || "—", descricao: o.desc, pvpCents: o.pvpCents ?? undefined, stock: o.stock, ...(o.ean ? { ean: o.ean } : {}) },
      });
      obUpserts++;
    } catch { /* ean/sku clash — skip, reported in count delta */ }
  }

  return {
    sheet: DB_SHEET, status: "ok", rows: body.length,
    detail: `aplicado (loja ${store})`,
    changes: { ...changes, outrasMarcasGravadas: obUpserts },
    sampleUnmatched,
  };
}

// ---------- Reservas ----------
// Cols (row 0 = header, data from row 1): 0=Data_Reserva, 1=Data_Espera,
// 2=Marca, 3=Ref, 4=EAN, 5=Descrição, 6=Qtd, 7=PVP, 8=Cli_Nome, 9=Cli_Tlm,
// 10=Cli_email, 11=Op. Idempotent by (boutique, sku, customerName, reservedAt).
async function syncReservas(matrix: Cell[][], store: EciStore, apply: boolean): Promise<SheetReport> {
  const body = matrix.slice(1);
  const cell = (v: Cell) => (v == null ? "" : String(v).trim());
  const toDate = (v: Cell) => { if (v instanceof Date && !Number.isNaN(v.getTime())) return v; const s = cell(v); const d = s ? new Date(s) : null; return d && !Number.isNaN(d.getTime()) ? d : null; };

  interface R { reservedAt: Date; expectedAt: Date | null; brand: string; ref: string; ean: string | null; desc: string; qty: number; pvpCents: number | null; name: string; phone: string | null; email: string | null; op: string; }
  const parsed: R[] = [];
  for (const r of body) {
    if (!r) continue;
    const name = cell(r[8]);
    const ref = cell(r[3]);
    if (!name && !ref) continue; // blank line
    const pvp = r[7] == null || r[7] === "" ? null : Math.round((Number(r[7]) || 0) * 100);
    parsed.push({
      reservedAt: toDate(r[0]) ?? new Date(),
      expectedAt: toDate(r[1]),
      brand: cell(r[2]), ref, ean: normEan(r[4]), desc: cell(r[5]) || ref,
      qty: Math.max(1, Math.trunc(Number(r[6]) || 1)),
      pvpCents: pvp != null && pvp >= 0 ? pvp : null,
      name, phone: cell(r[9]) || null, email: cell(r[10]) || null, op: cell(r[11]) || "?",
    });
  }

  if (!apply) {
    return { sheet: RESERVAS_SHEET, status: "ok", rows: body.length, detail: "pré-visualização", changes: { reservas: parsed.length } };
  }

  // Match to a catalogue variant (best-effort) for the link.
  const variants = await prisma.productVariant.findMany({ select: { id: true, sku: true, ean: true } });
  const bySku = new Map(variants.map((v) => [v.sku, v.id]));
  const byEan = new Map(variants.filter((v) => v.ean).map((v) => [v.ean as string, v.id]));

  let created = 0, updated = 0;
  for (const r of parsed) {
    let variantId: string | null = (r.ean && byEan.get(r.ean)) || null;
    if (!variantId) for (const c of refCandidates(r.ref)) { const id = bySku.get(c); if (id) { variantId = id; break; } }
    const data = {
      boutique: store, reservedAt: r.reservedAt, expectedAt: r.expectedAt, variantId,
      sku: r.ref, ean: r.ean, descSnapshot: r.desc, brand: r.brand || null, quantity: r.qty, pvpCents: r.pvpCents,
      customerName: r.name, customerPhone: r.phone, customerEmail: r.email, operator: r.op,
    };
    // Natural key so re-running the sync doesn't duplicate — and never touches
    // reservas the app itself created (different reservedAt/name combos).
    const existing = await prisma.reserva.findFirst({
      where: { boutique: store, sku: r.ref, customerName: r.name, reservedAt: r.reservedAt },
      select: { id: true },
    });
    if (existing) { await prisma.reserva.update({ where: { id: existing.id }, data }); updated++; }
    else { await prisma.reserva.create({ data }); created++; }
  }
  return { sheet: RESERVAS_SHEET, status: "ok", rows: body.length, detail: "aplicado", changes: { novas: created, atualizadas: updated } };
}

// ---------- Operadores ----------
// No header — every row is data: 0=Iniciais, 1=código, 2=meta mensal (€).
// Upsert the operator's monthlyGoalCents for THIS store.
async function syncOperadores(matrix: Cell[][], store: EciStore, apply: boolean): Promise<SheetReport> {
  const cell = (v: Cell) => (v == null ? "" : String(v).trim());
  interface O { initials: string; goalCents: number; }
  const parsed: O[] = [];
  for (const r of matrix) {
    if (!r) continue;
    const initials = cell(r[0]).toUpperCase();
    if (!initials || initials.length > 4) continue; // skip stray/blank rows
    const goal = r[2] == null || r[2] === "" ? 0 : Math.max(0, Math.round((Number(r[2]) || 0) * 100));
    parsed.push({ initials, goalCents: goal });
  }
  if (!apply) {
    return { sheet: OPERADORES_SHEET, status: "ok", rows: matrix.length, detail: "pré-visualização", changes: { operadores: parsed.length } };
  }
  let updated = 0, created = 0;
  for (const o of parsed) {
    const res = await prisma.operator.upsert({
      where: { boutique_initials: { boutique: store, initials: o.initials } },
      update: { monthlyGoalCents: o.goalCents },
      create: { boutique: store, initials: o.initials, monthlyGoalCents: o.goalCents, active: true },
    });
    if (res.createdAt.getTime() === res.updatedAt.getTime()) created++; else updated++;
  }
  return { sheet: OPERADORES_SHEET, status: "ok", rows: matrix.length, detail: "aplicado", changes: { metasAtualizadas: updated, novos: created } };
}

// ---------- Stock movements (Danificados + Mov_Int_Ext) ----------
// HISTORY ONLY — writes StockMovement rows for the ledger/visibility; it does
// NOT recompute ProductVariant.stock (the DB sheet carries the authoritative
// Stock Teórico). Idempotent by natural key (boutique, type, day, ean, qty).
//   (Danificados): 0=Data, 1=EAN, 2=Ref, 3=Descrição, 4=Qtd, 5=Op, 6=Obs
//   Mov_Int_Ext:   0=Data, 1=EAN, 2=Mov, 3=Qtd, 4=Ref, 5=Descrição, 6=Op, 7=Obs
async function syncMovements(matrix: Cell[][], store: EciStore, apply: boolean, kind: "DANIFICADO" | "INT_EXT"): Promise<SheetReport> {
  const sheet = kind === "DANIFICADO" ? DANIFICADOS_SHEET : MOV_INT_EXT_SHEET;
  const body = matrix.slice(1);
  const cell = (v: Cell) => (v == null ? "" : String(v).trim());
  const toDate = (v: Cell) => { if (v instanceof Date && !Number.isNaN(v.getTime())) return v; const s = cell(v); const d = s ? new Date(s) : null; return d && !Number.isNaN(d.getTime()) ? d : null; };
  const mapType = (mov: string): "ENTRADA" | "SAIDA" | "STOCK_INICIAL" | "AJUSTE" => {
    const m = mov.toUpperCase();
    if (m.startsWith("ENT")) return "ENTRADA";
    if (m.startsWith("SAI")) return "SAIDA";
    if (m.includes("INICIAL")) return "STOCK_INICIAL";
    return "AJUSTE";
  };

  interface Mv { movedAt: Date; ean: string | null; ref: string; desc: string; qty: number; type: string; note: string | null; op: string | null; }
  const parsed: Mv[] = [];
  for (const r of body) {
    if (!r) continue;
    if (kind === "DANIFICADO") {
      const ref = cell(r[2]); const ean = normEan(r[1]);
      if (!ref && !ean) continue;
      const qty = Math.trunc(Number(r[4]) || 0);
      // Damaged pulls stock OUT.
      parsed.push({ movedAt: toDate(r[0]) ?? new Date(), ean, ref, desc: cell(r[3]) || ref, qty: -Math.abs(qty), type: "DANIFICADO", note: cell(r[6]) || null, op: cell(r[5]) || null });
    } else {
      const ref = cell(r[4]); const ean = normEan(r[1]);
      if (!ref && !ean) continue;
      const mov = cell(r[2]); const t = mapType(mov);
      const magnitude = Math.abs(Math.trunc(Number(r[3]) || 0));
      const signed = t === "SAIDA" ? -magnitude : magnitude; // ENT/inicial/ajuste = +
      parsed.push({ movedAt: toDate(r[0]) ?? new Date(), ean, ref, desc: cell(r[5]) || ref, qty: signed, type: t, note: cell(r[7]) || null, op: cell(r[6]) || null });
    }
  }

  if (!apply) {
    return { sheet, status: "ok", rows: body.length, detail: "pré-visualização (histórico, não mexe no stock)", changes: { movimentos: parsed.length } };
  }

  // Dedup against what's already stored for this store+type.
  const existing = await prisma.stockMovement.findMany({
    where: { boutique: store, type: { in: kind === "DANIFICADO" ? ["DANIFICADO"] : ["ENTRADA", "SAIDA", "STOCK_INICIAL", "AJUSTE"] } },
    select: { movedAt: true, ean: true, sku: true, quantity: true, type: true },
  });
  const dayKey = (d: Date) => d.toISOString().slice(0, 10);
  const seen = new Set(existing.map((m) => `${m.type}|${dayKey(m.movedAt)}|${m.ean ?? m.sku}|${m.quantity}`));

  const variants = await prisma.productVariant.findMany({ select: { id: true, sku: true, ean: true } });
  const bySku = new Map(variants.map((v) => [v.sku, v.id]));
  const byEan = new Map(variants.filter((v) => v.ean).map((v) => [v.ean as string, v.id]));

  let created = 0, skipped = 0;
  for (const mv of parsed) {
    const key = `${mv.type}|${dayKey(mv.movedAt)}|${mv.ean ?? mv.ref}|${mv.qty}`;
    if (seen.has(key)) { skipped++; continue; }
    let variantId: string | null = (mv.ean && byEan.get(mv.ean)) || null;
    if (!variantId) for (const c of refCandidates(mv.ref)) { const id = bySku.get(c); if (id) { variantId = id; break; } }
    await prisma.stockMovement.create({
      data: { boutique: store, variantId, sku: mv.ref, ean: mv.ean, type: mv.type as never, quantity: mv.qty, movedAt: mv.movedAt, note: mv.note },
    });
    seen.add(key);
    created++;
  }
  return { sheet, status: "ok", rows: body.length, detail: "aplicado (histórico)", changes: { novos: created, jaExistentes: skipped } };
}

// ---------- Mov_POS_Loja (historical sales) ----------
// Columns (0-indexed): 0=DATA (excel serial), 1=MÊS, 2=HORA, 3=V/D, 4=Op., 5=EAN,
// 6=QTD, 7=REF, 8=DESCRIÇÃO, 9=PVP, 10=Desc %, 11=Valor Vend, 12=V.Rec.
//
// Idempotency: this backfill tags every row with note = "Histórico ECI", so
// re-running deletes only the previously-imported ECI batch (the same tag) and
// re-inserts fresh — sales the POS terminal registered natively (no such note)
// stay untouched. Deliberately does NOT create StockMovements or touch
// stockLis/stockVng — the DB sheet already carries the *theoretical* stock
// that has these subtracted; recording again would double-count.
async function syncSales(matrix: Cell[][], store: EciStore, apply: boolean): Promise<SheetReport> {
  const body = matrix.slice(1);

  const excelDateToUTC = (serial: number) => new Date(Math.round((serial - 25569) * 86400 * 1000));
  const horaToSeconds = (h: Cell): number => {
    if (typeof h === "number") {
      if (h <= 1) return Math.round(h * 86400); // fraction of a day
      const hr = Math.floor(h);
      const mn = Math.round((h - hr) * 100);
      return hr * 3600 + mn * 60;
    }
    if (typeof h === "string") {
      const f = parseFloat(h.replace(",", "."));
      if (!Number.isNaN(f)) { const hr = Math.floor(f); const mn = Math.round((f - hr) * 100); return hr * 3600 + mn * 60; }
    }
    return 12 * 3600;
  };
  const num = (v: Cell): number | null => {
    if (v == null || v === "") return null;
    const n = typeof v === "number" ? v : parseFloat(String(v).replace(",", "."));
    return Number.isFinite(n) ? n : null;
  };

  interface RawLine {
    soldAt: Date;
    groupKey: string;
    op: string;
    vd: "VENDA" | "DEVOLUCAO";
    ean: string | null;
    ref: string;
    desc: string;
    qty: number;
    pvpCents: number;
    discountPct: number;
    grossCents: number;
    netCents: number;
  }
  const lines: RawLine[] = [];
  let malformed = 0;
  for (const r of body) {
    if (!r) continue;
    const dateSerial = num(r[0]);
    const vd = typeof r[3] === "string" ? r[3].trim().toUpperCase() : "";
    const ref = typeof r[7] === "string" ? r[7].trim() : (r[7] != null ? String(r[7]).trim() : "");
    if (!dateSerial || !ref || (vd !== "V" && vd !== "D")) { malformed++; continue; }

    const base = excelDateToUTC(dateSerial);
    const soldAt = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate()) + horaToSeconds(r[2]) * 1000);
    const q = Math.max(1, Math.round(num(r[6]) ?? 1));
    const gross = Math.abs(num(r[11]) ?? 0);
    const net = Math.abs(num(r[12]) ?? gross / 1.23);
    lines.push({
      soldAt,
      groupKey: `${dateSerial}|${String(r[2] ?? "")}|${String(r[4] ?? "?")}|${vd}`,
      op: String(r[4] ?? "?").trim().toUpperCase(),
      vd: vd === "D" ? "DEVOLUCAO" : "VENDA",
      ean: normEan(r[5]),
      ref,
      desc: typeof r[8] === "string" ? r[8].trim() : (r[8] != null ? String(r[8]).trim() : ref),
      qty: q,
      pvpCents: Math.round((num(r[9]) ?? 0) * 100),
      discountPct: (() => { const d = num(r[10]) ?? 0; return d >= 0 && d < 1 ? d : 0; })(),
      grossCents: Math.round(gross * 100),
      netCents: Math.round(net * 100),
    });
  }

  const groups = new Map<string, RawLine[]>();
  for (const l of lines) {
    if (!groups.has(l.groupKey)) groups.set(l.groupKey, []);
    groups.get(l.groupKey)!.push(l);
  }
  const totalV = lines.filter((l) => l.vd === "VENDA").length;
  const totalD = lines.filter((l) => l.vd === "DEVOLUCAO").length;

  if (!apply) {
    return {
      sheet: MOV_POS_LOJA_SHEET, status: "ok", rows: body.length,
      detail: "pré-visualização (histórico — não mexe em stock)",
      changes: { linhas: lines.length, vendas: totalV, devolucoes: totalD, baskets: groups.size, malFormadas: malformed },
    };
  }

  // Ensure every operator exists (create inactive if not — the sheet is the
  // authoritative list of who ever sold anything in the boutique).
  const ops = [...new Set(lines.map((l) => l.op))].filter(Boolean);
  for (const initials of ops) {
    await prisma.operator.upsert({
      where: { boutique_initials: { boutique: store, initials } },
      update: {},
      create: { boutique: store, initials, active: true },
    });
  }
  const opRows = await prisma.operator.findMany({ where: { boutique: store, initials: { in: ops } }, select: { id: true, initials: true } });
  const opId = new Map(opRows.map((o) => [o.initials, o.id]));

  // Variant lookup for line-level linking.
  const variants = await prisma.productVariant.findMany({ select: { id: true, sku: true, ean: true } });
  const bySku = new Map(variants.map((v) => [v.sku.toUpperCase(), v.id]));
  const byEan = new Map(variants.filter((v) => v.ean).map((v) => [v.ean as string, v.id]));
  const matchVariant = (l: RawLine): string | null => {
    for (const c of refCandidates(l.ref)) { const id = bySku.get(c.toUpperCase()); if (id) return id; }
    if (l.ean && byEan.has(l.ean)) return byEan.get(l.ean)!;
    return null;
  };

  // Wipe the previous ECI backfill FOR THIS BOUTIQUE only. POS-terminal sales
  // don't carry the tag so they're safe. Scoping by boutique avoids nuking the
  // other store's history when only one file is re-synced.
  const prior = await prisma.sale.findMany({
    where: { note: ECI_SALE_NOTE, boutique: store },
    select: { id: true },
  });
  if (prior.length) {
    await prisma.saleItem.deleteMany({ where: { saleId: { in: prior.map((p) => p.id) } } });
    await prisma.sale.deleteMany({ where: { id: { in: prior.map((p) => p.id) } } });
  }

  let created = 0, items = 0, missingOp = 0;
  for (const [, groupLines] of groups) {
    const first = groupLines[0];
    const operatorId = opId.get(first.op);
    if (!operatorId) { missingOp++; continue; }
    const grossCents = groupLines.reduce((s, l) => s + l.grossCents, 0);
    const netCents = groupLines.reduce((s, l) => s + l.netCents, 0);
    const eci = Math.round(netCents * (store === "LIS" ? 0.22 : 0.19));
    await prisma.sale.create({
      data: {
        boutique: store, operatorId, type: first.vd, soldAt: first.soldAt,
        grossCents, netCents, eciCommissionCents: eci, note: ECI_SALE_NOTE,
        items: {
          create: groupLines.map((l) => ({
            source: "DUPONT" as const,
            variantId: matchVariant(l),
            sku: l.ref, ean: l.ean, descSnapshot: l.desc, brand: "S.T. Dupont",
            quantity: l.qty, unitPriceCents: l.pvpCents,
            discountPct: l.discountPct, grossCents: l.grossCents, netCents: l.netCents,
          })),
        },
      },
    });
    created++;
    items += groupLines.length;
  }

  return {
    sheet: MOV_POS_LOJA_SHEET, status: "ok", rows: body.length,
    detail: `aplicado (histórico · ${prior.length ? `substituiu ${prior.length} vendas ECI anteriores` : "primeira importação"})`,
    changes: { baskets: created, linhas: items, vendas: totalV, devolucoes: totalD, semOperador: missingOp, malFormadas: malformed },
  };
}

// ---------- Repair-shaped sheets (Reparações + Assuntos Vários + Assuntos Terminados) ----------
// All three share the same column layout — same parser, different bucket tag.
// Cols: 0 1ª_Visita, 1 Staff, 2 Estado [Ir atualizando], 3 Cli_Nome, 4 Ref,
// 5 Assunto, 6 Atualizações, 7 Último_Contato_Data_&_Staff, 8 Último_Contato,
// 9 Último_Contato_Obs, 10 Outras_Obs, 11 Tlm_WhatsApp, 12 Outros_Contatos.
//
// Idempotency: (boutique, bucket, customerName, reference, firstVisitAt).
// Re-runs update the mutable fields (status, updates, last-contact, phones)
// without touching bucket or the natural key. Missing dates preserved as "??".
async function syncRepairSheet(
  matrix: Cell[][], store: EciStore, apply: boolean,
  bucket: "REPARACAO" | "ASSUNTO_VARIOS" | "ASSUNTO_TERMINADO",
  sheetName: string,
): Promise<SheetReport> {
  const body = matrix.slice(1);
  const cell = (v: Cell) => (v == null ? "" : String(v).trim());
  const str = (v: Cell): string | null => { const t = cell(v); return t ? t : null; };
  const parseDate = (v: Cell): Date | null => {
    if (v instanceof Date && !Number.isNaN(v.getTime())) {
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
  };
  const mapStatus = (raw: Cell): "AGUARDANDO_CLIENTE" | "AGUARDANDO_STD" | "AGUARDANDO_JM" | "AGUARDANDO_PR" | "ART_EM_REPARACAO" | "RESOLVIDO" | "POR_DAR_RESPOSTA" | "POR_VERIFICAR" => {
    const s = cell(raw).toLowerCase();
    if (s.includes("resolv")) return "RESOLVIDO";
    if (s.includes("std")) return "AGUARDANDO_STD";
    if (s.includes("jm")) return "AGUARDANDO_JM";
    if (s.includes("aguardando pr")) return "AGUARDANDO_PR";
    if (s.includes("cliente")) return "AGUARDANDO_CLIENTE";
    if (s.includes("repara")) return "ART_EM_REPARACAO";
    if (s.includes("resposta")) return "POR_DAR_RESPOSTA";
    if (s.includes("verific")) return "POR_VERIFICAR";
    return "POR_VERIFICAR";
  };

  interface Rec {
    firstVisitAt: Date | null;
    rawFirstVisit: string | null;
    staff: string;
    status: ReturnType<typeof mapStatus>;
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
  }
  const recs: Rec[] = [];
  let skippedBlank = 0;
  for (const r of body) {
    if (!r) { skippedBlank++; continue; }
    const customer = str(r[3]);
    const reference = str(r[4]);
    const subject = str(r[5]);
    // Structural row (footer legends, empty spacers) — need at least a customer
    // AND a (ref or subject) to be a real ticket.
    if (!customer || (!reference && !subject)) { skippedBlank++; continue; }

    const fv = parseDate(r[0]);
    const rawFv = fv ? null : str(r[0]);
    const lcRaw = r[7];
    const lastContactAt = parseDate(lcRaw);
    const lcStaffMatch = typeof lcRaw === "string" ? lcRaw.match(/\(([A-Za-z]{1,3})\)/) : null;

    recs.push({
      firstVisitAt: fv, rawFirstVisit: rawFv,
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
    });
  }

  if (!apply) {
    return {
      sheet: sheetName, status: "ok", rows: body.length,
      detail: `pré-visualização (bucket ${bucket.toLowerCase()})`,
      changes: { total: recs.length, semData: recs.filter((x) => !x.firstVisitAt).length, ignoradas: skippedBlank },
    };
  }

  let created = 0, updated = 0;
  for (const rec of recs) {
    // Preserve any unparseable "1ª Visita" note in updates so nothing is lost.
    const updates = rec.rawFirstVisit
      ? `[1ª Visita: ${rec.rawFirstVisit}] ${rec.updates ?? ""}`.trim()
      : rec.updates;
    const data = {
      boutique: store, bucket, firstVisitAt: rec.firstVisitAt, staff: rec.staff,
      status: rec.status, customerName: rec.customerName, reference: rec.reference,
      subject: rec.subject, updates, lastContactAt: rec.lastContactAt,
      lastContactStaff: rec.lastContactStaff, lastContactVia: rec.lastContactVia,
      lastContactNote: rec.lastContactNote, otherObs: rec.otherObs,
      phone: rec.phone, otherContacts: rec.otherContacts,
    };
    // Natural key: boutique + bucket + customer + ref + firstVisit. Same combo
    // uniquely identifies a ticket across re-runs; different bucket = different
    // row (a customer may appear in both Reparações and Assuntos Vários).
    const existing = await prisma.repair.findFirst({
      where: {
        boutique: store, bucket, customerName: rec.customerName,
        reference: rec.reference, firstVisitAt: rec.firstVisitAt,
      },
      select: { id: true },
    });
    if (existing) { await prisma.repair.update({ where: { id: existing.id }, data }); updated++; }
    else { await prisma.repair.create({ data }); created++; }
  }
  return {
    sheet: sheetName, status: "ok", rows: body.length,
    detail: `aplicado (bucket ${bucket.toLowerCase()})`,
    changes: { total: recs.length, novos: created, atualizados: updated, ignoradas: skippedBlank },
  };
}
