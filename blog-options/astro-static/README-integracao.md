# Integracao - Astro static

## Quando escolher esta opcao

Use esta stack quando o objetivo for um blog muito rapido, lindo, com liberdade total de layout e excelente SEO.

## Fluxo recomendado

1. O frontend do blog roda em Astro.
2. O conteudo pode vir de:
   - Markdown/MDX no Git
   - Directus
   - outro CMS headless
3. O `dist/` final pode ser servido por Nginx, Cloudflare Pages ou outro host estatico.

## Primeiro bootstrap

Se ainda nao existir um projeto Astro em `./astro-blog`:

```bash
npm create astro@latest ./astro-blog -- --template blog
```

Depois configure:

- `site` ou `baseURL` para `https://blog.cuiabar.com`
- sitemap
- RSS
- schema por artigo
- modulos de Spotify, clima e CTA dinamico

## Deploy

```bash
cp .env.example .env
bash deploy.sh
```

## Integracoes sugeridas

- Spotify embed por post e por agenda
- Weather API para CTA dinamico
- WhatsApp channel no final dos artigos
- GA4, Meta e pixels de conversao nos CTAs

## Encaixe com o projeto atual

Esta e a opcao com melhor aderencia ao stack atual da Cuiabar. O front pode reutilizar:

- identidade visual
- dados de agenda
- links de menu e reservas
- eventos de analytics

Se a equipe quiser, o blog pode virar um app separado e continuar compartilhando padroes do repositorio principal.
