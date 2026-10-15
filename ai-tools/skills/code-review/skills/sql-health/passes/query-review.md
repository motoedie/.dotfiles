# Query review pass

Apply every section to every affected query ID. Review queries one by one and
return the completed checks for coverage reconciliation.

## Understand the query

- Reconstruct the SQL or the closest faithful query-builder/ORM equivalent.
- Identify its purpose, involved tables and columns, predicates, joins,
  grouping, ordering, pagination, and result shape.
- Trace how values and identifiers are constructed and reach the database API.
- Relate the query to the relevant PostgreSQL types, constraints, and existing
  indexes. Do not infer absent schema facts.

## Injection and interpolation

Check template literals, concatenation, raw-query APIs, dynamic conditions,
`ORDER BY`, and dynamic table or column names.

- Values should use PostgreSQL parameters or the library's safe value-binding
  mechanism.
- PostgreSQL value parameters do not bind identifiers. Dynamic identifiers must
  be fixed, allowlisted, validated against a closed set, or constructed through
  the library's safe identifier API.
- Trace actual input provenance and sanitization. Report injection only for an
  unsafe reachable path or strong evidence, not merely because SQL is dynamic.

## Plan and performance

Interpret the query, schema, existing indexes, and available `EXPLAIN` plan
together. Consider ineffective filtering, expensive scans, unnecessary sorts,
inefficient joins, correlated subqueries, repeated work, index-incompatible
predicates, functions or casts on indexed columns, column/parameter type
mismatches, inefficient wildcard search, and large-offset pagination.

Relevant plan nodes include sequential, index, index-only, and bitmap scans;
nested-loop, hash, and merge joins; sorts, aggregates, and materialization.
Their presence alone is not a problem. Explain the query/schema condition that
makes a node harmful at realistic scale.

The review database may contain little or no representative data. Do not infer a problem from a
sequential scan, estimated cost, row estimate, or join strategy alone. Ask
whether the query structure and indexes support realistic scale.

## Existing-index fit and recommendations

Inspect all relevant existing indexes before recommending one. Check filtering,
joins, ordering, and grouping, including composite order, uniqueness, partial
predicates, indexed expressions, operator compatibility, and included columns.

Look specifically for a useful existing index made ineffective by:

- a function or cast around an indexed column;
- a column/parameter type mismatch;
- an expression or operator mismatch; or
- a predicate that does not imply a partial-index predicate.

Prefer a query fix when it restores an existing index. Recommend a new index
only when evidence shows a meaningful operation it improves, why current
indexes are insufficient, and why it is not duplicate or substantially
redundant. For a composite index, explain the proposed column order from the
query's equality/range/order behavior. Do not use `Seq Scan -> add index` logic.

## Finding eligibility

Report only meaningful, changed-scope problems with concrete evidence and
impact. Successful `EXPLAIN`, ordinary plan nodes, and existing keys or indexes
are coverage evidence, not findings.
