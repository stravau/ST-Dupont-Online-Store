import Image from "next/image";
import type { Ss26ExternalTile } from "@/lib/ss26";
import type { Locale } from "@/lib/i18n";

// Fallback tile for SS26 SKUs that aren't in our Prisma catalogue
// yet. Shares the aspect + label rhythm of the real product card so
// the grid stays visually consistent, but the anchor goes out to
// st-dupont.com's PDP (opened in a new tab). The dot indicator +
// "AVAILABLE" text mirror ProductCardInteractive so a visitor can
// tell it apart only by the external-link cue.
export function Ss26ExternalTileCard({
  tile,
  lang,
}: {
  tile: Ss26ExternalTile;
  lang: Locale;
}) {
  const availableLabel = lang === "pt" ? "Disponível" : "Available";
  const price = new Intl.NumberFormat(lang === "pt" ? "pt-PT" : "en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(tile.priceEur);
  return (
    <a
      href={tile.externalHref}
      target="_blank"
      rel="noopener noreferrer"
      className="reveal group relative flex h-full flex-col"
    >
      <div className="lux-hover relative aspect-[4/5] w-full shrink-0 overflow-hidden border border-line bg-paper">
        <Image
          src={tile.image}
          alt={tile.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-contain"
        />
      </div>
      <div className="flex flex-col pt-2 text-left">
        <div className="flex items-center gap-1.5">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[#2bb673]" />
          <span className="text-[0.5rem] tracking-[0.18em] text-muted uppercase sm:text-[0.6rem]">
            {availableLabel}
          </span>
        </div>
        <h3 className="mt-0.5 line-clamp-1 font-serif text-[0.85rem] tracking-[0.04em] text-ink uppercase sm:mt-1 sm:text-base">
          {tile.name}
        </h3>
        <p className="mt-1 font-serif text-base font-semibold text-ink sm:mt-1.5 sm:text-xl">
          {price}
        </p>
      </div>
    </a>
  );
}
