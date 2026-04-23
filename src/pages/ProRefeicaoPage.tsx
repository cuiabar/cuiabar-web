import { Reveal } from '../components/Reveal';
import { getRouteSeo } from '../data/seo';
import { siteConfig } from '../data/siteConfig';
import { useSeo } from '../hooks/useSeo';
import '../styles/pro-refeicao.css';

const trustSignals = [
  {
    label: 'Formato',
    value: 'Operação recorrente',
    detail: 'Atendimento pensado para rotina, volume e previsibilidade comercial.',
  },
  {
    label: 'Entrega',
    value: 'Embalagem selada',
    detail: 'Apresentação profissional com foco em integridade até o consumo.',
  },
  {
    label: 'Atuação',
    value: 'Campinas e entorno',
    detail: 'Solução B2B da Cuiabar para empresas, clínicas, obras e equipes externas.',
  },
];

const operationalPillars = [
  {
    title: 'Operação contínua',
    description: 'Rotina organizada para almoço, jantar e fornecimento recorrente sem improviso.',
  },
  {
    title: 'Logística previsível',
    description: 'Fluxo alinhado por volume, horário, frequência e perfil da operação atendida.',
  },
  {
    title: 'Padrão visual',
    description: 'Apresentação consistente em lotes e turnos, com embalagem própria para cenário corporativo.',
  },
  {
    title: 'Canal comercial direto',
    description: 'Contato claro para orçamento, ajustes operacionais e expansão de atendimento.',
  },
];

const servedSegments = [
  'Escritórios e sedes administrativas',
  'Clínicas, hospitais e casas de repouso',
  'Indústrias e operações fabris',
  'Obras, construtoras e equipes externas',
  'Condomínios corporativos e centros logísticos',
  'Rotinas com almoço e jantar recorrentes',
];

const packagingPoints = [
  'Bowls selados para reforçar segurança, apresentação e consistência operacional.',
  'Montagem padronizada para manter o mesmo padrão entre lotes e turnos.',
  'Transporte pensado para preservar integridade do pedido até a entrega.',
  'Retenção térmica para apoiar qualidade sensorial no momento da refeição.',
];

const patBenefits = [
  {
    title: 'Benefício alimentar com rotina',
    description: 'Estruture o fornecimento como processo estável, não como solução improvisada de última hora.',
  },
  {
    title: 'Mais previsibilidade para a empresa',
    description: 'Organize horários, turnos e frequência com uma base operacional mais clara e controlável.',
  },
  {
    title: 'Experiência melhor para a equipe',
    description: 'Uma operação alimentar estável reforça cuidado, percepção de valor e regularidade no dia a dia.',
  },
];

const commercialSteps = [
  'Levantamento de volume, turnos, frequência e perfil da operação.',
  'Definição do formato de atendimento, cardápio-base e rotina logística.',
  'Início da operação com acompanhamento próximo e canal comercial direto.',
];

const showcaseMeals = [
  {
    src: '/prorefeicao/marmita-parmegiana.png',
    alt: 'Marmita corporativa com parmegiana, arroz, feijão e fritas',
    className: 'pro-stage-card pro-stage-card-main',
  },
  {
    src: '/prorefeicao/marmita-carne.png',
    alt: 'Marmita corporativa com carne acebolada, arroz, feijão, fritas e brócolis',
    className: 'pro-stage-card pro-stage-card-support',
  },
];

