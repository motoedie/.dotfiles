#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./common.sh
source "${SCRIPT_DIR}/common.sh"

print_help() {
  cat <<'HELP_EOF'
Run Ralph loop iterations with Codex CLI

Usage:
  run-ralph-loop.sh [options]

State source:
  Reads .ralph-wiggum/ralph-loop.local.md created by setup-ralph-loop.sh.

Behavior:
  Defaults the inner codex exec call to sandboxed automatic execution via --full-auto.

Options:
  --once                               Run exactly one iteration and stop
  --dry-run                            Do not call codex; print planned command only
  --codex-bin <path>                   Codex binary path (default: codex)
  --model <model>                      Forwarded to codex exec
  --sandbox <mode>                     Forwarded to codex exec
  --profile <name>                     Forwarded to codex exec
  --cd <dir>                           Forwarded to codex exec
  --config <key=value>                 Repeatable codex config override
  --enable <feature>                   Repeatable codex feature flag
  --disable <feature>                  Repeatable codex feature flag
  --image <path>                       Repeatable codex image path
  --color <mode>                       Forwarded to codex exec
  --full-auto                          Forwarded to codex exec
  --skip-git-repo-check                Forwarded to codex exec
  -h, --help                           Show this help

Examples:
  run-ralph-loop.sh
  run-ralph-loop.sh --once --model gpt-5
HELP_EOF
}

run_once=false
dry_run=false
codex_bin="${CODEX_BIN:-codex}"
declare -a codex_args=()
has_execution_mode=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help)
      print_help
      exit 0
      ;;
    --once)
      run_once=true
      shift
      ;;
    --dry-run)
      dry_run=true
      shift
      ;;
    --codex-bin)
      [[ -n "${2:-}" ]] || ralph_die "--codex-bin requires a value"
      codex_bin="$2"
      shift 2
      ;;
    --model|--sandbox|--profile|--cd|--config|--enable|--disable|--image|--color)
      [[ -n "${2:-}" ]] || ralph_die "$1 requires a value"
      if [[ "$1" == "--sandbox" ]]; then
        if [[ "$2" == "danger-full-access" ]]; then
          ralph_die "danger-full-access is not supported by this sandboxed Ralph wrapper"
        fi
        has_execution_mode=true
      fi
      codex_args+=("$1" "$2")
      shift 2
      ;;
    --full-auto)
      codex_args+=("$1")
      has_execution_mode=true
      shift
      ;;
    --skip-git-repo-check)
      codex_args+=("$1")
      shift
      ;;
    *)
      ralph_die "Unknown option: $1"
      ;;
  esac
done

if [[ "$has_execution_mode" == false ]]; then
  codex_args+=("--full-auto")
fi

[[ -f "$RALPH_STATE_FILE" ]] || ralph_die "No active Ralph loop found at $RALPH_STATE_FILE"

ralph_ensure_dirs

prompt="$(ralph_read_prompt "$RALPH_STATE_FILE")"
[[ -n "$prompt" ]] || ralph_die "State file is missing prompt text"

iteration="$(ralph_read_frontmatter_value iteration "$RALPH_STATE_FILE")"
max_iterations="$(ralph_read_frontmatter_value max_iterations "$RALPH_STATE_FILE")"
completion_promise="$(ralph_read_frontmatter_value completion_promise "$RALPH_STATE_FILE")"
completion_promise="$(ralph_strip_wrapping_quotes "$completion_promise")"

ralph_validate_non_negative_integer "$iteration" "iteration"
ralph_validate_non_negative_integer "$max_iterations" "max_iterations"

if [[ "$completion_promise" == "null" ]]; then
  completion_promise=""
fi

echo "Starting Ralph run loop from iteration $iteration"

while true; do
  if [[ ! -f "$RALPH_STATE_FILE" ]]; then
    echo "Ralph state file was removed. Stopping loop."
    exit 0
  fi

  if [[ "$max_iterations" -gt 0 ]] && [[ "$iteration" -gt "$max_iterations" ]]; then
    echo "Reached max iterations ($max_iterations). Stopping Ralph loop."
    rm -f "$RALPH_STATE_FILE"
    exit 0
  fi

  output_file="${RALPH_LOG_DIR}/iteration-${iteration}.txt"

  iteration_prompt="${prompt}

[Ralph iteration ${iteration}]"

  if [[ -n "$completion_promise" ]]; then
    iteration_prompt+="
To finish, output exactly: <promise>${completion_promise}</promise>"
  fi

  if [[ "$dry_run" == true ]]; then
    if [[ ${#codex_args[@]} -gt 0 ]]; then
      codex_args_text=" ${codex_args[*]}"
    else
      codex_args_text=""
    fi
    echo "[dry-run] Would run: ${codex_bin} exec${codex_args_text} -o ${output_file} <prompt>"
    : >"$output_file"
  else
    echo "Running iteration ${iteration}..."

    set +e
    "$codex_bin" exec "${codex_args[@]}" -o "$output_file" "$iteration_prompt"
    codex_exit_code=$?
    set -e

    if [[ $codex_exit_code -ne 0 ]]; then
      echo "codex exec failed at iteration ${iteration} (exit code ${codex_exit_code})." >&2
      echo "State preserved at $RALPH_STATE_FILE for retry." >&2
      exit "$codex_exit_code"
    fi
  fi

  last_output=""
  if [[ -f "$output_file" ]]; then
    last_output="$(cat "$output_file")"
  fi

  if [[ -n "$completion_promise" ]] && [[ -n "$last_output" ]]; then
    promise_text="$(printf '%s' "$last_output" | ralph_extract_promise_text || true)"

    if [[ -n "$promise_text" ]] && [[ "$promise_text" == "$completion_promise" ]]; then
      echo "Detected completion promise at iteration ${iteration}."
      rm -f "$RALPH_STATE_FILE"
      exit 0
    fi
  fi

  next_iteration=$((iteration + 1))

  if [[ ! -f "$RALPH_STATE_FILE" ]]; then
    echo "Ralph state file was removed during iteration. Stopping loop."
    exit 0
  fi

  ralph_update_iteration "$next_iteration"
  iteration="$next_iteration"

  if [[ "$run_once" == true ]]; then
    echo "Completed one iteration. Current state saved to $RALPH_STATE_FILE"
    exit 0
  fi

done
