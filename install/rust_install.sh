if ! command -v cargo > /dev/null 2>&1; then
  echo "\n\033[0;33mInstalling Rust\033[0m"
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
  . "$HOME/.cargo/env"
else
  echo "\n\033[0;33mRust already installed, skipping\033[0m"
fi
