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

      return await handleAction(request, env);
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

  if (url.pathname === "/actions/create-traffic-ad-bundle" && request.method === "POST") {
    const body = await readJson(request);
    return json(await createTrafficAdBundle(env, adAccountId, body));
  }

  if (url.pathname === "/actions/meta-graph-request" && request.method === "POST") {
    const body = await readJson(request);
    return json(await metaGraphRequest(env, body));
  }

  if (url.pathname === "/actions/meta-graph-request-v2" && request.method === "POST") {
    const body = await readJson(request);
    return json(await metaGraphRequest(env, expandV2JsonFields(body)));
  }

  if (url.pathname === "/actions/batch-graph-request" && request.method === "POST") {
    const body = await readJson(request);
    return json(await batchGraphRequest(env, body));
  }

  if (url.pathname === "/actions/create-full-meta-campaign" && request.method === "POST") {
    const body = await readJson(request);
    return json(await createFullMetaCampaign(env, body));
  }

  if (url.pathname === "/actions/create-full-meta-campaign-v2" && request.method === "POST") {
    const body = await readJson(request);
    return json(await createFullMetaCampaign(env, expandV2JsonFields(body)));
  }

  if (url.pathname === "/actions/create-ad-in-adset" && request.method === "POST") {
    const body = await readJson(request);
    return json(await createAdInAdSet(env, body));
  }

  if (url.pathname === "/actions/ad-pixels" && request.method === "GET") {
    return json(await graph(env, `/${adAccountId}/adspixels`, { fields: "id,name,code,last_fired_time,is_unavailable", limit: limit(url, 100) }));
  }

  if (url.pathname === "/actions/upload-ad-image" && request.method === "POST") {
    const body = await readJson(request);
    return json(
      await graphPost(env, `/${adAccountId}/adimages`, {
        name: optionalString(body.name, 120),
        url: requiredHttpsUrl(body.imageUrl, "imageUrl")
      })
    );
  }

  if (url.pathname === "/actions/upload-ad-video" && request.method === "POST") {
    const body = await readJson(request);
    return json(
      await graphPost(env, `/${adAccountId}/advideos`, {
        title: optionalString(body.title, 120),
        description: optionalString(body.description, 500),
        file_url: requiredHttpsUrl(body.videoUrl, "videoUrl")
      })
    );
  }

  if (url.pathname === "/actions/targeting-search" && request.method === "GET") {
    return json(
      await graph(env, `/${adAccountId}/targetingsearch`, {
        q: url.searchParams.get("q") || undefined,
        type: url.searchParams.get("type") || undefined,
        class: url.searchParams.get("class") || undefined,
        limit: limit(url, 100)
      })
    );
  }

  if (url.pathname === "/actions/resolve-geo-location" && request.method === "GET") {
    return json(
      await graph(env, `/${adAccountId}/targetingsearch`, {
        q: url.searchParams.get("query") || undefined,
        type: "adgeolocation",
        country_code: url.searchParams.get("countryCode") || undefined,
        limit: limit(url, 25)
      })
    );
  }

  return json({ error: "Not found" }, 404);
}

async function graph(env: Env, path: string, params: Record<string, unknown>): Promise<unknown> {
  const version = env.META_GRAPH_API_VERSION || "v25.0";
  const url = new URL(`https://graph.facebook.com/${version}${path}`);
  url.searchParams.set("access_token", env.META_ACCESS_TOKEN!);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, graphParamValue(value));
    }
  }

  const response = await fetch(url.toString(), { method: "GET" });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(`Meta Graph API ${response.status}: ${JSON.stringify(payload)}`);
  }

  return payload;
}

async function graphPost(env: Env, path: string, params: Record<string, unknown>): Promise<Record<string, unknown>> {
  const version = env.META_GRAPH_API_VERSION || "v25.0";
  const url = new URL(`https://graph.facebook.com/${version}${path}`);
  const body = new URLSearchParams();
  body.set("access_token", env.META_ACCESS_TOKEN!);

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }
    body.set(key, graphParamValue(value));
  }

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body
  });
  const payload = (await response.json()) as Record<string, unknown>;

  if (!response.ok) {
    throw new Error(`Meta Graph API ${response.status}: ${JSON.stringify(payload)}`);
  }

  return payload;
}

async function graphDelete(env: Env, path: string, params: Record<string, unknown>): Promise<Record<string, unknown>> {
  const version = env.META_GRAPH_API_VERSION || "v25.0";
  const url = new URL(`https://graph.facebook.com/${version}${path}`);
  url.searchParams.set("access_token", env.META_ACCESS_TOKEN!);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, graphParamValue(value));
    }
  }

  const response = await fetch(url.toString(), { method: "DELETE" });
  const payload = (await response.json()) as Record<string, unknown>;

  if (!response.ok) {
    throw new Error(`Meta Graph API ${response.status}: ${JSON.stringify(payload)}`);
  }

  return payload;
}

function graphParamValue(value: unknown): string {
  return typeof value === "string" ? value : JSON.stringify(value);
}

async function metaGraphRequest(env: Env, body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const method = optionalEnum(body.method, "method", ["GET", "POST", "DELETE"], "GET");
  const path = normalizeGraphPath(requiredString(body.path, "path", 300));
  const apiVersion = optionalString(body.apiVersion, 20) ?? env.META_GRAPH_API_VERSION ?? "v25.0";
  const query = optionalObject(body.query, "query") ?? {};
  const requestBody = optionalObject(body.body, "body") ?? {};
  const validateOnly = body.validateOnly !== false;
  const idempotencyKey = optionalString(body.idempotencyKey, 120);
  const audit = await auditPayload(method, path, query, requestBody, validateOnly, idempotencyKey);

  if (method !== "GET" && validateOnly) {
    return {
      ok: true,
      mode: "validate-only",
      request: { method, path, apiVersion, query, body: requestBody },
      audit
    };
  }

  const previousVersion = env.META_GRAPH_API_VERSION;
  const requestEnv = { ...env, META_GRAPH_API_VERSION: apiVersion };

  const response =
    method === "GET"
      ? await graph(requestEnv, path, query)
      : method === "POST"
        ? await graphPost(requestEnv, path, { ...query, ...requestBody })
        : await graphDelete(requestEnv, path, { ...query, ...requestBody });

  return {
    ok: true,
    mode: method === "GET" ? "read" : "written",
    audit: { ...audit, apiVersion, previousVersion },
    response
  };
}

