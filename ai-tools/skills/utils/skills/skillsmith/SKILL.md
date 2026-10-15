---
name: skillsmith
description: Create, audit, optimize, or test Agent Skills for coding agents. Use when designing a new skill or improving an existing skill's routing, instructions, token economy, resources, portability, safety, or evaluations. Existing-skill work is report-first and requires approval before edits. Do not use for ordinary prompt editing or unrelated documentation.
---

# Skillsmith

Preserve the skill's complete behavioral contract while reducing avoidable
context and improving organization. Treat a skill like code: inspect it, define
observable behavior, make the smallest useful change, and test the result.
Feature loss is a regression even when the resulting instructions are shorter.

## Read the writing guide

Before creating, auditing, improving, or testing a skill, load the
`writing-for-agents` skill (the `writing-for-agents@motoedie` plugin) and read
`SKILL-MECHANICS.md` in that skill's folder. Apply the full guide
when evaluating or writing skill instructions.

Skillsmith's workflow, behavior-preservation, approval, validation, and
natural-endpoint rules take precedence where the guide differs. Treat pruning
suggestions for existing skills as recommendations subject to
[Protect existing behavior](#protect-existing-behavior).

## Set the scope

Infer these settings from the request and state only assumptions that affect the
result:

- **Operation:** create, improve, audit, or test. New skills may be implemented
  immediately; existing skills follow
  [Protect existing behavior](#protect-existing-behavior).
- **Target:** `portable` by default, or `openai`, `cursor`, or `claude` when the
  user requests one. For a platform target, read
  [references/targets.md](references/targets.md).
- **Effort:** `normal` by default. Use `fast` for a narrow/static pass and
  `benchmark` only when the user requests comparative evidence or the request
  otherwise clearly includes running evaluations. For `normal`, read
  [references/evaluation.md](references/evaluation.md). For `benchmark`, read
  that reference and
  [references/benchmarking.md](references/benchmarking.md).

Preserve the user's chosen location and format. Before analyzing an existing
skill, read [references/existing-skills.md](references/existing-skills.md) and
[references/package-analysis.md](references/package-analysis.md). Follow their
complete inspection and reporting protocols for every package and example size.

When creating a skill, look among the current harness's available skills for
its skill-creation helper, such as Codex or Claude's `skill-creator`, or Cursor's
`create-skill`. Use its relevant instructions and tools without repeating
completed work. If none is available, continue with Skillsmith. The helper is
advisory, not a dependency; Skillsmith's rules take precedence. This workflow
remains responsible for instruction quality, economy, routing, evaluation,
safety, and portability.

## Decide whether a skill is the right artifact

Before creating one, determine whether the information would work better as:

- repository instructions, when it applies to all work in one repository;
- a script, when the work is deterministic and repeated;
- a reference, when the information is conditional or substantial;
- an ordinary prompt/template, when it is used ad hoc; or
- nothing, when a capable coding agent already knows it.

Explain and stop if a skill would add no durable behavioral value. For an
over-broad skill, recommend a split; for several skills with the same routing and
workflow, consider a merge.

## Protect existing behavior

Feature preservation is a correctness requirement. A feature includes routing,
operating modes, thresholds, workflows, outputs, side effects, tool or model
requirements, concurrency, stopping conditions, and authorization boundaries.

Before proposing changes to an existing skill, inventory these features and map
each proposed change to them using the existing-skill reference. Missing tests,
infrequent activation, high context cost, or the agent's preference for a simpler
workflow is not evidence that a feature is obsolete.

Do not edit an existing skill during the findings phase. Report proposed changes
and ask for approval. After approval, apply only the approved findings without
adjacent optimization. Never remove, weaken, merge, or replace a feature unless
the report identifies the behavioral impact, provides evidence, and the user
explicitly approves that change.

## Establish the behavioral contract

Identify the outcomes the skill must change before rewriting instructions:

1. representative requests that should trigger, might trigger, and must not
   trigger;
2. required outputs and decision points;
3. non-obvious invariants, local conventions, permissions, and safety boundaries;
4. dependencies and environment assumptions; and
5. known failures or regressions that motivated the work.

Rely on the workflow's natural endpoint. Add explicit completion or stop criteria
only when the endpoint is ambiguous, continued iteration or retries could waste
significant time or tokens, or continued action could increase risk, cost, or
external side effects.

Classify source material while reasoning as `invariant`, `requirement`,
`preference`, `heuristic`, `example`, or `background`. Do not add these labels to
the final skill unless they improve its use. Diagnose each observed failure as
missing knowledge, weak salience, ambiguity, bad routing, missing deterministic
tooling, a misleading example, or a one-off error. A one-off error does not by
itself justify another rule.

## Analyze before editing

Define each behavioral rule in exactly one instruction file; other files may
route to it but must not restate its conditions or exceptions.

When Python is available, run:

```bash
python3 scripts/analyze_skill.py <skill-directory>
```

Resolve [scripts/analyze_skill.py](scripts/analyze_skill.py) relative to this
skill's directory. It reports a complete file inventory, direct local document
dependencies (including sibling skills), approximate discovery, activation,
conditional-resource and external-dependency costs, plus deterministic structure
findings. Use `--format json` for the file inventory. Referenced dependency costs
do not imply those documents are always loaded. Treat token counts as estimates
and its warnings as leads, not proof of semantic coverage.

After changing the analyzer, run its
[regression tests](tests/test_analyze_skill.py) with
`python3 -B -m unittest discover -s <skillsmith-directory>/tests`.

Also inspect semantically for:

- generic knowledge or background that does not change a decision;
- duplicated, contradictory, or equally worded but differently important rules;
- overlap with installed skill descriptions likely to cause routing collisions;
- references loaded without a specific condition;
- examples that merely repeat prose;
- stable mechanical action sequences that are repeated, operate on large inputs,
  or consume substantial reasoning tokens and could be delegated to scripts;
- total execution tokens across the workflow, including other agents, repeated
  reads, excessive tool output, and avoidable retries; look for shared work and
  scriptable mechanics without losing coverage or quality, and benchmark before
  claiming savings;
- workflows that analyze a variable collection of files or artifacts, or one
  potentially oversized artifact, and therefore require explicit scope,
  coverage, partitioning, and synthesis behavior;
- unverifiable or unavailable tools, paths, commands, and dependencies; and
- destructive commands, secret exposure, hidden network use, untrusted content
  treated as instructions, or mutation without appropriate authorization.

## Improve for behavioral value per token

For a new skill, make the smallest change supported by the analysis. For an
existing skill, make the smallest approved change:

- Narrow the description so discovery selects the skill for the right requests
  and rejects neighboring work.
- Put purpose, essential constraints, routing, and the common workflow in
  `SKILL.md`.
- Move substantial conditional material to a focused reference, and state the
  exact condition for reading it. Do not move text merely to improve the
  entrypoint's metric.
- When analysis finds an automation candidate, read
  [references/script-extraction.md](references/script-extraction.md). Extract a
  deterministic stage when the saved reasoning and improved reliability justify
  maintaining code; finding no suitable candidate is a valid result.
- When the target workflow analyzes a variable collection of files or artifacts,
  or one potentially oversized artifact, read
  [references/large-input-analysis.md](references/large-input-analysis.md). Apply
  its complete pipeline; small inputs may produce one work unit but do not skip
  scope or coverage accounting.
- Prefer one positive success condition over repeated prohibitions unless the
  prohibitions protect distinct invariants.
- Keep examples only when they resolve ambiguity or serve as regression inputs.
- Place high-impact constraints near the decision they govern; do not rely on
  repeated emphasis words for salience.
- Preserve authorization boundaries and unrelated supported metadata.

Do not optimize solely against line count or an arbitrary score. Every retained
instruction should earn its expected context cost through behavioral value,
frequency, risk reduction, or clarity.

## Evaluate and finish

Before finishing, verify whether the following tasks were done. Do any that
weren't.

Use the effort-specific checks routed above. For `fast`, perform static
analysis, link/resource checks, and a focused semantic review. For every new
skill, walk through at least one representative execution case; for an existing
skill, exercise all affected features, modes, thresholds, and conditional paths
and preserve uncovered behavior as unverified.

After editing, compare the result with the pre-change feature inventory, then
rerun available structural validators and the static analyzer. For an existing
skill, close every row in the package and feature coverage ledgers; otherwise
report the result as incomplete. Run new or changed scripts on representative
success and failure inputs. Convert demonstrated failures into regression cases
when the expected behavior is stable; do not accumulate prose for every failure.

Report concisely:

- created or changed files;
- behavioral improvements and intentional tradeoffs;
- discovery, activation, and conditional cost estimates before and after when a
  before version exists;
- evaluations run and their results; and
- unverified assumptions or recommendations that lack evidence.

Never claim preserved quality, token savings, compatibility, or benchmark gains
without naming the evidence. If evidence is insufficient, say what was not run.
