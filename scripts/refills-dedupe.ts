/**
 * Alinha as recargas de gás / pedras com o ERP e mostra que isqueiros ficam
 * cobertos pelo quadro oficial de compatibilidades.
 *
 * O catálogo tem as recargas em duplicado: a ficha "boa" com REF 000NNN e uma
 * segunda ficha com REF 900NNN. O Excel do ERP usa sempre a forma 000NNN, e a
 * cascata de matching (000NNN → 900NNN) fez o stock aterrar na ficha errada.
 *
 * Regras, por família de recarga:
 *   - só existe 000NNN            → nada a fazer
 *   - só existe 900NNN            → RENOMEAR para 000NNN (ficha, fotos e stock
 *                                   ficam como estão; muda só a REF)
 *   - existem as duas             → fica a 000NNN, apaga-se a 900NNN
 *
 * Nunca apaga uma ficha com stock — nesse caso reporta CONFLITO e passa à
 * frente (a menos que se passe --force-stock, que aí é decisão consciente).
 * O histórico de vendas não se perde: SaleItem guarda sku, EAN, descrição e
 * preço em snapshot e a FK é onDelete: SetNull.
 *
 * Uso (SEM --apply não escreve nada):
 *   $env:DATABASE_URL="<url de produção>"; npx tsx scripts/refills-dedupe.ts
 *   $env:DATABASE_URL="<url de produção>"; npx tsx scripts/refills-dedupe.ts --apply
 */
import { prisma } from "@/lib/prisma";
import { REFILL_COMPAT, refillRefsFor } from "@/lib/refill-compat";

const APPLY = process.argv.includes("--apply");
const FORCE_STOCK = process.argv.includes("--force-stock");

// Todas as REF de recargas/pedras que o quadro menciona, mais a 000444
// (recarga de gancho) que existe no catálogo mas não consta do quadro.
const REFS = [
  ...new Set([...Object.values(REFILL_COMPAT).flatMap((c) => [...c.gas, ...c.flint]), "000444"]),
].sort();

/** A REF canónica (forma 000NNN) de um SKU do catálogo. */
function canonical(sku: string): string {
  const t = sku.replace(/^STD/, "");
  return /^900\d{3}$/.test(t) ? "000" + t.slice(3) : t;
}

/** Todas as formas sob as quais uma REF canónica pode estar gravada. */
function variantsOf(ref: string): string[] {
  const nine = "9" + ref.slice(1);
  return [ref, nine, "STD" + ref, "STD" + nine];
}

function money(cents: number) {
  return (cents / 100).toFixed(2).replace(".", ",") + " €";
}

