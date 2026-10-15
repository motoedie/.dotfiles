# Result Verification

Decide each proposed finding against `finding-criteria.md` only. Inspect the
selected change, cited evidence, and any source, test, guard, or constraint
that could prove or disprove it.

Give every finding exactly one verdict:

- `confirmed`: the evidence proves it meets the criteria. Set its final impact,
  and correct its explanation or suggested action when wrong; the action must
  address the evidenced cause without violating cited contracts or constraints.
- `merged into <finding>`: it has the same cause and fix as a confirmed
  finding.
- `rejected`: it fails the criteria, its final impact is `nit`, or the evidence
  cannot prove it. Name the failed criterion and the counterevidence or missing
  evidence.

Return every verdict, with confirmed findings in full. Leave out a finding you
could not decide before a tool, context, or time limit stopped you. Do not
render the report, search for new findings, rerun passes, edit files, or modify
the Git index.
