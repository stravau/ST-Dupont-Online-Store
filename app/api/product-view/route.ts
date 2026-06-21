import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/product-view  — diagnostic. Returns the top 20 most-viewed
// slugs with their counts and the total impressions logged. Useful
// before the admin panel exists to confirm tracking is wired.
export async function GET() {
  try {
    const top = await prisma.product.findMany({
      where: { viewCount: { gt: 0 } },
      orderBy: { viewCount: "desc" },
      take: 20,
      select: { slug: true, viewCount: true },
    });
    const totalImpressions = await prisma.productView.count();
    return NextResponse.json({ ok: true, totalImpressions, top });
  } catch (e) {
    const msg = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
    return NextResponse.json(
      { ok: false, error: msg.replace(/\/\/[^@\s]*@/g, "//***@").slice(0, 600) },
      { status: 500 },
    );
  }
}

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
