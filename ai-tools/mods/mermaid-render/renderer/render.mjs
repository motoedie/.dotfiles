// Renders mermaid sources for the hooks module, which has no DOM and no Node.
// stdin: { "mode": "svg" | "ascii", "sources": string[] }
// stdout: one { "ok": true, "output" } or { "ok": false, "error" } per source, same order.
import { renderMermaidASCII, renderMermaidSVG } from 'beautiful-mermaid';

let input = '';
for await (const chunk of process.stdin) input += chunk;
const { mode, sources } = JSON.parse(input);

// The mod cannot read the desktop theme, so the SVG picks its palette from the scheme of the page that draws it.
const PALETTE_STYLE = `<style>
  svg { --mr-bg: #FFFFFF; --mr-fg: #27272A; }
  @media (prefers-color-scheme: dark) { svg { --mr-bg: #1F1F1E; --mr-fg: #E4E4E7; } }
</style>`;

const renderSvg = (source) =>
  renderMermaidSVG(source, { bg: 'var(--mr-bg)', fg: 'var(--mr-fg)', padding: 16 })
    // The surface draws the SVG as an isolated image, so the web-font import can never load.
    .replace(/^\s*@import url\([^)]*\);\n/m, '')
    .replace(/^<svg[^>]*>/, (rootTag) => `${rootTag}\n${PALETTE_STYLE}`);

// One failing diagram must not hide the others, so each is caught on its own.
const results = sources.map((source) => {
  try {
    const output = mode === 'svg' ? renderSvg(source) : renderMermaidASCII(source, { colorMode: 'none' });
    return { ok: true, output };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
});
process.stdout.write(JSON.stringify(results));
