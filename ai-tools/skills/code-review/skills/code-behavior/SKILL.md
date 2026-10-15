---
name: code-behavior
description: Report-only review of changed code for functional correctness, data and API contracts, and performance and resource risks. Use for branch, staged, uncommitted, or path-scoped defect review. Excludes test-gap, structural maintainability, lint, type-checker, and security analysis.
---

# Code Behavior

Report-only review of changed code for behavioral defects. Change summaries,
test gaps, structural maintainability, lint, type-checker, and security
analysis are outside this skill: decline a request limited to those without
running passes or producing a report, and before starting a generic review
without `output=json`, tell the user it covers only behavioral defects.

## Flow

1. **Scope.** Resolve scope, focus, and output from the arguments in the
   message that invoked this skill, and build the reviewable-file and
   impacted-subsystem maps per [arguments.md](references/arguments.md).
2. **Review.** Up to 20 reviewable files and 2,000 changed reviewable lines form
   one group; anything larger must be grouped per
   [large-scope.md](references/large-scope.md). Spawn one reviewer subagent per
   group to run the selected passes. Only a returned reviewer result counts as
   review; never review yourself. A usable result covers its whole group even
   if its file or pass lists miss entries; compare the returns with the file
   map and selected passes. With a single group, rerun, with a reviewer
   subagent, only a pass whose findings are ambiguous, conflicting, or unusually
   important, narrowing scope if needed. For a grouped scope, one synthesis
   subagent then merges all reviewer findings.
3. **Verify.** With any proposed findings, spawn exactly one verifier subagent
   with all of them, their cited evidence, and the full path to
   [verify-findings.md](references/verify-findings.md), but no pass files;
   never verify yourself. Keep each `confirmed` finding with the verifier's
   corrections and drop each `merged` or `rejected` one. Keep any finding whose
   verdict is missing for any reason as proposed, unless it is `low`, and set
   `complete` to `false`.
4. **Report.** Render the kept findings per
   [report-format.md](references/report-format.md); never relay raw subagent
   output.

Every subagent gets the full paths to
[review-rules.md](references/review-rules.md), which it must read and follow,
and [finding-criteria.md](references/finding-criteria.md), plus the resolved
scope and its role. Reviewers and synthesis also get the impacted-subsystem
map; reviewers also get the reviewable-file map with its exclusions, their file
paths, and the full paths to the selected passes. You follow
`review-rules.md` too. Pick each subagent's model and effort by role from
[models.md](references/models.md).

If a reviewer or synthesis subagent fails, times out, or returns unusable
output, keep the findings you already have or gave it as proposed, set
`complete` to `false`, and continue. Any file, pass, or required evidence left
unreviewed also sets `complete` to `false`.

## Checklist

Run every pass unless the arguments select some:

1. [Correctness](passes/correctness.md)
2. [Data and contracts](passes/data-and-contracts.md)
3. [Performance and resources](passes/performance-and-resources.md)
