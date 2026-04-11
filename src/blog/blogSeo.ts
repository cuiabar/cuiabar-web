import { knowledgeArticles } from '../data/knowledgeArticles';
import { blogConfig } from './blogConfig';

export type BlogSeoRoute = {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  keywords: string[];
  type: 'website' | 'article';
  canonicalUrl: string;
  schema: Record<string, unknown>[];
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${blogConfig.siteUrl}/#organization`,
  name: 'Villa Cuiabar',
  alternateName: 'Cuiabar',
  url: blogConfig.homeUrl,
  logo: `${blogConfig.homeUrl}/logo-villa-cuiabar.png`,
  sameAs: [blogConfig.whatsappChannelUrl],
};

const absoluteImage = (value: string) => (value.startsWith('http') ? value : `${blogConfig.siteUrl}${value}`);

export const blogSeoRoutes: Record<string, BlogSeoRoute> = {
  '/': {
    title: 'Blog Cuiabar | Guias, agenda e gastronomia em Campinas',
    description:
      'Conteudos locais da Cuiabar sobre agenda, gastronomia, reservas, bairro, clima e experiencias da casa em Campinas.',
    image: `${blogConfig.siteUrl}/home/home-salao-dia-da-mulher.jpg`,
    imageAlt: 'Ambiente do Villa Cuiabar em Campinas',
    keywords: [
      'blog Cuiabar',
      'blog gastronomia Campinas',
      'musica ao vivo Campinas',
      'guias locais Campinas',
      'restaurante Jardim Aurelia',
    ],
    type: 'website',
    canonicalUrl: blogConfig.siteUrl,
    schema: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Blog Cuiabar',
        url: blogConfig.siteUrl,
        description:
          'Colecao editorial da Cuiabar com conteudos sobre gastronomia, agenda, guias locais, reservas e experiencias em Campinas.',
        inLanguage: 'pt-BR',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Ultimos conteudos do Blog Cuiabar',
        itemListElement: knowledgeArticles.map((article, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: article.title,
          url: `${blogConfig.siteUrl}/${article.slug}`,
        })),
      },
      organizationSchema,
    ],
  },
};

for (const article of knowledgeArticles) {
  blogSeoRoutes[`/${article.slug}`] = {
    title: `${article.title} | Blog Cuiabar`,
    description: article.summary,
    image: absoluteImage(article.image),
    imageAlt: article.title,
    keywords: article.keywords,
    type: 'article',
    canonicalUrl: `${blogConfig.siteUrl}/${article.slug}`,
    schema: [
      {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: article.title,
        description: article.summary,
        url: `${blogConfig.siteUrl}/${article.slug}`,
        image: absoluteImage(article.image),
        datePublished: article.date,
        dateModified: article.date,
        inLanguage: 'pt-BR',
        author: {
          '@type': 'Organization',
          name: 'Villa Cuiabar',
        },
        publisher: {
          '@id': `${blogConfig.siteUrl}/#organization`,
        },
        mainEntityOfPage: `${blogConfig.siteUrl}/${article.slug}`,
        keywords: article.keywords,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Blog Cuiabar',
            item: blogConfig.siteUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: article.title,
            item: `${blogConfig.siteUrl}/${article.slug}`,
          },
        ],
      },
      organizationSchema,
    ],
  };
}

export const getBlogRouteSeo = (routePath: string) => blogSeoRoutes[routePath] ?? blogSeoRoutes['/'];
