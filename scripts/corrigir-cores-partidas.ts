// Cores inglesas de duas palavras que foram partidas ao meio na importação.
//
// "Dark Blue" é UMA cor. O importador tratou-a como duas: traduziu palavra a
// palavra, juntou-as com "&" — "Escuro & Azul" — e deu-lhe DOIS tons de hex.
// Não é só o texto: quando a variante não tem miniatura, a amostra é desenhada
// a partir do hex, e com dois tons sai um losango meio cinzento meio azul em
// vez de um azul-escuro.
//
// NEM TODA a cor com "&" está errada: "Green & Khaki" são mesmo duas cores, e
// essas ficam como estão. A tabela abaixo é explícita, escrita a olhar para
// cada caso, precisamente para não apanhar as legítimas.
//
// TRÊS FAMÍLIAS DE DEFEITO:
//   partidas    "Dark Blue" -> "Escuro & Azul"        (uma cor virou duas)
//   redundantes "Gold & Golden" -> "Dourado & Dourado" (a mesma cor duas vezes)
//   divergentes o mesmo inglês com dois portugueses diferentes — "Black &
//               Silver" era ora "Preto & Prata" ora "Preto & Prateado"
//
// O HEX só é colapsado nas PARTIDAS, e fica o tom do substantivo: em "Dark
// Blue" o que interessa é o azul, em "Yellow Gold" é o ouro. Numa cor que é
// mesmo dupla, dois tons é o correcto e não se toca.
//
// COMO CORRER (PowerShell, na raiz do projecto):
//   $env:DATABASE_URL = "<a URL da Neon de producao>"
//   npx.cmd tsx scripts/corrigir-cores-partidas.ts          # simulacao
//   npx.cmd tsx scripts/corrigir-cores-partidas.ts --apply  # escreve

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

// Uma cor inglesa de duas palavras partida em pedaços. O português corrente
// põe o substantivo à frente: "azul-escuro", não "escuro azul".
const PARTIDAS: Record<string, string> = {
  "Escuro & Azul": "Azul-escuro",
  "Néon & Verde": "Verde Néon",
  "Néon & Azul": "Azul Néon",
  "Néon & Laranja": "Laranja Néon",
  "Índigo & Azul": "Azul Índigo",
  "Real & Azul": "Azul Real",
  "Turquesa & Azul": "Azul Turquesa",
  "Claro & Cinza": "Cinzento Claro",
  "Fogo & Laranja": "Laranja Fogo",
  "Amarelo & Ouro": "Ouro Amarelo",
  "Azul & Fender": "Azul Fender",
  "Azul & Koi & Fish": "Azul Koi",
  "S.t. & Dupont": "S.T. Dupont",
};

// Cores mesmo duplas onde só UM dos lados tinha sido partido. O "&" fica —
// são duas cores — mas o lado partido é remendado.
const DUPLAS_COM_LADO_PARTIDO: Record<string, string> = {
  "Azul & Escuro & Azul": "Azul & Azul-escuro",
  "Azul & Índigo & Azul": "Azul & Azul Índigo",
  "Azul & Turquesa & Azul": "Azul & Azul Turquesa",
  "Azul & Escuro & Azul & Dourado": "Azul & Azul-escuro & Dourado",
  "Fúcsia & Rosa & Rosa": "Rosa Fúcsia & Rosa",
  "Laca Preta & Ouro": "Laca Preta & Ouro Amarelo",
};

// A mesma cor escrita duas vezes, ou o mesmo inglês com dois portugueses.
const REDUNDANTES: Record<string, string> = {
  "Dourado & Dourado": "Dourado",
  "Multicor & Multicor": "Multicor",
  "Preto & Prateado": "Preto & Prata",
  "Cinza & Prata": "Cinzento & Prata",
  "Cinza & Gun Metal & Prata": "Cinzento & Gun Metal & Prata",
};

const CERTO: Record<string, string> = { ...PARTIDAS, ...DUPLAS_COM_LADO_PARTIDO, ...REDUNDANTES };

// Só nas partidas o hex a dois tons está errado — e a etiqueta da marca não é
// cor nenhuma, por isso não se lhe mexe no tom.
const COLAPSA_HEX = new Set(
  Object.keys(PARTIDAS).filter((k) => k !== "S.t. & Dupont"),
);

async function main() {
  const vs = await prisma.productVariant.findMany({
    select: { id: true, sku: true, name: true, attributes: true },
  });

  let tocadas = 0;
  let nomes = 0;
  let hexes = 0;
  const conta = new Map<string, number>();

  for (const v of vs) {
    const attrs = (v.attributes ?? {}) as Record<string, unknown>;
    const c = attrs.color as { label?: { pt?: string; en?: string }; hex?: string[] } | undefined;
    const ptAntigo = c?.label?.pt;
    if (!ptAntigo || !CERTO[ptAntigo]) continue;

    const ptNovo = CERTO[ptAntigo];
    const hexAntigo = c?.hex ?? [];
    const hexNovo =
      COLAPSA_HEX.has(ptAntigo) && hexAntigo.length === 2 ? [hexAntigo[1]] : hexAntigo;
    if (hexNovo.length !== hexAntigo.length) hexes++;

    const nome = (v.name ?? {}) as { pt?: string; en?: string };
    const nomePtNovo = nome.pt?.includes(ptAntigo) ? nome.pt.replace(ptAntigo, ptNovo) : nome.pt;
    if (nomePtNovo !== nome.pt) nomes++;

    tocadas++;
    conta.set(ptAntigo, (conta.get(ptAntigo) ?? 0) + 1);

    if (APLICAR) {
      await prisma.productVariant.update({
        where: { id: v.id },
        data: {
          attributes: {
            ...attrs,
            color: { ...c, label: { ...(c?.label ?? {}), pt: ptNovo }, hex: hexNovo },
          } as object,
          ...(nomePtNovo !== nome.pt ? { name: { ...nome, pt: nomePtNovo } } : {}),
        },
      });
    }
  }

  const seccao = (t: string, tabela: Record<string, string>) => {
    const linhas = Object.keys(tabela).filter((k) => conta.has(k));
    if (!linhas.length) return;
    console.log("\n" + t);
    for (const k of linhas.sort((a, b) => (conta.get(b) ?? 0) - (conta.get(a) ?? 0))) {
      console.log("  " + String(conta.get(k)).padStart(3) + "  " + k.padEnd(32) + "-> " + tabela[k]);
    }
  };
  seccao("PARTIDAS (uma cor virou duas):", PARTIDAS);
  seccao("DUPLAS com um lado partido:", DUPLAS_COM_LADO_PARTIDO);
  seccao("REDUNDANTES / divergentes:", REDUNDANTES);

  console.log("\n" + "=".repeat(66));
  console.log(
    (APLICAR ? "ESCRITO: " : "SIMULACAO: ") + tocadas + " variantes, " +
    nomes + " nomes ajustados, " + hexes + " tons colapsados",
  );
  if (!APLICAR) console.log("Nada foi gravado. Corre com --apply para gravar.");
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
