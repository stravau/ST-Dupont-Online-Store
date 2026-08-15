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
      {/* Imagem de campanha. Prende-se exactamente por baixo da navbar e
          estende-se até ao fundo do ecrã: `top: --nav-h` + `height:
          --below-nav` (ambas no globals.css, já a contar com o zoom: 0.9 do
          body). Altura inteira também no telemóvel: com meio ecrã o centro da
          foto — onde assenta o título — caía na faixa por onde o bloco cream
          sobe, e o título era cortado a meio logo aos primeiros 150px. */}
      <div className="sticky top-[var(--nav-h)] z-0 h-[var(--below-nav)]">
        <Image
          src={image}
          alt=""
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
          priority={false}
        />
        {/* No telemóvel o texto vive sobre a imagem, centrado ao meio dela.
            Corpo contido e com espaçamento largo — em tamanho grande e cerrado
            lia-se como manchete de jornal, não como assinatura de campanha.
            O véu é mais cerrado ao centro e alivia nas pontas: garante o
            contraste onde as letras assentam sem apagar a fotografia toda. */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-ink/25 via-ink/70 to-ink/25 px-8 text-center text-cream lg:hidden">
          <p className="overline text-[0.55rem] text-gold-soft">{eyebrow}</p>
          <h2 className="mt-3 max-w-[16rem] font-serif text-[1.35rem] font-normal leading-snug tracking-[0.04em]">
            {title}
          </h2>
          <div className="gold-rule mt-4" />
        </div>
      </div>

      {/* Texto + produtos. `relative z-10` + fundo opaco para que, no
          telemóvel, este bloco passe à frente da imagem em vez de a revelar. */}
      <div className="relative z-10 bg-cream">
        <div className="hidden px-10 pt-28 xl:px-16 lg:block">
          <p className="overline">{eyebrow}</p>
          <h2 className="font-editorial-caps mt-5 text-3xl leading-tight text-ink">{title}</h2>
          <div className="gold-rule mt-7" />
          <p className="font-editorial mt-7 max-w-md leading-relaxed text-muted">{body}</p>
        </div>

        {/* Mobile: o texto de apoio fica aqui (o título já está sobre a foto). */}
        <p className="font-editorial px-6 pt-10 leading-relaxed text-muted lg:hidden">{body}</p>

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
