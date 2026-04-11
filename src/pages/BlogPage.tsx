import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { knowledgeArticles } from '../data/knowledgeArticles';
import { getRouteSeo } from '../data/seo';
import { useSeo } from '../hooks/useSeo';

const categories = ['Todos', ...Array.from(new Set(knowledgeArticles.map((post) => post.category)))];

const BlogPage = () => {
  useSeo(getRouteSeo('/blog'));

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');

  const filteredPosts = useMemo(
    () =>
      knowledgeArticles.filter((post) => {
        const normalizedSearch = search.toLowerCase();
        const searchMatch =
          post.title.toLowerCase().includes(normalizedSearch) ||
          post.excerpt.toLowerCase().includes(normalizedSearch) ||
          post.keywords.some((keyword) => keyword.toLowerCase().includes(normalizedSearch));
        const categoryMatch = category === 'Todos' || post.category === category;
        return searchMatch && categoryMatch;
      }),
    [search, category],
  );

  return (
    <section className="container-shell py-14">
      <h1 className="font-heading text-4xl">Conteúdos locais do Villa Cuiabar</h1>
      <p className="mt-3 text-steel">Guias e páginas editoriais para reforçar Jardim Aurelia, Dunlop, música ao vivo, espaço kids, reservas e buscas locais de Campinas.</p>
      <div className="mt-6 grid gap-4 rounded-card border border-sand/50 bg-white p-4 md:grid-cols-[2fr,1fr]">
        <input
          placeholder="Buscar artigo"
          className="rounded-xl border border-sand px-3 py-2"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select className="rounded-xl border border-sand px-3 py-2" value={category} onChange={(event) => setCategory(event.target.value)}>
          {categories.map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {filteredPosts.map((post) => (
          <Link key={post.id} to={`/blog/${post.slug}`} className="card overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-soft">
            <img src={post.image} alt={post.title} loading="lazy" className="h-52 w-full object-cover" />
            <div className="p-5">
              <p className="text-xs uppercase tracking-wide text-terracotta">{post.category} · {post.readTime}</p>
              <h2 className="mt-2 font-heading text-3xl">{post.title}</h2>
              <p className="mt-2 text-steel">{post.excerpt}</p>
              <p className="mt-4 text-sm font-semibold text-cocoa">Abrir conteúdo</p>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-8 rounded-2xl border border-sand/50 bg-butter p-5 text-sm text-steel">
        Use estes conteúdos como ponte para as páginas de agenda, reservas, menu e guias locais. A ideia aqui é criar relevância editorial real, e não só mais uma tela institucional.
      </div>
    </section>
  );
};

export default BlogPage;
