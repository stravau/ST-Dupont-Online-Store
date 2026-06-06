// Raw catalogue data for seeding. Verified against the official S.T. Dupont
// EU site (st-dupont.com), 2025/2026 lineup. Prices are INDICATIVE
// placeholders — replace from the official price list before launch.
//
// Each variant carries up to THREE independent option axes (never mixed):
//   - type   : pen type (Ballpoint / Rollerball / Fountain Pen) — writing only
//   - finish : metal / lacquer treatment (Palladium, Yellow Gold…) — text chip
//   - color  : a colour option with 1–2 hex values — rendered as a swatch
// A product only carries the axes that actually apply to it.

type L = { pt: string; en: string };

export interface SeedColor {
  label: L;
  hex: string[]; // 1 hex = solid swatch, 2 = two-tone (e.g. "Black & Gold")
}

export interface SeedVariant {
  sku: string;
  name: L; // composed human label (used for cart/order snapshots)
  priceCents: number;
  currency: "EUR";
  attributes: { type?: L; finish?: L; color?: SeedColor; size?: L };
  image?: string; // single per-colourway photo (/products/<slug>/<ref>.jpg)
  // Ordered gallery: [front, back, close-up, close-up 2]. When present it
  // takes precedence over `image`. front = default/card, close-up = card hover.
  images?: string[];
}

export interface SeedProduct {
  slug: string;
  name: L;
  description: L;
  collection: string;
  categorySlug: "isqueiros" | "escrita" | "pele" | "acessorios";
  image: string | null;
  novelty?: boolean;
  variants: SeedVariant[];
}

export interface SeedCategory {
  slug: "isqueiros" | "escrita" | "pele" | "acessorios";
  name: L;
  tagline: L;
  history: L; // brief heritage of the craft/category
}

export const categories: SeedCategory[] = [
  {
    slug: "isqueiros",
    name: { pt: "Isqueiros", en: "Lighters" },
    tagline: { pt: "O gesto que define o luxo", en: "The gesture that defines luxury" },
    history: {
      pt: "Em 1941, a S.T. Dupont criou o primeiro isqueiro de luxo do mundo — então em alumínio, pois o latão estava restrito em tempo de guerra. Desde então, cada isqueiro é montado à mão na manufatura de Faverges, percorrendo centenas de operações de precisão antes de ser digno do nome da casa.",
      en: "In 1941, S.T. Dupont created the world's first luxury lighter — then in aluminium, as brass was restricted in wartime. Ever since, each lighter is hand-assembled at the Faverges manufacture through hundreds of precise operations before it is worthy of the house's name.",
    },
  },
  {
    slug: "escrita",
    name: { pt: "Escrita", en: "Writing Instruments" },
    tagline: { pt: "Instrumentos de uma vida", en: "Instruments for a lifetime" },
    history: {
      pt: "A história da escrita da maison começou em 1973, quando Jacqueline Kennedy pediu um instrumento a condizer com o seu isqueiro: nasceu o Classique, a primeira esferográfica de luxo assinada S.T. Dupont. Seguiram-se aparos em ouro, lacas e metais preciosos.",
      en: "The maison's writing story began in 1973, when Jacqueline Kennedy asked for an instrument to match her lighter: the Classique was born, S.T. Dupont's first signed luxury ballpoint. Gold nibs, lacquers and precious metals followed.",
    },
  },
  {
    slug: "pele",
    name: { pt: "Pele", en: "Leather Goods" },
    tagline: { pt: "Savoir-faire em cada costura", en: "Savoir-faire in every stitch" },
    history: {
      pt: "A pele é o primeiro métier da casa. Em 1872, em Paris, Simon Tissot-Dupont fundou uma oficina de estojos e malas de viagem feitos à mão para diplomatas e viajantes exigentes — uma arte que perdura na curtimenta diamante e na costura selada à mão.",
      en: "Leather is the house's first métier. In 1872, in Paris, Simon Tissot-Dupont founded a workshop of hand-made travel cases and trunks for diplomats and discerning travellers — a craft that endures in diamond tanning and hand-sealed stitching.",
    },
  },
  {
    slug: "acessorios",
    name: { pt: "Acessórios", en: "Accessories" },
    tagline: { pt: "Os detalhes mais raros", en: "The rarest details" },
    history: {
      pt: "Dos botões de punho aos cortadores de charutos, os acessórios prolongam o saber-fazer da maison em metal e pele — os detalhes mais raros, com a assinatura S.T. Dupont desde 1872.",
      en: "From cufflinks to cigar cutters, accessories extend the maison's savoir-faire in metal and leather — the rarest details, bearing the S.T. Dupont signature since 1872.",
    },
  },
];

// --- option presets ---------------------------------------------------------

const TYPE = {
  BP: { pt: "Esferográfica", en: "Ballpoint" },
  RB: { pt: "Rollerball", en: "Rollerball" },
  FP: { pt: "Caneta de Tinta Permanente", en: "Fountain Pen" },
};

const col = (pt: string, en: string, ...hex: string[]): SeedColor => ({ label: { pt, en }, hex });

const COLOR = {
  blackGold: col("Preto & Ouro", "Black & Gold", "#15171c", "#c8a24a"),
  whiteGold: col("Laca Branca & Ouro", "White Lacquer & Gold", "#f3efe6", "#c8a24a"),
  blackChrome: col("Preto & Crómio", "Black & Chrome", "#15171c", "#c9ccd1"),
  blueGold: col("Azul & Ouro", "Blue & Gold", "#1f3c66", "#c8a24a"),
  blueLacqPall: col("Laca Azul & Paládio", "Blue Lacquer & Palladium", "#1f3c66", "#b9bcc2"),
  blackPall: col("Preto & Paládio", "Black & Palladium", "#15171c", "#b9bcc2"),
  // Initial colourways
  blueChrome: col("Laca Azul & Crómio", "Blue Lacquer & Chrome", "#1f3c66", "#c9ccd1"),
  blackMatt: col("Preto & Preto Mate", "Black & Matt Black", "#15171c", "#3a3d44"),
  chrome: col("Crómio", "Chrome", "#c9ccd1"),
  blackChromeStriped: col("Preto Estriado & Crómio", "Black Striped & Chrome", "#15171c", "#c9ccd1"),
  // Classique colourways (ballpoint line)
  blackLacqGold: col("Laca Preta & Ouro", "Black Lacquer & Gold", "#15171c", "#c8a24a"),
  blueLacqGold: col("Laca Azul & Ouro", "Blue Lacquer & Gold", "#1f3c66", "#c8a24a"),
  brushedPalladium: col("Paládio Escovado", "Brushed Palladium", "#b9bcc2"),
  // Défi Millenium colourways (lacquer + metal, contemporary)
  polBlackChrome: col("Preto Polido & Crómio", "Polished Black & Chrome", "#15171c", "#c9ccd1"),
  navyChrome: col("Azul Marinho & Crómio", "Navy & Chrome", "#1b2a44", "#c9ccd1"),
  matteRedChrome: col("Vermelho Mate & Crómio", "Matte Red & Chrome", "#7d2b27", "#c9ccd1"),
  matteBlackGun: col("Preto Mate & Gun", "Matte Black & Gunmetal", "#15171c", "#4b4f55"),
  pearl: col("Laca Pérola", "Pearl Lacquer", "#ece9e1"),
  nightBlue: col("Laca Azul Noite", "Night Blue Lacquer", "#1a2236"),
  black: col("Preto", "Black", "#15171c"),
  cognac: col("Castanho Cognac", "Cognac Brown", "#7a4a26"),
  navy: col("Azul Marinho", "Navy", "#1b2a44"),
  blackBrown: col("Preto / Castanho", "Black / Brown", "#15171c", "#7a4a26"),
  // Twiggy lacquer colours (same lacquered material across all)
  white: col("Branco", "White", "#f3efe6"),
  skyBlue: col("Azul Céu", "Sky Blue", "#8fb8d8"),
  coral: col("Coral", "Coral", "#e3735e"),
  blue: col("Azul", "Blue", "#2f5c9e"),
  // Slim 7 colours
  red: col("Vermelho", "Red", "#7d2b27"),
  steel: col("Aço", "Steel", "#b9bcc2"),
  goldTone: col("Ouro", "Gold", "#c8a24a"),
  // Gas refill canister colours — colour-coded by compatible model
  gasYellow: col("Amarelo · Ligne 1 / Ligne 2 / Mesa Longa", "Yellow · Ligne 1 / Ligne 2 / Long Table", "#d8b53a"),
  gasBlue: col("Azul · Ligne 8 / Ligne D / D Light / Urban", "Blue · Ligne 8 / Ligne D / D Light / Urban", "#2f5c9e"),
  gasGreen: col("Verde · Ligne 2 Small / Gatsby", "Green · Ligne 2 Small / Gatsby", "#2e8b57"),
  gasRed: col("Vermelho · Mesa Cilíndrica / Jeroboam", "Red · Cylindrical Table / Jeroboam", "#b3322f"),
  gasBlack: col("Preto · Liberté / Maxijet / Minijet / Ligne 2 Torch", "Black · Liberté / Maxijet / Minijet / Ligne 2 Torch", "#1a1c20"),
  gasDefiRed: col("Vermelho · Défi Extrême & XXtrême", "Red · Défi Extrême & XXtrême", "#9e2b27"),
  // Flint (stone) colours — colour-coded by compatible model
  flintBlack: col("Preto · Ligne 1 / Ligne 2 / Gatsby / Mesa Longa", "Black · Ligne 1 / Ligne 2 / Gatsby / Long Table", "#1a1c20"),
  flintRed: col("Vermelho · Liberté / Ligne 8 / Ligne D", "Red · Liberté / Ligne 8 / Ligne D", "#9e2b27"),
};

const fin = (sku: string, pt: string, en: string, priceCents: number): SeedVariant => ({
  sku,
  name: { pt, en },
  priceCents,
  currency: "EUR",
  attributes: { finish: { pt, en } },
});

const clr = (sku: string, c: SeedColor, priceCents: number): SeedVariant => ({
  sku,
  name: c.label,
  priceCents,
  currency: "EUR",
  attributes: { color: c },
});

// Catalogue colourway: each S.T. Dupont reference is its own colourway,
// rendered as a colour swatch with its own catalogue photo.
const cw = (
  sku: string,
  pt: string,
  en: string,
  hex: string[],
  priceCents: number,
  image: string,
): SeedVariant => ({
  sku,
  name: { pt, en },
  priceCents,
  currency: "EUR",
  attributes: { color: { label: { pt, en }, hex } },
  image,
});

// Colourway with no photo yet (placeholder card).
const cn = (
  sku: string,
  pt: string,
  en: string,
  hex: string[],
  priceCents: number,
): SeedVariant => ({
  sku,
  name: { pt, en },
  priceCents,
  currency: "EUR",
  attributes: { color: { label: { pt, en }, hex } },
});

// Twiggy's nine colourways (reused for the Biggy & Slimmy lines).
const TWIGGY_COLOURS: { c: string; pt: string; en: string; hex: string[] }[] = [
  { c: "BLK", pt: "Laca Preta Brilhante & Crómio", en: "Shiny Black Lacquer & Chrome", hex: ["#15171c", "#c9ccd1"] },
  { c: "BLU", pt: "Laca Azul Brilhante & Crómio", en: "Shiny Blue Lacquer & Chrome", hex: ["#2f5c9e", "#c9ccd1"] },
  { c: "FRX", pt: "Fire X · Laca Preta & Crómio", en: "Fire X · Black Lacquer & Chrome", hex: ["#15171c", "#c9ccd1"] },
  { c: "RAS", pt: "Laca Framboesa & Dourado", en: "Raspberry Lacquer & Golden", hex: ["#8e2f4a", "#c8a24a"] },
  { c: "WHT", pt: "Laca Branca & Dourado", en: "White Lacquer & Golden", hex: ["#f3efe6", "#c8a24a"] },
  { c: "BGD", pt: "Laca Preta & Dourado", en: "Black Lacquer & Golden", hex: ["#15171c", "#c8a24a"] },
  { c: "MON", pt: "Monograma 1872 & Dourado", en: "Monogram 1872 & Golden", hex: ["#9a6b2f", "#c8a24a"] },
  { c: "MOC", pt: "Monograma 1872 & Crómio", en: "Monogram 1872 & Chrome", hex: ["#c9ccd1"] },
  { c: "MOB", pt: "Monograma 1872 Preto & Dourado", en: "Black Monogram 1872 & Golden", hex: ["#15171c", "#c8a24a"] },
];

// Monogram 1872 colourways. Most products: 3 colours. LGD: silver/gold/
// black&gold (no red). Cufflinks/money-clip/key-ring: gold & silver only.
const MONO3: { code: string; pt: string; en: string; hex: string[] }[] = [
  { code: "BG", pt: "Preto & Ouro", en: "Black & Gold", hex: ["#15171c", "#c8a24a"] },
  { code: "GC", pt: "Cinza Claro & Crómio", en: "Light Grey & Chrome", hex: ["#b9bcc2", "#c9ccd1"] },
  { code: "RG", pt: "Vermelho & Ouro", en: "Red & Gold", hex: ["#7d2b27", "#c8a24a"] },
];
const MONO_GS: { code: string; pt: string; en: string; hex: string[] }[] = [
  { code: "GLD", pt: "Ouro", en: "Gold", hex: ["#c8a24a"] },
  { code: "SLV", pt: "Prata", en: "Silver", hex: ["#b9bcc2"] },
];
const MONO_DESC = {
  pt: "Edição Monograma 1872 — o motivo emblemático da maison, gravado em toda a peça.",
  en: "Monogram 1872 edition — the maison's emblematic motif, engraved across the piece.",
};

// Colourway with a full photo gallery (front/back/close-ups/open).
const cwg = (
  sku: string,
  pt: string,
  en: string,
  hex: string[],
  priceCents: number,
  images: string[],
): SeedVariant => ({
  sku,
  name: { pt, en },
  priceCents,
  currency: "EUR",
  attributes: { color: { label: { pt, en }, hex } },
  images,
});

// Brief heritage per line — factual, sourced from st-dupont.com and
// specialist references. Products inherit the story of their collection.
export const historyByCollection: Record<string, L> = {
  "Ligne 2": {
    pt: "Apresentado em 1973 e desenvolvido com o joalheiro Jean Dinh Van, o Ligne 2 nasceu de proporções inspiradas na proporção áurea. Chama suave dupla e o inconfundível som cristalino de abertura fizeram dele um dos isqueiros de luxo mais cobiçados do mundo, ainda hoje feito à mão.",
    en: "Introduced in 1973 and developed with jeweller Jean Dinh Van, the Ligne 2 was born from proportions inspired by the golden ratio. A soft double flame and the unmistakable crystalline 'cling' on opening made it one of the world's most coveted luxury lighters — still hand-made today.",
  },
  "Ligne 1": {
    pt: "O primeiro isqueiro de tampa articulada e chama suave da maison, concebido por Lucien Tissot-Dupont e originalmente trabalhado em alumínio. Esguio e clássico, é o antepassado de toda a linha Ligne.",
    en: "The maison's first flip-top, soft-flame lighter, conceived by Lucien Tissot-Dupont and originally crafted in aluminium. Slender and classic, it is the forefather of the entire Ligne family.",
  },
  "Le Grand": {
    pt: "Uma evolução contemporânea de maior porte dos ícones de chama suave da casa, com chama dupla regulável — presença e desempenho para o colecionador moderno.",
    en: "A contemporary, larger-format evolution of the house's soft-flame icons, with an adjustable double flame — presence and performance for the modern collector.",
  },
  "Défi Extreme": {
    pt: "Lançado em 2010 e concebido para o uso exigente — duplo maçarico, corpo resistente ao choque e fiável em condições extremas. A afirmação ousada e desportiva da maison.",
    en: "Launched in 2010 and built for demanding use — double torch flame, shock-resistant body and reliability in extreme conditions. The maison's bold, sporting statement.",
  },
  Twiggy: {
    pt: "Uma nova era para os isqueiros a jato da S.T. Dupont: silhueta ultrafina e alongada em lacas coloridas, inspirada no icónico Ligne 2 e equipada com a tecnologia do Slim 7 e do Megajet.",
    en: "A new era for S.T. Dupont jet lighters: an ultra-slim, elongated silhouette in colourful lacquers, inspired by the iconic Ligne 2 and powered by Slim 7 and Megajet technology.",
  },
  "Slim 7": {
    pt: "Lançado em 2016, um isqueiro minimalista de apenas 7 mm de espessura e chama a jato — portabilidade e estética contemporânea.",
    en: "Launched in 2016, a minimalist lighter just 7 mm thick with a jet flame — portability and contemporary aesthetics.",
  },
  "Line D Eternity": {
    pt: "Da Line D, a coleção de escrita emblemática da maison, reconhecível pela assinatura em brasão no clip. Eternity é a sua expressão premium, em laca e metais preciosos.",
    en: "From Line D, the maison's flagship writing collection, recognisable by the blazon signature on the clip. Eternity is its premium expression, in lacquer and precious metals.",
  },
  Initial: {
    pt: "Anteriormente D-Initial, o ponto de entrada contemporâneo na escrita Dupont — silhueta depurada, equilíbrio de formas e trabalho meticuloso do material.",
    en: "Formerly D-Initial, the contemporary entry to Dupont writing — a sleek silhouette, balanced shapes and meticulous material work.",
  },
  Classique: {
    pt: "Nascida em 1973 do pedido de Jacqueline Kennedy por um instrumento de escrita a condizer com o seu isqueiro S.T. Dupont — a primeira esferográfica de luxo da maison e o início da sua história na escrita.",
    en: "Born in 1973 from Jacqueline Kennedy's request for a writing instrument to match her S.T. Dupont lighter — the maison's first luxury ballpoint and the start of its writing story.",
  },
  "Défi Millenium": {
    pt: "Da família Défi, a coleção que afirmou a audácia criativa da casa na escrita — um desenho fluido que reflete a modernidade.",
    en: "From the Défi family, the collection that asserted the house's creative audacity in writing — a fluid design that reflects modernity.",
  },
  Liberté: {
    pt: "Curvas suaves e voluptuosas que combinam paládio e laca natural — uma demonstração do saber-fazer artesanal da maison.",
    en: "Smooth, voluptuous curves blending palladium and natural lacquer — a showcase of the maison's artisanal know-how.",
  },
  Apex: {
    pt: "Uma linha contemporânea de pequena marroquinaria em pele com curtimenta diamante e costura selada à mão — essenciais modernos no primeiro métier histórico da casa, a pele, desde 1872.",
    en: "A contemporary small-leather line in diamond-tanned leather with hand-sealed stitching — modern essentials in the house's first historic métier, leather, since 1872.",
  },
  "Défi Explorer": {
    pt: "A linha de marroquinaria de viagem e utilidade da maison — peças resistentes em pele e materiais técnicos, levando o espírito Défi à viagem.",
    en: "The maison's travel and utility leather line — resilient pieces in leather and technical materials, carrying the Défi spirit to the journey.",
  },
  Montecristo: {
    pt: "Da colaboração S.T. Dupont × Montecristo, o capítulo L'Aurore assinala os 150 anos da maison (2022) e os 220 anos de Alexandre Dumas, autor de O Conde de Monte Cristo.",
    en: "From the S.T. Dupont × Montecristo collaboration, the L'Aurore chapter marks the maison's 150th anniversary (2022) and the 220th of Alexandre Dumas, author of The Count of Monte Cristo.",
  },
  "Fire X": {
    pt: "Uma coleção inspirada na X-Bag da marroquinaria S.T. Dupont, reinterpretando a icónica ponta de chama nos clássicos da casa.",
    en: "A collection inspired by the X-Bag from S.T. Dupont leather goods, reinterpreting the iconic flame tip across the house's classics.",
  },
  Accessories: {
    pt: "Os detalhes do quotidiano da maison — pele e metal trabalhados com a assinatura S.T. Dupont, extensão do saber-fazer da casa desde 1872.",
    en: "The maison's everyday details — leather and metal crafted with the S.T. Dupont signature, an extension of the house's savoir-faire since 1872.",
  },
  "Refill & Stones": {
    pt: "A S.T. Dupont serve os seus objetos para toda a vida: gás e pedras de sílex codificados por cor consoante o modelo, para que cada isqueiro mantenha a chama e a faísca perfeitas durante décadas.",
    en: "S.T. Dupont services its objects for life: gas and flints colour-coded by model, so every lighter keeps its perfect flame and spark for decades.",
  },
};

