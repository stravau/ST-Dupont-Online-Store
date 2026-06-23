import { auth, signOut } from "@/auth";
import { AdminSidebar, AdminMobileBar } from "@/components/admin/sidebar";
import { ToastProvider } from "@/components/admin/toast";

// Admin shell — sidebar on desktop, sticky chip-row on mobile, content
// area with comfortable max-width. /admin/login renders without the
// chrome (no session yet) — the children-only branch handles it.

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const email = session?.user?.email ?? "";
  const role = (session?.user as { role?: string } | undefined)?.role;

  // Defence-in-depth: proxy.ts already rejects non-ADMIN sessions before
  // they reach this layout, but if that gate is ever removed by mistake
  // we don't want a CUSTOMER session rendering admin chrome. Only show
  // the shell when we have BOTH an email AND the ADMIN role; otherwise
  // pass through to the child (which for /admin/login is the form, for
  // anything else is unreachable past proxy.ts).
  if (!email || role !== "ADMIN") return <>{children}</>;

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/admin/login" });
  }

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-cream text-ink">
        <AdminSidebar email={email} signOutAction={signOutAction} />
        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <AdminMobileBar email={email} signOutAction={signOutAction} />
          <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-8 sm:px-8 sm:py-10">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
