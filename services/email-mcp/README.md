# Email MCP / GPT Actions

Worker para integrar o GPT personalizado ao Gmail API com leitura, rascunhos e envio controlado.

## URLs

Publico, apos deploy:

```text
https://email-mcp.cuiabar.com/openapi.json
https://email-mcp.cuiabar.com/health
```

## Segredos

Configure no Cloudflare Worker:

- `EMAIL_MCP_BEARER_TOKEN`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REFRESH_TOKEN`
- `GMAIL_SENDER_EMAIL`
- `DEFAULT_REPLY_TO`, opcional

O refresh token precisa de escopo Gmail suficiente para a operacao desejada, normalmente:

```text
https://www.googleapis.com/auth/gmail.modify
```

Para apenas enviar e criar rascunhos, `gmail.compose` pode bastar. Para listar, ler, arquivar ou apagar mensagens, use `gmail.modify`.

## Ferramentas expostas

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

## Escrita

Rotas de escrita exigem Bearer token. Por padrao, `sendEmail`, `createEmailDraft`, `replyToEmail`, `forwardEmail`, `sendEmailDraft`, `deleteEmailDraft` e `trashEmailMessage` rodam como validacao quando `validateOnly` nao for `false`.

Para enviar ou alterar de fato:

```json
{
  "validateOnly": false
}
```

O remetente real fica restrito a `GMAIL_SENDER_EMAIL`.

## Deploy

```bash
npm install
npm run typecheck
npm run deploy
```
