# Escopo de possibilidades para um blog premium da Cuiabar

## 1. Objetivo do produto

Construir um blog que nao seja apenas "pagina de posts", e sim uma camada editorial/comercial para:

- captacao organica local
- reforco de marca
- distribuicao de agenda e eventos
- conversao para reservas, delivery e WhatsApp
- criacao de ativos de conteudo reutilizaveis

## 2. Oportunidade no contexto atual

O projeto ja tem:

- paginas locais
- agenda
- reservas
- CTA para WhatsApp e canal
- base SEO e analytics

Isso permite que o blog vire um hub que conecta:

- descoberta -> leitura -> prova social -> conversao

## 3. Experiencia desejada

### 3.1 Visual

- design editorial premium, nao institucional
- hero modular com imagem, playlist, clima e CTA
- transicoes suaves, reveals, parallax leve e motion com fallback para `prefers-reduced-motion`
- capas fortes para agenda, bastidores, gastronomia, bairros e guias

### 3.2 Conteudo

- posts editoriais tradicionais
- paginas evergreen de SEO local
- paginas de agenda com indexacao propria
- colecoes especiais:
  - "onde comer em Campinas"
  - "musica ao vivo"
  - "almoco executivo"
  - "espaco kids"
  - "restaurantes perto de ..."

### 3.3 Conversao

- CTA contextual por categoria
- modulos "Reserve agora", "Ver menu", "Pedir delivery", "Entrar no canal"
- propagacao de UTM entre `cuiabar.com`, `blog.cuiabar.com` e `reservas.cuiabar.com`
- pixel e analytics por clique de CTA

## 4. Funcoes inovadoras e interessantes

### P0 - altissimo impacto

- hero editorial dinamico com destaque da semana
- posts relacionados por tema, bairro e intencao
- CTA contextual por clima e horario
- blocos de agenda integrados dentro do artigo
- card de WhatsApp channel no final do post
- schema completo para `BlogPosting`, `BreadcrumbList` e `FAQPage`

### P1 - diferenciais de marca

- modulo Spotify com playlist do fim de semana, artista da noite ou clima da casa
- previsao do tempo com copy dinamica:
  - chuva: delivery, pratos quentes, reservas cobertas
  - calor: chope, drinks, area aberta
- bloco "proximo evento" puxado da agenda
- vitrine de pratos ligada a posts
- busca interna com filtros por categoria, bairro, ocasiao e horario

### P2 - inovacao editorial/comercial

- automacao de publicacao com pauta e calendario editorial
- recomendacao de CTA por origem do trafego
- landing pages semi-programaticas por bairro ou ocasiao
- newsletter e RSS
- indice de guias locais
- pagina de autor/equipe/curadoria
- wall de prova social com reviews, fotos e destaques

## 5. Integracoes sugeridas

## Spotify

- playlist embed por artigo
- playlist oficial "trilha da semana"
- trilha por evento de agenda
- possivel uso em hero editorial ou pagina de sexta/sabado

## Tempo

- OpenWeather ou WeatherAPI
- usar dados de:
  - temperatura
  - chuva
  - condicao atual
  - previsao para noite/fim de semana

## WhatsApp

- botao de conversa
- link para o canal
- popup contextual com controle de frequencia
- analytics separados para:
  - contato comercial
  - reserva
  - canal

## Publicacao e distribuicao

- feed RSS
- sitemap de artigos
- sitemap de categorias
- Open Graph por artigo
- cards otimizados para WhatsApp, Instagram, Facebook e X
- integracao com Search Console e GA4

## APIs e automacoes adicionais

- recomendacoes locais em JSON
- webhook de publicacao para regenerar sitemap/feeds
- notificacao interna a cada artigo publicado
- sincronizacao com CRM para identificar origem editorial

## 6. Tipos de conteudo recomendados

### Conteudo evergreen

- guias de bairro
- ocasioes especiais
- listas de recomendacao local
- duvidas frequentes

### Conteudo recorrente

- agenda de musica
- novidades do cardapio
- datas sazonais
- bastidores e cultura da marca

### Conteudo comercial de apoio

- reservas para aniversarios
- restaurante para grupos
- almoco executivo
- delivery corporativo
- eventos e confraternizacoes

## 7. Requisitos tecnicos obrigatorios

- publicacao com slug, author, category, tags e cover
- drafts, scheduled posts e preview
- canonical e noindex por item
- schema estruturado
- imagem OG por artigo
- sitemap e RSS automaticos
- search
- paginas rapidas em mobile
- analytics por CTA

## 8. Arquiteturas mais aderentes

### Astro static

Melhor para:

- performance
- liberdade visual
- SEO tecnico
- custo baixo

Ideal quando o blog e vitrine editorial/comercial e pode consumir um CMS headless.

### Ghost

Melhor para:

- experiencia de publicacao
- newsletters
- memberships
- time editorial independente

Ideal quando existe rotina forte de conteudo e foco em distribuicao recorrente.

### Directus

Melhor para:

- modelagem flexivel
- API REST/GraphQL
- reutilizar o mesmo conteudo no site, CRM e futuras experiencias

Ideal quando a Cuiabar quer conteudo como dado reutilizavel, nao so como post.

### Hugo

Melhor para:

- ultra simplicidade
- custo minimo
- poucas dependencias

Ideal para blog mais tecnico e estatico.

## 9. Recomendacao pragmatica para Cuiabar

### Opcao recomendada agora

`Astro no frontend + Directus no backend editorial`

Motivos:

- melhor encaixe com o stack atual
- desempenho muito forte para SEO local
- liberdade para criar um blog realmente bonito
- Directus pode virar fonte unica para blog, agenda, guias e vitrines
- front pode continuar com identidade premium do site atual

### Opcao alternativa forte

`Ghost`

Motivos:

- sobe rapido
- painel de publicacao excelente
- editor maduro
- newsletter nativa e memberships

Trade-off:

- menos liberdade arquitetural para experiencias bem customizadas
- fica mais isolado do ecossistema atual

## 10. Roadmap sugerido

### Fase 1 - fundacao

- escolher arquitetura
- subir `blog.cuiabar.com`
- definir taxonomias
- padronizar schema, sitemap, RSS e analytics
- ligar CTAs para menu, agenda, reservas e WhatsApp

### Fase 2 - integracoes premium

- Spotify
- tempo
- busca
- recomendacoes relacionadas
- automacao editorial

### Fase 3 - crescimento

- conteudo programatico de SEO local
- newsletter
- pagina de autor
- analytics editorial por cluster de conteudo
- score de conversao por tipo de artigo
