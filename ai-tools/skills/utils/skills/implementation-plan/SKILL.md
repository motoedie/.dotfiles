---
name: implementation-plan
description: Structure an implementation plan for a coding AI agent to execute autonomously. Use when preparing a multi-phase coding task that another agent (or future session) will carry out without human intervention. Produces a self-contained plan document with all context an agent needs.
---

# Implementation Plan

`$ARGUMENTS` is freeform. Extract a plan path if present (otherwise create a new plan file). Treat any mention of grill / grilling / grill-me as the trigger for Step 1 below — examples that trigger: `with grill feature`, `grill me first`, `use grill-me`. Examples that don't: empty args, `plans/foo.md`.

## Purpose

A plan is a self-contained document another coding agent will execute without asking for clarification. This skill defines the **shape** — project-agnostic. Every `<placeholder>` must be replaced with concrete project detail.

## Planning process

### Step 1 — Grill the user (opt-in)

If `$ARGUMENTS` mentions grill / grilling / grill-me (interpret freely), load the `grilling` skill (the `grilling@motoedie` plugin) and follow it before drafting any section below. Cover scope, success criteria, edge cases, owner of unresolved decisions, and acceptable trade-offs. Unresolved items get hoisted into §16. **Default (no grill mention): skip this step.**

### Step 2 — Angry-dev self-review (mandatory before handing off)

After drafting the plan and before calling ExitPlanMode, re-read the entire plan as a hostile executing agent at 2am. Whatever they'd bitch about — fix it. Patch findings into the relevant section; do NOT append a separate review list. Checklist:

- Every file path mentioned exists or is clearly marked NEW.
- Every shell command is copy-pasteable, with project-required wrappers (e.g. `NO_COLOR=1`).
- Every gate has a concrete pass/fail check ("output MUST show…"), not vibes.
- Every undefined acronym, internal name, or domain term is defined inline or pointed to a file/line.
- Every "see section X" reference resolves; no broken anchors.
- Every TODO / "TBD" / hedge ("probably", "maybe", "should") is resolved or hoisted into `Unresolved questions` if that section exists.
- Every decision an executor might second-guess (sub-phase split, file location, naming) carries a one-line *why*.
- Every external dependency / API surface mentioned has a verification pre-flight check in §12.
- Failure modes named in §9 have a corresponding test or accepted-risk note.
- Every non-obvious helper, component integration, request/response shape, state object, or JSX layout that a coding agent could implement multiple ways has a compact code snippet. If prose alone leaves room for "creative" implementation, add the damn snippet.

## Plan frontmatter (required, complete, top of file)

Every plan file starts with a YAML frontmatter block that fully describes the plan and its todo list. This frontmatter is the **first content in the file**, before every heading or prose paragraph. Both the description block and the todos block are required and must be specified completely — never leave `overview:` as a placeholder, never ship with an empty or partial `todos:` array.

TODOs belong in this top YAML frontmatter, not in a `## TODOs` section, not at the end of the file, and not duplicated in the body. Executing agents update `todos[].status` in this frontmatter as they complete phases, so burying TODOs elsewhere makes progress tracking brittle as hell.

When using Cursor's `CreatePlan` tool, provide this metadata through the tool fields and do **not** repeat the YAML block inside the `plan` body. Duplicated frontmatter is noise and makes the plan look like a cursed sandwich.

When writing or editing a plan markdown file directly instead of using `CreatePlan`, manually put the complete YAML frontmatter at the very top of the file and update todo statuses there in-place.

```yaml
---
name: <short slug name>
overview: <1–2 sentences stating what the plan accomplishes — this is the plan's description>
todos:
  - id: <phaseNa-slug>
    content: "<Phase Na: imperative action + full paths + the concrete check that verifies it>"
    status: pending
  # … one todo per independently verifiable sub-phase, all status: pending
isProject: false
---
```

Rules:

- `name` — kebab-case slug; matches the plan file name.
- `overview` — one to two complete sentences. This is the plan's description; it must be meaningful on its own so someone reading the file list can see what the plan does.
- `todos` — **one todo per independently verifiable sub-phase** (see "Sub-phase granularity" under "Phases"). Every todo starts with `status: pending`. Todo `id` is `phase<N><letter>-<slug>` (e.g. `phase3a-export-tests`). Content starts with `Phase <N><letter>: <imperative action>`, names full workspace-relative paths for every file reference, and names the concrete check that proves the todo is done (test command, build, codegen diff, type / lint pass, audit grep, manual assertion).

