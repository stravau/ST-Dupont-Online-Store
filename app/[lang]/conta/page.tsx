import { notFound, redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isLocale, getDictionary, type Locale } from "@/lib/i18n";

export default async function AccountPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const t = getDictionary(locale).auth;

  const session = await auth();
  if (!session?.user?.email) redirect(`/${locale}/entrar`);

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { name: true, email: true, role: true, createdAt: true },
  });
  if (!user) redirect(`/${locale}/entrar`);

  async function doSignOut() {
    "use server";
    await signOut({ redirectTo: `/${locale}` });
  }

  const since = new Intl.DateTimeFormat(locale === "pt" ? "pt-PT" : "en-IE", {
    year: "numeric",
    month: "long",
  }).format(user.createdAt);

  return (
    <section className="mx-auto max-w-2xl px-6 py-24">
      <p className="overline text-center">{t.welcome}</p>
      <h1 className="mt-4 text-center font-serif text-4xl text-ink">
        {user.name || user.email}
      </h1>
      <div className="gold-rule mx-auto my-8" />

      <dl className="divide-y divide-line border-y border-line text-sm">
        <Row label={t.name} value={user.name || "—"} />
        <Row label={t.email} value={user.email} />
        <Row label={t.role} value={user.role === "ADMIN" ? "Admin" : "Cliente"} />
        <Row label={t.memberSince} value={since} />
      </dl>

      <form action={doSignOut} className="mt-10">
        <button
          type="submit"
          className="w-full border border-ink py-4 text-xs tracking-[0.22em] text-ink uppercase transition-colors duration-300 hover:bg-ink hover:text-cream"
        >
          {t.signOut}
        </button>
      </form>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-4">
      <dt className="overline">{label}</dt>
      <dd className="text-ink">{value}</dd>
    </div>
  );
}
