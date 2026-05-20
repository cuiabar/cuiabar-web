type Env = {
  EMAIL_MCP_BEARER_TOKEN?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GOOGLE_REFRESH_TOKEN?: string;
  GMAIL_SENDER_EMAIL?: string;
  GMAIL_SENDER_NAME?: string;
  DEFAULT_REPLY_TO?: string;
  CRM_GMAIL_SEND_URL?: string;
  EMAIL_MCP_INTERNAL_TOKEN?: string;
  EMAIL_MAX_RECIPIENTS?: string;
  EMAIL_MAX_ATTACHMENT_BYTES?: string;
};

type EmailAddress = string | { email: string; name?: string };

type AttachmentInput = {
  filename: string;
  contentType?: string;
  contentBase64?: string;
  url?: string;
};

type EmailPayload = {
  to: EmailAddress | EmailAddress[];
  cc?: EmailAddress | EmailAddress[];
  bcc?: EmailAddress | EmailAddress[];
  subject: string;
  text?: string;
  html?: string;
  replyTo?: EmailAddress;
  fromName?: string;
  fromEmail?: string;
  headers?: Record<string, string>;
  attachments?: AttachmentInput[];
  listUnsubscribeUrl?: string;
  messageType?: "transactional" | "editorial" | "marketing";
  threadId?: string;
  inReplyTo?: string;
  references?: string;
  validateOnly?: boolean;
};

type GmailApiErrorPayload = {
  error?: {
    code?: number;
    message?: string;
    status?: string;
    details?: unknown[];
  };
};

let cachedAccessToken: { token: string; expiresAt: number; cacheKey: string } | null = null;

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,DELETE,OPTIONS",
  "access-control-allow-headers": "authorization,content-type"
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);
    const origin = `${url.protocol}//${url.host}`;

    try {
      if (url.pathname === "/" || url.pathname === "/health") {
        return json(healthPayload(env, origin));
      }

      if (url.pathname === "/openapi.json") {
        return json(openApiSchema(origin));
      }

      if (url.pathname.startsWith("/actions/")) {
        const authError = requireBearerToken(request, env);
        if (authError) return authError;
        return await handleAction(request, env, url);
      }

      return json({ error: "Not found" }, 404);
    } catch (error) {
      return json(formatError(error), 500);
    }
  }
};

function healthPayload(env: Env, origin: string): Record<string, unknown> {
  const directGmailConfigured = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_REFRESH_TOKEN);
  const crmGatewayConfigured = Boolean(env.CRM_GMAIL_SEND_URL && env.EMAIL_MCP_INTERNAL_TOKEN);
  const missingSecrets = [
    ["EMAIL_MCP_BEARER_TOKEN", env.EMAIL_MCP_BEARER_TOKEN],
    ["GMAIL_SENDER_EMAIL", env.GMAIL_SENDER_EMAIL]
  ]
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (!directGmailConfigured && !crmGatewayConfigured) {
    missingSecrets.push("GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET/GOOGLE_REFRESH_TOKEN or CRM_GMAIL_SEND_URL/EMAIL_MCP_INTERNAL_TOKEN");
  }

  return {
    ok: missingSecrets.length === 0,
    service: "email-mcp",
    mode: "read-write-controlled",
    provider: "gmail-api",
    directGmailConfigured,
    crmGatewayConfigured,
    openapi: `${origin}/openapi.json`,
    missingSecrets
  };
}

function requireBearerToken(request: Request, env: Env): Response | null {
  if (!env.EMAIL_MCP_BEARER_TOKEN) {
    return json({ error: "EMAIL_MCP_BEARER_TOKEN is not configured" }, 503);
  }

  const authorization = request.headers.get("authorization");
  if (authorization === `Bearer ${env.EMAIL_MCP_BEARER_TOKEN}`) {
    return null;
  }

  return json({ error: "Unauthorized" }, 401);
}

