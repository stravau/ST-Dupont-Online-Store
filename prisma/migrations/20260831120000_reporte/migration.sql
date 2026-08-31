-- Reportes de problema: botão do cabeçalho, error boundary e falhas de API.
CREATE TABLE "Reporte" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT,
    "role" TEXT,
    "categoria" TEXT NOT NULL,
    "bloqueado" BOOLEAN NOT NULL DEFAULT false,
    "descricao" TEXT,
    "url" TEXT NOT NULL,
    "rota" TEXT NOT NULL,
    "commit" TEXT,
    "passos" JSONB,
    "erros" JSONB,
    "pedidos" JSONB,
    "estado" JSONB,
    "ambiente" JSONB,
    "auditoria" JSONB,
    "servidor" JSONB,
    "origem" TEXT NOT NULL DEFAULT 'BOTAO',
    "impressao" TEXT NOT NULL,
    "ocorrencias" INTEGER NOT NULL DEFAULT 1,
    "resolvido" BOOLEAN NOT NULL DEFAULT false,
    "nota" TEXT,
    "enviadoEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultimaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reporte_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Reporte_impressao_idx" ON "Reporte"("impressao");
CREATE INDEX "Reporte_createdAt_idx" ON "Reporte"("createdAt");
CREATE INDEX "Reporte_resolvido_idx" ON "Reporte"("resolvido");
