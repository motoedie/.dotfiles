# Argument Parsing

Supported depths:

- `quick` — complete-path review of all applicable Quick rules plus security
  test gaps; default
- `standard` — Quick plus specialized rules for the detected surfaces
- `deep` — Standard plus whole-change threat modeling, exploit validation, and
  operational readiness

Every selected rule gets the same complete-path tracing and evidence standard
at every depth.

Supported focuses are `authz`, `tenant-isolation`, `sensitive-data`, `tests`,
`threat-model`, and `operational-readiness`.

Parse invocation text in this order:

1. Remove one depth token: `quick`, `standard`, or `deep`. Reject conflicting
   or repeated depth tokens.
2. Remove each `focus <name>` pair. Reject a missing or unsupported focus name.
3. Remove the optional `output=json` token. Reject repeated or unsupported
   `output=` values. It changes only final delivery; default output is Markdown.
4. Parse the remaining scope:
   - no token: `branch`
   - `uncommitted`: staged, unstaged, and non-ignored untracked changes
   - `staged`: staged changes only
   - `branch`: current branch against its detected base, plus staged, unstaged,
     and non-ignored untracked changes
   - `base <ref>`: current branch against one non-empty ref, plus staged,
     unstaged, and non-ignored untracked changes
   - one revision or revision range: those committed changes
   - paths alone: audit the current files or directories, including existing issues
5. Reject mixed scope forms except a change scope followed by path filters.
   Paths following a change scope filter that diff.
   Never guess whether an ambiguous token is a revision or path; resolve it
   from the repository, then ask for clarification if both or neither exist.

Resolve the comparison baseline, reviewed content source, and path filters
once. Pass that same resolved scope to every reviewer and
verifier, including large-scope subagents:

- `staged`: `HEAD` to the Git index.
- `uncommitted`: `HEAD` to the working tree, including non-ignored untracked files.
- `branch` or `base <ref>`: the resolved merge-base to the working tree,
  including non-ignored untracked files.
- A revision or range: its resolved comparison baseline to the selected end
  commit.
- Paths alone: no diff baseline; audit current working-tree content.

Inspect cited evidence from that content source, not a different version of the
same file.

Defaults:

- No usable invocation text: `branch quick`.
- Scope only: `quick`.
- Depth only: `branch`.

Examples:

- `standard` = `branch standard`
- `base main deep` = current branch against `main`, deep
- `uncommitted focus authz` = uncommitted, quick, authz focus
- `branch packages/api standard` = branch diff filtered to `packages/api`

## Reviewable files

Exclude generated files and build output using repository conventions,
generated headers, and `.gitattributes` when present; review a changed
generator, template, or schema instead. Do not count lockfiles as application
code, but retain changed entries for supply-chain checks.
