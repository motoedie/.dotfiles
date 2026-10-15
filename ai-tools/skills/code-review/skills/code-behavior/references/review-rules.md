# Review rules

The parent and every subagent follow the guardrails; reviewers and the
synthesis subagent also follow their own section.

## Guardrails

- Report only: never edit code, approve the change, or claim it is safe.
- Unchanged callers, consumers, dependencies, contracts, and tests are evidence
  context, not review targets.
- Reuse repository tooling and conventions.
- Record unreviewed scope precisely.

## Reviewers

Run every selected pass on every file in your group in one review, reusing the
same source context, and inspect the source and selected change as needed to
understand or verify behavior. Return findings per `finding-criteria.md` plus
each file with its completed passes, even when you find nothing. When reviewing
one of several groups, also return the group ID and purpose, changed public
contracts and dependencies, and cross-group links: callers, consumers, or shared
data in another group that your changes affect, and any link you could not
check.

## Synthesis

De-duplicate findings across groups. Reconcile cross-group contracts, data
flow, side effects, resource ownership, and tests used as evidence, inspecting
supporting source to check cited evidence or a cross-group link. Resolve every
cross-group link: one that shows a defect becomes a candidate finding; one you
cannot resolve becomes a candidate naming the data to check. Apply
`finding-criteria.md` only to the candidates you add. Without verifying or
rendering a report, return the complete proposed finding set, without capping
valid findings, plus any unreviewed groups and files.
