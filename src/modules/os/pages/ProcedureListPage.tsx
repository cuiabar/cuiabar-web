import { useMemo, useState } from 'react';
import { OsHeader } from '../components/OsHeader';
import { OsLayout } from '../components/OsLayout';
import { ProcedureCard } from '../components/ProcedureCard';
import { SearchInput } from '../components/SearchInput';
import type { Procedure } from '../data/types';
import { useSeo } from '../../../hooks/useSeo';
import { matchesProcedure, osNoIndexSeo } from './pageUtils';

type ProcedureListPageProps = {
  title: string;
  description: string;
  procedures: Procedure[];
};

export const ProcedureListPage = ({ title, description, procedures }: ProcedureListPageProps) => {
  const [query, setQuery] = useState('');
  const filteredProcedures = useMemo(
    () => procedures.filter((procedure) => matchesProcedure(procedure, query)),
    [procedures, query],
  );

  useSeo(osNoIndexSeo(title, description));

  return (
    <OsLayout>
      <OsHeader title={title} description={description} />
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <SearchInput value={query} onChange={setQuery} placeholder={`Buscar em ${title.toLowerCase()}...`} />
          <p className="text-sm text-slate-500">
            {filteredProcedures.length} de {procedures.length} procedimentos
          </p>
        </div>
        <div className="grid gap-5">
          {filteredProcedures.map((procedure) => (
            <ProcedureCard key={procedure.id} procedure={procedure} />
          ))}
        </div>
        {filteredProcedures.length === 0 ? (
          <div className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            Nenhum procedimento encontrado para esta busca.
          </div>
        ) : null}
      </div>
    </OsLayout>
  );
};
