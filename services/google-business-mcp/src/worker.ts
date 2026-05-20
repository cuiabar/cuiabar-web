type Env = {
  GOOGLE_BUSINESS_ACTIONS_BEARER_TOKEN?: string;
  GOOGLE_BUSINESS_CLIENT_ID?: string;
  GOOGLE_BUSINESS_CLIENT_SECRET?: string;
  GOOGLE_BUSINESS_REFRESH_TOKEN?: string;
  GOOGLE_BUSINESS_DEFAULT_ACCOUNT?: string;
  GOOGLE_BUSINESS_DEFAULT_LOCATION?: string;
  GOOGLE_BUSINESS_API_VERSION?: string;
};

type GoogleMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
type GoogleApiBase = "accountmanagement" | "businessinformation" | "mybusiness" | "performance";

let cachedAccessToken: { token: string; expiresAt: number; cacheKey: string } | null = null;

const REQUIRED_ENV: Array<keyof Env> = [
  "GOOGLE_BUSINESS_ACTIONS_BEARER_TOKEN",
  "GOOGLE_BUSINESS_CLIENT_ID",
  "GOOGLE_BUSINESS_CLIENT_SECRET",
  "GOOGLE_BUSINESS_REFRESH_TOKEN"
];

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,OPTIONS",
  "access-control-allow-headers": "authorization,content-type"
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);

    try {
      if (url.pathname === "/" || url.pathname === "/health") {
        return json(healthPayload(env, url.origin));
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
        return json({ error: "Google Business secrets ausentes.", missingSecrets: missing }, 503);
      }

      return await handleAction(request, env, url);
    } catch (error) {
      return json(toErrorPayload(error), 500);
    }
  }
};

