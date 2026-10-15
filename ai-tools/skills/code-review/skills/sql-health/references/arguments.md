# Arguments and execution context

## Output

- `output=json` selects the JSON report in `report-format.md`. Remove the token
  before parsing scope.
- Without `output=json`, keep the default Markdown report.
- Everything after `Instructions:` is review instructions, passed unchanged to
  every subagent; remove it before parsing scope.

Use database connection variables provided directly in the arguments; otherwise read them from the file paths provided by the user.

Verify and use that connection per `explain.md`.

## Scope

Resolve one scope before building the manifest. Record its baseline (or none),
target content source, and path filter (or none), and pass that resolved scope
unchanged through review and verification:

- no scope (default): checked-out branch from its detected merge base to the
  working tree, including staged, unstaged, and non-ignored untracked changes;
- `uncommitted`: `HEAD` to the working tree, including staged, unstaged, and
  non-ignored untracked changes;
- `staged`: `HEAD` to the Git index, staged changes only;
- `base <ref>`: checked-out branch from its merge base with that ref to the
  working tree, including staged, unstaged, and non-ignored untracked changes;
- one revision or revision range: its resolved start commit to its selected end
  commit;
- a change scope followed by paths: that change scope filtered to those paths;
- paths alone: no diff baseline; an explicit audit of current working-tree SQL
  in those files or directories.

Resolve ambiguous revision/path tokens from the repository. Do not guess when a
token resolves as both or neither.

## Manifest

Build a deterministic manifest of the resolved scope containing:

- every changed, reviewable file and each exclusion with its reason;
- one stable query ID for every affected query, using its path and enclosing
  symbol or starting line;
- the changed code that constructs, binds, or invokes each query;
- every new or modified migration; and
- known schema, index, and migration dependencies for each query.

Affected queries include changed raw SQL, SQL files, strings, template
literals, helpers, query-builder or ORM expressions, and unchanged query text
whose predicates, ordering, values, or execution are changed by a caller.
Generated output, lockfiles, build output, snapshots, and fixture-only SQL are
not review targets; inspect them only when they provide evidence. If a
generator or schema source changed, review the source. A file containing
several queries produces several query IDs. Record queries that cannot be
reconstructed rather than silently dropping them.
