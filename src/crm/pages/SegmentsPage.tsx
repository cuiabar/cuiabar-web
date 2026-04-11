import { useEffect, useState } from 'react';
import { crmRequest } from '../api';
import { Button, Field, InputClassName, PageHeader, Panel, Table } from '../components';
import { useCrm } from '../context';
import type { Segment } from '../types';

const defaultRules = JSON.stringify(
  {
    match: 'all',
    conditions: [{ field: 'source', operator: 'eq', value: 'site' }],
  },
  null,
  2,
);

export const SegmentsPage = () => {
  const { csrfToken } = useCrm();
  const [segments, setSegments] = useState<Segment[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rules, setRules] = useState(defaultRules);

  const load = async () => {
    const response = await crmRequest<{ ok: true; segments: Segment[] }>('/api/segments', {}, csrfToken);
    setSegments(response.segments);
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, [csrfToken]);

  const createSegment = async (event: React.FormEvent) => {
    event.preventDefault();
    await crmRequest('/api/segments', { method: 'POST', body: JSON.stringify({ name, description, rules: JSON.parse(rules) }) }, csrfToken);
    setName('');
    setDescription('');
    setRules(defaultRules);
    await load();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Segmentos" description="Os segmentos dinamicos usam regras em JSON para manter flexibilidade com baixo acoplamento." />
      <div className="grid gap-6 xl:grid-cols-[1.2fr,1fr]">
        <Panel>
          <Table>
            <thead className="bg-white/5 text-xs uppercase tracking-[0.2em] text-slate-400">
              <tr>
                <th className="px-4 py-3">Segmento</th>
                <th className="px-4 py-3">Descricao</th>
                <th className="px-4 py-3">Regras</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {segments.map((segment) => (
                <tr key={segment.id}>
                  <td className="px-4 py-3 font-medium text-white">{segment.name}</td>
                  <td className="px-4 py-3 text-slate-300">{segment.description}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    <pre>{JSON.stringify(segment.rules, null, 2)}</pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Panel>

        <Panel>
          <h2 className="text-lg font-semibold text-white">Novo segmento</h2>
          <form className="mt-4 grid gap-4" onSubmit={createSegment}>
            <Field label="Nome">
              <input className={InputClassName} value={name} onChange={(event) => setName(event.target.value)} required />
            </Field>
            <Field label="Descricao">
              <input className={InputClassName} value={description} onChange={(event) => setDescription(event.target.value)} />
            </Field>
            <Field label="Regras JSON" hint='Ex.: {"match":"all","conditions":[{"field":"tag","value":"vip"}]}'>
              <textarea className={`${InputClassName} min-h-[260px] font-mono text-xs`} value={rules} onChange={(event) => setRules(event.target.value)} />
            </Field>
            <Button type="submit">Salvar segmento</Button>
          </form>
        </Panel>
      </div>
    </div>
  );
};
