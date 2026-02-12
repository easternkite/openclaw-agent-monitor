#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

PORT="${PORT:-3000}"
HOSTNAME="${HOSTNAME:-0.0.0.0}"

npm run start -- --hostname "$HOSTNAME" --port "$PORT"
