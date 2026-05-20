import { GoogleCalendarEmbed } from '../components/GoogleCalendarEmbed';
import { Reveal } from '../components/Reveal';
import { getRouteSeo } from '../data/seo';
import { siteConfig } from '../data/siteConfig';
import { useSeo } from '../hooks/useSeo';

const AgendaPage = () => {
  useSeo(getRouteSeo('/agenda'));

  return (
    <section className="container-shell space-y-8 overflow-x-hidden py-14">
      <Reveal as="header" className="max-w-[22.5rem] overflow-hidden rounded-[1.2rem] bg-cocoa p-8 text-white shadow-[0_30px_90px_-58px_rgba(51,35,19,0.72)] sm:max-w-none md:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-terracotta">Agenda oficial</p>
        <h1 className="mt-3 max-w-4xl font-heading text-4xl leading-none md:text-6xl">Música ao vivo no Villa Cuiabar</h1>
        <p className="mt-5 max-w-4xl text-lg leading-relaxed text-white/78">
          Uma casa brasileira que preza pela brasilidade: MPB, samba, sertanejo e repertórios que combinam com mesa cheia, comida boa e encontro em Campinas.
        </p>
        <div className="mt-7 flex flex-wrap gap-2 text-sm font-semibold">
          {['MPB', 'Samba', 'Sertanejo', 'Brasilidade'].map((genre) => (
            <span key={genre} className="rounded-full border border-white/18 bg-white/8 px-4 py-2 text-white/90">
              {genre}
            </span>
          ))}
        </div>
      </Reveal>

      <Reveal delay={100}>
        <div className="max-w-[22.5rem] rounded-[1.25rem] border border-gold/30 bg-[#fff8ea] p-3 shadow-[0_32px_90px_-64px_rgba(51,35,19,0.68)] sm:max-w-none sm:p-4">
          <GoogleCalendarEmbed
            src={siteConfig.calendarEmbedUrl}
            title="Agenda Google oficial"
            description="Confira a programação publicada pela casa e acompanhe as próximas datas de música ao vivo."
          />
        </div>
      </Reveal>
    </section>
  );
};

export default AgendaPage;
