#!/usr/bin/env bash
# Run this on YOUR Mac/PC (Terminal) to install the dental landing repo locally.
set -euo pipefail

DOWNLOAD_URL="${1:-https://shelter-bills-submission-quiz.trycloudflare.com/fluentai-dental-local.zip}"
TARGET="${2:-$HOME/fluentaiconsulting-dental}"
TMP_ZIP="${TMPDIR:-/tmp}/fluentai-dental-local.zip"

echo "Downloading site (~13MB)..."
curl -fL --progress-bar "$DOWNLOAD_URL" -o "$TMP_ZIP"

echo "Installing to $TARGET..."
rm -rf "$TARGET"
mkdir -p "$TARGET"
unzip -q "$TMP_ZIP" -d "$TARGET"

chmod +x "$TARGET/serve.sh"
mkdir -p "$HOME/.cursor"
if [ -f "$TARGET/.cursor/mcp.json" ] && [ ! -f "$HOME/.cursor/mcp.json" ]; then
  cp "$TARGET/.cursor/mcp.json" "$HOME/.cursor/mcp.json"
fi

echo ""
echo "Installed: $TARGET"
echo "Start site:  cd '$TARGET' && ./serve.sh"
echo "Open:        http://127.0.0.1:8765/"
