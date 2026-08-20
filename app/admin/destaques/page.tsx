import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { currentStaff } from "@/lib/admin-auth";
import { AdminHero } from "@/components/admin/admin-hero";
import { CarouselTabs, type CarouselTab } from "@/components/admin/carousel-tabs";
import { FUNDO_DESTAQUES } from "@/lib/catalog";
import { FeaturedPicker, type PickerItem } from "./picker";
import { BackgroundBox } from "./background-box";

export const dynamic = "force-dynamic";

// Fotografia que vem com o código. É o recurso quando o patrão nunca trocou o
// fundo, e é para ela que o "repor original" volta.
const FUNDO_ORIGINAL = "/ss26/geode-bg.jpg";

// Curadoria dos dois carrosséis da homepage, em abas — o mesmo padrão do
// Consultar Stock. Só ADMIN: é o que o público vê primeiro, não é decisão
// de balcão.
export default async function DestaquesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const staff = await currentStaff();
  if (staff?.role !== "ADMIN") redirect("/admin/pos");

  const sp = await searchParams;
  const tab: CarouselTab = sp.tab === "novidades" ? "novidades" : "destaques";
  const rail = tab === "novidades" ? "NOVIDADES" : "DESTAQUES";

  // A lista de escolha é o catálogo inteiro menos os descontinuados (que a
  // home nunca mostraria) e menos os que não têm foto — um cartão sem imagem
  // no carrossel de montra é pior do que não estar lá.
  const [picked, variants, fundo] = await Promise.all([
    prisma.homeCarouselItem.findMany({
      where: { rail },
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
    prisma.siteSetting.findUnique({ where: { key: FUNDO_DESTAQUES }, select: { value: true } }),
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

  const subtitulo =
    tab === "novidades"
      ? "Escolhe os artigos do carril “Novidades”, logo abaixo da campanha da estação. Enquanto não escolheres nenhum, o carril mostra sozinho as últimas criações."
      : "Escolhe os artigos e a fotografia de fundo da faixa “Em Destaque”. O botão por baixo do carrossel abre uma página com estes mesmos artigos.";

  return (
    <div>
      <AdminHero compact eyebrow="Site" title="Carrosséis da homepage" subtitle={subtitulo} />
      <CarouselTabs active={tab} />

      {/* O fundo é só da faixa Em Destaque. As Novidades vivem dentro da
          campanha da estação e não têm imagem própria para trocar. */}
      {tab === "destaques" && (
        <BackgroundBox actual={fundo?.value ?? null} original={FUNDO_ORIGINAL} />
      )}

      <FeaturedPicker
        key={rail}
        items={items}
        initial={picked.map((p) => p.sku)}
        rail={rail}
      />
    </div>
  );
}
