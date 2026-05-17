// DRAFT legal content — provided as a professional template only.
// Must be reviewed by legal counsel and completed with the operating
// entity's details (placeholders in [SQUARE BRACKETS]) before launch.
import type { Locale } from "@/lib/i18n";
import { STORE } from "@/lib/store-info";

type L = Record<Locale, string>;
const t = (pt: string, en: string): L => ({ pt, en });

export interface LegalSection {
  h: L;
  p: L[];
}
export interface LegalDoc {
  slug: string;
  title: L;
  updated: L;
  intro: L;
  sections: LegalSection[];
}

const UPDATED = t("Maio de 2026", "May 2026");

// Operating-entity placeholders — replace with the real legal entity.
const ENTITY = t(
  "[Razão Social da Entidade], NIPC [número], com sede em [morada da sede], Portugal",
  "[Operating Company Name], company no. [number], registered at [registered address], Portugal",
);

export const legalDocs: Record<string, LegalDoc> = {
  privacidade: {
    slug: "privacidade",
    title: t("Política de Privacidade", "Privacy Policy"),
    updated: UPDATED,
    intro: t(
      "Esta política descreve como tratamos os dados pessoais dos visitantes e clientes desta loja online, em conformidade com o Regulamento Geral sobre a Proteção de Dados (RGPD) e a legislação portuguesa aplicável.",
      "This policy describes how we process the personal data of visitors and customers of this online store, in accordance with the General Data Protection Regulation (GDPR) and applicable Portuguese law.",
    ),
    sections: [
      {
        h: t("Responsável pelo tratamento", "Data controller"),
        p: [ENTITY, t(
          `Para qualquer questão sobre privacidade, contacte ${STORE.email}.`,
          `For any privacy enquiry, contact ${STORE.email}.`,
        )],
      },
      {
        h: t("Dados que recolhemos", "Data we collect"),
        p: [t(
          "Dados de conta e encomenda (nome, email, morada de entrega e faturação, contacto telefónico), dados de navegação técnicos (registos de acesso, dispositivo) e o histórico de compras necessário à execução do contrato.",
          "Account and order data (name, email, shipping and billing address, phone), technical browsing data (access logs, device) and the purchase history necessary to perform the contract.",
        )],
      },
      {
        h: t("Finalidades e fundamentos legais", "Purposes and legal bases"),
        p: [t(
          "Tratamos os dados para: execução do contrato de compra e venda; cumprimento de obrigações legais (faturação e fiscalidade); e, mediante consentimento, comunicações de marketing. Pode retirar o consentimento a qualquer momento.",
          "We process data to: perform the sale contract; comply with legal obligations (invoicing and tax); and, subject to consent, send marketing communications. You may withdraw consent at any time.",
        )],
      },
      {
        h: t("Partilha e subcontratantes", "Sharing and processors"),
        p: [t(
          "Os dados podem ser partilhados com prestadores de pagamento, transportadoras e fornecedores tecnológicos, estritamente para as finalidades indicadas e sob acordo de tratamento de dados. Não vendemos dados pessoais.",
          "Data may be shared with payment providers, carriers and technology vendors, strictly for the stated purposes and under a data-processing agreement. We do not sell personal data.",
        )],
      },
      {
        h: t("Conservação", "Retention"),
        p: [t(
          "Os dados são conservados pelo período necessário às finalidades e pelos prazos legais de conservação (designadamente fiscais), após o que são eliminados ou anonimizados.",
          "Data is retained for as long as necessary for the purposes and for the legal retention periods (notably tax), after which it is deleted or anonymised.",
        )],
      },
      {
        h: t("Os seus direitos", "Your rights"),
        p: [t(
          "Tem direito de acesso, retificação, apagamento, limitação, portabilidade e oposição, bem como o direito de reclamar junto da Comissão Nacional de Proteção de Dados (CNPD).",
          "You have the right of access, rectification, erasure, restriction, portability and objection, as well as the right to lodge a complaint with the Portuguese Data Protection Authority (CNPD).",
        )],
      },
      {
        h: t("Cookies", "Cookies"),
        p: [t(
          "Utilizamos cookies essenciais ao funcionamento do site e, mediante consentimento, cookies analíticos. Pode gerir as preferências no seu navegador.",
          "We use cookies essential to the site's operation and, subject to consent, analytics cookies. You can manage preferences in your browser.",
        )],
      },
    ],
  },

  termos: {
    slug: "termos",
    title: t("Termos e Condições", "Terms & Conditions"),
    updated: UPDATED,
    intro: t(
      "Estes termos regem a utilização desta loja online e a compra de produtos. Ao efetuar uma encomenda, o cliente declara aceitar integralmente estas condições.",
      "These terms govern the use of this online store and the purchase of products. By placing an order, the customer accepts these conditions in full.",
    ),
    sections: [
      {
        h: t("Identificação", "Identification"),
        p: [ENTITY],
      },
      {
        h: t("Produtos e preços", "Products and pricing"),
        p: [t(
          "Os produtos e preços apresentados são indicativos e podem ser atualizados sem aviso prévio. Os preços incluem IVA à taxa legal em vigor, salvo indicação em contrário. Esforçamo-nos por garantir a exatidão das imagens e descrições.",
          "The products and prices shown are indicative and may be updated without notice. Prices include VAT at the legal rate in force unless stated otherwise. We strive to ensure the accuracy of images and descriptions.",
        )],
      },
      {
        h: t("Encomendas e pagamento", "Orders and payment"),
        p: [t(
          "A encomenda só se considera confirmada após validação do pagamento. Reservamo-nos o direito de recusar ou cancelar encomendas em caso de indisponibilidade de stock ou suspeita de fraude.",
          "An order is only confirmed after payment validation. We reserve the right to refuse or cancel orders in case of stock unavailability or suspected fraud.",
        )],
      },
      {
        h: t("Entrega", "Delivery"),
        p: [t(
          "As entregas são efetuadas em Portugal nos prazos indicados no momento da compra. Os prazos são estimativas e não constituem garantia de data exata.",
          "Deliveries are made in Portugal within the timeframes indicated at purchase. Timeframes are estimates and do not constitute a guarantee of an exact date.",
        )],
      },
      {
        h: t("Direito de livre resolução", "Right of withdrawal"),
        p: [t(
          "O consumidor dispõe de 14 dias para resolver o contrato sem necessidade de justificação, nos termos do Decreto-Lei n.º 24/2014. Ver a página de Devoluções para o procedimento.",
          "The consumer has 14 days to withdraw from the contract without giving any reason, under Portuguese Decree-Law 24/2014. See the Returns page for the procedure.",
        )],
      },
      {
        h: t("Garantia", "Warranty"),
        p: [t(
          "Os produtos beneficiam da garantia legal de conformidade aplicável aos bens de consumo. A S.T. Dupont oferece ainda serviço e manutenção dos seus objetos.",
          "Products benefit from the legal guarantee of conformity applicable to consumer goods. S.T. Dupont additionally offers service and maintenance of its objects.",
        )],
      },
      {
        h: t("Responsabilidade e lei aplicável", "Liability and governing law"),
        p: [t(
          "Na máxima medida permitida por lei, a nossa responsabilidade limita-se ao valor da encomenda. Estes termos regem-se pela lei portuguesa, sendo competente o foro do consumidor. É possível recorrer à resolução alternativa de litígios de consumo.",
          "To the maximum extent permitted by law, our liability is limited to the order value. These terms are governed by Portuguese law, with the consumer's forum being competent. Alternative consumer dispute resolution is available.",
        )],
      },
    ],
  },

  devolucoes: {
    slug: "devolucoes",
    title: t("Devoluções", "Returns"),
    updated: UPDATED,
    intro: t(
      "Queremos que esteja totalmente satisfeito com a sua aquisição. Esta página descreve o seu direito de devolução e o respetivo procedimento.",
      "We want you to be fully satisfied with your purchase. This page describes your right to return and the related procedure.",
    ),
    sections: [
      {
        h: t("Prazo de 14 dias", "14-day period"),
        p: [t(
          "Dispõe de 14 dias seguidos, a contar da receção, para devolver um artigo sem necessidade de justificação, ao abrigo do direito de livre resolução.",
          "You have 14 consecutive days from receipt to return an item without giving a reason, under the right of withdrawal.",
        )],
      },
      {
        h: t("Condições", "Conditions"),
        p: [t(
          "O artigo deve ser devolvido completo, sem sinais de uso, com a embalagem original e os respetivos acessórios e documentação. Peças personalizadas ou gravadas podem não ser elegíveis.",
          "The item must be returned complete, with no signs of use, in its original packaging with its accessories and documentation. Personalised or engraved pieces may not be eligible.",
        )],
      },
      {
        h: t("Como devolver", "How to return"),
        p: [t(
          `Contacte-nos por ${STORE.email} ou ${STORE.phone} indicando o número de encomenda. Indicaremos o procedimento de recolha ou entrega na boutique de ${STORE.venue}.`,
          `Contact us at ${STORE.email} or ${STORE.phone} with your order number. We will provide the pickup procedure or in-boutique drop-off at ${STORE.venue}.`,
        )],
      },
      {
        h: t("Reembolsos", "Refunds"),
        p: [t(
          "Após receção e verificação do artigo, o reembolso é processado no mesmo meio de pagamento, em regra no prazo de 14 dias.",
          "After receipt and inspection of the item, the refund is processed to the original payment method, generally within 14 days.",
        )],
      },
      {
        h: t("Artigos com defeito", "Defective items"),
        p: [t(
          "Em caso de defeito ou não conformidade, aplica-se a garantia legal: o artigo é reparado, substituído ou reembolsado sem custos para o cliente.",
          "In case of defect or non-conformity, the legal guarantee applies: the item is repaired, replaced or refunded at no cost to the customer.",
        )],
      },
    ],
  },
};
