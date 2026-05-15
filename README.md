# S.T. Dupont — Online Store

E-commerce storefront + admin for the S.T. Dupont brand.

**Stack:** Next.js (App Router) · TypeScript · Tailwind · Prisma · PostgreSQL · Auth.js · Stripe (hosted Checkout + Stripe Tax).

> Payments use Stripe **test** keys until launch (Phase 6). Card data never touches this app or DB — it goes only to Stripe.

## This machine — required workarounds

TLS-inspecting software on this machine breaks default cert validation, and PowerShell blocks npm's `.ps1` shim. So:

- Use **`npm.cmd` / `npx.cmd`**, not bare `npm` / `npx`.
- Set **`NODE_OPTIONS=--use-system-ca`** before npm/node commands (trusts the Windows cert store).
- New shells need PATH refreshed:
  `$env:Path = [Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [Environment]::GetEnvironmentVariable("Path","User")`

## Setup

```powershell
$env:NODE_OPTIONS = "--use-system-ca"
npm.cmd install
Copy-Item .env.example .env   # then fill in values
npx.cmd prisma generate
npx.cmd prisma migrate dev --name init   # requires a reachable DATABASE_URL
npm.cmd run dev
```

You need a PostgreSQL database before `migrate` works — either a free [Neon](https://neon.tech) project or local Postgres. Put its URL in `DATABASE_URL` in `.env`.

## Data model

`Product` (concept) → `ProductVariant` (sellable SKU: finish/colour, price, stock, images, Stripe price id). `OrderItem` snapshots the variant at purchase time so historical orders stay accurate. See [prisma/schema.prisma](prisma/schema.prisma).

## Roadmap

- **Phase 0 ✅** — scaffold, schema, env (done)
- Phase 1 — branded catalog (read-only)
- Phase 2 — accounts & roles (Auth.js)
- Phase 3 — admin dashboard (product CRUD, image upload, orders)
- Phase 4 — cart & Stripe Checkout + Stripe Tax + webhooks
- Phase 5 — order confirmation emails, order history, fulfilment
- Phase 6 — hardening, legal pages, production deploy, live Stripe keys
