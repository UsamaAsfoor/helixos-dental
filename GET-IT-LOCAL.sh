#!/usr/bin/env bash
# Paste this ENTIRE block into Terminal on your Mac/PC. One shot.
set -euo pipefail

URL="https://shelter-bills-submission-quiz.trycloudflare.com/fluentai-dental-local.zip"
DIR="$HOME/helixos-dental"
ZIP="/tmp/fluentai-dental-local.zip"

echo "Downloading (~40MB)..."
curl -fL --progress-bar "$URL" -o "$ZIP"

echo "Installing to $DIR ..."
rm -rf "$DIR"
mkdir -p "$DIR"
unzip -q "$ZIP" -d "$DIR"

chmod +x "$DIR/serve.sh" 2>/dev/null || true

echo ""
echo "DONE. Files are at: $DIR"
echo ""
echo "Starting local site..."
cd "$DIR"
./serve.sh
