# Integracoes e credenciais

Atualizado em: 2026-04-15

## Onde consultar os segredos

Inventario consolidado de chaves compartilhadas por conversa:

- `../ACESSOS-CHAVES-PROJETO.md`
- `../KIT-PORTABILIDADE/02-APIS-E-CHAVES.md`

Esse arquivo deve permanecer restrito.

## Integracoes principais

### Cloudflare

Usado para:
- hosting do site principal
- Worker do CRM
- reservas
- D1
- Workers AI
- KV
- Pages Functions

Arquivos principais:
- `wrangler.jsonc`
- `functions/`
- `worker/`

Referencias operacionais:

- `docs/02-OPERACAO-E-DEPLOY.md`
- `docs/10-AMBIENTE-LOCAL-E-IDS.md`

### Meta

Usado para:
- Pixel
- Conversions API

Arquivos principais:
- `functions/api/meta-conversions.js`
- `src/lib/analytics.ts`
- `src/components/AnalyticsTracker.tsx`
- `index.html`

Bindings e secrets esperados no Worker:

- `META_GRAPH_API_VERSION`
- `META_PIXEL_ID`
- `META_ACCESS_TOKEN`
- `META_CAPI_TOKEN`

### WhatsApp / atendimento AI

Transporte:

- Baileys local em `services/whatsapp-baileys/`
- runtime local preparado por `scripts/run-baileys-runtime.ps1`

Segredos do bridge local:

- `WHATSAPP_WORKER_BASE_URL`
- `WHATSAPP_INTERNAL_TOKEN`

Segredos Cloudflare/AI:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_AI_API_TOKEN`

Adaptador CRM:

- `CRM_INTERNAL_TOKEN`

Referencias operacionais:

- `docs/06-WHATSAPP-AI-ARQUITETURA.md`
- `docs/07-WHATSAPP-AI-ENDPOINTS.md`
- `docs/10-AMBIENTE-LOCAL-E-IDS.md`

### GitHub

Usado para:
- versionamento principal do codigo
- continuidade entre maquinas
- backup externo do workspace operacional

Repositorio principal:

- `https://github.com/cuiabar/cuiabar-web`

Observacao:

- o GitHub nao substitui o deploy no Cloudflare
- o inventario desta maquina e do bridge local fica em `docs/10-AMBIENTE-LOCAL-E-IDS.md`

### Google

Usado para:
- Google Ads / tag
- Search Console
- Calendar
- Gmail / OAuth
- conta de servico

Documentos de apoio:
- `SEO-SETUP.md`
- `GOOGLE-CALENDAR-SETUP.md`
- `GMAIL-OAUTH-SETUP.md`
- `EMAIL-SETUP.md`

Bindings e secrets recorrentes no Worker:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REFRESH_TOKEN`
- `GOOGLE_CALENDAR_ID`
- `GOOGLE_ADS_API_VERSION`
- `GOOGLE_ADS_CUSTOMER_ID`
- `GOOGLE_ADS_LOGIN_CUSTOMER_ID`
- `GOOGLE_ADS_DEVELOPER_TOKEN`
- `GOOGLE_ADS_CLIENT_ID`
- `GOOGLE_ADS_CLIENT_SECRET`
- `GOOGLE_ADS_REFRESH_TOKEN`

### Blog editorial

Usado para:
- editor protegido em `blog.cuiabar.com/editor`
- upload e entrega de midia do blog
- automacao editorial e operacao de assets

Bindings e secrets esperados no Worker:

- `BLOG_EDITOR_UPSTREAM_URL`
- `BLOG_EDITOR_TOKEN`
- `BLOG_EDITOR_ALLOWED_EMAILS`
- `BLOG_MEDIA_PUBLIC_BASE_URL`
- binding R2 `BLOG_MEDIA`

### Zoho

Usado para:
- OAuth e integracoes operacionais com Zoho

Bindings e secrets esperados no Worker:

- `ZOHO_ACCOUNTS_DOMAIN`
- `ZOHO_API_DOMAIN`
- `ZOHO_CLIENT_ID`
- `ZOHO_CLIENT_SECRET`
- `ZOHO_REFRESH_TOKEN`

### Bing

Usado para:
- Bing Webmaster

## Regra pratica

Para qualquer Codex novo:

1. nunca assuma que um token no chat ainda esta valido;
2. confirme primeiro no provedor;
3. prefira secrets no Cloudflare/GitHub/cofre em vez de texto puro;
4. se houver duvida, rotacione o token em vez de insistir num acesso antigo.
