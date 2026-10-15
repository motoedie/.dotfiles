# Large-scope grouping

The goal is exhaustive query/check coverage without losing query-to-schema,
caller, index, plan, or migration relationships.

Group the manifest as is, with its paths, query IDs, and migration IDs as
stable IDs and no extra exclusions. Group by feature and database relationship,
keeping each query with its builders and callers, relevant schema and indexes,
`EXPLAIN` result, and any migration that establishes its effective schema, in
the fewest units of at most 20 reviewable files and 2,000 changed lines. Split
only at a genuine feature, query, or schema boundary, never alphabetically or
into arbitrary equal slices; schema evidence may be repeated across units. If
one item exceeds an observed host/tool limit, subdivide it by query, builder,
statement, or schema object and repeat shared context in each child unit; if no
meaningful split exists, record it as unreviewed.

Record each unit's ID, included file/query/migration IDs, and required checks in
a coverage ledger. Units may run in parallel, one reviewer each, told its unit
ID and purpose and that it is one of several units, and given the migration pass
only when the unit contains a changed migration. Never sample, cap findings, or
silently drop a query because one unit fails. Before synthesis, compare the
reviewers' returns (see `review-rules.md`) with the ledger: every affected query
must have construction/injection, schema/index, EXPLAIN-status, and
plan/performance/index results, and every changed migration a migration result.
Resolve cross-unit dependencies or mark them missing. A usable result covers its
whole unit even if its lists miss entries, duplicate or unexpected results
change nothing, and a unit without a usable result is unreviewed, with its
queries and migrations.

Give the synthesis subagent the unit summaries and proposed findings, the
manifest and ledger, and shared dependencies. If synthesis itself exceeds an
observed limit, repeat this process hierarchically and reconcile against the
original manifest at the end. If synthesis fails, the combined unit findings go
to verification instead.
