import { SkeletonCrestHeader, SkeletonGrid } from "@/components/skeletons";

export default function Loading() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <SkeletonCrestHeader />
      <SkeletonGrid />
    </section>
  );
}
