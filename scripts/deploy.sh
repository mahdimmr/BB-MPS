#!/bin/sh
set -eu

ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
cd "$ROOT"

if [ ! -f .env ]; then
  echo "Missing $ROOT/.env — copy .env.production.example and set production secrets." >&2
  exit 1
fi

if [ -z "${APP_IMAGE:-}" ] || [ -z "${MIGRATE_IMAGE:-}" ]; then
  echo "APP_IMAGE and MIGRATE_IMAGE must be set (e.g. ghcr.io/org/bb-pm/app:<sha>)." >&2
  exit 1
fi

if [ -n "${GHCR_TOKEN:-}" ]; then
  echo "$GHCR_TOKEN" | docker login ghcr.io -u "${GHCR_USERNAME:?GHCR_USERNAME is required when GHCR_TOKEN is set}" --password-stdin
fi

printf 'APP_IMAGE=%s\nMIGRATE_IMAGE=%s\n' "$APP_IMAGE" "$MIGRATE_IMAGE" > .deploy.env

COMPOSE="docker compose --env-file .env --env-file .deploy.env -f docker-compose.prod.yml"

$COMPOSE pull app migrate
$COMPOSE up -d postgres --wait
$COMPOSE run --rm --no-deps migrate
$COMPOSE up -d --no-deps --force-recreate --remove-orphans app --wait

echo "Deployed $APP_IMAGE"
