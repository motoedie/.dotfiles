#!/usr/bin/env bash

set -euo pipefail

RALPH_STATE_DIR="${RALPH_STATE_DIR:-.ralph-wiggum}"
RALPH_STATE_FILE="${RALPH_STATE_FILE:-${RALPH_STATE_DIR}/ralph-loop.local.md}"
RALPH_LOG_DIR="${RALPH_LOG_DIR:-${RALPH_STATE_DIR}/ralph-loop}"

ralph_die() {
  echo "Error: $*" >&2
  exit 1
}

ralph_ensure_dirs() {
  mkdir -p "$RALPH_STATE_DIR"
  mkdir -p "$RALPH_LOG_DIR"
}

ralph_strip_wrapping_quotes() {
  local value="$1"

  if [[ "$value" =~ ^\".*\"$ ]]; then
    value="${value#\"}"
    value="${value%\"}"
  fi

  printf '%s' "$value"
}

ralph_yaml_quote() {
  local value="$1"
  value="${value//\\/\\\\}"
  value="${value//\"/\\\"}"
  printf '"%s"' "$value"
}

ralph_read_frontmatter_value() {
  local key="$1"
  local file="${2:-$RALPH_STATE_FILE}"

  awk -v target="$key" '
    BEGIN {
      in_frontmatter = 0
    }
    /^---$/ {
      if (in_frontmatter == 0) {
        in_frontmatter = 1
        next
      }
      if (in_frontmatter == 1) {
        exit
      }
    }
    in_frontmatter == 1 {
      split($0, parts, /:[ ]*/)
      if (parts[1] == target) {
        sub(parts[1] ":[ ]*", "", $0)
        print $0
        exit
      }
    }
  ' "$file"
}

ralph_read_prompt() {
  local file="${1:-$RALPH_STATE_FILE}"
  awk '
    BEGIN {
      separators = 0
    }
    /^---$/ {
      separators += 1
      next
    }
    separators >= 2 {
      print
    }
  ' "$file"
}

ralph_update_iteration() {
  local next_iteration="$1"
  local tmp_file="${RALPH_STATE_FILE}.tmp.$$"

  sed "s/^iteration: .*/iteration: ${next_iteration}/" "$RALPH_STATE_FILE" >"$tmp_file"
  mv "$tmp_file" "$RALPH_STATE_FILE"
}

ralph_extract_promise_text() {
  perl -0777 -ne '
    if (/<promise>(.*?)<\/promise>/s) {
      $text = $1;
      $text =~ s/^\s+|\s+$//g;
      $text =~ s/\s+/ /g;
      print $text;
    }
  '
}

ralph_validate_non_negative_integer() {
  local value="$1"
  local field_name="$2"

  if [[ ! "$value" =~ ^[0-9]+$ ]]; then
    ralph_die "${field_name} must be a non-negative integer, got: ${value}"
  fi
}
