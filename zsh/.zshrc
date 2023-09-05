# Enable Powerlevel10k instant prompt. Should stay close to the top of ~/.zshrc.
# Initialization code that may require console input (password prompts, [y/n]
# confirmations, etc.) must go above this block; everything else may go below.
if [[ -r "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh" ]]; then
  source "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh"
fi

# Path to your oh-my-zsh installation.
export ZSH="$HOME/.oh-my-zsh"

plugins=(git)

source $ZSH/oh-my-zsh.sh

alias cat='bat'
alias fd='fd --hidden'
alias lg='lazygit'
alias ls='exa --icons --color=always -1 -a'
alias lst='exa --icons --color=always -1 -a -T -L=2'
alias nv="nvim"
alias nxef="yarn nx eslint frontend"
alias nxlf="yarn nx lint frontend"
alias nxr="yarn nx reset"
alias nxrml="yarn nx run-many --target=lint --all"
alias nxrmte="yarn nx run-many --target=test --all"
alias nxrmty="yarn nx run-many --target=type --all"
alias nxsf="yarn nx serve frontend"
alias nxtef="yarn nx test frontend"
alias nxtyf="yarn nx type frontend"
alias rg="rg --hidden"
alias yi="yarn install"
alias sstatus='sudo systemctl status'
alias srestart='sudo systemctl restart'
alias sstart='sudo systemctl start'
alias sstop='sudo systemctl stop'

# System (Debian/Ubuntu specific)
alias pkgi='sudo apt-get install'
alias pkgs='apt-cache search'
alias pkgr='sudo apt-get remove'

alias g_history='() {git log --oneline | fzf --height="80%" --preview="git show {1} -- $1 | delta"}'
alias g_file_history='() {git log --oneline $1 | fzf --height="80%" --preview="git show --follow {1} -- $1 | delta"}'

# DIRCOLORS (MacOS)
export CLICOLOR=1

# FZF
export FZF_DEFAULT_COMMAND="rg --files --hidden --glob '!.git'"
export FZF_DEFAULT_OPTS="--height=40% --layout=reverse --border --margin=1 --padding=1"
# Add fzf commands to cli
[ -f ~/.fzf.zsh ] && source ~/.fzf.zsh

source ~/powerlevel10k/powerlevel10k.zsh-theme

# To customize prompt, run `p10k configure` or edit ~/.p10k.zsh.
[[ ! -f ~/.p10k.zsh ]] || source ~/.p10k.zsh

# nix
if [ -e ~/.nix-profile/etc/profile.d/nix.sh ]; then . ~/.nix-profile/etc/profile.d/nix.sh; fi

[ -s "$HOME/.scm_breeze/scm_breeze.sh" ] && source "$HOME/.scm_breeze/scm_breeze.sh"

. "$HOME/.asdf/asdf.sh"
