#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./common.sh
source "${SCRIPT_DIR}/common.sh"

if [[ ! -f "$RALPH_STATE_FILE" ]]; then
  echo "No active Ralph loop found."
  exit 0
fi

iteration="$(ralph_read_frontmatter_value iteration "$RALPH_STATE_FILE")"
rm -f "$RALPH_STATE_FILE"

echo "Cancelled Ralph loop (was at iteration ${iteration:-unknown})."
