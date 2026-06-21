// Shared helpers for the admin Excel uploads. Keeps the column-name
// fuzzing + EAN→REF match cascade in one place so each upload route
// stays focused on the diff it's writing.

import * as xlsx from "xlsx";
import { prisma } from "@/lib/prisma";

export type Cell = string | number | boolean | Date | null | undefined;

// Read a workbook from an uploaded File and return the first non-empty
// sheet as rows of objects keyed by their (uppercased) header.
export async function readUploadedSheet(file: File): Promise<Record<string, Cell>[]> {
  const buf = Buffer.from(await file.arrayBuffer());
  const wb = xlsx.read(buf, { type: "buffer", cellDates: true });
  for (const name of wb.SheetNames) {
    const ws = wb.Sheets[name];
    const arr = xlsx.utils.sheet_to_json<Record<string, Cell>>(ws, { defval: null });
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
// Returns null when nothing matches.
export async function resolveVariant(
  ean: string | null,
  ref: string | null,
): Promise<{ id: string; sku: string; priceCents: number } | null> {
  if (ean) {
    const v = await prisma.productVariant.findUnique({
      where: { ean },
      select: { id: true, sku: true, priceCents: true },
    });
    if (v) return v;
  }
  if (ref) {
    const cands = refCandidates(ref);
    const matches = await prisma.productVariant.findMany({
      where: { sku: { in: cands } },
      select: { id: true, sku: true, priceCents: true },
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
