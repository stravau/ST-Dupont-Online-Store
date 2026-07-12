import {
  SkeletonHeroSlider,
  SkeletonChipRow,
  SkeletonGrid,
} from "@/components/skeletons";

// Rendered during filter navigation on /c/<category>. Holds the
// full page shape — hero slider, filter chip row, sort pill, product
// grid — so the layout doesn't collapse to nothing between clicks.
// Dimensions match the real components; no CLS when the page paints.
export default function Loading() {
  return (
    <div>
      <SkeletonHeroSlider />
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-6">
          <SkeletonChipRow count={6} />
        </div>
        <div className="mt-10 flex justify-end">
          <div className="skeleton h-8 w-40 rounded" />
        </div>
        <SkeletonGrid />
      </div>
    </div>
  );
}
