import { currentStaff } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { AdminHero } from "@/components/admin/admin-hero";
import { PosTerminal } from "@/components/admin/pos-terminal";
import type { BoutiqueCode } from "@/lib/pos";
import { boutiquesForRole } from "@/components/admin/boutique-scope";

export const dynamic = "force-dynamic";

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
    <div>
      <AdminHero
        compact
        eyebrow="Operações"
        title="Ponto de Venda"
        subtitle={`Registo interno de vendas, devoluções e reparações por código de barras · ${scope}`}
      />
      <div className="mx-auto max-w-5xl">
        <PosTerminal
          operators={operators as { boutique: BoutiqueCode; initials: string }[]}
          boutiques={boutiques}
          isAdmin={staff?.role === "ADMIN"}
        />
      </div>
    </div>
  );
}
