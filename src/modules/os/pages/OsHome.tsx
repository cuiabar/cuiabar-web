import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { OsHeader } from '../components/OsHeader';
import { OsLayout } from '../components/OsLayout';
import { OsModuleCard } from '../components/OsModuleCard';
import { SearchInput } from '../components/SearchInput';
import { atendimentoProcedures } from '../data/atendimento';
import { conversaoProcedures } from '../data/conversao';
import { deliveryProcedures } from '../data/delivery';
import { osModules } from '../data/modules';
import { popsProcedures } from '../data/pops';
import { recommendations } from '../data/recomendacoes';
import { useSeo } from '../../../hooks/useSeo';
import { matchesProcedure, matchesRecommendation, osNoIndexSeo } from './pageUtils';

const quickItems = [
  ...atendimentoProcedures.map((item) => ({ title: item.title, path: `/os/atendimento#${item.id}`, type: 'Atendimento', item })),
  ...deliveryProcedures.map((item) => ({ title: item.title, path: `/os/delivery#${item.id}`, type: 'Delivery', item })),
  ...popsProcedures.map((item) => ({ title: item.title, path: `/os/pops#${item.id}`, type: 'POP', item })),
  ...conversaoProcedures.map((item) => ({ title: item.title, path: `/os/conversao#${item.id}`, type: 'Conversao', item })),
];

const recommendationQuickItems = recommendations.map((item) => ({
  title: item.title,
  path: `/os/recomendacoes#${item.id}`,
  type: 'Recomendacao',
  item,
}));

const OsHome = () => {
  const [query, setQuery] = useState('');
  const results = useMemo(() => {
    if (!query.trim()) {
      return [...quickItems.slice(0, 8), ...recommendationQuickItems.slice(0, 4)];
    }

    return [
      ...quickItems.filter((result) => matchesProcedure(result.item, query)),
      ...recommendationQuickItems.filter((result) => matchesRecommendation(result.item, query)),
    ].slice(0, 12);
  }, [query]);

  useSeo(
    osNoIndexSeo(
      'GHCO OS — Manual Operacional',
      'Intranet operacional privada do GHCO OS para procedimentos, treinamento e recomendacoes internas.',
    ),
  );

  return (
    <OsLayout>
      <OsHeader
        eyebrow="Intranet privada"
        title="GHCO OS — Manual Operacional"
        description="Base interna para padronizacao, treinamento, reducao de erro, sanitizacao, atendimento e conversao de vendas."
      />
      <div className="space-y-8 px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <SearchInput value={query} onChange={setQuery} placeholder="Buscar procedimento, script ou recomendacao..." />
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((result) => (
              <Link
                key={`${result.type}-${result.title}`}
                to={result.path}
                className="rounded-md border border-slate-200 p-3 text-sm transition hover:border-slate-400 hover:bg-slate-50"
              >
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{result.type}</span>
                <span className="mt-1 block font-medium text-slate-950">{result.title}</span>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-slate-950">Modulos</h2>
            <span className="text-sm text-slate-500">Acesso rapido</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {osModules.map((module) => (
              <OsModuleCard key={module.id} module={module} />
            ))}
          </div>
        </section>

        <section className="rounded-md border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
          <strong className="font-semibold">Arquitetura preparada:</strong> este manual ainda nao implementa login definitivo.
          O componente ProtectedLayout e o ponto reservado para autenticacao interna futura.
        </section>
      </div>
    </OsLayout>
  );
};

export default OsHome;
