import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { signOut } from "@/auth";
import { currentStaff } from "@/lib/admin-auth";
import { AdminHeader } from "@/components/admin/header";
import { ToastProvider } from "@/components/admin/toast";

// Font: Inter para o admin body (leitura densa de tabelas, KPIs, listas).
// O storefront continua com Cormorant + EB Garamond (via root layout);
// aqui aplicamos Inter APENAS ao wrapper do painel, portanto o /admin/login
// e a home pública ficam intactas. Headings do admin continuam a herdar
// --font-display-serif (Cormorant) via .font-serif.
const adminBody = Inter({
  variable: "--font-admin-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

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
  const staff = await currentStaff();
  const email = staff?.email ?? "";
  const role = staff?.role ?? undefined;

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
      <div className={`admin-scope flex min-h-screen flex-col bg-cream text-ink ${adminBody.variable}`}>
        <AdminHeader email={email} role={role} signOutAction={signOutAction} />
        {/* Sem a barra lateral sobram 288px de largura, por isso o limite sobe
            dos 7xl para 1600px — as tabelas de stock e os relatórios são o que
            mais agradece. */}
        <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-7 sm:px-7 sm:py-9">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}
