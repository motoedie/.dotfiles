---
name: test-gaps
description: Report-only review of changed code for meaningful behavior-focused test gaps. Use for branch, staged, uncommitted, path-scoped, or GitLab merge-request CI review. Does not write tests, find general code defects, or review security-specific test gaps.
---

# Test Gaps

Review selected code changes, including additions, fixes, and refactors, for
missing behavior-focused tests. Report findings without editing the reviewed
change.

## Flow

1. **Scope.** Resolve scope, impact threshold, and output from the arguments in
   the invoking message per [arguments.md](references/arguments.md), including
   its defaults and file exclusions when no arguments are given.
2. **Review.** Spawn one reviewer subagent to run the
   [test-gap checks](passes/test-gaps.md) for the entire selected change;
   never divide it into groups or use a separate large-review workflow.
   Cross-check its proposed gaps and weak tests against the resolved scope
   before verification. If it cannot inspect the complete scope, preserve its
   completed items, set `complete` to `false`, and continue to verification.
3. **Verify.** With any proposed gaps or weak tests, spawn one independent
   verifier subagent with all of them, their cited evidence, and the full path
   to [verify-gaps.md](references/verify-gaps.md). The verifier decides what
   source and tests to inspect. Keep each `confirmed` item with its corrections
   and drop each `merged` or `rejected` one. Keep any item whose verdict is
   missing for any reason as proposed, and set `complete` to `false`. Skip
   verification when there are no proposals.
4. **Report.** Render the kept items as Markdown or `output=json` per
   [report-format.md](references/report-format.md); never relay raw reviewer
   output verbatim.

You and both subagents follow
[finding-criteria.md](references/finding-criteria.md). Every subagent gets its
role, the unchanged resolved scope (baseline, content source, path filter, and
impact threshold), and the full paths to that file, the test-gap checks, and
`report-format.md`.
Pick each subagent's model and effort by role from
[models.md](references/models.md).
