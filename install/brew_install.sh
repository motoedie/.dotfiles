if command -v brew > /dev/null 2>&1 || [ -x /home/linuxbrew/.linuxbrew/bin/brew ]; then
  echo "\n\033[0;33mHomebrew already installed, skipping\033[0m"
else
  echo "\n\033[0;33mInstalling Homebrew\033[0m"
  # Homebrew on Linux requirements: https://docs.brew.sh/Homebrew-on-Linux#requirements
  sudo apt install build-essential procps curl file git
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi
