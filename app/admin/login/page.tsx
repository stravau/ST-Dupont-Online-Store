import { signIn } from "@/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const { error, callbackUrl } = await searchParams;

  async function action(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const target = String(formData.get("callbackUrl") ?? "/admin");
    try {
      await signIn("credentials", {
        email,
        password,
        redirectTo: target,
      });
    } catch (e) {
      // NEXT_REDIRECT is the success signal from signIn — bubble it up
      // unchanged so the user actually navigates.
      if ((e as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) throw e;
      redirect(`/admin/login?error=invalid&callbackUrl=${encodeURIComponent(target)}`);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-cream px-6">
      <form action={action} className="w-full max-w-sm border border-line bg-paper p-8">
        <p className="overline text-gold">Admin</p>
        <h1 className="mt-3 font-serif text-2xl text-ink">Entrar</h1>

        {error === "invalid" && (
          <p className="mt-5 border border-red-400 bg-red-50 px-3 py-2 text-xs text-red-700">
            Credenciais inválidas.
          </p>
        )}

        <input type="hidden" name="callbackUrl" value={callbackUrl ?? "/admin"} />

        <label className="mt-6 block">
          <span className="overline mb-2 block text-[0.55rem] text-muted">Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="username"
            className="w-full border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-gold"
          />
        </label>

        <label className="mt-4 block">
          <span className="overline mb-2 block text-[0.55rem] text-muted">Password</span>
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

        <p className="mt-5 text-center text-[0.6rem] tracking-[0.16em] text-muted uppercase">
          Acesso restrito · S.T. Dupont
        </p>
      </form>
    </div>
  );
}
