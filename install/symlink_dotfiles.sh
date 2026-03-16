echo "\n\033[0;33mLinking dotfiles\033[0m"

DOTFILES="$(cd "$(dirname "$0")/.." && pwd)"

# editor
ln -sf "$DOTFILES/editor/.editorconfig" ~/.editorconfig
ln -sf "$DOTFILES/editor/.prettierrc.toml" ~/.prettierrc.toml

# git
[ -f ~/.gitconfig ] && rm ~/.gitconfig
ln -sf "$DOTFILES/git/.gitconfig" ~/.gitconfig
rm -f ~/.gitignore
ln -sf "$DOTFILES/git/.gitignore" ~/.gitignore

# p10k
ln -sf "$DOTFILES/p10k/.p10k.zsh" ~/.p10k.zsh

# skhd
ln -sf "$DOTFILES/skhd/.skhdrc" ~/.skhdrc

# yabai
ln -sf "$DOTFILES/yabai/.yabairc" ~/.yabairc

# zsh
[ -f ~/.zshrc ] && rm ~/.zshrc
ln -sf "$DOTFILES/zsh/.zshrc" ~/.zshrc

# lazygit
mkdir -p ~/.config/lazygit
ln -sf "$DOTFILES/lazygit/config.yml" ~/.config/lazygit/config.yml
ln -sf "$DOTFILES/lazygit/tokyonight_moon.yml" ~/.config/lazygit/tokyonight_moon.yml

# tmux
ln -sf "$DOTFILES/tmux/.tmux.conf" ~/.tmux.conf
