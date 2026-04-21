# WhatsApp Intelligence (Llama + CRM interno)

Camada de automacao para mensagens inbound/outbound de WhatsApp com inferencia por Llama, persistencia no D1 e execucao de comandos internos de CRM.

## Fluxo

1. Baileys Gateway publica eventos em `POST /webhook/baileys`.
2. Worker valida segredo interno e deduplica `messageId`.
3. Busca/cria contexto do cliente em `customers`.
4. Chama `@cf/meta/llama-3.1-8b-instruct` para resposta e `actions`.
5. Executa comandos permitidos (`create_reservation_request`, `add_loyalty_points`, `send_email_confirmation`, `notify_team`).
6. Persiste conversa/logs em D1.
7. Encaminha envio para o gateway de saida via Durable Object (`BaileysSessionDO`).

## Segredos esperados

- `WEBHOOK_SHARED_SECRET`
- `CRM_INTERNAL_SECRET`
- `BAILEYS_GATEWAY_TOKEN`

Configure com:

```bash
wrangler secret put WEBHOOK_SHARED_SECRET
wrangler secret put CRM_INTERNAL_SECRET
wrangler secret put BAILEYS_GATEWAY_TOKEN
```

## Observacoes de seguranca

- Nao versionar valores reais de segredo.
- Use apenas redes internas/autenticacao forte para endpoint de webhook.
- `create_reservation_request` cria fila de solicitacao, nao grava direto na tabela oficial de reservas.

## Deploy

```bash
wrangler d1 execute cuiabar-reservations --file ./migrations/0005_whatsapp_intelligence.sql
wrangler deploy
```
