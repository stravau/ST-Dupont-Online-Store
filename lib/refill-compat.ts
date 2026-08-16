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
  // O quadro separa Grand e Petit modèle, com gás diferente. A colecção na
  // base é uma só, por isso listam-se os dois e a nota explica.
  "Ligne 1": {
    gas: ["000435", "000432"],
    flint: ["000601"],
    nota: "Modelo grande leva a recarga vermelha; modelo pequeno, a amarela.",
  },
  // Idem: Ligne 2, Ligne 2 pequeno e a série CXXXXX levam gás diferente.
  "Ligne 2": {
    gas: ["000432", "000435", "000433"],
    flint: ["000601"],
    nota: "Ligne 2 leva a amarela; a série CXXXXX, a vermelha; o modelo pequeno, a verde.",
  },
  "Line 2 Perfect Cling": {
    gas: ["000432", "000435"],
    flint: ["000601"],
  },
  "Monogram 1872": {
    gas: ["000432", "000435"],
    flint: ["000601"],
    nota: "Segue o modelo base sobre o qual é feito (Ligne 2 na maioria).",
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

/**
 * As REF de recargas e pedras que servem este produto, ou [] se a colecção
 * não estiver no quadro (acessórios, cortadores, etc.).
 */
export function refillRefsFor(collection: string | null | undefined): string[] {
  const c = REFILL_COMPAT[(collection ?? "").trim()];
  if (!c) return [];
  return [...c.gas, ...c.flint];
}

export function refillNoteFor(collection: string | null | undefined): string | undefined {
  return REFILL_COMPAT[(collection ?? "").trim()]?.nota;
}
