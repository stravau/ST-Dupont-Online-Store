// Seeds the Lisboa salespeople from the ECI control Excel "Operadores" sheet.
// Idempotent (upsert on boutique+initials). Run once after the pos_foundation
// migration:  npx tsx scripts/seed-operators.ts
import { prisma } from "../lib/prisma";

// initials | ECI employee code | monthly goal (euros, from the sheet)
const LIS_OPERATORS: { initials: string; eciCode: string; goalEur: number | null }[] = [
  { initials: "PR", eciCode: "10198323", goalEur: 10000 },
  { initials: "MA", eciCode: "55104152", goalEur: null },
  { initials: "CD", eciCode: "10871135", goalEur: null },
  { initials: "LR", eciCode: "55103618", goalEur: 6591 },
  { initials: "AC", eciCode: "55103568", goalEur: null },
  { initials: "JM", eciCode: "55110282", goalEur: 1234 },
];

async function main() {
  for (const o of LIS_OPERATORS) {
    await prisma.operator.upsert({
      where: { boutique_initials: { boutique: "LIS", initials: o.initials } },
      update: {
        eciCode: o.eciCode,
        monthlyGoalCents: o.goalEur != null ? o.goalEur * 100 : null,
        active: true,
      },
      create: {
        boutique: "LIS",
        initials: o.initials,
        eciCode: o.eciCode,
        monthlyGoalCents: o.goalEur != null ? o.goalEur * 100 : null,
      },
    });
  }
  const all = await prisma.operator.findMany({ where: { boutique: "LIS" }, orderBy: { initials: "asc" } });
  console.log(`LIS operators (${all.length}):`, all.map((a) => `${a.initials}=${a.eciCode}${a.monthlyGoalCents ? ` goal€${a.monthlyGoalCents / 100}` : ""}`).join("  "));
  await prisma.$disconnect();
}
main();
