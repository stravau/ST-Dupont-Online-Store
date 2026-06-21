"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";

// Edit the images[] array of a single ProductVariant. Two paths in:
//   • URL — paste any CDN / absolute URL, click Adicionar.
//   • Upload — drop / pick a file, POSTed as multipart/form-data;
//              server stores via Vercel Blob and returns the URL.
// Both append to the variant's images[]. Drag a row to reorder, click
// the × to remove. Every mutation persists via PUT
// /api/admin/variant/<sku>/images.
export function ImagesEditor({ sku, initialImages }: { sku: string; initialImages: string[] }) {
  const [images, setImages] = useState<string[]>(initialImages);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [, startTransition] = useTransition();

  async function persist(next: string[]) {
    setImages(next);
    setErr(null);
    try {
      const res = await fetch(`/api/admin/variant/${sku}/images`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: next }),
      });
      if (!res.ok) throw new Error(String(res.status));
    } catch (e) {
      setErr(`Falha ao guardar: ${(e as Error).message}`);
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
    setErr(null);
    try {
      const fd = new FormData();
      fd.append("file", f);
      const res = await fetch(`/api/admin/variant/${sku}/images?upload=1`, {
        method: "POST",
        body: fd,
      });
      const data = (await res.json()) as { ok: boolean; url?: string; error?: string };
      if (!res.ok || !data.ok || !data.url) throw new Error(data.error ?? `HTTP ${res.status}`);
      await persist([...images, data.url]);
    } catch (e) {
      setErr(`Upload falhou: ${(e as Error).message}`);
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
    <div className="space-y-5">
      {/* Add by URL */}
      <div className="border border-line bg-paper p-5">
        <p className="overline text-[0.55rem] text-muted">URL externo</p>
        <div className="mt-3 flex gap-2">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://…/foto.webp"
            className="flex-1 border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-gold"
          />
          <button
            type="button"
            onClick={addUrl}
            className="bg-ink px-4 py-2 text-xs tracking-[0.2em] text-cream uppercase hover:bg-gold hover:text-ink"
          >
            Adicionar
          </button>
        </div>
      </div>

      {/* Upload via Vercel Blob */}
      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files?.[0];
          if (f) uploadFile(f);
        }}
        className="flex h-28 cursor-pointer flex-col items-center justify-center border border-dashed border-line bg-paper text-center text-xs text-muted hover:border-gold hover:text-ink"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); }}
        />
        {busy ? "A carregar…" : "Arrasta uma imagem (ou clica)"}
      </label>

      {err && (
        <p className="border border-red-300 bg-red-50 px-4 py-2 text-xs text-red-800">{err}</p>
      )}

      {/* Current list */}
      {images.length === 0 ? (
        <p className="text-center text-sm text-muted">Sem imagens.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {images.map((src, i) => (
            <li key={`${src}-${i}`} className="relative border border-line bg-paper p-2">
              <div className="relative aspect-square w-full overflow-hidden bg-cream">
                <Image src={src} alt={`Imagem ${i + 1}`} fill sizes="200px" className="object-contain" />
              </div>
              <p className="mt-2 truncate font-mono text-[0.6rem] text-muted" title={src}>{src}</p>
              <div className="mt-2 flex justify-between gap-2">
                <div className="flex gap-1">
                  <button onClick={() => move(i, -1)} className="border border-line px-2 py-1 text-[0.6rem] hover:border-gold disabled:opacity-30" disabled={i === 0}>↑</button>
                  <button onClick={() => move(i, +1)} className="border border-line px-2 py-1 text-[0.6rem] hover:border-gold disabled:opacity-30" disabled={i === images.length - 1}>↓</button>
                </div>
                <button onClick={() => remove(i)} className="border border-line px-2 py-1 text-[0.6rem] text-red-700 hover:border-red-400">×</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
