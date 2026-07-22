import { redirect } from "next/navigation";
import { currentStaff } from "@/lib/admin-auth";
import { PageHeader } from "@/components/admin/page-header";
import { UploadCard } from "./upload-client";
import { EciSyncCard } from "./eci-sync-card";

export const dynamic = "force-dynamic";

export default async function AdminUploadsPage() {
  // Bulk imports are boss-only — store logins can't reach this page.
  const staff = await currentStaff();
  if (staff?.role !== "ADMIN") redirect("/admin/pos");

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Operações"
        title="Uploads Excel"
        subtitle={
          <>
            O <strong>Sincronizar ECI Controlo</strong> absorve stock, PVP, artigos novos e outras
            marcas de uma vez (pré-visualiza antes de gravar). As <strong>Promoções</strong> ficam
            à parte — não vêm do ECI. Tudo fica registado em Auditoria.
          </>
        }
      />

      {/* The unified sync — the primary path going forward. */}
      <EciSyncCard />

      {/* Promotions stay independent of the ECI file (marketing decision). */}
      <div className="grid gap-5 md:grid-cols-2">
        <UploadCard
          endpoint="/api/admin/upload/promo"
          title="Promoções"
          tag="Campanhas"
          columns={["EAN", "REF", "PVP_PROMO", "DATA_INICIO", "DATA_FIM"]}
          notes={[
            "promoPriceCents + janela (start/end).",
            "Deixa PVP_PROMO vazio para remover a promo activa.",
            "Ou cria promoções por selecção múltipla em Consultar Stock.",
          ]}
        />
      </div>

      {/* Legacy single-purpose uploads — kept as a fallback until the ECI sync
          is proven against real files. Each is absorbed by "Sincronizar ECI". */}
      <details className="border border-line bg-paper">
        <summary className="cursor-pointer px-5 py-3 text-[0.65rem] tracking-[0.18em] text-muted uppercase">
          Uploads individuais (legado) — absorvidos pelo Sincronizar ECI
        </summary>
        <div className="grid gap-5 border-t border-line p-5 md:grid-cols-3">
          <UploadCard
            endpoint="/api/admin/upload/pvp"
            title="PVP"
            tag="Preços"
            columns={["EAN", "REF", "PVP", "DATA_INICIO (opcional)"]}
            notes={["Actualiza priceCents.", "Promoções activas sobrevivem."]}
          />
          <UploadCard
            endpoint="/api/admin/upload/stock"
            title="Stock"
            tag="Inventário"
            columns={["EAN", "REF", "STOCK"]}
            notes={["Sobrescreve o stock — não soma."]}
          />
          <UploadCard
            endpoint="/api/admin/upload/new-articles"
            title="Novos artigos"
            tag="Catálogo"
            columns={["EAN", "REF", "DESCRICAO", "PVP", "STOCK", "CATEGORIA (opc)"]}
            notes={["Cria Product + Variant (INDISPONIVEL para revisão).", "Se REF já existir, faz update."]}
          />
        </div>
      </details>
    </div>
  );
}
