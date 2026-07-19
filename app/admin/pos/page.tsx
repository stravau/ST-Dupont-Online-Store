import { currentStaff } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { PosTerminal } from "@/components/admin/pos-terminal";
import type { BoutiqueCode } from "@/lib/pos";

export const dynamic = "force-dynamic";

// The boutiques a staff login may operate. LOJA_* are pinned to their own
// store; ADMIN (the boss) can ring up either.
function boutiquesForRole(role: string | null): BoutiqueCode[] {
  if (role === "LOJA_LIS") return ["LIS"];
  if (role === "LOJA_VNG") return ["VNG"];
  return ["LIS", "VNG"]; // ADMIN
}

export default async function PosPage() {
  const staff = await currentStaff();
  const boutiques = boutiquesForRole(staff?.role ?? null);

  const operators = await prisma.operator.findMany({
    where: { boutique: { in: boutiques }, active: true },
    orderBy: [{ boutique: "asc" }, { initials: "asc" }],
    select: { boutique: true, initials: true },
  });

  const scope =
    boutiques.length === 1
      ? boutiques[0] === "LIS"
        ? "Boutique Lisboa"
        : "Boutique V. N. de Gaia"
      : "Ambas as boutiques";

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <PageHeader
        eyebrow="Operações"
        title="Ponto de Venda"
        subtitle={`Registo interno de vendas e devoluções por código de barras · ${scope}`}
      />
      <PosTerminal operators={operators as { boutique: BoutiqueCode; initials: string }[]} boutiques={boutiques} />
    </div>
  );
}
