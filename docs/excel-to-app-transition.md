# Migração Excel → App — estratégia de transição em 3 fases

**Estado:** aprovado em princípio, aguardar arranque.
**Data:** 2026-07-21.
**Contexto:** conversa entre o Miguel e o Claude sobre como largar o Excel
sem perder informação. Substitui em espírito o `eci-sync-proposal.md`
(que assumia Excel e app permanentemente lado-a-lado); esta doc
assume que o Excel é destino de morte, não de convivência.

Referência: `ECI_LIS_Controlo_v1_2_2026 (002).xlsx` +
`ECI_VNG_Controlo_v2_2_.xlsx` — os dois ficheiros com que a loja
opera hoje em dia (ambos com folhas idênticas: `DB`, `Mov_POS_Loja`,
`Mov_Int_Ext`, `Reservas`, `Danificados`, `P.Reparar`, `Vend_Dia`,
`Estat_Calc`, `Operadores`, `Enc_Template`).

---

## Realidade actual (Julho 2026)

- **Excel é a produção**: a loja opera directamente nos dois ficheiros
  ECI Controlo. Toda a informação real vive lá.
- **App está em desenvolvimento**: já cobre catálogo público, POS
  terminal, reports do patrão, reparações, stock analytics — mas
  a equipa da boutique **ainda não usa no dia-a-dia**.
- **Objectivo final**: app é a única ferramenta operacional; Excel só
  se gera a pedido para entregar externamente (se sequer for preciso).
- **Constrangimento**: a transição não pode ser feita de um dia para o
  outro — perder-se-ia informação e a equipa perde referência.

## O erro a evitar

Saltar directo para "app é a fonte, Excel morre". Não dá porque:

1. A equipa não confia no app ainda — precisa de ver dashboards a
   bater com o Excel durante semanas.
2. Metade dos workflows do Excel ainda não têm UI nativa no app.
3. Se o Excel deixar de ser autoritativo antes de o app estar
   completo, perde-se histórico.

## Estratégia em 3 fases

### Fase 1 — Excel produção, app espelho (agora)

**Regra**: Excel manda. App é sombra que se sincroniza a partir dele.

- Miguel faz upload periódico do ECI Controlo (LIS e/ou VNG).
- Um endpoint único `Sincronizar ECI Controlo` absorve **todas as
  folhas** do ficheiro num só passo.
- Ingestão é idempotente — corres 10x seguidas e o resultado é o mesmo.
- Cada sync escreve um `AdminAction` com sumário do que mudou.
- Nada escrito no app volta para o Excel. Uma direcção só.

**Serve para**: patrão vê dashboards, reports, KPIs em cima de dados
recentes. Equipa vai começando a experimentar POS terminal em
casos-piloto. Confiança no app começa a crescer.

### Fase 2 — Paralelo (algumas semanas / meses)

- Equipa faz cada vez mais coisas no app: POS terminal para vendas
  reais, movimentos de stock com UI nativa, reparações, reservas.
- Miguel continua a sincronizar o Excel esporadicamente.
- **Relatório de diff** após cada sync — mostra onde as duas fontes
  discordam. Investiga-se cada divergência: bug de sync? sale
  esquecida? erro humano no Excel?
- Meta: chegar a **zero divergências durante um mês inteiro** com
  a equipa a operar no app.

### Fase 3 — App produção, Excel opcional (destino)

- Equipa opera 100% no app.
- Endpoint `Sincronizar ECI Controlo` é retirado.
- Se o ECI (ou o contabilista) alguma vez pedir o formato Excel,
  há um botão `Gerar ECI Controlo` que recria o ficheiro a partir
  da DB.
- `/admin/uploads` pode ser removido inteiro nesta altura.

---

## Plano concreto para Fase 1 (o que construir primeiro)

**Endpoint único**: `POST /api/admin/sync/eci` que aceita o Excel
completo e absorve todas as folhas relevantes.

| Folha do Excel | Destino na DB                                    | Estratégia de idempotência             |
|----------------|--------------------------------------------------|----------------------------------------|
| `DB`           | `ProductVariant.stockLis` **ou** `.stockVng` + `OtherBrandItem` (só VNG) | upsert por EAN → REF                   |
| `Mov_POS_Loja` | `Sale` + `SaleItem`                              | prefixo `note = "Histórico ECI"`, delete-then-insert por window (padrão do `import-eci-sales.ts`) |
| `Mov_Int_Ext`  | `StockMovement`                                  | chave natural (data, ean, tipo, qty, op) |
| `P.Reparar`    | `Repair`                                         | upsert por (data, cliente, ref)        |
| `Reservas`     | `Reserva` (**modelo novo — falta criar**)        | upsert por (data, cliente, ref)        |
| `Danificados`  | `StockMovement` type `DANIFICADO`                | chave natural (data, ean)              |
| `Operadores`   | `Operator`                                       | upsert por (boutique, initials)        |
| `Vend_Dia`, `Estat_Calc`, `Enc_Template` | — (derivadas, ignoradas) | —                                      |

