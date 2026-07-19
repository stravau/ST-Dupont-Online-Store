"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconDashboard,
  IconList,
  IconUpload,
  IconAudit,
  IconPos,
  IconReports,
  IconSignOut,
} from "@/components/admin/icons";

interface NavItem {
  href: string;
  label: string;
  hint: string; // one-line description of what the tab holds
  Icon: (p: { className?: string }) => React.ReactElement;
}

// Sidebar sections, filtered by role. The boss (ADMIN) sees everything; the
// store logins (LOJA_LIS / LOJA_VNG) get only what a salesperson needs on the
// floor — register a sale, see reports, and the catalogue/stock. Dashboard,
// bulk imports and the audit log are boss-only.
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
      { href: "/admin/variants", label: "Consultar Stock", hint: "Preços, stock e estado", Icon: IconList },
      ...(isAdmin
        ? [{ href: "/admin/uploads", label: "Importar Ficheiros", hint: "Excel de PVP, stock e promoções", Icon: IconUpload }]
        : []),
    ],
  });

  sections.push({
    title: "Loja",
    items: [
      { href: "/admin/pos", label: "Registar Venda", hint: "Vender por código de barras", Icon: IconPos },
      { href: "/admin/relatorios", label: "Relatórios", hint: "Vendas, comissão e mais vendidos", Icon: IconReports },
    ],
  });

  if (isAdmin) {
    sections.push({
      title: "Sistema",
      items: [{ href: "/admin/audit", label: "Auditoria", hint: "Registo de todas as alterações", Icon: IconAudit }],
    });
  }

  return sections;
}

export function AdminSidebar({
  email,
  role,
  signOutAction,
}: {
  email: string;
  role?: string;
  signOutAction: () => Promise<void>;
}) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));
  const sections = sectionsFor(role);

  // Day picker for the sales-report export. Set on the client (avoids an
  // SSR/local-time hydration mismatch); an empty date still exports today,
  // since the endpoint defaults to now.
  const [reportDate, setReportDate] = useState("");
  useEffect(() => {
    const d = new Date();
    setReportDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
  }, []);

  return (
    <aside className="hidden w-72 shrink-0 flex-col border-r border-line bg-paper md:flex">
      <div className="border-b border-line px-6 py-6">
        <Link href={role === "ADMIN" ? "/admin" : "/admin/pos"} className="block">
          <p className="overline text-[0.55rem] text-gold">Gestão</p>
          <p className="mt-1 font-serif text-lg text-ink">S.T. Dupont</p>
          <p className="mt-1 text-[0.62rem] tracking-[0.16em] text-muted uppercase">El Corte Inglés · Lisboa</p>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3.5 py-6">
        {sections.map((sec) => (
          <div key={sec.title} className="mb-6">
            <p className="overline px-3 text-[0.6rem] text-muted">{sec.title}</p>
            <ul className="mt-2.5 space-y-1">
              {sec.items.map((it) => {
                const active = isActive(it.href);
                return (
                  <li key={it.href}>
                    <Link
                      href={it.href}
                      aria-current={active ? "page" : undefined}
                      title={it.hint}
                      className={`flex items-center gap-3.5 rounded-md px-3 py-3 transition-colors ${
                        active ? "bg-ink text-cream" : "text-ink hover:bg-cream/70 hover:text-gold"
                      }`}
                    >
                      <it.Icon className="h-6 w-6 shrink-0" />
                      <span className="min-w-0">
                        <span className="block text-[0.95rem] font-medium leading-tight tracking-wide">{it.label}</span>
                        <span className={`block truncate text-[0.68rem] leading-tight ${active ? "text-cream/70" : "text-muted"}`}>
                          {it.hint}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        {/* Sales report — pick a day and export it as Excel. */}
        <div className="mt-2 border-t border-line px-3 pt-5">
          <p className="overline text-[0.6rem] text-muted">Relatório de Vendas</p>
          <input
            type="date"
            value={reportDate}
            onChange={(e) => setReportDate(e.target.value)}
            aria-label="Dia do relatório"
            className="mt-2.5 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-gold"
          />
          <a
            href={`/api/admin/reports/export?date=${reportDate}`}
            download
            className="mt-2.5 inline-flex w-full items-center justify-center gap-2 rounded-md border border-line bg-paper px-3 py-2.5 text-[0.68rem] tracking-[0.16em] text-ink uppercase transition-colors hover:border-gold hover:text-gold"
          >
            Exportar Excel ↓
          </a>
        </div>
      </nav>

      <form action={signOutAction} className="border-t border-line px-6 py-5">
        <p className="overline text-[0.55rem] text-muted">Sessão</p>
        <p className="mt-1 truncate text-sm text-ink" title={email}>{email}</p>
        <button
          type="submit"
          className="mt-3 inline-flex w-full items-center justify-center gap-2 border border-line bg-paper px-3 py-2.5 text-[0.7rem] tracking-[0.2em] text-ink uppercase transition-colors hover:border-gold hover:text-gold"
        >
          <IconSignOut className="h-4 w-4" /> Sair
        </button>
      </form>
    </aside>
  );
}

// Mobile bar — sticks at the top, exposes sign-out + nav links in a
// horizontally-scrolling chip row. Desktop hides this entirely. Same
// role-filtered items as the sidebar.
export function AdminMobileBar({
  email,
  role,
  signOutAction,
}: {
  email: string;
  role?: string;
  signOutAction: () => Promise<void>;
}) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));
  const flat = sectionsFor(role).flatMap((s) => s.items);

  return (
    <div className="sticky top-0 z-30 border-b border-line bg-paper md:hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <Link href={role === "ADMIN" ? "/admin" : "/admin/pos"} className="font-serif text-lg">Gestão</Link>
        <div className="flex items-center gap-3">
          <span className="max-w-[10rem] truncate text-[0.62rem] tracking-[0.16em] text-muted uppercase" title={email}>
            {email}
          </span>
          <form action={signOutAction}>
            <button
              type="submit"
              aria-label="Sair da conta"
              className="rounded-sm border border-line px-2.5 py-1.5 text-[0.62rem] tracking-[0.18em] text-ink uppercase transition-colors hover:border-gold hover:text-gold"
            >
              Sair
            </button>
          </form>
        </div>
      </div>
      <nav className="flex gap-1.5 overflow-x-auto px-3 pb-3">
        {flat.map((it) => {
          const active = isActive(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-[42px] shrink-0 items-center gap-2 rounded-md px-3.5 py-2 text-[0.72rem] tracking-[0.12em] uppercase ${
                active ? "bg-ink text-cream" : "text-ink hover:text-gold"
              }`}
            >
              <it.Icon className="h-5 w-5 shrink-0" />
              {it.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
