"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/admin/toast";

// "Anular" no registo de vendas. Pede o motivo antes de deixar avançar — uma
// anulação sem explicação é indistinguível de um erro, e é isto que se vai
// querer perceber quando alguém for à auditoria meses depois.
export function VoidSaleButton({ saleId, label }: { saleId: string; label: string }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    const r = reason.trim();
    if (r.length < 3) { setError("Explica o motivo (mínimo 3 caracteres)."); return; }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/pos/void", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ saleId, reason: r }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setError(data.error ?? `HTTP ${res.status}`);
        return;
      }
      toast.push("success", "Venda anulada · stock reposto");
      setOpen(false);
      setReason("");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => { setOpen(true); setError(null); }}
        className="text-[0.62rem] tracking-[0.14em] text-muted uppercase transition-colors hover:text-[#b94a3a]"
      >
        Anular
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm"
          onClick={busy ? undefined : () => setOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={submit}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md border border-[#b94a3a]/40 bg-paper p-6 shadow-2xl"
          >
            <h2 className="font-serif text-xl text-ink">Anular venda</h2>
            <p className="mt-1 font-mono text-[0.72rem] text-muted">{label}</p>

            <div className="mt-4 border border-[#b94a3a]/40 bg-[#b94a3a]/5 px-3 py-2 text-[0.72rem] text-[#8c2a2a]">
              A venda deixa de contar nos relatórios e o stock dos artigos é
              reposto. O registo não é apagado — fica marcado como anulado, com
              o motivo, e a operação vai para a Auditoria.
            </div>

            <label className="mt-4 block">
              <span className="overline mb-1.5 block text-[0.55rem] text-muted">Motivo (obrigatório)</span>
              <textarea
                autoFocus
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex.: código lido duas vezes · operador errado · preço trocado"
                className="w-full border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-gold"
              />
            </label>

            {error && (
              <p className="mt-3 border border-[#b94a3a]/40 bg-[#b94a3a]/10 px-3 py-2 text-sm text-[#8c2a2a]">
                {error}
              </p>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={busy}
                className="border border-line bg-paper px-4 py-2 text-[0.65rem] tracking-[0.14em] text-ink uppercase transition-colors hover:border-gold disabled:opacity-40"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={busy}
                className="bg-[#b94a3a] px-5 py-2 text-[0.65rem] tracking-[0.14em] text-cream uppercase transition-colors hover:bg-[#8c2a2a] disabled:opacity-40"
              >
                {busy ? "A anular…" : "Anular venda"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
