#!/usr/bin/env bash
# Downloads every image/SVG used by index.html from the Figma MCP asset server
# into assets/img/. Requires network access to www.figma.com.
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
out="$root/assets/img"
mkdir -p "$out"
fail=0
while read -r name url; do
  [[ -z "${name:-}" || "$name" == \#* ]] && continue
  if curl -fsSL -o "$out/$name" "$url"; then
    echo "ok   $name"
  else
    echo "FAIL $name" >&2; fail=1
  fi
done < "$root/scripts/figma-assets.txt"
exit $fail
