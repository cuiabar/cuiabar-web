# Integracao completa do Editor (Directus + Blog Cuiabar)

Este blueprint entrega um painel de edicao real para o blog. No momento, o modo recomendado e local-only nesta maquina; quando o editor for movido para o servidor principal, o mesmo stack pode voltar a expor o painel online.

## 1) Subir o painel do CMS

Linux/macOS:

```bash
cd blog-options/directus
cp .env.example .env
bash deploy.sh
```

Windows PowerShell:

```powershell
Set-Location blog-options/directus
Copy-Item .env.example .env
.\deploy.ps1
```

Ou, pela raiz do projeto, execute o orquestrador:

```powershell
.\scripts\run-editorial-operation.ps1
```

Se o Docker Desktop estiver bloqueado por permissao administrativa, use WSL2:

```bash
wsl -d Ubuntu -e sh -lc "apt-get update && apt-get install -y docker.io docker-compose-v2"
wsl -d Ubuntu -e sh -lc "cd /mnt/c/cuiabar-web/blog-options/directus && docker compose up -d"
```

Painel local: `http://127.0.0.1:8055/admin`
Login manual atual: `leonardo@cuiabar.net`

Por padrao, o compose sobe apenas `database`, `cache` e `directus`. O `cloudflared` ficou em profile `remote`, para nao expor o editor online enquanto estamos testando nesta maquina.

## 2) Exposicao online futura

- URL publica do blog: `https://blog.cuiabar.com`
- URL editorial planejada: `https://blog.cuiabar.com/editor`
- Upstream oculto opcional: `https://blog-editor-origin.cuiabar.com`
- Use o arquivo `nginx-blog.conf` no servidor Nginx principal.
- Para TLS, aplique Certbot no host `blog.cuiabar.com` apos validar DNS.
- No stack Cloudflare usado neste projeto, a rota `/editor` pode ser publicada via Worker proxy + Tunnel apontando para o Directus local.
- O compose tambem pode subir o `cloudflared` no dia em que quisermos religar o acesso remoto:

```bash
COMPOSE_PROFILES=remote docker compose up -d
```

- Enquanto estivermos nesta maquina, mantenha o acesso apenas por `http://127.0.0.1:8055/admin`.

## 3) Estrutura de colecoes recomendada (no painel)

Colecao: `blog_posts`

- `title` (string, obrigatorio)
- `slug` (string, unico, obrigatorio)
- `excerpt` (text, obrigatorio)
- `summary` (text, obrigatorio)
- `category` (string, obrigatorio)
- `eyebrow` (string)
- `read_time` (string, ex: `6 min`)
- `publish_date` (datetime, obrigatorio)
- `status` (status: draft/published)
- `keywords` (json ou texto CSV)
- `cover_image` (file, opcional)
- `cover_image_external_url` (string, opcional)

Campo JSON recomendado no `blog_posts`:

- `sections` (json, array de blocos `{ "title": "...", "body": "...", "sort": 1 }`)

Obs: se preferir relacional, voce pode usar uma colecao `blog_post_sections`; o script de sync aceita os dois formatos.

## 4) Criar token para sincronizacao

No Directus:

1. `Settings -> Access Policies` (policy com leitura em `blog_posts`)
2. `Settings -> API Tokens`
3. Crie um token de leitura para build/deploy do blog

Guarde o token como segredo de pipeline (`DIRECTUS_TOKEN`).

## 5) Sincronizar conteudo com o blog atual

Na raiz do repositorio (`C:\cuiabar-web`):

```bash
DIRECTUS_URL=http://127.0.0.1:8055 DIRECTUS_TOKEN=SEU_TOKEN npm run sync:blog-content
```

No Windows PowerShell:

```powershell
$env:DIRECTUS_URL = "http://127.0.0.1:8055"
$env:DIRECTUS_TOKEN = "SEU_TOKEN"
npm run sync:blog-content
```

No WSL2 (quando o Directus estiver rodando dentro do Ubuntu):

```bash
wsl -d Ubuntu -e sh -lc "cd /mnt/c/cuiabar-web && DIRECTUS_URL=http://localhost:8055 DIRECTUS_ADMIN_EMAIL=admin@cuiabar.com DIRECTUS_ADMIN_PASSWORD='SENHA_ADMIN' node scripts/sync-blog-content-from-directus.mjs"
```

O script atualiza `src/data/knowledgeArticlesCms.ts` automaticamente.

## 6) Build e publicacao do blog com conteudo do painel

```bash
DIRECTUS_URL=http://127.0.0.1:8055 DIRECTUS_TOKEN=SEU_TOKEN npm run deploy:blog:cms
```

Esse comando faz:

1. sync do conteudo no Directus
2. build do blog
3. deploy no Cloudflare Pages (`cuiabar-blog`)

## 7) Onde editar os posts no dia a dia

Voce edita em:

- `http://127.0.0.1:8055/admin`
- ou pelo atalho `Editor do Blog Cuiabar` criado na Area de Trabalho

## 7.1) Login com Google, no estilo do CRM

O Directus aceita SSO com Google usando OpenID Connect. Para este projeto:

- mantenha `PUBLIC_URL=https://blog.cuiabar.com/editor`
- use o mesmo `AUTH_GOOGLE_CLIENT_ID` do CRM
- configure `AUTH_GOOGLE_CLIENT_SECRET` do mesmo app Google
- deixe `AUTH_GOOGLE_ALLOW_PUBLIC_REGISTRATION=false` para restringir acesso apenas a usuarios ja criados no Directus
- opcionalmente troque `AUTH_DISABLE_DEFAULT=true` quando quiser remover o login por email/senha e deixar apenas Google

Observacao importante: isso reaproveita o mesmo provedor Google do CRM, mas a sessao do Directus continua independente da sessao do CRM. Esse passo fica pausado enquanto o editor estiver local-only.

Fluxo operacional:

1. criar/editar post
2. mudar status para `published`
3. rodar `npm run deploy:blog:cms`

## 8) Comportamento de fallback

Se o Directus nao estiver configurado no ambiente de build, o projeto continua funcional com artigos seed locais em `src/data/knowledgeArticlesSeed.ts`.
