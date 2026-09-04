// A janela do mapa de calor: sempre 8 semanas, deslocável para trás.
//
// Não é uma lista de durações. O mapa serve para ler "em que dia da semana se
// vende mais", e essa leitura só se compara consigo própria se as janelas
// tiverem todas o mesmo tamanho — oito semanas contra oito semanas. Mudar a
// duração mudava a base de comparação e o mapa deixava de responder à
// pergunta.
//
// Vive num módulo NEUTRO — nem "use client" nem servidor — porque os dois
// lados precisam dele: a página (componente de servidor) valida o ?bloco= do
// URL, e o widget (componente de cliente) desenha as setas. Um módulo de
// cliente não serve: um componente de servidor não pode invocar uma função
// dele, e o TypeScript não avisa — rebenta só quando a página é pedida.

export const SEMANAS_BLOCO = 8;

// Quantos blocos para trás se pode recuar. Oito semanas cada, portanto 26
// blocos são quatro anos — muito mais do que a loja tem de histórico, e
// suficiente para o limite nunca se sentir. Existe só para o ?bloco= não
// aceitar um número absurdo e mandar o servidor procurar vendas no século
// passado.
const BLOCO_MAX = 26;

/**
 * Lê o ?bloco= do URL sem confiar nele. 0 é a janela que acaba hoje, 1 as
 * oito semanas anteriores, e assim por diante. Qualquer coisa que não seja um
 * inteiro dentro dos limites cai em 0.
 */
export function blocoValido(v: string | undefined): number {
  const n = Number(v);
  if (!Number.isInteger(n) || n < 0 || n > BLOCO_MAX) return 0;
  return n;
}

export function podeRecuar(bloco: number): boolean {
  return bloco < BLOCO_MAX;
}

/** A data que ancora a janela: hoje, recuado o número de blocos pedido. */
export function ancoraDoBloco(bloco: number, agora: Date): Date {
  return new Date(
    agora.getFullYear(),
    agora.getMonth(),
    agora.getDate() - bloco * SEMANAS_BLOCO * 7,
    12, 0, 0, 0,
  );
}
