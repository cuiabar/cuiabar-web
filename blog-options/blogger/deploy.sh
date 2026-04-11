#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

if [ ! -f "blog-options/blogger/.env" ]; then
  cp "blog-options/blogger/.env.example" "blog-options/blogger/.env"
  echo "Arquivo blog-options/blogger/.env criado a partir do exemplo."
  echo "Preencha as credenciais Google antes da publicacao real."
fi

echo "Gerando preview/local package do Blogger..."
node scripts/publish-to-blogger.mjs

echo
echo "Se BLOGGER_DRY_RUN=false e as credenciais estiverem preenchidas, os posts serao enviados ao Blogger."
