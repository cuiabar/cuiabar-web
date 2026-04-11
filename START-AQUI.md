# Cuiabar Web - começar por aqui

Se você abriu este projeto pela primeira vez, leia nesta ordem:

1. `AGENTS.md`
2. `docs/00-INDICE-GERAL.md`
3. `docs/09-ORGANIZACAO-E-GOVERNANCA-IA.md`
4. `docs/04-STATUS-ATUAL-E-PENDENCIAS.md`
5. `docs/05-USO-EM-OUTRO-CODEX.md`

Resumo rápido:

- o projeto usa React + Vite + TypeScript no frontend
- o deploy principal é Cloudflare Pages + Cloudflare Worker
- o mesmo repositório concentra site, burger, blog, CRM e reservas
- a documentação oficial fica em `docs/`
- artefatos de QA/debug ficam em `ops-artifacts/`

Regra prática:

- antes de editar, descubra o arquivo-fonte correto
- não use `dist/` ou prints de debug como referência de manutenção
- se mudar comportamento real, atualize a documentação correspondente
