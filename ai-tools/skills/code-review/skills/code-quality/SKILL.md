---
name: code-quality
description: Report-only review of changed production code for structural maintainability after implementation, especially after reactive edits. Checks minimal change, single responsibility and misleading names, duplication, coupling, and module boundaries. `Richard Ejem` adds clarity/contracts, type modeling, reuse/evolution, and nit findings. Excludes lint/typechecker and test concerns. Supports base, path, revision-range, uncommitted, focus/skip, and instruction scopes.
---

# Code Quality

Report-only review of changed production code for structural maintainability:
report maintenance problems with concrete impact and propose fixes, never apply
them. An empty report is valid.

## Flow

1. **Scope.** Resolve scope, focus, mode, instructions, and output from the
   arguments in the message that invoked this skill, and list the reviewable
   files per [arguments.md](references/arguments.md).
2. **Review.** Up to 20 reviewable files and 2,000 changed reviewable lines form
   one group; anything larger must be grouped per
   [large-scope.md](references/large-scope.md). Spawn one reviewer subagent per
   group to run the selected checks; with several groups, one synthesis
   subagent then merges their findings. Only a returned reviewer result counts
   as review; never review yourself.
3. **Verify.** When the verification policy selects findings, spawn one
   verifier subagent with them and the full path to
   [verify-findings.md](references/verify-findings.md), but no check files;
   never verify yourself. Keep each `confirmed` finding with the verifier's
   corrections and drop each `merged` or `rejected` one. Keep any finding you
   sent whose verdict is missing for any reason as proposed, and set `complete`
   to `false`. Findings the policy carries skip verification and stay.
4. **Report.** Render the kept findings per
   [report-format.md](references/report-format.md); never relay raw subagent
   output.

Every subagent gets the full paths to
[review-rules.md](references/review-rules.md), which it must read and follow,
and `report-format.md`, plus the active mode, the resolved scope, and any
instructions unchanged in an **Instructions** block. Reviewers also get their
file paths, excluding tests, and the full paths and names of the selected
checks in checklist order. Do not restate file contents or a persona. You
follow `review-rules.md` too. Pick each subagent's model and effort by role
from [models.md](references/models.md).

If a subagent fails, times out, or returns unusable output, keep the findings
you already have or gave it as proposed, set `complete` to `false`, and
continue. Anything left unreviewed or undecided also sets `complete` to
`false`.

## Checklist

Selected checks run in this order:

1. [Minimal change](passes/minimal-change.md)
2. [Single responsibility](passes/single-responsibility.md)
3. [Duplication](passes/duplication.md)
4. [Coupling](passes/coupling.md)
5. Richard Ejem mode only: [clarity and contracts](references/richard-ejem/clarity-and-contracts.md),
   [type modeling](references/richard-ejem/type-modeling.md), and
   [reuse and evolution](references/richard-ejem/reuse-and-evolution.md)
6. Coherence, described in `review-rules.md`

## Richard Ejem mode

`Richard Ejem` anywhere in the arguments adds the three extra checks and
reports `nit` findings too; reviewer `nit` findings skip verification.
