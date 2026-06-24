#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:-/srv/evolution-atlas}"

cd "$PROJECT_DIR"
git pull --ff-only

if command -v pnpm >/dev/null 2>&1; then
  PM=(pnpm)
else
  PM=(corepack pnpm)
fi

export VITE_AI_API_BASE_URL="${VITE_AI_API_BASE_URL:-https://d5dlcp0j3qccddl8n119.628pfjdx.apigw.yandexcloud.net}"

"${PM[@]}" install --frozen-lockfile
"${PM[@]}" build

echo "Built static site in $PROJECT_DIR/dist"
