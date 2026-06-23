import { signIn } from "@/auth";
import { redirect } from "next/navigation";
import { formatLockoutRemaining, lockoutExpiresAt, recordAttempt } from "@/lib/login-lockout";

export const dynamic = "force-dynamic";

// Same-origin admin path? Rejects protocol-relative URLs (//evil.com),
// absolute URLs (https://evil.com), and any path outside /admin. Used to
// sanitize the `callbackUrl` query string echoed back through the form.
function isSafeAdminTarget(target: string): boolean {
  if (!target.startsWith("/")) return false;
  if (target.startsWith("//")) return false;        // protocol-relative
  if (target.startsWith("/\\")) return false;       // backslash-trick
  return target === "/admin" || target.startsWith("/admin/") || target.startsWith("/admin?");
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string; minutes?: string }>;
}) {
  const { error, callbackUrl, minutes } = await searchParams;

  async function action(formData: FormData) {
    "use server";
    const email    = String(formData.get("email") ?? "").toLowerCase().trim();
    const password = String(formData.get("password") ?? "");
    // `callbackUrl` comes from the form (echoed from the request query string)
    // — never trust it. Only accept same-origin admin paths so a crafted
    // ?callbackUrl=//evil.example can't turn a successful login into an
    // off-site redirect.
    const rawTarget = String(formData.get("callbackUrl") ?? "/admin");
    const target = isSafeAdminTarget(rawTarget) ? rawTarget : "/admin";

    // Lockout pre-check — refuse the attempt outright and surface a
    // dedicated error so the operator knows it's not a typo, it's the
    // brute-force shield. We still record the attempt (failure) so the
    // window keeps sliding while someone is hammering on us.
    if (email) {
      const locked = await lockoutExpiresAt(email);
      if (locked) {
        await recordAttempt(email, false);
        const mins = formatLockoutRemaining(locked);
        redirect(`/admin/login?error=locked&minutes=${encodeURIComponent(mins)}&callbackUrl=${encodeURIComponent(target)}`);
      }
    }

    try {
      await signIn("credentials", { email, password, redirectTo: target });
    } catch (e) {
      if ((e as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) throw e;
      // Re-check lockout AFTER the attempt so a failed login that
      // crossed the threshold this turn ends with the lockout-specific
      // error rather than the generic one.
      const lockedNow = email ? await lockoutExpiresAt(email) : null;
      if (lockedNow) {
        const mins = formatLockoutRemaining(lockedNow);
        redirect(`/admin/login?error=locked&minutes=${encodeURIComponent(mins)}&callbackUrl=${encodeURIComponent(target)}`);
      }
      redirect(`/admin/login?error=invalid&callbackUrl=${encodeURIComponent(target)}`);
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 bg-cream lg:grid-cols-2">
      {/* Brand pane — mirrors the public-site monogram-bg / cream palette
          so the admin landing feels of-a-piece with the storefront. */}
      <aside className="monogram-bg relative hidden flex-col justify-between p-12 text-cream lg:flex">
        <div>
          <p className="overline text-gold-soft">Admin</p>
          <p className="mt-2 font-serif text-3xl">S.T. Dupont</p>
          <p className="mt-1 text-[0.65rem] tracking-[0.18em] text-cream/70 uppercase">
            El Corte Inglés · Lisboa
          </p>
        </div>
        <div className="space-y-3 text-sm text-cream/80">
          <div className="gold-rule" />
          <p className="font-serif text-xl leading-relaxed">
            “A arte francesa do luxo — desde o gesto mais íntimo ao detalhe mais raro.”
          </p>
          <p className="text-[0.65rem] tracking-[0.18em] text-cream/60 uppercase">
            Painel restrito · acesso autenticado
          </p>
        </div>
      </aside>

      <main className="flex items-center justify-center px-6 py-16">
        <form action={action} className="w-full max-w-sm border border-line bg-paper p-8">
          <p className="overline text-[0.55rem] text-gold">Admin</p>
          <h1 className="mt-2 font-serif text-2xl text-ink">Entrar no painel</h1>
          <p className="mt-2 text-xs text-muted">Sessão restrita à equipa da boutique.</p>

          {error === "invalid" && (
            <p className="mt-5 border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700">
              Credenciais inválidas.
            </p>
          )}
          {error === "locked" && (
            <p className="mt-5 border border-[#d4a017]/50 bg-[#d4a017]/10 px-3 py-2 text-xs text-[#6a4f00]">
              Demasiadas tentativas. Volta a tentar dentro de {minutes ?? "alguns minutos"}.
            </p>
          )}

          <input
            type="hidden"
            name="callbackUrl"
            value={callbackUrl && isSafeAdminTarget(callbackUrl) ? callbackUrl : "/admin"}
          />

          <label className="mt-6 block">
            <span className="overline mb-1.5 block text-[0.55rem] text-muted">Email</span>
            <input
              name="email"
              type="email"
              required
              autoComplete="username"
              className="w-full border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-gold"
            />
          </label>

          <label className="mt-4 block">
            <span className="overline mb-1.5 block text-[0.55rem] text-muted">Password</span>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-gold"
            />
          </label>

          <button
            type="submit"
            className="mt-7 block w-full bg-ink py-3.5 text-center text-xs tracking-[0.22em] text-cream uppercase transition-colors hover:bg-gold hover:text-ink"
          >
            Entrar
          </button>

          <p className="mt-6 text-center text-[0.55rem] tracking-[0.18em] text-muted uppercase">
            S.T. Dupont · 1872
          </p>
        </form>
      </main>
    </div>
  );
}
