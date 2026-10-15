# SQL health

Report-only review of SQL affected by a change. It checks value and identifier
construction, PostgreSQL schema and indexes, `EXPLAIN` plans, query performance,
index fit, and changed migrations that affect the reviewed SQL.

## Quick start

| Command | Review |
| --- | --- |
| `sql-health` | Local branch against its merge baseline, including working-tree changes |
| `sql-health uncommitted` | Staged, unstaged, and non-ignored untracked changes |
| `sql-health staged` | Staged changes only |

## Choose the scope

| Argument | Scope |
| --- | --- |
| `base <ref>` | Current branch compared with another base ref |
| `<revision>` or `<revision range>` | Explicit committed changes |
| `<change scope> <paths>` | Change scope filtered to files or directories |
| `<paths>` | Explicit audit of current SQL in those paths |

Every affected query is reviewed against relevant schema and existing indexes.
When PostgreSQL access exists, the skill runs `EXPLAIN (FORMAT JSON)` without
`ANALYZE`. If planning is unavailable, static review continues.

The skill reports critical-, high-, and medium-impact findings after independent
verification; findings the verifier cannot decide stay in a report marked
incomplete.
It does not edit code or schema, run migrations, execute application SQL, or
review transaction behavior, locking, general tuning, and unrelated migration
safety.
