import { currentStaff } from "@/lib/admin-auth";
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
        <MovimentosScanner boutiques={boutiques} />
      </div>
      {/* O histórico usa a largura toda — é uma tabela de oito colunas e
          espremê-la nos 5xl do scanner não ajudava ninguém. */}
      <MovementHistory boutiques={boutiques} params={sp} />
    </div>
  );
}
