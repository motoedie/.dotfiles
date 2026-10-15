# Code behavior

Report-only review of changed code. It finds functional defects, contract
breakage, and performance and resource risks; it does not edit or approve the
code.

## Quick start

| Command | Scope |
| --- | --- |
| `code-behavior` | Checked-out branch against its detected baseline, including staged, unstaged, and non-ignored untracked changes |
| `code-behavior uncommitted` | Staged, unstaged, and non-ignored untracked changes |
| `code-behavior staged` | Staged changes only |
| `code-behavior base release/8.2` | Checked-out branch compared with another base branch |
| `code-behavior services/api/` | Changes limited to one file or directory |
| `code-behavior <revision range>` | Exact committed changes in that range |

The default baseline is the merge base against `main` or `master`, falling back
to the default remote branch.

## Choose the review focus

Use `focus on <topic>` or `only <topic>` to run only matching review passes. Use
`skip <topic>` to omit matching passes.

Available topics are correctness, data flow and API contracts, and performance
and resources.

Example: `code-behavior uncommitted focus on correctness and data contracts`

Scope and focus arguments can be combined. For example:
`code-behavior base feature/parent-branch services/api only data contracts`.

## What it produces

The skill reports critical-, high-, medium-, and low-impact findings after
independent verification; findings the verifier cannot decide, except
low-impact ones, stay in a report marked incomplete.

Every reported issue must be backed by concrete evidence. Nitpicks (taste, typos, or
style) are omitted. Verification removes unsupported findings and corrects
inaccurate suggested actions.

## When to use it

Use code behavior when changed code needs defect and regression review before
merge.

It does not report test gaps, structural maintainability, linter, type-checker,
or security concerns.

## More detail

- [Agent instructions](SKILL.md)
- [Scope and focus arguments](references/arguments.md)
- [Finding format](references/report-format.md)
