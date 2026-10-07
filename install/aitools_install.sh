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
