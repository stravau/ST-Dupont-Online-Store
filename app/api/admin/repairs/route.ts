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

const REPAIR_TYPES = ["ISQUEIRO", "ESCRITA", "PELE"] as const;
type RepairType = (typeof REPAIR_TYPES)[number];
const asRepairType = (v: unknown): RepairType | null =>
  typeof v === "string" && (REPAIR_TYPES as readonly string[]).includes(v) ? (v as RepairType) : null;

// Non-negative integer cents from a number|null (blank/invalid → null).
function cents(v: unknown): number | null {
  if (typeof v !== "number" || !Number.isFinite(v) || v < 0) return null;
  return Math.round(v);
}

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

// Tri-estado para a Garantia: true = sim, false = não, null = por apurar.
// Um checkbox não servia — "não perguntámos" e "não tem garantia" são coisas
// diferentes num documento que o cliente assina.
function tribool(v: unknown): boolean | null {
  if (v === true || v === "true" || v === "SIM") return true;
  if (v === false || v === "false" || v === "NAO" || v === "NÃO") return false;
  return null;
}

// Próximo número de ficha para a loja. Corre dentro de uma transacção com o
// nível SERIALIZABLE porque dois registos abertos ao mesmo tempo na mesma loja
// pediriam o mesmo max+1; o índice único ([boutique, ticketNumber]) apanha a
// colisão de qualquer forma, e o caller repete.
async function createWithTicketNumber(
  data: Omit<Parameters<typeof prisma.repair.create>[0]["data"], "ticketNumber">,
  boutique: BoutiqueCode,
) {
  for (let attempt = 0; attempt < 4; attempt++) {
    // `ticketNumber: { not: null }` não é defensivo, é obrigatório: a coluna é
    // nullable e o Postgres ordena NULLS FIRST num DESC. Bastava UMA ficha sem
    // número — e havia uma — para esta consulta a devolver sempre a ela, o
    // próximo sair 0+1=1, chocar com a LIS-0001 e o registo falhar. Sempre, e
    // não de vez em quando: as quatro tentativas recalculavam o mesmo 1.
    const last = await prisma.repair.findFirst({
      where: { boutique, ticketNumber: { not: null } },
      orderBy: { ticketNumber: "desc" },
      select: { ticketNumber: true },
    });
    const next = (last?.ticketNumber ?? 0) + 1;
    try {
      return await prisma.repair.create({ data: { ...data, ticketNumber: next } });
    } catch (e) {
      // P2002 = unique violation: outro registo levou este número. Tenta o
      // seguinte em vez de rebentar na cara de quem está a atender.
      const code = (e as { code?: string })?.code;
      if (code !== "P2002" || attempt === 3) throw e;
    }
  }
  throw new Error("não consegui atribuir número de ficha");
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
  const modelName = str(body.modelName);
  // `reference` is kept for compat; the manager sends it = modelName.
  const reference = str(body.reference) ?? modelName;
  const subject = str(body.subject);
  if (!customerName || !modelName || !subject) {
    return NextResponse.json({ ok: false, error: "cliente, modelo da peça e assunto são obrigatórios" }, { status: 400 });
  }

  try {
    const repair = await createWithTicketNumber(
      {
        boutique,
        firstVisitAt: day(body.firstVisit) ?? undefined,
        staff: staffInitials,
        status: isStatus(body.status) ? body.status : "POR_VERIFICAR",
        customerName,
        reference: reference ?? modelName,
        repairType: asRepairType(body.repairType),
        modelName,
        estimatedCostCents: cents(body.estimatedCostCents),
        serialNumber: str(body.serialNumber),
        usageMarks: str(body.usageMarks),
        underWarranty: tribool(body.underWarranty),
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
      boutique,
    );
    return NextResponse.json({ ok: true, id: repair.id, ticketNumber: repair.ticketNumber });
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
  if ("repairType" in body) data.repairType = asRepairType(body.repairType);
  if ("modelName" in body) data.modelName = str(body.modelName);
  if ("estimatedCostCents" in body) data.estimatedCostCents = cents(body.estimatedCostCents);
  if ("serialNumber" in body) data.serialNumber = str(body.serialNumber);
  if ("usageMarks" in body) data.usageMarks = str(body.usageMarks);
  if ("underWarranty" in body) data.underWarranty = tribool(body.underWarranty);
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
