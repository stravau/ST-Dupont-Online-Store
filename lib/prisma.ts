// Prisma client singleton — avoids exhausting DB connections during
// Next.js dev hot-reload. Import `prisma` from here everywhere.
//
// Prisma 7's `prisma-client` generator ships no query engine; it talks to
// Postgres through the pg driver adapter.
//
// Serverless + Neon hardening (fixes the "products missing until reload
// after the tab's been idle a while" bug):
//   - Neon suspends compute after a few minutes idle. When it does, the
//     pg Pool can hold a TCP socket that Neon has closed server-side.
//     The first query after idle then hits a dead socket and fails.
//   - Active browsing keeps Neon warm, which is why the bug only shows
//     up on the first navigation after a pause.
// Two mitigations below: a serverless-tuned pool (keepAlive + connection
// recycling so dead sockets get dropped) and a read-query retry layer
// that rides out the ~1-3s Neon cold-start window instead of surfacing
// an error / empty grid.
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrisma> | undefined;
};

// Read operations are always safe to retry — they don't mutate state, so
// re-running one after a dropped connection can't double-apply anything.
// Writes are deliberately NOT retried here so transaction atomicity and
// write idempotency stay intact (a write that fails mid-flight is the
// caller's problem to surface, not ours to silently repeat).
const READ_OPERATIONS = new Set([
  "findUnique",
  "findUniqueOrThrow",
  "findFirst",
  "findFirstOrThrow",
  "findMany",
  "count",
  "aggregate",
  "groupBy",
]);

// Connection-level failures that mean "the socket was dead / Neon was
// still waking" rather than "your query is wrong". Only these get a
// retry — a constraint violation or bad-SQL error rethrows immediately.
function isTransientConnectionError(e: unknown): boolean {
  const msg = (e instanceof Error ? e.message : String(e)).toLowerCase();
  const code = (e as { code?: string })?.code ?? "";
  return (
    msg.includes("connection terminated") ||
    msg.includes("connection closed") ||
    msg.includes("connection reset") ||
    msg.includes("econnreset") ||
    msg.includes("econnrefused") ||
    msg.includes("socket hang up") ||
    msg.includes("server closed the connection") ||
    msg.includes("terminating connection") ||
    msg.includes("the database server") ||      // Prisma P1001 phrasing
    msg.includes("cannot connect now") ||
    msg.includes("starting up") ||              // 57P03 — Neon waking
    // Postgres / Prisma connection error codes
    ["57P01", "57P03", "08000", "08003", "08006", "08001", "08004", "P1001", "P1017"].includes(code)
  );
}

const RETRY_DELAYS_MS = [300, 800, 1600, 2500]; // ~5.2s total worst case

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function createPrisma() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    // --- serverless pool tuning ---
    // Small pool — each serverless instance only needs a handful.
    max: 5,
    // Detect/keep sockets alive at the TCP layer so a frozen-then-thawed
    // serverless instance is more likely to notice a dead connection.
    keepAlive: true,
    // Give Neon room to wake on a cold connect before giving up.
    connectionTimeoutMillis: 10_000,
    // Close idle sockets before Neon's own idle timeout would, so we hand
    // out fewer stale connections after a quiet period.
    idleTimeoutMillis: 10_000,
    // Recycle a connection after N uses — caps the lifetime of any single
    // socket so a long-lived stale one can't linger.
    maxUses: 500,
    // Let the pool drain fully when the instance goes idle.
    allowExitOnIdle: true,
  });

  const base = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  // Retry layer — only read operations, only transient connection errors.
  return base.$extends({
    name: "retry-transient-reads",
    query: {
      async $allOperations({ operation, args, query }) {
        if (!READ_OPERATIONS.has(operation)) {
          return query(args); // writes pass straight through, no retry
        }
        let lastError: unknown;
        for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
          try {
            return await query(args);
          } catch (e) {
            lastError = e;
            if (!isTransientConnectionError(e) || attempt === RETRY_DELAYS_MS.length) {
              throw e;
            }
            await sleep(RETRY_DELAYS_MS[attempt]);
          }
        }
        throw lastError;
      },
    },
  });
}

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
