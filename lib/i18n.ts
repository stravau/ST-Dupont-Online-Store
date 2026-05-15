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
    nav: { lighters: "Isqueiros", writing: "Escrita", leather: "Pele", accessories: "Acessórios", search: "Pesquisar", cart: "Carrinho", collections: "Coleções", viewAll: "Ver tudo" },
    common: { home: "Início", available: "Disponível" },
    notFound: {
      title: "Página não encontrada",
      body: "A página que procura já não existe ou foi movida. Explore as nossas coleções.",
      cta: "Voltar à Maison",
    },
    auth: {
      account: "A Minha Conta",
      signIn: "Entrar",
      signOut: "Terminar Sessão",
      register: "Criar Conta",
      name: "Nome",
      email: "Email",
      password: "Palavra-passe",
      passwordHint: "Mínimo 8 caracteres",
      createAccount: "Criar a minha conta",
      noAccount: "Ainda não tem conta?",
      haveAccount: "Já tem conta?",
      loginError: "Email ou palavra-passe incorretos.",
      registerExists: "Já existe uma conta com este email.",
      registerInvalid: "Verifique os dados introduzidos (palavra-passe ≥ 8 caracteres).",
      registered: "Conta criada. Já pode entrar.",
      welcome: "Bem-vindo",
      role: "Tipo de conta",
      memberSince: "Membro desde",
    },
    hero: {
      eyebrow: "Estabelecida 1872 · Paris",
      title: "L’Art du Briquet",
      subtitle: "A arte francesa do luxo, desde o gesto mais íntimo ao detalhe mais raro.",
      cta: "Descobrir a Coleção",
    },
    sections: {
      categories: "As Nossas Casas",
      novelties: "Novidades",
      noveltiesSub: "As mais recentes criações da maison",
      heritageEyebrow: "A Maison",
      heritageTitle: "A marca por trás de reis, rainhas e estadistas",
      heritageBody:
        "Desde 1872, a S.T. Dupont define o requinte francês — isqueiros, instrumentos de escrita e peças em pele concebidos como objetos de uma vida inteira, feitos à mão nas oficinas de Faverges.",
      heritageCta: "A Nossa História",
      boutiqueEyebrow: "Boutique",
      boutiqueTitle: "Visite-nos em Lisboa",
      boutiqueBody: "Aconselhamento personalizado, gravação e serviços de personalização exclusivos.",
    },
    product: {
      from: "Desde",
      addToCart: "Adicionar ao Carrinho",
      viewProduct: "Ver Produto",
      finishes: "Acabamentos",
      selectFinish: "Selecione o acabamento",
      backToCategory: "Voltar",
      deliveryBy: "Entrega em Portugal até",
      returns: "Devoluções gratuitas em 14 dias",
      lifetime: "Serviço e manutenção vitalícios",
      needHelp: "Precisa de ajuda?",
      findStore: "Encontrar loja",
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
    },
  },
  en: {
    nav: { lighters: "Lighters", writing: "Writing", leather: "Leather", accessories: "Accessories", search: "Search", cart: "Cart", collections: "Collections", viewAll: "View all" },
    common: { home: "Home", available: "Available" },
    notFound: {
      title: "Page not found",
      body: "The page you are looking for no longer exists or has moved. Explore our collections.",
      cta: "Back to the Maison",
    },
    auth: {
      account: "My Account",
      signIn: "Sign In",
      signOut: "Sign Out",
      register: "Create Account",
      name: "Name",
      email: "Email",
      password: "Password",
      passwordHint: "Minimum 8 characters",
      createAccount: "Create my account",
      noAccount: "Don't have an account?",
      haveAccount: "Already have an account?",
      loginError: "Incorrect email or password.",
      registerExists: "An account with this email already exists.",
      registerInvalid: "Please check your details (password ≥ 8 characters).",
      registered: "Account created. You can now sign in.",
      welcome: "Welcome",
      role: "Account type",
      memberSince: "Member since",
    },
    hero: {
      eyebrow: "Established 1872 · Paris",
      title: "L’Art du Briquet",
      subtitle: "The French art of luxury — from the most intimate gesture to the rarest detail.",
      cta: "Discover the Collection",
    },
    sections: {
      categories: "Our Maisons",
      novelties: "New Arrivals",
      noveltiesSub: "The latest creations from the maison",
      heritageEyebrow: "The Maison",
      heritageTitle: "The brand behind kings, queens and statesmen",
      heritageBody:
        "Since 1872, S.T. Dupont has defined French refinement — lighters, writing instruments and leather pieces conceived as lifetime objects, handcrafted in the Faverges workshops.",
      heritageCta: "Our Story",
      boutiqueEyebrow: "Boutique",
      boutiqueTitle: "Visit us in Lisbon",
      boutiqueBody: "Personalised advice, engraving and exclusive customisation services.",
    },
    product: {
      from: "From",
      addToCart: "Add to Cart",
      viewProduct: "View Product",
      finishes: "Finishes",
      selectFinish: "Select finish",
      backToCategory: "Back",
      deliveryBy: "Delivered in Portugal by",
      returns: "Free 14-day returns",
      lifetime: "Lifetime service & maintenance",
      needHelp: "Need help?",
      findStore: "Find a store",
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
    },
  },
} as const;

export type Dictionary = (typeof dictionaries)[Locale];

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
