# JSON output format

Read this file only when the arguments contain `output=json`.

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
      "body": "- **Impact:** high\n- **Behavior:** affected behavior or contract\n- **Evidence:** changed code and closest tests\n- **Level:** unit\n- **Suggested test:** concrete test case"
    }
  ]
}
```

Each `findings` entry contains a short, single-line plain-text `title` and a
complete Markdown test-gap item in `body`. Include every field required by
`output-format.md` in `body`. Keep findings ordered by impact. Use an empty
array when a complete review finds no gaps.

Set `complete` to `false` when any selected scope could not be inspected.
Preserve confirmed gaps. Never use an empty findings array to claim no gaps
when `complete` is false. The object has no field for a model fallback; omit
it.
