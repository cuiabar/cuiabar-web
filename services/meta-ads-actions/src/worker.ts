type Env = {
  META_GRAPH_API_VERSION?: string;
  META_ACCESS_TOKEN?: string;
  META_AD_ACCOUNT_ID?: string;
  META_ACTIONS_BEARER_TOKEN?: string;
};

const REQUIRED_ENV: Array<keyof Env> = ["META_ACCESS_TOKEN", "META_AD_ACCOUNT_ID", "META_ACTIONS_BEARER_TOKEN"];

const DEFAULT_FIELDS = {
  campaigns: "id,name,status,effective_status,objective,buying_type,created_time,updated_time,daily_budget,lifetime_budget",
  adsets:
    "id,name,status,effective_status,campaign_id,optimization_goal,billing_event,bid_strategy,daily_budget,lifetime_budget,start_time,end_time,created_time,updated_time",
  ads: "id,name,status,effective_status,campaign_id,adset_id,creative{id,name,object_story_spec},created_time,updated_time",
  creatives: "id,name,title,body,object_story_spec,thumbnail_url,effective_object_story_id"
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url);

      if (url.pathname === "/" || url.pathname === "/health") {
        return health(env);
      }

      if (url.pathname === "/openapi.json") {
        return json(openApiSchema(url.origin));
      }

      if (!url.pathname.startsWith("/actions/")) {
        return json({ error: "Not found" }, 404);
      }

      const authError = requireBearer(request, env);
      if (authError) {
        return authError;
      }

      const missing = REQUIRED_ENV.filter((key) => !env[key]);
      if (missing.length > 0) {
        return json({ error: "Meta Ads secrets ausentes.", missingSecrets: missing }, 503);
      }

      return handleAction(request, env);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro interno.";
      return json({ error: message }, 500);
    }
  }
};

async function handleAction(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const adAccountId = normalizeAdAccountId(url.searchParams.get("adAccountId") || env.META_AD_ACCOUNT_ID!);

  if (url.pathname === "/actions/health" && request.method === "GET") {
    return health(env);
  }

  if (url.pathname === "/actions/me" && request.method === "GET") {
    return json(await graph(env, "/me", { fields: "id,name" }));
  }

  if (url.pathname === "/actions/ad-accounts" && request.method === "GET") {
    return json(await graph(env, "/me/adaccounts", { fields: "id,name,account_status,currency,timezone_name", limit: limit(url, 50) }));
  }

  if (url.pathname === "/actions/campaigns" && request.method === "GET") {
    return json(
      await graph(env, `/${adAccountId}/campaigns`, {
        fields: DEFAULT_FIELDS.campaigns,
        effective_status: statusFilter(url),
        limit: limit(url, 100)
      })
    );
  }

  if (url.pathname === "/actions/adsets" && request.method === "GET") {
    return json(
      await graph(env, `/${adAccountId}/adsets`, {
        fields: DEFAULT_FIELDS.adsets,
        effective_status: statusFilter(url),
        limit: limit(url, 100)
      })
    );
  }

  if (url.pathname === "/actions/ads" && request.method === "GET") {
    return json(
      await graph(env, `/${adAccountId}/ads`, {
        fields: DEFAULT_FIELDS.ads,
        effective_status: statusFilter(url),
        limit: limit(url, 100)
      })
    );
  }

  if (url.pathname === "/actions/creatives" && request.method === "GET") {
    return json(
      await graph(env, `/${adAccountId}/adcreatives`, {
        fields: DEFAULT_FIELDS.creatives,
        limit: limit(url, 100)
      })
    );
  }

  if (url.pathname === "/actions/insights" && request.method === "GET") {
    const startDate = requiredDate(url.searchParams.get("startDate"), "startDate");
    const endDate = requiredDate(url.searchParams.get("endDate"), "endDate");
    const level = enumParam(url, "level", ["account", "campaign", "adset", "ad"], "campaign");
    const breakdowns = url.searchParams.get("breakdowns") || undefined;
    const fields =
      url.searchParams.get("fields") ||
      "account_id,account_name,campaign_id,campaign_name,adset_id,adset_name,ad_id,ad_name,impressions,reach,clicks,inline_link_clicks,spend,cpc,cpm,ctr,frequency,actions,action_values,purchase_roas";

    return json(
      await graph(env, `/${adAccountId}/insights`, {
        fields,
        level,
        time_range: JSON.stringify({ since: startDate, until: endDate }),
        breakdowns,
        limit: limit(url, 500)
      })
    );
  }

  return json({ error: "Not found" }, 404);
}

async function graph(env: Env, path: string, params: Record<string, string | number | undefined>): Promise<unknown> {
  const version = env.META_GRAPH_API_VERSION || "v25.0";
  const url = new URL(`https://graph.facebook.com/${version}${path}`);
  url.searchParams.set("access_token", env.META_ACCESS_TOKEN!);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url.toString(), { method: "GET" });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(`Meta Graph API ${response.status}: ${JSON.stringify(payload)}`);
  }

  return payload;
}

function health(env: Env): Response {
  const missing = REQUIRED_ENV.filter((key) => !env[key]);
  return json({
    ok: missing.length === 0,
    service: "meta-ads-actions",
    mode: "read-only",
    apiVersion: env.META_GRAPH_API_VERSION || "v25.0",
    endpoint: "https://meta-ads-actions.cuiabar.com/openapi.json",
    missingSecrets: missing
  });
}

