# Install NVM (Node Version Manager)
echo "Installing NVM package..."
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
