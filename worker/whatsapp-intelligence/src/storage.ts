import type { CustomerContext, LlamaAction } from './types';

type SaveConversationInput = {
  phone: string;
  messageId: string;
  messageIn: string;
  messageOut: string;
  actions: LlamaAction[];
  modelRaw: string | null;
};

export const ensureInboundEvent = async (
  db: D1Database,
  externalMessageId: string,
  phone: string,
  sourceTimestamp: string | null,
) => {
  const existing = await db
    .prepare('SELECT id FROM wa_inbound_events WHERE external_message_id = ?')
    .bind(externalMessageId)
    .first<{ id: string }>();

  if (existing?.id) {
    return false;
  }

  await db
    .prepare(
      `INSERT INTO wa_inbound_events (
        id,
        external_message_id,
        phone,
        source_timestamp,
        created_at
      ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    )
    .bind(crypto.randomUUID(), externalMessageId, phone, sourceTimestamp)
    .run();

  return true;
};

export async function getCustomerContext(db: D1Database, phone: string, pushName?: string): Promise<CustomerContext> {
  const found = await db
    .prepare(
      `SELECT
        phone,
        name,
        email,
        loyalty_points,
        preferences,
        last_visit,
        tags
       FROM customers WHERE phone = ?`,
    )
    .bind(phone)
    .first<{
      phone: string;
      name: string | null;
      email: string | null;
      loyalty_points: number | null;
      preferences: string | null;
      last_visit: string | null;
      tags: string | null;
    }>();

  if (found) {
    return {
      phone: found.phone,
      name: found.name,
      email: found.email,
      loyaltyPoints: Number(found.loyalty_points || 0),
      preferences: found.preferences,
      lastVisit: found.last_visit,
      tags: found.tags,
    };
  }

  const fallbackName = (pushName || '').trim() || 'Cliente';

  await db
    .prepare(
      `INSERT INTO customers (
        phone,
        name,
        loyalty_points,
        preferences,
        tags,
        created_at,
        updated_at
      ) VALUES (?, ?, 0, '{}', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    )
    .bind(phone, fallbackName)
    .run();

  return {
    phone,
    name: fallbackName,
    email: null,
    loyaltyPoints: 0,
    preferences: '{}',
    lastVisit: null,
    tags: '[]',
  };
}

export async function saveConversation(db: D1Database, input: SaveConversationInput) {
  await db
    .prepare(
      `INSERT INTO wa_conversations (
        id,
        phone,
        external_message_id,
        message_in,
        message_out,
        llama_actions,
        llama_raw_response,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    )
    .bind(
      crypto.randomUUID(),
      input.phone,
      input.messageId,
      input.messageIn,
      input.messageOut,
      JSON.stringify(input.actions),
      input.modelRaw,
    )
    .run();
}
