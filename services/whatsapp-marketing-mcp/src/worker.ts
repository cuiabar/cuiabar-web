import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createWhatsAppMarketingMcpServer } from "./mcpServer.js";
import {
  buildCampaignPlan,
  buildMessageVariants,
  formatWhatsAppMarketingMessage,
  sendNumberedMenu,
  sendSingleMarketingMedia,
  sendSingleMarketingMessage,
  type BridgeClient,
  type MarketingConfig
} from "./policy.js";

type Env = {
  MCP_BEARER_TOKEN?: string;
  GHCO_COMMS_BRIDGE_URL?: string;
  GHCO_COMMS_BRIDGE_TOKEN?: string;
  MARKETING_MAX_BATCH_SIZE?: string;
  MARKETING_MIN_DELAY_SECONDS?: string;
  MARKETING_MAX_DAILY_RECIPIENTS?: string;
};

type OAuthPayload = {
  type: "code" | "access" | "refresh";
  exp: number;
  client_id?: string;
  redirect_uri?: string;
  code_challenge?: string;
  code_challenge_method?: string;
  scope?: string;
};

const REQUIRED_ENV: Array<keyof Env> = ["MCP_BEARER_TOKEN", "GHCO_COMMS_BRIDGE_TOKEN"];
const writeScope = "whatsapp_marketing.write";
const readScope = "whatsapp_marketing.read";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url);
      const origin = url.origin;

      if (url.pathname === "/" || url.pathname === "/health") {
        const missing = REQUIRED_ENV.filter((key) => !env[key]);
        return json({
          ok: missing.length === 0,
          service: "whatsapp-marketing-mcp",
          mode: "training-capable-marketing",
          endpoint: `${origin}/sse`,
          bridgeUrl: env.GHCO_COMMS_BRIDGE_URL ?? "not-configured",
          missingSecrets: missing,
          policy: {
            consentRequiredForRealSend: true,
            relaxedForValidateOnly: true,
            trainingModeSupported: true,
            noBlockEvasion: true
          }
        });
      }

      if (url.pathname === "/openapi.json") {
        return json(openApiSchema(origin));
      }

      if (url.pathname === "/.well-known/oauth-authorization-server" || url.pathname === "/.well-known/openid-configuration") {
        return json(authorizationServerMetadata(origin));
      }

      if (
        url.pathname === "/.well-known/oauth-protected-resource" ||
        url.pathname === "/.well-known/oauth-protected-resource/sse" ||
        url.pathname === "/.well-known/oauth-protected-resource/mcp"
      ) {
        return json({
          resource: origin,
          authorization_servers: [origin],
          scopes_supported: [readScope, writeScope],
          bearer_methods_supported: ["header"],
          resource_documentation: `${origin}/health`
        });
      }

      if (url.pathname === "/register" && request.method === "POST") {
        const body = await readJson(request);
        const redirectUris = Array.isArray(body.redirect_uris) ? body.redirect_uris : [];
        return json(
          {
            client_id: `chatgpt-${crypto.randomUUID()}`,
            client_secret: crypto.randomUUID(),
            client_id_issued_at: Math.floor(Date.now() / 1000),
            client_secret_expires_at: 0,
            redirect_uris: redirectUris,
            grant_types: ["authorization_code", "refresh_token"],
            response_types: ["code"],
            token_endpoint_auth_method: "client_secret_post",
            scope: `${readScope} ${writeScope}`
          },
          201
        );
      }

      if (url.pathname === "/authorize" && request.method === "GET") {
        return authorizationPage(url);
      }

      if (url.pathname === "/authorize" && request.method === "POST") {
        return handleAuthorizePost(request, env);
      }

      if (url.pathname === "/token" && request.method === "POST") {
        return handleTokenRequest(request, env);
      }

      if (url.pathname.startsWith("/actions/")) {
        return handleActionRequest(request, env);
      }

      if (url.pathname !== "/sse" && url.pathname !== "/mcp") {
        return json({ error: "Not found" }, 404);
      }

      const authError = await requireBearerToken(request, env);
      if (authError) {
        return authError;
      }

      const bridge = createBridgeClient(env);
      const server = createWhatsAppMarketingMcpServer(bridge, marketingConfig(env));
      const transport = new WebStandardStreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: false
      });

      await server.connect(transport);
      return transport.handleRequest(request);
    } catch (error) {
      return json(toErrorPayload(error), 500);
    }
  }
};

