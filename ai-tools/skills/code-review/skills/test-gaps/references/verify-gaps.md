# Test-Gap Verification

Independently apply [finding-criteria.md](finding-criteria.md) and the
[test-gap checks](../passes/test-gaps.md) to every proposed gap and weak test.
Inspect the selected change, cited evidence, relevant source,
and existing tests, searching for coverage the reviewer may have missed.

Give each item exactly one verdict:

- `confirmed`: it meets the criteria and the scope's impact threshold.
  Reassess impact, correcting inflated or deflated labels. Correct a valid
  gap's suggestion instead of rejecting it when its level, assertions, or
  mocking fail the criteria.
- `merged into <gap>`: it covers the same behavior as another gap; fold a weak
  test into a gap on that behavior when one exists.
- `rejected`: it fails a criterion or the impact threshold. Name the failed
  check and the counterevidence or missing evidence.

For a weak test, confirm that it is in scope, implies protection of a behavior
at or above the impact threshold, and protects none of it. If it protects part,
reject the weak-test finding and keep or propose the missing scenario as a gap.

Return every verdict, with confirmed items in
[report-format.md](report-format.md). Leave out an item you could not decide
before a tool, context, or time limit stopped you. Do not search for new gaps
beyond a rejected partial test's missing scenario, rerun the review, edit files,
or modify the Git index.
