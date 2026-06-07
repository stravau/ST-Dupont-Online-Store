// Listing pagination shared by every catalogue page.
// Desktop shows the full page (DESKTOP_PER_PAGE), mobile shows MOBILE_PER_PAGE
// up-front with a "Show all on this page" client toggle that reveals the rest.

export const DESKTOP_PER_PAGE = 48;
export const MOBILE_PER_PAGE = 24;

export interface Paginated<T> {
  slice: T[];
  page: number;
  totalPages: number;
  total: number;
  perPage: number;
}

export function paginate<T>(items: T[], page: number, perPage = DESKTOP_PER_PAGE): Paginated<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(Math.max(1, page || 1), totalPages);
  const start = (safePage - 1) * perPage;
  return {
    slice: items.slice(start, start + perPage),
    page: safePage,
    totalPages,
    total,
    perPage,
  };
}

// Parse a ?page= query value into a sensible 1-based int.
export function readPage(raw: string | undefined): number {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
}
