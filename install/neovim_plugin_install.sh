echo "Installing neovim"
asdf plugin add neovim
asdf install neovim stable
asdf global neovim stable
cd /usr/local/bin
sudo ln -sf ~/.local/share/nvim-linux64/bin/nvim nvim
