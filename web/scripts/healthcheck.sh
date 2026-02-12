#!/usr/bin/env bash
set -euo pipefail

TARGET_URL="${1:-http://127.0.0.1:${PORT:-3000}}"
TIMEOUT_SECONDS="${TIMEOUT_SECONDS:-5}"

status_code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time "$TIMEOUT_SECONDS" "$TARGET_URL")"

if [[ "$status_code" != "200" ]]; then
  echo "[healthcheck] FAIL ${TARGET_URL} -> HTTP ${status_code}"
  exit 1
fi

echo "[healthcheck] OK ${TARGET_URL}"
