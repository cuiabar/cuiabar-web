import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { Reveal } from '../components/Reveal';
import { liveMusicPrograms } from '../data/liveMusicPrograms';
import { knowledgeArticles } from '../data/knowledgeArticles';
import { useSeo } from '../hooks/useSeo';
import { blogConfig } from './blogConfig';
import { getBlogRouteSeo } from './blogSeo';
import { useCampinasWeather } from './hooks/useCampinasWeather';

const featuredArticle = knowledgeArticles[0];
const secondaryArticles = knowledgeArticles.slice(1);

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
});

export const BlogHomePage = () => {
  const { weather, isLoading, editorialNote } = useCampinasWeather();
  const todayLabel = dateFormatter.format(new Date());

  useSeo(getBlogRouteSeo('/'));

  return (
    <>
      <section className="blog-hero">
        <div className="container-shell">
          <div className="blog-hero__grid">
            <Reveal as="div" className="blog-hero__copy" delay={20}>
              <p className="blog-kicker">blog.cuiabar.com</p>
              <h1 className="blog-hero__title">Guias, agenda e gastronomia com recorte local e clima de casa.</h1>
              <p className="blog-hero__lede">
                Um ponto de encontro entre conteudo util e intencao real de visita: o que abrir, quando ir, o que pedir e como acompanhar a Cuiabar sem depender da home principal.
              </p>

              <div className="blog-chip-row">
                <span className="blog-chip">Agenda e pautas locais</span>
                <span className="blog-chip">Clima em tempo real</span>
                <span className="blog-chip">Reserva e menu integrados</span>
              </div>

              <div className="blog-hero__actions">
                <a href={blogConfig.reservationUrl} target="_blank" rel="noreferrer" className="blog-primary-button">
                  Reservar mesa
                </a>
                <a href={blogConfig.agendaUrl} target="_blank" rel="noreferrer" className="blog-secondary-button">
                  Abrir agenda
                </a>
              </div>

              <div className="blog-editorial-line">
                <div>
                  <span className="blog-footnote">Leitura do dia</span>
                  <p className="mt-2 text-sm text-white/80">{todayLabel}</p>
                </div>
                <div>
                  <span className="blog-footnote">Pulso editorial</span>
                  <p className="mt-2 text-sm text-white/80">{editorialNote}</p>
                </div>
              </div>
            </Reveal>

            <Reveal className="blog-hero__stack" delay={80}>
              <Link to={`/${featuredArticle.slug}`} className="blog-featured-card">
                <img
                  src={featuredArticle.image}
                  alt={featuredArticle.title}
                  className="blog-featured-card__image"
                  loading="eager"
                />
                <div className="blog-featured-card__body">
                  <p className="blog-footnote">{featuredArticle.eyebrow}</p>
                  <h2 className="mt-3 font-heading text-4xl text-white">{featuredArticle.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-white/72">{featuredArticle.summary}</p>
                </div>
              </Link>

              <div className="blog-insight-grid">
                <article className="blog-insight-card">
                  <p className="blog-footnote">Tempo agora</p>
                  {isLoading ? (
                    <p className="mt-4 text-sm text-white/76">Consultando o tempo em {blogConfig.weatherCityLabel}...</p>
                  ) : weather ? (
                    <>
                      <div className="mt-4 flex items-end gap-3">
                        <strong className="font-heading text-5xl text-white">{Math.round(weather.temperature)}°</strong>
                        <span className="mb-2 text-sm uppercase tracking-[0.18em] text-white/58">{weather.label}</span>
                      </div>
                      <p className="mt-4 text-sm leading-relaxed text-white/74">{editorialNote}</p>
                    </>
                  ) : (
                    <p className="mt-4 text-sm leading-relaxed text-white/74">
                      A leitura meteorologica entra aqui para calibrar destaque, copy e CTA conforme o momento da cidade.
                    </p>
                  )}
                </article>

                <a href={blogConfig.whatsappChannelUrl} target="_blank" rel="noreferrer" className="blog-insight-card blog-insight-card--accent">
                  <p className="blog-footnote">Canal de distribuicao</p>
                  <h3 className="mt-3 font-heading text-3xl text-white">Canal oficial no WhatsApp</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/74">
                    Um atalho para divulgar agenda, novos artigos, especiais de cardapio e bastidores sem depender da home.
                  </p>
                  <span className="mt-6 inline-flex text-sm font-semibold text-white">Entrar no canal</span>
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="container-shell py-8">
        <Reveal className="blog-surface blog-lab-panel" delay={40}>
          <div>
            <p className="blog-footnote">Linha editorial</p>
            <h2 className="mt-3 font-heading text-4xl text-white">Conteudo enxuto, util e conectado com visita, agenda e contexto.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/74">
              O foco do blog e ajudar quem esta perto da decisao: descobrir novidades, entender o momento da casa e sair daqui com proximo passo claro.
            </p>
          </div>

          <div className="blog-lab-grid">
            <article className="blog-lab-card">
              <p className="blog-footnote">Distribuicao</p>
              <p className="mt-3 text-sm leading-relaxed text-white/72">
                Canal do WhatsApp, agenda e artigos relacionados trabalham juntos para trazer recorrencia sem excesso de navegacao.
              </p>
            </article>
            <article className="blog-lab-card">
              <p className="blog-footnote">Curadoria</p>
              <p className="mt-3 text-sm leading-relaxed text-white/72">
                Menos volume e mais criterio: cada pauta precisa ajudar em descoberta, contexto ou conversao.
              </p>
            </article>
            <article className="blog-lab-card">
              <p className="blog-footnote">Objetivo</p>
              <p className="mt-3 text-sm leading-relaxed text-white/72">
                Transformar leitura em acao simples: abrir agenda, falar com a equipe ou reservar com contexto.
              </p>
            </article>
          </div>
        </Reveal>
      </section>

      <section className="container-shell py-10">
        <Reveal className="flex items-end justify-between gap-4" delay={70}>
          <div>
            <p className="blog-kicker">Publicacoes</p>
            <h2 className="font-heading text-5xl text-white">Leituras para abrir a cidade, o menu e o momento da casa.</h2>
          </div>
        </Reveal>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <Reveal className="grid gap-5 md:grid-cols-2" delay={90}>
            {secondaryArticles.length > 0 ? (
              secondaryArticles.map((article, index) => (
                <Link
                  key={article.slug}
                  to={`/${article.slug}`}
                  className="blog-article-card"
                  style={{ '--blog-card-delay': `${index * 80}ms` } as CSSProperties}
                >
                  <img src={article.image} alt={article.title} className="blog-article-card__image" loading="lazy" />
                  <div className="blog-article-card__body">
                    <p className="blog-footnote">
                      {article.category} · {article.readTime}
                    </p>
                    <h3 className="mt-3 font-heading text-3xl text-white">{article.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/72">{article.excerpt}</p>
                  </div>
                </Link>
              ))
            ) : (
              <article className="blog-surface p-6">
                <p className="blog-footnote">Mais leituras em breve</p>
                <h3 className="mt-3 font-heading text-3xl text-white">A base editorial esta sendo expandida.</h3>
                <p className="mt-4 text-sm leading-relaxed text-white/72">
                  O primeiro guia ja esta no ar e as proximas publicacoes entram em sequencia para formar uma leitura mais completa do bairro, da agenda e da operacao.
                </p>
              </article>
            )}
          </Reveal>

          <Reveal className="blog-surface p-6" delay={120}>
            <p className="blog-footnote">Agenda conectada</p>
            <div className="mt-5 space-y-4">
              {liveMusicPrograms.map((program) => (
                <a
                  key={program.slug}
                  href={`${blogConfig.agendaUrl}/${program.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="blog-program-row"
                >
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-white/48">{program.dayLabel}</p>
                    <h3 className="mt-2 font-heading text-2xl text-white">{program.shortTitle}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/68">{program.teaser}</p>
                  </div>
                  <span className="blog-program-row__tag">Abrir</span>
                </a>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
};
