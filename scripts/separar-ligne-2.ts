// Separa da ficha /ligne-2 os acabamentos que sao familias proprias.
//
// O PROBLEMA: /ligne-2 tinha QUINZE variantes — laca brilhante, laca mate,
// linhas verticais, diamond head, Double X — todas metidas como se fossem
// cores do mesmo isqueiro. A grelha desenha um cartao por cor, portanto
// apareciam quinze cartoes soltos sem criterio nenhum, e quem abria um via
// uma lista de "cores" que misturava acabamentos que nada tem a ver.
//
// PIOR: o cartao elimina cores repetidas pelo ROTULO, e nestas quinze o
// rotulo "Prata" aparecia quatro vezes e "Dourado" duas. Das quatro "Prata"
// so uma sobrevivia — e por isso abrir o Diamond Head dourado (016284)
// mostrava a fotografia do Double X dourado (C16646), que tinha ganho a
// deduplicacao. Separar as familias resolve o sintoma na raiz: dentro de
// cada ficha as cores passam a ser todas distintas.
//
// AS DUAS FAMILIAS, confirmadas contra os nomes do site oficial:
//   Double X       C16645 (prata) · C16646 (dourado)
//                  lighter-double-x-silver / -gold
//   Diamond Head   016184 (prata) · 016284 (dourado) · 016424 (rosa)
//                  diamond-head-ligne-2-lighter-with-silver-finish
//
// O C16455 NAO entra: o oficial chama-lhe "Microdiamond Head", e um padrao
// mais fino e uma familia diferente, apesar de a olho se parecer com o
// Diamond Head prata.
//
// A descricao e herdada da ficha-mae. Ao contrario do que aconteceu nas
// peles, esse texto e mesmo generico do Ligne 2 ("o famoso cling na
// abertura"), portanto continua verdadeiro nas fichas novas.
//
// COMO CORRER (PowerShell, na raiz do projecto):
//   $env:DATABASE_URL = "<a URL da Neon de producao>"
//   npx.cmd tsx scripts/separar-ligne-2.ts          # simulacao
//   npx.cmd tsx scripts/separar-ligne-2.ts --apply  # escreve

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const url = process.env.DATABASE_URL ?? "";
if (!url || /localhost|127\.0\.0\.1/.test(url)) {
  console.error("DATABASE_URL nao aponta para a Neon de producao.");
  process.exit(1);
}
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
const APLICAR = process.argv.includes("--apply");

const MAE = "ligne-2";

const FAMILIAS: { slug: string; pt: string; en: string; skus: string[] }[] = [
  {
    slug: "ligne-2-double-x",
    pt: "Ligne 2 · Double X",
    en: "Ligne 2 · Double X",
    skus: ["C16645", "C16646"],
  },
  {
    slug: "ligne-2-diamond-head",
    pt: "Ligne 2 · Diamond Head",
    en: "Ligne 2 · Diamond Head",
    skus: ["016184", "016284", "016424"],
  },
];

const loc = (j: unknown, k: "pt" | "en" = "pt") =>
  String(((j ?? {}) as Record<string, string>)[k] ?? "");

async function main() {
  const mae = await prisma.product.findUnique({
    where: { slug: MAE },
    select: {
      id: true, categoryId: true, collection: true, description: true, history: true,
      variants: { select: { id: true, sku: true, name: true, images: true, attributes: true } },
    },
  });
  if (!mae) {
    console.error("/" + MAE + " nao existe");
    return;
  }
  console.log("/" + MAE + " tem " + mae.variants.length + " variantes\n");

  for (const f of FAMILIAS) {
    const vs = mae.variants.filter((v) => f.skus.includes(v.sku));
    const emFalta = f.skus.filter((s) => !vs.some((v) => v.sku === s));
    if (emFalta.length) console.log("!! ja nao estao em /" + MAE + ": " + emFalta.join(", "));
    if (!vs.length) {
      console.log("/" + f.slug + ": nada a mover (talvez ja separada)\n");
      continue;
    }

    // As cores dentro da familia tem de ser distintas, senao o cartao volta a
    // deduplicar e o problema muda de sitio em vez de desaparecer.
    const cores = vs.map((v) => (v.attributes as Record<string, any>)?.color?.label?.pt ?? "—");
    const repetidas = cores.filter((c, i) => cores.indexOf(c) !== i);
    console.log("/" + f.slug + "  «" + f.pt + "»");
    for (const v of vs) {
      const cor = (v.attributes as Record<string, any>)?.color?.label?.pt ?? "—";
      console.log("   " + v.sku.padEnd(9) + cor.padEnd(12) + v.images.length + " fotos");
    }
    if (repetidas.length) {
      console.log("   !! cores repetidas dentro da familia: " + [...new Set(repetidas)].join(", "));
    }

    if (APLICAR) {
      const ja = await prisma.product.findUnique({ where: { slug: f.slug }, select: { id: true } });
      const novo =
        ja ??
        (await prisma.product.create({
          data: {
            slug: f.slug,
            name: { pt: f.pt, en: f.en },
            // Texto generico do Ligne 2, verdadeiro nas duas familias.
            description: mae.description as object,
            history: mae.history as object,
            collection: mae.collection,
            categoryId: mae.categoryId,
            image: vs[0].images[0] ?? null,
            active: true,
          },
          select: { id: true },
        }));
      // Os nomes das variantes repetiam o nome da ficha-mae; passam a dizer a
      // familia, senao ficavam a contradizer a ficha onde estao.
      for (const v of vs) {
        const cor = loc(v.name).includes("—") ? loc(v.name).split("—").slice(1).join("—").trim() : "";
        const corEn = loc(v.name, "en").includes("—")
          ? loc(v.name, "en").split("—").slice(1).join("—").trim()
          : "";
        await prisma.productVariant.update({
          where: { id: v.id },
          data: {
            productId: novo.id,
            name: {
              pt: cor ? `${f.pt} — ${cor}` : f.pt,
              en: corEn ? `${f.en} — ${corEn}` : f.en,
            },
          },
        });
      }
      await prisma.adminAction.create({
        data: {
          entityType: "PRODUCT", action: "CREATE", entityId: f.slug,
          note: `Separada de /${MAE}: ${vs.map((v) => v.sku).join(", ")}`,
          after: { slug: f.slug, skus: vs.map((v) => v.sku) } as object,
        },
      });
    }
    console.log("");
  }

  const resta = mae.variants.filter((v) => !FAMILIAS.some((f) => f.skus.includes(v.sku)));
  console.log("=".repeat(66));
  console.log("Ficam em /" + MAE + ": " + resta.length + " variantes");
  const cores = resta.map((v) => (v.attributes as Record<string, any>)?.color?.label?.pt ?? "—");
  const rep = [...new Set(cores.filter((c, i) => cores.indexOf(c) !== i))];
  for (const v of resta) {
    const cor = (v.attributes as Record<string, any>)?.color?.label?.pt ?? "—";
    console.log("   " + v.sku.padEnd(9) + cor);
  }
  if (rep.length) {
    console.log("\n!! AINDA com cores repetidas: " + rep.join(", "));
    console.log("   Enquanto estas familias nao forem separadas, o cartao continua");
    console.log("   a deduplicar por rotulo e a mostrar a foto errada entre elas.");
  }
  if (!APLICAR) console.log("\nNada foi gravado. Corre com --apply para gravar.");
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
