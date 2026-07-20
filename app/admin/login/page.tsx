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
    <div className="grid min-h-dvh grid-cols-1 bg-cream lg:grid-cols-[1.1fr_1fr]">
      {/* Brand pane — full-height showcase on large screens, mirrors the
          storefront monogram-bg / cream palette so the admin feels of-a-piece.
          Type scales fluidly with the viewport (clamp) so it never looks tiny
          on a big monitor nor cramped on a laptop. */}
      <aside className="monogram-bg relative hidden flex-col justify-between overflow-hidden p-10 text-cream lg:flex xl:p-16">
        <div>
          <p className="overline text-gold-soft">Admin</p>
          <p className="mt-3 font-serif leading-none text-[clamp(2.5rem,3.4vw,4rem)]">S.T. Dupont</p>
          <p className="mt-3 text-[0.75rem] tracking-[0.22em] text-cream/70 uppercase">
            El Corte Inglés · Lisboa &amp; V. N. Gaia
          </p>
        </div>
        <div className="space-y-5">
          <div className="gold-rule" />
          <p className="max-w-xl font-serif leading-relaxed text-cream/90 text-[clamp(1.5rem,2vw,2.25rem)]">
            “A arte francesa do luxo — desde o gesto mais íntimo ao detalhe mais raro.”
          </p>
          <p className="text-[0.7rem] tracking-[0.22em] text-cream/60 uppercase">
            Painel restrito · acesso autenticado
          </p>
        </div>
      </aside>

      {/* Form pane — always vertically centred, fluid padding + type so it
          reads well from small phones to ultra-wide displays. */}
      <main className="flex min-h-dvh items-center justify-center px-5 py-10 sm:px-8 sm:py-14">
        <div className="w-full max-w-md">
          {/* Compact brand — shown only when the showcase pane is hidden
              (below lg) so the form is never bare on phones/tablets. */}
          <div className="mb-10 text-center lg:hidden">
            <p className="overline text-gold">Admin</p>
            <p className="mt-2 font-serif leading-none text-ink text-[clamp(2rem,9vw,2.75rem)]">S.T. Dupont</p>
            <p className="mt-2 text-[0.7rem] tracking-[0.22em] text-muted uppercase">El Corte Inglés</p>
          </div>

          <form action={action} className="w-full border border-line bg-paper p-7 shadow-lg sm:p-10">
            <p className="overline text-gold">Entrar</p>
            <h1 className="mt-3 font-serif leading-tight text-ink text-[clamp(1.75rem,4vw,2.5rem)]">
              Painel de gestão
            </h1>
            <p className="mt-3 text-sm text-muted sm:text-[0.95rem]">
              Sessão restrita à equipa da boutique.
            </p>

            {error === "invalid" && (
              <p className="mt-6 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                Credenciais inválidas.
              </p>
            )}
            {error === "locked" && (
              <p className="mt-6 border border-[#d4a017]/50 bg-[#d4a017]/10 px-4 py-3 text-sm text-[#6a4f00]">
                Demasiadas tentativas. Volta a tentar dentro de {minutes ?? "alguns minutos"}.
              </p>
            )}

            <input
              type="hidden"
              name="callbackUrl"
              value={callbackUrl && isSafeAdminTarget(callbackUrl) ? callbackUrl : "/admin"}
            />

            <label className="mt-8 block">
              <span className="overline mb-2 block text-[0.62rem] text-muted">Email</span>
              <input
                name="email"
                type="email"
                required
                autoComplete="username"
                className="w-full border border-line bg-paper px-4 py-3.5 text-base text-ink outline-none transition-colors focus:border-gold"
              />
            </label>

            <label className="mt-5 block">
              <span className="overline mb-2 block text-[0.62rem] text-muted">Password</span>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full border border-line bg-paper px-4 py-3.5 text-base text-ink outline-none transition-colors focus:border-gold"
              />
            </label>

            <button
              type="submit"
              className="mt-9 block w-full bg-ink py-4 text-center text-xs tracking-[0.24em] text-cream uppercase transition-colors hover:bg-gold hover:text-ink"
            >
              Entrar
            </button>

            <p className="mt-8 text-center text-[0.6rem] tracking-[0.22em] text-muted uppercase">
              S.T. Dupont · 1872
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