async function handleAction(request: Request, env: Env, url: URL): Promise<Response> {
  const path = url.pathname.replace("/actions/", "");

  if (request.method === "GET" && path === "health") {
    return json(healthPayload(env, url.origin));
  }

  if (request.method === "GET" && path === "accounts") {
    return json(await googleRequest(env, "accountmanagement", "GET", "/v1/accounts", queryFromUrl(url, ["parentAccount", "pageSize", "pageToken", "filter"])));
  }

  if (request.method === "GET" && path === "locations") {
    const accountName = url.searchParams.get("accountName") || defaultAccountName(env);
    return json(
      await googleRequest(env, "businessinformation", "GET", `/v1/${accountName}/locations`, {
        ...queryFromUrl(url, ["pageSize", "pageToken", "filter", "orderBy"]),
        readMask: url.searchParams.get("readMask") || defaultLocationReadMask()
      })
    );
  }

  if (request.method === "GET" && path === "location") {
    const locationName = url.searchParams.get("name") || defaultBusinessInfoLocationName(env);
    return json(
      await googleRequest(env, "businessinformation", "GET", `/v1/${locationName}`, {
        readMask: url.searchParams.get("readMask") || defaultLocationReadMask()
      })
    );
  }

  if (request.method === "POST" && path === "update-location") {
    const body = await readJson(request);
    const locationName = requiredString(body.name ?? defaultBusinessInfoLocationName(env), "name");
    const updateMask = requiredString(body.updateMask, "updateMask");
    const location = optionalObject(body.location, "location") ?? body;
    const validateOnly = body.validateOnly !== false;
    return json(
      await writeOrPlan(env, {
        validateOnly,
        api: "businessinformation",
        method: "PATCH",
        path: `/v1/${locationName}`,
        query: { updateMask, validateOnly },
        body: stripControlFields(location)
      })
    );
  }

  if (request.method === "GET" && path === "reviews") {
    return json(
      await googleRequest(env, "mybusiness", "GET", `/v4/${parentName(url, env)}/reviews`, queryFromUrl(url, ["pageSize", "pageToken", "orderBy"]))
    );
  }

  if (request.method === "GET" && path === "review") {
    return json(await googleRequest(env, "mybusiness", "GET", `/v4/${requiredQuery(url, "name")}`));
  }

  if (request.method === "POST" && path === "reply-review") {
    const body = await readJson(request);
    const name = requiredString(body.name, "name");
    const comment = requiredString(body.comment, "comment");
    return json(
      await writeOrPlan(env, {
        validateOnly: body.validateOnly !== false,
        api: "mybusiness",
        method: "PUT",
        path: `/v4/${name}/reply`,
        body: { comment }
      })
    );
  }

  if (request.method === "POST" && path === "delete-review-reply") {
    const body = await readJson(request);
    const name = requiredString(body.name, "name");
    return json(
      await writeOrPlan(env, {
        validateOnly: body.validateOnly !== false,
        api: "mybusiness",
        method: "DELETE",
        path: `/v4/${name}/reply`
      })
    );
  }

  if (request.method === "GET" && path === "local-posts") {
    return json(await googleRequest(env, "mybusiness", "GET", `/v4/${parentName(url, env)}/localPosts`, queryFromUrl(url, ["pageSize", "pageToken", "orderBy"])));
  }

  if (request.method === "POST" && path === "create-local-post") {
    const body = await readJson(request);
    const parent = requiredString(body.parent ?? defaultV4ParentName(env), "parent");
    return json(
      await writeOrPlan(env, {
        validateOnly: body.validateOnly !== false,
        api: "mybusiness",
        method: "POST",
        path: `/v4/${parent}/localPosts`,
        body: requiredObject(body.post ?? body.localPost ?? body, "post")
      })
    );
  }

  if (request.method === "POST" && path === "update-local-post") {
    const body = await readJson(request);
    const name = requiredString(body.name, "name");
    return json(
      await writeOrPlan(env, {
        validateOnly: body.validateOnly !== false,
        api: "mybusiness",
        method: "PATCH",
        path: `/v4/${name}`,
        query: { updateMask: requiredString(body.updateMask, "updateMask") },
        body: requiredObject(body.post ?? body.localPost ?? body, "post")
      })
    );
  }

  if (request.method === "POST" && path === "delete-local-post") {
    const body = await readJson(request);
    return json(
      await writeOrPlan(env, {
        validateOnly: body.validateOnly !== false,
        api: "mybusiness",
        method: "DELETE",
        path: `/v4/${requiredString(body.name, "name")}`
      })
    );
  }

  if (request.method === "GET" && path === "media") {
    return json(await googleRequest(env, "mybusiness", "GET", `/v4/${parentName(url, env)}/media`, queryFromUrl(url, ["pageSize", "pageToken"])));
  }

  if (request.method === "POST" && path === "create-media") {
    const body = await readJson(request);
    const parent = requiredString(body.parent ?? defaultV4ParentName(env), "parent");
    return json(
      await writeOrPlan(env, {
        validateOnly: body.validateOnly !== false,
        api: "mybusiness",
        method: "POST",
        path: `/v4/${parent}/media`,
        body: requiredObject(body.media ?? body, "media")
      })
    );
  }

  if (request.method === "POST" && path === "delete-media") {
    const body = await readJson(request);
    return json(
      await writeOrPlan(env, {
        validateOnly: body.validateOnly !== false,
        api: "mybusiness",
        method: "DELETE",
        path: `/v4/${requiredString(body.name, "name")}`
      })
    );
  }

  if (request.method === "GET" && path === "performance") {
    const location = url.searchParams.get("location") || defaultPerformanceLocationName(env);
    const startDate = parseDateParts(requiredQuery(url, "startDate"), "startDate");
    const endDate = parseDateParts(requiredQuery(url, "endDate"), "endDate");
    return json(
      await googleRequest(env, "performance", "GET", `/v1/${location}:fetchMultiDailyMetricsTimeSeries`, {
        dailyMetrics: url.searchParams.getAll("dailyMetrics").length
          ? url.searchParams.getAll("dailyMetrics")
          : ["BUSINESS_IMPRESSIONS_DESKTOP_MAPS", "BUSINESS_IMPRESSIONS_MOBILE_MAPS", "CALL_CLICKS", "WEBSITE_CLICKS"],
        "dailyRange.start_date.year": startDate.year,
        "dailyRange.start_date.month": startDate.month,
        "dailyRange.start_date.day": startDate.day,
        "dailyRange.end_date.year": endDate.year,
        "dailyRange.end_date.month": endDate.month,
        "dailyRange.end_date.day": endDate.day
      })
    );
  }

  if (request.method === "GET" && path === "search-keywords") {
    const location = url.searchParams.get("location") || defaultPerformanceLocationName(env);
    return json(
      await googleRequest(env, "performance", "GET", `/v1/${location}/searchkeywords/impressions/monthly`, queryFromUrl(url, ["monthlyRange.startMonth.year", "monthlyRange.startMonth.month", "monthlyRange.endMonth.year", "monthlyRange.endMonth.month", "pageSize", "pageToken"]))
    );
  }

  if (request.method === "POST" && path === "google-business-request") {
    const body = await readJson(request);
    const method = optionalEnum(body.method, "method", ["GET", "POST", "PATCH", "PUT", "DELETE"], "GET");
    const api = optionalEnum(body.api, "api", ["accountmanagement", "businessinformation", "mybusiness", "performance"], "mybusiness");
    const requestPath = normalizeRelativePath(requiredString(body.path, "path"));
    const query = optionalObject(body.query, "query") ?? {};
    const requestBody = optionalObject(body.body, "body");
    const validateOnly = body.validateOnly !== false;
    return json(
      await writeOrPlan(env, {
        validateOnly,
        api,
        method,
        path: requestPath,
        query,
        body: requestBody
      })
    );
  }

  return json({ error: "Not found" }, 404);
}

