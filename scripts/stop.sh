#!/usr/bin/env bash
# dev server 停止 + cleanup (O36)。
set -euo pipefail

cd "$(dirname "$0")/.."

PID_FILE=".dev-server.pid"

if [ -f "$PID_FILE" ]; then
  PID="$(cat "$PID_FILE")"
  if kill -0 "$PID" 2>/dev/null; then
    kill "$PID" 2>/dev/null || true
    echo "✓ dev server を停止 (pid $PID)"
  fi
  rm -f "$PID_FILE"
else
  echo "起動中の dev server はありません"
fi
