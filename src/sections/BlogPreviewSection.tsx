import { Link } from 'react-router-dom';
import { knowledgeArticles } from '../data/knowledgeArticles';
import { SectionHeading } from '../components/SectionHeading';

export const BlogPreviewSection = () => (
  <section className="container-shell py-12">
    <SectionHeading
      eyebrow="Blog"
      title="Conteúdos para fortalecer sua decisão"
      description="Artigos pensados para SEO local: comida brasileira, delivery, música ao vivo e tendências gastronômicas em Campinas."
    />
    <div className="mt-8 grid gap-4 md:grid-cols-3">
      {knowledgeArticles.slice(0, 3).map((post) => (
        <Link key={post.id} to={`/blog/${post.slug}`} className="card overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-soft">
          <img src={post.image} alt={post.title} loading="lazy" className="h-40 w-full object-cover" />
          <div className="p-5">
            <p className="text-xs uppercase tracking-wide text-terracotta">{post.category}</p>
            <h3 className="mt-2 font-heading text-2xl">{post.title}</h3>
            <p className="mt-2 text-sm text-steel">{post.excerpt}</p>
            <p className="mt-4 text-sm font-semibold text-cocoa">Ler conteúdo</p>
          </div>
        </Link>
      ))}
    </div>
    <Link to="/blog" className="btn-secondary mt-8">Ver todos</Link>
  </section>
);
