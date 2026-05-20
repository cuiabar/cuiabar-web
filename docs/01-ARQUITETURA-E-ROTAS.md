# Arquitetura e rotas

Atualizado em: 2026-05-11

## Estrutura do sistema

O `GHCO OS` reúne três linhas de produto:

1. `Cuiabar Web`
   Site público, cardápio, páginas especiais, conteúdo institucional e descoberta orgânica.
2. `MeuCuiabar`
   Portal interno para qualidade, HACCP, checklists e rotinas da operação.
3. `Cuiabar Atende`
   CRM, reservas, atendimento digital, campanhas, relacionamento e fidelização.

## Stack principal

- React 18
- Vite 5
- TypeScript
- Tailwind CSS
- React Router DOM
- Cloudflare Pages
- Cloudflare Workers
- Cloudflare D1
- Cloudflare KV
- Workers AI
- Node.js local para a ponte Baileys

## Shell público

O shell público em React mantém um único `main#main-content` por rota renderizada, com skip link global antes da navegação principal. Rotas especiais como `/links`, `/delivery` e a superfície do `ProRefeição` usam o mesmo alvo principal, mesmo quando não exibem header e rodapé completos, para preservar navegação por teclado e leitores de tela.

O componente `OperatingStatus` centraliza a indicação pública de aberto/fechado para delivery e presencial, com atualização no cliente a cada minuto. Ele é exibido na home permanente para apoiar decisão rápida antes de reserva, pedido ou contato pelo WhatsApp.

A rota `/menu` usa os dados versionados em `src/data/menu.json` e adiciona camada de navegação no cliente com busca textual, agrupamento por categoria e seções expansíveis. O conteúdo do cardápio continua centralizado no arquivo de dados para evitar divergência entre página, SEO e operação.

## Estrutura de pastas

```txt
src/
  app/            shell principal e roteamento
  components/     componentes compartilhados
  sections/       blocos reutilizáveis do site
  pages/          páginas públicas
  data/           conteúdo, configuração e SEO
  hooks/          hooks de frontend
  lib/            helpers e integrações do cliente
  styles/         estilos globais e por frente
  crm/            portal do Cuiabar Atende
  meucuiabar/     portal interno do MeuCuiabar
  reservations/   frontend do fluxo de reservas

functions/
  api/            funções do Cloudflare Pages

worker/
  reservations/   backend de reservas
  services/       integrações compartilhadas
  whatsapp/       backend canônico do atendimento por WhatsApp
  whatsapp-intelligence/ worker dedicado e experimental

services/
  whatsapp-baileys/ ponte local do WhatsApp Web
  whatsapp-marketing-mcp/ GPT Actions e MCP remoto para marketing WhatsApp consentido
  google-business-mcp/ GPT Actions para Google Business Profile

migrations/
  evolução de schema do D1
```

## Responsabilidade por área

- `src/pages/`, `src/sections/`, `src/data/`, `public/`
  Superfície principal do `Cuiabar Web`.

- `src/crm/`
  Interface do `Cuiabar Atende`.

- `src/meucuiabar/`
  Interface do `MeuCuiabar`, hoje com frontend transplantado do Base44 e autenticação internalizada no Worker.

- `src/reservations/`
  Jornada pública e operacional de reservas.

- `worker/`
  Backend central do sistema, com autenticação, CRM, integrações, reservas e rotas internas.

- `services/whatsapp-baileys/`
  Transporte local do WhatsApp Web.

- `services/whatsapp-marketing-mcp/`
  Worker separado para GPT Actions e MCP remoto de campanhas WhatsApp consentidas, com validação de consentimento, opt-out, identificação do remetente e envio real apenas unitário/confirmado via bridge `GHCO Comunicacoes`. Suporta texto, texto formatado e envio de foto, vídeo, áudio e documento.

- `services/google-business-mcp/`
  Worker separado para GPT Actions do Google Business Profile, com leitura e escrita controlada por `validateOnly` para contas, locais, avaliações, posts, mídia e métricas.

## Domínios e hosts

- `https://cuiabar.com`
  Site principal.

- `https://prorefeicao.cuiabar.com`
  Host oficial da frente `ProRefeição`.

- `https://burgersnsmoke.com`
  Host público canônico do Burgers N' Smoke, agora mantido fora deste repositório no projeto standalone `burgersnsmoke`. O `GHCO OS` não serve mais conteúdo, assets, sitemap ou Schema.org desse domínio.

- `https://burger.cuiabar.com`
  Host legado do Burger, hoje redirecionado para `https://burgersnsmoke.com/`.

- `https://crm.cuiabar.com`
  Portal oficial do `Cuiabar Atende`.

- `https://meu.cuiabar.com`
  Portal oficial do `MeuCuiabar`.

- `https://crm.cuiabar.com/meucuiabar*`
  Alias legado, hoje redirecionado para `meu.cuiabar.com`.

- `https://reservas.cuiabar.com`
  Portal dedicado de reservas. O fluxo automatico esta temporariamente indisponivel e a tela direciona o cliente para o WhatsApp da loja.

- `https://blog.cuiabar.com/editor*`
  Faixa reservada para operação editorial protegida.

- `https://whatsapp-marketing-mcp.cuiabar.com`
  Serviço técnico para GPT personalizado e MCP remoto de marketing WhatsApp consentido. Não é superfície pública de cliente final. Endpoints principais: `/openapi.json`, `/sse`, `/mcp`, `/actions/format-message`, `/actions/send-single` e `/actions/send-media`.