async function batchGraphRequest(env: Env, body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const requests = optionalObjectArray(body.requests, "requests", 50) ?? [];
  const validateOnly = body.validateOnly !== false;
  const hasWrite = requests.some((request) => String(request.method ?? "GET").toUpperCase() !== "GET");

  if (hasWrite && validateOnly) {
    return { ok: true, mode: "validate-only", requests };
  }

  const batch = requests.map((request) => {
    const method = String(request.method ?? "GET").toUpperCase();
    const relativeUrl = requiredString(request.relative_url, "relative_url", 500).replace(/^\//, "");
    const item: Record<string, unknown> = {
      method,
      relative_url: relativeUrl,
      ...(typeof request.name === "string" ? { name: request.name } : {}),
      ...(typeof request.depends_on === "string" ? { depends_on: request.depends_on } : {})
    };
    if (request.body && typeof request.body === "object") {
      item.body = new URLSearchParams(flattenGraphBody(request.body as Record<string, unknown>)).toString();
    }
    return item;
  });

  return {
    ok: true,
    mode: hasWrite ? "written" : "read",
    response: await graphPost(env, "/", { batch })
  };
}

async function createFullMetaCampaign(env: Env, body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const adAccountId = normalizeAdAccountId(String(body.adAccountId ?? env.META_AD_ACCOUNT_ID!));
  const validateOnly = body.validateOnly !== false;
  const campaign = optionalObject(body.campaign, "campaign") ?? {};
  const adsets = optionalObjectArray(body.adsets, "adsets", 50) ?? [];

  const plan = { adAccountId, campaign, adsets };
  if (validateOnly) {
    return { ok: true, mode: "validate-only", plan };
  }

  let campaignResponse: Record<string, unknown>;
  let campaignId: string;
  try {
    campaignResponse = await graphPost(env, `/${adAccountId}/campaigns`, campaign);
    campaignId = requiredCreatedId(campaignResponse, "campaign");
  } catch (error) {
    return metaWriteError("campaign", error);
  }

  const adsetResponses = [];
  for (const [adsetIndex, adsetBundle] of adsets.entries()) {
    const adset = optionalObject(adsetBundle.adset, "adset") ?? {};
    const ads = optionalObjectArray(adsetBundle.ads, "ads", 50) ?? [];
    let adsetResponse: Record<string, unknown>;
    let adsetId: string;
    try {
      adsetResponse = await graphPost(env, `/${adAccountId}/adsets`, { ...adset, campaign_id: campaignId });
      adsetId = requiredCreatedId(adsetResponse, "adset");
    } catch (error) {
      return { ...metaWriteError(`adset_${adsetIndex + 1}`, error), campaign: campaignResponse, adsets: adsetResponses };
    }

    const adResponses = [];
    for (const [adIndex, adBundle] of ads.entries()) {
      const creativePayload = optionalObject(adBundle.creative, "creative") ?? {};
      const adPayload = optionalObject(adBundle.ad, "ad") ?? {};
      try {
        const creative = await graphPost(env, `/${adAccountId}/adcreatives`, creativePayload);
        const creativeId = requiredCreatedId(creative, "creative");
        const ad = await graphPost(env, `/${adAccountId}/ads`, {
          ...adPayload,
          adset_id: adsetId,
          creative: { creative_id: creativeId }
        });
        adResponses.push({ creative, ad });
      } catch (error) {
        return {
          ...metaWriteError(`adset_${adsetIndex + 1}_ad_${adIndex + 1}`, error),
          campaign: campaignResponse,
          adsets: [...adsetResponses, { adset: adsetResponse, ads: adResponses }]
        };
      }
    }
    adsetResponses.push({ adset: adsetResponse, ads: adResponses });
  }

  return { ok: true, mode: "created", adAccountId, campaign: campaignResponse, adsets: adsetResponses };
}

async function createTrafficAdBundle(
  env: Env,
  adAccountId: string,
  body: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const validateOnly = body.validateOnly !== false;
  const input = normalizeTrafficAdBundleInput(body);
  const plan = buildTrafficAdBundlePlan(input);

  if (validateOnly) {
    return {
      ok: true,
      mode: "validate-only",
      message: "Pacote preparado sem chamada de escrita para a Meta.",
      adAccountId,
      plan
    };
  }

  let campaign: Record<string, unknown>;
  let campaignId: string;
  try {
    campaign = await graphPost(env, `/${adAccountId}/campaigns`, plan.campaign);
    campaignId = requiredCreatedId(campaign, "campaign");
  } catch (error) {
    return metaWriteError("campaign", error);
  }

  let adSet: Record<string, unknown>;
  let adSetId: string;
  try {
    adSet = await graphPost(env, `/${adAccountId}/adsets`, {
      ...plan.adSet,
      campaign_id: campaignId
    });
    adSetId = requiredCreatedId(adSet, "adset");
  } catch (error) {
    return { ...metaWriteError("adset", error), campaign };
  }

  const ads = [];
  for (const [index, plannedAd] of plan.ads.entries()) {
    try {
      const creative = await graphPost(env, `/${adAccountId}/adcreatives`, plannedAd.creative);
      const creativeId = requiredCreatedId(creative, "creative");
      const ad = await graphPost(env, `/${adAccountId}/ads`, {
        ...plannedAd.ad,
        adset_id: adSetId,
        creative: { creative_id: creativeId }
      });
      ads.push({ creative, ad });
    } catch (error) {
      return { ...metaWriteError(`ad_${index + 1}`, error), campaign, adSet, ads };
    }
  }

  return {
    ok: true,
    mode: "created",
    adAccountId,
    campaign,
    adSet,
    ads
  };
}

function metaWriteError(step: string, error: unknown): Record<string, unknown> {
  return {
    ok: false,
    step,
    error: error instanceof Error ? error.message : String(error)
  };
}

async function createAdInAdSet(env: Env, body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const validateOnly = body.validateOnly !== false;
  const adSetId = requiredString(body.adSetId, "adSetId", 80);
  const common = normalizeCommonCreativeInput(body);
  const spec = normalizeAdSpec(body, common, 1);
  const plan = {
    creative: buildCreativePayload(spec, common),
    ad: {
      name: spec.adName,
      status: spec.adStatus
    }
  };

  if (validateOnly) {
    return { ok: true, mode: "validate-only", message: "Anuncio preparado sem chamada de escrita para a Meta.", adSetId, plan };
  }

  const adAccountId = normalizeAdAccountId(String(body.adAccountId ?? env.META_AD_ACCOUNT_ID!));
  let creative: Record<string, unknown>;
  let creativeId: string;
  try {
    creative = await graphPost(env, `/${adAccountId}/adcreatives`, plan.creative);
    creativeId = requiredCreatedId(creative, "creative");
  } catch (error) {
    return metaWriteError("creative", error);
  }

  let ad: Record<string, unknown>;
  try {
    ad = await graphPost(env, `/${adAccountId}/ads`, {
      ...plan.ad,
      adset_id: adSetId,
      creative: { creative_id: creativeId }
    });
  } catch (error) {
    return { ...metaWriteError("ad", error), creative };
  }

  return { ok: true, mode: "created", adSetId, creative, ad };
}

type TrafficAdBundleInput = CommonCreativeInput & {
  campaignName: string;
  adSetName: string;
  dailyBudgetCents?: number;
  lifetimeBudgetCents?: number;
  countries: string[];
  customLocations?: Array<Record<string, unknown>>;
  cityKeys?: string[];
  ageMin?: number;
  ageMax?: number;
  genders?: number[];
  publisherPlatforms?: string[];
  facebookPositions?: string[];
  instagramPositions?: string[];
  devicePlatforms?: string[];
  audienceNetworkPositions?: string[];
  messengerPositions?: string[];
  startTime?: string;
  endTime?: string;
  adSetSchedule?: Array<Record<string, unknown>>;
  optimizationGoal: string;
  billingEvent: string;
  bidStrategy: string;
  campaignStatus: "PAUSED" | "ACTIVE";
  adSetStatus: "PAUSED" | "ACTIVE";
  targetingOverrides?: Record<string, unknown>;
  campaignOverrides?: Record<string, unknown>;
  adSetOverrides?: Record<string, unknown>;
  ads: AdSpec[];
};

type CommonCreativeInput = {
  pageId: string;
  linkUrl: string;
  callToActionType: string;
};

type AdSpec = {
  adName: string;
  creativeName: string;
  message: string;
  headline?: string;
  description?: string;
  imageUrl?: string;
  imageHash?: string;
  videoId?: string;
  thumbnailUrl?: string;
  linkUrl: string;
  pageId: string;
  callToActionType: string;
  adStatus: "PAUSED" | "ACTIVE";
};

function normalizeTrafficAdBundleInput(body: Record<string, unknown>): TrafficAdBundleInput {
  const common = normalizeCommonCreativeInput(body);
  const adsInput = Array.isArray(body.ads) && body.ads.length > 0 ? body.ads : [body];
  const dailyBudget = body.dailyBudgetCents === undefined ? undefined : requiredInteger(body.dailyBudgetCents, "dailyBudgetCents", 100, 100_000_000);
  const lifetimeBudget = body.lifetimeBudgetCents === undefined ? undefined : requiredInteger(body.lifetimeBudgetCents, "lifetimeBudgetCents", 100, 100_000_000);

  if (!dailyBudget && !lifetimeBudget) {
    throw new Error("Informe dailyBudgetCents ou lifetimeBudgetCents.");
  }

  return {
    ...common,
    campaignName: requiredString(body.campaignName, "campaignName", 120),
    adSetName: requiredString(body.adSetName, "adSetName", 120),
    dailyBudgetCents: dailyBudget,
    lifetimeBudgetCents: lifetimeBudget,
    countries: body.countries === undefined ? ["BR"] : requiredCountries(body.countries),
    customLocations: optionalCustomLocations(body.customLocations),
    cityKeys: optionalStringArray(body.cityKeys, "cityKeys", 50, 40),
    ageMin: optionalInteger(body.ageMin, "ageMin", 13, 65),
    ageMax: optionalInteger(body.ageMax, "ageMax", 13, 65),
    genders: optionalGenderArray(body.genders),
    publisherPlatforms: optionalStringArray(body.publisherPlatforms, "publisherPlatforms", 10, 40),
    facebookPositions: optionalStringArray(body.facebookPositions, "facebookPositions", 20, 60),
    instagramPositions: optionalStringArray(body.instagramPositions, "instagramPositions", 20, 60),
    devicePlatforms: optionalStringArray(body.devicePlatforms, "devicePlatforms", 10, 40),
    audienceNetworkPositions: optionalStringArray(body.audienceNetworkPositions, "audienceNetworkPositions", 20, 60),
    messengerPositions: optionalStringArray(body.messengerPositions, "messengerPositions", 20, 60),
    startTime: optionalIsoDateTime(body.startTime, "startTime"),
    endTime: optionalIsoDateTime(body.endTime, "endTime"),
    adSetSchedule: optionalObjectArray(body.adSetSchedule, "adSetSchedule", 50),
    optimizationGoal: optionalEnum(body.optimizationGoal, "optimizationGoal", [
      "LANDING_PAGE_VIEWS",
      "LINK_CLICKS",
      "REACH",
      "IMPRESSIONS",
      "OFFSITE_CONVERSIONS"
    ], "LINK_CLICKS"),
    billingEvent: optionalEnum(body.billingEvent, "billingEvent", ["IMPRESSIONS", "LINK_CLICKS"], "IMPRESSIONS"),
    bidStrategy: optionalEnum(body.bidStrategy, "bidStrategy", ["LOWEST_COST_WITHOUT_CAP", "LOWEST_COST_WITH_BID_CAP", "COST_CAP"], "LOWEST_COST_WITHOUT_CAP"),
    campaignStatus: body.campaignStatus === "ACTIVE" ? "ACTIVE" : "PAUSED",
    adSetStatus: body.adSetStatus === "ACTIVE" ? "ACTIVE" : "PAUSED",
    targetingOverrides: optionalObject(body.targetingOverrides, "targetingOverrides"),
    campaignOverrides: optionalObject(body.campaignOverrides, "campaignOverrides"),
    adSetOverrides: optionalObject(body.adSetOverrides, "adSetOverrides"),
    ads: adsInput.map((item, index) => normalizeAdSpec(item, common, index + 1))
  };
}

function normalizeCommonCreativeInput(body: Record<string, unknown>): CommonCreativeInput {
  return {
    pageId: requiredString(body.pageId, "pageId", 32).replace(/\D/g, ""),
    linkUrl: requiredHttpsUrl(body.linkUrl, "linkUrl"),
    callToActionType: optionalEnum(body.callToActionType, "callToActionType", [
      "LEARN_MORE",
      "ORDER_NOW",
      "SHOP_NOW",
      "SIGN_UP",
      "CONTACT_US",
      "BOOK_NOW",
      "GET_OFFER"
    ], "LEARN_MORE")
  };
}

function normalizeAdSpec(value: unknown, common: CommonCreativeInput, index: number): AdSpec {
  if (!value || typeof value !== "object") {
    throw new Error("Cada item de ads deve ser um objeto.");
  }
  const body = value as Record<string, unknown>;
  return {
    adName: requiredString(body.adName ?? `Anuncio ${index}`, "adName", 120),
    creativeName: requiredString(body.creativeName ?? body.adName ?? `Criativo ${index}`, "creativeName", 120),
    message: requiredString(body.message, "message", 500),
    headline: optionalString(body.headline, 80),
    description: optionalString(body.description, 120),
    imageUrl: optionalHttpsUrl(body.imageUrl, "imageUrl"),
    imageHash: optionalString(body.imageHash, 120),
    videoId: optionalString(body.videoId, 80),
    thumbnailUrl: optionalHttpsUrl(body.thumbnailUrl, "thumbnailUrl"),
    linkUrl: body.linkUrl ? requiredHttpsUrl(body.linkUrl, "linkUrl") : common.linkUrl,
    pageId: body.pageId ? requiredString(body.pageId, "pageId", 32).replace(/\D/g, "") : common.pageId,
    callToActionType: body.callToActionType
      ? optionalEnum(body.callToActionType, "callToActionType", ["LEARN_MORE", "ORDER_NOW", "SHOP_NOW", "SIGN_UP", "CONTACT_US", "BOOK_NOW", "GET_OFFER"], common.callToActionType)
      : common.callToActionType,
    adStatus: body.adStatus === "ACTIVE" ? "ACTIVE" : "PAUSED"
  };
}

function buildTrafficAdBundlePlan(input: TrafficAdBundleInput): { campaign: Record<string, unknown>; adSet: Record<string, unknown>; ads: Array<{ creative: Record<string, unknown>; ad: Record<string, unknown> }> } {
  const targeting: Record<string, unknown> = {
    geo_locations: buildGeoLocations(input),
    ...(input.ageMin ? { age_min: input.ageMin } : {}),
    ...(input.ageMax ? { age_max: input.ageMax } : {}),
    ...(input.genders ? { genders: input.genders } : {}),
    ...placementTargeting(input),
    ...(input.targetingOverrides ?? {})
  };

  return {
    campaign: {
      name: input.campaignName,
      objective: "OUTCOME_TRAFFIC",
      status: input.campaignStatus,
      special_ad_categories: [],
      buying_type: "AUCTION",
      is_adset_budget_sharing_enabled: false,
      ...(input.campaignOverrides ?? {})
    },
    adSet: {
      name: input.adSetName,
      ...(input.dailyBudgetCents ? { daily_budget: input.dailyBudgetCents } : {}),
      ...(input.lifetimeBudgetCents ? { lifetime_budget: input.lifetimeBudgetCents } : {}),
      billing_event: input.billingEvent,
      optimization_goal: input.optimizationGoal,
      bid_strategy: input.bidStrategy,
      targeting,
      status: input.adSetStatus,
      ...(input.startTime ? { start_time: input.startTime } : {}),
      ...(input.endTime ? { end_time: input.endTime } : {}),
      ...(input.adSetSchedule ? { adset_schedule: input.adSetSchedule } : {}),
      ...(input.adSetOverrides ?? {})
    },
    ads: input.ads.map((ad) => ({
      creative: buildCreativePayload(ad, input),
      ad: {
        name: ad.adName,
        status: ad.adStatus
      }
    }))
  };
}

function buildGeoLocations(input: TrafficAdBundleInput): Record<string, unknown> {
  return {
    ...(input.countries.length > 0 ? { countries: input.countries } : {}),
    ...(input.customLocations ? { custom_locations: input.customLocations } : {}),
    ...(input.cityKeys ? { cities: input.cityKeys.map((key) => ({ key })) } : {})
  };
}

function placementTargeting(input: TrafficAdBundleInput): Record<string, unknown> {
  return {
    ...(input.publisherPlatforms ? { publisher_platforms: input.publisherPlatforms } : {}),
    ...(input.facebookPositions ? { facebook_positions: input.facebookPositions } : {}),
    ...(input.instagramPositions ? { instagram_positions: input.instagramPositions } : {}),
    ...(input.devicePlatforms ? { device_platforms: input.devicePlatforms } : {}),
    ...(input.audienceNetworkPositions ? { audience_network_positions: input.audienceNetworkPositions } : {}),
    ...(input.messengerPositions ? { messenger_positions: input.messengerPositions } : {})
  };
}

function buildCreativePayload(ad: AdSpec, common: CommonCreativeInput): Record<string, unknown> {
  const callToAction = {
    type: ad.callToActionType,
    value: { link: ad.linkUrl }
  };

  const storyData: Record<string, unknown> = ad.videoId
    ? {
        video_data: {
          video_id: ad.videoId,
          message: ad.message,
          ...(ad.headline ? { title: ad.headline } : {}),
          ...(ad.thumbnailUrl ? { image_url: ad.thumbnailUrl } : {}),
          call_to_action: callToAction
        }
      }
    : {
        link_data: {
          link: ad.linkUrl,
          message: ad.message,
          ...(ad.headline ? { name: ad.headline } : {}),
          ...(ad.description ? { description: ad.description } : {}),
          ...(ad.imageHash ? { image_hash: ad.imageHash } : {}),
          ...(ad.imageUrl ? { picture: ad.imageUrl } : {}),
          call_to_action: callToAction
        }
      };

  return {
    name: ad.creativeName,
    object_story_spec: {
      page_id: ad.pageId || common.pageId,
      ...storyData
    }
  };
}

function health(env: Env): Response {
  const missing = REQUIRED_ENV.filter((key) => !env[key]);
  return json({
    ok: missing.length === 0,
    service: "meta-ads-actions",
    mode: "read-write-controlled",
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

function normalizeGraphPath(path: string): string {
  if (/^https?:\/\//i.test(path) || path.includes("..")) {
    throw new Error("Path Graph invalido.");
  }
  return path.startsWith("/") ? path : `/${path}`;
}

async function auditPayload(
  method: string,
  path: string,
  query: Record<string, unknown>,
  body: Record<string, unknown>,
  validateOnly: boolean,
  idempotencyKey?: string
): Promise<Record<string, unknown>> {
  const payload = JSON.stringify({ method, path, query, body, validateOnly, idempotencyKey });
  const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(payload));
  const hash = Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return {
    timestamp: new Date().toISOString(),
    endpoint: path,
    method,
    payload_hash: hash,
    validate_only: validateOnly,
    idempotency_key: idempotencyKey
  };
}

function flattenGraphBody(body: Record<string, unknown>): Record<string, string> {
  const flat: Record<string, string> = {};
  for (const [key, value] of Object.entries(body)) {
    if (value !== undefined && value !== null && value !== "") {
      flat[key] = graphParamValue(value);
    }
  }
  return flat;
}

function expandV2JsonFields(body: Record<string, unknown>): Record<string, unknown> {
  return {
    ...body,
    query: body.query ?? parseJsonObjectField(body.queryJson, "queryJson"),
    body: body.body ?? parseJsonObjectField(body.bodyJson, "bodyJson"),
    campaign: body.campaign ?? parseJsonObjectField(body.campaignJson, "campaignJson"),
    adsets: body.adsets ?? parseJsonArrayField(body.adsetsJson, "adsetsJson")
  };
}

function parseJsonObjectField(value: unknown, name: string): Record<string, unknown> | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  if (typeof value !== "string") {
    throw new Error(`${name} deve ser string JSON.`);
  }
  const parsed = JSON.parse(value) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`${name} deve representar um objeto JSON.`);
  }
  return parsed as Record<string, unknown>;
}

