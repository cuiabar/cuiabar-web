# Uso em outro Codex

Atualizado em: 2026-04-10

## Objetivo

Permitir continuidade entre sessões e entre IAs sem depender de histórico de conversa.

## Passo a passo

1. abrir a pasta do projeto
2. ler:
   - `START-AQUI.md`
   - `AGENTS.md`
   - `docs/00-INDICE-GERAL.md`
   - `docs/04-STATUS-ATUAL-E-PENDENCIAS.md`
3. identificar a área correta da tarefa
4. editar apenas arquivo-fonte
5. atualizar o documento correto se houver mudança estrutural

## Validação mínima antes de publicar

```bash
npm install
npm run build
```

Se a tarefa envolver Worker:

```bash
npm run build:worker
```

## Onde procurar por tipo de demanda

- visual e conteúdo: `src/`
- assets: `public/`
- CRM/backend: `worker/`
- Pages middleware: `functions/`
- deploy: `wrangler.jsonc`, `package.json`, `docs/02-OPERACAO-E-DEPLOY.md`
