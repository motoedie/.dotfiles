echo "\n\033[0;33mInstalling scm_breeze\033[0m"
git clone https://github.com/scmbreeze/scm_breeze.git ~/.scm_breeze
# ZDOTDIR points to a missing dir so install.sh does not append a second source line to our .zshrc
ZDOTDIR=/nonexistent ~/.scm_breeze/install.sh
# Turn off SCM Breeze wrappers for cd/ls/cat/...: they call _safe_eval, which Claude Code's shell snapshot drops
sed -i.bak 's/^shell_command_wrapping_enabled="true"/shell_command_wrapping_enabled="false"/' ~/.git.scmbrc && rm ~/.git.scmbrc.bak
