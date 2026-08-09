import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentStaff } from "@/lib/admin-auth";
import { assertRateLimit } from "@/lib/admin-api";
import { isStaffRole } from "@/lib/pos";
import { buildStockWorkbook, type StockDupontRow, type StockOtherRow } from "@/lib/stock-export";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// GET /api/admin/stock/export?modo=completo|resumido
//   completo — duas folhas, tudo o que a app sabe
//   resumido — uma folha, EAN/REF/STK LIS/STK VNG/Total, só o que tem stock
//
// Aberto aos três roles de staff: é a mesma informação que já veem em
// Consultar Stock, só que num ficheiro.
export async function GET(req: Request) {
  const rl = await assertRateLimit(req, "stock-export", 20, 60_000);
  if (rl) return rl;

  const staff = await currentStaff();
  if (!isStaffRole(staff?.role ?? null)) return NextResponse.json({ ok: false }, { status: 404 });

  const url = new URL(req.url);
  const mode = url.searchParams.get("modo") === "resumido" ? "resumido" : "completo";

  // O modo resumido só precisa de quatro campos e só das linhas com stock —
  // pedir tudo para depois deitar fora seria puxar o catálogo inteiro sem
  // necessidade.
  const [variants, others] = await Promise.all([
    prisma.productVariant.findMany({
      where: mode === "resumido" ? { stock: { gt: 0 } } : {},
      orderBy: { sku: "asc" },
      select:
        mode === "resumido"
          ? { ean: true, sku: true, stockLis: true, stockVng: true }
          : {
              ean: true, sku: true, name: true, priceCents: true, promoPriceCents: true,
              status: true, active: true, stockLis: true, stockVng: true,
              product: {
                select: {
                  name: true, collection: true, active: true,
                  category: { select: { slug: true } },
                },
              },
            },
    }),
    prisma.otherBrandItem.findMany({
      where: mode === "resumido" ? { stock: { gt: 0 } } : {},
      orderBy: [{ brand: "asc" }, { sku: "asc" }],
      select: { ean: true, sku: true, brand: true, descricao: true, pvpCents: true, stock: true, active: true },
    }),
  ]);

  const loc = (v: unknown) => {
    const o = v as { pt?: string; en?: string } | null;
    return o?.pt ?? o?.en ?? "";
  };

  type FullVariant = (typeof variants)[number] & {
    name?: unknown; priceCents?: number; promoPriceCents?: number | null;
    status?: string; active?: boolean;
    product?: { name?: unknown; collection?: string; active?: boolean; category?: { slug?: string } | null } | null;
  };

  const dupont: StockDupontRow[] = variants.map((v) => {
    const f = v as FullVariant;
    return {
      ean: f.ean,
      sku: f.sku,
      desc: loc(f.name),
      produto: loc(f.product?.name),
      categoria: f.product?.category?.slug ?? "",
      colecao: f.product?.collection ?? "",
      priceCents: f.priceCents ?? 0,
      promoPriceCents: f.promoPriceCents ?? null,
      status: f.status ?? "",
      // "Publicado" no site = a variant está activa E o produto também.
      publicado: !!f.active && !!f.product?.active,
      stockLis: f.stockLis ?? 0,
      stockVng: f.stockVng ?? 0,
    };
  });

  const other: StockOtherRow[] = others.map((o) => ({
    ean: o.ean,
    sku: o.sku,
    brand: o.brand,
    desc: o.descricao,
    pvpCents: o.pvpCents,
    stock: o.stock,
    active: o.active,
  }));

  const now = new Date();
  const buf = await buildStockWorkbook(mode, dupont, other, now);

  const ymd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const filename = `stock-${mode}-${ymd}.xlsx`;

  return new NextResponse(new Uint8Array(buf), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
