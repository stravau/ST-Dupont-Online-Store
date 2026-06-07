// Canonical display order for product collections (the section titles on
// /c/<category> and the items in the navbar Products column). Themed
// sub-collections render FIRST so visitors land on Géode/Popote/Maki-e/etc
// immediately; base lines follow in the editorial-brief order.

export const COLLECTION_ORDER = [
  // Themed lighter sub-lines (collected via prisma/seed.ts RECOLLECTION).
  "Géode",
  "Popote",
  "Maki-e",
  "Orlinski",
  "Horse Mane",
  "Fender",
  "Fuente",
  "Fire X",
  "Monogram 1872",
  "DC Comics",
  "20,000 Leagues Under The Sea",
  "Casablanca",
  "Game of Thrones",
  "Padrón",
  "Snake Skin",
  "Camo",
  "Dragon",
  "Architecture",
  // Lighter base lines — explicit order per editorial brief.
  "Le Grand Dupont",
  "Ligne 2",
  "Ligne 1",
  "Initial",
  "Initial Cinatic",
  "Biggy",
  "Twiggy",
  "Slimmy",
  "Slim 7",
  "Défi Extreme",
  "Windproof",
  "Minijet",
  "Maxijet",
  "Megajet",
  "Table lighter",
  "Torch",
  "Lighter Necklace",
  // Writing
  "Line D Eternity",
  "Classique",
  "Défi Millennium",
  "Liberté",
  "Eternity",
  "Marker Necklace",
  // Leather goods
  "Lighter Accessories",
  "Atelier",
  "Firehead",
  "Neo Capsule",
  "Camera Bag · Fuente",
  "Pen case",
  // Accessories
  "Cigar cutter",
  "Cigar case",
  "2 cigar case",
  "3 cigar case",
  "3 Cigar Case · Fluo",
  "2 Cigar Case · Koi",
  "Double Cigar Case",
  "Humidors",
  "Ashtrays",
  "Cufflinks",
  "Money Clips",
  "Tie Clips",
  "Key Holders",
  "Pen Cases",
  "Gas Refills",
  "Acessórios",
] as const;

export function collectionRank(c: string): number {
  const i = (COLLECTION_ORDER as readonly string[]).indexOf(c);
  return i === -1 ? COLLECTION_ORDER.length : i;
}
