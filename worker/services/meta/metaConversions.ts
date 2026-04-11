import type { Env } from '../../types';

const META_DEFAULT_API_VERSION = 'v22.0';
const FALLBACK_META_PIXEL_ID = '1385099743118536';

type MetaPayloadRecord = Record<string, unknown>;

export type MetaEventForwardInput = {
  event_name?: string;
  event_id?: string;
  event_time?: number;
  action_source?: string;
  event_source_url?: string;
  source?: string;
  user_data?: Record<string, string | undefined>;
  custom_data?: MetaPayloadRecord;
  test_event_code?: string;
};

type MetaGraphError = {
  message?: string;
  type?: string;
  code?: number;
  error_subcode?: number;
};

type MetaGraphPayload = {
  id?: string;
  name?: string;
  success?: boolean;
  events_received?: number;
  messages?: string[];
  error?: MetaGraphError;
  data?: Array<Record<string, unknown>>;
  paging?: {
    next?: string;
  };
};

export type MetaPixelSummary = {
  id: string | null;
  name: string | null;
};

export type MetaLeadRecord = {
  id: string;
  createdTime: string | null;
  formId: string;
  campaignId: string | null;
  adsetId: string | null;
  adId: string | null;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  raw: Record<string, unknown>;
};

export type MetaCampaignMetric = {
  accountId: string | null;
  campaignId: string;
  campaignName: string | null;
  campaignStatus: string | null;
  dateStart: string | null;
  dateStop: string | null;
  impressions: number;
  clicks: number;
  ctr: number | null;
  spendAmount: number;
  spendCurrency: string | null;
  conversions: number;
  raw: Record<string, unknown>;
};

const normalizeBaseUrl = (value: string | undefined, fallback: string) => (value || fallback).trim().replace(/\/+$/, '');

const getMetaGraphApiVersion = (env: Env) => normalizeBaseUrl(env.META_GRAPH_API_VERSION, META_DEFAULT_API_VERSION);

export const getMetaPixelId = (env: Env) => (env.META_PIXEL_ID || FALLBACK_META_PIXEL_ID).trim();

const getMetaAccessToken = (env: Env) => (env.META_ACCESS_TOKEN || env.META_CAPI_TOKEN || '').trim();

export const isMetaConfigured = (env: Env) => Boolean(getMetaPixelId(env) && env.META_CAPI_TOKEN?.trim());

export const isMetaGraphConfigured = (env: Env) => Boolean(getMetaPixelId(env) && getMetaAccessToken(env));

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

const pruneRecord = (record: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(record).filter(([, value]) => value !== undefined && value !== null && value !== ''));

const getCookieValue = (cookieHeader: string | null, name: string) => {
  if (!cookieHeader) {
    return undefined;
  }

  const match = cookieHeader.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
};

const isSha256 = (value: string) => /^[a-f0-9]{64}$/i.test(value);

const sha256 = async (value: string) => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
};

const normalizeHashedField = async (value: string | undefined, normalize: (value: string) => string) => {
  if (!value?.trim()) {
    return undefined;
  }

  const trimmed = value.trim().toLowerCase();
  if (isSha256(trimmed)) {
    return trimmed;
  }

  return sha256(normalize(value));
};

const normalizeEmail = (value: string) => value.trim().toLowerCase();
const normalizePhone = (value: string) => value.replace(/\D+/g, '');

const buildMetaGraphUrl = (env: Env, path: string) => {
  const apiVersion = getMetaGraphApiVersion(env);
  const normalizedPath = path.replace(/^\/+/, '');
  return `https://graph.facebook.com/${apiVersion}/${normalizedPath}`;
};

const metaGraphRequest = async <T = MetaGraphPayload>(env: Env, path: string, init?: RequestInit) => {
  const accessToken = getMetaAccessToken(env);
  if (!accessToken) {
    throw new Error('Token da Meta ainda nao foi configurado no Worker.');
  }

  const url = new URL(buildMetaGraphUrl(env, path));
  if (!init?.body || init.method === 'GET' || !init.method) {
    url.searchParams.set('access_token', accessToken);
  }

  const headers = new Headers(init?.headers);
  if (init?.body) {
    headers.set('content-type', 'application/json');
  }

  const response = await fetch(url.toString(), {
    ...init,
    headers,
    body: init?.body,
  });

  const payload = (await response.json().catch(() => ({}))) as T & { error?: MetaGraphError };
  if (!response.ok || (payload as { error?: MetaGraphError }).error) {
    const error = (payload as { error?: MetaGraphError }).error;
    throw new Error(error?.message || `Meta Graph API recusou a requisicao (${response.status}).`);
  }

  return payload;
};

