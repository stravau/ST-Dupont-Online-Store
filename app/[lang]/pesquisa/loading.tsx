import { SkeletonCrestHeader, SkeletonChipRow, SkeletonGrid } from "@/components/skeletons";
import { EsqueletoActivo } from "@/components/esqueleto-activo";

// Rendered while /pesquisa recomputes after a query / filter change.
export default function Loading() {
  return (
    <>
      {/* Diz a barra do topo que a espera ainda nao acabou. */}
      <EsqueletoActivo />
      <section className="mx-auto max-w-7xl px-6 py-10 md:py-12">
        <SkeletonCrestHeader />
        <div className="mx-auto mt-6 max-w-xl">
          <div className="skeleton h-14 w-full border border-line" />
        </div>
        <div className="mt-8">
          <SkeletonChipRow count={5} />
        </div>
        <SkeletonGrid />
      </section>
    </>
  );
}
