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
    name: { pt: "Isqueiro Ligne 2", en: "Ligne 2 Lighter" },
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
    name: { pt: "Isqueiro Ligne 1", en: "Ligne 1 Lighter" },
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
    name: { pt: "Isqueiro Le Grand Dupont", en: "Le Grand Dupont Lighter" },
    collection: "Le Grand",
    description: {
      pt: "Formato premium de maior porte, com chama dupla regulável — presença e desempenho.",
      en: "Premium larger format with an adjustable double flame — presence and performance.",
    },
    categorySlug: "isqueiros",
    image: "/products/le-grand-dupont/C23780CL.jpg",
    novelty: true,
    variants: [
      cw("C23780CL", "Laca Preta Brilhante & Paládio", "Shiny Black Lacquer & Palladium", ["#15171c", "#b9bcc2"], 169000, "/products/le-grand-dupont/C23780CL.jpg"),
      cw("C23790CL", "Laca Preta Brilhante & Ouro", "Shiny Black Lacquer & Yellow Gold", ["#15171c", "#c8a24a"], 189000, "/products/le-grand-dupont/C23790CL.jpg"),
      cw("C23010N", "Laca Preta & Paládio", "Black Lacquer & Palladium", ["#15171c", "#b9bcc2"], 169000, "/products/le-grand-dupont/C23010N.jpg"),
      cw("C23013N", "Laca Azul Sunburst & Paládio", "Sunburst Blue Lacquer & Palladium", ["#1f3c66", "#b9bcc2"], 175000, "/products/le-grand-dupont/C23013N.jpg"),
      cw("C23009N", "Ponta de Diamante Ouro", "Diamond Head Yellow Gold", ["#c8a24a"], 198000, "/products/le-grand-dupont/C23009N.jpg"),
      cw("C23011N", "Ponta de Diamante Paládio", "Diamond Head Palladium", ["#b9bcc2"], 178000, "/products/le-grand-dupont/C23011N.jpg"),
    ],
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
    variants: [fin("DX-GUN", "Metal Gun", "Gunmetal", 56000), fin("DX-CARB", "Fibra de Carbono", "Carbon Fibre", 62000)],
  },
  {
    slug: "twiggy",
    name: { pt: "Isqueiro Twiggy", en: "Twiggy Lighter" },
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
    name: { pt: "Isqueiro Slim 7", en: "Slim 7 Lighter" },
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
    // Real catalogue: 3 pen types × 3 colourways (cross-checked against the
    // supplied photos). SKU = DM-<type>-<code>, photo = /products/defi-millenium/<SKU>.jpg.
    variants: (() => {
      const C = {
        NVC: col("Laca Azul Marinho Brilhante & Crómio", "Shiny Navy Lacquer & Chrome", "#1b2a44", "#c9ccd1"),
        SBC: col("Laca Preta Brilhante & Crómio", "Shiny Black Lacquer & Chrome", "#15171c", "#c9ccd1"),
        SBG: col("Laca Preta Brilhante & Gunmetal", "Shiny Black Lacquer & Gunmetal", "#15171c", "#4b4f55"),
      } as const;
      const types = [
        { key: "BP" as const, price: 38500 },
        { key: "RB" as const, price: 38500 },
        { key: "FP" as const, price: 43500 },
      ];
      const codes: (keyof typeof C)[] = ["NVC", "SBC", "SBG"];
      const out: SeedVariant[] = [];
      for (const t of types) {
        const ty = TYPE[t.key];
        for (const code of codes) {
          const c = C[code];
          const sku = `DM-${t.key}-${code}`;
          out.push({
            sku,
            name: { pt: `${ty.pt} · ${c.label.pt}`, en: `${ty.en} · ${c.label.en}` },
            priceCents: t.price,
            currency: "EUR" as const,
            attributes: { type: ty, color: c },
            image: `/products/defi-millenium/${sku}.jpg`,
          });
        }
      }
      return out;
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
    categorySlug: "escrita",
    image: null,
    variants: [clr("PC1-BLK", COLOR.black, 19000), clr("PC1-COG", COLOR.cognac, 19000)],
  },
  {
    slug: "pen-case-double",
    name: { pt: "Estojo para 2 Canetas", en: "Two-Pen Case" },
    collection: "Accessories",
    description: { pt: "Estojo em pele para duas canetas, forro em camurça.", en: "Leather case for two pens, suede-lined." },
    categorySlug: "escrita",
    image: null,
    variants: [clr("PC2-BLK", COLOR.black, 26000), clr("PC2-NVY", COLOR.navy, 26000)],
  },
  {
    slug: "desk-blotter",
    name: { pt: "Mata-Borrão de Secretária", en: "Desk Blotter" },
    collection: "Accessories",
    description: { pt: "Mata-borrão em pele para a secretária, cantos reforçados.", en: "Leather desk blotter with reinforced corners." },
    categorySlug: "escrita",
    image: null,
    variants: [clr("DSK-BLK", COLOR.black, 42000)],
  },
  {
    slug: "pen-tray",
    name: { pt: "Bandeja para Canetas", en: "Pen Tray" },
    collection: "Accessories",
    description: { pt: "Bandeja em pele e metal para instrumentos de escrita.", en: "Leather-and-metal tray for writing instruments." },
    categorySlug: "escrita",
    image: null,
    variants: [fin("PT-LEA", "Pele & Metal", "Leather & Metal", 28000)],
  },
  {
    slug: "notebook-a5",
    name: { pt: "Caderno A5", en: "A5 Notebook" },
    collection: "Accessories",
    description: { pt: "Caderno A5 com capa em pele, recarregável.", en: "A5 notebook with a refillable leather cover." },
    categorySlug: "escrita",
    image: null,
    variants: [clr("NBA-BLK", COLOR.black, 9500), clr("NBA-NVY", COLOR.navy, 9500)],
  },
  {
    slug: "notebook-pocket",
    name: { pt: "Caderno de Bolso", en: "Pocket Notebook" },
    collection: "Accessories",
    description: { pt: "Caderno de bolso com capa em pele de vitela.", en: "Pocket notebook with a calfskin cover." },
    categorySlug: "escrita",
    image: null,
    variants: [clr("NBP-BLK", COLOR.black, 6500), clr("NBP-COG", COLOR.cognac, 6500)],
  },
  {
    slug: "ink-bottle",
    name: { pt: "Frasco de Tinta", en: "Ink Bottle" },
    collection: "Accessories",
    description: { pt: "Frasco de tinta S.T. Dupont para canetas de tinta permanente.", en: "S.T. Dupont ink bottle for fountain pens." },
    categorySlug: "escrita",
    image: null,
    variants: [fin("INK-BLK", "Tinta Preta", "Black Ink", 2500), fin("INK-BLU", "Tinta Azul", "Blue Ink", 2500)],
  },
  {
    slug: "rollerball-refill",
    name: { pt: "Recargas Rollerball", en: "Rollerball Refills" },
    collection: "Accessories",
    description: { pt: "Conjunto de recargas para rollerball S.T. Dupont.", en: "Set of S.T. Dupont rollerball refills." },
    categorySlug: "escrita",
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
];
