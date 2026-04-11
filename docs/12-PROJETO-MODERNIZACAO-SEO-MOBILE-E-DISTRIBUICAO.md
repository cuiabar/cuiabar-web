# Projeto de Modernização SEO, Mobile e Distribuição

## Objetivo

Elevar o ecossistema web Cuiabar em quatro frentes:

1. Melhorar indexação e descoberta orgânica.
2. Melhorar performance real em mobile-first.
3. Integrar dados de busca e presença local com Google e Bing.
4. Reduzir peso de mídia com automações de edge na Cloudflare.

## Diagnóstico resumido

O projeto atual já possui uma base acima da média para SEO técnico:

- prerender por rota;
- `title`, `meta description`, `canonical`, Open Graph e Twitter Card;
- JSON-LD por rota;
- `robots.txt` e `sitemap.xml`;
- deploy automático por GitHub Actions + Cloudflare;
- budgets locais de performance.

O principal gargalo não é ausência de SEO técnico. O principal gargalo é:

- autoridade local ainda fragmentada entre site oficial, delivery e resultados antigos;
- falta de automação em Search Console / Bing;
- imagens ainda pesadas em áreas promocionais;
- crescimento do frontend perto do limite de CSS/JS definido pelo próprio projeto;
- falta de rotina automatizada para descoberta local e atualização de sinais de frescor.

## Resposta objetiva sobre APIs Google

### O que é possível

Podemos integrar:

- Google Search Console API:
  - submissão de sitemap;
  - leitura de cobertura / indexação;
  - inspeção de URLs;
  - coleta de consultas, páginas e CTR.

- Google Business Profile APIs:
  - leitura e gestão de dados do perfil;
  - integração de fluxos internos para operação de presença local;
  - em cenários compatíveis, suporte a reviews, posts, dados do perfil e ações ligadas à presença comercial.

### O que ainda falta

Para Business Profile API, Google exige OAuth 2.0 com uma conta que tenha posse do perfil. Service account sozinha não resolve esse fluxo padrão de gestão do perfil.

Para Search Console API, service account funciona se a propriedade tiver acesso concedido a essa conta.

## Resposta objetiva sobre Cloudflare para imagens e vídeos

### Imagens

Sim, faz sentido usar Cloudflare para reduzir peso visual com automação.

Caminhos recomendados:

1. Cloudflare Images / Transformations:
   - gerar variantes por largura;
   - servir WebP/AVIF quando suportado;
   - cortar e redimensionar no edge;
   - reaproveitar a mesma origem com múltiplos formatos.

2. Cache Rules:
   - TTL maior para mídia estática;
   - política mais agressiva para imagens públicas;
   - separação entre HTML dinâmico e assets.

3. Worker para mídia:
   - padronizar URLs de imagem;
   - aplicar presets como `hero`, `card`, `thumb`, `social`;
   - reduzir necessidade de múltiplos arquivos manuais.

### Vídeos

Para vídeos promocionais, o ideal é Cloudflare Stream:

- encode automático;
- entrega adaptativa por banda;
- melhor playback em rede móvel;
- analytics próprios;
- menos peso operacional do que servir MP4 cru.

## Recomendação de arquitetura

### Não recomendado agora

Não recomendo reescrever tudo imediatamente.

O site atual já entrega HTML indexável. Uma migração total agora aumentaria risco sem gerar ganho proporcional no curto prazo.

### Recomendação principal

Adotar uma modernização em fases:

1. estabilizar e otimizar a base atual;
2. mover o conteúdo institucional e de descoberta orgânica para uma camada ainda mais enxuta;
3. manter CRM, reservas e fluxos operacionais separados da camada pública.

### Stack recomendada

#### Camada pública institucional

Astro é a opção mais forte para as páginas públicas de descoberta:

- HTML estático muito leve;
- estratégia de islands, carregando JavaScript só onde há interação;
- excelente para home, menu, agenda, links, blog, páginas locais e landing pages;
- encaixa bem com Cloudflare Pages.

#### Camada operacional / app

Manter React para:

- CRM;
- reservas;
- fluxos autenticados;
- áreas onde interação pesada compensa um app mais dinâmico.

#### Conclusão de stack

Arquitetura recomendada:

- `marketing/publico`: Astro
- `crm/reservas/apps`: React atual ou React modularizado
- `worker/api`: Cloudflare Workers
- `media`: Cloudflare Images + Stream

## Projeto recomendado

### Fase 1 - Ganho rápido sem migração

Objetivo: melhorar descoberta e mobile sem reescrever o site.

Entregas:

- implementar integração com Search Console API;
- implementar submissão automática de sitemap;
- implementar inspeção programática de URLs estratégicas;
- implementar IndexNow para Bing;
- padronizar UTM em links de Google, Instagram, WhatsApp e delivery;
- revisar canonicals, redirects e rotas espelho;
- criar política de mídia com Cloudflare Images;
- revisar imagens LCP e imagens do universo burger;
- reduzir CSS e JS perto dos budgets atuais.

### Fase 2 - Presença local e Business Profile

Objetivo: aumentar descoberta em Google Search e Maps.

Entregas:

- conectar Business Profile com OAuth;
- auditar nome, categorias, horários, serviços e atributos;
- publicar links oficiais rastreáveis com UTM;
- estruturar rotina de posts do perfil;
- estruturar rotina de captura e resposta de reviews;
- alinhar menu do Google com o menu do site;
- criar página de avaliação e QR de reviews.

### Fase 3 - Migração da camada pública

Objetivo: ganhar mais performance e previsibilidade de indexação.

Entregas:

- migrar home, menu, agenda, prorefeição, blog e páginas locais para Astro;
- manter CRM e reservas em apps isolados;
- compartilhar design tokens e conteúdo centralizado;
- gerar HTML estático para rotas de descoberta;
- reduzir dependência de JavaScript no marketing.

### Fase 4 - Escala de conteúdo e distribuição

Objetivo: transformar o site em máquina de descoberta local.

Entregas:

- calendário editorial local;
- páginas por intenção de busca;
- automação de redistribuição para redes;
- imagens sociais por rota;
- dashboards com Search Console + Bing + analytics do site.

## O que faremos na prática

### Projeto recomendado para execução

#### Bloco A - Integrações e indexação

- Search Console API
- Bing / IndexNow
- automação de sitemaps
- inspeção de URLs críticas

#### Bloco B - Presença local

- Google Business Profile
- reviews
- links com UTM
- menu e atributos locais

#### Bloco C - Performance visual

- Cloudflare Images
- variantes e formatos modernos
- cache de edge para mídia
- política de vídeo com Cloudflare Stream

#### Bloco D - Arquitetura

- manter base atual no curto prazo;
- preparar migração gradual do marketing para Astro;
- preservar apps operacionais em React.

## Decisão recomendada

Decisão recomendada para o Cuiabar:

- não fazer rewrite completo agora;
- modernizar o que existe imediatamente;
- usar Google APIs para dados e indexação;
- usar Cloudflare para mídia e edge;
- migrar somente a camada pública para Astro quando a fase 1 e 2 estiverem estáveis.

## Critério de sucesso

O projeto estará no caminho certo quando:

- o site carregar melhor no mobile;
- as imagens promocionais caírem de peso sem perda perceptível;
- o Google consolidar o domínio oficial como resultado principal;
- o perfil do Google ganhar mais visualizações, ações e reviews;
- as rotas principais forem rastreadas e indexadas com mais previsibilidade;
- o marketing público ficar mais leve do que a camada operacional.
