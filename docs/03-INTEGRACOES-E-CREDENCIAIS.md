# Integrações e credenciais

Atualizado em: 2026-05-04

## Onde consultar segredos

O inventário consolidado de segredos fica apenas em materiais restritos, quando presentes localmente:

- `../ACESSOS-CHAVES-PROJETO.md`
- `../KIT-PORTABILIDADE/confidencial/02-APIS-E-CHAVES.md`

Neste documento devem permanecer apenas:

- nomes de integrações
- nomes de variáveis
- responsabilidades operacionais

## Cloudflare

Usado para:

- Cloudflare Pages
- Cloudflare Workers
- D1
- KV
- Workers AI

Arquivos principais:

- `wrangler.jsonc`
- `functions/`
- `worker/`

## Google

Usado para:

- login interno
- Gmail
- Calendar
- Search Console
- Google Ads
- Google Business Profile
- Gemini API

Segredos recorrentes:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_AUTH_CLIENT_ID`
- `GOOGLE_AUTH_CLIENT_SECRET`
- `MEUCUIABAR_MASTER_EMAILS`
- `GOOGLE_REFRESH_TOKEN`
- `GOOGLE_CALENDAR_ID`
- `GOOGLE_ADS_API_VERSION`
- `GOOGLE_ADS_CUSTOMER_ID`
- `GOOGLE_ADS_LOGIN_CUSTOMER_ID`
- `GOOGLE_ADS_DEVELOPER_TOKEN`
- `GOOGLE_ADS_CLIENT_ID`
- `GOOGLE_ADS_CLIENT_SECRET`
- `GOOGLE_ADS_REFRESH_TOKEN`
- `EMAIL_MCP_BEARER_TOKEN`
- `GMAIL_SENDER_EMAIL`
- `GMAIL_SENDER_NAME`
- `DEFAULT_REPLY_TO`
- `MCP_BEARER_TOKEN`
- `GOOGLE_GEMINI_API_KEY`
- `GOOGLE_BUSINESS_ACTIONS_BEARER_TOKEN`
- `GOOGLE_BUSINESS_CLIENT_ID`
- `GOOGLE_BUSINESS_CLIENT_SECRET`
- `GOOGLE_BUSINESS_REFRESH_TOKEN`
- `GOOGLE_BUSINESS_DEFAULT_ACCOUNT`
- `GOOGLE_BUSINESS_DEFAULT_LOCATION`

Observações:

- O `MeuCuiabar` usa Google OAuth no Worker para autenticação e coleta de consentimentos.
- O Email MCP fica em `services/email-mcp/` e expõe Actions para GPT personalizado em `https://email-mcp.cuiabar.com/openapi.json`. Usa Gmail API oficial, `EMAIL_MCP_BEARER_TOKEN` para autorizar editores, `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`/`GOOGLE_REFRESH_TOKEN` para OAuth e `GMAIL_SENDER_EMAIL=clientes@cuiabar.net` como remetente real. O runbook fica em `docs/runbooks/email-mcp.md`.
- O Google Search Console exige OAuth com escopo `https://www.googleapis.com/auth/webmasters` para listar propriedades e submeter sitemaps via API. Em 2026-05-05, o login local `cuiabar@cuiabar.net` no `gcloud` estava ativo, mas sem esse escopo, retornando `ACCESS_TOKEN_SCOPE_INSUFFICIENT`.
- O Google Business Profile está autorizado para leitura operacional de perfis, métricas, avaliações, posts e mídia. A operação usa OAuth com escopos `business.manage` e, quando necessário para gestão de APIs do projeto, `cloud-platform`.
- O Google Business MCP fica em `services/google-business-mcp/` e expõe Actions/OpenAPI para GPT personalizado em `https://google-business-mcp.cuiabar.com/openapi.json`. Usa Bearer interno `GOOGLE_BUSINESS_ACTIONS_BEARER_TOKEN` e OAuth Google com `GOOGLE_BUSINESS_CLIENT_ID`/`GOOGLE_BUSINESS_CLIENT_SECRET`/`GOOGLE_BUSINESS_REFRESH_TOKEN`, preferencialmente emitido com escopo `https://www.googleapis.com/auth/business.manage`. Escritas devem usar `validateOnly:true` por padrão e só enviar `validateOnly:false` após confirmação explícita.
- O Google Ads tem um MCP remoto publicado em `https://google-ads-mcp.cuiabar.com/sse`, com código em `services/google-ads-mcp/` e runbook em `docs/runbooks/google-ads-mcp.md`. O serviço usa o escopo OAuth `https://www.googleapis.com/auth/adwords`, mantém relatórios por `googleAds:searchStream`, bloqueia GAQL fora de `SELECT`, retorna erros estruturados em `gaql-v2` e expõe escrita por `mutate-v2`/`create-search-ad-bundle-v2` para editores autenticados.
- A integração com Gemini está apenas inventariada. Não há uso ativo dessa API no runtime do site, do CRM ou do Worker neste momento.

