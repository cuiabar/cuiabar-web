# Meta Ads Actions somente leitura

## Objetivo

Permitir que um GPT personalizado consulte Meta Ads sem usar MCP, sem modo desenvolvedor e sem endpoints de escrita.

## Endpoint

Schema OpenAPI:

```text
https://meta-ads-actions.cuiabar.com/openapi.json
```

Health:

```text
https://meta-ads-actions.cuiabar.com/health
```

## Autenticacao no GPT

No editor do GPT:

1. `Configure`
2. `Actions`
3. `Create new action`
4. Importar schema por URL:

```text
https://meta-ads-actions.cuiabar.com/openapi.json
```

5. Authentication:

```text
API Key
Bearer
```

6. Usar o token salvo localmente:

```text
ops-artifacts/meta-ads-actions/action-bearer-token.local
```

## Secrets do Worker

- `META_GRAPH_API_VERSION`, default `v25.0`
- `META_ACCESS_TOKEN`
- `META_AD_ACCOUNT_ID`
- `META_ACTIONS_BEARER_TOKEN`

O token da Meta precisa ter permissao `ads_read`. Para relatórios de Business Manager, pode ser necessário revisar permissões do app/usuário no Meta Business.

## Endpoints disponíveis

- `GET /actions/health`
- `GET /actions/me`
- `GET /actions/ad-accounts`
- `GET /actions/campaigns`
- `GET /actions/adsets`
- `GET /actions/ads`
- `GET /actions/creatives`
- `GET /actions/insights`

## Estado atual

Publicado em 2026-05-04:

- Worker: `meta-ads-actions`
- Domínio: `meta-ads-actions.cuiabar.com`
- OpenAPI: OK
- Bearer interno do GPT: configurado
- `META_ACCESS_TOKEN`: configurado
- `META_AD_ACCOUNT_ID`: configurado com a conta `act_1452882208398648`
- Validação real: `/actions/ad-accounts`, `/actions/campaigns` e `/actions/insights` retornaram dados da conta Cuiabar
