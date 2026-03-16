echo "\n\033[0;33mStowing dotfiles\033[0m"
sudo apt install stow build-essential

# Move to the dotfiles root directory
cd "$(dirname "$0")/.."

# Stow files
stow editor
[ -f ~/.gitconfig ] && rm ~/.gitconfig
stow git
# stow ignores .gitignore by design; symlink it explicitly
rm -f ~/.gitignore
ln -s .dotfiles/git/.gitignore ~/.gitignore
stow p10k
stow skhd
stow yabai
[ -f ~/.zshrc ] && rm ~/.zshrc
stow zsh
mkdir -p ~/.config/lazygit
ln -sf ~/.dotfiles/lazygit/config.yml ~/.config/lazygit/config.yml
ln -sf ~/.dotfiles/lazygit/tokyonight_moon.yml ~/.config/lazygit/tokyonight_moon.yml
ln -sf ~/.dotfiles/tmux/.tmux.conf ~/.tmux.conf