async function writeOrPlan(
  env: Env,
  request: { validateOnly: boolean; api: GoogleApiBase; method: GoogleMethod; path: string; query?: Record<string, unknown>; body?: unknown }
): Promise<Record<string, unknown>> {
  const isWrite = request.method !== "GET";
  if (isWrite && request.validateOnly) {
    return {
      ok: true,
      mode: "validate-only",
      request: {
        api: request.api,
        method: request.method,
        path: request.path,
        query: request.query,
        body: request.body
      }
    };
  }

  return {
    ok: true,
    mode: isWrite ? "written" : "read",
    response: await googleRequest(env, request.api, request.method, request.path, request.query, request.body)
  };
}

async function googleRequest(
  env: Env,
  api: GoogleApiBase,
  method: GoogleMethod,
  path: string,
  query?: Record<string, unknown>,
  body?: unknown
): Promise<unknown> {
  const accessToken = await getGoogleAccessToken(env);
  const url = new URL(`${apiOrigin(api)}${normalizeRelativePath(path)}`);

  for (const [key, value] of Object.entries(query ?? {})) {
    appendQuery(url, key, value);
  }

  const response = await fetch(url.toString(), {
    method,
    headers: {
      authorization: `Bearer ${accessToken}`,
      ...(body === undefined ? {} : { "content-type": "application/json" })
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  if (response.status === 204) {
    return { ok: true };
  }

  const text = await response.text();
  const parsed = parseMaybeJson(text);
  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      googleError: parsed ?? text,
      request: { api, method, path, query }
    };
  }

  return parsed ?? { ok: true };
}

async function getGoogleAccessToken(env: Env): Promise<string> {
  if (!env.GOOGLE_BUSINESS_CLIENT_ID || !env.GOOGLE_BUSINESS_CLIENT_SECRET || !env.GOOGLE_BUSINESS_REFRESH_TOKEN) {
    throw new Error("Google Business OAuth credentials are not configured");
  }

  const cacheKey = env.GOOGLE_BUSINESS_REFRESH_TOKEN.slice(-16);
  if (cachedAccessToken && cachedAccessToken.cacheKey === cacheKey && cachedAccessToken.expiresAt > Date.now() + 60_000) {
    return cachedAccessToken.token;
  }

  const body = new URLSearchParams({
    client_id: env.GOOGLE_BUSINESS_CLIENT_ID,
    client_secret: env.GOOGLE_BUSINESS_CLIENT_SECRET,
    refresh_token: env.GOOGLE_BUSINESS_REFRESH_TOKEN,
    grant_type: "refresh_token"
  });

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: body.toString()
  });

  if (!response.ok) {
    throw new Error(`Google OAuth refresh failed: ${response.status} ${(await response.text()).slice(0, 500)}`);
  }

  const payload = (await response.json()) as { access_token: string; expires_in: number };
  cachedAccessToken = {
    token: payload.access_token,
    expiresAt: Date.now() + payload.expires_in * 1000,
    cacheKey
  };
  return payload.access_token;
}

