# Arquitetura e rotas

Atualizado em: 2026-04-15

## Sistema e produtos

O sistema-mãe do repositorio passa a ser:

- `GHCO OS`

Linhas de produto dentro dele:

1. `Cuiabar Web`
   Site, blog e cardapio para o cliente final.
2. `MeuCuiabar`
   Controle interno, qualidade, HACCP e rotinas da casa.
3. `Cuiabar Atende`
   WhatsApp com IA, reservas, CRM, marketing e fidelidade.

## Stack principal

- React 18
- Vite 5
- TypeScript
- Tailwind CSS
- React Router DOM
- Cloudflare Pages
- Cloudflare Workers
- Cloudflare D1
- Cloudflare Workers AI
- Cloudflare KV
- Node.js local para a ponte Baileys

## Estrutura principal

```txt
src/
  app/            app principal e roteamento
  components/     componentes reutilizaveis
  sections/       secoes da home
  pages/          paginas principais do site
  data/           configuracoes e conteudo
  hooks/          SEO, comportamento e utilitarios React
  lib/            analytics e helpers
  styles/         estilos globais
  reservations/   frontend do modulo de reservas
  blog/           estrutura do blog/editorial
  crm/            portal operacional e administrativo

functions/
  api/            funcoes Pages, incluindo Meta CAPI

worker/
  reservations/   backend do modulo de reservas
  services/       servicos auxiliares, ex.: Google
  whatsapp/       backend do atendimento por WhatsApp com IA

services/
  whatsapp-baileys/ ponte local do WhatsApp Web via Baileys

migrations/
  migrations do banco D1
```

## Mapeamento por modulo

- `src/pages/`, `src/sections/`, `src/blog/`, `src/data/`, `public/`
  Base principal do `Cuiabar Web`.

- `src/crm/`
  Interface principal do `Cuiabar Atende` e area administrativa compartilhada.

- `src/meucuiabar/`
  Primeiro bloco extraido de `MeuCuiabar`, dedicado a governanca operacional e auditoria interna.

- `src/reservations/`
  Frontend do portal de reservas, ligado ao `Cuiabar Atende`.

- `worker/`
  Backend principal em Cloudflare Workers: nucleo compartilhado do `GHCO OS`, cobrindo CRM, integracoes, reservas, autenticacao e rotas server-side dedicadas.

- `worker/whatsapp-intelligence/`
  Worker dedicado/experimental para automacoes de WhatsApp com Llama, auditoria e bridge para gateway Baileys dentro da linha `Cuiabar Atende`.

- `services/whatsapp-baileys/`
  Runtime local da ponte de transporte do WhatsApp Web.

## Configuracao central

Arquivos mais importantes para operacao:

- `src/data/siteConfig.ts`
- `src/data/seoRoutes.json`
- `src/data/content.ts`
- `src/app/App.tsx`
- `src/crm/CrmApp.tsx`
- `wrangler.jsonc`
- `package.json`

## Rotas principais do site

- `/`
  Home institucional/comercial.

- `/menu`
  Cardapio principal do restaurante.

- `/pedidos-online`
  Pagina de pedidos online.

- `/delivery`
  Alias da pagina de pedidos online.

- `/burguer` e `/burger`
  Pagina especial do Burger Cuiabar.

- `/espetaria`
  Pagina especial da Espetaria Cuiabar.

- `/prorefeicao`
  Pagina institucional da operacao ProRefeicao.

- `/vagas`
  Pagina de vagas com links externos para formularios.

- `/links`
  Pagina estilo link-in-bio.

- `/agenda`
  Agenda/programacao.

- `/reservas`
  Fluxo publico de reservas.

## Rotas de infraestrutura

- `cuiabar.com`
  `Cuiabar Web` principal.

- `crm.cuiabar.com`
  Portal principal do `Cuiabar Atende`.

- `crm.cuiabar.com/meucuiabar*`
  Primeira superficie interna de `MeuCuiabar`, ainda hospedada sob o shell autenticado do portal interno.

- `reservas.cuiabar.com`
  Portal de reservas do `Cuiabar Atende`.

- `blog.cuiabar.com`
  Presenca editorial do `Cuiabar Web`.

- `blog.cuiabar.com/editor*`
  Faixa reservada para editor/blog.

- `crm.cuiabar.com/api/internal/whatsapp/*`
  Endpoints internos consumidos pela ponte Baileys local.

- `crm.cuiabar.com/api/admin/whatsapp/*`
  Endpoints administrativos do modulo de WhatsApp.

- `crm.cuiabar.com/api/internal/whatsapp/crm/sync`
  Camada adaptadora REST para sincronizacao com o CRM.

## Observacoes relevantes

- O projeto mistura frontend estatico no Pages com Worker para modulos dinamicos.
- O site principal usa `dist/` como bundle estatico.
- O Worker usa `worker/index.ts` com assets do `dist`.
- A configuracao atual de deploy e local/manual via Wrangler, nao por integracao GitHub -> Cloudflare.
- O modulo de WhatsApp usa um bridge Baileys local para transporte, KV para sessao/cache e Workers AI com fallback para REST da Cloudflare.
- Para nao quebrar o CRM atual de e-mail marketing, o atendimento WhatsApp grava primeiro em `customer_profiles` e so vincula a `contacts` quando houver match seguro ou e-mail conhecido.
- `MeuCuiabar` foi aberto inicialmente como modulo proprio em `src/meucuiabar/`, mas ainda compartilha autenticacao e shell do host `crm.cuiabar.com`.
