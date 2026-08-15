import { currentStaff } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import type { BoutiqueCode } from "@/lib/pos";
import { AdminHero } from "@/components/admin/admin-hero";
import { MovimentosScanner } from "@/components/admin/movimentos-scanner";
import { MovementHistory, type HistoryParams } from "./history";
import { boutiquesForRole } from "@/components/admin/boutique-scope";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// Movimentos de stock — Entrada / Saída via scan de EAN. Substitui a folha
// Mov_Int_Ext do Excel para o dia-a-dia da equipa. Cada scan grava um
// StockMovement + actualiza o cache de stock; a UI mostra o histórico da
// sessão actual (não precisa de estado persistente do lado do cliente).
// Acessível aos três roles de staff — a boutique é forçada para LOJA_*.
export default async function MovimentosPage({
  searchParams,
}: {
  searchParams: Promise<HistoryParams>;
}) {
  const sp = await searchParams;
  const staff = await currentStaff();
  const role = staff?.role;
  if (role !== "ADMIN" && role !== "LOJA_LIS" && role !== "LOJA_VNG") {
    redirect("/admin/login");
  }
  const boutiques = boutiquesForRole(role ?? null);

  // Operadores para o selector — os das lojas que este login pode operar.
  // No admin vêm os das duas; o scanner filtra pela loja escolhida. Mesmo
  // padrão do /admin/pos.
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
    // Mesma estrutura do /admin/pos: o hero corre edge-to-edge (as margens
    // negativas dele contam com o padding do <main>, e um wrapper estreito
    // à volta encolhia-o) e só o conteúdo é que fica com largura limitada.
    <div>
      <AdminHero
        compact
        eyebrow="Operações"
        title="Movimentos de Stock"
        subtitle={`Entradas e saídas por código de barras · ${scope}`}
      />
      <div className="mx-auto max-w-5xl">
        <MovimentosScanner
          boutiques={boutiques}
          operators={operators as { boutique: BoutiqueCode; initials: string }[]}
        />
      </div>
      {/* O histórico usa a largura toda — é uma tabela de oito colunas e
          espremê-la nos 5xl do scanner não ajudava ninguém. */}
      <MovementHistory boutiques={boutiques} params={sp} />
    </div>
  );
}
