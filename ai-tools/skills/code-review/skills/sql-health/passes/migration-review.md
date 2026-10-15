# Changed-migration review pass

Run this pass only for a new or modified migration in the selected change.

Use the migration to determine the schema and indexes that reviewed queries
will encounter. Check only SQL correctness, query compatibility, performance,
and index effects within this skill's scope:

- added or removed indexes and whether reviewed queries can use them;
- schema changes that alter a reviewed query's columns, PostgreSQL types,
  constraints, or result semantics;
- new relationships or query patterns that lack a justified supporting index;
- duplicate or substantially redundant indexes;
- column-type changes that introduce casts, mismatches, invalid comparisons, or
  reduced index usability;
- unsafe SQL construction inside migration code; and
- obviously inefficient migration SQL when the changed query/schema evidence
  demonstrates the problem.

Report a migration finding only when the changed migration contains or causes
the problem. Do not expand into transaction, locking, rollout, deployment,
backfill operations, PostgreSQL tuning, or general migration-safety review.
