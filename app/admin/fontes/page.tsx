import { redirect } from "next/navigation";
import {
  Julius_Sans_One,
  Tenor_Sans,
  Cormorant_Infant,
  Marcellus,
  Spectral,
  Jost,
  Cormorant_Garamond,
} from "next/font/google";
import { currentStaff } from "@/lib/admin-auth";
import { AdminHero } from "@/components/admin/admin-hero";

export const dynamic = "force-dynamic";

// Comparador de fontes. Existe porque a alternativa era eu escolher uma,
// aplicá-la ao site, e repetir — que foi o que aconteceu com a Marcellus.
// Aqui vê-se o mesmo texto em todas ao mesmo tempo, com o título em caixa
// alta e a prosa longa, que são os dois sítios onde a decisão se joga.
//
// O alvo é a SangBleu OG Sans (Swiss Typefaces, paga) que a Maison usa: uma
// SANS de alto contraste — hastes grossas, ligações finas, sem serifas. Foi
// aí que errei da primeira vez: a Marcellus é um serifado inscricional.

const julius = Julius_Sans_One({ subsets: ["latin"], weight: ["400"], display: "swap" });
const tenor = Tenor_Sans({ subsets: ["latin"], weight: ["400"], display: "swap" });
const cormorantInfant = Cormorant_Infant({ subsets: ["latin"], weight: ["300", "400"], display: "swap" });
const marcellus = Marcellus({ subsets: ["latin"], weight: ["400"], display: "swap" });
const spectral = Spectral({ subsets: ["latin"], weight: ["200", "300"], display: "swap" });
const jost = Jost({ subsets: ["latin"], weight: ["300", "400"], display: "swap" });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["300", "400"], display: "swap" });

const TITLE = "A SUMMER ON THE FRENCH RIVIERA";
const BODY =
  "For summer 2026, S.T. Dupont draws inspiration from the unique atmosphere of the French Riviera and its timeless elegance. Bathed in the dazzling light of the Mediterranean and the gentle warmth of long summer days, this season celebrates a way of life marked by refinement and freedom.";

const CANDIDATES: { name: string; cls: string; note: string; tracking: string }[] = [
  {
    name: "Julius Sans One",
    cls: julius.className,
    tracking: "0.10em",
    note: "Sans de alto contraste, sem serifas. É a que mais se aproxima do alvo em maiúsculas — hastes grossas com ligações muito finas. Só tem um peso, e em texto corrido fica leve.",
  },
  {
    name: "Tenor Sans",
    cls: tenor.className,
    tracking: "0.06em",
    note: "Sans humanista com modulação suave e terminais ligeiramente abertos. Menos dramática que a Julius mas muito mais utilizável em parágrafos.",
  },
  {
    name: "Jost",
    cls: jost.className,
    tracking: "0.05em",
    note: "Geométrica limpa, na linha da Futura. Sem contraste nenhum — é o oposto do alvo, mas dá o registo moderno se o que te agrada for a ausência de serifas.",
  },
  {
    name: "Cormorant Infant",
    cls: cormorantInfant.className,
    tracking: "0.04em",
    note: "Serifada de contraste altíssimo, da mesma família da que o site já usa mas mais delicada. Não é sans, mas tem a finura que a SangBleu tem.",
  },
  {
    name: "Spectral Light",
    cls: spectral.className,
    tracking: "0.02em",
    note: "Serifada de transição, desenhada para ecrã. A mais confortável de todas em texto longo; a menos parecida com o alvo.",
  },
  {
    name: "Marcellus",
    cls: marcellus.className,
    tracking: "0.06em",
    note: "A que experimentámos e não convenceu. Fica aqui para comparação.",
  },
  {
    name: "Cormorant Garamond",
    cls: cormorant.className,
    tracking: "0.02em",
    note: "A que o site usa hoje nos títulos. A referência do ponto de partida.",
  },
];

export default async function FontesPage() {
  const staff = await currentStaff();
  if (staff?.role !== "ADMIN") redirect("/admin/pos");

  return (
    <div>
      <AdminHero
        compact
        eyebrow="Design"
        title="Comparar fontes"
        subtitle="O mesmo texto da campanha em cada candidata. O alvo é a SangBleu OG Sans do site oficial — comercial, da Swiss Typefaces."
      />

      <div className="space-y-10">
        {CANDIDATES.map((c) => (
          <section key={c.name} className="border border-line bg-paper p-8">
            <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-3">
              <h2 className="font-serif text-lg text-ink">{c.name}</h2>
              <span className="font-mono text-[0.6rem] text-muted">tracking {c.tracking}</span>
            </div>
            <p className="mt-3 max-w-3xl text-[0.75rem] text-muted italic">{c.note}</p>

            <div className={`${c.cls} mt-8 max-w-3xl text-center`}>
              <p style={{ letterSpacing: c.tracking }} className="text-3xl leading-tight text-ink">
                {TITLE}
              </p>
              <div className="gold-rule mx-auto my-7" />
              <p
                style={{ letterSpacing: c.tracking }}
                className="text-left text-[1.05rem] leading-relaxed text-muted"
              >
                {BODY}
              </p>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
