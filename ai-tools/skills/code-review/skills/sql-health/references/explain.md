# PostgreSQL evidence

## Schema and indexes

Before judging a query, inspect its actual relevant tables, columns, PostgreSQL
types, keys, constraints, and all applicable indexes, including composite
column order, uniqueness, predicates, expressions, and included columns. Use
schema sources plus live metadata when project-provided access exists. Reconcile
changed migrations with the schema state the reviewed code will run against.

If schema or index evidence is unavailable, continue with what is known and
record the exact gap. Never recommend an index without first checking the
available existing indexes.

## EXPLAIN

Attempt `EXPLAIN (FORMAT JSON)` for every affected query when the project
environment already provides PostgreSQL access.

### Connection

Use an existing PostgreSQL client and the supplied connection. First verify that
it works and that the relations needed by the affected queries exist. Never
install dependencies, start, initialize, or change the database, run migrations,
add rows, create snapshot partitions, or print secrets. If a prerequisite is
missing, continue the static checks while the scope can still be enumerated and
record the exact plan-unavailable reason.

### Per-query procedure

1. Use the provided database client and schema state.
2. Preserve the original SQL and bindings as closely as possible. For
   parameters, use type-correct representative values from non-sensitive test
   fixtures, schema constraints, or documented defaults. Record important
   assumptions.
3. Send an `EXPLAIN (FORMAT JSON) <statement>` request. Never add `ANALYZE`, run
   the original application statement, or run a migration to obtain a plan.
4. Capture the JSON plan with the query ID. Keep credentials and unrelated row
   data out of prompts, logs, artifacts, and reports.
5. If the ORM/query builder can expose generated SQL safely, use that. If it
   cannot, explain the closest faithful SQL only when semantics remain clear;
   otherwise mark the query's plan unavailable.

Planning can also fail because the database, schema, extensions, prepared
bindings, or required relations are unavailable; handle it the same way.
Unavailable planning is neither a pass nor a defect in the changed query.

Interpret plans cautiously: small or empty tables commonly make sequential
scans and other low-overhead strategies rational. Costs and row estimates are
context, not production measurements. Record missing relations or partitions
when they affect planning instead of changing the database.
