export interface MimePayload {
  fromName: string;
  fromEmail: string;
  to: string;
  subject: string;
  replyTo?: string | null;
  html: string;
  text: string;
  listUnsubscribeUrl: string;
  headers?: Record<string, string>;
}

const encodeHeader = (value: string) => `=?UTF-8?B?${btoa(unescape(encodeURIComponent(value)))}?=`;

const base64Url = (value: string) =>
  btoa(value)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');

export const buildMimeMessage = (payload: MimePayload) => {
  const boundary = `crm_${crypto.randomUUID().replace(/-/g, '')}`;
  const headers = [
    `From: ${encodeHeader(payload.fromName)} <${payload.fromEmail}>`,
    `To: ${payload.to}`,
    payload.replyTo ? `Reply-To: ${payload.replyTo}` : null,
    `Subject: ${encodeHeader(payload.subject)}`,
    'MIME-Version: 1.0',
    `List-Unsubscribe: <${payload.listUnsubscribeUrl}>`,
    'List-Unsubscribe-Post: List-Unsubscribe=One-Click',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    ...Object.entries(payload.headers ?? {}).map(([key, value]) => `${key}: ${value}`),
  ].filter(Boolean);

  const mime = [
    ...headers,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 7bit',
    '',
    payload.text,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: 7bit',
    '',
    payload.html,
    '',
    `--${boundary}--`,
    '',
  ].join('\r\n');

  return {
    raw: base64Url(mime),
    mime,
  };
};
