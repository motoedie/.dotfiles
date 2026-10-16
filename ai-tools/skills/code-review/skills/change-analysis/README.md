# Change analysis

Report-only summary of the problem a branch answers, what it changes, and how
those changes affect the system, users, workflows, contracts, compatibility, or
operations — including features the branch never edited. It is meant
to give a human reviewer useful project context without exposing file
inventories or the agent's internal analysis.

## Quick start

| Command | Scope |
| --- | --- |
| `/change-analysis` | Checked-out branch against its detected baseline, including staged, unstaged, and non-ignored untracked changes |
| `/change-analysis <revision range>` | Exact committed changes in that range |
| `/change-analysis uncommitted` | Staged, unstaged, and non-ignored untracked changes |
| `/change-analysis staged` | Staged changes only |
| `/change-analysis base release/8.2` | Checked-out branch compared with another base branch |
| `/change-analysis services/api/` | Changes limited to one file or directory |

The default baseline is the merge base against `main` or `master`, falling back
to the default remote branch.

## What it produces

The report contains:

- **Acceptance criteria** — included first only when substantive Jira content is
  supplied. It checks requirements from the full description and supplied
  comments against the branch.
- **Background** — how the system behaved before and what that lacked, in one
  or two sentences.
- **Summary** — the overall behavior change and its main impact, in at most
  three sentences.
- **Touchpoints** — where a user, operator, or integration meets the change (UI
  path, API endpoint, CLI command, job, discovery task), or `Internal only`.
- **Flows** — one Mermaid flowchart per distinct flow the change implements,
  where a trigger leads through steps to an outcome. Each is named ("Flow A —
  MR note posting") with a one-sentence trigger → outcome line, and the rest of
  the report refers to flows by name. Omitted when the change implements no
  flow.
- **New concepts** — new entities, states, or terms, with an entity or state
  diagram when they relate. Omitted when the change adds none.
- **Example** — one input with its output before and after, using fictitious
  values. Omitted when no observable input or output changes.
- **Main changes** — at most five project-level topics explaining what changed
  and the concrete effect of each change.
- **Downstream effects** — unchanged features that now behave differently
  because they consume something the branch changed, or a one-line "none found".
- **Judgment calls** — behavior the developer chose (edge cases, errors,
  skipped data, defaults) stated as facts for the reviewer to agree with, not as
  defects. Omitted when there are none.
- **Open questions** — included only when product or operational intent cannot
  be established from the repository.
- **Limitations** — included only when incomplete analysis weakens a conclusion.

The report is deliberately short — roughly 700 words of prose plus diagrams and the example. A
reviewer reads it once before opening the diff, so it favours consequences over
mechanism and does not enumerate configuration keys, defaults or file paths.

The skill analyzes the selected files and supporting evidence internally, but
does not print file inventories, coverage bookkeeping, semantic units, or a
suggested reading route.

## When to use it

Use change analysis before opening a merge request or when a large or unfamiliar
branch is difficult to understand as one project change.

When Jira content is available, the skill derives active requirements from
structured criteria or unstructured ticket prose. It still reads all supplied
comments to detect agreed changes to those requirements. Missing or unavailable
ticket placeholders leave the normal report unchanged.

It does not look for defects, security vulnerabilities, maintainability
problems, or missing tests.

## More detail

- [Agent instructions](SKILL.md)
- [Scope arguments](references/arguments.md)
- [Jira acceptance verification](references/jira-acceptance.md)
- [Large-scope analysis](references/large-scope.md)
