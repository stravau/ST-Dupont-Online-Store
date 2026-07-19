"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { BoutiqueCode } from "@/lib/pos";

// ----- shared vocab (mirrors the Excel Reparações dropdowns) -----

// Exactly the "Estado" dropdown from the Excel Reparações sheet, same order.
export const REPAIR_STATUSES = [
  { value: "AGUARDANDO_CLIENTE", label: "Aguardando Cliente" },
  { value: "AGUARDANDO_STD", label: "Aguardando STD" },
  { value: "AGUARDANDO_JM", label: "Aguardando JM" },
  { value: "AGUARDANDO_PR", label: "Aguardando PR" },
  { value: "ART_EM_REPARACAO", label: "Art. em Reparação" },
  { value: "RESOLVIDO", label: "Resolvido" },
  { value: "POR_DAR_RESPOSTA", label: "Por dar Resposta !" },
  { value: "POR_VERIFICAR", label: "Por Verificar !!" },
] as const;

const STATUS_LABEL: Record<string, string> = Object.fromEntries(REPAIR_STATUSES.map((s) => [s.value, s.label]));
const STATUS_TONE: Record<string, string> = {
  AGUARDANDO_CLIENTE: "bg-[#d4a017]/12 text-[#8a6d0f]",
  AGUARDANDO_STD: "bg-[#3b6ea5]/12 text-[#2c5580]",
  AGUARDANDO_JM: "bg-[#7a5cc0]/12 text-[#5a3fa0]",
  AGUARDANDO_PR: "bg-[#2c8a8a]/12 text-[#1c6060]",
  ART_EM_REPARACAO: "bg-[#5c6cc0]/12 text-[#3f4fa0]",
  RESOLVIDO: "bg-[#2bb673]/14 text-[#1c8a54]",
  POR_DAR_RESPOSTA: "bg-[#c07a2c]/12 text-[#8a5518]",
  POR_VERIFICAR: "bg-[#b94a3a]/12 text-[#8a2f22]",
};

// Contact methods seen in the Excel "Último_Contato" column.
const CONTACT_VIAS = ["Em loja", "Whatsapp", "Chamada tlf.", "E-mail", "Whatsapp & E-mail", "SMS", "Por responder"];

const BOUTIQUE_LABEL: Record<BoutiqueCode, string> = { LIS: "Lisboa", VNG: "V. N. de Gaia" };

export interface RepairRow {
  id: string;
  boutique: BoutiqueCode;
  firstVisit: string; // YYYY-MM-DD (or "" if unknown)
  staff: string;
  status: string;
  customerName: string;
  reference: string;
  subject: string;
  updates: string | null;
  lastContactAt: string | null; // YYYY-MM-DD
  lastContactStaff: string | null;
  lastContactVia: string | null;
  lastContactNote: string | null;
  otherObs: string | null;
  phone: string | null;
  otherContacts: string | null;
}

type FormState = Omit<RepairRow, "id"> & { id: string | null };

const emptyForm = (boutique: BoutiqueCode, today: string): FormState => ({
  id: null,
  boutique,
  firstVisit: today,
  staff: "",
  status: "POR_VERIFICAR",
  customerName: "",
  reference: "",
  subject: "",
  updates: "",
  lastContactAt: "",
  lastContactStaff: "",
  lastContactVia: "",
  lastContactNote: "",
  otherObs: "",
  phone: "",
  otherContacts: "",
});