async function handleActionRequest(request: Request, env: Env): Promise<Response> {
  const authError = await requireBearerToken(request, env);
  if (authError) {
    return authError;
  }

  const url = new URL(request.url);
  const config = marketingConfig(env);
  const bridge = createBridgeClient(env);

  if (url.pathname === "/actions/health" && request.method === "GET") {
    return json({
      ok: true,
      service: "whatsapp-marketing-actions",
      mode: "consented-marketing",
      config
    });
  }

  if (url.pathname === "/actions/message-variants" && request.method === "POST") {
    return json(buildMessageVariants(await readJson(request) as never));
  }

  if (url.pathname === "/actions/plan-campaign" && request.method === "POST") {
    return json(buildCampaignPlan(await readJson(request) as never, config));
  }

  if (url.pathname === "/actions/format-message" && request.method === "POST") {
    return json(formatWhatsAppMarketingMessage(await readJson(request) as never));
  }

  if (url.pathname === "/actions/send-single" && request.method === "POST") {
    return json(await sendSingleMarketingMessage(bridge, await readJson(request) as never));
  }

  if ((url.pathname === "/actions/send-form" || url.pathname === "/actions/send-numbered-menu") && request.method === "POST") {
    return json(await sendNumberedMenu(bridge, await readJson(request) as never));
  }

  if (url.pathname === "/actions/send-media" && request.method === "POST") {
    return json(await sendSingleMarketingMedia(bridge, await readJson(request) as never));
  }

  return json({ error: "Not found" }, 404);
}

function createBridgeClient(env: Env): BridgeClient {
  const baseUrl = env.GHCO_COMMS_BRIDGE_URL ?? "http://127.0.0.1:8788";
  const token = env.GHCO_COMMS_BRIDGE_TOKEN ?? "";

  return {
    async sendText(recipient: string, text: string): Promise<unknown> {
      let response: Response;
      try {
        response = await fetch(new URL("/api/messages/send", baseUrl), {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ recipient, text })
        });
      } catch (error) {
        throw new Error(`GHCO Comunicacoes bridge unreachable: ${error instanceof Error ? error.message : String(error)}`);
      }

      const responseText = await response.text();
      const payload = parseJsonOrText(responseText);
      if (!response.ok) {
        throw new Error(`GHCO Comunicacoes bridge ${response.status}: ${JSON.stringify(payload)}`);
      }
      return payload;
    },
    async sendMedia(input): Promise<unknown> {
      let response: Response;
      try {
        response = await fetch(new URL("/api/messages/send-media", baseUrl), {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${token}`
          },
          body: JSON.stringify(input)
        });
      } catch (error) {
        throw new Error(`GHCO Comunicacoes bridge unreachable: ${error instanceof Error ? error.message : String(error)}`);
      }

      const responseText = await response.text();
      const payload = parseJsonOrText(responseText);
      if (!response.ok) {
        throw new Error(`GHCO Comunicacoes bridge ${response.status}: ${JSON.stringify(payload)}`);
      }
      return payload;
    },
    async sendNumberedMenu(input): Promise<unknown> {
      let response: Response;
      try {
        response = await fetch(new URL("/api/messages/send-form", baseUrl), {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${token}`
          },
          body: JSON.stringify(input)
        });
      } catch (error) {
        throw new Error(`GHCO Comunicacoes bridge unreachable: ${error instanceof Error ? error.message : String(error)}`);
      }

      const responseText = await response.text();
      const payload = parseJsonOrText(responseText);
      if (!response.ok) {
        throw new Error(`GHCO Comunicacoes bridge ${response.status}: ${JSON.stringify(payload)}`);
      }
      return payload;
    }
  };
}

