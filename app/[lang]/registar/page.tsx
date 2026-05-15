import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { isLocale, getDictionary, type Locale } from "@/lib/i18n";
import { AuthField } from "@/components/auth-field";

export default async function RegisterPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { lang } = await params;
  const { error } = await searchParams;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const t = getDictionary(locale).auth;

  async function register(formData: FormData) {
    "use server";
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");
    if (!email || !email.includes("@") || password.length < 8) {
      redirect(`/${locale}/registar?error=invalid`);
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) redirect(`/${locale}/registar?error=exists`);
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: { email, name: name || null, passwordHash, role: "CUSTOMER" },
    });
    redirect(`/${locale}/entrar?registered=1`);
  }

  const errMsg =
    error === "exists" ? t.registerExists : error === "invalid" ? t.registerInvalid : null;

  return (
    <section className="mx-auto max-w-md px-6 py-24">
      <h1 className="text-center font-serif text-4xl text-ink">{t.register}</h1>
      <div className="gold-rule mx-auto my-7" />

      {errMsg && (
        <p className="mb-6 border border-line bg-paper px-4 py-3 text-center text-sm text-ink">
          {errMsg}
        </p>
      )}

      <form action={register} className="space-y-5">
        <AuthField label={t.name} name="name" type="text" autoComplete="name" />
        <AuthField label={t.email} name="email" type="email" required autoComplete="email" />
        <AuthField
          label={t.password}
          name="password"
          type="password"
          required
          autoComplete="new-password"
          hint={t.passwordHint}
        />
        <button
          type="submit"
          className="w-full bg-ink py-4 text-xs tracking-[0.22em] text-cream uppercase transition-colors duration-300 hover:bg-gold hover:text-ink"
        >
          {t.createAccount}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        {t.haveAccount}{" "}
        <Link href={`/${locale}/entrar`} className="text-gold hover:text-ink">
          {t.signIn}
        </Link>
      </p>
    </section>
  );
}
