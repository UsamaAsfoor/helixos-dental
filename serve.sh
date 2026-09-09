#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
PORT="${PORT:-8765}"
export HELIXHOG_PORT="$PORT"
export HELIXHOG_HOST="${HELIXHOG_HOST:-127.0.0.1}"
echo "HelixHog site       http://${HELIXHOG_HOST}:${PORT}/"
echo "HelixHog dashboard  http://${HELIXHOG_HOST}:${PORT}/hog/"
echo "Snippet for other sites:  <script src=\"http://${HELIXHOG_HOST}:${PORT}/hog.js\" async></script>"
echo "Routes: /  /b/  /quiz/  /quiz/guide/  /dental/  /for/dental-practices/  /thank-you/  /tour/  /hog/"
exec python3 helixhog/app.py
