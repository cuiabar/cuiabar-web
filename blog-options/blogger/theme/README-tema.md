# Tema Blogger com cara do site

O Blogger nao expõe um endpoint oficial de API para enviar o tema inteiro. Entao o fluxo recomendado fica assim:

1. Use a API para publicar posts e paginas.
2. Use o editor de tema do Blogger para aplicar o HTML/CSS da identidade visual.
3. Ative monetizacao no proprio Blogger/AdSense.

## Arquivos deste kit

- `blogger-head-snippet.html`
  Cole dentro de `<head>` no `Theme > Edit HTML`.
- `cuiabar-blogger-skin.css`
  Cole dentro do bloco `<b:skin><![CDATA[ ... ]]></b:skin>` ou em um `<style>` do tema.
- `blogger-home-hero-widget.html`
  Use em um gadget HTML/JavaScript acima da lista de posts.
- `blogger-sidebar-cta-widget.html`
  Use na sidebar para reforcar reserva/CTA.
- `blogger-footer-widget.html`
  Use no rodape ou em uma area inferior do layout.
- `blogger-adsense-slot-widget.html`
  Bloco visual para reservar espaco a anuncios ou publis.
- `cuiabar-blogger-theme.xml`
  XML completo ja montado com a identidade visual do Cuiabar.

## Upload manual pronto

Para preparar o arquivo final de envio no Blogger:

```powershell
npm run blogger:theme:prepare
```

Esse comando gera:

- `blog-options/blogger/upload/cuiabar-blogger-theme-upload.xml`
- `blog-options/blogger/upload/COMO-ENVIAR-NO-BLOGGER.md`
- uma copia em `Desktop/Tema Blog Cuiabar.xml`

No Blogger, use o fluxo:

1. `Tema`
2. `Mais acoes`
3. `Fazer backup`
4. `Restaurar`
5. selecione o XML gerado no computador

## Estrategia de layout

Os posts enviados pelo script usam classes como:

- `.cuiabar-post`
- `.cuiabar-hero`
- `.cuiabar-summary`
- `.cuiabar-section`
- `.cuiabar-chip`
- `.cuiabar-cta-card`

Isso permite deixar os posts com a linguagem visual do site mesmo antes de refinar a home do Blogger.

## O que vale ajustar no Blogger

No painel do Blogger:

1. `Theme -> Customize`:
   Desative excessos visuais do tema base e mantenha a largura ampla.
2. `Theme -> Edit HTML`:
   Cole o snippet de head e o CSS.
3. `Layout`:
   Adicione um gadget HTML acima dos posts com `blogger-home-hero-widget.html`.
4. `Layout`:
   Mantenha uma sidebar simples com categorias, arquivo e CTA usando `blogger-sidebar-cta-widget.html`.
5. `Layout`:
   Reserve uma area perto do rodape para `blogger-footer-widget.html`.
6. `Layout`:
   Se quiser anuncios manuais, use `blogger-adsense-slot-widget.html` nos pontos mais nobres.
4. `Settings -> Publishing`:
   Conecte `blog.cuiabar.com`.

## Estrutura sugerida de layout

- Topo:
  PageList com links para `Site principal`, `Agenda`, `Menu`, `Reservas`
- Acima dos posts:
  `blogger-home-hero-widget.html`
- Sidebar:
  Categorias, arquivo, CTA, canal WhatsApp, bloco de anuncio
- Rodape:
  `blogger-footer-widget.html`

## Monetizacao

Voce consegue monetizar sim:

- pela aba `Earnings` do Blogger;
- ou com Google AdSense Auto ads, inclusive em tema customizado.

Quando trocar o tema, confira se o codigo do AdSense continua presente no `<head>`.
