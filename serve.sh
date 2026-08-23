#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
PORT="${PORT:-8765}"
echo "Serving a. Development Agency site at http://127.0.0.1:${PORT}/"
echo "Routes: /  /dental/  /for/dental-practices/  /thank-you/  /tour/"
exec python3 -m http.server "$PORT" --bind 127.0.0.1
