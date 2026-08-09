import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { currentStaff } from "@/lib/admin-auth";
import { AdminHero } from "@/components/admin/admin-hero";
import { FeaturedPicker, type PickerItem } from "./picker";

export const dynamic = "force-dynamic";

const RAIL = "DESTAQUES";

// Curadoria do carrossel "Em Destaque" da homepage. Só ADMIN — é o que o
// público vê primeiro, não é decisão de balcão.
export default async function DestaquesPage() {
  const staff = await currentStaff();
  if (staff?.role !== "ADMIN") redirect("/admin/pos");

  // A lista de escolha é o catálogo inteiro menos os descontinuados (que a
  // home nunca mostraria) e menos os que não têm foto — um cartão sem imagem
  // no carrossel de montra é pior do que não estar lá.
  const [picked, variants] = await Promise.all([
    prisma.homeCarouselItem.findMany({
      where: { rail: RAIL },
      orderBy: { position: "asc" },
      select: { sku: true },
    }),
    prisma.productVariant.findMany({
      where: { status: { not: "DESCONTINUADO" } },
      orderBy: [{ product: { collection: "asc" } }, { sku: "asc" }],
      select: {
        sku: true, name: true, images: true, priceCents: true,
        stockLis: true, stockVng: true, status: true,
        product: { select: { name: true, slug: true, image: true, collection: true, category: { select: { slug: true } } } },
      },
    }),
  ]);

  const pt = (v: unknown) => {
    const o = v as { pt?: string; en?: string } | null;
    return o?.pt ?? o?.en ?? "";
  };

  const items: PickerItem[] = variants
    .map((v) => ({
      sku: v.sku,
      title: pt(v.product?.name) || v.sku,
      variant: pt(v.name),
      collection: v.product?.collection ?? "",
      category: v.product?.category?.slug ?? "",
      image: v.images?.[0] ?? v.product?.image ?? null,
      priceCents: v.priceCents,
      stock: (v.stockLis ?? 0) + (v.stockVng ?? 0),
      status: v.status,
    }))
    .filter((i) => !!i.image);

  return (
    <div>
      <AdminHero
        compact
        eyebrow="Site"
        title="Em Destaque"
        subtitle="Escolhe os artigos do carrossel “Em Destaque” da homepage. O carrossel “Novidades”, logo acima dele no site, continua automático e não é afectado."
      />
      <FeaturedPicker items={items} initial={picked.map((p) => p.sku)} rail={RAIL} />
    </div>
  );
}
