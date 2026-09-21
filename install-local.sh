#!/usr/bin/env bash
set -euo pipefail
TARGET="${1:-$HOME/helixos-dental}"
ZIP="$(cd "$(dirname "$0")" && pwd)/fluentai-dental-local.zip"
if [[ -f "$ZIP" ]]; then
  rm -rf "$TARGET"
  unzip -q "$ZIP" -d "$(dirname "$TARGET")"
  mv "$(dirname "$TARGET")/helixos-dental" "$TARGET" 2>/dev/null || true
else
  BUNDLE="$(cd "$(dirname "$0")" && pwd)/helixos-dental.bundle"
  rm -rf "$TARGET"
  git clone "$BUNDLE" "$TARGET"
fi
chmod +x "$TARGET/serve.sh"
echo "Installed to: $TARGET"
echo "Run: cd '$TARGET' && ./serve.sh"
