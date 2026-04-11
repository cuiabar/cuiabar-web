import { useEffect, useState } from 'react';
import { crmRequest } from '../api';
import { Button, Field, InputClassName, PageHeader, Panel, Table } from '../components';
import { useCrm } from '../context';
import type { ContactList } from '../types';

export const ListsPage = () => {
  const { csrfToken } = useCrm();
  const [lists, setLists] = useState<ContactList[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const load = async () => {
    const response = await crmRequest<{ ok: true; lists: ContactList[] }>('/api/lists', {}, csrfToken);
    setLists(response.lists);
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, [csrfToken]);

  const createList = async (event: React.FormEvent) => {
    event.preventDefault();
    await crmRequest('/api/lists', { method: 'POST', body: JSON.stringify({ name, description }) }, csrfToken);
    setName('');
    setDescription('');
    await load();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Listas" description="Listas estaticas servem para importacoes, campanhas sazonais e grupos sob controle manual." />
      <div className="grid gap-6 xl:grid-cols-[1.4fr,0.8fr]">
        <Panel>
          <Table>
            <thead className="bg-white/5 text-xs uppercase tracking-[0.2em] text-slate-400">
              <tr>
                <th className="px-4 py-3">Lista</th>
                <th className="px-4 py-3">Descricao</th>
                <th className="px-4 py-3">Contatos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {lists.map((list) => (
                <tr key={list.id}>
                  <td className="px-4 py-3 font-medium text-white">{list.name}</td>
                  <td className="px-4 py-3 text-slate-300">{list.description || 'Sem descricao'}</td>
                  <td className="px-4 py-3 text-slate-300">{list.contact_count}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Panel>

        <Panel>
          <h2 className="text-lg font-semibold text-white">Nova lista</h2>
          <form className="mt-4 grid gap-4" onSubmit={createList}>
            <Field label="Nome">
              <input className={InputClassName} value={name} onChange={(event) => setName(event.target.value)} required />
            </Field>
            <Field label="Descricao">
              <textarea className={`${InputClassName} min-h-[120px]`} value={description} onChange={(event) => setDescription(event.target.value)} />
            </Field>
            <Button type="submit">Criar lista</Button>
          </form>
        </Panel>
      </div>
    </div>
  );
};