async function handleAction(request: Request, env: Env, url: URL): Promise<Response> {
  const path = url.pathname.replace("/actions/", "");

  if (request.method === "GET" && path === "profile") {
    return json(await gmailRequest(env, "GET", "/profile"));
  }

  if (request.method === "POST" && path === "send-email") {
    const payload = await readJson<EmailPayload>(request);
    return json(await sendEmail(env, payload));
  }

  if (request.method === "POST" && path === "create-draft") {
    const payload = await readJson<EmailPayload>(request);
    return json(await createDraft(env, payload));
  }

  if (request.method === "POST" && path === "send-draft") {
    const payload = await readJson<{ draftId: string; validateOnly?: boolean }>(request);
    if (payload.validateOnly !== false) {
      return json({ ok: true, validateOnly: true, wouldSendDraftId: payload.draftId });
    }
    return json(await gmailRequest(env, "POST", "/drafts/send", undefined, { id: payload.draftId }));
  }

  if (request.method === "GET" && path === "list-drafts") {
    return json(await gmailRequest(env, "GET", "/drafts", queryFromUrl(url, ["maxResults", "pageToken", "q"])));
  }

  if (request.method === "GET" && path === "get-draft") {
    const id = requireQuery(url, "id");
    return json(await gmailRequest(env, "GET", `/drafts/${encodeURIComponent(id)}`, queryFromUrl(url, ["format"])));
  }

  if (request.method === "POST" && path === "delete-draft") {
    const payload = await readJson<{ draftId: string; validateOnly?: boolean }>(request);
    if (payload.validateOnly !== false) {
      return json({ ok: true, validateOnly: true, wouldDeleteDraftId: payload.draftId });
    }
    await gmailRequest(env, "DELETE", `/drafts/${encodeURIComponent(payload.draftId)}`);
    return json({ ok: true, deletedDraftId: payload.draftId });
  }

  if (request.method === "GET" && path === "list-messages") {
    return json(await gmailRequest(env, "GET", "/messages", queryFromUrl(url, ["maxResults", "pageToken", "q", "labelIds", "includeSpamTrash"])));
  }

  if (request.method === "GET" && path === "get-message") {
    const id = requireQuery(url, "id");
    return json(await gmailRequest(env, "GET", `/messages/${encodeURIComponent(id)}`, queryFromUrl(url, ["format", "metadataHeaders"])));
  }

  if (request.method === "POST" && path === "reply") {
    const payload = await readJson<EmailPayload & { originalMessageId: string }>(request);
    return json(await replyToMessage(env, payload));
  }

  if (request.method === "POST" && path === "forward") {
    const payload = await readJson<EmailPayload & { originalMessageId: string }>(request);
    return json(await forwardMessage(env, payload));
  }

  if (request.method === "POST" && path === "trash-message") {
    const payload = await readJson<{ messageId: string; validateOnly?: boolean }>(request);
    if (payload.validateOnly !== false) {
      return json({ ok: true, validateOnly: true, wouldTrashMessageId: payload.messageId });
    }
    return json(await gmailRequest(env, "POST", `/messages/${encodeURIComponent(payload.messageId)}/trash`));
  }

  if (request.method === "POST" && path === "gmail-request") {
    const payload = await readJson<{
      method: "GET" | "POST" | "DELETE";
      path: string;
      query?: Record<string, string | number | boolean | string[]>;
      body?: unknown;
      validateOnly?: boolean;
    }>(request);
    const writeMethod = payload.method !== "GET";
    if (writeMethod && payload.validateOnly !== false) {
      return json({ ok: true, validateOnly: true, wouldCall: { method: payload.method, path: payload.path, query: payload.query, body: payload.body } });
    }
    return json(await gmailRequest(env, payload.method, payload.path, payload.query, payload.body));
  }

  return json({ error: "Unknown action" }, 404);
}

async function sendEmail(env: Env, payload: EmailPayload): Promise<Record<string, unknown>> {
  const prepared = await prepareEmail(env, payload);
  if (payload.validateOnly !== false) {
    return {
      ok: true,
      validateOnly: true,
      preview: prepared.preview
    };
  }

  const result = await gmailRequest(env, "POST", "/messages/send", undefined, {
    raw: prepared.raw,
    threadId: payload.threadId
  }).catch(async (error) => {
    if (!env.CRM_GMAIL_SEND_URL || !env.EMAIL_MCP_INTERNAL_TOKEN) {
      throw error;
    }
    return sendViaCrmGmailGateway(env, payload);
  });
  return { ok: true, result };
}

