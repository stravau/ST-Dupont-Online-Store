import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { put } from "@vercel/blob";

export const dynamic = "force-dynamic";

// PUT  — replaces the entire images[] array (used for add-by-URL,
//        reordering and removal in the editor).
// POST (?upload=1) — accepts a multipart file, stores it on Vercel
//        Blob (requires BLOB_READ_WRITE_TOKEN), returns the public
//        URL so the client can append to images[].

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ sku: string }> },
) {
  const { sku } = await params;
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id ?? null;

  let body: { images?: unknown };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 }); }

  if (!Array.isArray(body.images) || !body.images.every((x) => typeof x === "string")) {
    return NextResponse.json({ ok: false, error: "images must be string[]" }, { status: 400 });
  }
  const images = body.images as string[];

  const current = await prisma.productVariant.findUnique({
    where: { sku }, select: { id: true, images: true },
  });
  if (!current) return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });

  await prisma.$transaction([
    prisma.productVariant.update({ where: { id: current.id }, data: { images } }),
    prisma.adminAction.create({
      data: {
        userId,
        entityType: "VARIANT",
        action: "UPDATE",
        entityId: sku,
        note: "images[] replaced",
        before: { images: current.images } as object,
        after:  { images } as object,
      },
    }),
  ]);
  return NextResponse.json({ ok: true });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ sku: string }> },
) {
  const { sku } = await params;
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { ok: false, error: "BLOB_READ_WRITE_TOKEN not set on this deploy" },
      { status: 501 },
    );
  }
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "no file" }, { status: 400 });
  }
  // Store at products/<sku>/<timestamp>-<filename> so the path is
  // self-describing and collisions are impossible within a session.
  // Stamp comes from the request side so we avoid Date.now() inside
  // any wider runtime that might pre-cache.
  const stamp = String(Date.now());
  const safeName = (file.name || "image.jpg").replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `products/${sku.toLowerCase()}/${stamp}-${safeName}`;
  try {
    const blob = await put(path, file, { access: "public" });
    return NextResponse.json({ ok: true, url: blob.url });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message.slice(0, 200) },
      { status: 500 },
    );
  }
}
