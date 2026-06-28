// Rectifies stockLis / stockVng / stock / priceCents from
// STD_Resumo_Stock_PVP.xlsx, AND absorbs unmatched refs as orphans
// under the hidden "unmapped-inventory" Product (active:false, never
// shown on the site). Includes a fuzzy-duplicate guard so we don't
// re-create artigos that already exist on the site under a different
// SKU + missing EAN.
//
// Dry-run by default; pass --apply to write.
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
const FUZZY_THRESHOLD = 0.6;

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

interface VariantRec {
  id: string;
  sku: string;
  ean: string | null;
  priceCents: number;
  stockLis: number;
  stockVng: number;
  name: unknown;
  description: unknown;
}

// Strip STD prefix; if tail is 000NNN also try 900NNN (legacy gas-refill
// family numbering); finally also try the raw ref so previous-batch
// orphans inserted as `STD001022` still match.
function refCandidates(ref: string): string[] {
  const tail = ref.replace(/^STD/, "");
  const out: string[] = [tail];
  if (/^000\d{3}$/.test(tail)) out.push("9" + tail.slice(1));
  if (ref !== tail) out.push(ref);
  return out;
}

// Token-set normalisation for fuzzy description matching. Strips
// accents, drops words < 3 chars (de / da / x8 noise) and de-dups.
function tokenize(s: string): Set<string> {
  return new Set(
    s
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .split(" ")
      .filter((w) => w.length >= 3),
  );
}

