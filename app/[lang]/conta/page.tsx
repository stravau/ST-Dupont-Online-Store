import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isLocale, getDictionary, type Locale } from "@/lib/i18n";

export default async function AccountOverview({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const dict = getDictionary(locale);
  const t = dict.auth;
  const c = dict.client;

  const session = await auth();
  if (!session?.user?.email) redirect(`/${locale}/entrar`);

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { orders: true, wishlist: true, addresses: true } },
    },
  });
  if (!user) redirect(`/${locale}/entrar`);

  const since = new Intl.DateTimeFormat(locale === "pt" ? "pt-PT" : "en-IE", {
    year: "numeric",
    month: "long",
  }).format(user.createdAt);

  const stats = [
    { label: c.orders, value: user._count.orders, href: `/${locale}/conta/encomendas` },
    { label: c.wishlist, value: user._count.wishlist, href: `/${locale}/conta/favoritos` },
  ];

  return (
    <div>
      <p className="overline">{c.greeting}</p>
      <h1 className="mt-3 font-serif text-4xl text-ink">{user.name || user.email}</h1>

      <div className="mt-10 grid grid-cols-2 gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="lux-hover border border-line bg-paper p-6 text-center"
          >
            <p className="font-serif text-4xl text-ink">{s.value}</p>
            <p className="overline mt-2 text-[0.6rem]">{s.label}</p>
          </Link>
        ))}
      </div>

      <h2 className="overline mt-14">{c.profile}</h2>
      <dl className="mt-5 divide-y divide-line border-y border-line text-sm">
        <Row label={t.name} value={user.name || "—"} />
        <Row label={t.email} value={user.email} />
        <Row label={t.role} value={user.role === "ADMIN" ? "Admin" : "Cliente"} />
        <Row label={t.memberSince} value={since} />
      </dl>
    </div>
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
