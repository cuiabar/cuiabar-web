import type { Env } from './index';

export const sendEmailViaInternalApi = async (
  env: Env,
  payload: { to: string; subject: string; html: string },
) => {
  const response = await fetch(`${env.CRM_INTERNAL_API_BASE}/api/internal/gmail/send`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'x-internal-secret': env.CRM_INTERNAL_SECRET,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Falha no envio de e-mail interno. status=${response.status}`);
  }
};
