# Test-Gap Verification

Independently verify every proposed gap against the selected change, cited
evidence, relevant source, and existing tests.

For each gap:

- confirm that the selected addition, fix, or refactor implements or can affect
  the stated behavior;
- inspect the closest relevant tests and confirm they do not already exercise
  and assert that behavior;
- reassess impact under `output-format.md`, correct inflated labels, and reject
  low-impact gaps by default even when the coverage absence is real;
- confirm that the suggested level is appropriate and that the suggested test
  exercises the affected behavior through a stable interface and asserts an
  observable result. Filter out suggestions that only mirror implementation,
  check internal call order, or add execution without a behavioral assertion;
  when the gap is otherwise valid, correct the suggestion instead of rejecting
  the gap; and
- reject unsupported or contradicted gaps and merge overlapping cases.

Give every gap exactly one verdict: `confirmed`, with any corrections; `merged
into <gap>`; or `rejected`, with the failed check and the counterevidence or
missing evidence. Return every verdict, with confirmed gaps in
`output-format.md`. Leave out a gap you could not decide before a tool, context,
or time limit stopped you. Do not search for new gaps, rerun the review, edit
files, or modify the Git index.
