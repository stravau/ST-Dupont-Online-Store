// Availability line under "Pedir Informação" on the PDP. This is a boutique
// showcase, not an online shop selling from stock, so we don't surface live
// per-boutique counts or an "esgotado" that makes the catalogue look sold out.
// Instead we state that availability is confirmed on enquiry — the real stock
// still drives the admin / POS / reports internally.

export interface AvailabilityLabels {
  title: string; // "Disponibilidade em boutique"
  onRequest: string; // "Disponibilidade sob confirmação"
}

export function AvailabilityStrip({ labels }: { labels: AvailabilityLabels }) {
  return (
    <div className="border-t border-line pt-6">
      <p className="overline">{labels.title}</p>
      <p className="mt-3 flex items-center gap-2.5">
        <span aria-hidden className="inline-block h-2 w-2 rounded-full bg-gold" />
        <span className="text-xs tracking-[0.14em] text-ink uppercase">{labels.onRequest}</span>
      </p>
    </div>
  );
}
