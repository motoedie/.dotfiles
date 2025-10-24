#!/bin/zsh

# install zsh
sh ./install/zsh_install.sh

# powerlevel10k
sh ./install/p10k_install.sh

# install packages
sh ./install/package_install.sh

# install copilot CLI
sh ./install/copilot_install.sh

#install scm-breeze
sh ./install/scm_breeze_install.sh

# stow dotfiles
sh ./install/stow_dotfiles.sh

source "${ZDOTDIR:-$HOME}/.zshrc"

# install Neovim
sh ./install/neovim_plugin_install.sh

# install astronvim
sh ./install/astronvim_install.sh

# install nvm
# sh ./install/nvm_install.sh

# Source .zshrc to apply NVM configurations
source "$HOME/.zshrc"
