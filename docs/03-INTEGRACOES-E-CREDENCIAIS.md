# Integrações e credenciais

Atualizado em: 2026-04-10

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
