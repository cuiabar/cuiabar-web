# Integracao completa com Blogger

Esta opcao troca o CMS/headless por uma operacao bem mais simples:

- Blogger hospeda o blog e o painel editorial;
- a API do Google publica os posts automaticamente;
- o visual fica alinhado ao site com HTML/CSS editado no proprio tema do Blogger;
- a monetizacao continua possivel com Google AdSense.

## O que esta pronto neste blueprint

- `scripts/list-blogger-blogs.mjs`
  Lista os blogs disponiveis na conta Google autenticada.
- `scripts/publish-to-blogger.mjs`
  Publica no Blogger os artigos do repositório atual.
- `theme/blogger-head-snippet.html`
  Head pronto para identidade visual e futura insercao do AdSense.
- `theme/cuiabar-blogger-skin.css`
  Base visual inspirada no site atual.
- `deploy.ps1` e `deploy.sh`
  Orquestram o fluxo local.

## Fluxo recomendado

1. Criar o blog no Blogger.
2. Configurar `blog.cuiabar.com` no Blogger.
3. Gerar credenciais OAuth 2.0 no Google Cloud.
4. Rodar `npm run blogger:list` para descobrir o `BLOGGER_BLOG_ID`.
5. Rodar `npm run blogger:publish` para publicar rascunhos ou posts.
6. Refinar o tema em `Theme > Edit HTML`.
7. Ativar monetizacao no `Earnings` / AdSense.

## Upload manual do tema

Se preferir enviar o tema como arquivo do computador, sem editar o HTML no painel:

```powershell
npm run blogger:theme:prepare
```

Arquivos gerados:

- [cuiabar-blogger-theme-upload.xml](/C:/cuiabar-web/blog-options/blogger/upload/cuiabar-blogger-theme-upload.xml)
- [COMO-ENVIAR-NO-BLOGGER.md](/C:/cuiabar-web/blog-options/blogger/upload/COMO-ENVIAR-NO-BLOGGER.md)

O comando tambem deixa uma copia pronta na area de trabalho com o nome `Tema Blog Cuiabar.xml`.

## Credenciais

Copie:

```powershell
Copy-Item blog-options\blogger\.env.example blog-options\blogger\.env
```

Preencha em `blog-options/blogger/.env`:

- `BLOGGER_CLIENT_ID`
- `BLOGGER_CLIENT_SECRET`
- `BLOGGER_REFRESH_TOKEN`
- `BLOGGER_BLOG_ID`

Observacao:

- `GOOGLE_PROFILE_ID` pode ser guardado para conferencia da conta;
- ele nao substitui o `BLOGGER_BLOG_ID`.

## Comandos

Listar blogs da conta autenticada:

```powershell
npm run blogger:auth
npm run blogger:list
```

Se o cliente OAuth for do tipo web e nao aceitar `localhost`, use o fluxo manual:

```powershell
npm run blogger:auth:manual
```

Gerar preview local sem enviar nada:

```powershell
$env:BLOGGER_DRY_RUN = "true"
npm run blogger:publish
```

Publicar no Blogger como rascunho:

```powershell
$env:BLOGGER_DRY_RUN = "false"
$env:BLOGGER_PUBLISH_MODE = "draft"
npm run blogger:publish
```

Publicar no Blogger como post visivel:

```powershell
$env:BLOGGER_DRY_RUN = "false"
$env:BLOGGER_PUBLISH_MODE = "publish"
npm run blogger:publish
```

## Como o script funciona

- usa OAuth 2.0 com refresh token;
- pega os artigos atuais do repositório;
- escolhe `knowledgeArticlesCms` se houver conteudo sincronizado;
- cai para `knowledgeArticlesSeed` se nao houver CMS;
- monta HTML com hero, chips, secoes e CTA;
- envia para o endpoint de posts do Blogger.

## Tema e visual

O Blogger API nao oferece um endpoint oficial para instalar o tema inteiro. A melhor forma de operar fica assim:

- conteudo via API;
- layout via `Theme > Edit HTML`;
- ajuste fino do visual usando os arquivos em `theme/`.

Arquivos principais de layout:

- [theme/cuiabar-blogger-skin.css](/C:/cuiabar-web/blog-options/blogger/theme/cuiabar-blogger-skin.css)
- [theme/blogger-home-hero-widget.html](/C:/cuiabar-web/blog-options/blogger/theme/blogger-home-hero-widget.html)
- [theme/blogger-sidebar-cta-widget.html](/C:/cuiabar-web/blog-options/blogger/theme/blogger-sidebar-cta-widget.html)
- [theme/blogger-footer-widget.html](/C:/cuiabar-web/blog-options/blogger/theme/blogger-footer-widget.html)
- [theme/blogger-adsense-slot-widget.html](/C:/cuiabar-web/blog-options/blogger/theme/blogger-adsense-slot-widget.html)

## Monetizacao

O Blogger continua monetizavel com Google AdSense. Em tema customizado/classic, o proprio Google documenta a opcao de adicionar o codigo de Auto ads no HTML do tema.

## Fontes oficiais

- Blogger API overview:
  [developers.google.com/blogger/docs/3.0/using](https://developers.google.com/blogger/docs/3.0/using)
- Blogger posts insert:
  [developers.google.com/blogger/docs/3.0/reference/posts/insert](https://developers.google.com/blogger/docs/3.0/reference/posts/insert)
- Blogger blogs list for authenticated user:
  [developers.google.com/blogger/docs/3.0/reference/users/blogs/list](https://developers.google.com/blogger/docs/3.0/reference/users/blogs/list)
- AdSense Auto ads no Blogger:
  [support.google.com/adsense/answer/9155509?hl=en](https://support.google.com/adsense/answer/9155509?hl=en)

## Observacao importante

Pela documentacao oficial da API, estou inferindo que nao existe endpoint de tema/template, porque a referencia publica se concentra em blogs, posts, comments, pages e users. Por isso o tema fica no editor HTML do Blogger, nao na API.
