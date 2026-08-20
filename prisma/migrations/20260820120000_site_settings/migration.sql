-- Definições do site em chave/valor. Nasceu para o patrão trocar a fotografia
-- de fundo da faixa "Em Destaque" a partir do admin, sem mexer no código nem
-- esperar por um deploy. Chave/valor porque o que vem a seguir (um título, um
-- link de campanha) não justifica tabela nova de cada vez.
CREATE TABLE "SiteSetting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("key")
);
