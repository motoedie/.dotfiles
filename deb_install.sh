#!/bin/sh

if [ -z "$ZSH_VERSION" ]; then
  # install zsh first, then re-exec this script under zsh
  sh ./install/zsh_install.sh
  exec zsh "$0" "$@"
fi

# powerlevel10k
sh ./install/p10k_install.sh

# install Homebrew (package manager for CLI tools)
sh ./install/brew_install.sh
eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"

# install packages
sh ./install/package_install.sh

# install Copilot CLI, Claude CLI, and other AI tools
sh ./install/aitools_install.sh

# symlink AI tool configs (commands, skills) into ~/.claude and ~/.cursor
sh ./install/ai_config_install.sh

#install scm-breeze
sh ./install/scm_breeze_install.sh

# install git-lfs
sh ./install/git-lfs-install.sh

# symlink dotfiles
sh ./install/symlink_dotfiles.sh

. "${ZDOTDIR:-$HOME}/.zshrc"

# install astronvim
sh ./install/astronvim_install.sh

# install nvm
# sh ./install/nvm_install.sh

# Source .zshrc to apply NVM configurations
. "$HOME/.zshrc"
