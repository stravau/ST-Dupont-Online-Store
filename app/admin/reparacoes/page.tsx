import { currentStaff } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { RepairsManager, type RepairRow } from "@/components/admin/repairs-manager";
import type { BoutiqueCode } from "@/lib/pos";

export const dynamic = "force-dynamic";

function boutiquesForRole(role: string | null): BoutiqueCode[] {
  if (role === "LOJA_LIS") return ["LIS"];
  if (role === "LOJA_VNG") return ["VNG"];
  return ["LIS", "VNG"];
}

// A Date → local "YYYY-MM-DD" (the shape the <input type="date"> and the API expect).
const iso = (d: Date | null): string => {
  if (!d) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export default async function ReparacoesPage() {
  const staff = await currentStaff();
  const boutiques = boutiquesForRole(staff?.role ?? null);

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

  const repairs: RepairRow[] = rows.map((r) => ({
    id: r.id,
    boutique: r.boutique as BoutiqueCode,
    firstVisit: iso(r.firstVisitAt),
    staff: r.staff,
    status: r.status,
    customerName: r.customerName,
    reference: r.reference,
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
      <PageHeader
        eyebrow="Operações"
        title="Reparações"
        subtitle={`Assistência e pós-venda · ${scope}`}
      />
      <RepairsManager repairs={repairs} staffOptions={staffOptions} boutiques={boutiques} today={today} />
    </div>
  );
}
