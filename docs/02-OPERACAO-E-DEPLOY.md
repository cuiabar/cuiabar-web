# Operação e deploy

Atualizado em: 2026-05-05

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

- O build gera `dist/`.
- O deploy publica no projeto `cuiabar-site` no Cloudflare Pages.
- O comando operacional é `wrangler pages deploy`.
- O sitemap público é gerado por `scripts/generate-seo-assets.mjs` no final do build e deve publicar URLs canônicas com barra final para evitar redirects antes do rastreamento.
- O subdomínio `prorefeicao.cuiabar.com` consome o artefato público do Pages com roteamento via `functions/_middleware.js`, servindo a landing dedicada do `ProRefeição` na raiz do host.
- O host `burgersnsmoke.com` é garantido pelo Worker principal, servindo a landing do Burgers N' Smoke a partir do artefato `/burger-n-smoke` e reescrevendo metadados das páginas satélite na borda.
- O Worker também entrega `/robots.txt`, `/sitemap.xml`, redireciona as páginas satélite para a versão canônica com barra final e substitui o JSON-LD do artefato por Schema.org específico do Burgers N' Smoke, com horário de quarta a sábado, das 18h às 23h, e atendimento exclusivo por delivery.
- As rotas do Burgers N' Smoke em `wrangler.jsonc` precisam permanecer na lista `assets.run_worker_first`; caso contrário, o asset estático do Cuiabar pode responder antes das reescritas de SEO do Worker.
- A rota `/api/*` tambem deve permanecer em `assets.run_worker_first` para que mutacoes e respostas operacionais do Worker nao sejam interceptadas pelo handler de assets.
- `burgersnsmoke.com` e `www.burgersnsmoke.com` ficam configurados como custom domains do Worker em `wrangler.jsonc`, para que o apex e o www tenham DNS/SSL gerenciados na borda.
- O host legado `burger.cuiabar.com` deve permanecer como redirecionamento para `https://burgersnsmoke.com/`.

### Worker principal

- O Worker principal é `cuiabar-crm`.
- A configuração está em `wrangler.jsonc`.
- O deploy operacional usa `wrangler deploy`.

## Regras importantes

- O token de deploy do Worker precisa enxergar `Workers`, `KV` e `D1`.
- O binding `WHATSAPP_KV` deve permanecer com `id` explícito no `wrangler.jsonc`.
- O host oficial do `MeuCuiabar` é `meu.cuiabar.com`.
- O host oficial do `ProRefeição` é `prorefeicao.cuiabar.com`.
- O host oficial do Burgers N' Smoke é `burgersnsmoke.com`.
- O host `burger.cuiabar.com` é legado e deve redirecionar para `burgersnsmoke.com`.
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
