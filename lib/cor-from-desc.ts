// Extrai a cor de uma descrição do ECI.
//
// As duas fontes têm forças diferentes e é isso que as torna combináveis: o
// catálogo do site sabe o nome comercial e a fotografia; o Excel sabe o EAN,
// o stock e — nas descrições — a cor real da peça. Foi o caso das malas
// Victoria: a REF `1VI333BE1` parecia bege pelo sufixo, mas o EAN e a
// descrição concordavam em dizer preta. Quando a REF e a descrição
// discordam, é a descrição que ganha, porque é a que o EAN confirma.
//
// As descrições vêm em maiúsculas, abreviadas e frequentemente com duas
// cores ("BLACK/GOLDEN" = corpo preto, acabamento dourado). A primeira é a
// cor do corpo, que é a que interessa para o swatch.

export interface CorExtraida {
  label: string; // "Preto", "Bege", "Vermelho & Dourado"
  hex: string[]; // 1 = cor sólida, 2 = duas cores
}

// Ordem importa: as entradas mais específicas primeiro, senão "BLACK LACQ"
// resolveria em "BLACK" e perdia-se o detalhe. Cada cor traz o hex que o
// swatch usa.
const CORES: { termos: string[]; label: string; hex: string }[] = [
  { termos: ["BURGUNDY", "BURGNDY", "BORDEAUX"], label: "Bordeaux", hex: "#6b2233" },
  { termos: ["VERMELHO", "VERM", "RED", "ROUGE"], label: "Vermelho", hex: "#a51c24" },
  { termos: ["BEIGE", "BEGE"], label: "Bege", hex: "#d8cbb4" },
  { termos: ["PRETO", "BLACK", "NOIR", "BLAK"], label: "Preto", hex: "#141414" },
  { termos: ["BRANCO", "WHITE", "BLANC"], label: "Branco", hex: "#f2f0eb" },
  { termos: ["AZUL", "BLUE", "BLEU", "PACIFIC"], label: "Azul", hex: "#1f3a63" },
  { termos: ["VERDE", "GREEN", "VERT"], label: "Verde", hex: "#24503c" },
  { termos: ["CASTANHO", "BROWN", "MARRON"], label: "Castanho", hex: "#5a3a24" },
  { termos: ["CINZENTO", "GREY", "GRAY"], label: "Cinzento", hex: "#6f7276" },
  { termos: ["ROSA", "PINK", "ROSE"], label: "Rosa", hex: "#c98a92" },
  { termos: ["OURO ROSA", "ROSE GOLD", "PINK GOLD"], label: "Ouro rosa", hex: "#b76e5a" },
  // "YG" é a abreviatura do ECI para yellow gold e aparece muito no fim das
  // descrições de escrita ("POPOTE BLUE/YG").
  { termos: ["YELLOW GOLD", "OURO AMARELO", "GOLDEN", "GOLD", "OURO", "DORE", "YG"], label: "Dourado", hex: "#c9a227" },
  { termos: ["PALADIO", "PALLADIUM", "PALAD", "PAL"], label: "Paládio", hex: "#b9bcc0" },
  { termos: ["CROMADO", "CHROME", "CHROM"], label: "Cromado", hex: "#c6cacf" },
  { termos: ["PRATA", "SILVER", "SILVERY"], label: "Prateado", hex: "#c0c3c7" },
];

function normalizar(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase();
}

/**
 * Devolve a cor lida da descrição, ou null se não houver nenhuma reconhecível.
 * Nunca inventa: preferir não sugerir a sugerir errado, porque uma cor errada
 * manda o cliente à loja buscar a peça que não é.
 */
export function corDaDescricao(desc: string): CorExtraida | null {
  const t = normalizar(desc);
  const achadas: { label: string; hex: string; pos: number }[] = [];

  for (const c of CORES) {
    for (const termo of c.termos) {
      // \b não serve: as descrições usam "/" e "." como separadores
      // ("BLACK/GOLDEN", "VERM."), e o termo pode estar colado a eles.
      const re = new RegExp(`(?:^|[^A-Z])${termo}(?:[^A-Z]|$)`);
      const m = re.exec(t);
      if (m && !achadas.some((a) => a.label === c.label)) {
        achadas.push({ label: c.label, hex: c.hex, pos: m.index });
        break;
      }
    }
  }
  if (achadas.length === 0) return null;

  // Pela ordem em que aparecem no texto: a primeira é a cor do corpo.
  achadas.sort((a, b) => a.pos - b.pos);
  const [primeira, segunda] = achadas;

  // Só junta a segunda quando é mesmo um par de cores ("BLACK/GOLDEN"), e não
  // quando são três ou mais — aí a descrição fala do produto todo e um swatch
  // de duas cores já seria ficção.
  if (segunda && achadas.length === 2) {
    return { label: `${primeira.label} & ${segunda.label}`, hex: [primeira.hex, segunda.hex] };
  }
  return { label: primeira.label, hex: [primeira.hex] };
}
