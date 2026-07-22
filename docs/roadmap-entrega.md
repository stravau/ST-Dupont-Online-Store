# Roteiro até à entrega — S.T. Dupont (loja + POS/admin)

**Objetivo:** ter tudo pronto para o patrão usar a app como ferramenta real
(loja + gestão), com o site público impecável e o Excel a caminho de ser
abandonado. Este documento junta, por fases, **tudo** o que ficou decidido/
identificado nas sessões de trabalho: auditoria, plano de transição Excel→app,
features pendentes e passos de lançamento.

**Como ler:** cada item tem **O quê**, **Porquê** e **Estado**
(✅ feito · 🔜 pendente · ⚠️ decisão tua · 🔒 só tu / ops).
As fases estão por ordem de dependência — não saltar a Fase 0.

---

## FASE 0 — Lançar em segurança (bloqueia tudo o resto) 🔒

O site já está no ar, mas com credenciais de desenvolvimento. **Nada disto é
código — é operação, só tu tens acesso ao Neon/Vercel.** É o único verdadeiro
bloqueio a uma entrega "a sério".

- 🔒 **Rodar a password da base de dados (Neon).** *Porquê:* a password atual
  esteve em texto simples durante o desenvolvimento; quem a viu tem acesso à
  BD. Reset no Neon → nova connection string.
- 🔒 **Rodar o `AUTH_SECRET`.** *Porquê:* é ainda o literal de dev
  (`dev-only-secret-…`); com ele é possível forjar sessões de admin. Gerar novo
  (`node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`).
- 🔒 **Atualizar as variáveis na Vercel + redeploy.** *Porquê:* as novas
  credenciais só entram em vigor com um deploy novo. Pôr `DATABASE_URL` +
  `AUTH_SECRET` novos em Production e redeploy.
- 🔒 **Definir as passwords das 3 contas** (patrão ADMIN, Loja Lisboa, Loja
  Gaia) via `scripts/admin-bootstrap.ts`. *Porquê:* são os acessos reais que
  vais entregar; guardá-las num gestor de passwords.
- 🔒 **Fuso horário dos relatórios: `TZ=Europe/Lisbon` na Vercel.** *Porquê:* o
  servidor corre em UTC; sem isto, uma venda às 23h30 pode cair no dia seguinte
  nos relatórios/exports. (Alternativa em código, mas a env var é a via rápida.)

> **Saída da Fase 0:** produção com segredos próprios, 3 logins a funcionar,
> relatórios no fuso certo. A partir daqui pode-se entregar sem risco de acesso.

---

## FASE 1 — Fechar o site público (montra) ✅ (quase todo feito)

O site do cliente. A maior parte já foi verificada e corrigida nesta sessão.

- ✅ **Smoke test completo da montra** (todas as rotas 200, 404 correto,
  bilingue, mobile, inquiry por email/tel/WhatsApp, disponibilidade por loja).
- ✅ **Headers de segurança** (HSTS, X-Frame-Options/CSP anti-clickjacking,
  nosniff, Referrer-Policy, Permissions-Policy). *Porquê:* proteção base contra
  clickjacking e sniffing, sobretudo no /admin.
- ✅ **XSS no JSON-LD escapado.** *Porquê:* nome/descrição de produto iam sem
  escape para um `<script>`; agora não podem injetar markup.
- ✅ **`<html lang>` correto por locale** (/en deixou de ser servido como `pt`).
- ✅ **Página de erro bonita e bilingue** (em vez do ecrã cru do Next).
- ✅ **Sitemap completo** (novidades, coleções, grupos) + metadata (canonical/
  hreflang/description) nas páginas de coleção e grupo.
- ✅ **robots.txt bloqueia /admin**; **imagem OG da homepage** a resolver.
- ✅ **A11y verificada** (lang, main, h1 único, alt em todas as imagens, skip-link).
- ⚠️ **Contraste do dourado** (texto pequeno falha WCAG AA, 2.83:1). *O quê:*
  escurecer o dourado usado em **texto** (manter nos filetes/bordas).
  *Porquê:* legibilidade/acessibilidade. *Decisão tua* — afeta o look de luxo.

> **Saída da Fase 1:** montra sólida, segura e acessível. Só falta a decisão do
> contraste do dourado (opcional).

---

## FASE 2 — Máquina de sincronização Excel → App (o motor da transição) 🔜

Nenhuma das fases de operação arranca sem isto. Referência completa:
`docs/excel-to-app-transition.md`.

- 🔜 **Modelo `Reserva` + migration.** *O quê:* tabela para a folha `Reservas`
  do Excel (cliente, contacto, artigo, data de espera, estado). *Porquê:* é a
  única folha do ECI sem destino na BD; sem ela o sync não a pode absorver.
  *(~30 min)*
