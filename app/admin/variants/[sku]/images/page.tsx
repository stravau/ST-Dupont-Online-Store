import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { ImagesEditor } from "./images-client";

export const dynamic = "force-dynamic";

export default async function VariantImagesPage({ params }: { params: Promise<{ sku: string }> }) {
  const { sku } = await params;
  const v = await prisma.productVariant.findUnique({
    where: { sku },
    select: {
      id: true,
      sku: true,
      images: true,
      name: true,
      product: { select: { name: true, slug: true } },
    },
  });
  if (!v) notFound();

  const variantName =
    (v.name as { pt?: string; en?: string } | null)?.pt ??
    (v.name as { pt?: string; en?: string } | null)?.en ??
    v.sku;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={`SKU · ${sku}`}
        title={variantName}
        subtitle={
          <>
            A primeira imagem é o hero do card e do PDP. Reordena com ↑/↓, remove com ×.
            Upload de ficheiros via Vercel Blob (precisa <code className="font-mono text-[0.7rem]">BLOB_READ_WRITE_TOKEN</code> no Vercel) — sem token, o método URL continua a funcionar.
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

      <ImagesEditor sku={sku} initialImages={v.images} />
    </div>
  );
}