async function main() {
  const host = (process.env.DATABASE_URL ?? "").replace(/\/\/[^@]*@/, "//***@");
  console.log(`DB: ${host || "(não definida)"}`);
  console.log(APPLY ? "MODO: APLICAR (escreve na base)\n" : "MODO: simulação (não escreve nada)\n");

  const rows = await prisma.productVariant.findMany({
    where: { sku: { in: REFS.flatMap(variantsOf) } },
    include: {
      product: { select: { id: true, slug: true, name: true, active: true, _count: { select: { variants: true } } } },
      _count: { select: { saleItems: true, stockMovements: true, orderItems: true, reservas: true } },
    },
    orderBy: { sku: "asc" },
  });

  const groups = new Map<string, typeof rows>();
  for (const v of rows) {
    const k = canonical(v.sku);
    groups.set(k, [...(groups.get(k) ?? []), v]);
  }

  const toDelete: typeof rows = [];
  const toRename: { v: (typeof rows)[number]; to: string }[] = [];
  const conflicts: string[] = [];

  console.log("═══ RECARGAS E PEDRAS ═══\n");
  for (const ref of REFS) {
    const g = groups.get(ref) ?? [];
    if (g.length === 0) {
      console.log(`${ref}  ⚠ não existe no catálogo`);
      continue;
    }
    const keeper = g.find((v) => v.sku === ref) ?? g.find((v) => v.sku === "STD" + ref) ?? null;
    const losers = g.filter((v) => v !== keeper);

    const line = (v: (typeof rows)[number], tag: string) =>
      `      ${tag} ${v.sku.padEnd(9)} ${v.product.slug.padEnd(22)} stock ${String(v.stock).padStart(3)}` +
      ` (LIS ${v.stockLis} / VNG ${v.stockVng})  ${String(v.images.length).padStart(2)} fotos  ${money(v.priceCents).padStart(9)}` +
      `  ${v.ean ?? "sem EAN"}  vendas:${v._count.saleItems}`;

    if (g.length === 1 && keeper) {
      console.log(`${ref}  ✓ única ficha, REF já certa`);
      console.log(line(keeper, " "));
      continue;
    }
    if (g.length === 1 && !keeper) {
      const v = g[0];
      console.log(`${ref}  → RENOMEAR ${v.sku} para ${ref} (ficha, fotos e stock mantêm-se)`);
      console.log(line(v, " "));
      toRename.push({ v, to: ref });
      continue;
    }
    // Duplicados.
    if (!keeper) {
      // Nenhuma tem a REF certa: fica a que tem mais stock, depois mais fotos.
      const sorted = [...g].sort((a, b) => b.stock - a.stock || b.images.length - a.images.length);
      const k = sorted[0];
      console.log(`${ref}  → DUPLICADO sem ficha canónica: fica ${k.sku} (renomeada para ${ref}), apaga-se o resto`);
      console.log(line(k, "✓"));
      toRename.push({ v: k, to: ref });
      for (const l of sorted.slice(1)) {
        console.log(line(l, "✗"));
        if (l.stock > 0 && !FORCE_STOCK) conflicts.push(`${l.sku} (${l.product.slug}) tem ${l.stock} de stock`);
        else toDelete.push(l);
      }
      continue;
    }
    console.log(`${ref}  → DUPLICADO: fica ${keeper.sku}, apaga-se ${losers.map((l) => l.sku).join(", ")}`);
    console.log(line(keeper, "✓"));
    for (const l of losers) {
      console.log(line(l, "✗"));
      if (l.stock > 0 && !FORCE_STOCK) conflicts.push(`${l.sku} (${l.product.slug}) tem ${l.stock} de stock`);
      else toDelete.push(l);
    }
  }

  if (conflicts.length) {
    console.log("\n⚠ NÃO APAGADAS (têm stock — confirmar antes):");
    for (const c of conflicts) console.log("   " + c);
  }

  // ─── Cobertura do quadro de compatibilidades ──────────────────────────
  console.log("\n═══ ISQUEIROS: QUE RECARGAS FICAM ASSOCIADAS ═══\n");
  const lighters = await prisma.product.groupBy({
    by: ["collection"],
    where: { category: { slug: "isqueiros" }, active: true },
    _count: { _all: true },
    orderBy: { collection: "asc" },
  });
  const semQuadro: string[] = [];
  for (const l of lighters) {
    const refs = refillRefsFor(l.collection);
    const n = String(l._count._all).padStart(3);
    if (refs.length === 0) {
      semQuadro.push(`${n} × ${l.collection}`);
      continue;
    }
    const c = REFILL_COMPAT[l.collection.trim()];
    console.log(
      `${n} × ${l.collection.padEnd(24)} gás ${c.gas.join(" / ").padEnd(24)} ${
        c.flint.length ? "pedras " + c.flint.join(" / ") : "sem pedra"
      }`,
    );
    if (c.nota) console.log(`      ↳ ${c.nota}`);
  }
  if (semQuadro.length) {
    console.log("\n⚠ Colecções de isqueiros SEM entrada no quadro (não mostram recargas):");
    for (const s of semQuadro) console.log("   " + s);
  }

  // ─── Escrita ──────────────────────────────────────────────────────────
  console.log(
    `\nResumo: ${toRename.length} REF a corrigir, ${toDelete.length} fichas duplicadas a apagar` +
      (conflicts.length ? `, ${conflicts.length} por confirmar` : ""),
  );
  if (!APPLY) {
    console.log("\nSimulação — nada foi escrito. Corre outra vez com --apply para aplicar.");
    return;
  }

  await prisma.$transaction(async (tx) => {
    // Apagar primeiro: liberta REF e EAN antes dos renames, senão o índice
    // único rejeita.
    for (const v of toDelete) {
      const keeper = (groups.get(canonical(v.sku)) ?? []).find((k) => k !== v);
      if (keeper) {
        // Não perder o que a ficha duplicada tinha e a boa não tem.
        const patch: { ean?: string; images?: string[] } = {};
        if (!keeper.ean && v.ean) patch.ean = v.ean;
        if (keeper.images.length === 0 && v.images.length > 0) patch.images = v.images;
        if (Object.keys(patch).length) {
          await tx.productVariant.update({ where: { id: v.id }, data: { ean: null } });
          await tx.productVariant.update({ where: { id: keeper.id }, data: patch });
        }
      }
      await tx.productVariant.delete({ where: { id: v.id } });
      // Produto que ficou sem variantes deixa de ter razão de existir e
      // rebentaria a PDP (notFound), por isso vai atrás.
      if (v.product._count.variants === 1) {
        await tx.product.delete({ where: { id: v.product.id } });
        console.log(`apagado produto ${v.product.slug} (ficou sem variantes)`);
      }
      console.log(`apagada variante ${v.sku} (${v.product.slug})`);
    }
    for (const { v, to } of toRename) {
      await tx.productVariant.update({ where: { id: v.id }, data: { sku: to } });
      console.log(`REF ${v.sku} → ${to} (${v.product.slug})`);
    }
  }, { timeout: 60_000, maxWait: 15_000 });

  console.log("\nFeito.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