async function sendViaCrmGmailGateway(env: Env, payload: EmailPayload): Promise<unknown> {
  if (!env.CRM_GMAIL_SEND_URL || !env.EMAIL_MCP_INTERNAL_TOKEN) {
    throw new Error("CRM Gmail gateway is not configured");
  }

  const to = normalizeAddresses(payload.to);
  if (to.length !== 1 || normalizeAddresses(payload.cc).length || normalizeAddresses(payload.bcc).length || payload.attachments?.length) {
    throw new Error("CRM Gmail gateway supports one recipient and no attachments; configure Google OAuth secrets on email-mcp for advanced sends");
  }

  const response = await fetch(env.CRM_GMAIL_SEND_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-internal-token": env.EMAIL_MCP_INTERNAL_TOKEN
    },
    body: JSON.stringify({
      to: to[0],
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
      replyTo: payload.replyTo ? formatAddress(payload.replyTo) : undefined,
      listUnsubscribeUrl: payload.messageType === "marketing" ? payload.listUnsubscribeUrl : undefined,
      headers: payload.headers
    })
  });

  const text = await response.text();
  const parsed = parseMaybeJson(text);
  if (!response.ok) {
    return { ok: false, status: response.status, crmError: parsed ?? text };
  }
  return parsed ?? { ok: true };
}

async function createDraft(env: Env, payload: EmailPayload): Promise<Record<string, unknown>> {
  const prepared = await prepareEmail(env, payload);
  if (payload.validateOnly !== false) {
    return {
      ok: true,
      validateOnly: true,
      preview: prepared.preview
    };
  }

  const result = await gmailRequest(env, "POST", "/drafts", undefined, {
    message: {
      raw: prepared.raw,
      threadId: payload.threadId
    }
  });
  return { ok: true, result };
}

async function replyToMessage(env: Env, payload: EmailPayload & { originalMessageId: string }): Promise<Record<string, unknown>> {
  const original = await gmailRequest(env, "GET", `/messages/${encodeURIComponent(payload.originalMessageId)}`, {
    format: "metadata",
    metadataHeaders: ["Subject", "From", "To", "Cc", "Message-ID", "References"]
  }) as { threadId?: string; payload?: { headers?: Array<{ name: string; value: string }> } };

  const headers = headersToMap(original.payload?.headers ?? []);
  const originalSubject = headers.subject ?? "";
  const subject = payload.subject || (originalSubject.toLowerCase().startsWith("re:") ? originalSubject : `Re: ${originalSubject}`);

  return sendEmail(env, {
    ...payload,
    subject,
    threadId: payload.threadId ?? original.threadId,
    inReplyTo: payload.inReplyTo ?? headers["message-id"],
    references: payload.references ?? [headers.references, headers["message-id"]].filter(Boolean).join(" ")
  });
}

async function forwardMessage(env: Env, payload: EmailPayload & { originalMessageId: string }): Promise<Record<string, unknown>> {
  const original = await gmailRequest(env, "GET", `/messages/${encodeURIComponent(payload.originalMessageId)}`, {
    format: "metadata",
    metadataHeaders: ["Subject", "From", "Date"]
  }) as { payload?: { headers?: Array<{ name: string; value: string }> } };

  const headers = headersToMap(original.payload?.headers ?? []);
  const prefix = [
    "",
    "",
    "---------- Forwarded message ---------",
    `From: ${headers.from ?? ""}`,
    `Date: ${headers.date ?? ""}`,
    `Subject: ${headers.subject ?? ""}`
  ].join("\n");

  const subject = payload.subject || `Fwd: ${headers.subject ?? ""}`;
  return sendEmail(env, {
    ...payload,
    subject,
    text: `${payload.text ?? stripHtml(payload.html ?? "")}${prefix}`,
    html: payload.html
  });
}

async function prepareEmail(env: Env, payload: EmailPayload): Promise<{ raw: string; mime: string; preview: Record<string, unknown> }> {
  validateRequiredEmailPayload(env, payload);

  const normalized = await normalizeEmail(env, payload);
  const { mime, raw } = buildMimeMessage(normalized);

  return {
    raw,
    mime,
    preview: {
      from: normalized.from,
      to: normalized.to,
      cc: normalized.cc,
      bcc: normalized.bcc,
      subject: normalized.subject,
      hasHtml: Boolean(normalized.html),
      hasText: Boolean(normalized.text),
      attachmentCount: normalized.attachments.length,
      attachmentNames: normalized.attachments.map((attachment) => attachment.filename),
      rawBytes: new TextEncoder().encode(mime).byteLength,
      threadId: normalized.threadId
    }
  };
}

