echo "\n\033[0;33mInstalling neovim\033[0m"
asdf plugin add neovim
asdf install neovim stable
asdf global neovim stable
cd /usr/local/bin
sudo ln -sf ~/.local/share/nvim-linux64/bin/nvim nvim
