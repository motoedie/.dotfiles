# Finding verification

Independently verify every supplied finding against the scoped change, cited
evidence, relevant source, and any provided instructions. Start at the cited
location and inspect whatever selected-scope diff, caller, guard, exception, or
precedent decides it; cited evidence is a lead, not a limit.

- Check that **What's wrong** and the named maintenance task and burden are
  supported. Reject a finding only when counterevidence disproves that
  maintenance problem. If **What's wrong** holds but the burden is disproved,
  correct the impact to `nit`. If the problem holds but its affected scope,
  impact, explanation, or concrete fix is wrong, correct that field and keep
  the finding.
- Reassess impact from the demonstrated consequence per `report-format.md` for
  the active mode, then apply the verification policy in `review-rules.md` to
  decide whether the finding remains reportable.
- The fix must directly remove the stated burden while preserving required
  behavior and relevant invariants. Reject a fix that replaces the problem with
  comparable complexity, flags, modes, or coupling; if the finding holds but
  its fix does not, replace the fix and keep the finding. Reject optional
  cleanups that lack the maintenance impact the active mode requires.

Give every finding exactly one verdict: `confirmed`, with any corrected fields;
`merged into <finding>`, when a confirmed finding covers the same issue; or
`rejected`, with the counterevidence or the verification-policy rule that drops
it. Return every verdict, with confirmed findings in `report-format.md` format.
Leave out a finding you could not decide before a tool, context, or time limit
stopped you. Do not look for new findings, rerun the review passes, edit
source, or modify the git index.
