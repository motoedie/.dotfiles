#!/bin/sh

set -u

failures=0

check_command() {
  label=$1
  shift

  for command_name do
    if command -v "$command_name" >/dev/null 2>&1; then
      printf '  [OK] %s (%s)\n' "$label" "$command_name"
      return
    fi
  done

  printf '  [MISSING] %s\n' "$label"
  failures=$((failures + 1))
}

os=$(uname -s) || {
  printf 'Unable to determine operating system\n' >&2
  exit 2
}

case "$os" in
  Darwin)
    platform="macOS"
    ;;
  Linux)
    # Keep distribution metadata local to this check; match complete ID tokens.
    if [ -r /etc/os-release ] && (
      . /etc/os-release
      case " ${ID:-} ${ID_LIKE:-} " in
        *" debian "*) exit 0 ;;
        *) exit 1 ;;
      esac
    ); then
      platform="Debian"
    else
      printf 'Unsupported Linux distribution\n' >&2
      exit 2
    fi
    ;;
  *)
    printf 'Unsupported operating system: %s\n' "$os" >&2
    exit 2
    ;;
esac

printf 'Dotfiles doctor - %s\n\n' "$platform"

check_command "Git" git
check_command "Zsh" zsh
check_command "Homebrew" brew
check_command "Neovim" nvim
check_command "tmux" tmux
check_command "lazygit" lazygit
check_command "ripgrep" rg
check_command "fzf" fzf
check_command "bat" bat batcat
check_command "fd" fd fdfind
check_command "eza" eza
check_command "delta" delta

if [ "$failures" -gt 0 ]; then
  printf '\nMissing tools: %s\n' "$failures"
  exit 1
fi

printf '\nAll tools are available.\n'
