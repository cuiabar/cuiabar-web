import type { Env } from '../../types';
import { getZohoAccessToken } from './zohoAuth';

type ZohoUpsertAction = 'insert' | 'update' | 'upsert' | 'unknown';

type ZohoContactPayload = {
  contactId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  source?: string | null;
  tags?: string[];
  status?: string;
  optInStatus?: string;
  notes?: string | null;
};

type ZohoUpsertApiResponse = {
  data?: Array<{
    status?: string;
    code?: string;
    message?: string;
    action?: string;
    details?: {
      id?: string;
      Created_Time?: string;
      Modified_Time?: string;
      Modified_By?: { name?: string; id?: string };
      Created_By?: { name?: string; id?: string };
    };
  }>;
  message?: string;
  error?: string;
};

export type ZohoContactSyncResult = {
  externalId: string;
  action: ZohoUpsertAction;
  message: string | null;
  rawStatus: string | null;
};

const buildLastName = (contact: ZohoContactPayload) => {
  const fromLastName = contact.lastName?.trim();
  if (fromLastName) {
    return fromLastName;
  }

  const fromFirstName = contact.firstName?.trim();
  if (fromFirstName) {
    return fromFirstName;
  }

  return contact.email.split('@')[0].slice(0, 80) || 'Contato Cuiabar';
};

const buildDescription = (contact: ZohoContactPayload) => {
  const lines = [
    `Origem no CRM Cuiabar: ${contact.source?.trim() || 'nao informada'}`,
    `Status interno: ${contact.status || 'active'}`,
    `Opt-in: ${contact.optInStatus || 'confirmed'}`,
    `ID local: ${contact.contactId}`,
  ];

  if (contact.tags && contact.tags.length > 0) {
    lines.push(`Tags: ${contact.tags.join(', ')}`);
  }

  if (contact.notes?.trim()) {
    lines.push(`Notas: ${contact.notes.trim()}`);
  }

  return lines.join('\n');
};

export const upsertZohoContact = async (env: Env, contact: ZohoContactPayload): Promise<ZohoContactSyncResult> => {
  const token = await getZohoAccessToken(env);
  const response = await fetch(`${token.apiDomain}/crm/v8/Contacts/upsert`, {
    method: 'POST',
    headers: {
      Authorization: `Zoho-oauthtoken ${token.accessToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      data: [
        {
          First_Name: contact.firstName?.trim() || undefined,
          Last_Name: buildLastName(contact),
          Email: contact.email,
          Phone: contact.phone?.trim() || undefined,
          Mobile: contact.phone?.trim() || undefined,
          Description: buildDescription(contact),
        },
      ],
      duplicate_check_fields: ['Email'],
      trigger: [],
    }),
  });

  const payload = (await response.json()) as ZohoUpsertApiResponse;
  const result = payload.data?.[0];

  if (!response.ok || !result?.details?.id) {
    const message = result?.message || payload.message || payload.error || response.statusText || 'Zoho nao confirmou o upsert do contato.';
    throw new Error(`Falha ao sincronizar contato no Zoho: ${message}`);
  }

  const normalizedAction = (() => {
    const action = (result.action || '').toLowerCase();
    if (action === 'insert' || action === 'update' || action === 'upsert') {
      return action;
    }
    return 'unknown';
  })();

  return {
    externalId: result.details.id,
    action: normalizedAction,
    message: result.message || null,
    rawStatus: result.status || null,
  };
};
