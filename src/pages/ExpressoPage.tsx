import { Link } from 'react-router-dom';
import { Reveal } from '../components/Reveal';
import { menuHighlights } from '../data/content';
import { getRouteSeo } from '../data/seo';
import { siteConfig } from '../data/siteConfig';
import { useSeo } from '../hooks/useSeo';

const serviceWindows = [
  { label: 'Almoço', value: 'Todos os dias, 11h às 14:30' },
  { label: 'Pedido', value: 'Site, iFood, 99Food e WhatsApp' },
  { label: 'Atendimento', value: 'Campinas/SP' },
];

const ExpressoPage = () => {
  useSeo(getRouteSeo('/expresso'));

  return (
    <div className="container-shell space-y-10 py-14">
      <Reveal
        as="header"
        className="overflow-hidden rounded-[2.2rem] border border-cocoa/10 bg-[linear-gradient(160deg,rgba(255,249,237,0.98),rgba(245,224,196,0.94))] p-7 shadow-[0_34px_88px_-56px_rgba(58,39,24,0.42)] sm:p-8 lg:p-10"
      >
        <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-terracotta">Expresso Cuiabar</p>
            <h1 className="mt-3 max-w-3xl font-heading text-[2.8rem] leading-[0.9] text-cocoa sm:text-[4rem]">
              Marmitaria e pratos do dia.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-steel sm:text-lg">
              A frente Expresso concentra a operação de almoço, marmitas, pratos do dia e canais oficiais de delivery da
              casa.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a className="btn-primary" href={siteConfig.orderLinks.direct}>
                Pedir no site
              </a>
              <Link className="btn-secondary" to="/delivery">
                Ver canais
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            {serviceWindows.map((item) => (
              <div key={item.label} className="rounded-[1.5rem] border border-cocoa/10 bg-white/74 p-5">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-terracotta">{item.label}</p>
                <p className="mt-3 text-lg font-semibold text-cocoa">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="card p-7 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-terracotta">Canais disponíveis</p>
            <h2 className="mt-3 font-heading text-4xl text-cocoa">Pedido sem desvio.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-steel">
              Para escolher entre site próprio, iFood e 99Food, use a página limpa de delivery.
            </p>
          </div>
          <Link to="/delivery" className="btn-primary w-fit">
            Abrir delivery
          </Link>
        </div>
      </Reveal>

      <Reveal as="section">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-terracotta">Destaques da casa</p>
            <h2 className="mt-3 font-heading text-4xl text-cocoa">Itens que puxam pedido no almoço.</h2>
          </div>
          <Link to={siteConfig.menuPageUrl} className="btn-secondary w-fit">
            Ver menu completo
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {menuHighlights.slice(0, 3).map((item, index) => (
            <Reveal key={item.name} delay={index * 80} as="article" className="card overflow-hidden">
              <img src={item.image} alt={item.name} loading="lazy" className="media-lift h-48 w-full object-cover" />
              <div className="p-5">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-terracotta">{item.category}</p>
                <h3 className="mt-3 font-heading text-2xl text-cocoa">{item.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-steel">{item.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Reveal>
    </div>
  );
};

export default ExpressoPage;
