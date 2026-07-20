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
    // Full-bleed navy monogram background covering the whole page; the white
    // form card floats over it. Brand pinned top-left, maxim pinned
    // bottom-left (single line). overflow-hidden guarantees no horizontal
    // scrollbar from the nowrap maxim on any width.
    <div className="monogram-bg relative flex min-h-[calc(100dvh/0.9)] items-center justify-center overflow-hidden px-5 py-10 text-cream sm:px-8 lg:justify-end lg:px-0 lg:pr-[7vw] xl:pr-[9vw]">
      {/* Brand — top-left */}
      <div className="absolute left-0 top-0 z-10 p-8 sm:p-12 xl:p-16">
        <p className="overline text-gold-soft">Admin</p>
        <p className="mt-3 font-serif font-semibold leading-none text-[clamp(2.25rem,3.4vw,4rem)]">
          S.T. Dupont
        </p>
        <p className="mt-3 text-[0.72rem] tracking-[0.22em] text-cream/70 uppercase sm:text-[0.78rem]">
          El Corte Inglés · Lisboa &amp; V. N. Gaia
        </p>
      </div>

      {/* Maxim — pinned bottom-left, always one line (hidden on very small
          phones where a single line can't fit gracefully). */}
      <div className="absolute bottom-0 left-0 z-10 hidden p-8 sm:block sm:p-12 xl:p-16">
        <div className="gold-rule mb-4" />
        <p className="font-serif font-medium leading-none whitespace-nowrap text-cream/90 text-[clamp(0.85rem,1.5vw,1.55rem)]">
          “A arte francesa do luxo — desde o gesto mais íntimo ao detalhe mais raro.”
        </p>
        <p className="mt-3 text-[0.7rem] tracking-[0.22em] text-cream/55 uppercase">
          Painel restrito · acesso autenticado
        </p>
      </div>

      {/* Form card — vertically centred; sits to the right on desktop so it
          never collides with the brand/maxim, centred on phones/tablets. */}
      <form action={action} className="relative z-20 w-full max-w-md border border-line bg-paper p-7 shadow-2xl sm:p-10">
          <p className="overline text-gold">Entrar</p>
          <h1 className="mt-3 font-serif font-semibold leading-tight text-ink text-[clamp(1.75rem,4vw,2.5rem)]">
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
  );
}
