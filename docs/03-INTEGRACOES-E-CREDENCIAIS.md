# Integrações e credenciais

Atualizado em: 2026-04-11

## Política de segredos

Este repositório não deve carregar tokens privados, chaves de serviço ou credenciais sensíveis em texto puro.

O que pode ficar versionado:

- IDs públicos de pixel, tag, dataset e client IDs
- nomes de secrets
- nomes de variáveis
- documentação operacional sem o valor do segredo

O que não deve ficar versionado:

- tokens do Cloudflare
- tokens da Meta
- chaves privadas do Google
- arquivos `.env` reais
- segredos de provedores terceiros

## Onde ficam as integrações

### Cloudflare

- config principal: `wrangler.jsonc`
- pages functions: `functions/`
- worker/backend: `worker/`

### Meta

- tracker frontend: `src/lib/analytics.ts`
- injeção/eventos: `src/components/AnalyticsTracker.tsx`
- endpoint server-side: `functions/api/meta-conversions.js`
- service Worker: `worker/services/meta/metaConversions.ts`

### Google

- autenticação Google/CRM: `wrangler.jsonc`, `worker/services/google/`
- Calendar: `worker/services/google/calendarService.ts`
- SEO/search: `src/pages/PesquisaPage.tsx`, `src/lib/seo.ts`, `src/data/seoRoutes.json`
- Google Business Profile OAuth:
  - setup: `/oauth/google-business/setup`
  - start: `/oauth/google-business/start`
  - callback: `/api/google/business/callback`
  - settings storage key: `google_business_oauth_connection`
- Search Console:
  - service account operacional confirmada em 2026-04-11
  - propriedade acessível: `sc-domain:cuiabar.com`
  - sitemap submetido por API: `https://cuiabar.com/sitemap.xml`
  - propriedade adicional visível: `https://www.cuiabar.com/`

Observação:

- a chave privada da service account não deve permanecer em `Downloads` como fonte de operação;
- o ideal é mover a credencial para um cofre seguro e usar apenas referência operacional na documentação.
- arquitetura oficial do cofre: `docs/13-ARQUITETURA-DE-SEGREDOS-E-COFRE.md`


### WhatsApp Intelligence (Llama + CRM interno)

- worker dedicado: `worker/whatsapp-intelligence/`
- endpoint inbound: `POST /webhook/baileys`
- durable object de sessao/saida: `BaileysSessionDO`
- tabelas operacionais: `customers`, `wa_inbound_events`, `wa_conversations`, `wa_action_logs`, `wa_reservation_requests`
- segredos esperados (somente em ambiente):
  - `WEBHOOK_SHARED_SECRET`
  - `CRM_INTERNAL_SECRET`
  - `BAILEYS_GATEWAY_TOKEN`

Observacao:

- `create_reservation_request` gera fila de solicitacoes para conciliacao com o fluxo oficial de reservas;
- evitar escrita direta na tabela `reservations` fora do contrato ja validado no backend principal.

### Blog/editorial

- React blog app: `src/blog/`
- integrações e operação editorial: `blog-options/`
- scripts de sync/publish: `scripts/`

### Reservas

- frontend: `src/reservations/`
- worker: `worker/reservations/`
- schema: `migrations/0004_reservations.sql`

## Regra para futuras IAs

Se uma tarefa pedir “a chave”, “o token” ou “o acesso”:

1. não invente o valor
2. procure primeiro por variáveis já esperadas no código
3. prefira apontar para o local onde o segredo deve existir
4. se não houver cofre definido, registrar isso como pendência operacional
