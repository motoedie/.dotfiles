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
| `test-gaps impact=medium` | Also report medium-impact gaps |

## What it produces

The report contains:

- **Scope reviewed** — the selected change, files examined, and impact threshold.
- **Test Gaps** — verified critical- and high-impact gaps (plus medium with
  `impact=medium`), each with behavior, the mutant current tests are expected
  to survive, evidence, test level, and a concrete suggested test.
- **Weak Tests** — added or changed tests that imply they protect an important
  behavior but do not, with a rewrite or delete recommendation. Tests that
  protect part of a behavior are kept; their missing scenario becomes a gap.
- **Limitations** — uncertainty, scope that could not be reviewed, or any model
  fallback.

One reviewer examines the complete selected change, and one independent
verifier checks proposed gaps. There is no separate large-review mode.

## When to use it

Use test gaps to find missing behavior-focused coverage before merge. Use a
test-writing or TDD workflow when the request is to implement the tests.

A gap is reported only when the reviewer names a realistic wrong edit (a
mutant) that current tests, including stories and shared-helper tests, are
expected to survive, and suggests an observable test expected to go red on it.
Cosmetic assertions (styling, fixed copy, config shapes, mocked-child props,
export checks) never count; the same assertion forms count when they protect a
named interaction or contract. Refactors that change logic remain eligible;
moves and renames do not.

Behavior evals live in [evals/evals.json](evals/evals.json).

Security-specific test gaps belong to security review; general behavioral
defects belong to code-behavior review.

## More detail

- [Agent instructions](SKILL.md)
- [Scope arguments](references/arguments.md)
- [Test-gap checks](passes/test-gaps.md)
- [Finding criteria](references/finding-criteria.md)
- [Output format](references/report-format.md)
