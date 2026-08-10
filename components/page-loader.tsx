// Subtle route-level loading state (Next.js loading.tsx fallback). A single
// thin rule with a gold light sweeping across it — premium, quiet, "nothing
// too noticeable". Keeps the persistent layout (header/footer) in place while
// the page segment streams in.
// O texto só é lido por leitores de ecrã. Os loading.tsx do Next não recebem
// os params da rota, por isso o idioma vem por prop com PT por omissão — que
// é o idioma principal da loja.
export function PageLoader({ lang = "pt" }: { lang?: string }) {
  return (
    <div className="page-loader" role="status" aria-live="polite">
      <span className="page-loader__bar" aria-hidden />
      <span className="sr-only">{lang === "en" ? "Loading…" : "A carregar…"}</span>
    </div>
  );
}
