// Que recarga de gás e que pedras servem cada isqueiro.
//
// Transcrito do quadro oficial da Maison afixado na boutique ("RECHARGES DE
// GAZ / PIERRES"), confirmado pelo Miguel. O quadro é por MODELO, e o
// catálogo agrupa por colecção — a chave aqui é o nome da colecção tal como
// está gravado na base.
//
// Referências (folha REFILLS da boutique):
//   000601  pedras, tampa cinzenta
//   000651  pedras, tampa vermelha
//   000430  gás, spray preto        000432  gás, rótulo amarelo
//   000433  gás, rótulo verde       000434  gás, rótulo azul
//   000435  gás, rótulo vermelho    000436  gás, spray vermelho (Défi)
//
// As REF são resolvidas com a mesma cascata do resto da app (000NNN ↔ 900NNN),
// portanto isto funciona antes e depois de alinhar as REF duplicadas.

export interface Compat {
  gas: string[];   // REF das recargas de gás
  flint: string[]; // REF das pedras — vazio nos modelos a jato, que não as usam
  nota?: string;   // ressalva a mostrar quando o quadro distingue submodelos
}

// Chave = Product.collection, como está na base.
export const REFILL_COMPAT: Record<string, Compat> = {
  // O quadro separa Grand e Petit modèle (vermelha e amarela). A boutique só
  // trabalha o grande — confirmado pelo Miguel — logo, sempre a vermelha.
  "Ligne 1": {
    gas: ["000435"],
    flint: ["000601"],
  },
  // O quadro distingue Ligne 2, Ligne 2 pequeno e a série CXXXXX, com gás
  // diferente em cada. A boutique só trabalha o Ligne 2 normal — confirmado
  // pelo Miguel — por isso listar os outros dois era mandar o cliente comprar
  // a recarga errada.
  "Ligne 2": {
    gas: ["000432"],
    flint: ["000601"],
  },
  // Famílias do Ligne 2 — seguem o normal, o único que a boutique trabalha.
  // (Nenhuma tem produtos próprios no catálogo: os Monogram estão gravados
  // como "Ligne 2 · Monogram" e resolvem por aí. Ficam por segurança.)
  "Line 2 Perfect Cling": {
    gas: ["000432"],
    flint: ["000601"],
  },
  "Monogram 1872": {
    gas: ["000432"],
    flint: ["000601"],
  },
  Gatsby: { gas: ["000433"], flint: ["000601"] },
  "Le Grand Dupont": { gas: ["000435"], flint: ["000651"] },
  "Le Grand": { gas: ["000435"], flint: ["000651"] },
  "Initial Cinatic": { gas: ["000434"], flint: ["000651"] },
  Initial: { gas: ["000434"], flint: ["000651"] },
  "Ligne 8": { gas: ["000434"], flint: ["000651"] },
  "Line D": { gas: ["000434"], flint: ["000651"] },
  "Mon Dupont": { gas: ["000434"], flint: ["000651"] },
  Urban: { gas: ["000434"], flint: ["000601"] },
  Soubreny: { gas: ["000434"], flint: ["000601"] },
  Liberté: { gas: ["000430"], flint: ["000651"] },
  // A pedra do D-Light é a azul, que a boutique vende a granel — não tem REF
  // no catálogo, por isso fica de fora da lista e vai só na nota.
  "D-Light": {
    gas: ["000434"],
    flint: [],
    nota: "Leva a pedra azul, disponível na boutique (não tem referência própria).",
  },

  // Família a jato — sem pedra, todos com o spray preto.
  Minijet: { gas: ["000430"], flint: [] },
  Maxijet: { gas: ["000430"], flint: [] },
  Megajet: { gas: ["000430"], flint: [] },
  Ultrajet: { gas: ["000430"], flint: [] },
  "Slim 7": { gas: ["000430"], flint: [] },

  // Défi — spray vermelho próprio.
  "Défi Extreme": { gas: ["000436"], flint: [] },
  "Défi Xtreme": { gas: ["000436"], flint: [] },
  "Défi XXtreme": { gas: ["000436"], flint: [] },

  Windproof: { gas: ["000430"], flint: [] },
  "Table lighter": { gas: ["000430"], flint: [] },
  Torch: { gas: ["000430"], flint: [] },

  // Slimmy, Biggy, Twiggy e o colar partilham a mesma linha do quadro.
  Slimmy: { gas: ["000430"], flint: [] },
  Biggy: { gas: ["000430"], flint: [] },
  Twiggy: { gas: ["000430"], flint: [] },
  "Colar Isqueiro": { gas: ["000430"], flint: [] },
};