function marketingConfig(env: Env): MarketingConfig {
  return {
    maxBatchSize: clampEnvInt(env.MARKETING_MAX_BATCH_SIZE, 25, 1, 500),
    minDelaySeconds: clampEnvInt(env.MARKETING_MIN_DELAY_SECONDS, 45, 30, 3600),
    maxDailyRecipients: clampEnvInt(env.MARKETING_MAX_DAILY_RECIPIENTS, 200, 1, 5000)
  };
}

function openApiSchema(origin: string): Record<string, unknown> {
  const security = [{ bearerAuth: [] }];
  return {
    openapi: "3.1.0",
    info: {
      title: "Cuiabar WhatsApp Marketing API",
      version: "0.1.0",
      description:
        "GPT Actions API para treinamento e campanhas WhatsApp. Em validateOnly/trainingMode relaxa consentimento e opt-out no payload; envio real continua exigindo confirmacao e validacao."
    },
    servers: [{ url: origin }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          description: "Use o token privado MCP/action como Bearer token."
        }
      },
      schemas: {
        Recipient: {
          type: "object",
          required: ["phone"],
          properties: {
            phone: { type: "string" },
            name: { type: "string" },
            consentSource: { type: "string", description: "Origem do consentimento. Opcional em validateOnly/trainingMode; exigido em envio real." },
            consentAt: { type: "string", format: "date-time" },
            tags: { type: "array", items: { type: "string" } },
            optedOut: { type: "boolean", default: false }
          }
        }
      }
    },
    paths: {
      "/actions/health": {
        get: {
          operationId: "checkWhatsAppMarketingHealth",
          summary: "Check WhatsApp marketing API health",
          security,
          responses: { "200": { description: "Health status" } }
        }
      },
      "/actions/message-variants": {
        post: {
          operationId: "createWhatsAppMarketingVariants",
          summary: "Create compliant WhatsApp marketing message variants",
          security,
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["campaignName", "baseMessage", "audience"],
                  properties: {
                    campaignName: { type: "string", maxLength: 120 },
                    baseMessage: { type: "string", maxLength: 900 },
                    audience: { type: "string", maxLength: 160 },
                    offer: { type: "string", maxLength: 240 },
                    tone: { type: "string", enum: ["direto", "cordial", "premium", "urgente_suave"], default: "cordial" },
                    variantCount: { type: "integer", minimum: 1, maximum: 8, default: 4 },
                    optOutText: { type: "string", default: "Responda SAIR para nao receber novas mensagens." }
                  }
                }
              }
            }
          },
          responses: { "200": { description: "Message variants" } }
        }
      },
      "/actions/plan-campaign": {
        post: {
          operationId: "planConsentedWhatsAppCampaign",
          summary: "Plan a consented WhatsApp campaign without sending a batch",
          security,
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["campaignName", "recipients", "variants"],
                  properties: {
                    campaignName: { type: "string", maxLength: 120 },
                    recipients: {
                      type: "array",
                      minItems: 1,
                      maxItems: 500,
                      items: { "$ref": "#/components/schemas/Recipient" }
                    },
                    variants: { type: "array", minItems: 1, maxItems: 20, items: { type: "string", maxLength: 1200 } },
                    startAt: { type: "string", format: "date-time" },
                    quietHoursStart: { type: "string", default: "21:00" },
                    quietHoursEnd: { type: "string", default: "09:00" },
                    minDelaySeconds: { type: "integer", minimum: 30, maximum: 3600 },
                    maxDailyRecipients: { type: "integer", minimum: 1, maximum: 1000 },
                    validateOnly: { type: "boolean", default: true },
                    trainingMode: {
                      type: "boolean",
                      default: false,
                      description: "Quando true, relaxa consentimento/opt-out/identificacao textual porque nao executa envio real."
                    }
                  }
                }
              }
            }
          },
          responses: { "200": { description: "Campaign dispatch plan" } }
        }
      },
      "/actions/format-message": {
        post: {
          operationId: "formatWhatsAppMarketingMessage",
          summary: "Format a WhatsApp marketing message without sending it",
          security,
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    title: { type: "string", maxLength: 200, description: "Titulo formatado em negrito no WhatsApp." },
                    body: { type: "string", maxLength: 3000, description: "Corpo formatado em italico no WhatsApp." },
                    quotes: {
                      type: "array",
                      maxItems: 20,
                      items: { type: "string", maxLength: 500 },
                      description: "Precos e informacoes uteis formatados como citacao."
                    },
                    footer: { type: "string", maxLength: 1000, description: "Rodape sem formatacao extra, ideal para remetente e opt-out." }
                  }
                }
              }
            }
          },
          responses: { "200": { description: "Formatted WhatsApp text" } }
        }
      },
      "/actions/send-single": {
        post: {
          operationId: "sendSingleConsentedWhatsAppMarketingMessage",
          summary: "Send one consented WhatsApp marketing message",
          security,
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["recipient", "text"],
                  properties: {
                    recipient: { "$ref": "#/components/schemas/Recipient" },
                    text: { type: "string", maxLength: 1200 },
                    validateOnly: { type: "boolean", default: true },
                    trainingMode: {
                      type: "boolean",
                      default: false,
                      description: "Quando true, simula sem exigir consentSource, opt-out ou identificacao textual."
                    },
                    confirmWrite: {
                      type: "string",
                      description: "Required as ENVIAR_WHATSAPP_CONSENTIDO when validateOnly is false."
                    }
                  }
                }
              }
            }
          },
          responses: { "200": { description: "Validation or send result" } }
        }
      },
      "/actions/send-form": {
        post: {
          operationId: "sendWhatsAppForm",
          summary: "Send a zero-cost WhatsApp form",
          security,
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["recipient", "body", "options"],
                  properties: {
                    recipient: { "$ref": "#/components/schemas/Recipient" },
                    title: { type: "string", maxLength: 200 },
                    body: {
                      type: "string",
                      maxLength: 3000,
                      description: "Texto principal antes das opcoes numeradas."
                    },
                    options: {
                      type: "array",
                      minItems: 1,
                      maxItems: 10,
                      items: {
                        type: "object",
                        required: ["label", "responseText"],
                        properties: {
                          label: { type: "string", maxLength: 80, description: "Texto visivel da opcao do form." },
                          responseText: {
                            type: "string",
                            maxLength: 4000,
                            description: "Resposta enviada automaticamente quando o cliente responder este numero."
                          }
                        }
                      }
                    },
                    footer: { type: "string", maxLength: 1000 },
                    invalidResponseText: {
                      type: "string",
                      maxLength: 1000,
                      description: "Resposta para numero invalido; a sessao tambem e encerrada."
                    },
                    expiresInMinutes: { type: "integer", minimum: 1, maximum: 1440, default: 60 },
                    validateOnly: { type: "boolean", default: true },
                    trainingMode: {
                      type: "boolean",
                      default: false,
                      description: "Quando true, simula o menu sem envio real."
                    },
                    confirmWrite: {
                      type: "string",
                      description: "Required as ENVIAR_MENU_NUMERADO when validateOnly is false."
                    }
                  }
                }
              }
            }
          },
          responses: { "200": { description: "Validation or form send result" } }
        }
      },
      "/actions/send-numbered-menu": {
        post: {
          operationId: "sendNumberedWhatsAppMenu",
          summary: "Alias for sendWhatsAppForm",
          security,
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["recipient", "body", "options"],
                  properties: {
                    recipient: { "$ref": "#/components/schemas/Recipient" },
                    title: { type: "string", maxLength: 200 },
                    body: { type: "string", maxLength: 3000 },
                    options: {
                      type: "array",
                      minItems: 1,
                      maxItems: 10,
                      items: {
                        type: "object",
                        required: ["label", "responseText"],
                        properties: {
                          label: { type: "string", maxLength: 80 },
                          responseText: { type: "string", maxLength: 4000 }
                        }
                      }
                    },
                    footer: { type: "string", maxLength: 1000 },
                    invalidResponseText: { type: "string", maxLength: 1000 },
                    expiresInMinutes: { type: "integer", minimum: 1, maximum: 1440, default: 60 },
                    validateOnly: { type: "boolean", default: true },
                    trainingMode: { type: "boolean", default: false },
                    confirmWrite: { type: "string" }
                  }
                }
              }
            }
          },
          responses: { "200": { description: "Validation or form send result" } }
        }
      },
      "/actions/send-media": {
        post: {
          operationId: "sendSingleConsentedWhatsAppMarketingMedia",
          summary: "Send one consented WhatsApp marketing media message",
          security,
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["recipient", "mediaType"],
                  properties: {
                    recipient: { "$ref": "#/components/schemas/Recipient" },
                    mediaType: {
                      type: "string",
                      enum: ["image", "video", "audio", "document"],
                      description: "image=foto, video=video, audio=audio/mensagem de voz, document=arquivo."
                    },
                    filePath: {
                      type: "string",
                      description: "Caminho local no host do bridge. Use somente quando o arquivo existir nesta maquina."
                    },
                    mediaUrl: {
                      type: "string",
                      format: "uri",
                      description: "URL HTTPS publica do arquivo de midia. Recomendada para uso via GPT."
                    },
                    title: { type: "string", maxLength: 200, description: "Titulo da legenda, em negrito." },
                    body: { type: "string", maxLength: 3000, description: "Corpo da legenda, em italico." },
                    quotes: {
                      type: "array",
                      maxItems: 20,
                      items: { type: "string", maxLength: 500 },
                      description: "Precos e informacoes uteis como citacao."
                    },
                    footer: { type: "string", maxLength: 1000 },
                    caption: {
                      type: "string",
                      maxLength: 1200,
                      description: "Legenda pronta. Se enviada, substitui title/body/quotes/footer."
                    },
                    fileName: { type: "string", maxLength: 200 },
                    mimeType: { type: "string", maxLength: 120 },
                    asVoice: { type: "boolean", default: false, description: "Para audio com aparencia de mensagem de voz." },
                    validateOnly: { type: "boolean", default: true },
                    trainingMode: {
                      type: "boolean",
                      default: false,
                      description: "Quando true, simula sem exigir consentSource, opt-out ou identificacao textual."
                    },
                    confirmWrite: {
                      type: "string",
                      description: "Required as ENVIAR_WHATSAPP_MIDIA_CONSENTIDA when validateOnly is false."
                    }
                  },
                  oneOf: [
                    { required: ["filePath"] },
                    { required: ["mediaUrl"] }
                  ]
                }
              }
            }
          },
          responses: { "200": { description: "Validation or media send result" } }
        }
      }
    }
  };
}

