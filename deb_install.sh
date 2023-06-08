# install nix
sh <(curl -L https://nixos.org/nix/install) --no-daemon

# source nix
. ~/.nix-profile/etc/profile.d/nix.sh

# powerlevel10k
git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ~/powerlevel10k

# install packages
nix-env -iA nixpkgs.nerdfonts
nix-env -iA nixpkgs.lazygit
nix-env -iA nixpkgs.stow
nix-env -iA nixpkgs.ripgrep
nix-env -iA nixpkgs.fzf
nix-env -iA nixpkgs.bat
nix-env -iA nixpkgs.fd
nix-env -iA nixpkgs.exa
nix-env -iA nixpkgs.delta
nix-env -iA nixpkgs.go

#install scm-breeze
git clone https://github.com/scmbreeze/scm_breeze.git ~/.scm_breeze
~/.scm_breeze/install.sh

# stow dotfiles
stow git
stow p10k
stow skhd
stow tmux
stow yabai
stow zsh

source "${ZDOTDIR:-$HOME}/.zshrc"

# install Neovim
wget https://github.com/neovim/neovim/releases/download/stable/nvim-linux64.tar.gz
tar xzvf nvim-linux64.tar.gz
mv nvim-linux64 ~/.local/share/nvim-linux64
cd /usr/local/bin
sudo ln -sf ~/.local/share/nvim-linux64/bin/nvim nvim

# install astronvim
rm -rf ~/.config/nvim
git clone --depth 1 https://github.com/AstroNvim/AstroNvim ~/.config/nvim
git clone https://github.com/motoedie/astronvim-user ~/.config/astronvim
