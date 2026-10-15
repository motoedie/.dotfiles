# Output Format

Each finding:

- **Impact**: final impact label and concrete consequence
- **Category**: short label, such as off-by-one, race-condition, dead-code, or
  api-contract
- **File(s)**: include a line reference where possible
- **Evidence**: supporting changed line, caller, contract, or failure path
- **Explanation**: what the issue is
- **Suggested action**: concrete fix or next step

Subagents return findings in this shape plus whatever their task requests. The
rest applies only to the final report.

## Markdown (default)

Output only the findings, ordered by impact, each under `### Finding N`. With
no findings, output only
`Nothing notable`. List any model fallback. An incomplete review also states
what made it incomplete (unreviewed files, passes, or evidence, a failed
synthesis or verification, or undecided findings) and never outputs only
`Nothing notable`.

## JSON (`output=json`)

Return exactly one JSON object, with no Markdown fence or text around it:

```json
{
  "version": 1,
  "skill": "code-behavior",
  "complete": true,
  "findings": [
    {
      "title": "Caller receives an incompatible API value",
      "body": "- **Impact:** high — concrete consequence\n- **Category:** api-contract\n- **File(s):** `path:line`\n- **Evidence:** supporting changed line or contract\n- **Explanation:** what is wrong\n- **Suggested action:** concrete fix"
    }
  ]
}
```

`title` is a short, single plain-text line; `body` is the complete Markdown
finding. Order findings by impact. Set `complete` to `false` for an incomplete
review and keep the retained findings. An empty array means clean only when
`complete` is `true`. The object has no field for a model fallback or
incompleteness reason; omit them.
