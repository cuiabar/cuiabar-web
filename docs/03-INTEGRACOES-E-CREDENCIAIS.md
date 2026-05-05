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
- `MCP_BEARER_TOKEN`
- `GOOGLE_GEMINI_API_KEY`

Observações:

- O `MeuCuiabar` usa Google OAuth no Worker para autenticação e coleta de consentimentos.
- O Google Search Console exige OAuth com escopo `https://www.googleapis.com/auth/webmasters` para listar propriedades e submeter sitemaps via API. Em 2026-05-05, o login local `cuiabar@cuiabar.net` no `gcloud` estava ativo, mas sem esse escopo, retornando `ACCESS_TOKEN_SCOPE_INSUFFICIENT`.
- O Google Business Profile está autorizado para leitura operacional de perfis, métricas, avaliações, posts e mídia. A operação usa OAuth com escopos `business.manage` e, quando necessário para gestão de APIs do projeto, `cloud-platform`.
- O Google Ads tem um MCP remoto somente leitura publicado em `https://google-ads-mcp.cuiabar.com/sse`, com código em `services/google-ads-mcp/` e runbook em `docs/runbooks/google-ads-mcp.md`. O serviço usa o escopo OAuth `https://www.googleapis.com/auth/adwords`, o endpoint REST `googleAds:searchStream` e bloqueia qualquer ferramenta de escrita ou comando GAQL fora de `SELECT`.
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

- O Meta Ads tem uma API de GPT Actions somente leitura publicada em `https://meta-ads-actions.cuiabar.com/openapi.json`, com código em `services/meta-ads-actions/` e runbook em `docs/runbooks/meta-ads-actions.md`. O serviço não expõe endpoints de escrita e depende de token Meta com `ads_read`.

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
