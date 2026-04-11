import { useEffect, useState } from 'react';
import { crmRequest } from '../api';
import { Badge, Button, Field, InputClassName, PageHeader, Panel } from '../components';
import { useCrm } from '../context';

type SettingsPayload = {
  gmail: {
    configured: boolean;
    senderEmail: string;
    senderName: string;
    authorizedEmail: string | null;
    connectedAt: string | null;
    connectionSource: 'panel_oauth' | 'cloudflare_secret' | null;
  };
  meta: {
    configured: boolean;
    graphConfigured: boolean;
    apiVersion: string;
    pixelId: string | null;
    pixelName: string | null;
    adAccountId: string | null;
    leadFormIds: string[];
    autoCreateContacts: boolean;
    lookbackDays: number;
    campaignsIndexed: number;
    leadsIndexed: number;
    leadsSyncedToContacts: number;
    lastLeadAt: string | null;
    lastSyncedAt: string | null;
    lastSync: { status: string; startedAt: string; finishedAt: string | null; error: string | null; summary: Record<string, unknown> } | null;
    error: string | null;
  };
  googleAds: {
    configured: boolean;
    apiVersion: string;
    customerId: string | null;
    loginCustomerId: string | null;
    conversionAction: string | null;
    lookbackDays: number;
    autoUploadLeadConversions: boolean;
    conversionValue: number;
    currencyCode: string;
    customerName: string | null;
    accessibleCustomers: number;
    campaignsIndexed: number;
    conversionsLogged: number;
    successfulConversions: number;
    lastUploadAt: string | null;
    lastSyncedAt: string | null;
    lastSync: { status: string; startedAt: string; finishedAt: string | null; error: string | null; summary: Record<string, unknown> } | null;
    error: string | null;
  };
  connectors: {
    meta: Record<string, unknown>;
    googleAds: Record<string, unknown>;
  };
  zoho: {
    configured: boolean;
    apiDomain: string | null;
    accountsDomain: string | null;
    organizationId: string | null;
    organizationName: string | null;
    organizationEmail: string | null;
    scope: string | null;
    error: string | null;
  };
  sending: Record<string, unknown>;
  deliverability: Record<string, unknown>;
  checklist: unknown;
  notices: { openTracking: boolean; clickTrackingReliable: boolean; inboxPlacementGuaranteed: boolean };
};

