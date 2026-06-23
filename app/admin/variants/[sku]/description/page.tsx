import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { DescriptionEditor } from "./description-client";

// Per-colourway description editor. The parent product carries the
// canonical marketing copy on Product.description; this page is for the
// occasional special edition / one-off finish that needs its own story.
// Saving an override here makes the PDP show the variant's copy when
// that colourway is selected; clearing it falls back to the product copy.

export const dynamic = "force-dynamic";

export default async function VariantDescriptionPage({
  params,
}: {
  params: Promise<{ sku: string }>;
}) {
  const { sku } = await params;
  const v = await prisma.productVariant.findUnique({
    where: { sku },
    select: {
      id: true,
      sku: true,
      name: true,
      description: true,
      product: { select: { name: true, slug: true, description: true } },
    },
  });
  if (!v) notFound();

  const variantName =
    (v.name as { pt?: string; en?: string } | null)?.pt ??
    (v.name as { pt?: string; en?: string } | null)?.en ??
    v.sku;

  const productName =
    (v.product?.name as { pt?: string; en?: string } | null)?.pt ??
    (v.product?.name as { pt?: string; en?: string } | null)?.en ??
    "—";

  const productDescription =
    (v.product?.description as { pt?: string; en?: string } | null) ?? null;
  const variantDescription =
    (v.description as { pt?: string; en?: string } | null) ?? null;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={`SKU · ${sku}`}
        title={variantName}
        subtitle={
          <>
            Copy específico desta colourway. Deixa em branco para herdar o
            texto do produto pai ({productName}).
          </>
        }
        action={
          <Link
            href="/admin/variants"
            className="border border-line bg-paper px-4 py-2.5 text-xs tracking-[0.2em] text-ink uppercase transition-colors hover:border-gold hover:text-gold"
          >
            ← Voltar
          </Link>
        }
      />

      <DescriptionEditor
        variantId={v.id}
        initial={variantDescription}
        fallback={productDescription}
      />
    </div>
  );
}
