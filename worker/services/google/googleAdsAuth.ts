import type { Env } from '../../types';

let cachedAdsToken: { token: string; expiresAt: number; cacheKey: string } | null = null;

const pick = (...values: Array<string | undefined>) => values.find((value) => value?.trim())?.trim() || '';

export const getGoogleAdsClientId = (env: Env) => pick(env.GOOGLE_ADS_CLIENT_ID, env.GOOGLE_CLIENT_ID);
export const getGoogleAdsClientSecret = (env: Env) => pick(env.GOOGLE_ADS_CLIENT_SECRET, env.GOOGLE_CLIENT_SECRET);
export const getGoogleAdsRefreshToken = (env: Env) => pick(env.GOOGLE_ADS_REFRESH_TOKEN, env.GOOGLE_REFRESH_TOKEN);

export const isGoogleAdsConfigured = (env: Env) =>
  Boolean(env.GOOGLE_ADS_DEVELOPER_TOKEN?.trim() && getGoogleAdsClientId(env) && getGoogleAdsClientSecret(env) && getGoogleAdsRefreshToken(env));

export const getGoogleAdsAccessToken = async (env: Env) => {
  const clientId = getGoogleAdsClientId(env);
  const clientSecret = getGoogleAdsClientSecret(env);
  const refreshToken = getGoogleAdsRefreshToken(env);

  if (!env.GOOGLE_ADS_DEVELOPER_TOKEN?.trim()) {
    throw new Error('Google Ads ainda nao esta configurado com developer token.');
  }

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Credenciais OAuth do Google Ads ainda nao foram configuradas.');
  }

  const cacheKey = `${clientId}:${refreshToken.slice(-12)}`;
  if (cachedAdsToken && cachedAdsToken.cacheKey === cacheKey && cachedAdsToken.expiresAt > Date.now() + 60_000) {
    return cachedAdsToken.token;
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }).toString(),
  });

  const payload = (await response.json().catch(() => ({}))) as { access_token?: string; expires_in?: number; error?: string; error_description?: string };
  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error_description || payload.error || `Falha ao renovar token do Google Ads (${response.status}).`);
  }

  cachedAdsToken = {
    token: payload.access_token,
    expiresAt: Date.now() + (payload.expires_in ?? 3600) * 1000,
    cacheKey,
  };

  return payload.access_token;
};
