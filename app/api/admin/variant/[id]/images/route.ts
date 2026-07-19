import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { put } from "@vercel/blob";
import { assertRateLimit, assertSameOrigin, isValidImageUrl, safeError, validateImageUpload } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

// Per-variant cap on stored images. The editor UI shows the gallery; if
// we ever need more we can bump this, but right now ten covers every
// product photo set we ship.
const MAX_IMAGES_PER_VARIANT = 12;

// PUT  — replaces the entire images[] array (used for add-by-URL,
//        reordering and removal in the editor).
// POST (?upload=1) — accepts a multipart file, stores it on Vercel
//        Blob (requires BLOB_READ_WRITE_TOKEN), returns the public
//        URL so the client can append to images[].

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const csrf = assertSameOrigin(req);
  if (csrf) return csrf;
  const rl = await assertRateLimit(req, "images-put", 60, 60_000);
  if (rl) return rl;
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;
  const userId = gate.userId;

  const { id: sku } = await params;

  let body: { images?: unknown };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 }); }

  if (!Array.isArray(body.images)) {
    return NextResponse.json({ ok: false, error: "images must be an array" }, { status: 400 });
  }
  if (body.images.length > MAX_IMAGES_PER_VARIANT) {
    return NextResponse.json(
      { ok: false, error: `too many images (max ${MAX_IMAGES_PER_VARIANT})` },
      { status: 400 },
    );
  }
  // Reject any URL that isn't an absolute https:// or root-relative
  // path. Previously the editor would happily persist `javascript:alert`
  // or `data:` URIs that then exploded at render time — or worse, were
  // displayed verbatim somewhere admin-only as an XSS vector.
  if (!body.images.every(isValidImageUrl)) {
    return NextResponse.json(
      { ok: false, error: "images must be https:// URLs or /-relative paths" },
      { status: 400 },
    );
  }
  const images = body.images.map((s) => (s as string).trim());

  const current = await prisma.productVariant.findUnique({
    where: { sku }, select: { id: true, images: true },
  });
  if (!current) return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });

  try {
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
  } catch (e) {
    return safeError(e);
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const csrf = assertSameOrigin(req);
  if (csrf) return csrf;
  // Tighter limit on uploads — blob writes are expensive and one
  // admin clicking five times should NOT replace five copies.
  const rl = await assertRateLimit(req, "images-upload", 20, 60_000);
  if (rl) return rl;
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;
  const userId = gate.userId;

  const { id: sku } = await params;
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
  // Reject non-images and oversize files BEFORE buffering the file into
  // memory and pushing it to Blob. Previously the route accepted
  // anything claiming to be a File — a 500MB .exe with `image/*` in
  // accept= would land world-readable under products/<sku>/.
  const v = validateImageUpload(file);
  if (!v.ok) {
    return NextResponse.json({ ok: false, error: v.error }, { status: v.status });
  }
  // Store at products/<sku>/<timestamp>-<filename> so the path is
  // self-describing and collisions are impossible within a session.
  const stamp = String(Date.now());
  const safeName = (file.name || "image.jpg").replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `products/${sku.toLowerCase()}/${stamp}-${safeName}`;
  try {
    const blob = await put(path, file, { access: "public" });
    // Log the upload to AdminAction — gives us a paper trail for who
    // pushed which blob, so we can chase down anything inappropriate
    // that lands in /products via a stolen session.
    await prisma.adminAction.create({
      data: {
        userId,
        entityType: "VARIANT",
        action: "UPLOAD",
        entityId: sku,
        note: `image upload: ${safeName} (${file.size} bytes, ${file.type})`,
        after: { url: blob.url, size: file.size, mime: file.type } as object,
      },
    });
    return NextResponse.json({ ok: true, url: blob.url });
  } catch (e) {
    return safeError(e, "upload failed");
  }
}
