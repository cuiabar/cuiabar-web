import type { Env } from '../../types';
import { getGoogleAdsAccessToken, isGoogleAdsConfigured } from './googleAdsAuth';

const DEFAULT_GOOGLE_ADS_API_VERSION = 'v20';

type SearchStreamBatch = {
  results?: Array<Record<string, unknown>>;
};

type GoogleAdsErrorPayload = {
  error?: {
    code?: number;
    message?: string;
    status?: string;
    details?: Array<{
      errors?: Array<{ message?: string }>;
    }>;
  };
};

export type GoogleAdsCustomerSummary = {
  id: string | null;
  descriptiveName: string | null;
  currencyCode: string | null;
  timeZone: string | null;
};

export type GoogleAdsCampaignMetric = {
  customerId: string;
  campaignId: string;
  campaignName: string | null;
  campaignStatus: string | null;
  metricDate: string;
  impressions: number;
  clicks: number;
  interactions: number;
  ctr: number | null;
  costMicros: number;
  conversions: number;
  raw: Record<string, unknown>;
};

export type GoogleAdsClickConversionInput = {
  customerId: string;
  conversionAction: string;
  conversionDateTime: string;
  conversionValue: number;
  currencyCode: string;
  gclid?: string | null;
  gbraid?: string | null;
  wbraid?: string | null;
  orderId?: string | null;
};

const stripCustomerId = (value: string | undefined | null) => (value || '').replace(/-/g, '').trim();

const getApiVersion = (env: Env) => (env.GOOGLE_ADS_API_VERSION?.trim() || DEFAULT_GOOGLE_ADS_API_VERSION).replace(/^\/+/, '');

const buildGoogleAdsUrl = (env: Env, path: string) => `https://googleads.googleapis.com/${getApiVersion(env)}${path.startsWith('/') ? path : `/${path}`}`;

const extractGoogleAdsError = (payload: GoogleAdsErrorPayload, fallback: string) => {
  const nestedMessages =
    payload.error?.details
      ?.flatMap((detail) => detail.errors ?? [])
      .map((detail) => detail.message)
      .filter(Boolean)
      .join(' | ') || null;

  return nestedMessages || payload.error?.message || fallback;
};

const googleAdsRequest = async <T>(env: Env, path: string, init?: RequestInit, customerContext?: string | null) => {
  if (!isGoogleAdsConfigured(env)) {
    throw new Error('Google Ads ainda nao esta configurado no ambiente.');
  }

  const accessToken = await getGoogleAdsAccessToken(env);
  const headers = new Headers(init?.headers);
  headers.set('authorization', `Bearer ${accessToken}`);
  headers.set('developer-token', env.GOOGLE_ADS_DEVELOPER_TOKEN?.trim() || '');
  headers.set('content-type', 'application/json');

  const loginCustomerId = stripCustomerId(env.GOOGLE_ADS_LOGIN_CUSTOMER_ID);
  const activeCustomerContext = stripCustomerId(customerContext);
  if (loginCustomerId && loginCustomerId !== activeCustomerContext) {
    headers.set('login-customer-id', loginCustomerId);
  }

  const response = await fetch(buildGoogleAdsUrl(env, path), {
    ...init,
    headers,
  });

  const payload = (await response.json().catch(() => ({}))) as T & GoogleAdsErrorPayload;
  if (!response.ok || payload.error) {
    throw new Error(extractGoogleAdsError(payload, `Google Ads API recusou a requisicao (${response.status}).`));
  }

  return payload;
};

const flattenSearchStream = (payload: SearchStreamBatch[] | SearchStreamBatch) => {
  const batches = Array.isArray(payload) ? payload : [payload];
  return batches.flatMap((batch) => batch.results ?? []);
};

const buildDateWindow = (days: number) => {
  const until = new Date();
  const since = new Date(until.getTime() - Math.max(days - 1, 0) * 24 * 60 * 60 * 1000);
  const toDate = (value: Date) => value.toISOString().slice(0, 10);
  return {
    since: toDate(since),
    until: toDate(until),
  };
};

export const listGoogleAdsAccessibleCustomers = async (env: Env) => {
  const payload = await googleAdsRequest<{ resourceNames?: string[] }>(env, '/customers:listAccessibleCustomers', {
    method: 'GET',
  });

  return payload.resourceNames ?? [];
};

