"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { BOUTIQUE_SHORT } from "@/components/admin/boutique-scope";
import { Logo } from "@/components/logo";
import { ReporteBotao } from "@/components/admin/reporte-botao";
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

type Peso = "primario" | "secundario" | "terciario";

interface NavItem {
  href: string;
  label: string;
  /** Quanto pesa no dia-a-dia. Nem todos os destinos valem o mesmo: quem esta
   *  ao balcao vai a Vender dezenas de vezes por dia e a Auditoria uma vez por
   *  mes, e a interface deve dizer isso sem ninguem ter de aprender. */
  peso?: Peso;
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
        { href: "/admin/variants", label: "Stock", hint: "Preços, stock e estado", Icon: IconList, peso: "secundario" },
        { href: "/admin/uploads", label: "Importar", hint: "Sincronizar Excel ECI Controlo", Icon: IconUpload },
      ],
      ...(isAdmin
        ? [[{ href: "/admin/nao-mapeados", label: "Sem ficha", hint: "Stock que não aparece no site", Icon: IconList }]]
        : []),
    ],
  });

  // O que se FAZ ao balcao, separado do que se CONSULTA depois. Estavam juntos
  // numa "Loja" de tres filas, e os relatorios — que sao de leitura, e mais do
  // fim do dia — ficavam no meio de duas filas de registo.
  sections.push({
    title: "Loja",
    rows: [
      [
        { href: "/admin/pos", label: "Vender", hint: "Registar venda por código de barras", Icon: IconPos, peso: "primario" },
        { href: "/admin/movimentos", label: "Movimentos", hint: "Entradas e saídas por scan", Icon: IconPos, peso: "secundario" },
      ],
      [
        { href: "/admin/reparacoes", label: "Reparações", hint: "Assistência e pós-venda", Icon: IconRepair },
      ],
    ],
  });

  sections.push({
    title: "Relatórios",
    rows: [
      [
        // As vendas do dia a frente: e o que se abre todos os dias ao fechar.
        { href: "/admin/relatorio-vendas", label: "Vendas do Dia", hint: "Escolher um dia e exportar Excel", Icon: IconCalendar, peso: "primario" },
        // A dica nao fala de comissao: as lojas veem este menu e a comissao
        // ECI nao e informacao delas — ate o relatorio ja lha esconde.
        { href: "/admin/relatorios", label: "Relatórios", hint: "Vendas e mais vendidos", Icon: IconReports, peso: "secundario" },
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
      rows: [
        [{ href: "/admin/audit", label: "Auditoria", hint: "Registo de todas as alterações", Icon: IconAudit }],
        [{ href: "/admin/reportes", label: "Problemas", hint: "Reportes das lojas e falhas automáticas", Icon: IconAudit }],
      ],
    });
  }

  // As filas so existem para caber. O patrao tem onze destinos e cinco areas,
  // e ai partir a Loja em 2/2/1 mantem a faixa baixa; um login de loja tem
  // seis, cabem todos numa linha, e mante-los empilhados era desenhar para um
  // aperto que nao existe. Achata-se.
  if (!isAdmin) {
    return sections.map((s) => ({ ...s, rows: [s.rows.flat()] }));
  }

  return sections;
}

/**
 * O aspecto de uma pastilha, conforme o estado e o peso.
 *
 * Activo ganha sempre: branco solido, 15,6:1. Onde se esta e mais importante
 * do que para onde se pode ir.
 *
 * Depois os tres pesos. Primario cheio a champanhe (5,0:1) — e o Vender, e ve-se
 * de longe. Secundario a contorno (13,5:1). Terciario sem contorno nenhum
 * (7,0:1), presente mas sem reclamar atencao. Todos passam AA com folga: o que
 * muda e a proeminencia, nunca a legibilidade.
 */
