// Product image URL helper. Kept as a single indirection point in case a
// CDN/transform is added later. NOTE: do NOT append a query string to
// local images — Next 16 rejects it (images.localPatterns) and 500s the
// page. New crops surface via a fresh deployment, not a query bust.
export function imgSrc(src: string | null | undefined): string | null {
  return src ?? null;
}
