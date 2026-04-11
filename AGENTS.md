# Guia operacional para IAs e mantenedores

Este repositório deve ser tratado como um sistema com múltiplos módulos conectados:

- site público principal
- landing e operação Burger Cuiabar
- blog/editorial
- CRM
- reservas
- integrações server-side em Cloudflare

## Ordem obrigatória de leitura

Antes de editar qualquer parte relevante do projeto, leia nesta ordem:

1. `START-AQUI.md`
2. `AGENTS.md`
3. `docs/00-INDICE-GERAL.md`
4. `docs/04-STATUS-ATUAL-E-PENDENCIAS.md`
5. `docs/09-ORGANIZACAO-E-GOVERNANCA-IA.md`
6. `docs/03-INTEGRACOES-E-CREDENCIAIS.md`

Se a tarefa envolver deploy, CRM, blog, reservas ou integrações, continue pelos documentos específicos indicados no índice.

## Regra principal

Sempre responda estas perguntas antes de alterar qualquer arquivo:

1. Qual é o arquivo-fonte correto?
2. Esta mudança exige atualizar documentação oficial?
3. Estou editando código real ou um artefato gerado/debug?

## Fontes de verdade

- visão geral do projeto: `docs/01-ARQUITETURA-E-ROTAS.md`
- operação e deploy: `docs/02-OPERACAO-E-DEPLOY.md`
- integrações e nomes de credenciais: `docs/03-INTEGRACOES-E-CREDENCIAIS.md`
- status real do sistema: `docs/04-STATUS-ATUAL-E-PENDENCIAS.md`
- uso em outro agente/máquina: `docs/05-USO-EM-OUTRO-CODEX.md`
- governança de manutenção por IA: `docs/09-ORGANIZACAO-E-GOVERNANCA-IA.md`

## Onde editar

- páginas e UX do site: `src/pages/`, `src/sections/`, `src/components/`
- dados e conteúdo: `src/data/`
- blog em React/Vite: `src/blog/`
- CRM frontend: `src/crm/`
- módulo de reservas frontend: `src/reservations/`
- middleware/functions do Pages: `functions/`
- backend principal/Cloudflare Worker: `worker/`
- integrações server-side: `worker/services/`
- migrações D1: `migrations/`
- scripts operacionais: `scripts/`
- assets versionados: `public/`

## O que não deve ser tratado como origem de edição

- `dist/`
- `dist-blog/`
- `.ssr/`
- `.ssr-blog/`
- `node_modules/`
- `ops-artifacts/`
- arquivos `.js` e `.d.ts` gerados ao lado de `.ts` dentro de `worker/`

Regra prática:

- editar o fonte
- gerar artefatos só quando necessário
- nunca usar arquivos compilados como base de manutenção

## Política de segredos

- não versionar tokens, chaves privadas ou contas de serviço em texto puro
- documentar nomes de secrets e local de armazenamento, não o valor
- preferir Cloudflare Secrets, variáveis locais não versionadas e cofres externos
- se aparecer um segredo em conversa, ele deve ser rotacionado ou guardado fora do repositório

## Regra de atualização documental

Se uma mudança altera:

- arquitetura, rotas ou responsabilidades de pastas:
  atualizar `docs/01-ARQUITETURA-E-ROTAS.md`

- deploy, domínio, Cloudflare ou publicação:
  atualizar `docs/02-OPERACAO-E-DEPLOY.md`

- integrações, pixel, APIs, nomes de secrets, conectores:
  atualizar `docs/03-INTEGRACOES-E-CREDENCIAIS.md`

- status operacional, decisões, riscos ou pendências:
  atualizar `docs/04-STATUS-ATUAL-E-PENDENCIAS.md`

- regras de manutenção e organização:
  atualizar `docs/09-ORGANIZACAO-E-GOVERNANCA-IA.md`

## Meta desta governança

Qualquer IA nova deve conseguir:

- entender o sistema em poucos minutos
- encontrar o lugar certo para editar
- evitar mexer em arquivos errados
- continuar o trabalho sem depender da memória do chat anterior