function apiOrigin(api: GoogleApiBase): string {
  if (api === "accountmanagement") return "https://mybusinessaccountmanagement.googleapis.com";
  if (api === "businessinformation") return "https://mybusinessbusinessinformation.googleapis.com";
  if (api === "performance") return "https://businessprofileperformance.googleapis.com";
  return "https://mybusiness.googleapis.com";
}

function requireBearer(request: Request, env: Env): Response | null {
  if (!env.GOOGLE_BUSINESS_ACTIONS_BEARER_TOKEN) {
    return json({ error: "GOOGLE_BUSINESS_ACTIONS_BEARER_TOKEN is not configured" }, 503);
  }

  if (request.headers.get("authorization") === `Bearer ${env.GOOGLE_BUSINESS_ACTIONS_BEARER_TOKEN}`) {
    return null;
  }

  return json({ error: "Unauthorized" }, 401);
}

function healthPayload(env: Env, origin: string): Record<string, unknown> {
  const missingSecrets = REQUIRED_ENV.filter((key) => !env[key]);
  return {
    ok: missingSecrets.length === 0,
    service: "google-business-mcp",
    mode: "gpt-actions-read-write-controlled",
    provider: "google-business-profile",
    openapi: `${origin}/openapi.json`,
    defaultAccountConfigured: Boolean(env.GOOGLE_BUSINESS_DEFAULT_ACCOUNT),
    defaultLocationConfigured: Boolean(env.GOOGLE_BUSINESS_DEFAULT_LOCATION),
    missingSecrets
  };
}

async function readJson(request: Request): Promise<Record<string, unknown>> {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function queryFromUrl(url: URL, keys: string[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of keys) {
    const values = url.searchParams.getAll(key);
    if (values.length === 1) result[key] = values[0];
    if (values.length > 1) result[key] = values;
  }
  return result;
}

function appendQuery(url: URL, key: string, value: unknown): void {
  if (value === undefined || value === null || value === "") return;
  if (Array.isArray(value)) {
    value.forEach((item) => appendQuery(url, key, item));
    return;
  }
  if (typeof value === "object") {
    url.searchParams.set(key, JSON.stringify(value));
    return;
  }
  url.searchParams.set(key, String(value));
}

function requiredQuery(url: URL, key: string): string {
  const value = url.searchParams.get(key);
  if (!value) throw new Error(`Missing query parameter: ${key}`);
  return value;
}

function requiredString(value: unknown, name: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Parametro ${name} e obrigatorio.`);
  }
  return value.trim();
}

function requiredObject(value: unknown, name: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Parametro ${name} deve ser objeto.`);
  }
  return value as Record<string, unknown>;
}

function parseDateParts(value: string, name: string): { year: number; month: number; day: number } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    throw new Error(`Parametro ${name} deve estar no formato YYYY-MM-DD.`);
  }
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3])
  };
}

