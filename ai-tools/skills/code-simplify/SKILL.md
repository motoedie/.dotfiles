---
name: code-simplify
description: Simplify and refine existing code for clarity, consistency, and maintainability while preserving exact functionality. Use after writing or modifying code, when asked to simplify or clean up code without changing behavior, or when recently touched code should be made easier to read and more consistent with project standards.
---

# Code Simplify

Simplify `$ARGUMENTS`.

If `$ARGUMENTS` is empty, focus on code recently modified in the current session or current diff. Do not widen scope unless the user asks.

## Guardrails

- Preserve exact functionality. Do not change behavior, outputs, side effects, or supported inputs.
- Keep refactors local to the requested scope. Avoid broad rewrites, file moves, or API renames unless required for clarity.
- Prefer clearer code over fewer lines. Avoid clever one-liners, dense chaining, and nested ternaries when explicit code reads better.
- Remove only comments that restate obvious code. Keep comments that explain intent, invariants, or non-obvious constraints.
- Follow project conventions from `CLAUDE.md` and nearby code.

## Project Standards

- Add explicit return type annotations to top-level functions when the codebase expects them.
- Use explicit `Props` types for React components when applicable.
- Prefer existing error-handling patterns and avoid introducing unnecessary `try/catch`.
- Preserve naming consistency with the surrounding module.

## Process

1. Identify the requested scope. Default to recently changed code.
2. Read surrounding code to understand invariants and local conventions before editing.
3. Simplify nesting, duplication, and unnecessary abstractions without changing behavior.
4. Keep responsibilities separated. Do not collapse unrelated concerns into one function or component.
5. Re-read the edited code and confirm it is easier to follow, debug, and extend.
6. Summarize only meaningful changes.

## Heuristics

- Inline trivial wrappers that add no clarity.
- Extract repeated logic only when the result is clearer than the duplication.
- Replace vague names only when the rename stays local and does not widen churn.
- Prefer explicit conditionals over compressed expressions when readability improves.
- Preserve abstractions that encode domain meaning or isolate side effects.
