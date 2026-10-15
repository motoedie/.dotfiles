---
name: git-conflict-resolve
description: Resolve git conflicts by understanding intent on every side, not by picking a winner. Use when an integration step (merge, rebase, cherry-pick, revert, or — only on explicit request — stash apply) left files with `<<<<<<<` markers. Scope is conflict resolution only — does not commit, continue, drop, or otherwise advance the integration.
---

# Git Conflict Resolve

Resolve `$ARGUMENTS` (paths, or all unmerged files if empty). The job is to figure out **what each side meant to do**, not to make markers go away. Deleting one side to "solve" a conflict is how regressions ship.

**Out of scope.** No committing, no `--continue`, no dropping stashes, no advancing the integration. Resolution stops once every file is marker-free and verified. The user drives the next step.

## Mode

Identify the integration source from `git status` (`rebase in progress`, `MERGE_HEAD`, `CHERRY_PICK_HEAD`, `REVERT_HEAD`, …). **Stash is never assumed implicitly** — only treat conflicts as stash-derived when the user explicitly says so.

## Workflow

### Confirm diff3 markers are on

Two-way markers (`<<<<<<<` / `=======` / `>>>>>>>`) hide the common ancestor and force you to guess which side changed what. Three-way (diff3 / zdiff3) markers show the base in the middle:

```
<<<<<<< ours
ours-side
||||||| base
common-ancestor
=======
theirs-side
>>>>>>> theirs
```

If files show only two-way markers, recommend the user enable diff3 (`merge.conflictStyle = zdiff3`) and re-trigger the integration. If re-triggering is too disruptive, continue without — and call out in the summary that base context was unavailable, which weakens conclusions about intent.

### Identify the three sides

For each conflicting file, name three refs:

| Source             | ours              | base                                 | theirs                  |
| ------------------ | ----------------- | ------------------------------------ | ----------------------- |
| merge              | `HEAD`            | merge-base of `HEAD` and `MERGE_HEAD`| `MERGE_HEAD`            |
| rebase             | `HEAD` = upstream tip + already-replayed commits | parent of the commit being replayed | the commit being replayed (from your branch) |
| cherry-pick / revert | `HEAD`          | parent of `CHERRY_PICK_HEAD`         | `CHERRY_PICK_HEAD`      |
| stash apply (only when user says so) | `HEAD` | `stash@{N}^`                         | `stash@{N}`             |

**Rebase gotcha — ours/theirs are inverted from intuition.** During a rebase, git's `HEAD` is the *upstream* side (e.g. `main`), and the commit being replayed from your branch is `theirs`. So `<<<<<<< ours` in the markers = main, `>>>>>>> theirs` = your branch. Same for `git checkout --ours/--theirs`. The classification rules below use these labels mechanically — read them as "the HEAD side" and "the incoming side", not "my work" vs "their work".

**Rebase intent — also consult the original merge-base.** The per-commit base above is what git uses mechanically, but for *intent* you usually want the original divergence point: `git merge-base <your-branch>@{1} <upstream>` (or whatever pre-rebase ref you have). Diff main and your-branch from that point to see what each side contributed as a whole — much more useful for "did this side really mean to remove X?" than a one-commit window.

For stash, ours is also dirtied by the working tree, not just `HEAD`. For rebased branches, the same logical commit may have a different SHA on ours vs theirs — compare by content, not SHA.

### Pull the three views

For each conflicting file, gather:

- the file's content at ours, base, theirs
- the diff base→ours and base→theirs (what each side actually changed)
- the commit log base→ours and base→theirs for that path (what each side *meant* to change — message text reveals whether a removal was intentional or WIP)

The two diffs and the two logs are the load-bearing artifacts.

### Handle file-level conflicts first

Not every conflict is a `<<<<<<<` block inside a file. `git status` shows file-level conflicts with two-letter codes — handle these before chasing markers:

