#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker nao encontrado. Instale Docker Engine/Desktop para subir o Directus."
  exit 1
fi

if [ ! -f ".env" ]; then
  echo "Arquivo .env nao encontrado."
  echo "Execute: cp .env.example .env"
  exit 1
fi

echo ">> Atualizando imagens..."
docker compose pull

echo ">> Subindo stack local do editor..."
docker compose up -d database cache directus

echo ">> Garantindo que o tunnel remoto fique desligado neste modo local..."
docker compose stop cloudflared >/dev/null 2>&1 || true

echo ">> Status dos servicos:"
docker compose ps

echo
echo "Painel: http://127.0.0.1:${DIRECTUS_PORT:-8055}"
echo "Login manual atual: leonardo@cuiabar.net"
