# Arquitetura e rotas

Atualizado em: 2026-04-13

## Módulos do repositório

Este repositório hoje concentra quatro frentes principais:

1. site público principal do Cuiabar
2. experiências e páginas especiais, incluindo Burger Cuiabar
3. CRM e backend operacional
4. blog e fluxo editorial

## Mapa das pastas

- `src/app/`
  Shell principal do app público e roteamento base.

- `src/pages/`
  Páginas do site principal e landing pages públicas.

- `src/sections/`
  Blocos reutilizáveis da home e de páginas institucionais.

- `src/blog/`
  Aplicação/blog editorial separada dentro do mesmo monorepo leve.

- `src/burger/`
  Área experimental/dedicada para experiência Burger Cuiabar.

- `src/crm/`
  Interface do CRM.

- `src/reservations/`
  Frontend do portal de reservas.

- `worker/`
  Backend principal em Cloudflare Workers: CRM, integrações, reservas, autenticação e rotas server-side dedicadas.

- `functions/`
  Cloudflare Pages Functions e middleware do site estático.


- `worker/whatsapp-intelligence/`
  Worker dedicado para automacoes de WhatsApp com Llama, auditoria e bridge para gateway Baileys.

- `migrations/`
  Banco D1 e evolução de schema.

- `public/`
  Assets estáticos organizados por área:
  - `public/home/`
  - `public/menu/`
  - `public/prorefeicao/`
  - `public/vagas/`
  - `public/burguer/`
  - `public/fonts/`

## Rotas e domínios principais

- `cuiabar.com`
  Site principal.

- `burger.cuiabar.com`
  Experiência Burger Cuiabar conectada ao mesmo projeto.

- `crm.cuiabar.com`
  CRM e backend administrativo.

- `reservas.cuiabar.com`
  Portal de reservas.

- `blog.cuiabar.com`
  Presença editorial e operação de conteúdo.

## Fonte de edição por tipo de mudança

- site institucional: `src/pages/`, `src/sections/`, `src/data/`
- SEO público: `src/data/seo.ts`, `src/data/seoRoutes.json`, `src/lib/seo.ts`
- analytics/pixels: `src/lib/analytics.ts`, `src/components/AnalyticsTracker.tsx`, `functions/api/meta-conversions.js`
- burger: `src/pages/BurguerCuiabarPage.tsx`, `src/burger/`, `public/burguer/`
- CRM: `src/crm/`, `worker/`, `worker/whatsapp-intelligence/`
- reservas: `src/reservations/`, `worker/reservations/`, `migrations/0004_reservations.sql`
- blog: `src/blog/`, `blog-options/`, scripts editoriais

## Observações de entrega por host

- `crm.cuiabar.com` usa o mesmo bundle frontend do monorepo, mas o HTML base do host deve ser reescrito no Worker para responder como portal interno:
  - `<html data-app="crm">`
  - metadados próprios do CRM
  - `x-robots-tag` com `noindex`
  - `cache-control` sem armazenamento para o HTML

- regra de manutenção:
  - o host do CRM não deve reaproveitar metadados, canonical, pixels ou shell pública do site institucional como resposta final de HTML;
  - o runtime React continua selecionando o app por hostname em `src/main.tsx`, mas o boundary entre site público e CRM também precisa existir no nível da resposta HTTP do Worker.
