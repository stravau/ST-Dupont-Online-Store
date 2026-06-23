"use client";

import { useState } from "react";
import { useToast } from "@/components/admin/toast";

// Two textareas (PT + EN) wired to the variant PATCH endpoint. Save
// builds `{ pt, en }` and posts as `description`; empty inputs are
// promoted to `null` so the PDP falls back to the parent product copy.

type Localized = { pt?: string; en?: string };

export function DescriptionEditor({
  variantId,
  initial,
  fallback,
}: {
  variantId: string;
  initial: Localized | null;
  fallback: Localized | null;
}) {
  const toast = useToast();
  const [pt, setPt] = useState(initial?.pt ?? "");
  const [en, setEn] = useState(initial?.en ?? "");
  const [busy, setBusy] = useState(false);

  async function patch(payload: { description: { pt: string; en: string } | null }, successMsg: string) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/variant/${variantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(String(res.status));
      toast.push("success", successMsg);
    } catch (e) {
      toast.push("error", `Falha ao guardar: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    const trimmedPt = pt.trim();
    const trimmedEn = en.trim();
    const payload =
      !trimmedPt && !trimmedEn
        ? { description: null as null }
        : { description: { pt: trimmedPt, en: trimmedEn } };
    await patch(payload, payload.description ? "Descrição guardada" : "Override removido");
  }

  // Sends `description: null` directly — does NOT depend on React having
  // flushed `setPt("")` / `setEn("")` first. Previously this called
  // `save()` after a state update, which read stale state and re-posted
  // the OLD copy as a non-null override, so "Limpar" silently no-op'd.
  async function clear() {
    setPt("");
    setEn("");
    await patch({ description: null }, "Override removido");
  }

  const hasOverride = Boolean(initial?.pt || initial?.en);

  return (
    <div className="space-y-6">
      <div className="grid gap-5 lg:grid-cols-2">
        <Field
          label="Português"
          value={pt}
          onChange={setPt}
          placeholder={fallback?.pt ?? "—"}
        />
        <Field
          label="English"
          value={en}
          onChange={setEn}
          placeholder={fallback?.en ?? "—"}
        />
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-line pt-5">
        <p className="text-xs text-muted">
          {hasOverride
            ? "Esta colourway tem copy próprio. Esvazia os campos e guarda para voltar a herdar do produto."
            : "Sem override — a PDP mostra o copy do produto pai. Preenche e guarda para criar um override só para esta colourway."}
        </p>
        <div className="flex gap-2">
          {hasOverride && (
            <button
              type="button"
              onClick={clear}
              disabled={busy}
              className="border border-line bg-paper px-4 py-2.5 text-xs tracking-[0.2em] text-muted uppercase transition-colors hover:border-gold hover:text-ink disabled:opacity-50"
            >
              Limpar override
            </button>
          )}
          <button
            type="button"
            onClick={save}
            disabled={busy}
            className="bg-ink px-5 py-2.5 text-xs tracking-[0.2em] text-cream uppercase transition-colors hover:bg-gold hover:text-ink disabled:opacity-50"
          >
            {busy ? "A guardar…" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="overline mb-2 block text-[0.55rem] text-gold">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={10}
        className="w-full resize-y border border-line bg-paper px-3 py-2.5 text-sm leading-relaxed outline-none focus:border-gold"
      />
    </label>
  );
}
