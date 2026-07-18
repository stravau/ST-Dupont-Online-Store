"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconDashboard, IconList, IconUpload, IconAudit, IconPos, IconReports, IconSignOut } from "@/components/admin/icons";

interface NavItem {
  href: string;
  label: string;
  Icon: (p: { className?: string }) => React.ReactElement;
}

const SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: "Geral",
    items: [{ href: "/admin", label: "Dashboard", Icon: IconDashboard }],
  },
  {
    title: "Loja",
    items: [
      { href: "/admin/pos", label: "Ponto de Venda", Icon: IconPos },
      { href: "/admin/relatorios", label: "Relatórios", Icon: IconReports },
    ],
  },
  {
    title: "Catálogo",
    items: [
      { href: "/admin/variants", label: "Artigos",  Icon: IconList },
      { href: "/admin/uploads",  label: "Uploads",  Icon: IconUpload },
    ],
  },
  {
    title: "Sistema",
    items: [{ href: "/admin/audit", label: "Auditoria", Icon: IconAudit }],
  },
];

export function AdminSidebar({
  email,
  signOutAction,
}: {
  email: string;
  signOutAction: () => Promise<void>;
}) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-paper md:flex">
      <div className="border-b border-line px-6 py-5">
        <Link href="/admin" className="block">
          <p className="overline text-[0.5rem] text-gold">Admin</p>
          <p className="mt-1 font-serif text-base text-ink">S.T. Dupont</p>
          <p className="mt-1 text-[0.6rem] tracking-[0.16em] text-muted uppercase">El Corte Inglés · Lisboa</p>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {SECTIONS.map((sec) => (
          <div key={sec.title} className="mb-5">
            <p className="overline px-3 text-[0.5rem] text-muted">{sec.title}</p>
            <ul className="mt-2 space-y-0.5">
              {sec.items.map((it) => {
                const active = isActive(it.href);
                return (
                  <li key={it.href}>
                    <Link
                      href={it.href}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-3 rounded-sm px-3 py-2 text-sm transition-colors ${
                        active
                          ? "bg-ink text-cream"
                          : "text-ink hover:bg-cream/60 hover:text-gold"
                      }`}
                    >
                      <it.Icon className="h-4 w-4 shrink-0" />
                      <span className="tracking-wide">{it.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <form action={signOutAction} className="border-t border-line px-6 py-4">
        <p className="overline text-[0.5rem] text-muted">Sessão</p>
        <p className="mt-1 truncate text-xs text-ink">{email}</p>
        <button
          type="submit"
          className="mt-3 inline-flex w-full items-center justify-center gap-2 border border-line bg-paper px-3 py-2 text-[0.65rem] tracking-[0.2em] text-ink uppercase transition-colors hover:border-gold hover:text-gold"
        >
          <IconSignOut className="h-3.5 w-3.5" /> Sair
        </button>
      </form>
    </aside>
  );
}

// Mobile bar — sticks at the top, exposes sign-out + nav links in a
// horizontally-scrolling chip row. Desktop hides this entirely.
export function AdminMobileBar({ email, signOutAction }: { email: string; signOutAction: () => Promise<void> }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));
  const flat = SECTIONS.flatMap((s) => s.items);

  return (
    <div className="sticky top-0 z-30 border-b border-line bg-paper md:hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <Link href="/admin" className="font-serif text-base">Admin</Link>
        <div className="flex items-center gap-3">
          <span className="truncate text-[0.6rem] tracking-[0.16em] text-muted uppercase max-w-[10rem]" title={email}>
            {email}
          </span>
          <form action={signOutAction}>
            <button
              type="submit"
              aria-label="Sair da conta"
              className="rounded-sm border border-line px-2.5 py-1 text-[0.6rem] tracking-[0.18em] text-ink uppercase transition-colors hover:border-gold hover:text-gold"
            >
              Sair
            </button>
          </form>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3">
        {flat.map((it) => {
          const active = isActive(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              aria-current={active ? "page" : undefined}
              className={`shrink-0 rounded-sm px-3 py-2 text-[0.65rem] tracking-[0.18em] uppercase min-h-[36px] flex items-center ${
                active ? "bg-ink text-cream" : "text-ink hover:text-gold"
              }`}
            >
              {it.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
