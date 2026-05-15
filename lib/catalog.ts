// Catalog — Phase 1 placeholder data.
//
// Product lines & collection names verified against the official S.T. Dupont
// EU site (st-dupont.com), 2025/2026 lineup. Shape mirrors the Prisma models
// (Product -> ProductVariant) so swapping to live data in Phase 3 is trivial.
//
// PRICES are indicative placeholders ONLY. Final retail prices must come from
// S.T. Dupont's official price list / authorized supplier feed before launch.
//
// IMAGE: `image` is the path to official product photography under
// /public/products. It is null until the official asset pack is supplied;
// components fall back to an on-brand placeholder. Do NOT scrape brand images.
import type { Locale } from "@/lib/i18n";

type Localized = Record<Locale, string>;

export interface Variant {
  sku: string;
  name: Localized;
  priceCents: number; // INDICATIVE — confirm against official price list
  currency: "EUR";
}

export interface Product {
  slug: string;
  name: Localized;
  collection: string; // official S.T. Dupont collection/line name
  description: Localized;
  categorySlug: CategorySlug;
  image: string | null; // /products/<file> when official asset supplied
  novelty?: boolean;
  variants: Variant[];
}

export type CategorySlug = "isqueiros" | "escrita" | "pele" | "acessorios";

export interface Category {
  slug: CategorySlug;
  name: Localized;
  tagline: Localized;
}

export const categories: Category[] = [
  { slug: "isqueiros", name: { pt: "Isqueiros", en: "Lighters" }, tagline: { pt: "O gesto que define o luxo", en: "The gesture that defines luxury" } },
  { slug: "escrita", name: { pt: "Escrita", en: "Writing Instruments" }, tagline: { pt: "Instrumentos de uma vida", en: "Instruments for a lifetime" } },
  { slug: "pele", name: { pt: "Pele", en: "Leather Goods" }, tagline: { pt: "Savoir-faire em cada costura", en: "Savoir-faire in every stitch" } },
  { slug: "acessorios", name: { pt: "Acessórios", en: "Accessories" }, tagline: { pt: "Os detalhes mais raros", en: "The rarest details" } },
];

const v = (sku: string, pt: string, en: string, priceCents: number): Variant => ({
  sku,
  name: { pt, en },
  priceCents,
  currency: "EUR",
});

