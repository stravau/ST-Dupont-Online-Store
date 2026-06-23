// Shared helpers for the admin Excel uploads. Keeps the column-name
// fuzzing + EAN→REF match cascade in one place so each upload route
// stays focused on the diff it's writing.

import * as xlsx from "xlsx";
import { prisma } from "@/lib/prisma";

export type Cell = string | number | boolean | Date | null | undefined;

// Read a workbook from an uploaded File and return the first non-empty
// sheet as rows of objects keyed by their (uppercased) header. Cells
// come back AS STRINGS (raw: false) so a big EAN like 3597390000118 —
// which Excel happily reads as a number and corrupts to scientific
// notation on round-trip — survives intact for `where: { ean }` lookup.
export async function readUploadedSheet(file: File): Promise<Record<string, Cell>[]> {
  const buf = Buffer.from(await file.arrayBuffer());
  const wb = xlsx.read(buf, { type: "buffer", cellDates: true, raw: false });
  for (const name of wb.SheetNames) {
    const ws = wb.Sheets[name];
    const arr = xlsx.utils.sheet_to_json<Record<string, Cell>>(ws, { defval: null, raw: false });
    if (arr.length === 0) continue;
    // Normalise headers: trim + uppercase + strip accents/spaces. Also
    // accept Portuguese variants (DESCRIÇÃO → DESCRICAO).
    const normalised: Record<string, Cell>[] = [];
    for (const row of arr) {
      const out: Record<string, Cell> = {};
      for (const [k, v] of Object.entries(row)) {
        const nk = k
          .normalize("NFD")
          .replace(/[̀-ͯ]/g, "")
          .replace(/\s+/g, "_")
          .toUpperCase()
          .trim();
        out[nk] = v;
      }
      normalised.push(out);
    }
    return normalised;
  }
  return [];
}

// Pull a value from a row by trying multiple header aliases.
export function pick(row: Record<string, Cell>, ...keys: string[]): Cell {
  for (const k of keys) if (k in row) return row[k];
  return null;
}

export function asString(v: Cell): string | null {
  if (v == null) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}
export function asNumber(v: Cell): number | null {
  if (v == null) return null;
  if (typeof v === "number") return v;
  const s = String(v).replace(",", ".").trim();
  if (!s) return null;
  const n = Number.parseFloat(s);
  return Number.isFinite(n) ? n : null;
}
export function asInt(v: Cell): number | null {
  const n = asNumber(v);
  return n == null ? null : Math.trunc(n);
}
export function asDate(v: Cell): Date | null {
  if (v == null) return null;
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : v;
  const s = String(v).trim();
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

// Strip Starbrands/STD prefixes from a ref so it can be compared against
// our raw SKUs (mirrors the ERP-import logic — keeps the two paths in
// sync). Returns the candidate list (preserved order so the price tie
// breaker can use the first hit).
export function refCandidates(ref: string): string[] {
  const tail = ref.replace(/^STD/, "");
  const out: string[] = [tail];
  if (/^000\d{3}$/.test(tail)) out.push("9" + tail.slice(1));
  if (ref !== tail) out.push(ref);
  return out;
}

// Resolve an Excel row to ONE variant by EAN first, then REF candidates.
// Returns null when nothing matches. Selects every field the upload
// routes need for `before` snapshots in the audit log — adding fields
// here is cheap and keeps each route from having to round-trip a second
// findUnique just to capture pre-update state.
export interface ResolvedVariant {
  id: string;
  sku: string;
  ean: string | null;
  priceCents: number;
  stock: number;
  promoPriceCents: number | null;
  promoStartDate: Date | null;
  promoEndDate: Date | null;
}

const RESOLVED_SELECT = {
  id: true,
  sku: true,
  ean: true,
  priceCents: true,
  stock: true,
  promoPriceCents: true,
  promoStartDate: true,
  promoEndDate: true,
} as const;

// Batched variant lookup — given N (ean, ref) pairs, returns an array
// of length N where each slot is the resolved variant or null. Issues
// AT MOST two findMany calls regardless of N (one for the EANs, one
// for every REF candidate). Use this in upload loops to keep them
// under the serverless function timeout — sequential per-row lookups
// were the bottleneck at ~1000 rows.
export async function batchResolveVariants(
  rows: { ean: string | null; ref: string | null }[],
): Promise<(ResolvedVariant | null)[]> {
  // Collect every distinct EAN and every distinct REF candidate.
  const eanSet = new Set<string>();
  const candSet = new Set<string>();
  const rowCands: string[][] = rows.map((r) => {
    if (r.ean) eanSet.add(r.ean);
    const cands = r.ref ? refCandidates(r.ref) : [];
    for (const c of cands) candSet.add(c);
    return cands;
  });
  const [byEan, bySku] = await Promise.all([
    eanSet.size === 0
      ? Promise.resolve([] as ResolvedVariant[])
      : prisma.productVariant.findMany({
          where: { ean: { in: Array.from(eanSet) } },
          select: RESOLVED_SELECT,
        }),
    candSet.size === 0
      ? Promise.resolve([] as ResolvedVariant[])
      : prisma.productVariant.findMany({
          where: { sku: { in: Array.from(candSet) } },
          select: RESOLVED_SELECT,
        }),
  ]);
  const eanMap = new Map(byEan.map((v) => [v.ean!, v]));
  const skuMap = new Map(bySku.map((v) => [v.sku, v]));

  return rows.map((r, i) => {
    if (r.ean) {
      const hit = eanMap.get(r.ean);
      if (hit) return hit;
    }
    for (const c of rowCands[i]) {
      const hit = skuMap.get(c);
      if (hit) return hit;
    }
    return null;
  });
}

export async function resolveVariant(
  ean: string | null,
  ref: string | null,
): Promise<ResolvedVariant | null> {
  if (ean) {
    const v = await prisma.productVariant.findUnique({
      where: { ean },
      select: RESOLVED_SELECT,
    });
    if (v) return v;
  }
  if (ref) {
    const cands = refCandidates(ref);
    const matches = await prisma.productVariant.findMany({
      where: { sku: { in: cands } },
      select: RESOLVED_SELECT,
    });
    if (matches.length === 1) return matches[0];
    if (matches.length > 1) {
      // Order-of-candidates preference (first non-null wins) — same
      // bias used by the price tie-breaker in scripts/import-erp-excel.
      for (const c of cands) {
        const hit = matches.find((m) => m.sku === c);
        if (hit) return hit;
      }
      return matches[0];
    }
  }
  return null;
}
