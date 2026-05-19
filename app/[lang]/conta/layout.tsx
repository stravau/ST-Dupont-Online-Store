import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { isLocale, getDictionary, type Locale } from "@/lib/i18n";

export default async function AccountLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const c = getDictionary(locale).client;

  const session = await auth();
  if (!session?.user?.email) redirect(`/${locale}/entrar`);

  async function doSignOut() {
    "use server";
    await signOut({ redirectTo: `/${locale}` });
  }

  const nav = [
    { href: `/${locale}/conta`, label: c.overview },
    { href: `/${locale}/conta/encomendas`, label: c.orders },
    { href: `/${locale}/conta/favoritos`, label: c.wishlist },
    { href: `/${locale}/conta/moradas`, label: c.addresses },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <header className="text-center">
        <p className="overline">{c.area}</p>
        <div className="gold-rule mx-auto mt-5" />
      </header>

      <div className="mt-12 grid gap-12 md:grid-cols-[220px_1fr]">
        <aside className="md:border-r md:border-line md:pr-8">
          <nav className="flex flex-wrap gap-3 md:flex-col md:gap-2">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="group flex items-center gap-3 border border-line bg-paper px-5 py-4 text-sm font-medium tracking-[0.14em] text-ink uppercase transition-colors duration-300 hover:border-gold hover:bg-ink hover:text-cream"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-gold transition-transform duration-300 group-hover:scale-150" />
                {n.label}
              </Link>
            ))}
            <form action={doSignOut} className="md:mt-6">
              <button
                type="submit"
                className="w-full text-xs tracking-[0.18em] text-muted uppercase transition-colors hover:text-ink"
              >
                {c.signOut}
              </button>
            </form>
          </nav>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
