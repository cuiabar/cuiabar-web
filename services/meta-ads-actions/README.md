# Meta Ads Actions

API REST para GPT personalizado consultar e operar Meta Ads com leitura e escrita via Bearer token, sem modo desenvolvedor.

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

O token da Meta precisa ter permissao `ads_read` para relatorios. Para criar publicidade, tambem precisa de `ads_management`.

## Escrita para editores

Endpoint:

```text
POST /actions/create-traffic-ad-bundle
```

O endpoint prepara ou cria um pacote de trafego:

- campanha `OUTCOME_TRAFFIC`
- conjunto com orcamento diario
- segmentacao por pais, cidade por key, raio por latitude/longitude, idade e genero
- placements por plataforma/posicao
- otimizacao por `LINK_CLICKS` ou `LANDING_PAGE_VIEWS`
- ate 20 criativos/anuncios no mesmo conjunto
- criativo de link ou video usando `object_story_spec`
- programacao por `startTime`, `endTime` e `adSetSchedule`

Por padrao `validateOnly=true`, retornando o plano sem escrever na Meta. Para criar de fato, envie:

```json
{
  "validateOnly": false
}
```

Campanha, conjunto e anuncio ficam `PAUSED` por padrao.

Endpoints adicionais:

- `POST /actions/meta-graph-request`
- `POST /actions/meta-graph-request-v2`
- `POST /actions/batch-graph-request`
- `POST /actions/create-full-meta-campaign`
- `POST /actions/create-full-meta-campaign-v2`
- `GET /actions/targeting-search`
- `GET /actions/resolve-geo-location`
- `GET /actions/ad-pixels`
- `POST /actions/upload-ad-image`
- `POST /actions/upload-ad-video`
- `POST /actions/create-ad-in-adset`

## Acesso Graph generico

`meta-graph-request` aceita `GET`, `POST` e `DELETE` para qualquer path Graph/Marketing API, com `query` e `body` livres. Escritas usam a permissao do Bearer token da Action:

```json
{
  "method": "POST",
  "validateOnly": false
}
```

`create-full-meta-campaign` aceita payload livre para `campaign`, `adsets[].adset`, `adsets[].ads[].creative` e `adsets[].ads[].ad`, permitindo campos novos da Meta como `is_adset_budget_sharing_enabled`, `targeting`, `object_story_spec`, `asset_feed_spec` e `promoted_object` sem mudar o Worker.

Use as rotas `*-v2` quando o importador de Actions recusar objetos livres: elas aceitam tambem `bodyJson`, `queryJson`, `campaignJson` e `adsetsJson` como strings JSON.
