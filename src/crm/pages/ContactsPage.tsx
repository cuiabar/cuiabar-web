import { useEffect, useMemo, useState } from 'react';
import { crmRequest } from '../api';
import { Badge, Button, Field, InputClassName, PageHeader, Panel, Table } from '../components';
import { useCrm } from '../context';
import type { Contact, ContactList } from '../types';

const parseCsv = (input: string) => {
  const rows: string[][] = [];
  let current = '';
  let row: string[] = [];
  let insideQuotes = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const nextChar = input[index + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        current += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }

    if (char === ',' && !insideQuotes) {
      row.push(current);
      current = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        index += 1;
      }
      row.push(current);
      rows.push(row);
      row = [];
      current = '';
      continue;
    }

    current += char;
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current);
    rows.push(row);
  }

  return rows;
};

export const ContactsPage = () => {
  const { csrfToken } = useCrm();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [lists, setLists] = useState<ContactList[]>([]);
  const [history, setHistory] = useState<Record<string, unknown> | null>(null);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [form, setForm] = useState({ email: '', firstName: '', lastName: '', phone: '', source: 'manual', tags: '' });
  const [csvText, setCsvText] = useState('');
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [importListId, setImportListId] = useState('');
  const [syncingZoho, setSyncingZoho] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const headers = useMemo(() => (csvText ? parseCsv(csvText)[0] ?? [] : []), [csvText]);
  const previewRows = useMemo(() => {
    if (!csvText) {
      return [];
    }
    const [, ...rows] = parseCsv(csvText);
    return rows.slice(0, 5).map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ''])));
  }, [csvText, headers]);

  const loadContacts = async () => {
    const query = new URLSearchParams();
    if (search) query.set('search', search);
    if (statusFilter) query.set('status', statusFilter);
    const response = await crmRequest<{ ok: true; contacts: Contact[] }>(`/api/contacts?${query.toString()}`, {}, csrfToken);
    setContacts(response.contacts);
  };

  useEffect(() => {
    loadContacts().catch(() => undefined);
    crmRequest<{ ok: true; lists: ContactList[] }>('/api/lists', {}, csrfToken)
      .then((response) => setLists(response.lists))
      .catch(() => setLists([]));
  }, [csrfToken]);

  useEffect(() => {
    if (!selectedContactId) {
      setHistory(null);
      return;
    }

    crmRequest<{ ok: true; sendHistory: unknown[]; clicks: unknown[]; unsubscribes: unknown[] }>(`/api/contacts/${selectedContactId}/history`, {}, csrfToken)
      .then((response) => setHistory(response))
      .catch(() => setHistory(null));
  }, [csrfToken, selectedContactId]);

  const createContact = async (event: React.FormEvent) => {
    event.preventDefault();
    await crmRequest(
      '/api/contacts',
      {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          tags: form.tags.split(',').map((entry) => entry.trim()).filter(Boolean),
        }),
      },
      csrfToken,
    );
    setForm({ email: '', firstName: '', lastName: '', phone: '', source: 'manual', tags: '' });
    await loadContacts();
  };

  const importCsv = async () => {
    if (!csvText) {
      return;
    }
    await crmRequest(
      '/api/contacts/import',
      {
        method: 'POST',
        body: JSON.stringify({
          csvText,
          mapping,
          listId: importListId || null,
          source: 'csv_upload',
        }),
      },
      csrfToken,
    );
    setCsvText('');
    setMapping({});
    await loadContacts();
  };

  const syncVisibleContactsToZoho = async () => {
    setSyncStatus(null);
    setSyncError(null);
    setSyncingZoho(true);
    try {
      const response = await crmRequest<{ ok: true; total: number; synced: number; failed: number }>(
        '/api/contacts/sync/zoho',
        {
          method: 'POST',
          body: JSON.stringify({ contactIds: contacts.map((contact) => contact.id) }),
        },
        csrfToken,
      );
      setSyncStatus(`Zoho atualizado para ${response.synced} de ${response.total} contatos visiveis.`);
      await loadContacts();
    } catch (requestError) {
      setSyncError(requestError instanceof Error ? requestError.message : 'Falha ao sincronizar contatos com o Zoho.');
    } finally {
      setSyncingZoho(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contatos"
        description="Cadastre, importe, filtre e consulte o historico operacional de cada contato, sempre bloqueando descadastros e suppressions."
        action={
          <Button disabled={syncingZoho || contacts.length === 0} onClick={syncVisibleContactsToZoho}>
            {syncingZoho ? 'Sincronizando Zoho...' : 'Sincronizar contatos visiveis no Zoho'}
          </Button>
        }
      />

      {syncStatus ? <p className="text-sm text-emerald-300">{syncStatus}</p> : null}
      {syncError ? <p className="text-sm text-rose-300">{syncError}</p> : null}

      <div className="grid gap-6 xl:grid-cols-[1.5fr,1fr]">
        <Panel className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <input className={InputClassName} placeholder="Buscar por e-mail ou nome" value={search} onChange={(event) => setSearch(event.target.value)} />
            <select className={InputClassName} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="">Todos os status</option>
              <option value="active">active</option>
              <option value="unsubscribed">unsubscribed</option>
              <option value="bounced">bounced</option>
              <option value="complained">complained</option>
              <option value="suppressed">suppressed</option>
            </select>
            <Button onClick={() => loadContacts()}>Filtrar</Button>
          </div>

          <Table>
            <thead className="bg-white/5 text-xs uppercase tracking-[0.2em] text-slate-400">
              <tr>
                <th className="px-4 py-3">Contato</th>
                <th className="px-4 py-3">Origem</th>
                <th className="px-4 py-3">Tags</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Zoho</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {contacts.map((contact) => (
                <tr key={contact.id} className="cursor-pointer hover:bg-white/5" onClick={() => setSelectedContactId(contact.id)}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{contact.email}</div>
                    <div className="text-xs text-slate-400">{`${contact.firstName} ${contact.lastName}`.trim() || 'Sem nome'}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{contact.source || 'n/d'}</td>
                  <td className="px-4 py-3 text-slate-300">{contact.tags.join(', ') || 'Sem tags'}</td>
                  <td className="px-4 py-3">
                    <Badge tone={contact.status === 'active' ? 'success' : contact.status === 'unsubscribed' ? 'warning' : 'danger'}>{contact.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-2">
                      <Badge
                        tone={
                          contact.zoho.status === 'synced'
                            ? 'success'
                            : contact.zoho.status === 'error'
                              ? 'danger'
                              : contact.zoho.status === 'pending'
                                ? 'warning'
                                : 'neutral'
                        }
                      >
                        {contact.zoho.status}
                      </Badge>
                      {contact.zoho.externalId ? <span className="text-[11px] text-slate-400">{contact.zoho.externalId}</span> : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Panel>

        <div className="space-y-6">
          <Panel>
            <h2 className="text-lg font-semibold text-white">Cadastro manual</h2>
            <form className="mt-4 grid gap-4" onSubmit={createContact}>
              <Field label="E-mail">
                <input className={InputClassName} type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} required />
              </Field>
              <Field label="Primeiro nome">
                <input className={InputClassName} value={form.firstName} onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))} />
              </Field>
              <Field label="Sobrenome">
                <input className={InputClassName} value={form.lastName} onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))} />
              </Field>
              <Field label="Telefone">
                <input className={InputClassName} value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
              </Field>
              <Field label="Origem">
                <input className={InputClassName} value={form.source} onChange={(event) => setForm((current) => ({ ...current, source: event.target.value }))} />
              </Field>
              <Field label="Tags" hint="Separadas por virgula">
                <input className={InputClassName} value={form.tags} onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))} />
              </Field>
              <Button type="submit">Salvar contato</Button>
            </form>
          </Panel>

          <Panel>
            <h2 className="text-lg font-semibold text-white">Importacao CSV</h2>
            <div className="mt-4 grid gap-4">
              <Field label="Arquivo CSV" hint="Cole o conteudo ou use upload local">
                <textarea className={`${InputClassName} min-h-[140px]`} value={csvText} onChange={(event) => setCsvText(event.target.value)} />
              </Field>
              <input
                className="text-sm text-slate-300"
                type="file"
                accept=".csv,text/csv"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  setCsvText(await file.text());
                }}
              />
              {headers.length ? (
                <>
                  <div className="grid gap-3 md:grid-cols-2">
                    {['email', 'first_name', 'last_name', 'phone', 'source', 'tags', 'opt_in_status'].map((field) => (
                      <Field key={field} label={`Mapear ${field}`}>
                        <select className={InputClassName} value={mapping[field] ?? ''} onChange={(event) => setMapping((current) => ({ ...current, [field]: event.target.value }))}>
                          <option value="">Ignorar</option>
                          {headers.map((header) => (
                            <option key={header} value={header}>
                              {header}
                            </option>
                          ))}
                        </select>
                      </Field>
                    ))}
                  </div>
                  <Field label="Lista de destino">
                    <select className={InputClassName} value={importListId} onChange={(event) => setImportListId(event.target.value)}>
                      <option value="">Sem lista</option>
                      {lists.map((list) => (
                        <option key={list.id} value={list.id}>
                          {list.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm font-medium text-white">Preview das primeiras linhas</p>
                    <pre className="mt-3 overflow-x-auto text-xs text-slate-300">{JSON.stringify(previewRows, null, 2)}</pre>
                  </div>
                  <Button onClick={importCsv}>Importar CSV</Button>
                </>
              ) : null}
            </div>
          </Panel>

          <Panel>
            <h2 className="text-lg font-semibold text-white">Historico do contato</h2>
            {history ? <pre className="mt-3 overflow-x-auto text-xs text-slate-300">{JSON.stringify(history, null, 2)}</pre> : <p className="mt-3 text-sm text-slate-400">Selecione um contato para ver envios, cliques e descadastros.</p>}
          </Panel>
        </div>
      </div>
    </div>
  );
};
