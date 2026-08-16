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
 *
 * Flags:
 *   --apagar-orfas  apaga também as fichas sem EAN, sem vendas e sem stock
 *                   em loja, que por defeito só são reportadas
 *   --force-stock   apaga duplicados mesmo com stock em loja
 */
import { prisma } from "@/lib/prisma";
import { REFILL_COMPAT, baseModelFor } from "@/lib/refill-compat";
import { PEN_COMPAT, CLASSIQUE_ANTES_1999 } from "@/lib/pen-refill-compat";

const APPLY = process.argv.includes("--apply");
const FORCE_STOCK = process.argv.includes("--force-stock");
// Fichas sem EAN, sem vendas e sem stock em loja: por defeito só são
// reportadas, porque "não tem rasto no ERP" não prova que o artigo não
// existe. Com esta flag são apagadas — usar depois de confirmar à mão.
const APAGAR_ORFAS = process.argv.includes("--apagar-orfas");

// Todas as REF que os dois quadros mencionam — recargas de gás e pedras dos
// isqueiros, recargas e cartuchos das canetas — mais a 000444 (recarga de
// gancho) que existia no catálogo sem constar de quadro nenhum.
const REFS = [
  ...new Set([
    ...Object.values(REFILL_COMPAT).flatMap((c) => [...c.gas, ...c.flint]),
    ...Object.values(PEN_COMPAT).flatMap((f) => Object.values(f).flat()),
    // Fora dos quadros activos, mas existem no catálogo e convém vigiá-las
    // na mesma: as do Classique anterior a 1999, as minas 0,7 em caixa de 12
    // e as borrachas, a esferográfica do Défi Multifonção, a de Montparnasse,
    // o roller mini do Néo-Classique Président e a recarga de gancho.
    ...CLASSIQUE_ANTES_1999,
    "040205", "040207", "040208", "040201", "040843", "000444",
    // Os dois "Frasco de Tinta (Cx. 5)" sem EAN nem stock: resíduo do seed,
    // porque os frascos a sério são a 040165–040170, com EAN e em loja.
    "040159", "040161",
  ]),
].sort();

/**
 * A REF canónica de um SKU do catálogo. A duplicação sempre trocou o dígito
 * da frente: 000434 ↔ 900434 nas recargas de gás, 040850 ↔ 940850 nas de
 * caneta. A forma com 0 à frente é a que o ERP usa.
 */
function canonical(sku: string): string {
  const t = sku.replace(/^STD/, "");
  return /^9\d{5}$/.test(t) ? "0" + t.slice(1) : t;
}

/** Todas as formas sob as quais uma REF canónica pode estar gravada. */
function variantsOf(ref: string): string[] {
  const nine = "9" + ref.slice(1);
  return [ref, nine, "STD" + ref, "STD" + nine];
}

function money(cents: number) {
  return (cents / 100).toFixed(2).replace(".", ",") + " €";
}

/**
 * O stock a sério é o das boutiques. A coluna `stock` é um total
 * desnormalizado que o seed encheu com um valor fixo e que só volta a ser
 * recalculado quando o sync do ERP toca na ficha — nas fichas duplicadas,
 * que o ERP nunca encontrou, ficou o valor do seed lá para sempre. Guardar
 * por `stock` recusaria apagar fichas cujo stock nunca existiu.
 */
