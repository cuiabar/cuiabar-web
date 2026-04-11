import { differentiators } from '../data/content';
import { Reveal } from '../components/Reveal';
import { SectionHeading } from '../components/SectionHeading';

export const DifferentialsSection = () => (
  <section className="container-shell py-12">
    <Reveal>
      <SectionHeading
        eyebrow="Diferenciais"
        title="O lugar certo para almoço, happy hour e encontro em família"
        description="Estrutura pensada para atender bem no delivery, no presencial e nas noites com música ao vivo em Campinas."
      />
    </Reveal>
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {differentiators.map((item, index) => (
        <Reveal key={item.title} as="article" delay={index * 70} className="card p-5">
          <span className="text-2xl" aria-hidden>{item.icon}</span>
          <h3 className="mt-3 font-heading text-xl">{item.title}</h3>
          <p className="mt-2 text-sm text-steel">{item.description}</p>
        </Reveal>
      ))}
    </div>
  </section>
);
