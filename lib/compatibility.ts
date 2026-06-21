// Parses the official S.T. Dupont marketing copy that ships in every
// PDP description for "Associated …: <colour> (REF NNNNNN)" callouts
// and surfaces the matching catalogue products on the page. Lighters
// almost always declare an Associated gas refill + Associated flint
// SKU; writing pieces declare an Associated ink refill. Returns the
// raw REF strings (matching ProductVariant.sku) — the catalog helper
// then resolves them to full products.

const REF_RE = /\(?REF\s+([A-Z0-9]{4,12})\)?/gi;

export function parseCompatibleRefs(description: string | undefined | null): string[] {
  if (!description) return [];
  const out = new Set<string>();
  for (const m of description.matchAll(REF_RE)) {
    out.add(m[1].trim());
  }
  return Array.from(out);
}
