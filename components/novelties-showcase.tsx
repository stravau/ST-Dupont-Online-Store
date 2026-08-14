import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

// Novidades — imagem de campanha fixa a meia página, texto e produtos a correr
// ao lado. Reproduz a mecânica do site oficial: a coluna da imagem é
// `sticky top-0 h-screen`, portanto acompanha o scroll enquanto a coluna da
// direita corre e liberta-se sozinha quando a secção acaba.
//
// A mesma marcação serve os dois tamanhos, sem duplicar os cartões:
//   • lg+   → duas colunas; a imagem prende-se ao topo do ecrã.
//   • mobile → sem grelha, a imagem prende-se por baixo da navbar (que é
//     `sticky top-0` com 5rem/6rem) e o bloco de conteúdo, opaco e por cima,
//     sobe à frente dela. Os produtos passam a um carril de scroll lateral.
export function NoveltiesShowcase({
  items,
  image,
  eyebrow,
  title,
  body,
  ctaLabel,
  ctaHref,
}: {
  items: ReactNode[];
  image: string;
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  if (items.length === 0) return null;

  return (
    <section className="bg-cream lg:grid lg:grid-cols-2">
      {/* Imagem de campanha */}
      <div className="sticky top-20 z-0 h-[58vh] sm:top-24 lg:top-0 lg:h-screen">
        <Image
          src={image}
          alt=""
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
          priority={false}
        />
        {/* No telemóvel o texto vive sobre a imagem; o véu garante que se lê
            por cima da água clara da fotografia. */}
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-ink/85 via-ink/35 to-transparent px-6 pb-10 text-cream lg:hidden">
          <p className="overline text-gold-soft">{eyebrow}</p>
          <h2 className="mt-3 font-serif text-3xl leading-tight">{title}</h2>
        </div>
      </div>

      {/* Texto + produtos. `relative z-10` + fundo opaco para que, no
          telemóvel, este bloco passe à frente da imagem em vez de a revelar. */}
      <div className="relative z-10 bg-cream">
        <div className="hidden px-10 pt-28 xl:px-16 lg:block">
          <p className="overline">{eyebrow}</p>
          <h2 className="mt-5 font-serif text-4xl leading-tight text-ink">{title}</h2>
          <div className="gold-rule mt-7" />
          <p className="mt-7 max-w-md text-muted">{body}</p>
        </div>

        {/* Mobile: o texto de apoio fica aqui (o título já está sobre a foto). */}
        <p className="px-6 pt-10 text-muted lg:hidden">{body}</p>

        {/* Produtos — carril lateral no telemóvel, grelha de dois no desktop.
            O carril é scroll nativo: o polegar arrasta na horizontal e a
            página continua a andar na vertical, sem gestos a competir. */}
        <div
          className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-16
                     [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
                     lg:mt-14 lg:grid lg:grid-cols-2 lg:gap-x-6 lg:gap-y-10 lg:overflow-visible lg:px-10 lg:pb-28 xl:px-16"
        >
          {items.map((node, i) => (
            <div key={i} className="w-[70vw] shrink-0 snap-start sm:w-[45vw] lg:w-auto lg:shrink">
              {node}
            </div>
          ))}
        </div>

        {ctaLabel && ctaHref && (
          <div className="px-6 pb-20 lg:px-10 lg:pb-28 xl:px-16">
            <Link
              href={ctaHref}
              className="inline-block border border-ink px-8 py-3.5 text-[0.7rem] tracking-[0.22em] text-ink uppercase transition-colors hover:border-gold hover:bg-gold hover:text-cream"
            >
              {ctaLabel}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
