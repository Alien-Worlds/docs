#!/usr/bin/env bash
# Re-fetch every docusaurus-plugin-remote-content source.
#
# The plugin runs with noRuntimeDownloads: true, so docs/03-API tools/ is only
# ever as fresh as the last time somebody ran this. The command list is derived
# from the CLI rather than hardcoded, so adding a source to docusaurus.config.ts
# is enough — this script needs no edit.
set -euo pipefail

cd "$(dirname "$0")/.."

targets=$(pnpm --silent docusaurus --help \
  | grep -oE 'download-remote-[a-z0-9-]+' \
  | sort -u)

if [ -z "$targets" ]; then
  echo "No download-remote-* commands found — did the plugin fail to load?" >&2
  exit 1
fi

echo "$targets" | while read -r target; do
  echo "==> $target"
  pnpm docusaurus "$target"
done
