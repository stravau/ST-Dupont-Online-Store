// Sugere a que produto do catálogo pertence um artigo sem ficha.
//
// O problema é que os dois lados falam línguas diferentes: o Excel do ECI
// escreve "ESF. CLASSIQUE POPOTE BLUE/YG" e o catálogo tem "Esferográfica
// Classique Popote". Comparar palavra a palavra falha quase sempre.
//
// Duas correcções fazem a diferença:
//   1. expandir as abreviaturas do ECI antes de comparar;
//   2. pesar cada palavra pelo quão RARA é (IDF). "POPOTE" aparece em três
//      produtos e identifica quase sozinha; "BLACK" aparece em centenas e não
//      diz nada. Sem isto, dez palavras banais em comum ganhavam a uma
//      palavra decisiva.

const ABREVIATURAS: [RegExp, string][] = [
  [/\bISQ\b/g, "ISQUEIRO"],
  [/\bCAN\b/g, "CANETA"],
  [/\bROL\b/g, "ROLLERBALL"],
  [/\bESF\b/g, "ESFEROGRAFICA"],
  [/\bAPAR\b/g, "APARO"],
  [/\bL2\b/g, "LIGNE 2"],
  [/\bL1\b/g, "LIGNE 1"],
  [/\bLD\b/g, "LINE D"],
  [/\bLGD\b/g, "LE GRAND DUPONT"],
  [/\bSRA\b/g, "SENHORA"],
  [/\bBOT-PUNHO\b/g, "BOTOES PUNHO"],
  [/\bCART\b/g, "CARTEIRA"],
  [/\bYG\b/g, "YELLOW GOLD"],
  [/\bPAL\b/g, "PALADIO"],
  [/\bLQ\b/g, "LACA"],
  [/\bLACQ\b/g, "LACA"],
];

// Cores e materiais: aparecem em quase tudo e só fazem ruído na comparação.
const RUIDO = new Set([
  "DUPONT", "STD", "PARA", "COM", "DOS", "DAS",
  "PRETO", "BLACK", "BRANCO", "WHITE", "AZUL", "BLUE", "VERMELHO", "RED",
  "VERDE", "GREEN", "CASTANHO", "BROWN", "CINZENTO", "GREY", "GRAY",
  "OURO", "GOLD", "GOLDEN", "CHROME", "CROMADO", "PALADIO", "PALLADIUM",
  "PRATA", "SILVER", "SILVERY", "LACA", "MATTE", "YELLOW",
  // Palavras de CATEGORIA. Parecem distintivas ao IDF porque a maioria dos
  // produtos se chama pelo modelo ("Ligne 2", "Slimmy") e nao pela categoria,
  // logo "ISQUEIRO" aparece em poucos nomes e ganha peso a mais. Mas dizer
  // que um artigo e um isqueiro nao ajuda a escolher QUAL isqueiro.
  "ISQUEIRO", "ISQUEIROS", "CANETA", "CANETAS", "ROLLERBALL", "ESFEROGRAFICA",
  "APARO", "CINZEIRO", "MALA", "CINTO", "CARTEIRA", "BOLSA", "BOTOES",
  "PUNHO", "PORTA", "CHARUTOS", "CHARUTO", "CLIP", "NOTAS", "SENHORA",
  "CORTA", "CADERNO", "MESA", "PEDRAS", "RECARGA", "RECARGAS",
]);

export function normalizar(s: string): string[] {
  let t = s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, " ");
  for (const [re, sub] of ABREVIATURAS) t = t.replace(re, sub);
  return t
    .split(" ")
    .filter((x) => x.length > 2 && !RUIDO.has(x));
}

export interface Candidato {
  slug: string;
  texto: string; // nome + colecção
}

export interface Sugestao {
  slug: string;
  score: number;
  palavras: string[]; // as que decidiram — para se poder justificar a escolha
}

/**
 * Constrói o índice uma vez e devolve uma função que sugere para cada
 * descrição. O IDF calcula-se sobre o conjunto de produtos.
 */
export function criarSugeridor(candidatos: Candidato[]) {
  const docs = candidatos.map((c) => new Set(normalizar(c.texto)));
  const df = new Map<string, number>();
  for (const d of docs) for (const t of d) df.set(t, (df.get(t) ?? 0) + 1);
  const N = Math.max(1, candidatos.length);
  const idf = (t: string) => Math.log(N / (df.get(t) ?? N));

  const porToken = new Map<string, number[]>();
  docs.forEach((d, i) => {
    for (const t of d) {
      if (!porToken.has(t)) porToken.set(t, []);
      porToken.get(t)!.push(i);
    }
  });

  return function sugerir(desc: string): Sugestao | null {
    const termos = normalizar(desc);
    if (termos.length === 0) return null;

    const score = new Map<number, number>();
    const quais = new Map<number, string[]>();
    for (const t of new Set(termos)) {
      const peso = idf(t);
      if (peso <= 0) continue; // aparece em todos os produtos, não distingue
      for (const i of porToken.get(t) ?? []) {
        score.set(i, (score.get(i) ?? 0) + peso);
        if (!quais.has(i)) quais.set(i, []);
        quais.get(i)!.push(t);
      }
    }
    if (score.size === 0) return null;

    // Empates são a norma, não a excepção: "Popote" existe como popote,
    // popote-2 e le-grand-dupont-popote, e as três marcam o mesmo score. Um
    // desempate que anulasse a sugestão nesses casos deitava fora justamente
    // as boas. Desempata-se pelo slug mais curto — costuma ser o produto base
    // — e o utilizador confirma na lista antes de ligar.
    const ordenado = [...score.entries()].sort(
      (a, b) => b[1] - a[1] || candidatos[a[0]].slug.length - candidatos[b[0]].slug.length,
    );
    const [melhor, pts] = ordenado[0];

    // Único travão: o score tem de vir de palavras com peso real. Uma palavra
    // rara chega; um punhado de palavras banais não.
    // 3.0 exige uma palavra genuinamente distintiva (um nome de modelo), e nao
    // uma palavra de categoria como ISQUEIRO ou CANETA que casa com dezenas de
    // produtos. Sugerir de mais e pior do que sugerir de menos: uma sugestao
    // errada e aceite por distraccao poe o artigo na pagina errada.
    if (pts < 3.0) return null;

    return { slug: candidatos[melhor].slug, score: pts, palavras: quais.get(melhor) ?? [] };
  };
}