export const getMetaPixelSummary = async (env: Env): Promise<MetaPixelSummary> => {
  const payload = await metaGraphRequest<MetaGraphPayload>(env, `${getMetaPixelId(env)}?fields=id,name`);
  return {
    id: payload.id ?? null,
    name: payload.name ?? null,
  };
};

export const forwardMetaEvent = async (env: Env, request: Request, payload: MetaEventForwardInput) => {
  if (!isMetaConfigured(env)) {
    return { configured: false, forwarded: false as const, eventsReceived: 0 };
  }

  const userDataInput = isRecord(payload.user_data) ? payload.user_data : {};
  const customData = isRecord(payload.custom_data) ? payload.custom_data : undefined;
  const cookieHeader = request.headers.get('cookie');
  const clientIpAddress = request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const clientUserAgent = request.headers.get('user-agent') ?? undefined;
  const fbp = typeof userDataInput.fbp === 'string' ? userDataInput.fbp : getCookieValue(cookieHeader, '_fbp');
  const fbc = typeof userDataInput.fbc === 'string' ? userDataInput.fbc : getCookieValue(cookieHeader, '_fbc');
  const em = await normalizeHashedField(
    typeof userDataInput.em === 'string' ? userDataInput.em : typeof userDataInput.email === 'string' ? userDataInput.email : undefined,
    normalizeEmail,
  );
  const ph = await normalizeHashedField(
    typeof userDataInput.ph === 'string' ? userDataInput.ph : typeof userDataInput.phone === 'string' ? userDataInput.phone : undefined,
    normalizePhone,
  );

  const event = pruneRecord({
    event_name: payload.event_name?.trim() || 'unknown_event',
    event_time: Number.isFinite(payload.event_time) ? Math.floor(payload.event_time as number) : Math.floor(Date.now() / 1000),
    event_id: payload.event_id?.trim() || `srv_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    action_source: payload.action_source?.trim() || 'website',
    event_source_url: payload.event_source_url?.trim() || request.headers.get('origin') || undefined,
    user_data: pruneRecord({
      client_ip_address: clientIpAddress,
      client_user_agent: clientUserAgent,
      fbp,
      fbc,
      em,
      ph,
    }),
    custom_data: customData && Object.keys(customData).length > 0 ? pruneRecord(customData) : undefined,
  });

  const graphUrl = new URL(buildMetaGraphUrl(env, `${getMetaPixelId(env)}/events`));
  graphUrl.searchParams.set('access_token', env.META_CAPI_TOKEN?.trim() || '');

  const requestBody: Record<string, unknown> = {
    data: [event],
    partner_agent: 'cuiabar-crm-cloudflare',
  };

  if (payload.test_event_code?.trim()) {
    requestBody.test_event_code = payload.test_event_code.trim();
  }

  const response = await fetch(graphUrl.toString(), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  const metaPayload = (await response.json().catch(() => ({}))) as MetaGraphPayload;
  if (!response.ok || metaPayload.error) {
    throw new Error(metaPayload.error?.message || `Meta Conversions API recusou a requisicao (${response.status}).`);
  }

  return {
    configured: true,
    forwarded: true as const,
    eventsReceived: metaPayload.events_received ?? 0,
  };
};

export const fetchMetaCampaignMetrics = async (env: Env, adAccountId: string, since: string, until: string) => {
  const accountKey = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
  const fields = ['account_id', 'campaign_id', 'campaign_name', 'campaign_status', 'date_start', 'date_stop', 'impressions', 'clicks', 'ctr', 'spend', 'actions'];
  const url = new URL(buildMetaGraphUrl(env, `${accountKey}/insights`));
  url.searchParams.set('access_token', getMetaAccessToken(env));
  url.searchParams.set('level', 'campaign');
  url.searchParams.set('time_increment', '1');
  url.searchParams.set('fields', fields.join(','));
  url.searchParams.set('time_range', JSON.stringify({ since, until }));
  url.searchParams.set('limit', '500');

  const metrics: MetaCampaignMetric[] = [];
  let nextUrl: string | null = url.toString();

  while (nextUrl) {
    const response = await fetch(nextUrl);
    const payload = (await response.json().catch(() => ({}))) as MetaGraphPayload;
    if (!response.ok || payload.error) {
      throw new Error(payload.error?.message || 'Falha ao buscar insights de campanhas na Meta.');
    }

    for (const row of payload.data ?? []) {
      if (!isRecord(row) || typeof row.campaign_id !== 'string') {
        continue;
      }

      const actions = Array.isArray(row.actions) ? row.actions : [];
      const conversions = actions.reduce((total, action) => {
        if (!isRecord(action)) {
          return total;
        }
        const value = Number(action.value);
        return Number.isFinite(value) ? total + value : total;
      }, 0);

      metrics.push({
        accountId: typeof row.account_id === 'string' ? row.account_id : null,
        campaignId: row.campaign_id,
        campaignName: typeof row.campaign_name === 'string' ? row.campaign_name : null,
        campaignStatus: typeof row.campaign_status === 'string' ? row.campaign_status : null,
        dateStart: typeof row.date_start === 'string' ? row.date_start : null,
        dateStop: typeof row.date_stop === 'string' ? row.date_stop : null,
        impressions: Number(row.impressions) || 0,
        clicks: Number(row.clicks) || 0,
        ctr: Number.isFinite(Number(row.ctr)) ? Number(row.ctr) : null,
        spendAmount: Number(row.spend) || 0,
        spendCurrency: 'BRL',
        conversions,
        raw: row,
      });
    }

    nextUrl = payload.paging?.next ?? null;
  }

  return metrics;
};

const parseMetaFieldData = (fieldData: unknown[]) => {
  const values = new Map<string, string[]>();
  for (const field of fieldData) {
    if (!isRecord(field) || typeof field.name !== 'string' || !Array.isArray(field.values)) {
      continue;
    }
    values.set(
      field.name,
      field.values.map((value) => String(value)).filter(Boolean),
    );
  }

  const pick = (...keys: string[]) => {
    for (const key of keys) {
      const value = values.get(key)?.find(Boolean);
      if (value) {
        return value;
      }
    }
    return null;
  };

  return {
    fullName: pick('full_name', 'name', 'nome_completo'),
    email: pick('email', 'email_address'),
    phone: pick('phone_number', 'phone', 'telefone'),
  };
};

export const fetchMetaLeadAds = async (env: Env, formIds: string[]) => {
  const leads: MetaLeadRecord[] = [];

  for (const rawFormId of formIds) {
    const formId = rawFormId.trim();
    if (!formId) {
      continue;
    }

    let nextUrl: string | null = `${buildMetaGraphUrl(env, `${formId}/leads`)}?access_token=${encodeURIComponent(getMetaAccessToken(env))}&limit=500&fields=id,created_time,field_data,ad_id,ad_name,adset_id,campaign_id,platform`;
    while (nextUrl) {
      const response = await fetch(nextUrl);
      const payload = (await response.json().catch(() => ({}))) as MetaGraphPayload;
      if (!response.ok || payload.error) {
        throw new Error(payload.error?.message || `Falha ao buscar leads do formulario ${formId} na Meta.`);
      }

      for (const row of payload.data ?? []) {
        if (!isRecord(row) || typeof row.id !== 'string') {
          continue;
        }
        const parsedFields = parseMetaFieldData(Array.isArray(row.field_data) ? row.field_data : []);
        leads.push({
          id: row.id,
          createdTime: typeof row.created_time === 'string' ? row.created_time : null,
          formId,
          campaignId: typeof row.campaign_id === 'string' ? row.campaign_id : null,
          adsetId: typeof row.adset_id === 'string' ? row.adset_id : null,
          adId: typeof row.ad_id === 'string' ? row.ad_id : null,
          fullName: parsedFields.fullName,
          email: parsedFields.email,
          phone: parsedFields.phone,
          raw: row,
        });
      }

      nextUrl = payload.paging?.next ?? null;
    }
  }

  return leads;
};