async function requireBearerToken(request: Request, env: Env): Promise<Response | null> {
  if (!env.MCP_BEARER_TOKEN) {
    return null;
  }

  const authorization = request.headers.get("authorization");
  if (authorization === `Bearer ${env.MCP_BEARER_TOKEN}`) {
    return null;
  }

  const accessToken = authorization?.replace(/^Bearer\s+/i, "");
  if (accessToken) {
    const payload = await verifyPayload(accessToken, env);
    return payload?.type === "access" ? null : unauthorized(request);
  }

  return unauthorized(request);
}

function authorizationServerMetadata(origin: string): Record<string, unknown> {
  return {
    issuer: origin,
    authorization_endpoint: `${origin}/authorize`,
    token_endpoint: `${origin}/token`,
    registration_endpoint: `${origin}/register`,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    code_challenge_methods_supported: ["S256", "plain"],
    token_endpoint_auth_methods_supported: ["client_secret_post", "client_secret_basic", "none"],
    scopes_supported: [readScope, writeScope],
    service_documentation: `${origin}/health`
  };
}

function authorizationPage(url: URL): Response {
  const hiddenFields = [
    "client_id",
    "redirect_uri",
    "response_type",
    "scope",
    "state",
    "code_challenge",
    "code_challenge_method"
  ]
    .map((name) => `<input type="hidden" name="${name}" value="${escapeHtml(url.searchParams.get(name) ?? "")}">`)
    .join("\n");

  return new Response(
    `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Autorizar WhatsApp Marketing MCP</title>
  <style>
    body{font-family:system-ui,-apple-system,Segoe UI,sans-serif;background:#111827;color:#f9fafb;display:grid;place-items:center;min-height:100vh;margin:0}
    main{width:min(460px,calc(100vw - 32px));background:#1f2937;border:1px solid #374151;border-radius:12px;padding:24px}
    label,input,button{display:block;width:100%;box-sizing:border-box}
    input{margin-top:8px;padding:12px;border-radius:8px;border:1px solid #4b5563;background:#111827;color:#fff}
    button{margin-top:16px;padding:12px;border:0;border-radius:8px;background:#f97316;color:#111827;font-weight:700;cursor:pointer}
    p{color:#d1d5db;line-height:1.5}
  </style>
</head>
<body>
  <main>
    <h1>Autorizar WhatsApp Marketing MCP</h1>
    <p>Libera o GPT para planejar campanhas consentidas e enviar mensagens individuais com confirmacao explicita.</p>
    <form method="post" action="/authorize">
      ${hiddenFields}
      <label>Token MCP
        <input name="mcp_token" type="password" autocomplete="off" required autofocus>
      </label>
      <button type="submit">Autorizar</button>
    </form>
  </main>
</body>
</html>`,
    { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } }
  );
}

