// Que recarga serve cada instrumento de escrita.
//
// Transcrito das páginas REFILLS da Collection Internationale (pp. 192-193 e
// a dos cartuchos de tinta), fotografadas na boutique.
//
// Ao contrário dos isqueiros, aqui o quadro tem DUAS entradas: a família do
// modelo e o tipo de escrita. O mesmo Line D existe em esferográfica,
// rollerball e aparo, e cada um leva recarga diferente.
//
// Referências:
//   esferográfica família A  040850 azul   040851 preto
//   esferográfica família B  040853 azul   040854 preto
//                            040358 rosa   040359 vermelho
//                            040360 verde  040361 turquesa
//   rollerball               040840 azul   040841 preto
//   feltro (ponta de fibra)  040830 azul   040831 preto
//   roller mini              040843 preto  (só Néo-Classique Président)
//   cartuchos de tinta       040110 preto  040112 azul real
//                            040364 turquesa  040362 vermelho  040363 verde
//   pistão / conversor       408812
//   minas                    040202 (0,5)  040203 (0,7)  040205 (0,7, cx. 12)
//   borrachas                040206  040207
//   mecanismo de lapiseira   408811
//   Classique ant. 1999      040770 azul   040771 preto

export type TipoCaneta = "esferografica" | "rollerball" | "aparo" | "lapiseira";

/**
 * As duas famílias do quadro para a esferográfica. Tudo o resto — roller,
 * feltro, cartuchos — é comum às duas, por isso a família só as separa aí.
 *
 *   A  Olympio · Néo-Classique · Classique 2 · D.link/Caprice · Fidelio
 *      Ellipsis · Montparnasse · Gatsby · Mon Dupont
 *   B  Défi · Liberté · Line D · Streamliner-R · D-Initial · New Line D
 *      The Sword
 */
export type FamiliaCaneta = "A" | "B";

const ROLLER = ["040840", "040841", "040830", "040831"];
const APARO = ["040110", "040112", "040364", "040362", "040363", "408812"];

export const PEN_COMPAT: Record<FamiliaCaneta, Partial<Record<TipoCaneta, string[]>>> = {
  A: {
    esferografica: ["040850", "040851"],
    rollerball: ROLLER,
    aparo: APARO,
    lapiseira: ["040202", "040203"],
  },
  B: {
    esferografica: ["040853", "040854", "040358", "040359", "040360", "040361"],
    rollerball: ROLLER,
    aparo: APARO,
    // A linha "Liberté – Line D" do quadro: minas de 0,7 e borrachas.
    lapiseira: ["040205", "040207"],
  },
};

// As REF da secção "CLASSIQUE REFILLS", que é a dos Classique anteriores a
// 1999: esferográfica 040770/040771, mecanismo 408811, borrachas 040206.
// Existem no catálogo e há stock delas, mas os Classique da boutique são os
// modernos (família A) — confirmado pelo Miguel — por isso não entram em
// quadro nenhum e não aparecem como compatíveis com nada.
export const CLASSIQUE_ANTES_1999 = ["040770", "040771", "408811", "040206"];