export const products: Product[] = [
  // --- Isqueiros / Lighters ---
  {
    slug: "ligne-2",
    name: { pt: "Isqueiro Ligne 2", en: "Ligne 2 Lighter" },
    collection: "Ligne 2",
    description: {
      pt: "O isqueiro emblemático da maison, desenhado com o joalheiro Jean Dinh Van — silhueta retangular intemporal e o inconfundível som cristalino de abertura.",
      en: "The maison's iconic lighter, designed with jeweller Jean Dinh Van — a timeless rectangular silhouette and the unmistakable crystalline 'cling' on opening.",
    },
    categorySlug: "isqueiros",
    image: null,
    novelty: true,
    variants: [
      v("L2-SILV", "Acabamento Prata", "Silver Finish", 126000),
      v("L2-PALL", "Acabamento Paládio", "Palladium Finish", 119000),
      v("L2-GOLD", "Ouro Amarelo", "Yellow Gold Finish", 178000),
      v("L2-LACQ", "Laca Natural & Paládio", "Natural Lacquer & Palladium", 139000),
    ],
  },
  {
    slug: "ligne-1",
    name: { pt: "Isqueiro Ligne 1", en: "Ligne 1 Lighter" },
    collection: "Ligne 1",
    description: {
      pt: "O desenho clássico da casa, esguio e elegante, fiel às origens da assinatura Dupont.",
      en: "The house's classic, slender and elegant design, faithful to the origins of the Dupont signature.",
    },
    categorySlug: "isqueiros",
    image: null,
    variants: [v("L1-BRUS", "Crómio Escovado", "Brushed Chrome", 89000), v("L1-LACQ", "Laca Preta", "Black Lacquer", 99000)],
  },
  {
    slug: "le-grand-dupont",
    name: { pt: "Isqueiro Le Grand Dupont", en: "Le Grand Dupont Lighter" },
    collection: "Le Grand",
    description: {
      pt: "Formato premium de maior porte, com chama dupla regulável — presença e desempenho.",
      en: "Premium larger format with an adjustable double flame — presence and performance.",
    },
    categorySlug: "isqueiros",
    image: null,
    novelty: true,
    variants: [v("LG-PALL", "Paládio", "Palladium", 158000), v("LG-BLK", "PVD Preto", "Black PVD", 169000)],
  },
  {
    slug: "defi-extreme",
    name: { pt: "Isqueiro Défi Extreme", en: "Défi Extreme Lighter" },
    collection: "Défi Extreme",
    description: {
      pt: "Chama tempestade de duplo maçarico, resistente ao vento. Robustez e atitude.",
      en: "Wind-resistant double-torch flame. Strength and attitude.",
    },
    categorySlug: "isqueiros",
    image: null,
    variants: [v("DX-GUN", "Metal Gun", "Gunmetal", 56000), v("DX-CARB", "Fibra de Carbono", "Carbon Fibre", 62000)],
  },
  {
    slug: "twiggy",
    name: { pt: "Isqueiro Twiggy", en: "Twiggy Lighter" },
    collection: "Twiggy",
    description: {
      pt: "Silhueta ultrafina inspirada na moda mod dos anos 60 — o Ligne 2 reinventado para o bolso moderno.",
      en: "Ultra-slim silhouette inspired by 1960s mod fashion — the Ligne 2 reinvented for the modern pocket.",
    },
    categorySlug: "isqueiros",
    image: null,
    novelty: true,
    variants: [v("TW-PALL", "Paládio", "Palladium", 32000), v("TW-LACQ", "Laca Preta", "Black Lacquer", 35000)],
  },
  {
    slug: "slim-7",
    name: { pt: "Isqueiro Slim 7", en: "Slim 7 Lighter" },
    collection: "Slim 7",
    description: { pt: "Maçarico esguio de chama jato, para o dia a dia com elegância.", en: "Slim jet-flame torch, for everyday elegance." },
    categorySlug: "isqueiros",
    image: null,
    variants: [v("S7-CHR", "Crómio", "Chrome", 23000), v("S7-BLK", "Preto Mate", "Matte Black", 25000)],
  },

  // --- Escrita / Writing Instruments ---
  {
    slug: "line-d-eternity",
    name: { pt: "Line D Eternity", en: "Line D Eternity" },
    collection: "Line D Eternity",
    description: {
      pt: "A coleção premium de escrita da maison, em laca e metais preciosos. Aparo gravável a pedido.",
      en: "The maison's premium writing collection, in lacquer and precious metals. Nib engravable on request.",
    },
    categorySlug: "escrita",
    image: null,
    novelty: true,
    variants: [
      v("LDE-FP", "Caneta de Tinta Permanente (Grande)", "Fountain Pen (Large)", 138000),
      v("LDE-RB", "Rollerball (Grande)", "Rollerball (Large)", 92000),
      v("LDE-BP", "Esferográfica (Grande)", "Ballpoint (Large)", 78000),
    ],
  },
  {
    slug: "initial",
    name: { pt: "Initial", en: "Initial" },
    collection: "Initial",
    description: {
      pt: "O ponto de entrada na escrita Dupont — equilíbrio e traço fluido, laca e crómio.",
      en: "The entry point to Dupont writing — balance and a fluid stroke, lacquer and chrome.",
    },
    categorySlug: "escrita",
    image: null,
    variants: [
      v("DI-FP", "Caneta de Tinta Permanente", "Fountain Pen", 32500),
      v("DI-RB", "Rollerball", "Rollerball", 25000),
      v("DI-BP", "Esferográfica", "Ballpoint", 23000),
    ],
  },
  {
    slug: "classique",
    name: { pt: "Classique", en: "Classique" },
    collection: "Classique",
    description: {
      pt: "A caneta de tinta permanente clássica da maison — proporções intemporais, aparo em ouro.",
      en: "The maison's classic fountain pen — timeless proportions, gold nib.",
    },
    categorySlug: "escrita",
    image: null,
    variants: [v("CQ-FP", "Caneta de Tinta Permanente", "Fountain Pen", 49000)],
  },
  {
    slug: "defi-millenium",
    name: { pt: "Défi Millenium", en: "Défi Millenium" },
    collection: "Défi Millenium",
    description: { pt: "Carácter desportivo e materiais nobres, para escrever com presença.", en: "Sporting character and noble materials, to write with presence." },
    categorySlug: "escrita",
    image: null,
    novelty: true,
    variants: [v("DM-RB", "Rollerball", "Rollerball", 38500), v("DM-BP", "Esferográfica", "Ballpoint", 43500)],
  },
  {
    slug: "liberte",
    name: { pt: "Liberté", en: "Liberté" },
    collection: "Liberté",
    description: { pt: "Equilíbrio perfeito e um traço fluido, vestido em laca e paládio.", en: "Perfect balance and a fluid stroke, dressed in lacquer and palladium." },
    categorySlug: "escrita",
    image: null,
    variants: [v("LB-PEARL", "Rollerball Laca Pérola", "Pearl Lacquer Rollerball", 39000)],
  },

  // --- Pele / Leather Goods ---
  {
    slug: "apex-wallet",
    name: { pt: "Carteira Apex", en: "Apex Wallet" },
    collection: "Apex",
    description: { pt: "Pele com curtimenta diamante, costura selada à mão. Linha contemporânea Apex.", en: "Diamond-tanned leather, hand-sealed stitching. The contemporary Apex line." },
    categorySlug: "pele",
    image: null,
    novelty: true,
    variants: [v("AW-BLK", "Preto", "Black", 34000), v("AW-BRN", "Castanho Cognac", "Cognac Brown", 34000)],
  },
  {
    slug: "apex-card-holder",
    name: { pt: "Porta-Cartões Apex", en: "Apex Card Holder" },
    collection: "Apex",
    description: { pt: "Compacto, essencial, irrepreensível.", en: "Compact, essential, impeccable." },
    categorySlug: "pele",
    image: null,
    variants: [v("AC-BLK", "Preto", "Black", 16500), v("AC-NVY", "Azul Marinho", "Navy", 16500)],
  },
  {
    slug: "defi-explorer-document-holder",
    name: { pt: "Porta-Documentos Défi Explorer", en: "Défi Explorer Document Holder" },
    collection: "Défi Explorer",
    description: { pt: "Uma pasta esguia e resistente, da linha de viagem Défi Explorer.", en: "A slim, resilient portfolio from the Défi Explorer travel line." },
    categorySlug: "pele",
    image: null,
    variants: [v("DD-BLK", "Pele Preta", "Black Leather", 96000)],
  },
  {
    slug: "defi-explorer-backpack",
    name: { pt: "Mochila Défi Explorer", en: "Défi Explorer Backpack" },
    collection: "Défi Explorer",
    description: { pt: "Funcional e elegante, pele e tecido técnico para o quotidiano exigente.", en: "Functional and elegant, leather and technical fabric for demanding days." },
    categorySlug: "pele",
    image: null,
    novelty: true,
    variants: [v("DB-BLK", "Preto", "Black", 119000)],
  },

  // --- Acessórios / Accessories ---
  {
    slug: "cufflinks-montecristo-aurore",
    name: { pt: "Botões de Punho Montecristo l’Aurore", en: "Montecristo l’Aurore Cufflinks" },
    collection: "Montecristo",
    description: { pt: "Latão maciço com banho de paládio e detalhe em laca, da coleção Montecristo.", en: "Solid brass with palladium plating and a lacquer detail, from the Montecristo collection." },
    categorySlug: "acessorios",
    image: null,
    novelty: true,
    variants: [v("CL-AUR", "Paládio & Laca", "Palladium & Lacquer", 24000)],
  },
  {
    slug: "money-clip",
    name: { pt: "Clip de Notas", en: "Money Clip" },
    collection: "Accessories",
    description: { pt: "Simplicidade afiada, com a assinatura gravada da maison.", en: "Sharp simplicity, with the maison's engraved signature." },
    categorySlug: "acessorios",
    image: null,
    variants: [v("MC-CHR", "Crómio Polido", "Polished Chrome", 18000)],
  },
  {
    slug: "key-ring",
    name: { pt: "Porta-Chaves", en: "Key Ring" },
    collection: "Accessories",
    description: { pt: "Pele e metal, o detalhe que acompanha todos os dias.", en: "Leather and metal, the detail that accompanies every day." },
    categorySlug: "acessorios",
    image: null,
    variants: [v("KR-BLK", "Aro em Pele Preta", "Black Leather Loop", 9500)],
  },
  {
    slug: "cigar-cutter-fire-x",
    name: { pt: "Cortador de Charutos Fire X", en: "Fire X Cigar Cutter" },
    collection: "Fire X",
    description: { pt: "Corte guilhotina preciso, da coleção Fire X.", en: "Precise guillotine cut, from the Fire X collection." },
    categorySlug: "acessorios",
    image: null,
    novelty: true,
    variants: [v("CC-FX", "Aço & Laca", "Steel & Lacquer", 21000)],
  },
  {
    slug: "belt",
    name: { pt: "Cinto", en: "Belt" },
    collection: "Accessories",
    description: {
      pt: "Pele de vitela com fivela gravada da maison, reversível.",
      en: "Calfskin with the maison's engraved buckle, reversible.",
    },
    categorySlug: "acessorios",
    image: null,
    variants: [v("BT-BLK", "Preto / Castanho", "Black / Brown", 28000)],
  },
  {
    slug: "tie-clip",
    name: { pt: "Mola de Gravata", en: "Tie Clip" },
    collection: "Accessories",
    description: { pt: "Linha precisa em paládio, com a assinatura Dupont.", en: "A precise line in palladium, with the Dupont signature." },
    categorySlug: "acessorios",
    image: null,
    variants: [v("TC-PALL", "Paládio", "Palladium", 16000)],
  },
  {
    slug: "gas-refill",
    name: { pt: "Recarga de Gás", en: "Gas Refill" },
    collection: "Refill & Stones",
    description: {
      pt: "Gás de alta qualidade para isqueiros S.T. Dupont. Essencial para a manutenção.",
      en: "High-quality gas for S.T. Dupont lighters. Essential for upkeep.",
    },
    categorySlug: "acessorios",
    image: null,
    variants: [v("GR-STD", "Recarga Standard", "Standard Refill", 2000)],
  },
];

// --- helpers (mirror the future Prisma queries) ---

export function getCategories(): Category[] {
  return categories;
}

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getProductsByCategory(slug: string, collection?: string): Product[] {
  return products.filter(
    (p) => p.categorySlug === slug && (!collection || p.collection === collection),
  );
}

export function getCollections(categorySlug: string): string[] {
  return [
    ...new Set(products.filter((p) => p.categorySlug === categorySlug).map((p) => p.collection)),
  ].sort((a, b) => a.localeCompare(b));
}

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getNovelties(limit = 6): Product[] {
  return products.filter((p) => p.novelty).slice(0, limit);
}

export function fromPrice(product: Product): Variant {
  return product.variants.reduce((min, cur) => (cur.priceCents < min.priceCents ? cur : min), product.variants[0]);
}

export function formatPrice(cents: number, currency: string, locale: Locale): string {
  return new Intl.NumberFormat(locale === "pt" ? "pt-PT" : "en-IE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
