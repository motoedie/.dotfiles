# Finding verification

Independently test every proposed finding against the selected change, query
construction, relevant PostgreSQL schema and indexes, available `EXPLAIN`
output, and any supplied review instructions, including guards or constraints
that could invalidate the claimed impact. Start with each finding's cited file,
line, and query ID. Inspect any other relevant source, diff, schema, index,
plan, guard, or constraint needed to prove or disprove the claim.

For each finding:

- confirm that the selected change introduced or materially worsened it;
- confirm the cited changed location and actual value or identifier flow;
- confirm schema, type, constraint, and index claims from observed evidence;
- confirm plan claims from the cited plan without treating a plan node, cost,
  row estimate, or tiny-table choice as proof by itself;
- for an index recommendation, confirm all relevant existing indexes were
  checked, the proposed operation benefits, and the index is not duplicate or
  substantially redundant; and
- for a migration finding, confirm a changed migration exists and directly
  supports the claimed query/schema effect; and
- reassess the impact level and consequence against `report-format.md`; and
- confirm that the recommended change is minimal and specific, addresses the
  evidenced cause, preserves required query results, and stays within this
  skill's scope. Correct an unsupported or semantics-changing recommendation
  when the evidence supports a better one. If safe remediation cannot be
  established, preserve the verified finding and state the exact evidence or
  investigation needed instead.

Reject unsupported or contradicted claims. Correct inflated impact levels and
reject findings below medium impact, even when the observation is true. Merge
findings with the same cause and fix, preserving their strongest evidence.

Give every finding exactly one verdict: `confirmed`, with any corrections;
`merged into <finding>`; or `rejected`, with the failed criterion and the
counterevidence or missing evidence. Return every verdict, with confirmed
findings in `report-format.md`. Leave out a finding you could not decide before
a tool, context, or time limit stopped you. Do not search for new findings,
rerun the review pass, edit files, execute SQL, or modify the Git index.