function optionalObject(value: unknown, name: string): Record<string, unknown> | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "string") {
    const parsed = JSON.parse(value) as unknown;
    return requiredObject(parsed, name);
  }
  return requiredObject(value, name);
}

function optionalEnum<T extends string>(value: unknown, name: string, allowed: readonly T[], fallback: T): T {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "string" && allowed.includes(value as T)) return value as T;
  throw new Error(`Parametro ${name} deve ser um de: ${allowed.join(", ")}.`);
}

function stripControlFields(value: Record<string, unknown>): Record<string, unknown> {
  const { name, updateMask, validateOnly, parent, post, localPost, media, ...rest } = value;
  return rest;
}

function defaultAccountName(env: Env): string {
  return normalizeAccountName(requiredString(env.GOOGLE_BUSINESS_DEFAULT_ACCOUNT, "GOOGLE_BUSINESS_DEFAULT_ACCOUNT"));
}

function defaultV4ParentName(env: Env): string {
  return `${defaultAccountName(env)}/${defaultV4LocationName(env)}`;
}

function defaultBusinessInfoLocationName(env: Env): string {
  return normalizeBusinessInfoLocationName(requiredString(env.GOOGLE_BUSINESS_DEFAULT_LOCATION, "GOOGLE_BUSINESS_DEFAULT_LOCATION"));
}

function defaultPerformanceLocationName(env: Env): string {
  return normalizePerformanceLocationName(requiredString(env.GOOGLE_BUSINESS_DEFAULT_LOCATION, "GOOGLE_BUSINESS_DEFAULT_LOCATION"));
}

function defaultV4LocationName(env: Env): string {
  const location = requiredString(env.GOOGLE_BUSINESS_DEFAULT_LOCATION, "GOOGLE_BUSINESS_DEFAULT_LOCATION").replace(/^locations\//, "");
  return `locations/${location}`;
}

function normalizeAccountName(value: string): string {
  return value.startsWith("accounts/") ? value : `accounts/${value}`;
}

function normalizeBusinessInfoLocationName(value: string): string {
  return value.startsWith("locations/") ? value : `locations/${value}`;
}

function normalizePerformanceLocationName(value: string): string {
  return value.startsWith("locations/") ? value : `locations/${value.replace(/^accounts\/[^/]+\/locations\//, "")}`;
}

function parentName(url: URL, env: Env): string {
  const parent = url.searchParams.get("parent");
  if (parent) return parent.replace(/^\/+/, "");
  const accountName = url.searchParams.get("accountName");
  const locationName = url.searchParams.get("locationName");
  if (accountName && locationName) return `${normalizeAccountName(accountName)}/${locationName.startsWith("locations/") ? locationName : `locations/${locationName}`}`;
  return defaultV4ParentName(env);
}

function defaultLocationReadMask(): string {
  return [
    "name",
    "title",
    "storeCode",
    "phoneNumbers",
    "websiteUri",
    "regularHours",
    "specialHours",
    "categories",
    "storefrontAddress",
    "profile",
    "openInfo",
    "metadata",
    "serviceArea"
  ].join(",");
}

function normalizeRelativePath(path: string): string {
  const cleanPath = path.trim();
  if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
    throw new Error("Use API relative path, not a full URL");
  }
  if (cleanPath.includes("..")) {
    throw new Error("Invalid API path");
  }
  return cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
}

function parseMaybeJson(text: string): unknown {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function toErrorPayload(error: unknown): Record<string, unknown> {
  return {
    ok: false,
    error: error instanceof Error ? error.message : String(error)
  };
}

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: {
      ...corsHeaders,
      "cache-control": "no-store",
      "content-type": "application/json; charset=utf-8"
    }
  });
}