## Required sections (in order)

Each section is a top-level `##` heading in the plan body. Several sections need `###` subsections — called out below.

1. **Preamble** — one paragraph. Name every skill the agent must follow (TDD, simplification, review, …) by its full skill file path link (for example, `~/.codex/skills/code-quality/SKILL.md` or `/home/<user>/.claude/skills/code-quality/SKILL.md`), state when each applies. Cover stop-on-failure, guidance policy, commit policy, continuous-execution, todo-update expectation. Do **not** write methodology in the abstract ("TDD applies" without naming the TDD skill). Auto-fix and reporting policy for the final review skills lives in Shape V (§14) — do not restate it here.
2. **Agent files** — AGENTS.md-equivalents, highest priority first, full paths. List the actual files the executor must read; do not add negative statements like "no deeper AGENTS.md found" unless the absence itself changes execution.
3. **Mandatory docs** — project rules / verification docs, full paths.
4. **Skills** — list the skill files the agent must read and follow during execution. Reference each by its **full skill file path in the current environment**, pointing at the concrete `SKILL.md` file (for example, `~/.codex/skills/code-quality/SKILL.md` or `/home/<user>/.claude/skills/code-quality/SKILL.md`) — skill names, locations, and even availability vary across projects and organizations, so never hardcode a path without confirming it exists. One line per skill naming when it applies. When applicable include: the project's TDD skill (for any code-producing phase), code-quality as the first final review skill (runs once as `<final>d`), code-behavior (runs once as `<final>e`), security-analysis (runs once as `<final>f`), change-analysis or equivalent project-analysis skill (runs once as `<final>g`), plus code-comments when the work touches its domain. See Shape V (§14) for the verbatim invocation strings and each skill's auto-fix / report policy — do not restate them here.
5. **Hard rules** — bullet list of non-negotiable constraints for this task. Categories to consider (include only what the project actually requires): dependency policy, import conventions, file-location restrictions, shared-config protection, backward-compatibility guarantees, source-code reuse vs. duplication, alphabetical or stylistic ordering conventions, generated-file hand-edit prohibition, forbidden APIs. Keep rules task-specific — do not restate the project's global AGENTS.md rules here.
6. **Test / lint / type-check commands** — exact shell commands as code blocks, pulled from the **current project** (not invented). Include variants for single file, package / directory, full relevant suite, type check per affected package, lint / format. Follow any output-capping conventions from the project's AGENTS.md (e.g. `NO_COLOR=1`, ripgrep / sed wrappers, coverage flags) — a command without the project's required wrapper wastes tokens when the agent runs it.
7. **Background and problem** — what exists, what's wrong, why change. Reference files by full path + line numbers.
8. **Existing code to reuse** — symbols to import instead of reinventing: full path, line, one-line purpose.
9. **Solution design** — use `###` subsections:
   - `### Overall sequence` — pseudocode / mermaid / numbered steps.
   - `### <Component or helper name>` — one per new / changed component, with signatures, responsibilities, and data-structure literals.
   - `### <Integration point>` — one per site where the design is wired into existing code.
   - `### Post-<thing> freshness` / `### Error handling` / … — one per cross-cutting concern.
   Code blocks only (not tables) for anything with special chars. Include compact code snippets for example for:
   - new types/state shapes
   - helper function signatures and critical transformations
   - API request/response payload shapes
   - component/JSX composition when layout or data sources matter
   - exact insertion/wiring points that are easy to misread
   Snippets are not required for trivial imports or self-evident one-line changes, but they are required wherever the executor could reasonably ask "what exactly do I write here?"
