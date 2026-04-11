import { Link, Navigate, useParams } from 'react-router-dom';
import { Reveal } from '../components/Reveal';
import { getKnowledgeArticleBySlug, knowledgeArticles } from '../data/knowledgeArticles';
import { getRouteSeo } from '../data/seo';
import { useSeo } from '../hooks/useSeo';

const BlogPostPage = () => {
  const { slug = '' } = useParams();
  const article = getKnowledgeArticleBySlug(slug);

  if (!article) {
    return <Navigate to="/blog" replace />;
  }

  useSeo(getRouteSeo(`/blog/${article.slug}`));

  return (
    <section className="container-shell space-y-10 py-14">
      <Reveal as="header" className="card overflow-hidden p-0">
        <div className="grid gap-0 lg:grid-cols-[1fr_0.95fr]">
          <div className="p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-terracotta">{article.eyebrow}</p>
            <h1 className="mt-3 font-heading text-5xl">{article.title}</h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-steel">{article.summary}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {article.keywords.map((keyword) => (
                <span key={keyword} className="rounded-full border border-sand/60 bg-butter px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-cocoa">
                  {keyword}
                </span>
              ))}
            </div>
            <p className="mt-6 text-sm text-steel">
              Publicado em {article.date} • {article.readTime}
            </p>
          </div>
          <img src={article.image} alt={article.title} loading="eager" className="h-full min-h-[320px] w-full object-cover" />
        </div>
      </Reveal>

      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <Reveal as="section" delay={60} className="card p-8">
          <div className="space-y-6">
            {article.sections.map((section) => (
              <article key={section.title}>
                <h2 className="font-heading text-4xl">{section.title}</h2>
                <p className="mt-3 text-base leading-relaxed text-steel">{section.body}</p>
              </article>
            ))}
          </div>
        </Reveal>

        <div className="space-y-6">
          <Reveal delay={90} className="card p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-terracotta">Próximos passos</p>
            <div className="mt-5 grid gap-3">
              <Link to="/menu" className="rounded-xl border border-sand/50 bg-white px-4 py-4 text-sm font-semibold text-cocoa transition hover:-translate-y-0.5 hover:shadow-soft">
                Ver menu da casa
              </Link>
              <Link to="/agenda" className="rounded-xl border border-sand/50 bg-white px-4 py-4 text-sm font-semibold text-cocoa transition hover:-translate-y-0.5 hover:shadow-soft">
                Abrir agenda de música ao vivo
              </Link>
              <Link to="/reservas" className="rounded-xl border border-sand/50 bg-white px-4 py-4 text-sm font-semibold text-cocoa transition hover:-translate-y-0.5 hover:shadow-soft">
                Ir para reservas
              </Link>
            </div>
          </Reveal>

          <Reveal delay={120} className="card p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-terracotta">Leituras relacionadas</p>
            <div className="mt-5 space-y-3">
              {knowledgeArticles
                .filter((item) => item.slug !== article.slug)
                .slice(0, 3)
                .map((relatedArticle) => (
                  <Link key={relatedArticle.slug} to={`/blog/${relatedArticle.slug}`} className="block rounded-xl border border-sand/50 bg-white px-4 py-4 transition hover:-translate-y-0.5 hover:shadow-soft">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-terracotta">{relatedArticle.category}</p>
                    <h2 className="mt-2 font-heading text-2xl text-cocoa">{relatedArticle.title}</h2>
                    <p className="mt-2 text-sm text-steel">{relatedArticle.excerpt}</p>
                  </Link>
                ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default BlogPostPage;
