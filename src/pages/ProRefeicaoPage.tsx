import { Reveal } from '../components/Reveal';
import { getRouteSeo } from '../data/seo';
import { siteConfig } from '../data/siteConfig';
import { useSeo } from '../hooks/useSeo';
import '../styles/pro-refeicao.css';

const quickFacts = [
  { label: 'Base', value: 'Campinas' },
  { label: 'Formato', value: 'Almoço e jantar corporativo' },
  { label: 'Operação', value: 'Recorrente e sob alinhamento comercial' },
];

const audienceGroups = [
  'Escritórios e sedes administrativas',
  'Clínicas, hospitais e casas de repouso',
  'Indústrias, obras e equipes externas',
  'Condomínios corporativos e centros logísticos',
];

const serviceFormats = [
  {
    title: 'Rotina previsível',
    description: 'Volume, frequência, janela de entrega e formato de atendimento entram no desenho comercial desde o início.',
  },
  {
    title: 'Leitura profissional',
    description: 'A apresentação da refeição precisa comunicar organização e cuidado antes mesmo do consumo.',
  },
  {
    title: 'Canal direto',
    description: 'O contato comercial fica orientado a orçamento, ajuste de operação e expansão de demanda recorrente.',
  },
];

const workflowSteps = [
  {
    title: 'Entendimento da operação',
    description: 'Mapeamos local, turnos, frequência, quantidade estimada e perfil da equipe atendida.',
  },
  {
    title: 'Definição do formato',
    description: 'Alinhamos cardápio-base, recorrência, logística e critérios de apresentação para a sua rotina.',
  },
  {
    title: 'Início com acompanhamento',
    description: 'A operação começa com canal comercial direto para ajustes finos e estabilização do fluxo.',
  },
];

const deliveryPoints = [
  'Bowls selados que reforçam integridade e padrão visual.',
  'Montagem consistente entre lotes, dias e turnos.',
  'Transporte pensado para preservar a leitura do produto até a entrega.',
  'Apresentação mais alinhada ao contexto corporativo do que ao delivery casual.',
];

const credibilityBlocks = [
  {
    eyebrow: 'Atendimento B2B',
    title: 'Alimentação corporativa em Campinas com linguagem mais clara para quem contrata.',
    body:
      'O ProRefeição existe para empresas que não querem improviso. A proposta não é vender apenas um prato, mas uma operação de refeição corporativa com escopo entendível, padrão visual e conversa comercial objetiva.',
  },
  {
    eyebrow: 'Operação e imagem',
    title: 'A embalagem certa ajuda na percepção de qualidade e também na indexação da proposta.',
    body:
      'Quando a página mostra embalagem selada, atendimento recorrente, refeição para empresa e atuação em Campinas com clareza, ela melhora a leitura tanto para o comprador quanto para mecanismos de busca.',
  },
];

const faqItems = [
  {
    question: 'Quais empresas o ProRefeição atende em Campinas?',
    answer:
      'A frente comercial foi desenhada para escritórios, clínicas, hospitais, indústrias, obras, centros logísticos e equipes externas que precisam de refeição corporativa com rotina organizada em Campinas e entorno.',
  },
  {
    question: 'O atendimento é só para almoço corporativo?',
    answer:
      'Não. O formato pode ser alinhado para almoço, jantar ou operação recorrente com mais de uma janela, sempre conforme volume, frequência e logística definidos no contato comercial.',
  },
  {
    question: 'Como funciona o orçamento para marmitas empresariais?',
    answer:
      'O primeiro passo é enviar cenário de operação, quantidade estimada, turnos, frequência e local de atendimento. A partir disso o time comercial estrutura o formato adequado para a empresa.',
  },
  {
    question: 'A embalagem é adequada para operação empresarial?',
    answer:
      'Sim. A página e a proposta comercial enfatizam bowls selados com padrão visual consistente, pensados para preservar integridade, leitura do produto e apresentação profissional.',
  },
];

const galleryMeals = [
  {
    src: '/prorefeicao/marmita-parmegiana.png',
    webp: '/prorefeicao/marmita-parmegiana.webp',
    alt: 'Marmita corporativa com parmegiana, arroz, feijão e fritas',
    width: 1024,
    height: 1024,
    className: 'pro-gallery-card pro-gallery-card-primary',
  },
  {
    src: '/prorefeicao/marmita-carne.png',
    webp: '/prorefeicao/marmita-carne.webp',
    alt: 'Marmita corporativa com carne acebolada, arroz, feijão, fritas e brócolis',
    width: 1024,
    height: 1024,
    className: 'pro-gallery-card pro-gallery-card-secondary',
  },
  {
    src: '/prorefeicao/marmita-mix.png',
    webp: '/prorefeicao/marmita-mix.webp',
    alt: 'Variedade de marmitas corporativas seladas em embalagem redonda preta',
    width: 1024,
    height: 1024,
    className: 'pro-gallery-card pro-gallery-card-tertiary',
  },
];

