import { useEffect, useMemo, useState } from 'react';
import { crmRequest } from '../api';
import { Badge, Button, Field, InputClassName, PageHeader, Panel, Table } from '../components';
import { useCrm } from '../context';
import type { Campaign, ContactList, Segment, Template } from '../types';

type CampaignMetrics = {
  metrics: {
    recipients: number;
    sent: number;
    failed: number;
    opensTotal: number;
    opensUnique: number;
    openedContacts: number;
    clicksTotal: number;
    clicksUnique: number;
    clickedContacts: number;
    unsubscribed: number;
    openRate: number;
    ctr: number;
    deliveryObservedRate: number;
  };
  topLinks: Array<{ id: string; original_url: string; click_count_total: number; click_count_unique: number }>;
  recipients: Array<{ email_snapshot: string; status: string; sent_at: string | null; opened_at: string | null; clicked_at: string | null; unsubscribed_at: string | null; last_error: string | null }>;
};

export const CampaignsPage = () => {
  const { csrfToken } = useCrm();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [lists, setLists] = useState<ContactList[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [metrics, setMetrics] = useState<CampaignMetrics | null>(null);
  const [testEmails, setTestEmails] = useState('');
  const [form, setForm] = useState({
    name: '',
    subject: '',
    preheader: '',
    templateId: '',
    listId: '',
    segmentId: '',
    fromName: 'Cuiabar CRM',
    fromEmail: 'contato@cuiabar.com',
    replyTo: 'contato@cuiabar.com',
    scheduledAt: '',
  });

  const loadBase = async () => {
    const [campaignResponse, templateResponse, listResponse, segmentResponse] = await Promise.all([
      crmRequest<{ ok: true; campaigns: Campaign[] }>('/api/campaigns', {}, csrfToken),
      crmRequest<{ ok: true; templates: Template[] }>('/api/templates', {}, csrfToken),
      crmRequest<{ ok: true; lists: ContactList[] }>('/api/lists', {}, csrfToken),
      crmRequest<{ ok: true; segments: Segment[] }>('/api/segments', {}, csrfToken),
    ]);
    setCampaigns(campaignResponse.campaigns);
    setTemplates(templateResponse.templates);
    setLists(listResponse.lists);
    setSegments(segmentResponse.segments);
  };

  useEffect(() => {
    loadBase().catch(() => undefined);
  }, [csrfToken]);

  useEffect(() => {
    if (!selectedCampaignId) {
      setMetrics(null);
      return;
    }
    crmRequest<{ ok: true } & CampaignMetrics>(`/api/campaigns/${selectedCampaignId}/metrics`, {}, csrfToken)
      .then((response) => setMetrics({ metrics: response.metrics, topLinks: response.topLinks, recipients: response.recipients }))
      .catch(() => setMetrics(null));
  }, [csrfToken, selectedCampaignId]);

  const selectedCampaign = useMemo(() => campaigns.find((campaign) => campaign.id === selectedCampaignId) ?? null, [campaigns, selectedCampaignId]);

  const saveCampaign = async (event: React.FormEvent) => {
    event.preventDefault();
    await crmRequest('/api/campaigns', { method: 'POST', body: JSON.stringify({ ...form, listId: form.listId || null, segmentId: form.segmentId || null, scheduledAt: form.scheduledAt || null }) }, csrfToken);
    setForm((current) => ({ ...current, name: '', subject: '', preheader: '' }));
    await loadBase();
  };

  const launchCampaign = async (scheduledAt?: string) => {
    if (!selectedCampaignId) return;
    await crmRequest(`/api/campaigns/${selectedCampaignId}/launch`, { method: 'POST', body: JSON.stringify({ scheduledAt: scheduledAt || null }) }, csrfToken);
    await loadBase();
  };

  const sendTest = async () => {
    if (!selectedCampaignId) return;
    await crmRequest(
      `/api/campaigns/${selectedCampaignId}/send-test`,
      { method: 'POST', body: JSON.stringify({ emails: testEmails.split(',').map((entry) => entry.trim()).filter(Boolean) }) },
      csrfToken,
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Campanhas" description="Fluxo completo de rascunho, teste, agendamento, envio em lotes e acompanhamento de cliques por destinatario." />

      <div className="grid gap-6 xl:grid-cols-[1.4fr,1fr]">
        <Panel className="space-y-4">
          <Table>
            <thead className="bg-white/5 text-xs uppercase tracking-[0.2em] text-slate-400">
              <tr>
                <th className="px-4 py-3">Campanha</th>
                <th className="px-4 py-3">Publico</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Envio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="cursor-pointer hover:bg-white/5" onClick={() => setSelectedCampaignId(campaign.id)}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{campaign.name}</div>
                    <div className="text-xs text-slate-400">{campaign.subject}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{campaign.listId ? `Lista ${campaign.listId}` : campaign.segmentId ? `Segmento ${campaign.segmentId}` : 'Sem publico'}</td>
                  <td className="px-4 py-3">
                    <Badge tone={campaign.status === 'sent' ? 'success' : campaign.status === 'draft' ? 'neutral' : campaign.status === 'failed' ? 'danger' : 'warning'}>{campaign.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{campaign.totalSent}/{campaign.totalRecipients}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          {selectedCampaign ? (
            <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => launchCampaign()}>Enviar agora</Button>
                <Button variant="ghost" onClick={() => launchCampaign(new Date(Date.now() + 15 * 60 * 1000).toISOString())}>
                  Agendar +15 min
                </Button>
                <Button variant="ghost" onClick={sendTest}>
                  Send test
                </Button>
                <Button variant="ghost" onClick={() => crmRequest(`/api/campaigns/${selectedCampaign.id}/process`, { method: 'POST' }, csrfToken)}>
                  Processar lote
                </Button>
              </div>
              <Field label="Test recipients" hint="Separados por virgula">
                <input className={InputClassName} value={testEmails} onChange={(event) => setTestEmails(event.target.value)} />
              </Field>
              {metrics ? (
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                    <p className="text-sm text-slate-400">Revisao operacional</p>
                    <ul className="mt-3 space-y-2 text-sm text-slate-200">
                      <li>Destinatarios: {metrics.metrics.recipients}</li>
                      <li>Enviados: {metrics.metrics.sent}</li>
                      <li>Falhas: {metrics.metrics.failed}</li>
                      <li>Aberturas unicas observadas: {metrics.metrics.opensUnique}</li>
                      <li>Open rate observado: {metrics.metrics.openRate}%</li>
                      <li>CTR observado: {metrics.metrics.ctr}%</li>
                      <li>Delivery observed rate: {metrics.metrics.deliveryObservedRate}%</li>
                    </ul>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                    <p className="text-sm text-slate-400">Top links clicados</p>
                    <ul className="mt-3 space-y-2 text-sm text-slate-200">
                      {metrics.topLinks.slice(0, 5).map((link) => (
                        <li key={link.id}>
                          <span className="block truncate">{link.original_url}</span>
                          <span className="text-xs text-slate-400">{link.click_count_unique} unicos / {link.click_count_total} totais</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </Panel>

        <Panel>
          <h2 className="text-lg font-semibold text-white">Nova campanha</h2>
          <form className="mt-4 grid gap-4" onSubmit={saveCampaign}>
            <Field label="Nome">
              <input className={InputClassName} value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
            </Field>
            <Field label="Assunto">
              <input className={InputClassName} value={form.subject} onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))} required />
            </Field>
            <Field label="Preheader">
              <input className={InputClassName} value={form.preheader} onChange={(event) => setForm((current) => ({ ...current, preheader: event.target.value }))} />
            </Field>
            <Field label="Template">
              <select className={InputClassName} value={form.templateId} onChange={(event) => setForm((current) => ({ ...current, templateId: event.target.value }))} required>
                <option value="">Selecione</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Lista estatica">
              <select className={InputClassName} value={form.listId} onChange={(event) => setForm((current) => ({ ...current, listId: event.target.value }))}>
                <option value="">Nenhuma</option>
                {lists.map((list) => (
                  <option key={list.id} value={list.id}>
                    {list.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Segmento dinamico">
              <select className={InputClassName} value={form.segmentId} onChange={(event) => setForm((current) => ({ ...current, segmentId: event.target.value }))}>
                <option value="">Nenhum</option>
                {segments.map((segment) => (
                  <option key={segment.id} value={segment.id}>
                    {segment.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="From name">
              <input className={InputClassName} value={form.fromName} onChange={(event) => setForm((current) => ({ ...current, fromName: event.target.value }))} />
            </Field>
            <Field label="From email">
              <input className={InputClassName} type="email" value={form.fromEmail} onChange={(event) => setForm((current) => ({ ...current, fromEmail: event.target.value }))} />
            </Field>
            <Field label="Reply-To">
              <input className={InputClassName} type="email" value={form.replyTo} onChange={(event) => setForm((current) => ({ ...current, replyTo: event.target.value }))} />
            </Field>
            <Button type="submit">Salvar campanha</Button>
          </form>
        </Panel>
      </div>
    </div>
  );
};