async function handleAuthorizePost(request: Request, env: Env): Promise<Response> {
  const form = await request.formData();
  const mcpToken = String(form.get("mcp_token") ?? "");

  if (!env.MCP_BEARER_TOKEN || mcpToken !== env.MCP_BEARER_TOKEN) {
    return new Response("Token MCP invalido.", { status: 401, headers: { "content-type": "text/plain; charset=utf-8" } });
  }

  const redirectUri = String(form.get("redirect_uri") ?? "");
  const clientId = String(form.get("client_id") ?? "");
  const responseType = String(form.get("response_type") ?? "");
  const codeChallenge = String(form.get("code_challenge") ?? "");
  const codeChallengeMethod = String(form.get("code_challenge_method") || "plain");
  const state = String(form.get("state") ?? "");
  const scope = String(form.get("scope") || `${readScope} ${writeScope}`);

  if (responseType !== "code" || !redirectUri || !clientId) {
    return json({ error: "invalid_request" }, 400);
  }

  const code = await signPayload(
    {
      type: "code",
      exp: Math.floor(Date.now() / 1000) + 300,
      client_id: clientId,
      redirect_uri: redirectUri,
      code_challenge: codeChallenge,
      code_challenge_method: codeChallengeMethod,
      scope
    },
    env
  );

  const destination = new URL(redirectUri);
  destination.searchParams.set("code", code);
  if (state) {
    destination.searchParams.set("state", state);
  }

  return Response.redirect(destination.toString(), 302);
}