- `https://google-business-mcp.cuiabar.com`
  Serviço técnico para GPT personalizado operar Google Business Profile via Actions/OpenAPI. Não é superfície pública de cliente final. Endpoints principais: `/openapi.json`, `/health`, `/actions/accounts`, `/actions/locations`, `/actions/reviews`, `/actions/local-posts`, `/actions/media`, `/actions/performance` e `/actions/google-business-request`.

## Rotas públicas principais

- `/`
  Landing pública permanente da marca, com header fixo, hero gastronômico, status operacional, diferenciais da casa, destaques do menu, agenda de música ao vivo, prova social, ProRefeição e sinais locais.
- `/presencial`
  Home pública principal do restaurante, com hero institucional, destaque promocional do almoço presencial e acesso para menu, WhatsApp e reservas.
- `/expresso`
  Frente de marmitaria, pratos do dia e operação rápida de almoço.
- `/menu`
  Cardápio público completo, com itens vindos de `src/data/menu.json`, navegação por categorias e CTAs para pedido.
- `/pedidos-online`
  Atalho legado, hoje redirecionado para `/delivery`.
- `/delivery`
  Página limpa de canais oficiais de pedido, com quatro saídas: pedido direto da loja, iFood do restaurante, 99Food do restaurante e 99Food da marmitaria Expresso.
- `/espetaria`
- `/vagas`
- `/links`
  Hub leve de links oficiais, com foco em reservas, pedido direto, atendimento e horários operacionais da casa.
- `/agenda`
  Página pública de música ao vivo, simplificada para explicar a identidade musical da casa — brasilidade, MPB, samba e sertanejo — com a agenda Google oficial em destaque.
- `/reservas`
  Pagina publica de reservas. O CTA principal direciona para o WhatsApp enquanto o sistema automatico estiver pausado.
- `/restaurante-brasileiro-campinas`, `/bar-musica-ao-vivo-campinas`, `/restaurante-delivery-campinas`
  Páginas SEO locais com copy genérica de Campinas. Desde 2026-05-14, não devem publicar endereço completo, mapas, coordenadas nem fotos do espaço físico.

## Redirecionamentos legados relevantes

- `https://burger.cuiabar.com`
  Redireciona para `https://burgersnsmoke.com/`.

- `/burger`, `/burguer`, `/burguer-cuiabar` e páginas satélite antigas de burger no host `cuiabar.com`
  Redirecionam para `https://burgersnsmoke.com/`. A hamburgueria não é mais superfície pública do ecossistema `cuiabar.com`.

- `https://cuiabar.com/prorefeicao`
  Redireciona permanentemente para `https://prorefeicao.cuiabar.com/`.

- `https://www.prorefeicao.cuiabar.com`
  Redireciona permanentemente para `https://prorefeicao.cuiabar.com/`.

- URLs locais antigas com bairro/corredor específico
  Devem redirecionar para as rotas genéricas de Campinas ou para `/presencial`, sem voltar ao sitemap público.

## Rotas internas e de infraestrutura

- `/os`
  Intranet operacional privada `GHCO OS — Manual Operacional`, renderizada no frontend React, sem header/rodapé público, com `noindex,nofollow` e sem entrada no sitemap. Subrotas atuais: `/os/atendimento`, `/os/delivery`, `/os/pops`, `/os/conversao` e `/os/recomendacoes`.

- `crm.cuiabar.com/api/*`
  APIs do CRM, autenticação, campanhas, integrações e módulos operacionais.

- `crm.cuiabar.com/api/internal/whatsapp/*`
  Endpoints consumidos pela ponte local Baileys.

- `crm.cuiabar.com/api/admin/whatsapp/*`
  Rotas administrativas do atendimento por WhatsApp.

- `meu.cuiabar.com/oauth/*`
  Fluxo de autenticação do portal interno via Google.

## Observações arquiteturais

- O projeto combina assets estáticos do Pages com backend dinâmico em Workers.
- A navegação pública prioriza a raiz como landing principal do restaurante, com atalhos para cardápio, `Nossos Cortes`, música ao vivo, delivery, ProRefeição e contato. `/presencial`, `/expresso` e `/espetaria` seguem preservadas como rotas internas de experiência e SEO.
- A frente `ProRefeição` deixou de ser página principal em `cuiabar.com/prorefeicao` e passou a operar no subdomínio dedicado `prorefeicao.cuiabar.com`, com a rota antiga preservada apenas como `301`.
- O host `burger.cuiabar.com` é mantido apenas como legado e redireciona para `burgersnsmoke.com`.
- O host `burgersnsmoke.com` não é mais atendido pelo Worker principal `cuiabar-crm`; sua landing, páginas satélite, sitemap, robots e assets pertencem ao repositório standalone do Burgers N' Smoke.
- O app React do `cuiabar.com` não registra página, dados ou assets de hamburgueria; a única responsabilidade remanescente deste repositório é redirecionar URLs legadas de burger para `https://burgersnsmoke.com/`.
- O `MeuCuiabar` já tem host próprio, mas ainda usa parte do frontend transplantado do Base44.
- O módulo `worker/whatsapp-intelligence/` segue isolado por feature flag e não substitui a arquitetura canônica de `worker/whatsapp/`.
- O blog foi retirado da superfície principal e preservado apenas como frente separável.
- O manual `/os` é uma superfície interna de treinamento e padronização operacional. A primeira versão usa busca local e dados versionados em `src/modules/os/`; autenticação definitiva ainda não foi ativada e deve entrar no `ProtectedLayout` do módulo antes de ampliar o acesso.