export const SettingsPage = () => {
  const { csrfToken, user } = useCrm();
  const [payload, setPayload] = useState<SettingsPayload | null>(null);
  const [sendingJson, setSendingJson] = useState('{}');
  const [deliverabilityJson, setDeliverabilityJson] = useState('{}');
  const [testEmail, setTestEmail] = useState('');
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [zohoStatus, setZohoStatus] = useState<string | null>(null);
  const [zohoError, setZohoError] = useState<string | null>(null);
  const [isZohoTesting, setIsZohoTesting] = useState(false);
  const [metaJson, setMetaJson] = useState('{}');
  const [googleAdsJson, setGoogleAdsJson] = useState('{}');
  const [metaStatus, setMetaStatus] = useState<string | null>(null);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [isMetaTesting, setIsMetaTesting] = useState(false);
  const [isMetaSyncing, setIsMetaSyncing] = useState(false);
  const [googleAdsStatus, setGoogleAdsStatus] = useState<string | null>(null);
  const [googleAdsError, setGoogleAdsError] = useState<string | null>(null);
  const [isGoogleAdsTesting, setIsGoogleAdsTesting] = useState(false);
  const [isGoogleAdsSyncing, setIsGoogleAdsSyncing] = useState(false);
  const gmailOauthUrl = '/oauth/gmail/start';

  const load = async () => {
    const response = await crmRequest<{ ok: true } & SettingsPayload>('/api/settings', {}, csrfToken);
    setPayload(response);
    setSendingJson(JSON.stringify(response.sending, null, 2));
    setDeliverabilityJson(JSON.stringify(response.deliverability, null, 2));
    setMetaJson(JSON.stringify(response.connectors.meta, null, 2));
    setGoogleAdsJson(JSON.stringify(response.connectors.googleAds, null, 2));
    setTestEmail((current) => current || response.gmail.senderEmail || user?.email || '');
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, [csrfToken]);

  const saveSending = async () => {
    await crmRequest('/api/settings/sending', { method: 'PUT', body: sendingJson }, csrfToken);
    await load();
  };

  const saveDeliverability = async () => {
    await crmRequest('/api/settings/deliverability', { method: 'PUT', body: deliverabilityJson }, csrfToken);
    await load();
  };

  const saveMeta = async () => {
    await crmRequest('/api/settings/meta', { method: 'PUT', body: metaJson }, csrfToken);
    await load();
  };

  const saveGoogleAds = async () => {
    await crmRequest('/api/settings/google-ads', { method: 'PUT', body: googleAdsJson }, csrfToken);
    await load();
  };

  const sendGmailTest = async () => {
    setTestError(null);
    setTestStatus(null);
    setIsTesting(true);
    try {
      const response = await crmRequest<{ ok: true; email: string; providerMessageId: string }>(
        '/api/settings/gmail/test',
        { method: 'POST', body: JSON.stringify({ email: testEmail }) },
        csrfToken,
      );
      setTestStatus(`Teste enviado para ${response.email}. Gmail message id: ${response.providerMessageId}.`);
      await load();
    } catch (requestError) {
      setTestError(requestError instanceof Error ? requestError.message : 'Falha ao enviar o teste do Gmail.');
    } finally {
      setIsTesting(false);
    }
  };

  const testZohoConnection = async () => {
    setZohoError(null);
    setZohoStatus(null);
    setIsZohoTesting(true);
    try {
      const response = await crmRequest<{
        ok: true;
        zoho: {
          apiDomain: string;
          scope: string | null;
          organization: {
            companyName: string | null;
            primaryEmail: string | null;
          };
        };
      }>('/api/settings/zoho/test', { method: 'POST' }, csrfToken);
      setZohoStatus(
        `Zoho conectado em ${response.zoho.apiDomain}. Organizacao: ${response.zoho.organization.companyName || 'sem nome'}${
          response.zoho.organization.primaryEmail ? ` (${response.zoho.organization.primaryEmail})` : ''
        }.`,
      );
      await load();
    } catch (requestError) {
      setZohoError(requestError instanceof Error ? requestError.message : 'Falha ao testar a conexao com o Zoho CRM.');
    } finally {
      setIsZohoTesting(false);
    }
  };

  const testMetaConnection = async () => {
    setMetaError(null);
    setMetaStatus(null);
    setIsMetaTesting(true);
    try {
      const response = await crmRequest<{ ok: true; meta: { pixel: { id: string | null; name: string | null } } }>('/api/settings/meta/test', { method: 'POST' }, csrfToken);
      setMetaStatus(`Meta validada. Pixel: ${response.meta.pixel.name || 'sem nome'} (${response.meta.pixel.id || 'sem id'}).`);
      await load();
    } catch (requestError) {
      setMetaError(requestError instanceof Error ? requestError.message : 'Falha ao testar a conexao com a Meta.');
    } finally {
      setIsMetaTesting(false);
    }
  };

  const syncMeta = async () => {
    setMetaError(null);
    setMetaStatus(null);
    setIsMetaSyncing(true);
    try {
      const response = await crmRequest<{ ok: true; summary: { campaignCount: number; leadCount: number; contactsCreated: number } }>(
        '/api/settings/meta/sync',
        { method: 'POST' },
        csrfToken,
      );
      setMetaStatus(
        `Meta sincronizada. Campanhas indexadas: ${response.summary.campaignCount}. Leads indexados: ${response.summary.leadCount}. Contatos tocados: ${response.summary.contactsCreated}.`,
      );
      await load();
    } catch (requestError) {
      setMetaError(requestError instanceof Error ? requestError.message : 'Falha ao sincronizar Meta.');
    } finally {
      setIsMetaSyncing(false);
    }
  };

  const testGoogleAdsConnection = async () => {
    setGoogleAdsError(null);
    setGoogleAdsStatus(null);
    setIsGoogleAdsTesting(true);
    try {
      const response = await crmRequest<{
        ok: true;
        googleAds: {
          customer: { descriptiveName: string | null; id: string | null };
          accessibleCustomers: string[];
        };
      }>('/api/settings/google-ads/test', { method: 'POST' }, csrfToken);
      setGoogleAdsStatus(
        `Google Ads conectado. Cliente: ${response.googleAds.customer.descriptiveName || 'sem nome'} (${response.googleAds.customer.id || 'sem id'}). Contas acessiveis: ${response.googleAds.accessibleCustomers.length}.`,
      );
      await load();
    } catch (requestError) {
      setGoogleAdsError(requestError instanceof Error ? requestError.message : 'Falha ao testar a conexao com o Google Ads.');
    } finally {
      setIsGoogleAdsTesting(false);
    }
  };

  const syncGoogleAds = async () => {
    setGoogleAdsError(null);
    setGoogleAdsStatus(null);
    setIsGoogleAdsSyncing(true);
    try {
      const response = await crmRequest<{ ok: true; summary: { campaignsIndexed: number; customerName: string | null } }>(
        '/api/settings/google-ads/sync',
        { method: 'POST' },
        csrfToken,
      );
      setGoogleAdsStatus(`Google Ads sincronizado. Campanhas indexadas: ${response.summary.campaignsIndexed}. Conta: ${response.summary.customerName || 'sem nome'}.`);
      await load();
    } catch (requestError) {
      setGoogleAdsError(requestError instanceof Error ? requestError.message : 'Falha ao sincronizar Google Ads.');
    } finally {
      setIsGoogleAdsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Configuracoes" description="A camada sensivel do CRM fica no ambiente Cloudflare. Aqui voce ajusta somente parametros operacionais e checklist." />
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Gmail e remetente</h2>
            <Badge tone={payload?.gmail.configured ? 'success' : 'warning'}>{payload?.gmail.configured ? 'configurado' : 'pendente'}</Badge>
          </div>
          <div className="space-y-2 text-sm text-slate-300">
            <p>Sender name: <strong className="text-white">{payload?.gmail.senderName ?? '-'}</strong></p>
            <p>Sender email: <strong className="text-white">{payload?.gmail.senderEmail ?? '-'}</strong></p>
            <p>Conta autorizada: <strong className="text-white">{payload?.gmail.authorizedEmail ?? 'nenhuma'}</strong></p>
            <p>Origem da conexao: <strong className="text-white">{payload?.gmail.connectionSource === 'cloudflare_secret' ? 'secret do Cloudflare' : payload?.gmail.connectionSource === 'panel_oauth' ? 'OAuth do painel' : 'nao conectada'}</strong></p>
            <p>Conectado em: <strong className="text-white">{payload?.gmail.connectedAt ? new Date(payload.gmail.connectedAt).toLocaleString('pt-BR') : '-'}</strong></p>
            <p>Click tracking confiavel: <strong className="text-white">{payload?.notices.clickTrackingReliable ? 'sim' : 'nao'}</strong></p>
            <p>Open tracking: <strong className="text-white">{payload?.notices.openTracking ? 'habilitado' : 'opcional/desligado'}</strong></p>
            <p>Inbox placement garantido: <strong className="text-white">{payload?.notices.inboxPlacementGuaranteed ? 'sim' : 'nao'}</strong></p>
          </div>
          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-50">
            <p className="font-semibold text-white">Conectar a conta remetente do Gmail</p>
            <p className="mt-2 text-amber-100/90">
              Use este fluxo para autorizar o envio com <strong>{payload?.gmail.senderEmail ?? 'leonardo@cuiabar.net'}</strong>.
              O Google deve abrir em nova aba e, ao concluir, mostrar a mensagem <strong>Autorizacao concluida</strong>.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                className="inline-flex items-center justify-center rounded-2xl bg-amber-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
                href={gmailOauthUrl}
                rel="noreferrer"
                target="_blank"
              >
                {payload?.gmail.configured ? 'Reconectar Gmail' : 'Conectar Gmail'}
              </a>
              <a
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                href="/oauth/gmail/setup"
                rel="noreferrer"
                target="_blank"
              >
                Ver instrucoes
              </a>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <Field
              label="Teste de envio"
              hint="Dispare um e-mail operacional simples para validar token, Gmail API e identidade remetente antes da primeira campanha."
            >
              <input className={InputClassName} value={testEmail} onChange={(event) => setTestEmail(event.target.value)} placeholder="leonardo@cuiabar.net" />
            </Field>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button disabled={!payload?.gmail.configured || isTesting || !testEmail.trim()} onClick={sendGmailTest}>
                {isTesting ? 'Enviando teste...' : 'Enviar teste do Gmail'}
              </Button>
            </div>
            {testStatus ? <p className="mt-4 text-sm text-emerald-300">{testStatus}</p> : null}
            {testError ? <p className="mt-4 text-sm text-rose-300">{testError}</p> : null}
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white">Zoho CRM</p>
                <p className="mt-1 text-sm text-slate-300">
                  Base da API: <strong className="text-white">{payload?.zoho.apiDomain ?? '-'}</strong>
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  Organizacao: <strong className="text-white">{payload?.zoho.organizationName ?? 'nao validada'}</strong>
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  E-mail principal: <strong className="text-white">{payload?.zoho.organizationEmail ?? '-'}</strong>
                </p>
              </div>
              <Badge tone={payload?.zoho.configured && !payload?.zoho.error ? 'success' : 'warning'}>
                {payload?.zoho.configured && !payload?.zoho.error ? 'conectado' : 'pendente'}
              </Badge>
            </div>
            <p className="mt-3 text-sm text-slate-300">
              Esta conexao vai servir de base para sincronizar Leads, Contacts, Deals e eventos vindos de Meta e Google Ads para o Zoho CRM.
            </p>
            {payload?.zoho.scope ? (
              <p className="mt-2 text-xs text-slate-400">
                Scope atual: <code>{payload.zoho.scope}</code>
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-3">
              <Button disabled={!payload?.zoho.configured || isZohoTesting} onClick={testZohoConnection}>
                {isZohoTesting ? 'Validando Zoho...' : 'Testar conexao Zoho'}
              </Button>
            </div>
            {zohoStatus ? <p className="mt-4 text-sm text-emerald-300">{zohoStatus}</p> : null}
            {zohoError ? <p className="mt-4 text-sm text-rose-300">{zohoError}</p> : null}
            {payload?.zoho.error ? <p className="mt-4 text-sm text-amber-300">{payload.zoho.error}</p> : null}
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white">Meta server-side</p>
                <p className="mt-1 text-sm text-slate-300">
                  Pixel: <strong className="text-white">{payload?.meta.pixelName || payload?.meta.pixelId || '-'}</strong>
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  Ad account: <strong className="text-white">{payload?.meta.adAccountId ?? '-'}</strong>
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  Lead forms: <strong className="text-white">{payload?.meta.leadFormIds?.length ?? 0}</strong>
                </p>
              </div>
              <Badge tone={payload?.meta.configured && payload?.meta.graphConfigured && !payload?.meta.error ? 'success' : 'warning'}>
                {payload?.meta.configured && payload?.meta.graphConfigured && !payload?.meta.error ? 'conectado' : 'pendente'}
              </Badge>
            </div>
            <div className="mt-4 space-y-1 text-sm text-slate-300">
              <p>Campanhas indexadas: <strong className="text-white">{payload?.meta.campaignsIndexed ?? 0}</strong></p>
              <p>Leads indexados: <strong className="text-white">{payload?.meta.leadsIndexed ?? 0}</strong></p>
              <p>Leads tocando contatos: <strong className="text-white">{payload?.meta.leadsSyncedToContacts ?? 0}</strong></p>
              <p>Auto criar contatos: <strong className="text-white">{payload?.meta.autoCreateContacts ? 'sim' : 'nao'}</strong></p>
              <p>Janela de sync: <strong className="text-white">{payload?.meta.lookbackDays ?? 0} dias</strong></p>
              <p>Ultimo sync: <strong className="text-white">{payload?.meta.lastSync?.startedAt ? new Date(payload.meta.lastSync.startedAt).toLocaleString('pt-BR') : '-'}</strong></p>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button disabled={isMetaTesting} onClick={testMetaConnection}>
                {isMetaTesting ? 'Validando Meta...' : 'Testar Meta'}
              </Button>
              <Button disabled={isMetaSyncing} onClick={syncMeta}>
                {isMetaSyncing ? 'Sincronizando Meta...' : 'Sincronizar Meta'}
              </Button>
            </div>
            {metaStatus ? <p className="mt-4 text-sm text-emerald-300">{metaStatus}</p> : null}
            {metaError ? <p className="mt-4 text-sm text-rose-300">{metaError}</p> : null}
            {payload?.meta.error ? <p className="mt-4 text-sm text-amber-300">{payload.meta.error}</p> : null}
            <Field label="JSON do conector Meta" hint="Use aqui IDs operacionais, como adAccountId, leadFormIds, lookbackDays e autoCreateContacts. Tokens continuam apenas no ambiente Cloudflare.">
              <textarea className={`${InputClassName} mt-3 min-h-[200px] font-mono text-xs`} value={metaJson} onChange={(event) => setMetaJson(event.target.value)} />
            </Field>
            <div className="mt-4">
              <Button onClick={saveMeta}>Salvar conector Meta</Button>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white">Google Ads server-side</p>
                <p className="mt-1 text-sm text-slate-300">
                  Customer ID: <strong className="text-white">{payload?.googleAds.customerId ?? '-'}</strong>
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  Conta: <strong className="text-white">{payload?.googleAds.customerName ?? 'nao validada'}</strong>
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  Conversion action: <strong className="text-white">{payload?.googleAds.conversionAction ?? '-'}</strong>
                </p>
              </div>
              <Badge tone={payload?.googleAds.configured && !payload?.googleAds.error && Boolean(payload?.googleAds.customerId) ? 'success' : 'warning'}>
                {payload?.googleAds.configured && !payload?.googleAds.error && Boolean(payload?.googleAds.customerId) ? 'conectado' : 'pendente'}
              </Badge>
            </div>
            <div className="mt-4 space-y-1 text-sm text-slate-300">
              <p>Campanhas indexadas: <strong className="text-white">{payload?.googleAds.campaignsIndexed ?? 0}</strong></p>
              <p>Conversoes registradas: <strong className="text-white">{payload?.googleAds.conversionsLogged ?? 0}</strong></p>
              <p>Conversoes com sucesso: <strong className="text-white">{payload?.googleAds.successfulConversions ?? 0}</strong></p>
              <p>Upload automatico de lead: <strong className="text-white">{payload?.googleAds.autoUploadLeadConversions ? 'sim' : 'nao'}</strong></p>
              <p>Contas acessiveis: <strong className="text-white">{payload?.googleAds.accessibleCustomers ?? 0}</strong></p>
              <p>Ultimo sync: <strong className="text-white">{payload?.googleAds.lastSync?.startedAt ? new Date(payload.googleAds.lastSync.startedAt).toLocaleString('pt-BR') : '-'}</strong></p>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button disabled={isGoogleAdsTesting} onClick={testGoogleAdsConnection}>
                {isGoogleAdsTesting ? 'Validando Google Ads...' : 'Testar Google Ads'}
              </Button>
              <Button disabled={isGoogleAdsSyncing} onClick={syncGoogleAds}>
                {isGoogleAdsSyncing ? 'Sincronizando Google Ads...' : 'Sincronizar Google Ads'}
              </Button>
            </div>
            {googleAdsStatus ? <p className="mt-4 text-sm text-emerald-300">{googleAdsStatus}</p> : null}
            {googleAdsError ? <p className="mt-4 text-sm text-rose-300">{googleAdsError}</p> : null}
            {payload?.googleAds.error ? <p className="mt-4 text-sm text-amber-300">{payload.googleAds.error}</p> : null}
            <Field label="JSON do conector Google Ads" hint="Use aqui customerId, loginCustomerId, conversionAction, lookbackDays, autoUploadLeadConversions, conversionValue e currencyCode.">
              <textarea className={`${InputClassName} mt-3 min-h-[200px] font-mono text-xs`} value={googleAdsJson} onChange={(event) => setGoogleAdsJson(event.target.value)} />
            </Field>
            <div className="mt-4">
              <Button onClick={saveGoogleAds}>Salvar conector Google Ads</Button>
            </div>
          </div>
          <pre className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-300">{JSON.stringify(payload?.checklist ?? {}, null, 2)}</pre>
        </Panel>

        <Panel className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Controles de envio</h2>
          <Field label="JSON de envio">
            <textarea className={`${InputClassName} min-h-[240px] font-mono text-xs`} value={sendingJson} onChange={(event) => setSendingJson(event.target.value)} />
          </Field>
          <Button onClick={saveSending}>Salvar envio</Button>
        </Panel>

        <Panel className="space-y-4 xl:col-span-2">
          <h2 className="text-lg font-semibold text-white">Politicas de entregabilidade</h2>
          <Field label="JSON de entregabilidade">
            <textarea className={`${InputClassName} min-h-[240px] font-mono text-xs`} value={deliverabilityJson} onChange={(event) => setDeliverabilityJson(event.target.value)} />
          </Field>
          <Button onClick={saveDeliverability}>Salvar politicas</Button>
        </Panel>
      </div>
    </div>
  );
};
