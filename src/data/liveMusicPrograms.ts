import type { LiveMusicProgram } from './types';

export const liveMusicPrograms: LiveMusicProgram[] = [
  {
    slug: 'sexta-musica-ao-vivo-campinas',
    title: 'Sexta com música ao vivo no Villa Cuiabar em Campinas',
    shortTitle: 'Sexta com música ao vivo',
    eyebrow: 'Sexta-feira',
    summary:
      'A sexta no Villa Cuiabar reforça a proposta de bar e restaurante com música ao vivo para quem quer jantar, beber bem e começar o fim de semana em Campinas.',
    teaser: 'Programação recorrente de sexta com clima de encontro, boa mesa e reserva para quem quer chegar com mais previsibilidade.',
    dayLabel: 'Sexta-feira',
    cadenceLabel: 'Programação presencial recorrente',
    image: '/menu/bife-chorizo.png',
    highlights: [
      {
        title: 'Noite para jantar e encontrar a turma',
        description: 'A sexta funciona bem para casais, grupos pequenos e aniversários que querem começar o fim de semana com mesa organizada.',
      },
      {
        title: 'Bar completo e menu da casa',
        description: 'Drinks, cervejas, porções e pratos entram como parte da experiência para quem busca bar e restaurante no mesmo lugar.',
      },
      {
        title: 'Reserva ajuda a evitar atrito',
        description: 'Nos dias mais fortes de procura, a reserva online é o caminho mais simples para garantir mesa e alinhar a chegada.',
      },
    ],
    reservationHint: 'Para sexta à noite, vale reservar com antecedência pelo portal oficial em reservas.cuiabar.com.',
    keywords: ['sexta com música ao vivo Campinas', 'bar sexta Campinas', 'show sexta Campinas'],
  },
  {
    slug: 'sabado-show-ao-vivo-campinas',
    title: 'Sábado de show ao vivo em Campinas',
    shortTitle: 'Sábado de show ao vivo',
    eyebrow: 'Sábado',
    summary:
      'O sábado puxa uma leitura mais forte de show ao vivo, reunião de amigos, reserva para grupos e presença de quem procura um bar em Campinas com clima de fim de semana.',
    teaser: 'Noite pensada para grupos, comemorações e gente que quer curtir a programação ao vivo com comida e bar completos.',
    dayLabel: 'Sábado',
    cadenceLabel: 'Programação presencial recorrente',
    image: '/menu/picanha-carreteira.png',
    highlights: [
      {
        title: 'Sábado é dia de casa cheia',
        description: 'A programação de sábado tende a atrair mais grupos e aniversários, então a organização da mesa faz diferença para a experiência.',
      },
      {
        title: 'Boa opção para grupos',
        description: 'A programação funciona bem para quem quer um ponto de encontro com comida, música e atendimento organizado.',
      },
      {
        title: 'Encontro, show e gastronomia',
        description: 'A proposta mistura música ao vivo, bar completo e menu da casa para uma saída mais completa em Campinas.',
      },
    ],
    reservationHint: 'Sábado costuma ser um dos dias mais disputados. Se a ideia for grupo ou comemoração, a reserva antecipada ajuda bastante.',
    keywords: ['show sábado Campinas', 'bar sábado Campinas', 'música ao vivo sábado Campinas'],
  },
  {
    slug: 'domingo-musical-campinas',
    title: 'Domingo musical em Campinas para almoço e encontro em família',
    shortTitle: 'Domingo musical',
    eyebrow: 'Domingo',
    summary:
      'O domingo do Villa Cuiabar se conecta a almoço, encontro em família e música ao vivo em uma leitura mais leve, acolhedora e local para quem está em Campinas.',
    teaser: 'Uma frente pensada para almoço musical, famílias, crianças e mesas que querem aproveitar o domingo com mais calma.',
    dayLabel: 'Domingo',
    cadenceLabel: 'Programação presencial recorrente',
    image: '/menu/costela-cuiabar.png',
    highlights: [
      {
        title: 'Almoço com música e ritmo mais leve',
        description: 'Domingo funciona como ponte entre almoço, mesa longa, família e a atmosfera musical da casa.',
      },
      {
        title: 'Bom encaixe para famílias',
        description: 'O atendimento familiar ajuda bastante quem quer curtir o domingo sem abrir mão do conforto.',
      },
      {
        title: 'Reserva também vale para domingo',
        description: 'Quando a casa entra no radar de almoço em família, reservar ajuda a planejar melhor a chegada e a quantidade de pessoas.',
      },
    ],
    reservationHint: 'Domingo com família pede mesa organizada. Use o portal oficial para reservar com mais tranquilidade.',
    keywords: ['domingo musical Campinas', 'almoço com música ao vivo Campinas', 'restaurante domingo Campinas'],
  },
];

export const getLiveMusicProgramBySlug = (slug: string) => liveMusicPrograms.find((program) => program.slug === slug);
