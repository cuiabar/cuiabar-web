import { sendEmailViaInternalApi } from './gmailService';
import type { Env } from './index';
import type { CustomerContext, LlamaAction } from './types';

type ExecutionContext = {
  phone: string;
  customer: CustomerContext;
  originalMessage: string;
  modelResponse: string;
};

const asText = (value: unknown, fallback = '') => (typeof value === 'string' ? value.trim() : fallback);
const asPositiveInt = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0;
};

const queueReservationRequest = async (env: Env, context: ExecutionContext, action: Extract<LlamaAction, { type: 'create_reservation_request' }>) => {
  const data = action.data || {};

  await env.DB.prepare(
    `INSERT INTO wa_reservation_requests (
      id,
      phone,
      customer_name,
      requested_date,
      requested_time,
      requested_people,
      notes,
      status,
      source,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'queued', 'llama', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
  )
    .bind(
      crypto.randomUUID(),
      context.phone,
      context.customer.name || 'Cliente',
      asText(data.date) || null,
      asText(data.time) || null,
      asPositiveInt(data.people) || null,
      asText(data.notes) || context.originalMessage,
    )
    .run();
};

const addLoyaltyPoints = async (env: Env, phone: string, action: Extract<LlamaAction, { type: 'add_loyalty_points' }>) => {
  const points = asPositiveInt(action.data?.points);
  if (!points) {
    return;
  }

  await env.DB.prepare(
    `UPDATE customers
     SET loyalty_points = loyalty_points + ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE phone = ?`,
  )
    .bind(points, phone)
    .run();
};

const sendEmailConfirmation = async (
  env: Env,
  customer: CustomerContext,
  action: Extract<LlamaAction, { type: 'send_email_confirmation' }>,
) => {
  if (!customer.email) {
    return;
  }

  const subject = asText(action.data?.subject, 'Confirmacao Cuiabar');
  const html = asText(action.data?.html, '<p>Sua solicitacao foi recebida pela equipe do Cuiabar.</p>');

  await sendEmailViaInternalApi(env, {
    to: customer.email,
    subject,
    html,
  });
};

const notifyTeam = async (env: Env, context: ExecutionContext, action: Extract<LlamaAction, { type: 'notify_team' }>) => {
  const message = asText(action.data?.message, context.modelResponse);

  await sendEmailViaInternalApi(env, {
    to: 'gerencia@cuiabar.com',
    subject: 'Notificacao WhatsApp Intelligence',
    html: `<p><strong>Telefone:</strong> ${context.phone}</p><p>${message}</p>`,
  });
};

export async function executeCrmCommands(actions: LlamaAction[], env: Env, context: ExecutionContext) {
  for (const action of actions) {
    try {
      if (action.type === 'create_reservation_request') {
        await queueReservationRequest(env, context, action);
      }

      if (action.type === 'add_loyalty_points') {
        await addLoyaltyPoints(env, context.phone, action);
      }

      if (action.type === 'send_email_confirmation') {
        await sendEmailConfirmation(env, context.customer, action);
      }

      if (action.type === 'notify_team') {
        await notifyTeam(env, context, action);
      }

      await env.DB.prepare(
        `INSERT INTO wa_action_logs (
          id,
          phone,
          action_type,
          action_payload,
          status,
          created_at
        ) VALUES (?, ?, ?, ?, 'success', CURRENT_TIMESTAMP)`,
      )
        .bind(crypto.randomUUID(), context.phone, action.type, JSON.stringify(action.data || {}))
        .run();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown_error';
      await env.DB.prepare(
        `INSERT INTO wa_action_logs (
          id,
          phone,
          action_type,
          action_payload,
          status,
          error_message,
          created_at
        ) VALUES (?, ?, ?, ?, 'error', ?, CURRENT_TIMESTAMP)`,
      )
        .bind(crypto.randomUUID(), context.phone, action.type, JSON.stringify(action.data || {}), message)
        .run();
    }
  }
}
