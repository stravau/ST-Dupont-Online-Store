"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconDashboard,
  IconList,
  IconUpload,
  IconAudit,
  IconPos,
  IconReports,
  IconCalendar,
  IconRepair,
  IconSignOut,
} from "@/components/admin/icons";

interface NavItem {
  href: string;
  label: string;
  hint: string; // uma linha a dizer o que a secção tem
  Icon: (p: { className?: string }) => React.ReactElement;
}

// Secções filtradas por papel. O patrão (ADMIN) vê tudo; os logins de loja
// (LOJA_LIS / LOJA_VNG) recebem só o que serve a quem está ao balcão —
// registar uma venda, ver relatórios, consultar catálogo e stock. Painel,
// importações e auditoria ficam do lado do patrão.
function sectionsFor(role?: string): { title: string; items: NavItem[] }[] {
  const isAdmin = role === "ADMIN";
  const sections: { title: string; items: NavItem[] }[] = [];

  if (isAdmin) {
    sections.push({
      title: "Geral",
      items: [{ href: "/admin", label: "Painel", hint: "Visão geral do negócio", Icon: IconDashboard }],
    });
  }

  sections.push({
    title: "Catálogo",
    items: [
      { href: "/admin/variants", label: "Stock", hint: "Preços, stock e estado", Icon: IconList },
      { href: "/admin/uploads", label: "Importar", hint: "Sincronizar Excel ECI Controlo", Icon: IconUpload },
      ...(isAdmin
        ? [{ href: "/admin/nao-mapeados", label: "Sem ficha", hint: "Stock que não aparece no site", Icon: IconList }]
        : []),
    ],
  });

  sections.push({
    title: "Loja",
    items: [
      { href: "/admin/pos", label: "Vender", hint: "Registar venda por código de barras", Icon: IconPos },
      { href: "/admin/movimentos", label: "Movimentos", hint: "Entradas e saídas por scan", Icon: IconPos },
      { href: "/admin/relatorios", label: "Relatórios", hint: "Vendas, comissão e mais vendidos", Icon: IconReports },
      { href: "/admin/relatorio-vendas", label: "Vendas do Dia", hint: "Escolher um dia e exportar Excel", Icon: IconCalendar },
      { href: "/admin/reparacoes", label: "Reparações", hint: "Assistência e pós-venda", Icon: IconRepair },
    ],
  });

  if (isAdmin) {
    sections.push({
      title: "Site",
      items: [{ href: "/admin/destaques", label: "Em Destaque", hint: "Carrossel da homepage", Icon: IconList }],
    });
    sections.push({
      title: "Sistema",
      items: [{ href: "/admin/audit", label: "Auditoria", hint: "Registo de todas as alterações", Icon: IconAudit }],
    });
  }

  return sections;
}

// A boutique por baixo do wordmark, conforme o login. O patrão vê as duas
// concessões; cada loja vê só a sua.
function locationFor(role?: string): string {
  if (role === "LOJA_VNG") return "El Corte Inglés · Vila Nova de Gaia";
  if (role === "ADMIN") return "El Corte Inglés · Lisboa e Vila Nova de Gaia";
  return "El Corte Inglés · Lisboa";
}

/**
 * Cabeçalho do painel — duas faixas sobre branco.
 *
 * A de cima identifica (marca, boutique, sessão). A de baixo navega, com as
 * áreas separadas e visíveis em vez de escondidas atrás de menus: no balcão
 * conta menos cliques, e ver tudo de uma vez vale mais do que poupar espaço.
 *
 * Os botões são pastilhas claras com contorno, e a activa inverte para tinta
 * cheia — o contraste diz onde se está sem precisar de cor de sublinhado.
 */
export function AdminHeader({
  email,
  role,
  signOutAction,
}: {
  email: string;
  role?: string;
  signOutAction: () => Promise<void>;
}) {
  // O cabecalho mede-se e publica a propria altura em --admin-header-h. Tudo
  // o que dentro do painel tambem e sticky encosta-se a essa variavel. Medido
  // em vez de escrito a mao porque o html esta a 19px e o body tem zoom 0.9 —
  // qualquer constante ficaria errada a primeira mudanca de tipo ou de padding.
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const publica = () =>
      document.documentElement.style.setProperty("--admin-header-h", `${el.offsetHeight}px`);
    publica();
    const ro = new ResizeObserver(publica);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
  const sections = sectionsFor(role);
  const home = role === "ADMIN" ? "/admin" : "/admin/pos";

  return (
    <header ref={ref} className="sticky top-0 z-40 border-b border-line bg-paper">
      {/* Faixa de identidade */}
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-7">
        <Link href={home} className="group flex min-w-0 items-baseline gap-3">
          <span className="font-serif text-xl leading-none text-ink">S.T. Dupont</span>
          <span className="hidden truncate text-[0.63rem] tracking-[0.16em] text-muted uppercase sm:block">
            {locationFor(role)}
          </span>
        </Link>

        <form action={signOutAction} className="flex shrink-0 items-center gap-3">
          <span
            className="hidden max-w-[14rem] truncate text-[0.7rem] text-muted md:block"
            title={email}
          >
            {email}
          </span>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-4 py-2 text-[0.7rem] font-medium tracking-[0.12em] text-ink uppercase transition-colors hover:border-gold hover:text-gold"
          >
            <IconSignOut className="h-4 w-4" /> Sair
          </button>
        </form>
      </div>

      {/* Faixa de navegação. QUEBRA de linha quando não cabe — nunca rola.
          Com onze destinos nao ha ecra que os ponha todos numa linha sem os
          encolher ate a ilegibilidade, e uma barra que se arrasta esconde
          metade das areas de quem nao sabe que ela se arrasta. A altura do
          cabecalho varia com isso, e por isso e que ela e medida em vez de
          fixada. */}
      <div className="border-t border-line/70 bg-cream/40">
        <nav className="mx-auto flex w-full max-w-[1600px] flex-wrap items-start gap-x-4 gap-y-3 px-4 py-3 sm:gap-x-6 sm:px-7">
          {sections.map((sec, i) => (
            <div key={sec.title} className="flex shrink-0 items-start gap-4 sm:gap-6">
              {i > 0 && <span aria-hidden className="mt-5 hidden h-8 w-px shrink-0 bg-line sm:block" />}
              <div className="shrink-0">
                <p className="mb-1.5 px-1 text-[0.56rem] font-semibold tracking-[0.16em] text-muted uppercase">
                  {sec.title}
                </p>
                <ul className="flex flex-wrap items-center gap-1.5">
                  {sec.items.map((it) => {
                    const active = isActive(it.href);
                    return (
                      <li key={it.href}>
                        <Link
                          href={it.href}
                          aria-current={active ? "page" : undefined}
                          title={it.hint}
                          className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-full px-3.5 py-2 text-[0.78rem] font-medium whitespace-nowrap transition-colors ${
                            active
                              ? "bg-ink text-cream shadow-sm"
                              : "border border-line bg-paper text-ink hover:border-gold hover:text-gold"
                          }`}
                        >
                          <it.Icon className="h-4 w-4 shrink-0" />
                          {it.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          ))}
        </nav>
      </div>
    </header>
  );
}