async function handleTokenRequest(request: Request, env: Env): Promise<Response> {
  if (!env.MCP_BEARER_TOKEN) {
    return json({ error: "server_error" }, 500);
  }

  const form = await request.formData();
  const grantType = String(form.get("grant_type") ?? "");

  if (grantType === "authorization_code") {
    const code = String(form.get("code") ?? "");
    const redirectUri = String(form.get("redirect_uri") ?? "");
    const codeVerifier = String(form.get("code_verifier") ?? "");
    const payload = await verifyPayload(code, env);

    if (!payload || payload.type !== "code" || payload.redirect_uri !== redirectUri) {
      return json({ error: "invalid_grant" }, 400);
    }

    if (!(await verifyPkce(codeVerifier, payload.code_challenge, payload.code_challenge_method))) {
      return json({ error: "invalid_grant" }, 400);
    }

    return issueTokens(env, payload.scope);
  }

  if (grantType === "refresh_token") {
    const refreshToken = String(form.get("refresh_token") ?? "");
    const payload = await verifyPayload(refreshToken, env);

    if (!payload || payload.type !== "refresh") {
      return json({ error: "invalid_grant" }, 400);
    }

    return issueTokens(env, payload.scope);
  }

  return json({ error: "unsupported_grant_type" }, 400);
}

