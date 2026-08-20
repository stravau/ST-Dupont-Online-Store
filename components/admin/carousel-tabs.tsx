import Link from "next/link";

// Duas abas numa página só, como o Consultar Stock: os dois carrosséis da
// homepage editam-se no mesmo sítio em vez de estarem em páginas separadas.
//
//   Em Destaque  — a faixa escura a meio da homepage. Artigos E fotografia
//                  de fundo, porque é uma montra montada de raiz.
//   Novidades    — o carril logo acima. Só artigos: a secção não tem fundo
//                  próprio, vive dentro da campanha da estação.

export type CarouselTab = "destaques" | "novidades";

export function CarouselTabs({ active }: { active: CarouselTab }) {
  const tabs: { key: CarouselTab; label: string; href: string }[] = [
    { key: "destaques", label: "Em Destaque", href: "/admin/destaques" },
    { key: "novidades", label: "Novidades", href: "/admin/destaques?tab=novidades" },
  ];

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
