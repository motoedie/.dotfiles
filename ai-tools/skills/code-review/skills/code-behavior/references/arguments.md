# Arguments

The skill accepts optional free-form instructions that override default
behavior.

**Scope:**

- default — the current branch from its merge base with `main` or `master`
  (else the default remote branch) to the working tree: committed changes since
  the merge base plus staged, unstaged, and non-ignored untracked changes
- `base <ref>` — the same, from the merge base with `<ref>`
- `uncommitted` / `working tree` — `HEAD` to the working tree, including staged,
  unstaged, and non-ignored untracked changes
- `staged` — `HEAD` to the Git index
- `<revision>` or `<revision range>` — committed changes from its start commit
  to its end commit
- `<paths>` — limit review to specific files or directories

Record the resolved scope (current branch, comparison baseline, reviewed content
source, path filter) and each changed file as added, modified, deleted, or
renamed. Reviewers and the verifier use it as evidence.

**Focus:**

- `only <topic>` / `focus on <topic>` — run only matching behavior passes
- `skip <topic>` — omit matching behavior passes

Match topics loosely to correctness, data flow and API contracts, or performance
and resources. Run multiple passes when multiple topics are requested, and every
pass when none are. If no pass matches, say so and stop.

**Output:**

- `output=json` — remove this token before parsing scope or focus and render the
  final result in JSON per `report-format.md`
- otherwise — keep the default Markdown report

## Reviewable files

Before reading source, build a deterministic reviewable-file map: exclude
generated files, lockfiles, build output, and test snapshots (by repository
conventions, generated-file headers, `.gitattributes`), recording each
exclusion and its reason; review a changed generator, template, or schema
instead of its output; keep changed tests. Only reviewable files and lines
count toward the large-scope threshold. Build the impacted-subsystem map from
paths and extensions.
