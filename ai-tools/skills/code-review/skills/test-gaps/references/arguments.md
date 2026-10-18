# Arguments

The skill accepts optional free-form scope arguments.

Remove the optional `output=json` token before parsing scope. It selects
the JSON section of `report-format.md` for final delivery. Without it, keep the
default Markdown report.

Remove the optional `impact=medium` token before parsing scope. It lowers the
impact threshold from `high` to `medium`. Without it, report only `critical`
and `high` gaps.

Supported forms:

- `uncommitted` / `working tree` — `HEAD` to the working tree, including staged,
  unstaged, and non-ignored untracked changes;
- `staged` — `HEAD` to the Git index;
- `base <ref>` — the merge baseline with that ref to the working tree,
  including staged, unstaged, and non-ignored untracked changes;
- `<revision>` or `<revision range>` — exactly those committed changes, read
  from the end commit; and
- `<paths>` — filter the selected change scope to files or directories.

With no scope argument, review the current branch from its merge baseline with
`main` or `master`, falling back to the default remote branch, to the working
tree: committed changes since the baseline plus staged, unstaged, and
non-ignored untracked changes.

## Resolved scope and reviewable files

Resolve the selected diff before review. Record its comparison baseline,
reviewed content source, any path filter, and the impact threshold. Pass this
resolved scope unchanged to the reviewer and verifier.

Exclude generated files, lockfiles, build output, and test snapshot artifacts
using repository conventions, generated-file headers, and `.gitattributes`
markers when present. If a generator, template, or schema changed, review that
source rather than generated output. Keep changed tests in scope so the reviewer
can inspect their assertions and mocks.

Use unchanged callers, consumers, contracts, and tests only as evidence for the
affected behavior, existing coverage, and possible impact. Do not report
pre-existing test gaps unrelated to the selected change.
