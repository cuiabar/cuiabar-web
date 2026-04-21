import type { Env } from './index';
import type { CustomerContext, LlamaAction, LlamaResult } from './types';

const SYSTEM_PROMPT = `Voce e o assistente de WhatsApp do Cuiabar em Campinas-SP.
Fale em portugues brasileiro, seja claro, cordial e objetivo.
Seu foco e ajudar o cliente com reservas, atendimento, cardapio e proximos passos.
Nunca invente dados de pedido, reserva ou pagamento.
Nunca prometa algo que nao foi confirmado.
Se faltar dado para acao, responda pedindo os dados faltantes.

Responda EXCLUSIVAMENTE em JSON valido:
{
  "response": "mensagem para cliente",
  "actions": []
}

Actions permitidas:
- create_reservation_request
- add_loyalty_points
- send_email_confirmation
- notify_team`;

const safeParseJson = (raw: string): { response?: unknown; actions?: unknown } | null => {
  try {
    return JSON.parse(raw) as { response?: unknown; actions?: unknown };
  } catch {
    return null;
  }
};

const sanitizeActions = (input: unknown): LlamaAction[] => {
  if (!Array.isArray(input)) return [];

  const actions: LlamaAction[] = [];

  for (const candidate of input) {
    if (!candidate || typeof candidate !== 'object') continue;

    const current = candidate as { type?: unknown; data?: unknown };
    if (typeof current.type !== 'string') continue;

    if (
      current.type === 'create_reservation_request' ||
      current.type === 'add_loyalty_points' ||
      current.type === 'send_email_confirmation' ||
      current.type === 'notify_team'
    ) {
      actions.push({
        type: current.type,
        data: typeof current.data === 'object' && current.data ? current.data : {},
      } as LlamaAction);
    }
  }

  return actions;
};

export async function llamaProcessMessage(
  message: string,
  phone: string,
  customer: CustomerContext,
  env: Env,
): Promise<LlamaResult> {
  const context = [
    `Telefone: ${phone}`,
    `Nome: ${customer.name || 'Cliente'}`,
    `Email: ${customer.email || 'nao informado'}`,
    `Pontos: ${customer.loyaltyPoints || 0}`,
    `Ultima visita: ${customer.lastVisit || 'nao registrada'}`,
    `Preferencias: ${customer.preferences || 'nao registradas'}`,
  ].join('\n');

  try {
    const result = await env.AI.run('@cf/meta/llama-3.1-8b-instruct' as keyof AiModels, {
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Contexto do cliente:\n${context}\n\nMensagem recebida:\n${message}`,
        },
      ],
      max_tokens: 700,
      temperature: 0.35,
    });

    const resultWithResponse = result as { response?: unknown } | null;
    const rawResponse = typeof resultWithResponse?.response === 'string' ? resultWithResponse.response : '';
    const parsed = safeParseJson(rawResponse);

    return {
      response:
        parsed && typeof parsed.response === 'string' && parsed.response.trim()
          ? parsed.response.trim()
          : 'Recebi sua mensagem. Vou te ajudar agora: pode me passar mais detalhes?',
      actions: parsed ? sanitizeActions(parsed.actions) : [],
      rawModelResponse: rawResponse || undefined,
    };
  } catch {
    return {
      response: 'Oi! Tive uma instabilidade tecnica agora. Pode repetir sua mensagem?',
      actions: [],
    };
  }
}
