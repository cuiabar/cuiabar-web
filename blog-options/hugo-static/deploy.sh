#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$ROOT_DIR/.env"

resolve_path() {
  local input_path="$1"
  if [[ "$input_path" = /* ]]; then
    printf '%s\n' "$input_path"
  else
    printf '%s\n' "$ROOT_DIR/${input_path#./}"
  fi
}

if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

PROJECT_DIR="$(resolve_path "${HUGO_PROJECT_DIR:-hugo-blog}")"
BUILD_DIR="$(resolve_path "${HUGO_BUILD_DIR:-public}")"
DEPLOY_DIR="${DEPLOY_TARGET_DIR:-}"

if [ -n "$DEPLOY_DIR" ]; then
  DEPLOY_DIR="$(resolve_path "$DEPLOY_DIR")"
fi

if ! command -v hugo >/dev/null 2>&1; then
  echo "Hugo nao encontrado. Instale Hugo extended antes do deploy."
  exit 1
fi

if [ ! -f "$PROJECT_DIR/config.toml" ]; then
  echo "Nenhum projeto Hugo encontrado em $PROJECT_DIR."
  echo "Bootstrap inicial sugerido:"
  echo "  hugo new site \"$PROJECT_DIR\""
  echo "Depois configure tema, taxonomias e layouts."
  exit 1
fi

cd "$PROJECT_DIR"
hugo --minify

rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"
cp -R "$PROJECT_DIR/public/." "$BUILD_DIR/"

if [ -n "$DEPLOY_DIR" ]; then
  mkdir -p "$DEPLOY_DIR"
  if command -v rsync >/dev/null 2>&1; then
    rsync -av --delete "$BUILD_DIR"/ "$DEPLOY_DIR"/
  else
    rm -rf "$DEPLOY_DIR"
    mkdir -p "$DEPLOY_DIR"
    cp -R "$BUILD_DIR/." "$DEPLOY_DIR/"
  fi
fi

echo "Build Hugo concluido em: $BUILD_DIR"
if [ -n "$DEPLOY_DIR" ]; then
  echo "Arquivos sincronizados para: $DEPLOY_DIR"
fi
