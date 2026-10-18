# Report Format

Use this structure for every test gap:

- **Impact**: critical, high, or medium
- **Behavior**: the affected behavior or contract that lacks protection
- **Mutant**: the realistic wrong edit to the changed code that current tests
  are expected to survive
- **Evidence**: the selected code change and the closest relevant tests,
  including stories, integration tests, and shared-helper tests, with why each
  is expected to stay green under the mutant, based on its inputs and
  assertions; cite any partial test here
- **Level**: unit, integration, API, E2E, Storybook `play`, or the existing
  co-located test file it extends
- **Suggested test**: input, action, and the observable assertion expected to
  go red on the mutant

## Weak tests

Use this structure for every weak test:

- **Impact**: the impact of the behavior the test implies it protects
- **Test**: file, line, and test name
- **Problem**: the behavior it implies it protects, what it asserts instead,
  and why it is expected to stay green when that behavior breaks
- **Action**: rewrite it to assert the named behavior, or delete it when it
  protects nothing meaningful

## Final report

Order gaps by impact. Each gap and weak test must stand alone without referring
to another finding or issue number.

The report formats below apply only to the final report. Subagents return
gaps and weak tests in the formats above plus whatever their task requests.

### Markdown (default)

Return one Markdown report with:

- **Scope reviewed** — selected change, files examined, and impact threshold
- **Test Gaps** — kept gaps, or `None found`
- **Weak Tests** — kept weak tests; omit the section when there are none
- **Limitations** — uncertainty, any part of the scope not reviewed, or any
  model fallback

### JSON (`output=json`)

Read this section only when the arguments contain `output=json`.

Return exactly one JSON object as the final response. Do not use a Markdown
fence or add text before or after the object.

```json
{
  "version": 1,
  "skill": "test-gaps",
  "complete": true,
  "findings": [
    {
      "title": "Changed behavior has no regression test",
      "body": "- **Impact:** high\n- **Behavior:** affected behavior or contract\n- **Mutant:** realistic wrong edit current tests are expected to survive\n- **Evidence:** changed code and closest tests\n- **Level:** unit\n- **Suggested test:** input, action, and observable assertion"
    },
    {
      "title": "Weak test: save test asserts a mocked request helper",
      "body": "- **Impact:** high\n- **Test:** file, line, and test name\n- **Problem:** implied behavior, what it asserts instead, and why it is expected to stay green\n- **Action:** rewrite or delete"
    }
  ]
}
```

Each `findings` entry contains a short, single-line plain-text `title` and a
complete Markdown item in `body`. Include every field required above in `body`.
List test gaps first, ordered by impact, then weak tests with titles starting
`Weak test:`. Use an empty array when a complete review finds no gaps and no
weak tests.

Set `complete` to `false` when any selected scope could not be inspected.
Preserve confirmed gaps. Never use an empty findings array to claim no gaps
when `complete` is false. The object has no field for a model fallback; omit
it.
