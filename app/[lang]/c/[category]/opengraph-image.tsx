import { ImageResponse } from "next/og";

// Category OG card — edge runtime to keep the deployed function small
// (same reasoning as the PDP card: importing lib/catalog pulls Prisma
// into the bundle and exceeds Vercel's 250 MB cap). Category name is
// resolved from the slug via a small inline map.

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "S.T. Dupont category";

const OG_TOKENS = {
  ink: "#0a1a30",
  navy: "#15314f",
  cream: "#eef3fa",
  gold: "#b58a34",
  goldSoft: "#d8bd7c",
};

const CATEGORY_LABEL: Record<string, { pt: string; en: string; tagline: { pt: string; en: string } }> = {
  isqueiros: {
    pt: "Isqueiros",
    en: "Lighters",
    tagline: {
      pt: "L'Art du Feu — o icónico «cling» de 1941, reinventado a cada modelo.",
      en: "L'Art du Feu — the iconic 'cling' since 1941, reimagined in every model.",
    },
  },
  lighters: {
    pt: "Isqueiros",
    en: "Lighters",
    tagline: {
      pt: "L'Art du Feu — o icónico «cling» de 1941, reinventado a cada modelo.",
      en: "L'Art du Feu — the iconic 'cling' since 1941, reimagined in every model.",
    },
  },
  escrita: {
    pt: "Escrita",
    en: "Writing",
    tagline: {
      pt: "L'Art de l'Écriture — instrumentos que celebram o gesto e a matéria.",
      en: "L'Art de l'Écriture — instruments that celebrate gesture and material.",
    },
  },
  writing: {
    pt: "Escrita",
    en: "Writing",
    tagline: {
      pt: "L'Art de l'Écriture — instrumentos que celebram o gesto e a matéria.",
      en: "L'Art de l'Écriture — instruments that celebrate gesture and material.",
    },
  },
  pele: {
    pt: "Pele",
    en: "Leather",
    tagline: {
      pt: "L'Art du Voyage — pele nobre trabalhada nas oficinas de Faverges.",
      en: "L'Art du Voyage — noble leather crafted in the Faverges workshops.",
    },
  },
  leather: {
    pt: "Pele",
    en: "Leather",
    tagline: {
      pt: "L'Art du Voyage — pele nobre trabalhada nas oficinas de Faverges.",
      en: "L'Art du Voyage — noble leather crafted in the Faverges workshops.",
    },
  },
  acessorios: {
    pt: "Acessórios",
    en: "Accessories",
    tagline: {
      pt: "L'Art de l'Accessoire — os complementos que dão continuidade ao estilo.",
      en: "L'Art de l'Accessoire — the accents that complete the look.",
    },
  },
  accessories: {
    pt: "Acessórios",
    en: "Accessories",
    tagline: {
      pt: "L'Art de l'Accessoire — os complementos que dão continuidade ao estilo.",
      en: "L'Art de l'Accessoire — the accents that complete the look.",
    },
  },
};

export default async function CategoryOpengraphImage({
  params,
}: {
  params: { lang: string; category: string };
}) {
  const lang = params.lang === "en" ? "en" : "pt";
  const cat = CATEGORY_LABEL[params.category] ?? {
    pt: params.category,
    en: params.category,
    tagline: { pt: "S.T. Dupont", en: "S.T. Dupont" },
  };
  const tagline =
    lang === "pt" ? "Maison de luxe française" : "French luxury Maison";

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          backgroundColor: OG_TOKENS.ink,
          backgroundImage: `radial-gradient(circle at 30% 20%, ${OG_TOKENS.navy} 0%, transparent 55%), radial-gradient(circle at 80% 90%, ${OG_TOKENS.navy} 0%, transparent 50%)`,
          color: OG_TOKENS.cream,
          fontFamily: "serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 32,
            left: 32,
            right: 32,
            bottom: 32,
            border: `1px solid ${OG_TOKENS.gold}`,
            opacity: 0.55,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 60,
            left: 72,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: 30,
              letterSpacing: 6,
              color: OG_TOKENS.cream,
              textTransform: "uppercase",
            }}
          >
            S.T. Dupont
          </span>
          <span
            style={{
              fontSize: 14,
              letterSpacing: 3,
              color: OG_TOKENS.goldSoft,
              textTransform: "uppercase",
            }}
          >
            {tagline}
          </span>
        </div>

        <div
          style={{
            marginTop: "auto",
            marginBottom: 100,
            marginLeft: 72,
            marginRight: 72,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <span
            style={{
              fontSize: 15,
              letterSpacing: 4,
              color: OG_TOKENS.gold,
              textTransform: "uppercase",
            }}
          >
            {lang === "pt" ? "Coleção" : "Collection"}
          </span>
          <span
            style={{
              fontSize: 96,
              lineHeight: 1.05,
              color: OG_TOKENS.cream,
            }}
          >
            {cat[lang]}
          </span>
          <span
            style={{
              fontSize: 26,
              lineHeight: 1.35,
              color: OG_TOKENS.cream,
              opacity: 0.8,
              marginTop: 8,
              maxWidth: 900,
            }}
          >
            {cat.tagline[lang]}
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
