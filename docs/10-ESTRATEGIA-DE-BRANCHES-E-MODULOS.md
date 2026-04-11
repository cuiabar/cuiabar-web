# Estratégia de branches e módulos

Atualizado em: 2026-04-10

## Objetivo

Melhorar organização sem quebrar a vantagem atual de manter tudo conectado no mesmo repositório.

## Recomendação

Não separar em repositórios agora.

O caminho mais seguro é:

1. manter um monorepo único
2. separar responsabilidades por pastas
3. organizar o trabalho por branches temáticas
4. só depois avaliar split real, se ainda fizer sentido

## Estrutura lógica recomendada

### Frente 1: site institucional

- home
- menu
- pedidos
- prorefeição
- vagas
- links
- páginas locais/SEO

Área principal:

- `src/pages/`
- `src/sections/`
- `src/data/`

Branch sugerida:

- `site/*`

### Frente 2: CRM e operações

- CRM
- integrações
- reservas backend
- autenticação
- campanhas
- tracking server-side

Área principal:

- `src/crm/`
- `worker/`
- `functions/`
- `migrations/`

Branch sugerida:

- `crm/*`

### Frente 3: Burger Cuiabar

- landing
- assets
- SEO específico
- experiências e cardápio do burger

Área principal:

- `src/pages/BurguerCuiabarPage.tsx`
- `src/burger/`
- `public/burguer/`

Branch sugerida:

- `burger/*`

### Frente 4: blog

- app editorial
- sincronização CMS
- publicação
- layout e SEO editorial

Área principal:

- `src/blog/`
- `blog-options/`
- scripts editoriais

Branch sugerida:

- `blog/*`

## Branches de manutenção transversal

- `infra/*`
  deploy, Cloudflare, build, CI, estrutura

- `seo/*`
  quando a mudança cruzar site, blog e burger ao mesmo tempo

- `assets/*`
  quando a mudança for puramente de mídia/organização visual

## Regra para futuras IAs

Se a tarefa for predominantemente:

- site público: atuar em `site/*`
- CRM/backend: atuar em `crm/*`
- burger: atuar em `burger/*`
- blog/editorial: atuar em `blog/*`
- infraestrutura ou organização: atuar em `infra/*`

## Por que isso é melhor agora

Porque o projeto ainda compartilha:

- build chain
- deploy
- assets
- SEO base
- integrações de analytics
- parte do backend

Separar em repositórios agora aumentaria custo operacional e risco de divergência.

## Momento certo para split real

Só vale considerar repositórios separados quando houver:

- deploys independentes por módulo
- owners diferentes por frente
- pipelines independentes
- redução real de acoplamento entre `src/`, `worker/` e `functions/`
