import { Link } from 'react-router-dom';
import { Reveal } from '../components/Reveal';
import { SectionHeading } from '../components/SectionHeading';
import { liveMusicPrograms } from '../data/liveMusicPrograms';

export const AgendaPreviewSection = () => (
  <section className="container-shell py-12">
    <Reveal className="card p-6 sm:p-8">
      <SectionHeading
        eyebrow="Agenda"
        title="Programação recorrente de música ao vivo no Villa Cuiabar"
        description="Agora a agenda da casa também existe em páginas próprias, com contexto local, links internos e estrutura pronta para indexação."
      />
      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {liveMusicPrograms.map((program, index) => (
          <Reveal
            key={program.slug}
            as="article"
            delay={index * 80}
            className="overflow-hidden rounded-2xl border border-sand/50 bg-white shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-30px_rgba(51,35,19,0.44)]"
          >
            <img src={program.image} alt={program.shortTitle} loading="lazy" className="h-44 w-full object-cover" />
            <div className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta">{program.eyebrow}</p>
              <h3 className="mt-2 font-heading text-2xl text-cocoa">{program.shortTitle}</h3>
              <p className="mt-3 text-sm leading-relaxed text-steel">{program.teaser}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {program.keywords.slice(0, 2).map((keyword) => (
                  <span key={keyword} className="rounded-full border border-sand/60 bg-butter px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-cocoa">
                    {keyword}
                  </span>
                ))}
              </div>
              <Link to={`/agenda/${program.slug}`} className="btn-secondary mt-6 inline-flex">
                Ver programação
              </Link>
            </div>
          </Reveal>
        ))}
      </div>
      <div className="mt-8">
        <Link to="/agenda" className="btn-primary">
          Abrir agenda completa
        </Link>
      </div>
    </Reveal>
  </section>
);
