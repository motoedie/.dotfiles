#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./common.sh
source "${SCRIPT_DIR}/common.sh"

print_help() {
  cat <<'HELP_EOF'
Ralph loop state setup for Codex CLI/App

Usage:
  setup-ralph-loop.sh [PROMPT...] [--prompt-file PATH] [--max-iterations N] [--completion-promise TEXT]

Options:
  --prompt-file <path>      Read the Ralph prompt from a file
  --max-iterations <n>       Stop after N iterations (0 = unlimited; default 0)
  --completion-promise <t>   Stop only after output contains <promise>t</promise>
  -h, --help                 Show this help

Examples:
  setup-ralph-loop.sh Fix flaky login test --max-iterations 12
  setup-ralph-loop.sh "Build API" --completion-promise "DONE" --max-iterations 20
  setup-ralph-loop.sh --prompt-file MyInstructions.md --completion-promise "DONE"
HELP_EOF
}

prompt_parts=()
prompt_file=""
max_iterations=0
completion_promise="null"

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help)
      print_help
      exit 0
      ;;
    --max-iterations)
      [[ -n "${2:-}" ]] || ralph_die "--max-iterations requires a value"
      ralph_validate_non_negative_integer "$2" "max_iterations"
      max_iterations="$2"
      shift 2
      ;;
    --prompt-file)
      [[ -n "${2:-}" ]] || ralph_die "--prompt-file requires a value"
      prompt_file="$2"
      shift 2
      ;;
    --completion-promise)
      [[ -n "${2:-}" ]] || ralph_die "--completion-promise requires a value"
      completion_promise="$2"
      shift 2
      ;;
    *)
      prompt_parts+=("$1")
      shift
      ;;
  esac
done

if [[ -n "$prompt_file" ]] && [[ ${#prompt_parts[@]} -gt 0 ]]; then
  ralph_die "Use either inline prompt text or --prompt-file, not both"
fi

if [[ -n "$prompt_file" ]]; then
  [[ -f "$prompt_file" ]] || ralph_die "Prompt file not found: $prompt_file"
  [[ -r "$prompt_file" ]] || ralph_die "Prompt file is not readable: $prompt_file"
  prompt="$(cat -- "$prompt_file")"
else
  prompt="${prompt_parts[*]}"
fi

[[ -n "$prompt" ]] || ralph_die "No prompt provided"

ralph_ensure_dirs

if [[ -f "$RALPH_STATE_FILE" ]]; then
  echo "Overwriting existing Ralph state at $RALPH_STATE_FILE"
fi

completion_promise_yaml="null"
if [[ -n "$completion_promise" ]] && [[ "$completion_promise" != "null" ]]; then
  completion_promise_yaml="$(ralph_yaml_quote "$completion_promise")"
fi

cat >"$RALPH_STATE_FILE" <<EOF_STATE
---
active: true
iteration: 1
max_iterations: $max_iterations
completion_promise: $completion_promise_yaml
started_at: "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
---

$prompt
EOF_STATE

echo "Ralph loop initialized"
echo "State file: $RALPH_STATE_FILE"
echo "Iteration: 1"
if [[ "$max_iterations" -gt 0 ]]; then
  echo "Max iterations: $max_iterations"
else
  echo "Max iterations: unlimited"
fi

if [[ "$completion_promise" != "null" ]]; then
  echo "Completion promise: <promise>$completion_promise</promise>"
else
  echo "Completion promise: not set"
fi
