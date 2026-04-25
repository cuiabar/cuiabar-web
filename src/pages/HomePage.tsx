import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Reveal } from '../components/Reveal';
import { getRouteSeo } from '../data/seo';
import { useSeo } from '../hooks/useSeo';

type ExperienceId = 'presencial' | 'expresso' | 'espetaria';

const storageKey = 'cuiabar:last-experience';

const experiences = [
  {
    id: 'presencial' as const,
    eyebrow: 'Presencial',
    title: 'Restaurante e reservas.',
    description: 'Entre na frente presencial da casa.',
    to: '/presencial',
    highlights: ['Restaurante', 'Reservas'],
    accent:
      'bg-[linear-gradient(160deg,rgba(88,53,28,0.96),rgba(40,27,18,0.94))] text-white border-white/12',
    action:
      'border-white/24 bg-white/12 text-white hover:bg-white hover:text-cocoa',
  },
  {
    id: 'expresso' as const,
    eyebrow: 'Expresso',
    title: 'Delivery, burger e marmitex.',
    description: 'Entre na frente rápida da casa.',
    to: '/expresso',
    highlights: ['Delivery', 'Burger', 'Marmitex'],
    accent:
      'bg-[linear-gradient(160deg,rgba(255,246,226,0.98),rgba(245,224,196,0.94))] text-cocoa border-cocoa/10',
    action:
      'border-cocoa/14 bg-white/76 text-cocoa hover:border-terracotta/35 hover:bg-white hover:text-terracotta',
  },
  {
    id: 'espetaria' as const,
    eyebrow: 'Espetaria',
    title: 'Menu e local.',
    description: 'Entre na frente da espetaria.',
    to: '/espetaria',
    highlights: ['Menu', 'Local'],
    accent:
      'bg-[linear-gradient(160deg,rgba(42,87,54,0.96),rgba(71,42,23,0.95))] text-white border-white/12',
    action:
      'border-white/22 bg-white/10 text-white hover:bg-white hover:text-[#2f5e3e]',
  },
];

const HomePage = () => {
  const [lastExperience, setLastExperience] = useState<ExperienceId | null>(null);

  useSeo(getRouteSeo('/'));

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const stored = window.localStorage.getItem(storageKey);

    if (stored === 'presencial' || stored === 'expresso' || stored === 'espetaria') {
      setLastExperience(stored);
    }
  }, []);

  const rememberedExperience = useMemo(
    () => experiences.find((experience) => experience.id === lastExperience) ?? null,
    [lastExperience],
  );

  const rememberExperience = (id: ExperienceId) => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(storageKey, id);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,226,190,0.34),transparent_34%),linear-gradient(180deg,#f5ecdf_0%,#efe3d3_52%,#f8f2ea_100%)] text-cocoa">
      <div className="container-shell flex min-h-screen flex-col justify-between py-8 sm:py-10">
        <div className="space-y-8">
          <Reveal as="header" className="rounded-[2.4rem] border border-cocoa/10 bg-white/78 p-6 shadow-[0_35px_90px_-55px_rgba(58,39,24,0.45)] backdrop-blur md:p-8">
            <div className="max-w-3xl">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-terracotta">Cuiabar em Campinas</p>
                <h1 className="mt-3 font-heading text-[2.9rem] leading-[0.9] sm:text-[4rem] lg:text-[4.6rem]">
                  Escolha como quer entrar na casa.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-relaxed text-steel sm:text-lg">
                  Presencial, Expresso ou Espetaria.
                </p>
              </div>
          </Reveal>

          {rememberedExperience ? (
            <Reveal
              as="section"
              delay={80}
              className="flex flex-col gap-3 rounded-[1.8rem] border border-cocoa/10 bg-cocoa px-5 py-4 text-white shadow-[0_26px_72px_-46px_rgba(40,27,18,0.72)] sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-white/62">Último acesso</p>
                <h2 className="mt-2 font-heading text-2xl">{rememberedExperience.eyebrow}</h2>
              </div>
              <Link to={rememberedExperience.to} className="btn-secondary !border-white/18 !bg-white !text-cocoa hover:!bg-[#f5e8d3]">
                Continuar em {rememberedExperience.eyebrow}
              </Link>
            </Reveal>
          ) : null}

          <section className="grid gap-5 xl:grid-cols-3">
            {experiences.map((experience, index) => (
              <Reveal
                key={experience.id}
                delay={index * 90}
                as="article"
                className={`flex h-full flex-col justify-between rounded-[2.2rem] border p-6 shadow-[0_30px_78px_-52px_rgba(58,39,24,0.42)] ${experience.accent}`}
              >
                <div>
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] opacity-75">{experience.eyebrow}</p>
                  <h2 className="mt-3 font-heading text-[2.15rem] leading-[0.95] sm:text-[2.5rem]">{experience.title}</h2>
                  <p className="mt-4 max-w-md text-sm leading-relaxed opacity-90 sm:text-[0.98rem]">{experience.description}</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {experience.highlights.map((item) => (
                      <span key={item} className="rounded-full border border-current/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em]">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-8">
                  <Link
                    to={experience.to}
                    onClick={() => rememberExperience(experience.id)}
                    className={`inline-flex items-center rounded-full border px-5 py-3 text-sm font-semibold transition ${experience.action}`}
                  >
                    Entrar
                  </Link>
                </div>
              </Reveal>
            ))}
          </section>
        </div>

        <Reveal as="footer" delay={180} className="mt-8 flex flex-col gap-3 px-1 text-sm text-steel sm:flex-row sm:items-center sm:justify-between">
          <p>Escolha a frente e siga direto.</p>
          <Link to="/links" className="font-semibold text-cocoa transition hover:text-terracotta">
            Ver links rápidos da casa
          </Link>
        </Reveal>
      </div>
    </div>
  );
};

export default HomePage;
