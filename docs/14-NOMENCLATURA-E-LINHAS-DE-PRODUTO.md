# Nomenclatura e linhas de produto

Atualizado em: 2026-04-14

## Sistema-mãe

O nome geral do sistema passa a ser:

- `GHCO OS`

Interpretacao operacional:

- `GHCO OS` e o sistema central
- os produtos abaixo sao linhas derivadas do mesmo nucleo
- o repositorio continua unico, mas a organizacao de codigo, branch e documentacao deve respeitar essas fronteiras

## Linhas de produto

### 1. Cuiabar Web

Responsabilidade:

- site publico
- blog
- cardapio
- discovery organico
- paginas comerciais para cliente final

Escopo principal:

- home institucional
- menu
- pedidos online
- blog/editorial
- SEO local
- paginas especiais publicas

Areas de codigo mais ligadas:

- `src/app/`
- `src/pages/`
- `src/sections/`
- `src/blog/`
- `src/data/`
- `src/lib/seo.ts`
- `public/`

Hosts e rotas associados:

- `cuiabar.com`
- `blog.cuiabar.com`
- rotas publicas do dominio principal

### 2. MeuCuiabar

Responsabilidade:

- controle interno
- qualidade
- HACCP
- rotinas da casa
- operacao interna nao comercial

Escopo principal:

- checklists
- controles internos
- procedimentos de qualidade
- trilhas operacionais da casa
- governanca operacional

Escopo tecnico esperado:

- deve ficar desacoplado da experiencia publica
- pode compartilhar autenticacao e identidade interna
- deve depender do core, sem contaminar o frontend publico

Areas provaveis de codigo:

- `src/crm/` quando houver modulos internos nao comerciais
- `worker/` para regras e persistencia
- `migrations/` para tabelas operacionais dedicadas
- futura pasta dedicada, se o dominio funcional crescer

### 3. Cuiabar Atende

Responsabilidade:

- WhatsApp com IA
- reservas
- CRM
- marketing
- fidelidade

Escopo principal:

- atendimento conversacional
- CRM comercial
- automacoes de lead
- handoff humano
- reservas omnichannel
- campanhas e relacionamento

Areas de codigo mais ligadas:

- `src/crm/`
- `src/reservations/`
- `worker/`
- `worker/reservations/`
- `worker/whatsapp/`
- `worker/whatsapp-intelligence/` apenas enquanto houver transicao
- `migrations/`
- `services/whatsapp-baileys/`

Hosts e rotas associados:

- `crm.cuiabar.com`
- `reservas.cuiabar.com`
- APIs internas do Worker

## Regra de dependencia entre produtos

O modelo correto e:

- `GHCO OS` fornece o nucleo compartilhado
- `Cuiabar Web`, `MeuCuiabar` e `Cuiabar Atende` dependem do nucleo
- uma linha de produto nao deve depender diretamente dos detalhes internos da outra

### Dependencias permitidas

- todas podem depender de autenticacao interna comum
- todas podem depender de entidades centrais como cliente, reserva, evento e interacao
- todas podem consumir APIs internas do Worker

### Dependencias proibidas

- `Cuiabar Web` escrevendo direto em tabelas internas de `MeuCuiabar`
- `MeuCuiabar` acoplando UI ao fluxo publico do site
- `Cuiabar Atende` alterando contratos do core sem passar pela camada central
- qualquer modulo dependendo de scripts locais como parte do fluxo principal de producao

## Regra de naming para branches

Padrao recomendado:

- `ghco/*` para mudancas de nucleo compartilhado
- `web/*` para `Cuiabar Web`
- `meucuiabar/*` para `MeuCuiabar`
- `atende/*` para `Cuiabar Atende`
- `infra/*` para deploy, CI, Cloudflare, segredos e ambiente

## Regra de naming para documentacao

- nome institucional do sistema: `GHCO OS`
- nome do produto publico: `Cuiabar Web`
- nome do produto interno operacional: `MeuCuiabar`
- nome do produto de atendimento e relacionamento: `Cuiabar Atende`

Evitar em novas docs:

- usar `CRM` como nome de produto completo quando o escopo real for maior
- usar `Super` como nome estrutural no repositorio principal
- usar `MeuCuiabar` e `Cuiabar Atende` como se fossem a mesma coisa

## Consequencia pratica para o repositorio

Este repositorio continua unico, mas passa a ser organizado por:

1. sistema-mãe: `GHCO OS`
2. linhas de produto:
   - `Cuiabar Web`
   - `MeuCuiabar`
   - `Cuiabar Atende`

Se um modulo novo nao se encaixa claramente em uma dessas linhas, ele deve ser tratado como:

- extensao de infraestrutura
- experimento isolado
- ou backlog de arquitetura
