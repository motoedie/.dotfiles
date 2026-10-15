# Output Format

Use this structure for every test gap:

- **Impact**: critical, high, or medium (a reviewer may also propose `low`)
- **Behavior**: the affected behavior or contract that lacks protection
- **Evidence**: the selected code change and closest relevant tests
  demonstrating that coverage is absent
- **Level**: unit, integration, API, or E2E
- **Suggested test**: a concrete test case that covers the behavior

Impact measures the plausible consequence if an unintended behavioral mistake
in the untested changed code escapes detection; it does not claim that the
change contains a defect:

- `critical`: broad data loss or service failure;
- `high`: an important workflow or contract could break, or a severe resource
  failure could occur;
- `medium`: meaningful but limited incorrect behavior or operational cost; and
- `low`: negligible practical impact.

Only the verifier drops low-impact gaps, by default. Drop a gap whose risk
exists only if part of the reviewed change ships without the rest. Report every
qualifying gap without imposing an arbitrary finding limit.

Order gaps by impact. Each gap must stand alone without referring to another
finding or issue number.

The report layout below applies only to the final report. Subagents return
gaps in the format above plus whatever their task requests.

Return one Markdown report with:

- **Scope reviewed** — selected change and files examined
- **Test Gaps** — kept gaps, or `None found`
- **Limitations** — uncertainty, any part of the scope not reviewed, or any
  model fallback
