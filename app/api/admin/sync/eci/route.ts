import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { assertRateLimit, assertSameOrigin, safeError } from "@/lib/admin-api";
import { readWorkbookMatrix, detectEciStore, type Cell, type EciStore } from "@/lib/admin-upload";

export const dynamic = "force-dynamic";
export const maxDuration = 120; // whole-workbook ingest — give it headroom.

// Unified ECI Controlo sync (Fase 1 of the Excel→app transition). One upload
// absorbs the workbook; the boss sees a per-sheet report. DEFAULTS TO DRY-RUN —
// nothing is written until the request sends { apply: true }, so the report can
// be reviewed against the real file first. ADMIN only; same-origin + rate-limit.
//
// Scope today: the DB sheet (stock + PVP + new articles + other brands) — the
// stock/PVP/novos the plan says the ECI covers. The remaining sheets
// (Mov_POS_Loja, Mov_Int_Ext, P.Reparar, Reservas, Danificados, Operadores) are
// reported as pending — they need the real file to lock their column layout
// before writing. See docs/excel-to-app-transition.md.

const DB_SHEET = "DB";
// Real sheet names, confirmed against ECI_LIS_Controlo. Note the accents and
// the parentheses — the file uses "Reparações" and "(Danificados)".
const RESERVAS_SHEET = "Reservas";
const OPERADORES_SHEET = "Operadores";
const DANIFICADOS_SHEET = "(Danificados)";
const MOV_INT_EXT_SHEET = "Mov_Int_Ext";
// Reported-only for now (not selected to wire): sales + the three repair buckets.
const PENDING_SHEETS = ["Mov_POS_Loja", "Reparações", "Assuntos Vários", "Assuntos Terminados"];

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
  const gate = await requireAdmin();
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
  await runSheet(RESERVAS_SHEET, (m) => syncReservas(m, store, apply));      // reservas de clientes
  await runSheet(OPERADORES_SHEET, (m) => syncOperadores(m, store, apply));  // metas mensais
  await runSheet(DANIFICADOS_SHEET, (m) => syncMovements(m, store, apply, "DANIFICADO")); // danificados
  await runSheet(MOV_INT_EXT_SHEET, (m) => syncMovements(m, store, apply, "INT_EXT"));    // ent/sai/transf

  // ---------- Reported-only (not wired yet) ----------
  for (const name of PENDING_SHEETS) {
    const m = sheets[name];
    reports.push({
      sheet: name,
      status: m ? "pending" : "missing",
      rows: m ? Math.max(0, m.length - 1) : 0,
      detail: m ? "por ligar (vendas / reparações — próximo passo)" : "folha ausente",
    });
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