**Detecção LIS/VNG**: pelo nome do ficheiro (`ECI_LIS_*` ou
`ECI_VNG_*`) ou, se ambíguo, pergunta ao utilizador via dropdown
antes de arrancar.

**UI**: `/admin/uploads` fica com **um único cartão** — "Sincronizar
ECI Controlo" — em vez dos 4 actuais (PVP/Promo/Stock/Novos). Drag'n'drop
grande, botão "Sincronizar", relatório final:

```
✓ Ficheiro: ECI_LIS_Controlo_v1_2_2026.xlsx (loja LIS)

  DB              1454 linhas · 18 stock actualizado · 1436 sem alteração
  Mov_POS_Loja    4664 linhas · 12 vendas novas · 4652 já existentes
  Mov_Int_Ext     4674 linhas · 3 movimentos novos · 4671 já existentes
  P.Reparar       0 linhas
  Reservas        0 linhas
  Danificados     0 linhas
  Operadores      5 linhas · 0 novos

  Duração: 42s
  Batch id: 4b8f... (auditoria)
```

## Modelos a criar antes do endpoint

### `Reserva`
```prisma
model Reserva {
  id           String    @id @default(cuid())
  boutique     Boutique
  reservedAt   DateTime  @default(now())     // Data_Reserva
  expectedAt   DateTime?                     // Data_Espera
  variantId    String?                       // link ao catálogo (null se EAN não bater)
  sku          String
  ean          String?
  descSnapshot String
  brand        String?
  quantity     Int
  pvpCents     Int
  customerName String
  customerPhone String?
  customerEmail String?
  operator     String                        // iniciais (PR, MA, …)
  status       ReservaStatus @default(ATIVA)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  variant ProductVariant? @relation(...)

  @@index([boutique, reservedAt])
  @@index([status])
  @@index([customerPhone])
}

enum ReservaStatus {
  ATIVA
  CONCLUIDA    // cliente levantou
  CANCELADA
  EXPIRADA
}
```

Migration + inclusão no `Sincronizar` estimados em **30-40 min** juntos.

## Custo total Fase 1

- Modelo `Reserva` + migration: 30 min
- Endpoint unificado `/api/admin/sync/eci` (6 parsers, 4 já existem em
  scripts CLI): **1 dia**
- UI do cartão único em `/admin/uploads` + relatório: **meio dia**
- Retirar os 4 cartões antigos (PVP/Promo/Stock/Novos genéricos): 30 min
- **Total: ~1.5 a 2 dias de trabalho**

## Custo para chegar à Fase 3

- Fase 1 (acima): 1.5-2 dias
- Movimentos de stock com UI nativa (Entrada/Saída/Transferência/Danif): meio dia
- Reservas UI (criar, listar, marcar concluída/cancelada): 2-3 h
- Novo artigo wizard (`+ Novo artigo` em /admin/variants): 3-4 h
- Bulk edit PVP + criar promoção a partir de selecção múltipla: meio dia
- Export ECI Controlo (Excel de saída): meio dia
- Limpeza final (`/admin/uploads`, endpoints antigos, `lib/admin-upload.ts`): 30 min
- **Total até Fase 3: ~4-5 dias de trabalho** distribuídos por vários meses
  conforme a equipa vai adoptando peça a peça.

## O que **não** fazer

- Não construir sync bidireccional. Já foi analisado no
  `eci-sync-proposal.md` — a complexidade não compensa o benefício.
  Uma direcção só (Excel → app) em Fase 1, depois inverte-se
  (app → Excel export) em Fase 3.
- Não retirar o CLI `scripts/import-*` ainda — servem de recurso se o
  endpoint falhar em produção e para o próximo onboarding.
- Não construir UI perfeita antes de Fase 1 estar a correr — o
  patrão precisa de ver dashboards com dados frescos ontem, não
  daqui a duas semanas.

---

## Fluxo diário depois de Fase 1 estar pronta

1. Miguel actualiza o `ECI_LIS_Controlo` / `ECI_VNG_Controlo` no
   desktop (como já faz hoje).
2. Miguel abre `/admin/uploads` no browser (pode ser em qualquer PC).
3. Arrasta o Excel para o cartão. Clica "Sincronizar".
4. Espera 30-60 s. Vê o relatório do que mudou.
5. Vai ver os dashboards com dados actualizados.

Cadência estimada: **1x por dia** (fim do dia da loja) ou **cada 2-3
dias** enquanto a app não for o sistema operacional.
