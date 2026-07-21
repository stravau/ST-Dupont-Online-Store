import Link from "next/link";

// Two-tab strip for /admin/variants — S.T. Dupont vs Outras Marcas (V.N. Gaia).
// The Outras Marcas tab is analytics-only: it reads from OtherBrandItem, which
// is populated from the ECI_VNG_Controlo Excel and never touches the website.
// Rendered between the page header and the search/filter form.
//
// Only ADMIN + LOJA_VNG see the "Outras marcas" tab — LOJA_LIS never has other
// brands to look at, so we hide it entirely for them.

export type StockTab = "stdupont" | "outras";

export function StockTabs({
  active,
  showOutras,
}: {
  active: StockTab;
  showOutras: boolean;
}) {
  const tabs: { key: StockTab; label: string; href: string }[] = [
    { key: "stdupont", label: "S.T. Dupont",              href: "/admin/variants" },
  ];
  if (showOutras) {
    tabs.push({ key: "outras", label: "Outras marcas · V.N. Gaia", href: "/admin/variants?tab=outras" });
  }

  return (
    <div role="tablist" className="flex border-b border-line">
      {tabs.map((t) => {
        const isActive = t.key === active;
        return (
          <Link
            key={t.key}
            href={t.href}
            role="tab"
            aria-selected={isActive}
            className={[
              "px-5 py-3 text-[0.72rem] tracking-[0.18em] uppercase transition-colors",
              isActive
                ? "border-b-2 border-gold text-ink -mb-px"
                : "text-muted hover:text-ink",
            ].join(" ")}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
