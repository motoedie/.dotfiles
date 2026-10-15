# Findings and report format

## Finding format

Use one item per distinct issue:

- **Impact**: `critical`, `high`, or `medium` (a reviewer may also propose
  `low`), followed by the concrete security, correctness, or realistic-scale
  performance consequence
- **Category**: `sql-injection`, `query-performance`, `index`, or `migration`
- **File(s)**: changed path and line or tight line range; include supporting
  schema/migration locations when useful
- **Query**: stable query ID and the relevant SQL fragment or operation
- **Problem**: one-sentence diagnosis
- **Evidence**: changed code plus the concrete input path, schema/index fact,
  and plan evidence that prove the issue; distinguish unavailable evidence
- **Recommended change**: minimal, specific remediation; index proposals must
  state the operation improved and why existing indexes are insufficient

Impact levels mean:

- `critical`: credible injection or query behavior can cause broad unauthorized
  data access/modification or similarly immediate, severe impact;
- `high`: a concrete exploit path or query/schema problem has major impact in
  ordinary use or at realistic scale;
- `medium`: a demonstrated weakness or material performance risk has constrained
  impact but warrants correction;
- `low`: generic tuning or SQL style with no demonstrated effect on security,
  results, or realistic-scale performance.

Drop speculative production claims, findings without the required evidence,
and problems that exist only if part of the reviewed change ships without the
rest. Only the verifier drops low-impact findings. Do not cap qualifying
findings.
A plan that looks fine on small tables is not proof of low impact; judge
performance impact at realistic scale.

## Final report

Subagents return findings in the finding format above plus whatever their task
requests; the rest applies only to the final report. Order findings critical,
high, then medium. An unavailable `EXPLAIN` alone does not make a review
incomplete.

**Markdown (default):** each kept finding under `### Finding N`, or `Nothing
notable` when there are none. Add nothing else except any model fallback and,
for an incomplete review, what made it incomplete (unreviewed units, queries,
migrations, or checks, a failed review, synthesis, or verification, or
undecided findings); an incomplete review never outputs only `Nothing notable`.

**JSON (`output=json`):** exactly one JSON object, with no Markdown fence or
text before or after it:

```json
{
  "version": 1,
  "skill": "sql-health",
  "complete": true,
  "findings": [
    {
      "title": "Query cannot use the existing composite index",
      "body": "- **Impact:** high — concrete consequence\n- **Category:** query-performance\n- **File(s):** `path:line`\n- **Query:** stable query ID and SQL operation\n- **Problem:** one-sentence diagnosis\n- **Evidence:** code, input, schema/index, and plan evidence\n- **Recommended change:** minimal remediation"
    }
  ]
}
```

`title` is a short, single plain-text line; `body` is the complete Markdown
finding with every field above. Set `complete` to `false` when any required
query, migration, group, check, review, synthesis, or verification step did not
complete, and keep the retained findings. An empty array means clean only when
`complete` is `true`. The object has no field for a model fallback or
incompleteness reason; omit them.
