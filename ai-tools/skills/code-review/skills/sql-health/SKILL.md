---
name: sql-health
description: Report-only review of SQL queries affected by code changes, using PostgreSQL schema and index metadata plus EXPLAIN to find injection, query-plan, performance, and index problems. Also reviews changed migrations when they affect reviewed queries or schema. Supports local Git scopes. Excludes general database operations, transaction or locking analysis, PostgreSQL tuning, and unrelated migration safety.
---

# SQL Health

Report-only review of SQL affected by a change against the actual PostgreSQL
schema, indexes, and available query plans: propose fixes without editing
source, changing schema, or executing application statements.

## Flow

1. **Scope.** Resolve output, instructions, connection, and scope from the
   arguments in the message that invoked this skill, and build the manifest per
   [arguments.md](references/arguments.md).
2. **Evidence.** Gather each query's schema, index, and plan evidence, or the
   exact reason it is unavailable, per [explain.md](references/explain.md).
3. **Review.** Up to 20 reviewable files and 2,000 changed reviewable lines form
   one unit; anything larger, an item over an observed tool or context limit,
   or truncated output must be grouped per
   [large-scope.md](references/large-scope.md). Spawn one reviewer subagent per
   unit to run the checklist; on the large-scope path, one synthesis subagent
   then merges their findings. Only a returned reviewer result counts as review;
   never review yourself. A usable result covers its assigned queries and
   migrations even if its lists miss entries.
4. **Verify.** Unless no findings were proposed, spawn exactly one verifier
   subagent with the complete proposed finding set, the observed schema, index,
   and plan evidence, and the full path to
   [verify-findings.md](references/verify-findings.md), but no check files;
   never verify yourself. Keep each `confirmed` finding with the verifier's
   corrections and drop each `merged` or `rejected` one. Keep any finding whose
   verdict is missing for any reason as proposed, and set `complete` to
   `false`.
5. **Report.** Render the kept findings per
   [report-format.md](references/report-format.md); never relay raw subagent
   output.

Every subagent is fresh and read-only and gets the full paths to
[review-rules.md](references/review-rules.md), which it must read and follow,
and `report-format.md`, plus the resolved scope and any instructions unchanged
in an **Instructions** block. Reviewers also get their manifest entries, the
schema/index evidence, each query's plan or plan-unavailable reason, and the
full paths to `explain.md` and the checks to run. You follow `review-rules.md`
too. Pick each subagent's model and effort by role from
[models.md](references/models.md).

If a subagent fails, times out, or returns unusable output, keep the findings
you already have or gave it as proposed, set `complete` to `false`, and
continue; missing work never stops the flow. Anything left unreviewed or
undecided also sets `complete` to `false`.

## Checklist

1. [Query review](passes/query-review.md) for every affected query ID:
   construction/injection, schema/index, EXPLAIN status, and
   plan/performance/index.
2. [Migration review](passes/migration-review.md) for every new or modified
   migration, relating it to reviewed queries and their effective schema; skip
   it, and any general migration review, when the manifest has no migration.
