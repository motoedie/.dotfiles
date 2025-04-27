# install zsh
sudo apt install zsh
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

# powerlevel10k
git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ~/powerlevel10k

# install packages
asdf plugin add lazygit
asdf install lazygit latest
asdf global lazygit latest
asdf plugin add ripgrep
asdf install ripgrep latest
asdf global ripgrep latest
asdf global lazygit latest
asdf plugin add fzf https://github.com/kompiro/asdf-fzf.git
asdf install fzf latest
asdf global fzf latest
asdf plugin add bat
asdf install bat latest
asdf global bat latest
asdf plugin add fd
asdf install fd latest
asdf global fd latest
asdf plugin add eza
asdf install eza latest
asdf global eza latest
asdf plugin add delta
asdf install delta latest
asdf global delta latest
asdf plugin add bat-extras
asdf install bat-extras latest
asdf global bat-extras latest

#install scm-breeze
git clone https://github.com/scmbreeze/scm_breeze.git ~/.scm_breeze
~/.scm_breeze/install.sh

# stow dotfiles
sudo apt install stow build-essential
stow editor
[ -f ~/.gitconfig ] && rm ~/.gitconfig
stow git
stow p10k
stow skhd
stow yabai
[ -f ~/.zshrc ] && rm ~/.zshrc
stow zsh

source "${ZDOTDIR:-$HOME}/.zshrc"

# install Neovim
asdf plugin add neovim
asdf install neovim stable
asdf global neovim stable
cd /usr/local/bin
sudo ln -sf ~/.local/share/nvim-linux64/bin/nvim nvim

# install astronvim
rm -rf ~/.config/nvim
git clone https://github.com/motoedie/astronvimv5 ~/.config/nvim

# Install NVM (Node Version Manager)
echo "Installing NVM..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash

# Ensure NVM is available in the current shell session
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# Install Node versions
nvm install 18.17.1
nvm install 20

# Set Node 18.17.1 as default
nvm alias default 18.17.1

# Verify installation
echo "Node versions installed:"
nvm ls

# Source .zshrc to apply NVM configurations
source "$HOME/.zshrc"
