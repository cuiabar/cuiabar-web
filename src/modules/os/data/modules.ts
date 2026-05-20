import type { OsModule } from './types';

export const osModules: OsModule[] = [
  {
    id: 'atendimento',
    title: 'Atendimento',
    path: '/os/atendimento',
    description: 'Recepcao, WhatsApp, reservas, reclamacoes e recuperacao de cliente.',
    accent: 'bg-sky-600',
  },
  {
    id: 'delivery',
    title: 'Delivery',
    path: '/os/delivery',
    description: 'Pedido, conferencia, embalagem, lacre, despacho e canais de entrega.',
    accent: 'bg-emerald-600',
  },
  {
    id: 'pops',
    title: 'POPs',
    path: '/os/pops',
    description: 'Higiene, sanitizacao, temperatura, validade e seguranca alimentar.',
    accent: 'bg-amber-600',
  },
  {
    id: 'conversao',
    title: 'Conversao',
    path: '/os/conversao',
    description: 'Venda adicional, scripts, upsell, cross-sell e aumento de ticket.',
    accent: 'bg-violet-600',
  },
  {
    id: 'recomendacoes',
    title: 'Recomendacoes',
    path: '/os/recomendacoes',
    description: 'Diagnostico rapido e acao corretiva para situacoes operacionais.',
    accent: 'bg-rose-600',
  },
];
