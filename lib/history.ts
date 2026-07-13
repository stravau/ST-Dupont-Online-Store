// S.T. Dupont heritage content. Facts verified against public sources
// (Wikipedia "S. T. Dupont" and the Maison's own savoir-faire pages):
// founding 1872, Grands Magasins du Louvre 1884, sons take over 1919,
// move to Faverges 1924, post-1929 luxury pivot, first serial lighter 1941
// (aluminium, wartime brass restriction), Gillette stake 1971, acquisition
// by Dickson Concepts 1987. Narrative kept measured; no invented specifics.

type L = { pt: string; en: string };

export const history: {
  eyebrow: L;
  title: L;
  lede: L;
  intro: L[];
  timelineTitle: L;
  timeline: { year: string; title: L; body: L }[];
  craftTitle: L;
  craft: L[];
  todayTitle: L;
  today: L[];
  closing: L;
} = {
  eyebrow: { pt: "A Maison · desde 1872", en: "The Maison · since 1872" },
  title: { pt: "A Nossa História", en: "Our Story" },
  lede: {
    pt: "Mais de 150 anos de savoir-faire francês — da pele dos primeiros estojos de viagem à chama dos isqueiros mais celebrados do mundo.",
    en: "Over 150 years of French savoir-faire — from the leather of the first travel cases to the flame of the world's most celebrated lighters.",
  },
  intro: [
    {
      pt: "Em 1872, em Paris, Simon Tissot-Dupont fundou uma casa dedicada à arte do couro. As suas oficinas produziam estojos e malas de viagem feitos à mão para diplomatas, financeiros e viajantes exigentes — objetos concebidos para durar uma vida inteira.",
      en: "In 1872, in Paris, Simon Tissot-Dupont founded a house devoted to the art of leather. Its workshops produced hand-made travel cases and trunks for diplomats, financiers and discerning travellers — objects conceived to last a lifetime.",
    },
    {
      pt: "Em 1884, a casa tornou-se fornecedora dos Grands Magasins du Louvre, então um dos maiores armazéns do mundo, sem nunca abandonar a sua clientela privada e o rigor artesanal que a distinguia.",
      en: "By 1884 the house had become a supplier to the Grands Magasins du Louvre, then one of the largest stores in the world, without ever abandoning its private clientele or the artisanal rigour that set it apart.",
    },
  ],
  timelineTitle: { pt: "Marcos", en: "Milestones" },
  timeline: [
    {
      year: "1872",
      title: { pt: "Fundação em Paris", en: "Founded in Paris" },
      body: {
        pt: "Simon Tissot-Dupont estabelece a casa, especializada em estojos e malas de viagem em pele, feitos à mão por encomenda.",
        en: "Simon Tissot-Dupont establishes the house, specialising in hand-made leather travel cases and trunks made to order.",
      },
    },
    {
      year: "1884",
      title: { pt: "Reconhecimento", en: "Recognition" },
      body: {
        pt: "Torna-se fornecedora dos Grands Magasins du Louvre, mantendo em paralelo uma clientela privada de elite.",
        en: "Becomes a supplier to the Grands Magasins du Louvre while keeping an elite private clientele.",
      },
    },
    {
      year: "1919",
      title: { pt: "A segunda geração", en: "The second generation" },
      body: {
        pt: "Os filhos Lucien e André assumem a casa, sob o nome Les Fils de S.T. Dupont, e ampliam a produção de peças de viagem de alta qualidade.",
        en: "Sons Lucien and André take over, trading as Les Fils de S.T. Dupont, expanding production of high-quality travel pieces.",
      },
    },
    {
      year: "1924",
      title: { pt: "Regresso a Faverges", en: "Return to Faverges" },
      body: {
        pt: "As oficinas transferem-se de Paris para Faverges, na Sabóia, terra natal da família — onde a fábrica permanece até hoje.",
        en: "The workshops move from Paris to Faverges, in Savoy, the family's hometown — where the manufacture remains to this day.",
      },
    },
    {
      year: "1929",
      title: { pt: "A escolha do luxo", en: "The choice of luxury" },
      body: {
        pt: "Após a crise de 1929, a casa reposiciona-se firmemente no segmento do ultra-luxo, ao serviço de uma clientela internacional exigente.",
        en: "After the crash of 1929, the house positions itself firmly in the ultra-luxury segment, serving a demanding international clientele.",
      },
    },
    {
      year: "1941",
      title: { pt: "O primeiro isqueiro", en: "The first lighter" },
      body: {
        pt: "Nasce o primeiro isqueiro produzido em série — em alumínio, já que o latão estava restrito em tempo de guerra. Começava uma nova arte da casa.",
        en: "The first serially produced lighter is born — in aluminium, as brass was restricted in wartime. A new art of the house had begun.",
      },
    },
    {
      year: "1971 – 1987",
      title: { pt: "Continuidade", en: "Continuity" },
      body: {
        pt: "A Gillette adquire uma participação na casa em 1971; em 1987, a S.T. Dupont passa para a Dickson Concepts, de Hong Kong, que assegura a sua continuidade.",
        en: "Gillette acquires a stake in 1971; in 1987 S.T. Dupont passes to Hong Kong's Dickson Concepts, which ensures its continuity.",
      },
    },
  ],
  craftTitle: { pt: "O Savoir-Faire", en: "The Savoir-Faire" },
  craft: [
    {
      pt: "Cada isqueiro é montado à mão na fábrica de Faverges e percorre centenas de operações de precisão antes de ser considerado digno do nome da casa.",
      en: "Each lighter is hand-assembled at the Faverges manufacture and passes through hundreds of precision operations before it is deemed worthy of the house's name.",
    },
    {
      pt: "Sob um mesmo teto convivem ofícios raros — ourivesaria, trabalho do couro e a arte da laca — transmitidos de geração em geração de artesãos.",
      en: "Under one roof live rare crafts — goldsmithing, leatherwork and the art of lacquer — passed down from one generation of artisans to the next.",
    },
  ],
  todayTitle: { pt: "Hoje", en: "Today" },
  today: [
    {
      pt: "A S.T. Dupont mantém a sua vocação original: isqueiros, instrumentos de escrita, peças em pele e acessórios concebidos como objetos de uma vida — entre tradição e criação contemporânea.",
      en: "S.T. Dupont keeps its original vocation: lighters, writing instruments, leather pieces and accessories conceived as lifetime objects — between tradition and contemporary creation.",
    },
  ],
  closing: {
    pt: "Uma Maison francesa, fiel a um só princípio: o tempo só tem valor quando é bem feito.",
    en: "A French Maison, faithful to a single principle: time is only worth something when it is well made.",
  },
};
