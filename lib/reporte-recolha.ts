"use client";

// Recolha de contexto para os reportes de problema.
//
// Parte-se do princípio de que a descrição vai ser "não deu": quem está ao
// balcão com um cliente à frente não escreve um relatório. Logo, o valor do
// reporte tem de vir do que é apanhado sozinho.
//
// Tudo vive em anéis de memória de tamanho fixo, no browser. Nada é enviado
// enquanto ninguém carregar no botão (ou algo rebentar), e nada é gravado no
// disco do utilizador.
//
// PRIVACIDADE — as reparações guardam nome, telefone e email de clientes.
// Por isso:
//   • os corpos de pedidos e respostas NUNCA são capturados, só o método, o
//     caminho, o código e a mensagem de erro que a API devolve;
//   • o estado do ecrã é por lista de permissões: cada página declara o que
//     pode ser capturado (ver `declararEstado`), em vez de se despejar tudo;
//   • o que passa por aqui em texto livre é mascarado antes de sair.

const MAX_PASSOS = 25;
const MAX_ERROS = 10;
const MAX_PEDIDOS = 15;

export interface Passo {
  em: number; // Date.now()
  tipo: "rota" | "clique" | "submissao" | "pedido" | "erro";
  texto: string;
}
export interface ErroApanhado {
  em: number;
  mensagem: string;
  stack?: string;
  origem: string; // "window.onerror" | "promessa" | "boundary"
}
export interface PedidoFalhado {
  em: number;
  metodo: string;
  caminho: string;
  estado: number | string;
  ms: number;
  mensagem?: string;
}

const passos: Passo[] = [];
const erros: ErroApanhado[] = [];
const pedidos: PedidoFalhado[] = [];

function guardar<T>(anel: T[], item: T, max: number) {
  anel.push(item);
  if (anel.length > max) anel.splice(0, anel.length - max);
}

/**
 * Mascara o que parecer dado pessoal. Aplica-se a texto livre que vá no
 * reporte — descrições, mensagens de erro, rótulos de botões. Não substitui a
 * lista de permissões do estado; é a segunda rede, para o caso de um nome de
 * cliente aparecer numa mensagem de erro.
 */
export function mascarar(s: string): string {
  return s
    .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, "«email»")
    .replace(/(?:\+351\s?)?\b9[1236]\d[\s.-]?\d{3}[\s.-]?\d{3}\b/g, "«telemóvel»");
}

export function registarPasso(tipo: Passo["tipo"], texto: string) {
  guardar(passos, { em: Date.now(), tipo, texto: mascarar(texto).slice(0, 220) }, MAX_PASSOS);
}

export function registarErro(mensagem: string, origem: string, stack?: string) {
  const e: ErroApanhado = {
    em: Date.now(),
    mensagem: mascarar(mensagem).slice(0, 500),
    origem,
    stack: stack?.split("\n").slice(0, 12).join("\n"),
  };
  guardar(erros, e, MAX_ERROS);
  registarPasso("erro", mensagem.slice(0, 120));
}

// ── Estado do ecrã, por lista de permissões ────────────────────────────────
// Cada página chama `declararEstado` com o que PODE ser capturado. Sem esta
// chamada não vai estado nenhum — o silêncio é o comportamento seguro.
let estadoDaPagina: Record<string, unknown> = {};
export function declararEstado(estado: Record<string, unknown>) {
  estadoDaPagina = estado;
}
export function limparEstado() {
  estadoDaPagina = {};
}

// ── Ambiente ───────────────────────────────────────────────────────────────
// `desvioRelogio` é medido contra o servidor. Esta aplicação é feita de
// janelas de datas — um PC com a hora errada produz relatórios que não batem
// certo e ninguém percebe porquê.
let desvioRelogio: number | null = null;
export function registarHoraServidor(iso: string) {
  desvioRelogio = Date.now() - new Date(iso).getTime();
}

