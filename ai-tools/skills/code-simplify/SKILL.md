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
3. **Structural analysis (do this before any edits):**
   - For each file in scope, identify the distinct responsibilities it contains (e.g., validation, data mapping, API calls, UI rendering, state management, type definitions, constants).
   - Flag files that mix 3+ unrelated concerns, or where understanding one responsibility requires skipping past code for a completely different one. These are candidates for extraction.
   - If extractions are needed, propose the split (file names + what moves where) before making changes.
4. **Extract mixed concerns into focused modules:**
   - Move cohesive groups of pure functions, validation logic, data transformers, or constants into their own files.
   - Each extracted file should have a single clear purpose identifiable from its name.
   - Keep the original file focused on its primary role (usually the React component, the main export, or the orchestration logic).
   - Update all imports in the original file, its tests, and any other consumers.
5. **Micro-level simplification** within each file (original and extracted):
   - Simplify nesting, duplication, and unnecessary abstractions without changing behavior.
   - Do not collapse unrelated concerns into one function or component.
6. Re-read the edited code and confirm it is easier to follow, debug, and extend.
7. Summarize only meaningful changes.

## Structural heuristics (when to extract)

- A file has functions/blocks that can be understood without reading the rest of the file → extract them.
- Validation schemas, resolvers, or error-mapping logic sitting next to UI components → separate file.
- Data transformation functions (mapping API responses to form values and back) next to rendering → separate file.
- A component file contains large helper functions that don't use React hooks or JSX → extract to a plain `.ts` module.
- Multiple top-level components in one file that aren't trivially small → split into separate files.
- Constants or config objects shared across concerns → extract to a dedicated file or move to the types/constants file.

## Micro-level heuristics

- Inline trivial wrappers that add no clarity.
- Extract repeated logic only when the result is clearer than the duplication.
- Replace vague names only when the rename stays local and does not widen churn.
- Prefer explicit conditionals over compressed expressions when readability improves.
- Preserve abstractions that encode domain meaning or isolate side effects.
