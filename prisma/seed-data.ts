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
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `S.T. Dupont celebrates the ancestral Japanese art of Maki-e. Decorated by hand by our partner artisans of Wajimaya Zenni in Japan, each piece is adorned with gold powder, palladium representing traditional Japanese symbols and signed "Zenni". The Ryusui Shunju collection celebrates the harmony of the cycle of nature. Lighter Line 2 Cling Maki-e pattern Ryusui Shunju decor in gold powder, mother of pearl and black lacquer and golden finishes. Equipped with a double yellow flame and the famous "Cling" at the opening. Associated lighter flint: black (REF 900601) Associated gas refill: red (REF 900435) Lighter delivered empty of gas, refill sold separately.`, en: `S.T. Dupont celebrates the ancestral Japanese art of Maki-e. Decorated by hand by our partner artisans of Wajimaya Zenni in Japan, each piece is adorned with gold powder, palladium representing traditional Japanese symbols and signed "Zenni". The Ryusui Shunju collection celebrates the harmony of the cycle of nature. Lighter Line 2 Cling Maki-e pattern Ryusui Shunju decor in gold powder, mother of pearl and black lacquer and golden finishes. Equipped with a double yellow flame and the famous "Cling" at the opening. Associated lighter flint: black (REF 900601) Associated gas refill: red (REF 900435) Lighter delivered empty of gas, refill sold separately.` },
    collection: `Ligne 2`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-maki-e/016359.webp`,
    variants: [
      { sku: `016359`, name: { pt: `Lacquered lighter — Prata`, en: `Lacquered lighter — Silver` }, priceCents: 731400, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/ligne-2-maki-e/016359.webp`, images: [`/products/ligne-2-maki-e/016359.webp`, `/products/ligne-2-maki-e/016359-2.webp`] },
      { sku: `C16150`, name: { pt: `Lacquered lighter — Castanho`, en: `Lacquered lighter — Brown` }, priceCents: 777400, currency: "EUR", attributes: { color: { label: { pt: `Castanho`, en: `Brown` }, hex: ["#6b4a2a"] } }, image: `/products/ligne-2-maki-e/C16150.webp`, images: [`/products/ligne-2-maki-e/C16150.webp`, `/products/ligne-2-maki-e/C16150-2.webp`, `/products/ligne-2-maki-e/C16150-3.webp`, `/products/ligne-2-maki-e/C16150-4.webp`] },
      { sku: `C16151`, name: { pt: `Lacquered lighter — Castanho`, en: `Lacquered lighter — Brown` }, priceCents: 639400, currency: "EUR", attributes: { color: { label: { pt: `Castanho`, en: `Brown` }, hex: ["#6b4a2a"] } }, image: `/products/ligne-2-maki-e/C16151.webp`, images: [`/products/ligne-2-maki-e/C16151.webp`, `/products/ligne-2-maki-e/C16151-2.webp`, `/products/ligne-2-maki-e/C16151-3.webp`, `/products/ligne-2-maki-e/C16151-4.webp`] }
    ],
  },
  {
    slug: `slim-7-geode`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `Mysterious and captivating, geodes inspire an S.T. Dupont collection expressed through two mineral tones: a deep blue evoking agate, a symbol of balance, and a vibrant green reminiscent of malachite, representing protection and energy. Like these precious stones, each Géode creation reflects the artisanal craftsmanship and precision excellence of S.T. Dupont. The Slim 7 lighter is adorned with a motif inspired by the crystalline structure of malachite. Gold finish. It features a blue torch flame. Associated gas refill: black (REF 900430) Lighter delivered empty of gas; refill sold separately.`, en: `Mysterious and captivating, geodes inspire an S.T. Dupont collection expressed through two mineral tones: a deep blue evoking agate, a symbol of balance, and a vibrant green reminiscent of malachite, representing protection and energy. Like these precious stones, each Géode creation reflects the artisanal craftsmanship and precision excellence of S.T. Dupont. The Slim 7 lighter is adorned with a motif inspired by the crystalline structure of malachite. Gold finish. It features a blue torch flame. Associated gas refill: black (REF 900430) Lighter delivered empty of gas; refill sold separately.` },
    collection: `Slim 7`,
    categorySlug: "isqueiros",
    image: `/products/slim-7-geode/027036.webp`,
    variants: [
      { sku: `027036`, name: { pt: `Lacquered lighter — Azul`, en: `Lacquered lighter — Blue` }, priceCents: 27140, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/slim-7-geode/027036.webp`, images: [`/products/slim-7-geode/027036.webp`, `/products/slim-7-geode/027036-2.webp`, `/products/slim-7-geode/027036-3.webp`, `/products/slim-7-geode/027036-4.webp`] },
      { sku: `027035`, name: { pt: `Lacquered lighter — Azul`, en: `Lacquered lighter — Blue` }, priceCents: 27140, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/slim-7-geode/027035.webp`, images: [`/products/slim-7-geode/027035.webp`, `/products/slim-7-geode/027035-2.webp`, `/products/slim-7-geode/027035-3.webp`, `/products/slim-7-geode/027035-4.webp`] }
    ],
  },
  {
    slug: `twiggy-geode`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `Mysterious and captivating, geodes inspire an S.T. Dupont collection expressed through two mineral tones: a deep blue evoking agate, a symbol of balance, and a vibrant green reminiscent of malachite, representing protection and energy. Like these precious stones, each Géode creation reflects the artisanal craftsmanship and precision excellence of S.T. Dupont. The Twiggy lighter is adorned with a motif inspired by the aesthetic of malachite. Gold finish. It features a blue torch flame. Associated gas refill: black (REF 900430) Lighter delivered empty of gas; refill sold separately.`, en: `Mysterious and captivating, geodes inspire an S.T. Dupont collection expressed through two mineral tones: a deep blue evoking agate, a symbol of balance, and a vibrant green reminiscent of malachite, representing protection and energy. Like these precious stones, each Géode creation reflects the artisanal craftsmanship and precision excellence of S.T. Dupont. The Twiggy lighter is adorned with a motif inspired by the aesthetic of malachite. Gold finish. It features a blue torch flame. Associated gas refill: black (REF 900430) Lighter delivered empty of gas; refill sold separately.` },
    collection: `Twiggy`,
    categorySlug: "isqueiros",
    image: `/products/twiggy-geode/030036.webp`,
    variants: [
      { sku: `030036`, name: { pt: `Lacquered lighter — Verde`, en: `Lacquered lighter — Green` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Verde`, en: `Green` }, hex: ["#3a5040"] } }, image: `/products/twiggy-geode/030036.webp`, images: [`/products/twiggy-geode/030036.webp`, `/products/twiggy-geode/030036-2.webp`, `/products/twiggy-geode/030036-3.webp`, `/products/twiggy-geode/030036-4.webp`] },
      { sku: `030035`, name: { pt: `Lacquered lighter — Azul`, en: `Lacquered lighter — Blue` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/twiggy-geode/030035.webp`, images: [`/products/twiggy-geode/030035.webp`, `/products/twiggy-geode/030035-2.webp`, `/products/twiggy-geode/030035-3.webp`, `/products/twiggy-geode/030035-4.webp`] }
    ],
  },
  {
    slug: `slimmy-geode`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `Mysterious and captivating, geodes inspire an S.T. Dupont collection expressed through two mineral tones: a deep blue evoking agate, a symbol of balance, and a vibrant green reminiscent of malachite, representing protection and energy. Like these precious stones, each Géode creation reflects the artisanal craftsmanship and precision excellence of S.T. Dupont. The Slimmy lighter is adorned with a motif inspired by the aesthetic of malachite. Gold finish. It features a blue torch flame. Associated gas refill: black (REF 900430) Lighter delivered empty of gas; refill sold separately.`, en: `Mysterious and captivating, geodes inspire an S.T. Dupont collection expressed through two mineral tones: a deep blue evoking agate, a symbol of balance, and a vibrant green reminiscent of malachite, representing protection and energy. Like these precious stones, each Géode creation reflects the artisanal craftsmanship and precision excellence of S.T. Dupont. The Slimmy lighter is adorned with a motif inspired by the aesthetic of malachite. Gold finish. It features a blue torch flame. Associated gas refill: black (REF 900430) Lighter delivered empty of gas; refill sold separately.` },
    collection: `Slimmy`,
    categorySlug: "isqueiros",
    image: `/products/slimmy-geode/028036.webp`,
    variants: [
      { sku: `028036`, name: { pt: `Lacquered lighter — Verde`, en: `Lacquered lighter — Green` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Verde`, en: `Green` }, hex: ["#3a5040"] } }, image: `/products/slimmy-geode/028036.webp`, images: [`/products/slimmy-geode/028036.webp`, `/products/slimmy-geode/028036-2.webp`, `/products/slimmy-geode/028036-3.webp`, `/products/slimmy-geode/028036-4.webp`] },
      { sku: `028035`, name: { pt: `Lacquered lighter — Azul`, en: `Lacquered lighter — Blue` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/slimmy-geode/028035.webp`, images: [`/products/slimmy-geode/028035.webp`, `/products/slimmy-geode/028035-2.webp`, `/products/slimmy-geode/028035-3.webp`, `/products/slimmy-geode/028035-4.webp`] }
    ],
  },
  {
    slug: `minijet-geode`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `Mysterious and captivating, geodes inspire an S.T. Dupont collection expressed through two mineral tones: a deep blue evoking agate, a symbol of balance, and a vibrant green reminiscent of malachite, representing protection and energy. Like these precious stones, each Géode creation reflects the artisanal craftsmanship and precision excellence of S.T. Dupont. The Minijet lighter is adorned with a motif inspired by the crystalline structure of malachite. Gold finish. It features a blue torch flame. Associated gas refill: black (REF 900430) Lighter delivered empty of gas; refill sold separately.`, en: `Mysterious and captivating, geodes inspire an S.T. Dupont collection expressed through two mineral tones: a deep blue evoking agate, a symbol of balance, and a vibrant green reminiscent of malachite, representing protection and energy. Like these precious stones, each Géode creation reflects the artisanal craftsmanship and precision excellence of S.T. Dupont. The Minijet lighter is adorned with a motif inspired by the crystalline structure of malachite. Gold finish. It features a blue torch flame. Associated gas refill: black (REF 900430) Lighter delivered empty of gas; refill sold separately.` },
    collection: `Minijet`,
    categorySlug: "isqueiros",
    image: `/products/minijet-geode/010836.webp`,
    variants: [
      { sku: `010836`, name: { pt: `Lacquered lighter — Verde`, en: `Lacquered lighter — Green` }, priceCents: 19320, currency: "EUR", attributes: { color: { label: { pt: `Verde`, en: `Green` }, hex: ["#3a5040"] } }, image: `/products/minijet-geode/010836.webp`, images: [`/products/minijet-geode/010836.webp`, `/products/minijet-geode/010836-2.webp`, `/products/minijet-geode/010836-3.webp`, `/products/minijet-geode/010836-4.webp`] },
      { sku: `010835`, name: { pt: `Lacquered lighter — Azul`, en: `Lacquered lighter — Blue` }, priceCents: 19320, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/minijet-geode/010835.webp`, images: [`/products/minijet-geode/010835.webp`, `/products/minijet-geode/010835-2.webp`, `/products/minijet-geode/010835-3.webp`, `/products/minijet-geode/010835-4.webp`] }
    ],
  },
  {
    slug: `initial-2`,
    name: { pt: `Guilloche lighter`, en: `Guilloche lighter` },
    description: { pt: `Initial lighter, cinatic guilloche decor, golden finishes. With a double yellow flame. Associated lighter stone: red (REF 900650) Associated gas recharge: blue (REF 900434) Lighter delivered empty of gas, refill sold separately.`, en: `Initial lighter, cinatic guilloche decor, golden finishes. With a double yellow flame. Associated lighter stone: red (REF 900650) Associated gas recharge: blue (REF 900434) Lighter delivered empty of gas, refill sold separately.` },
    collection: `Initial`,
    categorySlug: "isqueiros",
    image: `/products/initial-2/020845.webp`,
    variants: [
      { sku: `020845`, name: { pt: `Guilloche lighter — Dourado`, en: `Guilloche lighter — Golden` }, priceCents: 54740, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/initial-2/020845.webp`, images: [`/products/initial-2/020845.webp`, `/products/initial-2/020845-2.webp`, `/products/initial-2/020845-3.webp`, `/products/initial-2/020845-4.webp`] }
    ],
  },
  {
    slug: `popote`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `An emblematic technique of the S.T. Dupont house, the so-called Popoté technique plays with material and light. Using a special stamp, the craftsman applies irregular touches to the lacquer, creating a painterly effect where the surface seems to vibrate under the light. Each gesture, both precise and random, reveals a unique depth. Ligne 2 Popoté lighter in black Urushi lacquer with hand-applied Popoté décor. Fitted with a diamond-point guilloche cap. Palladium finish. Equipped with a double yellow flame and the iconic "Cling" sound upon opening. Associated flint: black (REF 900601) Associated gas refill: red (REF 900435) Lighter supplied empty of gas, refill sold separately.`, en: `An emblematic technique of the S.T. Dupont house, the so-called Popoté technique plays with material and light. Using a special stamp, the craftsman applies irregular touches to the lacquer, creating a painterly effect where the surface seems to vibrate under the light. Each gesture, both precise and random, reveals a unique depth. Ligne 2 Popoté lighter in black Urushi lacquer with hand-applied Popoté décor. Fitted with a diamond-point guilloche cap. Palladium finish. Equipped with a double yellow flame and the iconic "Cling" sound upon opening. Associated flint: black (REF 900601) Associated gas refill: red (REF 900435) Lighter supplied empty of gas, refill sold separately.` },
    collection: ``,
    categorySlug: "isqueiros",
    image: `/products/popote/C16018CL.webp`,
    variants: [
      { sku: `C16018CL`, name: { pt: `Lacquered lighter — Azul`, en: `Lacquered lighter — Blue` }, priceCents: 174340, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/popote/C16018CL.webp`, images: [`/products/popote/C16018CL.webp`, `/products/popote/C16018CL-2.webp`, `/products/popote/C16018CL-3.webp`, `/products/popote/C16018CL-4.webp`] },
      { sku: `C16017CL`, name: { pt: `Lacquered lighter — Vermelho`, en: `Lacquered lighter — Red` }, priceCents: 174340, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/popote/C16017CL.webp`, images: [`/products/popote/C16017CL.webp`, `/products/popote/C16017CL-2.webp`, `/products/popote/C16017CL-3.webp`, `/products/popote/C16017CL-4.webp`] },
      { sku: `C16016CL`, name: { pt: `Lacquered lighter — Preto`, en: `Lacquered lighter — Black` }, priceCents: 174340, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/popote/C16016CL.webp`, images: [`/products/popote/C16016CL.webp`, `/products/popote/C16016CL-2.webp`, `/products/popote/C16016CL-3.webp`, `/products/popote/C16016CL-4.webp`] }
    ],
  },
  {
    slug: `le-grand-dupont-popote`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `An emblematic technique of the S.T. Dupont house, the so-called Popoté technique plays with material and light. Using a special stamp, the craftsman applies irregular touches to the lacquer, creating a painterly effect where the surface seems to vibrate under the light. Each gesture, both precise and random, reveals a unique depth. Le Grand Dupont Cling Popoté lighter in black Urushi lacquer with hand-applied Popoté décor. Fitted with a diamond-point guilloche cap. Palladium finish. Equipped with a dual ignition system for yellow flame or blue flame, and the iconic "Cling" sound upon opening. Associated flint: red (REF 900651) Associated gas refill: red (REF 900435) Lighter supplied empty of gas, refill sold separately. Screwdriver included for changing the flint.`, en: `An emblematic technique of the S.T. Dupont house, the so-called Popoté technique plays with material and light. Using a special stamp, the craftsman applies irregular touches to the lacquer, creating a painterly effect where the surface seems to vibrate under the light. Each gesture, both precise and random, reveals a unique depth. Le Grand Dupont Cling Popoté lighter in black Urushi lacquer with hand-applied Popoté décor. Fitted with a diamond-point guilloche cap. Palladium finish. Equipped with a dual ignition system for yellow flame or blue flame, and the iconic "Cling" sound upon opening. Associated flint: red (REF 900651) Associated gas refill: red (REF 900435) Lighter supplied empty of gas, refill sold separately. Screwdriver included for changing the flint.` },
    collection: `Le Grand Dupont`,
    categorySlug: "isqueiros",
    image: `/products/le-grand-dupont-popote/C23017CL.webp`,
    variants: [
      { sku: `C23017CL`, name: { pt: `Lacquered lighter — Vermelho`, en: `Lacquered lighter — Red` }, priceCents: 192740, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/le-grand-dupont-popote/C23017CL.webp`, images: [`/products/le-grand-dupont-popote/C23017CL.webp`, `/products/le-grand-dupont-popote/C23017CL-2.webp`, `/products/le-grand-dupont-popote/C23017CL-3.webp`, `/products/le-grand-dupont-popote/C23017CL-4.webp`] },
      { sku: `C23018CL`, name: { pt: `Lacquered lighter — Vermelho`, en: `Lacquered lighter — Red` }, priceCents: 192740, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/le-grand-dupont-popote/C23018CL.webp`, images: [`/products/le-grand-dupont-popote/C23018CL.webp`, `/products/le-grand-dupont-popote/C23018CL-2.webp`, `/products/le-grand-dupont-popote/C23018CL-3.webp`, `/products/le-grand-dupont-popote/C23018CL-4.webp`] },
      { sku: `C23016CL`, name: { pt: `Lacquered lighter — Preto`, en: `Lacquered lighter — Black` }, priceCents: 192740, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/le-grand-dupont-popote/C23016CL.webp`, images: [`/products/le-grand-dupont-popote/C23016CL.webp`, `/products/le-grand-dupont-popote/C23016CL-2.webp`, `/products/le-grand-dupont-popote/C23016CL-3.webp`, `/products/le-grand-dupont-popote/C23016CL-4.webp`] }
    ],
  },
  {
    slug: `ligne-2-geode`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `Mysterious and captivating, geodes inspire an S.T. Dupont collection expressed through two mineral tones: a deep blue evoking agate, a symbol of balance, and a vibrant green reminiscent of malachite, representing protection and energy. Like these precious stones, each Géode creation reflects the artisanal craftsmanship and precision excellence of S.T. Dupont. The Ligne 2 Cling Géode lighter is adorned with a motif inspired by the shimmering core of agate. Palladium finish. It features a dual soft yellow flame and the signature “Cling” upon opening. Associated lighter flints: black (REF 900601) Associated gas refill: red (REF 900435) Lighter delivered empty of gas; refill sold separately.`, en: `Mysterious and captivating, geodes inspire an S.T. Dupont collection expressed through two mineral tones: a deep blue evoking agate, a symbol of balance, and a vibrant green reminiscent of malachite, representing protection and energy. Like these precious stones, each Géode creation reflects the artisanal craftsmanship and precision excellence of S.T. Dupont. The Ligne 2 Cling Géode lighter is adorned with a motif inspired by the shimmering core of agate. Palladium finish. It features a dual soft yellow flame and the signature “Cling” upon opening. Associated lighter flints: black (REF 900601) Associated gas refill: red (REF 900435) Lighter delivered empty of gas; refill sold separately.` },
    collection: `Ligne 2`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-geode/C16036CL.webp`,
    variants: [
      { sku: `C16036CL`, name: { pt: `Lacquered lighter — Verde`, en: `Lacquered lighter — Green` }, priceCents: 155940, currency: "EUR", attributes: { color: { label: { pt: `Verde`, en: `Green` }, hex: ["#3a5040"] } }, image: `/products/ligne-2-geode/C16036CL.webp`, images: [`/products/ligne-2-geode/C16036CL.webp`, `/products/ligne-2-geode/C16036CL-2.webp`, `/products/ligne-2-geode/C16036CL-3.webp`, `/products/ligne-2-geode/C16036CL-4.webp`] },
      { sku: `C16035CL`, name: { pt: `Lacquered lighter — Azul`, en: `Lacquered lighter — Blue` }, priceCents: 155940, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/ligne-2-geode/C16035CL.webp`, images: [`/products/ligne-2-geode/C16035CL.webp`, `/products/ligne-2-geode/C16035CL-2.webp`, `/products/ligne-2-geode/C16035CL-3.webp`, `/products/ligne-2-geode/C16035CL-4.webp`] }
    ],
  },
  {
    slug: `ligne-2-horse-mane`,
    name: { pt: `Horse mane guilloche`, en: `Horse mane guilloche` },
    description: { pt: `Inspired by the 2026 Lunar Year of the Horse, the Horsemane Collection introduces a unique “mane” guilloché under red or black lacquer. Ligne 2 Cling lighter decorated with guilloché under high-gloss red lacquer with “horse mane” motif. Gold-plated finish. Equipped with a double yellow flame and the signature “Cling” opening. Lighter delivered empty of gas; refill sold separately.`, en: `Inspired by the 2026 Lunar Year of the Horse, the Horsemane Collection introduces a unique “mane” guilloché under red or black lacquer. Ligne 2 Cling lighter decorated with guilloché under high-gloss red lacquer with “horse mane” motif. Gold-plated finish. Equipped with a double yellow flame and the signature “Cling” opening. Lighter delivered empty of gas; refill sold separately.` },
    collection: `Ligne 2`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-horse-mane/C16089CL.webp`,
    variants: [
      { sku: `C16089CL`, name: { pt: `Horse mane guilloche — Vermelho`, en: `Horse mane guilloche — Red` }, priceCents: 165140, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/ligne-2-horse-mane/C16089CL.webp`, images: [`/products/ligne-2-horse-mane/C16089CL.webp`, `/products/ligne-2-horse-mane/C16089CL-2.webp`, `/products/ligne-2-horse-mane/C16089CL-3.webp`, `/products/ligne-2-horse-mane/C16089CL-4.webp`] },
      { sku: `C16090CL`, name: { pt: `Horse mane guilloche — Preto`, en: `Horse mane guilloche — Black` }, priceCents: 165140, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/ligne-2-horse-mane/C16090CL.webp`, images: [`/products/ligne-2-horse-mane/C16090CL.webp`, `/products/ligne-2-horse-mane/C16090CL-2.webp`, `/products/ligne-2-horse-mane/C16090CL-3.webp`, `/products/ligne-2-horse-mane/C16090CL-4.webp`] }
    ],
  },
  {
    slug: `le-grand-dupont-2`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `The iconic Le Grand Dupont is reinvented! With a new, bolder edition, the Le New Grand Dupont, with its sleek design, offers you a unique sensory experience. The "Cling" announces a precious and memorable moment. The double ignition system allows you to choose between a soft flame or a turbo flame to light your cigar. For the first time, a screwdriver is included and allows you to change the screws of the lighter yourself. Associated lighter: red (REF 900650) Associated gas refill: red (REF 900435) Lighter delivered empty of gas, refill sold separately.`, en: `The iconic Le Grand Dupont is reinvented! With a new, bolder edition, the Le New Grand Dupont, with its sleek design, offers you a unique sensory experience. The "Cling" announces a precious and memorable moment. The double ignition system allows you to choose between a soft flame or a turbo flame to light your cigar. For the first time, a screwdriver is included and allows you to change the screws of the lighter yourself. Associated lighter: red (REF 900650) Associated gas refill: red (REF 900435) Lighter delivered empty of gas, refill sold separately.` },
    collection: `Le Grand Dupont`,
    categorySlug: "isqueiros",
    image: `/products/le-grand-dupont-2/C23110BL.webp`,
    variants: [
      { sku: `C23110BL`, name: { pt: `Lacquered lighter — Preto`, en: `Lacquered lighter — Black` }, priceCents: 165140, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/le-grand-dupont-2/C23110BL.webp`, images: [`/products/le-grand-dupont-2/C23110BL.webp`] },
      { sku: `C16601CY`, name: { pt: `Lacquered lighter — Prata`, en: `Lacquered lighter — Silver` }, priceCents: 174340, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/le-grand-dupont-2/C16601CY.webp`, images: [`/products/le-grand-dupont-2/C16601CY.webp`, `/products/le-grand-dupont-2/C16601CY-2.webp`] },
      { sku: `C16601CB`, name: { pt: `Lacquered lighter — Prata`, en: `Lacquered lighter — Silver` }, priceCents: 174340, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/le-grand-dupont-2/C16601CB.webp`, images: [`/products/le-grand-dupont-2/C16601CB.webp`, `/products/le-grand-dupont-2/C16601CB-2.webp`] },
      { sku: `C16656`, name: { pt: `Lacquered lighter — Prata`, en: `Lacquered lighter — Silver` }, priceCents: 155940, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/le-grand-dupont-2/C16656.webp`, images: [`/products/le-grand-dupont-2/C16656.webp`, `/products/le-grand-dupont-2/C16656-2.webp`] },
      { sku: `C16014HC`, name: { pt: `Lacquered lighter — Castanho`, en: `Lacquered lighter — Brown` }, priceCents: 413540, currency: "EUR", attributes: { color: { label: { pt: `Castanho`, en: `Brown` }, hex: ["#6b4a2a"] } }, image: `/products/le-grand-dupont-2/C16014HC.webp`, images: [`/products/le-grand-dupont-2/C16014HC.webp`, `/products/le-grand-dupont-2/C16014HC-2.webp`, `/products/le-grand-dupont-2/C16014HC-3.webp`, `/products/le-grand-dupont-2/C16014HC-4.webp`] },
      { sku: `C23013`, name: { pt: `Lacquered lighter — Azul & Escuro & Azul`, en: `Lacquered lighter — Blue & Dark Blue` }, priceCents: 183540, currency: "EUR", attributes: { color: { label: { pt: `Azul & Escuro & Azul`, en: `Blue & Dark Blue` }, hex: ["#1f3c66", "#2a2d34"] } }, image: `/products/le-grand-dupont-2/C23013.webp`, images: [`/products/le-grand-dupont-2/C23013.webp`, `/products/le-grand-dupont-2/C23013-2.webp`, `/products/le-grand-dupont-2/C23013-3.webp`, `/products/le-grand-dupont-2/C23013-4.webp`] },
      { sku: `C23010`, name: { pt: `Lacquered lighter — Preto`, en: `Lacquered lighter — Black` }, priceCents: 174340, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/le-grand-dupont-2/C23010.webp`, images: [`/products/le-grand-dupont-2/C23010.webp`, `/products/le-grand-dupont-2/C23010-2.webp`, `/products/le-grand-dupont-2/C23010-3.webp`, `/products/le-grand-dupont-2/C23010-4.webp`] },
      { sku: `C23011`, name: { pt: `Lacquered lighter — Prata`, en: `Lacquered lighter — Silver` }, priceCents: 165140, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/le-grand-dupont-2/C23011.webp`, images: [`/products/le-grand-dupont-2/C23011.webp`, `/products/le-grand-dupont-2/C23011-2.webp`, `/products/le-grand-dupont-2/C23011-3.webp`, `/products/le-grand-dupont-2/C23011-4.webp`] },
      { sku: `C23009`, name: { pt: `Lacquered lighter — Dourado`, en: `Lacquered lighter — Golden` }, priceCents: 165140, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/le-grand-dupont-2/C23009.webp`, images: [`/products/le-grand-dupont-2/C23009.webp`, `/products/le-grand-dupont-2/C23009-2.webp`, `/products/le-grand-dupont-2/C23009-3.webp`, `/products/le-grand-dupont-2/C23009-4.webp`] }
    ],
  },
  {
    // The headline DC Comics tile — a Lighter Necklace (the K27 series is
    // pendant / mini-jet hardware, not a full lighter).
    slug: `dc-comics`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `S.T. Dupont unveils the third chapter of its collaboration with DC COMICS through an exclusive collection inspired by three iconic figures: Wonder Woman, Catwoman and The Penguin. The collection conveys a universal message of justice, freedom and power, elevated by the Maison’s savoir-faire in exceptional creations such as the Ligne 2 lighter, the Line D Eternity pen and, for selected characters, a Lighter Necklace. Wonder Woman Lighter Necklace adorned with a lacquered decoration featuring the W and the star, emblems of the DC COMICS heroine. Diamond-point guilloché cap with a gold finish. Features a yellow flame. Removable chain adjustable to three different lengths: 80/85/90 cm. Associated gas refill: black 000430 Lighter delivered empty of gas, refill sold separately.`, en: `S.T. Dupont unveils the third chapter of its collaboration with DC COMICS through an exclusive collection inspired by three iconic figures: Wonder Woman, Catwoman and The Penguin. The collection conveys a universal message of justice, freedom and power, elevated by the Maison’s savoir-faire in exceptional creations such as the Ligne 2 lighter, the Line D Eternity pen and, for selected characters, a Lighter Necklace. Wonder Woman Lighter Necklace adorned with a lacquered decoration featuring the W and the star, emblems of the DC COMICS heroine. Diamond-point guilloché cap with a gold finish. Features a yellow flame. Removable chain adjustable to three different lengths: 80/85/90 cm. Associated gas refill: black 000430 Lighter delivered empty of gas, refill sold separately.` },
    collection: ``,
    categorySlug: "isqueiros",
    image: `/products/dc-comics/K27221CH.webp`,
    variants: [
      { sku: `K27221CH`, name: { pt: `Lacquered lighter — Vermelho`, en: `Lacquered lighter — Red` }, priceCents: 45540, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/dc-comics/K27221CH.webp`, images: [`/products/dc-comics/K27221CH.webp`, `/products/dc-comics/K27221CH-2.webp`, `/products/dc-comics/K27221CH-3.webp`, `/products/dc-comics/K27221CH-4.webp`] }
    ],
  },
  {
    // The C16 SKUs (Ligne 2 family) under the DC Comics theme are the
    // Catwoman colourway — split out so the catalogue tile reads as a
    // Ligne 2 lighter rather than a pendant.
    slug: `ligne-2-catwoman`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `S.T. Dupont unveils the third chapter of its collaboration with DC COMICS through an exclusive collection inspired by three iconic figures: Wonder Woman, Catwoman and The Penguin. The collection conveys a universal message of justice, freedom and power, elevated by the Maison’s savoir-faire in exceptional creations such as the Ligne 2 lighter, the Line D Eternity pen and, for selected characters, a Lighter Necklace. Ligne 2 Cling Catwoman lighter adorned with a black lacquer decoration featuring the DC COMICS character. Diamond-point guilloché cap with a glossy black finish. Equipped with a dual yellow flame and the signature “Cling” upon opening. Associated lighter flint: black (REF 900601) Associated gas refill: red (REF 900435) Lighter delivered empty of gas, refill sold separately.`, en: `S.T. Dupont unveils the third chapter of its collaboration with DC COMICS through an exclusive collection inspired by three iconic figures: Wonder Woman, Catwoman and The Penguin. The collection conveys a universal message of justice, freedom and power, elevated by the Maison’s savoir-faire in exceptional creations such as the Ligne 2 lighter, the Line D Eternity pen and, for selected characters, a Lighter Necklace. Ligne 2 Cling Catwoman lighter adorned with a black lacquer decoration featuring the DC COMICS character. Diamond-point guilloché cap with a glossy black finish. Equipped with a dual yellow flame and the signature “Cling” upon opening. Associated lighter flint: black (REF 900601) Associated gas refill: red (REF 900435) Lighter delivered empty of gas, refill sold separately.` },
    collection: `DC Comics`,
    categorySlug: "isqueiros",
    image: `/products/dc-comics/C16180CL.webp`,
    variants: [
      { sku: `C16180CL`, name: { pt: `Lacquered lighter — Preto`, en: `Lacquered lighter — Black` }, priceCents: 183540, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/dc-comics/C16180CL.webp`, images: [`/products/dc-comics/C16180CL.webp`, `/products/dc-comics/C16180CL-2.webp`, `/products/dc-comics/C16180CL-3.webp`, `/products/dc-comics/C16180CL-4.webp`] },
      { sku: `C16220CL`, name: { pt: `Lacquered lighter — Preto`, en: `Lacquered lighter — Black` }, priceCents: 183540, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/dc-comics/C16220CL.webp`, images: [`/products/dc-comics/C16220CL.webp`, `/products/dc-comics/C16220CL-2.webp`, `/products/dc-comics/C16220CL-3.webp`, `/products/dc-comics/C16220CL-4.webp`] }
    ],
  },
  {
    slug: `ligne-2-dc-comics`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `S.T. Dupont unveils the third chapter of its collaboration with DC COMICS through an exclusive collection inspired by three iconic figures: Wonder Woman, Catwoman and The Penguin. The collection conveys a universal message of justice, freedom and power, elevated by the Maison’s savoir-faire in exceptional creations such as the Ligne 2 lighter, the Line D Eternity pen and, for selected characters, a Lighter Necklace. Ligne 2 Cling Wonder Woman lighter adorned with a lacquered decoration featuring the W and the star, emblems of the DC COMICS heroine. Diamond-point guilloché cap with a gold finish. Equipped with a dual yellow flame and the signature “Cling” upon opening. Associated lighter flint: black (REF 900601) Associated gas refill: red (REF 900435) Lighter delivered empty of gas, refill sold separately.`, en: `S.T. Dupont unveils the third chapter of its collaboration with DC COMICS through an exclusive collection inspired by three iconic figures: Wonder Woman, Catwoman and The Penguin. The collection conveys a universal message of justice, freedom and power, elevated by the Maison’s savoir-faire in exceptional creations such as the Ligne 2 lighter, the Line D Eternity pen and, for selected characters, a Lighter Necklace. Ligne 2 Cling Wonder Woman lighter adorned with a lacquered decoration featuring the W and the star, emblems of the DC COMICS heroine. Diamond-point guilloché cap with a gold finish. Equipped with a dual yellow flame and the signature “Cling” upon opening. Associated lighter flint: black (REF 900601) Associated gas refill: red (REF 900435) Lighter delivered empty of gas, refill sold separately.` },
    collection: `Ligne 2`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-dc-comics/C16221CL.webp`,
    variants: [
      { sku: `C16221CL`, name: { pt: `Lacquered lighter — Vermelho`, en: `Lacquered lighter — Red` }, priceCents: 183540, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/ligne-2-dc-comics/C16221CL.webp`, images: [`/products/ligne-2-dc-comics/C16221CL.webp`, `/products/ligne-2-dc-comics/C16221CL-2.webp`, `/products/ligne-2-dc-comics/C16221CL-3.webp`, `/products/ligne-2-dc-comics/C16221CL-4.webp`] }
    ],
  },
  {
    slug: `torch`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `The Torch, a new creation by S.T. Dupont, is a versatile lighter with an innovative design, combining performance and ease of use. Designed to accompany your moments both indoors and outdoors, it features a powerful, adjustable torch flame for precise ignition. Its rotating nozzle allows you to direct the flame with accuracy, ensuring a personalized grip and unmatched versatility. Torch lighter in glossy black lacquer, decorated with a diamond-pattern guilloché finish. Trigger with sliding mechanism. Pivoting head lighter to direct the flame. Chrome finish. Round torch flame. https://fr.st-dupont.com/products/recharge-de-gaz-rouge-defi-xtreme-900436?_pos=5&_sid=17de083ef&_ss=r Lighter is delivered empty; gas refill sold separately.`, en: `The Torch, a new creation by S.T. Dupont, is a versatile lighter with an innovative design, combining performance and ease of use. Designed to accompany your moments both indoors and outdoors, it features a powerful, adjustable torch flame for precise ignition. Its rotating nozzle allows you to direct the flame with accuracy, ensuring a personalized grip and unmatched versatility. Torch lighter in glossy black lacquer, decorated with a diamond-pattern guilloché finish. Trigger with sliding mechanism. Pivoting head lighter to direct the flame. Chrome finish. Round torch flame. https://fr.st-dupont.com/products/recharge-de-gaz-rouge-defi-xtreme-900436?_pos=5&_sid=17de083ef&_ss=r Lighter is delivered empty; gas refill sold separately.` },
    collection: `Torch`,
    categorySlug: "isqueiros",
    image: `/products/torch/029002.webp`,
    variants: [
      { sku: `029002`, name: { pt: `Lacquered lighter — Dourado`, en: `Lacquered lighter — Golden` }, priceCents: 54740, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/torch/029002.webp`, images: [`/products/torch/029002.webp`, `/products/torch/029002-2.webp`, `/products/torch/029002-3.webp`, `/products/torch/029002-4.webp`] },
      { sku: `029001`, name: { pt: `Lacquered lighter — Preto & Prata`, en: `Lacquered lighter — Black & Silver` }, priceCents: 54740, currency: "EUR", attributes: { color: { label: { pt: `Preto & Prata`, en: `Black & Silver` }, hex: ["#15171c", "#c9ccd1"] } }, image: `/products/torch/029001.webp`, images: [`/products/torch/029001.webp`, `/products/torch/029001-2.webp`, `/products/torch/029001-3.webp`, `/products/torch/029001-4.webp`] }
    ],
  },
  {
    slug: `ligne-2-orlinski`,
    name: { pt: `brushed lighter`, en: `brushed lighter` },
    description: { pt: `S.T. Dupont partners with French artist Richard Orlinski for an exclusive collection where the power of sculptural gestures meets the precision of artisanal craftsmanship. Inspired by the iconic “Kong” motif and the wildness of nature, this collaboration injects a raw, contemporary energy into the Maison’s creations. Lighters and writing instruments become true works of art, enhanced by angular lines, contrasting textures, and vibrant colors. The “Red” line highlights exceptional technical work, combining a new brushed gold finish with a “Kong” motif crafted in metal filigree. A guilloché pattern inspired by the 1970s completes the set, creating a sense of movement in the material. These techniques are applied to the Ligne 2 lighter and Line D Eternity pen in their red and gold versions, delivering a signature that is both precise and sculptural. Ligne 2 lighter decorated with a diagonal guilloché under lacquer and adorned with the brushed gold “Kong” motif. Coated in glossy S.T. Dupont red lacquer. Equipped with a double yellow flame and the famous “Cling” opening sound. Associated flint: black (REF 900601) Associated gas refill: red (REF 900435) Lighter delivered without gas; refill sold separately. Discover the full Orlinski collection.`, en: `S.T. Dupont partners with French artist Richard Orlinski for an exclusive collection where the power of sculptural gestures meets the precision of artisanal craftsmanship. Inspired by the iconic “Kong” motif and the wildness of nature, this collaboration injects a raw, contemporary energy into the Maison’s creations. Lighters and writing instruments become true works of art, enhanced by angular lines, contrasting textures, and vibrant colors. The “Red” line highlights exceptional technical work, combining a new brushed gold finish with a “Kong” motif crafted in metal filigree. A guilloché pattern inspired by the 1970s completes the set, creating a sense of movement in the material. These techniques are applied to the Ligne 2 lighter and Line D Eternity pen in their red and gold versions, delivering a signature that is both precise and sculptural. Ligne 2 lighter decorated with a diagonal guilloché under lacquer and adorned with the brushed gold “Kong” motif. Coated in glossy S.T. Dupont red lacquer. Equipped with a double yellow flame and the famous “Cling” opening sound. Associated flint: black (REF 900601) Associated gas refill: red (REF 900435) Lighter delivered without gas; refill sold separately. Discover the full Orlinski collection.` },
    collection: `Ligne 2`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-orlinski/C16061CL.webp`,
    variants: [
      { sku: `C16061CL`, name: { pt: `brushed lighter — Ouro`, en: `brushed lighter — Gold` }, priceCents: 192740, currency: "EUR", attributes: { color: { label: { pt: `Ouro`, en: `Gold` }, hex: ["#c8a24a"] } }, image: `/products/ligne-2-orlinski/C16061CL.webp`, images: [`/products/ligne-2-orlinski/C16061CL.webp`, `/products/ligne-2-orlinski/C16061CL-2.webp`, `/products/ligne-2-orlinski/C16061CL-3.webp`, `/products/ligne-2-orlinski/C16061CL-4.webp`] },
      { sku: `C16060`, name: { pt: `brushed lighter — Vermelho`, en: `brushed lighter — Red` }, priceCents: 211140, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/ligne-2-orlinski/C16060.webp`, images: [`/products/ligne-2-orlinski/C16060.webp`, `/products/ligne-2-orlinski/C16060-2.webp`, `/products/ligne-2-orlinski/C16060-3.webp`, `/products/ligne-2-orlinski/C16060-4.webp`] },
      { sku: `C16062CL`, name: { pt: `brushed lighter — Prata`, en: `brushed lighter — Silver` }, priceCents: 192740, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/ligne-2-orlinski/C16062CL.webp`, images: [`/products/ligne-2-orlinski/C16062CL.webp`, `/products/ligne-2-orlinski/C16062CL-2.webp`, `/products/ligne-2-orlinski/C16062CL-3.webp`, `/products/ligne-2-orlinski/C16062CL-4.webp`] }
    ],
  },
  {
    slug: `slimmy-orlinski`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `S.T. Dupont partners with French artist Richard Orlinski for an exclusive collection where the power of sculptural gestures meets the precision of artisanal craftsmanship. Inspired by the iconic “Kong” motif and the wildness of nature, this collaboration brings a raw, contemporary energy to the Maison’s creations. Lighters and writing instruments become true works of art, enhanced by angular lines, contrasting textures, and vibrant colors. Slimmy lighter in orange lacquer decorated with the “Kong” motif in chrome finish. Equipped with a 2 cm blue torch flame, ideal for lighting candles or cigarettes. Associated gas refill: black (REF 900430) Lighter delivered without gas; refill sold separately. Discover the full Orlinski collection.`, en: `S.T. Dupont partners with French artist Richard Orlinski for an exclusive collection where the power of sculptural gestures meets the precision of artisanal craftsmanship. Inspired by the iconic “Kong” motif and the wildness of nature, this collaboration brings a raw, contemporary energy to the Maison’s creations. Lighters and writing instruments become true works of art, enhanced by angular lines, contrasting textures, and vibrant colors. Slimmy lighter in orange lacquer decorated with the “Kong” motif in chrome finish. Equipped with a 2 cm blue torch flame, ideal for lighting candles or cigarettes. Associated gas refill: black (REF 900430) Lighter delivered without gas; refill sold separately. Discover the full Orlinski collection.` },
    collection: `Slimmy`,
    categorySlug: "isqueiros",
    image: `/products/slimmy-orlinski/025063.webp`,
    variants: [
      { sku: `025063`, name: { pt: `Lacquered lighter — Laranja`, en: `Lacquered lighter — Orange` }, priceCents: 50600, currency: "EUR", attributes: { color: { label: { pt: `Laranja`, en: `Orange` }, hex: ["#c4642d"] } }, image: `/products/slimmy-orlinski/025063.webp`, images: [`/products/slimmy-orlinski/025063.webp`, `/products/slimmy-orlinski/025063-2.webp`, `/products/slimmy-orlinski/025063-3.webp`, `/products/slimmy-orlinski/025063-4.webp`] },
      { sku: `028064`, name: { pt: `Lacquered lighter — Azul`, en: `Lacquered lighter — Blue` }, priceCents: 41400, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/slimmy-orlinski/028064.webp`, images: [`/products/slimmy-orlinski/028064.webp`, `/products/slimmy-orlinski/028064-2.webp`, `/products/slimmy-orlinski/028064-3.webp`, `/products/slimmy-orlinski/028064-4.webp`] },
      { sku: `028063`, name: { pt: `Lacquered lighter — Laranja`, en: `Lacquered lighter — Orange` }, priceCents: 41400, currency: "EUR", attributes: { color: { label: { pt: `Laranja`, en: `Orange` }, hex: ["#c4642d"] } }, image: `/products/slimmy-orlinski/028063.webp`, images: [`/products/slimmy-orlinski/028063.webp`, `/products/slimmy-orlinski/028063-2.webp`, `/products/slimmy-orlinski/028063-3.webp`, `/products/slimmy-orlinski/028063-4.webp`] }
    ],
  },
  {
    slug: `biggy-orlinski`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `S.T. Dupont partners with French artist Richard Orlinski for an exclusive collection where the power of sculptural gestures meets the precision of artisanal craftsmanship. Inspired by the iconic “Kong” motif and the wildness of nature, this collaboration brings a raw, contemporary energy to the Maison’s creations. Lighters and writing instruments become true works of art, enhanced by angular lines, contrasting textures, and vibrant colors. Biggy lighter in blue lacquer decorated with the “Kong” motif in chrome finish. Equipped with a 2 cm blue torch flame, perfect for lighting candles or cigarettes. Associated gas refill: black (REF 900430) Lighter delivered without gas; refill sold separately. Discover the full Orlinski collection."`, en: `S.T. Dupont partners with French artist Richard Orlinski for an exclusive collection where the power of sculptural gestures meets the precision of artisanal craftsmanship. Inspired by the iconic “Kong” motif and the wildness of nature, this collaboration brings a raw, contemporary energy to the Maison’s creations. Lighters and writing instruments become true works of art, enhanced by angular lines, contrasting textures, and vibrant colors. Biggy lighter in blue lacquer decorated with the “Kong” motif in chrome finish. Equipped with a 2 cm blue torch flame, perfect for lighting candles or cigarettes. Associated gas refill: black (REF 900430) Lighter delivered without gas; refill sold separately. Discover the full Orlinski collection."` },
    collection: `Biggy`,
    categorySlug: "isqueiros",
    image: `/products/biggy-orlinski/025064.webp`,
    variants: [
      { sku: `025064`, name: { pt: `Lacquered lighter — Azul`, en: `Lacquered lighter — Blue` }, priceCents: 50600, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/biggy-orlinski/025064.webp`, images: [`/products/biggy-orlinski/025064.webp`, `/products/biggy-orlinski/025064-2.webp`, `/products/biggy-orlinski/025064-3.webp`, `/products/biggy-orlinski/025064-4.webp`] }
    ],
  },
  {
    slug: `ligne-2-2`,
    name: { pt: `Micro Diamond head lighter`, en: `Micro Diamond head lighter` },
    description: { pt: `The quintessential S.T. Dupont lighter. Its famous "cling" upon opening is a hallmark recognized among connoisseurs. Its harmonious proportions make it universal. A collection with clean lines, dressed in noble materials, and equipped with a double yellow flame. With classic elegance, this lighter is adorned with vertical guilloché and a silver finish. This lighter is silver-plated. Silver is a precious and durable metal. Its exceptional properties give it a brilliance that enhances our creations. Silver is a living material that develops a patina over time; however, this does not affect the quality of the product, and the effects of time can be reversed. We recommend maintaining your S.T. Dupont products with a soft cloth and visiting your nearest boutique to receive expert advice from our specialists. We also invite you to visit the Maison’s website to learn more about caring for your S.T. Dupont pieces. Associated flint: black (REF 900601). Associated gas refill: yellow (REF 900432). Lighter delivered empty of gas, refill sold separately.`, en: `The quintessential S.T. Dupont lighter. Its famous "cling" upon opening is a hallmark recognized among connoisseurs. Its harmonious proportions make it universal. A collection with clean lines, dressed in noble materials, and equipped with a double yellow flame. With classic elegance, this lighter is adorned with vertical guilloché and a silver finish. This lighter is silver-plated. Silver is a precious and durable metal. Its exceptional properties give it a brilliance that enhances our creations. Silver is a living material that develops a patina over time; however, this does not affect the quality of the product, and the effects of time can be reversed. We recommend maintaining your S.T. Dupont products with a soft cloth and visiting your nearest boutique to receive expert advice from our specialists. We also invite you to visit the Maison’s website to learn more about caring for your S.T. Dupont pieces. Associated flint: black (REF 900601). Associated gas refill: yellow (REF 900432). Lighter delivered empty of gas, refill sold separately.` },
    collection: `Ligne 2`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-2/C16079.webp`,
    variants: [
      { sku: `C16079`, name: { pt: `Micro Diamond head lighter — Preto`, en: `Micro Diamond head lighter — Black` }, priceCents: 151800, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/ligne-2-2/C16079.webp`, images: [`/products/ligne-2-2/C16079.webp`, `/products/ligne-2-2/C16079-2.webp`, `/products/ligne-2-2/C16079-3.webp`, `/products/ligne-2-2/C16079-4.webp`] },
      { sku: `C16646`, name: { pt: `Micro Diamond head lighter — Dourado`, en: `Micro Diamond head lighter — Golden` }, priceCents: 133400, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/ligne-2-2/C16646.webp`, images: [`/products/ligne-2-2/C16646.webp`, `/products/ligne-2-2/C16646-2.webp`, `/products/ligne-2-2/C16646-3.webp`, `/products/ligne-2-2/C16646-4.webp`] },
      { sku: `C16645`, name: { pt: `Micro Diamond head lighter — Prata`, en: `Micro Diamond head lighter — Silver` }, priceCents: 133400, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/ligne-2-2/C16645.webp`, images: [`/products/ligne-2-2/C16645.webp`, `/products/ligne-2-2/C16645-2.webp`, `/products/ligne-2-2/C16645-3.webp`, `/products/ligne-2-2/C16645-4.webp`] },
      { sku: `016827`, name: { pt: `Micro Diamond head lighter — Dourado`, en: `Micro Diamond head lighter — Golden` }, priceCents: 115000, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/ligne-2-2/016827.webp`, images: [`/products/ligne-2-2/016827.webp`, `/products/ligne-2-2/016827-2.webp`, `/products/ligne-2-2/016827-3.webp`, `/products/ligne-2-2/016827-4.webp`] },
      { sku: `016817`, name: { pt: `Micro Diamond head lighter — Prata`, en: `Micro Diamond head lighter — Silver` }, priceCents: 105800, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/ligne-2-2/016817.webp`, images: [`/products/ligne-2-2/016817.webp`, `/products/ligne-2-2/016817-2.webp`, `/products/ligne-2-2/016817-3.webp`, `/products/ligne-2-2/016817-4.webp`] },
      { sku: `016424`, name: { pt: `Micro Diamond head lighter — Rosa`, en: `Micro Diamond head lighter — Pink` }, priceCents: 115000, currency: "EUR", attributes: { color: { label: { pt: `Rosa`, en: `Pink` }, hex: ["#e7a3b1"] } }, image: `/products/ligne-2-2/016424.webp`, images: [`/products/ligne-2-2/016424.webp`, `/products/ligne-2-2/016424-2.webp`, `/products/ligne-2-2/016424-3.webp`, `/products/ligne-2-2/016424-4.webp`] },
      { sku: `016296`, name: { pt: `Micro Diamond head lighter — Preto & Prata`, en: `Micro Diamond head lighter — Black & Silver` }, priceCents: 137540, currency: "EUR", attributes: { color: { label: { pt: `Preto & Prata`, en: `Black & Silver` }, hex: ["#15171c", "#c9ccd1"] } }, image: `/products/ligne-2-2/016296.webp`, images: [`/products/ligne-2-2/016296.webp`, `/products/ligne-2-2/016296-2.webp`, `/products/ligne-2-2/016296-3.webp`, `/products/ligne-2-2/016296-4.webp`] },
      { sku: `016284`, name: { pt: `Micro Diamond head lighter — Dourado`, en: `Micro Diamond head lighter — Golden` }, priceCents: 115000, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/ligne-2-2/016284.webp`, images: [`/products/ligne-2-2/016284.webp`, `/products/ligne-2-2/016284-2.webp`, `/products/ligne-2-2/016284-3.webp`, `/products/ligne-2-2/016284-4.webp`] },
      { sku: `C16602`, name: { pt: `Micro Diamond head lighter — Prata`, en: `Micro Diamond head lighter — Silver` }, priceCents: 128340, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/ligne-2-2/C16602.webp`, images: [`/products/ligne-2-2/C16602.webp`, `/products/ligne-2-2/C16602-2.webp`, `/products/ligne-2-2/C16602-3.webp`, `/products/ligne-2-2/C16602-4.webp`] },
      { sku: `C16601`, name: { pt: `Micro Diamond head lighter — Preto`, en: `Micro Diamond head lighter — Black` }, priceCents: 137540, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/ligne-2-2/C16601.webp`, images: [`/products/ligne-2-2/C16601.webp`, `/products/ligne-2-2/C16601-2.webp`, `/products/ligne-2-2/C16601-3.webp`, `/products/ligne-2-2/C16601-4.webp`] },
      { sku: `C16457`, name: { pt: `Micro Diamond head lighter — Azul & Escuro & Azul & Dourado`, en: `Micro Diamond head lighter — Blue & Dark Blue & Golden` }, priceCents: 137540, currency: "EUR", attributes: { color: { label: { pt: `Azul & Escuro & Azul & Dourado`, en: `Blue & Dark Blue & Golden` }, hex: ["#1f3c66", "#2a2d34"] } }, image: `/products/ligne-2-2/C16457.webp`, images: [`/products/ligne-2-2/C16457.webp`, `/products/ligne-2-2/C16457-2.webp`, `/products/ligne-2-2/C16457-3.webp`, `/products/ligne-2-2/C16457-4.webp`] },
      { sku: `C16455`, name: { pt: `Micro Diamond head lighter — Cinza & Prata`, en: `Micro Diamond head lighter — Grey & Silver` }, priceCents: 119140, currency: "EUR", attributes: { color: { label: { pt: `Cinza & Prata`, en: `Grey & Silver` }, hex: ["#7a7d83", "#c9ccd1"] } }, image: `/products/ligne-2-2/C16455.webp`, images: [`/products/ligne-2-2/C16455.webp`, `/products/ligne-2-2/C16455-2.webp`, `/products/ligne-2-2/C16455-3.webp`, `/products/ligne-2-2/C16455-4.webp`] },
      { sku: `016884`, name: { pt: `Micro Diamond head lighter — Preto & Amarelo`, en: `Micro Diamond head lighter — Black & Yellow` }, priceCents: 142600, currency: "EUR", attributes: { color: { label: { pt: `Preto & Amarelo`, en: `Black & Yellow` }, hex: ["#15171c", "#d8b04a"] } }, image: `/products/ligne-2-2/016884.webp`, images: [`/products/ligne-2-2/016884.webp`, `/products/ligne-2-2/016884-2.webp`, `/products/ligne-2-2/016884-3.webp`, `/products/ligne-2-2/016884-4.webp`] },
      { sku: `016184`, name: { pt: `Micro Diamond head lighter — Prata`, en: `Micro Diamond head lighter — Silver` }, priceCents: 119140, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/ligne-2-2/016184.webp`, images: [`/products/ligne-2-2/016184.webp`, `/products/ligne-2-2/016184-2.webp`, `/products/ligne-2-2/016184-3.webp`, `/products/ligne-2-2/016184-4.webp`] },
      { sku: `016134`, name: { pt: `Micro Diamond head lighter — Preto & Azul & Dourado`, en: `Micro Diamond head lighter — Black & Blue & Golden` }, priceCents: 151800, currency: "EUR", attributes: { color: { label: { pt: `Preto & Azul & Dourado`, en: `Black & Blue & Golden` }, hex: ["#15171c", "#1f3c66"] } }, image: `/products/ligne-2-2/016134.webp`, images: [`/products/ligne-2-2/016134.webp`, `/products/ligne-2-2/016134-2.webp`, `/products/ligne-2-2/016134-3.webp`, `/products/ligne-2-2/016134-4.webp`] }
    ],
  },
  {
    slug: `table-lighter`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `Inspired by its archives and the iconic Ligne 2, S.T. Dupont presents an innovative table lighter with a large body and a dual-flame system. A unique piece in the world of luxury. Table lighter in glossy black lacquer, decorated with a diamond-point guilloché cap. Trigger with sliding and pressing mechanism to alternate between a wind-resistant yellow flame and a torch flame. Chrome finish. Associated gas refill: black 000430 Lighter delivered empty, refill sold separately.`, en: `Inspired by its archives and the iconic Ligne 2, S.T. Dupont presents an innovative table lighter with a large body and a dual-flame system. A unique piece in the world of luxury. Table lighter in glossy black lacquer, decorated with a diamond-point guilloché cap. Trigger with sliding and pressing mechanism to alternate between a wind-resistant yellow flame and a torch flame. Chrome finish. Associated gas refill: black 000430 Lighter delivered empty, refill sold separately.` },
    collection: `Table lighter`,
    categorySlug: "isqueiros",
    image: `/products/table-lighter/T20101.webp`,
    variants: [
      { sku: `T20101`, name: { pt: `Lacquered lighter — Prata`, en: `Lacquered lighter — Silver` }, priceCents: 73140, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/table-lighter/T20101.webp`, images: [`/products/table-lighter/T20101.webp`, `/products/table-lighter/T20101-2.webp`, `/products/table-lighter/T20101-3.webp`, `/products/table-lighter/T20101-4.webp`] },
      { sku: `T20100`, name: { pt: `Lacquered lighter — Dourado`, en: `Lacquered lighter — Golden` }, priceCents: 73140, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/table-lighter/T20100.webp`, images: [`/products/table-lighter/T20100.webp`, `/products/table-lighter/T20100-2.webp`, `/products/table-lighter/T20100-3.webp`, `/products/table-lighter/T20100-4.webp`] }
    ],
  },
  {
    slug: `le-grand-dupont-fuente`,
    name: { pt: `lacquered lighter`, en: `lacquered lighter` },
    description: { pt: `Grand Dupont Lighter - Black glossy lacquer decorated with the multicolor X monogram from Fuente and engraved with the Opus X Fuente crest. Guilloché 3D firepoint cap. Yellow gold finish. Dual ignition: yellow or blue flame with “Cling” opening. Flint red (REF 900651). Gas refill red (REF 900435). Delivered empty; refill sold separately. Screwdriver included.`, en: `Grand Dupont Lighter - Black glossy lacquer decorated with the multicolor X monogram from Fuente and engraved with the Opus X Fuente crest. Guilloché 3D firepoint cap. Yellow gold finish. Dual ignition: yellow or blue flame with “Cling” opening. Flint red (REF 900651). Gas refill red (REF 900435). Delivered empty; refill sold separately. Screwdriver included.` },
    collection: `Le Grand Dupont`,
    categorySlug: "isqueiros",
    image: `/products/le-grand-dupont-fuente/C23060CL.webp`,
    variants: [
      { sku: `C23060CL`, name: { pt: `lacquered lighter — Multicolor`, en: `lacquered lighter — Multicolor` }, priceCents: 192740, currency: "EUR", attributes: { color: { label: { pt: `Multicolor`, en: `Multicolor` }, hex: ["#7a7d83"] } }, image: `/products/le-grand-dupont-fuente/C23060CL.webp`, images: [`/products/le-grand-dupont-fuente/C23060CL.webp`, `/products/le-grand-dupont-fuente/C23060CL-2.webp`, `/products/le-grand-dupont-fuente/C23060CL-3.webp`, `/products/le-grand-dupont-fuente/C23060CL-4.webp`] }
    ],
  },
  {
    slug: `ligne-2-fuente`,
    name: { pt: `lacquered lighter`, en: `lacquered lighter` },
    description: { pt: `Line 2 Lighter - Black glossy lacquer decorated with the multicolor X monogram from Fuente and engraved with the Opus X Fuente crest. Guilloché 3D firepoint cap. Yellow gold finish. Dual yellow flame with “Cling” opening. Flint black (REF 900601). Gas refill red (REF 900435). Delivered empty; refill sold separately.`, en: `Line 2 Lighter - Black glossy lacquer decorated with the multicolor X monogram from Fuente and engraved with the Opus X Fuente crest. Guilloché 3D firepoint cap. Yellow gold finish. Dual yellow flame with “Cling” opening. Flint black (REF 900601). Gas refill red (REF 900435). Delivered empty; refill sold separately.` },
    collection: `Ligne 2`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-fuente/C16060CL.webp`,
    variants: [
      { sku: `C16060CL`, name: { pt: `lacquered lighter — Multicolor`, en: `lacquered lighter — Multicolor` }, priceCents: 174340, currency: "EUR", attributes: { color: { label: { pt: `Multicolor`, en: `Multicolor` }, hex: ["#7a7d83"] } }, image: `/products/ligne-2-fuente/C16060CL.webp`, images: [`/products/ligne-2-fuente/C16060CL.webp`, `/products/ligne-2-fuente/C16060CL-2.webp`, `/products/ligne-2-fuente/C16060CL-3.webp`, `/products/ligne-2-fuente/C16060CL-4.webp`] }
    ],
  },
  {
    slug: `twiggy-20000-lieues-sous-les-mers`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `Tribute to the captivating universe of 20,000 leagues under the seas, this limited edition expresses all the know-how of S.T. Dupont. Published in 1870, the novel recounts the journey of three castaways captured by Captain Nemo, this mysterious inventor who travels the seabed aboard the Nautilus, submarine very ahead of the technologies of the time. Portholes, turbines, corals, fins and other tentacles of giant squid inspire this limited edition and its three ranges, all related to different chapters of the book. A story in three stages in which to dive with passion. 'Vanikoro' is named after its pattern 'corals'. In the chapter of the same name, Captain Nemo and his three companions dock on the island of Vanikoro, surrounded by an incredible barrier reef. Twiggy lighter in shiny blue lacquer, with the Vanikoro decoration. Chrome finish. Equipped with a 1 cm blue torch flame, ideal for lighting candles or cigarettes. Associated gas refill: black (REF 900430) Lighter delivered empty of gas, refill sold separately.`, en: `Tribute to the captivating universe of 20,000 leagues under the seas, this limited edition expresses all the know-how of S.T. Dupont. Published in 1870, the novel recounts the journey of three castaways captured by Captain Nemo, this mysterious inventor who travels the seabed aboard the Nautilus, submarine very ahead of the technologies of the time. Portholes, turbines, corals, fins and other tentacles of giant squid inspire this limited edition and its three ranges, all related to different chapters of the book. A story in three stages in which to dive with passion. 'Vanikoro' is named after its pattern 'corals'. In the chapter of the same name, Captain Nemo and his three companions dock on the island of Vanikoro, surrounded by an incredible barrier reef. Twiggy lighter in shiny blue lacquer, with the Vanikoro decoration. Chrome finish. Equipped with a 1 cm blue torch flame, ideal for lighting candles or cigarettes. Associated gas refill: black (REF 900430) Lighter delivered empty of gas, refill sold separately.` },
    collection: `Twiggy`,
    categorySlug: "isqueiros",
    image: `/products/twiggy-20000-lieues-sous-les-mers/030053.webp`,
    variants: [
      { sku: `030053`, name: { pt: `Lacquered lighter — Real & Azul`, en: `Lacquered lighter — Royal Blue` }, priceCents: 41400, currency: "EUR", attributes: { color: { label: { pt: `Real & Azul`, en: `Royal Blue` }, hex: ["#2845a3", "#1f3c66"] } }, image: `/products/twiggy-20000-lieues-sous-les-mers/030053.webp`, images: [`/products/twiggy-20000-lieues-sous-les-mers/030053.webp`, `/products/twiggy-20000-lieues-sous-les-mers/030053-2.webp`, `/products/twiggy-20000-lieues-sous-les-mers/030053-3.webp`, `/products/twiggy-20000-lieues-sous-les-mers/030053-4.webp`] }
    ],
  },
  {
    slug: `slimmy-20000-lieues-sous-les-mers`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `Tribute to the captivating universe of 20,000 leagues under the seas, this limited edition expresses all the know-how of S.T. Dupont. Published in 1870, the novel recounts the journey of three castaways captured by Captain Nemo, this mysterious inventor who travels the seabed aboard the Nautilus, submarine very ahead of the technologies of the time. Portholes, turbines, corals, fins and other tentacles of giant squid inspire this limited edition and its three ranges, all related to different chapters of the book. A story in three stages in which to dive with passion. 'Vanikoro' is named after its pattern 'corals'. In the chapter of the same name, Captain Nemo and his three companions dock on the island of Vanikoro, surrounded by an incredible barrier reef. Slimmy lighter in glossy blue lacquer, with the Vanikoro decoration. Chrome finish. Equipped with a 2 cm blue torch flame, ideal for lighting candles or cigarettes. Associated gas refill: black (REF 900430) Lighter delivered empty of gas, refill sold separately.`, en: `Tribute to the captivating universe of 20,000 leagues under the seas, this limited edition expresses all the know-how of S.T. Dupont. Published in 1870, the novel recounts the journey of three castaways captured by Captain Nemo, this mysterious inventor who travels the seabed aboard the Nautilus, submarine very ahead of the technologies of the time. Portholes, turbines, corals, fins and other tentacles of giant squid inspire this limited edition and its three ranges, all related to different chapters of the book. A story in three stages in which to dive with passion. 'Vanikoro' is named after its pattern 'corals'. In the chapter of the same name, Captain Nemo and his three companions dock on the island of Vanikoro, surrounded by an incredible barrier reef. Slimmy lighter in glossy blue lacquer, with the Vanikoro decoration. Chrome finish. Equipped with a 2 cm blue torch flame, ideal for lighting candles or cigarettes. Associated gas refill: black (REF 900430) Lighter delivered empty of gas, refill sold separately.` },
    collection: `Slimmy`,
    categorySlug: "isqueiros",
    image: `/products/slimmy-20000-lieues-sous-les-mers/028053.webp`,
    variants: [
      { sku: `028053`, name: { pt: `Lacquered lighter — Real & Azul`, en: `Lacquered lighter — Royal Blue` }, priceCents: 41400, currency: "EUR", attributes: { color: { label: { pt: `Real & Azul`, en: `Royal Blue` }, hex: ["#2845a3", "#1f3c66"] } }, image: `/products/slimmy-20000-lieues-sous-les-mers/028053.webp`, images: [`/products/slimmy-20000-lieues-sous-les-mers/028053.webp`, `/products/slimmy-20000-lieues-sous-les-mers/028053-2.webp`, `/products/slimmy-20000-lieues-sous-les-mers/028053-3.webp`, `/products/slimmy-20000-lieues-sous-les-mers/028053-4.webp`] }
    ],
  },
  {
    slug: `ligne-2-20000-lieues-sous-les-mers`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `Tribute to the captivating universe of 20,000 leagues under the seas, this limited edition expresses all the know-how of S.T. Dupont. Published in 1870, the novel recounts the journey of three castaways captured by Captain Nemo, this mysterious inventor who travels the seabed aboard the Nautilus, submarine very ahead of the technologies of the time. Portholes, turbines, corals, fins and other tentacles of giant squid inspire this limited edition and its three ranges, all related to different chapters of the book. A story in three stages in which to dive with passion. For the Premium range of this edition 20,000 leagues under the seas, S.T. Dupont tells two other chapters: «4000 leagues under the Pacific», chapter 18 of the book, and «Gulf Stream», chapter 19 of its second part. In the latter, Jules Verne evokes the Gulf Stream, a natural force shaping the movement of the oceans and those who are there. Fast-moving and perilous, it also allows Captain Nemo to demonstrate his excellence. Lighter Line 2 Cling guilloche under lacquered pattern 'waves'. Covered with S.T. Dupont blue degraded lacquer. Hat with a vague pattern. Palladium finish. Equipped with a double yellow flame and the famous "Cling" at the opening. Associated lighter flint: black (REF 900601) Associated gas refill: red (REF 900435) Lighter delivered empty of gas, refill sold separately.`, en: `Tribute to the captivating universe of 20,000 leagues under the seas, this limited edition expresses all the know-how of S.T. Dupont. Published in 1870, the novel recounts the journey of three castaways captured by Captain Nemo, this mysterious inventor who travels the seabed aboard the Nautilus, submarine very ahead of the technologies of the time. Portholes, turbines, corals, fins and other tentacles of giant squid inspire this limited edition and its three ranges, all related to different chapters of the book. A story in three stages in which to dive with passion. For the Premium range of this edition 20,000 leagues under the seas, S.T. Dupont tells two other chapters: «4000 leagues under the Pacific», chapter 18 of the book, and «Gulf Stream», chapter 19 of its second part. In the latter, Jules Verne evokes the Gulf Stream, a natural force shaping the movement of the oceans and those who are there. Fast-moving and perilous, it also allows Captain Nemo to demonstrate his excellence. Lighter Line 2 Cling guilloche under lacquered pattern 'waves'. Covered with S.T. Dupont blue degraded lacquer. Hat with a vague pattern. Palladium finish. Equipped with a double yellow flame and the famous "Cling" at the opening. Associated lighter flint: black (REF 900601) Associated gas refill: red (REF 900435) Lighter delivered empty of gas, refill sold separately.` },
    collection: `Ligne 2`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-20000-lieues-sous-les-mers/C16051CL-2.webp`,
    variants: [
      { sku: `C16051CL`, name: { pt: `Lacquered lighter — Azul & Gulf & Stream`, en: `Lacquered lighter — Blue Gulf Stream` }, priceCents: 201940, currency: "EUR", attributes: { color: { label: { pt: `Azul & Gulf & Stream`, en: `Blue Gulf Stream` }, hex: ["#1f3c66"] } }, image: `/products/ligne-2-20000-lieues-sous-les-mers/C16051CL-2.webp`, images: [`/products/ligne-2-20000-lieues-sous-les-mers/C16051CL-2.webp`, `/products/ligne-2-20000-lieues-sous-les-mers/C16051CL-3.webp`, `/products/ligne-2-20000-lieues-sous-les-mers/C16051CL-4.webp`] }
    ],
  },
  {
    slug: `windproof`,
    name: { pt: `Brushed lighter`, en: `Brushed lighter` },
    description: { pt: `For the love of challenge and performance, S.T. Dupont develops a multi-purpose lighter designed to adapt efficiently and easily to all winds. A new flame to accompany the adventurers in their challenges and their overtaking. Equipped with a flame resistant to drafts, it guarantees an expert ignition, even under the trade winds. Brushed chrome windproof with black bumpers featuring the iconic diamond point guilloche. Associated gas refill: black 000430 Lighter delivered empty of gas, refill sold separately.`, en: `For the love of challenge and performance, S.T. Dupont develops a multi-purpose lighter designed to adapt efficiently and easily to all winds. A new flame to accompany the adventurers in their challenges and their overtaking. Equipped with a flame resistant to drafts, it guarantees an expert ignition, even under the trade winds. Brushed chrome windproof with black bumpers featuring the iconic diamond point guilloche. Associated gas refill: black 000430 Lighter delivered empty of gas, refill sold separately.` },
    collection: `Windproof`,
    categorySlug: "isqueiros",
    image: `/products/windproof/W21325.webp`,
    variants: [
      { sku: `W21325`, name: { pt: `Brushed lighter — Cobre`, en: `Brushed lighter — Copper` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Cobre`, en: `Copper` }, hex: ["#a7592c"] } }, image: `/products/windproof/W21325.webp`, images: [`/products/windproof/W21325.webp`, `/products/windproof/W21325-2.webp`, `/products/windproof/W21325-3.webp`, `/products/windproof/W21325-4.webp`] },
      { sku: `W21323`, name: { pt: `Brushed lighter — Preto`, en: `Brushed lighter — Black` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/windproof/W21323.webp`, images: [`/products/windproof/W21323.webp`, `/products/windproof/W21323-2.webp`, `/products/windproof/W21323-3.webp`, `/products/windproof/W21323-4.webp`] },
      { sku: `W21324`, name: { pt: `Brushed lighter — Prata`, en: `Brushed lighter — Silver` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/windproof/W21324.webp`, images: [`/products/windproof/W21324.webp`, `/products/windproof/W21324-2.webp`, `/products/windproof/W21324-3.webp`, `/products/windproof/W21324-4.webp`] }
    ],
  },
  {
    slug: `lighter-necklace`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `Lighter necklace glossy black lacquer in iconic guilloché with diamond tip and gold finishes. Removable and adjustable chain in three different lengths 80/85/90cm. Associated Gas Refill: Black 000430 Lighter delivered empty of gas, refill sold separately.`, en: `Lighter necklace glossy black lacquer in iconic guilloché with diamond tip and gold finishes. Removable and adjustable chain in three different lengths 80/85/90cm. Associated Gas Refill: Black 000430 Lighter delivered empty of gas, refill sold separately.` },
    collection: `Colar Isqueiro`,
    categorySlug: "isqueiros",
    image: `/products/lighter-necklace/K27077CH.webp`,
    variants: [
      { sku: `K27077CH`, name: { pt: `Lacquered lighter — Dourado`, en: `Lacquered lighter — Golden` }, priceCents: 45540, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/lighter-necklace/K27077CH.webp`, images: [`/products/lighter-necklace/K27077CH.webp`, `/products/lighter-necklace/K27077CH-2.webp`, `/products/lighter-necklace/K27077CH-3.webp`, `/products/lighter-necklace/K27077CH-4.webp`] },
      { sku: `K27076CH`, name: { pt: `Lacquered lighter — Prata`, en: `Lacquered lighter — Silver` }, priceCents: 45540, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/lighter-necklace/K27076CH.webp`, images: [`/products/lighter-necklace/K27076CH.webp`, `/products/lighter-necklace/K27076CH-2.webp`, `/products/lighter-necklace/K27076CH-3.webp`, `/products/lighter-necklace/K27076CH-4.webp`] },
      { sku: `K27068CH`, name: { pt: `Lacquered lighter — Preto`, en: `Lacquered lighter — Black` }, priceCents: 44620, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/lighter-necklace/K27068CH.webp`, images: [`/products/lighter-necklace/K27068CH.webp`, `/products/lighter-necklace/K27068CH-2.webp`, `/products/lighter-necklace/K27068CH-3.webp`, `/products/lighter-necklace/K27068CH-4.webp`] },
      { sku: `K27067CH`, name: { pt: `Lacquered lighter — Dourado`, en: `Lacquered lighter — Golden` }, priceCents: 44620, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/lighter-necklace/K27067CH.webp`, images: [`/products/lighter-necklace/K27067CH.webp`, `/products/lighter-necklace/K27067CH-2.webp`, `/products/lighter-necklace/K27067CH-3.webp`, `/products/lighter-necklace/K27067CH-4.webp`] },
      { sku: `K27066CH`, name: { pt: `Lacquered lighter — Prata`, en: `Lacquered lighter — Silver` }, priceCents: 44620, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/lighter-necklace/K27066CH.webp`, images: [`/products/lighter-necklace/K27066CH.webp`, `/products/lighter-necklace/K27066CH-2.webp`, `/products/lighter-necklace/K27066CH-3.webp`, `/products/lighter-necklace/K27066CH-4.webp`] }
    ],
  },
  {
    slug: `twiggy-fender`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `For the second time, S.T. Dupont and Fender® are working together to create a rock line that combines the expertise of both companies. The Biggy, Slimmy and Twiggy lighters, as well as the Initial ballpoint pen take up the silhouette of a Stratocaster® on a black lacquer background. Fender® Twiggy lighter. Blue torch flame 1 cm. Adjustable flame. Silver finish. Associated gas refill: black (REF 000430) Lighter delivered empty gas, refill sold separately.`, en: `For the second time, S.T. Dupont and Fender® are working together to create a rock line that combines the expertise of both companies. The Biggy, Slimmy and Twiggy lighters, as well as the Initial ballpoint pen take up the silhouette of a Stratocaster® on a black lacquer background. Fender® Twiggy lighter. Blue torch flame 1 cm. Adjustable flame. Silver finish. Associated gas refill: black (REF 000430) Lighter delivered empty gas, refill sold separately.` },
    collection: `Twiggy`,
    categorySlug: "isqueiros",
    image: `/products/twiggy-fender/030025.webp`,
    variants: [
      { sku: `030025`, name: { pt: `Lacquered lighter — Preto`, en: `Lacquered lighter — Black` }, priceCents: 41400, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/twiggy-fender/030025.webp`, images: [`/products/twiggy-fender/030025.webp`, `/products/twiggy-fender/030025-2.webp`, `/products/twiggy-fender/030025-3.webp`, `/products/twiggy-fender/030025-4.webp`] }
    ],
  },
  {
    slug: `slimmy-fender`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `For the second time, S.T. Dupont and Fender® are working together to create a rock line that combines the expertise of both companies. The Biggy, Slimmy and Twiggy lighters, as well as the Initial ballpoint pen take up the silhouette of a Stratocaster® on a black lacquer background. Slimmy Fender® lighter. Blue torch flame 1 cm. Adjustable flame. Silver finish. Associated gas refill: black (REF 000430) Lighter delivered empty gas, refill sold separately.`, en: `For the second time, S.T. Dupont and Fender® are working together to create a rock line that combines the expertise of both companies. The Biggy, Slimmy and Twiggy lighters, as well as the Initial ballpoint pen take up the silhouette of a Stratocaster® on a black lacquer background. Slimmy Fender® lighter. Blue torch flame 1 cm. Adjustable flame. Silver finish. Associated gas refill: black (REF 000430) Lighter delivered empty gas, refill sold separately.` },
    collection: `Slimmy`,
    categorySlug: "isqueiros",
    image: `/products/slimmy-fender/028025.webp`,
    variants: [
      { sku: `028025`, name: { pt: `Lacquered lighter — Preto`, en: `Lacquered lighter — Black` }, priceCents: 41400, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/slimmy-fender/028025.webp`, images: [`/products/slimmy-fender/028025.webp`, `/products/slimmy-fender/028025-2.webp`, `/products/slimmy-fender/028025-3.webp`, `/products/slimmy-fender/028025-4.webp`] }
    ],
  },
  {
    slug: `biggy-fender`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `For the second time, S.T. Dupont and Fender® are working together to create a rock line that combines the expertise of both companies. The Biggy, Slimmy and Twiggy lighters, as well as the Initial ballpoint pen take up the silhouette of a Stratocaster® on a black lacquer background. Fender® Biggy lighter. Blue torch flame 2 cm. Adjustable flame. Silver finish. Associated gas refill: black (REF 000430) Lighter delivered empty gas, refill sold separately.`, en: `For the second time, S.T. Dupont and Fender® are working together to create a rock line that combines the expertise of both companies. The Biggy, Slimmy and Twiggy lighters, as well as the Initial ballpoint pen take up the silhouette of a Stratocaster® on a black lacquer background. Fender® Biggy lighter. Blue torch flame 2 cm. Adjustable flame. Silver finish. Associated gas refill: black (REF 000430) Lighter delivered empty gas, refill sold separately.` },
    collection: `Biggy`,
    categorySlug: "isqueiros",
    image: `/products/biggy-fender/025025.webp`,
    variants: [
      { sku: `025025`, name: { pt: `Lacquered lighter — Preto`, en: `Lacquered lighter — Black` }, priceCents: 45540, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/biggy-fender/025025.webp`, images: [`/products/biggy-fender/025025.webp`, `/products/biggy-fender/025025-2.webp`, `/products/biggy-fender/025025-3.webp`, `/products/biggy-fender/025025-4.webp`] }
    ],
  },
  {
    slug: `ligne-2-fender`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `Fender®, the most famous guitar brand in Tokyo, is opening a boutique in the vibrant Harajuku area. On this occasion, and for the second time, S.T. Dupont and Fender® collaborate, imagining a rock line inspired by the know-how of both houses, as well as Japan. With his work of the lacquer inspired by kintsugi, but also the return of an ancient know-how with gold powder applied by hand, this collaboration makes its own the creativity of the musical universe. Lighter line 2 Cling with a double soft yellow flame. Decorated with the Fender® pattern in black lacquer, hand-applied Gold dust craftsmanship and gold finishes. With the famous "Cling" at the opening. For each purchase of the Line 2, an exclusive Médiator necklace is offered. Lighter delivered empty gas, refill sold separately. GAME OF THRONES, HOUSE OF THE DRAGON and all related characters and elements © & TM Home Box Office, Inc. (s24)`, en: `Fender®, the most famous guitar brand in Tokyo, is opening a boutique in the vibrant Harajuku area. On this occasion, and for the second time, S.T. Dupont and Fender® collaborate, imagining a rock line inspired by the know-how of both houses, as well as Japan. With his work of the lacquer inspired by kintsugi, but also the return of an ancient know-how with gold powder applied by hand, this collaboration makes its own the creativity of the musical universe. Lighter line 2 Cling with a double soft yellow flame. Decorated with the Fender® pattern in black lacquer, hand-applied Gold dust craftsmanship and gold finishes. With the famous "Cling" at the opening. For each purchase of the Line 2, an exclusive Médiator necklace is offered. Lighter delivered empty gas, refill sold separately. GAME OF THRONES, HOUSE OF THE DRAGON and all related characters and elements © & TM Home Box Office, Inc. (s24)` },
    collection: `Ligne 2`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-fender/C16026CL.webp`,
    variants: [
      { sku: `C16026CL`, name: { pt: `Lacquered lighter — Azul & Fender`, en: `Lacquered lighter — Blue Fender` }, priceCents: 201940, currency: "EUR", attributes: { color: { label: { pt: `Azul & Fender`, en: `Blue Fender` }, hex: ["#1f3c66"] } }, image: `/products/ligne-2-fender/C16026CL.webp`, images: [`/products/ligne-2-fender/C16026CL.webp`, `/products/ligne-2-fender/C16026CL-2.webp`, `/products/ligne-2-fender/C16026CL-3.webp`, `/products/ligne-2-fender/C16026CL-4.webp`] }
    ],
  },
  {
    slug: `le-grand-dupont-monogram-1872`,
    name: { pt: `Guilloche lighter`, en: `Guilloche lighter` },
    description: { pt: `S.T. Dupont's expertise in metalwork, as well as in the art of lacquering and leather-coated canvas, comes together in the Monogramme 1872 collection. Dupont expertise come together in the Monogram 1872 collection. Bien ancrées dans leur époque, les pièces de la collection reprennent toutes le nouveau logo S.T. Dupont, droit, volontaire et fier. Le Grand Dupont lighter, guilloché decorated with the Monogram 1872 motif and finished in yellow gold. Doté d'un système de double allumage flamme jaune ou flamme bleue. Associated lighter stone: black (REF 900601) Associated gas refill: red (REF 900435) Lighter delivered empty of gas, refill sold separately. Translated with DeepL.com (free version)`, en: `S.T. Dupont's expertise in metalwork, as well as in the art of lacquering and leather-coated canvas, comes together in the Monogramme 1872 collection. Dupont expertise come together in the Monogram 1872 collection. Bien ancrées dans leur époque, les pièces de la collection reprennent toutes le nouveau logo S.T. Dupont, droit, volontaire et fier. Le Grand Dupont lighter, guilloché decorated with the Monogram 1872 motif and finished in yellow gold. Doté d'un système de double allumage flamme jaune ou flamme bleue. Associated lighter stone: black (REF 900601) Associated gas refill: red (REF 900435) Lighter delivered empty of gas, refill sold separately. Translated with DeepL.com (free version)` },
    collection: `Le Grand Dupont`,
    categorySlug: "isqueiros",
    image: `/products/le-grand-dupont-monogram-1872/C16655.webp`,
    variants: [
      { sku: `C16655`, name: { pt: `Guilloche lighter — Prata`, en: `Guilloche lighter — Silver` }, priceCents: 155940, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/le-grand-dupont-monogram-1872/C16655.webp`, images: [`/products/le-grand-dupont-monogram-1872/C16655.webp`, `/products/le-grand-dupont-monogram-1872/C16655-2.webp`] },
      { sku: `C23178`, name: { pt: `Guilloche lighter — Dourado`, en: `Guilloche lighter — Golden` }, priceCents: 174340, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/le-grand-dupont-monogram-1872/C23178.webp`, images: [`/products/le-grand-dupont-monogram-1872/C23178.webp`, `/products/le-grand-dupont-monogram-1872/C23178-2.webp`, `/products/le-grand-dupont-monogram-1872/C23178-3.webp`, `/products/le-grand-dupont-monogram-1872/C23178-4.webp`] },
      { sku: `C23180`, name: { pt: `Guilloche lighter — Prata`, en: `Guilloche lighter — Silver` }, priceCents: 174340, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/le-grand-dupont-monogram-1872/C23180.webp`, images: [`/products/le-grand-dupont-monogram-1872/C23180.webp`, `/products/le-grand-dupont-monogram-1872/C23180-2.webp`, `/products/le-grand-dupont-monogram-1872/C23180-3.webp`, `/products/le-grand-dupont-monogram-1872/C23180-4.webp`] },
      { sku: `C23179`, name: { pt: `Guilloche lighter — Preto`, en: `Guilloche lighter — Black` }, priceCents: 174340, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/le-grand-dupont-monogram-1872/C23179.webp`, images: [`/products/le-grand-dupont-monogram-1872/C23179.webp`, `/products/le-grand-dupont-monogram-1872/C23179-2.webp`, `/products/le-grand-dupont-monogram-1872/C23179-3.webp`, `/products/le-grand-dupont-monogram-1872/C23179-4.webp`] }
    ],
  },
  {
    slug: `slimmy-2`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `Inspired by the House archives, Slimmy echoes the iconic Line 2 and the iconic Slim 7, the world's thinnest luxury lighter. Carefully designed in coral lacquer with gold finishes. The lightness (66g) and thinness (9mm) of this lighter provide a perfect grip and allow it to be easily slipped into any pocket or bag. Its torch flame guarantees a unique experience providing efficient ignition in any circumstance. Timeless and featuring the know-how of lacquer and guilloche, Slimmy is available in chrome, gold and lacquer versions (sky blue, coral, dark blue, black, white). Gas refill associated: black (REF 000430)`, en: `Inspired by the House archives, Slimmy echoes the iconic Line 2 and the iconic Slim 7, the world's thinnest luxury lighter. Carefully designed in coral lacquer with gold finishes. The lightness (66g) and thinness (9mm) of this lighter provide a perfect grip and allow it to be easily slipped into any pocket or bag. Its torch flame guarantees a unique experience providing efficient ignition in any circumstance. Timeless and featuring the know-how of lacquer and guilloche, Slimmy is available in chrome, gold and lacquer versions (sky blue, coral, dark blue, black, white). Gas refill associated: black (REF 000430)` },
    collection: `Slimmy`,
    categorySlug: "isqueiros",
    image: `/products/slimmy-2/028030.webp`,
    variants: [
      { sku: `028030`, name: { pt: `Lacquered lighter — Bordeaux`, en: `Lacquered lighter — Burgundy` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Bordeaux`, en: `Burgundy` }, hex: ["#5e1f1f"] } }, image: `/products/slimmy-2/028030.webp`, images: [`/products/slimmy-2/028030.webp`, `/products/slimmy-2/028030-2.webp`, `/products/slimmy-2/028030-3.webp`, `/products/slimmy-2/028030-4.webp`] },
      { sku: `028120`, name: { pt: `Lacquered lighter — Prata`, en: `Lacquered lighter — Silver` }, priceCents: 39100, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/slimmy-2/028120.webp`, images: [`/products/slimmy-2/028120.webp`, `/products/slimmy-2/028120-2.webp`, `/products/slimmy-2/028120-3.webp`, `/products/slimmy-2/028120-4.webp`] },
      { sku: `028119`, name: { pt: `Lacquered lighter — Dourado`, en: `Lacquered lighter — Golden` }, priceCents: 39100, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/slimmy-2/028119.webp`, images: [`/products/slimmy-2/028119.webp`, `/products/slimmy-2/028119-2.webp`, `/products/slimmy-2/028119-3.webp`, `/products/slimmy-2/028119-4.webp`] },
      { sku: `028006`, name: { pt: `Lacquered lighter — Coral & Rosa`, en: `Lacquered lighter — Coral & Pink` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Coral & Rosa`, en: `Coral & Pink` }, hex: ["#e2675a", "#e7a3b1"] } }, image: `/products/slimmy-2/028006.webp`, images: [`/products/slimmy-2/028006.webp`, `/products/slimmy-2/028006-2.webp`, `/products/slimmy-2/028006-3.webp`, `/products/slimmy-2/028006-4.webp`] },
      { sku: `028225`, name: { pt: `Lacquered lighter — Azul & Índigo & Azul`, en: `Lacquered lighter — Blue & Indigo Blue` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Azul & Índigo & Azul`, en: `Blue & Indigo Blue` }, hex: ["#1f3c66", "#2c2c63"] } }, image: `/products/slimmy-2/028225.webp`, images: [`/products/slimmy-2/028225.webp`, `/products/slimmy-2/028225-2.webp`, `/products/slimmy-2/028225-3.webp`, `/products/slimmy-2/028225-4.webp`] },
      { sku: `028224`, name: { pt: `Lacquered lighter — Branco`, en: `Lacquered lighter — White` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Branco`, en: `White` }, hex: ["#f3efe6"] } }, image: `/products/slimmy-2/028224.webp`, images: [`/products/slimmy-2/028224.webp`, `/products/slimmy-2/028224-2.webp`, `/products/slimmy-2/028224-3.webp`, `/products/slimmy-2/028224-4.webp`] },
      { sku: `028222`, name: { pt: `Lacquered lighter — Preto`, en: `Lacquered lighter — Black` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/slimmy-2/028222.webp`, images: [`/products/slimmy-2/028222.webp`, `/products/slimmy-2/028222-2.webp`, `/products/slimmy-2/028222-3.webp`, `/products/slimmy-2/028222-4.webp`] },
      { sku: `028221`, name: { pt: `Lacquered lighter — Preto & Prata`, en: `Lacquered lighter — Black & Silver` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Preto & Prata`, en: `Black & Silver` }, hex: ["#15171c", "#c9ccd1"] } }, image: `/products/slimmy-2/028221.webp`, images: [`/products/slimmy-2/028221.webp`, `/products/slimmy-2/028221-2.webp`, `/products/slimmy-2/028221-3.webp`, `/products/slimmy-2/028221-4.webp`] }
    ],
  },
  {
    slug: `ligne-2-camo`,
    name: { pt: `Guilloche under lacquer lighter`, en: `Guilloche under lacquer lighter` },
    description: { pt: `This year, S.T. This year, S.T. Dupont reintroduces the camouflage motif on its iconic products, with a fresh, bold interpretation of the legendary design, featuring flames in vibrant shades of red and green. Ligne 2 Cling lighter guilloche under lacquer with green Camouflage motif, palladium finish Featuring a double yellow flame and the famous “Cling” when opened. Matching lighter stone: black (REF 900601) Associated gas refill: red (REF 900435) Lighter delivered empty of gas, refill sold separately.`, en: `This year, S.T. This year, S.T. Dupont reintroduces the camouflage motif on its iconic products, with a fresh, bold interpretation of the legendary design, featuring flames in vibrant shades of red and green. Ligne 2 Cling lighter guilloche under lacquer with green Camouflage motif, palladium finish Featuring a double yellow flame and the famous “Cling” when opened. Matching lighter stone: black (REF 900601) Associated gas refill: red (REF 900435) Lighter delivered empty of gas, refill sold separately.` },
    collection: `Ligne 2`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-camo/C16050.webp`,
    variants: [
      { sku: `C16050`, name: { pt: `Guilloche under lacquer lighter — Caqui`, en: `Guilloche under lacquer lighter — Khaki` }, priceCents: 142600, currency: "EUR", attributes: { color: { label: { pt: `Caqui`, en: `Khaki` }, hex: ["#7a7a4b"] } }, image: `/products/ligne-2-camo/C16050.webp`, images: [`/products/ligne-2-camo/C16050.webp`, `/products/ligne-2-camo/C16050-2.webp`, `/products/ligne-2-camo/C16050-3.webp`, `/products/ligne-2-camo/C16050-4.webp`] }
    ],
  },
  {
    slug: `maxijet-snake-skin`,
    name: { pt: `Lighter Matt`, en: `Lighter Matt` },
    description: { pt: `This year, S.T. This year, S.T. Dupont reintroduces the camouflage pattern on its iconic products, with flames in vibrant shades of red and green, creating a fresh, bold interpretation of this legendary design. Maxijet lighter, red Camouflage motif and chrome attributes Featuring a blue torch flame Associated gas refill: black (REF 900430) Lighter delivered empty of gas, refill sold separately`, en: `This year, S.T. This year, S.T. Dupont reintroduces the camouflage pattern on its iconic products, with flames in vibrant shades of red and green, creating a fresh, bold interpretation of this legendary design. Maxijet lighter, red Camouflage motif and chrome attributes Featuring a blue torch flame Associated gas refill: black (REF 900430) Lighter delivered empty of gas, refill sold separately` },
    collection: `Maxijet`,
    categorySlug: "isqueiros",
    image: `/products/maxijet-snake-skin/020151.webp`,
    variants: [
      { sku: `020151`, name: { pt: `Lighter Matt — Vermelho`, en: `Lighter Matt — Red` }, priceCents: 29900, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/maxijet-snake-skin/020151.webp`, images: [`/products/maxijet-snake-skin/020151.webp`, `/products/maxijet-snake-skin/020151-2.webp`, `/products/maxijet-snake-skin/020151-3.webp`, `/products/maxijet-snake-skin/020151-4.webp`] }
    ],
  },
  {
    slug: `biggy-monogram-1872`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `Craftsmanship in metal, as well as the art of lacquer and coated leather, showcase the expertise of S.T. Dupont in the Monogram 1872 collection. Well-rooted in their time, the pieces in the collection all feature the new S.T. Dupont logo—upright, determined, and proud. Biggy lighter decorated with the Monogram 1872 pattern in burgundy and gold finishes. Equipped with a 2cm torch flame. Lighter delivered empty of gas, refill sold separately.`, en: `Craftsmanship in metal, as well as the art of lacquer and coated leather, showcase the expertise of S.T. Dupont in the Monogram 1872 collection. Well-rooted in their time, the pieces in the collection all feature the new S.T. Dupont logo—upright, determined, and proud. Biggy lighter decorated with the Monogram 1872 pattern in burgundy and gold finishes. Equipped with a 2cm torch flame. Lighter delivered empty of gas, refill sold separately.` },
    collection: `Biggy`,
    categorySlug: "isqueiros",
    image: `/products/biggy-monogram-1872/025080.webp`,
    variants: [
      { sku: `025080`, name: { pt: `Lacquered lighter — Cinza`, en: `Lacquered lighter — Grey` }, priceCents: 48300, currency: "EUR", attributes: { color: { label: { pt: `Cinza`, en: `Grey` }, hex: ["#7a7d83"] } }, image: `/products/biggy-monogram-1872/025080.webp`, images: [`/products/biggy-monogram-1872/025080.webp`, `/products/biggy-monogram-1872/025080-2.webp`, `/products/biggy-monogram-1872/025080-3.webp`, `/products/biggy-monogram-1872/025080-4.webp`] },
      { sku: `025079`, name: { pt: `Lacquered lighter — Preto`, en: `Lacquered lighter — Black` }, priceCents: 48300, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/biggy-monogram-1872/025079.webp`, images: [`/products/biggy-monogram-1872/025079.webp`, `/products/biggy-monogram-1872/025079-2.webp`, `/products/biggy-monogram-1872/025079-3.webp`, `/products/biggy-monogram-1872/025079-4.webp`] },
      { sku: `025078B`, name: { pt: `Lacquered lighter — Bordeaux`, en: `Lacquered lighter — Burgundy` }, priceCents: 48300, currency: "EUR", attributes: { color: { label: { pt: `Bordeaux`, en: `Burgundy` }, hex: ["#5e1f1f"] } }, image: `/products/biggy-monogram-1872/025078B.webp`, images: [`/products/biggy-monogram-1872/025078B.webp`, `/products/biggy-monogram-1872/025078B-2.webp`, `/products/biggy-monogram-1872/025078B-3.webp`, `/products/biggy-monogram-1872/025078B-4.webp`] }
    ],
  },
  {
    slug: `ligne-2-monogram-1872`,
    name: { pt: `Guilloche Lighter`, en: `Guilloche Lighter` },
    description: { pt: `Craftsmanship in metal, as well as the art of lacquer and coated leather, showcase the expertise of S.T. Dupont in the Monogram 1872 collection. Well-rooted in their time, the pieces in the collection all feature the new S.T. Dupont logo—upright, determined, and proud. Ligne 2 Cling lighter, guilloche craftsmanship, Monogram 1872, with satin black and yellow gold finishes. Equipped with a double yellow flame and the famous "Cling" sound upon opening. Lighter delivered empty of gas, refill sold separately.`, en: `Craftsmanship in metal, as well as the art of lacquer and coated leather, showcase the expertise of S.T. Dupont in the Monogram 1872 collection. Well-rooted in their time, the pieces in the collection all feature the new S.T. Dupont logo—upright, determined, and proud. Ligne 2 Cling lighter, guilloche craftsmanship, Monogram 1872, with satin black and yellow gold finishes. Equipped with a double yellow flame and the famous "Cling" sound upon opening. Lighter delivered empty of gas, refill sold separately.` },
    collection: `Ligne 2`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-monogram-1872/C16180.webp`,
    variants: [
      { sku: `C16180`, name: { pt: `Guilloche Lighter — Prata`, en: `Guilloche Lighter — Silver` }, priceCents: 133400, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/ligne-2-monogram-1872/C16180.webp`, images: [`/products/ligne-2-monogram-1872/C16180.webp`, `/products/ligne-2-monogram-1872/C16180-2.webp`, `/products/ligne-2-monogram-1872/C16180-3.webp`, `/products/ligne-2-monogram-1872/C16180-4.webp`] },
      { sku: `C16179`, name: { pt: `Guilloche Lighter — Preto`, en: `Guilloche Lighter — Black` }, priceCents: 133400, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/ligne-2-monogram-1872/C16179.webp`, images: [`/products/ligne-2-monogram-1872/C16179.webp`, `/products/ligne-2-monogram-1872/C16179-2.webp`, `/products/ligne-2-monogram-1872/C16179-3.webp`, `/products/ligne-2-monogram-1872/C16179-4.webp`] },
      { sku: `C16178`, name: { pt: `Guilloche Lighter — Dourado`, en: `Guilloche Lighter — Golden` }, priceCents: 133400, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/ligne-2-monogram-1872/C16178.webp`, images: [`/products/ligne-2-monogram-1872/C16178.webp`, `/products/ligne-2-monogram-1872/C16178-2.webp`, `/products/ligne-2-monogram-1872/C16178-3.webp`, `/products/ligne-2-monogram-1872/C16178-4.webp`] }
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
    name: { pt: `Lacquered Lighter`, en: `Lacquered Lighter` },
    description: { pt: `On the occasion of the 60th anniversary of the Padrón house, S.T. Dupont announces a special collaboration. The S.T. Dupont x Padrón collection offers distinctive lighters and cigar accessories. Its yellow gold finishes embody the Padrón cigar band, and its brown lacquer refers to the color of their wrapper leaf, the tobacco leaf that wraps a cigar blend. Grand Dupont lighter, with matte brown lacquer and gold finishes. Engraving of the island of Cuba and the initials 'JOP' of the founder of the Cuban brand. Features a dual ignition system with yellow or blue flame. The lighter is delivered empty of gas; refill sold separately. Screwdriver included for changing the flint.`, en: `On the occasion of the 60th anniversary of the Padrón house, S.T. Dupont announces a special collaboration. The S.T. Dupont x Padrón collection offers distinctive lighters and cigar accessories. Its yellow gold finishes embody the Padrón cigar band, and its brown lacquer refers to the color of their wrapper leaf, the tobacco leaf that wraps a cigar blend. Grand Dupont lighter, with matte brown lacquer and gold finishes. Engraving of the island of Cuba and the initials 'JOP' of the founder of the Cuban brand. Features a dual ignition system with yellow or blue flame. The lighter is delivered empty of gas; refill sold separately. Screwdriver included for changing the flint.` },
    collection: `Le Grand Dupont`,
    categorySlug: "isqueiros",
    image: `/products/le-grand-dupont-padron/C23014.webp`,
    variants: [
      { sku: `C23014`, name: { pt: `Lacquered Lighter — Castanho`, en: `Lacquered Lighter — Brown` }, priceCents: 183540, currency: "EUR", attributes: { color: { label: { pt: `Castanho`, en: `Brown` }, hex: ["#6b4a2a"] } }, image: `/products/le-grand-dupont-padron/C23014.webp`, images: [`/products/le-grand-dupont-padron/C23014.webp`, `/products/le-grand-dupont-padron/C23014-2.webp`, `/products/le-grand-dupont-padron/C23014-3.webp`, `/products/le-grand-dupont-padron/C23014-4.webp`] }
    ],
  },
  {
    slug: `ligne-2-padron`,
    name: { pt: `Lacquered Lighter`, en: `Lacquered Lighter` },
    description: { pt: `On the occasion of the 60th anniversary of the Padrón house, S.T. Dupont announces a special collaboration. The S.T. Dupont x Padrón collection offers distinctive lighters and cigar accessories. Its yellow gold finishes embody the Padrón cigar band, and its brown lacquer refers to the color of their wrapper leaf, the tobacco leaf that wraps a cigar blend. Ligne 2 Cling lighter with matte brown lacquer and gold finishes. Engraving of the island of Cuba and the initials 'JOP' of the founder of the Cuban brand. Features a dual yellow flame and the famous 'Cling' sound upon opening. The lighter is delivered empty of gas; refill sold separately.`, en: `On the occasion of the 60th anniversary of the Padrón house, S.T. Dupont announces a special collaboration. The S.T. Dupont x Padrón collection offers distinctive lighters and cigar accessories. Its yellow gold finishes embody the Padrón cigar band, and its brown lacquer refers to the color of their wrapper leaf, the tobacco leaf that wraps a cigar blend. Ligne 2 Cling lighter with matte brown lacquer and gold finishes. Engraving of the island of Cuba and the initials 'JOP' of the founder of the Cuban brand. Features a dual yellow flame and the famous 'Cling' sound upon opening. The lighter is delivered empty of gas; refill sold separately.` },
    collection: `Ligne 2`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-padron/C16014.webp`,
    variants: [
      { sku: `C16014`, name: { pt: `Lacquered Lighter — Castanho`, en: `Lacquered Lighter — Brown` }, priceCents: 174340, currency: "EUR", attributes: { color: { label: { pt: `Castanho`, en: `Brown` }, hex: ["#6b4a2a"] } }, image: `/products/ligne-2-padron/C16014.webp`, images: [`/products/ligne-2-padron/C16014.webp`, `/products/ligne-2-padron/C16014-2.webp`, `/products/ligne-2-padron/C16014-3.webp`, `/products/ligne-2-padron/C16014-4.webp`] }
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
    name: { pt: `Matt Lighter`, en: `Matt Lighter` },
    description: { pt: `MaxiJet Lighter with a matte black finish and a red trigger, the perfect companion for cigar smokers thanks to its very powerful torch flame. Associated gas refill: black (REF 900430). Lighter delivered empty of gas, refill sold separately.`, en: `MaxiJet Lighter with a matte black finish and a red trigger, the perfect companion for cigar smokers thanks to its very powerful torch flame. Associated gas refill: black (REF 900430). Lighter delivered empty of gas, refill sold separately.` },
    collection: `Maxijet`,
    categorySlug: "isqueiros",
    image: `/products/maxijet/020171.webp`,
    variants: [
      { sku: `020171`, name: { pt: `Matt Lighter — Néon & Azul`, en: `Matt Lighter — Neon Blue` }, priceCents: 28980, currency: "EUR", attributes: { color: { label: { pt: `Néon & Azul`, en: `Neon Blue` }, hex: ["#aef043", "#1f3c66"] } }, image: `/products/maxijet/020171.webp`, images: [`/products/maxijet/020171.webp`, `/products/maxijet/020171-2.webp`, `/products/maxijet/020171-3.webp`, `/products/maxijet/020171-4.webp`] },
      { sku: `020169`, name: { pt: `Matt Lighter — Néon & Laranja`, en: `Matt Lighter — Neon Orange` }, priceCents: 28980, currency: "EUR", attributes: { color: { label: { pt: `Néon & Laranja`, en: `Neon Orange` }, hex: ["#aef043", "#c4642d"] } }, image: `/products/maxijet/020169.webp`, images: [`/products/maxijet/020169.webp`, `/products/maxijet/020169-2.webp`, `/products/maxijet/020169-3.webp`, `/products/maxijet/020169-4.webp`] },
      { sku: `020023`, name: { pt: `Matt Lighter — Prata`, en: `Matt Lighter — Silver` }, priceCents: 28980, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/maxijet/020023.webp`, images: [`/products/maxijet/020023.webp`] },
      { sku: `020162`, name: { pt: `Matt Lighter — Rosa`, en: `Matt Lighter — Pink` }, priceCents: 28980, currency: "EUR", attributes: { color: { label: { pt: `Rosa`, en: `Pink` }, hex: ["#e7a3b1"] } }, image: `/products/maxijet/020162.webp`, images: [`/products/maxijet/020162.webp`, `/products/maxijet/020162-2.webp`, `/products/maxijet/020162-3.webp`, `/products/maxijet/020162-4.webp`] },
      { sku: `020161`, name: { pt: `Matt Lighter — Azul`, en: `Matt Lighter — Blue` }, priceCents: 27140, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/maxijet/020161.webp`, images: [`/products/maxijet/020161.webp`, `/products/maxijet/020161-2.webp`, `/products/maxijet/020161-3.webp`, `/products/maxijet/020161-4.webp`] },
      { sku: `020160N`, name: { pt: `Matt Lighter — Preto & Vermelho`, en: `Matt Lighter — Black & Red` }, priceCents: 28980, currency: "EUR", attributes: { color: { label: { pt: `Preto & Vermelho`, en: `Black & Red` }, hex: ["#15171c", "#7d2b27"] } }, image: `/products/maxijet/020160N.webp`, images: [`/products/maxijet/020160N.webp`, `/products/maxijet/020160N-2.webp`, `/products/maxijet/020160N-3.webp`, `/products/maxijet/020160N-4.webp`] },
      { sku: `020157N`, name: { pt: `Matt Lighter — Prata`, en: `Matt Lighter — Silver` }, priceCents: 28980, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/maxijet/020157N.webp`, images: [`/products/maxijet/020157N.webp`, `/products/maxijet/020157N-2.webp`, `/products/maxijet/020157N-3.webp`, `/products/maxijet/020157N-4.webp`] }
    ],
  },
  {
    slug: `minijet`,
    name: { pt: `Matt lighter`, en: `Matt lighter` },
    description: { pt: `The Minijet is a compact, modern lighter that's perfect for everyday use. With its powerful blue torch flame and ergonomic grip, it offers style and practicality at all times.`, en: `The Minijet is a compact, modern lighter that's perfect for everyday use. With its powerful blue torch flame and ergonomic grip, it offers style and practicality at all times.` },
    collection: `Minijet`,
    categorySlug: "isqueiros",
    image: `/products/minijet/010872.webp`,
    variants: [
      { sku: `010872`, name: { pt: `Matt lighter — Néon & Verde`, en: `Matt lighter — Neon Green` }, priceCents: 19320, currency: "EUR", attributes: { color: { label: { pt: `Néon & Verde`, en: `Neon Green` }, hex: ["#aef043", "#3a5040"] } }, image: `/products/minijet/010872.webp`, images: [`/products/minijet/010872.webp`, `/products/minijet/010872-2.webp`, `/products/minijet/010872-3.webp`, `/products/minijet/010872-4.webp`] },
      { sku: `010888`, name: { pt: `Matt lighter — Cinza & Gun Metal & Prata`, en: `Matt lighter — Grey & Gunmetal & Silver` }, priceCents: 19320, currency: "EUR", attributes: { color: { label: { pt: `Cinza & Gun Metal & Prata`, en: `Grey & Gunmetal & Silver` }, hex: ["#7a7d83", "#4b4f55"] } }, image: `/products/minijet/010888.webp`, images: [`/products/minijet/010888.webp`, `/products/minijet/010888-2.webp`, `/products/minijet/010888-3.webp`, `/products/minijet/010888-4.webp`] },
      { sku: `010887`, name: { pt: `Matt lighter — Prata`, en: `Matt lighter — Silver` }, priceCents: 19320, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/minijet/010887.webp`, images: [`/products/minijet/010887.webp`, `/products/minijet/010887-2.webp`, `/products/minijet/010887-3.webp`, `/products/minijet/010887-4.webp`] },
      { sku: `010815`, name: { pt: `Matt lighter — Preto`, en: `Matt lighter — Black` }, priceCents: 19320, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/minijet/010815.webp`, images: [`/products/minijet/010815.webp`, `/products/minijet/010815-2.webp`, `/products/minijet/010815-3.webp`, `/products/minijet/010815-4.webp`] },
      { sku: `010885`, name: { pt: `Matt lighter — Preto`, en: `Matt lighter — Black` }, priceCents: 19320, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/minijet/010885.webp`, images: [`/products/minijet/010885.webp`, `/products/minijet/010885-2.webp`, `/products/minijet/010885-3.webp`, `/products/minijet/010885-4.webp`] }
    ],
  },
  {
    slug: `biggy-fire-x`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `Inspired by the X-Bag, one of the bags from the leather goods collection developed this season by S.T. Dupont, Fire X offers its reinterpretation of the iconic flame tip on the classics of the House. Biggy Fire X lighter decorated with black lacquer and chrome finishes. Featuring a 2cm torch flame. Associated gas refill: black (REF 900430) Lighter delivered empty of gas, refill sold separately.`, en: `Inspired by the X-Bag, one of the bags from the leather goods collection developed this season by S.T. Dupont, Fire X offers its reinterpretation of the iconic flame tip on the classics of the House. Biggy Fire X lighter decorated with black lacquer and chrome finishes. Featuring a 2cm torch flame. Associated gas refill: black (REF 900430) Lighter delivered empty of gas, refill sold separately.` },
    collection: `Biggy`,
    categorySlug: "isqueiros",
    image: `/products/biggy-fire-x/025070.webp`,
    variants: [
      { sku: `025070`, name: { pt: `Lacquered lighter — Preto`, en: `Lacquered lighter — Black` }, priceCents: 48300, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/biggy-fire-x/025070.webp`, images: [`/products/biggy-fire-x/025070.webp`, `/products/biggy-fire-x/025070-2.webp`, `/products/biggy-fire-x/025070-3.webp`, `/products/biggy-fire-x/025070-4.webp`] }
    ],
  },
  {
    slug: `ligne-2-fire-x`,
    name: { pt: `Lighter Small`, en: `Lighter Small` },
    description: { pt: `Inspired by the X-Bag, one of the bags from the leather goods collection developed this season by S.T. Dupont, Fire X offers its reinterpretation of the iconic flame tip on the classics of the House. Ligne 2 Fire X small model lighter in 3D with a satin-finished black metal body, as well as the back engraved with the Fire X motif. Featuring a double yellow flame. Associated lighter flint: black (REF 900601) Associated gas refill: red (REF 900435) Lighter delivered empty of gas, refill sold separately.`, en: `Inspired by the X-Bag, one of the bags from the leather goods collection developed this season by S.T. Dupont, Fire X offers its reinterpretation of the iconic flame tip on the classics of the House. Ligne 2 Fire X small model lighter in 3D with a satin-finished black metal body, as well as the back engraved with the Fire X motif. Featuring a double yellow flame. Associated lighter flint: black (REF 900601) Associated gas refill: red (REF 900435) Lighter delivered empty of gas, refill sold separately.` },
    collection: `Ligne 2`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-fire-x/C18610.webp`,
    variants: [
      { sku: `C18610`, name: { pt: `Lighter Small — Prata`, en: `Lighter Small — Silver` }, priceCents: 128340, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/ligne-2-fire-x/C18610.webp`, images: [`/products/ligne-2-fire-x/C18610.webp`, `/products/ligne-2-fire-x/C18610-2.webp`, `/products/ligne-2-fire-x/C18610-3.webp`, `/products/ligne-2-fire-x/C18610-4.webp`] },
      { sku: `C18611`, name: { pt: `Lighter Small — Dourado`, en: `Lighter Small — Golden` }, priceCents: 128340, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/ligne-2-fire-x/C18611.webp`, images: [`/products/ligne-2-fire-x/C18611.webp`, `/products/ligne-2-fire-x/C18611-2.webp`, `/products/ligne-2-fire-x/C18611-3.webp`, `/products/ligne-2-fire-x/C18611-4.webp`] },
      { sku: `C18612`, name: { pt: `Lighter Small — Preto`, en: `Lighter Small — Black` }, priceCents: 128340, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/ligne-2-fire-x/C18612.webp`, images: [`/products/ligne-2-fire-x/C18612.webp`, `/products/ligne-2-fire-x/C18612-2.webp`, `/products/ligne-2-fire-x/C18612-3.webp`, `/products/ligne-2-fire-x/C18612-4.webp`] }
    ],
  },
  {
    slug: `maxijet-dragon`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `The iconic Maxijet is adorned with a black glossy lacquer and chrome finish, featuring the S.T. Dupont dragon. Associated refills: Black (REF 000430)`, en: `The iconic Maxijet is adorned with a black glossy lacquer and chrome finish, featuring the S.T. Dupont dragon. Associated refills: Black (REF 000430)` },
    collection: `Maxijet`,
    categorySlug: "isqueiros",
    image: `/products/maxijet-dragon/020177.webp`,
    variants: [
      { sku: `020177`, name: { pt: `Lacquered lighter — Preto`, en: `Lacquered lighter — Black` }, priceCents: 28980, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/maxijet-dragon/020177.webp`, images: [`/products/maxijet-dragon/020177.webp`, `/products/maxijet-dragon/020177-2.webp`, `/products/maxijet-dragon/020177-3.webp`, `/products/maxijet-dragon/020177-4.webp`] },
      { sku: `020175`, name: { pt: `Lacquered lighter — Dourado & Mel & Vermelho`, en: `Lacquered lighter — Golden & Honey & Red` }, priceCents: 28980, currency: "EUR", attributes: { color: { label: { pt: `Dourado & Mel & Vermelho`, en: `Golden & Honey & Red` }, hex: ["#c8a24a", "#c89b4a"] } }, image: `/products/maxijet-dragon/020175.webp`, images: [`/products/maxijet-dragon/020175.webp`, `/products/maxijet-dragon/020175-2.webp`, `/products/maxijet-dragon/020175-3.webp`, `/products/maxijet-dragon/020175-4.webp`] }
    ],
  },
  {
    slug: `slim-7-dragon`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `S.T. Dupont's iconic dragon is featured on this sleek black and chrome Slim 7 lighter. Associated Refills: Black (REF 000430)`, en: `S.T. Dupont's iconic dragon is featured on this sleek black and chrome Slim 7 lighter. Associated Refills: Black (REF 000430)` },
    collection: `Slim 7`,
    categorySlug: "isqueiros",
    image: `/products/slim-7-dragon/027777.webp`,
    variants: [
      { sku: `027777`, name: { pt: `Lacquered lighter — Preto`, en: `Lacquered lighter — Black` }, priceCents: 27140, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/slim-7-dragon/027777.webp`, images: [`/products/slim-7-dragon/027777.webp`, `/products/slim-7-dragon/027777-2.webp`] }
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
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `The Twiggy Lighter in sky blue lacquer and chrome finish is sleek and long-shaped. Its lacquer finish emphasizes its silhouette and embodies the spirit of the 60s. With its 1 cm torch flame, it is perfect for lighting candles or cigarettes, making it a must-have for smokers and non-smokers alike. Just like Slimmy, this model comes in five delicate colors: sky blue, coral, dark blue, black and white. Associated gas refill: black (REF 000430)`, en: `The Twiggy Lighter in sky blue lacquer and chrome finish is sleek and long-shaped. Its lacquer finish emphasizes its silhouette and embodies the spirit of the 60s. With its 1 cm torch flame, it is perfect for lighting candles or cigarettes, making it a must-have for smokers and non-smokers alike. Just like Slimmy, this model comes in five delicate colors: sky blue, coral, dark blue, black and white. Associated gas refill: black (REF 000430)` },
    collection: `Twiggy`,
    categorySlug: "isqueiros",
    image: `/products/twiggy-2/030011.webp`,
    variants: [
      { sku: `030011`, name: { pt: `Lacquered lighter — Coral & Rosa`, en: `Lacquered lighter — Coral & Pink` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Coral & Rosa`, en: `Coral & Pink` }, hex: ["#e2675a", "#e7a3b1"] } }, image: `/products/twiggy-2/030011.webp`, images: [`/products/twiggy-2/030011.webp`, `/products/twiggy-2/030011-2.webp`, `/products/twiggy-2/030011-3.webp`, `/products/twiggy-2/030011-4.webp`] },
      { sku: `030007`, name: { pt: `Lacquered lighter — Azul & Turquesa & Azul`, en: `Lacquered lighter — Blue & Turquoise Blue` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Azul & Turquesa & Azul`, en: `Blue & Turquoise Blue` }, hex: ["#1f3c66", "#3aaba6"] } }, image: `/products/twiggy-2/030007.webp`, images: [`/products/twiggy-2/030007.webp`, `/products/twiggy-2/030007-2.webp`, `/products/twiggy-2/030007-3.webp`, `/products/twiggy-2/030007-4.webp`] },
      { sku: `030005`, name: { pt: `Lacquered lighter — Azul & Índigo & Azul`, en: `Lacquered lighter — Blue & Indigo Blue` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Azul & Índigo & Azul`, en: `Blue & Indigo Blue` }, hex: ["#1f3c66", "#2c2c63"] } }, image: `/products/twiggy-2/030005.webp`, images: [`/products/twiggy-2/030005.webp`, `/products/twiggy-2/030005-2.webp`, `/products/twiggy-2/030005-3.webp`, `/products/twiggy-2/030005-4.webp`] }
    ],
  },
  {
    slug: `biggy-2`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `Connected to the heritage of the House, combining the elegance of Line 2 with the power of the Megajet, Biggy will delight cigar lovers looking for performance and luxurious design. Carefully designed in glossy black lacquer. Equipped with a powerful 2 cm torch flame, biggy ensures exceptional ignition on any occasion. This model is available in the same finishes as the Slimmy: chrome, gold, guilloche diamond tip or lacquer (dark blue and black). Gas refill associated: black (REF 000430)`, en: `Connected to the heritage of the House, combining the elegance of Line 2 with the power of the Megajet, Biggy will delight cigar lovers looking for performance and luxurious design. Carefully designed in glossy black lacquer. Equipped with a powerful 2 cm torch flame, biggy ensures exceptional ignition on any occasion. This model is available in the same finishes as the Slimmy: chrome, gold, guilloche diamond tip or lacquer (dark blue and black). Gas refill associated: black (REF 000430)` },
    collection: `Biggy`,
    categorySlug: "isqueiros",
    image: `/products/biggy-2/025210.webp`,
    variants: [
      { sku: `025210`, name: { pt: `Lacquered lighter — Prata`, en: `Lacquered lighter — Silver` }, priceCents: 48300, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/biggy-2/025210.webp`, images: [`/products/biggy-2/025210.webp`, `/products/biggy-2/025210-2.webp`, `/products/biggy-2/025210-3.webp`, `/products/biggy-2/025210-4.webp`] },
      { sku: `025209`, name: { pt: `Lacquered lighter — Dourado`, en: `Lacquered lighter — Golden` }, priceCents: 48300, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/biggy-2/025209.webp`, images: [`/products/biggy-2/025209.webp`, `/products/biggy-2/025209-2.webp`, `/products/biggy-2/025209-3.webp`, `/products/biggy-2/025209-4.webp`] },
      { sku: `025225`, name: { pt: `Lacquered lighter — Azul & Índigo & Azul`, en: `Lacquered lighter — Blue & Indigo Blue` }, priceCents: 45540, currency: "EUR", attributes: { color: { label: { pt: `Azul & Índigo & Azul`, en: `Blue & Indigo Blue` }, hex: ["#1f3c66", "#2c2c63"] } }, image: `/products/biggy-2/025225.webp`, images: [`/products/biggy-2/025225.webp`, `/products/biggy-2/025225-2.webp`, `/products/biggy-2/025225-3.webp`, `/products/biggy-2/025225-4.webp`] },
      { sku: `025222`, name: { pt: `Lacquered lighter — Preto`, en: `Lacquered lighter — Black` }, priceCents: 45540, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/biggy-2/025222.webp`, images: [`/products/biggy-2/025222.webp`, `/products/biggy-2/025222-2.webp`, `/products/biggy-2/025222-3.webp`, `/products/biggy-2/025222-4.webp`] },
      { sku: `025221`, name: { pt: `Lacquered lighter — Preto & Prata`, en: `Lacquered lighter — Black & Silver` }, priceCents: 45540, currency: "EUR", attributes: { color: { label: { pt: `Preto & Prata`, en: `Black & Silver` }, hex: ["#15171c", "#c9ccd1"] } }, image: `/products/biggy-2/025221.webp`, images: [`/products/biggy-2/025221.webp`, `/products/biggy-2/025221-2.webp`, `/products/biggy-2/025221-3.webp`, `/products/biggy-2/025221-4.webp`] }
    ],
  },
  {
    slug: `defi-extreme-2`,
    name: { pt: `Matt Lighter`, en: `Matt Lighter` },
    description: { pt: `S.T. Dupont continue d'innover et dépasse les performances avec le nouveau briquet Défi Extrême Chrome Brossé. Son design affirmé, dynamique et masculin est un véritable symbole de performance. Sa conception unique combine un corps en métal injecté et une enveloppe de protection en matière semi-rigide très résistante. Son ergonomie intuitive et ses fonctionnalités tactiles avec le décor pointe de diamants en font un objet pratique et efficace en toutes circonstances. Sa flamme torche bleue, puissante et uniforme résiste aux vents les plus violents. Défi Extrême est efficace des températures les plus froides (-10°C) aux températures les plus chaudes (+45°C) et fonctionne à une altitude de plus de 3500 m, là où d'autres briquets sont inefficaces. Une recharge de gaz associée est disponible séparément (REF 900436). Le briquet est livré vide de gaz.`, en: `S.T. Dupont continue d'innover et dépasse les performances avec le nouveau briquet Défi Extrême Chrome Brossé. Son design affirmé, dynamique et masculin est un véritable symbole de performance. Sa conception unique combine un corps en métal injecté et une enveloppe de protection en matière semi-rigide très résistante. Son ergonomie intuitive et ses fonctionnalités tactiles avec le décor pointe de diamants en font un objet pratique et efficace en toutes circonstances. Sa flamme torche bleue, puissante et uniforme résiste aux vents les plus violents. Défi Extrême est efficace des températures les plus froides (-10°C) aux températures les plus chaudes (+45°C) et fonctionne à une altitude de plus de 3500 m, là où d'autres briquets sont inefficaces. Une recharge de gaz associée est disponible séparément (REF 900436). Le briquet est livré vide de gaz.` },
    collection: `Défi Extreme`,
    categorySlug: "isqueiros",
    image: `/products/defi-extreme-2/021465.webp`,
    variants: [
      { sku: `021465`, name: { pt: `Matt Lighter — Rosa`, en: `Matt Lighter — Pink` }, priceCents: 34500, currency: "EUR", attributes: { color: { label: { pt: `Rosa`, en: `Pink` }, hex: ["#e7a3b1"] } }, image: `/products/defi-extreme-2/021465.webp`, images: [`/products/defi-extreme-2/021465.webp`, `/products/defi-extreme-2/021465-2.webp`, `/products/defi-extreme-2/021465-3.webp`, `/products/defi-extreme-2/021465-4.webp`] },
      { sku: `021407`, name: { pt: `Matt Lighter — Bronze & Cobre`, en: `Matt Lighter — Bronze & Copper` }, priceCents: 34500, currency: "EUR", attributes: { color: { label: { pt: `Bronze & Cobre`, en: `Bronze & Copper` }, hex: ["#9b6a3a", "#a7592c"] } }, image: `/products/defi-extreme-2/021407.webp`, images: [`/products/defi-extreme-2/021407.webp`, `/products/defi-extreme-2/021407-2.webp`, `/products/defi-extreme-2/021407-3.webp`, `/products/defi-extreme-2/021407-4.webp`] },
      { sku: `021403`, name: { pt: `Matt Lighter — Cinza & Prata`, en: `Matt Lighter — Grey & Silver` }, priceCents: 34500, currency: "EUR", attributes: { color: { label: { pt: `Cinza & Prata`, en: `Grey & Silver` }, hex: ["#7a7d83", "#c9ccd1"] } }, image: `/products/defi-extreme-2/021403.webp`, images: [`/products/defi-extreme-2/021403.webp`, `/products/defi-extreme-2/021403-2.webp`, `/products/defi-extreme-2/021403-3.webp`, `/products/defi-extreme-2/021403-4.webp`] },
      { sku: `021400`, name: { pt: `Matt Lighter — Preto`, en: `Matt Lighter — Black` }, priceCents: 34500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/defi-extreme-2/021400.webp`, images: [`/products/defi-extreme-2/021400.webp`, `/products/defi-extreme-2/021400-2.webp`, `/products/defi-extreme-2/021400-3.webp`, `/products/defi-extreme-2/021400-4.webp`] }
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
    name: { pt: `Roller pen large`, en: `Roller pen large` },
    description: { pt: `S.T. Dupont partners with French artist Richard Orlinski for an exclusive collection where the power of sculptural gestures meets the precision of artisanal craftsmanship. Inspired by the iconic “Kong” motif and the wildness of nature, this collaboration brings a raw, contemporary energy to the Maison’s creations. Lighters and writing instruments become true works of art, enhanced by angular lines, contrasting textures, and vibrant colors. The “Red” line showcases exceptional technical craftsmanship, combining a new brushed gold finish with a “Kong” motif created in metal filigree and a 1970s-inspired guilloché pattern that produces a sense of movement in the material. These refined techniques are applied to the Ligne 2 lighter and Line D Eternity pen in red and gold, delivering a signature that is both precise and sculptural. Line D Eternity Large fountain pen with diagonal red lacquer guilloché, adorned with the brushed gold “Kong” motif. Gold finishes. Articulated Sword clip. Wings nib in 14K solid gold. Piston included. Also available in roller and fountain pen versions. This fountain pen comes with a medium nib, providing an approximate writing size of 0.55 mm. Associated refills: Ink cartridges: 040112 Blue – 040110 Black – 040362 Red – 040363 Green – 040364 Turquoise Inkwells: 040165 Black – 040166 Royal Blue – 040167 Vibrant Red – 040168 Spring Green – 040169 Turquoise – 040170 Midnight Blue`, en: `S.T. Dupont partners with French artist Richard Orlinski for an exclusive collection where the power of sculptural gestures meets the precision of artisanal craftsmanship. Inspired by the iconic “Kong” motif and the wildness of nature, this collaboration brings a raw, contemporary energy to the Maison’s creations. Lighters and writing instruments become true works of art, enhanced by angular lines, contrasting textures, and vibrant colors. The “Red” line showcases exceptional technical craftsmanship, combining a new brushed gold finish with a “Kong” motif created in metal filigree and a 1970s-inspired guilloché pattern that produces a sense of movement in the material. These refined techniques are applied to the Ligne 2 lighter and Line D Eternity pen in red and gold, delivering a signature that is both precise and sculptural. Line D Eternity Large fountain pen with diagonal red lacquer guilloché, adorned with the brushed gold “Kong” motif. Gold finishes. Articulated Sword clip. Wings nib in 14K solid gold. Piston included. Also available in roller and fountain pen versions. This fountain pen comes with a medium nib, providing an approximate writing size of 0.55 mm. Associated refills: Ink cartridges: 040112 Blue – 040110 Black – 040362 Red – 040363 Green – 040364 Turquoise Inkwells: 040165 Black – 040166 Royal Blue – 040167 Vibrant Red – 040168 Spring Green – 040169 Turquoise – 040170 Midnight Blue` },
    collection: `Eternity`,
    categorySlug: "escrita",
    image: `/products/eternity-orlinski/420062L.webp`,
    variants: [
      { sku: `420062L`, name: { pt: `Roller pen large — Paládio`, en: `Roller pen large — Palladium` }, priceCents: 192740, currency: "EUR", attributes: { color: { label: { pt: `Paládio`, en: `Palladium` }, hex: ["#b9bcc2"] } }, image: `/products/eternity-orlinski/420062L.webp`, images: [`/products/eternity-orlinski/420062L.webp`, `/products/eternity-orlinski/420062L-2.webp`, `/products/eternity-orlinski/420062L-3.webp`, `/products/eternity-orlinski/420062L-4.webp`] },
      { sku: `420061L`, name: { pt: `Roller pen large — Dourado`, en: `Roller pen large — Golden` }, priceCents: 192740, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/eternity-orlinski/420061L.webp`, images: [`/products/eternity-orlinski/420061L.webp`, `/products/eternity-orlinski/420061L-2.webp`, `/products/eternity-orlinski/420061L-3.webp`, `/products/eternity-orlinski/420061L-4.webp`] },
      { sku: `420060L`, name: { pt: `Roller pen large — Vermelho`, en: `Roller pen large — Red` }, priceCents: 211140, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/eternity-orlinski/420060L.webp`, images: [`/products/eternity-orlinski/420060L.webp`, `/products/eternity-orlinski/420060L-2.webp`, `/products/eternity-orlinski/420060L-3.webp`, `/products/eternity-orlinski/420060L-4.webp`] },
      { sku: `422061L`, name: { pt: `Roller pen large — Dourado`, en: `Roller pen large — Golden` }, priceCents: 183540, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/eternity-orlinski/422061L.webp`, images: [`/products/eternity-orlinski/422061L.webp`, `/products/eternity-orlinski/422061L-2.webp`, `/products/eternity-orlinski/422061L-3.webp`, `/products/eternity-orlinski/422061L-4.webp`] },
      { sku: `422062L`, name: { pt: `Roller pen large — Paládio`, en: `Roller pen large — Palladium` }, priceCents: 183540, currency: "EUR", attributes: { color: { label: { pt: `Paládio`, en: `Palladium` }, hex: ["#b9bcc2"] } }, image: `/products/eternity-orlinski/422062L.webp`, images: [`/products/eternity-orlinski/422062L.webp`, `/products/eternity-orlinski/422062L-2.webp`, `/products/eternity-orlinski/422062L-3.webp`, `/products/eternity-orlinski/422062L-4.webp`] },
      { sku: `422060L`, name: { pt: `Roller pen large — Vermelho`, en: `Roller pen large — Red` }, priceCents: 192740, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/eternity-orlinski/422060L.webp`, images: [`/products/eternity-orlinski/422060L.webp`, `/products/eternity-orlinski/422060L-2.webp`, `/products/eternity-orlinski/422060L-3.webp`, `/products/eternity-orlinski/422060L-4.webp`] }
    ],
  },
  {
    slug: `eternity-maki-e`,
    name: { pt: `Fountain pen XL`, en: `Fountain pen XL` },
    description: { pt: `S.T. Dupont celebrates the ancestral Japanese art of Maki-e. Decorated by hand by our partner artisans from Wajimaya Zenni in Japan, each piece is adorned with gold and palladium powder representing traditional Japanese symbols and signed "Zenni". The Ryusui Shunju collection celebrates the harmony of the cycle of nature. Fountain pen Line D Eternity XL in S.T. lacquer Dupont black and gold finishes. Ryusui Shunju decoration in gold powder, lacquer and mother-of-pearl. 14-carat gold nib. Piston included. Ink cartridges: 040112 Blue - 040110 Black - 040362 Red - 040363 Green - 040364 Turquoise Inkwell: 040165 Intense black - 040166 Royal blue -040167 Flamboyant red - 040168 Spring green - 040169 Turquoise - 040170 Night blue`, en: `S.T. Dupont celebrates the ancestral Japanese art of Maki-e. Decorated by hand by our partner artisans from Wajimaya Zenni in Japan, each piece is adorned with gold and palladium powder representing traditional Japanese symbols and signed "Zenni". The Ryusui Shunju collection celebrates the harmony of the cycle of nature. Fountain pen Line D Eternity XL in S.T. lacquer Dupont black and gold finishes. Ryusui Shunju decoration in gold powder, lacquer and mother-of-pearl. 14-carat gold nib. Piston included. Ink cartridges: 040112 Blue - 040110 Black - 040362 Red - 040363 Green - 040364 Turquoise Inkwell: 040165 Intense black - 040166 Royal blue -040167 Flamboyant red - 040168 Spring green - 040169 Turquoise - 040170 Night blue` },
    collection: `Eternity`,
    categorySlug: "escrita",
    image: `/products/eternity-maki-e/420151XL.webp`,
    variants: [
      { sku: `420151XL`, name: { pt: `Fountain pen XL — Castanho`, en: `Fountain pen XL — Brown` }, priceCents: 506000, currency: "EUR", attributes: { color: { label: { pt: `Castanho`, en: `Brown` }, hex: ["#6b4a2a"] } }, image: `/products/eternity-maki-e/420151XL.webp`, images: [`/products/eternity-maki-e/420151XL.webp`, `/products/eternity-maki-e/420151XL-2.webp`, `/products/eternity-maki-e/420151XL-3.webp`, `/products/eternity-maki-e/420151XL-4.webp`] },
      { sku: `420150XL`, name: { pt: `Fountain pen XL — Castanho`, en: `Fountain pen XL — Brown` }, priceCents: 685400, currency: "EUR", attributes: { color: { label: { pt: `Castanho`, en: `Brown` }, hex: ["#6b4a2a"] } }, image: `/products/eternity-maki-e/420150XL.webp`, images: [`/products/eternity-maki-e/420150XL.webp`, `/products/eternity-maki-e/420150XL-2.webp`, `/products/eternity-maki-e/420150XL-3.webp`, `/products/eternity-maki-e/420150XL-4.webp`] }
    ],
  },
  {
    slug: `popote-2`,
    name: { pt: `Rollerball pen medium`, en: `Rollerball pen medium` },
    description: { pt: `An emblematic technique of the S.T. Dupont house, the so-called Popoté technique plays with material and light. Using a special stamp, the craftsman applies irregular touches to the lacquer, creating a painterly effect where the surface seems to vibrate under the light. Each gesture, both precise and random, reveals a unique depth. Line D Eternity medium fountain pen in black Urushi lacquer with Popoté décor and palladium finishes. 14-carat solid gold nib. Piston converter included. Articulated Sword clip. Available in rollerball and fountain pen versions. This fountain pen comes with a medium nib, for a line width of approximately 0.55 mm. Compatible refills: Ink cartridges: 040112 Blue - 040110 Black - 040362 Red - 040363 Green - 040364 Turquoise Ink bottles: 040165 Black - 040166 Royal Blue - 040167 Flamboyant Red - 040168 Spring Green - 040169 Turquoise - 040170 Midnight Blue`, en: `An emblematic technique of the S.T. Dupont house, the so-called Popoté technique plays with material and light. Using a special stamp, the craftsman applies irregular touches to the lacquer, creating a painterly effect where the surface seems to vibrate under the light. Each gesture, both precise and random, reveals a unique depth. Line D Eternity medium fountain pen in black Urushi lacquer with Popoté décor and palladium finishes. 14-carat solid gold nib. Piston converter included. Articulated Sword clip. Available in rollerball and fountain pen versions. This fountain pen comes with a medium nib, for a line width of approximately 0.55 mm. Compatible refills: Ink cartridges: 040112 Blue - 040110 Black - 040362 Red - 040363 Green - 040364 Turquoise Ink bottles: 040165 Black - 040166 Royal Blue - 040167 Flamboyant Red - 040168 Spring Green - 040169 Turquoise - 040170 Midnight Blue` },
    collection: ``,
    categorySlug: "escrita",
    image: `/products/popote-2/420317L.webp`,
    variants: [
      { sku: `420317L`, name: { pt: `Rollerball pen medium — Azul`, en: `Rollerball pen medium — Blue` }, priceCents: 174340, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/popote-2/420317L.webp`, images: [`/products/popote-2/420317L.webp`, `/products/popote-2/420317L-2.webp`, `/products/popote-2/420317L-3.webp`, `/products/popote-2/420317L-4.webp`] },
      { sku: `422317L`, name: { pt: `Rollerball pen medium — Azul`, en: `Rollerball pen medium — Blue` }, priceCents: 155940, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/popote-2/422317L.webp`, images: [`/products/popote-2/422317L.webp`, `/products/popote-2/422317L-2.webp`, `/products/popote-2/422317L-3.webp`, `/products/popote-2/422317L-4.webp`] },
      { sku: `422316M`, name: { pt: `Rollerball pen medium — Preto`, en: `Rollerball pen medium — Black` }, priceCents: 146740, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/popote-2/422316M.webp`, images: [`/products/popote-2/422316M.webp`, `/products/popote-2/422316M-2.webp`, `/products/popote-2/422316M-3.webp`, `/products/popote-2/422316M-4.webp`] },
      { sku: `420316M`, name: { pt: `Rollerball pen medium — Preto`, en: `Rollerball pen medium — Black` }, priceCents: 165140, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/popote-2/420316M.webp`, images: [`/products/popote-2/420316M.webp`, `/products/popote-2/420316M-2.webp`, `/products/popote-2/420316M-3.webp`, `/products/popote-2/420316M-4.webp`] },
      { sku: `420318L`, name: { pt: `Rollerball pen medium — Vermelho`, en: `Rollerball pen medium — Red` }, priceCents: 174340, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/popote-2/420318L.webp`, images: [`/products/popote-2/420318L.webp`, `/products/popote-2/420318L-2.webp`, `/products/popote-2/420318L-3.webp`, `/products/popote-2/420318L-4.webp`] },
      { sku: `422318L`, name: { pt: `Rollerball pen medium — Vermelho`, en: `Rollerball pen medium — Red` }, priceCents: 155940, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/popote-2/422318L.webp`, images: [`/products/popote-2/422318L.webp`, `/products/popote-2/422318L-2.webp`, `/products/popote-2/422318L-3.webp`, `/products/popote-2/422318L-4.webp`] }
    ],
  },
  {
    slug: `writing-instrument`,
    name: { pt: `Ballpoint pen`, en: `Ballpoint pen` },
    description: { pt: `S.T. Dupont presents the Mini Pen Necklace: the trendy fusion of functionality, elegance, and craftsmanship. This innovative writing instrument combines the practicality of a ballpoint pen, the refinement of jewelry, and the Maison’s expertise. Mini Pen Necklace in burgundy lacquer with a gold diamond-tip cap. Adjustable chain with three different lengths: 80 / 85 / 90 cm. Associated refill: 040999 Black`, en: `S.T. Dupont presents the Mini Pen Necklace: the trendy fusion of functionality, elegance, and craftsmanship. This innovative writing instrument combines the practicality of a ballpoint pen, the refinement of jewelry, and the Maison’s expertise. Mini Pen Necklace in burgundy lacquer with a gold diamond-tip cap. Adjustable chain with three different lengths: 80 / 85 / 90 cm. Associated refill: 040999 Black` },
    collection: `Escrita`,
    categorySlug: "escrita",
    image: `/products/writing-instrument/700008.webp`,
    variants: [
      { sku: `700008`, name: { pt: `Ballpoint pen — S.t. & Dupont`, en: `Ballpoint pen — S.T. Dupont` }, priceCents: 39100, currency: "EUR", attributes: { color: { label: { pt: `S.t. & Dupont`, en: `S.T. Dupont` }, hex: ["#7a7d83"] } }, image: `/products/writing-instrument/700008.webp`, images: [`/products/writing-instrument/700008.webp`, `/products/writing-instrument/700008-2.webp`, `/products/writing-instrument/700008-3.webp`, `/products/writing-instrument/700008-4.webp`] },
      { sku: `700006`, name: { pt: `Ballpoint pen — S.t. & Dupont`, en: `Ballpoint pen — S.T. Dupont` }, priceCents: 39100, currency: "EUR", attributes: { color: { label: { pt: `S.t. & Dupont`, en: `S.T. Dupont` }, hex: ["#7a7d83"] } }, image: `/products/writing-instrument/700006.webp`, images: [`/products/writing-instrument/700006.webp`, `/products/writing-instrument/700006-2.webp`, `/products/writing-instrument/700006-3.webp`, `/products/writing-instrument/700006-4.webp`] },
      { sku: `700005`, name: { pt: `Ballpoint pen — S.t. & Dupont`, en: `Ballpoint pen — S.T. Dupont` }, priceCents: 39100, currency: "EUR", attributes: { color: { label: { pt: `S.t. & Dupont`, en: `S.T. Dupont` }, hex: ["#7a7d83"] } }, image: `/products/writing-instrument/700005.webp`, images: [`/products/writing-instrument/700005.webp`, `/products/writing-instrument/700005-2.webp`, `/products/writing-instrument/700005-3.webp`, `/products/writing-instrument/700005-4.webp`] }
    ],
  },
  {
    slug: `eternity-horsemane`,
    name: { pt: `Rollerball pen large`, en: `Rollerball pen large` },
    description: { pt: `Inspired by the 2026 Lunar Year of the Horse, the Horsemane Collection introduces a unique “mane” guilloché under red or black lacquer. Line D Eternity Large fountain pen in black lacquer with “horse mane” guilloché. Palladium-plated finishes. 14-carat gold nib. Piston included. Articulated Sword clip. Available in rollerball and fountain pen versions. Ink cartridges: 040112 Blue – 040110 Black – 040362 Red – 040363 Green – 040364 Turquoise Inkwells: 040165 Intense Black – 040166 Royal Blue – 040167 Flamboyant Red – 040168 Spring Green – 040169 Turquoise – 040170 Night Blue`, en: `Inspired by the 2026 Lunar Year of the Horse, the Horsemane Collection introduces a unique “mane” guilloché under red or black lacquer. Line D Eternity Large fountain pen in black lacquer with “horse mane” guilloché. Palladium-plated finishes. 14-carat gold nib. Piston included. Articulated Sword clip. Available in rollerball and fountain pen versions. Ink cartridges: 040112 Blue – 040110 Black – 040362 Red – 040363 Green – 040364 Turquoise Inkwells: 040165 Intense Black – 040166 Royal Blue – 040167 Flamboyant Red – 040168 Spring Green – 040169 Turquoise – 040170 Night Blue` },
    collection: `Eternity`,
    categorySlug: "escrita",
    image: `/products/eternity-horsemane/420090L.webp`,
    variants: [
      { sku: `420090L`, name: { pt: `Rollerball pen large — Preto`, en: `Rollerball pen large — Black` }, priceCents: 119140, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/eternity-horsemane/420090L.webp`, images: [`/products/eternity-horsemane/420090L.webp`, `/products/eternity-horsemane/420090L-2.webp`, `/products/eternity-horsemane/420090L-3.webp`, `/products/eternity-horsemane/420090L-4.webp`] },
      { sku: `422090L`, name: { pt: `Rollerball pen large — Preto`, en: `Rollerball pen large — Black` }, priceCents: 100740, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/eternity-horsemane/422090L.webp`, images: [`/products/eternity-horsemane/422090L.webp`, `/products/eternity-horsemane/422090L-2.webp`, `/products/eternity-horsemane/422090L-3.webp`, `/products/eternity-horsemane/422090L-4.webp`] },
      { sku: `420089L`, name: { pt: `Rollerball pen large — Vermelho`, en: `Rollerball pen large — Red` }, priceCents: 119140, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/eternity-horsemane/420089L.webp`, images: [`/products/eternity-horsemane/420089L.webp`, `/products/eternity-horsemane/420089L-2.webp`, `/products/eternity-horsemane/420089L-3.webp`, `/products/eternity-horsemane/420089L-4.webp`] },
      { sku: `422089L`, name: { pt: `Rollerball pen large — Vermelho`, en: `Rollerball pen large — Red` }, priceCents: 100740, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/eternity-horsemane/422089L.webp`, images: [`/products/eternity-horsemane/422089L.webp`, `/products/eternity-horsemane/422089L-2.webp`, `/products/eternity-horsemane/422089L-3.webp`, `/products/eternity-horsemane/422089L-4.webp`] }
    ],
  },
  {
    slug: `defi-milenium`,
    name: { pt: `Rollerball pen`, en: `Rollerball pen` },
    description: { pt: `The Défi Millenium collection has been revisited with the addition of two new finishes, reflecting a perfect balance between tradition and innovation. These new models, in a shiny black lacquer and brushed chrome, convey the collection’s athletic spirit while maintaining the Maison’s iconic signatures. Streamlined and precise, this captivating pen is quite the charm with its fluid writing and sporty style. Refills: 040112 Blue 040110 Black 040362 Red 040363 Green 040364 Turquoise Warning: Writing instrument with magnetic cap. Accessories with magnets are not recommended for those who are pregnant, have metallic implants or medical devices such as pacemakers, insulin pumps, etc. We also advise against bringing the writing instrument into prolonged contact with credit cards, mechanical and quartz watches, mobile phones and any other magnetic devices, as the magnetic field it emits could damage sensitive devices. This product is not a toy. Keep out of reach of children.`, en: `The Défi Millenium collection has been revisited with the addition of two new finishes, reflecting a perfect balance between tradition and innovation. These new models, in a shiny black lacquer and brushed chrome, convey the collection’s athletic spirit while maintaining the Maison’s iconic signatures. Streamlined and precise, this captivating pen is quite the charm with its fluid writing and sporty style. Refills: 040112 Blue 040110 Black 040362 Red 040363 Green 040364 Turquoise Warning: Writing instrument with magnetic cap. Accessories with magnets are not recommended for those who are pregnant, have metallic implants or medical devices such as pacemakers, insulin pumps, etc. We also advise against bringing the writing instrument into prolonged contact with credit cards, mechanical and quartz watches, mobile phones and any other magnetic devices, as the magnetic field it emits could damage sensitive devices. This product is not a toy. Keep out of reach of children.` },
    collection: `Défi Millennium`,
    categorySlug: "escrita",
    image: `/products/defi-milenium/400003.webp`,
    variants: [
      { sku: `400003`, name: { pt: `Rollerball pen — Preto`, en: `Rollerball pen — Black` }, priceCents: 41400, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/defi-milenium/400003.webp`, images: [`/products/defi-milenium/400003.webp`, `/products/defi-milenium/400003-2.webp`, `/products/defi-milenium/400003-3.webp`, `/products/defi-milenium/400003-4.webp`] },
      { sku: `402034`, name: { pt: `Rollerball pen — Néon & Laranja`, en: `Rollerball pen — Neon Orange` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Néon & Laranja`, en: `Neon Orange` }, hex: ["#aef043", "#c4642d"] } }, image: `/products/defi-milenium/402034.webp`, images: [`/products/defi-milenium/402034.webp`, `/products/defi-milenium/402034-2.webp`, `/products/defi-milenium/402034-3.webp`, `/products/defi-milenium/402034-4.webp`] },
      { sku: `400004`, name: { pt: `Rollerball pen — Prata`, en: `Rollerball pen — Silver` }, priceCents: 41400, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/defi-milenium/400004.webp`, images: [`/products/defi-milenium/400004.webp`, `/products/defi-milenium/400004-2.webp`] },
      { sku: `405004`, name: { pt: `Rollerball pen — Preto & Prata`, en: `Rollerball pen — Black & Silver` }, priceCents: 32200, currency: "EUR", attributes: { color: { label: { pt: `Preto & Prata`, en: `Black & Silver` }, hex: ["#15171c", "#c9ccd1"] } }, image: `/products/defi-milenium/405004.webp`, images: [`/products/defi-milenium/405004.webp`, `/products/defi-milenium/405004-2.webp`, `/products/defi-milenium/405004-3.webp`, `/products/defi-milenium/405004-4.webp`] },
      { sku: `405003`, name: { pt: `Rollerball pen — Preto`, en: `Rollerball pen — Black` }, priceCents: 32200, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/defi-milenium/405003.webp`, images: [`/products/defi-milenium/405003.webp`, `/products/defi-milenium/405003-2.webp`, `/products/defi-milenium/405003-3.webp`, `/products/defi-milenium/405003-4.webp`] },
      { sku: `402003`, name: { pt: `Rollerball pen — Preto`, en: `Rollerball pen — Black` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/defi-milenium/402003.webp`, images: [`/products/defi-milenium/402003.webp`, `/products/defi-milenium/402003-2.webp`, `/products/defi-milenium/402003-3.webp`, `/products/defi-milenium/402003-4.webp`] },
      { sku: `400739`, name: { pt: `Rollerball pen — Vermelho`, en: `Rollerball pen — Red` }, priceCents: 41400, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/defi-milenium/400739.webp`, images: [`/products/defi-milenium/400739.webp`, `/products/defi-milenium/400739-2.webp`, `/products/defi-milenium/400739-3.webp`, `/products/defi-milenium/400739-4.webp`] },
      { sku: `400736`, name: { pt: `Rollerball pen — Azul & Escuro & Azul`, en: `Rollerball pen — Blue & Dark Blue` }, priceCents: 41400, currency: "EUR", attributes: { color: { label: { pt: `Azul & Escuro & Azul`, en: `Blue & Dark Blue` }, hex: ["#1f3c66", "#2a2d34"] } }, image: `/products/defi-milenium/400736.webp`, images: [`/products/defi-milenium/400736.webp`, `/products/defi-milenium/400736-2.webp`, `/products/defi-milenium/400736-3.webp`, `/products/defi-milenium/400736-4.webp`] },
      { sku: `402736`, name: { pt: `Rollerball pen — Azul & Escuro & Azul`, en: `Rollerball pen — Blue & Dark Blue` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Azul & Escuro & Azul`, en: `Blue & Dark Blue` }, hex: ["#1f3c66", "#2a2d34"] } }, image: `/products/defi-milenium/402736.webp`, images: [`/products/defi-milenium/402736.webp`, `/products/defi-milenium/402736-2.webp`, `/products/defi-milenium/402736-3.webp`, `/products/defi-milenium/402736-4.webp`] },
      { sku: `402739`, name: { pt: `Rollerball pen — Vermelho`, en: `Rollerball pen — Red` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/defi-milenium/402739.webp`, images: [`/products/defi-milenium/402739.webp`, `/products/defi-milenium/402739-2.webp`, `/products/defi-milenium/402739-3.webp`, `/products/defi-milenium/402739-4.webp`] },
      { sku: `400719`, name: { pt: `Rollerball pen — Preto & Gun Metal & Prata`, en: `Rollerball pen — Black & Gunmetal & Silver` }, priceCents: 41400, currency: "EUR", attributes: { color: { label: { pt: `Preto & Gun Metal & Prata`, en: `Black & Gunmetal & Silver` }, hex: ["#15171c", "#4b4f55"] } }, image: `/products/defi-milenium/400719.webp`, images: [`/products/defi-milenium/400719.webp`, `/products/defi-milenium/400719-2.webp`, `/products/defi-milenium/400719-3.webp`, `/products/defi-milenium/400719-4.webp`] },
      { sku: `400706`, name: { pt: `Rollerball pen — Preto & Prata`, en: `Rollerball pen — Black & Silver` }, priceCents: 41400, currency: "EUR", attributes: { color: { label: { pt: `Preto & Prata`, en: `Black & Silver` }, hex: ["#15171c", "#c9ccd1"] } }, image: `/products/defi-milenium/400706.webp`, images: [`/products/defi-milenium/400706.webp`, `/products/defi-milenium/400706-2.webp`, `/products/defi-milenium/400706-3.webp`, `/products/defi-milenium/400706-4.webp`] },
      { sku: `402737`, name: { pt: `Rollerball pen — Laranja`, en: `Rollerball pen — Orange` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Laranja`, en: `Orange` }, hex: ["#c4642d"] } }, image: `/products/defi-milenium/402737.webp`, images: [`/products/defi-milenium/402737.webp`, `/products/defi-milenium/402737-2.webp`, `/products/defi-milenium/402737-3.webp`, `/products/defi-milenium/402737-4.webp`] },
      { sku: `402719`, name: { pt: `Rollerball pen — Preto & Gun Metal`, en: `Rollerball pen — Black & Gunmetal` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Preto & Gun Metal`, en: `Black & Gunmetal` }, hex: ["#15171c", "#4b4f55"] } }, image: `/products/defi-milenium/402719.webp`, images: [`/products/defi-milenium/402719.webp`, `/products/defi-milenium/402719-2.webp`, `/products/defi-milenium/402719-3.webp`, `/products/defi-milenium/402719-4.webp`] },
      { sku: `402706`, name: { pt: `Rollerball pen — Preto & Prata`, en: `Rollerball pen — Black & Silver` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Preto & Prata`, en: `Black & Silver` }, hex: ["#15171c", "#c9ccd1"] } }, image: `/products/defi-milenium/402706.webp`, images: [`/products/defi-milenium/402706.webp`, `/products/defi-milenium/402706-2.webp`, `/products/defi-milenium/402706-3.webp`, `/products/defi-milenium/402706-4.webp`] },
      { sku: `405739`, name: { pt: `Rollerball pen — Vermelho`, en: `Rollerball pen — Red` }, priceCents: 32200, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/defi-milenium/405739.webp`, images: [`/products/defi-milenium/405739.webp`, `/products/defi-milenium/405739-2.webp`, `/products/defi-milenium/405739-3.webp`, `/products/defi-milenium/405739-4.webp`] },
      { sku: `405737`, name: { pt: `Rollerball pen — Laranja`, en: `Rollerball pen — Orange` }, priceCents: 32200, currency: "EUR", attributes: { color: { label: { pt: `Laranja`, en: `Orange` }, hex: ["#c4642d"] } }, image: `/products/defi-milenium/405737.webp`, images: [`/products/defi-milenium/405737.webp`, `/products/defi-milenium/405737-2.webp`, `/products/defi-milenium/405737-3.webp`, `/products/defi-milenium/405737-4.webp`] },
      { sku: `405736`, name: { pt: `Rollerball pen — Azul & Escuro & Azul`, en: `Rollerball pen — Blue & Dark Blue` }, priceCents: 32200, currency: "EUR", attributes: { color: { label: { pt: `Azul & Escuro & Azul`, en: `Blue & Dark Blue` }, hex: ["#1f3c66", "#2a2d34"] } }, image: `/products/defi-milenium/405736.webp`, images: [`/products/defi-milenium/405736.webp`, `/products/defi-milenium/405736-2.webp`, `/products/defi-milenium/405736-3.webp`, `/products/defi-milenium/405736-4.webp`] },
      { sku: `405719`, name: { pt: `Rollerball pen — Preto & Gun Metal & Prata`, en: `Rollerball pen — Black & Gunmetal & Silver` }, priceCents: 32200, currency: "EUR", attributes: { color: { label: { pt: `Preto & Gun Metal & Prata`, en: `Black & Gunmetal & Silver` }, hex: ["#15171c", "#4b4f55"] } }, image: `/products/defi-milenium/405719.webp`, images: [`/products/defi-milenium/405719.webp`, `/products/defi-milenium/405719-2.webp`, `/products/defi-milenium/405719-3.webp`, `/products/defi-milenium/405719-4.webp`] },
      { sku: `405706`, name: { pt: `Rollerball pen — Preto & Prata`, en: `Rollerball pen — Black & Silver` }, priceCents: 32200, currency: "EUR", attributes: { color: { label: { pt: `Preto & Prata`, en: `Black & Silver` }, hex: ["#15171c", "#c9ccd1"] } }, image: `/products/defi-milenium/405706.webp`, images: [`/products/defi-milenium/405706.webp`, `/products/defi-milenium/405706-2.webp`, `/products/defi-milenium/405706-3.webp`, `/products/defi-milenium/405706-4.webp`] },
      // Rescued from the dropped curated `defi-millenium` (typo collection) —
      // the three Rollerball colourways the user wanted to keep when the
      // duplicate category was removed: blue with chrome, black with matt
      // black, red with chrome. Image folders stay at /products/defi-
      // millenium/DM-RB-<code>/ so the existing photographed galleries
      // continue to work.
      { sku: `DM-RB-NVC`, name: { pt: `Rollerball pen — Laca Azul Marinho & Crómio`, en: `Rollerball pen — Navy Blue Lacquer & Chrome` }, priceCents: 38500, currency: "EUR", attributes: { color: { label: { pt: `Laca Azul Marinho & Crómio`, en: `Navy Blue Lacquer & Chrome` }, hex: ["#1b2a44", "#c9ccd1"] } }, image: `/products/defi-millenium/DM-RB-NVC/front.jpg`, images: [`/products/defi-millenium/DM-RB-NVC/front.jpg`, `/products/defi-millenium/DM-RB-NVC/back.jpg`, `/products/defi-millenium/DM-RB-NVC/closeup.jpg`, `/products/defi-millenium/DM-RB-NVC/closeup2.jpg`] },
      { sku: `DM-RB-BMB`, name: { pt: `Rollerball pen — Preto & Preto Mate`, en: `Rollerball pen — Black & Matt Black` }, priceCents: 38500, currency: "EUR", attributes: { color: { label: { pt: `Preto & Preto Mate`, en: `Black & Matt Black` }, hex: ["#15171c", "#2a2c30"] } }, image: `/products/defi-millenium/DM-RB-BMB/front.jpg`, images: [`/products/defi-millenium/DM-RB-BMB/front.jpg`, `/products/defi-millenium/DM-RB-BMB/back.jpg`, `/products/defi-millenium/DM-RB-BMB/closeup.jpg`, `/products/defi-millenium/DM-RB-BMB/closeup2.jpg`] },
      { sku: `DM-RB-MRC`, name: { pt: `Rollerball pen — Vermelho Mate & Crómio`, en: `Rollerball pen — Matt Red & Chrome` }, priceCents: 38500, currency: "EUR", attributes: { color: { label: { pt: `Vermelho Mate & Crómio`, en: `Matt Red & Chrome` }, hex: ["#7d2b27", "#c9ccd1"] } }, image: `/products/defi-millenium/DM-RB-MRC/front.jpg`, images: [`/products/defi-millenium/DM-RB-MRC/front.jpg`, `/products/defi-millenium/DM-RB-MRC/back.jpg`, `/products/defi-millenium/DM-RB-MRC/closeup.jpg`, `/products/defi-millenium/DM-RB-MRC/closeup2.jpg`] }
    ],
  },
  {
    slug: `d-initial`,
    name: { pt: `Rollerball pen`, en: `Rollerball pen` },
    description: { pt: `S.T. Dupont enriches its Line D Eternity and Initial collections with two sophisticated new colors: black lacquer and black finishes for both models, and white lacquer and gold finishes for the new Initial. Initial fountain pen in white lacquer and gold finish. Wings gold-plated stainless steel nib. Piston included. Sword clip and lacquered top. Available in ballpoint, rollerball and fountain versions. Related refills: Ink catridges: 040112 Blue - 040110 Black - 040362 Red - 040363 Green - 040364 Turquoise Ink fountains: 040165 Black - 040166 Royal Blue - 040167 Flamboyant Red - 040168 Spring Green - 040169 Turquoise - 040170 Night Blue This fountain pen comes with a medium nib, for a writing size of apporox. 0.55 mm.`, en: `S.T. Dupont enriches its Line D Eternity and Initial collections with two sophisticated new colors: black lacquer and black finishes for both models, and white lacquer and gold finishes for the new Initial. Initial fountain pen in white lacquer and gold finish. Wings gold-plated stainless steel nib. Piston included. Sword clip and lacquered top. Available in ballpoint, rollerball and fountain versions. Related refills: Ink catridges: 040112 Blue - 040110 Black - 040362 Red - 040363 Green - 040364 Turquoise Ink fountains: 040165 Black - 040166 Royal Blue - 040167 Flamboyant Red - 040168 Spring Green - 040169 Turquoise - 040170 Night Blue This fountain pen comes with a medium nib, for a writing size of apporox. 0.55 mm.` },
    collection: `Initial`,
    categorySlug: "escrita",
    image: `/products/d-initial/275217.webp`,
    variants: [
      { sku: `275217`, name: { pt: `Rollerball pen — Branco`, en: `Rollerball pen — White` }, priceCents: 25300, currency: "EUR", attributes: { color: { label: { pt: `Branco`, en: `White` }, hex: ["#f3efe6"] } }, image: `/products/d-initial/275217.webp`, images: [`/products/d-initial/275217.webp`, `/products/d-initial/275217-2.webp`, `/products/d-initial/275217-3.webp`, `/products/d-initial/275217-4.webp`] },
      { sku: `275115`, name: { pt: `Rollerball pen — Preto`, en: `Rollerball pen — Black` }, priceCents: 25300, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/d-initial/275115.webp`, images: [`/products/d-initial/275115.webp`, `/products/d-initial/275115-2.webp`, `/products/d-initial/275115-3.webp`, `/products/d-initial/275115-4.webp`] },
      { sku: `275202`, name: { pt: `Rollerball pen — Dourado`, en: `Rollerball pen — Golden` }, priceCents: 25300, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/d-initial/275202.webp`, images: [`/products/d-initial/275202.webp`, `/products/d-initial/275202-2.webp`, `/products/d-initial/275202-3.webp`, `/products/d-initial/275202-4.webp`] },
      { sku: `275205`, name: { pt: `Rollerball pen — Escuro & Azul`, en: `Rollerball pen — Dark Blue` }, priceCents: 25300, currency: "EUR", attributes: { color: { label: { pt: `Escuro & Azul`, en: `Dark Blue` }, hex: ["#2a2d34", "#1f3c66"] } }, image: `/products/d-initial/275205.webp`, images: [`/products/d-initial/275205.webp`, `/products/d-initial/275205-2.webp`, `/products/d-initial/275205-3.webp`, `/products/d-initial/275205-4.webp`] },
      { sku: `275200`, name: { pt: `Rollerball pen — Prata`, en: `Rollerball pen — Silver` }, priceCents: 25300, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/d-initial/275200.webp`, images: [`/products/d-initial/275200.webp`, `/products/d-initial/275200-2.webp`, `/products/d-initial/275200-3.webp`, `/products/d-initial/275200-4.webp`] },
      { sku: `272216`, name: { pt: `Rollerball pen — Preto`, en: `Rollerball pen — Black` }, priceCents: 31740, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/d-initial/272216.webp`, images: [`/products/d-initial/272216.webp`, `/products/d-initial/272216-2.webp`, `/products/d-initial/272216-3.webp`, `/products/d-initial/272216-4.webp`] },
      { sku: `272217`, name: { pt: `Rollerball pen — Branco`, en: `Rollerball pen — White` }, priceCents: 31740, currency: "EUR", attributes: { color: { label: { pt: `Branco`, en: `White` }, hex: ["#f3efe6"] } }, image: `/products/d-initial/272217.webp`, images: [`/products/d-initial/272217.webp`, `/products/d-initial/272217-2.webp`, `/products/d-initial/272217-3.webp`, `/products/d-initial/272217-4.webp`] },
      { sku: `272205`, name: { pt: `Rollerball pen — Escuro & Azul`, en: `Rollerball pen — Dark Blue` }, priceCents: 31740, currency: "EUR", attributes: { color: { label: { pt: `Escuro & Azul`, en: `Dark Blue` }, hex: ["#2a2d34", "#1f3c66"] } }, image: `/products/d-initial/272205.webp`, images: [`/products/d-initial/272205.webp`, `/products/d-initial/272205-2.webp`, `/products/d-initial/272205-3.webp`, `/products/d-initial/272205-4.webp`] },
      { sku: `272202`, name: { pt: `Rollerball pen — Dourado`, en: `Rollerball pen — Golden` }, priceCents: 31740, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/d-initial/272202.webp`, images: [`/products/d-initial/272202.webp`, `/products/d-initial/272202-2.webp`, `/products/d-initial/272202-3.webp`, `/products/d-initial/272202-4.webp`] },
      { sku: `272201`, name: { pt: `Rollerball pen — Prata`, en: `Rollerball pen — Silver` }, priceCents: 31740, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/d-initial/272201.webp`, images: [`/products/d-initial/272201.webp`, `/products/d-initial/272201-2.webp`, `/products/d-initial/272201-3.webp`, `/products/d-initial/272201-4.webp`] },
      { sku: `272200`, name: { pt: `Rollerball pen — Prata`, en: `Rollerball pen — Silver` }, priceCents: 31740, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/d-initial/272200.webp`, images: [`/products/d-initial/272200.webp`, `/products/d-initial/272200-2.webp`, `/products/d-initial/272200-3.webp`, `/products/d-initial/272200-4.webp`] },
      { sku: `270216`, name: { pt: `Rollerball pen — Preto`, en: `Rollerball pen — Black` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/d-initial/270216.webp`, images: [`/products/d-initial/270216.webp`, `/products/d-initial/270216-2.webp`, `/products/d-initial/270216-3.webp`, `/products/d-initial/270216-4.webp`] },
      { sku: `270217`, name: { pt: `Rollerball pen — Branco`, en: `Rollerball pen — White` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Branco`, en: `White` }, hex: ["#f3efe6"] } }, image: `/products/d-initial/270217.webp`, images: [`/products/d-initial/270217.webp`, `/products/d-initial/270217-2.webp`, `/products/d-initial/270217-3.webp`, `/products/d-initial/270217-4.webp`] },
      { sku: `270202`, name: { pt: `Rollerball pen — Dourado`, en: `Rollerball pen — Golden` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/d-initial/270202.webp`, images: [`/products/d-initial/270202.webp`, `/products/d-initial/270202-2.webp`, `/products/d-initial/270202-3.webp`, `/products/d-initial/270202-4.webp`] },
      { sku: `270201`, name: { pt: `Rollerball pen — Prata`, en: `Rollerball pen — Silver` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/d-initial/270201.webp`, images: [`/products/d-initial/270201.webp`, `/products/d-initial/270201-2.webp`, `/products/d-initial/270201-3.webp`, `/products/d-initial/270201-4.webp`] },
      { sku: `270200`, name: { pt: `Rollerball pen — Prata`, en: `Rollerball pen — Silver` }, priceCents: 36340, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/d-initial/270200.webp`, images: [`/products/d-initial/270200.webp`, `/products/d-initial/270200-2.webp`, `/products/d-initial/270200-3.webp`, `/products/d-initial/270200-4.webp`] }
    ],
  },
  {
    slug: `d-initial-fire-x`,
    name: { pt: `Ballpoint pen`, en: `Ballpoint pen` },
    description: { pt: `Inspired by the X-Bag, one of the bags from the leather goods collection developed this season by S.T. Dupont, Fire X presents its reinterpretation of the iconic flame tip on the classics of the House. Initial ballpoint pen decorated with the Fire X motif and chrome finishes. Manufactured in China. Associated refills: 040853 Blue - 040854 Black - 040358 Pink - 040359 Red - 040360 Green - 040361 Turquoise.`, en: `Inspired by the X-Bag, one of the bags from the leather goods collection developed this season by S.T. Dupont, Fire X presents its reinterpretation of the iconic flame tip on the classics of the House. Initial ballpoint pen decorated with the Fire X motif and chrome finishes. Manufactured in China. Associated refills: 040853 Blue - 040854 Black - 040358 Pink - 040359 Red - 040360 Green - 040361 Turquoise.` },
    collection: `Initial`,
    categorySlug: "escrita",
    image: `/products/d-initial-fire-x/275070.webp`,
    variants: [
      { sku: `275070`, name: { pt: `Ballpoint pen — Preto`, en: `Ballpoint pen — Black` }, priceCents: 34500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/d-initial-fire-x/275070.webp`, images: [`/products/d-initial-fire-x/275070.webp`, `/products/d-initial-fire-x/275070-2.webp`, `/products/d-initial-fire-x/275070-3.webp`, `/products/d-initial-fire-x/275070-4.webp`] }
    ],
  },
  {
    slug: `marker-necklace`,
    name: { pt: `Marker pen`, en: `Marker pen` },
    description: { pt: `Inspired by the success of its lighter necklace, S.T. Dupont has extended the range of this useful and distinctive object with the marker necklace. An original design that makes the pen a true fashion accessory. For creative minds, thinkers and graffiti artists, for those who always need a pen. Featuring a Sharpie mini marker, an iconic graphic arts brand, it is adorned with an iconic guilloché pattern, the diamond tip invented by goldsmith S.T. Dupont. Diamondhead guillauche marker necklace in chrome finish. Adjustable chain in three different lengths 80/85/90 cm. Sold with a black Sharpie Mini marker. Sharpie Mini markers are not sold by S.T. Dupont, available on the Sharpie website and from retailers.`, en: `Inspired by the success of its lighter necklace, S.T. Dupont has extended the range of this useful and distinctive object with the marker necklace. An original design that makes the pen a true fashion accessory. For creative minds, thinkers and graffiti artists, for those who always need a pen. Featuring a Sharpie mini marker, an iconic graphic arts brand, it is adorned with an iconic guilloché pattern, the diamond tip invented by goldsmith S.T. Dupont. Diamondhead guillauche marker necklace in chrome finish. Adjustable chain in three different lengths 80/85/90 cm. Sold with a black Sharpie Mini marker. Sharpie Mini markers are not sold by S.T. Dupont, available on the Sharpie website and from retailers.` },
    collection: `Colar Marker`,
    categorySlug: "escrita",
    image: `/products/marker-necklace/700003.webp`,
    variants: [
      { sku: `700003`, name: { pt: `Marker pen — Dourado`, en: `Marker pen — Golden` }, priceCents: 45540, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/marker-necklace/700003.webp`, images: [`/products/marker-necklace/700003.webp`, `/products/marker-necklace/700003-2.webp`, `/products/marker-necklace/700003-3.webp`, `/products/marker-necklace/700003-4.webp`] },
      { sku: `700002`, name: { pt: `Marker pen — Prata`, en: `Marker pen — Silver` }, priceCents: 45540, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/marker-necklace/700002.webp`, images: [`/products/marker-necklace/700002.webp`, `/products/marker-necklace/700002-2.webp`, `/products/marker-necklace/700002-3.webp`, `/products/marker-necklace/700002-4.webp`] },
      { sku: `700004`, name: { pt: `Marker pen — Preto`, en: `Marker pen — Black` }, priceCents: 45540, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/marker-necklace/700004.webp`, images: [`/products/marker-necklace/700004.webp`, `/products/marker-necklace/700004-2.webp`, `/products/marker-necklace/700004-3.webp`, `/products/marker-necklace/700004-4.webp`] }
    ],
  },
  {
    slug: `eternity`,
    name: { pt: `Rollerball pen XL`, en: `Rollerball pen XL` },
    description: { pt: `S.T. Dupont enriches its Line D Eternity and Initial collections with two sophisticated new colors: black lacquer and black finishes for both models, and white lacquer and gold finishes to mark the launch of the new Initial. Line D Eternity Large fountain pen in black Dupont lacquer and satin-finish black. Sword articulated clip. Black 14-carat solid gold Wings nib. Plunger included. Available in ballpoint, rollerball and nib versions. Related refills: Ink catridges: 040112 Blue - 040110 Black - 040362 Red - 040363 Green - 040364 Turquoise Inkwells: 040165 Black - 040166 Royal Blue - 040167 Flamboyant Red - 040168 Spring Green - 040169 Turquoise - 040170 Midnight Blue`, en: `S.T. Dupont enriches its Line D Eternity and Initial collections with two sophisticated new colors: black lacquer and black finishes for both models, and white lacquer and gold finishes to mark the launch of the new Initial. Line D Eternity Large fountain pen in black Dupont lacquer and satin-finish black. Sword articulated clip. Black 14-carat solid gold Wings nib. Plunger included. Available in ballpoint, rollerball and nib versions. Related refills: Ink catridges: 040112 Blue - 040110 Black - 040362 Red - 040363 Green - 040364 Turquoise Inkwells: 040165 Black - 040166 Royal Blue - 040167 Flamboyant Red - 040168 Spring Green - 040169 Turquoise - 040170 Midnight Blue` },
    collection: `Eternity`,
    categorySlug: "escrita",
    image: `/products/eternity/420216L.webp`,
    variants: [
      { sku: `420216L`, name: { pt: `Rollerball pen XL — Preto`, en: `Rollerball pen XL — Black` }, priceCents: 91540, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/eternity/420216L.webp`, images: [`/products/eternity/420216L.webp`, `/products/eternity/420216L-2.webp`, `/products/eternity/420216L-3.webp`, `/products/eternity/420216L-4.webp`] },
      { sku: `422216L`, name: { pt: `Rollerball pen XL — Preto`, en: `Rollerball pen XL — Black` }, priceCents: 73140, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/eternity/422216L.webp`, images: [`/products/eternity/422216L.webp`, `/products/eternity/422216L-2.webp`, `/products/eternity/422216L-3.webp`, `/products/eternity/422216L-4.webp`] },
      { sku: `425216L`, name: { pt: `Rollerball pen XL — Preto`, en: `Rollerball pen XL — Black` }, priceCents: 69000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/eternity/425216L.webp`, images: [`/products/eternity/425216L.webp`, `/products/eternity/425216L-2.webp`, `/products/eternity/425216L-3.webp`, `/products/eternity/425216L-4.webp`] },
      { sku: `422011XL`, name: { pt: `Rollerball pen XL — Índigo & Azul`, en: `Rollerball pen XL — Indigo Blue` }, priceCents: 109940, currency: "EUR", attributes: { color: { label: { pt: `Índigo & Azul`, en: `Indigo Blue` }, hex: ["#2c2c63", "#1f3c66"] } }, image: `/products/eternity/422011XL.webp`, images: [`/products/eternity/422011XL.webp`, `/products/eternity/422011XL-2.webp`, `/products/eternity/422011XL-3.webp`, `/products/eternity/422011XL-4.webp`] },
      { sku: `422008XL`, name: { pt: `Rollerball pen XL — Prata`, en: `Rollerball pen XL — Silver` }, priceCents: 100740, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/eternity/422008XL.webp`, images: [`/products/eternity/422008XL.webp`, `/products/eternity/422008XL-2.webp`, `/products/eternity/422008XL-3.webp`, `/products/eternity/422008XL-4.webp`] },
      { sku: `422221XL`, name: { pt: `Rollerball pen XL — Turquesa & Azul`, en: `Rollerball pen XL — Turquoise Blue` }, priceCents: 87400, currency: "EUR", attributes: { color: { label: { pt: `Turquesa & Azul`, en: `Turquoise Blue` }, hex: ["#3aaba6", "#1f3c66"] } }, image: `/products/eternity/422221XL.webp`, images: [`/products/eternity/422221XL.webp`, `/products/eternity/422221XL-2.webp`, `/products/eternity/422221XL-3.webp`, `/products/eternity/422221XL-4.webp`] },
      { sku: `422220XL`, name: { pt: `Rollerball pen XL — Preto`, en: `Rollerball pen XL — Black` }, priceCents: 87400, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/eternity/422220XL.webp`, images: [`/products/eternity/422220XL.webp`, `/products/eternity/422220XL-2.webp`, `/products/eternity/422220XL-3.webp`, `/products/eternity/422220XL-4.webp`] },
      { sku: `420011XL`, name: { pt: `Rollerball pen XL — Índigo & Azul`, en: `Rollerball pen XL — Indigo Blue` }, priceCents: 128340, currency: "EUR", attributes: { color: { label: { pt: `Índigo & Azul`, en: `Indigo Blue` }, hex: ["#2c2c63", "#1f3c66"] } }, image: `/products/eternity/420011XL.webp`, images: [`/products/eternity/420011XL.webp`, `/products/eternity/420011XL-2.webp`, `/products/eternity/420011XL-3.webp`, `/products/eternity/420011XL-4.webp`] },
      { sku: `420008XL`, name: { pt: `Rollerball pen XL — Prata`, en: `Rollerball pen XL — Silver` }, priceCents: 119140, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/eternity/420008XL.webp`, images: [`/products/eternity/420008XL.webp`, `/products/eternity/420008XL-2.webp`, `/products/eternity/420008XL-3.webp`, `/products/eternity/420008XL-4.webp`] },
      { sku: `420221XL`, name: { pt: `Rollerball pen XL — Turquesa & Azul`, en: `Rollerball pen XL — Turquoise Blue` }, priceCents: 100740, currency: "EUR", attributes: { color: { label: { pt: `Turquesa & Azul`, en: `Turquoise Blue` }, hex: ["#3aaba6", "#1f3c66"] } }, image: `/products/eternity/420221XL.webp`, images: [`/products/eternity/420221XL.webp`, `/products/eternity/420221XL-2.webp`, `/products/eternity/420221XL-3.webp`, `/products/eternity/420221XL-4.webp`] }
    ],
  },
  {
    slug: `d-initial-fender`,
    name: { pt: `Ballpoint pen`, en: `Ballpoint pen` },
    description: { pt: `For the second time, S.T. Dupont and Fender® are working together to create a rock line that combines the expertise of both companies. The Biggy, Slimmy and Twiggy lighters, as well as the Initial ballpoint pen take on the silhouette of a Stratocaster® on a black lacquer background. Initial ballpoint pen in glossy black lacquer decorated with a Stratoscaster® guitar. Chrome finishes. Made in China. Related refills: 040853 Blue - 040854 Black - 040358 Pink - 040359 Red - 040360 Green - 040361 Turquoise`, en: `For the second time, S.T. Dupont and Fender® are working together to create a rock line that combines the expertise of both companies. The Biggy, Slimmy and Twiggy lighters, as well as the Initial ballpoint pen take on the silhouette of a Stratocaster® on a black lacquer background. Initial ballpoint pen in glossy black lacquer decorated with a Stratoscaster® guitar. Chrome finishes. Made in China. Related refills: 040853 Blue - 040854 Black - 040358 Pink - 040359 Red - 040360 Green - 040361 Turquoise` },
    collection: `Initial`,
    categorySlug: "escrita",
    image: `/products/d-initial-fender/275175.webp`,
    variants: [
      { sku: `275175`, name: { pt: `Ballpoint pen — Preto`, en: `Ballpoint pen — Black` }, priceCents: 41400, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/d-initial-fender/275175.webp`, images: [`/products/d-initial-fender/275175.webp`, `/products/d-initial-fender/275175-2.webp`, `/products/d-initial-fender/275175-3.webp`, `/products/d-initial-fender/275175-4.webp`] }
    ],
  },
  {
    slug: `eternity-fender`,
    name: { pt: `Rollerball large`, en: `Rollerball large` },
    description: { pt: `Fender, the most famous guitar brand opens a shop in the lively Harajuku district of Tokyo. On this occasion, and for the second time, S.T. Dupont and Fender collaborate, imagining a rock line inspired by the know-how of both houses, as well as Japan. With his work of the lacquer inspired by kintsugi, but also the return of an ancient know-how with gold powder applied by hand, this collaboration makes its own the creativity of the musical universe. Box composed of a large Line D Eternity pen and a Médiator necklace. Line D Eternity large black and gold Kintsugi fountain pen with gold powder glitter. Golden finishes. Hood with gold lacquered Fender® logo. Stratocaster® guitar neck clip. Plume Wings in solid gold 14 carats. Piston included. Available in roller and feather version. Associated refills: Ink tags: 040112 Blue - 040110 Black - 040362 Red - 040363 Green - 040364 Turquoise Inkwell: 040165 Black - 040166 Royal Blue - 040167 Flamboyant Red - 040168 Spring Green - 040169 Turquoise - 040170 Midnight Blue This fountain pen comes with a medium nib, for a writing size of apporox. 0.55 mm. Médiator necklace engraved with two Stratoscaster® guitars and adjustable chain in three different lengths 80/85/90 cm.`, en: `Fender, the most famous guitar brand opens a shop in the lively Harajuku district of Tokyo. On this occasion, and for the second time, S.T. Dupont and Fender collaborate, imagining a rock line inspired by the know-how of both houses, as well as Japan. With his work of the lacquer inspired by kintsugi, but also the return of an ancient know-how with gold powder applied by hand, this collaboration makes its own the creativity of the musical universe. Box composed of a large Line D Eternity pen and a Médiator necklace. Line D Eternity large black and gold Kintsugi fountain pen with gold powder glitter. Golden finishes. Hood with gold lacquered Fender® logo. Stratocaster® guitar neck clip. Plume Wings in solid gold 14 carats. Piston included. Available in roller and feather version. Associated refills: Ink tags: 040112 Blue - 040110 Black - 040362 Red - 040363 Green - 040364 Turquoise Inkwell: 040165 Black - 040166 Royal Blue - 040167 Flamboyant Red - 040168 Spring Green - 040169 Turquoise - 040170 Midnight Blue This fountain pen comes with a medium nib, for a writing size of apporox. 0.55 mm. Médiator necklace engraved with two Stratoscaster® guitars and adjustable chain in three different lengths 80/85/90 cm.` },
    collection: `Eternity`,
    categorySlug: "escrita",
    image: `/products/eternity-fender/420176L.webp`,
    variants: [
      { sku: `420176L`, name: { pt: `Rollerball large — Azul & Fender`, en: `Rollerball large — Blue Fender` }, priceCents: 201940, currency: "EUR", attributes: { color: { label: { pt: `Azul & Fender`, en: `Blue Fender` }, hex: ["#1f3c66"] } }, image: `/products/eternity-fender/420176L.webp`, images: [`/products/eternity-fender/420176L.webp`, `/products/eternity-fender/420176L-2.webp`, `/products/eternity-fender/420176L-3.webp`, `/products/eternity-fender/420176L-4.webp`] },
      { sku: `422176L`, name: { pt: `Rollerball large — Azul & Fender`, en: `Rollerball large — Blue Fender` }, priceCents: 183540, currency: "EUR", attributes: { color: { label: { pt: `Azul & Fender`, en: `Blue Fender` }, hex: ["#1f3c66"] } }, image: `/products/eternity-fender/422176L.webp`, images: [`/products/eternity-fender/422176L.webp`, `/products/eternity-fender/422176L-2.webp`, `/products/eternity-fender/422176L-3.webp`, `/products/eternity-fender/422176L-4.webp`] },
      { sku: `420175L`, name: { pt: `Rollerball large — Preto`, en: `Rollerball large — Black` }, priceCents: 201940, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/eternity-fender/420175L.webp`, images: [`/products/eternity-fender/420175L.webp`, `/products/eternity-fender/420175L-2.webp`, `/products/eternity-fender/420175L-3.webp`, `/products/eternity-fender/420175L-4.webp`] },
      { sku: `422175L`, name: { pt: `Rollerball large — Preto`, en: `Rollerball large — Black` }, priceCents: 183540, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/eternity-fender/422175L.webp`, images: [`/products/eternity-fender/422175L.webp`, `/products/eternity-fender/422175L-2.webp`, `/products/eternity-fender/422175L-3.webp`, `/products/eternity-fender/422175L-4.webp`] }
    ],
  },
  {
    slug: `inkwell`,
    name: { pt: `1 refill box`, en: `1 refill box` },
    description: { pt: `50mL inkwell in royal blue. Erasable ink. Compatible with piston ref. 408812.`, en: `50mL inkwell in royal blue. Erasable ink. Compatible with piston ref. 408812.` },
    collection: `Tinteiro`,
    categorySlug: "escrita",
    image: `/products/inkwell/040170.webp`,
    variants: [
      { sku: `040170`, name: { pt: `1 refill box — Escuro & Azul`, en: `1 refill box — Dark Blue` }, priceCents: 4508, currency: "EUR", attributes: { color: { label: { pt: `Escuro & Azul`, en: `Dark Blue` }, hex: ["#2a2d34", "#1f3c66"] } }, image: `/products/inkwell/040170.webp`, images: [`/products/inkwell/040170.webp`, `/products/inkwell/040170-2.webp`] },
      { sku: `040169`, name: { pt: `1 refill box — Turquesa & Azul`, en: `1 refill box — Turquoise Blue` }, priceCents: 4508, currency: "EUR", attributes: { color: { label: { pt: `Turquesa & Azul`, en: `Turquoise Blue` }, hex: ["#3aaba6", "#1f3c66"] } }, image: `/products/inkwell/040169.webp`, images: [`/products/inkwell/040169.webp`, `/products/inkwell/040169-2.webp`] },
      { sku: `040168`, name: { pt: `1 refill box — Verde`, en: `1 refill box — Green` }, priceCents: 4508, currency: "EUR", attributes: { color: { label: { pt: `Verde`, en: `Green` }, hex: ["#3a5040"] } }, image: `/products/inkwell/040168.webp`, images: [`/products/inkwell/040168.webp`, `/products/inkwell/040168-2.webp`] },
      { sku: `040167`, name: { pt: `1 refill box — Vermelho`, en: `1 refill box — Red` }, priceCents: 4508, currency: "EUR", attributes: { color: { label: { pt: `Vermelho`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/inkwell/040167.webp`, images: [`/products/inkwell/040167.webp`, `/products/inkwell/040167-2.webp`] },
      { sku: `040166`, name: { pt: `1 refill box — Real & Azul`, en: `1 refill box — Royal Blue` }, priceCents: 4508, currency: "EUR", attributes: { color: { label: { pt: `Real & Azul`, en: `Royal Blue` }, hex: ["#2845a3", "#1f3c66"] } }, image: `/products/inkwell/040166.webp`, images: [`/products/inkwell/040166.webp`, `/products/inkwell/040166-2.webp`] },
      { sku: `040165`, name: { pt: `1 refill box — Preto`, en: `1 refill box — Black` }, priceCents: 4508, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/inkwell/040165.webp`, images: [`/products/inkwell/040165.webp`, `/products/inkwell/040165-2.webp`] }
    ],
  },
  {
    slug: `eternity-snake-skin`,
    name: { pt: `Rollerball pen large`, en: `Rollerball pen large` },
    description: { pt: `The Snake Skin line slips its original snakeskin guilloche under a bold green lacquer or the more classic black. A way of honoring the traditional and exclusive method of guilloche under lacquer, as well as the soul of this reptile to which the lunar year 2025 is dedicated. Line D Eternity large fountain pen in black snake-scale guilloche lacquer. Cap with snake-scale guilloche and palladium finish. Articulated Sword clasp. Solid 14-carat gold nib. Piston included. Available in ball, roller and nib versions. Associated refills : * Ink cartridges: 040112 Blue - 040110 Black - 040362 Red - 040363 Green - 040364 Turquoise * Ink fountains: 040165 Intense Black - 040166 Royal Blue -040167 Blazing Red - 040168 Spring Green - 040169 Turquoise - 040170 Midnight Blue This fountain pen comes with a medium nib, for a writing size of apporox. 0.55 mm.`, en: `The Snake Skin line slips its original snakeskin guilloche under a bold green lacquer or the more classic black. A way of honoring the traditional and exclusive method of guilloche under lacquer, as well as the soul of this reptile to which the lunar year 2025 is dedicated. Line D Eternity large fountain pen in black snake-scale guilloche lacquer. Cap with snake-scale guilloche and palladium finish. Articulated Sword clasp. Solid 14-carat gold nib. Piston included. Available in ball, roller and nib versions. Associated refills : * Ink cartridges: 040112 Blue - 040110 Black - 040362 Red - 040363 Green - 040364 Turquoise * Ink fountains: 040165 Intense Black - 040166 Royal Blue -040167 Blazing Red - 040168 Spring Green - 040169 Turquoise - 040170 Midnight Blue This fountain pen comes with a medium nib, for a writing size of apporox. 0.55 mm.` },
    collection: `Eternity`,
    categorySlug: "escrita",
    image: `/products/eternity-snake-skin/422079L.webp`,
    variants: [
      { sku: `422079L`, name: { pt: `Rollerball pen large — Preto`, en: `Rollerball pen large — Black` }, priceCents: 91540, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/eternity-snake-skin/422079L.webp`, images: [`/products/eternity-snake-skin/422079L.webp`, `/products/eternity-snake-skin/422079L-2.webp`, `/products/eternity-snake-skin/422079L-3.webp`, `/products/eternity-snake-skin/422079L-4.webp`] },
      { sku: `420079L`, name: { pt: `Rollerball pen large — Preto`, en: `Rollerball pen large — Black` }, priceCents: 109940, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/eternity-snake-skin/420079L.webp`, images: [`/products/eternity-snake-skin/420079L.webp`, `/products/eternity-snake-skin/420079L-2.webp`, `/products/eternity-snake-skin/420079L-3.webp`, `/products/eternity-snake-skin/420079L-4.webp`] }
    ],
  },
  {
    slug: `eternity-monogram-1872`,
    name: { pt: `Fountain Pen Large`, en: `Fountain Pen Large` },
    description: { pt: `Craftsmanship in metal, as well as the art of lacquer and coated leather, showcase the expertise of S.T. Dupont in the Monogram 1872 collection. Well-rooted in their time, the pieces in the collection all feature the new S.T. Dupont logo—upright, determined, and proud. Line D Eternity large fountain pen with guilloche craftsmanship and gold finishes from the Monogram 1872 collection. Articulated Sword clip. 14-carat gold nib. Piston included. Available in ballpoint, rollerball, and fountain pen versions. Ink cartridges: 040112 Blue - 040110 Black - 040362 Red - 040363 Green - 040364 Turquoise This fountain pen comes with a medium nib, for a writing size of apporox. 0.55 mm.`, en: `Craftsmanship in metal, as well as the art of lacquer and coated leather, showcase the expertise of S.T. Dupont in the Monogram 1872 collection. Well-rooted in their time, the pieces in the collection all feature the new S.T. Dupont logo—upright, determined, and proud. Line D Eternity large fountain pen with guilloche craftsmanship and gold finishes from the Monogram 1872 collection. Articulated Sword clip. 14-carat gold nib. Piston included. Available in ballpoint, rollerball, and fountain pen versions. Ink cartridges: 040112 Blue - 040110 Black - 040362 Red - 040363 Green - 040364 Turquoise This fountain pen comes with a medium nib, for a writing size of apporox. 0.55 mm.` },
    collection: `Eternity`,
    categorySlug: "escrita",
    image: `/products/eternity-monogram-1872/425023M.webp`,
    variants: [
      { sku: `425023M`, name: { pt: `Fountain Pen Large — Preto`, en: `Fountain Pen Large — Black` }, priceCents: 73140, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/eternity-monogram-1872/425023M.webp`, images: [`/products/eternity-monogram-1872/425023M.webp`, `/products/eternity-monogram-1872/425023M-2.webp`, `/products/eternity-monogram-1872/425023M-3.webp`, `/products/eternity-monogram-1872/425023M-4.webp`] },
      { sku: `425021M`, name: { pt: `Fountain Pen Large — Prata`, en: `Fountain Pen Large — Silver` }, priceCents: 73140, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/eternity-monogram-1872/425021M.webp`, images: [`/products/eternity-monogram-1872/425021M.webp`, `/products/eternity-monogram-1872/425021M-2.webp`, `/products/eternity-monogram-1872/425021M-3.webp`, `/products/eternity-monogram-1872/425021M-4.webp`] },
      { sku: `420020L`, name: { pt: `Fountain Pen Large — Dourado`, en: `Fountain Pen Large — Golden` }, priceCents: 100740, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/eternity-monogram-1872/420020L.webp`, images: [`/products/eternity-monogram-1872/420020L.webp`, `/products/eternity-monogram-1872/420020L-2.webp`, `/products/eternity-monogram-1872/420020L-3.webp`, `/products/eternity-monogram-1872/420020L-4.webp`] }
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
      { sku: `405032`, name: { pt: `Défi Millennium — Néon & Verde`, en: `Defi millennium — Neon Green` }, priceCents: 30820, currency: "EUR", attributes: { color: { label: { pt: `Néon & Verde`, en: `Neon Green` }, hex: ["#aef043", "#3a5040"] } }, image: `/products/defi-millennium/405032.webp`, images: [`/products/defi-millennium/405032.webp`, `/products/defi-millennium/405032-2.webp`, `/products/defi-millennium/405032-3.webp`, `/products/defi-millennium/405032-4.webp`] }
    ],
  },
  {
    slug: `eternity-fire-x`,
    name: { pt: `Rollerball pen Medium`, en: `Rollerball pen Medium` },
    description: { pt: `Inspired by the X-Bag, one of the bags from the leather goods collection developed this season by S.T. Dupont, Fire X presents its reinterpretation of the iconic flame tip on the classics of the House. Line D Eternity medium fountain pen in glossy black Dupont lacquer and palladium finishes. Orfèvre guilloche Fire X engraved cap. Solid 14-carat gold nib. Piston included. Available in ballpoint, rollerball, and fountain pen versions. Associated refills: 040112 Blue - 040110 Black - 040362 Red - 040363 Green - 040364 Turquoise. This fountain pen comes with a medium nib, for a writing size of apporox. 0.55 mm.`, en: `Inspired by the X-Bag, one of the bags from the leather goods collection developed this season by S.T. Dupont, Fire X presents its reinterpretation of the iconic flame tip on the classics of the House. Line D Eternity medium fountain pen in glossy black Dupont lacquer and palladium finishes. Orfèvre guilloche Fire X engraved cap. Solid 14-carat gold nib. Piston included. Available in ballpoint, rollerball, and fountain pen versions. Associated refills: 040112 Blue - 040110 Black - 040362 Red - 040363 Green - 040364 Turquoise. This fountain pen comes with a medium nib, for a writing size of apporox. 0.55 mm.` },
    collection: `Eternity`,
    categorySlug: "escrita",
    image: `/products/eternity-fire-x/422070M.webp`,
    variants: [
      { sku: `422070M`, name: { pt: `Rollerball pen Medium — Preto`, en: `Rollerball pen Medium — Black` }, priceCents: 73140, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/eternity-fire-x/422070M.webp`, images: [`/products/eternity-fire-x/422070M.webp`, `/products/eternity-fire-x/422070M-2.webp`, `/products/eternity-fire-x/422070M-3.webp`, `/products/eternity-fire-x/422070M-4.webp`] },
      { sku: `420070M`, name: { pt: `Rollerball pen Medium — Preto`, en: `Rollerball pen Medium — Black` }, priceCents: 91540, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/eternity-fire-x/420070M.webp`, images: [`/products/eternity-fire-x/420070M.webp`, `/products/eternity-fire-x/420070M-2.webp`, `/products/eternity-fire-x/420070M-3.webp`, `/products/eternity-fire-x/420070M-4.webp`] }
    ],
  },
  {
    slug: `liberte-2`,
    name: { pt: `Ballpoint pen`, en: `Ballpoint pen` },
    description: { pt: `Liberty Ballpoint Pen In lavender lacquer and palladium finishes New "Sword" clip. Made in our workshops in Faverges, France. Associated refills: 040853 Blue 040854 Black 040358 Pink 040359 Red 040360 Green 040361 Turquoise`, en: `Liberty Ballpoint Pen In lavender lacquer and palladium finishes New "Sword" clip. Made in our workshops in Faverges, France. Associated refills: 040853 Blue 040854 Black 040358 Pink 040359 Red 040360 Green 040361 Turquoise` },
    collection: `Liberté`,
    categorySlug: "escrita",
    image: `/products/liberte-2/465226G.webp`,
    variants: [
      { sku: `465226G`, name: { pt: `Ballpoint pen — Coral & Rosa`, en: `Ballpoint pen — Coral & Pink` }, priceCents: 48300, currency: "EUR", attributes: { color: { label: { pt: `Coral & Rosa`, en: `Coral & Pink` }, hex: ["#e2675a", "#e7a3b1"] } }, image: `/products/liberte-2/465226G.webp`, images: [`/products/liberte-2/465226G.webp`, `/products/liberte-2/465226G-2.webp`, `/products/liberte-2/465226G-3.webp`, `/products/liberte-2/465226G-4.webp`] },
      { sku: `465225G`, name: { pt: `Ballpoint pen — Lilás & Prata`, en: `Ballpoint pen — Lilac & Silver` }, priceCents: 48300, currency: "EUR", attributes: { color: { label: { pt: `Lilás & Prata`, en: `Lilac & Silver` }, hex: ["#b89dcb", "#c9ccd1"] } }, image: `/products/liberte-2/465225G.webp`, images: [`/products/liberte-2/465225G.webp`, `/products/liberte-2/465225G-2.webp`, `/products/liberte-2/465225G-3.webp`, `/products/liberte-2/465225G-4.webp`] },
      { sku: `465223G`, name: { pt: `Ballpoint pen — Branco`, en: `Ballpoint pen — White` }, priceCents: 48300, currency: "EUR", attributes: { color: { label: { pt: `Branco`, en: `White` }, hex: ["#f3efe6"] } }, image: `/products/liberte-2/465223G.webp`, images: [`/products/liberte-2/465223G.webp`, `/products/liberte-2/465223G-2.webp`, `/products/liberte-2/465223G-3.webp`, `/products/liberte-2/465223G-4.webp`] },
      { sku: `465222G`, name: { pt: `Ballpoint pen — Azul & Índigo & Azul`, en: `Ballpoint pen — Blue & Indigo Blue` }, priceCents: 48300, currency: "EUR", attributes: { color: { label: { pt: `Azul & Índigo & Azul`, en: `Blue & Indigo Blue` }, hex: ["#1f3c66", "#2c2c63"] } }, image: `/products/liberte-2/465222G.webp`, images: [`/products/liberte-2/465222G.webp`, `/products/liberte-2/465222G-2.webp`, `/products/liberte-2/465222G-3.webp`, `/products/liberte-2/465222G-4.webp`] }
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
    name: { pt: `Document holder`, en: `Document holder` },
    description: { pt: `Elegant and functional, this briefcase in technical canvas and structured leather is designed for active men. Its organized interior provides secure storage for a computer and documents. Lightweight and resistant, it combines technical sophistication and refinement for everyday use, in the office or on the move. Available in khaki or black. Made in Italy`, en: `Elegant and functional, this briefcase in technical canvas and structured leather is designed for active men. Its organized interior provides secure storage for a computer and documents. Lightweight and resistant, it combines technical sophistication and refinement for everyday use, in the office or on the move. Available in khaki or black. Made in Italy` },
    collection: `Défi Explorer`,
    categorySlug: "pele",
    image: `/products/defi-explorer/1IC132NK1.webp`,
    variants: [
      { sku: `1IC132NK1`, name: { pt: `Document holder — Verde & Caqui`, en: `Document holder — Green & Khaki` }, priceCents: 119140, currency: "EUR", attributes: { color: { label: { pt: `Verde & Caqui`, en: `Green & Khaki` }, hex: ["#3a5040", "#7a7a4b"] } }, image: `/products/defi-explorer/1IC132NK1.webp`, images: [`/products/defi-explorer/1IC132NK1.webp`, `/products/defi-explorer/1IC132NK1-2.webp`, `/products/defi-explorer/1IC132NK1-3.webp`, `/products/defi-explorer/1IC132NK1-4.webp`] }
    ],
  },
  {
    slug: `atelier`,
    name: { pt: `Small cigar pouch`, en: `Small cigar pouch` },
    description: { pt: `Ideal for daily use, this blue carrier-leather-leather-leather-leather carrier embossed from the crocrow pattern is patinated by hand. It is the ideal functional ally for the modern businessman. It has a large main compartment: a computer compartment, a medium pocket, two pockets for pens and lighter storage. - 1 computer compartment, - 1 medium pocket, - 2 locations for pens, -1 location for lighters`, en: `Ideal for daily use, this blue carrier-leather-leather-leather-leather carrier embossed from the crocrow pattern is patinated by hand. It is the ideal functional ally for the modern businessman. It has a large main compartment: a computer compartment, a medium pocket, two pockets for pens and lighter storage. - 1 computer compartment, - 1 medium pocket, - 2 locations for pens, -1 location for lighters` },
    collection: `Atelier`,
    categorySlug: "pele",
    image: `/products/atelier/141452.webp`,
    variants: [
      { sku: `141452`, name: { pt: `Small cigar pouch — Castanho`, en: `Small cigar pouch — Brown` }, priceCents: 165140, currency: "EUR", attributes: { color: { label: { pt: `Castanho`, en: `Brown` }, hex: ["#6b4a2a"] } }, image: `/products/atelier/141452.webp`, images: [`/products/atelier/141452.webp`, `/products/atelier/141452-2.webp`, `/products/atelier/141452-3.webp`, `/products/atelier/141452-4.webp`] },
      { sku: `191575`, name: { pt: `Small cigar pouch — Preto`, en: `Small cigar pouch — Black` }, priceCents: 312340, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/atelier/191575.webp`, images: [`/products/atelier/191575.webp`, `/products/atelier/191575-2.webp`, `/products/atelier/191575-3.webp`, `/products/atelier/191575-4.webp`] },
      { sku: `191574`, name: { pt: `Small cigar pouch — Preto`, en: `Small cigar pouch — Black` }, priceCents: 339940, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/atelier/191574.webp`, images: [`/products/atelier/191574.webp`, `/products/atelier/191574-2.webp`, `/products/atelier/191574-3.webp`, `/products/atelier/191574-4.webp`] },
      { sku: `191375`, name: { pt: `Small cigar pouch — Azul`, en: `Small cigar pouch — Blue` }, priceCents: 312340, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/atelier/191375.webp`, images: [`/products/atelier/191375.webp`, `/products/atelier/191375-2.webp`, `/products/atelier/191375-3.webp`, `/products/atelier/191375-4.webp`] },
      { sku: `191374`, name: { pt: `Small cigar pouch — Azul`, en: `Small cigar pouch — Blue` }, priceCents: 339940, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/atelier/191374.webp`, images: [`/products/atelier/191374.webp`, `/products/atelier/191374-2.webp`, `/products/atelier/191374-3.webp`, `/products/atelier/191374-4.webp`] },
      { sku: `190576`, name: { pt: `Small cigar pouch — Preto`, en: `Small cigar pouch — Black` }, priceCents: 45540, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/atelier/190576.webp`, images: [`/products/atelier/190576.webp`, `/products/atelier/190576-2.webp`] }
    ],
  },
  {
    slug: `lighter-accessories`,
    name: { pt: `Twiggy`, en: `Twiggy` },
    description: { pt: `The lighter case is the perfect accessory to protect your lighter while enhancing it with timeless style, adorned with the famous “D” of the house and crafted from smooth black leather, it combines style and protection with elegance and modernity, it is available for classic S.T. Dupont models, black lighter case for Le Grand Dupont, made of smooth calf leather, with an embossed “D” signature, personalization available.`, en: `The lighter case is the perfect accessory to protect your lighter while enhancing it with timeless style, adorned with the famous “D” of the house and crafted from smooth black leather, it combines style and protection with elegance and modernity, it is available for classic S.T. Dupont models, black lighter case for Le Grand Dupont, made of smooth calf leather, with an embossed “D” signature, personalization available.` },
    collection: `Estojos para Isqueiros`,
    categorySlug: "pele",
    image: null,
    variants: [
      { sku: `160030T`, name: { pt: `Twiggy — S.t. & Dupont`, en: `Twiggy — S.T. Dupont` }, priceCents: 9108, currency: "EUR", attributes: { color: { label: { pt: `S.t. & Dupont`, en: `S.T. Dupont` }, hex: ["#7a7d83"] } }, image: undefined },
      { sku: `160028S`, name: { pt: `Twiggy — S.t. & Dupont`, en: `Twiggy — S.T. Dupont` }, priceCents: 9108, currency: "EUR", attributes: { color: { label: { pt: `S.t. & Dupont`, en: `S.T. Dupont` }, hex: ["#7a7d83"] } }, image: `/products/lighter-accessories/160028S-2.webp`, images: [`/products/lighter-accessories/160028S-2.webp`] },
      { sku: `160023C`, name: { pt: `Twiggy — S.t. & Dupont`, en: `Twiggy — S.T. Dupont` }, priceCents: 9108, currency: "EUR", attributes: { color: { label: { pt: `S.t. & Dupont`, en: `S.T. Dupont` }, hex: ["#7a7d83"] } }, image: `/products/lighter-accessories/160023C.webp`, images: [`/products/lighter-accessories/160023C.webp`, `/products/lighter-accessories/160023C-2.webp`] },
      { sku: `160014C`, name: { pt: `Twiggy — S.t. & Dupont`, en: `Twiggy — S.T. Dupont` }, priceCents: 9108, currency: "EUR", attributes: { color: { label: { pt: `S.t. & Dupont`, en: `S.T. Dupont` }, hex: ["#7a7d83"] } }, image: `/products/lighter-accessories/160014C.webp`, images: [`/products/lighter-accessories/160014C.webp`, `/products/lighter-accessories/160014C-2.webp`] }
    ],
  },
  {
    slug: `lighter-case`,
    name: { pt: `Ligne 2`, en: `Ligne 2` },
    description: { pt: `The lighter case is the perfect accessory to protect your lighter while enhancing it with timeless style, adorned with the famous "D" of the house and crafted from smooth black leather, it combines style and protection with elegance and modernity, it is available for classic S.T. Dupont models, black lighter case for Ligne 2, smooth calf leather, with embossed "D" signature, personalization available.`, en: `The lighter case is the perfect accessory to protect your lighter while enhancing it with timeless style, adorned with the famous "D" of the house and crafted from smooth black leather, it combines style and protection with elegance and modernity, it is available for classic S.T. Dupont models, black lighter case for Ligne 2, smooth calf leather, with embossed "D" signature, personalization available.` },
    collection: `Estojo de Isqueiro`,
    categorySlug: "pele",
    image: `/products/lighter-case/160016C.webp`,
    variants: [
      { sku: `160016C`, name: { pt: `Ligne 2 — S.t. & Dupont`, en: `Ligne 2 — S.T. Dupont` }, priceCents: 9108, currency: "EUR", attributes: { color: { label: { pt: `S.t. & Dupont`, en: `S.T. Dupont` }, hex: ["#7a7d83"] } }, image: `/products/lighter-case/160016C.webp`, images: [`/products/lighter-case/160016C.webp`, `/products/lighter-case/160016C-2.webp`] },
      { sku: `160025B`, name: { pt: `Ligne 2 — S.t. & Dupont`, en: `Ligne 2 — S.T. Dupont` }, priceCents: 9108, currency: "EUR", attributes: { color: { label: { pt: `S.t. & Dupont`, en: `S.T. Dupont` }, hex: ["#7a7d83"] } }, image: `/products/lighter-case/160025B.webp`, images: [`/products/lighter-case/160025B.webp`, `/products/lighter-case/160025B-2.webp`] }
    ],
  },
  {
    slug: `pen-case`,
    name: { pt: `2 pen case`, en: `2 pen case` },
    description: { pt: `Modern and practical, the new collection of office accessories proposed by S.T. Dupont once again highlights the expertise of the House with the aim of creating a collection of functional and refined pen cases. Rigid case in black calf leather and golden mesh inspired by the Firehead guilloche. Can contain two writing instruments of medium or large size`, en: `Modern and practical, the new collection of office accessories proposed by S.T. Dupont once again highlights the expertise of the House with the aim of creating a collection of functional and refined pen cases. Rigid case in black calf leather and golden mesh inspired by the Firehead guilloche. Can contain two writing instruments of medium or large size` },
    collection: `Estojo de Caneta`,
    categorySlug: "pele",
    image: `/products/pen-case/007162.webp`,
    variants: [
      { sku: `007162`, name: { pt: `2 pen case — Ouro`, en: `2 pen case — Gold` }, priceCents: 29900, currency: "EUR", attributes: { color: { label: { pt: `Ouro`, en: `Gold` }, hex: ["#c8a24a"] } }, image: `/products/pen-case/007162.webp`, images: [`/products/pen-case/007162.webp`, `/products/pen-case/007162-2.webp`, `/products/pen-case/007162-3.webp`] },
      { sku: `007161`, name: { pt: `2 pen case — Prata`, en: `2 pen case — Silver` }, priceCents: 29900, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/pen-case/007161.webp`, images: [`/products/pen-case/007161.webp`, `/products/pen-case/007161-2.webp`, `/products/pen-case/007161-3.webp`] }
    ],
  },
  {
    slug: `fuente`,
    name: { pt: `totebag`, en: `totebag` },
    description: { pt: `Tote Bag - Coated canvas and smooth calf leather decorated with the multicolor X monogram and Opus X Fuente crest. Includes two bottle holders, one large zip pocket, and an integrated key holder.`, en: `Tote Bag - Coated canvas and smooth calf leather decorated with the multicolor X monogram and Opus X Fuente crest. Includes two bottle holders, one large zip pocket, and an integrated key holder.` },
    collection: `Fuente`,
    categorySlug: "pele",
    image: `/products/fuente/1FU153BK1.webp`,
    variants: [
      { sku: `1FU153BK1`, name: { pt: `totebag — Multicolor`, en: `totebag — Multicolor` }, priceCents: 247940, currency: "EUR", attributes: { color: { label: { pt: `Multicolor`, en: `Multicolor` }, hex: ["#7a7d83"] } }, image: `/products/fuente/1FU153BK1.webp`, images: [`/products/fuente/1FU153BK1.webp`, `/products/fuente/1FU153BK1-2.webp`, `/products/fuente/1FU153BK1-3.webp`] }
    ],
  },
  {
    slug: `camera-bag-fuente`,
    name: { pt: `camerabag`, en: `camerabag` },
    description: { pt: `Camera Bag - Coated canvas and smooth calf leather decorated with the multicolor X monogram and Opus X Fuente crest. Two large compartments, two lighter compartments, one cigar cutter compartment, adjustable shoulder strap.`, en: `Camera Bag - Coated canvas and smooth calf leather decorated with the multicolor X monogram and Opus X Fuente crest. Two large compartments, two lighter compartments, one cigar cutter compartment, adjustable shoulder strap.` },
    collection: `Camera bag`,
    categorySlug: "pele",
    image: `/products/camera-bag-fuente/1FU183BK1.webp`,
    variants: [
      { sku: `1FU183BK1`, name: { pt: `camerabag — Multicolor`, en: `camerabag — Multicolor` }, priceCents: 155940, currency: "EUR", attributes: { color: { label: { pt: `Multicolor`, en: `Multicolor` }, hex: ["#7a7d83"] } }, image: `/products/camera-bag-fuente/1FU183BK1.webp`, images: [`/products/camera-bag-fuente/1FU183BK1.webp`, `/products/camera-bag-fuente/1FU183BK1-2.webp`, `/products/camera-bag-fuente/1FU183BK1-3.webp`, `/products/camera-bag-fuente/1FU183BK1-4.webp`] }
    ],
  },
  {
    slug: `firehead`,
    name: { pt: `Shoulder bag`, en: `Shoulder bag` },
    description: { pt: `Functional and stylish card holder, easily slips into your pocket with its 6 slots and central pocket that can hold your credit cards, transport tickets and business cards. Designed in embossed leather, its Firehead pattern. The leather used on all models of the Firehead collection is certified by the Leather Working Group.`, en: `Functional and stylish card holder, easily slips into your pocket with its 6 slots and central pocket that can hold your credit cards, transport tickets and business cards. Designed in embossed leather, its Firehead pattern. The leather used on all models of the Firehead collection is certified by the Leather Working Group.` },
    collection: `Firehead`,
    categorySlug: "pele",
    image: `/products/firehead/161113.webp`,
    variants: [
      { sku: `161113`, name: { pt: `Shoulder bag — Preto`, en: `Shoulder bag — Black` }, priceCents: 27140, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/firehead/161113.webp`, images: [`/products/firehead/161113.webp`, `/products/firehead/161113-2.webp`] },
      { sku: `161109`, name: { pt: `Shoulder bag — Preto`, en: `Shoulder bag — Black` }, priceCents: 20700, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/firehead/161109.webp`, images: [`/products/firehead/161109.webp`, `/products/firehead/161109-2.webp`, `/products/firehead/161109-3.webp`, `/products/firehead/161109-4.webp`] },
      { sku: `160011`, name: { pt: `Shoulder bag — Preto`, en: `Shoulder bag — Black` }, priceCents: 100740, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/firehead/160011.webp`, images: [`/products/firehead/160011.webp`, `/products/firehead/160011-2.webp`, `/products/firehead/160011-3.webp`, `/products/firehead/160011-4.webp`] }
    ],
  },
  {
    slug: `neo-capsule`,
    name: { pt: `Backpack`, en: `Backpack` },
    description: { pt: `Black full-grain calf leather backpack. Several functional interior compartments, including one for a laptop. Pocket at the front. The entire Neo capsule collection is LWG certified.`, en: `Black full-grain calf leather backpack. Several functional interior compartments, including one for a laptop. Pocket at the front. The entire Neo capsule collection is LWG certified.` },
    collection: `Neo Capsule`,
    categorySlug: "pele",
    image: `/products/neo-capsule/181240.webp`,
    variants: [
      { sku: `181240`, name: { pt: `Backpack — Preto`, en: `Backpack — Black` }, priceCents: 137540, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/neo-capsule/181240.webp`, images: [`/products/neo-capsule/181240.webp`, `/products/neo-capsule/181240-2.webp`, `/products/neo-capsule/181240-3.webp`, `/products/neo-capsule/181240-4.webp`] }
    ],
  },
  {
    slug: `cufflink`,
    name: { pt: `Diamond head`, en: `Diamond head` },
    description: { pt: `Square cufflinks adorned with diamond tips, inspired by the iconic lighters from the S.T. Dupont collection.`, en: `Square cufflinks adorned with diamond tips, inspired by the iconic lighters from the S.T. Dupont collection.` },
    collection: `Botões de Punho`,
    categorySlug: "acessorios",
    image: `/products/cufflink/005568.webp`,
    variants: [
      { sku: `005568`, name: { pt: `Diamond head — Prata`, en: `Diamond head — Silver` }, priceCents: 24380, currency: "EUR", attributes: { color: { label: { pt: `Prata`, en: `Silver` }, hex: ["#c9ccd1"] } }, image: `/products/cufflink/005568.webp`, images: [`/products/cufflink/005568.webp`] }
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
    name: { pt: `Leather case`, en: `Leather case` },
    description: { pt: `2-cigar case, black with gold embossing. max 24.5 mm.`, en: `2-cigar case, black with gold embossing. max 24.5 mm.` },
    collection: `Estojo Duplo de Charuto`,
    categorySlug: "acessorios",
    image: `/products/2-cigar-case/183245.webp`,
    variants: [
      { sku: `183245`, name: { pt: `Leather case — Fúcsia & Rosa & Rosa`, en: `Leather case — Fuchsia Pink & Pink` }, priceCents: 28980, currency: "EUR", attributes: { color: { label: { pt: `Fúcsia & Rosa & Rosa`, en: `Fuchsia Pink & Pink` }, hex: ["#c43f7a", "#e7a3b1"] } }, image: `/products/2-cigar-case/183245.webp`, images: [`/products/2-cigar-case/183245.webp`, `/products/2-cigar-case/183245-2.webp`] },
      { sku: `183267`, name: { pt: `Leather case — Azul & Índigo & Azul`, en: `Leather case — Blue & Indigo Blue` }, priceCents: 28980, currency: "EUR", attributes: { color: { label: { pt: `Azul & Índigo & Azul`, en: `Blue & Indigo Blue` }, hex: ["#1f3c66", "#2c2c63"] } }, image: `/products/2-cigar-case/183267.webp`, images: [`/products/2-cigar-case/183267.webp`, `/products/2-cigar-case/183267-2.webp`] },
      { sku: `183260`, name: { pt: `Leather case — Preto`, en: `Leather case — Black` }, priceCents: 28980, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/2-cigar-case/183260.webp`, images: [`/products/2-cigar-case/183260.webp`, `/products/2-cigar-case/183260-2.webp`, `/products/2-cigar-case/183260-3.webp`] },
      { sku: `183250`, name: { pt: `Leather case — Preto`, en: `Leather case — Black` }, priceCents: 28980, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/2-cigar-case/183250.webp`, images: [`/products/2-cigar-case/183250.webp`, `/products/2-cigar-case/183250-2.webp`, `/products/2-cigar-case/183250-3.webp`, `/products/2-cigar-case/183250-4.webp`] },
      { sku: `183249`, name: { pt: `Leather case — Verde & Caqui`, en: `Leather case — Green & Khaki` }, priceCents: 28980, currency: "EUR", attributes: { color: { label: { pt: `Verde & Caqui`, en: `Green & Khaki` }, hex: ["#3a5040", "#7a7a4b"] } }, image: `/products/2-cigar-case/183249.webp`, images: [`/products/2-cigar-case/183249.webp`, `/products/2-cigar-case/183249-2.webp`, `/products/2-cigar-case/183249-3.webp`, `/products/2-cigar-case/183249-4.webp`] },
      { sku: `183240`, name: { pt: `Leather case — Preto`, en: `Leather case — Black` }, priceCents: 29900, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/2-cigar-case/183240.webp`, images: [`/products/2-cigar-case/183240.webp`, `/products/2-cigar-case/183240-2.webp`, `/products/2-cigar-case/183240-3.webp`] },
      { sku: `183243`, name: { pt: `Leather case — Turquesa & Azul`, en: `Leather case — Turquoise Blue` }, priceCents: 28980, currency: "EUR", attributes: { color: { label: { pt: `Turquesa & Azul`, en: `Turquoise Blue` }, hex: ["#3aaba6", "#1f3c66"] } }, image: `/products/2-cigar-case/183243.webp`, images: [`/products/2-cigar-case/183243.webp`, `/products/2-cigar-case/183243-2.webp`, `/products/2-cigar-case/183243-3.webp`] },
      { sku: `183269`, name: { pt: `Leather case — Verde & Caqui`, en: `Leather case — Green & Khaki` }, priceCents: 29900, currency: "EUR", attributes: { color: { label: { pt: `Verde & Caqui`, en: `Green & Khaki` }, hex: ["#3a5040", "#7a7a4b"] } }, image: `/products/2-cigar-case/183269.webp`, images: [`/products/2-cigar-case/183269.webp`, `/products/2-cigar-case/183269-2.webp`, `/products/2-cigar-case/183269-3.webp`] }
    ],
  },
  {
    slug: `3-cigar-case`,
    name: { pt: `Leather case`, en: `Leather case` },
    description: { pt: `Designed to bring new energy to our classics - and to our everyday lives, the pieces in the Fluo collection are inspired by the latest trends in fashion and automotive design. With Fluo, the legendary S.T. Dupont's legendary lacquer takes all the liberty in the world, becoming pop and light, for lives that are always on the move, dynamic and whirring. 3-cigar case in fluorescent orange grained calf leather with matt black metal base.`, en: `Designed to bring new energy to our classics - and to our everyday lives, the pieces in the Fluo collection are inspired by the latest trends in fashion and automotive design. With Fluo, the legendary S.T. Dupont's legendary lacquer takes all the liberty in the world, becoming pop and light, for lives that are always on the move, dynamic and whirring. 3-cigar case in fluorescent orange grained calf leather with matt black metal base.` },
    collection: `Estojo Triplo de Charuto`,
    categorySlug: "acessorios",
    image: `/products/3-cigar-case/183364.webp`,
    variants: [
      { sku: `183364`, name: { pt: `Leather case — Azul & Turquesa & Azul`, en: `Leather case — Blue & Turquoise Blue` }, priceCents: 29900, currency: "EUR", attributes: { color: { label: { pt: `Azul & Turquesa & Azul`, en: `Blue & Turquoise Blue` }, hex: ["#1f3c66", "#3aaba6"] } }, image: `/products/3-cigar-case/183364.webp`, images: [`/products/3-cigar-case/183364.webp`, `/products/3-cigar-case/183364-2.webp`, `/products/3-cigar-case/183364-3.webp`, `/products/3-cigar-case/183364-4.webp`] },
      { sku: `183349`, name: { pt: `Leather case — Verde & Caqui`, en: `Leather case — Green & Khaki` }, priceCents: 32200, currency: "EUR", attributes: { color: { label: { pt: `Verde & Caqui`, en: `Green & Khaki` }, hex: ["#3a5040", "#7a7a4b"] } }, image: `/products/3-cigar-case/183349.webp`, images: [`/products/3-cigar-case/183349.webp`, `/products/3-cigar-case/183349-2.webp`, `/products/3-cigar-case/183349-3.webp`, `/products/3-cigar-case/183349-4.webp`] },
      { sku: `183340`, name: { pt: `Leather case — Preto`, en: `Leather case — Black` }, priceCents: 32660, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/3-cigar-case/183340.webp`, images: [`/products/3-cigar-case/183340.webp`, `/products/3-cigar-case/183340-2.webp`, `/products/3-cigar-case/183340-3.webp`, `/products/3-cigar-case/183340-4.webp`] },
      { sku: `183417`, name: { pt: `Leather case — Néon & Verde`, en: `Leather case — Neon Green` }, priceCents: 32660, currency: "EUR", attributes: { color: { label: { pt: `Néon & Verde`, en: `Neon Green` }, hex: ["#aef043", "#3a5040"] } }, image: `/products/3-cigar-case/183417.webp`, images: [`/products/3-cigar-case/183417.webp`, `/products/3-cigar-case/183417-2.webp`] },
      { sku: `183419`, name: { pt: `Leather case — Néon & Laranja`, en: `Leather case — Neon Orange` }, priceCents: 32660, currency: "EUR", attributes: { color: { label: { pt: `Néon & Laranja`, en: `Neon Orange` }, hex: ["#aef043", "#c4642d"] } }, image: `/products/3-cigar-case/183419.webp`, images: [`/products/3-cigar-case/183419.webp`, `/products/3-cigar-case/183419-2.webp`, `/products/3-cigar-case/183419-3.webp`] }
    ],
  },
  {
    slug: `cigar-case-2`,
    name: { pt: `Leather case`, en: `Leather case` },
    description: { pt: `Simple black grained cigar case with chrome. - Adjustable case for one cigar - Maximum diameter of 24.5 mm`, en: `Simple black grained cigar case with chrome. - Adjustable case for one cigar - Maximum diameter of 24.5 mm` },
    collection: `Estojo de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cigar-case-2/183160.webp`,
    variants: [
      { sku: `183160`, name: { pt: `Leather case — Preto`, en: `Leather case — Black` }, priceCents: 20700, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/cigar-case-2/183160.webp`, images: [`/products/cigar-case-2/183160.webp`, `/products/cigar-case-2/183160-2.webp`, `/products/cigar-case-2/183160-3.webp`, `/products/cigar-case-2/183160-4.webp`] }
    ],
  },
  {
    slug: `2-cigar-case-monogram-1872`,
    name: { pt: `Coated canvas case`, en: `Coated canvas case` },
    description: { pt: `Craftsmanship in metal, as well as the art of lacquer and coated leather, showcase the expertise of S.T. Dupont in the Monogram 1872 collection. Well-rooted in their time, the pieces in the collection all feature the new S.T. Dupont logo—upright, determined, and proud. Coated canvas case for 2 cigars decorated with the Monogram 1872 pattern in burgundy and a gold metal base.`, en: `Craftsmanship in metal, as well as the art of lacquer and coated leather, showcase the expertise of S.T. Dupont in the Monogram 1872 collection. Well-rooted in their time, the pieces in the collection all feature the new S.T. Dupont logo—upright, determined, and proud. Coated canvas case for 2 cigars decorated with the Monogram 1872 pattern in burgundy and a gold metal base.` },
    collection: `Estojo Duplo de Charuto`,
    categorySlug: "acessorios",
    image: `/products/2-cigar-case-monogram-1872/183479.webp`,
    variants: [
      { sku: `183479`, name: { pt: `Coated canvas case — Preto`, en: `Coated canvas case — Black` }, priceCents: 29900, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/2-cigar-case-monogram-1872/183479.webp`, images: [`/products/2-cigar-case-monogram-1872/183479.webp`, `/products/2-cigar-case-monogram-1872/183479-2.webp`, `/products/2-cigar-case-monogram-1872/183479-3.webp`] },
      { sku: `183478`, name: { pt: `Coated canvas case — Bordeaux`, en: `Coated canvas case — Burgundy` }, priceCents: 29900, currency: "EUR", attributes: { color: { label: { pt: `Bordeaux`, en: `Burgundy` }, hex: ["#5e1f1f"] } }, image: `/products/2-cigar-case-monogram-1872/183478.webp`, images: [`/products/2-cigar-case-monogram-1872/183478.webp`, `/products/2-cigar-case-monogram-1872/183478-2.webp`, `/products/2-cigar-case-monogram-1872/183478-3.webp`] }
    ],
  },
  {
    slug: `ligne-2-3`,
    name: { pt: `Lighter case`, en: `Lighter case` },
    description: { pt: `pBlack smooth cowhide leather lighter case, accommodates a Line 2 lighter. Embossed with the S.T. Dupont logo and blue, white, red stitching./p`, en: `pBlack smooth cowhide leather lighter case, accommodates a Line 2 lighter. Embossed with the S.T. Dupont logo and blue, white, red stitching./p` },
    collection: `Ligne 2`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-3/183070.webp`,
    variants: [
      { sku: `183070`, name: { pt: `Lighter case — Preto`, en: `Lighter case — Black` }, priceCents: 19780, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/ligne-2-3/183070.webp`, images: [`/products/ligne-2-3/183070.webp`, `/products/ligne-2-3/183070-2.webp`, `/products/ligne-2-3/183070-3.webp`] }
    ],
  },
  {
    slug: `line-d`,
    name: { pt: `line d`, en: `line d` },
    description: { pt: `pBlack smooth leather lighter case. Compatible with Le Grand ST Dupont and Line 2 lighters./p`, en: `pBlack smooth leather lighter case. Compatible with Le Grand ST Dupont and Line 2 lighters./p` },
    collection: `Line D`,
    categorySlug: "escrita",
    image: `/products/line-d/180024.webp`,
    variants: [
      { sku: `180024`, name: { pt: `line d — Preto`, en: `line d — Black` }, priceCents: 20700, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d/180024.webp`, images: [`/products/line-d/180024.webp`] },
      { sku: `180124`, name: { pt: `line d — Castanho`, en: `line d — Brown` }, priceCents: 20700, currency: "EUR", attributes: { color: { label: { pt: `Castanho`, en: `Brown` }, hex: ["#6b4a2a"] } }, image: `/products/line-d/180124.webp`, images: [`/products/line-d/180124.webp`] }
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
    name: { pt: `Leather case`, en: `Leather case` },
    description: { pt: `Designed to bring new energy to our classics - and to our everyday lives, the pieces in the Fluo collection are inspired by the latest trends in fashion and automotive design. With Fluo, the legendary S.T. Dupont's legendary lacquer takes all the liberty in the world, becoming pop and light, for lives that are always on the move, dynamic and whirring. 3-cigar case in fluorescent blue grained calf leather with matt black metal base.`, en: `Designed to bring new energy to our classics - and to our everyday lives, the pieces in the Fluo collection are inspired by the latest trends in fashion and automotive design. With Fluo, the legendary S.T. Dupont's legendary lacquer takes all the liberty in the world, becoming pop and light, for lives that are always on the move, dynamic and whirring. 3-cigar case in fluorescent blue grained calf leather with matt black metal base.` },
    collection: `3 cigar case_Fluo`,
    categorySlug: "acessorios",
    image: `/products/3-cigar-case-fluo/183416.webp`,
    variants: [
      { sku: `183416`, name: { pt: `Leather case — Néon & Azul`, en: `Leather case — Neon Blue` }, priceCents: 32660, currency: "EUR", attributes: { color: { label: { pt: `Néon & Azul`, en: `Neon Blue` }, hex: ["#aef043", "#1f3c66"] } }, image: `/products/3-cigar-case-fluo/183416.webp`, images: [`/products/3-cigar-case-fluo/183416.webp`, `/products/3-cigar-case-fluo/183416-2.webp`] }
    ],
  },


  // === BEGIN EN STORE IMPORTS (en.st-dupont.com) ===

  {
    slug: `misc-2`,
    name: { pt: `Red lighter flint (x8)`, en: `Red lighter flint (x8)` },
    description: { pt: `Red lighter flint. Sold in packs of 8. For the following lighters: Ligne Initial, Le Grand S.T. Dupont, Ligne 8, Line-D, Mon Dupont, Liberté.`, en: `Red lighter flint. Sold in packs of 8. For the following lighters: Ligne Initial, Le Grand S.T. Dupont, Ligne 8, Line-D, Mon Dupont, Liberté.` },
    collection: `Misc`,
    categorySlug: "acessorios",
    image: `/products/misc-2/900650.webp`,
    variants: [
      { sku: `900650`, name: { pt: `Red lighter flint (x8) — Variante 0650`, en: `Red lighter flint (x8) — Variant 0650` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Variante 0650`, en: `Variant 0650` }, hex: ["#7a7d83"] } }, image: `/products/misc-2/900650.webp`, images: [`/products/misc-2/900650.webp`] },
    ],
  },
  {
    slug: `2-cigar-case-dragon`,
    name: { pt: `Leather case`, en: `Leather case` },
    description: { pt: `This S.T. Dupont cigar case features a golden metal base and a burgundy calf leather exterior. The dragon design is illustrated on the cigar case, winding around the burgundy case.`, en: `This S.T. Dupont cigar case features a golden metal base and a burgundy calf leather exterior. The dragon design is illustrated on the cigar case, winding around the burgundy case.` },
    collection: `Dragon`,
    categorySlug: "acessorios",
    image: `/products/2-cigar-case-dragon/183276.webp`,
    variants: [
      { sku: `183276`, name: { pt: `Leather case — Burgundy`, en: `Leather case — Burgundy` }, priceCents: 24000, currency: "EUR", attributes: { color: { label: { pt: `Burgundy`, en: `Burgundy` }, hex: ["#7d2b27"] } }, image: `/products/2-cigar-case-dragon/183276.webp`, images: [`/products/2-cigar-case-dragon/183276.webp`, `/products/2-cigar-case-dragon/183276-2.webp`, `/products/2-cigar-case-dragon/183276-3.webp`] },
      { sku: `183271`, name: { pt: `Leather case — Burgundy`, en: `Leather case — Burgundy` }, priceCents: 23000, currency: "EUR", attributes: { color: { label: { pt: `Burgundy`, en: `Burgundy` }, hex: ["#7d2b27"] } }, image: `/products/2-cigar-case-dragon/183271.webp`, images: [`/products/2-cigar-case-dragon/183271.webp`, `/products/2-cigar-case-dragon/183271-2.webp`, `/products/2-cigar-case-dragon/183271-3.webp`] },
      { sku: `183270`, name: { pt: `Leather case — Black`, en: `Leather case — Black` }, priceCents: 23000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/2-cigar-case-dragon/183270.webp`, images: [`/products/2-cigar-case-dragon/183270.webp`, `/products/2-cigar-case-dragon/183270-2.webp`, `/products/2-cigar-case-dragon/183270-3.webp`] },
      { sku: `183273`, name: { pt: `Leather case — Honey`, en: `Leather case — Honey` }, priceCents: 23000, currency: "EUR", attributes: { color: { label: { pt: `Honey`, en: `Honey` }, hex: ["#7a7d83"] } }, image: `/products/2-cigar-case-dragon/183273.webp`, images: [`/products/2-cigar-case-dragon/183273.webp`, `/products/2-cigar-case-dragon/183273-2.webp`, `/products/2-cigar-case-dragon/183273-3.webp`] },
      { sku: `183274`, name: { pt: `Leather case — Royal Blue`, en: `Leather case — Royal Blue` }, priceCents: 23000, currency: "EUR", attributes: { color: { label: { pt: `Royal Blue`, en: `Royal Blue` }, hex: ["#1f3c66"] } }, image: `/products/2-cigar-case-dragon/183274.webp`, images: [`/products/2-cigar-case-dragon/183274.webp`, `/products/2-cigar-case-dragon/183274-2.webp`, `/products/2-cigar-case-dragon/183274-3.webp`] },
    ],
  },
  {
    slug: `2-cigar-case-monogram-1872-2`,
    name: { pt: `Coated canvas case`, en: `Coated canvas case` },
    description: { pt: `Craftsmanship in metal, as well as the art of lacquer and coated leather, showcase the expertise of S.T. Dupont in the Monogram 1872 collection. Well-rooted in their time, the pieces in the collection all feature the new S.T. Dupont logo—upright, determined, and proud. Coated canvas case for 2 cigars decorated with the Monogram 1872 pattern in gray and a silver metal base.`, en: `Craftsmanship in metal, as well as the art of lacquer and coated leather, showcase the expertise of S.T. Dupont in the Monogram 1872 collection. Well-rooted in their time, the pieces in the collection all feature the new S.T. Dupont logo—upright, determined, and proud. Coated canvas case for 2 cigars decorated with the Monogram 1872 pattern in gray and a silver metal base.` },
    collection: `Monogram 1872`,
    categorySlug: "acessorios",
    image: `/products/2-cigar-case-monogram-1872-2/183480.webp`,
    variants: [
      { sku: `183480`, name: { pt: `Coated canvas case — Light Gray`, en: `Coated canvas case — Light Gray` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Light Gray`, en: `Light Gray` }, hex: ["#7a7d83"] } }, image: `/products/2-cigar-case-monogram-1872-2/183480.webp`, images: [`/products/2-cigar-case-monogram-1872-2/183480.webp`, `/products/2-cigar-case-monogram-1872-2/183480-2.webp`, `/products/2-cigar-case-monogram-1872-2/183480-3.webp`] },
    ],
  },
  {
    slug: `ashtray-2`,
    name: { pt: `Porcelain`, en: `Porcelain` },
    description: { pt: `Porcelain ashtray. The iconic S.T. Dupont dragon is illustrated on the body of this bordeaux-colored accessory.`, en: `Porcelain ashtray. The iconic S.T. Dupont dragon is illustrated on the body of this bordeaux-colored accessory.` },
    collection: `Ashtray`,
    categorySlug: "acessorios",
    image: `/products/ashtray-2/006486.webp`,
    variants: [
      { sku: `006486`, name: { pt: `Porcelain — Burgundy`, en: `Porcelain — Burgundy` }, priceCents: 45500, currency: "EUR", attributes: { color: { label: { pt: `Burgundy`, en: `Burgundy` }, hex: ["#7d2b27"] } }, image: `/products/ashtray-2/006486.webp`, images: [`/products/ashtray-2/006486.webp`, `/products/ashtray-2/006486-2.webp`, `/products/ashtray-2/006486-3.webp`] },
      { sku: `006487`, name: { pt: `Porcelain — Black`, en: `Porcelain — Black` }, priceCents: 45500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/ashtray-2/006487.webp`, images: [`/products/ashtray-2/006487.webp`, `/products/ashtray-2/006487-2.webp`, `/products/ashtray-2/006487-3.webp`] },
    ],
  },
  {
    slug: `ashtray-fender`,
    name: { pt: `Porcelain`, en: `Porcelain` },
    description: { pt: `Fender®, the most famous guitar brand in Tokyo, is opening a boutique in the vibrant Harajuku area. On this occasion, and for the second time, S.T. Dupont and Fender® collaborate, imagining a rock line inspired by the know-how of both houses, as well as Japan. With his work of the lacquer inspired by kintsugi, but also the return of an ancient know-how with gold powder applied by hand, this collaboration makes its own the creativity of the musical universe. Fender pattern ashtray® Glossy lacquer finish black. Hand painted gold finish on the grooves.`, en: `Fender®, the most famous guitar brand in Tokyo, is opening a boutique in the vibrant Harajuku area. On this occasion, and for the second time, S.T. Dupont and Fender® collaborate, imagining a rock line inspired by the know-how of both houses, as well as Japan. With his work of the lacquer inspired by kintsugi, but also the return of an ancient know-how with gold powder applied by hand, this collaboration makes its own the creativity of the musical universe. Fender pattern ashtray® Glossy lacquer finish black. Hand painted gold finish on the grooves.` },
    collection: `Fender`,
    categorySlug: "acessorios",
    image: `/products/ashtray-fender/006425.webp`,
    variants: [
      { sku: `006425`, name: { pt: `Porcelain — Black`, en: `Porcelain — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/ashtray-fender/006425.webp`, images: [`/products/ashtray-fender/006425.webp`, `/products/ashtray-fender/006425-2.webp`, `/products/ashtray-fender/006425-3.webp`] },
    ],
  },
  {
    slug: `ashtray-fire-x-2`,
    name: { pt: `Porcelain`, en: `Porcelain` },
    description: { pt: `Inspired by the X-Bag, one of the bags from the leather goods collection developed this season by S.T. Dupont, Fire X presents its reinterpretation of the iconic flame tip on the classics of the House. Ashtray decorated with the Fire X motif. Porcelain ashtray.`, en: `Inspired by the X-Bag, one of the bags from the leather goods collection developed this season by S.T. Dupont, Fire X presents its reinterpretation of the iconic flame tip on the classics of the House. Ashtray decorated with the Fire X motif. Porcelain ashtray.` },
    collection: `Fire X`,
    categorySlug: "acessorios",
    image: `/products/ashtray-fire-x-2/006470.webp`,
    variants: [
      { sku: `006470`, name: { pt: `Porcelain — Black`, en: `Porcelain — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/ashtray-fire-x-2/006470.webp`, images: [`/products/ashtray-fire-x-2/006470.webp`, `/products/ashtray-fire-x-2/006470-2.webp`, `/products/ashtray-fire-x-2/006470-3.webp`] },
    ],
  },
  {
    slug: `ashtray-monogram-1872`,
    name: { pt: `Porcelain`, en: `Porcelain` },
    description: { pt: `Craftsmanship in metal, as well as the art of lacquer and coated leather, showcase the expertise of S.T. Dupont in the Monogram 1872 collection. Well-rooted in their time, the pieces in the collection all feature the new S.T. Dupont logo—upright, determined, and proud. Ashtray in porcelain decorated with the Monogram 1872 pattern in burgundy. Hand-painted notches and borders.`, en: `Craftsmanship in metal, as well as the art of lacquer and coated leather, showcase the expertise of S.T. Dupont in the Monogram 1872 collection. Well-rooted in their time, the pieces in the collection all feature the new S.T. Dupont logo—upright, determined, and proud. Ashtray in porcelain decorated with the Monogram 1872 pattern in burgundy. Hand-painted notches and borders.` },
    collection: `Monogram 1872`,
    categorySlug: "acessorios",
    image: `/products/ashtray-monogram-1872/006478.webp`,
    variants: [
      { sku: `006478`, name: { pt: `Porcelain — Burgundy`, en: `Porcelain — Burgundy` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Burgundy`, en: `Burgundy` }, hex: ["#7d2b27"] } }, image: `/products/ashtray-monogram-1872/006478.webp`, images: [`/products/ashtray-monogram-1872/006478.webp`, `/products/ashtray-monogram-1872/006478-2.webp`, `/products/ashtray-monogram-1872/006478-3.webp`] },
      { sku: `006479`, name: { pt: `Porcelain — Black`, en: `Porcelain — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/ashtray-monogram-1872/006479.webp`, images: [`/products/ashtray-monogram-1872/006479.webp`, `/products/ashtray-monogram-1872/006479-2.webp`, `/products/ashtray-monogram-1872/006479-3.webp`] },
      { sku: `006480`, name: { pt: `Porcelain — Light Gray`, en: `Porcelain — Light Gray` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Light Gray`, en: `Light Gray` }, hex: ["#7a7d83"] } }, image: `/products/ashtray-monogram-1872/006480.webp`, images: [`/products/ashtray-monogram-1872/006480.webp`, `/products/ashtray-monogram-1872/006480-2.webp`, `/products/ashtray-monogram-1872/006480-3.webp`] },
    ],
  },
  {
    slug: `box-10-refills`,
    name: { pt: `Turquoise Ink`, en: `Turquoise Ink` },
    description: { pt: `Medium black refills for Roller pens are sold in boxes of 10. For the following pens: Olympio, Défi, Liberté, Néo-classique large, Classique 2, D.Link/Caprice, Fidelio, Ellipsis, Montparnasse, Gatsby, Line D, Mon Dupont by Karl Lagerfeld, Streamline R, New Line D, D-Initial.`, en: `Medium black refills for Roller pens are sold in boxes of 10. For the following pens: Olympio, Défi, Liberté, Néo-classique large, Classique 2, D.Link/Caprice, Fidelio, Ellipsis, Montparnasse, Gatsby, Line D, Mon Dupont by Karl Lagerfeld, Streamline R, New Line D, D-Initial.` },
    collection: `Box-10-Refills`,
    categorySlug: "acessorios",
    image: `/products/box-10-refills/040831.webp`,
    variants: [
      { sku: `040831`, name: { pt: `Turquoise Ink — Black`, en: `Turquoise Ink — Black` }, priceCents: 7500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/box-10-refills/040831.webp`, images: [`/products/box-10-refills/040831.webp`] },
      { sku: `040110`, name: { pt: `Turquoise Ink — Black`, en: `Turquoise Ink — Black` }, priceCents: 6500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/box-10-refills/040110.webp`, images: [`/products/box-10-refills/040110.webp`] },
      { sku: `040843`, name: { pt: `Turquoise Ink — Black`, en: `Turquoise Ink — Black` }, priceCents: 9600, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/box-10-refills/040843.webp`, images: [`/products/box-10-refills/040843.webp`] },
      { sku: `040841`, name: { pt: `Turquoise Ink — Black`, en: `Turquoise Ink — Black` }, priceCents: 7500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/box-10-refills/040841.webp`, images: [`/products/box-10-refills/040841.webp`, `/products/box-10-refills/040841-2.webp`] },
      { sku: `040853`, name: { pt: `Turquoise Ink — Blue`, en: `Turquoise Ink — Blue` }, priceCents: 8600, currency: "EUR", attributes: { color: { label: { pt: `Blue`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/box-10-refills/040853.webp`, images: [`/products/box-10-refills/040853.webp`, `/products/box-10-refills/040853-2.webp`] },
      { sku: `040830`, name: { pt: `Turquoise Ink — Blue`, en: `Turquoise Ink — Blue` }, priceCents: 7500, currency: "EUR", attributes: { color: { label: { pt: `Blue`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/box-10-refills/040830.webp`, images: [`/products/box-10-refills/040830.webp`] },
      { sku: `040840`, name: { pt: `Turquoise Ink — Blue`, en: `Turquoise Ink — Blue` }, priceCents: 7500, currency: "EUR", attributes: { color: { label: { pt: `Blue`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/box-10-refills/040840.webp`, images: [`/products/box-10-refills/040840.webp`] },
      { sku: `040207`, name: { pt: `Turquoise Ink — White`, en: `Turquoise Ink — White` }, priceCents: 13100, currency: "EUR", attributes: { color: { label: { pt: `White`, en: `White` }, hex: ["#efeae0"] } }, image: `/products/box-10-refills/040207.webp`, images: [`/products/box-10-refills/040207.webp`] },
      { sku: `040206`, name: { pt: `Turquoise Ink — Black`, en: `Turquoise Ink — Black` }, priceCents: 9600, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/box-10-refills/040206.webp`, images: [`/products/box-10-refills/040206.webp`] },
      { sku: `040363`, name: { pt: `Turquoise Ink — Green`, en: `Turquoise Ink — Green` }, priceCents: 6500, currency: "EUR", attributes: { color: { label: { pt: `Green`, en: `Green` }, hex: ["#3b5d39"] } }, image: `/products/box-10-refills/040363.webp`, images: [`/products/box-10-refills/040363.webp`] },
      { sku: `040202`, name: { pt: `Turquoise Ink — Black`, en: `Turquoise Ink — Black` }, priceCents: 7500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/box-10-refills/040202.webp`, images: [`/products/box-10-refills/040202.webp`] },
      { sku: `040205`, name: { pt: `Turquoise Ink — Black`, en: `Turquoise Ink — Black` }, priceCents: 7600, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/box-10-refills/040205.webp`, images: [`/products/box-10-refills/040205.webp`] },
      { sku: `040203`, name: { pt: `Turquoise Ink — Black`, en: `Turquoise Ink — Black` }, priceCents: 7500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/box-10-refills/040203.webp`, images: [`/products/box-10-refills/040203.webp`] },
      { sku: `040201`, name: { pt: `Turquoise Ink — Black`, en: `Turquoise Ink — Black` }, priceCents: 9500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/box-10-refills/040201.webp`, images: [`/products/box-10-refills/040201.webp`] },
      { sku: `040208`, name: { pt: `Turquoise Ink — Black`, en: `Turquoise Ink — Black` }, priceCents: 15000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/box-10-refills/040208.webp`, images: [`/products/box-10-refills/040208.webp`] },
      { sku: `040362`, name: { pt: `Turquoise Ink — Red`, en: `Turquoise Ink — Red` }, priceCents: 6500, currency: "EUR", attributes: { color: { label: { pt: `Red`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/box-10-refills/040362.webp`, images: [`/products/box-10-refills/040362.webp`] },
      { sku: `040112`, name: { pt: `Turquoise Ink — Blue`, en: `Turquoise Ink — Blue` }, priceCents: 6500, currency: "EUR", attributes: { color: { label: { pt: `Blue`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/box-10-refills/040112.webp`, images: [`/products/box-10-refills/040112.webp`] },
      { sku: `040364`, name: { pt: `Turquoise Ink — Turquoise Blue`, en: `Turquoise Ink — Turquoise Blue` }, priceCents: 6500, currency: "EUR", attributes: { color: { label: { pt: `Turquoise Blue`, en: `Turquoise Blue` }, hex: ["#1f3c66"] } }, image: `/products/box-10-refills/040364.webp`, images: [`/products/box-10-refills/040364.webp`] },
    ],
  },
  {
    slug: `box-12-refills`,
    name: { pt: `Yellow`, en: `Yellow` },
    description: { pt: `Red gas refill. Sold in packs of 12. For the following lighters: Le Grand S.T. Dupont, Ligne 2 Cling (C16XXX), Ligne 2 Slim (017XXX), Ligne 1 Grand Model, Jéroboam Table Lighter, Cylindrical Table Lighter.`, en: `Red gas refill. Sold in packs of 12. For the following lighters: Le Grand S.T. Dupont, Ligne 2 Cling (C16XXX), Ligne 2 Slim (017XXX), Ligne 1 Grand Model, Jéroboam Table Lighter, Cylindrical Table Lighter.` },
    collection: `Box-12-Refills`,
    categorySlug: "acessorios",
    image: `/products/box-12-refills/000430.webp`,
    variants: [
      { sku: `000430`, name: { pt: `Yellow — Black`, en: `Yellow — Black` }, priceCents: 15500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/box-12-refills/000430.webp`, images: [`/products/box-12-refills/000430.webp`] },
      { sku: `000436`, name: { pt: `Yellow — Red`, en: `Yellow — Red` }, priceCents: 15500, currency: "EUR", attributes: { color: { label: { pt: `Red`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/box-12-refills/000436.webp`, images: [`/products/box-12-refills/000436.webp`] },
      { sku: `000433`, name: { pt: `Yellow — Green`, en: `Yellow — Green` }, priceCents: 26500, currency: "EUR", attributes: { color: { label: { pt: `Green`, en: `Green` }, hex: ["#3b5d39"] } }, image: `/products/box-12-refills/000433.webp`, images: [`/products/box-12-refills/000433.webp`] },
      { sku: `000444`, name: { pt: `Yellow — White`, en: `Yellow — White` }, priceCents: 8400, currency: "EUR", attributes: { color: { label: { pt: `White`, en: `White` }, hex: ["#efeae0"] } }, image: `/products/box-12-refills/000444.webp`, images: [`/products/box-12-refills/000444.webp`] },
      { sku: `000435`, name: { pt: `Yellow — Red`, en: `Yellow — Red` }, priceCents: 26500, currency: "EUR", attributes: { color: { label: { pt: `Red`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/box-12-refills/000435.webp`, images: [`/products/box-12-refills/000435.webp`] },
      { sku: `000432`, name: { pt: `Yellow — Yellow`, en: `Yellow — Yellow` }, priceCents: 26500, currency: "EUR", attributes: { color: { label: { pt: `Yellow`, en: `Yellow` }, hex: ["#7a7d83"] } }, image: `/products/box-12-refills/000432.webp`, images: [`/products/box-12-refills/000432.webp`] },
    ],
  },
  {
    slug: `box-5-refills`,
    name: { pt: `Royal blue ink`, en: `Royal blue ink` },
    description: { pt: `Leave your mark. In line with S.T.Dupont's craftsmanship and technology, this high-quality blue ink, specially designed to make writing smooth and easy, is presented in a S.T. Dupont glass bottle with a chrome cap adorned with the letter D.`, en: `Leave your mark. In line with S.T.Dupont's craftsmanship and technology, this high-quality blue ink, specially designed to make writing smooth and easy, is presented in a S.T. Dupont glass bottle with a chrome cap adorned with the letter D.` },
    collection: `Box-5-Refills`,
    categorySlug: "acessorios",
    image: `/products/box-5-refills/040161.webp`,
    variants: [
      { sku: `040161`, name: { pt: `Royal blue ink — Black`, en: `Royal blue ink — Black` }, priceCents: 21000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/box-5-refills/040161.webp`, images: [`/products/box-5-refills/040161.webp`] },
      { sku: `408811`, name: { pt: `Royal blue ink — Black`, en: `Royal blue ink — Black` }, priceCents: 15000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/box-5-refills/408811.webp`, images: [`/products/box-5-refills/408811.webp`] },
      { sku: `040159`, name: { pt: `Royal blue ink — Royal Blue`, en: `Royal blue ink — Royal Blue` }, priceCents: 21000, currency: "EUR", attributes: { color: { label: { pt: `Royal Blue`, en: `Royal Blue` }, hex: ["#1f3c66"] } }, image: `/products/box-5-refills/040159.webp`, images: [`/products/box-5-refills/040159.webp`] },
    ],
  },
  {
    slug: `box-7-refills`,
    name: { pt: `Turquoise ballpoint pen`, en: `Turquoise ballpoint pen` },
    description: { pt: `Turquoise medium ballpoint refill for all pens from the Défi, Liberté, Line D, Streamliner-R, and D-Initial Jet 8 Pen lines. Sold in boxes of 7.`, en: `Turquoise medium ballpoint refill for all pens from the Défi, Liberté, Line D, Streamliner-R, and D-Initial Jet 8 Pen lines. Sold in boxes of 7.` },
    collection: `Box-7-Refills`,
    categorySlug: "acessorios",
    image: `/products/box-7-refills/040359.webp`,
    variants: [
      { sku: `040359`, name: { pt: `Turquoise ballpoint pen — Red`, en: `Turquoise ballpoint pen — Red` }, priceCents: 9000, currency: "EUR", attributes: { color: { label: { pt: `Red`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/box-7-refills/040359.webp`, images: [`/products/box-7-refills/040359.webp`] },
      { sku: `040361`, name: { pt: `Turquoise ballpoint pen — Turquoise Blue`, en: `Turquoise ballpoint pen — Turquoise Blue` }, priceCents: 9000, currency: "EUR", attributes: { color: { label: { pt: `Turquoise Blue`, en: `Turquoise Blue` }, hex: ["#1f3c66"] } }, image: `/products/box-7-refills/040361.webp`, images: [`/products/box-7-refills/040361.webp`] },
    ],
  },
  {
    slug: `cigar-cutter-fender`,
    name: { pt: `Cigar Cutter · Fender`, en: `Cigar Cutter · Fender` },
    description: { pt: `Acessório S.T. Dupont — feito à mão nas oficinas de Faverges, herdeiro do savoir-faire da Maison desde 1872.`, en: `Acessório S.T. Dupont — feito à mão nas oficinas de Faverges, herdeiro do savoir-faire da Maison desde 1872.` },
    collection: `Fender`,
    categorySlug: "acessorios",
    image: `/products/cigar-cutter-fender/003445.webp`,
    variants: [
      { sku: `003445`, name: { pt: `Cigar Cutter · Fender — Black`, en: `Cigar Cutter · Fender — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/cigar-cutter-fender/003445.webp`, images: [`/products/cigar-cutter-fender/003445.webp`, `/products/cigar-cutter-fender/003445-2.webp`, `/products/cigar-cutter-fender/003445-3.webp`] },
    ],
  },
  {
    slug: `cigar-cutter-fire-x-2`,
    name: { pt: `Cigar Cutter · Fire X`, en: `Cigar Cutter · Fire X` },
    description: { pt: `Acessório S.T. Dupont — feito à mão nas oficinas de Faverges, herdeiro do savoir-faire da Maison desde 1872.`, en: `Acessório S.T. Dupont — feito à mão nas oficinas de Faverges, herdeiro do savoir-faire da Maison desde 1872.` },
    collection: `Fire X`,
    categorySlug: "acessorios",
    image: `/products/cigar-cutter-fire-x-2/003370.webp`,
    variants: [
      { sku: `003370`, name: { pt: `Cigar Cutter · Fire X — Black`, en: `Cigar Cutter · Fire X — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/cigar-cutter-fire-x-2/003370.webp`, images: [`/products/cigar-cutter-fire-x-2/003370.webp`, `/products/cigar-cutter-fire-x-2/003370-2.webp`, `/products/cigar-cutter-fire-x-2/003370-3.webp`] },
    ],
  },
  {
    slug: `cigar-cutter-monogram-1872-2`,
    name: { pt: `Cigar Cutter · Monogram 1872`, en: `Cigar Cutter · Monogram 1872` },
    description: { pt: `Acessório S.T. Dupont — feito à mão nas oficinas de Faverges, herdeiro do savoir-faire da Maison desde 1872.`, en: `Acessório S.T. Dupont — feito à mão nas oficinas de Faverges, herdeiro do savoir-faire da Maison desde 1872.` },
    collection: `Monogram 1872`,
    categorySlug: "acessorios",
    image: `/products/cigar-cutter-monogram-1872-2/003478.webp`,
    variants: [
      { sku: `003478`, name: { pt: `Cigar Cutter · Monogram 1872 — Burgundy`, en: `Cigar Cutter · Monogram 1872 — Burgundy` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Burgundy`, en: `Burgundy` }, hex: ["#7d2b27"] } }, image: `/products/cigar-cutter-monogram-1872-2/003478.webp`, images: [`/products/cigar-cutter-monogram-1872-2/003478.webp`, `/products/cigar-cutter-monogram-1872-2/003478-2.webp`, `/products/cigar-cutter-monogram-1872-2/003478-3.webp`] },
    ],
  },
  {
    slug: `cigar-humidor-2`,
    name: { pt: `Humidor 8 cigars`, en: `Humidor 8 cigars` },
    description: { pt: `We invite you to a journey towards excellence with our Prestige cigar humidor. Graceful design for true sector aficionados. Magnificently worked ayous wood on the outside of the humidor, and sipo wood on the inside. An accessory for long-term cigar storage, and it can hold up to 135 Corona cigars. Dimensions: 443x 273 x 20 mm Boveda large humidification kit (ref 087378) included with your cigar humidor.`, en: `We invite you to a journey towards excellence with our Prestige cigar humidor. Graceful design for true sector aficionados. Magnificently worked ayous wood on the outside of the humidor, and sipo wood on the inside. An accessory for long-term cigar storage, and it can hold up to 135 Corona cigars. Dimensions: 443x 273 x 20 mm Boveda large humidification kit (ref 087378) included with your cigar humidor.` },
    collection: `Cigar-humidor`,
    categorySlug: "acessorios",
    image: `/products/cigar-humidor-2/001319.webp`,
    variants: [
      { sku: `001319`, name: { pt: `Humidor 8 cigars — Black`, en: `Humidor 8 cigars — Black` }, priceCents: 171500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/cigar-humidor-2/001319.webp`, images: [`/products/cigar-humidor-2/001319.webp`, `/products/cigar-humidor-2/001319-2.webp`, `/products/cigar-humidor-2/001319-3.webp`] },
      { sku: `001317`, name: { pt: `Humidor 8 cigars — Green`, en: `Humidor 8 cigars — Green` }, priceCents: 85500, currency: "EUR", attributes: { color: { label: { pt: `Green`, en: `Green` }, hex: ["#3b5d39"] } }, image: `/products/cigar-humidor-2/001317.webp`, images: [`/products/cigar-humidor-2/001317.webp`, `/products/cigar-humidor-2/001317-2.webp`, `/products/cigar-humidor-2/001317-3.webp`] },
      { sku: `001356`, name: { pt: `Humidor 8 cigars — Khaki`, en: `Humidor 8 cigars — Khaki` }, priceCents: 43500, currency: "EUR", attributes: { color: { label: { pt: `Khaki`, en: `Khaki` }, hex: ["#3b5d39"] } }, image: `/products/cigar-humidor-2/001356.webp`, images: [`/products/cigar-humidor-2/001356.webp`, `/products/cigar-humidor-2/001356-2.webp`, `/products/cigar-humidor-2/001356-3.webp`] },
    ],
  },
  {
    slug: `cigarette-case-monogram-1872`,
    name: { pt: `Coated canvas case`, en: `Coated canvas case` },
    description: { pt: `Craftsmanship in metal, as well as the art of lacquer and coated leather, showcase the expertise of S.T. Dupont in the Monogram 1872 collection. Well-rooted in their time, the pieces in the collection all feature the new S.T. Dupont logo—upright, determined, and proud. Cigarette/cigarillo case in coated canvas decorated with the 1872 Monogram in burgundy and a gilded metal base for up to 8 cigarettes.`, en: `Craftsmanship in metal, as well as the art of lacquer and coated leather, showcase the expertise of S.T. Dupont in the Monogram 1872 collection. Well-rooted in their time, the pieces in the collection all feature the new S.T. Dupont logo—upright, determined, and proud. Cigarette/cigarillo case in coated canvas decorated with the 1872 Monogram in burgundy and a gilded metal base for up to 8 cigarettes.` },
    collection: `Monogram 1872`,
    categorySlug: "acessorios",
    image: `/products/cigarette-case-monogram-1872/183178.webp`,
    variants: [
      { sku: `183178`, name: { pt: `Coated canvas case — Burgundy`, en: `Coated canvas case — Burgundy` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Burgundy`, en: `Burgundy` }, hex: ["#7d2b27"] } }, image: `/products/cigarette-case-monogram-1872/183178.webp`, images: [`/products/cigarette-case-monogram-1872/183178.webp`, `/products/cigarette-case-monogram-1872/183178-2.webp`, `/products/cigarette-case-monogram-1872/183178-3.webp`] },
      { sku: `183179`, name: { pt: `Coated canvas case — Black`, en: `Coated canvas case — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/cigarette-case-monogram-1872/183179.webp`, images: [`/products/cigarette-case-monogram-1872/183179.webp`, `/products/cigarette-case-monogram-1872/183179-2.webp`, `/products/cigarette-case-monogram-1872/183179-3.webp`] },
      { sku: `183180`, name: { pt: `Coated canvas case — Light Gray`, en: `Coated canvas case — Light Gray` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Light Gray`, en: `Light Gray` }, hex: ["#7a7d83"] } }, image: `/products/cigarette-case-monogram-1872/183180.webp`, images: [`/products/cigarette-case-monogram-1872/183180.webp`, `/products/cigarette-case-monogram-1872/183180-2.webp`, `/products/cigarette-case-monogram-1872/183180-3.webp`] },
    ],
  },
  {
    slug: `cufflinks-monogram-1872`,
    name: { pt: `Cufflinks Metal`, en: `Cufflinks Metal` },
    description: { pt: `Craftsmanship in metal, as well as the art of lacquer and coated leather, showcase the expertise of S.T. Dupont in the Monogram 1872 collection. Well-rooted in their time, the pieces in the collection all feature the new S.T. Dupont logo—upright, determined, and proud. Chrome cufflinks engraved with the Monogram 1872 guilloche. Made in Germany.`, en: `Craftsmanship in metal, as well as the art of lacquer and coated leather, showcase the expertise of S.T. Dupont in the Monogram 1872 collection. Well-rooted in their time, the pieces in the collection all feature the new S.T. Dupont logo—upright, determined, and proud. Chrome cufflinks engraved with the Monogram 1872 guilloche. Made in Germany.` },
    collection: `Monogram 1872`,
    categorySlug: "acessorios",
    image: `/products/cufflinks-monogram-1872/005540.webp`,
    variants: [
      { sku: `005540`, name: { pt: `Cufflinks Metal — Golden`, en: `Cufflinks Metal — Golden` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Golden`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/cufflinks-monogram-1872/005540.webp`, images: [`/products/cufflinks-monogram-1872/005540.webp`, `/products/cufflinks-monogram-1872/005540-2.webp`, `/products/cufflinks-monogram-1872/005540-3.webp`] },
      { sku: `005541`, name: { pt: `Cufflinks Metal — Silver`, en: `Cufflinks Metal — Silver` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Silver`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/cufflinks-monogram-1872/005541.webp`, images: [`/products/cufflinks-monogram-1872/005541.webp`, `/products/cufflinks-monogram-1872/005541-2.webp`, `/products/cufflinks-monogram-1872/005541-3.webp`] },
    ],
  },
  {
    slug: `d-initial-dragon`,
    name: { pt: `Ballpoint pen`, en: `Ballpoint pen` },
    description: { pt: `Engraved on the body of the iconic D-Initial, the black S.T. Dupont dragon undulates on this chrome-colored writing instrument. Associated Refills: 040853 Blue 040854 Black 040358 Pink 040359 Red 040360 Green 040361 Turquoise`, en: `Engraved on the body of the iconic D-Initial, the black S.T. Dupont dragon undulates on this chrome-colored writing instrument. Associated Refills: 040853 Blue 040854 Black 040358 Pink 040359 Red 040360 Green 040361 Turquoise` },
    collection: `Dragon`,
    categorySlug: "escrita",
    image: `/products/d-initial-dragon/265026.webp`,
    variants: [
      { sku: `265026`, name: { pt: `Ballpoint pen — Golden`, en: `Ballpoint pen — Golden` }, priceCents: 23000, currency: "EUR", attributes: { color: { label: { pt: `Golden`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/d-initial-dragon/265026.webp`, images: [`/products/d-initial-dragon/265026.webp`, `/products/d-initial-dragon/265026-2.webp`, `/products/d-initial-dragon/265026-3.webp`, `/products/d-initial-dragon/265026-4.webp`] },
      { sku: `265027`, name: { pt: `Ballpoint pen — Silver`, en: `Ballpoint pen — Silver` }, priceCents: 23000, currency: "EUR", attributes: { color: { label: { pt: `Silver`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/d-initial-dragon/265027.webp`, images: [`/products/d-initial-dragon/265027.webp`, `/products/d-initial-dragon/265027-2.webp`, `/products/d-initial-dragon/265027-3.webp`, `/products/d-initial-dragon/265027-4.webp`] },
      { sku: `265028`, name: { pt: `Ballpoint pen — Burgundy`, en: `Ballpoint pen — Burgundy` }, priceCents: 18000, currency: "EUR", attributes: { color: { label: { pt: `Burgundy`, en: `Burgundy` }, hex: ["#7d2b27"] } }, image: `/products/d-initial-dragon/265028.webp`, images: [`/products/d-initial-dragon/265028.webp`, `/products/d-initial-dragon/265028-2.webp`, `/products/d-initial-dragon/265028-3.webp`, `/products/d-initial-dragon/265028-4.webp`] },
      { sku: `265029`, name: { pt: `Ballpoint pen — Honey`, en: `Ballpoint pen — Honey` }, priceCents: 18000, currency: "EUR", attributes: { color: { label: { pt: `Honey`, en: `Honey` }, hex: ["#7a7d83"] } }, image: `/products/d-initial-dragon/265029.webp`, images: [`/products/d-initial-dragon/265029.webp`, `/products/d-initial-dragon/265029-2.webp`, `/products/d-initial-dragon/265029-3.webp`, `/products/d-initial-dragon/265029-4.webp`] },
      { sku: `265030`, name: { pt: `Ballpoint pen — Royal Blue`, en: `Ballpoint pen — Royal Blue` }, priceCents: 18000, currency: "EUR", attributes: { color: { label: { pt: `Royal Blue`, en: `Royal Blue` }, hex: ["#1f3c66"] } }, image: `/products/d-initial-dragon/265030.webp`, images: [`/products/d-initial-dragon/265030.webp`, `/products/d-initial-dragon/265030-2.webp`, `/products/d-initial-dragon/265030-3.webp`, `/products/d-initial-dragon/265030-4.webp`] },
    ],
  },
  {
    slug: `eternity-2`,
    name: { pt: `Rollerball pen Medium`, en: `Rollerball pen Medium` },
    description: { pt: `"S.T. Dupont reinvents its iconic Line D writing instrument collection with Line D Eternity. The emblematic collection from S.T. Dupont has been reimagined in a more modern way, creating a unique writing experience. The refined and slender lines make the Line D Eternity collection decidedly contemporary. The new 'Sword' clip is a nod to the famous phrase by English author Edward Bulwer-Lytton: 'The pen is mightier than the sword,' echoing the heritage of the House, particularly the iconic Sword collection. The craftsmanship of Maison S.T. Dupont is expressed through this collection with timeless elegance. Line D Eternity is available in ballpoint, rollerball, and fountain pen versions, in both medium and large sizes. This medium-sized writing instrument is adorned with the new 'Wings' solid 14-carat gold nib. This goldsmith version of the Line D Eternity features the iconic Maison's diamond head guilloche pattern in palladium color. Line D Eternity is crafted in our workshops in Faverges, France. Associated refills: 040112 Blue 040110 Black 040362 Red 040363 Green 040364 Turquoise"`, en: `"S.T. Dupont reinvents its iconic Line D writing instrument collection with Line D Eternity. The emblematic collection from S.T. Dupont has been reimagined in a more modern way, creating a unique writing experience. The refined and slender lines make the Line D Eternity collection decidedly contemporary. The new 'Sword' clip is a nod to the famous phrase by English author Edward Bulwer-Lytton: 'The pen is mightier than the sword,' echoing the heritage of the House, particularly the iconic Sword collection. The craftsmanship of Maison S.T. Dupont is expressed through this collection with timeless elegance. Line D Eternity is available in ballpoint, rollerball, and fountain pen versions, in both medium and large sizes. This medium-sized writing instrument is adorned with the new 'Wings' solid 14-carat gold nib. This goldsmith version of the Line D Eternity features the iconic Maison's diamond head guilloche pattern in palladium color. Line D Eternity is crafted in our workshops in Faverges, France. Associated refills: 040112 Blue 040110 Black 040362 Red 040363 Green 040364 Turquoise"` },
    collection: `Eternity`,
    categorySlug: "escrita",
    image: `/products/eternity-2/425015L.webp`,
    variants: [
      { sku: `425015L`, name: { pt: `Rollerball pen Medium — Variante 015L`, en: `Rollerball pen Medium — Variant 015L` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Variante 015L`, en: `Variant 015L` }, hex: ["#7a7d83"] } }, image: `/products/eternity-2/425015L.webp`, images: [`/products/eternity-2/425015L.webp`, `/products/eternity-2/425015L-2.webp`, `/products/eternity-2/425015L-3.webp`, `/products/eternity-2/425015L-4.webp`] },
      { sku: `425017L`, name: { pt: `Rollerball pen Medium — Variante 017L`, en: `Rollerball pen Medium — Variant 017L` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Variante 017L`, en: `Variant 017L` }, hex: ["#7a7d83"] } }, image: `/products/eternity-2/425017L.webp`, images: [`/products/eternity-2/425017L.webp`, `/products/eternity-2/425017L-2.webp`, `/products/eternity-2/425017L-3.webp`, `/products/eternity-2/425017L-4.webp`] },
      { sku: `425220L`, name: { pt: `Rollerball pen Medium — Variante 220L`, en: `Rollerball pen Medium — Variant 220L` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Variante 220L`, en: `Variant 220L` }, hex: ["#7a7d83"] } }, image: `/products/eternity-2/425220L.webp`, images: [`/products/eternity-2/425220L.webp`, `/products/eternity-2/425220L-2.webp`, `/products/eternity-2/425220L-3.webp`, `/products/eternity-2/425220L-4.webp`] },
      { sku: `425014M`, name: { pt: `Rollerball pen Medium — Blue`, en: `Rollerball pen Medium — Blue` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Blue`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/eternity-2/425014M.webp`, images: [`/products/eternity-2/425014M.webp`, `/products/eternity-2/425014M-2.webp`, `/products/eternity-2/425014M-3.webp`, `/products/eternity-2/425014M-4.webp`] },
      { sku: `425016M`, name: { pt: `Rollerball pen Medium — Variante 016M`, en: `Rollerball pen Medium — Variant 016M` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Variante 016M`, en: `Variant 016M` }, hex: ["#7a7d83"] } }, image: `/products/eternity-2/425016M.webp`, images: [`/products/eternity-2/425016M.webp`, `/products/eternity-2/425016M-2.webp`, `/products/eternity-2/425016M-3.webp`, `/products/eternity-2/425016M-4.webp`] },
      { sku: `425018M`, name: { pt: `Rollerball pen Medium — Variante 018M`, en: `Rollerball pen Medium — Variant 018M` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Variante 018M`, en: `Variant 018M` }, hex: ["#7a7d83"] } }, image: `/products/eternity-2/425018M.webp`, images: [`/products/eternity-2/425018M.webp`, `/products/eternity-2/425018M-2.webp`, `/products/eternity-2/425018M-3.webp`, `/products/eternity-2/425018M-4.webp`] },
      { sku: `425220M`, name: { pt: `Rollerball pen Medium — Variante 220M`, en: `Rollerball pen Medium — Variant 220M` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Variante 220M`, en: `Variant 220M` }, hex: ["#7a7d83"] } }, image: `/products/eternity-2/425220M.webp`, images: [`/products/eternity-2/425220M.webp`, `/products/eternity-2/425220M-2.webp`, `/products/eternity-2/425220M-3.webp`, `/products/eternity-2/425220M-4.webp`] },
      { sku: `420220XL`, name: { pt: `Rollerball pen Medium — Black`, en: `Rollerball pen Medium — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/eternity-2/420220XL.webp`, images: [`/products/eternity-2/420220XL.webp`, `/products/eternity-2/420220XL-2.webp`, `/products/eternity-2/420220XL-3.webp`, `/products/eternity-2/420220XL-4.webp`] },
      { sku: `422017L`, name: { pt: `Rollerball pen Medium — Variante 017L`, en: `Rollerball pen Medium — Variant 017L` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Variante 017L`, en: `Variant 017L` }, hex: ["#7a7d83"] } }, image: `/products/eternity-2/422017L.webp`, images: [`/products/eternity-2/422017L.webp`, `/products/eternity-2/422017L-2.webp`, `/products/eternity-2/422017L-3.webp`, `/products/eternity-2/422017L-4.webp`] },
      { sku: `422220L`, name: { pt: `Rollerball pen Medium — Blue`, en: `Rollerball pen Medium — Blue` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Blue`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/eternity-2/422220L.webp`, images: [`/products/eternity-2/422220L.webp`, `/products/eternity-2/422220L-2.webp`, `/products/eternity-2/422220L-3.webp`, `/products/eternity-2/422220L-4.webp`] },
      { sku: `422014M`, name: { pt: `Rollerball pen Medium — Variante 014M`, en: `Rollerball pen Medium — Variant 014M` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Variante 014M`, en: `Variant 014M` }, hex: ["#7a7d83"] } }, image: `/products/eternity-2/422014M.webp`, images: [`/products/eternity-2/422014M.webp`, `/products/eternity-2/422014M-2.webp`, `/products/eternity-2/422014M-3.webp`, `/products/eternity-2/422014M-4.webp`] },
      { sku: `422016M`, name: { pt: `Rollerball pen Medium — Variante 016M`, en: `Rollerball pen Medium — Variant 016M` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Variante 016M`, en: `Variant 016M` }, hex: ["#7a7d83"] } }, image: `/products/eternity-2/422016M.webp`, images: [`/products/eternity-2/422016M.webp`, `/products/eternity-2/422016M-2.webp`, `/products/eternity-2/422016M-3.webp`, `/products/eternity-2/422016M-4.webp`] },
      { sku: `422018M`, name: { pt: `Rollerball pen Medium — Variante 018M`, en: `Rollerball pen Medium — Variant 018M` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Variante 018M`, en: `Variant 018M` }, hex: ["#7a7d83"] } }, image: `/products/eternity-2/422018M.webp`, images: [`/products/eternity-2/422018M.webp`, `/products/eternity-2/422018M-2.webp`, `/products/eternity-2/422018M-3.webp`, `/products/eternity-2/422018M-4.webp`] },
      { sku: `422220M`, name: { pt: `Rollerball pen Medium — Variante 220M`, en: `Rollerball pen Medium — Variant 220M` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Variante 220M`, en: `Variant 220M` }, hex: ["#7a7d83"] } }, image: `/products/eternity-2/422220M.webp`, images: [`/products/eternity-2/422220M.webp`, `/products/eternity-2/422220M-2.webp`, `/products/eternity-2/422220M-3.webp`, `/products/eternity-2/422220M-4.webp`] },
    ],
  },
  {
    slug: `eternity-dragon`,
    name: { pt: `Fountain pen large`, en: `Fountain pen large` },
    description: { pt: `The Line D Eternity Large Dragon Black features a multicolored dragon that undulates on its cap. Its sleeve is decorated with the new dragon scale guilloche that is expressed under Dupont black lacquer. This writing instrument, the Line D Eternity Large, comes in a box with a 14-carat solid gold nib and a roller sleeve, and is made in our workshops in Faverges, France. Associated nib refills: 040112 Blue 040110 Black 040362 Red 040363 Green 040364 Turquoise Associated roller refills: 040840 Blue 040841 Black`, en: `The Line D Eternity Large Dragon Black features a multicolored dragon that undulates on its cap. Its sleeve is decorated with the new dragon scale guilloche that is expressed under Dupont black lacquer. This writing instrument, the Line D Eternity Large, comes in a box with a 14-carat solid gold nib and a roller sleeve, and is made in our workshops in Faverges, France. Associated nib refills: 040112 Blue 040110 Black 040362 Red 040363 Green 040364 Turquoise Associated roller refills: 040840 Blue 040841 Black` },
    collection: `Dragon`,
    categorySlug: "escrita",
    image: `/products/eternity-dragon/420028L.webp`,
    variants: [
      { sku: `420028L`, name: { pt: `Fountain pen large — Burgundy`, en: `Fountain pen large — Burgundy` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Burgundy`, en: `Burgundy` }, hex: ["#7d2b27"] } }, image: `/products/eternity-dragon/420028L.webp`, images: [`/products/eternity-dragon/420028L.webp`, `/products/eternity-dragon/420028L-2.webp`, `/products/eternity-dragon/420028L-3.webp`, `/products/eternity-dragon/420028L-4.webp`] },
      { sku: `420029L`, name: { pt: `Fountain pen large — Honey`, en: `Fountain pen large — Honey` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Honey`, en: `Honey` }, hex: ["#7a7d83"] } }, image: `/products/eternity-dragon/420029L.webp`, images: [`/products/eternity-dragon/420029L.webp`, `/products/eternity-dragon/420029L-2.webp`, `/products/eternity-dragon/420029L-3.webp`, `/products/eternity-dragon/420029L-4.webp`] },
      { sku: `420030L`, name: { pt: `Fountain pen large — Royal Blue`, en: `Fountain pen large — Royal Blue` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Royal Blue`, en: `Royal Blue` }, hex: ["#1f3c66"] } }, image: `/products/eternity-dragon/420030L.webp`, images: [`/products/eternity-dragon/420030L.webp`, `/products/eternity-dragon/420030L-2.webp`, `/products/eternity-dragon/420030L-3.webp`, `/products/eternity-dragon/420030L-4.webp`] },
      { sku: `420026L`, name: { pt: `Fountain pen large — Honey`, en: `Fountain pen large — Honey` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Honey`, en: `Honey` }, hex: ["#7a7d83"] } }, image: `/products/eternity-dragon/420026L.webp`, images: [`/products/eternity-dragon/420026L.webp`, `/products/eternity-dragon/420026L-2.webp`, `/products/eternity-dragon/420026L-3.webp`, `/products/eternity-dragon/420026L-4.webp`] },
      { sku: `420027L`, name: { pt: `Fountain pen large — Black`, en: `Fountain pen large — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/eternity-dragon/420027L.webp`, images: [`/products/eternity-dragon/420027L.webp`, `/products/eternity-dragon/420027L-2.webp`, `/products/eternity-dragon/420027L-3.webp`, `/products/eternity-dragon/420027L-4.webp`] },
      { sku: `422028L`, name: { pt: `Fountain pen large — Burgundy`, en: `Fountain pen large — Burgundy` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Burgundy`, en: `Burgundy` }, hex: ["#7d2b27"] } }, image: `/products/eternity-dragon/422028L.webp`, images: [`/products/eternity-dragon/422028L.webp`, `/products/eternity-dragon/422028L-2.webp`, `/products/eternity-dragon/422028L-3.webp`, `/products/eternity-dragon/422028L-4.webp`] },
      { sku: `422029L`, name: { pt: `Fountain pen large — Honey`, en: `Fountain pen large — Honey` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Honey`, en: `Honey` }, hex: ["#7a7d83"] } }, image: `/products/eternity-dragon/422029L.webp`, images: [`/products/eternity-dragon/422029L.webp`, `/products/eternity-dragon/422029L-2.webp`, `/products/eternity-dragon/422029L-3.webp`, `/products/eternity-dragon/422029L-4.webp`] },
      { sku: `422030L`, name: { pt: `Fountain pen large — Royal Blue`, en: `Fountain pen large — Royal Blue` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Royal Blue`, en: `Royal Blue` }, hex: ["#1f3c66"] } }, image: `/products/eternity-dragon/422030L.webp`, images: [`/products/eternity-dragon/422030L.webp`, `/products/eternity-dragon/422030L-2.webp`, `/products/eternity-dragon/422030L-3.webp`, `/products/eternity-dragon/422030L-4.webp`] },
    ],
  },
  {
    slug: `gas-refill-2`,
    name: { pt: `Yellow`, en: `Yellow` },
    description: { pt: `Red gas refill. Sold individually. For the following lighters: Le Grand S.T. Dupont, Line 2 Cling (C16XXX), Line 2 Slim (017XXX), Line 1 Large Model, Jéroboam Table Lighter, Cylindrical Table Lighter.`, en: `Red gas refill. Sold individually. For the following lighters: Le Grand S.T. Dupont, Line 2 Cling (C16XXX), Line 2 Slim (017XXX), Line 1 Large Model, Jéroboam Table Lighter, Cylindrical Table Lighter.` },
    collection: `Gas-refill`,
    categorySlug: "acessorios",
    image: `/products/gas-refill-2/900430.webp`,
    variants: [
      { sku: `900430`, name: { pt: `Yellow — Black`, en: `Yellow — Black` }, priceCents: 1500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/gas-refill-2/900430.webp`, images: [`/products/gas-refill-2/900430.webp`] },
      { sku: `900434`, name: { pt: `Yellow — Blue`, en: `Yellow — Blue` }, priceCents: 2000, currency: "EUR", attributes: { color: { label: { pt: `Blue`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/gas-refill-2/900434.webp`, images: [`/products/gas-refill-2/900434.webp`] },
      { sku: `900436`, name: { pt: `Yellow — Red`, en: `Yellow — Red` }, priceCents: 1500, currency: "EUR", attributes: { color: { label: { pt: `Red`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/gas-refill-2/900436.webp`, images: [`/products/gas-refill-2/900436.webp`] },
      { sku: `900433`, name: { pt: `Yellow — Green`, en: `Yellow — Green` }, priceCents: 2000, currency: "EUR", attributes: { color: { label: { pt: `Green`, en: `Green` }, hex: ["#3b5d39"] } }, image: `/products/gas-refill-2/900433.webp`, images: [`/products/gas-refill-2/900433.webp`] },
      { sku: `900444`, name: { pt: `Yellow — White`, en: `Yellow — White` }, priceCents: 1000, currency: "EUR", attributes: { color: { label: { pt: `White`, en: `White` }, hex: ["#efeae0"] } }, image: `/products/gas-refill-2/900444.webp`, images: [`/products/gas-refill-2/900444.webp`] },
      { sku: `900435`, name: { pt: `Yellow — Red`, en: `Yellow — Red` }, priceCents: 2000, currency: "EUR", attributes: { color: { label: { pt: `Red`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/gas-refill-2/900435.webp`, images: [`/products/gas-refill-2/900435.webp`] },
      { sku: `900432`, name: { pt: `Yellow — Yellow`, en: `Yellow — Yellow` }, priceCents: 2000, currency: "EUR", attributes: { color: { label: { pt: `Yellow`, en: `Yellow` }, hex: ["#7a7d83"] } }, image: `/products/gas-refill-2/900432.webp`, images: [`/products/gas-refill-2/900432.webp`] },
    ],
  },
  {
    slug: `initial-3`,
    name: { pt: `Guilloche lighter`, en: `Guilloche lighter` },
    description: { pt: `Initial lighter, cinatic guilloche decor, palladium finishes. With a double yellow flame. Associated lighter stone: red (REF 900650) Associated gas recharge: blue (REF 900434) Lighter delivered empty of gas, refill sold separately.`, en: `Initial lighter, cinatic guilloche decor, palladium finishes. With a double yellow flame. Associated lighter stone: red (REF 900650) Associated gas recharge: blue (REF 900434) Lighter delivered empty of gas, refill sold separately.` },
    collection: `Initial`,
    categorySlug: "escrita",
    image: `/products/initial-3/020840.webp`,
    variants: [
      { sku: `020840`, name: { pt: `Guilloche lighter — Silver`, en: `Guilloche lighter — Silver` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Silver`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/initial-3/020840.webp`, images: [`/products/initial-3/020840.webp`, `/products/initial-3/020840-2.webp`, `/products/initial-3/020840-3.webp`, `/products/initial-3/020840-4.webp`] },
      { sku: `020841`, name: { pt: `Guilloche lighter — Golden`, en: `Guilloche lighter — Golden` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Golden`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/initial-3/020841.webp`, images: [`/products/initial-3/020841.webp`, `/products/initial-3/020841-2.webp`, `/products/initial-3/020841-3.webp`, `/products/initial-3/020841-4.webp`] },
      { sku: `020844`, name: { pt: `Guilloche lighter — Silver`, en: `Guilloche lighter — Silver` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Silver`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/initial-3/020844.webp`, images: [`/products/initial-3/020844.webp`, `/products/initial-3/020844-2.webp`, `/products/initial-3/020844-3.webp`, `/products/initial-3/020844-4.webp`] },
    ],
  },
  {
    slug: `keyring`,
    name: { pt: `Chrome`, en: `Chrome` },
    description: { pt: `The new accessories collection from S.T. Dupont is inspired by the iconic codes of the House, creating products of singular elegance. Silver and gold trainer keyring Made in Italy`, en: `The new accessories collection from S.T. Dupont is inspired by the iconic codes of the House, creating products of singular elegance. Silver and gold trainer keyring Made in Italy` },
    collection: `Keyring`,
    categorySlug: "acessorios",
    image: `/products/keyring/003119.webp`,
    variants: [
      { sku: `003119`, name: { pt: `Chrome — Golden`, en: `Chrome — Golden` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Golden`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/keyring/003119.webp`, images: [`/products/keyring/003119.webp`, `/products/keyring/003119-2.webp`] },
      { sku: `003120`, name: { pt: `Chrome — Silver`, en: `Chrome — Silver` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Silver`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/keyring/003120.webp`, images: [`/products/keyring/003120.webp`, `/products/keyring/003120-2.webp`] },
    ],
  },
  {
    slug: `keyrings`,
    name: { pt: `Leather`, en: `Leather` },
    description: { pt: `The new accessories collection from S.T. Dupont is inspired by the House's iconic codes, creating products of singular elegance. STD buckle keyring in grained calf leather with silver details Made in Italy`, en: `The new accessories collection from S.T. Dupont is inspired by the House's iconic codes, creating products of singular elegance. STD buckle keyring in grained calf leather with silver details Made in Italy` },
    collection: `Keyrings`,
    categorySlug: "acessorios",
    image: `/products/keyrings/003118.webp`,
    variants: [
      { sku: `003118`, name: { pt: `Leather — Black`, en: `Leather — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/keyrings/003118.webp`, images: [`/products/keyrings/003118.webp`, `/products/keyrings/003118-2.webp`] },
    ],
  },
  {
    slug: `keyrings-monogram-1872`,
    name: { pt: `Metal`, en: `Metal` },
    description: { pt: `Craftsmanship in metal, as well as the art of lacquer and coated leather, showcase the expertise of S.T. Dupont in the Monogram 1872 collection. Well-rooted in their time, the pieces in the collection all feature the new S.T. Dupont logo—upright, determined, and proud. Chrome keychain engraved with the Monogram 1872 guilloche. Made in China.`, en: `Craftsmanship in metal, as well as the art of lacquer and coated leather, showcase the expertise of S.T. Dupont in the Monogram 1872 collection. Well-rooted in their time, the pieces in the collection all feature the new S.T. Dupont logo—upright, determined, and proud. Chrome keychain engraved with the Monogram 1872 guilloche. Made in China.` },
    collection: `Monogram 1872`,
    categorySlug: "acessorios",
    image: `/products/keyrings-monogram-1872/003541.webp`,
    variants: [
      { sku: `003541`, name: { pt: `Metal — Silver`, en: `Metal — Silver` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Silver`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/keyrings-monogram-1872/003541.webp`, images: [`/products/keyrings-monogram-1872/003541.webp`, `/products/keyrings-monogram-1872/003541-2.webp`] },
      { sku: `003540`, name: { pt: `Metal — Golden`, en: `Metal — Golden` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Golden`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/keyrings-monogram-1872/003540.webp`, images: [`/products/keyrings-monogram-1872/003540.webp`, `/products/keyrings-monogram-1872/003540-2.webp`] },
    ],
  },
  {
    slug: `ligne-2-6`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `Montecristo and S.T. Dupont, both synonymous with unique craftsmanship, have joined forces to create exceptional products. This new collection will delight fans of both brands. The Ligne 2 is lacquered with a violet gradient, on the front the logo of the prestigious Montecristo cigar brand is stamped in silver on one side, while the other side features a golden sun and moon decoration. Soft and adjustable double flame. The collection includes 2 other lighters: Grand Dupont and a Maxijet. Also, two pens from the Line D Large collection and accessories: a leather case for three cigars, a large ashtray, a cigar cutter and a pair of cufflinks. Gas refill associated: red (REF 000435) black stone (REF 900601)`, en: `Montecristo and S.T. Dupont, both synonymous with unique craftsmanship, have joined forces to create exceptional products. This new collection will delight fans of both brands. The Ligne 2 is lacquered with a violet gradient, on the front the logo of the prestigious Montecristo cigar brand is stamped in silver on one side, while the other side features a golden sun and moon decoration. Soft and adjustable double flame. The collection includes 2 other lighters: Grand Dupont and a Maxijet. Also, two pens from the Line D Large collection and accessories: a leather case for three cigars, a large ashtray, a cigar cutter and a pair of cufflinks. Gas refill associated: red (REF 000435) black stone (REF 900601)` },
    collection: `Ligne 2`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-6/C16034.webp`,
    variants: [
      { sku: `C16034`, name: { pt: `Lacquered lighter — Violet`, en: `Lacquered lighter — Violet` }, priceCents: 141000, currency: "EUR", attributes: { color: { label: { pt: `Violet`, en: `Violet` }, hex: ["#6b4a8a"] } }, image: `/products/ligne-2-6/C16034.webp`, images: [`/products/ligne-2-6/C16034.webp`, `/products/ligne-2-6/C16034-2.webp`, `/products/ligne-2-6/C16034-3.webp`, `/products/ligne-2-6/C16034-4.webp`] },
    ],
  },
  {
    slug: `maxijet-2`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `Montecristo and S.T. Dupont, both synonymous with unique craftsmanship, have joined forces to create exceptional products. This new collection will delight fans of both brands. The Maxijet is lacquered with a violet gradient, on the front the logo of the prestigious Montecristo cigar brand is stamped in gold on one side, while the other side features a golden sun and moon decoration. It has a torch flame, lights a cigar in such a way as to preserve all its distinctive aromas for the greatest pleasure of aficionados. The collection includes 2 other lighters: Line 2 and a Grand Dupont. Also, two pens from the Line D Large collection and accessories: a leather case for three cigars, a large ashtray, a cigar cutter and a pair of cufflinks. Associated gas refill: black (REF 000430)`, en: `Montecristo and S.T. Dupont, both synonymous with unique craftsmanship, have joined forces to create exceptional products. This new collection will delight fans of both brands. The Maxijet is lacquered with a violet gradient, on the front the logo of the prestigious Montecristo cigar brand is stamped in gold on one side, while the other side features a golden sun and moon decoration. It has a torch flame, lights a cigar in such a way as to preserve all its distinctive aromas for the greatest pleasure of aficionados. The collection includes 2 other lighters: Line 2 and a Grand Dupont. Also, two pens from the Line D Large collection and accessories: a leather case for three cigars, a large ashtray, a cigar cutter and a pair of cufflinks. Associated gas refill: black (REF 000430)` },
    collection: `Maxijet`,
    categorySlug: "isqueiros",
    image: `/products/maxijet-2/020034.webp`,
    variants: [
      { sku: `020034`, name: { pt: `Lacquered lighter — Violet`, en: `Lacquered lighter — Violet` }, priceCents: 25000, currency: "EUR", attributes: { color: { label: { pt: `Violet`, en: `Violet` }, hex: ["#6b4a8a"] } }, image: `/products/maxijet-2/020034.webp`, images: [`/products/maxijet-2/020034.webp`, `/products/maxijet-2/020034-2.webp`, `/products/maxijet-2/020034-3.webp`, `/products/maxijet-2/020034-4.webp`] },
    ],
  },
  {
    slug: `money-clip-2`,
    name: { pt: `Chrome`, en: `Chrome` },
    description: { pt: `The new accessories collection from S.T. Dupont is inspired by the iconic codes of the House, creating products of singular elegance. Silver and gold guilloche money clip with diamond tip, engraved with the new S.T. logo. Dupont logo Made in China`, en: `The new accessories collection from S.T. Dupont is inspired by the iconic codes of the House, creating products of singular elegance. Silver and gold guilloche money clip with diamond tip, engraved with the new S.T. logo. Dupont logo Made in China` },
    collection: `Money Clip`,
    categorySlug: "acessorios",
    image: `/products/money-clip-2/003081.webp`,
    variants: [
      { sku: `003081`, name: { pt: `Chrome — Silver`, en: `Chrome — Silver` }, priceCents: 11500, currency: "EUR", attributes: { color: { label: { pt: `Silver`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/money-clip-2/003081.webp`, images: [`/products/money-clip-2/003081.webp`, `/products/money-clip-2/003081-2.webp`] },
      { sku: `003005`, name: { pt: `Chrome — Silver`, en: `Chrome — Silver` }, priceCents: 37500, currency: "EUR", attributes: { color: { label: { pt: `Silver`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/money-clip-2/003005.webp`, images: [`/products/money-clip-2/003005.webp`, `/products/money-clip-2/003005-2.webp`] },
      { sku: `003121`, name: { pt: `Chrome — Silver`, en: `Chrome — Silver` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Silver`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/money-clip-2/003121.webp`, images: [`/products/money-clip-2/003121.webp`, `/products/money-clip-2/003121-2.webp`, `/products/money-clip-2/003121-3.webp`] },
      { sku: `003122`, name: { pt: `Chrome — Golden`, en: `Chrome — Golden` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Golden`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/money-clip-2/003122.webp`, images: [`/products/money-clip-2/003122.webp`, `/products/money-clip-2/003122-2.webp`, `/products/money-clip-2/003122-3.webp`] },
      { sku: `003123`, name: { pt: `Chrome — Silver`, en: `Chrome — Silver` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Silver`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/money-clip-2/003123.webp`, images: [`/products/money-clip-2/003123.webp`, `/products/money-clip-2/003123-2.webp`, `/products/money-clip-2/003123-3.webp`] },
    ],
  },
  {
    slug: `money-clip-monogram-1872`,
    name: { pt: `Metal`, en: `Metal` },
    description: { pt: `Craftsmanship in metal, as well as the art of lacquer and coated leather, showcase the expertise of S.T. Dupont in the Monogram 1872 collection. Well-rooted in their time, the pieces in the collection all feature the new S.T. Dupont logo—upright, determined, and proud. Chrome money clip engraved with the Monogram 1872 guilloche. Made in China.`, en: `Craftsmanship in metal, as well as the art of lacquer and coated leather, showcase the expertise of S.T. Dupont in the Monogram 1872 collection. Well-rooted in their time, the pieces in the collection all feature the new S.T. Dupont logo—upright, determined, and proud. Chrome money clip engraved with the Monogram 1872 guilloche. Made in China.` },
    collection: `Monogram 1872`,
    categorySlug: "acessorios",
    image: `/products/money-clip-monogram-1872/003542.webp`,
    variants: [
      { sku: `003542`, name: { pt: `Metal — Golden`, en: `Metal — Golden` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Golden`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/money-clip-monogram-1872/003542.webp`, images: [`/products/money-clip-monogram-1872/003542.webp`, `/products/money-clip-monogram-1872/003542-2.webp`, `/products/money-clip-monogram-1872/003542-3.webp`] },
      { sku: `003543`, name: { pt: `Metal — Silver`, en: `Metal — Silver` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Silver`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/money-clip-monogram-1872/003543.webp`, images: [`/products/money-clip-monogram-1872/003543.webp`, `/products/money-clip-monogram-1872/003543-2.webp`, `/products/money-clip-monogram-1872/003543-3.webp`] },
    ],
  },
  {
    slug: `pen-case-2`,
    name: { pt: `2-Pen Case`, en: `2-Pen Case` },
    description: { pt: `Inspired by the iconic house cigar cases, S.T. Dupont offers a new collection of pens, thought to be functional while offering an elegant and contemporary design. Made of high quality grained veal leather, this rigid case is the essential and sophisticated accessory to protect your writing instruments when traveling. This setting can accommodate two writing instruments (medium or wide).`, en: `Inspired by the iconic house cigar cases, S.T. Dupont offers a new collection of pens, thought to be functional while offering an elegant and contemporary design. Made of high quality grained veal leather, this rigid case is the essential and sophisticated accessory to protect your writing instruments when traveling. This setting can accommodate two writing instruments (medium or wide).` },
    collection: `Pen-case`,
    categorySlug: "acessorios",
    image: `/products/pen-case-2/007121.webp`,
    variants: [
      { sku: `007121`, name: { pt: `2-Pen Case — Black`, en: `2-Pen Case — Black` }, priceCents: 13500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/pen-case-2/007121.webp`, images: [`/products/pen-case-2/007121.webp`, `/products/pen-case-2/007121-2.webp`] },
      { sku: `007124`, name: { pt: `2-Pen Case — Indigo Blue`, en: `2-Pen Case — Indigo Blue` }, priceCents: 13500, currency: "EUR", attributes: { color: { label: { pt: `Indigo Blue`, en: `Indigo Blue` }, hex: ["#1f3c66"] } }, image: `/products/pen-case-2/007124.webp`, images: [`/products/pen-case-2/007124.webp`, `/products/pen-case-2/007124-2.webp`] },
      { sku: `007127`, name: { pt: `2-Pen Case — Black`, en: `2-Pen Case — Black` }, priceCents: 19000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/pen-case-2/007127.webp`, images: [`/products/pen-case-2/007127.webp`, `/products/pen-case-2/007127-2.webp`, `/products/pen-case-2/007127-3.webp`] },
      { sku: `007130`, name: { pt: `2-Pen Case — Indigo Blue`, en: `2-Pen Case — Indigo Blue` }, priceCents: 19000, currency: "EUR", attributes: { color: { label: { pt: `Indigo Blue`, en: `Indigo Blue` }, hex: ["#1f3c66"] } }, image: `/products/pen-case-2/007130.webp`, images: [`/products/pen-case-2/007130.webp`, `/products/pen-case-2/007130-2.webp`, `/products/pen-case-2/007130-3.webp`] },
      { sku: `007131`, name: { pt: `2-Pen Case — Black`, en: `2-Pen Case — Black` }, priceCents: 21000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/pen-case-2/007131.webp`, images: [`/products/pen-case-2/007131.webp`, `/products/pen-case-2/007131-2.webp`, `/products/pen-case-2/007131-3.webp`] },
      { sku: `007132`, name: { pt: `2-Pen Case — Indigo Blue`, en: `2-Pen Case — Indigo Blue` }, priceCents: 21000, currency: "EUR", attributes: { color: { label: { pt: `Indigo Blue`, en: `Indigo Blue` }, hex: ["#1f3c66"] } }, image: `/products/pen-case-2/007132.webp`, images: [`/products/pen-case-2/007132.webp`, `/products/pen-case-2/007132-2.webp`, `/products/pen-case-2/007132-3.webp`] },
    ],
  },
  {
    slug: `plectrum-fender`,
    name: { pt: `Plectrum`, en: `Plectrum` },
    description: { pt: `For the second time, S.T. Dupont and Fender® are working together to create a rock line that combines the expertise of both companies. In the line of the new «necklaces» S.T. Dupont (lighter, marker), this necklace offers this collaboration an original and rock accessory. Médiator necklace engraved with two Stratoscaster® guitars and adjustable chain in three different lengths 80/85/90 cm.`, en: `For the second time, S.T. Dupont and Fender® are working together to create a rock line that combines the expertise of both companies. In the line of the new «necklaces» S.T. Dupont (lighter, marker), this necklace offers this collaboration an original and rock accessory. Médiator necklace engraved with two Stratoscaster® guitars and adjustable chain in three different lengths 80/85/90 cm.` },
    collection: `Fender`,
    categorySlug: "acessorios",
    image: `/products/plectrum-fender/006175.webp`,
    variants: [
      { sku: `006175`, name: { pt: `Plectrum — Silver`, en: `Plectrum — Silver` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Silver`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/plectrum-fender/006175.webp`, images: [`/products/plectrum-fender/006175.webp`, `/products/plectrum-fender/006175-2.webp`, `/products/plectrum-fender/006175-3.webp`] },
    ],
  },
  {
    slug: `tie-clip-2`,
    name: { pt: `Matt`, en: `Matt` },
    description: { pt: `Silver metal tie clip. To coordinate with cufflinks.`, en: `Silver metal tie clip. To coordinate with cufflinks.` },
    collection: `Tie-clip`,
    categorySlug: "acessorios",
    image: `/products/tie-clip-2/005838.webp`,
    variants: [
      { sku: `005838`, name: { pt: `Matt — Silver`, en: `Matt — Silver` }, priceCents: 22000, currency: "EUR", attributes: { color: { label: { pt: `Silver`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/tie-clip-2/005838.webp`, images: [`/products/tie-clip-2/005838.webp`, `/products/tie-clip-2/005838-2.webp`] },
      { sku: `005839`, name: { pt: `Matt — Golden`, en: `Matt — Golden` }, priceCents: 22000, currency: "EUR", attributes: { color: { label: { pt: `Golden`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/tie-clip-2/005839.webp`, images: [`/products/tie-clip-2/005839.webp`, `/products/tie-clip-2/005839-2.webp`] },
      { sku: `005841`, name: { pt: `Matt — Silver`, en: `Matt — Silver` }, priceCents: 24000, currency: "EUR", attributes: { color: { label: { pt: `Silver`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/tie-clip-2/005841.webp`, images: [`/products/tie-clip-2/005841.webp`, `/products/tie-clip-2/005841-2.webp`] },
      { sku: `005840`, name: { pt: `Matt — Grey`, en: `Matt — Grey` }, priceCents: 22000, currency: "EUR", attributes: { color: { label: { pt: `Grey`, en: `Grey` }, hex: ["#7a7d83"] } }, image: `/products/tie-clip-2/005840.webp`, images: [`/products/tie-clip-2/005840.webp`, `/products/tie-clip-2/005840-2.webp`] },
    ],
  },
  {
    slug: `x`,
    name: { pt: `24 Writing instruments`, en: `24 Writing instruments` },
    description: { pt: `Inspired by contemporary architecture, the writing instrument cube has been conceived as a real piece of decoration. Its sleek design and ergonomic format make it a timelessly sophisticated object. Cube made with cedar wood veneer Composed of three stackable trays with capacity for 24 writing instruments`, en: `Inspired by contemporary architecture, the writing instrument cube has been conceived as a real piece of decoration. Its sleek design and ergonomic format make it a timelessly sophisticated object. Cube made with cedar wood veneer Composed of three stackable trays with capacity for 24 writing instruments` },
    collection: `X`,
    categorySlug: "acessorios",
    image: `/products/x/007150.webp`,
    variants: [
      { sku: `007150`, name: { pt: `24 Writing instruments — Black`, en: `24 Writing instruments — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/x/007150.webp`, images: [`/products/x/007150.webp`, `/products/x/007150-2.webp`, `/products/x/007150-3.webp`, `/products/x/007150-4.webp`] },
    ],
  },
  {
    slug: `d-initial-2`,
    name: { pt: `Ballpoint pen`, en: `Ballpoint pen` },
    description: { pt: `In 2025, D-Initial becomes Initial. Contemporary and uncluttered, it bears the new S.T. visual identity. Dupont visual identity. Its new proportions, longer and more conical, make it a timeless writing instrument. Initial orfèvre ballpoint pen with Vertical lines and chrome finish. Sword clip and lacquered top. Available in ballpoint, rollerball and fountain versions. Made in China. Related refills: 040853 Blue - 040854 Black - 040358 Pink - 040359 Red - 040360 Green - 040361 Turquoise`, en: `In 2025, D-Initial becomes Initial. Contemporary and uncluttered, it bears the new S.T. visual identity. Dupont visual identity. Its new proportions, longer and more conical, make it a timeless writing instrument. Initial orfèvre ballpoint pen with Vertical lines and chrome finish. Sword clip and lacquered top. Available in ballpoint, rollerball and fountain versions. Made in China. Related refills: 040853 Blue - 040854 Black - 040358 Pink - 040359 Red - 040360 Green - 040361 Turquoise` },
    collection: `D-Initial`,
    categorySlug: "escrita",
    image: `/products/d-initial-2/275201.webp`,
    variants: [
      { sku: `275201`, name: { pt: `Ballpoint pen — Silver`, en: `Ballpoint pen — Silver` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Silver`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/d-initial-2/275201.webp`, images: [`/products/d-initial-2/275201.webp`, `/products/d-initial-2/275201-2.webp`, `/products/d-initial-2/275201-3.webp`, `/products/d-initial-2/275201-4.webp`] },
    ],
  },
  {
    slug: `defi-millennium-2`,
    name: { pt: `Rollerball pen`, en: `Rollerball pen` },
    description: { pt: `The Défi Millenium collection has been revisited with the addition of two new finishes, reflecting a perfect balance between tradition and innovation. These new models, in a shiny black lacquer and brushed chrome, convey the collection’s athletic spirit while maintaining the Maison’s iconic signatures. Streamlined and precise, this captivating pen is quite the charm with its fluid writing and sporty style. Refills: Blue 040840 Black 040841 Warning: Writing instrument with magnetic cap. Accessories with magnets are not recommended for those who are pregnant, have metallic implants or medical devices such as pacemakers, insulin pumps, etc. We also advise against bringing the writing instrument into prolonged contact with credit cards, mechanical and quartz watches, mobile phones and any other magnetic devices, as the magnetic field it emits could damage sensitive devices. This product is not a toy. Keep out of reach of children.`, en: `The Défi Millenium collection has been revisited with the addition of two new finishes, reflecting a perfect balance between tradition and innovation. These new models, in a shiny black lacquer and brushed chrome, convey the collection’s athletic spirit while maintaining the Maison’s iconic signatures. Streamlined and precise, this captivating pen is quite the charm with its fluid writing and sporty style. Refills: Blue 040840 Black 040841 Warning: Writing instrument with magnetic cap. Accessories with magnets are not recommended for those who are pregnant, have metallic implants or medical devices such as pacemakers, insulin pumps, etc. We also advise against bringing the writing instrument into prolonged contact with credit cards, mechanical and quartz watches, mobile phones and any other magnetic devices, as the magnetic field it emits could damage sensitive devices. This product is not a toy. Keep out of reach of children.` },
    collection: `Défi Millennium`,
    categorySlug: "escrita",
    image: `/products/defi-millennium-2/400737.webp`,
    variants: [
      { sku: `400737`, name: { pt: `Rollerball pen — Orange`, en: `Rollerball pen — Orange` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Orange`, en: `Orange` }, hex: ["#c8a24a"] } }, image: `/products/defi-millennium-2/400737.webp`, images: [`/products/defi-millennium-2/400737.webp`, `/products/defi-millennium-2/400737-2.webp`, `/products/defi-millennium-2/400737-3.webp`, `/products/defi-millennium-2/400737-4.webp`] },
      { sku: `402004`, name: { pt: `Rollerball pen — Black`, en: `Rollerball pen — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/defi-millennium-2/402004.webp`, images: [`/products/defi-millennium-2/402004.webp`, `/products/defi-millennium-2/402004-2.webp`, `/products/defi-millennium-2/402004-3.webp`, `/products/defi-millennium-2/402004-4.webp`] },
    ],
  },
  {
    slug: `eternity-3`,
    name: { pt: `Rollerball pen Large`, en: `Rollerball pen Large` },
    description: { pt: `"S.T. Dupont reinvents its iconic Line D writing instrument collection with Line D Eternity. The emblematic collection from S.T. Dupont has been reimagined in a more modern way, creating a unique writing experience. The refined and slender lines make the Line D Eternity collection decidedly contemporary. The new 'Sword' clip is a nod to the famous phrase by English author Edward Bulwer-Lytton: 'The pen is mightier than the sword,' echoing the heritage of the House, particularly the iconic Sword collection. The craftsmanship of Maison S.T. Dupont is expressed through this collection with timeless elegance. Line D Eternity is available in ballpoint, rollerball, and fountain pen versions, in both medium and large sizes. This medium-sized writing instrument is adorned with the new 'Wings' solid 14-carat gold nib. This goldsmith version of the Line D Eternity features the iconic Maison's diamond head guilloche pattern in palladium color. Line D Eternity is crafted in our workshops in Faverges, France. Associated refills: 040112 Blue 040110 Black 040362 Red 040363 Green 040364 Turquoise"`, en: `"S.T. Dupont reinvents its iconic Line D writing instrument collection with Line D Eternity. The emblematic collection from S.T. Dupont has been reimagined in a more modern way, creating a unique writing experience. The refined and slender lines make the Line D Eternity collection decidedly contemporary. The new 'Sword' clip is a nod to the famous phrase by English author Edward Bulwer-Lytton: 'The pen is mightier than the sword,' echoing the heritage of the House, particularly the iconic Sword collection. The craftsmanship of Maison S.T. Dupont is expressed through this collection with timeless elegance. Line D Eternity is available in ballpoint, rollerball, and fountain pen versions, in both medium and large sizes. This medium-sized writing instrument is adorned with the new 'Wings' solid 14-carat gold nib. This goldsmith version of the Line D Eternity features the iconic Maison's diamond head guilloche pattern in palladium color. Line D Eternity is crafted in our workshops in Faverges, France. Associated refills: 040112 Blue 040110 Black 040362 Red 040363 Green 040364 Turquoise"` },
    collection: `Eternity`,
    categorySlug: "escrita",
    image: `/products/eternity-3/420015L.webp`,
    variants: [
      { sku: `420015L`, name: { pt: `Rollerball pen Large — Black`, en: `Rollerball pen Large — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/eternity-3/420015L.webp`, images: [`/products/eternity-3/420015L.webp`, `/products/eternity-3/420015L-2.webp`, `/products/eternity-3/420015L-3.webp`, `/products/eternity-3/420015L-4.webp`] },
      { sku: `420017L`, name: { pt: `Rollerball pen Large — Black`, en: `Rollerball pen Large — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/eternity-3/420017L.webp`, images: [`/products/eternity-3/420017L.webp`, `/products/eternity-3/420017L-2.webp`, `/products/eternity-3/420017L-3.webp`, `/products/eternity-3/420017L-4.webp`] },
      { sku: `420220L`, name: { pt: `Rollerball pen Large — Black`, en: `Rollerball pen Large — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/eternity-3/420220L.webp`, images: [`/products/eternity-3/420220L.webp`, `/products/eternity-3/420220L-2.webp`, `/products/eternity-3/420220L-3.webp`, `/products/eternity-3/420220L-4.webp`] },
      { sku: `420014M`, name: { pt: `Rollerball pen Large — Black`, en: `Rollerball pen Large — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/eternity-3/420014M.webp`, images: [`/products/eternity-3/420014M.webp`, `/products/eternity-3/420014M-2.webp`, `/products/eternity-3/420014M-3.webp`, `/products/eternity-3/420014M-4.webp`] },
      { sku: `420016M`, name: { pt: `Rollerball pen Large — Dark Blue`, en: `Rollerball pen Large — Dark Blue` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Dark Blue`, en: `Dark Blue` }, hex: ["#1f3c66"] } }, image: `/products/eternity-3/420016M.webp`, images: [`/products/eternity-3/420016M.webp`, `/products/eternity-3/420016M-2.webp`, `/products/eternity-3/420016M-3.webp`, `/products/eternity-3/420016M-4.webp`] },
      { sku: `420018M`, name: { pt: `Rollerball pen Large — Black`, en: `Rollerball pen Large — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/eternity-3/420018M.webp`, images: [`/products/eternity-3/420018M.webp`, `/products/eternity-3/420018M-2.webp`, `/products/eternity-3/420018M-3.webp`, `/products/eternity-3/420018M-4.webp`] },
      { sku: `420220M`, name: { pt: `Rollerball pen Large — Black`, en: `Rollerball pen Large — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/eternity-3/420220M.webp`, images: [`/products/eternity-3/420220M.webp`, `/products/eternity-3/420220M-2.webp`, `/products/eternity-3/420220M-3.webp`, `/products/eternity-3/420220M-4.webp`] },
      { sku: `422015L`, name: { pt: `Rollerball pen Large — Variante 015L`, en: `Rollerball pen Large — Variant 015L` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Variante 015L`, en: `Variant 015L` }, hex: ["#7a7d83"] } }, image: `/products/eternity-3/422015L.webp`, images: [`/products/eternity-3/422015L.webp`, `/products/eternity-3/422015L-2.webp`, `/products/eternity-3/422015L-3.webp`, `/products/eternity-3/422015L-4.webp`] },
    ],
  },
  {
    slug: `eternity-fire-x-2`,
    name: { pt: `Ballpoint pen Medium`, en: `Ballpoint pen Medium` },
    description: { pt: `Inspired by the X-Bag, one of the bags from the leather goods collection developed this season by S.T. Dupont, Fire X presents its reinterpretation of the iconic flame tip on the classics of the House. Line D Eternity medium ballpoint pen in glossy black Dupont lacquer and palladium finishes. Orfèvre guilloche Fire X engraved cap. Manufactured in our workshops in Faverges, France. Available in ballpoint, rollerball, and fountain pen versions. Associated refills: 040853 Blue - 040854 Black - 040358 Pink - 040359 Red - 040360 Green - 040361 Turquoise.`, en: `Inspired by the X-Bag, one of the bags from the leather goods collection developed this season by S.T. Dupont, Fire X presents its reinterpretation of the iconic flame tip on the classics of the House. Line D Eternity medium ballpoint pen in glossy black Dupont lacquer and palladium finishes. Orfèvre guilloche Fire X engraved cap. Manufactured in our workshops in Faverges, France. Available in ballpoint, rollerball, and fountain pen versions. Associated refills: 040853 Blue - 040854 Black - 040358 Pink - 040359 Red - 040360 Green - 040361 Turquoise.` },
    collection: `Fire X`,
    categorySlug: "escrita",
    image: `/products/eternity-fire-x-2/425070M.webp`,
    variants: [
      { sku: `425070M`, name: { pt: `Ballpoint pen Medium — Black`, en: `Ballpoint pen Medium — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/eternity-fire-x-2/425070M.webp`, images: [`/products/eternity-fire-x-2/425070M.webp`, `/products/eternity-fire-x-2/425070M-2.webp`, `/products/eternity-fire-x-2/425070M-3.webp`, `/products/eternity-fire-x-2/425070M-4.webp`] },
    ],
  },
  {
    slug: `eternity-monogram-1872-2`,
    name: { pt: `Rollerball Pen Medium`, en: `Rollerball Pen Medium` },
    description: { pt: `Craftsmanship in metal, as well as the art of lacquer and coated leather, showcase the expertise of S.T. Dupont in the Monogram 1872 collection. Well-rooted in their time, the pieces in the collection all feature the new S.T. Dupont logo—upright, determined, and proud. Line D Eternity medium fountain pen with guilloche craftsmanship and palladium finishes from the Monogram 1872 collection. Articulated Sword clip. 14-carat gold nib. Piston included. Available in ballpoint, rollerball, and fountain pen versions. Ink cartridges: 040112 Blue - 040110 Black - 040362 Red - 040363 Green - 040364 Turquoise This fountain pen comes with a medium nib, for a writing size of apporox. 0.55 mm.`, en: `Craftsmanship in metal, as well as the art of lacquer and coated leather, showcase the expertise of S.T. Dupont in the Monogram 1872 collection. Well-rooted in their time, the pieces in the collection all feature the new S.T. Dupont logo—upright, determined, and proud. Line D Eternity medium fountain pen with guilloche craftsmanship and palladium finishes from the Monogram 1872 collection. Articulated Sword clip. 14-carat gold nib. Piston included. Available in ballpoint, rollerball, and fountain pen versions. Ink cartridges: 040112 Blue - 040110 Black - 040362 Red - 040363 Green - 040364 Turquoise This fountain pen comes with a medium nib, for a writing size of apporox. 0.55 mm.` },
    collection: `Monogram 1872`,
    categorySlug: "escrita",
    image: `/products/eternity-monogram-1872-2/425020L.webp`,
    variants: [
      { sku: `425020L`, name: { pt: `Rollerball Pen Medium — Golden`, en: `Rollerball Pen Medium — Golden` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Golden`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/eternity-monogram-1872-2/425020L.webp`, images: [`/products/eternity-monogram-1872-2/425020L.webp`, `/products/eternity-monogram-1872-2/425020L-2.webp`, `/products/eternity-monogram-1872-2/425020L-3.webp`, `/products/eternity-monogram-1872-2/425020L-4.webp`] },
      { sku: `425021L`, name: { pt: `Rollerball Pen Medium — Silver`, en: `Rollerball Pen Medium — Silver` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Silver`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/eternity-monogram-1872-2/425021L.webp`, images: [`/products/eternity-monogram-1872-2/425021L.webp`, `/products/eternity-monogram-1872-2/425021L-2.webp`, `/products/eternity-monogram-1872-2/425021L-3.webp`, `/products/eternity-monogram-1872-2/425021L-4.webp`] },
      { sku: `425023L`, name: { pt: `Rollerball Pen Medium — Black`, en: `Rollerball Pen Medium — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/eternity-monogram-1872-2/425023L.webp`, images: [`/products/eternity-monogram-1872-2/425023L.webp`, `/products/eternity-monogram-1872-2/425023L-2.webp`, `/products/eternity-monogram-1872-2/425023L-3.webp`, `/products/eternity-monogram-1872-2/425023L-4.webp`] },
      { sku: `425020M`, name: { pt: `Rollerball Pen Medium — Golden`, en: `Rollerball Pen Medium — Golden` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Golden`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/eternity-monogram-1872-2/425020M.webp`, images: [`/products/eternity-monogram-1872-2/425020M.webp`, `/products/eternity-monogram-1872-2/425020M-2.webp`, `/products/eternity-monogram-1872-2/425020M-3.webp`, `/products/eternity-monogram-1872-2/425020M-4.webp`] },
      { sku: `420021L`, name: { pt: `Rollerball Pen Medium — Silver`, en: `Rollerball Pen Medium — Silver` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Silver`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/eternity-monogram-1872-2/420021L.webp`, images: [`/products/eternity-monogram-1872-2/420021L.webp`, `/products/eternity-monogram-1872-2/420021L-2.webp`, `/products/eternity-monogram-1872-2/420021L-3.webp`, `/products/eternity-monogram-1872-2/420021L-4.webp`] },
      { sku: `420020M`, name: { pt: `Rollerball Pen Medium — Golden`, en: `Rollerball Pen Medium — Golden` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Golden`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/eternity-monogram-1872-2/420020M.webp`, images: [`/products/eternity-monogram-1872-2/420020M.webp`, `/products/eternity-monogram-1872-2/420020M-2.webp`, `/products/eternity-monogram-1872-2/420020M-3.webp`, `/products/eternity-monogram-1872-2/420020M-4.webp`] },
      { sku: `420021M`, name: { pt: `Rollerball Pen Medium — Silver`, en: `Rollerball Pen Medium — Silver` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Silver`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/eternity-monogram-1872-2/420021M.webp`, images: [`/products/eternity-monogram-1872-2/420021M.webp`, `/products/eternity-monogram-1872-2/420021M-2.webp`, `/products/eternity-monogram-1872-2/420021M-3.webp`, `/products/eternity-monogram-1872-2/420021M-4.webp`] },
      { sku: `420020XL`, name: { pt: `Rollerball Pen Medium — Golden`, en: `Rollerball Pen Medium — Golden` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Golden`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/eternity-monogram-1872-2/420020XL.webp`, images: [`/products/eternity-monogram-1872-2/420020XL.webp`, `/products/eternity-monogram-1872-2/420020XL-2.webp`, `/products/eternity-monogram-1872-2/420020XL-3.webp`, `/products/eternity-monogram-1872-2/420020XL-4.webp`] },
      { sku: `420021XL`, name: { pt: `Rollerball Pen Medium — Silver`, en: `Rollerball Pen Medium — Silver` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Silver`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/eternity-monogram-1872-2/420021XL.webp`, images: [`/products/eternity-monogram-1872-2/420021XL.webp`, `/products/eternity-monogram-1872-2/420021XL-2.webp`, `/products/eternity-monogram-1872-2/420021XL-3.webp`, `/products/eternity-monogram-1872-2/420021XL-4.webp`] },
      { sku: `422020L`, name: { pt: `Rollerball Pen Medium — Golden`, en: `Rollerball Pen Medium — Golden` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Golden`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/eternity-monogram-1872-2/422020L.webp`, images: [`/products/eternity-monogram-1872-2/422020L.webp`, `/products/eternity-monogram-1872-2/422020L-2.webp`, `/products/eternity-monogram-1872-2/422020L-3.webp`, `/products/eternity-monogram-1872-2/422020L-4.webp`] },
      { sku: `422021L`, name: { pt: `Rollerball Pen Medium — Silver`, en: `Rollerball Pen Medium — Silver` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Silver`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/eternity-monogram-1872-2/422021L.webp`, images: [`/products/eternity-monogram-1872-2/422021L.webp`, `/products/eternity-monogram-1872-2/422021L-2.webp`, `/products/eternity-monogram-1872-2/422021L-3.webp`, `/products/eternity-monogram-1872-2/422021L-4.webp`] },
      { sku: `422020M`, name: { pt: `Rollerball Pen Medium — Golden`, en: `Rollerball Pen Medium — Golden` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Golden`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/eternity-monogram-1872-2/422020M.webp`, images: [`/products/eternity-monogram-1872-2/422020M.webp`, `/products/eternity-monogram-1872-2/422020M-2.webp`, `/products/eternity-monogram-1872-2/422020M-3.webp`, `/products/eternity-monogram-1872-2/422020M-4.webp`] },
      { sku: `422021M`, name: { pt: `Rollerball Pen Medium — Silver`, en: `Rollerball Pen Medium — Silver` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Silver`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/eternity-monogram-1872-2/422021M.webp`, images: [`/products/eternity-monogram-1872-2/422021M.webp`, `/products/eternity-monogram-1872-2/422021M-2.webp`, `/products/eternity-monogram-1872-2/422021M-3.webp`, `/products/eternity-monogram-1872-2/422021M-4.webp`] },
    ],
  },
  {
    slug: `ligne-2-fender-2`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `Fender®, the most famous guitar brand in Tokyo, is opening a boutique in the vibrant Harajuku area. On this occasion, and for the second time, S.T. Dupont and Fender® collaborate, imagining a rock line inspired by the know-how of both houses, as well as Japan. With his work of the lacquer inspired by kintsugi, but also the return of an ancient know-how with gold powder applied by hand, this collaboration makes its own the creativity of the musical universe. Lighter line 2 Cling with a double soft yellow flame. Decorated with the Fender® pattern with blue lacquer, hand applied Gold dust craftsmanship and gold finishes. With the famous "Cling" at the opening. For each purchase of the Line 2, an exclusive Médiator necklace is offered. Lighter delivered empty gas, refill sold separately. GAME OF THRONES, HOUSE OF THE DRAGON and all related characters and elements © & TM Home Box Office, Inc. (s24)`, en: `Fender®, the most famous guitar brand in Tokyo, is opening a boutique in the vibrant Harajuku area. On this occasion, and for the second time, S.T. Dupont and Fender® collaborate, imagining a rock line inspired by the know-how of both houses, as well as Japan. With his work of the lacquer inspired by kintsugi, but also the return of an ancient know-how with gold powder applied by hand, this collaboration makes its own the creativity of the musical universe. Lighter line 2 Cling with a double soft yellow flame. Decorated with the Fender® pattern with blue lacquer, hand applied Gold dust craftsmanship and gold finishes. With the famous "Cling" at the opening. For each purchase of the Line 2, an exclusive Médiator necklace is offered. Lighter delivered empty gas, refill sold separately. GAME OF THRONES, HOUSE OF THE DRAGON and all related characters and elements © & TM Home Box Office, Inc. (s24)` },
    collection: `Fender`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-fender-2/C16025CL.webp`,
    variants: [
      { sku: `C16025CL`, name: { pt: `Lacquered lighter — Black`, en: `Lacquered lighter — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/ligne-2-fender-2/C16025CL.webp`, images: [`/products/ligne-2-fender-2/C16025CL.webp`, `/products/ligne-2-fender-2/C16025CL-2.webp`, `/products/ligne-2-fender-2/C16025CL-3.webp`, `/products/ligne-2-fender-2/C16025CL-4.webp`] },
    ],
  },
  {
    slug: `twiggy-fire-x`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `Inspired by the X-Bag, one of the bags from the leather goods collection developed this season by S.T. Dupont, Fire X presents its reinterpretation of the iconic flame tip on the classics of the House. Twiggy Fire X lighter decorated with black lacquer and chrome finishes. Featuring a torch flame. Associated gas refill: black (REF 900430) Lighter delivered empty of gas, refill sold separately.`, en: `Inspired by the X-Bag, one of the bags from the leather goods collection developed this season by S.T. Dupont, Fire X presents its reinterpretation of the iconic flame tip on the classics of the House. Twiggy Fire X lighter decorated with black lacquer and chrome finishes. Featuring a torch flame. Associated gas refill: black (REF 900430) Lighter delivered empty of gas, refill sold separately.` },
    collection: `Fire X`,
    categorySlug: "isqueiros",
    image: `/products/twiggy-fire-x/030070.webp`,
    variants: [
      { sku: `030070`, name: { pt: `Lacquered lighter — Black`, en: `Lacquered lighter — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/twiggy-fire-x/030070.webp`, images: [`/products/twiggy-fire-x/030070.webp`, `/products/twiggy-fire-x/030070-2.webp`, `/products/twiggy-fire-x/030070-3.webp`, `/products/twiggy-fire-x/030070-4.webp`] },
    ],
  },
  {
    slug: `atelier-2`,
    name: { pt: `Wallet`, en: `Wallet` },
    description: { pt: `This full-flower veal leather carriers embossed with the crocrow patinated motif by hand offers unique shades of Havana. It is the ideal accessory that will accompany you in all your trips. It offers six locations for credit cards and a compartment for your papers and tickets. - 6 cards seats, - 1 flat compartment for tickets and receipts`, en: `This full-flower veal leather carriers embossed with the crocrow patinated motif by hand offers unique shades of Havana. It is the ideal accessory that will accompany you in all your trips. It offers six locations for credit cards and a compartment for your papers and tickets. - 6 cards seats, - 1 flat compartment for tickets and receipts` },
    collection: `Atelier`,
    categorySlug: "pele",
    image: `/products/atelier-2/190376.webp`,
    variants: [
      { sku: `190376`, name: { pt: `Wallet — Blue`, en: `Wallet — Blue` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Blue`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/atelier-2/190376.webp`, images: [`/products/atelier-2/190376.webp`, `/products/atelier-2/190376-2.webp`] },
      { sku: `190476`, name: { pt: `Wallet — Brown`, en: `Wallet — Brown` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Brown`, en: `Brown` }, hex: ["#6b4a2a"] } }, image: `/products/atelier-2/190476.webp`, images: [`/products/atelier-2/190476.webp`, `/products/atelier-2/190476-2.webp`] },
      { sku: `190374`, name: { pt: `Wallet — Blue`, en: `Wallet — Blue` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Blue`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/atelier-2/190374.webp`, images: [`/products/atelier-2/190374.webp`, `/products/atelier-2/190374-2.webp`, `/products/atelier-2/190374-3.webp`] },
      { sku: `190474`, name: { pt: `Wallet — Brown`, en: `Wallet — Brown` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Brown`, en: `Brown` }, hex: ["#6b4a2a"] } }, image: `/products/atelier-2/190474.webp`, images: [`/products/atelier-2/190474.webp`, `/products/atelier-2/190474-2.webp`, `/products/atelier-2/190474-3.webp`, `/products/atelier-2/190474-4.webp`] },
      { sku: `190380`, name: { pt: `Wallet — Blue`, en: `Wallet — Blue` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Blue`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/atelier-2/190380.webp`, images: [`/products/atelier-2/190380.webp`, `/products/atelier-2/190380-2.webp`] },
      { sku: `190480`, name: { pt: `Wallet — Brown`, en: `Wallet — Brown` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Brown`, en: `Brown` }, hex: ["#6b4a2a"] } }, image: `/products/atelier-2/190480.webp`, images: [`/products/atelier-2/190480.webp`, `/products/atelier-2/190480-2.webp`] },
      { sku: `190580`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/atelier-2/190580.webp`, images: [`/products/atelier-2/190580.webp`, `/products/atelier-2/190580-2.webp`] },
      { sku: `190379`, name: { pt: `Wallet — Blue`, en: `Wallet — Blue` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Blue`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/atelier-2/190379.webp`, images: [`/products/atelier-2/190379.webp`, `/products/atelier-2/190379-2.webp`, `/products/atelier-2/190379-3.webp`] },
      { sku: `190479`, name: { pt: `Wallet — Brown`, en: `Wallet — Brown` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Brown`, en: `Brown` }, hex: ["#6b4a2a"] } }, image: `/products/atelier-2/190479.webp`, images: [`/products/atelier-2/190479.webp`, `/products/atelier-2/190479-2.webp`, `/products/atelier-2/190479-3.webp`] },
      { sku: `190579`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/atelier-2/190579.webp`, images: [`/products/atelier-2/190579.webp`, `/products/atelier-2/190579-2.webp`] },
      { sku: `190475`, name: { pt: `Wallet — Brown`, en: `Wallet — Brown` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Brown`, en: `Brown` }, hex: ["#6b4a2a"] } }, image: `/products/atelier-2/190475.webp`, images: [`/products/atelier-2/190475.webp`, `/products/atelier-2/190475-2.webp`, `/products/atelier-2/190475-3.webp`, `/products/atelier-2/190475-4.webp`] },
      { sku: `141052`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/atelier-2/141052.webp`, images: [`/products/atelier-2/141052.webp`, `/products/atelier-2/141052-2.webp`, `/products/atelier-2/141052-3.webp`, `/products/atelier-2/141052-4.webp`] },
      { sku: `141352`, name: { pt: `Wallet — Blue`, en: `Wallet — Blue` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Blue`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/atelier-2/141352.webp`, images: [`/products/atelier-2/141352.webp`, `/products/atelier-2/141352-2.webp`, `/products/atelier-2/141352-3.webp`, `/products/atelier-2/141352-4.webp`] },
      { sku: `190373`, name: { pt: `Wallet — Blue`, en: `Wallet — Blue` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Blue`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/atelier-2/190373.webp`, images: [`/products/atelier-2/190373.webp`, `/products/atelier-2/190373-2.webp`, `/products/atelier-2/190373-3.webp`] },
      { sku: `190377`, name: { pt: `Wallet — Blue`, en: `Wallet — Blue` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Blue`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/atelier-2/190377.webp`, images: [`/products/atelier-2/190377.webp`, `/products/atelier-2/190377-2.webp`, `/products/atelier-2/190377-3.webp`] },
      { sku: `190378`, name: { pt: `Wallet — Blue`, en: `Wallet — Blue` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Blue`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/atelier-2/190378.webp`, images: [`/products/atelier-2/190378.webp`, `/products/atelier-2/190378-2.webp`, `/products/atelier-2/190378-3.webp`] },
      { sku: `190473`, name: { pt: `Wallet — Brown`, en: `Wallet — Brown` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Brown`, en: `Brown` }, hex: ["#6b4a2a"] } }, image: `/products/atelier-2/190473.webp`, images: [`/products/atelier-2/190473.webp`, `/products/atelier-2/190473-2.webp`, `/products/atelier-2/190473-3.webp`] },
      { sku: `190477`, name: { pt: `Wallet — Brown`, en: `Wallet — Brown` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Brown`, en: `Brown` }, hex: ["#6b4a2a"] } }, image: `/products/atelier-2/190477.webp`, images: [`/products/atelier-2/190477.webp`, `/products/atelier-2/190477-2.webp`, `/products/atelier-2/190477-3.webp`] },
      { sku: `190478`, name: { pt: `Wallet — Brown`, en: `Wallet — Brown` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Brown`, en: `Brown` }, hex: ["#6b4a2a"] } }, image: `/products/atelier-2/190478.webp`, images: [`/products/atelier-2/190478.webp`, `/products/atelier-2/190478-2.webp`, `/products/atelier-2/190478-3.webp`] },
      { sku: `190573`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/atelier-2/190573.webp`, images: [`/products/atelier-2/190573.webp`, `/products/atelier-2/190573-2.webp`, `/products/atelier-2/190573-3.webp`] },
      { sku: `190577`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/atelier-2/190577.webp`, images: [`/products/atelier-2/190577.webp`, `/products/atelier-2/190577-2.webp`, `/products/atelier-2/190577-3.webp`] },
    ],
  },
  {
    slug: `backpacks-fender`,
    name: { pt: `Leather and canvas`, en: `Leather and canvas` },
    description: { pt: `For the second time, S.T. Dupont and Fender® are working together to create a rock line that combines the expertise of both companies. This backpack, made of smooth calfskin and canvas, combines modern design and functionality. The elegant, distinctive Fender® metal plate pays homage to the musical universe of Fender®, while adding a modern touch to this model. A practical and stylish bag, ideal for those looking to combine comfort, elegance and audacity in everyday life.`, en: `For the second time, S.T. Dupont and Fender® are working together to create a rock line that combines the expertise of both companies. This backpack, made of smooth calfskin and canvas, combines modern design and functionality. The elegant, distinctive Fender® metal plate pays homage to the musical universe of Fender®, while adding a modern touch to this model. A practical and stylish bag, ideal for those looking to combine comfort, elegance and audacity in everyday life.` },
    collection: `Fender`,
    categorySlug: "pele",
    image: `/products/backpacks-fender/1FE221BK1.webp`,
    variants: [
      { sku: `1FE221BK1`, name: { pt: `Leather and canvas — Grey`, en: `Leather and canvas — Grey` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Grey`, en: `Grey` }, hex: ["#7a7d83"] } }, image: `/products/backpacks-fender/1FE221BK1.webp`, images: [`/products/backpacks-fender/1FE221BK1.webp`, `/products/backpacks-fender/1FE221BK1-2.webp`, `/products/backpacks-fender/1FE221BK1-3.webp`, `/products/backpacks-fender/1FE221BK1-4.webp`] },
    ],
  },
  {
    slug: `cabas-fender`,
    name: { pt: `Leather and canvas`, en: `Leather and canvas` },
    description: { pt: `For the second time, S.T. Dupont and Fender® are working together to create a rock line that combines the expertise of both companies. This tote bag, in smooth calfskin and canvas, combines elegance and practicality with a touch of modernity. The subtly integrated Fender® metal plate echoes the musical universe of Fender®, while adding a contemporary note to this model. An ideal companion for those looking for a bag that is both functional and refined, perfect for urban days or getaways.`, en: `For the second time, S.T. Dupont and Fender® are working together to create a rock line that combines the expertise of both companies. This tote bag, in smooth calfskin and canvas, combines elegance and practicality with a touch of modernity. The subtly integrated Fender® metal plate echoes the musical universe of Fender®, while adding a contemporary note to this model. An ideal companion for those looking for a bag that is both functional and refined, perfect for urban days or getaways.` },
    collection: `Fender`,
    categorySlug: "pele",
    image: `/products/cabas-fender/1FE153BK1.webp`,
    variants: [
      { sku: `1FE153BK1`, name: { pt: `Leather and canvas — Grey`, en: `Leather and canvas — Grey` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Grey`, en: `Grey` }, hex: ["#7a7d83"] } }, image: `/products/cabas-fender/1FE153BK1.webp`, images: [`/products/cabas-fender/1FE153BK1.webp`, `/products/cabas-fender/1FE153BK1-2.webp`, `/products/cabas-fender/1FE153BK1-3.webp`, `/products/cabas-fender/1FE153BK1-4.webp`] },
    ],
  },
  {
    slug: `card-holder-fender`,
    name: { pt: `Leather and canvas`, en: `Leather and canvas` },
    description: { pt: `For the second time, S.T. Dupont and Fender® are working together to create a rock line that combines the expertise of both companies. This credit card holder, made of smooth calfskin and canvas, combines a compact and elegant design with optimal functionality. The elegant, distinctive Fender® metal plate pays homage to the musical universe of Fender®, while adding a modern touch to this model. An essential accessory for those looking to combine organization and style in everyday life.`, en: `For the second time, S.T. Dupont and Fender® are working together to create a rock line that combines the expertise of both companies. This credit card holder, made of smooth calfskin and canvas, combines a compact and elegant design with optimal functionality. The elegant, distinctive Fender® metal plate pays homage to the musical universe of Fender®, while adding a modern touch to this model. An essential accessory for those looking to combine organization and style in everyday life.` },
    collection: `Fender`,
    categorySlug: "pele",
    image: `/products/card-holder-fender/1FE683BK1.webp`,
    variants: [
      { sku: `1FE683BK1`, name: { pt: `Leather and canvas — Grey`, en: `Leather and canvas — Grey` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Grey`, en: `Grey` }, hex: ["#7a7d83"] } }, image: `/products/card-holder-fender/1FE683BK1.webp`, images: [`/products/card-holder-fender/1FE683BK1.webp`, `/products/card-holder-fender/1FE683BK1-2.webp`] },
    ],
  },
  {
    slug: `crossbody-fender`,
    name: { pt: `Leather and canvas`, en: `Leather and canvas` },
    description: { pt: `For the second time, S.T. Dupont and Fender® are working together to create a rock line that combines the expertise of both companies. This crossbody, in smooth calfskin and canvas, harmoniously combines elegance and character. The elegant, distinctive Fender® metal plate pays homage to the musical universe of Fender®, while adding a modern touch to this model. A versatile companion, perfect for those who appreciate a style that is both refined and bold.`, en: `For the second time, S.T. Dupont and Fender® are working together to create a rock line that combines the expertise of both companies. This crossbody, in smooth calfskin and canvas, harmoniously combines elegance and character. The elegant, distinctive Fender® metal plate pays homage to the musical universe of Fender®, while adding a modern touch to this model. A versatile companion, perfect for those who appreciate a style that is both refined and bold.` },
    collection: `Fender`,
    categorySlug: "pele",
    image: `/products/crossbody-fender/1FE181BK1.webp`,
    variants: [
      { sku: `1FE181BK1`, name: { pt: `Leather and canvas — Grey`, en: `Leather and canvas — Grey` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Grey`, en: `Grey` }, hex: ["#7a7d83"] } }, image: `/products/crossbody-fender/1FE181BK1.webp`, images: [`/products/crossbody-fender/1FE181BK1.webp`, `/products/crossbody-fender/1FE181BK1-2.webp`, `/products/crossbody-fender/1FE181BK1-3.webp`, `/products/crossbody-fender/1FE181BK1-4.webp`] },
    ],
  },
  {
    slug: `defi-explorer-2`,
    name: { pt: `Travel bag`, en: `Travel bag` },
    description: { pt: `Versatile and modern, this messenger combines water-repellent technical canvas and structured leather for a dynamic, urban style. Its compact design conceals optimized space, ideal for carrying documents and everyday essentials. Its secure flap and adjustable shoulder strap make it a perfect ally for professionals on the move. Available in khaki or black. Made in Italy`, en: `Versatile and modern, this messenger combines water-repellent technical canvas and structured leather for a dynamic, urban style. Its compact design conceals optimized space, ideal for carrying documents and everyday essentials. Its secure flap and adjustable shoulder strap make it a perfect ally for professionals on the move. Available in khaki or black. Made in Italy` },
    collection: `Défi Explorer`,
    categorySlug: "pele",
    image: `/products/defi-explorer-2/1IC223BK1.webp`,
    variants: [
      { sku: `1IC223BK1`, name: { pt: `Travel bag — Black`, en: `Travel bag — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/defi-explorer-2/1IC223BK1.webp`, images: [`/products/defi-explorer-2/1IC223BK1.webp`, `/products/defi-explorer-2/1IC223BK1-2.webp`, `/products/defi-explorer-2/1IC223BK1-3.webp`, `/products/defi-explorer-2/1IC223BK1-4.webp`] },
      { sku: `1IC223NK1`, name: { pt: `Travel bag — Khaki`, en: `Travel bag — Khaki` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Khaki`, en: `Khaki` }, hex: ["#3b5d39"] } }, image: `/products/defi-explorer-2/1IC223NK1.webp`, images: [`/products/defi-explorer-2/1IC223NK1.webp`, `/products/defi-explorer-2/1IC223NK1-2.webp`, `/products/defi-explorer-2/1IC223NK1-3.webp`, `/products/defi-explorer-2/1IC223NK1-4.webp`] },
      { sku: `1IC132BK1`, name: { pt: `Travel bag — Black`, en: `Travel bag — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/defi-explorer-2/1IC132BK1.webp`, images: [`/products/defi-explorer-2/1IC132BK1.webp`, `/products/defi-explorer-2/1IC132BK1-2.webp`, `/products/defi-explorer-2/1IC132BK1-3.webp`, `/products/defi-explorer-2/1IC132BK1-4.webp`] },
      { sku: `1IC194BK1`, name: { pt: `Travel bag — Black`, en: `Travel bag — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/defi-explorer-2/1IC194BK1.webp`, images: [`/products/defi-explorer-2/1IC194BK1.webp`, `/products/defi-explorer-2/1IC194BK1-2.webp`, `/products/defi-explorer-2/1IC194BK1-3.webp`, `/products/defi-explorer-2/1IC194BK1-4.webp`] },
      { sku: `1IC194NK1`, name: { pt: `Travel bag — Khaki`, en: `Travel bag — Khaki` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Khaki`, en: `Khaki` }, hex: ["#3b5d39"] } }, image: `/products/defi-explorer-2/1IC194NK1.webp`, images: [`/products/defi-explorer-2/1IC194NK1.webp`, `/products/defi-explorer-2/1IC194NK1-2.webp`, `/products/defi-explorer-2/1IC194NK1-3.webp`, `/products/defi-explorer-2/1IC194NK1-4.webp`] },
      { sku: `1IC231BK1`, name: { pt: `Travel bag — Black`, en: `Travel bag — Black` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/defi-explorer-2/1IC231BK1.webp`, images: [`/products/defi-explorer-2/1IC231BK1.webp`, `/products/defi-explorer-2/1IC231BK1-2.webp`, `/products/defi-explorer-2/1IC231BK1-3.webp`, `/products/defi-explorer-2/1IC231BK1-4.webp`] },
      { sku: `1IC23NK1`, name: { pt: `Travel bag — Khaki`, en: `Travel bag — Khaki` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Khaki`, en: `Khaki` }, hex: ["#3b5d39"] } }, image: `/products/defi-explorer-2/1IC23NK1.webp`, images: [`/products/defi-explorer-2/1IC23NK1.webp`, `/products/defi-explorer-2/1IC23NK1-2.webp`, `/products/defi-explorer-2/1IC23NK1-3.webp`, `/products/defi-explorer-2/1IC23NK1-4.webp`] },
    ],
  },
  {
    slug: `document-holders-fender`,
    name: { pt: `Leather and canvas`, en: `Leather and canvas` },
    description: { pt: `For the second time, S.T. Dupont and Fender® are working together to create a rock line that combines the expertise of both companies. This document holder, in smooth calfskin and canvas, combines elegance and functionality with a contemporary touch. The elegant, distinctive Fender® metal plate pays homage to the musical universe of Fender®, while adding a modern touch to this model. A chic and practical men’s bag, ideal for those who want to combine organization and style.`, en: `For the second time, S.T. Dupont and Fender® are working together to create a rock line that combines the expertise of both companies. This document holder, in smooth calfskin and canvas, combines elegance and functionality with a contemporary touch. The elegant, distinctive Fender® metal plate pays homage to the musical universe of Fender®, while adding a modern touch to this model. A chic and practical men’s bag, ideal for those who want to combine organization and style.` },
    collection: `Fender`,
    categorySlug: "pele",
    image: `/products/document-holders-fender/1FE104BK1.webp`,
    variants: [
      { sku: `1FE104BK1`, name: { pt: `Leather and canvas — Grey`, en: `Leather and canvas — Grey` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Grey`, en: `Grey` }, hex: ["#7a7d83"] } }, image: `/products/document-holders-fender/1FE104BK1.webp`, images: [`/products/document-holders-fender/1FE104BK1.webp`, `/products/document-holders-fender/1FE104BK1-2.webp`, `/products/document-holders-fender/1FE104BK1-3.webp`, `/products/document-holders-fender/1FE104BK1-4.webp`] },
    ],
  },
  {
    slug: `travel-bags-fender`,
    name: { pt: `Leather and canvas`, en: `Leather and canvas` },
    description: { pt: `For the second time, S.T. Dupont and Fender® are working together to create a rock line that combines the expertise of both companies. This travel bag, made of smooth calfskin and canvas, combines practicality and elegance in a refined design. The discreet and distinctive Fender® metal plate references the musical universe of Fender®, while adding a modern and elegant touch to this model. An ideal companion for weekends, offering comfort, style and durability.`, en: `For the second time, S.T. Dupont and Fender® are working together to create a rock line that combines the expertise of both companies. This travel bag, made of smooth calfskin and canvas, combines practicality and elegance in a refined design. The discreet and distinctive Fender® metal plate references the musical universe of Fender®, while adding a modern and elegant touch to this model. An ideal companion for weekends, offering comfort, style and durability.` },
    collection: `Fender`,
    categorySlug: "pele",
    image: `/products/travel-bags-fender/1FE231BK1.webp`,
    variants: [
      { sku: `1FE231BK1`, name: { pt: `Leather and canvas — Grey`, en: `Leather and canvas — Grey` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Grey`, en: `Grey` }, hex: ["#7a7d83"] } }, image: `/products/travel-bags-fender/1FE231BK1.webp`, images: [`/products/travel-bags-fender/1FE231BK1.webp`, `/products/travel-bags-fender/1FE231BK1-2.webp`, `/products/travel-bags-fender/1FE231BK1-3.webp`] },
    ],
  },
  {
    slug: `wallet-fender`,
    name: { pt: `Leather and canvas`, en: `Leather and canvas` },
    description: { pt: `For the second time, S.T. Dupont and Fender® are working together to create a rock line that combines the expertise of both companies. This 6CC billfold, in smooth calfskin and canvas, combines elegance and functionality in a practical and compact format. The elegant, distinctive Fender® metal plate pays homage to the musical universe of Fender®, while adding a modern touch to this model. A compact wallet, perfect for those looking to combine organization, practicality and style.`, en: `For the second time, S.T. Dupont and Fender® are working together to create a rock line that combines the expertise of both companies. This 6CC billfold, in smooth calfskin and canvas, combines elegance and functionality in a practical and compact format. The elegant, distinctive Fender® metal plate pays homage to the musical universe of Fender®, while adding a modern touch to this model. A compact wallet, perfect for those looking to combine organization, practicality and style.` },
    collection: `Fender`,
    categorySlug: "pele",
    image: `/products/wallet-fender/1FE561BK1.webp`,
    variants: [
      { sku: `1FE561BK1`, name: { pt: `Leather and canvas — Grey`, en: `Leather and canvas — Grey` }, priceCents: 9900, currency: "EUR", attributes: { color: { label: { pt: `Grey`, en: `Grey` }, hex: ["#7a7d83"] } }, image: `/products/wallet-fender/1FE561BK1.webp`, images: [`/products/wallet-fender/1FE561BK1.webp`, `/products/wallet-fender/1FE561BK1-2.webp`] },
    ],
  },  // === END EN STORE IMPORTS ===

  // === BEGIN WWW STORE IMPORTS (www.st-dupont.com) ===
  {
    slug: `pen-case-3`,
    name: { pt: `Pen case`, en: `Pen case` },
    description: { pt: `Inspired by the iconic house cigar cases, S.T. Dupont offers a new collection of pens, thought to be functional while offering an elegant and contemporary design. Made of high quality grained veal leather, this rigid case is the essential and sophisticated accessory to protect your writing instruments when traveling. This setting can accommodate two writing instruments (medium or wide).`, en: `Inspired by the iconic house cigar cases, S.T. Dupont offers a new collection of pens, thought to be functional while offering an elegant and contemporary design. Made of high quality grained veal leather, this rigid case is the essential and sophisticated accessory to protect your writing instruments when traveling. This setting can accommodate two writing instruments (medium or wide).` },
    collection: `Pen Cases`,
    categorySlug: "acessorios",
    image: `/products/pen-case-3/007155.webp`,
    variants: [
      { sku: `007155`, name: { pt: `Pen case — Black`, en: `Pen case — Black` }, priceCents: 12000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/pen-case-3/007155.webp`, images: [`/products/pen-case-3/007155.webp`, `/products/pen-case-3/007155-2.webp`] },
      { sku: `007158`, name: { pt: `Pen case — Gold`, en: `Pen case — Gold` }, priceCents: 16000, currency: "EUR", attributes: { color: { label: { pt: `Gold`, en: `Gold` }, hex: ["#c8a24a"] } }, image: `/products/pen-case-3/007158.webp`, images: [`/products/pen-case-3/007158.webp`, `/products/pen-case-3/007158-2.webp`] },
      { sku: `007157`, name: { pt: `Pen case — Silver`, en: `Pen case — Silver` }, priceCents: 16000, currency: "EUR", attributes: { color: { label: { pt: `Silver`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/pen-case-3/007157.webp`, images: [`/products/pen-case-3/007157.webp`, `/products/pen-case-3/007157-2.webp`] },
      { sku: `007159`, name: { pt: `Pen case — Silver`, en: `Pen case — Silver` }, priceCents: 23000, currency: "EUR", attributes: { color: { label: { pt: `Silver`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/pen-case-3/007159.webp`, images: [`/products/pen-case-3/007159.webp`, `/products/pen-case-3/007159-2.webp`, `/products/pen-case-3/007159-3.webp`] },
      { sku: `007160`, name: { pt: `Pen case — Gold`, en: `Pen case — Gold` }, priceCents: 23000, currency: "EUR", attributes: { color: { label: { pt: `Gold`, en: `Gold` }, hex: ["#c8a24a"] } }, image: `/products/pen-case-3/007160.webp`, images: [`/products/pen-case-3/007160.webp`, `/products/pen-case-3/007160-2.webp`, `/products/pen-case-3/007160-3.webp`] },
      { sku: `007174`, name: { pt: `Pen case — Black`, en: `Pen case — Black` }, priceCents: 19000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/pen-case-3/007174.webp`, images: [`/products/pen-case-3/007174.webp`, `/products/pen-case-3/007174-2.webp`] },
      { sku: `007122`, name: { pt: `Pen case — Lilac`, en: `Pen case — Lilac` }, priceCents: 14000, currency: "EUR", attributes: { color: { label: { pt: `Lilac`, en: `Lilac` }, hex: ["#6b4a8a"] } }, image: `/products/pen-case-3/007122.webp`, images: [`/products/pen-case-3/007122.webp`, `/products/pen-case-3/007122-2.webp`] },
      { sku: `007126`, name: { pt: `Pen case — Fir Green`, en: `Pen case — Fir Green` }, priceCents: 14000, currency: "EUR", attributes: { color: { label: { pt: `Fir Green`, en: `Fir Green` }, hex: ["#3b5d39"] } }, image: `/products/pen-case-3/007126.webp`, images: [`/products/pen-case-3/007126.webp`, `/products/pen-case-3/007126-2.webp`] },
      { sku: `007128`, name: { pt: `Pen case — Fir Green`, en: `Pen case — Fir Green` }, priceCents: 20000, currency: "EUR", attributes: { color: { label: { pt: `Fir Green`, en: `Fir Green` }, hex: ["#3b5d39"] } }, image: `/products/pen-case-3/007128.webp`, images: [`/products/pen-case-3/007128.webp`, `/products/pen-case-3/007128-2.webp`, `/products/pen-case-3/007128-3.webp`] },
      { sku: `007129`, name: { pt: `Pen case — Lilac`, en: `Pen case — Lilac` }, priceCents: 20000, currency: "EUR", attributes: { color: { label: { pt: `Lilac`, en: `Lilac` }, hex: ["#6b4a8a"] } }, image: `/products/pen-case-3/007129.webp`, images: [`/products/pen-case-3/007129.webp`, `/products/pen-case-3/007129-2.webp`, `/products/pen-case-3/007129-3.webp`] },
      { sku: `007167`, name: { pt: `Pen case — Black`, en: `Pen case — Black` }, priceCents: 17000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/pen-case-3/007167.webp`, images: [`/products/pen-case-3/007167.webp`, `/products/pen-case-3/007167-2.webp`] },
      { sku: `007168`, name: { pt: `Pen case — Red`, en: `Pen case — Red` }, priceCents: 14000, currency: "EUR", attributes: { color: { label: { pt: `Red`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/pen-case-3/007168.webp`, images: [`/products/pen-case-3/007168.webp`, `/products/pen-case-3/007168-2.webp`] },
      { sku: `007171`, name: { pt: `Pen case — Orange`, en: `Pen case — Orange` }, priceCents: 14000, currency: "EUR", attributes: { color: { label: { pt: `Orange`, en: `Orange` }, hex: ["#c8a24a"] } }, image: `/products/pen-case-3/007171.webp`, images: [`/products/pen-case-3/007171.webp`, `/products/pen-case-3/007171-2.webp`] },
      { sku: `007169`, name: { pt: `Pen case — Red`, en: `Pen case — Red` }, priceCents: 21000, currency: "EUR", attributes: { color: { label: { pt: `Red`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/pen-case-3/007169.webp`, images: [`/products/pen-case-3/007169.webp`, `/products/pen-case-3/007169-2.webp`, `/products/pen-case-3/007169-3.webp`] },
      { sku: `007172`, name: { pt: `Pen case — Orange`, en: `Pen case — Orange` }, priceCents: 21000, currency: "EUR", attributes: { color: { label: { pt: `Orange`, en: `Orange` }, hex: ["#c8a24a"] } }, image: `/products/pen-case-3/007172.webp`, images: [`/products/pen-case-3/007172.webp`, `/products/pen-case-3/007172-2.webp`, `/products/pen-case-3/007172-3.webp`] },
      { sku: `007112`, name: { pt: `Pen case — Black`, en: `Pen case — Black` }, priceCents: 57500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/pen-case-3/007112.webp`, images: [`/products/pen-case-3/007112.webp`, `/products/pen-case-3/007112-2.webp`, `/products/pen-case-3/007112-3.webp`, `/products/pen-case-3/007112-4.webp`] },
      { sku: `007133`, name: { pt: `Pen case — Lilac`, en: `Pen case — Lilac` }, priceCents: 22000, currency: "EUR", attributes: { color: { label: { pt: `Lilac`, en: `Lilac` }, hex: ["#6b4a8a"] } }, image: `/products/pen-case-3/007133.webp`, images: [`/products/pen-case-3/007133.webp`, `/products/pen-case-3/007133-2.webp`, `/products/pen-case-3/007133-3.webp`] },
      { sku: `007134`, name: { pt: `Pen case — Fir Green`, en: `Pen case — Fir Green` }, priceCents: 22000, currency: "EUR", attributes: { color: { label: { pt: `Fir Green`, en: `Fir Green` }, hex: ["#3b5d39"] } }, image: `/products/pen-case-3/007134.webp`, images: [`/products/pen-case-3/007134.webp`, `/products/pen-case-3/007134-2.webp`, `/products/pen-case-3/007134-3.webp`] },
      { sku: `007170`, name: { pt: `Pen case — Red`, en: `Pen case — Red` }, priceCents: 23000, currency: "EUR", attributes: { color: { label: { pt: `Red`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/pen-case-3/007170.webp`, images: [`/products/pen-case-3/007170.webp`, `/products/pen-case-3/007170-2.webp`, `/products/pen-case-3/007170-3.webp`] },
      { sku: `007173`, name: { pt: `Pen case — Orange`, en: `Pen case — Orange` }, priceCents: 23000, currency: "EUR", attributes: { color: { label: { pt: `Orange`, en: `Orange` }, hex: ["#c8a24a"] } }, image: `/products/pen-case-3/007173.webp`, images: [`/products/pen-case-3/007173.webp`, `/products/pen-case-3/007173-2.webp`, `/products/pen-case-3/007173-3.webp`] },
      { sku: `007111`, name: { pt: `Pen case — Black`, en: `Pen case — Black` }, priceCents: 31500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/pen-case-3/007111.webp`, images: [`/products/pen-case-3/007111.webp`, `/products/pen-case-3/007111-2.webp`, `/products/pen-case-3/007111-3.webp`, `/products/pen-case-3/007111-4.webp`] },
      { sku: `007113`, name: { pt: `Pen case — Black`, en: `Pen case — Black` }, priceCents: 24000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/pen-case-3/007113.webp`, images: [`/products/pen-case-3/007113.webp`, `/products/pen-case-3/007113-2.webp`, `/products/pen-case-3/007113-3.webp`, `/products/pen-case-3/007113-4.webp`] },
    ],
  },
  {
    slug: `humidor-2`,
    name: { pt: `Humidor 8 cigars`, en: `Humidor 8 cigars` },
    description: { pt: `Inspired by the art of preserving cigar quality in any situation, this practical humidified bag can hold up to four cigars, keeping them fresh and perfectly conditioned until the moment of enjoyment. Thanks to its poly-bag technology with a semi-permeable membrane, it maintains an ideal humidity level (around 65–72%), ensuring freshness and flavor. Lightweight and compact, it is designed to accompany you on all your travels. Box of 10 cigar bags`, en: `Inspired by the art of preserving cigar quality in any situation, this practical humidified bag can hold up to four cigars, keeping them fresh and perfectly conditioned until the moment of enjoyment. Thanks to its poly-bag technology with a semi-permeable membrane, it maintains an ideal humidity level (around 65–72%), ensuring freshness and flavor. Lightweight and compact, it is designed to accompany you on all your travels. Box of 10 cigar bags` },
    collection: `Humidors`,
    categorySlug: "acessorios",
    image: `/products/humidor-2/001320.webp`,
    variants: [
      { sku: `001320`, name: { pt: `Humidor 8 cigars — Black`, en: `Humidor 8 cigars — Black` }, priceCents: 3000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/humidor-2/001320.webp`, images: [`/products/humidor-2/001320.webp`] },
      { sku: `001312`, name: { pt: `Humidor 8 cigars — Black`, en: `Humidor 8 cigars — Black` }, priceCents: 127000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/humidor-2/001312.webp`, images: [`/products/humidor-2/001312.webp`, `/products/humidor-2/001312-2.webp`, `/products/humidor-2/001312-3.webp`] },
      { sku: `001316`, name: { pt: `Humidor 8 cigars — Black`, en: `Humidor 8 cigars — Black` }, priceCents: 86500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/humidor-2/001316.webp`, images: [`/products/humidor-2/001316.webp`, `/products/humidor-2/001316-2.webp`, `/products/humidor-2/001316-3.webp`, `/products/humidor-2/001316-4.webp`] },
      { sku: `001357`, name: { pt: `Humidor 8 cigars — Black`, en: `Humidor 8 cigars — Black` }, priceCents: 44500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/humidor-2/001357.webp`, images: [`/products/humidor-2/001357.webp`, `/products/humidor-2/001357-2.webp`, `/products/humidor-2/001357-3.webp`] },
    ],
  },
  {
    slug: `notebook`,
    name: { pt: `A5`, en: `A5` },
    description: { pt: `S.T Dupont A5 embossed notebook in black color`, en: `S.T Dupont A5 embossed notebook in black color` },
    collection: `Notebook`,
    categorySlug: "acessorios",
    image: `/products/notebook/007114.webp`,
    variants: [
      { sku: `007114`, name: { pt: `A5 — Black`, en: `A5 — Black` }, priceCents: 6000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/notebook/007114.webp`, images: [`/products/notebook/007114.webp`, `/products/notebook/007114-2.webp`, `/products/notebook/007114-3.webp`, `/products/notebook/007114-4.webp`] },
      { sku: `007115`, name: { pt: `A5 — Blue & Dark Blue`, en: `A5 — Blue & Dark Blue` }, priceCents: 6000, currency: "EUR", attributes: { color: { label: { pt: `Blue & Dark Blue`, en: `Blue & Dark Blue` }, hex: ["#1f3c66"] } }, image: `/products/notebook/007115.webp`, images: [`/products/notebook/007115.webp`, `/products/notebook/007115-2.webp`, `/products/notebook/007115-3.webp`, `/products/notebook/007115-4.webp`] },
    ],
  },
  {
    slug: `misc`,
    name: { pt: `Le Grand Dupont`, en: `Le Grand Dupont` },
    description: { pt: `The flap lighter case is the perfect accessory to protect your lighter while enhancing it with timeless style, adorned with the famous "D" of the house and crafted from smooth black leather, it combines style and protection with elegance and modernity, it is available for Le Grand Dupont and Ligne 2 models, black lighter case for Le Grand Dupont with flap, smooth calf leather, with the iconic "D" signature, back belt loop with embossed S.T. Dupont signature.`, en: `The flap lighter case is the perfect accessory to protect your lighter while enhancing it with timeless style, adorned with the famous "D" of the house and crafted from smooth black leather, it combines style and protection with elegance and modernity, it is available for Le Grand Dupont and Ligne 2 models, black lighter case for Le Grand Dupont with flap, smooth calf leather, with the iconic "D" signature, back belt loop with embossed S.T. Dupont signature.` },
    collection: `Misc`,
    categorySlug: "acessorios",
    image: `/products/misc/007153.webp`,
    variants: [
      { sku: `007153`, name: { pt: `Le Grand Dupont — Grey`, en: `Le Grand Dupont — Grey` }, priceCents: 7500, currency: "EUR", attributes: { color: { label: { pt: `Grey`, en: `Grey` }, hex: ["#7a7d83"] } }, image: `/products/misc/007153.webp`, images: [`/products/misc/007153.webp`, `/products/misc/007153-2.webp`] },
      { sku: `007154`, name: { pt: `Le Grand Dupont — Variante 7154`, en: `Le Grand Dupont — Variant 7154` }, priceCents: 7500, currency: "EUR", attributes: { color: { label: { pt: `Variante 7154`, en: `Variant 7154` }, hex: ["#7a7d83"] } }, image: `/products/misc/007154.webp`, images: [`/products/misc/007154.webp`, `/products/misc/007154-2.webp`] },
      { sku: `007152`, name: { pt: `Le Grand Dupont — Variante 7152`, en: `Le Grand Dupont — Variant 7152` }, priceCents: 7500, currency: "EUR", attributes: { color: { label: { pt: `Variante 7152`, en: `Variant 7152` }, hex: ["#7a7d83"] } }, image: `/products/misc/007152.webp`, images: [`/products/misc/007152.webp`, `/products/misc/007152-2.webp`] },
      { sku: `CUSTOMIZATION`, name: { pt: `Le Grand Dupont — Variante TION`, en: `Le Grand Dupont — Variant TION` }, priceCents: 2000, currency: "EUR", attributes: { color: { label: { pt: `Variante TION`, en: `Variant TION` }, hex: ["#7a7d83"] } }, image: `/products/misc/CUSTOMIZATION.webp`, images: [`/products/misc/CUSTOMIZATION.webp`] },
      { sku: `180023C`, name: { pt: `Le Grand Dupont — Variante 023C`, en: `Le Grand Dupont — Variant 023C` }, priceCents: 18000, currency: "EUR", attributes: { color: { label: { pt: `Variante 023C`, en: `Variant 023C` }, hex: ["#7a7d83"] } }, image: `/products/misc/180023C.webp`, images: [`/products/misc/180023C.webp`, `/products/misc/180023C-2.webp`] },
      { sku: `180123C`, name: { pt: `Le Grand Dupont — Variante 123C`, en: `Le Grand Dupont — Variant 123C` }, priceCents: 18000, currency: "EUR", attributes: { color: { label: { pt: `Variante 123C`, en: `Variant 123C` }, hex: ["#7a7d83"] } }, image: `/products/misc/180123C.webp`, images: [`/products/misc/180123C.webp`, `/products/misc/180123C-2.webp`] },
    ],
  },
  {
    slug: `firehead-2`,
    name: { pt: `Wallet`, en: `Wallet` },
    description: { pt: `Le messenger est le compagnon parfait pour la ville. Avec son grand compartiment intérieur et sa pochette pour ordinateur, sa bandoulière ajustable et ses nombreux compartiments internes pour stylos et briquets, il vous accompagnera partout. Fabriqué en cuir de veau pleine fleur embossé avec le motif pointe de feu, tous les produits de la collection Firehead sont certifiés LWG. Il comprend : - 1 pochette avant avec aimant, - 1 pochette zippée, - 2 compartiments pour instruments d'écriture, - 1 poche plate, - 1 compartiment pour briquets.`, en: `Le messenger est le compagnon parfait pour la ville. Avec son grand compartiment intérieur et sa pochette pour ordinateur, sa bandoulière ajustable et ses nombreux compartiments internes pour stylos et briquets, il vous accompagnera partout. Fabriqué en cuir de veau pleine fleur embossé avec le motif pointe de feu, tous les produits de la collection Firehead sont certifiés LWG. Il comprend : - 1 pochette avant avec aimant, - 1 pochette zippée, - 2 compartiments pour instruments d'écriture, - 1 poche plate, - 1 compartiment pour briquets.` },
    collection: `Firehead`,
    categorySlug: "pele",
    image: `/products/firehead-2/160004.webp`,
    variants: [
      { sku: `160004`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 100000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/firehead-2/160004.webp`, images: [`/products/firehead-2/160004.webp`, `/products/firehead-2/160004-2.webp`, `/products/firehead-2/160004-3.webp`, `/products/firehead-2/160004-4.webp`] },
      { sku: `161609`, name: { pt: `Wallet — Blue`, en: `Wallet — Blue` }, priceCents: 19000, currency: "EUR", attributes: { color: { label: { pt: `Blue`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/firehead-2/161609.webp`, images: [`/products/firehead-2/161609.webp`, `/products/firehead-2/161609-2.webp`] },
      { sku: `161613`, name: { pt: `Wallet — Blue`, en: `Wallet — Blue` }, priceCents: 19000, currency: "EUR", attributes: { color: { label: { pt: `Blue`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/firehead-2/161613.webp`, images: [`/products/firehead-2/161613.webp`, `/products/firehead-2/161613-2.webp`] },
      { sku: `160005`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 100000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/firehead-2/160005.webp`, images: [`/products/firehead-2/160005.webp`, `/products/firehead-2/160005-2.webp`, `/products/firehead-2/160005-3.webp`, `/products/firehead-2/160005-4.webp`] },
      { sku: `160010`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 66500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/firehead-2/160010.webp`, images: [`/products/firehead-2/160010.webp`, `/products/firehead-2/160010-2.webp`, `/products/firehead-2/160010-3.webp`, `/products/firehead-2/160010-4.webp`] },
      { sku: `160008`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 149000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/firehead-2/160008.webp`, images: [`/products/firehead-2/160008.webp`, `/products/firehead-2/160008-2.webp`, `/products/firehead-2/160008-3.webp`, `/products/firehead-2/160008-4.webp`] },
      { sku: `160610`, name: { pt: `Wallet — Blue`, en: `Wallet — Blue` }, priceCents: 66500, currency: "EUR", attributes: { color: { label: { pt: `Blue`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/firehead-2/160610.webp`, images: [`/products/firehead-2/160610.webp`, `/products/firehead-2/160610-2.webp`, `/products/firehead-2/160610-3.webp`, `/products/firehead-2/160610-4.webp`] },
      { sku: `160009`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 79500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/firehead-2/160009.webp`, images: [`/products/firehead-2/160009.webp`, `/products/firehead-2/160009-2.webp`, `/products/firehead-2/160009-3.webp`, `/products/firehead-2/160009-4.webp`] },
      { sku: `160609`, name: { pt: `Wallet — Blue`, en: `Wallet — Blue` }, priceCents: 79500, currency: "EUR", attributes: { color: { label: { pt: `Blue`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/firehead-2/160609.webp`, images: [`/products/firehead-2/160609.webp`, `/products/firehead-2/160609-2.webp`, `/products/firehead-2/160609-3.webp`, `/products/firehead-2/160609-4.webp`] },
      { sku: `161114`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 23000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/firehead-2/161114.webp`, images: [`/products/firehead-2/161114.webp`, `/products/firehead-2/161114-2.webp`] },
      { sku: `161614`, name: { pt: `Wallet — Blue`, en: `Wallet — Blue` }, priceCents: 23000, currency: "EUR", attributes: { color: { label: { pt: `Blue`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/firehead-2/161614.webp`, images: [`/products/firehead-2/161614.webp`, `/products/firehead-2/161614-2.webp`] },
      { sku: `160012`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 55500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/firehead-2/160012.webp`, images: [`/products/firehead-2/160012.webp`, `/products/firehead-2/160012-2.webp`, `/products/firehead-2/160012-3.webp`, `/products/firehead-2/160012-4.webp`] },
      { sku: `160001`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 76500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/firehead-2/160001.webp`, images: [`/products/firehead-2/160001.webp`, `/products/firehead-2/160001-2.webp`, `/products/firehead-2/160001-3.webp`, `/products/firehead-2/160001-4.webp`] },
      { sku: `160007`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 100000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/firehead-2/160007.webp`, images: [`/products/firehead-2/160007.webp`, `/products/firehead-2/160007-2.webp`, `/products/firehead-2/160007-3.webp`, `/products/firehead-2/160007-4.webp`] },
      { sku: `161108`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 24000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/firehead-2/161108.webp`, images: [`/products/firehead-2/161108.webp`, `/products/firehead-2/161108-2.webp`] },
      { sku: `161608`, name: { pt: `Wallet — Blue`, en: `Wallet — Blue` }, priceCents: 24000, currency: "EUR", attributes: { color: { label: { pt: `Blue`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/firehead-2/161608.webp`, images: [`/products/firehead-2/161608.webp`, `/products/firehead-2/161608-2.webp`] },
      { sku: `161111`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 23000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/firehead-2/161111.webp`, images: [`/products/firehead-2/161111.webp`, `/products/firehead-2/161111-2.webp`] },
      { sku: `161611`, name: { pt: `Wallet — Blue`, en: `Wallet — Blue` }, priceCents: 23000, currency: "EUR", attributes: { color: { label: { pt: `Blue`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/firehead-2/161611.webp`, images: [`/products/firehead-2/161611.webp`, `/products/firehead-2/161611-2.webp`, `/products/firehead-2/161611-3.webp`] },
      { sku: `161112`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 22000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/firehead-2/161112.webp`, images: [`/products/firehead-2/161112.webp`, `/products/firehead-2/161112-2.webp`] },
      { sku: `161612`, name: { pt: `Wallet — Blue`, en: `Wallet — Blue` }, priceCents: 22000, currency: "EUR", attributes: { color: { label: { pt: `Blue`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/firehead-2/161612.webp`, images: [`/products/firehead-2/161612.webp`, `/products/firehead-2/161612-2.webp`, `/products/firehead-2/161612-3.webp`] },
      { sku: `161115`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 25000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/firehead-2/161115.webp`, images: [`/products/firehead-2/161115.webp`, `/products/firehead-2/161115-2.webp`] },
      { sku: `161116`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 37500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/firehead-2/161116.webp`, images: [`/products/firehead-2/161116.webp`, `/products/firehead-2/161116-2.webp`, `/products/firehead-2/161116-3.webp`, `/products/firehead-2/161116-4.webp`] },
      { sku: `1FD571BK1`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 29000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/firehead-2/1FD571BK1.webp`, images: [`/products/firehead-2/1FD571BK1.webp`, `/products/firehead-2/1FD571BK1-2.webp`] },
    ],
  },
  {
    slug: `apex`,
    name: { pt: `Zip Card holder`, en: `Zip Card holder` },
    description: { pt: `The Nano Trunk Apex is an elegant reinterpretation of the famous trunk suitcases once created by Mr. Dupont for influential figures. This unisex bag, more compact than ever, features vibrant colors and has become the essential accessory for the modern man and woman. Like its predecessors, the Nano Trunk is versatile, refined, and rich in heritage and captivating stories. Made in Italy, this model is crafted from full-grain leather with a gray cotton lining and palladium finishes. It features an adjustable strap for practical and adaptable use. With its cool blue gradient and glossy finish, the apex nano trunk evokes the dancing flame of S.T. Dupont lighters (blue for the torch flame and orange for the more yellow flame), as well as the art of lacquer. The leather used for the Nano Trunk is LWG certified, guaranteeing environmentally friendly production.`, en: `The Nano Trunk Apex is an elegant reinterpretation of the famous trunk suitcases once created by Mr. Dupont for influential figures. This unisex bag, more compact than ever, features vibrant colors and has become the essential accessory for the modern man and woman. Like its predecessors, the Nano Trunk is versatile, refined, and rich in heritage and captivating stories. Made in Italy, this model is crafted from full-grain leather with a gray cotton lining and palladium finishes. It features an adjustable strap for practical and adaptable use. With its cool blue gradient and glossy finish, the apex nano trunk evokes the dancing flame of S.T. Dupont lighters (blue for the torch flame and orange for the more yellow flame), as well as the art of lacquer. The leather used for the Nano Trunk is LWG certified, guaranteeing environmentally friendly production.` },
    collection: `Apex`,
    categorySlug: "pele",
    image: `/products/apex/1AX221BK1.webp`,
    variants: [
      { sku: `1AX221BK1`, name: { pt: `Zip Card holder — Black`, en: `Zip Card holder — Black` }, priceCents: 149000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/apex/1AX221BK1.webp`, images: [`/products/apex/1AX221BK1.webp`, `/products/apex/1AX221BK1-2.webp`, `/products/apex/1AX221BK1-3.webp`, `/products/apex/1AX221BK1-4.webp`] },
      { sku: `1AX221GN2`, name: { pt: `Zip Card holder — Grey`, en: `Zip Card holder — Grey` }, priceCents: 149000, currency: "EUR", attributes: { color: { label: { pt: `Grey`, en: `Grey` }, hex: ["#7a7d83"] } }, image: `/products/apex/1AX221GN2.webp`, images: [`/products/apex/1AX221GN2.webp`, `/products/apex/1AX221GN2-2.webp`, `/products/apex/1AX221GN2-3.webp`, `/products/apex/1AX221GN2-4.webp`] },
      { sku: `1AX683BK1`, name: { pt: `Zip Card holder — Black`, en: `Zip Card holder — Black` }, priceCents: 22500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/apex/1AX683BK1.webp`, images: [`/products/apex/1AX683BK1.webp`, `/products/apex/1AX683BK1-2.webp`] },
      { sku: `1AX683UN1`, name: { pt: `Zip Card holder — Indigo Blue`, en: `Zip Card holder — Indigo Blue` }, priceCents: 22500, currency: "EUR", attributes: { color: { label: { pt: `Indigo Blue`, en: `Indigo Blue` }, hex: ["#1f3c66"] } }, image: `/products/apex/1AX683UN1.webp`, images: [`/products/apex/1AX683UN1.webp`, `/products/apex/1AX683UN1-2.webp`] },
      { sku: `1AX683UL1`, name: { pt: `Zip Card holder — Light Blue`, en: `Zip Card holder — Light Blue` }, priceCents: 22500, currency: "EUR", attributes: { color: { label: { pt: `Light Blue`, en: `Light Blue` }, hex: ["#1f3c66"] } }, image: `/products/apex/1AX683UL1.webp`, images: [`/products/apex/1AX683UL1.webp`, `/products/apex/1AX683UL1-2.webp`] },
      { sku: `1AX683PL2`, name: { pt: `Zip Card holder — Light Pink`, en: `Zip Card holder — Light Pink` }, priceCents: 22500, currency: "EUR", attributes: { color: { label: { pt: `Light Pink`, en: `Light Pink` }, hex: ["#c97a8c"] } }, image: `/products/apex/1AX683PL2.webp`, images: [`/products/apex/1AX683PL2.webp`, `/products/apex/1AX683PL2-2.webp`] },
      { sku: `1AX532BK1`, name: { pt: `Zip Card holder — Black`, en: `Zip Card holder — Black` }, priceCents: 29000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/apex/1AX532BK1.webp`, images: [`/products/apex/1AX532BK1.webp`, `/products/apex/1AX532BK1-2.webp`] },
      { sku: `1AX532UN1`, name: { pt: `Zip Card holder — Indigo Blue`, en: `Zip Card holder — Indigo Blue` }, priceCents: 29000, currency: "EUR", attributes: { color: { label: { pt: `Indigo Blue`, en: `Indigo Blue` }, hex: ["#1f3c66"] } }, image: `/products/apex/1AX532UN1.webp`, images: [`/products/apex/1AX532UN1.webp`, `/products/apex/1AX532UN1-2.webp`] },
      { sku: `1AX683UD1`, name: { pt: `Zip Card holder — Blue & Dark Blue`, en: `Zip Card holder — Blue & Dark Blue` }, priceCents: 22500, currency: "EUR", attributes: { color: { label: { pt: `Blue & Dark Blue`, en: `Blue & Dark Blue` }, hex: ["#1f3c66"] } }, image: `/products/apex/1AX683UD1.webp`, images: [`/products/apex/1AX683UD1.webp`, `/products/apex/1AX683UD1-2.webp`] },
      { sku: `1AX513SV2`, name: { pt: `Zip Card holder — Silver`, en: `Zip Card holder — Silver` }, priceCents: 27000, currency: "EUR", attributes: { color: { label: { pt: `Silver`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/apex/1AX513SV2.webp`, images: [`/products/apex/1AX513SV2.webp`, `/products/apex/1AX513SV2-2.webp`] },
      { sku: `1AX132BK1`, name: { pt: `Zip Card holder — Black`, en: `Zip Card holder — Black` }, priceCents: 156500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/apex/1AX132BK1.webp`, images: [`/products/apex/1AX132BK1.webp`, `/products/apex/1AX132BK1-2.webp`, `/products/apex/1AX132BK1-3.webp`, `/products/apex/1AX132BK1-4.webp`] },
      { sku: `1AX132GN2`, name: { pt: `Zip Card holder — Grey`, en: `Zip Card holder — Grey` }, priceCents: 156500, currency: "EUR", attributes: { color: { label: { pt: `Grey`, en: `Grey` }, hex: ["#7a7d83"] } }, image: `/products/apex/1AX132GN2.webp`, images: [`/products/apex/1AX132GN2.webp`, `/products/apex/1AX132GN2-2.webp`, `/products/apex/1AX132GN2-3.webp`, `/products/apex/1AX132GN2-4.webp`] },
      { sku: `1AX101BK1`, name: { pt: `Zip Card holder — Black`, en: `Zip Card holder — Black` }, priceCents: 196500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/apex/1AX101BK1.webp`, images: [`/products/apex/1AX101BK1.webp`, `/products/apex/1AX101BK1-2.webp`, `/products/apex/1AX101BK1-3.webp`, `/products/apex/1AX101BK1-4.webp`] },
      { sku: `1AX192BK1`, name: { pt: `Zip Card holder — Black`, en: `Zip Card holder — Black` }, priceCents: 156500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/apex/1AX192BK1.webp`, images: [`/products/apex/1AX192BK1.webp`, `/products/apex/1AX192BK1-2.webp`, `/products/apex/1AX192BK1-3.webp`, `/products/apex/1AX192BK1-4.webp`] },
      { sku: `1AX192UN1`, name: { pt: `Zip Card holder — Indigo Blue`, en: `Zip Card holder — Indigo Blue` }, priceCents: 155000, currency: "EUR", attributes: { color: { label: { pt: `Indigo Blue`, en: `Indigo Blue` }, hex: ["#1f3c66"] } }, image: `/products/apex/1AX192UN1.webp`, images: [`/products/apex/1AX192UN1.webp`, `/products/apex/1AX192UN1-2.webp`, `/products/apex/1AX192UN1-3.webp`, `/products/apex/1AX192UN1-4.webp`] },
      { sku: `1AX192PL2`, name: { pt: `Zip Card holder — Light Pink`, en: `Zip Card holder — Light Pink` }, priceCents: 155000, currency: "EUR", attributes: { color: { label: { pt: `Light Pink`, en: `Light Pink` }, hex: ["#c97a8c"] } }, image: `/products/apex/1AX192PL2.webp`, images: [`/products/apex/1AX192PL2.webp`, `/products/apex/1AX192PL2-2.webp`, `/products/apex/1AX192PL2-3.webp`, `/products/apex/1AX192PL2-4.webp`] },
      { sku: `1AX192SV2`, name: { pt: `Zip Card holder — Silver`, en: `Zip Card holder — Silver` }, priceCents: 161500, currency: "EUR", attributes: { color: { label: { pt: `Silver`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/apex/1AX192SV2.webp`, images: [`/products/apex/1AX192SV2.webp`, `/products/apex/1AX192SV2-2.webp`, `/products/apex/1AX192SV2-3.webp`, `/products/apex/1AX192SV2-4.webp`] },
      { sku: `1AX192ND1`, name: { pt: `Zip Card holder — Fir Green`, en: `Zip Card holder — Fir Green` }, priceCents: 155000, currency: "EUR", attributes: { color: { label: { pt: `Fir Green`, en: `Fir Green` }, hex: ["#3b5d39"] } }, image: `/products/apex/1AX192ND1.webp`, images: [`/products/apex/1AX192ND1.webp`, `/products/apex/1AX192ND1-2.webp`, `/products/apex/1AX192ND1-3.webp`, `/products/apex/1AX192ND1-4.webp`] },
      { sku: `1AX192WH2`, name: { pt: `Zip Card holder — Off White`, en: `Zip Card holder — Off White` }, priceCents: 156500, currency: "EUR", attributes: { color: { label: { pt: `Off White`, en: `Off White` }, hex: ["#efeae0"] } }, image: `/products/apex/1AX192WH2.webp`, images: [`/products/apex/1AX192WH2.webp`, `/products/apex/1AX192WH2-2.webp`, `/products/apex/1AX192WH2-3.webp`, `/products/apex/1AX192WH2-4.webp`] },
      { sku: `1AX191BK1`, name: { pt: `Zip Card holder — Black`, en: `Zip Card holder — Black` }, priceCents: 121000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/apex/1AX191BK1.webp`, images: [`/products/apex/1AX191BK1.webp`, `/products/apex/1AX191BK1-2.webp`, `/products/apex/1AX191BK1-3.webp`, `/products/apex/1AX191BK1-4.webp`] },
      { sku: `1AX191SV2`, name: { pt: `Zip Card holder — Silver`, en: `Zip Card holder — Silver` }, priceCents: 121000, currency: "EUR", attributes: { color: { label: { pt: `Silver`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/apex/1AX191SV2.webp`, images: [`/products/apex/1AX191SV2.webp`, `/products/apex/1AX191SV2-2.webp`, `/products/apex/1AX191SV2-3.webp`, `/products/apex/1AX191SV2-4.webp`] },
      { sku: `1AX191RN1`, name: { pt: `Zip Card holder — Red`, en: `Zip Card holder — Red` }, priceCents: 120000, currency: "EUR", attributes: { color: { label: { pt: `Red`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/apex/1AX191RN1.webp`, images: [`/products/apex/1AX191RN1.webp`, `/products/apex/1AX191RN1-2.webp`, `/products/apex/1AX191RN1-3.webp`, `/products/apex/1AX191RN1-4.webp`] },
      { sku: `1AX191ND1`, name: { pt: `Zip Card holder — Fir Green & Green`, en: `Zip Card holder — Fir Green & Green` }, priceCents: 120000, currency: "EUR", attributes: { color: { label: { pt: `Fir Green & Green`, en: `Fir Green & Green` }, hex: ["#3b5d39"] } }, image: `/products/apex/1AX191ND1.webp`, images: [`/products/apex/1AX191ND1.webp`, `/products/apex/1AX191ND1-2.webp`, `/products/apex/1AX191ND1-3.webp`, `/products/apex/1AX191ND1-4.webp`] },
      { sku: `1AX191VN1`, name: { pt: `Zip Card holder — Blue & Dark Blue`, en: `Zip Card holder — Blue & Dark Blue` }, priceCents: 120000, currency: "EUR", attributes: { color: { label: { pt: `Blue & Dark Blue`, en: `Blue & Dark Blue` }, hex: ["#1f3c66"] } }, image: `/products/apex/1AX191VN1.webp`, images: [`/products/apex/1AX191VN1.webp`, `/products/apex/1AX191VN1-2.webp`, `/products/apex/1AX191VN1-3.webp`, `/products/apex/1AX191VN1-4.webp`] },
      { sku: `1AX191NL1`, name: { pt: `Zip Card holder — Light Green`, en: `Zip Card holder — Light Green` }, priceCents: 120000, currency: "EUR", attributes: { color: { label: { pt: `Light Green`, en: `Light Green` }, hex: ["#3b5d39"] } }, image: `/products/apex/1AX191NL1.webp`, images: [`/products/apex/1AX191NL1.webp`, `/products/apex/1AX191NL1-2.webp`, `/products/apex/1AX191NL1-3.webp`, `/products/apex/1AX191NL1-4.webp`] },
      { sku: `1AM191SV1`, name: { pt: `Zip Card holder — Silver`, en: `Zip Card holder — Silver` }, priceCents: 130000, currency: "EUR", attributes: { color: { label: { pt: `Silver`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/apex/1AM191SV1.webp`, images: [`/products/apex/1AM191SV1.webp`, `/products/apex/1AM191SV1-2.webp`, `/products/apex/1AM191SV1-3.webp`, `/products/apex/1AM191SV1-4.webp`] },
      { sku: `1AX191WH2`, name: { pt: `Zip Card holder — Off White`, en: `Zip Card holder — Off White` }, priceCents: 121000, currency: "EUR", attributes: { color: { label: { pt: `Off White`, en: `Off White` }, hex: ["#efeae0"] } }, image: `/products/apex/1AX191WH2.webp`, images: [`/products/apex/1AX191WH2.webp`, `/products/apex/1AX191WH2-2.webp`, `/products/apex/1AX191WH2-3.webp`, `/products/apex/1AX191WH2-4.webp`] },
      { sku: `1AH191UN2`, name: { pt: `Zip Card holder — Blue`, en: `Zip Card holder — Blue` }, priceCents: 131000, currency: "EUR", attributes: { color: { label: { pt: `Blue`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/apex/1AH191UN2.webp`, images: [`/products/apex/1AH191UN2.webp`, `/products/apex/1AH191UN2-2.webp`, `/products/apex/1AH191UN2-3.webp`, `/products/apex/1AH191UN2-4.webp`] },
      { sku: `1AX212BK1`, name: { pt: `Zip Card holder — Black`, en: `Zip Card holder — Black` }, priceCents: 69500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/apex/1AX212BK1.webp`, images: [`/products/apex/1AX212BK1.webp`, `/products/apex/1AX212BK1-2.webp`, `/products/apex/1AX212BK1-3.webp`] },
      { sku: `1AX212GN2`, name: { pt: `Zip Card holder — Grey`, en: `Zip Card holder — Grey` }, priceCents: 69500, currency: "EUR", attributes: { color: { label: { pt: `Grey`, en: `Grey` }, hex: ["#7a7d83"] } }, image: `/products/apex/1AX212GN2.webp`, images: [`/products/apex/1AX212GN2.webp`, `/products/apex/1AX212GN2-2.webp`, `/products/apex/1AX212GN2-3.webp`, `/products/apex/1AX212GN2-4.webp`] },
      { sku: `1AX653BK1`, name: { pt: `Zip Card holder — Black`, en: `Zip Card holder — Black` }, priceCents: 39500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/apex/1AX653BK1.webp`, images: [`/products/apex/1AX653BK1.webp`, `/products/apex/1AX653BK1-2.webp`] },
      { sku: `1AX653UL1`, name: { pt: `Zip Card holder — Light Blue`, en: `Zip Card holder — Light Blue` }, priceCents: 39500, currency: "EUR", attributes: { color: { label: { pt: `Light Blue`, en: `Light Blue` }, hex: ["#1f3c66"] } }, image: `/products/apex/1AX653UL1.webp`, images: [`/products/apex/1AX653UL1.webp`, `/products/apex/1AX653UL1-2.webp`] },
      { sku: `1AX653PL2`, name: { pt: `Zip Card holder — Light Pink`, en: `Zip Card holder — Light Pink` }, priceCents: 39500, currency: "EUR", attributes: { color: { label: { pt: `Light Pink`, en: `Light Pink` }, hex: ["#c97a8c"] } }, image: `/products/apex/1AX653PL2.webp`, images: [`/products/apex/1AX653PL2.webp`, `/products/apex/1AX653PL2-2.webp`] },
      { sku: `1AX212UD1`, name: { pt: `Zip Card holder — Blue`, en: `Zip Card holder — Blue` }, priceCents: 69500, currency: "EUR", attributes: { color: { label: { pt: `Blue`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/apex/1AX212UD1.webp`, images: [`/products/apex/1AX212UD1.webp`, `/products/apex/1AX212UD1-2.webp`, `/products/apex/1AX212UD1-3.webp`, `/products/apex/1AX212UD1-4.webp`] },
      { sku: `1AX153BK1`, name: { pt: `Zip Card holder — Black`, en: `Zip Card holder — Black` }, priceCents: 146000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/apex/1AX153BK1.webp`, images: [`/products/apex/1AX153BK1.webp`, `/products/apex/1AX153BK1-2.webp`, `/products/apex/1AX153BK1-3.webp`, `/products/apex/1AX153BK1-4.webp`] },
      { sku: `1AX153GN2`, name: { pt: `Zip Card holder — Grey`, en: `Zip Card holder — Grey` }, priceCents: 146000, currency: "EUR", attributes: { color: { label: { pt: `Grey`, en: `Grey` }, hex: ["#7a7d83"] } }, image: `/products/apex/1AX153GN2.webp`, images: [`/products/apex/1AX153GN2.webp`, `/products/apex/1AX153GN2-2.webp`, `/products/apex/1AX153GN2-3.webp`, `/products/apex/1AX153GN2-4.webp`] },
      { sku: `1AX182BK1`, name: { pt: `Zip Card holder — Silver`, en: `Zip Card holder — Silver` }, priceCents: 169000, currency: "EUR", attributes: { color: { label: { pt: `Silver`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/apex/1AX182BK1.webp`, images: [`/products/apex/1AX182BK1.webp`, `/products/apex/1AX182BK1-2.webp`] },
      { sku: `1AX182SV2`, name: { pt: `Zip Card holder — Silver`, en: `Zip Card holder — Silver` }, priceCents: 174000, currency: "EUR", attributes: { color: { label: { pt: `Silver`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/apex/1AX182SV2.webp`, images: [`/products/apex/1AX182SV2.webp`, `/products/apex/1AX182SV2-2.webp`, `/products/apex/1AX182SV2-3.webp`, `/products/apex/1AX182SV2-4.webp`] },
      { sku: `1AX552BK1`, name: { pt: `Zip Card holder — Black`, en: `Zip Card holder — Black` }, priceCents: 45500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/apex/1AX552BK1.webp`, images: [`/products/apex/1AX552BK1.webp`, `/products/apex/1AX552BK1-2.webp`] },
      { sku: `1AX552PL2`, name: { pt: `Zip Card holder — Light Pink`, en: `Zip Card holder — Light Pink` }, priceCents: 45500, currency: "EUR", attributes: { color: { label: { pt: `Light Pink`, en: `Light Pink` }, hex: ["#c97a8c"] } }, image: `/products/apex/1AX552PL2.webp`, images: [`/products/apex/1AX552PL2.webp`, `/products/apex/1AX552PL2-2.webp`] },
      { sku: `1AX561BK1`, name: { pt: `Zip Card holder — Black`, en: `Zip Card holder — Black` }, priceCents: 34500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/apex/1AX561BK1.webp`, images: [`/products/apex/1AX561BK1.webp`, `/products/apex/1AX561BK1-2.webp`] },
      { sku: `1AX561UL1`, name: { pt: `Zip Card holder — Light Blue`, en: `Zip Card holder — Light Blue` }, priceCents: 34000, currency: "EUR", attributes: { color: { label: { pt: `Light Blue`, en: `Light Blue` }, hex: ["#1f3c66"] } }, image: `/products/apex/1AX561UL1.webp`, images: [`/products/apex/1AX561UL1.webp`, `/products/apex/1AX561UL1-2.webp`] },
      { sku: `1AX561UD1`, name: { pt: `Zip Card holder — Blue & Dark Blue`, en: `Zip Card holder — Blue & Dark Blue` }, priceCents: 34500, currency: "EUR", attributes: { color: { label: { pt: `Blue & Dark Blue`, en: `Blue & Dark Blue` }, hex: ["#1f3c66"] } }, image: `/products/apex/1AX561UD1.webp`, images: [`/products/apex/1AX561UD1.webp`, `/products/apex/1AX561UD1-2.webp`] },
      { sku: `1AX552SV2`, name: { pt: `Zip Card holder — Silver`, en: `Zip Card holder — Silver` }, priceCents: 45500, currency: "EUR", attributes: { color: { label: { pt: `Silver`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/apex/1AX552SV2.webp`, images: [`/products/apex/1AX552SV2.webp`, `/products/apex/1AX552SV2-2.webp`] },
      { sku: `1AX581BK1`, name: { pt: `Zip Card holder — Black`, en: `Zip Card holder — Black` }, priceCents: 36500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/apex/1AX581BK1.webp`, images: [`/products/apex/1AX581BK1.webp`, `/products/apex/1AX581BK1-2.webp`] },
      { sku: `1AX513BK1`, name: { pt: `Zip Card holder — Black`, en: `Zip Card holder — Black` }, priceCents: 27000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/apex/1AX513BK1.webp`, images: [`/products/apex/1AX513BK1.webp`, `/products/apex/1AX513BK1-2.webp`] },
      { sku: `1AX513UL1`, name: { pt: `Zip Card holder — Light Blue`, en: `Zip Card holder — Light Blue` }, priceCents: 27000, currency: "EUR", attributes: { color: { label: { pt: `Light Blue`, en: `Light Blue` }, hex: ["#1f3c66"] } }, image: `/products/apex/1AX513UL1.webp`, images: [`/products/apex/1AX513UL1.webp`, `/products/apex/1AX513UL1-2.webp`] },
    ],
  },
  {
    slug: `monogram-1872`,
    name: { pt: `Tote`, en: `Tote` },
    description: { pt: `1872 is a collection of practical, elegant bags, just like the trunks of the Maison's early days. 1872 is also the year the Maison was founded, the beginning of a never-ending quest for excellence and exceptional objects. Proud of its expertise, S.T. Dupont uses a guilloche from the 1950s to decorate this line with an all-over design that blends heritage and modernity.Inspired by 1950s guilloché, this unisex bag combines elegance and functionality. The bag is made in Italy, combining waterproof coated canvas and full-grained calf leather, with a grey cotton interior with two flat pockets. Leather used is LWG certified.`, en: `1872 is a collection of practical, elegant bags, just like the trunks of the Maison's early days. 1872 is also the year the Maison was founded, the beginning of a never-ending quest for excellence and exceptional objects. Proud of its expertise, S.T. Dupont uses a guilloche from the 1950s to decorate this line with an all-over design that blends heritage and modernity.Inspired by 1950s guilloché, this unisex bag combines elegance and functionality. The bag is made in Italy, combining waterproof coated canvas and full-grained calf leather, with a grey cotton interior with two flat pockets. Leather used is LWG certified.` },
    collection: `Monogram 1872`,
    categorySlug: "pele",
    image: `/products/monogram-1872/1MG223BK2.webp`,
    variants: [
      { sku: `1MG223BK2`, name: { pt: `Tote — Dark Gray`, en: `Tote — Dark Gray` }, priceCents: 120000, currency: "EUR", attributes: { color: { label: { pt: `Dark Gray`, en: `Dark Gray` }, hex: ["#7a7d83"] } }, image: `/products/monogram-1872/1MG223BK2.webp`, images: [`/products/monogram-1872/1MG223BK2.webp`, `/products/monogram-1872/1MG223BK2-2.webp`, `/products/monogram-1872/1MG223BK2-3.webp`, `/products/monogram-1872/1MG223BK2-4.webp`] },
      { sku: `1MG223GN1`, name: { pt: `Tote — Light Gray`, en: `Tote — Light Gray` }, priceCents: 120000, currency: "EUR", attributes: { color: { label: { pt: `Light Gray`, en: `Light Gray` }, hex: ["#7a7d83"] } }, image: `/products/monogram-1872/1MG223GN1.webp`, images: [`/products/monogram-1872/1MG223GN1.webp`, `/products/monogram-1872/1MG223GN1-2.webp`, `/products/monogram-1872/1MG223GN1-3.webp`, `/products/monogram-1872/1MG223GN1-4.webp`] },
      { sku: `1MG212BK2`, name: { pt: `Tote — Black`, en: `Tote — Black` }, priceCents: 59000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/monogram-1872/1MG212BK2.webp`, images: [`/products/monogram-1872/1MG212BK2.webp`, `/products/monogram-1872/1MG212BK2-2.webp`, `/products/monogram-1872/1MG212BK2-3.webp`, `/products/monogram-1872/1MG212BK2-4.webp`] },
      { sku: `1MG212GN1`, name: { pt: `Tote — Grey`, en: `Tote — Grey` }, priceCents: 59000, currency: "EUR", attributes: { color: { label: { pt: `Grey`, en: `Grey` }, hex: ["#7a7d83"] } }, image: `/products/monogram-1872/1MG212GN1.webp`, images: [`/products/monogram-1872/1MG212GN1.webp`, `/products/monogram-1872/1MG212GN1-2.webp`, `/products/monogram-1872/1MG212GN1-3.webp`, `/products/monogram-1872/1MG212GN1-4.webp`] },
      { sku: `1MG333BK1`, name: { pt: `Tote — Black`, en: `Tote — Black` }, priceCents: 115000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/monogram-1872/1MG333BK1.webp`, images: [`/products/monogram-1872/1MG333BK1.webp`, `/products/monogram-1872/1MG333BK1-2.webp`, `/products/monogram-1872/1MG333BK1-3.webp`, `/products/monogram-1872/1MG333BK1-4.webp`] },
      { sku: `1MG333WH1`, name: { pt: `Tote — White`, en: `Tote — White` }, priceCents: 115000, currency: "EUR", attributes: { color: { label: { pt: `White`, en: `White` }, hex: ["#efeae0"] } }, image: `/products/monogram-1872/1MG333WH1.webp`, images: [`/products/monogram-1872/1MG333WH1.webp`, `/products/monogram-1872/1MG333WH1-2.webp`, `/products/monogram-1872/1MG333WH1-3.webp`, `/products/monogram-1872/1MG333WH1-4.webp`] },
      { sku: `1MG153BK2`, name: { pt: `Tote — Black`, en: `Tote — Black` }, priceCents: 120000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/monogram-1872/1MG153BK2.webp`, images: [`/products/monogram-1872/1MG153BK2.webp`, `/products/monogram-1872/1MG153BK2-2.webp`, `/products/monogram-1872/1MG153BK2-3.webp`, `/products/monogram-1872/1MG153BK2-4.webp`] },
      { sku: `1MG153GN1`, name: { pt: `Tote — Grey`, en: `Tote — Grey` }, priceCents: 120000, currency: "EUR", attributes: { color: { label: { pt: `Grey`, en: `Grey` }, hex: ["#7a7d83"] } }, image: `/products/monogram-1872/1MG153GN1.webp`, images: [`/products/monogram-1872/1MG153GN1.webp`, `/products/monogram-1872/1MG153GN1-2.webp`, `/products/monogram-1872/1MG153GN1-3.webp`, `/products/monogram-1872/1MG153GN1-4.webp`] },
    ],
  },
  {
    slug: `classic`,
    name: { pt: `Wallet`, en: `Wallet` },
    description: { pt: `A timeless classic. The product is made in Italy, with the exterior in soft full-grain calf leather, a light grey cotton lining, and palladium finishings. This product is made in Italy with a smooth full-grain calf leather exterior, light grey cotton lining, and palladium finishes. Featuring a removable and adjustable strap, a large zipped inner pocket, and a compartment for laptops up to 13". Leather used is LWG certified.`, en: `A timeless classic. The product is made in Italy, with the exterior in soft full-grain calf leather, a light grey cotton lining, and palladium finishings. This product is made in Italy with a smooth full-grain calf leather exterior, light grey cotton lining, and palladium finishes. Featuring a removable and adjustable strap, a large zipped inner pocket, and a compartment for laptops up to 13". Leather used is LWG certified.` },
    collection: `Classic`,
    categorySlug: "pele",
    image: `/products/classic/1LG224BK1.webp`,
    variants: [
      { sku: `1LG224BK1`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 140000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/classic/1LG224BK1.webp`, images: [`/products/classic/1LG224BK1.webp`, `/products/classic/1LG224BK1-2.webp`, `/products/classic/1LG224BK1-3.webp`, `/products/classic/1LG224BK1-4.webp`] },
      { sku: `1LG132BK1`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 136000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/classic/1LG132BK1.webp`, images: [`/products/classic/1LG132BK1.webp`, `/products/classic/1LG132BK1-2.webp`, `/products/classic/1LG132BK1-3.webp`, `/products/classic/1LG132BK1-4.webp`] },
      { sku: `1LG101BK1`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 166500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/classic/1LG101BK1.webp`, images: [`/products/classic/1LG101BK1.webp`, `/products/classic/1LG101BK1-2.webp`, `/products/classic/1LG101BK1-3.webp`, `/products/classic/1LG101BK1-4.webp`] },
      { sku: `1LG683BK1`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 19500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/classic/1LG683BK1.webp`, images: [`/products/classic/1LG683BK1.webp`, `/products/classic/1LG683BK1-2.webp`] },
      { sku: `1LG592BK1`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 45500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/classic/1LG592BK1.webp`, images: [`/products/classic/1LG592BK1.webp`, `/products/classic/1LG592BK1-2.webp`] },
      { sku: `1LG212BK1`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 65500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/classic/1LG212BK1.webp`, images: [`/products/classic/1LG212BK1.webp`, `/products/classic/1LG212BK1-2.webp`, `/products/classic/1LG212BK1-3.webp`, `/products/classic/1LG212BK1-4.webp`] },
      { sku: `1LG561BK1`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 31500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/classic/1LG561BK1.webp`, images: [`/products/classic/1LG561BK1.webp`, `/products/classic/1LG561BK1-2.webp`] },
    ],
  },
  {
    slug: `x-bag`,
    name: { pt: `Small`, en: `Small` },
    description: { pt: `With the X-Bag Baguette, the iconic guilloche pattern of S.T. lighters and pens is reinvented in an elegant new shape. Dupont lighters and pens is reinvented in an elongated, elegant form. A large ‘X’, like an ode to refined and sophisticated living. This model pays tribute to the House's signature style, inspired by the Firehead guilloché, one of the most emblematic motifs of S.T. Dupont's goldsmith's creations. Dupont's goldsmithing creations. Made from full-grain calf leather, this bag is embellished with elegant palladium finishes. The X-Bag Baguette shape of our iconic X-Bag creates a distinctive and modern silhouette. An iconic design, the X-Bag Baguette is easy to wear and fits perfectly into a day-to-night wardrobe, becoming a multi-generational accessory. Multifunctional and multi-faceted. This bag is distinguished by its new ‘off white’ colour, a magnificent off-white with a light gold finish. An elegant colour, perfect for a chic, refined look. This bag is made in Italy from full-grain calf leather with an adjustable strap for versatile style. The leather used is LWG certified.`, en: `With the X-Bag Baguette, the iconic guilloche pattern of S.T. lighters and pens is reinvented in an elegant new shape. Dupont lighters and pens is reinvented in an elongated, elegant form. A large ‘X’, like an ode to refined and sophisticated living. This model pays tribute to the House's signature style, inspired by the Firehead guilloché, one of the most emblematic motifs of S.T. Dupont's goldsmith's creations. Dupont's goldsmithing creations. Made from full-grain calf leather, this bag is embellished with elegant palladium finishes. The X-Bag Baguette shape of our iconic X-Bag creates a distinctive and modern silhouette. An iconic design, the X-Bag Baguette is easy to wear and fits perfectly into a day-to-night wardrobe, becoming a multi-generational accessory. Multifunctional and multi-faceted. This bag is distinguished by its new ‘off white’ colour, a magnificent off-white with a light gold finish. An elegant colour, perfect for a chic, refined look. This bag is made in Italy from full-grain calf leather with an adjustable strap for versatile style. The leather used is LWG certified.` },
    collection: `X-bag`,
    categorySlug: "pele",
    image: `/products/x-bag/1XB292BK1.webp`,
    variants: [
      { sku: `1XB292BK1`, name: { pt: `Small — Black`, en: `Small — Black` }, priceCents: 146000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/x-bag/1XB292BK1.webp`, images: [`/products/x-bag/1XB292BK1.webp`, `/products/x-bag/1XB292BK1-2.webp`, `/products/x-bag/1XB292BK1-3.webp`, `/products/x-bag/1XB292BK1-4.webp`] },
      { sku: `1XB292PL1`, name: { pt: `Small — Nude Pink`, en: `Small — Nude Pink` }, priceCents: 146000, currency: "EUR", attributes: { color: { label: { pt: `Nude Pink`, en: `Nude Pink` }, hex: ["#c97a8c"] } }, image: `/products/x-bag/1XB292PL1.webp`, images: [`/products/x-bag/1XB292PL1.webp`, `/products/x-bag/1XB292PL1-2.webp`, `/products/x-bag/1XB292PL1-3.webp`, `/products/x-bag/1XB292PL1-4.webp`] },
      { sku: `1XB292RN1`, name: { pt: `Small — Red`, en: `Small — Red` }, priceCents: 146000, currency: "EUR", attributes: { color: { label: { pt: `Red`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/x-bag/1XB292RN1.webp`, images: [`/products/x-bag/1XB292RN1.webp`, `/products/x-bag/1XB292RN1-2.webp`, `/products/x-bag/1XB292RN1-3.webp`, `/products/x-bag/1XB292RN1-4.webp`] },
      { sku: `1XB292ND1`, name: { pt: `Small — Fir Green & Green`, en: `Small — Fir Green & Green` }, priceCents: 145000, currency: "EUR", attributes: { color: { label: { pt: `Fir Green & Green`, en: `Fir Green & Green` }, hex: ["#3b5d39"] } }, image: `/products/x-bag/1XB292ND1.webp`, images: [`/products/x-bag/1XB292ND1.webp`, `/products/x-bag/1XB292ND1-2.webp`, `/products/x-bag/1XB292ND1-3.webp`, `/products/x-bag/1XB292ND1-4.webp`] },
      { sku: `1XB292NL1`, name: { pt: `Small — Light Green`, en: `Small — Light Green` }, priceCents: 145000, currency: "EUR", attributes: { color: { label: { pt: `Light Green`, en: `Light Green` }, hex: ["#3b5d39"] } }, image: `/products/x-bag/1XB292NL1.webp`, images: [`/products/x-bag/1XB292NL1.webp`, `/products/x-bag/1XB292NL1-2.webp`, `/products/x-bag/1XB292NL1-3.webp`, `/products/x-bag/1XB292NL1-4.webp`] },
      { sku: `1XD292UD1`, name: { pt: `Small — Blue`, en: `Small — Blue` }, priceCents: 145000, currency: "EUR", attributes: { color: { label: { pt: `Blue`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/x-bag/1XD292UD1.webp`, images: [`/products/x-bag/1XD292UD1.webp`, `/products/x-bag/1XD292UD1-2.webp`, `/products/x-bag/1XD292UD1-3.webp`, `/products/x-bag/1XD292UD1-4.webp`] },
      { sku: `1XM292SV1`, name: { pt: `Small — Silver`, en: `Small — Silver` }, priceCents: 176500, currency: "EUR", attributes: { color: { label: { pt: `Silver`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/x-bag/1XM292SV1.webp`, images: [`/products/x-bag/1XM292SV1.webp`, `/products/x-bag/1XM292SV1-2.webp`, `/products/x-bag/1XM292SV1-3.webp`, `/products/x-bag/1XM292SV1-4.webp`] },
      { sku: `1XB292WH2`, name: { pt: `Small — Off White`, en: `Small — Off White` }, priceCents: 146000, currency: "EUR", attributes: { color: { label: { pt: `Off White`, en: `Off White` }, hex: ["#efeae0"] } }, image: `/products/x-bag/1XB292WH2.webp`, images: [`/products/x-bag/1XB292WH2.webp`, `/products/x-bag/1XB292WH2-2.webp`, `/products/x-bag/1XB292WH2-3.webp`, `/products/x-bag/1XB292WH2-4.webp`] },
      { sku: `1XM292DO1`, name: { pt: `Small — Golden`, en: `Small — Golden` }, priceCents: 176500, currency: "EUR", attributes: { color: { label: { pt: `Golden`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/x-bag/1XM292DO1.webp`, images: [`/products/x-bag/1XM292DO1.webp`, `/products/x-bag/1XM292DO1-2.webp`, `/products/x-bag/1XM292DO1-3.webp`, `/products/x-bag/1XM292DO1-4.webp`] },
      { sku: `1XB283BK1`, name: { pt: `Small — Black`, en: `Small — Black` }, priceCents: 176500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/x-bag/1XB283BK1.webp`, images: [`/products/x-bag/1XB283BK1.webp`, `/products/x-bag/1XB283BK1-2.webp`, `/products/x-bag/1XB283BK1-3.webp`, `/products/x-bag/1XB283BK1-4.webp`] },
      { sku: `1XB283GN1`, name: { pt: `Small — Grey`, en: `Small — Grey` }, priceCents: 175000, currency: "EUR", attributes: { color: { label: { pt: `Grey`, en: `Grey` }, hex: ["#7a7d83"] } }, image: `/products/x-bag/1XB283GN1.webp`, images: [`/products/x-bag/1XB283GN1.webp`, `/products/x-bag/1XB283GN1-2.webp`, `/products/x-bag/1XB283GN1-3.webp`, `/products/x-bag/1XB283GN1-4.webp`] },
      { sku: `1XB283WH2`, name: { pt: `Small — Off White`, en: `Small — Off White` }, priceCents: 176500, currency: "EUR", attributes: { color: { label: { pt: `Off White`, en: `Off White` }, hex: ["#efeae0"] } }, image: `/products/x-bag/1XB283WH2.webp`, images: [`/products/x-bag/1XB283WH2.webp`, `/products/x-bag/1XB283WH2-2.webp`] },
      { sku: `1XB282BK1`, name: { pt: `Small — Black`, en: `Small — Black` }, priceCents: 146000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/x-bag/1XB282BK1.webp`, images: [`/products/x-bag/1XB282BK1.webp`, `/products/x-bag/1XB282BK1-2.webp`, `/products/x-bag/1XB282BK1-3.webp`, `/products/x-bag/1XB282BK1-4.webp`] },
      { sku: `1XB282PL1`, name: { pt: `Small — Nude Pink`, en: `Small — Nude Pink` }, priceCents: 146000, currency: "EUR", attributes: { color: { label: { pt: `Nude Pink`, en: `Nude Pink` }, hex: ["#c97a8c"] } }, image: `/products/x-bag/1XB282PL1.webp`, images: [`/products/x-bag/1XB282PL1.webp`, `/products/x-bag/1XB282PL1-2.webp`, `/products/x-bag/1XB282PL1-3.webp`, `/products/x-bag/1XB282PL1-4.webp`] },
      { sku: `1XB282GN1`, name: { pt: `Small — Grey`, en: `Small — Grey` }, priceCents: 145000, currency: "EUR", attributes: { color: { label: { pt: `Grey`, en: `Grey` }, hex: ["#7a7d83"] } }, image: `/products/x-bag/1XB282GN1.webp`, images: [`/products/x-bag/1XB282GN1.webp`, `/products/x-bag/1XB282GN1-2.webp`, `/products/x-bag/1XB282GN1-3.webp`, `/products/x-bag/1XB282GN1-4.webp`] },
      { sku: `1XB282RN1`, name: { pt: `Small — Red`, en: `Small — Red` }, priceCents: 146000, currency: "EUR", attributes: { color: { label: { pt: `Red`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/x-bag/1XB282RN1.webp`, images: [`/products/x-bag/1XB282RN1.webp`, `/products/x-bag/1XB282RN1-2.webp`, `/products/x-bag/1XB282RN1-3.webp`, `/products/x-bag/1XB282RN1-4.webp`] },
      { sku: `1XB282ND1`, name: { pt: `Small — Fir Green`, en: `Small — Fir Green` }, priceCents: 145000, currency: "EUR", attributes: { color: { label: { pt: `Fir Green`, en: `Fir Green` }, hex: ["#3b5d39"] } }, image: `/products/x-bag/1XB282ND1.webp`, images: [`/products/x-bag/1XB282ND1.webp`, `/products/x-bag/1XB282ND1-2.webp`, `/products/x-bag/1XB282ND1-3.webp`, `/products/x-bag/1XB282ND1-4.webp`] },
      { sku: `1XB282BE1`, name: { pt: `Small — Beige`, en: `Small — Beige` }, priceCents: 146000, currency: "EUR", attributes: { color: { label: { pt: `Beige`, en: `Beige` }, hex: ["#7a7d83"] } }, image: `/products/x-bag/1XB282BE1.webp`, images: [`/products/x-bag/1XB282BE1.webp`, `/products/x-bag/1XB282BE1-2.webp`, `/products/x-bag/1XB282BE1-3.webp`, `/products/x-bag/1XB282BE1-4.webp`] },
      { sku: `1XB282VN1`, name: { pt: `Small — Dark Blue`, en: `Small — Dark Blue` }, priceCents: 155000, currency: "EUR", attributes: { color: { label: { pt: `Dark Blue`, en: `Dark Blue` }, hex: ["#1f3c66"] } }, image: `/products/x-bag/1XB282VN1.webp`, images: [`/products/x-bag/1XB282VN1.webp`, `/products/x-bag/1XB282VN1-2.webp`, `/products/x-bag/1XB282VN1-3.webp`, `/products/x-bag/1XB282VN1-4.webp`] },
      { sku: `1XC282SV1`, name: { pt: `Small — Silver`, en: `Small — Silver` }, priceCents: 175000, currency: "EUR", attributes: { color: { label: { pt: `Silver`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/x-bag/1XC282SV1.webp`, images: [`/products/x-bag/1XC282SV1.webp`, `/products/x-bag/1XC282SV1-2.webp`, `/products/x-bag/1XC282SV1-3.webp`, `/products/x-bag/1XC282SV1-4.webp`] },
      { sku: `1XC282DO1`, name: { pt: `Small — Golden`, en: `Small — Golden` }, priceCents: 175000, currency: "EUR", attributes: { color: { label: { pt: `Golden`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/x-bag/1XC282DO1.webp`, images: [`/products/x-bag/1XC282DO1.webp`, `/products/x-bag/1XC282DO1-2.webp`, `/products/x-bag/1XC282DO1-3.webp`, `/products/x-bag/1XC282DO1-4.webp`] },
      { sku: `1XB282NL1`, name: { pt: `Small — Light Green`, en: `Small — Light Green` }, priceCents: 145000, currency: "EUR", attributes: { color: { label: { pt: `Light Green`, en: `Light Green` }, hex: ["#3b5d39"] } }, image: `/products/x-bag/1XB282NL1.webp`, images: [`/products/x-bag/1XB282NL1.webp`, `/products/x-bag/1XB282NL1-2.webp`, `/products/x-bag/1XB282NL1-3.webp`, `/products/x-bag/1XB282NL1-4.webp`] },
      { sku: `1XD282UD1`, name: { pt: `Small — Blue`, en: `Small — Blue` }, priceCents: 145000, currency: "EUR", attributes: { color: { label: { pt: `Blue`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/x-bag/1XD282UD1.webp`, images: [`/products/x-bag/1XD282UD1.webp`, `/products/x-bag/1XD282UD1-2.webp`, `/products/x-bag/1XD282UD1-3.webp`, `/products/x-bag/1XD282UD1-4.webp`] },
      { sku: `1XM282SV1`, name: { pt: `Small — Silver`, en: `Small — Silver` }, priceCents: 176500, currency: "EUR", attributes: { color: { label: { pt: `Silver`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/x-bag/1XM282SV1.webp`, images: [`/products/x-bag/1XM282SV1.webp`, `/products/x-bag/1XM282SV1-2.webp`, `/products/x-bag/1XM282SV1-3.webp`, `/products/x-bag/1XM282SV1-4.webp`] },
      { sku: `1XB282WH2`, name: { pt: `Small — Off White`, en: `Small — Off White` }, priceCents: 146000, currency: "EUR", attributes: { color: { label: { pt: `Off White`, en: `Off White` }, hex: ["#efeae0"] } }, image: `/products/x-bag/1XB282WH2.webp`, images: [`/products/x-bag/1XB282WH2.webp`, `/products/x-bag/1XB282WH2-2.webp`, `/products/x-bag/1XB282WH2-3.webp`, `/products/x-bag/1XB282WH2-4.webp`] },
      { sku: `1XH282OG1`, name: { pt: `Small — Orange`, en: `Small — Orange` }, priceCents: 156500, currency: "EUR", attributes: { color: { label: { pt: `Orange`, en: `Orange` }, hex: ["#c8a24a"] } }, image: `/products/x-bag/1XH282OG1.webp`, images: [`/products/x-bag/1XH282OG1.webp`, `/products/x-bag/1XH282OG1-2.webp`, `/products/x-bag/1XH282OG1-3.webp`, `/products/x-bag/1XH282OG1-4.webp`] },
      { sku: `1XH282UN2`, name: { pt: `Small — Blue`, en: `Small — Blue` }, priceCents: 156500, currency: "EUR", attributes: { color: { label: { pt: `Blue`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/x-bag/1XH282UN2.webp`, images: [`/products/x-bag/1XH282UN2.webp`, `/products/x-bag/1XH282UN2-2.webp`, `/products/x-bag/1XH282UN2-3.webp`, `/products/x-bag/1XH282UN2-4.webp`] },
      { sku: `1XM282DO1`, name: { pt: `Small — Golden`, en: `Small — Golden` }, priceCents: 176500, currency: "EUR", attributes: { color: { label: { pt: `Golden`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/x-bag/1XM282DO1.webp`, images: [`/products/x-bag/1XM282DO1.webp`, `/products/x-bag/1XM282DO1-2.webp`, `/products/x-bag/1XM282DO1-3.webp`, `/products/x-bag/1XM282DO1-4.webp`] },
    ],
  },
  {
    slug: `riviera`,
    name: { pt: `Small`, en: `Small` },
    description: { pt: `In 1953, André Dupont, the son of Simon Tissot Dupont, created the brand's first women's handbag, the Riviera, for Audrey Hepburn. The bag was presented as a limited edition and featured a secret compartment. Like the original icon, the updated Riviera also features a secret pocket hidden in the bag's lining, secured by a “lighter lock” adorned with the brand's iconic guilloché diamond head. The new Riviera Stripe version reinvents this classic with leather stripes inspired by the guilloché pattern of S.T. Dupont lighters, giving it a contemporary, rock-and-roll attitude. These stripes create a striking effect, making this bag an everyday essential. Made in Italy, this bag combines soft, smooth full-grain calf leather on the outside with a full-grain cowhide leather lining. The leather used is LWG certified, guaranteeing environmentally friendly production. The Riviera Small Stripe embodies heritage and innovation, adding a dynamic and modern dimension to any outfit. With “Black Smoke,” lacquer takes on a bold, vintage look with contrasting materials and black hues. Matte, crinkled full-grain calfskin leather is paired with shiny black leather with a lacquer effect.`, en: `In 1953, André Dupont, the son of Simon Tissot Dupont, created the brand's first women's handbag, the Riviera, for Audrey Hepburn. The bag was presented as a limited edition and featured a secret compartment. Like the original icon, the updated Riviera also features a secret pocket hidden in the bag's lining, secured by a “lighter lock” adorned with the brand's iconic guilloché diamond head. The new Riviera Stripe version reinvents this classic with leather stripes inspired by the guilloché pattern of S.T. Dupont lighters, giving it a contemporary, rock-and-roll attitude. These stripes create a striking effect, making this bag an everyday essential. Made in Italy, this bag combines soft, smooth full-grain calf leather on the outside with a full-grain cowhide leather lining. The leather used is LWG certified, guaranteeing environmentally friendly production. The Riviera Small Stripe embodies heritage and innovation, adding a dynamic and modern dimension to any outfit. With “Black Smoke,” lacquer takes on a bold, vintage look with contrasting materials and black hues. Matte, crinkled full-grain calfskin leather is paired with shiny black leather with a lacquer effect.` },
    collection: `Riviera`,
    categorySlug: "pele",
    image: `/products/riviera/1RS292WH2.webp`,
    variants: [
      { sku: `1RS292WH2`, name: { pt: `Small — Off White`, en: `Small — Off White` }, priceCents: 176500, currency: "EUR", attributes: { color: { label: { pt: `Off White`, en: `Off White` }, hex: ["#efeae0"] } }, image: `/products/riviera/1RS292WH2.webp`, images: [`/products/riviera/1RS292WH2.webp`, `/products/riviera/1RS292WH2-2.webp`, `/products/riviera/1RS292WH2-3.webp`, `/products/riviera/1RS292WH2-4.webp`] },
      { sku: `1RS292BK1`, name: { pt: `Small — Black`, en: `Small — Black` }, priceCents: 176500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/riviera/1RS292BK1.webp`, images: [`/products/riviera/1RS292BK1.webp`, `/products/riviera/1RS292BK1-2.webp`, `/products/riviera/1RS292BK1-3.webp`, `/products/riviera/1RS292BK1-4.webp`] },
      { sku: `1RV292RD2`, name: { pt: `Small — Burgundy`, en: `Small — Burgundy` }, priceCents: 156500, currency: "EUR", attributes: { color: { label: { pt: `Burgundy`, en: `Burgundy` }, hex: ["#7d2b27"] } }, image: `/products/riviera/1RV292RD2.webp`, images: [`/products/riviera/1RV292RD2.webp`, `/products/riviera/1RV292RD2-2.webp`, `/products/riviera/1RV292RD2-3.webp`, `/products/riviera/1RV292RD2-4.webp`] },
      { sku: `1RV292UL2`, name: { pt: `Small — Light Blue`, en: `Small — Light Blue` }, priceCents: 155000, currency: "EUR", attributes: { color: { label: { pt: `Light Blue`, en: `Light Blue` }, hex: ["#1f3c66"] } }, image: `/products/riviera/1RV292UL2.webp`, images: [`/products/riviera/1RV292UL2.webp`, `/products/riviera/1RV292UL2-2.webp`, `/products/riviera/1RV292UL2-3.webp`, `/products/riviera/1RV292UL2-4.webp`] },
      { sku: `1RK292BK1`, name: { pt: `Small — Black`, en: `Small — Black` }, priceCents: 165000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/riviera/1RK292BK1.webp`, images: [`/products/riviera/1RK292BK1.webp`, `/products/riviera/1RK292BK1-2.webp`, `/products/riviera/1RK292BK1-3.webp`, `/products/riviera/1RK292BK1-4.webp`] },
      { sku: `1RV262BK1`, name: { pt: `Small — Black`, en: `Small — Black` }, priceCents: 231000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/riviera/1RV262BK1.webp`, images: [`/products/riviera/1RV262BK1.webp`, `/products/riviera/1RV262BK1-2.webp`, `/products/riviera/1RV262BK1-3.webp`, `/products/riviera/1RV262BK1-4.webp`] },
      { sku: `1RV262GN2`, name: { pt: `Small — Grey`, en: `Small — Grey` }, priceCents: 229000, currency: "EUR", attributes: { color: { label: { pt: `Grey`, en: `Grey` }, hex: ["#7a7d83"] } }, image: `/products/riviera/1RV262GN2.webp`, images: [`/products/riviera/1RV262GN2.webp`, `/products/riviera/1RV262GN2-2.webp`, `/products/riviera/1RV262GN2-3.webp`, `/products/riviera/1RV262GN2-4.webp`] },
      { sku: `1RV262WH1`, name: { pt: `Small — White`, en: `Small — White` }, priceCents: 229000, currency: "EUR", attributes: { color: { label: { pt: `White`, en: `White` }, hex: ["#efeae0"] } }, image: `/products/riviera/1RV262WH1.webp`, images: [`/products/riviera/1RV262WH1.webp`, `/products/riviera/1RV262WH1-2.webp`, `/products/riviera/1RV262WH1-3.webp`, `/products/riviera/1RV262WH1-4.webp`] },
      { sku: `1RV262BE1`, name: { pt: `Small — Beige`, en: `Small — Beige` }, priceCents: 231000, currency: "EUR", attributes: { color: { label: { pt: `Beige`, en: `Beige` }, hex: ["#7a7d83"] } }, image: `/products/riviera/1RV262BE1.webp`, images: [`/products/riviera/1RV262BE1.webp`, `/products/riviera/1RV262BE1-2.webp`, `/products/riviera/1RV262BE1-3.webp`, `/products/riviera/1RV262BE1-4.webp`] },
      { sku: `1RV262WH2`, name: { pt: `Small — Off White`, en: `Small — Off White` }, priceCents: 229000, currency: "EUR", attributes: { color: { label: { pt: `Off White`, en: `Off White` }, hex: ["#efeae0"] } }, image: `/products/riviera/1RV262WH2.webp`, images: [`/products/riviera/1RV262WH2.webp`, `/products/riviera/1RV262WH2-2.webp`, `/products/riviera/1RV262WH2-3.webp`, `/products/riviera/1RV262WH2-4.webp`] },
      { sku: `1RV262BL2`, name: { pt: `Small — Tan`, en: `Small — Tan` }, priceCents: 231000, currency: "EUR", attributes: { color: { label: { pt: `Tan`, en: `Tan` }, hex: ["#7a7d83"] } }, image: `/products/riviera/1RV262BL2.webp`, images: [`/products/riviera/1RV262BL2.webp`, `/products/riviera/1RV262BL2-2.webp`, `/products/riviera/1RV262BL2-3.webp`, `/products/riviera/1RV262BL2-4.webp`] },
      { sku: `1RV262RD2`, name: { pt: `Small — Burgundy`, en: `Small — Burgundy` }, priceCents: 231000, currency: "EUR", attributes: { color: { label: { pt: `Burgundy`, en: `Burgundy` }, hex: ["#7d2b27"] } }, image: `/products/riviera/1RV262RD2.webp`, images: [`/products/riviera/1RV262RD2.webp`, `/products/riviera/1RV262RD2-2.webp`, `/products/riviera/1RV262RD2-3.webp`, `/products/riviera/1RV262RD2-4.webp`] },
      { sku: `1RV261BE1`, name: { pt: `Small — Beige`, en: `Small — Beige` }, priceCents: 180500, currency: "EUR", attributes: { color: { label: { pt: `Beige`, en: `Beige` }, hex: ["#7a7d83"] } }, image: `/products/riviera/1RV261BE1.webp`, images: [`/products/riviera/1RV261BE1.webp`, `/products/riviera/1RV261BE1-2.webp`, `/products/riviera/1RV261BE1-3.webp`, `/products/riviera/1RV261BE1-4.webp`] },
      { sku: `1RS261SV1`, name: { pt: `Small — Silver`, en: `Small — Silver` }, priceCents: 199000, currency: "EUR", attributes: { color: { label: { pt: `Silver`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/riviera/1RS261SV1.webp`, images: [`/products/riviera/1RS261SV1.webp`, `/products/riviera/1RS261SV1-2.webp`, `/products/riviera/1RS261SV1-3.webp`, `/products/riviera/1RS261SV1-4.webp`] },
      { sku: `1RV261BK1`, name: { pt: `Small — Black`, en: `Small — Black` }, priceCents: 180500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/riviera/1RV261BK1.webp`, images: [`/products/riviera/1RV261BK1.webp`, `/products/riviera/1RV261BK1-2.webp`, `/products/riviera/1RV261BK1-3.webp`, `/products/riviera/1RV261BK1-4.webp`] },
      { sku: `1RV261GN2`, name: { pt: `Small — Grey`, en: `Small — Grey` }, priceCents: 179000, currency: "EUR", attributes: { color: { label: { pt: `Grey`, en: `Grey` }, hex: ["#7a7d83"] } }, image: `/products/riviera/1RV261GN2.webp`, images: [`/products/riviera/1RV261GN2.webp`, `/products/riviera/1RV261GN2-2.webp`, `/products/riviera/1RV261GN2-3.webp`, `/products/riviera/1RV261GN2-4.webp`] },
      { sku: `1RV261WH1`, name: { pt: `Small — White`, en: `Small — White` }, priceCents: 179000, currency: "EUR", attributes: { color: { label: { pt: `White`, en: `White` }, hex: ["#efeae0"] } }, image: `/products/riviera/1RV261WH1.webp`, images: [`/products/riviera/1RV261WH1.webp`, `/products/riviera/1RV261WH1-2.webp`, `/products/riviera/1RV261WH1-3.webp`, `/products/riviera/1RV261WH1-4.webp`] },
      { sku: `1RV261WH2`, name: { pt: `Small — Off White`, en: `Small — Off White` }, priceCents: 180500, currency: "EUR", attributes: { color: { label: { pt: `Off White`, en: `Off White` }, hex: ["#efeae0"] } }, image: `/products/riviera/1RV261WH2.webp`, images: [`/products/riviera/1RV261WH2.webp`, `/products/riviera/1RV261WH2-2.webp`, `/products/riviera/1RV261WH2-3.webp`, `/products/riviera/1RV261WH2-4.webp`] },
      { sku: `1RV261BL2`, name: { pt: `Small — Tan`, en: `Small — Tan` }, priceCents: 180500, currency: "EUR", attributes: { color: { label: { pt: `Tan`, en: `Tan` }, hex: ["#7a7d83"] } }, image: `/products/riviera/1RV261BL2.webp`, images: [`/products/riviera/1RV261BL2.webp`, `/products/riviera/1RV261BL2-2.webp`, `/products/riviera/1RV261BL2-3.webp`, `/products/riviera/1RV261BL2-4.webp`] },
      { sku: `1RS261BK1`, name: { pt: `Small — Black`, en: `Small — Black` }, priceCents: 200500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/riviera/1RS261BK1.webp`, images: [`/products/riviera/1RS261BK1.webp`, `/products/riviera/1RS261BK1-2.webp`, `/products/riviera/1RS261BK1-3.webp`, `/products/riviera/1RS261BK1-4.webp`] },
      { sku: `1RV261UL2`, name: { pt: `Small — Light Blue`, en: `Small — Light Blue` }, priceCents: 179000, currency: "EUR", attributes: { color: { label: { pt: `Light Blue`, en: `Light Blue` }, hex: ["#1f3c66"] } }, image: `/products/riviera/1RV261UL2.webp`, images: [`/products/riviera/1RV261UL2.webp`, `/products/riviera/1RV261UL2-2.webp`, `/products/riviera/1RV261UL2-3.webp`, `/products/riviera/1RV261UL2-4.webp`] },
      { sku: `1RV261RD2`, name: { pt: `Small — Burgundy`, en: `Small — Burgundy` }, priceCents: 180500, currency: "EUR", attributes: { color: { label: { pt: `Burgundy`, en: `Burgundy` }, hex: ["#7d2b27"] } }, image: `/products/riviera/1RV261RD2.webp`, images: [`/products/riviera/1RV261RD2.webp`, `/products/riviera/1RV261RD2-2.webp`, `/products/riviera/1RV261RD2-3.webp`, `/products/riviera/1RV261RD2-4.webp`] },
      { sku: `1RK261BK1`, name: { pt: `Small — Black`, en: `Small — Black` }, priceCents: 189000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/riviera/1RK261BK1.webp`, images: [`/products/riviera/1RK261BK1.webp`, `/products/riviera/1RK261BK1-2.webp`, `/products/riviera/1RK261BK1-3.webp`, `/products/riviera/1RK261BK1-4.webp`] },
    ],
  },
  {
    slug: `liberte-3`,
    name: { pt: `Rollerball pen`, en: `Rollerball pen` },
    description: { pt: `Liberty Pen & Pencil Set Lacquered and white gold plated with rose gold. New "Sword" clip. Associated refills: 040112 Blue 040110 Black 040362 Red 040363 Green This fountain pen comes with a medium nib, for a writing size of apporox. 0.55 mm.`, en: `Liberty Pen & Pencil Set Lacquered and white gold plated with rose gold. New "Sword" clip. Associated refills: 040112 Blue 040110 Black 040362 Red 040363 Green This fountain pen comes with a medium nib, for a writing size of apporox. 0.55 mm.` },
    collection: `Liberté`,
    categorySlug: "escrita",
    image: `/products/liberte-3/465221F.webp`,
    variants: [
      { sku: `465221F`, name: { pt: `Rollerball pen — Black`, en: `Rollerball pen — Black` }, priceCents: 66500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/liberte-3/465221F.webp`, images: [`/products/liberte-3/465221F.webp`, `/products/liberte-3/465221F-2.webp`, `/products/liberte-3/465221F-3.webp`, `/products/liberte-3/465221F-4.webp`] },
      { sku: `465227F`, name: { pt: `Rollerball pen — White`, en: `Rollerball pen — White` }, priceCents: 54500, currency: "EUR", attributes: { color: { label: { pt: `White`, en: `White` }, hex: ["#efeae0"] } }, image: `/products/liberte-3/465227F.webp`, images: [`/products/liberte-3/465227F.webp`, `/products/liberte-3/465227F-2.webp`, `/products/liberte-3/465227F-3.webp`, `/products/liberte-3/465227F-4.webp`] },
      { sku: `465220G`, name: { pt: `Rollerball pen — Black`, en: `Rollerball pen — Black` }, priceCents: 46500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/liberte-3/465220G.webp`, images: [`/products/liberte-3/465220G.webp`, `/products/liberte-3/465220G-2.webp`, `/products/liberte-3/465220G-3.webp`, `/products/liberte-3/465220G-4.webp`] },
      { sku: `460220G`, name: { pt: `Rollerball pen — Black`, en: `Rollerball pen — Black` }, priceCents: 67500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/liberte-3/460220G.webp`, images: [`/products/liberte-3/460220G.webp`, `/products/liberte-3/460220G-2.webp`, `/products/liberte-3/460220G-3.webp`, `/products/liberte-3/460220G-4.webp`] },
      { sku: `460221F`, name: { pt: `Rollerball pen — Black`, en: `Rollerball pen — Black` }, priceCents: 87500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/liberte-3/460221F.webp`, images: [`/products/liberte-3/460221F.webp`, `/products/liberte-3/460221F-2.webp`, `/products/liberte-3/460221F-3.webp`, `/products/liberte-3/460221F-4.webp`] },
      { sku: `460227F`, name: { pt: `Rollerball pen — White`, en: `Rollerball pen — White` }, priceCents: 79500, currency: "EUR", attributes: { color: { label: { pt: `White`, en: `White` }, hex: ["#efeae0"] } }, image: `/products/liberte-3/460227F.webp`, images: [`/products/liberte-3/460227F.webp`, `/products/liberte-3/460227F-2.webp`, `/products/liberte-3/460227F-3.webp`, `/products/liberte-3/460227F-4.webp`] },
      { sku: `462220G`, name: { pt: `Rollerball pen — Black`, en: `Rollerball pen — Black` }, priceCents: 52500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/liberte-3/462220G.webp`, images: [`/products/liberte-3/462220G.webp`, `/products/liberte-3/462220G-2.webp`, `/products/liberte-3/462220G-3.webp`, `/products/liberte-3/462220G-4.webp`] },
      { sku: `462221F`, name: { pt: `Rollerball pen — Black`, en: `Rollerball pen — Black` }, priceCents: 72500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/liberte-3/462221F.webp`, images: [`/products/liberte-3/462221F.webp`, `/products/liberte-3/462221F-2.webp`, `/products/liberte-3/462221F-3.webp`, `/products/liberte-3/462221F-4.webp`] },
      { sku: `462227F`, name: { pt: `Rollerball pen — White`, en: `Rollerball pen — White` }, priceCents: 67500, currency: "EUR", attributes: { color: { label: { pt: `White`, en: `White` }, hex: ["#efeae0"] } }, image: `/products/liberte-3/462227F.webp`, images: [`/products/liberte-3/462227F.webp`, `/products/liberte-3/462227F-2.webp`, `/products/liberte-3/462227F-3.webp`, `/products/liberte-3/462227F-4.webp`] },
    ],
  },
  {
    slug: `liberte-presidence-de-la-republique`,
    name: { pt: `Ballpoint`, en: `Ballpoint` },
    description: { pt: `S.T. Dupont x Élysée is paying further tribute to French luxury with the extension of its official collection, specially created for the French Presidency. After the first exceptional piece, the Eternity presidential pen, the collection welcomes the new Liberté pen. the Liberté biros is finished in a deep blue lacquer inspired by the French flag, a perfect illustration of S.T. Dupont's emblematic lacquering technique. Dupont's emblematic lacquering technique. Each piece, engraved with the ‘Présidence de la République’ emblem, embodies the craftsmanship of S.T. Dupont and the French art of living. Related refills: 040853 Blue - 040854 Black`, en: `S.T. Dupont x Élysée is paying further tribute to French luxury with the extension of its official collection, specially created for the French Presidency. After the first exceptional piece, the Eternity presidential pen, the collection welcomes the new Liberté pen. the Liberté biros is finished in a deep blue lacquer inspired by the French flag, a perfect illustration of S.T. Dupont's emblematic lacquering technique. Dupont's emblematic lacquering technique. Each piece, engraved with the ‘Présidence de la République’ emblem, embodies the craftsmanship of S.T. Dupont and the French art of living. Related refills: 040853 Blue - 040854 Black` },
    collection: `presidence-de-la-republique`,
    categorySlug: "escrita",
    image: `/products/liberte-presidence-de-la-republique/465055.webp`,
    variants: [
      { sku: `465055`, name: { pt: `Ballpoint — Dark Blue`, en: `Ballpoint — Dark Blue` }, priceCents: 63500, currency: "EUR", attributes: { color: { label: { pt: `Dark Blue`, en: `Dark Blue` }, hex: ["#1f3c66"] } }, image: `/products/liberte-presidence-de-la-republique/465055.webp`, images: [`/products/liberte-presidence-de-la-republique/465055.webp`, `/products/liberte-presidence-de-la-republique/465055-2.webp`, `/products/liberte-presidence-de-la-republique/465055-3.webp`, `/products/liberte-presidence-de-la-republique/465055-4.webp`] },
    ],
  },
  {
    slug: `box-10-refills-2`,
    name: { pt: `Pistons`, en: `Pistons` },
    description: { pt: `This piston refill for fountain pen allows you to transform your cartridge fountain pen into a refillable fountain pen with your inkwell. Simply dip the pen's nib into an ink bottle, then turn the knob so the piston sucks the ink into the cartridge.`, en: `This piston refill for fountain pen allows you to transform your cartridge fountain pen into a refillable fountain pen with your inkwell. Simply dip the pen's nib into an ink bottle, then turn the knob so the piston sucks the ink into the cartridge.` },
    collection: `Gas Refills`,
    categorySlug: "acessorios",
    image: `/products/box-10-refills-2/040771.webp`,
    variants: [
      { sku: `040771`, name: { pt: `Pistons — Black`, en: `Pistons — Black` }, priceCents: 6100, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/box-10-refills-2/040771.webp`, images: [`/products/box-10-refills-2/040771.webp`] },
      { sku: `040770`, name: { pt: `Pistons — Blue`, en: `Pistons — Blue` }, priceCents: 6100, currency: "EUR", attributes: { color: { label: { pt: `Blue`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/box-10-refills-2/040770.webp`, images: [`/products/box-10-refills-2/040770.webp`] },
      { sku: `040854`, name: { pt: `Pistons — Black`, en: `Pistons — Black` }, priceCents: 9100, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/box-10-refills-2/040854.webp`, images: [`/products/box-10-refills-2/040854.webp`] },
      { sku: `040851`, name: { pt: `Pistons — Black`, en: `Pistons — Black` }, priceCents: 9100, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/box-10-refills-2/040851.webp`, images: [`/products/box-10-refills-2/040851.webp`] },
      { sku: `040850`, name: { pt: `Pistons — Blue`, en: `Pistons — Blue` }, priceCents: 9100, currency: "EUR", attributes: { color: { label: { pt: `Blue`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/box-10-refills-2/040850.webp`, images: [`/products/box-10-refills-2/040850.webp`] },
      { sku: `408812`, name: { pt: `Pistons — Black`, en: `Pistons — Black` }, priceCents: 9000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/box-10-refills-2/408812.webp`, images: [`/products/box-10-refills-2/408812.webp`] },
    ],
  },
  {
    slug: `defi-millennium-camo`,
    name: { pt: `Ballpoint pen`, en: `Ballpoint pen` },
    description: { pt: `This year, S.T. This year, S.T. Dupont reintroduces the camouflage pattern on its iconic products, featuring flames in vibrant shades of red and green for a fresh, bold interpretation of the legendary design. Défi Millenium ballpoint pen with matte green camouflage motif. Matte black finish. Made in France. Related refills: 040853 Blue - 040854 Black - 040358 Pink - 040359 Red - 040360 Green - 040361 Turquoise`, en: `This year, S.T. This year, S.T. Dupont reintroduces the camouflage pattern on its iconic products, featuring flames in vibrant shades of red and green for a fresh, bold interpretation of the legendary design. Défi Millenium ballpoint pen with matte green camouflage motif. Matte black finish. Made in France. Related refills: 040853 Blue - 040854 Black - 040358 Pink - 040359 Red - 040360 Green - 040361 Turquoise` },
    collection: `Camo`,
    categorySlug: "escrita",
    image: `/products/defi-millennium-camo/405050.webp`,
    variants: [
      { sku: `405050`, name: { pt: `Ballpoint pen — Khaki`, en: `Ballpoint pen — Khaki` }, priceCents: 37000, currency: "EUR", attributes: { color: { label: { pt: `Khaki`, en: `Khaki` }, hex: ["#3b5d39"] } }, image: `/products/defi-millennium-camo/405050.webp`, images: [`/products/defi-millennium-camo/405050.webp`, `/products/defi-millennium-camo/405050-2.webp`, `/products/defi-millennium-camo/405050-3.webp`, `/products/defi-millennium-camo/405050-4.webp`] },
    ],
  },
  {
    slug: `defi-millennium-20000-leagues`,
    name: { pt: `Rollerball`, en: `Rollerball` },
    description: { pt: `Tribute to the captivating universe of 20,000 leagues under the seas, this limited edition expresses all the know-how of S.T. Dupont. Published in 1870, the novel recounts the journey of three castaways captured by Captain Nemo, this mysterious inventor who travels the seabed aboard the Nautilus, submarine very ahead of the technologies of the time. Portholes, turbines, corals, fins and other tentacles of giant squid inspire this limited edition and its three ranges, all related to different chapters of the book. A story in three stages in which to dive with passion. In the chapter titled "Vanikoro", Captain Nemo and his three companions dock on the island of Vanikoro, surrounded by an incredible barrier reef. Challenge Millennium ballpoint pen in blue glossy lacquer decorated with bubbles and coral. Chrome finishes. Articulated lacquered staple. Available in ball and roller versions. Made in France. Related refills: 040853 Blue - 040854 Black - 040358 Pink - 040359 Red - 040360 Green - 040361 Turquoise`, en: `Tribute to the captivating universe of 20,000 leagues under the seas, this limited edition expresses all the know-how of S.T. Dupont. Published in 1870, the novel recounts the journey of three castaways captured by Captain Nemo, this mysterious inventor who travels the seabed aboard the Nautilus, submarine very ahead of the technologies of the time. Portholes, turbines, corals, fins and other tentacles of giant squid inspire this limited edition and its three ranges, all related to different chapters of the book. A story in three stages in which to dive with passion. In the chapter titled "Vanikoro", Captain Nemo and his three companions dock on the island of Vanikoro, surrounded by an incredible barrier reef. Challenge Millennium ballpoint pen in blue glossy lacquer decorated with bubbles and coral. Chrome finishes. Articulated lacquered staple. Available in ball and roller versions. Made in France. Related refills: 040853 Blue - 040854 Black - 040358 Pink - 040359 Red - 040360 Green - 040361 Turquoise` },
    collection: `20,000 Leagues Under The Sea`,
    categorySlug: "escrita",
    image: `/products/defi-millennium-20000-leagues/405053.webp`,
    variants: [
      { sku: `405053`, name: { pt: `Rollerball — Royal Blue`, en: `Rollerball — Royal Blue` }, priceCents: 38500, currency: "EUR", attributes: { color: { label: { pt: `Royal Blue`, en: `Royal Blue` }, hex: ["#1f3c66"] } }, image: `/products/defi-millennium-20000-leagues/405053.webp`, images: [`/products/defi-millennium-20000-leagues/405053.webp`, `/products/defi-millennium-20000-leagues/405053-2.webp`, `/products/defi-millennium-20000-leagues/405053-3.webp`, `/products/defi-millennium-20000-leagues/405053-4.webp`] },
      { sku: `402053`, name: { pt: `Rollerball — Royal Blue`, en: `Rollerball — Royal Blue` }, priceCents: 43500, currency: "EUR", attributes: { color: { label: { pt: `Royal Blue`, en: `Royal Blue` }, hex: ["#1f3c66"] } }, image: `/products/defi-millennium-20000-leagues/402053.webp`, images: [`/products/defi-millennium-20000-leagues/402053.webp`, `/products/defi-millennium-20000-leagues/402053-2.webp`, `/products/defi-millennium-20000-leagues/402053-3.webp`, `/products/defi-millennium-20000-leagues/402053-4.webp`] },
    ],
  },
  {
    slug: `d-initial-orlinski`,
    name: { pt: `Ballpoint pen`, en: `Ballpoint pen` },
    description: { pt: `S.T. Dupont partners with French artist Richard Orlinski for an exclusive collection where the power of sculptural gestures meets the precision of artisanal craftsmanship. Inspired by the iconic “Kong” motif and the wildness of nature, this collaboration brings a raw, contemporary energy to the Maison’s creations. Lighters and writing instruments become true works of art, enhanced by angular lines, contrasting textures, and vibrant colors. Initial ballpoint pen in orange lacquer decorated with the Orlinski “Kong” motif. Chrome finishes. Associated refills: 040853 Blue – 040854 Black – 040358 Pink – 040359 Red – 040360 Green – 040361 Turquoise`, en: `S.T. Dupont partners with French artist Richard Orlinski for an exclusive collection where the power of sculptural gestures meets the precision of artisanal craftsmanship. Inspired by the iconic “Kong” motif and the wildness of nature, this collaboration brings a raw, contemporary energy to the Maison’s creations. Lighters and writing instruments become true works of art, enhanced by angular lines, contrasting textures, and vibrant colors. Initial ballpoint pen in orange lacquer decorated with the Orlinski “Kong” motif. Chrome finishes. Associated refills: 040853 Blue – 040854 Black – 040358 Pink – 040359 Red – 040360 Green – 040361 Turquoise` },
    collection: `Orlinski`,
    categorySlug: "escrita",
    image: `/products/d-initial-orlinski/275063.webp`,
    variants: [
      { sku: `275063`, name: { pt: `Ballpoint pen — Orange`, en: `Ballpoint pen — Orange` }, priceCents: 32500, currency: "EUR", attributes: { color: { label: { pt: `Orange`, en: `Orange` }, hex: ["#c8a24a"] } }, image: `/products/d-initial-orlinski/275063.webp`, images: [`/products/d-initial-orlinski/275063.webp`, `/products/d-initial-orlinski/275063-2.webp`, `/products/d-initial-orlinski/275063-3.webp`, `/products/d-initial-orlinski/275063-4.webp`] },
      { sku: `275064`, name: { pt: `Ballpoint pen — Blue`, en: `Ballpoint pen — Blue` }, priceCents: 32500, currency: "EUR", attributes: { color: { label: { pt: `Blue`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/d-initial-orlinski/275064.webp`, images: [`/products/d-initial-orlinski/275064.webp`, `/products/d-initial-orlinski/275064-2.webp`, `/products/d-initial-orlinski/275064-3.webp`, `/products/d-initial-orlinski/275064-4.webp`] },
    ],
  },
  {
    slug: `classique-popote`,
    name: { pt: `Ballpoint pen`, en: `Ballpoint pen` },
    description: { pt: `An emblematic technique of the S.T. Dupont house, the so-called Popoté technique plays with material and light. Using a special stamp, the craftsman applies irregular touches to the lacquer, creating a painterly effect where the surface seems to vibrate under the light. Each gesture, both precise and random, reveals a unique depth. Classique ballpoint pen in blue Urushi lacquer with Popoté décor and gold finishes. Articulated blue lacquer clip. Sold with a ballpoint refill, can be converted into a mechanical pencil with mechanism reference 408811. Ballpoint refills: 040770 Blue - 040771 Black Mechanical pencil refills: 408811 - mechanical pencil mechanism. 040205 - 10 packs of 12 leads (0.7mm). 040206 - 10 boxes of 5 erasers.`, en: `An emblematic technique of the S.T. Dupont house, the so-called Popoté technique plays with material and light. Using a special stamp, the craftsman applies irregular touches to the lacquer, creating a painterly effect where the surface seems to vibrate under the light. Each gesture, both precise and random, reveals a unique depth. Classique ballpoint pen in blue Urushi lacquer with Popoté décor and gold finishes. Articulated blue lacquer clip. Sold with a ballpoint refill, can be converted into a mechanical pencil with mechanism reference 408811. Ballpoint refills: 040770 Blue - 040771 Black Mechanical pencil refills: 408811 - mechanical pencil mechanism. 040205 - 10 packs of 12 leads (0.7mm). 040206 - 10 boxes of 5 erasers.` },
    collection: `Popote`,
    categorySlug: "escrita",
    image: `/products/classique-popote/045318N.webp`,
    variants: [
      { sku: `045318N`, name: { pt: `Ballpoint pen — Red`, en: `Ballpoint pen — Red` }, priceCents: 75500, currency: "EUR", attributes: { color: { label: { pt: `Red`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/classique-popote/045318N.webp`, images: [`/products/classique-popote/045318N.webp`, `/products/classique-popote/045318N-2.webp`, `/products/classique-popote/045318N-3.webp`, `/products/classique-popote/045318N-4.webp`] },
      { sku: `045317N`, name: { pt: `Ballpoint pen — Red`, en: `Ballpoint pen — Red` }, priceCents: 75500, currency: "EUR", attributes: { color: { label: { pt: `Red`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/classique-popote/045317N.webp`, images: [`/products/classique-popote/045317N.webp`, `/products/classique-popote/045317N-2.webp`, `/products/classique-popote/045317N-3.webp`, `/products/classique-popote/045317N-4.webp`] },
    ],
  },
  {
    slug: `d-initial-geode`,
    name: { pt: `Stylo roller`, en: `Stylo roller` },
    description: { pt: `Mysterious and captivating, geodes inspire an S.T. Dupont collection expressed through two mineral tones: a deep blue evoking agate, a symbol of balance, and a vibrant green reminiscent of malachite, representing protection and energy. Like these precious stones, each Géode creation reflects the artisanal craftsmanship and precision excellence of S.T. Dupont. The Initial ballpoint pen is adorned with a motif inspired by the aesthetic of malachite. Gold finish. Associated refills: 040853 Blue - 040854 Black - 040358 Pink - 040359 Red - 040360 Green - 040361 Turquoise`, en: `Mysterious and captivating, geodes inspire an S.T. Dupont collection expressed through two mineral tones: a deep blue evoking agate, a symbol of balance, and a vibrant green reminiscent of malachite, representing protection and energy. Like these precious stones, each Géode creation reflects the artisanal craftsmanship and precision excellence of S.T. Dupont. The Initial ballpoint pen is adorned with a motif inspired by the aesthetic of malachite. Gold finish. Associated refills: 040853 Blue - 040854 Black - 040358 Pink - 040359 Red - 040360 Green - 040361 Turquoise` },
    collection: `Géode`,
    categorySlug: "escrita",
    image: `/products/d-initial-geode/275035.webp`,
    variants: [
      { sku: `275035`, name: { pt: `Stylo roller — Blue`, en: `Stylo roller — Blue` }, priceCents: 23000, currency: "EUR", attributes: { color: { label: { pt: `Blue`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/d-initial-geode/275035.webp`, images: [`/products/d-initial-geode/275035.webp`, `/products/d-initial-geode/275035-2.webp`, `/products/d-initial-geode/275035-3.webp`, `/products/d-initial-geode/275035-4.webp`] },
      { sku: `275036`, name: { pt: `Stylo roller — Green`, en: `Stylo roller — Green` }, priceCents: 23000, currency: "EUR", attributes: { color: { label: { pt: `Green`, en: `Green` }, hex: ["#3b5d39"] } }, image: `/products/d-initial-geode/275036.webp`, images: [`/products/d-initial-geode/275036.webp`, `/products/d-initial-geode/275036-2.webp`, `/products/d-initial-geode/275036-3.webp`, `/products/d-initial-geode/275036-4.webp`] },
      { sku: `272035`, name: { pt: `Stylo roller — Blue`, en: `Stylo roller — Blue` }, priceCents: 29000, currency: "EUR", attributes: { color: { label: { pt: `Blue`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/d-initial-geode/272035.webp`, images: [`/products/d-initial-geode/272035.webp`, `/products/d-initial-geode/272035-2.webp`, `/products/d-initial-geode/272035-3.webp`, `/products/d-initial-geode/272035-4.webp`] },
      { sku: `272036`, name: { pt: `Stylo roller — Green`, en: `Stylo roller — Green` }, priceCents: 29000, currency: "EUR", attributes: { color: { label: { pt: `Green`, en: `Green` }, hex: ["#3b5d39"] } }, image: `/products/d-initial-geode/272036.webp`, images: [`/products/d-initial-geode/272036.webp`, `/products/d-initial-geode/272036-2.webp`, `/products/d-initial-geode/272036-3.webp`, `/products/d-initial-geode/272036-4.webp`] },
    ],
  },
  {
    slug: `eternity-snake-skin-2`,
    name: { pt: `Rollerball pen large`, en: `Rollerball pen large` },
    description: { pt: `The Snake Skin line slips its original snakeskin guilloche under a bold green lacquer or the more classic black. A way of honoring the traditional and exclusive method of guilloche under lacquer, as well as the soul of this reptile to which the lunar year 2025 is dedicated. Line D Eternity large fountain pen in green snake-scale guilloche lacquer. Cap with snake-scale guilloche and palladium finish. Articulated Sword clasp. Solid 14-carat gold nib. Piston included. Available in ball, roller and nib versions. Associated refills : * Ink cartridges: 040112 Blue - 040110 Black - 040362 Red - 040363 Green - 040364 Turquoise * Ink fountains: 040165 Intense Black - 040166 Royal Blue -040167 Blazing Red - 040168 Spring Green - 040169 Turquoise - 040170 Midnight Blue This fountain pen comes with a medium nib, for a writing size of apporox. 0.55 mm.`, en: `The Snake Skin line slips its original snakeskin guilloche under a bold green lacquer or the more classic black. A way of honoring the traditional and exclusive method of guilloche under lacquer, as well as the soul of this reptile to which the lunar year 2025 is dedicated. Line D Eternity large fountain pen in green snake-scale guilloche lacquer. Cap with snake-scale guilloche and palladium finish. Articulated Sword clasp. Solid 14-carat gold nib. Piston included. Available in ball, roller and nib versions. Associated refills : * Ink cartridges: 040112 Blue - 040110 Black - 040362 Red - 040363 Green - 040364 Turquoise * Ink fountains: 040165 Intense Black - 040166 Royal Blue -040167 Blazing Red - 040168 Spring Green - 040169 Turquoise - 040170 Midnight Blue This fountain pen comes with a medium nib, for a writing size of apporox. 0.55 mm.` },
    collection: `Snake Skin`,
    categorySlug: "escrita",
    image: `/products/eternity-snake-skin-2/425078L.webp`,
    variants: [
      { sku: `425078L`, name: { pt: `Rollerball pen large — Green`, en: `Rollerball pen large — Green` }, priceCents: 77000, currency: "EUR", attributes: { color: { label: { pt: `Green`, en: `Green` }, hex: ["#3b5d39"] } }, image: `/products/eternity-snake-skin-2/425078L.webp`, images: [`/products/eternity-snake-skin-2/425078L.webp`, `/products/eternity-snake-skin-2/425078L-2.webp`, `/products/eternity-snake-skin-2/425078L-3.webp`, `/products/eternity-snake-skin-2/425078L-4.webp`] },
      { sku: `425079L`, name: { pt: `Rollerball pen large — Black`, en: `Rollerball pen large — Black` }, priceCents: 77000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/eternity-snake-skin-2/425079L.webp`, images: [`/products/eternity-snake-skin-2/425079L.webp`, `/products/eternity-snake-skin-2/425079L-2.webp`, `/products/eternity-snake-skin-2/425079L-3.webp`, `/products/eternity-snake-skin-2/425079L-4.webp`] },
      { sku: `420078L`, name: { pt: `Rollerball pen large — Green`, en: `Rollerball pen large — Green` }, priceCents: 103000, currency: "EUR", attributes: { color: { label: { pt: `Green`, en: `Green` }, hex: ["#3b5d39"] } }, image: `/products/eternity-snake-skin-2/420078L.webp`, images: [`/products/eternity-snake-skin-2/420078L.webp`, `/products/eternity-snake-skin-2/420078L-2.webp`, `/products/eternity-snake-skin-2/420078L-3.webp`, `/products/eternity-snake-skin-2/420078L-4.webp`] },
      { sku: `422078L`, name: { pt: `Rollerball pen large — Green`, en: `Rollerball pen large — Green` }, priceCents: 83000, currency: "EUR", attributes: { color: { label: { pt: `Green`, en: `Green` }, hex: ["#3b5d39"] } }, image: `/products/eternity-snake-skin-2/422078L.webp`, images: [`/products/eternity-snake-skin-2/422078L.webp`, `/products/eternity-snake-skin-2/422078L-2.webp`, `/products/eternity-snake-skin-2/422078L-3.webp`, `/products/eternity-snake-skin-2/422078L-4.webp`] },
    ],
  },
  {
    slug: `pen-refill`,
    name: { pt: `roller-blue`, en: `roller-blue` },
    description: { pt: `Medium Black Rollerball Refill – Sold individually. Compatible with: Olympio, Défi, Liberté, Neo-Classique Large, Classique 2, D.Link/Caprice, Fidelio, Ellipsis, Montparnasse, Gatsby, Line D, Mon Dupont by Karl Lagerfeld, Streamline R, New Line D, D-Initial.`, en: `Medium Black Rollerball Refill – Sold individually. Compatible with: Olympio, Défi, Liberté, Neo-Classique Large, Classique 2, D.Link/Caprice, Fidelio, Ellipsis, Montparnasse, Gatsby, Line D, Mon Dupont by Karl Lagerfeld, Streamline R, New Line D, D-Initial.` },
    collection: `Pen Refills`,
    categorySlug: "acessorios",
    image: `/products/pen-refill/940854.webp`,
    variants: [
      { sku: `940854`, name: { pt: `roller-blue — Black`, en: `roller-blue — Black` }, priceCents: 900, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/pen-refill/940854.webp`, images: [`/products/pen-refill/940854.webp`] },
      { sku: `940851`, name: { pt: `roller-blue — Black`, en: `roller-blue — Black` }, priceCents: 900, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/pen-refill/940851.webp`, images: [`/products/pen-refill/940851.webp`] },
      { sku: `940850`, name: { pt: `roller-blue — Blue`, en: `roller-blue — Blue` }, priceCents: 900, currency: "EUR", attributes: { color: { label: { pt: `Blue`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/pen-refill/940850.webp`, images: [`/products/pen-refill/940850.webp`] },
      { sku: `940853`, name: { pt: `roller-blue — Blue`, en: `roller-blue — Blue` }, priceCents: 900, currency: "EUR", attributes: { color: { label: { pt: `Blue`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/pen-refill/940853.webp`, images: [`/products/pen-refill/940853.webp`] },
      { sku: `940831`, name: { pt: `roller-blue — Black`, en: `roller-blue — Black` }, priceCents: 800, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/pen-refill/940831.webp`, images: [`/products/pen-refill/940831.webp`] },
      { sku: `940830`, name: { pt: `roller-blue — Blue`, en: `roller-blue — Blue` }, priceCents: 800, currency: "EUR", attributes: { color: { label: { pt: `Blue`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/pen-refill/940830.webp`, images: [`/products/pen-refill/940830.webp`] },
      { sku: `940841`, name: { pt: `roller-blue — Black`, en: `roller-blue — Black` }, priceCents: 800, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/pen-refill/940841.webp`, images: [`/products/pen-refill/940841.webp`] },
      { sku: `940840`, name: { pt: `roller-blue — Blue`, en: `roller-blue — Blue` }, priceCents: 800, currency: "EUR", attributes: { color: { label: { pt: `Blue`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/pen-refill/940840.webp`, images: [`/products/pen-refill/940840.webp`] },
    ],
  },
  {
    slug: `line-d-2`,
    name: { pt: `Reversible belt`, en: `Reversible belt` },
    description: { pt: `For almost 50 years, S.T. Dupont has offered a wide range of belts combining the House's different expertise to dress men with elegance. These belts are available in a wide choice of leathers, in reversible or non-reversible versions, with 30 or 35 mm wide straps and with different buckles: pin buckles, self-locking buckles or box buckles.`, en: `For almost 50 years, S.T. Dupont has offered a wide range of belts combining the House's different expertise to dress men with elegance. These belts are available in a wide choice of leathers, in reversible or non-reversible versions, with 30 or 35 mm wide straps and with different buckles: pin buckles, self-locking buckles or box buckles.` },
    collection: `Line D Eternity`,
    categorySlug: "escrita",
    image: `/products/line-d-2/8300000.webp`,
    variants: [
      { sku: `8300000`, name: { pt: `Reversible belt — Black`, en: `Reversible belt — Black` }, priceCents: 19000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-2/8300000.webp`, images: [`/products/line-d-2/8300000.webp`, `/products/line-d-2/8300000-2.webp`] },
      { sku: `8300001`, name: { pt: `Reversible belt — Black`, en: `Reversible belt — Black` }, priceCents: 19000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-2/8300001.webp`, images: [`/products/line-d-2/8300001.webp`, `/products/line-d-2/8300001-2.webp`] },
      { sku: `8300002`, name: { pt: `Reversible belt — Black`, en: `Reversible belt — Black` }, priceCents: 19000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-2/8300002.webp`, images: [`/products/line-d-2/8300002.webp`, `/products/line-d-2/8300002-2.webp`] },
      { sku: `8350000`, name: { pt: `Reversible belt — Black`, en: `Reversible belt — Black` }, priceCents: 22500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-2/8350000.webp`, images: [`/products/line-d-2/8350000.webp`, `/products/line-d-2/8350000-2.webp`] },
      { sku: `8350001`, name: { pt: `Reversible belt — Black`, en: `Reversible belt — Black` }, priceCents: 22500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-2/8350001.webp`, images: [`/products/line-d-2/8350001.webp`, `/products/line-d-2/8350001-2.webp`] },
      { sku: `8350002`, name: { pt: `Reversible belt — Black`, en: `Reversible belt — Black` }, priceCents: 22500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-2/8350002.webp`, images: [`/products/line-d-2/8350002.webp`, `/products/line-d-2/8350002-2.webp`] },
      { sku: `8350100`, name: { pt: `Reversible belt — Black`, en: `Reversible belt — Black` }, priceCents: 22500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-2/8350100.webp`, images: [`/products/line-d-2/8350100.webp`, `/products/line-d-2/8350100-2.webp`] },
      { sku: `8350200`, name: { pt: `Reversible belt — Dark Blue`, en: `Reversible belt — Dark Blue` }, priceCents: 22500, currency: "EUR", attributes: { color: { label: { pt: `Dark Blue`, en: `Dark Blue` }, hex: ["#1f3c66"] } }, image: `/products/line-d-2/8350200.webp`, images: [`/products/line-d-2/8350200.webp`, `/products/line-d-2/8350200-2.webp`] },
      { sku: `007107`, name: { pt: `Reversible belt — Black`, en: `Reversible belt — Black` }, priceCents: 49500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-2/007107.webp`, images: [`/products/line-d-2/007107.webp`, `/products/line-d-2/007107-2.webp`, `/products/line-d-2/007107-3.webp`] },
      { sku: `007104`, name: { pt: `Reversible belt — Black`, en: `Reversible belt — Black` }, priceCents: 24000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-2/007104.webp`, images: [`/products/line-d-2/007104.webp`, `/products/line-d-2/007104-2.webp`, `/products/line-d-2/007104-3.webp`, `/products/line-d-2/007104-4.webp`] },
      { sku: `180016`, name: { pt: `Reversible belt — Black`, en: `Reversible belt — Black` }, priceCents: 14000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-2/180016.webp`, images: [`/products/line-d-2/180016.webp`, `/products/line-d-2/180016-2.webp`] },
      { sku: `007110`, name: { pt: `Reversible belt — Black`, en: `Reversible belt — Black` }, priceCents: 22000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-2/007110.webp`, images: [`/products/line-d-2/007110.webp`, `/products/line-d-2/007110-2.webp`, `/products/line-d-2/007110-3.webp`, `/products/line-d-2/007110-4.webp`] },
      { sku: `8200120`, name: { pt: `Reversible belt — Black & Brown`, en: `Reversible belt — Black & Brown` }, priceCents: 22000, currency: "EUR", attributes: { color: { label: { pt: `Black & Brown`, en: `Black & Brown` }, hex: ["#15171c"] } }, image: `/products/line-d-2/8200120.webp`, images: [`/products/line-d-2/8200120.webp`, `/products/line-d-2/8200120-2.webp`, `/products/line-d-2/8200120-3.webp`, `/products/line-d-2/8200120-4.webp`] },
      { sku: `8210160`, name: { pt: `Reversible belt — Black`, en: `Reversible belt — Black` }, priceCents: 24000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-2/8210160.webp`, images: [`/products/line-d-2/8210160.webp`] },
      { sku: `8300011`, name: { pt: `Reversible belt — Black`, en: `Reversible belt — Black` }, priceCents: 22500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-2/8300011.webp`, images: [`/products/line-d-2/8300011.webp`, `/products/line-d-2/8300011-2.webp`] },
      { sku: `8300012`, name: { pt: `Reversible belt — Black`, en: `Reversible belt — Black` }, priceCents: 22500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-2/8300012.webp`, images: [`/products/line-d-2/8300012.webp`, `/products/line-d-2/8300012-2.webp`] },
      { sku: `8300013`, name: { pt: `Reversible belt — Black`, en: `Reversible belt — Black` }, priceCents: 22500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-2/8300013.webp`, images: [`/products/line-d-2/8300013.webp`, `/products/line-d-2/8300013-2.webp`] },
      { sku: `8350011`, name: { pt: `Reversible belt — Black`, en: `Reversible belt — Black` }, priceCents: 25000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-2/8350011.webp`, images: [`/products/line-d-2/8350011.webp`, `/products/line-d-2/8350011-2.webp`] },
      { sku: `8350012`, name: { pt: `Reversible belt — Black`, en: `Reversible belt — Black` }, priceCents: 25000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-2/8350012.webp`, images: [`/products/line-d-2/8350012.webp`, `/products/line-d-2/8350012-2.webp`, `/products/line-d-2/8350012-3.webp`] },
      { sku: `8350013`, name: { pt: `Reversible belt — Black`, en: `Reversible belt — Black` }, priceCents: 25000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-2/8350013.webp`, images: [`/products/line-d-2/8350013.webp`, `/products/line-d-2/8350013-2.webp`] },
    ],
  },
  {
    slug: `apex-2`,
    name: { pt: `Belt`, en: `Belt` },
    description: { pt: `For almost 50 years, S.T. Dupont has offered a wide range of belts combining the House's different expertise to dress men with elegance. These belts are available in a wide choice of leathers, in reversible or non-reversible versions, with 30 or 35 mm wide straps and with different buckles: pin buckles or case buckles.`, en: `For almost 50 years, S.T. Dupont has offered a wide range of belts combining the House's different expertise to dress men with elegance. These belts are available in a wide choice of leathers, in reversible or non-reversible versions, with 30 or 35 mm wide straps and with different buckles: pin buckles or case buckles.` },
    collection: `Apex`,
    categorySlug: "pele",
    image: `/products/apex-2/9301000.webp`,
    variants: [
      { sku: `9301000`, name: { pt: `Belt — Black`, en: `Belt — Black` }, priceCents: 31500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/apex-2/9301000.webp`, images: [`/products/apex-2/9301000.webp`, `/products/apex-2/9301000-2.webp`] },
    ],
  },
  {
    slug: `atelier-3`,
    name: { pt: `Travel bag`, en: `Travel bag` },
    description: { pt: `This compact vertical portfolio, in full -flower calf leather embossed with the crocrow patinated patinum in hand offers unique shades of black. It has many locations for cards and easily slips in most pockets. - 4 locations for cards, - 1 flat compartment for tickets, - 2 compartments received`, en: `This compact vertical portfolio, in full -flower calf leather embossed with the crocrow patinated patinum in hand offers unique shades of black. It has many locations for cards and easily slips in most pockets. - 4 locations for cards, - 1 flat compartment for tickets, - 2 compartments received` },
    collection: `Atelier`,
    categorySlug: "pele",
    image: `/products/atelier-3/141055.webp`,
    variants: [
      { sku: `141055`, name: { pt: `Travel bag — Black`, en: `Travel bag — Black` }, priceCents: 146000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/atelier-3/141055.webp`, images: [`/products/atelier-3/141055.webp`, `/products/atelier-3/141055-2.webp`, `/products/atelier-3/141055-3.webp`, `/products/atelier-3/141055-4.webp`] },
      { sku: `141355`, name: { pt: `Travel bag — Blue`, en: `Travel bag — Blue` }, priceCents: 146000, currency: "EUR", attributes: { color: { label: { pt: `Blue`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/atelier-3/141355.webp`, images: [`/products/atelier-3/141355.webp`, `/products/atelier-3/141355-2.webp`, `/products/atelier-3/141355-3.webp`, `/products/atelier-3/141355-4.webp`] },
      { sku: `190578`, name: { pt: `Travel bag — Black`, en: `Travel bag — Black` }, priceCents: 45500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/atelier-3/190578.webp`, images: [`/products/atelier-3/190578.webp`, `/products/atelier-3/190578-2.webp`, `/products/atelier-3/190578-3.webp`] },
      { sku: `141054`, name: { pt: `Travel bag — Black`, en: `Travel bag — Black` }, priceCents: 106000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/atelier-3/141054.webp`, images: [`/products/atelier-3/141054.webp`, `/products/atelier-3/141054-2.webp`, `/products/atelier-3/141054-3.webp`, `/products/atelier-3/141054-4.webp`] },
      { sku: `141354`, name: { pt: `Travel bag — Blue`, en: `Travel bag — Blue` }, priceCents: 106000, currency: "EUR", attributes: { color: { label: { pt: `Blue`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/atelier-3/141354.webp`, images: [`/products/atelier-3/141354.webp`, `/products/atelier-3/141354-2.webp`, `/products/atelier-3/141354-3.webp`, `/products/atelier-3/141354-4.webp`] },
      { sku: `190574`, name: { pt: `Travel bag — Black`, en: `Travel bag — Black` }, priceCents: 111000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/atelier-3/190574.webp`, images: [`/products/atelier-3/190574.webp`, `/products/atelier-3/190574-2.webp`, `/products/atelier-3/190574-3.webp`, `/products/atelier-3/190574-4.webp`] },
      { sku: `141053`, name: { pt: `Travel bag — Black`, en: `Travel bag — Black` }, priceCents: 131000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/atelier-3/141053.webp`, images: [`/products/atelier-3/141053.webp`, `/products/atelier-3/141053-2.webp`, `/products/atelier-3/141053-3.webp`, `/products/atelier-3/141053-4.webp`] },
      { sku: `141353`, name: { pt: `Travel bag — Blue`, en: `Travel bag — Blue` }, priceCents: 126000, currency: "EUR", attributes: { color: { label: { pt: `Blue`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/atelier-3/141353.webp`, images: [`/products/atelier-3/141353.webp`, `/products/atelier-3/141353-2.webp`, `/products/atelier-3/141353-3.webp`, `/products/atelier-3/141353-4.webp`] },
      { sku: `141453`, name: { pt: `Travel bag — Brown`, en: `Travel bag — Brown` }, priceCents: 131000, currency: "EUR", attributes: { color: { label: { pt: `Brown`, en: `Brown` }, hex: ["#6b4a2a"] } }, image: `/products/atelier-3/141453.webp`, images: [`/products/atelier-3/141453.webp`, `/products/atelier-3/141453-2.webp`, `/products/atelier-3/141453-3.webp`, `/products/atelier-3/141453-4.webp`] },
      { sku: `191474`, name: { pt: `Travel bag — Brown`, en: `Travel bag — Brown` }, priceCents: 232000, currency: "EUR", attributes: { color: { label: { pt: `Brown`, en: `Brown` }, hex: ["#6b4a2a"] } }, image: `/products/atelier-3/191474.webp`, images: [`/products/atelier-3/191474.webp`, `/products/atelier-3/191474-2.webp`, `/products/atelier-3/191474-3.webp`, `/products/atelier-3/191474-4.webp`] },
      { sku: `191376`, name: { pt: `Travel bag — Blue`, en: `Travel bag — Blue` }, priceCents: 252000, currency: "EUR", attributes: { color: { label: { pt: `Blue`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/atelier-3/191376.webp`, images: [`/products/atelier-3/191376.webp`, `/products/atelier-3/191376-2.webp`, `/products/atelier-3/191376-3.webp`, `/products/atelier-3/191376-4.webp`] },
      { sku: `191476`, name: { pt: `Travel bag — Brown`, en: `Travel bag — Brown` }, priceCents: 252000, currency: "EUR", attributes: { color: { label: { pt: `Brown`, en: `Brown` }, hex: ["#6b4a2a"] } }, image: `/products/atelier-3/191476.webp`, images: [`/products/atelier-3/191476.webp`, `/products/atelier-3/191476-2.webp`, `/products/atelier-3/191476-3.webp`, `/products/atelier-3/191476-4.webp`] },
      { sku: `191576`, name: { pt: `Travel bag — Black`, en: `Travel bag — Black` }, priceCents: 252000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/atelier-3/191576.webp`, images: [`/products/atelier-3/191576.webp`, `/products/atelier-3/191576-2.webp`, `/products/atelier-3/191576-3.webp`, `/products/atelier-3/191576-4.webp`] },
    ],
  },
  {
    slug: `monogram-1872-2`,
    name: { pt: `Shopping`, en: `Shopping` },
    description: { pt: `1872 is a collection of practical, elegant bags, just like the trunks of the Maison's early days. 1872 is also the year the Maison was founded, the beginning of a never-ending quest for excellence and exceptional objects. Proud of its expertise, S.T. Dupont uses a guilloche from the 1950s to decorate this line with an all-over design that blends heritage and modernity.Inspired by 1950s guilloché, this unisex bag combines elegance and functionality. The bag is made in Italy, combining waterproof coated canvas and full-grained calf leather, with a grey cotton interior with two flat pockets. Leather used is LWG certified.`, en: `1872 is a collection of practical, elegant bags, just like the trunks of the Maison's early days. 1872 is also the year the Maison was founded, the beginning of a never-ending quest for excellence and exceptional objects. Proud of its expertise, S.T. Dupont uses a guilloche from the 1950s to decorate this line with an all-over design that blends heritage and modernity.Inspired by 1950s guilloché, this unisex bag combines elegance and functionality. The bag is made in Italy, combining waterproof coated canvas and full-grained calf leather, with a grey cotton interior with two flat pockets. Leather used is LWG certified.` },
    collection: `Monogram 1872`,
    categorySlug: "pele",
    image: `/products/monogram-1872-2/1MG183BK2.webp`,
    variants: [
      { sku: `1MG183BK2`, name: { pt: `Shopping — Dark Gray & Grey`, en: `Shopping — Dark Gray & Grey` }, priceCents: 99000, currency: "EUR", attributes: { color: { label: { pt: `Dark Gray & Grey`, en: `Dark Gray & Grey` }, hex: ["#7a7d83"] } }, image: `/products/monogram-1872-2/1MG183BK2.webp`, images: [`/products/monogram-1872-2/1MG183BK2.webp`, `/products/monogram-1872-2/1MG183BK2-2.webp`, `/products/monogram-1872-2/1MG183BK2-3.webp`, `/products/monogram-1872-2/1MG183BK2-4.webp`] },
      { sku: `1MG183GN1`, name: { pt: `Shopping — Grey & Light Gray`, en: `Shopping — Grey & Light Gray` }, priceCents: 99000, currency: "EUR", attributes: { color: { label: { pt: `Grey & Light Gray`, en: `Grey & Light Gray` }, hex: ["#7a7d83"] } }, image: `/products/monogram-1872-2/1MG183GN1.webp`, images: [`/products/monogram-1872-2/1MG183GN1.webp`, `/products/monogram-1872-2/1MG183GN1-2.webp`, `/products/monogram-1872-2/1MG183GN1-3.webp`, `/products/monogram-1872-2/1MG183GN1-4.webp`] },
      { sku: `1MG333RD1`, name: { pt: `Shopping — Red`, en: `Shopping — Red` }, priceCents: 115000, currency: "EUR", attributes: { color: { label: { pt: `Red`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/monogram-1872-2/1MG333RD1.webp`, images: [`/products/monogram-1872-2/1MG333RD1.webp`, `/products/monogram-1872-2/1MG333RD1-2.webp`, `/products/monogram-1872-2/1MG333RD1-3.webp`, `/products/monogram-1872-2/1MG333RD1-4.webp`] },
    ],
  },
  {
    slug: `camera-bag-cohiba-behike`,
    name: { pt: `Camera bag`, en: `Camera bag` },
    description: { pt: `To celebrate the 15th anniversary of Línea Behike, S.T. Dupont has teamed up with Cohiba for an exclusive collection of lighters and accessories. Inspired by Behike's emblematic codes, it combines black and white checks, gold finishes and deep black lacquer. The “Behike” effigy, revisited by the goldsmiths at S.T. Dupont, sublimates this unique collaboration, a tribute to the know-how and e*cellence of both houses. Camera Bag Cohiba Behike with gloss finish. Smooth calf leather`, en: `To celebrate the 15th anniversary of Línea Behike, S.T. Dupont has teamed up with Cohiba for an exclusive collection of lighters and accessories. Inspired by Behike's emblematic codes, it combines black and white checks, gold finishes and deep black lacquer. The “Behike” effigy, revisited by the goldsmiths at S.T. Dupont, sublimates this unique collaboration, a tribute to the know-how and e*cellence of both houses. Camera Bag Cohiba Behike with gloss finish. Smooth calf leather` },
    collection: `Cohiba-Behike`,
    categorySlug: "pele",
    image: `/products/camera-bag-cohiba-behike/1BE183BK1.webp`,
    variants: [
      { sku: `1BE183BK1`, name: { pt: `Camera bag — Black`, en: `Camera bag — Black` }, priceCents: 120000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/camera-bag-cohiba-behike/1BE183BK1.webp`, images: [`/products/camera-bag-cohiba-behike/1BE183BK1.webp`, `/products/camera-bag-cohiba-behike/1BE183BK1-2.webp`, `/products/camera-bag-cohiba-behike/1BE183BK1-3.webp`, `/products/camera-bag-cohiba-behike/1BE183BK1-4.webp`] },
    ],
  },
  {
    slug: `gift-box-gift`,
    name: { pt: `Pen stand`, en: `Pen stand` },
    description: { pt: `Acessório S.T. Dupont — feito à mão nas oficinas de Faverges, herdeiro do savoir-faire da Maison desde 1872.`, en: `S.T. Dupont accessory — made by hand at the Faverges workshops, an heir to the Maison's savoir-faire since 1872.` },
    collection: `Gift`,
    categorySlug: "acessorios",
    image: `/products/gift-box-gift/087601.webp`,
    variants: [
      { sku: `087601`, name: { pt: `Pen stand — Dark Blue`, en: `Pen stand — Dark Blue` }, priceCents: 20000, currency: "EUR", attributes: { color: { label: { pt: `Dark Blue`, en: `Dark Blue` }, hex: ["#1f3c66"] } }, image: `/products/gift-box-gift/087601.webp`, images: [`/products/gift-box-gift/087601.webp`] },
      { sku: `087451`, name: { pt: `Pen stand — Dark Blue`, en: `Pen stand — Dark Blue` }, priceCents: 20000, currency: "EUR", attributes: { color: { label: { pt: `Dark Blue`, en: `Dark Blue` }, hex: ["#1f3c66"] } }, image: `/products/gift-box-gift/087451.webp`, images: [`/products/gift-box-gift/087451.webp`] },
    ],
  },
  {
    slug: `line-d-3`,
    name: { pt: `Wallet`, en: `Wallet` },
    description: { pt: `This iconic black leather briefcase exudes modern business sophistication. A palladium push-button closure adds to the refinement of this bag. It features deep compartments and secure zippered pockets, providing ample space for documents and tech devices. As stylish as it is functional, it is perfect for any business trip. - Main compartment with large interior pocket - Compartment with 4 small pockets - Zippered pocket - Exterior pocket on the back`, en: `This iconic black leather briefcase exudes modern business sophistication. A palladium push-button closure adds to the refinement of this bag. It features deep compartments and secure zippered pockets, providing ample space for documents and tech devices. As stylish as it is functional, it is perfect for any business trip. - Main compartment with large interior pocket - Compartment with 4 small pockets - Zippered pocket - Exterior pocket on the back` },
    collection: `Line D Eternity`,
    categorySlug: "escrita",
    image: `/products/line-d-3/180008.webp`,
    variants: [
      { sku: `180008`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 19000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-3/180008.webp`, images: [`/products/line-d-3/180008.webp`, `/products/line-d-3/180008-2.webp`, `/products/line-d-3/180008-3.webp`] },
      { sku: `180011`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 23000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-3/180011.webp`, images: [`/products/line-d-3/180011.webp`, `/products/line-d-3/180011-2.webp`] },
      { sku: `180013`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 24000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-3/180013.webp`, images: [`/products/line-d-3/180013.webp`, `/products/line-d-3/180013-2.webp`] },
      { sku: `181006`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 69500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-3/181006.webp`, images: [`/products/line-d-3/181006.webp`, `/products/line-d-3/181006-2.webp`, `/products/line-d-3/181006-3.webp`, `/products/line-d-3/181006-4.webp`] },
      { sku: `181003SS`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 126000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-3/181003SS.webp`, images: [`/products/line-d-3/181003SS.webp`, `/products/line-d-3/181003SS-2.webp`, `/products/line-d-3/181003SS-3.webp`, `/products/line-d-3/181003SS-4.webp`] },
      { sku: `180012`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 29000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-3/180012.webp`, images: [`/products/line-d-3/180012.webp`, `/products/line-d-3/180012-2.webp`] },
      { sku: `181000`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 120000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-3/181000.webp`, images: [`/products/line-d-3/181000.webp`, `/products/line-d-3/181000-2.webp`, `/products/line-d-3/181000-3.webp`, `/products/line-d-3/181000-4.webp`] },
      { sku: `181001`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 140000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-3/181001.webp`, images: [`/products/line-d-3/181001.webp`, `/products/line-d-3/181001-2.webp`, `/products/line-d-3/181001-3.webp`, `/products/line-d-3/181001-4.webp`] },
      { sku: `180000`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 31500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-3/180000.webp`, images: [`/products/line-d-3/180000.webp`, `/products/line-d-3/180000-2.webp`] },
      { sku: `180001`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 32500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-3/180001.webp`, images: [`/products/line-d-3/180001.webp`, `/products/line-d-3/180001-2.webp`] },
      { sku: `180003`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 38500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-3/180003.webp`, images: [`/products/line-d-3/180003.webp`, `/products/line-d-3/180003-2.webp`, `/products/line-d-3/180003-3.webp`] },
      { sku: `180007`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 38500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-3/180007.webp`, images: [`/products/line-d-3/180007.webp`, `/products/line-d-3/180007-2.webp`, `/products/line-d-3/180007-3.webp`] },
    ],
  },
  {
    slug: `neo-capsule-2`,
    name: { pt: `Wallet`, en: `Wallet` },
    description: { pt: `Crafted from full-grain calf leather, the long zippered wallet carries cards and coins with incomparable style. It features multiple card slots, a zippered pocket for coins, and compartments for papers and bills. The entire Neo capsule collection is LWG certified. - 12 card slots - 2 large compartments for papers and receipts - Zippered compartment for coins - Gusseted compartment for bills.`, en: `Crafted from full-grain calf leather, the long zippered wallet carries cards and coins with incomparable style. It features multiple card slots, a zippered pocket for coins, and compartments for papers and bills. The entire Neo capsule collection is LWG certified. - 12 card slots - 2 large compartments for papers and receipts - Zippered compartment for coins - Gusseted compartment for bills.` },
    collection: `Neo Capsule`,
    categorySlug: "pele",
    image: `/products/neo-capsule-2/180204.webp`,
    variants: [
      { sku: `180204`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 19000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/neo-capsule-2/180204.webp`, images: [`/products/neo-capsule-2/180204.webp`, `/products/neo-capsule-2/180204-2.webp`] },
      { sku: `180227`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 19000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/neo-capsule-2/180227.webp`, images: [`/products/neo-capsule-2/180227.webp`, `/products/neo-capsule-2/180227-2.webp`] },
      { sku: `141004`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 91000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/neo-capsule-2/141004.webp`, images: [`/products/neo-capsule-2/141004.webp`, `/products/neo-capsule-2/141004-2.webp`, `/products/neo-capsule-2/141004-3.webp`, `/products/neo-capsule-2/141004-4.webp`] },
      { sku: `141003`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 101000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/neo-capsule-2/141003.webp`, images: [`/products/neo-capsule-2/141003.webp`, `/products/neo-capsule-2/141003-2.webp`, `/products/neo-capsule-2/141003-3.webp`, `/products/neo-capsule-2/141003-4.webp`] },
      { sku: `181441`, name: { pt: `Wallet — Green & Khaki`, en: `Wallet — Green & Khaki` }, priceCents: 109000, currency: "EUR", attributes: { color: { label: { pt: `Green & Khaki`, en: `Green & Khaki` }, hex: ["#3b5d39"] } }, image: `/products/neo-capsule-2/181441.webp`, images: [`/products/neo-capsule-2/181441.webp`, `/products/neo-capsule-2/181441-2.webp`, `/products/neo-capsule-2/181441-3.webp`, `/products/neo-capsule-2/181441-4.webp`] },
      { sku: `181341`, name: { pt: `Wallet — Dark Blue`, en: `Wallet — Dark Blue` }, priceCents: 109000, currency: "EUR", attributes: { color: { label: { pt: `Dark Blue`, en: `Dark Blue` }, hex: ["#1f3c66"] } }, image: `/products/neo-capsule-2/181341.webp`, images: [`/products/neo-capsule-2/181341.webp`, `/products/neo-capsule-2/181341-2.webp`, `/products/neo-capsule-2/181341-3.webp`, `/products/neo-capsule-2/181341-4.webp`] },
      { sku: `181241`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 109000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/neo-capsule-2/181241.webp`, images: [`/products/neo-capsule-2/181241.webp`, `/products/neo-capsule-2/181241-2.webp`, `/products/neo-capsule-2/181241-3.webp`, `/products/neo-capsule-2/181241-4.webp`] },
      { sku: `181242`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 125000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/neo-capsule-2/181242.webp`, images: [`/products/neo-capsule-2/181242.webp`, `/products/neo-capsule-2/181242-2.webp`, `/products/neo-capsule-2/181242-3.webp`, `/products/neo-capsule-2/181242-4.webp`] },
      { sku: `180281`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 18000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/neo-capsule-2/180281.webp`, images: [`/products/neo-capsule-2/180281.webp`] },
      { sku: `181444`, name: { pt: `Wallet — Khaki`, en: `Wallet — Khaki` }, priceCents: 84500, currency: "EUR", attributes: { color: { label: { pt: `Khaki`, en: `Khaki` }, hex: ["#3b5d39"] } }, image: `/products/neo-capsule-2/181444.webp`, images: [`/products/neo-capsule-2/181444.webp`, `/products/neo-capsule-2/181444-2.webp`, `/products/neo-capsule-2/181444-3.webp`, `/products/neo-capsule-2/181444-4.webp`] },
      { sku: `181344`, name: { pt: `Wallet — Dark Blue`, en: `Wallet — Dark Blue` }, priceCents: 84500, currency: "EUR", attributes: { color: { label: { pt: `Dark Blue`, en: `Dark Blue` }, hex: ["#1f3c66"] } }, image: `/products/neo-capsule-2/181344.webp`, images: [`/products/neo-capsule-2/181344.webp`, `/products/neo-capsule-2/181344-2.webp`, `/products/neo-capsule-2/181344-3.webp`, `/products/neo-capsule-2/181344-4.webp`] },
      { sku: `181244`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 84500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/neo-capsule-2/181244.webp`, images: [`/products/neo-capsule-2/181244.webp`, `/products/neo-capsule-2/181244-2.webp`, `/products/neo-capsule-2/181244-3.webp`, `/products/neo-capsule-2/181244-4.webp`] },
      { sku: `180226`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 23000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/neo-capsule-2/180226.webp`, images: [`/products/neo-capsule-2/180226.webp`, `/products/neo-capsule-2/180226-2.webp`] },
      { sku: `181243`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 79500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/neo-capsule-2/181243.webp`, images: [`/products/neo-capsule-2/181243.webp`, `/products/neo-capsule-2/181243-2.webp`, `/products/neo-capsule-2/181243-3.webp`, `/products/neo-capsule-2/181243-4.webp`] },
      { sku: `181245`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 55500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/neo-capsule-2/181245.webp`, images: [`/products/neo-capsule-2/181245.webp`, `/products/neo-capsule-2/181245-2.webp`, `/products/neo-capsule-2/181245-3.webp`, `/products/neo-capsule-2/181245-4.webp`] },
      { sku: `181246`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 66500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/neo-capsule-2/181246.webp`, images: [`/products/neo-capsule-2/181246.webp`, `/products/neo-capsule-2/181246-2.webp`, `/products/neo-capsule-2/181246-3.webp`, `/products/neo-capsule-2/181246-4.webp`] },
      { sku: `181446`, name: { pt: `Wallet — Khaki`, en: `Wallet — Khaki` }, priceCents: 66500, currency: "EUR", attributes: { color: { label: { pt: `Khaki`, en: `Khaki` }, hex: ["#3b5d39"] } }, image: `/products/neo-capsule-2/181446.webp`, images: [`/products/neo-capsule-2/181446.webp`, `/products/neo-capsule-2/181446-2.webp`, `/products/neo-capsule-2/181446-3.webp`] },
      { sku: `181346`, name: { pt: `Wallet — Blue`, en: `Wallet — Blue` }, priceCents: 66500, currency: "EUR", attributes: { color: { label: { pt: `Blue`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/neo-capsule-2/181346.webp`, images: [`/products/neo-capsule-2/181346.webp`, `/products/neo-capsule-2/181346-2.webp`, `/products/neo-capsule-2/181346-3.webp`, `/products/neo-capsule-2/181346-4.webp`] },
      { sku: `180206`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 29000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/neo-capsule-2/180206.webp`, images: [`/products/neo-capsule-2/180206.webp`, `/products/neo-capsule-2/180206-2.webp`] },
      { sku: `180205`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 38500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/neo-capsule-2/180205.webp`, images: [`/products/neo-capsule-2/180205.webp`, `/products/neo-capsule-2/180205-2.webp`] },
      { sku: `180202`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 24000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/neo-capsule-2/180202.webp`, images: [`/products/neo-capsule-2/180202.webp`, `/products/neo-capsule-2/180202-2.webp`] },
      { sku: `180223`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 28000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/neo-capsule-2/180223.webp`, images: [`/products/neo-capsule-2/180223.webp`, `/products/neo-capsule-2/180223-2.webp`] },
      { sku: `180225`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 39500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/neo-capsule-2/180225.webp`, images: [`/products/neo-capsule-2/180225.webp`, `/products/neo-capsule-2/180225-2.webp`] },
    ],
  },
  {
    slug: `haute-creation`,
    name: { pt: `Casino`, en: `Casino` },
    description: { pt: `This exquisite design lighter features a precise clockwork mechanism and high-end jewellery details. Its polished brass is finished with palladium and its delicate micromechanism includes 26 watchmaker rubies for the best performance. The glass window showcases the amazing coloured wheel mechanism lacquered by S.T. Dupont. The lighter offers a soft double flame. It is specially packed in the S.T. Dupont Cube cigar box, with a black and matte finish. To order this exceptional product, please contact the customer service. Delivery time is approximately 6 months after receipt and validation of the order. The item is limited to 88 pieces, with a serial number engraved on the lighter. Please contact customer service to know the available number. Dimensions: 40.9 x 18 x 66 mm`, en: `This exquisite design lighter features a precise clockwork mechanism and high-end jewellery details. Its polished brass is finished with palladium and its delicate micromechanism includes 26 watchmaker rubies for the best performance. The glass window showcases the amazing coloured wheel mechanism lacquered by S.T. Dupont. The lighter offers a soft double flame. It is specially packed in the S.T. Dupont Cube cigar box, with a black and matte finish. To order this exceptional product, please contact the customer service. Delivery time is approximately 6 months after receipt and validation of the order. The item is limited to 88 pieces, with a serial number engraved on the lighter. Please contact customer service to know the available number. Dimensions: 40.9 x 18 x 66 mm` },
    collection: `Haute Création`,
    categorySlug: "isqueiros",
    image: `/products/haute-creation/016358PAL.webp`,
    variants: [
      { sku: `016358PAL`, name: { pt: `Casino — Silver`, en: `Casino — Silver` }, priceCents: 4537500, currency: "EUR", attributes: { color: { label: { pt: `Silver`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/haute-creation/016358PAL.webp`, images: [`/products/haute-creation/016358PAL.webp`, `/products/haute-creation/016358PAL-2.webp`, `/products/haute-creation/016358PAL-3.webp`, `/products/haute-creation/016358PAL-4.webp`] },
      { sku: `016358BL`, name: { pt: `Casino — Black`, en: `Casino — Black` }, priceCents: 4537500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/haute-creation/016358BL.webp`, images: [`/products/haute-creation/016358BL.webp`, `/products/haute-creation/016358BL-2.webp`, `/products/haute-creation/016358BL-3.webp`, `/products/haute-creation/016358BL-4.webp`] },
      { sku: `016358RG`, name: { pt: `Casino — Pink`, en: `Casino — Pink` }, priceCents: 4537500, currency: "EUR", attributes: { color: { label: { pt: `Pink`, en: `Pink` }, hex: ["#c97a8c"] } }, image: `/products/haute-creation/016358RG.webp`, images: [`/products/haute-creation/016358RG.webp`, `/products/haute-creation/016358RG-2.webp`, `/products/haute-creation/016358RG-3.webp`, `/products/haute-creation/016358RG-4.webp`] },
      { sku: `016358`, name: { pt: `Casino — Golden`, en: `Casino — Golden` }, priceCents: 4537500, currency: "EUR", attributes: { color: { label: { pt: `Golden`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/haute-creation/016358.webp`, images: [`/products/haute-creation/016358.webp`, `/products/haute-creation/016358-2.webp`, `/products/haute-creation/016358-3.webp`, `/products/haute-creation/016358-4.webp`] },
    ],
  },
  {
    slug: `cufflinks`,
    name: { pt: `Diamond head`, en: `Diamond head` },
    description: { pt: `Cufflinks in stainless steel finish, both classic and contemporary, and matching tie clips.`, en: `Cufflinks in stainless steel finish, both classic and contemporary, and matching tie clips.` },
    collection: `Cufflinks`,
    categorySlug: "acessorios",
    image: `/products/cufflinks/005576.webp`,
    variants: [
      { sku: `005576`, name: { pt: `Diamond head — Silver`, en: `Diamond head — Silver` }, priceCents: 23000, currency: "EUR", attributes: { color: { label: { pt: `Silver`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/cufflinks/005576.webp`, images: [`/products/cufflinks/005576.webp`, `/products/cufflinks/005576-2.webp`, `/products/cufflinks/005576-3.webp`] },
      { sku: `005575`, name: { pt: `Diamond head — Blue & Silver`, en: `Diamond head — Blue & Silver` }, priceCents: 23000, currency: "EUR", attributes: { color: { label: { pt: `Blue & Silver`, en: `Blue & Silver` }, hex: ["#1f3c66"] } }, image: `/products/cufflinks/005575.webp`, images: [`/products/cufflinks/005575.webp`, `/products/cufflinks/005575-2.webp`, `/products/cufflinks/005575-3.webp`] },
      { sku: `005585`, name: { pt: `Diamond head — Silver`, en: `Diamond head — Silver` }, priceCents: 26000, currency: "EUR", attributes: { color: { label: { pt: `Silver`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/cufflinks/005585.webp`, images: [`/products/cufflinks/005585.webp`, `/products/cufflinks/005585-2.webp`, `/products/cufflinks/005585-3.webp`] },
      { sku: `005832`, name: { pt: `Diamond head — Black & Silver`, en: `Diamond head — Black & Silver` }, priceCents: 26000, currency: "EUR", attributes: { color: { label: { pt: `Black & Silver`, en: `Black & Silver` }, hex: ["#15171c"] } }, image: `/products/cufflinks/005832.webp`, images: [`/products/cufflinks/005832.webp`, `/products/cufflinks/005832-2.webp`, `/products/cufflinks/005832-3.webp`] },
      { sku: `005833`, name: { pt: `Diamond head — Black & Golden`, en: `Diamond head — Black & Golden` }, priceCents: 26000, currency: "EUR", attributes: { color: { label: { pt: `Black & Golden`, en: `Black & Golden` }, hex: ["#15171c"] } }, image: `/products/cufflinks/005833.webp`, images: [`/products/cufflinks/005833.webp`, `/products/cufflinks/005833-2.webp`, `/products/cufflinks/005833-3.webp`] },
      { sku: `005834`, name: { pt: `Diamond head — Silver`, en: `Diamond head — Silver` }, priceCents: 25000, currency: "EUR", attributes: { color: { label: { pt: `Silver`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/cufflinks/005834.webp`, images: [`/products/cufflinks/005834.webp`, `/products/cufflinks/005834-2.webp`, `/products/cufflinks/005834-3.webp`, `/products/cufflinks/005834-4.webp`] },
      { sku: `005835`, name: { pt: `Diamond head — Golden`, en: `Diamond head — Golden` }, priceCents: 25000, currency: "EUR", attributes: { color: { label: { pt: `Golden`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/cufflinks/005835.webp`, images: [`/products/cufflinks/005835.webp`, `/products/cufflinks/005835-2.webp`, `/products/cufflinks/005835-3.webp`] },
      { sku: `005836`, name: { pt: `Diamond head — Gold & Golden`, en: `Diamond head — Gold & Golden` }, priceCents: 26000, currency: "EUR", attributes: { color: { label: { pt: `Gold & Golden`, en: `Gold & Golden` }, hex: ["#c8a24a"] } }, image: `/products/cufflinks/005836.webp`, images: [`/products/cufflinks/005836.webp`, `/products/cufflinks/005836-2.webp`, `/products/cufflinks/005836-3.webp`] },
      { sku: `005837`, name: { pt: `Diamond head — Silver`, en: `Diamond head — Silver` }, priceCents: 26000, currency: "EUR", attributes: { color: { label: { pt: `Silver`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/cufflinks/005837.webp`, images: [`/products/cufflinks/005837.webp`, `/products/cufflinks/005837-2.webp`, `/products/cufflinks/005837-3.webp`] },
      { sku: `005567`, name: { pt: `Diamond head — Silver`, en: `Diamond head — Silver` }, priceCents: 23000, currency: "EUR", attributes: { color: { label: { pt: `Silver`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/cufflinks/005567.webp`, images: [`/products/cufflinks/005567.webp`, `/products/cufflinks/005567-2.webp`, `/products/cufflinks/005567-3.webp`] },
      { sku: `005597`, name: { pt: `Diamond head — Silver`, en: `Diamond head — Silver` }, priceCents: 22000, currency: "EUR", attributes: { color: { label: { pt: `Silver`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/cufflinks/005597.webp`, images: [`/products/cufflinks/005597.webp`, `/products/cufflinks/005597-2.webp`, `/products/cufflinks/005597-3.webp`] },
    ],
  },
  {
    slug: `tie-clip-3`,
    name: { pt: `Chrome`, en: `Chrome` },
    description: { pt: `Golden metal tie clip. To coordinate with cufflinks.`, en: `Golden metal tie clip. To coordinate with cufflinks.` },
    collection: `Tie-clip`,
    categorySlug: "acessorios",
    image: `/products/tie-clip-3/005842.webp`,
    variants: [
      { sku: `005842`, name: { pt: `Chrome — Gold & Golden`, en: `Chrome — Gold & Golden` }, priceCents: 25000, currency: "EUR", attributes: { color: { label: { pt: `Gold & Golden`, en: `Gold & Golden` }, hex: ["#c8a24a"] } }, image: `/products/tie-clip-3/005842.webp`, images: [`/products/tie-clip-3/005842.webp`, `/products/tie-clip-3/005842-2.webp`] },
    ],
  },
  {
    slug: `box-8-refills`,
    name: { pt: `Flint`, en: `Flint` },
    description: { pt: `Black flint stone. Sold in packs of 8 flint stones. For the following lighters: Line 1, Line 2, Gatsby, Urban, Soubreny, Long Table Lighter, Jéroboam, Cylindrical.`, en: `Black flint stone. Sold in packs of 8 flint stones. For the following lighters: Line 1, Line 2, Gatsby, Urban, Soubreny, Long Table Lighter, Jéroboam, Cylindrical.` },
    collection: `Gas Refills`,
    categorySlug: "acessorios",
    image: `/products/box-8-refills/900601.webp`,
    variants: [
      { sku: `900601`, name: { pt: `Flint — Black`, en: `Flint — Black` }, priceCents: 400, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/box-8-refills/900601.webp`, images: [`/products/box-8-refills/900601.webp`] },
      { sku: `900651`, name: { pt: `Flint — Red`, en: `Flint — Red` }, priceCents: 400, currency: "EUR", attributes: { color: { label: { pt: `Red`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/box-8-refills/900651.webp`, images: [`/products/box-8-refills/900651.webp`] },
    ],
  },
  {
    slug: `line-d-montecristo-la-nuit`,
    name: { pt: `Rollerball pen`, en: `Rollerball pen` },
    description: { pt: `In Dupont lacquer, the Line D Large writing instrument proudly displays the S.T. Dupont crest and the Montecristo logo. Adorned with a 14-carat solid gold nib, it is dedicated to writing enthusiasts in search of excellence and writing comfort. Montecristo La Nuit offers: three lighters, two Line D Large writing instruments, cigar accessories and a pair of cufflinks. Associated refills: 040112 Blue 040110 Black 040362 Red 040363 Green 040364 Turquoise This fountain pen comes with a medium nib, for a writing size of apporox. 0.55 mm.`, en: `In Dupont lacquer, the Line D Large writing instrument proudly displays the S.T. Dupont crest and the Montecristo logo. Adorned with a 14-carat solid gold nib, it is dedicated to writing enthusiasts in search of excellence and writing comfort. Montecristo La Nuit offers: three lighters, two Line D Large writing instruments, cigar accessories and a pair of cufflinks. Associated refills: 040112 Blue 040110 Black 040362 Red 040363 Green 040364 Turquoise This fountain pen comes with a medium nib, for a writing size of apporox. 0.55 mm.` },
    collection: `Montecristo · La Nuit`,
    categorySlug: "escrita",
    image: `/products/line-d-montecristo-la-nuit/410135L.webp`,
    variants: [
      { sku: `410135L`, name: { pt: `Rollerball pen — Blue`, en: `Rollerball pen — Blue` }, priceCents: 158000, currency: "EUR", attributes: { color: { label: { pt: `Blue`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/line-d-montecristo-la-nuit/410135L.webp`, images: [`/products/line-d-montecristo-la-nuit/410135L.webp`, `/products/line-d-montecristo-la-nuit/410135L-2.webp`, `/products/line-d-montecristo-la-nuit/410135L-3.webp`, `/products/line-d-montecristo-la-nuit/410135L-4.webp`] },
      { sku: `412135L`, name: { pt: `Rollerball pen — Blue`, en: `Rollerball pen — Blue` }, priceCents: 127000, currency: "EUR", attributes: { color: { label: { pt: `Blue`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/line-d-montecristo-la-nuit/412135L.webp`, images: [`/products/line-d-montecristo-la-nuit/412135L.webp`, `/products/line-d-montecristo-la-nuit/412135L-2.webp`, `/products/line-d-montecristo-la-nuit/412135L-3.webp`, `/products/line-d-montecristo-la-nuit/412135L-4.webp`] },
    ],
  },
  {
    slug: `line-d-montecristo-aurore`,
    name: { pt: `Rollerball pen`, en: `Rollerball pen` },
    description: { pt: `Montecristo and S.T. Dupont, both synonymous with unique craftsmanship, have joined forces to create exceptional products. This new collection will delight fans of both brands. In Dupont lacquer, the large Line D writing instrument proudly displays the S.T.Dupont crest and the Montecristo logo. Adorned with a 14-carat solid gold nib, it is dedicated to writing enthusiasts in search of excellence and writing comfort. Montecristo L'Aurore offers: three lighters, two large Line D writing instruments, cigar accessories and a pair of cufflinks. Associated refills: 040112 Blue 040110 Black 040362 Red 040363 Green 040364 Turquoise This fountain pen comes with a medium nib, for a writing size of apporox. 0.55 mm.`, en: `Montecristo and S.T. Dupont, both synonymous with unique craftsmanship, have joined forces to create exceptional products. This new collection will delight fans of both brands. In Dupont lacquer, the large Line D writing instrument proudly displays the S.T.Dupont crest and the Montecristo logo. Adorned with a 14-carat solid gold nib, it is dedicated to writing enthusiasts in search of excellence and writing comfort. Montecristo L'Aurore offers: three lighters, two large Line D writing instruments, cigar accessories and a pair of cufflinks. Associated refills: 040112 Blue 040110 Black 040362 Red 040363 Green 040364 Turquoise This fountain pen comes with a medium nib, for a writing size of apporox. 0.55 mm.` },
    collection: `Montecristo · L'Aurore`,
    categorySlug: "escrita",
    image: `/products/line-d-montecristo-aurore/410134L.webp`,
    variants: [
      { sku: `410134L`, name: { pt: `Rollerball pen — Violet`, en: `Rollerball pen — Violet` }, priceCents: 158000, currency: "EUR", attributes: { color: { label: { pt: `Violet`, en: `Violet` }, hex: ["#6b4a8a"] } }, image: `/products/line-d-montecristo-aurore/410134L.webp`, images: [`/products/line-d-montecristo-aurore/410134L.webp`, `/products/line-d-montecristo-aurore/410134L-2.webp`, `/products/line-d-montecristo-aurore/410134L-3.webp`, `/products/line-d-montecristo-aurore/410134L-4.webp`] },
      { sku: `412134L`, name: { pt: `Rollerball pen — Violet`, en: `Rollerball pen — Violet` }, priceCents: 127000, currency: "EUR", attributes: { color: { label: { pt: `Violet`, en: `Violet` }, hex: ["#6b4a8a"] } }, image: `/products/line-d-montecristo-aurore/412134L.webp`, images: [`/products/line-d-montecristo-aurore/412134L.webp`, `/products/line-d-montecristo-aurore/412134L-2.webp`, `/products/line-d-montecristo-aurore/412134L-3.webp`, `/products/line-d-montecristo-aurore/412134L-4.webp`] },
    ],
  },
  {
    slug: `eternity-20000-leagues`,
    name: { pt: `Rollerball large`, en: `Rollerball large` },
    description: { pt: `Tribute to the captivating universe of 20,000 leagues under the seas, this limited edition expresses all the know-how of S.T. Dupont. Published in 1870, the novel recounts the journey of three castaways captured by Captain Nemo, this mysterious inventor who travels the seabed aboard the Nautilus, submarine very ahead of the technologies of the time. Portholes, turbines, corals, fins and other tentacles of giant squid inspire this limited edition and its three ranges, all related to different chapters of the book. A story in three stages in which to dive with passion. For the Premium range of this edition 20,000 leagues under the seas, S.T. Dupont tells two other chapters: «4000 leagues under the Pacific», chapter 18 of the book, and «Gulf Stream», chapter 19 of its second part. In the latter, Jules Verne evokes the Gulf Stream, a natural force shaping the movement of the oceans and those who are there. Fast-moving and perilous, it also allows Captain Nemo to demonstrate his excellence. Line D Eternity wide guilloche fountain pen under "waves" lacquer. Covered with S.T. Dupont blue gradient lacquer. Palladium finishes. 14-karat gold nib. Piston included. Engraved cap of the iconic N of the Nautilus. Articulated Sword Agrafe. Sleeve engraved with bubbles. Available in roller and feather version. Associated refills: Ink cartridges: 040112 Blue - 040110 Black - 040362 Red - 040363 Green - 040364 Turquoise Inkwell: 040165 Intense black - 040166 Royal blue -040167 Flamboyant red - 040168 Spring green - 040169 Turquoise - 040170 Night blue`, en: `Tribute to the captivating universe of 20,000 leagues under the seas, this limited edition expresses all the know-how of S.T. Dupont. Published in 1870, the novel recounts the journey of three castaways captured by Captain Nemo, this mysterious inventor who travels the seabed aboard the Nautilus, submarine very ahead of the technologies of the time. Portholes, turbines, corals, fins and other tentacles of giant squid inspire this limited edition and its three ranges, all related to different chapters of the book. A story in three stages in which to dive with passion. For the Premium range of this edition 20,000 leagues under the seas, S.T. Dupont tells two other chapters: «4000 leagues under the Pacific», chapter 18 of the book, and «Gulf Stream», chapter 19 of its second part. In the latter, Jules Verne evokes the Gulf Stream, a natural force shaping the movement of the oceans and those who are there. Fast-moving and perilous, it also allows Captain Nemo to demonstrate his excellence. Line D Eternity wide guilloche fountain pen under "waves" lacquer. Covered with S.T. Dupont blue gradient lacquer. Palladium finishes. 14-karat gold nib. Piston included. Engraved cap of the iconic N of the Nautilus. Articulated Sword Agrafe. Sleeve engraved with bubbles. Available in roller and feather version. Associated refills: Ink cartridges: 040112 Blue - 040110 Black - 040362 Red - 040363 Green - 040364 Turquoise Inkwell: 040165 Intense black - 040166 Royal blue -040167 Flamboyant red - 040168 Spring green - 040169 Turquoise - 040170 Night blue` },
    collection: `20,000 Leagues Under The Sea`,
    categorySlug: "escrita",
    image: `/products/eternity-20000-leagues/420051L.webp`,
    variants: [
      { sku: `420051L`, name: { pt: `Rollerball large — Blue Gulf Stream`, en: `Rollerball large — Blue Gulf Stream` }, priceCents: 161500, currency: "EUR", attributes: { color: { label: { pt: `Blue Gulf Stream`, en: `Blue Gulf Stream` }, hex: ["#1f3c66"] } }, image: `/products/eternity-20000-leagues/420051L.webp`, images: [`/products/eternity-20000-leagues/420051L.webp`, `/products/eternity-20000-leagues/420051L-2.webp`, `/products/eternity-20000-leagues/420051L-3.webp`, `/products/eternity-20000-leagues/420051L-4.webp`] },
      { sku: `420052L`, name: { pt: `Rollerball large — Green Pacific`, en: `Rollerball large — Green Pacific` }, priceCents: 161500, currency: "EUR", attributes: { color: { label: { pt: `Green Pacific`, en: `Green Pacific` }, hex: ["#3b5d39"] } }, image: `/products/eternity-20000-leagues/420052L.webp`, images: [`/products/eternity-20000-leagues/420052L.webp`, `/products/eternity-20000-leagues/420052L-2.webp`, `/products/eternity-20000-leagues/420052L-3.webp`, `/products/eternity-20000-leagues/420052L-4.webp`] },
      { sku: `422051L`, name: { pt: `Rollerball large — Blue Gulf Stream`, en: `Rollerball large — Blue Gulf Stream` }, priceCents: 130000, currency: "EUR", attributes: { color: { label: { pt: `Blue Gulf Stream`, en: `Blue Gulf Stream` }, hex: ["#1f3c66"] } }, image: `/products/eternity-20000-leagues/422051L.webp`, images: [`/products/eternity-20000-leagues/422051L.webp`, `/products/eternity-20000-leagues/422051L-2.webp`, `/products/eternity-20000-leagues/422051L-3.webp`, `/products/eternity-20000-leagues/422051L-4.webp`] },
      { sku: `422052L`, name: { pt: `Rollerball large — Green Pacific`, en: `Rollerball large — Green Pacific` }, priceCents: 131000, currency: "EUR", attributes: { color: { label: { pt: `Green Pacific`, en: `Green Pacific` }, hex: ["#3b5d39"] } }, image: `/products/eternity-20000-leagues/422052L.webp`, images: [`/products/eternity-20000-leagues/422052L.webp`, `/products/eternity-20000-leagues/422052L-2.webp`, `/products/eternity-20000-leagues/422052L-3.webp`, `/products/eternity-20000-leagues/422052L-4.webp`] },
    ],
  },
  {
    slug: `eternity-horse-mane`,
    name: { pt: `Rollerball pen large`, en: `Rollerball pen large` },
    description: { pt: `On the occasion of the Chinese New Year 2026, under the sign of the Fire Horse, S.T. Dupont unveils Horse, a dazzling collection that embodies charisma, majesty, and passion. The “mane” guilloche pattern and equestrian sculpture elegantly evoke the traditions of Chinese culture. The Line D Eternity large fountain pen features guilloche under red lacquer with a “horse’s mane” design and gold finishes. Equipped with a 14-carat gold nib and built-in piston. The cap is adorned with a golden Fire Horse, complemented by an articulated Sword clip. Available in both rollerball and fountain pen versions. Compatible ink cartridges: 040112 Blue – 040110 Black – 040362 Red – 040363 Green – 040364 Turquoise Compatible ink bottles: 040165 Intense Black – 040166 Royal Blue – 040167 Vibrant Red – 040168 Spring Green – 040169 Turquoise – 040170 Midnight Blue`, en: `On the occasion of the Chinese New Year 2026, under the sign of the Fire Horse, S.T. Dupont unveils Horse, a dazzling collection that embodies charisma, majesty, and passion. The “mane” guilloche pattern and equestrian sculpture elegantly evoke the traditions of Chinese culture. The Line D Eternity large fountain pen features guilloche under red lacquer with a “horse’s mane” design and gold finishes. Equipped with a 14-carat gold nib and built-in piston. The cap is adorned with a golden Fire Horse, complemented by an articulated Sword clip. Available in both rollerball and fountain pen versions. Compatible ink cartridges: 040112 Blue – 040110 Black – 040362 Red – 040363 Green – 040364 Turquoise Compatible ink bottles: 040165 Intense Black – 040166 Royal Blue – 040167 Vibrant Red – 040168 Spring Green – 040169 Turquoise – 040170 Midnight Blue` },
    collection: `Horse Mane`,
    categorySlug: "escrita",
    image: `/products/eternity-horse-mane/420080L.webp`,
    variants: [
      { sku: `420080L`, name: { pt: `Rollerball pen large — Red`, en: `Rollerball pen large — Red` }, priceCents: 111000, currency: "EUR", attributes: { color: { label: { pt: `Red`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/eternity-horse-mane/420080L.webp`, images: [`/products/eternity-horse-mane/420080L.webp`, `/products/eternity-horse-mane/420080L-2.webp`, `/products/eternity-horse-mane/420080L-3.webp`, `/products/eternity-horse-mane/420080L-4.webp`] },
      { sku: `420088L`, name: { pt: `Rollerball pen large — Black`, en: `Rollerball pen large — Black` }, priceCents: 111000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/eternity-horse-mane/420088L.webp`, images: [`/products/eternity-horse-mane/420088L.webp`, `/products/eternity-horse-mane/420088L-2.webp`, `/products/eternity-horse-mane/420088L-3.webp`, `/products/eternity-horse-mane/420088L-4.webp`] },
      { sku: `422088L`, name: { pt: `Rollerball pen large — Black`, en: `Rollerball pen large — Black` }, priceCents: 91000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/eternity-horse-mane/422088L.webp`, images: [`/products/eternity-horse-mane/422088L.webp`, `/products/eternity-horse-mane/422088L-2.webp`, `/products/eternity-horse-mane/422088L-3.webp`, `/products/eternity-horse-mane/422088L-4.webp`] },
      { sku: `422080L`, name: { pt: `Rollerball pen large — Red`, en: `Rollerball pen large — Red` }, priceCents: 91000, currency: "EUR", attributes: { color: { label: { pt: `Red`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/eternity-horse-mane/422080L.webp`, images: [`/products/eternity-horse-mane/422080L.webp`, `/products/eternity-horse-mane/422080L-2.webp`, `/products/eternity-horse-mane/422080L-3.webp`, `/products/eternity-horse-mane/422080L-4.webp`] },
    ],
  },
  {
    slug: `box-7-refills-2`,
    name: { pt: `Pink ballpoint pen`, en: `Pink ballpoint pen` },
    description: { pt: `Recharge your medium-point green pens for all Défi, Liberté, Line D, Streamliner-R, and D-Initial Jet 8 Pen lines. Sold in boxes of 7.`, en: `Recharge your medium-point green pens for all Défi, Liberté, Line D, Streamliner-R, and D-Initial Jet 8 Pen lines. Sold in boxes of 7.` },
    collection: `Gas Refills`,
    categorySlug: "acessorios",
    image: `/products/box-7-refills-2/040360.webp`,
    variants: [
      { sku: `040360`, name: { pt: `Pink ballpoint pen — Green`, en: `Pink ballpoint pen — Green` }, priceCents: 10000, currency: "EUR", attributes: { color: { label: { pt: `Green`, en: `Green` }, hex: ["#3b5d39"] } }, image: `/products/box-7-refills-2/040360.webp`, images: [`/products/box-7-refills-2/040360.webp`] },
      { sku: `040358`, name: { pt: `Pink ballpoint pen — Pink`, en: `Pink ballpoint pen — Pink` }, priceCents: 10000, currency: "EUR", attributes: { color: { label: { pt: `Pink`, en: `Pink` }, hex: ["#c97a8c"] } }, image: `/products/box-7-refills-2/040358.webp`, images: [`/products/box-7-refills-2/040358.webp`] },
    ],
  },
  {
    slug: `ligne-2-dragon`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `The Line 2 is adorned with a guilloche dragon scale cover and gold finishes, as well as a guilloche body under Dupont lacquer in honey color. Associated refills: Red (REF 000434) Black stone (REF 900601)`, en: `The Line 2 is adorned with a guilloche dragon scale cover and gold finishes, as well as a guilloche body under Dupont lacquer in honey color. Associated refills: Red (REF 000434) Black stone (REF 900601)` },
    collection: `Dragon`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-dragon/C16630.webp`,
    variants: [
      { sku: `C16630`, name: { pt: `Lacquered lighter — Honey`, en: `Lacquered lighter — Honey` }, priceCents: 141000, currency: "EUR", attributes: { color: { label: { pt: `Honey`, en: `Honey` }, hex: ["#7a7d83"] } }, image: `/products/ligne-2-dragon/C16630.webp`, images: [`/products/ligne-2-dragon/C16630.webp`, `/products/ligne-2-dragon/C16630-2.webp`, `/products/ligne-2-dragon/C16630-3.webp`, `/products/ligne-2-dragon/C16630-4.webp`] },
      { sku: `C16527`, name: { pt: `Lacquered lighter — Black`, en: `Lacquered lighter — Black` }, priceCents: 141000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/ligne-2-dragon/C16527.webp`, images: [`/products/ligne-2-dragon/C16527.webp`, `/products/ligne-2-dragon/C16527-2.webp`, `/products/ligne-2-dragon/C16527-3.webp`, `/products/ligne-2-dragon/C16527-4.webp`] },
    ],
  },
  {
    slug: `ligne-2-snake-skin`,
    name: { pt: `Guilloche under lacquer lighter`, en: `Guilloche under lacquer lighter` },
    description: { pt: `The Snake Skin line slips its original snakeskin guilloche under a bold green lacquer or the more classic black. A way of honoring the traditional and exclusive method of under-lacquer guilloche, as well as the soul of this reptile to which the lunar year 2025 is dedicated. Ligne 2 Cling lighter, guilloche under lacquer, green Snake skin motif, palladium finish. Featuring a double yellow flame and the famous “Cling” on opening. Matching lighter stone: black (REF 900601) Associated gas refill: red (REF 900435) Lighter delivered empty of gas, refill sold separately.`, en: `The Snake Skin line slips its original snakeskin guilloche under a bold green lacquer or the more classic black. A way of honoring the traditional and exclusive method of under-lacquer guilloche, as well as the soul of this reptile to which the lunar year 2025 is dedicated. Ligne 2 Cling lighter, guilloche under lacquer, green Snake skin motif, palladium finish. Featuring a double yellow flame and the famous “Cling” on opening. Matching lighter stone: black (REF 900601) Associated gas refill: red (REF 900435) Lighter delivered empty of gas, refill sold separately.` },
    collection: `Snake Skin`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-snake-skin/C16078.webp`,
    variants: [
      { sku: `C16078`, name: { pt: `Guilloche under lacquer lighter — Green`, en: `Guilloche under lacquer lighter — Green` }, priceCents: 145000, currency: "EUR", attributes: { color: { label: { pt: `Green`, en: `Green` }, hex: ["#3b5d39"] } }, image: `/products/ligne-2-snake-skin/C16078.webp`, images: [`/products/ligne-2-snake-skin/C16078.webp`, `/products/ligne-2-snake-skin/C16078-2.webp`, `/products/ligne-2-snake-skin/C16078-3.webp`, `/products/ligne-2-snake-skin/C16078-4.webp`] },
    ],
  },
  {
    slug: `ligne-2-camo-2`,
    name: { pt: `Guilloche under lacquer lighter`, en: `Guilloche under lacquer lighter` },
    description: { pt: `This year, S.T. This year, S.T. Dupont reintroduces the camouflage motif on its iconic products, with a fresh, bold interpretation of the legendary design, featuring flames in vibrant shades of red and green. Ligne 2 Cling lighter guilloche under lacquer with red Camouflage motif, palladium finish Featuring a double yellow flame and the famous “Cling” when opened. Matching lighter stone: black (REF 900601) Associated gas refill: red (REF 900435) Lighter delivered empty of gas, refill sold separately.`, en: `This year, S.T. This year, S.T. Dupont reintroduces the camouflage motif on its iconic products, with a fresh, bold interpretation of the legendary design, featuring flames in vibrant shades of red and green. Ligne 2 Cling lighter guilloche under lacquer with red Camouflage motif, palladium finish Featuring a double yellow flame and the famous “Cling” when opened. Matching lighter stone: black (REF 900601) Associated gas refill: red (REF 900435) Lighter delivered empty of gas, refill sold separately.` },
    collection: `Camo`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-camo-2/C16051.webp`,
    variants: [
      { sku: `C16051`, name: { pt: `Guilloche under lacquer lighter — Red`, en: `Guilloche under lacquer lighter — Red` }, priceCents: 135000, currency: "EUR", attributes: { color: { label: { pt: `Red`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/ligne-2-camo-2/C16051.webp`, images: [`/products/ligne-2-camo-2/C16051.webp`, `/products/ligne-2-camo-2/C16051-2.webp`, `/products/ligne-2-camo-2/C16051-3.webp`, `/products/ligne-2-camo-2/C16051-4.webp`] },
    ],
  },
  {
    slug: `ligne-2-horse-mane-2`,
    name: { pt: `Horse mane guilloche`, en: `Horse mane guilloche` },
    description: { pt: `On the occasion of the 2026 Chinese New Year, under the sign of the Fire Horse, S.T. Dupont unveils Horse, a flamboyant collection embodying charisma, majesty, and passion. The “mane” guilloché and equine sculpture elegantly evoke the traditions of Chinese culture. Ligne 2 Cling lighter decorated with guilloché under high-gloss black lacquer with “horse mane” motif. Fire Horse motif in gold. Palladium-plated finishes. Equipped with a double yellow flame and the signature “Cling” opening. Lighter delivered empty of gas; refill sold separately.`, en: `On the occasion of the 2026 Chinese New Year, under the sign of the Fire Horse, S.T. Dupont unveils Horse, a flamboyant collection embodying charisma, majesty, and passion. The “mane” guilloché and equine sculpture elegantly evoke the traditions of Chinese culture. Ligne 2 Cling lighter decorated with guilloché under high-gloss black lacquer with “horse mane” motif. Fire Horse motif in gold. Palladium-plated finishes. Equipped with a double yellow flame and the signature “Cling” opening. Lighter delivered empty of gas; refill sold separately.` },
    collection: `Horse Mane`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-horse-mane-2/C16080CL.webp`,
    variants: [
      { sku: `C16080CL`, name: { pt: `Horse mane guilloche — Red`, en: `Horse mane guilloche — Red` }, priceCents: 156500, currency: "EUR", attributes: { color: { label: { pt: `Red`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/ligne-2-horse-mane-2/C16080CL.webp`, images: [`/products/ligne-2-horse-mane-2/C16080CL.webp`, `/products/ligne-2-horse-mane-2/C16080CL-2.webp`, `/products/ligne-2-horse-mane-2/C16080CL-3.webp`, `/products/ligne-2-horse-mane-2/C16080CL-4.webp`] },
      { sku: `C16088CL`, name: { pt: `Horse mane guilloche — Black`, en: `Horse mane guilloche — Black` }, priceCents: 151500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/ligne-2-horse-mane-2/C16088CL.webp`, images: [`/products/ligne-2-horse-mane-2/C16088CL.webp`, `/products/ligne-2-horse-mane-2/C16088CL-2.webp`, `/products/ligne-2-horse-mane-2/C16088CL-3.webp`, `/products/ligne-2-horse-mane-2/C16088CL-4.webp`] },
    ],
  },
  {
    slug: `humidor-fuente`,
    name: { pt: `humidor '60 cigars`, en: `humidor '60 cigars` },
    description: { pt: `Cigar Humidor Cube (60 Cigars) - Coated canvas decorated with the multicolor X monogram and Opus X Fuente crest. Removable tray and hygrometer included. Cedar wood lining, gold hinges. Boveda humidification kit included (REF 087377).`, en: `Cigar Humidor Cube (60 Cigars) - Coated canvas decorated with the multicolor X monogram and Opus X Fuente crest. Removable tray and hygrometer included. Cedar wood lining, gold hinges. Boveda humidification kit included (REF 087377).` },
    collection: `Fuente`,
    categorySlug: "acessorios",
    image: `/products/humidor-fuente/001360.webp`,
    variants: [
      { sku: `001360`, name: { pt: `humidor '60 cigars — Multicolor & Multicouleur`, en: `humidor '60 cigars — Multicolor & Multicouleur` }, priceCents: 91000, currency: "EUR", attributes: { color: { label: { pt: `Multicolor & Multicouleur`, en: `Multicolor & Multicouleur` }, hex: ["#c8a24a"] } }, image: `/products/humidor-fuente/001360.webp`, images: [`/products/humidor-fuente/001360.webp`, `/products/humidor-fuente/001360-2.webp`, `/products/humidor-fuente/001360-3.webp`] },
    ],
  },
  {
    slug: `firehead-3`,
    name: { pt: `Keyrings`, en: `Keyrings` },
    description: { pt: `Elegant keychain, inspired by the Firehead lighter, featuring a palladium plate and embossed leather part. The leather used on all models of the Firehead collection is certified Leather Working Group.`, en: `Elegant keychain, inspired by the Firehead lighter, featuring a palladium plate and embossed leather part. The leather used on all models of the Firehead collection is certified Leather Working Group.` },
    collection: `Firehead`,
    categorySlug: "pele",
    image: `/products/firehead-3/161110.webp`,
    variants: [
      { sku: `161110`, name: { pt: `Keyrings — Black`, en: `Keyrings — Black` }, priceCents: 14000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/firehead-3/161110.webp`, images: [`/products/firehead-3/161110.webp`, `/products/firehead-3/161110-2.webp`, `/products/firehead-3/161110-3.webp`] },
    ],
  },
  {
    slug: `ligne-2-montecristo`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `Montecristo and S.T. Dupont, both synonymous with unique expertise, have joined forces to create exceptional products. The Crépuscule line, with its soft, luminous shades Crépuscule reflects the idyllic early life of young Edmond Dantès. An ambitious, promising captain who embarks on an unexpected journey through life. The Ligne 2 is lacquered in a gradation of orange and yellow, with the logo of the prestigious Montecristo cigar brand stamped in gold on one side, while the other features a golden sun and moon motif. Features a soft yellow double flame. Associated lighter stone: black (REF 900601) Associated gas refill: red (REF 900435) Lighter delivered empty of gas, refill sold separately.`, en: `Montecristo and S.T. Dupont, both synonymous with unique expertise, have joined forces to create exceptional products. The Crépuscule line, with its soft, luminous shades Crépuscule reflects the idyllic early life of young Edmond Dantès. An ambitious, promising captain who embarks on an unexpected journey through life. The Ligne 2 is lacquered in a gradation of orange and yellow, with the logo of the prestigious Montecristo cigar brand stamped in gold on one side, while the other features a golden sun and moon motif. Features a soft yellow double flame. Associated lighter stone: black (REF 900601) Associated gas refill: red (REF 900435) Lighter delivered empty of gas, refill sold separately.` },
    collection: `Montecristo`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-montecristo/C16036.webp`,
    variants: [
      { sku: `C16036`, name: { pt: `Lacquered lighter — Orange`, en: `Lacquered lighter — Orange` }, priceCents: 140000, currency: "EUR", attributes: { color: { label: { pt: `Orange`, en: `Orange` }, hex: ["#c8a24a"] } }, image: `/products/ligne-2-montecristo/C16036.webp`, images: [`/products/ligne-2-montecristo/C16036.webp`, `/products/ligne-2-montecristo/C16036-2.webp`, `/products/ligne-2-montecristo/C16036-3.webp`, `/products/ligne-2-montecristo/C16036-4.webp`] },
    ],
  },
  {
    slug: `ligne-2-montecristo-la-nuit`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `The Line 2 is lacquered with a blue gradient, on the front the logo of the prestigious cigar brand Montecristo is stamped in silver on one of the faces, while the other face presents a silver decoration of sun and moon. Soft and adjustable double flame. The collection includes 2 other lighters: Grand Dupont and a Maxijet. Also, two pens from the Line D Large collection and accessories: a leather case for three cigars, a large ashtray, a cigar cutter and a pair of cufflinks.`, en: `The Line 2 is lacquered with a blue gradient, on the front the logo of the prestigious cigar brand Montecristo is stamped in silver on one of the faces, while the other face presents a silver decoration of sun and moon. Soft and adjustable double flame. The collection includes 2 other lighters: Grand Dupont and a Maxijet. Also, two pens from the Line D Large collection and accessories: a leather case for three cigars, a large ashtray, a cigar cutter and a pair of cufflinks.` },
    collection: `Montecristo · La Nuit`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-montecristo-la-nuit/C16035.webp`,
    variants: [
      { sku: `C16035`, name: { pt: `Lacquered lighter — Dark Blue`, en: `Lacquered lighter — Dark Blue` }, priceCents: 140000, currency: "EUR", attributes: { color: { label: { pt: `Dark Blue`, en: `Dark Blue` }, hex: ["#1f3c66"] } }, image: `/products/ligne-2-montecristo-la-nuit/C16035.webp`, images: [`/products/ligne-2-montecristo-la-nuit/C16035.webp`, `/products/ligne-2-montecristo-la-nuit/C16035-2.webp`, `/products/ligne-2-montecristo-la-nuit/C16035-3.webp`, `/products/ligne-2-montecristo-la-nuit/C16035-4.webp`] },
    ],
  },
  {
    slug: `slimmy-3`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `Inspired by the House archives, Slimmy echoes the iconic Line 2 and the iconic Slim 7, the world's thinnest luxury lighter. Carefully designed in glossy blue lacquer. The lightness (66g) and thinness (9mm) of this lighter provide a perfect grip and allow it to be easily slipped into any pocket or bag. Its torch flame guarantees a unique experience providing efficient ignition in any circumstance. Timeless and featuring the know-how of lacquer and guillochage, Slimmy is available in chrome, gold and lacquer (sky blue, coral, dark blue, black, white). Gas refill associated: black (REF 000430)`, en: `Inspired by the House archives, Slimmy echoes the iconic Line 2 and the iconic Slim 7, the world's thinnest luxury lighter. Carefully designed in glossy blue lacquer. The lightness (66g) and thinness (9mm) of this lighter provide a perfect grip and allow it to be easily slipped into any pocket or bag. Its torch flame guarantees a unique experience providing efficient ignition in any circumstance. Timeless and featuring the know-how of lacquer and guillochage, Slimmy is available in chrome, gold and lacquer (sky blue, coral, dark blue, black, white). Gas refill associated: black (REF 000430)` },
    collection: `Slimmy`,
    categorySlug: "isqueiros",
    image: `/products/slimmy-3/028007.webp`,
    variants: [
      { sku: `028007`, name: { pt: `Lacquered lighter — Turquoise Blue`, en: `Lacquered lighter — Turquoise Blue` }, priceCents: 29000, currency: "EUR", attributes: { color: { label: { pt: `Turquoise Blue`, en: `Turquoise Blue` }, hex: ["#1f3c66"] } }, image: `/products/slimmy-3/028007.webp`, images: [`/products/slimmy-3/028007.webp`, `/products/slimmy-3/028007-2.webp`, `/products/slimmy-3/028007-3.webp`, `/products/slimmy-3/028007-4.webp`] },
      { sku: `028075`, name: { pt: `Lacquered lighter — Red`, en: `Lacquered lighter — Red` }, priceCents: 32000, currency: "EUR", attributes: { color: { label: { pt: `Red`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/slimmy-3/028075.webp`, images: [`/products/slimmy-3/028075.webp`, `/products/slimmy-3/028075-2.webp`, `/products/slimmy-3/028075-3.webp`, `/products/slimmy-3/028075-4.webp`] },
      { sku: `028076`, name: { pt: `Lacquered lighter — Black`, en: `Lacquered lighter — Black` }, priceCents: 32000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/slimmy-3/028076.webp`, images: [`/products/slimmy-3/028076.webp`, `/products/slimmy-3/028076-2.webp`, `/products/slimmy-3/028076-3.webp`, `/products/slimmy-3/028076-4.webp`] },
    ],
  },
  {
    slug: `biggy-3`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `Linked to the heritage of the House, combining the elegance of Line 2 with the power of the Megajet, Big D will delight cigar lovers looking for performance and luxurious design. Carefully designed in glossy blue lacquer. Equipped with a powerful 2 cm torch flame, Big D ensures exceptional ignition on any occasion. This model is available in the same finishes as the Slimmy: chrome, gold, guilloche diamond tip or lacquer (dark blue and black). Gas refill associated: black (REF 000430)`, en: `Linked to the heritage of the House, combining the elegance of Line 2 with the power of the Megajet, Big D will delight cigar lovers looking for performance and luxurious design. Carefully designed in glossy blue lacquer. Equipped with a powerful 2 cm torch flame, Big D ensures exceptional ignition on any occasion. This model is available in the same finishes as the Slimmy: chrome, gold, guilloche diamond tip or lacquer (dark blue and black). Gas refill associated: black (REF 000430)` },
    collection: `Biggy`,
    categorySlug: "isqueiros",
    image: `/products/biggy-3/025005.webp`,
    variants: [
      { sku: `025005`, name: { pt: `Lacquered lighter — Blue & Indigo Blue`, en: `Lacquered lighter — Blue & Indigo Blue` }, priceCents: 38000, currency: "EUR", attributes: { color: { label: { pt: `Blue & Indigo Blue`, en: `Blue & Indigo Blue` }, hex: ["#1f3c66"] } }, image: `/products/biggy-3/025005.webp`, images: [`/products/biggy-3/025005.webp`, `/products/biggy-3/025005-2.webp`, `/products/biggy-3/025005-3.webp`, `/products/biggy-3/025005-4.webp`] },
    ],
  },
  {
    slug: `maxijet-dragon-2`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `Maxijet Lighter in glossy Bordeaux lacquer and golden finish. Associated refills: Black (REF 000430)`, en: `Maxijet Lighter in glossy Bordeaux lacquer and golden finish. Associated refills: Black (REF 000430)` },
    collection: `Dragon`,
    categorySlug: "isqueiros",
    image: `/products/maxijet-dragon-2/020174.webp`,
    variants: [
      { sku: `020174`, name: { pt: `Lacquered lighter — Burgundy`, en: `Lacquered lighter — Burgundy` }, priceCents: 22000, currency: "EUR", attributes: { color: { label: { pt: `Burgundy`, en: `Burgundy` }, hex: ["#7d2b27"] } }, image: `/products/maxijet-dragon-2/020174.webp`, images: [`/products/maxijet-dragon-2/020174.webp`, `/products/maxijet-dragon-2/020174-2.webp`, `/products/maxijet-dragon-2/020174-3.webp`, `/products/maxijet-dragon-2/020174-4.webp`] },
      { sku: `020173`, name: { pt: `Lacquered lighter — Royal Blue`, en: `Lacquered lighter — Royal Blue` }, priceCents: 22000, currency: "EUR", attributes: { color: { label: { pt: `Royal Blue`, en: `Royal Blue` }, hex: ["#1f3c66"] } }, image: `/products/maxijet-dragon-2/020173.webp`, images: [`/products/maxijet-dragon-2/020173.webp`, `/products/maxijet-dragon-2/020173-2.webp`, `/products/maxijet-dragon-2/020173-3.webp`, `/products/maxijet-dragon-2/020173-4.webp`] },
    ],
  },
  {
    slug: `slim-7-dragon-2`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `Slim 7 Shiny Lacquer Honey Lighter with Gold Finish. Associated Refills: Black (REF 000430)`, en: `Slim 7 Shiny Lacquer Honey Lighter with Gold Finish. Associated Refills: Black (REF 000430)` },
    collection: `Dragon`,
    categorySlug: "isqueiros",
    image: `/products/slim-7-dragon-2/027775.webp`,
    variants: [
      { sku: `027775`, name: { pt: `Lacquered lighter — Honey`, en: `Lacquered lighter — Honey` }, priceCents: 20500, currency: "EUR", attributes: { color: { label: { pt: `Honey`, en: `Honey` }, hex: ["#7a7d83"] } }, image: `/products/slim-7-dragon-2/027775.webp`, images: [`/products/slim-7-dragon-2/027775.webp`, `/products/slim-7-dragon-2/027775-2.webp`, `/products/slim-7-dragon-2/027775-3.webp`, `/products/slim-7-dragon-2/027775-4.webp`] },
    ],
  },
  {
    slug: `minijet-2`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `The Minijet is a compact, modern lighter that's perfect for everyday use. With its powerful blue torch flame and ergonomic grip, it offers style and practicality at all times.`, en: `The Minijet is a compact, modern lighter that's perfect for everyday use. With its powerful blue torch flame and ergonomic grip, it offers style and practicality at all times.` },
    collection: `Minijet`,
    categorySlug: "isqueiros",
    image: `/products/minijet-2/010811.webp`,
    variants: [
      { sku: `010811`, name: { pt: `Lacquered lighter — Dark Blue`, en: `Lacquered lighter — Dark Blue` }, priceCents: 15000, currency: "EUR", attributes: { color: { label: { pt: `Dark Blue`, en: `Dark Blue` }, hex: ["#1f3c66"] } }, image: `/products/minijet-2/010811.webp`, images: [`/products/minijet-2/010811.webp`, `/products/minijet-2/010811-2.webp`, `/products/minijet-2/010811-3.webp`, `/products/minijet-2/010811-4.webp`] },
    ],
  },
  {
    slug: `biggy-padron`,
    name: { pt: `Lacquered Lighter`, en: `Lacquered Lighter` },
    description: { pt: `On the occasion of the 60th anniversary of the Padrón house, S.T. Dupont announces a special collaboration. The S.T. Dupont x Padrón collection offers distinctive lighters and cigar accessories. Its yellow gold finishes embody the Padrón cigar band, and its brown lacquer refers to the color of their wrapper leaf, the tobacco leaf that wraps a cigar blend. Biggy lighter with matte brown lacquer and gold finishes. Equipped with a 2cm torch flame. The lighter is delivered without gas, refill sold separately.`, en: `On the occasion of the 60th anniversary of the Padrón house, S.T. Dupont announces a special collaboration. The S.T. Dupont x Padrón collection offers distinctive lighters and cigar accessories. Its yellow gold finishes embody the Padrón cigar band, and its brown lacquer refers to the color of their wrapper leaf, the tobacco leaf that wraps a cigar blend. Biggy lighter with matte brown lacquer and gold finishes. Equipped with a 2cm torch flame. The lighter is delivered without gas, refill sold separately.` },
    collection: `Padrón`,
    categorySlug: "isqueiros",
    image: `/products/biggy-padron/025014.webp`,
    variants: [
      { sku: `025014`, name: { pt: `Lacquered Lighter — Brown`, en: `Lacquered Lighter — Brown` }, priceCents: 39000, currency: "EUR", attributes: { color: { label: { pt: `Brown`, en: `Brown` }, hex: ["#6b4a2a"] } }, image: `/products/biggy-padron/025014.webp`, images: [`/products/biggy-padron/025014.webp`, `/products/biggy-padron/025014-2.webp`, `/products/biggy-padron/025014-3.webp`, `/products/biggy-padron/025014-4.webp`] },
    ],
  },
  {
    slug: `ligne-2-joker`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `S.T. Dupont announces a special collaboration featuring Joker and Harley Quinn. The collection is inspired by the two iconic DC Comics characters and their distinctive traits, including a lighter and pen infused with their unique universe. Ligne 2 Cling Joker lighter adorned with a design representing the DC COMICS character, palladium finish. Equipped with a double yellow flame and the famous 'Cling' sound upon opening. Numbered lighter. Associated flint: black (REF 900601= Associated gas refill: red (REF 900435) Lighter delivered empty, gas refill sold separately`, en: `S.T. Dupont announces a special collaboration featuring Joker and Harley Quinn. The collection is inspired by the two iconic DC Comics characters and their distinctive traits, including a lighter and pen infused with their unique universe. Ligne 2 Cling Joker lighter adorned with a design representing the DC COMICS character, palladium finish. Equipped with a double yellow flame and the famous 'Cling' sound upon opening. Numbered lighter. Associated flint: black (REF 900601= Associated gas refill: red (REF 900435) Lighter delivered empty, gas refill sold separately` },
    collection: `joker`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-joker/C16695.webp`,
    variants: [
      { sku: `C16695`, name: { pt: `Lacquered lighter — Silver`, en: `Lacquered lighter — Silver` }, priceCents: 170000, currency: "EUR", attributes: { color: { label: { pt: `Silver`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/ligne-2-joker/C16695.webp`, images: [`/products/ligne-2-joker/C16695.webp`, `/products/ligne-2-joker/C16695-2.webp`, `/products/ligne-2-joker/C16695-3.webp`, `/products/ligne-2-joker/C16695-4.webp`] },
    ],
  },
  {
    slug: `ligne-2-harley-quinn`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `S.T. Dupont announces a special collaboration featuring Joker and Harley Quinn. The collection is inspired by the two iconic DC Comics characters and their distinctive traits, including a lighter and pen infused with their unique universe. Ligne 2 Cling Harley Quinn lighter adorned with a design representing the DC COMICS character, gold finish. Equipped with a double yellow flame and the famous 'Cling' sound upon opening. Numbered lighter. Associated flint: black (REF 900601= Associated gas refill: red (REF 900435) Lighter delivered empty, gas refill sold separately`, en: `S.T. Dupont announces a special collaboration featuring Joker and Harley Quinn. The collection is inspired by the two iconic DC Comics characters and their distinctive traits, including a lighter and pen infused with their unique universe. Ligne 2 Cling Harley Quinn lighter adorned with a design representing the DC COMICS character, gold finish. Equipped with a double yellow flame and the famous 'Cling' sound upon opening. Numbered lighter. Associated flint: black (REF 900601= Associated gas refill: red (REF 900435) Lighter delivered empty, gas refill sold separately` },
    collection: `harley-quinn`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-harley-quinn/C16696.webp`,
    variants: [
      { sku: `C16696`, name: { pt: `Lacquered lighter — Golden`, en: `Lacquered lighter — Golden` }, priceCents: 170000, currency: "EUR", attributes: { color: { label: { pt: `Golden`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/ligne-2-harley-quinn/C16696.webp`, images: [`/products/ligne-2-harley-quinn/C16696.webp`, `/products/ligne-2-harley-quinn/C16696-2.webp`, `/products/ligne-2-harley-quinn/C16696-3.webp`, `/products/ligne-2-harley-quinn/C16696-4.webp`] },
    ],
  },
  {
    slug: `ligne-2-4`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `To celebrate the Chinese New Year, S.T. Dupont imagines a collection inspired by the snake, the astrological sign of the year 2025. This collection showcases a unique guilloché pattern evoking the animal's scales, enhanced by meticulous lacquer work. Once again, the house demonstrates the audacity, sophistication, and craftsmanship that set it apart. Lighter Ligne 2 Cling guilloché under lacquer with black Snake motif, yellow gold finishes. Equipped with a double yellow flame and the famous 'Cling' sound upon opening. Associated flint stone: black (REF 900601) Associated gas refill: red (REF 900435) Lighter delivered empty of gas, refills sold separately`, en: `To celebrate the Chinese New Year, S.T. Dupont imagines a collection inspired by the snake, the astrological sign of the year 2025. This collection showcases a unique guilloché pattern evoking the animal's scales, enhanced by meticulous lacquer work. Once again, the house demonstrates the audacity, sophistication, and craftsmanship that set it apart. Lighter Ligne 2 Cling guilloché under lacquer with black Snake motif, yellow gold finishes. Equipped with a double yellow flame and the famous 'Cling' sound upon opening. Associated flint stone: black (REF 900601) Associated gas refill: red (REF 900435) Lighter delivered empty of gas, refills sold separately` },
    collection: `Ligne 2`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-4/C16075.webp`,
    variants: [
      { sku: `C16075`, name: { pt: `Lacquered lighter — Red`, en: `Lacquered lighter — Red` }, priceCents: 155000, currency: "EUR", attributes: { color: { label: { pt: `Red`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/ligne-2-4/C16075.webp`, images: [`/products/ligne-2-4/C16075.webp`, `/products/ligne-2-4/C16075-2.webp`, `/products/ligne-2-4/C16075-3.webp`, `/products/ligne-2-4/C16075-4.webp`] },
      { sku: `C16076`, name: { pt: `Lacquered lighter — Black`, en: `Lacquered lighter — Black` }, priceCents: 150000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/ligne-2-4/C16076.webp`, images: [`/products/ligne-2-4/C16076.webp`, `/products/ligne-2-4/C16076-2.webp`, `/products/ligne-2-4/C16076-3.webp`, `/products/ligne-2-4/C16076-4.webp`] },
    ],
  },
  {
    slug: `slim-7-2`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `To celebrate the Chinese New Year, S.T. Dupont imagines a collection inspired by the snake, the astrological sign of the year 2025. This collection showcases a unique guilloché pattern evoking the animal's scales, enhanced by meticulous lacquer work. Once again, the house demonstrates the audacity, sophistication, and craftsmanship that set it apart. Slim 7 Lighter, guilloché with black Snake motif, gold finish. Equipped with a torch flame. Associated gas refill: black (REF 900430) Lighter delivered empty of gas, refills sold separately`, en: `To celebrate the Chinese New Year, S.T. Dupont imagines a collection inspired by the snake, the astrological sign of the year 2025. This collection showcases a unique guilloché pattern evoking the animal's scales, enhanced by meticulous lacquer work. Once again, the house demonstrates the audacity, sophistication, and craftsmanship that set it apart. Slim 7 Lighter, guilloché with black Snake motif, gold finish. Equipped with a torch flame. Associated gas refill: black (REF 900430) Lighter delivered empty of gas, refills sold separately` },
    collection: `Slim 7`,
    categorySlug: "isqueiros",
    image: `/products/slim-7-2/027075.webp`,
    variants: [
      { sku: `027075`, name: { pt: `Lacquered lighter — Red`, en: `Lacquered lighter — Red` }, priceCents: 23500, currency: "EUR", attributes: { color: { label: { pt: `Red`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/slim-7-2/027075.webp`, images: [`/products/slim-7-2/027075.webp`, `/products/slim-7-2/027075-2.webp`, `/products/slim-7-2/027075-3.webp`, `/products/slim-7-2/027075-4.webp`] },
      { sku: `027076`, name: { pt: `Lacquered lighter — Black`, en: `Lacquered lighter — Black` }, priceCents: 23500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/slim-7-2/027076.webp`, images: [`/products/slim-7-2/027076.webp`, `/products/slim-7-2/027076-2.webp`, `/products/slim-7-2/027076-3.webp`, `/products/slim-7-2/027076-4.webp`] },
    ],
  },
  {
    slug: `biggy-fire-x-2`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `Inspired by the X-Bag, one of the bags from the leather goods collection developed this season by S.T. Dupont, Fire X offers its reinterpretation of the iconic flame tip on the classics of the House. Biggy Fire X lighter decorated with black lacquer and chrome finishes. Featuring a 2cm torch flame. Associated gas refill: black (REF 900430) Lighter delivered empty of gas, refill sold separately.`, en: `Inspired by the X-Bag, one of the bags from the leather goods collection developed this season by S.T. Dupont, Fire X offers its reinterpretation of the iconic flame tip on the classics of the House. Biggy Fire X lighter decorated with black lacquer and chrome finishes. Featuring a 2cm torch flame. Associated gas refill: black (REF 900430) Lighter delivered empty of gas, refill sold separately.` },
    collection: `Fire X`,
    categorySlug: "isqueiros",
    image: `/products/biggy-fire-x-2/025277.webp`,
    variants: [
      { sku: `025277`, name: { pt: `Lacquered lighter — Black`, en: `Lacquered lighter — Black` }, priceCents: 39000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/biggy-fire-x-2/025277.webp`, images: [`/products/biggy-fire-x-2/025277.webp`, `/products/biggy-fire-x-2/025277-2.webp`, `/products/biggy-fire-x-2/025277-3.webp`, `/products/biggy-fire-x-2/025277-4.webp`] },
    ],
  },
  {
    slug: `slimmy-fire-x`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `Inspired by the X-Bag, one of the bags from the leather goods collection developed this season by S.T. Dupont, Fire X offers its reinterpretation of the iconic flame tip on the classics of the House. Slimmy Fire X lighter decorated with black lacquer and chrome finishes. Featuring a torch flame. Associated gas refill: black (REF 900430) Lighter delivered empty of gas, refill sold separately.`, en: `Inspired by the X-Bag, one of the bags from the leather goods collection developed this season by S.T. Dupont, Fire X offers its reinterpretation of the iconic flame tip on the classics of the House. Slimmy Fire X lighter decorated with black lacquer and chrome finishes. Featuring a torch flame. Associated gas refill: black (REF 900430) Lighter delivered empty of gas, refill sold separately.` },
    collection: `Fire X`,
    categorySlug: "isqueiros",
    image: `/products/slimmy-fire-x/028277.webp`,
    variants: [
      { sku: `028277`, name: { pt: `Lacquered lighter — Black`, en: `Lacquered lighter — Black` }, priceCents: 32000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/slimmy-fire-x/028277.webp`, images: [`/products/slimmy-fire-x/028277.webp`, `/products/slimmy-fire-x/028277-2.webp`, `/products/slimmy-fire-x/028277-3.webp`, `/products/slimmy-fire-x/028277-4.webp`] },
    ],
  },
  {
    slug: `ligne-2-cohiba-behike`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `To celebrate the 15th anniversary of Línea Behike, S.T. Dupont has teamed up with Cohiba for an exclusive collection of lighters and accessories. Inspired by Behike's emblematic codes, it combines black and white checks, gold finishes and deep black lacquer. The “Behike” effigy, revisited by the goldsmiths at S.T. Dupont goldsmiths, sublimates this unique collaboration, a tribute to the know-how and excellence of both houses. Ligne 2 Cling lighter in high-gloss lacquer, engraved with the Behike motif, high-gloss attributes, matte driver. Featuring a double yellow flame and the famous “”Cling“” opening. Associated lighter stone: black (REF 900601) Associated gas refill: red (REF 900435) Lighter delivered empty of gas, refill sold separately`, en: `To celebrate the 15th anniversary of Línea Behike, S.T. Dupont has teamed up with Cohiba for an exclusive collection of lighters and accessories. Inspired by Behike's emblematic codes, it combines black and white checks, gold finishes and deep black lacquer. The “Behike” effigy, revisited by the goldsmiths at S.T. Dupont goldsmiths, sublimates this unique collaboration, a tribute to the know-how and excellence of both houses. Ligne 2 Cling lighter in high-gloss lacquer, engraved with the Behike motif, high-gloss attributes, matte driver. Featuring a double yellow flame and the famous “”Cling“” opening. Associated lighter stone: black (REF 900601) Associated gas refill: red (REF 900435) Lighter delivered empty of gas, refill sold separately` },
    collection: `Cohiba-Behike`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-cohiba-behike/C16003CL.webp`,
    variants: [
      { sku: `C16003CL`, name: { pt: `Lacquered lighter — Black`, en: `Lacquered lighter — Black` }, priceCents: 160000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/ligne-2-cohiba-behike/C16003CL.webp`, images: [`/products/ligne-2-cohiba-behike/C16003CL.webp`, `/products/ligne-2-cohiba-behike/C16003CL-2.webp`, `/products/ligne-2-cohiba-behike/C16003CL-3.webp`, `/products/ligne-2-cohiba-behike/C16003CL-4.webp`] },
    ],
  },
  {
    slug: `le-grand-dupont-cohiba-behike`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `To celebrate the 15th anniversary of Línea Behike, S.T. Dupont has teamed up with Cohiba for an exclusive collection of lighters and accessories. Inspired by Behike's emblematic codes, it combines black and white checks, gold finishes and deep black lacquer. The “Behike” effigy, revisited by the goldsmiths at S.T. Dupont goldsmiths, sublimates this unique collaboration, a tribute to the know-how and excellence of both houses. Le Grand Dupont lighter in high-gloss lacquer, decorated with the Behike motif in gold finish. Featuring a dual ignition system with yellow or blue flame. Associated lighter stone: red (REF 900651) Associated gas refill: red (REF 900435) Lighter delivered empty of gas, refill sold separately. Screwdriver included to change the flint`, en: `To celebrate the 15th anniversary of Línea Behike, S.T. Dupont has teamed up with Cohiba for an exclusive collection of lighters and accessories. Inspired by Behike's emblematic codes, it combines black and white checks, gold finishes and deep black lacquer. The “Behike” effigy, revisited by the goldsmiths at S.T. Dupont goldsmiths, sublimates this unique collaboration, a tribute to the know-how and excellence of both houses. Le Grand Dupont lighter in high-gloss lacquer, decorated with the Behike motif in gold finish. Featuring a dual ignition system with yellow or blue flame. Associated lighter stone: red (REF 900651) Associated gas refill: red (REF 900435) Lighter delivered empty of gas, refill sold separately. Screwdriver included to change the flint` },
    collection: `Cohiba-Behike`,
    categorySlug: "isqueiros",
    image: `/products/le-grand-dupont-cohiba-behike/C23003CL.webp`,
    variants: [
      { sku: `C23003CL`, name: { pt: `Lacquered lighter — Black`, en: `Lacquered lighter — Black` }, priceCents: 180000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/le-grand-dupont-cohiba-behike/C23003CL.webp`, images: [`/products/le-grand-dupont-cohiba-behike/C23003CL.webp`, `/products/le-grand-dupont-cohiba-behike/C23003CL-2.webp`, `/products/le-grand-dupont-cohiba-behike/C23003CL-3.webp`, `/products/le-grand-dupont-cohiba-behike/C23003CL-4.webp`] },
    ],
  },
  {
    slug: `ligne-2-20000-leagues`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `Tribute to the captivating universe of 20,000 leagues under the seas, this limited edition expresses all the know-how of S.T. Dupont. Published in 1870, the novel recounts the journey of three castaways captured by Captain Nemo, this mysterious inventor who travels the seabed aboard the Nautilus, submarine very ahead of the technologies of the time. Portholes, turbines, corals, fins and other tentacles of giant squid inspire this limited edition and its three ranges, all related to different chapters of the book. A story in three stages in which to dive with passion. For the Premium range of this edition 20,000 leagues under the seas, S.T. Dupont tells two other chapters: «4000 leagues under the Pacific», chapter 18 of the book, and «Gulf Stream», chapter 19 of its second part. "4000 Leagues Under the Pacific" marks the moment when the Nautilus reaches great depths and its crew discovers the immensity of the underwater world, between transparent waters and marine depths. Lighter Line 2 Cling guilloche under lacquered pattern 'waves'. Covered with S.T. Dupont turquoise gradient lacquer. Hat with guilloche vague pattern. Gold Finish. Equipped with a double yellow flame and the famous "Cling" at the opening. Associated lighter flint: black (REF 900601) Associated gas refill: red (REF 900435) Lighter delivered empty of gas, refill sold separately.`, en: `Tribute to the captivating universe of 20,000 leagues under the seas, this limited edition expresses all the know-how of S.T. Dupont. Published in 1870, the novel recounts the journey of three castaways captured by Captain Nemo, this mysterious inventor who travels the seabed aboard the Nautilus, submarine very ahead of the technologies of the time. Portholes, turbines, corals, fins and other tentacles of giant squid inspire this limited edition and its three ranges, all related to different chapters of the book. A story in three stages in which to dive with passion. For the Premium range of this edition 20,000 leagues under the seas, S.T. Dupont tells two other chapters: «4000 leagues under the Pacific», chapter 18 of the book, and «Gulf Stream», chapter 19 of its second part. "4000 Leagues Under the Pacific" marks the moment when the Nautilus reaches great depths and its crew discovers the immensity of the underwater world, between transparent waters and marine depths. Lighter Line 2 Cling guilloche under lacquered pattern 'waves'. Covered with S.T. Dupont turquoise gradient lacquer. Hat with guilloche vague pattern. Gold Finish. Equipped with a double yellow flame and the famous "Cling" at the opening. Associated lighter flint: black (REF 900601) Associated gas refill: red (REF 900435) Lighter delivered empty of gas, refill sold separately.` },
    collection: `20,000 Leagues Under The Sea`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-20000-leagues/C16052CL.webp`,
    variants: [
      { sku: `C16052CL`, name: { pt: `Lacquered lighter — Green Pacific`, en: `Lacquered lighter — Green Pacific` }, priceCents: 171500, currency: "EUR", attributes: { color: { label: { pt: `Green Pacific`, en: `Green Pacific` }, hex: ["#3b5d39"] } }, image: `/products/ligne-2-20000-leagues/C16052CL.webp`, images: [`/products/ligne-2-20000-leagues/C16052CL.webp`, `/products/ligne-2-20000-leagues/C16052CL-2.webp`, `/products/ligne-2-20000-leagues/C16052CL-3.webp`, `/products/ligne-2-20000-leagues/C16052CL-4.webp`] },
    ],
  },
  {
    slug: `biggy-20000-leagues`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `Tribute to the captivating universe of 20,000 leagues under the seas, this limited edition expresses all the know-how of S.T. Dupont. Published in 1870, the novel recounts the journey of three castaways captured by Captain Nemo, this mysterious inventor who travels the seabed aboard the Nautilus, submarine very ahead of the technologies of the time. Portholes, turbines, corals, fins and other tentacles of giant squid inspire this limited edition and its three ranges, all related to different chapters of the book. A story in three stages in which to dive with passion. 'Vanikoro' is named after its pattern 'corals'. In the chapter of the same name, Captain Nemo and his three companions dock on the island of Vanikoro, surrounded by an incredible barrier reef. Briquet Biggy in shiny blue lacquer, with the Vanikoro decoration. Chrome finish. Equipped with a 2 cm blue torch flame, ideal for lighting candles or cigarettes. Associated gas refill: black (REF 900430) Lighter delivered empty of gas, refill sold separately.`, en: `Tribute to the captivating universe of 20,000 leagues under the seas, this limited edition expresses all the know-how of S.T. Dupont. Published in 1870, the novel recounts the journey of three castaways captured by Captain Nemo, this mysterious inventor who travels the seabed aboard the Nautilus, submarine very ahead of the technologies of the time. Portholes, turbines, corals, fins and other tentacles of giant squid inspire this limited edition and its three ranges, all related to different chapters of the book. A story in three stages in which to dive with passion. 'Vanikoro' is named after its pattern 'corals'. In the chapter of the same name, Captain Nemo and his three companions dock on the island of Vanikoro, surrounded by an incredible barrier reef. Briquet Biggy in shiny blue lacquer, with the Vanikoro decoration. Chrome finish. Equipped with a 2 cm blue torch flame, ideal for lighting candles or cigarettes. Associated gas refill: black (REF 900430) Lighter delivered empty of gas, refill sold separately.` },
    collection: `20,000 Leagues Under The Sea`,
    categorySlug: "isqueiros",
    image: `/products/biggy-20000-leagues/025053.webp`,
    variants: [
      { sku: `025053`, name: { pt: `Lacquered lighter — Royal Blue`, en: `Lacquered lighter — Royal Blue` }, priceCents: 39000, currency: "EUR", attributes: { color: { label: { pt: `Royal Blue`, en: `Royal Blue` }, hex: ["#1f3c66"] } }, image: `/products/biggy-20000-leagues/025053.webp`, images: [`/products/biggy-20000-leagues/025053.webp`, `/products/biggy-20000-leagues/025053-2.webp`, `/products/biggy-20000-leagues/025053-3.webp`, `/products/biggy-20000-leagues/025053-4.webp`] },
    ],
  },
  {
    slug: `ligne-1-romeo-y-julieta`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `To celebrate the 150th anniversary of Romeo and Julieta, S.T. Dupont signs an exclusive collaboration inspired by the strength of passion and expertise. A tribute to the art of exceptional cigars and the beauty of timeless objects. Lighter Line 1 Cling white lacquer shiny popote and decorated with a medallion in gold finish with Romeo y Julieta motif. Vertical guilloche hat. Yellow gold finish. Equipped with a double yellow flame and the famous "Cling" at the opening. Associated lighter flint: black (REF 900601) Associated gas refill: red (REF 900435) Lighter delivered empty of gas, refill sold separately.`, en: `To celebrate the 150th anniversary of Romeo and Julieta, S.T. Dupont signs an exclusive collaboration inspired by the strength of passion and expertise. A tribute to the art of exceptional cigars and the beauty of timeless objects. Lighter Line 1 Cling white lacquer shiny popote and decorated with a medallion in gold finish with Romeo y Julieta motif. Vertical guilloche hat. Yellow gold finish. Equipped with a double yellow flame and the famous "Cling" at the opening. Associated lighter flint: black (REF 900601) Associated gas refill: red (REF 900435) Lighter delivered empty of gas, refill sold separately.` },
    collection: `Romeo-y-Julieta`,
    categorySlug: "isqueiros",
    image: `/products/ligne-1-romeo-y-julieta/C14050CL.webp`,
    variants: [
      { sku: `C14050CL`, name: { pt: `Lacquered lighter — White`, en: `Lacquered lighter — White` }, priceCents: 130000, currency: "EUR", attributes: { color: { label: { pt: `White`, en: `White` }, hex: ["#efeae0"] } }, image: `/products/ligne-1-romeo-y-julieta/C14050CL.webp`, images: [`/products/ligne-1-romeo-y-julieta/C14050CL.webp`, `/products/ligne-1-romeo-y-julieta/C14050CL-2.webp`, `/products/ligne-1-romeo-y-julieta/C14050CL-3.webp`, `/products/ligne-1-romeo-y-julieta/C14050CL-4.webp`] },
    ],
  },
  {
    slug: `twiggy-romeo-y-julieta`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `To celebrate the 150th anniversary of Romeo and Julieta, S.T. Dupont signs an exclusive collaboration inspired by the strength of passion and expertise. A tribute to the art of exceptional cigars and the beauty of timeless objects. Twiggy lighter in white lacquer, featuring the Romeo and Julieta decor in printed lacquer. Shiny gold finish. Equipped with a 1 cm blue torch flame, ideal for lighting candles or cigarettes. Associated gas refill: black (REF 900430) Lighter delivered empty of gas, refill sold separately.`, en: `To celebrate the 150th anniversary of Romeo and Julieta, S.T. Dupont signs an exclusive collaboration inspired by the strength of passion and expertise. A tribute to the art of exceptional cigars and the beauty of timeless objects. Twiggy lighter in white lacquer, featuring the Romeo and Julieta decor in printed lacquer. Shiny gold finish. Equipped with a 1 cm blue torch flame, ideal for lighting candles or cigarettes. Associated gas refill: black (REF 900430) Lighter delivered empty of gas, refill sold separately.` },
    collection: `Romeo-y-Julieta`,
    categorySlug: "isqueiros",
    image: `/products/twiggy-romeo-y-julieta/030150.webp`,
    variants: [
      { sku: `030150`, name: { pt: `Lacquered lighter — White`, en: `Lacquered lighter — White` }, priceCents: 32500, currency: "EUR", attributes: { color: { label: { pt: `White`, en: `White` }, hex: ["#efeae0"] } }, image: `/products/twiggy-romeo-y-julieta/030150.webp`, images: [`/products/twiggy-romeo-y-julieta/030150.webp`, `/products/twiggy-romeo-y-julieta/030150-2.webp`, `/products/twiggy-romeo-y-julieta/030150-3.webp`, `/products/twiggy-romeo-y-julieta/030150-4.webp`] },
    ],
  },
  {
    slug: `le-grand-dupont-romeo-y-julieta`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `To celebrate the 150th anniversary of Romeo and Julieta, S.T. Dupont signs an exclusive collaboration inspired by the strength of passion and expertise. A tribute to the art of exceptional cigars and the beauty of timeless objects. Lighter Le Grand Dupont Cling red lacquer shiny popote decorated with the medallion in gold finish pattern Romeo y Julieta. Diamond point guilloche hat. Yellow gold finish. Equipped with a double ignition system for yellow flame or blue flame. Associated lighter block: red (REF 900651) Associated gas refill: red (REF 900435) Lighter delivered empty of gas, refill sold separately. Screwdriver included to change the stone.`, en: `To celebrate the 150th anniversary of Romeo and Julieta, S.T. Dupont signs an exclusive collaboration inspired by the strength of passion and expertise. A tribute to the art of exceptional cigars and the beauty of timeless objects. Lighter Le Grand Dupont Cling red lacquer shiny popote decorated with the medallion in gold finish pattern Romeo y Julieta. Diamond point guilloche hat. Yellow gold finish. Equipped with a double ignition system for yellow flame or blue flame. Associated lighter block: red (REF 900651) Associated gas refill: red (REF 900435) Lighter delivered empty of gas, refill sold separately. Screwdriver included to change the stone.` },
    collection: `Romeo-y-Julieta`,
    categorySlug: "isqueiros",
    image: `/products/le-grand-dupont-romeo-y-julieta/C23050CL.webp`,
    variants: [
      { sku: `C23050CL`, name: { pt: `Lacquered lighter — Burgundy`, en: `Lacquered lighter — Burgundy` }, priceCents: 181500, currency: "EUR", attributes: { color: { label: { pt: `Burgundy`, en: `Burgundy` }, hex: ["#7d2b27"] } }, image: `/products/le-grand-dupont-romeo-y-julieta/C23050CL.webp`, images: [`/products/le-grand-dupont-romeo-y-julieta/C23050CL.webp`, `/products/le-grand-dupont-romeo-y-julieta/C23050CL-2.webp`, `/products/le-grand-dupont-romeo-y-julieta/C23050CL-3.webp`, `/products/le-grand-dupont-romeo-y-julieta/C23050CL-4.webp`] },
    ],
  },
  {
    slug: `biggy-romeo-y-julieta`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `To celebrate the 150th anniversary of Romeo and Julieta, S.T. Dupont signs an exclusive collaboration inspired by the strength of passion and expertise. A tribute to the art of exceptional cigars and the beauty of timeless objects. Briquet Biggy in red lacquer, featuring the Romeo and Julieta decor in printed lacquer. Shiny gold finish. Equipped with a 2 cm blue torch flame, ideal for lighting candles or cigarettes. Associated gas refill: black (REF 900430) Lighter delivered empty of gas, refill sold separately.`, en: `To celebrate the 150th anniversary of Romeo and Julieta, S.T. Dupont signs an exclusive collaboration inspired by the strength of passion and expertise. A tribute to the art of exceptional cigars and the beauty of timeless objects. Briquet Biggy in red lacquer, featuring the Romeo and Julieta decor in printed lacquer. Shiny gold finish. Equipped with a 2 cm blue torch flame, ideal for lighting candles or cigarettes. Associated gas refill: black (REF 900430) Lighter delivered empty of gas, refill sold separately.` },
    collection: `Romeo-y-Julieta`,
    categorySlug: "isqueiros",
    image: `/products/biggy-romeo-y-julieta/025050.webp`,
    variants: [
      { sku: `025050`, name: { pt: `Lacquered lighter — Burgundy`, en: `Lacquered lighter — Burgundy` }, priceCents: 39500, currency: "EUR", attributes: { color: { label: { pt: `Burgundy`, en: `Burgundy` }, hex: ["#7d2b27"] } }, image: `/products/biggy-romeo-y-julieta/025050.webp`, images: [`/products/biggy-romeo-y-julieta/025050.webp`, `/products/biggy-romeo-y-julieta/025050-2.webp`, `/products/biggy-romeo-y-julieta/025050-3.webp`, `/products/biggy-romeo-y-julieta/025050-4.webp`] },
    ],
  },
  {
    slug: `slimmy-horse-mane`,
    name: { pt: `Lacquered Lighter`, en: `Lacquered Lighter` },
    description: { pt: `On the occasion of the 2026 Chinese New Year, under the sign of the Fire Horse, S.T. Dupont unveils Horse, a flamboyant collection embodying charisma, majesty, and passion. The “mane” guilloché and equine sculpture elegantly evoke the traditions of Chinese culture. Slimmy lighter in high-gloss red lacquer, featuring the “horse mane” motif with a golden Fire Horse. Gold-plated finish. Equipped with a 2 cm blue torch flame, ideal for lighting candles or cigarettes. Lighter delivered empty of gas; refill sold separately.`, en: `On the occasion of the 2026 Chinese New Year, under the sign of the Fire Horse, S.T. Dupont unveils Horse, a flamboyant collection embodying charisma, majesty, and passion. The “mane” guilloché and equine sculpture elegantly evoke the traditions of Chinese culture. Slimmy lighter in high-gloss red lacquer, featuring the “horse mane” motif with a golden Fire Horse. Gold-plated finish. Equipped with a 2 cm blue torch flame, ideal for lighting candles or cigarettes. Lighter delivered empty of gas; refill sold separately.` },
    collection: `Horse Mane`,
    categorySlug: "isqueiros",
    image: `/products/slimmy-horse-mane/028080.webp`,
    variants: [
      { sku: `028080`, name: { pt: `Lacquered Lighter — Red`, en: `Lacquered Lighter — Red` }, priceCents: 33000, currency: "EUR", attributes: { color: { label: { pt: `Red`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/slimmy-horse-mane/028080.webp`, images: [`/products/slimmy-horse-mane/028080.webp`, `/products/slimmy-horse-mane/028080-2.webp`, `/products/slimmy-horse-mane/028080-3.webp`, `/products/slimmy-horse-mane/028080-4.webp`] },
    ],
  },
  {
    slug: `slim7-horse-mane`,
    name: { pt: `Lacquered Lighter`, en: `Lacquered Lighter` },
    description: { pt: `On the occasion of the 2026 Chinese New Year, under the sign of the Fire Horse, S.T. Dupont unveils Horse, a flamboyant collection embodying charisma, majesty, and passion. The “mane” guilloché and equine sculpture elegantly evoke the traditions of Chinese culture. Slim7 lighter in high-gloss red lacquer, featuring the “horse mane” motif with a Fire Horse. Gold-plated finish. Equipped with a 2 cm blue torch flame, ideal for lighting candles or cigarettes. Lighter delivered empty of gas; refill sold separately.`, en: `On the occasion of the 2026 Chinese New Year, under the sign of the Fire Horse, S.T. Dupont unveils Horse, a flamboyant collection embodying charisma, majesty, and passion. The “mane” guilloché and equine sculpture elegantly evoke the traditions of Chinese culture. Slim7 lighter in high-gloss red lacquer, featuring the “horse mane” motif with a Fire Horse. Gold-plated finish. Equipped with a 2 cm blue torch flame, ideal for lighting candles or cigarettes. Lighter delivered empty of gas; refill sold separately.` },
    collection: `Horse Mane`,
    categorySlug: "isqueiros",
    image: `/products/slim7-horse-mane/027080.webp`,
    variants: [
      { sku: `027080`, name: { pt: `Lacquered Lighter — Red`, en: `Lacquered Lighter — Red` }, priceCents: 24000, currency: "EUR", attributes: { color: { label: { pt: `Red`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/slim7-horse-mane/027080.webp`, images: [`/products/slim7-horse-mane/027080.webp`, `/products/slim7-horse-mane/027080-2.webp`, `/products/slim7-horse-mane/027080-3.webp`, `/products/slim7-horse-mane/027080-4.webp`] },
    ],
  },
  {
    slug: `biggy-fuente`,
    name: { pt: `lacquered lighter`, en: `lacquered lighter` },
    description: { pt: `Biggy Lighter - Black lacquer decorated with the multicolor X monogram and printed Opus X Fuente crest. Shiny gold finish. 2 cm blue torch flame for candles or cigarettes. Gas refill black (REF 900430). Delivered empty; refill sold separately.`, en: `Biggy Lighter - Black lacquer decorated with the multicolor X monogram and printed Opus X Fuente crest. Shiny gold finish. 2 cm blue torch flame for candles or cigarettes. Gas refill black (REF 900430). Delivered empty; refill sold separately.` },
    collection: `Fuente`,
    categorySlug: "isqueiros",
    image: `/products/biggy-fuente/025060.webp`,
    variants: [
      { sku: `025060`, name: { pt: `lacquered lighter — Multicolor`, en: `lacquered lighter — Multicolor` }, priceCents: 39500, currency: "EUR", attributes: { color: { label: { pt: `Multicolor`, en: `Multicolor` }, hex: ["#c8a24a"] } }, image: `/products/biggy-fuente/025060.webp`, images: [`/products/biggy-fuente/025060.webp`, `/products/biggy-fuente/025060-2.webp`, `/products/biggy-fuente/025060-3.webp`, `/products/biggy-fuente/025060-4.webp`] },
    ],
  },
  {
    slug: `misc-dc-comics`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `S.T. Dupont unveils the third chapter of its collaboration with DC COMICS through an exclusive collection inspired by three iconic figures: Wonder Woman, Catwoman and The Penguin. The collection conveys a universal message of justice, freedom and power, elevated by the Maison’s savoir-faire in exceptional creations such as the Ligne 2 lighter, the Line D Eternity pen and, for selected characters, a Lighter Necklace. Catwoman Lighter Necklace adorned with a black lacquer decoration featuring the DC COMICS character. Diamond-point guilloché cap with a matte black finish. Features a yellow flame. Removable chain adjustable to three different lengths: 80/85/90 cm. Associated gas refill: black 000430 Lighter delivered empty of gas, refill sold separately.`, en: `S.T. Dupont unveils the third chapter of its collaboration with DC COMICS through an exclusive collection inspired by three iconic figures: Wonder Woman, Catwoman and The Penguin. The collection conveys a universal message of justice, freedom and power, elevated by the Maison’s savoir-faire in exceptional creations such as the Ligne 2 lighter, the Line D Eternity pen and, for selected characters, a Lighter Necklace. Catwoman Lighter Necklace adorned with a black lacquer decoration featuring the DC COMICS character. Diamond-point guilloché cap with a matte black finish. Features a yellow flame. Removable chain adjustable to three different lengths: 80/85/90 cm. Associated gas refill: black 000430 Lighter delivered empty of gas, refill sold separately.` },
    collection: `DC Comics`,
    categorySlug: "isqueiros",
    image: `/products/misc-dc-comics/K27220CH.webp`,
    variants: [
      { sku: `K27220CH`, name: { pt: `Lacquered lighter — Black`, en: `Lacquered lighter — Black` }, priceCents: 38500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/misc-dc-comics/K27220CH.webp`, images: [`/products/misc-dc-comics/K27220CH.webp`, `/products/misc-dc-comics/K27220CH-2.webp`, `/products/misc-dc-comics/K27220CH-3.webp`, `/products/misc-dc-comics/K27220CH-4.webp`] },
    ],
  },
  {
    slug: `keyrings-fender`,
    name: { pt: `Leather`, en: `Leather` },
    description: { pt: `For the second time, S.T. Dupont and Fender® are working together to create a rock line that combines the expertise of both companies. This guitar-shaped key ring in smooth calfskin and canvas embodies the essence of the Fender® world in a practical, bold accessory. The elegant, distinctive Fender® metal plate pays homage to the musical universe of Fender®, while adding a modern touch to this model. A functional yet stylish accessory, ideal for those who want to take the Fender® spirit with them every day.`, en: `For the second time, S.T. Dupont and Fender® are working together to create a rock line that combines the expertise of both companies. This guitar-shaped key ring in smooth calfskin and canvas embodies the essence of the Fender® world in a practical, bold accessory. The elegant, distinctive Fender® metal plate pays homage to the musical universe of Fender®, while adding a modern touch to this model. A functional yet stylish accessory, ideal for those who want to take the Fender® spirit with them every day.` },
    collection: `Fender`,
    categorySlug: "acessorios",
    image: `/products/keyrings-fender/1FE641BK1.webp`,
    variants: [
      { sku: `1FE641BK1`, name: { pt: `Leather — Black`, en: `Leather — Black` }, priceCents: 13000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/keyrings-fender/1FE641BK1.webp`, images: [`/products/keyrings-fender/1FE641BK1.webp`, `/products/keyrings-fender/1FE641BK1-2.webp`] },
    ],
  },
  {
    slug: `cigar-case-3`,
    name: { pt: `Leather case`, en: `Leather case` },
    description: { pt: `Simple orange and chrome single cigar case. max 24.5 mm.`, en: `Simple orange and chrome single cigar case. max 24.5 mm.` },
    collection: `Cigar-case`,
    categorySlug: "acessorios",
    image: `/products/cigar-case-3/183166.webp`,
    variants: [
      { sku: `183166`, name: { pt: `Leather case — Orange`, en: `Leather case — Orange` }, priceCents: 18000, currency: "EUR", attributes: { color: { label: { pt: `Orange`, en: `Orange` }, hex: ["#c8a24a"] } }, image: `/products/cigar-case-3/183166.webp`, images: [`/products/cigar-case-3/183166.webp`, `/products/cigar-case-3/183166-2.webp`, `/products/cigar-case-3/183166-3.webp`] },
    ],
  },
  {
    slug: `2-cigar-case-2`,
    name: { pt: `Leather case`, en: `Leather case` },
    description: { pt: `2-cigar case, orange with gold embossing. max 24.5 mm.`, en: `2-cigar case, orange with gold embossing. max 24.5 mm.` },
    collection: `2 cigar case`,
    categorySlug: "acessorios",
    image: `/products/2-cigar-case-2/183266.webp`,
    variants: [
      { sku: `183266`, name: { pt: `Leather case — Orange`, en: `Leather case — Orange` }, priceCents: 22000, currency: "EUR", attributes: { color: { label: { pt: `Orange`, en: `Orange` }, hex: ["#c8a24a"] } }, image: `/products/2-cigar-case-2/183266.webp`, images: [`/products/2-cigar-case-2/183266.webp`, `/products/2-cigar-case-2/183266-2.webp`, `/products/2-cigar-case-2/183266-3.webp`] },
      { sku: `183256`, name: { pt: `Leather case — Orange`, en: `Leather case — Orange` }, priceCents: 23000, currency: "EUR", attributes: { color: { label: { pt: `Orange`, en: `Orange` }, hex: ["#c8a24a"] } }, image: `/products/2-cigar-case-2/183256.webp`, images: [`/products/2-cigar-case-2/183256.webp`, `/products/2-cigar-case-2/183256-2.webp`, `/products/2-cigar-case-2/183256-3.webp`] },
    ],
  },
  {
    slug: `3-cigar-case-montecristo-la-nuit`,
    name: { pt: `Leather case`, en: `Leather case` },
    description: { pt: `This leather and silver metal cigar case is stamped with the Montecristo coat of arms and La Nuit decor. The collection includes 3 lighters: Line 2, Le Grand Dupont, Maxijet. Also, two pens from the Line D Large collection and accessories: a cigar cutter, a large ashtray and a pair of cufflinks.`, en: `This leather and silver metal cigar case is stamped with the Montecristo coat of arms and La Nuit decor. The collection includes 3 lighters: Line 2, Le Grand Dupont, Maxijet. Also, two pens from the Line D Large collection and accessories: a cigar cutter, a large ashtray and a pair of cufflinks.` },
    collection: `Montecristo · La Nuit`,
    categorySlug: "acessorios",
    image: `/products/3-cigar-case-montecristo-la-nuit/183035.webp`,
    variants: [
      { sku: `183035`, name: { pt: `Leather case — Dark Blue`, en: `Leather case — Dark Blue` }, priceCents: 31000, currency: "EUR", attributes: { color: { label: { pt: `Dark Blue`, en: `Dark Blue` }, hex: ["#1f3c66"] } }, image: `/products/3-cigar-case-montecristo-la-nuit/183035.webp`, images: [`/products/3-cigar-case-montecristo-la-nuit/183035.webp`, `/products/3-cigar-case-montecristo-la-nuit/183035-2.webp`, `/products/3-cigar-case-montecristo-la-nuit/183035-3.webp`] },
    ],
  },
  {
    slug: `3-cigar-case-camo`,
    name: { pt: `Leather case`, en: `Leather case` },
    description: { pt: `This year, S.T. Dupont is reintroducing the camouflage motif on its iconic products. For added originality, this camouflage incorporates flames in vibrant shades of red and green, creating a fresh, bold interpretation of this legendary design. 3-cigar case in grained calf leather with green Camouflage motif and chrome metal base.`, en: `This year, S.T. Dupont is reintroducing the camouflage motif on its iconic products. For added originality, this camouflage incorporates flames in vibrant shades of red and green, creating a fresh, bold interpretation of this legendary design. 3-cigar case in grained calf leather with green Camouflage motif and chrome metal base.` },
    collection: `Camo`,
    categorySlug: "acessorios",
    image: `/products/3-cigar-case-camo/183451.webp`,
    variants: [
      { sku: `183451`, name: { pt: `Leather case — Red`, en: `Leather case — Red` }, priceCents: 26500, currency: "EUR", attributes: { color: { label: { pt: `Red`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/3-cigar-case-camo/183451.webp`, images: [`/products/3-cigar-case-camo/183451.webp`] },
      { sku: `183450`, name: { pt: `Leather case — Green & Khaki`, en: `Leather case — Green & Khaki` }, priceCents: 26500, currency: "EUR", attributes: { color: { label: { pt: `Green & Khaki`, en: `Green & Khaki` }, hex: ["#3b5d39"] } }, image: `/products/3-cigar-case-camo/183450.webp`, images: [`/products/3-cigar-case-camo/183450.webp`] },
    ],
  },
  {
    slug: `2-cigar-case-20000-leagues`,
    name: { pt: `Leather case`, en: `Leather case` },
    description: { pt: `Tribute to the captivating universe of 20,000 leagues under the seas, this limited edition expresses all the know-how of S.T. Dupont. Published in 1870, the novel recounts the journey of three castaways captured by Captain Nemo, this mysterious inventor who travels the seabed aboard the Nautilus, submarine very ahead of the technologies of the time. Portholes, turbines, corals, fins and other tentacles of giant squid inspire this limited edition and its three ranges, all related to different chapters of the book. A story in three stages in which to dive with passion. For the Premium range of this edition 20,000 leagues under the seas, S.T. Dupont tells two other chapters: «4000 leagues under the Pacific», chapter 18 of the book, and «Gulf Stream», chapter 19 of its second part. In the latter, Jules Verne evokes the Gulf Stream, a natural force shaping the movement of the oceans and those who are there. Fast-moving and perilous, it also allows Captain Nemo to demonstrate his excellence. Case for 2 cigars. Stingray leather. Chrome base with engraved Nautilus logo. Shagreen is a natural material, derived from the skin of rays or sharks. Used for its beaded texture and resistance, it gives each piece a unique character. The central pearl can thus present slight variations of hues, ranging from white to ivory or blonde shades. These subtleties are part of the authentic charm of this precious material.`, en: `Tribute to the captivating universe of 20,000 leagues under the seas, this limited edition expresses all the know-how of S.T. Dupont. Published in 1870, the novel recounts the journey of three castaways captured by Captain Nemo, this mysterious inventor who travels the seabed aboard the Nautilus, submarine very ahead of the technologies of the time. Portholes, turbines, corals, fins and other tentacles of giant squid inspire this limited edition and its three ranges, all related to different chapters of the book. A story in three stages in which to dive with passion. For the Premium range of this edition 20,000 leagues under the seas, S.T. Dupont tells two other chapters: «4000 leagues under the Pacific», chapter 18 of the book, and «Gulf Stream», chapter 19 of its second part. In the latter, Jules Verne evokes the Gulf Stream, a natural force shaping the movement of the oceans and those who are there. Fast-moving and perilous, it also allows Captain Nemo to demonstrate his excellence. Case for 2 cigars. Stingray leather. Chrome base with engraved Nautilus logo. Shagreen is a natural material, derived from the skin of rays or sharks. Used for its beaded texture and resistance, it gives each piece a unique character. The central pearl can thus present slight variations of hues, ranging from white to ivory or blonde shades. These subtleties are part of the authentic charm of this precious material.` },
    collection: `20,000 Leagues Under The Sea`,
    categorySlug: "acessorios",
    image: `/products/2-cigar-case-20000-leagues/183441.webp`,
    variants: [
      { sku: `183441`, name: { pt: `Leather case — Blue Gulf Stream`, en: `Leather case — Blue Gulf Stream` }, priceCents: 58000, currency: "EUR", attributes: { color: { label: { pt: `Blue Gulf Stream`, en: `Blue Gulf Stream` }, hex: ["#1f3c66"] } }, image: `/products/2-cigar-case-20000-leagues/183441.webp`, images: [`/products/2-cigar-case-20000-leagues/183441.webp`, `/products/2-cigar-case-20000-leagues/183441-2.webp`, `/products/2-cigar-case-20000-leagues/183441-3.webp`, `/products/2-cigar-case-20000-leagues/183441-4.webp`] },
      { sku: `183442`, name: { pt: `Leather case — Green Pacific`, en: `Leather case — Green Pacific` }, priceCents: 58500, currency: "EUR", attributes: { color: { label: { pt: `Green Pacific`, en: `Green Pacific` }, hex: ["#3b5d39"] } }, image: `/products/2-cigar-case-20000-leagues/183442.webp`, images: [`/products/2-cigar-case-20000-leagues/183442.webp`, `/products/2-cigar-case-20000-leagues/183442-2.webp`, `/products/2-cigar-case-20000-leagues/183442-3.webp`] },
    ],
  },
  {
    slug: `3-cigar-case-romeo-y-julieta`,
    name: { pt: `Leather case`, en: `Leather case` },
    description: { pt: `To celebrate the 150th anniversary of Romeo and Julieta, S.T. Dupont signs an exclusive collaboration, inspired by the strength of passion and expertise. A tribute to the art of exceptional cigars and the beauty of timeless objects. Case for 3 cigars with Romeo and Julieta gold embossed logo. Calf leather. Golden base with engraved logo of the Romeo and Julieta coat of arms on the front and the inscription of the brand on the back.`, en: `To celebrate the 150th anniversary of Romeo and Julieta, S.T. Dupont signs an exclusive collaboration, inspired by the strength of passion and expertise. A tribute to the art of exceptional cigars and the beauty of timeless objects. Case for 3 cigars with Romeo and Julieta gold embossed logo. Calf leather. Golden base with engraved logo of the Romeo and Julieta coat of arms on the front and the inscription of the brand on the back.` },
    collection: `Romeo-y-Julieta`,
    categorySlug: "acessorios",
    image: `/products/3-cigar-case-romeo-y-julieta/183350.webp`,
    variants: [
      { sku: `183350`, name: { pt: `Leather case — Burgundy`, en: `Leather case — Burgundy` }, priceCents: 31500, currency: "EUR", attributes: { color: { label: { pt: `Burgundy`, en: `Burgundy` }, hex: ["#7d2b27"] } }, image: `/products/3-cigar-case-romeo-y-julieta/183350.webp`, images: [`/products/3-cigar-case-romeo-y-julieta/183350.webp`, `/products/3-cigar-case-romeo-y-julieta/183350-2.webp`, `/products/3-cigar-case-romeo-y-julieta/183350-3.webp`] },
    ],
  },
  {
    slug: `3-cigar-case-fuente`,
    name: { pt: `leather case`, en: `leather case` },
    description: { pt: `3-Cigar Case - Coated canvas embossed with the multicolor X monogram and calf leather. Gold Opus X Fuente logo embossed on the case. Gold base with S.T. Dupont logo engraved on the front.`, en: `3-Cigar Case - Coated canvas embossed with the multicolor X monogram and calf leather. Gold Opus X Fuente logo embossed on the case. Gold base with S.T. Dupont logo engraved on the front.` },
    collection: `Fuente`,
    categorySlug: "acessorios",
    image: `/products/3-cigar-case-fuente/183460.webp`,
    variants: [
      { sku: `183460`, name: { pt: `leather case — Multicolor`, en: `leather case — Multicolor` }, priceCents: 31500, currency: "EUR", attributes: { color: { label: { pt: `Multicolor`, en: `Multicolor` }, hex: ["#c8a24a"] } }, image: `/products/3-cigar-case-fuente/183460.webp`, images: [`/products/3-cigar-case-fuente/183460.webp`, `/products/3-cigar-case-fuente/183460-2.webp`, `/products/3-cigar-case-fuente/183460-3.webp`] },
    ],
  },
  {
    slug: `defi-extreme-camo`,
    name: { pt: `Lighter Matt`, en: `Lighter Matt` },
    description: { pt: `This year, S.T. Dupont is reintroducing the camouflage pattern on its iconic products. For added originality, this camouflage incorporates flames in vibrant shades of red and green, creating a fresh and bold interpretation of this legendary design. Défi Extrême lighter with green camouflage motif and chrome trigger Die-cast metal body and highly resistant semi-rigid protective cover Blue torch flame Associated gas refill: red for Défi Extrême; XXtrême (REF 900436) Lighter delivered empty of gas, refill sold separately.`, en: `This year, S.T. Dupont is reintroducing the camouflage pattern on its iconic products. For added originality, this camouflage incorporates flames in vibrant shades of red and green, creating a fresh and bold interpretation of this legendary design. Défi Extrême lighter with green camouflage motif and chrome trigger Die-cast metal body and highly resistant semi-rigid protective cover Blue torch flame Associated gas refill: red for Défi Extrême; XXtrême (REF 900436) Lighter delivered empty of gas, refill sold separately.` },
    collection: `Camo`,
    categorySlug: "isqueiros",
    image: `/products/defi-extreme-camo/021451.webp`,
    variants: [
      { sku: `021451`, name: { pt: `Lighter Matt — Red`, en: `Lighter Matt — Red` }, priceCents: 28000, currency: "EUR", attributes: { color: { label: { pt: `Red`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/defi-extreme-camo/021451.webp`, images: [`/products/defi-extreme-camo/021451.webp`, `/products/defi-extreme-camo/021451-2.webp`, `/products/defi-extreme-camo/021451-3.webp`, `/products/defi-extreme-camo/021451-4.webp`] },
      { sku: `021450`, name: { pt: `Lighter Matt — Khaki`, en: `Lighter Matt — Khaki` }, priceCents: 28000, currency: "EUR", attributes: { color: { label: { pt: `Khaki`, en: `Khaki` }, hex: ["#3b5d39"] } }, image: `/products/defi-extreme-camo/021450.webp`, images: [`/products/defi-extreme-camo/021450.webp`, `/products/defi-extreme-camo/021450-2.webp`, `/products/defi-extreme-camo/021450-3.webp`, `/products/defi-extreme-camo/021450-4.webp`] },
    ],
  },
  {
    slug: `slim-7-camo`,
    name: { pt: `Lighter Matt`, en: `Lighter Matt` },
    description: { pt: `This year, S.T. This year, S.T. Dupont reintroduces the camouflage pattern on its iconic products, and for added originality, the camouflage incorporates flames in vibrant shades of red and green, creating a fresh and bold interpretation of this legendary design. Slim 7 lighter with green camouflage motif and chrome attributes Thickness 7 mm and weight 45 grams Featuring a flat blue flame Associated gas refill: black (REF 900430) Lighter delivered empty of gas, refill sold separately`, en: `This year, S.T. This year, S.T. Dupont reintroduces the camouflage pattern on its iconic products, and for added originality, the camouflage incorporates flames in vibrant shades of red and green, creating a fresh and bold interpretation of this legendary design. Slim 7 lighter with green camouflage motif and chrome attributes Thickness 7 mm and weight 45 grams Featuring a flat blue flame Associated gas refill: black (REF 900430) Lighter delivered empty of gas, refill sold separately` },
    collection: `Camo`,
    categorySlug: "isqueiros",
    image: `/products/slim-7-camo/027751.webp`,
    variants: [
      { sku: `027751`, name: { pt: `Lighter Matt — Red`, en: `Lighter Matt — Red` }, priceCents: 23500, currency: "EUR", attributes: { color: { label: { pt: `Red`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/slim-7-camo/027751.webp`, images: [`/products/slim-7-camo/027751.webp`, `/products/slim-7-camo/027751-2.webp`, `/products/slim-7-camo/027751-3.webp`, `/products/slim-7-camo/027751-4.webp`] },
      { sku: `027750G`, name: { pt: `Lighter Matt — Khaki`, en: `Lighter Matt — Khaki` }, priceCents: 23500, currency: "EUR", attributes: { color: { label: { pt: `Khaki`, en: `Khaki` }, hex: ["#3b5d39"] } }, image: `/products/slim-7-camo/027750G.webp`, images: [`/products/slim-7-camo/027750G.webp`, `/products/slim-7-camo/027750G-2.webp`, `/products/slim-7-camo/027750G-3.webp`, `/products/slim-7-camo/027750G-4.webp`] },
    ],
  },
  {
    slug: `maxijet-camo`,
    name: { pt: `Lighter Matt`, en: `Lighter Matt` },
    description: { pt: `This year, S.T. This year, S.T. Dupont reintroduces the camouflage pattern on its iconic products, with flames in vibrant shades of red and green, creating a fresh, bold interpretation of this legendary design. Maxijet lighter, green Camouflage motif and chrome attributes Featuring a blue torch flame Associated gas refill: black (REF 900430) Lighter delivered empty of gas, refill sold separately`, en: `This year, S.T. This year, S.T. Dupont reintroduces the camouflage pattern on its iconic products, with flames in vibrant shades of red and green, creating a fresh, bold interpretation of this legendary design. Maxijet lighter, green Camouflage motif and chrome attributes Featuring a blue torch flame Associated gas refill: black (REF 900430) Lighter delivered empty of gas, refill sold separately` },
    collection: `Camo`,
    categorySlug: "isqueiros",
    image: `/products/maxijet-camo/020150.webp`,
    variants: [
      { sku: `020150`, name: { pt: `Lighter Matt — Green & Khaki`, en: `Lighter Matt — Green & Khaki` }, priceCents: 24000, currency: "EUR", attributes: { color: { label: { pt: `Green & Khaki`, en: `Green & Khaki` }, hex: ["#3b5d39"] } }, image: `/products/maxijet-camo/020150.webp`, images: [`/products/maxijet-camo/020150.webp`, `/products/maxijet-camo/020150-2.webp`, `/products/maxijet-camo/020150-3.webp`, `/products/maxijet-camo/020150-4.webp`] },
    ],
  },
  {
    slug: `ligne-2-5`,
    name: { pt: `ligne 2`, en: `ligne 2` },
    description: { pt: `pBrown smooth cowhide leather lighter case, accommodates a Line 2 lighter. Embossed with the S.T. Dupont logo and blue, white, red stitching./p`, en: `pBrown smooth cowhide leather lighter case, accommodates a Line 2 lighter. Embossed with the S.T. Dupont logo and blue, white, red stitching./p` },
    collection: `Ligne 2`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-5/183071.webp`,
    variants: [
      { sku: `183071`, name: { pt: `ligne 2 — Brown`, en: `ligne 2 — Brown` }, priceCents: 17000, currency: "EUR", attributes: { color: { label: { pt: `Brown`, en: `Brown` }, hex: ["#6b4a2a"] } }, image: `/products/ligne-2-5/183071.webp`, images: [`/products/ligne-2-5/183071.webp`, `/products/ligne-2-5/183071-2.webp`, `/products/ligne-2-5/183071-3.webp`] },
    ],
  },
  {
    slug: `lighter-case-2`,
    name: { pt: `ligne 2`, en: `ligne 2` },
    description: { pt: `pBlue smooth cowhide leather lighter case, accommodates a Line 2 lighter. Embossed with the S.T. Dupont logo and blue, white, red stitching./p`, en: `pBlue smooth cowhide leather lighter case, accommodates a Line 2 lighter. Embossed with the S.T. Dupont logo and blue, white, red stitching./p` },
    collection: `lighter-case`,
    categorySlug: "acessorios",
    image: `/products/lighter-case-2/183073.webp`,
    variants: [
      { sku: `183073`, name: { pt: `ligne 2 — Dark Blue`, en: `ligne 2 — Dark Blue` }, priceCents: 17000, currency: "EUR", attributes: { color: { label: { pt: `Dark Blue`, en: `Dark Blue` }, hex: ["#1f3c66"] } }, image: `/products/lighter-case-2/183073.webp`, images: [`/products/lighter-case-2/183073.webp`, `/products/lighter-case-2/183073-2.webp`, `/products/lighter-case-2/183073-3.webp`] },
    ],
  },
  {
    slug: `x-2`,
    name: { pt: `Small`, en: `Small` },
    description: { pt: `With the X-bag, the iconic guilloche of S.T. Dupont’s lighters and pens comes to life in a macro version. A giant "X", like an ode to life on a grand scale. It is a tribute to the Maison's signature style, as the X-bag is inspired by the Fire-head guilloche, amongst the most iconic of the Maison's goldsmith creations. The bag is crafted with full-grain calf leather, adorned with elegant palladium hardware, with an adjustable strap for versatile style. Leather used is LWG certified.`, en: `With the X-bag, the iconic guilloche of S.T. Dupont’s lighters and pens comes to life in a macro version. A giant "X", like an ode to life on a grand scale. It is a tribute to the Maison's signature style, as the X-bag is inspired by the Fire-head guilloche, amongst the most iconic of the Maison's goldsmith creations. The bag is crafted with full-grain calf leather, adorned with elegant palladium hardware, with an adjustable strap for versatile style. Leather used is LWG certified.` },
    collection: `X`,
    categorySlug: "pele",
    image: `/products/x-2/1XB283BL1.webp`,
    variants: [
      { sku: `1XB283BL1`, name: { pt: `Small — Tan`, en: `Small — Tan` }, priceCents: 176500, currency: "EUR", attributes: { color: { label: { pt: `Tan`, en: `Tan` }, hex: ["#7a7d83"] } }, image: `/products/x-2/1XB283BL1.webp`, images: [`/products/x-2/1XB283BL1.webp`, `/products/x-2/1XB283BL1-2.webp`, `/products/x-2/1XB283BL1-3.webp`, `/products/x-2/1XB283BL1-4.webp`] },
      { sku: `1XB283PL1`, name: { pt: `Small — Nude Pink`, en: `Small — Nude Pink` }, priceCents: 176500, currency: "EUR", attributes: { color: { label: { pt: `Nude Pink`, en: `Nude Pink` }, hex: ["#c97a8c"] } }, image: `/products/x-2/1XB283PL1.webp`, images: [`/products/x-2/1XB283PL1.webp`, `/products/x-2/1XB283PL1-2.webp`, `/products/x-2/1XB283PL1-3.webp`, `/products/x-2/1XB283PL1-4.webp`] },
      { sku: `1XB283WH1`, name: { pt: `Small — White`, en: `Small — White` }, priceCents: 175000, currency: "EUR", attributes: { color: { label: { pt: `White`, en: `White` }, hex: ["#efeae0"] } }, image: `/products/x-2/1XB283WH1.webp`, images: [`/products/x-2/1XB283WH1.webp`, `/products/x-2/1XB283WH1-2.webp`, `/products/x-2/1XB283WH1-3.webp`, `/products/x-2/1XB283WH1-4.webp`] },
      { sku: `1XB282BL1`, name: { pt: `Small — Tan`, en: `Small — Tan` }, priceCents: 146000, currency: "EUR", attributes: { color: { label: { pt: `Tan`, en: `Tan` }, hex: ["#7a7d83"] } }, image: `/products/x-2/1XB282BL1.webp`, images: [`/products/x-2/1XB282BL1.webp`, `/products/x-2/1XB282BL1-2.webp`, `/products/x-2/1XB282BL1-3.webp`, `/products/x-2/1XB282BL1-4.webp`] },
    ],
  },
  {
    slug: `cufflinks-montecristo-aurore-2`,
    name: { pt: `Montecristo l'Aurore`, en: `Montecristo l'Aurore` },
    description: { pt: `Montecristo et S.T. Dupont, deux noms synonymes d'un savoir-faire unique, s'associent pour créer des produits d'exception. Cette nouvelle collection ravira les fans des deux marques. Les boutons de manchette Montecristo L'Aurore arborent fièrement le logo Montécristo et le dégradé emblématique de la collection. Montecristo L'Aurore propose : - Trois briquets - Deux instruments à écrire Line D Large - Des accessoires cigares - Une paire de boutons de manchette.`, en: `Montecristo et S.T. Dupont, deux noms synonymes d'un savoir-faire unique, s'associent pour créer des produits d'exception. Cette nouvelle collection ravira les fans des deux marques. Les boutons de manchette Montecristo L'Aurore arborent fièrement le logo Montécristo et le dégradé emblématique de la collection. Montecristo L'Aurore propose : - Trois briquets - Deux instruments à écrire Line D Large - Des accessoires cigares - Une paire de boutons de manchette.` },
    collection: `Montecristo · L'Aurore`,
    categorySlug: "acessorios",
    image: `/products/cufflinks-montecristo-aurore-2/005714.webp`,
    variants: [
      { sku: `005714`, name: { pt: `Montecristo l'Aurore — Violet`, en: `Montecristo l'Aurore — Violet` }, priceCents: 47000, currency: "EUR", attributes: { color: { label: { pt: `Violet`, en: `Violet` }, hex: ["#6b4a8a"] } }, image: `/products/cufflinks-montecristo-aurore-2/005714.webp`, images: [`/products/cufflinks-montecristo-aurore-2/005714.webp`, `/products/cufflinks-montecristo-aurore-2/005714-2.webp`, `/products/cufflinks-montecristo-aurore-2/005714-3.webp`] },
    ],
  },
  {
    slug: `cufflinks-montecristo-la-nuit`,
    name: { pt: `Montecristo la Nuit`, en: `Montecristo la Nuit` },
    description: { pt: `Montecristo La Nuit cufflinks proudly display the iconic Montecristo logo and gradient from the collection. The Montecristo La Nuit range includes: three lighters, two Line D Large writing instruments, cigar accessories and a pair of cufflinks. Platinum finishes.`, en: `Montecristo La Nuit cufflinks proudly display the iconic Montecristo logo and gradient from the collection. The Montecristo La Nuit range includes: three lighters, two Line D Large writing instruments, cigar accessories and a pair of cufflinks. Platinum finishes.` },
    collection: `Montecristo · La Nuit`,
    categorySlug: "acessorios",
    image: `/products/cufflinks-montecristo-la-nuit/005715.webp`,
    variants: [
      { sku: `005715`, name: { pt: `Montecristo la Nuit — Dark Blue`, en: `Montecristo la Nuit — Dark Blue` }, priceCents: 47000, currency: "EUR", attributes: { color: { label: { pt: `Dark Blue`, en: `Dark Blue` }, hex: ["#1f3c66"] } }, image: `/products/cufflinks-montecristo-la-nuit/005715.webp`, images: [`/products/cufflinks-montecristo-la-nuit/005715.webp`, `/products/cufflinks-montecristo-la-nuit/005715-2.webp`, `/products/cufflinks-montecristo-la-nuit/005715-3.webp`, `/products/cufflinks-montecristo-la-nuit/005715-4.webp`] },
    ],
  },
  {
    slug: `ashtray-montecristo-la-nuit`,
    name: { pt: `Porcelain`, en: `Porcelain` },
    description: { pt: `This traditional porcelain ashtray is hand-painted and topped with silver after three layers of lacquer. The collection includes 3 lighters: Line 2, Le Grand Dupont, Maxijet. Also, two pens from the Line D Large collection and accessories: a leather case for three cigars, a cigar cutter and a pair of cufflinks.`, en: `This traditional porcelain ashtray is hand-painted and topped with silver after three layers of lacquer. The collection includes 3 lighters: Line 2, Le Grand Dupont, Maxijet. Also, two pens from the Line D Large collection and accessories: a leather case for three cigars, a cigar cutter and a pair of cufflinks.` },
    collection: `Montecristo · La Nuit`,
    categorySlug: "acessorios",
    image: `/products/ashtray-montecristo-la-nuit/006435.webp`,
    variants: [
      { sku: `006435`, name: { pt: `Porcelain — Dark Blue`, en: `Porcelain — Dark Blue` }, priceCents: 49000, currency: "EUR", attributes: { color: { label: { pt: `Dark Blue`, en: `Dark Blue` }, hex: ["#1f3c66"] } }, image: `/products/ashtray-montecristo-la-nuit/006435.webp`, images: [`/products/ashtray-montecristo-la-nuit/006435.webp`, `/products/ashtray-montecristo-la-nuit/006435-2.webp`, `/products/ashtray-montecristo-la-nuit/006435-3.webp`] },
    ],
  },
  {
    slug: `ashtray-montecristo-aurore`,
    name: { pt: `Porcelain`, en: `Porcelain` },
    description: { pt: `Montecristo and S.T. Dupont, both synonymous with unique craftsmanship, have joined forces to create exceptional products. This new collection will delight fans of both brands. The traditional porcelain ashtray is hand-painted and also adorned with a gold top after three layers of lacquer. The collection includes 3 lighters: Ligne 2, Le Grand Dupont, Maxijet. Also, two pens from the Line D Large collection and accessories: a leather case for three cigars, a cigar cutter and a pair of cufflinks.`, en: `Montecristo and S.T. Dupont, both synonymous with unique craftsmanship, have joined forces to create exceptional products. This new collection will delight fans of both brands. The traditional porcelain ashtray is hand-painted and also adorned with a gold top after three layers of lacquer. The collection includes 3 lighters: Ligne 2, Le Grand Dupont, Maxijet. Also, two pens from the Line D Large collection and accessories: a leather case for three cigars, a cigar cutter and a pair of cufflinks.` },
    collection: `Montecristo · L'Aurore`,
    categorySlug: "acessorios",
    image: `/products/ashtray-montecristo-aurore/006434.webp`,
    variants: [
      { sku: `006434`, name: { pt: `Porcelain — Violet`, en: `Porcelain — Violet` }, priceCents: 49000, currency: "EUR", attributes: { color: { label: { pt: `Violet`, en: `Violet` }, hex: ["#6b4a8a"] } }, image: `/products/ashtray-montecristo-aurore/006434.webp`, images: [`/products/ashtray-montecristo-aurore/006434.webp`, `/products/ashtray-montecristo-aurore/006434-2.webp`, `/products/ashtray-montecristo-aurore/006434-3.webp`] },
    ],
  },
  {
    slug: `ashtray-trinidad`,
    name: { pt: `Porcelain`, en: `Porcelain` },
    description: { pt: `To celebrate the 55th anniversary of the Trinidad brand, S.T. Dupont and Habanos S.A. have combined their legendary expertise in an elegant and timeless edition. Deep blacks and three shades of sunny gold, recalling the soft colours of the city of Trinidad and the refined work of tobacco artisans, the monogram of the Trinidad house illuminates S.T. lighters and accessories. Dupont lighters and accessories. All the items in this collection bear the S.T. signature. Dupont signature and a ‘55’ graphic, the anniversary celebrated this year by Trinidad cigars. Large porcelain ashtray decorated with the Trinidad monogram. The design of the ashtray as well as the gilded outline are applied by hand..`, en: `To celebrate the 55th anniversary of the Trinidad brand, S.T. Dupont and Habanos S.A. have combined their legendary expertise in an elegant and timeless edition. Deep blacks and three shades of sunny gold, recalling the soft colours of the city of Trinidad and the refined work of tobacco artisans, the monogram of the Trinidad house illuminates S.T. lighters and accessories. Dupont lighters and accessories. All the items in this collection bear the S.T. signature. Dupont signature and a ‘55’ graphic, the anniversary celebrated this year by Trinidad cigars. Large porcelain ashtray decorated with the Trinidad monogram. The design of the ashtray as well as the gilded outline are applied by hand..` },
    collection: `Trinidad`,
    categorySlug: "acessorios",
    image: `/products/ashtray-trinidad/006477.webp`,
    variants: [
      { sku: `006477`, name: { pt: `Porcelain — Black`, en: `Porcelain — Black` }, priceCents: 40500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/ashtray-trinidad/006477.webp`, images: [`/products/ashtray-trinidad/006477.webp`, `/products/ashtray-trinidad/006477-2.webp`, `/products/ashtray-trinidad/006477-3.webp`] },
    ],
  },
  {
    slug: `ashtray-padron`,
    name: { pt: `Porcelain`, en: `Porcelain` },
    description: { pt: `On the occasion of the 60th anniversary of the Padrón house, S.T. Dupont announces a special collaboration. The S.T. Dupont x Padrón collection offers distinctive lighters and cigar accessories. Its yellow gold finishes embody the Padrón cigar band, and its brown lacquer refers to the color of their wrapper leaf, the tobacco leaf that wraps a cigar blend. Padrón ashtray with a glossy finish. Hand-painted gold edges.`, en: `On the occasion of the 60th anniversary of the Padrón house, S.T. Dupont announces a special collaboration. The S.T. Dupont x Padrón collection offers distinctive lighters and cigar accessories. Its yellow gold finishes embody the Padrón cigar band, and its brown lacquer refers to the color of their wrapper leaf, the tobacco leaf that wraps a cigar blend. Padrón ashtray with a glossy finish. Hand-painted gold edges.` },
    collection: `Padrón`,
    categorySlug: "acessorios",
    image: `/products/ashtray-padron/006114.webp`,
    variants: [
      { sku: `006114`, name: { pt: `Porcelain — Brown`, en: `Porcelain — Brown` }, priceCents: 40000, currency: "EUR", attributes: { color: { label: { pt: `Brown`, en: `Brown` }, hex: ["#6b4a2a"] } }, image: `/products/ashtray-padron/006114.webp`, images: [`/products/ashtray-padron/006114.webp`, `/products/ashtray-padron/006114-2.webp`, `/products/ashtray-padron/006114-3.webp`] },
    ],
  },
  {
    slug: `ashtray-20000-leagues`,
    name: { pt: `Porcelain`, en: `Porcelain` },
    description: { pt: `Tribute to the captivating universe of 20,000 leagues under the seas, this limited edition expresses all the know-how of S.T. Dupont. Published in 1870, the novel recounts the journey of three castaways captured by Captain Nemo, this mysterious inventor who travels the seabed aboard the Nautilus, submarine very ahead of the technologies of the time. Portholes, turbines, corals, fins and other tentacles of giant squid inspire this limited edition and its three ranges, all related to different chapters of the book. A story in three stages in which to dive with passion. For the Premium range of this edition 20,000 leagues under the seas, S.T. Dupont tells two other chapters: «4000 leagues under the Pacific», chapter 18 of the book, and «Gulf Stream», chapter 19 of its second part. In the latter, Jules Verne evokes the Gulf Stream, a natural force shaping the movement of the oceans and those who are there. Fast-moving and perilous, it also allows Captain Nemo to demonstrate his excellence. Nautilus pattern ashtray. Blue lacquer and glossy finish. Hand-painted finish on the grooves.`, en: `Tribute to the captivating universe of 20,000 leagues under the seas, this limited edition expresses all the know-how of S.T. Dupont. Published in 1870, the novel recounts the journey of three castaways captured by Captain Nemo, this mysterious inventor who travels the seabed aboard the Nautilus, submarine very ahead of the technologies of the time. Portholes, turbines, corals, fins and other tentacles of giant squid inspire this limited edition and its three ranges, all related to different chapters of the book. A story in three stages in which to dive with passion. For the Premium range of this edition 20,000 leagues under the seas, S.T. Dupont tells two other chapters: «4000 leagues under the Pacific», chapter 18 of the book, and «Gulf Stream», chapter 19 of its second part. In the latter, Jules Verne evokes the Gulf Stream, a natural force shaping the movement of the oceans and those who are there. Fast-moving and perilous, it also allows Captain Nemo to demonstrate his excellence. Nautilus pattern ashtray. Blue lacquer and glossy finish. Hand-painted finish on the grooves.` },
    collection: `20,000 Leagues Under The Sea`,
    categorySlug: "acessorios",
    image: `/products/ashtray-20000-leagues/006451.webp`,
    variants: [
      { sku: `006451`, name: { pt: `Porcelain — Blue Gulf Stream`, en: `Porcelain — Blue Gulf Stream` }, priceCents: 40000, currency: "EUR", attributes: { color: { label: { pt: `Blue Gulf Stream`, en: `Blue Gulf Stream` }, hex: ["#1f3c66"] } }, image: `/products/ashtray-20000-leagues/006451.webp`, images: [`/products/ashtray-20000-leagues/006451.webp`, `/products/ashtray-20000-leagues/006451-2.webp`, `/products/ashtray-20000-leagues/006451-3.webp`] },
      { sku: `006452`, name: { pt: `Porcelain — Green Pacific`, en: `Porcelain — Green Pacific` }, priceCents: 40000, currency: "EUR", attributes: { color: { label: { pt: `Green Pacific`, en: `Green Pacific` }, hex: ["#3b5d39"] } }, image: `/products/ashtray-20000-leagues/006452.webp`, images: [`/products/ashtray-20000-leagues/006452.webp`, `/products/ashtray-20000-leagues/006452-2.webp`, `/products/ashtray-20000-leagues/006452-3.webp`] },
      { sku: `006153`, name: { pt: `Porcelain — Royal Blue`, en: `Porcelain — Royal Blue` }, priceCents: 25000, currency: "EUR", attributes: { color: { label: { pt: `Royal Blue`, en: `Royal Blue` }, hex: ["#1f3c66"] } }, image: `/products/ashtray-20000-leagues/006153.webp`, images: [`/products/ashtray-20000-leagues/006153.webp`, `/products/ashtray-20000-leagues/006153-2.webp`, `/products/ashtray-20000-leagues/006153-3.webp`] },
    ],
  },
  {
    slug: `ashtray-romeo-y-julieta`,
    name: { pt: `Porcelain`, en: `Porcelain` },
    description: { pt: `To celebrate the 150th anniversary of Romeo and Julieta, S.T. Dupont signs an exclusive collaboration, inspired by the strength of passion and expertise. A tribute to the art of exceptional cigars and the beauty of timeless objects. Romeo & Julieta pattern ashtray. White lacquer and glossy finish. Hand-painted golden finish on the grooves.`, en: `To celebrate the 150th anniversary of Romeo and Julieta, S.T. Dupont signs an exclusive collaboration, inspired by the strength of passion and expertise. A tribute to the art of exceptional cigars and the beauty of timeless objects. Romeo & Julieta pattern ashtray. White lacquer and glossy finish. Hand-painted golden finish on the grooves.` },
    collection: `Romeo-y-Julieta`,
    categorySlug: "acessorios",
    image: `/products/ashtray-romeo-y-julieta/006450.webp`,
    variants: [
      { sku: `006450`, name: { pt: `Porcelain — White`, en: `Porcelain — White` }, priceCents: 40500, currency: "EUR", attributes: { color: { label: { pt: `White`, en: `White` }, hex: ["#efeae0"] } }, image: `/products/ashtray-romeo-y-julieta/006450.webp`, images: [`/products/ashtray-romeo-y-julieta/006450.webp`, `/products/ashtray-romeo-y-julieta/006450-2.webp`, `/products/ashtray-romeo-y-julieta/006450-3.webp`] },
    ],
  },
  {
    slug: `ashtray-fuente`,
    name: { pt: `porcelain`, en: `porcelain` },
    description: { pt: `Ashtray - Black lacquer decorated with the multicolor X monogram and Opus X Fuente crest at the center. Hand-painted gold finishes on the grooves.`, en: `Ashtray - Black lacquer decorated with the multicolor X monogram and Opus X Fuente crest at the center. Hand-painted gold finishes on the grooves.` },
    collection: `Fuente`,
    categorySlug: "acessorios",
    image: `/products/ashtray-fuente/006460.webp`,
    variants: [
      { sku: `006460`, name: { pt: `porcelain — Multicolor`, en: `porcelain — Multicolor` }, priceCents: 40500, currency: "EUR", attributes: { color: { label: { pt: `Multicolor`, en: `Multicolor` }, hex: ["#c8a24a"] } }, image: `/products/ashtray-fuente/006460.webp`, images: [`/products/ashtray-fuente/006460.webp`, `/products/ashtray-fuente/006460-2.webp`, `/products/ashtray-fuente/006460-3.webp`] },
    ],
  },
  {
    slug: `misc-xl`,
    name: { pt: `porcelain`, en: `porcelain` },
    description: { pt: `Timeless and generous, the XL ashtray becomes a true decorative piece that elevates any space. Combining elegance with functionality, it features three cigar rests and is available in a refined palette of colors.`, en: `Timeless and generous, the XL ashtray becomes a true decorative piece that elevates any space. Combining elegance with functionality, it features three cigar rests and is available in a refined palette of colors.` },
    collection: `XL`,
    categorySlug: "acessorios",
    image: `/products/misc-xl/006725.webp`,
    variants: [
      { sku: `006725`, name: { pt: `porcelain — Black`, en: `porcelain — Black` }, priceCents: 55500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/misc-xl/006725.webp`, images: [`/products/misc-xl/006725.webp`, `/products/misc-xl/006725-2.webp`, `/products/misc-xl/006725-3.webp`] },
      { sku: `006737`, name: { pt: `porcelain — Black`, en: `porcelain — Black` }, priceCents: 55500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/misc-xl/006737.webp`, images: [`/products/misc-xl/006737.webp`, `/products/misc-xl/006737-2.webp`, `/products/misc-xl/006737-3.webp`] },
      { sku: `006727`, name: { pt: `porcelain — Black`, en: `porcelain — Black` }, priceCents: 55500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/misc-xl/006727.webp`, images: [`/products/misc-xl/006727.webp`, `/products/misc-xl/006727-2.webp`, `/products/misc-xl/006727-3.webp`] },
      { sku: `006726`, name: { pt: `porcelain — Blue`, en: `porcelain — Blue` }, priceCents: 55500, currency: "EUR", attributes: { color: { label: { pt: `Blue`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/misc-xl/006726.webp`, images: [`/products/misc-xl/006726.webp`, `/products/misc-xl/006726-2.webp`, `/products/misc-xl/006726-3.webp`] },
    ],
  },
  {
    slug: `d-logo`,
    name: { pt: `Reversible belt`, en: `Reversible belt` },
    description: { pt: `For almost 50 years, S.T. Dupont has offered a wide range of belts combining the House's different expertise to dress men with elegance. These belts are available in a wide choice of leathers, in reversible or non-reversible versions, with 30 or 35 mm wide straps and with different buckles: pin buckles or case buckles.`, en: `For almost 50 years, S.T. Dupont has offered a wide range of belts combining the House's different expertise to dress men with elegance. These belts are available in a wide choice of leathers, in reversible or non-reversible versions, with 30 or 35 mm wide straps and with different buckles: pin buckles or case buckles.` },
    collection: `D Logo`,
    categorySlug: "acessorios",
    image: `/products/d-logo/9351000.webp`,
    variants: [
      { sku: `9351000`, name: { pt: `Reversible belt — Black`, en: `Reversible belt — Black` }, priceCents: 29000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/d-logo/9351000.webp`, images: [`/products/d-logo/9351000.webp`, `/products/d-logo/9351000-2.webp`] },
      { sku: `9351100`, name: { pt: `Reversible belt — Black`, en: `Reversible belt — Black` }, priceCents: 29000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/d-logo/9351100.webp`, images: [`/products/d-logo/9351100.webp`, `/products/d-logo/9351100-2.webp`] },
      { sku: `9351200`, name: { pt: `Reversible belt — Black`, en: `Reversible belt — Black` }, priceCents: 29000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/d-logo/9351200.webp`, images: [`/products/d-logo/9351200.webp`, `/products/d-logo/9351200-2.webp`] },
      { sku: `9351001`, name: { pt: `Reversible belt — Black`, en: `Reversible belt — Black` }, priceCents: 29000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/d-logo/9351001.webp`, images: [`/products/d-logo/9351001.webp`, `/products/d-logo/9351001-2.webp`] },
      { sku: `9351002`, name: { pt: `Reversible belt — Black`, en: `Reversible belt — Black` }, priceCents: 29000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/d-logo/9351002.webp`, images: [`/products/d-logo/9351002.webp`, `/products/d-logo/9351002-2.webp`] },
      { sku: `9351003`, name: { pt: `Reversible belt — Black`, en: `Reversible belt — Black` }, priceCents: 31500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/d-logo/9351003.webp`, images: [`/products/d-logo/9351003.webp`, `/products/d-logo/9351003-2.webp`] },
    ],
  },
  {
    slug: `eternity-superman`,
    name: { pt: `Rollerball large`, en: `Rollerball large` },
    description: { pt: `S.T. Dupont takes off in the colors of Superman with an exclusive collection. The iconic Superman S emblem, a symbol of hope and heroism, proudly stands out on every piece in the collection. Roller pen Line D Eternity large in lacquer S.T. Dupont blue gradient inspired by the sky of Metropolis. Emblem S of Superman in lacquer placed. Articulated Sword Clip. Gold finish. Associated refills: Roller: 040840 Blue - 040841 Black Felt: 040830 Blue - 040831 Black`, en: `S.T. Dupont takes off in the colors of Superman with an exclusive collection. The iconic Superman S emblem, a symbol of hope and heroism, proudly stands out on every piece in the collection. Roller pen Line D Eternity large in lacquer S.T. Dupont blue gradient inspired by the sky of Metropolis. Emblem S of Superman in lacquer placed. Articulated Sword Clip. Gold finish. Associated refills: Roller: 040840 Blue - 040841 Black Felt: 040830 Blue - 040831 Black` },
    collection: `Superman`,
    categorySlug: "escrita",
    image: `/products/eternity-superman/422027L.webp`,
    variants: [
      { sku: `422027L`, name: { pt: `Rollerball large — Blue`, en: `Rollerball large — Blue` }, priceCents: 131000, currency: "EUR", attributes: { color: { label: { pt: `Blue`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/eternity-superman/422027L.webp`, images: [`/products/eternity-superman/422027L.webp`, `/products/eternity-superman/422027L-2.webp`, `/products/eternity-superman/422027L-3.webp`, `/products/eternity-superman/422027L-4.webp`] },
    ],
  },
  {
    slug: `misc-dc-comics-2`,
    name: { pt: `Rollerball large`, en: `Rollerball large` },
    description: { pt: `S.T. Dupont unveils the third chapter of its collaboration with DC COMICS through an exclusive collection inspired by three iconic figures: Wonder Woman, Catwoman and The Penguin. The collection conveys a universal message of justice, freedom and power, elevated by the Maison’s savoir-faire in exceptional creations such as the Ligne 2 lighter, the Line D Eternity pen and, for selected characters, a Lighter Necklace. Line D Eternity Large rollerball pen in red and blue Dupont lacquer with gold finishes. Pen adorned with the “WW” emblem and stars, symbols of the DC Comics heroine Wonder Woman. Articulated Sword clip. Associated refills: Rollerball: 040840 Blue – 040841 Black Felt-tip: 040830 Blue – 040831 Black`, en: `S.T. Dupont unveils the third chapter of its collaboration with DC COMICS through an exclusive collection inspired by three iconic figures: Wonder Woman, Catwoman and The Penguin. The collection conveys a universal message of justice, freedom and power, elevated by the Maison’s savoir-faire in exceptional creations such as the Ligne 2 lighter, the Line D Eternity pen and, for selected characters, a Lighter Necklace. Line D Eternity Large rollerball pen in red and blue Dupont lacquer with gold finishes. Pen adorned with the “WW” emblem and stars, symbols of the DC Comics heroine Wonder Woman. Articulated Sword clip. Associated refills: Rollerball: 040840 Blue – 040841 Black Felt-tip: 040830 Blue – 040831 Black` },
    collection: `DC Comics`,
    categorySlug: "escrita",
    image: `/products/misc-dc-comics-2/422179L.webp`,
    variants: [
      { sku: `422179L`, name: { pt: `Rollerball large — Variante 179L`, en: `Rollerball large — Variant 179L` }, priceCents: 106000, currency: "EUR", attributes: { color: { label: { pt: `Variante 179L`, en: `Variant 179L` }, hex: ["#7a7d83"] } }, image: `/products/misc-dc-comics-2/422179L.webp`, images: [`/products/misc-dc-comics-2/422179L.webp`, `/products/misc-dc-comics-2/422179L-2.webp`, `/products/misc-dc-comics-2/422179L-3.webp`, `/products/misc-dc-comics-2/422179L-4.webp`] },
      { sku: `422180L`, name: { pt: `Rollerball large — Variante 180L`, en: `Rollerball large — Variant 180L` }, priceCents: 106000, currency: "EUR", attributes: { color: { label: { pt: `Variante 180L`, en: `Variant 180L` }, hex: ["#7a7d83"] } }, image: `/products/misc-dc-comics-2/422180L.webp`, images: [`/products/misc-dc-comics-2/422180L.webp`, `/products/misc-dc-comics-2/422180L-2.webp`, `/products/misc-dc-comics-2/422180L-3.webp`, `/products/misc-dc-comics-2/422180L-4.webp`] },
      { sku: `422181L`, name: { pt: `Rollerball large — Variante 181L`, en: `Rollerball large — Variant 181L` }, priceCents: 131000, currency: "EUR", attributes: { color: { label: { pt: `Variante 181L`, en: `Variant 181L` }, hex: ["#7a7d83"] } }, image: `/products/misc-dc-comics-2/422181L.webp`, images: [`/products/misc-dc-comics-2/422181L.webp`, `/products/misc-dc-comics-2/422181L-2.webp`, `/products/misc-dc-comics-2/422181L-3.webp`] },
    ],
  },
  {
    slug: `initial-horse-mane`,
    name: { pt: `Rollerball pen`, en: `Rollerball pen` },
    description: { pt: `On the occasion of the 2026 Chinese New Year, under the sign of the Fire Horse, S.T. Dupont unveils Horse, a flamboyant collection embodying charisma, majesty, and passion. The “mane” guilloché and equine sculpture elegantly evoke the traditions of Chinese culture. Initial rollerball pen in glossy red lacquer with “horse mane” decoration and a golden Fire Horse on the cap. Gold-plated finishes. Articulated Sword clip. Compatible refills: Rollerball: 040840 Blue – 040841 Black Felt-tip: 040830 Blue – 040831 Black`, en: `On the occasion of the 2026 Chinese New Year, under the sign of the Fire Horse, S.T. Dupont unveils Horse, a flamboyant collection embodying charisma, majesty, and passion. The “mane” guilloché and equine sculpture elegantly evoke the traditions of Chinese culture. Initial rollerball pen in glossy red lacquer with “horse mane” decoration and a golden Fire Horse on the cap. Gold-plated finishes. Articulated Sword clip. Compatible refills: Rollerball: 040840 Blue – 040841 Black Felt-tip: 040830 Blue – 040831 Black` },
    collection: `Horse Mane`,
    categorySlug: "escrita",
    image: `/products/initial-horse-mane/272080.webp`,
    variants: [
      { sku: `272080`, name: { pt: `Rollerball pen — Red`, en: `Rollerball pen — Red` }, priceCents: 32500, currency: "EUR", attributes: { color: { label: { pt: `Red`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/initial-horse-mane/272080.webp`, images: [`/products/initial-horse-mane/272080.webp`, `/products/initial-horse-mane/272080-2.webp`, `/products/initial-horse-mane/272080-3.webp`, `/products/initial-horse-mane/272080-4.webp`] },
    ],
  },
  {
    slug: `eternity-joker`,
    name: { pt: `Rollerball pen Large`, en: `Rollerball pen Large` },
    description: { pt: `S.T. Dupont announces a special collaboration featuring Joker and Harley Quinn. The collection is inspired by the two iconic DC Comics characters and their distinctive traits, including a lighter and pen infused with their unique universe. Line D Eternity large rollerball pen, shiny black Dupont lacquer and palladium finishes. Cap decorated with the DC Comics character Joker. Associated refills: 040840 Blue - 040841 Black.`, en: `S.T. Dupont announces a special collaboration featuring Joker and Harley Quinn. The collection is inspired by the two iconic DC Comics characters and their distinctive traits, including a lighter and pen infused with their unique universe. Line D Eternity large rollerball pen, shiny black Dupont lacquer and palladium finishes. Cap decorated with the DC Comics character Joker. Associated refills: 040840 Blue - 040841 Black.` },
    collection: `joker`,
    categorySlug: "escrita",
    image: `/products/eternity-joker/422095L.webp`,
    variants: [
      { sku: `422095L`, name: { pt: `Rollerball pen Large — Silver`, en: `Rollerball pen Large — Silver` }, priceCents: 105000, currency: "EUR", attributes: { color: { label: { pt: `Silver`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/eternity-joker/422095L.webp`, images: [`/products/eternity-joker/422095L.webp`, `/products/eternity-joker/422095L-2.webp`, `/products/eternity-joker/422095L-3.webp`, `/products/eternity-joker/422095L-4.webp`] },
    ],
  },
  {
    slug: `eternity-harley-quinn`,
    name: { pt: `Rollerball pen Large`, en: `Rollerball pen Large` },
    description: { pt: `S.T. Dupont announces a special collaboration featuring Joker and Harley Quinn. The collection is inspired by the two iconic DC Comics characters and their distinctive traits, including a lighter and pen infused with their unique universe. Line D Eternity large rollerball pen, shiny black Dupont lacquer and gold finishes. Cap decorated with the DC Comics character Harley Quinn. Associated refills: 040840 Blue - 040841 Black.`, en: `S.T. Dupont announces a special collaboration featuring Joker and Harley Quinn. The collection is inspired by the two iconic DC Comics characters and their distinctive traits, including a lighter and pen infused with their unique universe. Line D Eternity large rollerball pen, shiny black Dupont lacquer and gold finishes. Cap decorated with the DC Comics character Harley Quinn. Associated refills: 040840 Blue - 040841 Black.` },
    collection: `harley-quinn`,
    categorySlug: "escrita",
    image: `/products/eternity-harley-quinn/422096L.webp`,
    variants: [
      { sku: `422096L`, name: { pt: `Rollerball pen Large — Golden`, en: `Rollerball pen Large — Golden` }, priceCents: 105000, currency: "EUR", attributes: { color: { label: { pt: `Golden`, en: `Golden` }, hex: ["#c8a24a"] } }, image: `/products/eternity-harley-quinn/422096L.webp`, images: [`/products/eternity-harley-quinn/422096L.webp`, `/products/eternity-harley-quinn/422096L-2.webp`, `/products/eternity-harley-quinn/422096L-3.webp`, `/products/eternity-harley-quinn/422096L-4.webp`] },
    ],
  },
  {
    slug: `eternity-presidence-de-la-republique`,
    name: { pt: `Rollerball pen large`, en: `Rollerball pen large` },
    description: { pt: `To mark the hosting of the Paris 2024 Olympic Games, S.T. Dupont has teamed up with the Élysée Palace to celebrate French craftsmanship through a collection of writing instruments made in France. The Eternity pen, specially created for the Presidency of the Republic, stands out as a unique work of art, embodying exceptional craftsmanship and the French art of living. the Eternity medium roller pens are finished in a deep blue lacquer inspired by the French flag, a perfect illustration of S.T. Dupont's emblematic lacquering technique. Dupont's emblematic lacquering technique. Each piece, engraved “Présidence de la République”, reflects exceptional craftsmanship. The gilded finish and the new house signature on the ring add a distinctive touch to this symbol of French craftsmanship. Related refills: 040840 Blue - 040841 Black Translated with DeepL.com (free version)`, en: `To mark the hosting of the Paris 2024 Olympic Games, S.T. Dupont has teamed up with the Élysée Palace to celebrate French craftsmanship through a collection of writing instruments made in France. The Eternity pen, specially created for the Presidency of the Republic, stands out as a unique work of art, embodying exceptional craftsmanship and the French art of living. the Eternity medium roller pens are finished in a deep blue lacquer inspired by the French flag, a perfect illustration of S.T. Dupont's emblematic lacquering technique. Dupont's emblematic lacquering technique. Each piece, engraved “Présidence de la République”, reflects exceptional craftsmanship. The gilded finish and the new house signature on the ring add a distinctive touch to this symbol of French craftsmanship. Related refills: 040840 Blue - 040841 Black Translated with DeepL.com (free version)` },
    collection: `presidence-de-la-republique`,
    categorySlug: "escrita",
    image: `/products/eternity-presidence-de-la-republique/422055M.webp`,
    variants: [
      { sku: `422055M`, name: { pt: `Rollerball pen large — Dark Blue`, en: `Rollerball pen large — Dark Blue` }, priceCents: 77500, currency: "EUR", attributes: { color: { label: { pt: `Dark Blue`, en: `Dark Blue` }, hex: ["#1f3c66"] } }, image: `/products/eternity-presidence-de-la-republique/422055M.webp`, images: [`/products/eternity-presidence-de-la-republique/422055M.webp`, `/products/eternity-presidence-de-la-republique/422055M-2.webp`, `/products/eternity-presidence-de-la-republique/422055M-3.webp`, `/products/eternity-presidence-de-la-republique/422055M-4.webp`] },
    ],
  },
  {
    slug: `set-collector-20000-leagues`,
    name: { pt: `Set Prestige Fire and Writing`, en: `Set Prestige Fire and Writing` },
    description: { pt: `Tribute to the captivating universe of 20,000 leagues under the seas, this limited edition expresses all S.T. Dupont’s expertise. Published in 1870, the novel recounts the journey of three castaways captured by Captain Nemo, this mysterious inventor who travels the seabed aboard the Nautilus, a submarine very ahead of the technologies of the time. Windows, turbines, corals, fins and other tentacles of giant squid inspire this limited edition and its three ranges, all related to different chapters of the book. A three-part story in which to dive with passion. The Prestige range evokes the philosophy of chapter 8, «Mobilis in Mobile», where the adventure truly begins. It is in this latter that Captain Nemo introduces the Nautilus to the three passengers he has captured. He then reveals to them the motto of his submarine: «Mobilis in Mobile» or «Mobile in the mobile element», a way to illustrate the movements of the submarine navigating at the heart of the largest "mobile element" on earth: the sea. Set consisting of a multifunction pen Line D Eternity XL and a lighter Le Grand Dupont. Pen Line D Eternity XL: Line D Eternity XL multifunction composed of a roller sleeve and a 14-carat gold nib sleeve. Piston included. Shiny blue S.T. Dupont lacquered pen with squid tentacle engraved in gold-finish placed lacquer. Cap adorned with nageroires and the N of Nautilus in placed lacquer. Agrafe inspired by a navigation compass. Top of the cap inspired by a S.T. Dupont blue lacquered porthole, sleeve engraved with the submarine’s rivets, vertical propeller on the bottom of the pen. Associated refills: Roller: 040840 Blue - 040841 Black Felt: 040830 Blue - 040831 Black Ink cartridges: 040112 Blue - 040110 Black - 040362 Red - 040363 Green - 040364 Turquoise Inkwell: 040165 Intense black - 040166 Royal blue -040167 Flamboyant red - 040168 Spring green - 040169 Turquoise - 040170 Night blue Le Grand Dupont Lighter: Shiny blue lacquer Le Grand Dupont lighter with squid tentacle engraved in placed lacquer. Golden finishes. Mobilis decor in mobile. Perforated hat resuming the decor of the Hublot of the Nautilus and adorned with ornaments. Equipped with a double ignition system for yellow flame or blue flame. Associated lighter block: red (REF 900651) Associated gas refill: red (REF 900435) Lighter delivered empty of gas, refill sold separately. Screwdriver included to change the stone. Box consisting of a squid pen holder, a lighter holder and a replica of the Nautilus. Limited and numbered to 200 copies.`, en: `Tribute to the captivating universe of 20,000 leagues under the seas, this limited edition expresses all S.T. Dupont’s expertise. Published in 1870, the novel recounts the journey of three castaways captured by Captain Nemo, this mysterious inventor who travels the seabed aboard the Nautilus, a submarine very ahead of the technologies of the time. Windows, turbines, corals, fins and other tentacles of giant squid inspire this limited edition and its three ranges, all related to different chapters of the book. A three-part story in which to dive with passion. The Prestige range evokes the philosophy of chapter 8, «Mobilis in Mobile», where the adventure truly begins. It is in this latter that Captain Nemo introduces the Nautilus to the three passengers he has captured. He then reveals to them the motto of his submarine: «Mobilis in Mobile» or «Mobile in the mobile element», a way to illustrate the movements of the submarine navigating at the heart of the largest "mobile element" on earth: the sea. Set consisting of a multifunction pen Line D Eternity XL and a lighter Le Grand Dupont. Pen Line D Eternity XL: Line D Eternity XL multifunction composed of a roller sleeve and a 14-carat gold nib sleeve. Piston included. Shiny blue S.T. Dupont lacquered pen with squid tentacle engraved in gold-finish placed lacquer. Cap adorned with nageroires and the N of Nautilus in placed lacquer. Agrafe inspired by a navigation compass. Top of the cap inspired by a S.T. Dupont blue lacquered porthole, sleeve engraved with the submarine’s rivets, vertical propeller on the bottom of the pen. Associated refills: Roller: 040840 Blue - 040841 Black Felt: 040830 Blue - 040831 Black Ink cartridges: 040112 Blue - 040110 Black - 040362 Red - 040363 Green - 040364 Turquoise Inkwell: 040165 Intense black - 040166 Royal blue -040167 Flamboyant red - 040168 Spring green - 040169 Turquoise - 040170 Night blue Le Grand Dupont Lighter: Shiny blue lacquer Le Grand Dupont lighter with squid tentacle engraved in placed lacquer. Golden finishes. Mobilis decor in mobile. Perforated hat resuming the decor of the Hublot of the Nautilus and adorned with ornaments. Equipped with a double ignition system for yellow flame or blue flame. Associated lighter block: red (REF 900651) Associated gas refill: red (REF 900435) Lighter delivered empty of gas, refill sold separately. Screwdriver included to change the stone. Box consisting of a squid pen holder, a lighter holder and a replica of the Nautilus. Limited and numbered to 200 copies.` },
    collection: `20,000 Leagues Under The Sea`,
    categorySlug: "isqueiros",
    image: `/products/set-collector-20000-leagues/C23050.webp`,
    variants: [
      { sku: `C23050`, name: { pt: `Set Prestige Fire and Writing — Blue Gulf Stream`, en: `Set Prestige Fire and Writing — Blue Gulf Stream` }, priceCents: 490000, currency: "EUR", attributes: { color: { label: { pt: `Blue Gulf Stream`, en: `Blue Gulf Stream` }, hex: ["#1f3c66"] } }, image: `/products/set-collector-20000-leagues/C23050.webp`, images: [`/products/set-collector-20000-leagues/C23050.webp`, `/products/set-collector-20000-leagues/C23050-2.webp`, `/products/set-collector-20000-leagues/C23050-3.webp`, `/products/set-collector-20000-leagues/C23050-4.webp`] },
      { sku: `C2MOBILIS`, name: { pt: `Set Prestige Fire and Writing — Blue Gulf Stream`, en: `Set Prestige Fire and Writing — Blue Gulf Stream` }, priceCents: 958000, currency: "EUR", attributes: { color: { label: { pt: `Blue Gulf Stream`, en: `Blue Gulf Stream` }, hex: ["#1f3c66"] } }, image: `/products/set-collector-20000-leagues/C2MOBILIS.webp`, images: [`/products/set-collector-20000-leagues/C2MOBILIS.webp`, `/products/set-collector-20000-leagues/C2MOBILIS-2.webp`, `/products/set-collector-20000-leagues/C2MOBILIS-3.webp`, `/products/set-collector-20000-leagues/C2MOBILIS-4.webp`] },
    ],
  },
  {
    slug: `set-collector-20000-leagues-2`,
    name: { pt: `Set Writing Instrument Mobilis in Mobile`, en: `Set Writing Instrument Mobilis in Mobile` },
    description: { pt: `Tribute to the captivating universe of 20,000 leagues under the seas, this limited edition expresses all the know-how of S.T. Dupont. Published in 1870, the novel recounts the journey of three castaways captured by Captain Nemo, this mysterious inventor who travels the seabed aboard the Nautilus, submarine very ahead of the technologies of the time. Portholes, turbines, corals, fins and other tentacles of giant squid inspire this limited edition and its three ranges, all related to different chapters of the book. A story in three stages in which to dive with passion. The Prestige range evokes the philosophy of chapter 8, «Mobilis in Mobile», where the adventure truly begins. It is in this latter that Captain Nemo introduces the Nautilus to the three passengers he has captured. He then reveals to them the motto of his submarine: «Mobilis in Mobile» or «Mobile dans l'élément mobile», a way to illustrate the movements of the submarine navigating at the heart of the largest "mobile element" on earth: the sea. Set consisting of a multifunction Line D Eternity XL pen, a squid holder and a replica of the Nautilus. Line D Eternity XL multifunction composed of a roller sleeve and a 14-carat gold feather sleeve. Piston included. Shiny blue S.T. Dupont lacquered pen with squid tentacle engraved in gold-finish placed lacquer. Cap adorned with nageroires and the N of Nautilus in placed lacquer. Agrafe inspired by a navigation compass. Blue S.T. Dupont lacquered porthole top cap, sleeve engraved with the submarine rivets, vertical propeller on the bottom of the pen. Limited and numbered to 150 copies. Associated refills: Roller: 040840 Blue - 040841 Black Felt: 040830 Blue - 040831 Black Ink cartridges: 040112 Blue - 040110 Black - 040362 Red - 040363 Green - 040364 Turquoise Inkwell: 040165 Intense black - 040166 Royal blue -040167 Flamboyant red - 040168 Spring green - 040169 Turquoise - 040170 Night blue`, en: `Tribute to the captivating universe of 20,000 leagues under the seas, this limited edition expresses all the know-how of S.T. Dupont. Published in 1870, the novel recounts the journey of three castaways captured by Captain Nemo, this mysterious inventor who travels the seabed aboard the Nautilus, submarine very ahead of the technologies of the time. Portholes, turbines, corals, fins and other tentacles of giant squid inspire this limited edition and its three ranges, all related to different chapters of the book. A story in three stages in which to dive with passion. The Prestige range evokes the philosophy of chapter 8, «Mobilis in Mobile», where the adventure truly begins. It is in this latter that Captain Nemo introduces the Nautilus to the three passengers he has captured. He then reveals to them the motto of his submarine: «Mobilis in Mobile» or «Mobile dans l'élément mobile», a way to illustrate the movements of the submarine navigating at the heart of the largest "mobile element" on earth: the sea. Set consisting of a multifunction Line D Eternity XL pen, a squid holder and a replica of the Nautilus. Line D Eternity XL multifunction composed of a roller sleeve and a 14-carat gold feather sleeve. Piston included. Shiny blue S.T. Dupont lacquered pen with squid tentacle engraved in gold-finish placed lacquer. Cap adorned with nageroires and the N of Nautilus in placed lacquer. Agrafe inspired by a navigation compass. Blue S.T. Dupont lacquered porthole top cap, sleeve engraved with the submarine rivets, vertical propeller on the bottom of the pen. Limited and numbered to 150 copies. Associated refills: Roller: 040840 Blue - 040841 Black Felt: 040830 Blue - 040831 Black Ink cartridges: 040112 Blue - 040110 Black - 040362 Red - 040363 Green - 040364 Turquoise Inkwell: 040165 Intense black - 040166 Royal blue -040167 Flamboyant red - 040168 Spring green - 040169 Turquoise - 040170 Night blue` },
    collection: `20,000 Leagues Under The Sea`,
    categorySlug: "escrita",
    image: `/products/set-collector-20000-leagues-2/420050XL.webp`,
    variants: [
      { sku: `420050XL`, name: { pt: `Set Writing Instrument Mobilis in Mobile — Blue Gulf Stream`, en: `Set Writing Instrument Mobilis in Mobile — Blue Gulf Stream` }, priceCents: 494000, currency: "EUR", attributes: { color: { label: { pt: `Blue Gulf Stream`, en: `Blue Gulf Stream` }, hex: ["#1f3c66"] } }, image: `/products/set-collector-20000-leagues-2/420050XL.webp`, images: [`/products/set-collector-20000-leagues-2/420050XL.webp`, `/products/set-collector-20000-leagues-2/420050XL-2.webp`, `/products/set-collector-20000-leagues-2/420050XL-3.webp`, `/products/set-collector-20000-leagues-2/420050XL-4.webp`] },
    ],
  },
  {
    slug: `ligne-2-stones-of-fortune`,
    name: { pt: `Stone of Fortune`, en: `Stone of Fortune` },
    description: { pt: `‘Malachite lighter - Vitality With its refined design and deep sparkle, the Ligne 2 Malachite lighter embodies vitality and energy. Its diamond-tipped guilloché, enhanced by palladium finishes, gives it a unique elegance. Its double yellow flame guarantees perfect ignition, and its opening reveals the legendary ‘Cling’, the signature sound of S.T. Dupont. Dupont's signature sound. Lighter produced in 88 pieces; Associated lighter stone: Black (REF 900600) Associated gas refill: Grey and Red (REF 900435) Delivered empty of gas, refill sold separately. Numbered 87/88`, en: `‘Malachite lighter - Vitality With its refined design and deep sparkle, the Ligne 2 Malachite lighter embodies vitality and energy. Its diamond-tipped guilloché, enhanced by palladium finishes, gives it a unique elegance. Its double yellow flame guarantees perfect ignition, and its opening reveals the legendary ‘Cling’, the signature sound of S.T. Dupont. Dupont's signature sound. Lighter produced in 88 pieces; Associated lighter stone: Black (REF 900600) Associated gas refill: Grey and Red (REF 900435) Delivered empty of gas, refill sold separately. Numbered 87/88` },
    collection: `Stones of Fortune`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-stones-of-fortune/C16100.webp`,
    variants: [
      { sku: `C16100`, name: { pt: `Stone of Fortune — Violet`, en: `Stone of Fortune — Violet` }, priceCents: 504000, currency: "EUR", attributes: { color: { label: { pt: `Violet`, en: `Violet` }, hex: ["#6b4a8a"] } }, image: `/products/ligne-2-stones-of-fortune/C16100.webp`, images: [`/products/ligne-2-stones-of-fortune/C16100.webp`, `/products/ligne-2-stones-of-fortune/C16100-2.webp`, `/products/ligne-2-stones-of-fortune/C16100-3.webp`, `/products/ligne-2-stones-of-fortune/C16100-4.webp`] },
      { sku: `C16102`, name: { pt: `Stone of Fortune — Green`, en: `Stone of Fortune — Green` }, priceCents: 504000, currency: "EUR", attributes: { color: { label: { pt: `Green`, en: `Green` }, hex: ["#3b5d39"] } }, image: `/products/ligne-2-stones-of-fortune/C16102.webp`, images: [`/products/ligne-2-stones-of-fortune/C16102.webp`, `/products/ligne-2-stones-of-fortune/C16102-2.webp`, `/products/ligne-2-stones-of-fortune/C16102-3.webp`, `/products/ligne-2-stones-of-fortune/C16102-4.webp`] },
      { sku: `C16103`, name: { pt: `Stone of Fortune — Brown`, en: `Stone of Fortune — Brown` }, priceCents: 504000, currency: "EUR", attributes: { color: { label: { pt: `Brown`, en: `Brown` }, hex: ["#6b4a2a"] } }, image: `/products/ligne-2-stones-of-fortune/C16103.webp`, images: [`/products/ligne-2-stones-of-fortune/C16103.webp`, `/products/ligne-2-stones-of-fortune/C16103-2.webp`, `/products/ligne-2-stones-of-fortune/C16103-3.webp`, `/products/ligne-2-stones-of-fortune/C16103-4.webp`] },
      { sku: `C16101`, name: { pt: `Stone of Fortune — Red`, en: `Stone of Fortune — Red` }, priceCents: 504000, currency: "EUR", attributes: { color: { label: { pt: `Red`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/ligne-2-stones-of-fortune/C16101.webp`, images: [`/products/ligne-2-stones-of-fortune/C16101.webp`, `/products/ligne-2-stones-of-fortune/C16101-2.webp`, `/products/ligne-2-stones-of-fortune/C16101-3.webp`, `/products/ligne-2-stones-of-fortune/C16101-4.webp`] },
      { sku: `C16106`, name: { pt: `Stone of Fortune — Violet`, en: `Stone of Fortune — Violet` }, priceCents: 504000, currency: "EUR", attributes: { color: { label: { pt: `Violet`, en: `Violet` }, hex: ["#6b4a8a"] } }, image: `/products/ligne-2-stones-of-fortune/C16106.webp`, images: [`/products/ligne-2-stones-of-fortune/C16106.webp`, `/products/ligne-2-stones-of-fortune/C16106-2.webp`, `/products/ligne-2-stones-of-fortune/C16106-3.webp`, `/products/ligne-2-stones-of-fortune/C16106-4.webp`] },
      { sku: `C16104`, name: { pt: `Stone of Fortune — Brown`, en: `Stone of Fortune — Brown` }, priceCents: 504000, currency: "EUR", attributes: { color: { label: { pt: `Brown`, en: `Brown` }, hex: ["#6b4a2a"] } }, image: `/products/ligne-2-stones-of-fortune/C16104.webp`, images: [`/products/ligne-2-stones-of-fortune/C16104.webp`, `/products/ligne-2-stones-of-fortune/C16104-2.webp`, `/products/ligne-2-stones-of-fortune/C16104-3.webp`, `/products/ligne-2-stones-of-fortune/C16104-4.webp`] },
      { sku: `C16107`, name: { pt: `Stone of Fortune — Red`, en: `Stone of Fortune — Red` }, priceCents: 504000, currency: "EUR", attributes: { color: { label: { pt: `Red`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/ligne-2-stones-of-fortune/C16107.webp`, images: [`/products/ligne-2-stones-of-fortune/C16107.webp`, `/products/ligne-2-stones-of-fortune/C16107-2.webp`, `/products/ligne-2-stones-of-fortune/C16107-3.webp`, `/products/ligne-2-stones-of-fortune/C16107-4.webp`] },
      { sku: `C16105`, name: { pt: `Stone of Fortune — Blue`, en: `Stone of Fortune — Blue` }, priceCents: 504000, currency: "EUR", attributes: { color: { label: { pt: `Blue`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/ligne-2-stones-of-fortune/C16105.webp`, images: [`/products/ligne-2-stones-of-fortune/C16105.webp`, `/products/ligne-2-stones-of-fortune/C16105-2.webp`, `/products/ligne-2-stones-of-fortune/C16105-3.webp`, `/products/ligne-2-stones-of-fortune/C16105-4.webp`] },
    ],
  },
  {
    slug: `victoria`,
    name: { pt: `Wallet`, en: `Wallet` },
    description: { pt: `With Victoria, S.T. Dupont revisits its heritage with confidence: clean lines, sumptuous leather, and a resolutely contemporary look. A nod to Queen Victoria, a woman of power and an iconic customer of the House, this bag is not just an accessory—it is a statement. Designed to accompany those who live life to the fullest, it combines freedom of movement and elegance, with a laptop in one hand and lipstick in the other. Its generous size effortlessly accommodates a 14-inch laptop, while a removable zipped pouch keeps essentials perfectly organized. Its clasp, inspired by the famous S.T. Dupont lighter, its “mini Fire-X” guilloche under lacquer, and its “diamond point” motif embossed border pay homage to the House's expertise in goldsmithing and trunk-making. A smart, structured, and assertive tote bag, designed to keep up with the frenetic pace of your days without ever compromising your style.`, en: `With Victoria, S.T. Dupont revisits its heritage with confidence: clean lines, sumptuous leather, and a resolutely contemporary look. A nod to Queen Victoria, a woman of power and an iconic customer of the House, this bag is not just an accessory—it is a statement. Designed to accompany those who live life to the fullest, it combines freedom of movement and elegance, with a laptop in one hand and lipstick in the other. Its generous size effortlessly accommodates a 14-inch laptop, while a removable zipped pouch keeps essentials perfectly organized. Its clasp, inspired by the famous S.T. Dupont lighter, its “mini Fire-X” guilloche under lacquer, and its “diamond point” motif embossed border pay homage to the House's expertise in goldsmithing and trunk-making. A smart, structured, and assertive tote bag, designed to keep up with the frenetic pace of your days without ever compromising your style.` },
    collection: `Victoria`,
    categorySlug: "pele",
    image: `/products/victoria/1VI333BE1.webp`,
    variants: [
      { sku: `1VI333BE1`, name: { pt: `Wallet — Beige`, en: `Wallet — Beige` }, priceCents: 100000, currency: "EUR", attributes: { color: { label: { pt: `Beige`, en: `Beige` }, hex: ["#7a7d83"] } }, image: `/products/victoria/1VI333BE1.webp`, images: [`/products/victoria/1VI333BE1.webp`, `/products/victoria/1VI333BE1-2.webp`, `/products/victoria/1VI333BE1-3.webp`, `/products/victoria/1VI333BE1-4.webp`] },
      { sku: `1VI333BK1`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 100000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/victoria/1VI333BK1.webp`, images: [`/products/victoria/1VI333BK1.webp`, `/products/victoria/1VI333BK1-2.webp`, `/products/victoria/1VI333BK1-3.webp`, `/products/victoria/1VI333BK1-4.webp`] },
      { sku: `1VI333RD1`, name: { pt: `Wallet — Burgundy`, en: `Wallet — Burgundy` }, priceCents: 100000, currency: "EUR", attributes: { color: { label: { pt: `Burgundy`, en: `Burgundy` }, hex: ["#7d2b27"] } }, image: `/products/victoria/1VI333RD1.webp`, images: [`/products/victoria/1VI333RD1.webp`, `/products/victoria/1VI333RD1-2.webp`, `/products/victoria/1VI333RD1-3.webp`, `/products/victoria/1VI333RD1-4.webp`] },
      { sku: `1VI514BK1`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 35500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/victoria/1VI514BK1.webp`, images: [`/products/victoria/1VI514BK1.webp`, `/products/victoria/1VI514BK1-2.webp`, `/products/victoria/1VI514BK1-3.webp`] },
      { sku: `1VI514BE1`, name: { pt: `Wallet — Beige`, en: `Wallet — Beige` }, priceCents: 35500, currency: "EUR", attributes: { color: { label: { pt: `Beige`, en: `Beige` }, hex: ["#7a7d83"] } }, image: `/products/victoria/1VI514BE1.webp`, images: [`/products/victoria/1VI514BE1.webp`, `/products/victoria/1VI514BE1-2.webp`, `/products/victoria/1VI514BE1-3.webp`] },
      { sku: `1VI514RD1`, name: { pt: `Wallet — Red`, en: `Wallet — Red` }, priceCents: 35500, currency: "EUR", attributes: { color: { label: { pt: `Red`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/victoria/1VI514RD1.webp`, images: [`/products/victoria/1VI514RD1.webp`, `/products/victoria/1VI514RD1-2.webp`, `/products/victoria/1VI514RD1-3.webp`] },
      { sku: `1VI592BK1`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 49500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/victoria/1VI592BK1.webp`, images: [`/products/victoria/1VI592BK1.webp`, `/products/victoria/1VI592BK1-2.webp`, `/products/victoria/1VI592BK1-3.webp`] },
    ],
  },
  {
    slug: `defi-explorer-3`,
    name: { pt: `Travel bag`, en: `Travel bag` },
    description: { pt: `Spacious and durable, this travel bag in water-repellent technical canvas and structured leather is designed to accompany every getaway. Lightweight and functional, it features a large main compartment. Its outdoor-inspired finishes give it an assertive style, between elegance and performance. Available in khaki or black. Made in Italy`, en: `Spacious and durable, this travel bag in water-repellent technical canvas and structured leather is designed to accompany every getaway. Lightweight and functional, it features a large main compartment. Its outdoor-inspired finishes give it an assertive style, between elegance and performance. Available in khaki or black. Made in Italy` },
    collection: `Défi Explorer`,
    categorySlug: "pele",
    image: `/products/defi-explorer-3/1IC231NK1.webp`,
    variants: [
      { sku: `1IC231NK1`, name: { pt: `Travel bag — Green & Khaki`, en: `Travel bag — Green & Khaki` }, priceCents: 130000, currency: "EUR", attributes: { color: { label: { pt: `Green & Khaki`, en: `Green & Khaki` }, hex: ["#3b5d39"] } }, image: `/products/defi-explorer-3/1IC231NK1.webp`, images: [`/products/defi-explorer-3/1IC231NK1.webp`, `/products/defi-explorer-3/1IC231NK1-2.webp`, `/products/defi-explorer-3/1IC231NK1-3.webp`, `/products/defi-explorer-3/1IC231NK1-4.webp`] },
    ],
  },
  {
    slug: `neo-capsule-3`,
    name: { pt: `Wallet`, en: `Wallet` },
    description: { pt: `Wallet with coin pocket from the Néo Capsule collection in full-grain grained leather. Four card slots, a pocket with a snap button closure for coins. All products from the Néo Capsule collection are certified by the Leather Working Group.`, en: `Wallet with coin pocket from the Néo Capsule collection in full-grain grained leather. Four card slots, a pocket with a snap button closure for coins. All products from the Néo Capsule collection are certified by the Leather Working Group.` },
    collection: `Neo-capsule`,
    categorySlug: "pele",
    image: `/products/neo-capsule-3/1NC571BK1.webp`,
    variants: [
      { sku: `1NC571BK1`, name: { pt: `Wallet — Black`, en: `Wallet — Black` }, priceCents: 38500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/neo-capsule-3/1NC571BK1.webp`, images: [`/products/neo-capsule-3/1NC571BK1.webp`, `/products/neo-capsule-3/1NC571BK1-2.webp`] },
    ],
  },  // === END WWW STORE IMPORTS ===

  // === BEGIN WWW CIGAR CUTTERS (www.st-dupont.com) ===
  {
    slug: `cutter-003480h`,
    name: { pt: `Cigar Cutter`, en: `Cigar Cutter` },
    description: { pt: `On the occasion of the 2026 Chinese New Year, under the sign of the Fire Horse, S.T. Dupont unveils Horse, a flamboyant collection embodying charisma, majesty, and passion. The “mane” guilloché and equine sculpture elegantly evoke the traditions of Chinese culture. Cigar stand in high-gloss red lacquer, decorated with the “horse mane” motif. Blade engraved with the Fire Horse motif. Gold-plated finish.`, en: `On the occasion of the 2026 Chinese New Year, under the sign of the Fire Horse, S.T. Dupont unveils Horse, a flamboyant collection embodying charisma, majesty, and passion. The “mane” guilloché and equine sculpture elegantly evoke the traditions of Chinese culture. Cigar stand in high-gloss red lacquer, decorated with the “horse mane” motif. Blade engraved with the Fire Horse motif. Gold-plated finish.` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003480h/003480H.webp`,
    variants: [
      { sku: `003480H`, name: { pt: `Cigar Cutter — Red`, en: `Cigar Cutter — Red` }, priceCents: 24000, currency: "EUR", attributes: { color: { label: { pt: `Red`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/cutter-003480h/003480H.webp`, images: [`/products/cutter-003480h/003480H.webp`, `/products/cutter-003480h/003480H-2.webp`, `/products/cutter-003480h/003480H-3.webp`] },
    ],
  },
  {
    slug: `cutter-003488h`,
    name: { pt: `Cigar Cutter`, en: `Cigar Cutter` },
    description: { pt: `On the occasion of the 2026 Chinese New Year, under the sign of the Fire Horse, S.T. Dupont unveils Horse, a flamboyant collection embodying charisma, majesty, and passion. The “mane” guilloché and equine sculpture elegantly evoke the traditions of Chinese culture. Cigar stand in high-gloss black lacquer, decorated with the “horse mane” motif. Blade engraved with the Fire Horse motif. Chrome-plated finish.`, en: `On the occasion of the 2026 Chinese New Year, under the sign of the Fire Horse, S.T. Dupont unveils Horse, a flamboyant collection embodying charisma, majesty, and passion. The “mane” guilloché and equine sculpture elegantly evoke the traditions of Chinese culture. Cigar stand in high-gloss black lacquer, decorated with the “horse mane” motif. Blade engraved with the Fire Horse motif. Chrome-plated finish.` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003488h/003488H.webp`,
    variants: [
      { sku: `003488H`, name: { pt: `Cigar Cutter — Black`, en: `Cigar Cutter — Black` }, priceCents: 24000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/cutter-003488h/003488H.webp`, images: [`/products/cutter-003488h/003488H.webp`, `/products/cutter-003488h/003488H-2.webp`, `/products/cutter-003488h/003488H-3.webp`] },
    ],
  },
  {
    slug: `cutter-003415`,
    name: { pt: `Cigar stand`, en: `Cigar stand` },
    description: { pt: `pCigar stand cutter with a double blade and a stand to place your cigar. Decorated with a diamond point, chrome finish, and black lacquer./p`, en: `pCigar stand cutter with a double blade and a stand to place your cigar. Decorated with a diamond point, chrome finish, and black lacquer./p` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003415/003415.webp`,
    variants: [
      { sku: `003415`, name: { pt: `Cigar stand — Black & Silver`, en: `Cigar stand — Black & Silver` }, priceCents: 22000, currency: "EUR", attributes: { color: { label: { pt: `Black & Silver`, en: `Black & Silver` }, hex: ["#15171c"] } }, image: `/products/cutter-003415/003415.webp`, images: [`/products/cutter-003415/003415.webp`, `/products/cutter-003415/003415-2.webp`, `/products/cutter-003415/003415-3.webp`, `/products/cutter-003415/003415-4.webp`] },
    ],
  },
  {
    slug: `cutter-003393`,
    name: { pt: `Cigar stand`, en: `Cigar stand` },
    description: { pt: `Cigar stand cutter with a double blade and a stand to place your cigar. Decorated with a diamond point, gold finish, and black lacquer.`, en: `Cigar stand cutter with a double blade and a stand to place your cigar. Decorated with a diamond point, gold finish, and black lacquer.` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003393/003393.webp`,
    variants: [
      { sku: `003393`, name: { pt: `Cigar stand — Black & Golden`, en: `Cigar stand — Black & Golden` }, priceCents: 22000, currency: "EUR", attributes: { color: { label: { pt: `Black & Golden`, en: `Black & Golden` }, hex: ["#15171c"] } }, image: `/products/cutter-003393/003393.webp`, images: [`/products/cutter-003393/003393.webp`, `/products/cutter-003393/003393-2.webp`, `/products/cutter-003393/003393-3.webp`] },
    ],
  },
  {
    slug: `cutter-003435`,
    name: { pt: `Cigar stand`, en: `Cigar stand` },
    description: { pt: `The cigar cutter stand is lacquered with a blue gradient, the logo of the prestigious Montecristo cigar brand is stamped on the blade face, while the other blade face features a silver sun and moon decoration. The collection includes 3 lighters: Line 2, Le Grand Dupont, Maxijet. Also, two pens from the Line D Large collection and accessories: a leather case for three cigars, a cigar cutter and a pair of cufflinks.`, en: `The cigar cutter stand is lacquered with a blue gradient, the logo of the prestigious Montecristo cigar brand is stamped on the blade face, while the other blade face features a silver sun and moon decoration. The collection includes 3 lighters: Line 2, Le Grand Dupont, Maxijet. Also, two pens from the Line D Large collection and accessories: a leather case for three cigars, a cigar cutter and a pair of cufflinks.` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003435/003435.webp`,
    variants: [
      { sku: `003435`, name: { pt: `Cigar stand — Dark Blue`, en: `Cigar stand — Dark Blue` }, priceCents: 21000, currency: "EUR", attributes: { color: { label: { pt: `Dark Blue`, en: `Dark Blue` }, hex: ["#1f3c66"] } }, image: `/products/cutter-003435/003435.webp`, images: [`/products/cutter-003435/003435.webp`, `/products/cutter-003435/003435-2.webp`, `/products/cutter-003435/003435-3.webp`] },
    ],
  },
  {
    slug: `cutter-003434`,
    name: { pt: `Cigar stand`, en: `Cigar stand` },
    description: { pt: `Montecristo and S.T. Dupont, both synonymous with unique craftsmanship, have joined forces to create exceptional products. This new collection will delight fans of both brands. The cigar cutter stand is lacquered with a violet gradient, the logo of the prestigious Montecristo cigar brand is stamped on the blade face, while the other blade face features a golden sun and moon decoration. The collection includes 3 lighters: Line 2, Le Grand Dupont, Maxijet. Also, two pens from the Line D Large collection and accessories: a leather case for three cigars, a cigar cutter and a pair of cufflinks.`, en: `Montecristo and S.T. Dupont, both synonymous with unique craftsmanship, have joined forces to create exceptional products. This new collection will delight fans of both brands. The cigar cutter stand is lacquered with a violet gradient, the logo of the prestigious Montecristo cigar brand is stamped on the blade face, while the other blade face features a golden sun and moon decoration. The collection includes 3 lighters: Line 2, Le Grand Dupont, Maxijet. Also, two pens from the Line D Large collection and accessories: a leather case for three cigars, a cigar cutter and a pair of cufflinks.` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003434/003434.webp`,
    variants: [
      { sku: `003434`, name: { pt: `Cigar stand — Violet`, en: `Cigar stand — Violet` }, priceCents: 21000, currency: "EUR", attributes: { color: { label: { pt: `Violet`, en: `Violet` }, hex: ["#6b4a8a"] } }, image: `/products/cutter-003434/003434.webp`, images: [`/products/cutter-003434/003434.webp`, `/products/cutter-003434/003434-2.webp`, `/products/cutter-003434/003434-3.webp`, `/products/cutter-003434/003434-4.webp`] },
    ],
  },
  {
    slug: `cutter-003478`,
    name: { pt: `Cigar Stand`, en: `Cigar Stand` },
    description: { pt: `Craftsmanship in metal, as well as the art of lacquer and coated leather, showcase the expertise of S.T. Dupont in the Monogram 1872 collection. Well-rooted in their time, the pieces in the collection all feature the new S.T. Dupont logo—upright, determined, and proud. Cigar cutter stand decorated with the Monogram 1872 pattern in burgundy and gold finishes.`, en: `Craftsmanship in metal, as well as the art of lacquer and coated leather, showcase the expertise of S.T. Dupont in the Monogram 1872 collection. Well-rooted in their time, the pieces in the collection all feature the new S.T. Dupont logo—upright, determined, and proud. Cigar cutter stand decorated with the Monogram 1872 pattern in burgundy and gold finishes.` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003478/003478.webp`,
    variants: [
      { sku: `003478`, name: { pt: `Cigar Stand — Burgundy`, en: `Cigar Stand — Burgundy` }, priceCents: 24000, currency: "EUR", attributes: { color: { label: { pt: `Burgundy`, en: `Burgundy` }, hex: ["#7d2b27"] } }, image: `/products/cutter-003478/003478.webp`, images: [`/products/cutter-003478/003478.webp`, `/products/cutter-003478/003478-2.webp`, `/products/cutter-003478/003478-3.webp`] },
    ],
  },
  {
    slug: `cutter-003479`,
    name: { pt: `Cigar Stand`, en: `Cigar Stand` },
    description: { pt: `Craftsmanship in metal, as well as the art of lacquer and coated leather, showcase the expertise of S.T. Dupont in the Monogram 1872 collection. Well-rooted in their time, the pieces in the collection all feature the new S.T. Dupont logo—upright, determined, and proud. Cigar cutter stand decorated with the Monogram 1872 pattern in black and gold finishes.`, en: `Craftsmanship in metal, as well as the art of lacquer and coated leather, showcase the expertise of S.T. Dupont in the Monogram 1872 collection. Well-rooted in their time, the pieces in the collection all feature the new S.T. Dupont logo—upright, determined, and proud. Cigar cutter stand decorated with the Monogram 1872 pattern in black and gold finishes.` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003479/003479.webp`,
    variants: [
      { sku: `003479`, name: { pt: `Cigar Stand — Black`, en: `Cigar Stand — Black` }, priceCents: 24000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/cutter-003479/003479.webp`, images: [`/products/cutter-003479/003479.webp`, `/products/cutter-003479/003479-2.webp`, `/products/cutter-003479/003479-3.webp`] },
    ],
  },
  {
    slug: `cutter-003480m`,
    name: { pt: `Cigar Stand`, en: `Cigar Stand` },
    description: { pt: `Craftsmanship in metal, as well as the art of lacquer and coated leather, showcase the expertise of S.T. Dupont in the Monogram 1872 collection. Well-rooted in their time, the pieces in the collection all feature the new S.T. Dupont logo—upright, determined, and proud. Cigar cutter stand decorated with the Monogram 1872 pattern in gray and silver finishes.`, en: `Craftsmanship in metal, as well as the art of lacquer and coated leather, showcase the expertise of S.T. Dupont in the Monogram 1872 collection. Well-rooted in their time, the pieces in the collection all feature the new S.T. Dupont logo—upright, determined, and proud. Cigar cutter stand decorated with the Monogram 1872 pattern in gray and silver finishes.` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003480m/003480M.webp`,
    variants: [
      { sku: `003480M`, name: { pt: `Cigar Stand — Grey & Light Gray`, en: `Cigar Stand — Grey & Light Gray` }, priceCents: 24000, currency: "EUR", attributes: { color: { label: { pt: `Grey & Light Gray`, en: `Grey & Light Gray` }, hex: ["#7a7d83"] } }, image: `/products/cutter-003480m/003480M.webp`, images: [`/products/cutter-003480m/003480M.webp`, `/products/cutter-003480m/003480M-2.webp`] },
    ],
  },
  {
    slug: `cutter-003475`,
    name: { pt: `Cigar Stand`, en: `Cigar Stand` },
    description: { pt: `To celebrate the Chinese New Year, S.T. Dupont imagines a collection inspired by the snake, the astrological sign of the year 2025. This collection showcases a unique guilloché pattern evoking the animal's scales, enhanced by meticulous lacquer work. Once again, the house demonstrates the audacity, sophistication, and craftsmanship that set it apart. Cigar Cutter in metal, decorated with the red Snake motif, with a gold finish`, en: `To celebrate the Chinese New Year, S.T. Dupont imagines a collection inspired by the snake, the astrological sign of the year 2025. This collection showcases a unique guilloché pattern evoking the animal's scales, enhanced by meticulous lacquer work. Once again, the house demonstrates the audacity, sophistication, and craftsmanship that set it apart. Cigar Cutter in metal, decorated with the red Snake motif, with a gold finish` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003475/003475.webp`,
    variants: [
      { sku: `003475`, name: { pt: `Cigar Stand — Red`, en: `Cigar Stand — Red` }, priceCents: 23500, currency: "EUR", attributes: { color: { label: { pt: `Red`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/cutter-003475/003475.webp`, images: [`/products/cutter-003475/003475.webp`, `/products/cutter-003475/003475-2.webp`, `/products/cutter-003475/003475-3.webp`] },
    ],
  },
  {
    slug: `cutter-003476`,
    name: { pt: `Cigar Stand`, en: `Cigar Stand` },
    description: { pt: `To celebrate the Chinese New Year, S.T. Dupont imagines a collection inspired by the snake, the astrological sign of the year 2025. This collection showcases a unique guilloché pattern evoking the animal's scales, enhanced by meticulous lacquer work. Once again, the house demonstrates the audacity, sophistication, and craftsmanship that set it apart. Cigar Cutter in metal, decorated with the black Snake motif, with a gold finish`, en: `To celebrate the Chinese New Year, S.T. Dupont imagines a collection inspired by the snake, the astrological sign of the year 2025. This collection showcases a unique guilloché pattern evoking the animal's scales, enhanced by meticulous lacquer work. Once again, the house demonstrates the audacity, sophistication, and craftsmanship that set it apart. Cigar Cutter in metal, decorated with the black Snake motif, with a gold finish` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003476/003476.webp`,
    variants: [
      { sku: `003476`, name: { pt: `Cigar Stand — Black`, en: `Cigar Stand — Black` }, priceCents: 23500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/cutter-003476/003476.webp`, images: [`/products/cutter-003476/003476.webp`, `/products/cutter-003476/003476-2.webp`, `/products/cutter-003476/003476-3.webp`] },
    ],
  },
  {
    slug: `cutter-003553`,
    name: { pt: `Cigar Stand`, en: `Cigar Stand` },
    description: { pt: `Stand cigar cutter with double blade and holder for your cigar. Decorated with a diamond tip, gold finish and black lacquer.`, en: `Stand cigar cutter with double blade and holder for your cigar. Decorated with a diamond tip, gold finish and black lacquer.` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003553/003553.webp`,
    variants: [
      { sku: `003553`, name: { pt: `Cigar Stand — Black & Golden`, en: `Cigar Stand — Black & Golden` }, priceCents: 22000, currency: "EUR", attributes: { color: { label: { pt: `Black & Golden`, en: `Black & Golden` }, hex: ["#15171c"] } }, image: `/products/cutter-003553/003553.webp`, images: [`/products/cutter-003553/003553.webp`, `/products/cutter-003553/003553-2.webp`, `/products/cutter-003553/003553-3.webp`] },
    ],
  },
  {
    slug: `cutter-003441`,
    name: { pt: `Cigar stand`, en: `Cigar stand` },
    description: { pt: `Tribute to the captivating universe of 20,000 leagues under the seas, this limited edition expresses all the know-how of S.T. Dupont. Published in 1870, the novel recounts the journey of three castaways captured by Captain Nemo, this mysterious inventor who travels the seabed aboard the Nautilus, submarine very ahead of the technologies of the time. Portholes, turbines, corals, fins and other tentacles of giant squid inspire this limited edition and its three ranges, all related to different chapters of the book. A story in three stages in which to dive with passion. For the Premium range of this edition 20,000 leagues under the seas, S.T. Dupont tells two other chapters: «4000 leagues under the Pacific», chapter 18 of the book, and «Gulf Stream», chapter 19 of its second part. In the latter, Jules Verne evokes the Gulf Stream, a natural force shaping the movement of the oceans and those who are there. Fast-moving and perilous, it also allows Captain Nemo to demonstrate his excellence. Cigar cutters stand decorated with a blue lacquer and the engraved Nautilus logo, chrome and shiny finishes.`, en: `Tribute to the captivating universe of 20,000 leagues under the seas, this limited edition expresses all the know-how of S.T. Dupont. Published in 1870, the novel recounts the journey of three castaways captured by Captain Nemo, this mysterious inventor who travels the seabed aboard the Nautilus, submarine very ahead of the technologies of the time. Portholes, turbines, corals, fins and other tentacles of giant squid inspire this limited edition and its three ranges, all related to different chapters of the book. A story in three stages in which to dive with passion. For the Premium range of this edition 20,000 leagues under the seas, S.T. Dupont tells two other chapters: «4000 leagues under the Pacific», chapter 18 of the book, and «Gulf Stream», chapter 19 of its second part. In the latter, Jules Verne evokes the Gulf Stream, a natural force shaping the movement of the oceans and those who are there. Fast-moving and perilous, it also allows Captain Nemo to demonstrate his excellence. Cigar cutters stand decorated with a blue lacquer and the engraved Nautilus logo, chrome and shiny finishes.` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003441/003441.webp`,
    variants: [
      { sku: `003441`, name: { pt: `Cigar stand — Blue Gulf Stream`, en: `Cigar stand — Blue Gulf Stream` }, priceCents: 23500, currency: "EUR", attributes: { color: { label: { pt: `Blue Gulf Stream`, en: `Blue Gulf Stream` }, hex: ["#1f3c66"] } }, image: `/products/cutter-003441/003441.webp`, images: [`/products/cutter-003441/003441.webp`, `/products/cutter-003441/003441-2.webp`, `/products/cutter-003441/003441-3.webp`] },
    ],
  },
  {
    slug: `cutter-003442`,
    name: { pt: `Cigar stand`, en: `Cigar stand` },
    description: { pt: `Tribute to the captivating universe of 20,000 leagues under the seas, this limited edition expresses all the know-how of S.T. Dupont. Published in 1870, the novel recounts the journey of three castaways captured by Captain Nemo, this mysterious inventor who travels the seabed aboard the Nautilus, submarine very ahead of the technologies of the time. Portholes, turbines, corals, fins and other tentacles of giant squid inspire this limited edition and its three ranges, all related to different chapters of the book. A story in three stages in which to dive with passion. For the Premium range of this edition 20,000 leagues under the seas, S.T. Dupont tells two other chapters: «4000 leagues under the Pacific», chapter 18 of the book, and «Gulf Stream», chapter 19 of its second part. "4000 Leagues Under the Pacific" marks the moment when the Nautilus reaches great depths and its crew discovers the immensity of the underwater world, between transparent waters and marine depths. Cigar cutters stand decorated with a turquoise lacquer and the engraved Nautilus logo, golden and shiny finishes.`, en: `Tribute to the captivating universe of 20,000 leagues under the seas, this limited edition expresses all the know-how of S.T. Dupont. Published in 1870, the novel recounts the journey of three castaways captured by Captain Nemo, this mysterious inventor who travels the seabed aboard the Nautilus, submarine very ahead of the technologies of the time. Portholes, turbines, corals, fins and other tentacles of giant squid inspire this limited edition and its three ranges, all related to different chapters of the book. A story in three stages in which to dive with passion. For the Premium range of this edition 20,000 leagues under the seas, S.T. Dupont tells two other chapters: «4000 leagues under the Pacific», chapter 18 of the book, and «Gulf Stream», chapter 19 of its second part. "4000 Leagues Under the Pacific" marks the moment when the Nautilus reaches great depths and its crew discovers the immensity of the underwater world, between transparent waters and marine depths. Cigar cutters stand decorated with a turquoise lacquer and the engraved Nautilus logo, golden and shiny finishes.` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003442/003442.webp`,
    variants: [
      { sku: `003442`, name: { pt: `Cigar stand — Green Pacific`, en: `Cigar stand — Green Pacific` }, priceCents: 23500, currency: "EUR", attributes: { color: { label: { pt: `Green Pacific`, en: `Green Pacific` }, hex: ["#3b5d39"] } }, image: `/products/cutter-003442/003442.webp`, images: [`/products/cutter-003442/003442.webp`, `/products/cutter-003442/003442-2.webp`, `/products/cutter-003442/003442-3.webp`] },
    ],
  },
  {
    slug: `cutter-003460f`,
    name: { pt: `cigar stand`, en: `cigar stand` },
    description: { pt: `Cigar Cutter Stand - Black glossy lacquer decorated with the multicolor X monogram and Opus X Fuente crest engraved on the front blade; iconic D engraving on the rear blade. Diamond-point guilloché. Gold finishes.`, en: `Cigar Cutter Stand - Black glossy lacquer decorated with the multicolor X monogram and Opus X Fuente crest engraved on the front blade; iconic D engraving on the rear blade. Diamond-point guilloché. Gold finishes.` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003460f/003460F.webp`,
    variants: [
      { sku: `003460F`, name: { pt: `cigar stand — Multicolor`, en: `cigar stand — Multicolor` }, priceCents: 23500, currency: "EUR", attributes: { color: { label: { pt: `Multicolor`, en: `Multicolor` }, hex: ["#c8a24a"] } }, image: `/products/cutter-003460f/003460F.webp`, images: [`/products/cutter-003460f/003460F.webp`, `/products/cutter-003460f/003460F-2.webp`, `/products/cutter-003460f/003460F-3.webp`] },
    ],
  },
  {
    slug: `cutter-003445`,
    name: { pt: `Cigare stand`, en: `Cigare stand` },
    description: { pt: `Fender®, the most famous guitar brand in Tokyo, is opening a boutique in the vibrant Harajuku area. On this occasion, and for the second time, S.T. Dupont and Fender® collaborate, imagining a rock line inspired by the know-how of both houses, as well as Japan. With his work of the lacquer inspired by kintsugi, but also the return of an ancient know-how with gold powder applied by hand, this collaboration makes its own the creativity of the musical universe. Fender® cigar cutter with engraved S.T.Dupont logo. Gold finish and glossy lacquer.`, en: `Fender®, the most famous guitar brand in Tokyo, is opening a boutique in the vibrant Harajuku area. On this occasion, and for the second time, S.T. Dupont and Fender® collaborate, imagining a rock line inspired by the know-how of both houses, as well as Japan. With his work of the lacquer inspired by kintsugi, but also the return of an ancient know-how with gold powder applied by hand, this collaboration makes its own the creativity of the musical universe. Fender® cigar cutter with engraved S.T.Dupont logo. Gold finish and glossy lacquer.` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003445/003445.webp`,
    variants: [
      { sku: `003445`, name: { pt: `Cigare stand — Black`, en: `Cigare stand — Black` }, priceCents: 23000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/cutter-003445/003445.webp`, images: [`/products/cutter-003445/003445.webp`, `/products/cutter-003445/003445-2.webp`, `/products/cutter-003445/003445-3.webp`] },
    ],
  },
  {
    slug: `cutter-003550`,
    name: { pt: `Cigare stand`, en: `Cigare stand` },
    description: { pt: `To celebrate the 150th anniversary of Romeo and Julieta, S.T. Dupont signs an exclusive collaboration, inspired by the strength of passion and expertise. A tribute to the art of exceptional cigars and the beauty of timeless objects. Cigar cutters stand decorated with a shiny red lacquer on the front and the coat of arms engraved on the blade. Glossy white lacquer on the back with the iconic engraving D. Golden finishes.`, en: `To celebrate the 150th anniversary of Romeo and Julieta, S.T. Dupont signs an exclusive collaboration, inspired by the strength of passion and expertise. A tribute to the art of exceptional cigars and the beauty of timeless objects. Cigar cutters stand decorated with a shiny red lacquer on the front and the coat of arms engraved on the blade. Glossy white lacquer on the back with the iconic engraving D. Golden finishes.` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003550/003550.webp`,
    variants: [
      { sku: `003550`, name: { pt: `Cigare stand — Burgundy`, en: `Cigare stand — Burgundy` }, priceCents: 23500, currency: "EUR", attributes: { color: { label: { pt: `Burgundy`, en: `Burgundy` }, hex: ["#7d2b27"] } }, image: `/products/cutter-003550/003550.webp`, images: [`/products/cutter-003550/003550.webp`, `/products/cutter-003550/003550-2.webp`, `/products/cutter-003550/003550-3.webp`] },
    ],
  },
  {
    slug: `cutter-003418`,
    name: { pt: `Double blade`, en: `Double blade` },
    description: { pt: `pDouble blade cigar cutter, equipped with a double blade and a V-CUT blade. Chrome finish./p`, en: `pDouble blade cigar cutter, equipped with a double blade and a V-CUT blade. Chrome finish./p` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003418/003418.webp`,
    variants: [
      { sku: `003418`, name: { pt: `Double blade — Silver`, en: `Double blade — Silver` }, priceCents: 20000, currency: "EUR", attributes: { color: { label: { pt: `Silver`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/cutter-003418/003418.webp`, images: [`/products/cutter-003418/003418.webp`, `/products/cutter-003418/003418-2.webp`, `/products/cutter-003418/003418-3.webp`] },
    ],
  },
  {
    slug: `cutter-003451r`,
    name: { pt: `Double blade`, en: `Double blade` },
    description: { pt: `This year, S.T. Dupont is reintroducing the camouflage pattern on its iconic products. For added originality, this camouflage incorporates flames in vibrant shades of red and green, creating a fresh and bold interpretation of this legendary design. Traditional double-blade cigar cutter. Chrome finish and red camouflage pattern.`, en: `This year, S.T. Dupont is reintroducing the camouflage pattern on its iconic products. For added originality, this camouflage incorporates flames in vibrant shades of red and green, creating a fresh and bold interpretation of this legendary design. Traditional double-blade cigar cutter. Chrome finish and red camouflage pattern.` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003451r/003451R.webp`,
    variants: [
      { sku: `003451R`, name: { pt: `Double blade — Red`, en: `Double blade — Red` }, priceCents: 16500, currency: "EUR", attributes: { color: { label: { pt: `Red`, en: `Red` }, hex: ["#7d2b27"] } }, image: `/products/cutter-003451r/003451R.webp`, images: [`/products/cutter-003451r/003451R.webp`, `/products/cutter-003451r/003451R-2.webp`, `/products/cutter-003451r/003451R-3.webp`] },
    ],
  },
  {
    slug: `cutter-003450g`,
    name: { pt: `Double blade`, en: `Double blade` },
    description: { pt: `This year, S.T. Dupont is reintroducing the camouflage pattern on its iconic products. For added originality, this camouflage incorporates flames in vibrant shades of red and green, creating a fresh and bold interpretation of this legendary design. Traditional double-blade cigar cutter. Chrome finish and green camouflage pattern.`, en: `This year, S.T. Dupont is reintroducing the camouflage pattern on its iconic products. For added originality, this camouflage incorporates flames in vibrant shades of red and green, creating a fresh and bold interpretation of this legendary design. Traditional double-blade cigar cutter. Chrome finish and green camouflage pattern.` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003450g/003450G.webp`,
    variants: [
      { sku: `003450G`, name: { pt: `Double blade — Green & Khaki`, en: `Double blade — Green & Khaki` }, priceCents: 16500, currency: "EUR", attributes: { color: { label: { pt: `Green & Khaki`, en: `Green & Khaki` }, hex: ["#3b5d39"] } }, image: `/products/cutter-003450g/003450G.webp`, images: [`/products/cutter-003450g/003450G.webp`, `/products/cutter-003450g/003450G-2.webp`, `/products/cutter-003450g/003450G-3.webp`] },
    ],
  },
  {
    slug: `cutter-003280p`,
    name: { pt: `Double puncher`, en: `Double puncher` },
    description: { pt: `Double puncher cigar cutter, decorated with gloss black lacquer and chrome finish. 2 cutting diameters: 8.6mm and 11.6mm`, en: `Double puncher cigar cutter, decorated with gloss black lacquer and chrome finish. 2 cutting diameters: 8.6mm and 11.6mm` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003280p/003280P.webp`,
    variants: [
      { sku: `003280P`, name: { pt: `Double puncher — Silver`, en: `Double puncher — Silver` }, priceCents: 24000, currency: "EUR", attributes: { color: { label: { pt: `Silver`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/cutter-003280p/003280P.webp`, images: [`/products/cutter-003280p/003280P.webp`, `/products/cutter-003280p/003280P-2.webp`, `/products/cutter-003280p/003280P-3.webp`] },
    ],
  },
  {
    slug: `cutter-003281p`,
    name: { pt: `Double puncher`, en: `Double puncher` },
    description: { pt: `Double puncher cigar cutter, decorated with gloss black lacquer and chrome finish. 2 cutting diameters: 8.6mm and 11.6mm`, en: `Double puncher cigar cutter, decorated with gloss black lacquer and chrome finish. 2 cutting diameters: 8.6mm and 11.6mm` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003281p/003281P.webp`,
    variants: [
      { sku: `003281P`, name: { pt: `Double puncher — Black`, en: `Double puncher — Black` }, priceCents: 25000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/cutter-003281p/003281P.webp`, images: [`/products/cutter-003281p/003281P.webp`, `/products/cutter-003281p/003281P-2.webp`, `/products/cutter-003281p/003281P-3.webp`] },
    ],
  },
  {
    slug: `cutter-003282p`,
    name: { pt: `Double puncher`, en: `Double puncher` },
    description: { pt: `Double puncher cigar cutter, decorated with gloss black lacquer and chrome finish. 2 cutting diameters: 8.6mm and 11.6mm`, en: `Double puncher cigar cutter, decorated with gloss black lacquer and chrome finish. 2 cutting diameters: 8.6mm and 11.6mm` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003282p/003282P.webp`,
    variants: [
      { sku: `003282P`, name: { pt: `Double puncher — Gold & Golden`, en: `Double puncher — Gold & Golden` }, priceCents: 25000, currency: "EUR", attributes: { color: { label: { pt: `Gold & Golden`, en: `Gold & Golden` }, hex: ["#c8a24a"] } }, image: `/products/cutter-003282p/003282P.webp`, images: [`/products/cutter-003282p/003282P.webp`, `/products/cutter-003282p/003282P-2.webp`, `/products/cutter-003282p/003282P-3.webp`] },
    ],
  },
  {
    slug: `cutter-003203p`,
    name: { pt: `Double puncher`, en: `Double puncher` },
    description: { pt: `To celebrate the 15th anniversary of Línea Behike, S.T. Dupont has teamed up with Cohiba for an exclusive collection of lighters and accessories. Inspired by Behike's emblematic codes, it combines black and white checks, gold finishes and deep black lacquer. The “Behike” effigy, revisited by the goldsmiths at S.T. Dupont, sublimates this unique collaboration, a tribute to the know-how and excellence of both houses. Double puncher cigar cutter decorated with matte black lacquer and Cohiba motif, gloss finish. 2 cutting diameters of 8.6mm and 11.6mm`, en: `To celebrate the 15th anniversary of Línea Behike, S.T. Dupont has teamed up with Cohiba for an exclusive collection of lighters and accessories. Inspired by Behike's emblematic codes, it combines black and white checks, gold finishes and deep black lacquer. The “Behike” effigy, revisited by the goldsmiths at S.T. Dupont, sublimates this unique collaboration, a tribute to the know-how and excellence of both houses. Double puncher cigar cutter decorated with matte black lacquer and Cohiba motif, gloss finish. 2 cutting diameters of 8.6mm and 11.6mm` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003203p/003203P.webp`,
    variants: [
      { sku: `003203P`, name: { pt: `Double puncher — Black`, en: `Double puncher — Black` }, priceCents: 25000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/cutter-003203p/003203P.webp`, images: [`/products/cutter-003203p/003203P.webp`, `/products/cutter-003203p/003203P-2.webp`, `/products/cutter-003203p/003203P-3.webp`] },
    ],
  },
  {
    slug: `cutter-420024l`,
    name: { pt: `Foutain Pen Large`, en: `Foutain Pen Large` },
    description: { pt: `The Graff'ty collection is inspired by street art, turning lighters and pens into veritable works of art. Bright colours and mosaics of red, yellow and blue burst forth on Ligne 2, Biggy, Line D Eternity and cigar accessories (ashtray, cigar cutter, case). This collection invites everyone to light the flame of creativity. Line D Eternity large fountain pen in glossy multicolour Dupont lacquer with palladium finish. Goldsmith's guilloche oblique cap. Solid 14-carat gold nib. Piston included. Available in rollerball and nib versions. Related refills: 040112 Blue - 040110 Black - 040362 Red - 040363 Green - 040364 Turquoise This fountain pen comes with a medium nib, for a writing size of apporox. 0.55 mm.`, en: `The Graff'ty collection is inspired by street art, turning lighters and pens into veritable works of art. Bright colours and mosaics of red, yellow and blue burst forth on Ligne 2, Biggy, Line D Eternity and cigar accessories (ashtray, cigar cutter, case). This collection invites everyone to light the flame of creativity. Line D Eternity large fountain pen in glossy multicolour Dupont lacquer with palladium finish. Goldsmith's guilloche oblique cap. Solid 14-carat gold nib. Piston included. Available in rollerball and nib versions. Related refills: 040112 Blue - 040110 Black - 040362 Red - 040363 Green - 040364 Turquoise This fountain pen comes with a medium nib, for a writing size of apporox. 0.55 mm.` },
    collection: `Cortador de Charuto`,
    categorySlug: "escrita",
    image: `/products/cutter-420024l/420024L.webp`,
    variants: [
      { sku: `420024L`, name: { pt: `Foutain Pen Large — Multicolor`, en: `Foutain Pen Large — Multicolor` }, priceCents: 94000, currency: "EUR", attributes: { color: { label: { pt: `Multicolor`, en: `Multicolor` }, hex: ["#c8a24a"] } }, image: `/products/cutter-420024l/420024L.webp`, images: [`/products/cutter-420024l/420024L.webp`, `/products/cutter-420024l/420024L-2.webp`, `/products/cutter-420024l/420024L-3.webp`, `/products/cutter-420024l/420024L-4.webp`] },
    ],
  },
  {
    slug: `cutter-003265`,
    name: { pt: `Guillotine`, en: `Guillotine` },
    description: { pt: `pDouble blade cigar cutter, for consistently perfect cuts. Black finish./p`, en: `pDouble blade cigar cutter, for consistently perfect cuts. Black finish./p` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003265/003265.webp`,
    variants: [
      { sku: `003265`, name: { pt: `Guillotine — Black`, en: `Guillotine — Black` }, priceCents: 17000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/cutter-003265/003265.webp`, images: [`/products/cutter-003265/003265.webp`, `/products/cutter-003265/003265-2.webp`, `/products/cutter-003265/003265-3.webp`] },
    ],
  },
  {
    slug: `cutter-003266`,
    name: { pt: `Guillotine`, en: `Guillotine` },
    description: { pt: `pDouble blade cigar cutter, for consistently perfect cuts. Chrome finish./p`, en: `pDouble blade cigar cutter, for consistently perfect cuts. Chrome finish./p` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003266/003266.webp`,
    variants: [
      { sku: `003266`, name: { pt: `Guillotine — Silver`, en: `Guillotine — Silver` }, priceCents: 17000, currency: "EUR", attributes: { color: { label: { pt: `Silver`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/cutter-003266/003266.webp`, images: [`/products/cutter-003266/003266.webp`, `/products/cutter-003266/003266-2.webp`, `/products/cutter-003266/003266-3.webp`] },
    ],
  },
  {
    slug: `cutter-003257`,
    name: { pt: `Guillotine`, en: `Guillotine` },
    description: { pt: `pDouble blade cigar cutter, equipped with a double blade and a V-CUT blade. Decorated with a chrome finish grid./p`, en: `pDouble blade cigar cutter, equipped with a double blade and a V-CUT blade. Decorated with a chrome finish grid./p` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003257/003257.webp`,
    variants: [
      { sku: `003257`, name: { pt: `Guillotine — Silver`, en: `Guillotine — Silver` }, priceCents: 17000, currency: "EUR", attributes: { color: { label: { pt: `Silver`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/cutter-003257/003257.webp`, images: [`/products/cutter-003257/003257.webp`, `/products/cutter-003257/003257-2.webp`, `/products/cutter-003257/003257-3.webp`] },
    ],
  },
  {
    slug: `cutter-003394`,
    name: { pt: `Guillotine`, en: `Guillotine` },
    description: { pt: `Traditional double blade cigar cutter. Matte black finish.`, en: `Traditional double blade cigar cutter. Matte black finish.` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003394/003394.webp`,
    variants: [
      { sku: `003394`, name: { pt: `Guillotine — Black`, en: `Guillotine — Black` }, priceCents: 21000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/cutter-003394/003394.webp`, images: [`/products/cutter-003394/003394.webp`, `/products/cutter-003394/003394-2.webp`, `/products/cutter-003394/003394-3.webp`] },
    ],
  },
  {
    slug: `cutter-003370`,
    name: { pt: `Guillotine`, en: `Guillotine` },
    description: { pt: `Inspired by the X-Bag, one of the bags from the leather goods collection developed this season by S.T. Dupont, Fire X presents its reinterpretation of the iconic flame tip on the classics of the House. Traditional cigar cutter decorated with the Fire X motif and chrome finishes.`, en: `Inspired by the X-Bag, one of the bags from the leather goods collection developed this season by S.T. Dupont, Fire X presents its reinterpretation of the iconic flame tip on the classics of the House. Traditional cigar cutter decorated with the Fire X motif and chrome finishes.` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003370/003370.webp`,
    variants: [
      { sku: `003370`, name: { pt: `Guillotine — Black`, en: `Guillotine — Black` }, priceCents: 22000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/cutter-003370/003370.webp`, images: [`/products/cutter-003370/003370.webp`, `/products/cutter-003370/003370-2.webp`, `/products/cutter-003370/003370-3.webp`] },
    ],
  },
  {
    slug: `cutter-183034`,
    name: { pt: `Leather case`, en: `Leather case` },
    description: { pt: `Montecristo and S.T. Dupont, both synonymous with unique craftsmanship, have joined forces to create exceptional products. This new collection will delight fans of both brands. The leather and gold metal 3-cigar case is stamped with the Montecristo coat of arms and the L'Aurore pattern. The collection includes 3 lighters: Ligne 2, Le Grand Dupont, Maxijet. Also, two pens from the Line D Large collection and accessories: a cigar cutter, a large ashtray and a pair of cufflinks.`, en: `Montecristo and S.T. Dupont, both synonymous with unique craftsmanship, have joined forces to create exceptional products. This new collection will delight fans of both brands. The leather and gold metal 3-cigar case is stamped with the Montecristo coat of arms and the L'Aurore pattern. The collection includes 3 lighters: Ligne 2, Le Grand Dupont, Maxijet. Also, two pens from the Line D Large collection and accessories: a cigar cutter, a large ashtray and a pair of cufflinks.` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-183034/183034.webp`,
    variants: [
      { sku: `183034`, name: { pt: `Leather case — Violet`, en: `Leather case — Violet` }, priceCents: 31000, currency: "EUR", attributes: { color: { label: { pt: `Violet`, en: `Violet` }, hex: ["#6b4a8a"] } }, image: `/products/cutter-183034/183034.webp`, images: [`/products/cutter-183034/183034.webp`, `/products/cutter-183034/183034-2.webp`, `/products/cutter-183034/183034-3.webp`] },
    ],
  },
  {
    slug: `cutter-183203`,
    name: { pt: `Leather case`, en: `Leather case` },
    description: { pt: `To celebrate the 15th anniversary of Línea Behike, S.T. Dupont has teamed up with Cohiba for an exclusive collection of lighters and accessories. Inspired by Behike's emblematic codes, it combines black and white checks, gold finishes and deep black lacquer. The “Behike” effigy, revisited by the goldsmiths at S.T. Dupont goldsmiths, enhances this unique collaboration, a tribute to the know-how and e*cellence of both houses. Case for 2 cigars, Behike motif. Calf leather. Matte black base`, en: `To celebrate the 15th anniversary of Línea Behike, S.T. Dupont has teamed up with Cohiba for an exclusive collection of lighters and accessories. Inspired by Behike's emblematic codes, it combines black and white checks, gold finishes and deep black lacquer. The “Behike” effigy, revisited by the goldsmiths at S.T. Dupont goldsmiths, enhances this unique collaboration, a tribute to the know-how and e*cellence of both houses. Case for 2 cigars, Behike motif. Calf leather. Matte black base` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-183203/183203.webp`,
    variants: [
      { sku: `183203`, name: { pt: `Leather case — Black`, en: `Leather case — Black` }, priceCents: 28000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/cutter-183203/183203.webp`, images: [`/products/cutter-183203/183203.webp`, `/products/cutter-183203/183203-2.webp`, `/products/cutter-183203/183203-3.webp`] },
    ],
  },
  {
    slug: `cutter-003480`,
    name: { pt: `Perfect cut`, en: `Perfect cut` },
    description: { pt: `Cutter Slim Perfect Cut cigar cutter, decorated in black lacquer and chrome finish. 23 mm diameter and 2.7 mm adjustable cutting depth`, en: `Cutter Slim Perfect Cut cigar cutter, decorated in black lacquer and chrome finish. 23 mm diameter and 2.7 mm adjustable cutting depth` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003480/003480.webp`,
    variants: [
      { sku: `003480`, name: { pt: `Perfect cut — Silver`, en: `Perfect cut — Silver` }, priceCents: 20000, currency: "EUR", attributes: { color: { label: { pt: `Silver`, en: `Silver` }, hex: ["#b9bcc2"] } }, image: `/products/cutter-003480/003480.webp`, images: [`/products/cutter-003480/003480.webp`, `/products/cutter-003480/003480-2.webp`, `/products/cutter-003480/003480-3.webp`] },
    ],
  },
  {
    slug: `cutter-003481`,
    name: { pt: `Perfect cut`, en: `Perfect cut` },
    description: { pt: `Cutter Slim Perfect Cut cigar cutter, decorated in black lacquer and chrome finish. 23 mm diameter and 2.7 mm adjustable cutting depth`, en: `Cutter Slim Perfect Cut cigar cutter, decorated in black lacquer and chrome finish. 23 mm diameter and 2.7 mm adjustable cutting depth` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003481/003481.webp`,
    variants: [
      { sku: `003481`, name: { pt: `Perfect cut — Black`, en: `Perfect cut — Black` }, priceCents: 20000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/cutter-003481/003481.webp`, images: [`/products/cutter-003481/003481.webp`, `/products/cutter-003481/003481-2.webp`, `/products/cutter-003481/003481-3.webp`] },
    ],
  },
  {
    slug: `cutter-003482`,
    name: { pt: `Perfect cut`, en: `Perfect cut` },
    description: { pt: `Cutter Slim Perfect Cut cigar cutter, decorated in black lacquer and chrome finish. 23 mm diameter and 2.7 mm adjustable cutting depth`, en: `Cutter Slim Perfect Cut cigar cutter, decorated in black lacquer and chrome finish. 23 mm diameter and 2.7 mm adjustable cutting depth` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003482/003482.webp`,
    variants: [
      { sku: `003482`, name: { pt: `Perfect cut — Gold & Golden`, en: `Perfect cut — Gold & Golden` }, priceCents: 20000, currency: "EUR", attributes: { color: { label: { pt: `Gold & Golden`, en: `Gold & Golden` }, hex: ["#c8a24a"] } }, image: `/products/cutter-003482/003482.webp`, images: [`/products/cutter-003482/003482.webp`, `/products/cutter-003482/003482-2.webp`, `/products/cutter-003482/003482-3.webp`] },
    ],
  },
  {
    slug: `cutter-003262`,
    name: { pt: `Puncher`, en: `Puncher` },
    description: { pt: `pKeychain cigar punch cutter, decorated in black lacquer and chrome finishes. Cutting diameter of 8.6mm./p`, en: `pKeychain cigar punch cutter, decorated in black lacquer and chrome finishes. Cutting diameter of 8.6mm./p` },
    collection: `Cortador de Charuto`,
    categorySlug: "acessorios",
    image: `/products/cutter-003262/003262.webp`,
    variants: [
      { sku: `003262`, name: { pt: `Puncher — Black`, en: `Puncher — Black` }, priceCents: 11500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/cutter-003262/003262.webp`, images: [`/products/cutter-003262/003262.webp`, `/products/cutter-003262/003262-2.webp`, `/products/cutter-003262/003262-3.webp`] },
    ],
  },
  {
    slug: `cutter-422024l`,
    name: { pt: `Rollerball Pen Large`, en: `Rollerball Pen Large` },
    description: { pt: `The Graff'ty collection is inspired by street art, turning lighters and pens into veritable works of art. Bright colours and mosaics of red, yellow and blue burst forth on Ligne 2, Biggy, Line D Eternity and cigar accessories (ashtray, cigar cutter, case). This collection invites everyone to light the flame of creativity. Line D Eternity large rollerball pen in glossy multicolour Dupont lacquer with palladium finish. Goldsmith's cap with oblique guilloche. Available in rollerball and fountain pen versions. Related refills: 040840 Blue - 040841 Black`, en: `The Graff'ty collection is inspired by street art, turning lighters and pens into veritable works of art. Bright colours and mosaics of red, yellow and blue burst forth on Ligne 2, Biggy, Line D Eternity and cigar accessories (ashtray, cigar cutter, case). This collection invites everyone to light the flame of creativity. Line D Eternity large rollerball pen in glossy multicolour Dupont lacquer with palladium finish. Goldsmith's cap with oblique guilloche. Available in rollerball and fountain pen versions. Related refills: 040840 Blue - 040841 Black` },
    collection: `Cortador de Charuto`,
    categorySlug: "escrita",
    image: `/products/cutter-422024l/422024L.webp`,
    variants: [
      { sku: `422024L`, name: { pt: `Rollerball Pen Large — Multicolor`, en: `Rollerball Pen Large — Multicolor` }, priceCents: 76500, currency: "EUR", attributes: { color: { label: { pt: `Multicolor`, en: `Multicolor` }, hex: ["#c8a24a"] } }, image: `/products/cutter-422024l/422024L.webp`, images: [`/products/cutter-422024l/422024L.webp`, `/products/cutter-422024l/422024L-2.webp`, `/products/cutter-422024l/422024L-3.webp`, `/products/cutter-422024l/422024L-4.webp`] },
    ],
  },  // === END WWW CIGAR CUTTERS ===

  // ===== NEW PRODUCTS — June 2026 scrape (www.st-dupont.com + en.st-dupont.com) =====
  {
    slug: `cufflinks-cohiba`,
    name: { pt: `Engraved`, en: `Engraved` },
    description: { pt: `To celebrate Cohiba’s 60th anniversary, S.T. Dupont unveils an exclusive collection of lighters and accessories, symbolizing absolute refinement and an exceptional heritage. Inspired by the brand’s iconic design elements, the collection combines the black and gold band, the emblematic Native American head, and the signature square motif. Each piece reveals a subtle balance between aesthetics and artisanal precision, embodying the exclusivity, prestige, and exceptional craftsmanship of both Houses, appealing to the most discerning cigar connoisseurs. Gold cufflinks engraved with the Native American head, featuring a fingerprint effect.`, en: `To celebrate Cohiba’s 60th anniversary, S.T. Dupont unveils an exclusive collection of lighters and accessories, symbolizing absolute refinement and an exceptional heritage. Inspired by the brand’s iconic design elements, the collection combines the black and gold band, the emblematic Native American head, and the signature square motif. Each piece reveals a subtle balance between aesthetics and artisanal precision, embodying the exclusivity, prestige, and exceptional craftsmanship of both Houses, appealing to the most discerning cigar connoisseurs. Gold cufflinks engraved with the Native American head, featuring a fingerprint effect.` },
    collection: `Cohiba`,
    categorySlug: "acessorios",
    image: `/products/cufflinks-cohiba/005772.webp`,
    variants: [
      { sku: `005772`, name: { pt: `Engraved — Gold & Golden`, en: `Engraved — Gold & Golden` }, priceCents: 32500, currency: "EUR", attributes: { color: { label: { pt: `Gold & Golden`, en: `Gold & Golden` }, hex: ["#c8a24a"] } }, image: `/products/cufflinks-cohiba/005772.webp`, images: [`/products/cufflinks-cohiba/005772.webp`, `/products/cufflinks-cohiba/005772-2.webp`, `/products/cufflinks-cohiba/005772-3.webp`] },
    ],
  },
  {
    slug: `ligne-2-cohiba`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `To celebrate Cohiba’s 60th anniversary, S.T. Dupont unveils an exclusive collection of lighters and accessories, symbolizing absolute refinement and an exceptional heritage. Inspired by the brand’s iconic design elements, the collection combines the black and gold band, the emblematic Native American head, and the signature square motif. Each piece reveals a subtle balance between aesthetics and artisanal precision, embodying the exclusivity, prestige, and exceptional craftsmanship of both Houses, appealing to the most discerning cigar connoisseurs. Ligne 2 Cling lighter in glossy black lacquer, adorned with the Cohiba 60th anniversary logo and the perforated Native American head, with gold finishes. Cap decorated with the Cohiba checkerboard pattern in a guilloché finish with gold accents. Features a double yellow flame. Matching lighter flint: black (REF 900601) Matching gas refill: red (REF 900435) Lighter shipped empty of gas; refill sold separately.`, en: `To celebrate Cohiba’s 60th anniversary, S.T. Dupont unveils an exclusive collection of lighters and accessories, symbolizing absolute refinement and an exceptional heritage. Inspired by the brand’s iconic design elements, the collection combines the black and gold band, the emblematic Native American head, and the signature square motif. Each piece reveals a subtle balance between aesthetics and artisanal precision, embodying the exclusivity, prestige, and exceptional craftsmanship of both Houses, appealing to the most discerning cigar connoisseurs. Ligne 2 Cling lighter in glossy black lacquer, adorned with the Cohiba 60th anniversary logo and the perforated Native American head, with gold finishes. Cap decorated with the Cohiba checkerboard pattern in a guilloché finish with gold accents. Features a double yellow flame. Matching lighter flint: black (REF 900601) Matching gas refill: red (REF 900435) Lighter shipped empty of gas; refill sold separately.` },
    collection: `Cohiba`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-cohiba/016472N.webp`,
    variants: [
      { sku: `016472N`, name: { pt: `Lacquered lighter — Black`, en: `Lacquered lighter — Black` }, priceCents: 201500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/ligne-2-cohiba/016472N.webp`, images: [`/products/ligne-2-cohiba/016472N.webp`, `/products/ligne-2-cohiba/016472N-2.webp`, `/products/ligne-2-cohiba/016472N-3.webp`, `/products/ligne-2-cohiba/016472N-4.webp`] },
    ],
  },
  {
    slug: `le-grand-dupont-cohiba`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `To celebrate Cohiba’s 60th anniversary, S.T. Dupont unveils an exclusive collection of lighters and accessories, symbolizing absolute refinement and an exceptional heritage. Inspired by the brand’s iconic design elements, the collection combines the black and gold band, the emblematic Native American head, and the signature square motif. Each piece reveals a subtle balance between aesthetics and artisanal precision, embodying the exclusivity, prestige, and exceptional craftsmanship of both Houses, appealing to the most discerning cigar connoisseurs. Le Grand Dupont lighter adorned with glossy black lacquer and a Native American profile sculpted with an embossed effect. Gold powder applied to the back of the lighter along with the Cohiba 60th anniversary logo. Cap decorated with the Cohiba checkerboard pattern in a gold-finished guilloché design. Features a dual ignition system with a choice of yellow or blue flame. Matching lighter flint: red (REF 900651) Matching gas refill: red (REF 900435) Lighter shipped empty of gas; refill sold separately. Screwdriver included for changing the flint.`, en: `To celebrate Cohiba’s 60th anniversary, S.T. Dupont unveils an exclusive collection of lighters and accessories, symbolizing absolute refinement and an exceptional heritage. Inspired by the brand’s iconic design elements, the collection combines the black and gold band, the emblematic Native American head, and the signature square motif. Each piece reveals a subtle balance between aesthetics and artisanal precision, embodying the exclusivity, prestige, and exceptional craftsmanship of both Houses, appealing to the most discerning cigar connoisseurs. Le Grand Dupont lighter adorned with glossy black lacquer and a Native American profile sculpted with an embossed effect. Gold powder applied to the back of the lighter along with the Cohiba 60th anniversary logo. Cap decorated with the Cohiba checkerboard pattern in a gold-finished guilloché design. Features a dual ignition system with a choice of yellow or blue flame. Matching lighter flint: red (REF 900651) Matching gas refill: red (REF 900435) Lighter shipped empty of gas; refill sold separately. Screwdriver included for changing the flint.` },
    collection: `Cohiba`,
    categorySlug: "isqueiros",
    image: `/products/le-grand-dupont-cohiba/C23472CL.webp`,
    variants: [
      { sku: `C23472CL`, name: { pt: `Lacquered lighter — Black`, en: `Lacquered lighter — Black` }, priceCents: 232000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/le-grand-dupont-cohiba/C23472CL.webp`, images: [`/products/le-grand-dupont-cohiba/C23472CL.webp`, `/products/le-grand-dupont-cohiba/C23472CL-2.webp`, `/products/le-grand-dupont-cohiba/C23472CL-3.webp`, `/products/le-grand-dupont-cohiba/C23472CL-4.webp`] },
    ],
  },
  {
    slug: `table-lighter-cohiba`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `To celebrate Cohiba’s 60th anniversary, S.T. Dupont unveils an exclusive collection of lighters and accessories, symbolizing absolute refinement and an exceptional heritage. Inspired by the brand’s iconic design elements, the collection combines the black and gold band, the emblematic Native American head, and the signature square motif. Each piece reveals a subtle balance between aesthetics and artisanal precision, embodying the exclusivity, prestige, and exceptional craftsmanship of both Houses, appealing to the most discerning cigar connoisseurs. Table lighter in glossy black lacquer, decorated with the Cohiba 60th anniversary logo and gold accents. Trigger with a slide-and-press mechanism to switch between a wind-resistant yellow flame and a torch flame. Matching gas refill: black 000430 Lighter shipped empty of gas; refill sold separately.`, en: `To celebrate Cohiba’s 60th anniversary, S.T. Dupont unveils an exclusive collection of lighters and accessories, symbolizing absolute refinement and an exceptional heritage. Inspired by the brand’s iconic design elements, the collection combines the black and gold band, the emblematic Native American head, and the signature square motif. Each piece reveals a subtle balance between aesthetics and artisanal precision, embodying the exclusivity, prestige, and exceptional craftsmanship of both Houses, appealing to the most discerning cigar connoisseurs. Table lighter in glossy black lacquer, decorated with the Cohiba 60th anniversary logo and gold accents. Trigger with a slide-and-press mechanism to switch between a wind-resistant yellow flame and a torch flame. Matching gas refill: black 000430 Lighter shipped empty of gas; refill sold separately.` },
    collection: `Cohiba`,
    categorySlug: "isqueiros",
    image: `/products/table-lighter-cohiba/T20472.webp`,
    variants: [
      { sku: `T20472`, name: { pt: `Lacquered lighter — Black`, en: `Lacquered lighter — Black` }, priceCents: 69500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/table-lighter-cohiba/T20472.webp`, images: [`/products/table-lighter-cohiba/T20472.webp`, `/products/table-lighter-cohiba/T20472-2.webp`, `/products/table-lighter-cohiba/T20472-3.webp`, `/products/table-lighter-cohiba/T20472-4.webp`] },
    ],
  },
  {
    slug: `2-cigar-case-cohiba`,
    name: { pt: `Leather case`, en: `Leather case` },
    description: { pt: `To celebrate Cohiba’s 60th anniversary, S.T. Dupont unveils an exclusive collection of lighters and accessories, symbolizing absolute refinement and an exceptional heritage. Inspired by the brand’s iconic design elements, the collection combines the black and gold band, the emblematic Native American head, and the signature square motif. Each piece reveals a subtle balance between aesthetics and artisanal precision, embodying the exclusivity, prestige, and exceptional craftsmanship of both Houses, appealing to the most discerning cigar connoisseurs. Case for 2 cigars featuring a medallion with the Native American head and the embossed Cohiba 60th Anniversary logo. Smooth calfskin leather. Brushed gold aluminum base, making the case lightweight and durable.`, en: `To celebrate Cohiba’s 60th anniversary, S.T. Dupont unveils an exclusive collection of lighters and accessories, symbolizing absolute refinement and an exceptional heritage. Inspired by the brand’s iconic design elements, the collection combines the black and gold band, the emblematic Native American head, and the signature square motif. Each piece reveals a subtle balance between aesthetics and artisanal precision, embodying the exclusivity, prestige, and exceptional craftsmanship of both Houses, appealing to the most discerning cigar connoisseurs. Case for 2 cigars featuring a medallion with the Native American head and the embossed Cohiba 60th Anniversary logo. Smooth calfskin leather. Brushed gold aluminum base, making the case lightweight and durable.` },
    collection: `Cohiba`,
    categorySlug: "acessorios",
    image: `/products/2-cigar-case-cohiba/183472.webp`,
    variants: [
      { sku: `183472`, name: { pt: `Leather case — Black`, en: `Leather case — Black` }, priceCents: 28000, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/2-cigar-case-cohiba/183472.webp`, images: [`/products/2-cigar-case-cohiba/183472.webp`, `/products/2-cigar-case-cohiba/183472-2.webp`, `/products/2-cigar-case-cohiba/183472-3.webp`] },
    ],
  },
  {
    slug: `ashtray-cohiba`,
    name: { pt: `Porcelain`, en: `Porcelain` },
    description: { pt: `To celebrate Cohiba’s 60th anniversary, S.T. Dupont unveils an exclusive collection of lighters and accessories, symbolizing absolute refinement and an exceptional heritage. Inspired by the brand’s iconic design elements, the collection combines the black and gold band, the emblematic Native American head, and the signature square motif. Each piece reveals a subtle balance between aesthetics and artisanal precision, embodying the exclusivity, prestige, and exceptional craftsmanship of both Houses, appealing to the most discerning cigar connoisseurs. XL ashtray decorated, in the center, with the Cohiba 60th anniversary logo. Black lacquer with a glossy finish. Hand-painted gold finish on the grooves.`, en: `To celebrate Cohiba’s 60th anniversary, S.T. Dupont unveils an exclusive collection of lighters and accessories, symbolizing absolute refinement and an exceptional heritage. Inspired by the brand’s iconic design elements, the collection combines the black and gold band, the emblematic Native American head, and the signature square motif. Each piece reveals a subtle balance between aesthetics and artisanal precision, embodying the exclusivity, prestige, and exceptional craftsmanship of both Houses, appealing to the most discerning cigar connoisseurs. XL ashtray decorated, in the center, with the Cohiba 60th anniversary logo. Black lacquer with a glossy finish. Hand-painted gold finish on the grooves.` },
    collection: `Cohiba`,
    categorySlug: "acessorios",
    image: `/products/misc-cohiba/006472.webp`,
    variants: [
      { sku: `006472`, name: { pt: `Porcelain — Black`, en: `Porcelain — Black` }, priceCents: 65500, currency: "EUR", attributes: { color: { label: { pt: `Black`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/misc-cohiba/006472.webp`, images: [`/products/misc-cohiba/006472.webp`, `/products/misc-cohiba/006472-2.webp`, `/products/misc-cohiba/006472-3.webp`] },
    ],
  },

  // ----- Heritage additions from en.st-dupont.com -----
  {
    slug: `autolock`,
    name: { pt: `Belt`, en: `Belt` },
    description: { pt: `For almost 50 years, S.T. Dupont has offered a wide range of belts combining the House's different expertise to dress men with elegance. These belts are available in a wide choice of leathers, in reversible or non-reversible versions, with 30 or 35 mm wide straps and with different buckles: pin buckles, self-locking buckles or box buckles.`, en: `For almost 50 years, S.T. Dupont has offered a wide range of belts combining the House's different expertise to dress men with elegance. These belts are available in a wide choice of leathers, in reversible or non-reversible versions, with 30 or 35 mm wide straps and with different buckles: pin buckles, self-locking buckles or box buckles.` },
    collection: `Autolock`,
    categorySlug: "acessorios",
    image: `/products/autolock/9791140.webp`,
    variants: [
      { sku: `9791140`, name: { pt: `Belt — Preto`, en: `Belt — Black` }, priceCents: 27500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/autolock/9791140.webp`, images: [`/products/autolock/9791140.webp`, `/products/autolock/9791140-2.webp`, `/products/autolock/9791140-3.webp`] },
      { sku: `9801140`, name: { pt: `Belt — Castanho`, en: `Belt — Brown` }, priceCents: 29000, currency: "EUR", attributes: { color: { label: { pt: `Castanho`, en: `Brown` }, hex: ["#6b4226"] } }, image: `/products/autolock/9801140.webp`, images: [`/products/autolock/9801140.webp`, `/products/autolock/9801140-2.webp`, `/products/autolock/9801140-3.webp`, `/products/autolock/9801140-4.webp`] },
      { sku: `9811140`, name: { pt: `Belt — Azul`, en: `Belt — Blue` }, priceCents: 27500, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/autolock/9811140.webp`, images: [`/products/autolock/9811140.webp`, `/products/autolock/9811140-2.webp`, `/products/autolock/9811140-3.webp`] },
      { sku: `9821140`, name: { pt: `Belt — Cinzento`, en: `Belt — Grey` }, priceCents: 24000, currency: "EUR", attributes: { color: { label: { pt: `Cinzento`, en: `Grey` }, hex: ["#7b7e84"] } }, image: `/products/autolock/9821140.webp`, images: [`/products/autolock/9821140.webp`, `/products/autolock/9821140-2.webp`, `/products/autolock/9821140-3.webp`] },
    ],
  },
  {
    slug: `line-d-reversible-belt`,
    name: { pt: `Reversible belt`, en: `Reversible belt` },
    description: { pt: `For almost 50 years, S.T. Dupont has offered a wide range of belts combining the House's different expertise to dress men with elegance. These belts are available in a wide choice of leathers, in reversible or non-reversible versions, with 30 or 35 mm wide straps and with different buckles: pin buckles, self-locking buckles or box buckles.`, en: `For almost 50 years, S.T. Dupont has offered a wide range of belts combining the House's different expertise to dress men with elegance. These belts are available in a wide choice of leathers, in reversible or non-reversible versions, with 30 or 35 mm wide straps and with different buckles: pin buckles, self-locking buckles or box buckles.` },
    collection: `Line D Eternity`,
    categorySlug: "acessorios",
    image: `/products/line-d-4/8200183.webp`,
    variants: [
      { sku: `8200183`, name: { pt: `Reversible belt — Preto & Castanho`, en: `Reversible belt — Black & Brown` }, priceCents: 22000, currency: "EUR", attributes: { color: { label: { pt: `Preto & Castanho`, en: `Black & Brown` }, hex: ["#15171c", "#6b4226"] } }, image: `/products/line-d-4/8200183.webp`, images: [`/products/line-d-4/8200183.webp`, `/products/line-d-4/8200183-2.webp`, `/products/line-d-4/8200183-3.webp`, `/products/line-d-4/8200183-4.webp`] },
      { sku: `8200160`, name: { pt: `Reversible belt — Preto`, en: `Reversible belt — Black` }, priceCents: 22000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-4/8200160.webp`, images: [`/products/line-d-4/8200160.webp`, `/products/line-d-4/8200160-2.webp`, `/products/line-d-4/8200160-3.webp`, `/products/line-d-4/8200160-4.webp`] },
    ],
  },
  {
    slug: `biggy-diamond-head`,
    name: { pt: `Diamond head Lighter`, en: `Diamond head Lighter` },
    description: { pt: `Connected to the heritage of the House, combining the elegance of Line 2 with the power of the Megajet, Big D will delight cigar lovers looking for performance and luxurious design. Carefully designed in glossy black lacquer. Equipped with a powerful 2 cm torch flame, Big D ensures exceptional ignition on any occasion. This model is available in the same finishes as the Slimmy: chrome, gold, guilloche diamond tip or lacquer (dark blue and black). Gas refill associated: black (REF 000430)`, en: `Connected to the heritage of the House, combining the elegance of Line 2 with the power of the Megajet, Big D will delight cigar lovers looking for performance and luxurious design. Carefully designed in glossy black lacquer. Equipped with a powerful 2 cm torch flame, Big D ensures exceptional ignition on any occasion. This model is available in the same finishes as the Slimmy: chrome, gold, guilloche diamond tip or lacquer (dark blue and black). Gas refill associated: black (REF 000430)` },
    collection: `Biggy`,
    categorySlug: "isqueiros",
    image: `/products/biggy-4/025009.webp`,
    variants: [
      { sku: `025009`, name: { pt: `Diamond head Lighter — Dourado`, en: `Diamond head Lighter — Gold` }, priceCents: 38500, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Gold` }, hex: ["#c8a24a"] } }, image: `/products/biggy-4/025009.webp`, images: [`/products/biggy-4/025009.webp`, `/products/biggy-4/025009-2.webp`, `/products/biggy-4/025009-3.webp`, `/products/biggy-4/025009-4.webp`] },
      { sku: `025010`, name: { pt: `Diamond head Lighter — Paládio`, en: `Diamond head Lighter — Palladium` }, priceCents: 38500, currency: "EUR", attributes: { color: { label: { pt: `Paládio`, en: `Palladium` }, hex: ["#b9bcc2"] } }, image: `/products/biggy-4/025010.webp`, images: [`/products/biggy-4/025010.webp`, `/products/biggy-4/025010-2.webp`, `/products/biggy-4/025010-3.webp`, `/products/biggy-4/025010-4.webp`] },
      { sku: `025001`, name: { pt: `Diamond head Lighter — Paládio`, en: `Diamond head Lighter — Palladium` }, priceCents: 36500, currency: "EUR", attributes: { color: { label: { pt: `Paládio`, en: `Palladium` }, hex: ["#b9bcc2"] } }, image: `/products/biggy-4/025001.webp`, images: [`/products/biggy-4/025001.webp`, `/products/biggy-4/025001-2.webp`, `/products/biggy-4/025001-3.webp`, `/products/biggy-4/025001-4.webp`] },
      { sku: `025002`, name: { pt: `Diamond head Lighter — Preto`, en: `Diamond head Lighter — Black` }, priceCents: 36500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/biggy-4/025002.webp`, images: [`/products/biggy-4/025002.webp`, `/products/biggy-4/025002-2.webp`, `/products/biggy-4/025002-3.webp`, `/products/biggy-4/025002-4.webp`] },
    ],
  },
  {
    slug: `le-grand-dupont-lilac`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `Montecristo and S.T. Dupont, both synonymous with unique craftsmanship, have joined forces to create exceptional products. This new collection will delight fans of both brands. The Grand Dupont is lacquered with a violet gradient, on the front face the logo of the prestigious Montecristo cigar brand is stamped in gold on one of the faces, while the other face presents a golden sun and moon decoration. It has a double flame system, a first low flame gently warms the cigar slowly, while a powerful and uniform torch flame ensures lighting in all circumstances. The collection includes 2 other lighters: Line 2 and a Maxijet. Also, two pens from the Line D Large collection and accessories: a leather case for three cigars, a large ashtray, a cigar cutter and a pair of cufflinks. Gas refill associated: red (REF 000435) red stone (REF 900651)`, en: `Montecristo and S.T. Dupont, both synonymous with unique craftsmanship, have joined forces to create exceptional products. This new collection will delight fans of both brands. The Grand Dupont is lacquered with a violet gradient, on the front face the logo of the prestigious Montecristo cigar brand is stamped in gold on one of the faces, while the other face presents a golden sun and moon decoration. It has a double flame system, a first low flame gently warms the cigar slowly, while a powerful and uniform torch flame ensures lighting in all circumstances. The collection includes 2 other lighters: Line 2 and a Maxijet. Also, two pens from the Line D Large collection and accessories: a leather case for three cigars, a large ashtray, a cigar cutter and a pair of cufflinks. Gas refill associated: red (REF 000435) red stone (REF 900651)` },
    collection: `Le Grand Dupont`,
    categorySlug: "isqueiros",
    image: `/products/le-grand-dupont-3/C23034.webp`,
    variants: [
      { sku: `C23034`, name: { pt: `Lacquered lighter — Lilás`, en: `Lacquered lighter — Lilac` }, priceCents: 168500, currency: "EUR", attributes: { color: { label: { pt: `Lilás`, en: `Lilac` }, hex: ["#6b4a8a"] } }, image: `/products/le-grand-dupont-3/C23034.webp`, images: [`/products/le-grand-dupont-3/C23034.webp`, `/products/le-grand-dupont-3/C23034-2.webp`, `/products/le-grand-dupont-3/C23034-3.webp`, `/products/le-grand-dupont-3/C23034-4.webp`] },
    ],
  },
  {
    slug: `ligne-2-micro-diamond-head`,
    name: { pt: `Micro Diamond head lighter`, en: `Micro Diamond head lighter` },
    description: { pt: `This small-model lighter, with its microdiamond tip and palladium finish, meets the demand of a new, young and female luxury market. Associated lighter stone: black (REF 900600). Associated gas refill: red (REF 900435). Lighter is sold empty of gas, refill sold separately.`, en: `This small-model lighter, with its microdiamond tip and palladium finish, meets the demand of a new, young and female luxury market. Associated lighter stone: black (REF 900600). Associated gas refill: red (REF 900435). Lighter is sold empty of gas, refill sold separately.` },
    collection: `Ligne 2`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-7/C18690.webp`,
    variants: [
      { sku: `C18690`, name: { pt: `Micro Diamond head lighter — Paládio`, en: `Micro Diamond head lighter — Palladium` }, priceCents: 98500, currency: "EUR", attributes: { color: { label: { pt: `Paládio`, en: `Palladium` }, hex: ["#b9bcc2"] } }, image: `/products/ligne-2-7/C18690.webp`, images: [`/products/ligne-2-7/C18690.webp`, `/products/ligne-2-7/C18690-2.webp`, `/products/ligne-2-7/C18690-3.webp`, `/products/ligne-2-7/C18690-4.webp`] },
      { sku: `C18692`, name: { pt: `Micro Diamond head lighter — Dourado`, en: `Micro Diamond head lighter — Gold` }, priceCents: 98500, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Gold` }, hex: ["#c8a24a"] } }, image: `/products/ligne-2-7/C18692.webp`, images: [`/products/ligne-2-7/C18692.webp`, `/products/ligne-2-7/C18692-2.webp`, `/products/ligne-2-7/C18692-3.webp`, `/products/ligne-2-7/C18692-4.webp`] },
    ],
  },
  {
    slug: `ligne-2-dragon-3`,
    name: { pt: `Guilloche under lacquer`, en: `Guilloche under lacquer` },
    description: { pt: `Created for the Chinese New Year of the Dragon, this collection celebrates the mythical creature as much as S.T. Dupont's craftsmanship. Writing instruments, lighters and cigar accessories reinvent the iconic know-how of the House with the creation of a new dragon scale guilloche. Both steeped in tradition and fiercely modern, three lines make up the Dragon collection: Dragon Red, Dragon Black and Dragon Color Animation. The Dragon Red and Dragon Black lines see S.T. Dupont's iconic products adorned with a dragon inspired by anime and street art. Bursting from a cloud of confetti, it symbolizes the joy and infinite possibilities offered by this new lunar year. Illustrated on the body of the iconic Maxijet, the S.T. Dupont dragon undulates on this burgundy lighter. Associated refills: Red (REF 000434) Black stone (REF 900601)`, en: `Created for the Chinese New Year of the Dragon, this collection celebrates the mythical creature as much as S.T. Dupont's craftsmanship. Writing instruments, lighters and cigar accessories reinvent the iconic know-how of the House with the creation of a new dragon scale guilloche. Both steeped in tradition and fiercely modern, three lines make up the Dragon collection: Dragon Red, Dragon Black and Dragon Color Animation. The Dragon Red and Dragon Black lines see S.T. Dupont's iconic products adorned with a dragon inspired by anime and street art. Bursting from a cloud of confetti, it symbolizes the joy and infinite possibilities offered by this new lunar year. Illustrated on the body of the iconic Maxijet, the S.T. Dupont dragon undulates on this burgundy lighter. Associated refills: Red (REF 000434) Black stone (REF 900601)` },
    collection: `Dragon`,
    categorySlug: "isqueiros",
    image: `/products/ligne-2-dragon-2/C16626.webp`,
    variants: [
      { sku: `C16626`, name: { pt: `Guilloche under lacquer — Borgonha`, en: `Guilloche under lacquer — Burgundy` }, priceCents: 141000, currency: "EUR", attributes: { color: { label: { pt: `Borgonha`, en: `Burgundy` }, hex: ["#7d2b27"] } }, image: `/products/ligne-2-dragon-2/C16626.webp`, images: [`/products/ligne-2-dragon-2/C16626.webp`, `/products/ligne-2-dragon-2/C16626-2.webp`, `/products/ligne-2-dragon-2/C16626-3.webp`, `/products/ligne-2-dragon-2/C16626-4.webp`] },
      { sku: `C16632`, name: { pt: `Guilloche under lacquer — Azul Royal`, en: `Guilloche under lacquer — Royal Blue` }, priceCents: 141000, currency: "EUR", attributes: { color: { label: { pt: `Azul Royal`, en: `Royal Blue` }, hex: ["#1f3c66"] } }, image: `/products/ligne-2-dragon-2/C16632.webp`, images: [`/products/ligne-2-dragon-2/C16632.webp`, `/products/ligne-2-dragon-2/C16632-2.webp`, `/products/ligne-2-dragon-2/C16632-3.webp`, `/products/ligne-2-dragon-2/C16632-4.webp`] },
      { sku: `C16526`, name: { pt: `Guilloche under lacquer — Borgonha`, en: `Guilloche under lacquer — Burgundy` }, priceCents: 141000, currency: "EUR", attributes: { color: { label: { pt: `Borgonha`, en: `Burgundy` }, hex: ["#7d2b27"] } }, image: `/products/ligne-2-dragon-2/C16526.webp`, images: [`/products/ligne-2-dragon-2/C16526.webp`, `/products/ligne-2-dragon-2/C16526-2.webp`, `/products/ligne-2-dragon-2/C16526-3.webp`, `/products/ligne-2-dragon-2/C16526-4.webp`] },
    ],
  },
  {
    slug: `maxijet-dragon-3`,
    name: { pt: `Lacquered Lighter`, en: `Lacquered Lighter` },
    description: { pt: `Illustrated on the body of the iconic Maxijet, the S.T. Dupont dragon undulates on this burgundy lighter. Associated refills: Black (REF 000430)`, en: `Illustrated on the body of the iconic Maxijet, the S.T. Dupont dragon undulates on this burgundy lighter. Associated refills: Black (REF 000430)` },
    collection: `Dragon`,
    categorySlug: "isqueiros",
    image: `/products/maxijet-dragon-3/020176.webp`,
    variants: [
      { sku: `020176`, name: { pt: `Lacquered Lighter — Borgonha`, en: `Lacquered Lighter — Burgundy` }, priceCents: 23500, currency: "EUR", attributes: { color: { label: { pt: `Borgonha`, en: `Burgundy` }, hex: ["#7d2b27"] } }, image: `/products/maxijet-dragon-3/020176.webp`, images: [`/products/maxijet-dragon-3/020176.webp`, `/products/maxijet-dragon-3/020176-2.webp`, `/products/maxijet-dragon-3/020176-3.webp`, `/products/maxijet-dragon-3/020176-4.webp`] },
    ],
  },
  {
    slug: `slim-7-dragon-3`,
    name: { pt: `Lacquered Lighter`, en: `Lacquered Lighter` },
    description: { pt: `Illustrated on the body of the iconic SLIM 7, the S.T. Dupont dragon undulates on this burgundy lighter. Associated refills: Black (REF 000430)`, en: `Illustrated on the body of the iconic SLIM 7, the S.T. Dupont dragon undulates on this burgundy lighter. Associated refills: Black (REF 000430)` },
    collection: `Dragon`,
    categorySlug: "isqueiros",
    image: `/products/slim-7-dragon-3/027776.webp`,
    variants: [
      { sku: `027776`, name: { pt: `Lacquered Lighter — Borgonha`, en: `Lacquered Lighter — Burgundy` }, priceCents: 22500, currency: "EUR", attributes: { color: { label: { pt: `Borgonha`, en: `Burgundy` }, hex: ["#7d2b27"] } }, image: `/products/slim-7-dragon-3/027776.webp`, images: [`/products/slim-7-dragon-3/027776.webp`, `/products/slim-7-dragon-3/027776-2.webp`, `/products/slim-7-dragon-3/027776-3.webp`, `/products/slim-7-dragon-3/027776-4.webp`] },
      { sku: `027774`, name: { pt: `Lacquered Lighter — Borgonha`, en: `Lacquered Lighter — Burgundy` }, priceCents: 20500, currency: "EUR", attributes: { color: { label: { pt: `Borgonha`, en: `Burgundy` }, hex: ["#7d2b27"] } }, image: `/products/slim-7-dragon-3/027774.webp`, images: [`/products/slim-7-dragon-3/027774.webp`, `/products/slim-7-dragon-3/027774-2.webp`, `/products/slim-7-dragon-3/027774-3.webp`, `/products/slim-7-dragon-3/027774-4.webp`] },
      { sku: `027773`, name: { pt: `Lacquered Lighter — Azul Royal`, en: `Lacquered Lighter — Royal Blue` }, priceCents: 20500, currency: "EUR", attributes: { color: { label: { pt: `Azul Royal`, en: `Royal Blue` }, hex: ["#1f3c66"] } }, image: `/products/slim-7-dragon-3/027773.webp`, images: [`/products/slim-7-dragon-3/027773.webp`, `/products/slim-7-dragon-3/027773-2.webp`, `/products/slim-7-dragon-3/027773-3.webp`, `/products/slim-7-dragon-3/027773-4.webp`] },
    ],
  },
  {
    slug: `slimmy-lacquered`,
    name: { pt: `Lacquered lighter`, en: `Lacquered lighter` },
    description: { pt: `Inspired by the House archives, Slimmy echoes the iconic Line 2 and the iconic Slim 7, the world's thinnest luxury lighter. Carefully designed in blue lacquer with gold finishes. The lightness (66g) and thinness (9mm) of this lighter provide a perfect grip and allow it to be easily slipped into any pocket or bag. Its torch flame guarantees a unique experience providing efficient ignition in any circumstance. Timeless and featuring the know-how of lacquer and guilloche, Slimmy is available in chrome, gold and lacquer versions (sky blue, coral, dark blue, black, white). Gas refill associated: black (REF 000430)`, en: `Inspired by the House archives, Slimmy echoes the iconic Line 2 and the iconic Slim 7, the world's thinnest luxury lighter. Carefully designed in blue lacquer with gold finishes. The lightness (66g) and thinness (9mm) of this lighter provide a perfect grip and allow it to be easily slipped into any pocket or bag. Its torch flame guarantees a unique experience providing efficient ignition in any circumstance. Timeless and featuring the know-how of lacquer and guilloche, Slimmy is available in chrome, gold and lacquer versions (sky blue, coral, dark blue, black, white). Gas refill associated: black (REF 000430)` },
    collection: `Slimmy`,
    categorySlug: "isqueiros",
    image: `/products/slimmy-4/028001.webp`,
    variants: [
      { sku: `028001`, name: { pt: `Lacquered lighter — Paládio`, en: `Lacquered lighter — Palladium` }, priceCents: 29000, currency: "EUR", attributes: { color: { label: { pt: `Paládio`, en: `Palladium` }, hex: ["#b9bcc2"] } }, image: `/products/slimmy-4/028001.webp`, images: [`/products/slimmy-4/028001.webp`, `/products/slimmy-4/028001-2.webp`, `/products/slimmy-4/028001-3.webp`, `/products/slimmy-4/028001-4.webp`] },
      { sku: `028002`, name: { pt: `Lacquered lighter — Preto`, en: `Lacquered lighter — Black` }, priceCents: 29000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/slimmy-4/028002.webp`, images: [`/products/slimmy-4/028002.webp`, `/products/slimmy-4/028002-2.webp`, `/products/slimmy-4/028002-3.webp`, `/products/slimmy-4/028002-4.webp`] },
      { sku: `028004`, name: { pt: `Lacquered lighter — Branco`, en: `Lacquered lighter — White` }, priceCents: 29000, currency: "EUR", attributes: { color: { label: { pt: `Branco`, en: `White` }, hex: ["#efeae0"] } }, image: `/products/slimmy-4/028004.webp`, images: [`/products/slimmy-4/028004.webp`, `/products/slimmy-4/028004-2.webp`, `/products/slimmy-4/028004-3.webp`, `/products/slimmy-4/028004-4.webp`] },
      { sku: `028005`, name: { pt: `Lacquered lighter — Azul Índigo`, en: `Lacquered lighter — Indigo Blue` }, priceCents: 29000, currency: "EUR", attributes: { color: { label: { pt: `Azul Índigo`, en: `Indigo Blue` }, hex: ["#1f3c66"] } }, image: `/products/slimmy-4/028005.webp`, images: [`/products/slimmy-4/028005.webp`, `/products/slimmy-4/028005-2.webp`, `/products/slimmy-4/028005-3.webp`, `/products/slimmy-4/028005-4.webp`] },
    ],
  },
  {
    slug: `twiggy-lacquered`,
    name: { pt: `Lacquered Lighter`, en: `Lacquered Lighter` },
    description: { pt: `The Twiggy Lighter in black lacquer and chrome finish is sleek and long-shaped. Its lacquer finish emphasizes its silhouette and embodies the spirit of the 60s. With its 1 cm torch flame, it is perfect for lighting candles or cigarettes, making it a must-have for smokers and non-smokers alike. Just like Slimmy, this model comes in five delicate colors: sky blue, coral, dark blue, black and white. Associated gas refill: black (REF 000430)`, en: `The Twiggy Lighter in black lacquer and chrome finish is sleek and long-shaped. Its lacquer finish emphasizes its silhouette and embodies the spirit of the 60s. With its 1 cm torch flame, it is perfect for lighting candles or cigarettes, making it a must-have for smokers and non-smokers alike. Just like Slimmy, this model comes in five delicate colors: sky blue, coral, dark blue, black and white. Associated gas refill: black (REF 000430)` },
    collection: `Twiggy`,
    categorySlug: "isqueiros",
    image: `/products/twiggy-3/030001.webp`,
    variants: [
      { sku: `030001`, name: { pt: `Lacquered Lighter — Preto`, en: `Lacquered Lighter — Black` }, priceCents: 29000, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/twiggy-3/030001.webp`, images: [`/products/twiggy-3/030001.webp`, `/products/twiggy-3/030001-2.webp`, `/products/twiggy-3/030001-3.webp`, `/products/twiggy-3/030001-4.webp`] },
      { sku: `030002`, name: { pt: `Lacquered Lighter — Dourado`, en: `Lacquered Lighter — Gold` }, priceCents: 29000, currency: "EUR", attributes: { color: { label: { pt: `Dourado`, en: `Gold` }, hex: ["#c8a24a"] } }, image: `/products/twiggy-3/030002.webp`, images: [`/products/twiggy-3/030002.webp`, `/products/twiggy-3/030002-2.webp`, `/products/twiggy-3/030002-3.webp`, `/products/twiggy-3/030002-4.webp`] },
    ],
  },
  {
    slug: `firehead-keyring-pouch`,
    name: { pt: `Keyrings`, en: `Keyrings` },
    description: { pt: `This Firehead collection, crafted from embossed full-grain calf leather with its firehead motif, is a tribute to the alchemical symbol of fire. This blue pouch is spacious enough to fit small digital devices such as an iPad, a phone and other essentials. Its removable strap allows you to take it everywhere. All products in the Firehead collection are LWG certified. - 1 flat pocket`, en: `This Firehead collection, crafted from embossed full-grain calf leather with its firehead motif, is a tribute to the alchemical symbol of fire. This blue pouch is spacious enough to fit small digital devices such as an iPad, a phone and other essentials. Its removable strap allows you to take it everywhere. All products in the Firehead collection are LWG certified. - 1 flat pocket` },
    collection: `Firehead`,
    categorySlug: "pele",
    image: `/products/firehead-4/161610.webp`,
    variants: [
      { sku: `161610`, name: { pt: `Keyrings — Azul`, en: `Keyrings — Blue` }, priceCents: 17000, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/firehead-4/161610.webp`, images: [`/products/firehead-4/161610.webp`, `/products/firehead-4/161610-2.webp`] },
      { sku: `160612`, name: { pt: `Keyrings — Azul`, en: `Keyrings — Blue` }, priceCents: 69500, currency: "EUR", attributes: { color: { label: { pt: `Azul`, en: `Blue` }, hex: ["#1f3c66"] } }, image: `/products/firehead-4/160612.webp`, images: [`/products/firehead-4/160612.webp`, `/products/firehead-4/160612-2.webp`, `/products/firehead-4/160612-3.webp`, `/products/firehead-4/160612-4.webp`] },
    ],
  },
  {
    slug: `line-d-wallet`,
    name: { pt: `Wallet`, en: `Wallet` },
    description: { pt: `This long wallet is the perfect companion for everyone, with its many slots and RFID technology designed to protect the personal data of the cards it contains from any risk of wireless device usurpation. Practical and elegant, this accessory will become an essential part of your daily life. - 7 card slots on one side - 6 card slots on the other side - Two flat compartments for bills - A gusseted compartment for papers or bills - Embossed logo inside`, en: `This long wallet is the perfect companion for everyone, with its many slots and RFID technology designed to protect the personal data of the cards it contains from any risk of wireless device usurpation. Practical and elegant, this accessory will become an essential part of your daily life. - 7 card slots on one side - 6 card slots on the other side - Two flat compartments for bills - A gusseted compartment for papers or bills - Embossed logo inside` },
    collection: `Line D Eternity`,
    categorySlug: "pele",
    image: `/products/line-d-5/180002.webp`,
    variants: [
      { sku: `180002`, name: { pt: `Wallet — Preto`, en: `Wallet — Black` }, priceCents: 33500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-5/180002.webp`, images: [`/products/line-d-5/180002.webp`, `/products/line-d-5/180002-2.webp`] },
      { sku: `180044`, name: { pt: `Wallet — Preto`, en: `Wallet — Black` }, priceCents: 49500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-5/180044.webp`, images: [`/products/line-d-5/180044.webp`, `/products/line-d-5/180044-2.webp`] },
      { sku: `180045`, name: { pt: `Wallet — Preto`, en: `Wallet — Black` }, priceCents: 45500, currency: "EUR", attributes: { color: { label: { pt: `Preto`, en: `Black` }, hex: ["#15171c"] } }, image: `/products/line-d-5/180045.webp`, images: [`/products/line-d-5/180045.webp`, `/products/line-d-5/180045-2.webp`, `/products/line-d-5/180045-3.webp`] },
    ],
  },
];