function estado(activo: boolean, peso?: Peso): string {
  if (activo) return "bg-paper text-ink shadow-sm";
  if (peso === "primario") return "bg-gold-soft/90 text-ink hover:bg-gold-soft";
  if (peso === "secundario") return "border border-cream/35 text-cream hover:border-gold-soft hover:text-gold-soft";
  // Terciario TEM contorno, so que fraco. Sem contorno nenhum deixava de se
  // ler como hierarquia e passava a ler-se como defeito: dentro do mesmo
  // grupo ficavam botoes com e sem caixa, e o olho le isso como coisa
  // partida, nao como "este importa menos". A diferenca vive na forca da
  // linha e na do texto, nao na sua ausencia.
  return "border border-cream/25 text-cream/90 hover:border-gold-soft hover:text-gold-soft";
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
  // Abre por hover E por foco. Um menu so-de-rato deixa de fora quem navega
  // por teclado, e o fecho tem folga de 220ms para o rato poder atravessar do
  // titulo ate ao painel sem o perder pelo caminho — mesma mecanica do
  // mega-menu da loja.
  const [aberto, setAberto] = useState(false);
  const fecho = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelarFecho = useCallback(() => {
    if (fecho.current) {
      clearTimeout(fecho.current);
      fecho.current = null;
    }
  }, []);
  const abrir = useCallback(() => {
    cancelarFecho();
    setAberto(true);
  }, [cancelarFecho]);
  const agendarFecho = useCallback(() => {
    cancelarFecho();
    fecho.current = setTimeout(() => setAberto(false), 220);
  }, [cancelarFecho]);

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

  // Uma pagina nova nunca herda o painel aberto da anterior.
  useEffect(() => {
    setAberto(false);
  }, [pathname]);

  // Escape fecha — quem abriu por teclado tem de conseguir sair por teclado.
  useEffect(() => {
    if (!aberto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberto(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [aberto]);
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

  // Uma lista unica de colunas — titulo, se esta activa, e o corpo. Antes a
  // faixa fechada e o painel aberto construiam a sua propria lista, e a ordem
  // divergia: a Boutique aparecia em segundo no painel e em ultimo na faixa.
  // Com uma fonte so, isso deixa de poder acontecer.
  const colunas: { title: string; activa: boolean; corpo: React.ReactNode }[] = [];
  const ehPatrao = role === "ADMIN";
  // So o patrao esconde a navegacao. Ele tem cinco areas e onze destinos, e a
  // faixa custa-lhe um quarto do primeiro ecra. Um login de loja tem duas
  // areas numa linha: encolher isso nao devolve espaco nenhum e passa a exigir
  // um gesto para chegar ao que ja estava a vista.
  const colapsavel = ehPatrao;
  const mostraTudo = !colapsavel || aberto;
  const home = ehPatrao ? "/admin" : "/admin/pos";

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
  // So o corpo: o titulo e o filete sao da coluna, como em qualquer outra area.
  const botaoLoja = ({ v, label }: { v: string; label: string }) => {
    const activa = (boutique ?? "all") === v;
    return (
      <Link
        key={v}
        href={hrefLoja(v)}
        aria-current={activa ? "true" : undefined}
        tabIndex={mostraTudo ? undefined : -1}
        className={`inline-flex min-h-[30px] flex-1 items-center justify-center rounded-full px-2.5 py-1 text-[0.78rem] font-medium whitespace-nowrap transition-colors ${
          activa
            ? "bg-paper text-ink shadow-sm"
            : "border border-cream/25 text-cream hover:border-gold-soft hover:text-gold-soft"
        }`}
      >
        {label}
      </Link>
    );
  };

  const filtroLoja =
    role !== "ADMIN" ? null : (
      // Duas filas em vez de tres: o "Geral" em cima, as duas lojas lado a
      // lado por baixo. Empilhadas as tres, esta coluna era a mais alta de
      // todas e puxava a altura do menu inteiro para cima.
      <div role="group" aria-label="Filtrar por loja" className="flex flex-1 flex-col gap-1.5">
        {botaoLoja({ v: "all", label: "Geral" })}
        <div className="flex flex-1 gap-1.5">
          {botaoLoja({ v: "LIS", label: BOUTIQUE_SHORT.LIS })}
          {botaoLoja({ v: "VNG", label: BOUTIQUE_SHORT.VNG })}
        </div>
      </div>
    );

  // O corpo de uma área de navegação: as suas filas de pastilhas.
  const corpoSeccao = (sec: Section) => (
    <>
      {sec.rows.map((row, r) => (
        <ul key={r} className={`flex justify-center gap-1.5 ${sec.hero ? "flex-1 items-stretch" : "items-center"}`}>
          {row.map((it) => (
            <li key={it.href} className={sec.hero ? "flex flex-1" : undefined}>
              <Link
                href={comBoutique(it.href)}
                aria-current={isActive(it.href) ? "page" : undefined}
                title={it.hint}
                tabIndex={mostraTudo ? undefined : -1}
                className={`inline-flex items-center justify-center gap-1.5 font-medium whitespace-nowrap transition-colors ${
                  sec.hero
                    ? "h-full w-full rounded-xl px-5 py-2 text-[0.9rem] font-semibold"
                    : sec.solo
                      ? "min-h-[40px] rounded-full px-4 py-2 text-[0.84rem]"
                      : "min-h-[34px] rounded-full px-2.5 py-1.5 text-[0.78rem]"
                } ${estado(isActive(it.href), it.peso)}`}
              >
                <it.Icon
                  className={sec.hero ? "h-5 w-5 shrink-0" : sec.solo ? "h-[18px] w-[18px] shrink-0" : "h-4 w-4 shrink-0"}
                />
                {it.label}
              </Link>
            </li>
          ))}
        </ul>
      ))}
    </>
  );

  for (const [i, sec] of sections.entries()) {
    colunas.push({
      title: sec.title,
      activa: sec.rows.flat().some((it) => isActive(it.href)),
      corpo: corpoSeccao(sec),
    });
    // O filtro de loja entra logo a seguir ao Painel: é o contexto em que tudo
    // o resto é lido, e por isso vive ao lado do destino principal.
    if (i === 0 && filtroLoja) {
      colunas.push({ title: "Boutique", activa: false, corpo: filtroLoja });
    }
  }

  return (
    <header ref={ref} className="admin-topo sticky top-0 z-40">
      {/* Faixa de identidade.

          Sem max-width e sem mx-auto DE PROPÓSITO: uma barra centrada num ecrã
          largo deixa duas faixas mortas de centenas de pixels e o logótipo
          fica a boiar. Isto é uma barra de aplicação, não uma página de texto
          — cada extremo encosta ao seu canto, com a folga mínima para não
          tocar no vidro. A mesma folga na linha de navegação por baixo, senão
          o Painel deixa de alinhar com o logótipo. */}
      <div className="flex w-full items-center justify-between gap-4 px-4 py-2 sm:px-5">
        {/* O logótipo oficial em vez do nome escrito à mão. O ficheiro já é
            branco e já tem fundo transparente, por isso entra em variant
            "light" — sem filtro nenhum por cima. O width={520} é o tamanho
            intrínseco que o next/image usa para gerar o srcset; quem manda no
            tamanho no ecrã é a classe w-[...]. priority porque isto está no
            topo de todas as páginas do painel e não deve piscar.

            items-center e não items-baseline: uma imagem tem a linha de base
            no rodapé, e ao lado de texto isso empurrava a localização para
            fora do sítio. */}
        <Link href={home} className="group flex min-w-0 items-center gap-3.5">
          <Logo
            variant="light"
            width={520}
            priority
            className="w-[122px] shrink-0 sm:w-[138px]"
          />
          <span className="hidden truncate text-[0.63rem] tracking-[0.16em] text-cream/60 uppercase sm:block">
            {locationFor(role)}
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-3">
          <form action={signOutAction} className="flex shrink-0 items-center gap-3">
            <span
              className="hidden max-w-[14rem] truncate text-[0.7rem] text-cream/60 md:block"
              title={email}
            >
              {email}
            </span>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full border border-cream/30 px-4 py-2 text-[0.7rem] font-medium tracking-[0.12em] text-cream uppercase transition-colors hover:border-gold-soft hover:text-gold-soft"
            >
              <IconSignOut className="h-4 w-4" /> Sair
            </button>
          </form>
          {/* Depois do Sair, e nao antes: o Sair remata a faixa de identidade,
              e o reporte e um extra que nao deve empurrar o resto para dentro. */}
          <ReporteBotao />
        </div>
      </div>

      {/* O alinhamento depende de quem entrou, porque as duas vistas não têm
          nada a ver uma com a outra.

          O patrão tem cinco áreas e onze destinos que quase enchem a linha:
          distribuem-se por ela e ocupam-na toda, com o espaço que sobra
          repartido pelas fronteiras.

          Um login de loja tem duas áreas e seis destinos. Distribuí-las
          atirava-as para os extremos opostos, com meia tela de vazio no meio —
          foi o que aconteceu quando esta regra era única. Centradas, a margem
          reparte-se pelos dois lados e o bloco fica coeso.

          Cada área é uma COLUNA, e dentro dela os botões
          organizam-se em filas centradas umas sobre as outras — Catálogo 2+1,
          Loja 3+2. As áreas de um destino só (Geral, Sistema) recebem-no maior
          e centrado a meio da altura que as de duas filas ocupam, para o
          cabeçalho ler como uma linha e não como um degrau. */}
      {/* Uma estrutura só, não duas. A faixa fechada e o painel aberto são o
          MESMO markup: os títulos estão sempre lá, no mesmo sítio, e o que
          muda é a altura da zona dos botões. Assim a ordem das áreas não pode
          divergir entre os dois estados — divergia, porque eram duas listas —
          e a abertura constrói-se a partir do que já se via em vez de deslizar
          uma coisa por cima de outra.

          O bloco todo é `absolute`, e a altura da faixa vem de um espaçador
          invisível. Sem isso o cabeçalho crescia a cada passagem do rato e
          tudo o que está preso por baixo dele — a barra de selecção do stock,
          os painéis laterais do POS e dos relatórios — saltava.

          As colunas mantêm a largura dos botões mesmo fechadas, porque os
          botões continuam no fluxo horizontal; só a altura é que colapsa. É o
          que faz os títulos ficarem exactamente onde estavam ao abrir. */}
      <div
        className={`relative border-t border-white/10 ${aberto ? "" : "bg-white/[0.03]"}`}
        onMouseEnter={colapsavel ? abrir : undefined}
        onMouseLeave={colapsavel ? agendarFecho : undefined}
        onFocusCapture={colapsavel ? abrir : undefined}
        onBlurCapture={colapsavel ? agendarFecho : undefined}
      >
        {/* Espaçador — dá à faixa a altura de uma linha de título e mais nada. */}
        {colapsavel && (
          <div aria-hidden className="invisible px-4 py-2 sm:px-5">
            <span className="block text-[0.56rem] font-semibold tracking-[0.12em] uppercase">A</span>
          </div>
        )}

        <div
          className={
            colapsavel
              ? `absolute inset-x-0 top-0 z-10 border-white/10 transition-shadow duration-300 ${
                  aberto ? "admin-topo border-b border-gold/35 shadow-2xl" : ""
                }`
              : ""
          }
        >
          <nav
            // items-stretch e nao items-start: com o start cada coluna ficava
            // com a sua altura natural, e o botao do Painel — que e `h-full`
            // dentro de um `flex-1` — nao tinha altura nenhuma para encher. Com
            // stretch todas as colunas ficam a altura da mais alta e o Painel
            // aproveita o espaco todo, alinhado com as outras.
            // O gap-x encolhe a partir do sm, ao contrario do costume, e de
            // proposito: abaixo do sm as divisorias estao escondidas e o gap E
            // a separacao entre colunas; a partir do sm a divisoria fica no MEIO
            // de dois gaps, portanto cada metade tem de valer metade, senao o
            // espaco entre colunas duplicava e a faixa deixava de caber num
            // portatil de 1280. Onde sobra largura, o justify-between alarga-os
            // por igual e o aspecto e o mesmo.
            className={`flex w-full items-stretch gap-x-2 gap-y-3 px-3 pt-2 pb-2.5 sm:gap-x-1.5 sm:px-4 ${
              // flex-wrap tambem no patrao. Sao sete areas com shrink-0: o
              // que nao cabia era cortado em silencio, e a Auditoria e os
              // Problemas ficavam metade fora do ecra. A envolver, num ecra
              // estreito passam a linha de baixo em vez de desaparecerem.
              ehPatrao ? "flex-wrap sm:justify-between" : "flex-wrap justify-center"
            }`}
          >
            {colunas.map((col, i) => (
              // A divisoria e IRMA das colunas, nao filha da coluna da direita.
              // Enquanto estava dentro dela, o espaco livre que o
              // justify-between reparte caia todo antes do risco e nenhum
              // depois: ficava colado a coluna seguinte, e num ecra largo — em
              // que ha muito espaco a repartir — via-se logo que nao estava a
              // meio. Como item da faixa, o justify-between da-lhe a mesma
              // folga dos dois lados e ela centra-se sozinha, seja qual for a
              // largura. O espacamento minimo passa a ser do <nav> (gap-x).
              <Fragment key={col.title}>
                {i > 0 && (
                  <span
                    aria-hidden
                    className={`hidden w-px shrink-0 self-stretch bg-white/[0.07] transition-opacity duration-300 sm:block ${
                      mostraTudo ? "opacity-100" : "opacity-0"
                    }`}
                  />
                )}
                <div className="flex shrink-0 flex-col">
                  <p
                    className={`px-1 text-center text-[0.56rem] font-semibold tracking-[0.12em] uppercase transition-colors sm:text-left ${
                      col.activa ? "text-gold-soft" : "text-cream/50"
                    }`}
                  >
                    {col.title}
                  </p>
                  {/* A zona que cresce. max-height animada em vez de display,
                      para haver o que animar; overflow-hidden para os botões
                      não assomarem enquanto ela está fechada. */}
                  <div
                    className={`flex-1 overflow-hidden transition-all duration-300 ease-out ${
                      mostraTudo ? "mt-1.5 max-h-40 opacity-100" : "mt-0 max-h-0 opacity-0"
                    }`}
                  >
                    <div className="flex h-full flex-col justify-center gap-1.5">{col.corpo}</div>
                  </div>
                </div>
              </Fragment>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
