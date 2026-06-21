"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useToast } from "@/components/admin/toast";
import { IconUpload } from "@/components/admin/icons";

export function ImagesEditor({ sku, initialImages }: { sku: string; initialImages: string[] }) {
  const toast = useToast();
  const [images, setImages] = useState<string[]>(initialImages);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [, startTransition] = useTransition();

  async function persist(next: string[]) {
    setImages(next);
    try {
      const res = await fetch(`/api/admin/variant/${sku}/images`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: next }),
      });
      if (!res.ok) throw new Error(String(res.status));
      toast.push("success", "Imagens guardadas");
    } catch (e) {
      toast.push("error", `Falha ao guardar: ${(e as Error).message}`);
    }
  }

  function addUrl() {
    const trimmed = url.trim();
    if (!trimmed) return;
    startTransition(() => persist([...images, trimmed]));
    setUrl("");
  }

  async function uploadFile(f: File) {
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", f);
      const res = await fetch(`/api/admin/variant/${sku}/images?upload=1`, { method: "POST", body: fd });
      const data = (await res.json()) as { ok: boolean; url?: string; error?: string };
      if (!res.ok || !data.ok || !data.url) throw new Error(data.error ?? `HTTP ${res.status}`);
      await persist([...images, data.url]);
    } catch (e) {
      toast.push("error", `Upload falhou: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= images.length) return;
    const next = [...images];
    [next[i], next[j]] = [next[j], next[i]];
    startTransition(() => persist(next));
  }
  function remove(i: number) {
    startTransition(() => persist(images.filter((_, idx) => idx !== i)));
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="border border-line bg-paper p-5">
          <p className="overline text-[0.55rem] text-gold">Adicionar por URL</p>
          <p className="mt-1 text-xs text-muted">URL absoluto (https://…) — pode ser qualquer CDN.</p>
          <div className="mt-4 flex gap-2">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addUrl(); } }}
              placeholder="https://…/foto.webp"
              className="flex-1 border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-gold"
            />
            <button
              type="button"
              onClick={addUrl}
              className="bg-ink px-4 py-2 text-xs tracking-[0.2em] text-cream uppercase transition-colors hover:bg-gold hover:text-ink"
            >
              Adicionar
            </button>
          </div>
        </div>

        <label
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) uploadFile(f); }}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 border border-dashed bg-paper text-center transition-colors ${
            busy ? "border-gold/60 bg-gold/5" : "border-line text-muted hover:border-gold hover:text-ink"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); }}
          />
          <div className="flex flex-col items-center gap-2 px-6 py-8">
            {busy ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden />
                <span className="text-[0.65rem] tracking-[0.18em] uppercase">A carregar…</span>
              </>
            ) : (
              <>
                <IconUpload className="h-5 w-5" />
                <span className="text-[0.65rem] tracking-[0.18em] uppercase">Arrasta ou clica para upload</span>
                <span className="text-[0.6rem] text-muted">Vercel Blob</span>
              </>
            )}
          </div>
        </label>
      </div>

      {images.length === 0 ? (
        <div className="border border-dashed border-line bg-paper py-16 text-center text-sm text-muted">
          Sem imagens — adiciona um URL ou faz upload acima.
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {images.map((src, i) => (
            <li key={`${src}-${i}`} className="group relative border border-line bg-paper p-3 transition-colors hover:border-gold">
              <div className="relative aspect-square w-full overflow-hidden bg-cream">
                <Image src={src} alt={`Imagem ${i + 1}`} fill sizes="240px" className="object-contain" />
                {i === 0 && (
                  <span className="absolute left-2 top-2 bg-gold px-2 py-0.5 text-[0.55rem] tracking-[0.16em] text-ink uppercase">Hero</span>
                )}
              </div>
              <p className="mt-2 truncate font-mono text-[0.6rem] text-muted" title={src}>{src}</p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="flex gap-1">
                  <button
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    aria-label="Mover para cima"
                    className="border border-line px-2 py-1 text-[0.65rem] transition-colors hover:border-gold disabled:opacity-30"
                  >↑</button>
                  <button
                    onClick={() => move(i, +1)}
                    disabled={i === images.length - 1}
                    aria-label="Mover para baixo"
                    className="border border-line px-2 py-1 text-[0.65rem] transition-colors hover:border-gold disabled:opacity-30"
                  >↓</button>
                </div>
                <button
                  onClick={() => remove(i)}
                  aria-label="Remover"
                  className="border border-line px-2 py-1 text-[0.65rem] text-[#b94a3a] transition-colors hover:border-[#b94a3a]"
                >×</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