function stockReal(v: { stockLis: number; stockVng: number }) {
  return v.stockLis + v.stockVng;
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
  const orphans: typeof rows = [];

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
      `  ${v.ean ?? "sem EAN"}  vendas:${v._count.saleItems}` +
      ` mov:${v._count.stockMovements} enc:${v._count.orderItems} res:${v._count.reservas}`;

    if (g.length === 1 && keeper) {
      // Uma ficha pode ter a REF certa e mesmo assim ser resíduo do seed. A
      // assinatura é inconfundível: sem EAN, sem vendas, sem movimentos, e a
      // coluna `stock` a declarar unidades que nenhuma das duas lojas tem. Um
      // artigo novo a sério não declara stock que não está em lado nenhum.
      const residuo =
        !keeper.ean &&
        keeper._count.saleItems === 0 &&
        keeper._count.stockMovements === 0 &&
        stockReal(keeper) === 0 &&
        keeper.stock > 0;
      if (residuo) {
        if (APAGAR_ORFAS) {
          console.log(`${ref}  → APAGAR ${keeper.sku} (órfã, confirmada com --apagar-orfas)`);
          console.log(line(keeper, "✗"));
          toDelete.push(keeper);
        } else {
          console.log(`${ref}  ? ÓRFÃ — REF certa mas sem EAN, sem vendas e sem stock em loja`);
          console.log(line(keeper, " "));
          orphans.push(keeper);
        }
        continue;
      }
      console.log(`${ref}  ✓ única ficha, REF já certa`);
      console.log(line(keeper, " "));
      continue;
    }
    if (g.length === 1 && !keeper) {
      const v = g[0];
      // Sem EAN, sem vendas e sem stock em loja não é uma ficha que o ERP
      // alguma vez tenha visto — é resíduo do seed. Renomeá-la dava-lhe um
      // ar de canónica que não tem, por isso fica de fora e vai a relatório.
      if (!v.ean && v._count.saleItems === 0 && stockReal(v) === 0) {
        if (APAGAR_ORFAS) {
          console.log(`${ref}  → APAGAR ${v.sku} (órfã, confirmada com --apagar-orfas)`);
          console.log(line(v, "✗"));
          toDelete.push(v);
        } else {
          console.log(`${ref}  ? ÓRFÃ — ${v.sku} não tem EAN, nem vendas, nem stock em loja`);
          console.log(line(v, " "));
          orphans.push(v);
        }
        continue;
      }
      console.log(`${ref}  → RENOMEAR ${v.sku} para ${ref} (ficha, fotos e stock mantêm-se)`);
      console.log(line(v, " "));
      toRename.push({ v, to: ref });
      continue;
    }
    // Duplicados.
    if (!keeper) {
      // Nenhuma tem a REF certa: fica a que tem mais stock, depois mais fotos.
      const sorted = [...g].sort((a, b) => stockReal(b) - stockReal(a) || b.images.length - a.images.length);
      const k = sorted[0];
      console.log(`${ref}  → DUPLICADO sem ficha canónica: fica ${k.sku} (renomeada para ${ref}), apaga-se o resto`);
      console.log(line(k, "✓"));
      toRename.push({ v: k, to: ref });
      for (const l of sorted.slice(1)) {
        console.log(line(l, "✗"));
        if (stockReal(l) > 0 && !FORCE_STOCK) conflicts.push(`${l.sku} (${l.product.slug}) tem ${stockReal(l)} em loja`);
        else toDelete.push(l);
      }
      continue;
    }
    console.log(`${ref}  → DUPLICADO: fica ${keeper.sku}, apaga-se ${losers.map((l) => l.sku).join(", ")}`);
    console.log(line(keeper, "✓"));
    for (const l of losers) {
      console.log(line(l, "✗"));
      if (stockReal(l) > 0 && !FORCE_STOCK) conflicts.push(`${l.sku} (${l.product.slug}) tem ${stockReal(l)} em loja`);
      else toDelete.push(l);
    }
  }

  if (conflicts.length) {
    console.log("\n⚠ NÃO APAGADAS (têm stock em loja — confirmar antes):");
    for (const c of conflicts) console.log("   " + c);
  }
  if (orphans.length) {
    console.log("\n? ÓRFÃS — decidir o que fazer (o script não lhes toca):");
    for (const o of orphans) {
      console.log(`   ${o.sku} (${o.product.slug})  stock declarado ${o.stock}, em loja 0`);
    }
  }
  // A coluna `stock` fora de sincronia com as boutiques é o rasto do seed —
  // e é ela que a loja mostra, portanto aparecem disponíveis artigos que não
  // existem em lado nenhum.
  const fantasma = rows.filter((v) => v.stock !== stockReal(v));
  if (fantasma.length) {
    console.log("\n⚠ COLUNA `stock` DESALINHADA (declara o que as lojas não têm):");
    for (const v of fantasma) {
      console.log(`   ${v.sku} (${v.product.slug})  declara ${v.stock}, em loja ${stockReal(v)}`);
    }
  }

  // ─── Cobertura do quadro de compatibilidades ──────────────────────────
  //
  // Por PRODUTO e não por colecção: a maioria dos isqueiros está agrupada
  // pela edição ("Cohiba", "Géode", "Dragon") e é o nome que diz o modelo.
  console.log("\n═══ ISQUEIROS: QUE RECARGAS FICAM ASSOCIADAS ═══\n");
  const lighters = await prisma.product.findMany({
    where: { category: { slug: "isqueiros" }, active: true },
    select: { slug: true, collection: true, name: true },
    orderBy: [{ collection: "asc" }, { slug: "asc" }],
  });
  const porModelo = new Map<string, string[]>();
  const semQuadro: string[] = [];
  for (const p of lighters) {
    const nome = (p.name as { pt?: string })?.pt ?? "";
    const modelo = baseModelFor(p.collection, nome);
    if (!modelo) {
      semQuadro.push(`${nome}  (${p.collection} · ${p.slug})`);
      continue;
    }
    porModelo.set(modelo, [...(porModelo.get(modelo) ?? []), nome]);
  }
  for (const modelo of [...porModelo.keys()].sort()) {
    const c = REFILL_COMPAT[modelo];
    const fichas = porModelo.get(modelo)!;
    console.log(
      `${String(fichas.length).padStart(3)} × ${modelo.padEnd(22)} gás ${c.gas.join(" / ").padEnd(24)} ${
        c.flint.length ? "pedras " + c.flint.join(" / ") : "sem pedra"
      }`,
    );
    if (c.nota) console.log(`      ↳ ${c.nota}`);
  }
  console.log(`\n${lighters.length - semQuadro.length}/${lighters.length} isqueiros cobertos.`);
  if (semQuadro.length) {
    console.log("\n⚠ Sem modelo identificável (não mostram recargas):");
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