const ProRefeicaoPage = () => {
  const commercialHref = `https://wa.me/${siteConfig.commercialWhatsappNumber}?text=${encodeURIComponent(siteConfig.commercialWhatsappMessage)}`;

  useSeo({
    ...getRouteSeo('/prorefeicao'),
    canonicalUrl: siteConfig.prorefeicaoOrigin,
  });

  return (
    <article className="pro-page">
      <header className="pro-hero-shell">
        <div className="pro-hero-backdrop" aria-hidden="true" />
        <div className="pro-hero-grid">
          <Reveal className="pro-hero-copy" as="div">
            <div className="pro-brand-bar">
              <img
                src="/prorefeicao/logo-prorefeicao.png"
                alt="ProRefeição"
                width="180"
                height="44"
                decoding="async"
                className="h-10 w-auto"
              />
              <a href={siteConfig.siteOrigin} className="pro-host-backlink">
                Voltar para cuiabar.com
              </a>
            </div>

            <p className="pro-eyebrow">Frente corporativa da Cuiabar em Campinas</p>
            <h1 className="pro-hero-title">Refeição corporativa com apresentação forte, rotina clara e leitura profissional.</h1>
            <p className="pro-hero-lead">
              O ProRefeição atende empresas que precisam de alimentação corporativa em Campinas com mais previsibilidade comercial,
              embalagem selada e estrutura de operação entendível para almoço, jantar e atendimento recorrente.
            </p>

            <div className="pro-hero-actions">
              <a href={commercialHref} target="_blank" rel="noreferrer" className="btn-primary">
                Falar com o comercial
              </a>
              <a href="#como-funciona" className="pro-outline-action">
                Ver como funciona
              </a>
            </div>

            <dl className="pro-hero-facts" aria-label="Resumo do atendimento">
              {quickFacts.map((fact) => (
                <div key={fact.label} className="pro-hero-fact">
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal as="div" delay={70} className="pro-hero-visual">
            <div className="pro-visual-frame">
              <div className="pro-visual-radial pro-visual-radial-primary" />
              <div className="pro-visual-radial pro-visual-radial-secondary" />

              {galleryMeals.map((meal) => (
                <figure key={meal.src} className={meal.className}>
                  <picture>
                    <source srcSet={meal.webp} type="image/webp" />
                    <img
                      src={meal.src}
                      alt={meal.alt}
                      width={meal.width}
                      height={meal.height}
                      loading="lazy"
                      decoding="async"
                      className="pro-gallery-image"
                    />
                  </picture>
                </figure>
              ))}

              <div className="pro-visual-note">
                <p className="pro-visual-note-label">Campinas, B2B e recorrência</p>
                <p className="pro-visual-note-copy">
                  A página foi redesenhada para comunicar marmita empresarial, alimentação corporativa e operação recorrente logo no primeiro
                  scroll.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </header>

      <nav className="pro-anchor-nav" aria-label="Navegação da página">
        <a href="#atendimento">Atendimento</a>
        <a href="#como-funciona">Como funciona</a>
        <a href="#embalagem">Embalagem</a>
        <a href="#faq">FAQ</a>
        <a href="#contato">Comercial</a>
      </nav>

      <section className="pro-section-block pro-intro-band" id="atendimento">
        <div className="container-shell">
          <div className="pro-intro-grid">
            {credibilityBlocks.map((block, index) => (
              <Reveal key={block.title} as="section" delay={index * 60} className="pro-copy-panel">
                <p className="pro-eyebrow">{block.eyebrow}</p>
                <h2 className="pro-section-title">{block.title}</h2>
                <p className="pro-section-body">{block.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="pro-section-block" id="como-funciona">
        <div className="container-shell pro-split-layout">
          <Reveal as="section" className="pro-editorial-copy">
            <p className="pro-eyebrow">Para quem a solução faz sentido</p>
            <h2 className="pro-section-title">Uma landing mais clara precisa dizer onde o ProRefeição realmente funciona bem.</h2>
            <p className="pro-section-body">
              A proposta é mais útil para operações com recorrência, times distribuídos e necessidade de uma refeição corporativa em Campinas
              que já nasça com lógica de atendimento, não como adaptação do salão ou do delivery casual.
            </p>

            <ul className="pro-audience-list">
              {audienceGroups.map((group) => (
                <li key={group}>{group}</li>
              ))}
            </ul>
          </Reveal>

          <Reveal as="section" delay={80} className="pro-service-stack">
            {serviceFormats.map((format) => (
              <article key={format.title} className="pro-service-card">
                <h3>{format.title}</h3>
                <p>{format.description}</p>
              </article>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="pro-section-block pro-dark-band">
        <div className="container-shell pro-dark-grid">
          <Reveal as="section" className="pro-dark-copy">
            <p className="pro-eyebrow pro-eyebrow-light">Fluxo comercial</p>
            <h2 className="pro-dark-title">Mais fluidez na página, menos atrito na conversa comercial.</h2>
            <p className="pro-dark-body">
              A empresa precisa entender em poucos segundos o que será combinado: local de atendimento, volume, frequência, janela de entrega,
              cardápio-base e padrão de apresentação. Quando essa leitura fica simples, a decisão avança mais rápido.
            </p>
          </Reveal>

          <Reveal as="ol" delay={90} className="pro-workflow-list">
            {workflowSteps.map((step, index) => (
              <li key={step.title} className="pro-workflow-item">
                <span className="pro-workflow-index">{index + 1}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="pro-section-block" id="embalagem">
        <div className="container-shell pro-proof-grid">
          <Reveal as="section" className="pro-proof-copy">
            <p className="pro-eyebrow">Embalagem e percepção</p>
            <h2 className="pro-section-title">A embalagem selada não entra só como estética. Ela sustenta confiança.</h2>
            <p className="pro-section-body">
              Na frente corporativa, a imagem do produto precisa ajudar a vender integridade, padronização e profissionalismo. Por isso a
              direção visual do ProRefeição foi concentrada em bowls selados sobre fundo limpo, com leitura imediata do produto.
            </p>
          </Reveal>

          <Reveal as="div" delay={80} className="pro-proof-list">
            {deliveryPoints.map((point) => (
              <article key={point} className="pro-proof-item">
                <span aria-hidden="true">✓</span>
                <p>{point}</p>
              </article>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="pro-section-block pro-faq-band" id="faq">
        <div className="container-shell">
          <Reveal as="div" className="pro-faq-head">
            <p className="pro-eyebrow">Perguntas frequentes</p>
            <h2 className="pro-section-title">FAQ visível ajuda o comprador e também reforça a indexação do serviço.</h2>
            <p className="pro-section-body">
              As respostas abaixo foram escritas para cobrir as principais dúvidas sobre refeição corporativa, marmita para empresa e
              alimentação empresarial em Campinas.
            </p>
          </Reveal>

          <div className="pro-faq-grid">
            {faqItems.map((item, index) => (
              <Reveal key={item.question} as="details" delay={index * 45} className="pro-faq-item">
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="pro-section-block">
        <div className="container-shell">
          <Reveal as="section" className="pro-cta-band" id="contato">
            <div className="pro-cta-grid">
              <div className="pro-cta-copy">
                <p className="pro-eyebrow pro-eyebrow-light">Canal comercial</p>
                <h2 className="pro-cta-title">Entre com o cenário da sua operação. A gente estrutura o próximo passo.</h2>
                <p className="pro-cta-lead">
                  Envie quantidade estimada, frequência, local e turnos pelo WhatsApp comercial. O contato vai direto para o canal oficial da
                  Cuiabar, já orientado para atendimento corporativo.
                </p>
                <div className="pro-hero-actions">
                  <a href={commercialHref} target="_blank" rel="noreferrer" className="btn-primary">
                    Chamar no WhatsApp
                  </a>
                  <a href="mailto:cuiabar@cuiabar.net" className="pro-outline-action pro-outline-action-light">
                    Enviar e-mail
                  </a>
                </div>
              </div>

              <aside className="pro-cta-aside">
                <p className="pro-cta-aside-label">O que acelera a cotação</p>
                <ul className="pro-cta-aside-list">
                  <li>Quantidade aproximada por dia ou por turno</li>
                  <li>Se o atendimento será no almoço, jantar ou ambos</li>
                  <li>Endereço ou região da operação em Campinas</li>
                  <li>Frequência semanal ou necessidade recorrente</li>
                </ul>
              </aside>
            </div>
          </Reveal>
        </div>
      </section>
    </article>
  );
};

export default ProRefeicaoPage;
