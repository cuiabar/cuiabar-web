# Arquitetura e rotas

Atualizado em: 2026-04-23

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

## Domínios e hosts

- `https://cuiabar.com`
  Site principal.

- `https://prorefeicao.cuiabar.com`
  Host oficial da frente `ProRefeição`.

- `https://crm.cuiabar.com`
  Portal oficial do `Cuiabar Atende`.

- `https://meu.cuiabar.com`
  Portal oficial do `MeuCuiabar`.

- `https://crm.cuiabar.com/meucuiabar*`
  Alias legado, hoje redirecionado para `meu.cuiabar.com`.

- `https://reservas.cuiabar.com`
  Portal dedicado de reservas.

- `https://blog.cuiabar.com/editor*`
  Faixa reservada para operação editorial protegida.

## Rotas públicas principais

- `/`
  Home pública com hero institucional, destaque promocional do almoço presencial e acesso para menu, WhatsApp e reservas.
- `/menu`
- `/pedidos-online`
- `/delivery`
- `/burguer`
- `/burger`
- `/espetaria`
- `/vagas`
- `/links`
  Hub leve de links oficiais, com foco em reservas, pedido direto, atendimento e horários operacionais da casa.
- `/agenda`
- `/reservas`

## Redirecionamentos legados relevantes

- `https://cuiabar.com/prorefeicao`
  Redireciona permanentemente para `https://prorefeicao.cuiabar.com/`.

- `https://www.prorefeicao.cuiabar.com`
  Redireciona permanentemente para `https://prorefeicao.cuiabar.com/`.

## Rotas internas e de infraestrutura

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
- A frente `ProRefeição` deixou de ser página principal em `cuiabar.com/prorefeicao` e passou a operar no subdomínio dedicado `prorefeicao.cuiabar.com`, com a rota antiga preservada apenas como `301`.
- O `MeuCuiabar` já tem host próprio, mas ainda usa parte do frontend transplantado do Base44.
- O módulo `worker/whatsapp-intelligence/` segue isolado por feature flag e não substitui a arquitetura canônica de `worker/whatsapp/`.
- O blog foi retirado da superfície principal e preservado apenas como frente separável.