// Jaccard-style overlap on token sets — symmetric, in [0, 1].
function overlap(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let shared = 0;
  for (const t of a) if (b.has(t)) shared++;
  return shared / Math.max(a.size, b.size);
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

  // Load every variant ONCE — used by exact-match maps + fuzzy index.
  console.log("Loading current catalogue…");
  const variants = await prisma.productVariant.findMany({
    select: {
      id: true, sku: true, ean: true, priceCents: true,
      stockLis: true, stockVng: true, name: true, description: true,
    },
  });
  console.log(`  ${variants.length.toLocaleString("pt-PT")} variants in DB`);

  const bySku = new Map<string, VariantRec>();
  const byEan = new Map<string, VariantRec>();
  // Token index: token -> [variantId]. Used to prune fuzzy candidates
  // (only test variants sharing at least one rare-ish token with the
  // unmatched row's description). Skip the placeholder orphan parent's
  // existing rows so a previously-imported orphan doesn't shadow itself.
  const tokenIndex = new Map<string, string[]>();
  const descTokens = new Map<string, Set<string>>();
  for (const v of variants) {
    bySku.set(v.sku, v as VariantRec);
    if (v.ean) byEan.set(v.ean, v as VariantRec);
    const ptName = (v.name as { pt?: string; en?: string } | null)?.pt ?? "";
    const enName = (v.name as { pt?: string; en?: string } | null)?.en ?? "";
    const ptDesc = (v.description as { pt?: string; en?: string } | null)?.pt ?? "";
    const tokens = tokenize(`${ptName} ${enName} ${ptDesc}`);
    descTokens.set(v.id, tokens);
    for (const t of tokens) {
      if (!tokenIndex.has(t)) tokenIndex.set(t, []);
      tokenIndex.get(t)!.push(v.id);
    }
  }

  let matchedEan = 0;
  let matchedRef = 0;
  let queuedUpdate = 0;
  let queuedNoop = 0;
  let queuedCreate = 0;
  let queuedPossibleDup = 0;
  const sampleDups: { ref: string | null; ean: string | null; desc: string | null; nearest: string; score: number }[] = [];
  const sampleNewCreates: { ref: string | null; ean: string | null; desc: string | null }[] = [];

  type Action =
    | { kind: "update"; id: string; data: Record<string, unknown> }
    | { kind: "create"; row: Row }
    | { kind: "noop" }
    | { kind: "possibleDup" };
  const actions: Action[] = [];

  for (const row of rows) {
    // 1) EAN exact.
    let hit: VariantRec | null = null;
    if (row.ean) {
      const v = byEan.get(row.ean);
      if (v) { hit = v; matchedEan++; }
    }
    // 2) REF candidates.
    if (!hit && row.ref) {
      for (const c of refCandidates(row.ref)) {
        const v = bySku.get(c);
        if (v) { hit = v; matchedRef++; break; }
      }
    }

    if (hit) {
      const stockTotal = row.stockLis + row.stockVng;
      const changed =
        hit.stockLis !== row.stockLis ||
        hit.stockVng !== row.stockVng ||
        (row.priceCents != null && hit.priceCents !== row.priceCents);
      if (!changed) { queuedNoop++; actions.push({ kind: "noop" }); continue; }
      const data: Record<string, unknown> = {
        stockLis: row.stockLis,
        stockVng: row.stockVng,
        stock: stockTotal,
      };
      if (row.priceCents != null && row.priceCents !== hit.priceCents) {
        data.priceCents = row.priceCents;
        data.pvpStartDate = new Date();
      }
      queuedUpdate++;
      actions.push({ kind: "update", id: hit.id, data });
      continue;
    }

    // 3) Fuzzy duplicate check.
    if (row.description) {
      const rowTokens = tokenize(row.description);
      // Collect candidate variants sharing >=1 token with the row.
      const candidateIds = new Set<string>();
      for (const t of rowTokens) {
        const ids = tokenIndex.get(t);
        if (ids) for (const id of ids) candidateIds.add(id);
      }
      let bestScore = 0;
      let bestId: string | null = null;
      for (const id of candidateIds) {
        const score = overlap(rowTokens, descTokens.get(id) ?? new Set());
        if (score > bestScore) { bestScore = score; bestId = id; }
      }
      if (bestScore >= FUZZY_THRESHOLD && bestId) {
        const v = variants.find((x) => x.id === bestId)!;
        const vName = (v.name as { pt?: string; en?: string } | null)?.pt ?? v.sku;
        queuedPossibleDup++;
        actions.push({ kind: "possibleDup" });
        if (sampleDups.length < 15) {
          sampleDups.push({
            ref: row.ref, ean: row.ean, desc: row.description,
            nearest: `${v.sku} · ${vName}`, score: Math.round(bestScore * 100) / 100,
          });
        }
        continue;
      }
    }

    // 4) Brand-new orphan.
    queuedCreate++;
    actions.push({ kind: "create", row });
    if (sampleNewCreates.length < 15) {
      sampleNewCreates.push({ ref: row.ref, ean: row.ean, desc: row.description });
    }
  }

  console.log("");
  console.log(`Rows in file:        ${rows.length.toLocaleString("pt-PT")}`);
  console.log(`Matched by EAN:      ${matchedEan.toLocaleString("pt-PT")}`);
  console.log(`Matched by REF:      ${matchedRef.toLocaleString("pt-PT")}`);
  console.log(`  → would update:    ${queuedUpdate.toLocaleString("pt-PT")}`);
  console.log(`  → no-op (in sync): ${queuedNoop.toLocaleString("pt-PT")}`);
  console.log(`Would CREATE orphans: ${queuedCreate.toLocaleString("pt-PT")}`);
  console.log(`Possible duplicates: ${queuedPossibleDup.toLocaleString("pt-PT")} (skipped — review manually)`);

  if (sampleNewCreates.length) {
    console.log("");
    console.log("Sample of orphans to CREATE:");
    for (const m of sampleNewCreates) console.log(`  REF=${m.ref ?? "—"}  EAN=${m.ean ?? "—"}  ${m.desc ?? ""}`);
  }
  if (sampleDups.length) {
    console.log("");
    console.log("Sample of possible duplicates (NOT inserted):");
    for (const d of sampleDups) {
      console.log(`  REF=${d.ref ?? "—"}  EAN=${d.ean ?? "—"}  score=${d.score}`);
      console.log(`     row:    ${d.desc ?? ""}`);
      console.log(`     nearest: ${d.nearest}`);
    }
  }

  if (!APPLY) {
    console.log("\nDry-run only — pass --apply to commit.");
    await prisma.$disconnect();
    return;
  }

  // ---- APPLY ----
  console.log("\nApplying…");

  // Ensure placeholder Product for orphans. We DON'T touch its
  // description, name or category if it already exists — same pattern
  // import-erp-excel uses, so two import scripts share one parent.
  let placeholderId: string | null = null;
  if (queuedCreate > 0) {
    const slug = "unmapped-inventory";
    const existing = await prisma.product.findUnique({ where: { slug }, select: { id: true } });
    if (existing) placeholderId = existing.id;
    else {
      // Need a category to attach to — pick the first one available.
      const cat = await prisma.category.findFirst({ select: { id: true } });
      if (!cat) throw new Error("No Category in DB; cannot create unmapped-inventory placeholder");
      const ph = await prisma.product.create({
        data: {
          slug,
          name: { pt: "Inventário não mapeado", en: "Unmapped inventory" },
          description: { pt: "", en: "" },
          collection: "",
          image: null,
          categoryId: cat.id,
          active: false, // hidden from /c/ and /p/
          featured: false,
        },
        select: { id: true },
      });
      placeholderId = ph.id;
      console.log(`  Created placeholder product unmapped-inventory (${placeholderId})`);
    }
  }

  let updated = 0;
  let created = 0;
  let skipped = 0;
  for (const action of actions) {
    if (action.kind === "noop" || action.kind === "possibleDup") continue;
    try {
      if (action.kind === "update") {
        await prisma.productVariant.update({ where: { id: action.id }, data: action.data });
        updated++;
      } else if (action.kind === "create" && placeholderId) {
        const stockTotal = action.row.stockLis + action.row.stockVng;
        const desc = action.row.description ?? action.row.ref ?? "Sem descrição";
        await prisma.productVariant.upsert({
          where: { sku: action.row.ref! },
          create: {
            sku: action.row.ref!,
            productId: placeholderId,
            name: { pt: desc, en: desc },
            priceCents: action.row.priceCents ?? 0,
            currency: "EUR",
            stock: stockTotal,
            stockLis: action.row.stockLis,
            stockVng: action.row.stockVng,
            ean: action.row.ean,
            pvpStartDate: action.row.priceCents != null ? new Date() : null,
            active: false,
            attributes: { unmapped: true, source: "stock-pvp-excel" },
          },
          // Should never run (we only reach here when neither sku nor
          // ean matched) but defensive against a race: just refresh
          // the per-store stocks.
          update: {
            stockLis: action.row.stockLis,
            stockVng: action.row.stockVng,
            stock: stockTotal,
          },
        });
        created++;
      }
    } catch (e) {
      skipped++;
      if (skipped <= 5) console.error(`  failed (${action.kind}): ${(e as Error).message.slice(0, 160)}`);
    }
  }

  console.log("");
  console.log(`Applied:`);
  console.log(`  updated:  ${updated.toLocaleString("pt-PT")}`);
  console.log(`  created:  ${created.toLocaleString("pt-PT")}`);
  console.log(`  skipped:  ${skipped.toLocaleString("pt-PT")}`);

  await prisma.$disconnect();
})().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
