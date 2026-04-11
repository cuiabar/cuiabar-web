import { Link } from 'react-router-dom';
import { Reveal } from '../components/Reveal';
import { localGuideList, localGuides, type LocalGuideKey } from '../data/localGuides';
import { getRouteSeo } from '../data/seo';
import { siteConfig } from '../data/siteConfig';
import { useSeo } from '../hooks/useSeo';

type LocalGuidePageProps = {
  pageKey: LocalGuideKey;
};

const LocalGuidePage = ({ pageKey }: LocalGuidePageProps) => {
  const guide = localGuides[pageKey];
  const relatedGuides = localGuideList.filter((item) => item.key !== pageKey);

  useSeo(getRouteSeo(guide.path));

  return (
    <section className="container-shell space-y-10 py-14">
      <Reveal as="header" className="card p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-terracotta">{guide.eyebrow}</p>
        <h1 className="mt-3 font-heading text-5xl">{guide.title}</h1>
        <p className="mt-4 max-w-4xl text-base leading-relaxed text-steel">{guide.description}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {guide.chips.map((chip) => (
            <span key={chip} className="rounded-full border border-sand/60 bg-butter px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-cocoa">
              {chip}
            </span>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          {guide.ctas.map((cta) =>
            cta.external ? (
              <a key={cta.label} href={cta.href} target="_blank" rel="noreferrer" className="btn-primary">
                {cta.label}
              </a>
            ) : (
              <Link key={cta.label} to={cta.href} className="btn-primary">
                {cta.label}
              </Link>
            ),
          )}
        </div>
      </Reveal>

      <Reveal as="section" delay={60} className="grid gap-4 lg:grid-cols-3">
        {guide.highlights.map((item, index) => (
          <Reveal key={item.title} as="article" delay={index * 70} className="card p-6">
            <h2 className="font-heading text-3xl">{item.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-steel">{item.description}</p>
          </Reveal>
        ))}
      </Reveal>

      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <Reveal as="section" delay={80} className="card p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-terracotta">Sinais locais</p>
          <h2 className="mt-3 font-heading text-4xl">Por que esta pagina importa para a regiao</h2>
          <div className="mt-5 space-y-3 text-steel">
            {guide.visitSignals.map((signal) => (
              <p key={signal} className="rounded-xl border border-sand/50 bg-white px-4 py-3 text-sm leading-relaxed">
                {signal}
              </p>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-sand/50 bg-butter p-5">
            <p className="text-sm font-semibold text-cocoa">Endereco base</p>
            <p className="mt-2 text-sm leading-relaxed text-steel">{siteConfig.address}</p>
            <p className="mt-3 text-sm leading-relaxed text-steel">
              Referencia forte para quem circula pelo <strong>{siteConfig.corridor}</strong> e procura restaurante, bar, reservas ou musica ao vivo perto do bairro.
            </p>
          </div>
        </Reveal>

        <Reveal as="section" delay={100} className="card p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-terracotta">Perguntas frequentes</p>
          <div className="mt-5 space-y-4">
            {guide.faqs.map((faq) => (
              <article key={faq.question} className="rounded-xl border border-sand/50 bg-white p-4">
                <h3 className="font-semibold text-cocoa">{faq.question}</h3>
                <p className="mt-2 text-sm leading-relaxed text-steel">{faq.answer}</p>
              </article>
            ))}
          </div>
        </Reveal>
      </div>

      <Reveal delay={120} className="card p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-terracotta">Paginas relacionadas</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {relatedGuides.map((relatedGuide) => (
            <Link key={relatedGuide.key} to={relatedGuide.path} className="rounded-2xl border border-sand/50 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-terracotta">{relatedGuide.eyebrow}</p>
              <h2 className="mt-2 font-heading text-3xl text-cocoa">{relatedGuide.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-steel">{relatedGuide.description}</p>
            </Link>
          ))}
        </div>
      </Reveal>
    </section>
  );
};

export default LocalGuidePage;
