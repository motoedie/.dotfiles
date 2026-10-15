# Test gaps

Report-only review of selected code changes, including additions, fixes, and
refactors, for missing behavior-focused tests. It does not write tests or modify
the reviewed change.

## Quick start

| Command | Scope |
| --- | --- |
| `test-gaps` | Branch changes against the detected baseline, including staged, unstaged, and non-ignored untracked changes |
| `test-gaps uncommitted` | Staged, unstaged, and non-ignored untracked changes |
| `test-gaps staged` | Staged changes only |
| `test-gaps base release/8.2` | Checked-out branch compared with another base |
| `test-gaps services/api/` | Selected changes limited to a path |
| `test-gaps <revision range>` | Exact committed changes in that range |

## What it produces

The report contains:

- **Scope reviewed** — the selected change and files examined.
- **Test Gaps** — verified critical-, high-, and medium-impact gaps with
  behavior, evidence, test level, and a concrete suggested test.
- **Limitations** — uncertainty, scope that could not be reviewed, or any model
  fallback.

One reviewer examines the complete selected change, and one independent
verifier checks proposed gaps. There is no separate large-review mode.

## When to use it

Use test gaps to find missing behavior-focused coverage before merge. Use a
test-writing or TDD workflow when the request is to implement the tests.

Low-impact gaps and suggestions that only test implementation details are
filtered by default. Missing coverage around refactored behavior remains
eligible when an unnoticed behavioral mistake could have meaningful impact.

Security-specific test gaps belong to security review; general behavioral
defects belong to code-behavior review.

## More detail

- [Agent instructions](SKILL.md)
- [Scope arguments](references/arguments.md)
- [Test-gap criteria](passes/test-gaps.md)
- [Output format](references/output-format.md)
