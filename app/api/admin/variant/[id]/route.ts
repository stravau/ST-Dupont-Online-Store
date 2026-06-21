import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

// Inline edits from /admin/variants — accepts a sparse JSON payload
// with any of { ean, priceCents, status, stock } and writes them in
// one transaction with an AdminAction audit row capturing the diff.
// Middleware has already gated for ADMIN.
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id ?? null;

  let body: Record<string, unknown>;
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 }); }

  const current = await prisma.productVariant.findUnique({
    where: { id },
    select: { id: true, sku: true, ean: true, priceCents: true, status: true, stock: true },
  });
  if (!current) return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });

  const data: Record<string, unknown> = {};
  const before: Record<string, unknown> = {};
  const after:  Record<string, unknown> = {};

  if ("ean" in body) {
    const v = body.ean;
    if (v !== null && typeof v !== "string") return NextResponse.json({ ok: false, error: "ean must be string|null" }, { status: 400 });
    data.ean = v;
    if (v !== current.ean) { before.ean = current.ean; after.ean = v; }
  }
  if ("priceCents" in body) {
    const v = body.priceCents;
    if (typeof v !== "number" || !Number.isFinite(v) || v < 0) return NextResponse.json({ ok: false, error: "priceCents invalid" }, { status: 400 });
    data.priceCents = v;
    data.pvpStartDate = new Date();
    if (v !== current.priceCents) { before.priceCents = current.priceCents; after.priceCents = v; }
  }
  if ("status" in body) {
    const v = body.status;
    if (v !== "DISPONIVEL" && v !== "INDISPONIVEL" && v !== "DESCONTINUADO") {
      return NextResponse.json({ ok: false, error: "status invalid" }, { status: 400 });
    }
    data.status = v;
    if (v !== current.status) { before.status = current.status; after.status = v; }
  }
  if ("stock" in body) {
    const v = body.stock;
    if (typeof v !== "number" || !Number.isInteger(v) || v < 0) return NextResponse.json({ ok: false, error: "stock invalid" }, { status: 400 });
    data.stock = v;
    if (v !== current.stock) { before.stock = current.stock; after.stock = v; }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ ok: true, noop: true });
  }

  try {
    await prisma.$transaction([
      prisma.productVariant.update({ where: { id }, data }),
      prisma.adminAction.create({
        data: {
          userId,
          entityType: "VARIANT",
          action: "UPDATE",
          entityId: current.sku,
          before: before as object,
          after:  after  as object,
        },
      }),
    ]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message.slice(0, 200) },
      { status: 500 },
    );
  }
}
