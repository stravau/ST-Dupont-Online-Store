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
const OTHER_SHEETS = ["Mov_POS_Loja", "Mov_Int_Ext", "P.Reparar", "Reservas", "Danificados", "Operadores"];

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

  // ---------- DB sheet: stock + PVP + new articles + other brands ----------
  const dbMatrix = sheets[DB_SHEET];
  if (!dbMatrix) {
    reports.push({ sheet: DB_SHEET, status: "missing", detail: "folha 'DB' não encontrada" });
  } else {
    reports.push(await syncDbSheet(dbMatrix, store, apply, batchId));
  }

  // ---------- Remaining sheets: reported, not yet written ----------
  for (const name of OTHER_SHEETS) {
    const m = sheets[name];
    reports.push({
      sheet: name,
      status: m ? "pending" : "missing",
      rows: m ? Math.max(0, m.length - 2) : 0,
      detail: m ? "parser por ligar (precisa do ficheiro real para fixar colunas)" : "folha ausente",
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
async function syncDbSheet(matrix: Cell[][], store: EciStore, apply: boolean, batchId: string): Promise<SheetReport> {
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
    changes: { ...changes, outrasMarcasGravadas: obUpserts, batch: batchId ? 1 : 0 },
    sampleUnmatched,
  };
}
