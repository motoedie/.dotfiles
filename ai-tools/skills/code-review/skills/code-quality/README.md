# Code quality

Report-only review of changed production code. It reports important
maintainability problems and concrete fixes; it does not edit code or review
tests.

## Quick start

| Command | Review |
| --- | --- |
| `code-quality` | Checked-out branch against `main`, including staged, unstaged, and non-ignored untracked changes |
| `code-quality Richard Ejem` | Same scope with extended, stricter review |

If `main` is unavailable, the default remote branch is used. `Richard Ejem` is
case-insensitive and may appear anywhere in the arguments.

## Choose the scope

| Argument | Scope |
| --- | --- |
| `uncommitted` | Staged, unstaged, and non-ignored untracked changes only |
| `<path>` | One file or directory |
| `<revision range>` | An explicit Git revision range |
| `base <ref>` | Checked-out branch compared with another base branch |

Add `Instructions: <text>` to review the changes against your instructions.

## Focus

Use `focus on <topic>` or `only <topic>` to run only matching checks. Use
`skip <topic>` to omit matching checks.

Example: `code-quality focus on duplication`

Standard mode checks minimal change, single responsibility, duplication, and
module boundaries. Richard Ejem mode adds clarity and contracts, type modeling,
and reuse and evolution.

Standard mode reports high-, medium-, and low-impact findings and drops
nitpicks. Richard Ejem mode also reports nitpicks. Every finding requires
concrete evidence. Independent verification checks high-, medium-, and low-impact findings
and their proposed fixes; Richard Ejem's original nitpicks remain
reviewer-assessed.

## Complex examples

| Goal | Command |
| --- | --- |
| Extended review of a stacked branch | `code-quality base feature/parent-branch Richard Ejem` |
| Extended review of one directory on a stacked branch | `code-quality base feature/parent-branch services/api Richard Ejem` |
| Extended review of a revision range | `code-quality release/8.1...HEAD Richard Ejem` |
| Extended review of uncommitted frontend changes | `code-quality uncommitted packages/frontend Richard Ejem` |
| Review a stacked branch against supplied instructions | `code-quality base feature/parent-branch Instructions: <paste instructions>` |
