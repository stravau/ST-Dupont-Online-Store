// Cache das leituras do catálogo.
//
// A loja não tinha cache nenhum: cada visita a uma página de produto ou de
// categoria ia à Neon buscar os produtos inteiros — variantes, arrays de
// imagens, descrições e histórico em JSON. Com os robôs de indexação a
// percorrer o catálogo todo em dois idiomas, isso esgotou a quota de
// transferência da base e deitou o site abaixo (15/08/2026).
//
// Porquê cachar os DADOS e não as PÁGINAS: o `force-dynamic` no layout de
// [lang] existe desde Maio para o `next build` nunca tocar em Postgres, e
// essa garantia continua a valer — um deploy durante a falha de ontem teria
// rebentado o build. Cachar aqui corta o tráfego sem mexer nisso.
//
// A janela é curta de propósito. A correcção vem da invalidação explícita em
// cada escrita (ver `invalidarCatalogo`); a janela é só a rede de segurança
// para o dia em que um caminho de escrita novo se esquecer de a chamar.
import { unstable_cache, revalidateTag } from "next/cache";

export const CATALOGO_TAG = "catalogo";

const JANELA_SEGUNDOS = 300;

export function comCache<A extends unknown[], R>(
  fn: (...args: A) => Promise<R>,
  chave: string,
): (...args: A) => Promise<R> {
  // Os argumentos entram na chave de cache automaticamente — `chave` é só o
  // prefixo que separa funções diferentes.
  return unstable_cache(fn, [chave], {
    tags: [CATALOGO_TAG],
    revalidate: JANELA_SEGUNDOS,
  });
}

/**
 * Deita fora o catálogo em cache. Chamar em TODAS as escritas que a loja
 * mostra: venda no POS, anulação, sync do ERP, edição de stock, movimentos,
 * fotos, descrições, destaques.
 *
 * `expire: 0` e não o `"max"` recomendado: o "max" serve conteúdo velho
 * enquanto vai buscar o novo em segundo plano, e aqui o que está em causa é
 * stock de loja — depois de uma venda, o próximo visitante tem de ver o
 * número certo, não o de antes. A espera extra é de uma consulta.
 *
 * (A forma de um só argumento, `revalidateTag(tag)`, está obsoleta no
 * Next 16; `updateTag`, que expira já, só se pode chamar de Server Actions e
 * as nossas escritas são quase todas Route Handlers.)
 */
export function invalidarCatalogo() {
  try {
    revalidateTag(CATALOGO_TAG, { expire: 0 });
  } catch (e) {
    console.error("[catalogo] invalidacao falhou:", e);
    // Fora de um pedido — um script de manutenção, o seed — não há cache
    // para invalidar e o revalidateTag rebenta. Escrever na base não pode
    // falhar por causa disto.
  }
}
