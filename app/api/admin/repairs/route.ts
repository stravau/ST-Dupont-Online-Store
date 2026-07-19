import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentStaff } from "@/lib/admin-auth";
import { assertRateLimit, assertSameOrigin, safeError } from "@/lib/admin-api";
import { boutiqueFromRole, isStaffRole, type BoutiqueCode } from "@/lib/pos";

export const dynamic = "force-dynamic";

const STATUSES = [
  "AGUARDANDO_CLIENTE",
  "AGUARDANDO_STD",
  "AGUARDANDO_JM",
  "AGUARDANDO_PR",
  "ART_EM_REPARACAO",
  "RESOLVIDO",
  "POR_DAR_RESPOSTA",
  "POR_VERIFICAR",
] as const;
type RepairStatus = (typeof STATUSES)[number];
const isStatus = (v: unknown): v is RepairStatus => typeof v === "string" && (STATUSES as readonly string[]).includes(v);

// Trim a string field; empty → null (so optional columns clear cleanly).
function str(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t ? t : null;
}
// A "YYYY-MM-DD" (from a date input) → Date at local midnight; blank → null.
function day(v: unknown): Date | null {
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  const [y, m, d] = v.split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

// POST /api/admin/repairs — open a new repair ticket. 1ª Visita is stamped
// automatically (or accepts an explicit firstVisit date). LOJA_* rows are
// pinned to their boutique; ADMIN may name it.
export async function POST(req: Request) {
  const csrf = assertSameOrigin(req);
  if (csrf) return csrf;
  const rl = await assertRateLimit(req, "repairs", 120, 60_000);
  if (rl) return rl;

  const staff = await currentStaff();
  const role = staff?.role ?? null;
  if (!isStaffRole(role)) return NextResponse.json({ ok: false }, { status: 403 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 });
  }

  const roleBoutique = boutiqueFromRole(role);
  const reqBoutique =
    body.boutique === "LIS" || body.boutique === "VNG" ? (body.boutique as BoutiqueCode) : null;
  const boutique = roleBoutique ?? reqBoutique ?? "LIS";

  const staffInitials = str(body.staff) ?? "";
  const customerName = str(body.customerName);
  const reference = str(body.reference);
  const subject = str(body.subject);
  if (!customerName || !reference || !subject) {
    return NextResponse.json({ ok: false, error: "cliente, referência e assunto são obrigatórios" }, { status: 400 });
  }

  try {
    const repair = await prisma.repair.create({
      data: {
        boutique,
        firstVisitAt: day(body.firstVisit) ?? undefined,
        staff: staffInitials,
        status: isStatus(body.status) ? body.status : "POR_VERIFICAR",
        customerName,
        reference,
        subject,
        updates: str(body.updates),
        lastContactAt: day(body.lastContactAt),
        lastContactStaff: str(body.lastContactStaff),
        lastContactVia: str(body.lastContactVia),
        lastContactNote: str(body.lastContactNote),
        otherObs: str(body.otherObs),
        phone: str(body.phone),
        otherContacts: str(body.otherContacts),
      },
    });
    return NextResponse.json({ ok: true, id: repair.id });
  } catch (e) {
    return safeError(e);
  }
}

// PATCH /api/admin/repairs — update an existing ticket (the "Ir atualizando"
// columns). Body: { id, ...fields }. Only the fields present are touched.
export async function PATCH(req: Request) {
  const csrf = assertSameOrigin(req);
  if (csrf) return csrf;
  const rl = await assertRateLimit(req, "repairs", 240, 60_000);
  if (rl) return rl;

  const staff = await currentStaff();
  const role = staff?.role ?? null;
  if (!isStaffRole(role)) return NextResponse.json({ ok: false }, { status: 403 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 });
  }
  const id = str(body.id);
  if (!id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });

  // A LOJA_* login may only touch its own boutique's tickets.
  const roleBoutique = boutiqueFromRole(role);
  if (roleBoutique) {
    const existing = await prisma.repair.findUnique({ where: { id }, select: { boutique: true } });
    if (!existing) return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
    if (existing.boutique !== roleBoutique) {
      return NextResponse.json({ ok: false, error: `role restricted to ${roleBoutique}` }, { status: 403 });
    }
  }

  const data: Record<string, unknown> = {};
  if ("staff" in body) data.staff = str(body.staff) ?? "";
  if ("status" in body && isStatus(body.status)) data.status = body.status;
  if ("customerName" in body) data.customerName = str(body.customerName) ?? "";
  if ("reference" in body) data.reference = str(body.reference) ?? "";
  if ("subject" in body) data.subject = str(body.subject) ?? "";
  if ("updates" in body) data.updates = str(body.updates);
  if ("firstVisit" in body) data.firstVisitAt = day(body.firstVisit) ?? undefined;
  if ("lastContactAt" in body) data.lastContactAt = day(body.lastContactAt);
  if ("lastContactStaff" in body) data.lastContactStaff = str(body.lastContactStaff);
  if ("lastContactVia" in body) data.lastContactVia = str(body.lastContactVia);
  if ("lastContactNote" in body) data.lastContactNote = str(body.lastContactNote);
  if ("otherObs" in body) data.otherObs = str(body.otherObs);
  if ("phone" in body) data.phone = str(body.phone);
  if ("otherContacts" in body) data.otherContacts = str(body.otherContacts);

  try {
    await prisma.repair.update({ where: { id }, data });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return safeError(e);
  }
}
