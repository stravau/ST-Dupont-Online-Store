"use client";

import { Fragment, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { BOUTIQUE_SHORT } from "@/components/admin/boutique-scope";
import {
  IconDashboard,
  IconList,
  IconUpload,
  IconAudit,
  IconPos,
  IconReports,
  IconCalendar,
  IconRepair,
  IconSignOut,
} from "@/components/admin/icons";

interface NavItem {
  href: string;
  label: string;
  hint: string; // uma linha a dizer o que a secção tem
  Icon: (p: { className?: string }) => React.ReactElement;
}

// Secções filtradas por papel. O patrão (ADMIN) vê tudo; os logins de loja
// (LOJA_LIS / LOJA_VNG) recebem só o que serve a quem está ao balcão —
// registar uma venda, ver relatórios, consultar catálogo e stock. Painel,
// importações e auditoria ficam do lado do patrão.
// Cada area e uma COLUNA no cabecalho, e as suas filas sao filas mesmo: a do
// Catalogo e 2+1, a da Loja e 3+2, com a fila de baixo centrada em relacao a
// de cima. As areas de um botao so — Geral e Sistema — recebem-no maior e
// centrado a meio da altura que as outras ocupam.
interface Section {
  title: string;
  /** Filas de botoes. Cada fila centra-se sobre a anterior. */
  rows: NavItem[][];
  /** Botao unico, maior, centrado verticalmente contra as areas de duas filas. */
  solo?: boolean;
  /** Destino principal: bloco rectangular a esquerda, a ocupar a altura toda
   *  da faixa. E o unico que nao e pastilha — a forma diz que nao esta ao
   *  mesmo nivel dos outros, e evita ter de o procurar entre iguais. */
  hero?: boolean;
}

function sectionsFor(role?: string): Section[] {
  const isAdmin = role === "ADMIN";
  const sections: Section[] = [];

  if (isAdmin) {
    sections.push({
      title: "Geral",
      hero: true,
      rows: [[{ href: "/admin", label: "Painel", hint: "Visão geral do negócio", Icon: IconDashboard }]],
    });
  }

  sections.push({
    title: "Catálogo",
    rows: [
      [
        { href: "/admin/variants", label: "Stock", hint: "Preços, stock e estado", Icon: IconList },
        { href: "/admin/uploads", label: "Importar", hint: "Sincronizar Excel ECI Controlo", Icon: IconUpload },
      ],
      ...(isAdmin
        ? [[{ href: "/admin/nao-mapeados", label: "Sem ficha", hint: "Stock que não aparece no site", Icon: IconList }]]
        : []),
    ],
  });

  sections.push({
    title: "Loja",
    rows: [
      [
        { href: "/admin/pos", label: "Vender", hint: "Registar venda por código de barras", Icon: IconPos },
        { href: "/admin/movimentos", label: "Movimentos", hint: "Entradas e saídas por scan", Icon: IconPos },
        { href: "/admin/relatorios", label: "Relatórios", hint: "Vendas, comissão e mais vendidos", Icon: IconReports },
      ],
      [
        { href: "/admin/relatorio-vendas", label: "Vendas do Dia", hint: "Escolher um dia e exportar Excel", Icon: IconCalendar },
        { href: "/admin/reparacoes", label: "Reparações", hint: "Assistência e pós-venda", Icon: IconRepair },
      ],
    ],
  });

  if (isAdmin) {
    sections.push({
      title: "Site",
      // Os dois carrosseis da homepage vivem na mesma pagina, em separadores.
      // Aqui aparecem como dois destinos porque e assim que se pensa neles.
      rows: [
        [{ href: "/admin/destaques?tab=novidades", label: "Novidades", hint: "Carril de novidades da homepage", Icon: IconList }],
        [{ href: "/admin/destaques", label: "Em Destaque", hint: "Faixa em destaque da homepage", Icon: IconList }],
      ],
    });
    sections.push({
      title: "Sistema",
      solo: true,
      rows: [[{ href: "/admin/audit", label: "Auditoria", hint: "Registo de todas as alterações", Icon: IconAudit }]],
    });
  }

  return sections;
}

// A boutique por baixo do wordmark, conforme o login. O patrão vê as duas
// concessões; cada loja vê só a sua.
function locationFor(role?: string): string {
  if (role === "LOJA_VNG") return "El Corte Inglés · Vila Nova de Gaia";
  if (role === "ADMIN") return "El Corte Inglés · Lisboa e Vila Nova de Gaia";
  return "El Corte Inglés · Lisboa";
}

/**
 * Cabeçalho do painel — duas faixas sobre branco.
 *
 * A de cima identifica (marca, boutique, sessão). A de baixo navega, com as
 * áreas separadas e visíveis em vez de escondidas atrás de menus: no balcão
 * conta menos cliques, e ver tudo de uma vez vale mais do que poupar espaço.
 *
 * Os botões são pastilhas claras com contorno, e a activa inverte para tinta
 * cheia — o contraste diz onde se está sem precisar de cor de sublinhado.
 */
export function AdminHeader({
  email,
  role,
  signOutAction,
}: {
  email: string;
  role?: string;
  signOutAction: () => Promise<void>;
}) {
  // O cabecalho mede-se e publica a propria altura em --admin-header-h. Tudo
  // o que dentro do painel tambem e sticky encosta-se a essa variavel. Medido
  // em vez de escrito a mao porque o html esta a 19px e o body tem zoom 0.9 —
  // qualquer constante ficaria errada a primeira mudanca de tipo ou de padding.
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const publica = () =>
      document.documentElement.style.setProperty("--admin-header-h", `${el.offsetHeight}px`);
    publica();
    const ro = new ResizeObserver(publica);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pathname = usePathname();
  const search = useSearchParams();
  const isActive = (href: string) => {
    const [path, qs] = href.split("?");
    if (path === "/admin") return pathname === "/admin";
    if (!pathname.startsWith(path)) return false;
    // Novidades e Em Destaque partilham a mesma pagina e distinguem-se pelo
    // separador, por isso aqui — e SO aqui — o ?tab= tambem conta. Sem isto,
    // estando em Novidades ficava aceso o botao errado.
    //
    // Noutras paginas o tab e um filtro interno (/admin/variants?tab=outras) e
    // o botao deve continuar aceso na mesma, por isso a regra nao e geral.
    if (path === "/admin/destaques") {
      const alvo = new URLSearchParams(qs ?? "").get("tab") ?? "destaques";
      return (search.get("tab") ?? "destaques") === alvo;
    }
    return true;
  };
  // A loja escolhida viaja com o utilizador. Sem isto, o filtro do cabecalho
  // era um filtro de pagina disfarcado de global: escolhia-se Lisboa nos
  // Relatorios e ao clicar em Reparacoes voltava a Geral sem aviso.
  const boutique = search.get("boutique");
  const comBoutique = (href: string) => {
    if (!boutique || boutique === "all") return href;
    const [path, qs] = href.split("?");
    const q = new URLSearchParams(qs ?? "");
    q.set("boutique", boutique);
    return `${path}?${q}`;
  };

  // Trocar de loja preserva tudo o resto da query — mes, intervalo de datas,
  // pagina. Quem esta a ver Marco em Lisboa e muda para Gaia quer Marco em
  // Gaia, nao Marco perdido.
  const hrefLoja = (v: string) => {
    const q = new URLSearchParams(search.toString());
    if (v === "all") q.delete("boutique");
    else q.set("boutique", v);
    const s = q.toString();
    return s ? `${pathname}?${s}` : pathname;
  };

  const sections = sectionsFor(role);
  const home = role === "ADMIN" ? "/admin" : "/admin/pos";

  // As três lojas empilhadas. É a coluna mais alta da faixa, e é ela que passa
  // a mandar na altura do cabeçalho — o Painel estica-se até lá e as áreas de
  // duas filas centram-se contra ela.
  //
  // Mesma cor dos destinos, e não a dourada que tinha antes: o filtro deixou
  // de ser um controlo avulso dentro de cada página e passou a ser contexto do
  // painel inteiro, ao lado do Painel. Duas linguagens visuais ali lado a lado
  // liam-se como duas coisas diferentes quando já são a mesma.
  //
  // Só para o patrão: um login de loja tem uma boutique só, e o filtro seria
  // um botão único e inerte.
  const filtroLoja =
    role !== "ADMIN" ? null : (
      <div className="flex shrink-0 items-stretch gap-4 sm:gap-6">
        <span aria-hidden className="hidden w-px shrink-0 bg-line sm:block" />
        <div className="flex shrink-0 flex-col">
          <p className="mb-1.5 px-1 text-center text-[0.56rem] font-semibold tracking-[0.16em] text-muted uppercase sm:text-left">
            Boutique
          </p>
          <div role="group" aria-label="Filtrar por loja" className="flex flex-1 flex-col gap-1.5">
            {[
              { v: "all", label: "Geral" },
              { v: "LIS", label: BOUTIQUE_SHORT.LIS },
              { v: "VNG", label: BOUTIQUE_SHORT.VNG },
            ].map((o) => {
              const activa = (boutique ?? "all") === o.v;
              return (
                <Link
                  key={o.v}
                  href={hrefLoja(o.v)}
                  aria-current={activa ? "true" : undefined}
                  className={`inline-flex min-h-[34px] flex-1 items-center justify-center rounded-full px-3 py-1.5 text-[0.78rem] font-medium whitespace-nowrap transition-colors ${
                    activa
                      ? "bg-ink text-cream shadow-sm"
                      : "border border-line bg-paper text-ink hover:border-gold hover:text-gold"
                  }`}
                >
                  {o.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    );

  return (
    <header ref={ref} className="sticky top-0 z-40 border-b border-line bg-paper">
      {/* Faixa de identidade */}
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-7">
        <Link href={home} className="group flex min-w-0 items-baseline gap-3">
          <span className="font-serif text-xl leading-none text-ink">S.T. Dupont</span>
          <span className="hidden truncate text-[0.63rem] tracking-[0.16em] text-muted uppercase sm:block">
            {locationFor(role)}
          </span>
        </Link>

        <form action={signOutAction} className="flex shrink-0 items-center gap-3">
          <span
            className="hidden max-w-[14rem] truncate text-[0.7rem] text-muted md:block"
            title={email}
          >
            {email}
          </span>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-4 py-2 text-[0.7rem] font-medium tracking-[0.12em] text-ink uppercase transition-colors hover:border-gold hover:text-gold"
          >
            <IconSignOut className="h-4 w-4" /> Sair
          </button>
        </form>
      </div>

      {/* Faixa de navegação. Cada área é uma COLUNA, e dentro dela os botões
          organizam-se em filas centradas umas sobre as outras — Catálogo 2+1,
          Loja 3+2. As áreas de um destino só (Geral, Sistema) recebem-no maior
          e centrado a meio da altura que as de duas filas ocupam, para o
          cabeçalho ler como uma linha e não como um degrau. */}
      <div className="border-t border-line/70 bg-cream/40">
        <nav className="mx-auto flex w-full max-w-[1600px] flex-wrap items-stretch justify-center gap-y-4 px-4 py-3 sm:justify-between sm:px-7">
          {sections.map((sec, i) => (
            <Fragment key={sec.title}>
              {/* O filtro de loja entra logo a seguir ao Painel: é o contexto
                  em que tudo o resto é lido, e por isso vive ao lado do
                  destino principal e não perdido no fim da fila. */}
              {i === 1 && filtroLoja}
            <div className="flex shrink-0 items-stretch gap-4 sm:gap-6">
              {i > 0 && <span aria-hidden className="hidden w-px shrink-0 bg-line sm:block" />}
              <div className="flex shrink-0 flex-col">
                <p className="mb-1.5 px-1 text-center text-[0.56rem] font-semibold tracking-[0.16em] text-muted uppercase sm:text-left">
                  {sec.title}
                </p>
                {/* justify-center no eixo vertical: é o que põe o botão solitário
                    a meio das duas filas do lado, em vez de encostado ao topo. */}
                <div className={`flex flex-1 flex-col gap-1.5 ${sec.hero ? "" : "justify-center"}`}>
                  {sec.rows.map((row, r) => (
                    <ul key={r} className={`flex justify-center gap-1.5 ${sec.hero ? "flex-1 items-stretch" : "items-center"}`}>
                      {row.map((it) => {
                        const active = isActive(it.href);
                        return (
                          <li key={it.href} className={sec.hero ? "flex flex-1" : undefined}>
                            <Link
                              href={comBoutique(it.href)}
                              aria-current={active ? "page" : undefined}
                              title={it.hint}
                              className={`inline-flex items-center justify-center gap-1.5 font-medium whitespace-nowrap transition-colors ${
                                sec.hero
                                  ? "h-full w-full rounded-xl px-6 py-3 text-[0.95rem] font-semibold"
                                  : sec.solo
                                    ? "min-h-[52px] rounded-full px-5 py-3 text-[0.86rem]"
                                    : "min-h-[38px] rounded-full px-3 py-2 text-[0.78rem]"
                              } ${
                                active
                                  ? "bg-ink text-cream shadow-sm"
                                  : "border border-line bg-paper text-ink hover:border-gold hover:text-gold"
                              }`}
                            >
                              <it.Icon
                                className={
                                  sec.hero ? "h-5 w-5 shrink-0" : sec.solo ? "h-[18px] w-[18px] shrink-0" : "h-4 w-4 shrink-0"
                                }
                              />
                              {it.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  ))}
                </div>
              </div>
            </div>
            </Fragment>
          ))}
        </nav>
      </div>
    </header>
  );
}
