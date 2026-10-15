# Comparative benchmarks and ablation

Read this reference only for `benchmark` effort. Use isolated temporary
workspaces for generated artifacts.

## Comparison

Use the same request, environment, inputs, permissions, and evaluator for:

```text
capable agent without the skill
current skill, when one exists
candidate skill
```

Do not reveal the intended answer, suspected defect, or candidate changes to the
executing agent. Score observable expectations established in advance. Compare:

- task success and failure severity;
- trigger precision;
- unauthorized or unsafe side effects;
- discovery, activation, and actually loaded conditional context;
- total input and output tokens across all agent calls, including subagents and
  retries, plus tool overhead; use measured usage when available and label
  estimates otherwise; and
- result variance across repeated runs when reliability matters.

Do not trade a meaningful correctness or safety regression for fewer tokens.
Report raw pass counts and context estimates rather than manufacturing a precise
composite score.

## Section ablation

After a candidate passes its suite, test whether costly instruction units earn
their place:

1. Copy the candidate to an isolated temporary location.
2. Remove one coherent section, rule, example, or reference route.
3. Run the same relevant cases.
4. Keep the removal only when outcomes and safety remain equivalent within the
   evidence available.
5. Restore the candidate before testing the next unit so interactions stay
   interpretable.

Prioritize high-cost, low-frequency material. A passing ablation describes only
the cases exercised. For an existing skill, report the result as evidence for a
proposal; it never authorizes editing or feature removal. Preserve untested modes
and say when coverage is narrow.
