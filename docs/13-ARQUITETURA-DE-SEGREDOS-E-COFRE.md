# Arquitetura de segredos e cofre

Atualizado em: 2026-04-12

## Objetivo

Definir uma arquitetura única para credenciais do projeto, com separação clara entre:

- cofre-mãe
- runtime
- CI/CD
- documentação operacional

## Decisão oficial

Para o projeto Cuiabar, o padrão recomendado é:

- `Google Secret Manager` como cofre-mãe
- `Cloudflare Secrets` como camada de runtime
- `GitHub Secrets` apenas para pipeline e automação de deploy
- `Drive` apenas para backup complementar e materiais não sensíveis

## Papel de cada camada

### Google Secret Manager

É a fonte principal de verdade.

Deve armazenar:

- client secrets de OAuth Google
- refresh tokens Google
- tokens da Meta
- tokens administrativos do Cloudflare
- service accounts do Google
- segredos de provedores externos

Motivos:

- histórico e versionamento por segredo
- IAM granular
- rotação segura
- trilha de auditoria

### Cloudflare Secrets

É a camada de execução do `worker/` e das rotas server-side.

Deve armazenar apenas o que o runtime precisa usar de fato:

- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REFRESH_TOKEN`
- `GOOGLE_BUSINESS_CLIENT_SECRET`
- `GOOGLE_BUSINESS_REFRESH_TOKEN`
- `META_CAPI_TOKEN`
- `SETUP_ADMIN_TOKEN`

Regra:

- o valor oficial nasce ou é atualizado primeiro no cofre-mãe
- depois é propagado para o Cloudflare

### GitHub Secrets

É a camada de CI/CD.

Deve armazenar apenas o mínimo necessário para o pipeline:

- `CLOUDFLARE_API_TOKEN`
- outros segredos estritamente exigidos por GitHub Actions

Regra:

- GitHub não é cofre principal
- se o segredo só serve para runtime, ele não deve morar no GitHub

### Drive

Não é cofre.

Pode guardar:

- PDFs
- mídia bruta
- briefings
- contratos
- exportações operacionais não sensíveis

Não deve guardar:

- client secrets
- refresh tokens
- access tokens
- global API keys
- chaves privadas de service account

## Convenção de nomes no cofre

Padrão recomendado:

- `cuiabar/prod/google/client-secret`
- `cuiabar/prod/google/refresh-token`
- `cuiabar/prod/google-business/client-secret`
- `cuiabar/prod/google-business/refresh-token`
- `cuiabar/prod/meta/capi-token`
- `cuiabar/prod/cloudflare/api-token`

Se houver ambiente separado depois:

- `cuiabar/staging/...`
- `cuiabar/prod/...`

## Fluxo de criação

1. criar o segredo no provedor de origem
2. salvar no `Google Secret Manager`
3. documentar apenas o nome do segredo
4. distribuir para `Cloudflare Secrets` ou `GitHub Secrets` se necessário

## Fluxo de rotação

1. gerar novo valor no provedor
2. atualizar no `Google Secret Manager`
3. atualizar no `Cloudflare` ou `GitHub`
4. validar funcionamento
5. revogar o valor antigo

## Regra para incidentes

Se um segredo aparecer em:

- chat
- print
- commit
- arquivo local compartilhado
- Drive

ele deve ser tratado como comprometido.

Procedimento:

1. rotacionar
2. atualizar cofre-mãe
3. atualizar runtime
4. registrar o impacto operacional se houver

## Regra para futuras IAs

Toda IA deve:

1. procurar o nome do segredo na documentação
2. identificar onde ele deveria existir
3. nunca pedir para salvar segredo em repositório
4. nunca repetir segredo já exposto no chat
5. recomendar rotação quando houver exposição

## Implementação recomendada

### Fase 1

- consolidar inventário por nome
- confirmar quais segredos já estão no Cloudflare e GitHub
- retirar credenciais de locais improvisados

### Fase 2

- criar o cofre oficial no `Google Secret Manager`
- cadastrar owners e política de acesso
- mover segredos-mãe para lá

### Fase 3

- padronizar rotação
- documentar playbook operacional
- eventualmente automatizar sincronização para Cloudflare e GitHub

## Conclusão

A arquitetura oficial do projeto passa a ser:

- `Google Secret Manager` = fonte oficial
- `Cloudflare Secrets` = runtime
- `GitHub Secrets` = CI/CD
- `Drive` = apoio e backup, nunca cofre
