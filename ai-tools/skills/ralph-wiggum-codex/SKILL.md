---
name: ralph-wiggum-codex
description: Iterative Ralph loop runner for Codex CLI using a persistent state file and repeated codex exec calls.
---

# Ralph Wiggum for Codex

Use this skill when the user asks for long-running iterative work with explicit stop conditions, similar to Claude's Ralph plugin.

## Commands

- Start and run loop:
  - `scripts/ralph-loop.sh "<prompt>" --max-iterations <n> --completion-promise "<text>"`
- Start and run loop from a prompt file:
  - `scripts/ralph-loop.sh --prompt-file MyInstructions.md --max-iterations <n> --completion-promise "<text>"`
- Run from existing state:
  - `scripts/run-ralph-loop.sh`
- Run one iteration only:
  - `scripts/run-ralph-loop.sh --once`
- Cancel loop:
  - `scripts/cancel-ralph-loop.sh`

## Behavior

- State file: `.ralph-wiggum/ralph-loop.local.md`
- Iteration outputs: `.ralph-wiggum/ralph-loop/iteration-<n>.txt`
- Completion is detected only on exact `<promise>...</promise>` string match.
- If no completion promise is provided, the loop stops only on `--max-iterations` (or manual cancel).
- Ralph defaults the inner `codex exec` call to sandboxed automatic execution via `--full-auto`.

## Operational Rules

- When the user asks to start, run, resume, or cancel a Ralph loop, execute the matching script under `scripts/` instead of summarizing prior conversation context.
- Do not claim a Ralph run succeeded unless you have verified the current run by checking the active state file and/or the latest iteration output file.
- Keep the user's prompt unchanged between iterations.
- When the user provides a prompt file, prefer `--prompt-file` over inlining file contents by hand.
- Keep the Ralph loop inside the current sandbox.
- Do not request escalated permissions or rerun the Ralph command outside the sandbox.
- Use a completion promise only when the statement is true.
- Prefer bounded runs with `--max-iterations` to avoid infinite loops.
- If `codex exec` fails, preserve state and report the exact failure without retrying in a different execution mode.
- Do not modify shared monorepo configuration while running loop tasks.
