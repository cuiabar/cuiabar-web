import { Reveal } from '../components/Reveal';
import { getRouteSeo } from '../data/seo';
import { useSeo } from '../hooks/useSeo';

const vacancies = [
  {
    title: 'Garçom / Atendente',
    image: '/vagas/garcom-atendente.jpg',
    available: true,
    description:
      'Vaga para atendimento ao cliente, apoio no salão e rotina de serviço com atenção, agilidade e boa comunicação.',
    points: ['Atendimento no salão e suporte ao cliente', 'Organização da operação durante o serviço', 'Preenchimento da candidatura pelo formulário online'],
    link: 'https://form.jotform.com/260333305064042',
    buttonLabel: 'Candidatar-se para Garçom / Atendente',
  },
  {
    title: 'Aux. Cozinha',
    image: '/vagas/copa-aux-limpeza.jpg',
    available: true,
    description:
      'Vaga para apoio à cozinha, preparo inicial, organização da praça e suporte à rotina operacional com atenção e agilidade.',
    points: ['Apoio à cozinha e organização da operação', 'Suporte ao preparo e rotina interna da casa', 'Preenchimento da candidatura pelo formulário online'],
    link: 'https://form.jotform.com/260393456143053',
    buttonLabel: 'Candidatar-se para Aux. Cozinha',
  },
  {
    title: 'Copa / Aux. Limpeza',
    image: '/vagas/copa-aux-limpeza.jpg',
    available: true,
    description:
      'Vaga focada em apoio operacional, limpeza, organização de ambiente e suporte à rotina interna do restaurante.',
    points: ['Apoio à copa e limpeza dos ambientes', 'Organização da operação interna no dia a dia', 'Preenchimento da candidatura pelo formulário online'],
    link: 'https://form.jotform.com/260704346211043',
    buttonLabel: 'Candidatar-se para Copa / Aux. Limpeza',
  },
];

const VagasPage = () => {
  useSeo(getRouteSeo('/vagas'));

  return (
    <section className="container-shell space-y-10 py-14">
      <Reveal as="header" className="card overflow-hidden p-0">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5 p-8 sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-terracotta">Trabalhe com a gente</p>
            <h1 className="font-heading text-4xl leading-tight text-cocoa sm:text-5xl">
              Vagas abertas para quem quer crescer com o time do Villa Cuiabar
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-steel sm:text-lg">
              Se você quer fazer parte da operação da casa, escolha a função e preencha o formulário oficial. O envio da
              candidatura é feito direto pelo Jotform.
            </p>
          </div>
          <div className="relative min-h-[280px]">
            <img
              src="/vagas/garcom-atendente.jpg"
              alt="Elaine em ambiente de atendimento no Villa Cuiabar"
              loading="eager"
              className="media-lift h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-cocoa/65 via-cocoa/10 to-transparent" />
          </div>
        </div>
      </Reveal>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {vacancies.map((vacancy, index) => (
          <Reveal
            key={vacancy.title}
            as="article"
            delay={index * 90}
            className={`card overflow-hidden p-0 ${vacancy.available ? '' : 'border-stone-300 bg-stone-100/90'}`}
          >
            <div className="relative">
              <img
                src={vacancy.image}
                alt={vacancy.title}
                loading="lazy"
                className={`h-64 w-full object-cover ${vacancy.available ? 'media-lift' : 'grayscale-[0.95] saturate-0 opacity-80'}`}
              />
              {!vacancy.available ? (
                <>
                  <div className="absolute inset-0 bg-[repeating-linear-gradient(-45deg,rgba(255,255,255,0.08)_0,rgba(255,255,255,0.08)_14px,rgba(57,57,57,0.18)_14px,rgba(57,57,57,0.18)_28px)]" />
                  <div className="absolute left-4 right-4 top-4 rounded-full border border-white/40 bg-stone-800/85 px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.24em] text-white">
                    Vaga indisponível no momento
                  </div>
                </>
              ) : null}
            </div>
            <div className="space-y-5 p-6 sm:p-8">
              <div>
                <p
                  className={`text-sm font-semibold uppercase tracking-[0.2em] ${
                    vacancy.available ? 'text-terracotta' : 'text-stone-500'
                  }`}
                >
                  {vacancy.available ? 'Vaga aberta' : 'Seleção pausada'}
                </p>
                <h2 className={`mt-2 font-heading text-3xl ${vacancy.available ? 'text-cocoa' : 'text-stone-700'}`}>{vacancy.title}</h2>
                <p className={`mt-3 ${vacancy.available ? 'text-steel' : 'text-stone-600'}`}>{vacancy.description}</p>
              </div>

              <ul className={`space-y-2 text-sm ${vacancy.available ? 'text-steel' : 'text-stone-600'}`}>
                {vacancy.points.map((point) => (
                  <li key={point} className={`rounded-2xl px-4 py-3 ${vacancy.available ? 'bg-cream/75' : 'bg-stone-200/90'}`}>
                    {point}
                  </li>
                ))}
              </ul>

              {vacancy.available ? (
                <a href={vacancy.link} target="_blank" rel="noreferrer" className="btn-primary">
                  {vacancy.buttonLabel}
                </a>
              ) : (
                <p className="rounded-2xl border border-dashed border-stone-400 px-4 py-3 text-sm font-medium text-stone-600">
                  Essa função está temporariamente indisponível para novas candidaturas.
                </p>
              )}
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal as="section" delay={160} className="card p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-terracotta">Como funciona</p>
        <ol className="mt-4 list-decimal space-y-2 pl-6 text-steel">
          <li>Escolha a vaga que combina com seu perfil.</li>
          <li>Abra o formulário oficial da função.</li>
          <li>Preencha seus dados e envie a candidatura.</li>
        </ol>
      </Reveal>
    </section>
  );
};

export default VagasPage;
