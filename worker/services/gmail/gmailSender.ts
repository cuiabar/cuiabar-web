import type { Env } from '../../types';
import { getGmailAccessToken } from './gmailAuth';
import { buildMimeMessage, type MimePayload } from './mimeBuilder';

export interface GmailSendResult {
  id: string;
  threadId?: string;
}

export const sendViaGmail = async (env: Env, payload: MimePayload): Promise<GmailSendResult> => {
  const accessToken = await getGmailAccessToken(env);
  const { raw } = buildMimeMessage(payload);
  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ raw }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Falha no envio via Gmail API: ${response.status} ${text.slice(0, 500)}`);
  }

  return (await response.json()) as GmailSendResult;
};
