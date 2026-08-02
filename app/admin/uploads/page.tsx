import { redirect } from "next/navigation";
import { currentStaff } from "@/lib/admin-auth";
import { AdminHero } from "@/components/admin/admin-hero";
import { UploadCard } from "./upload-client";
import { EciSyncCard } from "./eci-sync-card";

export const dynamic = "force-dynamic";

export default async function AdminUploadsPage() {
  // Uploads são acessíveis aos três roles com sessão de staff (ADMIN + LOJA_LIS +
  // LOJA_VNG) — as lojas precisam de fazer o Sincronizar ECI Controlo delas
  // durante o período de transição em que o Excel ainda é a fonte de verdade.
  const staff = await currentStaff();
  const role = staff?.role;
  if (role !== "ADMIN" && role !== "LOJA_LIS" && role !== "LOJA_VNG") {
    redirect("/admin/pos");
  }

  return (
    <div className="space-y-8">
      <AdminHero
        compact
        eyebrow="Operações"
        title="Uploads Excel"
        subtitle={
          <>
            O <strong>Sincronizar ECI Controlo</strong> absorve stock, PVP, artigos novos e outras
            marcas de uma vez (pré-visualiza antes de gravar). As <strong>Promoções</strong> ficam
            à parte — não vêm do ECI. Para criar artigos fora do ECI, usa
            «+ Criar artigos» em <strong>Consultar Stock</strong>. Tudo fica registado em Auditoria.
          </>
        }
      />

      {/* The unified sync — the primary path going forward. */}
      <EciSyncCard />

      {/* Promotions stay independent of the ECI file (marketing decision).
          Full width, same footprint as the ECI card above it. */}
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
  );
}
