import { PageLoader } from "@/components/page-loader";
import { EsqueletoActivo } from "@/components/esqueleto-activo";

// Shown for every route under /[lang] while its page segment streams in.
// The layout (header + footer) stays; only the content area shows the loader.
export default function Loading() {
  return (
    <>
      {/* Diz a barra do topo que a espera ainda nao acabou. */}
      <EsqueletoActivo />
      <PageLoader />
    </>
  );
}
