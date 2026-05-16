import { notFound, redirect } from "next/navigation";
import { isLocale, getDictionary, type Locale } from "@/lib/i18n";
import { currentUserId } from "@/lib/cart";
import { prisma } from "@/lib/prisma";
import { addAddress, deleteAddress } from "@/lib/actions";
import { AuthField } from "@/components/auth-field";

export default async function AddressesPage({
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
  const c = getDictionary(locale).client;

  const userId = await currentUserId();
  if (!userId) redirect(`/${locale}/entrar`);

  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <h1 className="font-serif text-4xl text-ink">{c.addresses}</h1>

      {addresses.length === 0 ? (
        <p className="mt-10 text-muted">{c.noAddresses}</p>
      ) : (
        <ul className="mt-10 space-y-4">
          {addresses.map((a) => (
            <li
              key={a.id}
              className="flex items-start justify-between gap-6 border border-line bg-paper p-6"
            >
              <div className="text-sm">
                <p className="font-serif text-lg text-ink">
                  {a.fullName}
                  {a.isDefault && (
                    <span className="overline ml-3 text-[0.6rem] text-gold">
                      {c.defaultAddress}
                    </span>
                  )}
                </p>
                <p className="mt-2 text-muted">
                  {a.line1}
                  {a.line2 ? `, ${a.line2}` : ""}
                </p>
                <p className="text-muted">
                  {a.postalCode} {a.city} · {a.country}
                </p>
                {a.phone && <p className="text-muted">{a.phone}</p>}
              </div>
              <form action={deleteAddress.bind(null, locale)}>
                <input type="hidden" name="id" value={a.id} />
                <button
                  type="submit"
                  className="text-xs tracking-widest text-muted uppercase hover:text-ink"
                >
                  {c.delete}
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <h2 className="overline mt-14">{c.addAddress}</h2>
      <div className="gold-rule mt-5" />
      {error && (
        <p className="mt-6 border border-line bg-paper px-4 py-3 text-sm text-ink">
          {getDictionary(locale).auth.registerInvalid}
        </p>
      )}

      <form action={addAddress.bind(null, locale)} className="mt-6 grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <AuthField label={c.addrName} name="fullName" type="text" required autoComplete="name" />
        </div>
        <div className="sm:col-span-2">
          <AuthField label={c.addrLine1} name="line1" type="text" required />
        </div>
        <div className="sm:col-span-2">
          <AuthField label={c.addrLine2} name="line2" type="text" />
        </div>
        <AuthField label={c.addrCity} name="city" type="text" required />
        <AuthField label={c.addrPostal} name="postalCode" type="text" required />
        <AuthField label={c.addrCountry} name="country" type="text" required />
        <AuthField label={c.addrPhone} name="phone" type="tel" autoComplete="tel" />
        <div className="sm:col-span-2">
          <button
            type="submit"
            className="w-full bg-ink py-4 text-xs tracking-[0.22em] text-cream uppercase transition-colors duration-300 hover:bg-gold hover:text-ink"
          >
            {c.save}
          </button>
        </div>
      </form>
    </div>
  );
}
