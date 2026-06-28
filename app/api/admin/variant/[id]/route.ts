import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { assertRateLimit, assertSameOrigin, isValidEan, safeError } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

// Inline edits from /admin/variants — accepts a sparse JSON payload
// with any of { ean, priceCents, status, stock, description } and
// writes them in one transaction with an AdminAction audit row
// capturing the diff. Auth is gated by proxy.ts. Same-origin check is
// defence in depth on top of SameSite=Lax cookies.
//
// Optimistic concurrency: callers MAY send `expectedUpdatedAt` (ISO
// string). When supplied we refuse the write if the row's current
// `updatedAt` differs — last-write-wins between two admins editing the
// same SKU becomes a clean 409 the client can recover from.
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const csrf = assertSameOrigin(req);
  if (csrf) return csrf;
  const rl = await assertRateLimit(req, "variant-patch", 120, 60_000);
  if (rl) return rl;

  const { id } = await params;
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id ?? null;
  const role   = (session?.user as { role?: string } | undefined)?.role ?? null;

  let body: Record<string, unknown>;
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 }); }

  // Boutique roles can only touch their own stock column. Reject any
  // payload that tries to write a forbidden field with 403, before any
  // DB read.
  if (role === "LOJA_LIS" || role === "LOJA_VNG") {
    const allowed = role === "LOJA_LIS" ? "stockLis" : "stockVng";
    const editable = ["stockLis", "stockVng", "expectedUpdatedAt"]; // only the allowed key + the optimistic-concurrency marker
    const submitted = Object.keys(body).filter((k) => k !== "expectedUpdatedAt");
    if (submitted.some((k) => k !== allowed)) {
      return NextResponse.json(
        { ok: false, error: `role ${role} can only edit ${allowed}` },
        { status: 403 },
      );
    }
    void editable;
  }

  const current = await prisma.productVariant.findUnique({
    where: { id },
    select: {
      id: true, sku: true, ean: true, priceCents: true, status: true,
      stock: true, stockLis: true, stockVng: true,
      description: true, updatedAt: true, active: true,
    },
  });
  if (!current) return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });

  // Optimistic-concurrency guard — when the client supplies the
  // updatedAt it saw at edit time, refuse to write over a newer copy.
  if (typeof body.expectedUpdatedAt === "string") {
    const seen = new Date(body.expectedUpdatedAt);
    if (!Number.isNaN(seen.getTime()) && seen.getTime() !== current.updatedAt.getTime()) {
      return NextResponse.json(
        { ok: false, error: "conflict — variant was updated elsewhere", currentUpdatedAt: current.updatedAt },
        { status: 409 },
      );
    }
  }

  const data: Record<string, unknown> = {};
  const before: Record<string, unknown> = {};
  const after:  Record<string, unknown> = {};

  if ("ean" in body) {
    const v = body.ean;
    if (v !== null && typeof v !== "string") return NextResponse.json({ ok: false, error: "ean must be string|null" }, { status: 400 });
    // EAN-13 or EAN-8 only (or null/empty to clear). Anything else
    // would land in the unique index as garbage that breaks
    // scanner-based lookups later.
    if (!isValidEan(v as string | null)) {
      return NextResponse.json({ ok: false, error: "ean must be 8 or 13 digits" }, { status: 400 });
    }
    const normalised = v === null || (v as string).trim() === "" ? null : (v as string).trim();
    if (normalised !== current.ean) {
      data.ean = normalised;
      before.ean = current.ean;
      after.ean = normalised;
    }
  }
  if ("priceCents" in body) {
    const v = body.priceCents;
    if (typeof v !== "number" || !Number.isFinite(v) || v < 0) return NextResponse.json({ ok: false, error: "priceCents invalid" }, { status: 400 });
    // Only write priceCents + pvpStartDate when the value ACTUALLY changes
    // — onBlur fires on every focus loss in the admin table, even with no
    // edit, and silently resetting pvpStartDate on every no-op was
    // corrupting the price-history timeline.
    if (v !== current.priceCents) {
      data.priceCents = v;
      data.pvpStartDate = new Date();
      before.priceCents = current.priceCents;
      after.priceCents = v;
    }
  }
  if ("status" in body) {
    const v = body.status;
    if (v !== "DISPONIVEL" && v !== "INDISPONIVEL" && v !== "DESCONTINUADO") {
      return NextResponse.json({ ok: false, error: "status invalid" }, { status: 400 });
    }
    if (v !== current.status) {
      data.status = v;
      // Keep the legacy `active` flag in sync with `status` so storefront
      // queries that still filter on `active` agree with the lifecycle
      // state shown in /admin. DESCONTINUADO and INDISPONIVEL both flip
      // active to false so the PDP / catalogue stops serving the row.
      const nextActive = v === "DISPONIVEL";
      if (nextActive !== current.active) {
        data.active = nextActive;
      }
      before.status = current.status;
      after.status = v;
    }
  }
  // Per-store stock columns — ADMIN can set the totals directly via
  // `stock`; LOJA_* edit only their own column. After any change to
  // stockLis or stockVng we automatically recompute the legacy `stock`
  // total so storefront queries (and the catalog low-stock KPI) stay
  // consistent without per-call recomputation.
  let nextLis = current.stockLis;
  let nextVng = current.stockVng;
  let lisOrVngChanged = false;
  if ("stockLis" in body) {
    const v = body.stockLis;
    if (typeof v !== "number" || !Number.isInteger(v) || v < 0) return NextResponse.json({ ok: false, error: "stockLis invalid" }, { status: 400 });
    if (v !== current.stockLis) {
      data.stockLis = v;
      before.stockLis = current.stockLis;
      after.stockLis = v;
      nextLis = v;
      lisOrVngChanged = true;
    }
  }
  if ("stockVng" in body) {
    const v = body.stockVng;
    if (typeof v !== "number" || !Number.isInteger(v) || v < 0) return NextResponse.json({ ok: false, error: "stockVng invalid" }, { status: 400 });
    if (v !== current.stockVng) {
      data.stockVng = v;
      before.stockVng = current.stockVng;
      after.stockVng = v;
      nextVng = v;
      lisOrVngChanged = true;
    }
  }
  if (lisOrVngChanged) {
    const newTotal = nextLis + nextVng;
    if (newTotal !== current.stock) {
      data.stock = newTotal;
      before.stock = current.stock;
      after.stock = newTotal;
    }
  } else if ("stock" in body) {
    // Direct total edit (ADMIN only — loja roles get blocked at the
    // earlier role gate). Used by the legacy upload paths until each
    // store sends its own column.
    const v = body.stock;
    if (typeof v !== "number" || !Number.isInteger(v) || v < 0) return NextResponse.json({ ok: false, error: "stock invalid" }, { status: 400 });
    if (v !== current.stock) {
      data.stock = v;
      before.stock = current.stock;
      after.stock = v;
    }
  }
  // Per-colourway description override — JSON { pt, en } | null. Pass
  // null to clear the override and have the PDP fall back to the parent
  // Product.description copy. Empty-string PT and EN together are
  // promoted to null so the PDP fallback logic (truthy check on the
  // locale string) actually fires instead of rendering a blank section.
  if ("description" in body) {
    const v = body.description;
    const isObj = v !== null && typeof v === "object" && !Array.isArray(v);
    const ptStr = isObj && typeof (v as Record<string, unknown>).pt === "string" ? ((v as Record<string, string>).pt) : undefined;
    const enStr = isObj && typeof (v as Record<string, unknown>).en === "string" ? ((v as Record<string, string>).en) : undefined;
    const valid = v === null || (isObj && (ptStr !== undefined || enStr !== undefined));
    if (!valid) return NextResponse.json({ ok: false, error: "description must be { pt?, en? } or null" }, { status: 400 });
    const allBlank = v === null || ((ptStr ?? "").trim() === "" && (enStr ?? "").trim() === "");
    const stored = allBlank ? null : { pt: (ptStr ?? "").trim(), en: (enStr ?? "").trim() };
    // Stable string compare so a re-save of identical copy doesn't
    // generate a noop audit row.
    const currentStr = current.description ? JSON.stringify(current.description) : "null";
    const nextStr = stored ? JSON.stringify(stored) : "null";
    if (currentStr !== nextStr) {
      data.description = stored;
      before.description = current.description;
      after.description = stored;
    }
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
    return safeError(e);
  }
}
