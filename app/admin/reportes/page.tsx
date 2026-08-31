import { redirect } from "next/navigation";
import { currentStaff } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { AdminHero } from "@/components/admin/admin-hero";
import { ResolverBotao } from "./resolver";

export const dynamic = "force-dynamic";

// /admin/reportes — o histórico de problemas reportados.
//
// Esta página é a fonte de verdade, e não a caixa de correio: o reporte é
// sempre gravado antes de se tentar enviar o email. Se o envio falhar, ou se a
// chave ainda não estiver configurada, aparece aqui na mesma, marcado como por
// enviar.
//
// Só o patrão. Os reportes trazem emails de colegas, caminhos internos e stacks
// — não é informação de balcão.

const ROTULO: Record<string, string> = {
  VENDA: "Não consegue registar uma venda",
  ARTIGO: "Artigo aparece errado",
  PAGINA: "Página não carrega ou dá erro",
  NUMEROS: "Números não batem certo",
  OUTRO: "Outro",
  AUTOMATICO: "Falha automática",
};

const quando = (d: Date) =>
  d.toLocaleString("pt-PT", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

export default async function ReportesPage({
  searchParams,
}: {
  searchParams: Promise<{ ver?: string }>;
}) {
  const staff = await currentStaff();
  if (staff?.role !== "ADMIN") redirect("/admin/pos");
  const sp = await searchParams;
  const mostrarResolvidos = sp.ver === "resolvidos";

  const [reportes, porResolver] = await Promise.all([
    prisma.reporte.findMany({
      where: { resolvido: mostrarResolvidos },
      orderBy: { ultimaEm: "desc" },
      take: 100,
    }),
    prisma.reporte.count({ where: { resolvido: false } }),
  ]);

  return (
    <div className="painel space-y-6">
      <AdminHero
        eyebrow="Sistema"
        title="Problemas reportados"
        subtitle="O que as lojas reportaram pelo botão, e o que a aplicação reportou sozinha."
      />

      <div className="flex items-center gap-2">
        <a
          href="/admin/reportes"
          className={`rounded-full border px-4 py-1.5 text-[0.72rem] font-medium tracking-[0.12em] uppercase ${
            mostrarResolvidos ? "border-line text-muted" : "border-gold bg-gold/10 text-gold"
          }`}
        >
          Por resolver ({porResolver})
        </a>
        <a
          href="/admin/reportes?ver=resolvidos"
          className={`rounded-full border px-4 py-1.5 text-[0.72rem] font-medium tracking-[0.12em] uppercase ${
            mostrarResolvidos ? "border-gold bg-gold/10 text-gold" : "border-line text-muted"
          }`}
        >
          Resolvidos
        </a>
      </div>

      {reportes.length === 0 ? (
        <div className="painel-card p-10 text-center">
          <p className="text-sm text-muted">
            {mostrarResolvidos ? "Ainda não há nada resolvido." : "Nada reportado. Bom sinal."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reportes.map((r) => {
            const passos = (r.passos as { em: number; tipo: string; texto: string }[] | null) ?? [];
            const erros = (r.erros as { mensagem: string; origem: string; stack?: string }[] | null) ?? [];
            const pedidos =
              (r.pedidos as { metodo: string; caminho: string; estado: number | string; ms: number; mensagem?: string }[] | null) ?? [];
            const ambiente = (r.ambiente as Record<string, unknown> | null) ?? {};
            return (
              <details key={r.id} className="painel-card overflow-hidden">
                <summary className="flex cursor-pointer flex-wrap items-center gap-3 p-4">
                  {r.bloqueado && (
                    <span className="rounded-full bg-[#b94a3a]/10 px-2.5 py-0.5 text-[0.6rem] font-semibold tracking-[0.1em] text-[#b94a3a] uppercase">
                      Bloqueado
                    </span>
                  )}
                  <span className="font-medium text-ink">{ROTULO[r.categoria] ?? r.categoria}</span>
                  {r.ocorrencias > 1 && (
                    <span className="rounded-full bg-cream px-2 py-0.5 text-[0.62rem] text-muted">
                      ×{r.ocorrencias}
                    </span>
                  )}
                  <span className="ml-auto text-[0.68rem] text-muted">
                    {r.email} · {quando(r.ultimaEm)}
                    {!r.enviadoEm && " · email por enviar"}
                  </span>
                </summary>

                <div className="space-y-4 border-t border-line px-4 py-4 text-[0.78rem]">
                  <dl className="grid gap-x-6 gap-y-1 sm:grid-cols-[7rem_1fr]">
                    <dt className="text-muted">Onde</dt>
                    <dd className="break-all text-ink">{r.url}</dd>
                    <dt className="text-muted">Versão</dt>
                    <dd className="text-ink">{r.commit?.slice(0, 8) ?? "local"}</dd>
                    <dt className="text-muted">Origem</dt>
                    <dd className="text-ink">{r.origem}</dd>
                  </dl>

                  {r.descricao && (
                    <p className="border-l-2 border-gold pl-3 text-ink italic">{r.descricao}</p>
                  )}

                  {passos.length > 0 && (
                    <Seccao titulo="Últimos passos">
                      {passos.map((p, i) => (
                        <li key={i}>
                          <span className="text-muted">
                            {new Date(p.em).toLocaleTimeString("pt-PT")} · {p.tipo}
                          </span>{" "}
                          {p.texto}
                        </li>
                      ))}
                    </Seccao>
                  )}

                  {erros.length > 0 && (
                    <Seccao titulo="Erros">
                      {erros.map((e, i) => (
                        <li key={i}>
                          <span className="text-[#b94a3a]">[{e.origem}]</span> {e.mensagem}
                          {e.stack && (
                            <pre className="mt-1 overflow-x-auto rounded bg-cream p-2 text-[0.68rem] text-muted">
                              {e.stack}
                            </pre>
                          )}
                        </li>
                      ))}
                    </Seccao>
                  )}

                  {pedidos.length > 0 && (
                    <Seccao titulo="Pedidos falhados">
                      {pedidos.map((p, i) => (
                        <li key={i}>
                          {p.metodo} {p.caminho} → <span className="text-[#b94a3a]">{p.estado}</span> ({p.ms}ms)
                          {p.mensagem && <span className="text-muted"> — {p.mensagem}</span>}
                        </li>
                      ))}
                    </Seccao>
                  )}

                  {Object.keys(ambiente).length > 0 && (
                    <Seccao titulo="Máquina">
                      {Object.entries(ambiente).map(([k, v]) => (
                        <li key={k}>
                          <span className="text-muted">{k}:</span> {String(v)}
                        </li>
                      ))}
                    </Seccao>
                  )}

                  {!r.resolvido && <ResolverBotao id={r.id} />}
                </div>
              </details>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Seccao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[0.58rem] font-semibold tracking-[0.12em] text-gold uppercase">{titulo}</p>
      <ul className="mt-1 space-y-1 font-mono text-[0.72rem] leading-relaxed text-ink">{children}</ul>
    </div>
  );
}
