# Arguments

The skill accepts optional free-form scope arguments.

Remove the optional `output=json` token before parsing scope. It selects
`json-output-format.md` for final delivery. Without it, keep the default
Markdown report.

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
