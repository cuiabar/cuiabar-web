import { ArrowUpRight, Bike, Store, Utensils } from 'lucide-react';
import { Reveal } from '../components/Reveal';
import { getRouteSeo } from '../data/seo';
import { siteConfig } from '../data/siteConfig';
import { useSeo } from '../hooks/useSeo';

const deliveryChannels = [
  {
    title: 'Pedido direto da loja',
    description: 'Canal próprio para pedir com a equipe Cuiabar, sem intermediários.',
    href: siteConfig.orderLinks.direct,
    label: 'Pedir direto',
    icon: Store,
  },
  {
    title: 'iFood do restaurante',
    description: 'Loja oficial do restaurante no iFood.',
    href: siteConfig.orderLinks.ifood,
    label: 'Abrir iFood',
    icon: Utensils,
  },
  {
    title: '99Food do restaurante',
    description: 'Acesso do restaurante no 99Food.',
    href: siteConfig.orderLinks.food99,
    label: 'Abrir 99Food',
    icon: Bike,
  },
  {
    title: '99Food da marmitaria',
    description: 'Canal da operação Expresso para pratos do dia e marmitas.',
    href: siteConfig.orderLinks.food99Expresso,
    label: 'Abrir Expresso',
    icon: Bike,
  },
];

const DeliveryPage = () => {
  useSeo(getRouteSeo('/delivery'));

  return (
    <div className="min-h-screen bg-[#faf5ee] text-cocoa">
      <section className="container-shell py-7 sm:py-10">
        <div className="mb-8 flex items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-3">
            <img
              src={siteConfig.logoUrl}
              alt=""
              width="48"
              height="48"
              className="h-12 w-12 rounded-full object-cover"
              decoding="async"
            />
            <span className="font-heading text-2xl leading-none text-cocoa">Villa Cuiabar</span>
          </a>
          <a
            href={`https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent('Olá, quero ajuda com meu pedido.')}`}
            className="rounded-full border border-cocoa/15 bg-white px-4 py-2 text-sm font-semibold text-cocoa transition hover:border-terracotta/45 hover:text-terracotta"
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp
          </a>
        </div>

        <Reveal
          as="header"
          className="rounded-[2rem] border border-cocoa/10 bg-white px-6 py-8 shadow-[0_28px_80px_-62px_rgba(51,35,19,0.45)] sm:px-8 lg:px-10"
        >
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-terracotta">Delivery Cuiabar</p>
          <div className="mt-4 grid gap-5 lg:grid-cols-[1fr_0.72fr] lg:items-end">
            <div>
              <h1 className="max-w-3xl font-heading text-[2.8rem] leading-[0.92] sm:text-[4.4rem]">
                Escolha o canal de pedido.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-steel sm:text-lg">
                Quatro acessos oficiais: pedido direto da loja, iFood do restaurante, 99Food do restaurante e 99Food da
                marmitaria Expresso.
              </p>
            </div>
            <div className="rounded-[1.4rem] border border-terracotta/18 bg-[#fff8ef] p-5 text-sm leading-relaxed text-steel">
              Atendimento em Campinas/SP. Para dúvidas sobre pedido, use o canal direto da loja.
            </div>
          </div>
        </Reveal>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {deliveryChannels.map((channel) => {
            const Icon = channel.icon;

            return (
              <a
                key={channel.title}
                href={channel.href}
                target="_blank"
                rel="noreferrer"
                className="group rounded-[1.5rem] border border-cocoa/10 bg-white p-6 shadow-[0_24px_70px_-60px_rgba(51,35,19,0.42)] transition duration-300 hover:-translate-y-1 hover:border-terracotta/35 hover:shadow-[0_30px_82px_-56px_rgba(172,84,39,0.42)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#fff3e5] text-terracotta">
                    <Icon aria-hidden="true" className="h-6 w-6 stroke-[1.65]" />
                  </span>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="h-5 w-5 text-cocoa/35 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-terracotta"
                  />
                </div>
                <h2 className="mt-5 font-heading text-3xl leading-none text-cocoa">{channel.title}</h2>
                <p className="mt-3 min-h-[3rem] text-sm leading-relaxed text-steel">{channel.description}</p>
                <span className="mt-6 inline-flex rounded-full bg-terracotta px-4 py-2 text-sm font-semibold text-white">
                  {channel.label}
                </span>
              </a>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default DeliveryPage;
