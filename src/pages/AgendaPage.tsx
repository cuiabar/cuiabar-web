import { Link } from 'react-router-dom';
import { GoogleCalendarEmbed } from '../components/GoogleCalendarEmbed';
import { Reveal } from '../components/Reveal';
import { getRouteSeo } from '../data/seo';
import { siteConfig } from '../data/siteConfig';
import { liveMusicPrograms } from '../data/liveMusicPrograms';
import { useSeo } from '../hooks/useSeo';

const AgendaPage = () => {
  useSeo(getRouteSeo('/agenda'));

  return (
    <section className="container-shell space-y-10 py-14">
      <Reveal as="header" className="card p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-terracotta">Agenda oficial</p>
        <h1 className="mt-3 font-heading text-5xl">Agenda de música ao vivo no Villa Cuiabar</h1>
        <p className="mt-4 max-w-4xl text-base leading-relaxed text-steel">
          Hub oficial para acompanhar a programação recorrente da casa, entender o perfil de cada dia e chegar com mais contexto para
          reservar, jantar ou planejar um encontro no Jardim Aurelia.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={siteConfig.reservationPortalUrl} target="_blank" rel="noreferrer" className="btn-primary">
            Reservar online
          </a>
          <Link to="/bar-jardim-aurelia-musica-ao-vivo" className="btn-secondary">
            Ver guia local de bar e shows
          </Link>
        </div>
      </Reveal>

      <Reveal as="section" delay={60} className="grid gap-4 lg:grid-cols-3">
        {liveMusicPrograms.map((program, index) => (
          <Reveal key={program.slug} as="article" delay={index * 80} className="card overflow-hidden">
            <img src={program.image} alt={program.shortTitle} loading="lazy" className="h-48 w-full object-cover" />
            <div className="p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta">{program.dayLabel}</p>
              <h2 className="mt-2 font-heading text-3xl">{program.shortTitle}</h2>
              <p className="mt-3 text-sm leading-relaxed text-steel">{program.summary}</p>
              <p className="mt-4 rounded-xl border border-sand/50 bg-white px-4 py-3 text-sm text-steel">{program.reservationHint}</p>
              <Link to={`/agenda/${program.slug}`} className="btn-secondary mt-5 inline-flex">
                Abrir página da programação
              </Link>
            </div>
          </Reveal>
        ))}
      </Reveal>

      <Reveal delay={100}>
        <GoogleCalendarEmbed
          src={siteConfig.calendarEmbedUrl}
          title="Calendário público da programação"
          description="Use o calendário oficial como apoio para confirmar a agenda publicada pela casa."
        />
      </Reveal>

      <Reveal delay={120} className="card p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-terracotta">Como usar a agenda</p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-sand/50 bg-white p-5">
            <h2 className="font-heading text-2xl">Escolha o perfil do dia</h2>
            <p className="mt-2 text-sm leading-relaxed text-steel">Cada página explica melhor a proposta de sexta, sábado e domingo para evitar ruído na expectativa.</p>
          </article>
          <article className="rounded-xl border border-sand/50 bg-white p-5">
            <h2 className="font-heading text-2xl">Reserve quando fizer sentido</h2>
            <p className="mt-2 text-sm leading-relaxed text-steel">A programação existe para atrair encontro, grupo e aniversário. Reserva ajuda bastante em dias mais quentes.</p>
          </article>
          <article className="rounded-xl border border-sand/50 bg-white p-5">
            <h2 className="font-heading text-2xl">Conecte com o restante do site</h2>
            <p className="mt-2 text-sm leading-relaxed text-steel">Agenda, blog, menu, reservas e páginas locais agora se reforçam mutuamente para ampliar alcance orgânico.</p>
          </article>
        </div>
      </Reveal>
    </section>
  );
};

export default AgendaPage;
