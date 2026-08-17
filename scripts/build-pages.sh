#!/bin/sh
# Static-export the UI for GitHub Pages. API routes and server actions are
# moved aside for the build, then restored.
set -eu

ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
cd "$ROOT"

STASH="$(mktemp -d)"
restore() {
  mkdir -p src/app
  if [ -d "$STASH/api" ]; then mv "$STASH/api" src/app/api; fi
  if [ -d "$STASH/actions" ]; then mv "$STASH/actions" src/app/actions; fi
  rm -rf "$STASH"
}
trap restore EXIT

if [ -d src/app/api ]; then mv src/app/api "$STASH/api"; fi
if [ -d src/app/actions ]; then mv src/app/actions "$STASH/actions"; fi

rm -rf .next

export GITHUB_PAGES=true
npx next build
