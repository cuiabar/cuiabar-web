# Status atual e pendências

Atualizado em: 2026-05-05

## Estado geral

O projeto está operacional como base única do `GHCO OS`, com três linhas de produto ativas:

- `Cuiabar Web`
- `MeuCuiabar`
- `Cuiabar Atende`

O repositório oficial é `GHCO-OS/cuiabar-web`.

## Ativos em produção

- site principal
- menu e pedidos online
- páginas especiais do Burger, Espetaria e ProRefeição
- página de vagas
- portal de reservas
- CRM
- `MeuCuiabar` em `meu.cuiabar.com`
- atendimento por WhatsApp com ponte Baileys local

## Melhorias já consolidadas

- divisão oficial em linhas de produto
- documentação central em `docs/`
- runbooks específicos em `docs/runbooks/`
- host próprio para `MeuCuiabar`
- shell principal alinhado ao `Cuiabar Atende`
- binding de KV fixado no `wrangler.jsonc`
- migrações remotas do `MeuCuiabar` já aplicadas
- carregamento do `MeuCuiabar` quebrado por página para reduzir o bundle inicial da aplicação
- frente `ProRefeição` migrada para o host dedicado `prorefeicao.cuiabar.com`, com a rota `cuiabar.com/prorefeicao` mantida apenas como redirecionamento permanente
- arquitetura pública reorganizada em três frentes de entrada na raiz do site: `Presencial`, `Expresso` e `Espetaria`, com a home operacional do restaurante movida para `/presencial` e o delivery concentrado em `/expresso`
- primeira tela de `cuiabar.com` simplificada no código como entrada direta, com imagem de produto, frase curta, aviso de Dia das Mães e três ações principais: pedir agora, reservar mesa e ver menu; metadados e schema da raiz foram alinhados à nova intenção pública
- publicação do `cuiabar.com` revisada no Cloudflare Pages em 2026-05-05; auditoria ao vivo registrou 25 URLs de sitemap com HTTP 200 direto, descrição, canonical, Schema.org e ausência de `noindex`, com evidências em `ops-artifacts/seo-live-pages-audit.json`
- sitemap do `cuiabar.com` ajustado para URLs canônicas com barra final, eliminando redirects 308 nas URLs enviadas ao Google
- sistema automatico de reservas pausado publicamente: `/reservas` e `reservas.cuiabar.com` direcionam o cliente para o WhatsApp da loja, e `POST /api/reservations` responde `503` para impedir novos registros automaticos
- host `burger.cuiabar.com` religado na borda do Cloudflare Worker para eliminar a dependência do origin legado que estava fora do ar
- cardápio do Burger Cuiabar centralizado em `src/data/burgerMenu.json`, com fotos novas convertidas para WebP e runbook próprio para futuras atualizações sem divergência entre página, SEO e campanhas
- landing do Burger Cuiabar reestruturada com foco em conversão, escaneabilidade e decisão rápida, com blocos de hero, mais pedidos, combos, curadoria, cardápio completo, diferenciais, FAQ e CTA final
- preços do Burger sincronizados a partir do PDF precificado de loja e iFood, com exibição principal na landing voltada ao valor direto da loja/site e referência operacional documentada para futuras atualizações
- Google Business Profile conectado por API para leitura de perfis, métricas, avaliações, posts e mídia; o perfil do Burgers N' Smoke foi alinhado com nome, site, horários, descrição delivery-only, redes e resposta da primeira avaliação
- campanha operacional de avaliações com foto criada para Burgers N' Smoke e Villa Cuiabar, com templates de WhatsApp/NPS e runbook próprio em `docs/runbooks/google-business-avaliacoes-com-foto.md`
- sprint 4 de Google Business executado com posts novos para Burgers N' Smoke e Villa Cuiabar, limpeza de posts antigos do Villa e respostas públicas em avaliações com assinatura `Equipe Cuiabar 🧡`
- sprint 5 de SEO técnico do Burgers N' Smoke implementado no Worker, com sitemap versionado, redirects canônicos, metadados por página satélite e Schema.org de delivery-only alinhado ao Google Business Profile
- Google Ads publicado e validado no Worker `google-ads-mcp`, com duas superfícies somente leitura: GPT Actions via `https://google-ads-mcp.cuiabar.com/openapi.json` e MCP remoto via `https://google-ads-mcp.cuiabar.com/sse`; ambas usam `MCP_BEARER_TOKEN`, OAuth Google Ads, refresh token, developer token e conta alvo configurados, com runbook em `docs/runbooks/google-ads-mcp.md`
- Meta Ads Actions publicado e validado em `https://meta-ads-actions.cuiabar.com/openapi.json` para GPT personalizado em modo somente leitura, com bearer interno, `META_ACCESS_TOKEN` com `ads_read` e conta `act_1452882208398648` configurados

## Situação do Git

- `main` segue como tronco oficial
- existem branches-base por linha de produto
- o workspace de consolidação está sendo alinhado com a `main` atual
- a limpeza de legados do blog e de materiais paralelos já foi iniciada

## Pendências principais

- continuar a redução do bundle do `MeuCuiabar`, agora com foco em dependências pesadas compartilhadas
- revisar warnings de SSR com `<Navigate>`
- continuar a extração do backend próprio do `MeuCuiabar`
- criar a operação de SEO própria do `ProRefeição` no Search Console e acompanhar a indexação do novo host
- reautorizar o acesso local ao Google Search Console com escopo `https://www.googleapis.com/auth/webmasters`; o token atual do `gcloud` para `cuiabar@cuiabar.net` retorna `ACCESS_TOKEN_SCOPE_INSUFFICIENT` para a API Search Console
- evoluir os sprints de SEO local do Google Business Profile, incluindo posts semanais, mídia recente e respostas de avaliações pendentes
- acompanhar limites, permissões e eventual aprovação do developer token do Google Ads caso seja necessário ampliar uso fora de leitura operacional própria
- concluir a documentação institucional e o espelhamento no Wiki do GitHub
- ativar o Wiki do repositório no GitHub para publicar as páginas já preparadas em `docs/wiki/`
- manter a política de segredos fora da árvore pública do repositório

## Direção imediata

- consolidar a documentação em pt-BR
- remover documentação paralela e arquivos soltos
- publicar a documentação oficial no Wiki do repositório
- concluir o merge da branch de consolidação na `main`
- evoluir o portal de entrada da marca com refinamento visual e acompanhamento dos sinais de navegação e indexação nas novas rotas `/presencial` e `/expresso`