function normaliza(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// A família lê-se do nome, tal como nos isqueiros: o catálogo agrupa as
// canetas pela edição ("Géode", "Snake Skin", "Orlinski") e é o nome que traz
// o modelo — "Eternity · Snake Skin · Rollerball".
//
const FAMILIA_POR_NOME: [RegExp, FamiliaCaneta][] = [
  // Classique, Néo-Classique e Classique 2 caem todos na família A.
  [/\bclassique\b/, "A"],
  [/\bolympio\b/, "A"],
  [/\bfidelio\b/, "A"],
  [/\bellipsis\b/, "A"],
  [/\bd link\b|\bcaprice\b/, "A"],
  [/\bmontparnasse\b/, "A"],
  [/\bgatsby\b/, "A"],
  [/\bmon dupont\b/, "A"],
  [/\bdefi\b/, "B"],
  [/\bliberte\b/, "B"],
  // Eternity é como o catálogo grava a linha Line D / New Line D.
  [/\bline d\b|\beternity\b/, "B"],
  [/\binitial\b/, "B"],
  [/\bstreamliner\b/, "B"],
  [/\bthe sword\b/, "B"],
];

// O tipo lê-se SÓ do nome. O `attributes.type` do catálogo não serve aqui:
// é inferido com a descrição incluída no que se procura, e como quase toda a
// ficha menciona "caneta de tinta", 114 das 179 variantes saem como aparo.
const TIPO_POR_NOME: [RegExp, TipoCaneta][] = [
  [/\btinta permanente\b|\bfountain\b|\baparo\b|\bplume\b/, "aparo"],
  [/\brollerball\b|\broller\b/, "rollerball"],
  [/\besferografica\b|\bballpoint\b/, "esferografica"],
  [/\bporta minas\b|\blapiseira\b|\bpencil\b|\bmine\b/, "lapiseira"],
];

export const TIPO_LABEL: Record<TipoCaneta, { pt: string; en: string }> = {
  esferografica: { pt: "Esferográfica", en: "Ballpoint" },
  rollerball: { pt: "Rollerball", en: "Rollerball" },
  aparo: { pt: "Tinta Permanente", en: "Fountain Pen" },
  lapiseira: { pt: "Lapiseira", en: "Mechanical Pencil" },
};

// Fichas cujo tipo não está escrito em lado nenhum — nem no nome, nem no
// slug, nem nos nomes das variantes, nem na descrição. Só se sabe tendo a
// peça na mão, por isso ficam aqui à mão mesmo, uma linha cada.
const TIPO_MANUAL: Record<string, TipoCaneta> = {
  // As cinco variantes têm "Esferográfica" gravado no atributo `type`.
  classique: "esferografica",
  // Confirmado pelo Miguel.
  "classique-popote": "esferografica",
};

/**
 * O tipo a escrever por baixo do título no cartão de listagem. Sai do nome
 * quando lá está; senão, da descrição, e só quando ela menciona um tipo e um
 * só — uma descrição que fala dos três não identifica a peça, identifica a
 * linha, e rotulá-la com um deles seria inventar.
 *
 * Vale a pena mesmo quando o nome já o diz: os nomes longos são cortados por
 * reticências no cartão e é justamente o tipo, que vem no fim, que desaparece.
 */
export function tipoParaEtiqueta(
  nome: string | null | undefined,
  descricao?: string | null,
  slug?: string | null,
): TipoCaneta | null {
  if (slug && TIPO_MANUAL[slug]) return TIPO_MANUAL[slug];
  const doNome = tipoDaCaneta(nome);
  if (doNome) return doNome;
  const mencionados = tiposMencionados(descricao);
  return mencionados.length === 1 ? mencionados[0] : null;
}

export function familiaDaCaneta(nome: string | null | undefined): FamiliaCaneta | null {
  if (!nome) return null;
  const n = normaliza(nome);
  for (const [re, f] of FAMILIA_POR_NOME) if (re.test(n)) return f;
  return null;
}

export function tipoDaCaneta(nome: string | null | undefined): TipoCaneta | null {
  if (!nome) return null;
  const n = normaliza(nome);
  for (const [re, t] of TIPO_POR_NOME) if (re.test(n)) return t;
  return null;
}

/**
 * As REF que servem este instrumento de escrita.
 *
 * Quando o nome não diz o tipo — há fichas que são só "Défi Millennium", com
 * as variantes todas lá dentro — devolve as recargas dos tipos todos da
 * família. É preferível mostrar a esferográfica e o cartucho ao cliente e
 * deixá-lo escolher, do que não mostrar nada.
 */
// Ao contrário de `tipoDaCaneta`, que devolve o primeiro que casa, esta
// devolve TODOS os que o texto menciona. É a diferença entre "esta caneta é
// uma esferográfica" e "este texto fala de esferográfica e de lapiseira".
const TODOS_OS_TIPOS: [RegExp, TipoCaneta][] = [
  [/tinta permanente|fountain pen|aparo|stylo plume/i, "aparo"],
  [/rollerball|roller ball/i, "rollerball"],
  [/esferogr[aá]fica|ballpoint/i, "esferografica"],
  [/porta-?minas|lapiseira|mechanical pencil/i, "lapiseira"],
];

function tiposMencionados(texto: string | null | undefined): TipoCaneta[] {
  if (!texto) return [];
  return TODOS_OS_TIPOS.filter(([re]) => re.test(texto)).map(([, t]) => t);
}

/**
 * As REF que servem este instrumento de escrita.
 *
 * O tipo sai do nome quando lá está. Quando não está — há 26 fichas assim,
 * "Classique · Popote", "Défi Millennium" — usam-se os tipos que a DESCRIÇÃO
 * menciona, que já reduz bastante: a do Popote fala de esferográfica e de
 * lapiseira, e sem isto a ficha oferecia também roller e cartuchos de tinta.
 *
 * Só quando nem a descrição diz nada é que se dão os três tipos de escrita. A
 * lapiseira nunca entra nesse último caso — é rara, e as minas e as borrachas
 * seriam o mais provável de estar a mais.
 */
export function penRefillRefsFor(
  nomeProduto: string | null | undefined,
  descricao?: string | null,
): string[] {
  const familia = familiaDaCaneta(nomeProduto);
  const tipo = tipoDaCaneta(nomeProduto);

  // Sem modelo mas com tipo: o roller, o feltro e os cartuchos são iguais nas
  // duas famílias, portanto não é preciso saber o modelo para acertar. Só a
  // esferográfica e a lapiseira é que dependem dele.
  if (!familia) {
    if (tipo === "rollerball") return ROLLER;
    if (tipo === "aparo") return APARO;
    return [];
  }

  const quadro = PEN_COMPAT[familia];
  if (tipo) return quadro[tipo] ?? [];

  const daDescricao = tiposMencionados(descricao);
  const tipos: TipoCaneta[] =
    daDescricao.length > 0 ? daDescricao : ["esferografica", "rollerball", "aparo"];
  return [...new Set(tipos.flatMap((t) => quadro[t] ?? []))];
}
