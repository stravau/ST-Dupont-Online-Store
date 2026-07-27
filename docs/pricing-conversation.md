# Preço a cobrar ao patrão — conversa completa

**Data:** 2026-07-27
**Contexto:** o Miguel construiu praticamente sozinho (com IA) o sistema
S.T. Dupont Online Store — montra bilingue + POS + admin + sync ECI +
pipeline CLIP para imagens. O patrão sabe que ele usa IA. O Miguel
estava a pensar cobrar €1.500. Este doc guarda a análise completa e
os argumentos para retomar a discussão de outro PC.

---

## Inventário do que está construído (número real, verificado)

**Codebase:** Next.js 16 · TypeScript · Tailwind v4 · Prisma 7 · Neon
· Auth.js v5 · Vercel Blob · CLIP ViT-B/32 via @xenova/transformers.

- **426 commits** desde 2026-05-15
- **232 ficheiros TS/TSX/MJS** (excl. node_modules e Prisma generated)
- **~28.000 LOC** escritas à mão (app 10k · components 7k · lib 5.7k
  · scripts 9k · prisma seed+data 6k · migrations 787 SQL)
- **24 models Prisma** com 11 enums · **21 migrations**
- **11 rotas admin** + **14 endpoints admin API** + **3 endpoints públicos**
- **59 scripts CLI** (importers, auditoria, image pipeline, CLIP review)
- **2 locales** (PT/EN) com dicionário de 566 LOC
- **~3.871 assets** em public/ (fotos, vídeos, brand, categories)

**O que NÃO está construído:** Cart UI, Wishlist UI, Checkout, Stripe
integration, Área de cliente. Schema pronto, zero UI/handlers.

---

## Estimativa de horas equivalentes (valor de mercado)

Não é o tempo calendário do Miguel — é o valor de mercado do que
uma equipa profissional cobraria para entregar o mesmo output.

### Construído até hoje: ~1.300 horas

| Bloco | Horas |
|---|---:|
| Storefront público (13 páginas + 54 componentes) | 224 |
| Painel admin (11 rotas + 13 componentes) | 184 |
| Backend / API (17 endpoints, incl. sync ECI de 1015 LOC) | 132 |
| DB + camada lib/ (24 models, 21 migrations, seed 5.320 LOC) | 140 |
| Scripts CLI (59 ficheiros, incl. pipeline CLIP ML) | 185 |
| Segurança & infra (RBAC, CSRF, rate limit, lockout, headers) | 68 |
| Documentação estratégica (3 docs de fases + README + inline) | 52 |
| DevOps (Vercel, Neon, Blob, tsconfig split, migrate deploy) | 14 |
| Debug / iterações / QA (30% overhead standard) | ~300 |

### Restante para produto final: ~475 horas

| Bloco | Horas |
|---|---:|
| E-commerce transaccional (Cart+Wishlist+Checkout+Stripe+conta+emails) | 160 |
| Ferramentas nativas anti-Excel (export ECI, reservas UI, Fase 3 cutover) | 90 |
| Polish produção (perf/a11y/SEO/analytics/testes E2E/CI/onboarding) | 95 |
| Debug/iterações (30%) | ~130 |

**TOTAL PROJECTO: ~1.775h**

---

## Ranges de mercado (Portugal/UE, com base no meu training, cutoff Jan 2026)

⚠️ **Fonte:** conhecimento geral do training (Landing.jobs salary reports,
Michael Page Portugal reports, fóruns tech PT, salário mínimo público
€905 bruto/mês em 2026). **NÃO fiz pesquisa em tempo real** ao dar estes
números. Confiança média-alta para os salários base, média-baixa para
os rates de agência que variam muito.

| Perfil | €/h freelance |
|---|---:|
| Junior PT (sem IA) | 20-30 |
| **Junior + IA + entrega funcional (perfil do Miguel)** | **25-45** |
| Mid + IA | 40-60 |
| Senior + IA | 60-90 |
| Senior sem IA | 75-100 |
| Agência Lisboa/Porto | 100-140 |
| Top-tier agência | 150-220 |

Comparação com produtos concorrentes:
- **Shopify Plus + custom app + POS add-on**: ~€45k-90k licenciamento
  + build. Menos custom.
- **Salesforce Commerce Cloud**: €150k+ setup + licença anual.
- **Lightspeed Retail X-Series (POS + inventory)**: ~€100-500/mês SaaS.
- **Ecommerce custom Next.js sem POS/ERP**: €35k-70k para boutique típica.

---

## O que o Miguel deve cobrar — recomendação firme

### Cenário 1: Lump-sum pelo entregue (one-off)

**Range justo: €5.000 - €10.000**

Piso absoluto (€5k):
- 2,5 meses × 22 dias úteis = 55 dias
- Assumir só **3h/dia activas** (a decidir, rever, testar, prompt)
- 165h × **€30/h** (baixo do range junior+IA) = **€4.950**
- Isto assume que o Miguel foi essencialmente "director técnico
  part-time" — o mínimo defensível.

Meio do range (€8k):
- 55 dias × 4-5h activas = ~250h
- 250h × €32/h = **€8.000**
- Reflecte o trabalho real de decisão + iteração + debug + integração
  com o negócio.

Topo do range (€10k):
- Se o patrão valorizar a manutenção/warranty implícita, subir a €10k.

