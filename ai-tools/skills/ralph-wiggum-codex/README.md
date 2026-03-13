# Ralph Wiggum for Codex CLI and Codex App

This is a Codex-compatible transformation of the Claude `ralph-wiggum` plugin.

## What changed

Claude plugin behavior depends on a Claude Stop hook API. Codex does not expose that hook API, so this adapter runs the Ralph loop externally by repeatedly calling `codex exec` with the same prompt.

## Files

- `scripts/setup-ralph-loop.sh`: create Ralph state file
- `scripts/run-ralph-loop.sh`: execute iterative loop with Codex
- `scripts/ralph-loop.sh`: convenience wrapper (setup + run)
- `scripts/cancel-ralph-loop.sh`: cancel active loop
- `SKILL.md`: Codex skill definition for app/agent usage

## State and logs

- State file: `.ralph-wiggum/ralph-loop.local.md`
- Iteration outputs: `.ralph-wiggum/ralph-loop/iteration-<n>.txt`

## Codex CLI usage

Start and run loop in one command:

```bash
scripts/ralph-loop.sh \
  "Implement todo CRUD API with tests. Output <promise>DONE</promise> when complete." \
  --max-iterations 20 \
  --completion-promise "DONE"
```

Start from a prompt file:

```bash
scripts/ralph-loop.sh \
  --prompt-file MyInstructions.md \
  --max-iterations 20 \
  --completion-promise "DONE"
```

Run additional iterations from existing state:

```bash
scripts/run-ralph-loop.sh
```

Run one iteration only:

```bash
scripts/run-ralph-loop.sh --once
```

Cancel active loop:

```bash
scripts/cancel-ralph-loop.sh
```

## Codex App usage

In Codex App, invoke the skill and ask to run a loop, for example:

```text
Use $ralph-wiggum-codex. Start a Ralph loop for prompt "Fix flaky auth tests" with max 8 iterations and completion promise DONE.
```

Or use a prompt file:

```text
Use $ralph-wiggum-codex. Start a Ralph loop from prompt file MyInstructions.md with max 8 iterations and completion promise DONE.
```

## Notes

- The completion promise match is exact: `<promise>TEXT</promise>`.
- Without `--max-iterations`, loops are unbounded unless cancelled.
- Ralph defaults the inner run to `codex exec --full-auto`.
- If `codex exec` fails, loop state is kept so you can resume after fixing the issue.
- `--prompt-file <path>` reads the full prompt from disk and rejects mixing file input with inline prompt text.
