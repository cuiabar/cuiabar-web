import { useEffect, useMemo, useState } from 'react';
import { crmRequest } from '../api';
import { Badge, Button, Field, InputClassName, MetricCard, PageHeader, Panel } from '../components';
import { useCrm } from '../context';
import type { Contact, DashboardMetrics, Template } from '../types';

type QuickSendPayload = {
  ok: true;
  campaignId: string;
  recipientCount: number;
  missingEmails: string[];
};

const normalizeEmails = (input: string) =>
  [...new Set(input.split(/[\n,;]+/).map((entry) => entry.trim().toLowerCase()).filter(Boolean))];

export const DashboardPage = () => {
  const { csrfToken } = useCrm();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState('');
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [manualEmails, setManualEmails] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [salutationMode, setSalutationMode] = useState<'personalized' | 'generic'>('personalized');
  const [sending, setSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  const load = async () => {
    const [metricsResponse, templatesResponse, contactsResponse] = await Promise.all([
      crmRequest<{ ok: true; metrics: DashboardMetrics }>('/api/reports/dashboard', {}, csrfToken),
      crmRequest<{ ok: true; templates: Template[] }>('/api/templates', {}, csrfToken),
      crmRequest<{ ok: true; contacts: Contact[] }>('/api/contacts?status=active', {}, csrfToken),
    ]);

    setMetrics(metricsResponse.metrics);
    setTemplates(templatesResponse.templates);
    setContacts(contactsResponse.contacts);
    setTemplateId((current) => current || templatesResponse.templates[0]?.id || '');
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, [csrfToken]);

  const filteredContacts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return contacts
      .filter((contact) => contact.optInStatus !== 'pending' && contact.optInStatus !== 'double_opt_in_pending')
      .filter((contact) =>
        normalizedSearch
          ? [contact.email, contact.firstName, contact.lastName].some((value) => value.toLowerCase().includes(normalizedSearch))
          : true,
      )
      .slice(0, 8);
  }, [contacts, search]);

  const mergedRecipients = useMemo(() => {
    const pasted = normalizeEmails(manualEmails);
    return [...new Set([...selectedEmails, ...pasted])];
  }, [manualEmails, selectedEmails]);

  const addRecipient = (email: string) => {
    setSelectedEmails((current) => (current.includes(email) ? current : [...current, email]));
  };

  const removeRecipient = (email: string) => {
    setSelectedEmails((current) => current.filter((entry) => entry !== email));
    setManualEmails((current) => normalizeEmails(current).filter((entry) => entry !== email).join('\n'));
  };

  const sendQuickCampaign = async () => {
    setSendError(null);
    setSendStatus(null);
    setSending(true);
    try {
      const response = await crmRequest<QuickSendPayload>(
        '/api/campaigns/quick-send',
        {
          method: 'POST',
          body: JSON.stringify({
            emails: mergedRecipients,
            templateId,
            salutationMode,
          }),
        },
        csrfToken,
      );
      setSendStatus(
        `Disparo criado e processado. Campanha ${response.campaignId} com ${response.recipientCount} destinatarios.${response.missingEmails.length ? ` E-mails nao encontrados no CRM: ${response.missingEmails.join(', ')}.` : ''}`,
      );
      setManualEmails('');
      setSelectedEmails([]);
      await load();
    } catch (requestError) {
      setSendError(requestError instanceof Error ? requestError.message : 'Falha ao enviar o disparo rapido.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="O disparador rapido fica aqui no topo: escolha o template, os clientes e a saudacao. O sistema registra envio, abertura observada, cliques e descadastro sem prometer inbox placement."
      />

      <Panel className="space-y-6">
        <div className="flex flex-col gap-3 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-amber-300">Primeira funcao</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Disparador rapido</h2>
            <p className="mt-2 max-w-3xl text-sm text-slate-300">
              Selecione o template, escolha os contatos do CRM e defina se a saudacao deve usar o nome de cada cliente ou a forma generica <strong>cliente</strong>.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="success">Click tracking ativo</Badge>
            <Badge tone="warning">Open tracking observavel e imperfeito</Badge>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
          <div className="space-y-4">
            <Field label="Template">
              <select className={InputClassName} value={templateId} onChange={(event) => setTemplateId(event.target.value)}>
                <option value="">Selecione um template</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} - {template.subject}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Saudacao" hint="Personalizada usa o first_name quando existir. Generica substitui por “cliente” para todos.">
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${salutationMode === 'personalized' ? 'border-amber-300 bg-amber-300/10 text-white' : 'border-white/10 bg-white/5 text-slate-300'}`}
                  onClick={() => setSalutationMode('personalized')}
                >
                  <div className="font-semibold">Nome personalizado</div>
                  <div className="mt-1 text-xs text-slate-400">Usa o nome salvo em cada contato.</div>
                </button>
                <button
                  type="button"
                  className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${salutationMode === 'generic' ? 'border-amber-300 bg-amber-300/10 text-white' : 'border-white/10 bg-white/5 text-slate-300'}`}
                  onClick={() => setSalutationMode('generic')}
                >
                  <div className="font-semibold">Generico “cliente”</div>
                  <div className="mt-1 text-xs text-slate-400">Padroniza a saudacao para todos os destinatarios.</div>
                </button>
              </div>
            </Field>

            <Field label="Colar e-mails" hint="Cole e-mails separados por virgula, ponto e virgula ou quebra de linha. O envio so usa contatos que ja existem no CRM.">
              <textarea className={`${InputClassName} min-h-[132px]`} value={manualEmails} onChange={(event) => setManualEmails(event.target.value)} placeholder="cliente1@exemplo.com&#10;cliente2@exemplo.com" />
            </Field>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">Destinatarios selecionados</p>
                  <p className="mt-1 text-xs text-slate-400">Total pronto para envio: {mergedRecipients.length}</p>
                </div>
                <Button variant="ghost" disabled={mergedRecipients.length === 0} onClick={() => { setSelectedEmails([]); setManualEmails(''); }}>
                  Limpar
                </Button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {mergedRecipients.length ? (
                  mergedRecipients.map((email) => (
                    <button
                      key={email}
                      type="button"
                      onClick={() => removeRecipient(email)}
                      className="rounded-full border border-white/10 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-200 transition hover:border-rose-300 hover:text-rose-200"
                    >
                      {email}
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">Nenhum destinatario selecionado ainda.</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button disabled={sending || !templateId || mergedRecipients.length === 0} onClick={sendQuickCampaign}>
                {sending ? 'Enviando...' : 'Enviar disparo'}
              </Button>
            </div>
            {sendStatus ? <p className="text-sm text-emerald-300">{sendStatus}</p> : null}
            {sendError ? <p className="text-sm text-rose-300">{sendError}</p> : null}
          </div>

          <div className="space-y-4">
            <Field label="Buscar clientes do CRM" hint="Clique para adicionar rapidamente contatos ativos e elegiveis ao disparo.">
              <input className={InputClassName} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nome ou e-mail" />
            </Field>
            <div className="grid gap-3">
              {filteredContacts.map((contact) => (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => addRecipient(contact.email)}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-amber-300/50 hover:bg-white/10"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">{[contact.firstName, contact.lastName].filter(Boolean).join(' ') || 'Contato sem nome'}</p>
                      <p className="mt-1 text-sm text-slate-300">{contact.email}</p>
                      <p className="mt-2 text-xs text-slate-400">
                        Fonte: {contact.source || 'nao informada'} · Opt-in: {contact.optInStatus}
                      </p>
                    </div>
                    <Badge tone={selectedEmails.includes(contact.email) ? 'success' : 'neutral'}>{selectedEmails.includes(contact.email) ? 'adicionado' : 'adicionar'}</Badge>
                  </div>
                </button>
              ))}
              {!filteredContacts.length ? <p className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-slate-400">Nenhum contato ativo encontrado para esse filtro.</p> : null}
            </div>
          </div>
        </div>
      </Panel>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Campanhas" value={metrics?.campaignsSent ?? 0} />
        <MetricCard label="Contatos ativos" value={metrics?.activeContacts ?? 0} />
        <MetricCard label="Aberturas observadas" value={metrics?.totalOpens ?? 0} note="Pixel de abertura por destinatario. Use como sinal auxiliar, nao como verdade absoluta." />
        <MetricCard label="Open rate observado" value={`${metrics?.openRate ?? 0}%`} note="Calculado em cima de eventos observados." />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Cliques totais" value={metrics?.totalClicks ?? 0} note="Click tracking por redirect e a metrica mais confiavel do sistema." />
        <MetricCard label="CTR observado" value={`${metrics?.ctr ?? 0}%`} note="Baseado em eventos observaveis, sem inferir inbox." />
        <MetricCard label="Falhas de envio" value={metrics?.failures ?? 0} />
        <MetricCard label="Descadastros" value={metrics?.unsubscribes ?? 0} />
      </div>

      <Panel>
        <h2 className="text-lg font-semibold text-white">Envios por periodo</h2>
        <div className="mt-5 grid gap-3">
          {(metrics?.sentByPeriod ?? []).map((entry) => (
            <div key={entry.day} className="flex items-center gap-4">
              <div className="w-28 text-sm text-slate-300">{entry.day}</div>
              <div className="h-3 flex-1 rounded-full bg-white/5">
                <div className="h-3 rounded-full bg-amber-300" style={{ width: `${Math.max(entry.total * 4, 6)}px` }} />
              </div>
              <div className="w-12 text-right text-sm text-white">{entry.total}</div>
            </div>
          ))}
          {!metrics?.sentByPeriod?.length ? <p className="text-sm text-slate-400">Ainda nao ha volume suficiente para desenhar a serie temporal.</p> : null}
        </div>
      </Panel>
    </div>
  );
};
