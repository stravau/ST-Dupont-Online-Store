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

// O mesmo título no assunto e na primeira linha do corpo. Quem recebe isto no
// telemóvel vê a notificação e o corpo em sítios diferentes, e a mesma palavra
// nos dois liga um ao outro sem ter de pensar.
const TITULO = "PROBLEMA REPORTADO";

const hora = (n: number) =>
  new Date(n).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

/**
 * O ecrã, o browser e o fuso horário não se leem — despejavam dez linhas em
 * todos os emails e nenhuma delas mudava a decisão de quem os lê. Fica só o
 * que EXPLICA a falha: sem rede, rede muito fraca, ou relógio da máquina
 * errado (que estraga as horas das vendas). Se estiver tudo normal não
 * aparece nada — o silêncio aqui também é informação. O resto continua
 * guardado na base e vê-se em /admin/reportes quando fizer falta.
 */
function notasDaMaquina(amb: Record<string, unknown>): string {
  const notas: string[] = [];
  if (amb.online === false) notas.push("  A máquina estava SEM ligação à internet.");
  if (amb.ligacao === "slow-2g" || amb.ligacao === "2g")
    notas.push(`  Ligação muito fraca (${String(amb.ligacao)}) — pode ser só lentidão.`);
  const desvio = typeof amb.desvioRelogioMs === "number" ? amb.desvioRelogioMs : 0;
  if (Math.abs(desvio) > 120_000)
    notas.push(
      `  O relógio da máquina está ${Math.round(Math.abs(desvio) / 60_000)} min ${desvio > 0 ? "à frente" : "atrasado"} — as horas que ela regista não são de fiar.`,
    );
  return bloco("Atenção", notas);
}

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
    TITULO,
    "═".repeat(TITULO.length),
    `${ROTULO[r.categoria] ?? r.categoria}${r.bloqueado ? "  ·  BLOQUEADO" : ""}`,
    r.ocorrencias > 1 ? `Já aconteceu ${r.ocorrencias} vezes.` : "",
    // A linha em branco vai colada ao "Quem" porque o .filter(Boolean) lá em
    // baixo come as strings vazias — e sem ela o subtítulo fica agarrado aos
    // dados, que era o que se via nos emails até agora.
    `
Quem      ${r.email ?? "?"} (${r.role ?? "?"})`,
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
    notasDaMaquina(amb),
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
  // Título e, a seguir, o subtítulo — a categoria por palavras. O caminho da
  // página ficou de fora: no telemóvel o assunto é cortado aos poucos caracteres
  // e o que interessa ver na notificação é O QUE se passou, não onde. O onde
  // está na primeira linha do corpo.
  const assunto = `${urgente ? "[URGENTE] " : ""}${TITULO} · ${ROTULO[r.categoria] ?? r.categoria}`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${chave}`, "content-type": "application/json" },
      body: JSON.stringify({
        from: DE,
        to: [PARA],
        subject: assunto,
        text: corpoDoEmail(r),
        // Responder ao email responde a quem reportou. Dá jeito, e é o sinal
        // mais forte que existe de que isto é correio de pessoa para pessoa e
        // não uma newsletter — que é metade da razão por que o Gmail atira
        // mensagens destas para o separador das promoções.
        ...(r.email ? { reply_to: r.email } : {}),
        headers: {
          // Sem List-Unsubscribe DE PROPÓSITO: é esse o cabeçalho que marca
          // uma mensagem como envio em massa. Aqui só faria mal.
          "X-Entity-Ref-ID": r.id, // impede o Gmail de agrupar reportes distintos
          ...(urgente ? { Importance: "high", "X-Priority": "1 (Highest)" } : {}),
        },
      }),
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
