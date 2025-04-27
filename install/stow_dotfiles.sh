echo "Stowing dotfiles"
sudo apt install stow build-essential

# Move to the dotfiles root directory
cd "$(dirname "$0")/.."

# Stow files
stow editor
[ -f ~/.gitconfig ] && rm ~/.gitconfig
stow git
stow p10k
stow skhd
stow yabai
[ -f ~/.zshrc ] && rm ~/.zshrc
stow zsh
