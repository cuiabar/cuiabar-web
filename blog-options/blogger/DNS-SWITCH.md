# Switch de DNS para Blogger

Estado observado em 2026-04-06:

- `blog.cuiabar.com` responde `200`, mas ainda entrega o blog estático antigo.
- `www.blog.cuiabar.com` nao existe no DNS publico.
- A API do Blogger mostra o blog com URL `https://www.blog.cuiabar.com/`.

## Direcao recomendada

Se a URL final desejada for mesmo:

- `blog.cuiabar.com`

entao o ideal e configurar o Blogger diretamente nesse subdominio, sem `www`.

## Ordem correta da virada

1. No painel do Blogger:
   `Settings -> Publishing -> Custom domain`
2. Troque o dominio de publicacao para:
   `blog.cuiabar.com`
3. O Blogger vai mostrar:
   - um CNAME principal apontando para `ghs.googlehosted.com`
   - um segundo CNAME de seguranca com token curto -> token longo
4. No Cloudflare:
   - remova o apontamento antigo de `blog.cuiabar.com` para o blog estatico/Pages
   - crie o CNAME principal do Blogger
   - crie o CNAME de seguranca do Blogger
5. Aguarde a validacao no Blogger.
6. Ative HTTPS redirect no Blogger.

## Registros esperados

O Blogger Help documenta que o subdominio escolhido deve apontar para:

- `ghs.googlehosted.com`

e tambem exige um segundo CNAME de seguranca gerado pelo proprio Blogger.

Exemplo de estrutura:

- `blog` -> `ghs.googlehosted.com`
- `token-curto` -> `gv-token-longo.dv.googlehosted.com`

## Observacao importante sobre Cloudflare

Para validacao do Blogger, o mais seguro e deixar os CNAMEs como:

- `DNS only`

Se houver proxy laranja na frente, a validacao pode ficar inconsistente.

## Impacto da troca

Quando o DNS de `blog.cuiabar.com` for alterado para o Blogger:

- o blog estático atual deixa de responder nesse subdominio;
- o Blogger passa a ser a origem publica do blog;
- os posts e o tema do Blogger passam a ser a experiencia oficial.

## Bloqueio atual nesta maquina

O token `CLOUDFLARE_API_TOKEN` atualmente carregado no ambiente respondeu como invalido no endpoint oficial de verificacao da Cloudflare. Entao a troca automatica via API nao foi executada daqui.

## Fontes oficiais

- Blogger custom domain:
  https://support.google.com/blogger/answer/58317
- Blogger settings / publishing:
  https://support.google.com/blogger/answer/9691230?hl=en
