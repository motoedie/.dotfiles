---
name: test-gaps
description: Report-only review of changed code for meaningful behavior-focused test gaps. Use for branch, staged, uncommitted, path-scoped, or GitLab merge-request CI review. Does not write tests, find general code defects, or review security-specific test gaps.
---

# Test Gaps

## Overview

Review selected code changes, including additions, fixes, and refactors, for
missing behavior-focused tests. Report confirmed gaps without editing code,
tests, configuration, or the Git index.

## Arguments

Take the arguments from the message that invoked this skill. If there are any,
read [the argument reference](references/arguments.md) for scope syntax.
Otherwise review the current branch against the detected baseline, including
staged, unstaged, and non-ignored untracked changes.

## Workflow

### 1. Determine review scope

Resolve the selected diff before review. Record its comparison baseline,
reviewed content source, and any path filter, and use the same scope for review
and verification.

Exclude generated files, lockfiles, build output, and test snapshot artifacts
using repository conventions, generated-file headers, and `.gitattributes`
markers when present. If a generator, template, or schema changed, review that
source rather than generated output. Keep changed tests in scope so the reviewer
can inspect their assertions and mocks.

Use unchanged callers, consumers, contracts, and tests only as evidence for the
affected behavior, existing coverage, and possible impact. Do not report
pre-existing test gaps unrelated to the selected change.

### 2. Review test gaps

Pick each subagent's model and effort by role from
[the model table](references/models.md). Read
[the test-gap pass](passes/test-gaps.md) and
[the output format](references/output-format.md).

Spawn one review subagent for the entire selected change. Give it the resolved
scope and the two review resources above. Do not divide the change into groups
or use a separate large-review workflow.

If the reviewer cannot inspect the complete scope, do not stop the workflow.
Preserve completed gaps, verify them in step 3, and set `complete` to
`false`.

Do not relay raw reviewer output verbatim. Cross-check each proposed gap with
the resolved scope before verification.

### 3. Verify proposed gaps

Skip verification when the reviewer proposes no gaps. Otherwise spawn one
independent verification subagent with:

- [the verification contract](references/verify-gaps.md);
- [the output format](references/output-format.md);
- all proposed test gaps; and
- the resolved scope and cited evidence.

The verifier decides what source and tests to inspect. Use the dedicated
verifier model and effort from the model table. Keep each `confirmed` gap with
the verifier's corrections and drop each `merged` or `rejected` one. Keep any
gap whose verdict is missing for any reason as proposed, and set `complete` to
`false`.

### 4. Produce the report

With `output=json`, render one JSON object using
[the JSON output format](references/json-output-format.md). Otherwise render
one Markdown report using [the output format](references/output-format.md).

## Behavioral rules

- Report only gaps tied to the selected code change; additions, fixes, and
  refactors are all eligible.
- Do not write tests, edit files, approve the change, or decide CI failure policy.
- Do not report general defects, security-specific test gaps, or
  coverage-percentage targets.
- Be explicit about uncertainty and any scope that was not reviewed.
