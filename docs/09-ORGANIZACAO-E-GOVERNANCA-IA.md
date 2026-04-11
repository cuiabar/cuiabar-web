# Organização e governança para manutenção por IA

Atualizado em: 2026-04-10

## Diagnóstico atual

Antes desta organização, a raiz do projeto misturava:

- documentação permanente
- guias antigos
- prints e artefatos de debug
- arquivos temporários de scraping/QA
- scripts soltos

Isso aumentava o risco de uma IA editar o lugar errado.

## Convenção oficial

### 1. `docs/` é a documentação oficial

Toda mudança estrutural deve refletir aqui.

### 2. `ops-artifacts/` é material temporário

Prints, dumps, HTML temporário, bancos locais e evidências de QA vão para essa área.

### 3. `guias-legados/` preserva histórico útil

Guias antigos continuam acessíveis, mas fora da raiz.

### 4. raiz deve ser leve

A raiz deve funcionar como entrada do projeto, não como depósito operacional.

## Mapa de busca inteligente

### Tarefa no site

Procure em:

- `src/pages/`
- `src/sections/`
- `src/components/`
- `src/data/`
- `public/`

### Tarefa no CRM ou backend

Procure em:

- `src/crm/`
- `worker/`
- `functions/`
- `migrations/`

### Tarefa no burger

Procure em:

- `src/pages/BurguerCuiabarPage.tsx`
- `src/burger/`
- `public/burguer/`

### Tarefa no blog

Procure em:

- `src/blog/`
- `blog-options/`
- `scripts/` de sync/publicação

## Regra para novos arquivos

- nova documentação: `docs/`
- novo guia antigo reaproveitado: `docs/guias-legados/`
- novo artefato de QA: `ops-artifacts/`
- novo script: `scripts/`
- novo asset: `public/<modulo>/`

## Regra para arquivos gerados

Arquivos `.js` e `.d.ts` gerados dentro de `worker/` não são fonte de verdade. A IA deve editar os `.ts`.

## Objetivo final

Toda IA deve conseguir:

- localizar o código certo rapidamente
- entender o estado do projeto sem o chat anterior
- reduzir risco de manutenção errada
