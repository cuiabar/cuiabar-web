# WhatsApp Marketing MCP

Atualizado em: 2026-05-15

## Objetivo

Expor uma API para GPT personalizado e MCP remoto para planejar e executar comunicacoes WhatsApp consentidas, usando o bridge do projeto separado `GHCO Comunicacoes`.

## URL prevista

- Health: `https://whatsapp-marketing-mcp.cuiabar.com/health`
- GPT Actions: `https://whatsapp-marketing-mcp.cuiabar.com/openapi.json`
- MCP remoto: `https://whatsapp-marketing-mcp.cuiabar.com/sse`
- MCP alternativo: `https://whatsapp-marketing-mcp.cuiabar.com/mcp`

## Codigo

- `services/whatsapp-marketing-mcp/`

## Segredos Cloudflare

- `MCP_BEARER_TOKEN`
- `GHCO_COMMS_BRIDGE_TOKEN`

## Variaveis

- `GHCO_COMMS_BRIDGE_URL`
  URL HTTPS do bridge `GHCO Comunicacoes`.

- `MARKETING_MAX_BATCH_SIZE`
  Limite maximo aceito para planejamento de campanha.

- `MARKETING_MIN_DELAY_SECONDS`
  Cadencia minima entre contatos no plano.

- `MARKETING_MAX_DAILY_RECIPIENTS`
  Limite diario operacional.

## Politica de uso

O servico nao deve ser usado para spam, lista comprada, ocultacao de remetente, contorno de bloqueios ou automacao agressiva.

Controles para envio real:

- consentimento explicito por destinatario
- `consentSource` obrigatorio
- bloqueio de `optedOut=true`
- identificacao do remetente no texto
- instrucao de opt-out no texto
- envio real unitario exige `confirmWrite="ENVIAR_WHATSAPP_CONSENTIDO"`
- campanha em lote retorna plano de cadencia; o disparo em massa precisa de dispatcher auditavel

## Modo de treino

Durante treinamento do GPT, use `validateOnly=true` ou `trainingMode=true`.

Nesse modo:

- `consentSource` e opcional
- texto de opt-out e opcional
- identificacao do remetente no texto e opcional
- nenhum envio real e executado

O objetivo e permitir que o robo aprenda a montar mensagens, variantes, legendas e planos. Quando `validateOnly=false`, o Worker volta a exigir consentimento operacional, opt-out, identificacao do remetente e confirmacao explicita.

## Configuracao no GPT personalizado

1. Abra o GPT Builder.
2. Adicione uma Action.
3. Importe `https://whatsapp-marketing-mcp.cuiabar.com/openapi.json`.
4. Configure autenticacao Bearer com `MCP_BEARER_TOKEN`.
5. Instrua o GPT a usar `validateOnly=true` e `trainingMode=true` durante treinamento.
6. Para envio real, exigir confirmacao humana e usar apenas `sendSingleConsentedWhatsAppMarketingMessage`.

## Acoes disponiveis

- `formatWhatsAppMarketingMessage`
  Gera previa sem envio. Usa `*titulo*`, `_corpo_` e linhas `> citacao` para precos e informacoes uteis.

- `sendSingleConsentedWhatsAppMarketingMessage`
  Envia texto unitario para contato consentido. Envio real exige `confirmWrite="ENVIAR_WHATSAPP_CONSENTIDO"`.

- `sendWhatsAppForm`
  Envia um form de texto com opcoes numeradas. O cliente responde somente com o numero; o bridge responde com o resultado da opcao e encerra a sessao. Envio real exige `confirmWrite="ENVIAR_MENU_NUMERADO"`. `sendNumberedWhatsAppMenu` continua como alias.

- `sendSingleConsentedWhatsAppMarketingMedia`
  Envia foto, video, audio, mensagem de voz ou arquivo para contato consentido. Aceita `mediaUrl` HTTPS ou `filePath` no host do bridge. Envio real exige `confirmWrite="ENVIAR_WHATSAPP_MIDIA_CONSENTIDA"`.

Exemplo de legenda formatada:

```json
{
  "title": "Oferta Cuiabar",
  "body": "Temos uma condicao especial para hoje.",
  "quotes": ["R$ 197,00", "Entrega combinada pelo WhatsApp"],
  "footer": "Equipe Cuiabar. Responda SAIR para nao receber novas mensagens."
}
```

Resultado:

```txt
*Oferta Cuiabar*

_Temos uma condicao especial para hoje._

> R$ 197,00
> Entrega combinada pelo WhatsApp

Equipe Cuiabar. Responda SAIR para nao receber novas mensagens.
```

Exemplo de form:

```json
{
  "recipient": { "phone": "+5519999999999", "name": "Cliente" },
  "title": "Como posso ajudar?",
  "body": "Escolha uma opcao:",
  "options": [
    { "label": "Reservar mesa", "responseText": "Perfeito. Envie data, horario e quantidade de pessoas." },
    { "label": "Ver cardapio", "responseText": "Cardapio: https://cuiabar.com/menu/" },
    { "label": "Falar com atendente", "responseText": "Um atendente vai assumir por aqui." }
  ],
  "validateOnly": true,
  "trainingMode": true
}
```

## Deploy

```powershell
cd services/whatsapp-marketing-mcp
npm install
npm run build
npx wrangler secret put MCP_BEARER_TOKEN -c wrangler.jsonc
npx wrangler secret put GHCO_COMMS_BRIDGE_TOKEN -c wrangler.jsonc
npx wrangler deploy -c wrangler.jsonc
```

## Pendencia operacional

Antes do envio real em producao, publicar o bridge `GHCO Comunicacoes` por um canal seguro:

- Cloudflare Tunnel com Access, ou
- Worker relay autenticado, ou
- endpoint HTTPS privado equivalente.

Nao apontar `GHCO_COMMS_BRIDGE_URL` para um servico aberto sem controle de acesso.

## Troubleshooting

### Cloudflare 1101 ou 502 no envio

Sintoma:

- GPT informa `Cloudflare Error 1101`, ou
- `https://ghco-comms-bridge-origin.cuiabar.com/health` retorna 502.

Causa mais comum:

- o bridge local `GHCO Comunicacoes` nao esta rodando em `127.0.0.1:8788`.

Validar:

```powershell
powershell -ExecutionPolicy Bypass -File C:\Users\usuario\Documents\Codex\GHCO-Comunicacoes\scripts\status-local.ps1
Invoke-RestMethod https://ghco-comms-bridge-origin.cuiabar.com/health
```

Corrigir:

```powershell
cd C:\Users\usuario\Documents\Codex\GHCO-Comunicacoes
powershell -ExecutionPolicy Bypass -File scripts\start-local.ps1
```

Depois, testar novamente a Action `sendSingleConsentedWhatsAppMarketingMessage`.
