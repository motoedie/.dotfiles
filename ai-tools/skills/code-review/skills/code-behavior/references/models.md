# Review models

| Harness | Reviewer and synthesis | Dedicated verifier |
| --- | --- | --- |
| Cursor | `composer-2.5` (not `composer-2.5-fast`) | `claude-opus-5-5-medium` |
| Claude Code | `sonnet`, effort medium | `opus`, effort medium |
| Codex (ChatGPT) | `gpt-6.1-sol`, effort medium | `gpt-6.1-sol`, effort high |
| GitHub Copilot CLI or Copilot in VS Code | `gpt-6.1-sol`, effort medium | `gpt-6.1-sol`, effort high |

For every subagent, pass the active harness's cell for its role verbatim as the
`model` argument when available; an effort or note after the slug is not part
of it. Each cell is the preferred exact slug, except that Claude Code's `model`
argument takes only family aliases. Apply the stated effort where the host has a
per-subagent effort control; in Claude Code that is the subagent `effort`
argument. If a listed slug is unavailable, use an available variant of the same
model family and version and state the fallback in the Markdown report; never
substitute another available listed slug.