function ambiente() {
  if (typeof window === "undefined") return {};
  const nav = navigator as Navigator & { connection?: { effectiveType?: string } };
  return {
    agente: navigator.userAgent,
    idioma: navigator.language,
    ecra: `${window.screen.width}×${window.screen.height}`,
    janela: `${window.innerWidth}×${window.innerHeight}`,
    online: navigator.onLine,
    ligacao: nav.connection?.effectiveType ?? null,
    fuso: Intl.DateTimeFormat().resolvedOptions().timeZone,
    desvioRelogioMs: desvioRelogio,
  };
}

/** Tudo o que foi apanhado, pronto a enviar. */
export function recolher() {
  return {
    passos: [...passos],
    erros: [...erros],
    pedidos: [...pedidos],
    estado: estadoDaPagina,
    ambiente: ambiente(),
  };
}

function caminhoDe(url: string): string {
  try {
    return new URL(url, window.location.origin).pathname;
  } catch {
    return url.slice(0, 120);
  }
}

// ── Instalação dos ouvintes ────────────────────────────────────────────────
let instalado = false;

/**
 * Liga a recolha. Chamado uma vez, do cabeçalho do painel.
 *
 * O `fetch` é embrulhado para registar os pedidos que falham. Só se guarda o
 * método, o caminho, o código, a duração e — quando a resposta é o nosso JSON
 * de erro — a mensagem. Nunca o corpo.
 */
export function instalarRecolha() {
  if (instalado || typeof window === "undefined") return;
  instalado = true;

  window.addEventListener("error", (e) => {
    registarErro(e.message, "window.onerror", e.error?.stack);
  });
  window.addEventListener("unhandledrejection", (e) => {
    const r = e.reason;
    registarErro(
      r instanceof Error ? r.message : String(r),
      "promessa",
      r instanceof Error ? r.stack : undefined,
    );
  });

  // Cliques em controlos identificáveis. Usa-se o texto visível ou o
  // aria-label — o que a pessoa viu, não o id interno.
  document.addEventListener(
    "click",
    (e) => {
      const alvo = (e.target as HTMLElement | null)?.closest("button, a, [role=button]");
      if (!alvo) return;
      const nome =
        alvo.getAttribute("aria-label") ?? alvo.textContent?.trim().replace(/\s+/g, " ") ?? "";
      if (nome) registarPasso("clique", nome.slice(0, 80));
    },
    { capture: true },
  );

  document.addEventListener(
    "submit",
    (e) => {
      const f = e.target as HTMLFormElement;
      registarPasso("submissao", f.getAttribute("action") ?? "formulário");
    },
    { capture: true },
  );

  const fetchOriginal = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const arranque = performance.now();
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const metodo = (init?.method ?? "GET").toUpperCase();
    try {
      const res = await fetchOriginal(input, init);
      if (!res.ok) {
        let mensagem: string | undefined;
        // Só a mensagem do nosso envelope {ok:false,error}. O clone evita
        // consumir o corpo que quem chamou ainda vai ler.
        try {
          const tipo = res.headers.get("content-type") ?? "";
          if (tipo.includes("application/json")) {
            const j = (await res.clone().json()) as { error?: unknown };
            if (typeof j.error === "string") mensagem = mascarar(j.error).slice(0, 300);
          }
        } catch {
          /* corpo ilegível — o código de estado já diz o essencial */
        }
        const p: PedidoFalhado = {
          em: Date.now(),
          metodo,
          caminho: caminhoDe(url),
          estado: res.status,
          ms: Math.round(performance.now() - arranque),
          mensagem,
        };
        guardar(pedidos, p, MAX_PEDIDOS);
        registarPasso("pedido", `${metodo} ${p.caminho} → ${res.status}`);
      }
      return res;
    } catch (err) {
      const p: PedidoFalhado = {
        em: Date.now(),
        metodo,
        caminho: caminhoDe(url),
        estado: "rede",
        ms: Math.round(performance.now() - arranque),
        mensagem: err instanceof Error ? err.message.slice(0, 200) : undefined,
      };
      guardar(pedidos, p, MAX_PEDIDOS);
      registarPasso("pedido", `${metodo} ${p.caminho} → falhou a rede`);
      throw err;
    }
  };
}
