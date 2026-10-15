# Existing-skill change control

Read this reference whenever auditing, testing, improving, or otherwise changing
an existing skill.

## Phase 1: inspect and report

Do not edit the skill during this phase, even when the user initially asks to
improve, optimize, fix, simplify, or reorganize it.

Follow [package-analysis.md](package-analysis.md) for complete package inspection,
including conditional and indirect routes. Read applicable external instructions
and explicitly depended-on skills where they can constrain behavior.

Build a feature inventory. For each feature, record as applicable:

- defining files and sections;
- trigger or activation condition;
- observable behavior, inputs, and outputs;
- modes, thresholds, ordering, and stopping conditions;
- tool, model, concurrency, and dependency requirements;
- side effects and authorization boundaries; and
- existing evaluation coverage.

Absence from evals, low activation frequency, or location in a conditional
reference does not make a feature removable. When intent cannot be established,
preserve the behavior and mark it unverified.

Classify each proposal as one of:

- `preserve`: wording-only clarification with no behavior change;
- `reorganize`: move or split content while preserving all routing semantics;
- `add`: new behavior;
- `modify`: change to existing behavior; or
- `remove`: removal, weakening, merging, or replacement of a feature.

The findings report must include:

1. the feature inventory;
2. findings with concrete evidence;
3. each proposed change, its classification, affected features, behavioral
   impact, estimated context benefit, risk, confidence, and verification plan;
4. recommendations considered but rejected because evidence was insufficient;
5. checks already run and gaps that remain; and
6. an explicit request for approval of named proposals before editing.

Token reduction alone is never evidence for `modify` or `remove`. Recommend those
changes only when evidence shows that the behavior is obsolete, unreachable,
explicitly unwanted, or replaced by an equivalent mechanism. Do not apply them
without explicit approval even when an ablation passes.

## Phase 2: apply approved findings

Treat the user's approval as scoped to the named proposals in the report. Do not
make adjacent improvements or reinterpret approval for one change as approval for
another.

For every deletion or move, map the affected text and resources back to the
feature inventory. Preserve activation conditions, thresholds, ordering,
cross-references, outputs, side effects, and authorization boundaries unless the
approved proposal explicitly changes them.

Run the approved verification plan against every affected feature, including
conditional and threshold-triggered behavior. Compare the completed package with
the feature inventory and report any behavior that remains unverified. If an
approved proposal proves unsafe or broader than reported, stop and return to the
findings phase.
