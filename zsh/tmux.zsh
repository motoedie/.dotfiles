# tmux-specific helpers for stable SSH agent forwarding.
if ! command -v tmux >/dev/null 2>&1; then
  return
fi

tmux_attach() {
  local session="$1"
  local stable_sock="$HOME/.ssh/tmux-ssh-auth.sock"

  if [[ -n "$SSH_AUTH_SOCK" && -S "$SSH_AUTH_SOCK" ]]; then
    ln -snf "$SSH_AUTH_SOCK" "$stable_sock"
    command tmux set-environment -g SSH_AUTH_SOCK "$stable_sock" 2>/dev/null || true
    command tmux set-environment -t "$session" SSH_AUTH_SOCK "$stable_sock" 2>/dev/null || true
  fi

  command tmux new -As "$session"
}

sync_tmux_ssh_auth_sock() {
  [[ -z "$TMUX" ]] && return

  local tmux_sock
  tmux_sock="$(command tmux show-environment SSH_AUTH_SOCK 2>/dev/null | sed -n 's/^SSH_AUTH_SOCK=//p')"

  if [[ -n "$tmux_sock" && -S "$tmux_sock" ]]; then
    export SSH_AUTH_SOCK="$tmux_sock"
  fi
}

autoload -Uz add-zsh-hook
add-zsh-hook -d precmd sync_tmux_ssh_auth_sock 2>/dev/null
add-zsh-hook -d preexec sync_tmux_ssh_auth_sock 2>/dev/null
add-zsh-hook precmd sync_tmux_ssh_auth_sock
add-zsh-hook preexec sync_tmux_ssh_auth_sock

sync_tmux_ssh_auth_sock

alias tmuxcodex='tmux_attach codex-app'
alias tmuxclaude='tmux_attach claude-app'
alias tmuxapps='tmux_attach service-app'
alias tmuxneovim='tmux_attach neovim-app'
