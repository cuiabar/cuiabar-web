# WhatsApp Marketing MCP

API de GPT Actions e MCP remoto para planejamento e envio controlado de comunicacoes WhatsApp consentidas.

## Superficies

- `https://whatsapp-marketing-mcp.cuiabar.com/openapi.json`
- `https://whatsapp-marketing-mcp.cuiabar.com/sse`
- `https://whatsapp-marketing-mcp.cuiabar.com/mcp`

## Segredos

- `MCP_BEARER_TOKEN`
- `GHCO_COMMS_BRIDGE_TOKEN`

## Variaveis

- `GHCO_COMMS_BRIDGE_URL`
- `MARKETING_MAX_BATCH_SIZE`
- `MARKETING_MIN_DELAY_SECONDS`
- `MARKETING_MAX_DAILY_RECIPIENTS`

## Politica

O servico nao implementa contorno de bloqueios. Ele aplica conformidade operacional:

- destinatarios precisam ter consentimento explicito
- mensagens precisam trazer identificacao e caminho de opt-out
- campanhas reais exigem `validateOnly=false` e confirmacao literal
- envio em lote retorna plano de cadencia; disparo automatizado em massa deve ser feito por dispatcher auditavel