function parseJsonArrayField(value: unknown, name: string): Array<Record<string, unknown>> | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  if (typeof value !== "string") {
    throw new Error(`${name} deve ser string JSON.`);
  }
  const parsed = JSON.parse(value) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error(`${name} deve representar um array JSON.`);
  }
  return parsed.map((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new Error(`Cada item de ${name} deve ser um objeto.`);
    }
    return item as Record<string, unknown>;
  });
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

async function readJson(request: Request): Promise<Record<string, unknown>> {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function requiredCreatedId(payload: Record<string, unknown>, label: string): string {
  if (typeof payload.id !== "string" || payload.id.length === 0) {
    throw new Error(`Resposta da Meta sem id para ${label}: ${JSON.stringify(payload)}`);
  }
  return payload.id;
}

function requiredString(value: unknown, name: string, maxLength: number): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Parametro ${name} e obrigatorio.`);
  }
  const text = value.trim();
  if (text.length > maxLength) {
    throw new Error(`Parametro ${name} deve ter no maximo ${maxLength} caracteres.`);
  }
  return text;
}

function optionalString(value: unknown, maxLength: number): string | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  const text = requiredString(value, "description", maxLength);
  return text;
}

function requiredInteger(value: unknown, name: string, min: number, max: number): number {
  const parsed = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw new Error(`Parametro ${name} deve ser inteiro entre ${min} e ${max}.`);
  }
  return parsed;
}

function optionalInteger(value: unknown, name: string, min: number, max: number): number | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  return requiredInteger(value, name, min, max);
}

function requiredHttpsUrl(value: unknown, name: string): string {
  const url = requiredString(value, name, 2048);
  if (!url.startsWith("https://")) {
    throw new Error(`Parametro ${name} deve usar HTTPS.`);
  }
  new URL(url);
  return url;
}

function optionalHttpsUrl(value: unknown, name: string): string | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  return requiredHttpsUrl(value, name);
}

function requiredCountries(value: unknown): string[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > 25) {
    throw new Error("Parametro countries deve ter entre 1 e 25 paises ISO 3166-1 alpha-2.");
  }
  return value.map((item) => {
    const country = requiredString(item, "countries", 2).toUpperCase();
    if (!/^[A-Z]{2}$/.test(country)) {
      throw new Error("Cada country deve usar ISO 3166-1 alpha-2, como BR.");
    }
    return country;
  });
}

function optionalStringArray(value: unknown, name: string, maxItems: number, maxLength: number): string[] | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (!Array.isArray(value) || value.length === 0 || value.length > maxItems) {
    throw new Error(`Parametro ${name} deve ter entre 1 e ${maxItems} itens.`);
  }
  return value.map((item) => requiredString(item, name, maxLength));
}

function optionalGenderArray(value: unknown): number[] | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (!Array.isArray(value) || value.length === 0 || value.length > 2) {
    throw new Error("Parametro genders deve ser [1], [2] ou [1,2].");
  }
  return value.map((item) => {
    const gender = requiredInteger(item, "genders", 1, 2);
    return gender;
  });
}

function optionalObject(value: unknown, name: string): Record<string, unknown> | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Parametro ${name} deve ser um objeto.`);
  }
  return value as Record<string, unknown>;
}

