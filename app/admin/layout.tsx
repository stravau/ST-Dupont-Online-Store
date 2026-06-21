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

  if (!email) return <>{children}</>;

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
