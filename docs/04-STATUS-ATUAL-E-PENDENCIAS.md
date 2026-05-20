# Status atual e pendências

Atualizado em: 2026-05-14

## Estado geral

O projeto está operacional como base única do `GHCO OS`, com três linhas de produto ativas:

- `Cuiabar Web`
- `MeuCuiabar`
- `Cuiabar Atende`

O repositório oficial é `GHCO-OS/cuiabar-web`.

## Ativos em produção

- site principal
- menu e pedidos online
- páginas especiais de Espetaria e ProRefeição
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
- tela de escolha de serviço removida da raiz em 2026-05-06; a home passou a exibir estética de Dia das Mães com tarja corrente, corações, flores, chamada para 10/05 e show especial MPB, mantendo as frentes `Presencial`, `Expresso` e `Espetaria` documentadas e acessíveis por rotas próprias
- landing permanente do restaurante implantada na raiz em 2026-05-06, substituindo a abordagem temporária de evento por uma página focada em conversão: costela, fraldinha, linguiça cuiabana, música ao vivo, bar completo, espaço kids, almoço executivo, prova social, reserva e delivery
- página `/agenda` simplificada em 2026-05-06 para remover cards superiores de programação recorrente, reforçar a identidade musical brasileira da casa e colocar a agenda Google oficial como elemento principal
- bloco 1 de SEO técnico iniciado em 2026-05-07, com head base revisado, metadados de raiz e `/menu` reforçados, manifest PWA, ícones, apple touch icon, favicon ICO e imagem Open Graph oficial em `public/`
- bloco 2 de acessibilidade estrutural iniciado em 2026-05-07, com skip link global, `main#main-content` único no shell público, navegação principal/rodapé rotuladas, menu mobile com `aria-expanded`/`aria-controls` e foco visível padronizado
- bloco 3 de conversão iniciado em 2026-05-07, com status operacional dinâmico na home e no rodapé, além de botão flutuante de WhatsApp visível também no desktop para reduzir atrito de contato
- bloco 4 de cardápio e SEO de navegação iniciado em 2026-05-07, com breadcrumb semântico em `/menu`, busca instantânea por item/descrição/preço/variante, filtros por categoria e estado vazio para reduzir atrito na escolha
- bloco 5 de performance iniciado em 2026-05-07, com `public/_headers` para cache estático no Cloudflare Pages, imagens críticas da home com dimensões declaradas, uso de WebP com fallback e remoção de imagens externas do Wix nos destaques do menu
- bloco 6 de QA e fechamento iniciado em 2026-05-07, com validação renderizada via Browser plugin nas rotas `/`, `/menu` e `/delivery`, interação real na busca do cardápio, correção do bloqueio local causado por `ops-artifacts/` no Vite e recalibração do orçamento de CSS para a superfície consolidada atual
- publicação completa executada em 2026-05-07 com `npm run deploy:pages` e `npm run deploy:worker`; validação ao vivo confirmou HTTP 200 em `https://cuiabar.com/`, `/menu/`, `/delivery/`, `/sitemap.xml` e `https://burgersnsmoke.com/`
- página `/delivery` higienizada em 2026-05-06 como tela isolada de canais oficiais de pedido, sem nav/rodapé completos, com quatro saídas: pedido direto da loja, iFood do restaurante, 99Food do restaurante e 99Food da marmitaria Expresso
- referências públicas de hamburgueria removidas do frontend principal do `cuiabar.com`; rotas antigas `/burger`, `/burguer`, `/burguer-cuiabar` e satélites legadas passam a redirecionar para `burgersnsmoke.com`
- publicação do `cuiabar.com` revisada no Cloudflare Pages em 2026-05-05; auditoria ao vivo registrou 25 URLs de sitemap com HTTP 200 direto, descrição, canonical, Schema.org e ausência de `noindex`, com evidências em `ops-artifacts/seo-live-pages-audit.json`
- sitemap do `cuiabar.com` ajustado para URLs canônicas com barra final, eliminando redirects 308 nas URLs enviadas ao Google
- sistema automatico de reservas pausado publicamente: `/reservas` e `reservas.cuiabar.com` direcionam o cliente para o WhatsApp da loja, e `POST /api/reservations` responde `503` para impedir novos registros automaticos
- host `burger.cuiabar.com` mantido apenas como redirecionamento legado para `burgersnsmoke.com`
- Google Business Profile conectado por API para leitura de perfis, métricas, avaliações, posts e mídia; o perfil do Burgers N' Smoke foi alinhado com nome, site, horários, descrição delivery-only, redes e resposta da primeira avaliação
- campanha operacional de avaliações com foto criada para Burgers N' Smoke e Villa Cuiabar, com templates de WhatsApp/NPS e runbook próprio em `docs/runbooks/google-business-avaliacoes-com-foto.md`
- sprint 4 de Google Business executado com posts novos para Burgers N' Smoke e Villa Cuiabar, limpeza de posts antigos do Villa e respostas públicas em avaliações com assinatura `Equipe Cuiabar 🧡`
- sprint 5 de SEO técnico do Burgers N' Smoke implementado no Worker, com sitemap versionado, redirects canônicos, metadados por página satélite e Schema.org de delivery-only alinhado ao Google Business Profile
- Google Ads publicado e validado no Worker `google-ads-mcp`, com duas superfícies: GPT Actions via `https://google-ads-mcp.cuiabar.com/openapi.json` e MCP remoto via `https://google-ads-mcp.cuiabar.com/sse`; ambas usam `MCP_BEARER_TOKEN`, OAuth Google Ads, refresh token, developer token e conta alvo configurados, mantêm consultas por GAQL `SELECT`, retornam erros estruturados em `gaql-v2` e permitem escrita para editores autenticados via `mutate-v2` e `create-search-ad-bundle-v2`, com runbook em `docs/runbooks/google-ads-mcp.md`
- Email MCP criado e publicado em 2026-05-18 em `services/email-mcp/`, com GPT Actions/OpenAPI em `https://email-mcp.cuiabar.com/openapi.json` e health em `https://email-mcp.cuiabar.com/health`; o serviço usa Gmail API oficial, Bearer token dedicado `EMAIL_MCP_BEARER_TOKEN`, remetente restrito por `GMAIL_SENDER_EMAIL=clientes@cuiabar.net`, escrita com `validateOnly` por padrão e ferramentas para envio, rascunho, resposta, encaminhamento, leitura e chamada genérica controlada da Gmail API. O envio unitario real foi validado via gateway interno do CRM; o MCP passou a separar `messageType` entre `transactional`, `editorial` e `marketing` para reduzir sinais promocionais em disparos individuais. Recursos completos de leitura, rascunho, anexos e endpoints livres ainda exigem secrets diretos de OAuth no Worker `email-mcp`.
- Meta Ads Actions publicado e validado em `https://meta-ads-actions.cuiabar.com/openapi.json` para GPT personalizado, com bearer interno, `META_ACCESS_TOKEN` com leitura e conta `act_1452882208398648` configurados; a API permite escrita para editores autenticados por Bearer token via funcoes especificas e via camada generica `meta-graph-request`/batch para qualquer node/edge da Marketing API, com payload livre e suporte a campanhas completas com multiplos conjuntos/anuncios, exigindo `ads_management` para escrita real
- campanha de Dia das Mães encerrada em 2026-05-11; a raiz voltou para a landing permanente do restaurante, o header voltou a exibir a navegação completa, o rodapé voltou para o shell público e `/menu` voltou a publicar o cardápio completo no sitemap
- fotos principais do cardápio revisadas em 2026-05-11: miniaturas antigas de 60x60 foram substituídas por exports 600x600, WebP do menu foi regenerado e os destaques da home deixaram de usar WebP legado de baixa qualidade
- discrição pública aplicada em 2026-05-14 por motivo jurídico: fotos do espaço físico foram removidas do site público, imagens de hero/vagas/agenda passaram a usar produto ou blocos gráficos, endereço completo/mapas/coordenadas deixaram de aparecer no frontend público e rotas SEO locais foram trocadas por URLs genéricas de Campinas; localização detalhada deve ser tratada somente pelos canais oficiais.
- base do WhatsApp Marketing MCP criada em 2026-05-15 em `services/whatsapp-marketing-mcp/`, com GPT Actions/OpenAPI e MCP remoto planejados para `whatsapp-marketing-mcp.cuiabar.com`; a implementação aplica consentimento, opt-out, identificação do remetente e validação por padrão no envio real, sem mecanismos de contorno de bloqueios. No mesmo dia, o serviço passou a expor formatação WhatsApp padronizada, envio unitário de foto, vídeo, áudio e documento, modo de treino/validação sem exigir consentimento no payload e `form` com opcoes numeradas e resposta automatica unica como alternativa de custo zero a botoes oficiais.
- em 2026-05-16, o Burgers N' Smoke foi separado do ecossistema Cuiabar: o `GHCO OS` deixou de servir `burgersnsmoke.com` no Worker principal e passou a manter somente redirecionamentos legados de `/burger*`, `/burguer*`, `/burger-n-smoke`, páginas satélite antigas e `burger.cuiabar.com` para `https://burgersnsmoke.com/`. O site, assets, sitemap, robots, Schema.org e deploy do domínio ficam no projeto standalone `burgersnsmoke`.
- em 2026-05-18, foi criada a primeira versão funcional da intranet privada `GHCO OS — Manual Operacional` em `/os`, com módulos de Atendimento, Delivery, POPs, Conversão de Vendas e Recomendações de Serviço. A versão inicial usa conteúdo versionado em `src/modules/os/`, busca local simples, layout mobile-first e anti-indexação por meta robots e `X-Robots-Tag`; autenticação definitiva ficou preparada no `ProtectedLayout`, mas ainda não implementada.
- em 2026-05-20, foi criada a base do `google-business-mcp` em `services/google-business-mcp/`, com Actions/OpenAPI para GPT personalizado ler contas, locais, avaliações, posts, mídia, métricas e executar escritas controladas no Google Business Profile por `validateOnly`.