## Meta

Usado para:

- Pixel
- Conversions API

Segredos esperados:

- `META_GRAPH_API_VERSION`
- `META_PIXEL_ID`
- `META_ACCESS_TOKEN`
- `META_CAPI_TOKEN`
- `META_AD_ACCOUNT_ID`
- `META_ACTIONS_BEARER_TOKEN`

Observações:

- O Meta Ads tem uma API de GPT Actions publicada em `https://meta-ads-actions.cuiabar.com/openapi.json`, com código em `services/meta-ads-actions/` e runbook em `docs/runbooks/meta-ads-actions.md`. O serviço mantém endpoints de relatório, expõe escrita para editores autenticados por Bearer token e inclui camada genérica `meta-graph-request`/batch para qualquer node/edge da Marketing API com payload livre; depende de token Meta com `ads_read` para leitura e `ads_management` para criação.

## WhatsApp e atendimento

### Backend canônico

- `worker/whatsapp/`

### Worker dedicado e experimental

- `worker/whatsapp-intelligence/`

### Ponte local

- `services/whatsapp-baileys/`

Segredos recorrentes:

- `WHATSAPP_WORKER_BASE_URL`
- `WHATSAPP_INTERNAL_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_AI_API_TOKEN`
- `CRM_INTERNAL_TOKEN`

Segredos do módulo dedicado:

- `WEBHOOK_SHARED_SECRET`
- `CRM_INTERNAL_SECRET`
- `BAILEYS_GATEWAY_TOKEN`

### WhatsApp Marketing MCP

Servico separado para GPT Actions e MCP remoto em `whatsapp-marketing-mcp.cuiabar.com`, com codigo em `services/whatsapp-marketing-mcp/`.

Segredos esperados:

- `MCP_BEARER_TOKEN`
- `GHCO_COMMS_BRIDGE_TOKEN`

Variaveis:

- `GHCO_COMMS_BRIDGE_URL`
- `MARKETING_MAX_BATCH_SIZE`
- `MARKETING_MIN_DELAY_SECONDS`
- `MARKETING_MAX_DAILY_RECIPIENTS`

Observacao:

- O servico aceita modo de treino/validacao sem exigir consentimento, opt-out e identificacao textual no payload, para permitir treinamento do GPT. Envio real continua exigindo comprovante operacional de consentimento, confirmacao explicita e nao deve ser usado para contorno de bloqueios, lista comprada ou automacao agressiva.
- O GPT Actions expõe formatacao WhatsApp em `/actions/format-message`, envio unitario de texto em `/actions/send-single`, form de custo zero em `/actions/send-form` e envio unitario de foto, video, audio ou arquivo em `/actions/send-media`. `/actions/send-numbered-menu` continua como alias. Midia remota deve usar `mediaUrl` HTTPS.

## CRM e reservas

Usado para:

- contatos
- campanhas
- envio de e-mail
- reservas
- integração com calendários
- atendimento omnichannel

Recursos principais:

- `src/crm/`
- `src/reservations/`
- `worker/reservations/`
- `migrations/`

## Blog e operação editorial

Status atual:

- fora da superfície principal do produto
- mantido como frente separável
- runbooks preservados em `docs/runbooks/`

Variáveis recorrentes:

- `BLOG_EDITOR_UPSTREAM_URL`
- `BLOG_EDITOR_TOKEN`
- `BLOG_EDITOR_ALLOWED_EMAILS`
- `BLOG_MEDIA_PUBLIC_BASE_URL`

## Zoho

Integração legada. Só deve ser retomada quando a demanda exigir.

Segredos históricos:

- `ZOHO_ACCOUNTS_DOMAIN`
- `ZOHO_API_DOMAIN`
- `ZOHO_CLIENT_ID`
- `ZOHO_CLIENT_SECRET`
- `ZOHO_REFRESH_TOKEN`

## Regra prática

Para qualquer novo ambiente:

1. não assumir que credenciais antigas continuam válidas;
2. validar acesso no provedor antes de operar;
3. preferir secret manager, Cloudflare Secrets ou GitHub Secrets;
4. documentar nomes de variáveis, nunca valores sensíveis.
