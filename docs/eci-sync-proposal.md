# ECI ↔ Site sync — proposta arquitectural (não implementada)

**Estado:** guardado para revisão. **Não incluído no scope original**;
a implementação faz subir o preço dos entregáveis, requer aprovação do
boss antes de arrancar.

Data da proposta: 2026-07-12.
Referência: pedido de sincronização bidireccional entre o admin do site
e o ficheiro `ECI_LIS_Controlo_v1_2_2026 (002).xlsx` que a Starbrands
mantém.

---

## Contexto operacional

- Boutique Lisboa faz vendas a cada 30–60 min; há dias sem vendas.
- Excel actual serve como referência da Starbrands (stock + PVP + EAN).
- Admin do site já escreve stock/PVP directamente em Neon.
- Vercel serverless **não** tem acesso ao filesystem do desktop, portanto
  qualquer sync "em tempo real" tem de passar por um agente local ou por
  storage cloud.

## Três caminhos possíveis

### A. Sync bidireccional Excel ↔ Neon (Excel continua editável)
- Dois scripts (`import-erp-excel.ts` ↔ `sync-neon-to-excel.ts`)
- Regras de conflito: Neon-ganha-stock, Excel-ganha-PVP, Excel-ganha-novos-SKUs
- Prós: mantém workflow actual da boutique
- Contras: risco de sobrescritas se editas os dois em simultâneo

### B. Cloud Excel (OneDrive / SharePoint + MS Graph)
- Excel na OneDrive, admin lê/escreve via Microsoft Graph API
- Prós: tempo real, sem agente local
- Contras: requer conta MS 365, registo Azure AD, ~2 dias trabalho,
  ponto de falha extra (API MS cai → admin cai)

### C. Neon como única fonte de verdade + export automatizado (RECOMENDADO)
- Admin é a única interface editável
- Task Scheduler no Windows corre `export-neon-to-eci.ts` a cada 30 min
- Excel gerado (`ECI_LIS_Auto_Latest.xlsx`) é apenas para consumo /
  entrega à Starbrands — não deve ser editado
- Botão "Descarregar Excel ECI" no admin para pull manual on-demand
- Import Excel → Neon continua a existir para quando a Starbrands
  mandar folhas novas com artigos que não temos

## Plano de execução (Opção C, se aprovada)

1. **`scripts/export-neon-to-eci.ts`** — novo
   - Lê o Excel original como template para preservar as 10 abas
     operacionais (Mov_POS_Loja, Reparações, Reservas, etc.)
   - Substitui apenas a aba `DB` (EAN · REF · Marca · Descrição · PVP ·
     Stock) com o estado do Neon
   - Escreve para `Desktop/ECI_LIS_Auto_Latest.xlsx`

2. **Windows Task Scheduler** — XML importável via `schtasks /create`,
   corre `npm run sync-eci` a cada 30 min, sem janela, log em ficheiro
   quando falha.

3. **`/admin/uploads` → botão "Descarregar Excel ECI actualizado"** —
   invoca o mesmo script server-side e devolve o path do ficheiro gerado.

4. **`scripts/import-erp-excel.ts` inalterado** — usado ocasionalmente
   quando chegam Excels novos da Starbrands.

## Estimativa

~45 min de implementação para os 4 componentes acima. Sem custos de
infra adicionais (não usa OneDrive nem MS Graph).

## Próximos passos

- Aguardar aprovação do boss.
- Confirmar o path exacto onde deve ficar o Excel gerado (padrão
  proposto: `Desktop/ECI_LIS_Auto_Latest.xlsx`).
- Confirmar cadência (padrão proposto: 30 min).
