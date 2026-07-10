// Products whose variants belong to the same real pen line but were split into
// separate entries by the catalogue import. Their variants fold into the
// target product before the type-splitting runs, so e.g. all plain Line D
// Eternity pens end up in ONE "eternity" parent that then splits into coherent
// Ballpoint / Rollerball / Fountain Pen products (each with its M/L/XL sizes).
//
// Applied in BOTH scripts/gen-bundle-splits.ts and prisma/seed.ts so the
// generated split config and the seed agree.
export const MERGE_INTO: Record<string, string> = {
  "eternity-2": "eternity",
  "eternity-3": "eternity",
};
