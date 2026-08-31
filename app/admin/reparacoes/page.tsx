import { currentStaff } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { AdminHero } from "@/components/admin/admin-hero";
import { RepairsManager, type RepairRow } from "@/components/admin/repairs-manager";
import type { BoutiqueCode } from "@/lib/pos";
import { boutiquesForRole, resolveScope } from "@/components/admin/boutique-scope";

export const dynamic = "force-dynamic";

// A Date → local "YYYY-MM-DD" (the shape the <input type="date"> and the API expect).
const iso = (d: Date | null): string => {
  if (!d) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export default async function ReparacoesPage({
  searchParams,
}: {
  searchParams: Promise<{ boutique?: string }>;
}) {
  const sp = await searchParams;
  const staff = await currentStaff();
  // O filtro do cabeçalho aplica-se à listagem. Passa pelo resolveScope e não
  // em cru, portanto um login de loja não consegue espreitar a outra
  // escrevendo ?boutique= no URL — o pedido é intersectado com o que o papel
  // permite.
  const { boutiques } = resolveScope(sp.boutique, boutiquesForRole(staff?.role ?? null));

  const [rows, operators] = await Promise.all([
    prisma.repair.findMany({
      where: { boutique: { in: boutiques } },
      orderBy: { firstVisitAt: "desc" },
    }),
    prisma.operator.findMany({
      where: { boutique: { in: boutiques } },
      orderBy: { initials: "asc" },
      select: { initials: true },
    }),
  ]);

  // O número vem da coluna, atribuído na criação e por loja — já não é
  // calculado por ordenação. O cliente leva-o escrito na ficha, portanto tem
  // de ser imóvel: antes, inserir um processo com data anterior fazia deslizar
  // todos os seguintes e o papel dele deixava de bater certo.
  const repairs: RepairRow[] = rows.map((r) => ({
    id: r.id,
    number: r.ticketNumber ?? 0,
    boutique: r.boutique as BoutiqueCode,
    firstVisit: iso(r.firstVisitAt),
    staff: r.staff,
    status: r.status,
    customerName: r.customerName,
    reference: r.reference,
    repairType: r.repairType,
    modelName: r.modelName,
    estimatedCostCents: r.estimatedCostCents,
    serialNumber: r.serialNumber,
    usageMarks: r.usageMarks,
    underWarranty: r.underWarranty,
    subject: r.subject,
    updates: r.updates,
    lastContactAt: iso(r.lastContactAt),
    lastContactStaff: r.lastContactStaff,
    lastContactVia: r.lastContactVia,
    lastContactNote: r.lastContactNote,
    otherObs: r.otherObs,
    phone: r.phone,
    otherContacts: r.otherContacts,
  }));

  // Distinct staff initials for the datalist — operators + anyone already on a ticket.
  const staffOptions = [...new Set([...operators.map((o) => o.initials), ...rows.map((r) => r.staff)].filter(Boolean))].sort();

  const today = iso(new Date());
  const scope = boutiques.length === 1 ? (boutiques[0] === "LIS" ? "Boutique Lisboa" : "Boutique V. N. de Gaia") : "Ambas as boutiques";

  return (
    <div>
      <AdminHero
        compact
        eyebrow="Operações"
        title="Reparações"
        subtitle={`Assistência e pós-venda · ${scope}`}
      />
      <RepairsManager repairs={repairs} staffOptions={staffOptions} boutiques={boutiques} today={today} />
    </div>
  );
}
