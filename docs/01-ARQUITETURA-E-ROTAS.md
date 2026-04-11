# Arquitetura e rotas

Atualizado em: 2026-04-10

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
- CRM: `src/crm/`, `worker/`
- reservas: `src/reservations/`, `worker/reservations/`, `migrations/0004_reservations.sql`
- blog: `src/blog/`, `blog-options/`, scripts editoriais
