import { UploadCard } from "./upload-client";

export const dynamic = "force-dynamic";

export default function AdminUploadsPage() {
  return (
    <div className="space-y-8">
      <header>
        <p className="overline text-gold">Uploads</p>
        <h1 className="mt-2 font-serif text-3xl">Batch update via Excel</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Cada ficheiro aplica directamente na DB. O match faz-se por <strong>EAN</strong> primeiro (mais
          fiável) e cai para <strong>REF</strong> quando vazio. Todas as escritas ficam registadas em
          Auditoria.
        </p>
      </header>

      <div className="grid gap-5 md:grid-cols-2">
        <UploadCard
          endpoint="/api/admin/upload/pvp"
          title="PVP"
          columns={["EAN", "REF", "PVP", "DATA_INICIO (opcional)"]}
          notes={[
            "Actualiza priceCents para todas as variants encontradas.",
            "Promoções activas sobrevivem até promoEndDate.",
            "DATA_INICIO opcional — usa-se now() se vazio.",
          ]}
        />
        <UploadCard
          endpoint="/api/admin/upload/promo"
          title="Promoções"
          columns={["EAN", "REF", "PVP_PROMO", "DATA_INICIO", "DATA_FIM"]}
          notes={[
            "promoPriceCents + janela (start/end). Termo da promo é simplesmente a data de fim.",
            "Para remover uma promo, deixa PVP_PROMO vazio.",
          ]}
        />
        <UploadCard
          endpoint="/api/admin/upload/stock"
          title="Stock"
          columns={["EAN", "REF", "STOCK"]}
          notes={[
            "Sobrescreve stock — não soma. Para ajustes incrementais usa /admin/variants.",
          ]}
        />
        <UploadCard
          endpoint="/api/admin/upload/new-articles"
          title="Novos artigos"
          columns={["EAN", "REF", "DESCRICAO", "PVP", "STOCK", "CATEGORIA (opcional)", "IMAGEM_URL (opcional)"]}
          notes={[
            "Cria Product + Variant. status default = INDISPONIVEL para revisão antes de tornar visível.",
            "Se REF já existir, faz update em vez de create.",
            "Se CATEGORIA vazia, assenta em acessorios.",
            "Imagens podem vir por URL na coluna IMAGEM_URL, ou ser carregadas depois em /admin/variants/<sku>/images.",
          ]}
        />
      </div>
    </div>
  );
}