- **`DU` / `UD` — modify/delete**: one side deleted the file, the other modified it. No markers; git leaves the modified version in the tree as a hint. Read the *deleting* commit message (or, if the stash itself is the deleter, the stash entry from `git stash list` / `git stash show`). If the deletion was intentional (refactor, dead code, moved elsewhere), `git rm` the file — but scan the modifications first for anything still needed and move it. If the deletion was incidental (theirs branched before the file existed in its current form), keep the modified version.
- **`AA` — add/add**: both sides added the same path with different content. Markers will be present, but the `||||||| base` section is empty — there's no common ancestor. Intent reasoning is weaker; usually hand-merge to take the union (exports, fields, imports). If the two files are unrelated despite sharing a path, surface to the user.
- **Rename/rename** (same file renamed to different paths on each side): pick the name that matches the project's current conventions / surrounding code. If both sides also modified content, merge the content under the chosen name.
- **Rename/delete**: one side renamed, the other deleted. Same rule as modify/delete — the deleter's commit message decides. If delete was intentional, `git rm` the renamed path; otherwise keep the rename.
- **Rename/modify**: usually git auto-follows the rename and you get standard markers in the renamed path. Verify the path looks right before resolving.
- **`AU` / `UA`** and other exotic states: surface to the user with the `git status` output — don't guess.

For all the delete-involved cases, the deletion commit message (or stash entry, when stash is the deleter) is load-bearing — same rule as in-file removals: don't override an intentional delete just to keep code alive.

### Classify every conflicting hunk

For each `<<<<<<<` block, walk these questions in order. **Stop at the first that fits.**

- **Both sides made the same change** → take either.
- **Ours intentionally removed code that theirs still has** → read the removal commit message. If deliberate (refactor, dead-code, deprecation), the removal stays — even though theirs reintroduces it. Do **not** restore removed code just to satisfy the merge.
- **Theirs intentionally removed code that ours still has** → mirror of above. Honour the removal.
- **Theirs adds something genuinely new (not present in base)** → keep it, but **adapt to ours' current shape**: helper names, imports, types, and file paths may have moved in ours. Naive paste compiles into landmines later.
- **Both sides modified the same code differently** → decide which side's *intent* still holds:
  - Ours refactored, theirs added a feature → keep ours' structure, graft theirs' feature onto it.
  - Theirs is load-bearing (bug fix ours doesn't have) → take theirs, re-apply ours' cosmetic edits on top.
  - Genuinely ambiguous → surface to the user with both diffs and a recommendation. Don't guess.
- **Renamed differently on both sides** → pick the name that matches the rest of the file's current state (usually ours, since its surrounding code is the runtime).

Rule of thumb: **"removed" beats "kept" only when the removal is intentional**. A conflict that exists only because theirs was branched from an older base is mechanical, not semantic — defer to ours.

### Apply the resolution

Edit the file directly. Replace the entire conflict block — including all three markers — with the resolved content. No marker fragments left behind.

When grafting theirs' new code onto ours' refactored structure: rename helper calls, swap imports, update type names. The new code must compile against ours' **current** API surface, not theirs' old one.

### Verify

In this order:

- **No conflict markers anywhere** in the changed files.
- **No orphaned references** — symbols that were removed by ours but reintroduced by pasted theirs code (or vice versa). Grep for any symbol named in deleted hunks.
- **Typecheck** the affected packages.
- **Run the affected test files**, then the relevant package suite.

Fixing conflicts often surfaces *pre-existing* breakage from theirs' feature — e.g. theirs flips a default and ours' tests didn't account for it. That's not a conflict, it's behavioural drift the integration exposed. Fix those tests too, but call them out separately in the summary so the user knows they weren't caused by the resolution.

## Output

- per file: which side(s) won, which hunks were grafted, any tests that broke and how they were fixed
- pre-existing breakage exposed by the integration that the user should know about
- any hunks where you couldn't decide — surface for human call

## Hard rules

- Never resolve a conflict by deleting code unless you can point at a commit message that says "remove this".
- Never paste theirs' code without checking it compiles against ours' current API surface.
- Never advance the integration (`--continue`, `commit`, `stash drop`, `stash pop`) — stop at "verified marker-free".
- Never use destructive recovery (`reset --hard`, `checkout .`, `clean -f`) to redo a botched resolution. Restart that one file (`git checkout --merge -- <path>` brings the conflict markers back) and re-resolve.
- If diff3 base context wasn't available, say so in the summary — the absence weakens "intent" arguments.

## Tips worth knowing

- `merge.conflictStyle = zdiff3` (set globally once) makes every future conflict show the base section, with common lines collapsed.
- `rerere.enabled = true` records and replays your resolutions on long-lived rebases.
- Binary / generated files: regenerate from source after taking either side; the regenerated output is the source of truth.
- `yarn.lock` conflicts: don't hand-merge. Take either side (or leave the markers) and run `yarn install` — Yarn rewrites the lockfile from `package.json`.
- Whitespace-only conflicts usually mean an auto-formatter ran on one side. Take whichever matches the project's current formatter, then re-run the formatter once resolved.
