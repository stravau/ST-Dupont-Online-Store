// Lightweight bilingual i18n (PT default, EN) — no external dependency.
// Server components read `params.lang`; UI strings come from `getDictionary`.

export const locales = ["pt", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "pt";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

const dictionaries = {
  pt: {
    nav: { lighters: "Isqueiros", writing: "Escrita", leather: "Pele", accessories: "Acessórios", search: "Pesquisar", collections: "Coleções", viewAll: "Ver tudo", about: "Sobre Nós", backHome: "Início", store: "Loja", products: "Produtos" },
    common: { home: "Início", available: "Disponível", back: "Voltar" },
    notFound: {
      title: "Página não encontrada",
      body: "A página que procura já não existe ou foi movida. Explore as nossas coleções.",
      cta: "Voltar à Maison",
    },
    collection: {
      title: "A Coleção",
      subtitle: "Toda a maison, casa a casa.",
      jumpTo: "Navegar",
    },
    categoryStory: "A Arte da Casa",
    sort: {
      label: "Ordenar por",
      featured: "Destaques",
      "price-asc": "Preço: do mais baixo ao mais alto",
      "price-desc": "Preço: do mais alto ao mais baixo",
      newest: "Mais recentes",
      name: "Nome (A–Z)",
    },
    search: {
      placeholder: "Pesquisar na maison…",
      title: "Pesquisa",
      resultsFor: "Resultados para",
      count: "resultado(s)",
      noResults: "Nenhum artigo encontrado. Tente outra pesquisa.",
      submit: "Pesquisar",
      start: "Comece a escrever para descobrir a maison.",
      searching: "A pesquisar…",
      viewAll: "Ver todos os resultados",
    },
    hero: {
      eyebrow: "Est. 1872 · Paris",
      title: "L’Art du Briquet",
      subtitle: "A arte francesa do luxo, desde o gesto mais íntimo ao detalhe mais raro.",
      cta: "Descobrir a Coleção",
    },
    sections: {
      categories: "As Nossas Casas",
      novelties: "Novidades",
      noveltyTag: "Novo",
      noveltiesSub: "As mais recentes criações da maison",
      heritageEyebrow: "A Maison",
      heritageTitle: "A marca por trás de reis, rainhas e estadistas",
      heritageBody:
        "Desde 1872, a S.T. Dupont define o requinte francês — isqueiros, instrumentos de escrita e peças em pele concebidos como objetos de uma vida inteira, feitos à mão nas oficinas de Faverges.",
      heritageCta: "A Nossa História",
      boutiqueEyebrow: "Boutique",
      boutiqueTitle: "Visite-nos em Lisboa",
      boutiqueBody: "Aconselhamento personalizado e serviços de personalização exclusivos.",
    },
    product: {
      from: "Desde",
      viewProduct: "Ver Produto",
      finishes: "Acabamentos",
      selectFinish: "Selecione o acabamento",
      typeLabel: "Tipo",
      selectType: "Selecione o tipo",
      colorLabel: "Cor",
      selectColor: "Selecione a cor",
      sizeLabel: "Tamanho",
      selectSize: "Selecione o tamanho",
      heritage: "A História da Linha",
      backToCategory: "Voltar",
      deliveryBy: "Entrega em Portugal até",
      returns: "Devoluções gratuitas em 14 dias",
      lifetime: "Serviço e manutenção vitalícios",
      personalisation: "Personalização e gravação na boutique",
      needHelp: "Precisa de ajuda?",
      findStore: "Encontrar loja",
      // Consultation / inquiry
      inquire: "Pedir Informação",
      bookConsultation: "Marcar Consulta",
      byAppointment: "Atendimento por marcação · consulta presencial na boutique",
      priceNote: "Preço indicativo · confirmado em consulta",
      inquireSubject: "Pedido de informação · {title}",
      inquireBody:
        "Bom dia,\n\nGostaria de receber mais informações sobre o seguinte artigo:\n\n— Artigo: {title}\n— Referência: {ref}\n— Colorway: {color}\n— Tamanho: {size}\n\nPretendo também marcar uma consulta presencial, se possível.\n\nObrigado(a),\n",
      specs: "Detalhes & Especificações",
    },
    consultation: {
      eyebrow: "Atendimento por marcação",
      title: "Uma consulta presencial na boutique",
      lede:
        "A maison S.T. Dupont apresenta-se em consulta privada — uma conversa com um conselheiro da casa, em torno das peças, dos acabamentos e dos serviços de personalização exclusivos. Cada consulta é única, pensada para o seu projeto.",
      bookCta: "Marcar Consulta",
      callCta: "Falar com a boutique",
      pillarsTitle: "O que esperar",
      pillars: [
        {
          title: "Conselho de especialista",
          body:
            "Apresentação aprofundada da coleção, das matérias e dos savoir-faire da Maison, com tempo para experimentar.",
        },
        {
          title: "Personalização e gravação",
          body:
            "Gravação fina, escolha de acabamentos e serviços de personalização — tudo coordenado pela boutique.",
        },
        {
          title: "Serviço vitalício",
          body:
            "Revisão, manutenção e reparação dos seus objetos S.T. Dupont na boutique, durante toda a sua vida.",
        },
      ],
      howTitle: "Como funciona",
      steps: [
        "Envie-nos um email com o seu interesse — peça, ocasião, data preferida.",
        "Um conselheiro da boutique confirma o horário e prepara a apresentação.",
        "É recebido na boutique, em Lisboa, para uma consulta privada de cerca de 45 minutos.",
      ],
      bookSubject: "Pedido de consulta presencial",
      bookBody:
        "Bom dia,\n\nGostaria de marcar uma consulta presencial na boutique S.T. Dupont em Lisboa.\n\n— Data/hora preferida:\n— Interesse principal (isqueiros, escrita, pele, …):\n— Ocasião (oferta, projeto pessoal, gravação, …):\n— Outras notas:\n\nObrigado(a),\n",
      visitTitle: "Visitar a boutique",
      visitBody:
        "Encontra-nos no El Corte Inglés de Lisboa, Av. António Augusto de Aguiar 31, Piso 0.",
      visitCta: "Ver morada e direções",
    },
    footer: {
      tagline: "Maison de luxe française · desde 1872",
      boutique: "Boutique",
      legal: "Informação Legal",
      privacy: "Política de Privacidade",
      terms: "Termos e Condições",
      returns: "Devoluções",
      follow: "Seguir",
      rights: "Todos os direitos reservados.",
      contact: "Contacto",
      official: "Site oficial S.T. Dupont",
      viewStore: "Ver loja e direções",
    },
    store: {
      eyebrow: "Boutique",
      title: "Visite-nos em Lisboa",
      lede: "Aconselhamento personalizado e serviços de personalização exclusivos S.T. Dupont, no coração de Lisboa.",
      addressTitle: "Morada",
      floor: "Piso 0",
      hoursTitle: "Horário",
      hours: [
        { d: "Segunda a Quinta", h: "10:00 – 22:00" },
        { d: "Sexta e Sábado", h: "10:00 – 23:00" },
        { d: "Domingo", h: "10:00 – 20:00" },
      ],
      contactTitle: "Contacto",
      phoneLabel: "Telefone",
      emailLabel: "Email",
      directions: "Obter direções",
      official: "Site oficial: st-dupont.com",
      servicesTitle: "Serviços em loja",
      services: [
        "Personalização",
        "Gravação disponível mediante pedido (serviço externo)",
        "Assistência e manutenção vitalícia",
        "Aconselhamento de especialista",
      ],
      mapTitle: "Como chegar",
      loadMap: "Carregar mapa",
      mapConsent:
        "O mapa é fornecido pelo Google Maps. Ao carregar, poderão ser definidos cookies do Google.",
    },
    legal: {
      backToStore: "Voltar à loja",
      updated: "Última atualização",
      draftNotice:
        "Documento preliminar fornecido como modelo. Deve ser revisto por aconselhamento jurídico e completado com os dados da entidade legal antes do lançamento.",
    },
  },
  en: {
    nav: { lighters: "Lighters", writing: "Writing", leather: "Leather", accessories: "Accessories", search: "Search", collections: "Collections", viewAll: "View all", about: "About Us", backHome: "Home", store: "Store", products: "Products" },
    common: { home: "Home", available: "Available", back: "Back" },
    notFound: {
      title: "Page not found",
      body: "The page you are looking for no longer exists or has moved. Explore our collections.",
      cta: "Back to the Maison",
    },
    collection: {
      title: "The Collection",
      subtitle: "The entire maison, house by house.",
      jumpTo: "Jump to",
    },
    categoryStory: "The House's Craft",
    sort: {
      label: "Sort by",
      featured: "Featured",
      "price-asc": "Price: low to high",
      "price-desc": "Price: high to low",
      newest: "Most recent",
      name: "Name (A–Z)",
    },
    search: {
      placeholder: "Search the maison…",
      title: "Search",
      resultsFor: "Results for",
      count: "result(s)",
      noResults: "No items found. Try another search.",
      submit: "Search",
      start: "Start typing to discover the maison.",
      searching: "Searching…",
      viewAll: "View all results",
    },
    hero: {
      eyebrow: "Est. 1872 · Paris",
      title: "L’Art du Briquet",
      subtitle: "The French art of luxury — from the most intimate gesture to the rarest detail.",
      cta: "Discover the Collection",
    },
    sections: {
      categories: "Our Maisons",
      novelties: "New Arrivals",
      noveltyTag: "New",
      noveltiesSub: "The latest creations from the maison",
      heritageEyebrow: "The Maison",
      heritageTitle: "The brand behind kings, queens and statesmen",
      heritageBody:
        "Since 1872, S.T. Dupont has defined French refinement — lighters, writing instruments and leather pieces conceived as lifetime objects, handcrafted in the Faverges workshops.",
      heritageCta: "Our Story",
      boutiqueEyebrow: "Boutique",
      boutiqueTitle: "Visit us in Lisbon",
      boutiqueBody: "Personalised advice and exclusive customisation services.",
    },
    product: {
      from: "From",
      viewProduct: "View Product",
      finishes: "Finishes",
      selectFinish: "Select finish",
      typeLabel: "Type",
      selectType: "Select type",
      colorLabel: "Colour",
      selectColor: "Select colour",
      sizeLabel: "Size",
      selectSize: "Select size",
      heritage: "The Line's Story",
      backToCategory: "Back",
      deliveryBy: "Delivered in Portugal by",
      returns: "Free 14-day returns",
      lifetime: "Lifetime service & maintenance",
      personalisation: "Personalisation & engraving at the boutique",
      needHelp: "Need help?",
      findStore: "Find a store",
      // Consultation / inquiry
      inquire: "Inquire",
      bookConsultation: "Book a Consultation",
      byAppointment: "By appointment · personal consultation at the boutique",
      priceNote: "Indicative price · confirmed at consultation",
      inquireSubject: "Information request · {title}",
      inquireBody:
        "Hello,\n\nI would like more information about the following item:\n\n— Item: {title}\n— Reference: {ref}\n— Colourway: {color}\n— Size: {size}\n\nI would also like to arrange a personal consultation at the boutique if possible.\n\nThank you,\n",
      specs: "Details & Specifications",
    },
    consultation: {
      eyebrow: "By appointment",
      title: "A private consultation at the boutique",
      lede:
        "S.T. Dupont presents itself by private appointment — a conversation with a Maison adviser around the pieces, the finishes and the exclusive personalisation services. Every consultation is unique, shaped around your project.",
      bookCta: "Book a Consultation",
      callCta: "Talk to the boutique",
      pillarsTitle: "What to expect",
      pillars: [
        {
          title: "Expert advice",
          body:
            "An in-depth presentation of the collection, materials and savoir-faire of the Maison — with time to try each piece.",
        },
        {
          title: "Personalisation & engraving",
          body:
            "Fine engraving, choice of finishes and exclusive personalisation services — all coordinated by the boutique.",
        },
        {
          title: "Lifetime service",
          body:
            "Maintenance, servicing and repair of your S.T. Dupont objects at the boutique, for as long as you own them.",
        },
      ],
      howTitle: "How it works",
      steps: [
        "Send us an email with your interest — piece, occasion, preferred date.",
        "A boutique adviser confirms the slot and prepares the presentation.",
        "You are received at the boutique in Lisbon for a private 45-minute consultation.",
      ],
      bookSubject: "Consultation request",
      bookBody:
        "Hello,\n\nI would like to arrange a private consultation at the S.T. Dupont boutique in Lisbon.\n\n— Preferred date/time:\n— Main interest (lighters, writing, leather, …):\n— Occasion (gift, personal project, engraving, …):\n— Other notes:\n\nThank you,\n",
      visitTitle: "Visit the boutique",
      visitBody:
        "Find us at El Corte Inglés Lisbon, Av. António Augusto de Aguiar 31, Ground floor.",
      visitCta: "View address & directions",
    },
    footer: {
      tagline: "Maison de luxe française · since 1872",
      boutique: "Boutique",
      legal: "Legal",
      privacy: "Privacy Policy",
      terms: "Terms & Conditions",
      returns: "Returns",
      follow: "Follow",
      rights: "All rights reserved.",
      contact: "Contact",
      official: "Official S.T. Dupont site",
      viewStore: "View store & directions",
    },
    store: {
      eyebrow: "Boutique",
      title: "Visit us in Lisbon",
      lede: "Personalised advice and exclusive S.T. Dupont customisation services, in the heart of Lisbon.",
      addressTitle: "Address",
      floor: "Floor 0",
      hoursTitle: "Opening hours",
      hours: [
        { d: "Monday to Thursday", h: "10:00 – 22:00" },
        { d: "Friday & Saturday", h: "10:00 – 23:00" },
        { d: "Sunday", h: "10:00 – 20:00" },
      ],
      contactTitle: "Contact",
      phoneLabel: "Phone",
      emailLabel: "Email",
      directions: "Get directions",
      official: "Official site: st-dupont.com",
      servicesTitle: "In-store services",
      services: [
        "Personalisation",
        "Engraving available on request (off-site)",
        "Lifetime service & maintenance",
        "Expert advice",
      ],
      mapTitle: "Getting here",
      loadMap: "Load map",
      mapConsent:
        "The map is provided by Google Maps. Loading it may set Google cookies.",
    },
    legal: {
      backToStore: "Back to store",
      updated: "Last updated",
      draftNotice:
        "Draft document provided as a template. It must be reviewed by legal counsel and completed with the legal entity's details before launch.",
    },
  },
} as const;

export type Dictionary = (typeof dictionaries)[Locale];

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