### Cenário 2: Mensalidade contínua

**Range: €1.200 - €2.500/mês** dependendo do compromisso.

- €1.200-1.500/mês → part-time light (bug fixes, features pequenas)
- €1.800-2.200/mês → part-time steady (features novas ocasionais)
- €2.500+/mês → semi full-time (Stripe/checkout/campanhas activas)

### Cenário 3: Híbrido (RECOMENDADO)

**€5-8k lump-sum agora + €1.500-2.000/mês contínuo.**

Este é o modelo que respeita mais o valor entregue e cria
previsibilidade de cash-flow para os dois lados.

---

## Argumentos para levar ao patrão

### Se ele questionar "porquê tanto?"

1. **"Quanto custaria contratar isto?"**
   - Agência entre €100k-200k só pelo que já está feito.
   - Dev júnior contratado em PT: €1.800-2.500 líquidos + encargos =
     €2.700-3.750/mês total à empresa. Ele NÃO consegue entregar este
     ritmo sem IA.

2. **"O que poupa o negócio?"**
   - Substitui ~10h/semana de trabalho manual em Excel + reduz erros.
   - A €12/h de custo laboral × 40h/mês = ~€480/mês só em tempo poupado.
   - Sem contar melhorias de vendas do site.

3. **"E continuidade?"**
   - Um dev sem contexto levaria 2-3 meses só a perceber a codebase,
     a €4-5k/mês. **Continuidade com o Miguel é economicamente óptima.**

### Se ele disser "mas é tudo IA"

Contra-argumentos (o Miguel usou uma variante desta objecção — foi
respondida acima; guardar para retomar):

- **A IA sozinha produz lixo.** Se fosse só passar prompts, o site
  não funcionava. Toda a gente que já experimentou "vibe coding"
  sabe isto.
- **O que o Miguel faz que a IA sozinha não faz:**
  1. Decide o que construir (POS antes de checkout, ECI antes de
     Stripe, formato de reports)
  2. Rejeita 30-40% do que a IA sugere
  3. Testa manualmente (mobile, PDPs, POS)
  4. Traduz negócio→tech ("Excel manda" → "modo autoritativo")
  5. Debug em produção (incidente das imagens Starbrands em 2026-07-27)
  6. Segurança operacional (recusar ordens destrutivas)
- **A IA aumenta o valor/hora do Miguel para o patrão, não diminui.**
  Um júnior sem IA em 2,5 meses entregaria talvez 15% do que ele
  entregou. O output do Miguel/tempo do patrão é 5-10× superior ao de
  um júnior tradicional. **O benefício da IA é do patrão, não é para
  ele reduzir o que paga.**

### Analogias que podem funcionar

- Um designer com Figma não é pago menos que um com papel — importa
  o output, não a ferramenta.
- Um contabilista com Excel não é pago menos que um com ábaco.
- Um tradutor com CAT tools não é pago menos que um manual.
- **Ferramentas que aceleram não reduzem o preço — tornam mais competitivo.**

---

## Piso absoluto — porque €1.500 total é objectivamente errado

Três argumentos que funcionam com QUALQUER estimativa razoável de
mercado:

1. **Salário mínimo PT 2026 = €905/mês bruto.** 2,5 meses de tempo do
   Miguel valem no mínimo **€2.263**. Cobrar €1.500 total é abaixo do
   salário mínimo aplicado ao tempo investido.

2. **Software concorrente licencia por €1.000-5.000/mês.** O patrão
   está a poupar isso todos os meses. **Cobrar €1.500 uma vez é cobrar
   menos que ele pouparia numa semana com uma alternativa profissional.**

3. **Trabalhador "unqualified" em PT ganha ~€6-7/h** (caixa de
   supermercado). Cobrar €1.500 pelas ~300-400h de tempo activo do
   Miguel dá €3-5/h. **É abaixo de qualquer worker sem qualificações.**

Estes 3 argumentos são independentes do rate exacto de mercado — são
matemática básica, funcionam em qualquer cenário.

---

## O que NÃO fazer

- **NÃO cobrar por hora** se não conseguir contar tempo real
- **NÃO** flat fee sem definir scope (leva a trabalho grátis quando
  pedem "só mais uma coisinha")
- **NÃO** ter medo de dizer que "a IA acelera mas não substitui o
  julgamento"
- **NÃO** aceitar reduzir preço com o argumento "mas é IA" — o output
  é seu, a responsabilidade é sua, a warranty é sua

---

## Guião concreto para a conversa

> "Patrão, pensei bem no que faz sentido. Pelo que está construído
> até agora, pedia **€6.000 numa parcela única** — sei que é
> IA-assistido mas foram 2,5 meses de decisões, iterações e debug.
> A partir daí, para continuar a evoluir (Stripe/checkout do site +
> manutenção + novas features do roadmap) sugiro **€1.500-1.800/mês
> fixos**, com um roadmap escrito do que cada mês entrega. Se
> acordarmos, comprometo-me a X, Y, Z."

Se ele achar caro, contra-oferta: **€4k agora + €1.500/mês** — spread
mais amigável ao cash-flow.

**Piso absoluto abaixo do qual não descer: €5.000 pelo entregue.**
Descer abaixo disso sinaliza subvalorização, corrói respeito
profissional, e é matematicamente injusto pelo tempo investido.
