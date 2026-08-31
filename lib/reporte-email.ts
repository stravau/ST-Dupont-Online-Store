import "server-only";

// Envio dos reportes por email.
//
// Isolado de propósito num módulo só: o reporte é SEMPRE gravado na base antes
// de se tentar enviar seja o que for, e a página /admin/reportes é a fonte de
// verdade. Se o email falhar, ou se ainda não houver chave configurada, não se
// perde nada — e trocar de canal (Telegram, Slack) é mexer só aqui.
//
// Enquanto RESEND_API_KEY não existir, a função não faz nada e diz porquê. É
// deliberado: o sistema funciona sem email desde o primeiro dia.

const PARA = process.env.REPORTE_EMAIL ?? "luismanuelribeiro.work@gmail.com";
// O domínio de teste do Resend não exige DNS nenhum, mas só entrega ao
// endereço da conta. Chega para um destinatário único; no dia em que houver
// mais do que um, é preciso verificar um domínio.
const DE = process.env.REPORTE_REMETENTE ?? "S.T. Dupont · Painel <onboarding@resend.dev>";

export interface ReporteParaEmail {
  id: string;
  categoria: string;
  bloqueado: boolean;
  descricao: string | null;
  email: string | null;
  role: string | null;
  url: string;
  commit: string | null;
  origem: string;
  ocorrencias: number;
  passos?: unknown;
  erros?: unknown;
  pedidos?: unknown;
  estado?: unknown;
  ambiente?: unknown;
  auditoria?: unknown;
}

const ROTULO: Record<string, string> = {
  VENDA: "Não consegue registar uma venda",
  ARTIGO: "Artigo aparece errado",
  PAGINA: "Página não carrega ou dá erro",
  NUMEROS: "Números não batem certo",
  OUTRO: "Outro",
  AUTOMATICO: "Falha automática (ninguém reportou)",
};

const hora = (n: number) =>
  new Date(n).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

function bloco(titulo: string, linhas: string[]): string {
  if (linhas.length === 0) return "";
  return `\n${titulo}\n${"─".repeat(titulo.length)}\n${linhas.join("\n")}\n`;
}

/**
 * O corpo em texto simples. Texto e não HTML porque isto é lido a correr, no
 * telemóvel, para decidir se é urgente — e porque um passo-a-passo alinhado
 * lê-se melhor em monoespaçado do que numa tabela.
 */
export function corpoDoEmail(r: ReporteParaEmail): string {
  const passos = (r.passos as { em: number; tipo: string; texto: string }[] | null) ?? [];
  const erros = (r.erros as { em: number; mensagem: string; origem: string; stack?: string }[] | null) ?? [];
  const pedidos =
    (r.pedidos as { em: number; metodo: string; caminho: string; estado: number | string; ms: number; mensagem?: string }[] | null) ?? [];
  const auditoria =
    (r.auditoria as { createdAt: string; entityType: string; action: string; entityId?: string; note?: string }[] | null) ?? [];
  const amb = (r.ambiente as Record<string, unknown> | null) ?? {};

  return [
    `${ROTULO[r.categoria] ?? r.categoria}${r.bloqueado ? "  ·  BLOQUEADO" : ""}`,
    r.ocorrencias > 1 ? `Já aconteceu ${r.ocorrencias} vezes.` : "",
    "",
    `Quem      ${r.email ?? "?"} (${r.role ?? "?"})`,
    `Onde      ${r.url}`,
    `Versão    ${r.commit?.slice(0, 8) ?? "local"}`,
    `Origem    ${r.origem}`,
    r.descricao ? `\nDisse:\n  "${r.descricao}"` : "\n(sem descrição — o contexto abaixo é o que há)",
    bloco(
      "Últimos passos",
      passos.map((p) => `  ${hora(p.em)}  ${p.tipo.padEnd(10)} ${p.texto}`),
    ),
    bloco(
      "Erros apanhados",
      erros.flatMap((e) => [
        `  ${hora(e.em)}  [${e.origem}] ${e.mensagem}`,
        ...(e.stack ? e.stack.split("\n").map((l) => `      ${l.trim()}`) : []),
      ]),
    ),
    bloco(
      "Pedidos falhados",
      pedidos.map((p) => `  ${hora(p.em)}  ${p.metodo} ${p.caminho} → ${p.estado} (${p.ms}ms)${p.mensagem ? `\n      ${p.mensagem}` : ""}`),
    ),
    bloco(
      "Estado do ecrã",
      Object.entries((r.estado as Record<string, unknown>) ?? {}).map(([k, v]) => `  ${k}: ${JSON.stringify(v)}`),
    ),
    bloco(
      "Últimas alterações desta pessoa (auditoria)",
      auditoria.map(
        (a) =>
          `  ${new Date(a.createdAt).toLocaleString("pt-PT")}  ${a.action} ${a.entityType}${a.entityId ? ` ${a.entityId}` : ""}${a.note ? ` — ${a.note}` : ""}`,
      ),
    ),
    bloco(
      "Máquina",
      Object.entries(amb).map(([k, v]) => `  ${k}: ${String(v)}`),
    ),
    "",
    `Reporte ${r.id}`,
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Envia. Devolve se saiu — quem chama grava a data de envio.
 *
 * Nunca lança: uma falha de email não pode fazer falhar o pedido em que o
 * utilizador está. Se correr mal, fica registado na consola do servidor e o
 * reporte continua na base à espera.
 */
export async function enviarReporte(r: ReporteParaEmail): Promise<boolean> {
  const chave = process.env.RESEND_API_KEY;
  if (!chave) {
    console.warn("[reporte] RESEND_API_KEY por definir — reporte gravado, email não enviado");
    return false;
  }
  const urgente = r.bloqueado || r.origem !== "BOTAO";
  const assunto = `${urgente ? "[URGENTE] " : ""}${ROTULO[r.categoria] ?? r.categoria} · ${new URL(r.url).pathname}`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${chave}`, "content-type": "application/json" },
      body: JSON.stringify({ from: DE, to: [PARA], subject: assunto, text: corpoDoEmail(r) }),
    });
    if (!res.ok) {
      console.error("[reporte] Resend devolveu", res.status, (await res.text()).slice(0, 300));
      return false;
    }
    return true;
  } catch (e) {
    console.error("[reporte] falhou o envio:", e);
    return false;
  }
}
