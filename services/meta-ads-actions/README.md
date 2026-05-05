# Meta Ads Actions somente leitura

API REST para GPT personalizado consultar Meta Ads sem modo desenvolvedor e sem permissao de escrita.

Schema OpenAPI:

```text
https://meta-ads-actions.cuiabar.com/openapi.json
```

Autenticacao no GPT:

```text
API Key -> Bearer
```

Token local:

```text
ops-artifacts/meta-ads-actions/action-bearer-token.local
```

Secrets do Worker:

- `META_ACCESS_TOKEN`
- `META_AD_ACCOUNT_ID`
- `META_ACTIONS_BEARER_TOKEN`
- `META_GRAPH_API_VERSION`, default `v25.0`

O token da Meta precisa ter permissao de leitura de anuncios, normalmente `ads_read`.