export const products: SeedProduct[] = [
  // --- Isqueiros / Lighters — FINISH only ---
  {
    slug: "ligne-2",
    name: { pt: "Ligne 2", en: "Ligne 2" },
    collection: "Ligne 2",
    description: {
      pt: "O isqueiro emblemático da maison, desenhado com o joalheiro Jean Dinh Van — silhueta retangular intemporal e o inconfundível som cristalino de abertura.",
      en: "The maison's iconic lighter, designed with jeweller Jean Dinh Van — a timeless rectangular silhouette and the unmistakable crystalline 'cling' on opening.",
    },
    categorySlug: "isqueiros",
    image: "/products/ligne-2/C16601N.jpg",
    novelty: true,
    variants: [
      cw("C16601N", "Preto Mate & Ouro", "Matt Black & Yellow Gold", ["#15171c", "#c8a24a"], 139000, "/products/ligne-2/C16601N.jpg"),
      cw("C16457N", "Laca Azul & Ouro", "Blue Lacquer & Yellow Gold", ["#1f3c66", "#c8a24a"], 139000, "/products/ligne-2/C16457N.jpg"),
      cw("C16602N", "Preto Mate & Paládio", "Matt Black & Palladium", ["#15171c", "#b9bcc2"], 129000, "/products/ligne-2/C16602N.jpg"),
      cw("C16134N", "Atelier Azul Marinho & Ouro", "Atelier Navy Blue & Yellow Gold", ["#1b2a44", "#c8a24a"], 149000, "/products/ligne-2/C16134N.jpg"),
      cw("C16296N", "Laca Preta & Paládio", "Black Lacquer & Palladium", ["#15171c", "#b9bcc2"], 129000, "/products/ligne-2/C16296N.jpg"),
      cw("C16884N", "Laca Preta & Ouro", "Black Lacquer & Yellow Gold", ["#15171c", "#c8a24a"], 139000, "/products/ligne-2/C16884N.jpg"),
      cw("C16184N", "Paládio", "Palladium", ["#b9bcc2"], 119000, "/products/ligne-2/C16184N.jpg"),
      cw("C16284N", "Ouro Amarelo", "Yellow Gold", ["#c8a24a"], 178000, "/products/ligne-2/C16284N.jpg"),
      cw("C16424N", "Ouro Rosa", "Pink Gold", ["#d6a191"], 178000, "/products/ligne-2/C16424N.jpg"),
      cw("C16455N", "Paládio Ponta de Diamante", "Diamond Head Palladium", ["#b9bcc2"], 126000, "/products/ligne-2/C16455N.jpg"),
      cw("C16817N", "Paládio Linhas", "Lined Palladium", ["#b9bcc2"], 126000, "/products/ligne-2/C16817N.jpg"),
      cw("C16827N", "Ouro Amarelo Linhas", "Lined Yellow Gold", ["#c8a24a"], 178000, "/products/ligne-2/C16827N.jpg"),
    ],
  },
  {
    slug: "ligne-1",
    name: { pt: "Ligne 1", en: "Ligne 1" },
    collection: "Ligne 1",
    description: {
      pt: "O desenho clássico da casa, esguio e elegante, fiel às origens da assinatura Dupont.",
      en: "The house's classic, slender and elegant design, faithful to the origins of the Dupont signature.",
    },
    categorySlug: "isqueiros",
    image: "/products/ligne-1/C14120.jpg",
    variants: [
      cw("C14120", "Laca Preta & Ouro", "Black Lacquer & Yellow Gold", ["#15171c", "#c8a24a"], 109000, "/products/ligne-1/C14120.jpg"),
      cw("C14121", "Laca Preta & Paládio", "Black Lacquer & Palladium", ["#15171c", "#b9bcc2"], 99000, "/products/ligne-1/C14121.jpg"),
      cw("C14020", "Ouro Amarelo", "Yellow Gold", ["#c8a24a"], 119000, "/products/ligne-1/C14020.jpg"),
      cw("C14021", "Paládio", "Palladium", ["#b9bcc2"], 99000, "/products/ligne-1/C14021.jpg"),
    ],
  },
  {
    slug: "le-grand-dupont",
    name: { pt: "Le Grand Dupont", en: "Le Grand Dupont" },
    collection: "Le Grand",
    description: {
      pt: "Formato premium de maior porte, com chama dupla regulável — presença e desempenho.",
      en: "Premium larger format with an adjustable double flame — presence and performance.",
    },
    categorySlug: "isqueiros",
    image: "/products/le-grand-dupont/C23010N/front.jpg",
    novelty: true,
    variants: [
      cw("C23780CL", "Laca Preta Brilhante & Paládio", "Shiny Black Lacquer & Palladium", ["#15171c", "#b9bcc2"], 169000, "/products/le-grand-dupont/C23780CL.jpg"),
      cw("C23790CL", "Laca Preta Brilhante & Ouro", "Shiny Black Lacquer & Yellow Gold", ["#15171c", "#c8a24a"], 189000, "/products/le-grand-dupont/C23790CL.jpg"),
      cwg("C23010N", "Laca Preta & Paládio", "Black Lacquer & Palladium", ["#15171c", "#b9bcc2"], 169000, [
        "/products/le-grand-dupont/C23010N/front.jpg",
        "/products/le-grand-dupont/C23010N/back.jpg",
        "/products/le-grand-dupont/C23010N/closeup.jpg",
        "/products/le-grand-dupont/C23010N/open.jpg",
      ]),
      cwg("C23013N", "Laca Azul Sunburst & Paládio", "Sunburst Blue Lacquer & Palladium", ["#1f3c66", "#b9bcc2"], 175000, [
        "/products/le-grand-dupont/C23013N/front.jpg",
        "/products/le-grand-dupont/C23013N/back.jpg",
        "/products/le-grand-dupont/C23013N/closeup.jpg",
        "/products/le-grand-dupont/C23013N/closeup2.jpg",
        "/products/le-grand-dupont/C23013N/open.jpg",
      ]),
      cwg("C23009N", "Ponta de Diamante Ouro", "Diamond Head Yellow Gold", ["#c8a24a"], 198000, [
        "/products/le-grand-dupont/C23009N/front.jpg",
        "/products/le-grand-dupont/C23009N/back.jpg",
        "/products/le-grand-dupont/C23009N/closeup.jpg",
        "/products/le-grand-dupont/C23009N/open.jpg",
      ]),
      cwg("C23011N", "Ponta de Diamante Paládio", "Diamond Head Palladium", ["#b9bcc2"], 178000, [
        "/products/le-grand-dupont/C23011N/front.jpg",
        "/products/le-grand-dupont/C23011N/back.jpg",
        "/products/le-grand-dupont/C23011N/closeup.jpg",
        "/products/le-grand-dupont/C23011N/open.jpg",
      ]),
    ],
  },
  {
    slug: "defi-extreme",
    name: { pt: "Défi Extreme", en: "Défi Extreme" },
    collection: "Défi Extreme",
    description: {
      pt: "Chama tempestade de duplo maçarico, resistente ao vento. Robustez e atitude.",
      en: "Wind-resistant double-torch flame. Strength and attitude.",
    },
    categorySlug: "isqueiros",
    image: null,
    variants: [fin("DX-GUN", "Metal Gun", "Gunmetal", 56000), fin("DX-CARB", "Fibra de Carbono", "Carbon Fibre", 62000)],
  },
  {
    slug: "twiggy",
    name: { pt: "Twiggy", en: "Twiggy" },
    collection: "Twiggy",
    description: {
      pt: "Silhueta ultrafina inspirada na moda mod dos anos 60 — o Ligne 2 reinventado para o bolso moderno. Mesmo corpo lacado, várias cores.",
      en: "Ultra-slim silhouette inspired by 1960s mod fashion — the Ligne 2 reinvented for the modern pocket. Same lacquered body, multiple colours.",
    },
    categorySlug: "isqueiros",
    image: "/products/twiggy/030111.jpg",
    novelty: true,
    variants: [
      cw("030111", "Laca Preta Brilhante & Crómio", "Shiny Black Lacquer & Chrome", ["#15171c", "#c9ccd1"], 32000, "/products/twiggy/030111.jpg"),
      cw("030115", "Laca Azul Brilhante & Crómio", "Shiny Blue Lacquer & Chrome", ["#2f5c9e", "#c9ccd1"], 32000, "/products/twiggy/030115.jpg"),
      cw("030177", "Fire X · Laca Preta & Crómio", "Fire X · Black Lacquer & Chrome", ["#15171c", "#c9ccd1"], 35000, "/products/twiggy/030177.jpg"),
      cw("030030", "Laca Framboesa & Dourado", "Raspberry Lacquer & Golden", ["#8e2f4a", "#c8a24a"], 33000, "/products/twiggy/030030.jpg"),
      cw("030031", "Laca Branca & Dourado", "White Lacquer & Golden", ["#f3efe6", "#c8a24a"], 33000, "/products/twiggy/030031.jpg"),
      cw("030112", "Laca Preta & Dourado", "Black Lacquer & Golden", ["#15171c", "#c8a24a"], 33000, "/products/twiggy/030112.jpg"),
      cw("030078", "Monograma 1872 & Dourado", "Monogram 1872 & Golden", ["#9a6b2f", "#c8a24a"], 36000, "/products/twiggy/030078.jpg"),
      cw("030080", "Monograma 1872 & Crómio", "Monogram 1872 & Chrome", ["#c9ccd1"], 35000, "/products/twiggy/030080.jpg"),
      cw("030079", "Monograma 1872 Preto & Dourado", "Black Monogram 1872 & Golden", ["#15171c", "#c8a24a"], 36000, "/products/twiggy/030079.jpg"),
    ],
  },
  {
    slug: "slim-7",
    name: { pt: "Slim 7", en: "Slim 7" },
    collection: "Slim 7",
    description: {
      pt: "Maçarico esguio de chama jato. Várias cores e acabamentos — laca brilhante, mate, metal escovado ou polido.",
      en: "Slim jet-flame torch. Multiple colours and finishes — glossy lacquer, matte, brushed or polished metal.",
    },
    categorySlug: "isqueiros",
    image: "/products/slim-7/027700.jpg",
    variants: [
      cw("027700", "Preto & Crómio", "Black & Chrome", ["#15171c", "#c9ccd1"], 23000, "/products/slim-7/027700.jpg"),
      cw("027710", "Preto Mate & Crómio Escovado", "Matt Black & Brushed Chrome", ["#15171c", "#b9bcc2"], 24000, "/products/slim-7/027710.jpg"),
      cw("027707", "Vermelho Lótus & PVD Dourado", "Lotus Red & Golden PVD", ["#7d2b27", "#c8a24a"], 27000, "/products/slim-7/027707.jpg"),
      cw("027708", "Preto & PVD Dourado", "Black & Golden PVD", ["#15171c", "#c8a24a"], 26000, "/products/slim-7/027708.jpg"),
    ],
  },

  // --- Escrita / Writing — TYPE × COLOUR ---
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
    // 2 colourways × 3 pen types × 3 sizes (Medium/Large/XL). Photos are per
    // colour×type (size doesn't change the photo) at
    // /products/line-d-eternity/LDE-<type>-<code>/.
    variants: (() => {
      const cols = [
        { code: "BC", c: col("Preto & Crómio", "Black & Chrome", "#15171c", "#c9ccd1") },
        { code: "BLC", c: col("Azul & Crómio", "Blue & Chrome", "#1f3c66", "#c9ccd1") },
      ];
      const types = [
        { key: "FP" as const, price: 138000 },
        { key: "RB" as const, price: 92000 },
        { key: "BP" as const, price: 78000 },
      ];
      const sizes = [
        { code: "M", label: { pt: "Médio", en: "Medium" }, mult: 1 },
        { code: "L", label: { pt: "Grande", en: "Large" }, mult: 1.15 },
        { code: "XL", label: { pt: "XL", en: "XL" }, mult: 1.3 },
      ];
      const out: SeedVariant[] = [];
      for (const t of types) {
        const ty = TYPE[t.key];
        for (const cc of cols) {
          const dir = `/products/line-d-eternity/LDE-${t.key}-${cc.code}`;
          const images = [`${dir}/front.jpg`, `${dir}/back.jpg`, `${dir}/closeup.jpg`, `${dir}/closeup2.jpg`];
          for (const s of sizes) {
            out.push({
              sku: `LDE-${t.key}-${cc.code}-${s.code}`,
              name: {
                pt: `${ty.pt} · ${cc.c.label.pt} · ${s.label.pt}`,
                en: `${ty.en} · ${cc.c.label.en} · ${s.label.en}`,
              },
              priceCents: Math.round((t.price * s.mult) / 1000) * 1000,
              currency: "EUR" as const,
              attributes: { type: ty, color: cc.c, size: s.label },
              images,
            });
          }
        }
      }
      return out;
    })(),
  },
  {
    slug: "initial",
    name: { pt: "Initial", en: "Initial" },
    collection: "Initial",
    description: {
      pt: "O ponto de entrada na escrita Dupont — equilíbrio e traço fluido, laca e metal.",
      en: "The entry point to Dupont writing — balance and a fluid stroke, lacquer and metal.",
    },
    categorySlug: "escrita",
    image: null,
    // Real catalogue lineup — each pen type carries its own colourway set
    // (cross-checked against the supplied photos). SKU = INI-<type>-<code>,
    // photo on disk = /products/initial/<SKU>.jpg.
    variants: (() => {
      // Full matrix: 6 colourways × 3 pen types, each with a 4-photo gallery
      // [front, back, close-up, close-up 2] at /products/initial/<sku>/.
      const C = {
        BG: COLOR.blackGold,
        NC: COLOR.blackChrome, // "Noir & Chrome"
        BMB: COLOR.blackMatt,
        BluC: COLOR.blueChrome,
        CHR: COLOR.chrome,
        WG: COLOR.whiteGold,
      } as const;
      const codes = ["BG", "NC", "BMB", "BluC", "CHR", "WG"] as const;
      const types = [
        { key: "BP" as const, price: 23000 },
        { key: "RB" as const, price: 25000 },
        { key: "FP" as const, price: 32500 },
      ];
      // Combinations that don't exist / were withdrawn.
      const skip = new Set(["FP-BluC"]);
      const out: SeedVariant[] = [];
      for (const t of types) {
        const ty = TYPE[t.key];
        for (const code of codes) {
          if (skip.has(`${t.key}-${code}`)) continue;
          const c = C[code];
          const sku = `INI-${t.key}-${code}`;
          const dir = `/products/initial/${sku}`;
          out.push({
            sku,
            name: { pt: `${ty.pt} · ${c.label.pt}`, en: `${ty.en} · ${c.label.en}` },
            priceCents: t.price,
            currency: "EUR" as const,
            attributes: { type: ty, color: c },
            images: [`${dir}/front.jpg`, `${dir}/back.jpg`, `${dir}/closeup.jpg`, `${dir}/closeup2.jpg`],
          });
        }
      }
      return out;
    })(),
  },
  {
    slug: "classique",
    name: { pt: "Classique", en: "Classique" },
    collection: "Classique",
    description: {
      pt: "Mais de 50 anos após o lançamento, a S.T. Dupont reinventa o primeiro instrumento de escrita de luxo da história — criado para Jackie Kennedy. Corpo facetado ou guilhoché, proporções «número de ouro», agora unissexo e ergonómico.",
      en: "Over 50 years after its launch, S.T. Dupont reinvents the first ever luxury writing instrument — created for Jackie Kennedy. Faceted or guilloché barrel, «golden ratio» proportions, now unisex and ergonomic.",
    },
    categorySlug: "escrita",
    image: null,
    // Ballpoint only (rollerball & fountain pen retired). 5 colourways, each
    // with a 4-photo gallery [front, back, close-up, close-up 2]. Names match
    // the supplied photo folders. SKU = 045<finish>N.
    variants: (() => {
      const BP = { pt: "Esferográfica", en: "Ballpoint" };
      const finishes = [
        { s: "075N", label: { pt: "Paládio Escovado", en: "Brushed Palladium" }, hex: ["#b9bcc2"] },
        { s: "076N", label: { pt: "Laca Preta Brilhante & Ouro", en: "Shiny Black Lacquer & Gold" }, hex: ["#15171c", "#c8a24a"] },
        { s: "077N", label: { pt: "Laca Azul Brilhante & Crómio", en: "Shiny Blue Lacquer & Chrome" }, hex: ["#1f3c66", "#c9ccd1"] },
        { s: "078N", label: { pt: "Ouro Amarelo", en: "Yellow Gold" }, hex: ["#c8a24a"] },
        { s: "079N", label: { pt: "Guilhoché Oblíquo Prateado", en: "Silver Oblique Guilloche" }, hex: ["#b9bcc2"] },
      ];
      return finishes.map((f) => {
        const sku = `045${f.s}`;
        const dir = `/products/classique/${sku}`;
        return {
          sku,
          name: { pt: `${BP.pt} · ${f.label.pt}`, en: `${BP.en} · ${f.label.en}` },
          priceCents: 33000,
          currency: "EUR" as const,
          attributes: { type: BP, color: { label: f.label, hex: f.hex } },
          images: [`${dir}/front.jpg`, `${dir}/back.jpg`, `${dir}/closeup.jpg`, `${dir}/closeup2.jpg`],
        };
      });
    })(),
  },
  {
    slug: "defi-millenium",
    name: { pt: "Défi Millenium", en: "Défi Millenium" },
    collection: "Défi Millenium",
    description: {
      pt: "Carácter desportivo inspirado nos automóveis de competição — laca e metal, para escrever com presença. Esferográfica, rollerball e caneta de tinta permanente.",
      en: "Sporting character inspired by racing cars — lacquer and metal, to write with presence. Ballpoint, rollerball and fountain pen.",
    },
    categorySlug: "escrita",
    image: null,
    novelty: true,
    // Colourway photos: folder galleries take priority; where a colour×type
    // has no folder photo we fall back to the existing flat site image; with
    // neither, the combination is dropped. Folder gallery =
    // /products/defi-millenium/<SKU>/{front,back,closeup,closeup2}.jpg ;
    // site image = /products/defi-millenium/<SKU>.jpg.
    variants: (() => {
      const C = {
        NVC: col("Laca Azul Marinho Brilhante & Crómio", "Shiny Navy Lacquer & Chrome", "#1b2a44", "#c9ccd1"),
        SBC: col("Laca Preta Brilhante & Crómio", "Shiny Black Lacquer & Chrome", "#15171c", "#c9ccd1"),
        SBG: col("Laca Preta Brilhante & Gunmetal", "Shiny Black Lacquer & Gunmetal", "#15171c", "#4b4f55"),
        BMB: col("Preto & Preto Mate", "Black & Matt Black", "#15171c", "#2a2c30"),
        MRC: col("Vermelho Mate & Crómio", "Matt Red & Chrome", "#7d2b27", "#c9ccd1"),
        MBBC: col("Preto Mate & Crómio Escovado", "Matt Black & Brushed Chrome", "#1c1e22", "#b9bcc2"),
      } as const;
      const price: Record<string, number> = { BP: 38500, RB: 38500, FP: 43500 };
      // [code, type, source]; "f" = folder gallery, "w" = flat site image.
      const plan: [keyof typeof C, "BP" | "RB" | "FP", "f" | "w"][] = [
        ["NVC", "BP", "w"], ["NVC", "FP", "f"], ["NVC", "RB", "f"],
        ["SBC", "BP", "w"], ["SBC", "FP", "w"], ["SBC", "RB", "w"],
        ["SBG", "BP", "w"], ["SBG", "FP", "w"], ["SBG", "RB", "w"],
        ["BMB", "BP", "f"], ["BMB", "RB", "f"],
        ["MRC", "FP", "f"], ["MRC", "RB", "f"],
        ["MBBC", "BP", "f"], ["MBBC", "FP", "f"], ["MBBC", "RB", "f"],
      ];
      return plan.map(([code, key, src]) => {
        const ty = TYPE[key];
        const c = C[code];
        const sku = `DM-${key}-${code}`;
        const dir = `/products/defi-millenium/${sku}`;
        return {
          sku,
          name: { pt: `${ty.pt} · ${c.label.pt}`, en: `${ty.en} · ${c.label.en}` },
          priceCents: price[key],
          currency: "EUR" as const,
          attributes: { type: ty, color: c },
          images:
            src === "f"
              ? [`${dir}/front.jpg`, `${dir}/back.jpg`, `${dir}/closeup.jpg`, `${dir}/closeup2.jpg`]
              : [`${dir}.jpg`],
        };
      });
    })(),
  },
  {
    slug: "liberte",
    name: { pt: "Liberté", en: "Liberté" },
    collection: "Liberté",
    description: {
      pt: "A linha emblemática reinventada em 2023 com proporções mais esguias e a nova agrafe «Épée», também presente no Line D Eternity. Elegância, requinte feminino e o savoir-faire excecional da S.T. Dupont.",
      en: "The iconic line reinvented in 2023 with a sleeker silhouette and the new «Sword» clip, also featured on Line D Eternity. Elegance, feminine refinement and S.T. Dupont's exceptional craftsmanship.",
    },
    categorySlug: "escrita",
    image: null,
    // Colourways from the supplied photos; each colour×type has a 4-photo
    // gallery at /products/liberte/LIB-<type>-<code>/. Only photographed
    // combinations are listed (some colours are ballpoint-only). No sizes.
    variants: (() => {
      const cols = [
        { code: "IBG", c: col("Laca Azul Índigo & Ouro", "Indigo Blue Lacquer & Gold", "#1f3c66", "#c8a24a"), types: ["BP"] },
        { code: "SBG", c: col("Laca Preta Brilhante & Ouro", "Shiny Black Lacquer & Gold", "#15171c", "#c8a24a"), types: ["BP", "RB", "FP"] },
        { code: "SBP", c: col("Laca Preta Brilhante & Paládio", "Shiny Black Lacquer & Palladium", "#15171c", "#b9bcc2"), types: ["BP", "RB", "FP"] },
        { code: "WG", c: col("Laca Branca & Ouro", "White Lacquer & Gold", "#f3efe6", "#c8a24a"), types: ["BP"] },
        { code: "WRG", c: col("Laca Branca & Ouro Rosa", "White Lacquer & Rose Gold", "#f3efe6", "#d6a191"), types: ["BP", "RB", "FP"] },
      ];
      const price: Record<string, number> = { BP: 78000, RB: 92000, FP: 138000 };
      const out: SeedVariant[] = [];
      for (const cc of cols) {
        for (const tk of cc.types) {
          const ty = TYPE[tk as keyof typeof TYPE];
          const dir = `/products/liberte/LIB-${tk}-${cc.code}`;
          out.push({
            sku: `LIB-${tk}-${cc.code}`,
            name: { pt: `${ty.pt} · ${cc.c.label.pt}`, en: `${ty.en} · ${cc.c.label.en}` },
            priceCents: price[tk],
            currency: "EUR" as const,
            attributes: { type: ty, color: cc.c },
            images: [`${dir}/front.jpg`, `${dir}/back.jpg`, `${dir}/closeup.jpg`, `${dir}/closeup2.jpg`],
          });
        }
      }
      return out;
    })(),
  },

  // --- Pele / Leather — COLOUR only ---
  {
    slug: "apex-wallet",
    name: { pt: "Carteira Apex", en: "Apex Wallet" },
    collection: "Apex",
    description: { pt: "Pele com curtimenta diamante, costura selada à mão. Linha contemporânea Apex.", en: "Diamond-tanned leather, hand-sealed stitching. The contemporary Apex line." },
    categorySlug: "pele",
    image: null,
    novelty: true,
    variants: [clr("AW-BLK", COLOR.black, 34000), clr("AW-COG", COLOR.cognac, 34000)],
  },
  {
    slug: "apex-card-holder",
    name: { pt: "Porta-Cartões Apex", en: "Apex Card Holder" },
    collection: "Apex",
    description: { pt: "Compacto, essencial, irrepreensível.", en: "Compact, essential, impeccable." },
    categorySlug: "pele",
    image: null,
    variants: [clr("AC-BLK", COLOR.black, 16500), clr("AC-NVY", COLOR.navy, 16500)],
  },
  {
    slug: "defi-explorer-document-holder",
    name: { pt: "Porta-Documentos Défi Explorer", en: "Défi Explorer Document Holder" },
    collection: "Défi Explorer",
    description: { pt: "Uma pasta esguia e resistente, da linha de viagem Défi Explorer.", en: "A slim, resilient portfolio from the Défi Explorer travel line." },
    categorySlug: "pele",
    image: null,
    variants: [clr("DD-BLK", COLOR.black, 96000)],
  },
  {
    slug: "defi-explorer-backpack",
    name: { pt: "Mochila Défi Explorer", en: "Défi Explorer Backpack" },
    collection: "Défi Explorer",
    description: { pt: "Funcional e elegante, pele e tecido técnico para o quotidiano exigente.", en: "Functional and elegant, leather and technical fabric for demanding days." },
    categorySlug: "pele",
    image: null,
    novelty: true,
    variants: [clr("DB-BLK", COLOR.black, 119000)],
  },

  // --- Acessórios / Accessories — mixed (each only its own axis) ---
  {
    slug: "cufflinks-montecristo-aurore",
    name: { pt: "Botões de Punho Montecristo l’Aurore", en: "Montecristo l’Aurore Cufflinks" },
    collection: "Montecristo",
    description: { pt: "Latão maciço com banho de paládio e detalhe em laca, da coleção Montecristo.", en: "Solid brass with palladium plating and a lacquer detail, from the Montecristo collection." },
    categorySlug: "acessorios",
    image: null,
    novelty: true,
    variants: [fin("CL-AUR", "Paládio & Laca", "Palladium & Lacquer", 24000)],
  },
  {
    slug: "money-clip",
    name: { pt: "Clip de Notas", en: "Money Clip" },
    collection: "Accessories",
    description: { pt: "Simplicidade afiada, com a assinatura gravada da maison.", en: "Sharp simplicity, with the maison's engraved signature." },
    categorySlug: "acessorios",
    image: null,
    variants: [fin("MC-CHR", "Crómio Polido", "Polished Chrome", 18000)],
  },
  {
    slug: "key-ring",
    name: { pt: "Porta-Chaves", en: "Key Ring" },
    collection: "Accessories",
    description: { pt: "Pele e metal, o detalhe que acompanha todos os dias.", en: "Leather and metal, the detail that accompanies every day." },
    categorySlug: "acessorios",
    image: null,
    variants: [clr("KR-BLK", COLOR.black, 9500)],
  },
  {
    slug: "cigar-cutter-fire-x",
    name: { pt: "Cortador de Charutos Fire X", en: "Fire X Cigar Cutter" },
    collection: "Fire X",
    description: { pt: "Corte guilhotina preciso, da coleção Fire X.", en: "Precise guillotine cut, from the Fire X collection." },
    categorySlug: "acessorios",
    image: null,
    novelty: true,
    variants: [fin("CC-FX", "Aço & Laca", "Steel & Lacquer", 21000)],
  },
  {
    slug: "cigar-case",
    name: { pt: "Estojo de Charutos", en: "Cigar Case" },
    collection: "Accessories",
    description: {
      pt: "Estojo em pele de vitela para charutos, interior em cedro, costura selada à mão.",
      en: "Calfskin cigar case with a cedar-lined interior and hand-sealed stitching.",
    },
    categorySlug: "acessorios",
    image: null,
    variants: [clr("CG-BLK", COLOR.black, 34000), clr("CG-COG", COLOR.cognac, 34000)],
  },
  {
    slug: "ashtray-fire-x",
    name: { pt: "Cinzeiro Fire X", en: "Fire X Ashtray" },
    collection: "Fire X",
    description: {
      pt: "Cinzeiro em porcelana com decoração da coleção Fire X — uma peça de mesa de exceção.",
      en: "Porcelain ashtray with Fire X collection artwork — an exceptional table piece.",
    },
    categorySlug: "acessorios",
    image: null,
    novelty: true,
    variants: [fin("AT-FX", "Porcelana & Laca", "Porcelain & Lacquer", 42000)],
  },
  {
    slug: "humidor",
    name: { pt: "Humidor", en: "Humidor" },
    collection: "Accessories",
    description: {
      pt: "Humidor em madeira preciosa e laca, com higrómetro e humidificador — conservação perfeita.",
      en: "Precious-wood and lacquer humidor with hygrometer and humidifier — perfect conservation.",
    },
    categorySlug: "acessorios",
    image: null,
    variants: [fin("HM-LAC", "Madeira & Laca", "Wood & Lacquer", 190000)],
  },
  {
    slug: "belt",
    name: { pt: "Cinto", en: "Belt" },
    collection: "Accessories",
    description: { pt: "Pele de vitela com fivela gravada da maison, reversível.", en: "Calfskin with the maison's engraved buckle, reversible." },
    categorySlug: "acessorios",
    image: null,
    variants: [clr("BT-REV", COLOR.blackBrown, 28000)],
  },
  {
    slug: "tie-clip",
    name: { pt: "Mola de Gravata", en: "Tie Clip" },
    collection: "Accessories",
    description: { pt: "Linha precisa em paládio, com a assinatura Dupont.", en: "A precise line in palladium, with the Dupont signature." },
    categorySlug: "acessorios",
    image: null,
    variants: [fin("TC-PALL", "Paládio", "Palladium", 16000)],
  },
  {
    slug: "gas-refill",
    name: { pt: "Recarga de Gás", en: "Gas Refill" },
    collection: "Refill & Stones",
    description: {
      pt: "Gás de alta qualidade S.T. Dupont. A cor da recarga é codificada por modelo — escolha a que corresponde ao seu isqueiro.",
      en: "High-quality S.T. Dupont gas. The refill colour is colour-coded by model — choose the one matching your lighter.",
    },
    categorySlug: "acessorios",
    image: null,
    variants: [
      clr("GR-YEL", COLOR.gasYellow, 2000),
      clr("GR-BLU", COLOR.gasBlue, 2000),
      clr("GR-GRN", COLOR.gasGreen, 2000),
      clr("GR-RED", COLOR.gasRed, 2000),
      clr("GR-BLK", COLOR.gasBlack, 1500),
      clr("GR-DEF", COLOR.gasDefiRed, 1500),
    ],
  },
  {
    slug: "stones",
    name: { pt: "Pedras (Sílex)", en: "Stones (Flints)" },
    collection: "Refill & Stones",
    description: {
      pt: "Caixa de 8 pedras de sílex S.T. Dupont. Tal como o gás, a cor é codificada por modelo — substituição essencial para uma faísca perfeita.",
      en: "Box of 8 S.T. Dupont flints. Like the gas, the colour is model-coded — an essential replacement for a perfect spark.",
    },
    categorySlug: "acessorios",
    image: null,
    novelty: true,
    variants: [clr("ST-BLK", COLOR.flintBlack, 300), clr("ST-RED", COLOR.flintRed, 300)],
  },

  // === Smoking accessories (extra items so each type has >= 2) ===
  {
    slug: "cigar-cutter-v",
    name: { pt: "Cortador de Charutos em V", en: "V-Cut Cigar Cutter" },
    collection: "Accessories",
    description: { pt: "Corte em V profundo e limpo, em aço inoxidável com acabamento lacado.", en: "A deep, clean V-cut in stainless steel with a lacquered finish." },
    categorySlug: "acessorios",
    image: null,
    variants: [fin("CCV-STL", "Aço & Laca Preta", "Steel & Black Lacquer", 19000)],
  },
  {
    slug: "cigar-case-double",
    name: { pt: "Estojo de Charutos Duplo", en: "Double Cigar Case" },
    collection: "Accessories",
    description: { pt: "Estojo em pele de vitela para dois charutos, interior em cedro.", en: "Calfskin case for two cigars with a cedar-lined interior." },
    categorySlug: "acessorios",
    image: null,
    variants: [clr("CGD-BLK", COLOR.black, 39000), clr("CGD-COG", COLOR.cognac, 39000)],
  },
  {
    slug: "ashtray-porcelain",
    name: { pt: "Cinzeiro de Porcelana", en: "Porcelain Ashtray" },
    collection: "Accessories",
    description: { pt: "Cinzeiro de mesa em porcelana branca com filete dourado.", en: "White porcelain table ashtray with a gilded rim." },
    categorySlug: "acessorios",
    image: null,
    variants: [fin("ATP-POR", "Porcelana & Ouro", "Porcelain & Gold", 32000)],
  },
  {
    slug: "humidor-travel",
    name: { pt: "Humidor de Viagem", en: "Travel Humidor" },
    collection: "Accessories",
    description: { pt: "Humidor de viagem em pele com interior em cedro para até cinco charutos.", en: "Leather travel humidor with a cedar interior for up to five cigars." },
    categorySlug: "acessorios",
    image: null,
    variants: [clr("HMT-BLK", COLOR.black, 95000), clr("HMT-COG", COLOR.cognac, 95000)],
  },

  // === Writing accessories ===
  {
    slug: "pen-case-single",
    name: { pt: "Estojo para 1 Caneta", en: "Single Pen Case" },
    collection: "Accessories",
    description: { pt: "Estojo em pele para uma caneta, forro em camurça.", en: "Leather case for one pen, suede-lined." },
    categorySlug: "acessorios",
    image: null,
    variants: [clr("PC1-BLK", COLOR.black, 19000), clr("PC1-COG", COLOR.cognac, 19000)],
  },
  {
    slug: "pen-case-double",
    name: { pt: "Estojo para 2 Canetas", en: "Two-Pen Case" },
    collection: "Accessories",
    description: { pt: "Estojo em pele para duas canetas, forro em camurça.", en: "Leather case for two pens, suede-lined." },
    categorySlug: "acessorios",
    image: null,
    variants: [clr("PC2-BLK", COLOR.black, 26000), clr("PC2-NVY", COLOR.navy, 26000)],
  },
  {
    slug: "desk-blotter",
    name: { pt: "Mata-Borrão de Secretária", en: "Desk Blotter" },
    collection: "Accessories",
    description: { pt: "Mata-borrão em pele para a secretária, cantos reforçados.", en: "Leather desk blotter with reinforced corners." },
    categorySlug: "acessorios",
    image: null,
    variants: [clr("DSK-BLK", COLOR.black, 42000)],
  },
  {
    slug: "pen-tray",
    name: { pt: "Bandeja para Canetas", en: "Pen Tray" },
    collection: "Accessories",
    description: { pt: "Bandeja em pele e metal para instrumentos de escrita.", en: "Leather-and-metal tray for writing instruments." },
    categorySlug: "acessorios",
    image: null,
    variants: [fin("PT-LEA", "Pele & Metal", "Leather & Metal", 28000)],
  },
  {
    slug: "notebook-a5",
    name: { pt: "Caderno A5", en: "A5 Notebook" },
    collection: "Accessories",
    description: { pt: "Caderno A5 com capa em pele, recarregável.", en: "A5 notebook with a refillable leather cover." },
    categorySlug: "acessorios",
    image: null,
    variants: [clr("NBA-BLK", COLOR.black, 9500), clr("NBA-NVY", COLOR.navy, 9500)],
  },
  {
    slug: "notebook-pocket",
    name: { pt: "Caderno de Bolso", en: "Pocket Notebook" },
    collection: "Accessories",
    description: { pt: "Caderno de bolso com capa em pele de vitela.", en: "Pocket notebook with a calfskin cover." },
    categorySlug: "acessorios",
    image: null,
    variants: [clr("NBP-BLK", COLOR.black, 6500), clr("NBP-COG", COLOR.cognac, 6500)],
  },
  {
    slug: "ink-bottle",
    name: { pt: "Frasco de Tinta", en: "Ink Bottle" },
    collection: "Accessories",
    description: { pt: "Frasco de tinta S.T. Dupont para canetas de tinta permanente.", en: "S.T. Dupont ink bottle for fountain pens." },
    categorySlug: "acessorios",
    image: null,
    variants: [fin("INK-BLK", "Tinta Preta", "Black Ink", 2500), fin("INK-BLU", "Tinta Azul", "Blue Ink", 2500)],
  },
  {
    slug: "rollerball-refill",
    name: { pt: "Recargas Rollerball", en: "Rollerball Refills" },
    collection: "Accessories",
    description: { pt: "Conjunto de recargas para rollerball S.T. Dupont.", en: "Set of S.T. Dupont rollerball refills." },
    categorySlug: "acessorios",
    image: null,
    variants: [fin("RBR-BLK", "Preto", "Black", 1500), fin("RBR-BLU", "Azul", "Blue", 1500)],
  },

  // === Leather — bags ===
  {
    slug: "travel-bag",
    name: { pt: "Mala de Viagem", en: "Travel Bag" },
    collection: "Défi Explorer",
    description: { pt: "Mala de viagem em pele e tecido técnico, da linha Défi Explorer.", en: "Travel bag in leather and technical fabric, from the Défi Explorer line." },
    categorySlug: "pele",
    image: null,
    novelty: true,
    variants: [clr("TB-BLK", COLOR.black, 145000)],
  },
  {
    slug: "weekend-bag",
    name: { pt: "Saco de Fim de Semana", en: "Weekend Bag" },
    collection: "Défi Explorer",
    description: { pt: "Saco amplo para escapadas curtas, pele granulada.", en: "Roomy holdall for short escapes, in grained leather." },
    categorySlug: "pele",
    image: null,
    variants: [clr("WB-BLK", COLOR.black, 165000)],
  },
  {
    slug: "briefcase",
    name: { pt: "Pasta Executiva", en: "Briefcase" },
    collection: "Défi Explorer",
    description: { pt: "Pasta executiva esguia, compartimento para portátil.", en: "Slim briefcase with a padded laptop compartment." },
    categorySlug: "pele",
    image: null,
    variants: [clr("BC-BLK", COLOR.black, 119000)],
  },
  {
    slug: "urban-backpack",
    name: { pt: "Mochila Urbana", en: "Urban Backpack" },
    collection: "Défi Explorer",
    description: { pt: "Mochila urbana em pele e nylon, leve e funcional.", en: "Urban backpack in leather and nylon, light and functional." },
    categorySlug: "pele",
    image: null,
    variants: [clr("UB-BLK", COLOR.black, 99000)],
  },
  {
    slug: "crossbody-bag",
    name: { pt: "Mala Tiracolo", en: "Crossbody Bag" },
    collection: "Défi Explorer",
    description: { pt: "Mala tiracolo compacta para o essencial do dia.", en: "Compact crossbody bag for the day's essentials." },
    categorySlug: "pele",
    image: null,
    novelty: true,
    variants: [clr("CB-BLK", COLOR.black, 89000)],
  },
  {
    slug: "compact-crossbody",
    name: { pt: "Bolsa Tiracolo Compacta", en: "Compact Crossbody" },
    collection: "Défi Explorer",
    description: { pt: "Bolsa tiracolo minimalista em pele de vitela.", en: "Minimalist crossbody pouch in calfskin." },
    categorySlug: "pele",
    image: null,
    variants: [clr("CCB-COG", COLOR.cognac, 79000)],
  },

  // === Leather — small leather goods ===
  {
    slug: "leather-wallet",
    name: { pt: "Carteira de Pele", en: "Leather Wallet" },
    collection: "Apex",
    description: { pt: "Carteira clássica em pele de vitela, oito compartimentos.", en: "Classic calfskin wallet with eight card slots." },
    categorySlug: "pele",
    image: null,
    variants: [clr("LW-BLK", COLOR.black, 29000), clr("LW-COG", COLOR.cognac, 29000)],
  },
  {
    slug: "slim-card-holder",
    name: { pt: "Porta-Cartões Slim", en: "Slim Card Holder" },
    collection: "Apex",
    description: { pt: "Porta-cartões fino para o essencial, pele granulada.", en: "Slim card holder for the essentials, in grained leather." },
    categorySlug: "pele",
    image: null,
    variants: [clr("SCH-BLK", COLOR.black, 14500), clr("SCH-NVY", COLOR.navy, 14500)],
  },
  {
    slug: "leather-key-holder",
    name: { pt: "Porta-Chaves de Pele", en: "Leather Key Holder" },
    collection: "Apex",
    description: { pt: "Porta-chaves em pele com seis ganchos e mosquetão.", en: "Leather key holder with six hooks and a clasp." },
    categorySlug: "pele",
    image: null,
    variants: [clr("LKH-BLK", COLOR.black, 12000), clr("LKH-COG", COLOR.cognac, 12000)],
  },

  // === Accessories — second items per type ===
  {
    slug: "classic-cufflinks",
    name: { pt: "Botões de Punho Clássicos", en: "Classic Cufflinks" },
    collection: "Accessories",
    description: { pt: "Botões de punho em latão com banho de paládio, desenho intemporal.", en: "Brass cufflinks with palladium plating, a timeless design." },
    categorySlug: "acessorios",
    image: null,
    variants: [fin("CLC-PALL", "Paládio", "Palladium", 21000)],
  },
  {
    slug: "classic-belt",
    name: { pt: "Cinto Clássico", en: "Classic Belt" },
    collection: "Accessories",
    description: { pt: "Cinto em pele de vitela com fivela polida, largura 30 mm.", en: "Calfskin belt with a polished buckle, 30 mm width." },
    categorySlug: "acessorios",
    image: null,
    variants: [clr("BLC-BLK", COLOR.black, 26000), clr("BLC-BRN", COLOR.cognac, 26000)],
  },
  {
    slug: "engraved-money-clip",
    name: { pt: "Clip de Notas Gravado", en: "Engraved Money Clip" },
    collection: "Accessories",
    description: { pt: "Clip de notas em metal com guilhoché gravado à mão.", en: "Metal money clip with hand-engraved guilloché." },
    categorySlug: "acessorios",
    image: null,
    variants: [fin("EMC-PALL", "Paládio Gravado", "Engraved Palladium", 17000)],
  },
  {
    slug: "classic-tie-clip",
    name: { pt: "Mola de Gravata Clássica", en: "Classic Tie Clip" },
    collection: "Accessories",
    description: { pt: "Mola de gravata em paládio, linha depurada.", en: "Palladium tie clip with a clean line." },
    categorySlug: "acessorios",
    image: null,
    variants: [fin("TCC-PALL", "Paládio", "Palladium", 15000)],
  },

  // === New lighter lines: Biggy & Slimmy (Twiggy colourways, no photos yet) ===
  {
    slug: "biggy",
    name: { pt: "Biggy", en: "Biggy" },
    collection: "Biggy",
    description: {
      pt: "Formato de maior porte na família de isqueiros a jato, nas cores do Twiggy.",
      en: "A larger-format jet lighter in the Twiggy family, in the same colour palette.",
    },
    categorySlug: "isqueiros",
    image: null,
    variants: TWIGGY_COLOURS.map((x) => cn(`BIG-${x.c}`, x.pt, x.en, x.hex, 34000)),
  },
  {
    slug: "slimmy",
    name: { pt: "Slimmy", en: "Slimmy" },
    collection: "Slimmy",
    description: {
      pt: "Silhueta ultrafina na família de isqueiros a jato, nas cores do Twiggy.",
      en: "An ultra-slim jet lighter in the Twiggy family, in the same colour palette.",
    },
    categorySlug: "isqueiros",
    image: null,
    variants: TWIGGY_COLOURS.map((x) => cn(`SLI-${x.c}`, x.pt, x.en, x.hex, 30000)),
  },

  // === Monogram 1872 — cross-category line (lighters · writing · accessories).
  // Only LGD has photos for now; everything else is a placeholder card. ===
  {
    slug: "le-grand-dupont-monogram",
    name: { pt: "Le Grand Dupont", en: "Le Grand Dupont" },
    collection: "Monogram 1872",
    description: MONO_DESC,
    categorySlug: "isqueiros",
    image: "/products/le-grand-dupont-monogram/LGDM-BLK/front.jpg",
    novelty: true,
    variants: [
      cwg("LGDM-BLK", "Preto", "Black", ["#15171c"], 198000, [
        "/products/le-grand-dupont-monogram/LGDM-BLK/front.jpg",
        "/products/le-grand-dupont-monogram/LGDM-BLK/back.jpg",
        "/products/le-grand-dupont-monogram/LGDM-BLK/closeup.jpg",
        "/products/le-grand-dupont-monogram/LGDM-BLK/open.jpg",
      ]),
      cwg("LGDM-SLV", "Prata", "Silver", ["#b9bcc2"], 188000, [
        "/products/le-grand-dupont-monogram/LGDM-SLV/front.jpg",
        "/products/le-grand-dupont-monogram/LGDM-SLV/back.jpg",
        "/products/le-grand-dupont-monogram/LGDM-SLV/closeup.jpg",
        "/products/le-grand-dupont-monogram/LGDM-SLV/open.jpg",
      ]),
      cwg("LGDM-GLD", "Ouro Amarelo", "Yellow Gold", ["#c8a24a"], 208000, [
        "/products/le-grand-dupont-monogram/LGDM-GLD/front.jpg",
        "/products/le-grand-dupont-monogram/LGDM-GLD/back.jpg",
        "/products/le-grand-dupont-monogram/LGDM-GLD/closeup.jpg",
        "/products/le-grand-dupont-monogram/LGDM-GLD/open.jpg",
      ]),
    ],
  },
  {
    slug: "twiggy-monogram",
    name: { pt: "Twiggy", en: "Twiggy" },
    collection: "Monogram 1872", description: MONO_DESC, categorySlug: "isqueiros", image: null,
    variants: MONO3.map((c) => cn(`TWM-${c.code}`, c.pt, c.en, c.hex, 36000)),
  },
  {
    slug: "slimmy-monogram",
    name: { pt: "Slimmy", en: "Slimmy" },
    collection: "Monogram 1872", description: MONO_DESC, categorySlug: "isqueiros", image: null,
    variants: MONO3.map((c) => cn(`SLIM-${c.code}`, c.pt, c.en, c.hex, 34000)),
  },
  {
    slug: "biggy-monogram",
    name: { pt: "Biggy", en: "Biggy" },
    collection: "Monogram 1872", description: MONO_DESC, categorySlug: "isqueiros", image: null,
    variants: MONO3.map((c) => cn(`BIGM-${c.code}`, c.pt, c.en, c.hex, 38000)),
  },
  {
    slug: "line-d-eternity-monogram",
    name: { pt: "Line D Eternity", en: "Line D Eternity" },
    collection: "Monogram 1872", description: MONO_DESC, categorySlug: "escrita", image: null,
    variants: (() => {
      const types = [
        { k: "FP", pt: "Caneta de Tinta Permanente", en: "Fountain Pen", price: 165000 },
        { k: "RB", pt: "Rollerball", en: "Rollerball", price: 110000 },
        { k: "BP", pt: "Esferográfica", en: "Ballpoint", price: 95000 },
      ];
      const cols = [
        { code: "SLV", pt: "Prata", en: "Silver", hex: ["#b9bcc2"] },
        { code: "GLD", pt: "Ouro", en: "Gold", hex: ["#c8a24a"] },
        { code: "BG", pt: "Preto & Ouro", en: "Black & Gold", hex: ["#15171c", "#c8a24a"] },
      ];
      const sizes = [
        { code: "M", pt: "Médio", en: "Medium", mult: 1 },
        { code: "L", pt: "Grande", en: "Large", mult: 1.15 },
        { code: "XL", pt: "XL", en: "XL", mult: 1.3 },
      ];
      const out: SeedVariant[] = [];
      for (const t of types)
        for (const c of cols)
          for (const s of sizes)
            out.push({
              sku: `LDEM-${t.k}-${c.code}-${s.code}`,
              name: { pt: `${t.pt} · ${c.pt} · ${s.pt}`, en: `${t.en} · ${c.en} · ${s.en}` },
              priceCents: Math.round((t.price * s.mult) / 1000) * 1000,
              currency: "EUR" as const,
              attributes: {
                type: { pt: t.pt, en: t.en },
                color: { label: { pt: c.pt, en: c.en }, hex: c.hex },
                size: { pt: s.pt, en: s.en },
              },
            });
      return out;
    })(),
  },
  { slug: "cigar-case-monogram", name: { pt: "Estojo de Charuto", en: "Cigar Case" }, collection: "Monogram 1872", description: MONO_DESC, categorySlug: "acessorios", image: null, variants: MONO3.map((c) => cn(`CCM-${c.code}`, c.pt, c.en, c.hex, 52000)) },
  { slug: "cigar-case-double-monogram", name: { pt: "Estojo de Charuto Duplo", en: "Double Cigar Case" }, collection: "Monogram 1872", description: MONO_DESC, categorySlug: "acessorios", image: null, variants: MONO3.map((c) => cn(`CCDM-${c.code}`, c.pt, c.en, c.hex, 62000)) },
  { slug: "cigarette-case-monogram", name: { pt: "Cigarreira", en: "Cigarette Case" }, collection: "Monogram 1872", description: MONO_DESC, categorySlug: "acessorios", image: null, variants: MONO3.map((c) => cn(`CIGM-${c.code}`, c.pt, c.en, c.hex, 48000)) },
  { slug: "cigar-cutter-monogram", name: { pt: "Cortador de Charuto", en: "Cigar Cutter" }, collection: "Monogram 1872", description: MONO_DESC, categorySlug: "acessorios", image: null, variants: MONO3.map((c) => cn(`CUTM-${c.code}`, c.pt, c.en, c.hex, 42000)) },
  { slug: "ashtray-monogram", name: { pt: "Cinzeiro", en: "Ashtray" }, collection: "Monogram 1872", description: MONO_DESC, categorySlug: "acessorios", image: null, variants: MONO3.map((c) => cn(`ASHM-${c.code}`, c.pt, c.en, c.hex, 58000)) },
  { slug: "cufflinks-monogram", name: { pt: "Botões de Punho", en: "Cufflinks" }, collection: "Monogram 1872", description: MONO_DESC, categorySlug: "acessorios", image: null, variants: MONO_GS.map((c) => cn(`CFM-${c.code}`, c.pt, c.en, c.hex, 29000)) },
  { slug: "money-clip-monogram", name: { pt: "Clip de Notas", en: "Money Clip" }, collection: "Monogram 1872", description: MONO_DESC, categorySlug: "acessorios", image: null, variants: MONO_GS.map((c) => cn(`MCM-${c.code}`, c.pt, c.en, c.hex, 22000)) },
  { slug: "key-ring-monogram", name: { pt: "Porta-Chaves", en: "Key Ring" }, collection: "Monogram 1872", description: MONO_DESC, categorySlug: "acessorios", image: null, variants: MONO_GS.map((c) => cn(`KRM-${c.code}`, c.pt, c.en, c.hex, 18000)) },

  // --- Added from us.st-dupont.com catalogue ---------------------------------
  // Generated by scripts/generate-seed-additions.ts. Prices are USD → EUR
  // at a flat 0.92 rate; colour names mapped from Shopify "color_*" tags.

  {
    slug: `ligne-2-maki-e`,
    name: { pt: `Ligne 2 · Maki-e`, en: `Ligne 2 · Maki E` },
    description: { pt: `Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges.`, en: `S.T. Dupont lighter — hand-polished lacquer, signature flame mechanism and the iconic cling® of the Faverges manufacture.` },
    collection: `Ligne 2`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-maki-e/016359.webp`,
    variants: [
      { sku: `016359`, name: { pt: `Ligne 2 · Maki E — Prata`, en: `Ligne 2 · Maki E — Silver` }, priceCents: 731400, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/ligne-2-maki-e/016359.webp`, images: [`/products/ligne-2-maki-e/016359.webp`, `/products/ligne-2-maki-e/016359-2.webp`] },
      { sku: `C16150`, name: { pt: `Ligne 2 · Maki E — Castanho`, en: `Ligne 2 · Maki E — Brown` }, priceCents: 777400, currency: "EUR", attributes: { color: { label: { pt: `Castanho`, en: `Brown` }, hex: ["#6b4a2a"] } }, image: `/products/ligne-2-maki-e/C16150.webp`, images: [`/products/ligne-2-maki-e/C16150.webp`, `/products/ligne-2-maki-e/C16150-2.webp`, `/products/ligne-2-maki-e/C16150-3.webp`, `/products/ligne-2-maki-e/C16150-4.webp`] },
      { sku: `C16151`, name: { pt: `Ligne 2 · Maki E — Castanho`, en: `Ligne 2 · Maki E — Brown` }, priceCents: 639400, currency: "EUR", attributes: { color: { label: { pt: `Castanho`, en: `Brown` }, hex: ["#6b4a2a"] } }, image: `/products/ligne-2-maki-e/C16151.webp`, images: [`/products/ligne-2-maki-e/C16151.webp`, `/products/ligne-2-maki-e/C16151-2.webp`, `/products/ligne-2-maki-e/C16151-3.webp`, `/products/ligne-2-maki-e/C16151-4.webp`] }
    ],
  },
  {
    slug: `slim-7-geode`,
    name: { pt: `Slim 7 · Géode`, en: `Slim 7 · Geode` },
    description: { pt: `Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges.`, en: `S.T. Dupont lighter — hand-polished lacquer, signature flame mechanism and the iconic cling® of the Faverges manufacture.` },
    collection: `Slim 7`,
    categorySlug: "isqueiros",
    image: `/products/slim-7-geode/027036.webp`,
    variants: [
      { sku: `027036`, name: { pt: `Slim 7 · Geode — Azul`, en: `Slim 7 · Geode — Blue` }, priceCents: 27140, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/slim-7-geode/027036.webp`, images: [`/products/slim-7-geode/027036.webp`, `/products/slim-7-geode/027036-2.webp`, `/products/slim-7-geode/027036-3.webp`, `/products/slim-7-geode/027036-4.webp`] },
      { sku: `027035`, name: { pt: `Slim 7 · Geode — Azul`, en: `Slim 7 · Geode — Blue` }, priceCents: 27140, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/slim-7-geode/027035.webp`, images: [`/products/slim-7-geode/027035.webp`, `/products/slim-7-geode/027035-2.webp`, `/products/slim-7-geode/027035-3.webp`, `/products/slim-7-geode/027035-4.webp`] }
    ],
  },
  {
    slug: `twiggy-geode`,
    name: { pt: `Twiggy · Géode`, en: `Twiggy · Geode` },
    description: { pt: `Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges.`, en: `S.T. Dupont lighter — hand-polished lacquer, signature flame mechanism and the iconic cling® of the Faverges manufacture.` },
    collection: `Twiggy`,
    categorySlug: "isqueiros",
    image: `/products/twiggy-geode/030036.webp`,
    variants: [
      { sku: `030036`, name: { pt: `Twiggy · Geode — Verde`, en: `Twiggy · Geode — Green` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Verde`, en: `Green` }, hex: ["#3a5040"] } }, image: `/products/twiggy-geode/030036.webp`, images: [`/products/twiggy-geode/030036.webp`, `/products/twiggy-geode/030036-2.webp`, `/products/twiggy-geode/030036-3.webp`, `/products/twiggy-geode/030036-4.webp`] },
      { sku: `030035`, name: { pt: `Twiggy · Geode — Azul`, en: `Twiggy · Geode — Blue` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/twiggy-geode/030035.webp`, images: [`/products/twiggy-geode/030035.webp`, `/products/twiggy-geode/030035-2.webp`, `/products/twiggy-geode/030035-3.webp`, `/products/twiggy-geode/030035-4.webp`] }
    ],
  },
  {
    slug: `slimmy-geode`,
    name: { pt: `Slimmy · Géode`, en: `Slimmy · Geode` },
    description: { pt: `Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges.`, en: `S.T. Dupont lighter — hand-polished lacquer, signature flame mechanism and the iconic cling® of the Faverges manufacture.` },
    collection: `Slimmy`,
    categorySlug: "isqueiros",
    image: `/products/slimmy-geode/028036.webp`,
    variants: [
      { sku: `028036`, name: { pt: `Slimmy · Geode — Verde`, en: `Slimmy · Geode — Green` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Verde`, en: `Green` }, hex: ["#3a5040"] } }, image: `/products/slimmy-geode/028036.webp`, images: [`/products/slimmy-geode/028036.webp`, `/products/slimmy-geode/028036-2.webp`, `/products/slimmy-geode/028036-3.webp`, `/products/slimmy-geode/028036-4.webp`] },
      { sku: `028035`, name: { pt: `Slimmy · Geode — Azul`, en: `Slimmy · Geode — Blue` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/slimmy-geode/028035.webp`, images: [`/products/slimmy-geode/028035.webp`, `/products/slimmy-geode/028035-2.webp`, `/products/slimmy-geode/028035-3.webp`, `/products/slimmy-geode/028035-4.webp`] }
    ],
  },
  {
    slug: `minijet-geode`,
    name: { pt: `Minijet · Géode`, en: `Minijet · Geode` },
    description: { pt: `Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges.`, en: `S.T. Dupont lighter — hand-polished lacquer, signature flame mechanism and the iconic cling® of the Faverges manufacture.` },
    collection: `Minijet`,
    categorySlug: "isqueiros",
    image: `/products/minijet-geode/010836.webp`,
    variants: [
      { sku: `010836`, name: { pt: `Minijet · Geode — Verde`, en: `Minijet · Geode — Green` }, priceCents: 19320, currency: "EUR", attributes: { color: { label: { pt: `Verde`, en: `Green` }, hex: ["#3a5040"] } }, image: `/products/minijet-geode/010836.webp`, images: [`/products/minijet-geode/010836.webp`, `/products/minijet-geode/010836-2.webp`, `/products/minijet-geode/010836-3.webp`, `/products/minijet-geode/010836-4.webp`] },
      { sku: `010835`, name: { pt: `Minijet · Geode — Azul`, en: `Minijet · Geode — Blue` }, priceCents: 19320, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/minijet-geode/010835.webp`, images: [`/products/minijet-geode/010835.webp`, `/products/minijet-geode/010835-2.webp`, `/products/minijet-geode/010835-3.webp`, `/products/minijet-geode/010835-4.webp`] }
    ],
  },
  {
    slug: `initial-2`,
    name: { pt: `Initial`, en: `Initial` },
    description: { pt: `Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges.`, en: `S.T. Dupont lighter — hand-polished lacquer, signature flame mechanism and the iconic cling® of the Faverges manufacture.` },
    collection: `Initial`,
    categorySlug: "isqueiros",
    image: `/products/initial-2/020845.webp`,
    variants: [
      { sku: `020845`, name: { pt: `Initial — Dourado`, en: `Initial — Golden` }, priceCents: 54740, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/initial-2/020845.webp`, images: [`/products/initial-2/020845.webp`, `/products/initial-2/020845-2.webp`, `/products/initial-2/020845-3.webp`, `/products/initial-2/020845-4.webp`] }
    ],
  },
  {
    slug: `popote`,
    name: { pt: `Popote`, en: `Popote` },
    description: { pt: `Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges.`, en: `S.T. Dupont lighter — hand-polished lacquer, signature flame mechanism and the iconic cling® of the Faverges manufacture.` },
    collection: ``,
    categorySlug: "isqueiros",
    image: `/products/popote/C16018CL.webp`,
    variants: [
      { sku: `C16018CL`, name: { pt: `Popote — Azul`, en: `Popote — Blue` }, priceCents: 174340, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/popote/C16018CL.webp`, images: [`/products/popote/C16018CL.webp`, `/products/popote/C16018CL-2.webp`, `/products/popote/C16018CL-3.webp`, `/products/popote/C16018CL-4.webp`] },
      { sku: `C16017CL`, name: { pt: `Popote — Vermelho`, en: `Popote — Red` }, priceCents: 174340, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/popote/C16017CL.webp`, images: [`/products/popote/C16017CL.webp`, `/products/popote/C16017CL-2.webp`, `/products/popote/C16017CL-3.webp`, `/products/popote/C16017CL-4.webp`] },
      { sku: `C16016CL`, name: { pt: `Popote — Preto`, en: `Popote — Black` }, priceCents: 174340, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/popote/C16016CL.webp`, images: [`/products/popote/C16016CL.webp`, `/products/popote/C16016CL-2.webp`, `/products/popote/C16016CL-3.webp`, `/products/popote/C16016CL-4.webp`] }
    ],
  },
  {
    slug: `le-grand-dupont-popote`,
    name: { pt: `Le Grand Dupont · Popote`, en: `Le Grand Dupont · Popote` },
    description: { pt: `Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges.`, en: `S.T. Dupont lighter — hand-polished lacquer, signature flame mechanism and the iconic cling® of the Faverges manufacture.` },
    collection: `Le Grand Dupont`,
    categorySlug: "isqueiros",
    image: `/products/le-grand-dupont-popote/C23017CL.webp`,
    variants: [
      { sku: `C23017CL`, name: { pt: `Le Grand Dupont · Popote — Vermelho`, en: `Le Grand Dupont · Popote — Red` }, priceCents: 192740, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/le-grand-dupont-popote/C23017CL.webp`, images: [`/products/le-grand-dupont-popote/C23017CL.webp`, `/products/le-grand-dupont-popote/C23017CL-2.webp`, `/products/le-grand-dupont-popote/C23017CL-3.webp`, `/products/le-grand-dupont-popote/C23017CL-4.webp`] },
      { sku: `C23018CL`, name: { pt: `Le Grand Dupont · Popote — Vermelho`, en: `Le Grand Dupont · Popote — Red` }, priceCents: 192740, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/le-grand-dupont-popote/C23018CL.webp`, images: [`/products/le-grand-dupont-popote/C23018CL.webp`, `/products/le-grand-dupont-popote/C23018CL-2.webp`, `/products/le-grand-dupont-popote/C23018CL-3.webp`, `/products/le-grand-dupont-popote/C23018CL-4.webp`] },
      { sku: `C23016CL`, name: { pt: `Le Grand Dupont · Popote — Preto`, en: `Le Grand Dupont · Popote — Black` }, priceCents: 192740, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/le-grand-dupont-popote/C23016CL.webp`, images: [`/products/le-grand-dupont-popote/C23016CL.webp`, `/products/le-grand-dupont-popote/C23016CL-2.webp`, `/products/le-grand-dupont-popote/C23016CL-3.webp`, `/products/le-grand-dupont-popote/C23016CL-4.webp`] }
    ],
  },
  {
    slug: `ligne-2-geode`,
    name: { pt: `Ligne 2 · Géode`, en: `Ligne 2 · Geode` },
    description: { pt: `Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges.`, en: `S.T. Dupont lighter — hand-polished lacquer, signature flame mechanism and the iconic cling® of the Faverges manufacture.` },
    collection: `Ligne 2`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-geode/C16036CL.webp`,
    variants: [
      { sku: `C16036CL`, name: { pt: `Ligne 2 · Geode — Verde`, en: `Ligne 2 · Geode — Green` }, priceCents: 155940, currency: "EUR", attributes: { color: { label: { pt: `Verde`, en: `Green` }, hex: ["#3a5040"] } }, image: `/products/ligne-2-geode/C16036CL.webp`, images: [`/products/ligne-2-geode/C16036CL.webp`, `/products/ligne-2-geode/C16036CL-2.webp`, `/products/ligne-2-geode/C16036CL-3.webp`, `/products/ligne-2-geode/C16036CL-4.webp`] },
      { sku: `C16035CL`, name: { pt: `Ligne 2 · Geode — Azul`, en: `Ligne 2 · Geode — Blue` }, priceCents: 155940, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/ligne-2-geode/C16035CL.webp`, images: [`/products/ligne-2-geode/C16035CL.webp`, `/products/ligne-2-geode/C16035CL-2.webp`, `/products/ligne-2-geode/C16035CL-3.webp`, `/products/ligne-2-geode/C16035CL-4.webp`] }
    ],
  },
  {
    slug: `ligne-2-horse-mane`,
    name: { pt: `Ligne 2 · Horse Mane`, en: `Ligne 2 · Horse mane` },
    description: { pt: `Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges.`, en: `S.T. Dupont lighter — hand-polished lacquer, signature flame mechanism and the iconic cling® of the Faverges manufacture.` },
    collection: `Ligne 2`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-horse-mane/C16089CL.webp`,
    variants: [
      { sku: `C16089CL`, name: { pt: `Ligne 2 · Horse mane — Vermelho`, en: `Ligne 2 · Horse mane — Red` }, priceCents: 165140, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/ligne-2-horse-mane/C16089CL.webp`, images: [`/products/ligne-2-horse-mane/C16089CL.webp`, `/products/ligne-2-horse-mane/C16089CL-2.webp`, `/products/ligne-2-horse-mane/C16089CL-3.webp`, `/products/ligne-2-horse-mane/C16089CL-4.webp`] },
      { sku: `C16090CL`, name: { pt: `Ligne 2 · Horse mane — Preto`, en: `Ligne 2 · Horse mane — Black` }, priceCents: 165140, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/ligne-2-horse-mane/C16090CL.webp`, images: [`/products/ligne-2-horse-mane/C16090CL.webp`, `/products/ligne-2-horse-mane/C16090CL-2.webp`, `/products/ligne-2-horse-mane/C16090CL-3.webp`, `/products/ligne-2-horse-mane/C16090CL-4.webp`] }
    ],
  },
  {
    slug: `le-grand-dupont-2`,
    name: { pt: `Le Grand Dupont`, en: `Le Grand Dupont` },
    description: { pt: `Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges.`, en: `S.T. Dupont lighter — hand-polished lacquer, signature flame mechanism and the iconic cling® of the Faverges manufacture.` },
    collection: `Le Grand Dupont`,
    categorySlug: "isqueiros",
    image: `/products/le-grand-dupont-2/C23110BL.webp`,
    variants: [
      { sku: `C23110BL`, name: { pt: `Le Grand Dupont — Preto`, en: `Le Grand Dupont — Black` }, priceCents: 165140, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/le-grand-dupont-2/C23110BL.webp`, images: [`/products/le-grand-dupont-2/C23110BL.webp`] },
      { sku: `C16601CY`, name: { pt: `Le Grand Dupont — Prata`, en: `Le Grand Dupont — Silver` }, priceCents: 174340, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/le-grand-dupont-2/C16601CY.webp`, images: [`/products/le-grand-dupont-2/C16601CY.webp`, `/products/le-grand-dupont-2/C16601CY-2.webp`] },
      { sku: `C16601CB`, name: { pt: `Le Grand Dupont — Prata`, en: `Le Grand Dupont — Silver` }, priceCents: 174340, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/le-grand-dupont-2/C16601CB.webp`, images: [`/products/le-grand-dupont-2/C16601CB.webp`, `/products/le-grand-dupont-2/C16601CB-2.webp`] },
      { sku: `C16656`, name: { pt: `Le Grand Dupont — Prata`, en: `Le Grand Dupont — Silver` }, priceCents: 155940, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/le-grand-dupont-2/C16656.webp`, images: [`/products/le-grand-dupont-2/C16656.webp`, `/products/le-grand-dupont-2/C16656-2.webp`] },
      { sku: `C16014HC`, name: { pt: `Le Grand Dupont — Castanho`, en: `Le Grand Dupont — Brown` }, priceCents: 413540, currency: "EUR", attributes: { color: { label: { pt: `Castanho`, en: `Brown` }, hex: ["#6b4a2a"] } }, image: `/products/le-grand-dupont-2/C16014HC.webp`, images: [`/products/le-grand-dupont-2/C16014HC.webp`, `/products/le-grand-dupont-2/C16014HC-2.webp`, `/products/le-grand-dupont-2/C16014HC-3.webp`, `/products/le-grand-dupont-2/C16014HC-4.webp`] },
      { sku: `C23013`, name: { pt: `Le Grand Dupont — Azul & Escuro & Azul`, en: `Le Grand Dupont — Blue & Dark Blue` }, priceCents: 183540, currency: "EUR", attributes: { color: { label: { pt: `Azul & Escuro & Azul`, en: `Blue & Dark Blue` }, hex: ["#1f3c66", "#2a2d34"] } }, image: `/products/le-grand-dupont-2/C23013.webp`, images: [`/products/le-grand-dupont-2/C23013.webp`, `/products/le-grand-dupont-2/C23013-2.webp`, `/products/le-grand-dupont-2/C23013-3.webp`, `/products/le-grand-dupont-2/C23013-4.webp`] },
      { sku: `C23010`, name: { pt: `Le Grand Dupont — Preto`, en: `Le Grand Dupont — Black` }, priceCents: 174340, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/le-grand-dupont-2/C23010.webp`, images: [`/products/le-grand-dupont-2/C23010.webp`, `/products/le-grand-dupont-2/C23010-2.webp`, `/products/le-grand-dupont-2/C23010-3.webp`, `/products/le-grand-dupont-2/C23010-4.webp`] },
      { sku: `C23011`, name: { pt: `Le Grand Dupont — Prata`, en: `Le Grand Dupont — Silver` }, priceCents: 165140, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/le-grand-dupont-2/C23011.webp`, images: [`/products/le-grand-dupont-2/C23011.webp`, `/products/le-grand-dupont-2/C23011-2.webp`, `/products/le-grand-dupont-2/C23011-3.webp`, `/products/le-grand-dupont-2/C23011-4.webp`] },
      { sku: `C23009`, name: { pt: `Le Grand Dupont — Dourado`, en: `Le Grand Dupont — Golden` }, priceCents: 165140, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/le-grand-dupont-2/C23009.webp`, images: [`/products/le-grand-dupont-2/C23009.webp`, `/products/le-grand-dupont-2/C23009-2.webp`, `/products/le-grand-dupont-2/C23009-3.webp`, `/products/le-grand-dupont-2/C23009-4.webp`] }
    ],
  },
  {
    slug: `dc-comics`,
    name: { pt: `DC Comics`, en: `DC Comics` },
    description: { pt: `Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges.`, en: `S.T. Dupont lighter — hand-polished lacquer, signature flame mechanism and the iconic cling® of the Faverges manufacture.` },
    collection: ``,
    categorySlug: "isqueiros",
    image: `/products/dc-comics/K27221CH.webp`,
    variants: [
      { sku: `K27221CH`, name: { pt: `DC Comics — Vermelho`, en: `DC Comics — Red` }, priceCents: 45540, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/dc-comics/K27221CH.webp`, images: [`/products/dc-comics/K27221CH.webp`, `/products/dc-comics/K27221CH-2.webp`, `/products/dc-comics/K27221CH-3.webp`, `/products/dc-comics/K27221CH-4.webp`] },
      { sku: `C16180CL`, name: { pt: `DC Comics — Preto`, en: `DC Comics — Black` }, priceCents: 183540, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/dc-comics/C16180CL.webp`, images: [`/products/dc-comics/C16180CL.webp`, `/products/dc-comics/C16180CL-2.webp`, `/products/dc-comics/C16180CL-3.webp`, `/products/dc-comics/C16180CL-4.webp`] },
      { sku: `C16220CL`, name: { pt: `DC Comics — Preto`, en: `DC Comics — Black` }, priceCents: 183540, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/dc-comics/C16220CL.webp`, images: [`/products/dc-comics/C16220CL.webp`, `/products/dc-comics/C16220CL-2.webp`, `/products/dc-comics/C16220CL-3.webp`, `/products/dc-comics/C16220CL-4.webp`] }
    ],
  },
  {
    slug: `ligne-2-dc-comics`,
    name: { pt: `Ligne 2 · DC Comics`, en: `Ligne 2 · DC Comics` },
    description: { pt: `Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges.`, en: `S.T. Dupont lighter — hand-polished lacquer, signature flame mechanism and the iconic cling® of the Faverges manufacture.` },
    collection: `Ligne 2`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-dc-comics/C16221CL.webp`,
    variants: [
      { sku: `C16221CL`, name: { pt: `Ligne 2 · DC Comics — Vermelho`, en: `Ligne 2 · DC Comics — Red` }, priceCents: 183540, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/ligne-2-dc-comics/C16221CL.webp`, images: [`/products/ligne-2-dc-comics/C16221CL.webp`, `/products/ligne-2-dc-comics/C16221CL-2.webp`, `/products/ligne-2-dc-comics/C16221CL-3.webp`, `/products/ligne-2-dc-comics/C16221CL-4.webp`] }
    ],
  },
  {
    slug: `torch`,
    name: { pt: `Torch`, en: `Torch` },
    description: { pt: `Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges.`, en: `S.T. Dupont lighter — hand-polished lacquer, signature flame mechanism and the iconic cling® of the Faverges manufacture.` },
    collection: `Torch`,
    categorySlug: "isqueiros",
    image: `/products/torch/029002.webp`,
    variants: [
      { sku: `029002`, name: { pt: `Torch — Dourado`, en: `Torch — Golden` }, priceCents: 54740, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/torch/029002.webp`, images: [`/products/torch/029002.webp`, `/products/torch/029002-2.webp`, `/products/torch/029002-3.webp`, `/products/torch/029002-4.webp`] },
      { sku: `029001`, name: { pt: `Torch — Preto & Prata`, en: `Torch — Black & Silver` }, priceCents: 54740, currency: "EUR", attributes: { color: { label: { pt: `Preto & Prata`, en: `Black & Silver` }, hex: ["#15171c", "#c9ccd1"] } }, image: `/products/torch/029001.webp`, images: [`/products/torch/029001.webp`, `/products/torch/029001-2.webp`, `/products/torch/029001-3.webp`, `/products/torch/029001-4.webp`] }
    ],
  },
  {
    slug: `ligne-2-orlinski`,
    name: { pt: `Ligne 2 · Orlinski`, en: `Ligne 2 · Orlinski` },
    description: { pt: `Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges.`, en: `S.T. Dupont lighter — hand-polished lacquer, signature flame mechanism and the iconic cling® of the Faverges manufacture.` },
    collection: `Ligne 2`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-orlinski/C16061CL.webp`,
    variants: [
      { sku: `C16061CL`, name: { pt: `Ligne 2 · Orlinski — Ouro`, en: `Ligne 2 · Orlinski — Gold` }, priceCents: 192740, currency: "EUR", attributes: { color: { label: { pt: `Ouro`, en: `Gold` }, hex: ["#c8a24a"] } }, image: `/products/ligne-2-orlinski/C16061CL.webp`, images: [`/products/ligne-2-orlinski/C16061CL.webp`, `/products/ligne-2-orlinski/C16061CL-2.webp`, `/products/ligne-2-orlinski/C16061CL-3.webp`, `/products/ligne-2-orlinski/C16061CL-4.webp`] },
      { sku: `C16060`, name: { pt: `Ligne 2 · Orlinski — Vermelho`, en: `Ligne 2 · Orlinski — Red` }, priceCents: 211140, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/ligne-2-orlinski/C16060.webp`, images: [`/products/ligne-2-orlinski/C16060.webp`, `/products/ligne-2-orlinski/C16060-2.webp`, `/products/ligne-2-orlinski/C16060-3.webp`, `/products/ligne-2-orlinski/C16060-4.webp`] },
      { sku: `C16062CL`, name: { pt: `Ligne 2 · Orlinski — Prata`, en: `Ligne 2 · Orlinski — Silver` }, priceCents: 192740, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/ligne-2-orlinski/C16062CL.webp`, images: [`/products/ligne-2-orlinski/C16062CL.webp`, `/products/ligne-2-orlinski/C16062CL-2.webp`, `/products/ligne-2-orlinski/C16062CL-3.webp`, `/products/ligne-2-orlinski/C16062CL-4.webp`] }
    ],
  },
  {
    slug: `slimmy-orlinski`,
    name: { pt: `Slimmy · Orlinski`, en: `Slimmy · Orlinski` },
    description: { pt: `Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges.`, en: `S.T. Dupont lighter — hand-polished lacquer, signature flame mechanism and the iconic cling® of the Faverges manufacture.` },
    collection: `Slimmy`,
    categorySlug: "isqueiros",
    image: `/products/slimmy-orlinski/025063.webp`,
    variants: [
      { sku: `025063`, name: { pt: `Slimmy · Orlinski — Laranja`, en: `Slimmy · Orlinski — Orange` }, priceCents: 50600, currency: "EUR", attributes: { color: { label: { pt: `Laranja`, en: `Orange` }, hex: ["#c4642d"] } }, image: `/products/slimmy-orlinski/025063.webp`, images: [`/products/slimmy-orlinski/025063.webp`, `/products/slimmy-orlinski/025063-2.webp`, `/products/slimmy-orlinski/025063-3.webp`, `/products/slimmy-orlinski/025063-4.webp`] },
      { sku: `028064`, name: { pt: `Slimmy · Orlinski — Azul`, en: `Slimmy · Orlinski — Blue` }, priceCents: 41400, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/slimmy-orlinski/028064.webp`, images: [`/products/slimmy-orlinski/028064.webp`, `/products/slimmy-orlinski/028064-2.webp`, `/products/slimmy-orlinski/028064-3.webp`, `/products/slimmy-orlinski/028064-4.webp`] },
      { sku: `028063`, name: { pt: `Slimmy · Orlinski — Laranja`, en: `Slimmy · Orlinski — Orange` }, priceCents: 41400, currency: "EUR", attributes: { color: { label: { pt: `Laranja`, en: `Orange` }, hex: ["#c4642d"] } }, image: `/products/slimmy-orlinski/028063.webp`, images: [`/products/slimmy-orlinski/028063.webp`, `/products/slimmy-orlinski/028063-2.webp`, `/products/slimmy-orlinski/028063-3.webp`, `/products/slimmy-orlinski/028063-4.webp`] }
    ],
  },
  {
    slug: `biggy-orlinski`,
    name: { pt: `Biggy · Orlinski`, en: `Biggy · Orlinski` },
    description: { pt: `Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges.`, en: `S.T. Dupont lighter — hand-polished lacquer, signature flame mechanism and the iconic cling® of the Faverges manufacture.` },
    collection: `Biggy`,
    categorySlug: "isqueiros",
    image: `/products/biggy-orlinski/025064.webp`,
    variants: [
      { sku: `025064`, name: { pt: `Biggy · Orlinski — Azul`, en: `Biggy · Orlinski — Blue` }, priceCents: 50600, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/biggy-orlinski/025064.webp`, images: [`/products/biggy-orlinski/025064.webp`, `/products/biggy-orlinski/025064-2.webp`, `/products/biggy-orlinski/025064-3.webp`, `/products/biggy-orlinski/025064-4.webp`] }
    ],
  },
  {
    slug: `ligne-2-2`,
    name: { pt: `Ligne 2`, en: `Ligne 2` },
    description: { pt: `Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges.`, en: `S.T. Dupont lighter — hand-polished lacquer, signature flame mechanism and the iconic cling® of the Faverges manufacture.` },
    collection: `Ligne 2`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-2/C16079.webp`,
    variants: [
      { sku: `C16079`, name: { pt: `Ligne 2 — Preto`, en: `Ligne 2 — Black` }, priceCents: 151800, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/ligne-2-2/C16079.webp`, images: [`/products/ligne-2-2/C16079.webp`, `/products/ligne-2-2/C16079-2.webp`, `/products/ligne-2-2/C16079-3.webp`, `/products/ligne-2-2/C16079-4.webp`] },
      { sku: `C16646`, name: { pt: `Ligne 2 — Dourado`, en: `Ligne 2 — Golden` }, priceCents: 133400, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/ligne-2-2/C16646.webp`, images: [`/products/ligne-2-2/C16646.webp`, `/products/ligne-2-2/C16646-2.webp`, `/products/ligne-2-2/C16646-3.webp`, `/products/ligne-2-2/C16646-4.webp`] },
      { sku: `C16645`, name: { pt: `Ligne 2 — Prata`, en: `Ligne 2 — Silver` }, priceCents: 133400, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/ligne-2-2/C16645.webp`, images: [`/products/ligne-2-2/C16645.webp`, `/products/ligne-2-2/C16645-2.webp`, `/products/ligne-2-2/C16645-3.webp`, `/products/ligne-2-2/C16645-4.webp`] },
      { sku: `016827`, name: { pt: `Ligne 2 — Dourado`, en: `Ligne 2 — Golden` }, priceCents: 115000, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/ligne-2-2/016827.webp`, images: [`/products/ligne-2-2/016827.webp`, `/products/ligne-2-2/016827-2.webp`, `/products/ligne-2-2/016827-3.webp`, `/products/ligne-2-2/016827-4.webp`] },
      { sku: `016817`, name: { pt: `Ligne 2 — Prata`, en: `Ligne 2 — Silver` }, priceCents: 105800, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/ligne-2-2/016817.webp`, images: [`/products/ligne-2-2/016817.webp`, `/products/ligne-2-2/016817-2.webp`, `/products/ligne-2-2/016817-3.webp`, `/products/ligne-2-2/016817-4.webp`] },
      { sku: `016424`, name: { pt: `Ligne 2 — Rosa`, en: `Ligne 2 — Pink` }, priceCents: 115000, currency: "EUR", attributes: { color: { label: { pt: `Rosa`, en: `Pink` }, hex: ["#e7a3b1"] } }, image: `/products/ligne-2-2/016424.webp`, images: [`/products/ligne-2-2/016424.webp`, `/products/ligne-2-2/016424-2.webp`, `/products/ligne-2-2/016424-3.webp`, `/products/ligne-2-2/016424-4.webp`] },
      { sku: `016296`, name: { pt: `Ligne 2 — Preto & Prata`, en: `Ligne 2 — Black & Silver` }, priceCents: 137540, currency: "EUR", attributes: { color: { label: { pt: `Preto & Prata`, en: `Black & Silver` }, hex: ["#15171c", "#c9ccd1"] } }, image: `/products/ligne-2-2/016296.webp`, images: [`/products/ligne-2-2/016296.webp`, `/products/ligne-2-2/016296-2.webp`, `/products/ligne-2-2/016296-3.webp`, `/products/ligne-2-2/016296-4.webp`] },
      { sku: `016284`, name: { pt: `Ligne 2 — Dourado`, en: `Ligne 2 — Golden` }, priceCents: 115000, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/ligne-2-2/016284.webp`, images: [`/products/ligne-2-2/016284.webp`, `/products/ligne-2-2/016284-2.webp`, `/products/ligne-2-2/016284-3.webp`, `/products/ligne-2-2/016284-4.webp`] },
      { sku: `C16602`, name: { pt: `Ligne 2 — Prata`, en: `Ligne 2 — Silver` }, priceCents: 128340, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/ligne-2-2/C16602.webp`, images: [`/products/ligne-2-2/C16602.webp`, `/products/ligne-2-2/C16602-2.webp`, `/products/ligne-2-2/C16602-3.webp`, `/products/ligne-2-2/C16602-4.webp`] },
      { sku: `C16601`, name: { pt: `Ligne 2 — Preto`, en: `Ligne 2 — Black` }, priceCents: 137540, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/ligne-2-2/C16601.webp`, images: [`/products/ligne-2-2/C16601.webp`, `/products/ligne-2-2/C16601-2.webp`, `/products/ligne-2-2/C16601-3.webp`, `/products/ligne-2-2/C16601-4.webp`] },
      { sku: `C16457`, name: { pt: `Ligne 2 — Azul & Escuro & Azul & Dourado`, en: `Ligne 2 — Blue & Dark Blue & Golden` }, priceCents: 137540, currency: "EUR", attributes: { color: { label: { pt: `Azul & Escuro & Azul & Dourado`, en: `Blue & Dark Blue & Golden` }, hex: ["#1f3c66", "#2a2d34"] } }, image: `/products/ligne-2-2/C16457.webp`, images: [`/products/ligne-2-2/C16457.webp`, `/products/ligne-2-2/C16457-2.webp`, `/products/ligne-2-2/C16457-3.webp`, `/products/ligne-2-2/C16457-4.webp`] },
      { sku: `C16455`, name: { pt: `Ligne 2 — Cinza & Prata`, en: `Ligne 2 — Grey & Silver` }, priceCents: 119140, currency: "EUR", attributes: { color: { label: { pt: `Cinza & Prata`, en: `Grey & Silver` }, hex: ["#7a7d83", "#c9ccd1"] } }, image: `/products/ligne-2-2/C16455.webp`, images: [`/products/ligne-2-2/C16455.webp`, `/products/ligne-2-2/C16455-2.webp`, `/products/ligne-2-2/C16455-3.webp`, `/products/ligne-2-2/C16455-4.webp`] },
      { sku: `016884`, name: { pt: `Ligne 2 — Preto & Amarelo`, en: `Ligne 2 — Black & Yellow` }, priceCents: 142600, currency: "EUR", attributes: { color: { label: { pt: `Preto & Amarelo`, en: `Black & Yellow` }, hex: ["#15171c", "#d8b04a"] } }, image: `/products/ligne-2-2/016884.webp`, images: [`/products/ligne-2-2/016884.webp`, `/products/ligne-2-2/016884-2.webp`, `/products/ligne-2-2/016884-3.webp`, `/products/ligne-2-2/016884-4.webp`] },
      { sku: `016184`, name: { pt: `Ligne 2 — Prata`, en: `Ligne 2 — Silver` }, priceCents: 119140, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/ligne-2-2/016184.webp`, images: [`/products/ligne-2-2/016184.webp`, `/products/ligne-2-2/016184-2.webp`, `/products/ligne-2-2/016184-3.webp`, `/products/ligne-2-2/016184-4.webp`] },
      { sku: `016134`, name: { pt: `Ligne 2 — Preto & Azul & Dourado`, en: `Ligne 2 — Black & Blue & Golden` }, priceCents: 151800, currency: "EUR", attributes: { color: { label: { pt: `Preto & Azul & Dourado`, en: `Black & Blue & Golden` }, hex: ["#15171c", "#1f3c66"] } }, image: `/products/ligne-2-2/016134.webp`, images: [`/products/ligne-2-2/016134.webp`, `/products/ligne-2-2/016134-2.webp`, `/products/ligne-2-2/016134-3.webp`, `/products/ligne-2-2/016134-4.webp`] }
    ],
  },
  {
    slug: `table-lighter`,
    name: { pt: `Table lighter`, en: `Table lighter` },
    description: { pt: `Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges.`, en: `S.T. Dupont lighter — hand-polished lacquer, signature flame mechanism and the iconic cling® of the Faverges manufacture.` },
    collection: `Table lighter`,
    categorySlug: "isqueiros",
    image: `/products/table-lighter/T20101.webp`,
    variants: [
      { sku: `T20101`, name: { pt: `Table lighter — Prata`, en: `Table lighter — Silver` }, priceCents: 73140, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/table-lighter/T20101.webp`, images: [`/products/table-lighter/T20101.webp`, `/products/table-lighter/T20101-2.webp`, `/products/table-lighter/T20101-3.webp`, `/products/table-lighter/T20101-4.webp`] },
      { sku: `T20100`, name: { pt: `Table lighter — Dourado`, en: `Table lighter — Golden` }, priceCents: 73140, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/table-lighter/T20100.webp`, images: [`/products/table-lighter/T20100.webp`, `/products/table-lighter/T20100-2.webp`, `/products/table-lighter/T20100-3.webp`, `/products/table-lighter/T20100-4.webp`] }
    ],
  },
  {
    slug: `le-grand-dupont-fuente`,
    name: { pt: `Le Grand Dupont · Fuente`, en: `Le Grand Dupont · Fuente` },
    description: { pt: `Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges.`, en: `S.T. Dupont lighter — hand-polished lacquer, signature flame mechanism and the iconic cling® of the Faverges manufacture.` },
    collection: `Le Grand Dupont`,
    categorySlug: "isqueiros",
    image: `/products/le-grand-dupont-fuente/C23060CL.webp`,
    variants: [
      { sku: `C23060CL`, name: { pt: `Le Grand Dupont · Fuente — Multicolor`, en: `Le Grand Dupont · Fuente — Multicolor` }, priceCents: 192740, currency: "EUR", attributes: { color: { label: { pt: `Multicolor`, en: `Multicolor` }, hex: ["#7a7d83"] } }, image: `/products/le-grand-dupont-fuente/C23060CL.webp`, images: [`/products/le-grand-dupont-fuente/C23060CL.webp`, `/products/le-grand-dupont-fuente/C23060CL-2.webp`, `/products/le-grand-dupont-fuente/C23060CL-3.webp`, `/products/le-grand-dupont-fuente/C23060CL-4.webp`] }
    ],
  },
  {
    slug: `ligne-2-fuente`,
    name: { pt: `Ligne 2 · Fuente`, en: `Ligne 2 · Fuente` },
    description: { pt: `Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges.`, en: `S.T. Dupont lighter — hand-polished lacquer, signature flame mechanism and the iconic cling® of the Faverges manufacture.` },
    collection: `Ligne 2`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-fuente/C16060CL.webp`,
    variants: [
      { sku: `C16060CL`, name: { pt: `Ligne 2 · Fuente — Multicolor`, en: `Ligne 2 · Fuente — Multicolor` }, priceCents: 174340, currency: "EUR", attributes: { color: { label: { pt: `Multicolor`, en: `Multicolor` }, hex: ["#7a7d83"] } }, image: `/products/ligne-2-fuente/C16060CL.webp`, images: [`/products/ligne-2-fuente/C16060CL.webp`, `/products/ligne-2-fuente/C16060CL-2.webp`, `/products/ligne-2-fuente/C16060CL-3.webp`, `/products/ligne-2-fuente/C16060CL-4.webp`] }
    ],
  },
  {
    slug: `twiggy-20000-lieues-sous-les-mers`,
    name: { pt: `Twiggy · 20.000 Léguas Submarinas`, en: `Twiggy · 20000 Lieues sous les mers` },
    description: { pt: `Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges.`, en: `S.T. Dupont lighter — hand-polished lacquer, signature flame mechanism and the iconic cling® of the Faverges manufacture.` },
    collection: `Twiggy`,
    categorySlug: "isqueiros",
    image: `/products/twiggy-20000-lieues-sous-les-mers/030053.webp`,
    variants: [
      { sku: `030053`, name: { pt: `Twiggy · 20000 Lieues sous les mers — Real & Azul`, en: `Twiggy · 20000 Lieues sous les mers — Royal Blue` }, priceCents: 41400, currency: "EUR", attributes: { color: { label: { pt: `Real & Azul`, en: `Royal Blue` }, hex: ["#2845a3", "#1f3c66"] } }, image: `/products/twiggy-20000-lieues-sous-les-mers/030053.webp`, images: [`/products/twiggy-20000-lieues-sous-les-mers/030053.webp`, `/products/twiggy-20000-lieues-sous-les-mers/030053-2.webp`, `/products/twiggy-20000-lieues-sous-les-mers/030053-3.webp`, `/products/twiggy-20000-lieues-sous-les-mers/030053-4.webp`] }
    ],
  },
  {
    slug: `slimmy-20000-lieues-sous-les-mers`,
    name: { pt: `Slimmy · 20.000 Léguas Submarinas`, en: `Slimmy · 20000 Lieues sous les mers` },
    description: { pt: `Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges.`, en: `S.T. Dupont lighter — hand-polished lacquer, signature flame mechanism and the iconic cling® of the Faverges manufacture.` },
    collection: `Slimmy`,
    categorySlug: "isqueiros",
    image: `/products/slimmy-20000-lieues-sous-les-mers/028053.webp`,
    variants: [
      { sku: `028053`, name: { pt: `Slimmy · 20000 Lieues sous les mers — Real & Azul`, en: `Slimmy · 20000 Lieues sous les mers — Royal Blue` }, priceCents: 41400, currency: "EUR", attributes: { color: { label: { pt: `Real & Azul`, en: `Royal Blue` }, hex: ["#2845a3", "#1f3c66"] } }, image: `/products/slimmy-20000-lieues-sous-les-mers/028053.webp`, images: [`/products/slimmy-20000-lieues-sous-les-mers/028053.webp`, `/products/slimmy-20000-lieues-sous-les-mers/028053-2.webp`, `/products/slimmy-20000-lieues-sous-les-mers/028053-3.webp`, `/products/slimmy-20000-lieues-sous-les-mers/028053-4.webp`] }
    ],
  },
  {
    slug: `ligne-2-20000-lieues-sous-les-mers`,
    name: { pt: `Ligne 2 · 20.000 Léguas Submarinas`, en: `Ligne 2 · 20000 Lieues sous les mers` },
    description: { pt: `Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges.`, en: `S.T. Dupont lighter — hand-polished lacquer, signature flame mechanism and the iconic cling® of the Faverges manufacture.` },
    collection: `Ligne 2`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-20000-lieues-sous-les-mers/C16051CL-2.webp`,
    variants: [
      { sku: `C16051CL`, name: { pt: `Ligne 2 · 20000 Lieues sous les mers — Azul & Gulf & Stream`, en: `Ligne 2 · 20000 Lieues sous les mers — Blue Gulf Stream` }, priceCents: 201940, currency: "EUR", attributes: { color: { label: { pt: `Azul & Gulf & Stream`, en: `Blue Gulf Stream` }, hex: ["#1f3c66"] } }, image: `/products/ligne-2-20000-lieues-sous-les-mers/C16051CL-2.webp`, images: [`/products/ligne-2-20000-lieues-sous-les-mers/C16051CL-2.webp`, `/products/ligne-2-20000-lieues-sous-les-mers/C16051CL-3.webp`, `/products/ligne-2-20000-lieues-sous-les-mers/C16051CL-4.webp`] }
    ],
  },
  {
    slug: `windproof`,
    name: { pt: `Windproof`, en: `Windproof` },
    description: { pt: `Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges.`, en: `S.T. Dupont lighter — hand-polished lacquer, signature flame mechanism and the iconic cling® of the Faverges manufacture.` },
    collection: `Windproof`,
    categorySlug: "isqueiros",
    image: `/products/windproof/W21325.webp`,
    variants: [
      { sku: `W21325`, name: { pt: `Windproof — Cobre`, en: `Windproof — Copper` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Cobre`, en: `Copper` }, hex: ["#a7592c"] } }, image: `/products/windproof/W21325.webp`, images: [`/products/windproof/W21325.webp`, `/products/windproof/W21325-2.webp`, `/products/windproof/W21325-3.webp`, `/products/windproof/W21325-4.webp`] },
      { sku: `W21323`, name: { pt: `Windproof — Preto`, en: `Windproof — Black` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/windproof/W21323.webp`, images: [`/products/windproof/W21323.webp`, `/products/windproof/W21323-2.webp`, `/products/windproof/W21323-3.webp`, `/products/windproof/W21323-4.webp`] },
      { sku: `W21324`, name: { pt: `Windproof — Prata`, en: `Windproof — Silver` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/windproof/W21324.webp`, images: [`/products/windproof/W21324.webp`, `/products/windproof/W21324-2.webp`, `/products/windproof/W21324-3.webp`, `/products/windproof/W21324-4.webp`] }
    ],
  },
  {
    slug: `lighter-necklace`,
    name: { pt: `Colar Isqueiro`, en: `Lighter necklace` },
    description: { pt: `Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges.`, en: `S.T. Dupont lighter — hand-polished lacquer, signature flame mechanism and the iconic cling® of the Faverges manufacture.` },
    collection: `Colar Isqueiro`,
    categorySlug: "isqueiros",
    image: `/products/lighter-necklace/K27077CH.webp`,
    variants: [
      { sku: `K27077CH`, name: { pt: `Lighter necklace — Dourado`, en: `Lighter necklace — Golden` }, priceCents: 45540, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/lighter-necklace/K27077CH.webp`, images: [`/products/lighter-necklace/K27077CH.webp`, `/products/lighter-necklace/K27077CH-2.webp`, `/products/lighter-necklace/K27077CH-3.webp`, `/products/lighter-necklace/K27077CH-4.webp`] },
      { sku: `K27076CH`, name: { pt: `Lighter necklace — Prata`, en: `Lighter necklace — Silver` }, priceCents: 45540, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/lighter-necklace/K27076CH.webp`, images: [`/products/lighter-necklace/K27076CH.webp`, `/products/lighter-necklace/K27076CH-2.webp`, `/products/lighter-necklace/K27076CH-3.webp`, `/products/lighter-necklace/K27076CH-4.webp`] },
      { sku: `K27068CH`, name: { pt: `Lighter necklace — Preto`, en: `Lighter necklace — Black` }, priceCents: 44620, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/lighter-necklace/K27068CH.webp`, images: [`/products/lighter-necklace/K27068CH.webp`, `/products/lighter-necklace/K27068CH-2.webp`, `/products/lighter-necklace/K27068CH-3.webp`, `/products/lighter-necklace/K27068CH-4.webp`] },
      { sku: `K27067CH`, name: { pt: `Lighter necklace — Dourado`, en: `Lighter necklace — Golden` }, priceCents: 44620, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/lighter-necklace/K27067CH.webp`, images: [`/products/lighter-necklace/K27067CH.webp`, `/products/lighter-necklace/K27067CH-2.webp`, `/products/lighter-necklace/K27067CH-3.webp`, `/products/lighter-necklace/K27067CH-4.webp`] },
      { sku: `K27066CH`, name: { pt: `Lighter necklace — Prata`, en: `Lighter necklace — Silver` }, priceCents: 44620, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/lighter-necklace/K27066CH.webp`, images: [`/products/lighter-necklace/K27066CH.webp`, `/products/lighter-necklace/K27066CH-2.webp`, `/products/lighter-necklace/K27066CH-3.webp`, `/products/lighter-necklace/K27066CH-4.webp`] }
    ],
  },
  {
    slug: `twiggy-fender`,
    name: { pt: `Twiggy · Fender`, en: `Twiggy · Fender` },
    description: { pt: `Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges.`, en: `S.T. Dupont lighter — hand-polished lacquer, signature flame mechanism and the iconic cling® of the Faverges manufacture.` },
    collection: `Twiggy`,
    categorySlug: "isqueiros",
    image: `/products/twiggy-fender/030025.webp`,
    variants: [
      { sku: `030025`, name: { pt: `Twiggy · Fender — Preto`, en: `Twiggy · Fender — Black` }, priceCents: 41400, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/twiggy-fender/030025.webp`, images: [`/products/twiggy-fender/030025.webp`, `/products/twiggy-fender/030025-2.webp`, `/products/twiggy-fender/030025-3.webp`, `/products/twiggy-fender/030025-4.webp`] }
    ],
  },
  {
    slug: `slimmy-fender`,
    name: { pt: `Slimmy · Fender`, en: `Slimmy · Fender` },
    description: { pt: `Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges.`, en: `S.T. Dupont lighter — hand-polished lacquer, signature flame mechanism and the iconic cling® of the Faverges manufacture.` },
    collection: `Slimmy`,
    categorySlug: "isqueiros",
    image: `/products/slimmy-fender/028025.webp`,
    variants: [
      { sku: `028025`, name: { pt: `Slimmy · Fender — Preto`, en: `Slimmy · Fender — Black` }, priceCents: 41400, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/slimmy-fender/028025.webp`, images: [`/products/slimmy-fender/028025.webp`, `/products/slimmy-fender/028025-2.webp`, `/products/slimmy-fender/028025-3.webp`, `/products/slimmy-fender/028025-4.webp`] }
    ],
  },
  {
    slug: `biggy-fender`,
    name: { pt: `Biggy · Fender`, en: `Biggy · Fender` },
    description: { pt: `Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges.`, en: `S.T. Dupont lighter — hand-polished lacquer, signature flame mechanism and the iconic cling® of the Faverges manufacture.` },
    collection: `Biggy`,
    categorySlug: "isqueiros",
    image: `/products/biggy-fender/025025.webp`,
    variants: [
      { sku: `025025`, name: { pt: `Biggy · Fender — Preto`, en: `Biggy · Fender — Black` }, priceCents: 45540, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/biggy-fender/025025.webp`, images: [`/products/biggy-fender/025025.webp`, `/products/biggy-fender/025025-2.webp`, `/products/biggy-fender/025025-3.webp`, `/products/biggy-fender/025025-4.webp`] }
    ],
  },
  {
    slug: `ligne-2-fender`,
    name: { pt: `Ligne 2 · Fender`, en: `Ligne 2 · Fender` },
    description: { pt: `Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges.`, en: `S.T. Dupont lighter — hand-polished lacquer, signature flame mechanism and the iconic cling® of the Faverges manufacture.` },
    collection: `Ligne 2`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-fender/C16026CL.webp`,
    variants: [
      { sku: `C16026CL`, name: { pt: `Ligne 2 · Fender — Azul & Fender`, en: `Ligne 2 · Fender — Blue Fender` }, priceCents: 201940, currency: "EUR", attributes: { color: { label: { pt: `Azul & Fender`, en: `Blue Fender` }, hex: ["#1f3c66"] } }, image: `/products/ligne-2-fender/C16026CL.webp`, images: [`/products/ligne-2-fender/C16026CL.webp`, `/products/ligne-2-fender/C16026CL-2.webp`, `/products/ligne-2-fender/C16026CL-3.webp`, `/products/ligne-2-fender/C16026CL-4.webp`] }
    ],
  },
  {
    slug: `le-grand-dupont-monogram-1872`,
    name: { pt: `Le Grand Dupont · Monogram 1872`, en: `Le Grand Dupont · monogram 1872` },
    description: { pt: `Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges.`, en: `S.T. Dupont lighter — hand-polished lacquer, signature flame mechanism and the iconic cling® of the Faverges manufacture.` },
    collection: `Le Grand Dupont`,
    categorySlug: "isqueiros",
    image: `/products/le-grand-dupont-monogram-1872/C16655.webp`,
    variants: [
      { sku: `C16655`, name: { pt: `Le Grand Dupont · monogram 1872 — Prata`, en: `Le Grand Dupont · monogram 1872 — Silver` }, priceCents: 155940, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/le-grand-dupont-monogram-1872/C16655.webp`, images: [`/products/le-grand-dupont-monogram-1872/C16655.webp`, `/products/le-grand-dupont-monogram-1872/C16655-2.webp`] },
      { sku: `C23178`, name: { pt: `Le Grand Dupont · monogram 1872 — Dourado`, en: `Le Grand Dupont · monogram 1872 — Golden` }, priceCents: 174340, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/le-grand-dupont-monogram-1872/C23178.webp`, images: [`/products/le-grand-dupont-monogram-1872/C23178.webp`, `/products/le-grand-dupont-monogram-1872/C23178-2.webp`, `/products/le-grand-dupont-monogram-1872/C23178-3.webp`, `/products/le-grand-dupont-monogram-1872/C23178-4.webp`] },
      { sku: `C23180`, name: { pt: `Le Grand Dupont · monogram 1872 — Prata`, en: `Le Grand Dupont · monogram 1872 — Silver` }, priceCents: 174340, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/le-grand-dupont-monogram-1872/C23180.webp`, images: [`/products/le-grand-dupont-monogram-1872/C23180.webp`, `/products/le-grand-dupont-monogram-1872/C23180-2.webp`, `/products/le-grand-dupont-monogram-1872/C23180-3.webp`, `/products/le-grand-dupont-monogram-1872/C23180-4.webp`] },
      { sku: `C23179`, name: { pt: `Le Grand Dupont · monogram 1872 — Preto`, en: `Le Grand Dupont · monogram 1872 — Black` }, priceCents: 174340, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/le-grand-dupont-monogram-1872/C23179.webp`, images: [`/products/le-grand-dupont-monogram-1872/C23179.webp`, `/products/le-grand-dupont-monogram-1872/C23179-2.webp`, `/products/le-grand-dupont-monogram-1872/C23179-3.webp`, `/products/le-grand-dupont-monogram-1872/C23179-4.webp`] }
    ],
  },
  {
    slug: `slimmy-2`,
    name: { pt: `Slimmy`, en: `Slimmy` },
    description: { pt: `Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges.`, en: `S.T. Dupont lighter — hand-polished lacquer, signature flame mechanism and the iconic cling® of the Faverges manufacture.` },
    collection: `Slimmy`,
    categorySlug: "isqueiros",
    image: `/products/slimmy-2/028030.webp`,
    variants: [
      { sku: `028030`, name: { pt: `Slimmy — Bordeaux`, en: `Slimmy — Burgundy` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Bordeaux`, en: `Burgundy` }, hex: ["#5e1f1f"] } }, image: `/products/slimmy-2/028030.webp`, images: [`/products/slimmy-2/028030.webp`, `/products/slimmy-2/028030-2.webp`, `/products/slimmy-2/028030-3.webp`, `/products/slimmy-2/028030-4.webp`] },
      { sku: `028120`, name: { pt: `Slimmy — Prata`, en: `Slimmy — Silver` }, priceCents: 39100, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/slimmy-2/028120.webp`, images: [`/products/slimmy-2/028120.webp`, `/products/slimmy-2/028120-2.webp`, `/products/slimmy-2/028120-3.webp`, `/products/slimmy-2/028120-4.webp`] },
      { sku: `028119`, name: { pt: `Slimmy — Dourado`, en: `Slimmy — Golden` }, priceCents: 39100, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/slimmy-2/028119.webp`, images: [`/products/slimmy-2/028119.webp`, `/products/slimmy-2/028119-2.webp`, `/products/slimmy-2/028119-3.webp`, `/products/slimmy-2/028119-4.webp`] },
      { sku: `028006`, name: { pt: `Slimmy — Coral & Rosa`, en: `Slimmy — Coral & Pink` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Coral & Rosa`, en: `Coral & Pink` }, hex: ["#e2675a", "#e7a3b1"] } }, image: `/products/slimmy-2/028006.webp`, images: [`/products/slimmy-2/028006.webp`, `/products/slimmy-2/028006-2.webp`, `/products/slimmy-2/028006-3.webp`, `/products/slimmy-2/028006-4.webp`] },
      { sku: `028225`, name: { pt: `Slimmy — Azul & Índigo & Azul`, en: `Slimmy — Blue & Indigo Blue` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Azul & Índigo & Azul`, en: `Blue & Indigo Blue` }, hex: ["#1f3c66", "#2c2c63"] } }, image: `/products/slimmy-2/028225.webp`, images: [`/products/slimmy-2/028225.webp`, `/products/slimmy-2/028225-2.webp`, `/products/slimmy-2/028225-3.webp`, `/products/slimmy-2/028225-4.webp`] },
      { sku: `028224`, name: { pt: `Slimmy — Branco`, en: `Slimmy — White` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Branco`, en: `White` }, hex: ["#f3efe6"] } }, image: `/products/slimmy-2/028224.webp`, images: [`/products/slimmy-2/028224.webp`, `/products/slimmy-2/028224-2.webp`, `/products/slimmy-2/028224-3.webp`, `/products/slimmy-2/028224-4.webp`] },
      { sku: `028222`, name: { pt: `Slimmy — Preto`, en: `Slimmy — Black` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/slimmy-2/028222.webp`, images: [`/products/slimmy-2/028222.webp`, `/products/slimmy-2/028222-2.webp`, `/products/slimmy-2/028222-3.webp`, `/products/slimmy-2/028222-4.webp`] },
      { sku: `028221`, name: { pt: `Slimmy — Preto & Prata`, en: `Slimmy — Black & Silver` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Preto & Prata`, en: `Black & Silver` }, hex: ["#15171c", "#c9ccd1"] } }, image: `/products/slimmy-2/028221.webp`, images: [`/products/slimmy-2/028221.webp`, `/products/slimmy-2/028221-2.webp`, `/products/slimmy-2/028221-3.webp`, `/products/slimmy-2/028221-4.webp`] }
    ],
  },
  {
    slug: `ligne-2-camo`,
    name: { pt: `Ligne 2 · Camuflado`, en: `Ligne 2 · Camo` },
    description: { pt: `Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges.`, en: `S.T. Dupont lighter — hand-polished lacquer, signature flame mechanism and the iconic cling® of the Faverges manufacture.` },
    collection: `Ligne 2`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-camo/C16050.webp`,
    variants: [
      { sku: `C16050`, name: { pt: `Ligne 2 · Camo — Caqui`, en: `Ligne 2 · Camo — Khaki` }, priceCents: 142600, currency: "EUR", attributes: { color: { label: { pt: `Caqui`, en: `Khaki` }, hex: ["#7a7a4b"] } }, image: `/products/ligne-2-camo/C16050.webp`, images: [`/products/ligne-2-camo/C16050.webp`, `/products/ligne-2-camo/C16050-2.webp`, `/products/ligne-2-camo/C16050-3.webp`, `/products/ligne-2-camo/C16050-4.webp`] }
    ],
  },
  {
    slug: `maxijet-snake-skin`,
    name: { pt: `Maxijet · Pele de Cobra`, en: `Maxijet · Snake skin` },
    description: { pt: `Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges.`, en: `S.T. Dupont lighter — hand-polished lacquer, signature flame mechanism and the iconic cling® of the Faverges manufacture.` },
    collection: `Maxijet`,
    categorySlug: "isqueiros",
    image: `/products/maxijet-snake-skin/020151.webp`,
    variants: [
      { sku: `020151`, name: { pt: `Maxijet · Snake skin — Vermelho`, en: `Maxijet · Snake skin — Red` }, priceCents: 29900, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/maxijet-snake-skin/020151.webp`, images: [`/products/maxijet-snake-skin/020151.webp`, `/products/maxijet-snake-skin/020151-2.webp`, `/products/maxijet-snake-skin/020151-3.webp`, `/products/maxijet-snake-skin/020151-4.webp`] }
    ],
  },
  {
    slug: `biggy-monogram-1872`,
    name: { pt: `Biggy · Monogram 1872`, en: `Biggy · monogram 1872` },
    description: { pt: `Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges.`, en: `S.T. Dupont lighter — hand-polished lacquer, signature flame mechanism and the iconic cling® of the Faverges manufacture.` },
    collection: `Biggy`,
    categorySlug: "isqueiros",
    image: `/products/biggy-monogram-1872/025080.webp`,
    variants: [
      { sku: `025080`, name: { pt: `Biggy · monogram 1872 — Cinza`, en: `Biggy · monogram 1872 — Grey` }, priceCents: 48300, currency: "EUR", attributes: { color: { label: { pt: `Cinza`, en: `Grey` }, hex: ["#7a7d83"] } }, image: `/products/biggy-monogram-1872/025080.webp`, images: [`/products/biggy-monogram-1872/025080.webp`, `/products/biggy-monogram-1872/025080-2.webp`, `/products/biggy-monogram-1872/025080-3.webp`, `/products/biggy-monogram-1872/025080-4.webp`] },
      { sku: `025079`, name: { pt: `Biggy · monogram 1872 — Preto`, en: `Biggy · monogram 1872 — Black` }, priceCents: 48300, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/biggy-monogram-1872/025079.webp`, images: [`/products/biggy-monogram-1872/025079.webp`, `/products/biggy-monogram-1872/025079-2.webp`, `/products/biggy-monogram-1872/025079-3.webp`, `/products/biggy-monogram-1872/025079-4.webp`] },
      { sku: `025078B`, name: { pt: `Biggy · monogram 1872 — Bordeaux`, en: `Biggy · monogram 1872 — Burgundy` }, priceCents: 48300, currency: "EUR", attributes: { color: { label: { pt: `Bordeaux`, en: `Burgundy` }, hex: ["#5e1f1f"] } }, image: `/products/biggy-monogram-1872/025078B.webp`, images: [`/products/biggy-monogram-1872/025078B.webp`, `/products/biggy-monogram-1872/025078B-2.webp`, `/products/biggy-monogram-1872/025078B-3.webp`, `/products/biggy-monogram-1872/025078B-4.webp`] }
    ],
  },
  {
    slug: `ligne-2-monogram-1872`,
    name: { pt: `Ligne 2 · Monogram 1872`, en: `Ligne 2 · monogram 1872` },
    description: { pt: `Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges.`, en: `S.T. Dupont lighter — hand-polished lacquer, signature flame mechanism and the iconic cling® of the Faverges manufacture.` },
    collection: `Ligne 2`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-monogram-1872/C16180.webp`,
    variants: [
      { sku: `C16180`, name: { pt: `Ligne 2 · monogram 1872 — Prata`, en: `Ligne 2 · monogram 1872 — Silver` }, priceCents: 133400, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/ligne-2-monogram-1872/C16180.webp`, images: [`/products/ligne-2-monogram-1872/C16180.webp`, `/products/ligne-2-monogram-1872/C16180-2.webp`, `/products/ligne-2-monogram-1872/C16180-3.webp`, `/products/ligne-2-monogram-1872/C16180-4.webp`] },
      { sku: `C16179`, name: { pt: `Ligne 2 · monogram 1872 — Preto`, en: `Ligne 2 · monogram 1872 — Black` }, priceCents: 133400, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/ligne-2-monogram-1872/C16179.webp`, images: [`/products/ligne-2-monogram-1872/C16179.webp`, `/products/ligne-2-monogram-1872/C16179-2.webp`, `/products/ligne-2-monogram-1872/C16179-3.webp`, `/products/ligne-2-monogram-1872/C16179-4.webp`] },
      { sku: `C16178`, name: { pt: `Ligne 2 · monogram 1872 — Dourado`, en: `Ligne 2 · monogram 1872 — Golden` }, priceCents: 133400, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/ligne-2-monogram-1872/C16178.webp`, images: [`/products/ligne-2-monogram-1872/C16178.webp`, `/products/ligne-2-monogram-1872/C16178-2.webp`, `/products/ligne-2-monogram-1872/C16178-3.webp`, `/products/ligne-2-monogram-1872/C16178-4.webp`] }
    ],
  },
  {
    slug: `cigar-cutter-monogram-1872`,
    name: { pt: `Cortador de Charuto · Monogram 1872`, en: `Cigar cutter · monogram 1872` },
    description: { pt: `Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges.`, en: `S.T. Dupont lighter — hand-polished lacquer, signature flame mechanism and the iconic cling® of the Faverges manufacture.` },
    collection: `Cortador de Charuto`,
    categorySlug: "isqueiros",
    image: `/products/cigar-cutter-monogram-1872/003480M.webp`,
    variants: [
      { sku: `003480M`, name: { pt: `Cigar cutter · monogram 1872 — Claro & Cinza`, en: `Cigar cutter · monogram 1872 — Light Gray` }, priceCents: 31740, currency: "EUR", attributes: { color: { label: { pt: `Claro & Cinza`, en: `Light Gray` }, hex: ["#cfd2d8", "#7a7d83"] } }, image: `/products/cigar-cutter-monogram-1872/003480M.webp`, images: [`/products/cigar-cutter-monogram-1872/003480M.webp`, `/products/cigar-cutter-monogram-1872/003480M-2.webp`, `/products/cigar-cutter-monogram-1872/003480M-3.webp`] },
      { sku: `003479`, name: { pt: `Cigar cutter · monogram 1872 — Preto`, en: `Cigar cutter · monogram 1872 — Black` }, priceCents: 31740, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/cigar-cutter-monogram-1872/003479.webp`, images: [`/products/cigar-cutter-monogram-1872/003479.webp`, `/products/cigar-cutter-monogram-1872/003479-2.webp`, `/products/cigar-cutter-monogram-1872/003479-3.webp`] }
    ],
  },
  {
    slug: `slimmy-game-of-thrones`,
    name: { pt: `Slimmy · Game of Thrones`, en: `Slimmy · Game of Thrones` },
    description: { pt: `Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges.`, en: `S.T. Dupont lighter — hand-polished lacquer, signature flame mechanism and the iconic cling® of the Faverges manufacture.` },
    collection: `Slimmy`,
    categorySlug: "isqueiros",
    image: `/products/slimmy-game-of-thrones/028112.webp`,
    variants: [
      { sku: `028112`, name: { pt: `Slimmy · Game of Thrones — Preto`, en: `Slimmy · Game of Thrones — Black` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/slimmy-game-of-thrones/028112.webp`, images: [`/products/slimmy-game-of-thrones/028112.webp`, `/products/slimmy-game-of-thrones/028112-2.webp`, `/products/slimmy-game-of-thrones/028112-3.webp`, `/products/slimmy-game-of-thrones/028112-4.webp`] },
      { sku: `028113`, name: { pt: `Slimmy · Game of Thrones — Claro & Cinza`, en: `Slimmy · Game of Thrones — Light Gray` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Claro & Cinza`, en: `Light Gray` }, hex: ["#cfd2d8", "#7a7d83"] } }, image: `/products/slimmy-game-of-thrones/028113.webp`, images: [`/products/slimmy-game-of-thrones/028113.webp`, `/products/slimmy-game-of-thrones/028113-2.webp`, `/products/slimmy-game-of-thrones/028113-3.webp`, `/products/slimmy-game-of-thrones/028113-4.webp`] }
    ],
  },
  {
    slug: `le-grand-dupont-padron`,
    name: { pt: `Le Grand Dupont · Padrón`, en: `Le Grand Dupont · Padron` },
    description: { pt: `Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges.`, en: `S.T. Dupont lighter — hand-polished lacquer, signature flame mechanism and the iconic cling® of the Faverges manufacture.` },
    collection: `Le Grand Dupont`,
    categorySlug: "isqueiros",
    image: `/products/le-grand-dupont-padron/C23014.webp`,
    variants: [
      { sku: `C23014`, name: { pt: `Le Grand Dupont · Padron — Castanho`, en: `Le Grand Dupont · Padron — Brown` }, priceCents: 183540, currency: "EUR", attributes: { color: { label: { pt: `Castanho`, en: `Brown` }, hex: ["#6b4a2a"] } }, image: `/products/le-grand-dupont-padron/C23014.webp`, images: [`/products/le-grand-dupont-padron/C23014.webp`, `/products/le-grand-dupont-padron/C23014-2.webp`, `/products/le-grand-dupont-padron/C23014-3.webp`, `/products/le-grand-dupont-padron/C23014-4.webp`] }
    ],
  },
  {
    slug: `ligne-2-padron`,
    name: { pt: `Ligne 2 · Padrón`, en: `Ligne 2 · Padron` },
    description: { pt: `Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges.`, en: `S.T. Dupont lighter — hand-polished lacquer, signature flame mechanism and the iconic cling® of the Faverges manufacture.` },
    collection: `Ligne 2`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-padron/C16014.webp`,
    variants: [
      { sku: `C16014`, name: { pt: `Ligne 2 · Padron — Castanho`, en: `Ligne 2 · Padron — Brown` }, priceCents: 174340, currency: "EUR", attributes: { color: { label: { pt: `Castanho`, en: `Brown` }, hex: ["#6b4a2a"] } }, image: `/products/ligne-2-padron/C16014.webp`, images: [`/products/ligne-2-padron/C16014.webp`, `/products/ligne-2-padron/C16014-2.webp`, `/products/ligne-2-padron/C16014-3.webp`, `/products/ligne-2-padron/C16014-4.webp`] }
    ],
  },
  {
    slug: `line-2-perfect-ping`,
    name: { pt: `Line 2 Perfect Cling`, en: `Line 2 Perfect Ping` },
    description: { pt: `Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges.`, en: `S.T. Dupont lighter — hand-polished lacquer, signature flame mechanism and the iconic cling® of the Faverges manufacture.` },
    collection: `Line 2 Perfect Cling`,
    categorySlug: "isqueiros",
    image: `/products/line-2-perfect-ping/C16133.webp`,
    variants: [
      { sku: `C16133`, name: { pt: `Line 2 Perfect Ping — Laranja`, en: `Line 2 Perfect Ping — Orange` }, priceCents: 146740, currency: "EUR", attributes: { color: { label: { pt: `Laranja`, en: `Orange` }, hex: ["#c4642d"] } }, image: `/products/line-2-perfect-ping/C16133.webp`, images: [`/products/line-2-perfect-ping/C16133.webp`, `/products/line-2-perfect-ping/C16133-2.webp`] }
    ],
  },
  {
    slug: `slim7`,
    name: { pt: `Slim 7`, en: `Slim7` },
    description: { pt: `Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges.`, en: `S.T. Dupont lighter — hand-polished lacquer, signature flame mechanism and the iconic cling® of the Faverges manufacture.` },
    collection: `Slim 7`,
    categorySlug: "isqueiros",
    image: `/products/slim7/027772.webp`,
    variants: [
      { sku: `027772`, name: { pt: `Slim7 — Néon & Verde`, en: `Slim7 — Neon Green` }, priceCents: 27140, currency: "EUR", attributes: { color: { label: { pt: `Néon & Verde`, en: `Neon Green` }, hex: ["#aef043", "#3a5040"] } }, image: `/products/slim7/027772.webp`, images: [`/products/slim7/027772.webp`, `/products/slim7/027772-2.webp`, `/products/slim7/027772-3.webp`, `/products/slim7/027772-4.webp`] },
      { sku: `027771`, name: { pt: `Slim7 — Néon & Azul`, en: `Slim7 — Neon Blue` }, priceCents: 27140, currency: "EUR", attributes: { color: { label: { pt: `Néon & Azul`, en: `Neon Blue` }, hex: ["#aef043", "#1f3c66"] } }, image: `/products/slim7/027771.webp`, images: [`/products/slim7/027771.webp`, `/products/slim7/027771-2.webp`, `/products/slim7/027771-3.webp`, `/products/slim7/027771-4.webp`] },
      { sku: `027769`, name: { pt: `Slim7 — Néon & Laranja`, en: `Slim7 — Neon Orange` }, priceCents: 27140, currency: "EUR", attributes: { color: { label: { pt: `Néon & Laranja`, en: `Neon Orange` }, hex: ["#aef043", "#c4642d"] } }, image: `/products/slim7/027769.webp`, images: [`/products/slim7/027769.webp`, `/products/slim7/027769-2.webp`, `/products/slim7/027769-3.webp`, `/products/slim7/027769-4.webp`] }
    ],
  },
  {
    slug: `defi-xtreme`,
    name: { pt: `Défi Xtreme`, en: `Defi xtreme` },
    description: { pt: `Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges.`, en: `S.T. Dupont lighter — hand-polished lacquer, signature flame mechanism and the iconic cling® of the Faverges manufacture.` },
    collection: `Défi Xtreme`,
    categorySlug: "isqueiros",
    image: `/products/defi-xtreme/021417.webp`,
    variants: [
      { sku: `021417`, name: { pt: `Defi xtreme — Néon & Verde`, en: `Defi xtreme — Neon Green` }, priceCents: 34500, currency: "EUR", attributes: { color: { label: { pt: `Néon & Verde`, en: `Neon Green` }, hex: ["#aef043", "#3a5040"] } }, image: `/products/defi-xtreme/021417.webp`, images: [`/products/defi-xtreme/021417.webp`, `/products/defi-xtreme/021417-2.webp`, `/products/defi-xtreme/021417-3.webp`, `/products/defi-xtreme/021417-4.webp`] },
      { sku: `021416`, name: { pt: `Defi xtreme — Néon & Azul`, en: `Defi xtreme — Neon Blue` }, priceCents: 34500, currency: "EUR", attributes: { color: { label: { pt: `Néon & Azul`, en: `Neon Blue` }, hex: ["#aef043", "#1f3c66"] } }, image: `/products/defi-xtreme/021416.webp`, images: [`/products/defi-xtreme/021416.webp`, `/products/defi-xtreme/021416-2.webp`, `/products/defi-xtreme/021416-3.webp`, `/products/defi-xtreme/021416-4.webp`] }
    ],
  },
  {
    slug: `maxijet`,
    name: { pt: `Maxijet`, en: `Maxijet` },
    description: { pt: `Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges.`, en: `S.T. Dupont lighter — hand-polished lacquer, signature flame mechanism and the iconic cling® of the Faverges manufacture.` },
    collection: `Maxijet`,
    categorySlug: "isqueiros",
    image: `/products/maxijet/020171.webp`,
    variants: [
      { sku: `020171`, name: { pt: `Maxijet — Néon & Azul`, en: `Maxijet — Neon Blue` }, priceCents: 28980, currency: "EUR", attributes: { color: { label: { pt: `Néon & Azul`, en: `Neon Blue` }, hex: ["#aef043", "#1f3c66"] } }, image: `/products/maxijet/020171.webp`, images: [`/products/maxijet/020171.webp`, `/products/maxijet/020171-2.webp`, `/products/maxijet/020171-3.webp`, `/products/maxijet/020171-4.webp`] },
      { sku: `020169`, name: { pt: `Maxijet — Néon & Laranja`, en: `Maxijet — Neon Orange` }, priceCents: 28980, currency: "EUR", attributes: { color: { label: { pt: `Néon & Laranja`, en: `Neon Orange` }, hex: ["#aef043", "#c4642d"] } }, image: `/products/maxijet/020169.webp`, images: [`/products/maxijet/020169.webp`, `/products/maxijet/020169-2.webp`, `/products/maxijet/020169-3.webp`, `/products/maxijet/020169-4.webp`] },
      { sku: `020023`, name: { pt: `Maxijet — Prata`, en: `Maxijet — Silver` }, priceCents: 28980, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/maxijet/020023.webp`, images: [`/products/maxijet/020023.webp`] },
      { sku: `020162`, name: { pt: `Maxijet — Rosa`, en: `Maxijet — Pink` }, priceCents: 28980, currency: "EUR", attributes: { color: { label: { pt: `Rosa`, en: `Pink` }, hex: ["#e7a3b1"] } }, image: `/products/maxijet/020162.webp`, images: [`/products/maxijet/020162.webp`, `/products/maxijet/020162-2.webp`, `/products/maxijet/020162-3.webp`, `/products/maxijet/020162-4.webp`] },
      { sku: `020161`, name: { pt: `Maxijet — Azul`, en: `Maxijet — Blue` }, priceCents: 27140, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/maxijet/020161.webp`, images: [`/products/maxijet/020161.webp`, `/products/maxijet/020161-2.webp`, `/products/maxijet/020161-3.webp`, `/products/maxijet/020161-4.webp`] },
      { sku: `020160N`, name: { pt: `Maxijet — Preto & Vermelho`, en: `Maxijet — Black & Red` }, priceCents: 28980, currency: "EUR", attributes: { color: { label: { pt: `Preto & Vermelho`, en: `Black & Red` }, hex: ["#15171c", "#7d2b27"] } }, image: `/products/maxijet/020160N.webp`, images: [`/products/maxijet/020160N.webp`, `/products/maxijet/020160N-2.webp`, `/products/maxijet/020160N-3.webp`, `/products/maxijet/020160N-4.webp`] },
      { sku: `020157N`, name: { pt: `Maxijet — Prata`, en: `Maxijet — Silver` }, priceCents: 28980, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/maxijet/020157N.webp`, images: [`/products/maxijet/020157N.webp`, `/products/maxijet/020157N-2.webp`, `/products/maxijet/020157N-3.webp`, `/products/maxijet/020157N-4.webp`] }
    ],
  },
  {
    slug: `minijet`,
    name: { pt: `Minijet`, en: `Minijet` },
    description: { pt: `Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges.`, en: `S.T. Dupont lighter — hand-polished lacquer, signature flame mechanism and the iconic cling® of the Faverges manufacture.` },
    collection: `Minijet`,
    categorySlug: "isqueiros",
    image: `/products/minijet/010872.webp`,
    variants: [
      { sku: `010872`, name: { pt: `Minijet — Néon & Verde`, en: `Minijet — Neon Green` }, priceCents: 19320, currency: "EUR", attributes: { color: { label: { pt: `Néon & Verde`, en: `Neon Green` }, hex: ["#aef043", "#3a5040"] } }, image: `/products/minijet/010872.webp`, images: [`/products/minijet/010872.webp`, `/products/minijet/010872-2.webp`, `/products/minijet/010872-3.webp`, `/products/minijet/010872-4.webp`] },
      { sku: `010888`, name: { pt: `Minijet — Cinza & Gun Metal & Prata`, en: `Minijet — Grey & Gunmetal & Silver` }, priceCents: 19320, currency: "EUR", attributes: { color: { label: { pt: `Cinza & Gun Metal & Prata`, en: `Grey & Gunmetal & Silver` }, hex: ["#7a7d83", "#4b4f55"] } }, image: `/products/minijet/010888.webp`, images: [`/products/minijet/010888.webp`, `/products/minijet/010888-2.webp`, `/products/minijet/010888-3.webp`, `/products/minijet/010888-4.webp`] },
      { sku: `010887`, name: { pt: `Minijet — Prata`, en: `Minijet — Silver` }, priceCents: 19320, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/minijet/010887.webp`, images: [`/products/minijet/010887.webp`, `/products/minijet/010887-2.webp`, `/products/minijet/010887-3.webp`, `/products/minijet/010887-4.webp`] },
      { sku: `010815`, name: { pt: `Minijet — Preto`, en: `Minijet — Black` }, priceCents: 19320, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/minijet/010815.webp`, images: [`/products/minijet/010815.webp`, `/products/minijet/010815-2.webp`, `/products/minijet/010815-3.webp`, `/products/minijet/010815-4.webp`] },
      { sku: `010885`, name: { pt: `Minijet — Preto`, en: `Minijet — Black` }, priceCents: 19320, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/minijet/010885.webp`, images: [`/products/minijet/010885.webp`, `/products/minijet/010885-2.webp`, `/products/minijet/010885-3.webp`, `/products/minijet/010885-4.webp`] }
    ],
  },
  {
    slug: `biggy-fire-x`,
    name: { pt: `Biggy · Fire X`, en: `Biggy · Fire X` },
    description: { pt: `Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges.`, en: `S.T. Dupont lighter — hand-polished lacquer, signature flame mechanism and the iconic cling® of the Faverges manufacture.` },
    collection: `Biggy`,
    categorySlug: "isqueiros",
    image: `/products/biggy-fire-x/025070.webp`,
    variants: [
      { sku: `025070`, name: { pt: `Biggy · Fire X — Preto`, en: `Biggy · Fire X — Black` }, priceCents: 48300, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/biggy-fire-x/025070.webp`, images: [`/products/biggy-fire-x/025070.webp`, `/products/biggy-fire-x/025070-2.webp`, `/products/biggy-fire-x/025070-3.webp`, `/products/biggy-fire-x/025070-4.webp`] }
    ],
  },
  {
    slug: `ligne-2-fire-x`,
    name: { pt: `Ligne 2 · Fire X`, en: `Ligne 2 · Fire X` },
    description: { pt: `Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges.`, en: `S.T. Dupont lighter — hand-polished lacquer, signature flame mechanism and the iconic cling® of the Faverges manufacture.` },
    collection: `Ligne 2`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-fire-x/C18610.webp`,
    variants: [
      { sku: `C18610`, name: { pt: `Ligne 2 · Fire X — Prata`, en: `Ligne 2 · Fire X — Silver` }, priceCents: 128340, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/ligne-2-fire-x/C18610.webp`, images: [`/products/ligne-2-fire-x/C18610.webp`, `/products/ligne-2-fire-x/C18610-2.webp`, `/products/ligne-2-fire-x/C18610-3.webp`, `/products/ligne-2-fire-x/C18610-4.webp`] },
      { sku: `C18611`, name: { pt: `Ligne 2 · Fire X — Dourado`, en: `Ligne 2 · Fire X — Golden` }, priceCents: 128340, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/ligne-2-fire-x/C18611.webp`, images: [`/products/ligne-2-fire-x/C18611.webp`, `/products/ligne-2-fire-x/C18611-2.webp`, `/products/ligne-2-fire-x/C18611-3.webp`, `/products/ligne-2-fire-x/C18611-4.webp`] },
      { sku: `C18612`, name: { pt: `Ligne 2 · Fire X — Preto`, en: `Ligne 2 · Fire X — Black` }, priceCents: 128340, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/ligne-2-fire-x/C18612.webp`, images: [`/products/ligne-2-fire-x/C18612.webp`, `/products/ligne-2-fire-x/C18612-2.webp`, `/products/ligne-2-fire-x/C18612-3.webp`, `/products/ligne-2-fire-x/C18612-4.webp`] }
    ],
  },
  {
    slug: `maxijet-dragon`,
    name: { pt: `Maxijet · Dragão`, en: `Maxijet · Dragon` },
    description: { pt: `Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges.`, en: `S.T. Dupont lighter — hand-polished lacquer, signature flame mechanism and the iconic cling® of the Faverges manufacture.` },
    collection: `Maxijet`,
    categorySlug: "isqueiros",
    image: `/products/maxijet-dragon/020177.webp`,
    variants: [
      { sku: `020177`, name: { pt: `Maxijet · Dragon — Preto`, en: `Maxijet · Dragon — Black` }, priceCents: 28980, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/maxijet-dragon/020177.webp`, images: [`/products/maxijet-dragon/020177.webp`, `/products/maxijet-dragon/020177-2.webp`, `/products/maxijet-dragon/020177-3.webp`, `/products/maxijet-dragon/020177-4.webp`] },
      { sku: `020175`, name: { pt: `Maxijet · Dragon — Dourado & Mel & Vermelho`, en: `Maxijet · Dragon — Golden & Honey & Red` }, priceCents: 28980, currency: "EUR", attributes: { color: { label: { pt: `Dourado & Mel & Vermelho`, en: `Golden & Honey & Red` }, hex: ["#c8a24a", "#c89b4a"] } }, image: `/products/maxijet-dragon/020175.webp`, images: [`/products/maxijet-dragon/020175.webp`, `/products/maxijet-dragon/020175-2.webp`, `/products/maxijet-dragon/020175-3.webp`, `/products/maxijet-dragon/020175-4.webp`] }
    ],
  },
  {
    slug: `slim-7-dragon`,
    name: { pt: `Slim 7 · Dragão`, en: `Slim 7 · Dragon` },
    description: { pt: `Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges.`, en: `S.T. Dupont lighter — hand-polished lacquer, signature flame mechanism and the iconic cling® of the Faverges manufacture.` },
    collection: `Slim 7`,
    categorySlug: "isqueiros",
    image: `/products/slim-7-dragon/027777.webp`,
    variants: [
      { sku: `027777`, name: { pt: `Slim 7 · Dragon — Preto`, en: `Slim 7 · Dragon — Black` }, priceCents: 27140, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/slim-7-dragon/027777.webp`, images: [`/products/slim-7-dragon/027777.webp`, `/products/slim-7-dragon/027777-2.webp`] }
    ],
  },
  {
    slug: `defi-xxtreme`,
    name: { pt: `Défi XXtreme`, en: `Defi XXtreme` },
    description: { pt: `Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges.`, en: `S.T. Dupont lighter — hand-polished lacquer, signature flame mechanism and the iconic cling® of the Faverges manufacture.` },
    collection: `Défi XXtreme`,
    categorySlug: "isqueiros",
    image: `/products/defi-xxtreme/021605.webp`,
    variants: [
      { sku: `021605`, name: { pt: `Defi XXtreme — Bronze`, en: `Defi XXtreme — Bronze` }, priceCents: 119140, currency: "EUR", attributes: { color: { label: { pt: `Bronze`, en: `Bronze` }, hex: ["#9b6a3a"] } }, image: `/products/defi-xxtreme/021605.webp`, images: [`/products/defi-xxtreme/021605.webp`, `/products/defi-xxtreme/021605-2.webp`, `/products/defi-xxtreme/021605-3.webp`, `/products/defi-xxtreme/021605-4.webp`] },
      { sku: `021399`, name: { pt: `Defi XXtreme — Bronze`, en: `Defi XXtreme — Bronze` }, priceCents: 155940, currency: "EUR", attributes: { color: { label: { pt: `Bronze`, en: `Bronze` }, hex: ["#9b6a3a"] } }, image: `/products/defi-xxtreme/021399.webp`, images: [`/products/defi-xxtreme/021399.webp`] },
      { sku: `021398`, name: { pt: `Defi XXtreme — Amarelo & Ouro`, en: `Defi XXtreme — Yellow Gold` }, priceCents: 155940, currency: "EUR", attributes: { color: { label: { pt: `Amarelo & Ouro`, en: `Yellow Gold` }, hex: ["#d8b04a", "#c8a24a"] } }, image: `/products/defi-xxtreme/021398.webp`, images: [`/products/defi-xxtreme/021398.webp`] }
    ],
  },
  {
    slug: `twiggy-2`,
    name: { pt: `Twiggy`, en: `Twiggy` },
    description: { pt: `Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges.`, en: `S.T. Dupont lighter — hand-polished lacquer, signature flame mechanism and the iconic cling® of the Faverges manufacture.` },
    collection: `Twiggy`,
    categorySlug: "isqueiros",
    image: `/products/twiggy-2/030011.webp`,
    variants: [
      { sku: `030011`, name: { pt: `Twiggy — Coral & Rosa`, en: `Twiggy — Coral & Pink` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Coral & Rosa`, en: `Coral & Pink` }, hex: ["#e2675a", "#e7a3b1"] } }, image: `/products/twiggy-2/030011.webp`, images: [`/products/twiggy-2/030011.webp`, `/products/twiggy-2/030011-2.webp`, `/products/twiggy-2/030011-3.webp`, `/products/twiggy-2/030011-4.webp`] },
      { sku: `030007`, name: { pt: `Twiggy — Azul & Turquesa & Azul`, en: `Twiggy — Blue & Turquoise Blue` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Azul & Turquesa & Azul`, en: `Blue & Turquoise Blue` }, hex: ["#1f3c66", "#3aaba6"] } }, image: `/products/twiggy-2/030007.webp`, images: [`/products/twiggy-2/030007.webp`, `/products/twiggy-2/030007-2.webp`, `/products/twiggy-2/030007-3.webp`, `/products/twiggy-2/030007-4.webp`] },
      { sku: `030005`, name: { pt: `Twiggy — Azul & Índigo & Azul`, en: `Twiggy — Blue & Indigo Blue` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Azul & Índigo & Azul`, en: `Blue & Indigo Blue` }, hex: ["#1f3c66", "#2c2c63"] } }, image: `/products/twiggy-2/030005.webp`, images: [`/products/twiggy-2/030005.webp`, `/products/twiggy-2/030005-2.webp`, `/products/twiggy-2/030005-3.webp`, `/products/twiggy-2/030005-4.webp`] }
    ],
  },
  {
    slug: `biggy-2`,
    name: { pt: `Biggy`, en: `Biggy` },
    description: { pt: `Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges.`, en: `S.T. Dupont lighter — hand-polished lacquer, signature flame mechanism and the iconic cling® of the Faverges manufacture.` },
    collection: `Biggy`,
    categorySlug: "isqueiros",
    image: `/products/biggy-2/025210.webp`,
    variants: [
      { sku: `025210`, name: { pt: `Biggy — Prata`, en: `Biggy — Silver` }, priceCents: 48300, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/biggy-2/025210.webp`, images: [`/products/biggy-2/025210.webp`, `/products/biggy-2/025210-2.webp`, `/products/biggy-2/025210-3.webp`, `/products/biggy-2/025210-4.webp`] },
      { sku: `025209`, name: { pt: `Biggy — Dourado`, en: `Biggy — Golden` }, priceCents: 48300, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/biggy-2/025209.webp`, images: [`/products/biggy-2/025209.webp`, `/products/biggy-2/025209-2.webp`, `/products/biggy-2/025209-3.webp`, `/products/biggy-2/025209-4.webp`] },
      { sku: `025225`, name: { pt: `Biggy — Azul & Índigo & Azul`, en: `Biggy — Blue & Indigo Blue` }, priceCents: 45540, currency: "EUR", attributes: { color: { label: { pt: `Azul & Índigo & Azul`, en: `Blue & Indigo Blue` }, hex: ["#1f3c66", "#2c2c63"] } }, image: `/products/biggy-2/025225.webp`, images: [`/products/biggy-2/025225.webp`, `/products/biggy-2/025225-2.webp`, `/products/biggy-2/025225-3.webp`, `/products/biggy-2/025225-4.webp`] },
      { sku: `025222`, name: { pt: `Biggy — Preto`, en: `Biggy — Black` }, priceCents: 45540, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/biggy-2/025222.webp`, images: [`/products/biggy-2/025222.webp`, `/products/biggy-2/025222-2.webp`, `/products/biggy-2/025222-3.webp`, `/products/biggy-2/025222-4.webp`] },
      { sku: `025221`, name: { pt: `Biggy — Preto & Prata`, en: `Biggy — Black & Silver` }, priceCents: 45540, currency: "EUR", attributes: { color: { label: { pt: `Preto & Prata`, en: `Black & Silver` }, hex: ["#15171c", "#c9ccd1"] } }, image: `/products/biggy-2/025221.webp`, images: [`/products/biggy-2/025221.webp`, `/products/biggy-2/025221-2.webp`, `/products/biggy-2/025221-3.webp`, `/products/biggy-2/025221-4.webp`] }
    ],
  },
  {
    slug: `defi-extreme-2`,
    name: { pt: `Défi Extreme`, en: `Defi Extreme` },
    description: { pt: `Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges.`, en: `S.T. Dupont lighter — hand-polished lacquer, signature flame mechanism and the iconic cling® of the Faverges manufacture.` },
    collection: `Défi Extreme`,
    categorySlug: "isqueiros",
    image: `/products/defi-extreme-2/021465.webp`,
    variants: [
      { sku: `021465`, name: { pt: `Defi Extreme — Rosa`, en: `Defi Extreme — Pink` }, priceCents: 34500, currency: "EUR", attributes: { color: { label: { pt: `Rosa`, en: `Pink` }, hex: ["#e7a3b1"] } }, image: `/products/defi-extreme-2/021465.webp`, images: [`/products/defi-extreme-2/021465.webp`, `/products/defi-extreme-2/021465-2.webp`, `/products/defi-extreme-2/021465-3.webp`, `/products/defi-extreme-2/021465-4.webp`] },
      { sku: `021407`, name: { pt: `Defi Extreme — Bronze & Cobre`, en: `Defi Extreme — Bronze & Copper` }, priceCents: 34500, currency: "EUR", attributes: { color: { label: { pt: `Bronze & Cobre`, en: `Bronze & Copper` }, hex: ["#9b6a3a", "#a7592c"] } }, image: `/products/defi-extreme-2/021407.webp`, images: [`/products/defi-extreme-2/021407.webp`, `/products/defi-extreme-2/021407-2.webp`, `/products/defi-extreme-2/021407-3.webp`, `/products/defi-extreme-2/021407-4.webp`] },
      { sku: `021403`, name: { pt: `Defi Extreme — Cinza & Prata`, en: `Defi Extreme — Grey & Silver` }, priceCents: 34500, currency: "EUR", attributes: { color: { label: { pt: `Cinza & Prata`, en: `Grey & Silver` }, hex: ["#7a7d83", "#c9ccd1"] } }, image: `/products/defi-extreme-2/021403.webp`, images: [`/products/defi-extreme-2/021403.webp`, `/products/defi-extreme-2/021403-2.webp`, `/products/defi-extreme-2/021403-3.webp`, `/products/defi-extreme-2/021403-4.webp`] },
      { sku: `021400`, name: { pt: `Defi Extreme — Preto`, en: `Defi Extreme — Black` }, priceCents: 34500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/defi-extreme-2/021400.webp`, images: [`/products/defi-extreme-2/021400.webp`, `/products/defi-extreme-2/021400-2.webp`, `/products/defi-extreme-2/021400-3.webp`, `/products/defi-extreme-2/021400-4.webp`] }
    ],
  },
  {
    slug: `megajet`,
    name: { pt: `Megajet`, en: `Megajet` },
    description: { pt: `Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges.`, en: `S.T. Dupont lighter — hand-polished lacquer, signature flame mechanism and the iconic cling® of the Faverges manufacture.` },
    collection: `Megajet`,
    categorySlug: "isqueiros",
    image: `/products/megajet/020749.webp`,
    variants: [
      { sku: `020749`, name: { pt: `Megajet — Preto & Vermelho`, en: `Megajet — Black & Red` }, priceCents: 27140, currency: "EUR", attributes: { color: { label: { pt: `Preto & Vermelho`, en: `Black & Red` }, hex: ["#15171c", "#7d2b27"] } }, image: `/products/megajet/020749.webp`, images: [`/products/megajet/020749.webp`, `/products/megajet/020749-2.webp`, `/products/megajet/020749-3.webp`, `/products/megajet/020749-4.webp`] },
      { sku: `020703`, name: { pt: `Megajet — Vermelho`, en: `Megajet — Red` }, priceCents: 27140, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/megajet/020703.webp`, images: [`/products/megajet/020703.webp`, `/products/megajet/020703-2.webp`, `/products/megajet/020703-3.webp`, `/products/megajet/020703-4.webp`] }
    ],
  },
  {
    slug: `cigar-cutter`,
    name: { pt: `Cortador de Charuto`, en: `Cigar cutter` },
    description: { pt: `Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges.`, en: `S.T. Dupont lighter — hand-polished lacquer, signature flame mechanism and the iconic cling® of the Faverges manufacture.` },
    collection: `Cortador de Charuto`,
    categorySlug: "isqueiros",
    image: `/products/cigar-cutter/003394.webp`,
    variants: [
      { sku: `003394`, name: { pt: `Cigar cutter — Preto`, en: `Cigar cutter — Black` }, priceCents: 27140, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/cigar-cutter/003394.webp`, images: [`/products/cigar-cutter/003394.webp`, `/products/cigar-cutter/003394-2.webp`, `/products/cigar-cutter/003394-3.webp`] },
      { sku: `003553`, name: { pt: `Cigar cutter — Preto & Dourado & Amarelo & Ouro`, en: `Cigar cutter — Black & Golden & Yellow Gold` }, priceCents: 28980, currency: "EUR", attributes: { color: { label: { pt: `Preto & Dourado & Amarelo & Ouro`, en: `Black & Golden & Yellow Gold` }, hex: ["#15171c", "#c8a24a"] } }, image: `/products/cigar-cutter/003553.webp`, images: [`/products/cigar-cutter/003553.webp`, `/products/cigar-cutter/003553-2.webp`, `/products/cigar-cutter/003553-3.webp`] },
      { sku: `003262`, name: { pt: `Cigar cutter — Preto`, en: `Cigar cutter — Black` }, priceCents: 15180, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/cigar-cutter/003262.webp`, images: [`/products/cigar-cutter/003262.webp`, `/products/cigar-cutter/003262-2.webp`, `/products/cigar-cutter/003262-3.webp`] },
      { sku: `003257`, name: { pt: `Cigar cutter — Prata`, en: `Cigar cutter — Silver` }, priceCents: 22540, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/cigar-cutter/003257.webp`, images: [`/products/cigar-cutter/003257.webp`, `/products/cigar-cutter/003257-2.webp`, `/products/cigar-cutter/003257-3.webp`] },
      { sku: `003418`, name: { pt: `Cigar cutter — Prata`, en: `Cigar cutter — Silver` }, priceCents: 26220, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/cigar-cutter/003418.webp`, images: [`/products/cigar-cutter/003418.webp`, `/products/cigar-cutter/003418-2.webp`, `/products/cigar-cutter/003418-3.webp`] },
      { sku: `003415`, name: { pt: `Cigar cutter — Preto & Prata`, en: `Cigar cutter — Black & Silver` }, priceCents: 28980, currency: "EUR", attributes: { color: { label: { pt: `Preto & Prata`, en: `Black & Silver` }, hex: ["#15171c", "#c9ccd1"] } }, image: `/products/cigar-cutter/003415.webp`, images: [`/products/cigar-cutter/003415.webp`, `/products/cigar-cutter/003415-2.webp`, `/products/cigar-cutter/003415-3.webp`, `/products/cigar-cutter/003415-4.webp`] },
      { sku: `003266`, name: { pt: `Cigar cutter — Prata`, en: `Cigar cutter — Silver` }, priceCents: 22540, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/cigar-cutter/003266.webp`, images: [`/products/cigar-cutter/003266.webp`, `/products/cigar-cutter/003266-2.webp`, `/products/cigar-cutter/003266-3.webp`] },
      { sku: `003265`, name: { pt: `Cigar cutter — Preto`, en: `Cigar cutter — Black` }, priceCents: 22540, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/cigar-cutter/003265.webp`, images: [`/products/cigar-cutter/003265.webp`, `/products/cigar-cutter/003265-2.webp`, `/products/cigar-cutter/003265-3.webp`] }
    ],
  },
  {
    slug: `eternity-orlinski`,
    name: { pt: `Eternity · Orlinski`, en: `Eternity · Orlinski` },
    description: { pt: `Instrumento de escrita S.T. Dupont — corpo lacado ou metálico, montagem precisa em Faverges, equilíbrio pensado para uma vida de uso.`, en: `S.T. Dupont writing instrument — lacquered or metal body, precision-assembled in Faverges, balanced for a lifetime of use.` },
    collection: `Eternity`,
    categorySlug: "escrita",
    image: `/products/eternity-orlinski/420062L.webp`,
    variants: [
      { sku: `420062L`, name: { pt: `Eternity · Orlinski — Paládio`, en: `Eternity · Orlinski — Palladium` }, priceCents: 192740, currency: "EUR", attributes: { color: { label: { pt: `Paládio`, en: `Palladium` }, hex: ["#b9bcc2"] } }, image: `/products/eternity-orlinski/420062L.webp`, images: [`/products/eternity-orlinski/420062L.webp`, `/products/eternity-orlinski/420062L-2.webp`, `/products/eternity-orlinski/420062L-3.webp`, `/products/eternity-orlinski/420062L-4.webp`] },
      { sku: `420061L`, name: { pt: `Eternity · Orlinski — Dourado`, en: `Eternity · Orlinski — Golden` }, priceCents: 192740, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/eternity-orlinski/420061L.webp`, images: [`/products/eternity-orlinski/420061L.webp`, `/products/eternity-orlinski/420061L-2.webp`, `/products/eternity-orlinski/420061L-3.webp`, `/products/eternity-orlinski/420061L-4.webp`] },
      { sku: `420060L`, name: { pt: `Eternity · Orlinski — Vermelho`, en: `Eternity · Orlinski — Red` }, priceCents: 211140, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/eternity-orlinski/420060L.webp`, images: [`/products/eternity-orlinski/420060L.webp`, `/products/eternity-orlinski/420060L-2.webp`, `/products/eternity-orlinski/420060L-3.webp`, `/products/eternity-orlinski/420060L-4.webp`] },
      { sku: `422061L`, name: { pt: `Eternity · Orlinski — Dourado`, en: `Eternity · Orlinski — Golden` }, priceCents: 183540, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/eternity-orlinski/422061L.webp`, images: [`/products/eternity-orlinski/422061L.webp`, `/products/eternity-orlinski/422061L-2.webp`, `/products/eternity-orlinski/422061L-3.webp`, `/products/eternity-orlinski/422061L-4.webp`] },
      { sku: `422062L`, name: { pt: `Eternity · Orlinski — Paládio`, en: `Eternity · Orlinski — Palladium` }, priceCents: 183540, currency: "EUR", attributes: { color: { label: { pt: `Paládio`, en: `Palladium` }, hex: ["#b9bcc2"] } }, image: `/products/eternity-orlinski/422062L.webp`, images: [`/products/eternity-orlinski/422062L.webp`, `/products/eternity-orlinski/422062L-2.webp`, `/products/eternity-orlinski/422062L-3.webp`, `/products/eternity-orlinski/422062L-4.webp`] },
      { sku: `422060L`, name: { pt: `Eternity · Orlinski — Vermelho`, en: `Eternity · Orlinski — Red` }, priceCents: 192740, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/eternity-orlinski/422060L.webp`, images: [`/products/eternity-orlinski/422060L.webp`, `/products/eternity-orlinski/422060L-2.webp`, `/products/eternity-orlinski/422060L-3.webp`, `/products/eternity-orlinski/422060L-4.webp`] }
    ],
  },
  {
    slug: `eternity-maki-e`,
    name: { pt: `Eternity · Maki-e`, en: `Eternity · Maki E` },
    description: { pt: `Instrumento de escrita S.T. Dupont — corpo lacado ou metálico, montagem precisa em Faverges, equilíbrio pensado para uma vida de uso.`, en: `S.T. Dupont writing instrument — lacquered or metal body, precision-assembled in Faverges, balanced for a lifetime of use.` },
    collection: `Eternity`,
    categorySlug: "escrita",
    image: `/products/eternity-maki-e/420151XL.webp`,
    variants: [
      { sku: `420151XL`, name: { pt: `Eternity · Maki E — Castanho`, en: `Eternity · Maki E — Brown` }, priceCents: 506000, currency: "EUR", attributes: { color: { label: { pt: `Castanho`, en: `Brown` }, hex: ["#6b4a2a"] } }, image: `/products/eternity-maki-e/420151XL.webp`, images: [`/products/eternity-maki-e/420151XL.webp`, `/products/eternity-maki-e/420151XL-2.webp`, `/products/eternity-maki-e/420151XL-3.webp`, `/products/eternity-maki-e/420151XL-4.webp`] },
      { sku: `420150XL`, name: { pt: `Eternity · Maki E — Castanho`, en: `Eternity · Maki E — Brown` }, priceCents: 685400, currency: "EUR", attributes: { color: { label: { pt: `Castanho`, en: `Brown` }, hex: ["#6b4a2a"] } }, image: `/products/eternity-maki-e/420150XL.webp`, images: [`/products/eternity-maki-e/420150XL.webp`, `/products/eternity-maki-e/420150XL-2.webp`, `/products/eternity-maki-e/420150XL-3.webp`, `/products/eternity-maki-e/420150XL-4.webp`] }
    ],
  },
  {
    slug: `popote-2`,
    name: { pt: `Popote`, en: `Popote` },
    description: { pt: `Instrumento de escrita S.T. Dupont — corpo lacado ou metálico, montagem precisa em Faverges, equilíbrio pensado para uma vida de uso.`, en: `S.T. Dupont writing instrument — lacquered or metal body, precision-assembled in Faverges, balanced for a lifetime of use.` },
    collection: ``,
    categorySlug: "escrita",
    image: `/products/popote-2/420317L.webp`,
    variants: [
      { sku: `420317L`, name: { pt: `Popote — Azul`, en: `Popote — Blue` }, priceCents: 174340, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/popote-2/420317L.webp`, images: [`/products/popote-2/420317L.webp`, `/products/popote-2/420317L-2.webp`, `/products/popote-2/420317L-3.webp`, `/products/popote-2/420317L-4.webp`] },
      { sku: `422317L`, name: { pt: `Popote — Azul`, en: `Popote — Blue` }, priceCents: 155940, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/popote-2/422317L.webp`, images: [`/products/popote-2/422317L.webp`, `/products/popote-2/422317L-2.webp`, `/products/popote-2/422317L-3.webp`, `/products/popote-2/422317L-4.webp`] },
      { sku: `422316M`, name: { pt: `Popote — Preto`, en: `Popote — Black` }, priceCents: 146740, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/popote-2/422316M.webp`, images: [`/products/popote-2/422316M.webp`, `/products/popote-2/422316M-2.webp`, `/products/popote-2/422316M-3.webp`, `/products/popote-2/422316M-4.webp`] },
      { sku: `420316M`, name: { pt: `Popote — Preto`, en: `Popote — Black` }, priceCents: 165140, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/popote-2/420316M.webp`, images: [`/products/popote-2/420316M.webp`, `/products/popote-2/420316M-2.webp`, `/products/popote-2/420316M-3.webp`, `/products/popote-2/420316M-4.webp`] },
      { sku: `420318L`, name: { pt: `Popote — Vermelho`, en: `Popote — Red` }, priceCents: 174340, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/popote-2/420318L.webp`, images: [`/products/popote-2/420318L.webp`, `/products/popote-2/420318L-2.webp`, `/products/popote-2/420318L-3.webp`, `/products/popote-2/420318L-4.webp`] },
      { sku: `422318L`, name: { pt: `Popote — Vermelho`, en: `Popote — Red` }, priceCents: 155940, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/popote-2/422318L.webp`, images: [`/products/popote-2/422318L.webp`, `/products/popote-2/422318L-2.webp`, `/products/popote-2/422318L-3.webp`, `/products/popote-2/422318L-4.webp`] }
    ],
  },
  {
    slug: `writing-instrument`,
    name: { pt: `Escrita`, en: `Writing Instrument` },
    description: { pt: `Instrumento de escrita S.T. Dupont — corpo lacado ou metálico, montagem precisa em Faverges, equilíbrio pensado para uma vida de uso.`, en: `S.T. Dupont writing instrument — lacquered or metal body, precision-assembled in Faverges, balanced for a lifetime of use.` },
    collection: `Escrita`,
    categorySlug: "escrita",
    image: `/products/writing-instrument/700008.webp`,
    variants: [
      { sku: `700008`, name: { pt: `Writing Instrument — S.t. & Dupont`, en: `Writing Instrument — S.T. Dupont` }, priceCents: 39100, currency: "EUR", attributes: { color: { label: { pt: `S.t. & Dupont`, en: `S.T. Dupont` }, hex: ["#7a7d83"] } }, image: `/products/writing-instrument/700008.webp`, images: [`/products/writing-instrument/700008.webp`, `/products/writing-instrument/700008-2.webp`, `/products/writing-instrument/700008-3.webp`, `/products/writing-instrument/700008-4.webp`] },
      { sku: `700006`, name: { pt: `Writing Instrument — S.t. & Dupont`, en: `Writing Instrument — S.T. Dupont` }, priceCents: 39100, currency: "EUR", attributes: { color: { label: { pt: `S.t. & Dupont`, en: `S.T. Dupont` }, hex: ["#7a7d83"] } }, image: `/products/writing-instrument/700006.webp`, images: [`/products/writing-instrument/700006.webp`, `/products/writing-instrument/700006-2.webp`, `/products/writing-instrument/700006-3.webp`, `/products/writing-instrument/700006-4.webp`] },
      { sku: `700005`, name: { pt: `Writing Instrument — S.t. & Dupont`, en: `Writing Instrument — S.T. Dupont` }, priceCents: 39100, currency: "EUR", attributes: { color: { label: { pt: `S.t. & Dupont`, en: `S.T. Dupont` }, hex: ["#7a7d83"] } }, image: `/products/writing-instrument/700005.webp`, images: [`/products/writing-instrument/700005.webp`, `/products/writing-instrument/700005-2.webp`, `/products/writing-instrument/700005-3.webp`, `/products/writing-instrument/700005-4.webp`] }
    ],
  },
  {
    slug: `eternity-horsemane`,
    name: { pt: `Eternity · Horse Mane`, en: `Eternity · Horsemane` },
    description: { pt: `Instrumento de escrita S.T. Dupont — corpo lacado ou metálico, montagem precisa em Faverges, equilíbrio pensado para uma vida de uso.`, en: `S.T. Dupont writing instrument — lacquered or metal body, precision-assembled in Faverges, balanced for a lifetime of use.` },
    collection: `Eternity`,
    categorySlug: "escrita",
    image: `/products/eternity-horsemane/420090L.webp`,
    variants: [
      { sku: `420090L`, name: { pt: `Eternity · Horsemane — Preto`, en: `Eternity · Horsemane — Black` }, priceCents: 119140, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/eternity-horsemane/420090L.webp`, images: [`/products/eternity-horsemane/420090L.webp`, `/products/eternity-horsemane/420090L-2.webp`, `/products/eternity-horsemane/420090L-3.webp`, `/products/eternity-horsemane/420090L-4.webp`] },
      { sku: `422090L`, name: { pt: `Eternity · Horsemane — Preto`, en: `Eternity · Horsemane — Black` }, priceCents: 100740, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/eternity-horsemane/422090L.webp`, images: [`/products/eternity-horsemane/422090L.webp`, `/products/eternity-horsemane/422090L-2.webp`, `/products/eternity-horsemane/422090L-3.webp`, `/products/eternity-horsemane/422090L-4.webp`] },
      { sku: `420089L`, name: { pt: `Eternity · Horsemane — Vermelho`, en: `Eternity · Horsemane — Red` }, priceCents: 119140, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/eternity-horsemane/420089L.webp`, images: [`/products/eternity-horsemane/420089L.webp`, `/products/eternity-horsemane/420089L-2.webp`, `/products/eternity-horsemane/420089L-3.webp`, `/products/eternity-horsemane/420089L-4.webp`] },
      { sku: `422089L`, name: { pt: `Eternity · Horsemane — Vermelho`, en: `Eternity · Horsemane — Red` }, priceCents: 100740, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/eternity-horsemane/422089L.webp`, images: [`/products/eternity-horsemane/422089L.webp`, `/products/eternity-horsemane/422089L-2.webp`, `/products/eternity-horsemane/422089L-3.webp`, `/products/eternity-horsemane/422089L-4.webp`] }
    ],
  },
  {
    slug: `defi-milenium`,
    name: { pt: `Défi Millennium`, en: `Defi milenium` },
    description: { pt: `Instrumento de escrita S.T. Dupont — corpo lacado ou metálico, montagem precisa em Faverges, equilíbrio pensado para uma vida de uso.`, en: `S.T. Dupont writing instrument — lacquered or metal body, precision-assembled in Faverges, balanced for a lifetime of use.` },
    collection: `Défi Millennium`,
    categorySlug: "escrita",
    image: `/products/defi-milenium/400003.webp`,
    variants: [
      { sku: `400003`, name: { pt: `Defi milenium — Preto`, en: `Defi milenium — Black` }, priceCents: 41400, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/defi-milenium/400003.webp`, images: [`/products/defi-milenium/400003.webp`, `/products/defi-milenium/400003-2.webp`, `/products/defi-milenium/400003-3.webp`, `/products/defi-milenium/400003-4.webp`] },
      { sku: `402034`, name: { pt: `Defi milenium — Néon & Laranja`, en: `Defi milenium — Neon Orange` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Néon & Laranja`, en: `Neon Orange` }, hex: ["#aef043", "#c4642d"] } }, image: `/products/defi-milenium/402034.webp`, images: [`/products/defi-milenium/402034.webp`, `/products/defi-milenium/402034-2.webp`, `/products/defi-milenium/402034-3.webp`, `/products/defi-milenium/402034-4.webp`] },
      { sku: `400004`, name: { pt: `Defi milenium — Prata`, en: `Defi milenium — Silver` }, priceCents: 41400, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/defi-milenium/400004.webp`, images: [`/products/defi-milenium/400004.webp`, `/products/defi-milenium/400004-2.webp`] },
      { sku: `405004`, name: { pt: `Defi milenium — Preto & Prata`, en: `Defi milenium — Black & Silver` }, priceCents: 32200, currency: "EUR", attributes: { color: { label: { pt: `Preto & Prata`, en: `Black & Silver` }, hex: ["#15171c", "#c9ccd1"] } }, image: `/products/defi-milenium/405004.webp`, images: [`/products/defi-milenium/405004.webp`, `/products/defi-milenium/405004-2.webp`, `/products/defi-milenium/405004-3.webp`, `/products/defi-milenium/405004-4.webp`] },
      { sku: `405003`, name: { pt: `Defi milenium — Preto`, en: `Defi milenium — Black` }, priceCents: 32200, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/defi-milenium/405003.webp`, images: [`/products/defi-milenium/405003.webp`, `/products/defi-milenium/405003-2.webp`, `/products/defi-milenium/405003-3.webp`, `/products/defi-milenium/405003-4.webp`] },
      { sku: `402003`, name: { pt: `Defi milenium — Preto`, en: `Defi milenium — Black` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/defi-milenium/402003.webp`, images: [`/products/defi-milenium/402003.webp`, `/products/defi-milenium/402003-2.webp`, `/products/defi-milenium/402003-3.webp`, `/products/defi-milenium/402003-4.webp`] },
      { sku: `400739`, name: { pt: `Defi milenium — Vermelho`, en: `Defi milenium — Red` }, priceCents: 41400, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/defi-milenium/400739.webp`, images: [`/products/defi-milenium/400739.webp`, `/products/defi-milenium/400739-2.webp`, `/products/defi-milenium/400739-3.webp`, `/products/defi-milenium/400739-4.webp`] },
      { sku: `400736`, name: { pt: `Defi milenium — Azul & Escuro & Azul`, en: `Defi milenium — Blue & Dark Blue` }, priceCents: 41400, currency: "EUR", attributes: { color: { label: { pt: `Azul & Escuro & Azul`, en: `Blue & Dark Blue` }, hex: ["#1f3c66", "#2a2d34"] } }, image: `/products/defi-milenium/400736.webp`, images: [`/products/defi-milenium/400736.webp`, `/products/defi-milenium/400736-2.webp`, `/products/defi-milenium/400736-3.webp`, `/products/defi-milenium/400736-4.webp`] },
      { sku: `402736`, name: { pt: `Defi milenium — Azul & Escuro & Azul`, en: `Defi milenium — Blue & Dark Blue` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Azul & Escuro & Azul`, en: `Blue & Dark Blue` }, hex: ["#1f3c66", "#2a2d34"] } }, image: `/products/defi-milenium/402736.webp`, images: [`/products/defi-milenium/402736.webp`, `/products/defi-milenium/402736-2.webp`, `/products/defi-milenium/402736-3.webp`, `/products/defi-milenium/402736-4.webp`] },
      { sku: `402739`, name: { pt: `Defi milenium — Vermelho`, en: `Defi milenium — Red` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/defi-milenium/402739.webp`, images: [`/products/defi-milenium/402739.webp`, `/products/defi-milenium/402739-2.webp`, `/products/defi-milenium/402739-3.webp`, `/products/defi-milenium/402739-4.webp`] },
      { sku: `400719`, name: { pt: `Defi milenium — Preto & Gun Metal & Prata`, en: `Defi milenium — Black & Gunmetal & Silver` }, priceCents: 41400, currency: "EUR", attributes: { color: { label: { pt: `Preto & Gun Metal & Prata`, en: `Black & Gunmetal & Silver` }, hex: ["#15171c", "#4b4f55"] } }, image: `/products/defi-milenium/400719.webp`, images: [`/products/defi-milenium/400719.webp`, `/products/defi-milenium/400719-2.webp`, `/products/defi-milenium/400719-3.webp`, `/products/defi-milenium/400719-4.webp`] },
      { sku: `400706`, name: { pt: `Defi milenium — Preto & Prata`, en: `Defi milenium — Black & Silver` }, priceCents: 41400, currency: "EUR", attributes: { color: { label: { pt: `Preto & Prata`, en: `Black & Silver` }, hex: ["#15171c", "#c9ccd1"] } }, image: `/products/defi-milenium/400706.webp`, images: [`/products/defi-milenium/400706.webp`, `/products/defi-milenium/400706-2.webp`, `/products/defi-milenium/400706-3.webp`, `/products/defi-milenium/400706-4.webp`] },
      { sku: `402737`, name: { pt: `Defi milenium — Laranja`, en: `Defi milenium — Orange` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Laranja`, en: `Orange` }, hex: ["#c4642d"] } }, image: `/products/defi-milenium/402737.webp`, images: [`/products/defi-milenium/402737.webp`, `/products/defi-milenium/402737-2.webp`, `/products/defi-milenium/402737-3.webp`, `/products/defi-milenium/402737-4.webp`] },
      { sku: `402719`, name: { pt: `Defi milenium — Preto & Gun Metal`, en: `Defi milenium — Black & Gunmetal` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Preto & Gun Metal`, en: `Black & Gunmetal` }, hex: ["#15171c", "#4b4f55"] } }, image: `/products/defi-milenium/402719.webp`, images: [`/products/defi-milenium/402719.webp`, `/products/defi-milenium/402719-2.webp`, `/products/defi-milenium/402719-3.webp`, `/products/defi-milenium/402719-4.webp`] },
      { sku: `402706`, name: { pt: `Defi milenium — Preto & Prata`, en: `Defi milenium — Black & Silver` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Preto & Prata`, en: `Black & Silver` }, hex: ["#15171c", "#c9ccd1"] } }, image: `/products/defi-milenium/402706.webp`, images: [`/products/defi-milenium/402706.webp`, `/products/defi-milenium/402706-2.webp`, `/products/defi-milenium/402706-3.webp`, `/products/defi-milenium/402706-4.webp`] },
      { sku: `405739`, name: { pt: `Defi milenium — Vermelho`, en: `Defi milenium — Red` }, priceCents: 32200, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/defi-milenium/405739.webp`, images: [`/products/defi-milenium/405739.webp`, `/products/defi-milenium/405739-2.webp`, `/products/defi-milenium/405739-3.webp`, `/products/defi-milenium/405739-4.webp`] },
      { sku: `405737`, name: { pt: `Defi milenium — Laranja`, en: `Defi milenium — Orange` }, priceCents: 32200, currency: "EUR", attributes: { color: { label: { pt: `Laranja`, en: `Orange` }, hex: ["#c4642d"] } }, image: `/products/defi-milenium/405737.webp`, images: [`/products/defi-milenium/405737.webp`, `/products/defi-milenium/405737-2.webp`, `/products/defi-milenium/405737-3.webp`, `/products/defi-milenium/405737-4.webp`] },
      { sku: `405736`, name: { pt: `Defi milenium — Azul & Escuro & Azul`, en: `Defi milenium — Blue & Dark Blue` }, priceCents: 32200, currency: "EUR", attributes: { color: { label: { pt: `Azul & Escuro & Azul`, en: `Blue & Dark Blue` }, hex: ["#1f3c66", "#2a2d34"] } }, image: `/products/defi-milenium/405736.webp`, images: [`/products/defi-milenium/405736.webp`, `/products/defi-milenium/405736-2.webp`, `/products/defi-milenium/405736-3.webp`, `/products/defi-milenium/405736-4.webp`] },
      { sku: `405719`, name: { pt: `Defi milenium — Preto & Gun Metal & Prata`, en: `Defi milenium — Black & Gunmetal & Silver` }, priceCents: 32200, currency: "EUR", attributes: { color: { label: { pt: `Preto & Gun Metal & Prata`, en: `Black & Gunmetal & Silver` }, hex: ["#15171c", "#4b4f55"] } }, image: `/products/defi-milenium/405719.webp`, images: [`/products/defi-milenium/405719.webp`, `/products/defi-milenium/405719-2.webp`, `/products/defi-milenium/405719-3.webp`, `/products/defi-milenium/405719-4.webp`] },
      { sku: `405706`, name: { pt: `Defi milenium — Preto & Prata`, en: `Defi milenium — Black & Silver` }, priceCents: 32200, currency: "EUR", attributes: { color: { label: { pt: `Preto & Prata`, en: `Black & Silver` }, hex: ["#15171c", "#c9ccd1"] } }, image: `/products/defi-milenium/405706.webp`, images: [`/products/defi-milenium/405706.webp`, `/products/defi-milenium/405706-2.webp`, `/products/defi-milenium/405706-3.webp`, `/products/defi-milenium/405706-4.webp`] }
    ],
  },
  {
    slug: `d-initial`,
    name: { pt: `Initial`, en: `D Initial` },
    description: { pt: `Instrumento de escrita S.T. Dupont — corpo lacado ou metálico, montagem precisa em Faverges, equilíbrio pensado para uma vida de uso.`, en: `S.T. Dupont writing instrument — lacquered or metal body, precision-assembled in Faverges, balanced for a lifetime of use.` },
    collection: `Initial`,
    categorySlug: "escrita",
    image: `/products/d-initial/275217.webp`,
    variants: [
      { sku: `275217`, name: { pt: `D Initial — Branco`, en: `D Initial — White` }, priceCents: 25300, currency: "EUR", attributes: { color: { label: { pt: `Branco`, en: `White` }, hex: ["#f3efe6"] } }, image: `/products/d-initial/275217.webp`, images: [`/products/d-initial/275217.webp`, `/products/d-initial/275217-2.webp`, `/products/d-initial/275217-3.webp`, `/products/d-initial/275217-4.webp`] },
      { sku: `275115`, name: { pt: `D Initial — Preto`, en: `D Initial — Black` }, priceCents: 25300, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/d-initial/275115.webp`, images: [`/products/d-initial/275115.webp`, `/products/d-initial/275115-2.webp`, `/products/d-initial/275115-3.webp`, `/products/d-initial/275115-4.webp`] },
      { sku: `275202`, name: { pt: `D Initial — Dourado`, en: `D Initial — Golden` }, priceCents: 25300, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/d-initial/275202.webp`, images: [`/products/d-initial/275202.webp`, `/products/d-initial/275202-2.webp`, `/products/d-initial/275202-3.webp`, `/products/d-initial/275202-4.webp`] },
      { sku: `275205`, name: { pt: `D Initial — Escuro & Azul`, en: `D Initial — Dark Blue` }, priceCents: 25300, currency: "EUR", attributes: { color: { label: { pt: `Escuro & Azul`, en: `Dark Blue` }, hex: ["#2a2d34", "#1f3c66"] } }, image: `/products/d-initial/275205.webp`, images: [`/products/d-initial/275205.webp`, `/products/d-initial/275205-2.webp`, `/products/d-initial/275205-3.webp`, `/products/d-initial/275205-4.webp`] },
      { sku: `275200`, name: { pt: `D Initial — Prata`, en: `D Initial — Silver` }, priceCents: 25300, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/d-initial/275200.webp`, images: [`/products/d-initial/275200.webp`, `/products/d-initial/275200-2.webp`, `/products/d-initial/275200-3.webp`, `/products/d-initial/275200-4.webp`] },
      { sku: `272216`, name: { pt: `D Initial — Preto`, en: `D Initial — Black` }, priceCents: 31740, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/d-initial/272216.webp`, images: [`/products/d-initial/272216.webp`, `/products/d-initial/272216-2.webp`, `/products/d-initial/272216-3.webp`, `/products/d-initial/272216-4.webp`] },
      { sku: `272217`, name: { pt: `D Initial — Branco`, en: `D Initial — White` }, priceCents: 31740, currency: "EUR", attributes: { color: { label: { pt: `Branco`, en: `White` }, hex: ["#f3efe6"] } }, image: `/products/d-initial/272217.webp`, images: [`/products/d-initial/272217.webp`, `/products/d-initial/272217-2.webp`, `/products/d-initial/272217-3.webp`, `/products/d-initial/272217-4.webp`] },
      { sku: `272205`, name: { pt: `D Initial — Escuro & Azul`, en: `D Initial — Dark Blue` }, priceCents: 31740, currency: "EUR", attributes: { color: { label: { pt: `Escuro & Azul`, en: `Dark Blue` }, hex: ["#2a2d34", "#1f3c66"] } }, image: `/products/d-initial/272205.webp`, images: [`/products/d-initial/272205.webp`, `/products/d-initial/272205-2.webp`, `/products/d-initial/272205-3.webp`, `/products/d-initial/272205-4.webp`] },
      { sku: `272202`, name: { pt: `D Initial — Dourado`, en: `D Initial — Golden` }, priceCents: 31740, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/d-initial/272202.webp`, images: [`/products/d-initial/272202.webp`, `/products/d-initial/272202-2.webp`, `/products/d-initial/272202-3.webp`, `/products/d-initial/272202-4.webp`] },
      { sku: `272201`, name: { pt: `D Initial — Prata`, en: `D Initial — Silver` }, priceCents: 31740, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/d-initial/272201.webp`, images: [`/products/d-initial/272201.webp`, `/products/d-initial/272201-2.webp`, `/products/d-initial/272201-3.webp`, `/products/d-initial/272201-4.webp`] },
      { sku: `272200`, name: { pt: `D Initial — Prata`, en: `D Initial — Silver` }, priceCents: 31740, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/d-initial/272200.webp`, images: [`/products/d-initial/272200.webp`, `/products/d-initial/272200-2.webp`, `/products/d-initial/272200-3.webp`, `/products/d-initial/272200-4.webp`] },
      { sku: `270216`, name: { pt: `D Initial — Preto`, en: `D Initial — Black` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/d-initial/270216.webp`, images: [`/products/d-initial/270216.webp`, `/products/d-initial/270216-2.webp`, `/products/d-initial/270216-3.webp`, `/products/d-initial/270216-4.webp`] },
      { sku: `270217`, name: { pt: `D Initial — Branco`, en: `D Initial — White` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Branco`, en: `White` }, hex: ["#f3efe6"] } }, image: `/products/d-initial/270217.webp`, images: [`/products/d-initial/270217.webp`, `/products/d-initial/270217-2.webp`, `/products/d-initial/270217-3.webp`, `/products/d-initial/270217-4.webp`] },
      { sku: `270202`, name: { pt: `D Initial — Dourado`, en: `D Initial — Golden` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/d-initial/270202.webp`, images: [`/products/d-initial/270202.webp`, `/products/d-initial/270202-2.webp`, `/products/d-initial/270202-3.webp`, `/products/d-initial/270202-4.webp`] },
      { sku: `270201`, name: { pt: `D Initial — Prata`, en: `D Initial — Silver` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/d-initial/270201.webp`, images: [`/products/d-initial/270201.webp`, `/products/d-initial/270201-2.webp`, `/products/d-initial/270201-3.webp`, `/products/d-initial/270201-4.webp`] },
      { sku: `270200`, name: { pt: `D Initial — Prata`, en: `D Initial — Silver` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/d-initial/270200.webp`, images: [`/products/d-initial/270200.webp`, `/products/d-initial/270200-2.webp`, `/products/d-initial/270200-3.webp`, `/products/d-initial/270200-4.webp`] }
    ],
  },
  {
    slug: `d-initial-fire-x`,
    name: { pt: `Initial · Fire X`, en: `D Initial · Fire X` },
    description: { pt: `Instrumento de escrita S.T. Dupont — corpo lacado ou metálico, montagem precisa em Faverges, equilíbrio pensado para uma vida de uso.`, en: `S.T. Dupont writing instrument — lacquered or metal body, precision-assembled in Faverges, balanced for a lifetime of use.` },
    collection: `Initial`,
    categorySlug: "escrita",
    image: `/products/d-initial-fire-x/275070.webp`,
    variants: [
      { sku: `275070`, name: { pt: `D Initial · Fire X — Preto`, en: `D Initial · Fire X — Black` }, priceCents: 34500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/d-initial-fire-x/275070.webp`, images: [`/products/d-initial-fire-x/275070.webp`, `/products/d-initial-fire-x/275070-2.webp`, `/products/d-initial-fire-x/275070-3.webp`, `/products/d-initial-fire-x/275070-4.webp`] }
    ],
  },
  {
    slug: `marker-necklace`,
    name: { pt: `Colar Marker`, en: `marker necklace` },
    description: { pt: `Instrumento de escrita S.T. Dupont — corpo lacado ou metálico, montagem precisa em Faverges, equilíbrio pensado para uma vida de uso.`, en: `S.T. Dupont writing instrument — lacquered or metal body, precision-assembled in Faverges, balanced for a lifetime of use.` },
    collection: `Colar Marker`,
    categorySlug: "escrita",
    image: `/products/marker-necklace/700003.webp`,
    variants: [
      { sku: `700003`, name: { pt: `marker necklace — Dourado`, en: `marker necklace — Golden` }, priceCents: 45540, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/marker-necklace/700003.webp`, images: [`/products/marker-necklace/700003.webp`, `/products/marker-necklace/700003-2.webp`, `/products/marker-necklace/700003-3.webp`, `/products/marker-necklace/700003-4.webp`] },
      { sku: `700002`, name: { pt: `marker necklace — Prata`, en: `marker necklace — Silver` }, priceCents: 45540, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/marker-necklace/700002.webp`, images: [`/products/marker-necklace/700002.webp`, `/products/marker-necklace/700002-2.webp`, `/products/marker-necklace/700002-3.webp`, `/products/marker-necklace/700002-4.webp`] },
      { sku: `700004`, name: { pt: `marker necklace — Preto`, en: `marker necklace — Black` }, priceCents: 45540, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/marker-necklace/700004.webp`, images: [`/products/marker-necklace/700004.webp`, `/products/marker-necklace/700004-2.webp`, `/products/marker-necklace/700004-3.webp`, `/products/marker-necklace/700004-4.webp`] }
    ],
  },
  {
    slug: `eternity`,
    name: { pt: `Eternity`, en: `Eternity` },
    description: { pt: `Instrumento de escrita S.T. Dupont — corpo lacado ou metálico, montagem precisa em Faverges, equilíbrio pensado para uma vida de uso.`, en: `S.T. Dupont writing instrument — lacquered or metal body, precision-assembled in Faverges, balanced for a lifetime of use.` },
    collection: `Eternity`,
    categorySlug: "escrita",
    image: `/products/eternity/420216L.webp`,
    variants: [
      { sku: `420216L`, name: { pt: `Eternity — Preto`, en: `Eternity — Black` }, priceCents: 91540, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/eternity/420216L.webp`, images: [`/products/eternity/420216L.webp`, `/products/eternity/420216L-2.webp`, `/products/eternity/420216L-3.webp`, `/products/eternity/420216L-4.webp`] },
      { sku: `422216L`, name: { pt: `Eternity — Preto`, en: `Eternity — Black` }, priceCents: 73140, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/eternity/422216L.webp`, images: [`/products/eternity/422216L.webp`, `/products/eternity/422216L-2.webp`, `/products/eternity/422216L-3.webp`, `/products/eternity/422216L-4.webp`] },
      { sku: `425216L`, name: { pt: `Eternity — Preto`, en: `Eternity — Black` }, priceCents: 69000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/eternity/425216L.webp`, images: [`/products/eternity/425216L.webp`, `/products/eternity/425216L-2.webp`, `/products/eternity/425216L-3.webp`, `/products/eternity/425216L-4.webp`] },
      { sku: `422011XL`, name: { pt: `Eternity — Índigo & Azul`, en: `Eternity — Indigo Blue` }, priceCents: 109940, currency: "EUR", attributes: { color: { label: { pt: `Índigo & Azul`, en: `Indigo Blue` }, hex: ["#2c2c63", "#1f3c66"] } }, image: `/products/eternity/422011XL.webp`, images: [`/products/eternity/422011XL.webp`, `/products/eternity/422011XL-2.webp`, `/products/eternity/422011XL-3.webp`, `/products/eternity/422011XL-4.webp`] },
      { sku: `422008XL`, name: { pt: `Eternity — Prata`, en: `Eternity — Silver` }, priceCents: 100740, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/eternity/422008XL.webp`, images: [`/products/eternity/422008XL.webp`, `/products/eternity/422008XL-2.webp`, `/products/eternity/422008XL-3.webp`, `/products/eternity/422008XL-4.webp`] },
      { sku: `422221XL`, name: { pt: `Eternity — Turquesa & Azul`, en: `Eternity — Turquoise Blue` }, priceCents: 87400, currency: "EUR", attributes: { color: { label: { pt: `Turquesa & Azul`, en: `Turquoise Blue` }, hex: ["#3aaba6", "#1f3c66"] } }, image: `/products/eternity/422221XL.webp`, images: [`/products/eternity/422221XL.webp`, `/products/eternity/422221XL-2.webp`, `/products/eternity/422221XL-3.webp`, `/products/eternity/422221XL-4.webp`] },
      { sku: `422220XL`, name: { pt: `Eternity — Preto`, en: `Eternity — Black` }, priceCents: 87400, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/eternity/422220XL.webp`, images: [`/products/eternity/422220XL.webp`, `/products/eternity/422220XL-2.webp`, `/products/eternity/422220XL-3.webp`, `/products/eternity/422220XL-4.webp`] },
      { sku: `420011XL`, name: { pt: `Eternity — Índigo & Azul`, en: `Eternity — Indigo Blue` }, priceCents: 128340, currency: "EUR", attributes: { color: { label: { pt: `Índigo & Azul`, en: `Indigo Blue` }, hex: ["#2c2c63", "#1f3c66"] } }, image: `/products/eternity/420011XL.webp`, images: [`/products/eternity/420011XL.webp`, `/products/eternity/420011XL-2.webp`, `/products/eternity/420011XL-3.webp`, `/products/eternity/420011XL-4.webp`] },
      { sku: `420008XL`, name: { pt: `Eternity — Prata`, en: `Eternity — Silver` }, priceCents: 119140, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/eternity/420008XL.webp`, images: [`/products/eternity/420008XL.webp`, `/products/eternity/420008XL-2.webp`, `/products/eternity/420008XL-3.webp`, `/products/eternity/420008XL-4.webp`] },
      { sku: `420221XL`, name: { pt: `Eternity — Turquesa & Azul`, en: `Eternity — Turquoise Blue` }, priceCents: 100740, currency: "EUR", attributes: { color: { label: { pt: `Turquesa & Azul`, en: `Turquoise Blue` }, hex: ["#3aaba6", "#1f3c66"] } }, image: `/products/eternity/420221XL.webp`, images: [`/products/eternity/420221XL.webp`, `/products/eternity/420221XL-2.webp`, `/products/eternity/420221XL-3.webp`, `/products/eternity/420221XL-4.webp`] }
    ],
  },
  {
    slug: `d-initial-fender`,
    name: { pt: `Initial · Fender`, en: `D Initial · Fender` },
    description: { pt: `Instrumento de escrita S.T. Dupont — corpo lacado ou metálico, montagem precisa em Faverges, equilíbrio pensado para uma vida de uso.`, en: `S.T. Dupont writing instrument — lacquered or metal body, precision-assembled in Faverges, balanced for a lifetime of use.` },
    collection: `Initial`,
    categorySlug: "escrita",
    image: `/products/d-initial-fender/275175.webp`,
    variants: [
      { sku: `275175`, name: { pt: `D Initial · Fender — Preto`, en: `D Initial · Fender — Black` }, priceCents: 41400, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/d-initial-fender/275175.webp`, images: [`/products/d-initial-fender/275175.webp`, `/products/d-initial-fender/275175-2.webp`, `/products/d-initial-fender/275175-3.webp`, `/products/d-initial-fender/275175-4.webp`] }
    ],
  },
  {
    slug: `eternity-fender`,
    name: { pt: `Eternity · Fender`, en: `Eternity · Fender` },
    description: { pt: `Instrumento de escrita S.T. Dupont — corpo lacado ou metálico, montagem precisa em Faverges, equilíbrio pensado para uma vida de uso.`, en: `S.T. Dupont writing instrument — lacquered or metal body, precision-assembled in Faverges, balanced for a lifetime of use.` },
    collection: `Eternity`,
    categorySlug: "escrita",
    image: `/products/eternity-fender/420176L.webp`,
    variants: [
      { sku: `420176L`, name: { pt: `Eternity · Fender — Azul & Fender`, en: `Eternity · Fender — Blue Fender` }, priceCents: 201940, currency: "EUR", attributes: { color: { label: { pt: `Azul & Fender`, en: `Blue Fender` }, hex: ["#1f3c66"] } }, image: `/products/eternity-fender/420176L.webp`, images: [`/products/eternity-fender/420176L.webp`, `/products/eternity-fender/420176L-2.webp`, `/products/eternity-fender/420176L-3.webp`, `/products/eternity-fender/420176L-4.webp`] },
      { sku: `422176L`, name: { pt: `Eternity · Fender — Azul & Fender`, en: `Eternity · Fender — Blue Fender` }, priceCents: 183540, currency: "EUR", attributes: { color: { label: { pt: `Azul & Fender`, en: `Blue Fender` }, hex: ["#1f3c66"] } }, image: `/products/eternity-fender/422176L.webp`, images: [`/products/eternity-fender/422176L.webp`, `/products/eternity-fender/422176L-2.webp`, `/products/eternity-fender/422176L-3.webp`, `/products/eternity-fender/422176L-4.webp`] },
      { sku: `420175L`, name: { pt: `Eternity · Fender — Preto`, en: `Eternity · Fender — Black` }, priceCents: 201940, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/eternity-fender/420175L.webp`, images: [`/products/eternity-fender/420175L.webp`, `/products/eternity-fender/420175L-2.webp`, `/products/eternity-fender/420175L-3.webp`, `/products/eternity-fender/420175L-4.webp`] },
      { sku: `422175L`, name: { pt: `Eternity · Fender — Preto`, en: `Eternity · Fender — Black` }, priceCents: 183540, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/eternity-fender/422175L.webp`, images: [`/products/eternity-fender/422175L.webp`, `/products/eternity-fender/422175L-2.webp`, `/products/eternity-fender/422175L-3.webp`, `/products/eternity-fender/422175L-4.webp`] }
    ],
  },
  {
    slug: `inkwell`,
    name: { pt: `Tinteiro`, en: `inkwell` },
    description: { pt: `Instrumento de escrita S.T. Dupont — corpo lacado ou metálico, montagem precisa em Faverges, equilíbrio pensado para uma vida de uso.`, en: `S.T. Dupont writing instrument — lacquered or metal body, precision-assembled in Faverges, balanced for a lifetime of use.` },
    collection: `Tinteiro`,
    categorySlug: "escrita",
    image: `/products/inkwell/040170.webp`,
    variants: [
      { sku: `040170`, name: { pt: `inkwell — Escuro & Azul`, en: `inkwell — Dark Blue` }, priceCents: 4508, currency: "EUR", attributes: { color: { label: { pt: `Escuro & Azul`, en: `Dark Blue` }, hex: ["#2a2d34", "#1f3c66"] } }, image: `/products/inkwell/040170.webp`, images: [`/products/inkwell/040170.webp`, `/products/inkwell/040170-2.webp`] },
      { sku: `040169`, name: { pt: `inkwell — Turquesa & Azul`, en: `inkwell — Turquoise Blue` }, priceCents: 4508, currency: "EUR", attributes: { color: { label: { pt: `Turquesa & Azul`, en: `Turquoise Blue` }, hex: ["#3aaba6", "#1f3c66"] } }, image: `/products/inkwell/040169.webp`, images: [`/products/inkwell/040169.webp`, `/products/inkwell/040169-2.webp`] },
      { sku: `040168`, name: { pt: `inkwell — Verde`, en: `inkwell — Green` }, priceCents: 4508, currency: "EUR", attributes: { color: { label: { pt: `Verde`, en: `Green` }, hex: ["#3a5040"] } }, image: `/products/inkwell/040168.webp`, images: [`/products/inkwell/040168.webp`, `/products/inkwell/040168-2.webp`] },
      { sku: `040167`, name: { pt: `inkwell — Vermelho`, en: `inkwell — Red` }, priceCents: 4508, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/inkwell/040167.webp`, images: [`/products/inkwell/040167.webp`, `/products/inkwell/040167-2.webp`] },
      { sku: `040166`, name: { pt: `inkwell — Real & Azul`, en: `inkwell — Royal Blue` }, priceCents: 4508, currency: "EUR", attributes: { color: { label: { pt: `Real & Azul`, en: `Royal Blue` }, hex: ["#2845a3", "#1f3c66"] } }, image: `/products/inkwell/040166.webp`, images: [`/products/inkwell/040166.webp`, `/products/inkwell/040166-2.webp`] },
      { sku: `040165`, name: { pt: `inkwell — Preto`, en: `inkwell — Black` }, priceCents: 4508, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/inkwell/040165.webp`, images: [`/products/inkwell/040165.webp`, `/products/inkwell/040165-2.webp`] }
    ],
  },
  {
    slug: `eternity-snake-skin`,
    name: { pt: `Eternity · Pele de Cobra`, en: `Eternity · Snake skin` },
    description: { pt: `Instrumento de escrita S.T. Dupont — corpo lacado ou metálico, montagem precisa em Faverges, equilíbrio pensado para uma vida de uso.`, en: `S.T. Dupont writing instrument — lacquered or metal body, precision-assembled in Faverges, balanced for a lifetime of use.` },
    collection: `Eternity`,
    categorySlug: "escrita",
    image: `/products/eternity-snake-skin/422079L.webp`,
    variants: [
      { sku: `422079L`, name: { pt: `Eternity · Snake skin — Preto`, en: `Eternity · Snake skin — Black` }, priceCents: 91540, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/eternity-snake-skin/422079L.webp`, images: [`/products/eternity-snake-skin/422079L.webp`, `/products/eternity-snake-skin/422079L-2.webp`, `/products/eternity-snake-skin/422079L-3.webp`, `/products/eternity-snake-skin/422079L-4.webp`] },
      { sku: `420079L`, name: { pt: `Eternity · Snake skin — Preto`, en: `Eternity · Snake skin — Black` }, priceCents: 109940, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/eternity-snake-skin/420079L.webp`, images: [`/products/eternity-snake-skin/420079L.webp`, `/products/eternity-snake-skin/420079L-2.webp`, `/products/eternity-snake-skin/420079L-3.webp`, `/products/eternity-snake-skin/420079L-4.webp`] }
    ],
  },
  {
    slug: `eternity-monogram-1872`,
    name: { pt: `Eternity · Monogram 1872`, en: `Eternity · monogram 1872` },
    description: { pt: `Instrumento de escrita S.T. Dupont — corpo lacado ou metálico, montagem precisa em Faverges, equilíbrio pensado para uma vida de uso.`, en: `S.T. Dupont writing instrument — lacquered or metal body, precision-assembled in Faverges, balanced for a lifetime of use.` },
    collection: `Eternity`,
    categorySlug: "escrita",
    image: `/products/eternity-monogram-1872/425023M.webp`,
    variants: [
      { sku: `425023M`, name: { pt: `Eternity · monogram 1872 — Preto`, en: `Eternity · monogram 1872 — Black` }, priceCents: 73140, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/eternity-monogram-1872/425023M.webp`, images: [`/products/eternity-monogram-1872/425023M.webp`, `/products/eternity-monogram-1872/425023M-2.webp`, `/products/eternity-monogram-1872/425023M-3.webp`, `/products/eternity-monogram-1872/425023M-4.webp`] },
      { sku: `425021M`, name: { pt: `Eternity · monogram 1872 — Prata`, en: `Eternity · monogram 1872 — Silver` }, priceCents: 73140, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/eternity-monogram-1872/425021M.webp`, images: [`/products/eternity-monogram-1872/425021M.webp`, `/products/eternity-monogram-1872/425021M-2.webp`, `/products/eternity-monogram-1872/425021M-3.webp`, `/products/eternity-monogram-1872/425021M-4.webp`] },
      { sku: `420020L`, name: { pt: `Eternity · monogram 1872 — Dourado`, en: `Eternity · monogram 1872 — Golden` }, priceCents: 100740, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/eternity-monogram-1872/420020L.webp`, images: [`/products/eternity-monogram-1872/420020L.webp`, `/products/eternity-monogram-1872/420020L-2.webp`, `/products/eternity-monogram-1872/420020L-3.webp`, `/products/eternity-monogram-1872/420020L-4.webp`] }
    ],
  },
  {
    slug: `eternity-game-of-thrones`,
    name: { pt: `Eternity · Game of Thrones`, en: `Eternity · Game of Thrones` },
    description: { pt: `Instrumento de escrita S.T. Dupont — corpo lacado ou metálico, montagem precisa em Faverges, equilíbrio pensado para uma vida de uso.`, en: `S.T. Dupont writing instrument — lacquered or metal body, precision-assembled in Faverges, balanced for a lifetime of use.` },
    collection: `Eternity`,
    categorySlug: "escrita",
    image: `/products/eternity-game-of-thrones/422037L.webp`,
    variants: [
      { sku: `422037L`, name: { pt: `Eternity · Game of Thrones — Fogo & Laranja`, en: `Eternity · Game of Thrones — Fire Orange` }, priceCents: 165140, currency: "EUR", attributes: { color: { label: { pt: `Fogo & Laranja`, en: `Fire Orange` }, hex: ["#c4392b", "#c4642d"] } }, image: `/products/eternity-game-of-thrones/422037L.webp`, images: [`/products/eternity-game-of-thrones/422037L.webp`, `/products/eternity-game-of-thrones/422037L-2.webp`, `/products/eternity-game-of-thrones/422037L-3.webp`, `/products/eternity-game-of-thrones/422037L-4.webp`] }
    ],
  },
  {
    slug: `d-initial-game-of-thrones`,
    name: { pt: `Initial · Game of Thrones`, en: `D Initial · Game of Thrones` },
    description: { pt: `Instrumento de escrita S.T. Dupont — corpo lacado ou metálico, montagem precisa em Faverges, equilíbrio pensado para uma vida de uso.`, en: `S.T. Dupont writing instrument — lacquered or metal body, precision-assembled in Faverges, balanced for a lifetime of use.` },
    collection: `Initial`,
    categorySlug: "escrita",
    image: `/products/d-initial-game-of-thrones/272039.webp`,
    variants: [
      { sku: `272039`, name: { pt: `D Initial · Game of Thrones — Preto`, en: `D Initial · Game of Thrones — Black` }, priceCents: 35420, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/d-initial-game-of-thrones/272039.webp`, images: [`/products/d-initial-game-of-thrones/272039.webp`, `/products/d-initial-game-of-thrones/272039-2.webp`, `/products/d-initial-game-of-thrones/272039-3.webp`, `/products/d-initial-game-of-thrones/272039-4.webp`] }
    ],
  },
  {
    slug: `eternity-casablanca`,
    name: { pt: `Eternity · Casablanca`, en: `Eternity · Casablanca` },
    description: { pt: `Instrumento de escrita S.T. Dupont — corpo lacado ou metálico, montagem precisa em Faverges, equilíbrio pensado para uma vida de uso.`, en: `S.T. Dupont writing instrument — lacquered or metal body, precision-assembled in Faverges, balanced for a lifetime of use.` },
    collection: `Eternity`,
    categorySlug: "escrita",
    image: `/products/eternity-casablanca/420111L.webp`,
    variants: [
      { sku: `420111L`, name: { pt: `Eternity · Casablanca — Multicolor`, en: `Eternity · Casablanca — Multicolor` }, priceCents: 137540, currency: "EUR", attributes: { color: { label: { pt: `Multicolor`, en: `Multicolor` }, hex: ["#7a7d83"] } }, image: `/products/eternity-casablanca/420111L.webp`, images: [`/products/eternity-casablanca/420111L.webp`, `/products/eternity-casablanca/420111L-2.webp`, `/products/eternity-casablanca/420111L-3.webp`, `/products/eternity-casablanca/420111L-4.webp`] }
    ],
  },
  {
    slug: `defi-millennium`,
    name: { pt: `Défi Millennium`, en: `Defi millennium` },
    description: { pt: `Instrumento de escrita S.T. Dupont — corpo lacado ou metálico, montagem precisa em Faverges, equilíbrio pensado para uma vida de uso.`, en: `S.T. Dupont writing instrument — lacquered or metal body, precision-assembled in Faverges, balanced for a lifetime of use.` },
    collection: `Défi Millennium`,
    categorySlug: "escrita",
    image: `/products/defi-millennium/405032.webp`,
    variants: [
      { sku: `405032`, name: { pt: `Defi millennium — Néon & Verde`, en: `Defi millennium — Neon Green` }, priceCents: 30820, currency: "EUR", attributes: { color: { label: { pt: `Néon & Verde`, en: `Neon Green` }, hex: ["#aef043", "#3a5040"] } }, image: `/products/defi-millennium/405032.webp`, images: [`/products/defi-millennium/405032.webp`, `/products/defi-millennium/405032-2.webp`, `/products/defi-millennium/405032-3.webp`, `/products/defi-millennium/405032-4.webp`] }
    ],
  },
  {
    slug: `eternity-fire-x`,
    name: { pt: `Eternity · Fire X`, en: `Eternity · Fire X` },
    description: { pt: `Instrumento de escrita S.T. Dupont — corpo lacado ou metálico, montagem precisa em Faverges, equilíbrio pensado para uma vida de uso.`, en: `S.T. Dupont writing instrument — lacquered or metal body, precision-assembled in Faverges, balanced for a lifetime of use.` },
    collection: `Eternity`,
    categorySlug: "escrita",
    image: `/products/eternity-fire-x/422070M.webp`,
    variants: [
      { sku: `422070M`, name: { pt: `Eternity · Fire X — Preto`, en: `Eternity · Fire X — Black` }, priceCents: 73140, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/eternity-fire-x/422070M.webp`, images: [`/products/eternity-fire-x/422070M.webp`, `/products/eternity-fire-x/422070M-2.webp`, `/products/eternity-fire-x/422070M-3.webp`, `/products/eternity-fire-x/422070M-4.webp`] },
      { sku: `420070M`, name: { pt: `Eternity · Fire X — Preto`, en: `Eternity · Fire X — Black` }, priceCents: 91540, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/eternity-fire-x/420070M.webp`, images: [`/products/eternity-fire-x/420070M.webp`, `/products/eternity-fire-x/420070M-2.webp`, `/products/eternity-fire-x/420070M-3.webp`, `/products/eternity-fire-x/420070M-4.webp`] }
    ],
  },
  {
    slug: `liberte-2`,
    name: { pt: `Liberté`, en: `Liberte` },
    description: { pt: `Instrumento de escrita S.T. Dupont — corpo lacado ou metálico, montagem precisa em Faverges, equilíbrio pensado para uma vida de uso.`, en: `S.T. Dupont writing instrument — lacquered or metal body, precision-assembled in Faverges, balanced for a lifetime of use.` },
    collection: `Liberté`,
    categorySlug: "escrita",
    image: `/products/liberte-2/465226G.webp`,
    variants: [
      { sku: `465226G`, name: { pt: `Liberte — Coral & Rosa`, en: `Liberte — Coral & Pink` }, priceCents: 48300, currency: "EUR", attributes: { color: { label: { pt: `Coral & Rosa`, en: `Coral & Pink` }, hex: ["#e2675a", "#e7a3b1"] } }, image: `/products/liberte-2/465226G.webp`, images: [`/products/liberte-2/465226G.webp`, `/products/liberte-2/465226G-2.webp`, `/products/liberte-2/465226G-3.webp`, `/products/liberte-2/465226G-4.webp`] },
      { sku: `465225G`, name: { pt: `Liberte — Lilás & Prata`, en: `Liberte — Lilac & Silver` }, priceCents: 48300, currency: "EUR", attributes: { color: { label: { pt: `Lilás & Prata`, en: `Lilac & Silver` }, hex: ["#b89dcb", "#c9ccd1"] } }, image: `/products/liberte-2/465225G.webp`, images: [`/products/liberte-2/465225G.webp`, `/products/liberte-2/465225G-2.webp`, `/products/liberte-2/465225G-3.webp`, `/products/liberte-2/465225G-4.webp`] },
      { sku: `465223G`, name: { pt: `Liberte — Branco`, en: `Liberte — White` }, priceCents: 48300, currency: "EUR", attributes: { color: { label: { pt: `Branco`, en: `White` }, hex: ["#f3efe6"] } }, image: `/products/liberte-2/465223G.webp`, images: [`/products/liberte-2/465223G.webp`, `/products/liberte-2/465223G-2.webp`, `/products/liberte-2/465223G-3.webp`, `/products/liberte-2/465223G-4.webp`] },
      { sku: `465222G`, name: { pt: `Liberte — Azul & Índigo & Azul`, en: `Liberte — Blue & Indigo Blue` }, priceCents: 48300, currency: "EUR", attributes: { color: { label: { pt: `Azul & Índigo & Azul`, en: `Blue & Indigo Blue` }, hex: ["#1f3c66", "#2c2c63"] } }, image: `/products/liberte-2/465222G.webp`, images: [`/products/liberte-2/465222G.webp`, `/products/liberte-2/465222G-2.webp`, `/products/liberte-2/465222G-3.webp`, `/products/liberte-2/465222G-4.webp`] }
    ],
  },
  {
    slug: `writing-instruments`,
    name: { pt: `Escrita`, en: `Writing instruments` },
    description: { pt: `Instrumento de escrita S.T. Dupont — corpo lacado ou metálico, montagem precisa em Faverges, equilíbrio pensado para uma vida de uso.`, en: `S.T. Dupont writing instrument — lacquered or metal body, precision-assembled in Faverges, balanced for a lifetime of use.` },
    collection: `Escrita`,
    categorySlug: "escrita",
    image: `/products/writing-instruments/460398.webp`,
    variants: [
      { sku: `460398`, name: { pt: `Writing instruments — Branco`, en: `Writing instruments — White` }, priceCents: 73140, currency: "EUR", attributes: { color: { label: { pt: `Branco`, en: `White` }, hex: ["#f3efe6"] } }, image: `/products/writing-instruments/460398.webp`, images: [`/products/writing-instruments/460398.webp`, `/products/writing-instruments/460398-2.webp`, `/products/writing-instruments/460398-3.webp`, `/products/writing-instruments/460398-4.webp`] },
      { sku: `460674`, name: { pt: `Writing instruments — Rosa`, en: `Writing instruments — Pink` }, priceCents: 62101, currency: "EUR", attributes: { color: { label: { pt: `Rosa`, en: `Pink` }, hex: ["#e7a3b1"] } }, image: `/products/writing-instruments/460674.webp`, images: [`/products/writing-instruments/460674.webp`] }
    ],
  },
  {
    slug: `defi-explorer`,
    name: { pt: `Défi Explorer`, en: `Defi explorer` },
    description: { pt: `Peça em pele S.T. Dupont — curtimenta diamante, costura selada à mão, savoir-faire da maison desde 1872.`, en: `S.T. Dupont leather piece — diamond tanning, hand-sealed stitching, maison savoir-faire since 1872.` },
    collection: `Défi Explorer`,
    categorySlug: "pele",
    image: `/products/defi-explorer/1IC132NK1.webp`,
    variants: [
      { sku: `1IC132NK1`, name: { pt: `Defi explorer — Verde & Caqui`, en: `Defi explorer — Green & Khaki` }, priceCents: 119140, currency: "EUR", attributes: { color: { label: { pt: `Verde & Caqui`, en: `Green & Khaki` }, hex: ["#3a5040", "#7a7a4b"] } }, image: `/products/defi-explorer/1IC132NK1.webp`, images: [`/products/defi-explorer/1IC132NK1.webp`, `/products/defi-explorer/1IC132NK1-2.webp`, `/products/defi-explorer/1IC132NK1-3.webp`, `/products/defi-explorer/1IC132NK1-4.webp`] }
    ],
  },
  {
    slug: `atelier`,
    name: { pt: `Atelier`, en: `Atelier` },
    description: { pt: `Peça em pele S.T. Dupont — curtimenta diamante, costura selada à mão, savoir-faire da maison desde 1872.`, en: `S.T. Dupont leather piece — diamond tanning, hand-sealed stitching, maison savoir-faire since 1872.` },
    collection: `Atelier`,
    categorySlug: "pele",
    image: `/products/atelier/141452.webp`,
    variants: [
      { sku: `141452`, name: { pt: `Atelier — Castanho`, en: `Atelier — Brown` }, priceCents: 165140, currency: "EUR", attributes: { color: { label: { pt: `Castanho`, en: `Brown` }, hex: ["#6b4a2a"] } }, image: `/products/atelier/141452.webp`, images: [`/products/atelier/141452.webp`, `/products/atelier/141452-2.webp`, `/products/atelier/141452-3.webp`, `/products/atelier/141452-4.webp`] },
      { sku: `191575`, name: { pt: `Atelier — Preto`, en: `Atelier — Black` }, priceCents: 312340, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/atelier/191575.webp`, images: [`/products/atelier/191575.webp`, `/products/atelier/191575-2.webp`, `/products/atelier/191575-3.webp`, `/products/atelier/191575-4.webp`] },
      { sku: `191574`, name: { pt: `Atelier — Preto`, en: `Atelier — Black` }, priceCents: 339940, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/atelier/191574.webp`, images: [`/products/atelier/191574.webp`, `/products/atelier/191574-2.webp`, `/products/atelier/191574-3.webp`, `/products/atelier/191574-4.webp`] },
      { sku: `191375`, name: { pt: `Atelier — Azul`, en: `Atelier — Blue` }, priceCents: 312340, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/atelier/191375.webp`, images: [`/products/atelier/191375.webp`, `/products/atelier/191375-2.webp`, `/products/atelier/191375-3.webp`, `/products/atelier/191375-4.webp`] },
      { sku: `191374`, name: { pt: `Atelier — Azul`, en: `Atelier — Blue` }, priceCents: 339940, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/atelier/191374.webp`, images: [`/products/atelier/191374.webp`, `/products/atelier/191374-2.webp`, `/products/atelier/191374-3.webp`, `/products/atelier/191374-4.webp`] },
      { sku: `190576`, name: { pt: `Atelier — Preto`, en: `Atelier — Black` }, priceCents: 45540, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/atelier/190576.webp`, images: [`/products/atelier/190576.webp`, `/products/atelier/190576-2.webp`] }
    ],
  },
  {
    slug: `lighter-accessories`,
    name: { pt: `Estojos para Isqueiros`, en: `Lighter Accessories` },
    description: { pt: `Peça em pele S.T. Dupont — curtimenta diamante, costura selada à mão, savoir-faire da maison desde 1872.`, en: `S.T. Dupont leather piece — diamond tanning, hand-sealed stitching, maison savoir-faire since 1872.` },
    collection: `Estojos para Isqueiros`,
    categorySlug: "pele",
    image: null,
    variants: [
      { sku: `160030T`, name: { pt: `Lighter Accessories — S.t. & Dupont`, en: `Lighter Accessories — S.T. Dupont` }, priceCents: 9108, currency: "EUR", attributes: { color: { label: { pt: `S.t. & Dupont`, en: `S.T. Dupont` }, hex: ["#7a7d83"] } }, image: undefined },
      { sku: `160028S`, name: { pt: `Lighter Accessories — S.t. & Dupont`, en: `Lighter Accessories — S.T. Dupont` }, priceCents: 9108, currency: "EUR", attributes: { color: { label: { pt: `S.t. & Dupont`, en: `S.T. Dupont` }, hex: ["#7a7d83"] } }, image: `/products/lighter-accessories/160028S-2.webp`, images: [`/products/lighter-accessories/160028S-2.webp`] },
      { sku: `160023C`, name: { pt: `Lighter Accessories — S.t. & Dupont`, en: `Lighter Accessories — S.T. Dupont` }, priceCents: 9108, currency: "EUR", attributes: { color: { label: { pt: `S.t. & Dupont`, en: `S.T. Dupont` }, hex: ["#7a7d83"] } }, image: `/products/lighter-accessories/160023C.webp`, images: [`/products/lighter-accessories/160023C.webp`, `/products/lighter-accessories/160023C-2.webp`] },
      { sku: `160014C`, name: { pt: `Lighter Accessories — S.t. & Dupont`, en: `Lighter Accessories — S.T. Dupont` }, priceCents: 9108, currency: "EUR", attributes: { color: { label: { pt: `S.t. & Dupont`, en: `S.T. Dupont` }, hex: ["#7a7d83"] } }, image: `/products/lighter-accessories/160014C.webp`, images: [`/products/lighter-accessories/160014C.webp`, `/products/lighter-accessories/160014C-2.webp`] }
    ],
  },
  {
    slug: `lighter-case`,
    name: { pt: `Estojo de Isqueiro`, en: `lighter case` },
    description: { pt: `Peça em pele S.T. Dupont — curtimenta diamante, costura selada à mão, savoir-faire da maison desde 1872.`, en: `S.T. Dupont leather piece — diamond tanning, hand-sealed stitching, maison savoir-faire since 1872.` },
    collection: `Estojo de Isqueiro`,
    categorySlug: "pele",
    image: `/products/lighter-case/160016C.webp`,
    variants: [
      { sku: `160016C`, name: { pt: `lighter case — S.t. & Dupont`, en: `lighter case — S.T. Dupont` }, priceCents: 9108, currency: "EUR", attributes: { color: { label: { pt: `S.t. & Dupont`, en: `S.T. Dupont` }, hex: ["#7a7d83"] } }, image: `/products/lighter-case/160016C.webp`, images: [`/products/lighter-case/160016C.webp`, `/products/lighter-case/160016C-2.webp`] },
      { sku: `160025B`, name: { pt: `lighter case — S.t. & Dupont`, en: `lighter case — S.T. Dupont` }, priceCents: 9108, currency: "EUR", attributes: { color: { label: { pt: `S.t. & Dupont`, en: `S.T. Dupont` }, hex: ["#7a7d83"] } }, image: `/products/lighter-case/160025B.webp`, images: [`/products/lighter-case/160025B.webp`, `/products/lighter-case/160025B-2.webp`] }
    ],
  },
  {
    slug: `pen-case`,
    name: { pt: `Estojo de Caneta`, en: `Pen case` },
    description: { pt: `Peça em pele S.T. Dupont — curtimenta diamante, costura selada à mão, savoir-faire da maison desde 1872.`, en: `S.T. Dupont leather piece — diamond tanning, hand-sealed stitching, maison savoir-faire since 1872.` },
    collection: `Estojo de Caneta`,
    categorySlug: "pele",
    image: `/products/pen-case/007162.webp`,
    variants: [
      { sku: `007162`, name: { pt: `Pen case — Ouro`, en: `Pen case — Gold` }, priceCents: 29900, currency: "EUR", attributes: { color: { label: { pt: `Ouro`, en: `Gold` }, hex: ["#c8a24a"] } }, image: `/products/pen-case/007162.webp`, images: [`/products/pen-case/007162.webp`, `/products/pen-case/007162-2.webp`, `/products/pen-case/007162-3.webp`] },
      { sku: `007161`, name: { pt: `Pen case — Prata`, en: `Pen case — Silver` }, priceCents: 29900, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/pen-case/007161.webp`, images: [`/products/pen-case/007161.webp`, `/products/pen-case/007161-2.webp`, `/products/pen-case/007161-3.webp`] }
    ],
  },
  {
    slug: `fuente`,
    name: { pt: `Fuente`, en: `Fuente` },
    description: { pt: `Peça em pele S.T. Dupont — curtimenta diamante, costura selada à mão, savoir-faire da maison desde 1872.`, en: `S.T. Dupont leather piece — diamond tanning, hand-sealed stitching, maison savoir-faire since 1872.` },
    collection: `Fuente`,
    categorySlug: "pele",
    image: `/products/fuente/1FU153BK1.webp`,
    variants: [
      { sku: `1FU153BK1`, name: { pt: `Fuente — Multicolor`, en: `Fuente — Multicolor` }, priceCents: 247940, currency: "EUR", attributes: { color: { label: { pt: `Multicolor`, en: `Multicolor` }, hex: ["#7a7d83"] } }, image: `/products/fuente/1FU153BK1.webp`, images: [`/products/fuente/1FU153BK1.webp`, `/products/fuente/1FU153BK1-2.webp`, `/products/fuente/1FU153BK1-3.webp`] }
    ],
  },
  {
    slug: `camera-bag-fuente`,
    name: { pt: `Camera bag · Fuente`, en: `Camera bag · Fuente` },
    description: { pt: `Peça em pele S.T. Dupont — curtimenta diamante, costura selada à mão, savoir-faire da maison desde 1872.`, en: `S.T. Dupont leather piece — diamond tanning, hand-sealed stitching, maison savoir-faire since 1872.` },
    collection: `Camera bag`,
    categorySlug: "pele",
    image: `/products/camera-bag-fuente/1FU183BK1.webp`,
    variants: [
      { sku: `1FU183BK1`, name: { pt: `Camera bag · Fuente — Multicolor`, en: `Camera bag · Fuente — Multicolor` }, priceCents: 155940, currency: "EUR", attributes: { color: { label: { pt: `Multicolor`, en: `Multicolor` }, hex: ["#7a7d83"] } }, image: `/products/camera-bag-fuente/1FU183BK1.webp`, images: [`/products/camera-bag-fuente/1FU183BK1.webp`, `/products/camera-bag-fuente/1FU183BK1-2.webp`, `/products/camera-bag-fuente/1FU183BK1-3.webp`, `/products/camera-bag-fuente/1FU183BK1-4.webp`] }
    ],
  },
  {
    slug: `firehead`,
    name: { pt: `Firehead`, en: `Firehead` },
    description: { pt: `Peça em pele S.T. Dupont — curtimenta diamante, costura selada à mão, savoir-faire da maison desde 1872.`, en: `S.T. Dupont leather piece — diamond tanning, hand-sealed stitching, maison savoir-faire since 1872.` },
    collection: `Firehead`,
    categorySlug: "pele",
    image: `/products/firehead/161113.webp`,
    variants: [
      { sku: `161113`, name: { pt: `Firehead — Preto`, en: `Firehead — Black` }, priceCents: 27140, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/firehead/161113.webp`, images: [`/products/firehead/161113.webp`, `/products/firehead/161113-2.webp`] },
      { sku: `161109`, name: { pt: `Firehead — Preto`, en: `Firehead — Black` }, priceCents: 20700, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/firehead/161109.webp`, images: [`/products/firehead/161109.webp`, `/products/firehead/161109-2.webp`, `/products/firehead/161109-3.webp`, `/products/firehead/161109-4.webp`] },
      { sku: `160011`, name: { pt: `Firehead — Preto`, en: `Firehead — Black` }, priceCents: 100740, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/firehead/160011.webp`, images: [`/products/firehead/160011.webp`, `/products/firehead/160011-2.webp`, `/products/firehead/160011-3.webp`, `/products/firehead/160011-4.webp`] }
    ],
  },
  {
    slug: `neo-capsule`,
    name: { pt: `Neo Capsule`, en: `Neo Capsule` },
    description: { pt: `Peça em pele S.T. Dupont — curtimenta diamante, costura selada à mão, savoir-faire da maison desde 1872.`, en: `S.T. Dupont leather piece — diamond tanning, hand-sealed stitching, maison savoir-faire since 1872.` },
    collection: `Neo Capsule`,
    categorySlug: "pele",
    image: `/products/neo-capsule/181240.webp`,
    variants: [
      { sku: `181240`, name: { pt: `Neo Capsule — Preto`, en: `Neo Capsule — Black` }, priceCents: 137540, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/neo-capsule/181240.webp`, images: [`/products/neo-capsule/181240.webp`, `/products/neo-capsule/181240-2.webp`, `/products/neo-capsule/181240-3.webp`, `/products/neo-capsule/181240-4.webp`] }
    ],
  },
  {
    slug: `cufflink`,
    name: { pt: `Botões de Punho`, en: `Cufflink` },
    description: { pt: `Acessório S.T. Dupont — metal e laca tratados à mão, na tradição da casa francesa fundada em 1872.`, en: `S.T. Dupont accessory — hand-finished metal and lacquer in the tradition of the French house founded in 1872.` },
    collection: `Botões de Punho`,
    categorySlug: "acessorios",
    image: `/products/cufflink/005568.webp`,
    variants: [
      { sku: `005568`, name: { pt: `Cufflink — Prata`, en: `Cufflink — Silver` }, priceCents: 24380, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/cufflink/005568.webp`, images: [`/products/cufflink/005568.webp`] }
    ],
  },
  {
    slug: `cigar-cutter-2`,
    name: { pt: `Cortador de Charuto`, en: `Cigar Cutter` },
    description: { pt: `Acessório S.T. Dupont — metal e laca tratados à mão, na tradição da casa francesa fundada em 1872.`, en: `S.T. Dupont accessory — hand-finished metal and lacquer in the tradition of the French house founded in 1872.` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cigar-cutter-2/003433.webp`,
    variants: [
      { sku: `003433`, name: { pt: `Cigar Cutter — Preto`, en: `Cigar Cutter — Black` }, priceCents: 20700, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/cigar-cutter-2/003433.webp`, images: [`/products/cigar-cutter-2/003433.webp`] },
      { sku: `003475`, name: { pt: `Cigar Cutter — Vermelho`, en: `Cigar Cutter — Red` }, priceCents: 31740, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/cigar-cutter-2/003475.webp`, images: [`/products/cigar-cutter-2/003475.webp`, `/products/cigar-cutter-2/003475-2.webp`, `/products/cigar-cutter-2/003475-3.webp`] },
      { sku: `003480`, name: { pt: `Cigar Cutter — Prata`, en: `Cigar Cutter — Silver` }, priceCents: 26220, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/cigar-cutter-2/003480.webp`, images: [`/products/cigar-cutter-2/003480.webp`, `/products/cigar-cutter-2/003480-2.webp`, `/products/cigar-cutter-2/003480-3.webp`] },
      { sku: `003482`, name: { pt: `Cigar Cutter — Dourado`, en: `Cigar Cutter — Golden` }, priceCents: 26220, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/cigar-cutter-2/003482.webp`, images: [`/products/cigar-cutter-2/003482.webp`, `/products/cigar-cutter-2/003482-2.webp`, `/products/cigar-cutter-2/003482-3.webp`] },
      { sku: `003481`, name: { pt: `Cigar Cutter — Preto`, en: `Cigar Cutter — Black` }, priceCents: 26220, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/cigar-cutter-2/003481.webp`, images: [`/products/cigar-cutter-2/003481.webp`, `/products/cigar-cutter-2/003481-2.webp`, `/products/cigar-cutter-2/003481-3.webp`] },
      { sku: `003280P`, name: { pt: `Cigar Cutter — Prata`, en: `Cigar Cutter — Silver` }, priceCents: 31740, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/cigar-cutter-2/003280P.webp`, images: [`/products/cigar-cutter-2/003280P.webp`, `/products/cigar-cutter-2/003280P-2.webp`, `/products/cigar-cutter-2/003280P-3.webp`] },
      { sku: `003282P`, name: { pt: `Cigar Cutter — Dourado`, en: `Cigar Cutter — Golden` }, priceCents: 31740, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/cigar-cutter-2/003282P.webp`, images: [`/products/cigar-cutter-2/003282P.webp`, `/products/cigar-cutter-2/003282P-2.webp`, `/products/cigar-cutter-2/003282P-3.webp`] },
      { sku: `003281P`, name: { pt: `Cigar Cutter — Preto`, en: `Cigar Cutter — Black` }, priceCents: 31740, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/cigar-cutter-2/003281P.webp`, images: [`/products/cigar-cutter-2/003281P.webp`, `/products/cigar-cutter-2/003281P-2.webp`, `/products/cigar-cutter-2/003281P-3.webp`] }
    ],
  },
  {
    slug: `double-cigar-case`,
    name: { pt: `Estojo Duplo de Charuto`, en: `Double Cigar Case` },
    description: { pt: `Acessório S.T. Dupont — metal e laca tratados à mão, na tradição da casa francesa fundada em 1872.`, en: `S.T. Dupont accessory — hand-finished metal and lacquer in the tradition of the French house founded in 1872.` },
    collection: `Estojo Duplo de Charuto`,
    categorySlug: "acessorios",
    image: `/products/double-cigar-case/183161.webp`,
    variants: [
      { sku: `183161`, name: { pt: `Double Cigar Case — Azul`, en: `Double Cigar Case — Blue` }, priceCents: 27140, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/double-cigar-case/183161.webp`, images: [`/products/double-cigar-case/183161.webp`, `/products/double-cigar-case/183161-2.webp`, `/products/double-cigar-case/183161-3.webp`, `/products/double-cigar-case/183161-4.webp`] },
      { sku: `183162`, name: { pt: `Double Cigar Case — Rosa`, en: `Double Cigar Case — Pink` }, priceCents: 27140, currency: "EUR", attributes: { color: { label: { pt: `Rosa`, en: `Pink` }, hex: ["#e7a3b1"] } }, image: `/products/double-cigar-case/183162.webp`, images: [`/products/double-cigar-case/183162.webp`, `/products/double-cigar-case/183162-2.webp`, `/products/double-cigar-case/183162-3.webp`, `/products/double-cigar-case/183162-4.webp`] }
    ],
  },
  {
    slug: `2-cigar-case`,
    name: { pt: `Estojo Duplo de Charuto`, en: `2 cigar case` },
    description: { pt: `Acessório S.T. Dupont — metal e laca tratados à mão, na tradição da casa francesa fundada em 1872.`, en: `S.T. Dupont accessory — hand-finished metal and lacquer in the tradition of the French house founded in 1872.` },
    collection: `Estojo Duplo de Charuto`,
    categorySlug: "acessorios",
    image: `/products/2-cigar-case/183245.webp`,
    variants: [
      { sku: `183245`, name: { pt: `2 cigar case — Fúcsia & Rosa & Rosa`, en: `2 cigar case — Fuchsia Pink & Pink` }, priceCents: 28980, currency: "EUR", attributes: { color: { label: { pt: `Fúcsia & Rosa & Rosa`, en: `Fuchsia Pink & Pink` }, hex: ["#c43f7a", "#e7a3b1"] } }, image: `/products/2-cigar-case/183245.webp`, images: [`/products/2-cigar-case/183245.webp`, `/products/2-cigar-case/183245-2.webp`] },
      { sku: `183267`, name: { pt: `2 cigar case — Azul & Índigo & Azul`, en: `2 cigar case — Blue & Indigo Blue` }, priceCents: 28980, currency: "EUR", attributes: { color: { label: { pt: `Azul & Índigo & Azul`, en: `Blue & Indigo Blue` }, hex: ["#1f3c66", "#2c2c63"] } }, image: `/products/2-cigar-case/183267.webp`, images: [`/products/2-cigar-case/183267.webp`, `/products/2-cigar-case/183267-2.webp`] },
      { sku: `183260`, name: { pt: `2 cigar case — Preto`, en: `2 cigar case — Black` }, priceCents: 28980, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/2-cigar-case/183260.webp`, images: [`/products/2-cigar-case/183260.webp`, `/products/2-cigar-case/183260-2.webp`, `/products/2-cigar-case/183260-3.webp`] },
      { sku: `183250`, name: { pt: `2 cigar case — Preto`, en: `2 cigar case — Black` }, priceCents: 28980, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/2-cigar-case/183250.webp`, images: [`/products/2-cigar-case/183250.webp`, `/products/2-cigar-case/183250-2.webp`, `/products/2-cigar-case/183250-3.webp`, `/products/2-cigar-case/183250-4.webp`] },
      { sku: `183249`, name: { pt: `2 cigar case — Verde & Caqui`, en: `2 cigar case — Green & Khaki` }, priceCents: 28980, currency: "EUR", attributes: { color: { label: { pt: `Verde & Caqui`, en: `Green & Khaki` }, hex: ["#3a5040", "#7a7a4b"] } }, image: `/products/2-cigar-case/183249.webp`, images: [`/products/2-cigar-case/183249.webp`, `/products/2-cigar-case/183249-2.webp`, `/products/2-cigar-case/183249-3.webp`, `/products/2-cigar-case/183249-4.webp`] },
      { sku: `183240`, name: { pt: `2 cigar case — Preto`, en: `2 cigar case — Black` }, priceCents: 29900, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/2-cigar-case/183240.webp`, images: [`/products/2-cigar-case/183240.webp`, `/products/2-cigar-case/183240-2.webp`, `/products/2-cigar-case/183240-3.webp`] },
      { sku: `183243`, name: { pt: `2 cigar case — Turquesa & Azul`, en: `2 cigar case — Turquoise Blue` }, priceCents: 28980, currency: "EUR", attributes: { color: { label: { pt: `Turquesa & Azul`, en: `Turquoise Blue` }, hex: ["#3aaba6", "#1f3c66"] } }, image: `/products/2-cigar-case/183243.webp`, images: [`/products/2-cigar-case/183243.webp`, `/products/2-cigar-case/183243-2.webp`, `/products/2-cigar-case/183243-3.webp`] },
      { sku: `183269`, name: { pt: `2 cigar case — Verde & Caqui`, en: `2 cigar case — Green & Khaki` }, priceCents: 29900, currency: "EUR", attributes: { color: { label: { pt: `Verde & Caqui`, en: `Green & Khaki` }, hex: ["#3a5040", "#7a7a4b"] } }, image: `/products/2-cigar-case/183269.webp`, images: [`/products/2-cigar-case/183269.webp`, `/products/2-cigar-case/183269-2.webp`, `/products/2-cigar-case/183269-3.webp`] }
    ],
  },
  {
    slug: `3-cigar-case`,
    name: { pt: `Estojo Triplo de Charuto`, en: `3 cigar case` },
    description: { pt: `Acessório S.T. Dupont — metal e laca tratados à mão, na tradição da casa francesa fundada em 1872.`, en: `S.T. Dupont accessory — hand-finished metal and lacquer in the tradition of the French house founded in 1872.` },
    collection: `Estojo Triplo de Charuto`,
    categorySlug: "acessorios",
    image: `/products/3-cigar-case/183364.webp`,
    variants: [
      { sku: `183364`, name: { pt: `3 cigar case — Azul & Turquesa & Azul`, en: `3 cigar case — Blue & Turquoise Blue` }, priceCents: 29900, currency: "EUR", attributes: { color: { label: { pt: `Azul & Turquesa & Azul`, en: `Blue & Turquoise Blue` }, hex: ["#1f3c66", "#3aaba6"] } }, image: `/products/3-cigar-case/183364.webp`, images: [`/products/3-cigar-case/183364.webp`, `/products/3-cigar-case/183364-2.webp`, `/products/3-cigar-case/183364-3.webp`, `/products/3-cigar-case/183364-4.webp`] },
      { sku: `183349`, name: { pt: `3 cigar case — Verde & Caqui`, en: `3 cigar case — Green & Khaki` }, priceCents: 32200, currency: "EUR", attributes: { color: { label: { pt: `Verde & Caqui`, en: `Green & Khaki` }, hex: ["#3a5040", "#7a7a4b"] } }, image: `/products/3-cigar-case/183349.webp`, images: [`/products/3-cigar-case/183349.webp`, `/products/3-cigar-case/183349-2.webp`, `/products/3-cigar-case/183349-3.webp`, `/products/3-cigar-case/183349-4.webp`] },
      { sku: `183340`, name: { pt: `3 cigar case — Preto`, en: `3 cigar case — Black` }, priceCents: 32660, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/3-cigar-case/183340.webp`, images: [`/products/3-cigar-case/183340.webp`, `/products/3-cigar-case/183340-2.webp`, `/products/3-cigar-case/183340-3.webp`, `/products/3-cigar-case/183340-4.webp`] },
      { sku: `183417`, name: { pt: `3 cigar case — Néon & Verde`, en: `3 cigar case — Neon Green` }, priceCents: 32660, currency: "EUR", attributes: { color: { label: { pt: `Néon & Verde`, en: `Neon Green` }, hex: ["#aef043", "#3a5040"] } }, image: `/products/3-cigar-case/183417.webp`, images: [`/products/3-cigar-case/183417.webp`, `/products/3-cigar-case/183417-2.webp`] },
      { sku: `183419`, name: { pt: `3 cigar case — Néon & Laranja`, en: `3 cigar case — Neon Orange` }, priceCents: 32660, currency: "EUR", attributes: { color: { label: { pt: `Néon & Laranja`, en: `Neon Orange` }, hex: ["#aef043", "#c4642d"] } }, image: `/products/3-cigar-case/183419.webp`, images: [`/products/3-cigar-case/183419.webp`, `/products/3-cigar-case/183419-2.webp`, `/products/3-cigar-case/183419-3.webp`] }
    ],
  },
  {
    slug: `cigar-case-2`,
    name: { pt: `Estojo de Charuto`, en: `Cigar case` },
    description: { pt: `Acessório S.T. Dupont — metal e laca tratados à mão, na tradição da casa francesa fundada em 1872.`, en: `S.T. Dupont accessory — hand-finished metal and lacquer in the tradition of the French house founded in 1872.` },
    collection: `Estojo de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cigar-case-2/183160.webp`,
    variants: [
      { sku: `183160`, name: { pt: `Cigar case — Preto`, en: `Cigar case — Black` }, priceCents: 20700, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/cigar-case-2/183160.webp`, images: [`/products/cigar-case-2/183160.webp`, `/products/cigar-case-2/183160-2.webp`, `/products/cigar-case-2/183160-3.webp`, `/products/cigar-case-2/183160-4.webp`] }
    ],
  },
  {
    slug: `2-cigar-case-monogram-1872`,
    name: { pt: `Estojo Duplo de Charuto · Monogram 1872`, en: `2 cigar case · monogram 1872` },
    description: { pt: `Acessório S.T. Dupont — metal e laca tratados à mão, na tradição da casa francesa fundada em 1872.`, en: `S.T. Dupont accessory — hand-finished metal and lacquer in the tradition of the French house founded in 1872.` },
    collection: `Estojo Duplo de Charuto`,
    categorySlug: "acessorios",
    image: `/products/2-cigar-case-monogram-1872/183479.webp`,
    variants: [
      { sku: `183479`, name: { pt: `2 cigar case · monogram 1872 — Preto`, en: `2 cigar case · monogram 1872 — Black` }, priceCents: 29900, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/2-cigar-case-monogram-1872/183479.webp`, images: [`/products/2-cigar-case-monogram-1872/183479.webp`, `/products/2-cigar-case-monogram-1872/183479-2.webp`, `/products/2-cigar-case-monogram-1872/183479-3.webp`] },
      { sku: `183478`, name: { pt: `2 cigar case · monogram 1872 — Bordeaux`, en: `2 cigar case · monogram 1872 — Burgundy` }, priceCents: 29900, currency: "EUR", attributes: { color: { label: { pt: `Bordeaux`, en: `Burgundy` }, hex: ["#5e1f1f"] } }, image: `/products/2-cigar-case-monogram-1872/183478.webp`, images: [`/products/2-cigar-case-monogram-1872/183478.webp`, `/products/2-cigar-case-monogram-1872/183478-2.webp`, `/products/2-cigar-case-monogram-1872/183478-3.webp`] }
    ],
  },
  {
    slug: `ligne-2-3`,
    name: { pt: `Ligne 2`, en: `Ligne 2` },
    description: { pt: `Acessório S.T. Dupont — metal e laca tratados à mão, na tradição da casa francesa fundada em 1872.`, en: `S.T. Dupont accessory — hand-finished metal and lacquer in the tradition of the French house founded in 1872.` },
    collection: `Ligne 2`,
    categorySlug: "acessorios",
    image: `/products/ligne-2-3/183070.webp`,
    variants: [
      { sku: `183070`, name: { pt: `Ligne 2 — Preto`, en: `Ligne 2 — Black` }, priceCents: 19780, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/ligne-2-3/183070.webp`, images: [`/products/ligne-2-3/183070.webp`, `/products/ligne-2-3/183070-2.webp`, `/products/ligne-2-3/183070-3.webp`] }
    ],
  },
  {
    slug: `line-d`,
    name: { pt: `Line D`, en: `Line D` },
    description: { pt: `Acessório S.T. Dupont — metal e laca tratados à mão, na tradição da casa francesa fundada em 1872.`, en: `S.T. Dupont accessory — hand-finished metal and lacquer in the tradition of the French house founded in 1872.` },
    collection: `Line D`,
    categorySlug: "acessorios",
    image: `/products/line-d/180024.webp`,
    variants: [
      { sku: `180024`, name: { pt: `Line D — Preto`, en: `Line D — Black` }, priceCents: 20700, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d/180024.webp`, images: [`/products/line-d/180024.webp`] },
      { sku: `180124`, name: { pt: `Line D — Castanho`, en: `Line D — Brown` }, priceCents: 20700, currency: "EUR", attributes: { color: { label: { pt: `Castanho`, en: `Brown` }, hex: ["#6b4a2a"] } }, image: `/products/line-d/180124.webp`, images: [`/products/line-d/180124.webp`] }
    ],
  },
  {
    slug: `2-cigar-case-koi-fish`,
    name: { pt: `Estojo Duplo de Charuto · Koi`, en: `2 cigar case · Koi fish` },
    description: { pt: `Acessório S.T. Dupont — metal e laca tratados à mão, na tradição da casa francesa fundada em 1872.`, en: `S.T. Dupont accessory — hand-finished metal and lacquer in the tradition of the French house founded in 1872.` },
    collection: `Estojo Duplo de Charuto`,
    categorySlug: "acessorios",
    image: `/products/2-cigar-case-koi-fish/183497.webp`,
    variants: [
      { sku: `183497`, name: { pt: `2 cigar case · Koi fish — Azul & Koi & Fish`, en: `2 cigar case · Koi fish — Blue Koi Fish` }, priceCents: 27140, currency: "EUR", attributes: { color: { label: { pt: `Azul & Koi & Fish`, en: `Blue Koi Fish` }, hex: ["#1f3c66"] } }, image: `/products/2-cigar-case-koi-fish/183497.webp`, images: [`/products/2-cigar-case-koi-fish/183497.webp`, `/products/2-cigar-case-koi-fish/183497-2.webp`, `/products/2-cigar-case-koi-fish/183497-3.webp`] }
    ],
  },
  {
    slug: `accessories`,
    name: { pt: `Acessórios`, en: `Accessories` },
    description: { pt: `Acessório S.T. Dupont — metal e laca tratados à mão, na tradição da casa francesa fundada em 1872.`, en: `S.T. Dupont accessory — hand-finished metal and lacquer in the tradition of the French house founded in 1872.` },
    collection: `Acessórios`,
    categorySlug: "acessorios",
    image: `/products/accessories/183011.webp`,
    variants: [
      { sku: `183011`, name: { pt: `Accessories — Castanho`, en: `Accessories — Brown` }, priceCents: 22540, currency: "EUR", attributes: { color: { label: { pt: `Castanho`, en: `Brown` }, hex: ["#6b4a2a"] } }, image: `/products/accessories/183011.webp`, images: [`/products/accessories/183011.webp`] }
    ],
  },
  {
    slug: `3-cigar-case-fluo`,
    name: { pt: `3 cigar case_Fluo`, en: `3 cigar case_Fluo` },
    description: { pt: `Acessório S.T. Dupont — metal e laca tratados à mão, na tradição da casa francesa fundada em 1872.`, en: `S.T. Dupont accessory — hand-finished metal and lacquer in the tradition of the French house founded in 1872.` },
    collection: `3 cigar case_Fluo`,
    categorySlug: "acessorios",
    image: `/products/3-cigar-case-fluo/183416.webp`,
    variants: [
      { sku: `183416`, name: { pt: `3 cigar case_Fluo — Néon & Azul`, en: `3 cigar case_Fluo — Neon Blue` }, priceCents: 32660, currency: "EUR", attributes: { color: { label: { pt: `Néon & Azul`, en: `Neon Blue` }, hex: ["#aef043", "#1f3c66"] } }, image: `/products/3-cigar-case-fluo/183416.webp`, images: [`/products/3-cigar-case-fluo/183416.webp`, `/products/3-cigar-case-fluo/183416-2.webp`] }
    ],
  },

];
