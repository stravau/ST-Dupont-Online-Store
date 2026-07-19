import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/admin/page-header";
import { UploadCard } from "./upload-client";

export const dynamic = "force-dynamic";

export default async function AdminUploadsPage() {
  // Bulk imports are boss-only — store logins can't reach this page.
  const session = await auth();
  if ((session?.user as { role?: string } | undefined)?.role !== "ADMIN") redirect("/admin/pos");

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Operações"
        title="Uploads Excel"
        subtitle={
          <>
            Cada ficheiro aplica directamente na DB. O match faz-se por <strong>EAN</strong>{" "}
            (mais fiável) e cai para <strong>REF</strong> quando vazio. Tudo fica registado em
            Auditoria.
          </>
        }
      />

      <div className="grid gap-5 md:grid-cols-2">
        <UploadCard
          endpoint="/api/admin/upload/pvp"
          title="PVP"
          tag="Preços"
          columns={["EAN", "REF", "PVP", "DATA_INICIO (opcional)"]}
          notes={[
            "Actualiza priceCents para todas as variants encontradas.",
            "Promoções activas sobrevivem até promoEndDate natural.",
            "DATA_INICIO opcional — usa-se now() se vazio.",
          ]}
        />
        <UploadCard
          endpoint="/api/admin/upload/promo"
          title="Promoções"
          tag="Campanhas"
          columns={["EAN", "REF", "PVP_PROMO", "DATA_INICIO", "DATA_FIM"]}
          notes={[
            "promoPriceCents + janela (start/end).",
            "Deixa PVP_PROMO vazio para remover a promo activa.",
          ]}
        />
        <UploadCard
          endpoint="/api/admin/upload/stock"
          title="Stock"
          tag="Inventário"
          columns={["EAN", "REF", "STOCK"]}
          notes={[
            "Sobrescreve o stock — não soma.",
            "Para ajustes pontuais usa a edição em /admin/variants.",
          ]}
        />
        <UploadCard
          endpoint="/api/admin/upload/new-articles"
          title="Novos artigos"
          tag="Catálogo"
          columns={["EAN", "REF", "DESCRICAO", "PVP", "STOCK", "CATEGORIA (opc)", "IMAGEM_URL (opc)"]}
          notes={[
            "Cria Product + Variant. Default status = INDISPONIVEL para revisão antes de tornar visível.",
            "Se REF já existir, faz update em vez de create.",
            "Sem CATEGORIA, assenta em acessorios.",
            "Imagens via URL OU upload depois em /admin/variants/<sku>/images.",
          ]}
        />
      </div>
    </div>
  );
}
