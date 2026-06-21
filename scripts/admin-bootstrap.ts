// Promote / create the first ADMIN user. Idempotent — re-running with
// the same email just updates the password.
//
// Run with:
//   $env:DATABASE_URL = "<neon url>"
//   npx tsx scripts/admin-bootstrap.ts <email> <password>
//   Remove-Item Env:DATABASE_URL

import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Aborting.");
  process.exit(1);
}

const [, , emailArg, passwordArg] = process.argv;
if (!emailArg || !passwordArg) {
  console.error("Usage: npx tsx scripts/admin-bootstrap.ts <email> <password>");
  process.exit(1);
}

const email = emailArg.toLowerCase().trim();
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

(async () => {
  const passwordHash = await bcrypt.hash(passwordArg, 12);
  const user = await prisma.user.upsert({
    where: { email },
    create: { email, passwordHash, role: "ADMIN", name: "Admin" },
    update: { passwordHash, role: "ADMIN" },
    select: { id: true, email: true, role: true },
  });
  console.log(`ADMIN ready: ${user.email} (id ${user.id}, role ${user.role})`);
  await prisma.$disconnect();
})().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