function openApiSchema(origin: string): Record<string, unknown> {
  const security = [{ bearerAuth: [] }];
  const jsonResponse = {
    description: "JSON response",
    content: { "application/json": { schema: { type: "object", additionalProperties: true } } }
  };
  const writePlanDescription = "Writes default to validateOnly=true. Set validateOnly=false only after explicit user approval.";

  return {
    openapi: "3.1.0",
    info: {
      title: "Cuiabar Google Business Profile Actions",
      version: "0.1.0",
      description: "Read and controlled-write actions for Google Business Profile accounts, locations, reviews, posts, media and performance."
    },
    servers: [{ url: origin }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          description: "Use GOOGLE_BUSINESS_ACTIONS_BEARER_TOKEN as the Bearer token."
        }
      },
      schemas: {
        FreeObject: { type: "object", additionalProperties: true },
        GoogleBusinessRequest: {
          type: "object",
          additionalProperties: true,
          properties: {
            api: { type: "string", enum: ["accountmanagement", "businessinformation", "mybusiness", "performance"], default: "mybusiness" },
            method: { type: "string", enum: ["GET", "POST", "PATCH", "PUT", "DELETE"], default: "GET" },
            path: { type: "string" },
            query: { type: "object", additionalProperties: true },
            body: { type: "object", additionalProperties: true },
            validateOnly: { type: "boolean", default: true }
          },
          required: ["path"]
        }
      }
    },
    paths: {
      "/health": {
        get: { operationId: "checkGoogleBusinessHealth", summary: "Check service health", responses: { "200": jsonResponse } }
      },
      "/actions/accounts": {
        get: { operationId: "listGoogleBusinessAccounts", summary: "List accessible Google Business accounts", security, responses: { "200": jsonResponse } }
      },
      "/actions/locations": {
        get: {
          operationId: "listGoogleBusinessLocations",
          summary: "List business locations for an account",
          security,
          parameters: [
            { name: "accountName", in: "query", schema: { type: "string" } },
            { name: "readMask", in: "query", schema: { type: "string" } },
            { name: "filter", in: "query", schema: { type: "string" } },
            { name: "pageSize", in: "query", schema: { type: "integer", minimum: 1, maximum: 100 } },
            { name: "pageToken", in: "query", schema: { type: "string" } }
          ],
          responses: { "200": jsonResponse }
        }
      },
      "/actions/location": {
        get: {
          operationId: "getGoogleBusinessLocation",
          summary: "Get one business location",
          security,
          parameters: [
            { name: "name", in: "query", schema: { type: "string", description: "locations/{locationId}" } },
            { name: "readMask", in: "query", schema: { type: "string" } }
          ],
          responses: { "200": jsonResponse }
        }
      },
      "/actions/update-location": {
        post: {
          operationId: "updateGoogleBusinessLocation",
          summary: "Update location fields with updateMask",
          description: writePlanDescription,
          security,
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  additionalProperties: true,
                  properties: {
                    name: { type: "string", description: "locations/{locationId}" },
                    updateMask: { type: "string", description: "Comma-separated fields, e.g. title,phoneNumbers,websiteUri,regularHours" },
                    location: { $ref: "#/components/schemas/FreeObject" },
                    validateOnly: { type: "boolean", default: true }
                  },
                  required: ["updateMask"]
                }
              }
            }
          },
          responses: { "200": jsonResponse }
        }
      },
      "/actions/reviews": {
        get: {
          operationId: "listGoogleBusinessReviews",
          summary: "List reviews for a location",
          security,
          parameters: commonParentParams(),
          responses: { "200": jsonResponse }
        }
      },
      "/actions/reply-review": {
        post: {
          operationId: "replyGoogleBusinessReview",
          summary: "Reply to a Google Business review",
          description: writePlanDescription,
          security,
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { name: { type: "string" }, comment: { type: "string" }, validateOnly: { type: "boolean", default: true } }, required: ["name", "comment"] } } } },
          responses: { "200": jsonResponse }
        }
      },
      "/actions/local-posts": {
        get: { operationId: "listGoogleBusinessLocalPosts", summary: "List local posts", security, parameters: commonParentParams(), responses: { "200": jsonResponse } }
      },
      "/actions/create-local-post": {
        post: {
          operationId: "createGoogleBusinessLocalPost",
          summary: "Create a local post",
          description: writePlanDescription,
          security,
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", additionalProperties: true, properties: { parent: { type: "string" }, post: { $ref: "#/components/schemas/FreeObject" }, validateOnly: { type: "boolean", default: true } } } } } },
          responses: { "200": jsonResponse }
        }
      },
      "/actions/update-local-post": {
        post: {
          operationId: "updateGoogleBusinessLocalPost",
          summary: "Update a local post",
          description: writePlanDescription,
          security,
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", additionalProperties: true, properties: { name: { type: "string" }, updateMask: { type: "string" }, post: { $ref: "#/components/schemas/FreeObject" }, validateOnly: { type: "boolean", default: true } }, required: ["name", "updateMask"] } } } },
          responses: { "200": jsonResponse }
        }
      },
      "/actions/media": {
        get: { operationId: "listGoogleBusinessMedia", summary: "List location media", security, parameters: commonParentParams(), responses: { "200": jsonResponse } }
      },
      "/actions/create-media": {
        post: {
          operationId: "createGoogleBusinessMedia",
          summary: "Create a media item from Google Business media payload",
          description: writePlanDescription,
          security,
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", additionalProperties: true, properties: { parent: { type: "string" }, media: { $ref: "#/components/schemas/FreeObject" }, validateOnly: { type: "boolean", default: true } } } } } },
          responses: { "200": jsonResponse }
        }
      },
      "/actions/performance": {
        get: {
          operationId: "getGoogleBusinessPerformance",
          summary: "Fetch daily performance metrics",
          security,
          parameters: [
            { name: "location", in: "query", schema: { type: "string", description: "locations/{locationId}" } },
            { name: "startDate", in: "query", required: true, schema: { type: "string", format: "date" } },
            { name: "endDate", in: "query", required: true, schema: { type: "string", format: "date" } },
            { name: "dailyMetrics", in: "query", schema: { type: "string" }, description: "Repeat this query parameter for multiple metrics." }
          ],
          responses: { "200": jsonResponse }
        }
      },
      "/actions/search-keywords": {
        get: {
          operationId: "listGoogleBusinessSearchKeywords",
          summary: "List monthly search keyword impressions",
          security,
          parameters: [
            { name: "location", in: "query", schema: { type: "string" } },
            { name: "monthlyRange.startMonth.year", in: "query", schema: { type: "integer" } },
            { name: "monthlyRange.startMonth.month", in: "query", schema: { type: "integer" } },
            { name: "monthlyRange.endMonth.year", in: "query", schema: { type: "integer" } },
            { name: "monthlyRange.endMonth.month", in: "query", schema: { type: "integer" } }
          ],
          responses: { "200": jsonResponse }
        }
      },
      "/actions/google-business-request": {
        post: {
          operationId: "googleBusinessApiRequest",
          summary: "Call a Google Business Profile API endpoint with controlled writes",
          description: writePlanDescription,
          security,
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/GoogleBusinessRequest" } } } },
          responses: { "200": jsonResponse }
        }
      }
    }
  };
}

function commonParentParams(): Array<Record<string, unknown>> {
  return [
    { name: "parent", in: "query", schema: { type: "string", description: "accounts/{accountId}/locations/{locationId}" } },
    { name: "accountName", in: "query", schema: { type: "string" } },
    { name: "locationName", in: "query", schema: { type: "string" } },
    { name: "pageSize", in: "query", schema: { type: "integer", minimum: 1, maximum: 100 } },
    { name: "pageToken", in: "query", schema: { type: "string" } }
  ];
}
