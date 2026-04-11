import { siteConfig } from './siteConfig';

const ADDRESS_LABEL = siteConfig.address;
const MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=Av.%20Brigadeiro%20Rafael%20Tobias%20de%20Aguiar%2C%201121%20-%20Jardim%20Aurelia%20-%20Campinas%2FSP';
const JOBS_URL = '/vagas';
const LIVE_MUSIC_SCHEDULE_HOURS = [
  'Sexta, sábado e domingo',
  'Consulte a programação atual antes de sair',
];

export const linksPageConfig = {
  brandName: 'Cuiabar',
  pageEyebrow: 'Links oficiais',
  headline: 'Escolha seu próximo passo com a Cuiabar.',
  subheadline: 'Delivery, atendimento, novidades e oportunidades em um só lugar.',
  institutionalIntro:
    'Uma página leve, direta e oficial para chegar rápido ao que importa na marca em Campinas.',
  featuredChannelLabel: 'Canal em destaque',
  featuredChannelNote: 'Receba promoções, agenda, novidades da casa e avisos importantes em primeira mão.',
  whatsappChannelUrl: 'https://whatsapp.com/channel/0029VbAcHLXFSAsxCt6lly0a',
  restaurantWhatsappUrl: 'https://wa.me/551933058878',
  directOrderUrl: 'https://expresso.cuiabar.com',
  jobsUrl: JOBS_URL,
  addressLabel: ADDRESS_LABEL,
  mapsUrl: MAPS_URL,
  liveMusicScheduleTitle: 'Presencial com música ao vivo',
  liveMusicScheduleText: 'Presencial com música ao vivo — consulte a programação atual.',
  liveMusicScheduleLabel: 'Horários presenciais',
  addressCardLabel: 'Endereço',
  liveMusicScheduleHours: LIVE_MUSIC_SCHEDULE_HOURS,
  venueCopy:
    'Venha viver a experiência Cuiabar no salão, com ambiente acolhedor, operação familiar e programação musical.',
  footerCopy: 'Cuiabar • Campinas/SP',
  logoUrl: siteConfig.logoUrl,
  links: [
    {
      id: 'channel',
      emoji: '📣',
      eyebrow: 'Novidades',
      title: 'Entrar no canal do WhatsApp',
      subtitle: 'Promoções, avisos, eventos e atualizações oficiais.',
      href: 'https://whatsapp.com/channel/0029VbAcHLXFSAsxCt6lly0a',
      isFeatured: true,
    },
    {
      id: 'restaurant-whatsapp',
      emoji: '💬',
      eyebrow: 'Atendimento',
      title: 'Falar com o restaurante',
      subtitle: 'Contato direto com a equipe pelo WhatsApp.',
      href: 'https://wa.me/551933058878',
      isFeatured: false,
    },
    {
      id: 'direct-order',
      emoji: '🍽️',
      eyebrow: 'Pedido',
      title: 'Fazer pedido direto',
      subtitle: 'Acesse o canal oficial de pedidos online.',
      href: 'https://expresso.cuiabar.com',
      isFeatured: false,
    },
    {
      id: 'live-music',
      emoji: '🎶',
      eyebrow: 'Presencial',
      title: 'Ver programação presencial com música',
      subtitle: 'Confira o bloco com a agenda e a experiência no salão.',
      href: '#presencial',
      isFeatured: false,
    },
    {
      id: 'jobs',
      emoji: '👩‍🍳',
      eyebrow: 'Oportunidades',
      title: 'Trabalhe com a gente',
      subtitle: 'Veja vagas abertas e envie sua candidatura.',
      href: JOBS_URL,
      isFeatured: false,
    },
    {
      id: 'maps',
      emoji: '📍',
      eyebrow: 'Localização',
      title: 'Como chegar',
      subtitle: 'Abra o endereço no Google Maps.',
      href: MAPS_URL,
      isFeatured: false,
    },
  ],
} as const;