10. **Expected behavioral changes** — intentional diffs from current behavior, so the executor doesn't "fix" them back.
11. **Files to modify** — NEW / MODIFY / DELETE, one bullet per file with full path. If the plan aligns with another branch / stash, add `### 11a. Alignment with <ref>` subsection listing a conflict-resolution map.
12. **Pre-flight checks and known gotchas** — numbered list of non-obvious facts the executing agent must verify before Phase 1 (API surface, dual definitions, tooling quirks, ordering constraints, resume semantics, …). Start with one item requiring the executor to read every file listed in §2 Agent files and §3 Mandatory docs. Do not duplicate individual AGENTS.md paths here when they are already listed in §2.
13. **Verification against real data** — when applicable: how the design was validated against sample data / edge cases.
14. **Phased execution** — see "Phases" below. Each phase is a top-level `##` heading in the form `## Phase <N> — <name>` (with optional trailing `(refactor)` / `(codegen)` / `(review)` tag). Sub-phases are bolded labels or `###` sub-headings in the form `<N>a`, `<N>b`, ….
15. **Execution info** — see "Execution info" below. Full spec, not a one-liner.
16. **Unresolved questions (LAST, conditional)** — include this section only when the planner could not resolve one or more questions from the repo or user answers. When included, it must be the last section. Each item: the question, affected full-path(s), the default the plan proceeds with, concrete alternative(s) + scope impact. Hoist hedges ("confirm with product", "may need design input") out of section 9 and into this section. Omit the section entirely when there are no unresolved questions; do not add a "None" placeholder. Typical sources: drafted UI copy, inferred product semantics, failure surfacing, partial-failure cleanup, quota / disk, auth / RBAC, default priorities, stash / branch interactions, backward-compat edges.

## Phases

**TDD is the default** for every phase that creates or materially changes code — no `(TDD)` label needed in the heading. The only exception tags:

- `(refactor)` — pure behavior-preserving refactor; existing tests are the regression guards.
- `(codegen)` — regenerate generated files; verified by type-check / downstream tests.
- `(review)` — linter / type / suite / review-skill pass; authors no code.

**Phase count comes from the work, not from a template.** A plan may have 2 phases or 12. Number sequentially from 1. The **last** phase is always `(review)`. Everything else is free: zero or many `(refactor)` phases, one or many code-producing phases, in whatever order the task dictates.

**Every code-producing phase maps to TDD's red → green → refactor cycle.** The three sub-phase roles below are non-negotiable, but their count scales with the work — a stack-spanning phase may split GREEN across several sub-phases (`<N>b`, `<N>c`, `<N>d`) with one closing Verification; a multi-rule phase may repeat RED+GREEN per rule and close with one Verification.

