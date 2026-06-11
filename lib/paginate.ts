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

// "Show all" mode — bypass pagination entirely and return the full list as
// one slice. Used by the ?all=1 link at the bottom of every listing. Pages
// hide the Paginator and lean on the browser's scroll.
export function paginateAll<T>(items: T[]): Paginated<T> {
  return {
    slice: items,
    page: 1,
    totalPages: 1,
    total: items.length,
    perPage: items.length,
  };
}

export function isShowAll(raw: string | undefined): boolean {
  return raw === "1" || raw === "true";
}

// Parse a ?page= query value into a sensible 1-based int.
export function readPage(raw: string | undefined): number {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
}
