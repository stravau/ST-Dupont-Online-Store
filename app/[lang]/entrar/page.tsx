import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { isLocale, getDictionary, type Locale } from "@/lib/i18n";
import { AuthField } from "@/components/auth-field";

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ error?: string; registered?: string }>;
}) {
  const { lang } = await params;
  const { error, registered } = await searchParams;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const t = getDictionary(locale).auth;

  async function login(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");
    try {
      await signIn("credentials", {
        email,
        password,
        redirectTo: `/${locale}/conta`,
      });
    } catch (e) {
      // AuthError = bad credentials; anything else (incl. the success
      // NEXT_REDIRECT) must propagate.
      if (e instanceof AuthError) redirect(`/${locale}/entrar?error=1`);
      throw e;
    }
  }

  return (
    <section className="mx-auto max-w-md px-6 py-24">
      <h1 className="text-center font-serif text-4xl text-ink">{t.signIn}</h1>
      <div className="gold-rule mx-auto my-7" />

      {registered && (
        <p className="mb-6 border border-gold/40 bg-paper px-4 py-3 text-center text-sm text-ink">
          {t.registered}
        </p>
      )}
      {error && (
        <p className="mb-6 border border-line bg-paper px-4 py-3 text-center text-sm text-ink">
          {t.loginError}
        </p>
      )}

      <form action={login} className="space-y-5">
        <AuthField label={t.email} name="email" type="email" required autoComplete="email" />
        <AuthField
          label={t.password}
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
        <button
          type="submit"
          className="w-full bg-ink py-4 text-xs tracking-[0.22em] text-cream uppercase transition-colors duration-300 hover:bg-gold hover:text-ink"
        >
          {t.signIn}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        {t.noAccount}{" "}
        <Link href={`/${locale}/registar`} className="text-gold hover:text-ink">
          {t.register}
        </Link>
      </p>
    </section>
  );
}
