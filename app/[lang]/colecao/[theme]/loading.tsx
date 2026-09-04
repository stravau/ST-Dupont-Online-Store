import { SkeletonCrestHeader, SkeletonGrid } from "@/components/skeletons";
import { EsqueletoActivo } from "@/components/esqueleto-activo";

export default function Loading() {
  return (
    <>
      {/* Diz a barra do topo que a espera ainda nao acabou. */}
      <EsqueletoActivo />
      <section className="mx-auto max-w-7xl px-6 py-12">
        <SkeletonCrestHeader />
        <SkeletonGrid />
      </section>
    </>
  );
}
