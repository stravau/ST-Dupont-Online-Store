import type React from "react";

// Faixa do topo das páginas admin com dados live (painel, relatórios, POS).
//
// ATENÇÃO à cor: esta faixa JÁ NÃO tem fundo navy — desde o redesign assenta
// no marfim da página e os cartões lá dentro são brancos. Tudo o que se
// escreve aqui usa os tokens da superfície clara (--ink, --muted, --gold).
// text-cream aqui é texto invisível: no painel --cream É o fundo.
//
// Usa a utility .admin-hero declarada em globals.css. Padding vem daqui
// (não da utility) para permitir compact/normal/wide per contexto.
//
// Slots:
//   • eyebrow: overline pequena em gold (opcional)
//   • title: heading serif grande
//   • subtitle: legenda em muted (opcional)
//   • action: bloco à direita — normalmente um MonthPicker, um DateRangePicker,
//             ou um botão de acção (Novo, Exportar, etc.)
//   • children: KPIs, boutique split, ticker, etc. — layoutados livremente
//               pelo consumidor por baixo do título.
export function AdminHero({
  eyebrow,
  title,
  subtitle,
  action,
  children,
  compact = false,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  children?: React.ReactNode;
  compact?: boolean;
}) {
  // O layout tem `px-5 py-8 sm:px-8 sm:py-10` em <main>. Negamos essas
  // margens para o hero preencher edge-to-edge da coluna de conteúdo, e
  // re-aplicamos o padding INTERNO para que o conteúdo do hero respire
  // corretamente contra o navy-deep.
  return (
    <section
      className={[
        "admin-hero",
        "-mx-5 -mt-8 px-5",
        "sm:-mx-8 sm:-mt-10 sm:px-8",
        // A margem de baixo acompanha o compact. Antes era mb-8 fixo, e nas
        // paginas compactas somava-se ao mt do primeiro bloco a seguir —
        // eram tres folgas empilhadas a fazer um vazio de mais de 100px.
        compact ? "mb-5 pt-6 pb-5 sm:pt-8 sm:pb-6" : "mb-8 pt-8 pb-7 sm:pt-10 sm:pb-8",
      ].join(" ")}
    >
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          {eyebrow && (
            <p className="overline text-[0.55rem] tracking-[0.22em] text-gold">
              {eyebrow}
            </p>
          )}
          <h1 className="mt-2 font-serif text-3xl leading-tight text-ink md:text-4xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 max-w-2xl text-sm text-muted">{subtitle}</p>
          )}
        </div>
        {action && (
          <div className="flex shrink-0 items-center gap-3">{action}</div>
        )}
      </header>
      {children && <div className="mt-6">{children}</div>}
    </section>
  );
}