function requireBearer(request: Request, env: Env): Response | null {
  if (!env.META_ACTIONS_BEARER_TOKEN) {
    return json({ error: "META_ACTIONS_BEARER_TOKEN ausente." }, 503);
  }

  if (request.headers.get("authorization") !== `Bearer ${env.META_ACTIONS_BEARER_TOKEN}`) {
    return json({ error: "Bearer token invalido." }, 401);
  }

  return null;
}

function normalizeAdAccountId(value: string): string {
  const digits = value.replace(/\D/g, "");
  return `act_${digits}`;
}

function limit(url: URL, fallback: number): number {
  const parsed = Number.parseInt(url.searchParams.get("limit") || "", 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.max(1, Math.min(500, parsed));
}

function statusFilter(url: URL): string | undefined {
  const raw = url.searchParams.get("effectiveStatus");
  if (!raw) {
    return undefined;
  }
  const values = raw
    .split(",")
    .map((value) => value.trim().toUpperCase())
    .filter(Boolean);
  return values.length > 0 ? JSON.stringify(values) : undefined;
}

function requiredDate(value: string | null, name: string): string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`Parametro ${name} deve estar no formato YYYY-MM-DD.`);
  }
  return value;
}

function enumParam(url: URL, name: string, allowed: string[], fallback: string): string {
  const value = url.searchParams.get(name) || fallback;
  if (!allowed.includes(value)) {
    throw new Error(`Parametro ${name} deve ser um de: ${allowed.join(", ")}.`);
  }
  return value;
}

function json(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

function openApiSchema(origin: string): Record<string, unknown> {
  const security = [{ bearerAuth: [] }];
  return {
    openapi: "3.1.0",
    info: {
      title: "Cuiabar Meta Ads Read-Only API",
      version: "0.1.0",
      description: "Read-only Meta Ads reporting API for a custom GPT. No write endpoints are exposed."
    },
    servers: [{ url: origin }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          description: "Use the private Meta Actions bearer token."
        }
      },
      schemas: {
        MetaGraphResponse: {
          type: "object",
          additionalProperties: true
        }
      }
    },
    paths: {
      "/actions/health": { get: { operationId: "checkMetaAdsApiHealth", summary: "Check Meta Ads API health", security, responses: { "200": { description: "Health status" } } } },
      "/actions/me": { get: { operationId: "getMetaCurrentUser", summary: "Get current Meta token user", security, responses: { "200": { description: "Current user" } } } },
      "/actions/ad-accounts": { get: { operationId: "listMetaAdAccounts", summary: "List accessible Meta ad accounts", security, responses: { "200": { description: "Ad accounts" } } } },
      "/actions/campaigns": {
        get: {
          operationId: "listMetaCampaigns",
          summary: "List Meta campaigns",
          security,
          parameters: commonListParams(),
          responses: { "200": { description: "Campaigns" } }
        }
      },
      "/actions/adsets": {
        get: {
          operationId: "listMetaAdSets",
          summary: "List Meta ad sets",
          security,
          parameters: commonListParams(),
          responses: { "200": { description: "Ad sets" } }
        }
      },
      "/actions/ads": {
        get: {
          operationId: "listMetaAds",
          summary: "List Meta ads",
          security,
          parameters: commonListParams(),
          responses: { "200": { description: "Ads" } }
        }
      },
      "/actions/creatives": {
        get: {
          operationId: "listMetaAdCreatives",
          summary: "List Meta ad creatives",
          security,
          parameters: [
            { name: "adAccountId", in: "query", required: false, schema: { type: "string" } },
            { name: "limit", in: "query", required: false, schema: { type: "integer", minimum: 1, maximum: 500, default: 100 } }
          ],
          responses: { "200": { description: "Creatives" } }
        }
      },
      "/actions/insights": {
        get: {
          operationId: "getMetaAdsInsights",
          summary: "Get Meta Ads insights by date range",
          security,
          parameters: [
            { name: "startDate", in: "query", required: true, schema: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" } },
            { name: "endDate", in: "query", required: true, schema: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" } },
            { name: "level", in: "query", required: false, schema: { type: "string", enum: ["account", "campaign", "adset", "ad"], default: "campaign" } },
            { name: "adAccountId", in: "query", required: false, schema: { type: "string" } },
            { name: "breakdowns", in: "query", required: false, schema: { type: "string", description: "Comma-separated Meta breakdowns, for example age,gender or publisher_platform." } },
            { name: "fields", in: "query", required: false, schema: { type: "string", description: "Optional comma-separated Insights fields." } },
            { name: "limit", in: "query", required: false, schema: { type: "integer", minimum: 1, maximum: 500, default: 500 } }
          ],
          responses: { "200": { description: "Insights rows" } }
        }
      }
    }
  };
}

function commonListParams(): Array<Record<string, unknown>> {
  return [
    { name: "adAccountId", in: "query", required: false, schema: { type: "string" } },
    { name: "effectiveStatus", in: "query", required: false, schema: { type: "string", description: "Comma-separated statuses such as ACTIVE,PAUSED." } },
    { name: "limit", in: "query", required: false, schema: { type: "integer", minimum: 1, maximum: 500, default: 100 } }
  ];
}
