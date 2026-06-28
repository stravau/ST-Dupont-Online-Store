// Create / promote an admin or boutique user. Idempotent — re-running
// for the same email replaces the password and the role.
//
//   $env:DATABASE_URL = "<neon url>"
//   npx tsx scripts/admin-bootstrap.ts <email> <password> [ADMIN|LOJA_LIS|LOJA_VNG]
//   Remove-Item Env:DATABASE_URL
//
// Role defaults to ADMIN when omitted.

import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const ROLES = new Set(["ADMIN", "LOJA_LIS", "LOJA_VNG"] as const);
type Role = typeof ROLES extends Set<infer T> ? T : never;

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Aborting.");
  process.exit(1);
}

const [, , emailArg, passwordArg, roleArg] = process.argv;
if (!emailArg || !passwordArg) {
  console.error("Usage: npx tsx scripts/admin-bootstrap.ts <email> <password> [ADMIN|LOJA_LIS|LOJA_VNG]");
  process.exit(1);
}

const role = (roleArg ?? "ADMIN").toUpperCase() as Role;
if (!ROLES.has(role)) {
  console.error(`Invalid role "${roleArg}". Must be one of: ADMIN, LOJA_LIS, LOJA_VNG.`);
  process.exit(1);
}

const email = emailArg.toLowerCase().trim();
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const displayName =
  role === "ADMIN"    ? "Admin" :
  role === "LOJA_LIS" ? "Loja Lisboa" :
                         "Loja V.N. Gaia";

(async () => {
  const passwordHash = await bcrypt.hash(passwordArg, 12);
  const user = await prisma.user.upsert({
    where: { email },
    create: { email, passwordHash, role, name: displayName },
    update: { passwordHash, role, name: displayName },
    select: { id: true, email: true, role: true, name: true },
  });
  console.log(`${user.role} ready: ${user.email} · ${user.name} (id ${user.id})`);
  await prisma.$disconnect();
})().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