// A maioria dos isqueiros do catálogo está agrupada pela EDIÇÃO e não pelo
// modelo — "Cohiba", "Géode", "Dragon", "Romeo y Julieta". Nesses casos a
// colecção não diz nada sobre que gás leva, mas o nome diz sempre:
// "Ligne 2 · Cohiba", "Maxijet · Camo", "Slim7 · Horse Mane". Daí esta
// segunda passagem pelo nome.
//
// Ordem importa: o padrão mais específico tem de vir primeiro, senão
// "Défi Xtreme" apanha na entrada do "Défi XXtreme" e o "Le Grand Dupont"
// no "Le Grand".
const MODELO_POR_NOME: [RegExp, string][] = [
  [/\bperfect cling\b/, "Line 2 Perfect Cling"],
  [/\bmonogram\b/, "Monogram 1872"],
  [/\ble grand dupont\b/, "Le Grand Dupont"],
  [/\ble grand\b/, "Le Grand"],
  [/\binitial cinatic\b/, "Initial Cinatic"],
  [/\binitial\b/, "Initial"],
  [/\bligne ?2\b/, "Ligne 2"],
  [/\bligne ?1\b/, "Ligne 1"],
  [/\bligne ?8\b/, "Ligne 8"],
  [/\bline d\b/, "Line D"],
  [/\bmon dupont\b/, "Mon Dupont"],
  [/\bgatsby\b/, "Gatsby"],
  [/\bliberte\b/, "Liberté"],
  [/\bd ?light\b/, "D-Light"],
  [/\burban\b/, "Urban"],
  [/\bsoubreny\b/, "Soubreny"],
  [/\bmegajet\b/, "Megajet"],
  [/\bmaxijet\b/, "Maxijet"],
  [/\bminijet\b/, "Minijet"],
  [/\bultrajet\b/, "Ultrajet"],
  [/\bslim ?7\b/, "Slim 7"],
  [/\bdefi xxtreme\b/, "Défi XXtreme"],
  [/\bdefi xtreme\b/, "Défi Xtreme"],
  [/\bdefi\b/, "Défi Extreme"],
  [/\bwindproof\b/, "Windproof"],
  [/\btorch\b/, "Torch"],
  [/\bisqueiro de mesa\b|\btable lighter\b/, "Table lighter"],
  [/\bslimmy\b/, "Slimmy"],
  [/\bbiggy\b/, "Biggy"],
  [/\btwiggy\b/, "Twiggy"],
  [/\bcolar\b|\bnecklace\b/, "Colar Isqueiro"],
];

function normaliza(s: string): string {
  return s
    .normalize("NFD")
    // \p{Diacritic} em vez do intervalo U+0300–U+036F escrito à mão: os
    // diacríticos combinantes são invisíveis no editor e não sobrevivem a
    // uma conversão de encoding distraída.
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * O modelo do quadro a que este produto corresponde: a colecção quando ela
 * própria é um modelo, senão o modelo que o nome anuncia. null quando não é
 * possível decidir (sets de colecionador, "Diverso", "Haute Création").
 */
export function baseModelFor(
  collection: string | null | undefined,
  name?: string | null,
): string | null {
  const c = (collection ?? "").trim();
  if (REFILL_COMPAT[c]) return c;
  if (!name) return null;
  const n = normaliza(name);
  for (const [re, modelo] of MODELO_POR_NOME) if (re.test(n)) return modelo;
  return null;
}

/**
 * As REF de recargas e pedras que servem este produto, ou [] quando não há
 * modelo identificável (acessórios, cortadores, sets).
 */
export function refillRefsFor(
  collection: string | null | undefined,
  name?: string | null,
): string[] {
  const m = baseModelFor(collection, name);
  const c = m ? REFILL_COMPAT[m] : undefined;
  if (!c) return [];
  return [...c.gas, ...c.flint];
}

export function refillNoteFor(
  collection: string | null | undefined,
  name?: string | null,
): string | undefined {
  const m = baseModelFor(collection, name);
  return m ? REFILL_COMPAT[m]?.nota : undefined;
}
