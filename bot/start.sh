#!/bin/sh
set -eu

# Pterodactyl assigns the server's port as SERVER_PORT. The bot only uses it
# for the local health endpoint; the Discord gateway itself is outbound.
if [ -n "${SERVER_PORT:-}" ]; then
  export PORT="$SERVER_PORT"
fi

if [ ! -d node_modules ]; then
  echo "[wrightyard] Installing production dependencies..."
  npm ci --omit=dev --no-audit --no-fund
fi

exec node dist/index.js
