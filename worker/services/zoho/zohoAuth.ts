import type { Env } from '../../types';

type ZohoTokenResponse = {
  access_token?: string;
  api_domain?: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
  error?: string;
  error_description?: string;
};

const normalizeBaseUrl = (value: string | undefined, fallback: string) => {
  const normalized = (value || fallback).trim();
  return normalized.replace(/\/+$/, '');
};

export const getZohoAccountsDomain = (env: Env) => normalizeBaseUrl(env.ZOHO_ACCOUNTS_DOMAIN, 'https://accounts.zoho.com');

export const getZohoApiDomain = (env: Env, apiDomain?: string | null) => normalizeBaseUrl(apiDomain || env.ZOHO_API_DOMAIN, 'https://www.zohoapis.com');

export const isZohoConfigured = (env: Env) => Boolean(env.ZOHO_CLIENT_ID && env.ZOHO_CLIENT_SECRET && env.ZOHO_REFRESH_TOKEN);

export const getZohoAccessToken = async (env: Env) => {
  if (!isZohoConfigured(env)) {
    throw new Error('Credenciais OAuth do Zoho ainda nao foram configuradas.');
  }

  const response = await fetch(`${getZohoAccountsDomain(env)}/oauth/v2/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.ZOHO_CLIENT_ID || '',
      client_secret: env.ZOHO_CLIENT_SECRET || '',
      refresh_token: env.ZOHO_REFRESH_TOKEN || '',
      grant_type: 'refresh_token',
    }).toString(),
  });

  const payload = (await response.json()) as ZohoTokenResponse;
  if (!response.ok || !payload.access_token) {
    const message = payload.error_description || payload.error || response.statusText || 'Zoho recusou a renovacao do token.';
    throw new Error(`Falha ao renovar token do Zoho: ${message}`);
  }

  return {
    accessToken: payload.access_token,
    apiDomain: getZohoApiDomain(env, payload.api_domain),
    scope: payload.scope || null,
    expiresIn: payload.expires_in ?? null,
    tokenType: payload.token_type || 'Zoho-oauthtoken',
  };
};
