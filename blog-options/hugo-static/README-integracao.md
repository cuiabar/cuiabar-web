# Integracao - Hugo static

## Quando escolher esta opcao

Use Hugo quando o objetivo for um blog extremamente rapido, barato e simples de manter.

## Fluxo recomendado

1. Criar o site Hugo.
2. Escolher ou desenvolver um tema.
3. Gerar `public/`.
4. Servir o resultado por Nginx.

## Bootstrap

```bash
hugo new site ./hugo-blog
```

Depois configure:

- `baseURL = "https://blog.cuiabar.com"`
- tema
- taxonomias
- feeds
- schema e partials de CTA

## Deploy

```bash
cp .env.example .env
bash deploy.sh
```

## Melhor uso

- blog de SEO local
- guias evergreen
- backlog editorial mais enxuto

## Trade-offs

- experiencia editorial depende mais de Git do que de admin visual
- para fluxo nao tecnico, um CMS adicional pode ser necessario
