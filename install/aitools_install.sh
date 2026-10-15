npm i -g @openai/codex
curl -fsSL https://claude.ai/install.sh | bash

export PATH="$HOME/.local/bin:$PATH"

command -v rtk >/dev/null 2>&1 || curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh
[ -f "$HOME/.claude/RTK.md" ] || rtk init -g --auto-patch
grep -qE 'rtk hook cursor|rtk-rewrite\.sh' "$HOME/.cursor/hooks.json" 2>/dev/null || rtk init -g --agent cursor
[ -f "${CODEX_HOME:-$HOME/.codex}/RTK.md" ] || rtk init -g --codex

[ -d "$HOME/.claude/plugins/marketplaces/claude-code-mods" ] || claude plugin marketplace add hamzafer/claude-code-mods
claude plugin marketplace update claude-code-mods
claude plugin install snake@claude-code-mods
claude plugin install where-am-i@claude-code-mods
claude plugin update snake@claude-code-mods --scope user
claude plugin update where-am-i@claude-code-mods --scope user
# Desktop SSH sessions load hook-less --plugin-dir copies that override installed plugins
claude plugin disable snake@inline --scope user
claude plugin disable where-am-i@inline --scope user

[ -d "$HOME/.claude/plugins/marketplaces/claude-community" ] || claude plugin marketplace add anthropics/claude-plugins-community
claude plugin marketplace update claude-community
claude plugin install next-steps@claude-community
claude plugin update next-steps@claude-community --scope user
claude plugin disable next-steps@inline --scope user

[ -d "$HOME/.claude/plugins/marketplaces/hellosverre-mods" ] || claude plugin marketplace add hellosverre/claude-skins
claude plugin marketplace update hellosverre-mods
claude plugin install skins@hellosverre-mods
claude plugin update skins@hellosverre-mods --scope user
claude plugin disable skins@inline --scope user

# The motoedie marketplace files live at the repo root; plugins live in ai-tools/.
DOTFILES_DIR="$(cd "$(dirname "$0")/.." && pwd)"
AI_TOOLS_DIR="$DOTFILES_DIR/ai-tools"
# Local skill plugins, installed to Claude, Codex and Cursor.
SKILL_PLUGINS="motoedie-code-review motoedie-utils"
# mattpocock/skills ships one bundle plugin; motoedie wraps single skills from it.
# grilling is needed by grill-me.
MATTPOCOCK_PLUGINS="writing-for-agents retro grill-me grilling"

# Re-adding is safe and re-points an older ai-tools/ source to the repo root.
claude plugin marketplace add "$DOTFILES_DIR"
claude plugin marketplace update motoedie
npm --prefix "$AI_TOOLS_DIR/mods/mermaid-render/renderer" ci
for plugin in mermaid-render $SKILL_PLUGINS $MATTPOCOCK_PLUGINS; do
  claude plugin install "$plugin@motoedie"
  claude plugin update "$plugin@motoedie" --scope user
done
claude plugin disable mermaid-render@inline --scope user

# Codex does not load bare upstream skill folders; wrap them into plugins.
MATTPOCOCK_DIR="${XDG_CACHE_HOME:-$HOME/.cache}/motoedie/mattpocock"
bash "$AI_TOOLS_DIR/scripts/build_mattpocock_plugins.sh" "$MATTPOCOCK_DIR"

codex plugin marketplace add "$DOTFILES_DIR"
codex plugin marketplace add "$MATTPOCOCK_DIR"
for plugin in $SKILL_PLUGINS; do
  codex plugin add "$plugin@motoedie"
done
for plugin in $MATTPOCOCK_PLUGINS; do
  codex plugin add "$plugin@motoedie-mattpocock"
done

# Cursor indexes marketplaces from Git only, so it reads the pushed repo. It also
# loads the plugins installed in Claude above. Re-adding is safe.
cursor-agent plugin marketplace add https://github.com/motoedie/.dotfiles
