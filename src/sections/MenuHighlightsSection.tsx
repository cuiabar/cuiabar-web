import { Link } from 'react-router-dom';
import { Reveal } from '../components/Reveal';
import { SectionHeading } from '../components/SectionHeading';
import { menuHighlights } from '../data/content';
import { siteConfig } from '../data/siteConfig';

export const MenuHighlightsSection = () => (
  <section className="container-shell py-12">
    <Reveal className="card p-6 sm:p-8">
      <SectionHeading
        eyebrow="Menu"
        title="Alguns dos pratos que fazem o Villa Cuiabar rodar forte no delivery"
        description="Seleção baseada no cardápio atual da casa para quem quer abrir o menu completo e pedir sem atrito."
      />
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {menuHighlights.map((item, index) => (
          <Reveal key={item.name} as="article" delay={index * 80} className="overflow-hidden rounded-2xl border border-sand/50 bg-white shadow-soft transition duration-500 hover:-translate-y-1 hover:shadow-[0_24px_60px_-26px_rgba(51,35,19,0.55)]">
            <img src={item.image} alt={item.name} loading="lazy" className="media-lift h-44 w-full object-cover" />
            <div className="p-4">
              <p className="text-xs uppercase tracking-wider text-terracotta">{item.category}</p>
              <h3 className="mt-1 font-heading text-2xl">{item.name}</h3>
              <p className="mt-2 text-sm text-steel">{item.description}</p>
              <p className="mt-3 font-semibold text-cocoa">{item.price}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/menu" className="btn-primary">Abrir menu completo</Link>
        <a href={siteConfig.orderLinks.direct} target="_blank" rel="noreferrer" className="btn-secondary">
          Pedir no site
        </a>
      </div>
    </Reveal>
  </section>
);