- 🔜 **Endpoint único `POST /api/admin/sync/eci`.** *O quê:* recebe o ficheiro
  ECI completo e absorve as folhas de uma vez — `DB`→stock/PVP/novos +
  outras marcas, `Mov_POS_Loja`→vendas, `Mov_Int_Ext`→movimentos,
  `P.Reparar`→reparações, `Reservas`→reservas, `Danificados`→movimentos,
  `Operadores`→operadores. **Idempotente** (correr 10× = mesmo resultado),
  grava um `AdminAction`. *Porquê:* substitui os scripts CLI à mão; é o que
  permite "arrasta o Excel, vê o relatório". **Não toca em promoções.**
  *(~1 dia; 4 dos 6 parsers já existem em scripts)*
- 🔜 **UI: `/admin/uploads` → 2 cartões.** *O quê:* "Sincronizar ECI Controlo"
  (novo) + "Promoções" (mantém-se); saem os 3 cartões PVP/Stock/Novos.
  Relatório final por folha (X novas · Y já existentes · duração · batch id).
  *Porquê:* um só passo para o patrão; promoções ficam à parte porque não vêm
  do ECI (são decisão de marketing). *(~meio dia)*
- 🔜 **Política de artigos novos (Opção A).** *O quê:* linhas novas na `DB`
  entram como `INDISPONIVEL` (não aparecem no site sem revisão); o relatório do
  sync destaca quantos entraram. *Porquê:* o ECI não traz foto/categoria/inglês,
  logo o artigo não está pronto para o público (ver Fase 5).

> **Saída da Fase 2:** o patrão vê dashboards com dados frescos carregando o
> Excel num clique. Começa a **Fase 1 do plano de transição** (Excel manda,
> app é espelho) — corre semanas até haver confiança.

---

## FASE 3 — POS pronto para operação real 🔜 (parte já feita)

Para a equipa poder largar o Excel, o balcão tem de cobrir a operação toda.

- ✅ **Comissão ECI por loja** (LIS 22% / VNG 19%) + relatório por intervalo.
- ✅ **Vender outras marcas no POS (só Gaia).** *O quê:* o balcão vende Dupont
  **e** outras marcas (Lamy, Parker…), isoladas de Lisboa/Dupont; PVP editável;
  comissão 19%. *Porquê:* Gaia vende fisicamente outras marcas — sem isto essas
  vendas ficavam fora da app e furavam os números.
- 🔜 **Ranking "Outras marcas" nos Relatórios** (usa `bestSellers(…, "OTHER_BRAND")`).
  *Porquê:* o patrão ver o que mais gira das outras marcas. *(~30 min)*
- 🔜 **Registar IP no login** (`recordAttempt` já aceita o IP, mas não o recebe).
  *Porquê:* revisão de incidentes/brute-force. *(~15 min, seguro)*
- ⚠️ **Race de stock no POS.** *O quê:* a venda lê o stock fora da transação e
  escreve valor absoluto; usar `increment` atómico. *Porquê:* duas vendas
  simultâneas do mesmo artigo podiam descontar mal. *(baixa probabilidade,
  mas correção real)*

> **Saída da Fase 3:** balcão cobre 100% da operação (Dupont + outras marcas),
> com números fiáveis. Pré-requisito para os "2 dias de confirmação".

---

## FASE 4 — Ferramentas de gestão nativas (largar o Excel de vez) 🔜

Peças que faltam para a equipa não precisar do Excel para nada. Constroem-se
**conforme a adoção**, não todas de uma vez.

- 🔜 **Seleção múltipla no Consultar Stock** — a peça-chave. *O quê:* filtrar →
  selecionar vários (checkboxes) → aplicar em lote: **criar promoção** (-X% +
  datas), **mudar PVP**, **ativar/tornar disponível**. *Porquê:* resolve de uma
  vez o "1 a 1" das promoções **e** a ativação em massa dos artigos novos
  (Opção A). *(~meio dia)*
- 🔜 **UI de Reservas** — criar, listar, marcar concluída/cancelada. *Porquê:*
  fecha o trio de operações de loja (Vendas · Reparações · Reservas) e espelha o
  Excel. *(~2-3 h, depende do modelo da Fase 2)*
- 🔜 **UI de movimentos de stock** — Entrada/Saída/Transferência/Danificado.
  *Porquê:* substituir a folha `Mov_Int_Ext` sem passar pelo Excel. *(~meio dia)*
- 🔜 **Histórico de movimentos por artigo** — o ledger `StockMovement` é escrito
  mas nunca lido. *Porquê:* auditar o stock de um artigo (quando/quem/porquê).
  *(~2-3 h)*
- 🔜 **Metas dos operadores** — `Operator.monthlyGoalCents` está semeado mas não
  aparece. *O quê:* bloco nos Relatórios com vendido-no-mês vs objetivo + %.
  *Porquê:* motiva a equipa e dá visão ao patrão; os dados já lá estão.
  *(~2-3 h; liga o `topOperators()` que hoje é código morto)*
