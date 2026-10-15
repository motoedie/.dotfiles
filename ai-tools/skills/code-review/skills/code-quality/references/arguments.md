# Arguments

Parse the arguments in this order, removing each recognized part before the
next step:

1. `output=json` selects the JSON report; reject repeated or unsupported
   `output=` values.
2. `Richard Ejem`, case-insensitive and anywhere (including inside an
   `Instructions:` block), enables Richard Ejem mode; remove the phrase from
   the scope arguments only.
3. Everything after `Instructions:` is review instructions, passed unchanged to
   every review, verification, and synthesis subagent.
4. `only <topics>` or `focus on <topics>` runs only matching checks; `skip
   <topics>` omits them. Match topics loosely to check names plus `coherence`;
   Richard Ejem checks need that mode. With no directive, run every check of the
   active mode.
5. The rest selects scope: `base <ref>`, a path, a revision range, or
   uncommitted-only. Without `base <ref>` or a revision range, compare the
   checked-out branch with its merge-base against `main`, falling back to the
   default remote branch, including committed changes since the merge-base
   plus staged, unstaged, and non-ignored untracked changes. `base <ref>` uses
   the merge-base against `<ref>` instead and is removed from the path scope.
   Use whichever git tool the harness exposes; don't hardcode shell commands.

Record in the resolved scope the comparison baseline and the reviewed content
source: the Git index for staged-only changes, the end commit for a revision
range, and the working tree for branch or uncommitted scope.

## Reviewable files

Exclude generated files (detected from repository conventions, generated-file
headers, and `.gitattributes` markers), lockfiles, build output, and test
snapshot artifacts (`*.snap`, `__snapshots__/`, `*-snapshots/`), but never
application code just because its path or name contains `snapshot`. When a
generator, template, or schema changed, review that source, not its output. Also
skip `*.test.*`, `*.spec.*`, and `__tests__/`. The remaining source files are
reviewable; only their files and lines count toward the large-scope threshold.