## Situação do Git

- `main` segue como tronco oficial
- existem branches-base por linha de produto
- o workspace de consolidação está sendo alinhado com a `main` atual
- a limpeza de legados do blog e de materiais paralelos já foi iniciada

## Pendências principais

- continuar a redução do bundle do `MeuCuiabar`, agora com foco em dependências pesadas compartilhadas
- revisar warnings de SSR com `<Navigate>`
- reduzir estruturalmente o CSS/chunks compartilhados entre site público, CRM e MeuCuiabar; o orçamento atual aceita a superfície consolidada, mas a próxima melhoria deve separar melhor estilos/rotas administrativas
- continuar a extração do backend próprio do `MeuCuiabar`
- criar a operação de SEO própria do `ProRefeição` no Search Console e acompanhar a indexação do novo host
- reautorizar o acesso local ao Google Search Console com escopo `https://www.googleapis.com/auth/webmasters`; o token atual do `gcloud` para `cuiabar@cuiabar.net` retorna `ACCESS_TOKEN_SCOPE_INSUFFICIENT` para a API Search Console
- evoluir os sprints de SEO local do Google Business Profile, incluindo posts semanais, mídia recente e respostas de avaliações pendentes
- publicar e validar o `google-business-mcp` em `google-business-mcp.cuiabar.com`, configurar secrets OAuth/Bearer e conectar o schema `/openapi.json` ao GPT personalizado.
- acompanhar limites, permissões e eventual aprovação do developer token do Google Ads caso seja necessário ampliar uso fora de leitura operacional própria
- concluir a documentação institucional e o espelhamento no Wiki do GitHub
- ativar o Wiki do repositório no GitHub para publicar as páginas já preparadas em `docs/wiki/`
- manter a política de segredos fora da árvore pública do repositório
- publicar o bridge `GHCO Comunicacoes` por canal HTTPS seguro antes de habilitar envio real a partir do Worker `whatsapp-marketing-mcp`
- implementar autenticação interna definitiva para `/os` antes de divulgar a intranet para equipe ampla.

## Direção imediata

- consolidar a documentação em pt-BR
- remover documentação paralela e arquivos soltos
- publicar a documentação oficial no Wiki do repositório
- concluir o merge da branch de consolidação na `main`
- acompanhar os sinais de navegação e indexação da nova landing principal, criar páginas satélites permanentes para `Nossos Cortes`, música ao vivo e ProRefeição, e medir cliques em reserva, delivery e cardápio