export const getGoogleAdsCustomerSummary = async (env: Env, customerId = env.GOOGLE_ADS_CUSTOMER_ID || ''): Promise<GoogleAdsCustomerSummary> => {
  const targetCustomerId = stripCustomerId(customerId);
  const payload = await googleAdsRequest<SearchStreamBatch[]>(
    env,
    `/customers/${targetCustomerId}/googleAds:searchStream`,
    {
      method: 'POST',
      body: JSON.stringify({
        query: 'SELECT customer.id, customer.descriptive_name, customer.currency_code, customer.time_zone FROM customer LIMIT 1',
      }),
    },
    targetCustomerId,
  );

  const [row] = flattenSearchStream(payload);
  const customer = (row?.customer ?? {}) as Record<string, unknown>;

  return {
    id: typeof customer.id === 'string' || typeof customer.id === 'number' ? String(customer.id) : targetCustomerId || null,
    descriptiveName: typeof customer.descriptiveName === 'string' ? customer.descriptiveName : typeof customer.descriptive_name === 'string' ? customer.descriptive_name : null,
    currencyCode: typeof customer.currencyCode === 'string' ? customer.currencyCode : typeof customer.currency_code === 'string' ? customer.currency_code : null,
    timeZone: typeof customer.timeZone === 'string' ? customer.timeZone : typeof customer.time_zone === 'string' ? customer.time_zone : null,
  };
};

export const fetchGoogleAdsCampaignMetrics = async (env: Env, customerId = env.GOOGLE_ADS_CUSTOMER_ID || '', lookbackDays = 30) => {
  const targetCustomerId = stripCustomerId(customerId);
  const { since, until } = buildDateWindow(lookbackDays);
  const payload = await googleAdsRequest<SearchStreamBatch[]>(
    env,
    `/customers/${targetCustomerId}/googleAds:searchStream`,
    {
      method: 'POST',
      body: JSON.stringify({
        query: `
          SELECT
            campaign.id,
            campaign.name,
            campaign.status,
            segments.date,
            metrics.impressions,
            metrics.clicks,
            metrics.interactions,
            metrics.ctr,
            metrics.cost_micros,
            metrics.conversions
          FROM campaign
          WHERE segments.date BETWEEN '${since}' AND '${until}'
          ORDER BY segments.date DESC
        `,
      }),
    },
    targetCustomerId,
  );

  return flattenSearchStream(payload)
    .filter((row) => row.campaign && row.segments && row.metrics)
    .map((row) => {
      const campaign = (row.campaign ?? {}) as Record<string, unknown>;
      const metrics = (row.metrics ?? {}) as Record<string, unknown>;
      const segments = (row.segments ?? {}) as Record<string, unknown>;

      return {
        customerId: targetCustomerId,
        campaignId: typeof campaign.id === 'string' || typeof campaign.id === 'number' ? String(campaign.id) : '',
        campaignName: typeof campaign.name === 'string' ? campaign.name : null,
        campaignStatus: typeof campaign.status === 'string' ? campaign.status : null,
        metricDate: typeof segments.date === 'string' ? segments.date : until,
        impressions: Number(metrics.impressions) || 0,
        clicks: Number(metrics.clicks) || 0,
        interactions: Number(metrics.interactions) || 0,
        ctr: Number.isFinite(Number(metrics.ctr)) ? Number(metrics.ctr) : null,
        costMicros: Number(metrics.costMicros ?? metrics.cost_micros) || 0,
        conversions: Number(metrics.conversions) || 0,
        raw: row,
      } satisfies GoogleAdsCampaignMetric;
    })
    .filter((row) => row.campaignId);
};

export const uploadGoogleAdsClickConversion = async (env: Env, input: GoogleAdsClickConversionInput) => {
  const customerId = stripCustomerId(input.customerId);
  const payload = await googleAdsRequest<{
    results?: Array<Record<string, unknown>>;
    partialFailureError?: Record<string, unknown>;
  }>(
    env,
    `/customers/${customerId}:uploadClickConversions`,
    {
      method: 'POST',
      body: JSON.stringify({
        conversions: [
          {
            conversionAction: input.conversionAction,
            conversionDateTime: input.conversionDateTime,
            conversionValue: input.conversionValue,
            currencyCode: input.currencyCode,
            gclid: input.gclid || undefined,
            gbraid: input.gbraid || undefined,
            wbraid: input.wbraid || undefined,
            orderId: input.orderId || undefined,
          },
        ],
        partialFailure: true,
      }),
    },
    customerId,
  );

  return {
    success: true,
    results: payload.results ?? [],
    partialFailureError: payload.partialFailureError ?? null,
  };
};
