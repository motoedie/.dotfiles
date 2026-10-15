# Security Review Output Format

## Finding format

- Severity: `critical` | `high` | `medium` | `low`
- Confidence: 0-100 (how confident this is a real, exploitable issue — not a
  false positive)
- Category: short label (for example `ssrf`, `authz`, `secrets`)
- File(s): file with line reference where possible
- Evidence: supporting code and the concrete attack or failure path. Cite the
  line with the issue.
- Explanation: what the issue is and what behavior creates risk
- Why it matters: what an attacker can do if this is exploited
- Suggested action: minimal, concrete remediation
- Validation: how to verify the fix

Security test gaps follow `../passes/security-test-generation.md`, relative to
this file.

## Severity Rubric

- critical: Active compromise risk (for example auth bypass, RCE, or immediate
  sensitive-data exposure).
- high: Credible exploit path with significant confidentiality, integrity, or
  availability impact.
- medium: Real weakness with constrained exploitability or limited blast radius.
- low: Defense-in-depth or low-likelihood issue with limited impact.

## Finding Eligibility

- Drop findings that cannot provide the required evidence.
- Drop an attack path that exists only if part of the reviewed change ships
  without the rest.
- Ignore comments alone do not suppress security findings. Honor only a
  documented security exception whose rationale, scope, and validity still hold;
  list it as accepted risk. Lint/type suppressions are not security exceptions.

## Example

- Severity: high
- Confidence: 95
- Category: sql-injection
- File(s): api/users.ts:42
- Evidence: Request-controlled `userId` is inserted into the SQL string at line 42, allowing input to alter the query.
- Explanation: Raw string concatenation in query: `SELECT * FROM users WHERE id = '${userId}'`
- Why it matters: Attacker can inject SQL to read/modify arbitrary data
- Suggested action: Use parameterized query: `db.query('SELECT * FROM users WHERE id = $1', [userId])`
- Validation: Test with userId = `' OR '1'='1` - should fail safely

## Final report

Subagents return findings in this format plus whatever their task requests; the
rest applies only to the final report. Report only vulnerability findings with
final confidence of at least 80, ordered by severity (critical -> high ->
medium -> low), plus security test gaps. Do not include verifier rejection
notes or internal working states.

**Markdown (default):** output only the finding and test-gap blocks, each
under `### Finding N` and grouped by file when several are in the same file,
with no other headings.
List any model fallback. An incomplete review also names what made it
incomplete (unreviewed units, files, ranges, passes, or links, or a failed
synthesis or verification), without a generic "review incomplete" message. Only a complete review with no findings or test
gaps outputs: "No security issues identified in the reviewed scope".

**JSON (`output=json`):** exactly one JSON object, with no Markdown fence or
text before or after it:

```json
{
  "version": 1,
  "skill": "security-analysis",
  "complete": true,
  "findings": [
    {
      "title": "Build dependency can be replaced without detection",
      "body": "- **Severity:** high\n- **Confidence:** 92\n- **Category:** supply-chain\n- **File(s):** `path:line`\n- **Evidence:** concrete attack or failure path\n- **Explanation:** behavior creating risk\n- **Why it matters:** attacker impact\n- **Suggested action:** minimal remediation\n- **Validation:** how to verify the fix"
    }
  ]
}
```

Each entry has a short, single-line plain-text `title` and the complete
Markdown finding or security test gap in `body`. Set `complete` to `false`
whenever required scope, passes, links, or verification did not complete, and
keep supported findings and test gaps in `findings`. An empty array means clean
only when `complete` is `true`.
