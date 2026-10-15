# Normal evaluation

Read this reference for `normal` or `benchmark` effort. Preserve the
authorization boundaries of the real task.

Build a compact suite from the behavioral contract:

- **Should trigger:** direct, realistic requests the skill owns.
- **Might trigger:** boundary requests where activation depends on scope.
- **Must not trigger:** plausible neighboring requests owned by another skill or
  ordinary agent behavior.

Judge selection from the `name` and `description`, not from knowledge available
only after activation. Inspect installed skill descriptions when collision risk
is material.

For a new skill, walk through at least one representative execution request. For
an existing skill, derive cases for every feature, mode, threshold, or conditional
path affected by a proposal. Define expected observable decisions and artifacts
before each walkthrough. Verify outcomes rather than exact wording, heading names,
or other incidental text. Missing coverage leaves behavior unverified and
therefore preserved; it does not make the behavior removable.

## Regression handling

For a demonstrated failure, first identify whether the smallest fix belongs in
routing, instructions, a reference, a script, an example, or no skill change.
Add a regression case with:

- a realistic user request;
- only the input artifacts the request would naturally provide;
- observable expectations, including important non-actions; and
- whether an expectation applies only with the skill.

Keep cases that protect stable, valuable behavior. Remove obsolete cases when the
underlying contract changes intentionally.
