#!/usr/bin/env bash
# Walks the Phase 1 workflow (goal setting -> dotted lead consultation -> signatures
# -> approval & lock) against a running dev server, and checks that the guardrails
# reject the moves they are supposed to reject.
#
# Expects a freshly seeded database (`npm run db:reset`) because it drives the
# seeded agreement from DRAFT all the way to APPROVED.
#
# Usage: npm run dev  (in another terminal), then: bash scripts/smoke-api.sh
set -uo pipefail

API="${API:-http://localhost:3000/api}"
PASSWORD="${DEMO_PASSWORD:-Bimeh@1405}"
JAR_DIR="$(mktemp -d)"
trap 'rm -rf "$JAR_DIR"' EXIT

pass=0
fail=0

login() {
  curl -s -o /dev/null -c "$JAR_DIR/$1.jar" -X POST "$API/auth/login" \
    -H 'content-type: application/json' \
    -d "{\"email\":\"$2\",\"password\":\"$PASSWORD\"}"
}

# call <user> <method> <path> [body] -> prints "<status>\n<body>"
call() {
  local user="$1" method="$2" path="$3" body="${4:-}"
  if [ -n "$body" ]; then
    curl -s -w '\n%{http_code}' -b "$JAR_DIR/$user.jar" -X "$method" "$API$path" \
      -H 'content-type: application/json' -d "$body"
  else
    curl -s -w '\n%{http_code}' -b "$JAR_DIR/$user.jar" -X "$method" "$API$path"
  fi
}

check() {
  local label="$1" expected="$2" actual="$3" payload="${4:-}"
  if [ "$expected" = "$actual" ]; then
    printf '  ok   %-58s %s\n' "$label" "$actual"
    pass=$((pass + 1))
  else
    printf '  FAIL %-58s expected %s, got %s\n       %s\n' "$label" "$expected" "$actual" "$payload"
    fail=$((fail + 1))
  fi
}

status_of() { tail -n1 <<<"$1"; }
body_of() { sed '$d' <<<"$1"; }

echo "Signing in demo accounts"
login employee employee@bimehbazar.test
login lead lead@bimehbazar.test
login dotted tech-lead@bimehbazar.test
login hr hr@bimehbazar.test

res=$(call employee GET /auth/me)
check "employee session" 200 "$(status_of "$res")" "$(body_of "$res")"

res=$(call employee GET "/agreements?scope=mine")
AGREEMENT_ID=$(body_of "$res" | jq -r '.data.items[0].id // empty')
AGREEMENT_STATUS=$(body_of "$res" | jq -r '.data.items[0].status // empty')
echo "Agreement under test: $AGREEMENT_ID ($AGREEMENT_STATUS)"

if [ "$AGREEMENT_STATUS" != "DRAFT" ]; then
  echo "This script drives the seeded agreement from DRAFT to APPROVED."
  echo "Run 'npm run db:reset' first, then re-run."
  exit 1
fi

echo
echo "Phase 1 — goal setting workflow"
res=$(call employee POST "/agreements/$AGREEMENT_ID/transition" '{"action":"SUBMIT_FOR_REVIEW"}')
check "employee submits draft" 200 "$(status_of "$res")" "$(body_of "$res")"

res=$(call employee POST "/agreements/$AGREEMENT_ID/transition" '{"action":"EMPLOYEE_SIGN"}')
check "signature blocked before dotted lead input" 422 "$(status_of "$res")" "$(body_of "$res")"

res=$(call dotted POST "/agreements/$AGREEMENT_ID/transition" \
  '{"action":"DOTTED_LEAD_REVIEW","note":"اهداف فنی تأیید می‌شود."}')
check "dotted lead records consultation" 200 "$(status_of "$res")" "$(body_of "$res")"

res=$(call employee POST "/agreements/$AGREEMENT_ID/transition" '{"action":"EMPLOYEE_SIGN"}')
check "employee signs" 200 "$(status_of "$res")" "$(body_of "$res")"

res=$(call dotted POST "/agreements/$AGREEMENT_ID/transition" '{"action":"MANAGER_SIGN"}')
check "dotted lead cannot sign as manager" 403 "$(status_of "$res")" "$(body_of "$res")"

res=$(call lead POST "/agreements/$AGREEMENT_ID/transition" '{"action":"MANAGER_SIGN"}')
check "solid lead signs" 200 "$(status_of "$res")" "$(body_of "$res")"

res=$(call lead POST "/agreements/$AGREEMENT_ID/transition" '{"action":"APPROVE"}')
check "solid lead approves and locks" 200 "$(status_of "$res")" "$(body_of "$res")"

res=$(call employee POST "/agreements/$AGREEMENT_ID/items" \
  '{"layer":"OPERATIONAL","title":"هدف جدید پس از قفل","weight":10}')
check "locked agreement rejects new goals" 409 "$(status_of "$res")" "$(body_of "$res")"

res=$(call lead POST "/agreements/$AGREEMENT_ID/transition" \
  '{"action":"REQUEST_AMENDMENT","reason":"تغییر اولویت محصول"}')
check "amendment needs a mid-term trigger" 422 "$(status_of "$res")" "$(body_of "$res")"

echo
echo "Cycle guardrails"
res=$(call employee POST /cycles \
  '{"title":"1406-Q1","startDate":"2027-03-21T00:00:00.000Z"}')
check "non-HR cannot create a cycle" 403 "$(status_of "$res")" "$(body_of "$res")"

res=$(call hr POST /cycles \
  '{"title":"1406-Q1-invalid","startDate":"2027-03-21T00:00:00.000Z","endDate":"2027-06-21T00:00:00.000Z"}')
check "cycle must be exactly four months" 422 "$(status_of "$res")" "$(body_of "$res")"

res=$(call hr POST /cycles \
  '{"title":"1405-Q2-overlap","startDate":"2026-09-01T00:00:00.000Z"}')
check "overlapping cycle rejected" 409 "$(status_of "$res")" "$(body_of "$res")"

res=$(call hr POST /cycles '{"title":"1406-Q1","startDate":"2027-03-21T00:00:00.000Z"}')
check "HR creates a valid cycle" 201 "$(status_of "$res")" "$(body_of "$res")"
NEW_CYCLE_ID=$(body_of "$res" | jq -r '.data.id // empty')
body_of "$res" | jq -r 'if .data then "       end \(.data.endDate) | mid-term \(.data.midTermReviewDate) | final \(.data.finalEvaluationStart)" else "" end'

if [ -n "$NEW_CYCLE_ID" ]; then
  call hr DELETE "/cycles/$NEW_CYCLE_ID" >/dev/null
fi

echo
echo "Localized errors"
fa=$(curl -s -b "$JAR_DIR/employee.jar" -X POST "$API/cycles" -H 'content-type: application/json' \
  -d '{"title":"x","startDate":"2027-03-21T00:00:00.000Z"}' | jq -r '.error.message')
en=$(curl -s -b "$JAR_DIR/employee.jar" -H 'x-bbpms-locale: en' -X POST "$API/cycles" \
  -H 'content-type: application/json' -d '{"title":"x","startDate":"2027-03-21T00:00:00.000Z"}' |
  jq -r '.error.message')
echo "  fa: $fa"
echo "  en: $en"

echo
echo "passed: $pass, failed: $fail"
[ "$fail" -eq 0 ]
