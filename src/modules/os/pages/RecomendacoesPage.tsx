import { useMemo, useState } from 'react';
import { OsHeader } from '../components/OsHeader';
import { OsLayout } from '../components/OsLayout';
import { RecommendationCard } from '../components/RecommendationCard';
import { SearchInput } from '../components/SearchInput';
import { recommendations } from '../data/recomendacoes';
import { useSeo } from '../../../hooks/useSeo';
import { matchesRecommendation, osNoIndexSeo } from './pageUtils';

const RecomendacoesPage = () => {
  const [query, setQuery] = useState('');
  const filteredRecommendations = useMemo(
    () => recommendations.filter((recommendation) => matchesRecommendation(recommendation, query)),
    [query],
  );

  useSeo(
    osNoIndexSeo(
      'Recomendacoes de Servico',
      'Portal interno de diagnostico, procedimento, script, checklist e acao corretiva para operacao GHCO OS.',
    ),
  );

  return (
    <OsLayout>
      <OsHeader
        title="Recomendacoes de Servico"
        description="Diagnosticos rapidos para orientar decisao operacional, comunicacao com cliente e acao corretiva."
      />
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <SearchInput value={query} onChange={setQuery} placeholder="Buscar situacao operacional..." />
          <p className="text-sm text-slate-500">
            {filteredRecommendations.length} de {recommendations.length} recomendacoes
          </p>
        </div>
        <div className="grid gap-5">
          {filteredRecommendations.map((recommendation) => (
            <RecommendationCard key={recommendation.id} recommendation={recommendation} />
          ))}
        </div>
      </div>
    </OsLayout>
  );
};

export default RecomendacoesPage;
