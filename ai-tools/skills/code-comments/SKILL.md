---
name: code-comments
description: Add, review, or rewrite code comments so they explain intent, invariants, branch rationale, and multi-step flows without narrating obvious syntax. Use when documenting newly added or recently changed code, converting line-by-line comments into concise block comments, checking whether comment density is too sparse or too heavy, or making non-obvious branches, scripts, and side effects easier for reviewers to scan.
---

# Code Comments

Comment `$ARGUMENTS`.

If `$ARGUMENTS` is empty, focus on the code most recently modified in the current session or diff.

## Style

- Prefer comments that explain intent over comments that restate syntax.
- Place one short comment before a compact non-obvious block, such as an `if` branch, early return, or transformation step.
- Split longer functions into phases and comment each phase instead of commenting every line.
- Explain why a block exists, what invariant it preserves, what side effect it triggers, or why a branch is special.
- Comment embedded shell, SQL, or multi-step string scripts by phase when the sequence is important.
- Match the surrounding codebase's tone and comment density unless the user asks to change it.

## Avoid

- Do not narrate obvious assignments, conditionals, or loops.
- Do not duplicate what a good function or variable name already says.
- Do not add filler comments just to increase coverage.
- Do not leave stale comments after changing code.
- Do not use comments to excuse confusing code when a small simplification would make it clearer.

## Process

1. Read the surrounding function and identify the parts that are not obvious from the code alone.
2. Remove or rewrite comments that merely describe mechanics.
3. Add comments at block boundaries, branch boundaries, and phase boundaries.
4. Use finer-grained comments inside a function only when a block contains multiple distinct steps.
5. Re-read the result and make sure the comments help a reviewer scan the code faster.

## Heuristics

- Good comment: explain why filtered exports must keep the original snapshot id in the final package.
- Weak comment: explain that `p1` is set to `-1` when `systemLogs` is true.
- Good comment: describe that a temp directory isolates an unpacked export before repackaging.
- Weak comment: describe that `fs.ensureDir()` creates a directory.

## Decision Rule

If a section seems to need a comment for every line, step back and either:

- replace line-by-line comments with one block comment, or
- simplify the code before adding comments.
