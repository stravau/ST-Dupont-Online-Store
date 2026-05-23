// Canonical colour-swatch ordering, shared by the product cards and the
// product-page selector so every item lists its colours in the SAME order
// (a product simply omits the colours it doesn't have). Ordered by the
// primary lacquer colour's luminance (dark → light), with the second
// (metal) tone as a tie-break — deterministic and identical everywhere.
function luminance(hex: string): number {
  const c = hex.replace("#", "");
  if (c.length < 6) return 0;
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b; // 0..255
}

export function swatchRank(hex: string[]): number {
  const primary = luminance(hex[0] ?? "#000000");
  const secondary = hex[1] ? luminance(hex[1]) : primary;
  return primary * 1000 + secondary;
}

export function compareSwatch(a: { hex: string[] }, b: { hex: string[] }): number {
  return swatchRank(a.hex) - swatchRank(b.hex);
}
