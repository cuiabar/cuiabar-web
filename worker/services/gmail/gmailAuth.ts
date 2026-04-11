import type { Env } from '../../types';
import { first, parseJsonText } from '../../lib/db';

let cachedAccessToken: { token: string; expiresAt: number; cacheKey: string } | null = null;

type StoredGmailOAuthConnection = {
  email?: string;
  refreshToken?: string;
  scope?: string | null;
  grantedAt?: string | null;
};

const readStoredRefreshToken = async (env: Env) => {
  for (const key of ['gmail_oauth_connection', 'gmail_oauth_pending']) {
    const row = await first<{ value_json: string }>(env.DB.prepare('SELECT value_json FROM app_settings WHERE key = ?').bind(key));
    const stored = row ? parseJsonText<StoredGmailOAuthConnection | null>(row.value_json, null) : null;
    if (stored?.refreshToken) {
      return stored;
    }
  }

  return null;
};

export const getGoogleAccessToken = async (env: Env) => {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    throw new Error('Credenciais do Gmail OAuth nao configuradas.');
  }

  const storedConnection = await readStoredRefreshToken(env);
  const refreshToken = storedConnection?.refreshToken || env.GOOGLE_REFRESH_TOKEN;

  if (!refreshToken) {
    throw new Error('Refresh token do Gmail ainda nao foi autorizado.');
  }

  const cacheKey = `${storedConnection?.grantedAt ?? 'env'}:${refreshToken.slice(-12)}`;

  if (cachedAccessToken && cachedAccessToken.cacheKey === cacheKey && cachedAccessToken.expiresAt > Date.now() + 60_000) {
    return cachedAccessToken.token;
  }

  const body = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    client_secret: env.GOOGLE_CLIENT_SECRET,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Falha ao renovar token do Gmail: ${response.status} ${text.slice(0, 300)}`);
  }

  const payload = (await response.json()) as {
    access_token: string;
    expires_in: number;
  };

  cachedAccessToken = {
    token: payload.access_token,
    expiresAt: Date.now() + payload.expires_in * 1000,
    cacheKey,
  };

  return payload.access_token;
};

export const getGmailAccessToken = getGoogleAccessToken;
