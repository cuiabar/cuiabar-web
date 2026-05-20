# Operação e deploy

Atualizado em: 2026-05-18

## Requisitos

- Node.js 20+
- npm 10+
- Wrangler autenticado ou token válido com acesso aos recursos necessários

## Comandos principais

Instalação:

```bash
npm install
```

Desenvolvimento:

```bash
npm run dev
```

Validação:

```bash
npm run lint
npm run build
```

Publicação do site público:

```bash
npm run deploy:pages
```

Publicação do backend:

```bash
npm run deploy:worker
```

Migrações D1:

```bash
npm run d1:migrate:local
npm run d1:migrate:remote
```

## Como a publicação funciona hoje

### Site público

- Última publicação manual registrada em 2026-05-11: retorno da home permanente após a campanha de Dia das Mães, com `npm run deploy:pages` usando OAuth local do Wrangler porque a variável `CLOUDFLARE_API_TOKEN` do ambiente estava expirada. Preview Cloudflare Pages: `https://d8063e65.cuiabar-site.pages.dev`.
- O build gera `dist/`.
- O deploy publica no projeto `cuiabar-site` no Cloudflare Pages.
- O comando operacional é `wrangler pages deploy`.
- Os metadados base ficam em `index.html`, mas os metadados canônicos por rota, Schema.org, sitemap e robots são reescritos por `scripts/generate-seo-assets.mjs` no final do build.
- Os assets PWA/SEO oficiais ficam em `public/`: `manifest.json`, `favicon.ico`, `favicon.svg`, `apple-touch-icon.png`, `icons/icon-192.png`, `icons/icon-512.png` e `og-image.jpg`.
- A política de cache e headers de segurança do site público fica em `public/_headers`, consumida pelo Cloudflare Pages no deploy. Assets versionados de `assets/`, `fonts/`, `home/`, `menu/`, `prorefeicao/` e `icons/` usam cache longo; `robots.txt`, `sitemap.xml` e `manifest.json` usam cache curto.
- As rotas internas `/os` e `/os/*` recebem `X-Robots-Tag: noindex, nofollow` em `public/_headers` e tambem têm metadados `robots` com `noindex,nofollow`; elas não devem entrar no sitemap público.
- O servidor local Vite bloqueia acesso a artefatos e pacotes auxiliares (`ops-artifacts/`, `dist/`, `.ssr/` e `KIT-PORTABILIDADE/`) via `server.fs.deny`, evitando que perfis de debug ou arquivos exportados entrem no grafo de desenvolvimento.
- O sitemap público é gerado por `scripts/generate-seo-assets.mjs` no final do build e deve publicar URLs canônicas com barra final para evitar redirects antes do rastreamento.
- O subdomínio `prorefeicao.cuiabar.com` consome o artefato público do Pages com roteamento via `functions/_middleware.js`, servindo a landing dedicada do `ProRefeição` na raiz do host.
- O host `burgersnsmoke.com` foi extraído para um projeto standalone fora deste repositório. O Worker principal `cuiabar-crm` não deve servir landing, páginas satélite, sitemap, robots, assets ou Schema.org da hamburgueria.
- Em `cuiabar.com`, as rotas legadas `/burger*`, `/burguer*`, `/burger-n-smoke` e páginas satélite antigas permanecem apenas como redirecionamento para `burgersnsmoke.com`; conteúdo de hamburgueria não faz parte da superfície pública do Cuiabar.
- A rota `/api/*` tambem deve permanecer em `assets.run_worker_first` para que mutacoes e respostas operacionais do Worker nao sejam interceptadas pelo handler de assets.
- `burgersnsmoke.com` e `www.burgersnsmoke.com` não devem constar em `wrangler.jsonc` deste repositório; esses custom domains pertencem ao Worker standalone `burgersnsmoke`.
- O host legado `burger.cuiabar.com` deve permanecer como redirecionamento para `https://burgersnsmoke.com/`.

### Worker principal

- O Worker principal é `cuiabar-crm`.
- A configuração está em `wrangler.jsonc`.
- O deploy operacional usa `wrangler deploy`.

### Workers auxiliares de MCP e Actions

- `services/google-ads-mcp/` publica `google-ads-mcp.cuiabar.com`.
- `services/google-business-mcp/` publica `google-business-mcp.cuiabar.com`.
- `services/meta-ads-actions/` publica `meta-ads-actions.cuiabar.com`.
- `services/email-mcp/` publica `email-mcp.cuiabar.com`.
- `services/whatsapp-marketing-mcp/` publica `whatsapp-marketing-mcp.cuiabar.com`.
- Cada serviço auxiliar tem `wrangler.jsonc` próprio e deve ser publicado a partir da sua pasta.
- O `whatsapp-marketing-mcp` depende de `MCP_BEARER_TOKEN`, `GHCO_COMMS_BRIDGE_TOKEN` e de um `GHCO_COMMS_BRIDGE_URL` HTTPS acessível pelo Worker. Não usar `127.0.0.1` em produção. Para mídia, o GPT deve preferir `mediaUrl` HTTPS; `filePath` só funciona quando o arquivo existe no host do bridge.
- O `email-mcp` depende de `EMAIL_MCP_BEARER_TOKEN`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN` e `GMAIL_SENDER_EMAIL`; sem esses secrets o Worker publica o schema, mas o health fica `ok:false` e nenhuma Action autenticada consegue operar.
- O `google-business-mcp` depende de `GOOGLE_BUSINESS_ACTIONS_BEARER_TOKEN`, `GOOGLE_BUSINESS_CLIENT_ID`, `GOOGLE_BUSINESS_CLIENT_SECRET` e `GOOGLE_BUSINESS_REFRESH_TOKEN`; `GOOGLE_BUSINESS_DEFAULT_ACCOUNT` e `GOOGLE_BUSINESS_DEFAULT_LOCATION` sao opcionais, mas recomendados para reduzir ambiguidade nas Actions do GPT.

## Regras importantes

- O token de deploy do Worker precisa enxergar `Workers`, `KV` e `D1`.
- O binding `WHATSAPP_KV` deve permanecer com `id` explícito no `wrangler.jsonc`.
- O host oficial do `MeuCuiabar` é `meu.cuiabar.com`.
- O host oficial do `ProRefeição` é `prorefeicao.cuiabar.com`.
- O host oficial do Burgers N' Smoke é `burgersnsmoke.com`, mas sua operação/deploy não pertence mais ao `GHCO OS`.
- O host `burger.cuiabar.com` é legado e deve redirecionar para `burgersnsmoke.com`.
- A página `/delivery` é a superfície canônica de canais de pedido do `cuiabar.com` e não deve redirecionar para `/expresso`.
- `cuiabar.com/prorefeicao` deve permanecer apenas como redirecionamento `301` para o subdomínio dedicado.
- O alias `crm.cuiabar.com/meucuiabar*` deve permanecer apenas como redirecionamento de compatibilidade.

## Relação com GitHub

- O GitHub é a base oficial de versionamento.
- O deploy operacional não depende de push em `main`.
- O workflow do GitHub permanece apenas como contingência manual.
- O repositório oficial é `GHCO-OS/cuiabar-web`.

## Riscos operacionais

- Token do Cloudflare expirado ou com permissão incompleta.
- Secrets ausentes no ambiente Cloudflare.
- Migrações D1 não aplicadas no banco remoto.
- Sessão do Baileys perdida no runtime local.
- Warnings de SSR com `<Navigate>` ainda presentes no build.