function optionalObjectArray(value: unknown, name: string, maxItems: number): Array<Record<string, unknown>> | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (!Array.isArray(value) || value.length === 0 || value.length > maxItems) {
    throw new Error(`Parametro ${name} deve ter entre 1 e ${maxItems} objetos.`);
  }
  return value.map((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new Error(`Cada item de ${name} deve ser um objeto.`);
    }
    return item as Record<string, unknown>;
  });
}

function optionalCustomLocations(value: unknown): Array<Record<string, unknown>> | undefined {
  const locations = optionalObjectArray(value, "customLocations", 25);
  if (!locations) {
    return undefined;
  }
  return locations.map((location) => ({
    latitude: requiredNumber(location.latitude, "customLocations.latitude", -90, 90),
    longitude: requiredNumber(location.longitude, "customLocations.longitude", -180, 180),
    radius: requiredInteger(location.radius, "customLocations.radius", 1, 80),
    distance_unit: typeof location.distance_unit === "string" ? location.distance_unit : "kilometer"
  }));
}

function requiredNumber(value: unknown, name: string, min: number, max: number): number {
  const parsed = typeof value === "number" ? value : Number.parseFloat(String(value ?? ""));
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    throw new Error(`Parametro ${name} deve ser numero entre ${min} e ${max}.`);
  }
  return parsed;
}

