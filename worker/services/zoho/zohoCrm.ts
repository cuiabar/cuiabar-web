import type { Env } from '../../types';
import { getZohoAccessToken } from './zohoAuth';

type ZohoOrgApiRecord = {
  id?: string | number;
  company_name?: string;
  companyname?: string;
  primary_email?: string;
  primaryemail?: string;
  employee_count?: string | number;
  country?: string;
  website?: string;
  currency?: string;
  time_zone?: string;
  gapps_enabled?: boolean;
};

type ZohoOrgApiResponse = {
  org?: ZohoOrgApiRecord[];
  error?: string;
  message?: string;
};

export type ZohoOrganization = {
  id: string | null;
  companyName: string | null;
  primaryEmail: string | null;
  employeeCount: string | number | null;
  country: string | null;
  website: string | null;
  currency: string | null;
  timeZone: string | null;
  gappsEnabled: boolean | null;
};

export const getZohoOrganization = async (env: Env): Promise<{ organization: ZohoOrganization; scope: string | null; apiDomain: string }> => {
  const token = await getZohoAccessToken(env);
  const response = await fetch(`${token.apiDomain}/crm/v8/org`, {
    headers: {
      Authorization: `Zoho-oauthtoken ${token.accessToken}`,
    },
  });
  const payload = (await response.json()) as ZohoOrgApiResponse;

  if (!response.ok || !payload.org?.[0]) {
    const message = payload.message || payload.error || response.statusText || 'Zoho nao retornou os dados da organizacao.';
    throw new Error(`Falha ao consultar a organizacao no Zoho: ${message}`);
  }

  const org = payload.org[0];
  return {
    apiDomain: token.apiDomain,
    scope: token.scope,
    organization: {
      id: org.id ? String(org.id) : null,
      companyName: org.company_name || org.companyname || null,
      primaryEmail: org.primary_email || org.primaryemail || null,
      employeeCount: org.employee_count ?? null,
      country: org.country || null,
      website: org.website || null,
      currency: org.currency || null,
      timeZone: org.time_zone || null,
      gappsEnabled: typeof org.gapps_enabled === 'boolean' ? org.gapps_enabled : null,
    },
  };
};