function validateRequiredEmailPayload(env: Env, payload: EmailPayload): void {
  if (!env.GMAIL_SENDER_EMAIL) {
    throw new Error("GMAIL_SENDER_EMAIL is not configured");
  }

  if (!payload.to || countAddresses(payload.to) === 0) {
    throw new Error("At least one recipient is required");
  }

  if (!payload.subject) {
    throw new Error("subject is required");
  }

  if (!payload.text && !payload.html) {
    throw new Error("text or html is required");
  }

  const maxRecipients = Number(env.EMAIL_MAX_RECIPIENTS ?? "50");
  const recipientCount = countAddresses(payload.to) + countAddresses(payload.cc) + countAddresses(payload.bcc);
  if (recipientCount > maxRecipients) {
    throw new Error(`Recipient limit exceeded: ${recipientCount}/${maxRecipients}`);
  }

  if (payload.fromEmail && payload.fromEmail.toLowerCase() !== env.GMAIL_SENDER_EMAIL.toLowerCase()) {
    throw new Error("fromEmail must match GMAIL_SENDER_EMAIL");
  }
}

async function normalizeEmail(env: Env, payload: EmailPayload): Promise<{
  from: string;
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  headers: Record<string, string>;
  attachments: Array<{ filename: string; contentType: string; contentBase64: string; byteLength: number }>;
  threadId?: string;
}> {
  const attachments = await normalizeAttachments(env, payload.attachments ?? []);
  return {
    from: formatAddress({ email: env.GMAIL_SENDER_EMAIL!, name: payload.fromName || env.GMAIL_SENDER_NAME || "Cuiabar" }),
    to: normalizeAddresses(payload.to),
    cc: normalizeAddresses(payload.cc),
    bcc: normalizeAddresses(payload.bcc),
    subject: payload.subject,
    text: payload.text || stripHtml(payload.html || ""),
    html: payload.html,
    replyTo: payload.replyTo ? formatAddress(payload.replyTo) : env.DEFAULT_REPLY_TO,
    headers: cleanHeaders({
      ...(payload.headers ?? {}),
      ...(payload.listUnsubscribeUrl ? {
        "List-Unsubscribe": `<${payload.listUnsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click"
      } : {}),
      ...(payload.inReplyTo ? { "In-Reply-To": payload.inReplyTo } : {}),
      ...(payload.references ? { References: payload.references } : {})
    }),
    attachments,
    threadId: payload.threadId
  };
}

async function normalizeAttachments(
  env: Env,
  attachments: AttachmentInput[]
): Promise<Array<{ filename: string; contentType: string; contentBase64: string; byteLength: number }>> {
  const maxBytes = Number(env.EMAIL_MAX_ATTACHMENT_BYTES ?? "10485760");
  let totalBytes = 0;
  const normalized = [];

  for (const attachment of attachments) {
    if (!attachment.filename) {
      throw new Error("Attachment filename is required");
    }
    if (attachment.contentBase64 && attachment.url) {
      throw new Error(`Attachment ${attachment.filename} must use contentBase64 or url, not both`);
    }

    let contentBase64 = attachment.contentBase64;
    let byteLength = estimateBase64ByteLength(contentBase64 ?? "");
    let contentType = attachment.contentType || "application/octet-stream";

    if (attachment.url) {
      if (!attachment.url.startsWith("https://")) {
        throw new Error(`Attachment URL must be HTTPS: ${attachment.filename}`);
      }
      const response = await fetch(attachment.url);
      if (!response.ok) {
        throw new Error(`Attachment fetch failed: ${attachment.filename} ${response.status}`);
      }
      const bytes = new Uint8Array(await response.arrayBuffer());
      byteLength = bytes.byteLength;
      contentBase64 = toBase64(bytes);
      contentType = response.headers.get("content-type")?.split(";")[0] || contentType;
    }

    if (!contentBase64) {
      throw new Error(`Attachment ${attachment.filename} requires contentBase64 or url`);
    }

    totalBytes += byteLength;
    if (totalBytes > maxBytes) {
      throw new Error(`Attachment limit exceeded: ${totalBytes}/${maxBytes} bytes`);
    }

    normalized.push({
      filename: attachment.filename,
      contentType,
      contentBase64: stripBase64Prefix(contentBase64),
      byteLength
    });
  }

  return normalized;
}

function buildMimeMessage(payload: Awaited<ReturnType<typeof normalizeEmail>>): { mime: string; raw: string } {
  const headers = [
    `From: ${payload.from}`,
    `To: ${payload.to.join(", ")}`,
    payload.cc.length ? `Cc: ${payload.cc.join(", ")}` : null,
    payload.bcc.length ? `Bcc: ${payload.bcc.join(", ")}` : null,
    payload.replyTo ? `Reply-To: ${payload.replyTo}` : null,
    `Subject: ${encodeMimeHeader(payload.subject)}`,
    "MIME-Version: 1.0",
    ...Object.entries(payload.headers).map(([key, value]) => `${key}: ${foldHeaderValue(value)}`)
  ].filter(Boolean) as string[];

  if (payload.attachments.length === 0) {
    return buildBodyOnlyMime(headers, payload);
  }

  const mixedBoundary = boundary("mixed");
  const alternative = buildAlternativePart(payload);
  const attachmentParts = payload.attachments.flatMap((attachment) => [
    `--${mixedBoundary}`,
    `Content-Type: ${attachment.contentType}; name="${escapeQuoted(attachment.filename)}"`,
    "Content-Transfer-Encoding: base64",
    `Content-Disposition: attachment; filename="${escapeQuoted(attachment.filename)}"`,
    "",
    wrapBase64Lines(stripBase64Prefix(attachment.contentBase64)),
    ""
  ]);

  const mime = [
    ...headers,
    `Content-Type: multipart/mixed; boundary="${mixedBoundary}"`,
    "",
    `--${mixedBoundary}`,
    alternative.contentType,
    "",
    alternative.body,
    "",
    ...attachmentParts,
    `--${mixedBoundary}--`,
    ""
  ].join("\r\n");

  return { mime, raw: base64UrlEncode(new TextEncoder().encode(mime)) };
}

function buildBodyOnlyMime(headers: string[], payload: Awaited<ReturnType<typeof normalizeEmail>>): { mime: string; raw: string } {
  const alternative = buildAlternativePart(payload);
  const mime = [
    ...headers,
    alternative.contentType,
    "",
    alternative.body,
    ""
  ].join("\r\n");

  return { mime, raw: base64UrlEncode(new TextEncoder().encode(mime)) };
}

function buildAlternativePart(payload: Awaited<ReturnType<typeof normalizeEmail>>): { contentType: string; body: string } {
  if (!payload.html) {
    return {
      contentType: 'Content-Type: text/plain; charset="UTF-8"\r\nContent-Transfer-Encoding: base64',
      body: wrapBase64Lines(toBase64(new TextEncoder().encode(payload.text)))
    };
  }

  const alternativeBoundary = boundary("alt");
  return {
    contentType: `Content-Type: multipart/alternative; boundary="${alternativeBoundary}"`,
    body: [
      `--${alternativeBoundary}`,
      'Content-Type: text/plain; charset="UTF-8"',
      "Content-Transfer-Encoding: base64",
      "",
      wrapBase64Lines(toBase64(new TextEncoder().encode(payload.text))),
      "",
      `--${alternativeBoundary}`,
      'Content-Type: text/html; charset="UTF-8"',
      "Content-Transfer-Encoding: base64",
      "",
      wrapBase64Lines(toBase64(new TextEncoder().encode(payload.html))),
      "",
      `--${alternativeBoundary}--`
    ].join("\r\n")
  };
}

async function getGmailAccessToken(env: Env): Promise<string> {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_REFRESH_TOKEN) {
    throw new Error("Google OAuth credentials are not configured");
  }

  const cacheKey = env.GOOGLE_REFRESH_TOKEN.slice(-16);
  if (cachedAccessToken && cachedAccessToken.cacheKey === cacheKey && cachedAccessToken.expiresAt > Date.now() + 60_000) {
    return cachedAccessToken.token;
  }

  const body = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    client_secret: env.GOOGLE_CLIENT_SECRET,
    refresh_token: env.GOOGLE_REFRESH_TOKEN,
    grant_type: "refresh_token"
  });

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: body.toString()
  });

  if (!response.ok) {
    throw new Error(`Gmail OAuth refresh failed: ${response.status} ${(await response.text()).slice(0, 500)}`);
  }

  const payload = await response.json() as { access_token: string; expires_in: number };
  cachedAccessToken = {
    token: payload.access_token,
    expiresAt: Date.now() + payload.expires_in * 1000,
    cacheKey
  };
  return payload.access_token;
}

async function gmailRequest(
  env: Env,
  method: "GET" | "POST" | "DELETE",
  path: string,
  query?: Record<string, string | number | boolean | string[]>,
  body?: unknown
): Promise<unknown> {
  const accessToken = await getGmailAccessToken(env);
  const safePath = normalizeGmailPath(path);
  const url = new URL(`https://gmail.googleapis.com/gmail/v1/users/me${safePath}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (Array.isArray(value)) {
      for (const item of value) url.searchParams.append(key, String(item));
    } else if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
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
    const gmailError = parsed as GmailApiErrorPayload;
    return {
      ok: false,
      status: response.status,
      googleError: gmailError.error ?? parsed ?? text
    };
  }

  return parsed ?? { ok: true };
}

function normalizeGmailPath(path: string): string {
  const cleanPath = path.trim();
  if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
    throw new Error("Use a Gmail API relative path, not a full URL");
  }
  if (cleanPath.includes("..")) {
    throw new Error("Invalid Gmail API path");
  }
  return cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
}

async function readJson<T>(request: Request): Promise<T> {
  try {
    return await request.json() as T;
  } catch {
    throw new Error("Invalid JSON body");
  }
}

function queryFromUrl(url: URL, keys: string[]): Record<string, string | string[]> {
  const result: Record<string, string | string[]> = {};
  for (const key of keys) {
    const values = url.searchParams.getAll(key);
    if (values.length === 1) result[key] = values[0];
    if (values.length > 1) result[key] = values;
  }
  return result;
}

function requireQuery(url: URL, key: string): string {
  const value = url.searchParams.get(key);
  if (!value) throw new Error(`Missing query parameter: ${key}`);
  return value;
}

function normalizeAddresses(value?: EmailAddress | EmailAddress[]): string[] {
  if (!value) return [];
  const addresses = Array.isArray(value) ? value : [value];
  return addresses.map(formatAddress);
}

function formatAddress(value: EmailAddress): string {
  if (typeof value === "string") {
    return value;
  }
  return value.name ? `${encodeMimeHeader(value.name)} <${value.email}>` : value.email;
}

function countAddresses(value?: EmailAddress | EmailAddress[]): number {
  if (!value) return 0;
  return Array.isArray(value) ? value.length : 1;
}

function cleanHeaders(headers: Record<string, string>): Record<string, string> {
  const cleaned: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (!/^[A-Za-z0-9-]+$/.test(key)) {
      throw new Error(`Invalid header name: ${key}`);
    }
    cleaned[key] = value.replace(/[\r\n]+/g, " ").trim();
  }
  return cleaned;
}

function headersToMap(headers: Array<{ name: string; value: string }>): Record<string, string> {
  const map: Record<string, string> = {};
  for (const header of headers) {
    map[header.name.toLowerCase()] = header.value;
  }
  return map;
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function encodeMimeHeader(value: string): string {
  if (/^[\x20-\x7e]*$/.test(value)) return value;
  return `=?UTF-8?B?${toBase64(new TextEncoder().encode(value))}?=`;
}

function foldHeaderValue(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function escapeQuoted(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function boundary(prefix: string): string {
  return `cuiabar_${prefix}_${crypto.randomUUID().replace(/-/g, "")}`;
}

function stripBase64Prefix(value: string): string {
  return value.replace(/^data:[^;]+;base64,/i, "").replace(/\s+/g, "");
}

function estimateBase64ByteLength(value: string): number {
  const clean = stripBase64Prefix(value);
  if (!clean) return 0;
  return Math.floor((clean.length * 3) / 4) - (clean.endsWith("==") ? 2 : clean.endsWith("=") ? 1 : 0);
}

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return btoa(binary);
}

function base64UrlEncode(bytes: Uint8Array): string {
  return toBase64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function wrapBase64Lines(value: string, size = 76): string {
  const clean = stripBase64Prefix(value);
  const lines: string[] = [];
  for (let index = 0; index < clean.length; index += size) {
    lines.push(clean.slice(index, index + size));
  }
  return lines.join("\r\n");
}

function parseMaybeJson(text: string): unknown {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function formatError(error: unknown): Record<string, unknown> {
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
  const emailPayloadRef = { $ref: "#/components/schemas/EmailPayload" };

  return {
    openapi: "3.1.0",
    info: {
      title: "Cuiabar Email MCP Actions",
      version: "0.1.0",
      description: "Gmail API read/write actions for authenticated Cuiabar editors."
    },
    servers: [{ url: origin }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          description: "Use EMAIL_MCP_BEARER_TOKEN as the Bearer token."
        }
      },
      schemas: {
        EmailAddress: {
          oneOf: [
            { type: "string", description: "Plain email address" },
            {
              type: "object",
              additionalProperties: false,
              properties: {
                email: { type: "string" },
                name: { type: "string" }
              },
              required: ["email"]
            }
          ]
        },
        AttachmentInput: {
          type: "object",
          additionalProperties: false,
          properties: {
            filename: { type: "string" },
            contentType: { type: "string" },
            contentBase64: { type: "string", description: "Base64 file content. Data URL prefix is accepted." },
            url: { type: "string", description: "HTTPS URL to fetch as an attachment." }
          },
          required: ["filename"]
        },
        EmailPayload: {
          type: "object",
          additionalProperties: true,
          properties: {
            to: { oneOf: [{ $ref: "#/components/schemas/EmailAddress" }, { type: "array", items: { $ref: "#/components/schemas/EmailAddress" } }] },
            cc: { oneOf: [{ $ref: "#/components/schemas/EmailAddress" }, { type: "array", items: { $ref: "#/components/schemas/EmailAddress" } }] },
            bcc: { oneOf: [{ $ref: "#/components/schemas/EmailAddress" }, { type: "array", items: { $ref: "#/components/schemas/EmailAddress" } }] },
            subject: { type: "string" },
            text: { type: "string" },
            html: { type: "string" },
            replyTo: { $ref: "#/components/schemas/EmailAddress" },
            fromName: { type: "string" },
            fromEmail: { type: "string", description: "Must match the configured sender." },
            headers: { type: "object", additionalProperties: { type: "string" } },
            attachments: { type: "array", items: { $ref: "#/components/schemas/AttachmentInput" } },
            listUnsubscribeUrl: { type: "string" },
            messageType: { type: "string", enum: ["transactional", "editorial", "marketing"], default: "editorial" },
            threadId: { type: "string" },
            inReplyTo: { type: "string" },
            references: { type: "string" },
            validateOnly: { type: "boolean", default: true }
          },
          required: ["to", "subject"]
        }
      }
    },
    paths: {
      "/health": {
        get: {
          operationId: "checkEmailMcpHealth",
          summary: "Check Email MCP health",
          responses: { "200": jsonResponse }
        }
      },
      "/actions/profile": {
        get: {
          operationId: "getEmailProfile",
          summary: "Get Gmail profile for the connected mailbox",
          security,
          responses: { "200": jsonResponse }
        }
      },
      "/actions/send-email": {
        post: {
          operationId: "sendEmail",
          summary: "Validate or send an email",
          security,
          requestBody: { required: true, content: { "application/json": { schema: emailPayloadRef } } },
          responses: { "200": jsonResponse }
        }
      },
      "/actions/create-draft": {
        post: {
          operationId: "createEmailDraft",
          summary: "Validate or create a Gmail draft",
          security,
          requestBody: { required: true, content: { "application/json": { schema: emailPayloadRef } } },
          responses: { "200": jsonResponse }
        }
      },
      "/actions/send-draft": {
        post: {
          operationId: "sendEmailDraft",
          summary: "Validate or send an existing Gmail draft",
          security,
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { draftId: { type: "string" }, validateOnly: { type: "boolean", default: true } },
                  required: ["draftId"]
                }
              }
            }
          },
          responses: { "200": jsonResponse }
        }
      },
      "/actions/list-drafts": {
        get: {
          operationId: "listEmailDrafts",
          summary: "List Gmail drafts",
          security,
          parameters: [
            { name: "maxResults", in: "query", schema: { type: "integer" } },
            { name: "pageToken", in: "query", schema: { type: "string" } },
            { name: "q", in: "query", schema: { type: "string" } }
          ],
          responses: { "200": jsonResponse }
        }
      },
      "/actions/get-draft": {
        get: {
          operationId: "getEmailDraft",
          summary: "Get a Gmail draft",
          security,
          parameters: [
            { name: "id", in: "query", required: true, schema: { type: "string" } },
            { name: "format", in: "query", schema: { type: "string", enum: ["minimal", "full", "raw", "metadata"] } }
          ],
          responses: { "200": jsonResponse }
        }
      },
      "/actions/delete-draft": {
        post: {
          operationId: "deleteEmailDraft",
          summary: "Validate or delete a Gmail draft",
          security,
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { draftId: { type: "string" }, validateOnly: { type: "boolean", default: true } },
                  required: ["draftId"]
                }
              }
            }
          },
          responses: { "200": jsonResponse }
        }
      },
      "/actions/list-messages": {
        get: {
          operationId: "listEmailMessages",
          summary: "List Gmail messages with optional Gmail search query",
          security,
          parameters: [
            { name: "maxResults", in: "query", schema: { type: "integer" } },
            { name: "pageToken", in: "query", schema: { type: "string" } },
            { name: "q", in: "query", schema: { type: "string" } },
            { name: "labelIds", in: "query", schema: { type: "string" } },
            { name: "includeSpamTrash", in: "query", schema: { type: "boolean" } }
          ],
          responses: { "200": jsonResponse }
        }
      },
      "/actions/get-message": {
        get: {
          operationId: "getEmailMessage",
          summary: "Get a Gmail message",
          security,
          parameters: [
            { name: "id", in: "query", required: true, schema: { type: "string" } },
            { name: "format", in: "query", schema: { type: "string", enum: ["minimal", "full", "raw", "metadata"] } },
            { name: "metadataHeaders", in: "query", schema: { type: "string" } }
          ],
          responses: { "200": jsonResponse }
        }
      },
      "/actions/reply": {
        post: {
          operationId: "replyToEmail",
          summary: "Validate or send a reply in a Gmail thread",
          security,
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    emailPayloadRef,
                    { type: "object", properties: { originalMessageId: { type: "string" } }, required: ["originalMessageId"] }
                  ]
                }
              }
            }
          },
          responses: { "200": jsonResponse }
        }
      },
      "/actions/forward": {
        post: {
          operationId: "forwardEmail",
          summary: "Validate or send a forwarded email",
          security,
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    emailPayloadRef,
                    { type: "object", properties: { originalMessageId: { type: "string" } }, required: ["originalMessageId"] }
                  ]
                }
              }
            }
          },
          responses: { "200": jsonResponse }
        }
      },
      "/actions/trash-message": {
        post: {
          operationId: "trashEmailMessage",
          summary: "Validate or move a Gmail message to trash",
          security,
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { messageId: { type: "string" }, validateOnly: { type: "boolean", default: true } },
                  required: ["messageId"]
                }
              }
            }
          },
          responses: { "200": jsonResponse }
        }
      },
      "/actions/gmail-request": {
        post: {
          operationId: "gmailApiRequest",
          summary: "Call a Gmail API users/me relative endpoint with free query/body payload",
          security,
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  additionalProperties: true,
                  properties: {
                    method: { type: "string", enum: ["GET", "POST", "DELETE"] },
                    path: { type: "string", description: "Relative path such as /messages, /drafts, /messages/{id}/modify" },
                    query: { type: "object", additionalProperties: true },
                    body: { type: "object", additionalProperties: true },
                    validateOnly: { type: "boolean", default: true }
                  },
                  required: ["method", "path"]
                }
              }
            }
          },
          responses: { "200": jsonResponse }
        }
      }
    }
  };
}
