import Link from "next/link";
import { auth, signOut } from "@/auth";

// Admin shell — minimal layout: top bar with section nav + sign-out
// + content area. Middleware has already gated the route, so by the
// time we render `auth()` is non-null on every /admin/* path except
// /admin/login (which uses its own layout via not rendering this one's
// chrome conditionally).

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const email = session?.user?.email ?? "";

  // /admin/login is the only path that renders without a session; show
  // the form full-bleed instead of wrapping it in the admin chrome.
  if (!email) return <>{children}</>;

  return (
    <div className="min-h-screen bg-cream text-ink">
      <header className="border-b border-line bg-paper">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-3">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-serif text-lg tracking-wide">
              S.T. Dupont · Admin
            </Link>
            {email && (
              <nav className="hidden gap-5 text-xs tracking-[0.18em] text-muted uppercase sm:flex">
                <Link href="/admin/variants" className="transition-colors hover:text-gold">Artigos</Link>
                <Link href="/admin/uploads"  className="transition-colors hover:text-gold">Uploads</Link>
                <Link href="/admin/audit"    className="transition-colors hover:text-gold">Auditoria</Link>
              </nav>
            )}
          </div>
          {email && (
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/admin/login" });
              }}
              className="flex items-center gap-3"
            >
              <span className="text-xs text-muted">{email}</span>
              <button
                type="submit"
                className="border border-line px-3 py-1.5 text-[0.65rem] tracking-[0.18em] text-ink uppercase transition-colors hover:border-gold hover:text-gold"
              >
                Sair
              </button>
            </form>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
