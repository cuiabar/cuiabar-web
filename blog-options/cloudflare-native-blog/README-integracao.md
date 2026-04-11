# Blog nativo em Cloudflare

Este sprint transforma a operacao editorial do blog em uma base 100% Cloudflare-first:

- `blog.cuiabar.com` continua como frontend publico;
- `blog.cuiabar.com/editor` vira o painel editorial no Worker;
- `blog.cuiabar.com/api/blog/*` expõe a API do CMS;
- `D1` guarda posts, status e agendamento;
- `R2` fica pronto para a biblioteca de midia;
- `Cron Triggers` publicam posts agendados.

## O que entrou no repositório

- schema/migration:
  - [0005_cloudflare_native_blog.sql](/C:/cuiabar-web/migrations/0005_cloudflare_native_blog.sql)
- rotas CMS/editor no Worker:
  - [routes.ts](/C:/cuiabar-web/worker/blog/routes.ts)
- sincronizacao para o frontend publico:
  - [sync-blog-content-from-cloudflare-native.mjs](/C:/cuiabar-web/scripts/sync-blog-content-from-cloudflare-native.mjs)

## Rotas novas

- editor: `https://blog.cuiabar.com/editor`
- API publica de posts: `https://blog.cuiabar.com/api/blog/posts`
- API publica no formato do frontend atual:
  - `https://blog.cuiabar.com/api/blog/posts?format=knowledge`

## Seguranca do editor

Producao recomendada:

1. Ativar o Zero Trust uma vez no dashboard da conta Cloudflare.
2. Proteger `blog.cuiabar.com/editor*` com Cloudflare Access.
3. Liberar so os e-mails em `BLOG_EDITOR_ALLOWED_EMAILS`.

Observacao importante:

- sem clicar uma vez em `Enable Access` no painel Zero Trust da conta, a API do Cloudflare responde `access.api.error.not_enabled` e nao deixa criar a aplicacao do Access;
- o editor ja esta pronto para esse modelo: interface em `/editor` e chamadas internas em `/editor/api/blog/*`, para a sessao inteira ficar protegida pela mesma regra de Access.

Fallback tecnico:

- `BLOG_EDITOR_TOKEN` pode ser usado nas APIs via header `x-blog-editor-token`.

## Checklist do Cloudflare Access

Assim que o Zero Trust estiver habilitado na conta:

1. Criar um aplicativo `Self-hosted`.
2. Nome sugerido: `Editor do Blog Cuiabar`.
3. Dominio: `blog.cuiabar.com`.
4. Path: `/editor*`.
5. Politica `Allow`:
   - `Emails`:
     - `leonardo@cuiabar.net`
     - `cuiabar@cuiabar.net`
6. Opcional:
   - pagina de login com marca da Cuiabar;
   - OTP por e-mail num primeiro momento;
   - Google como IdP depois, sem alterar o editor.

## Midia no R2

O Worker ja aceita upload em `POST /api/blog/media`, mas o binding precisa existir.

No `wrangler.jsonc`, habilite:

```jsonc
// "r2_buckets": [
//   {
//     "binding": "BLOG_MEDIA",
//     "bucket_name": "cuiabar-blog-media"
//   }
// ]
```

Se tiver um dominio publico para o bucket, preencha:

- `BLOG_MEDIA_PUBLIC_BASE_URL=https://media.blog.cuiabar.com`

## Como aplicar a migration no D1

```powershell
npm run d1:migrate:remote
```

## Como operar o blog hoje

1. Entrar em `blog.cuiabar.com/editor`
2. Criar/salvar/publicar posts
3. Sincronizar o frontend publico:

```powershell
npm run sync:blog-content:cloudflare
npm run deploy:blog
```

Atalho unico:

```powershell
npm run deploy:blog:cloudflare
```

## Observacao importante desta fase

O CMS ja e Cloudflare-native. O frontend publico ainda e um build estatico do blog atual.

Isso significa:

- o conteudo entra no D1 em tempo real;
- o painel editorial ja e serverless;
- a atualizacao do site publico ainda depende do deploy do blog estatico.

Proximo passo natural:

- ligar um Build Hook do Cloudflare Pages na publicacao para o deploy acontecer sozinho.
