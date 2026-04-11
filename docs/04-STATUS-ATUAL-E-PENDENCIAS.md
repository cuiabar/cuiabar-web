# Status atual e pendências

Atualizado em: 2026-04-10

## Estado geral

O projeto está funcional como base única para:

- site principal
- burger
- blog
- CRM
- reservas
- integrações de marketing

## O que já foi melhorado nesta organização

- criada trilha oficial de leitura para novas IAs
- criada governança de manutenção em `AGENTS.md`
- criada documentação central em `docs/`
- guias antigos foram retirados da raiz e preservados em `docs/guias-legados/`
- artefatos de debug e QA saíram da raiz para `ops-artifacts/`
- arquivos gerados do Worker passaram a ser tratados como não editáveis
- GitHub privado adotado como base principal do repositório e da documentação técnica
- migração para operação web-first iniciada e documentada em `docs/11-CODEX-WEB-MIGRACAO.md`

## Pontos que ainda exigem acompanhamento

- consolidar a política entre GitHub como fonte principal e Drive como backup complementar
- revisar estratégia de secrets fora do repositório
- configurar `CLOUDFLARE_API_TOKEN` no GitHub para deploy remoto automático
- decidir separação lógica e operacional entre site, CRM, burger e blog
- reduzir acoplamento entre múltiplos módulos dentro da mesma branch
- revisar política de deploy para evitar confusão entre Pages e Worker

## Próximo passo estrutural recomendado

Separar o trabalho em frentes claras:

1. `site`
2. `crm`
3. `burger`
4. `blog`

Isso pode ser feito primeiro por branches/convenções, sem quebrar o repositório único.