- 🔜 **Wizard "Novo artigo"** em `/admin/variants`. *Porquê:* criar um artigo à
  mão (fora do ECI) sem Excel. *(~3-4 h)*
- 🔜 **Alertas no painel** — reparações por resolver + stock baixo. *Porquê:*
  tornar a landing acionável, não só informativa. *(~medio)*

> **Saída da Fase 4:** a equipa consegue fazer tudo na app. Pré-requisito para
> a **Fase 3 do plano de transição** (app manda, Excel opcional).

---

## FASE 5 — Catálogo em massa com fotos (a "cara" dos produtos) 🔜 ⚠️

Só arranca quando tiveres as fotos da Dupont. O ECI cria o **esqueleto**
(nome/preço/stock/EAN); a foto/categoria/inglês vêm daqui.

- ⚠️ **Confirmar a forma da "cross-reference" das fotos.** *O quê:* saber se as
  fotos vêm nomeadas por **REF** (o ideal — a convenção do site já é
  `<REF>.webp`), por EAN, ou por nome. *Porquê:* decide se o emparelhamento é
  automático. *(tu disseste: em princípio numeradas com a referência → join
  automático)*
- 🔜 **Importer de catálogo em massa (chave no REF).** *O quê:* para cada linha
  do ECI, cria/atualiza o artigo **e anexa a foto** cujo nome bate com o REF,
  agrupando por produto. Relatório: X com foto · Y sem foto · Z sem match.
  *Porquê:* cria centenas de cards completos num só run, sem 1 a 1. *(~1 dia)*
- 🔜 **Ecrã de emparelhar (órfãos).** *O quê:* fotos sem REF / produtos sem foto
  → arrastar foto→produto, ou match por EAN/nome. *Porquê:* limita o trabalho
  manual só ao que faltou. *(~meio dia)*
- 🔜 **Categoria + inglês em lote.** *O quê:* mapear a família Dupont →
  categoria do site; inglês vem do catálogo Dupont ou fica = PT por agora.
  *Porquê:* sem isto os artigos caem todos em "Acessórios" e o /en mostra
  português. *(usa a seleção múltipla da Fase 4)*
- ⚠️ **Decisão de infra: onde guardar as fotos.** *O quê:* `public/products`
  (repo) aguenta centenas; milhares → **CDN** (o schema já prevê URLs de CDN).
  *Porquê:* muitas fotos no repo incham os deploys.

> **Saída da Fase 5:** catálogo público completo, com fotos e categorias certas.

---

## FASE 6 — Transição final e entrega 🔜 ⚠️

O momento de largar o Excel e entregar ao patrão.

- ⚠️ **"2 dias de confirmação"** (Fase 2 do plano de transição). *O quê:* 2 dias
  com a equipa a registar no Excel **e** na app; forçar 1 devolução + 1 desconto
  de teste; comparar totais. *Porquê:* prova que os números batem certo antes do
  corte, sem semanas de dupla entrada.
- 🔜 **Export "Gerar ECI Controlo"** (Excel de saída a partir da BD). *Porquê:*
  quando a app for a fonte, o ECI/contabilista ainda pode precisar do formato
  Excel — um botão recria-o.
- 🔜 **Retirar `/admin/uploads` + scripts antigos** (Fase 3 do plano). *Porquê:*
  já não são precisos quando a app é o sistema operacional.
- 🔒 **Smoke test final em produção** (montra **e** admin/POS) após a Fase 0.
  *Porquê:* confirmar tudo ponta a ponta no ambiente real.
- 🔒 **Entregar credenciais + guia rápido ao patrão** (em canal seguro).
  *Porquê:* o patrão saber entrar e o que cada secção faz.

> **Saída da Fase 6:** app é a ferramenta operacional; Excel opcional; entregue.

---

## Resumo do estado

| Fase | Tema | Estado |
|------|------|--------|
| 0 | Lançar em segurança (segredos, TZ) | 🔒 pendente (só tu) |
| 1 | Montra pública | ✅ feito (falta contraste ⚠️) |
| 2 | Motor de sync Excel→app | 🔜 a construir |
| 3 | POS pronto | ✅ grande parte feita; 🔜 detalhes |
| 4 | Gestão nativa (largar Excel) | 🔜 a construir, faseado |
| 5 | Catálogo em massa + fotos | 🔜 quando houver fotos |
| 6 | Transição final + entrega | 🔜 / 🔒 |

**Caminho crítico mínimo para "entregável ao patrão hoje":** Fase 0 (segredos)
+ o que já está feito nas Fases 1 e 3. As Fases 2, 4, 5, 6 são a jornada de
largar o Excel — valiosas, mas faseadas conforme a equipa adota.