export function RepairsManager({
  repairs,
  staffOptions,
  boutiques,
  today,
}: {
  repairs: RepairRow[];
  staffOptions: string[];
  boutiques: BoutiqueCode[];
  today: string;
}) {
  const router = useRouter();
  const multi = boutiques.length > 1;
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(() => emptyForm(boutiques[0], today));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return repairs.filter((r) => {
      if (statusFilter && r.status !== statusFilter) return false;
      if (!q) return true;
      return [r.customerName, r.reference, r.subject, r.staff, r.phone, r.otherContacts]
        .filter(Boolean)
        .some((v) => (v as string).toLowerCase().includes(q));
    });
  }, [repairs, query, statusFilter]);

  function openNew() {
    setForm(emptyForm(boutiques[0], today));
    setError(null);
    setOpen(true);
  }
  function openEdit(r: RepairRow) {
    setForm({ ...r, updates: r.updates ?? "" });
    setError(null);
    setOpen(true);
  }
  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.customerName.trim() || !form.reference.trim() || !form.subject.trim()) {
      setError("Cliente, referência e assunto são obrigatórios.");
      return;
    }
    setSaving(true);
    setError(null);
    const isEdit = !!form.id;
    const payload = {
      id: form.id,
      boutique: form.boutique,
      firstVisit: form.firstVisit || undefined,
      staff: form.staff,
      status: form.status,
      customerName: form.customerName,
      reference: form.reference,
      subject: form.subject,
      updates: form.updates,
      lastContactAt: form.lastContactAt,
      lastContactStaff: form.lastContactStaff,
      lastContactVia: form.lastContactVia,
      lastContactNote: form.lastContactNote,
      otherObs: form.otherObs,
      phone: form.phone,
      otherContacts: form.otherContacts,
    };
    try {
      const res = await fetch("/api/admin/repairs", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setError(data.error || "Não foi possível guardar.");
        setSaving(false);
        return;
      }
      setOpen(false);
      setSaving(false);
      router.refresh();
    } catch {
      setError("Erro de rede. Tenta novamente.");
      setSaving(false);
    }
  }

  const fmtDate = (iso: string | null) =>
    iso ? new Date(iso + "T00:00:00").toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "2-digit" }) : "—";

  return (
    <div>
      {/* Toolbar */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Procurar cliente, referência, assunto…"
          className="min-w-[16rem] flex-1 border border-line bg-paper px-3 py-2.5 text-sm outline-none focus:border-gold"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-line bg-paper px-3 py-2.5 text-sm outline-none focus:border-gold"
        >
          <option value="">Todos os estados</option>
          {REPAIR_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={openNew}
          className="shrink-0 bg-ink px-5 py-2.5 text-[0.72rem] tracking-[0.18em] text-cream uppercase transition-colors hover:bg-gold"
        >
          + Registar reparação
        </button>
      </div>

      <p className="mt-3 text-[0.7rem] text-muted">
        {filtered.length} {filtered.length === 1 ? "processo" : "processos"}
        {statusFilter || query ? ` (de ${repairs.length})` : ""}
      </p>

      {/* Table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[68rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left text-[0.56rem] tracking-[0.1em] text-muted uppercase">
              <th className="py-2 pr-3">1ª Visita</th>
              <th className="py-2 px-2">Operador</th>
              <th className="py-2 px-2">Estado</th>
              {multi && <th className="py-2 px-2">Loja</th>}
              <th className="py-2 px-2">Cliente</th>
              <th className="py-2 px-2">Ref.</th>
              <th className="py-2 px-2">Assunto</th>
              <th className="py-2 px-2">Últ. contacto</th>
              <th className="py-2 px-2">Contacto</th>
              <th className="py-2 pl-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={multi ? 10 : 9} className="py-10 text-center text-sm text-muted">
                  Nenhum processo encontrado.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="border-b border-line/60 align-top">
                  <td className="py-3 pr-3 tabular-nums whitespace-nowrap text-muted">{fmtDate(r.firstVisit || null)}</td>
                  <td className="py-3 px-2 font-medium text-ink whitespace-nowrap">{r.staff || "—"}</td>
                  <td className="py-3 px-2 whitespace-nowrap">
                    <span className={`inline-block rounded-sm px-2 py-0.5 text-[0.6rem] font-semibold tracking-wide uppercase ${STATUS_TONE[r.status] ?? "bg-line/40 text-muted"}`}>
                      {STATUS_LABEL[r.status] ?? r.status}
                    </span>
                  </td>
                  {multi && <td className="py-3 px-2 text-[0.72rem] text-muted whitespace-nowrap">{BOUTIQUE_LABEL[r.boutique]}</td>}
                  <td className="py-3 px-2 font-medium text-ink">{r.customerName}</td>
                  <td className="py-3 px-2 text-muted">{r.reference}</td>
                  <td className="py-3 px-2 max-w-[22rem] text-[0.82rem] text-ink/90">
                    <span className="line-clamp-2">{r.subject}</span>
                    {r.updates && <span className="mt-1 block text-[0.72rem] text-muted line-clamp-2">↳ {r.updates}</span>}
                  </td>
                  <td className="py-3 px-2 text-[0.75rem] text-muted whitespace-nowrap">
                    {fmtDate(r.lastContactAt)}
                    {r.lastContactVia && <span className="block">{r.lastContactVia}</span>}
                  </td>
                  <td className="py-3 px-2 text-[0.75rem] text-muted">
                    {r.phone && <span className="block tabular-nums whitespace-nowrap">{r.phone}</span>}
                    {r.otherContacts && <span className="block break-all">{r.otherContacts}</span>}
                    {r.otherObs && <span className="mt-0.5 block text-[0.68rem] text-[#b94a3a]">{r.otherObs}</span>}
                  </td>
                  <td className="py-3 pl-2 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => openEdit(r)}
                      className="text-[0.62rem] tracking-[0.14em] text-muted uppercase transition-colors hover:text-gold"
                    >
                      Atualizar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/40 px-4 py-8" onClick={() => !saving && setOpen(false)}>
          <div
            className="w-full max-w-3xl border border-line bg-paper shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <h2 className="font-serif text-lg text-ink">{form.id ? "Atualizar reparação" : "Registar reparação"}</h2>
              <button type="button" onClick={() => !saving && setOpen(false)} className="text-2xl leading-none text-muted hover:text-ink" aria-label="Fechar">×</button>
            </div>

            <form onSubmit={submit} className="max-h-[70vh] overflow-y-auto px-6 py-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="1ª Visita (data)">
                  <input type="date" value={form.firstVisit} onChange={(e) => set("firstVisit", e.target.value)} className={inputCls} />
                </Field>
                <Field label="Operador">
                  <input list="repair-staff" value={form.staff} onChange={(e) => set("staff", e.target.value.toUpperCase())} placeholder="PR" className={inputCls} />
                  <datalist id="repair-staff">{staffOptions.map((s) => <option key={s} value={s} />)}</datalist>
                </Field>
                {multi && (
                  <Field label="Loja">
                    <select value={form.boutique} onChange={(e) => set("boutique", e.target.value as BoutiqueCode)} className={inputCls}>
                      {boutiques.map((b) => <option key={b} value={b}>{BOUTIQUE_LABEL[b]}</option>)}
                    </select>
                  </Field>
                )}
                <Field label="Estado">
                  <select value={form.status} onChange={(e) => set("status", e.target.value)} className={inputCls}>
                    {REPAIR_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </Field>
                <Field label="Cliente *">
                  <input value={form.customerName} onChange={(e) => set("customerName", e.target.value)} className={inputCls} />
                </Field>
                <Field label="Referência / artigo *">
                  <input value={form.reference} onChange={(e) => set("reference", e.target.value)} placeholder="Isqueiro L2 antigo" className={inputCls} />
                </Field>
                <Field label="Assunto *" full>
                  <textarea value={form.subject} onChange={(e) => set("subject", e.target.value)} rows={2} className={inputCls} />
                </Field>
                <Field label="Atualizações / notas do processo" full>
                  <textarea value={form.updates ?? ""} onChange={(e) => set("updates", e.target.value)} rows={2} className={inputCls} />
                </Field>

                <div className="sm:col-span-2 mt-1 border-t border-line pt-4">
                  <p className="overline text-[0.58rem] text-gold">Último contacto</p>
                </div>
                <Field label="Data">
                  <input type="date" value={form.lastContactAt ?? ""} onChange={(e) => set("lastContactAt", e.target.value)} className={inputCls} />
                </Field>
                <Field label="Operador do contacto">
                  <input list="repair-staff" value={form.lastContactStaff ?? ""} onChange={(e) => set("lastContactStaff", e.target.value.toUpperCase())} className={inputCls} />
                </Field>
                <Field label="Via">
                  <input list="repair-via" value={form.lastContactVia ?? ""} onChange={(e) => set("lastContactVia", e.target.value)} className={inputCls} />
                  <datalist id="repair-via">{CONTACT_VIAS.map((v) => <option key={v} value={v} />)}</datalist>
                </Field>
                <Field label="Observação do contacto">
                  <input value={form.lastContactNote ?? ""} onChange={(e) => set("lastContactNote", e.target.value)} className={inputCls} />
                </Field>

                <div className="sm:col-span-2 mt-1 border-t border-line pt-4">
                  <p className="overline text-[0.58rem] text-gold">Contactos</p>
                </div>
                <Field label="Tlm / WhatsApp">
                  <input value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} className={inputCls} />
                </Field>
                <Field label="Outros contactos (e-mail / tlf)">
                  <input value={form.otherContacts ?? ""} onChange={(e) => set("otherContacts", e.target.value)} className={inputCls} />
                </Field>
                <Field label="Outras obs. de contacto (ex.: não ligar)" full>
                  <input value={form.otherObs ?? ""} onChange={(e) => set("otherObs", e.target.value)} className={inputCls} />
                </Field>
              </div>

              {error && <p className="mt-4 text-sm text-[#b94a3a]">{error}</p>}

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-line pt-4">
                <button type="button" onClick={() => !saving && setOpen(false)} className="px-4 py-2.5 text-[0.7rem] tracking-[0.16em] text-muted uppercase hover:text-ink">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="bg-ink px-6 py-2.5 text-[0.72rem] tracking-[0.18em] text-cream uppercase transition-colors hover:bg-gold disabled:opacity-50">
                  {saving ? "A guardar…" : form.id ? "Guardar alterações" : "Registar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls = "w-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-gold";

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1 block text-[0.62rem] tracking-[0.1em] text-muted uppercase">{label}</span>
      {children}
    </label>
  );
}
