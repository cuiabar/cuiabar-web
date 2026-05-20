# Google Business MCP / Actions

Worker para GPT personalizado operar Google Business Profile com Bearer interno.

## Superficies

- `GET /health`
- `GET /openapi.json`
- `GET /actions/accounts`
- `GET /actions/locations`
- `GET /actions/location`
- `POST /actions/update-location`
- `GET /actions/reviews`
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

## Secrets esperadas

- `GOOGLE_BUSINESS_ACTIONS_BEARER_TOKEN`
- `GOOGLE_BUSINESS_CLIENT_ID`
- `GOOGLE_BUSINESS_CLIENT_SECRET`
- `GOOGLE_BUSINESS_REFRESH_TOKEN`

## Variaveis opcionais

- `GOOGLE_BUSINESS_DEFAULT_ACCOUNT`
- `GOOGLE_BUSINESS_DEFAULT_LOCATION`
- `GOOGLE_BUSINESS_API_VERSION`

## Deploy

```bash
npm install
npm run typecheck
wrangler secret put GOOGLE_BUSINESS_ACTIONS_BEARER_TOKEN
wrangler secret put GOOGLE_BUSINESS_CLIENT_ID
wrangler secret put GOOGLE_BUSINESS_CLIENT_SECRET
wrangler secret put GOOGLE_BUSINESS_REFRESH_TOKEN
npm run deploy
```

Use `validateOnly: true` por padrao para qualquer escrita planejada pelo GPT.
