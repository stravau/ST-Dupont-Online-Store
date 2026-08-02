import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma/client";
import { requireStaff } from "@/lib/admin-auth";
import { assertRateLimit, assertSameOrigin, safeError } from "@/lib/admin-api";
import { readWorkbookMatrix, detectEciStore, type Cell, type EciStore } from "@/lib/admin-upload";

export const dynamic = "force-dynamic";
export const maxDuration = 120; // fica como está — o objectivo desta ronda é
                                // ficar bem debaixo do tecto, não aumentá-lo.

// Concurrency cap for parallel Prisma writes against Neon. High enough to
// hide the per-query latency (10-50ms) but low enough to stay well under
// Neon's pooler connection limit. Empirically ~20 gives a big speed-up
// without saturating the pool.
const POOL = 20;

// Run `worker` over `items` with a cap of `concurrency` promises in flight.
// Preserves per-item errors (they bubble up so the top-level try/catch can
// surface them). Order of results is NOT guaranteed to match `items`.
async function runPool<T, R>(items: T[], worker: (item: T) => Promise<R>, concurrency = POOL): Promise<R[]> {
  const results: R[] = [];
  if (items.length === 0) return results;
  let cursor = 0;
  const workers: Promise<void>[] = [];
  const kick = async () => {
    while (cursor < items.length) {
      const i = cursor++;
      results[i] = await worker(items[i]);
    }
  };
  for (let k = 0; k < Math.min(concurrency, items.length); k++) workers.push(kick());
  await Promise.all(workers);
  return results;
}

// Postgres caps a statement at 65535 bind parameters. Every bulk helper below
// slices its input so the widest row shape still fits comfortably.
const INSERT_CHUNK = 1000;

// Run a createMany in slices. N round-trips become ceil(N/1000) — on the VNG
// file that's the difference between ~2500 inserts and 3.
async function insertChunked<T>(rows: T[], insert: (slice: T[]) => Promise<unknown>) {
  for (let i = 0; i < rows.length; i += INSERT_CHUNK) {
    await insert(rows.slice(i, i + INSERT_CHUNK));
  }
}

// Bulk UPDATE via a single statement carrying a VALUES list, instead of one
// round-trip per row. This is what kept the VNG sync (≈6.5k DB rows, ≈4.9k
// other-brand rows) over the Vercel time budget: thousands of sequential
// `update()` calls at ~30ms each dominated the wall clock.
//
// Every value is explicitly cast — without the casts Postgres infers the
// VALUES column types from the first row, which breaks as soon as a nullable
// column starts with NULL. `updatedAt` is set by hand because raw SQL bypasses
// Prisma's @updatedAt.
async function bulkUpdateStock(
  stockCol: "stockLis" | "stockVng",
  rows: { id: string; stock: number; total: number }[],
) {
  const col = Prisma.raw(`"${stockCol}"`); // union-typed literal, never user input
  for (let i = 0; i < rows.length; i += INSERT_CHUNK) {
    const slice = rows.slice(i, i + INSERT_CHUNK);
    const values = Prisma.join(
      slice.map((r) => Prisma.sql`(${r.id}::text, ${r.stock}::int, ${r.total}::int)`),
    );
    await prisma.$executeRaw`
      UPDATE "ProductVariant" AS pv
         SET ${col} = v.stock, "stock" = v.total, "updatedAt" = NOW()
        FROM (VALUES ${values}) AS v(id, stock, total)
       WHERE pv."id" = v.id
    `;
  }
}

async function bulkUpdatePvp(rows: { id: string; pvpCents: number }[], startedAt: Date) {
  for (let i = 0; i < rows.length; i += INSERT_CHUNK) {
    const slice = rows.slice(i, i + INSERT_CHUNK);
    const values = Prisma.join(
      slice.map((r) => Prisma.sql`(${r.id}::text, ${r.pvpCents}::int)`),
    );
    await prisma.$executeRaw`
      UPDATE "ProductVariant" AS pv
         SET "priceCents" = v.price, "pvpStartDate" = ${startedAt}::timestamptz, "updatedAt" = NOW()
        FROM (VALUES ${values}) AS v(id, price)
       WHERE pv."id" = v.id
    `;
  }
}

type ObUpdateRow = {
  id: string; sku: string; brand: string; descricao: string;
  pvpCents: number | null; stock: number; ean: string | null;
};

// COALESCE on ean keeps the existing barcode when the file omits one — matches
// the row-by-row path this replaced.
function obUpdateSql(slice: ObUpdateRow[]) {
  const values = Prisma.join(
    slice.map((r) => Prisma.sql`(${r.id}::text, ${r.brand}::text, ${r.descricao}::text, ${r.pvpCents}::int, ${r.stock}::int, ${r.ean}::text)`),
  );
  return prisma.$executeRaw`
    UPDATE "OtherBrandItem" AS o
       SET "brand" = v.brand, "descricao" = v.descricao, "pvpCents" = v.pvp,
           "stock" = v.stock, "ean" = COALESCE(v.ean, o."ean"), "updatedAt" = NOW()
      FROM (VALUES ${values}) AS v(id, brand, descricao, pvp, stock, ean)
     WHERE o."id" = v.id
  `;
}

