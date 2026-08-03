"use client";

// Botão de imprimir + atalho para voltar. Cliente porque precisa do
// window.print(); mantido fora da página para o resto continuar server-side.
export function PrintButton() {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => history.back()}
        className="border border-line bg-paper px-4 py-2 text-[0.65rem] tracking-[0.14em] text-ink uppercase transition-colors hover:border-gold"
      >
        Voltar
      </button>
      <button
        type="button"
        onClick={() => window.print()}
        className="bg-ink px-5 py-2 text-[0.65rem] tracking-[0.14em] text-cream uppercase transition-colors hover:bg-gold hover:text-ink"
      >
        Imprimir ↓
      </button>
    </div>
  );
}