const ProRefeicaoPage = () => {
  const commercialHref = `https://wa.me/${siteConfig.commercialWhatsappNumber}?text=${encodeURIComponent(siteConfig.commercialWhatsappMessage)}`;

  useSeo({
    ...getRouteSeo('/prorefeicao'),
    canonicalUrl: siteConfig.prorefeicaoOrigin,
  });

  return (
    <div className="pro-page">
      <section className="container-shell py-12 sm:py-14 lg:py-16">
        <Reveal as="header" className="pro-hero">
          <div className="pro-hero-grid">
            <div className="pro-hero-copy">
              <div className="pro-brand-lockup">
                <img
                  src="/prorefeicao/logo-prorefeicao.png"
                  alt="ProRefeição"
                  width="180"
                  height="44"
                  decoding="async"
                  className="h-9 w-auto sm:h-10"
                />
                <span className="pro-brand-pill">Alimentação corporativa em Campinas</span>
                <a href={siteConfig.siteOrigin} className="pro-host-backlink">
                  Voltar para cuiabar.com
                </a>
              </div>

              <div className="pro-copy-stack">
                <p className="pro-kicker">Frente B2B da Cuiabar</p>
                <h1 className="pro-hero-title">Refeição corporativa com linguagem de operação séria.</h1>
                <p className="pro-hero-lead">
                  O ProRefeição foi desenhado para empresas que precisam de previsibilidade, boa apresentação e rotina organizada.
                  Atendemos escritórios, clínicas, indústrias, obras e equipes externas com uma lógica clara de produção e entrega.
                </p>
              </div>

              <div className="pro-actions">
                <a href={commercialHref} target="_blank" rel="noreferrer" className="btn-primary">
                  Falar com o comercial
                </a>
                <a href="#estrutura" className="pro-outline-action">
                  Ver como funciona
                </a>
              </div>

              <dl className="pro-trust-strip">
                {trustSignals.map((signal) => (
                  <div key={signal.label} className="pro-trust-item">
                    <dt className="pro-trust-label">{signal.label}</dt>
                    <dd className="pro-trust-value">{signal.value}</dd>
                    <dd className="pro-trust-detail">{signal.detail}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="pro-stage">
              <div className="pro-stage-glow pro-stage-glow-primary" />
              <div className="pro-stage-glow pro-stage-glow-secondary" />
              {showcaseMeals.map((meal) => (
                <div key={meal.src} className={meal.className}>
                  <div className="pro-stage-frame">
                    <img
                      src={meal.src}
                      alt={meal.alt}
                      width="620"
                      height="620"
                      loading="lazy"
                      decoding="async"
                      className="pro-stage-image"
                    />
                  </div>
                </div>
              ))}

              <article className="pro-stage-note">
                <p className="pro-stage-note-label">Prova visual da operação</p>
                <h2 className="pro-stage-note-title">Embalagem selada, leitura imediata e apresentação profissional.</h2>
                <p className="pro-stage-note-copy">
                  A imagem da marmita precisa comunicar integridade, padrão e prontidão. Esse é o núcleo visual da frente ProRefeição.
                </p>
              </article>
            </div>
          </div>
        </Reveal>

        <div id="estrutura" className="mt-8 grid gap-6 lg:grid-cols-[1.04fr_0.96fr]">
          <Reveal as="section" className="pro-surface pro-surface-light">
            <div className="pro-section-head">
              <p className="pro-kicker">Estrutura de atendimento</p>
              <h2 className="pro-section-title">Uma frente comercial pensada para rotina, não para improviso.</h2>
            </div>
            <div className="pro-rich-text">
              <p>
                O ProRefeição organiza atendimento corporativo com lógica própria: volume, frequência, janela de entrega e padrão de montagem.
                Isso reduz atrito comercial e deixa a operação mais simples de entender para quem contrata.
              </p>
              <p>
                Em vez de vender apenas um cardápio, a página precisa transmitir método. O cliente deve perceber que existe capacidade de atender
                recorrência, alinhar escopo e sustentar qualidade visual e operacional.
              </p>
            </div>
            <div className="pro-pillar-grid">
              {operationalPillars.map((pillar) => (
                <article key={pillar.title} className="pro-pillar-card">
                  <h3>{pillar.title}</h3>
                  <p>{pillar.description}</p>
                </article>
              ))}
            </div>
          </Reveal>

          <Reveal as="section" delay={90} className="pro-surface pro-surface-plain">
            <div className="pro-section-head">
              <p className="pro-kicker">Onde faz sentido</p>
              <h2 className="pro-section-title">Perfis de operação que combinam com a proposta da casa.</h2>
            </div>
            <div className="pro-segment-list">
              {servedSegments.map((segment) => (
                <div key={segment} className="pro-segment-item">
                  <span className="pro-segment-bullet" aria-hidden="true" />
                  <span>{segment}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.94fr_1.06fr]">
          <Reveal as="section" delay={120} className="pro-surface pro-surface-tinted">
            <div className="pro-section-head">
              <p className="pro-kicker">Qualidade na entrega</p>
              <h2 className="pro-section-title">Legibilidade comercial também vem da embalagem.</h2>
            </div>
            <div className="pro-rich-text">
              <p>
                A frente ProRefeição precisa vender confiança no primeiro olhar. Por isso a embalagem selada não é um detalhe estético:
                ela é parte da promessa de integridade, apresentação profissional e estabilidade entre lotes.
              </p>
            </div>
            <div className="pro-check-grid">
              {packagingPoints.map((point) => (
                <article key={point} className="pro-check-card">
                  <span className="pro-check-icon" aria-hidden="true">
                    ✓
                  </span>
                  <p>{point}</p>
                </article>
              ))}
            </div>
          </Reveal>

          <Reveal as="section" delay={160} className="pro-surface pro-surface-olive">
            <div className="pro-section-head">
              <p className="pro-kicker">PAT e continuidade</p>
              <h2 className="pro-section-title">Fornecimento recorrente ajuda a estruturar a alimentação do trabalhador.</h2>
            </div>
            <div className="pro-benefit-stack">
              {patBenefits.map((benefit) => (
                <article key={benefit.title} className="pro-benefit-card">
                  <h3>{benefit.title}</h3>
                  <p>{benefit.description}</p>
                </article>
              ))}
            </div>
          </Reveal>
        </div>

        <Reveal as="section" id="contato" delay={210} className="pro-cta-band">
          <div className="pro-cta-grid">
            <div className="pro-cta-copy">
              <p className="pro-kicker pro-kicker-light">Canal comercial</p>
              <h2 className="pro-cta-title">Entre com o cenário da sua operação. O restante a gente organiza com você.</h2>
              <p className="pro-cta-lead">
                Use o WhatsApp comercial para apresentar volume, frequência, turnos e tipo de operação. O contato vai direto para o canal oficial da Cuiabar.
              </p>
              <div className="pro-actions">
                <a href={commercialHref} target="_blank" rel="noreferrer" className="btn-primary">
                  Chamar no WhatsApp
                </a>
                <a href="mailto:cuiabar@cuiabar.net" className="pro-outline-action pro-outline-action-light">
                  Enviar e-mail
                </a>
              </div>
            </div>

            <div className="pro-step-panel">
              <p className="pro-step-label">Fluxo de entrada</p>
              <ol className="pro-step-list">
                {commercialSteps.map((step, index) => (
                  <li key={step} className="pro-step-item">
                    <span className="pro-step-index">{index + 1}</span>
                    <span className="pro-step-copy">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
};

export default ProRefeicaoPage;
