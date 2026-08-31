import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { currentStaff } from "@/lib/admin-auth";
import { assertRateLimit, assertSameOrigin } from "@/lib/admin-api";
import { enviarReporte } from "@/lib/reporte-email";

export const dynamic = "force-dynamic";

// POST /api/admin/reporte — recebe um reporte de problema.
//
// Guarda SEMPRE na base antes de qualquer tentativa de envio: se o email
// falhar, ou ainda não estiver configurado, o reporte não se perde. A página
// /admin/reportes é a fonte de verdade; o email é só a notificação.

const CATEGORIAS = new Set(["VENDA", "ARTIGO", "PAGINA", "NUMEROS", "OUTRO", "AUTOMATICO"]);
const ORIGENS = new Set(["BOTAO", "BOUNDARY", "API"]);

interface Corpo {
  categoria?: string;
  bloqueado?: boolean;
  descricao?: string;
  url?: string;
  origem?: string;
  passos?: unknown;
  erros?: unknown;
  pedidos?: unknown;
  estado?: unknown;
  ambiente?: unknown;
}

/**
 * A impressão digital que agrupa reportes. O mesmo erro na mesma rota é uma
 * entrada com contador, e não cinquenta emails iguais.
 *
 * Junta a rota (sem query — os filtros mudam, o sítio não), a categoria e a
 * primeira linha do erro mais recente. Sem erro, cai na descrição, porque duas
 * pessoas a queixarem-se do mesmo no mesmo sítio são provavelmente o mesmo
 * problema.
 */
function impressaoDigital(rota: string, categoria: string, erro?: string, descricao?: string) {
  const nucleo = erro?.split("\n")[0]?.slice(0, 200) ?? descricao?.slice(0, 120) ?? "";
  return createHash("sha1").update(`${rota}|${categoria}|${nucleo}`).digest("hex").slice(0, 16);
}

export async function POST(req: Request) {
  const csrf = assertSameOrigin(req);
  if (csrf) return csrf;
  // Generoso mas não ilimitado: um erro em ciclo não pode encher a tabela.
  const rl = await assertRateLimit(req, "reporte", 20, 60_000);
  if (rl) return rl;

  const staff = await currentStaff();
  if (!staff?.email) {
    return NextResponse.json({ ok: false, error: "sem sessão" }, { status: 401 });
  }

  let body: Corpo;
  try {
    body = (await req.json()) as Corpo;
  } catch {
    return NextResponse.json({ ok: false, error: "json inválido" }, { status: 400 });
  }

  const categoria = CATEGORIAS.has(body.categoria ?? "") ? body.categoria! : "OUTRO";
  const origem = ORIGENS.has(body.origem ?? "") ? body.origem! : "BOTAO";
  const url = (body.url ?? "").slice(0, 500);
  const rota = url.split("?")[0] || "(desconhecida)";

  const erros = Array.isArray(body.erros) ? body.erros : [];
  const primeiroErro =
    erros.length > 0 ? String((erros[erros.length - 1] as { mensagem?: string })?.mensagem ?? "") : undefined;
  const impressao = impressaoDigital(rota, categoria, primeiroErro, body.descricao);

  // ── O que só o servidor sabe ─────────────────────────────────────────────
  // As últimas acções auditadas desta pessoa. Não é o que ela julga ter feito
  // — é o que ficou gravado, com o antes e o depois.
  const utilizador = await prisma.user.findUnique({
    where: { email: staff.email },
    select: { id: true },
  });
  const auditoria = utilizador
    ? await prisma.adminAction.findMany({
        where: { userId: utilizador.id },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { createdAt: true, entityType: true, action: true, entityId: true, note: true },
      })
    : [];

  const servidor = {
    horaServidor: new Date().toISOString(),
    commit: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
    ambienteVercel: process.env.VERCEL_ENV ?? "local",
  };

  // Agrupar: se já existe um reporte com a mesma impressão por resolver,
  // incrementa em vez de criar outro.
  const existente = await prisma.reporte.findFirst({
    where: { impressao, resolvido: false },
    orderBy: { createdAt: "desc" },
  });

  if (existente) {
    const r = await prisma.reporte.update({
      where: { id: existente.id },
      data: {
        ocorrencias: { increment: 1 },
        ultimaEm: new Date(),
        // O contexto mais recente substitui o anterior: interessa o último
        // caso, não o primeiro, porque é esse que a pessoa tem à frente.
        passos: (body.passos ?? undefined) as never,
        erros: (body.erros ?? undefined) as never,
        pedidos: (body.pedidos ?? undefined) as never,
        estado: (body.estado ?? undefined) as never,
        ambiente: (body.ambiente ?? undefined) as never,
        auditoria: auditoria as never,
        servidor: servidor as never,
      },
      select: { id: true, ocorrencias: true },
    });
    // Repetido: nao se volta a enviar email a cada ocorrencia — era assim que
    // um erro em ciclo enchia a caixa de correio e deixava de ser lido. O
    // contador na pagina /admin/reportes diz quantas vezes aconteceu.
    return NextResponse.json({ ok: true, id: r.id, repetido: true, ocorrencias: r.ocorrencias });
  }

  const r = await prisma.reporte.create({
    data: {
      userId: utilizador?.id ?? null,
      email: staff.email,
      role: staff.role ?? null,
      categoria,
      bloqueado: body.bloqueado === true,
      descricao: (body.descricao ?? "").slice(0, 2000) || null,
      url,
      rota,
      commit: servidor.commit,
      origem,
      impressao,
      passos: (body.passos ?? undefined) as never,
      erros: (body.erros ?? undefined) as never,
      pedidos: (body.pedidos ?? undefined) as never,
      estado: (body.estado ?? undefined) as never,
      ambiente: (body.ambiente ?? undefined) as never,
      auditoria: auditoria as never,
      servidor: servidor as never,
    },
    select: { id: true },
  });

  // O email vai depois da gravacao e o seu resultado nao afecta a resposta: se
  // falhar, o reporte ja esta guardado e aparece na pagina como por enviar.
  const enviado = await enviarReporte({
    id: r.id,
    categoria,
    bloqueado: body.bloqueado === true,
    descricao: (body.descricao ?? "").slice(0, 2000) || null,
    email: staff.email,
    role: staff.role ?? null,
    url: url || "https://—/",
    commit: servidor.commit,
    origem,
    ocorrencias: 1,
    passos: body.passos,
    erros: body.erros,
    pedidos: body.pedidos,
    estado: body.estado,
    ambiente: body.ambiente,
    auditoria,
  });
  if (enviado) {
    await prisma.reporte.update({ where: { id: r.id }, data: { enviadoEm: new Date() } });
  }

  return NextResponse.json({ ok: true, id: r.id, repetido: false });
}
