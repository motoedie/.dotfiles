#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

print_help() {
  cat <<'HELP_EOF'
Start and run a Ralph loop with Codex.

Usage:
  ralph-loop.sh [PROMPT + setup options] [-- run options]

Setup options (before --):
  --prompt-file <path>
  --max-iterations <n>
  --completion-promise <text>

Run options (after --):
  Any run-ralph-loop.sh options, such as --model or --cd.

Examples:
  ralph-loop.sh "Fix flaky tests" --max-iterations 8 --completion-promise "DONE"
  ralph-loop.sh --prompt-file MyInstructions.md --max-iterations 20 --completion-promise "DONE"
  ralph-loop.sh Build CRUD API --max-iterations 20

Notes:
  - Ralph defaults the inner codex exec to sandboxed automatic execution
  - If you need Codex exec flags, place them after --
  - State file: .ralph-wiggum/ralph-loop.local.md
HELP_EOF
}

if [[ "${1:-}" == "-h" ]] || [[ "${1:-}" == "--help" ]]; then
  print_help
  exit 0
fi

declare -a setup_args=()
declare -a run_args=()
found_separator=false

while [[ $# -gt 0 ]]; do
  if [[ "$1" == "--" ]]; then
    found_separator=true
    shift
    continue
  fi

  if [[ "$found_separator" == true ]]; then
    run_args+=("$1")
  else
    setup_args+=("$1")
  fi

  shift
done

"${SCRIPT_DIR}/setup-ralph-loop.sh" "${setup_args[@]}"
"${SCRIPT_DIR}/run-ralph-loop.sh" "${run_args[@]}"
