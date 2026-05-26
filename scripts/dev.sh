#!/usr/bin/env bash
# ローカル開発 launcher (O36)。keyless: dev は memory backend で動くため API キー不要。
# 起動 → health check (HTTP 200) → smoke (#root 配信確認)。停止は scripts/stop.sh。
set -euo pipefail

cd "$(dirname "$0")/.."

PORT="${PORT:-5173}"
PID_FILE=".dev-server.pid"

if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
  echo "dev server は既に起動中 (pid $(cat "$PID_FILE"))。停止は scripts/stop.sh"
  exit 0
fi

echo "▶ Vite dev server を起動 (port $PORT, keyless memory backend)..."
npm run dev -- --port "$PORT" >".dev-server.log" 2>&1 &
echo $! >"$PID_FILE"

echo "▶ health check (http://localhost:$PORT) ..."
for i in $(seq 1 30); do
  if curl -fsS "http://localhost:$PORT" >/dev/null 2>&1; then
    if curl -fsS "http://localhost:$PORT" | grep -q 'id="root"'; then
      echo "✓ smoke OK: dev server 応答 + #root 配信 (http://localhost:$PORT)"
      echo "  ログ: .dev-server.log / 停止: scripts/stop.sh"
      exit 0
    fi
  fi
  sleep 1
done

echo "✗ health check 失敗 (.dev-server.log を確認)"
exit 1
