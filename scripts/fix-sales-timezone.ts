// Corrige as vendas importadas do ECI que ficaram com a hora gravada como se
// fosse UTC quando na verdade era hora de parede de Lisboa (ver lib/tz.ts).
//
//   $env:DATABASE_URL = "<neon url>"
//   npx tsx scripts/fix-sales-timezone.ts            # dry-run
//   npx tsx scripts/fix-sales-timezone.ts --apply    # grava
//
// NÃO é um "-1 hora" cego: recalcula linha a linha. As vendas de VERÃO recuam
// 1h (Lisboa = UTC+1); as de INVERNO ficam como estão (Lisboa = UTC+0, já
// estavam certas). Um deslocamento fixo estragaria metade dos registos.
//
// Só toca em Sale.note = "Histórico ECI" (as importadas). Vendas registadas no
// POS têm a hora certa — foram gravadas com now().
//
// Protecção contra correr duas vezes: fica registado um AdminAction e o script
// recusa repetir sem --force (a segunda passagem recuaria outra hora).
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";
import { lisbonToUtc, lisbonHhmm } from "../lib/tz";

const APPLY = process.argv.includes("--apply");
const FORCE = process.argv.includes("--force");
const NOTE = "Histórico ECI";
const MARCA = "tz-fix-sales";

if (!process.env.DATABASE_URL) { console.error("DATABASE_URL não definido."); process.exit(1); }
if (/localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL)) {
  console.error("\n⚠  DATABASE_URL aponta para localhost — não é a base de dados de produção.");
  console.error('   Define-a nesta janela:  $env:DATABASE_URL = "<string do Neon>"\n');
  process.exit(1);
}
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

(async () => {
  // Já foi corrigido antes?
  const jaFeito = await prisma.adminAction.findFirst({
    where: { entityType: "UPLOAD_BATCH", entityId: MARCA },
    orderBy: { createdAt: "desc" },
  });
  if (jaFeito && !FORCE) {
    console.log(`\n⚠  Esta correcção já foi aplicada em ${jaFeito.createdAt.toLocaleString("pt-PT")}.`);
    console.log("   Correr outra vez recuaria mais uma hora. Se tens a certeza, usa --force.\n");
    await prisma.$disconnect();
    return;
  }

  const vendas = await prisma.sale.findMany({
    where: { note: NOTE },
    select: { id: true, soldAt: true, boutique: true },
    orderBy: { soldAt: "asc" },
  });
  console.log(`\nVendas importadas do ECI: ${vendas.length}${APPLY ? "  — A APLICAR" : "  — dry-run"}\n`);
  if (vendas.length === 0) {
    console.log("Nada a corrigir.\n");
    await prisma.$disconnect();
    return;
  }

  // Recalcular: a hora que está gravada em UTC era, na verdade, hora de Lisboa.
  const correcoes: { id: string; de: Date; para: Date; deltaMin: number }[] = [];
  for (const v of vendas) {
    const d = v.soldAt;
    const certo = lisbonToUtc(
      d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(),
      d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(),
    );
    const deltaMin = Math.round((certo.getTime() - d.getTime()) / 60000);
    if (deltaMin !== 0) correcoes.push({ id: v.id, de: d, para: certo, deltaMin });
  }

  const porDelta = new Map<number, number>();
  for (const c of correcoes) porDelta.set(c.deltaMin, (porDelta.get(c.deltaMin) ?? 0) + 1);

  console.log(`  a corrigir:      ${correcoes.length}`);
  console.log(`  já certas:       ${vendas.length - correcoes.length}  (inverno — Lisboa em UTC+0)`);
  console.log("\n  desvio aplicado:");
  [...porDelta.entries()].sort((a, b) => a[0] - b[0]).forEach(([min, n]) =>
    console.log(`    ${min > 0 ? "+" : ""}${min} min → ${n} vendas`));

  console.log("\n  amostra (o que o admin vai passar a mostrar):");
  correcoes.slice(0, 8).forEach((c) =>
    console.log(`    ${c.de.toISOString().slice(0, 10)}  ${lisbonHhmm(c.de)} → ${lisbonHhmm(c.para)}`));

  if (!APPLY) {
    console.log("\nDry-run — nada gravado. Corre com --apply para aplicar.\n");
    await prisma.$disconnect();
    return;
  }

  console.log("\nA gravar…");
  let feitos = 0;
  for (const c of correcoes) {
    await prisma.sale.update({ where: { id: c.id }, data: { soldAt: c.para } });
    feitos++;
    if (feitos % 100 === 0 || feitos === correcoes.length) console.log(`  ${feitos}/${correcoes.length}…`);
  }
  await prisma.adminAction.create({
    data: {
      entityType: "UPLOAD_BATCH", action: "IMPORT", entityId: MARCA,
      note: `Correcção de fuso nas vendas do ECI: ${feitos} horas ajustadas`,
    },
  });
  console.log(`\n✓ ${feitos} vendas corrigidas.\n`);
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
