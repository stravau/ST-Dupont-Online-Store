/**
 * Dá número às fichas de reparação que ficaram sem ele.
 *
 * A coluna `ticketNumber` é nullable e a migração que a criou numerou o que
 * havia na altura. Fichas criadas por fora — importação, inserção à mão —
 * podem ficar sem número, e aí o talão sai com o campo em branco.
 *
 * Foi também uma destas que bloqueou o registo de reparações novas: a
 * consulta do próximo número ordenava por ticketNumber DESC sem excluir os
 * nulos, e o Postgres ordena NULLS FIRST. Isso já está corrigido na rota;
 * isto trata do que ficou para trás.
 *
 * Numera por ordem de criação, a seguir ao maior número de cada loja — nunca
 * reaproveita buracos, para dois talões impressos nunca poderem ter o mesmo
 * número.
 *
 * Uso (SEM --apply não escreve nada):
 *   $env:DATABASE_URL="<url de produção>"; npx tsx scripts/numerar-fichas-sem-numero.ts
 *   $env:DATABASE_URL="<url de produção>"; npx tsx scripts/numerar-fichas-sem-numero.ts --apply
 */
import { prisma } from "@/lib/prisma";

const APPLY = process.argv.includes("--apply");

async function main() {
  const host = (process.env.DATABASE_URL ?? "").replace(/\/\/[^@]*@/, "//***@");
  console.log(`DB: ${host || "(não definida)"}`);
  console.log(APPLY ? "MODO: APLICAR (escreve na base)\n" : "MODO: simulação (não escreve nada)\n");

  const semNumero = await prisma.repair.findMany({
    where: { ticketNumber: null },
    orderBy: { createdAt: "asc" },
    select: { id: true, boutique: true, customerName: true, createdAt: true, modelName: true },
  });

  if (semNumero.length === 0) {
    console.log("Nada a fazer — todas as fichas têm número.");
    return;
  }

  // Maior número por loja, ignorando os nulos (é exactamente o descuido que
  // causou o bug do registo).
  const maximos = new Map<string, number>();
  for (const b of ["LIS", "VNG"] as const) {
    const top = await prisma.repair.findFirst({
      where: { boutique: b, ticketNumber: { not: null } },
      orderBy: { ticketNumber: "desc" },
      select: { ticketNumber: true },
    });
    maximos.set(b, top?.ticketNumber ?? 0);
  }

  const plano: { id: string; boutique: string; numero: number; quem: string }[] = [];
  for (const r of semNumero) {
    const proximo = (maximos.get(r.boutique) ?? 0) + 1;
    maximos.set(r.boutique, proximo);
    plano.push({ id: r.id, boutique: r.boutique, numero: proximo, quem: r.customerName });
    console.log(
      `  ${r.boutique}-${String(proximo).padStart(4, "0")}   ${r.createdAt.toISOString().slice(0, 10)}` +
      `   ${r.customerName}${r.modelName ? " · " + r.modelName : ""}`,
    );
  }

  console.log(`\nResumo: ${plano.length} ficha(s) a numerar.`);
  if (!APPLY) {
    console.log("\nSimulação — nada foi escrito. Corre outra vez com --apply para aplicar.");
    return;
  }

  for (const p of plano) {
    await prisma.repair.update({ where: { id: p.id }, data: { ticketNumber: p.numero } });
    console.log(`  ${p.boutique}-${String(p.numero).padStart(4, "0")} → ${p.quem}`);
  }
  console.log("\nFeito.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
