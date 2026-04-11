const META_DEFAULT_API_VERSION = 'v22.0';

const json = (body, init = {}) =>
  new Response(JSON.stringify(body), {
    headers: {
      'content-type': 'application/json; charset=UTF-8',
    },
    ...init,
  });

const isRecord = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);

const pruneRecord = (record) =>
  Object.fromEntries(
    Object.entries(record).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  );

const getCookieValue = (cookieHeader, name) => {
  if (!cookieHeader) {
    return undefined;
  }

  const match = cookieHeader.match(new RegExp(`(?:^|; )${name}=([^;]*)`));

  return match ? decodeURIComponent(match[1]) : undefined;
};

const isSha256 = (value) => /^[a-f0-9]{64}$/i.test(value);

const sha256 = async (value) => {
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', encoded);

  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
};

const normalizeEmail = (value) => value.trim().toLowerCase();
const normalizePhone = (value) => value.replace(/\D+/g, '');

const normalizeHashedField = async (value, normalize) => {
  if (typeof value !== 'string' || !value.trim()) {
    return undefined;
  }

  const trimmed = value.trim().toLowerCase();

  if (isSha256(trimmed)) {
    return trimmed;
  }

  return sha256(normalize(value));
};

const withCors = (request, response) => {
  const origin = request.headers.get('origin');

  if (!origin) {
    return response;
  }

  response.headers.set('access-control-allow-origin', origin);
  response.headers.set('vary', 'Origin');

  return response;
};

export const onRequestOptions = async (context) =>
  withCors(
    context.request,
    new Response(null, {
      status: 204,
      headers: {
        'access-control-allow-methods': 'POST, OPTIONS',
        'access-control-allow-headers': 'content-type',
      },
    }),
  );

export const onRequestGet = async (context) => {
  const { request, env } = context;
  const pixelId = typeof env.META_PIXEL_ID === 'string' ? env.META_PIXEL_ID.trim() : '';
  const apiVersion = env.META_GRAPH_API_VERSION || META_DEFAULT_API_VERSION;

  return withCors(
    request,
    json({
      ok: true,
      configured: Boolean(env.META_CAPI_TOKEN && pixelId),
      transport: 'cloudflare-pages-function',
      endpoint: '/api/meta-conversions',
      api_version: apiVersion,
      pixel_id_hint: pixelId ? `...${pixelId.slice(-4)}` : null,
    }),
  );
};

export const onRequestPost = async (context) => {
  const { request, env } = context;

  if (!env.META_CAPI_TOKEN || !env.META_PIXEL_ID) {
    return withCors(request, json({ ok: false, error: 'Meta CAPI not configured.' }, { status: 503 }));
  }

  let payload;

  try {
    payload = await request.json();
  } catch {
    return withCors(request, json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 }));
  }

  if (!isRecord(payload) || typeof payload.event_name !== 'string' || !payload.event_name.trim()) {
    return withCors(request, json({ ok: false, error: 'Missing event_name.' }, { status: 400 }));
  }

  const userDataInput = isRecord(payload.user_data) ? payload.user_data : {};
  const customData = isRecord(payload.custom_data) ? payload.custom_data : undefined;
  const cookieHeader = request.headers.get('cookie');
  const clientIpAddress =
    request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
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
    event_name: payload.event_name.trim(),
    event_time: Number.isFinite(payload.event_time) ? Math.floor(payload.event_time) : Math.floor(Date.now() / 1000),
    event_id:
      typeof payload.event_id === 'string' && payload.event_id.trim()
        ? payload.event_id.trim()
        : `srv_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    action_source: typeof payload.action_source === 'string' && payload.action_source.trim() ? payload.action_source.trim() : 'website',
    event_source_url:
      typeof payload.event_source_url === 'string' && payload.event_source_url.trim()
        ? payload.event_source_url.trim()
        : request.headers.get('origin') ?? undefined,
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

  const apiVersion = env.META_GRAPH_API_VERSION || META_DEFAULT_API_VERSION;
  const graphUrl = new URL(`https://graph.facebook.com/${apiVersion}/${env.META_PIXEL_ID}/events`);
  graphUrl.searchParams.set('access_token', env.META_CAPI_TOKEN);

  const requestBody = {
    data: [event],
    partner_agent: 'cuiabar-site-cloudflare',
  };

  if (typeof payload.test_event_code === 'string' && payload.test_event_code.trim()) {
    requestBody.test_event_code = payload.test_event_code.trim();
  }

  const metaResponse = await fetch(graphUrl.toString(), {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  const metaText = await metaResponse.text();

  if (!metaResponse.ok) {
    return withCors(
      request,
      json(
        {
          ok: false,
          status: metaResponse.status,
          error: 'Meta Conversions API request failed.',
          details: metaText.slice(0, 1000),
        },
        { status: 502 },
      ),
    );
  }

  return withCors(request, json({ ok: true, forwarded: true, event_name: event.event_name }, { status: 202 }));
};
