import { currentStaff } from "@/lib/admin-auth";
import { PageHeader } from "@/components/admin/page-header";
import { MovimentosScanner } from "@/components/admin/movimentos-scanner";
import type { BoutiqueCode } from "@/lib/pos";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

function boutiquesForRole(role: string | null): BoutiqueCode[] {
  if (role === "LOJA_LIS") return ["LIS"];
  if (role === "LOJA_VNG") return ["VNG"];
  return ["LIS", "VNG"]; // ADMIN
}

// Movimentos de stock — Entrada / Saída via scan de EAN. Substitui a folha
// Mov_Int_Ext do Excel para o dia-a-dia da equipa. Cada scan grava um
// StockMovement + actualiza o cache de stock; a UI mostra o histórico da
// sessão actual (não precisa de estado persistente do lado do cliente).
// Acessível aos três roles de staff — a boutique é forçada para LOJA_*.
export default async function MovimentosPage() {
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
    <div className="mx-auto max-w-4xl px-6 py-8">
      <PageHeader
        eyebrow="Operações"
        title="Movimentos de Stock"
        subtitle={`Entradas e saídas por código de barras · ${scope}`}
      />
      <MovimentosScanner boutiques={boutiques} />
    </div>
  );
}
