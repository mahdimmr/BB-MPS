#!/bin/sh
set -eu

echo "Generating Prisma client..."
npx prisma generate

echo "Applying Prisma migrations..."
npx prisma migrate deploy

if [ "${SEED_DATABASE:-}" = "true" ]; then
  echo "Seeding database..."
  npx prisma db seed
else
  echo "Skipping seed (set SEED_DATABASE=true to enable)."
fi

echo "Database ready."
