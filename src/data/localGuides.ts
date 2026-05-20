import { siteConfig } from './siteConfig';

export type LocalGuideKey = 'restauranteCampinas' | 'barMusicaCampinas' | 'restauranteDeliveryCampinas';

type LocalGuideCta = {
  label: string;
  href: string;
  external?: boolean;
};

type LocalGuideHighlight = {
  title: string;
  description: string;
};

type LocalGuideFaq = {
  question: string;
  answer: string;
};

export type LocalGuide = {
  key: LocalGuideKey;
  path: string;
  eyebrow: string;
  title: string;
  description: string;
  chips: string[];
  highlights: LocalGuideHighlight[];
  visitSignals: string[];
  faqs: LocalGuideFaq[];
  ctas: LocalGuideCta[];
};

export const localGuides: Record<LocalGuideKey, LocalGuide> = {
  restauranteCampinas: {
    key: 'restauranteCampinas',
    path: '/restaurante-brasileiro-campinas',
    eyebrow: 'Campinas',
    title: 'Restaurante brasileiro para almoco, jantar e reservas em Campinas',
    description:
      'Para quem procura um restaurante brasileiro em Campinas, o Villa Cuiabar combina comida da casa, bar completo, atendimento familiar e reservas online em um so lugar.',
    chips: ['Restaurante', 'Campinas', 'Comida brasileira', 'Reservas online'],
    highlights: [
      {
        title: 'Almoco e jantar com mais previsibilidade',
        description: 'A casa atende quem quer almocar bem durante a semana e voltar para o presencial em noites selecionadas com reserva organizada.',
      },
      {
        title: 'Espaco familiar com conforto para criancas',
        description: 'A operação foi pensada para encontros em familia, com atendimento que recebe bem adultos e pequenos.',
      },
      {
        title: 'Bar, porcoes e clima de encontro',
        description: 'Bar completo, petiscos, pratos da casa e estrutura para aniversarios, grupos e encontros casuais.',
      },
    ],
    visitSignals: [
      'Base forte para quem procura comida brasileira em Campinas.',
      'Boa opcao para quem quer combinar almoço, jantar, bar e música em um mesmo atendimento.',
      'Reserva oficial em reservas.cuiabar.com para mesas, grupos e comemoracoes.',
    ],
    faqs: [
      {
        question: 'O Villa Cuiabar atende em Campinas?',
        answer: 'Sim. A casa atende em Campinas. Para localização, horários e reservas, use os canais oficiais.',
      },
      {
        question: 'Tem espaco para ir com criancas?',
        answer: 'Temos ambiente familiar com brinquedo para criancas, o que ajuda bastante em almocos de fim de semana, aniversarios e encontros em familia.',
      },
      {
        question: 'Como fazer reserva?',
        answer: 'A reserva oficial e feita em reservas.cuiabar.com, com data, horario, quantidade de pessoas e observacoes em um fluxo unico.',
      },
    ],
    ctas: [
      { label: 'Reservar online', href: siteConfig.reservationPortalUrl, external: true },
      { label: 'Ver menu da casa', href: '/menu' },
    ],
  },
  barMusicaCampinas: {
    key: 'barMusicaCampinas',
    path: '/bar-musica-ao-vivo-campinas',
    eyebrow: 'Bar e musica',
    title: 'Bar com musica ao vivo, shows e reservas em Campinas',
    description:
      'Para quem busca bar em Campinas com musica ao vivo, noites de shows, porcoes, drinks e reserva organizada, o Villa Cuiabar concentra bar completo, atendimento familiar e programacao presencial.',
    chips: ['Bar', 'Musicas ao vivo', 'Shows', 'Reservas'],
    highlights: [
      {
        title: 'Noites com musica ao vivo e clima de encontro',
        description: 'Sextas, sabados e domingos puxam a vocacao de bar e restaurante para quem quer jantar, beber bem e curtir a programacao ao vivo.',
      },
      {
        title: 'Reservas para casal, grupos e aniversarios',
        description: 'O portal de reservas ajuda a organizar chegada, tamanho da mesa e observacoes para encontros, comemoracoes e grupos maiores.',
      },
      {
        title: 'Casa para familia e amigos',
        description: 'Mesmo nas noites com shows, a operacao preserva atendimento acolhedor para quem quer sair com criancas, amigos ou familia.',
      },
    ],
    visitSignals: [
      'Mencione a programacao da semana e reserve cedo para os dias com maior movimento.',
      'O bar completo acompanha pratos, porcoes e menu principal da casa.',
      'Bom ponto de encontro para quem procura música ao vivo e comida brasileira em Campinas.',
    ],
    faqs: [
      {
        question: 'Quando tem musica ao vivo no Villa Cuiabar?',
        answer: 'O presencial com musica ao vivo acontece as sextas, sabados e domingos, com agenda divulgada nos canais oficiais da casa.',
      },
      {
        question: 'Precisa reservar para os shows?',
        answer: 'Nao e obrigatorio em todos os dias, mas a reserva online e a melhor forma de garantir mesa em noites mais disputadas.',
      },
      {
        question: 'O ambiente serve so para bar?',
        answer: 'Nao. O Villa Cuiabar funciona como bar e restaurante, com menu completo, bar, atendimento presencial e estrutura para familias.',
      },
    ],
    ctas: [
      { label: 'Abrir pagina de reservas', href: '/reservas' },
      { label: 'Acompanhar agenda', href: '/' },
    ],
  },
  restauranteDeliveryCampinas: {
    key: 'restauranteDeliveryCampinas',
    path: '/restaurante-delivery-campinas',
    eyebrow: 'Campinas',
    title: 'Restaurante brasileiro com almoco, jantar e delivery em Campinas',
    description:
      'Quem procura restaurante brasileiro em Campinas encontra no Villa Cuiabar uma opção forte para almoco, jantar, delivery e reservas.',
    chips: ['Campinas', 'Almoco', 'Jantar', 'Reservas'],
    highlights: [
      {
        title: 'Opção prática para comer bem',
        description: 'A operação funciona bem para quem quer comer bem em Campinas sem perder tempo escolhendo canal de pedido ou reserva.',
      },
      {
        title: 'Opcao para almoco, jantar e encontro',
        description: 'A casa atende desde refeicao de rotina ate encontro com amigos, familia ou clientes que estejam pela regiao.',
      },
      {
        title: 'Canais oficiais para continuar a jornada',
        description: 'Se o melhor momento for depois, o mesmo ecossistema ja oferece menu, reservas online e pedido direto no site.',
      },
    ],
    visitSignals: [
      'Boa referencia para quem procura restaurante brasileiro em Campinas.',
      'Atendimento organizado por canais oficiais de reserva, WhatsApp e delivery.',
      'Menu completo da casa, delivery e reservas em um so dominio oficial.',
    ],
    faqs: [
      {
        question: 'Como consulto localização e atendimento?',
        answer: 'Use os canais oficiais do Villa Cuiabar para confirmar localização, horários e disponibilidade antes de sair.',
      },
      {
        question: 'Também tem delivery?',
        answer: 'Sim. O site mantém canais oficiais para pedido direto, iFood e 99Food.',
      },
      {
        question: 'Da para reservar antes de chegar?',
        answer: 'Sim. O portal oficial reservas.cuiabar.com permite organizar a chegada com antecedência.',
      },
    ],
    ctas: [
      { label: 'Ver como reservar', href: '/reservas' },
      { label: 'Pedir no site', href: siteConfig.orderLinks.direct, external: true },
    ],
  },
};

export const localGuideList = Object.values(localGuides);
