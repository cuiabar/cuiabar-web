#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

if [ ! -f ".env" ]; then
  echo "Crie o arquivo .env a partir de .env.example antes do deploy."
  exit 1
fi

docker compose pull
docker compose up -d
docker compose ps
