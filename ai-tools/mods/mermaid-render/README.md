# mermaid-render

Draws ```` ```mermaid ```` blocks in Claude's replies as diagrams.

- Desktop, VS Code, mobile: an SVG image. It uses a light or dark palette to match the app (`prefers-color-scheme`).
- Terminal: ASCII art. A diagram wider than the terminal stays as source.
- A diagram that does not parse stays as source, with the error under it.

Rendering uses [beautiful-mermaid](https://github.com/lukilabs/beautiful-mermaid) in a local Node process (`renderer/render.mjs`). Nothing is sent over the network. It supports flowchart, state, sequence, class and ER diagrams.

## Install

Needs `node` on `PATH`.

```bash
npm --prefix ~/.dotfiles/ai-tools/mods/mermaid-render/renderer ci
claude plugin marketplace add ~/.dotfiles
claude plugin install mermaid-render@motoedie
```

The marketplace is a local folder, so Claude reads the mod from here. After an edit, run `/reload-plugins`.

## Develop

```bash
claude plugin validate ~/.dotfiles/ai-tools/mods/mermaid-render
claude plugin test ~/.dotfiles/ai-tools/mods/mermaid-render
```

```bash
node --test ~/.dotfiles/ai-tools/mods/mermaid-render/renderer/render.test.mjs
```
