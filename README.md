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

## Deploy to Vercel

Vercel is serverless — it **cannot** reach the local dev Postgres, so a cloud
database is required.

1. **Create a free cloud Postgres** at [neon.tech](https://neon.tech) → new
   project → copy the **direct** connection string (ends with
   `?sslmode=require`).
2. **Import the repo on Vercel** (vercel.com → Add New → Project → pick
   `ST-Dupont-Online-Store`). Framework auto-detected as Next.js.
3. **Set Environment Variables** (Production + Preview):
   - `DATABASE_URL` = the Neon connection string
   - `AUTH_SECRET` = a long random string (`npx auth secret` or `openssl rand -base64 32`)
   - `AUTH_URL` = your Vercel URL, e.g. `https://your-app.vercel.app`
4. **Deploy.** The build (`next build`, `postinstall: prisma generate`) does
   **not** touch the database, so it stays green even before the DB is set up.
5. **Create the tables + seed the catalogue once**, from your machine, pointed
   at the cloud DB:
   ```powershell
   $env:DATABASE_URL="<your Neon URL>"; $env:NODE_OPTIONS="--use-system-ca"
   npm.cmd run db:migrate   # creates all tables on Neon
   npm.cmd run db:seed      # loads the 51 products
   ```
   The site is then live and shareable. (`DATABASE_URL` must also be set in
   Vercel env for the running app.)

`NODE_OPTIONS=--use-system-ca` is **only** needed on this local machine (TLS
inspection) — do not set it on Vercel.

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
