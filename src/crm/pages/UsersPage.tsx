import { useEffect, useState } from 'react';
import { crmRequest } from '../api';
import { Badge, Button, Field, InputClassName, PageHeader, Panel, Table } from '../components';
import { useCrm } from '../context';
import type { RoleName, SessionUser } from '../types';

type UserRow = SessionUser & {
  createdAt: string;
  lastLoginAt: string | null;
};

export const UsersPage = () => {
  const { csrfToken } = useCrm();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [form, setForm] = useState({ email: '', displayName: '', role: 'operador_marketing' as RoleName });

  const load = async () => {
    const response = await crmRequest<{ ok: true; users: UserRow[] }>('/api/users', {}, csrfToken);
    setUsers(response.users);
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, [csrfToken]);

  const createUser = async (event: React.FormEvent) => {
    event.preventDefault();
    await crmRequest('/api/users', { method: 'POST', body: JSON.stringify(form) }, csrfToken);
    setForm({ email: '', displayName: '', role: 'operador_marketing' });
    await load();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Usuarios" description="Em modo Google-only, esta tela prepara os e-mails autorizados e seus papeis para o primeiro login." />
      <div className="grid gap-6 xl:grid-cols-[1.2fr,0.9fr]">
        <Panel>
          <Table>
            <thead className="bg-white/5 text-xs uppercase tracking-[0.2em] text-slate-400">
              <tr>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Papeis</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{user.displayName}</div>
                    <div className="text-xs text-slate-400">{user.email}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{user.roles.join(', ')}</td>
                  <td className="px-4 py-3">
                    <Badge tone={user.status === 'active' ? 'success' : 'danger'}>{user.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Panel>

        <Panel>
          <h2 className="text-lg font-semibold text-white">Novo usuario</h2>
          <form className="mt-4 grid gap-4" onSubmit={createUser}>
            <Field label="Nome">
              <input className={InputClassName} value={form.displayName} onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))} required />
            </Field>
            <Field label="E-mail">
              <input className={InputClassName} type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} required />
            </Field>
            <Field label="Papel">
              <select className={InputClassName} value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as RoleName }))}>
                <option value="operador_marketing">operador_marketing</option>
                <option value="gerente">gerente</option>
              </select>
            </Field>
            <Button type="submit">Criar usuario</Button>
          </form>
        </Panel>
      </div>
    </div>
  );
};
