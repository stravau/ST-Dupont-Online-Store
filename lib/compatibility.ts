// Parses the official S.T. Dupont marketing copy that ships in every
// PDP description for "Associated …: <colour> (REF NNNNNN)" callouts
// AND the looser "Ink cartridges: 040112 Blue - 040110 Black …" lists
// that the writing-pen copy uses without the REF prefix. Returns the
// raw SKU strings (matching ProductVariant.sku) — the catalog helper
// then resolves them to full products.
//
// Two patterns:
//   1. `REF NNNNNN` / `(REF NNNNNN)` — the explicit form. Always trusted.
//   2. Bare 6-digit codes (optionally with a trailing letter) inside a
//      labelled section: "Associated refills:", "Related refills:",
//      "Compatible refills:", "Ink cartridges:", "Ink bottles:", or the
//      PT equivalents "Recargas …:". We only mine these sections to
//      avoid false positives from any 6-digit number in marketing copy.

const REF_RE = /\(?REF\s+([A-Z0-9]{4,12})\)?/gi;

const SECTION_HEADERS = [
  "Associated refills?",
  "Related refills?",
  "Compatible refills?",
  "Associated Refills?",
  "Associated Gas Refill",
  "Associated Flints?",
  "Ink cartridges?",
  "Ink bottles?",
  "Compatible with piston ref",
  "Recargas compat[íi]veis",
  "Recargas associadas",
  "Recargas relacionadas",
];

// Header followed by "…body until two-newline break, the start of a
// sentence-cased instruction ('This …'), or the end of the string". The
// body is the chunk we scan for bare SKUs.
const SECTION_RE = new RegExp(
  "(?:" + SECTION_HEADERS.join("|") + ")\\s*[:.-]?\\s*([\\s\\S]*?)(?=\\n\\n|\\.\\s+[A-Z]|This\\s+|$)",
  "gi",
);

const BARE_SKU_RE = /\b(\d{6}[A-Z]?)\b/g;

export function parseCompatibleRefs(description: string | undefined | null): string[] {
  if (!description) return [];
  const out = new Set<string>();
  for (const m of description.matchAll(REF_RE)) {
    out.add(m[1].trim());
  }
  for (const section of description.matchAll(SECTION_RE)) {
    const body = section[1] ?? "";
    for (const skuMatch of body.matchAll(BARE_SKU_RE)) {
      out.add(skuMatch[1]);
    }
  }
  return Array.from(out);
}