function optionalIsoDateTime(value: unknown, name: string): string | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  const text = requiredString(value, name, 40);
  if (Number.isNaN(Date.parse(text))) {
    throw new Error(`Parametro ${name} deve ser uma data ISO valida.`);
  }
  return text;
}

function optionalEnum(value: unknown, name: string, allowed: string[], fallback: string): string {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }
  const text = String(value);
  if (!allowed.includes(text)) {
    throw new Error(`Parametro ${name} deve ser um de: ${allowed.join(", ")}.`);
  }
  return text;
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
      title: "Cuiabar Meta Ads API",
      version: "0.1.0",
      description:
        "Meta Ads reporting and controlled traffic ad creation API for a custom GPT. Generic write endpoints are not exposed."
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
      "/actions/ad-pixels": {
        get: {
          operationId: "listMetaAdPixels",
          summary: "List Meta ad pixels for the ad account",
          security,
          parameters: [
            { name: "adAccountId", in: "query", required: false, schema: { type: "string" } },
            { name: "limit", in: "query", required: false, schema: { type: "integer", minimum: 1, maximum: 500, default: 100 } }
          ],
          responses: { "200": { description: "Ad pixels" } }
        }
      },
      "/actions/upload-ad-image": {
        post: {
          operationId: "uploadMetaAdImageByUrl",
          summary: "Upload a Meta ad image from an HTTPS URL",
          security,
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["imageUrl"],
                  properties: {
                    imageUrl: { type: "string", format: "uri" },
                    name: { type: "string", maxLength: 120 }
                  }
                }
              }
            }
          },
          responses: { "200": { description: "Uploaded image hash response" } }
        }
      },
      "/actions/upload-ad-video": {
        post: {
          operationId: "uploadMetaAdVideoByUrl",
          summary: "Upload a Meta ad video from an HTTPS URL",
          security,
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["videoUrl"],
                  properties: {
                    videoUrl: { type: "string", format: "uri" },
                    title: { type: "string", maxLength: 120 },
                    description: { type: "string", maxLength: 500 }
                  }
                }
              }
            }
          },
          responses: { "200": { description: "Uploaded video response with video id when accepted by Meta" } }
        }
      },
      "/actions/meta-graph-request": {
        post: {
          operationId: "metaGraphRequest",
          summary: "Call any Meta Graph or Marketing API endpoint with controlled writes",
          security,
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["path"],
                  properties: {
                    method: { type: "string", enum: ["GET", "POST", "DELETE"], default: "GET" },
                    path: { type: "string", description: "Graph path such as /act_<AD_ACCOUNT_ID>/campaigns or /<CAMPAIGN_ID>." },
                    apiVersion: { type: "string" },
                    query: { type: "object", additionalProperties: true },
                    body: { type: "object", additionalProperties: true },
                    idempotencyKey: { type: "string" },
                    validateOnly: { type: "boolean", default: true },
                    confirmWrite: { type: "string", description: "Deprecated optional audit note. Bearer auth grants write access." }
                  }
                }
              }
            }
          },
          responses: { "200": { description: "Graph API response or validate-only plan" } }
        }
      },
      "/actions/meta-graph-request-v2": {
        post: {
          operationId: "metaGraphRequestV2",
          summary: "Call any Meta Graph endpoint with free query/body payloads or JSON-string fallback",
          security,
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  additionalProperties: true,
                  required: ["path"],
                  properties: {
                    method: { type: "string", enum: ["GET", "POST", "DELETE"], default: "GET" },
                    path: { type: "string", description: "Graph path such as /act_<AD_ACCOUNT_ID>/campaigns or /<CAMPAIGN_ID>." },
                    apiVersion: { type: "string" },
                    query: { type: "object", additionalProperties: true },
                    body: { type: "object", additionalProperties: true },
                    queryJson: { type: "string", description: "Fallback JSON object string when the Actions parser cannot pass query." },
                    bodyJson: { type: "string", description: "Fallback JSON object string when the Actions parser cannot pass body." },
                    idempotencyKey: { type: "string" },
                    validateOnly: { type: "boolean", default: true },
                    confirmWrite: { type: "string", description: "Deprecated optional audit note. Bearer auth grants write access." }
                  }
                }
              }
            }
          },
          responses: { "200": { description: "Graph API response or validate-only plan" } }
        }
      },
      "/actions/batch-graph-request": {
        post: {
          operationId: "batchMetaGraphRequest",
          summary: "Execute Meta Graph API batch requests",
          security,
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["requests"],
                  properties: {
                    requests: {
                      type: "array",
                      maxItems: 50,
                      items: {
                        type: "object",
                        required: ["relative_url"],
                        properties: {
                          method: { type: "string", enum: ["GET", "POST", "DELETE"], default: "GET" },
                          relative_url: { type: "string" },
                          body: { type: "object", additionalProperties: true },
                          name: { type: "string" },
                          depends_on: { type: "string" }
                        }
                      }
                    },
                    validateOnly: { type: "boolean", default: true },
                    confirmWrite: { type: "string", description: "Deprecated optional audit note. Bearer auth grants write access." }
                  }
                }
              }
            }
          },
          responses: { "200": { description: "Batch response or validate-only plan" } }
        }
      },
      "/actions/create-full-meta-campaign": {
        post: {
          operationId: "createFullMetaCampaign",
          summary: "Create a full Meta campaign from free-form campaign, ad set, creative and ad payloads",
          security,
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["campaign", "adsets"],
                  properties: {
                    adAccountId: { type: "string" },
                    campaign: { type: "object", additionalProperties: true },
                    adsets: {
                      type: "array",
                      items: {
                        type: "object",
                        required: ["adset"],
                        properties: {
                          adset: { type: "object", additionalProperties: true },
                          ads: {
                            type: "array",
                            items: {
                              type: "object",
                              required: ["creative", "ad"],
                              properties: {
                                creative: { type: "object", additionalProperties: true },
                                ad: { type: "object", additionalProperties: true }
                              }
                            }
                          }
                        }
                      }
                    },
                    validateOnly: { type: "boolean", default: true },
                    confirmWrite: { type: "string", description: "Deprecated optional audit note. Bearer auth grants write access." }
                  }
                }
              }
            }
          },
          responses: { "200": { description: "Created object ids or validate-only plan" } }
        }
      },
      "/actions/create-full-meta-campaign-v2": {
        post: {
          operationId: "createFullMetaCampaignV2",
          summary: "Create a full Meta campaign using free object payloads or JSON-string fallback",
          security,
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  additionalProperties: true,
                  properties: {
                    adAccountId: { type: "string" },
                    campaign: { type: "object", additionalProperties: true },
                    adsets: {
                      type: "array",
                      items: {
                        type: "object",
                        additionalProperties: true,
                        properties: {
                          adset: { type: "object", additionalProperties: true },
                          ads: {
                            type: "array",
                            items: {
                              type: "object",
                              additionalProperties: true,
                              properties: {
                                creative: { type: "object", additionalProperties: true },
                                ad: { type: "object", additionalProperties: true }
                              }
                            }
                          }
                        }
                      }
                    },
                    campaignJson: { type: "string", description: "Fallback JSON object string when the Actions parser cannot pass campaign." },
                    adsetsJson: { type: "string", description: "Fallback JSON array string when the Actions parser cannot pass adsets." },
                    validateOnly: { type: "boolean", default: true },
                    confirmWrite: { type: "string", description: "Deprecated optional audit note. Bearer auth grants write access." }
                  }
                }
              }
            }
          },
          responses: { "200": { description: "Created object ids or validate-only plan" } }
        }
      },
      "/actions/targeting-search": {
        get: {
          operationId: "searchMetaTargeting",
          summary: "Search Meta targeting descriptors",
          security,
          parameters: [
            { name: "q", in: "query", required: false, schema: { type: "string" } },
            { name: "type", in: "query", required: false, schema: { type: "string" } },
            { name: "class", in: "query", required: false, schema: { type: "string" } },
            { name: "adAccountId", in: "query", required: false, schema: { type: "string" } },
            { name: "limit", in: "query", required: false, schema: { type: "integer", minimum: 1, maximum: 500, default: 100 } }
          ],
          responses: { "200": { description: "Targeting search results" } }
        }
      },
      "/actions/resolve-geo-location": {
        get: {
          operationId: "resolveMetaGeoLocation",
          summary: "Resolve a city or place into Meta geo targeting descriptors",
          security,
          parameters: [
            { name: "query", in: "query", required: true, schema: { type: "string" } },
            { name: "countryCode", in: "query", required: false, schema: { type: "string" } },
            { name: "adAccountId", in: "query", required: false, schema: { type: "string" } },
            { name: "limit", in: "query", required: false, schema: { type: "integer", minimum: 1, maximum: 500, default: 25 } }
          ],
          responses: { "200": { description: "Geo location descriptors" } }
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
      },
      "/actions/create-traffic-ad-bundle": {
        post: {
          operationId: "createMetaTrafficAdBundle",
          summary: "Create or prepare a Meta traffic ad bundle",
          security,
          parameters: [{ name: "adAccountId", in: "query", required: false, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: [
                    "campaignName",
                    "adSetName",
                    "adName",
                    "pageId",
                    "linkUrl",
                    "message",
                    "dailyBudgetCents",
                    "countries"
                  ],
                  properties: {
                    campaignName: { type: "string", maxLength: 120 },
                    adSetName: { type: "string", maxLength: 120 },
                    adName: { type: "string", maxLength: 120 },
                    creativeName: { type: "string", maxLength: 120 },
                    pageId: { type: "string", description: "Facebook Page ID used in object_story_spec.page_id." },
                    linkUrl: { type: "string", format: "uri", description: "HTTPS destination URL." },
                    message: { type: "string", maxLength: 500 },
                    headline: { type: "string", maxLength: 80 },
                    description: { type: "string", maxLength: 120 },
                    imageUrl: { type: "string", format: "uri", description: "Optional HTTPS image URL for link_data.picture." },
                    imageHash: { type: "string", description: "Optional image hash returned by uploadMetaAdImageByUrl." },
                    videoId: { type: "string", description: "Optional Meta video ID for video_data creative." },
                    thumbnailUrl: { type: "string", format: "uri" },
                    dailyBudgetCents: { type: "integer", minimum: 100, maximum: 100000000 },
                    lifetimeBudgetCents: { type: "integer", minimum: 100, maximum: 100000000 },
                    countries: {
                      type: "array",
                      minItems: 1,
                      maxItems: 25,
                      items: { type: "string", pattern: "^[A-Za-z]{2}$" }
                    },
                    customLocations: {
                      type: "array",
                      description: "Radius targeting, e.g. latitude/longitude/radius/distance_unit.",
                      items: { type: "object", additionalProperties: true }
                    },
                    cityKeys: { type: "array", items: { type: "string" } },
                    ageMin: { type: "integer", minimum: 13, maximum: 65 },
                    ageMax: { type: "integer", minimum: 13, maximum: 65 },
                    genders: { type: "array", items: { type: "integer", enum: [1, 2] }, description: "1 male, 2 female. Omit for all." },
                    publisherPlatforms: { type: "array", items: { type: "string" }, description: "facebook, instagram, messenger, audience_network." },
                    facebookPositions: { type: "array", items: { type: "string" } },
                    instagramPositions: { type: "array", items: { type: "string" }, description: "stream, story, reels, explore, etc." },
                    devicePlatforms: { type: "array", items: { type: "string" }, description: "mobile, desktop." },
                    audienceNetworkPositions: { type: "array", items: { type: "string" } },
                    messengerPositions: { type: "array", items: { type: "string" } },
                    startTime: { type: "string", format: "date-time" },
                    endTime: { type: "string", format: "date-time" },
                    adSetSchedule: { type: "array", items: { type: "object", additionalProperties: true } },
                    optimizationGoal: {
                      type: "string",
                      enum: ["LANDING_PAGE_VIEWS", "LINK_CLICKS", "REACH", "IMPRESSIONS", "OFFSITE_CONVERSIONS"],
                      default: "LINK_CLICKS"
                    },
                    billingEvent: { type: "string", enum: ["IMPRESSIONS", "LINK_CLICKS"], default: "IMPRESSIONS" },
                    callToActionType: {
                      type: "string",
                      enum: ["LEARN_MORE", "ORDER_NOW", "SHOP_NOW", "SIGN_UP", "CONTACT_US", "BOOK_NOW", "GET_OFFER"],
                      default: "LEARN_MORE"
                    },
                    campaignStatus: { type: "string", enum: ["PAUSED", "ACTIVE"], default: "PAUSED" },
                    adSetStatus: { type: "string", enum: ["PAUSED", "ACTIVE"], default: "PAUSED" },
                    adStatus: { type: "string", enum: ["PAUSED", "ACTIVE"], default: "PAUSED" },
                    ads: {
                      type: "array",
                      maxItems: 20,
                      description: "Multiple ads/creatives in the same ad set. Each item may provide adName, creativeName, message, headline, description, imageUrl, imageHash, videoId, thumbnailUrl and CTA.",
                      items: { type: "object", additionalProperties: true }
                    },
                    targetingOverrides: { type: "object", additionalProperties: true },
                    campaignOverrides: { type: "object", additionalProperties: true },
                    adSetOverrides: { type: "object", additionalProperties: true },
                    validateOnly: {
                      type: "boolean",
                      default: true,
                      description: "When true, returns the planned payload without writing to Meta."
                    },
                    confirmWrite: {
                      type: "string",
                      description: "Deprecated optional audit note. Bearer auth grants write access."
                    }
                  }
                }
              }
            }
          },
          responses: { "200": { description: "Prepared plan or Meta Graph creation responses" } }
        }
      },
      "/actions/create-ad-in-adset": {
        post: {
          operationId: "createMetaAdInExistingAdSet",
          summary: "Create or prepare an additional Meta ad in an existing ad set",
          security,
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["adAccountId", "adSetId", "pageId", "linkUrl", "adName", "message"],
                  properties: {
                    adAccountId: { type: "string" },
                    adSetId: { type: "string" },
                    pageId: { type: "string" },
                    linkUrl: { type: "string", format: "uri" },
                    adName: { type: "string", maxLength: 120 },
                    creativeName: { type: "string", maxLength: 120 },
                    message: { type: "string", maxLength: 500 },
                    headline: { type: "string", maxLength: 80 },
                    description: { type: "string", maxLength: 120 },
                    imageUrl: { type: "string", format: "uri" },
                    imageHash: { type: "string" },
                    videoId: { type: "string" },
                    thumbnailUrl: { type: "string", format: "uri" },
                    callToActionType: { type: "string", enum: ["LEARN_MORE", "ORDER_NOW", "SHOP_NOW", "SIGN_UP", "CONTACT_US", "BOOK_NOW", "GET_OFFER"] },
                    adStatus: { type: "string", enum: ["PAUSED", "ACTIVE"], default: "PAUSED" },
                    validateOnly: { type: "boolean", default: true },
                    confirmWrite: { type: "string", description: "Deprecated optional audit note. Bearer auth grants write access." }
                  }
                }
              }
            }
          },
          responses: { "200": { description: "Prepared plan or Meta Graph creation responses" } }
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
