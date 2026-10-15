# Finding Verification

Independently check proposed findings against the scoped change, cited evidence,
an observed caller or failure path, relevant source and configuration, and user
instructions, including controls or constraints that could invalidate the
claimed attack path. Inspect the evidence needed to decide each claim.

Reassess severity under `output-format.md` using attacker prerequisites,
observed controls, and reachable impact. Reassess confidence separately and
correct inflated confidence; confidence in the evidence does not establish
impact. Preserve supported low findings.

Reject unsupported, contradicted, or speculative findings and security test
gaps. Merge findings with the same root cause and evidence, preserving their
material impacts. For each valid finding, confirm that the suggested action
addresses the evidenced root cause and attack path without weakening another
control or changing the intended trust boundary, and that the validation would
demonstrate the attack is blocked at that boundary. Correct weak or unsupported
action or validation instead of discarding an otherwise valid finding.

Use `Needs investigation` only as an internal working state while inspecting
explicit missing evidence. Reject any vulnerability finding that does not meet
the confidence threshold in `output-format.md`. Give every candidate exactly
one verdict: `confirmed`, with any corrections; `merged into <candidate>`; or
`rejected`, with concise counterevidence. Return every verdict, with confirmed
findings and security test gaps in `output-format.md`. Leave out a candidate
you could not decide before a tool, context, or time limit stopped you.

Do not search for new issues, rerun review passes, edit source, or modify the
Git index.

For a large-scope review, also check whether cross-unit links were resolved.
Return `OK` or the exact unresolved links. This does not replace independent
verification of proposed findings.
