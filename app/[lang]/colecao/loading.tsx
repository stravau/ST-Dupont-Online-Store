import { SkeletonCrestHeader, SkeletonGrid } from "@/components/skeletons";

// Rendered while /colecao rebuilds after a sort change. The real page
// stacks four category sections; skeleton keeps it simple with a
// crest header + one grid so the height is stable.
export default function Loading() {
  return (
    <div>
      <header className="mx-auto max-w-7xl px-6 pb-6 pt-12 md:pb-8 md:pt-14">
        <SkeletonCrestHeader />
      </header>
      <section className="mx-auto max-w-7xl px-6 py-12">
        <SkeletonGrid />
      </section>
    </div>
  );
}
