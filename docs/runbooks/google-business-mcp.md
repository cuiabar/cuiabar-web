# Google Business MCP

## Objetivo

Disponibilizar Google Business Profile para um GPT personalizado via Actions/OpenAPI, com leitura operacional e escrita controlada por `validateOnly`.

## Local do servico

```text
services/google-business-mcp/
```

Endpoint publico planejado:

```text
https://google-business-mcp.cuiabar.com
```

Schema para GPT personalizado:

```text
https://google-business-mcp.cuiabar.com/openapi.json
```

## Escopo

O servico cobre:

- contas acessiveis
- locais/perfis
- atualizacao de informacoes do perfil
- avaliacoes e respostas
- posts locais
- midia
- metricas de performance
- chamada generica controlada para APIs Google Business Profile

## Secrets

Nao versionar valores.

Secrets obrigatorias:

- `GOOGLE_BUSINESS_ACTIONS_BEARER_TOKEN`
- `GOOGLE_BUSINESS_CLIENT_ID`
- `GOOGLE_BUSINESS_CLIENT_SECRET`
- `GOOGLE_BUSINESS_REFRESH_TOKEN`

Variaveis recomendadas:

- `GOOGLE_BUSINESS_DEFAULT_ACCOUNT`
- `GOOGLE_BUSINESS_DEFAULT_LOCATION`
- `GOOGLE_BUSINESS_API_VERSION`

Escopo OAuth recomendado:

```text
https://www.googleapis.com/auth/business.manage
```

## Instalacao no GPT personalizado

1. Abra o editor do GPT.
2. Em `Actions`, crie uma nova action.
3. Importe o schema `/openapi.json`.
4. Configure autenticacao como API Key / Bearer.
5. Use o valor de `GOOGLE_BUSINESS_ACTIONS_BEARER_TOKEN`.
6. Instrua o GPT a sempre validar escritas primeiro com `validateOnly:true` e só escrever com `validateOnly:false` apos confirmacao humana explicita.

## Endpoints principais

- `GET /actions/accounts`
- `GET /actions/locations`
- `GET /actions/location`
- `POST /actions/update-location`
- `GET /actions/reviews`
- `GET /actions/review`
- `POST /actions/reply-review`
- `POST /actions/delete-review-reply`
- `GET /actions/local-posts`
- `POST /actions/create-local-post`
- `POST /actions/update-local-post`
- `POST /actions/delete-local-post`
- `GET /actions/media`
- `POST /actions/create-media`
- `POST /actions/delete-media`
- `GET /actions/performance`
- `GET /actions/search-keywords`
- `POST /actions/google-business-request`

## Deploy

```bash
cd services/google-business-mcp
npm install
npm run typecheck
wrangler secret put GOOGLE_BUSINESS_ACTIONS_BEARER_TOKEN
wrangler secret put GOOGLE_BUSINESS_CLIENT_ID
wrangler secret put GOOGLE_BUSINESS_CLIENT_SECRET
wrangler secret put GOOGLE_BUSINESS_REFRESH_TOKEN
wrangler deploy
```

## Validacao

```bash
curl https://google-business-mcp.cuiabar.com/health
curl -H "Authorization: Bearer <TOKEN>" https://google-business-mcp.cuiabar.com/actions/accounts
```

## Regras de escrita

- Escritas retornam plano quando `validateOnly:true`.
- Para escrever de fato, enviar `validateOnly:false`.
- O GPT deve tratar alteracao de horarios, telefone, site, descricao, posts e respostas publicas como acao operacional sensivel.
- A resposta publica a avaliacoes deve ser revisada antes de escrita real.
