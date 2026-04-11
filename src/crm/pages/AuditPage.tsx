import { useEffect, useState } from 'react';
import { crmRequest } from '../api';
import { PageHeader, Panel, Table } from '../components';
import { useCrm } from '../context';
import type { AuditLogEntry } from '../types';

export const AuditPage = () => {
  const { csrfToken } = useCrm();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);

  useEffect(() => {
    crmRequest<{ ok: true; logs: AuditLogEntry[] }>('/api/audit-logs', {}, csrfToken)
      .then((response) => setLogs(response.logs))
      .catch(() => setLogs([]));
  }, [csrfToken]);

  return (
    <div className="space-y-6">
      <PageHeader title="Auditoria" description="Log centralizado de login, alteracoes de dados, importacoes, campanhas, configuracoes e descadastros." />
      <Panel>
        <Table>
          <thead className="bg-white/5 text-xs uppercase tracking-[0.2em] text-slate-400">
            <tr>
              <th className="px-4 py-3">Quando</th>
              <th className="px-4 py-3">Ator</th>
              <th className="px-4 py-3">Acao</th>
              <th className="px-4 py-3">Entidade</th>
              <th className="px-4 py-3">Metadata</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="px-4 py-3 text-slate-300">{new Date(log.createdAt).toLocaleString('pt-BR')}</td>
                <td className="px-4 py-3 text-white">{log.actor}</td>
                <td className="px-4 py-3 text-slate-300">{log.action}</td>
                <td className="px-4 py-3 text-slate-300">{log.entityType}</td>
                <td className="px-4 py-3 text-xs text-slate-400">
                  <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Panel>
    </div>
  );
};
