# Matriz de arquiteturas para `blog.cuiabar.com`

| Opcao | Tipo | Melhor para | Pontos fortes | Trade-offs | Nota de encaixe |
| --- | --- | --- | --- | --- | --- |
| Astro static | SSG moderno | performance, design premium, SEO | muito rapido, visual livre, excelente DX, bom para integrar APIs | precisa de CMS ou fluxo Git para edicao | Alta |
| Ghost | CMS editorial | time de conteudo, newsletter, memberships | admin excelente, publicacao muito madura, RSS e SEO bons | operacao separada, menos flexivel para front muito custom | Alta |
| Directus | Headless CMS | conteudo como dado, multiplas experiencias | API forte, painel flexivel, automacoes e relacoes | precisa de frontend separado | Alta |
| Hugo static | SSG em Go | baixissimo custo e simplicidade | absurdamente rapido, facil de servir por Nginx | experiencia editorial fraca sem CMS adicional | Media |
| Strapi | Headless CMS | modelagem editorial sob medida | ecossistema forte, admin conhecido | deploy e manutencao mais pesados que Directus | Media |
| Payload | Headless TS | controle total em TypeScript | muito flexivel para time dev | onboarding e manutencao mais tecnicos | Media |

## Leitura rapida

### Se a prioridade for beleza + SEO + controle

Escolha `Astro`.

### Se a prioridade for publicacao facil

Escolha `Ghost`.

### Se a prioridade for um backend de conteudo reutilizavel

Escolha `Directus`.

### Se a prioridade for o menor custo operacional possivel

Escolha `Hugo`.

## Arquiteturas compostas que fazem mais sentido

### Melhor equilibrio geral

- frontend: Astro
- backend editorial: Directus
- host do frontend: Cloudflare Pages ou Nginx
- dominio sugerido do CMS: `blog.cuiabar.com/editor`

### Melhor experiencia editorial pronta

- frontend/publicacao: Ghost
- dominio: `blog.cuiabar.com`

### Menor custo

- frontend/publicacao: Hugo
- deploy estatico por Nginx

## Recomendacao final

1. `Astro + Directus`
2. `Ghost`
3. `Hugo`
