import { useEffect, useState } from 'react';
import { Badge, PageHeader, Panel } from '../components';
import { useCrm } from '../context';
import { crmRequest } from '../api';

type ChecklistGroup = Array<{ key: string; label: string; ok: boolean; note?: string }>;

export const DeliverabilityPage = () => {
  const { csrfToken } = useCrm();
  const [authentication, setAuthentication] = useState<ChecklistGroup>([]);
  const [operational, setOperational] = useState<ChecklistGroup>([]);

  useEffect(() => {
    crmRequest<{ ok: true; checklist: { authentication: ChecklistGroup; operational: ChecklistGroup } }>('/api/deliverability/checklist', {}, csrfToken)
      .then((response) => {
        setAuthentication(response.checklist.authentication);
        setOperational(response.checklist.operational);
      })
      .catch(() => {
        setAuthentication([]);
        setOperational([]);
      });
  }, [csrfToken]);

  return (
    <div className="space-y-6">
      <PageHeader title="Entregabilidade" description="Disciplina operacional, nao garantia de inbox: autenticacao correta, opt-in, volume gradual, hygiene e monitoramento continuo." />
      <div className="grid gap-6 xl:grid-cols-2">
        {[{ title: 'Autenticacao e compliance', items: authentication }, { title: 'Operacao e higiene', items: operational }].map((group) => (
          <Panel key={group.title}>
            <h2 className="text-lg font-semibold text-white">{group.title}</h2>
            <div className="mt-4 space-y-3">
              {group.items.map((item) => (
                <div key={item.key} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-medium text-white">{item.label}</p>
                    <Badge tone={item.ok ? 'success' : 'warning'}>{item.ok ? 'ok' : 'pendente'}</Badge>
                  </div>
                  {item.note ? <p className="mt-2 text-sm text-slate-400">{item.note}</p> : null}
                </div>
              ))}
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
};
