// Subtle route-level loading state (Next.js loading.tsx fallback). A single
// thin rule with a gold light sweeping across it — premium, quiet, "nothing
// too noticeable". Keeps the persistent layout (header/footer) in place while
// the page segment streams in.
export function PageLoader() {
  return (
    <div className="page-loader" role="status" aria-live="polite">
      <span className="page-loader__bar" aria-hidden />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
