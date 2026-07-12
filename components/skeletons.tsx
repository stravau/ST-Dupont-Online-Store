// Shared skeleton primitives — composed inside the loading.tsx files
// on category / search / colecao routes so filter navigation holds
// the layout instead of flashing an empty page. Each primitive is
// dimension-matched to the real component it stands in for so there
// is zero CLS when the real UI lands.
import { Crest } from "@/components/crest";

// A single product-card-shaped tile — aspect-[4/5] photo well +
// three text rows below to match ProductCard.
export function SkeletonTile() {
  return (
    <div className="flex flex-col">
      <div className="skeleton aspect-[4/5] w-full border border-line" />
      <div className="mt-3 flex flex-col gap-2">
        <div className="skeleton h-2.5 w-24" />
        <div className="skeleton h-3.5 w-3/5" />
        <div className="skeleton h-4 w-16" />
      </div>
    </div>
  );
}

// Horizontal strip of pill-shaped placeholders — stands in for the
// FiltersDisclosure chip row (collection / gender / usage / price /
// stock chips).
export function SkeletonChipRow({ count = 5 }: { count?: number }) {
  return (
    <div className="flex flex-wrap gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton h-8 w-24 rounded-full" />
      ))}
    </div>
  );
}

// Standard 12-tile grid — matches the product-grid layout on
// category / search / colecao pages.
export function SkeletonGrid({ count = 12 }: { count?: number }) {
  return (
    <div className="product-grid mt-8 grid grid-cols-2 gap-5 sm:gap-7 lg:grid-cols-4 lg:gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonTile key={i} />
      ))}
    </div>
  );
}

// Wide banner slot for the category hero slider.
export function SkeletonHeroSlider() {
  return (
    <div className="border-b border-line">
      <div className="mx-auto flex max-w-7xl gap-4 overflow-x-auto px-6 py-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-40 w-40 shrink-0" />
        ))}
      </div>
    </div>
  );
}

// Crest + heading + gold rule + lede — mirrors the crest header used
// on /pesquisa and /colecao.
export function SkeletonCrestHeader() {
  return (
    <div className="flex flex-col items-center text-center">
      <Crest className="mb-4 opacity-50" />
      <div className="skeleton h-8 w-64" />
      <div className="gold-rule mx-auto my-5" />
      <div className="skeleton h-3 w-80" />
    </div>
  );
}
