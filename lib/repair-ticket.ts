// Ficha de Assistência — o papel que o cliente leva quando deixa uma peça.
// Texto transcrito do template Word STD_Ticket_Reparacao.docx; vive aqui em
// vez de na base de dados porque é igual em todas as fichas e mudá-lo é uma
// decisão jurídica, não um dado operacional.

import type { BoutiqueCode } from "@/lib/pos";

// A condicao "Expediente de envio" foi retirada por decisao da loja. A
// numeracao no talao e `list-decimal`, portanto acerta-se sozinha.
export const REPAIR_TERMS: { title: string; body: string }[] = [
  {
    title: "Artigo em garantia",
    body:
      "Sem qualquer custo para o cliente, podendo ser substituído por artigo semelhante e de igual valor na eventualidade de a reparação não ser possível.",
  },
  {
    title: "Garantia de reparação",
    body:
      "12 meses a contar da data de entrega do artigo ao cliente (excluindo danos provocados por mau uso do objecto).",
  },
  {
    title: "Tempo de reparação",
    body:
      "Atenta a natureza das peças e dos procedimentos de reparação a efectuar, o tempo de reparação poderá variar entre duas semanas e seis meses. O cliente será devidamente informado de morosidade inesperadamente longa.",
  },
  {
    title: "Eventual extravio do objecto",
    body:
      "Na eventualidade de extravio do objecto desde a data de recepção em loja, implicará a compensação ao cliente de objecto comparável e disponível em catálogo da ST DUPONT.",
  },
  {
    title: "Não levantamento do objecto reparado",
    body:
      "O cliente deverá proceder ao levantamento do objecto reparado e pagamento do respectivo preço, em conformidade com o valor orçamentado, no prazo de 180 dias da data de notificação para o seu levantamento em loja. Findo esse prazo, sem levantamento nem pagamento do valor da reparação, o objecto reverte a favor do prestador do serviço de reparação para compensação do serviço prestado.",
  },
];

// "LIS-0047" — a referência que o cliente cita ao telefone. O prefixo da loja
// existe porque as sequências são independentes: sem ele, o nº 47 seria
// ambíguo entre Lisboa e Gaia.
export function ticketRef(boutique: BoutiqueCode, n: number | null | undefined): string {
  if (n == null) return "—";
  return `${boutique}-${String(n).padStart(4, "0")}`;
}

export const REPAIR_TYPE_LABEL: Record<string, string> = {
  ISQUEIRO: "Isqueiro",
  ESCRITA: "Escrita",
  PELE: "Pele",
};
