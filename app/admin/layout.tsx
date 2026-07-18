import type { Metadata } from "next";
import { auth, signOut } from "@/auth";
import { AdminSidebar, AdminMobileBar } from "@/components/admin/sidebar";
import { ToastProvider } from "@/components/admin/toast";

// Admin shell — sidebar on desktop, sticky chip-row on mobile, content
// area with comfortable max-width. /admin/login renders without the
// chrome (no session yet) — the children-only branch handles it.

export const dynamic = "force-dynamic";

// Keep the whole panel out of search engines. (It's already behind the
// proxy.ts auth gate; this stops the URL surfacing in results at all.)
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const email = session?.user?.email ?? "";
  const role = (session?.user as { role?: string } | undefined)?.role;

  // Defence-in-depth: proxy.ts already rejects sessions that aren't
  // ADMIN / LOJA_LIS / LOJA_VNG, but if that gate is ever removed by
  // mistake we don't want a CUSTOMER session rendering admin chrome.
  // The three permitted roles all need the chrome (sidebar + Toast
  // provider). Anything else passes through to the child (for
  // /admin/login that's the form; everything else is unreachable past
  // proxy.ts).
  const isStaff = role === "ADMIN" || role === "LOJA_LIS" || role === "LOJA_VNG";
  if (!email || !isStaff) return <>{children}</>;

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
