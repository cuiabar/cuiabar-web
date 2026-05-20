import type { Procedure, Recommendation } from '../data/types';

export const normalizeSearch = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export const matchesProcedure = (procedure: Procedure, query: string) => {
  const normalizedQuery = normalizeSearch(query);

  if (!normalizedQuery) {
    return true;
  }

  return normalizeSearch(
    [
      procedure.title,
      procedure.objective,
      procedure.whenToUse,
      procedure.script,
      procedure.correctiveAction,
      procedure.tags.join(' '),
    ].join(' '),
  ).includes(normalizedQuery);
};

export const matchesRecommendation = (recommendation: Recommendation, query: string) => {
  const normalizedQuery = normalizeSearch(query);

  if (!normalizedQuery) {
    return true;
  }

  return normalizeSearch(
    [
      recommendation.title,
      recommendation.diagnosis,
      recommendation.suggestedScript,
      recommendation.correctiveAction,
      recommendation.tags.join(' '),
    ].join(' '),
  ).includes(normalizedQuery);
};

export const osNoIndexSeo = (title: string, description: string) => ({
  title: `${title} | GHCO OS`,
  description,
  robots: 'noindex,nofollow',
  canonicalUrl: typeof window === 'undefined' ? undefined : window.location.href,
});
