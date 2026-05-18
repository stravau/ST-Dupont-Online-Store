// Pure sort keys/types — safe to import from client components (no server deps).
// The actual sort implementation lives in lib/catalog (server).
export type SortKey = "featured" | "price-asc" | "price-desc" | "newest" | "name";

export const SORT_KEYS: SortKey[] = [
  "featured",
  "price-asc",
  "price-desc",
  "newest",
  "name",
];

export function isSortKey(s: string | undefined): s is SortKey {
  return !!s && (SORT_KEYS as string[]).includes(s);
}
