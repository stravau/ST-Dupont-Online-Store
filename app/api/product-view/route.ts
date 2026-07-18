import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { publicRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const STAFF_ROLES = new Set(["ADMIN", "LOJA_LIS", "LOJA_VNG"]);

// GET /api/product-view — diagnostic (top-viewed slugs + counts). This leaks
// the catalogue's popularity data, so it's staff-only now that the admin panel
// exists (the dashboard covers the same ground). Non-staff get a bare 404 so
// the endpoint's existence isn't advertised.
export async function GET() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!role || !STAFF_ROLES.has(role)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
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
  // Unauthenticated + writes to the DB on every call — throttle per IP so it
  // can't be scripted to bloat ProductView or skew the "Most viewed" carousel.
  // 60/min/IP is well above one shopper browsing distinct PDPs.
  const limited = publicRateLimit(req, "product-view", 60);
  if (limited) return limited;

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
