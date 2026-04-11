# Integracao - Ghost

## Quando escolher esta opcao

Use Ghost quando a prioridade for publicar com velocidade, dar autonomia ao time editorial e abrir caminho para newsletter, memberships e distribuicao recorrente.

## O que esta stack entrega bem

- admin forte
- editor maduro
- SEO nativo razoavel
- RSS
- tags, autores e colecoes
- newsletters e memberships nativos

## Subida inicial

```bash
cp .env.example .env
docker compose up -d
```

Ghost vai responder em `127.0.0.1:2368` e o Nginx do host publica `blog.cuiabar.com`.

## Integracao com o ecossistema Cuiabar

- criar links contextuais para `cuiabar.com/menu`
- enviar trafego para `reservas.cuiabar.com`
- usar CTA para `WhatsApp` e `Canal do WhatsApp`
- publicar agenda e bastidores com consistencia visual

## Trade-offs

- Ghost fica mais isolado do app principal
- personalizacoes muito profundas exigem mais trabalho em tema custom
- integracoes com dados internos pedem tema custom ou middleware

## Quando eu recomendaria Ghost

- se houver rotina editorial forte
- se newsletter for prioridade real
- se a equipe quiser publicar sem depender tanto de dev