async function issueTokens(env: Env, scope = `${readScope} ${writeScope}`): Promise<Response> {
  const now = Math.floor(Date.now() / 1000);
  const accessToken = await signPayload({ type: "access", exp: now + 3600, scope }, env);
  const refreshToken = await signPayload({ type: "refresh", exp: now + 60 * 60 * 24 * 30, scope }, env);

  return json({
    access_token: accessToken,
    token_type: "Bearer",
    expires_in: 3600,
    refresh_token: refreshToken,
    scope
  });
}

function unauthorized(request: Request): Response {
  const url = new URL(request.url);
  const resourceMetadata = `${url.origin}/.well-known/oauth-protected-resource`;
  return json({ error: "Bearer token invalido." }, 401, {
    "WWW-Authenticate": `Bearer resource_metadata="${resourceMetadata}", scope="${readScope} ${writeScope}"`
  });
}

function json(value: unknown, status: number, extraHeaders: Record<string, string>): Response;
function json(value: unknown, status?: number): Response;
function json(value: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(value, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...extraHeaders
    }
  });
}

async function signPayload(payload: OAuthPayload, env: Env): Promise<string> {
  const body = base64UrlEncode(JSON.stringify(payload));
  const signature = await hmac(body, env);
  return `${body}.${signature}`;
}

async function verifyPayload(token: string, env: Env): Promise<OAuthPayload | null> {
  const [body, signature] = token.split(".");
  if (!body || !signature) {
    return null;
  }

  const expected = await hmac(body, env);
  if (!timingSafeEqual(signature, expected)) {
    return null;
  }

  const payload = JSON.parse(base64UrlDecode(body)) as OAuthPayload;
  if (payload.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
}

async function verifyPkce(verifier: string, challenge?: string, method = "plain"): Promise<boolean> {
  if (!challenge) {
    return true;
  }
  if (method === "S256") {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
    return base64UrlEncodeBytes(new Uint8Array(digest)) === challenge;
  }
  return verifier === challenge;
}

async function hmac(value: string, env: Env): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(env.MCP_BEARER_TOKEN ?? ""),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return base64UrlEncodeBytes(new Uint8Array(signature));
}

function base64UrlEncode(value: string): string {
  return base64UrlEncodeBytes(new TextEncoder().encode(value));
}

function base64UrlEncodeBytes(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value: string): string {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  return new TextDecoder().decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)));
}

function timingSafeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < left.length; i += 1) {
    result |= left.charCodeAt(i) ^ right.charCodeAt(i);
  }
  return result === 0;
}

function clampEnvInt(value: string | undefined, fallback: number, min: number, max: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.max(min, Math.min(max, parsed));
}

async function readJson(request: Request): Promise<Record<string, unknown>> {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function toErrorPayload(error: unknown): Record<string, unknown> {
  return {
    error: error instanceof Error ? error.message : String(error)
  };
}

function parseJsonOrText(value: string): unknown {
  if (!value) {
    return {};
  }
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return { body: value.slice(0, 1000) };
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