// Um lote inteiro morre se UMA linha violar o unique do EAN, e isso levava
// a folha DB toda com ele. O caller já liberta os EANs em conflito antes de
// chegar aqui; esta é a rede por baixo — o lote que falhar é reprocessado
// linha-a-linha, aplicando tudo o que dá e reportando só o que ficou de fora.
async function bulkUpdateOtherBrand(rows: ObUpdateRow[]): Promise<{ applied: number; failed: string[] }> {
  let applied = 0;
  const failed: string[] = [];
  for (let i = 0; i < rows.length; i += INSERT_CHUNK) {
    const slice = rows.slice(i, i + INSERT_CHUNK);
    try {
      await obUpdateSql(slice);
      applied += slice.length;
    } catch {
      for (const row of slice) {
        try { await obUpdateSql([row]); applied++; }
        catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          const reason = msg.includes("OtherBrandItem_ean_key") ? `EAN ${row.ean} duplicado` : msg.slice(0, 60);
          failed.push(`${row.sku} · ${reason}`);
        }
      }
    }
  }
  return { applied, failed };
}

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

// Marker on ECI-imported sales — kept for auditability (so the boss can tell
// which sales were re-imported from the file vs any others that may exist
// later). Not used for scoping deletes any more (the sync is now fully
// authoritative — Excel is the ONLY source, all boutique sales are wiped
// before re-import).
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
  status: "ok" | "pending" | "missing" | "failed";
  rows?: number;
  detail?: string;
  changes?: Record<string, number>;
  sampleUnmatched?: string[];
  errorMessage?: string; // populado quando status = "failed"
  ms?: number;           // tempo de processamento — para diagnosticar timeouts
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

  // Top-level try/catch para que qualquer erro devolva JSON estruturado.
  // Sem isto, um throw dentro das queries paralelas gera 500 HTML do Vercel
  // e o cliente vê "resposta inválida" sem pista.
  try {
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

    // Isola cada sheet — se uma falhar, marca-a como "failed" com a
    // mensagem, e as outras continuam. Assim vemos EXACTAMENTE qual
    // folha crashou em vez de todo o sync explodir em silêncio.
    async function runSheet(name: string, fn: (m: Cell[][]) => Promise<SheetReport>) {
      const m = sheets[name];
      if (!m) {
        reports.push({ sheet: name, status: "missing", detail: "folha ausente" });
        return;
      }
      const t0 = Date.now();
      try {
        reports.push({ ...(await fn(m)), ms: Date.now() - t0 });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        reports.push({
          sheet: name,
          status: "failed",
          detail: "erro durante processamento — outras folhas continuaram",
          errorMessage: msg.slice(0, 300),
          ms: Date.now() - t0,
        });
      }
    }

    // ---------- Wired sheets ----------
    // Order matters ONLY for the pair below; everything else touches disjoint
    // tables and runs in parallel to cut wall clock roughly in half on smaller
    // files (LIS) where no single sheet dominates the total.
    //
    //   1. DB          — may CREATE new ProductVariant rows (novos artigos).
    //                    Sales/Movements/Reservas do a variantId lookup, so we
    //                    run DB first to avoid variantId=null on brand-new SKUs
    //                    that only appear in this file.
    //   2. Operadores  — before Sales, so the operator upsert races don't
    //                    happen (Sales also touches Operator to ensure the
    //                    initials it sees exist).
    //   3. Everything else in parallel: sales, both movement variants,
    //      reservas, and each of the three repair-bucket sheets. Each writes
    //      to its own table (Sale/SaleItem, StockMovement, Reserva, Repair)
    //      and only reads from ProductVariant/Operator — safe to overlap.
    await runSheet(DB_SHEET, (m) => syncDbSheet(m, store, apply));
    await runSheet(OPERADORES_SHEET, (m) => syncOperadores(m, store, apply));

    await Promise.all([
      runSheet(MOV_POS_LOJA_SHEET, (m) => syncSales(m, store, apply)),
      runSheet(MOV_INT_EXT_SHEET,  (m) => syncMovements(m, store, apply, "INT_EXT")),
      runSheet(DANIFICADOS_SHEET,  (m) => syncMovements(m, store, apply, "DANIFICADO")),
      runSheet(RESERVAS_SHEET,     (m) => syncReservas(m, store, apply)),
      ...REPAIR_SHEETS.map((rep) =>
        runSheet(rep.name, (m) => syncRepairSheet(m, store, apply, rep.bucket, rep.name)),
      ),
    ]);

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

    // Uma folha ter falhado NÃO faz o request falhar (as outras foram
    // aplicadas correctamente). O cliente vê o "failed" no relatório.
    const failedCount = reports.filter((r) => r.status === "failed").length;
    return NextResponse.json({
      ok: true,
      store,
      applied: apply,
      file: file.name,
      batchId,
      reports,
      ...(failedCount > 0 ? { warning: `${failedCount} folha(s) falharam — ver detalhes por linha` } : {}),
    });
  } catch (e) {
    // Última rede — qualquer coisa que escape aos catches internos.
    // Loga no console do Vercel para conseguirmos ver na dashboard.
    console.error("[sync/eci] fatal:", e);
    const msg = e instanceof Error ? e.message : String(e);
    const stack = e instanceof Error && e.stack ? e.stack.split("\n").slice(0, 4).join(" · ") : "";
    return NextResponse.json({
      ok: false,
      error: `Erro no servidor: ${msg.slice(0, 300)}`,
      trace: stack.slice(0, 500),
    }, { status: 500 });
  }
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
  const matchedVariantIds = new Set<string>();

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
    matchedVariantIds.add(hit.id);
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

  // --- Modo autoritativo: variants não presentes no ficheiro ficam com
  // stock ZERO nesta loja. A variant em si NÃO se apaga (é do catálogo
  // do site, partilhado); só a coluna cache desta loja é resetada, e o
  // total agregado é recalculado usando o stock actual da outra loja.
  const stockZeroUpdates: { id: string; total: number }[] = [];
  for (const v of variants) {
    if (matchedVariantIds.has(v.id)) continue;
    const cur = stockCol === "stockLis" ? (v.stockLis ?? 0) : (v.stockVng ?? 0);
    if (cur === 0) continue;
    const otherStore = stockCol === "stockLis" ? (v.stockVng ?? 0) : (v.stockLis ?? 0);
    stockZeroUpdates.push({ id: v.id, total: 0 + otherStore });
  }

  // --- Other brands (only meaningful for the VNG file) ---
  let obUpserts = 0;
  const obRows = store === "VNG" ? other.filter((o) => o.ref) : [];
  const obSkusInFile = new Set(obRows.map((o) => o.ref));
  // Modo autoritativo: contar quantas OtherBrandItem existentes vão ser
  // apagadas (só relevante quando o ficheiro é o VNG — o LIS não mexe
  // no master de outras marcas). A execução real do delete acontece
  // apenas no bloco APPLY abaixo.
  const obDeleteCount = store === "VNG"
    ? await prisma.otherBrandItem.count({ where: { sku: { notIn: [...obSkusInFile] } } })
    : 0;

  const changes = {
    dupontLinhas: dupont.length,
    correspondidas: matched,
    stockAtualizado: stockChanged,
    stockZerado: stockZeroUpdates.length,
    pvpAtualizado: pvpChanged,
    novosArtigos: newArticles,
    outrasMarcas: obRows.length,
    outrasMarcasApagar: obDeleteCount,
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
  // Stock + PVP updates on Dupont variants run in parallel (each is a
  // small independent write, no cross-dependency).
  const now = new Date();
  await bulkUpdateStock(stockCol, stockUpdates);
  // Autoritativo: variants que não aparecem no ficheiro têm o stock
  // desta loja zerado. Preserva o stock da outra loja (a outra file
  // trata dela) e recalcula o total.
  await bulkUpdateStock(stockCol, stockZeroUpdates.map((u) => ({ id: u.id, stock: 0, total: u.total })));
  await bulkUpdatePvp(pvpUpdates, now);
  // New Dupont articles → placeholder product + variant, INDISPONIVEL. Each is
  // a small transaction (product + variant) — pool them at half concurrency
  // since two writes per item multiplies pool pressure.
  const fallbackCat = creates.length
    ? await prisma.category.findFirst({ where: { slug: "acessorios" }, select: { id: true } })
    : null;
  if (fallbackCat && creates.length) {
    const cat = fallbackCat;
    // Este bloco era uma $transaction por artigo (2 writes cada) — na
    // primeira sincronia de um ficheiro grande são centenas de round-trips.
    // Passa a dois createMany por lote, o que obriga a resolver TODAS as
    // colisões de unique (sku, slug, ean) antes de escrever: sem o
    // isolamento por linha, uma colisão rebentaria o lote inteiro.
    const prepared: { productId: string; sku: string; slug: string; ean: string | null; row: Parsed }[] = [];
    const usedSku = new Set<string>();
    const usedSlug = new Set<string>();
    const usedEan = new Set<string>();
    for (const row of creates) {
      const sku = refCandidates(row.ref)[0];
      if (!sku || usedSku.has(sku)) { unmatchedNoNew++; continue; }
      usedSku.add(sku);
      const base =
        row.desc.normalize("NFD").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase().slice(0, 56) ||
        "artigo";
      const tail = sku.toLowerCase().slice(-4);
      let slug = `${base}-${tail}`;
      for (let n = 2; usedSlug.has(slug); n++) slug = `${base}-${tail}-${n}`;
      usedSlug.add(slug);
      // Dois artigos novos com o mesmo EAN no mesmo ficheiro: o primeiro
      // fica com ele, os seguintes entram sem EAN (a coluna é unique).
      let ean = row.ean;
      if (ean) {
        if (usedEan.has(ean)) ean = null;
        else usedEan.add(ean);
      }
      prepared.push({ productId: randomUUID(), sku, slug, ean, row });
    }

    // O que já existe na DB salta — em vez de rebentar a inserção em lote.
    const [slugTaken, skuTaken, eanTaken] = await Promise.all([
      prisma.product.findMany({ where: { slug: { in: prepared.map((p) => p.slug) } }, select: { slug: true } }),
      prisma.productVariant.findMany({ where: { sku: { in: prepared.map((p) => p.sku) } }, select: { sku: true } }),
      prisma.productVariant.findMany({
        where: { ean: { in: prepared.map((p) => p.ean).filter((e): e is string => e !== null) } },
        select: { ean: true },
      }),
    ]);
    const takenSlug = new Set(slugTaken.map((s) => s.slug));
    const takenSku = new Set(skuTaken.map((s) => s.sku));
    const takenEan = new Set(eanTaken.map((s) => s.ean));

    const writable = prepared.filter((p) => {
      if (takenSlug.has(p.slug) || takenSku.has(p.sku)) { unmatchedNoNew++; return false; }
      if (p.ean && takenEan.has(p.ean)) p.ean = null; // fica sem EAN, mas entra
      return true;
    });

    // Product + Variant do mesmo lote numa transacção — se a segunda
    // inserção falhar, não ficam Products órfãos sem variant.
    for (let i = 0; i < writable.length; i += INSERT_CHUNK) {
      const slice = writable.slice(i, i + INSERT_CHUNK);
      try {
        await prisma.$transaction([
          prisma.product.createMany({
            data: slice.map((p) => ({
              id: p.productId, slug: p.slug,
              name: { pt: p.row.desc, en: p.row.desc },
              description: { pt: p.row.desc, en: p.row.desc },
              collection: "", categoryId: cat.id, active: false, featured: false,
            })),
          }),
          prisma.productVariant.createMany({
            data: slice.map((p) => ({
              sku: p.sku, productId: p.productId,
              name: { pt: p.row.desc, en: p.row.desc },
              priceCents: p.row.pvpCents ?? 0, currency: "EUR",
              ...(stockCol === "stockLis" ? { stockLis: p.row.stock } : { stockVng: p.row.stock }),
              stock: p.row.stock,
              ean: p.ean ?? undefined,
              status: "INDISPONIVEL" as const, active: false,
              pvpStartDate: now, attributes: { source: "sync-eci" },
            })),
          }),
        ]);
      } catch {
        unmatchedNoNew += slice.length;
      }
    }
  }
  // Autoritativo — apagar OtherBrandItem que já não estão no ficheiro VNG.
  // Só faz sentido no ficheiro VNG (o LIS não trata desta tabela); no LIS
  // este bloco fica silenciosamente inactivo.
  //
  // Corre ANTES das escritas de propósito: uma linha que sai do ficheiro pode
  // estar a segurar um EAN que o ficheiro passa agora a outra REF. O índice
  // "OtherBrandItem_ean_key" é verificado linha-a-linha (não é DEFERRABLE),
  // portanto atribuí-lo antes de libertar dava 23505.
  let obDeleted = 0;
  if (store === "VNG") {
    const skusInFileArr = [...obSkusInFile];
    const res = skusInFileArr.length > 0
      ? await prisma.otherBrandItem.deleteMany({ where: { sku: { notIn: skusInFileArr } } })
      : await prisma.otherBrandItem.deleteMany({});
    obDeleted = res.count;
  }

  // Other brands — the hot path (VNG has ~4900 rows). Instead of an upsert per
  // row (thousands of round-trips), bulk-fetch what's already there, split
  // into create/update/noop, then createMany + pooled updates. Order of
  // magnitude faster on a full VNG file.
  let obEansFreed = 0;
  let obFailed: string[] = [];
  if (obRows.length) {
    // --- Resolver conflitos de EAN antes de escrever ---
    // 1) Dentro do próprio ficheiro: se duas REFs trazem o mesmo EAN, a
    //    primeira fica com ele e as outras entram sem EAN. Sem isto o
    //    createMany/UPDATE colidia consigo mesmo.
    const eanOwnerInFile = new Map<string, string>();
    for (const o of obRows) {
      if (!o.ean) continue;
      if (eanOwnerInFile.has(o.ean)) o.ean = null;
      else eanOwnerInFile.set(o.ean, o.ref);
    }
    // 2) Contra a base: um EAN que o ficheiro dá à REF A mas que está preso
    //    na REF B (que sobreviveu ao delete acima) é libertado primeiro.
    //    É o caso de um EAN corrigido/trocado entre artigos de uma versão
    //    do ficheiro para a seguinte.
    const desiredEans = [...eanOwnerInFile.keys()];
    if (desiredEans.length) {
      const holders = await prisma.otherBrandItem.findMany({
        where: { ean: { in: desiredEans } },
        select: { id: true, sku: true, ean: true },
      });
      const toFree = holders
        .filter((h) => h.ean && eanOwnerInFile.get(h.ean) !== h.sku)
        .map((h) => h.id);
      for (let i = 0; i < toFree.length; i += INSERT_CHUNK) {
        const res = await prisma.otherBrandItem.updateMany({
          where: { id: { in: toFree.slice(i, i + INSERT_CHUNK) } },
          data: { ean: null },
        });
        obEansFreed += res.count;
      }
    }

    const existing = await prisma.otherBrandItem.findMany({
      where: { sku: { in: obRows.map((r) => r.ref) } },
      select: { id: true, sku: true, brand: true, ean: true, descricao: true, pvpCents: true, stock: true },
    });
    const existingBySku = new Map(existing.map((e) => [e.sku, e]));

    const toCreate: typeof obRows = [];
    const toUpdate: ObUpdateRow[] = [];
    for (const o of obRows) {
      const cur = existingBySku.get(o.ref);
      if (!cur) { toCreate.push(o); continue; }
      const brand = o.brand || cur.brand || "—";
      const desc = o.desc || cur.descricao;
      const pvp = o.pvpCents;
      const stock = o.stock;
      const ean = o.ean ?? cur.ean;
      const changed =
        brand !== cur.brand || desc !== cur.descricao ||
        pvp !== cur.pvpCents || stock !== cur.stock ||
        (o.ean && o.ean !== cur.ean);
      if (changed) toUpdate.push({ id: cur.id, sku: o.ref, brand, descricao: desc, pvpCents: pvp, stock, ean });
    }

    // Bulk-insert new — one INSERT instead of N. skipDuplicates guards
    // against a race where a concurrent sync inserted the same sku.
    if (toCreate.length) {
      await insertChunked(toCreate, async (slice) => {
        const res = await prisma.otherBrandItem.createMany({
          data: slice.map((o) => ({
            brand: o.brand || "—", sku: o.ref,
            ean: o.ean ?? undefined, descricao: o.desc,
            pvpCents: o.pvpCents ?? undefined, stock: o.stock,
          })),
          skipDuplicates: true,
        });
        obUpserts += res.count;
      });
    }
    // Um único UPDATE por lote de 1000 em vez de um round-trip por linha —
    // é aqui que estava o grosso do tempo no ficheiro VNG.
    const obRes = await bulkUpdateOtherBrand(toUpdate);
    obUpserts += obRes.applied;
    obFailed = obRes.failed;
    for (const f of obFailed.slice(0, 10)) {
      if (sampleUnmatched.length < 20) sampleUnmatched.push(`OUTRAS MARCAS · ${f}`);
    }
  }

  return {
    sheet: DB_SHEET, status: "ok", rows: body.length,
    detail: `aplicado (loja ${store})`,
    changes: {
      ...changes,
      outrasMarcasGravadas: obUpserts,
      outrasMarcasApagadas: obDeleted,
      outrasMarcasEanLibertado: obEansFreed,
      outrasMarcasFalhadas: obFailed.length,
    },
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
  const toDate = (v: Cell) => {
    if (v instanceof Date && !Number.isNaN(v.getTime())) return v;
    // Excel day serial (comes through as a plain number with raw:true).
    if (typeof v === "number" && Number.isFinite(v) && v > 20000 && v < 80000) {
      const d = new Date(Math.round((v - 25569) * 86400 * 1000));
      return Number.isNaN(d.getTime()) ? null : d;
    }
    const s = cell(v);
    const d = s ? new Date(s) : null;
    return d && !Number.isNaN(d.getTime()) ? d : null;
  };

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

  // Preview count of what would be deleted — useful even in dry-run so
  // the boss sees the destructive part before applying.
  const keyOf = (b: string, sku: string, name: string, at: Date) => `${b}|${sku}|${name}|${at.toISOString()}`;
  const fileKeys = new Set(parsed.map((r) => keyOf(store, r.ref, r.name, r.reservedAt)));
  const allBoutiqueRows = await prisma.reserva.findMany({
    where: { boutique: store },
    select: { id: true, sku: true, customerName: true, reservedAt: true },
  });
  const toDelete = allBoutiqueRows.filter((e) => !fileKeys.has(keyOf(store, e.sku, e.customerName, e.reservedAt)));

  if (!apply) {
    return {
      sheet: RESERVAS_SHEET, status: "ok", rows: body.length, detail: "pré-visualização",
      changes: { reservas: parsed.length, aApagar: toDelete.length },
    };
  }

  // Match to a catalogue variant (best-effort) for the link.
  const variants = await prisma.productVariant.findMany({ select: { id: true, sku: true, ean: true } });
  const bySku = new Map(variants.map((v) => [v.sku, v.id]));
  const byEan = new Map(variants.filter((v) => v.ean).map((v) => [v.ean as string, v.id]));

  // Bulk-map the existing rows by natural key (same helper as the preview).
  const existingByKey = new Map(
    allBoutiqueRows.map((e) => [keyOf(store, e.sku, e.customerName, e.reservedAt), e.id]),
  );

  const toCreate: { data: Parameters<typeof prisma.reserva.create>[0]["data"] }[] = [];
  const toUpdate: { id: string; data: Parameters<typeof prisma.reserva.update>[0]["data"] }[] = [];
  for (const r of parsed) {
    let variantId: string | null = (r.ean && byEan.get(r.ean)) || null;
    if (!variantId) for (const c of refCandidates(r.ref)) { const id = bySku.get(c); if (id) { variantId = id; break; } }
    const data = {
      boutique: store, reservedAt: r.reservedAt, expectedAt: r.expectedAt, variantId,
      sku: r.ref, ean: r.ean, descSnapshot: r.desc, brand: r.brand || null, quantity: r.qty, pvpCents: r.pvpCents,
      customerName: r.name, customerPhone: r.phone, customerEmail: r.email, operator: r.op,
    };
    const existingId = existingByKey.get(keyOf(store, r.ref, r.name, r.reservedAt));
    if (existingId) toUpdate.push({ id: existingId, data });
    else toCreate.push({ data });
  }
  let created = 0, updated = 0, deleted = 0;
  if (toCreate.length) {
    const res = await prisma.reserva.createMany({
      data: toCreate.map((c) => c.data) as never,
      skipDuplicates: false,
    });
    created = res.count;
  }
  await runPool(toUpdate, async (u) => { await prisma.reserva.update({ where: { id: u.id }, data: u.data }); });
  updated = toUpdate.length;
  // Autoritativo — apagar reservas que já não estão no ficheiro.
  if (toDelete.length) {
    const res = await prisma.reserva.deleteMany({ where: { id: { in: toDelete.map((d) => d.id) } } });
    deleted = res.count;
  }
  return {
    sheet: RESERVAS_SHEET, status: "ok", rows: body.length, detail: "aplicado",
    changes: { novas: created, atualizadas: updated, apagadas: deleted },
  };
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
  // Operadores é sempre poucas linhas (~5), mas paralelizar não faz mal.
  const results = await runPool(parsed, (o) =>
    prisma.operator.upsert({
      where: { boutique_initials: { boutique: store, initials: o.initials } },
      update: { monthlyGoalCents: o.goalCents },
      create: { boutique: store, initials: o.initials, monthlyGoalCents: o.goalCents, active: true },
    }),
  );
  let created = 0, updated = 0;
  for (const res of results) {
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
  const toDate = (v: Cell) => {
    if (v instanceof Date && !Number.isNaN(v.getTime())) return v;
    // Excel day serial (comes through as a plain number with raw:true).
    if (typeof v === "number" && Number.isFinite(v) && v > 20000 && v < 80000) {
      const d = new Date(Math.round((v - 25569) * 86400 * 1000));
      return Number.isNaN(d.getTime()) ? null : d;
    }
    const s = cell(v);
    const d = s ? new Date(s) : null;
    return d && !Number.isNaN(d.getTime()) ? d : null;
  };
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

  // Tipos que ESTE parser gere. Precisamos disto para apagar só o subset
  // correcto (a outra função syncMovements — a outra chamada em paralelo —
  // trata dos outros tipos, sem colisão).
  const typesInScope = kind === "DANIFICADO"
    ? (["DANIFICADO"] as const)
    : (["ENTRADA", "SAIDA", "STOCK_INICIAL", "AJUSTE", "TRANSFER_IN", "TRANSFER_OUT"] as const);

  const priorCount = apply
    ? await prisma.stockMovement.count({ where: { boutique: store, type: { in: typesInScope as never } } })
    : 0;

  if (!apply) {
    // Contagem do que seria apagado no modo autoritativo, para a preview.
    const wouldWipe = await prisma.stockMovement.count({
      where: { boutique: store, type: { in: typesInScope as never } },
    });
    return {
      sheet, status: "ok", rows: body.length,
      detail: "pré-visualização (autoritativo · movimentos actuais serão substituídos)",
      changes: { movimentos: parsed.length, aApagar: wouldWipe },
    };
  }

  // AUTORITATIVO — wipe-then-insert para os tipos deste parser.
  // Apagar apenas o subset relevante desta boutique; os movimentos de
  // VENDA/DEVOLUCAO são geridos pelo syncSales; os movimentos criados
  // pela página /admin/movimentos (ENTRADA/SAIDA) são apagados também,
  // porque o Excel é a única fonte.
  await prisma.stockMovement.deleteMany({
    where: { boutique: store, type: { in: typesInScope as never } },
  });

  const variants = await prisma.productVariant.findMany({ select: { id: true, sku: true, ean: true } });
  const bySku = new Map(variants.map((v) => [v.sku, v.id]));
  const byEan = new Map(variants.filter((v) => v.ean).map((v) => [v.ean as string, v.id]));

  const toInsert: {
    boutique: EciStore; variantId: string | null; sku: string; ean: string | null;
    type: string; quantity: number; movedAt: Date; note: string | null;
  }[] = [];
  for (const mv of parsed) {
    let variantId: string | null = (mv.ean && byEan.get(mv.ean)) || null;
    if (!variantId) for (const c of refCandidates(mv.ref)) { const id = bySku.get(c); if (id) { variantId = id; break; } }
    toInsert.push({
      boutique: store, variantId, sku: mv.ref, ean: mv.ean,
      type: mv.type, quantity: mv.qty, movedAt: mv.movedAt, note: mv.note,
    });
  }
  let created = 0;
  // Chunked: 4.7k linhas × 8 colunas já anda perto do tecto de 65535
  // parâmetros por statement do Postgres.
  await insertChunked(toInsert, async (slice) => {
    const res = await prisma.stockMovement.createMany({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: slice as any,
    });
    created += res.count;
  });
  return {
    sheet, status: "ok", rows: body.length,
    detail: `aplicado (autoritativo · substituiu ${priorCount} movimentos)`,
    changes: { novos: created, apagados: priorCount },
  };
}

// ---------- Mov_POS_Loja (historical sales) ----------
// Columns (0-indexed): 0=DATA (excel serial), 1=MÊS, 2=HORA, 3=V/D, 4=Op., 5=EAN,
// 6=QTD, 7=REF, 8=DESCRIÇÃO, 9=PVP, 10=Desc %, 11=Valor Vend, 12=V.Rec.
//
// Idempotency: full wipe-and-rewrite per boutique. The sync is authoritative
// (Excel = única fonte); everything the boutique has in Sale/SaleItem is
// deleted first, then the file is re-inserted from scratch. That means POS-
// terminal sales are ALSO wiped — if it's not in the Excel, it doesn't exist.
// Sale-linked StockMovement rows (types VENDA/DEVOLUCAO) are deleted alongside
// to avoid orphans with saleItemId → null. Deliberately does NOT create new
// StockMovement for VENDA/DEVOLUCAO here — the DB sheet already carries the
// theoretical stock that has these subtracted; recording again would double-count.
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
  // authoritative list of who ever sold anything in the boutique). Only
  // upsert the ones that don't already exist — the vast majority are
  // repeats between re-syncs. One SELECT + createMany beats N upserts.
  const ops = [...new Set(lines.map((l) => l.op))].filter(Boolean);
  const already = await prisma.operator.findMany({
    where: { boutique: store, initials: { in: ops } },
    select: { initials: true },
  });
  const knownOps = new Set(already.map((o) => o.initials));
  const missingOps = ops.filter((o) => !knownOps.has(o));
  if (missingOps.length) {
    await prisma.operator.createMany({
      data: missingOps.map((initials) => ({ boutique: store, initials, active: true })),
      skipDuplicates: true,
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

  // AUTORITATIVO — apagar TUDO desta boutique antes de re-inserir.
  //  • Sale (cascata para SaleItem via FK Cascade)
  //  • StockMovement onde type ∈ (VENDA, DEVOLUCAO) — os que estavam ligados
  //    às sales apagadas. Sem isto ficariam com saleItemId=null como debris.
  // Scope: só ESTA boutique (o outro ficheiro trata da outra loja).
  const priorCount = await prisma.sale.count({ where: { boutique: store } });
  await Promise.all([
    prisma.sale.deleteMany({ where: { boutique: store } }),
    prisma.stockMovement.deleteMany({
      where: { boutique: store, type: { in: ["VENDA", "DEVOLUCAO"] } },
    }),
  ]);

  // Build the list of baskets that have a valid operator, then create them
  // in parallel. Each basket is one insert (with nested SaleItem creates via
  // the ORM), so N baskets = N round-trips — pooling collapses total wall
  // clock to ~N/POOL. Missing-operator groups are counted, not written.
  const basketsToWrite: { groupLines: RawLine[]; operatorId: string }[] = [];
  let missingOp = 0;
  for (const [, groupLines] of groups) {
    const operatorId = opId.get(groupLines[0].op);
    if (!operatorId) { missingOp++; continue; }
    basketsToWrite.push({ groupLines, operatorId });
  }

  // Era um `sale.create` aninhado por cesto — ~2500 round-trips no ficheiro
  // VNG, o grosso do tempo que rebentava o tecto do Vercel. Gerando os ids
  // dos Sale à cabeça, as duas tabelas entram em createMany chunked: 2500
  // inserções passam a ~5.
  const saleRows: Prisma.SaleCreateManyInput[] = [];
  const itemRows: Prisma.SaleItemCreateManyInput[] = [];
  for (const { groupLines, operatorId } of basketsToWrite) {
    const first = groupLines[0];
    const saleId = randomUUID();
    const grossCents = groupLines.reduce((s, l) => s + l.grossCents, 0);
    const netCents = groupLines.reduce((s, l) => s + l.netCents, 0);
    saleRows.push({
      id: saleId,
      boutique: store, operatorId, type: first.vd, soldAt: first.soldAt,
      grossCents, netCents,
      eciCommissionCents: Math.round(netCents * (store === "LIS" ? 0.22 : 0.19)),
      note: ECI_SALE_NOTE,
    });
    for (const l of groupLines) {
      itemRows.push({
        saleId,
        source: "DUPONT",
        variantId: matchVariant(l),
        sku: l.ref, ean: l.ean, descSnapshot: l.desc, brand: "S.T. Dupont",
        quantity: l.qty, unitPriceCents: l.pvpCents,
        discountPct: l.discountPct, grossCents: l.grossCents, netCents: l.netCents,
      });
    }
  }
  // Sales primeiro — SaleItem.saleId tem FK para Sale.
  await insertChunked(saleRows, (slice) => prisma.sale.createMany({ data: slice }));
  await insertChunked(itemRows, (slice) => prisma.saleItem.createMany({ data: slice }));
  const created = basketsToWrite.length;
  const items = basketsToWrite.reduce((s, b) => s + b.groupLines.length, 0);

  return {
    sheet: MOV_POS_LOJA_SHEET, status: "ok", rows: body.length,
    detail: `aplicado (autoritativo · ${priorCount ? `substituiu ${priorCount} vendas anteriores` : "primeira importação"})`,
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

  // Modo autoritativo: precisamos de TODAS as linhas deste (boutique, bucket)
  // para calcular quais apagar (as que não aparecem no ficheiro).
  const keyOf = (n: string, ref: string, at: Date | null) => `${n}|${ref}|${at ? at.toISOString() : "?"}`;
  const allBucketRows = await prisma.repair.findMany({
    where: { boutique: store, bucket },
    select: { id: true, customerName: true, reference: true, firstVisitAt: true },
  });
  const fileKeys = new Set(recs.map((r) => keyOf(r.customerName, r.reference, r.firstVisitAt)));
  const toDelete = allBucketRows.filter((e) => !fileKeys.has(keyOf(e.customerName, e.reference, e.firstVisitAt)));

  if (!apply) {
    return {
      sheet: sheetName, status: "ok", rows: body.length,
      detail: `pré-visualização (bucket ${bucket.toLowerCase()})`,
      changes: {
        total: recs.length,
        semData: recs.filter((x) => !x.firstVisitAt).length,
        aApagar: toDelete.length,
        ignoradas: skippedBlank,
      },
    };
  }

  const existingByKey = new Map(allBucketRows.map((e) => [keyOf(e.customerName, e.reference, e.firstVisitAt), e.id]));

  interface WriteData {
    boutique: EciStore;
    bucket: typeof bucket;
    firstVisitAt: Date | null;
    staff: string;
    status: (typeof recs)[number]["status"];
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
  const toCreate: WriteData[] = [];
  const toUpdate: { id: string; data: WriteData }[] = [];
  for (const rec of recs) {
    const updates = rec.rawFirstVisit
      ? `[1ª Visita: ${rec.rawFirstVisit}] ${rec.updates ?? ""}`.trim()
      : rec.updates;
    const data: WriteData = {
      boutique: store, bucket, firstVisitAt: rec.firstVisitAt, staff: rec.staff,
      status: rec.status, customerName: rec.customerName, reference: rec.reference,
      subject: rec.subject, updates, lastContactAt: rec.lastContactAt,
      lastContactStaff: rec.lastContactStaff, lastContactVia: rec.lastContactVia,
      lastContactNote: rec.lastContactNote, otherObs: rec.otherObs,
      phone: rec.phone, otherContacts: rec.otherContacts,
    };
    const existingId = existingByKey.get(keyOf(rec.customerName, rec.reference, rec.firstVisitAt));
    if (existingId) toUpdate.push({ id: existingId, data });
    else toCreate.push(data);
  }
  let created = 0, updated = 0, deleted = 0;
  if (toCreate.length) {
    const res = await prisma.repair.createMany({ data: toCreate as never });
    created = res.count;
  }
  await runPool(toUpdate, async (u) => { await prisma.repair.update({ where: { id: u.id }, data: u.data }); });
  updated = toUpdate.length;
  // Autoritativo — apagar reparações desta boutique+bucket que já não estão
  // no ficheiro. Sale.repairId tem onDelete SetNull, portanto vendas
  // ligadas sobrevivem com repairId=null.
  if (toDelete.length) {
    const res = await prisma.repair.deleteMany({ where: { id: { in: toDelete.map((d) => d.id) } } });
    deleted = res.count;
  }
  return {
    sheet: sheetName, status: "ok", rows: body.length,
    detail: `aplicado (bucket ${bucket.toLowerCase()})`,
    changes: { total: recs.length, novos: created, atualizados: updated, apagadas: deleted, ignoradas: skippedBlank },
  };
}
