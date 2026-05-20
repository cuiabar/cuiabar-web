# Meta Ads Actions

## Objetivo

Permitir que um GPT personalizado consulte Meta Ads sem usar MCP e crie publicidade de trafego de forma controlada.

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

O token da Meta precisa ter permissao `ads_read` para relatorios. Para criar publicidade, tambem precisa de `ads_management`. Para relatórios de Business Manager, pode ser necessário revisar permissões do app/usuário no Meta Business.

## Endpoints disponíveis

- `GET /actions/health`
- `GET /actions/me`
- `GET /actions/ad-accounts`
- `GET /actions/campaigns`
- `GET /actions/adsets`
- `GET /actions/ads`
- `GET /actions/creatives`
- `GET /actions/insights`
- `POST /actions/meta-graph-request`
- `POST /actions/meta-graph-request-v2`
- `POST /actions/batch-graph-request`
- `POST /actions/create-full-meta-campaign`
- `POST /actions/create-full-meta-campaign-v2`
- `GET /actions/targeting-search`
- `GET /actions/resolve-geo-location`
- `POST /actions/create-traffic-ad-bundle`
- `POST /actions/create-ad-in-adset`
- `GET /actions/ad-pixels`
- `POST /actions/upload-ad-image`
- `POST /actions/upload-ad-video`

## Escrita para editores

`POST /actions/create-traffic-ad-bundle` prepara ou cria um pacote de trafego:

- campanha `OUTCOME_TRAFFIC`
- conjunto com orcamento diario ou vitalicio
- segmentacao por pais, cidade por key, raio por latitude/longitude, idade e genero
- placements por plataforma/posicao
- otimizacao por `LINK_CLICKS` ou `LANDING_PAGE_VIEWS`
- ate 20 criativos/anuncios no mesmo conjunto
- criativo de link ou video usando `object_story_spec`
- programacao por `startTime`, `endTime` e `adSetSchedule`

Por padrao `validateOnly=true`, retornando o plano sem escrever na Meta. Para criar de fato, enviar `validateOnly=false`. A permissao de escrita e dada pelo Bearer token da Action.

Campanha, conjunto e anuncio sao criados pausados por padrao; ativacao em producao deve ser decisao humana explicita.

Para assets:

- `upload-ad-image` aceita uma URL HTTPS de imagem e retorna hash quando aceito pela Meta.
- `upload-ad-video` aceita uma URL HTTPS de video e retorna ID/status quando aceito pela Meta.
- `create-ad-in-adset` adiciona um novo anuncio/criativo em um conjunto existente, evitando duplicar campanha e conjunto.

Para recursos avancados ainda nao modelados em campos dedicados, usar `targetingOverrides`, `campaignOverrides` e `adSetOverrides` com payload compatível com a Marketing API.

## Graph API generico

`POST /actions/meta-graph-request` e a rota de batch existem para reduzir dependencia de campos fixos no Worker:

- `path`: qualquer node/edge Graph, como `/act_<id>/campaigns`, `/<campaign_id>`, `/act_<id>/targetingsearch`
- `method`: `GET`, `POST` ou `DELETE`
- `query`: parametros livres de leitura, incluindo `fields`, `filtering`, `breakdowns`, `action_breakdowns`, `time_range`, `metadata`
- `body`: payload livre de escrita
- `apiVersion`: override opcional da versão Graph
- `validateOnly`: para preparar escrita sem chamar a Meta
- `confirmWrite`: legado/opcional para anotacao; nao e mais exigido para escrita

`POST /actions/create-full-meta-campaign` cria uma hierarquia completa com payload livre:

- `campaign`: qualquer campo aceito pela Marketing API, incluindo `is_adset_budget_sharing_enabled`
- `adsets[].adset`: qualquer campo de conjunto, incluindo `targeting`, `promoted_object`, `adset_schedule`
- `adsets[].ads[].creative`: qualquer criativo, incluindo `object_story_spec`, `asset_feed_spec`, `video_data`, `image_hash`
- `adsets[].ads[].ad`: payload livre de anuncio

As rotas `*-v2` existem para contornar cache ou limitação do importador de Actions. Elas aceitam os mesmos objetos livres e também fallbacks por string JSON:

- `bodyJson`
- `queryJson`
- `campaignJson`
- `adsetsJson`

## Estado atual

Publicado em 2026-05-04:

- Worker: `meta-ads-actions`
- Domínio: `meta-ads-actions.cuiabar.com`
- OpenAPI: OK
- Bearer interno do GPT: configurado
- `META_ACCESS_TOKEN`: configurado
- `META_AD_ACCOUNT_ID`: configurado com a conta `act_1452882208398648`
- Validação real: `/actions/ad-accounts`, `/actions/campaigns` e `/actions/insights` retornaram dados da conta Cuiabar
