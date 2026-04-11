import type { KnowledgeArticle } from './types';
import { knowledgeArticlesCms } from './knowledgeArticlesCms';
import { knowledgeArticlesSeed } from './knowledgeArticlesSeed';

const hasCmsArticles = knowledgeArticlesCms.length > 0;

export const knowledgeArticles: KnowledgeArticle[] = hasCmsArticles ? knowledgeArticlesCms : knowledgeArticlesSeed;

export const getKnowledgeArticleBySlug = (slug: string) => knowledgeArticles.find((article) => article.slug === slug);
