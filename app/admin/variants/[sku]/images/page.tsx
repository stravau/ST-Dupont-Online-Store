import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ImagesEditor } from "./images-client";

export const dynamic = "force-dynamic";

export default async function VariantImagesPage({ params }: { params: Promise<{ sku: string }> }) {
  const { sku } = await params;
  const v = await prisma.productVariant.findUnique({
    where: { sku },
    select: { id: true, sku: true, images: true, name: true, product: { select: { name: true, slug: true } } },
  });
  if (!v) notFound();

  const variantName =
    (v.name as { pt?: string; en?: string } | null)?.pt ??
    (v.name as { pt?: string; en?: string } | null)?.en ??
    v.sku;

  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin/variants" className="text-xs tracking-[0.18em] text-muted uppercase hover:text-gold">← Voltar</Link>
        <p className="overline mt-3 text-gold">Imagens</p>
        <h1 className="mt-2 font-serif text-3xl">{variantName}</h1>
        <p className="mt-1 font-mono text-xs text-muted">{sku}</p>
      </header>

      <ImagesEditor sku={sku} initialImages={v.images} />

      <p className="text-xs text-muted">
        Para upload de ficheiros (drag-and-drop), define a env var <code className="font-mono">BLOB_READ_WRITE_TOKEN</code> no Vercel.
        Sem token configurado, só funciona o método de URL.
      </p>
    </div>
  );
}