- **RED (TDD's red step)** — author **only new, failing** tests in `[<test/file>]`. Run `<test cmd>`; the output MUST show each new test failing with a clear message describing the intended new behavior. **Gate: do not start GREEN until every new test is confirmed failing.** The phase body must spell out the test file path, the test command, and that the command output MUST show the new tests failing before the next sub-phase begins — this is the single most-skipped discipline when an agent executes a plan, so write it explicitly every time rather than assuming the agent will infer it. **Enumerate every new test case in prose** — one bullet per test giving the test name and the behavior it asserts (e.g. `'rejects export without format' → MISSING_FORMAT_MESSAGE on path ['format']`). Prose is mandatory because it is what the agent uses to know how many tests to write and what each must prove; a RED sub-phase that lists only code snippets risks missing cases the planner intended. Inline code snippets are optional — include them for a subset when the exact assertion shape is non-obvious (common pattern in real plans: "N with code + M described"), but never rely on snippets alone. Include regression-guard counts separately ("Regression: existing X / Y / Z still pass") so the total test budget for the sub-phase is legible.
- **GREEN (TDD's green step)** — implement the production code in `[<impl/file>]` to make every RED test pass. Re-run `<test cmd>`; every test from RED now passes.
- **Verification (TDD's refactor step + regression sweep)** — re-run the **full relevant test suite** for the package (not only the file edited in RED) to prove no pre-existing test broke — this is where the regression safety net is validated, simply by re-running what is already there. Then run phase-local checks: type check on affected packages, lint on changed files, codegen diff, drift audit.

**Sub-phase granularity comes from the work.** Use `<N>a`, `<N>b`, `<N>c`, … — one sub-phase per independently verifiable cycle (test run, build, codegen diff, type / lint pass, audit grep, manual assertion). No padding sub-phases to hit a count; no collapsing a multi-cycle phase into a single sub-phase. Valid shapes observed in real plans: `a/b` (2, e.g. codegen + verify), `a/b/c` (3, canonical RED → GREEN → Verification), `a/b/c/d` (4, e.g. `tests → utils → component → verify`), 5–7-sub-phase phases (e.g. `types → rule-set-1 → rule-set-2 → … → simplify`). Pick the shape from the work; do not stamp a fixed count across phases.

### Shape templates

Each instantiated phase uses one of these. Sub-phase bullets below are examples; keep only the ones the phase needs.

**Shape R** — `## Phase <N> — <name> (refactor)`

Refactor phases do not have a TDD-red step — the safety net is the **existing** test suite, re-run unchanged. If the existing suite has gaps over the behavior the refactor must preserve, plug them in `<N>b` as regression guards (tests that PASS on unmodified code) *before* touching impl code.

- `<N>a — preflight`: read `[<path>]`, `[<path>]` to confirm APIs and inspect existing coverage.
- `<N>b — regression guards (if gaps)`: add passing tests in `[<test/file>]` that pin current behavior the refactor must preserve; run `<test cmd>`; confirm they pass on unmodified code. Skip if existing coverage is sufficient.
- `<N>c — move <thing>`: move `<symbol>` from `[<old/path>]` to `[<new/path>]`; re-run `<test cmd>` — existing tests and any new regression guards still pass.
- `<N>d — verification`: re-run full relevant suite; `rg '<moved-symbol>' <old/path>` returns nothing; run type / lint checks needed for the moved files.

**Shape T** — `## Phase <N> — <name>` (code-producing, TDD default, no label)

- `<N>a — TDD RED` (TDD's red step): author **new, failing** tests only in `[<test/file>]`. Run `<test cmd>`; every new test fails with a message describing the intended new behavior. **Gate: do not start `<N>b` until failures confirmed.** Do NOT add regression guards here — existing tests already act as that safety net and are re-run in `<N>c`.
- `<N>b — TDD GREEN` (TDD's green step): implement in `[<impl/file>]`. Re-run `<test cmd>`; every test from `<N>a` now passes.
- `<N>c — Verification` (TDD's refactor step + regression sweep): re-run the **full relevant test suite** for the package (not only the file edited in `<N>a`) — this is where the pre-existing tests prove no regression; add phase-local checks (type check on affected packages, lint on changed files, drift audit `<cmd>`).

Stack-spanning phases split GREEN further (`<N>b` utils, `<N>c` component, `<N>d` wiring) and put Verification last (`<N>e`). Multi-rule phases repeat RED+GREEN per rule and close with one Verification sub-phase. Every sub-phase that authors production code has its own RED step (or an exception tag).

**Shape C** — `## Phase <N> — <name> (codegen)`

- `<N>a — run generator`: `<generator cmd>`; inspect diff.
- `<N>b — verification`: `<type-check cmd>`; fix drifted call-sites; re-run downstream tests.

**Shape V** — `## Phase <N> — <name> (review)` — ALWAYS THE LAST PHASE

- `<N>a — lint / format`: `<cmd>` on every changed file; fix.
- `<N>b — type check`: `<cmd>` per affected package.
- `<N>c — full test suite`: `<cmd>` — everything green.
- `<N>d — code-quality`: include the exact invocation sentence in the plan body, verbatim, using the full path to the concrete skill file: `Run the code-quality skill at <full-skill-file-path> with scope uncommitted.`
  - **Run code-quality exactly once.** Then iterate over the resulting findings list and act on each one. Do NOT re-invoke the code-quality skill after fixes — that's a token-burner and not the intent of "loop until no findings remain".
  - For every safe / auto-fixable finding from that one run: apply the fix, then re-run the narrowest relevant test file + impacted suite to guard against regression. Move to the next finding.
  - For every uncertain finding from that one run: resolve it using the plan as the design source of truth; do not punt to the user. Apply the chosen fix, then re-run the narrowest relevant test file + impacted suite. Move to the next finding.
  - Do NOT auto-fix findings the skill flags as report-only / out-of-scope — surface them verbatim to the user alongside the final review reports.
- `<N>e — code-behavior`: include the exact invocation sentence in the plan body, verbatim, using the full path to the concrete skill file: `Run the code-behavior skill at <full-skill-file-path> with scope uncommitted.`
  - **Run code-behavior exactly once.** Then iterate over the resulting findings list and fix each one. Do NOT re-invoke code-behavior after fixes — that's a token-burner and not the intent of "loop until no findings remain".
  - For every Critical/High finding from that one run: apply the fix, then re-run the narrowest relevant test file + impacted suite to guard against regression. Move to the next finding.
  - For every Test Gap from that one run: write the missing test (RED first — confirm it fails on unmodified code or against the gap-described scenario — then GREEN if behaviour is missing, otherwise the new test should pass against the existing implementation). Re-run the narrowest relevant test file + impacted suite. Move to the next gap.
  - Do NOT auto-fix Medium / Potential findings — report them verbatim to the user.
- `<N>f — security-analysis`: include the exact invocation sentence in the plan body, verbatim, using the full path to the concrete skill file: `Run the security-analysis skill at <full-skill-file-path> with scope uncommitted and depth quick.`
  - **Run security-analysis exactly once.** Do NOT re-invoke security-analysis after fixes.
  - For every confirmed Critical/High finding from that one run: apply the fix, then re-run the narrowest relevant test file + impacted suite. Move to the next finding.
  - For every security Test Gap from that one run: write the missing test using the same RED/GREEN discipline as `<N>e`, then re-run the narrowest relevant test file + impacted suite.
  - Do NOT auto-fix remaining findings or residual risks — report them verbatim to the user.
- `<N>g — change-analysis`: include the exact invocation sentence in the plan body, verbatim, using the full path to the concrete skill file: `Run the change-analysis skill at <full-skill-file-path> with scope uncommitted.`
  - **Run change-analysis exactly once, after code-behavior and security-analysis**, so its project analysis describes the final working tree.
  - Report its concise project-impact summary and any open questions verbatim. Do not treat them as an automated fix list or re-invoke the skill.

## Execution info

Full spec — this section is how the executing agent calibrates its run. Do not collapse it to a sentence. Include each of these points:

- **Execution mode** — continuous uninterrupted, or phase-by-phase with human gate; which one and why.
- **TDD flow summary** — one-sentence restatement of "TDD is default for code-producing phases; exceptions are tagged `(refactor)` / `(codegen)` / `(review)`" so the agent sees the convention without having to scroll up.
- **RED-gate restatement** — one sentence echoing the per-phase rule: after the RED sub-phase, confirm in terminal output that every new test fails before starting GREEN; if a RED test passes on unmodified code, rewrite it.
- **Stop-on-failure policy** — see §1 Preamble.
- **Guidance policy** — see §1 Preamble (links back to section 16 for every pre-known fork in the road).
- **Skills at phase boundaries** — final code-quality review runs once at `<final>d`, code-behavior once at `<final>e`, security-analysis once at `<final>f`, and change-analysis once at `<final>g`. Auto-fix / report policy: see Shape V (§14). Name any other skill here with its trigger; do not restate methodology.
- **Todo update expectation** — agent updates todo `status` as each sub-phase completes; never batch the updates to the end.
- **Commit policy** — see §1 Preamble (no commits).
- **Forbidden actions** — explicit "do NOT" list: do not run the final code-quality pass on test files; do not regenerate lockfiles; do not add new dependencies unless listed in section 5; do not push to remote; do not amend commits.
- **Project-specific conventions / aliases** — any non-obvious convention the agent must respect throughout execution that isn't obvious from the file list (e.g. import-path aliases like `@<org>/<pkg>/<sub>` → `packages/<pkg>/src/<sub>`, case-ordering rules, alphabetical-insertion anchors, shared mock location). Omit if none.
- **Plan file path** — full workspace-relative path to this plan file so the agent can update its todos.
- **Alignment / drift checks** — if the plan aligns with another branch / stash (section 11a), include the exact `git diff` / `rg` commands to run after each implementation phase to detect drift.

## Format rules

- Full workspace-relative paths everywhere (section bodies, phase steps, gotchas, todo `content`, "Files to modify"). First mention as `[<full/path>](<full/path>)`; repeats as backticked full paths. Exception: archive-internal / runtime-magic filenames with no source file.
- Code blocks (not markdown tables) for anything with regex, pipes, or special chars.
- Language-appropriate literals for data structures.
- Reference line numbers when pointing at specific code.
- Concise > prose. Agents need instructions.

## Execution prompt template

After the plan is written, hand the user the prompt body from [references/execution-prompt.md](references/execution-prompt.md), substituting `<plan-path>`, `<list full skill file paths>`, `<mandatory docs>`, and `<list phases>`. Copy it verbatim — do not paraphrase. The phrasing is load-bearing (RED-failure gate, full-suite re-run, and final-review policies).
