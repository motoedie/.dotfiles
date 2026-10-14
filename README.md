# Dotfiles

After bootstrapping, run the read-only tool check from your usual shell:

```sh
./install/doctor.sh
```

The doctor supports macOS, Debian, and distributions that identify Debian in
`ID_LIKE`. It checks commands available on your current `PATH`: Git, Zsh, asdf,
Neovim, lazygit, ripgrep, fzf, bat, fd, eza, and delta. Debian's `batcat` and
`fdfind` names are accepted. Command availability does not verify tool versions
or whether an asdf shim has a configured installation.

Exit status is `0` when every tool is available, `1` when tools are missing, and
`2` when the platform is unsupported or cannot be determined. The doctor does
not install packages or change your dotfiles.
