# Arguments

The skill accepts optional free-form instructions that override the default
analysis scope.

**Scope:**

- `uncommitted` / `working tree` — analyze only uncommitted changes
- `staged` — analyze only staged changes
- `base <ref>` — compare the current branch with its merge base against the
  supplied ref
- `<revision>` or `<revision range>` — analyze exactly those committed changes
- `<paths>` — limit analysis to specific files or directories

Resolve one scope before building the manifest. Record its comparison baseline,
selected content source, and path filters, then pass that resolved scope
unchanged to every semantic unit and synthesis:

- a revision or revision range: its start commit to its end commit; read
  current versions from the end commit;
- default or `base <ref>`: selected merge baseline to the working tree,
  including committed, staged, unstaged, and non-ignored untracked changes;
  read current versions from the working tree;
- `uncommitted` / `working tree`: `HEAD` to the working tree, including staged,
  unstaged, and non-ignored untracked changes; read current versions from the
  working tree;
- `staged`: `HEAD` to the Git index; read selected current versions from the
  index; and
- paths narrow the selected scope without changing its baseline or content
  source.

Inspect changed and current content from the recorded source, not an incidental
working-tree version of the same file.

**Examples:**

- `/change-analysis main..feature/parent-branch`
- `/change-analysis uncommitted`
- `/change-analysis base release/7.5`
- `/change-analysis services/api/`

Default with no arguments: analyze the current branch against the detected
baseline, including staged, unstaged, and non-ignored untracked changes.
