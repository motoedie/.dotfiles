#!/bin/zsh

DOTFILES_DIR="$(cd "$(dirname "$0")/.." && pwd)"
AI_TOOLS_DIR="$DOTFILES_DIR/ai-tools"

symlink_ai_dir() {
  local src="$AI_TOOLS_DIR/$1"
  local dest="$2"

  if [ -L "$dest" ]; then
    echo "Skipping $dest (already a symlink)"
    return
  fi

  if [ -d "$dest" ]; then
    echo "Backing up existing $dest to ${dest}.bak"
    mv "$dest" "${dest}.bak"
  fi

  ln -s "$src" "$dest"
  echo "Linked $dest -> $src"
}

[ ! -d "$HOME/.claude" ] && mkdir "$HOME/.claude"
[ ! -d "$HOME/.cursor" ] && mkdir "$HOME/.cursor"

symlink_ai_dir "commands" "$HOME/.claude/commands"
symlink_ai_dir "skills"   "$HOME/.claude/skills"
symlink_ai_dir "commands" "$HOME/.cursor/commands"
symlink_ai_dir "skills"   "$HOME/.cursor/skills"
