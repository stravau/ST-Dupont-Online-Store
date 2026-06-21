import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Records a single PDP impression — bumps the denormalised Product.viewCount
// (drives the "Most viewed" carousel) and appends a row to ProductView
// (backs the admin analytics view). Anonymous: no userId, no IP, just the
// slug. Failures swallow silently — a missed view is acceptable, breaking
// the page isn't.
export async function POST(req: Request) {
  try {
    const { slug } = await req.json();
    if (typeof slug !== "string" || !slug) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    const product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!product) return NextResponse.json({ ok: false }, { status: 404 });

    await prisma.$transaction([
      prisma.product.update({
        where: { id: product.id },
        data: { viewCount: { increment: 1 } },
      }),
      prisma.productView.create({ data: { productId: product.id } }),
    ]);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
