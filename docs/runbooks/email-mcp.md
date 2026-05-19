# Email MCP / GPT Actions

Atualizado em: 2026-05-18

## Objetivo

Expor uma API controlada para o GPT personalizado enviar, criar rascunhos, responder, encaminhar e consultar e-mails pela Gmail API oficial.

## Servico

- Codigo: `services/email-mcp/`
- Worker: `email-mcp`
- OpenAPI para GPT Actions: `https://email-mcp.cuiabar.com/openapi.json`
- Health check: `https://email-mcp.cuiabar.com/health`

## Autenticacao da Action

Todas as rotas em `/actions/*` exigem:

```text
Authorization: Bearer <EMAIL_MCP_BEARER_TOKEN>
```

O token deve ficar apenas em segredo do GPT personalizado e no Worker. Nao versionar o valor.

## Segredos do Worker

Configurar no Cloudflare:

- `EMAIL_MCP_BEARER_TOKEN`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REFRESH_TOKEN`
- `GMAIL_SENDER_EMAIL`, configurado como `clientes@cuiabar.net`
- `DEFAULT_REPLY_TO`, opcional
- `EMAIL_MCP_INTERNAL_TOKEN`, quando o envio usar o gateway interno do CRM

Variaveis operacionais:

- `GMAIL_SENDER_NAME`
- `CRM_GMAIL_SEND_URL`
- `EMAIL_MAX_RECIPIENTS`
- `EMAIL_MAX_ATTACHMENT_BYTES`

## Escopos OAuth

Para operacao completa com leitura, rascunhos, envio e organizacao de mensagens, usar refresh token com:

```text
https://www.googleapis.com/auth/gmail.modify
```

Para uma operacao mais restrita de compor/enviar, `https://www.googleapis.com/auth/gmail.compose` pode bastar, mas nao cobre todos os endpoints expostos.

## Gateway CRM

Em 2026-05-18, o envio simples foi habilitado via `https://crm.cuiabar.com/api/internal/gmail/send`, reaproveitando o OAuth Gmail salvo no CRM. O remetente operacional do MCP e `clientes@cuiabar.net`; esse endereco precisa existir como alias autorizado na conta Google que renovou o OAuth. Esse modo permite disparo unitario sem anexos pelo `sendEmail`. Recursos completos como leitura, rascunhos, multiplos destinatarios, anexos e endpoints Gmail livres exigem configurar os secrets diretos `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` e `GOOGLE_REFRESH_TOKEN` no `email-mcp`.

## Classificacao de inbox

Para reduzir classificacao automatica como Promocoes no Gmail:

- usar `messageType: "editorial"` ou `messageType: "transactional"` em e-mails individuais
- reservar `messageType: "marketing"` para campanhas com opt-in e `listUnsubscribeUrl`
- manter HTML editorial leve, com poucos links e sem linguagem de desconto/oferta
- evitar multiplos CTAs graficos no primeiro contato

## DMARC

Registro recomendado para `cuiabar.net`:

```text
Tipo: TXT
Nome: _dmarc
Valor: v=DMARC1; p=quarantine; pct=100; rua=mailto:clientes@cuiabar.net; ruf=mailto:clientes@cuiabar.net; adkim=s; aspf=s; fo=1
TTL: 3600
Proxy: DNS only
```

Em 2026-05-18, SPF e DKIM ja estavam publicados. O DMARC foi criado pelo painel Cloudflare porque o OAuth local do Wrangler tinha leitura de zona, mas nao permissao de escrita em DNS via API. Validacao publica confirmou `_dmarc.cuiabar.net` com `p=quarantine`.

## Ferramentas

- `getEmailProfile`
- `sendEmail`
- `createEmailDraft`
- `sendEmailDraft`
- `listEmailDrafts`
- `getEmailDraft`
- `deleteEmailDraft`
- `listEmailMessages`
- `getEmailMessage`
- `replyToEmail`
- `forwardEmail`
- `trashEmailMessage`
- `gmailApiRequest`

## Escrita e validacao

As ferramentas de escrita rodam em modo validacao por padrao. Para executar de fato:

```json
{
  "validateOnly": false
}
```

O remetente real fica restrito a `GMAIL_SENDER_EMAIL`. Se `fromEmail` for informado e divergir do segredo, o Worker rejeita.

## Anexos

O envio aceita anexos por:

- `contentBase64`
- `url` HTTPS

O limite total e controlado por `EMAIL_MAX_ATTACHMENT_BYTES`.

## Boas praticas obrigatorias

- enviar marketing apenas para contatos com consentimento
- incluir texto `text/plain` quando houver HTML
- usar `listUnsubscribeUrl` em comunicacoes recorrentes ou promocionais
- nao registrar corpo completo de e-mails em logs operacionais
- usar `createEmailDraft` quando houver necessidade de revisao humana antes do envio

## Deploy

```bash
cd services/email-mcp
npm install
npm run typecheck
npm run deploy
```
