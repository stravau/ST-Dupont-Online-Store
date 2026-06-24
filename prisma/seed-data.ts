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
    // Card defaults to the LAST shot per colourway (the lifestyle/close-up
    // angle) — reversed image arrays make `images[0]` the previously-final
    // photo, which reads as a richer hero on the catalogue grid.
    image: "/products/ligne-1/C14120-3.webp",
    variants: [
      cwg("C14120", "Laca Preta & Ouro", "Black Lacquer & Yellow Gold", ["#15171c", "#c8a24a"], 109000, [
        "/products/ligne-1/C14120-3.webp",
        "/products/ligne-1/C14120-2.webp",
        "/products/ligne-1/C14120.webp",
      ]),
      cwg("C14121", "Laca Preta & Paládio", "Black Lacquer & Palladium", ["#15171c", "#b9bcc2"], 99000, [
        "/products/ligne-1/C14121-4.webp",
        "/products/ligne-1/C14121-3.webp",
        "/products/ligne-1/C14121-2.webp",
        "/products/ligne-1/C14121.webp",
      ]),
      cwg("C14020", "Ouro Amarelo", "Yellow Gold", ["#c8a24a"], 119000, [
        "/products/ligne-1/C14020-4.webp",
        "/products/ligne-1/C14020-3.webp",
        "/products/ligne-1/C14020-2.webp",
        "/products/ligne-1/C14020.webp",
      ]),
      cwg("C14021", "Paládio", "Palladium", ["#b9bcc2"], 99000, [
        "/products/ligne-1/C14021-4.webp",
        "/products/ligne-1/C14021-3.webp",
        "/products/ligne-1/C14021-2.webp",
        "/products/ligne-1/C14021.webp",
      ]),
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
      cwg("C23780CL", "Laca Preta Brilhante & Paládio", "Shiny Black Lacquer & Palladium", ["#15171c", "#b9bcc2"], 169000, [
        "/products/le-grand-dupont/C23780CL.webp",
        "/products/le-grand-dupont/C23780CL-2.webp",
        "/products/le-grand-dupont/C23780CL-3.webp",
        "/products/le-grand-dupont/C23780CL-4.webp",
      ]),
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
    name: { pt: "Recarga de Gás · Cartucho Pequeno", en: "Gas Refill · Small Cartridge" },
    collection: "Refills & Stones",
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
    name: { pt: "Pedras de Sílex (Cx. 8)", en: "Flint Stones (Box of 8)" },
    collection: "Refills & Stones",
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
    collection: "Refills & Inks",
    description: { pt: "Frasco de tinta S.T. Dupont para canetas de tinta permanente.", en: "S.T. Dupont ink bottle for fountain pens." },
    categorySlug: "acessorios",
    image: null,
    variants: [fin("INK-BLK", "Tinta Preta", "Black Ink", 2500), fin("INK-BLU", "Tinta Azul", "Blue Ink", 2500)],
  },
  {
    slug: "rollerball-refill",
    name: { pt: "Recargas Rollerball", en: "Rollerball Refills" },
    collection: "Refills & Inks",
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
      // Inline (not via cwg) so the variant.name carries the full "Le Grand
      // Dupont · Monogram 1872 — <colour>" surface (what the catalogue card
      // displays) while the colour-swatch label stays short ("Preto" /
      // "Silver" / "Yellow Gold") for the hover/aria.
      { sku: "LGDM-BLK", name: { pt: "Le Grand Dupont · Monogram 1872 — Preto", en: "Le Grand Dupont · Monogram 1872 — Black" }, priceCents: 198000, currency: "EUR", attributes: { color: { label: { pt: "Preto", en: "Black" }, hex: ["#15171c"] } }, images: [
        "/products/le-grand-dupont-monogram/LGDM-BLK/front.jpg",
        "/products/le-grand-dupont-monogram/LGDM-BLK/back.jpg",
        "/products/le-grand-dupont-monogram/LGDM-BLK/closeup.jpg",
        "/products/le-grand-dupont-monogram/LGDM-BLK/open.jpg",
      ] },
      { sku: "LGDM-SLV", name: { pt: "Le Grand Dupont · Monogram 1872 — Prata", en: "Le Grand Dupont · Monogram 1872 — Silver" }, priceCents: 188000, currency: "EUR", attributes: { color: { label: { pt: "Prata", en: "Silver" }, hex: ["#b9bcc2"] } }, images: [
        "/products/le-grand-dupont-monogram/LGDM-SLV/front.jpg",
        "/products/le-grand-dupont-monogram/LGDM-SLV/back.jpg",
        "/products/le-grand-dupont-monogram/LGDM-SLV/closeup.jpg",
        "/products/le-grand-dupont-monogram/LGDM-SLV/open.jpg",
      ] },
      { sku: "LGDM-GLD", name: { pt: "Le Grand Dupont · Monogram 1872 — Ouro Amarelo", en: "Le Grand Dupont · Monogram 1872 — Yellow Gold" }, priceCents: 208000, currency: "EUR", attributes: { color: { label: { pt: "Ouro Amarelo", en: "Yellow Gold" }, hex: ["#c8a24a"] } }, images: [
        "/products/le-grand-dupont-monogram/LGDM-GLD/front.jpg",
        "/products/le-grand-dupont-monogram/LGDM-GLD/back.jpg",
        "/products/le-grand-dupont-monogram/LGDM-GLD/closeup.jpg",
        "/products/le-grand-dupont-monogram/LGDM-GLD/open.jpg",
      ] },
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
    description: { pt: `A S.T. Dupont celebra a ancestral arte japonesa do Maki-e. Decorada à mão pelos nossos artífices parceiros da Wajimaya Zenni no Japão, cada peça é ornamentada com pó de ouro e paládio representando símbolos tradicionais japoneses, e assinada «Zenni». A colecção Ryusui Shunju celebra a harmonia do ciclo da natureza. Isqueiro Ligne 2 Cling com padrão Maki-e, decoração Ryusui Shunju em pó de ouro, madrepérola e laca preta, com acabamentos dourados. Equipado com dupla chama amarela e o famoso «Cling» na abertura. Pedra de isqueiro associada: preta (REF 900601). Recarga de gás associada: vermelha (REF 900435). Isqueiro entregue sem gás, recarga vendida em separado.`, en: `S.T. Dupont celebrates the ancestral Japanese art of Maki-e. Decorated by hand by our partner artisans of Wajimaya Zenni in Japan, each piece is adorned with gold powder, palladium representing traditional Japanese symbols and signed "Zenni". The Ryusui Shunju collection celebrates the harmony of the cycle of nature. Lighter Line 2 Cling Maki-e pattern Ryusui Shunju decor in gold powder, mother of pearl and black lacquer and golden finishes. Equipped with a double yellow flame and the famous "Cling" at the opening. Associated lighter flint: black (REF 900601) Associated gas refill: red (REF 900435) Lighter delivered empty of gas, refill sold separately.` },
    collection: `Ligne 2`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-maki-e/016359.webp`,
    variants: [
      { sku: `016359`, name: { pt: `Ligne 2 · Maki-e — Prata`, en: `Ligne 2 · Maki E — Silver` }, priceCents: 731400, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/ligne-2-maki-e/016359.webp`, images: [`/products/ligne-2-maki-e/016359.webp`, `/products/ligne-2-maki-e/016359-2.webp`] },
      { sku: `C16150`, name: { pt: `Ligne 2 · Maki-e — Castanho`, en: `Ligne 2 · Maki E — Brown` }, priceCents: 777400, currency: "EUR", attributes: { color: { label: { pt: `Castanho`, en: `Brown` }, hex: ["#6b4a2a"] } }, image: `/products/ligne-2-maki-e/C16150.webp`, images: [`/products/ligne-2-maki-e/C16150.webp`, `/products/ligne-2-maki-e/C16150-2.webp`, `/products/ligne-2-maki-e/C16150-3.webp`, `/products/ligne-2-maki-e/C16150-4.webp`] },
      { sku: `C16151`, name: { pt: `Ligne 2 · Maki-e — Castanho`, en: `Ligne 2 · Maki E — Brown` }, priceCents: 639400, currency: "EUR", attributes: { color: { label: { pt: `Castanho`, en: `Brown` }, hex: ["#6b4a2a"] } }, image: `/products/ligne-2-maki-e/C16151.webp`, images: [`/products/ligne-2-maki-e/C16151.webp`, `/products/ligne-2-maki-e/C16151-2.webp`, `/products/ligne-2-maki-e/C16151-3.webp`, `/products/ligne-2-maki-e/C16151-4.webp`] }
    ],
  },
  {
    slug: `slim-7-geode`,
    name: { pt: `Slim 7 · Géode`, en: `Slim 7 · Geode` },
    description: { pt: `Misteriosos e cativantes, os geodos inspiram uma colecção S.T. Dupont que se expressa em dois tons minerais: um azul profundo que evoca a ágata, símbolo de equilíbrio, e um verde vibrante que lembra a malaquite, representando protecção e energia. Tal como estas pedras preciosas, cada criação Géode reflecte o savoir-faire artesanal e a excelência de precisão da S.T. Dupont. O isqueiro Slim 7 é ornamentado com um motivo inspirado na estrutura cristalina da malaquite. Acabamento dourado. Apresenta uma chama maçarico azul. Recarga de gás associada: preta (REF 900430). Isqueiro entregue sem gás; recarga vendida em separado.`, en: `Mysterious and captivating, geodes inspire an S.T. Dupont collection expressed through two mineral tones: a deep blue evoking agate, a symbol of balance, and a vibrant green reminiscent of malachite, representing protection and energy. Like these precious stones, each Géode creation reflects the artisanal craftsmanship and precision excellence of S.T. Dupont. The Slim 7 lighter is adorned with a motif inspired by the crystalline structure of malachite. Gold finish. It features a blue torch flame. Associated gas refill: black (REF 900430) Lighter delivered empty of gas; refill sold separately.` },
    collection: `Slim 7`,
    categorySlug: "isqueiros",
    image: `/products/slim-7-geode/027036.webp`,
    variants: [
      { sku: `027036`, name: { pt: `Slim 7 · Géode — Azul`, en: `Slim 7 · Geode — Blue` }, priceCents: 27140, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/slim-7-geode/027036.webp`, images: [`/products/slim-7-geode/027036.webp`, `/products/slim-7-geode/027036-2.webp`, `/products/slim-7-geode/027036-3.webp`, `/products/slim-7-geode/027036-4.webp`] },
      { sku: `027035`, name: { pt: `Slim 7 · Géode — Azul`, en: `Slim 7 · Geode — Blue` }, priceCents: 27140, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/slim-7-geode/027035.webp`, images: [`/products/slim-7-geode/027035.webp`, `/products/slim-7-geode/027035-2.webp`, `/products/slim-7-geode/027035-3.webp`, `/products/slim-7-geode/027035-4.webp`] }
    ],
  },
  {
    slug: `twiggy-geode`,
    name: { pt: `Twiggy · Géode`, en: `Twiggy · Geode` },
    description: { pt: `Misteriosos e cativantes, os geodos inspiram uma colecção S.T. Dupont que se expressa em dois tons minerais: um azul profundo que evoca a ágata, símbolo de equilíbrio, e um verde vibrante que lembra a malaquite, representando protecção e energia. Tal como estas pedras preciosas, cada criação Géode reflecte o savoir-faire artesanal e a excelência de precisão da S.T. Dupont. O isqueiro Twiggy é ornamentado com um motivo inspirado na estética da malaquite. Acabamento dourado. Apresenta uma chama maçarico azul. Recarga de gás associada: preta (REF 900430). Isqueiro entregue sem gás; recarga vendida em separado.`, en: `Mysterious and captivating, geodes inspire an S.T. Dupont collection expressed through two mineral tones: a deep blue evoking agate, a symbol of balance, and a vibrant green reminiscent of malachite, representing protection and energy. Like these precious stones, each Géode creation reflects the artisanal craftsmanship and precision excellence of S.T. Dupont. The Twiggy lighter is adorned with a motif inspired by the aesthetic of malachite. Gold finish. It features a blue torch flame. Associated gas refill: black (REF 900430) Lighter delivered empty of gas; refill sold separately.` },
    collection: `Twiggy`,
    categorySlug: "isqueiros",
    image: `/products/twiggy-geode/030036.webp`,
    variants: [
      { sku: `030036`, name: { pt: `Twiggy · Géode — Verde`, en: `Twiggy · Geode — Green` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Verde`, en: `Green` }, hex: ["#3a5040"] } }, image: `/products/twiggy-geode/030036.webp`, images: [`/products/twiggy-geode/030036.webp`, `/products/twiggy-geode/030036-2.webp`, `/products/twiggy-geode/030036-3.webp`, `/products/twiggy-geode/030036-4.webp`] },
      { sku: `030035`, name: { pt: `Twiggy · Géode — Azul`, en: `Twiggy · Geode — Blue` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/twiggy-geode/030035.webp`, images: [`/products/twiggy-geode/030035.webp`, `/products/twiggy-geode/030035-2.webp`, `/products/twiggy-geode/030035-3.webp`, `/products/twiggy-geode/030035-4.webp`] }
    ],
  },
  {
    slug: `slimmy-geode`,
    name: { pt: `Slimmy · Géode`, en: `Slimmy · Geode` },
    description: { pt: `Misteriosos e cativantes, os geodos inspiram uma colecção S.T. Dupont que se expressa em dois tons minerais: um azul profundo que evoca a ágata, símbolo de equilíbrio, e um verde vibrante que lembra a malaquite, representando protecção e energia. Tal como estas pedras preciosas, cada criação Géode reflecte o savoir-faire artesanal e a excelência de precisão da S.T. Dupont. O isqueiro Slimmy é ornamentado com um motivo inspirado na estética da malaquite. Acabamento dourado. Apresenta uma chama maçarico azul. Recarga de gás associada: preta (REF 900430). Isqueiro entregue sem gás; recarga vendida em separado.`, en: `Mysterious and captivating, geodes inspire an S.T. Dupont collection expressed through two mineral tones: a deep blue evoking agate, a symbol of balance, and a vibrant green reminiscent of malachite, representing protection and energy. Like these precious stones, each Géode creation reflects the artisanal craftsmanship and precision excellence of S.T. Dupont. The Slimmy lighter is adorned with a motif inspired by the aesthetic of malachite. Gold finish. It features a blue torch flame. Associated gas refill: black (REF 900430) Lighter delivered empty of gas; refill sold separately.` },
    collection: `Slimmy`,
    categorySlug: "isqueiros",
    image: `/products/slimmy-geode/028036.webp`,
    variants: [
      { sku: `028036`, name: { pt: `Slimmy · Géode — Verde`, en: `Slimmy · Geode — Green` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Verde`, en: `Green` }, hex: ["#3a5040"] } }, image: `/products/slimmy-geode/028036.webp`, images: [`/products/slimmy-geode/028036.webp`, `/products/slimmy-geode/028036-2.webp`, `/products/slimmy-geode/028036-3.webp`, `/products/slimmy-geode/028036-4.webp`] },
      { sku: `028035`, name: { pt: `Slimmy · Géode — Azul`, en: `Slimmy · Geode — Blue` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/slimmy-geode/028035.webp`, images: [`/products/slimmy-geode/028035.webp`, `/products/slimmy-geode/028035-2.webp`, `/products/slimmy-geode/028035-3.webp`, `/products/slimmy-geode/028035-4.webp`] }
    ],
  },
  {
    slug: `minijet-geode`,
    name: { pt: `Minijet · Géode`, en: `Minijet · Geode` },
    description: { pt: `Misteriosos e cativantes, os geodos inspiram uma colecção S.T. Dupont que se expressa em dois tons minerais: um azul profundo que evoca a ágata, símbolo de equilíbrio, e um verde vibrante que lembra a malaquite, representando protecção e energia. Tal como estas pedras preciosas, cada criação Géode reflecte o savoir-faire artesanal e a excelência de precisão da S.T. Dupont. O isqueiro Minijet é ornamentado com um motivo inspirado na estrutura cristalina da malaquite. Acabamento dourado. Apresenta uma chama maçarico azul. Recarga de gás associada: preta (REF 900430). Isqueiro entregue sem gás; recarga vendida em separado.`, en: `Mysterious and captivating, geodes inspire an S.T. Dupont collection expressed through two mineral tones: a deep blue evoking agate, a symbol of balance, and a vibrant green reminiscent of malachite, representing protection and energy. Like these precious stones, each Géode creation reflects the artisanal craftsmanship and precision excellence of S.T. Dupont. The Minijet lighter is adorned with a motif inspired by the crystalline structure of malachite. Gold finish. It features a blue torch flame. Associated gas refill: black (REF 900430) Lighter delivered empty of gas; refill sold separately.` },
    collection: `Minijet`,
    categorySlug: "isqueiros",
    image: `/products/minijet-geode/010836.webp`,
    variants: [
      { sku: `010836`, name: { pt: `Minijet · Géode — Verde`, en: `Minijet · Geode — Green` }, priceCents: 19320, currency: "EUR", attributes: { color: { label: { pt: `Verde`, en: `Green` }, hex: ["#3a5040"] } }, image: `/products/minijet-geode/010836.webp`, images: [`/products/minijet-geode/010836.webp`, `/products/minijet-geode/010836-2.webp`, `/products/minijet-geode/010836-3.webp`, `/products/minijet-geode/010836-4.webp`] },
      { sku: `010835`, name: { pt: `Minijet · Géode — Azul`, en: `Minijet · Geode — Blue` }, priceCents: 19320, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/minijet-geode/010835.webp`, images: [`/products/minijet-geode/010835.webp`, `/products/minijet-geode/010835-2.webp`, `/products/minijet-geode/010835-3.webp`, `/products/minijet-geode/010835-4.webp`] }
    ],
  },
  {
    slug: `initial-2`,
    name: { pt: `Initial`, en: `Initial` },
    description: { pt: `Isqueiro Initial, decoração em guilloché cinético, acabamentos dourados. Com dupla chama amarela. Pedra de isqueiro associada: vermelha (REF 900650) Recarga de gás associada: azul (REF 900434) Isqueiro entregue sem gás, recarga vendida em separado.`, en: `Initial lighter, cinatic guilloche decor, golden finishes. With a double yellow flame. Associated lighter stone: red (REF 900650) Associated gas recharge: blue (REF 900434) Lighter delivered empty of gas, refill sold separately.` },
    collection: `Initial`,
    categorySlug: "isqueiros",
    image: `/products/initial-2/020845.webp`,
    variants: [
      { sku: `020845`, name: { pt: `Initial — Dourado`, en: `Initial — Golden` }, priceCents: 54740, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/initial-2/020845.webp`, images: [`/products/initial-2/020845.webp`, `/products/initial-2/020845-2.webp`, `/products/initial-2/020845-3.webp`, `/products/initial-2/020845-4.webp`] }
    ],
  },
  {
    slug: `popote`,
    name: { pt: `Ligne 2 · Popoté`, en: `Ligne 2 · Popoté` },
    description: { pt: `Uma técnica emblemática da Maison S.T. Dupont, a técnica dita Popoté joga com a matéria e a luz. Recorrendo a um estampilhão especial, o artífice aplica toques irregulares sobre a laca, criando um efeito pictórico em que a superfície parece vibrar sob a luz. Cada gesto, simultaneamente preciso e aleatório, revela uma profundidade única. Isqueiro Ligne 2 Popoté em laca Urushi preta com decoração Popoté aplicada à mão. Equipado com tampa em guilloché ponta de diamante. Acabamento em paládio. Equipado com dupla chama amarela e o icónico som «Cling» na abertura. Pedra associada: preta (REF 900601). Recarga de gás associada: vermelha (REF 900435). Isqueiro entregue sem gás, recarga vendida em separado.`, en: `An emblematic technique of the S.T. Dupont house, the so-called Popoté technique plays with material and light. Using a special stamp, the craftsman applies irregular touches to the lacquer, creating a painterly effect where the surface seems to vibrate under the light. Each gesture, both precise and random, reveals a unique depth. Ligne 2 Popoté lighter in black Urushi lacquer with hand-applied Popoté décor. Fitted with a diamond-point guilloche cap. Palladium finish. Equipped with a double yellow flame and the iconic "Cling" sound upon opening. Associated flint: black (REF 900601) Associated gas refill: red (REF 900435) Lighter supplied empty of gas, refill sold separately.` },
    collection: `Ligne 2`,
    categorySlug: "isqueiros",
    image: `/products/popote/C16018CL.webp`,
    variants: [
      { sku: `C16018CL`, name: { pt: `Ligne 2 · Popoté — Azul`, en: `Ligne 2 · Popoté — Blue` }, priceCents: 174340, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/popote/C16018CL.webp`, images: [`/products/popote/C16018CL.webp`, `/products/popote/C16018CL-2.webp`, `/products/popote/C16018CL-3.webp`, `/products/popote/C16018CL-4.webp`] },
      { sku: `C16017CL`, name: { pt: `Ligne 2 · Popoté — Vermelho`, en: `Ligne 2 · Popoté — Red` }, priceCents: 174340, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/popote/C16017CL.webp`, images: [`/products/popote/C16017CL.webp`, `/products/popote/C16017CL-2.webp`, `/products/popote/C16017CL-3.webp`, `/products/popote/C16017CL-4.webp`] },
      { sku: `C16016CL`, name: { pt: `Ligne 2 · Popoté — Preto`, en: `Ligne 2 · Popoté — Black` }, priceCents: 174340, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/popote/C16016CL.webp`, images: [`/products/popote/C16016CL.webp`, `/products/popote/C16016CL-2.webp`, `/products/popote/C16016CL-3.webp`, `/products/popote/C16016CL-4.webp`] }
    ],
  },
  {
    slug: `le-grand-dupont-popote`,
    name: { pt: `Le Grand Dupont · Popote`, en: `Le Grand Dupont · Popote` },
    description: { pt: `Uma técnica emblemática da Maison S.T. Dupont, a técnica dita Popoté joga com a matéria e a luz. Recorrendo a um estampilhão especial, o artífice aplica toques irregulares sobre a laca, criando um efeito pictórico em que a superfície parece vibrar sob a luz. Cada gesto, simultaneamente preciso e aleatório, revela uma profundidade única. Isqueiro Le Grand Dupont Cling Popoté em laca Urushi preta com decoração Popoté aplicada à mão. Equipado com tampa em guilloché ponta de diamante. Acabamento em paládio. Equipado com sistema de dupla ignição para chama amarela ou azul, e o icónico som «Cling» na abertura. Pedra associada: vermelha (REF 900651). Recarga de gás associada: vermelha (REF 900435). Isqueiro entregue sem gás, recarga vendida em separado. Chave de fendas incluída para trocar a pedra.`, en: `An emblematic technique of the S.T. Dupont house, the so-called Popoté technique plays with material and light. Using a special stamp, the craftsman applies irregular touches to the lacquer, creating a painterly effect where the surface seems to vibrate under the light. Each gesture, both precise and random, reveals a unique depth. Le Grand Dupont Cling Popoté lighter in black Urushi lacquer with hand-applied Popoté décor. Fitted with a diamond-point guilloche cap. Palladium finish. Equipped with a dual ignition system for yellow flame or blue flame, and the iconic "Cling" sound upon opening. Associated flint: red (REF 900651) Associated gas refill: red (REF 900435) Lighter supplied empty of gas, refill sold separately. Screwdriver included for changing the flint.` },
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
    description: { pt: `Misteriosos e cativantes, os geodos inspiram uma colecção S.T. Dupont que se expressa em dois tons minerais: um azul profundo que evoca a ágata, símbolo de equilíbrio, e um verde vibrante que lembra a malaquite, representando protecção e energia. Tal como estas pedras preciosas, cada criação Géode reflecte o savoir-faire artesanal e a excelência de precisão da S.T. Dupont. O isqueiro Ligne 2 Cling Géode é ornamentado com um motivo inspirado no núcleo cintilante da ágata. Acabamento em paládio. Apresenta uma dupla chama amarela suave e o icónico «Cling» na abertura. Pedras associadas: pretas (REF 900601). Recarga de gás associada: vermelha (REF 900435). Isqueiro entregue sem gás; recarga vendida em separado.`, en: `Mysterious and captivating, geodes inspire an S.T. Dupont collection expressed through two mineral tones: a deep blue evoking agate, a symbol of balance, and a vibrant green reminiscent of malachite, representing protection and energy. Like these precious stones, each Géode creation reflects the artisanal craftsmanship and precision excellence of S.T. Dupont. The Ligne 2 Cling Géode lighter is adorned with a motif inspired by the shimmering core of agate. Palladium finish. It features a dual soft yellow flame and the signature “Cling” upon opening. Associated lighter flints: black (REF 900601) Associated gas refill: red (REF 900435) Lighter delivered empty of gas; refill sold separately.` },
    collection: `Ligne 2`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-geode/C16036CL.webp`,
    variants: [
      { sku: `C16036CL`, name: { pt: `Ligne 2 · Géode — Verde`, en: `Ligne 2 · Geode — Green` }, priceCents: 155940, currency: "EUR", attributes: { color: { label: { pt: `Verde`, en: `Green` }, hex: ["#3a5040"] } }, image: `/products/ligne-2-geode/C16036CL.webp`, images: [`/products/ligne-2-geode/C16036CL.webp`, `/products/ligne-2-geode/C16036CL-2.webp`, `/products/ligne-2-geode/C16036CL-3.webp`, `/products/ligne-2-geode/C16036CL-4.webp`] },
      { sku: `C16035CL`, name: { pt: `Ligne 2 · Géode — Azul`, en: `Ligne 2 · Geode — Blue` }, priceCents: 155940, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/ligne-2-geode/C16035CL.webp`, images: [`/products/ligne-2-geode/C16035CL.webp`, `/products/ligne-2-geode/C16035CL-2.webp`, `/products/ligne-2-geode/C16035CL-3.webp`, `/products/ligne-2-geode/C16035CL-4.webp`] }
    ],
  },
  {
    slug: `ligne-2-horse-mane`,
    name: { pt: `Ligne 2 · Horse Mane`, en: `Ligne 2 · Horse mane` },
    description: { pt: `Inspirada no Ano Lunar do Cavalo de 2026, a colecção Horsemane apresenta um guilloché «criniera» único sob laca vermelha ou preta. Isqueiro Ligne 2 Cling decorado com guilloché sob laca vermelha de alto brilho com motivo «horse mane». Acabamento banhado a ouro. Equipado com dupla chama amarela e a icónica abertura «Cling». Isqueiro entregue sem gás; recarga vendida em separado.`, en: `Inspired by the 2026 Lunar Year of the Horse, the Horsemane Collection introduces a unique “mane” guilloché under red or black lacquer. Ligne 2 Cling lighter decorated with guilloché under high-gloss red lacquer with “horse mane” motif. Gold-plated finish. Equipped with a double yellow flame and the signature “Cling” opening. Lighter delivered empty of gas; refill sold separately.` },
    collection: `Ligne 2`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-horse-mane/C16089CL.webp`,
    variants: [
      { sku: `C16089CL`, name: { pt: `Ligne 2 · Horse Mane — Vermelho`, en: `Ligne 2 · Horse mane — Red` }, priceCents: 165140, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/ligne-2-horse-mane/C16089CL.webp`, images: [`/products/ligne-2-horse-mane/C16089CL.webp`, `/products/ligne-2-horse-mane/C16089CL-2.webp`, `/products/ligne-2-horse-mane/C16089CL-3.webp`, `/products/ligne-2-horse-mane/C16089CL-4.webp`] },
      { sku: `C16090CL`, name: { pt: `Ligne 2 · Horse Mane — Preto`, en: `Ligne 2 · Horse mane — Black` }, priceCents: 165140, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/ligne-2-horse-mane/C16090CL.webp`, images: [`/products/ligne-2-horse-mane/C16090CL.webp`, `/products/ligne-2-horse-mane/C16090CL-2.webp`, `/products/ligne-2-horse-mane/C16090CL-3.webp`, `/products/ligne-2-horse-mane/C16090CL-4.webp`] }
    ],
  },
  {
    slug: `le-grand-dupont-2`,
    name: { pt: `Le Grand Dupont`, en: `Le Grand Dupont` },
    description: { pt: `O icónico Le Grand Dupont é reinventado! Com uma nova edição mais audaz, o Le New Grand Dupont, com o seu design depurado, oferece-lhe uma experiência sensorial única. O «Cling» anuncia um momento precioso e memorável. O sistema de dupla ignição permite escolher entre uma chama suave ou uma chama turbo para acender o seu charuto. Pela primeira vez, é incluída uma chave de fendas que permite trocar os parafusos do isqueiro por si próprio. Pedra de isqueiro associada: vermelha (REF 900650). Recarga de gás associada: vermelha (REF 900435). Isqueiro entregue sem gás, recarga vendida em separado.`, en: `The iconic Le Grand Dupont is reinvented! With a new, bolder edition, the Le New Grand Dupont, with its sleek design, offers you a unique sensory experience. The "Cling" announces a precious and memorable moment. The double ignition system allows you to choose between a soft flame or a turbo flame to light your cigar. For the first time, a screwdriver is included and allows you to change the screws of the lighter yourself. Associated lighter: red (REF 900650) Associated gas refill: red (REF 900435) Lighter delivered empty of gas, refill sold separately.` },
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
    // The headline DC Comics tile — a Lighter Necklace (the K27 series is
    // pendant / mini-jet hardware, not a full lighter).
    slug: `dc-comics`,
    name: { pt: `Colar Isqueiro · DC Comics`, en: `Lighter Necklace · DC Comics` },
    description: { pt: `A S.T. Dupont revela o terceiro capítulo da sua colaboração com a DC COMICS através de uma colecção exclusiva inspirada em três figuras icónicas: Wonder Woman, Catwoman e The Penguin. A colecção transmite uma mensagem universal de justiça, liberdade e poder, elevada pelo savoir-faire da Maison em criações de excepção, tais como o isqueiro Ligne 2, a caneta Line D Eternity e, para personagens seleccionadas, um colar-isqueiro. Colar-isqueiro Wonder Woman ornamentado com uma decoração lacada com o W e a estrela, emblemas da heroína da DC COMICS. Tampa em guilloché ponta de diamante com acabamento dourado. Apresenta uma chama amarela. Corrente amovível ajustável em três comprimentos diferentes: 80/85/90 cm. Recarga de gás associada: preta 000430. Isqueiro entregue sem gás, recarga vendida em separado.`, en: `S.T. Dupont unveils the third chapter of its collaboration with DC COMICS through an exclusive collection inspired by three iconic figures: Wonder Woman, Catwoman and The Penguin. The collection conveys a universal message of justice, freedom and power, elevated by the Maison’s savoir-faire in exceptional creations such as the Ligne 2 lighter, the Line D Eternity pen and, for selected characters, a Lighter Necklace. Wonder Woman Lighter Necklace adorned with a lacquered decoration featuring the W and the star, emblems of the DC COMICS heroine. Diamond-point guilloché cap with a gold finish. Features a yellow flame. Removable chain adjustable to three different lengths: 80/85/90 cm. Associated gas refill: black 000430 Lighter delivered empty of gas, refill sold separately.` },
    collection: ``,
    categorySlug: "isqueiros",
    image: `/products/dc-comics/K27221CH.webp`,
    variants: [
      { sku: `K27221CH`, name: { pt: `Lighter Necklace · DC Comics — Vermelho`, en: `Lighter Necklace · DC Comics — Red` }, priceCents: 45540, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/dc-comics/K27221CH.webp`, images: [`/products/dc-comics/K27221CH.webp`, `/products/dc-comics/K27221CH-2.webp`, `/products/dc-comics/K27221CH-3.webp`, `/products/dc-comics/K27221CH-4.webp`] }
    ],
  },
  {
    // The C16 SKUs (Ligne 2 family) under the DC Comics theme are the
    // Catwoman colourway — split out so the catalogue tile reads as a
    // Ligne 2 lighter rather than a pendant.
    slug: `ligne-2-catwoman`,
    name: { pt: `Ligne 2 · Catwoman`, en: `Ligne 2 · Catwoman` },
    description: { pt: `A S.T. Dupont revela o terceiro capítulo da sua colaboração com a DC COMICS através de uma colecção exclusiva inspirada em três figuras icónicas: Wonder Woman, Catwoman e The Penguin. A colecção transmite uma mensagem universal de justiça, liberdade e poder, elevada pelo savoir-faire da Maison em criações de excepção, tais como o isqueiro Ligne 2, a caneta Line D Eternity e, para personagens seleccionadas, um colar-isqueiro. Isqueiro Ligne 2 Cling Catwoman ornamentado com uma decoração em laca preta com a personagem da DC COMICS. Tampa em guilloché ponta de diamante com acabamento preto brilhante. Equipado com dupla chama amarela e o icónico «Cling» na abertura. Pedra de isqueiro associada: preta (REF 900601). Recarga de gás associada: vermelha (REF 900435). Isqueiro entregue sem gás, recarga vendida em separado.`, en: `S.T. Dupont unveils the third chapter of its collaboration with DC COMICS through an exclusive collection inspired by three iconic figures: Wonder Woman, Catwoman and The Penguin. The collection conveys a universal message of justice, freedom and power, elevated by the Maison’s savoir-faire in exceptional creations such as the Ligne 2 lighter, the Line D Eternity pen and, for selected characters, a Lighter Necklace. Ligne 2 Cling Catwoman lighter adorned with a black lacquer decoration featuring the DC COMICS character. Diamond-point guilloché cap with a glossy black finish. Equipped with a dual yellow flame and the signature “Cling” upon opening. Associated lighter flint: black (REF 900601) Associated gas refill: red (REF 900435) Lighter delivered empty of gas, refill sold separately.` },
    collection: `DC Comics`,
    categorySlug: "isqueiros",
    image: `/products/dc-comics/C16180CL.webp`,
    variants: [
      { sku: `C16180CL`, name: { pt: `Ligne 2 · Catwoman — Preto`, en: `Ligne 2 · Catwoman — Black` }, priceCents: 183540, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/dc-comics/C16180CL.webp`, images: [`/products/dc-comics/C16180CL.webp`, `/products/dc-comics/C16180CL-2.webp`, `/products/dc-comics/C16180CL-3.webp`, `/products/dc-comics/C16180CL-4.webp`] },
      { sku: `C16220CL`, name: { pt: `Ligne 2 · Catwoman — Preto`, en: `Ligne 2 · Catwoman — Black` }, priceCents: 183540, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/dc-comics/C16220CL.webp`, images: [`/products/dc-comics/C16220CL.webp`, `/products/dc-comics/C16220CL-2.webp`, `/products/dc-comics/C16220CL-3.webp`, `/products/dc-comics/C16220CL-4.webp`] }
    ],
  },
  {
    slug: `ligne-2-dc-comics`,
    name: { pt: `Ligne 2 · DC Comics`, en: `Ligne 2 · DC Comics` },
    description: { pt: `A S.T. Dupont revela o terceiro capítulo da sua colaboração com a DC COMICS através de uma colecção exclusiva inspirada em três figuras icónicas: Wonder Woman, Catwoman e The Penguin. A colecção transmite uma mensagem universal de justiça, liberdade e poder, elevada pelo savoir-faire da Maison em criações de excepção, tais como o isqueiro Ligne 2, a caneta Line D Eternity e, para personagens seleccionadas, um colar-isqueiro. Isqueiro Ligne 2 Cling Wonder Woman ornamentado com uma decoração lacada com o W e a estrela, emblemas da heroína da DC COMICS. Tampa em guilloché ponta de diamante com acabamento dourado. Equipado com dupla chama amarela e o icónico «Cling» na abertura. Pedra de isqueiro associada: preta (REF 900601). Recarga de gás associada: vermelha (REF 900435). Isqueiro entregue sem gás, recarga vendida em separado.`, en: `S.T. Dupont unveils the third chapter of its collaboration with DC COMICS through an exclusive collection inspired by three iconic figures: Wonder Woman, Catwoman and The Penguin. The collection conveys a universal message of justice, freedom and power, elevated by the Maison’s savoir-faire in exceptional creations such as the Ligne 2 lighter, the Line D Eternity pen and, for selected characters, a Lighter Necklace. Ligne 2 Cling Wonder Woman lighter adorned with a lacquered decoration featuring the W and the star, emblems of the DC COMICS heroine. Diamond-point guilloché cap with a gold finish. Equipped with a dual yellow flame and the signature “Cling” upon opening. Associated lighter flint: black (REF 900601) Associated gas refill: red (REF 900435) Lighter delivered empty of gas, refill sold separately.` },
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
    description: { pt: `O Torch, uma nova criação da S.T. Dupont, é um isqueiro versátil de design inovador, conjugando desempenho e facilidade de utilização. Concebido para o acompanhar nos seus momentos, dentro e fora de casa, conta com uma potente chama maçarico ajustável para uma ignição precisa. O seu bocal rotativo permite direccionar a chama com exactidão, assegurando uma pega personalizada e uma versatilidade incomparável. Isqueiro Torch em laca preta brilhante, decorado com um guilloché ponta de diamante. Gatilho com mecanismo deslizante. Cabeça pivotante para direccionar a chama. Acabamento em crómio. Chama maçarico redonda. https://fr.st-dupont.com/products/recharge-de-gaz-rouge-defi-xtreme-900436?_pos=5&_sid=17de083ef&_ss=r Isqueiro entregue sem gás; recarga vendida em separado.`, en: `The Torch, a new creation by S.T. Dupont, is a versatile lighter with an innovative design, combining performance and ease of use. Designed to accompany your moments both indoors and outdoors, it features a powerful, adjustable torch flame for precise ignition. Its rotating nozzle allows you to direct the flame with accuracy, ensuring a personalized grip and unmatched versatility. Torch lighter in glossy black lacquer, decorated with a diamond-pattern guilloché finish. Trigger with sliding mechanism. Pivoting head lighter to direct the flame. Chrome finish. Round torch flame. https://fr.st-dupont.com/products/recharge-de-gaz-rouge-defi-xtreme-900436?_pos=5&_sid=17de083ef&_ss=r Lighter is delivered empty; gas refill sold separately.` },
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
    description: { pt: `A S.T. Dupont une-se ao artista francês Richard Orlinski numa colecção exclusiva onde a força do gesto escultórico se encontra com a precisão do savoir-faire artesanal. Inspirada no icónico motivo «Kong» e na selvajaria da natureza, esta colaboração injecta uma energia bruta e contemporânea nas criações da Maison. Isqueiros e instrumentos de escrita tornam-se verdadeiras obras de arte, valorizados por linhas angulares, texturas contrastantes e cores vibrantes. A linha «Red» evidencia um trabalho técnico de excepção, conjugando um novo acabamento em dourado escovado com um motivo «Kong» trabalhado em filigrana de metal. Um padrão guilloché de inspiração anos 70 completa o conjunto, criando uma sensação de movimento na matéria. Estas técnicas são aplicadas ao isqueiro Ligne 2 e à caneta Line D Eternity nas suas versões vermelha e dourada, entregando uma assinatura simultaneamente precisa e escultórica. Isqueiro Ligne 2 decorado com um guilloché diagonal sob laca e ornamentado com o motivo «Kong» em dourado escovado. Revestido em laca S.T. Dupont vermelha brilhante. Equipado com dupla chama amarela e o famoso som «Cling» na abertura. Pedra associada: preta (REF 900601). Recarga de gás associada: vermelha (REF 900435). Isqueiro entregue sem gás; recarga vendida em separado. Descubra a colecção Orlinski completa.`, en: `S.T. Dupont partners with French artist Richard Orlinski for an exclusive collection where the power of sculptural gestures meets the precision of artisanal craftsmanship. Inspired by the iconic “Kong” motif and the wildness of nature, this collaboration injects a raw, contemporary energy into the Maison’s creations. Lighters and writing instruments become true works of art, enhanced by angular lines, contrasting textures, and vibrant colors. The “Red” line highlights exceptional technical work, combining a new brushed gold finish with a “Kong” motif crafted in metal filigree. A guilloché pattern inspired by the 1970s completes the set, creating a sense of movement in the material. These techniques are applied to the Ligne 2 lighter and Line D Eternity pen in their red and gold versions, delivering a signature that is both precise and sculptural. Ligne 2 lighter decorated with a diagonal guilloché under lacquer and adorned with the brushed gold “Kong” motif. Coated in glossy S.T. Dupont red lacquer. Equipped with a double yellow flame and the famous “Cling” opening sound. Associated flint: black (REF 900601) Associated gas refill: red (REF 900435) Lighter delivered without gas; refill sold separately. Discover the full Orlinski collection.` },
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
    description: { pt: `A S.T. Dupont une-se ao artista francês Richard Orlinski numa colecção exclusiva onde a força do gesto escultórico se encontra com a precisão do savoir-faire artesanal. Inspirada no icónico motivo «Kong» e na selvajaria da natureza, esta colaboração traz uma energia bruta e contemporânea às criações da Maison. Isqueiros e instrumentos de escrita tornam-se verdadeiras obras de arte, valorizados por linhas angulares, texturas contrastantes e cores vibrantes. Isqueiro Slimmy em laca laranja decorado com o motivo «Kong» em acabamento crómio. Equipado com chama maçarico azul de 2 cm, ideal para acender velas ou cigarros. Recarga de gás associada: preta (REF 900430). Isqueiro entregue sem gás; recarga vendida em separado. Descubra a colecção Orlinski completa.`, en: `S.T. Dupont partners with French artist Richard Orlinski for an exclusive collection where the power of sculptural gestures meets the precision of artisanal craftsmanship. Inspired by the iconic “Kong” motif and the wildness of nature, this collaboration brings a raw, contemporary energy to the Maison’s creations. Lighters and writing instruments become true works of art, enhanced by angular lines, contrasting textures, and vibrant colors. Slimmy lighter in orange lacquer decorated with the “Kong” motif in chrome finish. Equipped with a 2 cm blue torch flame, ideal for lighting candles or cigarettes. Associated gas refill: black (REF 900430) Lighter delivered without gas; refill sold separately. Discover the full Orlinski collection.` },
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
    description: { pt: `A S.T. Dupont une-se ao artista francês Richard Orlinski numa colecção exclusiva onde a força do gesto escultórico se encontra com a precisão do savoir-faire artesanal. Inspirada no icónico motivo «Kong» e na selvajaria da natureza, esta colaboração traz uma energia bruta e contemporânea às criações da Maison. Isqueiros e instrumentos de escrita tornam-se verdadeiras obras de arte, valorizados por linhas angulares, texturas contrastantes e cores vibrantes. Isqueiro Biggy em laca azul decorado com o motivo «Kong» em acabamento crómio. Equipado com chama maçarico azul de 2 cm, perfeito para acender velas ou cigarros. Recarga de gás associada: preta (REF 900430). Isqueiro entregue sem gás; recarga vendida em separado. Descubra a colecção Orlinski completa.`, en: `S.T. Dupont partners with French artist Richard Orlinski for an exclusive collection where the power of sculptural gestures meets the precision of artisanal craftsmanship. Inspired by the iconic “Kong” motif and the wildness of nature, this collaboration brings a raw, contemporary energy to the Maison’s creations. Lighters and writing instruments become true works of art, enhanced by angular lines, contrasting textures, and vibrant colors. Biggy lighter in blue lacquer decorated with the “Kong” motif in chrome finish. Equipped with a 2 cm blue torch flame, perfect for lighting candles or cigarettes. Associated gas refill: black (REF 900430) Lighter delivered without gas; refill sold separately. Discover the full Orlinski collection."` },
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
    description: { pt: `O isqueiro S.T. Dupont por excelência. O seu famoso «cling» na abertura é uma marca distintiva reconhecida entre os conhecedores. As suas proporções harmoniosas tornam-no universal. Uma colecção de linhas depuradas, vestida com materiais nobres e equipada com dupla chama amarela. Com uma elegância clássica, este isqueiro é ornamentado com guilloché vertical e acabamento prateado. Este isqueiro é banhado a prata. A prata é um metal precioso e duradouro. As suas propriedades excepcionais conferem-lhe um brilho que valoriza as nossas criações. A prata é uma matéria viva que desenvolve uma pátina com o tempo; tal, contudo, não afecta a qualidade do produto, e os efeitos do tempo podem ser revertidos. Recomendamos a manutenção dos seus produtos S.T. Dupont com um pano macio e a visita à boutique mais próxima para receber o aconselhamento especializado dos nossos especialistas. Convidamo-lo igualmente a visitar o website da Maison para saber mais sobre os cuidados a ter com as suas peças S.T. Dupont. Pedra associada: preta (REF 900601). Recarga de gás associada: amarela (REF 900432). Isqueiro entregue sem gás, recarga vendida em separado.`, en: `The quintessential S.T. Dupont lighter. Its famous "cling" upon opening is a hallmark recognized among connoisseurs. Its harmonious proportions make it universal. A collection with clean lines, dressed in noble materials, and equipped with a double yellow flame. With classic elegance, this lighter is adorned with vertical guilloché and a silver finish. This lighter is silver-plated. Silver is a precious and durable metal. Its exceptional properties give it a brilliance that enhances our creations. Silver is a living material that develops a patina over time; however, this does not affect the quality of the product, and the effects of time can be reversed. We recommend maintaining your S.T. Dupont products with a soft cloth and visiting your nearest boutique to receive expert advice from our specialists. We also invite you to visit the Maison’s website to learn more about caring for your S.T. Dupont pieces. Associated flint: black (REF 900601). Associated gas refill: yellow (REF 900432). Lighter delivered empty of gas, refill sold separately.` },
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
    description: { pt: `Inspirando-se nos seus arquivos e no icónico Ligne 2, a S.T. Dupont apresenta um inovador isqueiro de mesa de corpo amplo e sistema de dupla chama. Uma peça única no mundo do luxo. Isqueiro de mesa em laca preta brilhante, decorado com tampa em guilloché ponta de diamante. Gatilho com mecanismo deslizante e de pressão para alternar entre uma chama amarela resistente ao vento e uma chama maçarico. Acabamento em crómio. Recarga de gás associada: preta 000430. Isqueiro entregue sem gás, recarga vendida em separado.`, en: `Inspired by its archives and the iconic Ligne 2, S.T. Dupont presents an innovative table lighter with a large body and a dual-flame system. A unique piece in the world of luxury. Table lighter in glossy black lacquer, decorated with a diamond-point guilloché cap. Trigger with sliding and pressing mechanism to alternate between a wind-resistant yellow flame and a torch flame. Chrome finish. Associated gas refill: black 000430 Lighter delivered empty, refill sold separately.` },
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
    description: { pt: `Isqueiro Le Grand Dupont — Laca preta brilhante decorada com o monograma X multicolor da Fuente e gravada com o brasão Opus X Fuente. Tampa com guilloché 3D ponta de fogo. Acabamento em ouro amarelo. Dupla ignição: chama amarela ou azul com abertura «Cling». Pedra vermelha (REF 900651). Recarga de gás vermelha (REF 900435). Entregue sem gás; recarga vendida em separado. Chave de fendas incluída.`, en: `Grand Dupont Lighter - Black glossy lacquer decorated with the multicolor X monogram from Fuente and engraved with the Opus X Fuente crest. Guilloché 3D firepoint cap. Yellow gold finish. Dual ignition: yellow or blue flame with “Cling” opening. Flint red (REF 900651). Gas refill red (REF 900435). Delivered empty; refill sold separately. Screwdriver included.` },
    collection: `Le Grand Dupont`,
    categorySlug: "isqueiros",
    image: `/products/le-grand-dupont-fuente/C23060CL.webp`,
    variants: [
      { sku: `C23060CL`, name: { pt: `Le Grand Dupont · Fuente — Multicor`, en: `Le Grand Dupont · Fuente — Multicolor` }, priceCents: 192740, currency: "EUR", attributes: { color: { label: { pt: `Multicor`, en: `Multicolor` }, hex: ["#7a7d83"] } }, image: `/products/le-grand-dupont-fuente/C23060CL.webp`, images: [`/products/le-grand-dupont-fuente/C23060CL.webp`, `/products/le-grand-dupont-fuente/C23060CL-2.webp`, `/products/le-grand-dupont-fuente/C23060CL-3.webp`, `/products/le-grand-dupont-fuente/C23060CL-4.webp`] }
    ],
  },
  {
    slug: `ligne-2-fuente`,
    name: { pt: `Ligne 2 · Fuente`, en: `Ligne 2 · Fuente` },
    description: { pt: `Isqueiro Ligne 2 — Laca preta brilhante decorada com o monograma X multicolor da Fuente e gravada com o brasão Opus X Fuente. Tampa com guilloché 3D ponta de fogo. Acabamento em ouro amarelo. Dupla chama amarela com abertura «Cling». Pedra preta (REF 900601). Recarga de gás vermelha (REF 900435). Entregue sem gás; recarga vendida em separado.`, en: `Line 2 Lighter - Black glossy lacquer decorated with the multicolor X monogram from Fuente and engraved with the Opus X Fuente crest. Guilloché 3D firepoint cap. Yellow gold finish. Dual yellow flame with “Cling” opening. Flint black (REF 900601). Gas refill red (REF 900435). Delivered empty; refill sold separately.` },
    collection: `Ligne 2`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-fuente/C16060CL.webp`,
    variants: [
      { sku: `C16060CL`, name: { pt: `Ligne 2 · Fuente — Multicor`, en: `Ligne 2 · Fuente — Multicolor` }, priceCents: 174340, currency: "EUR", attributes: { color: { label: { pt: `Multicor`, en: `Multicolor` }, hex: ["#7a7d83"] } }, image: `/products/ligne-2-fuente/C16060CL.webp`, images: [`/products/ligne-2-fuente/C16060CL.webp`, `/products/ligne-2-fuente/C16060CL-2.webp`, `/products/ligne-2-fuente/C16060CL-3.webp`, `/products/ligne-2-fuente/C16060CL-4.webp`] }
    ],
  },
  {
    slug: `twiggy-20000-lieues-sous-les-mers`,
    name: { pt: `Twiggy · 20.000 Léguas Submarinas`, en: `Twiggy · 20000 Lieues sous les mers` },
    description: { pt: `Homenagem ao cativante universo de 20,000 Leagues Under The Sea, esta edição limitada expressa todo o savoir-faire da S.T. Dupont. Publicado em 1870, o romance narra a viagem de três náufragos capturados pelo Capitão Nemo, o misterioso inventor que percorre os fundos marinhos a bordo do Nautilus, um submarino muito à frente das tecnologias da sua época. Vigias, turbinas, corais, barbatanas e outros tentáculos de lulas gigantes inspiram esta edição limitada e as suas três gamas, todas relacionadas com diferentes capítulos do livro. Uma história em três actos em que mergulhar com paixão. «Vanikoro» recebe o nome do seu padrão «corais». No capítulo com o mesmo nome, o Capitão Nemo e os seus três companheiros atracam na ilha de Vanikoro, rodeados por uma incrível barreira de coral. Isqueiro Twiggy em laca azul brilhante, com a decoração Vanikoro. Acabamento em crómio. Equipado com chama maçarico azul de 1 cm, ideal para acender velas ou cigarros. Recarga de gás associada: preta (REF 900430). Isqueiro entregue sem gás, recarga vendida em separado.`, en: `Tribute to the captivating universe of 20,000 leagues under the seas, this limited edition expresses all the know-how of S.T. Dupont. Published in 1870, the novel recounts the journey of three castaways captured by Captain Nemo, this mysterious inventor who travels the seabed aboard the Nautilus, submarine very ahead of the technologies of the time. Portholes, turbines, corals, fins and other tentacles of giant squid inspire this limited edition and its three ranges, all related to different chapters of the book. A story in three stages in which to dive with passion. 'Vanikoro' is named after its pattern 'corals'. In the chapter of the same name, Captain Nemo and his three companions dock on the island of Vanikoro, surrounded by an incredible barrier reef. Twiggy lighter in shiny blue lacquer, with the Vanikoro decoration. Chrome finish. Equipped with a 1 cm blue torch flame, ideal for lighting candles or cigarettes. Associated gas refill: black (REF 900430) Lighter delivered empty of gas, refill sold separately.` },
    collection: `Twiggy`,
    categorySlug: "isqueiros",
    image: `/products/twiggy-20000-lieues-sous-les-mers/030053.webp`,
    variants: [
      { sku: `030053`, name: { pt: `Twiggy · 20.000 Léguas Submarinas — Real & Azul`, en: `Twiggy · 20000 Lieues sous les mers — Royal Blue` }, priceCents: 41400, currency: "EUR", attributes: { color: { label: { pt: `Real & Azul`, en: `Royal Blue` }, hex: ["#2845a3", "#1f3c66"] } }, image: `/products/twiggy-20000-lieues-sous-les-mers/030053.webp`, images: [`/products/twiggy-20000-lieues-sous-les-mers/030053.webp`, `/products/twiggy-20000-lieues-sous-les-mers/030053-2.webp`, `/products/twiggy-20000-lieues-sous-les-mers/030053-3.webp`, `/products/twiggy-20000-lieues-sous-les-mers/030053-4.webp`] }
    ],
  },
  {
    slug: `slimmy-20000-lieues-sous-les-mers`,
    name: { pt: `Slimmy · 20.000 Léguas Submarinas`, en: `Slimmy · 20000 Lieues sous les mers` },
    description: { pt: `Homenagem ao cativante universo de 20,000 Leagues Under The Sea, esta edição limitada expressa todo o savoir-faire da S.T. Dupont. Publicado em 1870, o romance narra a viagem de três náufragos capturados pelo Capitão Nemo, o misterioso inventor que percorre os fundos marinhos a bordo do Nautilus, um submarino muito à frente das tecnologias da sua época. Vigias, turbinas, corais, barbatanas e outros tentáculos de lulas gigantes inspiram esta edição limitada e as suas três gamas, todas relacionadas com diferentes capítulos do livro. Uma história em três actos em que mergulhar com paixão. «Vanikoro» recebe o nome do seu padrão «corais». No capítulo com o mesmo nome, o Capitão Nemo e os seus três companheiros atracam na ilha de Vanikoro, rodeados por uma incrível barreira de coral. Isqueiro Slimmy em laca azul brilhante, com a decoração Vanikoro. Acabamento em crómio. Equipado com chama maçarico azul de 2 cm, ideal para acender velas ou cigarros. Recarga de gás associada: preta (REF 900430). Isqueiro entregue sem gás, recarga vendida em separado.`, en: `Tribute to the captivating universe of 20,000 leagues under the seas, this limited edition expresses all the know-how of S.T. Dupont. Published in 1870, the novel recounts the journey of three castaways captured by Captain Nemo, this mysterious inventor who travels the seabed aboard the Nautilus, submarine very ahead of the technologies of the time. Portholes, turbines, corals, fins and other tentacles of giant squid inspire this limited edition and its three ranges, all related to different chapters of the book. A story in three stages in which to dive with passion. 'Vanikoro' is named after its pattern 'corals'. In the chapter of the same name, Captain Nemo and his three companions dock on the island of Vanikoro, surrounded by an incredible barrier reef. Slimmy lighter in glossy blue lacquer, with the Vanikoro decoration. Chrome finish. Equipped with a 2 cm blue torch flame, ideal for lighting candles or cigarettes. Associated gas refill: black (REF 900430) Lighter delivered empty of gas, refill sold separately.` },
    collection: `Slimmy`,
    categorySlug: "isqueiros",
    image: `/products/slimmy-20000-lieues-sous-les-mers/028053.webp`,
    variants: [
      { sku: `028053`, name: { pt: `Slimmy · 20.000 Léguas Submarinas — Real & Azul`, en: `Slimmy · 20000 Lieues sous les mers — Royal Blue` }, priceCents: 41400, currency: "EUR", attributes: { color: { label: { pt: `Real & Azul`, en: `Royal Blue` }, hex: ["#2845a3", "#1f3c66"] } }, image: `/products/slimmy-20000-lieues-sous-les-mers/028053.webp`, images: [`/products/slimmy-20000-lieues-sous-les-mers/028053.webp`, `/products/slimmy-20000-lieues-sous-les-mers/028053-2.webp`, `/products/slimmy-20000-lieues-sous-les-mers/028053-3.webp`, `/products/slimmy-20000-lieues-sous-les-mers/028053-4.webp`] }
    ],
  },
  {
    slug: `ligne-2-20000-lieues-sous-les-mers`,
    name: { pt: `Ligne 2 · 20.000 Léguas Submarinas`, en: `Ligne 2 · 20000 Lieues sous les mers` },
    description: { pt: `Homenagem ao cativante universo de 20,000 Leagues Under The Sea, esta edição limitada expressa todo o savoir-faire da S.T. Dupont. Publicado em 1870, o romance narra a viagem de três náufragos capturados pelo Capitão Nemo, o misterioso inventor que percorre os fundos marinhos a bordo do Nautilus, um submarino muito à frente das tecnologias da sua época. Vigias, turbinas, corais, barbatanas e outros tentáculos de lulas gigantes inspiram esta edição limitada e as suas três gamas, todas relacionadas com diferentes capítulos do livro. Uma história em três actos em que mergulhar com paixão. Para a gama Premium desta edição 20,000 Leagues Under The Sea, a S.T. Dupont narra dois outros capítulos: «4000 léguas sob o Pacífico», capítulo 18 do livro, e «Gulf Stream», capítulo 19 da sua segunda parte. Neste último, Júlio Verne evoca a Corrente do Golfo, uma força natural que molda o movimento dos oceanos e dos que neles se encontram. Veloz e perigosa, permite também ao Capitão Nemo demonstrar a sua excelência. Isqueiro Ligne 2 Cling com guilloché sob laca padrão «waves». Revestido em laca S.T. Dupont degradé azul. Tampa com padrão ondulado. Acabamento em paládio. Equipado com dupla chama amarela e o famoso «Cling» na abertura. Pedra de isqueiro associada: preta (REF 900601). Recarga de gás associada: vermelha (REF 900435). Isqueiro entregue sem gás, recarga vendida em separado.`, en: `Tribute to the captivating universe of 20,000 leagues under the seas, this limited edition expresses all the know-how of S.T. Dupont. Published in 1870, the novel recounts the journey of three castaways captured by Captain Nemo, this mysterious inventor who travels the seabed aboard the Nautilus, submarine very ahead of the technologies of the time. Portholes, turbines, corals, fins and other tentacles of giant squid inspire this limited edition and its three ranges, all related to different chapters of the book. A story in three stages in which to dive with passion. For the Premium range of this edition 20,000 leagues under the seas, S.T. Dupont tells two other chapters: «4000 leagues under the Pacific», chapter 18 of the book, and «Gulf Stream», chapter 19 of its second part. In the latter, Jules Verne evokes the Gulf Stream, a natural force shaping the movement of the oceans and those who are there. Fast-moving and perilous, it also allows Captain Nemo to demonstrate his excellence. Lighter Line 2 Cling guilloche under lacquered pattern 'waves'. Covered with S.T. Dupont blue degraded lacquer. Hat with a vague pattern. Palladium finish. Equipped with a double yellow flame and the famous "Cling" at the opening. Associated lighter flint: black (REF 900601) Associated gas refill: red (REF 900435) Lighter delivered empty of gas, refill sold separately.` },
    collection: `Ligne 2`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-20000-lieues-sous-les-mers/C16051CL-2.webp`,
    variants: [
      { sku: `C16051CL`, name: { pt: `Ligne 2 · 20.000 Léguas Submarinas — Azul & Gulf & Stream`, en: `Ligne 2 · 20000 Lieues sous les mers — Blue Gulf Stream` }, priceCents: 201940, currency: "EUR", attributes: { color: { label: { pt: `Azul & Gulf & Stream`, en: `Blue Gulf Stream` }, hex: ["#1f3c66"] } }, image: `/products/ligne-2-20000-lieues-sous-les-mers/C16051CL-2.webp`, images: [`/products/ligne-2-20000-lieues-sous-les-mers/C16051CL-2.webp`, `/products/ligne-2-20000-lieues-sous-les-mers/C16051CL-3.webp`, `/products/ligne-2-20000-lieues-sous-les-mers/C16051CL-4.webp`] }
    ],
  },
  {
    slug: `windproof`,
    name: { pt: `Windproof`, en: `Windproof` },
    description: { pt: `Pelo amor ao desafio e ao desempenho, a S.T. Dupont desenvolve um isqueiro polivalente concebido para se adaptar com eficácia e facilidade a todos os ventos. Uma nova chama para acompanhar os aventureiros nos seus desafios e nas suas superações. Equipado com uma chama resistente às correntes de ar, garante uma ignição experiente, mesmo sob os ventos alísios. Anti-vento em crómio escovado com batentes pretos com o icónico guilloché ponta de diamante. Recarga de gás associada: preta 000430. Isqueiro entregue sem gás, recarga vendida em separado.`, en: `For the love of challenge and performance, S.T. Dupont develops a multi-purpose lighter designed to adapt efficiently and easily to all winds. A new flame to accompany the adventurers in their challenges and their overtaking. Equipped with a flame resistant to drafts, it guarantees an expert ignition, even under the trade winds. Brushed chrome windproof with black bumpers featuring the iconic diamond point guilloche. Associated gas refill: black 000430 Lighter delivered empty of gas, refill sold separately.` },
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
    description: { pt: `Colar-isqueiro em laca preta brilhante com guilloché icónico de ponta de diamante e acabamentos dourados. Corrente amovível e ajustável em três comprimentos diferentes: 80/85/90 cm. Recarga de gás associada: Preta 000430. Isqueiro entregue sem gás, recarga vendida em separado.`, en: `Lighter necklace glossy black lacquer in iconic guilloché with diamond tip and gold finishes. Removable and adjustable chain in three different lengths 80/85/90cm. Associated Gas Refill: Black 000430 Lighter delivered empty of gas, refill sold separately.` },
    collection: `Colar Isqueiro`,
    categorySlug: "isqueiros",
    image: `/products/lighter-necklace/K27077CH.webp`,
    variants: [
      { sku: `K27077CH`, name: { pt: `Colar Isqueiro — Dourado`, en: `Lighter necklace — Golden` }, priceCents: 45540, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/lighter-necklace/K27077CH.webp`, images: [`/products/lighter-necklace/K27077CH.webp`, `/products/lighter-necklace/K27077CH-2.webp`, `/products/lighter-necklace/K27077CH-3.webp`, `/products/lighter-necklace/K27077CH-4.webp`] },
      { sku: `K27076CH`, name: { pt: `Colar Isqueiro — Prata`, en: `Lighter necklace — Silver` }, priceCents: 45540, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/lighter-necklace/K27076CH.webp`, images: [`/products/lighter-necklace/K27076CH.webp`, `/products/lighter-necklace/K27076CH-2.webp`, `/products/lighter-necklace/K27076CH-3.webp`, `/products/lighter-necklace/K27076CH-4.webp`] },
      { sku: `K27068CH`, name: { pt: `Colar Isqueiro — Preto`, en: `Lighter necklace — Black` }, priceCents: 44620, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/lighter-necklace/K27068CH.webp`, images: [`/products/lighter-necklace/K27068CH.webp`, `/products/lighter-necklace/K27068CH-2.webp`, `/products/lighter-necklace/K27068CH-3.webp`, `/products/lighter-necklace/K27068CH-4.webp`] },
      { sku: `K27067CH`, name: { pt: `Colar Isqueiro — Dourado`, en: `Lighter necklace — Golden` }, priceCents: 44620, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/lighter-necklace/K27067CH.webp`, images: [`/products/lighter-necklace/K27067CH.webp`, `/products/lighter-necklace/K27067CH-2.webp`, `/products/lighter-necklace/K27067CH-3.webp`, `/products/lighter-necklace/K27067CH-4.webp`] },
      { sku: `K27066CH`, name: { pt: `Colar Isqueiro — Prata`, en: `Lighter necklace — Silver` }, priceCents: 44620, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/lighter-necklace/K27066CH.webp`, images: [`/products/lighter-necklace/K27066CH.webp`, `/products/lighter-necklace/K27066CH-2.webp`, `/products/lighter-necklace/K27066CH-3.webp`, `/products/lighter-necklace/K27066CH-4.webp`] }
    ],
  },
  {
    slug: `twiggy-fender`,
    name: { pt: `Twiggy · Fender`, en: `Twiggy · Fender` },
    description: { pt: `Pela segunda vez, a S.T. Dupont e a Fender® unem-se para criar uma linha rock que conjuga o savoir-faire de ambas as casas. Os isqueiros Biggy, Slimmy e Twiggy, bem como a esferográfica Initial, adoptam a silhueta de uma Stratocaster® sobre fundo de laca preta. Isqueiro Twiggy Fender®. Chama maçarico azul de 1 cm. Chama ajustável. Acabamento prateado. Recarga de gás associada: preta (REF 000430). Isqueiro entregue sem gás, recarga vendida em separado.`, en: `For the second time, S.T. Dupont and Fender® are working together to create a rock line that combines the expertise of both companies. The Biggy, Slimmy and Twiggy lighters, as well as the Initial ballpoint pen take up the silhouette of a Stratocaster® on a black lacquer background. Fender® Twiggy lighter. Blue torch flame 1 cm. Adjustable flame. Silver finish. Associated gas refill: black (REF 000430) Lighter delivered empty gas, refill sold separately.` },
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
    description: { pt: `Pela segunda vez, a S.T. Dupont e a Fender® unem-se para criar uma linha rock que conjuga o savoir-faire de ambas as casas. Os isqueiros Biggy, Slimmy e Twiggy, bem como a esferográfica Initial, adoptam a silhueta de uma Stratocaster® sobre fundo de laca preta. Isqueiro Slimmy Fender®. Chama maçarico azul de 1 cm. Chama ajustável. Acabamento prateado. Recarga de gás associada: preta (REF 000430). Isqueiro entregue sem gás, recarga vendida em separado.`, en: `For the second time, S.T. Dupont and Fender® are working together to create a rock line that combines the expertise of both companies. The Biggy, Slimmy and Twiggy lighters, as well as the Initial ballpoint pen take up the silhouette of a Stratocaster® on a black lacquer background. Slimmy Fender® lighter. Blue torch flame 1 cm. Adjustable flame. Silver finish. Associated gas refill: black (REF 000430) Lighter delivered empty gas, refill sold separately.` },
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
    description: { pt: `Pela segunda vez, a S.T. Dupont e a Fender® unem-se para criar uma linha rock que conjuga o savoir-faire de ambas as casas. Os isqueiros Biggy, Slimmy e Twiggy, bem como a esferográfica Initial, adoptam a silhueta de uma Stratocaster® sobre fundo de laca preta. Isqueiro Biggy Fender®. Chama maçarico azul de 2 cm. Chama ajustável. Acabamento prateado. Recarga de gás associada: preta (REF 000430). Isqueiro entregue sem gás, recarga vendida em separado.`, en: `For the second time, S.T. Dupont and Fender® are working together to create a rock line that combines the expertise of both companies. The Biggy, Slimmy and Twiggy lighters, as well as the Initial ballpoint pen take up the silhouette of a Stratocaster® on a black lacquer background. Fender® Biggy lighter. Blue torch flame 2 cm. Adjustable flame. Silver finish. Associated gas refill: black (REF 000430) Lighter delivered empty gas, refill sold separately.` },
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
    description: { pt: `A Fender®, a mais famosa marca de guitarras, abre uma boutique no vibrante bairro de Harajuku, em Tóquio. Por esta ocasião, e pela segunda vez, a S.T. Dupont e a Fender® colaboram, imaginando uma linha rock inspirada no savoir-faire de ambas as casas e também no Japão. Com o seu trabalho da laca inspirado no kintsugi, e ainda o regresso de um antigo savoir-faire com pó de ouro aplicado à mão, esta colaboração faz seu o universo criativo da música. Isqueiro Ligne 2 Cling com dupla chama amarela suave. Decorado com o padrão Fender® em laca preta, arte de pó de ouro aplicada à mão e acabamentos dourados. Com o famoso «Cling» na abertura. Por cada compra do Ligne 2, é oferecido um exclusivo colar Médiator. Isqueiro entregue sem gás, recarga vendida em separado. GAME OF THRONES, HOUSE OF THE DRAGON e todas as personagens e elementos relacionados © & TM Home Box Office, Inc. (s24)`, en: `Fender®, the most famous guitar brand in Tokyo, is opening a boutique in the vibrant Harajuku area. On this occasion, and for the second time, S.T. Dupont and Fender® collaborate, imagining a rock line inspired by the know-how of both houses, as well as Japan. With his work of the lacquer inspired by kintsugi, but also the return of an ancient know-how with gold powder applied by hand, this collaboration makes its own the creativity of the musical universe. Lighter line 2 Cling with a double soft yellow flame. Decorated with the Fender® pattern in black lacquer, hand-applied Gold dust craftsmanship and gold finishes. With the famous "Cling" at the opening. For each purchase of the Line 2, an exclusive Médiator necklace is offered. Lighter delivered empty gas, refill sold separately. GAME OF THRONES, HOUSE OF THE DRAGON and all related characters and elements © & TM Home Box Office, Inc. (s24)` },
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
    description: { pt: `O savoir-faire da S.T. Dupont no trabalho do metal, bem como na arte da laca e da lona revestida de couro, conjuga-se na colecção Monogramme 1872. Bem ancoradas no seu tempo, as peças da colecção exibem todas o novo logótipo S.T. Dupont, direito, determinado e altivo. Isqueiro Le Grand Dupont, decorado em guilloché com o motivo Monogram 1872 e acabamento em ouro amarelo. Dotado de um sistema de dupla ignição: chama amarela ou chama azul. Pedra de isqueiro associada: preta (REF 900601). Recarga de gás associada: vermelha (REF 900435). Isqueiro entregue sem gás, recarga vendida em separado.`, en: `S.T. Dupont's expertise in metalwork, as well as in the art of lacquering and leather-coated canvas, comes together in the Monogramme 1872 collection. Dupont expertise come together in the Monogram 1872 collection. Bien ancrées dans leur époque, les pièces de la collection reprennent toutes le nouveau logo S.T. Dupont, droit, volontaire et fier. Le Grand Dupont lighter, guilloché decorated with the Monogram 1872 motif and finished in yellow gold. Doté d'un système de double allumage flamme jaune ou flamme bleue. Associated lighter stone: black (REF 900601) Associated gas refill: red (REF 900435) Lighter delivered empty of gas, refill sold separately. Translated with DeepL.com (free version)` },
    collection: `Le Grand Dupont`,
    categorySlug: "isqueiros",
    image: `/products/le-grand-dupont-monogram-1872/C16655.webp`,
    variants: [
      { sku: `C16655`, name: { pt: `Le Grand Dupont · Monogram 1872 — Prata`, en: `Le Grand Dupont · monogram 1872 — Silver` }, priceCents: 155940, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/le-grand-dupont-monogram-1872/C16655.webp`, images: [`/products/le-grand-dupont-monogram-1872/C16655.webp`, `/products/le-grand-dupont-monogram-1872/C16655-2.webp`] },
      { sku: `C23178`, name: { pt: `Le Grand Dupont · Monogram 1872 — Dourado`, en: `Le Grand Dupont · monogram 1872 — Golden` }, priceCents: 174340, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/le-grand-dupont-monogram-1872/C23178.webp`, images: [`/products/le-grand-dupont-monogram-1872/C23178.webp`, `/products/le-grand-dupont-monogram-1872/C23178-2.webp`, `/products/le-grand-dupont-monogram-1872/C23178-3.webp`, `/products/le-grand-dupont-monogram-1872/C23178-4.webp`] },
      { sku: `C23180`, name: { pt: `Le Grand Dupont · Monogram 1872 — Prata`, en: `Le Grand Dupont · monogram 1872 — Silver` }, priceCents: 174340, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/le-grand-dupont-monogram-1872/C23180.webp`, images: [`/products/le-grand-dupont-monogram-1872/C23180.webp`, `/products/le-grand-dupont-monogram-1872/C23180-2.webp`, `/products/le-grand-dupont-monogram-1872/C23180-3.webp`, `/products/le-grand-dupont-monogram-1872/C23180-4.webp`] },
      { sku: `C23179`, name: { pt: `Le Grand Dupont · Monogram 1872 — Preto`, en: `Le Grand Dupont · monogram 1872 — Black` }, priceCents: 174340, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/le-grand-dupont-monogram-1872/C23179.webp`, images: [`/products/le-grand-dupont-monogram-1872/C23179.webp`, `/products/le-grand-dupont-monogram-1872/C23179-2.webp`, `/products/le-grand-dupont-monogram-1872/C23179-3.webp`, `/products/le-grand-dupont-monogram-1872/C23179-4.webp`] }
    ],
  },
  {
    slug: `slimmy-2`,
    name: { pt: `Slimmy`, en: `Slimmy` },
    description: { pt: `Inspirado nos arquivos da Maison, o Slimmy ecoa o icónico Ligne 2 e o icónico Slim 7, o isqueiro de luxo mais fino do mundo. Cuidadosamente concebido em laca coral com acabamentos dourados. A leveza (66 g) e a finura (9 mm) deste isqueiro proporcionam uma pega perfeita e permitem que deslize facilmente para qualquer bolso ou mala. A sua chama maçarico garante uma experiência única, oferecendo uma ignição eficiente em qualquer circunstância. Intemporal e dotado do savoir-faire da laca e do guilloché, o Slimmy está disponível nas versões crómio, dourado e laca (azul-céu, coral, azul-escuro, preto, branco). Recarga de gás associada: preta (REF 000430)`, en: `Inspired by the House archives, Slimmy echoes the iconic Line 2 and the iconic Slim 7, the world's thinnest luxury lighter. Carefully designed in coral lacquer with gold finishes. The lightness (66g) and thinness (9mm) of this lighter provide a perfect grip and allow it to be easily slipped into any pocket or bag. Its torch flame guarantees a unique experience providing efficient ignition in any circumstance. Timeless and featuring the know-how of lacquer and guilloche, Slimmy is available in chrome, gold and lacquer versions (sky blue, coral, dark blue, black, white). Gas refill associated: black (REF 000430)` },
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
    description: { pt: `Este ano, a S.T. Dupont reintroduz o motivo de camuflagem nos seus produtos icónicos, numa interpretação fresca e audaz do design lendário, com chamas em tons vibrantes de vermelho e verde. Isqueiro Ligne 2 Cling com guilloché sob laca com motivo Camouflage verde, acabamento em paládio. Apresenta uma dupla chama amarela e o famoso «Cling» na abertura. Pedra de isqueiro associada: preta (REF 900601). Recarga de gás associada: vermelha (REF 900435). Isqueiro entregue sem gás, recarga vendida em separado.`, en: `This year, S.T. This year, S.T. Dupont reintroduces the camouflage motif on its iconic products, with a fresh, bold interpretation of the legendary design, featuring flames in vibrant shades of red and green. Ligne 2 Cling lighter guilloche under lacquer with green Camouflage motif, palladium finish Featuring a double yellow flame and the famous “Cling” when opened. Matching lighter stone: black (REF 900601) Associated gas refill: red (REF 900435) Lighter delivered empty of gas, refill sold separately.` },
    collection: `Ligne 2`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-camo/C16050.webp`,
    variants: [
      { sku: `C16050`, name: { pt: `Ligne 2 · Camuflado — Caqui`, en: `Ligne 2 · Camo — Khaki` }, priceCents: 142600, currency: "EUR", attributes: { color: { label: { pt: `Caqui`, en: `Khaki` }, hex: ["#7a7a4b"] } }, image: `/products/ligne-2-camo/C16050.webp`, images: [`/products/ligne-2-camo/C16050.webp`, `/products/ligne-2-camo/C16050-2.webp`, `/products/ligne-2-camo/C16050-3.webp`, `/products/ligne-2-camo/C16050-4.webp`] }
    ],
  },
  {
    slug: `maxijet-snake-skin`,
    name: { pt: `Maxijet · Pele de Cobra`, en: `Maxijet · Snake skin` },
    description: { pt: `Este ano, a S.T. Dupont reintroduz o padrão de camuflagem nos seus produtos icónicos, com chamas em tons vibrantes de vermelho e verde, criando uma interpretação fresca e audaz deste design lendário. Isqueiro Maxijet, motivo Camouflage vermelho e atributos em crómio. Apresenta uma chama maçarico azul. Recarga de gás associada: preta (REF 900430). Isqueiro entregue sem gás, recarga vendida em separado.`, en: `This year, S.T. This year, S.T. Dupont reintroduces the camouflage pattern on its iconic products, with flames in vibrant shades of red and green, creating a fresh, bold interpretation of this legendary design. Maxijet lighter, red Camouflage motif and chrome attributes Featuring a blue torch flame Associated gas refill: black (REF 900430) Lighter delivered empty of gas, refill sold separately` },
    collection: `Maxijet`,
    categorySlug: "isqueiros",
    image: `/products/maxijet-snake-skin/020151.webp`,
    variants: [
      { sku: `020151`, name: { pt: `Maxijet · Pele de Cobra — Vermelho`, en: `Maxijet · Snake skin — Red` }, priceCents: 29900, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/maxijet-snake-skin/020151.webp`, images: [`/products/maxijet-snake-skin/020151.webp`, `/products/maxijet-snake-skin/020151-2.webp`, `/products/maxijet-snake-skin/020151-3.webp`, `/products/maxijet-snake-skin/020151-4.webp`] }
    ],
  },
  {
    slug: `biggy-monogram-1872`,
    name: { pt: `Biggy · Monogram 1872`, en: `Biggy · monogram 1872` },
    description: { pt: `A arte do metal, tal como a arte da laca e do couro revestido, evidenciam o savoir-faire da S.T. Dupont na colecção Monogram 1872. Bem ancoradas no seu tempo, as peças da colecção exibem todas o novo logótipo S.T. Dupont — direito, determinado e altivo. Isqueiro Biggy decorado com o padrão Monogram 1872 em Bordéus e acabamentos dourados. Equipado com chama maçarico de 2 cm. Isqueiro entregue sem gás, recarga vendida em separado.`, en: `Craftsmanship in metal, as well as the art of lacquer and coated leather, showcase the expertise of S.T. Dupont in the Monogram 1872 collection. Well-rooted in their time, the pieces in the collection all feature the new S.T. Dupont logo—upright, determined, and proud. Biggy lighter decorated with the Monogram 1872 pattern in burgundy and gold finishes. Equipped with a 2cm torch flame. Lighter delivered empty of gas, refill sold separately.` },
    collection: `Biggy`,
    categorySlug: "isqueiros",
    image: `/products/biggy-monogram-1872/025080.webp`,
    variants: [
      { sku: `025080`, name: { pt: `Biggy · Monogram 1872 — Cinza`, en: `Biggy · monogram 1872 — Grey` }, priceCents: 48300, currency: "EUR", attributes: { color: { label: { pt: `Cinza`, en: `Grey` }, hex: ["#7a7d83"] } }, image: `/products/biggy-monogram-1872/025080.webp`, images: [`/products/biggy-monogram-1872/025080.webp`, `/products/biggy-monogram-1872/025080-2.webp`, `/products/biggy-monogram-1872/025080-3.webp`, `/products/biggy-monogram-1872/025080-4.webp`] },
      { sku: `025079`, name: { pt: `Biggy · Monogram 1872 — Preto`, en: `Biggy · monogram 1872 — Black` }, priceCents: 48300, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/biggy-monogram-1872/025079.webp`, images: [`/products/biggy-monogram-1872/025079.webp`, `/products/biggy-monogram-1872/025079-2.webp`, `/products/biggy-monogram-1872/025079-3.webp`, `/products/biggy-monogram-1872/025079-4.webp`] },
      { sku: `025078B`, name: { pt: `Biggy · Monogram 1872 — Bordeaux`, en: `Biggy · monogram 1872 — Burgundy` }, priceCents: 48300, currency: "EUR", attributes: { color: { label: { pt: `Bordeaux`, en: `Burgundy` }, hex: ["#5e1f1f"] } }, image: `/products/biggy-monogram-1872/025078B.webp`, images: [`/products/biggy-monogram-1872/025078B.webp`, `/products/biggy-monogram-1872/025078B-2.webp`, `/products/biggy-monogram-1872/025078B-3.webp`, `/products/biggy-monogram-1872/025078B-4.webp`] }
    ],
  },
  {
    slug: `ligne-2-monogram-1872`,
    name: { pt: `Ligne 2 · Monogram 1872`, en: `Ligne 2 · monogram 1872` },
    description: { pt: `A arte do metal, tal como a arte da laca e do couro revestido, evidenciam o savoir-faire da S.T. Dupont na colecção Monogram 1872. Bem ancoradas no seu tempo, as peças da colecção exibem todas o novo logótipo S.T. Dupont — direito, determinado e altivo. Isqueiro Ligne 2 Cling, arte do guilloché, Monogram 1872, com acabamentos preto acetinado e ouro amarelo. Equipado com dupla chama amarela e o famoso «Cling» na abertura. Isqueiro entregue sem gás, recarga vendida em separado.`, en: `Craftsmanship in metal, as well as the art of lacquer and coated leather, showcase the expertise of S.T. Dupont in the Monogram 1872 collection. Well-rooted in their time, the pieces in the collection all feature the new S.T. Dupont logo—upright, determined, and proud. Ligne 2 Cling lighter, guilloche craftsmanship, Monogram 1872, with satin black and yellow gold finishes. Equipped with a double yellow flame and the famous "Cling" sound upon opening. Lighter delivered empty of gas, refill sold separately.` },
    collection: `Ligne 2`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-monogram-1872/C16180.webp`,
    variants: [
      { sku: `C16180`, name: { pt: `Ligne 2 · Monogram 1872 — Prata`, en: `Ligne 2 · monogram 1872 — Silver` }, priceCents: 133400, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/ligne-2-monogram-1872/C16180.webp`, images: [`/products/ligne-2-monogram-1872/C16180.webp`, `/products/ligne-2-monogram-1872/C16180-2.webp`, `/products/ligne-2-monogram-1872/C16180-3.webp`, `/products/ligne-2-monogram-1872/C16180-4.webp`] },
      { sku: `C16179`, name: { pt: `Ligne 2 · Monogram 1872 — Preto`, en: `Ligne 2 · monogram 1872 — Black` }, priceCents: 133400, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/ligne-2-monogram-1872/C16179.webp`, images: [`/products/ligne-2-monogram-1872/C16179.webp`, `/products/ligne-2-monogram-1872/C16179-2.webp`, `/products/ligne-2-monogram-1872/C16179-3.webp`, `/products/ligne-2-monogram-1872/C16179-4.webp`] },
      { sku: `C16178`, name: { pt: `Ligne 2 · Monogram 1872 — Dourado`, en: `Ligne 2 · monogram 1872 — Golden` }, priceCents: 133400, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/ligne-2-monogram-1872/C16178.webp`, images: [`/products/ligne-2-monogram-1872/C16178.webp`, `/products/ligne-2-monogram-1872/C16178-2.webp`, `/products/ligne-2-monogram-1872/C16178-3.webp`, `/products/ligne-2-monogram-1872/C16178-4.webp`] }
    ],
  },
  {
    slug: `cigar-cutter-monogram-1872`,
    name: { pt: `Cortador de Charuto · Monogram 1872`, en: `Cigar cutter · monogram 1872` },
    description: { pt: `Isqueiro S.T. Dupont — laca lapidada à mão, mecanismo de chama assinada e o icónico som cling® da casa de Faverges.`, en: `S.T. Dupont lighter — hand-polished lacquer, signature flame mechanism and the iconic cling® of the Faverges manufacture.` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cigar-cutter-monogram-1872/003480M.webp`,
    variants: [
      { sku: `003480M`, name: { pt: `Cortador de Charuto · Monogram 1872 — Claro & Cinza`, en: `Cigar cutter · monogram 1872 — Light Gray` }, priceCents: 31740, currency: "EUR", attributes: { color: { label: { pt: `Claro & Cinza`, en: `Light Gray` }, hex: ["#cfd2d8", "#7a7d83"] } }, image: `/products/cigar-cutter-monogram-1872/003480M.webp`, images: [`/products/cigar-cutter-monogram-1872/003480M.webp`, `/products/cigar-cutter-monogram-1872/003480M-2.webp`, `/products/cigar-cutter-monogram-1872/003480M-3.webp`] },
      { sku: `003479`, name: { pt: `Cortador de Charuto · Monogram 1872 — Preto`, en: `Cigar cutter · monogram 1872 — Black` }, priceCents: 31740, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/cigar-cutter-monogram-1872/003479.webp`, images: [`/products/cigar-cutter-monogram-1872/003479.webp`, `/products/cigar-cutter-monogram-1872/003479-2.webp`, `/products/cigar-cutter-monogram-1872/003479-3.webp`] }
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
    description: { pt: `Por ocasião do 60.º aniversário da Maison Padrón, a S.T. Dupont anuncia uma colaboração especial. A colecção S.T. Dupont x Padrón oferece isqueiros e acessórios para charutos distintivos. Os seus acabamentos em ouro amarelo encarnam a vitola do charuto Padrón, e a sua laca castanha remete para a cor da folha de capa, a folha de tabaco que envolve o blend do charuto. Isqueiro Le Grand Dupont, com laca castanha mate e acabamentos dourados. Gravação da ilha de Cuba e das iniciais «JOP» do fundador da marca cubana. Apresenta um sistema de dupla ignição com chama amarela ou azul. O isqueiro é entregue sem gás; recarga vendida em separado. Chave de fendas incluída para trocar a pedra.`, en: `On the occasion of the 60th anniversary of the Padrón house, S.T. Dupont announces a special collaboration. The S.T. Dupont x Padrón collection offers distinctive lighters and cigar accessories. Its yellow gold finishes embody the Padrón cigar band, and its brown lacquer refers to the color of their wrapper leaf, the tobacco leaf that wraps a cigar blend. Grand Dupont lighter, with matte brown lacquer and gold finishes. Engraving of the island of Cuba and the initials 'JOP' of the founder of the Cuban brand. Features a dual ignition system with yellow or blue flame. The lighter is delivered empty of gas; refill sold separately. Screwdriver included for changing the flint.` },
    collection: `Le Grand Dupont`,
    categorySlug: "isqueiros",
    image: `/products/le-grand-dupont-padron/C23014.webp`,
    variants: [
      { sku: `C23014`, name: { pt: `Le Grand Dupont · Padrón — Castanho`, en: `Le Grand Dupont · Padron — Brown` }, priceCents: 183540, currency: "EUR", attributes: { color: { label: { pt: `Castanho`, en: `Brown` }, hex: ["#6b4a2a"] } }, image: `/products/le-grand-dupont-padron/C23014.webp`, images: [`/products/le-grand-dupont-padron/C23014.webp`, `/products/le-grand-dupont-padron/C23014-2.webp`, `/products/le-grand-dupont-padron/C23014-3.webp`, `/products/le-grand-dupont-padron/C23014-4.webp`] }
    ],
  },
  {
    slug: `ligne-2-padron`,
    name: { pt: `Ligne 2 · Padrón`, en: `Ligne 2 · Padron` },
    description: { pt: `Por ocasião do 60.º aniversário da Maison Padrón, a S.T. Dupont anuncia uma colaboração especial. A colecção S.T. Dupont x Padrón oferece isqueiros e acessórios para charutos distintivos. Os seus acabamentos em ouro amarelo encarnam a vitola do charuto Padrón, e a sua laca castanha remete para a cor da folha de capa, a folha de tabaco que envolve o blend do charuto. Isqueiro Ligne 2 Cling com laca castanha mate e acabamentos dourados. Gravação da ilha de Cuba e das iniciais «JOP» do fundador da marca cubana. Apresenta uma dupla chama amarela e o famoso «Cling» na abertura. O isqueiro é entregue sem gás; recarga vendida em separado.`, en: `On the occasion of the 60th anniversary of the Padrón house, S.T. Dupont announces a special collaboration. The S.T. Dupont x Padrón collection offers distinctive lighters and cigar accessories. Its yellow gold finishes embody the Padrón cigar band, and its brown lacquer refers to the color of their wrapper leaf, the tobacco leaf that wraps a cigar blend. Ligne 2 Cling lighter with matte brown lacquer and gold finishes. Engraving of the island of Cuba and the initials 'JOP' of the founder of the Cuban brand. Features a dual yellow flame and the famous 'Cling' sound upon opening. The lighter is delivered empty of gas; refill sold separately.` },
    collection: `Ligne 2`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-padron/C16014.webp`,
    variants: [
      { sku: `C16014`, name: { pt: `Ligne 2 · Padrón — Castanho`, en: `Ligne 2 · Padron — Brown` }, priceCents: 174340, currency: "EUR", attributes: { color: { label: { pt: `Castanho`, en: `Brown` }, hex: ["#6b4a2a"] } }, image: `/products/ligne-2-padron/C16014.webp`, images: [`/products/ligne-2-padron/C16014.webp`, `/products/ligne-2-padron/C16014-2.webp`, `/products/ligne-2-padron/C16014-3.webp`, `/products/ligne-2-padron/C16014-4.webp`] }
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
      { sku: `C16133`, name: { pt: `Line 2 Perfect Cling — Laranja`, en: `Line 2 Perfect Ping — Orange` }, priceCents: 146740, currency: "EUR", attributes: { color: { label: { pt: `Laranja`, en: `Orange` }, hex: ["#c4642d"] } }, image: `/products/line-2-perfect-ping/C16133.webp`, images: [`/products/line-2-perfect-ping/C16133.webp`, `/products/line-2-perfect-ping/C16133-2.webp`] }
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
      { sku: `027772`, name: { pt: `Slim 7 — Néon & Verde`, en: `Slim7 — Neon Green` }, priceCents: 27140, currency: "EUR", attributes: { color: { label: { pt: `Néon & Verde`, en: `Neon Green` }, hex: ["#aef043", "#3a5040"] } }, image: `/products/slim7/027772.webp`, images: [`/products/slim7/027772.webp`, `/products/slim7/027772-2.webp`, `/products/slim7/027772-3.webp`, `/products/slim7/027772-4.webp`] },
      { sku: `027771`, name: { pt: `Slim 7 — Néon & Azul`, en: `Slim7 — Neon Blue` }, priceCents: 27140, currency: "EUR", attributes: { color: { label: { pt: `Néon & Azul`, en: `Neon Blue` }, hex: ["#aef043", "#1f3c66"] } }, image: `/products/slim7/027771.webp`, images: [`/products/slim7/027771.webp`, `/products/slim7/027771-2.webp`, `/products/slim7/027771-3.webp`, `/products/slim7/027771-4.webp`] },
      { sku: `027769`, name: { pt: `Slim 7 — Néon & Laranja`, en: `Slim7 — Neon Orange` }, priceCents: 27140, currency: "EUR", attributes: { color: { label: { pt: `Néon & Laranja`, en: `Neon Orange` }, hex: ["#aef043", "#c4642d"] } }, image: `/products/slim7/027769.webp`, images: [`/products/slim7/027769.webp`, `/products/slim7/027769-2.webp`, `/products/slim7/027769-3.webp`, `/products/slim7/027769-4.webp`] }
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
      { sku: `021417`, name: { pt: `Défi Xtreme — Néon & Verde`, en: `Defi xtreme — Neon Green` }, priceCents: 34500, currency: "EUR", attributes: { color: { label: { pt: `Néon & Verde`, en: `Neon Green` }, hex: ["#aef043", "#3a5040"] } }, image: `/products/defi-xtreme/021417.webp`, images: [`/products/defi-xtreme/021417.webp`, `/products/defi-xtreme/021417-2.webp`, `/products/defi-xtreme/021417-3.webp`, `/products/defi-xtreme/021417-4.webp`] },
      { sku: `021416`, name: { pt: `Défi Xtreme — Néon & Azul`, en: `Defi xtreme — Neon Blue` }, priceCents: 34500, currency: "EUR", attributes: { color: { label: { pt: `Néon & Azul`, en: `Neon Blue` }, hex: ["#aef043", "#1f3c66"] } }, image: `/products/defi-xtreme/021416.webp`, images: [`/products/defi-xtreme/021416.webp`, `/products/defi-xtreme/021416-2.webp`, `/products/defi-xtreme/021416-3.webp`, `/products/defi-xtreme/021416-4.webp`] }
    ],
  },
  {
    slug: `maxijet`,
    name: { pt: `Maxijet`, en: `Maxijet` },
    description: { pt: `Isqueiro MaxiJet com acabamento preto mate e gatilho vermelho, o companheiro perfeito para os apreciadores de charutos graças à sua potentíssima chama maçarico. Recarga de gás associada: preta (REF 900430). Isqueiro entregue sem gás, recarga vendida em separado.`, en: `MaxiJet Lighter with a matte black finish and a red trigger, the perfect companion for cigar smokers thanks to its very powerful torch flame. Associated gas refill: black (REF 900430). Lighter delivered empty of gas, refill sold separately.` },
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
    description: { pt: `O Minijet é um isqueiro compacto e moderno, perfeito para o uso diário. Com a sua potente chama maçarico azul e pega ergonómica, oferece estilo e funcionalidade a todo o momento.`, en: `The Minijet is a compact, modern lighter that's perfect for everyday use. With its powerful blue torch flame and ergonomic grip, it offers style and practicality at all times.` },
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
    description: { pt: `Inspirada na X-Bag, uma das malas da colecção de marroquinaria desenvolvida esta temporada pela S.T. Dupont, Fire X oferece a sua reinterpretação da icónica ponta de chama sobre os clássicos da Maison. Isqueiro Biggy Fire X decorado em laca preta e acabamentos em crómio. Apresenta uma chama maçarico de 2 cm. Recarga de gás associada: preta (REF 900430). Isqueiro entregue sem gás, recarga vendida em separado.`, en: `Inspired by the X-Bag, one of the bags from the leather goods collection developed this season by S.T. Dupont, Fire X offers its reinterpretation of the iconic flame tip on the classics of the House. Biggy Fire X lighter decorated with black lacquer and chrome finishes. Featuring a 2cm torch flame. Associated gas refill: black (REF 900430) Lighter delivered empty of gas, refill sold separately.` },
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
    description: { pt: `Inspirada na X-Bag, uma das malas da colecção de marroquinaria desenvolvida esta temporada pela S.T. Dupont, Fire X oferece a sua reinterpretação da icónica ponta de chama sobre os clássicos da Maison. Isqueiro Ligne 2 Fire X pequeno modelo em 3D com corpo em metal preto acabamento acetinado e verso gravado com o motivo Fire X. Apresenta uma dupla chama amarela. Pedra de isqueiro associada: preta (REF 900601). Recarga de gás associada: vermelha (REF 900435). Isqueiro entregue sem gás, recarga vendida em separado.`, en: `Inspired by the X-Bag, one of the bags from the leather goods collection developed this season by S.T. Dupont, Fire X offers its reinterpretation of the iconic flame tip on the classics of the House. Ligne 2 Fire X small model lighter in 3D with a satin-finished black metal body, as well as the back engraved with the Fire X motif. Featuring a double yellow flame. Associated lighter flint: black (REF 900601) Associated gas refill: red (REF 900435) Lighter delivered empty of gas, refill sold separately.` },
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
    description: { pt: `O icónico Maxijet é ornamentado com laca preta brilhante e acabamento em crómio, exibindo o dragão S.T. Dupont. Recargas associadas: Preta (REF 000430)`, en: `The iconic Maxijet is adorned with a black glossy lacquer and chrome finish, featuring the S.T. Dupont dragon. Associated refills: Black (REF 000430)` },
    collection: `Maxijet`,
    categorySlug: "isqueiros",
    image: `/products/maxijet-dragon/020177.webp`,
    variants: [
      { sku: `020177`, name: { pt: `Maxijet · Dragão — Preto`, en: `Maxijet · Dragon — Black` }, priceCents: 28980, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/maxijet-dragon/020177.webp`, images: [`/products/maxijet-dragon/020177.webp`, `/products/maxijet-dragon/020177-2.webp`, `/products/maxijet-dragon/020177-3.webp`, `/products/maxijet-dragon/020177-4.webp`] },
      { sku: `020175`, name: { pt: `Maxijet · Dragão — Dourado & Mel & Vermelho`, en: `Maxijet · Dragon — Golden & Honey & Red` }, priceCents: 28980, currency: "EUR", attributes: { color: { label: { pt: `Dourado & Mel & Vermelho`, en: `Golden & Honey & Red` }, hex: ["#c8a24a", "#c89b4a"] } }, image: `/products/maxijet-dragon/020175.webp`, images: [`/products/maxijet-dragon/020175.webp`, `/products/maxijet-dragon/020175-2.webp`, `/products/maxijet-dragon/020175-3.webp`, `/products/maxijet-dragon/020175-4.webp`] }
    ],
  },
  {
    slug: `slim-7-dragon`,
    name: { pt: `Slim 7 · Dragão`, en: `Slim 7 · Dragon` },
    description: { pt: `O icónico dragão S.T. Dupont surge neste elegante isqueiro Slim 7 em preto e crómio. Recargas associadas: Preta (REF 000430)`, en: `S.T. Dupont's iconic dragon is featured on this sleek black and chrome Slim 7 lighter. Associated Refills: Black (REF 000430)` },
    collection: `Slim 7`,
    categorySlug: "isqueiros",
    image: `/products/slim-7-dragon/027777.webp`,
    variants: [
      { sku: `027777`, name: { pt: `Slim 7 · Dragão — Preto`, en: `Slim 7 · Dragon — Black` }, priceCents: 27140, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/slim-7-dragon/027777.webp`, images: [`/products/slim-7-dragon/027777.webp`, `/products/slim-7-dragon/027777-2.webp`] }
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
      { sku: `021605`, name: { pt: `Défi XXtreme — Bronze`, en: `Defi XXtreme — Bronze` }, priceCents: 119140, currency: "EUR", attributes: { color: { label: { pt: `Bronze`, en: `Bronze` }, hex: ["#9b6a3a"] } }, image: `/products/defi-xxtreme/021605.webp`, images: [`/products/defi-xxtreme/021605.webp`, `/products/defi-xxtreme/021605-2.webp`, `/products/defi-xxtreme/021605-3.webp`, `/products/defi-xxtreme/021605-4.webp`] },
      { sku: `021399`, name: { pt: `Défi XXtreme — Bronze`, en: `Defi XXtreme — Bronze` }, priceCents: 155940, currency: "EUR", attributes: { color: { label: { pt: `Bronze`, en: `Bronze` }, hex: ["#9b6a3a"] } }, image: `/products/defi-xxtreme/021399.webp`, images: [`/products/defi-xxtreme/021399.webp`] },
      { sku: `021398`, name: { pt: `Défi XXtreme — Amarelo & Ouro`, en: `Defi XXtreme — Yellow Gold` }, priceCents: 155940, currency: "EUR", attributes: { color: { label: { pt: `Amarelo & Ouro`, en: `Yellow Gold` }, hex: ["#d8b04a", "#c8a24a"] } }, image: `/products/defi-xxtreme/021398.webp`, images: [`/products/defi-xxtreme/021398.webp`] }
    ],
  },
  {
    slug: `twiggy-2`,
    name: { pt: `Twiggy`, en: `Twiggy` },
    description: { pt: `O isqueiro Twiggy em laca azul-céu e acabamento em crómio é elegante e de forma alongada. O seu acabamento em laca realça a silhueta e encarna o espírito dos anos 60. Com a sua chama maçarico de 1 cm, é perfeito para acender velas ou cigarros, tornando-se um indispensável tanto para fumadores como para não fumadores. Tal como o Slimmy, este modelo está disponível em cinco cores delicadas: azul-céu, coral, azul-escuro, preto e branco. Recarga de gás associada: preta (REF 000430)`, en: `The Twiggy Lighter in sky blue lacquer and chrome finish is sleek and long-shaped. Its lacquer finish emphasizes its silhouette and embodies the spirit of the 60s. With its 1 cm torch flame, it is perfect for lighting candles or cigarettes, making it a must-have for smokers and non-smokers alike. Just like Slimmy, this model comes in five delicate colors: sky blue, coral, dark blue, black and white. Associated gas refill: black (REF 000430)` },
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
    description: { pt: `Ligado à herança da Maison, conjugando a elegância do Ligne 2 com a potência do Megajet, o Biggy encantará os apreciadores de charutos que procuram desempenho e um design de luxo. Cuidadosamente concebido em laca preta brilhante. Equipado com uma potente chama maçarico de 2 cm, o Biggy assegura uma ignição excepcional em qualquer ocasião. Este modelo está disponível nos mesmos acabamentos do Slimmy: crómio, dourado, guilloché ponta de diamante ou laca (azul-escuro e preto). Recarga de gás associada: preta (REF 000430)`, en: `Connected to the heritage of the House, combining the elegance of Line 2 with the power of the Megajet, Biggy will delight cigar lovers looking for performance and luxurious design. Carefully designed in glossy black lacquer. Equipped with a powerful 2 cm torch flame, biggy ensures exceptional ignition on any occasion. This model is available in the same finishes as the Slimmy: chrome, gold, guilloche diamond tip or lacquer (dark blue and black). Gas refill associated: black (REF 000430)` },
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
    description: { pt: `A S.T. Dupont continua a inovar e supera o desempenho com o novo isqueiro Défi Extrême Crómio Escovado. O seu design afirmativo, dinâmico e masculino é um verdadeiro símbolo de performance. A sua concepção única conjuga um corpo em metal injectado e uma capa de protecção em material semi-rígido altamente resistente. A sua ergonomia intuitiva e as suas funcionalidades tácteis, com a decoração ponta de diamante, fazem dele um objecto prático e eficaz em todas as circunstâncias. A sua chama maçarico azul, potente e uniforme, resiste aos ventos mais violentos. O Défi Extrême é eficaz desde as temperaturas mais frias (−10 °C) às mais quentes (+45 °C) e funciona a uma altitude superior a 3500 m, onde outros isqueiros são ineficazes. Uma recarga de gás associada está disponível em separado (REF 900436). O isqueiro é entregue sem gás.`, en: `S.T. Dupont continue d'innover et dépasse les performances avec le nouveau briquet Défi Extrême Chrome Brossé. Son design affirmé, dynamique et masculin est un véritable symbole de performance. Sa conception unique combine un corps en métal injecté et une enveloppe de protection en matière semi-rigide très résistante. Son ergonomie intuitive et ses fonctionnalités tactiles avec le décor pointe de diamants en font un objet pratique et efficace en toutes circonstances. Sa flamme torche bleue, puissante et uniforme résiste aux vents les plus violents. Défi Extrême est efficace des températures les plus froides (-10°C) aux températures les plus chaudes (+45°C) et fonctionne à une altitude de plus de 3500 m, là où d'autres briquets sont inefficaces. Une recharge de gaz associée est disponible séparément (REF 900436). Le briquet est livré vide de gaz.` },
    collection: `Défi Extreme`,
    categorySlug: "isqueiros",
    image: `/products/defi-extreme-2/021465.webp`,
    variants: [
      { sku: `021465`, name: { pt: `Défi Extreme — Rosa`, en: `Defi Extreme — Pink` }, priceCents: 34500, currency: "EUR", attributes: { color: { label: { pt: `Rosa`, en: `Pink` }, hex: ["#e7a3b1"] } }, image: `/products/defi-extreme-2/021465.webp`, images: [`/products/defi-extreme-2/021465.webp`, `/products/defi-extreme-2/021465-2.webp`, `/products/defi-extreme-2/021465-3.webp`, `/products/defi-extreme-2/021465-4.webp`] },
      { sku: `021407`, name: { pt: `Défi Extreme — Bronze & Cobre`, en: `Defi Extreme — Bronze & Copper` }, priceCents: 34500, currency: "EUR", attributes: { color: { label: { pt: `Bronze & Cobre`, en: `Bronze & Copper` }, hex: ["#9b6a3a", "#a7592c"] } }, image: `/products/defi-extreme-2/021407.webp`, images: [`/products/defi-extreme-2/021407.webp`, `/products/defi-extreme-2/021407-2.webp`, `/products/defi-extreme-2/021407-3.webp`, `/products/defi-extreme-2/021407-4.webp`] },
      { sku: `021403`, name: { pt: `Défi Extreme — Cinza & Prata`, en: `Defi Extreme — Grey & Silver` }, priceCents: 34500, currency: "EUR", attributes: { color: { label: { pt: `Cinza & Prata`, en: `Grey & Silver` }, hex: ["#7a7d83", "#c9ccd1"] } }, image: `/products/defi-extreme-2/021403.webp`, images: [`/products/defi-extreme-2/021403.webp`, `/products/defi-extreme-2/021403-2.webp`, `/products/defi-extreme-2/021403-3.webp`, `/products/defi-extreme-2/021403-4.webp`] },
      { sku: `021400`, name: { pt: `Défi Extreme — Preto`, en: `Defi Extreme — Black` }, priceCents: 34500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/defi-extreme-2/021400.webp`, images: [`/products/defi-extreme-2/021400.webp`, `/products/defi-extreme-2/021400-2.webp`, `/products/defi-extreme-2/021400-3.webp`, `/products/defi-extreme-2/021400-4.webp`] }
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
    categorySlug: "acessorios",
    image: `/products/cigar-cutter/003394.webp`,
    variants: [
      { sku: `003394`, name: { pt: `Cortador de Charuto — Preto`, en: `Cigar cutter — Black` }, priceCents: 27140, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/cigar-cutter/003394.webp`, images: [`/products/cigar-cutter/003394.webp`, `/products/cigar-cutter/003394-2.webp`, `/products/cigar-cutter/003394-3.webp`] },
      { sku: `003553`, name: { pt: `Cortador de Charuto — Preto & Dourado & Amarelo & Ouro`, en: `Cigar cutter — Black & Golden & Yellow Gold` }, priceCents: 28980, currency: "EUR", attributes: { color: { label: { pt: `Preto & Dourado & Amarelo & Ouro`, en: `Black & Golden & Yellow Gold` }, hex: ["#15171c", "#c8a24a"] } }, image: `/products/cigar-cutter/003553.webp`, images: [`/products/cigar-cutter/003553.webp`, `/products/cigar-cutter/003553-2.webp`, `/products/cigar-cutter/003553-3.webp`] },
      { sku: `003262`, name: { pt: `Cortador de Charuto — Preto`, en: `Cigar cutter — Black` }, priceCents: 15180, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/cigar-cutter/003262.webp`, images: [`/products/cigar-cutter/003262.webp`, `/products/cigar-cutter/003262-2.webp`, `/products/cigar-cutter/003262-3.webp`] },
      { sku: `003257`, name: { pt: `Cortador de Charuto — Prata`, en: `Cigar cutter — Silver` }, priceCents: 22540, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/cigar-cutter/003257.webp`, images: [`/products/cigar-cutter/003257.webp`, `/products/cigar-cutter/003257-2.webp`, `/products/cigar-cutter/003257-3.webp`] },
      { sku: `003418`, name: { pt: `Cortador de Charuto — Prata`, en: `Cigar cutter — Silver` }, priceCents: 26220, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/cigar-cutter/003418.webp`, images: [`/products/cigar-cutter/003418.webp`, `/products/cigar-cutter/003418-2.webp`, `/products/cigar-cutter/003418-3.webp`] },
      { sku: `003415`, name: { pt: `Cortador de Charuto — Preto & Prata`, en: `Cigar cutter — Black & Silver` }, priceCents: 28980, currency: "EUR", attributes: { color: { label: { pt: `Preto & Prata`, en: `Black & Silver` }, hex: ["#15171c", "#c9ccd1"] } }, image: `/products/cigar-cutter/003415.webp`, images: [`/products/cigar-cutter/003415.webp`, `/products/cigar-cutter/003415-2.webp`, `/products/cigar-cutter/003415-3.webp`, `/products/cigar-cutter/003415-4.webp`] },
      { sku: `003266`, name: { pt: `Cortador de Charuto — Prata`, en: `Cigar cutter — Silver` }, priceCents: 22540, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/cigar-cutter/003266.webp`, images: [`/products/cigar-cutter/003266.webp`, `/products/cigar-cutter/003266-2.webp`, `/products/cigar-cutter/003266-3.webp`] },
      { sku: `003265`, name: { pt: `Cortador de Charuto — Preto`, en: `Cigar cutter — Black` }, priceCents: 22540, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/cigar-cutter/003265.webp`, images: [`/products/cigar-cutter/003265.webp`, `/products/cigar-cutter/003265-2.webp`, `/products/cigar-cutter/003265-3.webp`] }
    ],
  },
  {
    slug: `eternity-orlinski`,
    name: { pt: `Eternity · Orlinski`, en: `Eternity · Orlinski` },
    description: { pt: `A S.T. Dupont une-se ao artista francês Richard Orlinski numa colecção exclusiva onde a força do gesto escultórico se encontra com a precisão do savoir-faire artesanal. Inspirada no icónico motivo «Kong» e na selvajaria da natureza, esta colaboração traz uma energia bruta e contemporânea às criações da Maison. Isqueiros e instrumentos de escrita tornam-se verdadeiras obras de arte, valorizados por linhas angulares, texturas contrastantes e cores vibrantes. A linha «Red» evidencia um savoir-faire técnico de excepção, conjugando um novo acabamento em dourado escovado com um motivo «Kong» criado em filigrana de metal e um padrão guilloché de inspiração anos 70 que produz uma sensação de movimento na matéria. Estas técnicas refinadas são aplicadas ao isqueiro Ligne 2 e à caneta Line D Eternity em vermelho e dourado, entregando uma assinatura simultaneamente precisa e escultórica. Caneta de tinta permanente Line D Eternity Large com guilloché diagonal em laca vermelha, ornamentada com o motivo «Kong» em dourado escovado. Acabamentos dourados. Clip Sword articulado. Bico Wings em ouro maciço de 14 quilates. Êmbolo incluído. Disponível também nas versões rollerball e tinta permanente. Esta caneta de tinta permanente é fornecida com um bico médio, oferecendo um traço de escrita de aproximadamente 0,55 mm. Recargas associadas: Cartuchos de tinta: 040112 Azul – 040110 Preta – 040362 Vermelha – 040363 Verde – 040364 Turquesa. Tinteiros: 040165 Preto – 040166 Azul Real – 040167 Vermelho Vibrante – 040168 Verde Primavera – 040169 Turquesa – 040170 Azul Meia-Noite.`, en: `S.T. Dupont partners with French artist Richard Orlinski for an exclusive collection where the power of sculptural gestures meets the precision of artisanal craftsmanship. Inspired by the iconic “Kong” motif and the wildness of nature, this collaboration brings a raw, contemporary energy to the Maison’s creations. Lighters and writing instruments become true works of art, enhanced by angular lines, contrasting textures, and vibrant colors. The “Red” line showcases exceptional technical craftsmanship, combining a new brushed gold finish with a “Kong” motif created in metal filigree and a 1970s-inspired guilloché pattern that produces a sense of movement in the material. These refined techniques are applied to the Ligne 2 lighter and Line D Eternity pen in red and gold, delivering a signature that is both precise and sculptural. Line D Eternity Large fountain pen with diagonal red lacquer guilloché, adorned with the brushed gold “Kong” motif. Gold finishes. Articulated Sword clip. Wings nib in 14K solid gold. Piston included. Also available in roller and fountain pen versions. This fountain pen comes with a medium nib, providing an approximate writing size of 0.55 mm. Associated refills: Ink cartridges: 040112 Blue – 040110 Black – 040362 Red – 040363 Green – 040364 Turquoise Inkwells: 040165 Black – 040166 Royal Blue – 040167 Vibrant Red – 040168 Spring Green – 040169 Turquoise – 040170 Midnight Blue` },
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
    description: { pt: `A S.T. Dupont celebra a ancestral arte japonesa do Maki-e. Decorada à mão pelos nossos artífices parceiros da Wajimaya Zenni no Japão, cada peça é ornamentada com pó de ouro e paládio representando símbolos tradicionais japoneses, e assinada «Zenni». A colecção Ryusui Shunju celebra a harmonia do ciclo da natureza. Caneta de tinta permanente Line D Eternity XL em laca S.T. Dupont preta e acabamentos dourados. Decoração Ryusui Shunju em pó de ouro, laca e madrepérola. Bico em ouro de 14 quilates. Êmbolo incluído. Cartuchos de tinta: 040112 Azul - 040110 Preta - 040362 Vermelha - 040363 Verde - 040364 Turquesa. Tinteiros: 040165 Preto Intenso - 040166 Azul Real - 040167 Vermelho Flamejante - 040168 Verde Primavera - 040169 Turquesa - 040170 Azul-Noite.`, en: `S.T. Dupont celebrates the ancestral Japanese art of Maki-e. Decorated by hand by our partner artisans from Wajimaya Zenni in Japan, each piece is adorned with gold and palladium powder representing traditional Japanese symbols and signed "Zenni". The Ryusui Shunju collection celebrates the harmony of the cycle of nature. Fountain pen Line D Eternity XL in S.T. lacquer Dupont black and gold finishes. Ryusui Shunju decoration in gold powder, lacquer and mother-of-pearl. 14-carat gold nib. Piston included. Ink cartridges: 040112 Blue - 040110 Black - 040362 Red - 040363 Green - 040364 Turquoise Inkwell: 040165 Intense black - 040166 Royal blue -040167 Flamboyant red - 040168 Spring green - 040169 Turquoise - 040170 Night blue` },
    collection: `Eternity`,
    categorySlug: "escrita",
    image: `/products/eternity-maki-e/420151XL.webp`,
    variants: [
      { sku: `420151XL`, name: { pt: `Eternity · Maki-e — Castanho`, en: `Eternity · Maki E — Brown` }, priceCents: 506000, currency: "EUR", attributes: { color: { label: { pt: `Castanho`, en: `Brown` }, hex: ["#6b4a2a"] } }, image: `/products/eternity-maki-e/420151XL.webp`, images: [`/products/eternity-maki-e/420151XL.webp`, `/products/eternity-maki-e/420151XL-2.webp`, `/products/eternity-maki-e/420151XL-3.webp`, `/products/eternity-maki-e/420151XL-4.webp`] },
      { sku: `420150XL`, name: { pt: `Eternity · Maki-e — Castanho`, en: `Eternity · Maki E — Brown` }, priceCents: 685400, currency: "EUR", attributes: { color: { label: { pt: `Castanho`, en: `Brown` }, hex: ["#6b4a2a"] } }, image: `/products/eternity-maki-e/420150XL.webp`, images: [`/products/eternity-maki-e/420150XL.webp`, `/products/eternity-maki-e/420150XL-2.webp`, `/products/eternity-maki-e/420150XL-3.webp`, `/products/eternity-maki-e/420150XL-4.webp`] }
    ],
  },
  {
    slug: `popote-2`,
    name: { pt: `Line D Eternity · Popoté`, en: `Line D Eternity · Popoté` },
    description: { pt: `Uma técnica emblemática da Maison S.T. Dupont, a técnica dita Popoté joga com a matéria e a luz. Recorrendo a um estampilhão especial, o artífice aplica toques irregulares sobre a laca, criando um efeito pictórico em que a superfície parece vibrar sob a luz. Cada gesto, simultaneamente preciso e aleatório, revela uma profundidade única. Caneta de tinta permanente Line D Eternity Médio em laca Urushi preta com decoração Popoté e acabamentos em paládio. Bico em ouro maciço de 14 quilates. Conversor de êmbolo incluído. Clip Sword articulado. Disponível nas versões rollerball e tinta permanente. Esta caneta de tinta permanente é fornecida com um bico médio, para um traço de escrita de aproximadamente 0,55 mm. Recargas compatíveis: Cartuchos de tinta: 040112 Azul - 040110 Preta - 040362 Vermelha - 040363 Verde - 040364 Turquesa. Tinteiros: 040165 Preto - 040166 Azul Real - 040167 Vermelho Flamejante - 040168 Verde Primavera - 040169 Turquesa - 040170 Azul Meia-Noite.`, en: `An emblematic technique of the S.T. Dupont house, the so-called Popoté technique plays with material and light. Using a special stamp, the craftsman applies irregular touches to the lacquer, creating a painterly effect where the surface seems to vibrate under the light. Each gesture, both precise and random, reveals a unique depth. Line D Eternity medium fountain pen in black Urushi lacquer with Popoté décor and palladium finishes. 14-carat solid gold nib. Piston converter included. Articulated Sword clip. Available in rollerball and fountain pen versions. This fountain pen comes with a medium nib, for a line width of approximately 0.55 mm. Compatible refills: Ink cartridges: 040112 Blue - 040110 Black - 040362 Red - 040363 Green - 040364 Turquoise Ink bottles: 040165 Black - 040166 Royal Blue - 040167 Flamboyant Red - 040168 Spring Green - 040169 Turquoise - 040170 Midnight Blue` },
    collection: `Line D Eternity`,
    categorySlug: "escrita",
    image: `/products/popote-2/420317L.webp`,
    variants: [
      { sku: `420317L`, name: { pt: `Line D Eternity · Popoté — Azul`, en: `Line D Eternity · Popoté — Blue` }, priceCents: 174340, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/popote-2/420317L.webp`, images: [`/products/popote-2/420317L.webp`, `/products/popote-2/420317L-2.webp`, `/products/popote-2/420317L-3.webp`, `/products/popote-2/420317L-4.webp`] },
      { sku: `422317L`, name: { pt: `Line D Eternity · Popoté — Azul`, en: `Line D Eternity · Popoté — Blue` }, priceCents: 155940, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/popote-2/422317L.webp`, images: [`/products/popote-2/422317L.webp`, `/products/popote-2/422317L-2.webp`, `/products/popote-2/422317L-3.webp`, `/products/popote-2/422317L-4.webp`] },
      { sku: `422316M`, name: { pt: `Line D Eternity · Popoté — Preto`, en: `Line D Eternity · Popoté — Black` }, priceCents: 146740, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/popote-2/422316M.webp`, images: [`/products/popote-2/422316M.webp`, `/products/popote-2/422316M-2.webp`, `/products/popote-2/422316M-3.webp`, `/products/popote-2/422316M-4.webp`] },
      { sku: `420316M`, name: { pt: `Line D Eternity · Popoté — Preto`, en: `Line D Eternity · Popoté — Black` }, priceCents: 165140, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/popote-2/420316M.webp`, images: [`/products/popote-2/420316M.webp`, `/products/popote-2/420316M-2.webp`, `/products/popote-2/420316M-3.webp`, `/products/popote-2/420316M-4.webp`] },
      { sku: `420318L`, name: { pt: `Line D Eternity · Popoté — Vermelho`, en: `Line D Eternity · Popoté — Red` }, priceCents: 174340, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/popote-2/420318L.webp`, images: [`/products/popote-2/420318L.webp`, `/products/popote-2/420318L-2.webp`, `/products/popote-2/420318L-3.webp`, `/products/popote-2/420318L-4.webp`] },
      { sku: `422318L`, name: { pt: `Line D Eternity · Popoté — Vermelho`, en: `Line D Eternity · Popoté — Red` }, priceCents: 155940, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/popote-2/422318L.webp`, images: [`/products/popote-2/422318L.webp`, `/products/popote-2/422318L-2.webp`, `/products/popote-2/422318L-3.webp`, `/products/popote-2/422318L-4.webp`] }
    ],
  },
  {
    slug: `writing-instrument`,
    name: { pt: `Escrita`, en: `Writing Instrument` },
    description: { pt: `A S.T. Dupont apresenta o Mini Pen Necklace: a fusão tendência entre funcionalidade, elegância e savoir-faire. Este inovador instrumento de escrita conjuga a praticidade de uma esferográfica, o requinte da joalharia e o savoir-faire da Maison. Mini Pen Necklace em laca Bordéus com tampa dourada ponta de diamante. Corrente ajustável em três comprimentos diferentes: 80 / 85 / 90 cm. Recarga associada: 040999 Preta`, en: `S.T. Dupont presents the Mini Pen Necklace: the trendy fusion of functionality, elegance, and craftsmanship. This innovative writing instrument combines the practicality of a ballpoint pen, the refinement of jewelry, and the Maison’s expertise. Mini Pen Necklace in burgundy lacquer with a gold diamond-tip cap. Adjustable chain with three different lengths: 80 / 85 / 90 cm. Associated refill: 040999 Black` },
    collection: `Escrita`,
    categorySlug: "escrita",
    image: `/products/writing-instrument/700008.webp`,
    variants: [
      { sku: `700008`, name: { pt: `Escrita — S.t. & Dupont`, en: `Writing Instrument — S.T. Dupont` }, priceCents: 39100, currency: "EUR", attributes: { color: { label: { pt: `S.t. & Dupont`, en: `S.T. Dupont` }, hex: ["#7a7d83"] } }, image: `/products/writing-instrument/700008.webp`, images: [`/products/writing-instrument/700008.webp`, `/products/writing-instrument/700008-2.webp`, `/products/writing-instrument/700008-3.webp`, `/products/writing-instrument/700008-4.webp`] },
      { sku: `700006`, name: { pt: `Escrita — S.t. & Dupont`, en: `Writing Instrument — S.T. Dupont` }, priceCents: 39100, currency: "EUR", attributes: { color: { label: { pt: `S.t. & Dupont`, en: `S.T. Dupont` }, hex: ["#7a7d83"] } }, image: `/products/writing-instrument/700006.webp`, images: [`/products/writing-instrument/700006.webp`, `/products/writing-instrument/700006-2.webp`, `/products/writing-instrument/700006-3.webp`, `/products/writing-instrument/700006-4.webp`] },
      { sku: `700005`, name: { pt: `Escrita — S.t. & Dupont`, en: `Writing Instrument — S.T. Dupont` }, priceCents: 39100, currency: "EUR", attributes: { color: { label: { pt: `S.t. & Dupont`, en: `S.T. Dupont` }, hex: ["#7a7d83"] } }, image: `/products/writing-instrument/700005.webp`, images: [`/products/writing-instrument/700005.webp`, `/products/writing-instrument/700005-2.webp`, `/products/writing-instrument/700005-3.webp`, `/products/writing-instrument/700005-4.webp`] }
    ],
  },
  {
    slug: `eternity-horsemane`,
    name: { pt: `Eternity · Horse Mane`, en: `Eternity · Horsemane` },
    description: { pt: `Inspirada no Ano Lunar do Cavalo de 2026, a colecção Horsemane apresenta um guilloché «criniera» único sob laca vermelha ou preta. Caneta de tinta permanente Line D Eternity Large em laca preta com guilloché «horse mane». Acabamentos banhados a paládio. Bico em ouro de 14 quilates. Êmbolo incluído. Clip Sword articulado. Disponível nas versões rollerball e tinta permanente. Cartuchos de tinta: 040112 Azul – 040110 Preta – 040362 Vermelha – 040363 Verde – 040364 Turquesa. Tinteiros: 040165 Preto Intenso – 040166 Azul Real – 040167 Vermelho Flamejante – 040168 Verde Primavera – 040169 Turquesa – 040170 Azul-Noite.`, en: `Inspired by the 2026 Lunar Year of the Horse, the Horsemane Collection introduces a unique “mane” guilloché under red or black lacquer. Line D Eternity Large fountain pen in black lacquer with “horse mane” guilloché. Palladium-plated finishes. 14-carat gold nib. Piston included. Articulated Sword clip. Available in rollerball and fountain pen versions. Ink cartridges: 040112 Blue – 040110 Black – 040362 Red – 040363 Green – 040364 Turquoise Inkwells: 040165 Intense Black – 040166 Royal Blue – 040167 Flamboyant Red – 040168 Spring Green – 040169 Turquoise – 040170 Night Blue` },
    collection: `Eternity`,
    categorySlug: "escrita",
    image: `/products/eternity-horsemane/420090L.webp`,
    variants: [
      { sku: `420090L`, name: { pt: `Eternity · Horse Mane — Preto`, en: `Eternity · Horsemane — Black` }, priceCents: 119140, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/eternity-horsemane/420090L.webp`, images: [`/products/eternity-horsemane/420090L.webp`, `/products/eternity-horsemane/420090L-2.webp`, `/products/eternity-horsemane/420090L-3.webp`, `/products/eternity-horsemane/420090L-4.webp`] },
      { sku: `422090L`, name: { pt: `Eternity · Horse Mane — Preto`, en: `Eternity · Horsemane — Black` }, priceCents: 100740, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/eternity-horsemane/422090L.webp`, images: [`/products/eternity-horsemane/422090L.webp`, `/products/eternity-horsemane/422090L-2.webp`, `/products/eternity-horsemane/422090L-3.webp`, `/products/eternity-horsemane/422090L-4.webp`] },
      { sku: `420089L`, name: { pt: `Eternity · Horse Mane — Vermelho`, en: `Eternity · Horsemane — Red` }, priceCents: 119140, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/eternity-horsemane/420089L.webp`, images: [`/products/eternity-horsemane/420089L.webp`, `/products/eternity-horsemane/420089L-2.webp`, `/products/eternity-horsemane/420089L-3.webp`, `/products/eternity-horsemane/420089L-4.webp`] },
      { sku: `422089L`, name: { pt: `Eternity · Horse Mane — Vermelho`, en: `Eternity · Horsemane — Red` }, priceCents: 100740, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/eternity-horsemane/422089L.webp`, images: [`/products/eternity-horsemane/422089L.webp`, `/products/eternity-horsemane/422089L-2.webp`, `/products/eternity-horsemane/422089L-3.webp`, `/products/eternity-horsemane/422089L-4.webp`] }
    ],
  },
  {
    slug: `defi-milenium`,
    name: { pt: `Défi Millennium`, en: `Defi milenium` },
    description: { pt: `A colecção Défi Millennium foi revisitada com a adição de dois novos acabamentos, reflectindo um equilíbrio perfeito entre tradição e inovação. Estes novos modelos, em laca preta brilhante e crómio escovado, transmitem o espírito atlético da colecção, mantendo as assinaturas icónicas da Maison. Aerodinâmica e precisa, esta caneta cativante seduz pela sua escrita fluida e estilo desportivo. Recargas: 040112 Azul 040110 Preta 040362 Vermelha 040363 Verde 040364 Turquesa. Aviso: Instrumento de escrita com tampa magnética. Acessórios com ímanes não são recomendados a grávidas, a pessoas com implantes metálicos ou dispositivos médicos como pacemakers, bombas de insulina, etc. Desaconselhamos igualmente o contacto prolongado do instrumento de escrita com cartões de crédito, relógios mecânicos e de quartzo, telemóveis e quaisquer outros dispositivos magnéticos, uma vez que o campo magnético por ele emitido pode danificar dispositivos sensíveis. Este produto não é um brinquedo. Manter fora do alcance das crianças.`, en: `The Défi Millenium collection has been revisited with the addition of two new finishes, reflecting a perfect balance between tradition and innovation. These new models, in a shiny black lacquer and brushed chrome, convey the collection’s athletic spirit while maintaining the Maison’s iconic signatures. Streamlined and precise, this captivating pen is quite the charm with its fluid writing and sporty style. Refills: 040112 Blue 040110 Black 040362 Red 040363 Green 040364 Turquoise Warning: Writing instrument with magnetic cap. Accessories with magnets are not recommended for those who are pregnant, have metallic implants or medical devices such as pacemakers, insulin pumps, etc. We also advise against bringing the writing instrument into prolonged contact with credit cards, mechanical and quartz watches, mobile phones and any other magnetic devices, as the magnetic field it emits could damage sensitive devices. This product is not a toy. Keep out of reach of children.` },
    collection: `Défi Millennium`,
    categorySlug: "escrita",
    image: `/products/defi-milenium/400003.webp`,
    variants: [
      { sku: `400003`, name: { pt: `Défi Millennium — Preto`, en: `Defi milenium — Black` }, priceCents: 41400, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/defi-milenium/400003.webp`, images: [`/products/defi-milenium/400003.webp`, `/products/defi-milenium/400003-2.webp`, `/products/defi-milenium/400003-3.webp`, `/products/defi-milenium/400003-4.webp`] },
      { sku: `402034`, name: { pt: `Défi Millennium — Néon & Laranja`, en: `Defi milenium — Neon Orange` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Néon & Laranja`, en: `Neon Orange` }, hex: ["#aef043", "#c4642d"] } }, image: `/products/defi-milenium/402034.webp`, images: [`/products/defi-milenium/402034.webp`, `/products/defi-milenium/402034-2.webp`, `/products/defi-milenium/402034-3.webp`, `/products/defi-milenium/402034-4.webp`] },
      { sku: `400004`, name: { pt: `Défi Millennium — Prata`, en: `Defi milenium — Silver` }, priceCents: 41400, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/defi-milenium/400004.webp`, images: [`/products/defi-milenium/400004.webp`, `/products/defi-milenium/400004-2.webp`] },
      { sku: `405004`, name: { pt: `Défi Millennium — Preto & Prata`, en: `Defi milenium — Black & Silver` }, priceCents: 32200, currency: "EUR", attributes: { color: { label: { pt: `Preto & Prata`, en: `Black & Silver` }, hex: ["#15171c", "#c9ccd1"] } }, image: `/products/defi-milenium/405004.webp`, images: [`/products/defi-milenium/405004.webp`, `/products/defi-milenium/405004-2.webp`, `/products/defi-milenium/405004-3.webp`, `/products/defi-milenium/405004-4.webp`] },
      { sku: `405003`, name: { pt: `Défi Millennium — Preto`, en: `Defi milenium — Black` }, priceCents: 32200, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/defi-milenium/405003.webp`, images: [`/products/defi-milenium/405003.webp`, `/products/defi-milenium/405003-2.webp`, `/products/defi-milenium/405003-3.webp`, `/products/defi-milenium/405003-4.webp`] },
      { sku: `402003`, name: { pt: `Défi Millennium — Preto`, en: `Defi milenium — Black` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/defi-milenium/402003.webp`, images: [`/products/defi-milenium/402003.webp`, `/products/defi-milenium/402003-2.webp`, `/products/defi-milenium/402003-3.webp`, `/products/defi-milenium/402003-4.webp`] },
      { sku: `400739`, name: { pt: `Défi Millennium — Vermelho`, en: `Defi milenium — Red` }, priceCents: 41400, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/defi-milenium/400739.webp`, images: [`/products/defi-milenium/400739.webp`, `/products/defi-milenium/400739-2.webp`, `/products/defi-milenium/400739-3.webp`, `/products/defi-milenium/400739-4.webp`] },
      { sku: `400736`, name: { pt: `Défi Millennium — Azul & Escuro & Azul`, en: `Defi milenium — Blue & Dark Blue` }, priceCents: 41400, currency: "EUR", attributes: { color: { label: { pt: `Azul & Escuro & Azul`, en: `Blue & Dark Blue` }, hex: ["#1f3c66", "#2a2d34"] } }, image: `/products/defi-milenium/400736.webp`, images: [`/products/defi-milenium/400736.webp`, `/products/defi-milenium/400736-2.webp`, `/products/defi-milenium/400736-3.webp`, `/products/defi-milenium/400736-4.webp`] },
      { sku: `402736`, name: { pt: `Défi Millennium — Azul & Escuro & Azul`, en: `Defi milenium — Blue & Dark Blue` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Azul & Escuro & Azul`, en: `Blue & Dark Blue` }, hex: ["#1f3c66", "#2a2d34"] } }, image: `/products/defi-milenium/402736.webp`, images: [`/products/defi-milenium/402736.webp`, `/products/defi-milenium/402736-2.webp`, `/products/defi-milenium/402736-3.webp`, `/products/defi-milenium/402736-4.webp`] },
      { sku: `402739`, name: { pt: `Défi Millennium — Vermelho`, en: `Defi milenium — Red` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/defi-milenium/402739.webp`, images: [`/products/defi-milenium/402739.webp`, `/products/defi-milenium/402739-2.webp`, `/products/defi-milenium/402739-3.webp`, `/products/defi-milenium/402739-4.webp`] },
      { sku: `400719`, name: { pt: `Défi Millennium — Preto & Gun Metal & Prata`, en: `Defi milenium — Black & Gunmetal & Silver` }, priceCents: 41400, currency: "EUR", attributes: { color: { label: { pt: `Preto & Gun Metal & Prata`, en: `Black & Gunmetal & Silver` }, hex: ["#15171c", "#4b4f55"] } }, image: `/products/defi-milenium/400719.webp`, images: [`/products/defi-milenium/400719.webp`, `/products/defi-milenium/400719-2.webp`, `/products/defi-milenium/400719-3.webp`, `/products/defi-milenium/400719-4.webp`] },
      { sku: `400706`, name: { pt: `Défi Millennium — Preto & Prata`, en: `Defi milenium — Black & Silver` }, priceCents: 41400, currency: "EUR", attributes: { color: { label: { pt: `Preto & Prata`, en: `Black & Silver` }, hex: ["#15171c", "#c9ccd1"] } }, image: `/products/defi-milenium/400706.webp`, images: [`/products/defi-milenium/400706.webp`, `/products/defi-milenium/400706-2.webp`, `/products/defi-milenium/400706-3.webp`, `/products/defi-milenium/400706-4.webp`] },
      { sku: `402737`, name: { pt: `Défi Millennium — Laranja`, en: `Defi milenium — Orange` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Laranja`, en: `Orange` }, hex: ["#c4642d"] } }, image: `/products/defi-milenium/402737.webp`, images: [`/products/defi-milenium/402737.webp`, `/products/defi-milenium/402737-2.webp`, `/products/defi-milenium/402737-3.webp`, `/products/defi-milenium/402737-4.webp`] },
      { sku: `402719`, name: { pt: `Défi Millennium — Preto & Gun Metal`, en: `Defi milenium — Black & Gunmetal` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Preto & Gun Metal`, en: `Black & Gunmetal` }, hex: ["#15171c", "#4b4f55"] } }, image: `/products/defi-milenium/402719.webp`, images: [`/products/defi-milenium/402719.webp`, `/products/defi-milenium/402719-2.webp`, `/products/defi-milenium/402719-3.webp`, `/products/defi-milenium/402719-4.webp`] },
      { sku: `402706`, name: { pt: `Défi Millennium — Preto & Prata`, en: `Defi milenium — Black & Silver` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Preto & Prata`, en: `Black & Silver` }, hex: ["#15171c", "#c9ccd1"] } }, image: `/products/defi-milenium/402706.webp`, images: [`/products/defi-milenium/402706.webp`, `/products/defi-milenium/402706-2.webp`, `/products/defi-milenium/402706-3.webp`, `/products/defi-milenium/402706-4.webp`] },
      { sku: `405739`, name: { pt: `Défi Millennium — Vermelho`, en: `Defi milenium — Red` }, priceCents: 32200, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/defi-milenium/405739.webp`, images: [`/products/defi-milenium/405739.webp`, `/products/defi-milenium/405739-2.webp`, `/products/defi-milenium/405739-3.webp`, `/products/defi-milenium/405739-4.webp`] },
      { sku: `405737`, name: { pt: `Défi Millennium — Laranja`, en: `Defi milenium — Orange` }, priceCents: 32200, currency: "EUR", attributes: { color: { label: { pt: `Laranja`, en: `Orange` }, hex: ["#c4642d"] } }, image: `/products/defi-milenium/405737.webp`, images: [`/products/defi-milenium/405737.webp`, `/products/defi-milenium/405737-2.webp`, `/products/defi-milenium/405737-3.webp`, `/products/defi-milenium/405737-4.webp`] },
      { sku: `405736`, name: { pt: `Défi Millennium — Azul & Escuro & Azul`, en: `Defi milenium — Blue & Dark Blue` }, priceCents: 32200, currency: "EUR", attributes: { color: { label: { pt: `Azul & Escuro & Azul`, en: `Blue & Dark Blue` }, hex: ["#1f3c66", "#2a2d34"] } }, image: `/products/defi-milenium/405736.webp`, images: [`/products/defi-milenium/405736.webp`, `/products/defi-milenium/405736-2.webp`, `/products/defi-milenium/405736-3.webp`, `/products/defi-milenium/405736-4.webp`] },
      { sku: `405719`, name: { pt: `Défi Millennium — Preto & Gun Metal & Prata`, en: `Defi milenium — Black & Gunmetal & Silver` }, priceCents: 32200, currency: "EUR", attributes: { color: { label: { pt: `Preto & Gun Metal & Prata`, en: `Black & Gunmetal & Silver` }, hex: ["#15171c", "#4b4f55"] } }, image: `/products/defi-milenium/405719.webp`, images: [`/products/defi-milenium/405719.webp`, `/products/defi-milenium/405719-2.webp`, `/products/defi-milenium/405719-3.webp`, `/products/defi-milenium/405719-4.webp`] },
      { sku: `405706`, name: { pt: `Défi Millennium — Preto & Prata`, en: `Defi milenium — Black & Silver` }, priceCents: 32200, currency: "EUR", attributes: { color: { label: { pt: `Preto & Prata`, en: `Black & Silver` }, hex: ["#15171c", "#c9ccd1"] } }, image: `/products/defi-milenium/405706.webp`, images: [`/products/defi-milenium/405706.webp`, `/products/defi-milenium/405706-2.webp`, `/products/defi-milenium/405706-3.webp`, `/products/defi-milenium/405706-4.webp`] },
      // Rescued from the dropped curated `defi-millenium` (typo collection) —
      // the three Rollerball colourways the user wanted to keep when the
      // duplicate category was removed: blue with chrome, black with matt
      // black, red with chrome. Image folders stay at /products/defi-
      // millenium/DM-RB-<code>/ so the existing photographed galleries
      // continue to work.
      { sku: `DM-RB-NVC`, name: { pt: `Défi Millennium — Laca Azul Marinho & Crómio`, en: `Defi milenium — Navy Blue Lacquer & Chrome` }, priceCents: 38500, currency: "EUR", attributes: { color: { label: { pt: `Laca Azul Marinho & Crómio`, en: `Navy Blue Lacquer & Chrome` }, hex: ["#1b2a44", "#c9ccd1"] } }, image: `/products/defi-millenium/DM-RB-NVC/front.jpg`, images: [`/products/defi-millenium/DM-RB-NVC/front.jpg`, `/products/defi-millenium/DM-RB-NVC/back.jpg`, `/products/defi-millenium/DM-RB-NVC/closeup.jpg`, `/products/defi-millenium/DM-RB-NVC/closeup2.jpg`] },
      { sku: `DM-RB-BMB`, name: { pt: `Défi Millennium — Preto & Preto Mate`, en: `Defi milenium — Black & Matt Black` }, priceCents: 38500, currency: "EUR", attributes: { color: { label: { pt: `Preto & Preto Mate`, en: `Black & Matt Black` }, hex: ["#15171c", "#2a2c30"] } }, image: `/products/defi-millenium/DM-RB-BMB/front.jpg`, images: [`/products/defi-millenium/DM-RB-BMB/front.jpg`, `/products/defi-millenium/DM-RB-BMB/back.jpg`, `/products/defi-millenium/DM-RB-BMB/closeup.jpg`, `/products/defi-millenium/DM-RB-BMB/closeup2.jpg`] },
      { sku: `DM-RB-MRC`, name: { pt: `Défi Millennium — Vermelho Mate & Crómio`, en: `Defi milenium — Matt Red & Chrome` }, priceCents: 38500, currency: "EUR", attributes: { color: { label: { pt: `Vermelho Mate & Crómio`, en: `Matt Red & Chrome` }, hex: ["#7d2b27", "#c9ccd1"] } }, image: `/products/defi-millenium/DM-RB-MRC/front.jpg`, images: [`/products/defi-millenium/DM-RB-MRC/front.jpg`, `/products/defi-millenium/DM-RB-MRC/back.jpg`, `/products/defi-millenium/DM-RB-MRC/closeup.jpg`, `/products/defi-millenium/DM-RB-MRC/closeup2.jpg`] }
    ],
  },
  {
    slug: `d-initial`,
    name: { pt: `Initial`, en: `D Initial` },
    description: { pt: `A S.T. Dupont enriquece as suas colecções Line D Eternity e Initial com duas sofisticadas novas cores: laca preta e acabamentos pretos para ambos os modelos, e laca branca e acabamentos dourados para a nova Initial. Caneta de tinta permanente Initial em laca branca e acabamento dourado. Bico Wings em aço inoxidável banhado a ouro. Êmbolo incluído. Clip Sword e topo lacado. Disponível nas versões esferográfica, rollerball e tinta permanente. Recargas associadas: Cartuchos de tinta: 040112 Azul - 040110 Preta - 040362 Vermelha - 040363 Verde - 040364 Turquesa. Tinteiros: 040165 Preto - 040166 Azul Real - 040167 Vermelho Flamejante - 040168 Verde Primavera - 040169 Turquesa - 040170 Azul-Noite. Esta caneta de tinta permanente é fornecida com um bico médio, para um traço de escrita de aproximadamente 0,55 mm.`, en: `S.T. Dupont enriches its Line D Eternity and Initial collections with two sophisticated new colors: black lacquer and black finishes for both models, and white lacquer and gold finishes for the new Initial. Initial fountain pen in white lacquer and gold finish. Wings gold-plated stainless steel nib. Piston included. Sword clip and lacquered top. Available in ballpoint, rollerball and fountain versions. Related refills: Ink catridges: 040112 Blue - 040110 Black - 040362 Red - 040363 Green - 040364 Turquoise Ink fountains: 040165 Black - 040166 Royal Blue - 040167 Flamboyant Red - 040168 Spring Green - 040169 Turquoise - 040170 Night Blue This fountain pen comes with a medium nib, for a writing size of apporox. 0.55 mm.` },
    collection: `Initial`,
    categorySlug: "escrita",
    image: `/products/d-initial/275217.webp`,
    variants: [
      { sku: `275217`, name: { pt: `Initial — Branco`, en: `D Initial — White` }, priceCents: 25300, currency: "EUR", attributes: { color: { label: { pt: `Branco`, en: `White` }, hex: ["#f3efe6"] } }, image: `/products/d-initial/275217.webp`, images: [`/products/d-initial/275217.webp`, `/products/d-initial/275217-2.webp`, `/products/d-initial/275217-3.webp`, `/products/d-initial/275217-4.webp`] },
      { sku: `275115`, name: { pt: `Initial — Preto`, en: `D Initial — Black` }, priceCents: 25300, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/d-initial/275115.webp`, images: [`/products/d-initial/275115.webp`, `/products/d-initial/275115-2.webp`, `/products/d-initial/275115-3.webp`, `/products/d-initial/275115-4.webp`] },
      { sku: `275202`, name: { pt: `Initial — Dourado`, en: `D Initial — Golden` }, priceCents: 25300, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/d-initial/275202.webp`, images: [`/products/d-initial/275202.webp`, `/products/d-initial/275202-2.webp`, `/products/d-initial/275202-3.webp`, `/products/d-initial/275202-4.webp`] },
      { sku: `275205`, name: { pt: `Initial — Escuro & Azul`, en: `D Initial — Dark Blue` }, priceCents: 25300, currency: "EUR", attributes: { color: { label: { pt: `Escuro & Azul`, en: `Dark Blue` }, hex: ["#2a2d34", "#1f3c66"] } }, image: `/products/d-initial/275205.webp`, images: [`/products/d-initial/275205.webp`, `/products/d-initial/275205-2.webp`, `/products/d-initial/275205-3.webp`, `/products/d-initial/275205-4.webp`] },
      { sku: `275200`, name: { pt: `Initial — Prata`, en: `D Initial — Silver` }, priceCents: 25300, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/d-initial/275200.webp`, images: [`/products/d-initial/275200.webp`, `/products/d-initial/275200-2.webp`, `/products/d-initial/275200-3.webp`, `/products/d-initial/275200-4.webp`] },
      { sku: `272216`, name: { pt: `Initial — Preto`, en: `D Initial — Black` }, priceCents: 31740, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/d-initial/272216.webp`, images: [`/products/d-initial/272216.webp`, `/products/d-initial/272216-2.webp`, `/products/d-initial/272216-3.webp`, `/products/d-initial/272216-4.webp`] },
      { sku: `272217`, name: { pt: `Initial — Branco`, en: `D Initial — White` }, priceCents: 31740, currency: "EUR", attributes: { color: { label: { pt: `Branco`, en: `White` }, hex: ["#f3efe6"] } }, image: `/products/d-initial/272217.webp`, images: [`/products/d-initial/272217.webp`, `/products/d-initial/272217-2.webp`, `/products/d-initial/272217-3.webp`, `/products/d-initial/272217-4.webp`] },
      { sku: `272205`, name: { pt: `Initial — Escuro & Azul`, en: `D Initial — Dark Blue` }, priceCents: 31740, currency: "EUR", attributes: { color: { label: { pt: `Escuro & Azul`, en: `Dark Blue` }, hex: ["#2a2d34", "#1f3c66"] } }, image: `/products/d-initial/272205.webp`, images: [`/products/d-initial/272205.webp`, `/products/d-initial/272205-2.webp`, `/products/d-initial/272205-3.webp`, `/products/d-initial/272205-4.webp`] },
      { sku: `272202`, name: { pt: `Initial — Dourado`, en: `D Initial — Golden` }, priceCents: 31740, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/d-initial/272202.webp`, images: [`/products/d-initial/272202.webp`, `/products/d-initial/272202-2.webp`, `/products/d-initial/272202-3.webp`, `/products/d-initial/272202-4.webp`] },
      { sku: `272201`, name: { pt: `Initial — Prata`, en: `D Initial — Silver` }, priceCents: 31740, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/d-initial/272201.webp`, images: [`/products/d-initial/272201.webp`, `/products/d-initial/272201-2.webp`, `/products/d-initial/272201-3.webp`, `/products/d-initial/272201-4.webp`] },
      { sku: `272200`, name: { pt: `Initial — Prata`, en: `D Initial — Silver` }, priceCents: 31740, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/d-initial/272200.webp`, images: [`/products/d-initial/272200.webp`, `/products/d-initial/272200-2.webp`, `/products/d-initial/272200-3.webp`, `/products/d-initial/272200-4.webp`] },
      { sku: `270216`, name: { pt: `Initial — Preto`, en: `D Initial — Black` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/d-initial/270216.webp`, images: [`/products/d-initial/270216.webp`, `/products/d-initial/270216-2.webp`, `/products/d-initial/270216-3.webp`, `/products/d-initial/270216-4.webp`] },
      { sku: `270217`, name: { pt: `Initial — Branco`, en: `D Initial — White` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Branco`, en: `White` }, hex: ["#f3efe6"] } }, image: `/products/d-initial/270217.webp`, images: [`/products/d-initial/270217.webp`, `/products/d-initial/270217-2.webp`, `/products/d-initial/270217-3.webp`, `/products/d-initial/270217-4.webp`] },
      { sku: `270202`, name: { pt: `Initial — Dourado`, en: `D Initial — Golden` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/d-initial/270202.webp`, images: [`/products/d-initial/270202.webp`, `/products/d-initial/270202-2.webp`, `/products/d-initial/270202-3.webp`, `/products/d-initial/270202-4.webp`] },
      { sku: `270201`, name: { pt: `Initial — Prata`, en: `D Initial — Silver` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/d-initial/270201.webp`, images: [`/products/d-initial/270201.webp`, `/products/d-initial/270201-2.webp`, `/products/d-initial/270201-3.webp`, `/products/d-initial/270201-4.webp`] },
      { sku: `270200`, name: { pt: `Initial — Prata`, en: `D Initial — Silver` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/d-initial/270200.webp`, images: [`/products/d-initial/270200.webp`, `/products/d-initial/270200-2.webp`, `/products/d-initial/270200-3.webp`, `/products/d-initial/270200-4.webp`] }
    ],
  },
  {
    slug: `d-initial-fire-x`,
    name: { pt: `Initial · Fire X`, en: `D Initial · Fire X` },
    description: { pt: `Inspirada na X-Bag, uma das malas da colecção de marroquinaria desenvolvida esta temporada pela S.T. Dupont, Fire X apresenta a sua reinterpretação da icónica ponta de chama sobre os clássicos da Maison. Esferográfica Initial decorada com o motivo Fire X e acabamentos em crómio. Fabricada na China. Recargas associadas: 040853 Azul - 040854 Preta - 040358 Rosa - 040359 Vermelha - 040360 Verde - 040361 Turquesa.`, en: `Inspired by the X-Bag, one of the bags from the leather goods collection developed this season by S.T. Dupont, Fire X presents its reinterpretation of the iconic flame tip on the classics of the House. Initial ballpoint pen decorated with the Fire X motif and chrome finishes. Manufactured in China. Associated refills: 040853 Blue - 040854 Black - 040358 Pink - 040359 Red - 040360 Green - 040361 Turquoise.` },
    collection: `Initial`,
    categorySlug: "escrita",
    image: `/products/d-initial-fire-x/275070.webp`,
    variants: [
      { sku: `275070`, name: { pt: `Initial · Fire X — Preto`, en: `D Initial · Fire X — Black` }, priceCents: 34500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/d-initial-fire-x/275070.webp`, images: [`/products/d-initial-fire-x/275070.webp`, `/products/d-initial-fire-x/275070-2.webp`, `/products/d-initial-fire-x/275070-3.webp`, `/products/d-initial-fire-x/275070-4.webp`] }
    ],
  },
  {
    slug: `marker-necklace`,
    name: { pt: `Colar Marker`, en: `marker necklace` },
    description: { pt: `Inspirada no sucesso do seu colar-isqueiro, a S.T. Dupont estendeu a gama deste objecto útil e distintivo com o colar-marcador. Um design original que faz da caneta um verdadeiro acessório de moda. Para mentes criativas, pensadores e artistas de graffiti, para todos os que precisam sempre de uma caneta. Munido de um marcador Sharpie mini, uma icónica marca das artes gráficas, é ornamentado com um padrão de guilloché icónico, a ponta de diamante inventada pelo ourives S.T. Dupont. Colar-marcador em guilloché Diamondhead com acabamento em crómio. Corrente ajustável em três comprimentos diferentes: 80/85/90 cm. Vendido com um marcador Sharpie Mini preto. Os marcadores Sharpie Mini não são vendidos pela S.T. Dupont, estando disponíveis no website Sharpie e em revendedores.`, en: `Inspired by the success of its lighter necklace, S.T. Dupont has extended the range of this useful and distinctive object with the marker necklace. An original design that makes the pen a true fashion accessory. For creative minds, thinkers and graffiti artists, for those who always need a pen. Featuring a Sharpie mini marker, an iconic graphic arts brand, it is adorned with an iconic guilloché pattern, the diamond tip invented by goldsmith S.T. Dupont. Diamondhead guillauche marker necklace in chrome finish. Adjustable chain in three different lengths 80/85/90 cm. Sold with a black Sharpie Mini marker. Sharpie Mini markers are not sold by S.T. Dupont, available on the Sharpie website and from retailers.` },
    collection: `Colar Marker`,
    categorySlug: "escrita",
    image: `/products/marker-necklace/700003.webp`,
    variants: [
      { sku: `700003`, name: { pt: `Colar Marker — Dourado`, en: `marker necklace — Golden` }, priceCents: 45540, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/marker-necklace/700003.webp`, images: [`/products/marker-necklace/700003.webp`, `/products/marker-necklace/700003-2.webp`, `/products/marker-necklace/700003-3.webp`, `/products/marker-necklace/700003-4.webp`] },
      { sku: `700002`, name: { pt: `Colar Marker — Prata`, en: `marker necklace — Silver` }, priceCents: 45540, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/marker-necklace/700002.webp`, images: [`/products/marker-necklace/700002.webp`, `/products/marker-necklace/700002-2.webp`, `/products/marker-necklace/700002-3.webp`, `/products/marker-necklace/700002-4.webp`] },
      { sku: `700004`, name: { pt: `Colar Marker — Preto`, en: `marker necklace — Black` }, priceCents: 45540, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/marker-necklace/700004.webp`, images: [`/products/marker-necklace/700004.webp`, `/products/marker-necklace/700004-2.webp`, `/products/marker-necklace/700004-3.webp`, `/products/marker-necklace/700004-4.webp`] }
    ],
  },
  {
    slug: `eternity`,
    name: { pt: `Eternity`, en: `Eternity` },
    description: { pt: `A S.T. Dupont enriquece as suas colecções Line D Eternity e Initial com duas sofisticadas novas cores: laca preta e acabamentos pretos para ambos os modelos, e laca branca e acabamentos dourados para assinalar o lançamento da nova Initial. Caneta de tinta permanente Line D Eternity Large em laca Dupont preta e acabamento preto acetinado. Clip Sword articulado. Bico Wings em ouro maciço de 14 quilates preto. Êmbolo incluído. Disponível nas versões esferográfica, rollerball e tinta permanente. Recargas associadas: Cartuchos de tinta: 040112 Azul - 040110 Preta - 040362 Vermelha - 040363 Verde - 040364 Turquesa. Tinteiros: 040165 Preto - 040166 Azul Real - 040167 Vermelho Flamejante - 040168 Verde Primavera - 040169 Turquesa - 040170 Azul Meia-Noite.`, en: `S.T. Dupont enriches its Line D Eternity and Initial collections with two sophisticated new colors: black lacquer and black finishes for both models, and white lacquer and gold finishes to mark the launch of the new Initial. Line D Eternity Large fountain pen in black Dupont lacquer and satin-finish black. Sword articulated clip. Black 14-carat solid gold Wings nib. Plunger included. Available in ballpoint, rollerball and nib versions. Related refills: Ink catridges: 040112 Blue - 040110 Black - 040362 Red - 040363 Green - 040364 Turquoise Inkwells: 040165 Black - 040166 Royal Blue - 040167 Flamboyant Red - 040168 Spring Green - 040169 Turquoise - 040170 Midnight Blue` },
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
    description: { pt: `Pela segunda vez, a S.T. Dupont e a Fender® unem-se para criar uma linha rock que conjuga o savoir-faire de ambas as casas. Os isqueiros Biggy, Slimmy e Twiggy, bem como a esferográfica Initial, adoptam a silhueta de uma Stratocaster® sobre fundo de laca preta. Esferográfica Initial em laca preta brilhante decorada com uma guitarra Stratocaster®. Acabamentos em crómio. Made in China. Recargas associadas: 040853 Azul - 040854 Preta - 040358 Rosa - 040359 Vermelha - 040360 Verde - 040361 Turquesa`, en: `For the second time, S.T. Dupont and Fender® are working together to create a rock line that combines the expertise of both companies. The Biggy, Slimmy and Twiggy lighters, as well as the Initial ballpoint pen take on the silhouette of a Stratocaster® on a black lacquer background. Initial ballpoint pen in glossy black lacquer decorated with a Stratoscaster® guitar. Chrome finishes. Made in China. Related refills: 040853 Blue - 040854 Black - 040358 Pink - 040359 Red - 040360 Green - 040361 Turquoise` },
    collection: `Initial`,
    categorySlug: "escrita",
    image: `/products/d-initial-fender/275175.webp`,
    variants: [
      { sku: `275175`, name: { pt: `Initial · Fender — Preto`, en: `D Initial · Fender — Black` }, priceCents: 41400, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/d-initial-fender/275175.webp`, images: [`/products/d-initial-fender/275175.webp`, `/products/d-initial-fender/275175-2.webp`, `/products/d-initial-fender/275175-3.webp`, `/products/d-initial-fender/275175-4.webp`] }
    ],
  },
  {
    slug: `eternity-fender`,
    name: { pt: `Eternity · Fender`, en: `Eternity · Fender` },
    description: { pt: `A Fender, a mais famosa marca de guitarras, abre uma loja no animado bairro de Harajuku, em Tóquio. Por esta ocasião, e pela segunda vez, a S.T. Dupont e a Fender colaboram, imaginando uma linha rock inspirada no savoir-faire de ambas as casas e também no Japão. Com o seu trabalho da laca inspirado no kintsugi, e ainda o regresso de um antigo savoir-faire com pó de ouro aplicado à mão, esta colaboração faz seu o universo criativo da música. Caixa composta por uma caneta Line D Eternity Large e um colar Médiator. Caneta de tinta permanente Line D Eternity Large Kintsugi preta e dourada com pó de ouro cintilante. Acabamentos dourados. Tampa com logótipo Fender® em laca dourada. Clip em forma de cabeça de guitarra Stratocaster®. Bico Wings em ouro maciço de 14 quilates. Êmbolo incluído. Disponível nas versões rollerball e tinta permanente. Recargas associadas: Cartuchos de tinta: 040112 Azul - 040110 Preta - 040362 Vermelha - 040363 Verde - 040364 Turquesa. Tinteiros: 040165 Preto - 040166 Azul Real - 040167 Vermelho Flamejante - 040168 Verde Primavera - 040169 Turquesa - 040170 Azul Meia-Noite. Esta caneta de tinta permanente é fornecida com um bico médio, para um traço de escrita de aproximadamente 0,55 mm. Colar Médiator gravado com duas guitarras Stratocaster® e corrente ajustável em três comprimentos diferentes: 80/85/90 cm.`, en: `Fender, the most famous guitar brand opens a shop in the lively Harajuku district of Tokyo. On this occasion, and for the second time, S.T. Dupont and Fender collaborate, imagining a rock line inspired by the know-how of both houses, as well as Japan. With his work of the lacquer inspired by kintsugi, but also the return of an ancient know-how with gold powder applied by hand, this collaboration makes its own the creativity of the musical universe. Box composed of a large Line D Eternity pen and a Médiator necklace. Line D Eternity large black and gold Kintsugi fountain pen with gold powder glitter. Golden finishes. Hood with gold lacquered Fender® logo. Stratocaster® guitar neck clip. Plume Wings in solid gold 14 carats. Piston included. Available in roller and feather version. Associated refills: Ink tags: 040112 Blue - 040110 Black - 040362 Red - 040363 Green - 040364 Turquoise Inkwell: 040165 Black - 040166 Royal Blue - 040167 Flamboyant Red - 040168 Spring Green - 040169 Turquoise - 040170 Midnight Blue This fountain pen comes with a medium nib, for a writing size of apporox. 0.55 mm. Médiator necklace engraved with two Stratoscaster® guitars and adjustable chain in three different lengths 80/85/90 cm.` },
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
    description: { pt: `Tinteiro de 50 ml em azul real. Tinta apagável. Compatível com o êmbolo ref. 408812.`, en: `50mL inkwell in royal blue. Erasable ink. Compatible with piston ref. 408812.` },
    collection: `Tinteiro`,
    categorySlug: "escrita",
    image: `/products/inkwell/040170.webp`,
    variants: [
      { sku: `040170`, name: { pt: `Tinteiro — Escuro & Azul`, en: `inkwell — Dark Blue` }, priceCents: 4508, currency: "EUR", attributes: { color: { label: { pt: `Escuro & Azul`, en: `Dark Blue` }, hex: ["#2a2d34", "#1f3c66"] } }, image: `/products/inkwell/040170.webp`, images: [`/products/inkwell/040170.webp`, `/products/inkwell/040170-2.webp`] },
      { sku: `040169`, name: { pt: `Tinteiro — Turquesa & Azul`, en: `inkwell — Turquoise Blue` }, priceCents: 4508, currency: "EUR", attributes: { color: { label: { pt: `Turquesa & Azul`, en: `Turquoise Blue` }, hex: ["#3aaba6", "#1f3c66"] } }, image: `/products/inkwell/040169.webp`, images: [`/products/inkwell/040169.webp`, `/products/inkwell/040169-2.webp`] },
      { sku: `040168`, name: { pt: `Tinteiro — Verde`, en: `inkwell — Green` }, priceCents: 4508, currency: "EUR", attributes: { color: { label: { pt: `Verde`, en: `Green` }, hex: ["#3a5040"] } }, image: `/products/inkwell/040168.webp`, images: [`/products/inkwell/040168.webp`, `/products/inkwell/040168-2.webp`] },
      { sku: `040167`, name: { pt: `Tinteiro — Vermelho`, en: `inkwell — Red` }, priceCents: 4508, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/inkwell/040167.webp`, images: [`/products/inkwell/040167.webp`, `/products/inkwell/040167-2.webp`] },
      { sku: `040166`, name: { pt: `Tinteiro — Real & Azul`, en: `inkwell — Royal Blue` }, priceCents: 4508, currency: "EUR", attributes: { color: { label: { pt: `Real & Azul`, en: `Royal Blue` }, hex: ["#2845a3", "#1f3c66"] } }, image: `/products/inkwell/040166.webp`, images: [`/products/inkwell/040166.webp`, `/products/inkwell/040166-2.webp`] },
      { sku: `040165`, name: { pt: `Tinteiro — Preto`, en: `inkwell — Black` }, priceCents: 4508, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/inkwell/040165.webp`, images: [`/products/inkwell/040165.webp`, `/products/inkwell/040165-2.webp`] }
    ],
  },
  {
    slug: `eternity-snake-skin`,
    name: { pt: `Eternity · Pele de Cobra`, en: `Eternity · Snake skin` },
    description: { pt: `A linha Snake Skin insere o seu original guilloché de pele de serpente sob uma audaz laca verde ou o mais clássico preto. Uma forma de honrar o método tradicional e exclusivo do guilloché sob laca, bem como a alma deste reptil ao qual é dedicado o ano lunar de 2025. Caneta de tinta permanente Line D Eternity Large em laca preta com guilloché de escamas de serpente. Tampa com guilloché de escamas de serpente e acabamento em paládio. Clip Sword articulado. Bico em ouro maciço de 14 quilates. Êmbolo incluído. Disponível nas versões esferográfica, rollerball e tinta permanente. Recargas associadas: * Cartuchos de tinta: 040112 Azul - 040110 Preta - 040362 Vermelha - 040363 Verde - 040364 Turquesa. * Tinteiros: 040165 Preto Intenso - 040166 Azul Real - 040167 Vermelho Flamejante - 040168 Verde Primavera - 040169 Turquesa - 040170 Azul Meia-Noite. Esta caneta de tinta permanente é fornecida com um bico médio, para um traço de escrita de aproximadamente 0,55 mm.`, en: `The Snake Skin line slips its original snakeskin guilloche under a bold green lacquer or the more classic black. A way of honoring the traditional and exclusive method of guilloche under lacquer, as well as the soul of this reptile to which the lunar year 2025 is dedicated. Line D Eternity large fountain pen in black snake-scale guilloche lacquer. Cap with snake-scale guilloche and palladium finish. Articulated Sword clasp. Solid 14-carat gold nib. Piston included. Available in ball, roller and nib versions. Associated refills : * Ink cartridges: 040112 Blue - 040110 Black - 040362 Red - 040363 Green - 040364 Turquoise * Ink fountains: 040165 Intense Black - 040166 Royal Blue -040167 Blazing Red - 040168 Spring Green - 040169 Turquoise - 040170 Midnight Blue This fountain pen comes with a medium nib, for a writing size of apporox. 0.55 mm.` },
    collection: `Eternity`,
    categorySlug: "escrita",
    image: `/products/eternity-snake-skin/422079L.webp`,
    variants: [
      { sku: `422079L`, name: { pt: `Eternity · Pele de Cobra — Preto`, en: `Eternity · Snake skin — Black` }, priceCents: 91540, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/eternity-snake-skin/422079L.webp`, images: [`/products/eternity-snake-skin/422079L.webp`, `/products/eternity-snake-skin/422079L-2.webp`, `/products/eternity-snake-skin/422079L-3.webp`, `/products/eternity-snake-skin/422079L-4.webp`] },
      { sku: `420079L`, name: { pt: `Eternity · Pele de Cobra — Preto`, en: `Eternity · Snake skin — Black` }, priceCents: 109940, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/eternity-snake-skin/420079L.webp`, images: [`/products/eternity-snake-skin/420079L.webp`, `/products/eternity-snake-skin/420079L-2.webp`, `/products/eternity-snake-skin/420079L-3.webp`, `/products/eternity-snake-skin/420079L-4.webp`] }
    ],
  },
  {
    slug: `eternity-monogram-1872`,
    name: { pt: `Eternity · Monogram 1872`, en: `Eternity · monogram 1872` },
    description: { pt: `A arte do metal, tal como a arte da laca e do couro revestido, evidenciam o savoir-faire da S.T. Dupont na colecção Monogram 1872. Bem ancoradas no seu tempo, as peças da colecção exibem todas o novo logótipo S.T. Dupont — direito, determinado e altivo. Caneta de tinta permanente Line D Eternity Large com arte do guilloché e acabamentos dourados da colecção Monogram 1872. Clip Sword articulado. Bico em ouro de 14 quilates. Êmbolo incluído. Disponível nas versões esferográfica, rollerball e tinta permanente. Cartuchos de tinta: 040112 Azul - 040110 Preta - 040362 Vermelha - 040363 Verde - 040364 Turquesa. Esta caneta de tinta permanente é fornecida com um bico médio, para um traço de escrita de aproximadamente 0,55 mm.`, en: `Craftsmanship in metal, as well as the art of lacquer and coated leather, showcase the expertise of S.T. Dupont in the Monogram 1872 collection. Well-rooted in their time, the pieces in the collection all feature the new S.T. Dupont logo—upright, determined, and proud. Line D Eternity large fountain pen with guilloche craftsmanship and gold finishes from the Monogram 1872 collection. Articulated Sword clip. 14-carat gold nib. Piston included. Available in ballpoint, rollerball, and fountain pen versions. Ink cartridges: 040112 Blue - 040110 Black - 040362 Red - 040363 Green - 040364 Turquoise This fountain pen comes with a medium nib, for a writing size of apporox. 0.55 mm.` },
    collection: `Eternity`,
    categorySlug: "escrita",
    image: `/products/eternity-monogram-1872/425023M.webp`,
    variants: [
      { sku: `425023M`, name: { pt: `Eternity · Monogram 1872 — Preto`, en: `Eternity · monogram 1872 — Black` }, priceCents: 73140, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/eternity-monogram-1872/425023M.webp`, images: [`/products/eternity-monogram-1872/425023M.webp`, `/products/eternity-monogram-1872/425023M-2.webp`, `/products/eternity-monogram-1872/425023M-3.webp`, `/products/eternity-monogram-1872/425023M-4.webp`] },
      { sku: `425021M`, name: { pt: `Eternity · Monogram 1872 — Prata`, en: `Eternity · monogram 1872 — Silver` }, priceCents: 73140, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/eternity-monogram-1872/425021M.webp`, images: [`/products/eternity-monogram-1872/425021M.webp`, `/products/eternity-monogram-1872/425021M-2.webp`, `/products/eternity-monogram-1872/425021M-3.webp`, `/products/eternity-monogram-1872/425021M-4.webp`] },
      { sku: `420020L`, name: { pt: `Eternity · Monogram 1872 — Dourado`, en: `Eternity · monogram 1872 — Golden` }, priceCents: 100740, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/eternity-monogram-1872/420020L.webp`, images: [`/products/eternity-monogram-1872/420020L.webp`, `/products/eternity-monogram-1872/420020L-2.webp`, `/products/eternity-monogram-1872/420020L-3.webp`, `/products/eternity-monogram-1872/420020L-4.webp`] }
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
      { sku: `272039`, name: { pt: `Initial · Game of Thrones — Preto`, en: `D Initial · Game of Thrones — Black` }, priceCents: 35420, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/d-initial-game-of-thrones/272039.webp`, images: [`/products/d-initial-game-of-thrones/272039.webp`, `/products/d-initial-game-of-thrones/272039-2.webp`, `/products/d-initial-game-of-thrones/272039-3.webp`, `/products/d-initial-game-of-thrones/272039-4.webp`] }
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
      { sku: `420111L`, name: { pt: `Eternity · Casablanca — Multicor`, en: `Eternity · Casablanca — Multicolor` }, priceCents: 137540, currency: "EUR", attributes: { color: { label: { pt: `Multicor`, en: `Multicolor` }, hex: ["#7a7d83"] } }, image: `/products/eternity-casablanca/420111L.webp`, images: [`/products/eternity-casablanca/420111L.webp`, `/products/eternity-casablanca/420111L-2.webp`, `/products/eternity-casablanca/420111L-3.webp`, `/products/eternity-casablanca/420111L-4.webp`] }
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
      { sku: `405032`, name: { pt: `Défi Millennium — Néon & Verde`, en: `Defi millennium — Neon Green` }, priceCents: 30820, currency: "EUR", attributes: { color: { label: { pt: `Néon & Verde`, en: `Neon Green` }, hex: ["#aef043", "#3a5040"] } }, image: `/products/defi-millennium/405032.webp`, images: [`/products/defi-millennium/405032.webp`, `/products/defi-millennium/405032-2.webp`, `/products/defi-millennium/405032-3.webp`, `/products/defi-millennium/405032-4.webp`] }
    ],
  },
  {
    slug: `eternity-fire-x`,
    name: { pt: `Eternity · Fire X`, en: `Eternity · Fire X` },
    description: { pt: `Inspirada na X-Bag, uma das malas da colecção de marroquinaria desenvolvida esta temporada pela S.T. Dupont, Fire X apresenta a sua reinterpretação da icónica ponta de chama sobre os clássicos da Maison. Caneta de tinta permanente Line D Eternity Médio em laca Dupont preta brilhante e acabamentos em paládio. Tampa em guilloché Orfèvre gravada Fire X. Bico em ouro maciço de 14 quilates. Êmbolo incluído. Disponível nas versões esferográfica, rollerball e tinta permanente. Recargas associadas: 040112 Azul - 040110 Preta - 040362 Vermelha - 040363 Verde - 040364 Turquesa. Esta caneta de tinta permanente é fornecida com um bico médio, para um traço de escrita de aproximadamente 0,55 mm.`, en: `Inspired by the X-Bag, one of the bags from the leather goods collection developed this season by S.T. Dupont, Fire X presents its reinterpretation of the iconic flame tip on the classics of the House. Line D Eternity medium fountain pen in glossy black Dupont lacquer and palladium finishes. Orfèvre guilloche Fire X engraved cap. Solid 14-carat gold nib. Piston included. Available in ballpoint, rollerball, and fountain pen versions. Associated refills: 040112 Blue - 040110 Black - 040362 Red - 040363 Green - 040364 Turquoise. This fountain pen comes with a medium nib, for a writing size of apporox. 0.55 mm.` },
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
    description: { pt: `Esferográfica Liberté em laca lavanda e acabamentos em paládio. Novo clip «Sword». Fabricada nas nossas oficinas em Faverges, França. Recargas associadas: 040853 Azul 040854 Preta 040358 Rosa 040359 Vermelha 040360 Verde 040361 Turquesa`, en: `Liberty Ballpoint Pen In lavender lacquer and palladium finishes New "Sword" clip. Made in our workshops in Faverges, France. Associated refills: 040853 Blue 040854 Black 040358 Pink 040359 Red 040360 Green 040361 Turquoise` },
    collection: `Liberté`,
    categorySlug: "escrita",
    image: `/products/liberte-2/465226G.webp`,
    variants: [
      { sku: `465226G`, name: { pt: `Liberté — Coral & Rosa`, en: `Liberte — Coral & Pink` }, priceCents: 48300, currency: "EUR", attributes: { color: { label: { pt: `Coral & Rosa`, en: `Coral & Pink` }, hex: ["#e2675a", "#e7a3b1"] } }, image: `/products/liberte-2/465226G.webp`, images: [`/products/liberte-2/465226G.webp`, `/products/liberte-2/465226G-2.webp`, `/products/liberte-2/465226G-3.webp`, `/products/liberte-2/465226G-4.webp`] },
      { sku: `465225G`, name: { pt: `Liberté — Lilás & Prata`, en: `Liberte — Lilac & Silver` }, priceCents: 48300, currency: "EUR", attributes: { color: { label: { pt: `Lilás & Prata`, en: `Lilac & Silver` }, hex: ["#b89dcb", "#c9ccd1"] } }, image: `/products/liberte-2/465225G.webp`, images: [`/products/liberte-2/465225G.webp`, `/products/liberte-2/465225G-2.webp`, `/products/liberte-2/465225G-3.webp`, `/products/liberte-2/465225G-4.webp`] },
      { sku: `465223G`, name: { pt: `Liberté — Branco`, en: `Liberte — White` }, priceCents: 48300, currency: "EUR", attributes: { color: { label: { pt: `Branco`, en: `White` }, hex: ["#f3efe6"] } }, image: `/products/liberte-2/465223G.webp`, images: [`/products/liberte-2/465223G.webp`, `/products/liberte-2/465223G-2.webp`, `/products/liberte-2/465223G-3.webp`, `/products/liberte-2/465223G-4.webp`] },
      { sku: `465222G`, name: { pt: `Liberté — Azul & Índigo & Azul`, en: `Liberte — Blue & Indigo Blue` }, priceCents: 48300, currency: "EUR", attributes: { color: { label: { pt: `Azul & Índigo & Azul`, en: `Blue & Indigo Blue` }, hex: ["#1f3c66", "#2c2c63"] } }, image: `/products/liberte-2/465222G.webp`, images: [`/products/liberte-2/465222G.webp`, `/products/liberte-2/465222G-2.webp`, `/products/liberte-2/465222G-3.webp`, `/products/liberte-2/465222G-4.webp`] }
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
      { sku: `460398`, name: { pt: `Escrita — Branco`, en: `Writing instruments — White` }, priceCents: 73140, currency: "EUR", attributes: { color: { label: { pt: `Branco`, en: `White` }, hex: ["#f3efe6"] } }, image: `/products/writing-instruments/460398.webp`, images: [`/products/writing-instruments/460398.webp`, `/products/writing-instruments/460398-2.webp`, `/products/writing-instruments/460398-3.webp`, `/products/writing-instruments/460398-4.webp`] },
      { sku: `460674`, name: { pt: `Escrita — Rosa`, en: `Writing instruments — Pink` }, priceCents: 62101, currency: "EUR", attributes: { color: { label: { pt: `Rosa`, en: `Pink` }, hex: ["#e7a3b1"] } }, image: `/products/writing-instruments/460674.webp`, images: [`/products/writing-instruments/460674.webp`] }
    ],
  },
  {
    slug: `defi-explorer`,
    name: { pt: `Défi Explorer`, en: `Defi explorer` },
    description: { pt: `Elegante e funcional, esta pasta em lona técnica e couro estruturado foi concebida para o homem activo. O seu interior organizado oferece arrumação segura para um computador e documentos. Leve e resistente, conjuga sofisticação técnica e requinte para uso diário, no escritório ou em deslocação. Disponível em caqui ou preto. Made in Italy`, en: `Elegant and functional, this briefcase in technical canvas and structured leather is designed for active men. Its organized interior provides secure storage for a computer and documents. Lightweight and resistant, it combines technical sophistication and refinement for everyday use, in the office or on the move. Available in khaki or black. Made in Italy` },
    collection: `Défi Explorer`,
    categorySlug: "pele",
    image: `/products/defi-explorer/1IC132NK1.webp`,
    variants: [
      { sku: `1IC132NK1`, name: { pt: `Défi Explorer — Verde & Caqui`, en: `Defi explorer — Green & Khaki` }, priceCents: 119140, currency: "EUR", attributes: { color: { label: { pt: `Verde & Caqui`, en: `Green & Khaki` }, hex: ["#3a5040", "#7a7a4b"] } }, image: `/products/defi-explorer/1IC132NK1.webp`, images: [`/products/defi-explorer/1IC132NK1.webp`, `/products/defi-explorer/1IC132NK1-2.webp`, `/products/defi-explorer/1IC132NK1-3.webp`, `/products/defi-explorer/1IC132NK1-4.webp`] }
    ],
  },
  {
    slug: `atelier`,
    name: { pt: `Atelier`, en: `Atelier` },
    description: { pt: `Ideal para o uso diário, este porta-documentos azul em couro, gravado em relevo com o padrão crocrow patinado à mão, é o aliado funcional perfeito para o businessman moderno. Conta com um amplo compartimento principal: um compartimento para computador, um bolso médio, dois bolsos para canetas e um espaço para isqueiro. - 1 compartimento para computador, - 1 bolso médio, - 2 compartimentos para canetas, - 1 compartimento para isqueiro`, en: `Ideal for daily use, this blue carrier-leather-leather-leather-leather carrier embossed from the crocrow pattern is patinated by hand. It is the ideal functional ally for the modern businessman. It has a large main compartment: a computer compartment, a medium pocket, two pockets for pens and lighter storage. - 1 computer compartment, - 1 medium pocket, - 2 locations for pens, -1 location for lighters` },
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
    description: { pt: `O estojo para isqueiro é o acessório perfeito para proteger o seu isqueiro, valorizando-o com um estilo intemporal. Ornamentado com o famoso «D» da Maison e confeccionado em couro liso preto, conjuga estilo e protecção com elegância e modernidade, estando disponível para os modelos clássicos S.T. Dupont. Estojo preto para isqueiro Le Grand Dupont, em couro de vitela liso, com a assinatura «D» gravada em relevo, com possibilidade de personalização.`, en: `The lighter case is the perfect accessory to protect your lighter while enhancing it with timeless style, adorned with the famous “D” of the house and crafted from smooth black leather, it combines style and protection with elegance and modernity, it is available for classic S.T. Dupont models, black lighter case for Le Grand Dupont, made of smooth calf leather, with an embossed “D” signature, personalization available.` },
    collection: `Estojos para Isqueiros`,
    categorySlug: "pele",
    image: null,
    variants: [
      { sku: `160030T`, name: { pt: `Estojos para Isqueiros — S.t. & Dupont`, en: `Lighter Accessories — S.T. Dupont` }, priceCents: 9108, currency: "EUR", attributes: { color: { label: { pt: `S.t. & Dupont`, en: `S.T. Dupont` }, hex: ["#7a7d83"] } }, image: undefined },
      { sku: `160028S`, name: { pt: `Estojos para Isqueiros — S.t. & Dupont`, en: `Lighter Accessories — S.T. Dupont` }, priceCents: 9108, currency: "EUR", attributes: { color: { label: { pt: `S.t. & Dupont`, en: `S.T. Dupont` }, hex: ["#7a7d83"] } }, image: `/products/lighter-accessories/160028S-2.webp`, images: [`/products/lighter-accessories/160028S-2.webp`] },
      { sku: `160023C`, name: { pt: `Estojos para Isqueiros — S.t. & Dupont`, en: `Lighter Accessories — S.T. Dupont` }, priceCents: 9108, currency: "EUR", attributes: { color: { label: { pt: `S.t. & Dupont`, en: `S.T. Dupont` }, hex: ["#7a7d83"] } }, image: `/products/lighter-accessories/160023C.webp`, images: [`/products/lighter-accessories/160023C.webp`, `/products/lighter-accessories/160023C-2.webp`] },
      { sku: `160014C`, name: { pt: `Estojos para Isqueiros — S.t. & Dupont`, en: `Lighter Accessories — S.T. Dupont` }, priceCents: 9108, currency: "EUR", attributes: { color: { label: { pt: `S.t. & Dupont`, en: `S.T. Dupont` }, hex: ["#7a7d83"] } }, image: `/products/lighter-accessories/160014C.webp`, images: [`/products/lighter-accessories/160014C.webp`, `/products/lighter-accessories/160014C-2.webp`] }
    ],
  },
  {
    slug: `lighter-case`,
    name: { pt: `Estojo de Isqueiro`, en: `lighter case` },
    description: { pt: `O estojo para isqueiro é o acessório perfeito para proteger o seu isqueiro, valorizando-o com um estilo intemporal. Ornamentado com o famoso «D» da Maison e confeccionado em couro liso preto, conjuga estilo e protecção com elegância e modernidade, estando disponível para os modelos clássicos S.T. Dupont. Estojo preto para isqueiro Ligne 2, em couro de vitela liso, com a assinatura «D» gravada em relevo, com possibilidade de personalização.`, en: `The lighter case is the perfect accessory to protect your lighter while enhancing it with timeless style, adorned with the famous "D" of the house and crafted from smooth black leather, it combines style and protection with elegance and modernity, it is available for classic S.T. Dupont models, black lighter case for Ligne 2, smooth calf leather, with embossed "D" signature, personalization available.` },
    collection: `Estojo de Isqueiro`,
    categorySlug: "pele",
    image: `/products/lighter-case/160016C.webp`,
    variants: [
      { sku: `160016C`, name: { pt: `Estojo de Isqueiro — S.t. & Dupont`, en: `lighter case — S.T. Dupont` }, priceCents: 9108, currency: "EUR", attributes: { color: { label: { pt: `S.t. & Dupont`, en: `S.T. Dupont` }, hex: ["#7a7d83"] } }, image: `/products/lighter-case/160016C.webp`, images: [`/products/lighter-case/160016C.webp`, `/products/lighter-case/160016C-2.webp`] },
      { sku: `160025B`, name: { pt: `Estojo de Isqueiro — S.t. & Dupont`, en: `lighter case — S.T. Dupont` }, priceCents: 9108, currency: "EUR", attributes: { color: { label: { pt: `S.t. & Dupont`, en: `S.T. Dupont` }, hex: ["#7a7d83"] } }, image: `/products/lighter-case/160025B.webp`, images: [`/products/lighter-case/160025B.webp`, `/products/lighter-case/160025B-2.webp`] }
    ],
  },
  {
    slug: `pen-case`,
    name: { pt: `Estojo de Caneta`, en: `Pen case` },
    description: { pt: `Moderna e prática, a nova colecção de acessórios de escritório proposta pela S.T. Dupont volta a evidenciar o savoir-faire da Maison, com o intuito de criar uma colecção de estojos para canetas funcionais e refinados. Estojo rígido em couro de vitela preto e malha dourada inspirada no guilloché Firehead. Pode acomodar dois instrumentos de escrita de tamanho médio ou grande.`, en: `Modern and practical, the new collection of office accessories proposed by S.T. Dupont once again highlights the expertise of the House with the aim of creating a collection of functional and refined pen cases. Rigid case in black calf leather and golden mesh inspired by the Firehead guilloche. Can contain two writing instruments of medium or large size` },
    collection: `Estojo de Caneta`,
    categorySlug: "pele",
    image: `/products/pen-case/007162.webp`,
    variants: [
      { sku: `007162`, name: { pt: `Estojo de Caneta — Ouro`, en: `Pen case — Gold` }, priceCents: 29900, currency: "EUR", attributes: { color: { label: { pt: `Ouro`, en: `Gold` }, hex: ["#c8a24a"] } }, image: `/products/pen-case/007162.webp`, images: [`/products/pen-case/007162.webp`, `/products/pen-case/007162-2.webp`, `/products/pen-case/007162-3.webp`] },
      { sku: `007161`, name: { pt: `Estojo de Caneta — Prata`, en: `Pen case — Silver` }, priceCents: 29900, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/pen-case/007161.webp`, images: [`/products/pen-case/007161.webp`, `/products/pen-case/007161-2.webp`, `/products/pen-case/007161-3.webp`] }
    ],
  },
  {
    slug: `fuente`,
    name: { pt: `Fuente`, en: `Fuente` },
    description: { pt: `Tote Bag — Lona revestida e couro de vitela liso decorados com o monograma X multicolor e o brasão Opus X Fuente. Inclui dois porta-garrafas, um amplo bolso com fecho de correr e um porta-chaves integrado.`, en: `Tote Bag - Coated canvas and smooth calf leather decorated with the multicolor X monogram and Opus X Fuente crest. Includes two bottle holders, one large zip pocket, and an integrated key holder.` },
    collection: `Fuente`,
    categorySlug: "pele",
    image: `/products/fuente/1FU153BK1.webp`,
    variants: [
      { sku: `1FU153BK1`, name: { pt: `Fuente — Multicor`, en: `Fuente — Multicolor` }, priceCents: 247940, currency: "EUR", attributes: { color: { label: { pt: `Multicor`, en: `Multicolor` }, hex: ["#7a7d83"] } }, image: `/products/fuente/1FU153BK1.webp`, images: [`/products/fuente/1FU153BK1.webp`, `/products/fuente/1FU153BK1-2.webp`, `/products/fuente/1FU153BK1-3.webp`] }
    ],
  },
  {
    slug: `camera-bag-fuente`,
    name: { pt: `Mala de Câmara · Fuente`, en: `Camera bag · Fuente` },
    description: { pt: `Camera Bag — Lona revestida e couro de vitela liso decorados com o monograma X multicolor e o brasão Opus X Fuente. Dois grandes compartimentos, dois compartimentos para isqueiro, um compartimento para corta-charutos, alça de ombro ajustável.`, en: `Camera Bag - Coated canvas and smooth calf leather decorated with the multicolor X monogram and Opus X Fuente crest. Two large compartments, two lighter compartments, one cigar cutter compartment, adjustable shoulder strap.` },
    collection: `Camera bag`,
    categorySlug: "pele",
    image: `/products/camera-bag-fuente/1FU183BK1.webp`,
    variants: [
      { sku: `1FU183BK1`, name: { pt: `Camera bag · Fuente — Multicor`, en: `Camera bag · Fuente — Multicolor` }, priceCents: 155940, currency: "EUR", attributes: { color: { label: { pt: `Multicor`, en: `Multicolor` }, hex: ["#7a7d83"] } }, image: `/products/camera-bag-fuente/1FU183BK1.webp`, images: [`/products/camera-bag-fuente/1FU183BK1.webp`, `/products/camera-bag-fuente/1FU183BK1-2.webp`, `/products/camera-bag-fuente/1FU183BK1-3.webp`, `/products/camera-bag-fuente/1FU183BK1-4.webp`] }
    ],
  },
  {
    slug: `firehead`,
    name: { pt: `Firehead`, en: `Firehead` },
    description: { pt: `Porta-cartões funcional e elegante, desliza facilmente para o seu bolso com os seus 6 compartimentos e o bolso central que acomoda os seus cartões de crédito, títulos de transporte e cartões de visita. Concebido em couro gravado em relevo, com o padrão Firehead. O couro utilizado em todos os modelos da colecção Firehead é certificado pelo Leather Working Group.`, en: `Functional and stylish card holder, easily slips into your pocket with its 6 slots and central pocket that can hold your credit cards, transport tickets and business cards. Designed in embossed leather, its Firehead pattern. The leather used on all models of the Firehead collection is certified by the Leather Working Group.` },
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
    description: { pt: `Mochila em couro de vitela flor inteira preto. Vários compartimentos interiores funcionais, incluindo um para computador portátil. Bolso à frente. Toda a colecção Neo Capsule é certificada LWG.`, en: `Black full-grain calf leather backpack. Several functional interior compartments, including one for a laptop. Pocket at the front. The entire Neo capsule collection is LWG certified.` },
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
    description: { pt: `Botões de punho quadrados ornamentados com pontas de diamante, inspirados nos icónicos isqueiros da colecção S.T. Dupont.`, en: `Square cufflinks adorned with diamond tips, inspired by the iconic lighters from the S.T. Dupont collection.` },
    collection: `Botões de Punho`,
    categorySlug: "acessorios",
    image: `/products/cufflink/005568.webp`,
    variants: [
      { sku: `005568`, name: { pt: `Botões de Punho — Prata`, en: `Cufflink — Silver` }, priceCents: 24380, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/cufflink/005568.webp`, images: [`/products/cufflink/005568.webp`] }
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
      { sku: `003433`, name: { pt: `Cortador de Charuto — Preto`, en: `Cigar Cutter — Black` }, priceCents: 20700, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/cigar-cutter-2/003433.webp`, images: [`/products/cigar-cutter-2/003433.webp`] },
      { sku: `003475`, name: { pt: `Cortador de Charuto — Vermelho`, en: `Cigar Cutter — Red` }, priceCents: 31740, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/cigar-cutter-2/003475.webp`, images: [`/products/cigar-cutter-2/003475.webp`, `/products/cigar-cutter-2/003475-2.webp`, `/products/cigar-cutter-2/003475-3.webp`] },
      { sku: `003480`, name: { pt: `Cortador de Charuto — Prata`, en: `Cigar Cutter — Silver` }, priceCents: 26220, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/cigar-cutter-2/003480.webp`, images: [`/products/cigar-cutter-2/003480.webp`, `/products/cigar-cutter-2/003480-2.webp`, `/products/cigar-cutter-2/003480-3.webp`] },
      { sku: `003482`, name: { pt: `Cortador de Charuto — Dourado`, en: `Cigar Cutter — Golden` }, priceCents: 26220, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/cigar-cutter-2/003482.webp`, images: [`/products/cigar-cutter-2/003482.webp`, `/products/cigar-cutter-2/003482-2.webp`, `/products/cigar-cutter-2/003482-3.webp`] },
      { sku: `003481`, name: { pt: `Cortador de Charuto — Preto`, en: `Cigar Cutter — Black` }, priceCents: 26220, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/cigar-cutter-2/003481.webp`, images: [`/products/cigar-cutter-2/003481.webp`, `/products/cigar-cutter-2/003481-2.webp`, `/products/cigar-cutter-2/003481-3.webp`] },
      { sku: `003280P`, name: { pt: `Cortador de Charuto — Prata`, en: `Cigar Cutter — Silver` }, priceCents: 31740, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/cigar-cutter-2/003280P.webp`, images: [`/products/cigar-cutter-2/003280P.webp`, `/products/cigar-cutter-2/003280P-2.webp`, `/products/cigar-cutter-2/003280P-3.webp`] },
      { sku: `003282P`, name: { pt: `Cortador de Charuto — Dourado`, en: `Cigar Cutter — Golden` }, priceCents: 31740, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/cigar-cutter-2/003282P.webp`, images: [`/products/cigar-cutter-2/003282P.webp`, `/products/cigar-cutter-2/003282P-2.webp`, `/products/cigar-cutter-2/003282P-3.webp`] },
      { sku: `003281P`, name: { pt: `Cortador de Charuto — Preto`, en: `Cigar Cutter — Black` }, priceCents: 31740, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/cigar-cutter-2/003281P.webp`, images: [`/products/cigar-cutter-2/003281P.webp`, `/products/cigar-cutter-2/003281P-2.webp`, `/products/cigar-cutter-2/003281P-3.webp`] }
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
      { sku: `183161`, name: { pt: `Estojo Duplo de Charuto — Azul`, en: `Double Cigar Case — Blue` }, priceCents: 27140, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/double-cigar-case/183161.webp`, images: [`/products/double-cigar-case/183161.webp`, `/products/double-cigar-case/183161-2.webp`, `/products/double-cigar-case/183161-3.webp`, `/products/double-cigar-case/183161-4.webp`] },
      { sku: `183162`, name: { pt: `Estojo Duplo de Charuto — Rosa`, en: `Double Cigar Case — Pink` }, priceCents: 27140, currency: "EUR", attributes: { color: { label: { pt: `Rosa`, en: `Pink` }, hex: ["#e7a3b1"] } }, image: `/products/double-cigar-case/183162.webp`, images: [`/products/double-cigar-case/183162.webp`, `/products/double-cigar-case/183162-2.webp`, `/products/double-cigar-case/183162-3.webp`, `/products/double-cigar-case/183162-4.webp`] }
    ],
  },
  {
    slug: `2-cigar-case`,
    name: { pt: `Estojo Duplo de Charuto`, en: `2 cigar case` },
    description: { pt: `Estojo para 2 charutos, preto com gravação dourada em relevo. Máx. 24,5 mm.`, en: `2-cigar case, black with gold embossing. max 24.5 mm.` },
    collection: `Estojo Duplo de Charuto`,
    categorySlug: "acessorios",
    image: `/products/2-cigar-case/183245.webp`,
    variants: [
      { sku: `183245`, name: { pt: `Estojo Duplo de Charuto — Fúcsia & Rosa & Rosa`, en: `2 cigar case — Fuchsia Pink & Pink` }, priceCents: 28980, currency: "EUR", attributes: { color: { label: { pt: `Fúcsia & Rosa & Rosa`, en: `Fuchsia Pink & Pink` }, hex: ["#c43f7a", "#e7a3b1"] } }, image: `/products/2-cigar-case/183245.webp`, images: [`/products/2-cigar-case/183245.webp`, `/products/2-cigar-case/183245-2.webp`] },
      { sku: `183267`, name: { pt: `Estojo Duplo de Charuto — Azul & Índigo & Azul`, en: `2 cigar case — Blue & Indigo Blue` }, priceCents: 28980, currency: "EUR", attributes: { color: { label: { pt: `Azul & Índigo & Azul`, en: `Blue & Indigo Blue` }, hex: ["#1f3c66", "#2c2c63"] } }, image: `/products/2-cigar-case/183267.webp`, images: [`/products/2-cigar-case/183267.webp`, `/products/2-cigar-case/183267-2.webp`] },
      { sku: `183260`, name: { pt: `Estojo Duplo de Charuto — Preto`, en: `2 cigar case — Black` }, priceCents: 28980, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/2-cigar-case/183260.webp`, images: [`/products/2-cigar-case/183260.webp`, `/products/2-cigar-case/183260-2.webp`, `/products/2-cigar-case/183260-3.webp`] },
      { sku: `183250`, name: { pt: `Estojo Duplo de Charuto — Preto`, en: `2 cigar case — Black` }, priceCents: 28980, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/2-cigar-case/183250.webp`, images: [`/products/2-cigar-case/183250.webp`, `/products/2-cigar-case/183250-2.webp`, `/products/2-cigar-case/183250-3.webp`, `/products/2-cigar-case/183250-4.webp`] },
      { sku: `183249`, name: { pt: `Estojo Duplo de Charuto — Verde & Caqui`, en: `2 cigar case — Green & Khaki` }, priceCents: 28980, currency: "EUR", attributes: { color: { label: { pt: `Verde & Caqui`, en: `Green & Khaki` }, hex: ["#3a5040", "#7a7a4b"] } }, image: `/products/2-cigar-case/183249.webp`, images: [`/products/2-cigar-case/183249.webp`, `/products/2-cigar-case/183249-2.webp`, `/products/2-cigar-case/183249-3.webp`, `/products/2-cigar-case/183249-4.webp`] },
      { sku: `183240`, name: { pt: `Estojo Duplo de Charuto — Preto`, en: `2 cigar case — Black` }, priceCents: 29900, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/2-cigar-case/183240.webp`, images: [`/products/2-cigar-case/183240.webp`, `/products/2-cigar-case/183240-2.webp`, `/products/2-cigar-case/183240-3.webp`] },
      { sku: `183243`, name: { pt: `Estojo Duplo de Charuto — Turquesa & Azul`, en: `2 cigar case — Turquoise Blue` }, priceCents: 28980, currency: "EUR", attributes: { color: { label: { pt: `Turquesa & Azul`, en: `Turquoise Blue` }, hex: ["#3aaba6", "#1f3c66"] } }, image: `/products/2-cigar-case/183243.webp`, images: [`/products/2-cigar-case/183243.webp`, `/products/2-cigar-case/183243-2.webp`, `/products/2-cigar-case/183243-3.webp`] },
      { sku: `183269`, name: { pt: `Estojo Duplo de Charuto — Verde & Caqui`, en: `2 cigar case — Green & Khaki` }, priceCents: 29900, currency: "EUR", attributes: { color: { label: { pt: `Verde & Caqui`, en: `Green & Khaki` }, hex: ["#3a5040", "#7a7a4b"] } }, image: `/products/2-cigar-case/183269.webp`, images: [`/products/2-cigar-case/183269.webp`, `/products/2-cigar-case/183269-2.webp`, `/products/2-cigar-case/183269-3.webp`] }
    ],
  },
  {
    slug: `3-cigar-case`,
    name: { pt: `Estojo Triplo de Charuto`, en: `3 cigar case` },
    description: { pt: `Concebidas para insuflar nova energia aos nossos clássicos — e ao nosso quotidiano —, as peças da colecção Fluo inspiram-se nas mais recentes tendências da moda e do design automóvel. Com a Fluo, a lendária laca S.T. Dupont toma todas as liberdades, tornando-se pop e luminosa, para vidas sempre em movimento, dinâmicas e vibrantes. Estojo para 3 charutos em couro de vitela granulado laranja fluorescente, com base em metal preto mate.`, en: `Designed to bring new energy to our classics - and to our everyday lives, the pieces in the Fluo collection are inspired by the latest trends in fashion and automotive design. With Fluo, the legendary S.T. Dupont's legendary lacquer takes all the liberty in the world, becoming pop and light, for lives that are always on the move, dynamic and whirring. 3-cigar case in fluorescent orange grained calf leather with matt black metal base.` },
    collection: `Estojo Triplo de Charuto`,
    categorySlug: "acessorios",
    image: `/products/3-cigar-case/183364.webp`,
    variants: [
      { sku: `183364`, name: { pt: `Estojo Triplo de Charuto — Azul & Turquesa & Azul`, en: `3 cigar case — Blue & Turquoise Blue` }, priceCents: 29900, currency: "EUR", attributes: { color: { label: { pt: `Azul & Turquesa & Azul`, en: `Blue & Turquoise Blue` }, hex: ["#1f3c66", "#3aaba6"] } }, image: `/products/3-cigar-case/183364.webp`, images: [`/products/3-cigar-case/183364.webp`, `/products/3-cigar-case/183364-2.webp`, `/products/3-cigar-case/183364-3.webp`, `/products/3-cigar-case/183364-4.webp`] },
      { sku: `183349`, name: { pt: `Estojo Triplo de Charuto — Verde & Caqui`, en: `3 cigar case — Green & Khaki` }, priceCents: 32200, currency: "EUR", attributes: { color: { label: { pt: `Verde & Caqui`, en: `Green & Khaki` }, hex: ["#3a5040", "#7a7a4b"] } }, image: `/products/3-cigar-case/183349.webp`, images: [`/products/3-cigar-case/183349.webp`, `/products/3-cigar-case/183349-2.webp`, `/products/3-cigar-case/183349-3.webp`, `/products/3-cigar-case/183349-4.webp`] },
      { sku: `183340`, name: { pt: `Estojo Triplo de Charuto — Preto`, en: `3 cigar case — Black` }, priceCents: 32660, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/3-cigar-case/183340.webp`, images: [`/products/3-cigar-case/183340.webp`, `/products/3-cigar-case/183340-2.webp`, `/products/3-cigar-case/183340-3.webp`, `/products/3-cigar-case/183340-4.webp`] },
      { sku: `183417`, name: { pt: `Estojo Triplo de Charuto — Néon & Verde`, en: `3 cigar case — Neon Green` }, priceCents: 32660, currency: "EUR", attributes: { color: { label: { pt: `Néon & Verde`, en: `Neon Green` }, hex: ["#aef043", "#3a5040"] } }, image: `/products/3-cigar-case/183417.webp`, images: [`/products/3-cigar-case/183417.webp`, `/products/3-cigar-case/183417-2.webp`] },
      { sku: `183419`, name: { pt: `Estojo Triplo de Charuto — Néon & Laranja`, en: `3 cigar case — Neon Orange` }, priceCents: 32660, currency: "EUR", attributes: { color: { label: { pt: `Néon & Laranja`, en: `Neon Orange` }, hex: ["#aef043", "#c4642d"] } }, image: `/products/3-cigar-case/183419.webp`, images: [`/products/3-cigar-case/183419.webp`, `/products/3-cigar-case/183419-2.webp`, `/products/3-cigar-case/183419-3.webp`] }
    ],
  },
  {
    slug: `cigar-case-2`,
    name: { pt: `Estojo de Charuto`, en: `Cigar case` },
    description: { pt: `Estojo simples para charuto em couro granulado preto com crómio. - Estojo ajustável para um charuto - Diâmetro máximo de 24,5 mm`, en: `Simple black grained cigar case with chrome. - Adjustable case for one cigar - Maximum diameter of 24.5 mm` },
    collection: `Estojo de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cigar-case-2/183160.webp`,
    variants: [
      { sku: `183160`, name: { pt: `Estojo de Charuto — Preto`, en: `Cigar case — Black` }, priceCents: 20700, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/cigar-case-2/183160.webp`, images: [`/products/cigar-case-2/183160.webp`, `/products/cigar-case-2/183160-2.webp`, `/products/cigar-case-2/183160-3.webp`, `/products/cigar-case-2/183160-4.webp`] }
    ],
  },
  {
    slug: `2-cigar-case-monogram-1872`,
    name: { pt: `Estojo Duplo de Charuto · Monogram 1872`, en: `2 cigar case · monogram 1872` },
    description: { pt: `A arte do metal, tal como a arte da laca e do couro revestido, evidenciam o savoir-faire da S.T. Dupont na colecção Monogram 1872. Bem ancoradas no seu tempo, as peças da colecção exibem todas o novo logótipo S.T. Dupont — direito, determinado e altivo. Estojo em lona revestida para 2 charutos, decorado com o padrão Monogram 1872 em Bordéus e base em metal dourado.`, en: `Craftsmanship in metal, as well as the art of lacquer and coated leather, showcase the expertise of S.T. Dupont in the Monogram 1872 collection. Well-rooted in their time, the pieces in the collection all feature the new S.T. Dupont logo—upright, determined, and proud. Coated canvas case for 2 cigars decorated with the Monogram 1872 pattern in burgundy and a gold metal base.` },
    collection: `Estojo Duplo de Charuto`,
    categorySlug: "acessorios",
    image: `/products/2-cigar-case-monogram-1872/183479.webp`,
    variants: [
      { sku: `183479`, name: { pt: `Estojo Duplo de Charuto · Monogram 1872 — Preto`, en: `2 cigar case · monogram 1872 — Black` }, priceCents: 29900, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/2-cigar-case-monogram-1872/183479.webp`, images: [`/products/2-cigar-case-monogram-1872/183479.webp`, `/products/2-cigar-case-monogram-1872/183479-2.webp`, `/products/2-cigar-case-monogram-1872/183479-3.webp`] },
      { sku: `183478`, name: { pt: `Estojo Duplo de Charuto · Monogram 1872 — Bordeaux`, en: `2 cigar case · monogram 1872 — Burgundy` }, priceCents: 29900, currency: "EUR", attributes: { color: { label: { pt: `Bordeaux`, en: `Burgundy` }, hex: ["#5e1f1f"] } }, image: `/products/2-cigar-case-monogram-1872/183478.webp`, images: [`/products/2-cigar-case-monogram-1872/183478.webp`, `/products/2-cigar-case-monogram-1872/183478-2.webp`, `/products/2-cigar-case-monogram-1872/183478-3.webp`] }
    ],
  },
  {
    slug: `ligne-2-3`,
    name: { pt: `Ligne 2 · Estojo`, en: `Ligne 2 · Lighter Case` },
    description: { pt: `Estojo para isqueiro em couro de vaca liso preto, acomoda um isqueiro Ligne 2. Gravado em relevo com o logótipo S.T. Dupont e costuras azul, branco e vermelho.`, en: `Black smooth cowhide leather lighter case, accommodates a Line 2 lighter. Embossed with the S.T. Dupont logo and blue, white, red stitching.` },
    collection: `Estojos para Isqueiros`,
    categorySlug: "acessorios",
    image: `/products/ligne-2-3/183070.webp`,
    variants: [
      { sku: `183070`, name: { pt: `Ligne 2 · Estojo — Preto`, en: `Ligne 2 · Lighter Case — Black` }, priceCents: 19780, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/ligne-2-3/183070.webp`, images: [`/products/ligne-2-3/183070.webp`, `/products/ligne-2-3/183070-2.webp`, `/products/ligne-2-3/183070-3.webp`] }
    ],
  },
  {
    slug: `line-d`,
    name: { pt: `Line D`, en: `Line D` },
    description: { pt: `Estojo para isqueiro em couro liso preto. Compatível com os isqueiros Le Grand S.T. Dupont e Ligne 2.`, en: `Black smooth leather lighter case. Compatible with Le Grand ST Dupont and Line 2 lighters.` },
    collection: `Line D`,
    categorySlug: "escrita",
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
      { sku: `183497`, name: { pt: `Estojo Duplo de Charuto · Koi — Azul & Koi & Fish`, en: `2 cigar case · Koi fish — Blue Koi Fish` }, priceCents: 27140, currency: "EUR", attributes: { color: { label: { pt: `Azul & Koi & Fish`, en: `Blue Koi Fish` }, hex: ["#1f3c66"] } }, image: `/products/2-cigar-case-koi-fish/183497.webp`, images: [`/products/2-cigar-case-koi-fish/183497.webp`, `/products/2-cigar-case-koi-fish/183497-2.webp`, `/products/2-cigar-case-koi-fish/183497-3.webp`] }
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
      { sku: `183011`, name: { pt: `Acessórios — Castanho`, en: `Accessories — Brown` }, priceCents: 22540, currency: "EUR", attributes: { color: { label: { pt: `Castanho`, en: `Brown` }, hex: ["#6b4a2a"] } }, image: `/products/accessories/183011.webp`, images: [`/products/accessories/183011.webp`] }
    ],
  },
  {
    slug: `3-cigar-case-fluo`,
    name: { pt: `3 cigar case_Fluo`, en: `3 cigar case_Fluo` },
    description: { pt: `Concebidas para insuflar nova energia aos nossos clássicos — e ao nosso quotidiano —, as peças da colecção Fluo inspiram-se nas mais recentes tendências da moda e do design automóvel. Com a Fluo, a lendária laca S.T. Dupont toma todas as liberdades, tornando-se pop e luminosa, para vidas sempre em movimento, dinâmicas e vibrantes. Estojo para 3 charutos em couro de vitela granulado azul fluorescente, com base em metal preto mate.`, en: `Designed to bring new energy to our classics - and to our everyday lives, the pieces in the Fluo collection are inspired by the latest trends in fashion and automotive design. With Fluo, the legendary S.T. Dupont's legendary lacquer takes all the liberty in the world, becoming pop and light, for lives that are always on the move, dynamic and whirring. 3-cigar case in fluorescent blue grained calf leather with matt black metal base.` },
    collection: `3 cigar case_Fluo`,
    categorySlug: "acessorios",
    image: `/products/3-cigar-case-fluo/183416.webp`,
    variants: [
      { sku: `183416`, name: { pt: `3 cigar case_Fluo — Néon & Azul`, en: `3 cigar case_Fluo — Neon Blue` }, priceCents: 32660, currency: "EUR", attributes: { color: { label: { pt: `Néon & Azul`, en: `Neon Blue` }, hex: ["#aef043", "#1f3c66"] } }, image: `/products/3-cigar-case-fluo/183416.webp`, images: [`/products/3-cigar-case-fluo/183416.webp`, `/products/3-cigar-case-fluo/183416-2.webp`] }
    ],
  },


  // === BEGIN EN STORE IMPORTS (en.st-dupont.com) ===

  {
    slug: `misc-2`,
    name: { pt: `Diverso`, en: `Misc` },
    description: { pt: `Pedra de isqueiro vermelha. Vendida em embalagens de 8. Para os seguintes isqueiros: Ligne Initial, Le Grand S.T. Dupont, Ligne 8, Line-D, Mon Dupont, Liberté.`, en: `Red lighter flint. Sold in packs of 8. For the following lighters: Ligne Initial, Le Grand S.T. Dupont, Ligne 8, Line-D, Mon Dupont, Liberté.` },
    collection: `Misc`,
    categorySlug: "acessorios",
    image: `/products/misc-2/900650.webp`,
    variants: [
      { sku: `900650`, name: { pt: `Misc — Variante 0650`, en: `Misc — Variant 0650` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Variante 0650`, en: `Variant 0650` }, hex: ["#7a7d83"] } }, image: `/products/misc-2/900650.webp`, images: [`/products/misc-2/900650.webp`] },
    ],
  },
  {
    slug: `2-cigar-case-dragon`,
    name: { pt: `Estojo para 2 Charutos · Dragon`, en: `2-cigar-case · Dragon` },
    description: { pt: `Este estojo para charutos da S.T. Dupont apresenta uma base em metal dourado e um exterior em couro de vitela Bordéus. O desenho do dragão é ilustrado sobre o estojo, serpenteando em torno da peça Bordéus.`, en: `This S.T. Dupont cigar case features a golden metal base and a burgundy calf leather exterior. The dragon design is illustrated on the cigar case, winding around the burgundy case.` },
    collection: `Dragon`,
    categorySlug: "acessorios",
    image: `/products/2-cigar-case-dragon/183276.webp`,
    variants: [
      { sku: `183276`, name: { pt: `Estojo para 2 Charutos · Dragon — Bordô`, en: `2-cigar-case · Dragon — Burgundy` }, priceCents: 24000, currency: "EUR", attributes: { color: { label: { pt: `Bordô`, en: `Burgundy` }, hex: ["#7d2b27"] } }, image: `/products/2-cigar-case-dragon/183276.webp`, images: [`/products/2-cigar-case-dragon/183276.webp`, `/products/2-cigar-case-dragon/183276-2.webp`, `/products/2-cigar-case-dragon/183276-3.webp`] },
      { sku: `183271`, name: { pt: `Estojo para 2 Charutos · Dragon — Bordô`, en: `2-cigar-case · Dragon — Burgundy` }, priceCents: 23000, currency: "EUR", attributes: { color: { label: { pt: `Bordô`, en: `Burgundy` }, hex: ["#7d2b27"] } }, image: `/products/2-cigar-case-dragon/183271.webp`, images: [`/products/2-cigar-case-dragon/183271.webp`, `/products/2-cigar-case-dragon/183271-2.webp`, `/products/2-cigar-case-dragon/183271-3.webp`] },
      { sku: `183270`, name: { pt: `Estojo para 2 Charutos · Dragon — Preto`, en: `2-cigar-case · Dragon — Black` }, priceCents: 23000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/2-cigar-case-dragon/183270.webp`, images: [`/products/2-cigar-case-dragon/183270.webp`, `/products/2-cigar-case-dragon/183270-2.webp`, `/products/2-cigar-case-dragon/183270-3.webp`] },
      { sku: `183273`, name: { pt: `Estojo para 2 Charutos · Dragon — Mel`, en: `2-cigar-case · Dragon — Honey` }, priceCents: 23000, currency: "EUR", attributes: { color: { label: { pt: `Mel`, en: `Honey` }, hex: ["#7a7d83"] } }, image: `/products/2-cigar-case-dragon/183273.webp`, images: [`/products/2-cigar-case-dragon/183273.webp`, `/products/2-cigar-case-dragon/183273-2.webp`, `/products/2-cigar-case-dragon/183273-3.webp`] },
      { sku: `183274`, name: { pt: `Estojo para 2 Charutos · Dragon — Azul Real`, en: `2-cigar-case · Dragon — Royal Blue` }, priceCents: 23000, currency: "EUR", attributes: { color: { label: { pt: `Azul Real`, en: `Royal Blue` }, hex: ["#1f3c66"] } }, image: `/products/2-cigar-case-dragon/183274.webp`, images: [`/products/2-cigar-case-dragon/183274.webp`, `/products/2-cigar-case-dragon/183274-2.webp`, `/products/2-cigar-case-dragon/183274-3.webp`] },
    ],
  },
  {
    slug: `2-cigar-case-monogram-1872-2`,
    name: { pt: `Estojo para 2 Charutos · Monogram 1872`, en: `2-cigar-case · Monogram 1872` },
    description: { pt: `A arte do metal, tal como a arte da laca e do couro revestido, evidenciam o savoir-faire da S.T. Dupont na colecção Monogram 1872. Bem ancoradas no seu tempo, as peças da colecção exibem todas o novo logótipo S.T. Dupont — direito, determinado e altivo. Estojo em lona revestida para 2 charutos, decorado com o padrão Monogram 1872 em cinzento e base em metal prateado.`, en: `Craftsmanship in metal, as well as the art of lacquer and coated leather, showcase the expertise of S.T. Dupont in the Monogram 1872 collection. Well-rooted in their time, the pieces in the collection all feature the new S.T. Dupont logo—upright, determined, and proud. Coated canvas case for 2 cigars decorated with the Monogram 1872 pattern in gray and a silver metal base.` },
    collection: `Monogram 1872`,
    categorySlug: "acessorios",
    image: `/products/2-cigar-case-monogram-1872-2/183480.webp`,
    variants: [
      { sku: `183480`, name: { pt: `2-cigar-case · Monogram 1872 — Cinzento Claro`, en: `2-cigar-case · Monogram 1872 — Light Gray` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Cinzento Claro`, en: `Light Gray` }, hex: ["#7a7d83"] } }, image: `/products/2-cigar-case-monogram-1872-2/183480.webp`, images: [`/products/2-cigar-case-monogram-1872-2/183480.webp`, `/products/2-cigar-case-monogram-1872-2/183480-2.webp`, `/products/2-cigar-case-monogram-1872-2/183480-3.webp`] },
    ],
  },
  {
    slug: `ashtray-2`,
    name: { pt: `Cinzeiro`, en: `Ashtray` },
    description: { pt: `Cinzeiro em porcelana. O icónico dragão S.T. Dupont é ilustrado no corpo deste acessório de tonalidade Bordéus.`, en: `Porcelain ashtray. The iconic S.T. Dupont dragon is illustrated on the body of this bordeaux-colored accessory.` },
    collection: `Ashtray`,
    categorySlug: "acessorios",
    image: `/products/ashtray-2/006486.webp`,
    variants: [
      { sku: `006486`, name: { pt: `Cinzeiro — Bordô`, en: `Ashtray — Burgundy` }, priceCents: 45500, currency: "EUR", attributes: { color: { label: { pt: `Bordô`, en: `Burgundy` }, hex: ["#7d2b27"] } }, image: `/products/ashtray-2/006486.webp`, images: [`/products/ashtray-2/006486.webp`, `/products/ashtray-2/006486-2.webp`, `/products/ashtray-2/006486-3.webp`] },
      { sku: `006487`, name: { pt: `Cinzeiro — Preto`, en: `Ashtray — Black` }, priceCents: 45500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/ashtray-2/006487.webp`, images: [`/products/ashtray-2/006487.webp`, `/products/ashtray-2/006487-2.webp`, `/products/ashtray-2/006487-3.webp`] },
    ],
  },
  {
    slug: `ashtray-fender`,
    name: { pt: `Cinzeiro · Fender`, en: `Ashtray · Fender` },
    description: { pt: `A Fender®, a mais famosa marca de guitarras, abre uma boutique no vibrante bairro de Harajuku, em Tóquio. Por esta ocasião, e pela segunda vez, a S.T. Dupont e a Fender® colaboram, imaginando uma linha rock inspirada no savoir-faire de ambas as casas e também no Japão. Com o seu trabalho da laca inspirado no kintsugi, e ainda o regresso de um antigo savoir-faire com pó de ouro aplicado à mão, esta colaboração faz seu o universo criativo da música. Cinzeiro com padrão Fender®. Acabamento em laca brilhante preta. Acabamento dourado pintado à mão nas ranhuras.`, en: `Fender®, the most famous guitar brand in Tokyo, is opening a boutique in the vibrant Harajuku area. On this occasion, and for the second time, S.T. Dupont and Fender® collaborate, imagining a rock line inspired by the know-how of both houses, as well as Japan. With his work of the lacquer inspired by kintsugi, but also the return of an ancient know-how with gold powder applied by hand, this collaboration makes its own the creativity of the musical universe. Fender pattern ashtray® Glossy lacquer finish black. Hand painted gold finish on the grooves.` },
    collection: `Fender`,
    categorySlug: "acessorios",
    image: `/products/ashtray-fender/006425.webp`,
    variants: [
      { sku: `006425`, name: { pt: `Ashtray · Fender — Preto`, en: `Ashtray · Fender — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/ashtray-fender/006425.webp`, images: [`/products/ashtray-fender/006425.webp`, `/products/ashtray-fender/006425-2.webp`, `/products/ashtray-fender/006425-3.webp`] },
    ],
  },
  {
    slug: `ashtray-fire-x-2`,
    name: { pt: `Cinzeiro · Fire X`, en: `Ashtray · Fire X` },
    description: { pt: `Inspirada na X-Bag, uma das malas da colecção de marroquinaria desenvolvida esta temporada pela S.T. Dupont, Fire X apresenta a sua reinterpretação da icónica ponta de chama sobre os clássicos da Maison. Cinzeiro decorado com o motivo Fire X. Cinzeiro em porcelana.`, en: `Inspired by the X-Bag, one of the bags from the leather goods collection developed this season by S.T. Dupont, Fire X presents its reinterpretation of the iconic flame tip on the classics of the House. Ashtray decorated with the Fire X motif. Porcelain ashtray.` },
    collection: `Fire X`,
    categorySlug: "acessorios",
    image: `/products/ashtray-fire-x-2/006470.webp`,
    variants: [
      { sku: `006470`, name: { pt: `Ashtray · Fire X — Preto`, en: `Ashtray · Fire X — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/ashtray-fire-x-2/006470.webp`, images: [`/products/ashtray-fire-x-2/006470.webp`, `/products/ashtray-fire-x-2/006470-2.webp`, `/products/ashtray-fire-x-2/006470-3.webp`] },
    ],
  },
  {
    slug: `ashtray-monogram-1872`,
    name: { pt: `Cinzeiro · Monogram 1872`, en: `Ashtray · Monogram 1872` },
    description: { pt: `A arte do metal, tal como a arte da laca e do couro revestido, evidenciam o savoir-faire da S.T. Dupont na colecção Monogram 1872. Bem ancoradas no seu tempo, as peças da colecção exibem todas o novo logótipo S.T. Dupont — direito, determinado e altivo. Cinzeiro em porcelana decorado com o padrão Monogram 1872 em Bordéus. Entalhes e contornos pintados à mão.`, en: `Craftsmanship in metal, as well as the art of lacquer and coated leather, showcase the expertise of S.T. Dupont in the Monogram 1872 collection. Well-rooted in their time, the pieces in the collection all feature the new S.T. Dupont logo—upright, determined, and proud. Ashtray in porcelain decorated with the Monogram 1872 pattern in burgundy. Hand-painted notches and borders.` },
    collection: `Monogram 1872`,
    categorySlug: "acessorios",
    image: `/products/ashtray-monogram-1872/006478.webp`,
    variants: [
      { sku: `006478`, name: { pt: `Cinzeiro · Monogram 1872 — Bordô`, en: `Ashtray · Monogram 1872 — Burgundy` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Bordô`, en: `Burgundy` }, hex: ["#7d2b27"] } }, image: `/products/ashtray-monogram-1872/006478.webp`, images: [`/products/ashtray-monogram-1872/006478.webp`, `/products/ashtray-monogram-1872/006478-2.webp`, `/products/ashtray-monogram-1872/006478-3.webp`] },
      { sku: `006479`, name: { pt: `Cinzeiro · Monogram 1872 — Preto`, en: `Ashtray · Monogram 1872 — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/ashtray-monogram-1872/006479.webp`, images: [`/products/ashtray-monogram-1872/006479.webp`, `/products/ashtray-monogram-1872/006479-2.webp`, `/products/ashtray-monogram-1872/006479-3.webp`] },
      { sku: `006480`, name: { pt: `Cinzeiro · Monogram 1872 — Cinzento Claro`, en: `Ashtray · Monogram 1872 — Light Gray` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Cinzento Claro`, en: `Light Gray` }, hex: ["#7a7d83"] } }, image: `/products/ashtray-monogram-1872/006480.webp`, images: [`/products/ashtray-monogram-1872/006480.webp`, `/products/ashtray-monogram-1872/006480-2.webp`, `/products/ashtray-monogram-1872/006480-3.webp`] },
    ],
  },
  {
    slug: `box-10-refills`,
    name: { pt: `Caixa de 10 Recargas Rollerball`, en: `Box of 10 Rollerball Refills` },
    description: { pt: `Recargas pretas de ponta média para canetas Rollerball, vendidas em caixas de 10. Para as seguintes canetas: Olympio, Défi, Liberté, Néo-classique Large, Classique 2, D.Link/Caprice, Fidelio, Ellipsis, Montparnasse, Gatsby, Line D, Mon Dupont by Karl Lagerfeld, Streamline R, New Line D, D-Initial.`, en: `Medium black refills for Roller pens are sold in boxes of 10. For the following pens: Olympio, Défi, Liberté, Néo-classique large, Classique 2, D.Link/Caprice, Fidelio, Ellipsis, Montparnasse, Gatsby, Line D, Mon Dupont by Karl Lagerfeld, Streamline R, New Line D, D-Initial.` },
    collection: `Refills & Inks`,
    categorySlug: "acessorios",
    image: `/products/box-10-refills/040831.webp`,
    variants: [
      { sku: `040831`, name: { pt: `Recargas Rollerball (cx. 10) — Black`, en: `Rollerball Refills (box of 10) — Black` }, priceCents: 7500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/box-10-refills/040831.webp`, images: [`/products/box-10-refills/040831.webp`] },
      { sku: `040110`, name: { pt: `Recargas Rollerball (cx. 10) — Black`, en: `Rollerball Refills (box of 10) — Black` }, priceCents: 6500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/box-10-refills/040110.webp`, images: [`/products/box-10-refills/040110.webp`] },
      { sku: `040843`, name: { pt: `Recargas Rollerball (cx. 10) — Black`, en: `Rollerball Refills (box of 10) — Black` }, priceCents: 9600, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/box-10-refills/040843.webp`, images: [`/products/box-10-refills/040843.webp`] },
      { sku: `040841`, name: { pt: `Recargas Rollerball (cx. 10) — Black`, en: `Rollerball Refills (box of 10) — Black` }, priceCents: 7500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/box-10-refills/040841.webp`, images: [`/products/box-10-refills/040841.webp`, `/products/box-10-refills/040841-2.webp`] },
      { sku: `040853`, name: { pt: `Recargas Rollerball (cx. 10) — Blue`, en: `Rollerball Refills (box of 10) — Blue` }, priceCents: 8600, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/box-10-refills/040853.webp`, images: [`/products/box-10-refills/040853.webp`, `/products/box-10-refills/040853-2.webp`] },
      { sku: `040830`, name: { pt: `Recargas Rollerball (cx. 10) — Blue`, en: `Rollerball Refills (box of 10) — Blue` }, priceCents: 7500, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/box-10-refills/040830.webp`, images: [`/products/box-10-refills/040830.webp`] },
      { sku: `040840`, name: { pt: `Recargas Rollerball (cx. 10) — Blue`, en: `Rollerball Refills (box of 10) — Blue` }, priceCents: 7500, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/box-10-refills/040840.webp`, images: [`/products/box-10-refills/040840.webp`] },
      { sku: `040207`, name: { pt: `Recargas Rollerball (cx. 10) — White`, en: `Rollerball Refills (box of 10) — White` }, priceCents: 13100, currency: "EUR", attributes: { color: { label: { pt: `Branco`, en: `White` }, hex: ["#efeae0"] } }, image: `/products/box-10-refills/040207.webp`, images: [`/products/box-10-refills/040207.webp`] },
      { sku: `040206`, name: { pt: `Recargas Rollerball (cx. 10) — Black`, en: `Rollerball Refills (box of 10) — Black` }, priceCents: 9600, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/box-10-refills/040206.webp`, images: [`/products/box-10-refills/040206.webp`] },
      { sku: `040363`, name: { pt: `Recargas Rollerball (cx. 10) — Green`, en: `Rollerball Refills (box of 10) — Green` }, priceCents: 6500, currency: "EUR", attributes: { color: { label: { pt: `Verde`, en: `Green` }, hex: ["#3b5d39"] } }, image: `/products/box-10-refills/040363.webp`, images: [`/products/box-10-refills/040363.webp`] },
      { sku: `040202`, name: { pt: `Recargas Rollerball (cx. 10) — Black`, en: `Rollerball Refills (box of 10) — Black` }, priceCents: 7500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/box-10-refills/040202.webp`, images: [`/products/box-10-refills/040202.webp`] },
      { sku: `040205`, name: { pt: `Recargas Rollerball (cx. 10) — Black`, en: `Rollerball Refills (box of 10) — Black` }, priceCents: 7600, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/box-10-refills/040205.webp`, images: [`/products/box-10-refills/040205.webp`] },
      { sku: `040203`, name: { pt: `Recargas Rollerball (cx. 10) — Black`, en: `Rollerball Refills (box of 10) — Black` }, priceCents: 7500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/box-10-refills/040203.webp`, images: [`/products/box-10-refills/040203.webp`] },
      { sku: `040201`, name: { pt: `Recargas Rollerball (cx. 10) — Black`, en: `Rollerball Refills (box of 10) — Black` }, priceCents: 9500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/box-10-refills/040201.webp`, images: [`/products/box-10-refills/040201.webp`] },
      { sku: `040208`, name: { pt: `Recargas Rollerball (cx. 10) — Black`, en: `Rollerball Refills (box of 10) — Black` }, priceCents: 15000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/box-10-refills/040208.webp`, images: [`/products/box-10-refills/040208.webp`] },
      { sku: `040362`, name: { pt: `Recargas Rollerball (cx. 10) — Red`, en: `Rollerball Refills (box of 10) — Red` }, priceCents: 6500, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/box-10-refills/040362.webp`, images: [`/products/box-10-refills/040362.webp`] },
      { sku: `040112`, name: { pt: `Recargas Rollerball (cx. 10) — Blue`, en: `Rollerball Refills (box of 10) — Blue` }, priceCents: 6500, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/box-10-refills/040112.webp`, images: [`/products/box-10-refills/040112.webp`] },
      { sku: `040364`, name: { pt: `Recargas Rollerball (cx. 10) — Turquoise Blue`, en: `Rollerball Refills (box of 10) — Turquoise Blue` }, priceCents: 6500, currency: "EUR", attributes: { color: { label: { pt: `Azul Turquesa`, en: `Turquoise Blue` }, hex: ["#1f3c66"] } }, image: `/products/box-10-refills/040364.webp`, images: [`/products/box-10-refills/040364.webp`] },
    ],
  },
  {
    slug: `box-12-refills`,
    name: { pt: `Caixa de 12 Recargas de Gás`, en: `Box of 12 Gas Refills` },
    description: { pt: `Recarga de gás vermelha. Vendida em embalagens de 12. Para os seguintes isqueiros: Le Grand S.T. Dupont, Ligne 2 Cling (C16XXX), Ligne 2 Slim (017XXX), Ligne 1 Grand Modelo, Jéroboam Table Lighter, Cylindrical Table Lighter.`, en: `Red gas refill. Sold in packs of 12. For the following lighters: Le Grand S.T. Dupont, Ligne 2 Cling (C16XXX), Ligne 2 Slim (017XXX), Ligne 1 Grand Model, Jéroboam Table Lighter, Cylindrical Table Lighter.` },
    collection: `Refills & Stones`,
    categorySlug: "acessorios",
    image: `/products/box-12-refills/000430.webp`,
    variants: [
      { sku: `000430`, name: { pt: `Recargas de Gás (cx. 12) — Black`, en: `Gas Refills (box of 12) — Black` }, priceCents: 15500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/box-12-refills/000430.webp`, images: [`/products/box-12-refills/000430.webp`] },
      { sku: `000436`, name: { pt: `Recargas de Gás (cx. 12) — Red`, en: `Gas Refills (box of 12) — Red` }, priceCents: 15500, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/box-12-refills/000436.webp`, images: [`/products/box-12-refills/000436.webp`] },
      { sku: `000433`, name: { pt: `Recargas de Gás (cx. 12) — Green`, en: `Gas Refills (box of 12) — Green` }, priceCents: 26500, currency: "EUR", attributes: { color: { label: { pt: `Verde`, en: `Green` }, hex: ["#3b5d39"] } }, image: `/products/box-12-refills/000433.webp`, images: [`/products/box-12-refills/000433.webp`] },
      { sku: `000444`, name: { pt: `Recargas de Gás (cx. 12) — White`, en: `Gas Refills (box of 12) — White` }, priceCents: 8400, currency: "EUR", attributes: { color: { label: { pt: `Branco`, en: `White` }, hex: ["#efeae0"] } }, image: `/products/box-12-refills/000444.webp`, images: [`/products/box-12-refills/000444.webp`] },
      { sku: `000435`, name: { pt: `Recargas de Gás (cx. 12) — Red`, en: `Gas Refills (box of 12) — Red` }, priceCents: 26500, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/box-12-refills/000435.webp`, images: [`/products/box-12-refills/000435.webp`] },
      { sku: `000432`, name: { pt: `Recargas de Gás (cx. 12) — Yellow`, en: `Gas Refills (box of 12) — Yellow` }, priceCents: 26500, currency: "EUR", attributes: { color: { label: { pt: `Amarelo`, en: `Yellow` }, hex: ["#7a7d83"] } }, image: `/products/box-12-refills/000432.webp`, images: [`/products/box-12-refills/000432.webp`] },
    ],
  },
  {
    slug: `box-5-refills`,
    name: { pt: `Frasco de Tinta (Cx. 5)`, en: `Ink Bottle (Box of 5)` },
    description: { pt: `Deixe a sua marca. Fiel ao savoir-faire e à tecnologia da S.T. Dupont, esta tinta azul de alta qualidade, especialmente concebida para tornar a escrita suave e fácil, é apresentada num frasco de vidro S.T. Dupont com uma tampa em crómio ornada com a letra D.`, en: `Leave your mark. In line with S.T.Dupont's craftsmanship and technology, this high-quality blue ink, specially designed to make writing smooth and easy, is presented in a S.T. Dupont glass bottle with a chrome cap adorned with the letter D.` },
    collection: `Refills & Inks`,
    categorySlug: "acessorios",
    image: `/products/box-5-refills/040161.webp`,
    variants: [
      { sku: `040161`, name: { pt: `Frasco de Tinta (cx. 5) — Black`, en: `Ink Bottle (box of 5) — Black` }, priceCents: 21000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/box-5-refills/040161.webp`, images: [`/products/box-5-refills/040161.webp`] },
      { sku: `408811`, name: { pt: `Frasco de Tinta (cx. 5) — Black`, en: `Ink Bottle (box of 5) — Black` }, priceCents: 15000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/box-5-refills/408811.webp`, images: [`/products/box-5-refills/408811.webp`] },
      { sku: `040159`, name: { pt: `Frasco de Tinta (cx. 5) — Royal Blue`, en: `Ink Bottle (box of 5) — Royal Blue` }, priceCents: 21000, currency: "EUR", attributes: { color: { label: { pt: `Azul Real`, en: `Royal Blue` }, hex: ["#1f3c66"] } }, image: `/products/box-5-refills/040159.webp`, images: [`/products/box-5-refills/040159.webp`] },
    ],
  },
  {
    slug: `box-7-refills`,
    name: { pt: `Caixa de 7 Recargas Esferográfica`, en: `Box of 7 Ballpoint Refills` },
    description: { pt: `Recarga turquesa de ponta média para esferográfica, para todas as canetas das linhas Défi, Liberté, Line D, Streamliner-R e D-Initial Jet 8 Pen. Vendida em caixas de 7.`, en: `Turquoise medium ballpoint refill for all pens from the Défi, Liberté, Line D, Streamliner-R, and D-Initial Jet 8 Pen lines. Sold in boxes of 7.` },
    collection: `Refills & Inks`,
    categorySlug: "acessorios",
    image: `/products/box-7-refills/040359.webp`,
    variants: [
      { sku: `040359`, name: { pt: `Recargas Esferográfica (cx. 7) — Red`, en: `Ballpoint Refills (box of 7) — Red` }, priceCents: 9000, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/box-7-refills/040359.webp`, images: [`/products/box-7-refills/040359.webp`] },
      { sku: `040361`, name: { pt: `Recargas Esferográfica (cx. 7) — Turquoise Blue`, en: `Ballpoint Refills (box of 7) — Turquoise Blue` }, priceCents: 9000, currency: "EUR", attributes: { color: { label: { pt: `Azul Turquesa`, en: `Turquoise Blue` }, hex: ["#1f3c66"] } }, image: `/products/box-7-refills/040361.webp`, images: [`/products/box-7-refills/040361.webp`] },
    ],
  },
  {
    slug: `cigar-cutter-fender`,
    name: { pt: `Corta-Charuto · Fender`, en: `Cigar Cutter · Fender` },
    description: { pt: `Acessório S.T. Dupont — feito à mão nas oficinas de Faverges, herdeiro do savoir-faire da Maison desde 1872.`, en: `Acessório S.T. Dupont — feito à mão nas oficinas de Faverges, herdeiro do savoir-faire da Maison desde 1872.` },
    collection: `Fender`,
    categorySlug: "acessorios",
    image: `/products/cigar-cutter-fender/003445.webp`,
    variants: [
      { sku: `003445`, name: { pt: `Cigar Cutter · Fender — Preto`, en: `Cigar Cutter · Fender — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/cigar-cutter-fender/003445.webp`, images: [`/products/cigar-cutter-fender/003445.webp`, `/products/cigar-cutter-fender/003445-2.webp`, `/products/cigar-cutter-fender/003445-3.webp`] },
    ],
  },
  {
    slug: `cigar-cutter-fire-x-2`,
    name: { pt: `Corta-Charuto · Fire X`, en: `Cigar Cutter · Fire X` },
    description: { pt: `Acessório S.T. Dupont — feito à mão nas oficinas de Faverges, herdeiro do savoir-faire da Maison desde 1872.`, en: `Acessório S.T. Dupont — feito à mão nas oficinas de Faverges, herdeiro do savoir-faire da Maison desde 1872.` },
    collection: `Fire X`,
    categorySlug: "acessorios",
    image: `/products/cigar-cutter-fire-x-2/003370.webp`,
    variants: [
      { sku: `003370`, name: { pt: `Cigar Cutter · Fire X — Preto`, en: `Cigar Cutter · Fire X — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/cigar-cutter-fire-x-2/003370.webp`, images: [`/products/cigar-cutter-fire-x-2/003370.webp`, `/products/cigar-cutter-fire-x-2/003370-2.webp`, `/products/cigar-cutter-fire-x-2/003370-3.webp`] },
    ],
  },
  {
    slug: `cigar-cutter-monogram-1872-2`,
    name: { pt: `Corta-Charuto · Monogram 1872`, en: `Cigar Cutter · Monogram 1872` },
    description: { pt: `Acessório S.T. Dupont — feito à mão nas oficinas de Faverges, herdeiro do savoir-faire da Maison desde 1872.`, en: `Acessório S.T. Dupont — feito à mão nas oficinas de Faverges, herdeiro do savoir-faire da Maison desde 1872.` },
    collection: `Monogram 1872`,
    categorySlug: "acessorios",
    image: `/products/cigar-cutter-monogram-1872-2/003478.webp`,
    variants: [
      { sku: `003478`, name: { pt: `Cigar Cutter · Monogram 1872 — Bordô`, en: `Cigar Cutter · Monogram 1872 — Burgundy` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Bordô`, en: `Burgundy` }, hex: ["#7d2b27"] } }, image: `/products/cigar-cutter-monogram-1872-2/003478.webp`, images: [`/products/cigar-cutter-monogram-1872-2/003478.webp`, `/products/cigar-cutter-monogram-1872-2/003478-2.webp`, `/products/cigar-cutter-monogram-1872-2/003478-3.webp`] },
    ],
  },
  {
    slug: `cigar-humidor-2`,
    name: { pt: `Humidor de Charutos`, en: `Cigar-humidor` },
    description: { pt: `Convidamo-lo a uma viagem rumo à excelência com o nosso humidor para charutos Prestige. Um design de grande elegância para os verdadeiros aficionados do sector. Madeira de ayous magnificamente trabalhada no exterior do humidor e madeira de sipo no interior. Um acessório para o armazenamento prolongado de charutos, com capacidade para até 135 charutos Corona. Dimensões: 443 x 273 x 20 mm. Kit grande de humidificação Boveda (ref. 087378) incluído com o seu humidor.`, en: `We invite you to a journey towards excellence with our Prestige cigar humidor. Graceful design for true sector aficionados. Magnificently worked ayous wood on the outside of the humidor, and sipo wood on the inside. An accessory for long-term cigar storage, and it can hold up to 135 Corona cigars. Dimensions: 443x 273 x 20 mm Boveda large humidification kit (ref 087378) included with your cigar humidor.` },
    collection: `Cigar-humidor`,
    categorySlug: "acessorios",
    image: `/products/cigar-humidor-2/001319.webp`,
    variants: [
      { sku: `001319`, name: { pt: `Humidor de Charutos — Preto`, en: `Cigar-humidor — Black` }, priceCents: 171500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/cigar-humidor-2/001319.webp`, images: [`/products/cigar-humidor-2/001319.webp`, `/products/cigar-humidor-2/001319-2.webp`, `/products/cigar-humidor-2/001319-3.webp`] },
      { sku: `001317`, name: { pt: `Humidor de Charutos — Verde`, en: `Cigar-humidor — Green` }, priceCents: 85500, currency: "EUR", attributes: { color: { label: { pt: `Verde`, en: `Green` }, hex: ["#3b5d39"] } }, image: `/products/cigar-humidor-2/001317.webp`, images: [`/products/cigar-humidor-2/001317.webp`, `/products/cigar-humidor-2/001317-2.webp`, `/products/cigar-humidor-2/001317-3.webp`] },
      { sku: `001356`, name: { pt: `Humidor de Charutos — Caqui`, en: `Cigar-humidor — Khaki` }, priceCents: 43500, currency: "EUR", attributes: { color: { label: { pt: `Caqui`, en: `Khaki` }, hex: ["#3b5d39"] } }, image: `/products/cigar-humidor-2/001356.webp`, images: [`/products/cigar-humidor-2/001356.webp`, `/products/cigar-humidor-2/001356-2.webp`, `/products/cigar-humidor-2/001356-3.webp`] },
    ],
  },
  {
    slug: `cigarette-case-monogram-1872`,
    name: { pt: `Estojo para Cigarros · Monogram 1872`, en: `Cigarette Case · Monogram 1872` },
    description: { pt: `A arte do metal, tal como a arte da laca e do couro revestido, evidenciam o savoir-faire da S.T. Dupont na colecção Monogram 1872. Bem ancoradas no seu tempo, as peças da colecção exibem todas o novo logótipo S.T. Dupont — direito, determinado e altivo. Estojo para cigarros/cigarrilhas em lona revestida decorada com o Monograma 1872 em Bordéus e base em metal dourado, com capacidade para até 8 cigarros.`, en: `Craftsmanship in metal, as well as the art of lacquer and coated leather, showcase the expertise of S.T. Dupont in the Monogram 1872 collection. Well-rooted in their time, the pieces in the collection all feature the new S.T. Dupont logo—upright, determined, and proud. Cigarette/cigarillo case in coated canvas decorated with the 1872 Monogram in burgundy and a gilded metal base for up to 8 cigarettes.` },
    collection: `Monogram 1872`,
    categorySlug: "acessorios",
    image: `/products/cigarette-case-monogram-1872/183178.webp`,
    variants: [
      { sku: `183178`, name: { pt: `Estojo para Cigarros · Monogram 1872 — Bordô`, en: `Cigarette Case · Monogram 1872 — Burgundy` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Bordô`, en: `Burgundy` }, hex: ["#7d2b27"] } }, image: `/products/cigarette-case-monogram-1872/183178.webp`, images: [`/products/cigarette-case-monogram-1872/183178.webp`, `/products/cigarette-case-monogram-1872/183178-2.webp`, `/products/cigarette-case-monogram-1872/183178-3.webp`] },
      { sku: `183179`, name: { pt: `Estojo para Cigarros · Monogram 1872 — Preto`, en: `Cigarette Case · Monogram 1872 — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/cigarette-case-monogram-1872/183179.webp`, images: [`/products/cigarette-case-monogram-1872/183179.webp`, `/products/cigarette-case-monogram-1872/183179-2.webp`, `/products/cigarette-case-monogram-1872/183179-3.webp`] },
      { sku: `183180`, name: { pt: `Estojo para Cigarros · Monogram 1872 — Cinzento Claro`, en: `Cigarette Case · Monogram 1872 — Light Gray` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Cinzento Claro`, en: `Light Gray` }, hex: ["#7a7d83"] } }, image: `/products/cigarette-case-monogram-1872/183180.webp`, images: [`/products/cigarette-case-monogram-1872/183180.webp`, `/products/cigarette-case-monogram-1872/183180-2.webp`, `/products/cigarette-case-monogram-1872/183180-3.webp`] },
    ],
  },
  {
    slug: `cufflinks-monogram-1872`,
    name: { pt: `Botões de Punho · Monogram 1872`, en: `Cufflinks · Monogram 1872` },
    description: { pt: `A arte do metal, tal como a arte da laca e do couro revestido, evidenciam o savoir-faire da S.T. Dupont na colecção Monogram 1872. Bem ancoradas no seu tempo, as peças da colecção exibem todas o novo logótipo S.T. Dupont — direito, determinado e altivo. Botões de punho em crómio gravados com o guilloché Monogram 1872. Made in Germany.`, en: `Craftsmanship in metal, as well as the art of lacquer and coated leather, showcase the expertise of S.T. Dupont in the Monogram 1872 collection. Well-rooted in their time, the pieces in the collection all feature the new S.T. Dupont logo—upright, determined, and proud. Chrome cufflinks engraved with the Monogram 1872 guilloche. Made in Germany.` },
    collection: `Monogram 1872`,
    categorySlug: "acessorios",
    image: `/products/cufflinks-monogram-1872/005540.webp`,
    variants: [
      { sku: `005540`, name: { pt: `Botões de Punho · Monogram 1872 — Dourado`, en: `Cufflinks · Monogram 1872 — Golden` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/cufflinks-monogram-1872/005540.webp`, images: [`/products/cufflinks-monogram-1872/005540.webp`, `/products/cufflinks-monogram-1872/005540-2.webp`, `/products/cufflinks-monogram-1872/005540-3.webp`] },
      { sku: `005541`, name: { pt: `Botões de Punho · Monogram 1872 — Prateado`, en: `Cufflinks · Monogram 1872 — Silver` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Prateado`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/cufflinks-monogram-1872/005541.webp`, images: [`/products/cufflinks-monogram-1872/005541.webp`, `/products/cufflinks-monogram-1872/005541-2.webp`, `/products/cufflinks-monogram-1872/005541-3.webp`] },
    ],
  },
  {
    slug: `d-initial-dragon`,
    name: { pt: `D-Initial · Dragon`, en: `D-Initial · Dragon` },
    description: { pt: `Gravado no corpo do icónico D-Initial, o dragão preto da S.T. Dupont ondula sobre este instrumento de escrita na cor crómio. Recargas associadas: 040853 Azul 040854 Preta 040358 Rosa 040359 Vermelha 040360 Verde 040361 Turquesa`, en: `Engraved on the body of the iconic D-Initial, the black S.T. Dupont dragon undulates on this chrome-colored writing instrument. Associated Refills: 040853 Blue 040854 Black 040358 Pink 040359 Red 040360 Green 040361 Turquoise` },
    collection: `Dragon`,
    categorySlug: "escrita",
    image: `/products/d-initial-dragon/265026.webp`,
    variants: [
      { sku: `265026`, name: { pt: `D-Initial · Dragon — Dourado`, en: `D-Initial · Dragon — Golden` }, priceCents: 23000, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/d-initial-dragon/265026.webp`, images: [`/products/d-initial-dragon/265026.webp`, `/products/d-initial-dragon/265026-2.webp`, `/products/d-initial-dragon/265026-3.webp`, `/products/d-initial-dragon/265026-4.webp`] },
      { sku: `265027`, name: { pt: `D-Initial · Dragon — Prateado`, en: `D-Initial · Dragon — Silver` }, priceCents: 23000, currency: "EUR", attributes: { color: { label: { pt: `Prateado`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/d-initial-dragon/265027.webp`, images: [`/products/d-initial-dragon/265027.webp`, `/products/d-initial-dragon/265027-2.webp`, `/products/d-initial-dragon/265027-3.webp`, `/products/d-initial-dragon/265027-4.webp`] },
      { sku: `265028`, name: { pt: `D-Initial · Dragon — Bordô`, en: `D-Initial · Dragon — Burgundy` }, priceCents: 18000, currency: "EUR", attributes: { color: { label: { pt: `Bordô`, en: `Burgundy` }, hex: ["#7d2b27"] } }, image: `/products/d-initial-dragon/265028.webp`, images: [`/products/d-initial-dragon/265028.webp`, `/products/d-initial-dragon/265028-2.webp`, `/products/d-initial-dragon/265028-3.webp`, `/products/d-initial-dragon/265028-4.webp`] },
      { sku: `265029`, name: { pt: `D-Initial · Dragon — Mel`, en: `D-Initial · Dragon — Honey` }, priceCents: 18000, currency: "EUR", attributes: { color: { label: { pt: `Mel`, en: `Honey` }, hex: ["#7a7d83"] } }, image: `/products/d-initial-dragon/265029.webp`, images: [`/products/d-initial-dragon/265029.webp`, `/products/d-initial-dragon/265029-2.webp`, `/products/d-initial-dragon/265029-3.webp`, `/products/d-initial-dragon/265029-4.webp`] },
      { sku: `265030`, name: { pt: `D-Initial · Dragon — Azul Real`, en: `D-Initial · Dragon — Royal Blue` }, priceCents: 18000, currency: "EUR", attributes: { color: { label: { pt: `Azul Real`, en: `Royal Blue` }, hex: ["#1f3c66"] } }, image: `/products/d-initial-dragon/265030.webp`, images: [`/products/d-initial-dragon/265030.webp`, `/products/d-initial-dragon/265030-2.webp`, `/products/d-initial-dragon/265030-3.webp`, `/products/d-initial-dragon/265030-4.webp`] },
    ],
  },
  {
    slug: `eternity-2`,
    name: { pt: `Eternity`, en: `Eternity` },
    description: { pt: `A S.T. Dupont reinventa a sua icónica colecção de instrumentos de escrita Line D com a Line D Eternity. A colecção emblemática da S.T. Dupont foi reimaginada de forma mais moderna, criando uma experiência de escrita única. As linhas refinadas e esguias tornam a colecção Line D Eternity resolutamente contemporânea. O novo clip «Sword» é um aceno à célebre frase do autor inglês Edward Bulwer-Lytton: «The pen is mightier than the sword», ecoando a herança da Maison, em particular a icónica colecção Sword. O savoir-faire da Maison S.T. Dupont expressa-se através desta colecção com elegância intemporal. A Line D Eternity está disponível nas versões esferográfica, rollerball e tinta permanente, em tamanho médio e grande. Este instrumento de escrita de tamanho médio é ornamentado com o novo bico «Wings» em ouro maciço de 14 quilates. Esta versão de ourivesaria da Line D Eternity apresenta o icónico padrão guilloché ponta de diamante da Maison na cor paládio. A Line D Eternity é fabricada nas nossas oficinas em Faverges, França. Recargas associadas: 040112 Azul 040110 Preta 040362 Vermelha 040363 Verde 040364 Turquesa.`, en: `"S.T. Dupont reinvents its iconic Line D writing instrument collection with Line D Eternity. The emblematic collection from S.T. Dupont has been reimagined in a more modern way, creating a unique writing experience. The refined and slender lines make the Line D Eternity collection decidedly contemporary. The new 'Sword' clip is a nod to the famous phrase by English author Edward Bulwer-Lytton: 'The pen is mightier than the sword,' echoing the heritage of the House, particularly the iconic Sword collection. The craftsmanship of Maison S.T. Dupont is expressed through this collection with timeless elegance. Line D Eternity is available in ballpoint, rollerball, and fountain pen versions, in both medium and large sizes. This medium-sized writing instrument is adorned with the new 'Wings' solid 14-carat gold nib. This goldsmith version of the Line D Eternity features the iconic Maison's diamond head guilloche pattern in palladium color. Line D Eternity is crafted in our workshops in Faverges, France. Associated refills: 040112 Blue 040110 Black 040362 Red 040363 Green 040364 Turquoise"` },
    collection: `Eternity`,
    categorySlug: "escrita",
    image: `/products/eternity-2/425015L.webp`,
    variants: [
      { sku: `425015L`, name: { pt: `Eternity — Variante 015L`, en: `Eternity — Variant 015L` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Variante 015L`, en: `Variant 015L` }, hex: ["#7a7d83"] } }, image: `/products/eternity-2/425015L.webp`, images: [`/products/eternity-2/425015L.webp`, `/products/eternity-2/425015L-2.webp`, `/products/eternity-2/425015L-3.webp`, `/products/eternity-2/425015L-4.webp`] },
      { sku: `425017L`, name: { pt: `Eternity — Variante 017L`, en: `Eternity — Variant 017L` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Variante 017L`, en: `Variant 017L` }, hex: ["#7a7d83"] } }, image: `/products/eternity-2/425017L.webp`, images: [`/products/eternity-2/425017L.webp`, `/products/eternity-2/425017L-2.webp`, `/products/eternity-2/425017L-3.webp`, `/products/eternity-2/425017L-4.webp`] },
      { sku: `425220L`, name: { pt: `Eternity — Variante 220L`, en: `Eternity — Variant 220L` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Variante 220L`, en: `Variant 220L` }, hex: ["#7a7d83"] } }, image: `/products/eternity-2/425220L.webp`, images: [`/products/eternity-2/425220L.webp`, `/products/eternity-2/425220L-2.webp`, `/products/eternity-2/425220L-3.webp`, `/products/eternity-2/425220L-4.webp`] },
      { sku: `425014M`, name: { pt: `Eternity — Azul`, en: `Eternity — Blue` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/eternity-2/425014M.webp`, images: [`/products/eternity-2/425014M.webp`, `/products/eternity-2/425014M-2.webp`, `/products/eternity-2/425014M-3.webp`, `/products/eternity-2/425014M-4.webp`] },
      { sku: `425016M`, name: { pt: `Eternity — Variante 016M`, en: `Eternity — Variant 016M` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Variante 016M`, en: `Variant 016M` }, hex: ["#7a7d83"] } }, image: `/products/eternity-2/425016M.webp`, images: [`/products/eternity-2/425016M.webp`, `/products/eternity-2/425016M-2.webp`, `/products/eternity-2/425016M-3.webp`, `/products/eternity-2/425016M-4.webp`] },
      { sku: `425018M`, name: { pt: `Eternity — Variante 018M`, en: `Eternity — Variant 018M` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Variante 018M`, en: `Variant 018M` }, hex: ["#7a7d83"] } }, image: `/products/eternity-2/425018M.webp`, images: [`/products/eternity-2/425018M.webp`, `/products/eternity-2/425018M-2.webp`, `/products/eternity-2/425018M-3.webp`, `/products/eternity-2/425018M-4.webp`] },
      { sku: `425220M`, name: { pt: `Eternity — Variante 220M`, en: `Eternity — Variant 220M` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Variante 220M`, en: `Variant 220M` }, hex: ["#7a7d83"] } }, image: `/products/eternity-2/425220M.webp`, images: [`/products/eternity-2/425220M.webp`, `/products/eternity-2/425220M-2.webp`, `/products/eternity-2/425220M-3.webp`, `/products/eternity-2/425220M-4.webp`] },
      { sku: `420220XL`, name: { pt: `Eternity — Preto`, en: `Eternity — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/eternity-2/420220XL.webp`, images: [`/products/eternity-2/420220XL.webp`, `/products/eternity-2/420220XL-2.webp`, `/products/eternity-2/420220XL-3.webp`, `/products/eternity-2/420220XL-4.webp`] },
      { sku: `422017L`, name: { pt: `Eternity — Variante 017L`, en: `Eternity — Variant 017L` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Variante 017L`, en: `Variant 017L` }, hex: ["#7a7d83"] } }, image: `/products/eternity-2/422017L.webp`, images: [`/products/eternity-2/422017L.webp`, `/products/eternity-2/422017L-2.webp`, `/products/eternity-2/422017L-3.webp`, `/products/eternity-2/422017L-4.webp`] },
      { sku: `422220L`, name: { pt: `Eternity — Azul`, en: `Eternity — Blue` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/eternity-2/422220L.webp`, images: [`/products/eternity-2/422220L.webp`, `/products/eternity-2/422220L-2.webp`, `/products/eternity-2/422220L-3.webp`, `/products/eternity-2/422220L-4.webp`] },
      { sku: `422014M`, name: { pt: `Eternity — Variante 014M`, en: `Eternity — Variant 014M` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Variante 014M`, en: `Variant 014M` }, hex: ["#7a7d83"] } }, image: `/products/eternity-2/422014M.webp`, images: [`/products/eternity-2/422014M.webp`, `/products/eternity-2/422014M-2.webp`, `/products/eternity-2/422014M-3.webp`, `/products/eternity-2/422014M-4.webp`] },
      { sku: `422016M`, name: { pt: `Eternity — Variante 016M`, en: `Eternity — Variant 016M` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Variante 016M`, en: `Variant 016M` }, hex: ["#7a7d83"] } }, image: `/products/eternity-2/422016M.webp`, images: [`/products/eternity-2/422016M.webp`, `/products/eternity-2/422016M-2.webp`, `/products/eternity-2/422016M-3.webp`, `/products/eternity-2/422016M-4.webp`] },
      { sku: `422018M`, name: { pt: `Eternity — Variante 018M`, en: `Eternity — Variant 018M` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Variante 018M`, en: `Variant 018M` }, hex: ["#7a7d83"] } }, image: `/products/eternity-2/422018M.webp`, images: [`/products/eternity-2/422018M.webp`, `/products/eternity-2/422018M-2.webp`, `/products/eternity-2/422018M-3.webp`, `/products/eternity-2/422018M-4.webp`] },
      { sku: `422220M`, name: { pt: `Eternity — Variante 220M`, en: `Eternity — Variant 220M` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Variante 220M`, en: `Variant 220M` }, hex: ["#7a7d83"] } }, image: `/products/eternity-2/422220M.webp`, images: [`/products/eternity-2/422220M.webp`, `/products/eternity-2/422220M-2.webp`, `/products/eternity-2/422220M-3.webp`, `/products/eternity-2/422220M-4.webp`] },
    ],
  },
  {
    slug: `eternity-dragon`,
    name: { pt: `Eternity · Dragon`, en: `Eternity · Dragon` },
    description: { pt: `A Line D Eternity Large Dragon Black apresenta um dragão multicolor que ondula sobre a sua tampa. O corpo é decorado com o novo guilloché de escamas de dragão, que se expressa sob laca Dupont preta. Este instrumento de escrita, a Line D Eternity Large, é apresentado numa caixa com bico em ouro maciço de 14 quilates e corpo rollerball, e é fabricado nas nossas oficinas em Faverges, França. Recargas de tinta permanente associadas: 040112 Azul 040110 Preta 040362 Vermelha 040363 Verde 040364 Turquesa. Recargas rollerball associadas: 040840 Azul 040841 Preta.`, en: `The Line D Eternity Large Dragon Black features a multicolored dragon that undulates on its cap. Its sleeve is decorated with the new dragon scale guilloche that is expressed under Dupont black lacquer. This writing instrument, the Line D Eternity Large, comes in a box with a 14-carat solid gold nib and a roller sleeve, and is made in our workshops in Faverges, France. Associated nib refills: 040112 Blue 040110 Black 040362 Red 040363 Green 040364 Turquoise Associated roller refills: 040840 Blue 040841 Black` },
    collection: `Dragon`,
    categorySlug: "escrita",
    image: `/products/eternity-dragon/420028L.webp`,
    variants: [
      { sku: `420028L`, name: { pt: `Eternity · Dragon — Bordô`, en: `Eternity · Dragon — Burgundy` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Bordô`, en: `Burgundy` }, hex: ["#7d2b27"] } }, image: `/products/eternity-dragon/420028L.webp`, images: [`/products/eternity-dragon/420028L.webp`, `/products/eternity-dragon/420028L-2.webp`, `/products/eternity-dragon/420028L-3.webp`, `/products/eternity-dragon/420028L-4.webp`] },
      { sku: `420029L`, name: { pt: `Eternity · Dragon — Mel`, en: `Eternity · Dragon — Honey` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Mel`, en: `Honey` }, hex: ["#7a7d83"] } }, image: `/products/eternity-dragon/420029L.webp`, images: [`/products/eternity-dragon/420029L.webp`, `/products/eternity-dragon/420029L-2.webp`, `/products/eternity-dragon/420029L-3.webp`, `/products/eternity-dragon/420029L-4.webp`] },
      { sku: `420030L`, name: { pt: `Eternity · Dragon — Azul Real`, en: `Eternity · Dragon — Royal Blue` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Azul Real`, en: `Royal Blue` }, hex: ["#1f3c66"] } }, image: `/products/eternity-dragon/420030L.webp`, images: [`/products/eternity-dragon/420030L.webp`, `/products/eternity-dragon/420030L-2.webp`, `/products/eternity-dragon/420030L-3.webp`, `/products/eternity-dragon/420030L-4.webp`] },
      { sku: `420026L`, name: { pt: `Eternity · Dragon — Mel`, en: `Eternity · Dragon — Honey` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Mel`, en: `Honey` }, hex: ["#7a7d83"] } }, image: `/products/eternity-dragon/420026L.webp`, images: [`/products/eternity-dragon/420026L.webp`, `/products/eternity-dragon/420026L-2.webp`, `/products/eternity-dragon/420026L-3.webp`, `/products/eternity-dragon/420026L-4.webp`] },
      { sku: `420027L`, name: { pt: `Eternity · Dragon — Preto`, en: `Eternity · Dragon — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/eternity-dragon/420027L.webp`, images: [`/products/eternity-dragon/420027L.webp`, `/products/eternity-dragon/420027L-2.webp`, `/products/eternity-dragon/420027L-3.webp`, `/products/eternity-dragon/420027L-4.webp`] },
      { sku: `422028L`, name: { pt: `Eternity · Dragon — Bordô`, en: `Eternity · Dragon — Burgundy` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Bordô`, en: `Burgundy` }, hex: ["#7d2b27"] } }, image: `/products/eternity-dragon/422028L.webp`, images: [`/products/eternity-dragon/422028L.webp`, `/products/eternity-dragon/422028L-2.webp`, `/products/eternity-dragon/422028L-3.webp`, `/products/eternity-dragon/422028L-4.webp`] },
      { sku: `422029L`, name: { pt: `Eternity · Dragon — Mel`, en: `Eternity · Dragon — Honey` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Mel`, en: `Honey` }, hex: ["#7a7d83"] } }, image: `/products/eternity-dragon/422029L.webp`, images: [`/products/eternity-dragon/422029L.webp`, `/products/eternity-dragon/422029L-2.webp`, `/products/eternity-dragon/422029L-3.webp`, `/products/eternity-dragon/422029L-4.webp`] },
      { sku: `422030L`, name: { pt: `Eternity · Dragon — Azul Real`, en: `Eternity · Dragon — Royal Blue` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Azul Real`, en: `Royal Blue` }, hex: ["#1f3c66"] } }, image: `/products/eternity-dragon/422030L.webp`, images: [`/products/eternity-dragon/422030L.webp`, `/products/eternity-dragon/422030L-2.webp`, `/products/eternity-dragon/422030L-3.webp`, `/products/eternity-dragon/422030L-4.webp`] },
    ],
  },
  {
    slug: `gas-refill-2`,
    name: { pt: `Recarga de Gás · Cartucho Padrão`, en: `Gas Refill · Standard Cartridge` },
    description: { pt: `Recarga de gás vermelha. Vendida individualmente. Para os seguintes isqueiros: Le Grand S.T. Dupont, Ligne 2 Cling (C16XXX), Ligne 2 Slim (017XXX), Ligne 1 Grande Modelo, Jéroboam Table Lighter, Cylindrical Table Lighter.`, en: `Red gas refill. Sold individually. For the following lighters: Le Grand S.T. Dupont, Line 2 Cling (C16XXX), Line 2 Slim (017XXX), Line 1 Large Model, Jéroboam Table Lighter, Cylindrical Table Lighter.` },
    collection: `Refills & Stones`,
    categorySlug: "acessorios",
    image: `/products/gas-refill-2/900430.webp`,
    variants: [
      { sku: `900430`, name: { pt: `Recarga de Gás — Black`, en: `Gas Refill — Black` }, priceCents: 1500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/gas-refill-2/900430.webp`, images: [`/products/gas-refill-2/900430.webp`] },
      { sku: `900434`, name: { pt: `Recarga de Gás — Blue`, en: `Gas Refill — Blue` }, priceCents: 2000, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/gas-refill-2/900434.webp`, images: [`/products/gas-refill-2/900434.webp`] },
      { sku: `900436`, name: { pt: `Recarga de Gás — Red`, en: `Gas Refill — Red` }, priceCents: 1500, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/gas-refill-2/900436.webp`, images: [`/products/gas-refill-2/900436.webp`] },
      { sku: `900433`, name: { pt: `Recarga de Gás — Green`, en: `Gas Refill — Green` }, priceCents: 2000, currency: "EUR", attributes: { color: { label: { pt: `Verde`, en: `Green` }, hex: ["#3b5d39"] } }, image: `/products/gas-refill-2/900433.webp`, images: [`/products/gas-refill-2/900433.webp`] },
      { sku: `900444`, name: { pt: `Recarga de Gás — White`, en: `Gas Refill — White` }, priceCents: 1000, currency: "EUR", attributes: { color: { label: { pt: `Branco`, en: `White` }, hex: ["#efeae0"] } }, image: `/products/gas-refill-2/900444.webp`, images: [`/products/gas-refill-2/900444.webp`] },
      { sku: `900435`, name: { pt: `Recarga de Gás — Red`, en: `Gas Refill — Red` }, priceCents: 2000, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/gas-refill-2/900435.webp`, images: [`/products/gas-refill-2/900435.webp`] },
      { sku: `900432`, name: { pt: `Recarga de Gás — Yellow`, en: `Gas Refill — Yellow` }, priceCents: 2000, currency: "EUR", attributes: { color: { label: { pt: `Amarelo`, en: `Yellow` }, hex: ["#7a7d83"] } }, image: `/products/gas-refill-2/900432.webp`, images: [`/products/gas-refill-2/900432.webp`] },
    ],
  },
  {
    slug: `initial-3`,
    name: { pt: `Initial`, en: `Initial` },
    description: { pt: `Isqueiro Initial, decoração em guilloché cinético, acabamentos em paládio. Com dupla chama amarela. Pedra de isqueiro associada: vermelha (REF 900650) Recarga de gás associada: azul (REF 900434) Isqueiro entregue sem gás, recarga vendida em separado.`, en: `Initial lighter, cinatic guilloche decor, palladium finishes. With a double yellow flame. Associated lighter stone: red (REF 900650) Associated gas recharge: blue (REF 900434) Lighter delivered empty of gas, refill sold separately.` },
    collection: `Initial`,
    categorySlug: "escrita",
    image: `/products/initial-3/020840.webp`,
    variants: [
      { sku: `020840`, name: { pt: `Initial — Prateado`, en: `Initial — Silver` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Prateado`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/initial-3/020840.webp`, images: [`/products/initial-3/020840.webp`, `/products/initial-3/020840-2.webp`, `/products/initial-3/020840-3.webp`, `/products/initial-3/020840-4.webp`] },
      { sku: `020841`, name: { pt: `Initial — Dourado`, en: `Initial — Golden` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/initial-3/020841.webp`, images: [`/products/initial-3/020841.webp`, `/products/initial-3/020841-2.webp`, `/products/initial-3/020841-3.webp`, `/products/initial-3/020841-4.webp`] },
      { sku: `020844`, name: { pt: `Initial — Prateado`, en: `Initial — Silver` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Prateado`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/initial-3/020844.webp`, images: [`/products/initial-3/020844.webp`, `/products/initial-3/020844-2.webp`, `/products/initial-3/020844-3.webp`, `/products/initial-3/020844-4.webp`] },
    ],
  },
  {
    slug: `keyring`,
    name: { pt: `Porta-Chaves`, en: `Keyring` },
    description: { pt: `A nova colecção de acessórios da S.T. Dupont inspira-se nos códigos icónicos da Maison, dando origem a produtos de elegância singular. Porta-chaves trainer em prata e dourado. Made in Italy`, en: `The new accessories collection from S.T. Dupont is inspired by the iconic codes of the House, creating products of singular elegance. Silver and gold trainer keyring Made in Italy` },
    collection: `Keyring`,
    categorySlug: "acessorios",
    image: `/products/keyring/003119.webp`,
    variants: [
      { sku: `003119`, name: { pt: `Porta-Chaves — Dourado`, en: `Keyring — Golden` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/keyring/003119.webp`, images: [`/products/keyring/003119.webp`, `/products/keyring/003119-2.webp`] },
      { sku: `003120`, name: { pt: `Porta-Chaves — Prateado`, en: `Keyring — Silver` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Prateado`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/keyring/003120.webp`, images: [`/products/keyring/003120.webp`, `/products/keyring/003120-2.webp`] },
    ],
  },
  {
    slug: `keyrings`,
    name: { pt: `Porta-Chaves`, en: `Keyrings` },
    description: { pt: `A nova colecção de acessórios da S.T. Dupont inspira-se nos códigos icónicos da Maison, dando origem a produtos de elegância singular. Porta-chaves com fivela STD em couro de vitela granulado com detalhes prateados. Made in Italy`, en: `The new accessories collection from S.T. Dupont is inspired by the House's iconic codes, creating products of singular elegance. STD buckle keyring in grained calf leather with silver details Made in Italy` },
    collection: `Keyrings`,
    categorySlug: "acessorios",
    image: `/products/keyrings/003118.webp`,
    variants: [
      { sku: `003118`, name: { pt: `Porta-Chaves — Preto`, en: `Keyrings — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/keyrings/003118.webp`, images: [`/products/keyrings/003118.webp`, `/products/keyrings/003118-2.webp`] },
    ],
  },
  {
    slug: `keyrings-monogram-1872`,
    name: { pt: `Porta-Chaves · Monogram 1872`, en: `Keyrings · Monogram 1872` },
    description: { pt: `A arte do metal, tal como a arte da laca e do couro revestido, evidenciam o savoir-faire da S.T. Dupont na colecção Monogram 1872. Bem ancoradas no seu tempo, as peças da colecção exibem todas o novo logótipo S.T. Dupont — direito, determinado e altivo. Porta-chaves em crómio gravado com o guilloché Monogram 1872. Made in China.`, en: `Craftsmanship in metal, as well as the art of lacquer and coated leather, showcase the expertise of S.T. Dupont in the Monogram 1872 collection. Well-rooted in their time, the pieces in the collection all feature the new S.T. Dupont logo—upright, determined, and proud. Chrome keychain engraved with the Monogram 1872 guilloche. Made in China.` },
    collection: `Monogram 1872`,
    categorySlug: "acessorios",
    image: `/products/keyrings-monogram-1872/003541.webp`,
    variants: [
      { sku: `003541`, name: { pt: `Porta-Chaves · Monogram 1872 — Prateado`, en: `Keyrings · Monogram 1872 — Silver` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Prateado`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/keyrings-monogram-1872/003541.webp`, images: [`/products/keyrings-monogram-1872/003541.webp`, `/products/keyrings-monogram-1872/003541-2.webp`] },
      { sku: `003540`, name: { pt: `Porta-Chaves · Monogram 1872 — Dourado`, en: `Keyrings · Monogram 1872 — Golden` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/keyrings-monogram-1872/003540.webp`, images: [`/products/keyrings-monogram-1872/003540.webp`, `/products/keyrings-monogram-1872/003540-2.webp`] },
    ],
  },
  {
    slug: `ligne-2-6`,
    name: { pt: `Ligne 2`, en: `Ligne 2` },
    description: { pt: `Montecristo e S.T. Dupont, ambos sinónimos de um savoir-faire único, unem-se para criar produtos de excepção. Esta nova colecção encantará os fãs de ambas as marcas. O Ligne 2 é lacado em degradé violeta; na frente, o logótipo da prestigiada marca de charutos Montecristo está estampado a prata num dos lados, enquanto o outro lado apresenta uma decoração dourada de sol e lua. Dupla chama suave e ajustável. A colecção inclui mais 2 isqueiros: Le Grand Dupont e um Maxijet. Também duas canetas da colecção Line D Large e acessórios: um estojo em couro para três charutos, um grande cinzeiro, um corta-charutos e um par de botões de punho. Recarga de gás associada: vermelha (REF 000435), pedra preta (REF 900601).`, en: `Montecristo and S.T. Dupont, both synonymous with unique craftsmanship, have joined forces to create exceptional products. This new collection will delight fans of both brands. The Ligne 2 is lacquered with a violet gradient, on the front the logo of the prestigious Montecristo cigar brand is stamped in silver on one side, while the other side features a golden sun and moon decoration. Soft and adjustable double flame. The collection includes 2 other lighters: Grand Dupont and a Maxijet. Also, two pens from the Line D Large collection and accessories: a leather case for three cigars, a large ashtray, a cigar cutter and a pair of cufflinks. Gas refill associated: red (REF 000435) black stone (REF 900601)` },
    collection: `Ligne 2`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-6/C16034.webp`,
    variants: [
      { sku: `C16034`, name: { pt: `Ligne 2 — Violeta`, en: `Ligne 2 — Violet` }, priceCents: 141000, currency: "EUR", attributes: { color: { label: { pt: `Violeta`, en: `Violet` }, hex: ["#6b4a8a"] } }, image: `/products/ligne-2-6/C16034.webp`, images: [`/products/ligne-2-6/C16034.webp`, `/products/ligne-2-6/C16034-2.webp`, `/products/ligne-2-6/C16034-3.webp`, `/products/ligne-2-6/C16034-4.webp`] },
    ],
  },
  {
    slug: `maxijet-2`,
    name: { pt: `Maxijet`, en: `Maxijet` },
    description: { pt: `Montecristo e S.T. Dupont, ambos sinónimos de um savoir-faire único, unem-se para criar produtos de excepção. Esta nova colecção encantará os fãs de ambas as marcas. O Maxijet é lacado em degradé violeta; na frente, o logótipo da prestigiada marca de charutos Montecristo está estampado a dourado num dos lados, enquanto o outro lado apresenta uma decoração dourada de sol e lua. Possui uma chama maçarico que acende o charuto de forma a preservar todos os seus aromas distintivos, para o maior prazer dos aficionados. A colecção inclui mais 2 isqueiros: Ligne 2 e um Le Grand Dupont. Também duas canetas da colecção Line D Large e acessórios: um estojo em couro para três charutos, um grande cinzeiro, um corta-charutos e um par de botões de punho. Recarga de gás associada: preta (REF 000430)`, en: `Montecristo and S.T. Dupont, both synonymous with unique craftsmanship, have joined forces to create exceptional products. This new collection will delight fans of both brands. The Maxijet is lacquered with a violet gradient, on the front the logo of the prestigious Montecristo cigar brand is stamped in gold on one side, while the other side features a golden sun and moon decoration. It has a torch flame, lights a cigar in such a way as to preserve all its distinctive aromas for the greatest pleasure of aficionados. The collection includes 2 other lighters: Line 2 and a Grand Dupont. Also, two pens from the Line D Large collection and accessories: a leather case for three cigars, a large ashtray, a cigar cutter and a pair of cufflinks. Associated gas refill: black (REF 000430)` },
    collection: `Maxijet`,
    categorySlug: "isqueiros",
    image: `/products/maxijet-2/020034.webp`,
    variants: [
      { sku: `020034`, name: { pt: `Maxijet — Violeta`, en: `Maxijet — Violet` }, priceCents: 25000, currency: "EUR", attributes: { color: { label: { pt: `Violeta`, en: `Violet` }, hex: ["#6b4a8a"] } }, image: `/products/maxijet-2/020034.webp`, images: [`/products/maxijet-2/020034.webp`, `/products/maxijet-2/020034-2.webp`, `/products/maxijet-2/020034-3.webp`, `/products/maxijet-2/020034-4.webp`] },
    ],
  },
  {
    slug: `money-clip-2`,
    name: { pt: `Clip de Notas`, en: `Money Clip` },
    description: { pt: `A nova colecção de acessórios da S.T. Dupont inspira-se nos códigos icónicos da Maison, dando origem a produtos de elegância singular. Clip de notas em guilloché prata e dourado com ponta de diamante, gravado com o novo logótipo S.T. Dupont. Made in China`, en: `The new accessories collection from S.T. Dupont is inspired by the iconic codes of the House, creating products of singular elegance. Silver and gold guilloche money clip with diamond tip, engraved with the new S.T. logo. Dupont logo Made in China` },
    collection: `Money Clip`,
    categorySlug: "acessorios",
    image: `/products/money-clip-2/003081.webp`,
    variants: [
      { sku: `003081`, name: { pt: `Clip de Notas — Prateado`, en: `Money Clip — Silver` }, priceCents: 11500, currency: "EUR", attributes: { color: { label: { pt: `Prateado`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/money-clip-2/003081.webp`, images: [`/products/money-clip-2/003081.webp`, `/products/money-clip-2/003081-2.webp`] },
      { sku: `003005`, name: { pt: `Clip de Notas — Prateado`, en: `Money Clip — Silver` }, priceCents: 37500, currency: "EUR", attributes: { color: { label: { pt: `Prateado`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/money-clip-2/003005.webp`, images: [`/products/money-clip-2/003005.webp`, `/products/money-clip-2/003005-2.webp`] },
      { sku: `003121`, name: { pt: `Clip de Notas — Prateado`, en: `Money Clip — Silver` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Prateado`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/money-clip-2/003121.webp`, images: [`/products/money-clip-2/003121.webp`, `/products/money-clip-2/003121-2.webp`, `/products/money-clip-2/003121-3.webp`] },
      { sku: `003122`, name: { pt: `Clip de Notas — Dourado`, en: `Money Clip — Golden` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/money-clip-2/003122.webp`, images: [`/products/money-clip-2/003122.webp`, `/products/money-clip-2/003122-2.webp`, `/products/money-clip-2/003122-3.webp`] },
      { sku: `003123`, name: { pt: `Clip de Notas — Prateado`, en: `Money Clip — Silver` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Prateado`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/money-clip-2/003123.webp`, images: [`/products/money-clip-2/003123.webp`, `/products/money-clip-2/003123-2.webp`, `/products/money-clip-2/003123-3.webp`] },
    ],
  },
  {
    slug: `money-clip-monogram-1872`,
    name: { pt: `Clip de Notas · Monogram 1872`, en: `Money Clip · Monogram 1872` },
    description: { pt: `A arte do metal, tal como a arte da laca e do couro revestido, evidenciam o savoir-faire da S.T. Dupont na colecção Monogram 1872. Bem ancoradas no seu tempo, as peças da colecção exibem todas o novo logótipo S.T. Dupont — direito, determinado e altivo. Clip de notas em crómio gravado com o guilloché Monogram 1872. Made in China.`, en: `Craftsmanship in metal, as well as the art of lacquer and coated leather, showcase the expertise of S.T. Dupont in the Monogram 1872 collection. Well-rooted in their time, the pieces in the collection all feature the new S.T. Dupont logo—upright, determined, and proud. Chrome money clip engraved with the Monogram 1872 guilloche. Made in China.` },
    collection: `Monogram 1872`,
    categorySlug: "acessorios",
    image: `/products/money-clip-monogram-1872/003542.webp`,
    variants: [
      { sku: `003542`, name: { pt: `Clip de Notas · Monogram 1872 — Dourado`, en: `Money Clip · Monogram 1872 — Golden` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/money-clip-monogram-1872/003542.webp`, images: [`/products/money-clip-monogram-1872/003542.webp`, `/products/money-clip-monogram-1872/003542-2.webp`, `/products/money-clip-monogram-1872/003542-3.webp`] },
      { sku: `003543`, name: { pt: `Clip de Notas · Monogram 1872 — Prateado`, en: `Money Clip · Monogram 1872 — Silver` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Prateado`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/money-clip-monogram-1872/003543.webp`, images: [`/products/money-clip-monogram-1872/003543.webp`, `/products/money-clip-monogram-1872/003543-2.webp`, `/products/money-clip-monogram-1872/003543-3.webp`] },
    ],
  },
  {
    slug: `pen-case-2`,
    name: { pt: `Estojo para Caneta`, en: `Pen-case` },
    description: { pt: `Inspirando-se nos icónicos estojos para charutos da Maison, a S.T. Dupont propõe uma nova colecção de estojos para canetas, concebidos para serem funcionais ao mesmo tempo que oferecem um design elegante e contemporâneo. Confeccionado em couro de vitela granulado de alta qualidade, este estojo rígido é o acessório essencial e sofisticado para proteger os seus instrumentos de escrita nas suas viagens. Este estojo acomoda dois instrumentos de escrita (médios ou grandes).`, en: `Inspired by the iconic house cigar cases, S.T. Dupont offers a new collection of pens, thought to be functional while offering an elegant and contemporary design. Made of high quality grained veal leather, this rigid case is the essential and sophisticated accessory to protect your writing instruments when traveling. This setting can accommodate two writing instruments (medium or wide).` },
    collection: `Pen-case`,
    categorySlug: "acessorios",
    image: `/products/pen-case-2/007121.webp`,
    variants: [
      { sku: `007121`, name: { pt: `Estojo para Caneta — Preto`, en: `Pen-case — Black` }, priceCents: 13500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/pen-case-2/007121.webp`, images: [`/products/pen-case-2/007121.webp`, `/products/pen-case-2/007121-2.webp`] },
      { sku: `007124`, name: { pt: `Estojo para Caneta — Azul Índigo`, en: `Pen-case — Indigo Blue` }, priceCents: 13500, currency: "EUR", attributes: { color: { label: { pt: `Azul Índigo`, en: `Indigo Blue` }, hex: ["#1f3c66"] } }, image: `/products/pen-case-2/007124.webp`, images: [`/products/pen-case-2/007124.webp`, `/products/pen-case-2/007124-2.webp`] },
      { sku: `007127`, name: { pt: `Estojo para Caneta — Preto`, en: `Pen-case — Black` }, priceCents: 19000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/pen-case-2/007127.webp`, images: [`/products/pen-case-2/007127.webp`, `/products/pen-case-2/007127-2.webp`, `/products/pen-case-2/007127-3.webp`] },
      { sku: `007130`, name: { pt: `Estojo para Caneta — Azul Índigo`, en: `Pen-case — Indigo Blue` }, priceCents: 19000, currency: "EUR", attributes: { color: { label: { pt: `Azul Índigo`, en: `Indigo Blue` }, hex: ["#1f3c66"] } }, image: `/products/pen-case-2/007130.webp`, images: [`/products/pen-case-2/007130.webp`, `/products/pen-case-2/007130-2.webp`, `/products/pen-case-2/007130-3.webp`] },
      { sku: `007131`, name: { pt: `Estojo para Caneta — Preto`, en: `Pen-case — Black` }, priceCents: 21000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/pen-case-2/007131.webp`, images: [`/products/pen-case-2/007131.webp`, `/products/pen-case-2/007131-2.webp`, `/products/pen-case-2/007131-3.webp`] },
      { sku: `007132`, name: { pt: `Estojo para Caneta — Azul Índigo`, en: `Pen-case — Indigo Blue` }, priceCents: 21000, currency: "EUR", attributes: { color: { label: { pt: `Azul Índigo`, en: `Indigo Blue` }, hex: ["#1f3c66"] } }, image: `/products/pen-case-2/007132.webp`, images: [`/products/pen-case-2/007132.webp`, `/products/pen-case-2/007132-2.webp`, `/products/pen-case-2/007132-3.webp`] },
    ],
  },
  {
    slug: `plectrum-fender`,
    name: { pt: `Plectrum · Fender`, en: `Plectrum · Fender` },
    description: { pt: `Pela segunda vez, a S.T. Dupont e a Fender® unem-se para criar uma linha rock que conjuga o savoir-faire de ambas as casas. Na linha dos novos «colares» S.T. Dupont (isqueiro, marcador), este colar oferece a esta colaboração um acessório original e rock. Colar Médiator gravado com duas guitarras Stratocaster® e corrente ajustável em três comprimentos diferentes: 80/85/90 cm.`, en: `For the second time, S.T. Dupont and Fender® are working together to create a rock line that combines the expertise of both companies. In the line of the new «necklaces» S.T. Dupont (lighter, marker), this necklace offers this collaboration an original and rock accessory. Médiator necklace engraved with two Stratoscaster® guitars and adjustable chain in three different lengths 80/85/90 cm.` },
    collection: `Fender`,
    categorySlug: "acessorios",
    image: `/products/plectrum-fender/006175.webp`,
    variants: [
      { sku: `006175`, name: { pt: `Plectrum · Fender — Prateado`, en: `Plectrum · Fender — Silver` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Prateado`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/plectrum-fender/006175.webp`, images: [`/products/plectrum-fender/006175.webp`, `/products/plectrum-fender/006175-2.webp`, `/products/plectrum-fender/006175-3.webp`] },
    ],
  },
  {
    slug: `tie-clip-2`,
    name: { pt: `Mola de Gravata`, en: `Tie-clip` },
    description: { pt: `Mola de gravata em metal prateado. Para conjugar com os botões de punho.`, en: `Silver metal tie clip. To coordinate with cufflinks.` },
    collection: `Tie-clip`,
    categorySlug: "acessorios",
    image: `/products/tie-clip-2/005838.webp`,
    variants: [
      { sku: `005838`, name: { pt: `Mola de Gravata — Prateado`, en: `Tie-clip — Silver` }, priceCents: 22000, currency: "EUR", attributes: { color: { label: { pt: `Prateado`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/tie-clip-2/005838.webp`, images: [`/products/tie-clip-2/005838.webp`, `/products/tie-clip-2/005838-2.webp`] },
      { sku: `005839`, name: { pt: `Mola de Gravata — Dourado`, en: `Tie-clip — Golden` }, priceCents: 22000, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/tie-clip-2/005839.webp`, images: [`/products/tie-clip-2/005839.webp`, `/products/tie-clip-2/005839-2.webp`] },
      { sku: `005841`, name: { pt: `Mola de Gravata — Prateado`, en: `Tie-clip — Silver` }, priceCents: 24000, currency: "EUR", attributes: { color: { label: { pt: `Prateado`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/tie-clip-2/005841.webp`, images: [`/products/tie-clip-2/005841.webp`, `/products/tie-clip-2/005841-2.webp`] },
      { sku: `005840`, name: { pt: `Mola de Gravata — Cinzento`, en: `Tie-clip — Grey` }, priceCents: 22000, currency: "EUR", attributes: { color: { label: { pt: `Cinzento`, en: `Grey` }, hex: ["#7a7d83"] } }, image: `/products/tie-clip-2/005840.webp`, images: [`/products/tie-clip-2/005840.webp`, `/products/tie-clip-2/005840-2.webp`] },
    ],
  },
  {
    slug: `x`,
    name: { pt: `X`, en: `X` },
    description: { pt: `Inspirado na arquitectura contemporânea, o cubo para instrumentos de escrita foi concebido como uma verdadeira peça decorativa. O seu design depurado e o formato ergonómico fazem dele um objecto intemporalmente sofisticado. Cubo confeccionado com folheado em madeira de cedro. Composto por três tabuleiros empilháveis com capacidade para 24 instrumentos de escrita.`, en: `Inspired by contemporary architecture, the writing instrument cube has been conceived as a real piece of decoration. Its sleek design and ergonomic format make it a timelessly sophisticated object. Cube made with cedar wood veneer Composed of three stackable trays with capacity for 24 writing instruments` },
    collection: `X`,
    categorySlug: "acessorios",
    image: `/products/x/007150.webp`,
    variants: [
      { sku: `007150`, name: { pt: `X — Black`, en: `X — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/x/007150.webp`, images: [`/products/x/007150.webp`, `/products/x/007150-2.webp`, `/products/x/007150-3.webp`, `/products/x/007150-4.webp`] },
    ],
  },
  {
    slug: `d-initial-2`,
    name: { pt: `D-Initial`, en: `D-Initial` },
    description: { pt: `Em 2025, a D-Initial torna-se Initial. Contemporânea e depurada, ostenta a nova identidade visual S.T. Dupont. As suas novas proporções, mais alongadas e cónicas, fazem dela um instrumento de escrita intemporal. Esferográfica Initial orfèvre com linhas verticais e acabamento em crómio. Clip Sword e topo lacado. Disponível nas versões esferográfica, rollerball e tinta permanente. Made in China. Recargas associadas: 040853 Azul - 040854 Preta - 040358 Rosa - 040359 Vermelha - 040360 Verde - 040361 Turquesa`, en: `In 2025, D-Initial becomes Initial. Contemporary and uncluttered, it bears the new S.T. visual identity. Dupont visual identity. Its new proportions, longer and more conical, make it a timeless writing instrument. Initial orfèvre ballpoint pen with Vertical lines and chrome finish. Sword clip and lacquered top. Available in ballpoint, rollerball and fountain versions. Made in China. Related refills: 040853 Blue - 040854 Black - 040358 Pink - 040359 Red - 040360 Green - 040361 Turquoise` },
    collection: `D-Initial`,
    categorySlug: "escrita",
    image: `/products/d-initial-2/275201.webp`,
    variants: [
      { sku: `275201`, name: { pt: `D-Initial — Prateado`, en: `D-Initial — Silver` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Prateado`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/d-initial-2/275201.webp`, images: [`/products/d-initial-2/275201.webp`, `/products/d-initial-2/275201-2.webp`, `/products/d-initial-2/275201-3.webp`, `/products/d-initial-2/275201-4.webp`] },
    ],
  },
  {
    slug: `defi-millennium-2`,
    name: { pt: `Défi Millennium`, en: `Défi Millennium` },
    description: { pt: `A colecção Défi Millennium foi revisitada com a adição de dois novos acabamentos, reflectindo um equilíbrio perfeito entre tradição e inovação. Estes novos modelos, em laca preta brilhante e crómio escovado, transmitem o espírito atlético da colecção, mantendo as assinaturas icónicas da Maison. Aerodinâmica e precisa, esta caneta cativante seduz pela sua escrita fluida e estilo desportivo. Recargas: Azul 040840 Preta 040841. Aviso: Instrumento de escrita com tampa magnética. Acessórios com ímanes não são recomendados a grávidas, a pessoas com implantes metálicos ou dispositivos médicos como pacemakers, bombas de insulina, etc. Desaconselhamos igualmente o contacto prolongado do instrumento de escrita com cartões de crédito, relógios mecânicos e de quartzo, telemóveis e quaisquer outros dispositivos magnéticos, uma vez que o campo magnético por ele emitido pode danificar dispositivos sensíveis. Este produto não é um brinquedo. Manter fora do alcance das crianças.`, en: `The Défi Millenium collection has been revisited with the addition of two new finishes, reflecting a perfect balance between tradition and innovation. These new models, in a shiny black lacquer and brushed chrome, convey the collection’s athletic spirit while maintaining the Maison’s iconic signatures. Streamlined and precise, this captivating pen is quite the charm with its fluid writing and sporty style. Refills: Blue 040840 Black 040841 Warning: Writing instrument with magnetic cap. Accessories with magnets are not recommended for those who are pregnant, have metallic implants or medical devices such as pacemakers, insulin pumps, etc. We also advise against bringing the writing instrument into prolonged contact with credit cards, mechanical and quartz watches, mobile phones and any other magnetic devices, as the magnetic field it emits could damage sensitive devices. This product is not a toy. Keep out of reach of children.` },
    collection: `Défi Millennium`,
    categorySlug: "escrita",
    image: `/products/defi-millennium-2/400737.webp`,
    variants: [
      { sku: `400737`, name: { pt: `Défi Millennium — Laranja`, en: `Défi Millennium — Orange` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Laranja`, en: `Orange` }, hex: ["#c8a24a"] } }, image: `/products/defi-millennium-2/400737.webp`, images: [`/products/defi-millennium-2/400737.webp`, `/products/defi-millennium-2/400737-2.webp`, `/products/defi-millennium-2/400737-3.webp`, `/products/defi-millennium-2/400737-4.webp`] },
      { sku: `402004`, name: { pt: `Défi Millennium — Preto`, en: `Défi Millennium — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/defi-millennium-2/402004.webp`, images: [`/products/defi-millennium-2/402004.webp`, `/products/defi-millennium-2/402004-2.webp`, `/products/defi-millennium-2/402004-3.webp`, `/products/defi-millennium-2/402004-4.webp`] },
    ],
  },
  {
    slug: `eternity-3`,
    name: { pt: `Eternity`, en: `Eternity` },
    description: { pt: `A S.T. Dupont reinventa a sua icónica colecção de instrumentos de escrita Line D com a Line D Eternity. A colecção emblemática da S.T. Dupont foi reimaginada de forma mais moderna, criando uma experiência de escrita única. As linhas refinadas e esguias tornam a colecção Line D Eternity resolutamente contemporânea. O novo clip «Sword» é um aceno à célebre frase do autor inglês Edward Bulwer-Lytton: «The pen is mightier than the sword», ecoando a herança da Maison, em particular a icónica colecção Sword. O savoir-faire da Maison S.T. Dupont expressa-se através desta colecção com elegância intemporal. A Line D Eternity está disponível nas versões esferográfica, rollerball e tinta permanente, em tamanho médio e grande. Este instrumento de escrita de tamanho médio é ornamentado com o novo bico «Wings» em ouro maciço de 14 quilates. Esta versão de ourivesaria da Line D Eternity apresenta o icónico padrão guilloché ponta de diamante da Maison na cor paládio. A Line D Eternity é fabricada nas nossas oficinas em Faverges, França. Recargas associadas: 040112 Azul 040110 Preta 040362 Vermelha 040363 Verde 040364 Turquesa.`, en: `"S.T. Dupont reinvents its iconic Line D writing instrument collection with Line D Eternity. The emblematic collection from S.T. Dupont has been reimagined in a more modern way, creating a unique writing experience. The refined and slender lines make the Line D Eternity collection decidedly contemporary. The new 'Sword' clip is a nod to the famous phrase by English author Edward Bulwer-Lytton: 'The pen is mightier than the sword,' echoing the heritage of the House, particularly the iconic Sword collection. The craftsmanship of Maison S.T. Dupont is expressed through this collection with timeless elegance. Line D Eternity is available in ballpoint, rollerball, and fountain pen versions, in both medium and large sizes. This medium-sized writing instrument is adorned with the new 'Wings' solid 14-carat gold nib. This goldsmith version of the Line D Eternity features the iconic Maison's diamond head guilloche pattern in palladium color. Line D Eternity is crafted in our workshops in Faverges, France. Associated refills: 040112 Blue 040110 Black 040362 Red 040363 Green 040364 Turquoise"` },
    collection: `Eternity`,
    categorySlug: "escrita",
    image: `/products/eternity-3/420015L.webp`,
    variants: [
      { sku: `420015L`, name: { pt: `Eternity — Preto`, en: `Eternity — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/eternity-3/420015L.webp`, images: [`/products/eternity-3/420015L.webp`, `/products/eternity-3/420015L-2.webp`, `/products/eternity-3/420015L-3.webp`, `/products/eternity-3/420015L-4.webp`] },
      { sku: `420017L`, name: { pt: `Eternity — Preto`, en: `Eternity — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/eternity-3/420017L.webp`, images: [`/products/eternity-3/420017L.webp`, `/products/eternity-3/420017L-2.webp`, `/products/eternity-3/420017L-3.webp`, `/products/eternity-3/420017L-4.webp`] },
      { sku: `420220L`, name: { pt: `Eternity — Preto`, en: `Eternity — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/eternity-3/420220L.webp`, images: [`/products/eternity-3/420220L.webp`, `/products/eternity-3/420220L-2.webp`, `/products/eternity-3/420220L-3.webp`, `/products/eternity-3/420220L-4.webp`] },
      { sku: `420014M`, name: { pt: `Eternity — Preto`, en: `Eternity — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/eternity-3/420014M.webp`, images: [`/products/eternity-3/420014M.webp`, `/products/eternity-3/420014M-2.webp`, `/products/eternity-3/420014M-3.webp`, `/products/eternity-3/420014M-4.webp`] },
      { sku: `420016M`, name: { pt: `Eternity — Azul-escuro`, en: `Eternity — Dark Blue` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Azul-escuro`, en: `Dark Blue` }, hex: ["#1f3c66"] } }, image: `/products/eternity-3/420016M.webp`, images: [`/products/eternity-3/420016M.webp`, `/products/eternity-3/420016M-2.webp`, `/products/eternity-3/420016M-3.webp`, `/products/eternity-3/420016M-4.webp`] },
      { sku: `420018M`, name: { pt: `Eternity — Preto`, en: `Eternity — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/eternity-3/420018M.webp`, images: [`/products/eternity-3/420018M.webp`, `/products/eternity-3/420018M-2.webp`, `/products/eternity-3/420018M-3.webp`, `/products/eternity-3/420018M-4.webp`] },
      { sku: `420220M`, name: { pt: `Eternity — Preto`, en: `Eternity — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/eternity-3/420220M.webp`, images: [`/products/eternity-3/420220M.webp`, `/products/eternity-3/420220M-2.webp`, `/products/eternity-3/420220M-3.webp`, `/products/eternity-3/420220M-4.webp`] },
      { sku: `422015L`, name: { pt: `Eternity — Variante 015L`, en: `Eternity — Variant 015L` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Variante 015L`, en: `Variant 015L` }, hex: ["#7a7d83"] } }, image: `/products/eternity-3/422015L.webp`, images: [`/products/eternity-3/422015L.webp`, `/products/eternity-3/422015L-2.webp`, `/products/eternity-3/422015L-3.webp`, `/products/eternity-3/422015L-4.webp`] },
    ],
  },
  {
    slug: `eternity-fire-x-2`,
    name: { pt: `Eternity · Fire X`, en: `Eternity · Fire X` },
    description: { pt: `Inspirada na X-Bag, uma das malas da colecção de marroquinaria desenvolvida esta temporada pela S.T. Dupont, Fire X apresenta a sua reinterpretação da icónica ponta de chama sobre os clássicos da Maison. Esferográfica Line D Eternity Médio em laca Dupont preta brilhante e acabamentos em paládio. Tampa em guilloché Orfèvre gravada Fire X. Fabricada nas nossas oficinas em Faverges, França. Disponível nas versões esferográfica, rollerball e tinta permanente. Recargas associadas: 040853 Azul - 040854 Preta - 040358 Rosa - 040359 Vermelha - 040360 Verde - 040361 Turquesa.`, en: `Inspired by the X-Bag, one of the bags from the leather goods collection developed this season by S.T. Dupont, Fire X presents its reinterpretation of the iconic flame tip on the classics of the House. Line D Eternity medium ballpoint pen in glossy black Dupont lacquer and palladium finishes. Orfèvre guilloche Fire X engraved cap. Manufactured in our workshops in Faverges, France. Available in ballpoint, rollerball, and fountain pen versions. Associated refills: 040853 Blue - 040854 Black - 040358 Pink - 040359 Red - 040360 Green - 040361 Turquoise.` },
    collection: `Fire X`,
    categorySlug: "escrita",
    image: `/products/eternity-fire-x-2/425070M.webp`,
    variants: [
      { sku: `425070M`, name: { pt: `Eternity · Fire X — Preto`, en: `Eternity · Fire X — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/eternity-fire-x-2/425070M.webp`, images: [`/products/eternity-fire-x-2/425070M.webp`, `/products/eternity-fire-x-2/425070M-2.webp`, `/products/eternity-fire-x-2/425070M-3.webp`, `/products/eternity-fire-x-2/425070M-4.webp`] },
    ],
  },
  {
    slug: `eternity-monogram-1872-2`,
    name: { pt: `Eternity · Monogram 1872`, en: `Eternity · Monogram 1872` },
    description: { pt: `A arte do metal, tal como a arte da laca e do couro revestido, evidenciam o savoir-faire da S.T. Dupont na colecção Monogram 1872. Bem ancoradas no seu tempo, as peças da colecção exibem todas o novo logótipo S.T. Dupont — direito, determinado e altivo. Caneta de tinta permanente Line D Eternity Médio com arte do guilloché e acabamentos em paládio da colecção Monogram 1872. Clip Sword articulado. Bico em ouro de 14 quilates. Êmbolo incluído. Disponível nas versões esferográfica, rollerball e tinta permanente. Cartuchos de tinta: 040112 Azul - 040110 Preta - 040362 Vermelha - 040363 Verde - 040364 Turquesa. Esta caneta de tinta permanente é fornecida com um bico médio, para um traço de escrita de aproximadamente 0,55 mm.`, en: `Craftsmanship in metal, as well as the art of lacquer and coated leather, showcase the expertise of S.T. Dupont in the Monogram 1872 collection. Well-rooted in their time, the pieces in the collection all feature the new S.T. Dupont logo—upright, determined, and proud. Line D Eternity medium fountain pen with guilloche craftsmanship and palladium finishes from the Monogram 1872 collection. Articulated Sword clip. 14-carat gold nib. Piston included. Available in ballpoint, rollerball, and fountain pen versions. Ink cartridges: 040112 Blue - 040110 Black - 040362 Red - 040363 Green - 040364 Turquoise This fountain pen comes with a medium nib, for a writing size of apporox. 0.55 mm.` },
    collection: `Monogram 1872`,
    categorySlug: "escrita",
    image: `/products/eternity-monogram-1872-2/425020L.webp`,
    variants: [
      { sku: `425020L`, name: { pt: `Eternity · Monogram 1872 — Dourado`, en: `Eternity · Monogram 1872 — Golden` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/eternity-monogram-1872-2/425020L.webp`, images: [`/products/eternity-monogram-1872-2/425020L.webp`, `/products/eternity-monogram-1872-2/425020L-2.webp`, `/products/eternity-monogram-1872-2/425020L-3.webp`, `/products/eternity-monogram-1872-2/425020L-4.webp`] },
      { sku: `425021L`, name: { pt: `Eternity · Monogram 1872 — Prateado`, en: `Eternity · Monogram 1872 — Silver` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Prateado`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/eternity-monogram-1872-2/425021L.webp`, images: [`/products/eternity-monogram-1872-2/425021L.webp`, `/products/eternity-monogram-1872-2/425021L-2.webp`, `/products/eternity-monogram-1872-2/425021L-3.webp`, `/products/eternity-monogram-1872-2/425021L-4.webp`] },
      { sku: `425023L`, name: { pt: `Eternity · Monogram 1872 — Preto`, en: `Eternity · Monogram 1872 — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/eternity-monogram-1872-2/425023L.webp`, images: [`/products/eternity-monogram-1872-2/425023L.webp`, `/products/eternity-monogram-1872-2/425023L-2.webp`, `/products/eternity-monogram-1872-2/425023L-3.webp`, `/products/eternity-monogram-1872-2/425023L-4.webp`] },
      { sku: `425020M`, name: { pt: `Eternity · Monogram 1872 — Dourado`, en: `Eternity · Monogram 1872 — Golden` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/eternity-monogram-1872-2/425020M.webp`, images: [`/products/eternity-monogram-1872-2/425020M.webp`, `/products/eternity-monogram-1872-2/425020M-2.webp`, `/products/eternity-monogram-1872-2/425020M-3.webp`, `/products/eternity-monogram-1872-2/425020M-4.webp`] },
      { sku: `420021L`, name: { pt: `Eternity · Monogram 1872 — Prateado`, en: `Eternity · Monogram 1872 — Silver` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Prateado`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/eternity-monogram-1872-2/420021L.webp`, images: [`/products/eternity-monogram-1872-2/420021L.webp`, `/products/eternity-monogram-1872-2/420021L-2.webp`, `/products/eternity-monogram-1872-2/420021L-3.webp`, `/products/eternity-monogram-1872-2/420021L-4.webp`] },
      { sku: `420020M`, name: { pt: `Eternity · Monogram 1872 — Dourado`, en: `Eternity · Monogram 1872 — Golden` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/eternity-monogram-1872-2/420020M.webp`, images: [`/products/eternity-monogram-1872-2/420020M.webp`, `/products/eternity-monogram-1872-2/420020M-2.webp`, `/products/eternity-monogram-1872-2/420020M-3.webp`, `/products/eternity-monogram-1872-2/420020M-4.webp`] },
      { sku: `420021M`, name: { pt: `Eternity · Monogram 1872 — Prateado`, en: `Eternity · Monogram 1872 — Silver` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Prateado`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/eternity-monogram-1872-2/420021M.webp`, images: [`/products/eternity-monogram-1872-2/420021M.webp`, `/products/eternity-monogram-1872-2/420021M-2.webp`, `/products/eternity-monogram-1872-2/420021M-3.webp`, `/products/eternity-monogram-1872-2/420021M-4.webp`] },
      { sku: `420020XL`, name: { pt: `Eternity · Monogram 1872 — Dourado`, en: `Eternity · Monogram 1872 — Golden` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/eternity-monogram-1872-2/420020XL.webp`, images: [`/products/eternity-monogram-1872-2/420020XL.webp`, `/products/eternity-monogram-1872-2/420020XL-2.webp`, `/products/eternity-monogram-1872-2/420020XL-3.webp`, `/products/eternity-monogram-1872-2/420020XL-4.webp`] },
      { sku: `420021XL`, name: { pt: `Eternity · Monogram 1872 — Prateado`, en: `Eternity · Monogram 1872 — Silver` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Prateado`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/eternity-monogram-1872-2/420021XL.webp`, images: [`/products/eternity-monogram-1872-2/420021XL.webp`, `/products/eternity-monogram-1872-2/420021XL-2.webp`, `/products/eternity-monogram-1872-2/420021XL-3.webp`, `/products/eternity-monogram-1872-2/420021XL-4.webp`] },
      { sku: `422020L`, name: { pt: `Eternity · Monogram 1872 — Dourado`, en: `Eternity · Monogram 1872 — Golden` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/eternity-monogram-1872-2/422020L.webp`, images: [`/products/eternity-monogram-1872-2/422020L.webp`, `/products/eternity-monogram-1872-2/422020L-2.webp`, `/products/eternity-monogram-1872-2/422020L-3.webp`, `/products/eternity-monogram-1872-2/422020L-4.webp`] },
      { sku: `422021L`, name: { pt: `Eternity · Monogram 1872 — Prateado`, en: `Eternity · Monogram 1872 — Silver` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Prateado`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/eternity-monogram-1872-2/422021L.webp`, images: [`/products/eternity-monogram-1872-2/422021L.webp`, `/products/eternity-monogram-1872-2/422021L-2.webp`, `/products/eternity-monogram-1872-2/422021L-3.webp`, `/products/eternity-monogram-1872-2/422021L-4.webp`] },
      { sku: `422020M`, name: { pt: `Eternity · Monogram 1872 — Dourado`, en: `Eternity · Monogram 1872 — Golden` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/eternity-monogram-1872-2/422020M.webp`, images: [`/products/eternity-monogram-1872-2/422020M.webp`, `/products/eternity-monogram-1872-2/422020M-2.webp`, `/products/eternity-monogram-1872-2/422020M-3.webp`, `/products/eternity-monogram-1872-2/422020M-4.webp`] },
      { sku: `422021M`, name: { pt: `Eternity · Monogram 1872 — Prateado`, en: `Eternity · Monogram 1872 — Silver` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Prateado`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/eternity-monogram-1872-2/422021M.webp`, images: [`/products/eternity-monogram-1872-2/422021M.webp`, `/products/eternity-monogram-1872-2/422021M-2.webp`, `/products/eternity-monogram-1872-2/422021M-3.webp`, `/products/eternity-monogram-1872-2/422021M-4.webp`] },
    ],
  },
  {
    slug: `ligne-2-fender-2`,
    name: { pt: `Ligne 2 · Fender`, en: `Ligne 2 · Fender` },
    description: { pt: `A Fender®, a mais famosa marca de guitarras, abre uma boutique no vibrante bairro de Harajuku, em Tóquio. Por esta ocasião, e pela segunda vez, a S.T. Dupont e a Fender® colaboram, imaginando uma linha rock inspirada no savoir-faire de ambas as casas e também no Japão. Com o seu trabalho da laca inspirado no kintsugi, e ainda o regresso de um antigo savoir-faire com pó de ouro aplicado à mão, esta colaboração faz seu o universo criativo da música. Isqueiro Ligne 2 Cling com dupla chama amarela suave. Decorado com o padrão Fender® em laca azul, arte de pó de ouro aplicada à mão e acabamentos dourados. Com o famoso «Cling» na abertura. Por cada compra do Ligne 2, é oferecido um exclusivo colar Médiator. Isqueiro entregue sem gás, recarga vendida em separado. GAME OF THRONES, HOUSE OF THE DRAGON e todas as personagens e elementos relacionados © & TM Home Box Office, Inc. (s24)`, en: `Fender®, the most famous guitar brand in Tokyo, is opening a boutique in the vibrant Harajuku area. On this occasion, and for the second time, S.T. Dupont and Fender® collaborate, imagining a rock line inspired by the know-how of both houses, as well as Japan. With his work of the lacquer inspired by kintsugi, but also the return of an ancient know-how with gold powder applied by hand, this collaboration makes its own the creativity of the musical universe. Lighter line 2 Cling with a double soft yellow flame. Decorated with the Fender® pattern with blue lacquer, hand applied Gold dust craftsmanship and gold finishes. With the famous "Cling" at the opening. For each purchase of the Line 2, an exclusive Médiator necklace is offered. Lighter delivered empty gas, refill sold separately. GAME OF THRONES, HOUSE OF THE DRAGON and all related characters and elements © & TM Home Box Office, Inc. (s24)` },
    collection: `Fender`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-fender-2/C16025CL.webp`,
    variants: [
      { sku: `C16025CL`, name: { pt: `Ligne 2 · Fender — Preto`, en: `Ligne 2 · Fender — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/ligne-2-fender-2/C16025CL.webp`, images: [`/products/ligne-2-fender-2/C16025CL.webp`, `/products/ligne-2-fender-2/C16025CL-2.webp`, `/products/ligne-2-fender-2/C16025CL-3.webp`, `/products/ligne-2-fender-2/C16025CL-4.webp`] },
    ],
  },
  {
    slug: `twiggy-fire-x`,
    name: { pt: `Twiggy · Fire X`, en: `Twiggy · Fire X` },
    description: { pt: `Inspirada na X-Bag, uma das malas da colecção de marroquinaria desenvolvida esta temporada pela S.T. Dupont, Fire X apresenta a sua reinterpretação da icónica ponta de chama sobre os clássicos da Maison. Isqueiro Twiggy Fire X decorado em laca preta e acabamentos em crómio. Apresenta uma chama maçarico. Recarga de gás associada: preta (REF 900430). Isqueiro entregue sem gás, recarga vendida em separado.`, en: `Inspired by the X-Bag, one of the bags from the leather goods collection developed this season by S.T. Dupont, Fire X presents its reinterpretation of the iconic flame tip on the classics of the House. Twiggy Fire X lighter decorated with black lacquer and chrome finishes. Featuring a torch flame. Associated gas refill: black (REF 900430) Lighter delivered empty of gas, refill sold separately.` },
    collection: `Fire X`,
    categorySlug: "isqueiros",
    image: `/products/twiggy-fire-x/030070.webp`,
    variants: [
      { sku: `030070`, name: { pt: `Twiggy · Fire X — Preto`, en: `Twiggy · Fire X — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/twiggy-fire-x/030070.webp`, images: [`/products/twiggy-fire-x/030070.webp`, `/products/twiggy-fire-x/030070-2.webp`, `/products/twiggy-fire-x/030070-3.webp`, `/products/twiggy-fire-x/030070-4.webp`] },
    ],
  },
  {
    slug: `atelier-2`,
    name: { pt: `Atelier`, en: `Atelier` },
    description: { pt: `Esta carteira em couro de vitela flor inteira gravada em relevo com o motivo crocrow patinado à mão, oferece tonalidades únicas de Havana. É o acessório ideal para o acompanhar em todas as suas viagens. Disponibiliza seis compartimentos para cartões de crédito e um compartimento para os seus papéis e notas. - 6 compartimentos para cartões, - 1 compartimento plano para notas e recibos`, en: `This full-flower veal leather carriers embossed with the crocrow patinated motif by hand offers unique shades of Havana. It is the ideal accessory that will accompany you in all your trips. It offers six locations for credit cards and a compartment for your papers and tickets. - 6 cards seats, - 1 flat compartment for tickets and receipts` },
    collection: `Atelier`,
    categorySlug: "pele",
    image: `/products/atelier-2/190376.webp`,
    variants: [
      { sku: `190376`, name: { pt: `Atelier — Blue`, en: `Atelier — Blue` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/atelier-2/190376.webp`, images: [`/products/atelier-2/190376.webp`, `/products/atelier-2/190376-2.webp`] },
      { sku: `190476`, name: { pt: `Atelier — Castanho`, en: `Atelier — Brown` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Castanho`, en: `Brown` }, hex: ["#6b4a2a"] } }, image: `/products/atelier-2/190476.webp`, images: [`/products/atelier-2/190476.webp`, `/products/atelier-2/190476-2.webp`] },
      { sku: `190374`, name: { pt: `Atelier — Blue`, en: `Atelier — Blue` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/atelier-2/190374.webp`, images: [`/products/atelier-2/190374.webp`, `/products/atelier-2/190374-2.webp`, `/products/atelier-2/190374-3.webp`] },
      { sku: `190474`, name: { pt: `Atelier — Castanho`, en: `Atelier — Brown` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Castanho`, en: `Brown` }, hex: ["#6b4a2a"] } }, image: `/products/atelier-2/190474.webp`, images: [`/products/atelier-2/190474.webp`, `/products/atelier-2/190474-2.webp`, `/products/atelier-2/190474-3.webp`, `/products/atelier-2/190474-4.webp`] },
      { sku: `190380`, name: { pt: `Atelier — Blue`, en: `Atelier — Blue` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/atelier-2/190380.webp`, images: [`/products/atelier-2/190380.webp`, `/products/atelier-2/190380-2.webp`] },
      { sku: `190480`, name: { pt: `Atelier — Castanho`, en: `Atelier — Brown` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Castanho`, en: `Brown` }, hex: ["#6b4a2a"] } }, image: `/products/atelier-2/190480.webp`, images: [`/products/atelier-2/190480.webp`, `/products/atelier-2/190480-2.webp`] },
      { sku: `190580`, name: { pt: `Atelier — Preto`, en: `Atelier — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/atelier-2/190580.webp`, images: [`/products/atelier-2/190580.webp`, `/products/atelier-2/190580-2.webp`] },
      { sku: `190379`, name: { pt: `Atelier — Blue`, en: `Atelier — Blue` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/atelier-2/190379.webp`, images: [`/products/atelier-2/190379.webp`, `/products/atelier-2/190379-2.webp`, `/products/atelier-2/190379-3.webp`] },
      { sku: `190479`, name: { pt: `Atelier — Castanho`, en: `Atelier — Brown` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Castanho`, en: `Brown` }, hex: ["#6b4a2a"] } }, image: `/products/atelier-2/190479.webp`, images: [`/products/atelier-2/190479.webp`, `/products/atelier-2/190479-2.webp`, `/products/atelier-2/190479-3.webp`] },
      { sku: `190579`, name: { pt: `Atelier — Preto`, en: `Atelier — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/atelier-2/190579.webp`, images: [`/products/atelier-2/190579.webp`, `/products/atelier-2/190579-2.webp`] },
      { sku: `190475`, name: { pt: `Atelier — Castanho`, en: `Atelier — Brown` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Castanho`, en: `Brown` }, hex: ["#6b4a2a"] } }, image: `/products/atelier-2/190475.webp`, images: [`/products/atelier-2/190475.webp`, `/products/atelier-2/190475-2.webp`, `/products/atelier-2/190475-3.webp`, `/products/atelier-2/190475-4.webp`] },
      { sku: `141052`, name: { pt: `Atelier — Preto`, en: `Atelier — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/atelier-2/141052.webp`, images: [`/products/atelier-2/141052.webp`, `/products/atelier-2/141052-2.webp`, `/products/atelier-2/141052-3.webp`, `/products/atelier-2/141052-4.webp`] },
      { sku: `141352`, name: { pt: `Atelier — Blue`, en: `Atelier — Blue` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/atelier-2/141352.webp`, images: [`/products/atelier-2/141352.webp`, `/products/atelier-2/141352-2.webp`, `/products/atelier-2/141352-3.webp`, `/products/atelier-2/141352-4.webp`] },
      { sku: `190373`, name: { pt: `Atelier — Blue`, en: `Atelier — Blue` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/atelier-2/190373.webp`, images: [`/products/atelier-2/190373.webp`, `/products/atelier-2/190373-2.webp`, `/products/atelier-2/190373-3.webp`] },
      { sku: `190377`, name: { pt: `Atelier — Blue`, en: `Atelier — Blue` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/atelier-2/190377.webp`, images: [`/products/atelier-2/190377.webp`, `/products/atelier-2/190377-2.webp`, `/products/atelier-2/190377-3.webp`] },
      { sku: `190378`, name: { pt: `Atelier — Blue`, en: `Atelier — Blue` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/atelier-2/190378.webp`, images: [`/products/atelier-2/190378.webp`, `/products/atelier-2/190378-2.webp`, `/products/atelier-2/190378-3.webp`] },
      { sku: `190473`, name: { pt: `Atelier — Castanho`, en: `Atelier — Brown` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Castanho`, en: `Brown` }, hex: ["#6b4a2a"] } }, image: `/products/atelier-2/190473.webp`, images: [`/products/atelier-2/190473.webp`, `/products/atelier-2/190473-2.webp`, `/products/atelier-2/190473-3.webp`] },
      { sku: `190477`, name: { pt: `Atelier — Castanho`, en: `Atelier — Brown` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Castanho`, en: `Brown` }, hex: ["#6b4a2a"] } }, image: `/products/atelier-2/190477.webp`, images: [`/products/atelier-2/190477.webp`, `/products/atelier-2/190477-2.webp`, `/products/atelier-2/190477-3.webp`] },
      { sku: `190478`, name: { pt: `Atelier — Castanho`, en: `Atelier — Brown` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Castanho`, en: `Brown` }, hex: ["#6b4a2a"] } }, image: `/products/atelier-2/190478.webp`, images: [`/products/atelier-2/190478.webp`, `/products/atelier-2/190478-2.webp`, `/products/atelier-2/190478-3.webp`] },
      { sku: `190573`, name: { pt: `Atelier — Preto`, en: `Atelier — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/atelier-2/190573.webp`, images: [`/products/atelier-2/190573.webp`, `/products/atelier-2/190573-2.webp`, `/products/atelier-2/190573-3.webp`] },
      { sku: `190577`, name: { pt: `Atelier — Preto`, en: `Atelier — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/atelier-2/190577.webp`, images: [`/products/atelier-2/190577.webp`, `/products/atelier-2/190577-2.webp`, `/products/atelier-2/190577-3.webp`] },
    ],
  },
  {
    slug: `backpacks-fender`,
    name: { pt: `Mochilas · Fender`, en: `backpacks · Fender` },
    description: { pt: `Pela segunda vez, a S.T. Dupont e a Fender® unem-se para criar uma linha rock que conjuga o savoir-faire de ambas as casas. Esta mochila, em couro de vitela liso e lona, conjuga design moderno e funcionalidade. A elegante e distintiva placa metálica Fender® presta homenagem ao universo musical da Fender®, conferindo simultaneamente um toque moderno a este modelo. Uma mala prática e elegante, ideal para quem procura conjugar conforto, elegância e audácia no quotidiano.`, en: `For the second time, S.T. Dupont and Fender® are working together to create a rock line that combines the expertise of both companies. This backpack, made of smooth calfskin and canvas, combines modern design and functionality. The elegant, distinctive Fender® metal plate pays homage to the musical universe of Fender®, while adding a modern touch to this model. A practical and stylish bag, ideal for those looking to combine comfort, elegance and audacity in everyday life.` },
    collection: `Fender`,
    categorySlug: "pele",
    image: `/products/backpacks-fender/1FE221BK1.webp`,
    variants: [
      { sku: `1FE221BK1`, name: { pt: `backpacks · Fender — Cinzento`, en: `backpacks · Fender — Grey` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Cinzento`, en: `Grey` }, hex: ["#7a7d83"] } }, image: `/products/backpacks-fender/1FE221BK1.webp`, images: [`/products/backpacks-fender/1FE221BK1.webp`, `/products/backpacks-fender/1FE221BK1-2.webp`, `/products/backpacks-fender/1FE221BK1-3.webp`, `/products/backpacks-fender/1FE221BK1-4.webp`] },
    ],
  },
  {
    slug: `cabas-fender`,
    name: { pt: `cabas · Fender`, en: `cabas · Fender` },
    description: { pt: `Pela segunda vez, a S.T. Dupont e a Fender® unem-se para criar uma linha rock que conjuga o savoir-faire de ambas as casas. Esta tote bag, em couro de vitela liso e lona, conjuga elegância e praticidade com um toque de modernidade. A placa metálica Fender® subtilmente integrada ecoa o universo musical da Fender®, acrescentando simultaneamente uma nota contemporânea a este modelo. Uma companheira ideal para quem procura uma mala simultaneamente funcional e requintada, perfeita para os dias na cidade ou para escapadas.`, en: `For the second time, S.T. Dupont and Fender® are working together to create a rock line that combines the expertise of both companies. This tote bag, in smooth calfskin and canvas, combines elegance and practicality with a touch of modernity. The subtly integrated Fender® metal plate echoes the musical universe of Fender®, while adding a contemporary note to this model. An ideal companion for those looking for a bag that is both functional and refined, perfect for urban days or getaways.` },
    collection: `Fender`,
    categorySlug: "pele",
    image: `/products/cabas-fender/1FE153BK1.webp`,
    variants: [
      { sku: `1FE153BK1`, name: { pt: `cabas · Fender — Cinzento`, en: `cabas · Fender — Grey` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Cinzento`, en: `Grey` }, hex: ["#7a7d83"] } }, image: `/products/cabas-fender/1FE153BK1.webp`, images: [`/products/cabas-fender/1FE153BK1.webp`, `/products/cabas-fender/1FE153BK1-2.webp`, `/products/cabas-fender/1FE153BK1-3.webp`, `/products/cabas-fender/1FE153BK1-4.webp`] },
    ],
  },
  {
    slug: `card-holder-fender`,
    name: { pt: `Porta-Cartões · Fender`, en: `card-holder · Fender` },
    description: { pt: `Pela segunda vez, a S.T. Dupont e a Fender® unem-se para criar uma linha rock que conjuga o savoir-faire de ambas as casas. Este porta-cartões, em couro de vitela liso e lona, conjuga um design compacto e elegante com uma funcionalidade óptima. A elegante e distintiva placa metálica Fender® presta homenagem ao universo musical da Fender®, conferindo simultaneamente um toque moderno a este modelo. Um acessório essencial para quem procura conjugar organização e estilo no quotidiano.`, en: `For the second time, S.T. Dupont and Fender® are working together to create a rock line that combines the expertise of both companies. This credit card holder, made of smooth calfskin and canvas, combines a compact and elegant design with optimal functionality. The elegant, distinctive Fender® metal plate pays homage to the musical universe of Fender®, while adding a modern touch to this model. An essential accessory for those looking to combine organization and style in everyday life.` },
    collection: `Fender`,
    categorySlug: "pele",
    image: `/products/card-holder-fender/1FE683BK1.webp`,
    variants: [
      { sku: `1FE683BK1`, name: { pt: `card-holder · Fender — Cinzento`, en: `card-holder · Fender — Grey` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Cinzento`, en: `Grey` }, hex: ["#7a7d83"] } }, image: `/products/card-holder-fender/1FE683BK1.webp`, images: [`/products/card-holder-fender/1FE683BK1.webp`, `/products/card-holder-fender/1FE683BK1-2.webp`] },
    ],
  },
  {
    slug: `crossbody-fender`,
    name: { pt: `Crossbody · Fender`, en: `crossbody · Fender` },
    description: { pt: `Pela segunda vez, a S.T. Dupont e a Fender® unem-se para criar uma linha rock que conjuga o savoir-faire de ambas as casas. Esta crossbody, em couro de vitela liso e lona, conjuga harmoniosamente elegância e carácter. A elegante e distintiva placa metálica Fender® presta homenagem ao universo musical da Fender®, ao mesmo tempo que confere um toque moderno a este modelo. Uma companheira versátil, perfeita para quem aprecia um estilo simultaneamente refinado e audaz.`, en: `For the second time, S.T. Dupont and Fender® are working together to create a rock line that combines the expertise of both companies. This crossbody, in smooth calfskin and canvas, harmoniously combines elegance and character. The elegant, distinctive Fender® metal plate pays homage to the musical universe of Fender®, while adding a modern touch to this model. A versatile companion, perfect for those who appreciate a style that is both refined and bold.` },
    collection: `Fender`,
    categorySlug: "pele",
    image: `/products/crossbody-fender/1FE181BK1.webp`,
    variants: [
      { sku: `1FE181BK1`, name: { pt: `crossbody · Fender — Cinzento`, en: `crossbody · Fender — Grey` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Cinzento`, en: `Grey` }, hex: ["#7a7d83"] } }, image: `/products/crossbody-fender/1FE181BK1.webp`, images: [`/products/crossbody-fender/1FE181BK1.webp`, `/products/crossbody-fender/1FE181BK1-2.webp`, `/products/crossbody-fender/1FE181BK1-3.webp`, `/products/crossbody-fender/1FE181BK1-4.webp`] },
    ],
  },
  {
    slug: `defi-explorer-2`,
    name: { pt: `Défi Explorer`, en: `Défi Explorer` },
    description: { pt: `Versátil e moderna, esta messenger conjuga lona técnica hidrofugada e couro estruturado para um estilo dinâmico e urbano. O seu design compacto oculta um espaço optimizado, ideal para transportar documentos e os essenciais do dia-a-dia. A pala segura e a alça de ombro ajustável fazem dela uma aliada perfeita para os profissionais em movimento. Disponível em caqui ou preto. Made in Italy`, en: `Versatile and modern, this messenger combines water-repellent technical canvas and structured leather for a dynamic, urban style. Its compact design conceals optimized space, ideal for carrying documents and everyday essentials. Its secure flap and adjustable shoulder strap make it a perfect ally for professionals on the move. Available in khaki or black. Made in Italy` },
    collection: `Défi Explorer`,
    categorySlug: "pele",
    image: `/products/defi-explorer-2/1IC223BK1.webp`,
    variants: [
      { sku: `1IC223BK1`, name: { pt: `Défi Explorer — Preto`, en: `Défi Explorer — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/defi-explorer-2/1IC223BK1.webp`, images: [`/products/defi-explorer-2/1IC223BK1.webp`, `/products/defi-explorer-2/1IC223BK1-2.webp`, `/products/defi-explorer-2/1IC223BK1-3.webp`, `/products/defi-explorer-2/1IC223BK1-4.webp`] },
      { sku: `1IC223NK1`, name: { pt: `Défi Explorer — Caqui`, en: `Défi Explorer — Khaki` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Caqui`, en: `Khaki` }, hex: ["#3b5d39"] } }, image: `/products/defi-explorer-2/1IC223NK1.webp`, images: [`/products/defi-explorer-2/1IC223NK1.webp`, `/products/defi-explorer-2/1IC223NK1-2.webp`, `/products/defi-explorer-2/1IC223NK1-3.webp`, `/products/defi-explorer-2/1IC223NK1-4.webp`] },
      { sku: `1IC132BK1`, name: { pt: `Défi Explorer — Preto`, en: `Défi Explorer — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/defi-explorer-2/1IC132BK1.webp`, images: [`/products/defi-explorer-2/1IC132BK1.webp`, `/products/defi-explorer-2/1IC132BK1-2.webp`, `/products/defi-explorer-2/1IC132BK1-3.webp`, `/products/defi-explorer-2/1IC132BK1-4.webp`] },
      { sku: `1IC194BK1`, name: { pt: `Défi Explorer — Preto`, en: `Défi Explorer — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/defi-explorer-2/1IC194BK1.webp`, images: [`/products/defi-explorer-2/1IC194BK1.webp`, `/products/defi-explorer-2/1IC194BK1-2.webp`, `/products/defi-explorer-2/1IC194BK1-3.webp`, `/products/defi-explorer-2/1IC194BK1-4.webp`] },
      { sku: `1IC194NK1`, name: { pt: `Défi Explorer — Caqui`, en: `Défi Explorer — Khaki` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Caqui`, en: `Khaki` }, hex: ["#3b5d39"] } }, image: `/products/defi-explorer-2/1IC194NK1.webp`, images: [`/products/defi-explorer-2/1IC194NK1.webp`, `/products/defi-explorer-2/1IC194NK1-2.webp`, `/products/defi-explorer-2/1IC194NK1-3.webp`, `/products/defi-explorer-2/1IC194NK1-4.webp`] },
      { sku: `1IC231BK1`, name: { pt: `Défi Explorer — Preto`, en: `Défi Explorer — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/defi-explorer-2/1IC231BK1.webp`, images: [`/products/defi-explorer-2/1IC231BK1.webp`, `/products/defi-explorer-2/1IC231BK1-2.webp`, `/products/defi-explorer-2/1IC231BK1-3.webp`, `/products/defi-explorer-2/1IC231BK1-4.webp`] },
      { sku: `1IC23NK1`, name: { pt: `Défi Explorer — Caqui`, en: `Défi Explorer — Khaki` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Caqui`, en: `Khaki` }, hex: ["#3b5d39"] } }, image: `/products/defi-explorer-2/1IC23NK1.webp`, images: [`/products/defi-explorer-2/1IC23NK1.webp`, `/products/defi-explorer-2/1IC23NK1-2.webp`, `/products/defi-explorer-2/1IC23NK1-3.webp`, `/products/defi-explorer-2/1IC23NK1-4.webp`] },
    ],
  },
  {
    slug: `document-holders-fender`,
    name: { pt: `Porta-Documentos · Fender`, en: `document-holders · Fender` },
    description: { pt: `Pela segunda vez, a S.T. Dupont e a Fender® unem-se para criar uma linha rock que conjuga o savoir-faire de ambas as casas. Este porta-documentos, em couro de vitela liso e lona, conjuga elegância e funcionalidade com um toque contemporâneo. A elegante e distintiva placa metálica Fender® presta homenagem ao universo musical da Fender®, conferindo simultaneamente um toque moderno a este modelo. Uma mala masculina chique e prática, ideal para quem deseja conjugar organização e estilo.`, en: `For the second time, S.T. Dupont and Fender® are working together to create a rock line that combines the expertise of both companies. This document holder, in smooth calfskin and canvas, combines elegance and functionality with a contemporary touch. The elegant, distinctive Fender® metal plate pays homage to the musical universe of Fender®, while adding a modern touch to this model. A chic and practical men’s bag, ideal for those who want to combine organization and style.` },
    collection: `Fender`,
    categorySlug: "pele",
    image: `/products/document-holders-fender/1FE104BK1.webp`,
    variants: [
      { sku: `1FE104BK1`, name: { pt: `document-holders · Fender — Cinzento`, en: `document-holders · Fender — Grey` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Cinzento`, en: `Grey` }, hex: ["#7a7d83"] } }, image: `/products/document-holders-fender/1FE104BK1.webp`, images: [`/products/document-holders-fender/1FE104BK1.webp`, `/products/document-holders-fender/1FE104BK1-2.webp`, `/products/document-holders-fender/1FE104BK1-3.webp`, `/products/document-holders-fender/1FE104BK1-4.webp`] },
    ],
  },
  {
    slug: `travel-bags-fender`,
    name: { pt: `Malas de Viagem · Fender`, en: `travel-bags · Fender` },
    description: { pt: `Pela segunda vez, a S.T. Dupont e a Fender® unem-se para criar uma linha rock que conjuga o savoir-faire de ambas as casas. Esta mala de viagem, em couro de vitela liso e lona, conjuga praticidade e elegância num design requintado. A discreta e distintiva placa metálica Fender® remete para o universo musical da Fender®, conferindo simultaneamente um toque moderno e elegante a este modelo. Uma companheira ideal para os fins-de-semana, oferecendo conforto, estilo e durabilidade.`, en: `For the second time, S.T. Dupont and Fender® are working together to create a rock line that combines the expertise of both companies. This travel bag, made of smooth calfskin and canvas, combines practicality and elegance in a refined design. The discreet and distinctive Fender® metal plate references the musical universe of Fender®, while adding a modern and elegant touch to this model. An ideal companion for weekends, offering comfort, style and durability.` },
    collection: `Fender`,
    categorySlug: "pele",
    image: `/products/travel-bags-fender/1FE231BK1.webp`,
    variants: [
      { sku: `1FE231BK1`, name: { pt: `travel-bags · Fender — Cinzento`, en: `travel-bags · Fender — Grey` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Cinzento`, en: `Grey` }, hex: ["#7a7d83"] } }, image: `/products/travel-bags-fender/1FE231BK1.webp`, images: [`/products/travel-bags-fender/1FE231BK1.webp`, `/products/travel-bags-fender/1FE231BK1-2.webp`, `/products/travel-bags-fender/1FE231BK1-3.webp`] },
    ],
  },
  {
    slug: `wallet-fender`,
    name: { pt: `Carteira · Fender`, en: `wallet · Fender` },
    description: { pt: `Pela segunda vez, a S.T. Dupont e a Fender® unem-se para criar uma linha rock que conjuga o savoir-faire de ambas as casas. Esta carteira 6CC, em couro de vitela liso e lona, conjuga elegância e funcionalidade num formato prático e compacto. A elegante e distintiva placa metálica Fender® presta homenagem ao universo musical da Fender®, conferindo simultaneamente um toque moderno a este modelo. Uma carteira compacta, perfeita para quem procura conjugar organização, praticidade e estilo.`, en: `For the second time, S.T. Dupont and Fender® are working together to create a rock line that combines the expertise of both companies. This 6CC billfold, in smooth calfskin and canvas, combines elegance and functionality in a practical and compact format. The elegant, distinctive Fender® metal plate pays homage to the musical universe of Fender®, while adding a modern touch to this model. A compact wallet, perfect for those looking to combine organization, practicality and style.` },
    collection: `Fender`,
    categorySlug: "pele",
    image: `/products/wallet-fender/1FE561BK1.webp`,
    variants: [
      { sku: `1FE561BK1`, name: { pt: `wallet · Fender — Cinzento`, en: `wallet · Fender — Grey` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Cinzento`, en: `Grey` }, hex: ["#7a7d83"] } }, image: `/products/wallet-fender/1FE561BK1.webp`, images: [`/products/wallet-fender/1FE561BK1.webp`, `/products/wallet-fender/1FE561BK1-2.webp`] },
    ],
  },  // === END EN STORE IMPORTS ===

  // === BEGIN WWW STORE IMPORTS (www.st-dupont.com) ===
  {
    slug: `pen-case-3`,
    name: { pt: `Estojos para Canetas`, en: `Pen Cases` },
    description: { pt: `Inspirando-se nos icónicos estojos para charutos da Maison, a S.T. Dupont propõe uma nova colecção de estojos para canetas, concebidos para serem funcionais ao mesmo tempo que oferecem um design elegante e contemporâneo. Confeccionado em couro de vitela granulado de alta qualidade, este estojo rígido é o acessório essencial e sofisticado para proteger os seus instrumentos de escrita nas suas viagens. Este estojo acomoda dois instrumentos de escrita (médios ou grandes).`, en: `Inspired by the iconic house cigar cases, S.T. Dupont offers a new collection of pens, thought to be functional while offering an elegant and contemporary design. Made of high quality grained veal leather, this rigid case is the essential and sophisticated accessory to protect your writing instruments when traveling. This setting can accommodate two writing instruments (medium or wide).` },
    collection: `Pen Cases`,
    categorySlug: "acessorios",
    image: `/products/pen-case-3/007155.webp`,
    variants: [
      { sku: `007155`, name: { pt: `Estojos para Canetas — Preto`, en: `Pen Cases — Black` }, priceCents: 12000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/pen-case-3/007155.webp`, images: [`/products/pen-case-3/007155.webp`, `/products/pen-case-3/007155-2.webp`] },
      { sku: `007158`, name: { pt: `Estojos para Canetas — Dourado`, en: `Pen Cases — Gold` }, priceCents: 16000, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Gold` }, hex: ["#c8a24a"] } }, image: `/products/pen-case-3/007158.webp`, images: [`/products/pen-case-3/007158.webp`, `/products/pen-case-3/007158-2.webp`] },
      { sku: `007157`, name: { pt: `Estojos para Canetas — Prateado`, en: `Pen Cases — Silver` }, priceCents: 16000, currency: "EUR", attributes: { color: { label: { pt: `Prateado`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/pen-case-3/007157.webp`, images: [`/products/pen-case-3/007157.webp`, `/products/pen-case-3/007157-2.webp`] },
      { sku: `007159`, name: { pt: `Estojos para Canetas — Prateado`, en: `Pen Cases — Silver` }, priceCents: 23000, currency: "EUR", attributes: { color: { label: { pt: `Prateado`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/pen-case-3/007159.webp`, images: [`/products/pen-case-3/007159.webp`, `/products/pen-case-3/007159-2.webp`, `/products/pen-case-3/007159-3.webp`] },
      { sku: `007160`, name: { pt: `Estojos para Canetas — Dourado`, en: `Pen Cases — Gold` }, priceCents: 23000, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Gold` }, hex: ["#c8a24a"] } }, image: `/products/pen-case-3/007160.webp`, images: [`/products/pen-case-3/007160.webp`, `/products/pen-case-3/007160-2.webp`, `/products/pen-case-3/007160-3.webp`] },
      { sku: `007174`, name: { pt: `Estojos para Canetas — Preto`, en: `Pen Cases — Black` }, priceCents: 19000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/pen-case-3/007174.webp`, images: [`/products/pen-case-3/007174.webp`, `/products/pen-case-3/007174-2.webp`] },
      { sku: `007122`, name: { pt: `Estojos para Canetas — Lilás`, en: `Pen Cases — Lilac` }, priceCents: 14000, currency: "EUR", attributes: { color: { label: { pt: `Lilás`, en: `Lilac` }, hex: ["#6b4a8a"] } }, image: `/products/pen-case-3/007122.webp`, images: [`/products/pen-case-3/007122.webp`, `/products/pen-case-3/007122-2.webp`] },
      { sku: `007126`, name: { pt: `Estojos para Canetas — Verde-abeto`, en: `Pen Cases — Fir Green` }, priceCents: 14000, currency: "EUR", attributes: { color: { label: { pt: `Verde-abeto`, en: `Fir Green` }, hex: ["#3b5d39"] } }, image: `/products/pen-case-3/007126.webp`, images: [`/products/pen-case-3/007126.webp`, `/products/pen-case-3/007126-2.webp`] },
      { sku: `007128`, name: { pt: `Estojos para Canetas — Verde-abeto`, en: `Pen Cases — Fir Green` }, priceCents: 20000, currency: "EUR", attributes: { color: { label: { pt: `Verde-abeto`, en: `Fir Green` }, hex: ["#3b5d39"] } }, image: `/products/pen-case-3/007128.webp`, images: [`/products/pen-case-3/007128.webp`, `/products/pen-case-3/007128-2.webp`, `/products/pen-case-3/007128-3.webp`] },
      { sku: `007129`, name: { pt: `Estojos para Canetas — Lilás`, en: `Pen Cases — Lilac` }, priceCents: 20000, currency: "EUR", attributes: { color: { label: { pt: `Lilás`, en: `Lilac` }, hex: ["#6b4a8a"] } }, image: `/products/pen-case-3/007129.webp`, images: [`/products/pen-case-3/007129.webp`, `/products/pen-case-3/007129-2.webp`, `/products/pen-case-3/007129-3.webp`] },
      { sku: `007167`, name: { pt: `Estojos para Canetas — Preto`, en: `Pen Cases — Black` }, priceCents: 17000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/pen-case-3/007167.webp`, images: [`/products/pen-case-3/007167.webp`, `/products/pen-case-3/007167-2.webp`] },
      { sku: `007168`, name: { pt: `Estojos para Canetas — Vermelho`, en: `Pen Cases — Red` }, priceCents: 14000, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/pen-case-3/007168.webp`, images: [`/products/pen-case-3/007168.webp`, `/products/pen-case-3/007168-2.webp`] },
      { sku: `007171`, name: { pt: `Estojos para Canetas — Laranja`, en: `Pen Cases — Orange` }, priceCents: 14000, currency: "EUR", attributes: { color: { label: { pt: `Laranja`, en: `Orange` }, hex: ["#c8a24a"] } }, image: `/products/pen-case-3/007171.webp`, images: [`/products/pen-case-3/007171.webp`, `/products/pen-case-3/007171-2.webp`] },
      { sku: `007169`, name: { pt: `Estojos para Canetas — Vermelho`, en: `Pen Cases — Red` }, priceCents: 21000, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/pen-case-3/007169.webp`, images: [`/products/pen-case-3/007169.webp`, `/products/pen-case-3/007169-2.webp`, `/products/pen-case-3/007169-3.webp`] },
      { sku: `007172`, name: { pt: `Estojos para Canetas — Laranja`, en: `Pen Cases — Orange` }, priceCents: 21000, currency: "EUR", attributes: { color: { label: { pt: `Laranja`, en: `Orange` }, hex: ["#c8a24a"] } }, image: `/products/pen-case-3/007172.webp`, images: [`/products/pen-case-3/007172.webp`, `/products/pen-case-3/007172-2.webp`, `/products/pen-case-3/007172-3.webp`] },
      { sku: `007112`, name: { pt: `Estojos para Canetas — Preto`, en: `Pen Cases — Black` }, priceCents: 57500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/pen-case-3/007112.webp`, images: [`/products/pen-case-3/007112.webp`, `/products/pen-case-3/007112-2.webp`, `/products/pen-case-3/007112-3.webp`, `/products/pen-case-3/007112-4.webp`] },
      { sku: `007133`, name: { pt: `Estojos para Canetas — Lilás`, en: `Pen Cases — Lilac` }, priceCents: 22000, currency: "EUR", attributes: { color: { label: { pt: `Lilás`, en: `Lilac` }, hex: ["#6b4a8a"] } }, image: `/products/pen-case-3/007133.webp`, images: [`/products/pen-case-3/007133.webp`, `/products/pen-case-3/007133-2.webp`, `/products/pen-case-3/007133-3.webp`] },
      { sku: `007134`, name: { pt: `Estojos para Canetas — Verde-abeto`, en: `Pen Cases — Fir Green` }, priceCents: 22000, currency: "EUR", attributes: { color: { label: { pt: `Verde-abeto`, en: `Fir Green` }, hex: ["#3b5d39"] } }, image: `/products/pen-case-3/007134.webp`, images: [`/products/pen-case-3/007134.webp`, `/products/pen-case-3/007134-2.webp`, `/products/pen-case-3/007134-3.webp`] },
      { sku: `007170`, name: { pt: `Estojos para Canetas — Vermelho`, en: `Pen Cases — Red` }, priceCents: 23000, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/pen-case-3/007170.webp`, images: [`/products/pen-case-3/007170.webp`, `/products/pen-case-3/007170-2.webp`, `/products/pen-case-3/007170-3.webp`] },
      { sku: `007173`, name: { pt: `Estojos para Canetas — Laranja`, en: `Pen Cases — Orange` }, priceCents: 23000, currency: "EUR", attributes: { color: { label: { pt: `Laranja`, en: `Orange` }, hex: ["#c8a24a"] } }, image: `/products/pen-case-3/007173.webp`, images: [`/products/pen-case-3/007173.webp`, `/products/pen-case-3/007173-2.webp`, `/products/pen-case-3/007173-3.webp`] },
      { sku: `007111`, name: { pt: `Estojos para Canetas — Preto`, en: `Pen Cases — Black` }, priceCents: 31500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/pen-case-3/007111.webp`, images: [`/products/pen-case-3/007111.webp`, `/products/pen-case-3/007111-2.webp`, `/products/pen-case-3/007111-3.webp`, `/products/pen-case-3/007111-4.webp`] },
      { sku: `007113`, name: { pt: `Estojos para Canetas — Preto`, en: `Pen Cases — Black` }, priceCents: 24000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/pen-case-3/007113.webp`, images: [`/products/pen-case-3/007113.webp`, `/products/pen-case-3/007113-2.webp`, `/products/pen-case-3/007113-3.webp`, `/products/pen-case-3/007113-4.webp`] },
    ],
  },
  {
    slug: `humidor-2`,
    name: { pt: `Humidores`, en: `Humidors` },
    description: { pt: `Inspirado na arte de preservar a qualidade dos charutos em qualquer situação, este prático saco humidificado acomoda até quatro charutos, mantendo-os frescos e em perfeito estado de conservação até ao momento da degustação. Graças à sua tecnologia poly-bag com membrana semipermeável, mantém um nível de humidade ideal (cerca de 65–72%), garantindo frescura e sabor. Leve e compacto, foi concebido para o acompanhar em todas as suas viagens. Caixa de 10 sacos para charutos.`, en: `Inspired by the art of preserving cigar quality in any situation, this practical humidified bag can hold up to four cigars, keeping them fresh and perfectly conditioned until the moment of enjoyment. Thanks to its poly-bag technology with a semi-permeable membrane, it maintains an ideal humidity level (around 65–72%), ensuring freshness and flavor. Lightweight and compact, it is designed to accompany you on all your travels. Box of 10 cigar bags` },
    collection: `Humidors`,
    categorySlug: "acessorios",
    image: `/products/humidor-2/001320.webp`,
    variants: [
      { sku: `001320`, name: { pt: `Humidores — Preto`, en: `Humidors — Black` }, priceCents: 3000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/humidor-2/001320.webp`, images: [`/products/humidor-2/001320.webp`] },
      { sku: `001312`, name: { pt: `Humidores — Preto`, en: `Humidors — Black` }, priceCents: 127000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/humidor-2/001312.webp`, images: [`/products/humidor-2/001312.webp`, `/products/humidor-2/001312-2.webp`, `/products/humidor-2/001312-3.webp`] },
      { sku: `001316`, name: { pt: `Humidores — Preto`, en: `Humidors — Black` }, priceCents: 86500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/humidor-2/001316.webp`, images: [`/products/humidor-2/001316.webp`, `/products/humidor-2/001316-2.webp`, `/products/humidor-2/001316-3.webp`, `/products/humidor-2/001316-4.webp`] },
      { sku: `001357`, name: { pt: `Humidores — Preto`, en: `Humidors — Black` }, priceCents: 44500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/humidor-2/001357.webp`, images: [`/products/humidor-2/001357.webp`, `/products/humidor-2/001357-2.webp`, `/products/humidor-2/001357-3.webp`] },
    ],
  },
  {
    slug: `notebook`,
    name: { pt: `Notebook`, en: `Notebook` },
    description: { pt: `Caderno A5 S.T. Dupont gravado em relevo, na cor preta`, en: `S.T Dupont A5 embossed notebook in black color` },
    collection: `Notebook`,
    categorySlug: "acessorios",
    image: `/products/notebook/007114.webp`,
    variants: [
      { sku: `007114`, name: { pt: `Notebook — Preto`, en: `Notebook — Black` }, priceCents: 6000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/notebook/007114.webp`, images: [`/products/notebook/007114.webp`, `/products/notebook/007114-2.webp`, `/products/notebook/007114-3.webp`, `/products/notebook/007114-4.webp`] },
      { sku: `007115`, name: { pt: `Notebook — Azul & Azul-escuro`, en: `Notebook — Blue & Dark Blue` }, priceCents: 6000, currency: "EUR", attributes: { color: { label: { pt: `Azul & Azul-escuro`, en: `Blue & Dark Blue` }, hex: ["#1f3c66"] } }, image: `/products/notebook/007115.webp`, images: [`/products/notebook/007115.webp`, `/products/notebook/007115-2.webp`, `/products/notebook/007115-3.webp`, `/products/notebook/007115-4.webp`] },
    ],
  },
  {
    slug: `misc`,
    name: { pt: `Diverso`, en: `Misc` },
    description: { pt: `O estojo para isqueiro com pala é o acessório perfeito para proteger o seu isqueiro, valorizando-o com um estilo intemporal. Ornamentado com o famoso «D» da Maison e confeccionado em couro liso preto, conjuga estilo e protecção com elegância e modernidade, estando disponível para os modelos Le Grand Dupont e Ligne 2. Estojo preto para isqueiro Le Grand Dupont com pala, em couro de vitela liso, com a icónica assinatura «D» e passador traseiro com a assinatura S.T. Dupont gravada em relevo.`, en: `The flap lighter case is the perfect accessory to protect your lighter while enhancing it with timeless style, adorned with the famous "D" of the house and crafted from smooth black leather, it combines style and protection with elegance and modernity, it is available for Le Grand Dupont and Ligne 2 models, black lighter case for Le Grand Dupont with flap, smooth calf leather, with the iconic "D" signature, back belt loop with embossed S.T. Dupont signature.` },
    collection: `Misc`,
    categorySlug: "acessorios",
    image: `/products/misc/007153.webp`,
    variants: [
      { sku: `007153`, name: { pt: `Misc — Grey`, en: `Misc — Grey` }, priceCents: 7500, currency: "EUR", attributes: { color: { label: { pt: `Cinzento`, en: `Grey` }, hex: ["#7a7d83"] } }, image: `/products/misc/007153.webp`, images: [`/products/misc/007153.webp`, `/products/misc/007153-2.webp`] },
      { sku: `007154`, name: { pt: `Misc — Variante 7154`, en: `Misc — Variant 7154` }, priceCents: 7500, currency: "EUR", attributes: { color: { label: { pt: `Variante 7154`, en: `Variant 7154` }, hex: ["#7a7d83"] } }, image: `/products/misc/007154.webp`, images: [`/products/misc/007154.webp`, `/products/misc/007154-2.webp`] },
      { sku: `007152`, name: { pt: `Misc — Variante 7152`, en: `Misc — Variant 7152` }, priceCents: 7500, currency: "EUR", attributes: { color: { label: { pt: `Variante 7152`, en: `Variant 7152` }, hex: ["#7a7d83"] } }, image: `/products/misc/007152.webp`, images: [`/products/misc/007152.webp`, `/products/misc/007152-2.webp`] },
      { sku: `CUSTOMIZATION`, name: { pt: `Misc — Variante TION`, en: `Misc — Variant TION` }, priceCents: 2000, currency: "EUR", attributes: { color: { label: { pt: `Variante TION`, en: `Variant TION` }, hex: ["#7a7d83"] } }, image: `/products/misc/CUSTOMIZATION.webp`, images: [`/products/misc/CUSTOMIZATION.webp`] },
      { sku: `180023C`, name: { pt: `Misc — Variante 023C`, en: `Misc — Variant 023C` }, priceCents: 18000, currency: "EUR", attributes: { color: { label: { pt: `Variante 023C`, en: `Variant 023C` }, hex: ["#7a7d83"] } }, image: `/products/misc/180023C.webp`, images: [`/products/misc/180023C.webp`, `/products/misc/180023C-2.webp`] },
      { sku: `180123C`, name: { pt: `Misc — Variante 123C`, en: `Misc — Variant 123C` }, priceCents: 18000, currency: "EUR", attributes: { color: { label: { pt: `Variante 123C`, en: `Variant 123C` }, hex: ["#7a7d83"] } }, image: `/products/misc/180123C.webp`, images: [`/products/misc/180123C.webp`, `/products/misc/180123C-2.webp`] },
    ],
  },
  {
    slug: `firehead-2`,
    name: { pt: `Firehead`, en: `Firehead` },
    description: { pt: `A messenger é a companheira perfeita para a cidade. Com o seu amplo compartimento interior e a pochette para computador, a alça de ombro ajustável e os múltiplos compartimentos internos para canetas e isqueiros, irá acompanhá-lo a todo o lado. Fabricada em couro de vitela flor inteira gravado em relevo com o motivo ponta de fogo; todos os produtos da colecção Firehead são certificados LWG. Inclui: - 1 pochette frontal com íman, - 1 pochette com fecho de correr, - 2 compartimentos para instrumentos de escrita, - 1 bolso plano, - 1 compartimento para isqueiros.`, en: `Le messenger est le compagnon parfait pour la ville. Avec son grand compartiment intérieur et sa pochette pour ordinateur, sa bandoulière ajustable et ses nombreux compartiments internes pour stylos et briquets, il vous accompagnera partout. Fabriqué en cuir de veau pleine fleur embossé avec le motif pointe de feu, tous les produits de la collection Firehead sont certifiés LWG. Il comprend : - 1 pochette avant avec aimant, - 1 pochette zippée, - 2 compartiments pour instruments d'écriture, - 1 poche plate, - 1 compartiment pour briquets.` },
    collection: `Firehead`,
    categorySlug: "pele",
    image: `/products/firehead-2/160004.webp`,
    variants: [
      { sku: `160004`, name: { pt: `Firehead — Preto`, en: `Firehead — Black` }, priceCents: 100000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/firehead-2/160004.webp`, images: [`/products/firehead-2/160004.webp`, `/products/firehead-2/160004-2.webp`, `/products/firehead-2/160004-3.webp`, `/products/firehead-2/160004-4.webp`] },
      { sku: `161609`, name: { pt: `Firehead — Azul`, en: `Firehead — Blue` }, priceCents: 19000, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/firehead-2/161609.webp`, images: [`/products/firehead-2/161609.webp`, `/products/firehead-2/161609-2.webp`] },
      { sku: `161613`, name: { pt: `Firehead — Azul`, en: `Firehead — Blue` }, priceCents: 19000, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/firehead-2/161613.webp`, images: [`/products/firehead-2/161613.webp`, `/products/firehead-2/161613-2.webp`] },
      { sku: `160005`, name: { pt: `Firehead — Preto`, en: `Firehead — Black` }, priceCents: 100000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/firehead-2/160005.webp`, images: [`/products/firehead-2/160005.webp`, `/products/firehead-2/160005-2.webp`, `/products/firehead-2/160005-3.webp`, `/products/firehead-2/160005-4.webp`] },
      { sku: `160010`, name: { pt: `Firehead — Preto`, en: `Firehead — Black` }, priceCents: 66500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/firehead-2/160010.webp`, images: [`/products/firehead-2/160010.webp`, `/products/firehead-2/160010-2.webp`, `/products/firehead-2/160010-3.webp`, `/products/firehead-2/160010-4.webp`] },
      { sku: `160008`, name: { pt: `Firehead — Preto`, en: `Firehead — Black` }, priceCents: 149000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/firehead-2/160008.webp`, images: [`/products/firehead-2/160008.webp`, `/products/firehead-2/160008-2.webp`, `/products/firehead-2/160008-3.webp`, `/products/firehead-2/160008-4.webp`] },
      { sku: `160610`, name: { pt: `Firehead — Azul`, en: `Firehead — Blue` }, priceCents: 66500, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/firehead-2/160610.webp`, images: [`/products/firehead-2/160610.webp`, `/products/firehead-2/160610-2.webp`, `/products/firehead-2/160610-3.webp`, `/products/firehead-2/160610-4.webp`] },
      { sku: `160009`, name: { pt: `Firehead — Preto`, en: `Firehead — Black` }, priceCents: 79500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/firehead-2/160009.webp`, images: [`/products/firehead-2/160009.webp`, `/products/firehead-2/160009-2.webp`, `/products/firehead-2/160009-3.webp`, `/products/firehead-2/160009-4.webp`] },
      { sku: `160609`, name: { pt: `Firehead — Azul`, en: `Firehead — Blue` }, priceCents: 79500, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/firehead-2/160609.webp`, images: [`/products/firehead-2/160609.webp`, `/products/firehead-2/160609-2.webp`, `/products/firehead-2/160609-3.webp`, `/products/firehead-2/160609-4.webp`] },
      { sku: `161114`, name: { pt: `Firehead — Preto`, en: `Firehead — Black` }, priceCents: 23000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/firehead-2/161114.webp`, images: [`/products/firehead-2/161114.webp`, `/products/firehead-2/161114-2.webp`] },
      { sku: `161614`, name: { pt: `Firehead — Azul`, en: `Firehead — Blue` }, priceCents: 23000, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/firehead-2/161614.webp`, images: [`/products/firehead-2/161614.webp`, `/products/firehead-2/161614-2.webp`] },
      { sku: `160012`, name: { pt: `Firehead — Preto`, en: `Firehead — Black` }, priceCents: 55500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/firehead-2/160012.webp`, images: [`/products/firehead-2/160012.webp`, `/products/firehead-2/160012-2.webp`, `/products/firehead-2/160012-3.webp`, `/products/firehead-2/160012-4.webp`] },
      { sku: `160001`, name: { pt: `Firehead — Preto`, en: `Firehead — Black` }, priceCents: 76500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/firehead-2/160001.webp`, images: [`/products/firehead-2/160001.webp`, `/products/firehead-2/160001-2.webp`, `/products/firehead-2/160001-3.webp`, `/products/firehead-2/160001-4.webp`] },
      { sku: `160007`, name: { pt: `Firehead — Preto`, en: `Firehead — Black` }, priceCents: 100000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/firehead-2/160007.webp`, images: [`/products/firehead-2/160007.webp`, `/products/firehead-2/160007-2.webp`, `/products/firehead-2/160007-3.webp`, `/products/firehead-2/160007-4.webp`] },
      { sku: `161108`, name: { pt: `Firehead — Preto`, en: `Firehead — Black` }, priceCents: 24000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/firehead-2/161108.webp`, images: [`/products/firehead-2/161108.webp`, `/products/firehead-2/161108-2.webp`] },
      { sku: `161608`, name: { pt: `Firehead — Azul`, en: `Firehead — Blue` }, priceCents: 24000, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/firehead-2/161608.webp`, images: [`/products/firehead-2/161608.webp`, `/products/firehead-2/161608-2.webp`] },
      { sku: `161111`, name: { pt: `Firehead — Preto`, en: `Firehead — Black` }, priceCents: 23000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/firehead-2/161111.webp`, images: [`/products/firehead-2/161111.webp`, `/products/firehead-2/161111-2.webp`] },
      { sku: `161611`, name: { pt: `Firehead — Azul`, en: `Firehead — Blue` }, priceCents: 23000, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/firehead-2/161611.webp`, images: [`/products/firehead-2/161611.webp`, `/products/firehead-2/161611-2.webp`, `/products/firehead-2/161611-3.webp`] },
      { sku: `161112`, name: { pt: `Firehead — Preto`, en: `Firehead — Black` }, priceCents: 22000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/firehead-2/161112.webp`, images: [`/products/firehead-2/161112.webp`, `/products/firehead-2/161112-2.webp`] },
      { sku: `161612`, name: { pt: `Firehead — Azul`, en: `Firehead — Blue` }, priceCents: 22000, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/firehead-2/161612.webp`, images: [`/products/firehead-2/161612.webp`, `/products/firehead-2/161612-2.webp`, `/products/firehead-2/161612-3.webp`] },
      { sku: `161115`, name: { pt: `Firehead — Preto`, en: `Firehead — Black` }, priceCents: 25000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/firehead-2/161115.webp`, images: [`/products/firehead-2/161115.webp`, `/products/firehead-2/161115-2.webp`] },
      { sku: `161116`, name: { pt: `Firehead — Preto`, en: `Firehead — Black` }, priceCents: 37500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/firehead-2/161116.webp`, images: [`/products/firehead-2/161116.webp`, `/products/firehead-2/161116-2.webp`, `/products/firehead-2/161116-3.webp`, `/products/firehead-2/161116-4.webp`] },
      { sku: `1FD571BK1`, name: { pt: `Firehead — Preto`, en: `Firehead — Black` }, priceCents: 29000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/firehead-2/1FD571BK1.webp`, images: [`/products/firehead-2/1FD571BK1.webp`, `/products/firehead-2/1FD571BK1-2.webp`] },
    ],
  },
  {
    slug: `apex`,
    name: { pt: `Apex`, en: `Apex` },
    description: { pt: `O Nano Trunk Apex é uma elegante reinterpretação das famosas malas-baú outrora criadas por Monsieur Dupont para figuras influentes. Esta mala unissexo, mais compacta do que nunca, apresenta cores vibrantes e tornou-se o acessório essencial para o homem e a mulher modernos. À imagem dos seus predecessores, o Nano Trunk é versátil, refinado e rico em herança e histórias cativantes. Fabricado em Itália, este modelo é confeccionado em couro flor inteira com forro em algodão cinzento e acabamentos em paládio. Conta com uma alça ajustável para uma utilização prática e adaptável. Com o seu degradé azul fresco e acabamento brilhante, o Apex Nano Trunk evoca a chama dançante dos isqueiros S.T. Dupont (azul para a chama maçarico e laranja para a chama mais amarela), bem como a arte da laca. O couro utilizado no Nano Trunk é certificado LWG, garantindo uma produção ecologicamente responsável.`, en: `The Nano Trunk Apex is an elegant reinterpretation of the famous trunk suitcases once created by Mr. Dupont for influential figures. This unisex bag, more compact than ever, features vibrant colors and has become the essential accessory for the modern man and woman. Like its predecessors, the Nano Trunk is versatile, refined, and rich in heritage and captivating stories. Made in Italy, this model is crafted from full-grain leather with a gray cotton lining and palladium finishes. It features an adjustable strap for practical and adaptable use. With its cool blue gradient and glossy finish, the apex nano trunk evokes the dancing flame of S.T. Dupont lighters (blue for the torch flame and orange for the more yellow flame), as well as the art of lacquer. The leather used for the Nano Trunk is LWG certified, guaranteeing environmentally friendly production.` },
    collection: `Apex`,
    categorySlug: "pele",
    image: `/products/apex/1AX221BK1.webp`,
    variants: [
      { sku: `1AX221BK1`, name: { pt: `Apex — Black`, en: `Apex — Black` }, priceCents: 149000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/apex/1AX221BK1.webp`, images: [`/products/apex/1AX221BK1.webp`, `/products/apex/1AX221BK1-2.webp`, `/products/apex/1AX221BK1-3.webp`, `/products/apex/1AX221BK1-4.webp`] },
      { sku: `1AX221GN2`, name: { pt: `Apex — Grey`, en: `Apex — Grey` }, priceCents: 149000, currency: "EUR", attributes: { color: { label: { pt: `Cinzento`, en: `Grey` }, hex: ["#7a7d83"] } }, image: `/products/apex/1AX221GN2.webp`, images: [`/products/apex/1AX221GN2.webp`, `/products/apex/1AX221GN2-2.webp`, `/products/apex/1AX221GN2-3.webp`, `/products/apex/1AX221GN2-4.webp`] },
      { sku: `1AX683BK1`, name: { pt: `Apex — Black`, en: `Apex — Black` }, priceCents: 22500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/apex/1AX683BK1.webp`, images: [`/products/apex/1AX683BK1.webp`, `/products/apex/1AX683BK1-2.webp`] },
      { sku: `1AX683UN1`, name: { pt: `Apex — Azul Índigo`, en: `Apex — Indigo Blue` }, priceCents: 22500, currency: "EUR", attributes: { color: { label: { pt: `Azul Índigo`, en: `Indigo Blue` }, hex: ["#1f3c66"] } }, image: `/products/apex/1AX683UN1.webp`, images: [`/products/apex/1AX683UN1.webp`, `/products/apex/1AX683UN1-2.webp`] },
      { sku: `1AX683UL1`, name: { pt: `Apex — Azul Claro`, en: `Apex — Light Blue` }, priceCents: 22500, currency: "EUR", attributes: { color: { label: { pt: `Azul Claro`, en: `Light Blue` }, hex: ["#1f3c66"] } }, image: `/products/apex/1AX683UL1.webp`, images: [`/products/apex/1AX683UL1.webp`, `/products/apex/1AX683UL1-2.webp`] },
      { sku: `1AX683PL2`, name: { pt: `Apex — Rosa Claro`, en: `Apex — Light Pink` }, priceCents: 22500, currency: "EUR", attributes: { color: { label: { pt: `Rosa Claro`, en: `Light Pink` }, hex: ["#c97a8c"] } }, image: `/products/apex/1AX683PL2.webp`, images: [`/products/apex/1AX683PL2.webp`, `/products/apex/1AX683PL2-2.webp`] },
      { sku: `1AX532BK1`, name: { pt: `Apex — Black`, en: `Apex — Black` }, priceCents: 29000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/apex/1AX532BK1.webp`, images: [`/products/apex/1AX532BK1.webp`, `/products/apex/1AX532BK1-2.webp`] },
      { sku: `1AX532UN1`, name: { pt: `Apex — Azul Índigo`, en: `Apex — Indigo Blue` }, priceCents: 29000, currency: "EUR", attributes: { color: { label: { pt: `Azul Índigo`, en: `Indigo Blue` }, hex: ["#1f3c66"] } }, image: `/products/apex/1AX532UN1.webp`, images: [`/products/apex/1AX532UN1.webp`, `/products/apex/1AX532UN1-2.webp`] },
      { sku: `1AX683UD1`, name: { pt: `Apex — Azul & Azul-escuro`, en: `Apex — Blue & Dark Blue` }, priceCents: 22500, currency: "EUR", attributes: { color: { label: { pt: `Azul & Azul-escuro`, en: `Blue & Dark Blue` }, hex: ["#1f3c66"] } }, image: `/products/apex/1AX683UD1.webp`, images: [`/products/apex/1AX683UD1.webp`, `/products/apex/1AX683UD1-2.webp`] },
      { sku: `1AX513SV2`, name: { pt: `Apex — Silver`, en: `Apex — Silver` }, priceCents: 27000, currency: "EUR", attributes: { color: { label: { pt: `Prateado`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/apex/1AX513SV2.webp`, images: [`/products/apex/1AX513SV2.webp`, `/products/apex/1AX513SV2-2.webp`] },
      { sku: `1AX132BK1`, name: { pt: `Apex — Black`, en: `Apex — Black` }, priceCents: 156500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/apex/1AX132BK1.webp`, images: [`/products/apex/1AX132BK1.webp`, `/products/apex/1AX132BK1-2.webp`, `/products/apex/1AX132BK1-3.webp`, `/products/apex/1AX132BK1-4.webp`] },
      { sku: `1AX132GN2`, name: { pt: `Apex — Grey`, en: `Apex — Grey` }, priceCents: 156500, currency: "EUR", attributes: { color: { label: { pt: `Cinzento`, en: `Grey` }, hex: ["#7a7d83"] } }, image: `/products/apex/1AX132GN2.webp`, images: [`/products/apex/1AX132GN2.webp`, `/products/apex/1AX132GN2-2.webp`, `/products/apex/1AX132GN2-3.webp`, `/products/apex/1AX132GN2-4.webp`] },
      { sku: `1AX101BK1`, name: { pt: `Apex — Black`, en: `Apex — Black` }, priceCents: 196500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/apex/1AX101BK1.webp`, images: [`/products/apex/1AX101BK1.webp`, `/products/apex/1AX101BK1-2.webp`, `/products/apex/1AX101BK1-3.webp`, `/products/apex/1AX101BK1-4.webp`] },
      { sku: `1AX192BK1`, name: { pt: `Apex — Black`, en: `Apex — Black` }, priceCents: 156500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/apex/1AX192BK1.webp`, images: [`/products/apex/1AX192BK1.webp`, `/products/apex/1AX192BK1-2.webp`, `/products/apex/1AX192BK1-3.webp`, `/products/apex/1AX192BK1-4.webp`] },
      { sku: `1AX192UN1`, name: { pt: `Apex — Azul Índigo`, en: `Apex — Indigo Blue` }, priceCents: 155000, currency: "EUR", attributes: { color: { label: { pt: `Azul Índigo`, en: `Indigo Blue` }, hex: ["#1f3c66"] } }, image: `/products/apex/1AX192UN1.webp`, images: [`/products/apex/1AX192UN1.webp`, `/products/apex/1AX192UN1-2.webp`, `/products/apex/1AX192UN1-3.webp`, `/products/apex/1AX192UN1-4.webp`] },
      { sku: `1AX192PL2`, name: { pt: `Apex — Rosa Claro`, en: `Apex — Light Pink` }, priceCents: 155000, currency: "EUR", attributes: { color: { label: { pt: `Rosa Claro`, en: `Light Pink` }, hex: ["#c97a8c"] } }, image: `/products/apex/1AX192PL2.webp`, images: [`/products/apex/1AX192PL2.webp`, `/products/apex/1AX192PL2-2.webp`, `/products/apex/1AX192PL2-3.webp`, `/products/apex/1AX192PL2-4.webp`] },
      { sku: `1AX192SV2`, name: { pt: `Apex — Silver`, en: `Apex — Silver` }, priceCents: 161500, currency: "EUR", attributes: { color: { label: { pt: `Prateado`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/apex/1AX192SV2.webp`, images: [`/products/apex/1AX192SV2.webp`, `/products/apex/1AX192SV2-2.webp`, `/products/apex/1AX192SV2-3.webp`, `/products/apex/1AX192SV2-4.webp`] },
      { sku: `1AX192ND1`, name: { pt: `Apex — Verde-abeto`, en: `Apex — Fir Green` }, priceCents: 155000, currency: "EUR", attributes: { color: { label: { pt: `Verde-abeto`, en: `Fir Green` }, hex: ["#3b5d39"] } }, image: `/products/apex/1AX192ND1.webp`, images: [`/products/apex/1AX192ND1.webp`, `/products/apex/1AX192ND1-2.webp`, `/products/apex/1AX192ND1-3.webp`, `/products/apex/1AX192ND1-4.webp`] },
      { sku: `1AX192WH2`, name: { pt: `Apex — Branco Marfim`, en: `Apex — Off White` }, priceCents: 156500, currency: "EUR", attributes: { color: { label: { pt: `Branco Marfim`, en: `Off White` }, hex: ["#efeae0"] } }, image: `/products/apex/1AX192WH2.webp`, images: [`/products/apex/1AX192WH2.webp`, `/products/apex/1AX192WH2-2.webp`, `/products/apex/1AX192WH2-3.webp`, `/products/apex/1AX192WH2-4.webp`] },
      { sku: `1AX191BK1`, name: { pt: `Apex — Black`, en: `Apex — Black` }, priceCents: 121000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/apex/1AX191BK1.webp`, images: [`/products/apex/1AX191BK1.webp`, `/products/apex/1AX191BK1-2.webp`, `/products/apex/1AX191BK1-3.webp`, `/products/apex/1AX191BK1-4.webp`] },
      { sku: `1AX191SV2`, name: { pt: `Apex — Silver`, en: `Apex — Silver` }, priceCents: 121000, currency: "EUR", attributes: { color: { label: { pt: `Prateado`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/apex/1AX191SV2.webp`, images: [`/products/apex/1AX191SV2.webp`, `/products/apex/1AX191SV2-2.webp`, `/products/apex/1AX191SV2-3.webp`, `/products/apex/1AX191SV2-4.webp`] },
      { sku: `1AX191RN1`, name: { pt: `Apex — Red`, en: `Apex — Red` }, priceCents: 120000, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/apex/1AX191RN1.webp`, images: [`/products/apex/1AX191RN1.webp`, `/products/apex/1AX191RN1-2.webp`, `/products/apex/1AX191RN1-3.webp`, `/products/apex/1AX191RN1-4.webp`] },
      { sku: `1AX191ND1`, name: { pt: `Apex — Verde-abeto & Verde`, en: `Apex — Fir Green & Green` }, priceCents: 120000, currency: "EUR", attributes: { color: { label: { pt: `Verde-abeto & Verde`, en: `Fir Green & Green` }, hex: ["#3b5d39"] } }, image: `/products/apex/1AX191ND1.webp`, images: [`/products/apex/1AX191ND1.webp`, `/products/apex/1AX191ND1-2.webp`, `/products/apex/1AX191ND1-3.webp`, `/products/apex/1AX191ND1-4.webp`] },
      { sku: `1AX191VN1`, name: { pt: `Apex — Azul & Azul-escuro`, en: `Apex — Blue & Dark Blue` }, priceCents: 120000, currency: "EUR", attributes: { color: { label: { pt: `Azul & Azul-escuro`, en: `Blue & Dark Blue` }, hex: ["#1f3c66"] } }, image: `/products/apex/1AX191VN1.webp`, images: [`/products/apex/1AX191VN1.webp`, `/products/apex/1AX191VN1-2.webp`, `/products/apex/1AX191VN1-3.webp`, `/products/apex/1AX191VN1-4.webp`] },
      { sku: `1AX191NL1`, name: { pt: `Apex — Verde Claro`, en: `Apex — Light Green` }, priceCents: 120000, currency: "EUR", attributes: { color: { label: { pt: `Verde Claro`, en: `Light Green` }, hex: ["#3b5d39"] } }, image: `/products/apex/1AX191NL1.webp`, images: [`/products/apex/1AX191NL1.webp`, `/products/apex/1AX191NL1-2.webp`, `/products/apex/1AX191NL1-3.webp`, `/products/apex/1AX191NL1-4.webp`] },
      { sku: `1AM191SV1`, name: { pt: `Apex — Silver`, en: `Apex — Silver` }, priceCents: 130000, currency: "EUR", attributes: { color: { label: { pt: `Prateado`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/apex/1AM191SV1.webp`, images: [`/products/apex/1AM191SV1.webp`, `/products/apex/1AM191SV1-2.webp`, `/products/apex/1AM191SV1-3.webp`, `/products/apex/1AM191SV1-4.webp`] },
      { sku: `1AX191WH2`, name: { pt: `Apex — Branco Marfim`, en: `Apex — Off White` }, priceCents: 121000, currency: "EUR", attributes: { color: { label: { pt: `Branco Marfim`, en: `Off White` }, hex: ["#efeae0"] } }, image: `/products/apex/1AX191WH2.webp`, images: [`/products/apex/1AX191WH2.webp`, `/products/apex/1AX191WH2-2.webp`, `/products/apex/1AX191WH2-3.webp`, `/products/apex/1AX191WH2-4.webp`] },
      { sku: `1AH191UN2`, name: { pt: `Apex — Blue`, en: `Apex — Blue` }, priceCents: 131000, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/apex/1AH191UN2.webp`, images: [`/products/apex/1AH191UN2.webp`, `/products/apex/1AH191UN2-2.webp`, `/products/apex/1AH191UN2-3.webp`, `/products/apex/1AH191UN2-4.webp`] },
      { sku: `1AX212BK1`, name: { pt: `Apex — Black`, en: `Apex — Black` }, priceCents: 69500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/apex/1AX212BK1.webp`, images: [`/products/apex/1AX212BK1.webp`, `/products/apex/1AX212BK1-2.webp`, `/products/apex/1AX212BK1-3.webp`] },
      { sku: `1AX212GN2`, name: { pt: `Apex — Grey`, en: `Apex — Grey` }, priceCents: 69500, currency: "EUR", attributes: { color: { label: { pt: `Cinzento`, en: `Grey` }, hex: ["#7a7d83"] } }, image: `/products/apex/1AX212GN2.webp`, images: [`/products/apex/1AX212GN2.webp`, `/products/apex/1AX212GN2-2.webp`, `/products/apex/1AX212GN2-3.webp`, `/products/apex/1AX212GN2-4.webp`] },
      { sku: `1AX653BK1`, name: { pt: `Apex — Black`, en: `Apex — Black` }, priceCents: 39500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/apex/1AX653BK1.webp`, images: [`/products/apex/1AX653BK1.webp`, `/products/apex/1AX653BK1-2.webp`] },
      { sku: `1AX653UL1`, name: { pt: `Apex — Azul Claro`, en: `Apex — Light Blue` }, priceCents: 39500, currency: "EUR", attributes: { color: { label: { pt: `Azul Claro`, en: `Light Blue` }, hex: ["#1f3c66"] } }, image: `/products/apex/1AX653UL1.webp`, images: [`/products/apex/1AX653UL1.webp`, `/products/apex/1AX653UL1-2.webp`] },
      { sku: `1AX653PL2`, name: { pt: `Apex — Rosa Claro`, en: `Apex — Light Pink` }, priceCents: 39500, currency: "EUR", attributes: { color: { label: { pt: `Rosa Claro`, en: `Light Pink` }, hex: ["#c97a8c"] } }, image: `/products/apex/1AX653PL2.webp`, images: [`/products/apex/1AX653PL2.webp`, `/products/apex/1AX653PL2-2.webp`] },
      { sku: `1AX212UD1`, name: { pt: `Apex — Blue`, en: `Apex — Blue` }, priceCents: 69500, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/apex/1AX212UD1.webp`, images: [`/products/apex/1AX212UD1.webp`, `/products/apex/1AX212UD1-2.webp`, `/products/apex/1AX212UD1-3.webp`, `/products/apex/1AX212UD1-4.webp`] },
      { sku: `1AX153BK1`, name: { pt: `Apex — Black`, en: `Apex — Black` }, priceCents: 146000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/apex/1AX153BK1.webp`, images: [`/products/apex/1AX153BK1.webp`, `/products/apex/1AX153BK1-2.webp`, `/products/apex/1AX153BK1-3.webp`, `/products/apex/1AX153BK1-4.webp`] },
      { sku: `1AX153GN2`, name: { pt: `Apex — Grey`, en: `Apex — Grey` }, priceCents: 146000, currency: "EUR", attributes: { color: { label: { pt: `Cinzento`, en: `Grey` }, hex: ["#7a7d83"] } }, image: `/products/apex/1AX153GN2.webp`, images: [`/products/apex/1AX153GN2.webp`, `/products/apex/1AX153GN2-2.webp`, `/products/apex/1AX153GN2-3.webp`, `/products/apex/1AX153GN2-4.webp`] },
      { sku: `1AX182BK1`, name: { pt: `Apex — Silver`, en: `Apex — Silver` }, priceCents: 169000, currency: "EUR", attributes: { color: { label: { pt: `Prateado`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/apex/1AX182BK1.webp`, images: [`/products/apex/1AX182BK1.webp`, `/products/apex/1AX182BK1-2.webp`] },
      { sku: `1AX182SV2`, name: { pt: `Apex — Silver`, en: `Apex — Silver` }, priceCents: 174000, currency: "EUR", attributes: { color: { label: { pt: `Prateado`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/apex/1AX182SV2.webp`, images: [`/products/apex/1AX182SV2.webp`, `/products/apex/1AX182SV2-2.webp`, `/products/apex/1AX182SV2-3.webp`, `/products/apex/1AX182SV2-4.webp`] },
      { sku: `1AX552BK1`, name: { pt: `Apex — Black`, en: `Apex — Black` }, priceCents: 45500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/apex/1AX552BK1.webp`, images: [`/products/apex/1AX552BK1.webp`, `/products/apex/1AX552BK1-2.webp`] },
      { sku: `1AX552PL2`, name: { pt: `Apex — Rosa Claro`, en: `Apex — Light Pink` }, priceCents: 45500, currency: "EUR", attributes: { color: { label: { pt: `Rosa Claro`, en: `Light Pink` }, hex: ["#c97a8c"] } }, image: `/products/apex/1AX552PL2.webp`, images: [`/products/apex/1AX552PL2.webp`, `/products/apex/1AX552PL2-2.webp`] },
      { sku: `1AX561BK1`, name: { pt: `Apex — Black`, en: `Apex — Black` }, priceCents: 34500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/apex/1AX561BK1.webp`, images: [`/products/apex/1AX561BK1.webp`, `/products/apex/1AX561BK1-2.webp`] },
      { sku: `1AX561UL1`, name: { pt: `Apex — Azul Claro`, en: `Apex — Light Blue` }, priceCents: 34000, currency: "EUR", attributes: { color: { label: { pt: `Azul Claro`, en: `Light Blue` }, hex: ["#1f3c66"] } }, image: `/products/apex/1AX561UL1.webp`, images: [`/products/apex/1AX561UL1.webp`, `/products/apex/1AX561UL1-2.webp`] },
      { sku: `1AX561UD1`, name: { pt: `Apex — Azul & Azul-escuro`, en: `Apex — Blue & Dark Blue` }, priceCents: 34500, currency: "EUR", attributes: { color: { label: { pt: `Azul & Azul-escuro`, en: `Blue & Dark Blue` }, hex: ["#1f3c66"] } }, image: `/products/apex/1AX561UD1.webp`, images: [`/products/apex/1AX561UD1.webp`, `/products/apex/1AX561UD1-2.webp`] },
      { sku: `1AX552SV2`, name: { pt: `Apex — Silver`, en: `Apex — Silver` }, priceCents: 45500, currency: "EUR", attributes: { color: { label: { pt: `Prateado`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/apex/1AX552SV2.webp`, images: [`/products/apex/1AX552SV2.webp`, `/products/apex/1AX552SV2-2.webp`] },
      { sku: `1AX581BK1`, name: { pt: `Apex — Black`, en: `Apex — Black` }, priceCents: 36500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/apex/1AX581BK1.webp`, images: [`/products/apex/1AX581BK1.webp`, `/products/apex/1AX581BK1-2.webp`] },
      { sku: `1AX513BK1`, name: { pt: `Apex — Black`, en: `Apex — Black` }, priceCents: 27000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/apex/1AX513BK1.webp`, images: [`/products/apex/1AX513BK1.webp`, `/products/apex/1AX513BK1-2.webp`] },
      { sku: `1AX513UL1`, name: { pt: `Apex — Azul Claro`, en: `Apex — Light Blue` }, priceCents: 27000, currency: "EUR", attributes: { color: { label: { pt: `Azul Claro`, en: `Light Blue` }, hex: ["#1f3c66"] } }, image: `/products/apex/1AX513UL1.webp`, images: [`/products/apex/1AX513UL1.webp`, `/products/apex/1AX513UL1-2.webp`] },
    ],
  },
  {
    slug: `monogram-1872`,
    name: { pt: `Monogram 1872`, en: `Monogram 1872` },
    description: { pt: `1872 é uma colecção de malas práticas e elegantes, à imagem dos baús dos primeiros tempos da Maison. 1872 é também o ano em que a Maison foi fundada, o início de uma busca incessante pela excelência e por objectos de excepção. Orgulhosa do seu savoir-faire, a S.T. Dupont utiliza um guilloché dos anos 50 para decorar esta linha com um design all-over que conjuga herança e modernidade. Inspirada no guilloché dos anos 50, esta mala unissexo conjuga elegância e funcionalidade. A mala é fabricada em Itália, conjugando lona revestida impermeável e couro de vitela flor inteira, com interior em algodão cinzento com dois bolsos planos. O couro utilizado é certificado LWG.`, en: `1872 is a collection of practical, elegant bags, just like the trunks of the Maison's early days. 1872 is also the year the Maison was founded, the beginning of a never-ending quest for excellence and exceptional objects. Proud of its expertise, S.T. Dupont uses a guilloche from the 1950s to decorate this line with an all-over design that blends heritage and modernity.Inspired by 1950s guilloché, this unisex bag combines elegance and functionality. The bag is made in Italy, combining waterproof coated canvas and full-grained calf leather, with a grey cotton interior with two flat pockets. Leather used is LWG certified.` },
    collection: `Monogram 1872`,
    categorySlug: "pele",
    image: `/products/monogram-1872/1MG223BK2.webp`,
    variants: [
      { sku: `1MG223BK2`, name: { pt: `Monogram 1872 — Cinzento Escuro`, en: `Monogram 1872 — Dark Gray` }, priceCents: 120000, currency: "EUR", attributes: { color: { label: { pt: `Cinzento Escuro`, en: `Dark Gray` }, hex: ["#7a7d83"] } }, image: `/products/monogram-1872/1MG223BK2.webp`, images: [`/products/monogram-1872/1MG223BK2.webp`, `/products/monogram-1872/1MG223BK2-2.webp`, `/products/monogram-1872/1MG223BK2-3.webp`, `/products/monogram-1872/1MG223BK2-4.webp`] },
      { sku: `1MG223GN1`, name: { pt: `Monogram 1872 — Cinzento Claro`, en: `Monogram 1872 — Light Gray` }, priceCents: 120000, currency: "EUR", attributes: { color: { label: { pt: `Cinzento Claro`, en: `Light Gray` }, hex: ["#7a7d83"] } }, image: `/products/monogram-1872/1MG223GN1.webp`, images: [`/products/monogram-1872/1MG223GN1.webp`, `/products/monogram-1872/1MG223GN1-2.webp`, `/products/monogram-1872/1MG223GN1-3.webp`, `/products/monogram-1872/1MG223GN1-4.webp`] },
      { sku: `1MG212BK2`, name: { pt: `Monogram 1872 — Preto`, en: `Monogram 1872 — Black` }, priceCents: 59000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/monogram-1872/1MG212BK2.webp`, images: [`/products/monogram-1872/1MG212BK2.webp`, `/products/monogram-1872/1MG212BK2-2.webp`, `/products/monogram-1872/1MG212BK2-3.webp`, `/products/monogram-1872/1MG212BK2-4.webp`] },
      { sku: `1MG212GN1`, name: { pt: `Monogram 1872 — Cinzento`, en: `Monogram 1872 — Grey` }, priceCents: 59000, currency: "EUR", attributes: { color: { label: { pt: `Cinzento`, en: `Grey` }, hex: ["#7a7d83"] } }, image: `/products/monogram-1872/1MG212GN1.webp`, images: [`/products/monogram-1872/1MG212GN1.webp`, `/products/monogram-1872/1MG212GN1-2.webp`, `/products/monogram-1872/1MG212GN1-3.webp`, `/products/monogram-1872/1MG212GN1-4.webp`] },
      { sku: `1MG333BK1`, name: { pt: `Monogram 1872 — Preto`, en: `Monogram 1872 — Black` }, priceCents: 115000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/monogram-1872/1MG333BK1.webp`, images: [`/products/monogram-1872/1MG333BK1.webp`, `/products/monogram-1872/1MG333BK1-2.webp`, `/products/monogram-1872/1MG333BK1-3.webp`, `/products/monogram-1872/1MG333BK1-4.webp`] },
      { sku: `1MG333WH1`, name: { pt: `Monogram 1872 — Branco`, en: `Monogram 1872 — White` }, priceCents: 115000, currency: "EUR", attributes: { color: { label: { pt: `Branco`, en: `White` }, hex: ["#efeae0"] } }, image: `/products/monogram-1872/1MG333WH1.webp`, images: [`/products/monogram-1872/1MG333WH1.webp`, `/products/monogram-1872/1MG333WH1-2.webp`, `/products/monogram-1872/1MG333WH1-3.webp`, `/products/monogram-1872/1MG333WH1-4.webp`] },
      { sku: `1MG153BK2`, name: { pt: `Monogram 1872 — Preto`, en: `Monogram 1872 — Black` }, priceCents: 120000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/monogram-1872/1MG153BK2.webp`, images: [`/products/monogram-1872/1MG153BK2.webp`, `/products/monogram-1872/1MG153BK2-2.webp`, `/products/monogram-1872/1MG153BK2-3.webp`, `/products/monogram-1872/1MG153BK2-4.webp`] },
      { sku: `1MG153GN1`, name: { pt: `Monogram 1872 — Cinzento`, en: `Monogram 1872 — Grey` }, priceCents: 120000, currency: "EUR", attributes: { color: { label: { pt: `Cinzento`, en: `Grey` }, hex: ["#7a7d83"] } }, image: `/products/monogram-1872/1MG153GN1.webp`, images: [`/products/monogram-1872/1MG153GN1.webp`, `/products/monogram-1872/1MG153GN1-2.webp`, `/products/monogram-1872/1MG153GN1-3.webp`, `/products/monogram-1872/1MG153GN1-4.webp`] },
    ],
  },
  {
    slug: `classic`,
    name: { pt: `Classic`, en: `Classic` },
    description: { pt: `Um clássico intemporal. O produto é fabricado em Itália, com exterior em couro de vitela flor inteira macio, forro em algodão cinzento claro e acabamentos em paládio. Este produto é fabricado em Itália com exterior em couro de vitela flor inteira liso, forro em algodão cinzento claro e acabamentos em paládio. Conta com uma alça amovível e ajustável, um amplo bolso interior com fecho de correr e um compartimento para computadores portáteis até 13". O couro utilizado é certificado LWG.`, en: `A timeless classic. The product is made in Italy, with the exterior in soft full-grain calf leather, a light grey cotton lining, and palladium finishings. This product is made in Italy with a smooth full-grain calf leather exterior, light grey cotton lining, and palladium finishes. Featuring a removable and adjustable strap, a large zipped inner pocket, and a compartment for laptops up to 13". Leather used is LWG certified.` },
    collection: `Classic`,
    categorySlug: "pele",
    image: `/products/classic/1LG224BK1.webp`,
    variants: [
      { sku: `1LG224BK1`, name: { pt: `Classic — Preto`, en: `Classic — Black` }, priceCents: 140000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/classic/1LG224BK1.webp`, images: [`/products/classic/1LG224BK1.webp`, `/products/classic/1LG224BK1-2.webp`, `/products/classic/1LG224BK1-3.webp`, `/products/classic/1LG224BK1-4.webp`] },
      { sku: `1LG132BK1`, name: { pt: `Classic — Preto`, en: `Classic — Black` }, priceCents: 136000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/classic/1LG132BK1.webp`, images: [`/products/classic/1LG132BK1.webp`, `/products/classic/1LG132BK1-2.webp`, `/products/classic/1LG132BK1-3.webp`, `/products/classic/1LG132BK1-4.webp`] },
      { sku: `1LG101BK1`, name: { pt: `Classic — Preto`, en: `Classic — Black` }, priceCents: 166500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/classic/1LG101BK1.webp`, images: [`/products/classic/1LG101BK1.webp`, `/products/classic/1LG101BK1-2.webp`, `/products/classic/1LG101BK1-3.webp`, `/products/classic/1LG101BK1-4.webp`] },
      { sku: `1LG683BK1`, name: { pt: `Classic — Preto`, en: `Classic — Black` }, priceCents: 19500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/classic/1LG683BK1.webp`, images: [`/products/classic/1LG683BK1.webp`, `/products/classic/1LG683BK1-2.webp`] },
      { sku: `1LG592BK1`, name: { pt: `Classic — Preto`, en: `Classic — Black` }, priceCents: 45500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/classic/1LG592BK1.webp`, images: [`/products/classic/1LG592BK1.webp`, `/products/classic/1LG592BK1-2.webp`] },
      { sku: `1LG212BK1`, name: { pt: `Classic — Preto`, en: `Classic — Black` }, priceCents: 65500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/classic/1LG212BK1.webp`, images: [`/products/classic/1LG212BK1.webp`, `/products/classic/1LG212BK1-2.webp`, `/products/classic/1LG212BK1-3.webp`, `/products/classic/1LG212BK1-4.webp`] },
      { sku: `1LG561BK1`, name: { pt: `Classic — Preto`, en: `Classic — Black` }, priceCents: 31500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/classic/1LG561BK1.webp`, images: [`/products/classic/1LG561BK1.webp`, `/products/classic/1LG561BK1-2.webp`] },
    ],
  },
  {
    slug: `x-bag`,
    name: { pt: `X-bag`, en: `X-bag` },
    description: { pt: `Com a X-Bag Baguette, o icónico padrão guilloché dos isqueiros e canetas S.T. Dupont é reinventado numa forma alongada e elegante. Um grande «X», como uma ode a uma vida refinada e sofisticada. Este modelo presta homenagem ao estilo característico da Maison, inspirando-se no guilloché Firehead, um dos motivos mais emblemáticos das criações de ourivesaria da S.T. Dupont. Confeccionada em couro de vitela flor inteira, esta mala é valorizada por elegantes acabamentos em paládio. A forma X-Bag Baguette da nossa icónica X-Bag cria uma silhueta distinta e moderna. Um design icónico, a X-Bag Baguette é fácil de usar e integra-se perfeitamente num guarda-roupa do dia para a noite, tornando-se um acessório multigeracional. Multifuncional e multifacetada. Esta mala distingue-se pela sua nova cor «off white», um magnífico branco-quebrado com um acabamento dourado claro. Uma cor elegante, perfeita para um visual chique e refinado. Esta mala é fabricada em Itália em couro de vitela flor inteira, com alça ajustável para um estilo versátil. O couro utilizado é certificado LWG.`, en: `With the X-Bag Baguette, the iconic guilloche pattern of S.T. lighters and pens is reinvented in an elegant new shape. Dupont lighters and pens is reinvented in an elongated, elegant form. A large ‘X’, like an ode to refined and sophisticated living. This model pays tribute to the House's signature style, inspired by the Firehead guilloché, one of the most emblematic motifs of S.T. Dupont's goldsmith's creations. Dupont's goldsmithing creations. Made from full-grain calf leather, this bag is embellished with elegant palladium finishes. The X-Bag Baguette shape of our iconic X-Bag creates a distinctive and modern silhouette. An iconic design, the X-Bag Baguette is easy to wear and fits perfectly into a day-to-night wardrobe, becoming a multi-generational accessory. Multifunctional and multi-faceted. This bag is distinguished by its new ‘off white’ colour, a magnificent off-white with a light gold finish. An elegant colour, perfect for a chic, refined look. This bag is made in Italy from full-grain calf leather with an adjustable strap for versatile style. The leather used is LWG certified.` },
    collection: `X-bag`,
    categorySlug: "pele",
    image: `/products/x-bag/1XB292BK1.webp`,
    variants: [
      { sku: `1XB292BK1`, name: { pt: `X-bag — Black`, en: `X-bag — Black` }, priceCents: 146000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/x-bag/1XB292BK1.webp`, images: [`/products/x-bag/1XB292BK1.webp`, `/products/x-bag/1XB292BK1-2.webp`, `/products/x-bag/1XB292BK1-3.webp`, `/products/x-bag/1XB292BK1-4.webp`] },
      { sku: `1XB292PL1`, name: { pt: `X-bag — Rosa Nude`, en: `X-bag — Nude Pink` }, priceCents: 146000, currency: "EUR", attributes: { color: { label: { pt: `Rosa Nude`, en: `Nude Pink` }, hex: ["#c97a8c"] } }, image: `/products/x-bag/1XB292PL1.webp`, images: [`/products/x-bag/1XB292PL1.webp`, `/products/x-bag/1XB292PL1-2.webp`, `/products/x-bag/1XB292PL1-3.webp`, `/products/x-bag/1XB292PL1-4.webp`] },
      { sku: `1XB292RN1`, name: { pt: `X-bag — Red`, en: `X-bag — Red` }, priceCents: 146000, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/x-bag/1XB292RN1.webp`, images: [`/products/x-bag/1XB292RN1.webp`, `/products/x-bag/1XB292RN1-2.webp`, `/products/x-bag/1XB292RN1-3.webp`, `/products/x-bag/1XB292RN1-4.webp`] },
      { sku: `1XB292ND1`, name: { pt: `X-bag — Verde-abeto & Verde`, en: `X-bag — Fir Green & Green` }, priceCents: 145000, currency: "EUR", attributes: { color: { label: { pt: `Verde-abeto & Verde`, en: `Fir Green & Green` }, hex: ["#3b5d39"] } }, image: `/products/x-bag/1XB292ND1.webp`, images: [`/products/x-bag/1XB292ND1.webp`, `/products/x-bag/1XB292ND1-2.webp`, `/products/x-bag/1XB292ND1-3.webp`, `/products/x-bag/1XB292ND1-4.webp`] },
      { sku: `1XB292NL1`, name: { pt: `X-bag — Verde Claro`, en: `X-bag — Light Green` }, priceCents: 145000, currency: "EUR", attributes: { color: { label: { pt: `Verde Claro`, en: `Light Green` }, hex: ["#3b5d39"] } }, image: `/products/x-bag/1XB292NL1.webp`, images: [`/products/x-bag/1XB292NL1.webp`, `/products/x-bag/1XB292NL1-2.webp`, `/products/x-bag/1XB292NL1-3.webp`, `/products/x-bag/1XB292NL1-4.webp`] },
      { sku: `1XD292UD1`, name: { pt: `X-bag — Blue`, en: `X-bag — Blue` }, priceCents: 145000, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/x-bag/1XD292UD1.webp`, images: [`/products/x-bag/1XD292UD1.webp`, `/products/x-bag/1XD292UD1-2.webp`, `/products/x-bag/1XD292UD1-3.webp`, `/products/x-bag/1XD292UD1-4.webp`] },
      { sku: `1XM292SV1`, name: { pt: `X-bag — Silver`, en: `X-bag — Silver` }, priceCents: 176500, currency: "EUR", attributes: { color: { label: { pt: `Prateado`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/x-bag/1XM292SV1.webp`, images: [`/products/x-bag/1XM292SV1.webp`, `/products/x-bag/1XM292SV1-2.webp`, `/products/x-bag/1XM292SV1-3.webp`, `/products/x-bag/1XM292SV1-4.webp`] },
      { sku: `1XB292WH2`, name: { pt: `X-bag — Branco Marfim`, en: `X-bag — Off White` }, priceCents: 146000, currency: "EUR", attributes: { color: { label: { pt: `Branco Marfim`, en: `Off White` }, hex: ["#efeae0"] } }, image: `/products/x-bag/1XB292WH2.webp`, images: [`/products/x-bag/1XB292WH2.webp`, `/products/x-bag/1XB292WH2-2.webp`, `/products/x-bag/1XB292WH2-3.webp`, `/products/x-bag/1XB292WH2-4.webp`] },
      { sku: `1XM292DO1`, name: { pt: `X-bag — Golden`, en: `X-bag — Golden` }, priceCents: 176500, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/x-bag/1XM292DO1.webp`, images: [`/products/x-bag/1XM292DO1.webp`, `/products/x-bag/1XM292DO1-2.webp`, `/products/x-bag/1XM292DO1-3.webp`, `/products/x-bag/1XM292DO1-4.webp`] },
      { sku: `1XB283BK1`, name: { pt: `X-bag — Black`, en: `X-bag — Black` }, priceCents: 176500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/x-bag/1XB283BK1.webp`, images: [`/products/x-bag/1XB283BK1.webp`, `/products/x-bag/1XB283BK1-2.webp`, `/products/x-bag/1XB283BK1-3.webp`, `/products/x-bag/1XB283BK1-4.webp`] },
      { sku: `1XB283GN1`, name: { pt: `X-bag — Grey`, en: `X-bag — Grey` }, priceCents: 175000, currency: "EUR", attributes: { color: { label: { pt: `Cinzento`, en: `Grey` }, hex: ["#7a7d83"] } }, image: `/products/x-bag/1XB283GN1.webp`, images: [`/products/x-bag/1XB283GN1.webp`, `/products/x-bag/1XB283GN1-2.webp`, `/products/x-bag/1XB283GN1-3.webp`, `/products/x-bag/1XB283GN1-4.webp`] },
      { sku: `1XB283WH2`, name: { pt: `X-bag — Branco Marfim`, en: `X-bag — Off White` }, priceCents: 176500, currency: "EUR", attributes: { color: { label: { pt: `Branco Marfim`, en: `Off White` }, hex: ["#efeae0"] } }, image: `/products/x-bag/1XB283WH2.webp`, images: [`/products/x-bag/1XB283WH2.webp`, `/products/x-bag/1XB283WH2-2.webp`] },
      { sku: `1XB282BK1`, name: { pt: `X-bag — Black`, en: `X-bag — Black` }, priceCents: 146000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/x-bag/1XB282BK1.webp`, images: [`/products/x-bag/1XB282BK1.webp`, `/products/x-bag/1XB282BK1-2.webp`, `/products/x-bag/1XB282BK1-3.webp`, `/products/x-bag/1XB282BK1-4.webp`] },
      { sku: `1XB282PL1`, name: { pt: `X-bag — Rosa Nude`, en: `X-bag — Nude Pink` }, priceCents: 146000, currency: "EUR", attributes: { color: { label: { pt: `Rosa Nude`, en: `Nude Pink` }, hex: ["#c97a8c"] } }, image: `/products/x-bag/1XB282PL1.webp`, images: [`/products/x-bag/1XB282PL1.webp`, `/products/x-bag/1XB282PL1-2.webp`, `/products/x-bag/1XB282PL1-3.webp`, `/products/x-bag/1XB282PL1-4.webp`] },
      { sku: `1XB282GN1`, name: { pt: `X-bag — Grey`, en: `X-bag — Grey` }, priceCents: 145000, currency: "EUR", attributes: { color: { label: { pt: `Cinzento`, en: `Grey` }, hex: ["#7a7d83"] } }, image: `/products/x-bag/1XB282GN1.webp`, images: [`/products/x-bag/1XB282GN1.webp`, `/products/x-bag/1XB282GN1-2.webp`, `/products/x-bag/1XB282GN1-3.webp`, `/products/x-bag/1XB282GN1-4.webp`] },
      { sku: `1XB282RN1`, name: { pt: `X-bag — Red`, en: `X-bag — Red` }, priceCents: 146000, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/x-bag/1XB282RN1.webp`, images: [`/products/x-bag/1XB282RN1.webp`, `/products/x-bag/1XB282RN1-2.webp`, `/products/x-bag/1XB282RN1-3.webp`, `/products/x-bag/1XB282RN1-4.webp`] },
      { sku: `1XB282ND1`, name: { pt: `X-bag — Verde-abeto`, en: `X-bag — Fir Green` }, priceCents: 145000, currency: "EUR", attributes: { color: { label: { pt: `Verde-abeto`, en: `Fir Green` }, hex: ["#3b5d39"] } }, image: `/products/x-bag/1XB282ND1.webp`, images: [`/products/x-bag/1XB282ND1.webp`, `/products/x-bag/1XB282ND1-2.webp`, `/products/x-bag/1XB282ND1-3.webp`, `/products/x-bag/1XB282ND1-4.webp`] },
      { sku: `1XB282BE1`, name: { pt: `X-bag — Beige`, en: `X-bag — Beige` }, priceCents: 146000, currency: "EUR", attributes: { color: { label: { pt: `Bege`, en: `Beige` }, hex: ["#7a7d83"] } }, image: `/products/x-bag/1XB282BE1.webp`, images: [`/products/x-bag/1XB282BE1.webp`, `/products/x-bag/1XB282BE1-2.webp`, `/products/x-bag/1XB282BE1-3.webp`, `/products/x-bag/1XB282BE1-4.webp`] },
      { sku: `1XB282VN1`, name: { pt: `X-bag — Azul-escuro`, en: `X-bag — Dark Blue` }, priceCents: 155000, currency: "EUR", attributes: { color: { label: { pt: `Azul-escuro`, en: `Dark Blue` }, hex: ["#1f3c66"] } }, image: `/products/x-bag/1XB282VN1.webp`, images: [`/products/x-bag/1XB282VN1.webp`, `/products/x-bag/1XB282VN1-2.webp`, `/products/x-bag/1XB282VN1-3.webp`, `/products/x-bag/1XB282VN1-4.webp`] },
      { sku: `1XC282SV1`, name: { pt: `X-bag — Silver`, en: `X-bag — Silver` }, priceCents: 175000, currency: "EUR", attributes: { color: { label: { pt: `Prateado`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/x-bag/1XC282SV1.webp`, images: [`/products/x-bag/1XC282SV1.webp`, `/products/x-bag/1XC282SV1-2.webp`, `/products/x-bag/1XC282SV1-3.webp`, `/products/x-bag/1XC282SV1-4.webp`] },
      { sku: `1XC282DO1`, name: { pt: `X-bag — Golden`, en: `X-bag — Golden` }, priceCents: 175000, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/x-bag/1XC282DO1.webp`, images: [`/products/x-bag/1XC282DO1.webp`, `/products/x-bag/1XC282DO1-2.webp`, `/products/x-bag/1XC282DO1-3.webp`, `/products/x-bag/1XC282DO1-4.webp`] },
      { sku: `1XB282NL1`, name: { pt: `X-bag — Verde Claro`, en: `X-bag — Light Green` }, priceCents: 145000, currency: "EUR", attributes: { color: { label: { pt: `Verde Claro`, en: `Light Green` }, hex: ["#3b5d39"] } }, image: `/products/x-bag/1XB282NL1.webp`, images: [`/products/x-bag/1XB282NL1.webp`, `/products/x-bag/1XB282NL1-2.webp`, `/products/x-bag/1XB282NL1-3.webp`, `/products/x-bag/1XB282NL1-4.webp`] },
      { sku: `1XD282UD1`, name: { pt: `X-bag — Blue`, en: `X-bag — Blue` }, priceCents: 145000, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/x-bag/1XD282UD1.webp`, images: [`/products/x-bag/1XD282UD1.webp`, `/products/x-bag/1XD282UD1-2.webp`, `/products/x-bag/1XD282UD1-3.webp`, `/products/x-bag/1XD282UD1-4.webp`] },
      { sku: `1XM282SV1`, name: { pt: `X-bag — Silver`, en: `X-bag — Silver` }, priceCents: 176500, currency: "EUR", attributes: { color: { label: { pt: `Prateado`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/x-bag/1XM282SV1.webp`, images: [`/products/x-bag/1XM282SV1.webp`, `/products/x-bag/1XM282SV1-2.webp`, `/products/x-bag/1XM282SV1-3.webp`, `/products/x-bag/1XM282SV1-4.webp`] },
      { sku: `1XB282WH2`, name: { pt: `X-bag — Branco Marfim`, en: `X-bag — Off White` }, priceCents: 146000, currency: "EUR", attributes: { color: { label: { pt: `Branco Marfim`, en: `Off White` }, hex: ["#efeae0"] } }, image: `/products/x-bag/1XB282WH2.webp`, images: [`/products/x-bag/1XB282WH2.webp`, `/products/x-bag/1XB282WH2-2.webp`, `/products/x-bag/1XB282WH2-3.webp`, `/products/x-bag/1XB282WH2-4.webp`] },
      { sku: `1XH282OG1`, name: { pt: `X-bag — Orange`, en: `X-bag — Orange` }, priceCents: 156500, currency: "EUR", attributes: { color: { label: { pt: `Laranja`, en: `Orange` }, hex: ["#c8a24a"] } }, image: `/products/x-bag/1XH282OG1.webp`, images: [`/products/x-bag/1XH282OG1.webp`, `/products/x-bag/1XH282OG1-2.webp`, `/products/x-bag/1XH282OG1-3.webp`, `/products/x-bag/1XH282OG1-4.webp`] },
      { sku: `1XH282UN2`, name: { pt: `X-bag — Blue`, en: `X-bag — Blue` }, priceCents: 156500, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/x-bag/1XH282UN2.webp`, images: [`/products/x-bag/1XH282UN2.webp`, `/products/x-bag/1XH282UN2-2.webp`, `/products/x-bag/1XH282UN2-3.webp`, `/products/x-bag/1XH282UN2-4.webp`] },
      { sku: `1XM282DO1`, name: { pt: `X-bag — Golden`, en: `X-bag — Golden` }, priceCents: 176500, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/x-bag/1XM282DO1.webp`, images: [`/products/x-bag/1XM282DO1.webp`, `/products/x-bag/1XM282DO1-2.webp`, `/products/x-bag/1XM282DO1-3.webp`, `/products/x-bag/1XM282DO1-4.webp`] },
    ],
  },
  {
    slug: `riviera`,
    name: { pt: `Riviera`, en: `Riviera` },
    description: { pt: `Em 1953, André Dupont, filho de Simon Tissot Dupont, criou a primeira mala feminina da marca, a Riviera, para Audrey Hepburn. A mala foi apresentada como edição limitada e contava com um compartimento secreto. À imagem da icónica original, a Riviera renovada apresenta também um bolso secreto oculto no forro da mala, fechado por uma «lighter lock» ornamentada com o icónico guilloché ponta de diamante da marca. A nova versão Riviera Stripe reinventa este clássico com tiras de couro inspiradas no padrão guilloché dos isqueiros S.T. Dupont, conferindo-lhe uma atitude contemporânea e rock-and-roll. Estas tiras criam um efeito marcante, tornando esta mala um essencial do quotidiano. Fabricada em Itália, esta mala conjuga um exterior em couro de vitela flor inteira macio e liso com um forro em couro de vaca flor inteira. O couro utilizado é certificado LWG, garantindo uma produção ecologicamente responsável. A Riviera Small Stripe encarna herança e inovação, acrescentando uma dimensão dinâmica e moderna a qualquer visual. Com «Black Smoke», a laca assume um aspecto audaz e vintage, com materiais contrastantes e tonalidades pretas. Couro de vitela flor inteira mate e enrugado é conjugado com couro preto brilhante com efeito laca.`, en: `In 1953, André Dupont, the son of Simon Tissot Dupont, created the brand's first women's handbag, the Riviera, for Audrey Hepburn. The bag was presented as a limited edition and featured a secret compartment. Like the original icon, the updated Riviera also features a secret pocket hidden in the bag's lining, secured by a “lighter lock” adorned with the brand's iconic guilloché diamond head. The new Riviera Stripe version reinvents this classic with leather stripes inspired by the guilloché pattern of S.T. Dupont lighters, giving it a contemporary, rock-and-roll attitude. These stripes create a striking effect, making this bag an everyday essential. Made in Italy, this bag combines soft, smooth full-grain calf leather on the outside with a full-grain cowhide leather lining. The leather used is LWG certified, guaranteeing environmentally friendly production. The Riviera Small Stripe embodies heritage and innovation, adding a dynamic and modern dimension to any outfit. With “Black Smoke,” lacquer takes on a bold, vintage look with contrasting materials and black hues. Matte, crinkled full-grain calfskin leather is paired with shiny black leather with a lacquer effect.` },
    collection: `Riviera`,
    categorySlug: "pele",
    image: `/products/riviera/1RS292WH2.webp`,
    variants: [
      { sku: `1RS292WH2`, name: { pt: `Riviera — Branco Marfim`, en: `Riviera — Off White` }, priceCents: 176500, currency: "EUR", attributes: { color: { label: { pt: `Branco Marfim`, en: `Off White` }, hex: ["#efeae0"] } }, image: `/products/riviera/1RS292WH2.webp`, images: [`/products/riviera/1RS292WH2.webp`, `/products/riviera/1RS292WH2-2.webp`, `/products/riviera/1RS292WH2-3.webp`, `/products/riviera/1RS292WH2-4.webp`] },
      { sku: `1RS292BK1`, name: { pt: `Riviera — Preto`, en: `Riviera — Black` }, priceCents: 176500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/riviera/1RS292BK1.webp`, images: [`/products/riviera/1RS292BK1.webp`, `/products/riviera/1RS292BK1-2.webp`, `/products/riviera/1RS292BK1-3.webp`, `/products/riviera/1RS292BK1-4.webp`] },
      { sku: `1RV292RD2`, name: { pt: `Riviera — Bordô`, en: `Riviera — Burgundy` }, priceCents: 156500, currency: "EUR", attributes: { color: { label: { pt: `Bordô`, en: `Burgundy` }, hex: ["#7d2b27"] } }, image: `/products/riviera/1RV292RD2.webp`, images: [`/products/riviera/1RV292RD2.webp`, `/products/riviera/1RV292RD2-2.webp`, `/products/riviera/1RV292RD2-3.webp`, `/products/riviera/1RV292RD2-4.webp`] },
      { sku: `1RV292UL2`, name: { pt: `Riviera — Azul Claro`, en: `Riviera — Light Blue` }, priceCents: 155000, currency: "EUR", attributes: { color: { label: { pt: `Azul Claro`, en: `Light Blue` }, hex: ["#1f3c66"] } }, image: `/products/riviera/1RV292UL2.webp`, images: [`/products/riviera/1RV292UL2.webp`, `/products/riviera/1RV292UL2-2.webp`, `/products/riviera/1RV292UL2-3.webp`, `/products/riviera/1RV292UL2-4.webp`] },
      { sku: `1RK292BK1`, name: { pt: `Riviera — Preto`, en: `Riviera — Black` }, priceCents: 165000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/riviera/1RK292BK1.webp`, images: [`/products/riviera/1RK292BK1.webp`, `/products/riviera/1RK292BK1-2.webp`, `/products/riviera/1RK292BK1-3.webp`, `/products/riviera/1RK292BK1-4.webp`] },
      { sku: `1RV262BK1`, name: { pt: `Riviera — Preto`, en: `Riviera — Black` }, priceCents: 231000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/riviera/1RV262BK1.webp`, images: [`/products/riviera/1RV262BK1.webp`, `/products/riviera/1RV262BK1-2.webp`, `/products/riviera/1RV262BK1-3.webp`, `/products/riviera/1RV262BK1-4.webp`] },
      { sku: `1RV262GN2`, name: { pt: `Riviera — Grey`, en: `Riviera — Grey` }, priceCents: 229000, currency: "EUR", attributes: { color: { label: { pt: `Cinzento`, en: `Grey` }, hex: ["#7a7d83"] } }, image: `/products/riviera/1RV262GN2.webp`, images: [`/products/riviera/1RV262GN2.webp`, `/products/riviera/1RV262GN2-2.webp`, `/products/riviera/1RV262GN2-3.webp`, `/products/riviera/1RV262GN2-4.webp`] },
      { sku: `1RV262WH1`, name: { pt: `Riviera — Branco`, en: `Riviera — White` }, priceCents: 229000, currency: "EUR", attributes: { color: { label: { pt: `Branco`, en: `White` }, hex: ["#efeae0"] } }, image: `/products/riviera/1RV262WH1.webp`, images: [`/products/riviera/1RV262WH1.webp`, `/products/riviera/1RV262WH1-2.webp`, `/products/riviera/1RV262WH1-3.webp`, `/products/riviera/1RV262WH1-4.webp`] },
      { sku: `1RV262BE1`, name: { pt: `Riviera — Bege`, en: `Riviera — Beige` }, priceCents: 231000, currency: "EUR", attributes: { color: { label: { pt: `Bege`, en: `Beige` }, hex: ["#7a7d83"] } }, image: `/products/riviera/1RV262BE1.webp`, images: [`/products/riviera/1RV262BE1.webp`, `/products/riviera/1RV262BE1-2.webp`, `/products/riviera/1RV262BE1-3.webp`, `/products/riviera/1RV262BE1-4.webp`] },
      { sku: `1RV262WH2`, name: { pt: `Riviera — Branco Marfim`, en: `Riviera — Off White` }, priceCents: 229000, currency: "EUR", attributes: { color: { label: { pt: `Branco Marfim`, en: `Off White` }, hex: ["#efeae0"] } }, image: `/products/riviera/1RV262WH2.webp`, images: [`/products/riviera/1RV262WH2.webp`, `/products/riviera/1RV262WH2-2.webp`, `/products/riviera/1RV262WH2-3.webp`, `/products/riviera/1RV262WH2-4.webp`] },
      { sku: `1RV262BL2`, name: { pt: `Riviera — Tan`, en: `Riviera — Tan` }, priceCents: 231000, currency: "EUR", attributes: { color: { label: { pt: `Tan`, en: `Tan` }, hex: ["#7a7d83"] } }, image: `/products/riviera/1RV262BL2.webp`, images: [`/products/riviera/1RV262BL2.webp`, `/products/riviera/1RV262BL2-2.webp`, `/products/riviera/1RV262BL2-3.webp`, `/products/riviera/1RV262BL2-4.webp`] },
      { sku: `1RV262RD2`, name: { pt: `Riviera — Bordô`, en: `Riviera — Burgundy` }, priceCents: 231000, currency: "EUR", attributes: { color: { label: { pt: `Bordô`, en: `Burgundy` }, hex: ["#7d2b27"] } }, image: `/products/riviera/1RV262RD2.webp`, images: [`/products/riviera/1RV262RD2.webp`, `/products/riviera/1RV262RD2-2.webp`, `/products/riviera/1RV262RD2-3.webp`, `/products/riviera/1RV262RD2-4.webp`] },
      { sku: `1RV261BE1`, name: { pt: `Riviera — Bege`, en: `Riviera — Beige` }, priceCents: 180500, currency: "EUR", attributes: { color: { label: { pt: `Bege`, en: `Beige` }, hex: ["#7a7d83"] } }, image: `/products/riviera/1RV261BE1.webp`, images: [`/products/riviera/1RV261BE1.webp`, `/products/riviera/1RV261BE1-2.webp`, `/products/riviera/1RV261BE1-3.webp`, `/products/riviera/1RV261BE1-4.webp`] },
      { sku: `1RS261SV1`, name: { pt: `Riviera — Prateado`, en: `Riviera — Silver` }, priceCents: 199000, currency: "EUR", attributes: { color: { label: { pt: `Prateado`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/riviera/1RS261SV1.webp`, images: [`/products/riviera/1RS261SV1.webp`, `/products/riviera/1RS261SV1-2.webp`, `/products/riviera/1RS261SV1-3.webp`, `/products/riviera/1RS261SV1-4.webp`] },
      { sku: `1RV261BK1`, name: { pt: `Riviera — Preto`, en: `Riviera — Black` }, priceCents: 180500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/riviera/1RV261BK1.webp`, images: [`/products/riviera/1RV261BK1.webp`, `/products/riviera/1RV261BK1-2.webp`, `/products/riviera/1RV261BK1-3.webp`, `/products/riviera/1RV261BK1-4.webp`] },
      { sku: `1RV261GN2`, name: { pt: `Riviera — Grey`, en: `Riviera — Grey` }, priceCents: 179000, currency: "EUR", attributes: { color: { label: { pt: `Cinzento`, en: `Grey` }, hex: ["#7a7d83"] } }, image: `/products/riviera/1RV261GN2.webp`, images: [`/products/riviera/1RV261GN2.webp`, `/products/riviera/1RV261GN2-2.webp`, `/products/riviera/1RV261GN2-3.webp`, `/products/riviera/1RV261GN2-4.webp`] },
      { sku: `1RV261WH1`, name: { pt: `Riviera — Branco`, en: `Riviera — White` }, priceCents: 179000, currency: "EUR", attributes: { color: { label: { pt: `Branco`, en: `White` }, hex: ["#efeae0"] } }, image: `/products/riviera/1RV261WH1.webp`, images: [`/products/riviera/1RV261WH1.webp`, `/products/riviera/1RV261WH1-2.webp`, `/products/riviera/1RV261WH1-3.webp`, `/products/riviera/1RV261WH1-4.webp`] },
      { sku: `1RV261WH2`, name: { pt: `Riviera — Branco Marfim`, en: `Riviera — Off White` }, priceCents: 180500, currency: "EUR", attributes: { color: { label: { pt: `Branco Marfim`, en: `Off White` }, hex: ["#efeae0"] } }, image: `/products/riviera/1RV261WH2.webp`, images: [`/products/riviera/1RV261WH2.webp`, `/products/riviera/1RV261WH2-2.webp`, `/products/riviera/1RV261WH2-3.webp`, `/products/riviera/1RV261WH2-4.webp`] },
      { sku: `1RV261BL2`, name: { pt: `Riviera — Tan`, en: `Riviera — Tan` }, priceCents: 180500, currency: "EUR", attributes: { color: { label: { pt: `Tan`, en: `Tan` }, hex: ["#7a7d83"] } }, image: `/products/riviera/1RV261BL2.webp`, images: [`/products/riviera/1RV261BL2.webp`, `/products/riviera/1RV261BL2-2.webp`, `/products/riviera/1RV261BL2-3.webp`, `/products/riviera/1RV261BL2-4.webp`] },
      { sku: `1RS261BK1`, name: { pt: `Riviera — Preto`, en: `Riviera — Black` }, priceCents: 200500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/riviera/1RS261BK1.webp`, images: [`/products/riviera/1RS261BK1.webp`, `/products/riviera/1RS261BK1-2.webp`, `/products/riviera/1RS261BK1-3.webp`, `/products/riviera/1RS261BK1-4.webp`] },
      { sku: `1RV261UL2`, name: { pt: `Riviera — Azul Claro`, en: `Riviera — Light Blue` }, priceCents: 179000, currency: "EUR", attributes: { color: { label: { pt: `Azul Claro`, en: `Light Blue` }, hex: ["#1f3c66"] } }, image: `/products/riviera/1RV261UL2.webp`, images: [`/products/riviera/1RV261UL2.webp`, `/products/riviera/1RV261UL2-2.webp`, `/products/riviera/1RV261UL2-3.webp`, `/products/riviera/1RV261UL2-4.webp`] },
      { sku: `1RV261RD2`, name: { pt: `Riviera — Bordô`, en: `Riviera — Burgundy` }, priceCents: 180500, currency: "EUR", attributes: { color: { label: { pt: `Bordô`, en: `Burgundy` }, hex: ["#7d2b27"] } }, image: `/products/riviera/1RV261RD2.webp`, images: [`/products/riviera/1RV261RD2.webp`, `/products/riviera/1RV261RD2-2.webp`, `/products/riviera/1RV261RD2-3.webp`, `/products/riviera/1RV261RD2-4.webp`] },
      { sku: `1RK261BK1`, name: { pt: `Riviera — Preto`, en: `Riviera — Black` }, priceCents: 189000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/riviera/1RK261BK1.webp`, images: [`/products/riviera/1RK261BK1.webp`, `/products/riviera/1RK261BK1-2.webp`, `/products/riviera/1RK261BK1-3.webp`, `/products/riviera/1RK261BK1-4.webp`] },
    ],
  },
  {
    slug: `liberte-3`,
    name: { pt: `Liberté`, en: `Liberté` },
    description: { pt: `Conjunto Liberté de caneta e lapiseira lacado e revestido a ouro branco com ouro rosa. Novo clip «Sword». Recargas associadas: 040112 Azul 040110 Preta 040362 Vermelha 040363 Verde Esta caneta de tinta permanente é fornecida com um bico médio, para um traço de escrita de aproximadamente 0,55 mm.`, en: `Liberty Pen & Pencil Set Lacquered and white gold plated with rose gold. New "Sword" clip. Associated refills: 040112 Blue 040110 Black 040362 Red 040363 Green This fountain pen comes with a medium nib, for a writing size of apporox. 0.55 mm.` },
    collection: `Liberté`,
    categorySlug: "escrita",
    image: `/products/liberte-3/465221F.webp`,
    variants: [
      { sku: `465221F`, name: { pt: `Liberté — Preto`, en: `Liberté — Black` }, priceCents: 66500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/liberte-3/465221F.webp`, images: [`/products/liberte-3/465221F.webp`, `/products/liberte-3/465221F-2.webp`, `/products/liberte-3/465221F-3.webp`, `/products/liberte-3/465221F-4.webp`] },
      { sku: `465227F`, name: { pt: `Liberté — Branco`, en: `Liberté — White` }, priceCents: 54500, currency: "EUR", attributes: { color: { label: { pt: `Branco`, en: `White` }, hex: ["#efeae0"] } }, image: `/products/liberte-3/465227F.webp`, images: [`/products/liberte-3/465227F.webp`, `/products/liberte-3/465227F-2.webp`, `/products/liberte-3/465227F-3.webp`, `/products/liberte-3/465227F-4.webp`] },
      { sku: `465220G`, name: { pt: `Liberté — Preto`, en: `Liberté — Black` }, priceCents: 46500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/liberte-3/465220G.webp`, images: [`/products/liberte-3/465220G.webp`, `/products/liberte-3/465220G-2.webp`, `/products/liberte-3/465220G-3.webp`, `/products/liberte-3/465220G-4.webp`] },
      { sku: `460220G`, name: { pt: `Liberté — Preto`, en: `Liberté — Black` }, priceCents: 67500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/liberte-3/460220G.webp`, images: [`/products/liberte-3/460220G.webp`, `/products/liberte-3/460220G-2.webp`, `/products/liberte-3/460220G-3.webp`, `/products/liberte-3/460220G-4.webp`] },
      { sku: `460221F`, name: { pt: `Liberté — Preto`, en: `Liberté — Black` }, priceCents: 87500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/liberte-3/460221F.webp`, images: [`/products/liberte-3/460221F.webp`, `/products/liberte-3/460221F-2.webp`, `/products/liberte-3/460221F-3.webp`, `/products/liberte-3/460221F-4.webp`] },
      { sku: `460227F`, name: { pt: `Liberté — Branco`, en: `Liberté — White` }, priceCents: 79500, currency: "EUR", attributes: { color: { label: { pt: `Branco`, en: `White` }, hex: ["#efeae0"] } }, image: `/products/liberte-3/460227F.webp`, images: [`/products/liberte-3/460227F.webp`, `/products/liberte-3/460227F-2.webp`, `/products/liberte-3/460227F-3.webp`, `/products/liberte-3/460227F-4.webp`] },
      { sku: `462220G`, name: { pt: `Liberté — Preto`, en: `Liberté — Black` }, priceCents: 52500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/liberte-3/462220G.webp`, images: [`/products/liberte-3/462220G.webp`, `/products/liberte-3/462220G-2.webp`, `/products/liberte-3/462220G-3.webp`, `/products/liberte-3/462220G-4.webp`] },
      { sku: `462221F`, name: { pt: `Liberté — Preto`, en: `Liberté — Black` }, priceCents: 72500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/liberte-3/462221F.webp`, images: [`/products/liberte-3/462221F.webp`, `/products/liberte-3/462221F-2.webp`, `/products/liberte-3/462221F-3.webp`, `/products/liberte-3/462221F-4.webp`] },
      { sku: `462227F`, name: { pt: `Liberté — Branco`, en: `Liberté — White` }, priceCents: 67500, currency: "EUR", attributes: { color: { label: { pt: `Branco`, en: `White` }, hex: ["#efeae0"] } }, image: `/products/liberte-3/462227F.webp`, images: [`/products/liberte-3/462227F.webp`, `/products/liberte-3/462227F-2.webp`, `/products/liberte-3/462227F-3.webp`, `/products/liberte-3/462227F-4.webp`] },
    ],
  },
  {
    slug: `liberte-presidence-de-la-republique`,
    name: { pt: `Liberté · presidence-de-la-republique`, en: `Liberté · presidence-de-la-republique` },
    description: { pt: `A S.T. Dupont x Élysée presta nova homenagem ao luxo francês com a extensão da sua colecção oficial, especialmente criada para a Presidência da República Francesa. Após a primeira peça de excepção, a caneta presidencial Eternity, a colecção acolhe a nova caneta Liberté. A esferográfica Liberté é acabada numa laca azul profundo inspirada na bandeira francesa, uma perfeita ilustração da emblemática técnica de laca da S.T. Dupont. Cada peça, gravada com o emblema «Présidence de la République», encarna o savoir-faire da S.T. Dupont e a arte de viver à francesa. Recargas associadas: 040853 Azul - 040854 Preta`, en: `S.T. Dupont x Élysée is paying further tribute to French luxury with the extension of its official collection, specially created for the French Presidency. After the first exceptional piece, the Eternity presidential pen, the collection welcomes the new Liberté pen. the Liberté biros is finished in a deep blue lacquer inspired by the French flag, a perfect illustration of S.T. Dupont's emblematic lacquering technique. Dupont's emblematic lacquering technique. Each piece, engraved with the ‘Présidence de la République’ emblem, embodies the craftsmanship of S.T. Dupont and the French art of living. Related refills: 040853 Blue - 040854 Black` },
    collection: `presidence-de-la-republique`,
    categorySlug: "escrita",
    image: `/products/liberte-presidence-de-la-republique/465055.webp`,
    variants: [
      { sku: `465055`, name: { pt: `Liberté · presidence-de-la-republique — Azul-escuro`, en: `Liberté · presidence-de-la-republique — Dark Blue` }, priceCents: 63500, currency: "EUR", attributes: { color: { label: { pt: `Azul-escuro`, en: `Dark Blue` }, hex: ["#1f3c66"] } }, image: `/products/liberte-presidence-de-la-republique/465055.webp`, images: [`/products/liberte-presidence-de-la-republique/465055.webp`, `/products/liberte-presidence-de-la-republique/465055-2.webp`, `/products/liberte-presidence-de-la-republique/465055-3.webp`, `/products/liberte-presidence-de-la-republique/465055-4.webp`] },
    ],
  },
  {
    slug: `box-10-refills-2`,
    name: { pt: `Pistões para Caneta de Tinteiro (Cx. 10)`, en: `Piston Refills for Fountain Pens (Box of 10)` },
    description: { pt: `Esta recarga de êmbolo para caneta de tinta permanente permite transformar a sua caneta de cartucho numa caneta recarregável a partir do seu tinteiro. Basta mergulhar o bico da caneta num frasco de tinta e rodar o botão para que o êmbolo aspire a tinta para o cartucho.`, en: `This piston refill for fountain pen allows you to transform your cartridge fountain pen into a refillable fountain pen with your inkwell. Simply dip the pen's nib into an ink bottle, then turn the knob so the piston sucks the ink into the cartridge.` },
    collection: `Refills & Inks`,
    categorySlug: "acessorios",
    image: `/products/box-10-refills-2/040771.webp`,
    variants: [
      { sku: `040771`, name: { pt: `Pistões para Caneta de Tinteiro (cx. 10) — Black`, en: `Piston Refills (box of 10) — Black` }, priceCents: 6100, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/box-10-refills-2/040771.webp`, images: [`/products/box-10-refills-2/040771.webp`] },
      { sku: `040770`, name: { pt: `Pistões para Caneta de Tinteiro (cx. 10) — Blue`, en: `Piston Refills (box of 10) — Blue` }, priceCents: 6100, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/box-10-refills-2/040770.webp`, images: [`/products/box-10-refills-2/040770.webp`] },
      { sku: `040854`, name: { pt: `Pistões para Caneta de Tinteiro (cx. 10) — Black`, en: `Piston Refills (box of 10) — Black` }, priceCents: 9100, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/box-10-refills-2/040854.webp`, images: [`/products/box-10-refills-2/040854.webp`] },
      { sku: `040851`, name: { pt: `Pistões para Caneta de Tinteiro (cx. 10) — Black`, en: `Piston Refills (box of 10) — Black` }, priceCents: 9100, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/box-10-refills-2/040851.webp`, images: [`/products/box-10-refills-2/040851.webp`] },
      { sku: `040850`, name: { pt: `Pistões para Caneta de Tinteiro (cx. 10) — Blue`, en: `Piston Refills (box of 10) — Blue` }, priceCents: 9100, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/box-10-refills-2/040850.webp`, images: [`/products/box-10-refills-2/040850.webp`] },
      { sku: `408812`, name: { pt: `Pistões para Caneta de Tinteiro (cx. 10) — Black`, en: `Piston Refills (box of 10) — Black` }, priceCents: 9000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/box-10-refills-2/408812.webp`, images: [`/products/box-10-refills-2/408812.webp`] },
    ],
  },
  {
    slug: `defi-millennium-camo`,
    name: { pt: `Défi Millennium · Camo`, en: `Défi Millennium · Camo` },
    description: { pt: `Este ano, a S.T. Dupont reintroduz o padrão de camuflagem nos seus produtos icónicos, com chamas em tons vibrantes de vermelho e verde, numa interpretação fresca e audaz deste design lendário. Esferográfica Défi Millennium com motivo de camuflagem verde mate. Acabamento preto mate. Made in France. Recargas associadas: 040853 Azul - 040854 Preta - 040358 Rosa - 040359 Vermelha - 040360 Verde - 040361 Turquesa`, en: `This year, S.T. This year, S.T. Dupont reintroduces the camouflage pattern on its iconic products, featuring flames in vibrant shades of red and green for a fresh, bold interpretation of the legendary design. Défi Millenium ballpoint pen with matte green camouflage motif. Matte black finish. Made in France. Related refills: 040853 Blue - 040854 Black - 040358 Pink - 040359 Red - 040360 Green - 040361 Turquoise` },
    collection: `Camo`,
    categorySlug: "escrita",
    image: `/products/defi-millennium-camo/405050.webp`,
    variants: [
      { sku: `405050`, name: { pt: `Défi Millennium · Camo — Caqui`, en: `Défi Millennium · Camo — Khaki` }, priceCents: 37000, currency: "EUR", attributes: { color: { label: { pt: `Caqui`, en: `Khaki` }, hex: ["#3b5d39"] } }, image: `/products/defi-millennium-camo/405050.webp`, images: [`/products/defi-millennium-camo/405050.webp`, `/products/defi-millennium-camo/405050-2.webp`, `/products/defi-millennium-camo/405050-3.webp`, `/products/defi-millennium-camo/405050-4.webp`] },
    ],
  },
  {
    slug: `defi-millennium-20000-leagues`,
    name: { pt: `Défi Millennium · 20,000 Leagues Under The Sea`, en: `Défi Millennium · 20,000 Leagues Under The Sea` },
    description: { pt: `Homenagem ao cativante universo de 20,000 Leagues Under The Sea, esta edição limitada expressa todo o savoir-faire da S.T. Dupont. Publicado em 1870, o romance narra a viagem de três náufragos capturados pelo Capitão Nemo, o misterioso inventor que percorre os fundos marinhos a bordo do Nautilus, um submarino muito à frente das tecnologias da sua época. Vigias, turbinas, corais, barbatanas e outros tentáculos de lulas gigantes inspiram esta edição limitada e as suas três gamas, todas relacionadas com diferentes capítulos do livro. Uma história em três actos em que mergulhar com paixão. No capítulo intitulado «Vanikoro», o Capitão Nemo e os seus três companheiros atracam na ilha de Vanikoro, rodeados por uma incrível barreira de coral. Esferográfica Défi Millennium em laca azul brilhante decorada com bolhas e corais. Acabamentos em crómio. Clip articulado lacado. Disponível nas versões esferográfica e rollerball. Made in France. Recargas associadas: 040853 Azul - 040854 Preta - 040358 Rosa - 040359 Vermelha - 040360 Verde - 040361 Turquesa.`, en: `Tribute to the captivating universe of 20,000 leagues under the seas, this limited edition expresses all the know-how of S.T. Dupont. Published in 1870, the novel recounts the journey of three castaways captured by Captain Nemo, this mysterious inventor who travels the seabed aboard the Nautilus, submarine very ahead of the technologies of the time. Portholes, turbines, corals, fins and other tentacles of giant squid inspire this limited edition and its three ranges, all related to different chapters of the book. A story in three stages in which to dive with passion. In the chapter titled "Vanikoro", Captain Nemo and his three companions dock on the island of Vanikoro, surrounded by an incredible barrier reef. Challenge Millennium ballpoint pen in blue glossy lacquer decorated with bubbles and coral. Chrome finishes. Articulated lacquered staple. Available in ball and roller versions. Made in France. Related refills: 040853 Blue - 040854 Black - 040358 Pink - 040359 Red - 040360 Green - 040361 Turquoise` },
    collection: `20,000 Leagues Under The Sea`,
    categorySlug: "escrita",
    image: `/products/defi-millennium-20000-leagues/405053.webp`,
    variants: [
      { sku: `405053`, name: { pt: `Défi Millennium · 20,000 Leagues Under The Sea — Azul Real`, en: `Défi Millennium · 20,000 Leagues Under The Sea — Royal Blue` }, priceCents: 38500, currency: "EUR", attributes: { color: { label: { pt: `Azul Real`, en: `Royal Blue` }, hex: ["#1f3c66"] } }, image: `/products/defi-millennium-20000-leagues/405053.webp`, images: [`/products/defi-millennium-20000-leagues/405053.webp`, `/products/defi-millennium-20000-leagues/405053-2.webp`, `/products/defi-millennium-20000-leagues/405053-3.webp`, `/products/defi-millennium-20000-leagues/405053-4.webp`] },
      { sku: `402053`, name: { pt: `Défi Millennium · 20,000 Leagues Under The Sea — Azul Real`, en: `Défi Millennium · 20,000 Leagues Under The Sea — Royal Blue` }, priceCents: 43500, currency: "EUR", attributes: { color: { label: { pt: `Azul Real`, en: `Royal Blue` }, hex: ["#1f3c66"] } }, image: `/products/defi-millennium-20000-leagues/402053.webp`, images: [`/products/defi-millennium-20000-leagues/402053.webp`, `/products/defi-millennium-20000-leagues/402053-2.webp`, `/products/defi-millennium-20000-leagues/402053-3.webp`, `/products/defi-millennium-20000-leagues/402053-4.webp`] },
    ],
  },
  {
    slug: `d-initial-orlinski`,
    name: { pt: `Initial · Orlinski`, en: `Initial · Orlinski` },
    description: { pt: `A S.T. Dupont une-se ao artista francês Richard Orlinski numa colecção exclusiva onde a força do gesto escultórico se encontra com a precisão do savoir-faire artesanal. Inspirada no icónico motivo «Kong» e na selvajaria da natureza, esta colaboração traz uma energia bruta e contemporânea às criações da Maison. Isqueiros e instrumentos de escrita tornam-se verdadeiras obras de arte, valorizados por linhas angulares, texturas contrastantes e cores vibrantes. Esferográfica Initial em laca laranja decorada com o motivo Orlinski «Kong». Acabamentos em crómio. Recargas associadas: 040853 Azul – 040854 Preta – 040358 Rosa – 040359 Vermelha – 040360 Verde – 040361 Turquesa`, en: `S.T. Dupont partners with French artist Richard Orlinski for an exclusive collection where the power of sculptural gestures meets the precision of artisanal craftsmanship. Inspired by the iconic “Kong” motif and the wildness of nature, this collaboration brings a raw, contemporary energy to the Maison’s creations. Lighters and writing instruments become true works of art, enhanced by angular lines, contrasting textures, and vibrant colors. Initial ballpoint pen in orange lacquer decorated with the Orlinski “Kong” motif. Chrome finishes. Associated refills: 040853 Blue – 040854 Black – 040358 Pink – 040359 Red – 040360 Green – 040361 Turquoise` },
    collection: `Orlinski`,
    categorySlug: "escrita",
    image: `/products/d-initial-orlinski/275063.webp`,
    variants: [
      { sku: `275063`, name: { pt: `Initial · Orlinski — Laranja`, en: `Initial · Orlinski — Orange` }, priceCents: 32500, currency: "EUR", attributes: { color: { label: { pt: `Laranja`, en: `Orange` }, hex: ["#c8a24a"] } }, image: `/products/d-initial-orlinski/275063.webp`, images: [`/products/d-initial-orlinski/275063.webp`, `/products/d-initial-orlinski/275063-2.webp`, `/products/d-initial-orlinski/275063-3.webp`, `/products/d-initial-orlinski/275063-4.webp`] },
      { sku: `275064`, name: { pt: `Initial · Orlinski — Azul`, en: `Initial · Orlinski — Blue` }, priceCents: 32500, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/d-initial-orlinski/275064.webp`, images: [`/products/d-initial-orlinski/275064.webp`, `/products/d-initial-orlinski/275064-2.webp`, `/products/d-initial-orlinski/275064-3.webp`, `/products/d-initial-orlinski/275064-4.webp`] },
    ],
  },
  {
    slug: `classique-popote`,
    name: { pt: `Classique · Popote`, en: `Classique · Popote` },
    description: { pt: `Uma técnica emblemática da Maison S.T. Dupont, a técnica dita Popoté joga com a matéria e a luz. Recorrendo a um estampilhão especial, o artífice aplica toques irregulares sobre a laca, criando um efeito pictórico em que a superfície parece vibrar sob a luz. Cada gesto, simultaneamente preciso e aleatório, revela uma profundidade única. Esferográfica Classique em laca Urushi azul com decoração Popoté e acabamentos dourados. Clip articulado em laca azul. Vendida com recarga esferográfica; pode ser convertida em lapiseira com o mecanismo referência 408811. Recargas esferográficas: 040770 Azul - 040771 Preta. Recargas para lapiseira: 408811 - mecanismo de lapiseira. 040205 - 10 embalagens de 12 minas (0,7 mm). 040206 - 10 caixas de 5 borrachas.`, en: `An emblematic technique of the S.T. Dupont house, the so-called Popoté technique plays with material and light. Using a special stamp, the craftsman applies irregular touches to the lacquer, creating a painterly effect where the surface seems to vibrate under the light. Each gesture, both precise and random, reveals a unique depth. Classique ballpoint pen in blue Urushi lacquer with Popoté décor and gold finishes. Articulated blue lacquer clip. Sold with a ballpoint refill, can be converted into a mechanical pencil with mechanism reference 408811. Ballpoint refills: 040770 Blue - 040771 Black Mechanical pencil refills: 408811 - mechanical pencil mechanism. 040205 - 10 packs of 12 leads (0.7mm). 040206 - 10 boxes of 5 erasers.` },
    collection: `Popote`,
    categorySlug: "escrita",
    image: `/products/classique-popote/045318N.webp`,
    variants: [
      { sku: `045318N`, name: { pt: `Classique · Popote — Vermelho`, en: `Classique · Popote — Red` }, priceCents: 75500, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/classique-popote/045318N.webp`, images: [`/products/classique-popote/045318N.webp`, `/products/classique-popote/045318N-2.webp`, `/products/classique-popote/045318N-3.webp`, `/products/classique-popote/045318N-4.webp`] },
      { sku: `045317N`, name: { pt: `Classique · Popote — Vermelho`, en: `Classique · Popote — Red` }, priceCents: 75500, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/classique-popote/045317N.webp`, images: [`/products/classique-popote/045317N.webp`, `/products/classique-popote/045317N-2.webp`, `/products/classique-popote/045317N-3.webp`, `/products/classique-popote/045317N-4.webp`] },
    ],
  },
  {
    slug: `d-initial-geode`,
    name: { pt: `Initial · Géode`, en: `Initial · Géode` },
    description: { pt: `Misteriosos e cativantes, os geodos inspiram uma colecção S.T. Dupont que se expressa em dois tons minerais: um azul profundo que evoca a ágata, símbolo de equilíbrio, e um verde vibrante que lembra a malaquite, representando protecção e energia. Tal como estas pedras preciosas, cada criação Géode reflecte o savoir-faire artesanal e a excelência de precisão da S.T. Dupont. A esferográfica Initial é ornamentada com um motivo inspirado na estética da malaquite. Acabamento dourado. Recargas associadas: 040853 Azul - 040854 Preta - 040358 Rosa - 040359 Vermelha - 040360 Verde - 040361 Turquesa`, en: `Mysterious and captivating, geodes inspire an S.T. Dupont collection expressed through two mineral tones: a deep blue evoking agate, a symbol of balance, and a vibrant green reminiscent of malachite, representing protection and energy. Like these precious stones, each Géode creation reflects the artisanal craftsmanship and precision excellence of S.T. Dupont. The Initial ballpoint pen is adorned with a motif inspired by the aesthetic of malachite. Gold finish. Associated refills: 040853 Blue - 040854 Black - 040358 Pink - 040359 Red - 040360 Green - 040361 Turquoise` },
    collection: `Géode`,
    categorySlug: "escrita",
    image: `/products/d-initial-geode/275035.webp`,
    variants: [
      { sku: `275035`, name: { pt: `Initial · Géode — Azul`, en: `Initial · Géode — Blue` }, priceCents: 23000, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/d-initial-geode/275035.webp`, images: [`/products/d-initial-geode/275035.webp`, `/products/d-initial-geode/275035-2.webp`, `/products/d-initial-geode/275035-3.webp`, `/products/d-initial-geode/275035-4.webp`] },
      { sku: `275036`, name: { pt: `Initial · Géode — Verde`, en: `Initial · Géode — Green` }, priceCents: 23000, currency: "EUR", attributes: { color: { label: { pt: `Verde`, en: `Green` }, hex: ["#3b5d39"] } }, image: `/products/d-initial-geode/275036.webp`, images: [`/products/d-initial-geode/275036.webp`, `/products/d-initial-geode/275036-2.webp`, `/products/d-initial-geode/275036-3.webp`, `/products/d-initial-geode/275036-4.webp`] },
      { sku: `272035`, name: { pt: `Initial · Géode — Azul`, en: `Initial · Géode — Blue` }, priceCents: 29000, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/d-initial-geode/272035.webp`, images: [`/products/d-initial-geode/272035.webp`, `/products/d-initial-geode/272035-2.webp`, `/products/d-initial-geode/272035-3.webp`, `/products/d-initial-geode/272035-4.webp`] },
      { sku: `272036`, name: { pt: `Initial · Géode — Verde`, en: `Initial · Géode — Green` }, priceCents: 29000, currency: "EUR", attributes: { color: { label: { pt: `Verde`, en: `Green` }, hex: ["#3b5d39"] } }, image: `/products/d-initial-geode/272036.webp`, images: [`/products/d-initial-geode/272036.webp`, `/products/d-initial-geode/272036-2.webp`, `/products/d-initial-geode/272036-3.webp`, `/products/d-initial-geode/272036-4.webp`] },
    ],
  },
  {
    slug: `eternity-snake-skin-2`,
    name: { pt: `Eternity · Snake Skin`, en: `Eternity · Snake Skin` },
    description: { pt: `A linha Snake Skin insere o seu original guilloché de pele de serpente sob uma audaz laca verde ou o mais clássico preto. Uma forma de honrar o método tradicional e exclusivo do guilloché sob laca, bem como a alma deste reptil ao qual é dedicado o ano lunar de 2025. Caneta de tinta permanente Line D Eternity Large em laca verde com guilloché de escamas de serpente. Tampa com guilloché de escamas de serpente e acabamento em paládio. Clip Sword articulado. Bico em ouro maciço de 14 quilates. Êmbolo incluído. Disponível nas versões esferográfica, rollerball e tinta permanente. Recargas associadas: * Cartuchos de tinta: 040112 Azul - 040110 Preta - 040362 Vermelha - 040363 Verde - 040364 Turquesa. * Tinteiros: 040165 Preto Intenso - 040166 Azul Real - 040167 Vermelho Flamejante - 040168 Verde Primavera - 040169 Turquesa - 040170 Azul Meia-Noite. Esta caneta de tinta permanente é fornecida com um bico médio, para um traço de escrita de aproximadamente 0,55 mm.`, en: `The Snake Skin line slips its original snakeskin guilloche under a bold green lacquer or the more classic black. A way of honoring the traditional and exclusive method of guilloche under lacquer, as well as the soul of this reptile to which the lunar year 2025 is dedicated. Line D Eternity large fountain pen in green snake-scale guilloche lacquer. Cap with snake-scale guilloche and palladium finish. Articulated Sword clasp. Solid 14-carat gold nib. Piston included. Available in ball, roller and nib versions. Associated refills : * Ink cartridges: 040112 Blue - 040110 Black - 040362 Red - 040363 Green - 040364 Turquoise * Ink fountains: 040165 Intense Black - 040166 Royal Blue -040167 Blazing Red - 040168 Spring Green - 040169 Turquoise - 040170 Midnight Blue This fountain pen comes with a medium nib, for a writing size of apporox. 0.55 mm.` },
    collection: `Snake Skin`,
    categorySlug: "escrita",
    image: `/products/eternity-snake-skin-2/425078L.webp`,
    variants: [
      { sku: `425078L`, name: { pt: `Eternity · Snake Skin — Verde`, en: `Eternity · Snake Skin — Green` }, priceCents: 77000, currency: "EUR", attributes: { color: { label: { pt: `Verde`, en: `Green` }, hex: ["#3b5d39"] } }, image: `/products/eternity-snake-skin-2/425078L.webp`, images: [`/products/eternity-snake-skin-2/425078L.webp`, `/products/eternity-snake-skin-2/425078L-2.webp`, `/products/eternity-snake-skin-2/425078L-3.webp`, `/products/eternity-snake-skin-2/425078L-4.webp`] },
      { sku: `425079L`, name: { pt: `Eternity · Snake Skin — Preto`, en: `Eternity · Snake Skin — Black` }, priceCents: 77000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/eternity-snake-skin-2/425079L.webp`, images: [`/products/eternity-snake-skin-2/425079L.webp`, `/products/eternity-snake-skin-2/425079L-2.webp`, `/products/eternity-snake-skin-2/425079L-3.webp`, `/products/eternity-snake-skin-2/425079L-4.webp`] },
      { sku: `420078L`, name: { pt: `Eternity · Snake Skin — Verde`, en: `Eternity · Snake Skin — Green` }, priceCents: 103000, currency: "EUR", attributes: { color: { label: { pt: `Verde`, en: `Green` }, hex: ["#3b5d39"] } }, image: `/products/eternity-snake-skin-2/420078L.webp`, images: [`/products/eternity-snake-skin-2/420078L.webp`, `/products/eternity-snake-skin-2/420078L-2.webp`, `/products/eternity-snake-skin-2/420078L-3.webp`, `/products/eternity-snake-skin-2/420078L-4.webp`] },
      { sku: `422078L`, name: { pt: `Eternity · Snake Skin — Verde`, en: `Eternity · Snake Skin — Green` }, priceCents: 83000, currency: "EUR", attributes: { color: { label: { pt: `Verde`, en: `Green` }, hex: ["#3b5d39"] } }, image: `/products/eternity-snake-skin-2/422078L.webp`, images: [`/products/eternity-snake-skin-2/422078L.webp`, `/products/eternity-snake-skin-2/422078L-2.webp`, `/products/eternity-snake-skin-2/422078L-3.webp`, `/products/eternity-snake-skin-2/422078L-4.webp`] },
    ],
  },
  {
    slug: `pen-refill`,
    name: { pt: `Recargas para Caneta`, en: `Pen Refills` },
    description: { pt: `Recarga de rollerball preta de ponta média — Vendida individualmente. Compatível com: Olympio, Défi, Liberté, Neo-Classique Large, Classique 2, D.Link/Caprice, Fidelio, Ellipsis, Montparnasse, Gatsby, Line D, Mon Dupont by Karl Lagerfeld, Streamline R, New Line D, D-Initial.`, en: `Medium Black Rollerball Refill – Sold individually. Compatible with: Olympio, Défi, Liberté, Neo-Classique Large, Classique 2, D.Link/Caprice, Fidelio, Ellipsis, Montparnasse, Gatsby, Line D, Mon Dupont by Karl Lagerfeld, Streamline R, New Line D, D-Initial.` },
    collection: `Pen Refills`,
    categorySlug: "acessorios",
    image: `/products/pen-refill/940854.webp`,
    variants: [
      { sku: `940854`, name: { pt: `Recargas para Caneta — Preto`, en: `Pen Refills — Black` }, priceCents: 900, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/pen-refill/940854.webp`, images: [`/products/pen-refill/940854.webp`] },
      { sku: `940851`, name: { pt: `Recargas para Caneta — Preto`, en: `Pen Refills — Black` }, priceCents: 900, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/pen-refill/940851.webp`, images: [`/products/pen-refill/940851.webp`] },
      { sku: `940850`, name: { pt: `Recargas para Caneta — Azul`, en: `Pen Refills — Blue` }, priceCents: 900, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/pen-refill/940850.webp`, images: [`/products/pen-refill/940850.webp`] },
      { sku: `940853`, name: { pt: `Recargas para Caneta — Azul`, en: `Pen Refills — Blue` }, priceCents: 900, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/pen-refill/940853.webp`, images: [`/products/pen-refill/940853.webp`] },
      { sku: `940831`, name: { pt: `Recargas para Caneta — Preto`, en: `Pen Refills — Black` }, priceCents: 800, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/pen-refill/940831.webp`, images: [`/products/pen-refill/940831.webp`] },
      { sku: `940830`, name: { pt: `Recargas para Caneta — Azul`, en: `Pen Refills — Blue` }, priceCents: 800, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/pen-refill/940830.webp`, images: [`/products/pen-refill/940830.webp`] },
      { sku: `940841`, name: { pt: `Recargas para Caneta — Preto`, en: `Pen Refills — Black` }, priceCents: 800, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/pen-refill/940841.webp`, images: [`/products/pen-refill/940841.webp`] },
      { sku: `940840`, name: { pt: `Recargas para Caneta — Azul`, en: `Pen Refills — Blue` }, priceCents: 800, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/pen-refill/940840.webp`, images: [`/products/pen-refill/940840.webp`] },
    ],
  },
  {
    slug: `line-d-2`,
    name: { pt: `Line D Eternity`, en: `Line D Eternity` },
    description: { pt: `Há quase 50 anos que a S.T. Dupont propõe uma vasta gama de cintos que conjugam o savoir-faire da Maison para vestir o homem com elegância. Estes cintos estão disponíveis numa ampla escolha de couros, em versões reversíveis ou não reversíveis, com tiras de 30 ou 35 mm de largura e com diferentes fivelas: fivelas de espigão, fivelas auto-blocantes ou fivelas de caixa.`, en: `For almost 50 years, S.T. Dupont has offered a wide range of belts combining the House's different expertise to dress men with elegance. These belts are available in a wide choice of leathers, in reversible or non-reversible versions, with 30 or 35 mm wide straps and with different buckles: pin buckles, self-locking buckles or box buckles.` },
    collection: `Line D Eternity`,
    categorySlug: "escrita",
    image: `/products/line-d-2/8300000.webp`,
    variants: [
      { sku: `8300000`, name: { pt: `Line D Eternity — Preto`, en: `Line D Eternity — Black` }, priceCents: 19000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-2/8300000.webp`, images: [`/products/line-d-2/8300000.webp`, `/products/line-d-2/8300000-2.webp`] },
      { sku: `8300001`, name: { pt: `Line D Eternity — Preto`, en: `Line D Eternity — Black` }, priceCents: 19000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-2/8300001.webp`, images: [`/products/line-d-2/8300001.webp`, `/products/line-d-2/8300001-2.webp`] },
      { sku: `8300002`, name: { pt: `Line D Eternity — Preto`, en: `Line D Eternity — Black` }, priceCents: 19000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-2/8300002.webp`, images: [`/products/line-d-2/8300002.webp`, `/products/line-d-2/8300002-2.webp`] },
      { sku: `8350000`, name: { pt: `Line D Eternity — Preto`, en: `Line D Eternity — Black` }, priceCents: 22500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-2/8350000.webp`, images: [`/products/line-d-2/8350000.webp`, `/products/line-d-2/8350000-2.webp`] },
      { sku: `8350001`, name: { pt: `Line D Eternity — Preto`, en: `Line D Eternity — Black` }, priceCents: 22500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-2/8350001.webp`, images: [`/products/line-d-2/8350001.webp`, `/products/line-d-2/8350001-2.webp`] },
      { sku: `8350002`, name: { pt: `Line D Eternity — Preto`, en: `Line D Eternity — Black` }, priceCents: 22500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-2/8350002.webp`, images: [`/products/line-d-2/8350002.webp`, `/products/line-d-2/8350002-2.webp`] },
      { sku: `8350100`, name: { pt: `Line D Eternity — Preto`, en: `Line D Eternity — Black` }, priceCents: 22500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-2/8350100.webp`, images: [`/products/line-d-2/8350100.webp`, `/products/line-d-2/8350100-2.webp`] },
      { sku: `8350200`, name: { pt: `Line D Eternity — Azul-escuro`, en: `Line D Eternity — Dark Blue` }, priceCents: 22500, currency: "EUR", attributes: { color: { label: { pt: `Azul-escuro`, en: `Dark Blue` }, hex: ["#1f3c66"] } }, image: `/products/line-d-2/8350200.webp`, images: [`/products/line-d-2/8350200.webp`, `/products/line-d-2/8350200-2.webp`] },
      { sku: `007107`, name: { pt: `Line D Eternity — Preto`, en: `Line D Eternity — Black` }, priceCents: 49500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-2/007107.webp`, images: [`/products/line-d-2/007107.webp`, `/products/line-d-2/007107-2.webp`, `/products/line-d-2/007107-3.webp`] },
      { sku: `007104`, name: { pt: `Line D Eternity — Preto`, en: `Line D Eternity — Black` }, priceCents: 24000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-2/007104.webp`, images: [`/products/line-d-2/007104.webp`, `/products/line-d-2/007104-2.webp`, `/products/line-d-2/007104-3.webp`, `/products/line-d-2/007104-4.webp`] },
      { sku: `180016`, name: { pt: `Line D Eternity — Preto`, en: `Line D Eternity — Black` }, priceCents: 14000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-2/180016.webp`, images: [`/products/line-d-2/180016.webp`, `/products/line-d-2/180016-2.webp`] },
      { sku: `007110`, name: { pt: `Line D Eternity — Preto`, en: `Line D Eternity — Black` }, priceCents: 22000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-2/007110.webp`, images: [`/products/line-d-2/007110.webp`, `/products/line-d-2/007110-2.webp`, `/products/line-d-2/007110-3.webp`, `/products/line-d-2/007110-4.webp`] },
      { sku: `8200120`, name: { pt: `Line D Eternity — Preto & Castanho`, en: `Line D Eternity — Black & Brown` }, priceCents: 22000, currency: "EUR", attributes: { color: { label: { pt: `Preto & Castanho`, en: `Black & Brown` }, hex: ["#15171c"] } }, image: `/products/line-d-2/8200120.webp`, images: [`/products/line-d-2/8200120.webp`, `/products/line-d-2/8200120-2.webp`, `/products/line-d-2/8200120-3.webp`, `/products/line-d-2/8200120-4.webp`] },
      { sku: `8210160`, name: { pt: `Line D Eternity — Preto`, en: `Line D Eternity — Black` }, priceCents: 24000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-2/8210160.webp`, images: [`/products/line-d-2/8210160.webp`] },
      { sku: `8300011`, name: { pt: `Line D Eternity — Preto`, en: `Line D Eternity — Black` }, priceCents: 22500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-2/8300011.webp`, images: [`/products/line-d-2/8300011.webp`, `/products/line-d-2/8300011-2.webp`] },
      { sku: `8300012`, name: { pt: `Line D Eternity — Preto`, en: `Line D Eternity — Black` }, priceCents: 22500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-2/8300012.webp`, images: [`/products/line-d-2/8300012.webp`, `/products/line-d-2/8300012-2.webp`] },
      { sku: `8300013`, name: { pt: `Line D Eternity — Preto`, en: `Line D Eternity — Black` }, priceCents: 22500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-2/8300013.webp`, images: [`/products/line-d-2/8300013.webp`, `/products/line-d-2/8300013-2.webp`] },
      { sku: `8350011`, name: { pt: `Line D Eternity — Preto`, en: `Line D Eternity — Black` }, priceCents: 25000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-2/8350011.webp`, images: [`/products/line-d-2/8350011.webp`, `/products/line-d-2/8350011-2.webp`] },
      { sku: `8350012`, name: { pt: `Line D Eternity — Preto`, en: `Line D Eternity — Black` }, priceCents: 25000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-2/8350012.webp`, images: [`/products/line-d-2/8350012.webp`, `/products/line-d-2/8350012-2.webp`, `/products/line-d-2/8350012-3.webp`] },
      { sku: `8350013`, name: { pt: `Line D Eternity — Preto`, en: `Line D Eternity — Black` }, priceCents: 25000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-2/8350013.webp`, images: [`/products/line-d-2/8350013.webp`, `/products/line-d-2/8350013-2.webp`] },
    ],
  },
  {
    slug: `apex-2`,
    name: { pt: `Apex`, en: `Apex` },
    description: { pt: `Há quase 50 anos que a S.T. Dupont propõe uma vasta gama de cintos que conjugam o savoir-faire da Maison para vestir o homem com elegância. Estes cintos estão disponíveis numa ampla escolha de couros, em versões reversíveis ou não reversíveis, com tiras de 30 ou 35 mm de largura e com diferentes fivelas: fivelas de espigão ou fivelas de caixa.`, en: `For almost 50 years, S.T. Dupont has offered a wide range of belts combining the House's different expertise to dress men with elegance. These belts are available in a wide choice of leathers, in reversible or non-reversible versions, with 30 or 35 mm wide straps and with different buckles: pin buckles or case buckles.` },
    collection: `Apex`,
    categorySlug: "pele",
    image: `/products/apex-2/9301000.webp`,
    variants: [
      { sku: `9301000`, name: { pt: `Apex — Black`, en: `Apex — Black` }, priceCents: 31500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/apex-2/9301000.webp`, images: [`/products/apex-2/9301000.webp`, `/products/apex-2/9301000-2.webp`] },
    ],
  },
  {
    slug: `atelier-3`,
    name: { pt: `Atelier`, en: `Atelier` },
    description: { pt: `Esta carteira vertical compacta, em couro de vitela flor inteira gravado em relevo com o motivo crocrow patinado à mão, oferece tonalidades únicas de preto. Possui vários compartimentos para cartões e desliza facilmente para a maioria dos bolsos. - 4 compartimentos para cartões, - 1 compartimento plano para notas, - 2 compartimentos secundários`, en: `This compact vertical portfolio, in full -flower calf leather embossed with the crocrow patinated patinum in hand offers unique shades of black. It has many locations for cards and easily slips in most pockets. - 4 locations for cards, - 1 flat compartment for tickets, - 2 compartments received` },
    collection: `Atelier`,
    categorySlug: "pele",
    image: `/products/atelier-3/141055.webp`,
    variants: [
      { sku: `141055`, name: { pt: `Atelier — Preto`, en: `Atelier — Black` }, priceCents: 146000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/atelier-3/141055.webp`, images: [`/products/atelier-3/141055.webp`, `/products/atelier-3/141055-2.webp`, `/products/atelier-3/141055-3.webp`, `/products/atelier-3/141055-4.webp`] },
      { sku: `141355`, name: { pt: `Atelier — Blue`, en: `Atelier — Blue` }, priceCents: 146000, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/atelier-3/141355.webp`, images: [`/products/atelier-3/141355.webp`, `/products/atelier-3/141355-2.webp`, `/products/atelier-3/141355-3.webp`, `/products/atelier-3/141355-4.webp`] },
      { sku: `190578`, name: { pt: `Atelier — Preto`, en: `Atelier — Black` }, priceCents: 45500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/atelier-3/190578.webp`, images: [`/products/atelier-3/190578.webp`, `/products/atelier-3/190578-2.webp`, `/products/atelier-3/190578-3.webp`] },
      { sku: `141054`, name: { pt: `Atelier — Preto`, en: `Atelier — Black` }, priceCents: 106000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/atelier-3/141054.webp`, images: [`/products/atelier-3/141054.webp`, `/products/atelier-3/141054-2.webp`, `/products/atelier-3/141054-3.webp`, `/products/atelier-3/141054-4.webp`] },
      { sku: `141354`, name: { pt: `Atelier — Blue`, en: `Atelier — Blue` }, priceCents: 106000, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/atelier-3/141354.webp`, images: [`/products/atelier-3/141354.webp`, `/products/atelier-3/141354-2.webp`, `/products/atelier-3/141354-3.webp`, `/products/atelier-3/141354-4.webp`] },
      { sku: `190574`, name: { pt: `Atelier — Preto`, en: `Atelier — Black` }, priceCents: 111000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/atelier-3/190574.webp`, images: [`/products/atelier-3/190574.webp`, `/products/atelier-3/190574-2.webp`, `/products/atelier-3/190574-3.webp`, `/products/atelier-3/190574-4.webp`] },
      { sku: `141053`, name: { pt: `Atelier — Preto`, en: `Atelier — Black` }, priceCents: 131000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/atelier-3/141053.webp`, images: [`/products/atelier-3/141053.webp`, `/products/atelier-3/141053-2.webp`, `/products/atelier-3/141053-3.webp`, `/products/atelier-3/141053-4.webp`] },
      { sku: `141353`, name: { pt: `Atelier — Blue`, en: `Atelier — Blue` }, priceCents: 126000, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/atelier-3/141353.webp`, images: [`/products/atelier-3/141353.webp`, `/products/atelier-3/141353-2.webp`, `/products/atelier-3/141353-3.webp`, `/products/atelier-3/141353-4.webp`] },
      { sku: `141453`, name: { pt: `Atelier — Castanho`, en: `Atelier — Brown` }, priceCents: 131000, currency: "EUR", attributes: { color: { label: { pt: `Castanho`, en: `Brown` }, hex: ["#6b4a2a"] } }, image: `/products/atelier-3/141453.webp`, images: [`/products/atelier-3/141453.webp`, `/products/atelier-3/141453-2.webp`, `/products/atelier-3/141453-3.webp`, `/products/atelier-3/141453-4.webp`] },
      { sku: `191474`, name: { pt: `Atelier — Castanho`, en: `Atelier — Brown` }, priceCents: 232000, currency: "EUR", attributes: { color: { label: { pt: `Castanho`, en: `Brown` }, hex: ["#6b4a2a"] } }, image: `/products/atelier-3/191474.webp`, images: [`/products/atelier-3/191474.webp`, `/products/atelier-3/191474-2.webp`, `/products/atelier-3/191474-3.webp`, `/products/atelier-3/191474-4.webp`] },
      { sku: `191376`, name: { pt: `Atelier — Blue`, en: `Atelier — Blue` }, priceCents: 252000, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/atelier-3/191376.webp`, images: [`/products/atelier-3/191376.webp`, `/products/atelier-3/191376-2.webp`, `/products/atelier-3/191376-3.webp`, `/products/atelier-3/191376-4.webp`] },
      { sku: `191476`, name: { pt: `Atelier — Castanho`, en: `Atelier — Brown` }, priceCents: 252000, currency: "EUR", attributes: { color: { label: { pt: `Castanho`, en: `Brown` }, hex: ["#6b4a2a"] } }, image: `/products/atelier-3/191476.webp`, images: [`/products/atelier-3/191476.webp`, `/products/atelier-3/191476-2.webp`, `/products/atelier-3/191476-3.webp`, `/products/atelier-3/191476-4.webp`] },
      { sku: `191576`, name: { pt: `Atelier — Preto`, en: `Atelier — Black` }, priceCents: 252000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/atelier-3/191576.webp`, images: [`/products/atelier-3/191576.webp`, `/products/atelier-3/191576-2.webp`, `/products/atelier-3/191576-3.webp`, `/products/atelier-3/191576-4.webp`] },
    ],
  },
  {
    slug: `monogram-1872-2`,
    name: { pt: `Monogram 1872`, en: `Monogram 1872` },
    description: { pt: `1872 é uma colecção de malas práticas e elegantes, à imagem dos baús dos primeiros tempos da Maison. 1872 é também o ano em que a Maison foi fundada, o início de uma busca incessante pela excelência e por objectos de excepção. Orgulhosa do seu savoir-faire, a S.T. Dupont utiliza um guilloché dos anos 50 para decorar esta linha com um design all-over que conjuga herança e modernidade. Inspirada no guilloché dos anos 50, esta mala unissexo conjuga elegância e funcionalidade. A mala é fabricada em Itália, conjugando lona revestida impermeável e couro de vitela flor inteira, com interior em algodão cinzento com dois bolsos planos. O couro utilizado é certificado LWG.`, en: `1872 is a collection of practical, elegant bags, just like the trunks of the Maison's early days. 1872 is also the year the Maison was founded, the beginning of a never-ending quest for excellence and exceptional objects. Proud of its expertise, S.T. Dupont uses a guilloche from the 1950s to decorate this line with an all-over design that blends heritage and modernity.Inspired by 1950s guilloché, this unisex bag combines elegance and functionality. The bag is made in Italy, combining waterproof coated canvas and full-grained calf leather, with a grey cotton interior with two flat pockets. Leather used is LWG certified.` },
    collection: `Monogram 1872`,
    categorySlug: "pele",
    image: `/products/monogram-1872-2/1MG183BK2.webp`,
    variants: [
      { sku: `1MG183BK2`, name: { pt: `Monogram 1872 — Cinzento Escuro & Cinzento`, en: `Monogram 1872 — Dark Gray & Grey` }, priceCents: 99000, currency: "EUR", attributes: { color: { label: { pt: `Cinzento Escuro & Cinzento`, en: `Dark Gray & Grey` }, hex: ["#7a7d83"] } }, image: `/products/monogram-1872-2/1MG183BK2.webp`, images: [`/products/monogram-1872-2/1MG183BK2.webp`, `/products/monogram-1872-2/1MG183BK2-2.webp`, `/products/monogram-1872-2/1MG183BK2-3.webp`, `/products/monogram-1872-2/1MG183BK2-4.webp`] },
      { sku: `1MG183GN1`, name: { pt: `Monogram 1872 — Cinzento & Cinzento Claro`, en: `Monogram 1872 — Grey & Light Gray` }, priceCents: 99000, currency: "EUR", attributes: { color: { label: { pt: `Cinzento & Cinzento Claro`, en: `Grey & Light Gray` }, hex: ["#7a7d83"] } }, image: `/products/monogram-1872-2/1MG183GN1.webp`, images: [`/products/monogram-1872-2/1MG183GN1.webp`, `/products/monogram-1872-2/1MG183GN1-2.webp`, `/products/monogram-1872-2/1MG183GN1-3.webp`, `/products/monogram-1872-2/1MG183GN1-4.webp`] },
      { sku: `1MG333RD1`, name: { pt: `Monogram 1872 — Vermelho`, en: `Monogram 1872 — Red` }, priceCents: 115000, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/monogram-1872-2/1MG333RD1.webp`, images: [`/products/monogram-1872-2/1MG333RD1.webp`, `/products/monogram-1872-2/1MG333RD1-2.webp`, `/products/monogram-1872-2/1MG333RD1-3.webp`, `/products/monogram-1872-2/1MG333RD1-4.webp`] },
    ],
  },
  {
    slug: `camera-bag-cohiba-behike`,
    name: { pt: `Mala de Câmara · Cohiba-Behike`, en: `Camera-bag · Cohiba-Behike` },
    description: { pt: `Para celebrar o 15.º aniversário da Línea Behike, a S.T. Dupont uniu-se à Cohiba numa colecção exclusiva de isqueiros e acessórios. Inspirada nos códigos emblemáticos da Behike, conjuga xadrez a preto e branco, acabamentos dourados e uma laca preta profunda. A efígie «Behike», revisitada pelos artífices ourives da S.T. Dupont, sublima esta colaboração única, uma homenagem ao savoir-faire e à excelência de ambas as casas. Camera Bag Cohiba Behike com acabamento brilhante. Couro de vitela liso.`, en: `To celebrate the 15th anniversary of Línea Behike, S.T. Dupont has teamed up with Cohiba for an exclusive collection of lighters and accessories. Inspired by Behike's emblematic codes, it combines black and white checks, gold finishes and deep black lacquer. The “Behike” effigy, revisited by the goldsmiths at S.T. Dupont, sublimates this unique collaboration, a tribute to the know-how and e*cellence of both houses. Camera Bag Cohiba Behike with gloss finish. Smooth calf leather` },
    collection: `Cohiba-Behike`,
    categorySlug: "pele",
    image: `/products/camera-bag-cohiba-behike/1BE183BK1.webp`,
    variants: [
      { sku: `1BE183BK1`, name: { pt: `Camera-bag · Cohiba-Behike — Preto`, en: `Camera-bag · Cohiba-Behike — Black` }, priceCents: 120000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/camera-bag-cohiba-behike/1BE183BK1.webp`, images: [`/products/camera-bag-cohiba-behike/1BE183BK1.webp`, `/products/camera-bag-cohiba-behike/1BE183BK1-2.webp`, `/products/camera-bag-cohiba-behike/1BE183BK1-3.webp`, `/products/camera-bag-cohiba-behike/1BE183BK1-4.webp`] },
    ],
  },
  {
    slug: `gift-box-gift`,
    name: { pt: `Caixas Presente · Gift`, en: `Gift Boxes · Gift` },
    description: { pt: `Acessório S.T. Dupont — feito à mão nas oficinas de Faverges, herdeiro do savoir-faire da Maison desde 1872.`, en: `S.T. Dupont accessory — made by hand at the Faverges workshops, an heir to the Maison's savoir-faire since 1872.` },
    collection: `Gift`,
    categorySlug: "acessorios",
    image: `/products/gift-box-gift/087601.webp`,
    variants: [
      { sku: `087601`, name: { pt: `Gift Boxes · Gift — Azul-escuro`, en: `Gift Boxes · Gift — Dark Blue` }, priceCents: 20000, currency: "EUR", attributes: { color: { label: { pt: `Azul-escuro`, en: `Dark Blue` }, hex: ["#1f3c66"] } }, image: `/products/gift-box-gift/087601.webp`, images: [`/products/gift-box-gift/087601.webp`] },
      { sku: `087451`, name: { pt: `Gift Boxes · Gift — Azul-escuro`, en: `Gift Boxes · Gift — Dark Blue` }, priceCents: 20000, currency: "EUR", attributes: { color: { label: { pt: `Azul-escuro`, en: `Dark Blue` }, hex: ["#1f3c66"] } }, image: `/products/gift-box-gift/087451.webp`, images: [`/products/gift-box-gift/087451.webp`] },
    ],
  },
  {
    slug: `line-d-3`,
    name: { pt: `Line D Eternity`, en: `Line D Eternity` },
    description: { pt: `Esta icónica pasta em couro preto transmite uma sofisticação business moderna. O fecho de pressão em paládio acrescenta requinte a esta mala. Conta com compartimentos profundos e bolsos seguros com fecho de correr, oferecendo amplo espaço para documentos e dispositivos electrónicos. Tão elegante quanto funcional, é perfeita para qualquer viagem de negócios. - Compartimento principal com amplo bolso interior - Compartimento com 4 pequenos bolsos - Bolso com fecho de correr - Bolso exterior nas costas`, en: `This iconic black leather briefcase exudes modern business sophistication. A palladium push-button closure adds to the refinement of this bag. It features deep compartments and secure zippered pockets, providing ample space for documents and tech devices. As stylish as it is functional, it is perfect for any business trip. - Main compartment with large interior pocket - Compartment with 4 small pockets - Zippered pocket - Exterior pocket on the back` },
    collection: `Line D Eternity`,
    categorySlug: "escrita",
    image: `/products/line-d-3/180008.webp`,
    variants: [
      { sku: `180008`, name: { pt: `Line D Eternity — Preto`, en: `Line D Eternity — Black` }, priceCents: 19000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-3/180008.webp`, images: [`/products/line-d-3/180008.webp`, `/products/line-d-3/180008-2.webp`, `/products/line-d-3/180008-3.webp`] },
      { sku: `180011`, name: { pt: `Line D Eternity — Preto`, en: `Line D Eternity — Black` }, priceCents: 23000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-3/180011.webp`, images: [`/products/line-d-3/180011.webp`, `/products/line-d-3/180011-2.webp`] },
      { sku: `180013`, name: { pt: `Line D Eternity — Preto`, en: `Line D Eternity — Black` }, priceCents: 24000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-3/180013.webp`, images: [`/products/line-d-3/180013.webp`, `/products/line-d-3/180013-2.webp`] },
      { sku: `181006`, name: { pt: `Line D Eternity — Preto`, en: `Line D Eternity — Black` }, priceCents: 69500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-3/181006.webp`, images: [`/products/line-d-3/181006.webp`, `/products/line-d-3/181006-2.webp`, `/products/line-d-3/181006-3.webp`, `/products/line-d-3/181006-4.webp`] },
      { sku: `181003SS`, name: { pt: `Line D Eternity — Preto`, en: `Line D Eternity — Black` }, priceCents: 126000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-3/181003SS.webp`, images: [`/products/line-d-3/181003SS.webp`, `/products/line-d-3/181003SS-2.webp`, `/products/line-d-3/181003SS-3.webp`, `/products/line-d-3/181003SS-4.webp`] },
      { sku: `180012`, name: { pt: `Line D Eternity — Preto`, en: `Line D Eternity — Black` }, priceCents: 29000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-3/180012.webp`, images: [`/products/line-d-3/180012.webp`, `/products/line-d-3/180012-2.webp`] },
      { sku: `181000`, name: { pt: `Line D Eternity — Preto`, en: `Line D Eternity — Black` }, priceCents: 120000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-3/181000.webp`, images: [`/products/line-d-3/181000.webp`, `/products/line-d-3/181000-2.webp`, `/products/line-d-3/181000-3.webp`, `/products/line-d-3/181000-4.webp`] },
      { sku: `181001`, name: { pt: `Line D Eternity — Preto`, en: `Line D Eternity — Black` }, priceCents: 140000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-3/181001.webp`, images: [`/products/line-d-3/181001.webp`, `/products/line-d-3/181001-2.webp`, `/products/line-d-3/181001-3.webp`, `/products/line-d-3/181001-4.webp`] },
      { sku: `180000`, name: { pt: `Line D Eternity — Preto`, en: `Line D Eternity — Black` }, priceCents: 31500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-3/180000.webp`, images: [`/products/line-d-3/180000.webp`, `/products/line-d-3/180000-2.webp`] },
      { sku: `180001`, name: { pt: `Line D Eternity — Preto`, en: `Line D Eternity — Black` }, priceCents: 32500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-3/180001.webp`, images: [`/products/line-d-3/180001.webp`, `/products/line-d-3/180001-2.webp`] },
      { sku: `180003`, name: { pt: `Line D Eternity — Preto`, en: `Line D Eternity — Black` }, priceCents: 38500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-3/180003.webp`, images: [`/products/line-d-3/180003.webp`, `/products/line-d-3/180003-2.webp`, `/products/line-d-3/180003-3.webp`] },
      { sku: `180007`, name: { pt: `Line D Eternity — Preto`, en: `Line D Eternity — Black` }, priceCents: 38500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-3/180007.webp`, images: [`/products/line-d-3/180007.webp`, `/products/line-d-3/180007-2.webp`, `/products/line-d-3/180007-3.webp`] },
    ],
  },
  {
    slug: `neo-capsule-2`,
    name: { pt: `Neo Capsule`, en: `Neo Capsule` },
    description: { pt: `Confeccionada em couro de vitela flor inteira, a carteira comprida com fecho de correr transporta cartões e moedas com um estilo incomparável. Conta com múltiplos compartimentos para cartões, um bolso com fecho de correr para moedas e compartimentos para papéis e notas. Toda a colecção Neo Capsule é certificada LWG. - 12 compartimentos para cartões - 2 amplos compartimentos para papéis e recibos - Compartimento com fecho de correr para moedas - Compartimento com fole para notas.`, en: `Crafted from full-grain calf leather, the long zippered wallet carries cards and coins with incomparable style. It features multiple card slots, a zippered pocket for coins, and compartments for papers and bills. The entire Neo capsule collection is LWG certified. - 12 card slots - 2 large compartments for papers and receipts - Zippered compartment for coins - Gusseted compartment for bills.` },
    collection: `Neo Capsule`,
    categorySlug: "pele",
    image: `/products/neo-capsule-2/180204.webp`,
    variants: [
      { sku: `180204`, name: { pt: `Neo Capsule — Preto`, en: `Neo Capsule — Black` }, priceCents: 19000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/neo-capsule-2/180204.webp`, images: [`/products/neo-capsule-2/180204.webp`, `/products/neo-capsule-2/180204-2.webp`] },
      { sku: `180227`, name: { pt: `Neo Capsule — Preto`, en: `Neo Capsule — Black` }, priceCents: 19000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/neo-capsule-2/180227.webp`, images: [`/products/neo-capsule-2/180227.webp`, `/products/neo-capsule-2/180227-2.webp`] },
      { sku: `141004`, name: { pt: `Neo Capsule — Preto`, en: `Neo Capsule — Black` }, priceCents: 91000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/neo-capsule-2/141004.webp`, images: [`/products/neo-capsule-2/141004.webp`, `/products/neo-capsule-2/141004-2.webp`, `/products/neo-capsule-2/141004-3.webp`, `/products/neo-capsule-2/141004-4.webp`] },
      { sku: `141003`, name: { pt: `Neo Capsule — Preto`, en: `Neo Capsule — Black` }, priceCents: 101000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/neo-capsule-2/141003.webp`, images: [`/products/neo-capsule-2/141003.webp`, `/products/neo-capsule-2/141003-2.webp`, `/products/neo-capsule-2/141003-3.webp`, `/products/neo-capsule-2/141003-4.webp`] },
      { sku: `181441`, name: { pt: `Neo Capsule — Verde & Caqui`, en: `Neo Capsule — Green & Khaki` }, priceCents: 109000, currency: "EUR", attributes: { color: { label: { pt: `Verde & Caqui`, en: `Green & Khaki` }, hex: ["#3b5d39"] } }, image: `/products/neo-capsule-2/181441.webp`, images: [`/products/neo-capsule-2/181441.webp`, `/products/neo-capsule-2/181441-2.webp`, `/products/neo-capsule-2/181441-3.webp`, `/products/neo-capsule-2/181441-4.webp`] },
      { sku: `181341`, name: { pt: `Neo Capsule — Azul-escuro`, en: `Neo Capsule — Dark Blue` }, priceCents: 109000, currency: "EUR", attributes: { color: { label: { pt: `Azul-escuro`, en: `Dark Blue` }, hex: ["#1f3c66"] } }, image: `/products/neo-capsule-2/181341.webp`, images: [`/products/neo-capsule-2/181341.webp`, `/products/neo-capsule-2/181341-2.webp`, `/products/neo-capsule-2/181341-3.webp`, `/products/neo-capsule-2/181341-4.webp`] },
      { sku: `181241`, name: { pt: `Neo Capsule — Preto`, en: `Neo Capsule — Black` }, priceCents: 109000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/neo-capsule-2/181241.webp`, images: [`/products/neo-capsule-2/181241.webp`, `/products/neo-capsule-2/181241-2.webp`, `/products/neo-capsule-2/181241-3.webp`, `/products/neo-capsule-2/181241-4.webp`] },
      { sku: `181242`, name: { pt: `Neo Capsule — Preto`, en: `Neo Capsule — Black` }, priceCents: 125000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/neo-capsule-2/181242.webp`, images: [`/products/neo-capsule-2/181242.webp`, `/products/neo-capsule-2/181242-2.webp`, `/products/neo-capsule-2/181242-3.webp`, `/products/neo-capsule-2/181242-4.webp`] },
      { sku: `180281`, name: { pt: `Neo Capsule — Preto`, en: `Neo Capsule — Black` }, priceCents: 18000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/neo-capsule-2/180281.webp`, images: [`/products/neo-capsule-2/180281.webp`] },
      { sku: `181444`, name: { pt: `Neo Capsule — Caqui`, en: `Neo Capsule — Khaki` }, priceCents: 84500, currency: "EUR", attributes: { color: { label: { pt: `Caqui`, en: `Khaki` }, hex: ["#3b5d39"] } }, image: `/products/neo-capsule-2/181444.webp`, images: [`/products/neo-capsule-2/181444.webp`, `/products/neo-capsule-2/181444-2.webp`, `/products/neo-capsule-2/181444-3.webp`, `/products/neo-capsule-2/181444-4.webp`] },
      { sku: `181344`, name: { pt: `Neo Capsule — Azul-escuro`, en: `Neo Capsule — Dark Blue` }, priceCents: 84500, currency: "EUR", attributes: { color: { label: { pt: `Azul-escuro`, en: `Dark Blue` }, hex: ["#1f3c66"] } }, image: `/products/neo-capsule-2/181344.webp`, images: [`/products/neo-capsule-2/181344.webp`, `/products/neo-capsule-2/181344-2.webp`, `/products/neo-capsule-2/181344-3.webp`, `/products/neo-capsule-2/181344-4.webp`] },
      { sku: `181244`, name: { pt: `Neo Capsule — Preto`, en: `Neo Capsule — Black` }, priceCents: 84500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/neo-capsule-2/181244.webp`, images: [`/products/neo-capsule-2/181244.webp`, `/products/neo-capsule-2/181244-2.webp`, `/products/neo-capsule-2/181244-3.webp`, `/products/neo-capsule-2/181244-4.webp`] },
      { sku: `180226`, name: { pt: `Neo Capsule — Preto`, en: `Neo Capsule — Black` }, priceCents: 23000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/neo-capsule-2/180226.webp`, images: [`/products/neo-capsule-2/180226.webp`, `/products/neo-capsule-2/180226-2.webp`] },
      { sku: `181243`, name: { pt: `Neo Capsule — Preto`, en: `Neo Capsule — Black` }, priceCents: 79500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/neo-capsule-2/181243.webp`, images: [`/products/neo-capsule-2/181243.webp`, `/products/neo-capsule-2/181243-2.webp`, `/products/neo-capsule-2/181243-3.webp`, `/products/neo-capsule-2/181243-4.webp`] },
      { sku: `181245`, name: { pt: `Neo Capsule — Preto`, en: `Neo Capsule — Black` }, priceCents: 55500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/neo-capsule-2/181245.webp`, images: [`/products/neo-capsule-2/181245.webp`, `/products/neo-capsule-2/181245-2.webp`, `/products/neo-capsule-2/181245-3.webp`, `/products/neo-capsule-2/181245-4.webp`] },
      { sku: `181246`, name: { pt: `Neo Capsule — Preto`, en: `Neo Capsule — Black` }, priceCents: 66500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/neo-capsule-2/181246.webp`, images: [`/products/neo-capsule-2/181246.webp`, `/products/neo-capsule-2/181246-2.webp`, `/products/neo-capsule-2/181246-3.webp`, `/products/neo-capsule-2/181246-4.webp`] },
      { sku: `181446`, name: { pt: `Neo Capsule — Caqui`, en: `Neo Capsule — Khaki` }, priceCents: 66500, currency: "EUR", attributes: { color: { label: { pt: `Caqui`, en: `Khaki` }, hex: ["#3b5d39"] } }, image: `/products/neo-capsule-2/181446.webp`, images: [`/products/neo-capsule-2/181446.webp`, `/products/neo-capsule-2/181446-2.webp`, `/products/neo-capsule-2/181446-3.webp`] },
      { sku: `181346`, name: { pt: `Neo Capsule — Azul`, en: `Neo Capsule — Blue` }, priceCents: 66500, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/neo-capsule-2/181346.webp`, images: [`/products/neo-capsule-2/181346.webp`, `/products/neo-capsule-2/181346-2.webp`, `/products/neo-capsule-2/181346-3.webp`, `/products/neo-capsule-2/181346-4.webp`] },
      { sku: `180206`, name: { pt: `Neo Capsule — Preto`, en: `Neo Capsule — Black` }, priceCents: 29000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/neo-capsule-2/180206.webp`, images: [`/products/neo-capsule-2/180206.webp`, `/products/neo-capsule-2/180206-2.webp`] },
      { sku: `180205`, name: { pt: `Neo Capsule — Preto`, en: `Neo Capsule — Black` }, priceCents: 38500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/neo-capsule-2/180205.webp`, images: [`/products/neo-capsule-2/180205.webp`, `/products/neo-capsule-2/180205-2.webp`] },
      { sku: `180202`, name: { pt: `Neo Capsule — Preto`, en: `Neo Capsule — Black` }, priceCents: 24000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/neo-capsule-2/180202.webp`, images: [`/products/neo-capsule-2/180202.webp`, `/products/neo-capsule-2/180202-2.webp`] },
      { sku: `180223`, name: { pt: `Neo Capsule — Preto`, en: `Neo Capsule — Black` }, priceCents: 28000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/neo-capsule-2/180223.webp`, images: [`/products/neo-capsule-2/180223.webp`, `/products/neo-capsule-2/180223-2.webp`] },
      { sku: `180225`, name: { pt: `Neo Capsule — Preto`, en: `Neo Capsule — Black` }, priceCents: 39500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/neo-capsule-2/180225.webp`, images: [`/products/neo-capsule-2/180225.webp`, `/products/neo-capsule-2/180225-2.webp`] },
    ],
  },
  {
    slug: `haute-creation`,
    name: { pt: `Haute Création`, en: `Haute Création` },
    description: { pt: `Este isqueiro de design requintado apresenta um mecanismo de relojoaria preciso e detalhes de alta joalharia. O latão polido é acabado a paládio e o seu delicado micromecanismo inclui 26 rubis de relojoeiro para um desempenho óptimo. A janela em vidro revela o magnífico mecanismo de roda colorido lacado pela S.T. Dupont. O isqueiro oferece uma dupla chama suave. É acondicionado especialmente na caixa Cube para charutos da S.T. Dupont, com acabamento preto mate. Para encomendar este produto excepcional, queira contactar o serviço de apoio ao cliente. O prazo de entrega é de aproximadamente 6 meses após a recepção e validação da encomenda. A peça está limitada a 88 exemplares, com número de série gravado no isqueiro. Queira contactar o serviço de apoio ao cliente para saber o número disponível. Dimensões: 40,9 x 18 x 66 mm.`, en: `This exquisite design lighter features a precise clockwork mechanism and high-end jewellery details. Its polished brass is finished with palladium and its delicate micromechanism includes 26 watchmaker rubies for the best performance. The glass window showcases the amazing coloured wheel mechanism lacquered by S.T. Dupont. The lighter offers a soft double flame. It is specially packed in the S.T. Dupont Cube cigar box, with a black and matte finish. To order this exceptional product, please contact the customer service. Delivery time is approximately 6 months after receipt and validation of the order. The item is limited to 88 pieces, with a serial number engraved on the lighter. Please contact customer service to know the available number. Dimensions: 40.9 x 18 x 66 mm` },
    collection: `Haute Création`,
    categorySlug: "isqueiros",
    image: `/products/haute-creation/016358PAL.webp`,
    variants: [
      { sku: `016358PAL`, name: { pt: `Haute Création — Prateado`, en: `Haute Création — Silver` }, priceCents: 4537500, currency: "EUR", attributes: { color: { label: { pt: `Prateado`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/haute-creation/016358PAL.webp`, images: [`/products/haute-creation/016358PAL.webp`, `/products/haute-creation/016358PAL-2.webp`, `/products/haute-creation/016358PAL-3.webp`, `/products/haute-creation/016358PAL-4.webp`] },
      { sku: `016358BL`, name: { pt: `Haute Création — Preto`, en: `Haute Création — Black` }, priceCents: 4537500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/haute-creation/016358BL.webp`, images: [`/products/haute-creation/016358BL.webp`, `/products/haute-creation/016358BL-2.webp`, `/products/haute-creation/016358BL-3.webp`, `/products/haute-creation/016358BL-4.webp`] },
      { sku: `016358RG`, name: { pt: `Haute Création — Rosa`, en: `Haute Création — Pink` }, priceCents: 4537500, currency: "EUR", attributes: { color: { label: { pt: `Rosa`, en: `Pink` }, hex: ["#c97a8c"] } }, image: `/products/haute-creation/016358RG.webp`, images: [`/products/haute-creation/016358RG.webp`, `/products/haute-creation/016358RG-2.webp`, `/products/haute-creation/016358RG-3.webp`, `/products/haute-creation/016358RG-4.webp`] },
      { sku: `016358`, name: { pt: `Haute Création — Dourado`, en: `Haute Création — Golden` }, priceCents: 4537500, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/haute-creation/016358.webp`, images: [`/products/haute-creation/016358.webp`, `/products/haute-creation/016358-2.webp`, `/products/haute-creation/016358-3.webp`, `/products/haute-creation/016358-4.webp`] },
    ],
  },
  {
    slug: `cufflinks`,
    name: { pt: `Botões de Punho`, en: `Cufflinks` },
    description: { pt: `Botões de punho com acabamento em aço inoxidável, simultaneamente clássicos e contemporâneos, com mola de gravata a condizer.`, en: `Cufflinks in stainless steel finish, both classic and contemporary, and matching tie clips.` },
    collection: `Cufflinks`,
    categorySlug: "acessorios",
    image: `/products/cufflinks/005576.webp`,
    variants: [
      { sku: `005576`, name: { pt: `Botões de Punho — Prateado`, en: `Cufflinks — Silver` }, priceCents: 23000, currency: "EUR", attributes: { color: { label: { pt: `Prateado`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/cufflinks/005576.webp`, images: [`/products/cufflinks/005576.webp`, `/products/cufflinks/005576-2.webp`, `/products/cufflinks/005576-3.webp`] },
      { sku: `005575`, name: { pt: `Botões de Punho — Azul & Prateado`, en: `Cufflinks — Blue & Silver` }, priceCents: 23000, currency: "EUR", attributes: { color: { label: { pt: `Azul & Prateado`, en: `Blue & Silver` }, hex: ["#1f3c66"] } }, image: `/products/cufflinks/005575.webp`, images: [`/products/cufflinks/005575.webp`, `/products/cufflinks/005575-2.webp`, `/products/cufflinks/005575-3.webp`] },
      { sku: `005585`, name: { pt: `Botões de Punho — Prateado`, en: `Cufflinks — Silver` }, priceCents: 26000, currency: "EUR", attributes: { color: { label: { pt: `Prateado`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/cufflinks/005585.webp`, images: [`/products/cufflinks/005585.webp`, `/products/cufflinks/005585-2.webp`, `/products/cufflinks/005585-3.webp`] },
      { sku: `005832`, name: { pt: `Botões de Punho — Preto & Prateado`, en: `Cufflinks — Black & Silver` }, priceCents: 26000, currency: "EUR", attributes: { color: { label: { pt: `Preto & Prateado`, en: `Black & Silver` }, hex: ["#15171c"] } }, image: `/products/cufflinks/005832.webp`, images: [`/products/cufflinks/005832.webp`, `/products/cufflinks/005832-2.webp`, `/products/cufflinks/005832-3.webp`] },
      { sku: `005833`, name: { pt: `Botões de Punho — Preto & Dourado`, en: `Cufflinks — Black & Golden` }, priceCents: 26000, currency: "EUR", attributes: { color: { label: { pt: `Preto & Dourado`, en: `Black & Golden` }, hex: ["#15171c"] } }, image: `/products/cufflinks/005833.webp`, images: [`/products/cufflinks/005833.webp`, `/products/cufflinks/005833-2.webp`, `/products/cufflinks/005833-3.webp`] },
      { sku: `005834`, name: { pt: `Botões de Punho — Prateado`, en: `Cufflinks — Silver` }, priceCents: 25000, currency: "EUR", attributes: { color: { label: { pt: `Prateado`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/cufflinks/005834.webp`, images: [`/products/cufflinks/005834.webp`, `/products/cufflinks/005834-2.webp`, `/products/cufflinks/005834-3.webp`, `/products/cufflinks/005834-4.webp`] },
      { sku: `005835`, name: { pt: `Botões de Punho — Dourado`, en: `Cufflinks — Golden` }, priceCents: 25000, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/cufflinks/005835.webp`, images: [`/products/cufflinks/005835.webp`, `/products/cufflinks/005835-2.webp`, `/products/cufflinks/005835-3.webp`] },
      { sku: `005836`, name: { pt: `Botões de Punho — Dourado & Dourado`, en: `Cufflinks — Gold & Golden` }, priceCents: 26000, currency: "EUR", attributes: { color: { label: { pt: `Dourado & Dourado`, en: `Gold & Golden` }, hex: ["#c8a24a"] } }, image: `/products/cufflinks/005836.webp`, images: [`/products/cufflinks/005836.webp`, `/products/cufflinks/005836-2.webp`, `/products/cufflinks/005836-3.webp`] },
      { sku: `005837`, name: { pt: `Botões de Punho — Prateado`, en: `Cufflinks — Silver` }, priceCents: 26000, currency: "EUR", attributes: { color: { label: { pt: `Prateado`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/cufflinks/005837.webp`, images: [`/products/cufflinks/005837.webp`, `/products/cufflinks/005837-2.webp`, `/products/cufflinks/005837-3.webp`] },
      { sku: `005567`, name: { pt: `Botões de Punho — Prateado`, en: `Cufflinks — Silver` }, priceCents: 23000, currency: "EUR", attributes: { color: { label: { pt: `Prateado`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/cufflinks/005567.webp`, images: [`/products/cufflinks/005567.webp`, `/products/cufflinks/005567-2.webp`, `/products/cufflinks/005567-3.webp`] },
      { sku: `005597`, name: { pt: `Botões de Punho — Prateado`, en: `Cufflinks — Silver` }, priceCents: 22000, currency: "EUR", attributes: { color: { label: { pt: `Prateado`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/cufflinks/005597.webp`, images: [`/products/cufflinks/005597.webp`, `/products/cufflinks/005597-2.webp`, `/products/cufflinks/005597-3.webp`] },
    ],
  },
  {
    slug: `tie-clip-3`,
    name: { pt: `Mola de Gravata`, en: `Tie-clip` },
    description: { pt: `Mola de gravata em metal dourado. Para conjugar com os botões de punho.`, en: `Golden metal tie clip. To coordinate with cufflinks.` },
    collection: `Tie-clip`,
    categorySlug: "acessorios",
    image: `/products/tie-clip-3/005842.webp`,
    variants: [
      { sku: `005842`, name: { pt: `Mola de Gravata — Dourado & Dourado`, en: `Tie-clip — Gold & Golden` }, priceCents: 25000, currency: "EUR", attributes: { color: { label: { pt: `Dourado & Dourado`, en: `Gold & Golden` }, hex: ["#c8a24a"] } }, image: `/products/tie-clip-3/005842.webp`, images: [`/products/tie-clip-3/005842.webp`, `/products/tie-clip-3/005842-2.webp`] },
    ],
  },
  {
    slug: `box-8-refills`,
    name: { pt: `Pedras de Sílex (Cx. 8)`, en: `Flint Stones (Box of 8)` },
    description: { pt: `Pedra de sílex preta. Vendida em embalagens de 8 pedras. Para os seguintes isqueiros: Ligne 1, Ligne 2, Gatsby, Urban, Soubreny, Long Table Lighter, Jéroboam, Cylindrical.`, en: `Black flint stone. Sold in packs of 8 flint stones. For the following lighters: Line 1, Line 2, Gatsby, Urban, Soubreny, Long Table Lighter, Jéroboam, Cylindrical.` },
    collection: `Refills & Stones`,
    categorySlug: "acessorios",
    image: `/products/box-8-refills/900601.webp`,
    variants: [
      { sku: `900601`, name: { pt: `Pedras de Sílex (cx. 8) — Black`, en: `Flint Stones (box of 8) — Black` }, priceCents: 400, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/box-8-refills/900601.webp`, images: [`/products/box-8-refills/900601.webp`] },
      { sku: `900651`, name: { pt: `Pedras de Sílex (cx. 8) — Red`, en: `Flint Stones (box of 8) — Red` }, priceCents: 400, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/box-8-refills/900651.webp`, images: [`/products/box-8-refills/900651.webp`] },
    ],
  },
  {
    slug: `line-d-montecristo-la-nuit`,
    name: { pt: `Line D Eternity · Montecristo · La Nuit`, en: `Line D Eternity · Montecristo · La Nuit` },
    description: { pt: `Em laca Dupont, o instrumento de escrita Line D Large ostenta orgulhosamente o brasão S.T. Dupont e o logótipo Montecristo. Ornamentado com um bico em ouro maciço de 14 quilates, é dedicado aos entusiastas da escrita em busca de excelência e conforto. A Montecristo La Nuit propõe: três isqueiros, dois instrumentos de escrita Line D Large, acessórios para charutos e um par de botões de punho. Recargas associadas: 040112 Azul 040110 Preta 040362 Vermelha 040363 Verde 040364 Turquesa. Esta caneta de tinta permanente é fornecida com um bico médio, para um traço de escrita de aproximadamente 0,55 mm.`, en: `In Dupont lacquer, the Line D Large writing instrument proudly displays the S.T. Dupont crest and the Montecristo logo. Adorned with a 14-carat solid gold nib, it is dedicated to writing enthusiasts in search of excellence and writing comfort. Montecristo La Nuit offers: three lighters, two Line D Large writing instruments, cigar accessories and a pair of cufflinks. Associated refills: 040112 Blue 040110 Black 040362 Red 040363 Green 040364 Turquoise This fountain pen comes with a medium nib, for a writing size of apporox. 0.55 mm.` },
    collection: `Montecristo · La Nuit`,
    categorySlug: "escrita",
    image: `/products/line-d-montecristo-la-nuit/410135L.webp`,
    variants: [
      { sku: `410135L`, name: { pt: `Line D Eternity · Montecristo · La Nuit — Azul`, en: `Line D Eternity · Montecristo · La Nuit — Blue` }, priceCents: 158000, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/line-d-montecristo-la-nuit/410135L.webp`, images: [`/products/line-d-montecristo-la-nuit/410135L.webp`, `/products/line-d-montecristo-la-nuit/410135L-2.webp`, `/products/line-d-montecristo-la-nuit/410135L-3.webp`, `/products/line-d-montecristo-la-nuit/410135L-4.webp`] },
      { sku: `412135L`, name: { pt: `Line D Eternity · Montecristo · La Nuit — Azul`, en: `Line D Eternity · Montecristo · La Nuit — Blue` }, priceCents: 127000, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/line-d-montecristo-la-nuit/412135L.webp`, images: [`/products/line-d-montecristo-la-nuit/412135L.webp`, `/products/line-d-montecristo-la-nuit/412135L-2.webp`, `/products/line-d-montecristo-la-nuit/412135L-3.webp`, `/products/line-d-montecristo-la-nuit/412135L-4.webp`] },
    ],
  },
  {
    slug: `line-d-montecristo-aurore`,
    name: { pt: `Line D Eternity · Montecristo · L'Aurore`, en: `Line D Eternity · Montecristo · L'Aurore` },
    description: { pt: `Montecristo e S.T. Dupont, ambos sinónimos de um savoir-faire único, unem-se para criar produtos de excepção. Esta nova colecção encantará os fãs de ambas as marcas. Em laca Dupont, o instrumento de escrita Line D Large ostenta orgulhosamente o brasão S.T. Dupont e o logótipo Montecristo. Ornamentado com um bico em ouro maciço de 14 quilates, é dedicado aos entusiastas da escrita em busca de excelência e conforto. A Montecristo L'Aurore propõe: três isqueiros, dois instrumentos de escrita Line D Large, acessórios para charutos e um par de botões de punho. Recargas associadas: 040112 Azul 040110 Preta 040362 Vermelha 040363 Verde 040364 Turquesa. Esta caneta de tinta permanente é fornecida com um bico médio, para um traço de escrita de aproximadamente 0,55 mm.`, en: `Montecristo and S.T. Dupont, both synonymous with unique craftsmanship, have joined forces to create exceptional products. This new collection will delight fans of both brands. In Dupont lacquer, the large Line D writing instrument proudly displays the S.T.Dupont crest and the Montecristo logo. Adorned with a 14-carat solid gold nib, it is dedicated to writing enthusiasts in search of excellence and writing comfort. Montecristo L'Aurore offers: three lighters, two large Line D writing instruments, cigar accessories and a pair of cufflinks. Associated refills: 040112 Blue 040110 Black 040362 Red 040363 Green 040364 Turquoise This fountain pen comes with a medium nib, for a writing size of apporox. 0.55 mm.` },
    collection: `Montecristo · L'Aurore`,
    categorySlug: "escrita",
    image: `/products/line-d-montecristo-aurore/410134L.webp`,
    variants: [
      { sku: `410134L`, name: { pt: `Line D Eternity · Montecristo · L'Aurore — Violeta`, en: `Line D Eternity · Montecristo · L'Aurore — Violet` }, priceCents: 158000, currency: "EUR", attributes: { color: { label: { pt: `Violeta`, en: `Violet` }, hex: ["#6b4a8a"] } }, image: `/products/line-d-montecristo-aurore/410134L.webp`, images: [`/products/line-d-montecristo-aurore/410134L.webp`, `/products/line-d-montecristo-aurore/410134L-2.webp`, `/products/line-d-montecristo-aurore/410134L-3.webp`, `/products/line-d-montecristo-aurore/410134L-4.webp`] },
      { sku: `412134L`, name: { pt: `Line D Eternity · Montecristo · L'Aurore — Violeta`, en: `Line D Eternity · Montecristo · L'Aurore — Violet` }, priceCents: 127000, currency: "EUR", attributes: { color: { label: { pt: `Violeta`, en: `Violet` }, hex: ["#6b4a8a"] } }, image: `/products/line-d-montecristo-aurore/412134L.webp`, images: [`/products/line-d-montecristo-aurore/412134L.webp`, `/products/line-d-montecristo-aurore/412134L-2.webp`, `/products/line-d-montecristo-aurore/412134L-3.webp`, `/products/line-d-montecristo-aurore/412134L-4.webp`] },
    ],
  },
  {
    slug: `eternity-20000-leagues`,
    name: { pt: `Eternity · 20,000 Leagues Under The Sea`, en: `Eternity · 20,000 Leagues Under The Sea` },
    description: { pt: `Homenagem ao cativante universo de 20,000 Leagues Under The Sea, esta edição limitada expressa todo o savoir-faire da S.T. Dupont. Publicado em 1870, o romance narra a viagem de três náufragos capturados pelo Capitão Nemo, o misterioso inventor que percorre os fundos marinhos a bordo do Nautilus, um submarino muito à frente das tecnologias da sua época. Vigias, turbinas, corais, barbatanas e outros tentáculos de lulas gigantes inspiram esta edição limitada e as suas três gamas, todas relacionadas com diferentes capítulos do livro. Uma história em três actos em que mergulhar com paixão. Para a gama Premium desta edição 20,000 Leagues Under The Sea, a S.T. Dupont narra dois outros capítulos: «4000 léguas sob o Pacífico», capítulo 18 do livro, e «Gulf Stream», capítulo 19 da sua segunda parte. Neste último, Júlio Verne evoca a Corrente do Golfo, uma força natural que molda o movimento dos oceanos e dos que neles se encontram. Veloz e perigosa, permite também ao Capitão Nemo demonstrar a sua excelência. Caneta de tinta permanente Line D Eternity Large com guilloché sob laca «waves». Revestida em laca S.T. Dupont degradé azul. Acabamentos em paládio. Bico em ouro de 14 quilates. Êmbolo incluído. Tampa gravada com o icónico N do Nautilus. Clip Sword articulado. Corpo gravado com bolhas. Disponível nas versões rollerball e tinta permanente. Recargas associadas: Cartuchos de tinta: 040112 Azul - 040110 Preta - 040362 Vermelha - 040363 Verde - 040364 Turquesa. Tinteiros: 040165 Preto Intenso - 040166 Azul Real - 040167 Vermelho Flamejante - 040168 Verde Primavera - 040169 Turquesa - 040170 Azul-Noite.`, en: `Tribute to the captivating universe of 20,000 leagues under the seas, this limited edition expresses all the know-how of S.T. Dupont. Published in 1870, the novel recounts the journey of three castaways captured by Captain Nemo, this mysterious inventor who travels the seabed aboard the Nautilus, submarine very ahead of the technologies of the time. Portholes, turbines, corals, fins and other tentacles of giant squid inspire this limited edition and its three ranges, all related to different chapters of the book. A story in three stages in which to dive with passion. For the Premium range of this edition 20,000 leagues under the seas, S.T. Dupont tells two other chapters: «4000 leagues under the Pacific», chapter 18 of the book, and «Gulf Stream», chapter 19 of its second part. In the latter, Jules Verne evokes the Gulf Stream, a natural force shaping the movement of the oceans and those who are there. Fast-moving and perilous, it also allows Captain Nemo to demonstrate his excellence. Line D Eternity wide guilloche fountain pen under "waves" lacquer. Covered with S.T. Dupont blue gradient lacquer. Palladium finishes. 14-karat gold nib. Piston included. Engraved cap of the iconic N of the Nautilus. Articulated Sword Agrafe. Sleeve engraved with bubbles. Available in roller and feather version. Associated refills: Ink cartridges: 040112 Blue - 040110 Black - 040362 Red - 040363 Green - 040364 Turquoise Inkwell: 040165 Intense black - 040166 Royal blue -040167 Flamboyant red - 040168 Spring green - 040169 Turquoise - 040170 Night blue` },
    collection: `20,000 Leagues Under The Sea`,
    categorySlug: "escrita",
    image: `/products/eternity-20000-leagues/420051L.webp`,
    variants: [
      { sku: `420051L`, name: { pt: `Eternity · 20,000 Leagues Under The Sea — Azul Gulf Stream`, en: `Eternity · 20,000 Leagues Under The Sea — Blue Gulf Stream` }, priceCents: 161500, currency: "EUR", attributes: { color: { label: { pt: `Azul Gulf Stream`, en: `Blue Gulf Stream` }, hex: ["#1f3c66"] } }, image: `/products/eternity-20000-leagues/420051L.webp`, images: [`/products/eternity-20000-leagues/420051L.webp`, `/products/eternity-20000-leagues/420051L-2.webp`, `/products/eternity-20000-leagues/420051L-3.webp`, `/products/eternity-20000-leagues/420051L-4.webp`] },
      { sku: `420052L`, name: { pt: `Eternity · 20,000 Leagues Under The Sea — Verde Pacífico`, en: `Eternity · 20,000 Leagues Under The Sea — Green Pacific` }, priceCents: 161500, currency: "EUR", attributes: { color: { label: { pt: `Verde Pacífico`, en: `Green Pacific` }, hex: ["#3b5d39"] } }, image: `/products/eternity-20000-leagues/420052L.webp`, images: [`/products/eternity-20000-leagues/420052L.webp`, `/products/eternity-20000-leagues/420052L-2.webp`, `/products/eternity-20000-leagues/420052L-3.webp`, `/products/eternity-20000-leagues/420052L-4.webp`] },
      { sku: `422051L`, name: { pt: `Eternity · 20,000 Leagues Under The Sea — Azul Gulf Stream`, en: `Eternity · 20,000 Leagues Under The Sea — Blue Gulf Stream` }, priceCents: 130000, currency: "EUR", attributes: { color: { label: { pt: `Azul Gulf Stream`, en: `Blue Gulf Stream` }, hex: ["#1f3c66"] } }, image: `/products/eternity-20000-leagues/422051L.webp`, images: [`/products/eternity-20000-leagues/422051L.webp`, `/products/eternity-20000-leagues/422051L-2.webp`, `/products/eternity-20000-leagues/422051L-3.webp`, `/products/eternity-20000-leagues/422051L-4.webp`] },
      { sku: `422052L`, name: { pt: `Eternity · 20,000 Leagues Under The Sea — Verde Pacífico`, en: `Eternity · 20,000 Leagues Under The Sea — Green Pacific` }, priceCents: 131000, currency: "EUR", attributes: { color: { label: { pt: `Verde Pacífico`, en: `Green Pacific` }, hex: ["#3b5d39"] } }, image: `/products/eternity-20000-leagues/422052L.webp`, images: [`/products/eternity-20000-leagues/422052L.webp`, `/products/eternity-20000-leagues/422052L-2.webp`, `/products/eternity-20000-leagues/422052L-3.webp`, `/products/eternity-20000-leagues/422052L-4.webp`] },
    ],
  },
  {
    slug: `eternity-horse-mane`,
    name: { pt: `Eternity · Horse Mane`, en: `Eternity · Horse Mane` },
    description: { pt: `Por ocasião do Ano Novo Chinês de 2026, sob o signo do Cavalo de Fogo, a S.T. Dupont revela Horse, uma colecção deslumbrante que encarna o carisma, a majestade e a paixão. O guilloché «criniera» e a escultura equestre evocam com elegância as tradições da cultura chinesa. A caneta de tinta permanente Line D Eternity Large apresenta guilloché sob laca vermelha com desenho «horse mane» e acabamentos dourados. Equipada com bico em ouro de 14 quilates e êmbolo integrado. A tampa é ornamentada com um Fire Horse dourado, complementada por um clip Sword articulado. Disponível nas versões rollerball e tinta permanente. Cartuchos de tinta compatíveis: 040112 Azul – 040110 Preta – 040362 Vermelha – 040363 Verde – 040364 Turquesa. Frascos de tinta compatíveis: 040165 Preto Intenso – 040166 Azul Real – 040167 Vermelho Vibrante – 040168 Verde Primavera – 040169 Turquesa – 040170 Azul Meia-Noite.`, en: `On the occasion of the Chinese New Year 2026, under the sign of the Fire Horse, S.T. Dupont unveils Horse, a dazzling collection that embodies charisma, majesty, and passion. The “mane” guilloche pattern and equestrian sculpture elegantly evoke the traditions of Chinese culture. The Line D Eternity large fountain pen features guilloche under red lacquer with a “horse’s mane” design and gold finishes. Equipped with a 14-carat gold nib and built-in piston. The cap is adorned with a golden Fire Horse, complemented by an articulated Sword clip. Available in both rollerball and fountain pen versions. Compatible ink cartridges: 040112 Blue – 040110 Black – 040362 Red – 040363 Green – 040364 Turquoise Compatible ink bottles: 040165 Intense Black – 040166 Royal Blue – 040167 Vibrant Red – 040168 Spring Green – 040169 Turquoise – 040170 Midnight Blue` },
    collection: `Horse Mane`,
    categorySlug: "escrita",
    image: `/products/eternity-horse-mane/420080L.webp`,
    variants: [
      { sku: `420080L`, name: { pt: `Eternity · Horse Mane — Vermelho`, en: `Eternity · Horse Mane — Red` }, priceCents: 111000, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/eternity-horse-mane/420080L.webp`, images: [`/products/eternity-horse-mane/420080L.webp`, `/products/eternity-horse-mane/420080L-2.webp`, `/products/eternity-horse-mane/420080L-3.webp`, `/products/eternity-horse-mane/420080L-4.webp`] },
      { sku: `420088L`, name: { pt: `Eternity · Horse Mane — Preto`, en: `Eternity · Horse Mane — Black` }, priceCents: 111000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/eternity-horse-mane/420088L.webp`, images: [`/products/eternity-horse-mane/420088L.webp`, `/products/eternity-horse-mane/420088L-2.webp`, `/products/eternity-horse-mane/420088L-3.webp`, `/products/eternity-horse-mane/420088L-4.webp`] },
      { sku: `422088L`, name: { pt: `Eternity · Horse Mane — Preto`, en: `Eternity · Horse Mane — Black` }, priceCents: 91000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/eternity-horse-mane/422088L.webp`, images: [`/products/eternity-horse-mane/422088L.webp`, `/products/eternity-horse-mane/422088L-2.webp`, `/products/eternity-horse-mane/422088L-3.webp`, `/products/eternity-horse-mane/422088L-4.webp`] },
      { sku: `422080L`, name: { pt: `Eternity · Horse Mane — Vermelho`, en: `Eternity · Horse Mane — Red` }, priceCents: 91000, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/eternity-horse-mane/422080L.webp`, images: [`/products/eternity-horse-mane/422080L.webp`, `/products/eternity-horse-mane/422080L-2.webp`, `/products/eternity-horse-mane/422080L-3.webp`, `/products/eternity-horse-mane/422080L-4.webp`] },
    ],
  },
  {
    slug: `box-7-refills-2`,
    name: { pt: `Caixa de 7 Recargas Esferográfica · Cores`, en: `Box of 7 Ballpoint Refills · Colours` },
    description: { pt: `Recarregue as suas canetas de ponta média verde para todas as linhas Défi, Liberté, Line D, Streamliner-R e D-Initial Jet 8 Pen. Vendido em caixas de 7.`, en: `Recharge your medium-point green pens for all Défi, Liberté, Line D, Streamliner-R, and D-Initial Jet 8 Pen lines. Sold in boxes of 7.` },
    collection: `Refills & Inks`,
    categorySlug: "acessorios",
    image: `/products/box-7-refills-2/040360.webp`,
    variants: [
      { sku: `040360`, name: { pt: `Recargas Esferográfica (cx. 7) — Green`, en: `Ballpoint Refills (box of 7) — Green` }, priceCents: 10000, currency: "EUR", attributes: { color: { label: { pt: `Verde`, en: `Green` }, hex: ["#3b5d39"] } }, image: `/products/box-7-refills-2/040360.webp`, images: [`/products/box-7-refills-2/040360.webp`] },
      { sku: `040358`, name: { pt: `Recargas Esferográfica (cx. 7) — Pink`, en: `Ballpoint Refills (box of 7) — Pink` }, priceCents: 10000, currency: "EUR", attributes: { color: { label: { pt: `Rosa`, en: `Pink` }, hex: ["#c97a8c"] } }, image: `/products/box-7-refills-2/040358.webp`, images: [`/products/box-7-refills-2/040358.webp`] },
    ],
  },
  {
    slug: `ligne-2-dragon`,
    name: { pt: `Ligne 2 · Dragon`, en: `Ligne 2 · Dragon` },
    description: { pt: `O Ligne 2 é ornamentado com uma tampa em guilloché de escamas de dragão e acabamentos dourados, bem como um corpo em guilloché sob laca Dupont cor de mel. Recargas associadas: Vermelha (REF 000434) Pedra preta (REF 900601)`, en: `The Line 2 is adorned with a guilloche dragon scale cover and gold finishes, as well as a guilloche body under Dupont lacquer in honey color. Associated refills: Red (REF 000434) Black stone (REF 900601)` },
    collection: `Dragon`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-dragon/C16630.webp`,
    variants: [
      { sku: `C16630`, name: { pt: `Ligne 2 · Dragon — Mel`, en: `Ligne 2 · Dragon — Honey` }, priceCents: 141000, currency: "EUR", attributes: { color: { label: { pt: `Mel`, en: `Honey` }, hex: ["#7a7d83"] } }, image: `/products/ligne-2-dragon/C16630.webp`, images: [`/products/ligne-2-dragon/C16630.webp`, `/products/ligne-2-dragon/C16630-2.webp`, `/products/ligne-2-dragon/C16630-3.webp`, `/products/ligne-2-dragon/C16630-4.webp`] },
      { sku: `C16527`, name: { pt: `Ligne 2 · Dragon — Preto`, en: `Ligne 2 · Dragon — Black` }, priceCents: 141000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/ligne-2-dragon/C16527.webp`, images: [`/products/ligne-2-dragon/C16527.webp`, `/products/ligne-2-dragon/C16527-2.webp`, `/products/ligne-2-dragon/C16527-3.webp`, `/products/ligne-2-dragon/C16527-4.webp`] },
    ],
  },
  {
    slug: `ligne-2-snake-skin`,
    name: { pt: `Ligne 2 · Snake Skin`, en: `Ligne 2 · Snake Skin` },
    description: { pt: `A linha Snake Skin insere o seu original guilloché de pele de serpente sob uma audaz laca verde ou o mais clássico preto. Uma forma de honrar o método tradicional e exclusivo do guilloché sob laca, bem como a alma deste reptil ao qual é dedicado o ano lunar de 2025. Isqueiro Ligne 2 Cling, guilloché sob laca, motivo Snake Skin verde, acabamento em paládio. Apresenta uma dupla chama amarela e o famoso «Cling» na abertura. Pedra de isqueiro associada: preta (REF 900601). Recarga de gás associada: vermelha (REF 900435). Isqueiro entregue sem gás, recarga vendida em separado.`, en: `The Snake Skin line slips its original snakeskin guilloche under a bold green lacquer or the more classic black. A way of honoring the traditional and exclusive method of under-lacquer guilloche, as well as the soul of this reptile to which the lunar year 2025 is dedicated. Ligne 2 Cling lighter, guilloche under lacquer, green Snake skin motif, palladium finish. Featuring a double yellow flame and the famous “Cling” on opening. Matching lighter stone: black (REF 900601) Associated gas refill: red (REF 900435) Lighter delivered empty of gas, refill sold separately.` },
    collection: `Snake Skin`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-snake-skin/C16078.webp`,
    variants: [
      { sku: `C16078`, name: { pt: `Ligne 2 · Snake Skin — Verde`, en: `Ligne 2 · Snake Skin — Green` }, priceCents: 145000, currency: "EUR", attributes: { color: { label: { pt: `Verde`, en: `Green` }, hex: ["#3b5d39"] } }, image: `/products/ligne-2-snake-skin/C16078.webp`, images: [`/products/ligne-2-snake-skin/C16078.webp`, `/products/ligne-2-snake-skin/C16078-2.webp`, `/products/ligne-2-snake-skin/C16078-3.webp`, `/products/ligne-2-snake-skin/C16078-4.webp`] },
    ],
  },
  {
    slug: `ligne-2-camo-2`,
    name: { pt: `Ligne 2 · Camo`, en: `Ligne 2 · Camo` },
    description: { pt: `Este ano, a S.T. Dupont reintroduz o motivo de camuflagem nos seus produtos icónicos, numa interpretação fresca e audaz do design lendário, com chamas em tons vibrantes de vermelho e verde. Isqueiro Ligne 2 Cling com guilloché sob laca com motivo Camouflage vermelho, acabamento em paládio. Apresenta uma dupla chama amarela e o famoso «Cling» na abertura. Pedra de isqueiro associada: preta (REF 900601). Recarga de gás associada: vermelha (REF 900435). Isqueiro entregue sem gás, recarga vendida em separado.`, en: `This year, S.T. This year, S.T. Dupont reintroduces the camouflage motif on its iconic products, with a fresh, bold interpretation of the legendary design, featuring flames in vibrant shades of red and green. Ligne 2 Cling lighter guilloche under lacquer with red Camouflage motif, palladium finish Featuring a double yellow flame and the famous “Cling” when opened. Matching lighter stone: black (REF 900601) Associated gas refill: red (REF 900435) Lighter delivered empty of gas, refill sold separately.` },
    collection: `Camo`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-camo-2/C16051.webp`,
    variants: [
      { sku: `C16051`, name: { pt: `Ligne 2 · Camo — Vermelho`, en: `Ligne 2 · Camo — Red` }, priceCents: 135000, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/ligne-2-camo-2/C16051.webp`, images: [`/products/ligne-2-camo-2/C16051.webp`, `/products/ligne-2-camo-2/C16051-2.webp`, `/products/ligne-2-camo-2/C16051-3.webp`, `/products/ligne-2-camo-2/C16051-4.webp`] },
    ],
  },
  {
    slug: `ligne-2-horse-mane-2`,
    name: { pt: `Ligne 2 · Horse Mane`, en: `Ligne 2 · Horse Mane` },
    description: { pt: `Por ocasião do Ano Novo Chinês de 2026, sob o signo do Cavalo de Fogo, a S.T. Dupont revela Horse, uma colecção flamejante que encarna o carisma, a majestade e a paixão. O guilloché «criniera» e a escultura equina evocam com elegância as tradições da cultura chinesa. Isqueiro Ligne 2 Cling decorado com guilloché sob laca preta de alto brilho, com motivo «horse mane». Motivo Fire Horse em dourado. Acabamentos banhados a paládio. Equipado com dupla chama amarela e a icónica abertura «Cling». Isqueiro entregue sem gás; recarga vendida em separado.`, en: `On the occasion of the 2026 Chinese New Year, under the sign of the Fire Horse, S.T. Dupont unveils Horse, a flamboyant collection embodying charisma, majesty, and passion. The “mane” guilloché and equine sculpture elegantly evoke the traditions of Chinese culture. Ligne 2 Cling lighter decorated with guilloché under high-gloss black lacquer with “horse mane” motif. Fire Horse motif in gold. Palladium-plated finishes. Equipped with a double yellow flame and the signature “Cling” opening. Lighter delivered empty of gas; refill sold separately.` },
    collection: `Horse Mane`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-horse-mane-2/C16080CL.webp`,
    variants: [
      { sku: `C16080CL`, name: { pt: `Ligne 2 · Horse Mane — Vermelho`, en: `Ligne 2 · Horse Mane — Red` }, priceCents: 156500, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/ligne-2-horse-mane-2/C16080CL.webp`, images: [`/products/ligne-2-horse-mane-2/C16080CL.webp`, `/products/ligne-2-horse-mane-2/C16080CL-2.webp`, `/products/ligne-2-horse-mane-2/C16080CL-3.webp`, `/products/ligne-2-horse-mane-2/C16080CL-4.webp`] },
      { sku: `C16088CL`, name: { pt: `Ligne 2 · Horse Mane — Preto`, en: `Ligne 2 · Horse Mane — Black` }, priceCents: 151500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/ligne-2-horse-mane-2/C16088CL.webp`, images: [`/products/ligne-2-horse-mane-2/C16088CL.webp`, `/products/ligne-2-horse-mane-2/C16088CL-2.webp`, `/products/ligne-2-horse-mane-2/C16088CL-3.webp`, `/products/ligne-2-horse-mane-2/C16088CL-4.webp`] },
    ],
  },
  {
    slug: `humidor-fuente`,
    name: { pt: `Humidores · Fuente`, en: `Humidors · Fuente` },
    description: { pt: `Humidor Cube para charutos (60 charutos) — Lona revestida decorada com o monograma X multicolor e o brasão Opus X Fuente. Tabuleiro amovível e higrómetro incluídos. Revestimento interior em madeira de cedro, dobradiças douradas. Kit de humidificação Boveda incluído (REF 087377).`, en: `Cigar Humidor Cube (60 Cigars) - Coated canvas decorated with the multicolor X monogram and Opus X Fuente crest. Removable tray and hygrometer included. Cedar wood lining, gold hinges. Boveda humidification kit included (REF 087377).` },
    collection: `Fuente`,
    categorySlug: "acessorios",
    image: `/products/humidor-fuente/001360.webp`,
    variants: [
      { sku: `001360`, name: { pt: `Humidors · Fuente — Multicor & Multicor`, en: `Humidors · Fuente — Multicolor & Multicouleur` }, priceCents: 91000, currency: "EUR", attributes: { color: { label: { pt: `Multicor & Multicor`, en: `Multicolor & Multicouleur` }, hex: ["#c8a24a"] } }, image: `/products/humidor-fuente/001360.webp`, images: [`/products/humidor-fuente/001360.webp`, `/products/humidor-fuente/001360-2.webp`, `/products/humidor-fuente/001360-3.webp`] },
    ],
  },
  {
    slug: `firehead-3`,
    name: { pt: `Firehead`, en: `Firehead` },
    description: { pt: `Porta-chaves elegante, inspirado no isqueiro Firehead, com uma placa em paládio e uma parte em couro gravado em relevo. O couro utilizado em todos os modelos da colecção Firehead é certificado pelo Leather Working Group.`, en: `Elegant keychain, inspired by the Firehead lighter, featuring a palladium plate and embossed leather part. The leather used on all models of the Firehead collection is certified Leather Working Group.` },
    collection: `Firehead`,
    categorySlug: "pele",
    image: `/products/firehead-3/161110.webp`,
    variants: [
      { sku: `161110`, name: { pt: `Firehead — Preto`, en: `Firehead — Black` }, priceCents: 14000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/firehead-3/161110.webp`, images: [`/products/firehead-3/161110.webp`, `/products/firehead-3/161110-2.webp`, `/products/firehead-3/161110-3.webp`] },
    ],
  },
  {
    slug: `ligne-2-montecristo`,
    name: { pt: `Ligne 2 · Montecristo`, en: `Ligne 2 · Montecristo` },
    description: { pt: `Montecristo e S.T. Dupont, ambos sinónimos de um savoir-faire único, unem-se para criar produtos de excepção. A linha Crépuscule, com os seus tons suaves e luminosos, reflecte a idílica juventude do jovem Edmond Dantès. Um capitão ambicioso e promissor que parte para uma viagem inesperada pela vida. O Ligne 2 é lacado num degradé de laranja e amarelo, com o logótipo da prestigiada marca de charutos Montecristo estampado a dourado num dos lados, enquanto o outro apresenta um motivo dourado de sol e lua. Apresenta uma dupla chama amarela suave. Pedra de isqueiro associada: preta (REF 900601). Recarga de gás associada: vermelha (REF 900435). Isqueiro entregue sem gás, recarga vendida em separado.`, en: `Montecristo and S.T. Dupont, both synonymous with unique expertise, have joined forces to create exceptional products. The Crépuscule line, with its soft, luminous shades Crépuscule reflects the idyllic early life of young Edmond Dantès. An ambitious, promising captain who embarks on an unexpected journey through life. The Ligne 2 is lacquered in a gradation of orange and yellow, with the logo of the prestigious Montecristo cigar brand stamped in gold on one side, while the other features a golden sun and moon motif. Features a soft yellow double flame. Associated lighter stone: black (REF 900601) Associated gas refill: red (REF 900435) Lighter delivered empty of gas, refill sold separately.` },
    collection: `Montecristo`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-montecristo/C16036.webp`,
    variants: [
      { sku: `C16036`, name: { pt: `Ligne 2 · Montecristo — Laranja`, en: `Ligne 2 · Montecristo — Orange` }, priceCents: 140000, currency: "EUR", attributes: { color: { label: { pt: `Laranja`, en: `Orange` }, hex: ["#c8a24a"] } }, image: `/products/ligne-2-montecristo/C16036.webp`, images: [`/products/ligne-2-montecristo/C16036.webp`, `/products/ligne-2-montecristo/C16036-2.webp`, `/products/ligne-2-montecristo/C16036-3.webp`, `/products/ligne-2-montecristo/C16036-4.webp`] },
    ],
  },
  {
    slug: `ligne-2-montecristo-la-nuit`,
    name: { pt: `Ligne 2 · Montecristo · La Nuit`, en: `Ligne 2 · Montecristo · La Nuit` },
    description: { pt: `O Ligne 2 é lacado em degradé azul; na frente, o logótipo da prestigiada marca de charutos Montecristo está estampado a prata numa das faces, enquanto a outra face apresenta uma decoração prateada de sol e lua. Dupla chama suave e ajustável. A colecção inclui mais 2 isqueiros: Le Grand Dupont e um Maxijet. Também duas canetas da colecção Line D Large e acessórios: um estojo em couro para três charutos, um grande cinzeiro, um corta-charutos e um par de botões de punho.`, en: `The Line 2 is lacquered with a blue gradient, on the front the logo of the prestigious cigar brand Montecristo is stamped in silver on one of the faces, while the other face presents a silver decoration of sun and moon. Soft and adjustable double flame. The collection includes 2 other lighters: Grand Dupont and a Maxijet. Also, two pens from the Line D Large collection and accessories: a leather case for three cigars, a large ashtray, a cigar cutter and a pair of cufflinks.` },
    collection: `Montecristo · La Nuit`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-montecristo-la-nuit/C16035.webp`,
    variants: [
      { sku: `C16035`, name: { pt: `Ligne 2 · Montecristo · La Nuit — Azul-escuro`, en: `Ligne 2 · Montecristo · La Nuit — Dark Blue` }, priceCents: 140000, currency: "EUR", attributes: { color: { label: { pt: `Azul-escuro`, en: `Dark Blue` }, hex: ["#1f3c66"] } }, image: `/products/ligne-2-montecristo-la-nuit/C16035.webp`, images: [`/products/ligne-2-montecristo-la-nuit/C16035.webp`, `/products/ligne-2-montecristo-la-nuit/C16035-2.webp`, `/products/ligne-2-montecristo-la-nuit/C16035-3.webp`, `/products/ligne-2-montecristo-la-nuit/C16035-4.webp`] },
    ],
  },
  {
    slug: `slimmy-3`,
    name: { pt: `Slimmy`, en: `Slimmy` },
    description: { pt: `Inspirado nos arquivos da Maison, o Slimmy ecoa o icónico Ligne 2 e o icónico Slim 7, o isqueiro de luxo mais fino do mundo. Cuidadosamente concebido em laca azul brilhante. A leveza (66 g) e a finura (9 mm) deste isqueiro proporcionam uma pega perfeita e permitem que deslize facilmente para qualquer bolso ou mala. A sua chama maçarico garante uma experiência única, oferecendo uma ignição eficiente em qualquer circunstância. Intemporal e dotado do savoir-faire da laca e do guillochage, o Slimmy está disponível em crómio, dourado e laca (azul-céu, coral, azul-escuro, preto, branco). Recarga de gás associada: preta (REF 000430)`, en: `Inspired by the House archives, Slimmy echoes the iconic Line 2 and the iconic Slim 7, the world's thinnest luxury lighter. Carefully designed in glossy blue lacquer. The lightness (66g) and thinness (9mm) of this lighter provide a perfect grip and allow it to be easily slipped into any pocket or bag. Its torch flame guarantees a unique experience providing efficient ignition in any circumstance. Timeless and featuring the know-how of lacquer and guillochage, Slimmy is available in chrome, gold and lacquer (sky blue, coral, dark blue, black, white). Gas refill associated: black (REF 000430)` },
    collection: `Slimmy`,
    categorySlug: "isqueiros",
    image: `/products/slimmy-3/028007.webp`,
    variants: [
      { sku: `028007`, name: { pt: `Slimmy — Azul Turquesa`, en: `Slimmy — Turquoise Blue` }, priceCents: 29000, currency: "EUR", attributes: { color: { label: { pt: `Azul Turquesa`, en: `Turquoise Blue` }, hex: ["#1f3c66"] } }, image: `/products/slimmy-3/028007.webp`, images: [`/products/slimmy-3/028007.webp`, `/products/slimmy-3/028007-2.webp`, `/products/slimmy-3/028007-3.webp`, `/products/slimmy-3/028007-4.webp`] },
      { sku: `028075`, name: { pt: `Slimmy — Red`, en: `Slimmy — Red` }, priceCents: 32000, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/slimmy-3/028075.webp`, images: [`/products/slimmy-3/028075.webp`, `/products/slimmy-3/028075-2.webp`, `/products/slimmy-3/028075-3.webp`, `/products/slimmy-3/028075-4.webp`] },
      { sku: `028076`, name: { pt: `Slimmy — Black`, en: `Slimmy — Black` }, priceCents: 32000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/slimmy-3/028076.webp`, images: [`/products/slimmy-3/028076.webp`, `/products/slimmy-3/028076-2.webp`, `/products/slimmy-3/028076-3.webp`, `/products/slimmy-3/028076-4.webp`] },
    ],
  },
  {
    slug: `biggy-3`,
    name: { pt: `Biggy`, en: `Biggy` },
    description: { pt: `Ligado à herança da Maison, conjugando a elegância do Ligne 2 com a potência do Megajet, o Big D encantará os apreciadores de charutos que procuram desempenho e um design de luxo. Cuidadosamente concebido em laca azul brilhante. Equipado com uma potente chama maçarico de 2 cm, o Big D assegura uma ignição excepcional em qualquer ocasião. Este modelo está disponível nos mesmos acabamentos do Slimmy: crómio, dourado, guilloché ponta de diamante ou laca (azul-escuro e preto). Recarga de gás associada: preta (REF 000430)`, en: `Linked to the heritage of the House, combining the elegance of Line 2 with the power of the Megajet, Big D will delight cigar lovers looking for performance and luxurious design. Carefully designed in glossy blue lacquer. Equipped with a powerful 2 cm torch flame, Big D ensures exceptional ignition on any occasion. This model is available in the same finishes as the Slimmy: chrome, gold, guilloche diamond tip or lacquer (dark blue and black). Gas refill associated: black (REF 000430)` },
    collection: `Biggy`,
    categorySlug: "isqueiros",
    image: `/products/biggy-3/025005.webp`,
    variants: [
      { sku: `025005`, name: { pt: `Biggy — Azul & Azul Índigo`, en: `Biggy — Blue & Indigo Blue` }, priceCents: 38000, currency: "EUR", attributes: { color: { label: { pt: `Azul & Azul Índigo`, en: `Blue & Indigo Blue` }, hex: ["#1f3c66"] } }, image: `/products/biggy-3/025005.webp`, images: [`/products/biggy-3/025005.webp`, `/products/biggy-3/025005-2.webp`, `/products/biggy-3/025005-3.webp`, `/products/biggy-3/025005-4.webp`] },
    ],
  },
  {
    slug: `maxijet-dragon-2`,
    name: { pt: `Maxijet · Dragon`, en: `Maxijet · Dragon` },
    description: { pt: `Isqueiro Maxijet em laca brilhante Bordéus e acabamento dourado. Recargas associadas: Preta (REF 000430)`, en: `Maxijet Lighter in glossy Bordeaux lacquer and golden finish. Associated refills: Black (REF 000430)` },
    collection: `Dragon`,
    categorySlug: "isqueiros",
    image: `/products/maxijet-dragon-2/020174.webp`,
    variants: [
      { sku: `020174`, name: { pt: `Maxijet · Dragon — Bordô`, en: `Maxijet · Dragon — Burgundy` }, priceCents: 22000, currency: "EUR", attributes: { color: { label: { pt: `Bordô`, en: `Burgundy` }, hex: ["#7d2b27"] } }, image: `/products/maxijet-dragon-2/020174.webp`, images: [`/products/maxijet-dragon-2/020174.webp`, `/products/maxijet-dragon-2/020174-2.webp`, `/products/maxijet-dragon-2/020174-3.webp`, `/products/maxijet-dragon-2/020174-4.webp`] },
      { sku: `020173`, name: { pt: `Maxijet · Dragon — Azul Real`, en: `Maxijet · Dragon — Royal Blue` }, priceCents: 22000, currency: "EUR", attributes: { color: { label: { pt: `Azul Real`, en: `Royal Blue` }, hex: ["#1f3c66"] } }, image: `/products/maxijet-dragon-2/020173.webp`, images: [`/products/maxijet-dragon-2/020173.webp`, `/products/maxijet-dragon-2/020173-2.webp`, `/products/maxijet-dragon-2/020173-3.webp`, `/products/maxijet-dragon-2/020173-4.webp`] },
    ],
  },
  {
    slug: `slim-7-dragon-2`,
    name: { pt: `Slim 7 · Dragon`, en: `Slim 7 · Dragon` },
    description: { pt: `Isqueiro Slim 7 em laca brilhante cor de mel com acabamento dourado. Recargas associadas: Preta (REF 000430)`, en: `Slim 7 Shiny Lacquer Honey Lighter with Gold Finish. Associated Refills: Black (REF 000430)` },
    collection: `Dragon`,
    categorySlug: "isqueiros",
    image: `/products/slim-7-dragon-2/027775.webp`,
    variants: [
      { sku: `027775`, name: { pt: `Slim 7 · Dragon — Mel`, en: `Slim 7 · Dragon — Honey` }, priceCents: 20500, currency: "EUR", attributes: { color: { label: { pt: `Mel`, en: `Honey` }, hex: ["#7a7d83"] } }, image: `/products/slim-7-dragon-2/027775.webp`, images: [`/products/slim-7-dragon-2/027775.webp`, `/products/slim-7-dragon-2/027775-2.webp`, `/products/slim-7-dragon-2/027775-3.webp`, `/products/slim-7-dragon-2/027775-4.webp`] },
    ],
  },
  {
    slug: `minijet-2`,
    name: { pt: `Minijet`, en: `Minijet` },
    description: { pt: `O Minijet é um isqueiro compacto e moderno, perfeito para o uso diário. Com a sua potente chama maçarico azul e pega ergonómica, oferece estilo e funcionalidade a todo o momento.`, en: `The Minijet is a compact, modern lighter that's perfect for everyday use. With its powerful blue torch flame and ergonomic grip, it offers style and practicality at all times.` },
    collection: `Minijet`,
    categorySlug: "isqueiros",
    image: `/products/minijet-2/010811.webp`,
    variants: [
      { sku: `010811`, name: { pt: `Minijet — Azul-escuro`, en: `Minijet — Dark Blue` }, priceCents: 15000, currency: "EUR", attributes: { color: { label: { pt: `Azul-escuro`, en: `Dark Blue` }, hex: ["#1f3c66"] } }, image: `/products/minijet-2/010811.webp`, images: [`/products/minijet-2/010811.webp`, `/products/minijet-2/010811-2.webp`, `/products/minijet-2/010811-3.webp`, `/products/minijet-2/010811-4.webp`] },
    ],
  },
  {
    slug: `biggy-padron`,
    name: { pt: `Biggy · Padrón`, en: `Biggy · Padrón` },
    description: { pt: `Por ocasião do 60.º aniversário da Maison Padrón, a S.T. Dupont anuncia uma colaboração especial. A colecção S.T. Dupont x Padrón oferece isqueiros e acessórios para charutos distintivos. Os seus acabamentos em ouro amarelo encarnam a vitola do charuto Padrón, e a sua laca castanha remete para a cor da folha de capa, a folha de tabaco que envolve o blend do charuto. Isqueiro Biggy com laca castanha mate e acabamentos dourados. Equipado com chama maçarico de 2 cm. O isqueiro é entregue sem gás, recarga vendida em separado.`, en: `On the occasion of the 60th anniversary of the Padrón house, S.T. Dupont announces a special collaboration. The S.T. Dupont x Padrón collection offers distinctive lighters and cigar accessories. Its yellow gold finishes embody the Padrón cigar band, and its brown lacquer refers to the color of their wrapper leaf, the tobacco leaf that wraps a cigar blend. Biggy lighter with matte brown lacquer and gold finishes. Equipped with a 2cm torch flame. The lighter is delivered without gas, refill sold separately.` },
    collection: `Padrón`,
    categorySlug: "isqueiros",
    image: `/products/biggy-padron/025014.webp`,
    variants: [
      { sku: `025014`, name: { pt: `Biggy · Padrón — Castanho`, en: `Biggy · Padrón — Brown` }, priceCents: 39000, currency: "EUR", attributes: { color: { label: { pt: `Castanho`, en: `Brown` }, hex: ["#6b4a2a"] } }, image: `/products/biggy-padron/025014.webp`, images: [`/products/biggy-padron/025014.webp`, `/products/biggy-padron/025014-2.webp`, `/products/biggy-padron/025014-3.webp`, `/products/biggy-padron/025014-4.webp`] },
    ],
  },
  {
    slug: `ligne-2-joker`,
    name: { pt: `Ligne 2 · joker`, en: `Ligne 2 · joker` },
    description: { pt: `A S.T. Dupont anuncia uma colaboração especial com Joker e Harley Quinn. A colecção inspira-se nas duas icónicas personagens da DC Comics e nos seus traços distintivos, incluindo um isqueiro e uma caneta impregnados do seu universo único. Isqueiro Ligne 2 Cling Joker ornamentado com um design representando a personagem da DC COMICS, acabamento em paládio. Equipado com dupla chama amarela e o famoso «Cling» na abertura. Isqueiro numerado. Pedra associada: preta (REF 900601). Recarga de gás associada: vermelha (REF 900435). Isqueiro entregue sem gás, recarga vendida em separado.`, en: `S.T. Dupont announces a special collaboration featuring Joker and Harley Quinn. The collection is inspired by the two iconic DC Comics characters and their distinctive traits, including a lighter and pen infused with their unique universe. Ligne 2 Cling Joker lighter adorned with a design representing the DC COMICS character, palladium finish. Equipped with a double yellow flame and the famous 'Cling' sound upon opening. Numbered lighter. Associated flint: black (REF 900601= Associated gas refill: red (REF 900435) Lighter delivered empty, gas refill sold separately` },
    collection: `joker`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-joker/C16695.webp`,
    variants: [
      { sku: `C16695`, name: { pt: `Ligne 2 · joker — Prateado`, en: `Ligne 2 · joker — Silver` }, priceCents: 170000, currency: "EUR", attributes: { color: { label: { pt: `Prateado`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/ligne-2-joker/C16695.webp`, images: [`/products/ligne-2-joker/C16695.webp`, `/products/ligne-2-joker/C16695-2.webp`, `/products/ligne-2-joker/C16695-3.webp`, `/products/ligne-2-joker/C16695-4.webp`] },
    ],
  },
  {
    slug: `ligne-2-harley-quinn`,
    name: { pt: `Ligne 2 · harley-quinn`, en: `Ligne 2 · harley-quinn` },
    description: { pt: `A S.T. Dupont anuncia uma colaboração especial com Joker e Harley Quinn. A colecção inspira-se nas duas icónicas personagens da DC Comics e nos seus traços distintivos, incluindo um isqueiro e uma caneta impregnados do seu universo único. Isqueiro Ligne 2 Cling Harley Quinn ornamentado com um design representando a personagem da DC COMICS, acabamento dourado. Equipado com dupla chama amarela e o famoso «Cling» na abertura. Isqueiro numerado. Pedra associada: preta (REF 900601). Recarga de gás associada: vermelha (REF 900435). Isqueiro entregue sem gás, recarga vendida em separado.`, en: `S.T. Dupont announces a special collaboration featuring Joker and Harley Quinn. The collection is inspired by the two iconic DC Comics characters and their distinctive traits, including a lighter and pen infused with their unique universe. Ligne 2 Cling Harley Quinn lighter adorned with a design representing the DC COMICS character, gold finish. Equipped with a double yellow flame and the famous 'Cling' sound upon opening. Numbered lighter. Associated flint: black (REF 900601= Associated gas refill: red (REF 900435) Lighter delivered empty, gas refill sold separately` },
    collection: `harley-quinn`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-harley-quinn/C16696.webp`,
    variants: [
      { sku: `C16696`, name: { pt: `Ligne 2 · harley-quinn — Dourado`, en: `Ligne 2 · harley-quinn — Golden` }, priceCents: 170000, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/ligne-2-harley-quinn/C16696.webp`, images: [`/products/ligne-2-harley-quinn/C16696.webp`, `/products/ligne-2-harley-quinn/C16696-2.webp`, `/products/ligne-2-harley-quinn/C16696-3.webp`, `/products/ligne-2-harley-quinn/C16696-4.webp`] },
    ],
  },
  {
    slug: `ligne-2-4`,
    name: { pt: `Ligne 2`, en: `Ligne 2` },
    description: { pt: `Para celebrar o Ano Novo Chinês, a S.T. Dupont imagina uma colecção inspirada na serpente, o signo astrológico do ano de 2025. Esta colecção apresenta um padrão de guilloché único que evoca as escamas do animal, realçado por um meticuloso trabalho de laca. Uma vez mais, a Maison demonstra a audácia, a sofisticação e o savoir-faire que a distinguem. Isqueiro Ligne 2 Cling com guilloché sob laca com motivo Snake preto, acabamentos em ouro amarelo. Equipado com dupla chama amarela e o famoso «Cling» na abertura. Pedra de isqueiro associada: preta (REF 900601). Recarga de gás associada: vermelha (REF 900435). Isqueiro entregue sem gás, recargas vendidas em separado.`, en: `To celebrate the Chinese New Year, S.T. Dupont imagines a collection inspired by the snake, the astrological sign of the year 2025. This collection showcases a unique guilloché pattern evoking the animal's scales, enhanced by meticulous lacquer work. Once again, the house demonstrates the audacity, sophistication, and craftsmanship that set it apart. Lighter Ligne 2 Cling guilloché under lacquer with black Snake motif, yellow gold finishes. Equipped with a double yellow flame and the famous 'Cling' sound upon opening. Associated flint stone: black (REF 900601) Associated gas refill: red (REF 900435) Lighter delivered empty of gas, refills sold separately` },
    collection: `Ligne 2`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-4/C16075.webp`,
    variants: [
      { sku: `C16075`, name: { pt: `Ligne 2 — Red`, en: `Ligne 2 — Red` }, priceCents: 155000, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/ligne-2-4/C16075.webp`, images: [`/products/ligne-2-4/C16075.webp`, `/products/ligne-2-4/C16075-2.webp`, `/products/ligne-2-4/C16075-3.webp`, `/products/ligne-2-4/C16075-4.webp`] },
      { sku: `C16076`, name: { pt: `Ligne 2 — Preto`, en: `Ligne 2 — Black` }, priceCents: 150000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/ligne-2-4/C16076.webp`, images: [`/products/ligne-2-4/C16076.webp`, `/products/ligne-2-4/C16076-2.webp`, `/products/ligne-2-4/C16076-3.webp`, `/products/ligne-2-4/C16076-4.webp`] },
    ],
  },
  {
    slug: `slim-7-2`,
    name: { pt: `Slim 7`, en: `Slim 7` },
    description: { pt: `Para celebrar o Ano Novo Chinês, a S.T. Dupont imagina uma colecção inspirada na serpente, o signo astrológico do ano de 2025. Esta colecção apresenta um padrão de guilloché único que evoca as escamas do animal, realçado por um meticuloso trabalho de laca. Uma vez mais, a Maison demonstra a audácia, a sofisticação e o savoir-faire que a distinguem. Isqueiro Slim 7, com guilloché de motivo Snake preto, acabamento dourado. Equipado com chama maçarico. Recarga de gás associada: preta (REF 900430). Isqueiro entregue sem gás, recargas vendidas em separado.`, en: `To celebrate the Chinese New Year, S.T. Dupont imagines a collection inspired by the snake, the astrological sign of the year 2025. This collection showcases a unique guilloché pattern evoking the animal's scales, enhanced by meticulous lacquer work. Once again, the house demonstrates the audacity, sophistication, and craftsmanship that set it apart. Slim 7 Lighter, guilloché with black Snake motif, gold finish. Equipped with a torch flame. Associated gas refill: black (REF 900430) Lighter delivered empty of gas, refills sold separately` },
    collection: `Slim 7`,
    categorySlug: "isqueiros",
    image: `/products/slim-7-2/027075.webp`,
    variants: [
      { sku: `027075`, name: { pt: `Slim 7 — Red`, en: `Slim 7 — Red` }, priceCents: 23500, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/slim-7-2/027075.webp`, images: [`/products/slim-7-2/027075.webp`, `/products/slim-7-2/027075-2.webp`, `/products/slim-7-2/027075-3.webp`, `/products/slim-7-2/027075-4.webp`] },
      { sku: `027076`, name: { pt: `Slim 7 — Black`, en: `Slim 7 — Black` }, priceCents: 23500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/slim-7-2/027076.webp`, images: [`/products/slim-7-2/027076.webp`, `/products/slim-7-2/027076-2.webp`, `/products/slim-7-2/027076-3.webp`, `/products/slim-7-2/027076-4.webp`] },
    ],
  },
  {
    slug: `biggy-fire-x-2`,
    name: { pt: `Biggy · Fire X`, en: `Biggy · Fire X` },
    description: { pt: `Inspirada na X-Bag, uma das malas da colecção de marroquinaria desenvolvida esta temporada pela S.T. Dupont, Fire X oferece a sua reinterpretação da icónica ponta de chama sobre os clássicos da Maison. Isqueiro Biggy Fire X decorado em laca preta e acabamentos em crómio. Apresenta uma chama maçarico de 2 cm. Recarga de gás associada: preta (REF 900430). Isqueiro entregue sem gás, recarga vendida em separado.`, en: `Inspired by the X-Bag, one of the bags from the leather goods collection developed this season by S.T. Dupont, Fire X offers its reinterpretation of the iconic flame tip on the classics of the House. Biggy Fire X lighter decorated with black lacquer and chrome finishes. Featuring a 2cm torch flame. Associated gas refill: black (REF 900430) Lighter delivered empty of gas, refill sold separately.` },
    collection: `Fire X`,
    categorySlug: "isqueiros",
    image: `/products/biggy-fire-x-2/025277.webp`,
    variants: [
      { sku: `025277`, name: { pt: `Biggy · Fire X — Preto`, en: `Biggy · Fire X — Black` }, priceCents: 39000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/biggy-fire-x-2/025277.webp`, images: [`/products/biggy-fire-x-2/025277.webp`, `/products/biggy-fire-x-2/025277-2.webp`, `/products/biggy-fire-x-2/025277-3.webp`, `/products/biggy-fire-x-2/025277-4.webp`] },
    ],
  },
  {
    slug: `slimmy-fire-x`,
    name: { pt: `Slimmy · Fire X`, en: `Slimmy · Fire X` },
    description: { pt: `Inspirada na X-Bag, uma das malas da colecção de marroquinaria desenvolvida esta temporada pela S.T. Dupont, Fire X oferece a sua reinterpretação da icónica ponta de chama sobre os clássicos da Maison. Isqueiro Slimmy Fire X decorado em laca preta e acabamentos em crómio. Apresenta uma chama maçarico. Recarga de gás associada: preta (REF 900430). Isqueiro entregue sem gás, recarga vendida em separado.`, en: `Inspired by the X-Bag, one of the bags from the leather goods collection developed this season by S.T. Dupont, Fire X offers its reinterpretation of the iconic flame tip on the classics of the House. Slimmy Fire X lighter decorated with black lacquer and chrome finishes. Featuring a torch flame. Associated gas refill: black (REF 900430) Lighter delivered empty of gas, refill sold separately.` },
    collection: `Fire X`,
    categorySlug: "isqueiros",
    image: `/products/slimmy-fire-x/028277.webp`,
    variants: [
      { sku: `028277`, name: { pt: `Slimmy · Fire X — Preto`, en: `Slimmy · Fire X — Black` }, priceCents: 32000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/slimmy-fire-x/028277.webp`, images: [`/products/slimmy-fire-x/028277.webp`, `/products/slimmy-fire-x/028277-2.webp`, `/products/slimmy-fire-x/028277-3.webp`, `/products/slimmy-fire-x/028277-4.webp`] },
    ],
  },
  {
    slug: `ligne-2-cohiba-behike`,
    name: { pt: `Ligne 2 · Cohiba-Behike`, en: `Ligne 2 · Cohiba-Behike` },
    description: { pt: `Para celebrar o 15.º aniversário da Línea Behike, a S.T. Dupont uniu-se à Cohiba numa colecção exclusiva de isqueiros e acessórios. Inspirada nos códigos emblemáticos da Behike, conjuga xadrez a preto e branco, acabamentos dourados e uma laca preta profunda. A efígie «Behike», revisitada pelos artífices ourives da S.T. Dupont, sublima esta colaboração única, uma homenagem ao savoir-faire e à excelência de ambas as casas. Isqueiro Ligne 2 Cling em laca de alto brilho, gravado com o motivo Behike, atributos brilhantes, gatilho mate. Apresenta uma dupla chama amarela e a famosa abertura «Cling». Pedra de isqueiro associada: preta (REF 900601). Recarga de gás associada: vermelha (REF 900435). Isqueiro entregue sem gás, recarga vendida em separado.`, en: `To celebrate the 15th anniversary of Línea Behike, S.T. Dupont has teamed up with Cohiba for an exclusive collection of lighters and accessories. Inspired by Behike's emblematic codes, it combines black and white checks, gold finishes and deep black lacquer. The “Behike” effigy, revisited by the goldsmiths at S.T. Dupont goldsmiths, sublimates this unique collaboration, a tribute to the know-how and excellence of both houses. Ligne 2 Cling lighter in high-gloss lacquer, engraved with the Behike motif, high-gloss attributes, matte driver. Featuring a double yellow flame and the famous “”Cling“” opening. Associated lighter stone: black (REF 900601) Associated gas refill: red (REF 900435) Lighter delivered empty of gas, refill sold separately` },
    collection: `Cohiba-Behike`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-cohiba-behike/C16003CL.webp`,
    variants: [
      { sku: `C16003CL`, name: { pt: `Ligne 2 · Cohiba-Behike — Preto`, en: `Ligne 2 · Cohiba-Behike — Black` }, priceCents: 160000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/ligne-2-cohiba-behike/C16003CL.webp`, images: [`/products/ligne-2-cohiba-behike/C16003CL.webp`, `/products/ligne-2-cohiba-behike/C16003CL-2.webp`, `/products/ligne-2-cohiba-behike/C16003CL-3.webp`, `/products/ligne-2-cohiba-behike/C16003CL-4.webp`] },
    ],
  },
  {
    slug: `le-grand-dupont-cohiba-behike`,
    name: { pt: `Le Grand Dupont · Cohiba-Behike`, en: `Le Grand Dupont · Cohiba-Behike` },
    description: { pt: `Para celebrar o 15.º aniversário da Línea Behike, a S.T. Dupont uniu-se à Cohiba numa colecção exclusiva de isqueiros e acessórios. Inspirada nos códigos emblemáticos da Behike, conjuga xadrez a preto e branco, acabamentos dourados e uma laca preta profunda. A efígie «Behike», revisitada pelos artífices ourives da S.T. Dupont, sublima esta colaboração única, uma homenagem ao savoir-faire e à excelência de ambas as casas. Isqueiro Le Grand Dupont em laca de alto brilho, decorado com o motivo Behike em acabamento dourado. Apresenta um sistema de dupla ignição com chama amarela ou azul. Pedra de isqueiro associada: vermelha (REF 900651). Recarga de gás associada: vermelha (REF 900435). Isqueiro entregue sem gás, recarga vendida em separado. Chave de fendas incluída para trocar a pedra.`, en: `To celebrate the 15th anniversary of Línea Behike, S.T. Dupont has teamed up with Cohiba for an exclusive collection of lighters and accessories. Inspired by Behike's emblematic codes, it combines black and white checks, gold finishes and deep black lacquer. The “Behike” effigy, revisited by the goldsmiths at S.T. Dupont goldsmiths, sublimates this unique collaboration, a tribute to the know-how and excellence of both houses. Le Grand Dupont lighter in high-gloss lacquer, decorated with the Behike motif in gold finish. Featuring a dual ignition system with yellow or blue flame. Associated lighter stone: red (REF 900651) Associated gas refill: red (REF 900435) Lighter delivered empty of gas, refill sold separately. Screwdriver included to change the flint` },
    collection: `Cohiba-Behike`,
    categorySlug: "isqueiros",
    image: `/products/le-grand-dupont-cohiba-behike/C23003CL.webp`,
    variants: [
      { sku: `C23003CL`, name: { pt: `Le Grand Dupont · Cohiba-Behike — Preto`, en: `Le Grand Dupont · Cohiba-Behike — Black` }, priceCents: 180000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/le-grand-dupont-cohiba-behike/C23003CL.webp`, images: [`/products/le-grand-dupont-cohiba-behike/C23003CL.webp`, `/products/le-grand-dupont-cohiba-behike/C23003CL-2.webp`, `/products/le-grand-dupont-cohiba-behike/C23003CL-3.webp`, `/products/le-grand-dupont-cohiba-behike/C23003CL-4.webp`] },
    ],
  },
  {
    slug: `ligne-2-20000-leagues`,
    name: { pt: `Ligne 2 · 20,000 Leagues Under The Sea`, en: `Ligne 2 · 20,000 Leagues Under The Sea` },
    description: { pt: `Homenagem ao cativante universo de 20,000 Leagues Under The Sea, esta edição limitada expressa todo o savoir-faire da S.T. Dupont. Publicado em 1870, o romance narra a viagem de três náufragos capturados pelo Capitão Nemo, o misterioso inventor que percorre os fundos marinhos a bordo do Nautilus, um submarino muito à frente das tecnologias da sua época. Vigias, turbinas, corais, barbatanas e outros tentáculos de lulas gigantes inspiram esta edição limitada e as suas três gamas, todas relacionadas com diferentes capítulos do livro. Uma história em três actos em que mergulhar com paixão. Para a gama Premium desta edição 20,000 Leagues Under The Sea, a S.T. Dupont narra dois outros capítulos: «4000 léguas sob o Pacífico», capítulo 18 do livro, e «Gulf Stream», capítulo 19 da sua segunda parte. «4000 Léguas Sob o Pacífico» marca o momento em que o Nautilus alcança grandes profundidades e a sua tripulação descobre a imensidão do mundo subaquático, entre águas transparentes e abismos marinhos. Isqueiro Ligne 2 Cling com guilloché sob laca padrão «waves». Revestido em laca S.T. Dupont degradé turquesa. Tampa com guilloché padrão ondulado. Acabamento dourado. Equipado com dupla chama amarela e o famoso «Cling» na abertura. Pedra de isqueiro associada: preta (REF 900601). Recarga de gás associada: vermelha (REF 900435). Isqueiro entregue sem gás, recarga vendida em separado.`, en: `Tribute to the captivating universe of 20,000 leagues under the seas, this limited edition expresses all the know-how of S.T. Dupont. Published in 1870, the novel recounts the journey of three castaways captured by Captain Nemo, this mysterious inventor who travels the seabed aboard the Nautilus, submarine very ahead of the technologies of the time. Portholes, turbines, corals, fins and other tentacles of giant squid inspire this limited edition and its three ranges, all related to different chapters of the book. A story in three stages in which to dive with passion. For the Premium range of this edition 20,000 leagues under the seas, S.T. Dupont tells two other chapters: «4000 leagues under the Pacific», chapter 18 of the book, and «Gulf Stream», chapter 19 of its second part. "4000 Leagues Under the Pacific" marks the moment when the Nautilus reaches great depths and its crew discovers the immensity of the underwater world, between transparent waters and marine depths. Lighter Line 2 Cling guilloche under lacquered pattern 'waves'. Covered with S.T. Dupont turquoise gradient lacquer. Hat with guilloche vague pattern. Gold Finish. Equipped with a double yellow flame and the famous "Cling" at the opening. Associated lighter flint: black (REF 900601) Associated gas refill: red (REF 900435) Lighter delivered empty of gas, refill sold separately.` },
    collection: `20,000 Leagues Under The Sea`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-20000-leagues/C16052CL.webp`,
    variants: [
      { sku: `C16052CL`, name: { pt: `Ligne 2 · 20,000 Leagues Under The Sea — Verde Pacífico`, en: `Ligne 2 · 20,000 Leagues Under The Sea — Green Pacific` }, priceCents: 171500, currency: "EUR", attributes: { color: { label: { pt: `Verde Pacífico`, en: `Green Pacific` }, hex: ["#3b5d39"] } }, image: `/products/ligne-2-20000-leagues/C16052CL.webp`, images: [`/products/ligne-2-20000-leagues/C16052CL.webp`, `/products/ligne-2-20000-leagues/C16052CL-2.webp`, `/products/ligne-2-20000-leagues/C16052CL-3.webp`, `/products/ligne-2-20000-leagues/C16052CL-4.webp`] },
    ],
  },
  {
    slug: `biggy-20000-leagues`,
    name: { pt: `Biggy · 20,000 Leagues Under The Sea`, en: `Biggy · 20,000 Leagues Under The Sea` },
    description: { pt: `Homenagem ao cativante universo de 20,000 Leagues Under The Sea, esta edição limitada expressa todo o savoir-faire da S.T. Dupont. Publicado em 1870, o romance narra a viagem de três náufragos capturados pelo Capitão Nemo, o misterioso inventor que percorre os fundos marinhos a bordo do Nautilus, um submarino muito à frente das tecnologias da sua época. Vigias, turbinas, corais, barbatanas e outros tentáculos de lulas gigantes inspiram esta edição limitada e as suas três gamas, todas relacionadas com diferentes capítulos do livro. Uma história em três actos em que mergulhar com paixão. «Vanikoro» recebe o nome do seu padrão «corais». No capítulo com o mesmo nome, o Capitão Nemo e os seus três companheiros atracam na ilha de Vanikoro, rodeados por uma incrível barreira de coral. Isqueiro Biggy em laca azul brilhante, com a decoração Vanikoro. Acabamento em crómio. Equipado com chama maçarico azul de 2 cm, ideal para acender velas ou cigarros. Recarga de gás associada: preta (REF 900430). Isqueiro entregue sem gás, recarga vendida em separado.`, en: `Tribute to the captivating universe of 20,000 leagues under the seas, this limited edition expresses all the know-how of S.T. Dupont. Published in 1870, the novel recounts the journey of three castaways captured by Captain Nemo, this mysterious inventor who travels the seabed aboard the Nautilus, submarine very ahead of the technologies of the time. Portholes, turbines, corals, fins and other tentacles of giant squid inspire this limited edition and its three ranges, all related to different chapters of the book. A story in three stages in which to dive with passion. 'Vanikoro' is named after its pattern 'corals'. In the chapter of the same name, Captain Nemo and his three companions dock on the island of Vanikoro, surrounded by an incredible barrier reef. Briquet Biggy in shiny blue lacquer, with the Vanikoro decoration. Chrome finish. Equipped with a 2 cm blue torch flame, ideal for lighting candles or cigarettes. Associated gas refill: black (REF 900430) Lighter delivered empty of gas, refill sold separately.` },
    collection: `20,000 Leagues Under The Sea`,
    categorySlug: "isqueiros",
    image: `/products/biggy-20000-leagues/025053.webp`,
    variants: [
      { sku: `025053`, name: { pt: `Biggy · 20,000 Leagues Under The Sea — Azul Real`, en: `Biggy · 20,000 Leagues Under The Sea — Royal Blue` }, priceCents: 39000, currency: "EUR", attributes: { color: { label: { pt: `Azul Real`, en: `Royal Blue` }, hex: ["#1f3c66"] } }, image: `/products/biggy-20000-leagues/025053.webp`, images: [`/products/biggy-20000-leagues/025053.webp`, `/products/biggy-20000-leagues/025053-2.webp`, `/products/biggy-20000-leagues/025053-3.webp`, `/products/biggy-20000-leagues/025053-4.webp`] },
    ],
  },
  {
    slug: `ligne-1-romeo-y-julieta`,
    name: { pt: `Ligne-1 · Romeo-y-Julieta`, en: `Ligne-1 · Romeo-y-Julieta` },
    description: { pt: `Para celebrar o 150.º aniversário de Romeo y Julieta, a S.T. Dupont assina uma colaboração exclusiva inspirada na força da paixão e do savoir-faire. Uma homenagem à arte dos charutos de excepção e à beleza dos objectos intemporais. Isqueiro Ligne 1 Cling em laca branca brilhante Popote, decorado com um medalhão em acabamento dourado com motivo Romeo y Julieta. Tampa em guilloché vertical. Acabamento em ouro amarelo. Equipado com dupla chama amarela e o famoso «Cling» na abertura. Pedra de isqueiro associada: preta (REF 900601). Recarga de gás associada: vermelha (REF 900435). Isqueiro entregue sem gás, recarga vendida em separado.`, en: `To celebrate the 150th anniversary of Romeo and Julieta, S.T. Dupont signs an exclusive collaboration inspired by the strength of passion and expertise. A tribute to the art of exceptional cigars and the beauty of timeless objects. Lighter Line 1 Cling white lacquer shiny popote and decorated with a medallion in gold finish with Romeo y Julieta motif. Vertical guilloche hat. Yellow gold finish. Equipped with a double yellow flame and the famous "Cling" at the opening. Associated lighter flint: black (REF 900601) Associated gas refill: red (REF 900435) Lighter delivered empty of gas, refill sold separately.` },
    collection: `Romeo-y-Julieta`,
    categorySlug: "isqueiros",
    image: `/products/ligne-1-romeo-y-julieta/C14050CL.webp`,
    variants: [
      { sku: `C14050CL`, name: { pt: `Ligne-1 · Romeo-y-Julieta — Branco`, en: `Ligne-1 · Romeo-y-Julieta — White` }, priceCents: 130000, currency: "EUR", attributes: { color: { label: { pt: `Branco`, en: `White` }, hex: ["#efeae0"] } }, image: `/products/ligne-1-romeo-y-julieta/C14050CL.webp`, images: [`/products/ligne-1-romeo-y-julieta/C14050CL.webp`, `/products/ligne-1-romeo-y-julieta/C14050CL-2.webp`, `/products/ligne-1-romeo-y-julieta/C14050CL-3.webp`, `/products/ligne-1-romeo-y-julieta/C14050CL-4.webp`] },
    ],
  },
  {
    slug: `twiggy-romeo-y-julieta`,
    name: { pt: `Twiggy · Romeo-y-Julieta`, en: `Twiggy · Romeo-y-Julieta` },
    description: { pt: `Para celebrar o 150.º aniversário de Romeo y Julieta, a S.T. Dupont assina uma colaboração exclusiva inspirada na força da paixão e do savoir-faire. Uma homenagem à arte dos charutos de excepção e à beleza dos objectos intemporais. Isqueiro Twiggy em laca branca, com a decoração Romeo y Julieta em laca impressa. Acabamento dourado brilhante. Equipado com chama maçarico azul de 1 cm, ideal para acender velas ou cigarros. Recarga de gás associada: preta (REF 900430). Isqueiro entregue sem gás, recarga vendida em separado.`, en: `To celebrate the 150th anniversary of Romeo and Julieta, S.T. Dupont signs an exclusive collaboration inspired by the strength of passion and expertise. A tribute to the art of exceptional cigars and the beauty of timeless objects. Twiggy lighter in white lacquer, featuring the Romeo and Julieta decor in printed lacquer. Shiny gold finish. Equipped with a 1 cm blue torch flame, ideal for lighting candles or cigarettes. Associated gas refill: black (REF 900430) Lighter delivered empty of gas, refill sold separately.` },
    collection: `Romeo-y-Julieta`,
    categorySlug: "isqueiros",
    image: `/products/twiggy-romeo-y-julieta/030150.webp`,
    variants: [
      { sku: `030150`, name: { pt: `Twiggy · Romeo-y-Julieta — Branco`, en: `Twiggy · Romeo-y-Julieta — White` }, priceCents: 32500, currency: "EUR", attributes: { color: { label: { pt: `Branco`, en: `White` }, hex: ["#efeae0"] } }, image: `/products/twiggy-romeo-y-julieta/030150.webp`, images: [`/products/twiggy-romeo-y-julieta/030150.webp`, `/products/twiggy-romeo-y-julieta/030150-2.webp`, `/products/twiggy-romeo-y-julieta/030150-3.webp`, `/products/twiggy-romeo-y-julieta/030150-4.webp`] },
    ],
  },
  {
    slug: `le-grand-dupont-romeo-y-julieta`,
    name: { pt: `Le Grand Dupont · Romeo-y-Julieta`, en: `Le Grand Dupont · Romeo-y-Julieta` },
    description: { pt: `Para celebrar o 150.º aniversário de Romeo y Julieta, a S.T. Dupont assina uma colaboração exclusiva inspirada na força da paixão e do savoir-faire. Uma homenagem à arte dos charutos de excepção e à beleza dos objectos intemporais. Isqueiro Le Grand Dupont Cling em laca vermelha brilhante Popote, decorado com o medalhão em acabamento dourado com motivo Romeo y Julieta. Tampa em guilloché ponta de diamante. Acabamento em ouro amarelo. Equipado com sistema de dupla ignição para chama amarela ou azul. Pedra de isqueiro associada: vermelha (REF 900651). Recarga de gás associada: vermelha (REF 900435). Isqueiro entregue sem gás, recarga vendida em separado. Chave de fendas incluída para trocar a pedra.`, en: `To celebrate the 150th anniversary of Romeo and Julieta, S.T. Dupont signs an exclusive collaboration inspired by the strength of passion and expertise. A tribute to the art of exceptional cigars and the beauty of timeless objects. Lighter Le Grand Dupont Cling red lacquer shiny popote decorated with the medallion in gold finish pattern Romeo y Julieta. Diamond point guilloche hat. Yellow gold finish. Equipped with a double ignition system for yellow flame or blue flame. Associated lighter block: red (REF 900651) Associated gas refill: red (REF 900435) Lighter delivered empty of gas, refill sold separately. Screwdriver included to change the stone.` },
    collection: `Romeo-y-Julieta`,
    categorySlug: "isqueiros",
    image: `/products/le-grand-dupont-romeo-y-julieta/C23050CL.webp`,
    variants: [
      { sku: `C23050CL`, name: { pt: `Le Grand Dupont · Romeo-y-Julieta — Bordô`, en: `Le Grand Dupont · Romeo-y-Julieta — Burgundy` }, priceCents: 181500, currency: "EUR", attributes: { color: { label: { pt: `Bordô`, en: `Burgundy` }, hex: ["#7d2b27"] } }, image: `/products/le-grand-dupont-romeo-y-julieta/C23050CL.webp`, images: [`/products/le-grand-dupont-romeo-y-julieta/C23050CL.webp`, `/products/le-grand-dupont-romeo-y-julieta/C23050CL-2.webp`, `/products/le-grand-dupont-romeo-y-julieta/C23050CL-3.webp`, `/products/le-grand-dupont-romeo-y-julieta/C23050CL-4.webp`] },
    ],
  },
  {
    slug: `biggy-romeo-y-julieta`,
    name: { pt: `Biggy · Romeo-y-Julieta`, en: `Biggy · Romeo-y-Julieta` },
    description: { pt: `Para celebrar o 150.º aniversário de Romeo y Julieta, a S.T. Dupont assina uma colaboração exclusiva inspirada na força da paixão e do savoir-faire. Uma homenagem à arte dos charutos de excepção e à beleza dos objectos intemporais. Isqueiro Biggy em laca vermelha, com a decoração Romeo y Julieta em laca impressa. Acabamento dourado brilhante. Equipado com chama maçarico azul de 2 cm, ideal para acender velas ou cigarros. Recarga de gás associada: preta (REF 900430). Isqueiro entregue sem gás, recarga vendida em separado.`, en: `To celebrate the 150th anniversary of Romeo and Julieta, S.T. Dupont signs an exclusive collaboration inspired by the strength of passion and expertise. A tribute to the art of exceptional cigars and the beauty of timeless objects. Briquet Biggy in red lacquer, featuring the Romeo and Julieta decor in printed lacquer. Shiny gold finish. Equipped with a 2 cm blue torch flame, ideal for lighting candles or cigarettes. Associated gas refill: black (REF 900430) Lighter delivered empty of gas, refill sold separately.` },
    collection: `Romeo-y-Julieta`,
    categorySlug: "isqueiros",
    image: `/products/biggy-romeo-y-julieta/025050.webp`,
    variants: [
      { sku: `025050`, name: { pt: `Biggy · Romeo-y-Julieta — Bordô`, en: `Biggy · Romeo-y-Julieta — Burgundy` }, priceCents: 39500, currency: "EUR", attributes: { color: { label: { pt: `Bordô`, en: `Burgundy` }, hex: ["#7d2b27"] } }, image: `/products/biggy-romeo-y-julieta/025050.webp`, images: [`/products/biggy-romeo-y-julieta/025050.webp`, `/products/biggy-romeo-y-julieta/025050-2.webp`, `/products/biggy-romeo-y-julieta/025050-3.webp`, `/products/biggy-romeo-y-julieta/025050-4.webp`] },
    ],
  },
  {
    slug: `slimmy-horse-mane`,
    name: { pt: `Slimmy · Horse Mane`, en: `Slimmy · Horse Mane` },
    description: { pt: `Por ocasião do Ano Novo Chinês de 2026, sob o signo do Cavalo de Fogo, a S.T. Dupont revela Horse, uma colecção flamejante que encarna o carisma, a majestade e a paixão. O guilloché «criniera» e a escultura equina evocam com elegância as tradições da cultura chinesa. Isqueiro Slimmy em laca vermelha de alto brilho, com o motivo «horse mane» e um Fire Horse dourado. Acabamento banhado a ouro. Equipado com chama maçarico azul de 2 cm, ideal para acender velas ou cigarros. Isqueiro entregue sem gás; recarga vendida em separado.`, en: `On the occasion of the 2026 Chinese New Year, under the sign of the Fire Horse, S.T. Dupont unveils Horse, a flamboyant collection embodying charisma, majesty, and passion. The “mane” guilloché and equine sculpture elegantly evoke the traditions of Chinese culture. Slimmy lighter in high-gloss red lacquer, featuring the “horse mane” motif with a golden Fire Horse. Gold-plated finish. Equipped with a 2 cm blue torch flame, ideal for lighting candles or cigarettes. Lighter delivered empty of gas; refill sold separately.` },
    collection: `Horse Mane`,
    categorySlug: "isqueiros",
    image: `/products/slimmy-horse-mane/028080.webp`,
    variants: [
      { sku: `028080`, name: { pt: `Slimmy · Horse Mane — Vermelho`, en: `Slimmy · Horse Mane — Red` }, priceCents: 33000, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/slimmy-horse-mane/028080.webp`, images: [`/products/slimmy-horse-mane/028080.webp`, `/products/slimmy-horse-mane/028080-2.webp`, `/products/slimmy-horse-mane/028080-3.webp`, `/products/slimmy-horse-mane/028080-4.webp`] },
    ],
  },
  {
    slug: `slim7-horse-mane`,
    name: { pt: `Slim7 · Horse Mane`, en: `Slim7 · Horse Mane` },
    description: { pt: `Por ocasião do Ano Novo Chinês de 2026, sob o signo do Cavalo de Fogo, a S.T. Dupont revela Horse, uma colecção flamejante que encarna o carisma, a majestade e a paixão. O guilloché «criniera» e a escultura equina evocam com elegância as tradições da cultura chinesa. Isqueiro Slim 7 em laca vermelha de alto brilho, com o motivo «horse mane» e um Fire Horse. Acabamento banhado a ouro. Equipado com chama maçarico azul de 2 cm, ideal para acender velas ou cigarros. Isqueiro entregue sem gás; recarga vendida em separado.`, en: `On the occasion of the 2026 Chinese New Year, under the sign of the Fire Horse, S.T. Dupont unveils Horse, a flamboyant collection embodying charisma, majesty, and passion. The “mane” guilloché and equine sculpture elegantly evoke the traditions of Chinese culture. Slim7 lighter in high-gloss red lacquer, featuring the “horse mane” motif with a Fire Horse. Gold-plated finish. Equipped with a 2 cm blue torch flame, ideal for lighting candles or cigarettes. Lighter delivered empty of gas; refill sold separately.` },
    collection: `Horse Mane`,
    categorySlug: "isqueiros",
    image: `/products/slim7-horse-mane/027080.webp`,
    variants: [
      { sku: `027080`, name: { pt: `Slim7 · Horse Mane — Vermelho`, en: `Slim7 · Horse Mane — Red` }, priceCents: 24000, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/slim7-horse-mane/027080.webp`, images: [`/products/slim7-horse-mane/027080.webp`, `/products/slim7-horse-mane/027080-2.webp`, `/products/slim7-horse-mane/027080-3.webp`, `/products/slim7-horse-mane/027080-4.webp`] },
    ],
  },
  {
    slug: `biggy-fuente`,
    name: { pt: `Biggy · Fuente`, en: `Biggy · Fuente` },
    description: { pt: `Isqueiro Biggy — Laca preta decorada com o monograma X multicolor e o brasão Opus X Fuente impresso. Acabamento dourado brilhante. Chama maçarico azul de 2 cm para velas ou cigarros. Recarga de gás preta (REF 900430). Entregue sem gás; recarga vendida em separado.`, en: `Biggy Lighter - Black lacquer decorated with the multicolor X monogram and printed Opus X Fuente crest. Shiny gold finish. 2 cm blue torch flame for candles or cigarettes. Gas refill black (REF 900430). Delivered empty; refill sold separately.` },
    collection: `Fuente`,
    categorySlug: "isqueiros",
    image: `/products/biggy-fuente/025060.webp`,
    variants: [
      { sku: `025060`, name: { pt: `Biggy · Fuente — Multicor`, en: `Biggy · Fuente — Multicolor` }, priceCents: 39500, currency: "EUR", attributes: { color: { label: { pt: `Multicor`, en: `Multicolor` }, hex: ["#c8a24a"] } }, image: `/products/biggy-fuente/025060.webp`, images: [`/products/biggy-fuente/025060.webp`, `/products/biggy-fuente/025060-2.webp`, `/products/biggy-fuente/025060-3.webp`, `/products/biggy-fuente/025060-4.webp`] },
    ],
  },
  {
    slug: `misc-dc-comics`,
    name: { pt: `Diverso · DC Comics`, en: `Misc · DC Comics` },
    description: { pt: `A S.T. Dupont revela o terceiro capítulo da sua colaboração com a DC COMICS através de uma colecção exclusiva inspirada em três figuras icónicas: Wonder Woman, Catwoman e The Penguin. A colecção transmite uma mensagem universal de justiça, liberdade e poder, elevada pelo savoir-faire da Maison em criações de excepção, tais como o isqueiro Ligne 2, a caneta Line D Eternity e, para personagens seleccionadas, um colar-isqueiro. Colar-isqueiro Catwoman ornamentado com uma decoração em laca preta com a personagem da DC COMICS. Tampa em guilloché ponta de diamante com acabamento preto mate. Apresenta uma chama amarela. Corrente amovível ajustável em três comprimentos diferentes: 80/85/90 cm. Recarga de gás associada: preta 000430. Isqueiro entregue sem gás, recarga vendida em separado.`, en: `S.T. Dupont unveils the third chapter of its collaboration with DC COMICS through an exclusive collection inspired by three iconic figures: Wonder Woman, Catwoman and The Penguin. The collection conveys a universal message of justice, freedom and power, elevated by the Maison’s savoir-faire in exceptional creations such as the Ligne 2 lighter, the Line D Eternity pen and, for selected characters, a Lighter Necklace. Catwoman Lighter Necklace adorned with a black lacquer decoration featuring the DC COMICS character. Diamond-point guilloché cap with a matte black finish. Features a yellow flame. Removable chain adjustable to three different lengths: 80/85/90 cm. Associated gas refill: black 000430 Lighter delivered empty of gas, refill sold separately.` },
    collection: `DC Comics`,
    categorySlug: "isqueiros",
    image: `/products/misc-dc-comics/K27220CH.webp`,
    variants: [
      { sku: `K27220CH`, name: { pt: `Misc · DC Comics — Preto`, en: `Misc · DC Comics — Black` }, priceCents: 38500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/misc-dc-comics/K27220CH.webp`, images: [`/products/misc-dc-comics/K27220CH.webp`, `/products/misc-dc-comics/K27220CH-2.webp`, `/products/misc-dc-comics/K27220CH-3.webp`, `/products/misc-dc-comics/K27220CH-4.webp`] },
    ],
  },
  {
    slug: `keyrings-fender`,
    name: { pt: `Porta-Chaves · Fender`, en: `Keyrings · Fender` },
    description: { pt: `Pela segunda vez, a S.T. Dupont e a Fender® unem-se para criar uma linha rock que conjuga o savoir-faire de ambas as casas. Este porta-chaves em forma de guitarra, em couro de vitela liso e lona, encarna a essência do mundo Fender® num acessório prático e audaz. A elegante e distintiva placa metálica Fender® presta homenagem ao universo musical da Fender®, conferindo simultaneamente um toque moderno a este modelo. Um acessório funcional e elegante, ideal para quem deseja levar consigo o espírito Fender® todos os dias.`, en: `For the second time, S.T. Dupont and Fender® are working together to create a rock line that combines the expertise of both companies. This guitar-shaped key ring in smooth calfskin and canvas embodies the essence of the Fender® world in a practical, bold accessory. The elegant, distinctive Fender® metal plate pays homage to the musical universe of Fender®, while adding a modern touch to this model. A functional yet stylish accessory, ideal for those who want to take the Fender® spirit with them every day.` },
    collection: `Fender`,
    categorySlug: "acessorios",
    image: `/products/keyrings-fender/1FE641BK1.webp`,
    variants: [
      { sku: `1FE641BK1`, name: { pt: `Keyrings · Fender — Preto`, en: `Keyrings · Fender — Black` }, priceCents: 13000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/keyrings-fender/1FE641BK1.webp`, images: [`/products/keyrings-fender/1FE641BK1.webp`, `/products/keyrings-fender/1FE641BK1-2.webp`] },
    ],
  },
  {
    slug: `cigar-case-3`,
    name: { pt: `Cigar-case`, en: `Cigar-case` },
    description: { pt: `Estojo simples para um charuto, em laranja e crómio. Máx. 24,5 mm.`, en: `Simple orange and chrome single cigar case. max 24.5 mm.` },
    collection: `Cigar-case`,
    categorySlug: "acessorios",
    image: `/products/cigar-case-3/183166.webp`,
    variants: [
      { sku: `183166`, name: { pt: `Cigar-case — Laranja`, en: `Cigar-case — Orange` }, priceCents: 18000, currency: "EUR", attributes: { color: { label: { pt: `Laranja`, en: `Orange` }, hex: ["#c8a24a"] } }, image: `/products/cigar-case-3/183166.webp`, images: [`/products/cigar-case-3/183166.webp`, `/products/cigar-case-3/183166-2.webp`, `/products/cigar-case-3/183166-3.webp`] },
    ],
  },
  {
    slug: `2-cigar-case-2`,
    name: { pt: `2 cigar case`, en: `2 cigar case` },
    description: { pt: `Estojo para 2 charutos, laranja com gravação dourada em relevo. Máx. 24,5 mm.`, en: `2-cigar case, orange with gold embossing. max 24.5 mm.` },
    collection: `2 cigar case`,
    categorySlug: "acessorios",
    image: `/products/2-cigar-case-2/183266.webp`,
    variants: [
      { sku: `183266`, name: { pt: `2 cigar case — Laranja`, en: `2 cigar case — Orange` }, priceCents: 22000, currency: "EUR", attributes: { color: { label: { pt: `Laranja`, en: `Orange` }, hex: ["#c8a24a"] } }, image: `/products/2-cigar-case-2/183266.webp`, images: [`/products/2-cigar-case-2/183266.webp`, `/products/2-cigar-case-2/183266-2.webp`, `/products/2-cigar-case-2/183266-3.webp`] },
      { sku: `183256`, name: { pt: `2 cigar case — Laranja`, en: `2 cigar case — Orange` }, priceCents: 23000, currency: "EUR", attributes: { color: { label: { pt: `Laranja`, en: `Orange` }, hex: ["#c8a24a"] } }, image: `/products/2-cigar-case-2/183256.webp`, images: [`/products/2-cigar-case-2/183256.webp`, `/products/2-cigar-case-2/183256-2.webp`, `/products/2-cigar-case-2/183256-3.webp`] },
    ],
  },
  {
    slug: `3-cigar-case-montecristo-la-nuit`,
    name: { pt: `Estojo para 3 Charutos · Montecristo · La Nuit`, en: `3 cigar case · Montecristo · La Nuit` },
    description: { pt: `Este estojo para charutos em couro e metal prateado está marcado com o brasão Montecristo e a decoração La Nuit. A colecção inclui 3 isqueiros: Ligne 2, Le Grand Dupont, Maxijet. Além disso, duas canetas da colecção Line D Large e acessórios: um corta-charutos, um grande cinzeiro e um par de botões de punho.`, en: `This leather and silver metal cigar case is stamped with the Montecristo coat of arms and La Nuit decor. The collection includes 3 lighters: Line 2, Le Grand Dupont, Maxijet. Also, two pens from the Line D Large collection and accessories: a cigar cutter, a large ashtray and a pair of cufflinks.` },
    collection: `Montecristo · La Nuit`,
    categorySlug: "acessorios",
    image: `/products/3-cigar-case-montecristo-la-nuit/183035.webp`,
    variants: [
      { sku: `183035`, name: { pt: `3 cigar case · Montecristo · La Nuit — Azul-escuro`, en: `3 cigar case · Montecristo · La Nuit — Dark Blue` }, priceCents: 31000, currency: "EUR", attributes: { color: { label: { pt: `Azul-escuro`, en: `Dark Blue` }, hex: ["#1f3c66"] } }, image: `/products/3-cigar-case-montecristo-la-nuit/183035.webp`, images: [`/products/3-cigar-case-montecristo-la-nuit/183035.webp`, `/products/3-cigar-case-montecristo-la-nuit/183035-2.webp`, `/products/3-cigar-case-montecristo-la-nuit/183035-3.webp`] },
    ],
  },
  {
    slug: `3-cigar-case-camo`,
    name: { pt: `Estojo para 3 Charutos · Camo`, en: `3 cigar case · Camo` },
    description: { pt: `Este ano, a S.T. Dupont reintroduz o motivo de camuflagem nos seus produtos icónicos. Para um toque adicional de originalidade, esta camuflagem incorpora chamas em tons vibrantes de vermelho e verde, criando uma interpretação fresca e audaz deste design lendário. Estojo para 3 charutos em couro de vitela granulado com motivo Camouflage verde e base em metal cromado.`, en: `This year, S.T. Dupont is reintroducing the camouflage motif on its iconic products. For added originality, this camouflage incorporates flames in vibrant shades of red and green, creating a fresh, bold interpretation of this legendary design. 3-cigar case in grained calf leather with green Camouflage motif and chrome metal base.` },
    collection: `Camo`,
    categorySlug: "acessorios",
    image: `/products/3-cigar-case-camo/183451.webp`,
    variants: [
      { sku: `183451`, name: { pt: `3 cigar case · Camo — Vermelho`, en: `3 cigar case · Camo — Red` }, priceCents: 26500, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/3-cigar-case-camo/183451.webp`, images: [`/products/3-cigar-case-camo/183451.webp`] },
      { sku: `183450`, name: { pt: `3 cigar case · Camo — Verde & Caqui`, en: `3 cigar case · Camo — Green & Khaki` }, priceCents: 26500, currency: "EUR", attributes: { color: { label: { pt: `Verde & Caqui`, en: `Green & Khaki` }, hex: ["#3b5d39"] } }, image: `/products/3-cigar-case-camo/183450.webp`, images: [`/products/3-cigar-case-camo/183450.webp`] },
    ],
  },
  {
    slug: `2-cigar-case-20000-leagues`,
    name: { pt: `Estojo para 2 charutos · 20,000 Leagues Under The Sea`, en: `2 cigar case · 20,000 Leagues Under The Sea` },
    description: { pt: `Homenagem ao cativante universo de 20,000 Leagues Under The Sea, esta edição limitada expressa todo o savoir-faire da S.T. Dupont. Publicado em 1870, o romance narra a viagem de três náufragos capturados pelo Capitão Nemo, o misterioso inventor que percorre os fundos marinhos a bordo do Nautilus, um submarino muito à frente das tecnologias da sua época. Vigias, turbinas, corais, barbatanas e outros tentáculos de lulas gigantes inspiram esta edição limitada e as suas três gamas, todas relacionadas com diferentes capítulos do livro. Uma história em três actos em que mergulhar com paixão. Para a gama Premium desta edição 20,000 Leagues Under The Sea, a S.T. Dupont narra dois outros capítulos: «4000 léguas sob o Pacífico», capítulo 18 do livro, e «Gulf Stream», capítulo 19 da sua segunda parte. Neste último, Júlio Verne evoca a Corrente do Golfo, uma força natural que molda o movimento dos oceanos e dos que neles se encontram. Veloz e perigosa, permite também ao Capitão Nemo demonstrar a sua excelência. Estojo para 2 charutos. Couro de raia (stingray). Base em crómio com o logótipo Nautilus gravado. O shagreen é um material natural, obtido a partir da pele de raias ou tubarões. Utilizado pela sua textura granulada e resistência, confere a cada peça um carácter único. A pérola central pode assim apresentar ligeiras variações de tons, desde o branco até tonalidades marfim ou louras. Estas subtilezas fazem parte do charme autêntico deste precioso material.`, en: `Tribute to the captivating universe of 20,000 leagues under the seas, this limited edition expresses all the know-how of S.T. Dupont. Published in 1870, the novel recounts the journey of three castaways captured by Captain Nemo, this mysterious inventor who travels the seabed aboard the Nautilus, submarine very ahead of the technologies of the time. Portholes, turbines, corals, fins and other tentacles of giant squid inspire this limited edition and its three ranges, all related to different chapters of the book. A story in three stages in which to dive with passion. For the Premium range of this edition 20,000 leagues under the seas, S.T. Dupont tells two other chapters: «4000 leagues under the Pacific», chapter 18 of the book, and «Gulf Stream», chapter 19 of its second part. In the latter, Jules Verne evokes the Gulf Stream, a natural force shaping the movement of the oceans and those who are there. Fast-moving and perilous, it also allows Captain Nemo to demonstrate his excellence. Case for 2 cigars. Stingray leather. Chrome base with engraved Nautilus logo. Shagreen is a natural material, derived from the skin of rays or sharks. Used for its beaded texture and resistance, it gives each piece a unique character. The central pearl can thus present slight variations of hues, ranging from white to ivory or blonde shades. These subtleties are part of the authentic charm of this precious material.` },
    collection: `20,000 Leagues Under The Sea`,
    categorySlug: "acessorios",
    image: `/products/2-cigar-case-20000-leagues/183441.webp`,
    variants: [
      { sku: `183441`, name: { pt: `2 cigar case · 20,000 Leagues Under The Sea — Azul Gulf Stream`, en: `2 cigar case · 20,000 Leagues Under The Sea — Blue Gulf Stream` }, priceCents: 58000, currency: "EUR", attributes: { color: { label: { pt: `Azul Gulf Stream`, en: `Blue Gulf Stream` }, hex: ["#1f3c66"] } }, image: `/products/2-cigar-case-20000-leagues/183441.webp`, images: [`/products/2-cigar-case-20000-leagues/183441.webp`, `/products/2-cigar-case-20000-leagues/183441-2.webp`, `/products/2-cigar-case-20000-leagues/183441-3.webp`, `/products/2-cigar-case-20000-leagues/183441-4.webp`] },
      { sku: `183442`, name: { pt: `2 cigar case · 20,000 Leagues Under The Sea — Verde Pacífico`, en: `2 cigar case · 20,000 Leagues Under The Sea — Green Pacific` }, priceCents: 58500, currency: "EUR", attributes: { color: { label: { pt: `Verde Pacífico`, en: `Green Pacific` }, hex: ["#3b5d39"] } }, image: `/products/2-cigar-case-20000-leagues/183442.webp`, images: [`/products/2-cigar-case-20000-leagues/183442.webp`, `/products/2-cigar-case-20000-leagues/183442-2.webp`, `/products/2-cigar-case-20000-leagues/183442-3.webp`] },
    ],
  },
  {
    slug: `3-cigar-case-romeo-y-julieta`,
    name: { pt: `Estojo para 3 Charutos · Romeo-y-Julieta`, en: `3 cigar case · Romeo-y-Julieta` },
    description: { pt: `Para celebrar o 150.º aniversário de Romeo y Julieta, a S.T. Dupont assina uma colaboração exclusiva, inspirada na força da paixão e do savoir-faire. Uma homenagem à arte dos charutos de excepção e à beleza dos objectos intemporais. Estojo para 3 charutos com o logótipo Romeo y Julieta gravado em relevo a dourado. Couro de vitela. Base dourada com o logótipo do brasão Romeo y Julieta gravado na frente e a inscrição da marca no verso.`, en: `To celebrate the 150th anniversary of Romeo and Julieta, S.T. Dupont signs an exclusive collaboration, inspired by the strength of passion and expertise. A tribute to the art of exceptional cigars and the beauty of timeless objects. Case for 3 cigars with Romeo and Julieta gold embossed logo. Calf leather. Golden base with engraved logo of the Romeo and Julieta coat of arms on the front and the inscription of the brand on the back.` },
    collection: `Romeo-y-Julieta`,
    categorySlug: "acessorios",
    image: `/products/3-cigar-case-romeo-y-julieta/183350.webp`,
    variants: [
      { sku: `183350`, name: { pt: `3 cigar case · Romeo-y-Julieta — Bordô`, en: `3 cigar case · Romeo-y-Julieta — Burgundy` }, priceCents: 31500, currency: "EUR", attributes: { color: { label: { pt: `Bordô`, en: `Burgundy` }, hex: ["#7d2b27"] } }, image: `/products/3-cigar-case-romeo-y-julieta/183350.webp`, images: [`/products/3-cigar-case-romeo-y-julieta/183350.webp`, `/products/3-cigar-case-romeo-y-julieta/183350-2.webp`, `/products/3-cigar-case-romeo-y-julieta/183350-3.webp`] },
    ],
  },
  {
    slug: `3-cigar-case-fuente`,
    name: { pt: `Estojo para 3 Charutos · Fuente`, en: `3 cigar case · Fuente` },
    description: { pt: `Estojo para 3 charutos — Lona revestida com o monograma X multicolor gravado em relevo e couro de vitela. Logótipo Opus X Fuente dourado gravado em relevo no estojo. Base dourada com o logótipo S.T. Dupont gravado na frente.`, en: `3-Cigar Case - Coated canvas embossed with the multicolor X monogram and calf leather. Gold Opus X Fuente logo embossed on the case. Gold base with S.T. Dupont logo engraved on the front.` },
    collection: `Fuente`,
    categorySlug: "acessorios",
    image: `/products/3-cigar-case-fuente/183460.webp`,
    variants: [
      { sku: `183460`, name: { pt: `3 cigar case · Fuente — Multicor`, en: `3 cigar case · Fuente — Multicolor` }, priceCents: 31500, currency: "EUR", attributes: { color: { label: { pt: `Multicor`, en: `Multicolor` }, hex: ["#c8a24a"] } }, image: `/products/3-cigar-case-fuente/183460.webp`, images: [`/products/3-cigar-case-fuente/183460.webp`, `/products/3-cigar-case-fuente/183460-2.webp`, `/products/3-cigar-case-fuente/183460-3.webp`] },
    ],
  },
  {
    slug: `defi-extreme-camo`,
    name: { pt: `Défi Extreme · Camo`, en: `Défi Extreme · Camo` },
    description: { pt: `Este ano, a S.T. Dupont reintroduz o padrão de camuflagem nos seus produtos icónicos. Para um toque adicional de originalidade, esta camuflagem incorpora chamas em tons vibrantes de vermelho e verde, criando uma interpretação fresca e audaz deste design lendário. Isqueiro Défi Extrême com motivo de camuflagem verde e gatilho em crómio. Corpo em metal injectado e capa de protecção semi-rígida altamente resistente. Chama maçarico azul. Recarga de gás associada: vermelha para Défi Extrême; XXtrême (REF 900436). Isqueiro entregue sem gás, recarga vendida em separado.`, en: `This year, S.T. Dupont is reintroducing the camouflage pattern on its iconic products. For added originality, this camouflage incorporates flames in vibrant shades of red and green, creating a fresh and bold interpretation of this legendary design. Défi Extrême lighter with green camouflage motif and chrome trigger Die-cast metal body and highly resistant semi-rigid protective cover Blue torch flame Associated gas refill: red for Défi Extrême; XXtrême (REF 900436) Lighter delivered empty of gas, refill sold separately.` },
    collection: `Camo`,
    categorySlug: "isqueiros",
    image: `/products/defi-extreme-camo/021451.webp`,
    variants: [
      { sku: `021451`, name: { pt: `Défi Extreme · Camo — Vermelho`, en: `Défi Extreme · Camo — Red` }, priceCents: 28000, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/defi-extreme-camo/021451.webp`, images: [`/products/defi-extreme-camo/021451.webp`, `/products/defi-extreme-camo/021451-2.webp`, `/products/defi-extreme-camo/021451-3.webp`, `/products/defi-extreme-camo/021451-4.webp`] },
      { sku: `021450`, name: { pt: `Défi Extreme · Camo — Caqui`, en: `Défi Extreme · Camo — Khaki` }, priceCents: 28000, currency: "EUR", attributes: { color: { label: { pt: `Caqui`, en: `Khaki` }, hex: ["#3b5d39"] } }, image: `/products/defi-extreme-camo/021450.webp`, images: [`/products/defi-extreme-camo/021450.webp`, `/products/defi-extreme-camo/021450-2.webp`, `/products/defi-extreme-camo/021450-3.webp`, `/products/defi-extreme-camo/021450-4.webp`] },
    ],
  },
  {
    slug: `slim-7-camo`,
    name: { pt: `Slim 7 · Camo`, en: `Slim 7 · Camo` },
    description: { pt: `Este ano, a S.T. Dupont reintroduz o padrão de camuflagem nos seus produtos icónicos e, para um toque adicional de originalidade, a camuflagem incorpora chamas em tons vibrantes de vermelho e verde, criando uma interpretação fresca e audaz deste design lendário. Isqueiro Slim 7 com motivo de camuflagem verde e atributos em crómio. Espessura de 7 mm e peso de 45 gramas. Apresenta uma chama azul plana. Recarga de gás associada: preta (REF 900430). Isqueiro entregue sem gás, recarga vendida em separado.`, en: `This year, S.T. This year, S.T. Dupont reintroduces the camouflage pattern on its iconic products, and for added originality, the camouflage incorporates flames in vibrant shades of red and green, creating a fresh and bold interpretation of this legendary design. Slim 7 lighter with green camouflage motif and chrome attributes Thickness 7 mm and weight 45 grams Featuring a flat blue flame Associated gas refill: black (REF 900430) Lighter delivered empty of gas, refill sold separately` },
    collection: `Camo`,
    categorySlug: "isqueiros",
    image: `/products/slim-7-camo/027751.webp`,
    variants: [
      { sku: `027751`, name: { pt: `Slim 7 · Camo — Vermelho`, en: `Slim 7 · Camo — Red` }, priceCents: 23500, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/slim-7-camo/027751.webp`, images: [`/products/slim-7-camo/027751.webp`, `/products/slim-7-camo/027751-2.webp`, `/products/slim-7-camo/027751-3.webp`, `/products/slim-7-camo/027751-4.webp`] },
      { sku: `027750G`, name: { pt: `Slim 7 · Camo — Caqui`, en: `Slim 7 · Camo — Khaki` }, priceCents: 23500, currency: "EUR", attributes: { color: { label: { pt: `Caqui`, en: `Khaki` }, hex: ["#3b5d39"] } }, image: `/products/slim-7-camo/027750G.webp`, images: [`/products/slim-7-camo/027750G.webp`, `/products/slim-7-camo/027750G-2.webp`, `/products/slim-7-camo/027750G-3.webp`, `/products/slim-7-camo/027750G-4.webp`] },
    ],
  },
  {
    slug: `maxijet-camo`,
    name: { pt: `Maxijet · Camo`, en: `Maxijet · Camo` },
    description: { pt: `Este ano, a S.T. Dupont reintroduz o padrão de camuflagem nos seus produtos icónicos, com chamas em tons vibrantes de vermelho e verde, criando uma interpretação fresca e audaz deste design lendário. Isqueiro Maxijet, motivo Camouflage verde e atributos em crómio. Apresenta uma chama maçarico azul. Recarga de gás associada: preta (REF 900430). Isqueiro entregue sem gás, recarga vendida em separado.`, en: `This year, S.T. This year, S.T. Dupont reintroduces the camouflage pattern on its iconic products, with flames in vibrant shades of red and green, creating a fresh, bold interpretation of this legendary design. Maxijet lighter, green Camouflage motif and chrome attributes Featuring a blue torch flame Associated gas refill: black (REF 900430) Lighter delivered empty of gas, refill sold separately` },
    collection: `Camo`,
    categorySlug: "isqueiros",
    image: `/products/maxijet-camo/020150.webp`,
    variants: [
      { sku: `020150`, name: { pt: `Maxijet · Camo — Verde & Caqui`, en: `Maxijet · Camo — Green & Khaki` }, priceCents: 24000, currency: "EUR", attributes: { color: { label: { pt: `Verde & Caqui`, en: `Green & Khaki` }, hex: ["#3b5d39"] } }, image: `/products/maxijet-camo/020150.webp`, images: [`/products/maxijet-camo/020150.webp`, `/products/maxijet-camo/020150-2.webp`, `/products/maxijet-camo/020150-3.webp`, `/products/maxijet-camo/020150-4.webp`] },
    ],
  },
  {
    slug: `ligne-2-5`,
    name: { pt: `Ligne 2 · Estojo`, en: `Ligne 2 · Lighter Case` },
    description: { pt: `Estojo para isqueiro em couro de vaca liso castanho, acomoda um isqueiro Ligne 2. Gravado em relevo com o logótipo S.T. Dupont e costuras azul, branco e vermelho.`, en: `Brown smooth cowhide leather lighter case, accommodates a Line 2 lighter. Embossed with the S.T. Dupont logo and blue, white, red stitching.` },
    collection: `Estojos para Isqueiros`,
    categorySlug: "acessorios",
    image: `/products/ligne-2-5/183071.webp`,
    variants: [
      { sku: `183071`, name: { pt: `Ligne 2 · Estojo — Castanho`, en: `Ligne 2 · Lighter Case — Brown` }, priceCents: 17000, currency: "EUR", attributes: { color: { label: { pt: `Castanho`, en: `Brown` }, hex: ["#6b4a2a"] } }, image: `/products/ligne-2-5/183071.webp`, images: [`/products/ligne-2-5/183071.webp`, `/products/ligne-2-5/183071-2.webp`, `/products/ligne-2-5/183071-3.webp`] },
    ],
  },
  {
    slug: `lighter-case-2`,
    name: { pt: `lighter-case`, en: `lighter-case` },
    description: { pt: `Estojo para isqueiro em couro de vaca liso azul, acomoda um isqueiro Ligne 2. Gravado em relevo com o logótipo S.T. Dupont e costuras azul, branco e vermelho.`, en: `Blue smooth cowhide leather lighter case, accommodates a Line 2 lighter. Embossed with the S.T. Dupont logo and blue, white, red stitching.` },
    collection: `lighter-case`,
    categorySlug: "acessorios",
    image: `/products/lighter-case-2/183073.webp`,
    variants: [
      { sku: `183073`, name: { pt: `lighter-case — Azul-escuro`, en: `lighter-case — Dark Blue` }, priceCents: 17000, currency: "EUR", attributes: { color: { label: { pt: `Azul-escuro`, en: `Dark Blue` }, hex: ["#1f3c66"] } }, image: `/products/lighter-case-2/183073.webp`, images: [`/products/lighter-case-2/183073.webp`, `/products/lighter-case-2/183073-2.webp`, `/products/lighter-case-2/183073-3.webp`] },
    ],
  },
  {
    slug: `x-2`,
    name: { pt: `X`, en: `X` },
    description: { pt: `Com a X-bag, o icónico guilloché dos isqueiros e canetas da S.T. Dupont ganha vida numa versão macro. Um «X» gigante, como uma ode à vida em grande escala. É uma homenagem ao estilo característico da Maison, uma vez que a X-bag se inspira no guilloché Fire-head, um dos mais icónicos das criações de ourivesaria da Maison. A mala é confeccionada em couro de vitela flor inteira, ornamentada com elegantes ferragens em paládio e uma alça ajustável para um estilo versátil. O couro utilizado é certificado LWG.`, en: `With the X-bag, the iconic guilloche of S.T. Dupont’s lighters and pens comes to life in a macro version. A giant "X", like an ode to life on a grand scale. It is a tribute to the Maison's signature style, as the X-bag is inspired by the Fire-head guilloche, amongst the most iconic of the Maison's goldsmith creations. The bag is crafted with full-grain calf leather, adorned with elegant palladium hardware, with an adjustable strap for versatile style. Leather used is LWG certified.` },
    collection: `X`,
    categorySlug: "pele",
    image: `/products/x-2/1XB283BL1.webp`,
    variants: [
      { sku: `1XB283BL1`, name: { pt: `X — Tan`, en: `X — Tan` }, priceCents: 176500, currency: "EUR", attributes: { color: { label: { pt: `Tan`, en: `Tan` }, hex: ["#7a7d83"] } }, image: `/products/x-2/1XB283BL1.webp`, images: [`/products/x-2/1XB283BL1.webp`, `/products/x-2/1XB283BL1-2.webp`, `/products/x-2/1XB283BL1-3.webp`, `/products/x-2/1XB283BL1-4.webp`] },
      { sku: `1XB283PL1`, name: { pt: `X — Nude Pink`, en: `X — Nude Pink` }, priceCents: 176500, currency: "EUR", attributes: { color: { label: { pt: `Rosa Nude`, en: `Nude Pink` }, hex: ["#c97a8c"] } }, image: `/products/x-2/1XB283PL1.webp`, images: [`/products/x-2/1XB283PL1.webp`, `/products/x-2/1XB283PL1-2.webp`, `/products/x-2/1XB283PL1-3.webp`, `/products/x-2/1XB283PL1-4.webp`] },
      { sku: `1XB283WH1`, name: { pt: `X — White`, en: `X — White` }, priceCents: 175000, currency: "EUR", attributes: { color: { label: { pt: `Branco`, en: `White` }, hex: ["#efeae0"] } }, image: `/products/x-2/1XB283WH1.webp`, images: [`/products/x-2/1XB283WH1.webp`, `/products/x-2/1XB283WH1-2.webp`, `/products/x-2/1XB283WH1-3.webp`, `/products/x-2/1XB283WH1-4.webp`] },
      { sku: `1XB282BL1`, name: { pt: `X — Tan`, en: `X — Tan` }, priceCents: 146000, currency: "EUR", attributes: { color: { label: { pt: `Tan`, en: `Tan` }, hex: ["#7a7d83"] } }, image: `/products/x-2/1XB282BL1.webp`, images: [`/products/x-2/1XB282BL1.webp`, `/products/x-2/1XB282BL1-2.webp`, `/products/x-2/1XB282BL1-3.webp`, `/products/x-2/1XB282BL1-4.webp`] },
    ],
  },
  {
    slug: `cufflinks-montecristo-aurore-2`,
    name: { pt: `Botões de Punho · Montecristo · L'Aurore`, en: `Cufflinks · Montecristo · L'Aurore` },
    description: { pt: `Montecristo e S.T. Dupont, dois nomes sinónimos de um savoir-faire único, unem-se para criar produtos de excepção. Esta nova colecção encantará os fãs de ambas as marcas. Os botões de punho Montecristo L'Aurore ostentam orgulhosamente o logótipo Montecristo e o degradé emblemático da colecção. A Montecristo L'Aurore propõe: - Três isqueiros - Dois instrumentos de escrita Line D Large - Acessórios para charutos - Um par de botões de punho.`, en: `Montecristo et S.T. Dupont, deux noms synonymes d'un savoir-faire unique, s'associent pour créer des produits d'exception. Cette nouvelle collection ravira les fans des deux marques. Les boutons de manchette Montecristo L'Aurore arborent fièrement le logo Montécristo et le dégradé emblématique de la collection. Montecristo L'Aurore propose : - Trois briquets - Deux instruments à écrire Line D Large - Des accessoires cigares - Une paire de boutons de manchette.` },
    collection: `Montecristo · L'Aurore`,
    categorySlug: "acessorios",
    image: `/products/cufflinks-montecristo-aurore-2/005714.webp`,
    variants: [
      { sku: `005714`, name: { pt: `Cufflinks · Montecristo · L'Aurore — Violeta`, en: `Cufflinks · Montecristo · L'Aurore — Violet` }, priceCents: 47000, currency: "EUR", attributes: { color: { label: { pt: `Violeta`, en: `Violet` }, hex: ["#6b4a8a"] } }, image: `/products/cufflinks-montecristo-aurore-2/005714.webp`, images: [`/products/cufflinks-montecristo-aurore-2/005714.webp`, `/products/cufflinks-montecristo-aurore-2/005714-2.webp`, `/products/cufflinks-montecristo-aurore-2/005714-3.webp`] },
    ],
  },
  {
    slug: `cufflinks-montecristo-la-nuit`,
    name: { pt: `Botões de Punho · Montecristo · La Nuit`, en: `Cufflinks · Montecristo · La Nuit` },
    description: { pt: `Os botões de punho Montecristo La Nuit ostentam orgulhosamente o icónico logótipo Montecristo e o degradé da colecção. A gama Montecristo La Nuit inclui: três isqueiros, dois instrumentos de escrita Line D Large, acessórios para charutos e um par de botões de punho. Acabamentos em platina.`, en: `Montecristo La Nuit cufflinks proudly display the iconic Montecristo logo and gradient from the collection. The Montecristo La Nuit range includes: three lighters, two Line D Large writing instruments, cigar accessories and a pair of cufflinks. Platinum finishes.` },
    collection: `Montecristo · La Nuit`,
    categorySlug: "acessorios",
    image: `/products/cufflinks-montecristo-la-nuit/005715.webp`,
    variants: [
      { sku: `005715`, name: { pt: `Cufflinks · Montecristo · La Nuit — Azul-escuro`, en: `Cufflinks · Montecristo · La Nuit — Dark Blue` }, priceCents: 47000, currency: "EUR", attributes: { color: { label: { pt: `Azul-escuro`, en: `Dark Blue` }, hex: ["#1f3c66"] } }, image: `/products/cufflinks-montecristo-la-nuit/005715.webp`, images: [`/products/cufflinks-montecristo-la-nuit/005715.webp`, `/products/cufflinks-montecristo-la-nuit/005715-2.webp`, `/products/cufflinks-montecristo-la-nuit/005715-3.webp`, `/products/cufflinks-montecristo-la-nuit/005715-4.webp`] },
    ],
  },
  {
    slug: `ashtray-montecristo-la-nuit`,
    name: { pt: `Cinzeiros · Montecristo · La Nuit`, en: `Ashtrays · Montecristo · La Nuit` },
    description: { pt: `Este cinzeiro tradicional em porcelana é pintado à mão e coroado com prata após três camadas de laca. A colecção inclui 3 isqueiros: Ligne 2, Le Grand Dupont, Maxijet. Além disso, duas canetas da colecção Line D Large e acessórios: um estojo em couro para três charutos, um corta-charutos e um par de botões de punho.`, en: `This traditional porcelain ashtray is hand-painted and topped with silver after three layers of lacquer. The collection includes 3 lighters: Line 2, Le Grand Dupont, Maxijet. Also, two pens from the Line D Large collection and accessories: a leather case for three cigars, a cigar cutter and a pair of cufflinks.` },
    collection: `Montecristo · La Nuit`,
    categorySlug: "acessorios",
    image: `/products/ashtray-montecristo-la-nuit/006435.webp`,
    variants: [
      { sku: `006435`, name: { pt: `Ashtrays · Montecristo · La Nuit — Azul-escuro`, en: `Ashtrays · Montecristo · La Nuit — Dark Blue` }, priceCents: 49000, currency: "EUR", attributes: { color: { label: { pt: `Azul-escuro`, en: `Dark Blue` }, hex: ["#1f3c66"] } }, image: `/products/ashtray-montecristo-la-nuit/006435.webp`, images: [`/products/ashtray-montecristo-la-nuit/006435.webp`, `/products/ashtray-montecristo-la-nuit/006435-2.webp`, `/products/ashtray-montecristo-la-nuit/006435-3.webp`] },
    ],
  },
  {
    slug: `ashtray-montecristo-aurore`,
    name: { pt: `Cinzeiros · Montecristo · L'Aurore`, en: `Ashtrays · Montecristo · L'Aurore` },
    description: { pt: `Montecristo e S.T. Dupont, ambos sinónimos de um savoir-faire único, unem-se para criar produtos de excepção. Esta nova colecção encantará os fãs de ambas as marcas. O cinzeiro tradicional em porcelana é pintado à mão e ornamentado com um topo dourado após três camadas de laca. A colecção inclui 3 isqueiros: Ligne 2, Le Grand Dupont, Maxijet. Também duas canetas da colecção Line D Large e acessórios: um estojo em couro para três charutos, um corta-charutos e um par de botões de punho.`, en: `Montecristo and S.T. Dupont, both synonymous with unique craftsmanship, have joined forces to create exceptional products. This new collection will delight fans of both brands. The traditional porcelain ashtray is hand-painted and also adorned with a gold top after three layers of lacquer. The collection includes 3 lighters: Ligne 2, Le Grand Dupont, Maxijet. Also, two pens from the Line D Large collection and accessories: a leather case for three cigars, a cigar cutter and a pair of cufflinks.` },
    collection: `Montecristo · L'Aurore`,
    categorySlug: "acessorios",
    image: `/products/ashtray-montecristo-aurore/006434.webp`,
    variants: [
      { sku: `006434`, name: { pt: `Ashtrays · Montecristo · L'Aurore — Violeta`, en: `Ashtrays · Montecristo · L'Aurore — Violet` }, priceCents: 49000, currency: "EUR", attributes: { color: { label: { pt: `Violeta`, en: `Violet` }, hex: ["#6b4a8a"] } }, image: `/products/ashtray-montecristo-aurore/006434.webp`, images: [`/products/ashtray-montecristo-aurore/006434.webp`, `/products/ashtray-montecristo-aurore/006434-2.webp`, `/products/ashtray-montecristo-aurore/006434-3.webp`] },
    ],
  },
  {
    slug: `ashtray-trinidad`,
    name: { pt: `Cinzeiros · Trinidad`, en: `Ashtrays · Trinidad` },
    description: { pt: `Para celebrar o 55.º aniversário da marca Trinidad, a S.T. Dupont e a Habanos S.A. conjugaram o seu lendário savoir-faire numa edição elegante e intemporal. Pretos profundos e três tonalidades de dourado solar, evocando as cores suaves da cidade de Trinidad e o requintado trabalho dos artífices do tabaco; o monograma da Maison Trinidad ilumina os isqueiros e acessórios S.T. Dupont. Todas as peças desta colecção ostentam a assinatura S.T. Dupont e um grafismo «55», o aniversário celebrado este ano pelos charutos Trinidad. Grande cinzeiro em porcelana decorado com o monograma Trinidad. O desenho do cinzeiro, bem como o contorno dourado, são aplicados à mão.`, en: `To celebrate the 55th anniversary of the Trinidad brand, S.T. Dupont and Habanos S.A. have combined their legendary expertise in an elegant and timeless edition. Deep blacks and three shades of sunny gold, recalling the soft colours of the city of Trinidad and the refined work of tobacco artisans, the monogram of the Trinidad house illuminates S.T. lighters and accessories. Dupont lighters and accessories. All the items in this collection bear the S.T. signature. Dupont signature and a ‘55’ graphic, the anniversary celebrated this year by Trinidad cigars. Large porcelain ashtray decorated with the Trinidad monogram. The design of the ashtray as well as the gilded outline are applied by hand..` },
    collection: `Trinidad`,
    categorySlug: "acessorios",
    image: `/products/ashtray-trinidad/006477.webp`,
    variants: [
      { sku: `006477`, name: { pt: `Ashtrays · Trinidad — Preto`, en: `Ashtrays · Trinidad — Black` }, priceCents: 40500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/ashtray-trinidad/006477.webp`, images: [`/products/ashtray-trinidad/006477.webp`, `/products/ashtray-trinidad/006477-2.webp`, `/products/ashtray-trinidad/006477-3.webp`] },
    ],
  },
  {
    slug: `ashtray-padron`,
    name: { pt: `Cinzeiros · Padrón`, en: `Ashtrays · Padrón` },
    description: { pt: `Por ocasião do 60.º aniversário da Maison Padrón, a S.T. Dupont anuncia uma colaboração especial. A colecção S.T. Dupont x Padrón oferece isqueiros e acessórios para charutos distintivos. Os seus acabamentos em ouro amarelo encarnam a vitola do charuto Padrón, e a sua laca castanha remete para a cor da folha de capa, a folha de tabaco que envolve o blend do charuto. Cinzeiro Padrón com acabamento brilhante. Contornos dourados pintados à mão.`, en: `On the occasion of the 60th anniversary of the Padrón house, S.T. Dupont announces a special collaboration. The S.T. Dupont x Padrón collection offers distinctive lighters and cigar accessories. Its yellow gold finishes embody the Padrón cigar band, and its brown lacquer refers to the color of their wrapper leaf, the tobacco leaf that wraps a cigar blend. Padrón ashtray with a glossy finish. Hand-painted gold edges.` },
    collection: `Padrón`,
    categorySlug: "acessorios",
    image: `/products/ashtray-padron/006114.webp`,
    variants: [
      { sku: `006114`, name: { pt: `Ashtrays · Padrón — Castanho`, en: `Ashtrays · Padrón — Brown` }, priceCents: 40000, currency: "EUR", attributes: { color: { label: { pt: `Castanho`, en: `Brown` }, hex: ["#6b4a2a"] } }, image: `/products/ashtray-padron/006114.webp`, images: [`/products/ashtray-padron/006114.webp`, `/products/ashtray-padron/006114-2.webp`, `/products/ashtray-padron/006114-3.webp`] },
    ],
  },
  {
    slug: `ashtray-20000-leagues`,
    name: { pt: `Cinzeiros · 20,000 Leagues Under The Sea`, en: `Ashtrays · 20,000 Leagues Under The Sea` },
    description: { pt: `Homenagem ao cativante universo de 20,000 Leagues Under The Sea, esta edição limitada expressa todo o savoir-faire da S.T. Dupont. Publicado em 1870, o romance narra a viagem de três náufragos capturados pelo Capitão Nemo, o misterioso inventor que percorre os fundos marinhos a bordo do Nautilus, um submarino muito à frente das tecnologias da sua época. Vigias, turbinas, corais, barbatanas e outros tentáculos de lulas gigantes inspiram esta edição limitada e as suas três gamas, todas relacionadas com diferentes capítulos do livro. Uma história em três actos em que mergulhar com paixão. Para a gama Premium desta edição 20,000 Leagues Under The Sea, a S.T. Dupont narra dois outros capítulos: «4000 léguas sob o Pacífico», capítulo 18 do livro, e «Gulf Stream», capítulo 19 da sua segunda parte. Neste último, Júlio Verne evoca a Corrente do Golfo, uma força natural que molda o movimento dos oceanos e dos que neles se encontram. Veloz e perigosa, permite também ao Capitão Nemo demonstrar a sua excelência. Cinzeiro com padrão Nautilus. Laca azul e acabamento brilhante. Acabamento pintado à mão nas ranhuras.`, en: `Tribute to the captivating universe of 20,000 leagues under the seas, this limited edition expresses all the know-how of S.T. Dupont. Published in 1870, the novel recounts the journey of three castaways captured by Captain Nemo, this mysterious inventor who travels the seabed aboard the Nautilus, submarine very ahead of the technologies of the time. Portholes, turbines, corals, fins and other tentacles of giant squid inspire this limited edition and its three ranges, all related to different chapters of the book. A story in three stages in which to dive with passion. For the Premium range of this edition 20,000 leagues under the seas, S.T. Dupont tells two other chapters: «4000 leagues under the Pacific», chapter 18 of the book, and «Gulf Stream», chapter 19 of its second part. In the latter, Jules Verne evokes the Gulf Stream, a natural force shaping the movement of the oceans and those who are there. Fast-moving and perilous, it also allows Captain Nemo to demonstrate his excellence. Nautilus pattern ashtray. Blue lacquer and glossy finish. Hand-painted finish on the grooves.` },
    collection: `20,000 Leagues Under The Sea`,
    categorySlug: "acessorios",
    image: `/products/ashtray-20000-leagues/006451.webp`,
    variants: [
      { sku: `006451`, name: { pt: `Cinzeiros · 20.000 Léguas Submarinas — Azul Gulf Stream`, en: `Ashtrays · 20,000 Leagues Under The Sea — Blue Gulf Stream` }, priceCents: 40000, currency: "EUR", attributes: { color: { label: { pt: `Azul Gulf Stream`, en: `Blue Gulf Stream` }, hex: ["#1f3c66"] } }, image: `/products/ashtray-20000-leagues/006451.webp`, images: [`/products/ashtray-20000-leagues/006451.webp`, `/products/ashtray-20000-leagues/006451-2.webp`, `/products/ashtray-20000-leagues/006451-3.webp`] },
      { sku: `006452`, name: { pt: `Cinzeiros · 20.000 Léguas Submarinas — Verde Pacífico`, en: `Ashtrays · 20,000 Leagues Under The Sea — Green Pacific` }, priceCents: 40000, currency: "EUR", attributes: { color: { label: { pt: `Verde Pacífico`, en: `Green Pacific` }, hex: ["#3b5d39"] } }, image: `/products/ashtray-20000-leagues/006452.webp`, images: [`/products/ashtray-20000-leagues/006452.webp`, `/products/ashtray-20000-leagues/006452-2.webp`, `/products/ashtray-20000-leagues/006452-3.webp`] },
      { sku: `006153`, name: { pt: `Cinzeiros · 20.000 Léguas Submarinas — Azul Real`, en: `Ashtrays · 20,000 Leagues Under The Sea — Royal Blue` }, priceCents: 25000, currency: "EUR", attributes: { color: { label: { pt: `Azul Real`, en: `Royal Blue` }, hex: ["#1f3c66"] } }, image: `/products/ashtray-20000-leagues/006153.webp`, images: [`/products/ashtray-20000-leagues/006153.webp`, `/products/ashtray-20000-leagues/006153-2.webp`, `/products/ashtray-20000-leagues/006153-3.webp`] },
    ],
  },
  {
    slug: `ashtray-romeo-y-julieta`,
    name: { pt: `Cinzeiros · Romeo-y-Julieta`, en: `Ashtrays · Romeo-y-Julieta` },
    description: { pt: `Para celebrar o 150.º aniversário de Romeo y Julieta, a S.T. Dupont assina uma colaboração exclusiva, inspirada na força da paixão e do savoir-faire. Uma homenagem à arte dos charutos de excepção e à beleza dos objectos intemporais. Cinzeiro com padrão Romeo y Julieta. Laca branca e acabamento brilhante. Acabamento dourado pintado à mão nas ranhuras.`, en: `To celebrate the 150th anniversary of Romeo and Julieta, S.T. Dupont signs an exclusive collaboration, inspired by the strength of passion and expertise. A tribute to the art of exceptional cigars and the beauty of timeless objects. Romeo & Julieta pattern ashtray. White lacquer and glossy finish. Hand-painted golden finish on the grooves.` },
    collection: `Romeo-y-Julieta`,
    categorySlug: "acessorios",
    image: `/products/ashtray-romeo-y-julieta/006450.webp`,
    variants: [
      { sku: `006450`, name: { pt: `Ashtrays · Romeo-y-Julieta — Branco`, en: `Ashtrays · Romeo-y-Julieta — White` }, priceCents: 40500, currency: "EUR", attributes: { color: { label: { pt: `Branco`, en: `White` }, hex: ["#efeae0"] } }, image: `/products/ashtray-romeo-y-julieta/006450.webp`, images: [`/products/ashtray-romeo-y-julieta/006450.webp`, `/products/ashtray-romeo-y-julieta/006450-2.webp`, `/products/ashtray-romeo-y-julieta/006450-3.webp`] },
    ],
  },
  {
    slug: `ashtray-fuente`,
    name: { pt: `Cinzeiros · Fuente`, en: `Ashtrays · Fuente` },
    description: { pt: `Cinzeiro — Laca preta decorada com o monograma X multicolor e o brasão Opus X Fuente ao centro. Acabamentos dourados pintados à mão nas ranhuras.`, en: `Ashtray - Black lacquer decorated with the multicolor X monogram and Opus X Fuente crest at the center. Hand-painted gold finishes on the grooves.` },
    collection: `Fuente`,
    categorySlug: "acessorios",
    image: `/products/ashtray-fuente/006460.webp`,
    variants: [
      { sku: `006460`, name: { pt: `Ashtrays · Fuente — Multicor`, en: `Ashtrays · Fuente — Multicolor` }, priceCents: 40500, currency: "EUR", attributes: { color: { label: { pt: `Multicor`, en: `Multicolor` }, hex: ["#c8a24a"] } }, image: `/products/ashtray-fuente/006460.webp`, images: [`/products/ashtray-fuente/006460.webp`, `/products/ashtray-fuente/006460-2.webp`, `/products/ashtray-fuente/006460-3.webp`] },
    ],
  },
  {
    slug: `misc-xl`,
    name: { pt: `Diverso · XL`, en: `Misc · XL` },
    description: { pt: `Intemporal e generoso, o cinzeiro XL torna-se uma verdadeira peça decorativa que valoriza qualquer espaço. Conjugando elegância e funcionalidade, conta com três descansos para charuto e está disponível numa requintada paleta de cores.`, en: `Timeless and generous, the XL ashtray becomes a true decorative piece that elevates any space. Combining elegance with functionality, it features three cigar rests and is available in a refined palette of colors.` },
    collection: `XL`,
    categorySlug: "acessorios",
    image: `/products/misc-xl/006725.webp`,
    variants: [
      { sku: `006725`, name: { pt: `Diverso · XL — Preto`, en: `Misc · XL — Black` }, priceCents: 55500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/misc-xl/006725.webp`, images: [`/products/misc-xl/006725.webp`, `/products/misc-xl/006725-2.webp`, `/products/misc-xl/006725-3.webp`] },
      { sku: `006737`, name: { pt: `Diverso · XL — Preto`, en: `Misc · XL — Black` }, priceCents: 55500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/misc-xl/006737.webp`, images: [`/products/misc-xl/006737.webp`, `/products/misc-xl/006737-2.webp`, `/products/misc-xl/006737-3.webp`] },
      { sku: `006727`, name: { pt: `Diverso · XL — Preto`, en: `Misc · XL — Black` }, priceCents: 55500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/misc-xl/006727.webp`, images: [`/products/misc-xl/006727.webp`, `/products/misc-xl/006727-2.webp`, `/products/misc-xl/006727-3.webp`] },
      { sku: `006726`, name: { pt: `Diverso · XL — Azul`, en: `Misc · XL — Blue` }, priceCents: 55500, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/misc-xl/006726.webp`, images: [`/products/misc-xl/006726.webp`, `/products/misc-xl/006726-2.webp`, `/products/misc-xl/006726-3.webp`] },
    ],
  },
  {
    slug: `d-logo`,
    name: { pt: `D Logo`, en: `D Logo` },
    description: { pt: `Há quase 50 anos que a S.T. Dupont propõe uma vasta gama de cintos que conjugam o savoir-faire da Maison para vestir o homem com elegância. Estes cintos estão disponíveis numa ampla escolha de couros, em versões reversíveis ou não reversíveis, com tiras de 30 ou 35 mm de largura e com diferentes fivelas: fivelas de espigão ou fivelas de caixa.`, en: `For almost 50 years, S.T. Dupont has offered a wide range of belts combining the House's different expertise to dress men with elegance. These belts are available in a wide choice of leathers, in reversible or non-reversible versions, with 30 or 35 mm wide straps and with different buckles: pin buckles or case buckles.` },
    collection: `D Logo`,
    categorySlug: "acessorios",
    image: `/products/d-logo/9351000.webp`,
    variants: [
      { sku: `9351000`, name: { pt: `D Logo — Black`, en: `D Logo — Black` }, priceCents: 29000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/d-logo/9351000.webp`, images: [`/products/d-logo/9351000.webp`, `/products/d-logo/9351000-2.webp`] },
      { sku: `9351100`, name: { pt: `D Logo — Black`, en: `D Logo — Black` }, priceCents: 29000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/d-logo/9351100.webp`, images: [`/products/d-logo/9351100.webp`, `/products/d-logo/9351100-2.webp`] },
      { sku: `9351200`, name: { pt: `D Logo — Black`, en: `D Logo — Black` }, priceCents: 29000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/d-logo/9351200.webp`, images: [`/products/d-logo/9351200.webp`, `/products/d-logo/9351200-2.webp`] },
      { sku: `9351001`, name: { pt: `D Logo — Black`, en: `D Logo — Black` }, priceCents: 29000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/d-logo/9351001.webp`, images: [`/products/d-logo/9351001.webp`, `/products/d-logo/9351001-2.webp`] },
      { sku: `9351002`, name: { pt: `D Logo — Black`, en: `D Logo — Black` }, priceCents: 29000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/d-logo/9351002.webp`, images: [`/products/d-logo/9351002.webp`, `/products/d-logo/9351002-2.webp`] },
      { sku: `9351003`, name: { pt: `D Logo — Black`, en: `D Logo — Black` }, priceCents: 31500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/d-logo/9351003.webp`, images: [`/products/d-logo/9351003.webp`, `/products/d-logo/9351003-2.webp`] },
    ],
  },
  {
    slug: `eternity-superman`,
    name: { pt: `Eternity · Superman`, en: `Eternity · Superman` },
    description: { pt: `A S.T. Dupont descola sob as cores de Superman com uma colecção exclusiva. O icónico emblema S de Superman, símbolo de esperança e heroísmo, destaca-se orgulhosamente em cada peça da colecção. Caneta rollerball Line D Eternity Large em laca S.T. Dupont degradé azul, inspirada no céu de Metropolis. Emblema S de Superman em laca aplicada. Clip Sword articulado. Acabamento dourado. Recargas associadas: Roller: 040840 Azul - 040841 Preta Feltro: 040830 Azul - 040831 Preta`, en: `S.T. Dupont takes off in the colors of Superman with an exclusive collection. The iconic Superman S emblem, a symbol of hope and heroism, proudly stands out on every piece in the collection. Roller pen Line D Eternity large in lacquer S.T. Dupont blue gradient inspired by the sky of Metropolis. Emblem S of Superman in lacquer placed. Articulated Sword Clip. Gold finish. Associated refills: Roller: 040840 Blue - 040841 Black Felt: 040830 Blue - 040831 Black` },
    collection: `Superman`,
    categorySlug: "escrita",
    image: `/products/eternity-superman/422027L.webp`,
    variants: [
      { sku: `422027L`, name: { pt: `Eternity · Superman — Azul`, en: `Eternity · Superman — Blue` }, priceCents: 131000, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/eternity-superman/422027L.webp`, images: [`/products/eternity-superman/422027L.webp`, `/products/eternity-superman/422027L-2.webp`, `/products/eternity-superman/422027L-3.webp`, `/products/eternity-superman/422027L-4.webp`] },
    ],
  },
  {
    slug: `misc-dc-comics-2`,
    name: { pt: `Diverso · DC Comics`, en: `Misc · DC Comics` },
    description: { pt: `A S.T. Dupont revela o terceiro capítulo da sua colaboração com a DC COMICS através de uma colecção exclusiva inspirada em três figuras icónicas: Wonder Woman, Catwoman e The Penguin. A colecção transmite uma mensagem universal de justiça, liberdade e poder, elevada pelo savoir-faire da Maison em criações de excepção, tais como o isqueiro Ligne 2, a caneta Line D Eternity e, para personagens seleccionadas, um colar-isqueiro. Caneta rollerball Line D Eternity Large em laca Dupont vermelha e azul com acabamentos dourados. Caneta ornamentada com o emblema «WW» e estrelas, símbolos da heroína da DC Comics Wonder Woman. Clip Sword articulado. Recargas associadas: Rollerball: 040840 Azul – 040841 Preta. Feltro: 040830 Azul – 040831 Preta.`, en: `S.T. Dupont unveils the third chapter of its collaboration with DC COMICS through an exclusive collection inspired by three iconic figures: Wonder Woman, Catwoman and The Penguin. The collection conveys a universal message of justice, freedom and power, elevated by the Maison’s savoir-faire in exceptional creations such as the Ligne 2 lighter, the Line D Eternity pen and, for selected characters, a Lighter Necklace. Line D Eternity Large rollerball pen in red and blue Dupont lacquer with gold finishes. Pen adorned with the “WW” emblem and stars, symbols of the DC Comics heroine Wonder Woman. Articulated Sword clip. Associated refills: Rollerball: 040840 Blue – 040841 Black Felt-tip: 040830 Blue – 040831 Black` },
    collection: `DC Comics`,
    categorySlug: "escrita",
    image: `/products/misc-dc-comics-2/422179L.webp`,
    variants: [
      { sku: `422179L`, name: { pt: `Misc · DC Comics — Variante 179L`, en: `Misc · DC Comics — Variant 179L` }, priceCents: 106000, currency: "EUR", attributes: { color: { label: { pt: `Variante 179L`, en: `Variant 179L` }, hex: ["#7a7d83"] } }, image: `/products/misc-dc-comics-2/422179L.webp`, images: [`/products/misc-dc-comics-2/422179L.webp`, `/products/misc-dc-comics-2/422179L-2.webp`, `/products/misc-dc-comics-2/422179L-3.webp`, `/products/misc-dc-comics-2/422179L-4.webp`] },
      { sku: `422180L`, name: { pt: `Misc · DC Comics — Variante 180L`, en: `Misc · DC Comics — Variant 180L` }, priceCents: 106000, currency: "EUR", attributes: { color: { label: { pt: `Variante 180L`, en: `Variant 180L` }, hex: ["#7a7d83"] } }, image: `/products/misc-dc-comics-2/422180L.webp`, images: [`/products/misc-dc-comics-2/422180L.webp`, `/products/misc-dc-comics-2/422180L-2.webp`, `/products/misc-dc-comics-2/422180L-3.webp`, `/products/misc-dc-comics-2/422180L-4.webp`] },
      { sku: `422181L`, name: { pt: `Misc · DC Comics — Variante 181L`, en: `Misc · DC Comics — Variant 181L` }, priceCents: 131000, currency: "EUR", attributes: { color: { label: { pt: `Variante 181L`, en: `Variant 181L` }, hex: ["#7a7d83"] } }, image: `/products/misc-dc-comics-2/422181L.webp`, images: [`/products/misc-dc-comics-2/422181L.webp`, `/products/misc-dc-comics-2/422181L-2.webp`, `/products/misc-dc-comics-2/422181L-3.webp`] },
    ],
  },
  {
    slug: `initial-horse-mane`,
    name: { pt: `Initial · Horse Mane`, en: `Initial · Horse Mane` },
    description: { pt: `Por ocasião do Ano Novo Chinês de 2026, sob o signo do Cavalo de Fogo, a S.T. Dupont revela Horse, uma colecção flamejante que encarna o carisma, a majestade e a paixão. O guilloché «criniera» e a escultura equina evocam com elegância as tradições da cultura chinesa. Caneta rollerball Initial em laca vermelha brilhante com decoração «horse mane» e um Fire Horse dourado na tampa. Acabamentos banhados a ouro. Clip Sword articulado. Recargas compatíveis: Rollerball: 040840 Azul – 040841 Preta Feltro: 040830 Azul – 040831 Preta`, en: `On the occasion of the 2026 Chinese New Year, under the sign of the Fire Horse, S.T. Dupont unveils Horse, a flamboyant collection embodying charisma, majesty, and passion. The “mane” guilloché and equine sculpture elegantly evoke the traditions of Chinese culture. Initial rollerball pen in glossy red lacquer with “horse mane” decoration and a golden Fire Horse on the cap. Gold-plated finishes. Articulated Sword clip. Compatible refills: Rollerball: 040840 Blue – 040841 Black Felt-tip: 040830 Blue – 040831 Black` },
    collection: `Horse Mane`,
    categorySlug: "escrita",
    image: `/products/initial-horse-mane/272080.webp`,
    variants: [
      { sku: `272080`, name: { pt: `Initial · Horse Mane — Vermelho`, en: `Initial · Horse Mane — Red` }, priceCents: 32500, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/initial-horse-mane/272080.webp`, images: [`/products/initial-horse-mane/272080.webp`, `/products/initial-horse-mane/272080-2.webp`, `/products/initial-horse-mane/272080-3.webp`, `/products/initial-horse-mane/272080-4.webp`] },
    ],
  },
  {
    slug: `eternity-joker`,
    name: { pt: `Eternity · joker`, en: `Eternity · joker` },
    description: { pt: `A S.T. Dupont anuncia uma colaboração especial com Joker e Harley Quinn. A colecção inspira-se nas duas icónicas personagens da DC Comics e nos seus traços distintivos, incluindo um isqueiro e uma caneta impregnados do seu universo único. Caneta rollerball Line D Eternity Large, em laca Dupont preta brilhante e acabamentos em paládio. Tampa decorada com a personagem da DC Comics Joker. Recargas associadas: 040840 Azul - 040841 Preta.`, en: `S.T. Dupont announces a special collaboration featuring Joker and Harley Quinn. The collection is inspired by the two iconic DC Comics characters and their distinctive traits, including a lighter and pen infused with their unique universe. Line D Eternity large rollerball pen, shiny black Dupont lacquer and palladium finishes. Cap decorated with the DC Comics character Joker. Associated refills: 040840 Blue - 040841 Black.` },
    collection: `joker`,
    categorySlug: "escrita",
    image: `/products/eternity-joker/422095L.webp`,
    variants: [
      { sku: `422095L`, name: { pt: `Eternity · joker — Prateado`, en: `Eternity · joker — Silver` }, priceCents: 105000, currency: "EUR", attributes: { color: { label: { pt: `Prateado`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/eternity-joker/422095L.webp`, images: [`/products/eternity-joker/422095L.webp`, `/products/eternity-joker/422095L-2.webp`, `/products/eternity-joker/422095L-3.webp`, `/products/eternity-joker/422095L-4.webp`] },
    ],
  },
  {
    slug: `eternity-harley-quinn`,
    name: { pt: `Eternity · harley-quinn`, en: `Eternity · harley-quinn` },
    description: { pt: `A S.T. Dupont anuncia uma colaboração especial com Joker e Harley Quinn. A colecção inspira-se nas duas icónicas personagens da DC Comics e nos seus traços distintivos, incluindo um isqueiro e uma caneta impregnados do seu universo único. Caneta rollerball Line D Eternity Large, em laca Dupont preta brilhante e acabamentos dourados. Tampa decorada com a personagem da DC Comics Harley Quinn. Recargas associadas: 040840 Azul - 040841 Preta.`, en: `S.T. Dupont announces a special collaboration featuring Joker and Harley Quinn. The collection is inspired by the two iconic DC Comics characters and their distinctive traits, including a lighter and pen infused with their unique universe. Line D Eternity large rollerball pen, shiny black Dupont lacquer and gold finishes. Cap decorated with the DC Comics character Harley Quinn. Associated refills: 040840 Blue - 040841 Black.` },
    collection: `harley-quinn`,
    categorySlug: "escrita",
    image: `/products/eternity-harley-quinn/422096L.webp`,
    variants: [
      { sku: `422096L`, name: { pt: `Eternity · harley-quinn — Dourado`, en: `Eternity · harley-quinn — Golden` }, priceCents: 105000, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/eternity-harley-quinn/422096L.webp`, images: [`/products/eternity-harley-quinn/422096L.webp`, `/products/eternity-harley-quinn/422096L-2.webp`, `/products/eternity-harley-quinn/422096L-3.webp`, `/products/eternity-harley-quinn/422096L-4.webp`] },
    ],
  },
  {
    slug: `eternity-presidence-de-la-republique`,
    name: { pt: `Eternity · presidence-de-la-republique`, en: `Eternity · presidence-de-la-republique` },
    description: { pt: `Para assinalar a realização dos Jogos Olímpicos de Paris 2024, a S.T. Dupont uniu-se ao Palácio do Élysée para celebrar o savoir-faire francês através de uma colecção de instrumentos de escrita fabricados em França. A caneta Eternity, especialmente criada para a Presidência da República, distingue-se como uma obra de arte única, encarnando um savoir-faire excepcional e a arte de viver à francesa. As canetas rollerball Eternity de tamanho médio têm acabamento em laca azul profundo inspirado na bandeira francesa, uma perfeita ilustração da emblemática técnica de laca da S.T. Dupont. Cada peça, gravada «Présidence de la République», reflecte um savoir-faire de excepção. O acabamento dourado e a nova assinatura da Maison no anel acrescentam um toque distintivo a este símbolo do savoir-faire francês. Recargas associadas: 040840 Azul - 040841 Preta.`, en: `To mark the hosting of the Paris 2024 Olympic Games, S.T. Dupont has teamed up with the Élysée Palace to celebrate French craftsmanship through a collection of writing instruments made in France. The Eternity pen, specially created for the Presidency of the Republic, stands out as a unique work of art, embodying exceptional craftsmanship and the French art of living. the Eternity medium roller pens are finished in a deep blue lacquer inspired by the French flag, a perfect illustration of S.T. Dupont's emblematic lacquering technique. Dupont's emblematic lacquering technique. Each piece, engraved “Présidence de la République”, reflects exceptional craftsmanship. The gilded finish and the new house signature on the ring add a distinctive touch to this symbol of French craftsmanship. Related refills: 040840 Blue - 040841 Black Translated with DeepL.com (free version)` },
    collection: `presidence-de-la-republique`,
    categorySlug: "escrita",
    image: `/products/eternity-presidence-de-la-republique/422055M.webp`,
    variants: [
      { sku: `422055M`, name: { pt: `Eternity · presidence-de-la-republique — Azul-escuro`, en: `Eternity · presidence-de-la-republique — Dark Blue` }, priceCents: 77500, currency: "EUR", attributes: { color: { label: { pt: `Azul-escuro`, en: `Dark Blue` }, hex: ["#1f3c66"] } }, image: `/products/eternity-presidence-de-la-republique/422055M.webp`, images: [`/products/eternity-presidence-de-la-republique/422055M.webp`, `/products/eternity-presidence-de-la-republique/422055M-2.webp`, `/products/eternity-presidence-de-la-republique/422055M-3.webp`, `/products/eternity-presidence-de-la-republique/422055M-4.webp`] },
    ],
  },
  {
    slug: `set-collector-20000-leagues`,
    name: { pt: `Set de Coleccionador · 20,000 Leagues Under The Sea`, en: `set-collector · 20,000 Leagues Under The Sea` },
    description: { pt: `Homenagem ao cativante universo de 20,000 Leagues Under The Sea, esta edição limitada expressa todo o savoir-faire da S.T. Dupont. Publicado em 1870, o romance narra a viagem de três náufragos capturados pelo Capitão Nemo, o misterioso inventor que percorre os fundos marinhos a bordo do Nautilus, um submarino muito à frente das tecnologias da sua época. Vigias, turbinas, corais, barbatanas e outros tentáculos de lulas gigantes inspiram esta edição limitada e as suas três gamas, todas relacionadas com diferentes capítulos do livro. Uma história em três actos em que mergulhar com paixão. A gama Prestige evoca a filosofia do capítulo 8, «Mobilis in Mobile», onde verdadeiramente começa a aventura. É neste capítulo que o Capitão Nemo apresenta o Nautilus aos três passageiros que capturou. Revela-lhes então a divisa do seu submarino: «Mobilis in Mobile» ou «Móvel no elemento móvel», uma forma de ilustrar os movimentos do submarino que navega no seio do maior «elemento móvel» da Terra: o mar. Conjunto composto por uma caneta multifunções Line D Eternity XL e um isqueiro Le Grand Dupont. Caneta Line D Eternity XL: Line D Eternity XL multifunções composta por um corpo rollerball e um corpo de bico em ouro de 14 quilates. Êmbolo incluído. Caneta lacada S.T. Dupont em azul brilhante com tentáculo de lula gravado em laca aplicada com acabamento dourado. Tampa ornamentada com barbatanas e o N do Nautilus em laca aplicada. Clip inspirado numa bússola de navegação. Topo da tampa inspirado numa vigia em laca S.T. Dupont azul, corpo gravado com os rebites do submarino, hélice vertical na base da caneta. Recargas associadas: Rollerball: 040840 Azul - 040841 Preta. Feltro: 040830 Azul - 040831 Preta. Cartuchos de tinta: 040112 Azul - 040110 Preta - 040362 Vermelha - 040363 Verde - 040364 Turquesa. Tinteiros: 040165 Preto Intenso - 040166 Azul Real - 040167 Vermelho Flamejante - 040168 Verde Primavera - 040169 Turquesa - 040170 Azul-Noite. Isqueiro Le Grand Dupont: Isqueiro Le Grand Dupont em laca azul brilhante com tentáculo de lula gravado em laca aplicada. Acabamentos dourados. Decoração Mobilis in Mobile. Tampa perfurada que retoma a decoração da vigia do Nautilus e ornamentada com adornos. Equipado com sistema de dupla ignição para chama amarela ou azul. Pedra de isqueiro associada: vermelha (REF 900651). Recarga de gás associada: vermelha (REF 900435). Isqueiro entregue sem gás, recarga vendida em separado. Chave de fendas incluída para trocar a pedra. Caixa composta por um suporte de caneta em forma de lula, um suporte para isqueiro e uma réplica do Nautilus. Limitada e numerada a 200 exemplares.`, en: `Tribute to the captivating universe of 20,000 leagues under the seas, this limited edition expresses all S.T. Dupont’s expertise. Published in 1870, the novel recounts the journey of three castaways captured by Captain Nemo, this mysterious inventor who travels the seabed aboard the Nautilus, a submarine very ahead of the technologies of the time. Windows, turbines, corals, fins and other tentacles of giant squid inspire this limited edition and its three ranges, all related to different chapters of the book. A three-part story in which to dive with passion. The Prestige range evokes the philosophy of chapter 8, «Mobilis in Mobile», where the adventure truly begins. It is in this latter that Captain Nemo introduces the Nautilus to the three passengers he has captured. He then reveals to them the motto of his submarine: «Mobilis in Mobile» or «Mobile in the mobile element», a way to illustrate the movements of the submarine navigating at the heart of the largest "mobile element" on earth: the sea. Set consisting of a multifunction pen Line D Eternity XL and a lighter Le Grand Dupont. Pen Line D Eternity XL: Line D Eternity XL multifunction composed of a roller sleeve and a 14-carat gold nib sleeve. Piston included. Shiny blue S.T. Dupont lacquered pen with squid tentacle engraved in gold-finish placed lacquer. Cap adorned with nageroires and the N of Nautilus in placed lacquer. Agrafe inspired by a navigation compass. Top of the cap inspired by a S.T. Dupont blue lacquered porthole, sleeve engraved with the submarine’s rivets, vertical propeller on the bottom of the pen. Associated refills: Roller: 040840 Blue - 040841 Black Felt: 040830 Blue - 040831 Black Ink cartridges: 040112 Blue - 040110 Black - 040362 Red - 040363 Green - 040364 Turquoise Inkwell: 040165 Intense black - 040166 Royal blue -040167 Flamboyant red - 040168 Spring green - 040169 Turquoise - 040170 Night blue Le Grand Dupont Lighter: Shiny blue lacquer Le Grand Dupont lighter with squid tentacle engraved in placed lacquer. Golden finishes. Mobilis decor in mobile. Perforated hat resuming the decor of the Hublot of the Nautilus and adorned with ornaments. Equipped with a double ignition system for yellow flame or blue flame. Associated lighter block: red (REF 900651) Associated gas refill: red (REF 900435) Lighter delivered empty of gas, refill sold separately. Screwdriver included to change the stone. Box consisting of a squid pen holder, a lighter holder and a replica of the Nautilus. Limited and numbered to 200 copies.` },
    collection: `20,000 Leagues Under The Sea`,
    categorySlug: "isqueiros",
    image: `/products/set-collector-20000-leagues/C23050.webp`,
    variants: [
      { sku: `C23050`, name: { pt: `Set de Coleccionador · 20.000 Léguas Submarinas — Azul Gulf Stream`, en: `set-collector · 20,000 Leagues Under The Sea — Blue Gulf Stream` }, priceCents: 490000, currency: "EUR", attributes: { color: { label: { pt: `Azul Gulf Stream`, en: `Blue Gulf Stream` }, hex: ["#1f3c66"] } }, image: `/products/set-collector-20000-leagues/C23050.webp`, images: [`/products/set-collector-20000-leagues/C23050.webp`, `/products/set-collector-20000-leagues/C23050-2.webp`, `/products/set-collector-20000-leagues/C23050-3.webp`, `/products/set-collector-20000-leagues/C23050-4.webp`] },
      { sku: `C2MOBILIS`, name: { pt: `Set de Coleccionador · 20.000 Léguas Submarinas — Azul Gulf Stream`, en: `set-collector · 20,000 Leagues Under The Sea — Blue Gulf Stream` }, priceCents: 958000, currency: "EUR", attributes: { color: { label: { pt: `Azul Gulf Stream`, en: `Blue Gulf Stream` }, hex: ["#1f3c66"] } }, image: `/products/set-collector-20000-leagues/C2MOBILIS.webp`, images: [`/products/set-collector-20000-leagues/C2MOBILIS.webp`, `/products/set-collector-20000-leagues/C2MOBILIS-2.webp`, `/products/set-collector-20000-leagues/C2MOBILIS-3.webp`, `/products/set-collector-20000-leagues/C2MOBILIS-4.webp`] },
    ],
  },
  {
    slug: `set-collector-20000-leagues-2`,
    name: { pt: `Set de Coleccionador · 20,000 Leagues Under The Sea`, en: `set-collector · 20,000 Leagues Under The Sea` },
    description: { pt: `Homenagem ao cativante universo de 20,000 Leagues Under The Sea, esta edição limitada expressa todo o savoir-faire da S.T. Dupont. Publicado em 1870, o romance narra a viagem de três náufragos capturados pelo Capitão Nemo, o misterioso inventor que percorre os fundos marinhos a bordo do Nautilus, um submarino muito à frente das tecnologias da sua época. Vigias, turbinas, corais, barbatanas e outros tentáculos de lulas gigantes inspiram esta edição limitada e as suas três gamas, todas relacionadas com diferentes capítulos do livro. Uma história em três actos em que mergulhar com paixão. A gama Prestige evoca a filosofia do capítulo 8, «Mobilis in Mobile», onde verdadeiramente começa a aventura. É neste capítulo que o Capitão Nemo apresenta o Nautilus aos três passageiros que capturou. Revela-lhes então a divisa do seu submarino: «Mobilis in Mobile» ou «Móvel no elemento móvel», uma forma de ilustrar os movimentos do submarino que navega no seio do maior «elemento móvel» da Terra: o mar. Conjunto composto por uma caneta multifunções Line D Eternity XL, um suporte em forma de lula e uma réplica do Nautilus. Line D Eternity XL multifunções composta por um corpo rollerball e um corpo de bico em ouro de 14 quilates. Êmbolo incluído. Caneta lacada S.T. Dupont em azul brilhante com tentáculo de lula gravado em laca aplicada com acabamento dourado. Tampa ornamentada com barbatanas e o N do Nautilus em laca aplicada. Clip inspirado numa bússola de navegação. Topo da tampa em laca S.T. Dupont azul inspirado numa vigia, corpo gravado com os rebites do submarino, hélice vertical na base da caneta. Limitada e numerada a 150 exemplares. Recargas associadas: Rollerball: 040840 Azul - 040841 Preta. Feltro: 040830 Azul - 040831 Preta. Cartuchos de tinta: 040112 Azul - 040110 Preta - 040362 Vermelha - 040363 Verde - 040364 Turquesa. Tinteiros: 040165 Preto Intenso - 040166 Azul Real - 040167 Vermelho Flamejante - 040168 Verde Primavera - 040169 Turquesa - 040170 Azul-Noite.`, en: `Tribute to the captivating universe of 20,000 leagues under the seas, this limited edition expresses all the know-how of S.T. Dupont. Published in 1870, the novel recounts the journey of three castaways captured by Captain Nemo, this mysterious inventor who travels the seabed aboard the Nautilus, submarine very ahead of the technologies of the time. Portholes, turbines, corals, fins and other tentacles of giant squid inspire this limited edition and its three ranges, all related to different chapters of the book. A story in three stages in which to dive with passion. The Prestige range evokes the philosophy of chapter 8, «Mobilis in Mobile», where the adventure truly begins. It is in this latter that Captain Nemo introduces the Nautilus to the three passengers he has captured. He then reveals to them the motto of his submarine: «Mobilis in Mobile» or «Mobile dans l'élément mobile», a way to illustrate the movements of the submarine navigating at the heart of the largest "mobile element" on earth: the sea. Set consisting of a multifunction Line D Eternity XL pen, a squid holder and a replica of the Nautilus. Line D Eternity XL multifunction composed of a roller sleeve and a 14-carat gold feather sleeve. Piston included. Shiny blue S.T. Dupont lacquered pen with squid tentacle engraved in gold-finish placed lacquer. Cap adorned with nageroires and the N of Nautilus in placed lacquer. Agrafe inspired by a navigation compass. Blue S.T. Dupont lacquered porthole top cap, sleeve engraved with the submarine rivets, vertical propeller on the bottom of the pen. Limited and numbered to 150 copies. Associated refills: Roller: 040840 Blue - 040841 Black Felt: 040830 Blue - 040831 Black Ink cartridges: 040112 Blue - 040110 Black - 040362 Red - 040363 Green - 040364 Turquoise Inkwell: 040165 Intense black - 040166 Royal blue -040167 Flamboyant red - 040168 Spring green - 040169 Turquoise - 040170 Night blue` },
    collection: `20,000 Leagues Under The Sea`,
    categorySlug: "escrita",
    image: `/products/set-collector-20000-leagues-2/420050XL.webp`,
    variants: [
      { sku: `420050XL`, name: { pt: `Set de Coleccionador · 20.000 Léguas Submarinas — Azul Gulf Stream`, en: `set-collector · 20,000 Leagues Under The Sea — Blue Gulf Stream` }, priceCents: 494000, currency: "EUR", attributes: { color: { label: { pt: `Azul Gulf Stream`, en: `Blue Gulf Stream` }, hex: ["#1f3c66"] } }, image: `/products/set-collector-20000-leagues-2/420050XL.webp`, images: [`/products/set-collector-20000-leagues-2/420050XL.webp`, `/products/set-collector-20000-leagues-2/420050XL-2.webp`, `/products/set-collector-20000-leagues-2/420050XL-3.webp`, `/products/set-collector-20000-leagues-2/420050XL-4.webp`] },
    ],
  },
  {
    slug: `ligne-2-stones-of-fortune`,
    name: { pt: `Ligne 2 · Stones of Fortune`, en: `Ligne 2 · Stones of Fortune` },
    description: { pt: `Isqueiro «Malachite» — Vitalidade. Com o seu design refinado e brilho profundo, o isqueiro Ligne 2 Malachite encarna a vitalidade e a energia. O seu guilloché ponta de diamante, valorizado por acabamentos em paládio, confere-lhe uma elegância única. A sua dupla chama amarela garante uma ignição perfeita, e a sua abertura revela o lendário «Cling», o som distintivo da S.T. Dupont. Isqueiro produzido em 88 exemplares. Pedra de isqueiro associada: preta (REF 900600). Recarga de gás associada: cinzenta e vermelha (REF 900435). Entregue sem gás, recarga vendida em separado. Numerado 87/88.`, en: `‘Malachite lighter - Vitality With its refined design and deep sparkle, the Ligne 2 Malachite lighter embodies vitality and energy. Its diamond-tipped guilloché, enhanced by palladium finishes, gives it a unique elegance. Its double yellow flame guarantees perfect ignition, and its opening reveals the legendary ‘Cling’, the signature sound of S.T. Dupont. Dupont's signature sound. Lighter produced in 88 pieces; Associated lighter stone: Black (REF 900600) Associated gas refill: Grey and Red (REF 900435) Delivered empty of gas, refill sold separately. Numbered 87/88` },
    collection: `Stones of Fortune`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-stones-of-fortune/C16100.webp`,
    variants: [
      { sku: `C16100`, name: { pt: `Ligne 2 · Stones of Fortune — Violeta`, en: `Ligne 2 · Stones of Fortune — Violet` }, priceCents: 504000, currency: "EUR", attributes: { color: { label: { pt: `Violeta`, en: `Violet` }, hex: ["#6b4a8a"] } }, image: `/products/ligne-2-stones-of-fortune/C16100.webp`, images: [`/products/ligne-2-stones-of-fortune/C16100.webp`, `/products/ligne-2-stones-of-fortune/C16100-2.webp`, `/products/ligne-2-stones-of-fortune/C16100-3.webp`, `/products/ligne-2-stones-of-fortune/C16100-4.webp`] },
      { sku: `C16102`, name: { pt: `Ligne 2 · Stones of Fortune — Verde`, en: `Ligne 2 · Stones of Fortune — Green` }, priceCents: 504000, currency: "EUR", attributes: { color: { label: { pt: `Verde`, en: `Green` }, hex: ["#3b5d39"] } }, image: `/products/ligne-2-stones-of-fortune/C16102.webp`, images: [`/products/ligne-2-stones-of-fortune/C16102.webp`, `/products/ligne-2-stones-of-fortune/C16102-2.webp`, `/products/ligne-2-stones-of-fortune/C16102-3.webp`, `/products/ligne-2-stones-of-fortune/C16102-4.webp`] },
      { sku: `C16103`, name: { pt: `Ligne 2 · Stones of Fortune — Castanho`, en: `Ligne 2 · Stones of Fortune — Brown` }, priceCents: 504000, currency: "EUR", attributes: { color: { label: { pt: `Castanho`, en: `Brown` }, hex: ["#6b4a2a"] } }, image: `/products/ligne-2-stones-of-fortune/C16103.webp`, images: [`/products/ligne-2-stones-of-fortune/C16103.webp`, `/products/ligne-2-stones-of-fortune/C16103-2.webp`, `/products/ligne-2-stones-of-fortune/C16103-3.webp`, `/products/ligne-2-stones-of-fortune/C16103-4.webp`] },
      { sku: `C16101`, name: { pt: `Ligne 2 · Stones of Fortune — Vermelho`, en: `Ligne 2 · Stones of Fortune — Red` }, priceCents: 504000, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/ligne-2-stones-of-fortune/C16101.webp`, images: [`/products/ligne-2-stones-of-fortune/C16101.webp`, `/products/ligne-2-stones-of-fortune/C16101-2.webp`, `/products/ligne-2-stones-of-fortune/C16101-3.webp`, `/products/ligne-2-stones-of-fortune/C16101-4.webp`] },
      { sku: `C16106`, name: { pt: `Ligne 2 · Stones of Fortune — Violeta`, en: `Ligne 2 · Stones of Fortune — Violet` }, priceCents: 504000, currency: "EUR", attributes: { color: { label: { pt: `Violeta`, en: `Violet` }, hex: ["#6b4a8a"] } }, image: `/products/ligne-2-stones-of-fortune/C16106.webp`, images: [`/products/ligne-2-stones-of-fortune/C16106.webp`, `/products/ligne-2-stones-of-fortune/C16106-2.webp`, `/products/ligne-2-stones-of-fortune/C16106-3.webp`, `/products/ligne-2-stones-of-fortune/C16106-4.webp`] },
      { sku: `C16104`, name: { pt: `Ligne 2 · Stones of Fortune — Castanho`, en: `Ligne 2 · Stones of Fortune — Brown` }, priceCents: 504000, currency: "EUR", attributes: { color: { label: { pt: `Castanho`, en: `Brown` }, hex: ["#6b4a2a"] } }, image: `/products/ligne-2-stones-of-fortune/C16104.webp`, images: [`/products/ligne-2-stones-of-fortune/C16104.webp`, `/products/ligne-2-stones-of-fortune/C16104-2.webp`, `/products/ligne-2-stones-of-fortune/C16104-3.webp`, `/products/ligne-2-stones-of-fortune/C16104-4.webp`] },
      { sku: `C16107`, name: { pt: `Ligne 2 · Stones of Fortune — Vermelho`, en: `Ligne 2 · Stones of Fortune — Red` }, priceCents: 504000, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/ligne-2-stones-of-fortune/C16107.webp`, images: [`/products/ligne-2-stones-of-fortune/C16107.webp`, `/products/ligne-2-stones-of-fortune/C16107-2.webp`, `/products/ligne-2-stones-of-fortune/C16107-3.webp`, `/products/ligne-2-stones-of-fortune/C16107-4.webp`] },
      { sku: `C16105`, name: { pt: `Ligne 2 · Stones of Fortune — Azul`, en: `Ligne 2 · Stones of Fortune — Blue` }, priceCents: 504000, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/ligne-2-stones-of-fortune/C16105.webp`, images: [`/products/ligne-2-stones-of-fortune/C16105.webp`, `/products/ligne-2-stones-of-fortune/C16105-2.webp`, `/products/ligne-2-stones-of-fortune/C16105-3.webp`, `/products/ligne-2-stones-of-fortune/C16105-4.webp`] },
    ],
  },
  {
    slug: `victoria`,
    name: { pt: `Victoria`, en: `Victoria` },
    description: { pt: `Com a Victoria, a S.T. Dupont revisita a sua herança com confiança: linhas depuradas, couros sumptuosos e uma estética resolutamente contemporânea. Um aceno à Rainha Victoria, mulher de poder e cliente icónica da Maison, esta mala não é apenas um acessório — é uma afirmação. Concebida para acompanhar quem vive a vida em pleno, conjuga liberdade de movimento e elegância, com um portátil numa mão e um batom na outra. O seu tamanho generoso acomoda sem esforço um portátil de 14 polegadas, enquanto uma pochette amovível com fecho de correr mantém os essenciais perfeitamente organizados. O seu fecho, inspirado no famoso isqueiro S.T. Dupont, o seu guilloché «mini Fire-X» sob laca e o bordo gravado em relevo com motivo «ponta de diamante» prestam homenagem ao savoir-faire da Maison na ourivesaria e na arte do baú. Uma tote bag inteligente, estruturada e afirmativa, concebida para acompanhar o ritmo frenético dos seus dias sem nunca comprometer o seu estilo.`, en: `With Victoria, S.T. Dupont revisits its heritage with confidence: clean lines, sumptuous leather, and a resolutely contemporary look. A nod to Queen Victoria, a woman of power and an iconic customer of the House, this bag is not just an accessory—it is a statement. Designed to accompany those who live life to the fullest, it combines freedom of movement and elegance, with a laptop in one hand and lipstick in the other. Its generous size effortlessly accommodates a 14-inch laptop, while a removable zipped pouch keeps essentials perfectly organized. Its clasp, inspired by the famous S.T. Dupont lighter, its “mini Fire-X” guilloche under lacquer, and its “diamond point” motif embossed border pay homage to the House's expertise in goldsmithing and trunk-making. A smart, structured, and assertive tote bag, designed to keep up with the frenetic pace of your days without ever compromising your style.` },
    collection: `Victoria`,
    categorySlug: "pele",
    image: `/products/victoria/1VI333BE1.webp`,
    variants: [
      { sku: `1VI333BE1`, name: { pt: `Victoria — Bege`, en: `Victoria — Beige` }, priceCents: 100000, currency: "EUR", attributes: { color: { label: { pt: `Bege`, en: `Beige` }, hex: ["#7a7d83"] } }, image: `/products/victoria/1VI333BE1.webp`, images: [`/products/victoria/1VI333BE1.webp`, `/products/victoria/1VI333BE1-2.webp`, `/products/victoria/1VI333BE1-3.webp`, `/products/victoria/1VI333BE1-4.webp`] },
      { sku: `1VI333BK1`, name: { pt: `Victoria — Preto`, en: `Victoria — Black` }, priceCents: 100000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/victoria/1VI333BK1.webp`, images: [`/products/victoria/1VI333BK1.webp`, `/products/victoria/1VI333BK1-2.webp`, `/products/victoria/1VI333BK1-3.webp`, `/products/victoria/1VI333BK1-4.webp`] },
      { sku: `1VI333RD1`, name: { pt: `Victoria — Bordô`, en: `Victoria — Burgundy` }, priceCents: 100000, currency: "EUR", attributes: { color: { label: { pt: `Bordô`, en: `Burgundy` }, hex: ["#7d2b27"] } }, image: `/products/victoria/1VI333RD1.webp`, images: [`/products/victoria/1VI333RD1.webp`, `/products/victoria/1VI333RD1-2.webp`, `/products/victoria/1VI333RD1-3.webp`, `/products/victoria/1VI333RD1-4.webp`] },
      { sku: `1VI514BK1`, name: { pt: `Victoria — Preto`, en: `Victoria — Black` }, priceCents: 35500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/victoria/1VI514BK1.webp`, images: [`/products/victoria/1VI514BK1.webp`, `/products/victoria/1VI514BK1-2.webp`, `/products/victoria/1VI514BK1-3.webp`] },
      { sku: `1VI514BE1`, name: { pt: `Victoria — Bege`, en: `Victoria — Beige` }, priceCents: 35500, currency: "EUR", attributes: { color: { label: { pt: `Bege`, en: `Beige` }, hex: ["#7a7d83"] } }, image: `/products/victoria/1VI514BE1.webp`, images: [`/products/victoria/1VI514BE1.webp`, `/products/victoria/1VI514BE1-2.webp`, `/products/victoria/1VI514BE1-3.webp`] },
      { sku: `1VI514RD1`, name: { pt: `Victoria — Red`, en: `Victoria — Red` }, priceCents: 35500, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/victoria/1VI514RD1.webp`, images: [`/products/victoria/1VI514RD1.webp`, `/products/victoria/1VI514RD1-2.webp`, `/products/victoria/1VI514RD1-3.webp`] },
      { sku: `1VI592BK1`, name: { pt: `Victoria — Preto`, en: `Victoria — Black` }, priceCents: 49500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/victoria/1VI592BK1.webp`, images: [`/products/victoria/1VI592BK1.webp`, `/products/victoria/1VI592BK1-2.webp`, `/products/victoria/1VI592BK1-3.webp`] },
    ],
  },
  {
    slug: `defi-explorer-3`,
    name: { pt: `Défi Explorer`, en: `Défi Explorer` },
    description: { pt: `Espaçosa e duradoura, esta mala de viagem em lona técnica hidrofugada e couro estruturado foi concebida para acompanhar todas as escapadas. Leve e funcional, conta com um amplo compartimento principal. Os seus acabamentos de inspiração outdoor conferem-lhe um estilo afirmativo, entre elegância e desempenho. Disponível em caqui ou preto. Made in Italy`, en: `Spacious and durable, this travel bag in water-repellent technical canvas and structured leather is designed to accompany every getaway. Lightweight and functional, it features a large main compartment. Its outdoor-inspired finishes give it an assertive style, between elegance and performance. Available in khaki or black. Made in Italy` },
    collection: `Défi Explorer`,
    categorySlug: "pele",
    image: `/products/defi-explorer-3/1IC231NK1.webp`,
    variants: [
      { sku: `1IC231NK1`, name: { pt: `Défi Explorer — Verde & Caqui`, en: `Défi Explorer — Green & Khaki` }, priceCents: 130000, currency: "EUR", attributes: { color: { label: { pt: `Verde & Caqui`, en: `Green & Khaki` }, hex: ["#3b5d39"] } }, image: `/products/defi-explorer-3/1IC231NK1.webp`, images: [`/products/defi-explorer-3/1IC231NK1.webp`, `/products/defi-explorer-3/1IC231NK1-2.webp`, `/products/defi-explorer-3/1IC231NK1-3.webp`, `/products/defi-explorer-3/1IC231NK1-4.webp`] },
    ],
  },
  {
    slug: `neo-capsule-3`,
    name: { pt: `Neo-capsule`, en: `Neo-capsule` },
    description: { pt: `Carteira com porta-moedas da colecção Néo Capsule em couro flor inteira granulado. Quatro compartimentos para cartões e um bolso com botão de pressão para moedas. Todos os produtos da colecção Néo Capsule são certificados pelo Leather Working Group.`, en: `Wallet with coin pocket from the Néo Capsule collection in full-grain grained leather. Four card slots, a pocket with a snap button closure for coins. All products from the Néo Capsule collection are certified by the Leather Working Group.` },
    collection: `Neo-capsule`,
    categorySlug: "pele",
    image: `/products/neo-capsule-3/1NC571BK1.webp`,
    variants: [
      { sku: `1NC571BK1`, name: { pt: `Neo-capsule — Preto`, en: `Neo-capsule — Black` }, priceCents: 38500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/neo-capsule-3/1NC571BK1.webp`, images: [`/products/neo-capsule-3/1NC571BK1.webp`, `/products/neo-capsule-3/1NC571BK1-2.webp`] },
    ],
  },  // === END WWW STORE IMPORTS ===

  // === BEGIN WWW CIGAR CUTTERS (www.st-dupont.com) ===
  {
    slug: `cutter-003480h`,
    name: { pt: `Corta-Charuto`, en: `Cigar Cutter` },
    description: { pt: `Por ocasião do Ano Novo Chinês de 2026, sob o signo do Cavalo de Fogo, a S.T. Dupont revela Horse, uma colecção flamejante que encarna o carisma, a majestade e a paixão. O guilloché «criniera» e a escultura equina evocam com elegância as tradições da cultura chinesa. Corta-charutos de mesa em laca vermelha de alto brilho, decorado com o motivo «horse mane». Lâmina gravada com o motivo Fire Horse. Acabamento banhado a ouro.`, en: `On the occasion of the 2026 Chinese New Year, under the sign of the Fire Horse, S.T. Dupont unveils Horse, a flamboyant collection embodying charisma, majesty, and passion. The “mane” guilloché and equine sculpture elegantly evoke the traditions of Chinese culture. Cigar stand in high-gloss red lacquer, decorated with the “horse mane” motif. Blade engraved with the Fire Horse motif. Gold-plated finish.` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003480h/003480H.webp`,
    variants: [
      { sku: `003480H`, name: { pt: `Cigar Cutter — Vermelho`, en: `Cigar Cutter — Red` }, priceCents: 24000, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/cutter-003480h/003480H.webp`, images: [`/products/cutter-003480h/003480H.webp`, `/products/cutter-003480h/003480H-2.webp`, `/products/cutter-003480h/003480H-3.webp`] },
    ],
  },
  {
    slug: `cutter-003488h`,
    name: { pt: `Corta-Charuto`, en: `Cigar Cutter` },
    description: { pt: `Por ocasião do Ano Novo Chinês de 2026, sob o signo do Cavalo de Fogo, a S.T. Dupont revela Horse, uma colecção flamejante que encarna o carisma, a majestade e a paixão. O guilloché «criniera» e a escultura equina evocam com elegância as tradições da cultura chinesa. Corta-charutos de mesa em laca preta de alto brilho, decorado com o motivo «horse mane». Lâmina gravada com o motivo Fire Horse. Acabamento banhado a crómio.`, en: `On the occasion of the 2026 Chinese New Year, under the sign of the Fire Horse, S.T. Dupont unveils Horse, a flamboyant collection embodying charisma, majesty, and passion. The “mane” guilloché and equine sculpture elegantly evoke the traditions of Chinese culture. Cigar stand in high-gloss black lacquer, decorated with the “horse mane” motif. Blade engraved with the Fire Horse motif. Chrome-plated finish.` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003488h/003488H.webp`,
    variants: [
      { sku: `003488H`, name: { pt: `Cigar Cutter — Preto`, en: `Cigar Cutter — Black` }, priceCents: 24000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/cutter-003488h/003488H.webp`, images: [`/products/cutter-003488h/003488H.webp`, `/products/cutter-003488h/003488H-2.webp`, `/products/cutter-003488h/003488H-3.webp`] },
    ],
  },
  {
    slug: `cutter-003415`,
    name: { pt: `Suporte para Charuto`, en: `Cigar stand` },
    description: { pt: `Corta-charutos de mesa com lâmina dupla e suporte para colocar o seu charuto. Decorado com ponta de diamante, acabamento em crómio e laca preta.`, en: `Cigar stand cutter with a double blade and a stand to place your cigar. Decorated with a diamond point, chrome finish, and black lacquer.` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003415/003415.webp`,
    variants: [
      { sku: `003415`, name: { pt: `Suporte para Charuto — Preto & Prateado`, en: `Cigar stand — Black & Silver` }, priceCents: 22000, currency: "EUR", attributes: { color: { label: { pt: `Preto & Prateado`, en: `Black & Silver` }, hex: ["#15171c"] } }, image: `/products/cutter-003415/003415.webp`, images: [`/products/cutter-003415/003415.webp`, `/products/cutter-003415/003415-2.webp`, `/products/cutter-003415/003415-3.webp`, `/products/cutter-003415/003415-4.webp`] },
    ],
  },
  {
    slug: `cutter-003393`,
    name: { pt: `Suporte para Charuto`, en: `Cigar stand` },
    description: { pt: `Corta-charutos de mesa com lâmina dupla e suporte para colocar o seu charuto. Decorado com ponta de diamante, acabamento dourado e laca preta.`, en: `Cigar stand cutter with a double blade and a stand to place your cigar. Decorated with a diamond point, gold finish, and black lacquer.` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003393/003393.webp`,
    variants: [
      { sku: `003393`, name: { pt: `Suporte para Charuto — Preto & Dourado`, en: `Cigar stand — Black & Golden` }, priceCents: 22000, currency: "EUR", attributes: { color: { label: { pt: `Preto & Dourado`, en: `Black & Golden` }, hex: ["#15171c"] } }, image: `/products/cutter-003393/003393.webp`, images: [`/products/cutter-003393/003393.webp`, `/products/cutter-003393/003393-2.webp`, `/products/cutter-003393/003393-3.webp`] },
    ],
  },
  {
    slug: `cutter-003435`,
    name: { pt: `Suporte para Charuto`, en: `Cigar stand` },
    description: { pt: `O corta-charutos de mesa é lacado em degradé azul; o logótipo da prestigiada marca de charutos Montecristo está estampado numa das faces da lâmina, enquanto a outra face apresenta uma decoração prateada de sol e lua. A colecção inclui 3 isqueiros: Ligne 2, Le Grand Dupont, Maxijet. Também duas canetas da colecção Line D Large e acessórios: um estojo em couro para três charutos, um corta-charutos e um par de botões de punho.`, en: `The cigar cutter stand is lacquered with a blue gradient, the logo of the prestigious Montecristo cigar brand is stamped on the blade face, while the other blade face features a silver sun and moon decoration. The collection includes 3 lighters: Line 2, Le Grand Dupont, Maxijet. Also, two pens from the Line D Large collection and accessories: a leather case for three cigars, a cigar cutter and a pair of cufflinks.` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003435/003435.webp`,
    variants: [
      { sku: `003435`, name: { pt: `Suporte para Charuto — Azul-escuro`, en: `Cigar stand — Dark Blue` }, priceCents: 21000, currency: "EUR", attributes: { color: { label: { pt: `Azul-escuro`, en: `Dark Blue` }, hex: ["#1f3c66"] } }, image: `/products/cutter-003435/003435.webp`, images: [`/products/cutter-003435/003435.webp`, `/products/cutter-003435/003435-2.webp`, `/products/cutter-003435/003435-3.webp`] },
    ],
  },
  {
    slug: `cutter-003434`,
    name: { pt: `Suporte para Charuto`, en: `Cigar stand` },
    description: { pt: `Montecristo e S.T. Dupont, ambos sinónimos de um savoir-faire único, unem-se para criar produtos de excepção. Esta nova colecção encantará os fãs de ambas as marcas. O corta-charutos de mesa é lacado em degradé violeta; o logótipo da prestigiada marca de charutos Montecristo está estampado numa das faces da lâmina, enquanto a outra face apresenta uma decoração dourada de sol e lua. A colecção inclui 3 isqueiros: Ligne 2, Le Grand Dupont, Maxijet. Também duas canetas da colecção Line D Large e acessórios: um estojo em couro para três charutos, um corta-charutos e um par de botões de punho.`, en: `Montecristo and S.T. Dupont, both synonymous with unique craftsmanship, have joined forces to create exceptional products. This new collection will delight fans of both brands. The cigar cutter stand is lacquered with a violet gradient, the logo of the prestigious Montecristo cigar brand is stamped on the blade face, while the other blade face features a golden sun and moon decoration. The collection includes 3 lighters: Line 2, Le Grand Dupont, Maxijet. Also, two pens from the Line D Large collection and accessories: a leather case for three cigars, a cigar cutter and a pair of cufflinks.` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003434/003434.webp`,
    variants: [
      { sku: `003434`, name: { pt: `Suporte para Charuto — Violeta`, en: `Cigar stand — Violet` }, priceCents: 21000, currency: "EUR", attributes: { color: { label: { pt: `Violeta`, en: `Violet` }, hex: ["#6b4a8a"] } }, image: `/products/cutter-003434/003434.webp`, images: [`/products/cutter-003434/003434.webp`, `/products/cutter-003434/003434-2.webp`, `/products/cutter-003434/003434-3.webp`, `/products/cutter-003434/003434-4.webp`] },
    ],
  },
  {
    slug: `cutter-003478`,
    name: { pt: `Suporte para Charuto`, en: `Cigar Stand` },
    description: { pt: `A arte do metal, tal como a arte da laca e do couro revestido, evidenciam o savoir-faire da S.T. Dupont na colecção Monogram 1872. Bem ancoradas no seu tempo, as peças da colecção exibem todas o novo logótipo S.T. Dupont — direito, determinado e altivo. Corta-charutos de mesa decorado com o padrão Monogram 1872 em acabamentos Bordéus e dourado.`, en: `Craftsmanship in metal, as well as the art of lacquer and coated leather, showcase the expertise of S.T. Dupont in the Monogram 1872 collection. Well-rooted in their time, the pieces in the collection all feature the new S.T. Dupont logo—upright, determined, and proud. Cigar cutter stand decorated with the Monogram 1872 pattern in burgundy and gold finishes.` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003478/003478.webp`,
    variants: [
      { sku: `003478`, name: { pt: `Suporte para Charuto — Bordô`, en: `Cigar Stand — Burgundy` }, priceCents: 24000, currency: "EUR", attributes: { color: { label: { pt: `Bordô`, en: `Burgundy` }, hex: ["#7d2b27"] } }, image: `/products/cutter-003478/003478.webp`, images: [`/products/cutter-003478/003478.webp`, `/products/cutter-003478/003478-2.webp`, `/products/cutter-003478/003478-3.webp`] },
    ],
  },
  {
    slug: `cutter-003479`,
    name: { pt: `Suporte para Charuto`, en: `Cigar Stand` },
    description: { pt: `A arte do metal, tal como a arte da laca e do couro revestido, evidenciam o savoir-faire da S.T. Dupont na colecção Monogram 1872. Bem ancoradas no seu tempo, as peças da colecção exibem todas o novo logótipo S.T. Dupont — direito, determinado e altivo. Corta-charutos de mesa decorado com o padrão Monogram 1872 em acabamentos preto e dourado.`, en: `Craftsmanship in metal, as well as the art of lacquer and coated leather, showcase the expertise of S.T. Dupont in the Monogram 1872 collection. Well-rooted in their time, the pieces in the collection all feature the new S.T. Dupont logo—upright, determined, and proud. Cigar cutter stand decorated with the Monogram 1872 pattern in black and gold finishes.` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003479/003479.webp`,
    variants: [
      { sku: `003479`, name: { pt: `Suporte para Charuto — Preto`, en: `Cigar Stand — Black` }, priceCents: 24000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/cutter-003479/003479.webp`, images: [`/products/cutter-003479/003479.webp`, `/products/cutter-003479/003479-2.webp`, `/products/cutter-003479/003479-3.webp`] },
    ],
  },
  {
    slug: `cutter-003480m`,
    name: { pt: `Suporte para Charuto`, en: `Cigar Stand` },
    description: { pt: `A arte do metal, tal como a arte da laca e do couro revestido, evidenciam o savoir-faire da S.T. Dupont na colecção Monogram 1872. Bem ancoradas no seu tempo, as peças da colecção exibem todas o novo logótipo S.T. Dupont — direito, determinado e altivo. Corta-charutos de mesa decorado com o padrão Monogram 1872 em acabamentos cinzento e prateado.`, en: `Craftsmanship in metal, as well as the art of lacquer and coated leather, showcase the expertise of S.T. Dupont in the Monogram 1872 collection. Well-rooted in their time, the pieces in the collection all feature the new S.T. Dupont logo—upright, determined, and proud. Cigar cutter stand decorated with the Monogram 1872 pattern in gray and silver finishes.` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003480m/003480M.webp`,
    variants: [
      { sku: `003480M`, name: { pt: `Suporte para Charuto — Cinzento & Cinzento Claro`, en: `Cigar Stand — Grey & Light Gray` }, priceCents: 24000, currency: "EUR", attributes: { color: { label: { pt: `Cinzento & Cinzento Claro`, en: `Grey & Light Gray` }, hex: ["#7a7d83"] } }, image: `/products/cutter-003480m/003480M.webp`, images: [`/products/cutter-003480m/003480M.webp`, `/products/cutter-003480m/003480M-2.webp`] },
    ],
  },
  {
    slug: `cutter-003475`,
    name: { pt: `Suporte para Charuto`, en: `Cigar Stand` },
    description: { pt: `Para celebrar o Ano Novo Chinês, a S.T. Dupont imagina uma colecção inspirada na serpente, o signo astrológico do ano de 2025. Esta colecção apresenta um padrão de guilloché único que evoca as escamas do animal, realçado por um meticuloso trabalho de laca. Uma vez mais, a Maison demonstra a audácia, a sofisticação e o savoir-faire que a distinguem. Corta-charutos em metal, decorado com o motivo Snake vermelho, com acabamento dourado.`, en: `To celebrate the Chinese New Year, S.T. Dupont imagines a collection inspired by the snake, the astrological sign of the year 2025. This collection showcases a unique guilloché pattern evoking the animal's scales, enhanced by meticulous lacquer work. Once again, the house demonstrates the audacity, sophistication, and craftsmanship that set it apart. Cigar Cutter in metal, decorated with the red Snake motif, with a gold finish` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003475/003475.webp`,
    variants: [
      { sku: `003475`, name: { pt: `Suporte para Charuto — Vermelho`, en: `Cigar Stand — Red` }, priceCents: 23500, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/cutter-003475/003475.webp`, images: [`/products/cutter-003475/003475.webp`, `/products/cutter-003475/003475-2.webp`, `/products/cutter-003475/003475-3.webp`] },
    ],
  },
  {
    slug: `cutter-003476`,
    name: { pt: `Suporte para Charuto`, en: `Cigar Stand` },
    description: { pt: `Para celebrar o Ano Novo Chinês, a S.T. Dupont imagina uma colecção inspirada na serpente, o signo astrológico do ano de 2025. Esta colecção apresenta um padrão de guilloché único que evoca as escamas do animal, realçado por um meticuloso trabalho de laca. Uma vez mais, a Maison demonstra a audácia, a sofisticação e o savoir-faire que a distinguem. Corta-charutos em metal, decorado com o motivo Snake preto, com acabamento dourado.`, en: `To celebrate the Chinese New Year, S.T. Dupont imagines a collection inspired by the snake, the astrological sign of the year 2025. This collection showcases a unique guilloché pattern evoking the animal's scales, enhanced by meticulous lacquer work. Once again, the house demonstrates the audacity, sophistication, and craftsmanship that set it apart. Cigar Cutter in metal, decorated with the black Snake motif, with a gold finish` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003476/003476.webp`,
    variants: [
      { sku: `003476`, name: { pt: `Suporte para Charuto — Preto`, en: `Cigar Stand — Black` }, priceCents: 23500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/cutter-003476/003476.webp`, images: [`/products/cutter-003476/003476.webp`, `/products/cutter-003476/003476-2.webp`, `/products/cutter-003476/003476-3.webp`] },
    ],
  },
  {
    slug: `cutter-003553`,
    name: { pt: `Suporte para Charuto`, en: `Cigar Stand` },
    description: { pt: `Corta-charutos de mesa com lâmina dupla e suporte para o seu charuto. Decorado com ponta de diamante, acabamento dourado e laca preta.`, en: `Stand cigar cutter with double blade and holder for your cigar. Decorated with a diamond tip, gold finish and black lacquer.` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003553/003553.webp`,
    variants: [
      { sku: `003553`, name: { pt: `Suporte para Charuto — Preto & Dourado`, en: `Cigar Stand — Black & Golden` }, priceCents: 22000, currency: "EUR", attributes: { color: { label: { pt: `Preto & Dourado`, en: `Black & Golden` }, hex: ["#15171c"] } }, image: `/products/cutter-003553/003553.webp`, images: [`/products/cutter-003553/003553.webp`, `/products/cutter-003553/003553-2.webp`, `/products/cutter-003553/003553-3.webp`] },
    ],
  },
  {
    slug: `cutter-003441`,
    name: { pt: `Suporte para Charuto`, en: `Cigar stand` },
    description: { pt: `Homenagem ao cativante universo de 20,000 Leagues Under The Sea, esta edição limitada expressa todo o savoir-faire da S.T. Dupont. Publicado em 1870, o romance narra a viagem de três náufragos capturados pelo Capitão Nemo, o misterioso inventor que percorre os fundos marinhos a bordo do Nautilus, um submarino muito à frente das tecnologias da sua época. Vigias, turbinas, corais, barbatanas e outros tentáculos de lulas gigantes inspiram esta edição limitada e as suas três gamas, todas relacionadas com diferentes capítulos do livro. Uma história em três actos em que mergulhar com paixão. Para a gama Premium desta edição 20,000 Leagues Under The Sea, a S.T. Dupont narra dois outros capítulos: «4000 léguas sob o Pacífico», capítulo 18 do livro, e «Gulf Stream», capítulo 19 da sua segunda parte. Neste último, Júlio Verne evoca a Corrente do Golfo, uma força natural que molda o movimento dos oceanos e dos que neles se encontram. Veloz e perigosa, permite também ao Capitão Nemo demonstrar a sua excelência. Corta-charutos de mesa decorado em laca azul e com o logótipo Nautilus gravado, acabamentos em crómio e brilhantes.`, en: `Tribute to the captivating universe of 20,000 leagues under the seas, this limited edition expresses all the know-how of S.T. Dupont. Published in 1870, the novel recounts the journey of three castaways captured by Captain Nemo, this mysterious inventor who travels the seabed aboard the Nautilus, submarine very ahead of the technologies of the time. Portholes, turbines, corals, fins and other tentacles of giant squid inspire this limited edition and its three ranges, all related to different chapters of the book. A story in three stages in which to dive with passion. For the Premium range of this edition 20,000 leagues under the seas, S.T. Dupont tells two other chapters: «4000 leagues under the Pacific», chapter 18 of the book, and «Gulf Stream», chapter 19 of its second part. In the latter, Jules Verne evokes the Gulf Stream, a natural force shaping the movement of the oceans and those who are there. Fast-moving and perilous, it also allows Captain Nemo to demonstrate his excellence. Cigar cutters stand decorated with a blue lacquer and the engraved Nautilus logo, chrome and shiny finishes.` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003441/003441.webp`,
    variants: [
      { sku: `003441`, name: { pt: `Suporte para Charuto — Azul Gulf Stream`, en: `Cigar stand — Blue Gulf Stream` }, priceCents: 23500, currency: "EUR", attributes: { color: { label: { pt: `Azul Gulf Stream`, en: `Blue Gulf Stream` }, hex: ["#1f3c66"] } }, image: `/products/cutter-003441/003441.webp`, images: [`/products/cutter-003441/003441.webp`, `/products/cutter-003441/003441-2.webp`, `/products/cutter-003441/003441-3.webp`] },
    ],
  },
  {
    slug: `cutter-003442`,
    name: { pt: `Suporte para Charuto`, en: `Cigar stand` },
    description: { pt: `Homenagem ao cativante universo de 20,000 Leagues Under The Sea, esta edição limitada expressa todo o savoir-faire da S.T. Dupont. Publicado em 1870, o romance narra a viagem de três náufragos capturados pelo Capitão Nemo, o misterioso inventor que percorre os fundos marinhos a bordo do Nautilus, um submarino muito à frente das tecnologias da sua época. Vigias, turbinas, corais, barbatanas e outros tentáculos de lulas gigantes inspiram esta edição limitada e as suas três gamas, todas relacionadas com diferentes capítulos do livro. Uma história em três actos em que mergulhar com paixão. Para a gama Premium desta edição 20,000 Leagues Under The Sea, a S.T. Dupont narra dois outros capítulos: «4000 léguas sob o Pacífico», capítulo 18 do livro, e «Gulf Stream», capítulo 19 da sua segunda parte. «4000 Léguas Sob o Pacífico» marca o momento em que o Nautilus alcança grandes profundidades e a sua tripulação descobre a imensidão do mundo subaquático, entre águas transparentes e abismos marinhos. Corta-charutos de mesa decorado em laca turquesa e com o logótipo Nautilus gravado, acabamentos dourados e brilhantes.`, en: `Tribute to the captivating universe of 20,000 leagues under the seas, this limited edition expresses all the know-how of S.T. Dupont. Published in 1870, the novel recounts the journey of three castaways captured by Captain Nemo, this mysterious inventor who travels the seabed aboard the Nautilus, submarine very ahead of the technologies of the time. Portholes, turbines, corals, fins and other tentacles of giant squid inspire this limited edition and its three ranges, all related to different chapters of the book. A story in three stages in which to dive with passion. For the Premium range of this edition 20,000 leagues under the seas, S.T. Dupont tells two other chapters: «4000 leagues under the Pacific», chapter 18 of the book, and «Gulf Stream», chapter 19 of its second part. "4000 Leagues Under the Pacific" marks the moment when the Nautilus reaches great depths and its crew discovers the immensity of the underwater world, between transparent waters and marine depths. Cigar cutters stand decorated with a turquoise lacquer and the engraved Nautilus logo, golden and shiny finishes.` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003442/003442.webp`,
    variants: [
      { sku: `003442`, name: { pt: `Suporte para Charuto — Verde Pacífico`, en: `Cigar stand — Green Pacific` }, priceCents: 23500, currency: "EUR", attributes: { color: { label: { pt: `Verde Pacífico`, en: `Green Pacific` }, hex: ["#3b5d39"] } }, image: `/products/cutter-003442/003442.webp`, images: [`/products/cutter-003442/003442.webp`, `/products/cutter-003442/003442-2.webp`, `/products/cutter-003442/003442-3.webp`] },
    ],
  },
  {
    slug: `cutter-003460f`,
    name: { pt: `cigar stand`, en: `cigar stand` },
    description: { pt: `Corta-charutos de mesa — Laca preta brilhante decorada com o monograma X multicolor e o brasão Opus X Fuente gravados na lâmina frontal; gravação icónica do D na lâmina traseira. Guilloché em ponta de diamante. Acabamentos dourados.`, en: `Cigar Cutter Stand - Black glossy lacquer decorated with the multicolor X monogram and Opus X Fuente crest engraved on the front blade; iconic D engraving on the rear blade. Diamond-point guilloché. Gold finishes.` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003460f/003460F.webp`,
    variants: [
      { sku: `003460F`, name: { pt: `cigar stand — Multicor`, en: `cigar stand — Multicolor` }, priceCents: 23500, currency: "EUR", attributes: { color: { label: { pt: `Multicor`, en: `Multicolor` }, hex: ["#c8a24a"] } }, image: `/products/cutter-003460f/003460F.webp`, images: [`/products/cutter-003460f/003460F.webp`, `/products/cutter-003460f/003460F-2.webp`, `/products/cutter-003460f/003460F-3.webp`] },
    ],
  },
  {
    slug: `cutter-003445`,
    name: { pt: `Cigare stand`, en: `Cigare stand` },
    description: { pt: `A Fender®, a mais famosa marca de guitarras, abre uma boutique no vibrante bairro de Harajuku, em Tóquio. Por esta ocasião, e pela segunda vez, a S.T. Dupont e a Fender® colaboram, imaginando uma linha rock inspirada no savoir-faire de ambas as casas e também no Japão. Com o seu trabalho da laca inspirado no kintsugi, e ainda o regresso de um antigo savoir-faire com pó de ouro aplicado à mão, esta colaboração faz seu o universo criativo da música. Corta-charutos Fender® com logótipo S.T. Dupont gravado. Acabamento dourado e laca brilhante.`, en: `Fender®, the most famous guitar brand in Tokyo, is opening a boutique in the vibrant Harajuku area. On this occasion, and for the second time, S.T. Dupont and Fender® collaborate, imagining a rock line inspired by the know-how of both houses, as well as Japan. With his work of the lacquer inspired by kintsugi, but also the return of an ancient know-how with gold powder applied by hand, this collaboration makes its own the creativity of the musical universe. Fender® cigar cutter with engraved S.T.Dupont logo. Gold finish and glossy lacquer.` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003445/003445.webp`,
    variants: [
      { sku: `003445`, name: { pt: `Cigare stand — Preto`, en: `Cigare stand — Black` }, priceCents: 23000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/cutter-003445/003445.webp`, images: [`/products/cutter-003445/003445.webp`, `/products/cutter-003445/003445-2.webp`, `/products/cutter-003445/003445-3.webp`] },
    ],
  },
  {
    slug: `cutter-003550`,
    name: { pt: `Cigare stand`, en: `Cigare stand` },
    description: { pt: `Para celebrar o 150.º aniversário de Romeo y Julieta, a S.T. Dupont assina uma colaboração exclusiva, inspirada na força da paixão e do savoir-faire. Uma homenagem à arte dos charutos de excepção e à beleza dos objectos intemporais. Corta-charutos de mesa decorado em laca vermelha brilhante na frente, com o brasão gravado na lâmina. Laca branca brilhante no verso, com a icónica gravação D. Acabamentos dourados.`, en: `To celebrate the 150th anniversary of Romeo and Julieta, S.T. Dupont signs an exclusive collaboration, inspired by the strength of passion and expertise. A tribute to the art of exceptional cigars and the beauty of timeless objects. Cigar cutters stand decorated with a shiny red lacquer on the front and the coat of arms engraved on the blade. Glossy white lacquer on the back with the iconic engraving D. Golden finishes.` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003550/003550.webp`,
    variants: [
      { sku: `003550`, name: { pt: `Cigare stand — Bordô`, en: `Cigare stand — Burgundy` }, priceCents: 23500, currency: "EUR", attributes: { color: { label: { pt: `Bordô`, en: `Burgundy` }, hex: ["#7d2b27"] } }, image: `/products/cutter-003550/003550.webp`, images: [`/products/cutter-003550/003550.webp`, `/products/cutter-003550/003550-2.webp`, `/products/cutter-003550/003550-3.webp`] },
    ],
  },
  {
    slug: `cutter-003418`,
    name: { pt: `Lâmina Dupla`, en: `Double blade` },
    description: { pt: `Corta-charutos de lâmina dupla, equipado com lâmina dupla e uma lâmina V-CUT. Acabamento em crómio.`, en: `Double blade cigar cutter, equipped with a double blade and a V-CUT blade. Chrome finish.` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003418/003418.webp`,
    variants: [
      { sku: `003418`, name: { pt: `Lâmina Dupla — Prateado`, en: `Double blade — Silver` }, priceCents: 20000, currency: "EUR", attributes: { color: { label: { pt: `Prateado`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/cutter-003418/003418.webp`, images: [`/products/cutter-003418/003418.webp`, `/products/cutter-003418/003418-2.webp`, `/products/cutter-003418/003418-3.webp`] },
    ],
  },
  {
    slug: `cutter-003451r`,
    name: { pt: `Lâmina Dupla`, en: `Double blade` },
    description: { pt: `Este ano, a S.T. Dupont reintroduz o padrão de camuflagem nos seus produtos icónicos. Para um toque adicional de originalidade, esta camuflagem incorpora chamas em tons vibrantes de vermelho e verde, criando uma interpretação fresca e audaz deste design lendário. Corta-charutos tradicional de lâmina dupla. Acabamento em crómio e padrão de camuflagem vermelha.`, en: `This year, S.T. Dupont is reintroducing the camouflage pattern on its iconic products. For added originality, this camouflage incorporates flames in vibrant shades of red and green, creating a fresh and bold interpretation of this legendary design. Traditional double-blade cigar cutter. Chrome finish and red camouflage pattern.` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003451r/003451R.webp`,
    variants: [
      { sku: `003451R`, name: { pt: `Lâmina Dupla — Vermelho`, en: `Double blade — Red` }, priceCents: 16500, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/cutter-003451r/003451R.webp`, images: [`/products/cutter-003451r/003451R.webp`, `/products/cutter-003451r/003451R-2.webp`, `/products/cutter-003451r/003451R-3.webp`] },
    ],
  },
  {
    slug: `cutter-003450g`,
    name: { pt: `Lâmina Dupla`, en: `Double blade` },
    description: { pt: `Este ano, a S.T. Dupont reintroduz o padrão de camuflagem nos seus produtos icónicos. Para um toque adicional de originalidade, esta camuflagem incorpora chamas em tons vibrantes de vermelho e verde, criando uma interpretação fresca e audaz deste design lendário. Corta-charutos tradicional de lâmina dupla. Acabamento em crómio e padrão de camuflagem verde.`, en: `This year, S.T. Dupont is reintroducing the camouflage pattern on its iconic products. For added originality, this camouflage incorporates flames in vibrant shades of red and green, creating a fresh and bold interpretation of this legendary design. Traditional double-blade cigar cutter. Chrome finish and green camouflage pattern.` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003450g/003450G.webp`,
    variants: [
      { sku: `003450G`, name: { pt: `Lâmina Dupla — Verde & Caqui`, en: `Double blade — Green & Khaki` }, priceCents: 16500, currency: "EUR", attributes: { color: { label: { pt: `Verde & Caqui`, en: `Green & Khaki` }, hex: ["#3b5d39"] } }, image: `/products/cutter-003450g/003450G.webp`, images: [`/products/cutter-003450g/003450G.webp`, `/products/cutter-003450g/003450G-2.webp`, `/products/cutter-003450g/003450G-3.webp`] },
    ],
  },
  {
    slug: `cutter-003280p`,
    name: { pt: `Furador Duplo`, en: `Double puncher` },
    description: { pt: `Corta-charutos perfurador duplo, decorado em laca preta brilhante e acabamento em crómio. 2 diâmetros de corte: 8,6 mm e 11,6 mm`, en: `Double puncher cigar cutter, decorated with gloss black lacquer and chrome finish. 2 cutting diameters: 8.6mm and 11.6mm` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003280p/003280P.webp`,
    variants: [
      { sku: `003280P`, name: { pt: `Furador Duplo — Prateado`, en: `Double puncher — Silver` }, priceCents: 24000, currency: "EUR", attributes: { color: { label: { pt: `Prateado`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/cutter-003280p/003280P.webp`, images: [`/products/cutter-003280p/003280P.webp`, `/products/cutter-003280p/003280P-2.webp`, `/products/cutter-003280p/003280P-3.webp`] },
    ],
  },
  {
    slug: `cutter-003281p`,
    name: { pt: `Furador Duplo`, en: `Double puncher` },
    description: { pt: `Corta-charutos perfurador duplo, decorado em laca preta brilhante e acabamento em crómio. 2 diâmetros de corte: 8,6 mm e 11,6 mm`, en: `Double puncher cigar cutter, decorated with gloss black lacquer and chrome finish. 2 cutting diameters: 8.6mm and 11.6mm` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003281p/003281P.webp`,
    variants: [
      { sku: `003281P`, name: { pt: `Furador Duplo — Preto`, en: `Double puncher — Black` }, priceCents: 25000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/cutter-003281p/003281P.webp`, images: [`/products/cutter-003281p/003281P.webp`, `/products/cutter-003281p/003281P-2.webp`, `/products/cutter-003281p/003281P-3.webp`] },
    ],
  },
  {
    slug: `cutter-003282p`,
    name: { pt: `Furador Duplo`, en: `Double puncher` },
    description: { pt: `Corta-charutos perfurador duplo, decorado em laca preta brilhante e acabamento em crómio. 2 diâmetros de corte: 8,6 mm e 11,6 mm`, en: `Double puncher cigar cutter, decorated with gloss black lacquer and chrome finish. 2 cutting diameters: 8.6mm and 11.6mm` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003282p/003282P.webp`,
    variants: [
      { sku: `003282P`, name: { pt: `Furador Duplo — Dourado & Dourado`, en: `Double puncher — Gold & Golden` }, priceCents: 25000, currency: "EUR", attributes: { color: { label: { pt: `Dourado & Dourado`, en: `Gold & Golden` }, hex: ["#c8a24a"] } }, image: `/products/cutter-003282p/003282P.webp`, images: [`/products/cutter-003282p/003282P.webp`, `/products/cutter-003282p/003282P-2.webp`, `/products/cutter-003282p/003282P-3.webp`] },
    ],
  },
  {
    slug: `cutter-003203p`,
    name: { pt: `Furador Duplo`, en: `Double puncher` },
    description: { pt: `Para celebrar o 15.º aniversário da Línea Behike, a S.T. Dupont uniu-se à Cohiba numa colecção exclusiva de isqueiros e acessórios. Inspirada nos códigos emblemáticos da Behike, conjuga xadrez a preto e branco, acabamentos dourados e uma laca preta profunda. A efígie «Behike», revisitada pelos artífices ourives da S.T. Dupont, sublima esta colaboração única, uma homenagem ao savoir-faire e à excelência de ambas as casas. Corta-charutos perfurador duplo decorado em laca preta mate e motivo Cohiba, acabamento brilhante. 2 diâmetros de corte de 8,6 mm e 11,6 mm.`, en: `To celebrate the 15th anniversary of Línea Behike, S.T. Dupont has teamed up with Cohiba for an exclusive collection of lighters and accessories. Inspired by Behike's emblematic codes, it combines black and white checks, gold finishes and deep black lacquer. The “Behike” effigy, revisited by the goldsmiths at S.T. Dupont, sublimates this unique collaboration, a tribute to the know-how and excellence of both houses. Double puncher cigar cutter decorated with matte black lacquer and Cohiba motif, gloss finish. 2 cutting diameters of 8.6mm and 11.6mm` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003203p/003203P.webp`,
    variants: [
      { sku: `003203P`, name: { pt: `Furador Duplo — Preto`, en: `Double puncher — Black` }, priceCents: 25000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/cutter-003203p/003203P.webp`, images: [`/products/cutter-003203p/003203P.webp`, `/products/cutter-003203p/003203P-2.webp`, `/products/cutter-003203p/003203P-3.webp`] },
    ],
  },
  {
    slug: `cutter-420024l`,
    name: { pt: `Caneta de Tinta Permanente Grande`, en: `Foutain Pen Large` },
    description: { pt: `A colecção Graff'ty inspira-se na street art, transformando isqueiros e canetas em verdadeiras obras de arte. Cores vivas e mosaicos de vermelho, amarelo e azul irrompem nas peças Ligne 2, Biggy, Line D Eternity e nos acessórios para charutos (cinzeiro, corta-charutos, estojo). Esta colecção convida todos a acender a chama da criatividade. Caneta de tinta permanente Line D Eternity Large em laca Dupont multicolor brilhante com acabamento em paládio. Tampa de ourives em guilloché oblíquo. Bico em ouro maciço de 14 quilates. Êmbolo incluído. Disponível nas versões rollerball e tinta permanente. Recargas associadas: 040112 Azul - 040110 Preta - 040362 Vermelha - 040363 Verde - 040364 Turquesa. Esta caneta de tinta permanente é fornecida com um bico médio, para um traço de escrita de aproximadamente 0,55 mm.`, en: `The Graff'ty collection is inspired by street art, turning lighters and pens into veritable works of art. Bright colours and mosaics of red, yellow and blue burst forth on Ligne 2, Biggy, Line D Eternity and cigar accessories (ashtray, cigar cutter, case). This collection invites everyone to light the flame of creativity. Line D Eternity large fountain pen in glossy multicolour Dupont lacquer with palladium finish. Goldsmith's guilloche oblique cap. Solid 14-carat gold nib. Piston included. Available in rollerball and nib versions. Related refills: 040112 Blue - 040110 Black - 040362 Red - 040363 Green - 040364 Turquoise This fountain pen comes with a medium nib, for a writing size of apporox. 0.55 mm.` },
    collection: `Cortador de Charuto`,
    categorySlug: "escrita",
    image: `/products/cutter-420024l/420024L.webp`,
    variants: [
      { sku: `420024L`, name: { pt: `Foutain Pen Large — Multicor`, en: `Foutain Pen Large — Multicolor` }, priceCents: 94000, currency: "EUR", attributes: { color: { label: { pt: `Multicor`, en: `Multicolor` }, hex: ["#c8a24a"] } }, image: `/products/cutter-420024l/420024L.webp`, images: [`/products/cutter-420024l/420024L.webp`, `/products/cutter-420024l/420024L-2.webp`, `/products/cutter-420024l/420024L-3.webp`, `/products/cutter-420024l/420024L-4.webp`] },
    ],
  },
  {
    slug: `cutter-003265`,
    name: { pt: `Guilhotina`, en: `Guillotine` },
    description: { pt: `Corta-charutos de lâmina dupla, para cortes consistentemente perfeitos. Acabamento preto.`, en: `Double blade cigar cutter, for consistently perfect cuts. Black finish.` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003265/003265.webp`,
    variants: [
      { sku: `003265`, name: { pt: `Guilhotina — Preto`, en: `Guillotine — Black` }, priceCents: 17000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/cutter-003265/003265.webp`, images: [`/products/cutter-003265/003265.webp`, `/products/cutter-003265/003265-2.webp`, `/products/cutter-003265/003265-3.webp`] },
    ],
  },
  {
    slug: `cutter-003266`,
    name: { pt: `Guilhotina`, en: `Guillotine` },
    description: { pt: `Corta-charutos de lâmina dupla, para cortes consistentemente perfeitos. Acabamento em crómio.`, en: `Double blade cigar cutter, for consistently perfect cuts. Chrome finish.` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003266/003266.webp`,
    variants: [
      { sku: `003266`, name: { pt: `Guilhotina — Prateado`, en: `Guillotine — Silver` }, priceCents: 17000, currency: "EUR", attributes: { color: { label: { pt: `Prateado`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/cutter-003266/003266.webp`, images: [`/products/cutter-003266/003266.webp`, `/products/cutter-003266/003266-2.webp`, `/products/cutter-003266/003266-3.webp`] },
    ],
  },
  {
    slug: `cutter-003257`,
    name: { pt: `Guilhotina`, en: `Guillotine` },
    description: { pt: `Corta-charutos de lâmina dupla, equipado com lâmina dupla e uma lâmina V-CUT. Decorado com uma grelha em acabamento crómio.`, en: `Double blade cigar cutter, equipped with a double blade and a V-CUT blade. Decorated with a chrome finish grid.` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003257/003257.webp`,
    variants: [
      { sku: `003257`, name: { pt: `Guilhotina — Prateado`, en: `Guillotine — Silver` }, priceCents: 17000, currency: "EUR", attributes: { color: { label: { pt: `Prateado`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/cutter-003257/003257.webp`, images: [`/products/cutter-003257/003257.webp`, `/products/cutter-003257/003257-2.webp`, `/products/cutter-003257/003257-3.webp`] },
    ],
  },
  {
    slug: `cutter-003394`,
    name: { pt: `Guilhotina`, en: `Guillotine` },
    description: { pt: `Corta-charutos tradicional de lâmina dupla. Acabamento preto mate.`, en: `Traditional double blade cigar cutter. Matte black finish.` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003394/003394.webp`,
    variants: [
      { sku: `003394`, name: { pt: `Guilhotina — Preto`, en: `Guillotine — Black` }, priceCents: 21000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/cutter-003394/003394.webp`, images: [`/products/cutter-003394/003394.webp`, `/products/cutter-003394/003394-2.webp`, `/products/cutter-003394/003394-3.webp`] },
    ],
  },
  {
    slug: `cutter-003370`,
    name: { pt: `Guilhotina`, en: `Guillotine` },
    description: { pt: `Inspirada na X-Bag, uma das malas da colecção de marroquinaria desenvolvida esta temporada pela S.T. Dupont, Fire X apresenta a sua reinterpretação da icónica ponta de chama sobre os clássicos da Maison. Corta-charutos tradicional decorado com o motivo Fire X e acabamentos em crómio.`, en: `Inspired by the X-Bag, one of the bags from the leather goods collection developed this season by S.T. Dupont, Fire X presents its reinterpretation of the iconic flame tip on the classics of the House. Traditional cigar cutter decorated with the Fire X motif and chrome finishes.` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003370/003370.webp`,
    variants: [
      { sku: `003370`, name: { pt: `Guilhotina — Preto`, en: `Guillotine — Black` }, priceCents: 22000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/cutter-003370/003370.webp`, images: [`/products/cutter-003370/003370.webp`, `/products/cutter-003370/003370-2.webp`, `/products/cutter-003370/003370-3.webp`] },
    ],
  },
  {
    slug: `cutter-183034`,
    name: { pt: `Leather case`, en: `Leather case` },
    description: { pt: `Montecristo e S.T. Dupont, ambos sinónimos de um savoir-faire único, unem-se para criar produtos de excepção. Esta nova colecção encantará os fãs de ambas as marcas. O estojo para 3 charutos, em couro e metal dourado, está marcado com o brasão Montecristo e a decoração L'Aurore. A colecção inclui 3 isqueiros: Ligne 2, Le Grand Dupont, Maxijet. Também duas canetas da colecção Line D Large e acessórios: um corta-charutos, um grande cinzeiro e um par de botões de punho.`, en: `Montecristo and S.T. Dupont, both synonymous with unique craftsmanship, have joined forces to create exceptional products. This new collection will delight fans of both brands. The leather and gold metal 3-cigar case is stamped with the Montecristo coat of arms and the L'Aurore pattern. The collection includes 3 lighters: Ligne 2, Le Grand Dupont, Maxijet. Also, two pens from the Line D Large collection and accessories: a cigar cutter, a large ashtray and a pair of cufflinks.` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-183034/183034.webp`,
    variants: [
      { sku: `183034`, name: { pt: `Leather case — Violeta`, en: `Leather case — Violet` }, priceCents: 31000, currency: "EUR", attributes: { color: { label: { pt: `Violeta`, en: `Violet` }, hex: ["#6b4a8a"] } }, image: `/products/cutter-183034/183034.webp`, images: [`/products/cutter-183034/183034.webp`, `/products/cutter-183034/183034-2.webp`, `/products/cutter-183034/183034-3.webp`] },
    ],
  },
  {
    slug: `cutter-183203`,
    name: { pt: `Leather case`, en: `Leather case` },
    description: { pt: `Para celebrar o 15.º aniversário da Línea Behike, a S.T. Dupont uniu-se à Cohiba numa colecção exclusiva de isqueiros e acessórios. Inspirada nos códigos emblemáticos da Behike, conjuga xadrez a preto e branco, acabamentos dourados e uma laca preta profunda. A efígie «Behike», revisitada pelos artífices ourives da S.T. Dupont, valoriza esta colaboração única, uma homenagem ao savoir-faire e à excelência de ambas as casas. Estojo para 2 charutos, motivo Behike. Couro de vitela. Base preta mate.`, en: `To celebrate the 15th anniversary of Línea Behike, S.T. Dupont has teamed up with Cohiba for an exclusive collection of lighters and accessories. Inspired by Behike's emblematic codes, it combines black and white checks, gold finishes and deep black lacquer. The “Behike” effigy, revisited by the goldsmiths at S.T. Dupont goldsmiths, enhances this unique collaboration, a tribute to the know-how and e*cellence of both houses. Case for 2 cigars, Behike motif. Calf leather. Matte black base` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-183203/183203.webp`,
    variants: [
      { sku: `183203`, name: { pt: `Leather case — Preto`, en: `Leather case — Black` }, priceCents: 28000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/cutter-183203/183203.webp`, images: [`/products/cutter-183203/183203.webp`, `/products/cutter-183203/183203-2.webp`, `/products/cutter-183203/183203-3.webp`] },
    ],
  },
  {
    slug: `cutter-003480`,
    name: { pt: `Corte Perfeito`, en: `Perfect cut` },
    description: { pt: `Corta-charutos Cutter Slim Perfect Cut, decorado em laca preta e acabamento em crómio. 23 mm de diâmetro e profundidade de corte ajustável de 2,7 mm`, en: `Cutter Slim Perfect Cut cigar cutter, decorated in black lacquer and chrome finish. 23 mm diameter and 2.7 mm adjustable cutting depth` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003480/003480.webp`,
    variants: [
      { sku: `003480`, name: { pt: `Corte Perfeito — Prateado`, en: `Perfect cut — Silver` }, priceCents: 20000, currency: "EUR", attributes: { color: { label: { pt: `Prateado`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/cutter-003480/003480.webp`, images: [`/products/cutter-003480/003480.webp`, `/products/cutter-003480/003480-2.webp`, `/products/cutter-003480/003480-3.webp`] },
    ],
  },
  {
    slug: `cutter-003481`,
    name: { pt: `Corte Perfeito`, en: `Perfect cut` },
    description: { pt: `Corta-charutos Cutter Slim Perfect Cut, decorado em laca preta e acabamento em crómio. 23 mm de diâmetro e profundidade de corte ajustável de 2,7 mm`, en: `Cutter Slim Perfect Cut cigar cutter, decorated in black lacquer and chrome finish. 23 mm diameter and 2.7 mm adjustable cutting depth` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003481/003481.webp`,
    variants: [
      { sku: `003481`, name: { pt: `Corte Perfeito — Preto`, en: `Perfect cut — Black` }, priceCents: 20000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/cutter-003481/003481.webp`, images: [`/products/cutter-003481/003481.webp`, `/products/cutter-003481/003481-2.webp`, `/products/cutter-003481/003481-3.webp`] },
    ],
  },
  {
    slug: `cutter-003482`,
    name: { pt: `Corte Perfeito`, en: `Perfect cut` },
    description: { pt: `Corta-charutos Cutter Slim Perfect Cut, decorado em laca preta e acabamento em crómio. 23 mm de diâmetro e profundidade de corte ajustável de 2,7 mm`, en: `Cutter Slim Perfect Cut cigar cutter, decorated in black lacquer and chrome finish. 23 mm diameter and 2.7 mm adjustable cutting depth` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003482/003482.webp`,
    variants: [
      { sku: `003482`, name: { pt: `Corte Perfeito — Dourado & Dourado`, en: `Perfect cut — Gold & Golden` }, priceCents: 20000, currency: "EUR", attributes: { color: { label: { pt: `Dourado & Dourado`, en: `Gold & Golden` }, hex: ["#c8a24a"] } }, image: `/products/cutter-003482/003482.webp`, images: [`/products/cutter-003482/003482.webp`, `/products/cutter-003482/003482-2.webp`, `/products/cutter-003482/003482-3.webp`] },
    ],
  },
  {
    slug: `cutter-003262`,
    name: { pt: `Puncher`, en: `Puncher` },
    description: { pt: `Corta-charutos perfurador porta-chaves, decorado em laca preta e acabamentos em crómio. Diâmetro de corte de 8,6 mm.`, en: `Keychain cigar punch cutter, decorated in black lacquer and chrome finishes. Cutting diameter of 8.6mm.` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003262/003262.webp`,
    variants: [
      { sku: `003262`, name: { pt: `Puncher — Preto`, en: `Puncher — Black` }, priceCents: 11500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/cutter-003262/003262.webp`, images: [`/products/cutter-003262/003262.webp`, `/products/cutter-003262/003262-2.webp`, `/products/cutter-003262/003262-3.webp`] },
    ],
  },
  {
    slug: `cutter-422024l`,
    name: { pt: `Rollerball Grande`, en: `Rollerball Pen Large` },
    description: { pt: `A colecção Graff'ty inspira-se na street art, transformando isqueiros e canetas em verdadeiras obras de arte. Cores vivas e mosaicos de vermelho, amarelo e azul irrompem nas peças Ligne 2, Biggy, Line D Eternity e nos acessórios para charutos (cinzeiro, corta-charutos, estojo). Esta colecção convida todos a acender a chama da criatividade. Caneta rollerball Line D Eternity Large em laca Dupont multicolor brilhante com acabamento em paládio. Tampa de ourives com guilloché oblíquo. Disponível nas versões rollerball e tinta permanente. Recargas associadas: 040840 Azul - 040841 Preta`, en: `The Graff'ty collection is inspired by street art, turning lighters and pens into veritable works of art. Bright colours and mosaics of red, yellow and blue burst forth on Ligne 2, Biggy, Line D Eternity and cigar accessories (ashtray, cigar cutter, case). This collection invites everyone to light the flame of creativity. Line D Eternity large rollerball pen in glossy multicolour Dupont lacquer with palladium finish. Goldsmith's cap with oblique guilloche. Available in rollerball and fountain pen versions. Related refills: 040840 Blue - 040841 Black` },
    collection: `Cortador de Charuto`,
    categorySlug: "escrita",
    image: `/products/cutter-422024l/422024L.webp`,
    variants: [
      { sku: `422024L`, name: { pt: `Rollerball Pen Large — Multicor`, en: `Rollerball Pen Large — Multicolor` }, priceCents: 76500, currency: "EUR", attributes: { color: { label: { pt: `Multicor`, en: `Multicolor` }, hex: ["#c8a24a"] } }, image: `/products/cutter-422024l/422024L.webp`, images: [`/products/cutter-422024l/422024L.webp`, `/products/cutter-422024l/422024L-2.webp`, `/products/cutter-422024l/422024L-3.webp`, `/products/cutter-422024l/422024L-4.webp`] },
    ],
  },  // === END WWW CIGAR CUTTERS ===

  // ===== NEW PRODUCTS — June 2026 scrape (www.st-dupont.com + en.st-dupont.com) =====
  {
    slug: `cufflinks-cohiba`,
    name: { pt: `Botões de Punho · Cohiba`, en: `Cufflinks · Cohiba` },
    description: { pt: `Para celebrar o 60.º aniversário da Cohiba, a S.T. Dupont revela uma colecção exclusiva de isqueiros e acessórios, simbolizando o refinamento absoluto e uma herança de excepção. Inspirada nos elementos icónicos do design da marca, a colecção conjuga a vitola preta e dourada, a emblemática cabeça de índio e o característico motivo quadriculado. Cada peça revela um subtil equilíbrio entre estética e precisão artesanal, encarnando a exclusividade, o prestígio e o savoir-faire excepcional de ambas as Maisons, ao gosto dos mais exigentes conhecedores de charutos. Botões de punho dourados gravados com a cabeça de índio, com efeito de impressão digital.`, en: `To celebrate Cohiba’s 60th anniversary, S.T. Dupont unveils an exclusive collection of lighters and accessories, symbolizing absolute refinement and an exceptional heritage. Inspired by the brand’s iconic design elements, the collection combines the black and gold band, the emblematic Native American head, and the signature square motif. Each piece reveals a subtle balance between aesthetics and artisanal precision, embodying the exclusivity, prestige, and exceptional craftsmanship of both Houses, appealing to the most discerning cigar connoisseurs. Gold cufflinks engraved with the Native American head, featuring a fingerprint effect.` },
    collection: `Cohiba`,
    categorySlug: "acessorios",
    image: `/products/cufflinks-cohiba/005772.webp`,
    variants: [
      { sku: `005772`, name: { pt: `Cufflinks · Cohiba — Dourado & Dourado`, en: `Cufflinks · Cohiba — Gold & Golden` }, priceCents: 32500, currency: "EUR", attributes: { color: { label: { pt: `Dourado & Dourado`, en: `Gold & Golden` }, hex: ["#c8a24a"] } }, image: `/products/cufflinks-cohiba/005772.webp`, images: [`/products/cufflinks-cohiba/005772.webp`, `/products/cufflinks-cohiba/005772-2.webp`, `/products/cufflinks-cohiba/005772-3.webp`] },
    ],
  },
  {
    slug: `ligne-2-cohiba`,
    name: { pt: `Ligne 2 · Cohiba`, en: `Ligne 2 · Cohiba` },
    description: { pt: `Para celebrar o 60.º aniversário da Cohiba, a S.T. Dupont revela uma colecção exclusiva de isqueiros e acessórios, simbolizando o refinamento absoluto e uma herança de excepção. Inspirada nos elementos icónicos do design da marca, a colecção conjuga a vitola preta e dourada, a emblemática cabeça de índio e o característico motivo quadriculado. Cada peça revela um subtil equilíbrio entre estética e precisão artesanal, encarnando a exclusividade, o prestígio e o savoir-faire excepcional de ambas as Maisons, ao gosto dos mais exigentes conhecedores de charutos. Isqueiro Ligne 2 Cling em laca preta brilhante, ornamentado com o logótipo do 60.º aniversário da Cohiba e a cabeça de índio perfurada, com acabamentos dourados. Tampa decorada com o padrão xadrez Cohiba em acabamento guilloché com detalhes dourados. Apresenta uma dupla chama amarela. Pedra de isqueiro compatível: preta (REF 900601). Recarga de gás compatível: vermelha (REF 900435). Isqueiro entregue sem gás; recarga vendida em separado.`, en: `To celebrate Cohiba’s 60th anniversary, S.T. Dupont unveils an exclusive collection of lighters and accessories, symbolizing absolute refinement and an exceptional heritage. Inspired by the brand’s iconic design elements, the collection combines the black and gold band, the emblematic Native American head, and the signature square motif. Each piece reveals a subtle balance between aesthetics and artisanal precision, embodying the exclusivity, prestige, and exceptional craftsmanship of both Houses, appealing to the most discerning cigar connoisseurs. Ligne 2 Cling lighter in glossy black lacquer, adorned with the Cohiba 60th anniversary logo and the perforated Native American head, with gold finishes. Cap decorated with the Cohiba checkerboard pattern in a guilloché finish with gold accents. Features a double yellow flame. Matching lighter flint: black (REF 900601) Matching gas refill: red (REF 900435) Lighter shipped empty of gas; refill sold separately.` },
    collection: `Cohiba`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-cohiba/016472N.webp`,
    variants: [
      { sku: `016472N`, name: { pt: `Ligne 2 · Cohiba — Preto`, en: `Ligne 2 · Cohiba — Black` }, priceCents: 201500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/ligne-2-cohiba/016472N.webp`, images: [`/products/ligne-2-cohiba/016472N.webp`, `/products/ligne-2-cohiba/016472N-2.webp`, `/products/ligne-2-cohiba/016472N-3.webp`, `/products/ligne-2-cohiba/016472N-4.webp`] },
    ],
  },
  {
    slug: `le-grand-dupont-cohiba`,
    name: { pt: `Le Grand Dupont · Cohiba`, en: `Le Grand Dupont · Cohiba` },
    description: { pt: `Para celebrar o 60.º aniversário da Cohiba, a S.T. Dupont revela uma colecção exclusiva de isqueiros e acessórios, simbolizando o refinamento absoluto e uma herança de excepção. Inspirada nos elementos icónicos do design da marca, a colecção conjuga a vitola preta e dourada, a emblemática cabeça de índio e o característico motivo quadriculado. Cada peça revela um subtil equilíbrio entre estética e precisão artesanal, encarnando a exclusividade, o prestígio e o savoir-faire excepcional de ambas as Maisons, ao gosto dos mais exigentes conhecedores de charutos. Isqueiro Le Grand Dupont ornamentado com laca preta brilhante e um perfil de índio esculpido com efeito de relevo. Pó de ouro aplicado nas costas do isqueiro juntamente com o logótipo do 60.º aniversário da Cohiba. Tampa decorada com o padrão xadrez Cohiba num design guilloché com acabamento dourado. Apresenta um sistema de dupla ignição à escolha entre chama amarela ou azul. Pedra de isqueiro compatível: vermelha (REF 900651). Recarga de gás compatível: vermelha (REF 900435). Isqueiro entregue sem gás; recarga vendida em separado. Chave de fendas incluída para trocar a pedra.`, en: `To celebrate Cohiba’s 60th anniversary, S.T. Dupont unveils an exclusive collection of lighters and accessories, symbolizing absolute refinement and an exceptional heritage. Inspired by the brand’s iconic design elements, the collection combines the black and gold band, the emblematic Native American head, and the signature square motif. Each piece reveals a subtle balance between aesthetics and artisanal precision, embodying the exclusivity, prestige, and exceptional craftsmanship of both Houses, appealing to the most discerning cigar connoisseurs. Le Grand Dupont lighter adorned with glossy black lacquer and a Native American profile sculpted with an embossed effect. Gold powder applied to the back of the lighter along with the Cohiba 60th anniversary logo. Cap decorated with the Cohiba checkerboard pattern in a gold-finished guilloché design. Features a dual ignition system with a choice of yellow or blue flame. Matching lighter flint: red (REF 900651) Matching gas refill: red (REF 900435) Lighter shipped empty of gas; refill sold separately. Screwdriver included for changing the flint.` },
    collection: `Cohiba`,
    categorySlug: "isqueiros",
    image: `/products/le-grand-dupont-cohiba/C23472CL.webp`,
    variants: [
      { sku: `C23472CL`, name: { pt: `Le Grand Dupont · Cohiba — Preto`, en: `Le Grand Dupont · Cohiba — Black` }, priceCents: 232000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/le-grand-dupont-cohiba/C23472CL.webp`, images: [`/products/le-grand-dupont-cohiba/C23472CL.webp`, `/products/le-grand-dupont-cohiba/C23472CL-2.webp`, `/products/le-grand-dupont-cohiba/C23472CL-3.webp`, `/products/le-grand-dupont-cohiba/C23472CL-4.webp`] },
    ],
  },
  {
    slug: `table-lighter-cohiba`,
    name: { pt: `Isqueiro de Mesa · Cohiba`, en: `Table Lighter · Cohiba` },
    description: { pt: `Para celebrar o 60.º aniversário da Cohiba, a S.T. Dupont revela uma colecção exclusiva de isqueiros e acessórios, simbolizando o refinamento absoluto e uma herança de excepção. Inspirada nos elementos icónicos do design da marca, a colecção conjuga a vitola preta e dourada, a emblemática cabeça de índio e o característico motivo quadriculado. Cada peça revela um subtil equilíbrio entre estética e precisão artesanal, encarnando a exclusividade, o prestígio e o savoir-faire excepcional de ambas as Maisons, ao gosto dos mais exigentes conhecedores de charutos. Isqueiro de mesa em laca preta brilhante, decorado com o logótipo do 60.º aniversário da Cohiba e detalhes dourados. Gatilho com mecanismo deslizante e de pressão para alternar entre uma chama amarela resistente ao vento e uma chama maçarico. Recarga de gás compatível: preta 000430. Isqueiro entregue sem gás; recarga vendida em separado.`, en: `To celebrate Cohiba’s 60th anniversary, S.T. Dupont unveils an exclusive collection of lighters and accessories, symbolizing absolute refinement and an exceptional heritage. Inspired by the brand’s iconic design elements, the collection combines the black and gold band, the emblematic Native American head, and the signature square motif. Each piece reveals a subtle balance between aesthetics and artisanal precision, embodying the exclusivity, prestige, and exceptional craftsmanship of both Houses, appealing to the most discerning cigar connoisseurs. Table lighter in glossy black lacquer, decorated with the Cohiba 60th anniversary logo and gold accents. Trigger with a slide-and-press mechanism to switch between a wind-resistant yellow flame and a torch flame. Matching gas refill: black 000430 Lighter shipped empty of gas; refill sold separately.` },
    collection: `Cohiba`,
    categorySlug: "isqueiros",
    image: `/products/table-lighter-cohiba/T20472.webp`,
    variants: [
      { sku: `T20472`, name: { pt: `Table Lighter · Cohiba — Preto`, en: `Table Lighter · Cohiba — Black` }, priceCents: 69500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/table-lighter-cohiba/T20472.webp`, images: [`/products/table-lighter-cohiba/T20472.webp`, `/products/table-lighter-cohiba/T20472-2.webp`, `/products/table-lighter-cohiba/T20472-3.webp`, `/products/table-lighter-cohiba/T20472-4.webp`] },
    ],
  },
  {
    slug: `2-cigar-case-cohiba`,
    name: { pt: `Estojo para 2 Charutos · Cohiba`, en: `2 Cigar Case · Cohiba` },
    description: { pt: `Para celebrar o 60.º aniversário da Cohiba, a S.T. Dupont revela uma colecção exclusiva de isqueiros e acessórios, simbolizando o refinamento absoluto e uma herança de excepção. Inspirada nos elementos icónicos do design da marca, a colecção conjuga a vitola preta e dourada, a emblemática cabeça de índio e o característico motivo quadriculado. Cada peça revela um subtil equilíbrio entre estética e precisão artesanal, encarnando a exclusividade, o prestígio e o savoir-faire excepcional de ambas as Maisons, ao gosto dos mais exigentes conhecedores de charutos. Estojo para 2 charutos com medalhão com a cabeça de índio e o logótipo Cohiba 60th Anniversary gravado em relevo. Couro de vitela liso. Base em alumínio dourado escovado, que torna o estojo leve e duradouro.`, en: `To celebrate Cohiba’s 60th anniversary, S.T. Dupont unveils an exclusive collection of lighters and accessories, symbolizing absolute refinement and an exceptional heritage. Inspired by the brand’s iconic design elements, the collection combines the black and gold band, the emblematic Native American head, and the signature square motif. Each piece reveals a subtle balance between aesthetics and artisanal precision, embodying the exclusivity, prestige, and exceptional craftsmanship of both Houses, appealing to the most discerning cigar connoisseurs. Case for 2 cigars featuring a medallion with the Native American head and the embossed Cohiba 60th Anniversary logo. Smooth calfskin leather. Brushed gold aluminum base, making the case lightweight and durable.` },
    collection: `Cohiba`,
    categorySlug: "acessorios",
    image: `/products/2-cigar-case-cohiba/183472.webp`,
    variants: [
      { sku: `183472`, name: { pt: `2 Cigar Case · Cohiba — Preto`, en: `2 Cigar Case · Cohiba — Black` }, priceCents: 28000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/2-cigar-case-cohiba/183472.webp`, images: [`/products/2-cigar-case-cohiba/183472.webp`, `/products/2-cigar-case-cohiba/183472-2.webp`, `/products/2-cigar-case-cohiba/183472-3.webp`] },
    ],
  },
  {
    slug: `ashtray-cohiba`,
    name: { pt: `Cinzeiro · Cohiba`, en: `Ashtray · Cohiba` },
    description: { pt: `Para celebrar o 60.º aniversário da Cohiba, a S.T. Dupont revela uma colecção exclusiva de isqueiros e acessórios, simbolizando o refinamento absoluto e uma herança de excepção. Inspirada nos elementos icónicos do design da marca, a colecção conjuga a vitola preta e dourada, a emblemática cabeça de índio e o característico motivo quadriculado. Cada peça revela um subtil equilíbrio entre estética e precisão artesanal, encarnando a exclusividade, o prestígio e o savoir-faire excepcional de ambas as Maisons, ao gosto dos mais exigentes conhecedores de charutos. Cinzeiro XL decorado, ao centro, com o logótipo do 60.º aniversário da Cohiba. Laca preta com acabamento brilhante. Acabamento dourado pintado à mão nas ranhuras.`, en: `To celebrate Cohiba’s 60th anniversary, S.T. Dupont unveils an exclusive collection of lighters and accessories, symbolizing absolute refinement and an exceptional heritage. Inspired by the brand’s iconic design elements, the collection combines the black and gold band, the emblematic Native American head, and the signature square motif. Each piece reveals a subtle balance between aesthetics and artisanal precision, embodying the exclusivity, prestige, and exceptional craftsmanship of both Houses, appealing to the most discerning cigar connoisseurs. XL ashtray decorated, in the center, with the Cohiba 60th anniversary logo. Black lacquer with a glossy finish. Hand-painted gold finish on the grooves.` },
    collection: `Cohiba`,
    categorySlug: "acessorios",
    image: `/products/misc-cohiba/006472.webp`,
    variants: [
      { sku: `006472`, name: { pt: `Ashtray · Cohiba — Preto`, en: `Ashtray · Cohiba — Black` }, priceCents: 65500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/misc-cohiba/006472.webp`, images: [`/products/misc-cohiba/006472.webp`, `/products/misc-cohiba/006472-2.webp`, `/products/misc-cohiba/006472-3.webp`] },
    ],
  },

  // ----- Heritage additions from en.st-dupont.com -----
  {
    slug: `autolock`,
    name: { pt: `Cinto Autolock`, en: `Autolock Belt` },
    description: { pt: `Há quase 50 anos que a S.T. Dupont propõe uma vasta gama de cintos que conjugam o savoir-faire da Maison para vestir o homem com elegância. Estes cintos estão disponíveis numa ampla escolha de couros, em versões reversíveis ou não reversíveis, com tiras de 30 ou 35 mm de largura e com diferentes fivelas: fivelas de espigão, fivelas auto-blocantes ou fivelas de caixa.`, en: `For almost 50 years, S.T. Dupont has offered a wide range of belts combining the House's different expertise to dress men with elegance. These belts are available in a wide choice of leathers, in reversible or non-reversible versions, with 30 or 35 mm wide straps and with different buckles: pin buckles, self-locking buckles or box buckles.` },
    collection: `Autolock`,
    categorySlug: "acessorios",
    image: `/products/autolock/9791140.webp`,
    variants: [
      { sku: `9791140`, name: { pt: `Cinto Autolock — Preto`, en: `Autolock Belt — Black` }, priceCents: 27500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/autolock/9791140.webp`, images: [`/products/autolock/9791140.webp`, `/products/autolock/9791140-2.webp`, `/products/autolock/9791140-3.webp`] },
      { sku: `9801140`, name: { pt: `Cinto Autolock — Castanho`, en: `Autolock Belt — Brown` }, priceCents: 29000, currency: "EUR", attributes: { color: { label: { pt: `Castanho`, en: `Brown` }, hex: ["#6b4226"] } }, image: `/products/autolock/9801140.webp`, images: [`/products/autolock/9801140.webp`, `/products/autolock/9801140-2.webp`, `/products/autolock/9801140-3.webp`, `/products/autolock/9801140-4.webp`] },
      { sku: `9811140`, name: { pt: `Cinto Autolock — Azul`, en: `Autolock Belt — Blue` }, priceCents: 27500, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/autolock/9811140.webp`, images: [`/products/autolock/9811140.webp`, `/products/autolock/9811140-2.webp`, `/products/autolock/9811140-3.webp`] },
      { sku: `9821140`, name: { pt: `Cinto Autolock — Cinzento`, en: `Autolock Belt — Grey` }, priceCents: 24000, currency: "EUR", attributes: { color: { label: { pt: `Cinzento`, en: `Grey` }, hex: ["#7b7e84"] } }, image: `/products/autolock/9821140.webp`, images: [`/products/autolock/9821140.webp`, `/products/autolock/9821140-2.webp`, `/products/autolock/9821140-3.webp`] },
    ],
  },
  {
    slug: `line-d-reversible-belt`,
    name: { pt: `Cinto Reversível Line D`, en: `Line D Reversible Belt` },
    description: { pt: `Há quase 50 anos que a S.T. Dupont propõe uma vasta gama de cintos que conjugam o savoir-faire da Maison para vestir o homem com elegância. Estes cintos estão disponíveis numa ampla escolha de couros, em versões reversíveis ou não reversíveis, com tiras de 30 ou 35 mm de largura e com diferentes fivelas: fivelas de espigão, fivelas auto-blocantes ou fivelas de caixa.`, en: `For almost 50 years, S.T. Dupont has offered a wide range of belts combining the House's different expertise to dress men with elegance. These belts are available in a wide choice of leathers, in reversible or non-reversible versions, with 30 or 35 mm wide straps and with different buckles: pin buckles, self-locking buckles or box buckles.` },
    collection: `Line D Eternity`,
    categorySlug: "acessorios",
    image: `/products/line-d-4/8200183.webp`,
    variants: [
      { sku: `8200183`, name: { pt: `Cinto Reversível Line D — Preto & Castanho`, en: `Line D Reversible Belt — Black & Brown` }, priceCents: 22000, currency: "EUR", attributes: { color: { label: { pt: `Preto & Castanho`, en: `Black & Brown` }, hex: ["#15171c", "#6b4226"] } }, image: `/products/line-d-4/8200183.webp`, images: [`/products/line-d-4/8200183.webp`, `/products/line-d-4/8200183-2.webp`, `/products/line-d-4/8200183-3.webp`, `/products/line-d-4/8200183-4.webp`] },
      { sku: `8200160`, name: { pt: `Cinto Reversível Line D — Preto`, en: `Line D Reversible Belt — Black` }, priceCents: 22000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-4/8200160.webp`, images: [`/products/line-d-4/8200160.webp`, `/products/line-d-4/8200160-2.webp`, `/products/line-d-4/8200160-3.webp`, `/products/line-d-4/8200160-4.webp`] },
    ],
  },
  {
    slug: `biggy-diamond-head`,
    name: { pt: `Biggy · Diamond Head`, en: `Biggy · Diamond Head` },
    description: { pt: `Ligado à herança da Maison, conjugando a elegância do Ligne 2 com a potência do Megajet, o Big D encantará os apreciadores de charutos que procuram desempenho e um design de luxo. Cuidadosamente concebido em laca preta brilhante. Equipado com uma potente chama maçarico de 2 cm, o Big D assegura uma ignição excepcional em qualquer ocasião. Este modelo está disponível nos mesmos acabamentos do Slimmy: crómio, dourado, guilloché ponta de diamante ou laca (azul-escuro e preto). Recarga de gás associada: preta (REF 000430)`, en: `Connected to the heritage of the House, combining the elegance of Line 2 with the power of the Megajet, Big D will delight cigar lovers looking for performance and luxurious design. Carefully designed in glossy black lacquer. Equipped with a powerful 2 cm torch flame, Big D ensures exceptional ignition on any occasion. This model is available in the same finishes as the Slimmy: chrome, gold, guilloche diamond tip or lacquer (dark blue and black). Gas refill associated: black (REF 000430)` },
    collection: `Biggy`,
    categorySlug: "isqueiros",
    image: `/products/biggy-4/025009.webp`,
    variants: [
      { sku: `025009`, name: { pt: `Biggy · Diamond Head — Dourado`, en: `Biggy · Diamond Head — Gold` }, priceCents: 38500, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Gold` }, hex: ["#c8a24a"] } }, image: `/products/biggy-4/025009.webp`, images: [`/products/biggy-4/025009.webp`, `/products/biggy-4/025009-2.webp`, `/products/biggy-4/025009-3.webp`, `/products/biggy-4/025009-4.webp`] },
      { sku: `025010`, name: { pt: `Biggy · Diamond Head — Paládio`, en: `Biggy · Diamond Head — Palladium` }, priceCents: 38500, currency: "EUR", attributes: { color: { label: { pt: `Paládio`, en: `Palladium` }, hex: ["#b9bcc2"] } }, image: `/products/biggy-4/025010.webp`, images: [`/products/biggy-4/025010.webp`, `/products/biggy-4/025010-2.webp`, `/products/biggy-4/025010-3.webp`, `/products/biggy-4/025010-4.webp`] },
      { sku: `025001`, name: { pt: `Biggy · Diamond Head — Paládio`, en: `Biggy · Diamond Head — Palladium` }, priceCents: 36500, currency: "EUR", attributes: { color: { label: { pt: `Paládio`, en: `Palladium` }, hex: ["#b9bcc2"] } }, image: `/products/biggy-4/025001.webp`, images: [`/products/biggy-4/025001.webp`, `/products/biggy-4/025001-2.webp`, `/products/biggy-4/025001-3.webp`, `/products/biggy-4/025001-4.webp`] },
      { sku: `025002`, name: { pt: `Biggy · Diamond Head — Preto`, en: `Biggy · Diamond Head — Black` }, priceCents: 36500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/biggy-4/025002.webp`, images: [`/products/biggy-4/025002.webp`, `/products/biggy-4/025002-2.webp`, `/products/biggy-4/025002-3.webp`, `/products/biggy-4/025002-4.webp`] },
    ],
  },
  {
    slug: `le-grand-dupont-lilac`,
    name: { pt: `Le Grand Dupont · Lilás`, en: `Le Grand Dupont · Lilac` },
    description: { pt: `Montecristo e S.T. Dupont, ambos sinónimos de um savoir-faire único, unem-se para criar produtos de excepção. Esta nova colecção encantará os fãs de ambas as marcas. O Le Grand Dupont é lacado em degradé violeta; na face frontal, o logótipo da prestigiada marca de charutos Montecristo está estampado a dourado numa das faces, enquanto a outra face apresenta uma decoração dourada de sol e lua. Possui um sistema de dupla chama: uma primeira chama baixa aquece suavemente o charuto, enquanto uma potente e uniforme chama maçarico garante a ignição em todas as circunstâncias. A colecção inclui mais 2 isqueiros: Ligne 2 e um Maxijet. Também duas canetas da colecção Line D Large e acessórios: um estojo em couro para três charutos, um grande cinzeiro, um corta-charutos e um par de botões de punho. Recarga de gás associada: vermelha (REF 000435), pedra vermelha (REF 900651).`, en: `Montecristo and S.T. Dupont, both synonymous with unique craftsmanship, have joined forces to create exceptional products. This new collection will delight fans of both brands. The Grand Dupont is lacquered with a violet gradient, on the front face the logo of the prestigious Montecristo cigar brand is stamped in gold on one of the faces, while the other face presents a golden sun and moon decoration. It has a double flame system, a first low flame gently warms the cigar slowly, while a powerful and uniform torch flame ensures lighting in all circumstances. The collection includes 2 other lighters: Line 2 and a Maxijet. Also, two pens from the Line D Large collection and accessories: a leather case for three cigars, a large ashtray, a cigar cutter and a pair of cufflinks. Gas refill associated: red (REF 000435) red stone (REF 900651)` },
    collection: `Le Grand Dupont`,
    categorySlug: "isqueiros",
    image: `/products/le-grand-dupont-3/C23034.webp`,
    variants: [
      { sku: `C23034`, name: { pt: `Le Grand Dupont · Lilás — Lilás`, en: `Le Grand Dupont · Lilac — Lilac` }, priceCents: 168500, currency: "EUR", attributes: { color: { label: { pt: `Lilás`, en: `Lilac` }, hex: ["#6b4a8a"] } }, image: `/products/le-grand-dupont-3/C23034.webp`, images: [`/products/le-grand-dupont-3/C23034.webp`, `/products/le-grand-dupont-3/C23034-2.webp`, `/products/le-grand-dupont-3/C23034-3.webp`, `/products/le-grand-dupont-3/C23034-4.webp`] },
    ],
  },
  {
    slug: `ligne-2-micro-diamond-head`,
    name: { pt: `Ligne 2 · Micro Diamond Head`, en: `Ligne 2 · Micro Diamond Head` },
    description: { pt: `Este isqueiro de pequeno modelo, com a sua ponta em microdiamante e acabamento em paládio, responde à procura de um novo mercado de luxo, jovem e feminino. Pedra de isqueiro associada: preta (REF 900600). Recarga de gás associada: vermelha (REF 900435). Isqueiro vendido sem gás, recarga vendida em separado.`, en: `This small-model lighter, with its microdiamond tip and palladium finish, meets the demand of a new, young and female luxury market. Associated lighter stone: black (REF 900600). Associated gas refill: red (REF 900435). Lighter is sold empty of gas, refill sold separately.` },
    collection: `Ligne 2`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-7/C18690.webp`,
    variants: [
      { sku: `C18690`, name: { pt: `Ligne 2 · Micro Diamond Head — Paládio`, en: `Ligne 2 · Micro Diamond Head — Palladium` }, priceCents: 98500, currency: "EUR", attributes: { color: { label: { pt: `Paládio`, en: `Palladium` }, hex: ["#b9bcc2"] } }, image: `/products/ligne-2-7/C18690.webp`, images: [`/products/ligne-2-7/C18690.webp`, `/products/ligne-2-7/C18690-2.webp`, `/products/ligne-2-7/C18690-3.webp`, `/products/ligne-2-7/C18690-4.webp`] },
      { sku: `C18692`, name: { pt: `Ligne 2 · Micro Diamond Head — Dourado`, en: `Ligne 2 · Micro Diamond Head — Gold` }, priceCents: 98500, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Gold` }, hex: ["#c8a24a"] } }, image: `/products/ligne-2-7/C18692.webp`, images: [`/products/ligne-2-7/C18692.webp`, `/products/ligne-2-7/C18692-2.webp`, `/products/ligne-2-7/C18692-3.webp`, `/products/ligne-2-7/C18692-4.webp`] },
    ],
  },
  {
    slug: `ligne-2-dragon-3`,
    name: { pt: `Ligne 2 · Dragon Guilloché`, en: `Ligne 2 · Dragon Guilloché` },
    description: { pt: `Criada para o Ano Novo Chinês do Dragão, esta colecção celebra a criatura mítica tal como celebra o savoir-faire da S.T. Dupont. Instrumentos de escrita, isqueiros e acessórios para charutos reinventam o know-how icónico da Maison com a criação de um novo guilloché de escamas de dragão. Simultaneamente carregadas de tradição e ferozmente modernas, três linhas compõem a colecção Dragon: Dragon Red, Dragon Black e Dragon Color Animation. As linhas Dragon Red e Dragon Black vêem os produtos icónicos da S.T. Dupont ornamentados com um dragão inspirado no anime e na street art. Irrompendo de uma nuvem de confetti, simboliza a alegria e as infinitas possibilidades oferecidas por este novo ano lunar. Ilustrado no corpo do icónico Maxijet, o dragão S.T. Dupont ondula sobre este isqueiro Bordéus. Recargas associadas: Vermelha (REF 000434), pedra preta (REF 900601).`, en: `Created for the Chinese New Year of the Dragon, this collection celebrates the mythical creature as much as S.T. Dupont's craftsmanship. Writing instruments, lighters and cigar accessories reinvent the iconic know-how of the House with the creation of a new dragon scale guilloche. Both steeped in tradition and fiercely modern, three lines make up the Dragon collection: Dragon Red, Dragon Black and Dragon Color Animation. The Dragon Red and Dragon Black lines see S.T. Dupont's iconic products adorned with a dragon inspired by anime and street art. Bursting from a cloud of confetti, it symbolizes the joy and infinite possibilities offered by this new lunar year. Illustrated on the body of the iconic Maxijet, the S.T. Dupont dragon undulates on this burgundy lighter. Associated refills: Red (REF 000434) Black stone (REF 900601)` },
    collection: `Dragon`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-dragon-2/C16626.webp`,
    variants: [
      { sku: `C16626`, name: { pt: `Ligne 2 · Dragon Guilloché — Borgonha`, en: `Ligne 2 · Dragon Guilloché — Burgundy` }, priceCents: 141000, currency: "EUR", attributes: { color: { label: { pt: `Borgonha`, en: `Burgundy` }, hex: ["#7d2b27"] } }, image: `/products/ligne-2-dragon-2/C16626.webp`, images: [`/products/ligne-2-dragon-2/C16626.webp`, `/products/ligne-2-dragon-2/C16626-2.webp`, `/products/ligne-2-dragon-2/C16626-3.webp`, `/products/ligne-2-dragon-2/C16626-4.webp`] },
      { sku: `C16632`, name: { pt: `Ligne 2 · Dragon Guilloché — Azul Royal`, en: `Ligne 2 · Dragon Guilloché — Royal Blue` }, priceCents: 141000, currency: "EUR", attributes: { color: { label: { pt: `Azul Royal`, en: `Royal Blue` }, hex: ["#1f3c66"] } }, image: `/products/ligne-2-dragon-2/C16632.webp`, images: [`/products/ligne-2-dragon-2/C16632.webp`, `/products/ligne-2-dragon-2/C16632-2.webp`, `/products/ligne-2-dragon-2/C16632-3.webp`, `/products/ligne-2-dragon-2/C16632-4.webp`] },
      { sku: `C16526`, name: { pt: `Ligne 2 · Dragon Guilloché — Borgonha`, en: `Ligne 2 · Dragon Guilloché — Burgundy` }, priceCents: 141000, currency: "EUR", attributes: { color: { label: { pt: `Borgonha`, en: `Burgundy` }, hex: ["#7d2b27"] } }, image: `/products/ligne-2-dragon-2/C16526.webp`, images: [`/products/ligne-2-dragon-2/C16526.webp`, `/products/ligne-2-dragon-2/C16526-2.webp`, `/products/ligne-2-dragon-2/C16526-3.webp`, `/products/ligne-2-dragon-2/C16526-4.webp`] },
    ],
  },
  {
    slug: `maxijet-dragon-3`,
    name: { pt: `Maxijet · Dragon`, en: `Maxijet · Dragon` },
    description: { pt: `Ilustrado no corpo do icónico Maxijet, o dragão S.T. Dupont ondula sobre este isqueiro Bordéus. Recargas associadas: Preta (REF 000430)`, en: `Illustrated on the body of the iconic Maxijet, the S.T. Dupont dragon undulates on this burgundy lighter. Associated refills: Black (REF 000430)` },
    collection: `Dragon`,
    categorySlug: "isqueiros",
    image: `/products/maxijet-dragon-3/020176.webp`,
    variants: [
      { sku: `020176`, name: { pt: `Maxijet · Dragon — Borgonha`, en: `Maxijet · Dragon — Burgundy` }, priceCents: 23500, currency: "EUR", attributes: { color: { label: { pt: `Borgonha`, en: `Burgundy` }, hex: ["#7d2b27"] } }, image: `/products/maxijet-dragon-3/020176.webp`, images: [`/products/maxijet-dragon-3/020176.webp`, `/products/maxijet-dragon-3/020176-2.webp`, `/products/maxijet-dragon-3/020176-3.webp`, `/products/maxijet-dragon-3/020176-4.webp`] },
    ],
  },
  {
    slug: `slim-7-dragon-3`,
    name: { pt: `Slim 7 · Dragon`, en: `Slim 7 · Dragon` },
    description: { pt: `Ilustrado no corpo do icónico SLIM 7, o dragão S.T. Dupont ondula sobre este isqueiro Bordéus. Recargas associadas: Preta (REF 000430)`, en: `Illustrated on the body of the iconic SLIM 7, the S.T. Dupont dragon undulates on this burgundy lighter. Associated refills: Black (REF 000430)` },
    collection: `Dragon`,
    categorySlug: "isqueiros",
    image: `/products/slim-7-dragon-3/027776.webp`,
    variants: [
      { sku: `027776`, name: { pt: `Slim 7 · Dragon — Borgonha`, en: `Slim 7 · Dragon — Burgundy` }, priceCents: 22500, currency: "EUR", attributes: { color: { label: { pt: `Borgonha`, en: `Burgundy` }, hex: ["#7d2b27"] } }, image: `/products/slim-7-dragon-3/027776.webp`, images: [`/products/slim-7-dragon-3/027776.webp`, `/products/slim-7-dragon-3/027776-2.webp`, `/products/slim-7-dragon-3/027776-3.webp`, `/products/slim-7-dragon-3/027776-4.webp`] },
      { sku: `027774`, name: { pt: `Slim 7 · Dragon — Borgonha`, en: `Slim 7 · Dragon — Burgundy` }, priceCents: 20500, currency: "EUR", attributes: { color: { label: { pt: `Borgonha`, en: `Burgundy` }, hex: ["#7d2b27"] } }, image: `/products/slim-7-dragon-3/027774.webp`, images: [`/products/slim-7-dragon-3/027774.webp`, `/products/slim-7-dragon-3/027774-2.webp`, `/products/slim-7-dragon-3/027774-3.webp`, `/products/slim-7-dragon-3/027774-4.webp`] },
      { sku: `027773`, name: { pt: `Slim 7 · Dragon — Azul Royal`, en: `Slim 7 · Dragon — Royal Blue` }, priceCents: 20500, currency: "EUR", attributes: { color: { label: { pt: `Azul Royal`, en: `Royal Blue` }, hex: ["#1f3c66"] } }, image: `/products/slim-7-dragon-3/027773.webp`, images: [`/products/slim-7-dragon-3/027773.webp`, `/products/slim-7-dragon-3/027773-2.webp`, `/products/slim-7-dragon-3/027773-3.webp`, `/products/slim-7-dragon-3/027773-4.webp`] },
    ],
  },
  {
    slug: `slimmy-lacquered`,
    name: { pt: `Slimmy · Laqueado`, en: `Slimmy · Lacquered` },
    description: { pt: `Inspirado nos arquivos da Maison, o Slimmy ecoa o icónico Ligne 2 e o icónico Slim 7, o isqueiro de luxo mais fino do mundo. Cuidadosamente concebido em laca azul com acabamentos dourados. A leveza (66 g) e a finura (9 mm) deste isqueiro proporcionam uma pega perfeita e permitem que deslize facilmente para qualquer bolso ou mala. A sua chama maçarico garante uma experiência única, oferecendo uma ignição eficiente em qualquer circunstância. Intemporal e dotado do savoir-faire da laca e do guilloché, o Slimmy está disponível nas versões crómio, dourado e laca (azul-céu, coral, azul-escuro, preto, branco). Recarga de gás associada: preta (REF 000430)`, en: `Inspired by the House archives, Slimmy echoes the iconic Line 2 and the iconic Slim 7, the world's thinnest luxury lighter. Carefully designed in blue lacquer with gold finishes. The lightness (66g) and thinness (9mm) of this lighter provide a perfect grip and allow it to be easily slipped into any pocket or bag. Its torch flame guarantees a unique experience providing efficient ignition in any circumstance. Timeless and featuring the know-how of lacquer and guilloche, Slimmy is available in chrome, gold and lacquer versions (sky blue, coral, dark blue, black, white). Gas refill associated: black (REF 000430)` },
    collection: `Slimmy`,
    categorySlug: "isqueiros",
    image: `/products/slimmy-4/028001.webp`,
    variants: [
      { sku: `028001`, name: { pt: `Slimmy · Laqueado — Paládio`, en: `Slimmy · Lacquered — Palladium` }, priceCents: 29000, currency: "EUR", attributes: { color: { label: { pt: `Paládio`, en: `Palladium` }, hex: ["#b9bcc2"] } }, image: `/products/slimmy-4/028001.webp`, images: [`/products/slimmy-4/028001.webp`, `/products/slimmy-4/028001-2.webp`, `/products/slimmy-4/028001-3.webp`, `/products/slimmy-4/028001-4.webp`] },
      { sku: `028002`, name: { pt: `Slimmy · Laqueado — Preto`, en: `Slimmy · Lacquered — Black` }, priceCents: 29000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/slimmy-4/028002.webp`, images: [`/products/slimmy-4/028002.webp`, `/products/slimmy-4/028002-2.webp`, `/products/slimmy-4/028002-3.webp`, `/products/slimmy-4/028002-4.webp`] },
      { sku: `028004`, name: { pt: `Slimmy · Laqueado — Branco`, en: `Slimmy · Lacquered — White` }, priceCents: 29000, currency: "EUR", attributes: { color: { label: { pt: `Branco`, en: `White` }, hex: ["#efeae0"] } }, image: `/products/slimmy-4/028004.webp`, images: [`/products/slimmy-4/028004.webp`, `/products/slimmy-4/028004-2.webp`, `/products/slimmy-4/028004-3.webp`, `/products/slimmy-4/028004-4.webp`] },
      { sku: `028005`, name: { pt: `Slimmy · Laqueado — Azul Índigo`, en: `Slimmy · Lacquered — Indigo Blue` }, priceCents: 29000, currency: "EUR", attributes: { color: { label: { pt: `Azul Índigo`, en: `Indigo Blue` }, hex: ["#1f3c66"] } }, image: `/products/slimmy-4/028005.webp`, images: [`/products/slimmy-4/028005.webp`, `/products/slimmy-4/028005-2.webp`, `/products/slimmy-4/028005-3.webp`, `/products/slimmy-4/028005-4.webp`] },
    ],
  },
  {
    slug: `twiggy-lacquered`,
    name: { pt: `Twiggy · Laqueado`, en: `Twiggy · Lacquered` },
    description: { pt: `O isqueiro Twiggy em laca preta e acabamento em crómio é elegante e de forma alongada. O seu acabamento em laca realça a silhueta e encarna o espírito dos anos 60. Com a sua chama maçarico de 1 cm, é perfeito para acender velas ou cigarros, tornando-se um indispensável tanto para fumadores como para não fumadores. Tal como o Slimmy, este modelo está disponível em cinco cores delicadas: azul-céu, coral, azul-escuro, preto e branco. Recarga de gás associada: preta (REF 000430)`, en: `The Twiggy Lighter in black lacquer and chrome finish is sleek and long-shaped. Its lacquer finish emphasizes its silhouette and embodies the spirit of the 60s. With its 1 cm torch flame, it is perfect for lighting candles or cigarettes, making it a must-have for smokers and non-smokers alike. Just like Slimmy, this model comes in five delicate colors: sky blue, coral, dark blue, black and white. Associated gas refill: black (REF 000430)` },
    collection: `Twiggy`,
    categorySlug: "isqueiros",
    image: `/products/twiggy-3/030001.webp`,
    variants: [
      { sku: `030001`, name: { pt: `Twiggy · Laqueado — Preto`, en: `Twiggy · Lacquered — Black` }, priceCents: 29000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/twiggy-3/030001.webp`, images: [`/products/twiggy-3/030001.webp`, `/products/twiggy-3/030001-2.webp`, `/products/twiggy-3/030001-3.webp`, `/products/twiggy-3/030001-4.webp`] },
      { sku: `030002`, name: { pt: `Twiggy · Laqueado — Dourado`, en: `Twiggy · Lacquered — Gold` }, priceCents: 29000, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Gold` }, hex: ["#c8a24a"] } }, image: `/products/twiggy-3/030002.webp`, images: [`/products/twiggy-3/030002.webp`, `/products/twiggy-3/030002-2.webp`, `/products/twiggy-3/030002-3.webp`, `/products/twiggy-3/030002-4.webp`] },
    ],
  },
  {
    slug: `firehead-keyring-pouch`,
    name: { pt: `Firehead · Porta-Chaves & Bolsa`, en: `Firehead · Keyring & Pouch` },
    description: { pt: `Esta colecção Firehead, confeccionada em couro de vitela flor inteira gravado em relevo com o seu motivo firehead, é uma homenagem ao símbolo alquímico do fogo. Esta pochette azul é suficientemente espaçosa para acomodar pequenos dispositivos digitais como um iPad, um telemóvel e outros essenciais. A sua alça amovível permite levá-la para qualquer lado. Todos os produtos da colecção Firehead são certificados LWG. - 1 bolso plano`, en: `This Firehead collection, crafted from embossed full-grain calf leather with its firehead motif, is a tribute to the alchemical symbol of fire. This blue pouch is spacious enough to fit small digital devices such as an iPad, a phone and other essentials. Its removable strap allows you to take it everywhere. All products in the Firehead collection are LWG certified. - 1 flat pocket` },
    collection: `Firehead`,
    categorySlug: "pele",
    image: `/products/firehead-4/161610.webp`,
    variants: [
      { sku: `161610`, name: { pt: `Firehead · Porta-Chaves & Bolsa — Azul`, en: `Firehead · Keyring & Pouch — Blue` }, priceCents: 17000, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/firehead-4/161610.webp`, images: [`/products/firehead-4/161610.webp`, `/products/firehead-4/161610-2.webp`] },
      { sku: `160612`, name: { pt: `Firehead · Porta-Chaves & Bolsa — Azul`, en: `Firehead · Keyring & Pouch — Blue` }, priceCents: 69500, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/firehead-4/160612.webp`, images: [`/products/firehead-4/160612.webp`, `/products/firehead-4/160612-2.webp`, `/products/firehead-4/160612-3.webp`, `/products/firehead-4/160612-4.webp`] },
    ],
  },
  {
    slug: `line-d-wallet`,
    name: { pt: `Line D · Carteira`, en: `Line D · Wallet` },
    description: { pt: `Esta carteira comprida é o companheiro perfeito para todos, com os seus múltiplos compartimentos e tecnologia RFID concebida para proteger os dados pessoais dos cartões que contém de qualquer risco de usurpação por dispositivos sem fios. Prática e elegante, este acessório tornar-se-á uma parte essencial do seu quotidiano. - 7 compartimentos para cartões num lado - 6 compartimentos para cartões no outro lado - Dois compartimentos planos para notas - Um compartimento com fole para papéis ou notas - Logótipo gravado em relevo no interior`, en: `This long wallet is the perfect companion for everyone, with its many slots and RFID technology designed to protect the personal data of the cards it contains from any risk of wireless device usurpation. Practical and elegant, this accessory will become an essential part of your daily life. - 7 card slots on one side - 6 card slots on the other side - Two flat compartments for bills - A gusseted compartment for papers or bills - Embossed logo inside` },
    collection: `Line D Eternity`,
    categorySlug: "pele",
    image: `/products/line-d-5/180002.webp`,
    variants: [
      { sku: `180002`, name: { pt: `Line D · Carteira — Preto`, en: `Line D · Wallet — Black` }, priceCents: 33500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-5/180002.webp`, images: [`/products/line-d-5/180002.webp`, `/products/line-d-5/180002-2.webp`] },
      { sku: `180044`, name: { pt: `Line D · Carteira — Preto`, en: `Line D · Wallet — Black` }, priceCents: 49500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-5/180044.webp`, images: [`/products/line-d-5/180044.webp`, `/products/line-d-5/180044-2.webp`] },
      { sku: `180045`, name: { pt: `Line D · Carteira — Preto`, en: `Line D · Wallet — Black` }, priceCents: 45500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-5/180045.webp`, images: [`/products/line-d-5/180045.webp`, `/products/line-d-5/180045-2.webp`, `/products/line-d-5/180045-3.webp`] },
    ],
  },
];
