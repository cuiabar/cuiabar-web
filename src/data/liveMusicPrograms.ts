import type { LiveMusicProgram } from './types';

export const liveMusicPrograms: LiveMusicProgram[] = [
  {
    slug: 'sexta-musica-ao-vivo-campinas',
    title: 'Sexta com música ao vivo no Villa Cuiabar em Campinas',
    shortTitle: 'Sexta com música ao vivo',
    eyebrow: 'Sexta-feira',
    summary:
      'A sexta no Villa Cuiabar reforça a proposta de bar e restaurante com música ao vivo para quem quer jantar, beber bem e começar o fim de semana no Jardim Aurélia.',
    teaser: 'Programação recorrente de sexta com clima de encontro, boa mesa e reserva para quem quer chegar com mais previsibilidade.',
    dayLabel: 'Sexta-feira',
    cadenceLabel: 'Programação presencial recorrente',
    image: '/home/home-salao-dia-da-mulher.jpg',
    highlights: [
      {
        title: 'Noite para jantar e encontrar a turma',
        description: 'A sexta funciona bem para casais, grupos pequenos e aniversários que querem começar o fim de semana com mesa organizada.',
      },
      {
        title: 'Bar completo e menu da casa',
        description: 'Drinks, cervejas, porções, pratos e burgers entram como parte da experiência para quem busca bar e restaurante no mesmo lugar.',
      },
      {
        title: 'Reserva ajuda a evitar atrito',
        description: 'Nos dias mais fortes de procura, a reserva online é o caminho mais simples para garantir mesa e alinhar a chegada.',
      },
    ],
    reservationHint: 'Para sexta à noite, vale reservar com antecedência pelo portal oficial em reservas.cuiabar.com.',
    keywords: ['sexta com música ao vivo Campinas', 'bar sexta Jardim Aurélia', 'show sexta Campinas'],
  },
  {
    slug: 'sabado-show-ao-vivo-jardim-aurelia',
    title: 'Sábado de show ao vivo no Jardim Aurélia',
    shortTitle: 'Sábado de show ao vivo',
    eyebrow: 'Sábado',
    summary:
      'O sábado puxa uma leitura mais forte de show ao vivo, reunião de amigos, reserva para grupos e presença de quem procura um bar no Jardim Aurélia com clima de fim de semana.',
    teaser: 'Noite pensada para grupos, comemorações e gente que quer curtir a programação ao vivo com comida e bar completos.',
    dayLabel: 'Sábado',
    cadenceLabel: 'Programação presencial recorrente',
    image: '/home/home-mascote-salao.jpg',
    highlights: [
      {
        title: 'Sábado é dia de casa cheia',
        description: 'A programação de sábado tende a atrair mais grupos e aniversários, então a organização da mesa faz diferença para a experiência.',
      },
      {
        title: 'Boa opção para quem vem da Dunlop',
        description: 'A localização funciona bem para quem circula pela John Boyd Dunlop e quer um ponto de encontro sem perder tempo no deslocamento.',
      },
      {
        title: 'Encontro, show e gastronomia',
        description: 'A proposta mistura música ao vivo, bar completo e menu da casa para uma saída mais completa em Campinas.',
      },
    ],
    reservationHint: 'Sábado costuma ser um dos dias mais disputados. Se a ideia for grupo ou comemoração, a reserva antecipada ajuda bastante.',
    keywords: ['show sábado Campinas', 'bar sábado Jardim Aurélia', 'música ao vivo sábado Campinas'],
  },
  {
    slug: 'domingo-musical-jardim-aurelia',
    title: 'Domingo musical no Jardim Aurélia para almoço e encontro em família',
    shortTitle: 'Domingo musical',
    eyebrow: 'Domingo',
    summary:
      'O domingo do Villa Cuiabar se conecta a almoço, encontro em família e música ao vivo em uma leitura mais leve, acolhedora e local para quem está em Campinas.',
    teaser: 'Uma frente pensada para almoço musical, famílias, crianças e mesas que querem aproveitar o domingo com mais calma.',
    dayLabel: 'Domingo',
    cadenceLabel: 'Programação presencial recorrente',
    image: '/home/home-salao-dia-da-mulher.jpg',
    highlights: [
      {
        title: 'Almoço com música e ritmo mais leve',
        description: 'Domingo funciona como ponte entre almoço, mesa longa, família e a atmosfera musical da casa.',
      },
      {
        title: 'Bom encaixe para famílias',
        description: 'O ambiente acolhedor e o espaço para crianças ajudam bastante quem quer curtir o domingo sem abrir mão do conforto.',
      },
      {
        title: 'Reserva também vale para domingo',
        description: 'Quando a casa entra no radar de almoço em família, reservar ajuda a planejar melhor a chegada e a quantidade de pessoas.',
      },
    ],
    reservationHint: 'Domingo com família pede mesa organizada. Use o portal oficial para reservar com mais tranquilidade.',
    keywords: ['domingo musical Campinas', 'almoço com música ao vivo Campinas', 'restaurante domingo Jardim Aurélia'],
  },
];

export const getLiveMusicProgramBySlug = (slug: string) => liveMusicPrograms.find((program) => program.slug === slug);
