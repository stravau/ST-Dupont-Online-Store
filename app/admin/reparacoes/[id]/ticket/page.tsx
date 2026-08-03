import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { currentStaff } from "@/lib/admin-auth";
import { boutiquesForRole } from "@/components/admin/boutique-scope";
import { STORE_LIS, STORE_VNG } from "@/lib/store-info";
import { REPAIR_TERMS, REPAIR_TYPE_LABEL, ticketRef } from "@/lib/repair-ticket";
import { PrintButton } from "./print-button";
import { Logo } from "@/components/logo";
import type { BoutiqueCode } from "@/lib/pos";

export const dynamic = "force-dynamic";

// Ficha de Assistência para impressora de talões (rolo 80mm, altura livre).
//
// Saem duas vias seguidas no mesmo rolo:
//   • Via do cliente — completa, com as condições de prestação de assistência.
//   • Via da loja — compacta, sem o texto legal (fica agrafada à peça, e o
//     texto legal só interessa a quem o assina).
//
// HTML impresso pelo browser em vez de comandos ESC/POS: funciona com
// qualquer impressora que tenha driver no Windows, não obriga a escolher
// modelo, e reaproveita as fontes do painel.

const eur = (c: number) => (c / 100).toLocaleString("pt-PT", { style: "currency", currency: "EUR" });
const dmy = (d: Date | null) =>
  d ? d.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" }) : "___/___/____";

export default async function RepairTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const staff = await currentStaff();
  const role = staff?.role;
  if (role !== "ADMIN" && role !== "LOJA_LIS" && role !== "LOJA_VNG") redirect("/admin/login");

  const repair = await prisma.repair.findUnique({ where: { id } });
  if (!repair) notFound();
  // Uma loja não imprime a ficha da outra.
  if (!boutiquesForRole(role).includes(repair.boutique as BoutiqueCode)) notFound();

  const store = repair.boutique === "VNG" ? STORE_VNG : STORE_LIS;
  const ref = ticketRef(repair.boutique as BoutiqueCode, repair.ticketNumber);

  return (
    <>
      {/* Barra de acções — fora do .ticket-roll, portanto não vai ao papel. */}
      <div className="no-print mb-4 flex items-center justify-between gap-4 border-b border-line pb-3">
        <div>
          <p className="text-[0.6rem] tracking-[0.16em] text-muted uppercase">Ficha de assistência</p>
          <p className="font-mono text-sm text-ink">{ref}</p>
          <p className="mt-1 text-[0.62rem] text-muted">
            Rolo 80&nbsp;mm · dois talões separados (o cortador da impressora divide-os)
          </p>
        </div>
        <PrintButton />
      </div>

      <div className="ticket-roll">
        <Copy repair={repair} store={store} ref_={ref} which="cliente" />
        <div className="copy-gap no-print" />
        <Copy repair={repair} store={store} ref_={ref} which="loja" />
      </div>
    </>
  );
}

type RepairRecord = NonNullable<Awaited<ReturnType<typeof prisma.repair.findUnique>>>;

function Copy({
  repair,
  store,
  ref_,
  which,
}: {
  repair: RepairRecord;
  store: typeof STORE_LIS;
  ref_: string;
  which: "cliente" | "loja";
}) {
  // A via do cliente leva as condições de prestação de assistência; a da loja
  // vai agrafada à peça e não precisa do texto legal — poupa meio metro de
  // papel em cada processo.
  const full = which === "cliente";
  const warranty =
    repair.underWarranty === true ? "SIM" : repair.underWarranty === false ? "NÃO" : "—";

  return (
    <section className="ticket-copy" data-copy={which}>
      <div className="text-center">
        {/* Logo oficial. A arte é branca, por isso vai invertida para preto —
            é o mesmo que o resto do site faz sobre fundos claros. Em papel
            térmico convém ficar generoso no tamanho: linhas finas de mais
            saem esbatidas na impressão a 1 bit. */}
        <Logo variant="dark" width={150} className="ticket-logo mx-auto" />
        <p className="mt-1 text-[6.5pt] leading-tight">{store.venue}</p>
        <p className="text-[6.5pt] leading-tight">Tlf: {store.phone}</p>
        <p className="text-[6.5pt] leading-tight">{store.email}</p>
      </div>

      <div className="mt-2 border-y border-black py-1 text-center">
        <p className="text-[6.5pt] tracking-[0.14em] uppercase">Ficha de Assistência</p>
        <p className="font-mono text-[13pt] font-bold leading-tight">{ref_}</p>
        <p className="text-[6.5pt]">Entrada: {dmy(repair.firstVisitAt)}</p>
      </div>

      <Row label="Cliente" value={repair.customerName} />
      <Row label="Telefone" value={repair.phone ?? ""} />
      {full && <Row label="Email / outros contactos" value={repair.otherContacts ?? ""} />}

      <Row
        label="Objecto"
        value={repair.repairType ? (REPAIR_TYPE_LABEL[repair.repairType] ?? repair.repairType) : ""}
      />
      <Row label="Modelo" value={repair.modelName ?? repair.reference ?? ""} />
      <Row label="Nº de série" value={repair.serialNumber ?? ""} />
      <Row label="Garantia" value={warranty} />
      <Row label="Marcas de uso visíveis" value={repair.usageMarks ?? ""} lines={2} />
      <Row label="Descrição da anomalia" value={repair.subject} lines={2} />
      {repair.estimatedCostCents != null && (
        <Row label="Orçamento estimado" value={eur(repair.estimatedCostCents)} />
      )}

      {full && (
        <div className="mt-2 border-t border-black pt-1">
          <p className="text-[6.5pt] font-bold tracking-[0.1em] uppercase">
            Condições de prestação de assistência
          </p>
          {/* 6.8pt é o mínimo que uma térmica de 203 dpi ainda resolve com
              nitidez; abaixo disso as hastes das letras caem entre pontos. */}
          <ol className="mt-1 list-decimal space-y-[2px] pl-3">
            {REPAIR_TERMS.map((t) => (
              <li key={t.title} className="text-[6.8pt] leading-[1.25]">
                <span className="font-bold">{t.title}:</span> {t.body}
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="mt-3">
        <div className="border-b border-black" style={{ marginTop: "7mm" }} />
        <p className="mt-0.5 text-[6pt] tracking-[0.1em] uppercase">Cliente</p>
        <div className="border-b border-black" style={{ marginTop: "6mm" }} />
        <p className="mt-0.5 text-[6pt] tracking-[0.1em] uppercase">
          Colaborador{repair.staff ? ` · ${repair.staff}` : ""}
        </p>
      </div>

      <p className="mt-2 text-center text-[6pt] tracking-[0.14em] uppercase">
        {full ? "Via do cliente" : "Via da loja"}
      </p>
    </section>
  );
}

// Linha do formulário. Sem valor deixa a linha a tracejado para preencher à
// mão — a peça pode chegar sem o nº de série à vista.
function Row({ label, value, lines = 1 }: { label: string; value: string; lines?: number }) {
  const filled = value.trim().length > 0;
  return (
    <div className="mt-1">
      <p className="text-[6pt] tracking-[0.08em] uppercase">{label}</p>
      {filled ? (
        <p className="text-[8pt] leading-tight break-words">{value}</p>
      ) : (
        <div style={{ minHeight: `${lines * 3.5}mm`, borderBottom: "1px dotted #000" }} />
      )}
    </div>
  );
}
